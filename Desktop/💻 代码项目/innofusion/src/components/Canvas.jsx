import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { nanoid } from 'nanoid';
import { Bubble } from './Bubble';
import { ExplosionEffect } from './ExplosionEffect';
import { FusionMergeEffect } from './FusionMergeEffect';
import { SuggestionPanel } from './SuggestionPanel';
import { TitleExplorer } from './TitleExplorer';
import { FusionLog } from './FusionLog';
import { LeftToolbar } from './LeftToolbar';
import { ScenariosPanel } from './ScenariosPanel';
import { FloatingButtons } from './FloatingButtons';
import { ReportGenerator } from './ReportGenerator';
import { BubbleDetailPanel } from './BubbleDetailPanel';
import { KnowledgePanel } from './KnowledgePanel';
import { TopBar as OriginalTopBar } from './TopBar';
import { AgentPanel } from './AgentPanel';
import { useDrag } from '../hooks/useDrag';
import {
  canFuse,
  getFusionPosition,
  calculateRadius,
  clampPosition
} from '../utils/physics';
import { generateRandomColor, mixColors, getColorByKind } from '../utils/colors';
import { Bot, Cpu, Wand2, Send, AtSign, MousePointer2, Hand, MapPin, Minus, Plus, ArrowLeft, Save, Download } from 'lucide-react'; // Added Download
import { getSuggestions, generateExportData, generateLocalSuggestions } from '../utils/suggestions';
import { saveSession, loadSession, clearSession, popFlag, pushTitleHistory, listFavoriteTitles } from '../utils/storage';
import { useI18n } from '../i18n.jsx';
import api from '../services/api.js'; // Import our API service
import { exportToMarkdown } from '../utils/export.js'; // Import our export function
import { socket } from '../services/socket.js'; // Import our socket service

// New TopBar component for navigation
function TopBar({ onSave, isSaving, lastSaved }) {
  const { t } = useI18n();
  return (
    <div className="absolute top-4 left-4 z-20 flex items-center gap-4">
      <a href="#/workbench" className="h-10 px-4 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-white transition-colors">
        <ArrowLeft size={16} />
        {t('control.backToWorkbench', '返回工作台')}
      </a>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={onSave} className="p-2 hover:bg-gray-100 rounded-full">
          <Save size={16} className={isSaving ? 'animate-spin' : ''} />
        </button>
        <span>{isSaving ? '保存中...' : (lastSaved ? `上次保存: ${lastSaved.toLocaleTimeString()}`: '未保存')}</span>
      </div>
    </div>
  )
}

/**
 * 画布主组件
 */
export function Canvas() {
  const { t } = useI18n();
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [bubbles, setBubbles] = useState([]);
  const [fusionHistory, setFusionHistory] = useState([]);
  const [viewState, setViewState] = useState({ x: 0, y: 0, zoom: 1 });
  const [mode, setMode] = useState('select'); // 'select', 'hand'
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [showFusionLog, setShowFusionLog] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const saveTimeout = useRef(null);

  // Load project data
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const id = params.get('id');
    if (id) {
      setProjectId(id);
      const fetchProject = async () => {
        try {
          const { data } = await api.get(`/projects/${id}`);
          const { bubbles: loadedBubbles = [], fusionHistory: loadedHistory = [], viewState: loadedViewState = { x: 0, y: 0, zoom: 1 } } = data.data || {};
          setProjectName(data.name || 'Untitled Project');
          setBubbles(loadedBubbles);
          setFusionHistory(loadedHistory);
          setViewState(loadedViewState);
          setLastSaved(new Date(data.updatedAt));
        } catch (error) {
          console.error('Failed to load project', error);
          window.location.hash = '#/lab'; // Redirect if project not found or unauthorized
        }
      };
      fetchProject();

      // --- WebSocket Logic ---
      socket.connect();
      socket.emit('joinProject', id);

      const onCanvasUpdate = (updatedData) => {
        console.log('Received canvas update from server:', updatedData);
        // Here we need to be careful to not update state if we were the sender
        // A more robust implementation would include a sender socket.id
        setBubbles(updatedData.bubbles);
        setFusionHistory(updatedData.fusionHistory);
        setViewState(updatedData.viewState);
      };
      
      socket.on('canvasUpdate', onCanvasUpdate);

      return () => {
        socket.emit('leaveProject', id);
        socket.off('canvasUpdate', onCanvasUpdate);
        socket.disconnect();
      };
      // --- End WebSocket Logic ---
    }
  }, []);

  // Debounced save function
  const saveProject = useCallback(async (currentProjectId, currentName, currentBubbles, currentHistory, currentViewState) => {
    setIsSaving(true);
    const payload = {
      name: currentName,
      data: {
        bubbles: currentBubbles,
        fusionHistory: currentHistory,
        viewState: currentViewState,
      }
    };
    
    // Also emit the update to other clients in the room
    if (currentProjectId) {
      socket.emit('canvasUpdate', { projectId: currentProjectId, ...payload.data });
    }

    try {
      if (currentProjectId) {
        // Update existing project
        await api.put(`/projects/${currentProjectId}`, payload);
      } else {
        // Create new project
        const { data } = await api.post('/projects', payload);
        setProjectId(data._id);
        window.history.replaceState(null, '', `#/lab?id=${data._id}`);
        // Join the new project room
        socket.emit('joinProject', data._id);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save project', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
      saveProject(projectId, projectName, bubbles, fusionHistory, viewState);
    }, 1500); // Debounce time: 1.5 seconds

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [bubbles, fusionHistory, viewState, projectId, projectName, saveProject]);

  const handleSaveNow = () => {
     if (saveTimeout.current) clearTimeout(saveTimeout.current);
     saveProject(projectId, projectName, bubbles, fusionHistory, viewState);
  }

  // 状态管理
  const [fusionEvents, setFusionEvents] = useState([]);
  const [selectedBubbleId, setSelectedBubbleId] = useState(null);
  const [currentFusion, setCurrentFusion] = useState(null);
  const [fusing, setFusing] = useState(false);
  const fusionLockRef = useRef(false);
  const [mergeVisual, setMergeVisual] = useState(null);
  const [explosions, setExplosions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [agent, setAgent] = useState('fusion');
  const [llmModel, setLlmModel] = useState('deepseek-chat');
  const [useLibrary, setUseLibrary] = useState(false);
  const [promptSourceIds, setPromptSourceIds] = useState([]); // 参与提示词的选中气泡
  const [showReport, setShowReport] = useState(false);
  const [showTitleExplorer, setShowTitleExplorer] = useState(false);
  const [toast, setToast] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState('select'); // select | pan | mini
  const [detailBubbleId, setDetailBubbleId] = useState(null);
  const [selectionRect, setSelectionRect] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [showAgent, setShowAgent] = useState(false);
  const [forceDocViewKey, setForceDocViewKey] = useState(0);
  const [panelMode, setPanelMode] = useState('ideas'); // ideas | summary
  const [langVersion, setLangVersion] = useState(() => localStorage.getItem('lang') || 'zh');

  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // 更新画布尺寸
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  const showToast = useCallback((msg) => {
    setToast(String(msg || ''));
    if (!msg) return;
    setTimeout(() => setToast(''), 1200);
  }, []);

  useEffect(() => {
    const onAddEvidence = (e) => {
      const it = e?.detail;
      if (!it) return;
      setSelectedEvidence(prev => {
        const exists = prev.find(x => x.title === it.title && x.source_url === it.source_url);
        if (exists) return prev;
        const mapped = {
          title: it.title,
          snippet: it.text,
          source_url: it.source_url,
          publisher: it.publisher,
          date: it.date,
          channel: it.channel,
          industry: it.industry
        };
        showToast('已关联到当前创意');
        return [mapped, ...prev].slice(0, 12);
      });
    };
    window.addEventListener('bfl:add-evidence', onAddEvidence);
    return () => window.removeEventListener('bfl:add-evidence', onAddEvidence);
  }, [showToast]);

  // 监听语言切换：仅影响后续生成，不强改已有文本
  // 放在 updateBubble 定义之后，避免依赖数组触发 TDZ

  // 首次装载：可选恢复上次会话或打开模板
  useEffect(() => {
    // 新项目标记：清除存档
    if (popFlag('bfl:newProject')) {
      clearSession();
    } else {
      const session = loadSession();
      if (session) {
        setBubbles(Array.isArray(session.bubbles) ? session.bubbles : []);
        setFusionEvents(Array.isArray(session.fusionEvents) ? session.fusionEvents : []);
        setPromptInput(session.promptInput || '');
        setAgent(session.agent || 'fusion');
        setLlmModel(session.llmModel || 'deepseek-chat');
      }
    }
    if (popFlag('bfl:openTemplates')) setShowScenarios(true);
  }, []);

  // 初始化默认气泡
  useEffect(() => {
    if (bubbles.length === 0 && canvasSize.width > 0) {
      const isEn = (localStorage.getItem('lang') || 'zh') === 'en';
      const defaultBubbles = isEn
        ? [
            { text: 'Eco packaging', x: canvasSize.width * 0.3, y: canvasSize.height * 0.4 },
            { text: 'Tech vibe', x: canvasSize.width * 0.7, y: canvasSize.height * 0.4 },
            { text: 'Young users', x: canvasSize.width * 0.5, y: canvasSize.height * 0.7 }
          ]
        : [
            { text: '环保包装', x: canvasSize.width * 0.3, y: canvasSize.height * 0.4 },
            { text: '科技感', x: canvasSize.width * 0.7, y: canvasSize.height * 0.4 },
            { text: '年轻用户', x: canvasSize.width * 0.5, y: canvasSize.height * 0.7 }
          ];

      defaultBubbles.forEach(({ text, x, y }) => {
        addBubble(text, x, y);
      });
    }
  }, [canvasSize.width]);

  // 添加气泡
  const addBubble = useCallback((text, x = null, y = null, parentIds = []) => {
    const newBubble = {
      id: nanoid(),
      text,
      x: x || canvasSize.width / 2 + (Math.random() - 0.5) * 200,
      y: y || canvasSize.height / 2 + (Math.random() - 0.5) * 200,
      radius: calculateRadius(text),
      color: generateRandomColor(),
      createdAt: new Date().toISOString(),
      parentIds
    };

    // 确保位置在画布内
    const clampedPos = clampPosition(
      newBubble.x,
      newBubble.y,
      newBubble.radius,
      canvasSize.width,
      canvasSize.height
    );

    newBubble.x = clampedPos.x;
    newBubble.y = clampedPos.y;

    setBubbles(prev => [...prev, newBubble]);
    return newBubble.id;
  }, [canvasSize]);

  // 更新气泡
  const updateBubble = useCallback((id, updates) => {
    setBubbles(prev => prev.map(bubble => {
      if (bubble.id === id) {
        const updated = { ...bubble, ...updates };

        // 如果更新了文本，重新计算半径
        if (updates.text) {
          updated.radius = calculateRadius(updates.text);
        }

        // 如果更新了位置，确保在画布内
        if (updates.x !== undefined || updates.y !== undefined) {
          const clampedPos = clampPosition(
            updated.x,
            updated.y,
            updated.radius,
            canvasSize.width,
            canvasSize.height
          );
          updated.x = clampedPos.x;
          updated.y = clampedPos.y;
        }

        return updated;
      }
      return bubble;
    }));
  }, [canvasSize]);

  // 监听语言切换与重生成（依赖 updateBubble，必须在其后定义）
  useEffect(() => {
    const onStorage = () => setLangVersion(localStorage.getItem('lang') || 'zh');
    const onRegenerate = async () => {
      if (!currentFusion) return;
      const last = fusionEvents[fusionEvents.length - 1];
      if (!last) return;
      const a = bubbles.find(b => b.id === last.bubbleAId) || { text: last.title.split(' × ')[0] };
      const b = bubbles.find(b => b.id === last.bubbleBId) || { text: last.title.split(' × ')[1] };
      const suggestions = await getSuggestions(a.text, b.text, promptInput, { agent, model: (useLibrary ? 'local' : llmModel), temperature: 0.7, detail: false, language: (localStorage.getItem('lang')||'zh') });
      setCurrentFusion({ ...last, title: suggestions.title, notes: suggestions.notes, structured: suggestions.structured });
      updateBubble(last.resultBubbleId, { text: suggestions.title });
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('bfl:regenerate-current', onRegenerate);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('bfl:regenerate-current', onRegenerate);
    };
  }, [currentFusion, fusionEvents, bubbles, agent, llmModel, promptInput, updateBubble]);

  // 自动保存会话
  useEffect(() => {
    saveSession({ bubbles, fusionEvents, promptInput, agent, llmModel });
  }, [bubbles, fusionEvents, promptInput, agent, llmModel]);

  // 执行融合
  const performFusion = useCallback(async (bubbleA, bubbleB, presetSuggestions) => {
    if (fusionLockRef.current) return;
    fusionLockRef.current = true;
    const center = getFusionPosition(bubbleA, bubbleB);
    setMergeVisual({ a: { x: bubbleA.x, y: bubbleA.y, r: bubbleA.radius, color: bubbleA.color }, b: { x: bubbleB.x, y: bubbleB.y, r: bubbleB.radius, color: bubbleB.color }, center });
    // 立即移除原始两颗气泡
    setBubbles(prev => prev.filter(b => b.id !== bubbleA.id && b.id !== bubbleB.id));
    const optimisticTitle = `${bubbleA.text} × ${bubbleB.text}`;
    const newBubbleId = addBubble(optimisticTitle, center.x, center.y, [bubbleA.id, bubbleB.id]);
    try {
      setFusing(true);
      // 为新气泡添加“合成完成”高亮效果
      updateBubble(newBubbleId, { mergedHighlight: true });
      setTimeout(() => updateBubble(newBubbleId, { mergedHighlight: false }), 1200);
      const suggestions = presetSuggestions || await getSuggestions(bubbleA.text, bubbleB.text, promptInput, { agent, model: (useLibrary ? 'local' : llmModel), temperature: 0.7, detail: false, language: (localStorage.getItem('lang')||'zh') });
      updateBubble(newBubbleId, { text: suggestions.title });
      const fusionEvent = { id: nanoid(), bubbleAId: bubbleA.id, bubbleBId: bubbleB.id, resultBubbleId: newBubbleId, timestamp: new Date().toISOString(), title: suggestions.title, notes: suggestions.notes, structured: suggestions.structured };
      setFusionEvents(prev => [...prev, fusionEvent]);
      setCurrentFusion(fusionEvent);
    } finally {
      setFusing(false);
      setMergeVisual(null);
      fusionLockRef.current = false;
      if (navigator.vibrate) navigator.vibrate([30]);
    }
  }, [addBubble, updateBubble, promptInput, agent, llmModel]);

  // 拖拽相关
  const checkFusion = useCallback((draggedId, position) => {
    const draggedBubble = bubbles.find(b => b.id === draggedId);
    if (!draggedBubble) return null;

    // 更新拖拽气泡的位置（用于碰撞检测）
    const updatedDragged = { ...draggedBubble, ...position };

    // 查找可融合的气泡
    for (const bubble of bubbles) {
      // 仅在“用户拖动结束”时融合，这里只提供提示，真正融合在 onDragEnd 执行
      if (bubble.id !== draggedId && canFuse(updatedDragged, bubble)) {
        return bubble;
      }
    }

    return null;
  }, [bubbles]);

  const {
    containerRef,
    isDragging,
    draggedId,
    handlePointerDown
  } = useDrag({
    onDragStart: (id) => {
      setSelectedBubbleId(id);
    },
    onDragMove: (id, position) => {
      if (tool === 'pan') return; // 手型模式不拖动气泡
      updateBubble(id, position);
    },
    onDragEnd: (id) => {
      const draggedBubble = bubbles.find(b => b.id === id);
      const fusionTarget = checkFusion(id, { x: draggedBubble.x, y: draggedBubble.y });

      if (fusionTarget) {
        performFusion(draggedBubble, fusionTarget);
      }
    },
    getScale: () => scale
  });

  // 框选逻辑：仅空白处按下拖动
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    let selecting = false;
    let start = { x: 0, y: 0 };
    const onDown = (e) => {
      if (e.target !== el) return;
      selecting = true;
      const r = el.getBoundingClientRect();
      start = { x: e.clientX - r.left, y: e.clientY - r.top };
      setSelectionRect({ x: start.x, y: start.y, w: 0, h: 0 });
      setSelectedIds([]);
    };
    const onMove = (e) => {
      if (!selecting) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const rx = Math.min(start.x, x);
      const ry = Math.min(start.y, y);
      const rw = Math.abs(x - start.x);
      const rh = Math.abs(y - start.y);
      setSelectionRect({ x: rx, y: ry, w: rw, h: rh });
      const hits = bubbles.filter(b => b.x >= rx && b.x <= rx + rw && b.y >= ry && b.y <= ry + rh).map(b => b.id);
      setSelectedIds(hits);
    };
    const onUp = () => { selecting = false; setSelectionRect(null); };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [bubbles]);

  // 导出功能
  const handleExport = useCallback(() => {
    exportToMarkdown(projectName, bubbles, fusionHistory);
  }, [bubbles, fusionHistory, projectName]);

  // 搜索功能
  const handleSearch = useCallback((query) => {
    setSearchHighlight(query.toLowerCase());
    setTimeout(() => setSearchHighlight(''), 3000);
  }, []);

  // 选择气泡
  const handleSelectBubble = useCallback((id) => {
    setSelectedBubbleId(id);
    // 切换底部对话框的参与选择
    setPromptSourceIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      const next = [...prev, id];
      return next.slice(-2); // 最多两个参与融合
    });
    const bubble = bubbles.find(b => b.id === id);
    if (bubble && canvasRef.current) {
      // 滚动到气泡位置（如果需要）
      const rect = canvasRef.current.getBoundingClientRect();
      if (bubble.x < rect.left || bubble.x > rect.right ||
          bubble.y < rect.top || bubble.y > rect.bottom) {
        bubble.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [bubbles]);

  // 获取当前可融合的目标
  const fusionTarget = isDragging && draggedId ? checkFusion(draggedId, {
    x: bubbles.find(b => b.id === draggedId)?.x,
    y: bubbles.find(b => b.id === draggedId)?.y
  }) : null;

  return (
    <div className={`relative w-full h-full overflow-hidden ${performanceMode ? 'low-perf' : ''}`}>
      <TopBar onSave={handleSaveNow} isSaving={isSaving} lastSaved={lastSaved} />
      {/* 浅网格纸背景 */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(2,6,23,0.06)_1px,_transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* 轻量 Toast 提示 */}
      <AnimatePresence>
        {toast && (
          <motion.div className="absolute left-1/2 -translate-x-1/2 bottom-24 z-30 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 浮动按钮（右上角） */}
      <FloatingButtons
        onToggleFusionLog={() => setShowFusionLog(!showFusionLog)}
        onToggleScenarios={() => setShowScenarios(v=>!v)}
        onExport={handleExport}
      />

      {/* 案例面板 */}
      {showScenarios && <ScenariosPanel
        onLoad={(sc) => {
          // 清空当前并载入示例气泡
          setBubbles([]);
          setFusionEvents([]);
          const centerX = canvasSize.width / 2;
          const centerY = canvasSize.height / 2;
          const radius = 180;
          const createdIds = [];
          sc.bubbles.forEach((text, idx) => {
            const angle = (idx / sc.bubbles.length) * Math.PI * 2;
            const id = addBubble(text, centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
            createdIds.push(id);
          });
          // 附件预置：为指定气泡挂载附件并可选打开详情
          if (Array.isArray(sc.attachments) && sc.attachments.length) {
            setBubbles(prev => prev.map((b) => {
              const index = createdIds.indexOf(b.id);
              const found = sc.attachments.find(a => a.bubbleIndex === index);
              if (found) {
                return { ...b, attachments: (found.files || []).map((f, i) => ({
                  id: `${b.id}-att-${Date.now()}-${i}`,
                  name: f.name,
                  type: f.type || 'text/plain',
                  size: f.size || (f.textPreview ? f.textPreview.length : 0),
                  url: f.url,
                  textPreview: f.textPreview || ''
                })) };
              }
              return b;
            }));
            if (typeof sc.openDetailIndex === 'number') {
              const targetId = createdIds[sc.openDetailIndex];
              if (targetId) setDetailBubbleId(targetId);
            }
          }
          // 预填充提示词，并预选两个气泡
          setPromptInput(sc.prompt || '');
          if (Array.isArray(sc.pair)) {
            const [i1, i2] = sc.pair;
            const a = createdIds[i1];
            const b = createdIds[i2];
            if (a && b) setPromptSourceIds([a, b]);
          }
          // 预设一次融合结果：直接触发融合并展示建议
          if (sc.preset && createdIds.length >= 2) {
            const [i1, i2] = sc.pair || [0, 1];
            const aId = createdIds[i1];
            const bId = createdIds[i2];
            const a = { id: aId, text: sc.bubbles[i1], x: centerX, y: centerY };
            const b = { id: bId, text: sc.bubbles[i2], x: centerX + 40, y: centerY + 40 };
            performFusion(a, b, sc.preset);
          }
        }}
      />}

      {/* 画布 */}
      <div
        ref={(el) => {
          canvasRef.current = el;
          containerRef.current = el;
        }}
        className="absolute inset-0"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: '0 0' }}
      >
        {/* 气泡 */}
        <AnimatePresence>
          {bubbles.map(bubble => (
            <Bubble
              key={bubble.id}
              bubble={bubble}
              isDragging={isDragging && draggedId === bubble.id}
              canFuse={fusionTarget?.id === bubble.id}
              onPointerDown={handlePointerDown}
              onUpdate={updateBubble}
              onSelect={handleSelectBubble}
              isSelected={selectedBubbleId === bubble.id}
              onOpenDetail={(id) => setDetailBubbleId(id)}
            />
          ))}
        </AnimatePresence>

        {/* 爆炸效果 */}
        <AnimatePresence>
          {explosions.map(explosion => (
            <ExplosionEffect
              key={explosion.id}
              x={explosion.x}
              y={explosion.y}
              onComplete={() => {
                setExplosions(prev => prev.filter(e => e.id !== explosion.id));
              }}
            />
          ))}
        </AnimatePresence>

        {/* 框选矩形 */}
        {selectionRect && (
          <div
            className="absolute border-2 border-bfl-primary/60 bg-bfl-primary/10 rounded pointer-events-none"
            style={{ left: selectionRect.x, top: selectionRect.y, width: selectionRect.w, height: selectionRect.h }}
          />
        )}
      </div>

      {/* 右下角工具栏 */}
      <div className="absolute right-4 bottom-4 z-30 flex items-center gap-3 bg-white/90 backdrop-blur border border-bfl-border rounded-full px-3 py-2 shadow-sm">
        <button title={t('tooltip.select', '选择 (V)')} onClick={() => setTool('select')} className={`p-2 rounded-full ${tool==='select'?'bg-bfl-surface-2':''}`}>
          <MousePointer2 className="w-4 h-4 text-bfl-text" />
        </button>
        <button title={t('tooltip.pan', '移动浏览 (H 或 Space+Drag)')} onClick={() => setTool('pan')} className={`p-2 rounded-full ${tool==='pan'?'bg-bfl-surface-2':''}`}>
          <Hand className="w-4 h-4 text-bfl-text" />
        </button>
        <button title={t('tooltip.minimap', '小地图')} onClick={() => setTool('mini')} className={`p-2 rounded-full ${tool==='mini'?'bg-bfl-surface-2':''}`}>
          <MapPin className="w-4 h-4 text-bfl-text" />
        </button>
        <div className="w-px h-6 bg-bfl-border" />
        <button title={t('tooltip.zoomOut', '缩小')} onClick={() => setScale(v=>Math.max(0.2, +(v-0.1).toFixed(2)))} className="p-2 rounded-full hover:bg-bfl-surface-2">
          <Minus className="w-4 h-4 text-bfl-text" />
        </button>
        <span className="text-sm w-12 text-center text-bfl-text-dim">{Math.round(scale*100)}%</span>
        <button title={t('tooltip.zoomIn', '放大')} onClick={() => setScale(v=>Math.min(3, +(v+0.1).toFixed(2)))} className="p-2 rounded-full hover:bg-bfl-surface-2">
          <Plus className="w-4 h-4 text-bfl-text" />
        </button>
      </div>

      {/* 左侧工具条 */}
      <LeftToolbar
        onAdd={() => {
          const text = prompt(t('control.addPrompt'));
          if (text && text.trim()) addBubble(text.trim());
        }}
        onSearch={handleSearch}
        onShuffle={() => {
          setBubbles(prev => prev.map(b => ({
            ...b,
            x: Math.min(Math.max(b.radius, b.x + (Math.random() - 0.5) * 120), canvasSize.width - b.radius),
            y: Math.min(Math.max(b.radius, b.y + (Math.random() - 0.5) * 120), canvasSize.height - b.radius)
          })));
        }}
        onDeleteSelected={() => {
          if (!selectedBubbleId) return;
          setBubbles(prev => prev.filter(b => b.id !== selectedBubbleId));
          setSelectedBubbleId(null);
          setPromptSourceIds(prev => prev.filter(id => id !== selectedBubbleId));
        }}
        onSaveLayout={() => {
          const data = generateExportData(bubbles, fusionEvents);
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `bfl-layout-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
        performanceMode={performanceMode}
        onTogglePerformance={() => setPerformanceMode(!performanceMode)}
        onToggleFavorites={() => setShowFavorites(v=>!v)}
        onOpenKnowledge={() => setShowKnowledgePanel(true)}
      />

      {/* 控制栏已移除 */}

      {/* 建议面板 */}
      <AnimatePresence>
        {currentFusion && !showHistory && (
          <motion.div drag dragMomentum={false} className="absolute top-20 right-4 z-20 cursor-move">
            <SuggestionPanel
              fusion={currentFusion}
              onClose={() => setCurrentFusion(null)}
              agent={agent}
              onExecute={null}
              onOpenKnowledge={() => setShowKnowledgePanel(true)}
              onSelectTitle={async (titleText) => {
                if (!currentFusion) return;
                const baseA = bubbles.find(b => b.id === currentFusion.bubbleAId);
                const baseB = bubbles.find(b => b.id === currentFusion.bubbleBId);
                const aText = baseA?.text || currentFusion.title.split(' × ')[0] || '';
                const bText = baseB?.text || currentFusion.title.split(' × ')[1] || '';
                // 引导提示：让后端生成更结构化方案
                const guidedPrompt = `${promptInput || ''}\n请围绕选定标题生成结构化方案：${titleText}。输出字段：title/oneSentence/bigIdea/titlesTop5/hooksTop5/pipeline/assets/sellingPoints/contrarianPoints/talkTracks/mvp/milestones[{name,desc}]/kpis[{name,target}]。`;
                const suggestions = await getSuggestions(aText, bText, guidedPrompt, { agent: 'pitch', model: llmModel, temperature: 0.6, detail: true, language: (localStorage.getItem('lang')||'zh') });
                // 更新当前融合结果
                const updated = { ...currentFusion, title: suggestions.title || titleText, notes: suggestions.notes, structured: suggestions.structured };
                setCurrentFusion(updated);
                pushTitleHistory({ title: updated.title, structured: updated.structured, source: 'generated' });
                // 更新结果气泡标题
                if (currentFusion.resultBubbleId) {
                  updateBubble(currentFusion.resultBubbleId, { text: updated.title });
                }
                // 切换为摘要模式
                setPanelMode('summary');
              }}
              forceFullscreenKey={forceDocViewKey}
              mode={panelMode}
              
              onSelectIdea={null}
              onRequestFullPlan={async () => {
                if (!currentFusion) return;
                const baseA = bubbles.find(b => b.id === currentFusion.bubbleAId);
                const baseB = bubbles.find(b => b.id === currentFusion.bubbleBId);
                const aText = baseA?.text || currentFusion.title.split(' × ')[0] || '';
                const bText = baseB?.text || currentFusion.title.split(' × ')[1] || '';
                const guidedPrompt = `${promptInput || ''}\n请围绕标题生成完整结构化方案（详细字段同上，并尽量填充）：${currentFusion.title}`;
                const suggestions = await getSuggestions(aText, bText, guidedPrompt, { agent: 'pitch', model: llmModel, temperature: 0.6, detail: true, language: (localStorage.getItem('lang')||'zh') });
                const updated = { ...currentFusion, notes: suggestions.notes, structured: suggestions.structured };
                setCurrentFusion(updated);
                // 打开全屏文档
                setForceDocViewKey(v => v + 1);
              }}
              onBack={() => setPanelMode('ideas')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 标题发散二级面板 */}
      <AnimatePresence>
        {showTitleExplorer && (
          <motion.div className="absolute left-4 top-20 z-20" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <TitleExplorer
              baseTitle={currentFusion?.title || ''}
              onClose={() => setShowTitleExplorer(false)}
              onPick={async (t) => {
                setShowTitleExplorer(false);
                if (!currentFusion) return;
                const baseA = bubbles.find(b => b.id === currentFusion.bubbleAId);
                const baseB = bubbles.find(b => b.id === currentFusion.bubbleBId);
                const aText = baseA?.text || currentFusion.title.split(' × ')[0] || '';
                const bText = baseB?.text || currentFusion.title.split(' × ')[1] || '';
                const guidedPrompt = `请面向“行业/渠道/风格”三个维度扩展并围绕选定标题生成结构化方案：${t}。输出字段：title/oneSentence/bigIdea/titlesTop5/hooksTop5/pipeline/assets/sellingPoints/contrarianPoints/talkTracks/mvp/milestones[{name,desc}]/kpis[{name,target}]。`;
                const suggestions = await getSuggestions(aText, bText, guidedPrompt, { agent: 'pitch', model: llmModel, temperature: 0.6, detail: true, language: (localStorage.getItem('lang')||'zh') });
                const updated = { ...currentFusion, title: suggestions.title || t, notes: suggestions.notes, structured: suggestions.structured };
                setCurrentFusion(updated);
                if (currentFusion.resultBubbleId) updateBubble(currentFusion.resultBubbleId, { text: updated.title });
                setForceDocViewKey(v => v + 1);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 收藏创意抽屉（紧凑列表） */}
      <AnimatePresence>
        {showFavorites && (
          <motion.div className="absolute left-0 top-0 bottom-0 w-80 bg-white border-r border-bfl-border z-30 shadow-lg" initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}>
            <div className="px-3 py-2 border-b border-bfl-border flex items-center justify-between">
              <div className="text-sm font-semibold">我的收藏</div>
              <button className="text-bfl-text-dim" onClick={()=>setShowFavorites(false)}>×</button>
            </div>
            <div className="p-3 space-y-2 overflow-auto custom-scrollbar">
              {listFavoriteTitles().map(item => (
                <div key={item.title} className="flex items-center gap-2 p-2 border border-bfl-border rounded-md">
                  <div className="flex-1 text-sm truncate">{item.title}</div>
                  <button className="btn btn-primary btn-sm" onClick={async ()=>{
                    if (!currentFusion) return;
                    const baseA = bubbles.find(b => b.id === currentFusion.bubbleAId);
                    const baseB = bubbles.find(b => b.id === currentFusion.bubbleBId);
                    const aText = baseA?.text || currentFusion.title.split(' × ')[0] || '';
                    const bText = baseB?.text || currentFusion.title.split(' × ')[1] || '';
                    const guidedPrompt = `${promptInput || ''}\n请围绕选定标题生成结构化方案：${item.title}。输出字段：title/oneSentence/bigIdea/titlesTop5/hooksTop5/pipeline/assets/sellingPoints/contrarianPoints/talkTracks/mvp/milestones[{name,desc}]/kpis[{name,target}]。`;
                    const suggestions = await getSuggestions(aText, bText, guidedPrompt, { agent: 'pitch', model: llmModel, temperature: 0.6, detail: true, language: (localStorage.getItem('lang')||'zh') });
                    const updated = { ...currentFusion, title: suggestions.title || item.title, notes: suggestions.notes, structured: suggestions.structured };
                    setCurrentFusion(updated);
                    if (currentFusion?.resultBubbleId) updateBubble(currentFusion.resultBubbleId, { text: updated.title });
                    setPanelMode('summary');
                    setShowFavorites(false);
                  }}>生成</button>
                </div>
              ))}
              {listFavoriteTitles().length === 0 && (
                <div className="text-xs text-bfl-text-dim">暂无收藏，点击候选标题右侧的“☆”即可收藏。</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 知识库导入面板 */}
      <KnowledgePanel open={showKnowledgePanel} onClose={()=>setShowKnowledgePanel(false)} />
      {/* Agent 执行界面已下线：改为直接展示方案全屏文档 */}
      {fusing && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
          <div className="rounded-xl border border-bfl-border bg-white/80 backdrop-blur px-4 py-3 shadow-lg animate-pulse">
            <span className="text-sm text-bfl-text">{t('loading.fusing')}</span>
          </div>
        </div>
      )}

      {/* 历史日志 */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-96 max-w-full bg-white border-l border-bfl-border overflow-hidden flex flex-col shadow-lg"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="p-4 border-b border-bfl-border bg-bfl-surface-2">
              <h2 className="text-lg font-semibold text-bfl-text">{t('label.history')}</h2>
              <p className="text-sm text-bfl-text-dim mt-1">
                {t('label.totalFusions', '共 {count} 次融合').replace('{count}', String(fusionEvents.length))}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <FusionLog
                fusionEvents={fusionEvents}
                bubbles={bubbles}
                onSelectBubble={handleSelectBubble}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 报告生成 */}
      <ReportGenerator open={showReport} onClose={()=>setShowReport(false)} />

      {/* 气泡附件面板 */}
      <BubbleDetailPanel
        bubble={bubbles.find(b => b.id === detailBubbleId)}
        open={!!detailBubbleId}
        onClose={() => setDetailBubbleId(null)}
        onUploadFiles={(id, items) => {
          setBubbles(prev => prev.map(b => b.id === id ? { ...b, attachments: [ ...(b.attachments||[]), ...items ] } : b));
        }}
        onRemoveAttachment={(id, attId) => {
          setBubbles(prev => prev.map(b => b.id === id ? { ...b, attachments: (b.attachments||[]).filter(a => a.id !== attId) } : b));
        }}
      />
      {/* 底部对话框：图标化极简 + 顶部“选中气泡”标签区 */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-20 w-[460px] hover:w-[720px] max-w-[96vw] transition-all duration-200">
        <div className="bg-white border border-bfl-border rounded-2xl shadow-sm px-3 py-2 flex flex-col gap-2">
          {/* 顶部：选中气泡标签（丝滑切换） */}
          <LayoutGroup>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-bfl-text-dim">{t('label.about')}</span>
            <AnimatePresence initial={false}>
            {(selectedIds.length ? selectedIds : promptSourceIds).map(id => {
              const b = bubbles.find(x => x.id === id);
              if (!b) return null;
              return (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.4 }}
                  className="flex items-center gap-2 px-2 py-1 rounded-full border border-bfl-border bg-bfl-surface-2 text-sm"
                >
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: b.color }} />
                  <span className="max-w-[160px] truncate">{b.text}</span>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>
          </LayoutGroup>

          {/* 底部：控制区 */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                className={`w-9 h-9 rounded-xl border border-bfl-border bg-white hover:bg-bfl-surface-2 flex items-center justify-center ${agent==='pitch'?'ring-1 ring-bfl-primary':''}`}
                title={agent==='fusion'?'当前：Fusion-Agent（点此切到 Pitch）':'当前：Pitch-Agent（点此切到 Fusion）'}
                onClick={()=>{
                  const next = agent==='fusion'?'pitch':'fusion';
                  setAgent(next);
                  showToast(next==='pitch'?'已切到 Pitch-Agent':'已切到 Fusion-Agent');
                }}
              >
                <Bot className="w-5 h-5 text-bfl-text" />
              </button>
            </div>
            <div className="relative">
              <button
                className={`w-9 h-9 rounded-xl border border-bfl-border bg-white hover:bg-bfl-surface-2 flex items-center justify-center ${showPromptMenu?'ring-1 ring-bfl-primary':''}`}
                title="优化提示"
                onClick={()=>setShowPromptMenu(v=>!v)}
              >
                <Wand2 className="w-5 h-5 text-bfl-text" />
              </button>
              {showPromptMenu && (
                <div className="absolute left-0 bottom-full mb-2 z-30 bg-white border border-bfl-border rounded-xl shadow-lg overflow-hidden w-56">
                  <button className="block w-full text-left px-3 py-2 text-sm hover:bg-bfl-surface-2" onClick={()=>{setPromptInput('请输出四象限：卖点/反共识/最小验证/话术'); setShowPromptMenu(false);}}>四象限：卖点/反共识/最小验证/话术</button>
                  <button className="block w-full text-left px-3 py-2 text-sm hover:bg-bfl-surface-2" onClick={()=>{setPromptInput('生成1条短视频脚本：标题、三段结构、镜头设计与行动号召'); setShowPromptMenu(false);}}>短视频脚本生成</button>
                  <button className="block w-full text-left px-3 py-2 text-sm hover:bg-bfl-surface-2" onClick={()=>{setPromptInput('输出落地页骨架：首屏价值主张/利益点/社会证明/FAQ/CTA'); setShowPromptMenu(false);}}>落地页要点</button>
                </div>
              )}
            </div>

            <input
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={t('placeholder.promptOptional')}
              className="flex-1 bg-white outline-none text-bfl-text placeholder-bfl-text-dim px-2 py-2"
            />
            <div className="flex items-center gap-1 mr-2" title="Library Based">
              <AtSign className="w-4 h-4 text-yellow-500" />
              <button
                type="button"
                onClick={()=>{ setUseLibrary(v=>{ const nv = !v; showToast(nv?'库优先：本地/库规则已启用':'库优先：已关闭'); return nv; }); }}
                className="relative w-10 h-6 rounded-full focus:outline-none"
                aria-label="library based toggle"
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ backgroundColor: useLibrary ? '#3b82f6' : '#e5e7eb' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
                  animate={{ x: useLibrary ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              </button>
            </div>
            <button
              className="w-9 h-9 rounded-xl bg-bfl-primary hover:bg-bfl-primary-500 text-white flex items-center justify-center"
              disabled={(() => { const len = selectedIds.length >=2 ? 2 : promptSourceIds.length; return len < 2; })()}
              onClick={async () => {
                const pair = selectedIds.length >= 2 ? selectedIds.slice(0,2) : promptSourceIds.slice(0,2);
                if (pair.length < 2) return;
                const [aId, bId] = pair;
                const a = bubbles.find(x => x.id === aId);
                const b = bubbles.find(x => x.id === bId);
                if (a && b) {
                  await performFusion(a, b);
                  setPromptSourceIds([]);
                  setSelectedIds([]);
                  setPromptInput('');
                }
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
