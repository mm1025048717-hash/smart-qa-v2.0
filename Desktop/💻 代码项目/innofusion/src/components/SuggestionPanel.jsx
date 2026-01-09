import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Copy, Check, Maximize2, Minimize2, FileText,
  Image as ImageIcon, Video, ChevronDown, Repeat, ChevronLeft, ExternalLink, Calendar, Building2, Megaphone
} from 'lucide-react';
import { parseSuggestions, buildMediaCaptions } from '../utils/suggestions';
import { loadAllKnowledge, searchKnowledge } from '../utils/knowledge';
import { getTitleMeta, toggleFavoriteTitle, rateTitle, pushTitleHistory } from '../utils/storage';
import { useI18n } from '../i18n.jsx';

function CopyButton({ onCopyAll, onCopyMd, onCopyJson, copiedId }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  const options = [
    { id: 'md', label: t('action.copyMarkdown'), action: onCopyMd },
    { id: 'json', label: t('action.copyJSON'), action: onCopyJson },
  ];

  return (
    <div className="relative inline-flex">
      <button
        onClick={onCopyAll}
        className="btn btn-secondary flex items-center gap-2 text-sm rounded-r-none"
      >
        {copiedId === 'all' ? (
          <>
            <Check className="w-4 h-4" />
            {t('action.copied')}
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            {t('action.copyAll')}
          </>
        )}
      </button>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary px-2 rounded-l-none border-l border-bfl-border"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute right-0 top-full mt-2 w-40 bg-white border border-bfl-border rounded-lg shadow-lg z-10"
            onMouseLeave={() => setIsOpen(false)}
          >
            {options.map(opt => (
              <button
                key={opt.id}
                onClick={() => { opt.action(); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-bfl-text hover:bg-bfl-surface-2 flex items-center gap-2"
              >
                {copiedId === opt.id ? <Check className="w-4 h-4 text-green-500" /> : <div className="w-4" />}
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * AI 建议面板组件
 */
export function SuggestionPanel({ fusion, onClose, agent, onExecute, onSelectTitle, onSelectIdea, forceFullscreenKey, mode = 'ideas', onRequestFullPlan, onBack, onOpenKnowledge }) {
  const [copiedId, setCopiedId] = useState(null);
  const [dense, setDense] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullTab, setFullTab] = useState('doc'); // doc | image | video
  const [selectTasks, setSelectTasks] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState(new Set());
  const [selectedAssets, setSelectedAssets] = useState(new Set());
  const [selectedKpis, setSelectedKpis] = useState(new Set());
  const [showExplorerHint, setShowExplorerHint] = useState(false);
  const [insights, setInsights] = useState([]);
  const [kbItems, setKbItems] = useState([]);
  const [filters, setFilters] = useState({ industry: '', channel: '', region: '' });
  const [includeInsights, setIncludeInsights] = useState(true);
  const [showFilterRow, setShowFilterRow] = useState(false);
  const [insightsVisibleCount, setInsightsVisibleCount] = useState(3);
  const maxScore = useMemo(() => {
    if (!insights || !insights.length) return 1;
    return Math.max(1, ...insights.map(i => Number(i._score || 0)));
  }, [insights]);
  const getChannelClass = (ch) => {
    if (!ch) return 'bg-gray-50 text-gray-600';
    if (/小红书|XHS/.test(ch)) return 'bg-rose-50 text-rose-600';
    if (/抖音|短视频/.test(ch)) return 'bg-blue-50 text-blue-600';
    if (/视频号|B站|哔哩/.test(ch)) return 'bg-green-50 text-green-600';
    if (/内容营销|SEO|博客/.test(ch)) return 'bg-amber-50 text-amber-600';
    return 'bg-gray-50 text-gray-600';
  };
  const [metaMap, setMetaMap] = useState({});
  const [generatingTitle, setGeneratingTitle] = useState('');
  const { t } = useI18n();
  
  if (!fusion) return null;

  const suggestions = parseSuggestions(fusion.notes || '');
  const structured = fusion.structured || null;

  // 增强版：将“建议列表”映射为全屏文档所需结构
  const buildDocFromSuggestions = (items, title) => {
    const findBy = (pred) => items.find(pred)?.content;
    const oneSentence = findBy(s => /一句|主张|slogan|口号/i.test(s.type)) || title || '';
    const bigIdea = findBy(s => /big|主意|核心|反共识|idea/i.test(s.type)) || findBy(s=>/卖点/.test(s.type)) || '';
    const titleList = items.filter(s => /标题/i.test(s.type)).map(s => s.content);
    const hookList = items.filter(s => /开场|钩子/i.test(s.type)).map(s => s.content);

    // 更详细的默认内容
    const defaultPipeline = [
      '**认知阶段 (Awareness):** 通过抖音短视频、小红书图文笔记进行内容种草，扩大品牌曝光。',
      '**兴趣阶段 (Interest):** 在知乎、B站发布深度内容，如评测、教程，吸引用户深入了解。',
      '**转化阶段 (Conversion):** 利用微信公众号、社群进行私域运营，通过活动和专属福利促进转化。',
      '**裂变阶段 (Advocacy):** 设计用户分享激励机制，在朋友圈等社交渠道形成口碑传播。'
    ].join('\n');
    const defaultAssets = [
      '**核心视觉:** 品牌Logo、VI规范、主视觉海报(KV)',
      '**社交媒体:** 短视频脚本(3-5个)、公众号文章(2-3篇)、社群/朋友圈海报(9张)',
      '**转化页面:** 产品落地页(Landing Page)、活动报名页',
      '**信任建设:** 用户评价截图、KOL/KOC合作案例、常见问题(FAQ)文档'
    ].join('\n');

    const pipeline = findBy(s => /传播|渠道|链路|分发/i.test(s.type)) || defaultPipeline;
    const assets = findBy(s => /素材|清单|资产/i.test(s.type)) || defaultAssets;
    const mvp = findBy(s => /(MVP|最小验证|里程碑|实验|冲刺|计划)/i.test(s.type)) || '在小范围内推出样品，收集目标用户反馈，验证市场接受度。';
    const sellingPoint = findBy(s => /卖点|价值/i.test(s.type)) || `突出“${title}”给用户带来的直接好处（效率/省钱/省时/体验）。`;
    const contrarian = findBy(s => /反共识|差异|亮点/i.test(s.type)) || `用反常识角度切入，让“${title}”形成记忆点。`;
    const talkTrack = findBy(s => /话术|CTA|行动号召/i.test(s.type)) || '一句话行动号召：现在就试试/领取/加入，限时福利。';

    const makeTitleVars = (t) => [
      t,
      `${t}｜从0到1的实践`,
      `为什么是${t}`,
      `${t} 的3个关键`,
      `${t}：一图看懂`
    ];
    const makeHookVars = (t) => [
      `先抛问题：我们如何用“${t}”解决老难题？`,
      `反差开场：当${t}遇到现实世界，会发生什么？`,
      `数字开场：3个动作，让${t}直接落地`,
      `故事开场：一个用户因为${t}而改变`,
      `悬念开场：别急着否定${t}，先看这个实验`
    ];

    const titlesTop5 = titleList.length >= 5 ? titleList.slice(0,5) : makeTitleVars(title).slice(0, 5 - titleList.length).concat(titleList).slice(0,5);
    const hooksTop5 = hookList.length >= 5 ? hookList.slice(0,5) : makeHookVars(title).slice(0, 5 - hookList.length).concat(hookList).slice(0,5);

    const splitToList = (text) => (text || '')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    return { 
      oneSentence, bigIdea, titlesTop5, hooksTop5, pipeline, assets, mvp,
      sellingPoint, contrarian, talkTrack,
      pipelineList: splitToList(pipeline),
      assetList: splitToList(assets)
    };
  };
  const doc = buildDocFromSuggestions(suggestions, fusion.title);
  // 评分已移除，保留收藏单星


  // 精炼文案：若缺失 oneSentence，则从建议中提炼一句话与3个要点
  const quickCopy = React.useMemo(() => {
    // 1) 一句话主张
    let headline = structured?.oneSentence || doc.oneSentence || '';
    if (!headline) {
      headline = (suggestions[0]?.content || '').trim();
    }
    if (!headline || headline === fusion.title) {
      // 再退回：用标题生成一个简单句式
      headline = `把“${fusion.title.replace(/\s+/g,'')}”变成可落地的营销动作`;
    }
    // 2) 三个要点
    const sps = Array.isArray(structured?.sellingPoints) ? structured.sellingPoints : [];
    let bullets = sps.filter(Boolean).slice(0, 3);
    if (bullets.length === 0) {
      bullets = suggestions.slice(0, 3).map(s => s.content).filter(Boolean);
    }
    return { headline, bullets };
  }, [structured, doc, suggestions, fusion.title]);
  // 一次性载入知识库（用户 + 公共）
  useEffect(() => {
    (async () => {
      const data = await loadAllKnowledge();
      setKbItems(data);
    })();
  }, []);

  // 根据标题关键词与筛选条件联动检索
  useEffect(() => {
    const q = (fusion?.title || '').replace(/×/g, ' ').trim();
    const result = searchKnowledge(kbItems, { query: q, filters, topK: 6 });
    setInsights(result);
  }, [kbItems, fusion?.title, filters]);

  const industryOptions = useMemo(() => {
    const set = new Set();
    kbItems.forEach(it => { if (it.industry) set.add(it.industry); });
    return Array.from(set);
  }, [kbItems]);
  const channelOptions = useMemo(() => {
    const set = new Set();
    kbItems.forEach(it => { if (it.channel) set.add(it.channel); });
    return Array.from(set);
  }, [kbItems]);
  const regionOptions = useMemo(() => {
    const set = new Set();
    kbItems.forEach(it => { if (it.region) set.add(it.region); });
    return Array.from(set);
  }, [kbItems]);

  // 标题候选（目标：10个）
  const generateTitleVars = (t) => [
    t,
    `${t}｜从0到1的实践`,
    `为什么是${t}`,
    `${t} 的3个关键`,
    `${t}：一图看懂`,
    `${t}×用户痛点：快速打通`,
    `用${t} 打开新市场`,
    `${t} 行动方案`,
    `${t} ｜ 30天落地`,
    `${t} 的反常识玩法`
  ];
  const baseTitles = (
    structured?.titlesTop10 || structured?.titlesTop5 || doc.titlesTop5 || []
  ).slice(0, 10);
  const filledTitles = Array.from(
    new Set(
      baseTitles.length >= 10
        ? baseTitles
        : [...baseTitles, ...generateTitleVars(fusion.title || '')]
    )
  )
    .filter(Boolean)
    .slice(0, 10);

  // 预载入收藏/分数，避免每次渲染都读 storage，并提升交互响应
  useEffect(() => {
    const map = {};
    filledTitles.forEach(t => { map[t] = getTitleMeta(t); });
    setMetaMap(map);
  }, [filledTitles.join('|')]);

  const handleToggleFavorite = (title) => {
    setMetaMap(prev => ({ ...prev, [title]: { ...(prev[title]||{}), favorite: !(prev[title]?.favorite) } }));
    // 异步持久化
    setTimeout(() => toggleFavoriteTitle(title), 0);
  };
  const handleRate = (title, score) => {
    const val = Number(score) || 0;
    setMetaMap(prev => ({ ...prev, [title]: { ...(prev[title]||{}), score: val } }));
    setTimeout(() => rateTitle(title, val), 0);
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const copyAll = async () => {
    const fullText = `${fusion.title}\n\n${fusion.notes}`;
    copyToClipboard(fullText, 'all');
  };

  // 构建 Markdown / JSON
  const getPipeline = () => (structured?.pipeline || doc.pipelineList || []);
  const getAssets = () => (structured?.assets || doc.assetList || []);
  const getKpis = () => (structured?.kpis || []);
  const buildMarkdown = () => {
    const lines = [];
    lines.push(`# ${fusion.title}`);
    const one = structured?.oneSentence || doc.oneSentence;
    const big = structured?.bigIdea || doc.bigIdea;
    if (one) lines.push(`\n## 一句话主张\n${one}`);
    if (big) lines.push(`\n## Big Idea\n${big}`);
    const titles = structured?.titlesTop5 || doc.titlesTop5 || [];
    const hooks = structured?.hooksTop5 || doc.hooksTop5 || [];
    if (titles.length) {
      lines.push(`\n## 标题 Top 5`);
      titles.forEach((t, i) => lines.push(`${i+1}. ${t}`));
    }
    if (hooks.length) {
      lines.push(`\n## 开场钩子 Top 5`);
      hooks.forEach((t, i) => lines.push(`${i+1}. ${t}`));
    }
    const pipe = getPipeline();
    const assets = getAssets();
    const sps = structured?.sellingPoints || [doc.sellingPoint];
    const cps = structured?.contrarianPoints || [doc.contrarian];
    const talks = structured?.talkTracks || [doc.talkTrack];
    if (pipe.length) lines.push(`\n## 传播链路\n- ${pipe.join('\n- ')}`);
    if (sps?.length || cps?.length || talks?.length) {
      lines.push(`\n## 核心卖点与差异`);
      sps?.forEach(s=>lines.push(`- 卖点：${s}`));
      cps?.forEach(s=>lines.push(`- 反共识：${s}`));
      talks?.forEach(s=>lines.push(`- 话术：${s}`));
    }
    if (assets.length) lines.push(`\n## 素材清单\n- ${assets.join('\n- ')}`);
    if (structured?.milestones?.length) {
      lines.push(`\n## 里程碑`);
      structured.milestones.forEach(m=>lines.push(`- ${m.name}：${m.desc}`));
    } else if (structured?.mvp || doc.mvp) {
      lines.push(`\n## MVP\n${structured?.mvp || doc.mvp}`);
    }
    if (getKpis().length) {
      lines.push(`\n## KPI`);
      getKpis().forEach(k=>lines.push(`- ${k.name}：${k.target}`));
    }
    if (includeInsights && insights.length) {
      lines.push(`\n## 依据与引用`);
      insights.forEach((it, idx) => {
        const meta = [it.publisher, it.date, it.channel].filter(Boolean).join(' · ');
        const src = it.source_url ? `（来源：${it.source_url}）` : '';
        lines.push(`${idx+1}. ${it.title} — ${meta}${src}`);
      });
    }
    return lines.join('\n');
  };
  const buildStructuredFallback = () => ({
    title: fusion.title,
    oneSentence: structured?.oneSentence || doc.oneSentence,
    bigIdea: structured?.bigIdea || doc.bigIdea,
    titlesTop5: structured?.titlesTop5 || doc.titlesTop5,
    hooksTop5: structured?.hooksTop5 || doc.hooksTop5,
    pipeline: getPipeline(),
    assets: getAssets(),
    sellingPoints: structured?.sellingPoints || [doc.sellingPoint],
    contrarianPoints: structured?.contrarianPoints || [doc.contrarian],
    talkTracks: structured?.talkTracks || [doc.talkTrack],
    mvp: structured?.mvp || doc.mvp,
    milestones: structured?.milestones || [],
    kpis: getKpis(),
    notes: fusion.notes.split('\n')
  });
  const copyMarkdown = () => copyToClipboard(buildMarkdown(), 'md');
  const copyJSON = () => copyToClipboard(JSON.stringify(structured || buildStructuredFallback(), null, 2), 'json');
  const handleRegenerate = () => {
    // 触发外层使用当前语言重跑一次（Canvas中的按钮会重新融合生成）
    const event = new CustomEvent('bfl:regenerate-current', { detail: { fusionId: fusion.id } });
    window.dispatchEvent(event);
  };

  // 任务看板导出（基于勾选）
  const buildTaskBoardMarkdown = () => {
    const pipe = getPipeline();
    const assets = getAssets();
    const kpis = getKpis();
    const selPipe = selectedPipeline.size ? [...selectedPipeline].map(i=>pipe[i]) : pipe;
    const selAssets = selectedAssets.size ? [...selectedAssets].map(i=>assets[i]) : assets;
    const selKpis = selectedKpis.size ? [...selectedKpis].map(i=>kpis[i]) : kpis;
    const out = [
      `# ${fusion.title}｜任务看板`,
      `\n## 传播链路`,
      ...selPipe.map(p=>`- [ ] ${p}`),
      `\n## 素材清单`,
      ...selAssets.map(a=>`- [ ] ${a}`),
      selKpis.length ? `\n## KPI` : '',
      ...selKpis.map(k=>`- [ ] ${k.name}：${k.target}`)
    ].filter(Boolean);
    return out.join('\n');
  };
  const copyTaskBoard = () => copyToClipboard(buildTaskBoardMarkdown(), 'kanban');

  const Section = ({ title, children, className = '', onCopy }) => (
    <section className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-bfl-primary uppercase tracking-wider">{title}</h2>
        {onCopy && (
          <button
            onClick={onCopy}
            className="p-1.5 rounded-full hover:bg-bfl-surface-2 transition-colors"
            title={`${t('action.copy', '复制')} ${title}`}
          >
            <Copy className="w-4 h-4 text-bfl-text-dim" />
          </button>
        )}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </section>
  );

  // 外部强制打开方案视图（用于“生成方案”后直接查看文档）
  React.useEffect(() => {
    if (forceFullscreenKey) {
      setFullscreen(true);
      setFullTab('doc');
    }
  }, [forceFullscreenKey]);

  return (
    <motion.div
      className="suggestion-panel w-96 max-w-[90vw]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-bfl-accent" />
          <h3 className="text-lg font-semibold text-bfl-text">{fusion.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFullscreen(true)}
            className="p-1 rounded hover:bg-bfl-surface-2"
            title={t('action.expand', '全屏展开')}
          >
            <Maximize2 className="w-4 h-4 text-bfl-text-dim" />
          </button>
          <button
            onClick={onClose}
            className="text-bfl-text-dim hover:text-bfl-text text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* 标题候选区（仅 ideas 模式展示）*/}
      {mode === 'ideas' && filledTitles.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-bfl-secondary uppercase mb-2">
            {t('label.titleCandidates', '参考创意标题（10）')}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {filledTitles.map((ttext, idx) => {
              const meta = metaMap[ttext] || { favorite: false, score: 0 };
              const busy = generatingTitle === ttext;
              return (
                <div key={idx} className="group flex items-center gap-2 p-2 border border-transparent hover:border-bfl-border rounded-lg bg-white hover:shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-bfl-surface-2 text-[11px] text-bfl-text-dim flex items-center justify-center flex-shrink-0">{idx+1}</div>
                  <div className="flex-1 min-w-0 text-sm text-bfl-text truncate leading-snug" title={ttext}>
                    {ttext.replace(/\n+/g, ' ')}
                  </div>
                  <button
                    className={`w-7 h-7 rounded-md border text-xs flex items-center justify-center ${meta.favorite ? 'bg-yellow-100 border-yellow-300' : 'bg-white border-bfl-border'}`}
                    onClick={() => handleToggleFavorite(ttext)}
                    title={meta.favorite ? t('action.unfavorite','取消收藏') : t('action.favorite','收藏')}
                  >
                    {meta.favorite ? '★' : '☆'}
                  </button>
                  <button
                    className="w-7 h-7 rounded-md border border-bfl-border hover:bg-bfl-surface-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title={t('action.copy','复制标题')}
                    onClick={()=>copyToClipboard(ttext,'title-copy')}
                  >
                    <Copy className="w-3.5 h-3.5 text-bfl-text-dim" />
                  </button>
                  {onSelectTitle && (
                    <button
                      className={`btn btn-primary btn-sm ${busy ? 'opacity-60 cursor-wait' : ''}`}
                      disabled={busy}
                      onClick={async () => {
                        setGeneratingTitle(ttext);
                        try {
                          await onSelectTitle(ttext);
                          pushTitleHistory({ title: ttext, structured: fusion.structured, source: 'candidate' });
                        } finally {
                          setGeneratingTitle('');
                        }
                      }}
                      title={t('action.generatePlanFromTitle', '用这个生成方案')}
                    >
                      {busy ? t('loading','生成中…') : t('action.generatePlan', '生成')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {/* 轻提示：提示左侧可打开“标题发散”面板（在 Canvas 中挂载） */}
          {showExplorerHint && (
            <div className="text-[11px] text-bfl-text-dim mt-2">提示：可在左侧打开“标题发散”面板，按行业/渠道/风格筛选更多标题。</div>
          )}
              </div>
            )}

      {/* 想法流（ideas 模式）已移除：仅展示上方10个标题候选作为“创意想法”入口 */}

      {/* 摘要模式：展示方案摘要与“生成完整方案” */}
      {mode === 'summary' && (
        <div className="mb-4 space-y-3">
          <div className="bg-white border border-bfl-border rounded-lg p-4 cursor-pointer" onClick={onRequestFullPlan}
               title={t('action.generateFullPlan','点击生成完整方案')}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm text-bfl-secondary">摘要</div>
              {onBack && (
                <button
                  className="text-xs text-bfl-text-dim hover:text-bfl-text inline-flex items-center gap-1"
                  onClick={(e)=>{ e.stopPropagation(); onBack(); }}
                  title={t('action.back','返回')}
                >
                  <ChevronLeft className="w-3 h-3" />{t('action.back','返回')}
                </button>
              )}
            </div>
            <div className="text-base font-medium text-bfl-text mb-2">{quickCopy.headline}</div>
            <ul className="list-disc list-inside text-sm text-bfl-text-dim space-y-1">
              {quickCopy.bullets.slice(0,3).map((s,i)=>(<li key={i}>{s}</li>))}
            </ul>
            <div className="mt-3 flex items-center gap-2">
              {onRequestFullPlan && (
                <button className="btn btn-primary btn-sm" onClick={onRequestFullPlan}>{t('action.generateFullPlan','生成完整方案')}</button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={()=>copyToClipboard((structured?.oneSentence || doc.oneSentence || fusion.title), 'summary')}>{t('action.copy','复制')}</button>
            </div>
          </div>
          {insights.length > 0 ? (
            <div className="bg-white border border-bfl-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1 gap-2">
                <div className="text-sm text-bfl-secondary">依据与引用 <span className="text-bfl-text-dim text-xs">（{insights.length}）</span></div>
                <div className="flex items-center gap-3">
                  <button className="text-xs text-bfl-text-dim hover:text-bfl-text underline" onClick={()=>setShowFilterRow(v=>!v)}>{showFilterRow ? '收起筛选' : '筛选'}</button>
                  <label className="text-xs text-bfl-text-dim inline-flex items-center gap-1">
                    <input type="checkbox" className="w-4 h-4" checked={includeInsights} onChange={(e)=>setIncludeInsights(e.target.checked)} /> 随文档导出
                  </label>
                </div>
              </div>
              {showFilterRow && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <select
                    className="h-8 text-xs border border-bfl-border rounded px-2 bg-white"
                    value={filters.industry}
                    onChange={(e)=>setFilters(prev=>({ ...prev, industry: e.target.value }))}
                  >
                    <option value="">行业：全部</option>
                    {industryOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                  </select>
                  <select
                    className="h-8 text-xs border border-bfl-border rounded px-2 bg-white"
                    value={filters.channel}
                    onChange={(e)=>setFilters(prev=>({ ...prev, channel: e.target.value }))}
                  >
                    <option value="">渠道：全部</option>
                    {channelOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                  </select>
                  <select
                    className="h-8 text-xs border border-bfl-border rounded px-2 bg-white"
                    value={filters.region}
                    onChange={(e)=>setFilters(prev=>({ ...prev, region: e.target.value }))}
                  >
                    <option value="">地区：全部</option>
                    {regionOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                  </select>
                </div>
              )}
              <ul className="text-sm space-y-2">
                {insights.slice(0, insightsVisibleCount).map(it => {
                  const meta = [it.publisher, it.date, it.channel].filter(Boolean).join(' · ');
                  return (
                    <li key={it.id} className="flex flex-col">
                      <div className="font-medium text-bfl-text flex items-center gap-2">
                        <span className="truncate">{it.title}</span>
                        {it.channel && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${getChannelClass(it.channel)}`}>{it.channel}</span>
                        )}
                      </div>
                      <div className="text-bfl-text-dim line-clamp-2">{it.text}</div>
                      <div className="text-xs text-bfl-text-dim mt-1 flex items-center gap-2">
                        {it.publisher && <span className="inline-flex items-center gap-1"><Building2 className="w-3 h-3" />{it.publisher}</span>}
                        {it.date && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{it.date}</span>}
                        {it.channel && <span className="inline-flex items-center gap-1"><Megaphone className="w-3 h-3" />{it.channel}</span>}
                        {it.source_url && (
                          <a href={it.source_url} target="_blank" rel="noreferrer" title="来源" className="inline-flex items-center ml-auto text-bfl-text-dim hover:text-bfl-primary">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="mt-1 h-[2px] bg-bfl-surface-2 rounded">
                        <div className="h-full bg-bfl-primary rounded" style={{ width: `${Math.round(((it._score||0)/maxScore)*100)}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              {insights.length > insightsVisibleCount && (
                <div className="mt-2 flex justify-center">
                  <button className="btn btn-secondary btn-sm" onClick={()=>setInsightsVisibleCount(insights.length)}>展开更多</button>
                </div>
              )}
              {insightsVisibleCount > 3 && insightsVisibleCount >= insights.length && (
                <div className="mt-2 flex justify-center">
                  <button className="btn btn-secondary btn-sm" onClick={()=>setInsightsVisibleCount(3)}>收起</button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-bfl-border rounded-lg p-3">
              <div className="text-sm font-medium text-bfl-text mb-1">让方案更有“依据”</div>
              <div className="text-xs text-bfl-text-dim mb-2">添加行业数据或案例，系统会自动在这里联动展示并可随文档导出引用。</div>
              <button className="btn btn-secondary btn-sm" onClick={()=>onOpenKnowledge?.()}>打开知识库</button>
            </div>
          )}
        </div>
      )}

      {/* 底部工具条：仅 ideas 模式显示复制/展开等；摘要模式以 CTA 为主 */}
      {mode === 'ideas' && (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <CopyButton onCopyAll={copyAll} onCopyMd={copyMarkdown} onCopyJson={copyJSON} copiedId={copiedId} />
          <div className="flex items-center gap-2">
            <button onClick={() => setDense(v => !v)} className="btn btn-secondary text-sm">
              {dense ? t('action.more') : t('action.less')}
            </button>
            <button onClick={() => setFullscreen(true)} className="btn btn-secondary text-sm">
              {t('action.fullscreen')}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
           <button onClick={onClose} className="btn btn-secondary text-sm w-full">
              {t('action.continue')}
           </button>
           {onExecute && (
              <button onClick={() => onExecute(fusion, agent)} className="btn btn-primary text-sm w-full">
                 {t('action.executeAgent')}
              </button>
           )}
        </div>
        <button onClick={handleRegenerate} className="btn btn-subtle text-sm w-full flex items-center justify-center gap-2">
          <Repeat className="w-4 h-4" />
          {t('action.regenerate')}
        </button>
      </div>
      )}

      {/* 全屏文档/图片/视频：通过 Portal 避免受父级 transform 影响 */}
      {fullscreen && createPortal(
        (
          <AnimatePresence>
            <motion.div
              className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-[1000px] max-w-[96vw] h-[80vh] bg-white rounded-2xl border border-bfl-border shadow-xl flex flex-col"
                initial={{ scale: 0.98, y: 10, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.98, y: 10, opacity: 0 }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-bfl-border">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-bfl-accent" />
                    <div className="text-base font-semibold text-bfl-text">{fusion.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-lg overflow-hidden border border-bfl-border">
                      <button className={`px-3 py-1.5 text-sm ${fullTab==='doc'?'bg-bfl-surface-2':''}`} onClick={()=>setFullTab('doc')}><FileText className="w-4 h-4 inline mr-1" />{t('label.document')}</button>
                      <button className={`px-3 py-1.5 text-sm ${fullTab==='image'?'bg-bfl-surface-2':''}`} onClick={()=>setFullTab('image')}><ImageIcon className="w-4 h-4 inline mr-1" />{t('label.image')}</button>
                      <button className={`px-3 py-1.5 text-sm ${fullTab==='video'?'bg-bfl-surface-2':''}`} onClick={()=>setFullTab('video')}><Video className="w-4 h-4 inline mr-1" />{t('label.video')}</button>
                    </div>
                    <button className="p-1 rounded hover:bg-bfl-surface-2" title={t('action.exitFullscreen', '退出全屏')} onClick={()=>setFullscreen(false)}>
                      <Minimize2 className="w-4 h-4 text-bfl-text-dim" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-bfl-surface">
                   {fullTab === 'doc' && (
                     <div className="max-w-none text-bfl-text">
                       <div className="bg-white rounded-xl border border-bfl-border overflow-hidden">
                         <div className="px-8 py-6 border-b border-bfl-border">
                           <div className="flex items-center justify-between">
                             <div>
                               <h1 className="text-2xl font-bold font-display text-bfl-text">{fusion.title}</h1>
                               <p className="text-base text-bfl-text-dim mt-1">{t('label.document', '项目文档')}</p>
                             </div>
                             <div className="flex items-center gap-3">
                               <label className="text-sm inline-flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-bfl-surface-2">
                                 <input type="checkbox" checked={selectTasks} onChange={e=>setSelectTasks(e.target.checked)} className="w-4 h-4" /> 
                                 {t('action.enableTaskSelection', '启用任务勾选导出')}
                               </label>
                               {selectTasks && (
                                 <button className="btn btn-secondary text-sm" onClick={copyTaskBoard}>{t('action.copyTaskBoard', '复制任务看板')}</button>
                               )}
                             </div>
                           </div>
                         </div>
                         <div className="p-8 grid grid-cols-3 gap-10">
                           {/* Main Content */}
                           <div className="col-span-2 space-y-8">
                             <Section title={t('label.oneSentence', '一句话主张')} onCopy={() => copyToClipboard(structured?.oneSentence || doc.oneSentence, 'one-sentence')}>
                               <p className="text-lg leading-relaxed text-bfl-text-dim">{structured?.oneSentence || doc.oneSentence}</p>
                             </Section>
 
                             <Section title={t('label.bigIdea', 'Big Idea')} onCopy={() => copyToClipboard(structured?.bigIdea || doc.bigIdea, 'big-idea')}>
                               <p className="text-lg leading-relaxed text-bfl-text-dim">{structured?.bigIdea || doc.bigIdea}</p>
                             </Section>
 
                             <div className="grid grid-cols-2 gap-8">
                               <Section title={t('label.titleTop5', '标题 Top 5')} onCopy={() => copyToClipboard((structured?.titlesTop5 || doc.titlesTop5).join('\n'), 'titles')}>
                                 <ol className="list-decimal list-inside space-y-2 text-base">
                                   {(structured?.titlesTop5 || doc.titlesTop5).map((t, idx)=>(<li key={idx} className="hover:text-bfl-primary transition-colors">{t}</li>))}
                                 </ol>
                               </Section>
                               <Section title={t('label.hookTop5', '开场钩子 Top 5')} onCopy={() => copyToClipboard((structured?.hooksTop5 || doc.hooksTop5).join('\n'), 'hooks')}>
                                 <ol className="list-decimal list-inside space-y-2 text-base">
                                   {(structured?.hooksTop5 || doc.hooksTop5).map((t, idx)=>(<li key={idx} className="hover:text-bfl-primary transition-colors">{t}</li>))}
                                 </ol>
                               </Section>
                             </div>
                           </div>
 
                           {/* Sidebar */}
                           <div className="col-span-1 space-y-8">
                             <Section title={t('label.pipeline', '传播链路')} onCopy={() => copyToClipboard((structured?.pipeline || doc.pipelineList).join('\n'), 'pipeline')}>
                               {(structured?.pipeline || doc.pipelineList).map((p, i)=>(
                                 <label key={i} className="p-3 bg-bfl-surface rounded-lg flex items-center gap-3 cursor-pointer hover:shadow-sm transition-shadow border border-transparent hover:border-bfl-border">
                                   {selectTasks && (
                                     <input type="checkbox" checked={selectedPipeline.has(i)} onChange={(e)=>{
                                       setSelectedPipeline(prev=>{ const n = new Set(prev); e.target.checked ? n.add(i) : n.delete(i); return n; });
                                     }} className="w-4 h-4 flex-shrink-0" />
                                   )}
                                   <span className="text-sm" dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>') }} />
                                 </label>
                               ))}
                             </Section>
 
                             <Section title={t('label.assets', '素材清单')} onCopy={() => copyToClipboard((structured?.assets || doc.assetList).join('\n'), 'assets')}>
                               {(structured?.assets || doc.assetList).map((a, i)=>(
                                 <label key={i} className="p-3 bg-bfl-surface rounded-lg flex items-center gap-3 cursor-pointer hover:shadow-sm transition-shadow border border-transparent hover:border-bfl-border">
                                   {selectTasks && (
                                     <input type="checkbox" checked={selectedAssets.has(i)} onChange={(e)=>{
                                       setSelectedAssets(prev=>{ const n = new Set(prev); e.target.checked ? n.add(i) : n.delete(i); return n; });
                                     }} className="w-4 h-4 flex-shrink-0" />
                                   )}
                                   <span className="text-sm" dangerouslySetInnerHTML={{ __html: a.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>') }} />
                                 </label>
                               ))}
                             </Section>
 
                             {structured?.kpis?.length > 0 && (
                               <Section title={t('label.kpi', 'KPI')} onCopy={() => copyToClipboard(structured.kpis.map(k=>`${k.name}: ${k.target}`).join('\n'), 'kpis')}>
                                 <div className="grid grid-cols-1 gap-3">
                                   {structured.kpis.map((k, i)=>(
                                     <label key={i} className="kpi-card flex items-center gap-3 cursor-pointer p-3">
                                       {selectTasks && (
                                         <input type="checkbox" checked={selectedKpis.has(i)} onChange={(e)=>{
                                           setSelectedKpis(prev=>{ const n = new Set(prev); e.target.checked ? n.add(i) : n.delete(i); return n; });
                                         }} className="w-4 h-4 flex-shrink-0" />
                                       )}
                                       <div>
                                         <div className="text-sm text-bfl-text-dim">{k.name}</div>
                                         <div className="text-xl font-semibold text-bfl-text mt-1">{k.target}</div>
                                       </div>
                                     </label>
                                   ))}
                                 </div>
                               </Section>
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                   {fullTab === 'image' && (
                     <div className="grid grid-cols-2 gap-3 p-4">
                      {(() => {
                        const caps = buildMediaCaptions(structured || { title: fusion.title, oneSentence: doc.oneSentence, hooksTop5: doc.hooksTop5, assets: doc.assetList, sellingPoints: [doc.sellingPoint] });
                        const list = caps.imageCaptions;
                        return [
                          <div key={0} className="aspect-video rounded-xl border border-bfl-border bg-bfl-surface-2 flex items-center justify-center text-bfl-text-dim">{list[0] || '海报占位（导出中）'}</div>,
                          <div key={1} className="aspect-video rounded-xl border border-bfl-border bg-bfl-surface-2 flex items-center justify-center text-bfl-text-dim">{list[1] || '封面A/B占位'}</div>,
                          <div key={2} className="aspect-square rounded-xl border border-bfl-border bg-bfl-surface-2 flex items-center justify-center text-bfl-text-dim">{list[2] || '徽章示意'}</div>,
                          <div key={3} className="aspect-square rounded-xl border border-bfl-border bg-bfl-surface-2 flex items-center justify-center text-bfl-text-dim">{'排行榜组件'}</div>
                        ];
                      })()}
                    </div>
                  )}
                  {fullTab === 'video' && (
                    <div className="space-y-3">
                      {(() => {
                        const caps = buildMediaCaptions(structured || { title: fusion.title, oneSentence: doc.oneSentence, hooksTop5: doc.hooksTop5 });
                        const list = caps.videoCaptions;
                        return [
                          <div key={0} className="rounded-xl border border-bfl-border p-3 bg-white">
                            <div className="text-sm font-semibold mb-1">15-30秒脚本</div>
                            <div className="text-sm text-bfl-text">{list[0]}</div>
                          </div>,
                          <div key={1} className="rounded-xl border border-bfl-border p-3 bg-white">
                            <div className="text-sm font-semibold mb-1">30-60秒脚本</div>
                            <div className="text-sm text-bfl-text">{list[1]}</div>
                          </div>
                        ];
                      })()}
                    </div>
                  )}
                </div>
                <div className="border-t border-bfl-border p-3 flex items-center gap-2 justify-end">
                  <button className="btn btn-secondary text-sm" onClick={()=>setFullscreen(false)}>{t('action.close')}</button>
                  <button className="btn btn-secondary text-sm" onClick={()=>{
                    const data = structured || buildStructuredFallback();
                    const { exportToPptx, exportToNotionMarkdown } = require('../utils/export.js');
                    // 默认导出 PPTX；长按/右键可在 UI 里扩展更多选项
                    exportToPptx(data);
                  }}>导出PPTX</button>
                  <button className="btn btn-secondary text-sm" onClick={()=>{
                    const data = structured || buildStructuredFallback();
                    const { exportToNotionMarkdown } = require('../utils/export.js');
                    exportToNotionMarkdown(data);
                  }}>导出Notion(MD)</button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        ),
        document.body
      )}
    </motion.div>
  );
}
