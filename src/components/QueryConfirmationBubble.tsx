import React, { useState } from 'react';
import { QueryDimensions, buildPreciseQuery } from '../services/queryParser';
import clsx from 'clsx';

interface QueryConfirmationBubbleProps {
  originalQuery: string;
  dimensions: QueryDimensions;
  onConfirm: (preciseQuery: string, confirmedDimensions?: QueryDimensions) => void;
}

export const QueryConfirmationBubble: React.FC<QueryConfirmationBubbleProps> = ({
  originalQuery,
  dimensions,
  onConfirm,
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
    // 根据选择的维度构建精确查询
    const preciseQuery = buildPreciseQuery(originalQuery, localDimensions);
    // 传递用户实际选择的维度信息
    onConfirm(preciseQuery, localDimensions);
  };

  return (
    <div className="space-y-3">
      {/* AI反问文字 */}
      <p className="text-[13px] text-[#000000] leading-relaxed">
        {dimensions.promptText || '您想查看哪个维度的数据？请选择：'}
      </p>

      {/* 维度选择 - 紧凑有序，带分类标签 */}
      <div className="space-y-2.5">
        {/* 门店范围 */}
        <div>
          <label className="text-[11px] text-[#8E8E93] mb-1.5 block">门店范围</label>
          <div className="flex flex-wrap gap-1.5">
            {localDimensions.storeScope.options.map((store) => {
              const isSelected = localDimensions.storeScope.selected.includes(store);
              return (
                <button
                  key={store}
                  onClick={() => handleStoreToggle(store)}
                  className={clsx(
                    'px-2.5 py-1 rounded-md text-[12px] transition-colors',
                    isSelected
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-[#F5F5F7] text-[#000000] hover:bg-[#E5E5EA]'
                  )}
                >
                  {store}
                </button>
              );
            })}
          </div>
        </div>

        {/* 时间范围 */}
        <div>
          <label className="text-[11px] text-[#8E8E93] mb-1.5 block">时间范围</label>
          <div className="flex flex-wrap gap-1.5">
            {localDimensions.timeRange.options.map((time) => {
              const isSelected = localDimensions.timeRange.selected === time;
              return (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={clsx(
                    'px-2.5 py-1 rounded-md text-[12px] transition-colors',
                    isSelected
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-[#F5F5F7] text-[#000000] hover:bg-[#E5E5EA]'
                  )}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* 指标维度 */}
        <div>
          <label className="text-[11px] text-[#8E8E93] mb-1.5 block">指标维度</label>
          <div className="flex flex-wrap gap-1.5">
            {localDimensions.metrics.options.map((metric) => {
              const isSelected = localDimensions.metrics.selected.includes(metric);
              return (
                <button
                  key={metric}
                  onClick={() => handleMetricToggle(metric)}
                  className={clsx(
                    'px-2.5 py-1 rounded-md text-[12px] transition-colors',
                    isSelected
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-[#F5F5F7] text-[#000000] hover:bg-[#E5E5EA]'
                  )}
                >
                  {metric}
                </button>
              );
            })}
          </div>
        </div>

        {/* 展示方式 */}
        <div>
          <label className="text-[11px] text-[#8E8E93] mb-1.5 block">展示方式</label>
          <div className="flex flex-wrap gap-1.5">
            {localDimensions.displayMethod.options.map((method) => {
              const isSelected = localDimensions.displayMethod.selected === method;
              return (
                <button
                  key={method}
                  onClick={() => handleDisplaySelect(method)}
                  className={clsx(
                    'px-2.5 py-1 rounded-md text-[12px] transition-colors',
                    isSelected
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-[#F5F5F7] text-[#000000] hover:bg-[#E5E5EA]'
                  )}
                >
                  {method}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 确认按钮 - 简洁无特效 */}
      <button
        onClick={handleConfirm}
        className="w-full px-3 py-2 bg-[#007AFF] text-white rounded-lg text-[13px] transition-colors hover:bg-[#007AFF]/90 mt-2"
      >
        确认查询
      </button>
    </div>
  );
};
