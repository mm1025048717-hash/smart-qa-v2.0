import { motion } from 'framer-motion';
import { CheckCircle2, Clock, PlayCircle, Play, Pause, Square, Download, FileText } from 'lucide-react';
import clsx from 'clsx';

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  duration?: number; // 已执行时长（秒）
  progress?: number; // 进度百分比（0-100）
  logs?: string[]; // 日志信息
}

export interface WorkflowExecutionData {
  id: string;
  title: string;
  status: 'running' | 'paused' | 'completed' | 'stopped' | 'failed';
  progress: number; // 总体进度（0-100）
  elapsedTime: number; // 已运行时间（秒）
  estimatedTime: number; // 预计总时间（秒）
  steps: WorkflowStep[];
  onPause?: () => void;
  onStop?: () => void;
  onExport?: () => void;
  onViewLogs?: (stepId: string) => void;
}

interface WorkflowExecutionProps {
  data: WorkflowExecutionData;
  delay?: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}分${secs}秒`;
};

const getStatusText = (status: WorkflowExecutionData['status']): string => {
  switch (status) {
    case 'running':
      return '运行中';
    case 'paused':
      return '已暂停';
    case 'completed':
      return '已完成';
    case 'stopped':
      return '已停止';
    case 'failed':
      return '执行失败';
    default:
      return '未知状态';
  }
};

const getStatusColor = (status: WorkflowExecutionData['status']): string => {
  switch (status) {
    case 'running':
      return 'text-[#007AFF]';
    case 'paused':
      return 'text-[#FF9500]';
    case 'completed':
      return 'text-[#34C759]';
    case 'stopped':
    case 'failed':
      return 'text-[#FF3B30]';
    default:
      return 'text-[#86868b]';
  }
};

export const WorkflowExecution = ({ data, delay = 0 }: WorkflowExecutionProps) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      className="bg-white rounded-xl border border-[#E5E5EA] shadow-sm overflow-hidden"
    >
      {/* 头部 */}
      <div className="px-5 py-4 bg-[#F5F5F7] border-b border-[#E5E5EA]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#007AFF]/10 flex items-center justify-center">
              <PlayCircle className="w-4 h-4 text-[#007AFF]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">
              {data.title}
            </h3>
          </div>
          <div className={clsx('text-[13px] font-medium', getStatusColor(data.status))}>
            {getStatusText(data.status)} ({data.progress}%)
          </div>
        </div>
        <div className="text-[12px] text-[#86868b] mt-1">
          已运行：{formatTime(data.elapsedTime)} / 预计{formatTime(data.estimatedTime)}
        </div>
      </div>

      {/* 步骤列表 */}
      <div className="px-5 py-4">
        <div className="text-[13px] font-medium text-[#1d1d1f] mb-3">
          步骤执行状态
        </div>
        <div className="space-y-3">
          {data.steps.map((step, index) => {
            const isRunning = step.status === 'running';
            const isCompleted = step.status === 'completed';
            const isPending = step.status === 'pending';
            const isFailed = step.status === 'failed';

            return (
              <div key={step.id} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  {/* 状态图标 */}
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-[#34C759] flex-shrink-0" />
                  )}
                  {isRunning && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 flex-shrink-0"
                    >
                      <Clock className="w-4 h-4 text-[#007AFF]" />
                    </motion.div>
                  )}
                  {(isPending || isFailed) && (
                    <div className={clsx(
                      'w-4 h-4 rounded-full border-2 flex-shrink-0',
                      isFailed ? 'border-[#FF3B30]' : 'border-[#d2d2d7]'
                    )} />
                  )}

                  {/* 步骤名称和状态 */}
                  <div className="flex-1 flex items-center justify-between">
                    <span className={clsx(
                      'text-[13px]',
                      isCompleted ? 'text-[#1d1d1f]' : isRunning ? 'text-[#007AFF] font-medium' : 'text-[#86868b]'
                    )}>
                      {index + 1}. {step.name}
                    </span>
                    {step.duration !== undefined && (
                      <span className="text-[12px] text-[#86868b] ml-2">
                        {formatTime(step.duration)}
                      </span>
                    )}
                    {isRunning && (
                      <span className="text-[12px] text-[#007AFF] ml-2 font-medium">
                        运行中
                      </span>
                    )}
                    {isPending && (
                      <span className="text-[12px] text-[#86868b] ml-2">
                        等待
                      </span>
                    )}
                  </div>
                </div>

                {/* 进度条（仅运行中的步骤显示） */}
                {isRunning && step.progress !== undefined && (
                  <div className="ml-6 space-y-1">
                    <div className="h-1.5 bg-[#E5E5EA] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${step.progress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-[#007AFF] rounded-full"
                      />
                    </div>
                    {step.logs && step.logs.length > 0 && (
                      <button
                        onClick={() => data.onViewLogs?.(step.id)}
                        className="text-[12px] text-[#007AFF] hover:text-[#0051D5] transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>查看日志</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="px-5 py-4 bg-[#F5F5F7] border-t border-[#E5E5EA] flex items-center gap-2">
        {data.status === 'running' && (
          <button
            onClick={data.onPause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#1d1d1f] bg-white border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-colors"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>暂停</span>
          </button>
        )}
        {data.status === 'paused' && (
          <button
            onClick={data.onPause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#1d1d1f] bg-white border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>继续</span>
          </button>
        )}
        <button
          onClick={data.onStop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#FF3B30] bg-white border border-[#FF3B30] hover:bg-[#FFF5F5] transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
          <span>停止</span>
        </button>
        <button
          onClick={data.onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#1d1d1f] bg-white border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-colors ml-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>导出</span>
        </button>
      </div>
    </motion.div>
  );
};

