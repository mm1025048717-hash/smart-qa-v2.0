/**
 * 增强引导面板组件
 * 解决用户不知道如何提问和有哪些指标可以提问的问题
 * 包括：可用指标列表、示例问题、智能建议、功能路线图
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Search,
  Sparkles,
  ChevronDown,
  ChevronRight,
  X,
  Lightbulb,
  Zap,
  AlertTriangle,
  Target,
  BookOpen,
  ArrowRight,
  Layers,
  Award,
  Brain,
  Presentation,
  Bell,
  Clock,
  Rocket,
  Sparkles as SparklesIcon
} from 'lucide-react';
import clsx from 'clsx';
import { getRecommendedAgents } from '../services/agentSwitchDetector';
import { ALL_AGENTS } from '../services/agents/index';
import type { AgentProfile } from '../types';

interface EnhancedGuidePanelProps {
  onQuestionSelect: (question: string, recommendedAgentId?: string) => void;
  onClose?: () => void;
  availableMetrics?: string[];
  recentMetrics?: string[];
  currentAgentId?: string;
}

// 可用指标分类
const METRIC_CATEGORIES = [
  {
    id: 'sales',
    name: '销售指标',
    icon: BarChart3,
    color: 'blue',
    metrics: [
      { name: '销售额', examples: ['今年销售额是多少', '近3个月销售额趋势'] },
      { name: '订单量', examples: ['本月订单量有多少', '订单量趋势'] },
      { name: '客单价', examples: ['平均客单价', '客单价变化'] },
      { name: 'GMV', examples: ['商品交易总额', 'GMV增长情况'] },
    ]
  },
  {
    id: 'operation',
    name: '运营指标',
    icon: Target,
    color: 'emerald',
    metrics: [
      { name: '坪效', examples: ['门店坪效分析', '坪效排名'] },
      { name: '翻台率', examples: ['翻台率情况', '翻台率对比'] },
      { name: '人效', examples: ['人均销售额', '人效分析'] },
      { name: '转化率', examples: ['转化率是多少', '转化率趋势'] },
    ]
  },
  {
    id: 'inventory',
    name: '库存指标',
    icon: Layers,
    color: 'amber',
    metrics: [
      { name: '库存周转率', examples: ['库存周转率', '周转率分析'] },
      { name: '缺货率', examples: ['缺货率监控', '缺货情况'] },
      { name: '售罄率', examples: ['售罄率', '商品售罄情况'] },
      { name: '连带率', examples: ['平均每单件数', '连带率分析'] },
    ]
  },
  {
    id: 'user',
    name: '用户指标',
    icon: Award,
    color: 'violet',
    metrics: [
      { name: '日活(DAU)', examples: ['日活数据', '日活跃用户'] },
      { name: '月活(MAU)', examples: ['月活数据', '月活跃用户'] },
      { name: '复购率', examples: ['复购率', '用户复购情况'] },
      { name: '用户数', examples: ['用户总数', '新增用户'] },
    ]
  },
  {
    id: 'marketing',
    name: '营销指标',
    icon: Zap,
    color: 'rose',
    metrics: [
      { name: 'ROI', examples: ['活动ROI', '营销ROI分析'] },
      { name: '转化率', examples: ['渠道转化率', '转化率对比'] },
      { name: '会员复购率', examples: ['会员复购', '会员活跃度'] },
    ]
  },
];

// 示例问题分类（包含推荐的AI员工）
const QUESTION_CATEGORIES = [
  {
    id: 'basic',
    name: '基础查询',
    icon: Search,
    color: 'blue',
    recommendedAgents: ['alisa', 'nora'], // Alisa(最快最准), Nora(语义理解)
    questions: [
      '今年销售额是多少',
      '本月订单量有多少',
      '当前库存数值',
      '销售额和订单量',
    ]
  },
  {
    id: 'trend',
    name: '趋势分析',
    icon: TrendingUp,
    color: 'emerald',
    recommendedAgents: ['alisa', 'viz-master'], // Alisa(精准查询), 可视化小王(图表展示)
    questions: [
      '近3个月销售额趋势',
      '今年销售额变化情况',
      '最近一周订单量波动',
      '销售额增长趋势',
    ]
  },
  {
    id: 'compare',
    name: '对比分析',
    icon: BarChart3,
    color: 'cyan',
    recommendedAgents: ['viz-master', 'alisa'], // 可视化小王(图表), Alisa(数据查询)
    questions: [
      '各地区销售额对比',
      '对比去年和今年营收',
      '各渠道转化率哪个最好',
      '分产品线看销量',
    ]
  },
  {
    id: 'composition',
    name: '构成分析',
    icon: PieChart,
    color: 'amber',
    recommendedAgents: ['viz-master', 'alisa'], // 可视化小王(饼图), Alisa(数据查询)
    questions: [
      '销售渠道占比分析',
      '各品类销售额构成',
      '用户年龄分布比例',
      '地区销售分布',
    ]
  },
  {
    id: 'attribution',
    name: '归因分析',
    icon: Brain,
    color: 'rose',
    recommendedAgents: ['attributor', 'nora'], // 归因哥(专业归因), Nora(深度分析)
    questions: [
      '为什么11月销售额下降了',
      '分析销售额增长原因',
      '利润下滑的影响因素有哪些',
      '华东区销售下降的原因',
    ]
  },
  {
    id: 'anomaly',
    name: '异常检测',
    icon: AlertTriangle,
    color: 'red',
    recommendedAgents: ['attributor', 'data-detective'], // 归因哥(异常诊断), 福尔摩斯(数据侦探)
    questions: [
      '找出异常交易数据',
      '昨天订单量突降原因',
      '检测销售额不正常的区域',
      '昨天订单量是不是有问题',
    ]
  },
];

// 功能路线图
const ROADMAP_FEATURES = [
  {
    id: 'attribution',
    name: '智能归因',
    icon: Brain,
    status: 'available',
    description: '一键分析指标波动原因',
    examples: ['为什么销售额下降了', '分析增长原因'],
    badge: '已上线'
  },
  {
    id: 'alert',
    name: '智能预警',
    icon: Bell,
    status: 'coming',
    description: '通过问答设置预警规则',
    examples: ['当销售额下降10%时提醒我', '设置库存预警'],
    badge: '即将上线',
    comingSoon: true
  },
  {
    id: 'ppt',
    name: 'PPT生成',
    icon: Presentation,
    status: 'coming',
    description: '自动生成数据分析PPT',
    examples: ['生成销售分析PPT', '制作月度报告'],
    badge: '规划中',
    comingSoon: true
  },
  {
    id: 'insight',
    name: '智能洞察',
    icon: Sparkles,
    status: 'coming',
    description: '自动发现数据中的洞察',
    examples: ['发现数据异常', '找出增长机会'],
    badge: '规划中',
    comingSoon: true
  },
];

// 智能建议模板
const SMART_SUGGESTIONS = [
  {
    pattern: /销售额|销售|营收/,
    suggestions: [
      '近3个月销售额趋势',
      '各地区销售额对比',
      '为什么销售额下降了',
      '销售额和订单量',
    ]
  },
  {
    pattern: /订单|订单量/,
    suggestions: [
      '本月订单量有多少',
      '订单量趋势分析',
      '订单量异常检测',
      '订单量和销售额',
    ]
  },
  {
    pattern: /趋势|变化|波动/,
    suggestions: [
      '近3个月销售额趋势',
      '今年销售额变化情况',
      '最近一周订单量波动',
      '趋势预测分析',
    ]
  },
  {
    pattern: /对比|比较/,
    suggestions: [
      '各地区销售额对比',
      '对比去年和今年营收',
      '各渠道转化率对比',
      '品牌销售额对比',
    ]
  },
  {
    pattern: /为什么|原因|下降|增长/,
    suggestions: [
      '为什么11月销售额下降了',
      '分析销售额增长原因',
      '利润下滑的影响因素',
      '华东区销售下降的原因',
    ]
  },
];

export const EnhancedGuidePanel = ({
  onQuestionSelect,
  onClose,
  recentMetrics = [],
  currentAgentId = 'alisa',
}: EnhancedGuidePanelProps) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'questions' | 'roadmap'>('metrics');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recommendedAgents, setRecommendedAgents] = useState<AgentProfile[]>([]);

  // 根据搜索查询生成建议和推荐AI员工
  useEffect(() => {
    if (searchQuery.trim()) {
      const matched = SMART_SUGGESTIONS.find(s => s.pattern.test(searchQuery));
      if (matched) {
        setSuggestions(matched.suggestions);
      } else {
        // 模糊匹配
        const allQuestions = QUESTION_CATEGORIES.flatMap(cat => cat.questions);
        const filtered = allQuestions.filter(q => 
          q.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 4));
      }
      
      // 根据搜索内容推荐AI员工
      const recommended = getRecommendedAgents(searchQuery, currentAgentId);
      setRecommendedAgents(recommended.slice(0, 3)); // 最多显示3个推荐
    } else {
      setSuggestions([]);
      setRecommendedAgents([]);
    }
  }, [searchQuery, currentAgentId]);

  const handleMetricClick = (example: string) => {
    // 根据问题推荐AI员工
    const recommended = getRecommendedAgents(example, currentAgentId);
    const bestAgent = recommended[0];
    onQuestionSelect(example, bestAgent?.id);
  };

  const handleQuestionClick = (question: string, categoryId?: string) => {
    // 优先使用分类推荐的员工，否则根据问题内容推荐
    let recommendedAgentId: string | undefined;
    
    if (categoryId) {
      const category = QUESTION_CATEGORIES.find(c => c.id === categoryId);
      if (category && category.recommendedAgents.length > 0) {
        recommendedAgentId = category.recommendedAgents[0];
      }
    }
    
    if (!recommendedAgentId) {
      const recommended = getRecommendedAgents(question, currentAgentId);
      recommendedAgentId = recommended[0]?.id;
    }
    
    onQuestionSelect(question, recommendedAgentId);
  };

  const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-200', light: 'bg-violet-50' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200', light: 'bg-cyan-50' },
    red: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200', light: 'bg-red-50' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-[#E5E5EA] overflow-hidden"
    >
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-[#E5E5EA] bg-gradient-to-r from-[#F5F9FF] to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1664FF] to-[#4E8CFF] flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1D2129]">智能引导</h2>
            <p className="text-xs text-[#86909C]">了解可用指标和提问方式</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#F5F5F7] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#86909C]" />
          </button>
        )}
      </div>

      {/* 搜索栏 */}
      <div className="px-6 py-4 border-b border-[#E5E5EA] bg-[#F9F9FB]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86909C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="输入关键词，获取智能建议..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm text-[#1D2129] placeholder:text-[#86909C] focus:outline-none focus:border-[#1664FF] focus:ring-2 focus:ring-[#1664FF]/10 transition-all"
          />
        </div>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-3"
          >
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleQuestionClick(suggestion)}
                  className="px-3 py-1.5 text-xs text-[#1664FF] bg-white border border-[#E8F0FF] rounded-lg hover:bg-[#E8F0FF] hover:border-[#1664FF] transition-all"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
            
            {/* 推荐AI员工 */}
            {recommendedAgents.length > 0 && (
              <div className="pt-2 border-t border-[#E5E5EA]">
                <div className="flex items-center gap-2 mb-2">
                  <SparklesIcon className="w-3.5 h-3.5 text-[#1664FF]" />
                  <span className="text-xs font-medium text-[#86909C]">推荐AI员工</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#F0F7FF] rounded-lg border border-[#E8F0FF]"
                    >
                      {agent.avatar ? (
                        <img 
                          src={agent.avatar} 
                          alt={agent.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1664FF] to-[#4E8CFF] flex items-center justify-center text-white text-[10px] font-semibold">
                          {agent.name.slice(0, 1)}
                        </div>
                      )}
                      <span className="text-xs text-[#1D2129] font-medium">{agent.name}</span>
                      <span className="text-[10px] text-[#86909C]">{agent.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-[#E5E5EA] bg-[#F9F9FB]">
        {[
          { id: 'metrics', label: '可用指标', icon: BarChart3 },
          { id: 'questions', label: '示例问题', icon: BookOpen },
          { id: 'roadmap', label: '功能路线图', icon: Rocket },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'flex-1 px-6 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'text-[#1664FF] border-b-2 border-[#1664FF] bg-white'
                  : 'text-[#86909C] hover:text-[#1D2129] hover:bg-white/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#1D2129] mb-2">指标分类</h3>
                <p className="text-xs text-[#86909C]">点击示例问题快速提问</p>
              </div>
              
              {METRIC_CATEGORIES.map((category) => {
                const colors = colorMap[category.color];
                const Icon = category.icon;
                const isExpanded = expandedCategory === category.id;
                
                return (
                  <motion.div
                    key={category.id}
                    layout
                    className="rounded-xl border transition-all"
                    style={{ borderColor: isExpanded ? '#1664FF' : '#E5E5EA' }}
                  >
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F9F9FB] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={clsx('p-2 rounded-lg', colors.light)}>
                          <Icon className={clsx('w-4 h-4', colors.text)} />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-[#1D2129] text-sm">{category.name}</div>
                          <div className="text-xs text-[#86909C]">{category.metrics.length} 个指标</div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[#86909C]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#86909C]" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            {category.metrics.map((metric, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-[#F9F9FB] rounded-lg p-3"
                              >
                                <div className="font-medium text-sm text-[#1D2129] mb-2">{metric.name}</div>
                                <div className="flex flex-wrap gap-2">
                                  {metric.examples.map((example, exIndex) => (
                                    <button
                                      key={exIndex}
                                      onClick={() => handleMetricClick(example)}
                                      className="px-3 py-1.5 text-xs text-[#1664FF] bg-white border border-[#E8F0FF] rounded-lg hover:bg-[#E8F0FF] hover:border-[#1664FF] transition-all flex items-center gap-1"
                                    >
                                      {example}
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* 最近使用的指标 */}
              {recentMetrics.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#E5E5EA]">
                  <h3 className="text-sm font-semibold text-[#1D2129] mb-3">最近使用</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentMetrics.map((metric, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuestionClick(`查看${metric}`)}
                        className="px-3 py-1.5 text-xs text-[#1664FF] bg-[#E8F0FF] rounded-lg hover:bg-[#D6E7FF] transition-colors"
                      >
                        {metric}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#1D2129] mb-2">问题分类</h3>
                <p className="text-xs text-[#86909C]">点击问题快速开始分析</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUESTION_CATEGORIES.map((category) => {
                  const colors = colorMap[category.color];
                  const Icon = category.icon;
                  
                  // 获取推荐的AI员工信息
                  const recommendedAgentsInfo = category.recommendedAgents
                    .map(id => ALL_AGENTS.find(a => a.id === id))
                    .filter((a): a is AgentProfile => a !== undefined)
                    .slice(0, 2); // 最多显示2个推荐员工
                  
                  return (
                    <motion.div
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      className="rounded-xl border border-[#E5E5EA] bg-white p-4 hover:border-[#1664FF] transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={clsx('p-2 rounded-lg', colors.light)}>
                            <Icon className={clsx('w-4 h-4', colors.text)} />
                          </div>
                          <div className="font-medium text-sm text-[#1D2129]">{category.name}</div>
                        </div>
                        
                        {/* 推荐AI员工标签 */}
                        {recommendedAgentsInfo.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <SparklesIcon className="w-3 h-3 text-[#1664FF]" />
                            <div className="flex items-center gap-1">
                              {recommendedAgentsInfo.map((agent) => (
                                <div
                                  key={agent.id}
                                  className="flex items-center gap-1 px-2 py-0.5 bg-[#F0F7FF] rounded-full border border-[#E8F0FF]"
                                  title={`推荐使用 ${agent.name} (${agent.title})`}
                                >
                                  {agent.avatar ? (
                                    <img 
                                      src={agent.avatar} 
                                      alt={agent.name}
                                      className="w-4 h-4 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#1664FF] to-[#4E8CFF] flex items-center justify-center text-white text-[8px] font-semibold">
                                      {agent.name.slice(0, 1)}
                                    </div>
                                  )}
                                  <span className="text-[10px] text-[#1664FF] font-medium">{agent.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {category.questions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuestionClick(question, category.id)}
                            className="w-full text-left px-3 py-2 text-xs text-[#1D2129] bg-[#F9F9FB] rounded-lg hover:bg-[#E8F0FF] hover:text-[#1664FF] transition-all flex items-center justify-between group"
                          >
                            <span>{question}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'roadmap' && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#1D2129] mb-2">功能路线图</h3>
                <p className="text-xs text-[#86909C]">了解已上线和即将推出的功能</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROADMAP_FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  const isAvailable = feature.status === 'available';
                  
                  return (
                    <motion.div
                      key={feature.id}
                      whileHover={{ scale: 1.02 }}
                      className={clsx(
                        'rounded-xl border p-4 transition-all',
                        isAvailable
                          ? 'border-[#1664FF] bg-gradient-to-br from-[#F0F7FF] to-white'
                          : 'border-[#E5E5EA] bg-white opacity-75'
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            'p-2 rounded-lg',
                            isAvailable ? 'bg-[#E8F0FF]' : 'bg-[#F5F5F7]'
                          )}>
                            <Icon className={clsx(
                              'w-5 h-5',
                              isAvailable ? 'text-[#1664FF]' : 'text-[#86909C]'
                            )} />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-[#1D2129]">{feature.name}</div>
                            <div className="text-xs text-[#86909C] mt-0.5">{feature.description}</div>
                          </div>
                        </div>
                        <span className={clsx(
                          'px-2 py-1 text-xs rounded-full',
                          isAvailable
                            ? 'bg-[#E8F0FF] text-[#1664FF]'
                            : 'bg-[#F5F5F7] text-[#86909C]'
                        )}>
                          {feature.badge}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-[#86909C] mb-2">示例问题：</div>
                        {feature.examples.map((example, index) => (
                          <button
                            key={index}
                            onClick={() => isAvailable && handleQuestionClick(example)}
                            disabled={!isAvailable}
                            className={clsx(
                              'w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex items-center justify-between',
                              isAvailable
                                ? 'text-[#1D2129] bg-[#F9F9FB] hover:bg-[#E8F0FF] hover:text-[#1664FF]'
                                : 'text-[#86909C] bg-[#F5F5F7] cursor-not-allowed'
                            )}
                          >
                            <span>{example}</span>
                            {isAvailable && (
                              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        ))}
                      </div>
                      
                      {feature.comingSoon && (
                        <div className="mt-3 pt-3 border-t border-[#E5E5EA] flex items-center gap-2 text-xs text-[#86909C]">
                          <Clock className="w-3 h-3" />
                          <span>即将上线，敬请期待</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

