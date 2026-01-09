// 简易本地摘要与关键词提取（占位版）

export function generateLocalSummary(bubbleText, attachmentNames = [], attachmentTexts = []) {
  const title = bubbleText || '';
  const names = (attachmentNames || []).slice(0, 5).join('、');
  const text = (attachmentTexts || []).join(' ').slice(0, 2000);
  const keywords = Array.from(new Set((title + ' ' + names + ' ' + text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2)))
    .slice(0, 6);

  const bullets = [];
  if (title) bullets.push(`主题：${title}`);
  if (names) bullets.push(`附件：${names || '无'}`);
  if (keywords.length) bullets.push(`关键词：${keywords.join(' / ')}`);
  return bullets.join('\n');
}


