import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ReportGenerator({ open, onClose }) {
  const [brand, setBrand] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [goal, setGoal] = useState('提升复购率10%');
  const [outputType, setOutputType] = useState('report'); // report | video | article

  const generate = () => {
    const base = `目标：${goal}\n我方：${brand}\n竞品：${competitors}`;
    if (outputType === 'video') {
      alert('已生成视频脚本：\n\n' + base + '\n\n结构：开场钩子-冲突-解决-行动号召');
    } else if (outputType === 'article') {
      alert('已生成图文方案：\n\n' + base + '\n\n包含：封面结构/关键配图建议/标题党版本');
    } else {
      alert('已生成分析报告（示例占位）：\n\n' + base + '\n\n模块：市场概览/竞品对比/机会切入/路线图');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute right-4 top-20 z-30 bg-white border border-bfl-border rounded-xl shadow-lg p-4 w-[380px] pointer-events-auto"
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-bfl-text">报告生成</h3>
            <button className="text-bfl-text-dim" onClick={onClose}>×</button>
          </div>
          <div className="space-y-2">
            <input className="w-full border border-bfl-border rounded-lg px-3 py-2 text-sm" placeholder="我方产品/品牌"
              value={brand} onChange={e => setBrand(e.target.value)} />
            <input className="w-full border border-bfl-border rounded-lg px-3 py-2 text-sm" placeholder="竞品（用逗号分隔）"
              value={competitors} onChange={e => setCompetitors(e.target.value)} />
            <input className="w-full border border-bfl-border rounded-lg px-3 py-2 text-sm" placeholder="目标（如 拉新/复购/品牌知名度）"
              value={goal} onChange={e => setGoal(e.target.value)} />
            <div className="flex items-center gap-2 text-sm">
              <label className="flex items-center gap-1"><input type="radio" checked={outputType==='report'} onChange={()=>setOutputType('report')} /> 分析报告</label>
              <label className="flex items-center gap-1"><input type="radio" checked={outputType==='article'} onChange={()=>setOutputType('article')} /> 图文方案</label>
              <label className="flex items-center gap-1"><input type="radio" checked={outputType==='video'} onChange={()=>setOutputType('video')} /> 视频脚本</label>
            </div>
            <button className="btn btn-primary w-full text-sm" onClick={generate}>生成</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


