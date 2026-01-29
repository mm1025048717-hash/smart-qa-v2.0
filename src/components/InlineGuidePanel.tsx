/**
 * 内联引导面板组件
 * 直接显示在智能问答主界面中，无需弹窗
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

interface InlineGuidePanelProps {
  onQuestionSelect: (question: string, recommendedAgentId?: string) => void;
  currentAgentId?: string;
  recentMetrics?: string[];
}

// 复用EnhancedGuidePanel中的数据结构
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
];

const QUESTION_CATEGORIES = [
  {
    id: 'basic',
    name: '基础查询',
    icon: Search,
    color: 'blue',
    recommendedAgents: ['alisa', 'nora'],
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
    recommendedAgents: ['alisa', 'viz-master'],
    questions: [
      '近3个月销售额趋势',
      '今年销售额变化情况',
      '最近一周订单量波动',
    ]
  },
  {
    id: 'compare',
    name: '对比分析',
    icon: BarChart3,
    color: 'cyan',
    recommendedAgents: ['viz-master', 'alisa'],
    questions: [
      '各地区销售额对比',
      '对比去年和今年营收',
      '各渠道转化率哪个最好',
    ]
  },
  {
    id: 'attribution',
    name: '归因分析',
    icon: Brain,
    color: 'rose',
    recommendedAgents: ['attributor', 'nora'],
    questions: [
      '为什么11月销售额下降了',
      '分析销售额增长原因',
      '利润下滑的影响因素有哪些',
    ]
  },
];

const SMART_SUGGESTIONS = [
  {
    pattern: /销售额|销售|营收/,
    suggestions: [
      '近3个月销售额趋势',
      '各地区销售额对比',
      '为什么销售额下降了',
    ]
  },
  {
    pattern: /订单|订单量/,
    suggestions: [
      '本月订单量有多少',
      '订单量趋势分析',
      '订单量异常检测',
    ]
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200', light: 'bg-cyan-50' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50' },
};

export const InlineGuidePanel = ({
  onQuestionSelect,
  currentAgentId = 'alisa',
  recentMetrics = [],
}: InlineGuidePanelProps) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'metrics' | 'questions'>('quick');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recommendedAgents, setRecommendedAgents] = useState<AgentProfile[]>([]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const matched = SMART_SUGGESTIONS.find(s => s.pattern.test(searchQuery));
      if (matched) {
        setSuggestions(matched.suggestions);
      } else {
        const allQuestions = QUESTION_CATEGORIES.flatMap(cat => cat.questions);
        const filtered = allQuestions.filter(q => 
          q.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 4));
      }
      
      const recommended = getRecommendedAgents(searchQuery, currentAgentId);
      setRecommendedAgents(recommended.slice(0, 3));
    } else {
      setSuggestions([]);
      setRecommendedAgents([]);
    }
  }, [searchQuery, currentAgentId]);

  const handleQuestionClick = (question: string, categoryId?: string) => {
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

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      {/* 搜索栏 */}
      <div className="mb-6">
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
      <div className="flex border-b border-[#E5E5EA] mb-6">
        {[
          { id: 'quick', label: '快速开始', icon: Zap },
          { id: 'metrics', label: '可用指标', icon: BarChart3 },
          { id: 'questions', label: '示例问题', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'px-6 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-all border-b-2',
                activeTab === tab.id
                  ? 'text-[#1664FF] border-[#1664FF]'
                  : 'text-[#86909C] border-transparent hover:text-[#1D2129]'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 内容区域 */}
      <AnimatePresence mode="wait">
        {activeTab === 'quick' && (
          <motion.div
            key="quick"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* 快速入口 */}
            <div>
              <h3 className="text-sm font-semibold text-[#1D2129] mb-4">常用场景</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {QUESTION_CATEGORIES.slice(0, 6).map((category) => {
                  const colors = colorMap[category.color];
                  const Icon = category.icon;
                  const recommendedAgentsInfo = category.recommendedAgents
                    .map(id => ALL_AGENTS.find(a => a.id === id))
                    .filter((a): a is AgentProfile => a !== undefined)
                    .slice(0, 1);
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleQuestionClick(category.questions[0], category.id)}
                      className="p-4 rounded-xl border border-[#E5E5EA] bg-white hover:border-[#1664FF] hover:bg-[#F0F7FF] transition-all text-left group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={clsx('p-1.5 rounded-lg', colors.light)}>
                          <Icon className={clsx('w-4 h-4', colors.text)} />
                        </div>
                        <span className="text-sm font-medium text-[#1D2129]">{category.name}</span>
                      </div>
                      <p className="text-xs text-[#86909C] mb-2 line-clamp-1">{category.questions[0]}</p>
                      {recommendedAgentsInfo.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <SparklesIcon className="w-3 h-3 text-[#1664FF]" />
                          <span className="text-[10px] text-[#1664FF]">
                            {recommendedAgentsInfo[0].name}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'metrics' && (
          <motion.div
            key="metrics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
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
                                    onClick={() => handleQuestionClick(example)}
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
          </motion.div>
        )}

        {activeTab === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {QUESTION_CATEGORIES.map((category) => {
              const colors = colorMap[category.color];
              const Icon = category.icon;
              const recommendedAgentsInfo = category.recommendedAgents
                .map(id => ALL_AGENTS.find(a => a.id === id))
                .filter((a): a is AgentProfile => a !== undefined)
                .slice(0, 2);
              
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
                    {recommendedAgentsInfo.length > 0 && (
                      <div className="flex items-center gap-1">
                        {recommendedAgentsInfo.map((agent) => (
                          <div
                            key={agent.id}
                            className="flex items-center gap-1 px-2 py-0.5 bg-[#F0F7FF] rounded-full border border-[#E8F0FF]"
                            title={`推荐使用 ${agent.name}`}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};



