import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Calendar, BarChart3, LineChart, Check } from 'lucide-react';
import clsx from 'clsx';

export interface QueryDimensions {
  storeScope: {
    selected: string[];
    options: string[];
  };
  timeRange: {
    selected: string;
    options: string[];
  };
  metrics: {
    selected: string[];
    options: string[];
  };
  displayMethod: {
    selected: string;
    options: string[];
  };
}

interface QueryConfirmationDialogProps {
  isOpen: boolean;
  originalQuery: string;
  dimensions: QueryDimensions;
  onConfirm: (dimensions: QueryDimensions) => void;
  onCancel: () => void;
}

export const QueryConfirmationDialog: React.FC<QueryConfirmationDialogProps> = ({
  isOpen,
  originalQuery,
  dimensions,
  onConfirm,
  onCancel,
}) => {
  const [localDimensions, setLocalDimensions] = useState<QueryDimensions>(dimensions);

  const handleStoreToggle = (store: string) => {
    setLocalDimensions(prev => {
      const selected = prev.storeScope.selected.includes(store)
        ? prev.storeScope.selected.filter(s => s !== store)
        : [...prev.storeScope.selected, store];
      return {
        ...prev,
        storeScope: { ...prev.storeScope, selected }
      };
    });
  };

  const handleTimeSelect = (time: string) => {
    setLocalDimensions(prev => ({
      ...prev,
      timeRange: { ...prev.timeRange, selected: time }
    }));
  };

  const handleMetricToggle = (metric: string) => {
    setLocalDimensions(prev => {
      const selected = prev.metrics.selected.includes(metric)
        ? prev.metrics.selected.filter(m => m !== metric)
        : [...prev.metrics.selected, metric];
      return {
        ...prev,
        metrics: { ...prev.metrics, selected }
      };
    });
  };

  const handleDisplaySelect = (method: string) => {
    setLocalDimensions(prev => ({
      ...prev,
      displayMethod: { ...prev.displayMethod, selected: method }
    }));
  };

  const handleConfirm = () => {
    onConfirm(localDimensions);
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
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-[8px] z-[9998]"
          />
          
          {/* 对话框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* 标题栏 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5EA]">
                <div>
                  <h3 className="text-[18px] font-semibold text-[#1d1d1f] mb-1">
                    多度确认交互
                  </h3>
                  <p className="text-sm text-[#86868b]">
                    请确认查询参数
                  </p>
                </div>
                <button
                  onClick={onCancel}
                  className="w-8 h-8 rounded-lg hover:bg-[#F5F5F7] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-[#86868b]" />
                </button>
              </div>

              {/* 原始查询 */}
              <div className="px-6 py-4 bg-[#F5F9FF] border-b border-[#E8F0FF]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#007AFF]/10 flex items-center justify-center">
                    <LineChart className="w-4 h-4 text-[#007AFF]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#86868b] mb-1">原始查询</p>
                    <p className="text-[15px] font-medium text-[#1d1d1f]">{originalQuery}</p>
                  </div>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* 门店范围卡片 */}
                  <motion.div
                    className="bg-white border border-[#E5E5EA] rounded-xl p-4 hover:border-[#007AFF]/30 transition-colors"
                    whileHover={{ y: -1 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Folder className="w-4 h-4 text-[#007AFF]" />
                      <h4 className="text-sm font-semibold text-[#1d1d1f]">门店范围</h4>
                    </div>
                    <div className="space-y-2">
                      {localDimensions.storeScope.options.map((store) => {
                        const isSelected = localDimensions.storeScope.selected.includes(store);
                        return (
                          <button
                            key={store}
                            onClick={() => handleStoreToggle(store)}
                            className={clsx(
                              'w-full text-left px-3 py-2 rounded-lg border transition-all',
                              isSelected
                                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                                : 'bg-white text-[#1d1d1f] border-[#E5E5EA] hover:border-[#007AFF]/30'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{store}</span>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* 时间范围卡片 */}
                  <motion.div
                    className="bg-white border border-[#E5E5EA] rounded-xl p-4 hover:border-[#007AFF]/30 transition-colors"
                    whileHover={{ y: -1 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-[#007AFF]" />
                      <h4 className="text-sm font-semibold text-[#1d1d1f]">时间范围</h4>
                    </div>
                    <div className="space-y-2">
                      {localDimensions.timeRange.options.map((time) => {
                        const isSelected = localDimensions.timeRange.selected === time;
                        return (
                          <button
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            className={clsx(
                              'w-full text-left px-3 py-2 rounded-lg border transition-all',
                              isSelected
                                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                                : 'bg-white text-[#1d1d1f] border-[#E5E5EA] hover:border-[#007AFF]/30'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{time}</span>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* 指标维度卡片 */}
                  <motion.div
                    className="bg-white border border-[#E5E5EA] rounded-xl p-4 hover:border-[#007AFF]/30 transition-colors"
                    whileHover={{ y: -1 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-[#007AFF]" />
                      <h4 className="text-sm font-semibold text-[#1d1d1f]">指标维度</h4>
                    </div>
                    <div className="space-y-2">
                      {localDimensions.metrics.options.map((metric) => {
                        const isSelected = localDimensions.metrics.selected.includes(metric);
                        return (
                          <button
                            key={metric}
                            onClick={() => handleMetricToggle(metric)}
                            className={clsx(
                              'w-full text-left px-3 py-2 rounded-lg border transition-all',
                              isSelected
                                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                                : 'bg-white text-[#1d1d1f] border-[#E5E5EA] hover:border-[#007AFF]/30'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{metric}</span>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* 展示方式卡片 */}
                  <motion.div
                    className="bg-white border border-[#E5E5EA] rounded-xl p-4 hover:border-[#007AFF]/30 transition-colors"
                    whileHover={{ y: -1 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <LineChart className="w-4 h-4 text-[#007AFF]" />
                      <h4 className="text-sm font-semibold text-[#1d1d1f]">展示方式</h4>
                    </div>
                    <div className="space-y-2">
                      {localDimensions.displayMethod.options.map((method) => {
                        const isSelected = localDimensions.displayMethod.selected === method;
                        return (
                          <button
                            key={method}
                            onClick={() => handleDisplaySelect(method)}
                            className={clsx(
                              'w-full text-left px-3 py-2 rounded-lg border transition-all',
                              isSelected
                                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                                : 'bg-white text-[#1d1d1f] border-[#E5E5EA] hover:border-[#007AFF]/30'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{method}</span>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* 底部按钮 */}
              <div className="px-6 py-4 border-t border-[#E5E5EA] bg-[#F5F9FF]">
                <button
                  onClick={handleConfirm}
                  className="w-full px-6 py-3 bg-[#007AFF] text-white rounded-xl font-semibold hover:bg-[#0066CC] transition-colors shadow-sm"
                >
                  确认查询
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};



