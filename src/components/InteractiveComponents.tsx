/**
 * AI 回复中的交互组件 - 蓝白简约风格
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { getAgentByName } from '../services/agents/index';

// 选择题组件
interface ChoiceOption {
  id: string;
  label: string;
  value: string;
}

export const ChoiceSelector = ({ 
  question,
  options, 
  onSelect,
  multiple = false,
  minSelections = 0,
  maxSelections,
}: { 
  question?: string;
  options: ChoiceOption[];
  onSelect: (value: string | string[]) => void;
  multiple?: boolean;
  minSelections?: number;
  maxSelections?: number;
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (option: ChoiceOption) => {
    if (multiple) {
      const newSelected = selected.includes(option.id)
        ? selected.filter(id => id !== option.id)
        : [...selected, option.id];
      
      // 检查最大选择数量限制
      if (maxSelections && newSelected.length > maxSelections) {
        return; // 已达到最大选择数量
      }
      
      setSelected(newSelected);
    } else {
      setSelected([option.id]);
      onSelect(option.value);
    }
  };

  const handleConfirm = () => {
    if (multiple && selected.length > 0) {
      const selectedValues = selected
        .map(id => options.find(opt => opt.id === id)?.value)
        .filter(Boolean) as string[];
      onSelect(selectedValues);
    }
  };

  const canConfirm = multiple && selected.length >= minSelections && 
    (!maxSelections || selected.length <= maxSelections);

  return (
    <div className="mt-6 mb-4">
      {question && (
        <p className="text-[12px] text-[#86868b] mb-2.5 font-medium">{question}</p>
      )}
      {multiple && selected.length > 0 && (
        <div className="mb-2.5 flex items-center gap-2">
          <span className="text-[11px] text-[#86868b]">
            已选择 {selected.length} 项
            {maxSelections && ` / 最多 ${maxSelections} 项`}
            {minSelections > 0 && selected.length < minSelections && ` (至少选择 ${minSelections} 项)`}
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-0.5">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          const isDisabled = Boolean(multiple && maxSelections && !isSelected && selected.length >= maxSelections);
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              disabled={isDisabled}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] transition-all border text-left
                whitespace-normal break-words min-w-0
                ${isDisabled
                  ? 'bg-[#F5F5F7] text-[#86868b] border-[#E5E5EA] cursor-not-allowed'
                  : isSelected
                    ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-sm'
                    : 'bg-white text-[#1D1D1F] border-[#D2D2D7] hover:border-[#007AFF] hover:bg-[#F5F5F7]'
                }
              `}
            >
              {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
              <span className="flex-1 leading-tight">{option.label}</span>
            </button>
          );
        })}
      </div>
      {multiple && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`
              px-3 py-1.5 rounded-md text-[12px] font-medium transition-all
              ${canConfirm
                ? 'bg-[#007AFF] text-white hover:bg-[#0051D5] shadow-sm'
                : 'bg-[#E5E5EA] text-[#86868b] cursor-not-allowed'
              }
            `}
          >
            确认选择 {selected.length > 0 && `(${selected.length})`}
          </button>
          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              className="px-3 py-1.5 rounded-md text-[12px] text-[#86868b] hover:bg-[#F5F5F7] transition-all"
            >
              清空
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// 快捷操作按钮组 - 统一空心蓝边样式，与 choices 保持一致
export const QuickActions = ({ 
  actions,
  onAction,
}: { 
  actions: { id: string; label: string; query: string; icon?: string }[];
  onAction: (query: string) => void;
}) => {
  return (
    <div className="mt-10 mb-5">
      <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.query)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] transition-all border
              min-w-[120px] max-w-full whitespace-normal break-words text-left
              bg-white text-[#007AFF] border-[#007AFF]/30 hover:border-[#007AFF] hover:bg-[#007AFF]/5"
        >
            {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
            <span className="flex-1">{action.label}</span>
        </button>
      ))}
      </div>
    </div>
  );
};

// 高亮文本 + 下拉选择框组件 - 用于识别到的关键信息（门店、产品等）
export const HighlightedSelect = ({
  text,
  options,
  onSelect,
  label,
}: {
  text: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  label?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(text);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
    onSelect(value);
  };

  return (
    <div className="inline-flex items-center gap-2 relative">
      {label && (
        <span className="text-[13px] text-[#646A73]">{label}</span>
      )}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all
            bg-[#FFF5F5] border-2 border-[#FF3B30] text-[#FF3B30] hover:bg-[#FFE5E5] cursor-pointer"
        >
          <span>{selectedValue}</span>
          <svg 
            className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-[#E5E5EA] rounded-lg shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-2 text-[13px] transition-colors hover:bg-[#F5F5F7] first:rounded-t-lg last:rounded-b-lg
                  ${selectedValue === option.value ? 'bg-[#E8F3FF] text-[#007AFF] font-medium' : 'text-[#1d1d1f]'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 评分组件
export const RatingSelector = ({
  question,
  onRate,
  max = 5,
}: {
  question?: string;
  onRate: (rating: number) => void;
  max?: number;
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const handleRate = (value: number) => {
    setRating(value);
    onRate(value);
  };

  return (
    <div className="my-3">
      {question && (
        <p className="text-sm text-[#1d1d1f] mb-2">{question}</p>
      )}
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition-colors"
          >
            {star <= (hover || rating) ? '★' : '☆'}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// 确认框
export const ConfirmBox = ({
  message,
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
    >
      <p className="text-sm text-amber-800 mb-3">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="px-4 py-1.5 bg-[#007AFF] text-white text-sm rounded-lg hover:bg-[#0066CC] transition-colors"
        >
          {confirmText}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-1.5 bg-white text-[#1d1d1f] text-sm rounded-lg border border-[#d2d2d7] hover:bg-[#F5F5F7] transition-colors"
        >
          {cancelText}
        </button>
      </div>
    </motion.div>
  );
};

// 进度指示器
export const ProgressSteps = ({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) => {
  return (
    <div className="my-3 flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
            ${index < current 
              ? 'bg-[#34C759] text-white' 
              : index === current 
                ? 'bg-[#007AFF] text-white' 
                : 'bg-[#E5E5EA] text-[#86868b]'
            }
          `}>
            {index < current ? '✓' : index + 1}
          </div>
          <span className={`
            ml-2 text-sm
            ${index <= current ? 'text-[#1d1d1f]' : 'text-[#aeaeb2]'}
          `}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className={`
              w-8 h-0.5 mx-2
              ${index < current ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}
            `} />
          )}
        </div>
      ))}
    </div>
  );
};

// 切换同事按钮组件 - 精美卡片样式
export const SwitchAgentButton = ({
  agentName,
  onSwitch,
}: {
  agentName: string;
  onSwitch: (agentName: string) => void;
}) => {
  // 确保 agentName 是字符串，不是对象
  const name = typeof agentName === 'string' ? agentName : (agentName as any)?.name || String(agentName);
  
  // 获取完整 Agent 信息
  const agent = getAgentByName(name);
  
  if (!agent) {
    // 如果找不到 Agent，显示简单按钮
    return (
      <button
        onClick={() => onSwitch(name)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F3FF] text-[#007AFF] text-[13px] font-medium rounded-lg hover:bg-[#007AFF] hover:text-white transition-all cursor-pointer border border-[#007AFF]/20 shadow-sm hover:shadow-md"
      >
        <span className="text-[11px]">@</span>
        <span>{name}</span>
      </button>
    );
  }
  
  // 显示完整的 Agent 卡片
  return (
    <button
      onClick={() => onSwitch(agent.name)}
      className="inline-flex items-center gap-2.5 px-3 py-2 bg-white border border-[#E5E5EA] rounded-xl hover:border-[#007AFF] hover:bg-[#F0F7FF] transition-all cursor-pointer shadow-sm hover:shadow-md group"
    >
      {agent.avatar ? (
        <img 
          src={agent.avatar} 
          alt={agent.name}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white group-hover:ring-[#007AFF]/20 transition-all"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white text-xs font-semibold">
          {agent.name.slice(0, 1)}
        </div>
      )}
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[#1d1d1f] group-hover:text-[#007AFF] transition-colors">
            {agent.name}
          </span>
          {agent.badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#007AFF]/10 text-[#007AFF] rounded">
              {agent.badge}
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#86868b] group-hover:text-[#007AFF]/80 transition-colors">
          {agent.title}
        </span>
      </div>
      <svg className="w-4 h-4 text-[#86868b] group-hover:text-[#007AFF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

// 解析 AI 回复中的交互组件标记
export interface ParsedContent {
  type: 'text' | 'choices' | 'actions' | 'rating' | 'confirm' | 'query' | 'switch' | 'chart' | 'kpi' | 'thought-chain' | 'steps' | 'highlight-select';
  content?: string;
  data?: any;
}

export function parseInteractiveContent(text: string): ParsedContent[] {
  const result: ParsedContent[] = [];
  
  // 清理不规范的格式 - 移除所有"[XXX说]:"格式（但保留switch标记）
  let remaining = text.replace(/\[([^\]]+?)说\]:\s*/g, '');
  remaining = remaining.replace(/\[([^\]]+?)说\]/g, '');
  
  while (remaining.length > 0) {
    // 查找下一个 [ 标记
    const bracketIdx = remaining.indexOf('[');
    
    if (bracketIdx === -1) {
      // 没有更多 [，但可能存在裸 choices: 或 choices-multiple: 选项1|选项2
      // 增强匹配：支持跨行、支持不完整的choices（流式输出中）
      const bareChoicesMatch = remaining.match(/(choices(?:-multiple)?|choice(?:-multiple)?):\s*([^\n\[\]]+?)(?:\n|$)/i);
      if (bareChoicesMatch && bareChoicesMatch[2]) {
        const [fullMatch, rawType, optionsStr] = bareChoicesMatch;
        const type = rawType.toLowerCase();
        const isMultiple = type.includes('multiple');
        
        // 检查是否有分隔符 |，即使只有一个也要尝试解析
        if (optionsStr.includes('|') || optionsStr.trim().length > 0) {
          const textBeforeChoices = remaining.slice(0, bareChoicesMatch.index).trim();
          if (textBeforeChoices) {
            const text = String(textBeforeChoices).replace(/\[object Object\]/g, '').trim();
            if (text) {
              result.push({ type: 'text', content: text });
            }
          }
          
          // 增强选项解析：支持跨行、支持不完整选项（流式输出中）
          // 清理选项字符串：将换行符转换为分隔符，统一处理
          let cleanedOptions = optionsStr
            .replace(/\n+/g, '|')  // 换行符转为分隔符
            .replace(/\s*\|\s*/g, '|')  // 统一分隔符格式
            .replace(/\|+/g, '|')  // 合并多个分隔符
            .trim();
          
          // 如果以 | 结尾，说明可能还在流式输出中，暂时保留
          const isStreaming = cleanedOptions.endsWith('|');
          if (isStreaming) {
            cleanedOptions = cleanedOptions.slice(0, -1); // 移除末尾的 |
          }
          
          const options = cleanedOptions.split('|')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0)
            .map((opt, i) => ({
              id: `opt_${i}`,
              label: opt.trim(),
              value: opt.trim(),
            }));
          
          // 至少要有2个选项才认为是有效的choices（避免单个选项被误解析）
          // 但如果是在流式输出中，即使只有1个选项也先显示
          if (options.length >= 1 || isStreaming) {
            result.push({ type: 'choices', data: { options, multiple: isMultiple } });
          }
          
          const afterIdx = bareChoicesMatch.index !== undefined ? bareChoicesMatch.index + fullMatch.length : remaining.length;
          remaining = remaining.slice(afterIdx).trimStart();
          if (!remaining.length) break;
          // 继续循环处理后续内容
          continue;
        }
      }
      
      // 没有更多标记，添加剩余文本
      if (remaining.trim()) {
        const text = String(remaining.trim()).replace(/\[object Object\]/g, '').trim();
        if (text) {
          result.push({ type: 'text', content: text });
        }
      }
      break;
    }
    
    // 添加标记前的文本
    if (bracketIdx > 0) {
      const beforeText = remaining.slice(0, bracketIdx).trim();
      if (beforeText) {
        const text = String(beforeText).replace(/\[object Object\]/g, '').trim();
        if (text) {
          result.push({ type: 'text', content: text });
        }
      }
    }
    
    // 检查是否是 [chart: 开头（需要特殊处理 JSON）
    if (remaining.slice(bracketIdx).startsWith('[chart:{')) {
      const startIdx = bracketIdx + 7; // 跳过 "[chart:"
      let braceCount = 1;
      let endIdx = startIdx + 1; // 跳过第一个 {
      
      // 找到匹配的闭合 }
      while (endIdx < remaining.length && braceCount > 0) {
        if (remaining[endIdx] === '{') braceCount++;
        if (remaining[endIdx] === '}') braceCount--;
        endIdx++;
      }
      
      // 检查是否有闭合的 ]
      if (endIdx < remaining.length && remaining[endIdx] === ']') {
        const jsonStr = remaining.slice(startIdx, endIdx);
        try {
          const chartData = JSON.parse(jsonStr);
          if (chartData && chartData.data) {
            result.push({ type: 'chart', data: chartData });
          }
        } catch (e) {
          // JSON 解析失败，显示为文本
          const text = String(remaining.slice(bracketIdx, endIdx + 1)).replace(/\[object Object\]/g, '').trim();
          if (text) {
            result.push({ type: 'text', content: text });
          }
        }
        remaining = remaining.slice(endIdx + 1);
        continue;
      }
    }
    
    // 检查是否是 [kpi: 开头（KPI卡片 JSON）
    if (remaining.slice(bracketIdx).startsWith('[kpi:{')) {
      const startIdx = bracketIdx + 5; // 跳过 "[kpi:"
      let braceCount = 1;
      let endIdx = startIdx + 1; // 跳过第一个 {
      
      // 找到匹配的闭合 }
      while (endIdx < remaining.length && braceCount > 0) {
        if (remaining[endIdx] === '{') braceCount++;
        if (remaining[endIdx] === '}') braceCount--;
        endIdx++;
      }
      
      // 检查是否有闭合的 ]
      if (endIdx < remaining.length && remaining[endIdx] === ']') {
        const jsonStr = remaining.slice(startIdx, endIdx);
        try {
          const kpiData = JSON.parse(jsonStr);
          if (kpiData && kpiData.label !== undefined && kpiData.value !== undefined) {
            // 生成唯一ID
            kpiData.id = kpiData.id || `kpi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            result.push({ type: 'kpi', data: kpiData });
          }
        } catch (e) {
          // JSON 解析失败，显示为文本
          const text = String(remaining.slice(bracketIdx, endIdx + 1)).replace(/\[object Object\]/g, '').trim();
          if (text) {
            result.push({ type: 'text', content: text });
          }
        }
        remaining = remaining.slice(endIdx + 1);
        continue;
      }
    }
    
    // 检查是否是 [thought-chain: 开头（思维链 JSON）
    if (remaining.slice(bracketIdx).startsWith('[thought-chain:{')) {
      const startIdx = bracketIdx + 15; // 跳过 "[thought-chain:"
      let braceCount = 1;
      let endIdx = startIdx + 1; // 跳过第一个 {
      
      // 找到匹配的闭合 }
      while (endIdx < remaining.length && braceCount > 0) {
        if (remaining[endIdx] === '{') braceCount++;
        if (remaining[endIdx] === '}') braceCount--;
        endIdx++;
      }
      
      // 检查是否有闭合的 ]
      if (endIdx < remaining.length && remaining[endIdx] === ']') {
        const jsonStr = remaining.slice(startIdx, endIdx);
        try {
          const thoughtChainData = JSON.parse(jsonStr);
          if (thoughtChainData && Array.isArray(thoughtChainData.items)) {
            result.push({ type: 'thought-chain', data: thoughtChainData.items });
          }
        } catch (e) {
          // JSON 解析失败，显示为文本
          const text = String(remaining.slice(bracketIdx, endIdx + 1)).replace(/\[object Object\]/g, '').trim();
          if (text) {
            result.push({ type: 'text', content: text });
          }
        }
        remaining = remaining.slice(endIdx + 1);
        continue;
      }
    }
    
    // 处理未闭合的 choices/steps（没有 ] 结尾的情况），尽量容错
    // 改进：支持 choices-multiple 和 choice-multiple 格式
    const unclosedChoiceStepMatch = remaining.slice(bracketIdx).match(/^\[(choices?(?:-multiple)?|choice(?:-multiple)?|steps?):([\s\S]*?)(?=$|\n|\[|\])/i);
    if (unclosedChoiceStepMatch) {
      const [, rawType, rawData] = unclosedChoiceStepMatch;
      const type = rawType.toLowerCase();
      const dataStr = (rawData || '').trim();
      if (dataStr) {
        let cleaned = dataStr
          .replace(/->/g, '|')
          .replace(/[→➜➡➝➔⟶↠↦]/g, '|')
          .replace(/\n+/g, '|')
          .replace(/\s*\|\s*/g, '|');
        const parts = cleaned.split('|').map(p => p.trim()).filter(Boolean);
        if (parts.length > 0) {
          if (type.startsWith('choice')) {
            const isMultiple = type.includes('multiple');
            result.push({ type: 'choices', data: { options: parts.map((opt, i) => ({ id: `opt_${i}`, label: opt, value: opt })), multiple: isMultiple } });
          } else {
            result.push({ type: 'steps', data: { steps: parts } });
          }
          remaining = remaining.slice(bracketIdx + unclosedChoiceStepMatch[0].length);
          continue;
        }
      }
    }
    
    // 处理其他标准格式 [type:content] 或简单的 [选项1|选项2|选项3] 格式
    // 先尝试标准格式 [type:content]，支持多行内容
    // 改进：使用更宽松的匹配，支持跨行和格式不完整的情况
    const simpleMatch = remaining.slice(bracketIdx).match(/^\[(\w+):([\s\S]*?)\]/);
    if (simpleMatch) {
      const [fullMatch, type, dataStr] = simpleMatch;
      
      // 确保 fullMatch 包含闭合的 ]
      const actualFullMatch = fullMatch.endsWith(']') ? fullMatch : fullMatch + ']';
      
      switch (type.toLowerCase()) {
        case 'steps':
        case 'step':
          // 处理步骤列表，格式：步骤1|步骤2|步骤3
          // 先清理数据，移除可能的尾随 ] 或其他字符
          let stepsCleanedData = dataStr.trim();
          // 支持箭头/连字符作为分隔符
          stepsCleanedData = stepsCleanedData
            .replace(/->/g, '|')
            .replace(/[→➜➡➝➔⟶↠↦]/g, '|');
          // 移除尾随的 ]
          stepsCleanedData = stepsCleanedData.replace(/\]+$/, '');
          // 处理多行：将换行符转换为 |
          stepsCleanedData = stepsCleanedData.replace(/\n+/g, '|');
          // 规范化分隔符
          stepsCleanedData = stepsCleanedData.replace(/\s*\|\s*/g, '|');
          
          const steps = stepsCleanedData.split('|')
            .map(step => step.trim())
            .filter(step => step.length > 0);
          
          if (steps.length > 0) {
            result.push({ type: 'steps', data: { steps } });
          }
          break;
        
        case 'choices':
        case 'choice':
        case 'choices-multiple':
        case 'choice-multiple':
          // 处理多行选项，清理换行符和多余空格
          // 增强解析：支持流式输出中的不完整choices
          let cleanedData = dataStr.trim();
          // 移除尾随的 ]
          cleanedData = cleanedData.replace(/\]+$/, '');
          // 处理多行：将换行符转换为 |
          cleanedData = cleanedData.replace(/\n+/g, '|');
          // 规范化分隔符：统一处理各种分隔符格式
          cleanedData = cleanedData
            .replace(/\s*\|\s*/g, '|')  // 统一 | 分隔符
            .replace(/\|+/g, '|')  // 合并多个分隔符
            .replace(/^\|+|\|+$/g, '');  // 移除首尾分隔符
          
          // 检查是否是多选模式
          const isMultiple = type.toLowerCase().includes('multiple');
          
          // 增强选项解析：支持不完整选项（流式输出中）
          const options = cleanedData.split('|')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0)
            .map((opt, i) => ({
              id: `opt_${i}`,
              label: opt.trim(),
              value: opt.trim(),
            }));
          
          // 至少要有1个选项才认为是有效的choices（流式输出中可能只有部分选项）
          if (options.length > 0) {
            result.push({ type: 'choices', data: { options, multiple: isMultiple } });
            // 跳过整个匹配的内容（包括闭合的 ]），使用 actualFullMatch 确保包含 ]
            remaining = remaining.slice(bracketIdx + actualFullMatch.length);
            continue;
          } else {
            // 如果没有解析到选项，记录警告（但不影响其他内容解析）
            console.warn('[Choices Parser] No valid options found:', dataStr);
          }
          break;
        
        case 'actions':
        case 'action':
          // 处理多行操作，清理换行符和多余空格
          // 先清理数据，移除可能的尾随 ] 或其他字符
          let actionsCleanedData = dataStr.trim();
          // 移除尾随的 ]
          actionsCleanedData = actionsCleanedData.replace(/\]+$/, '');
          // 处理多行：将换行符转换为 |
          actionsCleanedData = actionsCleanedData.replace(/\n+/g, '|');
          // 规范化分隔符
          actionsCleanedData = actionsCleanedData.replace(/\s*\|\s*/g, '|');
          
          const actions = actionsCleanedData.split('|')
            .map(act => act.trim())
            .filter(act => act.length > 0)
            .map((act, i) => ({
            id: `act_${i}`,
            label: act.trim(),
            query: act.trim(),
          }));
          
          if (actions.length > 0) {
          result.push({ type: 'actions', data: { actions } });
          }
          break;
        
        case 'rating':
          result.push({ type: 'rating', data: { question: dataStr.trim() } });
          break;
        
        case 'query':
          result.push({ type: 'query', data: { query: dataStr.trim() } });
          break;
        
        case 'switch':
          // 确保 agentName 是字符串，清理可能的额外字符
          let agentNameStr = typeof dataStr === 'string' ? dataStr.trim() : String(dataStr);
          // 移除可能存在的闭合括号或其他字符
          agentNameStr = agentNameStr.replace(/\]/g, '').trim();
          if (agentNameStr) {
            result.push({ type: 'switch', data: { agentName: agentNameStr } });
          }
          break;
        
        case 'highlight-select':
        case 'highlight':
          // 格式：[highlight-select:识别到的文本|选项1|选项2|选项3] 或 [highlight:识别到的文本|选项1|选项2|选项3]
          // 清理数据，移除可能的尾随 ]
          let highlightCleanedData = dataStr.trim().replace(/\]+$/, '');
          // 处理多行：将换行符转换为 |
          highlightCleanedData = highlightCleanedData.replace(/\n+/g, '|');
          // 规范化分隔符
          highlightCleanedData = highlightCleanedData.replace(/\s*\|\s*/g, '|');
          
          const highlightParts = highlightCleanedData.split('|').map(p => p.trim()).filter(Boolean);
          if (highlightParts.length >= 2) {
            const identifiedText = highlightParts[0]; // 第一个是识别到的文本
            const options = highlightParts.slice(1).map((opt) => ({
              label: opt,
              value: opt,
            }));
            result.push({ 
              type: 'highlight-select' as const, 
              data: { 
                text: identifiedText, 
                options: [{ label: identifiedText, value: identifiedText }, ...options] // 将识别到的文本也作为第一个选项
              } 
            });
          }
          break;
        
        default:
          // 未知类型，当作文本
          const text = String(fullMatch).replace(/\[object Object\]/g, '').trim();
          if (text) {
            result.push({ type: 'text', content: text });
          }
      }
      
      // 使用 actualFullMatch 确保跳过闭合的 ]
      remaining = remaining.slice(bracketIdx + actualFullMatch.length);
      continue;
    }
    
    // 处理未闭合的 [switch: 标记（如 [switch:可视化小王 后面没有]）
    // 或者 switch 后面跟着其他内容的情况
    const unclosedSwitchMatch = remaining.slice(bracketIdx).match(/^\[switch:([^\]]+?)(?:\]|$)/);
    if (unclosedSwitchMatch) {
      const [fullMatch, agentNameStr] = unclosedSwitchMatch;
      const cleanedName = agentNameStr.replace(/\]/g, '').trim();
      if (cleanedName) {
        result.push({ type: 'switch', data: { agentName: cleanedName } });
      }
      // 移除已处理的部分，包括可能的尾随 ]
      remaining = remaining.slice(bracketIdx + fullMatch.length);
      continue;
    }
    
    // 尝试简单格式 [选项1|选项2|选项3]（没有type前缀）
    // 改进：支持跨行的选项，使用多行匹配
    const simpleOptionsMatch = remaining.slice(bracketIdx).match(/^\[([\s\S]*?)\]/);
    if (simpleOptionsMatch) {
      const [fullMatch, optionsStr] = simpleOptionsMatch;
      // 检查是否包含 | 分隔符，如果有则认为是选项列表
      if (optionsStr.includes('|')) {
        // 处理多行选项，清理换行符
        const cleanedOptions = optionsStr.replace(/\n+/g, '|').replace(/\s*\|\s*/g, '|');
        const options = cleanedOptions.split('|')
          .map(opt => opt.trim())
          .filter(opt => opt.length > 0)
          .map((opt, i) => ({
          id: `opt_${i}`,
          label: opt.trim(),
          value: opt.trim(),
        }));
        
        if (options.length > 0) {
        result.push({ type: 'choices', data: { options } });
        remaining = remaining.slice(bracketIdx + fullMatch.length);
        continue;
        }
      }
    }
    
    // 处理特殊情况：文本中可能包含未闭合的标记，尝试找到下一个 ] 或行尾
    // 例如："将本看板分享给[switch:可视化小王制作交互式图表|对比加入安徽后的长三角完整数据]"
    // 这种情况应该解析为：文本 + switch + choices
    const mixedFormatMatch = remaining.slice(bracketIdx).match(/^\[switch:([^\]]+?)([^\]]*?)\]/);
    if (mixedFormatMatch) {
      const [fullMatch, agentNameStr, trailingContent] = mixedFormatMatch;
      const cleanedName = agentNameStr.replace(/\]/g, '').trim();
      
      // 如果 switch 后面有内容且包含 |，则解析为 choices
      if (trailingContent && trailingContent.includes('|')) {
        if (cleanedName) {
          result.push({ type: 'switch', data: { agentName: cleanedName } });
        }
        const options = trailingContent.split('|').map((opt, i) => ({
          id: `opt_${i}`,
          label: opt.trim(),
          value: opt.trim(),
        }));
        if (options.length > 0) {
          result.push({ type: 'choices', data: { options } });
        }
        remaining = remaining.slice(bracketIdx + fullMatch.length);
        continue;
      } else if (cleanedName) {
        // 只有 switch，没有后续选项
        result.push({ type: 'switch', data: { agentName: cleanedName } });
        remaining = remaining.slice(bracketIdx + fullMatch.length);
        continue;
      }
    }
    
    // 处理没有方括号的 choices、steps 或 actions 格式（在遇到 [ 之前检查）
    // 这种情况可能是文本格式不规范，但我们需要支持
    if (bracketIdx > 0) {
      const beforeBracket = remaining.slice(0, bracketIdx);
      
      // 先检查 steps
      const bareStepsMatch = beforeBracket.match(/steps:\s*([^\n\[\]]+)$/i);
      if (bareStepsMatch) {
        const [fullMatch, stepsStr] = bareStepsMatch;
        if (stepsStr) {
          const cleanedSteps = stepsStr
            .replace(/->/g, '|')
            .replace(/[→➜➡➝➔⟶↠↦]/g, '|')
            .replace(/\n+/g, '|')
            .replace(/\s*\|\s*/g, '|');
          const steps = cleanedSteps.split('|')
            .map(step => step.trim())
            .filter(step => step.length > 0);
          if (steps.length > 0) {
            // 移除 steps: 部分，添加 steps 组件
            const textBeforeSteps = beforeBracket.slice(0, beforeBracket.length - fullMatch.length).trim();
            if (textBeforeSteps) {
              result.push({ type: 'text', content: textBeforeSteps });
            }
            result.push({ type: 'steps', data: { steps } });
            remaining = remaining.slice(bracketIdx);
            continue;
          }
        }
      }
      
      // 再检查 actions
      const bareActionsMatch = beforeBracket.match(/actions:\s*([^\n\[\]]+)$/i);
      if (bareActionsMatch) {
        const [fullMatch, actionsStr] = bareActionsMatch;
        if (actionsStr && actionsStr.includes('|')) {
          const cleanedActions = actionsStr.replace(/\n+/g, '|').replace(/\s*\|\s*/g, '|');
          const actions = cleanedActions.split('|')
            .map(act => act.trim())
            .filter(act => act.length > 0)
            .map((act, i) => ({
              id: `act_${i}`,
              label: act.trim(),
              query: act.trim(),
            }));
          if (actions.length > 0) {
            // 移除 actions: 部分，添加 actions 组件
            const textBeforeActions = beforeBracket.slice(0, beforeBracket.length - fullMatch.length).trim();
            if (textBeforeActions) {
              result.push({ type: 'text', content: textBeforeActions });
            }
            result.push({ type: 'actions', data: { actions } });
            remaining = remaining.slice(bracketIdx);
            continue;
          }
        }
      }
      
      // 最后检查 choices
      const bareChoicesMatch = beforeBracket.match(/(choices(?:-multiple)?|choice(?:-multiple)?):\s*([^\n\[\]]+)$/i);
      if (bareChoicesMatch) {
        const [fullMatch, rawType, optionsStr] = bareChoicesMatch;
        const type = rawType.toLowerCase();
        const isMultiple = type.includes('multiple');
        if (optionsStr && optionsStr.includes('|')) {
          const cleanedOptions = optionsStr.replace(/\n+/g, '|').replace(/\s*\|\s*/g, '|');
          const options = cleanedOptions.split('|')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0)
            .map((opt, i) => ({
              id: `opt_${i}`,
              label: opt.trim(),
              value: opt.trim(),
            }));
          if (options.length > 0) {
            // 移除 choices: 部分，添加 choices 组件
            const textBeforeChoices = beforeBracket.slice(0, beforeBracket.length - fullMatch.length).trim();
            if (textBeforeChoices) {
              result.push({ type: 'text', content: textBeforeChoices });
            }
            result.push({ type: 'choices', data: { options, multiple: isMultiple } });
            remaining = remaining.slice(bracketIdx);
            continue;
          }
        }
      }
    }
    
    // 没有匹配到任何格式，检查是否是未完成的 choices/actions 格式（如 [choices: 但没有内容或闭合）
    // 如果是这种情况，跳过这个 [ 字符，避免显示不完整的格式
    const incompleteMatch = remaining.slice(bracketIdx).match(/^\[(choices(?:-multiple)?|choice(?:-multiple)?|actions?):\s*$/i);
    if (incompleteMatch) {
      // 跳过这个不完整的标记，不显示
      remaining = remaining.slice(bracketIdx + incompleteMatch[0].length);
      continue;
    }
    
    // 如果只是单独的 [ 字符，也跳过，避免显示
    const nextChar = remaining.slice(bracketIdx + 1, bracketIdx + 2);
    if (!nextChar || nextChar === '\n' || nextChar === ' ') {
      // 单独的 [ 字符，跳过
      remaining = remaining.slice(bracketIdx + 1);
      continue;
    }
    
    // 其他情况，将 [ 作为普通文本处理
    const nextPart = String(remaining.slice(bracketIdx, bracketIdx + 1)).replace(/\[object Object\]/g, '');
    if (nextPart) {
      if (result.length > 0 && result[result.length - 1].type === 'text') {
        result[result.length - 1].content = String(result[result.length - 1].content || '') + nextPart;
      } else {
        result.push({ type: 'text', content: nextPart });
      }
    }
    remaining = remaining.slice(bracketIdx + 1);
  }

  // 如果没有解析到任何内容，检查是否有未处理的 steps 或 choices（没有方括号的情况）
  if (result.length === 0 || (result.length === 1 && result[0].type === 'text' && !result[0].content?.includes('['))) {
    // 检查整个文本中是否有 steps: 或 choices: 格式（没有方括号）
    const stepsMatch = text.match(/steps:\s*([^\n\[\]]+)/i);
    if (stepsMatch) {
      const [fullMatch, stepsStr] = stepsMatch;
      if (stepsStr) {
        const cleanedSteps = stepsStr
          .replace(/->/g, '|')
          .replace(/[→➜➡➝➔⟶↠↦]/g, '|')
          .replace(/\n+/g, '|')
          .replace(/\s*\|\s*/g, '|');
        const steps = cleanedSteps.split('|')
          .map(step => step.trim())
          .filter(step => step.length > 0);
        if (steps.length > 0) {
          // 移除 steps: 部分，添加 steps 组件
          const textBeforeSteps = text.slice(0, text.indexOf(fullMatch)).trim();
          const textAfterSteps = text.slice(text.indexOf(fullMatch) + fullMatch.length).trim();
          
          result.length = 0; // 清空之前的结果
          if (textBeforeSteps) {
            result.push({ type: 'text', content: textBeforeSteps });
          }
          result.push({ type: 'steps', data: { steps } });
          if (textAfterSteps) {
            result.push({ type: 'text', content: textAfterSteps });
          }
        }
      }
    } else {
      // 检查整个文本中是否有 choices: 或 choices-multiple: 格式（没有方括号）
      const choicesMatch = text.match(/(choices(?:-multiple)?|choice(?:-multiple)?):\s*([^\n\[\]]+)/i);
      if (choicesMatch) {
        const [fullMatch, rawType, optionsStr] = choicesMatch;
        const type = rawType.toLowerCase();
        const isMultiple = type.includes('multiple');
        if (optionsStr && optionsStr.includes('|')) {
          const cleanedOptions = optionsStr.replace(/\n+/g, '|').replace(/\s*\|\s*/g, '|');
          const options = cleanedOptions.split('|')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0)
            .map((opt, i) => ({
              id: `opt_${i}`,
              label: opt.trim(),
              value: opt.trim(),
            }));
          if (options.length > 0) {
            // 移除 choices: 部分，添加 choices 组件
            const textBeforeChoices = text.slice(0, text.indexOf(fullMatch)).trim();
            const textAfterChoices = text.slice(text.indexOf(fullMatch) + fullMatch.length).trim();
            
            result.length = 0; // 清空之前的结果
            if (textBeforeChoices) {
              result.push({ type: 'text', content: textBeforeChoices });
            }
            result.push({ type: 'choices', data: { options, multiple: isMultiple } });
            if (textAfterChoices) {
              result.push({ type: 'text', content: textAfterChoices });
            }
          }
        }
      }
    }
  }

  // 如果没有解析到任何内容，返回原文本
  if (result.length === 0) {
    const textContent = String(text).replace(/\[object Object\]/g, '').trim();
    if (textContent) {
      result.push({ type: 'text', content: textContent });
    }
  }
  
  // 最后清理所有 text 类型的 content，确保都是字符串且没有 [object Object]
  result.forEach(item => {
    if (item.type === 'text' && item.content) {
      if (typeof item.content !== 'string') {
        item.content = String(item.content).replace(/\[object Object\]/g, '').trim();
      } else {
        item.content = item.content.replace(/\[object Object\]/g, '').trim();
      }
    }
  });

  return result;
}

// 检查文本是否包含数据查询触发
export function extractQueryTrigger(text: string): string | null {
  const match = text.match(/\[query:(.*?)\]/);
  return match ? match[1].trim() : null;
}

