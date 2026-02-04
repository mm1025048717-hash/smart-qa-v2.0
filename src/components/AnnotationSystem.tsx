/**
 * PRD 批注系统
 * 允许用户点击任何组件进行文字批注，支持添加、编辑、删除批注
 */

import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
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
  AlertCircle
} from 'lucide-react';

// 批注数据结构
export interface Annotation {
  id: string;
  targetId: string; // 目标元素的 data-annotation-id
  content: string;
  author: string;
  createdAt: Date;
  updatedAt?: Date;
  resolved: boolean;
  position: { x: number; y: number }; // 相对于目标元素的位置
  replies?: AnnotationReply[];
}

export interface AnnotationReply {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
}

// 批注上下文
interface AnnotationContextType {
  annotations: Annotation[];
  isAnnotationMode: boolean;
  showAnnotations: boolean;
  activeAnnotationId: string | null;
  setAnnotationMode: (mode: boolean) => void;
  setShowAnnotations: (show: boolean) => void;
  setActiveAnnotationId: (id: string | null) => void;
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'resolved' | 'replies'>) => void;
  updateAnnotation: (id: string, content: string) => void;
  deleteAnnotation: (id: string) => void;
  resolveAnnotation: (id: string) => void;
  addReply: (annotationId: string, content: string, author: string) => void;
  exportAnnotations: () => void;
  importAnnotations: (data: string) => void;
}

const AnnotationContext = createContext<AnnotationContextType | null>(null);

const STORAGE_KEY = 'prd_annotations_v1';

// 批注提供者
export const AnnotationProvider = ({ children }: { children: ReactNode }) => {
  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
          updatedAt: a.updatedAt ? new Date(a.updatedAt) : undefined,
          replies: a.replies?.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt),
          })),
        }));
      }
    } catch (e) {
      console.warn('Failed to load annotations:', e);
    }
    return [];
  });
  
  const [isAnnotationMode, setAnnotationMode] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);

  // 保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
    } catch (e) {
      console.warn('Failed to save annotations:', e);
    }
  }, [annotations]);

  const addAnnotation = (annotation: Omit<Annotation, 'id' | 'createdAt' | 'resolved' | 'replies'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      resolved: false,
      replies: [],
    };
    setAnnotations(prev => [...prev, newAnnotation]);
    setActiveAnnotationId(newAnnotation.id);
  };

  const updateAnnotation = (id: string, content: string) => {
    setAnnotations(prev => prev.map(a => 
      a.id === id 
        ? { ...a, content, updatedAt: new Date() }
        : a
    ));
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    if (activeAnnotationId === id) {
      setActiveAnnotationId(null);
    }
  };

  const resolveAnnotation = (id: string) => {
    setAnnotations(prev => prev.map(a => 
      a.id === id 
        ? { ...a, resolved: !a.resolved }
        : a
    ));
  };

  const addReply = (annotationId: string, content: string, author: string) => {
    const reply: AnnotationReply = {
      id: `reply_${Date.now()}`,
      content,
      author,
      createdAt: new Date(),
    };
    setAnnotations(prev => prev.map(a => 
      a.id === annotationId 
        ? { ...a, replies: [...(a.replies || []), reply] }
        : a
    ));
  };

  const exportAnnotations = () => {
    const data = JSON.stringify(annotations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prd-annotations-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAnnotations = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      const imported = parsed.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt),
        updatedAt: a.updatedAt ? new Date(a.updatedAt) : undefined,
        replies: a.replies?.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
        })),
      }));
      setAnnotations(prev => [...prev, ...imported]);
    } catch (e) {
      console.error('Failed to import annotations:', e);
      alert('导入失败，请检查文件格式');
    }
  };

  return (
    <AnnotationContext.Provider value={{
      annotations,
      isAnnotationMode,
      showAnnotations,
      activeAnnotationId,
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
    }}>
      {children}
    </AnnotationContext.Provider>
  );
};

// 使用批注上下文的 Hook
export const useAnnotations = () => {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error('useAnnotations must be used within AnnotationProvider');
  }
  return context;
};

// 批注工具栏
export const AnnotationToolbar = () => {
  const { 
    isAnnotationMode, 
    setAnnotationMode, 
    showAnnotations, 
    setShowAnnotations,
    annotations,
    exportAnnotations,
    importAnnotations,
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

  return (
    <div className="flex items-center gap-2">
      {/* 批注模式切换 */}
      <button
        onClick={() => setAnnotationMode(!isAnnotationMode)}
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

// 可批注区域包装器
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
  } = useAnnotations();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // 获取该区域的批注
  const areaAnnotations = annotations.filter(a => a.targetId === id);
  const hasAnnotations = areaAnnotations.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (!isAnnotationMode) return;
    
    e.stopPropagation();
    
    // 计算点击位置相对于元素的位置
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    addAnnotation({
      targetId: id,
      content: '',
      author: '用户',
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
      
      {/* 批注指示器 */}
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
      
      {/* 批注点标记 */}
      {showAnnotations && areaAnnotations.map(annotation => (
        <AnnotationMarker 
          key={annotation.id} 
          annotation={annotation}
        />
      ))}
      
      {/* 批注模式提示 */}
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

// 批注标记点
const AnnotationMarker = ({ annotation }: { annotation: Annotation }) => {
  const { activeAnnotationId, setActiveAnnotationId } = useAnnotations();
  const isActive = activeAnnotationId === annotation.id;

  return (
    <>
      {/* 标记点 */}
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
      
      {/* 批注卡片 */}
      <AnimatePresence>
        {isActive && (
          <AnnotationCard annotation={annotation} />
        )}
      </AnimatePresence>
    </>
  );
};

// 批注卡片
const AnnotationCard = ({ annotation }: { annotation: Annotation }) => {
  const { 
    updateAnnotation, 
    deleteAnnotation, 
    resolveAnnotation,
    addReply,
    setActiveAnnotationId,
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

  const handleSave = () => {
    if (editContent.trim()) {
      updateAnnotation(annotation.id, editContent.trim());
      setIsEditing(false);
    } else if (!annotation.content) {
      deleteAnnotation(annotation.id);
    }
  };

  const handleAddReply = () => {
    if (replyContent.trim()) {
      addReply(annotation.id, replyContent.trim(), '用户');
      setReplyContent('');
    }
  };

  const formatTime = (date: Date) => {
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
        {/* 顶部状态条 */}
        <div className={`h-1 ${annotation.resolved ? 'bg-[#34C759]' : 'bg-[#FF9500]'}`} />
        
        <div className="p-4">
          {/* 头部信息 */}
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
          
          {/* 内容区 */}
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
                  if (e.key === 'Enter' && e.metaKey) {
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
                <span className="text-[10px] text-[#86868B]">Cmd+Enter 保存，Esc 取消</span>
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
              
              {/* 操作按钮 */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E5EA]">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-[#86868B] hover:bg-[#F5F5F7] rounded-lg transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  编辑
                </button>
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
                <button
                  onClick={() => deleteAnnotation(annotation.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-[#FF3B30] hover:bg-[#FFEBEE] rounded-lg transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  删除
                </button>
              </div>
            </div>
          )}
          
          {/* 回复区 */}
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
              
              {/* 回复输入 */}
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

// 批注侧边栏（可选，显示所有批注列表）
export const AnnotationSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { annotations, activeAnnotationId, setActiveAnnotationId } = useAnnotations();
  
  const unresolvedAnnotations = annotations.filter(a => !a.resolved);
  const resolvedAnnotations = annotations.filter(a => a.resolved);

  const formatTime = (date: Date) => {
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          {/* 头部 */}
          <div className="px-4 py-3 border-b border-[#E5E5EA] flex items-center justify-between">
            <h3 className="font-semibold text-[#1D1D1F]">
              批注列表
              <span className="ml-2 text-sm font-normal text-[#86868B]">({annotations.length})</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#F5F5F7] rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-[#86868B]" />
            </button>
          </div>
          
          {/* 列表 */}
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
                {/* 未解决 */}
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
                
                {/* 已解决 */}
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
