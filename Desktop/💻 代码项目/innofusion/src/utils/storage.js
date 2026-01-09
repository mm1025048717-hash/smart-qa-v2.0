// 本地存储工具：用于保存/恢复会话与一次性标记

export const SESSION_KEY = 'bfl:session';

export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (_) {
    // ignore quota errors
  }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch (_) {}
}

export function setFlag(key) {
  try { localStorage.setItem(key, '1'); } catch (_) {}
}

export function popFlag(key) {
  try {
    const v = localStorage.getItem(key) === '1';
    if (v) localStorage.removeItem(key);
    return v;
  } catch (_) {
    return false;
  }
}

// ---- 标题元数据与历史 ----
const TITLE_META_KEY = 'bfl:title:meta';
const TITLE_HISTORY_KEY = 'bfl:title:history';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}

export function getTitleMeta(title) {
  const all = readJson(TITLE_META_KEY, {});
  return all[title] || { score: 0, favorite: false };
}

export function setTitleMeta(title, meta) {
  const all = readJson(TITLE_META_KEY, {});
  all[title] = { score: Math.max(0, Math.min(5, meta.score || 0)), favorite: !!meta.favorite };
  writeJson(TITLE_META_KEY, all);
  return all[title];
}

export function toggleFavoriteTitle(title) {
  const current = getTitleMeta(title);
  return setTitleMeta(title, { ...current, favorite: !current.favorite });
}

export function rateTitle(title, score) {
  const current = getTitleMeta(title);
  return setTitleMeta(title, { ...current, score: Number(score) || 0 });
}

export function pushTitleHistory(entry) {
  const list = readJson(TITLE_HISTORY_KEY, []);
  const normalized = {
    title: entry?.title || '',
    structured: entry?.structured || null,
    timestamp: entry?.timestamp || new Date().toISOString(),
    source: entry?.source || null
  };
  list.unshift(normalized);
  const trimmed = list.slice(0, 200);
  writeJson(TITLE_HISTORY_KEY, trimmed);
  return trimmed;
}

export function getTitleHistory(limit = 50) {
  const list = readJson(TITLE_HISTORY_KEY, []);
  return list.slice(0, limit);
}

export function listFavoriteTitles() {
  const all = readJson(TITLE_META_KEY, {});
  return Object.keys(all)
    .filter(t => all[t]?.favorite)
    .map(t => ({ title: t, score: all[t].score || 0, favorite: true }))
    .sort((a,b)=> (b.score - a.score) || a.title.localeCompare(b.title));
}


