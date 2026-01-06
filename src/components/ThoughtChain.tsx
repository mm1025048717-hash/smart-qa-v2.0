/**
 * 思维链组件 - 展示数字员工的思考过程
 * 参考 Ant Design X ThoughtChain 设计
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Loader2, CheckCircle2, XCircle, AlertCircle, Circle } from 'lucide-react';
import clsx from 'clsx';

// 打字机效果组件 - 用于描述文字逐步渲染
const TypewriterText = ({ 
  text, 
  delay = 0, 
  speed = 20,
  isStreaming = false 
}: { 
  text: string | React.ReactNode; 
  delay?: number;
  speed?: number;
  isStreaming?: boolean;
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  useEffect(() => {
    // 如果是 ReactNode，直接显示
    if (typeof text !== 'string') {
      setDisplayedText('');
      setIsComplete(true);
      return;
    }
    
    const textStr = text;
    if (!textStr) {
      setDisplayedText('');
      setIsComplete(true);
      return;
    }
    
    // 如果不在流式输出状态，立即显示全部内容
    if (!isStreaming) {
      setDisplayedText(textStr);
      setIsComplete(true);
      return;
    }
    
    // 在流式输出状态，使用打字机效果
    // 如果文本已经完整显示且没有变化，不重复渲染
    if (displayedText === textStr && displayedText.length === textStr.length) {
      setIsComplete(true);
      return;
    }
    
    // 如果新文本比当前显示的文本短，说明文本被替换了，重新开始
    if (textStr.length < displayedText.length) {
      setDisplayedText('');
      setIsComplete(false);
    }
    
    // 如果当前显示的文本长度小于新文本长度，继续打字机效果
    if (displayedText.length < textStr.length) {
      // 清除之前的定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // 延迟开始（只在第一次或重置后）
      const shouldDelay = displayedText.length === 0;
      const startDelay = shouldDelay ? delay : 0;
      
      const timeout = setTimeout(() => {
        let currentIndex = displayedText.length;
        
        const typeInterval = setInterval(() => {
          // 检查文本是否变化（可能在打字过程中文本更新了）
          const currentText = typeof text === 'string' ? text : '';
          if (currentIndex >= currentText.length) {
            setDisplayedText(currentText);
            setIsComplete(true);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return;
          }
          
          setDisplayedText(currentText.slice(0, currentIndex + 1));
          currentIndex++;
        }, speed);
        
        intervalRef.current = typeInterval;
      }, startDelay);
      
      return () => {
        clearTimeout(timeout);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [text, delay, speed, isStreaming]);
  
  // 如果是 ReactNode，直接返回
  if (typeof text !== 'string') {
    return <>{text}</>;
  }
  
  // 如果正在流式输出且未完成，显示光标
  const showCursor = isStreaming && !isComplete && displayedText.length < text.length;
  
  return (
    <span>
      {displayedText}
      {showCursor && (
        <span className="inline-block w-0.5 h-3.5 bg-[#007AFF] ml-0.5 animate-pulse" />
      )}
    </span>
  );
};

export interface ThoughtChainItem {
  key: string;                    // 唯一标识
  title: React.ReactNode;         // 标题
  description?: React.ReactNode;   // 描述
  content?: React.ReactNode;       // 内容（可折叠）
  footer?: React.ReactNode;        // 脚注
  icon?: React.ReactNode | false;  // 图标，false 时不显示
  status?: 'loading' | 'success' | 'error' | 'abort';  // 状态
  collapsible?: boolean;           // 是否可折叠
  blink?: boolean;                 // 闪动效果
  children?: ThoughtChainItem[];  // 子节点（嵌套）
}

export interface ThoughtChainProps {
  items: ThoughtChainItem[];
  defaultExpandedKeys?: string[];
  expandedKeys?: string[];
  onExpand?: (expandedKeys: string[]) => void;
  line?: boolean | 'solid' | 'dashed' | 'dotted';
  className?: string;
  isStreaming?: boolean; // 是否正在流式输出
}

// 默认图标（根据状态）
const getDefaultIcon = (status?: ThoughtChainItem['status']) => {
  switch (status) {
    case 'loading':
      return <Loader2 className="w-3.5 h-3.5 animate-spin text-[#007AFF]" />;
    case 'success':
      return <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />;
    case 'error':
      return <XCircle className="w-3.5 h-3.5 text-[#FF3B30]" />;
    case 'abort':
      return <AlertCircle className="w-3.5 h-3.5 text-[#86868b]" />;
    default:
      return <Circle className="w-3.5 h-3.5 text-[#007AFF] fill-[#007AFF]" />;
  }
};

// 线条样式（返回样式类名和类型）
const getLineStyle = (line?: ThoughtChainProps['line']): { className: string; type: string } => {
  if (line === false) return { className: '', type: 'none' };
  if (line === 'solid') return { className: 'bg-[#007AFF]', type: 'solid' };
  if (line === 'dotted') return { className: 'bg-[#007AFF]/30 border-dotted', type: 'dotted' };
  return { className: 'bg-[#007AFF]/30', type: 'dashed' }; // 默认 dashed
};

// 单个思维链节点
const ThoughtChainItemComponent = ({
  item,
  isExpanded,
  onToggle,
  lineStyleConfig,
  level = 0,
  index = 0, // 添加索引参数，用于控制打字机效果的延迟
  isStreaming = false, // 是否正在流式输出
}: {
  item: ThoughtChainItem;
  isExpanded: boolean;
  onToggle: () => void;
  lineStyleConfig: { className: string; type: string };
  level?: number;
  index?: number;
  isStreaming?: boolean;
}) => {
  const hasContent = item.content || (item.children && item.children.length > 0);
  const canCollapse = item.collapsible !== false && hasContent;
  
  // 图标
  const icon = item.icon === false ? null : (item.icon || getDefaultIcon(item.status));
  
  // 闪动效果 - 使用更平滑的动画，减少闪烁感
  const blinkClass = item.blink ? 'animate-[pulse_3s_ease-in-out_infinite]' : '';

  return (
    <div className="relative">
      {/* 连接线（仅子节点显示） */}
      {level > 0 && lineStyleConfig.type !== 'none' && (
        <div className={clsx(
          'absolute left-0 top-0 bottom-0 w-0.5',
          lineStyleConfig.className
        )} />
      )}

      <div className={clsx(
        'relative',
        level === 0 ? 'pl-0' : 'pl-6 ml-4'
      )}>
        {/* 主节点 */}
        <div
          className={clsx(
            'flex items-start gap-3 py-2 group',
            canCollapse && 'cursor-pointer hover:bg-white/60 rounded-lg px-2 -mx-2 transition-all duration-200 ease-out',
            level > 0 && 'bg-white/80 rounded-lg border border-[#007AFF]/10 px-3 py-2 shadow-sm'
          )}
          onClick={canCollapse ? onToggle : undefined}
        >
          {/* 图标 */}
          {icon && (
            <div className={clsx(
              'flex-shrink-0 mt-0.5',
              blinkClass
            )}>
              {icon}
            </div>
          )}

          {/* 内容区域 */}
          <div className="flex-1 min-w-0">
            {/* 标题和描述 */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className={clsx(
                  'text-[14px] font-medium text-[#1d1d1f]',
                  item.status === 'error' && 'text-[#FF3B30]',
                  item.status === 'success' && 'text-[#34C759]'
                )}>
                  {item.title}
                </div>
                {item.description && (
                  <div className="text-[12px] text-[#86868b] mt-0.5 leading-relaxed">
                    <TypewriterText 
                      text={item.description} 
                      delay={level === 0 ? index * 150 : 0} 
                      speed={12}
                      isStreaming={isStreaming && (item.status === 'loading' || item.blink)}
                    />
                  </div>
                )}
              </div>

              {/* 折叠按钮 */}
              {canCollapse && (
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#86868b] group-hover:text-[#007AFF] transition-all duration-200 ease-out" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#86868b] group-hover:text-[#007AFF] transition-all duration-200 ease-out" />
                  )}
                </div>
              )}
            </div>

            {/* 内容区域（可折叠） */}
            <AnimatePresence>
              {isExpanded && hasContent && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ 
                    duration: 0.25,
                    ease: [0.25, 0.1, 0.25, 1] // 平滑的缓动函数
                  }}
                  className="overflow-hidden mt-2"
                >
                  {/* 直接内容 */}
                  {item.content && (
                    <div className="text-[13px] text-[#646A73] leading-relaxed mb-2">
                      {item.content}
                    </div>
                  )}

                  {/* 子节点 */}
                  {item.children && item.children.length > 0 && (
                    <div className="space-y-1">
                      {item.children.map((child) => (
                        <ThoughtChainItemComponent
                          key={child.key}
                          item={child}
                          isExpanded={true} // 子节点默认展开
                          onToggle={() => {}}
                          lineStyleConfig={lineStyleConfig}
                          level={level + 1}
                          index={0} // 子节点不需要延迟
                          isStreaming={isStreaming}
                        />
                      ))}
                    </div>
                  )}

                  {/* 脚注 */}
                  {item.footer && (
                    <div className="mt-3 pt-3 border-t border-[#E5E5EA]">
                      {item.footer}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// 思维链主组件 - 支持动态更新
export const ThoughtChain = ({
  items,
  defaultExpandedKeys = [],
  expandedKeys: controlledExpandedKeys,
  onExpand,
  line = 'dashed',
  className = '',
  isStreaming = false,
}: ThoughtChainProps) => {
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<string[]>(defaultExpandedKeys);
  
  const expandedKeys = controlledExpandedKeys !== undefined 
    ? controlledExpandedKeys 
    : internalExpandedKeys;

  // 动态更新：当 items 变化时，自动展开当前 loading 的步骤（让用户看到动态过程）
  useEffect(() => {
    if (Array.isArray(items) && items.length > 0) {
      // 找到所有需要展开的步骤：
      // 1. 当前正在执行的步骤（status === 'loading' 且 blink === true）
      // 2. 已完成的步骤（status === 'success'）- 至少展开前几个
      // 3. 第一个步骤（理解问题）- 始终展开
      const loadingKeys = items
        .filter(item => item && (item.status === 'loading' || item.blink))
        .map(item => item.key);
      
      // 第一个步骤始终展开（理解问题）
      const firstKey = items[0]?.key;
      const successKeys = items
        .slice(0, 3) // 至少展开前3个已完成的步骤
        .filter(item => item && item.status === 'success')
        .map(item => item.key);
      
      const keysToExpand = [...new Set([
        ...(firstKey ? [firstKey] : []), // 第一个步骤
        ...successKeys, // 已完成的步骤
        ...loadingKeys, // 正在执行的步骤
      ])];
      
      if (keysToExpand.length > 0 && controlledExpandedKeys === undefined) {
        // 自动展开相关步骤，确保用户能看到动态过程
        const newExpandedKeys = [...new Set([...internalExpandedKeys, ...keysToExpand])];
        if (newExpandedKeys.length !== internalExpandedKeys.length || 
            newExpandedKeys.some(k => !internalExpandedKeys.includes(k))) {
          setInternalExpandedKeys(newExpandedKeys);
        }
      }
    }
  }, [items, controlledExpandedKeys, internalExpandedKeys]); // 当 items 变化时触发

  const handleToggle = (key: string) => {
    const newExpandedKeys = expandedKeys.includes(key)
      ? expandedKeys.filter(k => k !== key)
      : [...expandedKeys, key];
    
    if (controlledExpandedKeys === undefined) {
      setInternalExpandedKeys(newExpandedKeys);
    }
    
    onExpand?.(newExpandedKeys);
  };

  const lineStyleConfig = getLineStyle(line);
  
  // 检查 items 是否有效（更严格的验证，避免空白框）
  if (!Array.isArray(items) || items.length === 0) {
    return null; // 不渲染空白框
  }
  
  // 再次验证每个 item 的有效性
  const validItems = items.filter(item => 
    item && 
    typeof item === 'object' && 
    item.key && 
    typeof item.key === 'string' &&
    item.key.trim() !== '' &&
    item.title !== undefined && 
    item.title !== null &&
    (typeof item.title === 'string' ? item.title.trim() !== '' : true)
  );
  
  if (validItems.length === 0) {
    return null; // 没有有效 items，不渲染空白框
  }
  
  // 动态更新：自动展开当前 loading 的步骤（让用户看到动态过程）
  const loadingKeys = validItems
    .filter(item => item.status === 'loading' || item.blink)
    .map(item => item.key);
  const finalExpandedKeys = [...new Set([...expandedKeys, ...loadingKeys])];

  return (
    <div className={clsx('thought-chain', className)}>
      <div className="space-y-1">
        {validItems.map((item, index) => {
          return (
            <ThoughtChainItemComponent
              key={item.key}
              item={item}
              isExpanded={finalExpandedKeys.includes(item.key)}
              onToggle={() => handleToggle(item.key)}
              lineStyleConfig={lineStyleConfig}
              level={0}
              index={index} // 传递索引，用于控制打字机效果的延迟
              isStreaming={isStreaming} // 传递流式输出状态
            />
          );
        })}
      </div>
    </div>
  );
};

export default ThoughtChain;
