/**
 * 空状态卡片组件 - 根据《智能问答系统显示规则》设计
 * 支持：完全无数据、查询条件错误、数据源连接失败、权限不足
 */

import { motion } from 'framer-motion';
import { 
  BarChart3, 
  AlertTriangle, 
  Wifi, 
  Lock, 
  RefreshCw, 
  Settings, 
  ChevronRight,
  Info,
  HelpCircle 
} from 'lucide-react';
import clsx from 'clsx';

export interface EmptyStateData {
  type: 'no-data' | 'query-error' | 'connection-error' | 'permission-denied' | 'data-format-error';
  title: string;
  description: string;
  errorHighlight?: string;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
}

interface EmptyStateCardProps {
  data: EmptyStateData;
  onAction?: (action: string) => void;
}

const iconMap = {
  'no-data': { icon: BarChart3, color: 'text-[#86868b]', bg: 'bg-[#f5f5f7]' },
  'query-error': { icon: AlertTriangle, color: 'text-[#FF9500]', bg: 'bg-[#FFF8F0]' },
  'connection-error': { icon: Wifi, color: 'text-[#FF3B30]', bg: 'bg-[#FFF5F5]' },
  'permission-denied': { icon: Lock, color: 'text-[#86868b]', bg: 'bg-[#f5f5f7]' },
  'data-format-error': { icon: HelpCircle, color: 'text-[#FF3B30]', bg: 'bg-[#FFF5F5]' },
};

export const EmptyStateCard = ({ data, onAction }: EmptyStateCardProps) => {
  const iconConfig = iconMap[data.type] || iconMap['no-data'];
  const Icon = iconConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#d2d2d7]/50 p-6 shadow-sm"
    >
      {/* 图标区域 */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className={clsx(
          'w-16 h-16 rounded-2xl flex items-center justify-center mb-4',
          iconConfig.bg
        )}>
          <Icon className={clsx('w-8 h-8', iconConfig.color)} style={{ opacity: 0.6 }} />
        </div>
        <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">{data.title}</h3>
        <p className="text-[14px] text-[#86868b] max-w-[280px]">{data.description}</p>
      </div>

      {/* 错误高亮 */}
      {data.errorHighlight && (
        <div className="mb-4 p-3 bg-[#FFF8F0] rounded-lg border border-[#FF9500]/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF9500] flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#FF9500]">{data.errorHighlight}</p>
          </div>
        </div>
      )}

      {/* 建议列表 */}
      {data.suggestions && data.suggestions.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-[12px] font-medium text-[#86868b] mb-2">建议</p>
          {data.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-1.5 flex-shrink-0" />
              <p className="text-[13px] text-[#1d1d1f]">{suggestion}</p>
            </div>
          ))}
        </div>
      )}

      {/* 操作按钮 */}
      {data.actions && data.actions.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {data.actions.map((action, index) => (
            <button
              key={index}
              onClick={() => onAction?.(action.action)}
              className={clsx(
                'px-4 py-2 rounded-lg text-[13px] font-medium transition-all flex items-center gap-1.5',
                action.primary || index === 0
                  ? 'bg-[#007AFF] text-white hover:bg-[#0066CC]'
                  : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
              )}
            >
              {action.action === 'refresh' && <RefreshCw className="w-3.5 h-3.5" />}
              {action.action === 'modify' && <Settings className="w-3.5 h-3.5" />}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/**
 * 信息提示条组件 - 用于数据量不足等场景的提示
 */
export interface InfoBannerData {
  type: 'info' | 'warning' | 'error';
  icon?: 'info' | 'warning' | 'error';
  message: string;
  subMessage?: string;
  dateRange?: string;
  background?: 'blue' | 'yellow' | 'red';
}

interface InfoBannerProps {
  data: InfoBannerData;
}

export const InfoBanner = ({ data }: InfoBannerProps) => {
  const bgClasses = {
    blue: 'bg-[#EBF5FF] border-[#007AFF]/20',
    yellow: 'bg-[#FFFBEB] border-[#FF9500]/20',
    red: 'bg-[#FFF5F5] border-[#FF3B30]/20',
  };

  const iconClasses = {
    info: 'text-[#007AFF]',
    warning: 'text-[#FF9500]',
    error: 'text-[#FF3B30]',
  };

  const IconComponent = data.icon === 'warning' ? AlertTriangle : data.icon === 'error' ? AlertTriangle : Info;
  const bg = data.background || (data.type === 'warning' ? 'yellow' : data.type === 'error' ? 'red' : 'blue');

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'p-3 rounded-xl border flex items-start gap-3',
        bgClasses[bg]
      )}
    >
      <IconComponent className={clsx('w-4 h-4 flex-shrink-0 mt-0.5', iconClasses[data.icon || data.type])} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#1d1d1f]">{data.message}</p>
        {data.subMessage && (
          <p className="text-[12px] text-[#86868b] mt-0.5">{data.subMessage}</p>
        )}
        {data.dateRange && (
          <p className="text-[11px] text-[#86868b] mt-1 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[#86868b]" />
            数据来源：{data.dateRange}
          </p>
        )}
      </div>
    </motion.div>
  );
};

/**
 * 规则说明卡片 - 展示匹配规则
 */
export interface RuleExplanationData {
  rule: string;
  matchedKeywords?: string[];
  chartType?: string;
  reason?: string;
}

interface RuleExplanationProps {
  data: RuleExplanationData;
}

export const RuleExplanation = ({ data }: RuleExplanationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 bg-[#F0FDF4] border border-[#34C759]/20 rounded-xl"
    >
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded-full bg-[#34C759] flex items-center justify-center flex-shrink-0 mt-0.5">
          <ChevronRight className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-medium text-[#34C759] mb-1">规则匹配</p>
          <p className="text-[13px] text-[#1d1d1f]">{data.rule}</p>
          {data.matchedKeywords && data.matchedKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {data.matchedKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-[#34C759]/10 text-[#34C759] text-[11px] rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
          {data.chartType && (
            <p className="text-[11px] text-[#86868b] mt-1.5">
              → 图表类型：<span className="font-medium text-[#1d1d1f]">{data.chartType}</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * 推荐去重展示卡片
 */
export interface RecommendationFilterData {
  kept: string[];
  filtered: string[];
}

interface RecommendationFilterCardProps {
  data: RecommendationFilterData;
  onSelect?: (recommendation: string) => void;
}

export const RecommendationFilterCard = ({ data, onSelect }: RecommendationFilterCardProps) => {
  return (
    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
      {data.kept.map((item, index) => (
        <button
          key={index}
          onClick={() => onSelect?.(item)}
          className="w-full text-left px-3 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[13px] text-[#1d1d1f] hover:bg-[#F5F5F7] hover:border-[#007AFF]/30 transition-all flex items-center justify-between group shadow-sm"
        >
          <span className="flex items-center gap-2 truncate min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]/60 group-hover:bg-[#007AFF] transition-colors flex-shrink-0" />
            <span className="truncate">{item}</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#86868b] group-hover:text-[#007AFF] transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 ml-1" />
        </button>
      ))}
    </div>
  );
};

export default EmptyStateCard;

