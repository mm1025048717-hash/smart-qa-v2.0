// ============================================
// 工作流引擎核心类型定义
// ============================================

import type { AgentProfile } from './index';

// 工作流节点类型
export type WorkflowNodeType = 
  | 'start'           // 开始节点
  | 'end'             // 结束节点
  | 'agent_task'      // Agent 任务节点
  | 'skill_call'      // 技能调用节点
  | 'condition'       // 条件分支节点
  | 'parallel'        // 并行执行节点
  | 'loop'            // 循环节点
  | 'human_input'     // 人工输入节点
  | 'data_transform'  // 数据转换节点
  | 'wait'            // 等待节点
  | 'sub_workflow';   // 子工作流节点

// 工作流节点状态
export type NodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// 工作流整体状态
export type WorkflowStatus = 'draft' | 'ready' | 'running' | 'paused' | 'completed' | 'failed';

// 技能类型 - DataAgent 可调用的能力
export type SkillType = 
  // 数据获取类
  | 'data_query'          // SQL 查询
  | 'data_fetch'          // API 数据拉取
  | 'data_import'         // 文件导入
  | 'realtime_stream'     // 实时数据流
  // 数据处理类
  | 'data_clean'          // 数据清洗
  | 'data_transform'      // 数据转换
  | 'data_aggregate'      // 数据聚合
  | 'data_join'           // 数据关联
  // 分析类
  | 'metric_calculate'    // 指标计算
  | 'trend_analysis'      // 趋势分析
  | 'anomaly_detect'      // 异常检测
  | 'attribution'         // 归因分析
  | 'prediction'          // 预测分析
  | 'correlation'         // 相关性分析
  | 'segmentation'        // 分群分析
  // 输出类
  | 'chart_render'        // 图表渲染
  | 'report_generate'     // 报告生成
  | 'insight_extract'     // 洞察提取
  | 'narrative_write'     // 叙事生成
  | 'alert_send'          // 告警发送
  // 交互类
  | 'clarify_ask'         // 澄清追问
  | 'recommend_action'    // 推荐操作
  | 'collect_feedback';   // 收集反馈

// 技能定义
export interface Skill {
  id: SkillType;
  name: string;
  description: string;
  category: 'data_source' | 'data_process' | 'analysis' | 'output' | 'interaction';
  inputSchema: Record<string, SkillParamDef>;
  outputSchema: Record<string, SkillParamDef>;
  requiredPermissions?: string[];
  estimatedDuration?: number; // 预估执行时间(秒)
}

export interface SkillParamDef {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any';
  description: string;
  required?: boolean;
  default?: unknown;
  enum?: string[];
}

// 工作流节点定义
export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  name: string;
  description?: string;
  position: { x: number; y: number }; // 可视化位置
  config: NodeConfig;
  status: NodeStatus;
  result?: unknown;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

// 节点配置（根据类型不同有不同配置）
export type NodeConfig = 
  | StartNodeConfig
  | EndNodeConfig
  | AgentTaskConfig
  | SkillCallConfig
  | ConditionConfig
  | ParallelConfig
  | LoopConfig
  | HumanInputConfig
  | DataTransformConfig
  | SubWorkflowConfig;

export interface StartNodeConfig {
  type: 'start';
  triggerType: 'manual' | 'schedule' | 'event' | 'api';
  inputs?: Record<string, unknown>;
}

export interface EndNodeConfig {
  type: 'end';
  outputMapping?: Record<string, string>;
}

export interface AgentTaskConfig {
  type: 'agent_task';
  agentId: string;
  task: string;
  context?: Record<string, unknown>;
  maxRetries?: number;
  timeout?: number;
}

export interface SkillCallConfig {
  type: 'skill_call';
  skillId: SkillType;
  params: Record<string, unknown>;
  retryOnFail?: boolean;
}

export interface ConditionConfig {
  type: 'condition';
  expression: string; // 条件表达式
  trueNodeId: string;
  falseNodeId: string;
}

export interface ParallelConfig {
  type: 'parallel';
  branches: string[]; // 并行分支的节点ID
  waitAll: boolean; // 是否等待所有分支完成
}

export interface LoopConfig {
  type: 'loop';
  collection: string; // 遍历的集合变量名
  itemVariable: string; // 循环变量名
  bodyNodeId: string; // 循环体节点
  maxIterations?: number;
}

export interface HumanInputConfig {
  type: 'human_input';
  prompt: string;
  inputType: 'text' | 'choice' | 'confirm' | 'file';
  options?: string[];
  timeout?: number; // 超时时间(秒)
}

export interface DataTransformConfig {
  type: 'data_transform';
  transformType: 'map' | 'filter' | 'reduce' | 'sort' | 'group' | 'custom';
  expression: string;
  inputField: string;
  outputField: string;
}

export interface SubWorkflowConfig {
  type: 'sub_workflow';
  workflowId: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
}

// 工作流连接/边
export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  condition?: string; // 条件边的表达式
}

// 工作流定义
export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: BusinessScenarioCategory;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  triggers: WorkflowTrigger[];
  status: WorkflowStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

// 工作流变量
export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  scope: 'input' | 'output' | 'internal';
  defaultValue?: unknown;
  description?: string;
}

// 工作流触发器
export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'schedule' | 'event' | 'webhook';
  config: Record<string, unknown>;
  enabled: boolean;
}

// ============================================
// 业务场景类型定义
// ============================================

export type BusinessScenarioCategory = 
  | 'sales_analysis'      // 销售分析
  | 'user_analysis'       // 用户分析
  | 'product_analysis'    // 产品分析
  | 'operation_monitor'   // 运营监控
  | 'financial_report'    // 财务报表
  | 'market_insight'      // 市场洞察
  | 'anomaly_diagnosis'   // 异常诊断
  | 'forecast_planning'   // 预测规划
  | 'custom';             // 自定义

// 业务场景定义
export interface BusinessScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BusinessScenarioCategory;
  coverImage?: string;
  // 场景涉及的核心问题
  keyQuestions: string[];
  // 场景需要的 Agent 组合
  requiredAgents: {
    agentId: string;
    role: 'primary' | 'support' | 'reviewer';
    responsibilities: string[];
  }[];
  // 预置工作流
  workflow: Workflow;
  // 预期产出
  expectedOutputs: {
    type: 'chart' | 'table' | 'report' | 'insight' | 'action';
    name: string;
    description: string;
  }[];
  // 适用场景说明
  useCases: string[];
  // 标签
  tags: string[];
}

// ============================================
// 工作流执行上下文
// ============================================

export interface WorkflowContext {
  workflowId: string;
  executionId: string;
  variables: Record<string, unknown>;
  currentNodeId: string;
  nodeResults: Record<string, unknown>;
  history: ExecutionHistoryItem[];
  startTime: Date;
  status: WorkflowStatus;
  error?: string;
}

export interface ExecutionHistoryItem {
  nodeId: string;
  nodeName: string;
  status: NodeStatus;
  input?: unknown;
  output?: unknown;
  error?: string;
  duration: number;
  timestamp: Date;
}

// ============================================
// Agent 协作相关类型
// ============================================

// Agent 任务分配
export interface AgentTask {
  id: string;
  agentId: string;
  task: string;
  context: Record<string, unknown>;
  dependencies: string[]; // 依赖的其他任务ID
  status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed';
  result?: unknown;
  priority: number;
}

// Agent 协作会话
export interface CollaborationSession {
  id: string;
  scenarioId: string;
  participants: {
    agent: AgentProfile;
    role: 'coordinator' | 'executor' | 'reviewer';
    status: 'active' | 'idle' | 'completed';
  }[];
  tasks: AgentTask[];
  messages: CollaborationMessage[];
  status: 'active' | 'paused' | 'completed';
  startTime: Date;
  endTime?: Date;
}

// 协作消息
export interface CollaborationMessage {
  id: string;
  fromAgentId: string;
  toAgentId?: string; // 为空表示广播
  type: 'request' | 'response' | 'handoff' | 'notify' | 'question';
  content: string;
  data?: unknown;
  timestamp: Date;
}

// Agent 能力声明
export interface AgentCapability {
  agentId: string;
  skills: SkillType[];
  specialties: string[];
  maxConcurrentTasks: number;
  averageResponseTime: number;
}














