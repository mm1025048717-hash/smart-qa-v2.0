import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 融合历史日志组件
 */
export function FusionLog({ fusionEvents, bubbles, onSelectBubble }) {
  // 获取气泡文本
  const getBubbleText = (bubbleId) => {
    const bubble = bubbles.find(b => b.id === bubbleId);
    return bubble ? bubble.text : '已删除';
  };

  if (fusionEvents.length === 0) {
    return (
      <div className="text-center py-8 text-bfl-text-dim">
        <Zap className="w-12 h-12 mx-auto mb-2 opacity-20" />
        <p className="text-sm">暂无融合记录</p>
        <p className="text-xs mt-1">拖动两个气泡靠近开始融合</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {fusionEvents.map((event, index) => (
          <motion.div
            key={event.id}
            className="log-item cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectBubble(event.resultBubbleId)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex-shrink-0">
              <Zap className="w-5 h-5 text-bfl-accent" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-bfl-text-dim truncate">
                  {getBubbleText(event.bubbleAId)}
                </span>
                <span className="text-bfl-text-dim">×</span>
                <span className="text-bfl-text-dim truncate">
                  {getBubbleText(event.bubbleBId)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <ChevronRight className="w-3 h-3 text-gray-600" />
                <span className="text-sm font-medium text-bfl-text truncate">
                  {event.title}
                </span>
              </div>
              
              <div className="flex items-center gap-1 mt-1 text-xs text-bfl-text-dim">
                <Clock className="w-3 h-3" />
                <span>
                  {format(new Date(event.timestamp), 'HH:mm:ss', { locale: zhCN })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
