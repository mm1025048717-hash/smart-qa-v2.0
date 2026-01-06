/**
 * 工具调用链组件 - 类似思维链的设计
 * 展示工具调用的执行过程和状态
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, FileText, BarChart3, TrendingUp, Users, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';

export interface ToolCallItem {
  id: string;
  toolName: string;
  toolDisplayName: string;
  status: 'loading' | 'success' | 'error';
  arguments?: Record<string, any>;
  result?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
  icon?: React.ReactNode;
}

export interface ToolCallChainProps {
  items: ToolCallItem[];
  defaultExpandedKeys?: string[];
  expandedKeys?: string[];
  onExpand?: (keys: string[]) => void;
  className?: string;
  isStreaming?: boolean;
}

// 工具图标映射
const TOOL_ICONS: Record<string, React.ReactNode> = {
  generate_ppt: <FileText className="w-4 h-4" />,
  generate_report: <FileText className="w-4 h-4" />,
  analyze_data_trend: <TrendingUp className="w-4 h-4" />,
  compare_competitors: <Users className="w-4 h-4" />,
  generate_dashboard: <LayoutDashboard className="w-4 h-4" />,
};

// 工具显示名称映射
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  generate_ppt: '生成PPT演示文稿',
  generate_report: '生成数据分析报告',
  analyze_data_trend: '分析数据趋势',
  compare_competitors: '对比竞品数据',
  generate_dashboard: '生成数据看板',
};

// 单个工具调用项组件
const ToolCallItemComponent = ({
  item,
  isExpanded,
  onToggle,
  index,
  isStreaming,
}: {
  item: ToolCallItem;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
  isStreaming: boolean;
}) => {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);

  useEffect(() => {
    setLocalExpanded(isExpanded);
  }, [isExpanded]);

  const handleToggle = () => {
    setLocalExpanded(!localExpanded);
    onToggle();
  };

  // 状态图标和颜色
  const getStatusConfig = () => {
    switch (item.status) {
      case 'loading':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
        };
      case 'error':
        return {
          icon: <XCircle className="w-4 h-4 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
        };
      default:
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin text-gray-400" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const toolIcon = TOOL_ICONS[item.toolName] || <BarChart3 className="w-4 h-4" />;

  // 计算执行时间
  const getDuration = () => {
    if (item.startTime && item.endTime) {
      const duration = item.endTime - item.startTime;
      return duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(1)}s`;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.2 }}
      className={clsx(
        'relative rounded-lg border transition-all duration-200',
        statusConfig.bgColor,
        statusConfig.borderColor,
        item.status === 'loading' && 'shadow-sm',
        item.status === 'success' && 'shadow-sm',
        item.status === 'error' && 'shadow-sm'
      )}
    >
      {/* 主内容区域 */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-opacity-80 transition-colors"
        onClick={handleToggle}
      >
        {/* 状态图标 */}
        <div className="flex-shrink-0 mt-0.5">
          {statusConfig.icon}
        </div>

        {/* 工具图标和名称 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0 text-gray-500">
            {toolIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className={clsx('font-medium text-sm', statusConfig.textColor)}>
              {item.toolDisplayName || TOOL_DISPLAY_NAMES[item.toolName] || item.toolName}
            </div>
            {item.status === 'loading' && (
              <div className="text-xs text-gray-500 mt-0.5">正在执行...</div>
            )}
            {item.status === 'success' && getDuration() && (
              <div className="text-xs text-gray-500 mt-0.5">执行完成 ({getDuration()})</div>
            )}
            {item.status === 'error' && (
              <div className="text-xs text-red-600 mt-0.5">执行失败</div>
            )}
          </div>
        </div>

        {/* 展开/收起按钮 */}
        {(item.arguments || item.result || item.error) && (
          <button
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
          >
            <motion.svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ rotate: localExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
        )}
      </div>

      {/* 展开内容 */}
      <AnimatePresence>
        {localExpanded && (item.arguments || item.result || item.error) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-gray-200 bg-white/50">
              {/* 参数信息 - 优化显示格式 */}
              {item.arguments && Object.keys(item.arguments).length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">调用参数</div>
                  <div className="bg-gray-50 rounded-md p-3 text-xs text-gray-700 space-y-2">
                    {item.arguments.title && (
                      <div>
                        <span className="font-medium">标题：</span>
                        <span>{item.arguments.title}</span>
                      </div>
                    )}
                    {item.arguments.theme && (
                      <div>
                        <span className="font-medium">主题：</span>
                        <span>{item.arguments.theme}</span>
                      </div>
                    )}
                    {item.arguments.data_summary && (
                      <div>
                        <span className="font-medium">数据摘要：</span>
                        <div className="mt-1 pl-2 border-l-2 border-gray-300 whitespace-pre-wrap break-words">
                          {item.arguments.data_summary}
                        </div>
                      </div>
                    )}
                    {item.arguments.business_insight && (
                      <div>
                        <span className="font-medium">业务洞察：</span>
                        <div className="mt-1 pl-2 border-l-2 border-gray-300 whitespace-pre-wrap break-words">
                          {item.arguments.business_insight}
                        </div>
                      </div>
                    )}
                    {item.arguments.sections && (
                      <div>
                        <span className="font-medium">章节：</span>
                        <div className="mt-1">
                          {Array.isArray(item.arguments.sections) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {item.arguments.sections.map((section: string, idx: number) => (
                                <li key={idx}>{section}</li>
                              ))}
                            </ul>
                          ) : (
                            <span>{item.arguments.sections}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {/* 其他参数用JSON格式显示 */}
                    {Object.keys(item.arguments).filter(key => 
                      !['title', 'theme', 'data_summary', 'business_insight', 'sections'].includes(key)
                    ).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <div className="font-medium mb-1">其他参数：</div>
                        <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                          {JSON.stringify(
                            Object.fromEntries(
                              Object.entries(item.arguments).filter(([key]) => 
                                !['title', 'theme', 'data_summary', 'business_insight', 'sections'].includes(key)
                              )
                            ),
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 执行结果 */}
              {item.result && (
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">执行结果</div>
                  <div className="bg-green-50 rounded-md p-3 text-xs">
                    {item.result.message && (
                      <div className="text-green-700 mb-2">{item.result.message}</div>
                    )}
                    {item.result.ppt && (
                      <div className="text-gray-700 space-y-3">
                        <div className="font-medium mb-2 text-base">PPT生成成功</div>
                        <div className="bg-white rounded-md p-3 border border-gray-200">
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium">标题：</span>
                              <span className="ml-1">{item.result.ppt.title}</span>
                            </div>
                            <div>
                              <span className="font-medium">主题：</span>
                              <span className="ml-1">{item.result.ppt.theme}</span>
                            </div>
                            <div>
                              <span className="font-medium">页数：</span>
                              <span className="ml-1">{item.result.ppt.slides?.length || 0}页</span>
                            </div>
                          </div>
                        </div>
                        {item.result.ppt.slides && item.result.ppt.slides.length > 0 && (
                          <div>
                            <div className="font-medium mb-2">PPT章节结构：</div>
                            <div className="bg-white rounded-md p-3 border border-gray-200">
                              <ol className="list-decimal list-inside space-y-1">
                                {item.result.ppt.slides.map((slide: any, idx: number) => (
                                  <li key={idx} className="text-sm">
                                    <span className="font-medium">{slide.title}</span>
                                    {slide.content && (
                                      <div className="mt-1 ml-4 text-xs text-gray-600 line-clamp-2">
                                        {typeof slide.content === 'string' 
                                          ? slide.content.substring(0, 100) + (slide.content.length > 100 ? '...' : '')
                                          : JSON.stringify(slide.content).substring(0, 100) + '...'
                                        }
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        )}
                        {item.result.ppt.summary && (
                          <div className="bg-blue-50 rounded-md p-2 text-xs text-blue-700">
                            {item.result.ppt.summary}
                          </div>
                        )}
                      </div>
                    )}
                    {item.result.report && (
                      <div className="text-gray-700">
                        <div className="font-medium mb-1">报告信息：</div>
                        <div className="pl-2">
                          <div>类型：{item.result.report.type}</div>
                          <div>时间周期：{item.result.report.timePeriod}</div>
                        </div>
                      </div>
                    )}
                    {item.result.analysis && (
                      <div className="text-gray-700">
                        <div className="font-medium mb-1">分析结果：</div>
                        <div className="pl-2">
                          <div>指标：{item.result.analysis.metric}</div>
                          <div>趋势：{item.result.analysis.trend}</div>
                          <div>增长率：{item.result.analysis.growthRate}</div>
                        </div>
                      </div>
                    )}
                    {item.result.comparison && (
                      <div className="text-gray-700">
                        <div className="font-medium mb-1">对比结果：</div>
                        <div className="pl-2">
                          <div>竞争对手：{item.result.comparison.competitor}</div>
                          <div>对比维度：{item.result.comparison.dimension}</div>
                        </div>
                      </div>
                    )}
                    {item.result.dashboard && (
                      <div className="text-gray-700">
                        <div className="font-medium mb-1">看板信息：</div>
                        <div className="pl-2">
                          <div>类型：{item.result.dashboard.type}</div>
                          <div>指标数：{item.result.dashboard.metrics?.length || 0}个</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 错误信息 */}
              {item.error && (
                <div className="mt-3">
                  <div className="text-xs font-medium text-red-500 mb-2">错误信息</div>
                  <div className="bg-red-50 rounded-md p-3 text-xs text-red-700">
                    {item.error}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 工具调用链主组件
export const ToolCallChain = ({
  items,
  defaultExpandedKeys = [],
  expandedKeys: controlledExpandedKeys,
  onExpand,
  className = '',
  isStreaming = false,
}: ToolCallChainProps) => {
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<string[]>(defaultExpandedKeys);

  const expandedKeys = controlledExpandedKeys !== undefined
    ? controlledExpandedKeys
    : internalExpandedKeys;

  // 自动展开当前 loading 的工具调用
  useEffect(() => {
    if (Array.isArray(items) && items.length > 0) {
      const loadingKeys = items
        .filter(item => item && item.status === 'loading')
        .map(item => item.id);

      const successKeys = items
        .slice(0, 2) // 至少展开前2个已完成的工具调用
        .filter(item => item && item.status === 'success')
        .map(item => item.id);

      const keysToExpand = [...new Set([
        ...successKeys,
        ...loadingKeys,
      ])];

      if (keysToExpand.length > 0 && controlledExpandedKeys === undefined) {
        const newExpandedKeys = [...new Set([...internalExpandedKeys, ...keysToExpand])];
        if (newExpandedKeys.length !== internalExpandedKeys.length) {
          setInternalExpandedKeys(newExpandedKeys);
        }
      }
    }
  }, [items, controlledExpandedKeys, internalExpandedKeys]);

  const handleToggle = (key: string) => {
    const newExpandedKeys = expandedKeys.includes(key)
      ? expandedKeys.filter(k => k !== key)
      : [...expandedKeys, key];

    if (controlledExpandedKeys === undefined) {
      setInternalExpandedKeys(newExpandedKeys);
    }

    onExpand?.(newExpandedKeys);
  };

  // 检查 items 是否有效
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  // 验证每个 item 的有效性
  const validItems = items.filter(item =>
    item &&
    typeof item === 'object' &&
    item.id &&
    typeof item.id === 'string' &&
    item.id.trim() !== '' &&
    item.toolName &&
    typeof item.toolName === 'string' &&
    item.toolName.trim() !== ''
  );

  if (validItems.length === 0) {
    return null;
  }

  // 自动展开当前 loading 的工具调用
  const loadingKeys = validItems
    .filter(item => item.status === 'loading')
    .map(item => item.id);
  const finalExpandedKeys = [...new Set([...expandedKeys, ...loadingKeys])];

  return (
    <div className={clsx('tool-call-chain', className)}>
      <div className="space-y-2">
        {validItems.map((item, index) => (
          <ToolCallItemComponent
            key={item.id}
            item={item}
            isExpanded={finalExpandedKeys.includes(item.id)}
            onToggle={() => handleToggle(item.id)}
            index={index}
            isStreaming={isStreaming}
          />
        ))}
      </div>
    </div>
  );
};

export default ToolCallChain;

