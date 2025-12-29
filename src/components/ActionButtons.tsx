/**
 * 操作按钮组件 - 纯蓝白配色 苹果风格
 */

import { motion } from 'framer-motion';
import { ActionButton } from '../types';

interface ActionButtonsProps {
  buttons: ActionButton[];
  onSelect: (query: string) => void;
  delay?: number;
}

export const ActionButtonGroup = ({ buttons, onSelect, delay = 0 }: ActionButtonsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-blue-100"
    >
      {buttons.map((button, index) => (
        <motion.button
          key={button.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: delay + index * 0.03 }}
          onClick={() => onSelect(button.query)}
          className="min-h-[38px] px-5 py-2 bg-white border border-[#d2d2d7] rounded-full text-[13px] text-[#007AFF] font-medium hover:bg-[#007AFF] hover:text-white hover:border-[#007AFF] active:scale-95 transition-all"
        >
          {button.label}
        </motion.button>
      ))}
    </motion.div>
  );
};

// 快速问题
interface QuickQuestionsProps {
  questions: string[];
  onSelect: (query: string) => void;
}

export const QuickQuestions = ({ questions, onSelect }: QuickQuestionsProps) => {
  return (
    <div className="space-y-3">
      <span className="text-[13px] text-[#3B82F6] font-medium">试试问我：</span>
      <div className="flex flex-wrap gap-3">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            className="min-h-[38px] px-5 py-2 bg-white border border-[#d2d2d7] rounded-full text-[13px] text-[#007AFF] font-medium hover:bg-[#007AFF] hover:text-white hover:border-[#007AFF] active:scale-95 transition-all"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default { ActionButtonGroup, QuickQuestions };
