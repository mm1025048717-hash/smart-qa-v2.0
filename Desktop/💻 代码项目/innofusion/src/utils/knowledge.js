// 轻量本地/用户知识库检索：从 public/knowledge/knowledge.json 与本地存储读取并进行关键词过滤 + 简易评分
const USER_KB_KEY = 'bfl:kb';

export async function loadLocalKnowledge() {
  try {
    const res = await fetch('/knowledge/knowledge.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('load knowledge failed');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
}

export function searchKnowledge(items, { query, filters = {}, topK = 6 }) {
  if (!Array.isArray(items) || !items.length) return [];
  const q = String(query || '').toLowerCase();
  const { industry, channel, region } = filters;
  const scored = items
    .filter(x => (!industry || x.industry === industry || x.industry === '全行业'))
    .filter(x => (!channel || x.channel === channel || x.channel === '整合营销'))
    .filter(x => (!region || x.region === region))
    .map(x => {
      const text = `${x.title} ${x.text}`.toLowerCase();
      const score = (q ? (text.includes(q) ? 2 : 0) : 0) +
        (industry && x.industry === industry ? 1 : 0) +
        (channel && x.channel === channel ? 1 : 0);
      return { ...x, _score: score };
    })
    .sort((a, b) => b._score - a._score);
  return scored.slice(0, topK);
}

export function getUserKnowledge() {
  try {
    const raw = localStorage.getItem(USER_KB_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (_) {
    return [];
  }
}

export function setUserKnowledge(list) {
  try { localStorage.setItem(USER_KB_KEY, JSON.stringify(list || [])); } catch {}
}

export function addUserKnowledgeItem(item) {
  const now = new Date().toISOString();
  const list = getUserKnowledge();
  const id = item?.id || `kb-${Date.now()}`;
  const merged = { id, date: item?.date || now.slice(0,10), ...item };
  list.unshift(merged);
  setUserKnowledge(list.slice(0, 500));
  return merged;
}

export function addUserKnowledgeItems(arr) {
  if (!Array.isArray(arr)) return 0;
  let count = 0;
  arr.forEach(x => { addUserKnowledgeItem(x); count++; });
  return count;
}

export function removeUserKnowledge(id) {
  const list = getUserKnowledge().filter(x => x.id !== id);
  setUserKnowledge(list);
}

export function importUserKnowledgeFromJSON(jsonText) {
  try {
    const arr = JSON.parse(jsonText);
    if (!Array.isArray(arr)) return 0;
    arr.forEach(x => addUserKnowledgeItem(x));
    return arr.length;
  } catch { return 0; }
}

export function importUserKnowledgeFromCSV(csvText) {
  const lines = String(csvText || '').split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return 0;
  const header = lines[0].split(',').map(s=>s.trim());
  let count = 0;
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',');
    const obj = {};
    header.forEach((h, idx) => { obj[h] = (cells[idx]||'').trim(); });
    if (obj.title && obj.text) {
      const kpi = (obj.kpi_metric && obj.kpi_value) ? [{ metric: obj.kpi_metric, value: obj.kpi_value }] : [];
      addUserKnowledgeItem({
        title: obj.title,
        text: obj.text,
        industry: obj.industry,
        channel: obj.channel,
        region: obj.region,
        date: obj.date,
        publisher: obj.publisher,
        source_url: obj.source_url,
        kpi
      });
      count++;
    }
  }
  return count;
}

export async function loadAllKnowledge() {
  const [pub, user] = await Promise.all([loadLocalKnowledge(), Promise.resolve(getUserKnowledge())]);
  return [...user, ...pub];
}


