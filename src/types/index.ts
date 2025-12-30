// 意图类型定义
export type IntentLevel = 'L1' | 'L2' | 'L3';

export type IntentType = 
  | 'single_metric'      // 单指标查询
  | 'multi_metric'       // 多指标并列
  | 'trend_analysis'     // 时间趋势
  | 'yoy_mom'           // 同比环比
  | 'composition'       // 构成分析
  | 'dimension_compare' // 维度对比
  | 'ranking'           // 排名排序
  | 'anomaly'           // 异常检测
  | 'attribution'       // 原因分析
  | 'drill_down'        // 下钻探索
  | 'prediction'        // 预测请求
  | 'knowledge_query';  // 知识库查询

// KPI数据结构
export interface KPIData {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  prefix?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    label?: string;
  };
  subMetrics?: SubMetric[];
  isPrimary?: boolean;
  /** 是否隐藏归因按钮 - 用于直接问归因的场景，因为回复本身就是归因分析 */
  hideAttribution?: boolean;
}

export interface SubMetric {
  label: string;
  value: number | string;
  unit?: string;
}

// 图表数据结构
export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'funnel' | 'map';
  title?: string;
  data: Record<string, unknown>[];
  xKey?: string;
  yKey?: string | string[];
  colors?: string[];
  showLegend?: boolean;
  annotations?: ChartAnnotation[];
}

export interface ChartAnnotation {
  type: 'point' | 'line' | 'area';
  position: unknown;
  label?: string;
  style?: 'normal' | 'warning' | 'danger';
}

// 消息组件类型
export type ComponentType = 
  | 'text'
  | 'heading'
  | 'kpi'
  | 'kpi-group'
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'scatter-chart'
  | 'quadrant-chart'
  | 'map-chart'
  | 'funnel-chart'
  | 'box-plot'
  | 'chart'          // 智能图表（实时渲染）
  | 'table'          // 表格（实时渲染）
  | 'gantt'          // 甘特图（实时渲染）
  | 'action-buttons'
  | 'drill-area'
  | 'control-bar'
  | 'channel-data'   // 渠道数据卡片
  | 'suggestions'    // 建议列表
  // 故事叙事组件
  | 'report-title'   // 报告标题
  | 'quote-paragraph' // 带引号段落
  | 'structured-list' // 结构化列表
  | 'compare-card'   // 对比卡片
  | 'data-preview'   // 数据速览
  | 'quote-box'      // 引用框
  | 'insight-box'    // 洞察卡片
  | 'divider'        // 分隔线
  | 'action-bar'     // 操作栏
  | 'section'        // 段落小节
  | 'region-cards'   // 地区/国家对比卡片
  | 'metrics-preview' // 多指标速览
  | 'analyst-quote' // 分析师引言
  | 'visualizer'   // 数据可视化筛选条件
  | 'thought-chain' // 思维链（数字员工思考过程）
  | 'report-hero'   // 报告头部卡片
  | 'report-layer'  // 报告层级卡片
  | 'query-confirmation' // 多度确认交互
  | 'ambiguous-selection' // 模糊选择确认（指标或员工）
  | 'callout-card'  // Tip提示卡片
  | 'strategy-card' // Action List卡片（策略卡片）
  | 'workflow-execution' // 工作流执行状态
  // 规则显示组件
  | 'empty-state'   // 空状态卡片
  | 'info-banner'   // 信息提示条
  | 'rule-explanation' // 规则说明卡片
  | 'recommendation-filter' // 推荐去重展示
  | 'year-comparison' // 年度对比图表
  | 'navigation-bar' // 导航栏
  | 'navigation-button' // 导航按钮
  | 'command-card' // 指令卡片
  | 'rich-text' // 富文本
  | 'qna' // 问答卡片
  | 'iframe' // iframe 嵌入
  | 'web' // 网页卡片
  | 'empty'; // 空白卡片

// 组件样式配置
export interface BlockStyle {
  // 颜色
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  accentColor?: string;
  // 排版
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: string;
  margin?: string;
  // 边框和圆角
  borderRadius?: string;
  borderWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  // 阴影
  boxShadow?: string;
  // 布局
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
}

// 消息内容块
export interface ContentBlock {
  id: string;
  type: ComponentType;
  data: unknown;
  rendered?: boolean;
  style?: BlockStyle; // 个性化样式
}

// 消息结构
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
  timestamp: Date;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  intent?: IntentType;
  // 可选：当前消息由哪个数字员工产生
  agentId?: string;
}

// 追问按钮
export interface ActionButton {
  id: string;
  label: string;
  query: string;
  icon?: string;
}

// 意图识别结果
export interface IntentResult {
  type: IntentType;
  level: IntentLevel;
  confidence: number;
  entities: {
    metrics?: string[];
    dimensions?: string[];
    timeRange?: string;
    filters?: Record<string, unknown>;
  };
  suggestedComponents: ComponentType[];
  followUpQuestions: ActionButton[];
}

// 分析场景配置
export interface AnalysisScenario {
  id: string;
  name: string;
  description: string;
  triggerKeywords: string[];
  componentSequence: ComponentType[];
  narrativeTemplate: string;
}

// 数字员工（Agent）配置
export interface AgentProfile {
  id: string;
  name: string;
  title: string;          // 例如：理科生 · SQL 专家
  tag?: string;           // 例如：核心 / 推荐
  badge?: string;         // 小徽章标签
  avatar?: string;        // 可选头像
  description?: string;   // 简短角色介绍
  suggestedQuestions?: {  // 专属快捷提问
    icon?: string;        // emoji 图标
    label: string;        // 按钮文字
    query: string;        // 实际查询
  }[];
  advantages?: {          // 优势说明（用于产品展示）
    speed?: string;       // 速度优势
    accuracy?: string;    // 准确度优势
    description?: string; // 优势描述
  };
  techInfo?: {            // 技术说明（用于hover展示）
    title?: string;
    company?: string;
    coreTech?: string;
    alisaNLU?: string;
    semanticDB?: string;
    aiForBI?: string;
    value?: string;
  };
}

// ============================================
// Agent 切换意图识别相关类型
// ============================================

// Agent 切换意图识别结果
export interface AgentSwitchIntent {
  shouldSwitch: boolean;           // 是否应该切换
  targetAgentId: string | null;    // 目标 Agent ID
  targetAgent: AgentProfile | null; // 目标 Agent 完整信息
  confidence: number;              // 置信度 0-1
  matchType: AgentSwitchMatchType | null;  // 匹配类型
  matchedKeywords: string[];       // 匹配到的关键词
  reason: string;                  // 识别理由
  alternatives?: AgentProfile[];   // 备选 Agent
}

// Agent 切换匹配类型
export type AgentSwitchMatchType = 
  | 'name'         // 名字匹配（最精确）
  | 'capability'   // 能力匹配（根据需求能力）
  | 'scenario'     // 场景匹配（根据业务场景）
  | 'personality'; // 性格匹配（根据风格偏好）

// Agent 特征定义
export interface AgentFeatures {
  id: string;
  nameVariants: string[];    // 名字的各种形式
  capabilities: string[];    // 能力关键词
  scenarios: string[];       // 擅长场景
  personality: string[];     // 性格风格
  domains: string[];         // 专业领域
}


