import axios from 'axios';

// Helper function to create prompts for DeepSeek
const createDeepSeekPrompt = (a, b, context) => {
  const { language = 'zh', detail = true, agent = 'fusion' } = context;

  const systemPrompts = {
    zh: {
      baseLite: '你是创意融合助手。请统一输出 JSON：{"title": "...", "notes": ["卖点：...","反共识：...","最小验证：...","话术：..."]}，不要额外文字。',
      basePitch: '你是Pitch-Agent，请把输入主题融合为可对外展示的一页式产物。统一输出 JSON：{"title": "...", "notes": ["卖点：...","反共识：...","最小验证：...","话术：..."]}，不要额外文字。',
      detailed: '你是营销方案专家，请输出严格 JSON（不要任何多余文本）。字段如下：{"title":"...","oneSentence":"...","bigIdea":"...","titlesTop5":["..."],"hooksTop5":["..."],"pipeline":["抖音","小红书",...],"assets":["品牌主视觉",...],"sellingPoints":["..."],"contrarianPoints":["..."],"talkTracks":["..."],"mvp":"...","milestones":[{"name":"...","desc":"..."}],"kpis":[{"name":"...","target":"..."}],"notes":["卖点：...","反共识：...","最小验证：...","话术：..."]}'
    },
    en: {
      baseLite: 'You are a creative fusion assistant. Always output strict JSON only: {"title":"...","notes":["Selling point: ...","Contrarian: ...","MVP: ...","Talk track: ..."]}.',
      basePitch: 'You are a Pitch-Agent. Turn the inputs into a one-pager. Output strict JSON only: {"title":"...","notes":["Selling point: ...","Contrarian: ...","MVP: ...","Talk track: ..."]}.',
      detailed: 'You are a marketing strategist. Output STRICT JSON only with fields: {"title":"...","oneSentence":"...","bigIdea":"...","titlesTop5":["..."],"hooksTop5":["..."],"pipeline":["TikTok",...],"assets":["Brand KV",...],"sellingPoints":["..."],"contrarianPoints":["..."],"talkTracks":["..."],"mvp":"...","milestones":[{"name":"...","desc":"..."}],"kpis":[{"name":"...","target":"..."}],"notes":["Selling point: ...","Contrarian: ...","MVP: ...","Talk track: ..."]}'
    }
  };

  const langPrompts = language === 'en' ? systemPrompts.en : systemPrompts.zh;
  let systemContent = langPrompts.baseLite;
  if (detail) systemContent = langPrompts.detailed;
  if (agent === 'pitch') systemContent = langPrompts.basePitch;

  const userContent = language === 'en'
    ? `Fuse "${a}" with "${b}". ${context.prompt || ''}`
    : `把「${a}」与「${b}」融合。${context.prompt || ''}`;

  return { systemContent, userContent };
};

// @desc    Get AI suggestions
// @route   POST /api/ai/suggest
// @access  Private
export const getSuggestions = async (req, res) => {
  const { a, b, context } = req.body;
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

  // Validation
  if (!a || !b) {
    return res.status(400).json({ message: 'Missing required fields: a, b' });
  }
  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ message: 'DeepSeek API key is not configured on the server.' });
  }

  const { systemContent, userContent } = createDeepSeekPrompt(a, b, context);

  try {
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userContent }
        ],
        temperature: 0.7,
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
      }
    );

    const rawContent = response.data.choices?.[0]?.message?.content || '';
    
    // Basic JSON parsing
    let parsedContent = {};
    try {
      // Find the first { and the last } to extract the JSON object
      const firstBrace = rawContent.indexOf('{');
      const lastBrace = rawContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        parsedContent = JSON.parse(rawContent.substring(firstBrace, lastBrace + 1));
      }
    } catch (e) {
      console.error("Failed to parse DeepSeek response as JSON:", e);
      // If parsing fails, return raw content in notes
      return res.status(200).json({
        title: `${a} × ${b}`,
        notes: rawContent,
        provider: 'deepseek-raw'
      });
    }

    // 统一 Schema 校验与兜底
    const fallback = {
      title: `${a} × ${b}`,
      oneSentence: '',
      bigIdea: '',
      titlesTop5: [],
      hooksTop5: [],
      pipeline: [],
      assets: [],
      sellingPoints: [],
      contrarianPoints: [],
      talkTracks: [],
      mvp: ''
    };
    const normalized = { ...fallback, ...(parsedContent || {}) };
    if (!Array.isArray(normalized.titlesTop5)) normalized.titlesTop5 = []; 
    if (!Array.isArray(normalized.hooksTop5)) normalized.hooksTop5 = []; 
    if (!Array.isArray(normalized.pipeline)) normalized.pipeline = []; 
    if (!Array.isArray(normalized.assets)) normalized.assets = []; 
    if (!Array.isArray(normalized.sellingPoints)) normalized.sellingPoints = []; 
    if (!Array.isArray(normalized.contrarianPoints)) normalized.contrarianPoints = []; 
    if (!Array.isArray(normalized.talkTracks)) normalized.talkTracks = []; 
    if (!Array.isArray(normalized.milestones)) normalized.milestones = []; 
    if (!Array.isArray(normalized.kpis)) normalized.kpis = []; 

    const result = {
      title: normalized.title || `${a} × ${b}`,
      notes: Array.isArray(normalized.notes) ? normalized.notes.join('\n') : rawContent,
      structured: normalized,
      provider: 'deepseek',
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Error calling DeepSeek API:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to get suggestions from DeepSeek API.' });
  }
};
