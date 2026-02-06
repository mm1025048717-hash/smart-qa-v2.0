/**
 * 浮动引导助手 - 仅保留右下角按钮，点击触发聚光灯引导
 * 原展开面板已移除
 */

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface FloatingGuideAssistantProps {
  /** 点击时触发聚光灯式新手引导 */
  onTriggerGuide?: () => void;
  agentName?: string;
  agentAvatar?: string;
  /** 保留兼容，不再使用 */
  onQuestionSelect?: (question: string) => void;
  autoOpen?: boolean;
  onAutoOpenComplete?: () => void;
  userRole?: string;
}

export const FloatingGuideAssistant = ({
  onTriggerGuide,
  agentName = '小助手',
  agentAvatar,
}: FloatingGuideAssistantProps) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      className="fixed bottom-6 right-6 z-[70]"
    >
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onTriggerGuide?.()}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-colors bg-[#1D1D1F] text-white border border-[#E5E5EA]"
        aria-label={agentName ? `打开引导` : '打开引导'}
      >
        {agentAvatar ? (
          <img src={agentAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>
    </motion.div>
  );
};

export default FloatingGuideAssistant;
