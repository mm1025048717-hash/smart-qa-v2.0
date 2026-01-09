// 物理计算相关函数

/**
 * 计算两点之间的距离
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 * @returns {number} 距离
 */
export function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * 检测两个气泡是否可以融合
 * @param {object} bubble1 
 * @param {object} bubble2 
 * @param {number} threshold - 融合阈值倍数，默认 1.2
 * @returns {boolean}
 */
export function canFuse(bubble1, bubble2, threshold = 1.2) {
  if (!bubble1 || !bubble2 || bubble1.id === bubble2.id) {
    return false;
  }
  
  const dist = distance(bubble1.x, bubble1.y, bubble2.x, bubble2.y);
  const minDist = (bubble1.radius + bubble2.radius) * threshold;
  
  return dist <= minDist;
}

/**
 * 计算融合后的新位置
 * @param {object} bubble1 
 * @param {object} bubble2 
 * @returns {object} {x, y}
 */
export function getFusionPosition(bubble1, bubble2) {
  return {
    x: (bubble1.x + bubble2.x) / 2,
    y: (bubble1.y + bubble2.y) / 2
  };
}

/**
 * 计算文本最适合的半径
 * @param {string} text 
 * @param {number} minRadius 
 * @param {number} maxRadius 
 * @returns {number}
 */
export function calculateRadius(text, minRadius = 40, maxRadius = 120) {
  const baseRadius = minRadius;
  const lengthFactor = Math.min(text.length / 10, 1);
  const radius = baseRadius + (maxRadius - baseRadius) * lengthFactor;
  return Math.round(radius);
}

/**
 * 限制位置在画布范围内
 * @param {number} x 
 * @param {number} y 
 * @param {number} radius 
 * @param {number} canvasWidth 
 * @param {number} canvasHeight 
 * @returns {object} {x, y}
 */
export function clampPosition(x, y, radius, canvasWidth, canvasHeight) {
  return {
    x: Math.max(radius, Math.min(canvasWidth - radius, x)),
    y: Math.max(radius, Math.min(canvasHeight - radius, y))
  };
}

/**
 * 生成爆炸粒子
 * @param {number} count - 粒子数量
 * @returns {array} 粒子数组
 */
export function generateExplosionParticles(count = 6) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI;
    const velocity = 50 + Math.random() * 100; // 50-150px
    particles.push({
      id: `particle-${Date.now()}-${i}`,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    });
  }
  return particles;
}

/**
 * 检测是否为移动设备
 * @returns {boolean}
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
}

/**
 * 获取触摸或鼠标事件的坐标
 * @param {Event} event 
 * @param {Element} container 
 * @returns {object} {x, y}
 */
export function getEventPosition(event, container) {
  const rect = container.getBoundingClientRect();
  
  if (event.touches && event.touches.length > 0) {
    // 触摸事件
    return {
      x: event.touches[0].clientX - rect.left,
      y: event.touches[0].clientY - rect.top
    };
  } else if (event.changedTouches && event.changedTouches.length > 0) {
    // 触摸结束事件
    return {
      x: event.changedTouches[0].clientX - rect.left,
      y: event.changedTouches[0].clientY - rect.top
    };
  } else {
    // 鼠标事件
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
}
