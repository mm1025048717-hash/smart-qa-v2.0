import React, { useState } from 'react';
import clsx from 'clsx';

export type AmbiguousType = 'metric' | 'employee';

interface AmbiguousOption {
  label: string;
  value: string;
  description?: string;
}

interface AmbiguousSelectionBubbleProps {
  type: AmbiguousType;
  originalQuery: string;
  options: AmbiguousOption[];
  promptText: string;
  onConfirm: (selectedValues: string[]) => void;
}

export const AmbiguousSelectionBubble: React.FC<AmbiguousSelectionBubbleProps> = ({
  type,
  originalQuery: _originalQuery, // 保留参数以符合接口，但标记为未使用
  options,
  promptText,
  onConfirm,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleToggle = (value: string) => {
    if (type === 'metric' && value === 'both') {
      // 如果选择"两个都要"，自动选择所有选项
      setSelectedValues(['销售额（税前）', '销售额（税后）']);
    } else {
      setSelectedValues(prev => {
        if (prev.includes(value)) {
          return prev.filter(v => v !== value);
        } else {
          return [...prev, value];
        }
      });
    }
  };

  const handleConfirm = () => {
    if (selectedValues.length === 0) {
      return; // 至少选择一个
    }
    onConfirm(selectedValues);
  };

  return (
    <div className="space-y-3">
      {/* AI反问文字 */}
      <p className="text-[13px] text-[#000000] leading-relaxed">
        {promptText}
      </p>

      {/* 选项列表 - 紧凑布局，类似 QueryConfirmationBubble */}
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isSelected = type === 'metric' && option.value === 'both'
            ? selectedValues.length === 2
            : selectedValues.includes(option.value);
          
          return (
            <button
              key={option.value}
              onClick={() => handleToggle(option.value)}
              className={clsx(
                'px-2.5 py-1 rounded-md text-[12px] transition-colors',
                isSelected
                  ? 'bg-[#007AFF] text-white'
                  : 'bg-[#F5F5F7] text-[#000000] hover:bg-[#E5E5EA]'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* 确认按钮 - 初始灰色，选择后变蓝色 */}
      <button
        onClick={handleConfirm}
        disabled={selectedValues.length === 0}
        className={clsx(
          'w-full px-3 py-2 rounded-lg text-[13px] transition-colors mt-2',
          selectedValues.length > 0
            ? 'bg-[#007AFF] text-white hover:bg-[#007AFF]/90 cursor-pointer'
            : 'bg-[#F5F5F7] text-[#8E8E93] cursor-not-allowed'
        )}
      >
        确认查询
      </button>
    </div>
  );
};



