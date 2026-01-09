import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, FileText, Image as ImageIcon, Video, Clipboard, Download, Play, Square } from 'lucide-react';
import { buildMediaCaptions } from '../utils/suggestions';
import { exportToPptx } from '../utils/export';

function useAgentPipeline({ fusion }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [logs, setLogs] = useState([]);
  const [artifacts, setArtifacts] = useState({});
  const timerRef = useRef(null);

  const structured = fusion?.structured || null;

  const docFallback = useMemo(() => {
    const notes = String(fusion?.notes || '');
    const sliceLines = (text, n) => text.split('\n').filter(Boolean).slice(0, n);
    return {
      oneSentence: sliceLines(notes, 1)[0] || fusion?.title || '',
      bigIdea: sliceLines(notes, 2)[1] || '',
      titlesTop5: [],
      hooksTop5: [],
      pipeline: [],
      assets: [],
      sellingPoints: [],
      contrarianPoints: [],
      talkTracks: [],
      mvp: ''
    };
  }, [fusion]);

  const merged = useMemo(() => ({
    title: fusion?.title || '',
    oneSentence: structured?.oneSentence || docFallback.oneSentence,
    bigIdea: structured?.bigIdea || docFallback.bigIdea,
    titlesTop5: structured?.titlesTop5 || docFallback.titlesTop5,
    hooksTop5: structured?.hooksTop5 || docFallback.hooksTop5,
    pipeline: structured?.pipeline || docFallback.pipeline,
    assets: structured?.assets || docFallback.assets,
    sellingPoints: structured?.sellingPoints || docFallback.sellingPoints,
    contrarianPoints: structured?.contrarianPoints || docFallback.contrarianPoints,
    talkTracks: structured?.talkTracks || docFallback.talkTracks,
    mvp: structured?.mvp || docFallback.mvp,
    milestones: structured?.milestones || [],
    kpis: structured?.kpis || [],
    notes: String(fusion?.notes || '').split('\n').filter(Boolean)
  }), [fusion, structured, docFallback]);

  // 构建 Markdown/JSON/任务看板
  const buildMarkdown = () => {
    const lines = [];
    lines.push(`# ${merged.title}`);
    if (merged.oneSentence) lines.push(`\n## 一句话主张\n${merged.oneSentence}`);
    if (merged.bigIdea) lines.push(`\n## Big Idea\n${merged.bigIdea}`);
    if (merged.titlesTop5?.length) { lines.push(`\n## 标题 Top 5`); merged.titlesTop5.forEach((t,i)=>lines.push(`${i+1}. ${t}`)); }
    if (merged.hooksTop5?.length) { lines.push(`\n## 开场钩子 Top 5`); merged.hooksTop5.forEach((t,i)=>lines.push(`${i+1}. ${t}`)); }
    if (merged.pipeline?.length) lines.push(`\n## 传播链路\n- ${merged.pipeline.join('\n- ')}`);
    if (merged.sellingPoints?.length || merged.contrarianPoints?.length || merged.talkTracks?.length) {
      lines.push(`\n## 核心卖点与差异`);
      merged.sellingPoints?.forEach(s=>lines.push(`- 卖点：${s}`));
      merged.contrarianPoints?.forEach(s=>lines.push(`- 反共识：${s}`));
      merged.talkTracks?.forEach(s=>lines.push(`- 话术：${s}`));
    }
    if (merged.assets?.length) lines.push(`\n## 素材清单\n- ${merged.assets.join('\n- ')}`);
    if (merged.milestones?.length) { lines.push(`\n## 里程碑`); merged.milestones.forEach(m=>lines.push(`- ${m.name}：${m.desc}`)); }
    else if (merged.mvp) lines.push(`\n## MVP\n${merged.mvp}`);
    if (merged.kpis?.length) { lines.push(`\n## KPI`); merged.kpis.forEach(k=>lines.push(`- ${k.name}：${k.target}`)); }
    return lines.join('\n');
  };

  const buildTaskBoard = () => {
    const out = [`# ${merged.title}｜任务看板`];
    if (merged.pipeline?.length) { out.push(`\n## 传播链路`, ...merged.pipeline.map(p=>`- [ ] ${p}`)); }
    if (merged.assets?.length) { out.push(`\n## 素材清单`, ...merged.assets.map(a=>`- [ ] ${a}`)); }
    if (merged.kpis?.length) { out.push(`\n## KPI`, ...merged.kpis.map(k=>`- [ ] ${k.name}：${k.target}`)); }
    return out.join('\n');
  };

  const buildMedia = () => buildMediaCaptions({
    title: merged.title,
    oneSentence: merged.oneSentence,
    hooksTop5: merged.hooksTop5,
    assets: merged.assets,
    sellingPoints: merged.sellingPoints
  });

  // 生成媒体投放计划（基于 pipeline/assets/kpis 的简化推断）
  const buildMediaPlan = () => {
    const channels = (merged.pipeline?.length ? merged.pipeline : ['抖音','小红书','视频号','社群']).slice(0, 6);
    const baseBudget = 100; // 万元为单位示意
    const weights = [0.35,0.25,0.2,0.15,0.05,0.05];
    const kpis = Array.isArray(merged.kpis) && merged.kpis.length
      ? merged.kpis
      : [{ name: '互动率', target: '5%+' }];
    const planChannels = channels.map((name, idx) => ({
      name,
      budget: Math.round(baseBudget * (weights[idx] || 0.05)),
      cpm: 35 + idx * 3,
      kpi: kpis[idx % kpis.length]
    }));
    const weeks = ['第1周 预热','第2周 爆发','第3周 维护','第4周 复盘'];
    const schedule = weeks.map((w, i) => ({ week: w, focus: i===1?'投放&UGC爆发':(i===0?'内容预热':'数据复盘/复投优化'), deliverables: i===1?['短视频脚本','达人投放','话题挑战']:['主视觉','落地页','海报KV'] }));
    const requirements = (merged.assets?.length ? merged.assets : ['品牌主视觉','短视频脚本','海报KV','落地页','FAQ']).slice(0,8);
    const checklist = ['素材齐套','渠道对接','打通数据回传','KPI确认','预算批复','风控合规'];
    return { channels: planChannels, schedule, requirements, checklist };
  };

  // 受众画像与KPI映射（示意）
  const buildPersonas = () => {
    const personas = [
      { name: 'Z世代潮流型', interests: ['潮流','数码','新消费'], regions: ['一线','新一线'], platforms: ['抖音','小红书'] },
      { name: '环保理性型', interests: ['环保','极简','可持续'], regions: ['一线','二线'], platforms: ['视频号','小红书'] },
    ];
    const touchKpi = [
      { touch: '短视频首屏3秒', kpi: '≥45%' },
      { touch: '挑战赛参与', kpi: '互动率≥5%' },
      { touch: '落地页点击-购买', kpi: '转化率≥3%' }
    ];
    return { personas, touchKpi };
  };

  const mediaPlan = useMemo(buildMediaPlan, [merged]);
  const audience = useMemo(buildPersonas, [merged]);

  useEffect(() => {
    // 模拟流水线执行
    const steps = [
      { name: '解析输入', run: () => setArtifacts(a=>({ ...a, parsed: merged })) },
      { name: '生成文档', run: () => setArtifacts(a=>({ ...a, markdown: buildMarkdown(), json: merged })) },
      { name: '生成图片/视频文案', run: () => setArtifacts(a=>({ ...a, media: buildMedia() })) },
      { name: '生成任务看板', run: () => setArtifacts(a=>({ ...a, kanban: buildTaskBoard() })) },
      { name: '打包完成', run: () => {} }
    ];

    let i = 0;
    const tick = () => {
      const s = steps[i];
      if (!s) return;
      setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} — ${s.name}`]);
      s.run();
      setStepIndex(i);
      i += 1;
      if (i < steps.length) {
        timerRef.current = setTimeout(tick, 500);
      }
    };
    tick();
    return () => clearTimeout(timerRef.current);
  }, [merged]);

  return { stepIndex, logs, artifacts, merged };
}

export function AgentRunner({ open, onClose, fusion, agent }) {
  const { stepIndex, logs, artifacts, merged } = useAgentPipeline({ fusion });

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text || ''); } catch {}
  };
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(artifacts.json || {}, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${merged.title || 'agent-output'}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPPTX = async () => {
    try {
      const file = await exportToPptx({
        title: merged.title,
        oneSentence: merged.oneSentence,
        bigIdea: merged.bigIdea,
        titlesTop5: merged.titlesTop5,
        hooksTop5: merged.hooksTop5,
        pipeline: merged.pipeline,
        assets: merged.assets,
        sellingPoints: merged.sellingPoints,
        contrarianPoints: merged.contrarianPoints,
        talkTracks: merged.talkTracks,
        mvp: merged.mvp,
        milestones: merged.milestones,
        kpis: merged.kpis
      });
      // exportToPptx 自行触发下载，无需处理返回
    } catch (_) {}
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="relative w-[1000px] max-w-[96vw] h-[84vh] bg-white rounded-2xl border border-bfl-border shadow-xl flex flex-col" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-bfl-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-bfl-text-dim">Agent</span>
              <div className="text-base font-semibold text-bfl-text">{agent==='pitch' ? 'Pitch-Agent' : 'Fusion-Agent'} 创作流程</div>
            </div>
            <button className="p-1 rounded hover:bg-bfl-surface-2" title="关闭" onClick={onClose}><X className="w-4 h-4 text-bfl-text-dim"/></button>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden">
            {/* 左：步骤与日志 */}
            <div className="col-span-1 border-r border-bfl-border pr-4 overflow-auto custom-scrollbar">
              <div className="text-sm font-semibold mb-2">步骤进度</div>
              <div className="progress mb-3"><div className="progress-bar" style={{ width: `${(stepIndex+1)/5*100}%` }} /></div>
              <ol className="space-y-2">
                {['解析输入','生成文档','生成图片/视频文案','生成任务看板','打包完成'].map((s, i)=>(
                  <li key={s} className={`flex items-center gap-2 ${i<=stepIndex? 'text-bfl-text':'text-bfl-text-dim'}`}>
                    <Check className={`w-4 h-4 ${i<=stepIndex? 'text-green-500':'text-bfl-text-dim'}`} />
                    <span className="text-sm">{s}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-3 text-xs text-bfl-text-dim">状态：<span className="status-dot" style={{ background: stepIndex<4 ? '#22c55e' : '#3b82f6' }} /> {stepIndex<4 ? '执行中' : '完成'}</div>
              <div className="mt-4 text-sm font-semibold">日志</div>
              <div className="mt-1 text-xs rounded-lg border border-bfl-border bg-bfl-surface-2 p-2 h-56 overflow-auto custom-scrollbar whitespace-pre-wrap">
                {logs.join('\n')}
              </div>
            </div>

            {/* 中：文档与任务 & 媒体投放计划 */}
            <div className="col-span-1 overflow-auto custom-scrollbar space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">文档与任务</div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-secondary text-xs flex items-center gap-1" onClick={()=>copy(artifacts.markdown)}><Clipboard className="w-3 h-3"/>复制Markdown</button>
                  <button className="btn btn-secondary text-xs flex items-center gap-1" onClick={downloadJSON}><Download className="w-3 h-3"/>导出JSON</button>
                  <button className="btn btn-secondary text-xs flex items-center gap-1" onClick={downloadPPTX}><Download className="w-3 h-3"/>导出PPTX</button>
                </div>
              </div>
              <div className="card mb-3">
                <div className="card-head"><FileText className="w-3 h-3"/>Markdown</div>
                <div className="p-3 text-sm whitespace-pre-wrap">{artifacts.markdown || '生成中...'}</div>
              </div>
              <div className="card">
                <div className="card-head">任务看板（Markdown）</div>
                <div className="p-3 text-sm whitespace-pre-wrap">{artifacts.kanban || '生成中...'}</div>
              </div>

              <div className="card">
                <div className="card-head">媒体投放计划（示例）</div>
                <div className="p-3 text-sm space-y-3">
                  <div>
                    <div className="text-xs text-bfl-text-dim mb-1">渠道/预算（万元）</div>
                    <ul className="space-y-1">
                      {mediaPlan.channels.map((c,i)=>(<li key={i} className="flex justify-between"><span>{c.name}</span><span>预算 {c.budget}｜CPM {c.cpm}｜KPI {c.kpi.name} {c.kpi.target}</span></li>))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-bfl-text-dim mb-1">排期</div>
                    <ul className="space-y-1">
                      {mediaPlan.schedule.map((s,i)=>(<li key={i}><span className="font-medium mr-2">{s.week}</span>{s.focus} ｜ 产出：{s.deliverables.join(' / ')}</li>))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-bfl-text-dim mb-1">素材要求</div>
                    <div className="flex flex-wrap gap-2">{mediaPlan.requirements.map((r,i)=>(<span key={i} className="tag-pill">{r}</span>))}</div>
                  </div>
                  <div>
                    <div className="text-xs text-bfl-text-dim mb-1">出街清单</div>
                    <ul className="list-disc list-inside space-y-1">{mediaPlan.checklist.map((x,i)=>(<li key={i}>{x}</li>))}</ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 右：图片/视频文案 & 受众画像 & 风险/复盘 */}
            <div className="col-span-1 overflow-auto custom-scrollbar space-y-3">
              <div className="text-sm font-semibold mb-2">素材文案</div>
              <div className="card mb-3">
                <div className="card-head"><ImageIcon className="w-3 h-3"/>图片</div>
                <ul className="p-3 text-sm list-disc list-inside space-y-1">
                  {(artifacts.media?.imageCaptions || []).map((t,i)=>(<li key={i}>{t}</li>))}
                </ul>
              </div>
              <div className="card">
                <div className="card-head"><Video className="w-3 h-3"/>视频</div>
                <ul className="p-3 text-sm list-disc list-inside space-y-1">
                  {(artifacts.media?.videoCaptions || []).map((t,i)=>(<li key={i}>{t}</li>))}
                </ul>
              </div>

              <div className="card">
                <div className="card-head">受众人群画像与触点 KPI</div>
                <div className="p-3 text-sm space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    {audience.personas.map((p,i)=>(
                      <div key={i} className="rounded border border-bfl-border p-2">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-bfl-text-dim">兴趣：{p.interests.join(' / ')}｜地域：{p.regions.join(' / ')}｜平台：{p.platforms.join(' / ')}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs text-bfl-text-dim mb-1">触点 KPI 分解</div>
                    <ul className="list-disc list-inside space-y-1">{audience.touchKpi.map((k,i)=>(<li key={i}>{k.touch}：{k.kpi}</li>))}</ul>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head">审批/风险提示模板 与 复盘结构</div>
                <div className="p-3 text-sm space-y-2">
                  <div>
                    <div className="text-xs text-bfl-text-dim mb-1">审批要点</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>预算与KPI对齐（负责人/时间）</li>
                      <li>素材合规（版权/代言/环保宣称）</li>
                      <li>渠道SLA（投放、结算、数据回传）</li>
                      <li>风险预案（负面舆情/素材下架/转化异常）</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-bfl-text-dim mb-1">复盘结构</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>目标 vs 实际（KPI看板截图）</li>
                      <li>高效触点与浪费渠道梳理</li>
                      <li>A/B 测试结论与下次优化点</li>
                      <li>用户反馈与产品反向改进</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-bfl-border p-3 flex items-center gap-2 justify-end">
            <button className="btn btn-secondary text-sm" onClick={onClose}>关闭</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AgentRunner;


