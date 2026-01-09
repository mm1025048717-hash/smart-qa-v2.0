// Minimal DeepSeek proxy with retry + in-memory cache
// Usage: DEEPSEEK_API_KEY in env; optional DEEPSEEK_BASE (default https://api.deepseek.com)

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 7070;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE = process.env.DEEPSEEK_BASE || 'https://api.deepseek.com';
const ALI_API_KEY = process.env.ALI_API_KEY || '';
const ALI_COMPAT_BASE = process.env.ALI_COMPAT_BASE || 'https://dashscope.aliyuncs.com/compatible-mode';

if (!DEEPSEEK_API_KEY) {
  console.warn('[warn] DEEPSEEK_API_KEY is not set. The proxy will reject upstream calls.');
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// simple LRU with TTL
const MAX_CACHE = 200;
const TTL_MS = 10 * 60 * 1000; // 10 min
const cache = new Map(); // key -> { value, expireAt }

function getCache(key) {
  const node = cache.get(key);
  if (!node) return null;
  if (Date.now() > node.expireAt) { cache.delete(key); return null; }
  // LRU touch
  cache.delete(key); cache.set(key, node);
  return node.value;
}

function setCache(key, value) {
  if (cache.size >= MAX_CACHE) {
    // delete oldest
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { value, expireAt: Date.now() + TTL_MS });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithRetry(url, init, retries = 2) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) throw new Error(`Upstream ${res.status}`);
      return res;
    } catch (err) {
      lastErr = err;
      if (i < retries) await sleep(500 * (i + 1));
    }
  }
  throw lastErr;
}

function buildMessages(a, b, prompt = '', options = {}) {
  const detail = options.detail === true;
  const system = (() => {
    const baseLite = '你是创意融合助手。请统一输出 JSON：{"title": "...", "notes": ["卖点：...","反共识：...","最小验证：...","话术：..."]}，不要额外文字。';
    const detailed = '你是营销方案专家，请输出严格 JSON（不要任何多余文本）。字段如下：{"title":"...","oneSentence":"...","bigIdea":"...","titlesTop5":["..."],"hooksTop5":["..."],"pipeline":["抖音","小红书","视频号","社群",...],"assets":["品牌主视觉","短视频脚本",...],"sellingPoints":["..."],"contrarianPoints":["..."],"talkTracks":["..."],"mvp":"...","milestones":[{"name":"...","desc":"..."}],"kpis":[{"name":"...","target":"..."}],"notes":["卖点：...","反共识：...","最小验证：...","话术：..."]}';
    return detail ? detailed : baseLite;
  })();
  return [
    { role: 'system', content: system },
    { role: 'user', content: `把「${a}」与「${b}」融合。${prompt || ''}` }
  ];
}

app.post('/api/fuse/suggest', async (req, res) => {
  try {
    const { a, b, context = {} } = req.body || {};
    if (!a || !b) return res.status(400).json({ error: 'Missing a/b' });

    const cacheKey = JSON.stringify({ a, b, context });
    const hit = getCache(cacheKey);
    if (hit) return res.json({ ...hit, provider: 'proxy-cache' });

    // provider 解析：优先 context.provider，其次 model 前缀 ali:xxx
    let provider = (context.provider || '').toLowerCase();
    let model = context.model || 'deepseek-chat';
    if (!provider && typeof model === 'string' && model.startsWith('ali:')) {
      provider = 'ali';
      model = model.slice(4);
    }
    if (!provider) provider = 'deepseek';

    const messages = buildMessages(a, b, context.prompt, context);
    const body = {
      model,
      messages,
      temperature: typeof context.temperature === 'number' ? context.temperature : 0.7,
      max_tokens: typeof context.maxTokens === 'number' ? context.maxTokens : (context.detail ? 1600 : 600),
      stream: false
    };

    let upstream;
    if (provider === 'ali') {
      if (!ALI_API_KEY) return res.status(500).json({ error: 'Server missing ALI_API_KEY' });
      upstream = await fetchWithRetry(`${ALI_COMPAT_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ALI_API_KEY}` },
        body: JSON.stringify(body)
      }, 2);
    } else {
      if (!DEEPSEEK_API_KEY) return res.status(500).json({ error: 'Server missing DEEPSEEK_API_KEY' });
      upstream = await fetchWithRetry(`${DEEPSEEK_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify(body)
      }, 2);
    }

    const data = await upstream.json();
    const raw = data.choices?.[0]?.message?.content || '';
    let title = `${a} × ${b}`;
    let notes = '';
    let structured = null;
    // try parse JSON from content
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        const json = JSON.parse(raw.slice(start, end + 1).replace(/,(\s*[}\]])/g, '$1').replace(/[“”]/g, '"'));
        structured = json;
        title = json.title || title;
        if (Array.isArray(json.notes)) notes = json.notes.join('\n');
      } catch {}
    }
    if (!notes) notes = raw || `${a} × ${b}`;

    const result = { title, notes, structured };
    setCache(cacheKey, result);
    // Attach language for client awareness (pass-through)
    res.json({ ...result, provider: provider === 'ali' ? 'ali-proxy' : 'deepseek-proxy', language: context.language || 'zh' });
  } catch (err) {
    console.error('proxy error', err);
    res.status(500).json({ error: 'Proxy failed' });
  }
});

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[server] DeepSeek proxy running on http://localhost:${PORT}`);
});


