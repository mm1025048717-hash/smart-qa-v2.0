import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, X, FileText } from 'lucide-react';
import clsx from 'clsx';
import { getContrastColor } from '../utils/colors';
import { generateLocalSummary } from '../utils/summary';

/**
 * 气泡组件
 */
export function Bubble({ 
  bubble, 
  isDragging, 
  canFuse, 
  onPointerDown, 
  onUpdate, 
  onSelect,
  isSelected,
  onOpenDetail
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(bubble.text);
  const inputRef = useRef(null);

  const textColor = getContrastColor(bubble.color);
  const summary = generateLocalSummary(
    bubble.text,
    (bubble.attachments || []).map(a => a.name)
  );

  // 开始编辑
  const startEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(bubble.text);
  };

  // 保存编辑
  const saveEdit = () => {
    const trimmedText = editText.trim();
    if (trimmedText && trimmedText !== bubble.text) {
      onUpdate(bubble.id, { text: trimmedText });
    }
    setIsEditing(false);
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditText(bubble.text);
    setIsEditing(false);
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // 自动聚焦输入框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <motion.div
      className={clsx(
        'bubble',
        isDragging && 'dragging',
        canFuse && 'can-fuse',
        isSelected && 'ring-2 ring-bfl-primary/40',
        bubble.mergedHighlight && 'ring-4 ring-bfl-primary/60'
      )}
      style={{
        left: bubble.x - bubble.radius,
        top: bubble.y - bubble.radius,
        width: bubble.radius * 2,
        height: bubble.radius * 2,
        backgroundColor: bubble.color,
        color: textColor,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: isDragging ? 0 : undefined,
        y: isDragging ? 0 : undefined
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseDown={(e) => !isEditing && onPointerDown(e, bubble.id, { x: bubble.x, y: bubble.y })}
      onTouchStart={(e) => !isEditing && onPointerDown(e, bubble.id, { x: bubble.x, y: bubble.y })}
      onClick={() => {
        if (!isEditing) {
          // 仅选中，不再直接打开摘要面板
          onSelect(bubble.id);
        }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full h-full p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={saveEdit}
              className="w-full bg-transparent border-none outline-none resize-none text-center bubble-text"
              style={{ color: textColor }}
              maxLength={50}
              rows={2}
            />
            <div className="flex gap-1 mt-1">
              <button
                onClick={saveEdit}
                className="p-1 rounded hover:bg-white/40"
                onMouseDown={(e) => e.preventDefault()}
              >
                <Check size={14} />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1 rounded hover:bg-white/40"
                onMouseDown={(e) => e.preventDefault()}
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bubble-text relative group"
            style={{ fontSize: `${Math.max(14, Math.min(18, 200 / bubble.text.length))}px` }}
          >
            <div className="whitespace-pre-line">{bubble.text}</div>
            {bubble.attachments?.length > 0 && (
              <div className="mt-1 text-[10px] opacity-80 leading-tight whitespace-pre-line">
                {summary}
              </div>
            )}
            <button
              onClick={startEdit}
              className="absolute -top-1 -right-1 p-1 rounded-full bg-white/20 
                         opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: textColor }}
            >
              <Edit3 size={12} />
            </button>
            {/* 打开摘要/附件的小按钮：点击后才弹出详情面板 */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpenDetail(bubble.id); }}
              title="查看摘要"
              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: textColor }}
            >
              <FileText size={12} />
            </button>
            {/* 附件入口改为点击气泡整体打开详情，避免与编辑按钮重叠 */}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 融合提示光环 */}
      {canFuse && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `0 0 0 4px ${bubble.color}40, 0 0 20px ${bubble.color}60`
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
}
