import { useState, useCallback, useRef, useEffect } from 'react';
import { getEventPosition, isMobileDevice } from '../utils/physics';

/**
 * 拖拽 Hook
 * @param {Function} onDragStart - 拖拽开始回调
 * @param {Function} onDragMove - 拖拽移动回调
 * @param {Function} onDragEnd - 拖拽结束回调
 * @returns {object} 拖拽相关的属性和方法
 */
export function useDrag({ onDragStart, onDragMove, onDragEnd, getScale }) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const dragStartPos = useRef(null);
  const itemStartPos = useRef(null);
  const containerRef = useRef(null);
  const longPressTimer = useRef(null);
  const isMobile = isMobileDevice();

  // 清理长按计时器
  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // 开始拖拽
  const handleDragStart = useCallback((e, itemId, itemPos) => {
    e.preventDefault();
    e.stopPropagation();
    
    const pos = getEventPosition(e, containerRef.current);
    dragStartPos.current = pos;
    itemStartPos.current = itemPos;
    
    setIsDragging(true);
    setDraggedId(itemId);
    
    if (onDragStart) {
      onDragStart(itemId);
    }

    // 移动端震动反馈
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [onDragStart, isMobile]);

  // 处理鼠标/触摸按下
  const handlePointerDown = useCallback((e, itemId, itemPos) => {
    if (isMobile) {
      // 移动端长按启动拖拽
      clearLongPress();
      longPressTimer.current = setTimeout(() => {
        handleDragStart(e, itemId, itemPos);
      }, 300);
    } else {
      // PC 端立即启动拖拽
      handleDragStart(e, itemId, itemPos);
    }
  }, [isMobile, handleDragStart, clearLongPress]);

  // 处理移动
  const handleMove = useCallback((e) => {
    if (!isDragging || !dragStartPos.current || !itemStartPos.current) {
      return;
    }

    e.preventDefault();
    const currentPos = getEventPosition(e, containerRef.current);
    
    const scale = typeof getScale === 'function' ? (getScale() || 1) : 1;
    const deltaX = (currentPos.x - dragStartPos.current.x) / scale;
    const deltaY = (currentPos.y - dragStartPos.current.y) / scale;
    
    const newPos = {
      x: itemStartPos.current.x + deltaX,
      y: itemStartPos.current.y + deltaY
    };

    if (onDragMove) {
      onDragMove(draggedId, newPos);
    }
  }, [isDragging, draggedId, onDragMove, getScale]);

  // 结束拖拽
  const handleDragEnd = useCallback((e) => {
    clearLongPress();
    
    if (!isDragging) {
      return;
    }

    e.preventDefault();
    
    const endPos = getEventPosition(e, containerRef.current);
    
    if (onDragEnd) {
      onDragEnd(draggedId, endPos);
    }
    
    setIsDragging(false);
    setDraggedId(null);
    dragStartPos.current = null;
    itemStartPos.current = null;
  }, [isDragging, draggedId, onDragEnd, clearLongPress]);

  // 取消拖拽
  const handleCancel = useCallback(() => {
    clearLongPress();
    setIsDragging(false);
    setDraggedId(null);
    dragStartPos.current = null;
    itemStartPos.current = null;
  }, [clearLongPress]);

  // 设置全局事件监听
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // 移动事件
    const moveEvents = isMobile ? ['touchmove'] : ['mousemove'];
    const endEvents = isMobile ? ['touchend', 'touchcancel'] : ['mouseup'];
    
    moveEvents.forEach(event => {
      container.addEventListener(event, handleMove, { passive: false });
    });
    
    endEvents.forEach(event => {
      container.addEventListener(event, handleDragEnd);
    });

    // 防止默认触摸行为
    if (isMobile) {
      container.addEventListener('touchstart', (e) => {
        if (isDragging) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    return () => {
      moveEvents.forEach(event => {
        container.removeEventListener(event, handleMove);
      });
      endEvents.forEach(event => {
        container.removeEventListener(event, handleDragEnd);
      });
      clearLongPress();
    };
  }, [handleMove, handleDragEnd, isDragging, isMobile, clearLongPress]);

  return {
    containerRef,
    isDragging,
    draggedId,
    handlePointerDown,
    handleCancel
  };
}
