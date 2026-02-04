import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Users, 
  Layout, 
  Settings, 
  ArrowRight, 
  ChevronRight,
  ChevronDown,
  Home,
  Sparkles,
  Target,
  Layers,
  Workflow,
  Palette,
  Database,
  Code,
  Image,
  Lightbulb,
  ExternalLink,
  ArrowLeft,
  Menu,
  X,
  Play,
  Eye,
  BarChart3,
  LineChart,
  PieChart,
  Search,
  LayoutDashboard,
  Globe,
  Plus,
  Check,
  Clock,
  TrendingUp,
  AlertCircle,
  UserCheck,
  Zap,
  FileBarChart,
  MessageSquare
} from 'lucide-react';
import { 
  AnnotationProvider, 
  AnnotationToolbar, 
  Annotatable, 
  AnnotationSidebar,
  useAnnotations 
} from '../components/AnnotationSystem';

// 章节定义
interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  subsections?: { id: string; title: string }[];
}

const sections: Section[] = [
  { 
    id: 'overview', 
    title: '产品概述', 
    icon: <Target className="w-4 h-4" />,
    subsections: [
      { id: 'positioning', title: '产品定位' },
      { id: 'design-philosophy', title: '设计理念' },
      { id: 'value-proposition', title: '核心价值主张' },
    ]
  },
  { 
    id: 'users', 
    title: '目标用户', 
    icon: <Users className="w-4 h-4" />,
    subsections: [
      { id: 'roles', title: '用户角色定义' },
      { id: 'journey', title: '用户旅程' },
    ]
  },
  { 
    id: 'layout', 
    title: '页面结构与布局', 
    icon: <Layout className="w-4 h-4" />,
    subsections: [
      { id: 'overall-layout', title: '整体布局' },
      { id: 'responsive', title: '响应式适配' },
    ]
  },
  { 
    id: 'features', 
    title: '功能模块详解', 
    icon: <Layers className="w-4 h-4" />,
    subsections: [
      { id: 'sidebar', title: '左侧边栏' },
      { id: 'main-content', title: '主内容区' },
      { id: 'role-picker', title: '角色选择弹窗' },
      { id: 'floating-guide', title: '浮动引导助手' },
      { id: 'onboarding-tour', title: '新手引导（游戏式）' },
    ]
  },
  { 
    id: 'interactions', 
    title: '交互流程', 
    icon: <Workflow className="w-4 h-4" />,
    subsections: [
      { id: 'first-visit', title: '首次访问流程' },
      { id: 'onboarding-flow', title: '新手引导流程' },
      { id: 'question-flow', title: '提问交互流程' },
      { id: 'scenario-flow', title: '场景卡片点击流程' },
      { id: 'agent-switch', title: '数字员工切换流程' },
    ]
  },
  { 
    id: 'ui-spec', 
    title: 'UI 规范', 
    icon: <Palette className="w-4 h-4" />,
    subsections: [
      { id: 'colors', title: '色彩系统' },
      { id: 'typography', title: '字体规范' },
      { id: 'radius', title: '圆角规范' },
      { id: 'shadows', title: '阴影规范' },
      { id: 'animations', title: '动画规范' },
    ]
  },
  { 
    id: 'state', 
    title: '状态管理', 
    icon: <Database className="w-4 h-4" />,
    subsections: [
      { id: 'component-state', title: '组件状态' },
      { id: 'local-storage', title: '本地存储' },
    ]
  },
  { 
    id: 'dependencies', 
    title: '组件依赖', 
    icon: <Code className="w-4 h-4" />,
  },
  { 
    id: 'interfaces', 
    title: '接口定义', 
    icon: <Code className="w-4 h-4" />,
  },
  { 
    id: 'screenshots', 
    title: '原型截图参考', 
    icon: <Image className="w-4 h-4" />,
  },
  { 
    id: 'roadmap', 
    title: '未来规划', 
    icon: <Lightbulb className="w-4 h-4" />,
  },
];

// 用户角色数据
const userRoles = [
  { 
    role: '管理层', 
    description: '关注全局指标、趋势与关键异常', 
    needs: '快速获取KPI、发现问题',
    agent: 'Alisa（自然语言理解）',
    color: '#007AFF'
  },
  { 
    role: '数据分析师', 
    description: '深入分析、洞察归因、出结论', 
    needs: '复杂分析、多维归因',
    agent: 'Nora（语义推理）',
    color: '#5856D6'
  },
  { 
    role: '业务负责人', 
    description: '看业务表现、对比与增长机会', 
    needs: '业绩对比、增长洞察',
    agent: 'Kevin（增长分析师）',
    color: '#34C759'
  },
  { 
    role: '运营', 
    description: '盯运营指标、异常发现与排查', 
    needs: '日常监控、异常预警',
    agent: '运营小美（运营数据分析师）',
    color: '#FF9500'
  },
  { 
    role: '财务', 
    description: '营收、成本、利润与报表整理', 
    needs: '财务报表、成本分析',
    agent: 'Lisa（报表分析师）',
    color: '#FF2D55'
  },
  { 
    role: '新手/快速上手', 
    description: '一步步引导，快速完成分析任务', 
    needs: '简单易用、引导清晰',
    agent: 'Alisa（最简单易用）',
    color: '#5AC8FA'
  },
];

// 能力胶囊数据
const capabilities = [
  { id: 'cap-overview', name: '指标查询', icon: BarChart3, query: '今年销售额是多少' },
  { id: 'cap-trend', name: '趋势分析', icon: LineChart, query: '近3个月销售额趋势' },
  { id: 'cap-compare', name: '对比分析', icon: PieChart, query: '各地区销售额对比' },
  { id: 'cap-attribution', name: '归因诊断', icon: Search, query: '为什么11月销售额下降了？' },
  { id: 'cap-report', name: '报告整理', icon: FileText, query: '帮我看看销售额和订单量' },
  { id: 'cap-dashboard', name: '看板生成', icon: LayoutDashboard, query: '帮我生成一个销售分析看板' },
];

// 场景Tab数据
const scenarioTabs = [
  { id: 'digital_employees', name: '数字员工', description: '围绕核心KPI、把趋势、结构、对比一次看清' },
  { id: 'sales_overview', name: '销售概览', description: '销售人员每天都在问的问题，一句话搞定' },
  { id: 'anomaly_diagnosis', name: '异常诊断', description: '数据出了问题？快速定位原因、给出建议' },
  { id: 'user_analysis', name: '用户分析', description: '了解你的用户，发现增长机会' },
  { id: 'forecast_planning', name: '预测规划', description: '用数据辅助决策，规划未来' },
  { id: 'operation_monitor', name: '运营监控', description: '每日必看的运营数据，异常早发现' },
  { id: 'financial_report', name: '财务报表', description: '财务数据一目了然，报表自动生成' },
];

// 色彩系统数据
const colorSystem = [
  { name: '主色', value: '#007AFF', usage: 'Apple 蓝，用于强调、按钮、选中态' },
  { name: '文字主色', value: '#1D1D1F', usage: '深黑色，用于标题和主要文字' },
  { name: '文字次色', value: '#86868B', usage: '灰色，用于描述和次要文字' },
  { name: '占位符色', value: '#8E8E93', usage: '浅灰色，用于输入框占位符' },
  { name: '禁用色', value: '#C7C7CC', usage: '最浅灰，用于禁用态' },
  { name: '边框色', value: '#E5E5EA', usage: '浅灰边框' },
  { name: '背景色', value: '#F9F9FB', usage: '侧边栏背景' },
  { name: '悬停背景', value: '#F5F5F7', usage: 'hover 状态背景' },
  { name: '选中背景', value: '#F0F7FF', usage: '蓝色选中背景' },
];

// PRD页面内容组件（需要在 AnnotationProvider 内部使用）
function PRDContent() {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview', 'features']);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState<'homepage' | 'role-picker' | 'input'>('homepage');
  const [showAnnotationSidebar, setShowAnnotationSidebar] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { annotations } = useAnnotations();

  // 滚动到指定章节
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 切换章节展开状态
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // 监听滚动更新当前章节
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 打开预览
  const openPreview = (type: 'homepage' | 'role-picker' | 'input') => {
    setPreviewType(type);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-[#E5E5EA] z-50">
        <div className="h-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[#1D1D1F]">亿问 Data Agent PRD</h1>
                <p className="text-xs text-[#86868B]">v2.0 · 2026-02-04</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 批注工具栏 */}
            <AnnotationToolbar />
            
            {/* 批注列表侧边栏开关 */}
            <button
              onClick={() => setShowAnnotationSidebar(!showAnnotationSidebar)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                showAnnotationSidebar 
                  ? 'bg-[#007AFF] text-white' 
                  : 'bg-[#F5F5F7] text-[#86868B] hover:bg-[#E5E5EA]'
              }`}
              title="批注列表"
            >
              <MessageSquare className="w-4 h-4" />
              {annotations.length > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  showAnnotationSidebar ? 'bg-white/20 text-white' : 'bg-[#007AFF] text-white'
                }`}>
                  {annotations.length}
                </span>
              )}
            </button>
            
            <div className="w-px h-6 bg-[#E5E5EA]" />
            
            <button
              onClick={() => openPreview('homepage')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#007AFF] bg-[#F0F7FF] hover:bg-[#E0EFFF] rounded-xl transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>预览原型</span>
            </button>
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>体验首页</span>
            </a>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* 左侧导航 */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed left-0 top-16 bottom-0 w-[280px] bg-white border-r border-[#E5E5EA] overflow-y-auto z-40"
            >
              <nav className="p-4 space-y-1">
                {sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => {
                        scrollToSection(section.id);
                        if (section.subsections) {
                          toggleSection(section.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        activeSection === section.id
                          ? 'bg-[#F0F7FF] text-[#007AFF]'
                          : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={activeSection === section.id ? 'text-[#007AFF]' : 'text-[#86868B]'}>
                          {section.icon}
                        </span>
                        <span>{section.title}</span>
                      </div>
                      {section.subsections && (
                        <ChevronDown 
                          className={`w-4 h-4 text-[#86868B] transition-transform ${
                            expandedSections.includes(section.id) ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>
                    
                    {/* 子章节 */}
                    <AnimatePresence>
                      {section.subsections && expandedSections.includes(section.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-7 mt-1 space-y-0.5 border-l-2 border-[#E5E5EA] pl-3">
                            {section.subsections.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => scrollToSection(sub.id)}
                                className="w-full text-left px-2 py-1.5 text-[13px] text-[#86868B] hover:text-[#007AFF] transition-colors rounded-lg hover:bg-[#F5F5F7]"
                              >
                                {sub.title}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>
              
              {/* 快捷操作 */}
              <div className="p-4 border-t border-[#E5E5EA]">
                <div className="space-y-2">
                  <a
                    href="/"
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-colors"
                  >
                    <Home className="w-4 h-4 text-[#86868B]" />
                    <span>返回首页</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-[#86868B]" />
                  </a>
                  <a
                    href="?page=dashboard"
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#86868B]" />
                    <span>AI 看板</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-[#86868B]" />
                  </a>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* 主内容区 */}
        <main 
          ref={contentRef}
          className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-[280px]' : ''}`}
        >
          <div className="max-w-4xl mx-auto px-6 py-12">
            
            {/* 第一章：产品概述 */}
            <Annotatable id="section-overview">
            <section id="overview" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">一、产品概述</h2>
              </div>
              
              {/* 产品定位 */}
              <Annotatable id="section-positioning">
              <div id="positioning" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></span>
                  1.1 产品定位
                </h3>
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                  <p className="text-[#1D1D1F] leading-relaxed mb-4">
                    <strong className="text-[#007AFF]">亿问 Data Agent</strong> 是一款面向企业用户的智能数据分析助手平台，通过自然语言交互让用户快速获取指标、趋势与归因结论。产品核心理念是
                    <span className="px-2 py-0.5 bg-[#F0F7FF] text-[#007AFF] rounded-lg font-medium mx-1">"用一句话获取数据洞察"</span>
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => openPreview('homepage')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#007AFF] bg-[#F0F7FF] hover:bg-[#E0EFFF] rounded-xl transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>查看首页设计</span>
                    </button>
                  </div>
                </div>
              </div>
              </Annotatable>

              {/* 设计理念 */}
              <Annotatable id="section-design-philosophy">
              <div id="design-philosophy" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></span>
                  1.2 设计理念
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: Sparkles, title: '简约至上', desc: '参考 Apple 设计语言，追求极简、优雅的视觉体验' },
                    { icon: Lightbulb, title: '智能引导', desc: '基于用户角色智能推荐数字员工和分析场景' },
                    { icon: Zap, title: '低门槛', desc: '新手也能快速上手，一句话完成复杂分析' },
                  ].map((item, index) => (
                    <div key={index} className="bg-white rounded-2xl p-5 border border-[#E5E5EA] shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-xl bg-[#F0F7FF] flex items-center justify-center mb-3">
                        <item.icon className="w-5 h-5 text-[#007AFF]" />
                      </div>
                      <h4 className="font-semibold text-[#1D1D1F] mb-1">{item.title}</h4>
                      <p className="text-sm text-[#86868B]">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              </Annotatable>

              {/* 核心价值主张 */}
              <Annotatable id="section-value-proposition">
              <div id="value-proposition" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></span>
                  1.3 核心价值主张
                </h3>
                <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E5EA] shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F9F9FB]">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#1D1D1F]">价值点</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#1D1D1F]">说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5EA]">
                      {[
                        { point: '自然语言查询', desc: '无需学习SQL，用业务语言提问' },
                        { point: '智能角色匹配', desc: '根据用户角色推荐最适合的数字员工' },
                        { point: '场景化引导', desc: '覆盖销售、运营、财务等核心业务场景' },
                        { point: '多模态输出', desc: '文字结论 + 可视化图表 + 报表生成' },
                      ].map((item, index) => (
                        <tr key={index} className="hover:bg-[#F9F9FB] transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-[#007AFF]">{item.point}</td>
                          <td className="px-6 py-4 text-sm text-[#1D1D1F]">{item.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </Annotatable>
            </section>
            </Annotatable>

            {/* 第二章：目标用户 */}
            <Annotatable id="section-users">
            <section id="users" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34C759] to-[#30B050] flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">二、目标用户</h2>
              </div>

              {/* 用户角色定义 */}
              <div id="roles" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]"></span>
                  2.1 用户角色定义
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userRoles.map((role, index) => (
                    <div 
                      key={index} 
                      className="bg-white rounded-2xl p-5 border border-[#E5E5EA] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => openPreview('role-picker')}
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-white font-bold text-lg"
                        style={{ backgroundColor: role.color }}
                      >
                        {role.role.slice(0, 1)}
                      </div>
                      <h4 className="font-semibold text-[#1D1D1F] mb-1 group-hover:text-[#007AFF] transition-colors">
                        {role.role}
                      </h4>
                      <p className="text-sm text-[#86868B] mb-3">{role.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-[#F0F7FF] text-[#007AFF] rounded-lg">核心诉求</span>
                        <span className="text-[#1D1D1F]">{role.needs}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#E5E5EA]">
                        <span className="text-xs text-[#86868B]">推荐员工：</span>
                        <span className="text-xs text-[#007AFF]">{role.agent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 用户旅程 */}
              <div id="journey" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]"></span>
                  2.2 用户旅程
                </h3>
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {[
                      { step: '进入首页', icon: Home },
                      { step: '选择角色', icon: UserCheck },
                      { step: '系统推荐数字员工', icon: Sparkles },
                      { step: '输入问题/选择场景', icon: Search },
                      { step: '获取分析结果', icon: BarChart3 },
                    ].map((item, index, arr) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-[#F0F7FF] flex items-center justify-center mb-2">
                            <item.icon className="w-5 h-5 text-[#007AFF]" />
                          </div>
                          <span className="text-xs text-[#1D1D1F] text-center max-w-[80px]">{item.step}</span>
                        </div>
                        {index < arr.length - 1 && (
                          <ChevronRight className="w-5 h-5 text-[#C7C7CC]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            </Annotatable>

            {/* 第三章：页面结构与布局 */}
            <Annotatable id="section-layout">
            <section id="layout" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5856D6] to-[#AF52DE] flex items-center justify-center">
                  <Layout className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">三、页面结构与布局</h2>
              </div>

              {/* 整体布局 */}
              <div id="overall-layout" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5856D6]"></span>
                  3.1 整体布局（三栏式）
                </h3>
                
                {/* 布局示意图 */}
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm mb-4">
                  <div className="border-2 border-[#E5E5EA] rounded-xl overflow-hidden">
                    <div className="flex h-[400px]">
                      {/* 左侧边栏 */}
                      <div className="w-[200px] border-r-2 border-[#E5E5EA] bg-[#F9F9FB] p-4 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 rounded-full bg-[#007AFF]"></div>
                          <span className="text-xs font-medium">亿问 Data Agent</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-white rounded-lg border border-[#E5E5EA] mb-3">
                          <Plus className="w-3 h-3 text-[#86868B]" />
                          <span className="text-xs">新建任务</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-[#F5F5F7] rounded-lg mb-3">
                          <Search className="w-3 h-3 text-[#86868B]" />
                          <span className="text-xs text-[#86868B]">搜索</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 text-[#007AFF] mb-4">
                          <Sparkles className="w-3 h-3" />
                          <span className="text-xs">探索数字员工</span>
                          <span className="text-[10px] bg-[#FF3B30] text-white px-1 rounded">New</span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="px-2 py-1 text-xs text-[#86868B]">任务记录</div>
                          {['你能干嘛', 'AI助手功能', '全面分析...'].map((item, i) => (
                            <div key={i} className="px-2 py-1.5 text-xs hover:bg-white rounded">{item}</div>
                          ))}
                        </div>
                        <div className="mt-auto pt-3 border-t border-[#E5E5EA]">
                          <div className="flex items-center gap-2 px-2 py-1.5">
                            <div className="w-6 h-6 rounded-full bg-[#007AFF] text-white text-[10px] flex items-center justify-center">A</div>
                            <div className="text-xs">
                              <div className="font-medium">管理层</div>
                              <div className="text-[#86868B]">关注全局指标</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 主内容区 */}
                      <div className="flex-1 p-6 flex flex-col items-center justify-start overflow-hidden">
                        {/* 欢迎标题 */}
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold mb-1">
                            <span className="text-[#1D1D1F]">欢迎来到</span>
                          </h3>
                          <h3 className="text-xl font-bold text-[#007AFF]">亿问 Data Agent</h3>
                          <p className="text-xs text-[#86868B] mt-1">用一句话获取指标、趋势与归因结论</p>
                        </div>
                        
                        {/* 智能输入框 */}
                        <div className="w-full max-w-md mb-4">
                          <div className="bg-white border border-[#E5E5EA] rounded-xl p-3 shadow-sm">
                            <div className="text-xs text-[#86868B] mb-2">说说你想分析什么…</div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-[#F5F5F7] rounded text-[10px]">👤 Alisa</span>
                                <span className="px-2 py-0.5 bg-[#F5F5F7] rounded text-[10px]">🌐 本地模式</span>
                              </div>
                              <div className="w-6 h-6 rounded-full bg-[#007AFF] flex items-center justify-center">
                                <ArrowRight className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 能力胶囊 */}
                        <div className="flex flex-wrap gap-1.5 justify-center mb-4 max-w-md">
                          {capabilities.slice(0, 4).map((cap) => (
                            <span key={cap.id} className="px-2 py-1 bg-[#F5F5F7] rounded-full text-[10px] flex items-center gap-1">
                              <cap.icon className="w-3 h-3" />
                              {cap.name}
                            </span>
                          ))}
                        </div>
                        
                        {/* 场景Tab */}
                        <div className="w-full max-w-md">
                          <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                            {scenarioTabs.slice(0, 4).map((tab, i) => (
                              <span 
                                key={tab.id} 
                                className={`px-2 py-1 rounded text-[10px] whitespace-nowrap ${
                                  i === 0 ? 'bg-[#007AFF] text-white' : 'bg-[#F5F5F7]'
                                }`}
                              >
                                {tab.name}
                              </span>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {[1,2,3,4].map(i => (
                              <div key={i} className="p-2 bg-[#F9F9FB] rounded-lg border border-[#E5E5EA]">
                                <div className="text-[10px] font-medium mb-0.5">场景卡片</div>
                                <div className="text-[9px] text-[#86868B]">点击快速提问</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#86868B] mt-4 text-center">布局示意图：左侧边栏 (280px) + 主内容区 (flex-1)</p>
                </div>

                <button
                  onClick={() => openPreview('homepage')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>查看实际首页效果</span>
                </button>
              </div>

              {/* 响应式适配 */}
              <div id="responsive" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5856D6]"></span>
                  3.2 响应式适配
                </h3>
                <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E5EA] shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F9F9FB]">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#1D1D1F]">断点</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#1D1D1F]">布局调整</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5EA]">
                      <tr><td className="px-6 py-4 text-sm font-medium text-[#007AFF]">≥1024px (lg)</td><td className="px-6 py-4 text-sm">显示左侧边栏，三栏布局</td></tr>
                      <tr><td className="px-6 py-4 text-sm font-medium text-[#FF9500]">&lt;1024px</td><td className="px-6 py-4 text-sm">隐藏左侧边栏，单栏布局</td></tr>
                      <tr><td className="px-6 py-4 text-sm font-medium text-[#34C759]">移动端</td><td className="px-6 py-4 text-sm">全屏主内容区，底部浮动助手</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
            </Annotatable>

            {/* 第四章：功能模块详解 */}
            <Annotatable id="section-features">
            <section id="features" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9500] to-[#FF6B00] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">四、功能模块详解</h2>
              </div>

              {/* 左侧边栏 */}
              <div id="sidebar" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500]"></span>
                  4.1 左侧边栏 (Sidebar)
                </h3>
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Logo 区域', desc: '蓝色圆点图标 + "亿问 Data Agent" 文字', icon: Sparkles },
                      { title: '新建任务按钮', desc: '清空输入框，聚焦到输入区', icon: Plus },
                      { title: '搜索框', desc: '搜索任务记录，聚焦时蓝色边框', icon: Search },
                      { title: '探索数字员工入口', desc: '滚动到数字员工展示区，带 New 标签', icon: Sparkles },
                      { title: '任务记录列表', desc: '最近查询存储在 localStorage，最多6条', icon: FileText },
                      { title: '角色选择入口', desc: '点击打开角色选择弹窗', icon: UserCheck },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#F9F9FB] rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-[#FF9500]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#1D1D1F] text-sm">{item.title}</h4>
                          <p className="text-xs text-[#86868B] mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 主内容区 */}
              <div id="main-content" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500]"></span>
                  4.2 主内容区
                </h3>
                
                {/* 智能输入框详解 */}
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm mb-4">
                  <h4 className="font-semibold text-[#1D1D1F] mb-4">4.2.2 智能输入框</h4>
                  
                  {/* 输入框预览 */}
                  <div className="bg-[#F9F9FB] rounded-xl p-6 mb-4">
                    <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 shadow-lg max-w-xl mx-auto">
                      <div className="text-[#8E8E93] mb-2">说说你想分析什么…</div>
                      <div className="text-xs text-[#C7C7CC] mb-4">
                        例如：近3个月销售额趋势 / 为什么11月销售下降 / 各地区…
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F7] rounded-lg text-sm">
                            <div className="w-5 h-5 rounded-full bg-[#007AFF] text-white text-xs flex items-center justify-center">A</div>
                            <span>Alisa</span>
                            <ChevronDown className="w-3 h-3 text-[#86868B]" />
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F7] rounded-lg text-sm">
                            <Globe className="w-4 h-4 text-[#86868B]" />
                            <span>本地模式</span>
                            <ChevronDown className="w-3 h-3 text-[#86868B]" />
                          </button>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-[#C7C7CC] flex items-center justify-center">
                          <ArrowRight className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl overflow-hidden border border-[#E5E5EA]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#F9F9FB]">
                          <th className="px-4 py-2 text-left font-semibold">元素</th>
                          <th className="px-4 py-2 text-left font-semibold">说明</th>
                          <th className="px-4 py-2 text-left font-semibold">交互</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        <tr><td className="px-4 py-2">输入框</td><td className="px-4 py-2">多行文本框，自动调整高度</td><td className="px-4 py-2">Enter 发送，Shift+Enter 换行</td></tr>
                        <tr><td className="px-4 py-2">示例提示</td><td className="px-4 py-2">灰色小字，引导用户输入</td><td className="px-4 py-2">静态展示</td></tr>
                        <tr><td className="px-4 py-2">数字员工选择器</td><td className="px-4 py-2">下拉选择当前对话的AI员工</td><td className="px-4 py-2">点击展开员工列表</td></tr>
                        <tr><td className="px-4 py-2">联网模式选择器</td><td className="px-4 py-2">切换本地/联网模式</td><td className="px-4 py-2">点击展开选项</td></tr>
                        <tr><td className="px-4 py-2">发送按钮</td><td className="px-4 py-2">圆形箭头按钮</td><td className="px-4 py-2">有内容时激活变蓝</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 能力胶囊区 */}
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm mb-4">
                  <h4 className="font-semibold text-[#1D1D1F] mb-4">4.2.3 能力胶囊区 (Capability Pills)</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {capabilities.map((cap) => (
                      <button
                        key={cap.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F7] hover:bg-[#E5E5EA] rounded-full text-sm transition-colors"
                      >
                        <cap.icon className="w-4 h-4 text-[#86868B]" />
                        <span>{cap.name}</span>
                      </button>
                    ))}
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F7] hover:bg-[#E5E5EA] rounded-full text-sm transition-colors">
                      <span>··· 更多</span>
                    </button>
                  </div>
                  <p className="text-sm text-[#86868B]">点击胶囊可快速填充预设查询到输入框</p>
                </div>

                {/* 场景Tab */}
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                  <h4 className="font-semibold text-[#1D1D1F] mb-4">4.2.4 场景Tab + 问题卡片区</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scenarioTabs.map((tab, index) => (
                      <button
                        key={tab.id}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          index === 0 
                            ? 'bg-[#007AFF] text-white' 
                            : 'bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E5E5EA]'
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: '日常查数', question: '今天卖了多少？', desc: '快速查看今日销售实时数据' },
                      { label: '排行榜', question: '哪个产品卖得最好？', desc: '找出TOP畅销产品' },
                      { label: '目标追踪', question: '目标完成得怎么样？', desc: '查看销售目标达成进度' },
                      { label: '区域分析', question: '哪个区域业绩最好？', desc: '各区域销售排名' },
                    ].map((card, index) => (
                      <div 
                        key={index} 
                        className="p-4 bg-[#F9F9FB] rounded-xl border border-[#E5E5EA] hover:border-[#007AFF] hover:bg-[#F0F7FF] transition-all cursor-pointer group"
                      >
                        <span className="text-xs text-[#007AFF] font-medium">{card.label}</span>
                        <h5 className="font-semibold text-[#1D1D1F] mt-1 group-hover:text-[#007AFF] transition-colors">
                          {card.question}
                        </h5>
                        <p className="text-xs text-[#86868B] mt-1">{card.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 角色选择弹窗 */}
              <div id="role-picker" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500]"></span>
                  4.3 角色选择弹窗
                </h3>
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                  <p className="text-[#86868B] mb-4">首次进入时全屏遮罩弹窗，用户选择角色后系统自动推荐数字员工</p>
                  <button
                    onClick={() => openPreview('role-picker')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>查看角色选择弹窗</span>
                  </button>
                </div>
              </div>

              {/* 浮动引导助手 */}
              <div id="floating-guide" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500]"></span>
                  4.4 浮动引导助手
                </h3>
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                  <ul className="space-y-2 text-sm text-[#1D1D1F]">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#34C759]" />
                      显示当前选中数字员工的头像
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#34C759]" />
                      点击展开引导问题列表
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#34C759]" />
                      角色选择后自动展开（autoOpen 触发）
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#34C759]" />
                      根据用户角色显示个性化引导内容
                    </li>
                  </ul>
                </div>
              </div>

              {/* 新手引导（游戏式） */}
              <div id="onboarding-tour" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500]"></span>
                  4.5 新手引导（游戏式聚光灯引导）
                </h3>
                
                {/* 引导效果示意图 */}
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm mb-4">
                  <h4 className="font-semibold text-[#1D1D1F] mb-4">引导效果示意</h4>
                  <div className="relative bg-[#000000]/75 rounded-xl p-8 overflow-hidden">
                    {/* 模拟高亮区域 */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="w-48 h-16 bg-white rounded-2xl border-2 border-[#007AFF] shadow-[0_0_0_4px_rgba(0,122,255,0.15),0_0_30px_rgba(0,122,255,0.2)]">
                          <div className="p-3 text-xs text-[#86868B]">说说你想分析什么…</div>
                        </div>
                        {/* 脉冲动画指示 */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-[#007AFF] animate-pulse opacity-50"></div>
                      </div>
                    </div>
                    
                    {/* 箭头指示 */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[#007AFF] animate-bounce">
                      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                        <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    
                    {/* 提示卡片 */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 bg-white rounded-2xl shadow-xl overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-[#007AFF] via-[#5856D6] to-[#AF52DE]"></div>
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center">
                            <Search className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-[#1D1D1F] text-sm">智能输入框</span>
                        </div>
                        <p className="text-xs text-[#86868B]">这是你与 AI 对话的核心区域</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-1">
                            {[1,2,3,4,5,6,7,8].map((_, i) => (
                              <div key={i} className={`h-1 rounded-full ${i === 1 ? 'w-4 bg-[#007AFF]' : 'w-1 bg-[#E5E5EA]'}`}></div>
                            ))}
                          </div>
                          <span className="text-[10px] text-[#86868B]">2 / 8</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#86868B] mt-4 text-center">类似游戏新手教程的聚光灯式引导，高亮当前区域，其他区域变暗</p>
                </div>

                {/* 引导步骤表格 */}
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm mb-4">
                  <h4 className="font-semibold text-[#1D1D1F] mb-4">引导步骤（共8步）</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#F9F9FB]">
                          <th className="px-4 py-3 text-left font-semibold">步骤</th>
                          <th className="px-4 py-3 text-left font-semibold">目标区域</th>
                          <th className="px-4 py-3 text-left font-semibold">标题</th>
                          <th className="px-4 py-3 text-left font-semibold">说明</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        <tr><td className="px-4 py-3 text-[#007AFF] font-medium">1</td><td className="px-4 py-3">全屏（中央）</td><td className="px-4 py-3">欢迎使用</td><td className="px-4 py-3 text-[#86868B]">30秒快速了解核心功能</td></tr>
                        <tr><td className="px-4 py-3 text-[#007AFF] font-medium">2</td><td className="px-4 py-3">[data-tour="input-area"]</td><td className="px-4 py-3">智能输入框</td><td className="px-4 py-3 text-[#86868B]">核心对话区域</td></tr>
                        <tr><td className="px-4 py-3 text-[#007AFF] font-medium">3</td><td className="px-4 py-3">[data-tour="agent-selector"]</td><td className="px-4 py-3">数字员工选择</td><td className="px-4 py-3 text-[#86868B]">切换不同AI助手</td></tr>
                        <tr><td className="px-4 py-3 text-[#007AFF] font-medium">4</td><td className="px-4 py-3">[data-tour="capability-actions"]</td><td className="px-4 py-3">快速能力入口</td><td className="px-4 py-3 text-[#86868B]">常见分析场景快捷入口</td></tr>
                        <tr><td className="px-4 py-3 text-[#007AFF] font-medium">5</td><td className="px-4 py-3">[data-tour="scenario-tabs"]</td><td className="px-4 py-3">业务场景切换</td><td className="px-4 py-3 text-[#86868B]">不同业务场景Tab</td></tr>
                        <tr><td className="px-4 py-3 text-[#007AFF] font-medium">6</td><td className="px-4 py-3">[data-tour="employee-cards"]</td><td className="px-4 py-3">数字员工卡片</td><td className="px-4 py-3 text-[#86868B]">推荐的AI员工展示</td></tr>
                        <tr><td className="px-4 py-3 text-[#007AFF] font-medium">7</td><td className="px-4 py-3">[data-tour="sidebar"]</td><td className="px-4 py-3">任务记录与导航</td><td className="px-4 py-3 text-[#86868B]">左侧边栏功能介绍</td></tr>
                        <tr><td className="px-4 py-3 text-[#007AFF] font-medium">8</td><td className="px-4 py-3">全屏（中央）</td><td className="px-4 py-3">准备就绪</td><td className="px-4 py-3 text-[#86868B]">引导完成，开始使用</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 交互方式 */}
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm mb-4">
                  <h4 className="font-semibold text-[#1D1D1F] mb-4">交互方式</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#F9F9FB] rounded-xl">
                      <h5 className="font-medium text-[#1D1D1F] mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#007AFF] flex items-center justify-center">
                          <span className="text-white text-xs">🖱</span>
                        </div>
                        按钮操作
                      </h5>
                      <ul className="text-sm text-[#86868B] space-y-1">
                        <li>• 下一步 / 上一步 切换步骤</li>
                        <li>• 跳过引导 直接关闭</li>
                        <li>• X 按钮 关闭引导</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-[#F9F9FB] rounded-xl">
                      <h5 className="font-medium text-[#1D1D1F] mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#5856D6] flex items-center justify-center">
                          <span className="text-white text-xs">⌨</span>
                        </div>
                        键盘支持
                      </h5>
                      <ul className="text-sm text-[#86868B] space-y-1">
                        <li>• <kbd className="px-1.5 py-0.5 bg-white rounded text-xs">←</kbd> <kbd className="px-1.5 py-0.5 bg-white rounded text-xs">→</kbd> 切换步骤</li>
                        <li>• <kbd className="px-1.5 py-0.5 bg-white rounded text-xs">Enter</kbd> 下一步</li>
                        <li>• <kbd className="px-1.5 py-0.5 bg-white rounded text-xs">Esc</kbd> 跳过引导</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 技术实现 */}
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                  <h4 className="font-semibold text-[#1D1D1F] mb-4">技术实现要点</h4>
                  <div className="space-y-3">
                    {[
                      { title: 'SVG 遮罩', desc: '使用 SVG path 的 fillRule="evenodd" 实现镂空效果，外部全屏矩形 + 内部圆角矩形镂空' },
                      { title: '目标定位', desc: '通过 data-tour 属性选择目标元素，使用 getBoundingClientRect() 获取位置' },
                      { title: '响应式', desc: '监听 resize 和 scroll 事件，实时更新高亮区域位置' },
                      { title: '动画效果', desc: '使用 framer-motion 实现淡入淡出、缩放动画，脉冲边框使用 CSS animation' },
                      { title: '状态持久化', desc: 'localStorage 存储完成状态，key: yiwen_onboarding_completed_v1' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#F9F9FB] rounded-xl">
                        <div className="w-6 h-6 rounded-lg bg-[#007AFF] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div>
                          <span className="font-medium text-[#1D1D1F]">{item.title}：</span>
                          <span className="text-[#86868B]">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 代码示例 */}
                  <div className="mt-4">
                    <h5 className="font-medium text-[#1D1D1F] mb-2">重新触发引导（开发调试）</h5>
                    <pre className="bg-[#1D1D1F] text-[#F5F5F7] p-4 rounded-xl overflow-x-auto text-sm font-mono">
{`// 在浏览器控制台执行
localStorage.removeItem('yiwen_onboarding_completed_v1');
location.reload();`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>
            </Annotatable>

            {/* 第五章：交互流程 */}
            <Annotatable id="section-interactions">
            <section id="interactions" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF2D55] to-[#FF6B8A] flex items-center justify-center">
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">五、交互流程</h2>
              </div>

              {/* 首次访问流程 */}
              <div id="first-visit" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55]"></span>
                  5.1 首次访问流程
                </h3>
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { step: '用户访问首页', icon: Home, color: '#007AFF' },
                      { step: '显示角色选择弹窗', icon: Users, color: '#5856D6' },
                      { step: '用户选择角色', icon: UserCheck, color: '#34C759' },
                      { step: '系统记录角色', icon: Database, color: '#FF9500' },
                      { step: '自动匹配推荐数字员工', icon: Sparkles, color: '#FF2D55' },
                      { step: '关闭弹窗', icon: X, color: '#8E8E93' },
                      { step: '启动新手引导', icon: Target, color: '#AF52DE' },
                      { step: '用户可开始提问', icon: Search, color: '#007AFF' },
                    ].map((item, index, arr) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm"
                          style={{ backgroundColor: item.color }}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.step}</span>
                        </div>
                        {index < arr.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-[#C7C7CC]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 新手引导流程 */}
              <div id="onboarding-flow" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55]"></span>
                  5.2 新手引导流程（OnboardingTour）
                </h3>
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                  <div className="space-y-4">
                    {/* 流程图 */}
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { step: '角色选择完成', color: '#007AFF' },
                        { step: '检查 localStorage', color: '#5856D6' },
                        { step: '未完成引导?', color: '#FF9500' },
                        { step: '800ms 延迟后启动', color: '#34C759' },
                        { step: '显示步骤1: 欢迎', color: '#007AFF' },
                        { step: '用户点击下一步', color: '#5AC8FA' },
                        { step: '高亮目标区域', color: '#AF52DE' },
                        { step: '循环至步骤8', color: '#FF2D55' },
                        { step: '存储完成状态', color: '#34C759' },
                      ].map((item, index, arr) => (
                        <div key={index} className="flex items-center gap-2">
                          <span 
                            className="px-3 py-1.5 rounded-lg text-white text-sm"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.step}
                          </span>
                          {index < arr.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-[#C7C7CC]" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* 条件判断说明 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-[#E8F5E9] rounded-xl">
                        <h5 className="font-medium text-[#34C759] mb-2">显示引导的条件</h5>
                        <ul className="text-sm text-[#1D1D1F] space-y-1">
                          <li>• localStorage 中无 yiwen_onboarding_completed_v1</li>
                          <li>• 或 forceShow prop 为 true</li>
                          <li>• 角色选择弹窗已关闭</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-[#FFF3E0] rounded-xl">
                        <h5 className="font-medium text-[#FF9500] mb-2">跳过引导的情况</h5>
                        <ul className="text-sm text-[#1D1D1F] space-y-1">
                          <li>• 用户点击"跳过引导"按钮</li>
                          <li>• 用户按 Esc 键</li>
                          <li>• 用户点击右上角关闭按钮</li>
                          <li>• 以上操作都会存储完成状态</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 其他流程 */}
              <div id="question-flow" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55]"></span>
                  5.3 提问交互流程
                </h3>
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                  <div className="space-y-3">
                    {[
                      { from: '用户输入问题', to: '输入框有内容?', type: 'decision' },
                      { from: '是', to: '激活发送按钮', type: 'yes' },
                      { from: '否', to: '发送按钮置灰', type: 'no' },
                      { from: '用户点击发送/按Enter', to: '保存到最近查询', type: 'action' },
                      { from: '触发 onQuestionSubmit', to: '跳转到对话界面', type: 'action' },
                    ].map((flow, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-lg text-sm ${
                          flow.type === 'decision' ? 'bg-[#FFF3E0] text-[#FF9500]' :
                          flow.type === 'yes' ? 'bg-[#E8F5E9] text-[#34C759]' :
                          flow.type === 'no' ? 'bg-[#FFEBEE] text-[#FF2D55]' :
                          'bg-[#F0F7FF] text-[#007AFF]'
                        }`}>
                          {flow.from}
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#C7C7CC]" />
                        <div className="px-3 py-1.5 bg-[#F5F5F7] rounded-lg text-sm">{flow.to}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div id="scenario-flow" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55]"></span>
                  5.4 场景卡片点击流程
                </h3>
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    {['用户点击场景卡片', '获取卡片预设查询', '保存到最近查询', '触发 onQuestionSubmit', '跳转到对话界面'].map((step, i, arr) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-[#F0F7FF] text-[#007AFF] rounded-lg text-sm">{step}</span>
                        {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-[#C7C7CC]" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div id="agent-switch" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55]"></span>
                  5.5 数字员工切换流程
                </h3>
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    {['用户点击数字员工下拉', '展开员工列表', '用户选择员工', '更新本地状态', '通知父组件 onAgentChange', '关闭下拉菜单'].map((step, i, arr) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-[#F0F7FF] text-[#007AFF] rounded-lg text-sm">{step}</span>
                        {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-[#C7C7CC]" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            </Annotatable>

            {/* 第六章：UI规范 */}
            <Annotatable id="section-ui-spec">
            <section id="ui-spec" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#AF52DE] to-[#5856D6] flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">六、UI 规范</h2>
              </div>

              {/* 色彩系统 */}
              <div id="colors" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AF52DE]"></span>
                  6.1 色彩系统
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {colorSystem.map((color, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 border border-[#E5E5EA] shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-10 h-10 rounded-lg border border-[#E5E5EA]"
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <div>
                          <div className="font-medium text-[#1D1D1F]">{color.name}</div>
                          <div className="text-xs text-[#86868B] font-mono">{color.value}</div>
                        </div>
                      </div>
                      <p className="text-xs text-[#86868B]">{color.usage}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 字体规范 */}
              <div id="typography" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AF52DE]"></span>
                  6.2 字体规范
                </h3>
                <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E5EA] shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#F9F9FB]">
                        <th className="px-4 py-3 text-left font-semibold">类型</th>
                        <th className="px-4 py-3 text-left font-semibold">字号</th>
                        <th className="px-4 py-3 text-left font-semibold">字重</th>
                        <th className="px-4 py-3 text-left font-semibold">用途</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5EA]">
                      <tr><td className="px-4 py-3">大标题</td><td className="px-4 py-3 font-mono text-xs">text-4xl ~ text-6xl</td><td className="px-4 py-3">font-semibold</td><td className="px-4 py-3">欢迎标题</td></tr>
                      <tr><td className="px-4 py-3">中标题</td><td className="px-4 py-3 font-mono text-xs">text-2xl ~ text-3xl</td><td className="px-4 py-3">font-semibold</td><td className="px-4 py-3">弹窗标题</td></tr>
                      <tr><td className="px-4 py-3">正文</td><td className="px-4 py-3 font-mono text-xs">text-[16px]</td><td className="px-4 py-3">font-light</td><td className="px-4 py-3">输入框文字</td></tr>
                      <tr><td className="px-4 py-3">按钮文字</td><td className="px-4 py-3 font-mono text-xs">text-[13px]</td><td className="px-4 py-3">font-medium</td><td className="px-4 py-3">按钮、Tab</td></tr>
                      <tr><td className="px-4 py-3">描述文字</td><td className="px-4 py-3 font-mono text-xs">text-[12px]</td><td className="px-4 py-3">font-normal</td><td className="px-4 py-3">次要说明</td></tr>
                      <tr><td className="px-4 py-3">标签文字</td><td className="px-4 py-3 font-mono text-xs">text-[11px]</td><td className="px-4 py-3">font-normal</td><td className="px-4 py-3">最小标签</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 圆角规范 */}
              <div id="radius" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AF52DE]"></span>
                  6.3 圆角规范
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { name: '大卡片/弹窗', value: 'rounded-3xl', px: '24px' },
                    { name: '中卡片', value: 'rounded-2xl', px: '16px' },
                    { name: '按钮/输入框', value: 'rounded-xl', px: '12px' },
                    { name: '胶囊按钮', value: 'rounded-full', px: '∞' },
                    { name: '头像', value: 'rounded-full', px: '∞' },
                  ].map((item, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 border border-[#E5E5EA] shadow-sm text-center">
                      <div 
                        className={`w-16 h-16 mx-auto bg-[#007AFF] mb-3 ${
                          item.value === 'rounded-3xl' ? 'rounded-3xl' :
                          item.value === 'rounded-2xl' ? 'rounded-2xl' :
                          item.value === 'rounded-xl' ? 'rounded-xl' :
                          'rounded-full'
                        }`}
                      ></div>
                      <div className="font-medium text-sm text-[#1D1D1F]">{item.name}</div>
                      <div className="text-xs text-[#86868B] font-mono">{item.px}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 阴影规范 */}
              <div id="shadows" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AF52DE]"></span>
                  6.4 阴影规范
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: '轻阴影', usage: '按钮', shadow: '0 1px 3px rgba(0,0,0,0.04)' },
                    { name: '中阴影', usage: '输入框', shadow: '0 10px 40px rgba(0,0,0,0.06)' },
                    { name: '重阴影', usage: '弹窗', shadow: '0 30px 80px rgba(0,0,0,0.18)' },
                    { name: '下拉阴影', usage: '下拉菜单', shadow: '0 8px 32px rgba(0,0,0,0.12)' },
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="w-full h-24 bg-white rounded-xl mb-3"
                        style={{ boxShadow: item.shadow }}
                      ></div>
                      <div className="font-medium text-sm text-[#1D1D1F]">{item.name}</div>
                      <div className="text-xs text-[#86868B]">{item.usage}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 动画规范 */}
              <div id="animations" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AF52DE]"></span>
                  6.5 动画规范
                </h3>
                <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E5EA] shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#F9F9FB]">
                        <th className="px-4 py-3 text-left font-semibold">元素</th>
                        <th className="px-4 py-3 text-left font-semibold">动画类型</th>
                        <th className="px-4 py-3 text-left font-semibold">参数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5EA]">
                      <tr><td className="px-4 py-3">页面入场</td><td className="px-4 py-3">fade + slide up</td><td className="px-4 py-3 font-mono text-xs">duration: 0.7s, ease: [0.16, 1, 0.3, 1]</td></tr>
                      <tr><td className="px-4 py-3">弹窗入场</td><td className="px-4 py-3">scale + fade</td><td className="px-4 py-3 font-mono text-xs">scale: 0.96 → 1, opacity: 0 → 1</td></tr>
                      <tr><td className="px-4 py-3">按钮点击</td><td className="px-4 py-3">scale</td><td className="px-4 py-3 font-mono text-xs">active:scale-95</td></tr>
                      <tr><td className="px-4 py-3">hover 过渡</td><td className="px-4 py-3">all</td><td className="px-4 py-3 font-mono text-xs">transition-all duration-200</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
            </Annotatable>

            {/* 第七章：状态管理 */}
            <Annotatable id="section-state">
            <section id="state" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">七、状态管理</h2>
              </div>

              <div id="component-state" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5AC8FA]"></span>
                  7.1 组件状态
                </h3>
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="bg-[#F9F9FB]">
                        <th className="px-3 py-2 text-left font-semibold">状态</th>
                        <th className="px-3 py-2 text-left font-semibold">类型</th>
                        <th className="px-3 py-2 text-left font-semibold">默认值</th>
                        <th className="px-3 py-2 text-left font-semibold">说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5EA]">
                      <tr><td className="px-3 py-2 font-mono text-[#007AFF]">inputValue</td><td className="px-3 py-2">string</td><td className="px-3 py-2">''</td><td className="px-3 py-2">输入框内容</td></tr>
                      <tr><td className="px-3 py-2 font-mono text-[#007AFF]">selectedAgentId</td><td className="px-3 py-2">string</td><td className="px-3 py-2">agent.id</td><td className="px-3 py-2">当前选中的数字员工</td></tr>
                      <tr><td className="px-3 py-2 font-mono text-[#007AFF]">enableWebSearch</td><td className="px-3 py-2">boolean</td><td className="px-3 py-2">false</td><td className="px-3 py-2">是否开启联网搜索</td></tr>
                      <tr><td className="px-3 py-2 font-mono text-[#007AFF]">showRolePicker</td><td className="px-3 py-2">boolean</td><td className="px-3 py-2">true</td><td className="px-3 py-2">角色选择弹窗是否显示</td></tr>
                      <tr><td className="px-3 py-2 font-mono text-[#007AFF]">userRole</td><td className="px-3 py-2">RoleOption | null</td><td className="px-3 py-2">null</td><td className="px-3 py-2">用户选择的角色</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div id="local-storage" className="mb-8">
                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5AC8FA]"></span>
                  7.2 本地存储
                </h3>
                <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-[#F9F9FB] rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-[#5AC8FA] flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-mono text-sm text-[#007AFF]">yiwen_recent_queries_v1</div>
                      <div className="text-sm text-[#86868B]">最近查询记录，JSON 数组，最多6条</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[#F0F7FF] rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-[#007AFF] flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-mono text-sm text-[#007AFF]">yiwen_onboarding_completed_v1</div>
                      <div className="text-sm text-[#86868B]">新手引导完成状态，值为 "true" 表示已完成</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            </Annotatable>

            {/* 第八章：组件依赖 */}
            <Annotatable id="section-dependencies">
            <section id="dependencies" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FF9500] flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">八、组件依赖</h2>
              </div>
              
              <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'React', version: '18.x', usage: '核心框架' },
                    { name: 'framer-motion', version: '10.x', usage: '动画效果' },
                    { name: 'lucide-react', version: 'latest', usage: '图标库' },
                  ].map((dep, index) => (
                    <div key={index} className="p-4 bg-[#F9F9FB] rounded-xl">
                      <div className="font-semibold text-[#1D1D1F]">{dep.name}</div>
                      <div className="text-xs text-[#86868B] font-mono">{dep.version}</div>
                      <div className="text-sm text-[#86868B] mt-1">{dep.usage}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            </Annotatable>

            {/* 第九章：接口定义 */}
            <Annotatable id="section-interfaces">
            <section id="interfaces" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34C759] to-[#30D158] flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">九、接口定义</h2>
              </div>
              
              <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                <h4 className="font-semibold text-[#1D1D1F] mb-4">Props 接口</h4>
                <pre className="bg-[#1D1D1F] text-[#F5F5F7] p-4 rounded-xl overflow-x-auto text-sm font-mono">
{`interface SimpleInputPageProps {
  // 提交问题的回调
  onQuestionSubmit: (
    question: string, 
    options?: { 
      agentId?: string; 
      enableWebSearch?: boolean 
    }
  ) => void;
  
  // 当前数字员工
  agent: AgentProfile;
  
  // 切换数字员工的回调
  onAgentChange?: (agentId: string) => void | Promise<void>;
  
  // 当前数字员工ID（用于同步）
  currentAgentId?: string;
}`}
                </pre>
              </div>
            </section>
            </Annotatable>

            {/* 第十章：原型截图参考 */}
            <Annotatable id="section-screenshots">
            <section id="screenshots" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9500] to-[#FFCC00] flex items-center justify-center">
                  <Image className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">十、原型截图参考</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-4 border border-[#E5E5EA] shadow-sm">
                  <img 
                    src="/assets/homepage-full.png" 
                    alt="首页完整视图"
                    className="w-full rounded-xl border border-[#E5E5EA] mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <h4 className="font-semibold text-[#1D1D1F] mb-1">10.1 首页完整视图</h4>
                  <p className="text-sm text-[#86868B]">展示了完整的首页布局，包括左侧边栏、欢迎标题、输入框、能力胶囊和场景卡片</p>
                  <button
                    onClick={() => openPreview('homepage')}
                    className="mt-3 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#007AFF] bg-[#F0F7FF] hover:bg-[#E0EFFF] rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>查看实际效果</span>
                  </button>
                </div>
                
                <div className="bg-white rounded-2xl p-4 border border-[#E5E5EA] shadow-sm">
                  <img 
                    src="/assets/role-picker.png" 
                    alt="角色选择弹窗"
                    className="w-full rounded-xl border border-[#E5E5EA] mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <h4 className="font-semibold text-[#1D1D1F] mb-1">10.2 角色选择弹窗</h4>
                  <p className="text-sm text-[#86868B]">首次进入时显示的角色选择弹窗，6个角色卡片，每个卡片显示角色名称、描述和推荐的数字员工</p>
                  <button
                    onClick={() => openPreview('role-picker')}
                    className="mt-3 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#007AFF] bg-[#F0F7FF] hover:bg-[#E0EFFF] rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>查看实际效果</span>
                  </button>
                </div>
              </div>
            </section>
            </Annotatable>

            {/* 第十一章：未来规划 */}
            <Annotatable id="section-roadmap">
            <section id="roadmap" className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5856D6] to-[#AF52DE] flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1D1D1F]">十一、未来规划</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { 
                    title: '短期优化', 
                    color: '#34C759',
                    items: ['角色偏好本地持久化', '支持快捷键操作', '输入框智能补全']
                  },
                  { 
                    title: '中期规划', 
                    color: '#FF9500',
                    items: ['个性化推荐算法优化', '多语言支持', '暗色主题']
                  },
                  { 
                    title: '长期愿景', 
                    color: '#5856D6',
                    items: ['语音输入支持', '移动端原生体验优化', 'AI 主动推荐分析任务']
                  },
                ].map((phase, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-sm">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: phase.color }}></span>
                      {phase.title}
                    </h4>
                    <div className="space-y-2">
                      {phase.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-[#1D1D1F]">
                          <div className="w-5 h-5 rounded border-2 border-[#E5E5EA] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#E5E5EA]"></div>
                          </div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            </Annotatable>

            {/* 底部CTA */}
            <Annotatable id="section-cta">
            <div className="bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-3xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-2">开始体验亿问 Data Agent</h3>
              <p className="text-white/80 mb-6">用一句话获取指标、趋势与归因结论</p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#007AFF] font-semibold rounded-xl hover:bg-[#F5F5F7] transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>立即体验首页</span>
              </a>
            </div>
            </Annotatable>
          </div>
        </main>
      </div>

      {/* 预览弹窗 */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5EA]">
                <h3 className="text-lg font-semibold text-[#1D1D1F]">
                  {previewType === 'homepage' ? '首页预览' : 
                   previewType === 'role-picker' ? '角色选择弹窗预览' : '输入框预览'}
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>在新页面打开</span>
                  </a>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-[#F5F5F7] rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-[#86868B]" />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-[#F5F5F7] max-h-[calc(90vh-80px)] overflow-auto">
                <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden">
                  <iframe
                    src={previewType === 'homepage' ? '/' : '/?showRolePicker=true'}
                    className="w-full h-[600px]"
                    title="预览"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 批注侧边栏 */}
      <AnnotationSidebar 
        isOpen={showAnnotationSidebar} 
        onClose={() => setShowAnnotationSidebar(false)} 
      />
    </div>
  );
}

// PRD页面组件（带批注系统）
export default function PRDPage() {
  return (
    <AnnotationProvider>
      <PRDContent />
    </AnnotationProvider>
  );
}
