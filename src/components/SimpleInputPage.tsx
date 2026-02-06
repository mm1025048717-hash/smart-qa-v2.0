/**
 * 简约输入界面 - 参考 ima copilot 设计
 * 完全独立的界面，包含输入框、切换数字员工、联网选择、常用场景等
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentProfile } from '../types';
import { ALL_AGENTS as AGENTS } from '../services/agents/index';
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  LayoutDashboard,
  LineChart,
  Lightbulb,
  MoreHorizontal,
  PieChart,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { EnhancedGuidePanel } from './EnhancedGuidePanel';
import { EmployeeCreatePanel, type DraftEmployee } from './EmployeeCreatePanel';
import { FloatingGuideAssistant } from './FloatingGuideAssistant';
import { OnboardingTour, hasCompletedOnboarding, resetOnboardingTour } from './OnboardingTour';

const CUSTOM_AGENTS_KEY = 'yiwen_custom_agents_v1';

interface SimpleInputPageProps {
  onQuestionSubmit: (question: string, options?: { agentId?: string; enableWebSearch?: boolean }) => void;
  agent: AgentProfile;
  onAgentChange?: (agentId: string) => void | Promise<void>;
  currentAgentId?: string;
}

const RECENT_QUERIES_KEY = 'yiwen_recent_queries_v1';
const MAX_RECENT_QUERIES = 6;
// 角色与数字员工的详细推荐映射
interface RoleAgentRecommendation {
  agentId: string;
  reason: string; // 推荐原因
  priority: number; // 优先级，数字越小越靠前
}

interface RoleOption {
  id: string;
  label: string;
  description: string;
  recommendedAgents: RoleAgentRecommendation[];
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'exec',
    label: '管理层',
    description: '关注全局指标、趋势与关键异常',
    recommendedAgents: [
      { agentId: 'alisa', reason: '一句话快速获取核心KPI', priority: 1 },
      { agentId: 'metrics-pro', reason: '构建清晰的指标体系', priority: 2 },
      { agentId: 'viz-master', reason: '数据可视化一目了然', priority: 3 },
      { agentId: 'report-lisa', reason: '定期报表自动生成', priority: 4 },
      { agentId: 'attributor', reason: '关键异常快速归因', priority: 5 },
      { agentId: 'predictor', reason: '预测未来业务走向', priority: 6 },
    ],
  },
  {
    id: 'analyst',
    label: '数据分析师',
    description: '深入分析、洞察归因、出结论',
    recommendedAgents: [
      { agentId: 'nora', reason: '复杂分析+业务故事化表达', priority: 1 },
      { agentId: 'attributor', reason: '多维归因找到问题根因', priority: 2 },
      { agentId: 'alisa', reason: '精准SQL查询，准确率99.8%', priority: 3 },
      { agentId: 'quality-guard', reason: '数据质量监控与异常检测', priority: 4 },
      { agentId: 'viz-master', reason: '专业图表让洞察更直观', priority: 5 },
      { agentId: 'data-detective', reason: '抽丝剥茧追踪数据线索', priority: 6 },
    ],
  },
  {
    id: 'business',
    label: '业务负责人',
    description: '看业务表现、对比与增长机会',
    recommendedAgents: [
      { agentId: 'growth-hacker', reason: '发现增长机会与转化漏斗', priority: 1 },
      { agentId: 'alisa', reason: '快速查看业务关键数据', priority: 2 },
      { agentId: 'viz-master', reason: '业务数据可视化呈现', priority: 3 },
      { agentId: 'operation-pro', reason: '活动效果与用户行为洞察', priority: 4 },
      { agentId: 'report-lisa', reason: '业务周报月报一键生成', priority: 5 },
      { agentId: 'predictor', reason: '预测销售趋势辅助决策', priority: 6 },
    ],
  },
  {
    id: 'ops',
    label: '运营',
    description: '盯运营指标、异常发现与排查',
    recommendedAgents: [
      { agentId: 'operation-pro', reason: '运营数据分析专家', priority: 1 },
      { agentId: 'quality-guard', reason: '数据异常实时预警', priority: 2 },
      { agentId: 'attributor', reason: '异常指标快速归因', priority: 3 },
      { agentId: 'growth-hacker', reason: '用户增长与转化分析', priority: 4 },
      { agentId: 'alisa', reason: '日常数据快速查询', priority: 5 },
      { agentId: 'anxiety-analyst', reason: '风险预警提前发现', priority: 6 },
    ],
  },
  {
    id: 'finance',
    label: '财务',
    description: '营收、成本、利润与报表整理',
    recommendedAgents: [
      { agentId: 'report-lisa', reason: '财务报表自动生成', priority: 1 },
      { agentId: 'metrics-pro', reason: '财务指标口径清晰定义', priority: 2 },
      { agentId: 'alisa', reason: '营收利润数据精准查询', priority: 3 },
      { agentId: 'viz-master', reason: '财务数据可视化展示', priority: 4 },
      { agentId: 'predictor', reason: '营收预测辅助预算', priority: 5 },
      { agentId: 'spreadsheet-ninja', reason: '复杂表格数据处理', priority: 6 },
    ],
  },
  {
    id: 'newbie',
    label: '新手/快速上手',
    description: '一步步引导，快速完成分析任务',
    recommendedAgents: [
      { agentId: 'alisa', reason: '最简单易用，准确率最高', priority: 1 },
      { agentId: 'nora', reason: '用故事讲解数据更易懂', priority: 2 },
      { agentId: 'viz-master', reason: '图表展示直观易理解', priority: 3 },
      { agentId: 'metrics-pro', reason: '了解业务指标基础知识', priority: 4 },
      { agentId: 'operation-pro', reason: '学习运营数据分析', priority: 5 },
      { agentId: 'report-lisa', reason: '快速生成专业报表', priority: 6 },
    ],
  },
];

const CAPABILITY_ACTIONS = [
  { id: 'cap-overview', label: '指标查询', icon: BarChart3, query: '今年销售额是多少' },
  { id: 'cap-trend', label: '趋势分析', icon: LineChart, query: '近3个月销售额趋势' },
  { id: 'cap-compare', label: '对比分析', icon: PieChart, query: '各地区销售额对比' },
  { id: 'cap-attribution', label: '归因诊断', icon: Search, query: '为什么11月销售额下降了？' },
  { id: 'cap-report', label: '报告整理', icon: FileText, query: '帮我看看销售额和订单量' },
  { id: 'cap-dashboard', label: '看板生成', icon: LayoutDashboard, query: '帮我生成一个销售分析看板' },
  { id: 'cap-more', label: '更多', icon: MoreHorizontal, query: '' },
];

const MORE_CAPABILITY_ACTIONS = [
  { id: 'cap-metric-define', label: '口径解释', icon: FileText, query: '解释一下销售额这个指标的口径' },
  { id: 'cap-anomaly-detect', label: '异常检测', icon: Search, query: '检测销售额不正常的区域' },
  { id: 'cap-composition', label: '构成分析', icon: PieChart, query: '各品类销售额构成' },
  { id: 'cap-dashboard-plan', label: '看板规划', icon: LayoutDashboard, query: '给我一个销售看板的结构建议' },
];

type ScenarioTab =
  | 'digital_employees'
  | 'sales_overview'
  | 'anomaly_diagnosis'
  | 'user_analysis'
  | 'forecast_planning'
  | 'operation_monitor'
  | 'financial_report';

const SCENARIO_TABS: Array<{ id: ScenarioTab; label: string }> = [
  { id: 'digital_employees', label: '数字员工' },
  { id: 'sales_overview', label: '销售概览' },
  { id: 'anomaly_diagnosis', label: '异常诊断' },
  { id: 'user_analysis', label: '用户分析' },
  { id: 'forecast_planning', label: '预测规划' },
  { id: 'operation_monitor', label: '运营监控' },
  { id: 'financial_report', label: '财务报表' },
];

const SCENARIO_TAGLINE: Record<ScenarioTab, string> = {
  digital_employees: '围绕核心KPI、把趋势、结构、对比一次看清。',
  sales_overview: '销售人员每天都在问的问题，一句话搞定',
  anomaly_diagnosis: '数据出了问题？快速定位原因、给出建议',
  user_analysis: '了解你的用户，发现增长机会',
  forecast_planning: '用数据辅助决策，规划未来',
  operation_monitor: '每日必看的运营数据，异常早发现',
  financial_report: '财务数据一目了然，报表自动生成',
};

// 业务问题场景 - 按具体业务问题分类（和上面的分析能力区分开）
interface BusinessQuestion {
  id: string;
  title: string;
  description: string;
  query: string;
  tag: string; // 问题标签
}

const SCENARIO_DEMOS: Record<ScenarioTab, BusinessQuestion[]> = {
  digital_employees: [], // 数字员工tab不使用问题卡片，而是显示员工列表
  sales_overview: [
    { id: 'so-1', title: '今天卖了多少？', description: '快速查看今日销售实时数据', query: '今天销售额是多少', tag: '日常查数' },
    { id: 'so-2', title: '哪个产品卖得最好？', description: '找出TOP畅销产品', query: 'TOP10畅销产品是哪些', tag: '排行榜' },
    { id: 'so-3', title: '目标完成得怎么样？', description: '查看销售目标达成进度', query: '本月销售目标完成率', tag: '目标追踪' },
    { id: 'so-4', title: '哪个区域业绩最好？', description: '各区域销售排名', query: '各区域销售额排名', tag: '区域分析' },
  ],
  anomaly_diagnosis: [
    { id: 'ad-1', title: '为什么销售突然下降？', description: '诊断销售下滑的根本原因', query: '上周销售额下降的原因是什么', tag: '下滑诊断' },
    { id: 'ad-2', title: '哪里出了问题？', description: '定位异常发生的具体维度', query: '哪个渠道转化率异常', tag: '问题定位' },
    { id: 'ad-3', title: '库存是不是有问题？', description: '检查库存预警情况', query: '哪些产品库存告急', tag: '库存预警' },
    { id: 'ad-4', title: '退货率为什么变高？', description: '分析退货率上升原因', query: '退货率上升的原因', tag: '退货分析' },
  ],
  user_analysis: [
    { id: 'ua-1', title: '用户都是谁？', description: '了解核心用户画像', query: '主要用户群体画像是什么', tag: '用户画像' },
    { id: 'ua-2', title: '高价值客户有哪些？', description: '识别VIP客户群体', query: '高价值客户有哪些特征', tag: 'VIP识别' },
    { id: 'ua-3', title: '用户为什么流失？', description: '分析用户流失原因', query: '近期用户流失的主要原因', tag: '流失预警' },
    { id: 'ua-4', title: '新用户从哪来？', description: '追踪新用户来源渠道', query: '新用户主要来源渠道', tag: '获客分析' },
  ],
  forecast_planning: [
    { id: 'fp-1', title: '下个月能卖多少？', description: '预测下月销售趋势', query: '预测下个月销售额', tag: '销售预测' },
    { id: 'fp-2', title: '年度目标怎么分解？', description: '将目标拆解到季度/月', query: '年度目标如何分解到各月', tag: '目标分解' },
    { id: 'fp-3', title: '备货备多少合适？', description: '预测库存需求量', query: '下季度需要备多少库存', tag: '库存规划' },
    { id: 'fp-4', title: '调价会有什么影响？', description: '模拟价格调整效果', query: '涨价5%对销量有什么影响', tag: '价格模拟' },
  ],
  operation_monitor: [
    { id: 'om-1', title: '今天数据正常吗？', description: '快速检查今日核心指标', query: '今天各项指标是否正常', tag: '健康检查' },
    { id: 'om-2', title: '有什么需要关注的？', description: '查看今日异常告警', query: '今天有什么异常需要关注', tag: '告警中心' },
    { id: 'om-3', title: '比昨天怎么样？', description: '对比昨日数据变化', query: '今天比昨天表现如何', tag: '日环比' },
    { id: 'om-4', title: '活动效果怎么样？', description: '追踪营销活动效果', query: '这次促销活动效果如何', tag: '活动追踪' },
  ],
  financial_report: [
    { id: 'fr-1', title: '这个月赚了多少？', description: '查看本月利润情况', query: '本月净利润是多少', tag: '利润查询' },
    { id: 'fr-2', title: '钱都花在哪了？', description: '分析成本支出明细', query: '本月各项成本支出明细', tag: '成本明细' },
    { id: 'fr-3', title: '毛利率是多少？', description: '查看毛利率及变化', query: '各产品线毛利率是多少', tag: '毛利分析' },
    { id: 'fr-4', title: '帮我出份月报', description: '自动生成财务简报', query: '帮我生成本月财务月报', tag: '报表生成' },
  ],
};

const SCENARIO_DEFAULT_QUERY: Record<ScenarioTab, string> = {
  digital_employees: '你能帮我做什么',
  sales_overview: '今年销售额是多少',
  anomaly_diagnosis: '为什么11月销售额下降了？',
  user_analysis: '日活还有月活数据',
  forecast_planning: '预测下月销售额',
  operation_monitor: '本月订单量有多少',
  financial_report: '看一下营收以及利润',
};

const SIDEBAR_PINNED_TASKS: Array<{ id: string; label: string; query: string }> = [
  { id: 'pin-what', label: '你能干嘛', query: '你能干嘛' },
  { id: 'pin-ai', label: 'AI助手功能', query: 'AI助手功能' },
  { id: 'pin-full', label: '完整分析', query: '全面分析今年销售情况' },
  { id: 'pin-hi', label: '你好呀', query: '你好呀' },
  { id: 'pin-structure', label: '桌面文件整理框架', query: '帮我整理一个数据分析项目的文件夹结构' },
];

function safeReadRecentQueries(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_QUERIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === 'string' && x.trim().length > 0).slice(0, MAX_RECENT_QUERIES);
  } catch {
    return [];
  }
}

function writeRecentQuery(query: string) {
  const q = query.trim();
  if (!q) return;
  const existing = safeReadRecentQueries();
  const next = [q, ...existing.filter((x) => x !== q)].slice(0, MAX_RECENT_QUERIES);
  try {
    localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export const SimpleInputPage = ({ onQuestionSubmit, agent, onAgentChange, currentAgentId }: SimpleInputPageProps) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(agent.id);
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showWebSearchDropdown, setShowWebSearchDropdown] = useState(false);
  const [showGuidePanel, setShowGuidePanel] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>(() => safeReadRecentQueries());
  const [activeScenarioTab, setActiveScenarioTab] = useState<ScenarioTab>('digital_employees');
  const [showMoreCapabilities, setShowMoreCapabilities] = useState(false);
  const [showMoreEmployees, setShowMoreEmployees] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [canScrollEmployeesLeft, setCanScrollEmployeesLeft] = useState(false);
  const [canScrollEmployeesRight, setCanScrollEmployeesRight] = useState(false);
  // 每次页面刷新/加载都重新显示角色选择器（始终 true，选择后才变 false）
  const [showRolePicker, setShowRolePicker] = useState(true);
  const [userRole, setUserRole] = useState<typeof ROLE_OPTIONS[number] | null>(null);
  // 点击浮动引导助手时显示聚光灯式新手引导（PRD 4.5）
  const [showSpotlightTour, setShowSpotlightTour] = useState(false);
  // 点击「探索数字员工」后展示的探索视图（类似 MiniMax 专家页，极简苹果风）
  const [showExploreView, setShowExploreView] = useState(false);
  const [exploreTab, setExploreTab] = useState<'recommended' | 'all' | 'mine'>('recommended');
  const [exploreSort, setExploreSort] = useState<'default' | 'name'>('default');
  const [showCreateEmployee, setShowCreateEmployee] = useState(false);
  const [customAgents, setCustomAgents] = useState<AgentProfile[]>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_AGENTS_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw) as Array<{ id: string; name: string; title: string; description?: string }>;
      return Array.isArray(arr) ? arr.map((a) => ({ ...a, title: a.title || '自定义员工' })) : [];
    } catch {
      return [];
    }
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const employeesSectionRef = useRef<HTMLDivElement>(null);
  const employeesScrollRef = useRef<HTMLDivElement>(null);
  const agentDropdownRef = useRef<HTMLDivElement>(null);
  const webSearchDropdownRef = useRef<HTMLDivElement>(null);

  const selectedAgent =
    AGENTS.find((a) => a.id === selectedAgentId) ||
    customAgents.find((a) => a.id === selectedAgentId) ||
    agent;

  // 同步父组件的 currentAgentId 变化到本地状态
  useEffect(() => {
    if (currentAgentId && currentAgentId !== selectedAgentId) {
      setSelectedAgentId(currentAgentId);
    }
  }, [currentAgentId]);

  // 根据角色获取推荐的数字员工列表（带推荐原因）
  const getRecommendedAgentsForRole = (role: RoleOption | null) => {
    if (!role) return AGENTS.slice(0, 6).map(a => ({ agent: a, reason: '通用推荐' }));
    
    return role.recommendedAgents
      .map(rec => {
        const agent = AGENTS.find(a => a.id === rec.agentId);
        return agent ? { agent, reason: rec.reason, priority: rec.priority } : null;
      })
      .filter((item): item is { agent: typeof AGENTS[0]; reason: string; priority: number } => item !== null)
      .sort((a, b) => a.priority - b.priority);
  };

  const pickRecommendedAgent = (role: RoleOption) => {
    const recommended = getRecommendedAgentsForRole(role);
    return recommended[0]?.agent || AGENTS[0] || agent;
  };

  useEffect(() => {
    try {
      if (customAgents.length) {
        localStorage.setItem(
          CUSTOM_AGENTS_KEY,
          JSON.stringify(customAgents.map((a) => ({ id: a.id, name: a.name, title: a.title, description: a.description })))
        );
      } else {
        localStorage.removeItem(CUSTOM_AGENTS_KEY);
      }
    } catch {
      // ignore
    }
  }, [customAgents]);

  const handleCreateEmployee = (draft: DraftEmployee) => {
    const id = `custom-${Date.now()}`;
    const newAgent: AgentProfile = {
      id,
      name: draft.name,
      title: draft.description.slice(0, 40) || '自定义员工',
      description: draft.description,
    };
    setCustomAgents((prev) => [newAgent, ...prev]);
    setExploreTab('mine');
    setShowCreateEmployee(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      writeRecentQuery(inputValue.trim());
      setRecentQueries(safeReadRecentQueries());
      onQuestionSubmit(inputValue.trim(), {
        agentId: selectedAgentId !== agent.id ? selectedAgentId : undefined,
        enableWebSearch,
      });
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleScenarioClick = (query: string) => {
    writeRecentQuery(query);
    setRecentQueries(safeReadRecentQueries());
    onQuestionSubmit(query, {
      agentId: selectedAgentId !== agent.id ? selectedAgentId : undefined,
      enableWebSearch,
    });
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId);
    setShowAgentDropdown(false);
    if (onAgentChange) {
      onAgentChange(agentId);
    }
  };

  const handleEmployeePick = (agentId: string) => {
    setSelectedAgentId(agentId);
    setShowAgentDropdown(false);
    Promise.resolve(onAgentChange?.(agentId)).catch(() => {});
    // 填充一个该业务场景的推荐问题（不自动发送）
    setInputValue(SCENARIO_DEFAULT_QUERY[activeScenarioTab]);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (!showRolePicker) {
      inputRef.current?.focus();
    }
  }, [showRolePicker]);

  // PRD 5.2：角色选择完成后，若未完成过新手引导，800ms 后自动启动聚光灯引导
  useEffect(() => {
    if (showRolePicker) return;
    const timer = setTimeout(() => {
      if (!hasCompletedOnboarding()) {
        setShowSpotlightTour(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [showRolePicker]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(event.target as Node)) {
        setShowAgentDropdown(false);
      }
      if (webSearchDropdownRef.current && !webSearchDropdownRef.current.contains(event.target as Node)) {
        setShowWebSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 监听“数字员工横向滚动区”是否还能左右滚动（用于按钮禁用态）
  useEffect(() => {
    const el = employeesScrollRef.current;
    if (!el) return;

    const update = () => {
      const maxLeft = el.scrollWidth - el.clientWidth;
      // 允许极小误差，避免抖动
      setCanScrollEmployeesLeft(el.scrollLeft > 2);
      setCanScrollEmployeesRight(el.scrollLeft < maxLeft - 2);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      el.removeEventListener('scroll', update as any);
      window.removeEventListener('resize', update);
    };
  }, [activeScenarioTab, showMoreEmployees]);

  const scrollEmployees = (direction: 'left' | 'right') => {
    const el = employeesScrollRef.current;
    if (!el) return;
    const delta = Math.max(320, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: direction === 'left' ? -delta : delta, behavior: 'smooth' });
  };

  return (
    <div className="h-screen w-full bg-[#FFFFFF] flex overflow-hidden">
      {/* 左侧栏（仅桌面端展示）- 固定高度，独立滚动 */}
      <aside data-tour="sidebar" className="hidden lg:flex w-[280px] h-screen flex-col border-r border-[#E5E5EA] bg-[#F9F9FB] flex-shrink-0">
        <div className="h-14 px-4 flex items-center">
          <div className="w-7 h-7 rounded-lg bg-white border border-[#E5E5EA] flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
          </div>
          <span className="ml-2 text-[13px] font-semibold text-[#1D1D1F] tracking-tight">
            亿问 Data Agent
          </span>
        </div>

        <div className="px-4 pt-2 pb-3">
          <button
            type="button"
            onClick={() => {
              setShowExploreView(false);
              setInputValue('');
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="w-full inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-[#E5E5EA] hover:border-[#007AFF]/30 hover:bg-[#F5F5F7] transition-all text-[13px] text-[#1D1D1F]"
          >
            <Plus className="w-4 h-4 text-[#1D1D1F]" />
            新建任务
          </button>

          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-[#C7C7CC] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="搜索"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E5E5EA] text-[13px] text-[#1D1D1F] placeholder:text-[#C7C7CC] focus:outline-none focus:border-[#007AFF]/40 focus:ring-2 focus:ring-[#007AFF]/10 transition-all"
            />
          </div>
        </div>

        <div className="px-4">
          <button
            type="button"
            onClick={() => setShowExploreView(true)}
            className={`w-full inline-flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left ${
              showExploreView
                ? 'bg-[#F0F7FF] border-[#007AFF]/30 text-[#007AFF]'
                : 'bg-white border-[#E5E5EA] hover:border-[#007AFF]/30 hover:bg-[#F5F5F7] text-[#1D1D1F]'
            }`}
          >
            <span className="inline-flex items-center gap-2 text-[13px]">
              <Sparkles className="w-4 h-4 text-[#007AFF]" />
              探索数字员工
              <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-[#F0F7FF] text-[#007AFF] border border-[#007AFF]/15">
                New
              </span>
            </span>
            <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />
          </button>
        </div>

        <div className="mt-5 px-4 text-[12px] text-[#86868B] flex-shrink-0">
          任务记录
        </div>

        <nav className="px-2 pb-4 mt-2 flex-1 overflow-y-auto scrollbar-hidden">
          {(() => {
            const baseItems = [
              ...SIDEBAR_PINNED_TASKS,
              ...recentQueries.map((q, idx) => ({ id: `recent-${idx}`, label: q, query: q })),
            ];
            const dedup = Array.from(new Map(baseItems.map((it) => [it.query, it])).values());
            const filtered = sidebarSearch.trim()
              ? dedup.filter((it) => it.label.includes(sidebarSearch.trim()))
              : dedup;
            return filtered.slice(0, 10).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleScenarioClick(item.query)}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-white transition-colors text-[13px] text-[#1D1D1F] truncate"
                title={item.label}
              >
                {item.label}
              </button>
            ));
          })()}
        </nav>

        <div className="mt-auto px-4 py-4 border-t border-[#E5E5EA] flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowRolePicker(true)}
            className="w-full flex items-center gap-2 p-2 -m-2 rounded-xl hover:bg-white transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              我
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] text-[#1D1D1F] font-medium truncate">
                {userRole ? userRole.label : '选择角色'}
              </div>
              <div className="text-[11px] text-[#86868B] truncate">
                {userRole ? userRole.description : '点击选择你的角色'}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#C7C7CC] flex-shrink-0" />
          </button>
        </div>
      </aside>

      {/* 主内容 - 比例参考：侧栏约 280px，右侧内容区居中、左右留白对称，不贴边 */}
      <main className="flex-1 h-screen overflow-y-auto flex justify-center">
      <div className="min-h-full w-full max-w-[min(100%,72rem)] flex flex-col pt-8 sm:pt-12 px-6 sm:px-10 lg:px-14 pb-16">
        {showExploreView ? (
          /* 员工市场 - MiniMax 式布局，极简苹果风，无图标无阴影 */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <button
                type="button"
                onClick={() => setShowExploreView(false)}
                className="text-[13px] text-[#86868B] hover:text-[#1D1D1F] transition-colors"
              >
                返回
              </button>
              <div className="flex items-center gap-3">
                {exploreTab === 'all' && (
                  <div className="flex p-0.5 bg-[#F5F5F7] rounded-lg border border-[#E5E5EA]">
                    <button
                      type="button"
                      onClick={() => setExploreSort('default')}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                        exploreSort === 'default' ? 'bg-white text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'
                      }`}
                    >
                      推荐优先
                    </button>
                    <button
                      type="button"
                      onClick={() => setExploreSort('name')}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                        exploreSort === 'name' ? 'bg-white text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'
                      }`}
                    >
                      名称
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowCreateEmployee(true)}
                  className="px-4 py-2 text-[13px] font-medium text-white bg-[#1D1D1F] hover:bg-[#000000] rounded-xl transition-colors"
                >
                  创建
                </button>
              </div>
            </div>
            <p className="text-[12px] text-[#86868B] uppercase tracking-wider mb-1">
              探索数字员工
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#1D1D1F] tracking-tight">
              数字员工
            </h1>
            <p className="mt-2 text-[15px] text-[#86868B]">
              探索数据分析专家，用一句话获取指标、趋势与归因结论。
            </p>
            <div className="mt-6 flex items-center gap-4 flex-wrap">
              <div className="flex p-0.5 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA]">
                <button
                  type="button"
                  onClick={() => setExploreTab('recommended')}
                  className={`px-4 py-2.5 text-[13px] font-medium rounded-lg transition-colors ${
                    exploreTab === 'recommended' ? 'bg-white text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  为你推荐
                </button>
                <button
                  type="button"
                  onClick={() => setExploreTab('all')}
                  className={`px-4 py-2.5 text-[13px] font-medium rounded-lg transition-colors ${
                    exploreTab === 'all' ? 'bg-white text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  全部
                </button>
                <button
                  type="button"
                  onClick={() => setExploreTab('mine')}
                  className={`px-4 py-2.5 text-[13px] font-medium rounded-lg transition-colors ${
                    exploreTab === 'mine' ? 'bg-white text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'
                  }`}
                >
                  我的专家
                </button>
              </div>
              {exploreTab === 'recommended' && userRole && (
                <p className="text-[12px] text-[#86868B]">
                  基于角色「{userRole.label}」推荐
                </p>
              )}
              {exploreTab === 'mine' && (
                <p className="text-[12px] text-[#86868B]">
                  你创建的数字员工（仅本机）
                </p>
              )}
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                const list =
                  exploreTab === 'recommended'
                    ? getRecommendedAgentsForRole(userRole)
                    : exploreTab === 'mine'
                      ? customAgents.map((a) => ({ agent: a, reason: '', priority: 0 }))
                      : (exploreSort === 'name'
                          ? [...AGENTS].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
                          : AGENTS
                        ).map((agent) => ({ agent, reason: '', priority: 0 }));
                if (exploreTab === 'mine' && list.length === 0) {
                  return (
                    <div className="col-span-full py-16 text-center border border-[#E5E5EA] rounded-2xl bg-[#F9F9FB]">
                      <p className="text-[15px] text-[#86868B]">暂无自定义数字员工</p>
                      <p className="mt-2 text-[13px] text-[#86868B]">点击右上角「创建」添加你的第一个专家</p>
                      <button
                        type="button"
                        onClick={() => setShowCreateEmployee(true)}
                        className="mt-6 px-5 py-2.5 text-[13px] font-medium text-white bg-[#007AFF] rounded-xl"
                      >
                        创建
                      </button>
                    </div>
                  );
                }
                return list.map(({ agent: agentItem, reason }) => (
                  <button
                    key={agentItem.id}
                    type="button"
                    onClick={() => {
                      handleEmployeePick(agentItem.id);
                      setShowExploreView(false);
                    }}
                    className={`w-full rounded-2xl border bg-white p-5 text-left transition-colors ${
                      selectedAgentId === agentItem.id
                        ? 'border-[#007AFF]'
                        : 'border-[#E5E5EA] hover:border-[#007AFF]/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden border border-[#E5E5EA] bg-[#F5F5F7] flex-shrink-0">
                        {agentItem.avatar ? (
                          <img src={agentItem.avatar} alt={agentItem.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-white bg-[#007AFF]">
                            {agentItem.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[15px] font-semibold text-[#1D1D1F]">
                            {agentItem.name}
                          </span>
                          {(agentItem.badge || (agentItem.id.startsWith('custom-') ? '自定义' : null)) && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5F5F7] text-[#86868B] border border-[#E5E5EA]">
                              {agentItem.id.startsWith('custom-') ? '自定义' : agentItem.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-[#86868B] mt-0.5">
                          {agentItem.title}
                        </div>
                        {agentItem.description && (
                          <p className="mt-2 text-[12px] text-[#86868B] leading-relaxed line-clamp-2">
                            {agentItem.description}
                          </p>
                        )}
                        {reason && (
                          <p className="mt-2 text-[11px] text-[#007AFF]">
                            {reason}
                          </p>
                        )}
                        <p className="mt-3 pt-3 border-t border-[#F0F0F0] text-[11px] text-[#C7C7CC]">
                          {agentItem.id.startsWith('custom-') ? '自定义 · 本机' : '亿问 · 数据分析'}
                        </p>
                      </div>
                    </div>
                  </button>
                ));
              })()}
            </div>
            <p className="mt-10 text-center text-[12px] text-[#C7C7CC]">
              到底了
            </p>
          </motion.div>
        ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center justify-center pt-4 sm:pt-8"
        >
        {/* 欢迎标题 - 顶级苹果设计 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 w-full"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.25rem] font-semibold text-[#000000] mb-2 tracking-[-0.02em] leading-[1.08]">
            欢迎来到
          </h1>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.25rem] font-semibold text-[#007AFF] tracking-[-0.02em] leading-[1.08]">
            亿问 Data Agent
          </h2>
          <p className="mt-3 text-[15px] text-[#86868B]">
            用一句话获取指标、趋势与归因结论
          </p>
        </motion.div>

        {/* 大输入框 - 顶级苹果设计，略放大 */}
        <motion.form
          data-tour="input-area"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSubmit}
          className="relative mb-6 w-full"
        >
          <div className="relative bg-white rounded-3xl border border-[#E5E5EA] focus-within:border-[#007AFF]/40 focus-within:shadow-[0_0_0_1px_rgba(0,122,255,0.18),0_16px_50px_rgba(0,0,0,0.08)] transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="说说你想分析什么…"
              className="w-full px-6 sm:px-7 pt-5 sm:pt-6 pb-4 sm:pb-5 pr-24 text-[16px] sm:text-[17px] text-[#000000] placeholder:text-[#8E8E93] bg-transparent border-none outline-none resize-none min-h-[88px] max-h-[220px] font-light"
              rows={1}
              style={{ 
                height: 'auto',
                overflow: 'hidden'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 250)}px`;
              }}
            />

            {/* 示例提示（MiniMax风格：低干扰、帮助冷启动） */}
            <div className="px-6 pb-2">
              <p className="text-[11px] text-[#86868B]">
                例如：近3个月销售额趋势 / 为什么11月销售下降 / 各地区销售额对比
              </p>
            </div>
            
            {/* 控制按钮 - 放在对话框内部左下角，顶级苹果设计 */}
            <div className="flex items-center gap-2 px-6 pb-4">
              {/* 切换数字员工 */}
              <div className="relative" ref={agentDropdownRef} data-tour="agent-selector">
                <button
                  type="button"
                  onClick={() => {
                    setShowAgentDropdown(!showAgentDropdown);
                    setShowWebSearchDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-[13px] text-[#000000] bg-white border border-[#E5E5EA]/80 hover:border-[#007AFF]/30 hover:bg-[#F9F9FB] rounded-xl transition-all duration-200 font-light shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  {selectedAgent.avatar ? (
                    <img 
                      src={selectedAgent.avatar} 
                      alt={selectedAgent.name}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-[#E8F0FF]"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-[10px] font-semibold ring-1 ring-[#E8F0FF]">
                      {selectedAgent.name.slice(0, 1)}
                    </div>
                  )}
                  <span className="font-light">{selectedAgent.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#007AFF]" />
                </button>
                {showAgentDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl border border-[#E5E5EA]/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] z-50 max-h-80 overflow-y-auto backdrop-blur-xl bg-white/98">
                    {AGENTS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleAgentSelect(a.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F9F9FB] transition-all duration-150 ${
                          selectedAgentId === a.id ? 'bg-[#F0F7FF]' : ''
                        }`}
                      >
                        {a.avatar ? (
                          <img src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-[#E5E5E5]" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-xs font-semibold ring-1 ring-[#E5E5E5]">
                            {a.name.slice(0, 1)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                        <div className="font-light text-[#000000] text-sm">{a.name}</div>
                        <div className="text-xs text-[#8E8E93] truncate font-light">{a.title}</div>
                        </div>
                        {selectedAgentId === a.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 联网搜索 */}
              <div className="relative" ref={webSearchDropdownRef} data-tour="deep-mode">
                <button
                  type="button"
                  onClick={() => {
                    setShowWebSearchDropdown(!showWebSearchDropdown);
                    setShowAgentDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-[13px] text-[#000000] bg-white border border-[#E5E5EA]/80 hover:border-[#007AFF]/30 hover:bg-[#F9F9FB] rounded-xl transition-all duration-200 font-light shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <Globe className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span className="font-light">{enableWebSearch ? '联网搜索' : '本地模式'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#007AFF]" />
                </button>
                {showWebSearchDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl border border-[#E5E5EA]/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] z-50 backdrop-blur-xl bg-white/98">
                    <button
                      type="button"
                      onClick={() => {
                        setEnableWebSearch(false);
                        setShowWebSearchDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[#F9F9FB] transition-all duration-150 ${
                        !enableWebSearch ? 'bg-[#F0F7FF]' : ''
                      }`}
                    >
                      <div className="flex-1">
                      <div className="font-light text-[#000000] text-sm">本地模式</div>
                      <div className="text-xs text-[#8E8E93] font-light">使用本地数据</div>
                      </div>
                      {!enableWebSearch && <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></div>}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEnableWebSearch(true);
                        setShowWebSearchDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[#F9F9FB] transition-all duration-150 ${
                        enableWebSearch ? 'bg-[#F0F7FF]' : ''
                      }`}
                    >
                      <div className="flex-1">
                      <div className="font-light text-[#000000] text-sm">联网搜索</div>
                      <div className="text-xs text-[#8E8E93] font-light">搜索最新信息</div>
                    </div>
                    {enableWebSearch && <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></div>}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* 发送按钮 - 右下角，顶级苹果设计 */}
            <div className="absolute right-7 bottom-5 flex items-center gap-2">
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`
                  w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200
                  ${inputValue.trim() 
                    ? 'bg-[#007AFF] text-white hover:bg-[#0051D5] active:scale-95 shadow-[0_4px_12px_rgba(0,122,255,0.25),0_1px_3px_rgba(0,122,255,0.15)]' 
                    : 'bg-white border border-[#E5E5EA]/60 text-[#C7C7CC] cursor-not-allowed shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                  }
                `}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M2 14L14 2M14 2H6M14 2V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </motion.form>

        {/* 次级内容 - 能力胶囊行 + 数字员工（tab + 卡片），与上方同宽 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="w-full mt-6"
        >
          {/* 能力胶囊（和截图同一层级/密度） */}
          <div data-tour="capability-actions" className="flex flex-wrap justify-center gap-2">
            {CAPABILITY_ACTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'cap-more') setShowMoreCapabilities((v) => !v);
                    else handleScenarioClick(item.query);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#E5E5EA] hover:border-[#007AFF]/30 hover:bg-[#F9F9FB] transition-all"
                >
                  <Icon className="w-3.5 h-3.5 text-[#1D1D1F]" />
                  <span className="text-[12px] text-[#1D1D1F] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {showMoreCapabilities && (
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {MORE_CAPABILITY_ACTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleScenarioClick(item.query)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#E5E5EA] hover:border-[#007AFF]/30 hover:bg-[#F9F9FB] transition-all"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#1D1D1F]" />
                    <span className="text-[12px] text-[#1D1D1F] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 业务问题场景（tab + 横向卡片） */}
          <div data-tour="employee-cards" className="mt-6" ref={employeesSectionRef}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-[14px] text-[#86868B]">
                  {activeScenarioTab === 'digital_employees' 
                    ? (userRole ? `为${userRole.label}推荐的数字员工` : '数字员工') 
                    : '常见问题'}
                </h3>
                <div data-tour="scenario-tabs" className="flex p-1 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA]">
                  {SCENARIO_TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setActiveScenarioTab(t.id);
                        setShowMoreEmployees(false);
                      }}
                      className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all ${
                        activeScenarioTab === t.id ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollEmployees('left')}
                  disabled={!canScrollEmployeesLeft}
                  className={`w-8 h-8 rounded-full border border-[#E5E5EA] bg-white flex items-center justify-center transition-all ${
                    canScrollEmployeesLeft ? 'hover:border-[#007AFF]/30 hover:bg-[#F9F9FB]' : 'opacity-40 cursor-not-allowed'
                  }`}
                  aria-label="向左滚动"
                >
                  <ChevronLeft className="w-4 h-4 text-[#1D1D1F]" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollEmployees('right')}
                  disabled={!canScrollEmployeesRight}
                  className={`w-8 h-8 rounded-full border border-[#E5E5EA] bg-white flex items-center justify-center transition-all ${
                    canScrollEmployeesRight ? 'hover:border-[#007AFF]/30 hover:bg-[#F9F9FB]' : 'opacity-40 cursor-not-allowed'
                  }`}
                  aria-label="向右滚动"
                >
                  <ChevronRight className="w-4 h-4 text-[#1D1D1F]" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowMoreEmployees((v) => !v)}
                  className="ml-1 text-[12px] text-[#86868B] hover:text-[#1D1D1F] inline-flex items-center gap-1.5"
                >
                  {showMoreEmployees ? '收起' : '显示更多'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-1 text-[11px] text-[#86868B]">
              {activeScenarioTab === 'digital_employees' && userRole
                ? `基于您的角色「${userRole.label}」，为您精选最适合的数字员工`
                : SCENARIO_TAGLINE[activeScenarioTab]}
            </div>

            <div ref={employeesScrollRef} className="mt-3 flex gap-3 overflow-x-auto scrollbar-hidden pb-2">
              {activeScenarioTab === 'digital_employees' ? (
                // 数字员工卡片 - 根据用户角色推荐
                (() => {
                  const recommendedList = getRecommendedAgentsForRole(userRole);
                  const displayList = showMoreEmployees ? recommendedList : recommendedList.slice(0, 4);
                  
                  return displayList.map(({ agent: agentItem, reason }) => (
                    <button
                      key={agentItem.id}
                      type="button"
                      onClick={() => handleEmployeePick(agentItem.id)}
                      className={`min-w-[200px] max-w-[200px] rounded-2xl border bg-white p-4 text-left transition-all group ${
                        selectedAgentId === agentItem.id 
                          ? 'border-[#007AFF] shadow-[0_2px_12px_rgba(0,122,255,0.12)]' 
                          : 'border-[#E5E5EA] hover:border-[#007AFF]/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                      }`}
                    >
                      {/* 头像 + 名称 + 标签 */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-[#E5E5EA]/60 bg-[#F5F5F7] flex-shrink-0">
                          {agentItem.avatar ? (
                            <img src={agentItem.avatar} alt={agentItem.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-white bg-[#007AFF]">
                              {agentItem.name.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[13px] font-semibold transition-colors ${
                              selectedAgentId === agentItem.id ? 'text-[#007AFF]' : 'text-[#1D1D1F] group-hover:text-[#007AFF]'
                            }`}>
                              {agentItem.name}
                            </span>
                            {agentItem.badge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#86868B]">
                                {agentItem.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#86868B]">
                            {agentItem.title}
                          </div>
                        </div>
                      </div>
                      
                      {/* 推荐原因 */}
                      {reason && userRole && (
                        <div className="mt-2.5 text-[10px] text-[#007AFF] flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{reason}</span>
                        </div>
                      )}
                      
                      {/* 简短描述 */}
                      {agentItem.description && (
                        <p className="mt-2 text-[11px] text-[#86868B] leading-relaxed line-clamp-2">
                          {agentItem.description}
                        </p>
                      )}
                    </button>
                  ));
                })()
              ) : (
                // 问题卡片
                SCENARIO_DEMOS[activeScenarioTab]
                  .slice(0, showMoreEmployees ? undefined : 4)
                  .map((question) => (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => handleScenarioClick(question.query)}
                      className="min-w-[200px] max-w-[200px] rounded-2xl border border-[#E5E5EA] bg-white p-4 text-left transition-all group hover:border-[#007AFF]/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                      title={question.query}
                    >
                      <div className="flex flex-col">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#86868B] group-hover:bg-[#007AFF]/10 group-hover:text-[#007AFF] transition-colors w-fit mb-2">
                        {question.tag}
                      </span>
                      <div className="text-[13px] font-semibold text-[#1D1D1F] group-hover:text-[#007AFF] transition-colors leading-snug">
                        {question.title}
                      </div>
                      <div className="text-[11px] text-[#86868B] mt-1.5 leading-relaxed line-clamp-2">
                        {question.description}
                      </div>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
        )}
      </div>
      </main>

      {/* 增强引导面板 */}
      <AnimatePresence>
        {showGuidePanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGuidePanel(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full"
            >
              <EnhancedGuidePanel
                onQuestionSelect={(question, recommendedAgentId) => {
                  // 如果推荐了AI员工，先切换员工再提问
                  if (recommendedAgentId && recommendedAgentId !== (currentAgentId || agent.id)) {
                    if (onAgentChange) {
                      Promise.resolve(onAgentChange(recommendedAgentId)).then(() => {
                        setTimeout(() => {
                          handleScenarioClick(question);
                          setShowGuidePanel(false);
                        }, 300);
                      });
                    } else {
                      handleScenarioClick(question);
                      setShowGuidePanel(false);
                    }
                  } else {
                    handleScenarioClick(question);
                    setShowGuidePanel(false);
                  }
                }}
                onClose={() => setShowGuidePanel(false)}
                currentAgentId={currentAgentId || agent.id}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 进入首页先选角色 */}
      <AnimatePresence>
        {showRolePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#E5E5EA] shadow-[0_30px_80px_rgba(0,0,0,0.18)] p-6 sm:p-8"
            >
              <button
                type="button"
                onClick={() => setShowRolePicker(false)}
                className="absolute top-5 right-5 sm:top-6 sm:right-6 w-9 h-9 rounded-full flex items-center justify-center text-[#86868B] hover:bg-[#F2F2F7] hover:text-[#1D1D1F] transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h3 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F]">
                  先选择你的角色
                </h3>
                <p className="mt-2 text-sm text-[#86868B]">
                  我们会基于角色为你推荐合适的数字员工
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ROLE_OPTIONS.map((role) => {
                  const recommended = pickRecommendedAgent(role);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        // 1. 设置用户角色
                        setUserRole(role);
                        // 2. 自动选择推荐的数字员工（只更新本地状态，保留在首页不跳转）
                        setSelectedAgentId(recommended.id);
                        // 3. 重置引导完成标记，使本次「选择角色后」能自动弹出分角色引导（PRD 4.2）
                        resetOnboardingTour();
                        // 4. 关闭角色选择弹窗 -> 约 800ms 后 effect 会触发 setShowSpotlightTour(true)
                        setShowRolePicker(false);
                      }}
                      className="rounded-2xl border border-[#E5E5EA] bg-white p-4 text-left hover:border-[#007AFF]/30 hover:bg-[#F9F9FB] transition-all"
                    >
                      <div className="text-[15px] font-semibold text-[#1D1D1F]">{role.label}</div>
                      <div className="mt-1 text-[12px] text-[#86868B]">{role.description}</div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-[#E5E5EA] bg-[#F5F5F7] flex-shrink-0">
                          {recommended.avatar ? (
                            <img src={recommended.avatar} alt={recommended.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-white bg-[#007AFF]">
                              {recommended.name.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] text-[#1D1D1F] truncate">
                            推荐：{recommended.name}
                          </div>
                          <div className="text-[11px] text-[#86868B] truncate">
                            {recommended.title}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 员工创建面板 - 双栏：左侧引导输入，右侧配置表单 */}
      <AnimatePresence>
        {showCreateEmployee && (
          <EmployeeCreatePanel
            onClose={() => setShowCreateEmployee(false)}
            onCreate={handleCreateEmployee}
          />
        )}
      </AnimatePresence>

      {/* 聚光灯式新手引导（PRD 4.5）- 点击浮动引导助手或首次进入时触发 */}
      {showSpotlightTour && (
        <OnboardingTour
          forceShow
          onComplete={() => setShowSpotlightTour(false)}
        />
      )}

      {/* 右下角浮动引导助手 - 仅按钮，点击触发聚光灯引导，无展开面板 */}
      <FloatingGuideAssistant
        key={`guide-${selectedAgentId}`}
        agentName={selectedAgent.name}
        agentAvatar={selectedAgent.avatar}
        onTriggerGuide={() => setShowSpotlightTour(true)}
      />
    </div>
  );
};

