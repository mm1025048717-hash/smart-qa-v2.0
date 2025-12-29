/**
 * 删除确认对话框组件
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface DeleteConfirmDialogProps {
  title?: string;
  message?: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const DeleteConfirmDialog = ({
  title = '危险操作',
  message = '确定要删除此报告吗？此操作不可逆。\n所有相关数据将被永久删除。',
  confirmText = 'DELETE',
  onConfirm,
  onCancel,
  isOpen,
}: DeleteConfirmDialogProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsConfirmed(value === confirmText);
  };

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      // 重置状态
      setInputValue('');
      setIsConfirmed(false);
    }
  };

  const handleCancel = () => {
    setInputValue('');
    setIsConfirmed(false);
    onCancel();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
          />
          
          {/* 对话框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-[#d2d2d7] overflow-hidden">
              {/* 标题栏 */}
              <div className="flex items-center gap-3 px-6 py-4 bg-[#FFF5F5] border-b border-[#FFE5E5]">
                <div className="w-10 h-10 rounded-full bg-[#FF3B30]/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-[#FF3B30]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
                    {title}
                  </h3>
                </div>
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 rounded-lg hover:bg-[#f5f5f7] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-[#86868b]" />
                </button>
              </div>

              {/* 内容区域 */}
              <div className="px-6 py-5">
                <div className="text-[14px] text-[#1d1d1f] whitespace-pre-line mb-6">
                  {message}
                </div>

                {/* 确认输入框 */}
                <div className="mb-6">
                  <label className="block text-[13px] text-[#86868b] mb-2">
                    请输入"{confirmText}"确认：
                  </label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={confirmText}
                    className={clsx(
                      'w-full px-4 py-3 rounded-lg border text-[14px]',
                      'focus:outline-none focus:ring-2 transition-all',
                      isConfirmed
                        ? 'border-[#FF3B30] focus:ring-[#FF3B30]/20 bg-[#FFF5F5]'
                        : 'border-[#d2d2d7] focus:border-[#007AFF] focus:ring-[#007AFF]/20 bg-white'
                    )}
                    autoFocus
                  />
                </div>

                {/* 按钮组 */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2.5 rounded-lg text-[14px] font-medium bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e5e5ea] transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!isConfirmed}
                    className={clsx(
                      'flex-1 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all',
                      isConfirmed
                        ? 'bg-[#FF3B30] text-white hover:bg-[#D70015]'
                        : 'bg-[#d2d2d7] text-[#86868b] cursor-not-allowed'
                    )}
                  >
                    删除
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











