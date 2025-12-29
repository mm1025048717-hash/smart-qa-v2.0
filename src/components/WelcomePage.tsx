/**
 * 欢迎页面组件 - 集成所有测试问题气泡
 * 基于 TEST_CASES.md 和 TEST_NARRATIVE_STORY.md
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Map,
  AlertTriangle,
  Search,
  Zap,
  Target,
  Layers,
  GitBranch,
  Award,
  ChevronDown,
  ChevronRight,
  Sparkles,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import clsx from 'clsx';

interface WelcomePageProps {
  onQuestionSelect: (question: string) => void;
  userName?: string;
}

// 测试问题数据结构
interface QuestionCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
  questions: {
    id: string;
    text: string;
    type?: string;
  }[];
}

// 基于 TEST_CASES.md 和 TEST_NARRATIVE_STORY.md 的完整测试问题集
const TEST_QUESTIONS: QuestionCategory[] = [
  {
    id: 'l1-single',
    name: '单指标查询',
    icon: BarChart3,
    color: 'blue',
    description: 'L1层级 - 简单指标查询',
    questions: [
      { id: 'L1-01', text: '今年销售额是多少', type: 'single_metric' },
      { id: 'L1-02', text: '本月订单量有多少', type: 'single_metric' },
      { id: 'L1-03', text: '当前库存数值', type: 'single_metric' },
    ]
  },
  {
    id: 'l1-multi',
    name: '多指标并列',
    icon: Layers,
    color: 'indigo',
    description: 'L1层级 - 多指标同时查询',
    questions: [
      { id: 'L1-04', text: '销售额和订单量', type: 'multi_metric' },
      { id: 'L1-05', text: '看一下营收以及利润', type: 'multi_metric' },
      { id: 'L1-06', text: '日活还有月活数据', type: 'multi_metric' },
    ]
  },
  {
    id: 'l2-trend',
    name: '趋势分析',
    icon: TrendingUp,
    color: 'emerald',
    description: 'L2层级 - 时间趋势分析',
    questions: [
      { id: 'L2-01', text: '近3个月销售额趋势', type: 'trend_analysis' },
      { id: 'L2-02', text: '今年销售额变化情况', type: 'trend_analysis' },
      { id: 'L2-03', text: '最近一周订单量波动', type: 'trend_analysis' },
      { id: 'S-02', text: '近三个月销售额趋势怎么样', type: 'trend_analysis' },
    ]
  },
  {
    id: 'l2-yoy',
    name: '同比环比',
    icon: GitBranch,
    color: 'violet',
    description: 'L2层级 - 同比环比分析',
    questions: [
      { id: 'L2-04', text: '本月销售额比上月如何', type: 'yoy_mom' },
      { id: 'L1-07', text: '12月份的销售额环比？', type: 'yoy_mom' },
      { id: 'L2-05', text: '对比去年和今年营收', type: 'yoy_mom' },
      { id: 'L2-06', text: 'Q3销售额同比增长情况', type: 'yoy_mom' },
    ]
  },
  {
    id: 'l2-composition',
    name: '构成分析',
    icon: PieChart,
    color: 'amber',
    description: 'L2层级 - 占比构成分析',
    questions: [
      { id: 'L2-07', text: '销售渠道占比分析', type: 'composition' },
      { id: 'L2-08', text: '各品类销售额构成', type: 'composition' },
      { id: 'L2-09', text: '用户年龄分布比例', type: 'composition' },
    ]
  },
  {
    id: 'l2-compare',
    name: '维度对比',
    icon: BarChart3,
    color: 'cyan',
    description: 'L2层级 - 多维度对比',
    questions: [
      { id: 'L2-10', text: '各地区销售额对比', type: 'dimension_compare' },
      { id: 'L2-11', text: '分产品线看销量', type: 'dimension_compare' },
      { id: 'L2-12', text: '各渠道转化率哪个最好', type: 'dimension_compare' },
      { id: 'L-01', text: '各地区销售额对比', type: 'dimension_compare' },
    ]
  },
  {
    id: 'l2-geo',
    name: '地域分布',
    icon: Map,
    color: 'teal',
    description: 'L2层级 - 地理分布分析',
    questions: [
      { id: 'L2-16', text: '各省份销售分布', type: 'geography' },
      { id: 'L2-17', text: '用户地域分布情况', type: 'geography' },
      { id: 'L2-18', text: '各城市订单量热力图', type: 'geography' },
    ]
  },
  {
    id: 'l2-ranking',
    name: '排名分析',
    icon: Award,
    color: 'orange',
    description: 'L2层级 - 排名排序',
    questions: [
      { id: 'L2-19', text: 'TOP10销售城市', type: 'ranking' },
      { id: 'L2-20', text: '销量最低的5个产品', type: 'ranking' },
      { id: 'L2-21', text: '各门店业绩排名', type: 'ranking' },
    ]
  },
  {
    id: 'l2-anomaly',
    name: '异常检测',
    icon: AlertTriangle,
    color: 'red',
    description: 'L2层级 - 异常数据诊断',
    questions: [
      { id: 'L2-22', text: '找出异常交易数据', type: 'anomaly' },
      { id: 'L2-23', text: '昨天订单量突降原因', type: 'anomaly' },
      { id: 'L2-24', text: '检测销售额不正常的区域', type: 'anomaly' },
      { id: 'S-04', text: '昨天订单量是不是有问题', type: 'anomaly' },
    ]
  },
  {
    id: 'l2-attribution',
    name: '🔍 归因分析',
    icon: Search,
    color: 'rose',
    description: '完整归因交互演示',
    questions: [
      // 直接提问归因
      { id: 'attr-01', text: '为什么销售额下降了？', type: 'attribution' },
      { id: 'attr-02', text: '分析销售额增长原因', type: 'attribution' },
      { id: 'attr-03', text: '为什么11月销售额下降了？', type: 'attribution' },
      { id: 'attr-04', text: '利润下滑的影响因素有哪些？', type: 'attribution' },
      { id: 'attr-05', text: '分析转化率偏低的原因', type: 'attribution' },
      // 带归因入口的查询
      { id: 'attr-06', text: '12月份的销售额环比？', type: 'attribution' },
      { id: 'attr-07', text: '今年销售额是多少？', type: 'attribution' },
      // 维度归因
      { id: 'attr-09', text: '华东区销售下降的原因', type: 'attribution' },
      { id: 'attr-10', text: '线上渠道增长的驱动因素', type: 'attribution' },
    ]
  },
  {
    id: 'l2-prediction',
    name: '预测分析',
    icon: Zap,
    color: 'purple',
    description: 'L2层级 - 趋势预测',
    questions: [
      { id: 'L2-28', text: '预测下月销售额', type: 'prediction' },
      { id: 'L2-29', text: '未来一周订单趋势预测', type: 'prediction' },
      { id: 'L2-30', text: '预计Q4能完成多少营收', type: 'prediction' },
    ]
  },
  {
    id: 'l3-drill',
    name: '下钻探索',
    icon: Target,
    color: 'sky',
    description: 'L3层级 - 深入下钻',
    questions: [
      { id: 'L3-01', text: '详细看看华东区数据', type: 'drill_down' },
      { id: 'L3-02', text: '展开说说杭州的情况', type: 'drill_down' },
      { id: 'L3-03', text: '具体到各门店分析', type: 'drill_down' },
      { id: 'L-03', text: '详细看看华东', type: 'drill_down' },
    ]
  },
  {
    id: 'narrative-story',
    name: '叙事故事',
    icon: MessageSquare,
    color: 'fuchsia',
    description: '数据故事叙事测试',
    questions: [
      { id: 'S-01', text: '今年销售额是多少', type: 'narrative' },
      { id: 'I-01', text: '11月销售额趋势', type: 'narrative' },
      { id: 'I-02', text: '看看本月销售数据', type: 'narrative' },
      { id: 'P-01', text: '全面分析今年销售情况', type: 'narrative' },
      { id: 'P-02', text: '分析各地区各产品销售额同比环比及异常情况', type: 'narrative' },
      { id: 'G-01', text: '销售额下降了', type: 'narrative' },
    ]
  },
  {
    id: 'e2e',
    name: '端到端测试',
    icon: Sparkles,
    color: 'lime',
    description: '完整分析旅程',
    questions: [
      { id: 'E2E-01', text: '今年业务怎么样', type: 'e2e' },
      { id: 'E2E-02', text: '看看昨天数据', type: 'e2e' },
    ]
  },
  {
    id: 'edge',
    name: '边界条件',
    icon: AlertTriangle,
    color: 'slate',
    description: '边界条件处理',
    questions: [
      { id: 'E-01', text: '2030年销售额趋势', type: 'edge' },
      { id: 'E-03', text: '销售', type: 'edge' },
      { id: 'E-04', text: '看看数据', type: 'edge' },
      { id: 'E-05', text: '帮我分析一下', type: 'edge' },
    ]
  },
];

// 快速入口按钮
const QUICK_ENTRIES = [
  { id: 'sales', label: '销售分析', icon: BarChart3, color: 'blue', query: '今年销售额是多少' },
  { id: 'trend', label: '趋势分析', icon: TrendingUp, color: 'emerald', query: '近3个月销售额趋势' },
  { id: 'channel', label: '渠道分析', icon: PieChart, color: 'amber', query: '销售渠道占比分析' },
  { id: 'region', label: '地区对比', icon: Map, color: 'cyan', query: '各地区销售额对比' },
  { id: 'anomaly', label: '异常诊断', icon: AlertTriangle, color: 'red', query: '昨天订单量是不是有问题' },
  { id: 'why', label: '归因分析', icon: Search, color: 'rose', query: '为什么11月销售额下降了' },
];

// 颜色映射
const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-200', light: 'bg-violet-50' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200', light: 'bg-cyan-50' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-600', border: 'border-teal-200', light: 'bg-teal-50' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50' },
  red: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200', light: 'bg-red-50' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
  sky: { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-200', light: 'bg-sky-50' },
  fuchsia: { bg: 'bg-fuchsia-500', text: 'text-fuchsia-600', border: 'border-fuchsia-200', light: 'bg-fuchsia-50' },
  lime: { bg: 'bg-lime-500', text: 'text-lime-600', border: 'border-lime-200', light: 'bg-lime-50' },
  slate: { bg: 'bg-slate-500', text: 'text-slate-600', border: 'border-slate-200', light: 'bg-slate-50' },
};

// 获取问候语
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  if (hour < 22) return '晚上好';
  return '夜深了';
};

// 分类卡片组件
const CategoryCard = ({ 
  category, 
  isExpanded, 
  onToggle, 
  onSelect 
}: { 
  category: QuestionCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (question: string) => void;
}) => {
  const colors = colorMap[category.color];
  const Icon = category.icon;
  
  return (
    <motion.div
      layout
      className={clsx(
        'rounded-xl border transition-all duration-200',
        isExpanded ? 'bg-white shadow-lg' : 'bg-white hover:bg-white hover:shadow-md',
        colors.border
      )}
    >
      {/* 分类标题 */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className={clsx('p-2 rounded-lg', colors.light)}>
            <Icon className={clsx('w-4 h-4', colors.text)} />
          </div>
          <div className="text-left">
            <div className="font-medium text-[#1D2129]">{category.name}</div>
            <div className="text-xs text-[#4E5969]">{category.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx(
            'text-xs px-2 py-0.5 rounded-full',
            colors.light, colors.text
          )}>
            {category.questions.length}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[#86909C]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#86909C]" />
          )}
        </div>
      </button>
      
      {/* 问题列表 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {category.questions.map((q, index) => (
                <motion.button
                  key={q.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelect(q.text)}
                  className={clsx(
                    'w-full text-left px-3 py-2.5 rounded-lg text-sm',
                    'bg-[#F5F9FF] hover:bg-[#E8F0FF] transition-colors',
                    'flex items-center justify-between group'
                  )}
                >
                  <span className="text-[#1D2129]">{q.text}</span>
                  <ArrowRight className="w-4 h-4 text-[#1664FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 快速入口按钮
const QuickEntryButton = ({ 
  entry, 
  onClick 
}: { 
  entry: typeof QUICK_ENTRIES[0];
  onClick: () => void;
}) => {
  const colors = colorMap[entry.color];
  const Icon = entry.icon;
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 px-4 py-2.5 rounded-full',
        'bg-white border border-[#E8F0FF] hover:border-[#1664FF]',
        'shadow-sm hover:shadow transition-all hover:bg-[#E8F0FF]/30'
      )}
    >
      <Icon className={clsx('w-4 h-4', colors.text)} />
      <span className="text-sm font-medium text-[#1D2129]">{entry.label}</span>
    </motion.button>
  );
};

export const WelcomePage = ({ onQuestionSelect, userName = 'Alex_Chen' }: WelcomePageProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  const greeting = getGreeting();
  
  // 显示的分类（默认显示前6个，展开后显示全部）
  const visibleCategories = showAllCategories 
    ? TEST_QUESTIONS 
    : TEST_QUESTIONS.slice(0, 6);
  
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl space-y-8"
      >
        {/* 问候语 */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-[#1D2129]"
          >
            {greeting}，{userName}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-[#4E5969]"
          >
            选择一个分析场景开始，或直接输入您的问题
          </motion.p>
        </div>
        
        {/* 快速入口 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {QUICK_ENTRIES.map((entry) => (
            <QuickEntryButton
              key={entry.id}
              entry={entry}
              onClick={() => onQuestionSelect(entry.query)}
            />
          ))}
        </motion.div>
        
        {/* 分类标题 */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1D2129] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1664FF]" />
            全部测试场景
            <span className="text-sm font-normal text-[#4E5969]">
              ({TEST_QUESTIONS.reduce((acc, cat) => acc + cat.questions.length, 0)}个问题)
            </span>
          </h2>
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-sm text-[#1664FF] hover:text-[#0E52D9] font-medium transition-colors"
          >
            {showAllCategories ? '收起' : '展开全部'}
          </button>
        </div>
        
        {/* 分类网格 */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {visibleCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isExpanded={expandedCategory === category.id}
              onToggle={() => setExpandedCategory(
                expandedCategory === category.id ? null : category.id
              )}
              onSelect={onQuestionSelect}
            />
          ))}
        </motion.div>
        
        {/* 展开更多按钮 */}
        {!showAllCategories && TEST_QUESTIONS.length > 6 && (
          <div className="text-center">
            <button
              onClick={() => setShowAllCategories(true)}
              className={clsx(
                'inline-flex items-center gap-2 px-6 py-2.5 rounded-full',
                'bg-[#E8F0FF] hover:bg-[#D6E7FF] text-[#1664FF]',
                'transition-colors text-sm font-medium'
              )}
            >
              查看更多分类
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* 统计信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-[#86909C] pt-4 border-t border-[#E8F0FF]"
        >
          基于 TEST_CASES.md 和 TEST_NARRATIVE_STORY.md 的完整测试集 | 
          共 {TEST_QUESTIONS.length} 个分类，
          {TEST_QUESTIONS.reduce((acc, cat) => acc + cat.questions.length, 0)} 个测试问题
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;


