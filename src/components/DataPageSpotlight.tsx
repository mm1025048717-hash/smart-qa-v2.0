/**
 * 数据相关页面聚光灯引导 - 首次进入时高亮关键区域并展示说明
 * 用于数据源管理、业务建模、指标管理
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export interface DataPageSpotlightStep {
  target: string; // data-tour 选择器，如 [data-tour="datasource-new-connection"]
  title: string;
  description: string;
}

export interface DataPageSpotlightProps {
  /** 本地存储 key，用于仅展示一次（或本会话一次） */
  storageKey: string;
  /** 引导步骤（可多步，按顺序展示） */
  steps: DataPageSpotlightStep[];
  /** 使用 sessionStorage 则每次新开浏览器/标签页会再展示一次；默认 localStorage 只展示一次 */
  useSessionStorage?: boolean;
  /** 由父组件传入 true 时强制显示引导（如点击「操作引导」按钮），关闭时调用 onComplete */
  forceShow?: boolean;
  /** 引导关闭时回调（含点「知道了」或 forceShow 被撤销时） */
  onComplete?: () => void;
}

export function DataPageSpotlight({ storageKey, steps, useSessionStorage, forceShow: forceShowProp, onComplete }: DataPageSpotlightProps) {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 获取 storage
  const getStorage = () => useSessionStorage ? sessionStorage : localStorage;
  
  // 自动启动引导：组件挂载时立即检查并显示
  useEffect(() => {
    // forceShow 优先
    if (forceShowProp) {
      setVisible(true);
      setStepIndex(0);
      return;
    }
    
    // 检查是否已经看过
    const storage = getStorage();
    const alreadySeen = storage.getItem(storageKey) === 'true';
    
    // 第一次进入，自动显示引导
    if (!alreadySeen) {
      // 延迟启动，确保 DOM 元素已渲染
      const timer = setTimeout(() => {
        setVisible(true);
        setStepIndex(0);
      }, 400);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceShowProp]); // forceShowProp 变化时也响应

  const step = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;

  useEffect(() => {
    if (!visible || !step) return;
    let cancelled = false;
    let observer: ResizeObserver | null = null;
    const updateRect = () => {
      const el = document.querySelector(step.target);
      if (!el || cancelled) {
        if (!cancelled) setTargetRect(null);
        return;
      }
      setTargetRect(el.getBoundingClientRect());
    };
    const t = setTimeout(() => {
      if (cancelled) return;
      updateRect();
      const el = document.querySelector(step.target);
      if (el) {
        observer = new ResizeObserver(updateRect);
        observer.observe(el);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
      observer?.disconnect();
    };
  }, [visible, step?.target]);

  const handleNext = () => {
    if (isLast) {
      getStorage().setItem(storageKey, 'true');
      setVisible(false);
      onComplete?.();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  if (!visible || !step) return null;

  const padding = 12;
  const w = typeof window !== 'undefined' ? window.innerWidth : 800;
  const h = typeof window !== 'undefined' ? window.innerHeight : 600;
  const x = targetRect ? targetRect.left - padding : 0;
  const y = targetRect ? targetRect.top - padding : 0;
  const rw = targetRect ? targetRect.width + padding * 2 : 0;
  const rh = targetRect ? targetRect.height + padding * 2 : 0;
  const r = 16;
  const path = targetRect
    ? `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${x + r} ${y} L ${x + rw - r} ${y} Q ${x + rw} ${y} ${x + rw} ${y + r} L ${x + rw} ${y + rh - r} Q ${x + rw} ${y + rh} ${x + rw - r} ${y + rh} L ${x + r} ${y + rh} Q ${x} ${y + rh} ${x} ${y + rh - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`
    : `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;

  const cardLeft = targetRect
    ? Math.min(targetRect.left, w - 360)
    : (w - Math.min(340, w * 0.9)) / 2;
  const cardTop = targetRect
    ? (targetRect.bottom + 24 < h - 180 ? targetRect.bottom + 24 : Math.max(24, targetRect.top - 200))
    : (h - 200) / 2;

  const cutout = targetRect
    ? { x: x, y: y, w: rw, h: rh }
    : null;

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90]"
      onClick={(e) => e.stopPropagation()}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <path d={path} fill="rgba(0,0,0,0.55)" fillRule="evenodd" />
      </svg>
      {!cutout && <div className="absolute inset-0 pointer-events-auto" aria-hidden />}
      {/* 遮罩：四块条带围住高亮区，高亮区内可点击「新建连接」等按钮 */}
      {cutout && (
        <>
          <div className="absolute left-0 top-0 bg-transparent pointer-events-auto" style={{ width: w, height: cutout.y }} aria-hidden />
          <div className="absolute left-0 bg-transparent pointer-events-auto" style={{ top: cutout.y, width: cutout.x, height: cutout.h }} aria-hidden />
          <div className="absolute bg-transparent pointer-events-auto" style={{ left: cutout.x + cutout.w, top: cutout.y, width: w - cutout.x - cutout.w, height: cutout.h }} aria-hidden />
          <div className="absolute left-0 bg-transparent pointer-events-auto" style={{ top: cutout.y + cutout.h, width: w, height: h - cutout.y - cutout.h }} aria-hidden />
        </>
      )}
      {targetRect && (
        <div
          className="absolute rounded-2xl border-2 border-[#007AFF] pointer-events-none"
          style={{
            left: targetRect.left - padding,
            top: targetRect.top - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
          }}
        />
      )}
      <div
        className="absolute z-10 w-[min(340px,90vw)] bg-white rounded-2xl border border-[#E5E5EA] shadow-xl p-5"
        style={{
          left: cardLeft,
          top: cardTop,
        }}
      >
        <h3 className="text-[15px] font-semibold text-[#1D1D1F]">{step.title}</h3>
        <p className="mt-2 text-[13px] text-[#86868B] leading-relaxed">{step.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[12px] text-[#86868B]">
            {stepIndex + 1} / {steps.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2.5 text-[13px] font-medium text-white bg-[#007AFF] hover:bg-[#0051D5] rounded-xl"
          >
            {isLast ? '知道了' : '下一步'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default DataPageSpotlight;
