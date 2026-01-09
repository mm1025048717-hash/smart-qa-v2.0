// AI 建议生成相关函数
import api from '../services/api';

/**
 * 本地规则生成建议
 * @param {string} textA 
 * @param {string} textB 
 * @returns {object} {title, notes}
 */
export function generateLocalSuggestions(textA, textB, language = 'zh') {
  const title = `${textA} × ${textB}`;
  if (language === 'en') {
    const notes = [
      `Selling point: Use "${textA}" methods to solve long-standing issues in "${textB}".`,
      `Contrarian: Bring the user journey of "${textB}" into the distribution channels of "${textA}".`,
      `MVP: Build a one-day demo to verify real CTR/conversion at ${textA} ∩ ${textB}.`,
      `Talk track: Who pays? Who uses? Who objects? Prepare three rebuttals.`
    ].join('\n');
    return { title, notes };
  }
  const notes = [
    `核心卖点：用"${textA}"的方法解决"${textB}"里的老问题。`,
    `反共识尝试：把"${textB}"的用户旅程搬进"${textA}"的分发渠道。`,
    `最小验证：做一个一天可交付的Demo，验证${textA}∩${textB}的真实点击/转化率。`,
    `话术：谁是买单人？谁是使用者？谁会反对？提前准备三句反驳话术。`
  ].join('\n');
  return { title, notes };
}

/**
 * 调用后端 API 获取建议
 * @param {string} textA 
 * @param {string} textB 
 * @param {string} prompt 
 * @param {object} options 
 * @returns {Promise<object>}
 */
async function fetchSuggestions(textA, textB, prompt, options = {}) {
  try {
    const response = await api.post('/ai/suggest', {
      a: textA,
      b: textB,
      context: { source: 'mvp', prompt, ...options }
    });

    if (response.status !== 200 || !response.data) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = response.data;
    return { ...data, provider: data?.provider || 'api' };
  } catch (error) {
    console.warn('API 调用失败，使用本地规则:', error);
    return { ...generateLocalSuggestions(textA, textB, options.language || 'zh'), provider: 'local' };
  }
}

/**
 * 获取融合建议（优先使用 API）
 * @param {string} textA 
 * @param {string} textB 
 * @returns {Promise<object>} {title, notes}
 */
function stripCodeFences(content) {
  if (typeof content !== 'string') return '';
  const fence = content.match(/```[a-zA-Z]*[\s\S]*?```/);
  if (fence) {
    return fence[0].replace(/```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }
  return content.trim();
}

function safeParseJsonLike(text) {
  if (typeof text !== 'string') return null;
  // 裁剪到第一个"{"和最后一个"}"，去掉可能的前后解释性文字
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  let body = text.slice(start, end + 1);
  // 去除尾逗号：对象或数组收尾的多余逗号
  body = body.replace(/,(\s*[}\]])/g, '$1');
  // 替换全角引号为半角
  body = body.replace(/[“”]/g, '"');
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export async function getSuggestions(textA, textB, prompt, options = {}) {
  // 显式使用本地规则（用户选择了本地模型）
  if ((options.model || '').toLowerCase() === 'local') {
    return Promise.resolve({ ...generateLocalSuggestions(textA, textB, options.language || 'zh'), provider: 'local' });
  }
  
  // 统一调用后端 API
  return fetchSuggestions(textA, textB, prompt, options);
}

/**
 * 解析建议文本为结构化数据
 * @param {string} notes 
 * @returns {array} 建议数组
 */
export function parseSuggestions(notes) {
  const lines = notes.split('\n').filter(line => line.trim());
  return lines.map((line, index) => {
    const match = line.match(/^(.+?)：(.+)$/);
    if (match) {
      return {
        id: `suggestion-${index}`,
        type: match[1],
        content: match[2]
      };
    }
    return {
      id: `suggestion-${index}`,
      type: '',
      content: line
    };
  });
}

/**
 * 根据图片/视频页签自动生成占位文案
 * @param {object} structured 深度结构
 * @returns {object} {imageCaptions: string[], videoCaptions: string[]}
 */
export function buildMediaCaptions(structured = {}) {
  const title = structured.title || '';
  const oneSentence = structured.oneSentence || '';
  const selling = (structured.sellingPoints || []).slice(0, 2).join('、');
  const hooks = (structured.hooksTop5 || []).slice(0, 2);
  const images = [
    `KV主视觉：${title}｜${oneSentence}`,
    `卖点组合：${selling || title}`,
    `应用场景拼图：${(structured.assets || []).slice(0,3).join(' / ')}`
  ];
  const videos = [
    hooks[0] ? `15秒视频：${hooks[0]}` : `15秒视频：${title}`,
    hooks[1] ? `30秒视频：${hooks[1]}` : `30秒视频：从问题到解决`,
  ];
  return { imageCaptions: images, videoCaptions: videos };
}

/**
 * 生成导出数据
 * @param {array} bubbles 
 * @param {array} fusionEvents 
 * @returns {object} 导出数据
 */
export function generateExportData(bubbles, fusionEvents) {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    bubbles: bubbles.map(bubble => ({
      id: bubble.id,
      text: bubble.text,
      x: bubble.x,
      y: bubble.y,
      radius: bubble.radius,
      color: bubble.color,
      createdAt: bubble.createdAt,
      parentIds: bubble.parentIds || []
    })),
    fusionEvents: fusionEvents.map(event => ({
      id: event.id,
      bubbleAId: event.bubbleAId,
      bubbleBId: event.bubbleBId,
      resultBubbleId: event.resultBubbleId,
      timestamp: event.timestamp,
      title: event.title,
      notes: event.notes
    })),
    meta: {
      totalBubbles: bubbles.length,
      totalFusions: fusionEvents.length,
      exportedAt: new Date().toISOString()
    }
  };
}
