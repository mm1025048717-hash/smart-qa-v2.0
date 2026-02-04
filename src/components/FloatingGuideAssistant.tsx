/**
 * 浮动数字员工助手组件
 * 右下角浮动显示，首次访问自动展开引导演示
 * 支持问答功能，帮助用户了解产品使用方法
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  ChevronRight,
  Sparkles,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Send,
  Bot,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import clsx from 'clsx';

interface FloatingGuideAssistantProps {
  onQuestionSelect?: (question: string) => void;
  onStartTour?: () => void;
  agentName?: string;
  agentAvatar?: string;
  /** 外部触发自动打开（如角色选择完成后） */
  autoOpen?: boolean;
  /** 自动打开完成后的回调 */
  onAutoOpenComplete?: () => void;
  /** 用户角色名称 */
  userRole?: string;
}

// 引导步骤 - 精简为3步，减少用户认知负担（支持角色定制）
const getGuideSteps = (userRole?: string, agentName?: string) => [
  {
    id: 'welcome',
    title: userRole ? `${userRole}，欢迎使用` : '欢迎使用 Data Agent',
    description: agentName
      ? `我已为您推荐了 ${agentName}，TA 最适合您的分析场景`
      : '我是您的智能数据分析助手，帮您快速获取业务洞察',
    icon: Bot,
    tip: '随时点击右下角找我帮忙',
  },
  {
    id: 'input',
    title: '第一步：输入您的问题',
    description: '在上方输入框直接用自然语言提问，如"今年销售额是多少"',
    icon: MessageCircle,
    tip: '像和同事聊天一样简单',
  },
  {
    id: 'explore',
    title: '第二步：查看并探索结果',
    description: '我会展示数据和图表，点击"探索"可以进一步下钻分析',
    icon: Sparkles,
    tip: '发现异常？点我找原因',
  },
];

// 常见问题
const FAQ_ITEMS = [
  {
    id: 'q1',
    question: '如何开始数据分析？',
    answer: '直接在输入框输入问题，或点击下方快捷场景按钮即可开始。例如输入"今年销售额是多少"。',
  },
  {
    id: 'q2',
    question: '可以分析哪些数据？',
    answer: '支持销售、订单、用户、库存等多维度数据分析，包括趋势分析、对比分析、归因分析等。',
  },
  {
    id: 'q3',
    question: '数字员工有什么用？',
    answer: '不同数字员工有不同专长，如Alisa擅长精准查询，归因哥擅长根因分析，可根据需求切换。',
  },
  {
    id: 'q4',
    question: '如何查看分析结果？',
    answer: '提问后，系统会自动展示KPI卡片、图表和分析建议，可点击"探索"进一步深入分析。',
  },
];

// 快捷提问 - 覆盖最常用的分析场景
const QUICK_QUESTIONS = [
  { id: 'sales', text: '今年销售额是多少', icon: BarChart3, description: '查看核心指标' },
  { id: 'trend', text: '近3个月销售趋势', icon: TrendingUp, description: '了解变化情况' },
  { id: 'compare', text: '各地区销售对比', icon: Users, description: '对比分析' },
  { id: 'anomaly', text: '为什么销售下降了', icon: HelpCircle, description: '智能归因分析' },
];

// 本地存储 key
const STORAGE_KEY = 'yiwen_guide_completed';
const FIRST_VISIT_KEY = 'yiwen_first_visit';

export const FloatingGuideAssistant = ({
  onQuestionSelect,
  agentName = '小助手',
  agentAvatar,
  autoOpen = false,
  onAutoOpenComplete,
  userRole,
}: FloatingGuideAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'faq' | 'quick'>('guide');
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [showRoleWelcome, setShowRoleWelcome] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 基于用户角色动态生成引导步骤
  const guideSteps = getGuideSteps(userRole, agentName);

  // 处理外部触发的自动打开（角色选择后）
  useEffect(() => {
    // 当 autoOpen 为 true 时，立即打开引导面板
    if (autoOpen) {
      // 角色选择后延迟一点打开，让用户看到主界面
      const timer = setTimeout(() => {
        setIsOpen(true);
        setShowRoleWelcome(true);
        setActiveTab('guide');
        setCurrentStep(0);
        // 通知父组件已完成自动打开
        onAutoOpenComplete?.();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoOpen, onAutoOpenComplete]);

  // 检查是否首次访问（仅在没有外部触发且没有角色选择流程时）
  useEffect(() => {
    // 如果有角色选择流程或 autoOpen 为 true，跳过首次访问逻辑
    if (autoOpen || userRole) return;
    const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
    if (!hasVisited) {
      // 首次访问，延迟显示引导
      setIsFirstVisit(true);
      const timer = setTimeout(() => {
        setIsOpen(true);
        setShowTooltip(true);
        localStorage.setItem(FIRST_VISIT_KEY, 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [autoOpen, userRole]);

  // 打开面板时自动聚焦
  useEffect(() => {
    if (isOpen && activeTab === 'quick') {
      inputRef.current?.focus();
    }
  }, [isOpen, activeTab]);

  const handleQuestionClick = (question: string) => {
    if (onQuestionSelect) {
      onQuestionSelect(question);
      setIsOpen(false);
    }
  };

  const handleInputSubmit = () => {
    if (inputValue.trim() && onQuestionSelect) {
      onQuestionSelect(inputValue.trim());
      setInputValue('');
      setIsOpen(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 引导完成
      localStorage.setItem(STORAGE_KEY, 'true');
      setActiveTab('quick');
      setCurrentStep(0);
      setShowRoleWelcome(false);
    }
  };

  const handleSkipGuide = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setActiveTab('quick');
    setShowRoleWelcome(false);
  };

  const currentGuideStep = guideSteps[currentStep];
  const GuideIcon = currentGuideStep?.icon || Bot;

  return (
    <>
      {/* 浮动按钮 */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        className="fixed bottom-6 right-6 z-50"
      >
        {/* 提示气泡 - 首次访问时显示更友好的引导 */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-4"
            >
              <div className="relative bg-white/92 backdrop-blur-xl rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.18)] border border-black/5 px-4 py-3 max-w-[280px]">
                <button
                  type="button"
                  onClick={() => setShowTooltip(false)}
                  className="absolute right-2 top-2 w-7 h-7 rounded-full hover:bg-black/5 transition-colors flex items-center justify-center"
                  aria-label="关闭提示"
                >
                  <X className="w-4 h-4 text-[#86868B]" />
                </button>

                <div className="flex items-start gap-3 pr-6">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-black/5 bg-[#F5F5F7] flex-shrink-0">
                    {agentAvatar ? (
                      <img src={agentAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#1D1D1F] text-white flex items-center justify-center text-xs font-semibold">
                        {agentName.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-[#1D1D1F] font-semibold">
                      {userRole ? `${userRole}，你好！` : `你好，我是 ${agentName}`}
                    </p>
                    <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                      {userRole 
                        ? `我是 ${agentName}，您的专属数字员工。让我来教您如何快速获取业务洞察！`
                        : '第一次来？点我带你 30 秒上手：指标、趋势、归因都能一句话搞定。'
                      }
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-[#007AFF] font-medium">
                      <span>{userRole ? '开始引导' : '点这里开始'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* 小箭头（气泡 → 按钮） */}
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white/92 backdrop-blur-xl border-r border-b border-black/5 transform rotate-45" />

                {/* 贾维斯式指向箭头（更明确） */}
                <motion.div
                  aria-hidden="true"
                  className="absolute -bottom-12 right-8 pointer-events-none"
                  animate={{ y: [0, 6, 0], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                    <path
                      d="M6 16 C 24 18, 30 30, 38 40"
                      stroke="rgba(0,0,0,0.45)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M34 38 L 40 42 L 42 35"
                      stroke="rgba(0,0,0,0.45)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 主按钮 - Apple Style: 纯色背景，无渐变，极致简约 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className={clsx(
            'w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300',
            'shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]', // Apple style soft shadow
            isOpen
              ? 'bg-[#F5F5F7] text-[#1D1D1F] border border-black/5'
              : 'bg-[#1D1D1F] text-white' // 黑色背景，白色图标，极简有力
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                {agentAvatar ? (
                  <img src={agentAvatar} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <MessageCircle className="w-6 h-6" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 首次访问呼吸动画 - 改为更微妙的光圈 */}
          {isFirstVisit && !isOpen && (
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute inset-0 rounded-full bg-white/20"
            />
          )}
        </motion.button>
      </motion.div>

      {/* 展开的面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-white/20 overflow-hidden ring-1 ring-black/5"
          >
            {/* 头部 - 极简纯色 */}
            <div className="px-6 pt-5 pb-2 bg-transparent relative">
              {/* 右上角关闭按钮 */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] flex items-center justify-center transition-colors"
                aria-label="关闭"
              >
                <X className="w-4 h-4 text-[#86868B]" />
              </button>

              <div className="flex items-center gap-4 pr-8">
                <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center shadow-inner">
                  {agentAvatar ? (
                    <img src={agentAvatar} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <Bot className="w-6 h-6 text-[#1D1D1F]" />
                  )}
                </div>
                <div>
                  <h3 className="text-[#1D1D1F] text-lg font-semibold tracking-tight">{agentName}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <p className="text-[#86868B] text-xs font-medium">Online</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 自定义 Tab 切换 - iOS Segmented Control 风格 */}
            <div className="px-6 py-2">
              <div className="flex p-1 bg-[#F5F5F7] rounded-xl">
                {[
                  { id: 'guide', label: '引导' },
                  { id: 'faq', label: '问答' },
                  { id: 'quick', label: '快捷' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={clsx(
                      'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
                      activeTab === tab.id
                        ? 'bg-white text-[#1D1D1F] shadow-sm'
                        : 'text-[#86868B] hover:text-[#1D1D1F]'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 内容区 */}
            <div className="px-6 pb-6 pt-2">
              <AnimatePresence mode="wait">
                {/* 新手引导 */}
                {activeTab === 'guide' && (
                  <motion.div
                    key="guide"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 mt-2"
                  >
                    {/* 角色欢迎信息（角色选择后显示） */}
                    {showRoleWelcome && userRole && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-[#007AFF]/5 to-[#5856D6]/5 rounded-2xl p-4 border border-[#007AFF]/10"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                          <span className="text-[13px] font-semibold text-[#1D1D1F]">
                            已识别：{userRole}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#86868B] leading-relaxed">
                          已为您推荐最适合的数字员工 <span className="font-medium text-[#007AFF]">{agentName}</span>，接下来我来教您快速上手！
                        </p>
                      </motion.div>
                    )}

                    {/* 当前步骤 */}
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#F5F5F7] flex items-center justify-center">
                        <GuideIcon className="w-10 h-10 text-[#1D1D1F]" strokeWidth={1.5} />
                      </div>
                      <h4 className="text-xl font-semibold text-[#1D1D1F] mb-3 tracking-tight">
                        {currentGuideStep.title}
                      </h4>
                      <p className="text-[15px] text-[#86868B] leading-relaxed px-2">
                        {currentGuideStep.description}
                      </p>
                      
                      {/* 小贴士 */}
                      {(currentGuideStep as any).tip && (
                        <div className="mt-6 px-4 py-3 bg-[#F5F5F7] rounded-2xl">
                          <p className="text-xs text-[#86868B] flex items-center justify-center gap-2">
                            <Lightbulb className="w-3.5 h-3.5" />
                            {(currentGuideStep as any).tip}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 进度指示器 */}
                    <div className="flex justify-center gap-1.5">
                      {guideSteps.map((s, index) => (
                        <div
                          key={s.id}
                          onClick={() => setCurrentStep(index)}
                          className={clsx(
                            'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                            index === currentStep
                              ? 'w-6 bg-[#1D1D1F]'
                              : 'w-1.5 bg-[#E5E5EA]'
                          )}
                        />
                      ))}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          handleSkipGuide();
                          setShowRoleWelcome(false);
                        }}
                        className="flex-1 py-3 text-[13px] font-medium text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-2xl transition-all"
                      >
                        跳过
                      </button>
                      <button
                        onClick={handleNextStep}
                        className="flex-1 py-3 text-[13px] font-medium text-white bg-[#1D1D1F] hover:bg-[#000000] rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-black/10"
                      >
                        {currentStep < guideSteps.length - 1 ? (
                          <>
                            下一步
                            <ChevronRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            开始体验
                            <CheckCircle2 className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* 快速开始按钮 */}
                    <button
                      onClick={() => {
                        handleSkipGuide();
                        setShowRoleWelcome(false);
                        setActiveTab('quick');
                      }}
                      className="w-full py-3 text-[13px] font-medium text-[#007AFF] bg-[#007AFF]/5 hover:bg-[#007AFF]/10 rounded-2xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      直接提问
                    </button>
                  </motion.div>
                )}

                {/* 常见问题 */}
                {activeTab === 'faq' && (
                  <motion.div
                    key="faq"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3 mt-2"
                  >
                    {FAQ_ITEMS.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#F5F5F7] bg-white overflow-hidden transition-all hover:border-[#E5E5EA]"
                      >
                        <button
                          onClick={() =>
                            setExpandedFaq(expandedFaq === item.id ? null : item.id)
                          }
                          className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors"
                        >
                          <span className="text-[14px] font-medium text-[#1D1D1F]">
                            {item.question}
                          </span>
                          <ChevronRight
                            className={clsx(
                              'w-4 h-4 text-[#C7C7CC] transition-transform duration-300',
                              expandedFaq === item.id && 'rotate-90 text-[#1D1D1F]'
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {expandedFaq === item.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-4 text-[13px] text-[#86868B] leading-relaxed">
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* 快捷提问 */}
                {activeTab === 'quick' && (
                  <motion.div
                    key="quick"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 mt-2"
                  >
                    {/* 输入框 */}
                    <div className="relative group">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                        placeholder='输入分析问题，如"今年销售额"'
                        className="w-full px-4 py-3.5 pr-12 text-[15px] text-[#1D1D1F] placeholder:text-[#86868B] bg-[#F5F5F7] hover:bg-[#EAEAEB] focus:bg-white border border-transparent focus:border-[#007AFF]/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10 transition-all"
                      />
                      <button
                        onClick={handleInputSubmit}
                        disabled={!inputValue.trim()}
                        className={clsx(
                          'absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                          inputValue.trim()
                            ? 'bg-[#1D1D1F] text-white shadow-md transform hover:scale-105'
                            : 'bg-transparent text-[#C7C7CC] cursor-not-allowed'
                        )}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 快捷问题 */}
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-[#86868B] mb-3 ml-1">
                        猜你想问
                      </p>
                      <div className="grid gap-2">
                        {QUICK_QUESTIONS.map((q) => {
                          const Icon = q.icon;
                          return (
                            <button
                              key={q.id}
                              onClick={() => handleQuestionClick(q.text)}
                              className="w-full p-4 text-left bg-white border border-[#F5F5F7] hover:border-[#E5E5EA] hover:shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] rounded-2xl transition-all flex items-center gap-4 group"
                            >
                              <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] group-hover:bg-[#007AFF] group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors text-[#1D1D1F]">
                                <Icon className="w-5 h-5" strokeWidth={1.5} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="block text-[14px] font-medium text-[#1D1D1F] mb-0.5 group-hover:text-[#007AFF] transition-colors">
                                  {q.text}
                                </span>
                                <span className="text-[12px] text-[#86868B]">{q.description}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingGuideAssistant;
