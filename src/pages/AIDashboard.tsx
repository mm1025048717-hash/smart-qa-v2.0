import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { 
  Plus, 
  RefreshCw,
  FileText,
  X,
  Send,
  ChevronRight,
  Settings,
  Eye,
  Layout as LayoutIcon,
  Type,
  Link as LinkIcon,
  Square,
  HelpCircle,
  Share2,
  Maximize2,
  Minimize2,
  Code,
  Trash2,
  Download,
  CheckCircle2,
  Copy,
  Image as ImageIcon,
  FileJson,
  Search,
  Database
} from 'lucide-react';

// GridLayout 布局项类型定义
interface GridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}
import { dashboardService, DashboardItem } from '../services/dashboardService';
import { initializeExampleDashboard, createCompleteDashboardExample } from '../services/dashboardExampleData';
import { AICard } from '../components/AICard';
import { MessageBubble } from '../components/MessageBubble';
import { Message, ContentBlock } from '../types';
// 看板编辑模式不再使用预设响应和叙事生成器，使用专门的看板AI服务
import { 
  handleDashboardChat, 
  extractDashboardActions, 
  removeDashboardActionMarkers,
  executeDashboardAction,
  DashboardContext 
} from '../services/dashboardAIService';
import { parseRealtimeContent } from '../utils/realtimeParser';
import { ALL_AGENTS, getAgentById } from '../services/agents/index';
import clsx from 'clsx';

// --- 辅助组件：下拉菜单 ---
const DropdownMenu = ({ 
  trigger, 
  items, 
  onSelect 
}: { 
  trigger: React.ReactNode, 
  items: { label: string; icon: any; id: string }[], 
  onSelect: (id: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50"
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => { onSelect(item.id); setIsOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-[#0055FF] flex items-center gap-2 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 辅助组件：筛选器弹窗 ---
const FilterPopover = ({ 
  label, 
  value, 
  options, 
  onSelect 
}: { 
  label: string, 
  value: string, 
  options: string[], 
  onSelect: (val: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={popoverRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 bg-white/80 px-4 py-2.5 rounded-xl border border-[#D1D5DB]/50 text-[13px] font-bold text-[#111827] cursor-pointer hover:border-[#0055FF] transition-all group"
      >
        <span className="text-[#6B7280] uppercase tracking-wider text-[10px] whitespace-nowrap">{label}</span>
        <div className="w-[1px] h-4 bg-gray-200" />
        <span className="flex-1 truncate">{value}</span>
        <ChevronRight className={clsx("w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-90")} />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-[200] max-h-60 overflow-y-auto scrollbar-thin"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onSelect(opt); setIsOpen(false); }}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                  value === opt ? "bg-blue-50 text-[#0055FF]" : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AIDashboard = () => {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'config'>('chat');
  const [activeSettingsTab, setActiveSettingsTab] = useState<'theme' | 'add' | 'config'>('theme');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // 组件编辑状态
  const [editingBlock, setEditingBlock] = useState<{ itemId: string; blockId: string; block: ContentBlock } | null>(null);
  const [editingBlockData, setEditingBlockData] = useState<string>('');
  const [editingBlockStyle, setEditingBlockStyle] = useState<any>({});
  const [activeEditTab, setActiveEditTab] = useState<'content' | 'style'>('content');
  
  // 卡片标题编辑状态
  const [editingTitle, setEditingTitle] = useState<{ itemId: string; title: string } | null>(null);
  
  // 查看SQL状态
  const [viewingSQL, setViewingSQL] = useState<{ itemId: string; sql?: string; logicForm?: string; tokens?: string[] } | null>(null);
  
  // 指令中心状态
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  
  // 添加看板模态框状态
  const [showAddToDashboardModal, setShowAddToDashboardModal] = useState(false);
  const [addToDashboardData, setAddToDashboardData] = useState<{
    title: string;
    content: ContentBlock[];
    summary: string;
    agentName: string;
    agentId?: string;
    messageId: string;
  } | null>(null);
  const [dashboardName, setDashboardName] = useState('');
  const [dashboardShortName, setDashboardShortName] = useState('');
  const [dashboardTags, setDashboardTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  
  // 看板列表状态（暂时注释掉，等待多看板功能完善后再启用）
  // const [dashboards, setDashboards] = useState<any[]>([]);
  // const [currentDashboardId, setCurrentDashboardId] = useState<string | null>(null);
  const [showCreateDashboardModal, setShowCreateDashboardModal] = useState(false);
  
  // 筛选器状态
  const [timeRange, setTimeRange] = useState('2024.01 ~ 2025.10');
  const [region, setRegion] = useState('全部地区');

  // 视图偏好状态
  const [viewPreferences, setViewPreferences] = useState({
    showTitle: true, // 商用看板通常显示标题
    showDataSource: false, // 默认隐藏，消除“问答感”
    chartsOnly: false,
    mobileAdapt: false,
  });

  // 网格布局状态 - 支持自由拖拽和调整大小
  const [gridLayout, setGridLayout] = useState<GridLayoutItem[]>([]);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState(1200);
  const GRID_COLS = 12; // 12列网格
  const ROW_HEIGHT = 48; // [紧凑模式] 将行高从 80px 降至 48px，提供更细致的高度控制

  // 监听容器宽度变化
  useEffect(() => {
    const updateWidth = () => {
      if (gridContainerRef.current) {
        const containerWidth = gridContainerRef.current.offsetWidth;
        setGridWidth(Math.max(800, containerWidth - 32)); // 确保最小宽度，减少边距
      }
    };
    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    if (gridContainerRef.current) {
      resizeObserver.observe(gridContainerRef.current);
    }
    window.addEventListener('resize', updateWidth);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, [isFullscreen]);

  // 根据卡片内容估算合适的高度 (基于 48px 行高)
  const estimateCardHeight = (item: DashboardItem): number => {
    if (!item.content) return 4;
    const content = item.content;
    const type = content[0]?.type; // 主要判断第一个块的类型

    // [紧凑模式] 高度分配
    // 图表类
    if (content.some(b => ['line-chart', 'bar-chart', 'pie-chart', 'year-comparison'].includes(b.type))) return 7;
    
    // KPI类
    if (type === 'kpi-group') return 4;
    if (type === 'kpi') return 3;
    
    // 功能卡片类 - 使用字符串比较兼容扩展类型
    const typeStr = type as string;
    if (typeStr === 'qna') return 6; // 问答需要较高空间
    if (type === 'navigation-bar') return 3; // 导航栏较矮
    if (type === 'command-card') return 4;
    if (typeStr === 'web' || typeStr === 'iframe') return 6;
    if (type === 'text' || type === 'rich-text') return 4;
    if (typeStr === 'empty') return 3;

    return 4; // 默认
  };

  // 当items变化时，初始化或更新布局
  useEffect(() => {
    // 只在 items 真正变化（新增或删除）时才更新布局
    if (items.length > 0 && gridLayout.length === 0) {
      // 初始化布局：使用智能排版算法
      const cardAnalysis = items.map(item => {
        const content = item.content || [];
        const hasChart = content.some(b => 
          ['line-chart', 'bar-chart', 'pie-chart', 'year-comparison'].includes(b.type)
        );
        const hasKPIGroup = content.some(b => b.type === 'kpi-group');
        const hasSingleKPI = content.some(b => b.type === 'kpi') && !hasKPIGroup;
        const hasTable = content.some(b => b.type === 'table');
        const hasRegionCards = content.some(b => b.type === 'region-cards');
        
        let recommendedW = 6;
        let recommendedH = 3;
        
        if (hasChart && hasKPIGroup) {
          recommendedW = 6;
          recommendedH = 6;
        } else if (hasChart) {
          recommendedW = 6;
          recommendedH = 5;
        } else if (hasTable) {
          recommendedW = 12;
          recommendedH = 5;
        } else if (hasRegionCards) {
          recommendedW = 6;
          recommendedH = 4;
        } else if (hasKPIGroup) {
          recommendedW = 6;
          recommendedH = 4;
        } else if (hasSingleKPI) {
          recommendedW = 3;
          recommendedH = 3;
        } else {
          recommendedW = 6;
          recommendedH = 3;
        }
        
        return { item, recommendedW, recommendedH };
      });

      // 瀑布流布局
      const newLayout: GridLayoutItem[] = [];
      let currentY = 0;
      let rowItems: typeof cardAnalysis = [];
      let rowWidth = 0;

      cardAnalysis.forEach((card) => {
        if (rowWidth + card.recommendedW > GRID_COLS) {
          const maxH = Math.max(...rowItems.map(r => r.recommendedH));
          let xPos = 0;
          rowItems.forEach(rowCard => {
            newLayout.push({
              i: rowCard.item.id,
              x: xPos,
              y: currentY,
              w: rowCard.recommendedW,
              h: maxH,
              minW: 3,
              minH: 3,
              maxW: 12,
            });
            xPos += rowCard.recommendedW;
          });
          currentY += maxH;
          rowItems = [];
          rowWidth = 0;
        }
        rowItems.push(card);
        rowWidth += card.recommendedW;
      });

      // 处理最后一行
      if (rowItems.length > 0) {
        const maxH = Math.max(...rowItems.map(r => r.recommendedH));
        let xPos = 0;
        rowItems.forEach(rowCard => {
          newLayout.push({
            i: rowCard.item.id,
            x: xPos,
            y: currentY,
            w: rowCard.recommendedW,
            h: maxH,
            minW: 3,
            minH: 3,
            maxW: 12,
          });
          xPos += rowCard.recommendedW;
        });
      }

      setGridLayout(newLayout);
    } else if (items.length > gridLayout.length) {
      // 有新卡片添加
      const existingIds = new Set(gridLayout.map(l => l.i));
      const newItems = items.filter(item => !existingIds.has(item.id));
      const maxY = gridLayout.reduce((max, l) => Math.max(max, l.y + l.h), 0);
      
      const newLayouts = newItems.map((item, index) => ({
        i: item.id,
        x: (index % 2) * 6,
        y: maxY + Math.floor(index / 2) * 6,
        w: 6,
        h: estimateCardHeight(item),
        minW: 3,
        minH: 3,
        maxW: 12,
      }));
      setGridLayout(prev => [...prev, ...newLayouts]);
    }
    // 使用 items 的 ID 字符串作为依赖，避免对象引用变化导致的无限循环
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, items.map(item => item.id).join(','), gridLayout.length]);

  // 处理布局变化 - 使用 useCallback 稳定引用
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayoutChange = useCallback((newLayout: any) => {
    // 确保布局在有效范围内
    const layout = newLayout as GridLayoutItem[];
    const validLayout = layout.map(item => ({
      ...item,
      x: Math.max(0, Math.min(item.x, GRID_COLS - item.w)),
      y: Math.max(0, item.y),
      w: Math.max(item.minW || 3, Math.min(item.w, item.maxW || 12)),
      h: Math.max(item.minH || 3, item.h),
    }));
    // 使用函数式更新，避免依赖 gridLayout
    setGridLayout(prev => {
      // 只有当布局真正改变时才更新
      const prevStr = JSON.stringify(prev);
      const newStr = JSON.stringify(validLayout);
      if (prevStr !== newStr) {
        localStorage.setItem('dashboard-layout', newStr);
        return validLayout;
      }
      return prev;
    });
  }, []);

  // 重置布局
  const resetLayout = () => {
    localStorage.removeItem('dashboard-layout');
    setGridLayout([]);
  };

  // 一键应用官方示例并智能排版（用于快速获得「完整 BI 看板」效果）
  const applyExampleDashboard = () => {
    // 使用内置的完整示例数据覆盖当前看板（仅前端原型，不会影响后端）
    const exampleItems = createCompleteDashboardExample();
    setItems(exampleItems);

    // 先给一个基础全宽布局，避免闪烁，然后再调用智能排版精细布局
    const baseLayout: GridLayoutItem[] = exampleItems.map((item, index) => ({
      i: item.id,
      x: 0,
      y: index * 4,
      w: GRID_COLS,
      h: estimateCardHeight(item),
      minW: 3,
      minH: 3,
      maxW: 12,
    }));

    setGridLayout(baseLayout);

    // 下一帧再执行智能排版，确保 items 已更新
    setTimeout(() => {
      autoArrangeLayout();
    }, 0);
  };

  // AI智能排版 - Power BI 风格的全能布局
  const autoArrangeLayout = () => {
    if (items.length === 0) return;

    // 1. 分类归档
    const navCards: DashboardItem[] = [];
    const kpiCards: { item: DashboardItem; hasGroup: boolean }[] = [];
    const chartCards: { item: DashboardItem; type: string; priority: number }[] = [];
    const interactionCards: DashboardItem[] = []; // 问答、指令
    const infoCards: DashboardItem[] = []; // 文本、网页
    const otherCards: DashboardItem[] = [];

    items.forEach(item => {
      const content = item.content || [];
      const type = content[0]?.type as string;

      if (type === 'navigation-bar') {
        navCards.push(item);
      } else if (type === 'qna' || type === 'command-card') {
        interactionCards.push(item);
      } else if (type === 'text' || type === 'rich-text' || type === 'web' || type === 'iframe') {
        infoCards.push(item);
      } else if (content.some(b => ['line-chart', 'bar-chart', 'pie-chart', 'year-comparison'].includes(b.type))) {
        // 图表优先级
        const chartType = content.find(b => ['line-chart', 'bar-chart', 'pie-chart', 'year-comparison'].includes(b.type))?.type || 'bar-chart';
        const priority = chartType === 'year-comparison' ? 1 : chartType === 'line-chart' ? 2 : 3;
        chartCards.push({ item, type: chartType, priority });
      } else if (type === 'kpi-group' || type === 'region-cards') {
        kpiCards.push({ item, hasGroup: true });
      } else if (type === 'kpi') {
        kpiCards.push({ item, hasGroup: false });
      } else {
        otherCards.push(item);
      }
    });

    // 排序
    chartCards.sort((a, b) => a.priority - b.priority);

    const newLayout: GridLayoutItem[] = [];
    let currentY = 0;

    // ========== Zone 0: 顶部导航栏 (全宽) ==========
    navCards.forEach(item => {
      newLayout.push({
        i: item.id,
        x: 0,
        y: currentY,
        w: 12,
        h: 3, // 紧凑高度
        minW: 4, minH: 2
      });
      currentY += 3;
    });

    // ========== Zone 1: KPI 指标带 ==========
    if (kpiCards.length > 0) {
      let xPos = 0;
      const kpiHeight = 3; // 统一高度
      
      kpiCards.forEach((kpi) => {
        const width = kpi.hasGroup ? 6 : 3;
        if (xPos + width > GRID_COLS) {
          currentY += kpiHeight;
          xPos = 0;
        }
        newLayout.push({
          i: kpi.item.id,
          x: xPos,
          y: currentY,
          w: width,
          h: kpi.hasGroup ? 4 : 3,
          minW: 2, minH: 2
        });
        xPos += width;
      });
      if (xPos > 0) currentY += 4; // 留出最大空间
    }

    // ========== Zone 2: 核心图表区 + 右侧交互区 ==========
    // 策略：如果只有图表，就铺满；如果有交互卡片，图表占左侧 8/9 列，交互卡片占右侧 3/4 列
    
    const hasInteraction = interactionCards.length > 0;
    const mainContentWidth = hasInteraction ? 9 : 12; // 留3列给右侧边栏
    const sideContentWidth = 3;

    // 记录图表区的起始Y，用于右侧边栏对齐
    const chartStartY = currentY;
    let chartCurrentY = currentY;

    // 布局图表 (主区域)
    if (chartCards.length > 0) {
      const rowHeight = 7;
      
      if (hasInteraction) {
        // 有侧边栏模式：图表垂直堆叠或并排
        chartCards.forEach((chart) => {
          // 简单的流式逻辑，简化为垂直堆叠
          
          newLayout.push({
            i: chart.item.id,
            x: 0, // 强制左对齐堆叠，更稳健
            y: chartCurrentY,
            w: mainContentWidth, 
            h: rowHeight,
            minW: 4, minH: 4
          });
          chartCurrentY += rowHeight;
        });
      } else {
        // 无侧边栏模式：原来的全宽智能网格
        // (复用之前的逻辑，简化处理)
        chartCards.forEach((chart, index) => {
           // 偶数个图表每行2个，奇数个且是第一个则全宽
           const isFullWidth = (chartCards.length % 2 !== 0 && index === 0);
           const width = isFullWidth ? 12 : 6;
           const x = isFullWidth ? 0 : (index - (chartCards.length % 2)) % 2 * 6;
           
           if (isFullWidth || index % 2 === (chartCards.length % 2)) {
             // 新起一行
             if (index > 0) chartCurrentY += rowHeight;
           }

           newLayout.push({
             i: chart.item.id,
             x: x,
             y: chartCurrentY,
             w: width,
             h: rowHeight,
             minW: 4, minH: 4
           });
        });
        chartCurrentY += rowHeight;
      }
    }

    // 布局交互卡片 (右侧边栏 Zone)
    if (hasInteraction) {
      let sideY = chartStartY;
      interactionCards.forEach(item => {
        newLayout.push({
          i: item.id,
          x: 9, // 固定在右侧
          y: sideY,
          w: sideContentWidth,
          h: 6, // 问答卡片较高
          minW: 3, minH: 4
        });
        sideY += 6;
      });
      // 更新全局Y，取左右两侧最大值
      currentY = Math.max(chartCurrentY, sideY);
    } else {
      currentY = chartCurrentY;
    }

    // ========== Zone 3: 信息流/补充区 (底部) ==========
    const remainingCards = [...infoCards, ...otherCards];
    if (remainingCards.length > 0) {
      let xPos = 0;
      const rowHeight = 4;
      
      remainingCards.forEach(item => {
        const width = 4; // 3列布局
        if (xPos + width > GRID_COLS) {
          currentY += rowHeight;
          xPos = 0;
        }
        newLayout.push({
          i: item.id,
          x: xPos,
          y: currentY,
          w: width,
          h: rowHeight,
          minW: 3, minH: 2
        });
        xPos += width;
      });
    }

    setGridLayout(newLayout);
    localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
  };

  // 加载保存的布局
  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboard-layout');
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        // 验证布局数据的有效性
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGridLayout(parsed);
        }
      } catch (e) {
        console.error('Failed to load saved layout');
        localStorage.removeItem('dashboard-layout');
      }
    }
  }, []);

  // 高级设置状态
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState({
    cardGap: 24, // 卡片间距 (px)
    cardScale: 1.0, // 卡片缩放比例
    layoutDensity: 'normal', // 布局密度: 'compact' | 'normal' | 'spacious'
    animationSpeed: 'normal', // 动画速度: 'slow' | 'normal' | 'fast'
    autoRefresh: false, // 自动刷新
    autoRefreshInterval: 30, // 自动刷新间隔 (秒)
  });

  // 主题设置状态
  const [themeSettings, setThemeSettings] = useState({
    selectedTheme: '默认',
    themeMode: '浅色',
    chartColorScheme: 0, // 0: 蓝色, 1: 绿色, 2: 橙色
    cornerStyle: '小',
  });

  // 主题配置映射 - 蓝白为主色调
  const themeConfigs: Record<string, { bg: string; cardBg: string; text: string; accent: string; border: string }> = {
    '默认': { bg: '#F8FAFF', cardBg: '#FFFFFF', text: '#1D2129', accent: '#1664FF', border: '#E8F0FF' },
    '智能': { bg: '#F0F5FF', cardBg: '#FFFFFF', text: '#1D2129', accent: '#1664FF', border: '#D6E7FF' },
    '科技感': { bg: '#1D2129', cardBg: '#2E3238', text: '#F7F8FA', accent: '#1664FF', border: '#4E5969' },
    '财经': { bg: '#F5FFF7', cardBg: '#FFFFFF', text: '#1D2129', accent: '#00B42A', border: '#D4F5DC' },
    '深蓝': { bg: '#0E1F3D', cardBg: '#1A2F50', text: '#E8F0FF', accent: '#1664FF', border: '#2E3238' },
    '暗黑': { bg: '#17171A', cardBg: '#232324', text: '#F2F3F5', accent: '#1664FF', border: '#2E2E30' },
  };

  // 应用主题效果
  useEffect(() => {
    const config = themeConfigs[themeSettings.selectedTheme] || themeConfigs['默认'];
    document.documentElement.style.setProperty('--dashboard-bg', config.bg);
    document.documentElement.style.setProperty('--card-bg', config.cardBg);
    document.documentElement.style.setProperty('--text-primary', config.text);
    document.documentElement.style.setProperty('--accent-color', config.accent);
    document.documentElement.style.setProperty('--border-color', config.border);
    
    // 应用圆角
    const radiusMap: Record<string, string> = { '无': '0px', '小': '12px', '大': '24px' };
    document.documentElement.style.setProperty('--card-radius', radiusMap[themeSettings.cornerStyle]);
    
    // 应用图表颜色
    const chartColors = [
      ['#3B82F6', '#10B981', '#F59E0B'],
      ['#10B981', '#3B82F6', '#EF4444'],
      ['#F59E0B', '#8B5CF6', '#EC4899'],
    ];
    document.documentElement.style.setProperty('--chart-primary', chartColors[themeSettings.chartColorScheme][0]);
    document.documentElement.style.setProperty('--chart-secondary', chartColors[themeSettings.chartColorScheme][1]);
    document.documentElement.style.setProperty('--chart-accent', chartColors[themeSettings.chartColorScheme][2]);
  }, [themeSettings]);


  // 数字员工选择状态（必须在 messages 之前定义，因为 messages 的初始化依赖它）
  const [currentAgentId, setCurrentAgentId] = useState<string>('dashboard-agent');
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const currentAgent = getAgentById(currentAgentId);
  
  const [messages, setMessages] = useState<Message[]>(() => {
    return [{
      id: 'welcome',
      role: 'assistant',
      content: [{ 
        id: 't1', 
        type: 'text', 
        data: `👋 **看板编辑助手已就绪**\n\n我是您的**数字员工**，专门负责对已固定的看板进行智能编辑。\n\n## 🎯 我能帮您做什么？\n\n**📈 添加组件**\n"添加一个销售额趋势图"\n\n**🗑️ 删除组件**\n"删除第一个卡片"\n\n**✏️ 修改组件**\n"把图表标题改成..."\n\n**🔍 查询分析**\n"分析当前看板数据"\n\n**💡 智能洞察（归因分析）**\n"分析销售额下降原因"\n\n---\n\n💡 **使用说明**：\n- 这是**看板编辑模式**（路径二），与主聊天页面的**看板生成模式**（路径一）不同\n- 您可以对**已固定的看板**进行增删改查操作\n- 支持**所见即所得**的沉浸式编辑体验\n- 所有操作都会实时反映在看板上\n- 💡 **点击左上角头像可以切换不同的数字员工**` 
      }],
      status: 'complete',
      agentId: 'dashboard-agent',
      timestamp: new Date()
    }];
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const lastContentLengthRef = useRef<number>(0);

  useEffect(() => {
    // 检查是否有从主页面传递过来的添加看板数据
    const storedData = sessionStorage.getItem('addToDashboardData');
    console.log('[Dashboard] 检查 sessionStorage, storedData:', storedData);
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        console.log('[Dashboard] 解析数据成功:', data);
        // 先清除存储的数据，避免重复触发
        sessionStorage.removeItem('addToDashboardData');
        // 批量更新状态
        setAddToDashboardData(data);
        setDashboardName(data.title || '新看板');
        setDashboardShortName('');
        setDashboardTags(['AI 自动分析']);
        setTagInput('');
        // 使用 requestAnimationFrame 确保状态更新后再显示模态框
        requestAnimationFrame(() => {
          setShowAddToDashboardModal(true);
          console.log('[Dashboard] 打开添加看板模态框');
        });
      } catch (e) {
        console.error('[Dashboard] Failed to parse addToDashboardData:', e);
      }
    }

    // 检查URL参数，看是否有指定的看板ID
    const params = new URLSearchParams(window.location.search);
    const dashboardId = params.get('id');
    
    console.log('[Dashboard] 初始化, dashboardId:', dashboardId);
    
    if (dashboardId) {
      // 如果有看板ID，设置当前看板并加载该看板的项
      dashboardService.setCurrentDashboard(dashboardId);
      const dashboard = dashboardService.getCurrentDashboard();
      console.log('[Dashboard] 获取到看板:', dashboard);
      
      if (dashboard) {
        // 如果看板为空，自动初始化示例数据
        if (!dashboard.items || dashboard.items.length === 0) {
          console.log('[Dashboard] 看板为空，初始化示例数据');
          const exampleItems = initializeExampleDashboard(dashboardId);
          console.log('[Dashboard] 示例数据:', exampleItems?.length, '项', exampleItems);
          setItems(exampleItems || []);
        } else {
          console.log('[Dashboard] 加载看板数据:', dashboard.items.length, '项');
          setItems(dashboard.items);
        }
      } else {
        // 如果找不到看板，跳转回列表页
        console.log('[Dashboard] 找不到看板，跳转回列表页');
        window.location.href = '?page=dashboard';
        return;
      }
    } else {
      // 如果没有看板ID，检查是否是添加操作或有当前看板
      const addAction = params.get('add');
      const currentDashboardId = dashboardService.getCurrentDashboardId();
      
      if (addAction === 'true') {
        // 从问答页面添加卡片过来，确保有一个默认看板
        console.log('[Dashboard] 从问答页面添加卡片，初始化默认看板');
        let targetDashboardId = currentDashboardId;
        
        // 如果没有当前看板，创建一个默认看板
        if (!targetDashboardId) {
          const defaultDashboard = dashboardService.createDashboard('我的看板', '默认', ['AI 自动分析']);
          targetDashboardId = defaultDashboard.id;
          dashboardService.setCurrentDashboard(targetDashboardId);
          console.log('[Dashboard] 创建默认看板:', targetDashboardId);
        }
        
        // 加载看板数据
        dashboardService.setCurrentDashboard(targetDashboardId);
        const dashboard = dashboardService.getCurrentDashboard();
        if (dashboard) {
          setItems(dashboard.items);
        } else {
          // 如果找不到看板，使用全局items
          const currentItems = dashboardService.getItems();
          if (currentItems.length === 0) {
            initializeExampleDashboard(targetDashboardId);
          }
          setItems(dashboardService.getItems());
        }
      } else if (currentDashboardId) {
        const dashboard = dashboardService.getCurrentDashboard();
        if (dashboard) {
          setItems(dashboard.items);
        } else {
          // 如果找不到看板，使用默认的看板项
          const currentItems = dashboardService.getItems();
          if (currentItems.length === 0) {
            initializeExampleDashboard();
          }
          setItems(dashboardService.getItems());
        }
      } else {
        // 既没有URL参数也没有当前看板，跳转到列表页
        window.location.href = '?page=dashboard';
        return;
      }
    }
    
    const handleUpdate = () => {
      // 重新加载当前看板的项
      const params = new URLSearchParams(window.location.search);
      const dashboardId = params.get('id') || dashboardService.getCurrentDashboardId();
      if (dashboardId) {
        dashboardService.setCurrentDashboard(dashboardId);
        const dashboard = dashboardService.getCurrentDashboard();
        if (dashboard) {
          setItems(dashboard.items);
        }
      } else {
        setItems(dashboardService.getItems());
      }
    };
    
    const handleAddToDashboard = (e: any) => {
      console.log('[Dashboard] 收到 open-add-to-dashboard 事件:', e.detail);
      if (e.detail) {
        // 批量更新状态
        setAddToDashboardData(e.detail);
        setDashboardName(e.detail.title || '新看板');
        setDashboardShortName('');
        setDashboardTags(['AI 自动分析']);
        setTagInput('');
        // 使用 requestAnimationFrame 确保状态更新后再显示模态框
        requestAnimationFrame(() => {
          setShowAddToDashboardModal(true);
          console.log('[Dashboard] 已设置状态，准备打开模态框');
        });
      } else {
        console.error('[Dashboard] 事件数据为空:', e);
      }
    };
    
    window.addEventListener('dashboard-updated', handleUpdate);
    window.addEventListener('open-add-to-dashboard', handleAddToDashboard as any);
    
    return () => {
      window.removeEventListener('dashboard-updated', handleUpdate);
      window.removeEventListener('open-add-to-dashboard', handleAddToDashboard as any);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 自动刷新逻辑
  useEffect(() => {
    if (!advancedSettings.autoRefresh) return;
    
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => {
        setItems(dashboardService.getItems());
        setIsRefreshing(false);
      }, 1000);
    }, advancedSettings.autoRefreshInterval * 1000);

    return () => clearInterval(interval);
  }, [advancedSettings.autoRefresh, advancedSettings.autoRefreshInterval]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      status: 'complete',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    const userInput = inputValue;
    setInputValue('');
    setIsThinking(true);

    // 创建AI回复消息（流式更新）
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: Message = {
      id: aiMsgId,
      role: 'assistant',
      content: [],
      status: 'streaming',
      agentId: currentAgentId,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMsg]);

    // 构建看板上下文
    const dashboardContext: DashboardContext = {
      timeRange,
      region,
      items,
      currentAgentId: currentAgentId
    };

    let fullResponse = '';
    let parsedBlocks: ContentBlock[] = [];

    try {
      await handleDashboardChat(
        userInput,
        dashboardContext,
        // onChunk: 实时更新消息内容 - 使用节流减少闪烁
        (chunk) => {
          fullResponse += chunk;
          
          // 使用节流机制，减少更新频率
          const now = Date.now();
          if (!lastUpdateTimeRef.current) {
            lastUpdateTimeRef.current = now;
          }
          
          const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
          const contentGrowth = fullResponse.length - (lastContentLengthRef.current || 0);
          
          // 最小更新间隔：500ms，避免过于频繁的更新导致闪烁
          const UPDATE_INTERVAL = 500;
          const shouldUpdate = timeSinceLastUpdate >= UPDATE_INTERVAL || contentGrowth >= 100;
          
          if (!shouldUpdate && contentGrowth < 50) {
            return; // 跳过小更新，减少闪烁
          }
          
          // 更新引用
          lastUpdateTimeRef.current = now;
          lastContentLengthRef.current = fullResponse.length;
          
          // 解析实时内容
          const parsed = parseRealtimeContent(fullResponse);
          // 为每个块添加 id 属性
          parsedBlocks = parsed.blocks.map((block, idx) => ({
            ...block,
            id: (block as any).id || `block_${Date.now()}_${idx}`,
          })) as ContentBlock[];
          
          // 移除操作标记用于显示
          const displayContent = removeDashboardActionMarkers(fullResponse);
          
          // 更新消息
          setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId 
              ? { 
                  ...msg, 
                  content: parsedBlocks.length > 0 ? parsedBlocks : [
                    { 
                      id: `text_${Date.now()}`, 
                      type: 'text' as const, 
                      data: displayContent,
                      rendered: false
                    }
                  ]
                }
              : msg
          ));
        },
        // onComplete: 完成时处理看板操作
        (blocks) => {
          parsedBlocks = blocks;
          
          // 提取看板操作
          const actions = extractDashboardActions(fullResponse);
          console.log('[Dashboard] 提取到的操作:', actions, '完整响应:', fullResponse);
          
          if (actions.length > 0) {
            // 执行看板操作
            actions.forEach(action => {
              console.log('[Dashboard] 执行操作:', action);
              const result = executeDashboardAction(action, items);
              console.log('[Dashboard] 操作结果:', result);
              
              if (result.success && result.updatedItems) {
                setItems(result.updatedItems);
                dashboardService.updateItems(result.updatedItems);
                
                // 显示成功提示
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-[#10B981] text-white px-6 py-3 rounded-xl z-[101] text-sm font-bold shadow-xl';
                toast.innerText = `✓ ${result.message}`;
                document.body.appendChild(toast);
                setTimeout(() => {
                  toast.style.opacity = '0';
                  setTimeout(() => document.body.removeChild(toast), 300);
                }, 2000);
              } else {
                // 显示错误提示
                console.error('[Dashboard] 操作失败:', result.message);
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl z-[101] text-sm font-bold shadow-xl';
                toast.innerText = `❌ ${result.message}`;
                document.body.appendChild(toast);
                setTimeout(() => {
                  toast.style.opacity = '0';
                  setTimeout(() => document.body.removeChild(toast), 300);
                }, 2000);
              }
            });
          } else {
            console.warn('[Dashboard] 未找到看板操作标记，完整响应:', fullResponse);
          }
          
          // 移除操作标记，更新最终消息
          const displayContent = removeDashboardActionMarkers(fullResponse);
          // 确保每个块都有 id
          const finalBlocks: ContentBlock[] = parsedBlocks.length > 0 
            ? parsedBlocks.map((block, idx) => ({
                ...block,
                id: block.id || `block_${Date.now()}_${idx}`,
              }))
            : [
                { 
                  id: `text_${Date.now()}`, 
                  type: 'text' as const, 
                  data: displayContent,
                  rendered: false
                }
              ];
          
          setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId 
              ? { ...msg, content: finalBlocks, status: 'complete' as const }
              : msg
          ));
          setIsThinking(false);
        },
        // onError: 错误处理
        (error) => {
          console.error('Dashboard AI error:', error);
          setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId 
              ? { 
                  ...msg, 
                  content: [{ 
                    id: `error_${Date.now()}`, 
                    type: 'text', 
                    data: `抱歉，出现了错误：${error.message}`,
                    rendered: false
                  }], 
                  status: 'complete' 
                }
              : msg
          ));
          setIsThinking(false);
        }
      );
    } catch (error) {
      console.error('Failed to handle dashboard chat:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId 
          ? { 
              ...msg, 
              content: [{ 
                id: `error_${Date.now()}`, 
                type: 'text', 
                data: `抱歉，出现了错误：${error instanceof Error ? error.message : String(error)}`,
                rendered: false
              }], 
              status: 'complete' 
            }
          : msg
      ));
      setIsThinking(false);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    // 模拟保存逻辑
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleRemove = (id: string) => {
    dashboardService.removeItem(id);
    setItems(dashboardService.getItems());
  };

  const handleEditBlock = (itemId: string, blockId: string, block: ContentBlock) => {
    setEditingBlock({ itemId, blockId, block });
    // 初始化编辑数据 - 根据不同类型处理
    if (block.type === 'text') {
      setEditingBlockData(typeof block.data === 'string' ? block.data : JSON.stringify(block.data));
    } else if (block.type === 'rich-text') {
      setEditingBlockData(JSON.stringify(block.data, null, 2));
    } else if (block.type === 'navigation-bar' || block.type === 'command-card') {
      setEditingBlockData(JSON.stringify(block.data, null, 2));
    } else if (block.type === 'kpi' || block.type === 'kpi-group') {
      // KPI数据保持JSON格式，但会提供专门的编辑界面
      setEditingBlockData(JSON.stringify(block.data, null, 2));
    } else {
      setEditingBlockData(JSON.stringify(block.data, null, 2));
    }
    // 初始化样式数据
    setEditingBlockStyle(block.style || {});
    setActiveEditTab('content');
  };

  const handleSaveBlock = (updatedBlock: ContentBlock) => {
    if (!editingBlock) return;
    
    const item = items.find(i => i.id === editingBlock.itemId);
    if (!item) return;
    
    // 合并样式到更新后的块
    const finalBlock = {
      ...updatedBlock,
      style: editingBlockStyle
    };
    
    const updatedContent = item.content.map(b => 
      b.id === editingBlock.blockId ? finalBlock : b
    );
    
    const updatedItem = { ...item, content: updatedContent };
    dashboardService.updateItems(
      items.map(i => i.id === editingBlock.itemId ? updatedItem : i)
    );
    setItems(dashboardService.getItems());
    setEditingBlock(null);
    setEditingBlockStyle({});
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-[#10B981] text-white px-6 py-3 rounded-xl z-[100] text-sm font-bold shadow-xl animate-in fade-in slide-in-from-top-2';
    toast.innerText = '✓ 组件已更新';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  // 备用：重新排序处理（目前由 GridLayout 的拖拽自动处理）
  const _handleReorder = (newItems: DashboardItem[]) => {
    setItems(newItems);
    dashboardService.updateItems(newItems);
  };
  void _handleReorder; // 避免未使用警告

  // 导航按钮编辑状态（暂时未使用，保留用于未来功能）
  // const [editingNavButton, setEditingNavButton] = useState<{
  //   itemId: string;
  //   buttonId?: string;
  //   button?: {
  //     name: string;
  //     link: string;
  //     fixedWidth?: number;
  //     backgroundColor?: string;
  //     textColor?: string;
  //     icon?: string;
  //     visibleRoles?: string[];
  //   };
  // } | null>(null);

  const handleAddCard = (type: string) => {
    const cardTemplates: Record<string, any> = {
      '问答卡片': {
        title: 'AI 问答结果',
        content: [{ 
          id: `block_${Date.now()}`, 
          type: 'qna', 
          data: [
            { question: '2024年Q1销售情况如何？', answer: '根据数据分析，2024年Q1销售额同比增长 15.2%，达到 4475万元。' }
          ] 
        }],
      },
      '导航栏': {
        title: '快捷导航',
        content: [{ 
          id: `block_${Date.now()}`, 
          type: 'navigation-bar', 
          data: { 
            buttons: [
              { name: '销售概览', link: '#sales', color: '#1664FF' },
              { name: '库存报表', link: '#inventory' }
            ] 
          } 
        }],
      },
      '指令卡片': {
        title: '常用指令',
        content: [{ 
          id: `block_${Date.now()}`, 
          type: 'command-card', 
          data: {
            commands: [
              { label: '查询本月销售', action: 'SELECT * FROM sales WHERE month = CURRENT_MONTH' },
              { label: '导出客户列表', action: 'EXPORT clients TO CSV' }
            ]
          } 
        }],
      },
      '文本卡片': {
        title: '文本备注',
        content: [{ 
          id: `block_${Date.now()}`, 
          type: 'text', 
          data: '在此处输入您的分析结论、备注或说明...'
        }],
      },
      '网页卡片': {
        title: '外部链接',
        content: [{ 
          id: `block_${Date.now()}`, 
          type: 'web', 
          data: { url: '', title: '嵌入网页' }
        }],
      },
      '空白卡片': {
        title: '空白区域',
        content: [{ id: `block_${Date.now()}`, type: 'empty', data: {} }],
      },
    };

    const template = cardTemplates[type] || cardTemplates['空白卡片'];
    const newCard: DashboardItem = {
      id: `manual_${Date.now()}`,
      title: template.title,
      content: template.content,
      timestamp: Date.now(),
      agentName: 'System',
      tags: ['手动添加']
    };
    dashboardService.addItem(newCard);
    setItems(dashboardService.getItems());
    
    // 切换到看板配置的"添加"标签，并显示成功提示
    setActiveSidePanel('config');
    setActiveSettingsTab('add');
    
    // 成功提示动画
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-[#1664FF] text-white px-6 py-3 rounded-xl z-[100] text-sm font-bold shadow-xl animate-in fade-in slide-in-from-top-2 flex items-center gap-2';
    toast.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> ${template.title} 已添加到看板`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  const handleQuickAddCard = () => {
    handleAddCard('空白卡片');
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?page=dashboard&share=true`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-[#10B981] text-white px-6 py-3 rounded-xl z-[100] text-sm font-bold shadow-xl animate-in fade-in slide-in-from-top-2';
      toast.innerText = '✓ 分享链接已复制到剪贴板';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 2000);
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // 模拟刷新数据
    setTimeout(() => {
      setItems(dashboardService.getItems());
      setIsRefreshing(false);
      
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-[#0055FF] text-white px-6 py-3 rounded-xl z-[100] text-sm font-bold shadow-xl animate-in fade-in slide-in-from-top-2';
      toast.innerText = '✓ 看板数据已刷新';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 2000);
    }, 1000);
  };

  const handleViewPreferenceToggle = (key: keyof typeof viewPreferences) => {
    setViewPreferences(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      // 如果启用"仅看图表"，自动关闭标题和数据源
      if (key === 'chartsOnly' && updated.chartsOnly) {
        updated.showTitle = false;
        updated.showDataSource = false;
      }
      // 如果关闭"仅看图表"，可以重新显示标题
      if (key === 'chartsOnly' && !updated.chartsOnly) {
        // 保持当前状态，不自动开启
      }
      return updated;
    });
    
    // 添加视觉反馈
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-[#0055FF] text-white px-6 py-3 rounded-xl z-[100] text-sm font-bold shadow-xl animate-in fade-in slide-in-from-top-2';
    const preferenceNames: Record<string, string> = {
      showTitle: '显示标题',
      showDataSource: '显示数据源',
      chartsOnly: '仅看图表',
      mobileAdapt: '移动端适配',
    };
    toast.innerText = `✓ ${preferenceNames[key]} ${viewPreferences[key] ? '已关闭' : '已开启'}`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  const handleThemeSelect = (themeName: string) => {
    setThemeSettings(prev => ({ ...prev, selectedTheme: themeName }));
    // 应用主题到看板（这里可以添加实际的主题应用逻辑）
    document.documentElement.setAttribute('data-theme', themeName.toLowerCase());
  };

  const handleThemeModeToggle = (mode: '浅色' | '深色') => {
    setThemeSettings(prev => ({ ...prev, themeMode: mode }));
    document.documentElement.setAttribute('data-theme-mode', mode === '深色' ? 'dark' : 'light');
  };

  const handleChartColorSelect = (index: number) => {
    setThemeSettings(prev => ({ ...prev, chartColorScheme: index }));
    // 应用图表颜色方案
    const colors = [
      ['#3B82F6', '#10B981', '#F59E0B'],
      ['#10B981', '#3B82F6', '#EF4444'],
      ['#F59E0B', '#8B5CF6', '#EC4899'],
    ];
    document.documentElement.style.setProperty('--chart-primary', colors[index][0]);
    document.documentElement.style.setProperty('--chart-secondary', colors[index][1]);
    document.documentElement.style.setProperty('--chart-accent', colors[index][2]);
  };

  const handleCornerStyleSelect = (style: '无' | '小' | '大') => {
    setThemeSettings(prev => ({ ...prev, cornerStyle: style }));
    const radiusMap = { '无': '0px', '小': '12px', '大': '24px' };
    document.documentElement.style.setProperty('--card-radius', radiusMap[style]);
  };

  const handleExport = (type: string) => {
    // 模拟导出
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg z-[100] text-sm font-medium animate-in fade-in slide-in-from-top-2';
    toast.innerText = `正在导出 ${type === 'pdf' ? 'PDF' : '图片'}...`;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2000);
  };

  const handleBackToMain = () => {
    // 返回到看板目录（列表页）
    window.location.href = '?page=dashboard';
  };

  // 看板内的卡片不需要"添加"按钮，所以不实现这个回调
  // const handleAddChartToDashboard = (block: ContentBlock) => {
  //   // 看板内的卡片不需要添加到看板功能
  // };

  // 处理添加看板
  const handleConfirmAddToDashboard = () => {
    if (!addToDashboardData || !dashboardName.trim()) {
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl z-[101] text-sm font-bold shadow-xl';
      toast.innerText = '⚠️ 请输入看板名称';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 2000);
      return;
    }

    const item: DashboardItem = {
      id: `dash_${addToDashboardData.messageId}_${Date.now()}`,
      title: dashboardName,
      shortName: dashboardShortName || undefined,
      content: addToDashboardData.content,
      timestamp: Date.now(),
      agentName: addToDashboardData.agentName,
      agentId: addToDashboardData.agentId,
      summary: addToDashboardData.summary,
      tags: dashboardTags.length > 0 ? dashboardTags : ['AI 自动分析']
    };
    
    // 确保有当前看板，如果没有则创建
    let currentDashboardId = dashboardService.getCurrentDashboardId();
    if (!currentDashboardId) {
      const defaultDashboard = dashboardService.createDashboard('我的看板', '默认', ['AI 自动分析']);
      currentDashboardId = defaultDashboard.id;
      dashboardService.setCurrentDashboard(currentDashboardId);
    }
    
    // 添加到当前看板
    dashboardService.addItem(item);
    
    // 重新加载看板数据
    dashboardService.setCurrentDashboard(currentDashboardId);
    const dashboard = dashboardService.getCurrentDashboard();
    if (dashboard) {
      setItems(dashboard.items);
    } else {
      setItems(dashboardService.getItems());
    }
    
    setShowAddToDashboardModal(false);
    setAddToDashboardData(null);
    window.dispatchEvent(new CustomEvent('dashboard-updated'));
    
    // 清除URL中的add参数，避免刷新时重复触发
    const url = new URL(window.location.href);
    url.searchParams.delete('add');
    window.history.replaceState({}, '', url.toString());
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-[#10B981] text-white px-6 py-3 rounded-xl z-[101] text-sm font-bold shadow-xl animate-in fade-in slide-in-from-top-2';
    toast.innerText = `✓ 已添加 ${addToDashboardData.content.length} 个关键组件到数据看板`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  // 处理创建新看板
  const handleCreateNewDashboard = () => {
    if (!dashboardName.trim()) {
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl z-[101] text-sm font-bold shadow-xl';
      toast.innerText = '⚠️ 请输入看板名称';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 2000);
      return;
    }

    // 创建新看板（暂时注释掉状态更新，等待多看板功能完善后再启用）
    dashboardService.createDashboard(
      dashboardName,
      dashboardShortName || undefined,
      dashboardTags.length > 0 ? dashboardTags : undefined
    );
    
    // 暂时注释掉，等待多看板功能完善后再启用
    // const newDashboard = dashboardService.createDashboard(...);
    // setDashboards(dashboardService.getDashboards());
    // setCurrentDashboardId(newDashboard.id);
    setShowCreateDashboardModal(false);
    setDashboardName('');
    setDashboardShortName('');
    setDashboardTags([]);
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-[#10B981] text-white px-6 py-3 rounded-xl z-[101] text-sm font-bold shadow-xl';
    toast.innerText = `✓ 看板 "${dashboardName}" 创建成功`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  // 处理标签输入
  const handleAddTag = () => {
    if (tagInput.trim() && !dashboardTags.includes(tagInput.trim())) {
      setDashboardTags([...dashboardTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setDashboardTags(dashboardTags.filter(t => t !== tag));
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#F8FAFF] via-white to-[#F0F5FF] text-[#1D2129] font-sans flex overflow-hidden select-none">
      
      {/* 左侧：看板工作区 */}
      <div 
        className={clsx(
          "flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-thin transition-all duration-500",
          isFullscreen ? "w-full z-50 fixed inset-0" : "relative"
        )}
        style={{ 
          backgroundColor: themeConfigs[themeSettings.selectedTheme]?.bg || '#F9FAFB',
          color: themeConfigs[themeSettings.selectedTheme]?.text || '#111827',
          position: 'relative',
          overflow: 'auto', // 始终允许滚动，确保内容可见
        }}
      >
        {/* 背景网格线 - 根据主题调整 */}
        <div 
          className="absolute inset-0 bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none transition-opacity duration-500"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(themeConfigs[themeSettings.selectedTheme]?.border || '#E5E7EB')}' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: ['科技感', '深蓝', '暗黑'].includes(themeSettings.selectedTheme) ? 0.1 : 0.3,
          }}
        />
        
        {/* 顶部 Header：集成 PRD 要求的所有功能 - 全屏导航栏 */}
        <header 
          className="w-full backdrop-blur-xl px-6 py-4 border-b shadow-[0_1px_3px_rgba(22,100,255,0.06)] space-y-4 transition-all duration-500 sticky top-0 z-40"
          style={{
            backgroundColor: `${themeConfigs[themeSettings.selectedTheme]?.cardBg || 'rgba(255,255,255,0.98)'}`,
            borderColor: `${themeConfigs[themeSettings.selectedTheme]?.border || '#E8F0FF'}`,
          }}
        >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-all duration-500"
                    style={{ 
                      backgroundColor: themeConfigs[themeSettings.selectedTheme]?.accent || '#0055FF',
                      boxShadow: `0 10px 15px -3px ${themeConfigs[themeSettings.selectedTheme]?.accent || '#0055FF'}33`
                    }}
                  >H</div>
                  <div>
                    <h1 
                      className="text-xl font-black tracking-tight transition-colors duration-500"
                      style={{ color: themeConfigs[themeSettings.selectedTheme]?.text || '#111827' }}
                    >ChatBI Dashboard</h1>
                    <div className="text-[10px] font-medium tracking-wider opacity-50">v2.0 Professional</div>
                  </div>
                </div>
                
                <div 
                  className="flex p-1 rounded-xl border transition-colors duration-500"
                  style={{ 
                    backgroundColor: `${themeConfigs[themeSettings.selectedTheme]?.border || '#F3F4F6'}40`,
                    borderColor: `${themeConfigs[themeSettings.selectedTheme]?.border || '#E5E7EB'}80`,
                  }}
                >
                  <button 
                    onClick={() => setIsEditMode(false)} 
                    className={clsx("px-4 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-2 transition-all")}
                    style={{
                      backgroundColor: !isEditMode ? (themeConfigs[themeSettings.selectedTheme]?.cardBg || 'white') : 'transparent',
                      color: !isEditMode ? (themeConfigs[themeSettings.selectedTheme]?.accent || '#0055FF') : 'inherit',
                      boxShadow: !isEditMode ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" /> 阅读
                  </button>
                  <button 
                    onClick={() => setIsEditMode(true)} 
                    className={clsx("px-4 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-2 transition-all")}
                    style={{
                      backgroundColor: isEditMode ? (themeConfigs[themeSettings.selectedTheme]?.cardBg || 'white') : 'transparent',
                      color: isEditMode ? (themeConfigs[themeSettings.selectedTheme]?.accent || '#0055FF') : 'inherit',
                      boxShadow: isEditMode ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                  >
                    <Settings className="w-3.5 h-3.5" /> 编排
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                 <button 
                   onClick={handleBackToMain} 
                   className="px-4 py-2 text-[#6B7280] hover:bg-white hover:text-[#0055FF] rounded-xl transition-all border border-transparent hover:border-[#E5E7EB] text-sm font-medium" 
                   title="返回看板目录"
                 >
                   返回目录
                 </button>
                 
                 <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2.5 text-[#6B7280] hover:bg-white hover:text-[#0055FF] rounded-xl transition-all border border-transparent hover:border-[#E5E7EB]" title={isFullscreen ? "退出全屏" : "全屏预览"}>
                   {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                 </button>
                 
                 <DropdownMenu 
                   trigger={
                     <button className="p-2.5 text-[#6B7280] hover:bg-white hover:text-[#0055FF] rounded-xl transition-all border border-transparent hover:border-[#E5E7EB]" title="导出">
                       <Download className="w-5 h-5" />
                     </button>
                   }
                   items={[
                     { id: 'image', label: '导出为图片', icon: ImageIcon },
                     { id: 'pdf', label: '导出为 PDF', icon: FileText },
                     { id: 'json', label: '导出 JSON', icon: FileJson }
                   ]}
                   onSelect={handleExport}
                 />

                 <button onClick={handleShare} className="p-2.5 text-[#6B7280] hover:bg-white hover:text-[#0055FF] rounded-xl transition-all border border-transparent hover:border-[#E5E7EB]" title="分享链接">
                   <Share2 className="w-5 h-5" />
                 </button>

                 <div className="w-[1px] h-8 bg-gray-200 mx-1" />
                 
                 <button onClick={handleSave} className={clsx(
                   "px-5 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/10 active:scale-95",
                   isSaved ? "bg-[#10B981] text-white" : "bg-[#111827] text-white hover:bg-black"
                 )}>
                   {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                   {isSaved ? "已保存" : "保存看板"}
                 </button>
              </div>
            </div>

            {/* 全局筛选器区 */}
            <div className="flex items-center gap-4">
              <FilterPopover 
                label="统计周期" 
                value={timeRange} 
                options={['2024.01 ~ 2025.10', '本月', '本季度', '本年']} 
                onSelect={setTimeRange} 
              />
              <FilterPopover 
                label="分析维度" 
                value={region} 
                options={['全部地区', '华东区', '华南区', '华北区', '海外']} 
                onSelect={setRegion} 
              />
              <button 
                onClick={() => setIsRefreshing(true)}
                className="px-6 py-2.5 bg-[#0055FF] hover:bg-[#0044CC] text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                {isRefreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                执行查询
              </button>
            </div>
          </header>

        <div ref={gridContainerRef} className="w-full px-4 sm:px-6 py-6 relative z-10 flex flex-col min-h-full box-border">
          
          {/* 编辑模式提示栏 - Apple 简约风 */}
          {isEditMode && (
            <div className="mb-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                <div className="h-6 w-[2px] bg-[#1664FF] rounded-full" />
                <div>
                  <p className="text-[13px] font-semibold text-[#1D2129]">看板编辑模式</p>
                  <p className="text-[11px] text-[#86909C] tracking-tight">通过拖拽与缩放自定义您的看板布局</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={autoArrangeLayout}
                  className="px-5 py-2 text-[12px] font-medium text-white bg-[#1664FF] hover:bg-[#0E52D9] rounded-full transition-all active:scale-95 shadow-sm"
                >
                  智能排版
                </button>
                <button
                  onClick={resetLayout}
                  className="px-5 py-2 text-[12px] font-medium text-[#1D2129] bg-[#F2F3F5] hover:bg-[#E5E6EB] rounded-full transition-all active:scale-95"
                >
                  重置布局
                </button>
                <button
                  onClick={applyExampleDashboard}
                  className="px-5 py-2 text-[12px] font-medium text-[#1664FF] bg-white hover:bg-[#F2F3F5] border border-[#1664FF]/50 rounded-full transition-all active:scale-95"
                >
                  一键示例看板
                </button>
              </div>
            </div>
          )}
          
          {/* 看板网格 - 自由拖拽和调整大小 */}
          {items.length > 0 && gridLayout.length > 0 ? (
            <GridLayout
              className="layout"
              layout={gridLayout as any}
              cols={GRID_COLS}
              rowHeight={ROW_HEIGHT}
              width={gridWidth}
              onLayoutChange={handleLayoutChange as any}
              isDraggable={isEditMode}
              isResizable={isEditMode}
              draggableCancel=".ai-card-toolbar, .ai-card-toolbar *"
              margin={[16, 16] as any}
              containerPadding={[0, 0] as any}
              useCSSTransforms={true}
              compactType={"vertical" as any}
              preventCollision={false}
              isDroppable={false}
              resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n'] as any}
            >
              {items
                .filter(item => {
                  if (!item || !item.content || !Array.isArray(item.content)) return false;
                  if (viewPreferences.chartsOnly) {
                    return item.content.some(block => 
                      block && ['line-chart', 'bar-chart', 'pie-chart', 'year-comparison'].includes(block.type)
                    );
                  }
                  return true;
                })
                .map((item) => {
                  const safeContent = item.content || [];
                  const filteredItem = viewPreferences.chartsOnly 
                    ? {
                        ...item,
                        content: safeContent.filter(block => 
                          block && ['line-chart', 'bar-chart', 'pie-chart', 'year-comparison'].includes(block.type)
                        )
                      }
                    : { ...item, content: safeContent };
                  
                  return (
                    <div 
                      key={item.id}
                      className={clsx(
                        "dashboard-card relative h-full rounded-2xl overflow-hidden transition-all duration-300",
                        "bg-white border",
                        isEditMode 
                          ? "border-[#1664FF]/30 shadow-lg ring-2 ring-[#1664FF]/10" 
                          : "border-[#E8F0FF] shadow-[0_2px_8px_rgba(22,100,255,0.06)] hover:shadow-[0_4px_16px_rgba(22,100,255,0.1)] hover:border-[#1664FF]/20"
                      )}
                    >
                      {/* 拖拽手柄 - 仅编辑模式显示，不覆盖右上角按钮区域 */}
                      {isEditMode && (
                        <div className="drag-handle absolute top-0 left-0 right-16 h-10 cursor-move z-40 flex items-center justify-center group/handle bg-gradient-to-b from-[#F5F9FF]/80 to-transparent pointer-events-none">
                          <div className="w-8 h-1 bg-[#1664FF]/20 rounded-full group-hover/handle:bg-[#1664FF]/50 transition-colors pointer-events-auto" />
                        </div>
                      )}
                      <div className="h-full w-full overflow-hidden">
                        <AICard 
                          item={filteredItem} 
                          onRemove={handleRemove}
                          onEditBlock={handleEditBlock}
                          onEditTitle={(itemId: string, title: string) => setEditingTitle({ itemId, title })}
                          onAddToDashboard={undefined}
                          onExplore={(it) => { 
                            setInputValue(`深度洞察：${it.title}`); 
                            setActiveSidePanel('chat');
                            setTimeout(() => handleSendMessage(), 100);
                          }}
                          isEditMode={isEditMode}
                          viewPreferences={{
                            showTitle: viewPreferences.showTitle,
                            showDataSource: viewPreferences.showDataSource,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              }
            </GridLayout>
          ) : null}
          
          {items.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
               <div className="w-20 h-20 bg-white rounded-[24px] shadow-sm flex items-center justify-center mb-4 border border-dashed border-gray-200">
                 <LayoutIcon className="w-8 h-8 text-blue-100" />
               </div>
               <p className="font-bold text-lg text-[#111827]">暂无看板数据</p>
               <p className="text-sm mt-1">在右侧使用“添加”功能或通过 AI 问答生成</p>
            </div>
          )}
        </div>
      </div>

      {/* 右侧：侧边栏 (一级 Tab 切换结构) */}
      {!isFullscreen && (
        <div className="w-full sm:w-[350px] lg:w-[400px] bg-white border-l border-[#EAECF0] flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.02)] z-30 flex-shrink-0">
          
          {/* 顶部一级导航 Tab */}
          <div className="flex border-b border-gray-100 bg-white px-2 pt-2">
            {[
              { id: 'chat', label: '智能问答', icon: Search },
              { id: 'config', label: '看板配置', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSidePanel(tab.id as 'chat' | 'config')}
                className={clsx(
                  "flex-1 py-3 text-[13px] font-bold flex items-center justify-center gap-2 transition-all rounded-t-xl relative overflow-hidden",
                  activeSidePanel === tab.id 
                    ? "text-[#0055FF] bg-blue-50/30" 
                    : "text-[#6B7280] hover:text-[#111827] hover:bg-gray-50"
                )}
              >
                {activeSidePanel === tab.id && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute top-0 left-0 right-0 h-0.5 bg-[#0055FF]" 
                  />
                )}
                <tab.icon className={clsx("w-4 h-4", activeSidePanel === tab.id ? "text-[#0055FF]" : "text-gray-400")} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden relative bg-[#FAFAFA]">
            <AnimatePresence mode="wait">
              {/* Tab 1: 智能问答 (全屏高度) */}
              {activeSidePanel === 'chat' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute inset-0 flex flex-col bg-white"
                >
                  {/* 问答顶部栏 */}
                  <div className="px-5 py-3 flex items-center justify-between border-b border-gray-50 bg-white/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* 数字员工头像 */}
                      <div className="relative">
                        <div 
                          className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#0055FF]/20 transition-all"
                          onClick={() => setShowAgentSelector(!showAgentSelector)}
                          title="切换数字员工"
                        >
                          {currentAgent.avatar ? (
                            <img src={currentAgent.avatar} alt={currentAgent.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <div className="w-2.5 h-2.5 bg-[#0055FF] rounded-full animate-pulse shadow-[0_0_10px_rgba(0,85,255,0.5)]" />
                          )}
                        </div>
                        {/* 数字员工选择下拉菜单 */}
                        <AnimatePresence>
                          {showAgentSelector && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-[400px] overflow-y-auto"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                选择数字员工
                              </div>
                              {ALL_AGENTS.map((agent) => (
                                <button
                                  key={agent.id}
                                  onClick={() => {
                                    setCurrentAgentId(agent.id);
                                    setShowAgentSelector(false);
                                    // 清空对话历史，重新开始
                                    setMessages([{
                                      id: 'welcome',
                                      role: 'assistant',
                                      content: [{ 
                                        id: 't1', 
                                        type: 'text', 
                                        data: `👋 **${agent.name}已就绪**\n\n我是${agent.name}，${agent.title}。我可以帮您对已固定的看板进行智能编辑。\n\n## 🎯 我能帮您做什么？\n\n**📈 添加组件**\n"添加一个销售额趋势图"\n\n**🗑️ 删除组件**\n"删除第一个卡片"\n\n**✏️ 修改组件**\n"把图表标题改成..."\n\n**🔍 查询分析**\n"分析当前看板数据"\n\n**💡 智能洞察（归因分析）**\n"分析销售额下降原因"\n\n---\n\n💡 **使用说明**：\n- 这是**看板编辑模式**（路径二），与主聊天页面的**看板生成模式**（路径一）不同\n- 您可以对**已固定的看板**进行增删改查操作\n- 支持**所见即所得**的沉浸式编辑体验` 
                                      }],
                                      status: 'complete',
                                      agentId: agent.id,
                                      timestamp: new Date()
                                    }]);
                                  }}
                                  className={clsx(
                                    "w-full px-3 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors",
                                    currentAgentId === agent.id && "bg-blue-50"
                                  )}
                                >
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                                    {agent.avatar ? (
                                      <img src={agent.avatar} alt={agent.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                      <div className="w-2.5 h-2.5 bg-[#0055FF] rounded-full" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-bold text-[#111827] truncate">{agent.name}</div>
                                    <div className="text-[10px] text-gray-400 truncate">{agent.title}</div>
                                  </div>
                                  {currentAgentId === agent.id && (
                                    <div className="w-2 h-2 bg-[#0055FF] rounded-full flex-shrink-0" />
                                  )}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-[13px] text-[#111827] truncate">{currentAgent.name} • 看板编辑</h3>
                        <p className="text-[10px] text-gray-400 truncate">{currentAgent.title} • 编辑模式</p>
                      </div>
                    </div>
                    {/* 点击外部关闭下拉菜单 */}
                    {showAgentSelector && (
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowAgentSelector(false)}
                      />
                    )}
                    <div className="flex gap-1">
                      <button 
                        onClick={() => {
                          setMessages([{
                            id: 'welcome',
                            role: 'assistant',
                            content: [{ 
                              id: 't1', 
                              type: 'text', 
                              data: `👋 **${currentAgent.name}已就绪**\n\n我是${currentAgent.name}，${currentAgent.title}。我可以帮您对已固定的看板进行智能编辑。` 
                            }],
                            status: 'complete',
                            agentId: currentAgentId,
                            timestamp: new Date()
                          }]);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                        title="清空对话"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="帮助">
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* 消息列表区 */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFB]/50 scrollbar-thin">
                     {messages.map((msg) => (
                       <MessageBubble 
                         key={msg.id} 
                         message={msg} 
                         onActionSelect={setInputValue}
                       />
                     ))}
                     {isThinking && (
                       <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium ml-10">
                         <div className="flex gap-1">
                           <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                           <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                           <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                         </div>
                         <span className="text-gray-300">正在思考...</span>
                       </div>
                     )}
                     <div ref={chatEndRef} />
                  </div>

                  {/* 底部输入区 */}
                  <div className="p-4 bg-white border-t border-gray-100">
                    <form onSubmit={handleSendMessage} className="relative group">
                      <input 
                        type="text" 
                        value={inputValue} 
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="输入分析指令，如：本月销售额趋势..." 
                        className="w-full pl-5 pr-12 py-3.5 bg-[#F3F4F6] border-2 border-transparent rounded-[20px] text-[13px] font-medium outline-none focus:bg-white focus:border-[#0055FF]/20 focus:shadow-[0_4px_20px_rgba(0,85,255,0.08)] transition-all placeholder:text-gray-400"
                      />
                      <button 
                        type="submit" 
                        disabled={!inputValue.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#0055FF] text-white rounded-xl shadow-lg shadow-blue-500/30 active:scale-90 transition-all hover:bg-[#0044CC] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                    <p className="text-[10px] text-center text-gray-300 mt-2 font-medium">AI 可能会产生错误，请核对重要数据</p>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: 看板配置 (全屏高度) */}
              {activeSidePanel === 'config' && (
                <motion.div 
                  key="config"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute inset-0 flex flex-col bg-[#FAFAFA]"
                >
                  {/* 胶囊式二级 Tab */}
                  <div className="px-5 py-4 bg-white border-b border-gray-50">
                    <div className="flex bg-[#F3F4F6] p-1 rounded-full">
                      {[
                        { id: 'theme', label: '主题' },
                        { id: 'add', label: '添加' },
                        { id: 'config', label: '设置' },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveSettingsTab(tab.id as any)}
                          className={clsx(
                            "flex-1 py-2 text-[12px] font-bold rounded-full transition-all",
                            activeSettingsTab === tab.id 
                              ? "bg-white text-[#0055FF] shadow-sm" 
                              : "text-[#6B7280] hover:text-[#111827]"
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4 scrollbar-thin">
                    <AnimatePresence mode="wait">
                       {/* 这里复用原本的配置内容代码，保持不变 */}
                       {activeSettingsTab === 'theme' && (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                           {/* 仪表板主题 - 大色块预览 */}
                           <div className="space-y-3">
                             <div className="flex items-center justify-between">
                               <h4 className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest">仪表板主题</h4>
                               <span className="text-[10px] text-[#0055FF] font-medium">官方</span>
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                               {[
                                 { name: '默认', bgTop: '#FFFFFF', bgBot: '#F9FAFB', accent: '#0055FF', selected: themeSettings.selectedTheme === '默认' },
                                 { name: '智能', bgTop: '#EFF6FF', bgBot: '#DBEAFE', accent: '#3B82F6', selected: themeSettings.selectedTheme === '智能' },
                                 { name: '科技感', bgTop: '#1E293B', bgBot: '#0F172A', accent: '#38BDF8', selected: themeSettings.selectedTheme === '科技感', dark: true },
                                 { name: '财经', bgTop: '#F0FDF4', bgBot: '#DCFCE7', accent: '#22C55E', selected: themeSettings.selectedTheme === '财经' },
                                 { name: '深蓝', bgTop: '#1E3A5F', bgBot: '#0C2340', accent: '#60A5FA', selected: themeSettings.selectedTheme === '深蓝', dark: true },
                                 { name: '暗黑', bgTop: '#18181B', bgBot: '#09090B', accent: '#FAFAFA', selected: themeSettings.selectedTheme === '暗黑', dark: true },
                               ].map(theme => (
                                 <div 
                                   key={theme.name} 
                                   onClick={() => handleThemeSelect(theme.name)}
                                   className={clsx(
                                     "relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
                                     theme.selected ? "border-[#0055FF] ring-4 ring-blue-500/10" : "border-transparent hover:border-[#D1D5DB]"
                                   )}
                                 >
                                   <div className="h-[72px] relative" style={{ background: `linear-gradient(to bottom, ${theme.bgTop}, ${theme.bgBot})` }}>
                                     {/* 模拟卡片 */}
                                     <div className="absolute top-2 left-2 right-2 h-8 bg-white/80 rounded-lg shadow-sm" style={{ backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)' }} />
                                     <div className="absolute bottom-2 left-2 w-8 h-1 rounded-full" style={{ backgroundColor: theme.accent }} />
                                   </div>
                                   <div className="py-2 px-3 bg-white border-t border-[#F3F4F6]">
                                     <span className="text-[11px] font-bold text-[#374151]">{theme.name}</span>
                                   </div>
                                   {theme.selected && (
                                     <div className="absolute top-2 right-2 w-5 h-5 bg-[#0055FF] rounded-full flex items-center justify-center">
                                       <CheckCircle2 className="w-3 h-3 text-white" />
                                     </div>
                                   )}
                                 </div>
                               ))}
                             </div>
                           </div>

                           {/* 全局样式 */}
                           <div className="space-y-3 pt-2">
                             <h4 className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest">全局样式</h4>
                             <div className="bg-white rounded-2xl border border-[#E5E7EB] divide-y divide-[#F3F4F6]">
                               <div className="p-4 flex items-center justify-between">
                                 <span className="text-[12px] font-bold text-[#374151]">主题模式</span>
                                 <div className="flex bg-[#F3F4F6] p-0.5 rounded-lg text-[10px] font-bold">
                                   <button 
                                     onClick={() => handleThemeModeToggle('浅色')}
                                     className={clsx("px-3 py-1 rounded-md transition-all", themeSettings.themeMode === '浅色' ? "bg-white text-[#0055FF] shadow-sm" : "text-[#6B7280] hover:text-[#111827]")}
                                   >
                                     浅色
                                   </button>
                                   <button 
                                     onClick={() => handleThemeModeToggle('深色')}
                                     className={clsx("px-3 py-1 rounded-md transition-all", themeSettings.themeMode === '深色' ? "bg-white text-[#0055FF] shadow-sm" : "text-[#6B7280] hover:text-[#111827]")}
                                   >
                                     深色
                                   </button>
                                 </div>
                               </div>
                               <div className="p-4 flex items-center justify-between">
                                 <span className="text-[12px] font-bold text-[#374151]">图表色系</span>
                                 <div className="flex gap-1.5">
                                   {['#3B82F6', '#10B981', '#F59E0B'].map((c, i) => (
                                     <button
                                       key={i}
                                       onClick={() => handleChartColorSelect(i)}
                                       className={clsx(
                                         "w-5 h-5 rounded-full border-2 transition-all hover:scale-110 active:scale-95",
                                         themeSettings.chartColorScheme === i ? "border-[#0055FF] ring-2 ring-blue-500/30" : "border-transparent hover:border-gray-300"
                                       )}
                                       style={{ backgroundColor: c }}
                                     />
                                   ))}
                                 </div>
                               </div>
                               <div className="p-4 flex items-center justify-between">
                                 <span className="text-[12px] font-bold text-[#374151]">圆角风格</span>
                                 <div className="flex bg-[#F3F4F6] p-0.5 rounded-lg text-[10px] font-bold">
                                   {(['无', '小', '大'] as const).map(style => (
                                     <button
                                       key={style}
                                       onClick={() => handleCornerStyleSelect(style)}
                                       className={clsx(
                                         "px-2.5 py-1 rounded-md transition-all",
                                         themeSettings.cornerStyle === style ? "bg-white text-[#0055FF] shadow-sm" : "text-[#6B7280] hover:text-[#111827]"
                                       )}
                                     >
                                       {style}
                                     </button>
                                   ))}
                                 </div>
                               </div>
                             </div>
                           </div>
                         </motion.div>
                       )}

                       {activeSettingsTab === 'add' && (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                           <h4 className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest">添加模块</h4>
                           <div className="grid grid-cols-2 gap-3">
                             {[
{ icon: FileText, label: '问答卡片', color: 'bg-blue-50 text-[#0055FF]' },
                              { icon: LayoutIcon, label: '导航栏', color: 'bg-slate-50 text-slate-600' },
                               { icon: Code, label: '指令卡片', color: 'bg-purple-50 text-purple-600' },
                               { icon: Type, label: '文本卡片', color: 'bg-amber-50 text-amber-600' },
                               { icon: LinkIcon, label: '网页卡片', color: 'bg-emerald-50 text-emerald-600' },
                               { icon: Square, label: '空白卡片', color: 'bg-gray-50 text-gray-500' },
                             ].map(card => (
                               <button 
                                 key={card.label} 
                                 onClick={() => handleAddCard(card.label)}
                                 className="p-5 bg-white border border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[#0055FF] hover:shadow-lg hover:shadow-blue-500/5 transition-all group active:scale-[0.97]"
                               >
                                 <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", card.color)}>
                                   <card.icon className="w-5 h-5" />
                                 </div>
                                 <span className="text-[12px] font-bold text-[#374151]">{card.label}</span>
                               </button>
                             ))}
                           </div>
                         </motion.div>
                       )}

                       {activeSettingsTab === 'config' && (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                           <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                  <h4 className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest">快捷操作</h4>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                  <button 
                                    onClick={handleQuickAddCard}
                                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border text-[#0055FF] bg-blue-50 border-blue-100 transition-all hover:shadow-md hover:bg-blue-100 active:scale-95"
                                  >
                                      <Plus className="w-5 h-5" />
                                      <span className="text-[10px] font-bold">加卡片</span>
                                  </button>
                                  <button 
                                    onClick={handleShare}
                                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border text-gray-600 bg-white border-[#E5E7EB] transition-all hover:shadow-md hover:bg-gray-50 active:scale-95"
                                  >
                                      <Share2 className="w-5 h-5" />
                                      <span className="text-[10px] font-bold">分享</span>
                                  </button>
                                  <button 
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className={clsx(
                                      "flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border text-gray-600 bg-white border-[#E5E7EB] transition-all hover:shadow-md hover:bg-gray-50 active:scale-95",
                                      isRefreshing && "opacity-50 cursor-not-allowed"
                                    )}
                                  >
                                      <RefreshCw className={clsx("w-5 h-5", isRefreshing && "animate-spin")} />
                                      <span className="text-[10px] font-bold">{isRefreshing ? '刷新中' : '刷新'}</span>
                                  </button>
                              </div>
                           </div>

                           <div className="space-y-3">
                             <h4 className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest">视图偏好</h4>
                             <div className="grid grid-cols-2 gap-3">
                               <button 
                                 onClick={() => handleViewPreferenceToggle('showTitle')}
                                 className={clsx(
                                   "px-4 py-3 rounded-2xl border flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]",
                                   viewPreferences.showTitle ? "bg-blue-50 border-[#0055FF] text-[#0055FF]" : "bg-white border-[#E5E7EB] text-gray-600 hover:border-gray-300"
                                 )}
                               >
                                 <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center transition-colors", viewPreferences.showTitle ? "bg-white" : "bg-gray-100")}>
                                    <Type className="w-4 h-4" />
                                 </div>
                                 <div className="flex flex-col items-start">
                                    <span className="text-[11px] font-bold">显示标题</span>
                                    <span className="text-[9px] opacity-60">{viewPreferences.showTitle ? '已开启' : '已关闭'}</span>
                                 </div>
                               </button>
                               <button 
                                 onClick={() => handleViewPreferenceToggle('showDataSource')}
                                 className={clsx(
                                   "px-4 py-3 rounded-2xl border flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]",
                                   viewPreferences.showDataSource ? "bg-blue-50 border-[#0055FF] text-[#0055FF]" : "bg-white border-[#E5E7EB] text-gray-600 hover:border-gray-300"
                                 )}
                               >
                                 <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center transition-colors", viewPreferences.showDataSource ? "bg-white" : "bg-gray-100")}>
                                    <Database className="w-4 h-4" />
                                 </div>
                                 <div className="flex flex-col items-start">
                                    <span className="text-[11px] font-bold">显示数据源</span>
                                    <span className="text-[9px] opacity-60">{viewPreferences.showDataSource ? '已开启' : '已关闭'}</span>
                                 </div>
                               </button>
                               <button 
                                 onClick={() => handleViewPreferenceToggle('chartsOnly')}
                                 className={clsx(
                                   "px-4 py-3 rounded-2xl border flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]",
                                   viewPreferences.chartsOnly ? "bg-blue-50 border-[#0055FF] text-[#0055FF]" : "bg-white border-[#E5E7EB] text-gray-600 hover:border-gray-300"
                                 )}
                               >
                                 <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center transition-colors", viewPreferences.chartsOnly ? "bg-white" : "bg-gray-100")}>
                                    <ImageIcon className="w-4 h-4" />
                                 </div>
                                 <div className="flex flex-col items-start">
                                    <span className="text-[11px] font-bold">仅看图表</span>
                                    <span className="text-[9px] opacity-60">{viewPreferences.chartsOnly ? '已开启' : '已关闭'}</span>
                                 </div>
                               </button>
                               <button 
                                 onClick={() => handleViewPreferenceToggle('mobileAdapt')}
                                 className={clsx(
                                   "px-4 py-3 rounded-2xl border flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]",
                                   viewPreferences.mobileAdapt ? "bg-blue-50 border-[#0055FF] text-[#0055FF]" : "bg-white border-[#E5E7EB] text-gray-600 hover:border-gray-300"
                                 )}
                               >
                                 <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center transition-colors", viewPreferences.mobileAdapt ? "bg-white" : "bg-gray-100")}>
                                    <LayoutIcon className="w-4 h-4" />
                                 </div>
                                 <div className="flex flex-col items-start">
                                    <span className="text-[11px] font-bold">移动端适配</span>
                                    <span className="text-[9px] opacity-60">{viewPreferences.mobileAdapt ? '已开启' : '已关闭'}</span>
                                 </div>
                               </button>
                             </div>
                           </div>

                           <div className="pt-2">
                              <button 
                                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                                className="w-full py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-[11px] font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                              >
                                  <Settings className={clsx("w-4 h-4 transition-transform", showAdvancedSettings && "rotate-90")} />
                                  展开更多高级设置
                              </button>
                           </div>

                           {/* 高级设置面板 */}
                           <AnimatePresence>
                             {showAdvancedSettings && (
                               <motion.div
                                 initial={{ opacity: 0, height: 0 }}
                                 animate={{ opacity: 1, height: 'auto' }}
                                 exit={{ opacity: 0, height: 0 }}
                                 transition={{ duration: 0.3 }}
                                 className="overflow-hidden"
                               >
                                 <div className="pt-4 space-y-4 border-t border-gray-200 mt-4">
                                   <h4 className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest">布局设置</h4>
                                   
                                   {/* 卡片间距 */}
                                   <div className="space-y-2">
                                     <div className="flex items-center justify-between">
                                       <span className="text-[12px] font-bold text-gray-700">卡片间距</span>
                                       <span className="text-[11px] text-gray-500">{advancedSettings.cardGap}px</span>
                                     </div>
                                     <input
                                       type="range"
                                       min="12"
                                       max="48"
                                       step="4"
                                       value={advancedSettings.cardGap}
                                       onChange={(e) => setAdvancedSettings(prev => ({ ...prev, cardGap: parseInt(e.target.value) }))}
                                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0055FF]"
                                     />
                                     <div className="flex justify-between text-[9px] text-gray-400">
                                       <span>紧凑</span>
                                       <span>宽松</span>
                                     </div>
                                   </div>

                                   {/* 卡片缩放 */}
                                   <div className="space-y-2">
                                     <div className="flex items-center justify-between">
                                       <span className="text-[12px] font-bold text-gray-700">卡片大小</span>
                                       <span className="text-[11px] text-gray-500">{Math.round(advancedSettings.cardScale * 100)}%</span>
                                     </div>
                                     <input
                                       type="range"
                                       min="0.8"
                                       max="1.2"
                                       step="0.05"
                                       value={advancedSettings.cardScale}
                                       onChange={(e) => setAdvancedSettings(prev => ({ ...prev, cardScale: parseFloat(e.target.value) }))}
                                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0055FF]"
                                     />
                                     <div className="flex justify-between text-[9px] text-gray-400">
                                       <span>缩小</span>
                                       <span>放大</span>
                                     </div>
                                   </div>

                                   {/* 布局密度 */}
                                   <div className="space-y-2">
                                     <span className="text-[12px] font-bold text-gray-700">布局密度</span>
                                     <div className="grid grid-cols-3 gap-2">
                                       {(['compact', 'normal', 'spacious'] as const).map((density) => (
                                         <button
                                           key={density}
                                           onClick={() => setAdvancedSettings(prev => ({ ...prev, layoutDensity: density }))}
                                           className={clsx(
                                             "py-2 px-3 rounded-xl text-[11px] font-bold transition-all",
                                             advancedSettings.layoutDensity === density
                                               ? "bg-[#0055FF] text-white"
                                               : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                           )}
                                         >
                                           {density === 'compact' ? '紧凑' : density === 'normal' ? '标准' : '宽松'}
                                         </button>
                                       ))}
                                     </div>
                                   </div>

                                   <h4 className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest pt-2">动画设置</h4>
                                   
                                   {/* 动画速度 */}
                                   <div className="space-y-2">
                                     <span className="text-[12px] font-bold text-gray-700">动画速度</span>
                                     <div className="grid grid-cols-3 gap-2">
                                       {(['slow', 'normal', 'fast'] as const).map((speed) => (
                                         <button
                                           key={speed}
                                           onClick={() => setAdvancedSettings(prev => ({ ...prev, animationSpeed: speed }))}
                                           className={clsx(
                                             "py-2 px-3 rounded-xl text-[11px] font-bold transition-all",
                                             advancedSettings.animationSpeed === speed
                                               ? "bg-[#0055FF] text-white"
                                               : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                           )}
                                         >
                                           {speed === 'slow' ? '慢速' : speed === 'normal' ? '标准' : '快速'}
                                         </button>
                                       ))}
                                     </div>
                                   </div>

                                   <h4 className="text-[11px] font-black text-[#9CA3AF] uppercase tracking-widest pt-2">自动刷新</h4>
                                   
                                   {/* 自动刷新开关 */}
                                   <div className="flex items-center justify-between py-2">
                                     <span className="text-[12px] font-bold text-gray-700">启用自动刷新</span>
                                     <button
                                       onClick={() => setAdvancedSettings(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
                                       className={clsx(
                                         "relative w-11 h-6 rounded-full transition-colors",
                                         advancedSettings.autoRefresh ? "bg-[#0055FF]" : "bg-gray-300"
                                       )}
                                     >
                                       <motion.div
                                         className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                                         animate={{ x: advancedSettings.autoRefresh ? 20 : 0 }}
                                         transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                       />
                                     </button>
                                   </div>

                                   {/* 刷新间隔 */}
                                   {advancedSettings.autoRefresh && (
                                     <motion.div
                                       initial={{ opacity: 0, height: 0 }}
                                       animate={{ opacity: 1, height: 'auto' }}
                                       exit={{ opacity: 0, height: 0 }}
                                       className="space-y-2"
                                     >
                                       <div className="flex items-center justify-between">
                                         <span className="text-[12px] font-bold text-gray-700">刷新间隔</span>
                                         <span className="text-[11px] text-gray-500">{advancedSettings.autoRefreshInterval}秒</span>
                                       </div>
                                       <input
                                         type="range"
                                         min="10"
                                         max="120"
                                         step="10"
                                         value={advancedSettings.autoRefreshInterval}
                                         onChange={(e) => setAdvancedSettings(prev => ({ ...prev, autoRefreshInterval: parseInt(e.target.value) }))}
                                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0055FF]"
                                       />
                                       <div className="flex justify-between text-[9px] text-gray-400">
                                         <span>10秒</span>
                                         <span>120秒</span>
                                       </div>
                                     </motion.div>
                                   )}
                                 </div>
                               </motion.div>
                             )}
                           </AnimatePresence>
                         </motion.div>
                       )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 组件编辑模态框 */}
      {editingBlock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setEditingBlock(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* 模态框头部 */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">编辑组件</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingBlock.block.type === 'kpi' && 'KPI 指标'}
                  {editingBlock.block.type === 'text' && '文本内容'}
                  {(editingBlock.block.type === 'line-chart' || editingBlock.block.type === 'bar-chart' || editingBlock.block.type === 'pie-chart') && '图表'}
                  {editingBlock.block.type === 'kpi-group' && 'KPI 组'}
                  {editingBlock.block.type === 'navigation-bar' && '导航栏'}
                  {editingBlock.block.type === 'command-card' && '指令卡片'}
                  {editingBlock.block.type === 'rich-text' && '富文本'}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingBlock(null);
                  setEditingBlockStyle({});
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tab 导航 */}
            <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setActiveEditTab('content')}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  activeEditTab === 'content' 
                    ? "bg-[#0055FF] text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                内容编辑
              </button>
              <button
                onClick={() => setActiveEditTab('style')}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  activeEditTab === 'style' 
                    ? "bg-[#0055FF] text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                个性化设计
              </button>
            </div>

            {/* 编辑内容区域 */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {activeEditTab === 'content' && (
                <>
                  {/* 文本组件 - 富文本编辑 */}
                  {editingBlock.block.type === 'text' && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">文本内容</label>
                      <textarea
                        value={editingBlockData}
                        onChange={(e) => setEditingBlockData(e.target.value)}
                        className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none resize-none text-sm leading-relaxed"
                        placeholder="输入文本内容..."
                      />
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>💡 提示：支持多行文本，会自动换行显示</span>
                      </div>
                    </div>
                  )}
                  
                  {/* KPI组件 - 专门的字段编辑 */}
                  {editingBlock.block.type === 'kpi' && (() => {
                    try {
                      const kpiData = JSON.parse(editingBlockData || '{}');
                      return (
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-gray-700">指标名称</label>
                              <input
                                type="text"
                                value={kpiData.label || ''}
                                onChange={(e) => {
                                  const updated = { ...kpiData, label: e.target.value };
                                  setEditingBlockData(JSON.stringify(updated, null, 2));
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                                placeholder="例如：销售额"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-gray-700">数值</label>
                              <input
                                type="number"
                                value={kpiData.value || ''}
                                onChange={(e) => {
                                  const updated = { ...kpiData, value: parseFloat(e.target.value) || 0 };
                                  setEditingBlockData(JSON.stringify(updated, null, 2));
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                                placeholder="例如：2500"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-gray-700">单位</label>
                              <input
                                type="text"
                                value={kpiData.unit || ''}
                                onChange={(e) => {
                                  const updated = { ...kpiData, unit: e.target.value };
                                  setEditingBlockData(JSON.stringify(updated, null, 2));
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                                placeholder="例如：万元"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-gray-700">前缀</label>
                              <input
                                type="text"
                                value={kpiData.prefix || ''}
                                onChange={(e) => {
                                  const updated = { ...kpiData, prefix: e.target.value };
                                  setEditingBlockData(JSON.stringify(updated, null, 2));
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                                placeholder="例如：¥"
                              />
                            </div>
                          </div>
                          
                          {/* 趋势设置 */}
                          <div className="space-y-3 pt-2 border-t border-gray-200">
                            <label className="block text-sm font-bold text-gray-700">趋势指标</label>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <label className="block text-xs text-gray-600">趋势值 (%)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={kpiData.trend?.value || ''}
                                  onChange={(e) => {
                                    const updated = {
                                      ...kpiData,
                                      trend: { ...(kpiData.trend || {}), value: parseFloat(e.target.value) || 0 }
                                    };
                                    setEditingBlockData(JSON.stringify(updated, null, 2));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                                  placeholder="15.2"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="block text-xs text-gray-600">方向</label>
                                <select
                                  value={kpiData.trend?.direction || 'up'}
                                  onChange={(e) => {
                                    const updated = {
                                      ...kpiData,
                                      trend: { ...(kpiData.trend || {}), direction: e.target.value }
                                    };
                                    setEditingBlockData(JSON.stringify(updated, null, 2));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                                >
                                  <option value="up">上升 ↑</option>
                                  <option value="down">下降 ↓</option>
                                  <option value="flat">持平 →</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="block text-xs text-gray-600">标签</label>
                                <input
                                  type="text"
                                  value={kpiData.trend?.label || ''}
                                  onChange={(e) => {
                                    const updated = {
                                      ...kpiData,
                                      trend: { ...(kpiData.trend || {}), label: e.target.value }
                                    };
                                    setEditingBlockData(JSON.stringify(updated, null, 2));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                                  placeholder="例如：环比增长"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* 高级选项 - JSON编辑 */}
                          <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-[#0055FF] py-2">
                              🔧 高级：JSON 编辑
                            </summary>
                            <textarea
                              value={editingBlockData}
                              onChange={(e) => setEditingBlockData(e.target.value)}
                              className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none resize-none font-mono text-xs mt-2"
                              placeholder='{"label": "销售额", "value": 1000, ...}'
                            />
                          </details>
                        </div>
                      );
                    } catch (e) {
                      return (
                        <div className="space-y-4">
                          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-700 font-medium">JSON 格式错误，请检查数据格式</p>
                          </div>
                          <label className="block text-sm font-bold text-gray-700">KPI 数据 (JSON 格式)</label>
                          <textarea
                            value={editingBlockData}
                            onChange={(e) => setEditingBlockData(e.target.value)}
                            className="w-full h-64 px-4 py-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none resize-none font-mono text-sm"
                            placeholder='{"label": "销售额", "value": 1000, ...}'
                          />
                        </div>
                      );
                    }
                  })()}

                  {/* KPI组 - JSON编辑 */}
                  {editingBlock.block.type === 'kpi-group' && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">KPI 组数据 (JSON 格式)</label>
                      <textarea
                        value={editingBlockData}
                        onChange={(e) => setEditingBlockData(e.target.value)}
                        className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none resize-none font-mono text-sm"
                        placeholder='[{"label": "销售额", "value": 1000, ...}, ...]'
                      />
                    </div>
                  )}

                  {/* 图表组件 - 图表配置 */}
                  {(editingBlock.block.type === 'line-chart' || editingBlock.block.type === 'bar-chart' || editingBlock.block.type === 'pie-chart') && (() => {
                    try {
                      const chartData = JSON.parse(editingBlockData || '{}');
                      return (
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-gray-700">图表标题</label>
                              <input
                                type="text"
                                value={chartData.title || ''}
                                onChange={(e) => {
                                  const updated = { ...chartData, title: e.target.value };
                                  setEditingBlockData(JSON.stringify(updated, null, 2));
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                                placeholder="例如：销售额趋势"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-gray-700">X轴字段</label>
                              <input
                                type="text"
                                value={chartData.xKey || ''}
                                onChange={(e) => {
                                  const updated = { ...chartData, xKey: e.target.value };
                                  setEditingBlockData(JSON.stringify(updated, null, 2));
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                                placeholder="例如：date"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">Y轴字段</label>
                            <div className="space-y-2">
                              {Array.isArray(chartData.yKeys) ? (
                                chartData.yKeys.map((yKey: any, idx: number) => (
                                  <div key={idx} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={yKey.key || ''}
                                      onChange={(e) => {
                                        const updated = { ...chartData };
                                        updated.yKeys[idx] = { ...yKey, key: e.target.value };
                                        setEditingBlockData(JSON.stringify(updated, null, 2));
                                      }}
                                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                                      placeholder="字段名"
                                    />
                                    <input
                                      type="text"
                                      value={yKey.label || ''}
                                      onChange={(e) => {
                                        const updated = { ...chartData };
                                        updated.yKeys[idx] = { ...yKey, label: e.target.value };
                                        setEditingBlockData(JSON.stringify(updated, null, 2));
                                      }}
                                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                                      placeholder="显示名称"
                                    />
                                    <button
                                      onClick={() => {
                                        const updated = { ...chartData };
                                        updated.yKeys.splice(idx, 1);
                                        setEditingBlockData(JSON.stringify(updated, null, 2));
                                      }}
                                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-gray-500">暂无Y轴字段</div>
                              )}
                              <button
                                onClick={() => {
                                  const updated = { ...chartData };
                                  if (!updated.yKeys) updated.yKeys = [];
                                  updated.yKeys.push({ key: '', label: '' });
                                  setEditingBlockData(JSON.stringify(updated, null, 2));
                                }}
                                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#0055FF] hover:text-[#0055FF] transition-colors"
                              >
                                + 添加Y轴字段
                              </button>
                            </div>
                          </div>
                          
                          {/* 高级选项 - JSON编辑 */}
                          <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-[#0055FF] py-2">
                              🔧 高级：JSON 编辑
                            </summary>
                            <textarea
                              value={editingBlockData}
                              onChange={(e) => setEditingBlockData(e.target.value)}
                              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none resize-none font-mono text-xs mt-2"
                              placeholder='{"data": [...], "xKey": "...", "yKey": "..."}'
                            />
                          </details>
                        </div>
                      );
                    } catch (e) {
                      return (
                        <div className="space-y-4">
                          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-700 font-medium">JSON 格式错误，请检查数据格式</p>
                          </div>
                          <label className="block text-sm font-bold text-gray-700">图表数据 (JSON 格式)</label>
                          <textarea
                            value={editingBlockData}
                            onChange={(e) => setEditingBlockData(e.target.value)}
                            className="w-full h-64 px-4 py-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none resize-none font-mono text-sm"
                            placeholder='{"data": [...], "xKey": "...", "yKey": "..."}'
                          />
                        </div>
                      );
                    }
                  })()}

                  {!['text', 'kpi', 'kpi-group', 'line-chart', 'bar-chart', 'pie-chart'].includes(editingBlock.block.type) && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">组件数据 (JSON 格式)</label>
                      <textarea
                        value={editingBlockData}
                        onChange={(e) => setEditingBlockData(e.target.value)}
                        className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none resize-none font-mono text-sm"
                      />
                    </div>
                  )}
                </>
              )}

              {activeEditTab === 'style' && (
                <div className="space-y-6">
                  {/* KPI 组件的个性化设计 */}
                  {(editingBlock.block.type === 'kpi' || editingBlock.block.type === 'kpi-group') && (
                    <>
                      <h4 className="text-sm font-black text-[#0055FF] uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-4 bg-[#0055FF] rounded-full" />
                        KPI 样式设置
                      </h4>
                      
                      {/* 数值颜色 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">数值颜色</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingBlockStyle.accentColor || '#0055FF'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, accentColor: e.target.value })}
                            className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingBlockStyle.accentColor || '#0055FF'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, accentColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#0055FF"
                          />
                        </div>
                      </div>

                      {/* 标签颜色 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">标签颜色</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingBlockStyle.textColor || '#6B7280'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, textColor: e.target.value })}
                            className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingBlockStyle.textColor || '#6B7280'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, textColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#6B7280"
                          />
                        </div>
                      </div>

                      {/* 背景颜色 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">背景颜色</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingBlockStyle.backgroundColor || '#FFFFFF'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, backgroundColor: e.target.value })}
                            className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingBlockStyle.backgroundColor || '#FFFFFF'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, backgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>

                      {/* 数值字体大小 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-bold text-gray-700">数值字体大小</label>
                          <span className="text-xs text-gray-500">{editingBlockStyle.fontSize || '24px'}</span>
                        </div>
                        <input
                          type="range"
                          min="16"
                          max="48"
                          step="2"
                          value={parseInt(editingBlockStyle.fontSize) || 24}
                          onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, fontSize: `${e.target.value}px` })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0055FF]"
                        />
                      </div>

                      {/* 数值字体粗细 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">数值字体粗细</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['bold', 'black', 'normal'].map((weight) => (
                            <button
                              key={weight}
                              onClick={() => setEditingBlockStyle({ ...editingBlockStyle, fontWeight: weight })}
                              className={clsx(
                                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                editingBlockStyle.fontWeight === weight
                                  ? "bg-[#0055FF] text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              )}
                            >
                              {weight === 'bold' ? '粗体' : weight === 'black' ? '特粗' : '常规'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 圆角大小 - 限制最大值，防止超出容器 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-bold text-gray-700">圆角大小</label>
                          <span className="text-xs text-gray-500">{editingBlockStyle.borderRadius || '12px'}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="16"
                          step="2"
                          value={Math.min(parseInt(editingBlockStyle.borderRadius) || 12, 16)}
                          onChange={(e) => {
                            const value = Math.min(parseInt(e.target.value), 16); // 限制最大值为16px，防止超出
                            setEditingBlockStyle({ ...editingBlockStyle, borderRadius: `${value}px` });
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0055FF]"
                        />
                        <div className="flex justify-between text-[9px] text-gray-400">
                          <span>0px</span>
                          <span>最大16px</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* 图表组件的个性化设计 */}
                  {(editingBlock.block.type === 'line-chart' || editingBlock.block.type === 'bar-chart' || editingBlock.block.type === 'pie-chart' || editingBlock.block.type === 'scatter-chart' || editingBlock.block.type === 'funnel-chart' || editingBlock.block.type === 'box-plot' || editingBlock.block.type === 'map-chart' || editingBlock.block.type === 'quadrant-chart' || editingBlock.block.type === 'year-comparison') && (
                    <>
                      <h4 className="text-sm font-black text-[#10B981] uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-4 bg-[#10B981] rounded-full" />
                        图表样式设置
                      </h4>
                      
                      {/* 图表主色调 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">图表主色调</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingBlockStyle.accentColor || '#3B82F6'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, accentColor: e.target.value })}
                            className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingBlockStyle.accentColor || '#3B82F6'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, accentColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#3B82F6"
                          />
                        </div>
                      </div>

                      {/* 背景颜色 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">图表背景</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingBlockStyle.backgroundColor || '#FFFFFF'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, backgroundColor: e.target.value })}
                            className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingBlockStyle.backgroundColor || '#FFFFFF'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, backgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>

                      {/* 标题颜色 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">标题颜色</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingBlockStyle.textColor || '#111827'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, textColor: e.target.value })}
                            className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingBlockStyle.textColor || '#111827'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, textColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#111827"
                          />
                        </div>
                      </div>

                      {/* 边框颜色 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">边框颜色</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingBlockStyle.borderColor || '#E5E7EB'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, borderColor: e.target.value })}
                            className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingBlockStyle.borderColor || '#E5E7EB'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, borderColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#E5E7EB"
                          />
                        </div>
                      </div>

                      {/* 图表高度 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-bold text-gray-700">图表高度</label>
                          <span className="text-xs text-gray-500">{editingBlockStyle.chartHeight || '300px'}</span>
                        </div>
                        <input
                          type="range"
                          min="200"
                          max="600"
                          step="20"
                          value={parseInt(editingBlockStyle.chartHeight) || 300}
                          onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, chartHeight: `${e.target.value}px` })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                        />
                      </div>
                      
                      {/* 网格线颜色 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">网格线颜色</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingBlockStyle.gridColor || '#E5E7EB'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, gridColor: e.target.value })}
                            className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingBlockStyle.gridColor || '#E5E7EB'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, gridColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#E5E7EB"
                          />
                        </div>
                      </div>
                      
                      {/* 圆角大小 - 限制最大值，防止超出容器 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-bold text-gray-700">圆角大小</label>
                          <span className="text-xs text-gray-500">{editingBlockStyle.borderRadius || '12px'}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="16"
                          step="2"
                          value={Math.min(parseInt(editingBlockStyle.borderRadius) || 12, 16)}
                          onChange={(e) => {
                            const value = Math.min(parseInt(e.target.value), 16); // 限制最大值为16px，防止超出
                            setEditingBlockStyle({ ...editingBlockStyle, borderRadius: `${value}px` });
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                        />
                        <div className="flex justify-between text-[9px] text-gray-400">
                          <span>0px</span>
                          <span>最大16px</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* 文本组件的个性化设计 */}
                  {editingBlock.block.type === 'text' && (
                    <>
                      <h4 className="text-sm font-black text-[#F59E0B] uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-4 bg-[#F59E0B] rounded-full" />
                        文本样式设置
                      </h4>
                      
                      {/* 文字颜色 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">文字颜色</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingBlockStyle.textColor || '#111827'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, textColor: e.target.value })}
                            className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingBlockStyle.textColor || '#111827'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, textColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#111827"
                          />
                        </div>
                      </div>

                      {/* 背景颜色 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">背景颜色</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingBlockStyle.backgroundColor || '#FFFFFF'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, backgroundColor: e.target.value })}
                            className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingBlockStyle.backgroundColor || '#FFFFFF'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, backgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>

                      {/* 字体大小 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-bold text-gray-700">字体大小</label>
                          <span className="text-xs text-gray-500">{editingBlockStyle.fontSize || '14px'}</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="20"
                          step="1"
                          value={parseInt(editingBlockStyle.fontSize) || 14}
                          onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, fontSize: `${e.target.value}px` })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0055FF]"
                        />
                      </div>

                      {/* 字体粗细 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">字体粗细</label>
                        <div className="grid grid-cols-4 gap-2">
                          {['normal', 'medium', 'bold', 'black'].map((weight) => (
                            <button
                              key={weight}
                              onClick={() => setEditingBlockStyle({ ...editingBlockStyle, fontWeight: weight })}
                              className={clsx(
                                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                editingBlockStyle.fontWeight === weight
                                  ? "bg-[#0055FF] text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              )}
                            >
                              {weight === 'normal' ? '常规' : weight === 'medium' ? '中等' : weight === 'bold' ? '粗体' : '特粗'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 文字对齐 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">文字对齐</label>
                        <div className="flex gap-2">
                          {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                              key={align}
                              onClick={() => setEditingBlockStyle({ ...editingBlockStyle, textAlign: align })}
                              className={clsx(
                                "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                editingBlockStyle.textAlign === align
                                  ? "bg-[#0055FF] text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              )}
                            >
                              {align === 'left' ? '左对齐' : align === 'center' ? '居中' : '右对齐'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 行高 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-bold text-gray-700">行高</label>
                          <span className="text-xs text-gray-500">{editingBlockStyle.lineHeight || '1.6'}</span>
                        </div>
                        <input
                          type="range"
                          min="1.2"
                          max="2.5"
                          step="0.1"
                          value={parseFloat(editingBlockStyle.lineHeight as string) || 1.6}
                          onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, lineHeight: e.target.value })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F59E0B]"
                        />
                      </div>

                      {/* 边框颜色 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">边框颜色</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingBlockStyle.borderColor || '#E5E7EB'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, borderColor: e.target.value })}
                            className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingBlockStyle.borderColor || '#E5E7EB'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, borderColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#E5E7EB"
                          />
                        </div>
                      </div>

                      {/* 边框宽度 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-bold text-gray-700">边框宽度</label>
                          <span className="text-xs text-gray-500">{editingBlockStyle.borderWidth || '1px'}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="4"
                          step="1"
                          value={parseInt(editingBlockStyle.borderWidth) || 1}
                          onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, borderWidth: `${e.target.value}px` })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0055FF]"
                        />
                      </div>

                      {/* 圆角大小 - 限制最大值，防止超出容器 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-bold text-gray-700">圆角大小</label>
                          <span className="text-xs text-gray-500">{editingBlockStyle.borderRadius || '8px'}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="16"
                          step="2"
                          value={Math.min(parseInt(editingBlockStyle.borderRadius) || 8, 16)}
                          onChange={(e) => {
                            const value = Math.min(parseInt(e.target.value), 16); // 限制最大值为16px，防止超出
                            setEditingBlockStyle({ ...editingBlockStyle, borderRadius: `${value}px` });
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F59E0B]"
                        />
                        <div className="flex justify-between text-[9px] text-gray-400">
                          <span>0px</span>
                          <span>最大16px</span>
                        </div>
                      </div>

                      {/* 内边距 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-bold text-gray-700">内边距</label>
                          <span className="text-xs text-gray-500">{editingBlockStyle.padding || '12px'}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="32"
                          step="4"
                          value={parseInt(editingBlockStyle.padding) || 12}
                          onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, padding: `${e.target.value}px` })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0055FF]"
                        />
                      </div>
                    </>
                  )}

                  {/* 其他类型的通用设计 */}
                  {!['kpi', 'kpi-group', 'line-chart', 'bar-chart', 'pie-chart', 'text'].includes(editingBlock.block.type) && (
                    <>
                      <h4 className="text-sm font-black text-gray-700 uppercase tracking-wider">通用样式设置</h4>
                      
                      {/* 背景色 */}
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">背景颜色</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editingBlockStyle.backgroundColor || '#FFFFFF'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, backgroundColor: e.target.value })}
                            className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingBlockStyle.backgroundColor || '#FFFFFF'}
                            onChange={(e) => setEditingBlockStyle({ ...editingBlockStyle, backgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>

                      {/* 圆角大小 - 限制最大值 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-bold text-gray-700">圆角大小</label>
                          <span className="text-xs text-gray-500">{editingBlockStyle.borderRadius || '12px'}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="2"
                          value={parseInt(editingBlockStyle.borderRadius) || 12}
                          onChange={(e) => {
                            const value = Math.min(parseInt(e.target.value), 20);
                            setEditingBlockStyle({ ...editingBlockStyle, borderRadius: `${value}px` });
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0055FF]"
                        />
                        <div className="flex justify-between text-[9px] text-gray-400">
                          <span>0px</span>
                          <span>20px</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 底部操作按钮 */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setEditingBlock(null);
                  setEditingBlockStyle({});
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={() => {
                  try {
                    let newData: any;
                    if (editingBlock.block.type === 'text') {
                      newData = editingBlockData;
                    } else if (editingBlock.block.type === 'rich-text' || editingBlock.block.type === 'navigation-bar' || editingBlock.block.type === 'command-card') {
                      newData = JSON.parse(editingBlockData);
                    } else {
                      newData = JSON.parse(editingBlockData);
                    }
                    const updatedBlock: ContentBlock = {
                      ...editingBlock.block,
                      data: newData
                    };
                    handleSaveBlock(updatedBlock);
                  } catch (e) {
                    const toast = document.createElement('div');
                    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl z-[101] text-sm font-bold shadow-xl';
                    toast.innerText = '❌ JSON 格式错误，请检查输入';
                    document.body.appendChild(toast);
                    setTimeout(() => {
                      toast.style.opacity = '0';
                      setTimeout(() => document.body.removeChild(toast), 300);
                    }, 2000);
                  }
                }}
                className="px-6 py-2 bg-[#0055FF] hover:bg-[#0044CC] text-white rounded-xl transition-colors font-bold shadow-lg shadow-blue-500/20"
              >
                保存更改
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 修改卡片标题模态框 */}
      {editingTitle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setEditingTitle(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#111827]">修改卡片标题</h3>
              <button
                onClick={() => setEditingTitle(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <input
              type="text"
              value={editingTitle.title}
              onChange={(e) => setEditingTitle({ ...editingTitle, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none mb-4"
              placeholder="输入卡片标题..."
              autoFocus
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingTitle(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const item = items.find(i => i.id === editingTitle.itemId);
                  if (item) {
                    const updatedItem = { ...item, title: editingTitle.title };
                    const updatedItems = items.map(i => i.id === editingTitle.itemId ? updatedItem : i);
                    setItems(updatedItems);
                    dashboardService.updateItems(updatedItems);
                    setEditingTitle(null);
                    
                    const toast = document.createElement('div');
                    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-[#10B981] text-white px-6 py-3 rounded-xl z-[101] text-sm font-bold shadow-xl';
                    toast.innerText = '✓ 标题已更新';
                    document.body.appendChild(toast);
                    setTimeout(() => {
                      toast.style.opacity = '0';
                      setTimeout(() => document.body.removeChild(toast), 300);
                    }, 2000);
                  }
                }}
                className="px-6 py-2 bg-[#0055FF] hover:bg-[#0044CC] text-white rounded-xl transition-colors font-bold"
              >
                保存
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 查看SQL模态框 */}
      {viewingSQL && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setViewingSQL(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-[#111827]">查看SQL</h3>
              <button
                onClick={() => setViewingSQL(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <div className="space-y-6">
                {/* SQL代码 */}
                {viewingSQL.sql && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-gray-700">SQL 代码</h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(viewingSQL.sql || '');
                          const toast = document.createElement('div');
                          toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-[#10B981] text-white px-4 py-2 rounded-lg z-[101] text-sm font-medium';
                          toast.innerText = '✓ 已复制到剪贴板';
                          document.body.appendChild(toast);
                          setTimeout(() => document.body.removeChild(toast), 2000);
                        }}
                        className="px-3 py-1 text-xs text-[#0055FF] hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        复制
                      </button>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded-xl border border-gray-200 overflow-x-auto text-sm font-mono whitespace-pre-wrap break-words">
                      <code className="block">{viewingSQL.sql}</code>
                    </pre>
                  </div>
                )}
                
                {/* LogicForm */}
                {viewingSQL.logicForm && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-gray-700">LogicForm</h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(viewingSQL.logicForm || '');
                          const toast = document.createElement('div');
                          toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-[#10B981] text-white px-4 py-2 rounded-lg z-[101] text-sm font-medium';
                          toast.innerText = '✓ 已复制到剪贴板';
                          document.body.appendChild(toast);
                          setTimeout(() => document.body.removeChild(toast), 2000);
                        }}
                        className="px-3 py-1 text-xs text-[#0055FF] hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        复制
                      </button>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded-xl border border-gray-200 overflow-x-auto text-sm font-mono whitespace-pre-wrap break-words">
                      <code className="block">{viewingSQL.logicForm}</code>
                    </pre>
                  </div>
                )}
                
                {/* 分词结果 */}
                {viewingSQL.tokens && viewingSQL.tokens.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">分词结果</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingSQL.tokens.map((token, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-[#0055FF] rounded-lg text-xs font-medium"
                        >
                          {token}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end flex-shrink-0">
              <button
                onClick={() => setViewingSQL(null)}
                className="px-6 py-2 bg-[#0055FF] hover:bg-[#0044CC] text-white rounded-xl transition-colors font-bold"
              >
                关闭
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 添加看板模态框 */}
      <AnimatePresence>
      {showAddToDashboardModal && addToDashboardData && (
        <motion.div
          key="add-to-dashboard-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowAddToDashboardModal(false)}
        >
          <motion.div
            key="add-to-dashboard-content"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#111827]">添加到数据看板</h3>
              <button
                onClick={() => setShowAddToDashboardModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 看板名称 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">看板名称 *</label>
                <input
                  type="text"
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                  placeholder="请输入看板名称"
                  autoFocus
                />
              </div>
              
              {/* 简称 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">简称</label>
                <input
                  type="text"
                  value={dashboardShortName}
                  onChange={(e) => setDashboardShortName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                  placeholder="可选，用于简短标识"
                />
              </div>
              
              {/* 标签 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">标签</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                    placeholder="输入标签后按回车添加"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-[#0055FF] text-white rounded-xl hover:bg-[#0044CC] transition-colors font-medium"
                  >
                    添加
                  </button>
                </div>
                {dashboardTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {dashboardTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-[#0055FF] rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 操作按钮 */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddToDashboardModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmAddToDashboard}
                  className="px-6 py-2 bg-[#0055FF] hover:bg-[#0044CC] text-white rounded-xl transition-colors font-bold"
                >
                  添加到看板
                </button>
                <button
                  onClick={() => {
                    setShowAddToDashboardModal(false);
                    setShowCreateDashboardModal(true);
                  }}
                  className="px-6 py-2 bg-white border-2 border-[#0055FF] text-[#0055FF] rounded-xl hover:bg-blue-50 transition-colors font-bold"
                >
                  创建新看板
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* 创建新看板模态框 */}
      {showCreateDashboardModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowCreateDashboardModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#111827]">创建新看板</h3>
              <button
                onClick={() => setShowCreateDashboardModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 看板名称 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">看板名称 *</label>
                <input
                  type="text"
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                  placeholder="请输入看板名称"
                  autoFocus
                />
              </div>
              
              {/* 简称 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">简称</label>
                <input
                  type="text"
                  value={dashboardShortName}
                  onChange={(e) => setDashboardShortName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                  placeholder="可选，用于简短标识"
                />
              </div>
              
              {/* 标签 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">标签</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                    placeholder="输入标签后按回车添加"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-[#0055FF] text-white rounded-xl hover:bg-[#0044CC] transition-colors font-medium"
                  >
                    添加
                  </button>
                </div>
                {dashboardTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {dashboardTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-[#0055FF] rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 操作按钮 */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateDashboardModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateNewDashboard}
                  className="px-6 py-2 bg-[#0055FF] hover:bg-[#0044CC] text-white rounded-xl transition-colors font-bold"
                >
                  创建看板
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 指令中心 */}
      {showCommandCenter && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed right-4 top-20 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[100] max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#111827]">指令中心</h3>
            <button
              onClick={() => setShowCommandCenter(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {[
                { label: '数据分析', command: '数据分析：查看整体业务趋势' },
                { label: '对比分析', command: '对比分析：对比不同时间段的数据' },
                { label: '核心指标', command: '核心指标：展示关键业务指标' },
                { label: '区域对比', command: '区域对比：对比不同地区的数据' },
                { label: '多表联查', command: '多表联查：关联多个数据表进行分析' },
                { label: '趋势预测', command: '趋势预测：预测未来数据趋势' },
                { label: '异常检测', command: '异常检测：识别数据异常点' },
                { label: '归因分析', command: '归因分析：分析指标变化原因' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputValue(item.command);
                    setActiveSidePanel('chat');
                    setShowCommandCenter(false);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 hover:border-[#0055FF] border border-transparent rounded-xl transition-all"
                >
                  <div className="text-sm font-bold text-gray-700">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.command}</div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIDashboard;
