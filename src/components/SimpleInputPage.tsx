/**
 * 简约输入界面 - 参考 ima copilot 设计
 * 完全独立的界面，包含输入框、切换数字员工、联网选择、常用场景等
 */

import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate, type MotionValue } from 'framer-motion';
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
import { HelpDocPanel } from './HelpDocPanel';
import { EmployeeCreatePanel, type DraftEmployee } from './EmployeeCreatePanel';
import { FloatingGuideAssistant } from './FloatingGuideAssistant';
import { OnboardingTour, hasCompletedOnboarding, resetOnboardingTour } from './OnboardingTour';

const CUSTOM_AGENTS_KEY = 'yiwen_custom_agents_v1';
const EXPLORE_GUIDE_SEEN_KEY = 'yiwen_explore_guide_seen';

/** 聚光灯遮罩：圆心与半径由 motion 驱动，从中心大圆移到右下角并收缩到与智能助手小球一致后淡出 */
const SPOTLIGHT_BALL_RADIUS = 28; // 与 FloatingGuideAssistant 的 w-14 (56px) 一致，半径 28px
const SPOTLIGHT_INITIAL_RADIUS = 180;

function SpotlightOverlay({
  visible,
  spotlightX,
  spotlightY,
  spotlightRadius,
  spotlightOpacity,
}: {
  visible: boolean;
  spotlightX: MotionValue<number>;
  spotlightY: MotionValue<number>;
  spotlightRadius: MotionValue<number>;
  spotlightOpacity: MotionValue<number>;
}) {
  const background = useTransform(
    () =>
      `radial-gradient(circle at ${Math.round(spotlightX.get())}px ${Math.round(spotlightY.get())}px, transparent 0%, transparent ${Math.round(spotlightRadius.get())}px, rgba(0,0,0,0.72) ${Math.round(spotlightRadius.get())}px, rgba(0,0,0,0.72) 100%)`
  );
  if (!visible) return null;
  return (
    <motion.div
      className="fixed inset-0 z-[60] pointer-events-none"
      aria-hidden
      style={{ background, opacity: spotlightOpacity }}
    />
  );
}

interface SimpleInputPageProps {
  onQuestionSubmit: (question: string, options?: { agentId?: string; enableWebSearch?: boolean; fromTourDemo?: boolean }) => void;
  agent: AgentProfile;
  onAgentChange?: (agentId: string) => void | Promise<void>;
  currentAgentId?: string;
  /** 跳转到数据开发配置页（数据源/业务建模/指标管理） */
  onNavigateToConfig?: (page: 'datasource' | 'modeling' | 'indicators') => void;
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

// PRD F.1.2：四张主卡片（CXO/业务负责人/一线业务/数据开发），其余为「更多角色」
const MAIN_ROLE_IDS = ['exec', 'business', 'ops', 'developer'] as const;
const OTHER_ROLE_IDS = ['analyst', 'finance', 'newbie'] as const;

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'exec',
    label: 'CXO / 高管',
    description: '我关注经营结论，需要辅助决策',
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
    id: 'business',
    label: '业务负责人',
    description: '我关注团队业绩，需要管理报表',
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
    label: '一线业务',
    description: '我从事实操工作，需要查询数据',
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
    id: 'developer',
    label: '数据开发',
    description: '我负责系统搭建，需要接入数据',
    recommendedAgents: [
      { agentId: 'quality-guard', reason: '数据质量监控与异常检测', priority: 1 },
      { agentId: 'alisa', reason: '精准查询与数据接入', priority: 2 },
      { agentId: 'metrics-pro', reason: '指标与口径管理', priority: 3 },
      { agentId: 'data-detective', reason: '数据线索追踪', priority: 4 },
      { agentId: 'viz-master', reason: '数据可视化', priority: 5 },
      { agentId: 'report-lisa', reason: '报表与审计', priority: 6 },
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
    label: '新手 / 快速上手',
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
  | 'indicators'   // PRD 一线步骤2：指标口径
  | 'knowledge'    // PRD 一线步骤2：知识库
  | 'dashboard'             // PRD 业务负责人步骤4：看板
  | 'data_dev'              // PRD 数据开发路径：审计/数据源/建模/指标
  | 'sales_overview'
  | 'anomaly_diagnosis'
  | 'user_analysis'
  | 'forecast_planning'
  | 'operation_monitor'
  | 'financial_report';

const SCENARIO_TABS: Array<{ id: ScenarioTab; label: string }> = [
  { id: 'digital_employees', label: '数字员工' },
  { id: 'indicators', label: '指标' },
  { id: 'knowledge', label: '知识库' },
  { id: 'dashboard', label: '看板' },
  { id: 'data_dev', label: '数据开发' },
  { id: 'sales_overview', label: '销售概览' },
  { id: 'anomaly_diagnosis', label: '异常诊断' },
  { id: 'user_analysis', label: '用户分析' },
  { id: 'forecast_planning', label: '预测规划' },
  { id: 'operation_monitor', label: '运营监控' },
  { id: 'financial_report', label: '财务报表' },
];

/** 按角色绑定：每个角色只显示与其相关的 Tab，不展示完整列表 */
function getVisibleTabIdsForRole(roleId: string | undefined): ScenarioTab[] {
  switch (roleId) {
    case 'exec':
      return ['digital_employees', 'dashboard'];
    case 'business':
      return ['digital_employees', 'indicators', 'knowledge', 'dashboard', 'sales_overview', 'anomaly_diagnosis', 'user_analysis', 'forecast_planning', 'operation_monitor', 'financial_report'];
    case 'ops':
      return ['digital_employees', 'indicators', 'knowledge', 'sales_overview', 'anomaly_diagnosis', 'operation_monitor'];
    case 'developer':
      return ['digital_employees', 'data_dev', 'indicators', 'knowledge'];
    case 'finance':
      return ['digital_employees', 'financial_report', 'dashboard', 'sales_overview', 'forecast_planning'];
    case 'analyst':
      return ['digital_employees', 'indicators', 'knowledge', 'dashboard', 'data_dev', 'sales_overview', 'anomaly_diagnosis', 'user_analysis', 'forecast_planning', 'operation_monitor', 'financial_report'];
    case 'newbie':
      return ['digital_employees', 'sales_overview', 'anomaly_diagnosis', 'user_analysis'];
    default:
      return ['digital_employees', 'indicators', 'knowledge', 'dashboard', 'sales_overview', 'anomaly_diagnosis', 'user_analysis'];
  }
}

const SCENARIO_TAGLINE: Record<ScenarioTab, string> = {
  digital_employees: '围绕核心KPI、把趋势、结构、对比一次看清。',
  indicators: '指标口径说明与业务术语，新建术语统一管理',
  knowledge: '关于我们、产品介绍、客户案例与文档，一问即得',
  dashboard: '核心指标看板，一目了然',
  data_dev: '审计日志、数据源、业务建模、指标管理',
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
  digital_employees: [],
  indicators: [],   // 使用下方「指标」专用区块
  knowledge: [],    // 使用下方「知识库」专用区块
  dashboard: [
    { id: 'db-1', title: '销售看板', description: '销售额、目标达成、同比环比', query: '给我一个销售看板', tag: '看板' },
    { id: 'db-2', title: '运营看板', description: '核心运营指标一览', query: '生成运营监控看板', tag: '看板' },
    { id: 'db-3', title: '财务看板', description: '收入、成本、利润概览', query: '财务概览看板', tag: '看板' },
  ],
  data_dev: [], // 使用下方「数据开发」四宫格
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
  indicators: '什么是 GMV',
  knowledge: '介绍一下产品',
  dashboard: '销售看板关键指标',
  data_dev: '数据源接入状态',
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

export const SimpleInputPage = ({ onQuestionSubmit, agent, onAgentChange, currentAgentId, onNavigateToConfig }: SimpleInputPageProps) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(agent.id);
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showWebSearchDropdown, setShowWebSearchDropdown] = useState(false);
  const [showGuidePanel, setShowGuidePanel] = useState(false);
  const [showHelpDoc, setShowHelpDoc] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>(() => safeReadRecentQueries());
  const [activeScenarioTab, setActiveScenarioTab] = useState<ScenarioTab>('digital_employees');
  const [showMoreCapabilities, setShowMoreCapabilities] = useState(false);
  const [showMoreEmployees, setShowMoreEmployees] = useState(false);
  const [showNewTermModal, setShowNewTermModal] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [canScrollEmployeesLeft, setCanScrollEmployeesLeft] = useState(false);
  const [canScrollEmployeesRight, setCanScrollEmployeesRight] = useState(false);
  // PRD F.1.1：每次刷新都先全屏欢迎，再进入角色选择
  const [showWelcome, setShowWelcome] = useState(true);
  const [showWhatIsThis, setShowWhatIsThis] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [userRole, setUserRole] = useState<typeof ROLE_OPTIONS[number] | null>(null);
  // PRD F.1.2：角色选择器默认预选「一线业务」(业务执行)
  const [rolePickerSelectedId, setRolePickerSelectedId] = useState<string>('ops');
  // 关闭角色选择时未选则二次确认（PRD 低优）
  const [showRoleCloseConfirm, setShowRoleCloseConfirm] = useState(false);
  // 角色选择「更多角色」折叠
  const [showOtherRolesExpanded, setShowOtherRolesExpanded] = useState(false);
  // 按需触发数字员工引导：首次进入探索页时显示一次气泡
  const [showExploreGuideBubble, setShowExploreGuideBubble] = useState(false);
  const execDemoTriggeredRef = useRef(false);
  /** CXO 追问演示：步骤 3「追问与交互」进入时仅触发一次，自动键入并发送追问（在首页时） */
  const execFollowUpTriggeredRef = useRef(false);
  /** 首问来自引导演示时传 fromTourDemo，便于在对话界面内做追问暗示与自动演示 */
  const execTourFirstSubmitRef = useRef(false);
  // 点击浮动引导助手时显示聚光灯式新手引导（PRD 4.5）
  const [showSpotlightTour, setShowSpotlightTour] = useState(false);
  /** 引导完成后悬浮球缩放回归动画：递增值触发一次从缩小到正常的动画 */
  const [assistantReturnAnimationKey, setAssistantReturnAnimationKey] = useState(0);
  /** 聚光灯移动动画：从中心移动到右下角小球后消失，引导用户去点小助手 */
  const [showSpotlightJourney, setShowSpotlightJourney] = useState(false);
  const spotlightJourneyRunRef = useRef(false);
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const spotlightRadius = useMotionValue(SPOTLIGHT_INITIAL_RADIUS);
  const spotlightOpacity = useMotionValue(1);
  // 亿问小助手帮助面板（口述稿「前往小助手」或点击右下角按钮打开）
  const [showHelperPanel, setShowHelperPanel] = useState(false);
  // 点击「探索数字员工」后展示的探索视图（类似 MiniMax 专家页，极简苹果风）
  const [showExploreView, setShowExploreView] = useState(false);
  const [exploreTab, setExploreTab] = useState<'recommended' | 'all' | 'mine'>('recommended');
  const [exploreSort, setExploreSort] = useState<'default' | 'name'>('default');
  const [showCreateEmployee, setShowCreateEmployee] = useState(false);
  /** 会议口述稿「演示」：主输入框自动打字并发送的句子，非空时执行打字机效果 */
  const [demoTypingPhrase, setDemoTypingPhrase] = useState<string | null>(null);
  /** 打字完成后触发一次提交（演示完整提问流程） */
  const [triggerDemoSubmit, setTriggerDemoSubmit] = useState(false);
  /** 当前正在「演示高亮」的区域，用于短暂脉冲高亮 */
  const [demoHighlightSection, _setDemoHighlightSection] = useState<'capability-actions' | 'employee-cards' | null>(null);
  /** PRD F.2.4 Lazy：首次点击数据源/建模/指标卡片时触发的引导 */
  const [lazyDevGuide, setLazyDevGuide] = useState<'datasource' | 'modeling' | 'indicators' | null>(null);
  const demoTypingIndexRef = useRef(0);
  /** 选择角色/提交后收缩到右下角悬浮球的动画：待提交的 question + options，非空时触发测量与动画 */
  const [shrinkPayload, setShrinkPayload] = useState<{ question: string; options?: { agentId?: string; enableWebSearch?: boolean; fromTourDemo?: boolean } } | null>(null);
  /** 收缩动画使用的初始 rect（测量得到），用于 fixed 定位与位移终点 */
  const [shrinkRect, setShrinkRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
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

  // 按角色绑定的可见 Tab 列表
  const visibleTabIds = useMemo(() => getVisibleTabIdsForRole(userRole?.id), [userRole?.id]);
  const visibleScenarioTabs = useMemo(
    () => SCENARIO_TABS.filter((t) => visibleTabIds.includes(t.id)),
    [visibleTabIds]
  );

  // 角色或可见 Tab 变化时，若当前选中的 Tab 不在可见列表内，则切回第一个可见 Tab
  useEffect(() => {
    if (!visibleTabIds.includes(activeScenarioTab)) {
      setActiveScenarioTab(visibleTabIds[0] ?? 'digital_employees');
    }
  }, [visibleTabIds, activeScenarioTab]);

  // PRD F.2.4 数据开发：选数据开发角色后默认切到「数据开发」tab，保证审计日志追光灯能对准 [data-tour="dev-audit"]
  useEffect(() => {
    if (userRole?.id === 'developer' && visibleTabIds.includes('data_dev')) {
      setActiveScenarioTab('data_dev');
    }
  }, [userRole?.id, visibleTabIds]);

  // 打开角色选择器时同步默认预选（PRD：默认业务执行/一线）
  useEffect(() => {
    if (showRolePicker) {
      setRolePickerSelectedId(userRole?.id ?? 'ops');
    }
  }, [showRolePicker]); // eslint-disable-line react-hooks/exhaustive-deps -- only when opening picker

  // 首次进入探索数字员工页时显示一次按需引导气泡
  useEffect(() => {
    if (!showExploreView) return;
    if (typeof window !== 'undefined' && !localStorage.getItem(EXPLORE_GUIDE_SEEN_KEY)) {
      setShowExploreGuideBubble(true);
    }
  }, [showExploreView]);

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
    if (!inputValue.trim() || shrinkPayload) return;
    writeRecentQuery(inputValue.trim());
    setRecentQueries(safeReadRecentQueries());
    const isTourFirstDemo = userRole?.id === 'exec' && inputValue.trim() === '上周销售额是多少？' && execTourFirstSubmitRef.current;
    if (isTourFirstDemo) execTourFirstSubmitRef.current = false;
    setShrinkPayload({
      question: inputValue.trim(),
      options: {
        agentId: selectedAgentId !== agent.id ? selectedAgentId : undefined,
        enableWebSearch,
        fromTourDemo: isTourFirstDemo,
      },
    });
    setInputValue('');
  };

  /** 会议口述稿「主输入框」演示：打字机效果 + 自动发送 */
  useEffect(() => {
    const phrase = demoTypingPhrase;
    if (!phrase) return;
    setShowExploreView(false);
    demoTypingIndexRef.current = 0;
    document.getElementById('yiwen-input-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const t1 = setTimeout(() => inputRef.current?.focus(), 400);
    let submitTimeout: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      demoTypingIndexRef.current += 1;
      const idx = demoTypingIndexRef.current;
      setInputValue(phrase.slice(0, idx));
      if (idx >= phrase.length) {
        clearInterval(id);
        setDemoTypingPhrase(null);
        // CXO 引导：只填入文案，不自动发送，等用户点击发送后再跳转
        if (phrase !== '上周销售额是多少？') {
          submitTimeout = setTimeout(() => setTriggerDemoSubmit(true), 350);
        }
      }
    }, 70);
    return () => {
      clearTimeout(t1);
      clearInterval(id);
      if (typeof submitTimeout !== 'undefined') clearTimeout(submitTimeout);
    };
  }, [demoTypingPhrase]);

  /** 打字完成后触发一次提交（演示完整流程）；CXO 首问时传 fromTourDemo 以便在对话区内做追问暗示；先走收缩动画再提交 */
  useEffect(() => {
    if (!triggerDemoSubmit) return;
    if (inputValue.trim() && !shrinkPayload) {
      writeRecentQuery(inputValue.trim());
      setRecentQueries(safeReadRecentQueries());
      const fromTourDemo = userRole?.id === 'exec' && execTourFirstSubmitRef.current;
      if (fromTourDemo) execTourFirstSubmitRef.current = false;
      setShrinkPayload({
        question: inputValue.trim(),
        options: {
          agentId: selectedAgentId !== agent.id ? selectedAgentId : undefined,
          enableWebSearch,
          fromTourDemo,
        },
      });
      setInputValue('');
    }
    setTriggerDemoSubmit(false);
  }, [triggerDemoSubmit, shrinkPayload]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleScenarioClick = (query: string) => {
    if (shrinkPayload) return;
    writeRecentQuery(query);
    setRecentQueries(safeReadRecentQueries());
    setShrinkPayload({
      question: query,
      options: {
        agentId: selectedAgentId !== agent.id ? selectedAgentId : undefined,
        enableWebSearch,
      },
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

  // PRD 5.2：仅当欢迎页已关闭且角色选择完成后，才自动启动聚光灯引导（不让引导提前出现）
  useEffect(() => {
    if (showWelcome || showRolePicker) return;
    const timer = setTimeout(() => {
      if (!hasCompletedOnboarding()) {
        setShowSpotlightTour(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [showWelcome, showRolePicker]);

  // 每次打开聚光灯引导（含「重新体验引导」）时重置 CXO 问答/追问演示标记，保证完整自动演示可再次执行
  useEffect(() => {
    if (showSpotlightTour) {
      execDemoTriggeredRef.current = false;
      execFollowUpTriggeredRef.current = false;
    }
  }, [showSpotlightTour]);

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

  // 选择角色/提交后：收缩到右下角悬浮球的动画，动画结束后再真正提交
  const BALL_OFFSET = 24; // 与 FloatingGuideAssistant 的 bottom-6 right-6 一致
  useLayoutEffect(() => {
    if (!shrinkPayload || shrinkRect !== null || !contentWrapperRef.current) return;
    const rect = contentWrapperRef.current.getBoundingClientRect();
    setShrinkRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
  }, [shrinkPayload, shrinkRect]);

  const handleShrinkComplete = () => {
    if (shrinkPayload) {
      onQuestionSubmit(shrinkPayload.question, shrinkPayload.options);
      setShrinkPayload(null);
      setShrinkRect(null);
    }
  };

  // 聚光灯旅程：仅在本轮「新打开」时设初始值，避免重渲染把动画中途重置；动画只跑一次
  useLayoutEffect(() => {
    if (!showSpotlightJourney || typeof window === 'undefined') return;
    if (spotlightJourneyRunRef.current) return; // 已开过动画，不要重置位置
    spotlightX.set(window.innerWidth / 2);
    spotlightY.set(window.innerHeight / 2);
    spotlightRadius.set(SPOTLIGHT_INITIAL_RADIUS);
    spotlightOpacity.set(1);
  }, [showSpotlightJourney, spotlightX, spotlightY, spotlightRadius, spotlightOpacity]);

  useEffect(() => {
    if (!showSpotlightJourney || typeof window === 'undefined') return;
    if (spotlightJourneyRunRef.current) return;
    spotlightJourneyRunRef.current = true;
    const endX = window.innerWidth - 52;
    const endY = window.innerHeight - 52;
    const ctrlX = animate(spotlightX, endX, { duration: 1, ease: [0.22, 1, 0.36, 1] });
    const ctrlY = animate(spotlightY, endY, { duration: 1, ease: [0.22, 1, 0.36, 1] });
    const ctrlR = animate(spotlightRadius, SPOTLIGHT_BALL_RADIUS, { duration: 1, ease: [0.22, 1, 0.36, 1] });
    const t = setTimeout(() => {
      animate(spotlightOpacity, 0, { duration: 0.4, ease: 'easeOut' }).then(() => {
        setShowSpotlightJourney(false);
        spotlightJourneyRunRef.current = false;
      });
    }, 1000);
    return () => {
      ctrlX.stop();
      ctrlY.stop();
      ctrlR.stop();
      clearTimeout(t);
    };
  }, [showSpotlightJourney, spotlightX, spotlightY, spotlightRadius, spotlightOpacity]);

  return (
    <div className="h-screen w-full bg-[#FFFFFF] flex overflow-hidden">
      <motion.div
        ref={contentWrapperRef}
        className="flex flex-1 min-w-0 flex-row min-h-0"
        style={
          shrinkRect
            ? {
                position: 'fixed',
                left: shrinkRect.left,
                top: shrinkRect.top,
                width: shrinkRect.width,
                height: shrinkRect.height,
                transformOrigin: '100% 100%',
                zIndex: 60,
              }
            : undefined
        }
        initial={false}
        animate={
          shrinkRect
            ? {
                scale: 0,
                x: window.innerWidth - BALL_OFFSET - (shrinkRect.left + shrinkRect.width),
                y: window.innerHeight - BALL_OFFSET - (shrinkRect.top + shrinkRect.height),
              }
            : { scale: 1, x: 0, y: 0 }
        }
        transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        onAnimationComplete={() => {
          if (shrinkRect) handleShrinkComplete();
        }}
      >
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
          /* 员工市场 - MiniMax 式布局；PRD 按需触发数字员工引导气泡 */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-4xl mx-auto"
          >
            <AnimatePresence>
              {showExploreGuideBubble && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-6 p-4 rounded-2xl border border-[#007AFF]/20 bg-[#F0F7FF] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <p className="text-[13px] text-[#1D1D1F] leading-relaxed">
                    雇佣更专业的 AI 员工。比如 <strong>CFO Agent</strong> 擅长财务分析，<strong>供应链 Agent</strong> 擅长库存管理。
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') localStorage.setItem(EXPLORE_GUIDE_SEEN_KEY, '1');
                      setShowExploreGuideBubble(false);
                    }}
                    className="flex-shrink-0 px-4 py-2 text-[13px] font-medium text-white bg-[#007AFF] hover:bg-[#0051D5] rounded-xl transition-colors"
                  >
                    知道了
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
          id="yiwen-input-area"
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
            <div id="yiwen-agent-row" className="flex items-center gap-2 px-6 pb-4">
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
            
            {/* 发送按钮 - 右下角，引导 CXO 点击此处发送 */}
            <div className="absolute right-7 bottom-5 flex items-center gap-2">
              <button
                type="submit"
                data-tour="send-button"
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
          {/* 能力胶囊（和截图同一层级/密度）；口述稿演示时短暂高亮 */}
          <div
            id="yiwen-capability-actions"
            data-tour="capability-actions"
            className={`flex flex-wrap justify-center gap-2 rounded-2xl transition-all duration-300 ${demoHighlightSection === 'capability-actions' ? 'ring-2 ring-[#007AFF] ring-offset-2 bg-[#F0F7FF]/50' : ''}`}
          >
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

          {/* 业务问题场景（tab + 横向卡片）；口述稿演示时短暂高亮 */}
          <div
            id="yiwen-employee-cards"
            data-tour="employee-cards"
            className={`mt-6 rounded-2xl transition-all duration-300 ${demoHighlightSection === 'employee-cards' ? 'ring-2 ring-[#007AFF] ring-offset-2 bg-[#F0F7FF]/50' : ''}`}
            ref={employeesSectionRef}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[14px] text-[#86868B] whitespace-nowrap shrink-0 min-w-0 overflow-hidden text-ellipsis">
                {activeScenarioTab === 'digital_employees' 
                  ? (userRole ? `为${userRole.label}推荐的数字员工` : '数字员工') 
                  : '常见问题'}
              </h3>
                <div data-tour="scenario-tabs" className="flex flex-nowrap overflow-x-auto scrollbar-hidden p-1 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA] min-w-0">
                {visibleScenarioTabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    data-tour={t.id === 'dashboard' ? 'dashboard-tab' : t.id === 'indicators' ? 'indicators-tab' : t.id === 'knowledge' ? 'knowledge-tab' : t.id === 'data_dev' ? 'data-dev-tab' : undefined}
                    onClick={() => {
                      setActiveScenarioTab(t.id);
                      setShowMoreEmployees(false);
                    }}
                    className={`shrink-0 whitespace-nowrap px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all ${
                      activeScenarioTab === t.id ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
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
              {activeScenarioTab === 'data_dev' && (
                <span className="block mt-0.5 text-[#007AFF]/90">点击下方卡片进入对应配置，首次将显示操作引导。</span>
              )}
            </div>

            <div ref={employeesScrollRef} className="mt-3 flex gap-3 overflow-x-auto scrollbar-hidden pb-2">
              {activeScenarioTab === 'indicators' ? (
                /* PRD 一线步骤2：指标 Tab、口径说明、新建术语 */
                <div data-tour="knowledge-indicators" className="min-w-full rounded-2xl border border-[#E5E5EA] bg-white p-5">
                  <h4 className="text-[13px] font-semibold text-[#1D1D1F]">指标口径说明</h4>
                  <p className="mt-2 text-[12px] text-[#86868B] leading-relaxed">
                    GMV：商品交易总额，含下单未支付。DAU：日活跃用户数。MAU：月活跃用户数。转化率：目标行为完成人数 / 触达人数。
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowNewTermModal(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-white bg-[#007AFF] hover:bg-[#0051D5] rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    新建术语
                  </button>
                </div>
              ) : activeScenarioTab === 'knowledge' ? (
                /* PRD 一线步骤2：知识库 Tab - 关于我们、产品、案例、文档 */
                <div data-tour="knowledge-base" className="min-w-full rounded-2xl border border-[#E5E5EA] bg-white p-5">
                  <h4 className="text-[13px] font-semibold text-[#1D1D1F]">企业知识库</h4>
                  <p className="mt-2 text-[12px] text-[#86868B] leading-relaxed">
                    产品介绍、公司介绍、客户案例、功能说明等，支持自然语言提问，从知识库中检索回答。
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => { setInputValue('介绍一下产品'); }}
                      className="px-3 py-2 text-[12px] font-medium text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-lg transition-colors"
                    >
                      产品介绍
                    </button>
                    <button
                      type="button"
                      onClick={() => { setInputValue('公司介绍'); }}
                      className="px-3 py-2 text-[12px] font-medium text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-lg transition-colors"
                    >
                      公司介绍
                    </button>
                    <button
                      type="button"
                      onClick={() => { setInputValue('有哪些客户案例'); }}
                      className="px-3 py-2 text-[12px] font-medium text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-lg transition-colors"
                    >
                      客户案例
                    </button>
                    <button
                      type="button"
                      onClick={() => { setInputValue('产品功能有哪些'); }}
                      className="px-3 py-2 text-[12px] font-medium text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-lg transition-colors"
                    >
                      产品功能
                    </button>
                  </div>
                </div>
              ) : activeScenarioTab === 'data_dev' ? (
                /* PRD F.2.4 数据开发路径：主引导由 OnboardingTour 负责，这里只显示卡片 */
                  <div data-tour="data-dev-cards" className="min-w-full grid grid-cols-2 gap-3 relative">
                  <div data-tour="dev-audit" className="rounded-2xl border border-[#E5E5EA] bg-white p-4">
                    <h4 className="text-[12px] font-semibold text-[#1D1D1F]">审计日志</h4>
                    <p className="mt-1 text-[11px] text-[#86868B]">查询与变更记录，支持合规审计</p>
                  </div>
                  <button
                    type="button"
                    data-tour="dev-datasource"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLazyDevGuide('datasource');
                    }}
                    className="rounded-2xl border border-[#E5E5EA] bg-white p-4 text-left hover:border-[#007AFF]/30 transition-colors"
                  >
                    <h4 className="text-[12px] font-semibold text-[#1D1D1F]">数据源</h4>
                    <p className="mt-1 text-[11px] text-[#86868B]">接入与管理数据源配置</p>
                  </button>
                  <button
                    type="button"
                    data-tour="dev-modeling"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLazyDevGuide('modeling');
                    }}
                    className="rounded-2xl border border-[#E5E5EA] bg-white p-4 text-left hover:border-[#007AFF]/30 transition-colors"
                  >
                    <h4 className="text-[12px] font-semibold text-[#1D1D1F]">业务建模</h4>
                    <p className="mt-1 text-[11px] text-[#86868B]">维度、主题与模型定义</p>
                  </button>
                  <button
                    type="button"
                    data-tour="dev-indicators"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLazyDevGuide('indicators');
                    }}
                    className="rounded-2xl border border-[#E5E5EA] bg-white p-4 text-left hover:border-[#007AFF]/30 transition-colors"
                  >
                    <h4 className="text-[12px] font-semibold text-[#1D1D1F]">指标管理</h4>
                    <p className="mt-1 text-[11px] text-[#86868B]">指标定义、口径与计算逻辑</p>
                  </button>
                </div>
              ) : activeScenarioTab === 'digital_employees' ? (
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
                        <p className="mt-2 text-[11px] text-[#86868B] leading-relaxed line-clamp-1 overflow-hidden text-ellipsis">
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
                      <div className="text-[11px] text-[#86868B] mt-1.5 leading-relaxed line-clamp-1 overflow-hidden text-ellipsis">
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

      {/* 新建术语弹窗（PRD 一线步骤2） */}
      <AnimatePresence>
        {showNewTermModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[62] flex items-center justify-center p-4"
            onClick={() => setShowNewTermModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white border border-[#E5E5EA] shadow-xl p-6"
            >
              <h3 className="text-[17px] font-semibold text-[#1D1D1F]">新建术语</h3>
              <p className="mt-1 text-[13px] text-[#86868B]">添加业务黑话或指标定义，便于团队统一理解</p>
              <input
                type="text"
                placeholder="术语名称（如 GMV、DAU）"
                className="mt-4 w-full px-3 py-2.5 rounded-xl border border-[#E5E5EA] text-[13px] placeholder:text-[#86868B]"
              />
              <textarea
                placeholder="口径说明（选填）"
                rows={3}
                className="mt-3 w-full px-3 py-2.5 rounded-xl border border-[#E5E5EA] text-[13px] placeholder:text-[#86868B] resize-none"
              />
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewTermModal(false)}
                  className="px-4 py-2.5 text-[13px] text-[#86868B] hover:bg-[#F5F5F7] rounded-xl"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTermModal(false)}
                  className="px-4 py-2.5 text-[13px] font-medium text-white bg-[#007AFF] rounded-xl"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 帮助文档面板（真实文档，非智能引导） */}
      <AnimatePresence>
        {showHelpDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelpDoc(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full flex justify-center"
            >
              <HelpDocPanel onClose={() => setShowHelpDoc(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 增强引导面板（智能引导：指标/示例问题/路线图） */}
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

      {/* PRD F.1.1：全屏欢迎蒙版 — 白底 + 卡片化内容 */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[61] flex items-center justify-center bg-white"
          >
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 text-center px-10 sm:px-14 py-14 sm:py-20 max-w-[560px] w-[90vw] rounded-3xl bg-white border border-[#E5E5EA] shadow-[0_24px_48px_rgba(0,0,0,0.08)]"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md mb-8 bg-[#007AFF]">
                亿问
              </div>
              <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#1D1D1F] tracking-tight leading-tight">
                欢迎来到
                <span className="block mt-1 text-[#007AFF]">
                  亿问 Data Agent
                </span>
              </h1>
              <p className="mt-4 text-[15px] text-[#5C5C5E] font-medium">
                您的企业级数据大脑
              </p>
              <p className="mt-1.5 text-[13px] text-[#86868B]">
                用自然语言获取指标、趋势与归因结论
              </p>
              <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowWelcome(false);
                    setShowRolePicker(true);
                  }}
                  className="px-8 py-3.5 text-[15px] font-semibold text-white rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98] bg-[#007AFF] hover:bg-[#0051D5]"
                >
                  开始探索
                </button>
                <button
                  type="button"
                  onClick={() => setShowWhatIsThis(true)}
                  className="px-8 py-3.5 text-[15px] font-medium text-[#007AFF] rounded-xl transition-all duration-200 border-2 border-[#007AFF] hover:bg-[#F0F7FF] active:scale-[0.98] bg-white"
                >
                  这是什么？
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 「这是什么？」— 仅展示介绍文案，不进入角色选择 */}
      <AnimatePresence>
        {showWelcome && showWhatIsThis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[62] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowWhatIsThis(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5E5EA] p-6 sm:p-8 text-left"
            >
              <h3 className="text-lg font-semibold text-[#1D1D1F]">亿问 Data Agent 是什么？</h3>
              <p className="mt-4 text-[15px] text-[#3A3A3C] leading-relaxed">
                企业级数据智能助手，用自然语言查指标、看趋势、做归因分析。通过角色与分步引导，降低门槛，30 秒上手。
              </p>
              <p className="mt-3 text-[14px] text-[#86868B] leading-relaxed">
                不用记指标、不用写 SQL，用业务语言提问即可获得图表与结论；支持截图上报、知识库检索与转人工支持。
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWhatIsThis(false)}
                  className="px-5 py-2.5 text-[14px] font-medium text-[#5C5C5E] hover:bg-[#F5F5F7] rounded-xl transition-colors"
                >
                  知道了
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowWhatIsThis(false);
                    setShowWelcome(false);
                    setShowRolePicker(true);
                  }}
                  className="px-5 py-2.5 text-[14px] font-medium text-white bg-[#007AFF] hover:bg-[#0051D5] rounded-xl transition-colors"
                >
                  开始探索
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 进入首页选角色（PRD F.1.2：四张主卡片 + 更多角色折叠；关闭未选则二次确认） */}
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
                onClick={() => {
                  if (!userRole) {
                    setShowRoleCloseConfirm(true);
                  } else {
                    setShowRolePicker(false);
                  }
                }}
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
                  我们会基于角色为你推荐合适的数字员工（默认一线业务）
                </p>
              </div>

              {/* 四张主卡片（2x2） */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLE_OPTIONS.filter((r) => MAIN_ROLE_IDS.includes(r.id as typeof MAIN_ROLE_IDS[number])).map((role) => {
                  const recommended = pickRecommendedAgent(role);
                  const isSelected = rolePickerSelectedId === role.id;
                  const isDefault = role.id === 'ops';
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setRolePickerSelectedId(role.id);
                        setUserRole(role);
                        setSelectedAgentId(recommended.id);
                        resetOnboardingTour();
                        setShowRolePicker(false);
                      }}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-[#007AFF] bg-[#F0F7FF] ring-2 ring-[#007AFF]/20'
                          : 'border-[#E5E5EA] bg-white hover:border-[#007AFF]/30 hover:bg-[#F9F9FB]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold text-[#1D1D1F]">{role.label}</span>
                        {isDefault && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F4FF] text-[#007AFF]">推荐</span>
                        )}
                      </div>
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

              {/* 更多角色（折叠） */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowOtherRolesExpanded((v) => !v)}
                  className="text-[13px] text-[#007AFF] hover:underline flex items-center gap-1"
                >
                  {showOtherRolesExpanded ? '收起' : '更多角色'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showOtherRolesExpanded ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showOtherRolesExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {ROLE_OPTIONS.filter((r) => OTHER_ROLE_IDS.includes(r.id as typeof OTHER_ROLE_IDS[number])).map((role) => {
                          const recommended = pickRecommendedAgent(role);
                          const isSelected = rolePickerSelectedId === role.id;
                          return (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => {
                                setRolePickerSelectedId(role.id);
                                setUserRole(role);
                                setSelectedAgentId(recommended.id);
                                resetOnboardingTour();
                                setShowRolePicker(false);
                              }}
                              className={`rounded-2xl border p-3 text-left transition-all ${
                                isSelected
                                  ? 'border-[#007AFF] bg-[#F0F7FF] ring-2 ring-[#007AFF]/20'
                                  : 'border-[#E5E5EA] bg-white hover:border-[#007AFF]/30 hover:bg-[#F9F9FB]'
                              }`}
                            >
                              <div className="text-[14px] font-semibold text-[#1D1D1F]">{role.label}</div>
                              <div className="mt-0.5 text-[11px] text-[#86868B]">{role.description}</div>
                              <div className="mt-2 text-[11px] text-[#86868B] truncate">
                                推荐：{recommended.name}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 关闭角色选择未选时二次确认 */}
      <AnimatePresence>
        {showRoleCloseConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[62] flex items-center justify-center p-4 bg-black/40"
            onClick={() => setShowRoleCloseConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white border border-[#E5E5EA] shadow-xl p-6"
            >
              <p className="text-[15px] font-medium text-[#1D1D1F]">
                将按「一线业务」身份进入，确定？
              </p>
              <p className="mt-1 text-[13px] text-[#86868B]">
                之后可在侧栏底部随时切换角色
              </p>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRoleCloseConfirm(false)}
                  className="px-4 py-2.5 text-[13px] font-medium text-[#86868B] hover:bg-[#F5F5F7] rounded-xl"
                >
                  继续选择
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const defaultRole = ROLE_OPTIONS.find((r) => r.id === 'ops');
                    if (defaultRole) {
                      setUserRole(defaultRole);
                      setSelectedAgentId(pickRecommendedAgent(defaultRole).id);
                      resetOnboardingTour();
                    }
                    setShowRoleCloseConfirm(false);
                    setShowRolePicker(false);
                  }}
                  className="px-4 py-2.5 text-[13px] font-medium text-white bg-[#007AFF] rounded-xl"
                >
                  确定进入
                </button>
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
          userRoleId={userRole?.id}
          onMorphComplete={() => {
            // 蒙层刚收缩到右下角时：悬浮球缩放回归 + 聚光灯从中心移动到小球后消失
            setAssistantReturnAnimationKey((k) => k + 1);
            setShowSpotlightJourney(true);
          }}
          onComplete={() => {
            setShowSpotlightTour(false);
            // CXO 结束后不自动弹出小助手，让用户直接点击发送；其他角色引导结束后可自动展开一次小助手
            if (userRole?.id !== 'exec') {
              setShowHelperPanel(true);
              setTimeout(() => setShowHelperPanel(false), 4000);
            }
          }}
          onGuideBubbleClick={() => setShowHelperPanel(true)}
          onStepEnter={(stepId) => {
            // CXO 步骤 1：只自动填入「上周销售额是多少？」，等用户点击发送后再跳转，不自动跳转
            if (userRole?.id === 'exec' && stepId === 'input-area' && !execDemoTriggeredRef.current) {
              execDemoTriggeredRef.current = true;
              execTourFirstSubmitRef.current = true;
              setDemoTypingPhrase('上周销售额是多少？');
            }
            // 步骤 2「联网搜索」：自动选中联网搜索并打开下拉；若首问尚未发送则仅填入文案，由用户点击发送
            if ((userRole?.id === 'exec' || userRole?.id === 'business') && stepId === 'deep-mode') {
              setEnableWebSearch(true);
              setShowExploreView(false);
              document.getElementById('yiwen-agent-row')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setTimeout(() => setShowWebSearchDropdown(true), 700);
              if (userRole?.id === 'exec' && !execDemoTriggeredRef.current) {
                execDemoTriggeredRef.current = true;
                execTourFirstSubmitRef.current = true;
                setTimeout(() => setDemoTypingPhrase('上周销售额是多少？'), 800);
              }
            }
            // 追问引导仅在进入数据分析界面后进行，不在欢迎页触发追问
            if (userRole?.id === 'ops' && stepId === 'knowledge-indicators') setActiveScenarioTab('indicators');
            if (userRole?.id === 'business' && stepId === 'dashboard-tab') setActiveScenarioTab('dashboard');
            if (userRole?.id === 'developer' && stepId === 'dev-audit') setActiveScenarioTab('data_dev');
          }}
        />
      )}

      {/* PRD F.2.4 Lazy 引导：数据开发同学交互加强，全屏蒙层与主引导一致 */}
      {lazyDevGuide && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"
          onClick={() => setLazyDevGuide(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lazy-guide-title"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-[#E5E5EA] p-6 max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id="lazy-guide-title" className="text-[17px] font-semibold text-[#1D1D1F]">
              {lazyDevGuide === 'datasource' && '数据源配置引导'}
              {lazyDevGuide === 'modeling' && '业务建模引导'}
              {lazyDevGuide === 'indicators' && '指标管理引导'}
            </h4>
            <div className="mt-3 text-[14px] text-[#3A3A3C] leading-relaxed space-y-3">
              {lazyDevGuide === 'datasource' && (
                <>
                  <p><strong>第一步：建立数据库连接</strong></p>
                  <p>接入 Doris / MySQL 等数据源，支持 SSH 隧道安全连接。进入页面后会自动启动引导。</p>
                  <ul className="list-disc list-inside text-[13px] space-y-1 ml-2">
                    <li>点击「+ 新建连接」添加数据源</li>
                    <li>填写主机、端口、数据库名与凭证</li>
                    <li>可选开启 SSH 隧道用于内网连接</li>
                    <li>系统会自动测试连接状态</li>
                  </ul>
                  <p className="text-[13px] text-[#86868B]">连接成功后，Agent 才能基于真实数据回答查询。</p>
                </>
              )}
              {lazyDevGuide === 'modeling' && (
                <>
                  <p><strong>第二步：配置业务模型</strong></p>
                  <p>模型列表管理所有向 Agent 暴露的表结构。进入页面后会自动启动引导。</p>
                  <ul className="list-disc list-inside text-[13px] space-y-1 ml-2">
                    <li>点击模型卡片进入字段配置</li>
                    <li>为字段设置语义类型（金额、时间、维度等）</li>
                    <li>添加同义词让 AI 理解业务黑话</li>
                    <li>开启动态 SQL 允许 AI 自由组合查询</li>
                  </ul>
                  <p className="text-[13px] text-[#86868B]">语义配置决定 AI 能否正确理解业务术语。</p>
                </>
              )}
              {lazyDevGuide === 'indicators' && (
                <>
                  <p><strong>第三步：统一计算口径</strong></p>
                  <p>定义「毛利」「客单价」等业务指标的计算公式。进入页面后会自动启动引导。</p>
                  <ul className="list-disc list-inside text-[13px] space-y-1 ml-2">
                    <li>点击「+ 新建指标」添加指标定义</li>
                    <li>填写指标名称和计算公式</li>
                    <li>添加口径说明便于团队理解</li>
                    <li>指定数据源表确保数据准确</li>
                  </ul>
                  <p className="text-[13px] text-[#86868B]">统一口径后 AI 将按业务标准计算，避免「乱算」问题。</p>
                </>
              )}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (lazyDevGuide === 'datasource') localStorage.setItem('yiwen_dev_datasource_guide_shown', 'true');
                  if (lazyDevGuide === 'modeling') localStorage.setItem('yiwen_dev_modeling_guide_shown', 'true');
                  if (lazyDevGuide === 'indicators') localStorage.setItem('yiwen_dev_indicators_guide_shown', 'true');
                  setLazyDevGuide(null);
                }}
                className="flex-1 py-3 rounded-xl border border-[#E5E5EA] text-[#3A3A3C] text-[14px] font-medium hover:bg-[#F2F2F7] transition-colors"
              >
                知道了
              </button>
              <button
                type="button"
                onClick={() => {
                  if (lazyDevGuide === 'datasource') localStorage.setItem('yiwen_dev_datasource_guide_shown', 'true');
                  if (lazyDevGuide === 'modeling') localStorage.setItem('yiwen_dev_modeling_guide_shown', 'true');
                  if (lazyDevGuide === 'indicators') localStorage.setItem('yiwen_dev_indicators_guide_shown', 'true');
                  setLazyDevGuide(null);
                  onNavigateToConfig?.(lazyDevGuide);
                }}
                className="flex-1 py-3 rounded-xl bg-[#007AFF] text-white text-[14px] font-medium hover:bg-[#0051D5] transition-colors"
              >
                前往配置
              </button>
            </div>
          </div>
        </div>
      )}

      </motion.div>

      {/* 聚光灯旅程：从屏幕中心移动到右下角小助手，打在小球上后淡出，用户自然知道去点击 */}
      <SpotlightOverlay
        visible={showSpotlightJourney}
        spotlightX={spotlightX}
        spotlightY={spotlightY}
        spotlightRadius={spotlightRadius}
        spotlightOpacity={spotlightOpacity}
      />

      {/* 右下角浮动引导助手 - PRD 4.4 页面感知 + 帮助中心兜底 */}
      <FloatingGuideAssistant
        key={`guide-${selectedAgentId}`}
        agentName={selectedAgent.name}
        agentAvatar={selectedAgent.avatar}
        open={showHelperPanel}
        onOpenChange={setShowHelperPanel}
        onOpenHelpDoc={() => {
          setShowHelperPanel(false);
          setShowHelpDoc(true);
        }}
        onTriggerGuide={() => setShowSpotlightTour(true)}
        pageContext={showExploreView ? '探索数字员工' : '首页'}
        dimmed={false}
        returnAnimationKey={assistantReturnAnimationKey}
      />

    </div>
  );
};

