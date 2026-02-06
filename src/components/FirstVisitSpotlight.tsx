/**
 * 首次进入聚光灯 - 遮罩镂空左上角，引导用户点击浮动头像
 * 仅首次访问展示一次，点击遮罩或头像后不再显示
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AVATAR_OFFSET_LEFT = 24;
const AVATAR_OFFSET_TOP = 24;
const AVATAR_SIZE = 56;
const HOLE_RADIUS = 48;

interface FirstVisitSpotlightProps {
  onDismiss: () => void;
  onTriggerGuide?: () => void;
}

export function FirstVisitSpotlight({ onDismiss }: FirstVisitSpotlightProps) {
  const [size, setSize] = useState({ w: 1920, h: 1080 });

  useEffect(() => {
    const update = () => {
      setSize({ w: window.innerWidth, h: window.innerHeight });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const cx = AVATAR_OFFSET_LEFT + AVATAR_SIZE / 2;
  const cy = AVATAR_OFFSET_TOP + AVATAR_SIZE / 2;
  const pathD = `
    M 0 0 L ${size.w} 0 L ${size.w} ${size.h} L 0 ${size.h} Z
    M ${cx + HOLE_RADIUS} ${cy}
    A ${HOLE_RADIUS} ${HOLE_RADIUS} 0 1 1 ${cx - HOLE_RADIUS} ${cy}
    A ${HOLE_RADIUS} ${HOLE_RADIUS} 0 1 1 ${cx + HOLE_RADIUS} ${cy}
  `;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[65]"
      aria-hidden
    >
      <svg className="absolute inset-0 w-full h-full">
        {/* 遮罩：全屏暗色 + 左上角镂空，仅遮罩区域可点（点击即关闭） */}
        <path
          d={pathD}
          fill="rgba(0,0,0,0.55)"
          fillRule="evenodd"
          className="cursor-pointer"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
        />
        {/* 镂空处放透明圆，pointer-events: none 让点击穿透到下方头像 */}
        <circle
          cx={cx}
          cy={cy}
          r={HOLE_RADIUS}
          fill="transparent"
          style={{ pointerEvents: 'none' }}
        />
      </svg>
      {/* 提示文案：在镂空下方，引导点击头像 */}
      <div
        className="absolute z-[66] pointer-events-none text-center"
        style={{
          top: AVATAR_OFFSET_TOP + AVATAR_SIZE + 12,
          left: AVATAR_OFFSET_LEFT,
          minWidth: 200,
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.25 }}
          className="text-[14px] font-medium text-[#1D1D1F] drop-shadow-sm"
        >
          点这里开始引导
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.25 }}
          className="mt-1 text-[12px] text-[#86868B]"
        >
          了解如何用一句话获取数据洞察
        </motion.p>
      </div>
    </motion.div>
  );
}
