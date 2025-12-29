/**
 * 消息评分组件 - 支持星级、表情、数字三种评分方式
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export interface RatingData {
  stars?: number; // 1-5
}

interface MessageRatingProps {
  messageId: string;
  onRating?: (rating: RatingData) => void;
  initialRating?: RatingData;
}

export const MessageRating = ({ 
  messageId: _messageId, 
  onRating,
  initialRating 
}: MessageRatingProps) => {
  const [rating, setRating] = useState<RatingData>(initialRating || {});
  const [submitted, setSubmitted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleStarClick = (value: number) => {
    const newRating = { stars: value };
    setRating(newRating);
    onRating?.(newRating);
    // 自动提交评分
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className=""
      >
        <div className="flex items-center gap-2 text-[13px] text-[#86868b]">
          <span className="text-[#007AFF]">✓</span>
          <span>感谢您的评分！</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className=""
    >
      {/* 标题栏 - 可点击收起/展开 */}
      <div 
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="text-[13px] font-medium text-[#1d1d1f]">
          对答案的评分
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center"
        >
          <ChevronDown className="w-4 h-4 text-[#86868b]" />
        </motion.div>
      </div>

      {/* 评分内容 - 可收起/展开 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <div className="text-[12px] text-[#86868b]">内容满意度：</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStarClick(star);
                    }}
                    className={clsx(
                      'text-2xl transition-colors',
                      rating.stars && star <= rating.stars
                        ? 'text-[#FFD700]'
                        : 'text-[#d2d2d7] hover:text-[#FFD700]/50'
                    )}
                  >
                    ★
                  </motion.button>
                ))}
                {rating.stars && (
                  <span className="ml-2 text-[12px] text-[#86868b]">
                    {rating.stars} 星
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

