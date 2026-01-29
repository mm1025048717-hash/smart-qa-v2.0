/**
 * 消息气泡组件 - 蓝白简约设计
 * Apple/飞书风格
 */

import React, { useCallback, useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Save, Download, Share2, ChevronRight, ArrowRight, MoreVertical, Star, RefreshCw, Target, X } from 'lucide-react';
import { Message, ContentBlock, KPIData } from '../types';
import { PrimaryKPICard, KPIGroup } from './KPICard';
import { GanttChart } from './GanttChart';
import { 
  LineChartComponent, 
  BarChartComponent, 
  PieChartComponent, 
  YearComparisonChart,
  ScatterChartComponent,
  FunnelChartComponent,
  BoxPlotComponent,
  MapChartComponent,
  QuadrantChartComponent,
  SmartChart,
} from './Charts';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ActionButtonGroup } from './ActionButtons';
import { NarrativeText, ChannelDataDisplay, SuggestionList } from './NarrativeText';
import { AttributionPanel, AttributionData, generateMockAttributionData } from './AttributionPanel';
import {
  ReportTitle,
  QuoteParagraph,
  StructuredListItem,
  CompareCardLight,
  DataPreviewCardLight,
  QuoteBox,
  InsightBox,
  Divider,
  ActionBar,
  Section,
  RegionCards,
  MetricsPreviewCard,
  AnalystQuote,
  ReportHeroCard,
  ReportLayerCard,
  CalloutCard,
  StrategyCard,
} from './StoryComponents';
import { DataVisualizer, FilterCondition } from './DataVisualizer';
import clsx from 'clsx';
import { getAgentById } from '../services/agents/index';
import { ThoughtChain, ThoughtChainItem } from './ThoughtChain';
import { ToolCallChain, ToolCallItem } from './ToolCallChain';
import { MessageRating } from './MessageRating';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { DrillDownSidePanel, DrillDownData } from './DrillDownSidePanel';
import { WorkflowExecution, WorkflowExecutionData } from './WorkflowExecution';
import { EmptyStateCard, InfoBanner, RecommendationFilterCard } from './EmptyStateCard';
import { QueryConfirmationBubble } from './QueryConfirmationBubble';
import { AmbiguousSelectionBubble } from './AmbiguousSelectionBubble';
import { QueryDimensions } from '../services/queryParser';

// 【已移除】generateDrillDownQuery 函数未使用，已删除
// 如需使用，请参考 NarrativeText.tsx 中的实现

// 更多操作下拉菜单组件
const MoreActionsMenu = ({ 
  actions, 
  onAction,
  onClose 
}: { 
  actions: { id: string; label: string; danger?: boolean }[];
  onAction?: (action: string) => void;
  onClose: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        onClose();
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          'text-[#86868b] hover:text-[#007AFF]',
          'hover:bg-[#007AFF]/5',
          'transition-colors',
          'border border-transparent hover:border-[#007AFF]/20',
          open && 'text-[#007AFF] bg-[#007AFF]/5 border-[#007AFF]/20'
        )}
        title="更多"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && actions.length > 0 && (
        <div 
          className="absolute top-full right-0 mt-1 rounded-lg border border-[#d2d2d7] min-w-[120px] py-1 max-h-[200px] overflow-y-auto"
          style={{ 
            zIndex: 1002,
            backgroundColor: '#ffffff',
          }}
        >
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => { 
                onAction?.(action.id);
                setOpen(false);
                onClose();
              }}
              className={clsx(
                'w-full px-3 py-1.5 text-left text-[13px]',
                action.danger
                  ? 'text-[#FF3B30] hover:bg-[#FFF5F5]'
                  : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
  onActionSelect?: (query: string) => void;
  onFilterChange?: (conditions: FilterCondition[], changedType?: string, changedValue?: string) => void;
  onAgentSwitch?: (agentName: string) => void;
  isSearching?: boolean; // 是否正在联网搜索
  onAppendContent?: (blocks: ContentBlock[]) => void; // 用于在当前消息中追加内容
}

// 用户消息 - 蓝色气泡
const UserBubble = ({ content }: { content: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
    className="flex justify-end mb-6"
  >
    <div className="message-user">
      {content}
    </div>
  </motion.div>
);

// 加载状态 - 蓝色动画，支持搜索提示
const LoadingIndicator = ({ isSearching = false }: { isSearching?: boolean }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-3 ml-12 mb-6"
  >
    <div className="bg-white px-5 py-4 rounded-2xl border border-[#E5E5EA] shadow-sm flex items-center gap-3">
      <div className="loading-dots">
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
      {isSearching ? (
        <div className="flex items-center gap-2">
          <svg 
            className="w-4 h-4 text-[#007AFF]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[13px] text-[#86868b]">正在搜索网页...</span>
        </div>
      ) : (
        <span className="text-[13px] text-[#86868b]">正在分析...</span>
      )}
    </div>
  </motion.div>
);

// 图表和表格类型的 memo 组件，确保数据不变时不重新渲染
const MemoizedChart = memo(({ 
  chartData, 
  delay = 0,
  onActionSelect,
  blockData,
  onAddToDashboard,
}: { 
  chartData: any;
  delay?: number;
  onActionSelect?: (query: string) => void;
  blockData?: ContentBlock;
  onAddToDashboard?: (block: ContentBlock) => void;
}) => {
  // 数据验证 - 放宽验证条件
  if (!chartData) {
    console.warn('Chart block has no data');
    return null;
  }
  
  // 放宽数据验证 - 让 SmartChart 组件自己处理数据验证
  // 如果 data 字段存在但为空，仍然尝试渲染（可能是其他格式的数据）
  if (chartData.data !== undefined) {
    if (Array.isArray(chartData.data) && chartData.data.length === 0) {
      // 空数组，显示警告但允许渲染
      console.warn('Chart data is empty array:', chartData);
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, delay }}
      className="my-0"
    >
      <SmartChart 
        chartData={chartData} 
        delay={delay}
        onDrillDown={(data) => {
          const drillQuery = `详细分析${JSON.stringify(data)}的数据`;
          onActionSelect?.(drillQuery);
        }}
        blockData={blockData}
        onAddToDashboard={onAddToDashboard}
      />
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // 只比较图表数据的关键字段
  const prevData = prevProps.chartData;
  const nextData = nextProps.chartData;
  
  if (prevData === nextData) return true;
  if (!prevData || !nextData) return false;
  
  // 比较图表类型
  if (prevData.type !== nextData.type) return false;
  
  // 比较数据数组的长度和关键内容
  if (prevData.data && nextData.data) {
    if (Array.isArray(prevData.data) && Array.isArray(nextData.data)) {
      if (prevData.data.length !== nextData.data.length) return false;
      // 比较前几个数据点
      const compareLength = Math.min(prevData.data.length, 5);
      for (let i = 0; i < compareLength; i++) {
        if (JSON.stringify(prevData.data[i]) !== JSON.stringify(nextData.data[i])) {
          return false;
        }
      }
      return true;
    }
  }
  
  return JSON.stringify(prevData) === JSON.stringify(nextData);
});

// 表格行组件 - 支持下钻
const TableRow = ({ 
  row, 
  headers,
  onAgentSwitch,
  isEven,
  onDrillDown,
}: { 
  row: string[] | { 
    cells: string[]; 
    children?: Array<{ cells: string[] }>; 
    drillDown?: {
      type?: 'button' | 'hover' | 'text';
      count?: number;
      label?: string;
    };
  };
  headers: string[];
  onAgentSwitch?: (agentName: string) => void;
  isEven: boolean;
  onDrillDown?: (rowData: any) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cells = Array.isArray(row) ? row : row.cells;
  const children = Array.isArray(row) ? undefined : row.children;
  const drillDownConfig = Array.isArray(row) ? undefined : row.drillDown;
  const hasChildren = children && children.length > 0;
  const hasDrillDown = drillDownConfig !== undefined;

  const handleDrillDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDrillDown && onDrillDown) {
      onDrillDown(row);
    } else if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const renderDrillDownButton = () => {
    if (!hasDrillDown) return null;

    const config = drillDownConfig || { type: 'text' };
    const label = config.label || '查看详情';

    // 只保留文字按钮样式
    return (
      <button
        onClick={handleDrillDown}
        className="inline-flex items-center gap-1 text-[13px] text-[#007AFF] hover:text-[#0051D5] transition-colors"
      >
        <span>{label}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    );
  };

  return (
    <>
      <tr 
        className={clsx(
          isEven ? 'bg-white' : 'bg-[#F8FAFC]',
          (hasChildren || hasDrillDown) ? 'hover:bg-[#EFF6FF]' : '',
          'transition-colors duration-150 relative group',
          hasChildren && !hasDrillDown && 'cursor-pointer'
        )}
        onClick={() => hasChildren && !hasDrillDown && setIsExpanded(!isExpanded)}
      >
        {cells.map((cell, cellIndex) => (
          <td 
            key={cellIndex} 
            className="px-5 py-3 text-[#374151] leading-relaxed relative"
          >
            <div className="flex items-center gap-2">
              {cellIndex === 0 && hasChildren && !hasDrillDown && (
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[#007AFF]"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              )}
              <MarkdownRenderer content={cell} onAgentSwitch={onAgentSwitch} />
            </div>
          </td>
        ))}
        {/* 下钻按钮 - 显示在最后一列 */}
        {hasDrillDown && (
          <td className="px-5 py-3 text-right">
            {renderDrillDownButton()}
          </td>
        )}
      </tr>
      
      {/* 子行数据 */}
      {hasChildren && (
        <AnimatePresence>
          {isExpanded && (
            <motion.tr
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#F8FAFC]"
            >
              <td colSpan={headers.length} className="px-5 py-0">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pl-8 py-2"
                >
                  <table className="w-full text-[14px]">
                    <tbody className="divide-y divide-[#E8E8ED]">
                      {children!.map((childRow, childIndex) => (
                        <tr 
                          key={childIndex}
                          className={clsx(
                            childIndex % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]',
                            'hover:bg-[#EFF6FF] transition-colors duration-150'
                          )}
                        >
                          {childRow.cells.map((cell, cellIndex) => (
                            <td 
                              key={cellIndex} 
                              className="px-5 py-3 text-[#374151] leading-relaxed"
                            >
                              <MarkdownRenderer content={cell} onAgentSwitch={onAgentSwitch} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              </td>
            </motion.tr>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

const MemoizedTable = memo(({ 
  tableData, 
  delay = 0,
  onAgentSwitch,
  onDrillDown,
}: { 
  tableData: { headers: string[]; rows: Array<string[] | { cells: string[]; children?: Array<{ cells: string[] }>; drillDown?: { type?: 'button' | 'hover' | 'text'; count?: number; label?: string } }> };
  delay?: number;
  onAgentSwitch?: (agentName: string) => void;
  onDrillDown?: (rowData: any) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, delay }}
      className="my-2"
    >
      <div className="overflow-x-auto rounded-lg border border-[#E5E5EA]">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-[#1a73e8] text-white">
              {tableData.headers.map((header, i) => (
                <th 
                  key={i} 
                  className="px-5 py-3 text-left font-medium first:rounded-tl-lg last:rounded-tr-lg"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8ED]">
            {tableData.rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                row={row}
                headers={tableData.headers}
                onAgentSwitch={onAgentSwitch}
                isEven={rowIndex % 2 === 0}
                onDrillDown={onDrillDown}
              />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // 只比较表格数据的关键字段
  const prevData = prevProps.tableData;
  const nextData = nextProps.tableData;
  
  if (prevData === nextData) return true;
  if (!prevData || !nextData) return false;
  
  // 比较 headers
  if (JSON.stringify(prevData.headers) !== JSON.stringify(nextData.headers)) {
    return false;
  }
  
  // 比较 rows 的长度和前几行
  if (prevData.rows && nextData.rows) {
    if (prevData.rows.length !== nextData.rows.length) {
      return false;
    }
    // 比较前几行
    const compareLength = Math.min(prevData.rows.length, 3);
    for (let i = 0; i < compareLength; i++) {
      if (JSON.stringify(prevData.rows[i]) !== JSON.stringify(nextData.rows[i])) {
        return false;
      }
    }
    return true;
  }
  
  return JSON.stringify(prevData) === JSON.stringify(nextData);
});

// 使用 memo 优化，避免不必要的重新渲染
const ContentBlockRenderer = memo(({ 
  block, 
  onActionSelect,
  onFilterApply,
  onAgentSwitch,
  isStreaming = false,
  onDrillDown,
  onAttributionClick,
  onAddToDashboard,
}: { 
  block: ContentBlock; 
  onActionSelect?: (query: string) => void;
  onFilterApply?: (conditions: FilterCondition[], changedType?: string, changedValue?: string) => void;
  onAgentSwitch?: (agentName: string) => void;
  isStreaming?: boolean;
  onDrillDown?: (rowData: any, headers: string[]) => void;
  onAttributionClick?: (data: { metric: string; changeValue: number; changeDirection: 'up' | 'down'; changeType: '同比' | '环比'; triggerRect?: DOMRect }) => void;
  onAddToDashboard?: (block: ContentBlock) => void;
}) => {
  const delay = 0; // 移除延迟，立即显示

  switch (block.type) {
    case 'text': {
      // 确保 content 是字符串，处理可能的对象
      let textContent: string;
      if (typeof block.data === 'string') {
        textContent = block.data;
      } else if (block.data && typeof block.data === 'object') {
        // 如果是对象，尝试提取有意义的内容或转换为字符串
        if (block.data && 'text' in block.data) {
          textContent = String(block.data.text || '');
        } else if (block.data && 'content' in block.data) {
          textContent = String(block.data.content || '');
        } else {
          textContent = JSON.stringify(block.data);
        }
        // 清理 [object Object]
        textContent = textContent.replace(/\[object Object\]/g, '').trim();
      } else {
        textContent = String(block.data || '');
      }
      // 再次清理，确保没有残留的对象字符串
      textContent = textContent.replace(/\[object Object\]/g, '').trim();
      if (!textContent) return null;
      return <NarrativeText content={textContent} delay={delay} onInteraction={onActionSelect} onAgentSwitch={onAgentSwitch} isStreaming={isStreaming} onAttributionClick={onAttributionClick} />;
    }
    case 'heading':
      return (
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay, duration: 0.15 }}
          className="text-[16px] font-bold text-[#1d1d1f] mt-4 mb-3"
        >
          {block.data as string}
        </motion.h3>
      );
    case 'kpi': {
      const kpiData = block.data as KPIData;
      // 提取数据量信息（如果block中有metadata）
      const metadata = (block as any).metadata;
      return (
        <PrimaryKPICard 
          data={kpiData} 
          delay={delay}
          dataPoints={metadata?.dataPoints}
          timeRange={metadata?.timeRange}
          queryContext={metadata?.queryContext}
          onActionClick={(action) => {
            // 处理空状态操作
            if (action === 'modify-query') {
              onActionSelect?.('修改查询条件');
            } else if (action === 'refresh') {
              onActionSelect?.('刷新数据');
            } else if (action === 'contact-admin') {
              onActionSelect?.('联系管理员');
            } else if (action === 'check-connection') {
              onActionSelect?.('检查连接');
            }
          }}
          onAttributionClick={onAttributionClick}
          blockData={block}
          onAddToDashboard={onAddToDashboard}
        />
      );
    }
    case 'kpi-group': return <KPIGroup items={block.data as KPIData[]} delay={delay} onAttributionClick={onAttributionClick} blockData={block} onAddToDashboard={onAddToDashboard} />;
    case 'gantt': {
      const ganttData = block.data as { title?: string; data: any[] };
      return <GanttChart title={ganttData.title} data={ganttData.data} delay={delay} />;
    }
    
    case 'year-comparison': {
      // 年度趋势对比图 - 独立类型
      const chartData = block.data as any;
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.3 }}
        >
          <YearComparisonChart {...chartData} delay={0} onAttributionClick={onAttributionClick} blockData={block} onAddToDashboard={onAddToDashboard} />
        </motion.div>
      );
    }
    case 'line-chart': {
      const chartData = block.data as any;
      if (chartData.type === 'year-comparison') {
        return <YearComparisonChart {...chartData} delay={delay} onAttributionClick={onAttributionClick} blockData={block} onAddToDashboard={onAddToDashboard} />;
      }
      // LineChartComponent 不支持 onDrillDown，移除该属性
      return <LineChartComponent {...chartData} delay={delay} blockData={block} onAddToDashboard={onAddToDashboard} />;
    }
    case 'bar-chart': 
      // BarChartComponent 不支持 onDrillDown，移除该属性
      return <BarChartComponent {...(block.data as any)} delay={delay} blockData={block} onAddToDashboard={onAddToDashboard} />;
    case 'pie-chart': return <PieChartComponent {...(block.data as any)} delay={delay} blockData={block} onAddToDashboard={onAddToDashboard} />;
    case 'scatter-chart': return <ScatterChartComponent {...(block.data as any)} delay={delay} blockData={block} onAddToDashboard={onAddToDashboard} />;
    case 'funnel-chart': return <FunnelChartComponent {...(block.data as any)} delay={delay} blockData={block} onAddToDashboard={onAddToDashboard} />;
    case 'box-plot': return <BoxPlotComponent {...(block.data as any)} delay={delay} blockData={block} onAddToDashboard={onAddToDashboard} />;
    case 'map-chart': return <MapChartComponent {...(block.data as any)} delay={delay} blockData={block} onAddToDashboard={onAddToDashboard} />;
    case 'quadrant-chart': return <QuadrantChartComponent {...(block.data as any)} delay={delay} blockData={block} onAddToDashboard={onAddToDashboard} />;
    
    case 'table': {
      const tableData = block.data as { headers: string[]; rows: Array<string[] | { cells: string[]; children?: Array<{ cells: string[] }>; drillDown?: { type?: 'button' | 'hover' | 'text'; count?: number; label?: string } }> };
      return (
        <MemoizedTable 
          tableData={tableData} 
          delay={delay} 
          onAgentSwitch={onAgentSwitch}
          onDrillDown={(rowData) => {
            onDrillDown?.(rowData, tableData.headers);
          }}
        />
      );
    }
    case 'chart': {
      const chartData = block.data as any;
      return <MemoizedChart chartData={chartData} delay={delay} onActionSelect={onActionSelect} />;
    }
    case 'channel-data': return <ChannelDataDisplay channels={(block.data as any).channels} onAttributionClick={onAttributionClick} />;
    case 'suggestions': return <SuggestionList suggestions={(block.data as any).items} />;
    
    case 'report-title': return <ReportTitle {...(block.data as any)} delay={delay} />;
    case 'quote-paragraph': return <QuoteParagraph {...(block.data as any)} delay={delay} />;
    case 'structured-list': 
      return (
        <div className="space-y-2">
          {(block.data as any).items.map((item: any, i: number) => (
            <StructuredListItem key={i} {...item} index={i} delay={delay + i * 0.03} />
          ))}
        </div>
      );
    case 'compare-card': return <CompareCardLight items={(block.data as any).items} delay={delay} />;
    case 'data-preview': return <DataPreviewCardLight {...(block.data as any)} delay={delay} />;
    case 'quote-box': return <QuoteBox {...(block.data as any)} delay={delay} />;
    case 'insight-box': return <InsightBox {...(block.data as any)} delay={delay} />;
    case 'divider': return <Divider />;
    case 'action-bar': return <ActionBar />;
    case 'section': {
      const sectionData = block.data;
      if (typeof sectionData === 'string') {
        return <Section title={sectionData} delay={delay} />;
      }
      return <Section {...(sectionData as any)} delay={delay} />;
    }
    case 'region-cards': return <RegionCards items={block.data as any} delay={delay} />;
    case 'metrics-preview': return <MetricsPreviewCard {...(block.data as any)} delay={delay} />;
    case 'analyst-quote': return <AnalystQuote {...(block.data as any)} delay={delay} />;
    case 'report-hero': return <ReportHeroCard {...(block.data as any)} delay={delay} />;
    case 'report-layer': return <ReportLayerCard {...(block.data as any)} delay={delay} />;
    case 'callout-card': return <CalloutCard {...(block.data as any)} delay={delay} />;
    case 'strategy-card': return <StrategyCard {...(block.data as any)} delay={delay} />;
    case 'workflow-execution': {
      const workflowData = block.data as WorkflowExecutionData;
      return <WorkflowExecution data={workflowData} delay={delay} />;
    }
    
    case 'thought-chain': {
      const thoughtChainItems = block.data as ThoughtChainItem[];
      
      // 严格检查数据有效性：如果 items 为空或无效，立即返回 null（避免空白框）
      if (!Array.isArray(thoughtChainItems) || thoughtChainItems.length === 0) {
        return null; // 不渲染空白框
      }
      
      // 验证每个 item 是否有必要的字段（key 和 title 是必需的，title 可以是字符串或 ReactNode）
      const validItems = thoughtChainItems.filter(item => {
        if (!item || typeof item !== 'object') return false;
        if (!item.key || typeof item.key !== 'string' || item.key.trim() === '') return false;
        if (item.title === undefined || item.title === null) return false;
        // title 可以是字符串或 ReactNode，如果是字符串则不能为空
        if (typeof item.title === 'string' && item.title.trim() === '') return false;
        return true;
      });
      
      // 如果没有有效的 items，不渲染（避免空白框）
      if (validItems.length === 0) {
        return null; // 不渲染空白框
      }
      
      // 自动展开当前 loading 的步骤，让用户看到动态更新
      const autoExpandedKeys = validItems
        .filter(item => item.status === 'loading' || item.blink)
        .map(item => item.key);
      
      // 直接渲染思维链，不添加额外的容器延迟（立即显示动态交互）
      // 使用 key 确保组件能够响应数据变化并重新渲染
      // 苹果风格设计：简洁、优雅，通过间距和背景色区分
      // 使用稳定的 key，避免组件重新挂载导致跳动
      const stableKey = `thought-chain-${block.id || 'default'}`;
      
      // 展开/收起状态（默认展开）
      const [isExpanded, setIsExpanded] = useState(true);
      
      return (
        <motion.div
          key={stableKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.15
          }}
          className="my-8"
        >
          {/* 思维链区域 - 苹果风格：简洁优雅，通过背景色和间距区分 */}
          <div className="bg-[#F5F9FF] rounded-2xl p-6 border border-[#E5E8F0]">
            {/* 标题 - 极简设计，带展开/收起按钮 */}
            <div 
              className="flex items-center gap-2 mb-5 cursor-pointer group hover:opacity-80 transition-opacity"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="w-1 h-4 bg-[#007AFF] rounded-full" />
              <span className="text-[12px] font-medium text-[#007AFF] tracking-wide flex-1">
                思考过程
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="text-[#007AFF] opacity-60 group-hover:opacity-100"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </div>
            
            {/* 思维链内容 - 可展开/收起 */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 0.2
                  }}
                  className="overflow-hidden"
        >
          <ThoughtChain 
            items={validItems} 
            defaultExpandedKeys={autoExpandedKeys}
            line="dashed"
                    isStreaming={isStreaming}
          />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      );
    }
    
    case 'tool-call-chain': {
      const toolCallItems = block.data as ToolCallItem[];
      
      // 严格检查数据有效性
      if (!Array.isArray(toolCallItems) || toolCallItems.length === 0) {
        return null;
      }
      
      // 验证每个 item 的有效性
      const validItems = toolCallItems.filter(item => {
        if (!item || typeof item !== 'object') return false;
        if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') return false;
        if (!item.toolName || typeof item.toolName !== 'string' || item.toolName.trim() === '') return false;
        return true;
      });
      
      if (validItems.length === 0) {
        return null;
      }
      
      // 自动展开当前 loading 的工具调用
      const autoExpandedKeys = validItems
        .filter(item => item.status === 'loading')
        .map(item => item.id);
      
      const stableKey = `tool-call-chain-${block.id || 'default'}`;
      const [isExpanded, setIsExpanded] = useState(true);
      
      return (
        <motion.div
          key={stableKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="my-8"
        >
          {/* 工具调用链区域 - 类似思维链的设计 */}
          <div className="bg-[#F5F9FF] rounded-2xl p-6 border border-[#E5E8F0]">
            {/* 标题 */}
            <div 
              className="flex items-center gap-2 mb-5 cursor-pointer group hover:opacity-80 transition-opacity"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="w-1 h-4 bg-[#007AFF] rounded-full" />
              <span className="text-[12px] font-medium text-[#007AFF] tracking-wide flex-1">
                工具调用
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="text-[#007AFF] opacity-60 group-hover:opacity-100"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </div>
            
            {/* 工具调用链内容 */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="relative z-0">
                    <ToolCallChain 
                      items={validItems} 
                      defaultExpandedKeys={autoExpandedKeys}
                      isStreaming={isStreaming}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      );
    }
    
    case 'visualizer': {
      // 支持 visualizer block 数据为对象（包含 conditions 和 actions 配置）或数组（仅 conditions）
      const visualizerData = block.data as any;
      const conditions = Array.isArray(visualizerData) 
        ? visualizerData 
        : (visualizerData?.conditions || visualizerData || []);
      const actionsConfig = Array.isArray(visualizerData) ? undefined : visualizerData?.actions;
      
      const layout = actionsConfig?.layout || 'horizontal';
      
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay, duration: 0.15 }}
          className="relative -mx-3"
          style={{ zIndex: 1000, position: 'relative' }}
        >
          <DataVisualizer 
            conditions={conditions} 
            onFilterApply={onFilterApply}
            showActions={false}
            layout={layout}
          />
        </motion.div>
      );
    }
    
    case 'action-buttons':
      return <ActionButtonGroup buttons={block.data as any} onSelect={onActionSelect!} delay={delay} />;

    case 'empty-state': {
      let emptyData;
      try {
        emptyData = typeof block.data === 'string' ? JSON.parse(block.data) : block.data;
      } catch {
        emptyData = block.data;
      }
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.2 }}
        >
          <EmptyStateCard 
            data={emptyData} 
            onAction={(action) => {
              if (action === 'refresh') {
                window.location.reload();
              } else if (action === 'modify' || action === 'fix') {
                // 可以触发重新查询
                console.log('Action:', action);
              }
            }}
          />
        </motion.div>
      );
    }

    case 'info-banner': {
      let bannerData;
      try {
        bannerData = typeof block.data === 'string' ? JSON.parse(block.data) : block.data;
      } catch {
        bannerData = block.data;
      }
      return (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.15 }}
        >
          <InfoBanner data={bannerData} />
        </motion.div>
      );
    }

    // 【已移除】规则匹配信息框 - 用户不需要显示绿色的规则匹配提示
    // case 'rule-explanation': {
    //   let ruleData;
    //   try {
    //     ruleData = typeof block.data === 'string' ? JSON.parse(block.data) : block.data;
    //   } catch {
    //     ruleData = block.data;
    //   }
    //   return (
    //     <motion.div
    //       initial={{ opacity: 0, y: 4 }}
    //       animate={{ opacity: 1, y: 0 }}
    //       transition={{ delay, duration: 0.15 }}
    //     >
    //       <RuleExplanation data={ruleData} />
    //     </motion.div>
    //   );
    // }

    case 'recommendation-filter': {
      let filterData;
      try {
        filterData = typeof block.data === 'string' ? JSON.parse(block.data) : block.data;
      } catch {
        filterData = block.data;
      }
      return (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration: 0.15 }}
        >
          <RecommendationFilterCard data={filterData} onSelect={onActionSelect} />
        </motion.div>
      );
    }

    case 'query-confirmation': {
      const confirmationData = block.data as { originalQuery: string; dimensions: QueryDimensions };
      return (
        <QueryConfirmationBubble
          originalQuery={confirmationData.originalQuery}
          dimensions={confirmationData.dimensions}
          onConfirm={(preciseQuery, confirmedDimensions) => {
            // 当用户确认后，保存用户实际选择的维度信息到 sessionStorage，用于生成固定回复
            sessionStorage.setItem('confirmedDimensions', JSON.stringify(confirmedDimensions || confirmationData.dimensions));
            sessionStorage.setItem('skipQueryConfirmation', 'true');
            // 立即触发精确查询
            onActionSelect?.(preciseQuery);
            // 延迟清除标记，确保 handleSend 能读取到
            setTimeout(() => {
              sessionStorage.removeItem('skipQueryConfirmation');
            }, 500);
          }}
        />
      );
    }

    case 'ambiguous-selection': {
      const ambiguousData = block.data as {
        type: 'metric' | 'employee';
        originalQuery: string;
        options: { label: string; value: string; description?: string }[];
        promptText: string;
      };
      return (
        <AmbiguousSelectionBubble
          type={ambiguousData.type}
          originalQuery={ambiguousData.originalQuery}
          options={ambiguousData.options}
          promptText={ambiguousData.promptText}
          onConfirm={(selectedValues) => {
            // 先保存选择结果到 sessionStorage（必须在调用 onActionSelect 之前）
            sessionStorage.setItem('ambiguousSelection', JSON.stringify({
              type: ambiguousData.type,
              selectedValues: selectedValues,
              originalQuery: ambiguousData.originalQuery,
            }));
            sessionStorage.setItem('skipQueryConfirmation', 'true');
            
            // 构建精确查询（用于显示，但实际会使用固定回复）
            let preciseQuery = ambiguousData.originalQuery;
            if (ambiguousData.type === 'metric') {
              if (selectedValues.length === 2) {
                preciseQuery = `${ambiguousData.originalQuery}（税前和税后）`;
              } else {
                preciseQuery = `${ambiguousData.originalQuery}（${selectedValues[0]}）`;
              }
            } else if (ambiguousData.type === 'employee') {
              const selectedEmployee = selectedValues[0];
              preciseQuery = ambiguousData.originalQuery.replace(/(张三|李四|王五|赵六)/, selectedEmployee);
            }
            
            // 使用 requestAnimationFrame 确保 sessionStorage 已设置后再触发
            requestAnimationFrame(() => {
              // 立即触发精确查询（会读取 sessionStorage 并生成固定回复，不调用大模型）
              onActionSelect?.(preciseQuery);
              // 延迟清除标记，确保 handleSend 能读取到
              setTimeout(() => {
                sessionStorage.removeItem('skipQueryConfirmation');
              }, 500);
            });
          }}
        />
      );
    }
    
    default: return null;
  }
}, (prevProps, nextProps) => {
  // 自定义比较函数，只在 block 真正变化时才重新渲染
  // 1. 首先比较 block.id，如果不同，需要重新渲染
  if (prevProps.block.id !== nextProps.block.id) {
    return false;
  }
  
  // 2. 比较 block.type，如果不同，需要重新渲染
  if (prevProps.block.type !== nextProps.block.type) {
    return false;
  }
  
  // 3. 比较 isStreaming 状态
  if (prevProps.isStreaming !== nextProps.isStreaming) {
    // 对于图表和表格类型，isStreaming 状态变化不应该触发重新渲染
    // 只有在数据变化时才重新渲染
    const chartTypes = ['chart', 'table', 'kpi', 'kpi-group', 'gantt', 'line-chart', 'bar-chart', 'pie-chart', 'scatter-chart', 'funnel-chart', 'box-plot', 'map-chart', 'quadrant-chart'];
    if (chartTypes.includes(prevProps.block.type)) {
      // 图表类型，忽略 isStreaming 状态变化
    } else {
      // 其他类型，isStreaming 状态变化需要重新渲染
      return false;
    }
  }
  
  // 4. 比较 block.data，使用更精确的比较逻辑
  const prevData = prevProps.block.data;
  const nextData = nextProps.block.data;
  
  // 如果引用相同，不需要重新渲染
  if (prevData === nextData) {
    return true;
  }
  
  // 对于图表和表格类型，使用更严格的比较
  const chartTypes = ['chart', 'table', 'kpi', 'kpi-group', 'gantt', 'line-chart', 'bar-chart', 'pie-chart', 'scatter-chart', 'funnel-chart', 'box-plot', 'map-chart', 'quadrant-chart'];
  if (chartTypes.includes(prevProps.block.type)) {
    // 对于图表和表格，使用深度比较，但只比较关键字段
    if (typeof prevData === 'object' && typeof nextData === 'object' && prevData !== null && nextData !== null) {
      // 对于图表类型，比较关键字段
      if (prevProps.block.type === 'chart' || prevProps.block.type.startsWith('chart') || prevProps.block.type.includes('-chart')) {
        const prevChart = prevData as any;
        const nextChart = nextData as any;
        
        // 比较图表类型
        if (prevChart.type !== nextChart.type) return false;
        
        // 比较数据数组的长度和关键内容
        if (prevChart.data && nextChart.data) {
          if (Array.isArray(prevChart.data) && Array.isArray(nextChart.data)) {
            if (prevChart.data.length !== nextChart.data.length) return false;
            // 比较前几个数据点，如果相同则认为数据没有变化
            const compareLength = Math.min(prevChart.data.length, 5);
            for (let i = 0; i < compareLength; i++) {
              if (JSON.stringify(prevChart.data[i]) !== JSON.stringify(nextChart.data[i])) {
                return false;
              }
            }
            // 如果前几个数据点相同，且长度相同，认为数据没有变化
            return true;
          }
        }
        
        // 如果没有 data 字段，使用完整比较
        return JSON.stringify(prevData) === JSON.stringify(nextData);
      }
      
      // 对于表格类型，比较 headers 和 rows
      if (prevProps.block.type === 'table') {
        const prevTable = prevData as any;
        const nextTable = nextData as any;
        
        // 比较 headers
        if (JSON.stringify(prevTable.headers) !== JSON.stringify(nextTable.headers)) {
          return false;
        }
        
        // 比较 rows 的长度和前几行
        if (prevTable.rows && nextTable.rows) {
          if (prevTable.rows.length !== nextTable.rows.length) {
            return false;
          }
          // 比较前几行，如果相同则认为数据没有变化
          const compareLength = Math.min(prevTable.rows.length, 3);
          for (let i = 0; i < compareLength; i++) {
            if (JSON.stringify(prevTable.rows[i]) !== JSON.stringify(nextTable.rows[i])) {
              return false;
            }
          }
          // 如果前几行相同，且长度相同，认为数据没有变化
          return true;
        }
      }
      
      // 对于 KPI 类型，比较关键字段
      if (prevProps.block.type === 'kpi' || prevProps.block.type === 'kpi-group') {
        return JSON.stringify(prevData) === JSON.stringify(nextData);
      }
    }
  }
  
  // 对于思维链类型，需要比较 items 的状态
  if (prevProps.block.type === 'thought-chain') {
    const prevItems = prevData as any[];
    const nextItems = nextData as any[];
    
    if (!Array.isArray(prevItems) || !Array.isArray(nextItems)) {
      return JSON.stringify(prevData) === JSON.stringify(nextData);
    }
    
    if (prevItems.length !== nextItems.length) {
      return false;
    }
    
    // 比较每个 item 的 key、status 和 description
    for (let i = 0; i < prevItems.length; i++) {
      const prevItem = prevItems[i];
      const nextItem = nextItems[i];
      
      if (prevItem.key !== nextItem.key ||
          prevItem.status !== nextItem.status ||
          String(prevItem.description || '') !== String(nextItem.description || '')) {
        return false;
      }
    }
    
    return true;
  }
  
  // 对于文本类型，比较内容
  if (prevProps.block.type === 'text') {
    const prevText = String(prevData || '');
    const nextText = String(nextData || '');
    return prevText === nextText;
  }
  
  // 其他类型，使用 JSON.stringify 比较
  return JSON.stringify(prevData) === JSON.stringify(nextData);
});

const SystemBubble = ({ 
  content, 
  status, 
  onActionSelect,
  onFilterApply,
  onAgentSwitch,
  agentId,
  isSearching,
  messageId = '',
  onAppendContent,
  onAttributionClick,
  onAddChartToDashboard,
}: { 
  content: ContentBlock[]; 
  status?: string; 
  onActionSelect?: (query: string) => void;
  onFilterApply?: (conditions: FilterCondition[], changedType?: string, changedValue?: string) => void;
  onAgentSwitch?: (agentName: string) => void;
  agentId?: string;
  isSearching?: boolean;
  messageId?: string;
  onAppendContent?: (blocks: ContentBlock[]) => void; // 用于在当前消息中追加内容
  onAttributionClick?: (data: { metric: string; changeValue: number; changeDirection: 'up' | 'down'; changeType: '同比' | '环比'; triggerRect?: DOMRect }) => void;
  onAddChartToDashboard?: (block: ContentBlock) => void;
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  
  const handleFilterApply = useCallback((conditions: FilterCondition[], changedType?: string, changedValue?: string) => {
    onFilterApply?.(conditions, changedType, changedValue);
  }, [onFilterApply]);

  // 处理表格行下钻
  const handleTableDrillDown = useCallback((rowData: any, headers: string[]) => {
    const cells = Array.isArray(rowData) ? rowData : rowData.cells;
    if (!cells || cells.length === 0) return;

    // 将表格行数据转换为下钻面板数据
    const details: Array<{ label: string; value: string }> = [];
    headers.forEach((header, index) => {
      if (cells[index] !== undefined) {
        details.push({
          label: header,
          value: typeof cells[index] === 'string' ? cells[index] : String(cells[index]),
        });
      }
    });

    const drillDownData: DrillDownData = {
      title: cells[0] || '销售详情',
      details,
      onActionSelect, // 传递 onActionSelect 以便在当前消息中执行
      actions: [
        {
          id: 'drill-down',
          label: '下钻到城市',
          icon: 'drill',
          onClick: () => {
            const drillQuery = `详细分析${cells[0]}的城市数据`;
            // 关闭下钻面板
            setIsDrillDownOpen(false);
            setDrillDownData(null);
            // 如果有 onAppendContent，在当前消息中追加内容；否则开启新对话
            if (onAppendContent) {
              // 在当前消息中追加下钻内容
              const drillDownBlocks: ContentBlock[] = [
                {
                  id: `drill_${Date.now()}_text`,
                  type: 'text',
                  data: `${cells[0]}的城市数据详情：`,
                },
                {
                  id: `drill_${Date.now()}_table`,
                  type: 'table',
                  data: {
                    headers: ['城市', '销售额', '增长率'],
                    rows: [
                      ['北京', '¥320万', '+18.5%'],
                      ['天津', '¥180万', '+12.3%'],
                      ['石家庄', '¥120万', '+15.8%'],
                      ['太原', '¥100万', '+10.2%'],
                    ],
                  },
                },
              ];
              onAppendContent(drillDownBlocks);
            } else {
              // 如果没有 onAppendContent，使用原来的方式开启新对话
              onActionSelect?.(drillQuery);
            }
          },
        },
        {
          id: 'export',
          label: '导出数据',
          icon: 'export',
          onClick: () => {
            console.log('导出数据:', cells);
          },
        },
        {
          id: 'dashboard',
          label: '添加到看板',
          icon: 'dashboard',
          onClick: () => {
            console.log('添加到看板:', cells);
          },
        },
      ],
    };

    setDrillDownData(drillDownData);
    setIsDrillDownOpen(true);
  }, [onActionSelect]);

  const agent = getAgentById(agentId);
  
  // 流式输出时显示带内容的加载状态
  const isStreaming = status === 'streaming';
  
  // ⚠️ 重要：所有 hooks 必须在早期返回之前调用
  // 使用 useMemo 缓存有效内容块，避免每次渲染都重新计算
  // 即使 content 为空，也要调用 useMemo 以保持 hooks 顺序一致
  const validBlocks = useMemo(() => {
    if (!Array.isArray(content) || content.length === 0) {
      return [];
    }
    return content.filter(b => {
      if (!b || !b.data) return false;
    if (typeof b.data === 'string') {
      // 字符串类型：只要不是空字符串就认为有效（包括"正在分析您的问题，请稍候..."）
      return b.data.trim().length > 0;
    }
    if (typeof b.data === 'object') {
      // 对于对象类型，检查是否有有效数据
      if (b.type === 'text') {
        const textData = b.data as any;
        if ('text' in textData) {
          return String(textData.text || '').trim().length > 0;
        }
        if ('content' in textData) {
          return String(textData.content || '').trim().length > 0;
        }
        return false;
      }
      // 对于思维链，需要验证 items 是否有效
      if (b.type === 'thought-chain') {
        const items = b.data as any[];
        if (!Array.isArray(items) || items.length === 0) return false;
        // 验证每个 item 是否有有效的 key 和 title
        return items.some(item => 
          item && 
          typeof item === 'object' && 
          item.key && 
          typeof item.key === 'string' &&
          item.key.trim() !== '' &&
          item.title !== undefined && 
          item.title !== null &&
          (typeof item.title === 'string' ? item.title.trim() !== '' : true)
        );
      }
      // 其他类型（chart, kpi, table等）只要有 data 就认为有效
      return true;
    }
    return false;
    });
  }, [content]);
  
  // 使用 useMemo 缓存 contentKey，避免每次渲染都重新计算
  const contentKey = useMemo(() => {
    if (!Array.isArray(content) || content.length === 0) {
      return '';
    }
    return content.map(b => b.id).join('-');
  }, [content]);

  // ⚠️ 重要：所有 hooks 必须在早期返回之前调用
  // 识别核心内容（KPI 或主要图表）- 优先显示
  const hasCoreData = useMemo(() => {
    if (!Array.isArray(content) || content.length === 0) {
      return false;
    }
    return content.some(block => {
      if (block.type === 'kpi' || block.type === 'kpi-group') return true;
      if (block.type === 'chart' && block.data && typeof block.data === 'object' && 'type' in block.data) {
        const chartType = (block.data as any).type;
        return ['line', 'bar', 'pie'].includes(chartType);
      }
      return false;
    });
  }, [content]);
  
  // 预计算处理后的 blocks（将连续的 kpi 组合成组）
  const processedBlocks = useMemo(() => {
    const chartTypes = ['chart', 'table', 'kpi', 'kpi-group', 'gantt', 'line-chart', 'bar-chart', 'pie-chart', 'scatter-chart', 'funnel-chart', 'box-plot', 'map-chart', 'quadrant-chart'];
    const isChartType = (type: string) => chartTypes.includes(type);
    
    // 将连续的 kpi 卡片组合成组 - 使用稳定的 key 避免重新创建
    const processed: Array<{ block: ContentBlock; isKpiGroup: boolean; kpiGroupItems?: ContentBlock[] }> = [];
    let i = 0;
    while (i < validBlocks.length) {
      const block = validBlocks[i];
      
      // 检查是否是连续的 kpi 卡片（不是 kpi-group）
      if (block.type === 'kpi') {
        const kpiGroup: ContentBlock[] = [block];
        let j = i + 1;
        // 收集连续的 kpi 卡片
        while (j < validBlocks.length && validBlocks[j].type === 'kpi') {
          kpiGroup.push(validBlocks[j]);
          j++;
        }
        
        if (kpiGroup.length > 1) {
          // 如果有多个连续的 kpi，组合成组 - 使用稳定的 ID
          const firstKpiId = kpiGroup[0].id || `kpi-${i}`;
          processed.push({
            block: {
              id: `kpi-group-${firstKpiId}`,
              type: 'kpi-group',
              data: kpiGroup.map(b => b.data),
            } as ContentBlock,
            isKpiGroup: true,
            kpiGroupItems: kpiGroup,
          });
          i = j;
        } else {
          // 单个 kpi，保持原样
          processed.push({ block, isKpiGroup: false });
          i++;
        }
      } else {
        processed.push({ block, isKpiGroup: false });
        i++;
      }
    }
    
    // 预计算所有 block 的间距类名和核心数据标识
    return processed.map(({ block, isKpiGroup }, index) => {
      const prevBlock = index > 0 ? processed[index - 1].block : null;
      const nextBlock = index < processed.length - 1 ? processed[index + 1].block : null;
            
            // 识别核心数据（KPI 或主要图表）
            let isCoreData = false;
            if (block.type === 'kpi' || block.type === 'kpi-group') {
              isCoreData = true;
            } else if (block.type === 'chart' && block.data && typeof block.data === 'object' && 'type' in block.data) {
              const chartType = (block.data as any).type;
              isCoreData = ['line', 'bar', 'pie'].includes(chartType);
            }
            
            // 判断是否是文本后接图表，或图表后接文本
            const isTextFollowedByChart = block.type === 'text' && nextBlock && isChartType(nextBlock.type);
            const isChartAfterText = isChartType(block.type) && prevBlock?.type === 'text';
            const isChartFollowedByText = isChartType(block.type) && nextBlock?.type === 'text';
            
            // 判断是否是KPI卡片
            const isKpiCard = block.type === 'kpi' || block.type === 'kpi-group';
            const prevIsKpiCard = prevBlock && (prevBlock.type === 'kpi' || prevBlock.type === 'kpi-group');
            
            // 文本和图表紧密结合，确保内容占满卡片，减少空白
            // ⚠️ 指标卡之间需要足够的间距，不要挨太近
            // ⚠️ 压缩空白，让界面更紧凑美观
            let spacingClass = '';
            if (isCoreData && index === 0) {
              spacingClass = ''; // 核心数据在第一位，无上间距
            } else if (block.type === 'visualizer' && index === 0) {
              spacingClass = ''; // visualizer 在第一位，无上间距
            } else if (block.type === 'visualizer' && prevBlock) {
              spacingClass = 'mt-1'; // visualizer 后接内容，紧凑间距
            } else if (prevBlock?.type === 'visualizer') {
              spacingClass = 'mt-1'; // visualizer 后的内容，紧凑间距
            } else if (isKpiCard && prevIsKpiCard) {
              spacingClass = 'mt-4'; // 指标卡之间需要足够的间距（16px）
            } else if (isKpiCard && prevBlock && prevBlock.type === 'text') {
              spacingClass = 'mt-2'; // 指标卡在文本后，紧凑间距（8px）
            } else if (block.type === 'text' && prevIsKpiCard) {
              spacingClass = 'mt-2'; // 文本在指标卡后，紧凑间距（8px）
            } else if (isCoreData && prevBlock && prevBlock.type === 'text') {
              spacingClass = 'mt-0.5'; // 核心数据紧跟文本，极小间距
            } else if (isTextFollowedByChart) {
              spacingClass = 'mb-0.5'; // 文本后接图表，极小间距
            } else if (isChartAfterText) {
              spacingClass = 'mt-0.5'; // 图表紧跟文本，极小间距
            } else if (isChartFollowedByText) {
              spacingClass = hasCoreData ? 'mb-1' : 'mb-1.5'; // 图表后接文本，紧凑间距
            } else if (block.type === 'text' && prevBlock?.type === 'text') {
              spacingClass = 'mt-0.5'; // 连续文本之间极小间距
            } else if (isChartType(block.type) && prevBlock && isChartType(prevBlock.type)) {
              spacingClass = hasCoreData ? 'mt-1' : 'mt-1.5'; // 图表之间，紧凑间距
            } else if (block.type === 'text' && !prevBlock) {
              spacingClass = ''; // 第一个文本块无上间距
            } else if (block.type === 'text' && prevBlock && isChartType(prevBlock.type)) {
              spacingClass = hasCoreData ? 'mt-1' : 'mt-1.5'; // 文本在图表后，紧凑间距
            } else {
              spacingClass = hasCoreData && isCoreData ? 'mt-0.5' : 'mt-1'; // 紧凑间距，确保占满卡片
      }
      
      return {
        block,
        spacingClass,
        isCoreData,
        blockKey: block.id || `block-${block.type}-${index}`, // 使用更稳定的 key，包含类型
        isKpiGroup,
      };
    });
  }, [validBlocks, hasCoreData]);
  
  return (
    <div
      className={hasCoreData ? "mb-2 w-full" : "mb-3 w-full"}
      data-message-id={messageId}
      style={{ 
        contain: 'layout style', // CSS containment，优化渲染性能
        position: 'relative', // 为右上角按钮提供定位上下文
        width: '100%', // 确保占满父容器
      }}
    >
      {/* Agent 信息栏 - 蓝色主题，核心数据时更紧凑 */}
      <div className={`flex items-center gap-3 ${hasCoreData ? 'mb-1.5' : 'mb-2'}`}>
        {agent.avatar ? (
          <img 
            src={agent.avatar} 
            alt={agent.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
        ) : (
          <div className="agent-avatar">
            {agent.name.slice(0, 1)}
          </div>
        )}
        <div className="flex flex-col">
          <span className="agent-name">{agent.name}</span>
          <span className="agent-title">{agent.title}</span>
        </div>
        {isStreaming && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#007AFF] rounded-full animate-[pulse_2s_ease-in-out_infinite]" />
            <span className="text-[11px] text-[#86868b]">输出中</span>
          </div>
        )}
      </div>



      {/* 内容卡片 - 蓝白简约风格 */}
      {(() => {
        // 使用之前已经过滤好的 validBlocks（避免重复过滤）
        // 如果过滤后没有有效内容，检查是否有"正在思考"提示
        if (validBlocks.length === 0) {
          // 检查原始content中是否有"正在分析"或"正在思考"的提示
          const hasThinkingHint = content.some(b => {
            if (b && b.data && typeof b.data === 'string') {
              return b.data.includes('正在分析') || b.data.includes('正在思考') || b.data.includes('请稍候');
            }
            return false;
          });
          
          // 如果有"正在思考"提示，显示它（避免空白气泡）
          if (hasThinkingHint && isStreaming) {
            const thinkingBlock = content.find(b => 
              b && b.data && typeof b.data === 'string' && 
              (b.data.includes('正在分析') || b.data.includes('正在思考') || b.data.includes('请稍候') || b.data.includes('正在搜索'))
            );
            if (thinkingBlock) {
              // 如果正在搜索，显示搜索指示器
              if (isSearching) {
                return <LoadingIndicator isSearching={isSearching} />;
              }
              return (
                <div className="message-system">
                  <div className="space-y-0">
                    <NarrativeText 
                      content={thinkingBlock.data as string} 
                      delay={0} 
                      isStreaming={isStreaming}
                    />
                  </div>
                </div>
              );
            }
          }
          return null;
            }
            
            return (
              <div 
            key={contentKey}
            className="message-system overflow-hidden"
            style={{ 
              minHeight: '1px', // 确保有最小高度，避免布局跳动
              contain: 'layout style', // CSS containment，优化渲染性能
              position: 'relative', // 为右上角按钮提供定位上下文
              wordBreak: 'break-word', // 确保文字不会超出
              overflowWrap: 'break-word', // 现代浏览器支持
              width: '100%', // 确保占满卡片
              marginLeft: 0, // 强制移除左边距
              marginRight: 0, // 强制移除右边距
            }}
          >
            {/* 顶部操作工具栏 - 只在消息完成时显示，不遮挡内容 */}
            {status === 'complete' && validBlocks.length > 0 && onAddChartToDashboard && (
              <div className="flex items-center justify-end gap-1.5 mb-2 pb-1.5 border-b border-[#E8F0FF]/50">
                {/* 固定到看板按钮 - 更明显的提示 */}
                <button
                  onClick={() => {
                    // 定义关键组件类型 - 只保留数据展示相关的组件
                    const essentialTypes = [
                      // KPI 相关
                      'kpi', 'kpi-group',
                      // 图表相关
                      'line-chart', 'bar-chart', 'pie-chart', 'scatter-chart', 
                      'funnel-chart', 'box-plot', 'map-chart', 'quadrant-chart',
                      'year-comparison', 'chart',
                      // 数据展示相关
                      'table', 'metrics-preview', 'region-cards',
                      // 文本内容（但过滤掉提示性文本）
                      'text',
                      // 报告相关
                      'report-title', 'report-hero-card', 'report-layer-card',
                      'insight-box', 'analyst-quote', 'callout-card', 'strategy-card'
                    ];
                    
                    // 过滤出关键组件
                    const essentialBlocks = validBlocks.filter(block => {
                      // 只保留关键类型
                      if (!essentialTypes.includes(block.type)) {
                        return false;
                      }
                      
                      // 对于文本类型，过滤掉提示性文本
                      if (block.type === 'text') {
                        const textContent = typeof block.data === 'string' ? block.data : '';
                        const isPromptText = 
                          textContent.includes('正在分析') ||
                          textContent.includes('正在思考') ||
                          textContent.includes('请稍候') ||
                          textContent.includes('为您展示') ||
                          textContent.includes('好的,') ||
                          textContent.trim().length < 5; // 太短的文本可能是提示
                        
                        // 如果包含实际数据描述，保留
                        const hasDataDescription = 
                          textContent.includes('万元') ||
                          textContent.includes('增长') ||
                          textContent.includes('下降') ||
                          textContent.includes('趋势') ||
                          textContent.includes('同比') ||
                          textContent.includes('环比') ||
                          textContent.includes('累计') ||
                          textContent.includes('占比');
                        
                        return !isPromptText || hasDataDescription;
                      }
                      
                      return true;
                    });
                    
                    // 如果没有关键组件，提示用户
                    if (essentialBlocks.length === 0) {
                      const toast = document.createElement('div');
                      toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-6 py-3 rounded-xl z-[100] text-sm font-bold shadow-xl';
                      toast.innerText = '⚠️ 当前消息没有可添加到看板的数据组件';
                      document.body.appendChild(toast);
                      setTimeout(() => {
                        toast.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(toast), 300);
                      }, 2000);
                      return;
                    }
                    
                    // 生成标题
                    const title = 
                      validBlocks.find(b => b.type === 'heading')?.data as string || 
                      (essentialBlocks.find(b => b.type === 'kpi')?.data as any)?.label as string || 
                      (essentialBlocks.find(b => b.type === 'kpi-group')?.data as any)?.[0]?.label as string ||
                      (essentialBlocks.find(b => b.type === 'text')?.data as string)?.substring(0, 20) ||
                      '数据看板项';
                    
                    // 生成摘要（从文本组件中提取，或从KPI中提取）
                    const summary = essentialBlocks
                      .find(b => b.type === 'text' && typeof b.data === 'string' && b.data.length > 10)?.data as string || 
                      (essentialBlocks.find(b => b.type === 'kpi')?.data as any)?.label as string || 
                      '';
                    
                    // 触发添加看板模态框，让用户填写名称/简称/标签
                    const event = new CustomEvent('open-add-to-dashboard', {
                      detail: {
                        title,
                        content: essentialBlocks,
                        summary,
                        agentName: agent.name,
                        agentId: agent.id,
                        messageId
                      }
                    });
                    window.dispatchEvent(event);
                  }}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg flex items-center gap-1.5',
                    'text-[#007AFF] hover:text-white',
                    'bg-[#007AFF]/5 hover:bg-[#007AFF]',
                    'transition-all',
                    'border border-[#007AFF]/20 hover:border-[#007AFF]',
                    'text-[12px] font-medium',
                    'shadow-sm hover:shadow-md'
                  )}
                  title="固定到数据看板"
                >
                  <Star className="w-3.5 h-3.5 fill-[#007AFF] hover:fill-white transition-colors" />
                  <span>固定到看板</span>
                </button>
                
                {(() => {
                  const visualizerBlock = validBlocks.find(b => b.type === 'visualizer');
                  if (!visualizerBlock) return null;
                  
                  const visualizerData = visualizerBlock.data as any;
                  const actionsConfig = Array.isArray(visualizerData) ? undefined : visualizerData?.actions;
                  const shouldShowActions = actionsConfig !== undefined 
                    ? actionsConfig.show !== false 
                    : true;
                  
                  if (!shouldShowActions) return null;
                  
                  // 合并更多操作，添加删除选项
                  const defaultMoreActions = [
                    ...(actionsConfig?.moreActions || []),
                    { id: 'delete', label: '删除此消息', danger: true },
                  ];
                  
                  const handleMoreAction = (actionId: string) => {
                    if (actionId === 'delete') {
                      setShowDeleteDialog(true);
                    } else {
                      actionsConfig?.onMoreAction?.(actionId);
                    }
                  };
                  
                  return (
                    <>
                      {/* 刷新/历史 */}
                      <button
                        onClick={() => {
                          // 刷新功能
                          console.log('刷新数据');
                        }}
                        className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          'text-[#86868b] hover:text-[#007AFF]',
                          'hover:bg-[#007AFF]/5',
                          'transition-colors',
                          'border border-transparent hover:border-[#007AFF]/20'
                        )}
                        title="刷新"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      
                      {/* 定位/聚焦 */}
                      <button
                        onClick={() => {
                          // 定位功能
                          console.log('定位到此处');
                        }}
                        className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          'text-[#86868b] hover:text-[#007AFF]',
                          'hover:bg-[#007AFF]/5',
                          'transition-colors',
                          'border border-transparent hover:border-[#007AFF]/20'
                        )}
                        title="定位"
                      >
                        <Target className="w-4 h-4" />
                      </button>
                      
                      {/* 保存 */}
                      <button
                        onClick={actionsConfig?.onSave}
                        className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          'text-[#86868b] hover:text-[#007AFF]',
                          'hover:bg-[#007AFF]/5',
                          'transition-colors',
                          'border border-transparent hover:border-[#007AFF]/20'
                        )}
                        title="保存"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      
                      {/* 导出 */}
                      <button
                        onClick={actionsConfig?.onExport}
                        className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          'text-[#86868b] hover:text-[#007AFF]',
                          'hover:bg-[#007AFF]/5',
                          'transition-colors',
                          'border border-transparent hover:border-[#007AFF]/20'
                        )}
                        title="导出"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      {/* 分享 */}
                      <button
                        onClick={actionsConfig?.onShare}
                        className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          'text-[#86868b] hover:text-[#007AFF]',
                          'hover:bg-[#007AFF]/5',
                          'transition-colors',
                          'border border-transparent hover:border-[#007AFF]/20'
                        )}
                        title="分享"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      
                      {/* 更多 */}
                      <MoreActionsMenu 
                        actions={defaultMoreActions}
                        onAction={handleMoreAction}
                        onClose={() => {}}
                      />
                      
                      {/* 关闭 */}
                      <button
                        onClick={() => {
                          // 关闭功能
                          console.log('关闭消息');
                        }}
                        className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          'text-[#86868b] hover:text-[#FF3B30]',
                          'hover:bg-[#FF3B30]/5',
                          'transition-colors',
                          'border border-transparent hover:border-[#FF3B30]/20'
                        )}
                        title="关闭"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
            
            <div 
              className="w-full" 
              style={{ 
                contain: 'layout',
                position: 'relative', // 使用相对定位，稳定布局
              }}
            >
              {processedBlocks.map(({ block, spacingClass, isCoreData, blockKey, isKpiGroup }) => (
                
                <div 
                  key={blockKey} 
                className={spacingClass}
                data-core-data={isCoreData ? "true" : undefined}
                  style={{ 
                    contain: 'layout style', // CSS containment，优化渲染性能
                    position: 'relative', // 使用相对定位，稳定布局
                    minHeight: '1px', // 确保有最小高度
                  }}
              >
                  {isKpiGroup && block.type === 'kpi-group' ? (
                    <KPIGroup items={block.data as KPIData[]} delay={0} blockData={block} onAddToDashboard={onAddChartToDashboard} />
                  ) : (
                <ContentBlockRenderer 
                  block={block} 
                  onActionSelect={onActionSelect}
                  onFilterApply={handleFilterApply}
                  onAgentSwitch={onAgentSwitch}
                  isStreaming={isStreaming}
                  onDrillDown={handleTableDrillDown}
                  onAttributionClick={onAttributionClick}
                  onAddToDashboard={onAddChartToDashboard}
                />
                  )}
              </div>
              ))}
            </div>
            
            {/* 底部操作区域 - 只在消息完成时显示 */}
            {status === 'complete' && (
              <div className="mt-2 pt-3 border-t border-[#E5E7EB] space-y-3">
                {/* 评分组件 */}
                <MessageRating 
                  messageId={messageId}
                  onRating={(rating) => {
                    console.log('消息评分:', { messageId, rating });
                    // 这里可以发送评分数据到后端
                  }}
                />
              </div>
            )}


            {/* 删除确认对话框 - 放在最下面 */}
            <DeleteConfirmDialog
              isOpen={showDeleteDialog}
              onConfirm={() => {
                console.log('确认删除消息:', messageId);
                setShowDeleteDialog(false);
                // 这里可以添加实际的删除逻辑
              }}
              onCancel={() => setShowDeleteDialog(false)}
            />

            {/* 下钻面板 - 右侧滑入 */}
            <DrillDownSidePanel
              isOpen={isDrillDownOpen}
              data={drillDownData}
              onClose={() => {
                setIsDrillDownOpen(false);
                setDrillDownData(null);
              }}
              onBack={() => {
                setIsDrillDownOpen(false);
                setDrillDownData(null);
              }}
            />
          </div>
        );
      })()}
    </div>
  );
};

export const MessageBubble = ({ message, onActionSelect, onFilterChange, onAgentSwitch, isSearching = false, onAppendContent }: MessageBubbleProps) => {
  const [attributionData, setAttributionData] = useState<AttributionData | null>(null);
  const [isAttributionOpen, setIsAttributionOpen] = useState(false);
  const [isAttributionLoading, setIsAttributionLoading] = useState(false);
  const [attributionPosition, setAttributionPosition] = useState<{ top: number; left: number } | undefined>(undefined);
  
  // 检查是否在看板编辑模式（通过 URL 参数或路径判断）
  const isDashboardEditMode = typeof window !== 'undefined' && (
    window.location.pathname.includes('dashboard') || 
    window.location.search.includes('page=dashboard') ||
    window.location.search.includes('page=dashboard-list')
  );
  
  // 处理单个图表添加到看板
  const handleAddChartToDashboard = (block: ContentBlock) => {
    const agent = getAgentById(message.agentId || 'alisa');
    
    // 根据不同类型生成合适的标题
    let title = '数据卡片';
    if (block.data) {
      if ((block.data as any)?.title) {
        title = (block.data as any).title;
      } else if (block.type === 'kpi-group' && Array.isArray(block.data)) {
        // KPI 组：尝试从第一个 KPI 获取标签
        const firstKpi = (block.data as any[])[0];
        title = firstKpi?.label ? `${firstKpi.label}等指标` : '核心业务指标';
      } else if (block.type === 'kpi' && (block.data as any)?.label) {
        title = (block.data as any).label;
      } else {
        // 根据类型生成友好标题
        const typeNames: Record<string, string> = {
          'line-chart': '趋势图表',
          'bar-chart': '柱状图表',
          'pie-chart': '饼图',
          'year-comparison': '同比分析',
          'scatter-chart': '散点图',
          'funnel-chart': '漏斗图',
          'box-plot': '箱线图',
          'map-chart': '地图',
          'quadrant-chart': '象限图',
          'table': '数据表格',
          'region-cards': '区域数据',
        };
        title = typeNames[block.type] || '数据卡片';
      }
    }
    
    // 触发添加看板模态框
    const event = new CustomEvent('open-add-to-dashboard', {
      detail: {
        title,
        content: [block],
        summary: title,
        agentName: agent.name,
        agentId: agent.id,
        messageId: message.id
      }
    });
    window.dispatchEvent(event);
  };
  
  const handleAttributionClick = (data: { metric: string; changeValue: number; changeDirection: 'up' | 'down'; changeType: '同比' | '环比'; triggerRect?: DOMRect }) => {
    // 计算面板位置
    if (data.triggerRect) {
      const rect = data.triggerRect;
      // 默认尝试放在按钮右侧
      let left = rect.right + 10;
      let top = rect.top - 20;
      
      // 如果右侧空间不足（假设屏幕宽度减去320px），则尝试放在左侧
      if (left + 320 > window.innerWidth) {
        left = rect.left - 330;
      }
      
      // 如果底部空间不足，向上调整
      if (top + 400 > window.innerHeight) {
        top = window.innerHeight - 420;
      }
      
      // 确保不超出顶部
      if (top < 10) top = 10;
      
      setAttributionPosition({ top, left });
    } else {
      setAttributionPosition(undefined);
    }

    // 打开归因分析面板
    setIsAttributionLoading(true);
    setIsAttributionOpen(true);
    
    // 模拟异步加载归因数据
    setTimeout(() => {
      // 生成时间范围标签（可以根据实际情况调整）
      const now = new Date();
      const timeRangeLabel = data.changeType === '同比' 
        ? `${now.getFullYear()}年`
        : `${now.getMonth() + 1}月`;
      
      const mockData = generateMockAttributionData(
        data.metric,
        data.changeValue,
        data.changeDirection,
        data.changeType,
        timeRangeLabel
      );
      setAttributionData(mockData);
      setIsAttributionLoading(false);
    }, 500);
  };

  // 处理归因下钻 - 现在在归因面板内部展开，不需要在对话界面追加内容
  const handleAttributionDrillDown = (_dimension: string, _factor: any) => {
    // 下钻逻辑现在完全在 AttributionPanel 内部处理
    // 这里不需要做任何操作，保持面板打开即可
  };
  
  if (message.role === 'user') {
    return <UserBubble content={message.content as string} />;
  }
  return (
    <>
      <SystemBubble 
        content={message.content as ContentBlock[]} 
        status={message.status} 
        onActionSelect={onActionSelect}
        onFilterApply={onFilterChange}
        onAgentSwitch={onAgentSwitch}
        agentId={message.agentId}
        isSearching={isSearching}
        messageId={message.id}
        onAppendContent={onAppendContent}
        onAttributionClick={handleAttributionClick}
        onAddChartToDashboard={isDashboardEditMode ? undefined : handleAddChartToDashboard}
      />
      {/* 归因分析面板 */}
      <AttributionPanel
        isOpen={isAttributionOpen}
        onClose={() => {
          setIsAttributionOpen(false);
          setAttributionData(null);
        }}
        data={attributionData}
        isLoading={isAttributionLoading}
        onDrillDown={handleAttributionDrillDown}
        onActionSelect={onActionSelect}
        position={attributionPosition}
      />
    </>
  );
};

export default MessageBubble;
