/**
 * KPI卡片组件 - 字节风极简配色
 * 支持空状态和数据量判断
 */

import { motion } from 'framer-motion';
import { KPIData, ContentBlock } from '../types';
import clsx from 'clsx';
import { Info, AlertTriangle, AlertCircle, Lock } from 'lucide-react';
import { determineEmptyStateReason, EmptyStateConfig } from '../services/emptyStateEngine';

interface KPICardProps {
  data: KPIData;
  delay?: number;
  // 数据量判断相关
  dataPoints?: number;
  timeRange?: { start?: Date; end?: Date };
  showQuarterlyBreakdown?: boolean;
  // 空状态相关
  queryContext?: {
    timeRange?: { start?: Date; end?: Date };
    filters?: any;
    error?: { type?: string; message?: string };
  };
  onActionClick?: (action: 'modify-query' | 'refresh' | 'contact-admin' | 'check-connection') => void;
  // 归因分析相关
  onAttributionClick?: (data: { metric: string; changeValue: number; changeDirection: 'up' | 'down'; changeType: '同比' | '环比'; triggerRect?: DOMRect }) => void;
  // 添加到看板相关
  blockData?: ContentBlock;
  onAddToDashboard?: (block: ContentBlock) => void;
}

// 格式化数值
const formatValue = (value: number | string): string => {
  if (typeof value === 'string') return value;
  
  if (value >= 100000000) {
    return (value / 100000000).toFixed(2) + '亿';
  } else if (value >= 10000) {
    return (value / 10000).toFixed(0) + '万';
  } else if (value >= 1000) {
    return value.toLocaleString();
  }
  return value.toString();
};

// 归因分析触发组件（已移除，功能已集成到按钮中）

// 空状态KPI卡片
const EmptyStateCard = ({ 
  label, 
  config,
  onActionClick 
}: { 
  label: string;
  config: EmptyStateConfig;
  onActionClick?: (action: 'modify-query' | 'refresh' | 'contact-admin' | 'check-connection') => void;
}) => {
  // 根据原因选择图标和颜色
  const getIconAndColor = () => {
    switch (config.icon) {
      case 'warning':
        return { Icon: AlertTriangle, color: 'text-[#FF9500]', bgColor: 'bg-[#FFF5E6]', borderColor: 'border-[#FFE5B3]' };
      case 'error':
        return { Icon: AlertCircle, color: 'text-[#FF3B30]', bgColor: 'bg-[#FFEBEE]', borderColor: 'border-[#FFCDD2]' };
      case 'lock':
        return { Icon: Lock, color: 'text-[#86868b]', bgColor: 'bg-[#F5F5F7]', borderColor: 'border-[#E5E5EA]' };
      default:
        return { Icon: Info, color: 'text-[#86868b]', bgColor: 'bg-[#F5F5F7]', borderColor: 'border-[#E5E5EA]' };
    }
  };
  
  const { Icon, color, bgColor, borderColor } = getIconAndColor();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "my-2 bg-white rounded-xl border shadow-sm p-4",
        config.reason === 'no-data' ? 'opacity-60' : 'opacity-100',
        borderColor
      )}
    >
      <div className="flex flex-col items-center justify-center py-8">
        <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center mb-3", bgColor)}>
          <Icon className={clsx("w-6 h-6", color)} />
        </div>
        <h3 className="text-[14px] text-[#86868b] font-medium mb-1">{label}</h3>
        <p className="text-[13px] text-[#86868b] mb-4">{config.message}</p>
        
        {config.suggestions.length > 0 && (
          <div className="w-full mb-4">
            <p className="text-[12px] text-[#86868b] mb-2">建议：</p>
            <ul className="text-[12px] text-[#86868b] space-y-1">
              {config.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#007AFF]">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {config.showActions && config.actionButtons && (
          <div className="flex gap-2">
            {config.actionButtons.primary && (
              <button
                onClick={() => onActionClick?.(config.actionButtons!.primary!.action)}
                className="px-4 py-2 text-[13px] text-[#007AFF] bg-[#F5F9FF] rounded-lg hover:bg-[#E8F3FF] transition-colors"
              >
                {config.actionButtons.primary.label}
              </button>
            )}
            {config.actionButtons.secondary && (
              <button
                onClick={() => onActionClick?.(config.actionButtons!.secondary!.action)}
                className="px-4 py-2 text-[13px] text-[#007AFF] bg-[#F5F9FF] rounded-lg hover:bg-[#E8F3FF] transition-colors"
              >
                {config.actionButtons.secondary.label}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// 主KPI卡片 - 优化设计，添加边框和阴影提升可见性
export const PrimaryKPICard = ({ 
  data, 
  delay = 0,
  dataPoints,
  timeRange,
  showQuarterlyBreakdown = true,
  queryContext,
  onActionClick,
  onAttributionClick,
  blockData,
  onAddToDashboard
}: KPICardProps) => {
  const { label, value, unit, prefix, trend, subMetrics } = data;
  
  // 空状态判断 - 使用空状态判断引擎
  if (!value || (typeof value === 'number' && value === 0)) {
    const emptyStateConfig = determineEmptyStateReason(null, queryContext);
    return (
      <EmptyStateCard
        label={label}
        config={emptyStateConfig}
        onActionClick={onActionClick}
      />
    );
  }
  
  // 数据量判断
  const daysDiff = timeRange?.start && timeRange?.end 
    ? Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24))
    : undefined;
  const isSingleDay = daysDiff === 1;
  const isShortRange = daysDiff !== undefined && daysDiff < 7;
  const hasInsufficientData = dataPoints !== undefined && dataPoints < 3;
  
  // 计算显示配置
  const shouldShowTrend = !isSingleDay && !hasInsufficientData;
  const shouldShowSubMetrics = showQuarterlyBreakdown && !isSingleDay && !hasInsufficientData && !isShortRange;
  
  // 预警规则判断
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const alertRule = data.alertRule;
  let cardStyle = 'bg-white border-[#E8F0FF]';
  let valueTextStyle = 'text-[#1d1d1f]';
  let unitTextStyle = 'text-[#86868b]';
  let trendTextStyle = 'text-[#86868b]';
  let labelTextStyle = 'text-[#86868b]';
  let isWarning = false;
  let isExcellent = false;
  
  if (alertRule) {
    if (alertRule.warningThreshold !== undefined && numericValue < alertRule.warningThreshold) {
      isWarning = true;
      // 预警样式：苹果风格 - 柔和的红色渐变，精致优雅
      cardStyle = 'bg-gradient-to-br from-[#FF6B6B] via-[#FF5252] to-[#FF3B30] border-[#FF3B30]/20';
      valueTextStyle = 'text-white';
      unitTextStyle = 'text-white/85';
      trendTextStyle = 'text-white/90';
      labelTextStyle = 'text-white/90';
    } else if (alertRule.excellentThreshold !== undefined && numericValue >= alertRule.excellentThreshold) {
      isExcellent = true;
      // 优秀样式：苹果风格 - 柔和的绿色渐变，清新自然
      cardStyle = 'bg-gradient-to-br from-[#52C41A] via-[#34C759] to-[#30D158] border-[#34C759]/20';
      valueTextStyle = 'text-white';
      unitTextStyle = 'text-white/85';
      trendTextStyle = 'text-white/90';
      labelTextStyle = 'text-white/90';
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay }}
      className={clsx(
        'rounded-xl p-4 h-full flex flex-col justify-center relative transition-all duration-300',
        isWarning || isExcellent 
          ? 'shadow-[0_4px_20px_rgba(0,0,0,0.12)]' 
          : 'shadow-[0_1px_3px_rgba(22,100,255,0.04)]',
        cardStyle
      )}
    >
      {/* 标题和按钮 */}
      <div className="flex items-start justify-between mb-2 relative z-[60]">
        <span className={clsx('text-[14px] font-medium flex-1 pr-2', labelTextStyle)}>{label}</span>
        <div className="flex items-center gap-2 relative z-[60] flex-shrink-0">
          {/* 添加到看板按钮 */}
          {blockData && onAddToDashboard && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToDashboard(blockData);
              }}
              className={clsx(
                'h-7 px-3 rounded-lg flex items-center justify-center transition-all duration-200 border text-[12px] font-medium whitespace-nowrap relative z-[60] flex-shrink-0',
                isWarning || isExcellent
                  ? 'text-white hover:text-white bg-white/15 hover:bg-white/25 border-white/25 hover:border-white/40 backdrop-blur-sm'
                  : 'text-[#007AFF] hover:text-white bg-white hover:bg-[#007AFF] border-[#007AFF]/30 hover:border-[#007AFF]'
              )}
              title="添加到数据看板"
            >
              添加
            </button>
          )}
          {/* 归因分析入口 - 仅对同比增长/环比增长显示 */}
          {trend && shouldShowTrend && onAttributionClick && (trend.label?.includes('同比') || trend.label?.includes('环比')) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!onAttributionClick) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const metric = label.replace(/年度|季度|月度|本月|今年|去年/g, '').trim();
                const changeType = trend.label?.includes('同比') ? '同比' as const : 
                                 trend.label?.includes('环比') ? '环比' as const : '同比' as const;
                onAttributionClick({
                  metric: metric || label,
                  changeValue: trend.value,
                  changeDirection: trend.direction === 'up' ? 'up' : 'down',
                  changeType,
                  triggerRect: rect
                });
              }}
              className={clsx(
                'h-7 px-3 rounded-lg flex items-center justify-center transition-all duration-200 border text-[12px] font-medium whitespace-nowrap flex-shrink-0',
                isWarning || isExcellent
                  ? 'text-white hover:text-white bg-white/15 hover:bg-white/25 border-white/25 hover:border-white/40 backdrop-blur-sm'
                  : 'text-[#007AFF] hover:text-white bg-white hover:bg-[#007AFF] border-[#007AFF]/30 hover:border-[#007AFF]'
              )}
              title="归因分析"
            >
              归因
            </button>
          )}
        </div>
      </div>
      
      {/* 主数值 */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className={clsx(
          'text-[28px] font-bold tracking-tight leading-none',
          valueTextStyle
        )}>
          {prefix}{formatValue(value)}
        </span>
        {unit && <span className={clsx(
          'text-[14px] font-medium',
          unitTextStyle
        )}>{unit}</span>}
      </div>
      
      {/* 环比同比 - 移到主数值下方 */}
      {trend && shouldShowTrend && (
        <div className="flex items-center gap-3 mb-2">
          {trend.mom !== undefined && (
            <span className={clsx(
              'text-[13px] font-medium',
              isWarning || isExcellent 
                ? trendTextStyle 
                : trend.mom > 0 ? 'text-[#34C759]' : trend.mom < 0 ? 'text-[#FF3B30]' : 'text-[#86868b]'
            )}>
              {trend.mom > 0 ? '↑' : trend.mom < 0 ? '↓' : '−'} {Math.abs(trend.mom)}% 环比
            </span>
          )}
          {trend.yoy !== undefined && (
            <span className={clsx(
              'text-[13px] font-medium',
              isWarning || isExcellent 
                ? trendTextStyle 
                : trend.yoy > 0 ? 'text-[#34C759]' : trend.yoy < 0 ? 'text-[#FF3B30]' : 'text-[#86868b]'
            )}>
              {trend.yoy > 0 ? '↑' : trend.yoy < 0 ? '↓' : '−'} {Math.abs(trend.yoy)}% 同比
            </span>
          )}
          {!trend.mom && !trend.yoy && trend.value !== undefined && (
            <span className={clsx(
              'text-[13px] font-medium',
              isWarning || isExcellent 
                ? trendTextStyle 
                : trend.direction === 'up' ? 'text-[#34C759]' : 
                  trend.direction === 'down' ? 'text-[#FF3B30]' : 
                  'text-[#86868b]'
            )}>
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '−'} {trend.value}%
              {trend.label && <span className="opacity-80 ml-1 text-[12px]">{trend.label}</span>}
            </span>
          )}
        </div>
      )}
      
      {/* 信息提示条 */}
      {isSingleDay && (
        <div className="mb-3 p-2.5 bg-[#E8F3FF] rounded-lg border border-[#B8D9FF] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#007AFF] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[12px] text-[#007AFF]">
              数据时间范围：{timeRange?.start?.toLocaleDateString('zh-CN')}。单日数据，暂不展示季度分解和同比。
            </p>
          </div>
        </div>
      )}
      
      {isShortRange && !isSingleDay && (
        <div className="mb-3 p-2.5 bg-[#E8F3FF] rounded-lg border border-[#B8D9FF] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#007AFF] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[12px] text-[#007AFF]">
              数据时间范围较短（{daysDiff}天），暂不展示季度分解。
            </p>
          </div>
        </div>
      )}
      
      {hasInsufficientData && (
        <div className="mb-3 p-2.5 bg-[#FFF5E6] rounded-lg border border-[#FFE5B3] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF9500] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[12px] text-[#FF9500]">
              数据点不足（仅{dataPoints}个），无法进行季度分析和趋势对比。建议：扩大查询时间范围以获得更完整分析。
            </p>
          </div>
        </div>
      )}
      
      {/* 子指标 */}
      {subMetrics && subMetrics.length > 0 && shouldShowSubMetrics && (
        <div className="grid grid-cols-4 gap-4 pt-3 border-t border-[#E5E5EA]">
          {subMetrics.map((sub, index) => (
            <div key={index}>
              <div className="text-[12px] text-[#86868b] mb-0.5">{sub.label}</div>
              <div className="text-[14px] font-semibold text-[#1d1d1f]">
                {typeof sub.value === 'number' ? formatValue(sub.value) : sub.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// 次要KPI卡片 - 优化设计，添加边框和阴影提升可见性
export const SecondaryKPICard = ({ data, delay = 0, onAttributionClick, blockData, onAddToDashboard }: KPICardProps & { onAttributionClick?: (data: { metric: string; changeValue: number; changeDirection: 'up' | 'down'; changeType: '同比' | '环比'; triggerRect?: DOMRect }) => void }) => {
  const { label, value, unit, prefix, trend } = data;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className="bg-white rounded-xl border border-[#E5E6EB] shadow-sm p-3 min-w-0 w-full h-full flex flex-col justify-center relative"
    >
      {/* 标签行 - 标签和按钮 */}
      <div className="flex items-start justify-between gap-2 mb-2 relative z-[60]">
        <span className="text-[12px] text-[#86868b] leading-tight break-words flex-1 pr-2">{label}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0 relative z-[60]">
          {/* 添加到看板按钮 */}
          {blockData && onAddToDashboard && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToDashboard(blockData);
              }}
              className="h-6 px-2.5 rounded-lg flex items-center justify-center text-[#007AFF] hover:text-white bg-white hover:bg-[#007AFF] transition-all duration-200 border border-[#007AFF]/30 hover:border-[#007AFF] text-[11px] font-medium whitespace-nowrap relative z-[60] flex-shrink-0"
              title="添加到数据看板"
            >
              添加
            </button>
          )}
          {/* 归因按钮 */}
          {trend && onAttributionClick && (trend.label?.includes('同比') || trend.label?.includes('环比') || trend.mom !== undefined || trend.yoy !== undefined) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!onAttributionClick) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const metric = label.replace(/年度|季度|月度|本月|今年|去年/g, '').trim();
                const changeType = trend.label?.includes('同比') || trend.yoy !== undefined ? '同比' as const : 
                                 trend.label?.includes('环比') || trend.mom !== undefined ? '环比' as const : '同比' as const;
                const changeValue = trend.mom !== undefined ? Math.abs(trend.mom) : trend.yoy !== undefined ? Math.abs(trend.yoy) : trend.value;
                const changeDirection = (trend.mom !== undefined && trend.mom > 0) || (trend.yoy !== undefined && trend.yoy > 0) || trend.direction === 'up' ? 'up' : 'down';
                onAttributionClick({
                  metric: metric || label,
                  changeValue,
                  changeDirection,
                  changeType,
                  triggerRect: rect
                });
              }}
              className="h-6 px-2.5 rounded-lg flex items-center justify-center text-[#007AFF] hover:text-white bg-white hover:bg-[#007AFF] transition-all duration-200 border border-[#007AFF]/30 hover:border-[#007AFF] text-[11px] font-medium whitespace-nowrap flex-shrink-0"
              title="归因分析"
            >
              归因
            </button>
          )}
        </div>
      </div>
      
      {/* 数值行 */}
      <div className="flex items-baseline gap-1 flex-wrap mb-1">
        <span className="text-[18px] font-bold text-[#1d1d1f] tracking-tight">
          {prefix}{formatValue(value)}
        </span>
        {unit && <span className="text-[11px] text-[#86868b]">{unit}</span>}
      </div>
      
      {/* 环比同比 - 移到主数值下方 */}
      {trend && (
        <div className="flex items-center gap-2 flex-wrap">
          {trend.mom !== undefined && (
            <span className={clsx(
              'text-[11px] font-medium whitespace-nowrap',
              trend.mom > 0 ? 'text-[#34C759]' : trend.mom < 0 ? 'text-[#FF3B30]' : 'text-[#86868b]'
            )}>
              {trend.mom > 0 ? '↑' : trend.mom < 0 ? '↓' : '−'} {Math.abs(trend.mom)}% 环比
            </span>
          )}
          {trend.yoy !== undefined && (
            <span className={clsx(
              'text-[11px] font-medium whitespace-nowrap',
              trend.yoy > 0 ? 'text-[#34C759]' : trend.yoy < 0 ? 'text-[#FF3B30]' : 'text-[#86868b]'
            )}>
              {trend.yoy > 0 ? '↑' : trend.yoy < 0 ? '↓' : '−'} {Math.abs(trend.yoy)}% 同比
            </span>
          )}
          {!trend.mom && !trend.yoy && trend.value !== undefined && (
            <span className={clsx(
              'text-[11px] font-semibold whitespace-nowrap',
              trend.direction === 'up' ? 'text-[#34C759]' : 
              trend.direction === 'down' ? 'text-[#FF3B30]' : 
              'text-[#86868b]'
            )}>
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '−'} {trend.value}%
              {trend.label && <span className="opacity-80 ml-1 text-[10px]">{trend.label}</span>}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

// KPI组 - 每行2个，超过2个自动换行
interface KPIGroupProps {
  items: KPIData[];
  delay?: number;
  onAttributionClick?: (data: { metric: string; changeValue: number; changeDirection: 'up' | 'down'; changeType: '同比' | '环比'; triggerRect?: DOMRect }) => void;
  blockData?: ContentBlock;
  onAddToDashboard?: (block: ContentBlock) => void;
}

export const KPIGroup = ({ items, delay = 0, onAttributionClick, blockData, onAddToDashboard }: KPIGroupProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 w-full relative">
      {/* 添加到看板按钮 - 整个组的右上角，只显示一个 */}
      {blockData && onAddToDashboard && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToDashboard(blockData);
          }}
          className="absolute top-2 right-2 h-7 px-3 rounded-lg flex items-center justify-center text-[#007AFF] hover:text-white bg-white hover:bg-[#007AFF] transition-all duration-200 border border-[#007AFF]/30 hover:border-[#007AFF] z-[60] text-[12px] font-medium whitespace-nowrap"
          title="添加到数据看板"
        >
          添加
        </button>
      )}
      {items.map((item, index) => (
        <div key={item.id || index} className="w-full">
          <SecondaryKPICard 
            data={item} 
            delay={delay + 0.03 * index}
            onAttributionClick={onAttributionClick}
            blockData={undefined} // 不传递 blockData，避免重复显示添加按钮
            onAddToDashboard={undefined} // 不传递 onAddToDashboard，避免重复显示添加按钮
          />
        </div>
      ))}
    </div>
  );
};

export default { PrimaryKPICard, SecondaryKPICard, KPIGroup };
