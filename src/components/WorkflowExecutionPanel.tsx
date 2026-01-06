// ============================================
// 工作流执行面板 - 展示工作流执行过程
// ============================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import type { BusinessScenario } from '../types/workflow';
import { getAgentById } from '../services/agents/index';

interface WorkflowExecutionPanelProps {
  scenario: BusinessScenario | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (results: Record<string, unknown>) => void;
}

type ExecutionPhase = 'preparing' | 'running' | 'completed' | 'failed';

interface ExecutionStep {
  id: string;
  name: string;
  agentId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: unknown;
  startTime?: Date;
  endTime?: Date;
}

export const WorkflowExecutionPanel = ({
  scenario,
  isOpen,
  onClose,
  onComplete,
}: WorkflowExecutionPanelProps) => {
  const [phase, setPhase] = useState<ExecutionPhase>('preparing');
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [messages, setMessages] = useState<Array<{ agentId: string; content: string; timestamp: Date }>>([]);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // 初始化执行步骤
  useEffect(() => {
    if (scenario && isOpen) {
      initializeExecution();
    }
  }, [scenario, isOpen]);

  // 计时器
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (phase === 'running') {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [phase]);

  const initializeExecution = () => {
    if (!scenario) return;

    setPhase('preparing');
    setProgress(0);
    setElapsedTime(0);
    setMessages([]);

    // 从工作流生成执行步骤
    const executionSteps: ExecutionStep[] = scenario.workflow.nodes
      .filter((n) => n.type !== 'start' && n.type !== 'end')
      .map((node) => ({
        id: node.id,
        name: node.name,
        agentId: node.type === 'agent_task' ? (node.config as any).agentId : undefined,
        status: 'pending' as const,
      }));

    setSteps(executionSteps);

    // 添加准备消息
    addMessage('system', `正在启动场景: ${scenario.name}`);

    // 自动开始执行
    setTimeout(() => {
      startExecution(executionSteps);
    }, 1000);
  };

  const addMessage = (agentId: string, content: string) => {
    setMessages((prev) => [
      ...prev,
      { agentId, content, timestamp: new Date() },
    ]);
  };

  const startExecution = async (executionSteps: ExecutionStep[]) => {
    setPhase('running');

    for (let i = 0; i < executionSteps.length; i++) {

      // 更新步骤状态为运行中
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: 'running', startTime: new Date() } : s
        )
      );

      const step = executionSteps[i];
      const agent = step.agentId ? getAgentById(step.agentId) : null;

      // 添加开始消息
      if (agent) {
        addMessage(agent.id, `开始执行: ${step.name}`);
      } else {
        addMessage('system', `执行步骤: ${step.name}`);
      }

      // 模拟执行时间
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      // 更新步骤状态为完成
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i
            ? {
                ...s,
                status: 'completed',
                endTime: new Date(),
                result: { success: true },
              }
            : s
        )
      );

      // 添加完成消息
      if (agent) {
        addMessage(agent.id, `完成: ${step.name}`);
      }

      // 更新进度
      setProgress(((i + 1) / executionSteps.length) * 100);
    }

    // 所有步骤完成
    setPhase('completed');
    addMessage('system', '场景执行完成');

    // 通知完成
    onComplete({
      scenario: scenario?.name,
      steps: executionSteps.length,
      elapsedTime,
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !scenario) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* 头部 - Apple 风格 */}
          <div className="px-6 py-5 border-b border-[#d2d2d7] flex items-center justify-between bg-[#fbfbfd]">
            <div>
              <h2 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">
                {scenario.name}
              </h2>
              <p className="text-sm text-[#86868b] mt-0.5">
                {phase === 'preparing' && '准备中...'}
                {phase === 'running' && `执行中 · ${formatTime(elapsedTime)}`}
                {phase === 'completed' && `已完成 · 用时 ${formatTime(elapsedTime)}`}
                {phase === 'failed' && '执行失败'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-[#86868b]" />
            </button>
          </div>

          {/* 进度条 */}
          <div className="h-1 bg-[#E8E8ED]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-[#007AFF]"
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* 左侧：执行步骤 */}
            <div className="w-1/2 border-r border-[#d2d2d7] flex flex-col">
              <div className="px-5 py-3 border-b border-[#E8E8ED] bg-[#F5F5F7]">
                <h3 className="text-sm font-medium text-[#86868b]">
                  执行步骤 ({steps.filter((s) => s.status === 'completed').length}/{steps.length})
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {steps.map((step, index) => {
                  const agent = step.agentId ? getAgentById(step.agentId) : null;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={clsx(
                        'p-4 rounded-xl border transition-all',
                        step.status === 'running' && 'border-[#007AFF] bg-[#007AFF]/5',
                        step.status === 'completed' && 'border-[#34C759] bg-[#34C759]/5',
                        step.status === 'failed' && 'border-[#FF3B30] bg-[#FF3B30]/5',
                        step.status === 'pending' && 'border-[#d2d2d7] bg-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* 状态图标 */}
                        <div
                          className={clsx(
                            'w-7 h-7 rounded-full flex items-center justify-center',
                            step.status === 'running' && 'bg-[#007AFF]',
                            step.status === 'completed' && 'bg-[#34C759]',
                            step.status === 'failed' && 'bg-[#FF3B30]',
                            step.status === 'pending' && 'bg-[#E8E8ED]'
                          )}
                        >
                          {step.status === 'running' && (
                            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                          )}
                          {step.status === 'completed' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          )}
                          {step.status === 'failed' && (
                            <XCircle className="w-3.5 h-3.5 text-white" />
                          )}
                          {step.status === 'pending' && (
                            <Clock className="w-3.5 h-3.5 text-[#86868b]" />
                          )}
                        </div>

                        {/* 步骤信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#1d1d1f] truncate">
                            {step.name}
                          </div>
                          {agent && (
                            <div className="text-xs text-[#86868b] mt-0.5">
                              {agent.name}
                            </div>
                          )}
                        </div>

                        {/* 耗时 */}
                        {step.startTime && step.endTime && (
                          <div className="text-xs text-[#86868b]">
                            {Math.round(
                              (step.endTime.getTime() - step.startTime.getTime()) / 1000
                            )}s
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* 右侧：消息日志 */}
            <div className="w-1/2 flex flex-col bg-[#F5F5F7]">
              <div className="px-5 py-3 border-b border-[#E8E8ED] bg-white">
                <h3 className="text-sm font-medium text-[#86868b]">
                  执行日志
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, index) => {
                  const agent = msg.agentId !== 'system' ? getAgentById(msg.agentId) : null;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      {/* 头像 */}
                      {agent ? (
                        <div className="w-6 h-6 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center text-[10px] font-semibold">
                          {agent.name[0]}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#007AFF] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}

                      {/* 消息内容 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-[#1d1d1f]">
                            {agent ? agent.name : '系统'}
                          </span>
                          <span className="text-[10px] text-[#86868b]">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm text-[#86868b]">{msg.content}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="px-6 py-4 border-t border-[#d2d2d7] flex items-center justify-between bg-white">
            <div className="flex items-center gap-4 text-sm text-[#86868b]">
              <span>{scenario.requiredAgents.length} 个员工参与</span>
              <span>{steps.length} 个步骤</span>
            </div>

            <div className="flex items-center gap-3">
              {phase === 'completed' && (
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-[#0066CC] transition-colors"
                >
                  查看结果
                </button>
              )}
              {phase === 'running' && (
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#F5F5F7] text-[#1d1d1f] rounded-xl font-medium hover:bg-[#E8E8ED] transition-colors"
                >
                  后台运行
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkflowExecutionPanel;

