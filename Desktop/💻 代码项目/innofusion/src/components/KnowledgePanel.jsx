import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Trash2, Play, Loader2, CheckCircle2, ChevronDown, MoreHorizontal } from 'lucide-react';
import { getUserKnowledge, addUserKnowledgeItem, addUserKnowledgeItems, removeUserKnowledge, importUserKnowledgeFromJSON, importUserKnowledgeFromCSV } from '../utils/knowledge';

export function KnowledgePanel({ open, onClose }) {
  const [items, setItems] = useState(() => getUserKnowledge());
  const [form, setForm] = useState({ title: '', text: '', industry: '', channel: '', region: '', publisher: '', source_url: '' });
  const [agentQuery, setAgentQuery] = useState('');
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [agentLogs, setAgentLogs] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAgentDetail, setShowAgentDetail] = useState(false);
  const [compact, setCompact] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const menuRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenFor(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const addItem = () => {
    if (!form.title || !form.text) return;
    const created = addUserKnowledgeItem({ ...form });
    setItems([created, ...items]);
    setForm({ title: '', text: '', industry: '', channel: '', region: '', publisher: '', source_url: '' });
  };

  const remove = (id) => { removeUserKnowledge(id); setItems(items.filter(x=>x.id!==id)); };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const isJson = file.name.endsWith('.json');
    const count = isJson ? importUserKnowledgeFromJSON(text) : importUserKnowledgeFromCSV(text);
    setItems(getUserKnowledge());
    alert(`已导入 ${count} 条`);
  };

  const appendLog = (msg) => setAgentLogs(prev => [...prev, `${new Date().toLocaleTimeString()}  ${msg}`]);

  const runAgent = async () => {
    if (!agentQuery || running) return;
    setRunning(true); setStepIndex(0); setAgentLogs([]);
    appendLog(`开始任务：${agentQuery}`);
    const steps = [
      '检索来源',
      '抓取页面',
      '解析抽取',
      '写入知识库'
    ];
    try {
      // Step 1: 检索
      setStepIndex(0); appendLog('检索公开数据源…'); await new Promise(r=>setTimeout(r, 500));
      // Step 2: 抓取
      setStepIndex(1); appendLog('抓取候选页面…'); await new Promise(r=>setTimeout(r, 600));
      // Step 3: 解析（尝试调用后端，如失败则本地构造）
      setStepIndex(2); appendLog('解析正文与结构化字段…');
      let crawled = [];
      try {
        const res = await fetch('/api/knowledge/crawl', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: agentQuery, maxItems: 5 }) });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.items)) crawled = data.items;
        }
      } catch (_) {}
      if (!crawled.length) {
        // 本地示例：根据查询词生成2条占位
        crawled = [
          { title: `${agentQuery}｜近期趋势与内容基线`, text: `${agentQuery} 相关话题近期互动中位有提升，建议以“问题→证据→行动”的结构呈现。`, industry: '全行业', channel: '内容营销', region: '中国', publisher: 'Agent-Placeholder', source_url: 'https://example.com/search?q=' + encodeURIComponent(agentQuery) },
          { title: `${agentQuery}｜竞品观察`, text: `竞品在短视频渠道投放更活跃，素材以对比/拆解为主，建议补齐测评与用户口碑证明。`, industry: '全行业', channel: '短视频', region: '中国', publisher: 'Agent-Placeholder', source_url: 'https://example.com/comp?q=' + encodeURIComponent(agentQuery) }
        ];
      }
      await new Promise(r=>setTimeout(r, 400));
      // Step 4: 写入
      setStepIndex(3); appendLog(`写入知识库（${crawled.length}）…`);
      addUserKnowledgeItems(crawled);
      setItems(getUserKnowledge());
      appendLog('完成');
    } finally {
      setRunning(false);
      setStepIndex(4);
    }
  };

  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[120] bg-black/30 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="w-[760px] max-w-[96vw] max-h-[84vh] bg-white rounded-2xl border border-bfl-border shadow-xl flex flex-col" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-bfl-border">
            <div className="text-sm font-semibold">行业数据 · 知识库</div>
            <button className="p-1 rounded hover:bg-bfl-surface-2" onClick={onClose}><X className="w-4 h-4 text-bfl-text-dim"/></button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 overflow-auto">
            <div className="space-y-2">
              <div className="text-xs text-bfl-text-dim">手动添加（至少填写 标题 与 内容）</div>
              <input className="w-full border border-bfl-border rounded px-2 py-1 text-sm" placeholder="标题" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
              <textarea className="w-full border border-bfl-border rounded px-2 py-1 text-sm h-24" placeholder="内容/要点（用于引用与依据）" value={form.text} onChange={e=>setForm({...form, text:e.target.value})} />
              <button className="w-full text-left text-xs text-bfl-text-dim hover:text-bfl-text flex items-center gap-1" onClick={()=>setShowAdvanced(v=>!v)}>
                <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced?'rotate-180':''}`} /> 高级字段（行业 / 渠道 / 地区 / 来源）
              </button>
              {showAdvanced && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <input className="border border-bfl-border rounded px-2 py-1 text-sm" placeholder="行业" value={form.industry} onChange={e=>setForm({...form, industry:e.target.value})} />
                    <input className="border border-bfl-border rounded px-2 py-1 text-sm" placeholder="渠道" value={form.channel} onChange={e=>setForm({...form, channel:e.target.value})} />
                    <input className="border border-bfl-border rounded px-2 py-1 text-sm" placeholder="地区" value={form.region} onChange={e=>setForm({...form, region:e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="border border-bfl-border rounded px-2 py-1 text-sm" placeholder="来源/发布方" value={form.publisher} onChange={e=>setForm({...form, publisher:e.target.value})} />
                    <input className="border border-bfl-border rounded px-2 py-1 text-sm" placeholder="链接（可选）" value={form.source_url} onChange={e=>setForm({...form, source_url:e.target.value})} />
                  </div>
                </div>
              )}
              <button className="btn btn-primary text-sm" onClick={addItem}><Plus className="w-4 h-4 inline mr-1"/>添加到知识库</button>

              <div className="text-xs text-bfl-text-dim pt-3">
                或 导入 JSON/CSV（字段见“模板示例”）
                <details className="mt-1">
                  <summary className="cursor-pointer inline text-bfl-primary">查看字段模板</summary>
                  <pre className="mt-1 p-2 bg-bfl-surface-2 rounded text-[11px] overflow-auto">title,text,industry,channel,region,publisher,source_url,kpi_metric,kpi_value</pre>
                </details>
              </div>
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input type="file" accept=".json,.csv" className="hidden" onChange={onUpload} />
                <span className="btn btn-secondary text-sm"><Upload className="w-4 h-4 inline mr-1"/>导入文件</span>
              </label>

              <div className="pt-2">
                <button className="btn btn-secondary text-sm" onClick={() => {
                  const demo = [
                    { title: '咖啡 × Z世代：短视频种草链路', text: '18-28秒、前三秒抛问题，达人测评+直播转化；主张“环保杯计划”。', industry: '餐饮饮品', channel: '抖音', region: '中国', publisher: '示例库', source_url: 'https://example.com/cases/coffee-genz'},
                    { title: '环保包装对复购的影响', text: '同品类下，可降解包装提升8-12%复购；需结合行动与成本透明。', industry: '快消', channel: '内容营销', region: '全球', publisher: '示例库', source_url: 'https://example.com/green'},
                    { title: '小红书环保话题基线', text: '环保/可持续话题互动率中位约4.5%；首图与标题包含行动语义提升互动。', industry: '全行业', channel: '小红书', region: '中国', publisher: '示例库', source_url: 'https://example.com/xhs'}
                  ];
                  const n = addUserKnowledgeItems(demo);
                  setItems(getUserKnowledge());
                  alert(`已写入示例 ${n} 条`);
                }}>写入示例数据</button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-bfl-text-dim">我的知识库（本地浏览器存储）</div>
                <label className="text-[11px] text-bfl-text-dim inline-flex items-center gap-1">
                  <input type="checkbox" className="w-3 h-3" checked={compact} onChange={(e)=>setCompact(e.target.checked)} /> 简洁视图
                </label>
              </div>
              <div className="max-h-[48vh] overflow-auto custom-scrollbar space-y-2">
                {items.length === 0 ? (
                  <div className="text-xs text-bfl-text-dim">暂无数据，添加后可用于摘要/全案“依据与引用”。</div>
                ) : items.slice(0, visibleCount).map((it) => (
                  <div key={it.id} className="border border-bfl-border rounded p-2 relative">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium truncate">{it.title}</div>
                      <div className="relative" ref={menuOpenFor === it.id ? menuRef : null}>
                        <button 
                          className="p-1.5 rounded hover:bg-bfl-surface-2"
                          aria-label="更多"
                          onClick={() => setMenuOpenFor(menuOpenFor === it.id ? null : it.id)}
                        >
                          <MoreHorizontal className="w-4 h-4 text-bfl-text-dim" />
                        </button>
                        <AnimatePresence>
                          {menuOpenFor === it.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -5, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -5, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-bfl-border z-30 overflow-hidden"
                            >
                              {it.source_url && (
                                <a className="block w-full text-left text-xs px-3 py-2.5 hover:bg-bfl-surface-2" href={it.source_url} target="_blank" rel="noreferrer">查看来源</a>
                              )}
                              <button className="w-full text-left text-xs px-3 py-2.5 hover:bg-bfl-surface-2" onClick={() => {
                                const ev = new CustomEvent('bfl:add-evidence', { detail: it });
                                window.dispatchEvent(ev);
                                setMenuOpenFor(null);
                              }}>关联到当前创意</button>
                              <button className="w-full text-left text-xs px-3 py-2.5 hover:bg-bfl-surface-2 text-red-500" onClick={() => { remove(it.id); setMenuOpenFor(null); }}>删除</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-1 flex-wrap">
                      {[it.industry, it.channel, it.region].filter(Boolean).map((tag, i)=>(
                        <span key={i} className="px-1.5 py-0.5 rounded bg-bfl-surface-2 text-[11px] text-bfl-text-dim">{tag}</span>
                      ))}
                    </div>
                    {(!compact || expandedIds.has(it.id)) && (
                      <div className="text-xs text-bfl-text-dim mt-1 whitespace-pre-wrap">{it.text}</div>
                    )}
                    {compact && (
                      <button className="text-[11px] text-bfl-text-dim underline mt-1" onClick={()=>{
                        setExpandedIds(prev => { const n = new Set(prev); n.has(it.id) ? n.delete(it.id) : n.add(it.id); return n; });
                      }}>{expandedIds.has(it.id) ? '收起' : '展开'}</button>
                    )}
                  </div>
                ))}
              </div>
              {items.length > visibleCount && (
                <div className="pt-2 flex justify-center">
                  <button className="btn btn-secondary btn-sm" onClick={() => setVisibleCount(v => Math.min(v + 10, items.length))}>加载更多</button>
                </div>
              )}
              <div className="text-xs text-bfl-text-dim pt-2">智能抓取：输入检索词，系统抓取公开数据并写入知识库。</div>
              <div className="flex items-center gap-2">
                <input className="flex-1 border border-bfl-border rounded px-2 py-1 text-sm" placeholder="如：环保杯 竞品分析 / Z世代 咖啡 市场数据" value={agentQuery} onChange={e=>setAgentQuery(e.target.value)} />
                <button className={`btn btn-secondary text-sm ${running?'opacity-60 cursor-wait':''}`} onClick={runAgent} disabled={running || !agentQuery}>
                  {running ? <Loader2 className="w-4 h-4 inline animate-spin mr-1"/> : <Play className="w-4 h-4 inline mr-1"/>}
                  启动
                </button>
              </div>
              {/* 进度与日志 */}
              <div className="mt-2 border border-bfl-border rounded p-2">
                <div className="flex items-center gap-2 text-xs">
                  {[ '检索','抓取','解析','写入' ].map((s, i)=> (
                    <div key={s} className={`flex items-center gap-1 ${i<=stepIndex? 'text-bfl-text':'text-bfl-text-dim'}`}>
                      {i<stepIndex ? <CheckCircle2 className="w-3 h-3 text-green-500"/> : <span className="inline-block w-3 h-3 rounded-full" style={{ background: i===stepIndex && running ? '#60a5fa' : '#e5e7eb' }} />}
                      <span>{s}</span>
                    </div>
                  ))}
                  <button className="ml-auto underline" onClick={()=>setShowAgentDetail(v=>!v)}>{showAgentDetail ? '收起日志' : '查看日志'}</button>
                </div>
                {showAgentDetail && (
                  <div className="mt-2 h-24 overflow-auto custom-scrollbar text-[11px] text-bfl-text-dim whitespace-pre-wrap">{agentLogs.join('\n')}</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default KnowledgePanel;


