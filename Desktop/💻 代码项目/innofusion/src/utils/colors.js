// 颜色工具函数

/**
 * 生成随机 HSL 颜色
 * @returns {string} HSL 颜色字符串
 */
export function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 30); // 60-90%
  const lightness = 50 + Math.floor(Math.random() * 20); // 50-70%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * HSL 转 RGB
 * @param {number} h - 色相 (0-360)
 * @param {number} s - 饱和度 (0-100)
 * @param {number} l - 亮度 (0-100)
 * @returns {object} RGB 对象 {r, g, b}
 */
export function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4))
  };
}

/**
 * 获取文本对比色
 * @param {string} bgColor - 背景色
 * @returns {string} 黑色或白色
 */
export function getContrastColor(bgColor) {
  // 简单实现：根据亮度判断
  const match = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (match) {
    const lightness = parseInt(match[3]);
    return lightness > 60 ? '#000000' : '#ffffff';
  }
  return '#ffffff';
}

/**
 * 混合两个颜色
 * @param {string} color1 - HSL 颜色1
 * @param {string} color2 - HSL 颜色2
 * @returns {string} 混合后的 HSL 颜色
 */
export function mixColors(color1, color2) {
  const parseHSL = (color) => {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    return match ? {
      h: parseInt(match[1]),
      s: parseInt(match[2]),
      l: parseInt(match[3])
    } : { h: 0, s: 0, l: 50 };
  };

  const c1 = parseHSL(color1);
  const c2 = parseHSL(color2);

  // 色相环形平均
  let h1 = c1.h, h2 = c2.h;
  const diff = Math.abs(h2 - h1);
  let h;
  if (diff > 180) {
    if (h1 > h2) {
      h2 += 360;
    } else {
      h1 += 360;
    }
  }
  h = ((h1 + h2) / 2) % 360;

  const s = (c1.s + c2.s) / 2;
  const l = (c1.l + c2.l) / 2;

  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

// 根据文件/结果类型返回建议颜色
export function getColorByKind(kind) {
  switch ((kind || '').toLowerCase()) {
    case 'pdf':
      return 'hsl(350, 75%, 60%)'; // 红
    case 'image':
      return 'hsl(200, 70%, 55%)'; // 蓝青
    case 'video':
      return 'hsl(30, 85%, 60%)'; // 橙
    case 'doc':
      return 'hsl(250, 65%, 60%)'; // 紫
    case 'audio':
      return 'hsl(160, 65%, 50%)'; // 绿
    default:
      return generateRandomColor();
  }
}
