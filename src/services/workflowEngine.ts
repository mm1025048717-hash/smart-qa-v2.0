// ============================================
// 工作流引擎 - 执行业务场景工作流
// ============================================

import type {
  Workflow,
  WorkflowNode,
  WorkflowContext,
  SkillCallConfig,
  AgentTaskConfig,
  ConditionConfig,
  ParallelConfig,
} from '../types/workflow';
import { executeSkill } from './dataAgentSkills';
import { getAgentById } from './agents';

// 工作流执行器
export class WorkflowEngine {
  private workflow: Workflow;
  private context: WorkflowContext;
  private onNodeStart?: (node: WorkflowNode) => void;
  private onNodeComplete?: (node: WorkflowNode, result: unknown) => void;
  private onNodeError?: (node: WorkflowNode, error: Error) => void;
  private onWorkflowComplete?: (context: WorkflowContext) => void;

  constructor(workflow: Workflow) {
    this.workflow = workflow;
    this.context = this.initializeContext();
  }

  private initializeContext(): WorkflowContext {
    return {
      workflowId: this.workflow.id,
      executionId: `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      variables: {},
      currentNodeId: '',
      nodeResults: {},
      history: [],
      startTime: new Date(),
      status: 'ready',
    };
  }

  // 设置事件回调
  on(event: 'nodeStart' | 'nodeComplete' | 'nodeError' | 'workflowComplete', callback: (data: unknown) => void) {
    switch (event) {
      case 'nodeStart':
        this.onNodeStart = callback as (node: WorkflowNode) => void;
        break;
      case 'nodeComplete':
        this.onNodeComplete = callback as (node: WorkflowNode, result: unknown) => void;
        break;
      case 'nodeError':
        this.onNodeError = callback as (node: WorkflowNode, error: Error) => void;
        break;
      case 'workflowComplete':
        this.onWorkflowComplete = callback as (context: WorkflowContext) => void;
        break;
    }
    return this;
  }

  // 启动工作流
  async start(inputs?: Record<string, unknown>): Promise<WorkflowContext> {
    // 设置输入变量
    if (inputs) {
      this.context.variables = { ...this.context.variables, ...inputs };
    }

    this.context.status = 'running';

    // 找到开始节点
    const startNode = this.workflow.nodes.find(n => n.type === 'start');
    if (!startNode) {
      throw new Error('工作流缺少开始节点');
    }

    try {
      await this.executeNode(startNode);
      this.context.status = 'completed';
    } catch (error) {
      this.context.status = 'failed';
      this.context.error = error instanceof Error ? error.message : String(error);
    }

    this.onWorkflowComplete?.(this.context);
    return this.context;
  }

  // 执行单个节点
  private async executeNode(node: WorkflowNode): Promise<unknown> {
    const startTime = Date.now();
    this.context.currentNodeId = node.id;
    node.status = 'running';
    node.startTime = new Date();

    this.onNodeStart?.(node);

    try {
      let result: unknown;

      switch (node.type) {
        case 'start':
          result = this.context.variables;
          break;

        case 'end':
          result = this.context.nodeResults;
          break;

        case 'skill_call':
          result = await this.executeSkillNode(node);
          break;

        case 'agent_task':
          result = await this.executeAgentTaskNode(node);
          break;

        case 'condition':
          result = await this.executeConditionNode(node);
          break;

        case 'parallel':
          result = await this.executeParallelNode(node);
          break;

        default:
          result = null;
      }

      node.status = 'completed';
      node.result = result;
      node.endTime = new Date();

      // 记录历史
      this.context.nodeResults[node.id] = result;
      this.context.history.push({
        nodeId: node.id,
        nodeName: node.name,
        status: 'completed',
        output: result,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });

      this.onNodeComplete?.(node, result);

      // 执行下一个节点
      if (node.type !== 'end') {
        const nextNodes = this.getNextNodes(node.id);
        for (const nextNode of nextNodes) {
          await this.executeNode(nextNode);
        }
      }

      return result;
    } catch (error) {
      node.status = 'failed';
      node.error = error instanceof Error ? error.message : String(error);
      node.endTime = new Date();

      this.context.history.push({
        nodeId: node.id,
        nodeName: node.name,
        status: 'failed',
        error: node.error,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      });

      this.onNodeError?.(node, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // 执行技能调用节点
  private async executeSkillNode(node: WorkflowNode): Promise<unknown> {
    const config = node.config as SkillCallConfig;
    
    // 替换参数中的变量引用
    const resolvedParams = this.resolveVariables(config.params);
    
    const result = await executeSkill(config.skillId, resolvedParams);
    
    if (!result.success) {
      throw new Error(result.error || '技能执行失败');
    }
    
    return result.result;
  }

  // 执行 Agent 任务节点
  private async executeAgentTaskNode(node: WorkflowNode): Promise<unknown> {
    const config = node.config as AgentTaskConfig;
    const agent = getAgentById(config.agentId);
    
    // 模拟 Agent 执行任务
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      agentId: config.agentId,
      agentName: agent.name,
      task: config.task,
      response: `[${agent.name}] 已完成任务: ${config.task}`,
      timestamp: new Date(),
    };
  }

  // 执行条件分支节点
  private async executeConditionNode(node: WorkflowNode): Promise<unknown> {
    const config = node.config as ConditionConfig;
    
    // 简单的条件评估
    const conditionResult = this.evaluateCondition(config.expression);
    
    return { condition: config.expression, result: conditionResult };
  }

  // 执行并行节点
  private async executeParallelNode(node: WorkflowNode): Promise<unknown> {
    const config = node.config as ParallelConfig;
    
    const branchNodes = config.branches
      .map(id => this.workflow.nodes.find(n => n.id === id))
      .filter((n): n is WorkflowNode => n !== undefined);
    
    if (config.waitAll) {
      const results = await Promise.all(
        branchNodes.map(n => this.executeNode(n))
      );
      return { branches: config.branches, results };
    } else {
      const result = await Promise.race(
        branchNodes.map(n => this.executeNode(n))
      );
      return { branches: config.branches, firstResult: result };
    }
  }

  // 获取下一个节点
  private getNextNodes(nodeId: string): WorkflowNode[] {
    const edges = this.workflow.edges.filter(e => e.sourceNodeId === nodeId);
    return edges
      .map(e => this.workflow.nodes.find(n => n.id === e.targetNodeId))
      .filter((n): n is WorkflowNode => n !== undefined);
  }

  // 解析变量引用
  private resolveVariables(params: Record<string, unknown>): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const varPath = value.slice(2, -1);
        resolved[key] = this.getVariableValue(varPath);
      } else {
        resolved[key] = value;
      }
    }
    
    return resolved;
  }

  // 获取变量值
  private getVariableValue(path: string): unknown {
    const parts = path.split('.');
    let current: unknown = this.context.variables;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  // 评估条件表达式
  private evaluateCondition(expression: string): boolean {
    // 简化的条件评估，实际项目中应使用更安全的表达式引擎
    try {
      // 替换变量引用
      const resolvedExpr = expression.replace(/\$\{([^}]+)\}/g, (_, varPath) => {
        const value = this.getVariableValue(varPath);
        return JSON.stringify(value);
      });
      
      // eslint-disable-next-line no-new-func
      return new Function(`return ${resolvedExpr}`)();
    } catch {
      return false;
    }
  }

  // 获取当前上下文
  getContext(): WorkflowContext {
    return this.context;
  }

  // 暂停工作流
  pause(): void {
    this.context.status = 'paused';
  }

  // 恢复工作流
  resume(): void {
    if (this.context.status === 'paused') {
      this.context.status = 'running';
    }
  }
}

// 工作流构建器 - 辅助创建工作流
export class WorkflowBuilder {
  private workflow: Partial<Workflow>;
  private nodeCounter = 0;

  constructor(name: string, description: string) {
    this.workflow = {
      id: `wf_${Date.now()}`,
      name,
      description,
      version: '1.0.0',
      nodes: [],
      edges: [],
      variables: [],
      triggers: [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // 添加开始节点
  addStartNode(inputs?: Record<string, unknown>): string {
    const id = `node_start`;
    this.workflow.nodes!.push({
      id,
      type: 'start',
      name: '开始',
      position: { x: 100, y: 100 },
      config: { type: 'start', triggerType: 'manual', inputs },
      status: 'pending',
    });
    return id;
  }

  // 添加结束节点
  addEndNode(): string {
    const id = `node_end`;
    this.workflow.nodes!.push({
      id,
      type: 'end',
      name: '结束',
      position: { x: 100, y: 500 },
      config: { type: 'end' },
      status: 'pending',
    });
    return id;
  }

  // 添加技能调用节点
  addSkillNode(name: string, skillId: string, params: Record<string, unknown>): string {
    const id = `node_${++this.nodeCounter}`;
    this.workflow.nodes!.push({
      id,
      type: 'skill_call',
      name,
      position: { x: 100, y: 100 + this.nodeCounter * 100 },
      config: { type: 'skill_call', skillId, params } as unknown as SkillCallConfig,
      status: 'pending',
    });
    return id;
  }

  // 添加 Agent 任务节点
  addAgentTaskNode(name: string, agentId: string, task: string): string {
    const id = `node_${++this.nodeCounter}`;
    this.workflow.nodes!.push({
      id,
      type: 'agent_task',
      name,
      position: { x: 100, y: 100 + this.nodeCounter * 100 },
      config: { type: 'agent_task', agentId, task } as AgentTaskConfig,
      status: 'pending',
    });
    return id;
  }

  // 连接节点
  connect(sourceId: string, targetId: string, label?: string): this {
    this.workflow.edges!.push({
      id: `edge_${sourceId}_${targetId}`,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      label,
    });
    return this;
  }

  // 设置分类
  setCategory(category: Workflow['category']): this {
    this.workflow.category = category;
    return this;
  }

  // 构建工作流
  build(): Workflow {
    this.workflow.status = 'ready';
    this.workflow.updatedAt = new Date();
    return this.workflow as Workflow;
  }
}

export default {
  WorkflowEngine,
  WorkflowBuilder,
};











