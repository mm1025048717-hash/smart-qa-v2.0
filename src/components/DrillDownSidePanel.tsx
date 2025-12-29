import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Download, LayoutDashboard, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export interface DrillDownData {
  title: string;
  details: Array<{ label: string; value: string }>;
  actions?: Array<{ id: string; label: string; icon?: 'drill' | 'export' | 'dashboard'; onClick?: () => void }>;
  onActionSelect?: (query: string) => void; // 用于在当前消息中执行操作
}

interface DrillDownSidePanelProps {
  isOpen: boolean;
  data: DrillDownData | null;
  onClose: () => void;
  onBack?: () => void;
}

export const DrillDownSidePanel = ({
  isOpen,
  data,
  onClose,
  onBack,
}: DrillDownSidePanelProps) => {
  if (!data) return null;

  const getActionIcon = (icon?: string) => {
    switch (icon) {
      case 'drill':
        return <ChevronRight className="w-4 h-4" />;
      case 'export':
        return <Download className="w-4 h-4" />;
      case 'dashboard':
        return <LayoutDashboard className="w-4 h-4" />;
      default:
        return <ChevronRight className="w-4 h-4" />;
    }
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
            onClick={onClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[9998]"
          />
          
          {/* 右侧面板 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[280px] bg-white shadow-xl z-[9999] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5ea]">
              <h3 className="text-[14px] font-medium text-[#1d1d1f]">
                {data.title}
              </h3>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded hover:bg-[#f5f5f7] flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[#86868b]" />
              </button>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {/* 详细信息列表 */}
              <div className="space-y-0">
                {data.details.map((detail, index) => (
                  <div
                    key={index}
                    className="py-2 border-b border-[#f5f5f7] last:border-0"
                  >
                    <div className="text-[12px] text-[#86868b] mb-0.5">{detail.label}</div>
                    <div className="text-[13px] text-[#1d1d1f]">{detail.value}</div>
                  </div>
                ))}
              </div>

              {/* 操作按钮 */}
              {data.actions && data.actions.length > 0 && (
                <div className="mt-4 space-y-1">
                  {data.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        action.onClick?.();
                      }}
                      className={clsx(
                        'w-full flex items-center justify-between px-3 py-2 rounded text-[13px]',
                        'text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors'
                      )}
                    >
                      <span>{action.label}</span>
                      {getActionIcon(action.icon)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 底部返回按钮 */}
            {onBack && (
              <>
                <div className="h-px bg-[#e5e5ea]" />
                <div className="px-4 py-3">
                  <button
                    onClick={onBack}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded text-[13px] text-[#007AFF] hover:bg-[#007AFF]/5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>返回上级</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

