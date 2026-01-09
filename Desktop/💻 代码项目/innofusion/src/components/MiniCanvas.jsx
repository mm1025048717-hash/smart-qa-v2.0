import React from 'react';
import { motion } from 'framer-motion';

export default function MiniCanvas() {
  const bubble1Variants = {
    hidden: { x: -120, y: -40, opacity: 0, scale: 0 },
    visible: { 
      x: 0, y: 0, opacity: [0, 1, 0], scale: [0, 1, 0],
      transition: { duration: 2, times: [0, 0.5, 1], ease: "easeInOut" }
    },
  };

  const bubble2Variants = {
    hidden: { x: 120, y: 40, opacity: 0, scale: 0 },
    visible: { 
      x: 0, y: 0, opacity: [0, 1, 0], scale: [0, 1, 0],
      transition: { duration: 2, delay: 0.2, times: [0, 0.5, 1], ease: "easeInOut" }
    },
  };

  const planVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut', delay: 1.5 }
    }
  };

  return (
    <div className="relative w-full aspect-[16/9] rounded-2xl border border-gray-800 bg-black overflow-hidden flex items-center justify-center p-8 shadow-2xl shadow-blue-500/10">
      <motion.div
        className="w-full h-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
      >
        <svg width="100%" height="100%" viewBox="-200 -112.5 400 225">
          <defs>
            <radialGradient id="grad1">
              <stop offset="0%" stopColor="#3C50FF" />
              <stop offset="100%" stopColor="#00FFFF" />
            </radialGradient>
            <linearGradient id="planGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3C50FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00FFFF" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Bubble 1 */}
          <motion.g variants={bubble1Variants}>
            <circle r="35" fill="url(#grad1)" opacity="0.6" filter="url(#glow)" />
            <text fill="white" fontSize="12" textAnchor="middle" dy="4" fontWeight="bold">灵感 A</text>
          </motion.g>

          {/* Bubble 2 */}
          <motion.g variants={bubble2Variants}>
            <circle r="35" fill="url(#grad1)" opacity="0.6" filter="url(#glow)" />
            <text fill="white" fontSize="12" textAnchor="middle" dy="4" fontWeight="bold">灵感 B</text>
          </motion.g>

          {/* Fused Plan */}
          <motion.g variants={planVariants}>
             <rect x="-110" y="-60" width="220" height="120" rx="12"
              fill="rgba(24, 28, 41, 0.5)" 
             />
             <rect x="-110" y="-60" width="220" height="120" rx="12"
              fill="transparent"
              stroke="url(#planGrad)"
              strokeWidth="1.5"
             />
             <path d="M-90 -30 L 90 -30 M-90 -10 L 50 -10 M-90 10 L 90 10" stroke="#4B5563" strokeWidth="1.5"/>
             <rect x="-90" y="30" width="70" height="40" rx="4" fill="#4B5563" fillOpacity="0.2"/>
             <rect x="-10" y="30" width="100" height="40" rx="4" fill="#4B5563" fillOpacity="0.2"/>
             <text x="0" y="-40" fill="white" fontSize="14" textAnchor="middle" fontWeight="bold">营销方案</text>
          </motion.g>
        </svg>
      </motion.div>
      <div className="absolute bottom-4 right-4 text-xs text-gray-600">
        交互画布示意
      </div>
    </div>
  );
}


