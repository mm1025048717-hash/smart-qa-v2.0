import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, CircleDashed, XCircle, FileText, Rocket, Share2 } from 'lucide-react';

/**
 * Agent 执行面板（MVP）
 * 作用：在右侧以面板展示 Agent 执行动作链路与进度，提供导出/复制操作
 */
export function AgentPanel({ open, onClose, fusion, onExportMarkdown, scoreRoute }) {
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState([
    { id: 'plan', title: '生成路线卡', status: 'pending' },
    { id: 'score', title: '评分雷达', status: 'pending' },
    { id: 'export', title: '生成导出文稿', status: 'pending' },
    { id: 'share', title: '准备外链（占位）', status: 'pending' },
  ]);

  const markdown = useMemo(() => {
    const lines = [];
    if (!fusion) return '';
    lines.push(`# ${fusion.title}`);
    lines.push('');
    lines.push('## 四象限建议');
    lines.push(fusion.notes || '');
    lines.push('');
    lines.push('---');
    lines.push('由 Bubble Fusion Lab 生成');
    return lines.join('\n');
  }, [fusion]);

  const setStatus = (id, status) => {
    setSteps(prev => prev.map(s => (s.id === id ? { ...s, status } : s)));
  };

  const run = async () => {
    if (running) return;
    setRunning(true);
    try {
      setStatus('plan', 'running');
      await wait(500);
      setStatus('plan', 'done');

      setStatus('score', 'running');
      try {
        await scoreRoute?.(fusion);
        setStatus('score', 'done');
      } catch (e) {
        setStatus('score', 'error');
      }

      setStatus('export', 'running');
      await wait(400);
      setStatus('export', 'done');

      setStatus('share', 'running');
      await wait(300);
      setStatus('share', 'done');
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    if (open) {
      // 重置
      setSteps(s => s.map(x => ({ ...x, status: 'pending' })));
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute right-4 top-20 z-30 w-[420px] max-w-[92vw] bg-white border border-bfl-border rounded-xl shadow-lg"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-bfl-border">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-bfl-primary" />
              <h3 className="text-sm font-semibold text-bfl-text">Agent 执行</h3>
            </div>
            <button className="text-bfl-text-dim" onClick={onClose}>×</button>
          </div>

          <div className="p-4 space-y-3">
            <div className="text-sm text-bfl-text font-medium">{fusion?.title || '未选择'}</div>

            <ul className="space-y-2">
              {steps.map(step => (
                <li key={step.id} className="flex items-center gap-2 text-sm">
                  {step.status === 'pending' && <CircleDashed className="w-4 h-4 text-bfl-text-dim" />}
                  {step.status === 'running' && <Loader2 className="w-4 h-4 text-bfl-primary animate-spin" />}
                  {step.status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  {step.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                  <span className="text-bfl-text">{step.title}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={run}
                className="btn btn-primary text-sm flex items-center gap-2"
                disabled={running}
              >
                <Rocket className="w-4 h-4" />开始执行
              </button>
              <button
                onClick={() => onExportMarkdown?.(markdown)}
                className="btn btn-secondary text-sm flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />复制 Markdown
              </button>
              <button className="btn btn-secondary text-sm flex items-center gap-2" onClick={onClose}>
                <Share2 className="w-4 h-4" />完成
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }


