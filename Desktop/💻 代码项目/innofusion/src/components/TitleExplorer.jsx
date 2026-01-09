import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { getTitleMeta, toggleFavoriteTitle, rateTitle } from '../utils/storage';

export function TitleExplorer({ baseTitle = '', onClose, onPick }) {
  const [industry, setIndustry] = useState('all');
  const [channel, setChannel] = useState('all');
  const [tone, setTone] = useState('all');

  const industryOpts = ['all','消费品','汽车','科技','教育','文旅','金融'];
  const channelOpts = ['all','抖音','小红书','B站','知乎','微信生态'];
  const toneOpts = ['all','专业','轻松','反差','叙事','数据'];

  const variations = useMemo(() => {
    const seed = baseTitle || '创意主题';
    const list = [
      `${seed}｜从0到1的行业打法`,
      `${seed} 在${channel==='all'?'社媒':channel}的增长路径`,
      `${tone==='反差'? '反常识':'实战'}：${seed} 的三步落地`,
      `${seed} × ${industry==='all'?'新消费':industry}｜营销闭环`,
      `用${seed} 打开${channel==='all'?'多渠道':channel}投放新范式`,
      `${seed}｜30天验证与里程碑`,
      `${seed} 的五个关键素材`,
      `${seed}：从钩子到转化`,
      `${seed} 的人群映射`,
      `${seed}｜预算与KPI对齐`
    ];
    return Array.from(new Set(list)).slice(0, 12);
  }, [baseTitle, industry, channel, tone]);

  // Top N 折叠
  const [topN, setTopN] = useState(6);

  return (
    <AnimatePresence>
      <motion.div className="bg-white border border-bfl-border rounded-2xl shadow-lg w-[420px] p-4" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Filter className="w-4 h-4"/><div className="text-sm font-semibold">标题发散</div></div>
          <button className="p-1 rounded hover:bg-bfl-surface-2" onClick={onClose}><X className="w-4 h-4 text-bfl-text-dim"/></button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <select className="text-xs border border-bfl-border rounded px-2 py-1" value={industry} onChange={e=>setIndustry(e.target.value)}>
            {industryOpts.map(o=>(<option key={o} value={o}>{o==='all'?'全部行业':o}</option>))}
          </select>
          <select className="text-xs border border-bfl-border rounded px-2 py-1" value={channel} onChange={e=>setChannel(e.target.value)}>
            {channelOpts.map(o=>(<option key={o} value={o}>{o==='all'?'全部渠道':o}</option>))}
          </select>
          <select className="text-xs border border-bfl-border rounded px-2 py-1" value={tone} onChange={e=>setTone(e.target.value)}>
            {toneOpts.map(o=>(<option key={o} value={o}>{o==='all'?'全部风格':o}</option>))}
          </select>
        </div>
        <div className="space-y-2 max-h-[48vh] overflow-auto custom-scrollbar">
          {variations.slice(0, topN).map((t, i) => {
            const meta = getTitleMeta(t);
            return (
              <div key={i} className="flex items-center gap-2 p-2 border border-bfl-border rounded-lg bg-white">
                <div className="flex-1 text-sm text-bfl-text truncate" title={t}>{t}</div>
                <button className={`px-2 py-1 rounded border text-xs ${meta.favorite ? 'bg-yellow-100 border-yellow-300' : 'bg-white border-bfl-border'}`} onClick={()=>toggleFavoriteTitle(t)}>{meta.favorite?'★':'☆'}</button>
                <select value={meta.score} onChange={(e)=>rateTitle(t, e.target.value)} className="text-xs border border-bfl-border rounded px-1 py-0.5">
                  {[0,1,2,3,4,5].map(n=>(<option key={n} value={n}>{n}</option>))}
                </select>
                <button className="btn btn-primary btn-sm text-xs" onClick={()=>onPick && onPick(t)}>生成方案</button>
              </div>
            );
          })}
          {variations.length > topN && (
            <button className="w-full text-xs text-bfl-text-dim hover:text-bfl-text" onClick={()=>setTopN(n=>Math.min(variations.length, n+6))}>展开更多（{variations.length-topN}）</button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default TitleExplorer;


