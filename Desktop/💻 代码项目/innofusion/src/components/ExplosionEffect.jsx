import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateExplosionParticles } from '../utils/physics';

/**
 * 爆炸效果组件
 */
export function ExplosionEffect({ x, y, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // 生成粒子
    const newParticles = generateExplosionParticles(6);
    setParticles(newParticles);

    // 动画完成后清理
    const timer = setTimeout(() => {
      onComplete();
    }, 600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="explosion-particle"
          style={{
            left: x,
            top: y,
            backgroundColor: particle.color,
            boxShadow: `0 0 6px ${particle.color}`
          }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: particle.vx,
            y: particle.vy,
            scale: 0,
            opacity: 0
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* 中心闪光 */}
      <motion.div
        className="absolute w-16 h-16 rounded-full pointer-events-none"
        style={{
          left: x - 32,
          top: y - 32,
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
          filter: 'blur(2px)'
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </AnimatePresence>
  );
}
