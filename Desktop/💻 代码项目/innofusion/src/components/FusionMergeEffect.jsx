import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export function FusionMergeEffect({ a, b, center, onComplete, duration = 700 }) {
  useEffect(() => {
    const t = setTimeout(() => onComplete && onComplete(), duration);
    return () => clearTimeout(t);
  }, [onComplete, duration]);

  // 连接线样式
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* 连接线 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: duration / 1000, ease: 'easeInOut' }}
        className="absolute"
        style={{
          left: a.x,
          top: a.y,
          width: len,
          height: 4,
          transformOrigin: '0 50%',
          transform: `rotate(${angle}deg)`,
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(59,130,246,0.8) 50%, rgba(255,255,255,0) 100%)',
          filter: 'blur(1px)',
          borderRadius: 2,
        }}
      />

      {/* A 圆 */}
      <motion.div
        className="absolute rounded-full shadow-lg"
        style={{ left: a.x - a.r, top: a.y - a.r, width: a.r * 2, height: a.r * 2, background: a.color }}
        initial={{ scale: 1, opacity: 0.9 }}
        animate={{ left: center.x - a.r / 2, top: center.y - a.r / 2, scale: 0.6, opacity: 0.6 }}
        transition={{ duration: duration / 1000, ease: 'easeInOut' }}
      />

      {/* B 圆 */}
      <motion.div
        className="absolute rounded-full shadow-lg"
        style={{ left: b.x - b.r, top: b.y - b.r, width: b.r * 2, height: b.r * 2, background: b.color }}
        initial={{ scale: 1, opacity: 0.9 }}
        animate={{ left: center.x - b.r / 2, top: center.y - b.r / 2, scale: 0.6, opacity: 0.6 }}
        transition={{ duration: duration / 1000, ease: 'easeInOut' }}
      />

      {/* 中心涟漪 */}
      <motion.div
        className="absolute rounded-full"
        style={{ left: center.x - 8, top: center.y - 8, width: 16, height: 16, border: '2px solid rgba(59,130,246,0.8)' }}
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={{ scale: 8, opacity: 0 }}
        transition={{ duration: duration / 1200, ease: 'easeOut' }}
      />
    </div>
  );
}


