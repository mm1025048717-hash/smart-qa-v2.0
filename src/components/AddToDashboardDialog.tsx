/**
 * 添加到看板确认对话框组件 - 苹果级简约设计
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AddToDashboardDialogProps {
  isOpen: boolean;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AddToDashboardDialog = ({
  isOpen,
  title = '添加到数据看板',
  onConfirm,
  onCancel,
}: AddToDashboardDialogProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-[8px] z-[9998]"
            transition={{ duration: 0.2 }}
          />
          
          {/* 对话框 - 居中显示 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -10 }}
            transition={{ 
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-sm px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden border border-[#E5E5EA]/60">
              {/* 标题栏 - 简约设计 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5EA]/60">
                <h3 className="text-[17px] font-semibold text-[#000000] tracking-tight">
                  {title}
                </h3>
                <button
                  onClick={onCancel}
                  className="w-8 h-8 rounded-full hover:bg-[#F5F5F7] flex items-center justify-center transition-colors"
                  aria-label="关闭"
                >
                  <X className="w-4 h-4 text-[#86868B]" />
                </button>
              </div>

              {/* 内容区域 */}
              <div className="px-6 py-5">
                <p className="text-[15px] text-[#1D1D1F] leading-relaxed mb-6">
                  是否跳转到看板页面进行配置？
                </p>

                {/* 按钮组 - 简约设计 */}
                <div className="flex gap-3">
                  <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 bg-white text-[#007AFF] text-[15px] font-medium rounded-xl border border-[#007AFF]/30 hover:bg-[#007AFF]/5 transition-all duration-200"
                  >
                    稍后
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 px-4 py-2.5 bg-[#007AFF] text-white text-[15px] font-medium rounded-xl hover:bg-[#0051D5] transition-all duration-200 shadow-[0_2px_8px_rgba(0,122,255,0.3)] hover:shadow-[0_4px_12px_rgba(0,122,255,0.4)]"
                  >
                    跳转到看板
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
