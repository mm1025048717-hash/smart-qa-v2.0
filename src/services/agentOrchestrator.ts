// ============================================
// Agent 协作编排器 - 多 Agent 任务分配与协调
// ============================================

import type {
  AgentTask,
  CollaborationSession,
  CollaborationMessage,
  AgentCapability,
  BusinessScenario,
  SkillType,
} from '../types/workflow';
import { getAgentById } from './agents';

// Agent 能力注册表
const AGENT_CAPABILITIES: Record<string, AgentCapability> = {
  alisa: {
    agentId: 'alisa',
    skills: ['data_query', 'data_aggregate', 'data_transform', 'metric_calculate'],
    specialties: ['SQL查询', '数据提取', '指标计算'],
    maxConcurrentTasks: 3,
    averageResponseTime: 2,
  },
  nora: {
    agentId: 'nora',
    skills: ['narrative_write', 'insight_extract', 'clarify_ask', 'recommend_action'],
    specialties: ['自然语言生成', '洞察提取', '用户交互'],
    maxConcurrentTasks: 2,
    averageResponseTime: 4,
  },
  attributor: {
    agentId: 'attributor',
    skills: ['attribution', 'anomaly_detect', 'trend_analysis', 'insight_extract'],
    specialties: ['归因分析', '异常诊断', '根因分析'],
    maxConcurrentTasks: 2,
    averageResponseTime: 5,
  },
  'viz-master': {
    agentId: 'viz-master',
    skills: ['chart_render', 'data_transform', 'data_aggregate'],
    specialties: ['数据可视化', '图表设计'],
    maxConcurrentTasks: 2,
    averageResponseTime: 2,
  },
  'metrics-pro': {
    agentId: 'metrics-pro',
    skills: ['metric_calculate', 'data_query', 'trend_analysis'],
    specialties: ['指标体系', '指标计算'],
    maxConcurrentTasks: 3,
    averageResponseTime: 2,
  },
  predictor: {
    agentId: 'predictor',
    skills: ['prediction', 'trend_analysis', 'correlation'],
    specialties: ['预测分析', '趋势预测'],
    maxConcurrentTasks: 2,
    averageResponseTime: 6,
  },
  'quality-guard': {
    agentId: 'quality-guard',
    skills: ['anomaly_detect', 'data_clean', 'data_query'],
    specialties: ['数据质量', '异常检测'],
    maxConcurrentTasks: 2,
    averageResponseTime: 3,
  },
};

// 协作编排器
export class AgentOrchestrator {
  private session: CollaborationSession | null = null;
  private taskQueue: AgentTask[] = [];
  private activeTasks: Map<string, AgentTask> = new Map();

  // 创建协作会话
  createSession(scenario: BusinessScenario, _initialInputs?: Record<string, unknown>): CollaborationSession {
    // 映射 role 类型：'primary' -> 'coordinator', 'support' -> 'executor', 'reviewer' -> 'reviewer'
    const roleMap: Record<'primary' | 'support' | 'reviewer', 'coordinator' | 'executor' | 'reviewer'> = {
      primary: 'coordinator',
      support: 'executor',
      reviewer: 'reviewer',
    };

    const session: CollaborationSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      scenarioId: scenario.id,
      participants: scenario.requiredAgents.map(ra => ({
        agent: getAgentById(ra.agentId),
        role: roleMap[ra.role],
        status: 'idle' as const,
      })),
      tasks: [],
      messages: [],
      status: 'active',
      startTime: new Date(),
    };

    this.session = session;
    return session;
  }

  // 分配任务给合适的 Agent
  assignTask(
    taskDescription: string,
    requiredSkills: SkillType[],
    priority: number = 5,
    dependencies: string[] = []
  ): AgentTask {
    // 找到最适合的 Agent
    const bestAgent = this.findBestAgent(requiredSkills);
    
    if (!bestAgent) {
      throw new Error(`找不到具备所需技能的 Agent: ${requiredSkills.join(', ')}`);
    }

    const task: AgentTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      agentId: bestAgent.agentId,
      task: taskDescription,
      context: {},
      dependencies,
      status: 'pending',
      priority,
    };

    this.taskQueue.push(task);
    if (this.session) {
      this.session.tasks.push(task);
    }

    return task;
  }

  // 找到最适合的 Agent
  private findBestAgent(requiredSkills: SkillType[]): AgentCapability | null {
    let bestAgent: AgentCapability | null = null;
    let bestScore = 0;

    for (const capability of Object.values(AGENT_CAPABILITIES)) {
      // 检查是否有可用容量
      const activeCount = Array.from(this.activeTasks.values())
        .filter(t => t.agentId === capability.agentId && t.status === 'running').length;
      
      if (activeCount >= capability.maxConcurrentTasks) {
        continue;
      }

      // 计算匹配分数
      const skillMatch = requiredSkills.filter(skill => 
        capability.skills.includes(skill)
      ).length;
      
      const matchRatio = skillMatch / requiredSkills.length;
      const score = matchRatio * 100 - capability.averageResponseTime;

      if (score > bestScore) {
        bestScore = score;
        bestAgent = capability;
      }
    }

    return bestAgent;
  }

  // 执行任务队列
  async executeTasks(): Promise<void> {
    // 按优先级排序
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    for (const task of this.taskQueue) {
      // 检查依赖是否完成
      if (task.dependencies.length > 0) {
        const allDepsCompleted = task.dependencies.every(depId => {
          const depTask = this.session?.tasks.find(t => t.id === depId);
          return depTask?.status === 'completed';
        });

        if (!allDepsCompleted) {
          continue; // 跳过，等待依赖完成
        }
      }

      if (task.status === 'pending') {
        await this.executeTask(task);
      }
    }
  }

  // 执行单个任务
  private async executeTask(task: AgentTask): Promise<void> {
    task.status = 'assigned';
    this.activeTasks.set(task.id, task);

    // 更新 Agent 状态
    const participant = this.session?.participants.find(p => p.agent.id === task.agentId);
    if (participant) {
      participant.status = 'active';
    }

    // 发送任务开始消息
    this.sendMessage({
      fromAgentId: 'orchestrator',
      type: 'request',
      content: `分配任务给 ${getAgentById(task.agentId).name}: ${task.task}`,
      data: { taskId: task.id },
    });

    try {
      task.status = 'running';
      
      // 模拟任务执行
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // 生成任务结果
      task.result = {
        success: true,
        output: `[${getAgentById(task.agentId).name}] 已完成: ${task.task}`,
        timestamp: new Date(),
      };

      task.status = 'completed';

      // 发送任务完成消息
      this.sendMessage({
        fromAgentId: task.agentId,
        type: 'response',
        content: `任务完成: ${task.task}`,
        data: { taskId: task.id, result: task.result as unknown },
      });

      // 更新 Agent 状态
      if (participant) {
        const hasActiveTasks = this.session?.tasks.some(
          t => t.agentId === task.agentId && t.status === 'running'
        );
        if (!hasActiveTasks) {
          participant.status = 'idle';
        }
      }
    } catch (error) {
      task.status = 'failed';
      task.result = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };

      this.sendMessage({
        fromAgentId: task.agentId,
        type: 'notify',
        content: `任务失败: ${task.task} - ${(task.result as { error: string }).error}`,
        data: { taskId: task.id, error: (task.result as { error: string }).error },
      });
    } finally {
      this.activeTasks.delete(task.id);
    }
  }

  // Agent 之间传递消息
  sendMessage(message: Omit<CollaborationMessage, 'id' | 'timestamp'>): void {
    if (!this.session) return;

    const fullMessage: CollaborationMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date(),
    };

    this.session.messages.push(fullMessage);
  }

  // Agent 之间交接任务
  handoffTask(fromAgentId: string, toAgentId: string, taskId: string, context: Record<string, unknown>): void {
    const task = this.session?.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.sendMessage({
      fromAgentId,
      toAgentId,
      type: 'handoff',
      content: `将任务 "${task.task}" 交接给 ${getAgentById(toAgentId).name}`,
      data: { taskId, context },
    });

    task.agentId = toAgentId;
    task.context = { ...task.context, ...context };
  }

  // 获取会话状态
  getSession(): CollaborationSession | null {
    return this.session;
  }

  // 完成会话
  completeSession(): void {
    if (this.session) {
      this.session.status = 'completed';
      this.session.endTime = new Date();
    }
  }
}

// 智能任务分解器 - 将复杂业务问题分解为多个 Agent 任务
export class TaskDecomposer {
  // 根据业务场景和用户问题，分解为任务序列
  static decompose(
    scenario: BusinessScenario,
    _userQuestion: string
  ): { tasks: Array<{ description: string; skills: SkillType[]; priority: number }>; dependencies: string[][] } {
    const tasks: Array<{ description: string; skills: SkillType[]; priority: number; id: string }> = [];
    const dependencies: string[][] = [];

    // 根据场景类型智能分解
    switch (scenario.category) {
      case 'sales_analysis':
        tasks.push(
          { id: 't1', description: '查询销售数据', skills: ['data_query'], priority: 10 },
          { id: 't2', description: '计算销售指标', skills: ['metric_calculate'], priority: 9 },
          { id: 't3', description: '分析销售趋势', skills: ['trend_analysis'], priority: 8 },
          { id: 't4', description: '提取关键洞察', skills: ['insight_extract'], priority: 7 },
          { id: 't5', description: '生成分析报告', skills: ['narrative_write', 'chart_render'], priority: 6 }
        );
        dependencies.push(['t2'], ['t3'], ['t4'], ['t1', 't2', 't3', 't4']);
        break;

      case 'anomaly_diagnosis':
        tasks.push(
          { id: 't1', description: '查询相关数据', skills: ['data_query'], priority: 10 },
          { id: 't2', description: '检测数据异常', skills: ['anomaly_detect'], priority: 9 },
          { id: 't3', description: '分析异常原因', skills: ['attribution'], priority: 8 },
          { id: 't4', description: '生成诊断报告', skills: ['insight_extract', 'narrative_write'], priority: 7 }
        );
        dependencies.push(['t2'], ['t3'], ['t1', 't2', 't3']);
        break;

      case 'forecast_planning':
        tasks.push(
          { id: 't1', description: '获取历史数据', skills: ['data_query'], priority: 10 },
          { id: 't2', description: '分析历史趋势', skills: ['trend_analysis'], priority: 9 },
          { id: 't3', description: '执行预测分析', skills: ['prediction'], priority: 8 },
          { id: 't4', description: '生成预测报告', skills: ['narrative_write', 'chart_render'], priority: 7 }
        );
        dependencies.push(['t2'], ['t3'], ['t1', 't2', 't3']);
        break;

      default:
        // 通用分解
        tasks.push(
          { id: 't1', description: '获取数据', skills: ['data_query'], priority: 10 },
          { id: 't2', description: '分析数据', skills: ['metric_calculate', 'trend_analysis'], priority: 8 },
          { id: 't3', description: '生成结果', skills: ['insight_extract', 'narrative_write'], priority: 6 }
        );
        dependencies.push(['t2'], ['t1', 't2']);
    }

    return {
      tasks: tasks.map(({ id, ...rest }) => rest),
      dependencies,
    };
  }
}

export default {
  AgentOrchestrator,
  TaskDecomposer,
  AGENT_CAPABILITIES,
};


