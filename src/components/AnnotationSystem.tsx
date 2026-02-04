/**
 * PRD 批注系统 - 支持多人协作同步
 * 使用 Vercel KV 存储批注数据，通过智能轮询实现同步
 */

import { useState, useEffect, useRef, createContext, useContext, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquarePlus, 
  X, 
  Check, 
  Trash2, 
  Edit3, 
  MessageCircle,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Download,
  Upload,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  Users
} from 'lucide-react';

// ==================== 类型定义 ====================

export interface AnnotationReply {
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
}

export interface Annotation {
  id: string;
  targetId: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt?: string | null;
  resolved: boolean;
  position: { x: number; y: number };
  replies?: AnnotationReply[];
}

type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface AnnotationContextType {
  annotations: Annotation[];
  isAnnotationMode: boolean;
  showAnnotations: boolean;
  activeAnnotationId: string | null;
  syncStatus: SyncStatus;
  currentUser: { name: string; id: string } | null;
  setAnnotationMode: (mode: boolean) => void;
  setShowAnnotations: (show: boolean) => void;
  setActiveAnnotationId: (id: string | null) => void;
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'resolved' | 'replies' | 'authorId'>) => Promise<void>;
  updateAnnotation: (id: string, content: string) => Promise<void>;
  deleteAnnotation: (id: string) => Promise<void>;
  resolveAnnotation: (id: string) => Promise<void>;
  addReply: (annotationId: string, content: string) => Promise<void>;
  exportAnnotations: () => void;
  importAnnotations: (data: string) => void;
  refreshAnnotations: () => Promise<void>;
  setCurrentUser: (user: { name: string; id: string }) => void;
  showNicknameDialog: boolean;
  setShowNicknameDialog: (show: boolean) => void;
}

// ==================== API 服务 ====================

const API_BASE = '/api/annotations';

const annotationApi = {
  // 获取所有批注
  async getAll(): Promise<{ annotations: Annotation[]; meta: { lastUpdated: number }; timestamp: number }> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch annotations');
    return res.json();
  },

  // 创建批注
  async create(data: Partial<Annotation>): Promise<Annotation> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create annotation');
    return res.json();
  },

  // 更新批注
  async update(id: string, data: Partial<Annotation>): Promise<Annotation> {
    const res = await fetch(`${API_BASE}?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update annotation');
    return res.json();
  },

  // 删除批注
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}?id=${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete annotation');
  },

  // 添加回复
  async addReply(annotationId: string, data: { content: string; author: string; authorId: string }): Promise<Annotation> {
    const res = await fetch(`${API_BASE}?action=reply&id=${annotationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add reply');
    return res.json();
  },

  // 解决批注
  async resolve(id: string, resolved: boolean): Promise<Annotation> {
    const res = await fetch(`${API_BASE}?action=resolve&id=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved }),
    });
    if (!res.ok) throw new Error('Failed to resolve annotation');
    return res.json();
  },
};

// ==================== 工具函数 ====================

const STORAGE_KEY_USER = 'prd_annotation_user_v1';
const STORAGE_KEY_LOCAL = 'prd_annotations_v1'; // 保留用于导入旧数据

// 生成用户 ID
const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 从本地存储获取用户信息
const getStoredUser = (): { name: string; id: string } | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to get stored user:', e);
  }
  return null;
};

// 保存用户信息到本地存储
const saveUser = (user: { name: string; id: string }) => {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (e) {
    console.warn('Failed to save user:', e);
  }
};

// ==================== Context ====================

const AnnotationContext = createContext<AnnotationContextType | null>(null);

// ==================== Provider ====================

export const AnnotationProvider = ({ children }: { children: ReactNode }) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAnnotationMode, setAnnotationMode] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [currentUser, setCurrentUserState] = useState<{ name: string; id: string } | null>(getStoredUser);
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);
  
  const lastFetchRef = useRef<number>(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // 设置当前用户
  const setCurrentUser = useCallback((user: { name: string; id: string }) => {
    setCurrentUserState(user);
    saveUser(user);
    setShowNicknameDialog(false);
  }, []);

  // 获取批注
  const fetchAnnotations = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      const data = await annotationApi.getAll();
      setAnnotations(data.annotations);
      lastFetchRef.current = data.timestamp;
      setSyncStatus('synced');
    } catch (error) {
      console.error('Failed to fetch annotations:', error);
      setSyncStatus('error');
    }
  }, []);

  // 刷新批注
  const refreshAnnotations = useCallback(async () => {
    await fetchAnnotations();
  }, [fetchAnnotations]);

  // 初始化和轮询
  useEffect(() => {
    // 初次加载
    fetchAnnotations();

    // 设置轮询（5秒间隔）
    const startPolling = () => {
      pollingRef.current = setInterval(() => {
        // 只在页面可见时轮询
        if (document.visibilityState === 'visible') {
          fetchAnnotations();
        }
      }, 5000);
    };

    // 页面可见性变化时的处理
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面重新可见时立即刷新
        fetchAnnotations();
      }
    };

    // 在线/离线状态处理
    const handleOnline = () => {
      setSyncStatus('syncing');
      fetchAnnotations();
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 检查初始网络状态
    if (!navigator.onLine) {
      setSyncStatus('offline');
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchAnnotations]);

  // 检查用户是否已设置昵称
  useEffect(() => {
    if (!currentUser && isAnnotationMode) {
      setShowNicknameDialog(true);
    }
  }, [currentUser, isAnnotationMode]);

  // 添加批注
  const addAnnotation = useCallback(async (data: Omit<Annotation, 'id' | 'createdAt' | 'resolved' | 'replies' | 'authorId'>) => {
    if (!currentUser) {
      setShowNicknameDialog(true);
      return;
    }

    // 乐观更新
    const optimisticId = `temp_${Date.now()}`;
    const optimisticAnnotation: Annotation = {
      ...data,
      id: optimisticId,
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
      resolved: false,
      replies: [],
    };
    
    setAnnotations(prev => [...prev, optimisticAnnotation]);
    setActiveAnnotationId(optimisticId);

    try {
      const created = await annotationApi.create({
        ...data,
        author: currentUser.name,
        authorId: currentUser.id,
      });
      
      // 替换乐观更新的数据
      setAnnotations(prev => prev.map(a => a.id === optimisticId ? created : a));
      setActiveAnnotationId(created.id);
    } catch (error) {
      console.error('Failed to create annotation:', error);
      // 回滚乐观更新
      setAnnotations(prev => prev.filter(a => a.id !== optimisticId));
      setActiveAnnotationId(null);
    }
  }, [currentUser]);

  // 更新批注
  const updateAnnotation = useCallback(async (id: string, content: string) => {
    // 乐观更新
    setAnnotations(prev => prev.map(a => 
      a.id === id ? { ...a, content, updatedAt: new Date().toISOString() } : a
    ));

    try {
      await annotationApi.update(id, { content });
    } catch (error) {
      console.error('Failed to update annotation:', error);
      // 刷新获取最新数据
      fetchAnnotations();
    }
  }, [fetchAnnotations]);

  // 删除批注
  const deleteAnnotation = useCallback(async (id: string) => {
    // 乐观更新
    const deleted = annotations.find(a => a.id === id);
    setAnnotations(prev => prev.filter(a => a.id !== id));
    if (activeAnnotationId === id) {
      setActiveAnnotationId(null);
    }

    try {
      await annotationApi.delete(id);
    } catch (error) {
      console.error('Failed to delete annotation:', error);
      // 回滚
      if (deleted) {
        setAnnotations(prev => [...prev, deleted]);
      }
    }
  }, [annotations, activeAnnotationId]);

  // 解决批注
  const resolveAnnotation = useCallback(async (id: string) => {
    const annotation = annotations.find(a => a.id === id);
    if (!annotation) return;

    const newResolved = !annotation.resolved;

    // 乐观更新
    setAnnotations(prev => prev.map(a => 
      a.id === id ? { ...a, resolved: newResolved } : a
    ));

    try {
      await annotationApi.resolve(id, newResolved);
    } catch (error) {
      console.error('Failed to resolve annotation:', error);
      // 回滚
      setAnnotations(prev => prev.map(a => 
        a.id === id ? { ...a, resolved: !newResolved } : a
      ));
    }
  }, [annotations]);

  // 添加回复
  const addReply = useCallback(async (annotationId: string, content: string) => {
    if (!currentUser) {
      setShowNicknameDialog(true);
      return;
    }

    // 乐观更新
    const optimisticReply: AnnotationReply = {
      id: `temp_reply_${Date.now()}`,
      content,
      author: currentUser.name,
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    setAnnotations(prev => prev.map(a => 
      a.id === annotationId 
        ? { ...a, replies: [...(a.replies || []), optimisticReply] }
        : a
    ));

    try {
      const updated = await annotationApi.addReply(annotationId, {
        content,
        author: currentUser.name,
        authorId: currentUser.id,
      });
      
      // 替换为服务器返回的数据
      setAnnotations(prev => prev.map(a => a.id === annotationId ? updated : a));
    } catch (error) {
      console.error('Failed to add reply:', error);
      // 回滚
      setAnnotations(prev => prev.map(a => 
        a.id === annotationId 
          ? { ...a, replies: (a.replies || []).filter(r => r.id !== optimisticReply.id) }
          : a
      ));
    }
  }, [currentUser]);

  // 导出批注
  const exportAnnotations = useCallback(() => {
    const data = JSON.stringify(annotations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prd-annotations-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [annotations]);

  // 导入批注（仅用于迁移旧数据）
  const importAnnotations = useCallback(async (data: string) => {
    try {
      const parsed = JSON.parse(data) as Annotation[];
      
      // 逐个创建批注
      for (const ann of parsed) {
        await annotationApi.create({
          targetId: ann.targetId,
          content: ann.content,
          author: ann.author || currentUser?.name || '导入用户',
          authorId: currentUser?.id || generateUserId(),
          position: ann.position,
        });
      }
      
      // 刷新列表
      await fetchAnnotations();
      alert(`成功导入 ${parsed.length} 条批注`);
    } catch (e) {
      console.error('Failed to import annotations:', e);
      alert('导入失败，请检查文件格式');
    }
  }, [currentUser, fetchAnnotations]);

  return (
    <AnnotationContext.Provider value={{
      annotations,
      isAnnotationMode,
      showAnnotations,
      activeAnnotationId,
      syncStatus,
      currentUser,
      setAnnotationMode,
      setShowAnnotations,
      setActiveAnnotationId,
      addAnnotation,
      updateAnnotation,
      deleteAnnotation,
      resolveAnnotation,
      addReply,
      exportAnnotations,
      importAnnotations,
      refreshAnnotations,
      setCurrentUser,
      showNicknameDialog,
      setShowNicknameDialog,
    }}>
      {children}
      <NicknameDialog />
    </AnnotationContext.Provider>
  );
};

// ==================== Hooks ====================

export const useAnnotations = () => {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error('useAnnotations must be used within AnnotationProvider');
  }
  return context;
};

// ==================== 昵称输入弹窗 ====================

const NicknameDialog = () => {
  const { showNicknameDialog, setShowNicknameDialog, setCurrentUser, currentUser } = useAnnotations();
  const [nickname, setNickname] = useState(currentUser?.name || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNicknameDialog && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showNicknameDialog]);

  const handleSubmit = () => {
    if (nickname.trim()) {
      setCurrentUser({
        name: nickname.trim(),
        id: currentUser?.id || generateUserId(),
      });
    }
  };

  if (!showNicknameDialog) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={() => setShowNicknameDialog(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-[#007AFF] via-[#5856D6] to-[#AF52DE]" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1D1D1F]">设置昵称</h3>
              <p className="text-sm text-[#86868B]">用于标识您的批注</p>
            </div>
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="请输入您的昵称..."
            className="w-full px-4 py-3 text-base border border-[#E5E5EA] rounded-xl focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10 mb-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && nickname.trim()) {
                handleSubmit();
              }
            }}
          />
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowNicknameDialog(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-[#86868B] hover:bg-[#F5F5F7] rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!nickname.trim()}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== 同步状态指示器 ====================

const SyncStatusIndicator = () => {
  const { syncStatus, refreshAnnotations } = useAnnotations();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAnnotations();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const statusConfig = {
    synced: { icon: Cloud, color: 'text-[#34C759]', bg: 'bg-[#E8F5E9]', label: '已同步' },
    syncing: { icon: RefreshCw, color: 'text-[#007AFF]', bg: 'bg-[#F0F7FF]', label: '同步中' },
    offline: { icon: CloudOff, color: 'text-[#FF9500]', bg: 'bg-[#FFF3E0]', label: '离线' },
    error: { icon: AlertCircle, color: 'text-[#FF3B30]', bg: 'bg-[#FFEBEE]', label: '同步失败' },
  };

  const config = statusConfig[syncStatus];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleRefresh}
        className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg transition-all ${config.bg} ${config.color}`}
        title={`${config.label} - 点击刷新`}
      >
        <Icon className={`w-3.5 h-3.5 ${syncStatus === 'syncing' || isRefreshing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{config.label}</span>
      </button>
    </div>
  );
};

// ==================== 批注工具栏 ====================

export const AnnotationToolbar = () => {
  const { 
    isAnnotationMode, 
    setAnnotationMode, 
    showAnnotations, 
    setShowAnnotations,
    annotations,
    exportAnnotations,
    importAnnotations,
    currentUser,
    setShowNicknameDialog,
  } = useAnnotations();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unresolvedCount = annotations.filter(a => !a.resolved).length;

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        importAnnotations(data);
      };
      reader.readAsText(file);
    }
  };

  const handleAnnotationModeClick = () => {
    if (!currentUser && !isAnnotationMode) {
      setShowNicknameDialog(true);
    } else {
      setAnnotationMode(!isAnnotationMode);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* 同步状态 */}
      <SyncStatusIndicator />
      
      {/* 当前用户 */}
      {currentUser && (
        <button
          onClick={() => setShowNicknameDialog(true)}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg bg-[#F5F5F7] text-[#86868B] hover:bg-[#E5E5EA] transition-colors"
          title="点击修改昵称"
        >
          <User className="w-3.5 h-3.5" />
          <span className="max-w-[80px] truncate">{currentUser.name}</span>
        </button>
      )}
      
      <div className="w-px h-5 bg-[#E5E5EA]" />

      {/* 批注模式切换 */}
      <button
        onClick={handleAnnotationModeClick}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
          isAnnotationMode 
            ? 'bg-[#FF9500] text-white shadow-lg shadow-[#FF9500]/25' 
            : 'bg-[#FFF3E0] text-[#FF9500] hover:bg-[#FFE0B2]'
        }`}
        title={isAnnotationMode ? '退出批注模式' : '进入批注模式'}
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span>{isAnnotationMode ? '退出批注' : '添加批注'}</span>
        {unresolvedCount > 0 && (
          <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
            isAnnotationMode ? 'bg-white/20 text-white' : 'bg-[#FF9500] text-white'
          }`}>
            {unresolvedCount}
          </span>
        )}
      </button>

      {/* 显示/隐藏批注 */}
      <button
        onClick={() => setShowAnnotations(!showAnnotations)}
        className={`p-2 rounded-xl transition-all ${
          showAnnotations 
            ? 'bg-[#F0F7FF] text-[#007AFF]' 
            : 'bg-[#F5F5F7] text-[#86868B]'
        }`}
        title={showAnnotations ? '隐藏批注' : '显示批注'}
      >
        {showAnnotations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>

      {/* 导出批注 */}
      {annotations.length > 0 && (
        <button
          onClick={exportAnnotations}
          className="p-2 rounded-xl bg-[#F5F5F7] text-[#86868B] hover:bg-[#E5E5EA] transition-all"
          title="导出批注"
        >
          <Download className="w-4 h-4" />
        </button>
      )}

      {/* 导入批注 */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 rounded-xl bg-[#F5F5F7] text-[#86868B] hover:bg-[#E5E5EA] transition-all"
        title="导入批注"
      >
        <Upload className="w-4 h-4" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
};

// ==================== 可批注区域 ====================

interface AnnotatableProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export const Annotatable = ({ id, children, className = '' }: AnnotatableProps) => {
  const { 
    isAnnotationMode, 
    showAnnotations, 
    annotations, 
    addAnnotation,
    activeAnnotationId,
    setActiveAnnotationId,
    currentUser,
    setShowNicknameDialog,
  } = useAnnotations();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const areaAnnotations = annotations.filter(a => a.targetId === id);
  const hasAnnotations = areaAnnotations.length > 0;

  const handleClick = async (e: React.MouseEvent) => {
    if (!isAnnotationMode) return;
    
    if (!currentUser) {
      setShowNicknameDialog(true);
      return;
    }
    
    e.stopPropagation();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    await addAnnotation({
      targetId: id,
      content: '',
      author: currentUser.name,
      position: { x, y },
    });
  };

  return (
    <div
      ref={containerRef}
      data-annotation-id={id}
      className={`relative ${className} ${
        isAnnotationMode 
          ? 'cursor-crosshair hover:outline hover:outline-2 hover:outline-dashed hover:outline-[#FF9500]/50 hover:bg-[#FF9500]/5 transition-all' 
          : ''
      }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      {showAnnotations && hasAnnotations && (
        <div className="absolute -top-2 -right-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveAnnotationId(activeAnnotationId === areaAnnotations[0].id ? null : areaAnnotations[0].id);
            }}
            className="w-6 h-6 rounded-full bg-[#FF9500] text-white text-xs font-bold flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            {areaAnnotations.length}
          </button>
        </div>
      )}
      
      {showAnnotations && areaAnnotations.map(annotation => (
        <AnnotationMarker 
          key={annotation.id} 
          annotation={annotation}
        />
      ))}
      
      {isAnnotationMode && isHovered && !hasAnnotations && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="px-3 py-1.5 bg-[#FF9500] text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
            点击添加批注
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== 批注标记 ====================

const AnnotationMarker = ({ annotation }: { annotation: Annotation }) => {
  const { activeAnnotationId, setActiveAnnotationId } = useAnnotations();
  const isActive = activeAnnotationId === annotation.id;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setActiveAnnotationId(isActive ? null : annotation.id);
        }}
        className={`absolute w-5 h-5 rounded-full flex items-center justify-center transition-all z-10 ${
          annotation.resolved 
            ? 'bg-[#34C759]' 
            : 'bg-[#FF9500]'
        } ${isActive ? 'scale-125 ring-4 ring-[#FF9500]/20' : 'hover:scale-110'}`}
        style={{
          left: `${annotation.position.x}%`,
          top: `${annotation.position.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <MessageCircle className="w-3 h-3 text-white" />
      </button>
      
      <AnimatePresence>
        {isActive && (
          <AnnotationCard annotation={annotation} />
        )}
      </AnimatePresence>
    </>
  );
};

// ==================== 批注卡片 ====================

const AnnotationCard = ({ annotation }: { annotation: Annotation }) => {
  const { 
    updateAnnotation, 
    deleteAnnotation, 
    resolveAnnotation,
    addReply,
    setActiveAnnotationId,
    currentUser,
  } = useAnnotations();
  
  const [isEditing, setIsEditing] = useState(!annotation.content);
  const [editContent, setEditContent] = useState(annotation.content);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editContent.trim()) {
      await updateAnnotation(annotation.id, editContent.trim());
      setIsEditing(false);
    } else if (!annotation.content) {
      await deleteAnnotation(annotation.id);
    }
  };

  const handleAddReply = async () => {
    if (replyContent.trim()) {
      await addReply(annotation.id, replyContent.trim());
      setReplyContent('');
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };

  const isOwner = currentUser?.id === annotation.authorId;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="absolute z-30 w-72"
      style={{
        left: `${Math.min(annotation.position.x, 70)}%`,
        top: `${annotation.position.y + 3}%`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`bg-white rounded-2xl shadow-xl border overflow-hidden ${
        annotation.resolved ? 'border-[#34C759]/30' : 'border-[#FF9500]/30'
      }`}>
        <div className={`h-1 ${annotation.resolved ? 'bg-[#34C759]' : 'bg-[#FF9500]'}`} />
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#007AFF] text-white text-xs flex items-center justify-center font-medium">
                {annotation.author.slice(0, 1)}
              </div>
              <div>
                <div className="text-sm font-medium text-[#1D1D1F]">{annotation.author}</div>
                <div className="text-[10px] text-[#86868B] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(annotation.createdAt)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {annotation.resolved && (
                <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#34C759] text-[10px] rounded-full">
                  已解决
                </span>
              )}
              <button
                onClick={() => setActiveAnnotationId(null)}
                className="p-1 hover:bg-[#F5F5F7] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[#86868B]" />
              </button>
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                ref={inputRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="输入批注内容..."
                className="w-full px-3 py-2 text-sm border border-[#E5E5EA] rounded-xl resize-none focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSave();
                  }
                  if (e.key === 'Escape') {
                    if (!annotation.content) {
                      deleteAnnotation(annotation.id);
                    } else {
                      setEditContent(annotation.content);
                      setIsEditing(false);
                    }
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#86868B]">Ctrl+Enter 保存</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!annotation.content) {
                        deleteAnnotation(annotation.id);
                      } else {
                        setEditContent(annotation.content);
                        setIsEditing(false);
                      }
                    }}
                    className="px-3 py-1.5 text-xs text-[#86868B] hover:bg-[#F5F5F7] rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!editContent.trim()}
                    className="px-3 py-1.5 text-xs text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-[#1D1D1F] whitespace-pre-wrap">{annotation.content}</p>
              
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E5EA]">
                {isOwner && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-[#86868B] hover:bg-[#F5F5F7] rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    编辑
                  </button>
                )}
                <button
                  onClick={() => resolveAnnotation(annotation.id)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${
                    annotation.resolved 
                      ? 'text-[#FF9500] hover:bg-[#FFF3E0]' 
                      : 'text-[#34C759] hover:bg-[#E8F5E9]'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  {annotation.resolved ? '重新打开' : '标记解决'}
                </button>
                {isOwner && (
                  <button
                    onClick={() => deleteAnnotation(annotation.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-[#FF3B30] hover:bg-[#FFEBEE] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    删除
                  </button>
                )}
              </div>
            </div>
          )}
          
          {!isEditing && annotation.content && (
            <div className="mt-3">
              {annotation.replies && annotation.replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-1 text-xs text-[#007AFF] mb-2"
                >
                  {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {annotation.replies.length} 条回复
                </button>
              )}
              
              <AnimatePresence>
                {showReplies && annotation.replies && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 mb-3 overflow-hidden"
                  >
                    {annotation.replies.map((reply) => (
                      <div key={reply.id} className="pl-3 border-l-2 border-[#E5E5EA]">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs font-medium text-[#1D1D1F]">{reply.author}</span>
                          <span className="text-[10px] text-[#86868B]">· {formatTime(reply.createdAt)}</span>
                        </div>
                        <p className="text-xs text-[#4E5969]">{reply.content}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex items-center gap-2">
                <input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="添加回复..."
                  className="flex-1 px-3 py-1.5 text-xs border border-[#E5E5EA] rounded-lg focus:outline-none focus:border-[#007AFF]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddReply();
                    }
                  }}
                />
                <button
                  onClick={handleAddReply}
                  disabled={!replyContent.trim()}
                  className="p-1.5 text-[#007AFF] hover:bg-[#F0F7FF] rounded-lg transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ==================== 批注侧边栏 ====================

export const AnnotationSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { annotations, activeAnnotationId, setActiveAnnotationId, syncStatus } = useAnnotations();
  
  const unresolvedAnnotations = annotations.filter(a => !a.resolved);
  const resolvedAnnotations = annotations.filter(a => a.resolved);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取唯一的作者数量
  const uniqueAuthors = new Set(annotations.map(a => a.authorId)).size;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-[#E5E5EA] shadow-xl z-40 overflow-hidden flex flex-col"
        >
          <div className="px-4 py-3 border-b border-[#E5E5EA] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#1D1D1F]">
                批注列表
                <span className="ml-2 text-sm font-normal text-[#86868B]">({annotations.length})</span>
              </h3>
              {uniqueAuthors > 0 && (
                <div className="flex items-center gap-1 text-xs text-[#86868B] mt-0.5">
                  <Users className="w-3 h-3" />
                  <span>{uniqueAuthors} 位参与者</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#F5F5F7] rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-[#86868B]" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {annotations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-[#C7C7CC]" />
                </div>
                <p className="text-sm text-[#86868B]">暂无批注</p>
                <p className="text-xs text-[#C7C7CC] mt-1">点击"添加批注"开始批注</p>
              </div>
            ) : (
              <div className="p-2">
                {unresolvedAnnotations.length > 0 && (
                  <div className="mb-4">
                    <div className="px-2 py-1 text-xs font-medium text-[#FF9500] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      待处理 ({unresolvedAnnotations.length})
                    </div>
                    {unresolvedAnnotations.map((annotation) => (
                      <button
                        key={annotation.id}
                        onClick={() => setActiveAnnotationId(annotation.id)}
                        className={`w-full text-left p-3 rounded-xl mb-1 transition-all ${
                          activeAnnotationId === annotation.id 
                            ? 'bg-[#FFF3E0] border border-[#FF9500]/30' 
                            : 'hover:bg-[#F5F5F7]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-[#FF9500] text-white text-[10px] flex items-center justify-center">
                            {annotation.author.slice(0, 1)}
                          </div>
                          <span className="text-xs font-medium text-[#1D1D1F]">{annotation.author}</span>
                          <span className="text-[10px] text-[#86868B]">{formatTime(annotation.createdAt)}</span>
                        </div>
                        <p className="text-sm text-[#4E5969] line-clamp-2">{annotation.content || '空批注'}</p>
                        {annotation.replies && annotation.replies.length > 0 && (
                          <div className="mt-1 text-[10px] text-[#86868B]">
                            {annotation.replies.length} 条回复
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {resolvedAnnotations.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs font-medium text-[#34C759] flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      已解决 ({resolvedAnnotations.length})
                    </div>
                    {resolvedAnnotations.map((annotation) => (
                      <button
                        key={annotation.id}
                        onClick={() => setActiveAnnotationId(annotation.id)}
                        className={`w-full text-left p-3 rounded-xl mb-1 transition-all opacity-60 ${
                          activeAnnotationId === annotation.id 
                            ? 'bg-[#E8F5E9] border border-[#34C759]/30 opacity-100' 
                            : 'hover:bg-[#F5F5F7] hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-[#34C759] text-white text-[10px] flex items-center justify-center">
                            {annotation.author.slice(0, 1)}
                          </div>
                          <span className="text-xs font-medium text-[#1D1D1F]">{annotation.author}</span>
                        </div>
                        <p className="text-sm text-[#4E5969] line-clamp-2">{annotation.content || '空批注'}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnotationProvider;
