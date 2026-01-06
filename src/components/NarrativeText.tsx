/**
 * 叙事文本组件 - 蓝白简约风格
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ChoiceSelector, QuickActions, RatingSelector, SwitchAgentButton, ProgressSteps, HighlightedSelect, parseInteractiveContent } from './InteractiveComponents';
import { ThoughtChain, ThoughtChainItem } from './ThoughtChain';
import { SmartChart } from './Charts';
import { TypewriterText } from './TypewriterText';

/**
 * 生成下钻查询字符串
 * 根据图表数据和下钻数据生成查询
 */
function generateDrillDownQuery(chartData: any, drillData: any): string {
  if (!drillData) {
    return '查看详细数据';
  }

  // 如果 drillData 是字符串，直接返回
  if (typeof drillData === 'string') {
    return drillData;
  }

  // 如果 drillData 是对象，尝试提取有意义的信息
  if (typeof drillData === 'object') {
    const parts: string[] = [];
    
    // 提取维度信息
    if (drillData.name) {
      parts.push(`查看${drillData.name}的详细数据`);
    } else if (drillData.x) {
      parts.push(`查看${drillData.x}的详细数据`);
    } else if (drillData.category) {
      parts.push(`查看${drillData.category}的详细数据`);
    } else if (chartData.xKey && drillData[chartData.xKey]) {
      parts.push(`查看${drillData[chartData.xKey]}的详细数据`);
    } else {
      parts.push('查看详细数据');
    }

    // 添加时间范围（如果有）
    if (drillData.date || drillData.time) {
      parts.push(`时间：${drillData.date || drillData.time}`);
    }

    return parts.join('，');
  }

  return '查看详细数据';
}

interface NarrativeTextProps {
  content: string;
  delay?: number;
  onInteraction?: (value: string) => void;
  onAgentSwitch?: (agentName: string) => void;
  isStreaming?: boolean; // 是否正在流式输出
  onAttributionClick?: (data: { metric: string; changeValue: number; changeDirection: 'up' | 'down'; changeType: '同比' | '环比'; triggerRect?: DOMRect }) => void;
}

// 预处理：将伪复选框格式转换为真正的交互组件
const preprocessContent = (text: string): string => {
  // 匹配伪复选框格式：☐ 选项1 ☐ 选项2 或 □ 选项1 □ 选项2
  const checkboxPattern = /[☐☑□■]\s*([^☐☑□■\n]+)/g;
  const matches = text.match(checkboxPattern);
  
  if (matches && matches.length >= 2) {
    // 提取选项
    const options = matches.map(m => m.replace(/^[☐☑□■]\s*/, '').trim()).filter(Boolean);
    if (options.length > 0) {
      // 找到包含复选框的那一行，替换为 choices 组件
      const lines = text.split('\n');
      const newLines = lines.map(line => {
        if (line.match(/[☐☑□■]/)) {
          // 这行包含复选框，替换为 choices
          return `请选择：[choices:${options.join('|')}]`;
        }
        return line;
      });
      return newLines.join('\n');
    }
  }
  
  // 清理单独的复选框字符
  return text.replace(/[☐☑□■]/g, '•');
};

// 检测文本中的同比/环比数据
interface AttributionMatch {
  text: string;
  metric: string;
  changeValue: number;
  changeDirection: 'up' | 'down';
  changeType: '同比' | '环比';
  startIndex: number;
  endIndex: number;
}

function detectAttributionInText(text: string): AttributionMatch[] {
  const matches: AttributionMatch[] = [];
  
  // 优化：文字解读中的归因按钮显示规则
  // 1. 如果文本是总结性描述（如"整体表现良好"、"呈现稳步上升趋势"），不显示归因按钮
  // 2. 只在明确提到具体增长率数字时才显示归因按钮
  // 3. 避免在解释性文本中显示归因（如"说明客单价有所提升"）
  
  const isSummaryText = /整体|表现|趋势|分布|来看|说明|呈现|显示|有所/.test(text);
  const hasExplicitGrowthRate = /(较|比|同比|环比|增长|下降|上升|下滑)([0-9.]+)%/.test(text);
  
  // 如果是总结性文本且没有明确的增长率数字，不显示归因按钮
  if (isSummaryText && !hasExplicitGrowthRate) {
    return matches;
  }
  
  // 如果是解释性文本（如"说明..."），也不显示归因按钮
  if (/说明|表明|意味着|反映出/.test(text) && !hasExplicitGrowthRate) {
    return matches;
  }
  
  // 匹配模式：
  // 1. "较去年同期增长/下降X%"
  // 2. "同比增长/下降X%"
  // 3. "环比增长/下降X%"
  // 4. "较上期增长/下降X%"
  // 5. "比去年同期增长/下降X%"
  // 6. "较去年增长/下降X%"
  // 7. "增速(X%)" 或 "增长率(X%)"
  // 8. "增长X%" (不带前缀，但上下文中有指标名)
  // 9. "↑X%" 或 "↓X%" (如果出现在文本中)
  
  const patterns = [
    // 同比模式 - 明确的时间对比
    { pattern: /较去年同期(增长|下降|上升|下滑)([0-9.]+)%/g, isYoY: true },
    { pattern: /比去年同期(增长|下降|上升|下滑)([0-9.]+)%/g, isYoY: true },
    { pattern: /较去年(增长|下降|上升|下滑)([0-9.]+)%/g, isYoY: true },
    { pattern: /同比(增长|下降|上升|下滑)([0-9.]+)%/g, isYoY: true },
    { pattern: /(增长|下降|上升|下滑)([0-9.]+)%\s*同比/g, isYoY: true },
    // 环比模式 - 明确的时间对比
    { pattern: /较上期(增长|下降|上升|下滑)([0-9.]+)%/g, isYoY: false },
    { pattern: /较上月(增长|下降|上升|下滑)([0-9.]+)%/g, isYoY: false },
    { pattern: /环比(增长|下降|上升|下滑)([0-9.]+)%/g, isYoY: false },
    { pattern: /(增长|下降|上升|下滑)([0-9.]+)%\s*环比/g, isYoY: false },
    // 增速/增长率格式 - 需要从上下文判断是同比还是环比
    { pattern: /(增速|增长率)\(([0-9.]+)%\)/g, isYoY: null }, // null表示需要从上下文判断
    { pattern: /(增速|增长率)([0-9.]+)%/g, isYoY: null },
    // 箭头格式 - ↑X% 或 ↓X%
    { pattern: /↑\s*([0-9.]+)%/g, isYoY: null, isUp: true },
    { pattern: /↓\s*([0-9.]+)%/g, isYoY: null, isUp: false },
    // 纯数字百分比格式 - 需要上下文判断
    { pattern: /(增长|上升)([0-9.]+)%/g, isYoY: null, isUp: true },
    { pattern: /(下降|下滑)([0-9.]+)%/g, isYoY: null, isUp: false },
  ];
  
  patterns.forEach(({ pattern, isYoY, isUp }) => {
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      let value: number;
      let direction: string;
      let matchedText: string;
      
      // 根据不同的模式提取数值和方向
      if (pattern.source.includes('↑') || pattern.source.includes('↓')) {
        // 箭头格式
        value = parseFloat(match[1]);
        direction = isUp ? '增长' : '下降';
        matchedText = match[0];
      } else if (pattern.source.includes('增速') || pattern.source.includes('增长率')) {
        // 增速格式
        value = parseFloat(match[2] || match[1]);
        direction = '增长'; // 增速默认是增长，如果是负数会在数值中体现
        matchedText = match[0];
      } else {
        // 标准格式
        direction = match[1] || match[2];
        value = parseFloat(match[2] || match[3] || match[1]);
        matchedText = match[0];
      }
      
      if (isNaN(value)) continue;
      
      // 判断方向
      const isUpDirection = isUp !== undefined ? isUp : ['增长', '上升'].includes(direction);
      
      // 提取指标名称（向前查找，最多80个字符）
      const beforeText = text.substring(Math.max(0, match.index - 80), match.index);
      const metricMatch = beforeText.match(/(销售额|营收|收入|订单量|利润|成本|用户数|DAU|MAU|客单价|转化率|复购率|库存|GMV|坪效|翻台率|人效|售罄率|连带率|库存周转率|缺货率|配送时效|ROI|库存周转天数|售罄率|连带率)/);
      const metric = metricMatch ? metricMatch[1] : '销售额';
      
      // 判断是同比还是环比（如果isYoY为null，需要从上下文判断）
      let changeType: '同比' | '环比' = '同比';
      if (isYoY === null) {
        // 从上下文判断：如果提到"去年"、"同期"等，是同比；如果提到"上月"、"上期"等，是环比
        const contextText = text.substring(Math.max(0, match.index - 100), match.index + match[0].length + 50);
        if (/去年|同期|同比/.test(contextText)) {
          changeType = '同比';
        } else if (/上月|上期|环比|本月|本期/.test(contextText)) {
          changeType = '环比';
        } else {
          // 默认使用同比（因为大多数情况下是同比）
          changeType = '同比';
        }
      } else {
        changeType = isYoY ? '同比' : '环比';
      }
      
      matches.push({
        text: matchedText,
        metric,
        changeValue: value,
        changeDirection: isUpDirection ? 'up' : 'down',
        changeType,
        startIndex: match.index,
        endIndex: match.index + matchedText.length,
      });
    }
  });
  
  // 去重：如果同一个位置有多个匹配，保留最长的
  const uniqueMatches: AttributionMatch[] = [];
  matches.forEach(match => {
    const existing = uniqueMatches.find(m => 
      m.startIndex === match.startIndex || 
      (m.startIndex < match.startIndex && m.endIndex > match.startIndex)
    );
    if (!existing) {
      uniqueMatches.push(match);
    } else if (match.endIndex - match.startIndex > existing.endIndex - existing.startIndex) {
      // 替换为更长的匹配
      const index = uniqueMatches.indexOf(existing);
      uniqueMatches[index] = match;
    }
  });
  
  return uniqueMatches.sort((a, b) => a.startIndex - b.startIndex);
}

// 带归因按钮的文本组件
const AttributedText = ({
  content,
  matches,
  onAttributionClick,
  onAgentSwitch,
}: {
  content: string;
  matches: AttributionMatch[];
  onAttributionClick: (data: { metric: string; changeValue: number; changeDirection: 'up' | 'down'; changeType: '同比' | '环比'; triggerRect?: DOMRect }) => void;
  onAgentSwitch?: (agentName: string) => void;
}) => {
  // 按位置排序，从前往后处理
  const sortedMatches = [...matches].sort((a, b) => a.startIndex - b.startIndex);
  
  const components: Array<{ key: string; type: 'text' | 'attribution'; content?: string; match?: AttributionMatch }> = [];
  
  // 从前往后分割文本，插入归因按钮
  let currentIndex = 0;
  
  sortedMatches.forEach((match, index) => {
    // 添加归因按钮前的文本
    if (match.startIndex > currentIndex) {
      components.push({
        key: `text-before-${index}`,
        type: 'text',
        content: content.substring(currentIndex, match.startIndex),
      });
    }
    
    // 添加归因按钮
    components.push({
      key: `attribution-${index}`,
      type: 'attribution',
      match,
    });
    
    // 更新当前位置到匹配结束位置
    currentIndex = match.endIndex;
  });
  
  // 添加最后剩余的文本
  if (currentIndex < content.length) {
    components.push({
      key: 'text-end',
      type: 'text',
      content: content.substring(currentIndex),
    });
  }
  
  return (
    <div className="inline">
      {components.map((comp) => {
        if (comp.type === 'text' && comp.content) {
          return (
            <span key={comp.key}>
              <MarkdownRenderer content={comp.content} onAgentSwitch={onAgentSwitch} />
            </span>
          );
        } else if (comp.type === 'attribution' && comp.match) {
          const match = comp.match;
          return (
            <AttributionTrigger
              key={comp.key}
              text={match.text}
              metric={match.metric}
              changeValue={match.changeValue}
              changeDirection={match.changeDirection}
              changeType={match.changeType}
              onAttributionClick={onAttributionClick}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

// 归因触发器组件（内联版本，用于文本中）
const AttributionTrigger = ({
  text,
  metric,
  changeValue,
  changeDirection,
  changeType,
  onAttributionClick,
}: {
  text: string;
  metric: string;
  changeValue: number;
  changeDirection: 'up' | 'down';
  changeType: '同比' | '环比';
  onAttributionClick: (data: { metric: string; changeValue: number; changeDirection: 'up' | 'down'; changeType: '同比' | '环比'; triggerRect?: DOMRect }) => void;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onAttributionClick({
      metric,
      changeValue,
      changeDirection,
      changeType,
      triggerRect: rect
    });
  };
  
  return (
    <span className="relative inline-flex items-center gap-1 group">
      <span>{text}</span>
      <button
        onClick={handleClick}
        onMouseEnter={() => {
          setTimeout(() => setShowTooltip(true), 200);
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
        }}
        className={clsx(
          'relative inline-flex items-center justify-center h-5 px-1.5 rounded-md transition-all duration-200',
          'text-[#007AFF] hover:text-white',
          'bg-transparent hover:bg-[#007AFF]',
          'border border-[#007AFF]/30 hover:border-[#007AFF]',
          'active:scale-95',
          'cursor-pointer shadow-sm hover:shadow-md',
          'text-[10px] font-medium leading-none'
        )}
        aria-label="归因分析"
      >
        归因
        
        {/* 悬停提示 */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 whitespace-nowrap pointer-events-none"
            >
              <div className="bg-[#1d1d1f] text-white text-[12px] px-3 py-2 rounded-lg shadow-xl">
                <div className="font-medium">
                  想知道为何{changeDirection === 'up' ? '涨了' : '降了'}{changeValue}%？点击进行归因
                </div>
                {/* 小箭头 */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-t-[6px] border-t-[#1d1d1f] border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </span>
  );
};

// 主组件 - 使用打字机效果渲染文本
export const NarrativeText = ({ content, delay = 0, onInteraction, onAgentSwitch, isStreaming = false, onAttributionClick }: NarrativeTextProps) => {
  // 确保 content 是字符串
  let textContent: string;
  if (typeof content === 'string') {
    textContent = content;
  } else if (content && typeof content === 'object') {
    // 如果是对象，尝试提取有意义的内容
    if ('text' in (content as Record<string, any>)) {
      textContent = String((content as Record<string, any>).text || '');
    } else if ('content' in (content as Record<string, any>)) {
      textContent = String((content as Record<string, any>).content || '');
    } else {
      textContent = JSON.stringify(content);
    }
    // 清理 [object Object]
    textContent = textContent.replace(/\[object Object\]/g, '').trim();
  } else {
    textContent = String(content || '');
  }
  // 再次清理，确保没有残留的对象字符串
  textContent = textContent.replace(/\[object Object\]/g, '').trim();
  
  // 清理思维链代码，避免显示为文本（必须在解析前清理）
  textContent = textContent
    .replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, '')
    .replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, '') // 再次清理
    .replace(/\[thought-chain:[^\]]*\]/gi, '')
    .replace(/\[thought-chain:[^\]]*\]/gi, '') // 再次清理
    .replace(/\[thought-chain[^\]]*/gi, '')
    .replace(/\[thought-chain[^\]]*/gi, '') // 再次清理
    .replace(/\[thought-chain:[\s\S]*?\]/gi, '') // 多行匹配
    .replace(/\[thought-chain:[\s\S]*?\]/gi, '') // 再次清理多行
    .trim();
  
  if (!textContent) return null;
  
  // 预处理内容，转换伪复选框
  const processedContent = preprocessContent(textContent);
  
  // 检测是否包含交互组件标记（包括简单格式 [选项1|选项2]）
  const hasInteractive = processedContent.includes('[choices:') || 
    processedContent.includes('[choices-multiple:') ||
    processedContent.includes('[choice-multiple:') ||
    processedContent.includes('[actions:') || 
    processedContent.includes('[rating:') || 
    processedContent.includes('[switch:') || 
    processedContent.includes('[query:') || 
    processedContent.includes('[chart:') ||
    processedContent.includes('[kpi:') ||
    processedContent.includes('[highlight-select:') ||
    processedContent.includes('[highlight:') ||
    /\[[^\]]+\|[^\]]+\]/.test(processedContent); // 检测简单格式 [选项1|选项2]
  // 注意：不再检测 [thought-chain:，因为已经清理掉了
  
  // 解析交互内容（用于多步骤选择检测）
  const parsed = hasInteractive ? parseInteractiveContent(processedContent) : [];
  const choicesBlocks = parsed.filter(item => item.type === 'choices');
  const hasMultipleChoices = choicesBlocks.length > 1;
  
  // 多步骤选择状态管理（必须在条件语句之前调用hooks）
  const [multiStepSelections, setMultiStepSelections] = useState<Record<number, string | string[]>>({});
  
  // 检查是否所有choices都已选择
  const allChoicesSelected = useMemo(() => {
    if (!hasMultipleChoices) return false;
    return choicesBlocks.every((_, index) => {
      const selection = multiStepSelections[index];
      if (!selection) return false;
      // 如果是数组（多选），至少要有1个选择
      if (Array.isArray(selection)) return selection.length > 0;
      // 如果是字符串（单选），不能为空
      return selection.length > 0;
    });
  }, [hasMultipleChoices, choicesBlocks, multiStepSelections]);
  
  // 提交所有选择
  const handleSubmitAllSelections = () => {
    if (!hasMultipleChoices || !allChoicesSelected) return;
    
    // 将所有选择组合成一条消息
    const selections = choicesBlocks.map((block, index) => {
      const selection = multiStepSelections[index];
      const question = block.data?.question || '';
      if (Array.isArray(selection)) {
        return `${question}: ${selection.join(', ')}`;
      }
      return `${question}: ${selection}`;
    });
    
    const combinedMessage = selections.join('\n');
    onInteraction?.(combinedMessage);
    
    // 清空选择状态
    setMultiStepSelections({});
  };
  
  // 如果包含交互组件，解析并渲染
  if (hasInteractive) {
    
    return (
      <div 
        className="space-y-0"
        style={{ 
          minHeight: '1px', // 确保有最小高度，避免布局跳动
          contain: 'layout style', // CSS containment，优化渲染性能
          opacity: 1, // 立即显示，不使用动画
        }}
      >
        {parsed.map((item, index) => {
          switch (item.type) {
            case 'steps':
              // 确保 data 和 steps 存在
              if (!item.data || !item.data.steps || !Array.isArray(item.data.steps)) {
                console.warn('Invalid steps data:', item);
                return null;
              }
              
              // 确保 steps 不为空
              if (item.data.steps.length === 0) {
                console.warn('Empty steps:', item);
                return null;
              }
              
              return (
                <ProgressSteps
                  key={`steps-${index}`}
                  steps={item.data.steps}
                  current={item.data.steps.length} // 默认显示所有步骤为已完成
                />
              );
            
            case 'choices':
              // 确保 data 和 options 存在
              if (!item.data || !item.data.options || !Array.isArray(item.data.options)) {
                console.warn('Invalid choices data:', item);
                return null;
              }
              
              // 确保 options 不为空
              if (item.data.options.length === 0) {
                console.warn('Empty choices options:', item);
                return null;
              }
              
              // 检查是否是多选模式
              const isMultiple = item.data.multiple === true;
              
              // 计算当前choices在所有choices中的索引
              const choicesIndex = parsed.slice(0, index).filter(i => i.type === 'choices').length;
              const isMultiStep = hasMultipleChoices;
              const currentSelection = multiStepSelections[choicesIndex];
              
              return (
                <ChoiceSelector
                  key={`choices-${index}`}
                  question={item.data.question}
                  options={item.data.options}
                  multiple={isMultiple}
                  minSelections={item.data.minSelections}
                  maxSelections={item.data.maxSelections}
                  onSelect={(value) => {
                    if (isMultiStep) {
                      // 多步骤模式：保存选择，不立即提交
                      setMultiStepSelections(prev => ({
                        ...prev,
                        [choicesIndex]: value
                      }));
                    } else {
                      // 单步骤模式：立即提交
                      if (isMultiple && Array.isArray(value)) {
                        onInteraction?.(value.join(', '));
                      } else {
                        onInteraction?.(value as string);
                      }
                    }
                  }}
                />
              );
            case 'actions':
              return (
                <QuickActions
                  key={index}
                  actions={item.data.actions}
                  onAction={(query) => onInteraction?.(query)}
                />
              );
            case 'rating':
              return (
                <RatingSelector
                  key={index}
                  question={item.data.question}
                  onRate={(rating) => onInteraction?.(`评分: ${rating}星`)}
                />
              );
            case 'query':
              return (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8F3FF] text-[#007AFF] text-sm rounded-lg"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] animate-pulse" />
                  <span>正在查询: {item.data.query}</span>
                </div>
              );
            case 'switch':
              // 确保 agentName 是字符串，处理可能的对象情况
              let agentName = typeof item.data?.agentName === 'string' 
                ? item.data.agentName 
                : (item.data?.agentName?.name || String(item.data?.agentName || ''));
              // 清理可能的额外字符（如闭合括号、换行等）
              agentName = agentName.replace(/\]/g, '').trim();
              if (!agentName) {
                // 如果没有有效的 agentName，跳过渲染
                return null;
              }
              return (
                <SwitchAgentButton
                  key={index}
                  agentName={agentName}
                  onSwitch={(name) => onAgentSwitch?.(name)}
                />
              );
            case 'highlight-select' as const:
              // 高亮选择组件：用于显示识别到的关键信息（门店、产品等），并提供下拉选项
              if (!item.data || !item.data.text || !item.data.options || !Array.isArray(item.data.options)) {
                console.warn('Invalid highlight-select data:', item);
                return null;
              }
              return (
                <HighlightedSelect
                  key={`highlight-select-${index}`}
                  text={item.data.text}
                  options={item.data.options}
                  label={item.data.label}
                  onSelect={(value) => {
                    // 当用户选择其他选项时，触发交互
                    onInteraction?.(`修改为: ${value}`);
                  }}
                />
              );
            case 'thought-chain': {
              const thoughtChainItems = item.data as ThoughtChainItem[];
              
              // 检查数据有效性：如果 items 为空或无效，不渲染（避免空白框）
              if (!Array.isArray(thoughtChainItems) || thoughtChainItems.length === 0) {
                return null; // 不渲染空白框
              }
              
              // 验证每个 item 是否有必要的字段
              const validItems = thoughtChainItems.filter(item => 
                item && typeof item === 'object' && item.key && item.title
              );
              
              if (validItems.length === 0) {
                return null; // 不渲染空白框
              }
              
              // 自动展开当前 loading 的步骤，让用户看到动态更新
              const autoExpandedKeys = validItems
                .filter(item => item.status === 'loading' || item.blink)
                .map(item => item.key);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay, duration: 0.2 }}
                  className="my-4 bg-white rounded-xl border border-[#E5E5EA] shadow-sm p-5"
                >
                  <ThoughtChain 
                    items={validItems} 
                    defaultExpandedKeys={autoExpandedKeys}
                    line="dashed"
                  />
                </motion.div>
              );
            }
            case 'chart':
              // 确保 chartData 有效
              if (!item.data || !item.data.type || !item.data.data) {
                return (
                  <div key={index} className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
                    <p className="text-[13px] text-[#FF3B30]">图表数据格式错误</p>
                  </div>
                );
              }
              return (
                <div key={index} className="my-0">
                  <SmartChart 
                    chartData={item.data} 
                    delay={delay + index * 0.1}
                    onDrillDown={(data) => {
                      // 生成下钻查询
                      const drillQuery = generateDrillDownQuery(item.data, data);
                      onInteraction?.(drillQuery);
                    }}
                  />
                </div>
              );
            case 'text':
            default:
              // 确保 content 是字符串
              let textContent: string;
              if (typeof item.content === 'string') {
                textContent = item.content;
              } else if (item.content && typeof item.content === 'object') {
                // 如果是对象，尝试提取有意义的内容
                const contentObj = item.content as Record<string, any>;
                if ('text' in contentObj) {
                  textContent = String(contentObj.text || '');
                } else if ('content' in contentObj) {
                  textContent = String(contentObj.content || '');
                } else {
                  textContent = JSON.stringify(item.content);
                }
                // 清理 [object Object]
                textContent = textContent.replace(/\[object Object\]/g, '').trim();
              } else {
                textContent = String(item.content || '');
              }
              // 再次清理，确保没有残留的对象字符串
              textContent = textContent.replace(/\[object Object\]/g, '').trim();
              
              // 清理思维链代码（确保不会显示）
              textContent = textContent
                .replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, '')
                .replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, '') // 再次清理
                .replace(/\[thought-chain:[^\]]*\]/gi, '')
                .replace(/\[thought-chain:[^\]]*\]/gi, '') // 再次清理
                .replace(/\[thought-chain[^\]]*/gi, '')
                .replace(/\[thought-chain[^\]]*/gi, '') // 再次清理
                .replace(/\[thought-chain:[\s\S]*?\]/gi, '') // 多行匹配
                .replace(/\[thought-chain:[\s\S]*?\]/gi, '') // 再次清理多行
                .trim();
              
              if (!textContent) return null;
              // 检测文本中的归因数据
              const attributionMatches = onAttributionClick ? detectAttributionInText(textContent) : [];
              
              // 如果有归因数据，渲染带归因按钮的文本
              if (attributionMatches.length > 0 && onAttributionClick) {
                return (
                  <div key={index} className="text-[15px] text-[#1d1d1f] leading-relaxed my-0">
                    <AttributedText 
                      content={textContent} 
                      matches={attributionMatches}
                      onAttributionClick={onAttributionClick}
                      onAgentSwitch={onAgentSwitch}
                    />
                  </div>
                );
              }
              
              return (
                <div key={index} className="text-[15px] text-[#1d1d1f] leading-relaxed my-0">
                  <MarkdownRenderer content={textContent} onAgentSwitch={onAgentSwitch} />
                </div>
              );
          }
        })}
        {/* 多步骤选择确认按钮 */}
        {hasMultipleChoices && (
          <div className="mt-4 flex items-center justify-end">
            <button
              onClick={handleSubmitAllSelections}
              disabled={!allChoicesSelected}
              className={`
                px-4 py-2 rounded-md text-[13px] font-medium transition-all
                ${allChoicesSelected
                  ? 'bg-[#007AFF] text-white hover:bg-[#0051D5] shadow-sm'
                  : 'bg-[#E5E5EA] text-[#86868b] cursor-not-allowed'
                }
              `}
            >
              确认提交
            </button>
          </div>
        )}
      </div>
    );
  }

  // 检测文本中的归因数据
  const attributionMatches = onAttributionClick ? detectAttributionInText(processedContent) : [];
  
  // 如果有归因数据，渲染带归因按钮的文本
  if (attributionMatches.length > 0 && onAttributionClick) {
    return (
      <div className="relative">
        <TypewriterText
          content={processedContent}
          speed={15}
          delay={delay}
          isStreaming={isStreaming}
          onAgentSwitch={onAgentSwitch}
          attributionMatches={attributionMatches}
          onAttributionClick={onAttributionClick}
        />
      </div>
    );
  }
  
  // 普通文本，使用打字机效果 - 极致体验
  return (
    <div className="relative">
      <TypewriterText
        content={processedContent}
        speed={15} // 15ms每个字符，非常流畅
        delay={delay}
        isStreaming={isStreaming}
        onAgentSwitch={onAgentSwitch}
      />
    </div>
  );
};

// 渠道数据
export const ChannelDataDisplay = ({ 
  channels, 
  onAttributionClick 
}: { 
  channels: { name: string; percent: number; growth: number; isTop?: boolean }[];
  onAttributionClick?: (data: { metric: string; changeValue: number; changeDirection: 'up' | 'down'; changeType: '同比' | '环比'; triggerRect?: DOMRect }) => void;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  return (
    <div className="space-y-2.5">
      {channels.map((channel, index) => (
        <motion.div 
          key={channel.name} 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.2, delay: index * 0.05 }} 
          className={`flex items-center gap-3 p-3 rounded-lg border ${
            channel.isTop 
              ? 'bg-[#E8F3FF]/30 border-[#007AFF]/30' 
              : 'bg-white border-[#E5E5EA]'
          }`}
        >
          <div className={`w-6 h-6 rounded flex items-center justify-center text-[12px] font-bold ${
            channel.isTop 
              ? 'bg-[#007AFF] text-white' 
              : 'bg-[#F5F5F7] text-[#86868b]'
          }`}>
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <span className={`text-[14px] font-medium ${channel.isTop ? 'text-[#007AFF]' : 'text-[#1d1d1f]'}`}>
              {channel.name}
            </span>
            {channel.isTop && (
              <span className="ml-2 px-1.5 py-0.5 bg-[#007AFF]/10 text-[#007AFF] text-[10px] rounded font-medium">
                核心
              </span>
            )}
          </div>
          <div className={`text-[16px] font-bold font-mono ${channel.isTop ? 'text-[#007AFF]' : 'text-[#1d1d1f]'}`}>
            {channel.percent}%
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`text-[12px] font-medium min-w-[50px] text-right ${
              channel.growth > 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'
            }`}>
              {channel.growth > 0 ? '↑' : '↓'}{Math.abs(channel.growth)}%
            </div>
            {/* 归因按钮 */}
            {onAttributionClick && Math.abs(channel.growth) > 0 && (
              <div 
                className="relative group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    onAttributionClick({
                      metric: `${channel.name}销售额`,
                      changeValue: Math.abs(channel.growth),
                      changeDirection: channel.growth > 0 ? 'up' : 'down',
                      changeType: '同比', // 渠道数据通常是同比
                      triggerRect: rect
                    });
                  }}
                  className={clsx(
                    'h-5 px-1.5 rounded-md inline-flex items-center justify-center transition-all',
                    'text-[#007AFF] hover:text-white',
                    'bg-transparent hover:bg-[#007AFF]',
                    'border border-[#007AFF]/30 hover:border-[#007AFF]',
                    'active:scale-95',
                    'cursor-pointer',
                    'text-[10px] font-medium leading-none'
                  )}
                  aria-label="归因分析"
                >
                  归因
                </button>
                {/* 悬停提示 */}
                {hoveredIndex === index && (
                  <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-[#1d1d1f] text-white text-[11px] rounded whitespace-nowrap z-10">
                    想知道为何{channel.growth > 0 ? '涨' : '降'}了{Math.abs(channel.growth)}%？点击进行归因
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// 建议列表
// 支持两种格式：string[] 或 {id, text}[]
type SuggestionItem = string | { id: string; text: string };

export const SuggestionList = ({ suggestions }: { suggestions: SuggestionItem[] }) => {
  // 统一处理为文本
  const getText = (item: SuggestionItem): string => {
    if (typeof item === 'string') return item;
    return item.text || '';
  };
  
  const getKey = (item: SuggestionItem, index: number): string => {
    if (typeof item === 'string') return `sug-${index}`;
    return item.id || `sug-${index}`;
  };

  return (
    <div className="bg-[#F5F5F7] rounded-lg p-4 border border-[#E5E5EA]">
      <div className="font-bold text-[13px] text-[#1d1d1f] mb-3 flex items-center gap-2">
        <span className="w-1 h-3 bg-[#007AFF] rounded-full"></span>
        策略建议
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <motion.div 
            key={getKey(suggestion, index)} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.2, delay: index * 0.05 }} 
            className="flex items-start gap-3 bg-white rounded p-3 border border-[#E5E5EA]/50"
          >
            <div className="w-5 h-5 rounded-full bg-[#E8F3FF] text-[#007AFF] flex items-center justify-center text-[11px] font-bold flex-shrink-0">
              {index + 1}
            </div>
            <span className="text-[14px] text-[#1d1d1f] leading-relaxed flex-1">{getText(suggestion)}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// 关键指标高亮
export const HighlightMetric = ({ label, value, trend, unit }: { label: string; value: string | number; trend?: { value: number; direction: 'up' | 'down' }; unit?: string }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F7] rounded-md border border-[#E5E5EA]">
    <span className="text-[12px] text-[#86868b] font-medium">{label}:</span>
    <span className="font-bold text-[14px] text-[#1d1d1f]">{value}{unit}</span>
    {trend && (
      <span className={`text-[12px] font-medium ${trend.direction === 'up' ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
        {trend.direction === 'up' ? '↑' : '↓'}{trend.value}%
      </span>
    )}
  </div>
);

export default NarrativeText;
