/**
 * 归因分析演示模块 - 完整展示所有归因交互场景
 * 
 * 功能说明：
 * 1. 演示所有归因触发方式（KPI点击、图表点击、文本内联、直接提问）
 * 2. 展示归因分析的完整流程（匹配→请求→面板→渲染→下钻）
 * 3. 列举所有可能的归因结果类型
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MousePointerClick, 
  BarChart3, 
  MessageSquare, 
  Search,
  ChevronRight,
  Info,
  CheckCircle2,
  Layers,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Zap
} from 'lucide-react';
import clsx from 'clsx';
import { AttributionPanel, generateMockAttributionData, AttributionData } from '../components/AttributionPanel';

// 归因触发方式演示数据
const TRIGGER_DEMOS = [
  {
    id: 'kpi-click',
    title: 'KPI 卡片点击',
    icon: BarChart3,
    description: '点击 KPI 卡片上的"归因"按钮，触发对应指标的归因分析',
    example: '例如：点击"销售额同比+15%"旁边的归因按钮',
    triggerType: '按钮点击',
    color: 'blue',
    mockData: {
      metric: '销售额',
      changeValue: 15,
      changeDirection: 'up' as const,
      changeType: '同比' as const,
      timeRangeLabel: '2024年Q3'
    }
  },
  {
    id: 'chart-click',
    title: '图表归因按钮',
    icon: TrendingUp,
    description: '在同比/环比对比图表中，点击归因按钮分析变化原因',
    example: '例如：年度对比图表右上角的"归因"按钮',
    triggerType: '图表交互',
    color: 'emerald',
    mockData: {
      metric: '月度销售额',
      changeValue: 8.5,
      changeDirection: 'up' as const,
      changeType: '环比' as const,
      timeRangeLabel: '12月'
    }
  },
  {
    id: 'inline-text',
    title: '文本内联归因',
    icon: MessageSquare,
    description: '在叙事文本中，点击带有涨跌幅数据后的"归因"按钮',
    example: '例如：文本"销售额同比增长12.5%[归因]"中的归因按钮',
    triggerType: '内联触发',
    color: 'violet',
    mockData: {
      metric: '营收',
      changeValue: 12.5,
      changeDirection: 'up' as const,
      changeType: '同比' as const,
      timeRangeLabel: '本月'
    }
  },
  {
    id: 'direct-ask',
    title: '直接提问归因',
    icon: Search,
    description: '用户直接询问"为什么销售额下降了"等归因问题',
    example: '问题示例：为什么11月销售额下降了？分析销售额增长原因',
    triggerType: '自然语言',
    color: 'rose',
    mockData: {
      metric: '销售额',
      changeValue: 7.2,
      changeDirection: 'down' as const,
      changeType: '环比' as const,
      timeRangeLabel: '11月'
    }
  }
];

// 归因结果类型
const RESULT_TYPES = [
  {
    id: 'multi-factor',
    title: '多因子归因',
    description: '分析多个维度（地区、渠道、产品等）对指标变化的贡献',
    icon: Layers,
    features: ['贡献度排序', '占比可视化', '支持下钻']
  },
  {
    id: 'trend-analysis',
    title: '趋势归因',
    description: '分析指标在时间维度上的变化趋势及原因',
    icon: TrendingUp,
    features: ['时序对比', '拐点标注', '趋势预测']
  },
  {
    id: 'anomaly-diagnosis',
    title: '异常诊断',
    description: '识别异常数据点并分析可能的原因',
    icon: AlertCircle,
    features: ['异常检测', '根因定位', '影响范围']
  },
  {
    id: 'drill-down',
    title: '下钻探索',
    description: '支持逐层下钻，深入分析某个因子的细节',
    icon: ChevronRight,
    features: ['多层级导航', '面包屑返回', '子因子分析']
  }
];

// 归因流程步骤
const FLOW_STEPS = [
  { step: 1, title: '触发归因', description: '用户点击归因按钮或提问归因问题', icon: MousePointerClick },
  { step: 2, title: '意图识别', description: '系统识别归因意图，提取指标和时间范围', icon: Search },
  { step: 3, title: '数据查询', description: '根据指标和维度查询相关数据', icon: BarChart3 },
  { step: 4, title: '归因计算', description: '计算各维度的贡献度和占比', icon: Zap },
  { step: 5, title: '结果渲染', description: '打开归因面板，展示分析结果', icon: CheckCircle2 }
];

// 颜色映射
const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-200', light: 'bg-violet-50' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50' },
};

export const AttributionDemoPage = () => {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [attributionPanelOpen, setAttributionPanelOpen] = useState(false);
  const [currentAttributionData, setCurrentAttributionData] = useState<AttributionData | null>(null);
  const [showFlowDetails, setShowFlowDetails] = useState(false);
  const [activeFlowStep, setActiveFlowStep] = useState(0);

  // 触发归因演示
  const handleTriggerDemo = (demo: typeof TRIGGER_DEMOS[0]) => {
    setSelectedDemo(demo.id);
    setShowFlowDetails(true);
    setActiveFlowStep(0);

    // 模拟流程执行
    const simulateFlow = async () => {
      for (let i = 0; i <= FLOW_STEPS.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setActiveFlowStep(i);
      }
      
      // 生成归因数据并打开面板
      const data = generateMockAttributionData(
        demo.mockData.metric,
        demo.mockData.changeValue,
        demo.mockData.changeDirection,
        demo.mockData.changeType,
        demo.mockData.timeRangeLabel
      );
      setCurrentAttributionData(data);
      setAttributionPanelOpen(true);
    };

    simulateFlow();
  };

  // 关闭归因面板
  const handleClosePanel = () => {
    setAttributionPanelOpen(false);
    setCurrentAttributionData(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* 顶部导航 */}
      <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-black/5 flex items-center justify-between px-8 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-[#86868b] hover:text-[#007AFF] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">返回主页</span>
          </a>
          <div className="h-5 w-px bg-[#d2d2d7]" />
          <h1 className="text-lg font-semibold text-[#1d1d1f]">归因分析演示模块</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#86868b]">演示所有归因交互场景</span>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 介绍区域 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="bg-gradient-to-br from-[#007AFF]/10 to-[#5856D6]/10 rounded-2xl p-6 border border-[#007AFF]/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#007AFF] flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">什么是归因分析？</h2>
                <p className="text-[#86868b] leading-relaxed">
                  归因分析是一种数据分析方法，用于解释指标变化的原因。当销售额上涨或下降时，
                  归因分析可以告诉你哪些因素（地区、渠道、产品等）贡献了这个变化，以及各因素的贡献程度。
                  这有助于业务决策者快速定位问题或机会点。
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 触发方式演示 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
            <MousePointerClick className="w-5 h-5 text-[#007AFF]" />
            归因触发方式
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRIGGER_DEMOS.map((demo) => {
              const colors = colorMap[demo.color];
              const Icon = demo.icon;
              const isSelected = selectedDemo === demo.id;

              return (
                <motion.div
                  key={demo.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTriggerDemo(demo)}
                  className={clsx(
                    'bg-white rounded-xl p-5 border cursor-pointer transition-all',
                    isSelected ? `${colors.border} shadow-lg ring-2 ring-${demo.color}-500/20` : 'border-[#d2d2d7]/50 hover:border-[#007AFF]/30 hover:shadow-md'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', colors.light)}>
                      <Icon className={clsx('w-5 h-5', colors.text)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-[#1d1d1f]">{demo.title}</h3>
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full', colors.light, colors.text)}>
                          {demo.triggerType}
                        </span>
                      </div>
                      <p className="text-sm text-[#86868b] mb-2">{demo.description}</p>
                      <p className="text-xs text-[#aeaeb2]">{demo.example}</p>
                    </div>
                  </div>
                  
                  {/* 模拟触发器 */}
                  <div className="mt-4 pt-4 border-t border-[#d2d2d7]/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#1d1d1f]">
                          {demo.mockData.metric}
                          <span className={clsx(
                            'ml-1.5 font-semibold',
                            demo.mockData.changeDirection === 'up' ? 'text-[#34C759]' : 'text-[#FF3B30]'
                          )}>
                            {demo.mockData.changeDirection === 'up' ? '+' : '-'}{demo.mockData.changeValue}%
                          </span>
                        </span>
                        {demo.mockData.changeDirection === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-[#34C759]" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-[#FF3B30]" />
                        )}
                      </div>
                      <button
                        className={clsx(
                          'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                          'text-[#007AFF] hover:text-white',
                          'bg-transparent hover:bg-[#007AFF]',
                          'border border-[#007AFF]/30 hover:border-[#007AFF]'
                        )}
                      >
                        归因
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* 归因流程追踪 */}
        <AnimatePresence>
          {showFlowDetails && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-10 overflow-hidden"
            >
              <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#FF9500]" />
                归因流程追踪
              </h2>
              <div className="bg-white rounded-xl p-5 border border-[#d2d2d7]/50">
                <div className="flex items-center justify-between">
                  {FLOW_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === activeFlowStep;
                    const isComplete = index < activeFlowStep;

                    return (
                      <div key={step.step} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <motion.div
                            animate={{
                              scale: isActive ? 1.1 : 1,
                              backgroundColor: isComplete ? '#34C759' : isActive ? '#007AFF' : '#d2d2d7'
                            }}
                            className={clsx(
                              'w-10 h-10 rounded-full flex items-center justify-center transition-colors'
                            )}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : (
                              <Icon className={clsx('w-5 h-5', isActive ? 'text-white' : 'text-[#86868b]')} />
                            )}
                          </motion.div>
                          <span className={clsx(
                            'text-xs mt-2 font-medium text-center',
                            isActive ? 'text-[#007AFF]' : isComplete ? 'text-[#34C759]' : 'text-[#86868b]'
                          )}>
                            {step.title}
                          </span>
                          <span className="text-[10px] text-[#aeaeb2] text-center max-w-[100px] mt-1">
                            {step.description}
                          </span>
                        </div>
                        {index < FLOW_STEPS.length - 1 && (
                          <div className={clsx(
                            'w-12 h-0.5 mx-2',
                            index < activeFlowStep ? 'bg-[#34C759]' : 'bg-[#d2d2d7]'
                          )} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* 归因结果类型 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#5856D6]" />
            归因结果类型
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RESULT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  className="bg-white rounded-xl p-5 border border-[#d2d2d7]/50"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#5856D6]/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#5856D6]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1d1d1f]">{type.title}</h3>
                      <p className="text-sm text-[#86868b] mt-1">{type.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {type.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-2.5 py-1 bg-[#F5F5F7] rounded-full text-[#86868b]"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* 常见归因问题示例 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#34C759]" />
            常见归因问题示例
          </h2>
          <div className="bg-white rounded-xl p-5 border border-[#d2d2d7]/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '为什么销售额下降了？',
                '分析转化率偏低的原因',
                '利润下滑的影响因素',
                '为什么11月销售额下降了？',
                '分析销售额增长原因',
                '12月份的销售额环比？',
                '华东区销售下降的原因',
                '线上渠道增长的驱动因素'
              ].map((question) => (
                <a
                  key={question}
                  href={`/?q=${encodeURIComponent(question)}`}
                  className="flex items-center gap-2 p-3 bg-[#F5F5F7] rounded-lg hover:bg-[#007AFF]/10 transition-colors group"
                >
                  <Search className="w-4 h-4 text-[#86868b] group-hover:text-[#007AFF]" />
                  <span className="text-sm text-[#1d1d1f] group-hover:text-[#007AFF]">{question}</span>
                  <ChevronRight className="w-4 h-4 text-[#86868b] group-hover:text-[#007AFF] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        </motion.section>
      </main>

      {/* 归因面板 */}
      <AttributionPanel
        isOpen={attributionPanelOpen}
        onClose={handleClosePanel}
        data={currentAttributionData}
        isLoading={false}
      />
    </div>
  );
};

export default AttributionDemoPage;

