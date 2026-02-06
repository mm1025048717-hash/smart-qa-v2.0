/**
 * 新手引导（游戏式聚光灯引导）- PRD 4.5
 * 共 8 步，高亮当前区域；下一步/上一步切换，跳过引导/X 直接关闭并存储完成状态。
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlight?: 'rect' | 'circle';
  padding?: number;
}

// PRD 4.5 引导步骤（共8步）
const TOUR_STEPS: TourStep[] = [
  { id: 'welcome', target: '', title: '欢迎使用', description: '30 秒快速了解核心功能，帮助你高效分析数据。', position: 'center' },
  { id: 'input-area', target: '[data-tour="input-area"]', title: '智能输入框', description: '这是你与 AI 对话的核心区域。直接输入你想分析的问题即可。', position: 'bottom', highlight: 'rect', padding: 12 },
  { id: 'agent-selector', target: '[data-tour="agent-selector"]', title: '数字员工选择', description: '点击这里可以切换不同的 AI 助手，每位员工有不同专长。', position: 'bottom', highlight: 'rect', padding: 8 },
  { id: 'capability-actions', target: '[data-tour="capability-actions"]', title: '快速能力入口', description: '不知道问什么？点击这些快捷按钮，快速进入指标查询、趋势分析等常见场景。', position: 'top', highlight: 'rect', padding: 8 },
  { id: 'scenario-tabs', target: '[data-tour="scenario-tabs"]', title: '业务场景切换', description: '根据不同的业务场景（销售概览、异常诊断、用户分析等），系统会推荐最适合的数字员工和常见问题。', position: 'top', highlight: 'rect', padding: 8 },
  { id: 'employee-cards', target: '[data-tour="employee-cards"]', title: '数字员工卡片', description: '这里展示推荐的数字员工。点击卡片可快速切换到该员工，获得针对性分析帮助。', position: 'top', highlight: 'rect', padding: 8 },
  { id: 'sidebar', target: '[data-tour="sidebar"]', title: '任务记录与导航', description: '左侧边栏可查看历史任务记录、搜索之前的分析、探索更多数字员工，以及快速开始新任务。', position: 'right', highlight: 'rect', padding: 8 },
  { id: 'complete', target: '', title: '准备就绪', description: '现在你已经了解了核心功能。开始输入你的第一个问题吧，如需帮助可随时点击右下角引导助手。', position: 'center' },
];

const TOUR_STORAGE_KEY = 'yiwen_onboarding_completed_v1';

export interface OnboardingTourProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const OnboardingTour = ({ onComplete, forceShow = false }: OnboardingTourProps) => {
  const steps = TOUR_STEPS;
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 检查是否需要显示引导
  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      return;
    }

    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  // 更新目标元素位置
  const updateTargetPosition = useCallback(() => {
    const step = steps[currentStep];
    if (!step?.target) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep, steps]);

  // 监听窗口大小变化和步骤变化
  useEffect(() => {
    if (!isVisible) return;

    updateTargetPosition();
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [isVisible, currentStep, updateTargetPosition]);

  // 键盘事件处理
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'Escape':
          e.preventDefault();
          handleSkip();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentStep, isAnimating]);

  // 处理下一步
  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  // 处理上一步
  const handlePrev = () => {
    if (isAnimating || currentStep === 0) return;
    setIsAnimating(true);
    setCurrentStep((prev) => prev - 1);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [isMorphing, setIsMorphing] = useState(false);

  // 完成引导（最后一步可带动效：蒙版缩到右下角变成小助手）
  const handleComplete = useCallback(() => {
    const lastStep = currentStep >= steps.length - 1;
    if (lastStep && !isMorphing) {
      setIsMorphing(true);
      return;
    }
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  }, [currentStep, steps.length, isMorphing, onComplete]);

  // 变形动画结束后真正关闭
  useEffect(() => {
    if (!isMorphing) return;
    const t = setTimeout(() => {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      setIsVisible(false);
      onComplete?.();
    }, 800);
    return () => clearTimeout(t);
  }, [isMorphing, onComplete]);

  // 跳过引导：先弹出二次确认（PRD：挽留式跳过）
  const handleSkipClick = () => setShowSkipConfirm(true);
  const handleSkipConfirm = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setShowSkipConfirm(false);
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const isCenterStep = step.position === 'center';
  const padding = step.padding || 8;

  // 计算提示框位置
  const getTooltipPosition = () => {
    if (!targetRect || isCenterStep) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const tooltipWidth = 380;
    const tooltipHeight = 200;
    const arrowOffset = 20;
    const margin = 24;

    switch (step.position) {
      case 'top':
        return {
          top: `${targetRect.top - tooltipHeight - arrowOffset}px`,
          left: `${Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, targetRect.left + targetRect.width / 2 - tooltipWidth / 2))}px`,
        };
      case 'bottom':
        return {
          top: `${targetRect.bottom + arrowOffset}px`,
          left: `${Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, targetRect.left + targetRect.width / 2 - tooltipWidth / 2))}px`,
        };
      case 'left':
        return {
          top: `${Math.max(margin, targetRect.top + targetRect.height / 2 - tooltipHeight / 2)}px`,
          left: `${targetRect.left - tooltipWidth - arrowOffset}px`,
        };
      case 'right':
        return {
          top: `${Math.max(margin, targetRect.top + targetRect.height / 2 - tooltipHeight / 2)}px`,
          left: `${targetRect.right + arrowOffset}px`,
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  // 生成遮罩路径（高亮区域透明）
  const getMaskPath = () => {
    if (!targetRect || isCenterStep) {
      return '';
    }

    const x = targetRect.left - padding;
    const y = targetRect.top - padding;
    const w = targetRect.width + padding * 2;
    const h = targetRect.height + padding * 2;
    const r = 16; // 圆角半径

    // SVG 路径：外部矩形 + 内部圆角矩形（镂空）
    return `
      M 0 0 
      L ${window.innerWidth} 0 
      L ${window.innerWidth} ${window.innerHeight} 
      L 0 ${window.innerHeight} 
      Z 
      M ${x + r} ${y}
      L ${x + w - r} ${y}
      Q ${x + w} ${y} ${x + w} ${y + r}
      L ${x + w} ${y + h - r}
      Q ${x + w} ${y + h} ${x + w - r} ${y + h}
      L ${x + r} ${y + h}
      Q ${x} ${y + h} ${x} ${y + h - r}
      L ${x} ${y + r}
      Q ${x} ${y} ${x + r} ${y}
      Z
    `;
  };

  // 获取箭头方向
  const getArrowDirection = () => {
    switch (step.position) {
      case 'top':
        return 'down';
      case 'bottom':
        return 'up';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      default:
        return null;
    }
  };

  const arrowDirection = getArrowDirection();

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={false}
        animate={
          isMorphing
            ? { opacity: 1, top: 'auto', left: 'auto', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgb(29, 29, 31)' }
            : { opacity: 1, top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', borderRadius: 0, backgroundColor: 'transparent' }
        }
        exit={{ opacity: 0 }}
        transition={{ duration: isMorphing ? 0.5 : 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed z-[100] bg-transparent"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 遮罩层 - 使用 SVG 实现镂空效果；变形时隐藏 */}
        <div className={isMorphing ? 'opacity-0 pointer-events-none' : ''}>
        {/* 遮罩层 - 使用 SVG 实现镂空效果 */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
          aria-hidden
        >
          {isCenterStep ? (
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.55)"
            />
          ) : (
            <path
              d={getMaskPath()}
              fill="rgba(0, 0, 0, 0.55)"
              fillRule="evenodd"
            />
          )}
        </svg>

        {/* 高亮区域边框 - 极简：单线描边，无阴影 */}
        {targetRect && !isCenterStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute pointer-events-none rounded-2xl border-2 border-[#007AFF]"
            style={{
              left: targetRect.left - padding,
              top: targetRect.top - padding,
              width: targetRect.width + padding * 2,
              height: targetRect.height + padding * 2,
            }}
          />
        )}

        {/* 箭头指示器 - 极简，无缩放动画 */}
        {targetRect && arrowDirection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute pointer-events-none z-10"
            style={{
              ...(() => {
                const arrowSize = 24;
                const offset = 8;
                switch (arrowDirection) {
                  case 'up':
                    return {
                      left: targetRect.left + targetRect.width / 2 - arrowSize / 2,
                      top: targetRect.top - padding - arrowSize - offset,
                    };
                  case 'down':
                    return {
                      left: targetRect.left + targetRect.width / 2 - arrowSize / 2,
                      top: targetRect.bottom + padding + offset,
                    };
                  case 'left':
                    return {
                      left: targetRect.left - padding - arrowSize - offset,
                      top: targetRect.top + targetRect.height / 2 - arrowSize / 2,
                    };
                  case 'right':
                    return {
                      left: targetRect.right + padding + offset,
                      top: targetRect.top + targetRect.height / 2 - arrowSize / 2,
                    };
                  default:
                    return {};
                }
              })(),
            }}
          >
            <div className="w-6 h-6 text-[#007AFF]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={`w-full h-full ${
                  arrowDirection === 'up'
                    ? 'rotate-[-90deg]'
                    : arrowDirection === 'down'
                    ? 'rotate-90'
                    : arrowDirection === 'left'
                    ? 'rotate-180'
                    : ''
                }`}
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>
        )}

        {/* 提示卡片 - 极简：白底 + 细边框，无阴影 */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-[380px] bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden"
          style={getTooltipPosition()}
        >
          <div className="p-6">
            {/* 纯文字：标题 + 说明，无 icon */}
            <h3 className="text-[17px] font-semibold text-[#1D1D1F] tracking-tight">
              {step.title}
            </h3>
            <p className="mt-3 text-[15px] text-[#86868B] leading-relaxed">
              {step.description}
            </p>

            {/* 进度指示器（PRD：如 1/5 让用户有心理预期） */}
            <div className="mt-6 flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-6 bg-[#007AFF]'
                      : index < currentStep
                      ? 'w-1.5 bg-[#007AFF]/40'
                      : 'w-1.5 bg-[#E5E5EA]'
                  }`}
                />
              ))}
              <span className="ml-auto text-[12px] text-[#86868B]">
                {currentStep + 1} / {steps.length}
              </span>
            </div>

            {/* 操作按钮 - 纯文字，无 icon */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <button
                    onClick={handlePrev}
                    className="px-4 py-2.5 text-[13px] font-medium text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-colors"
                  >
                    上一步
                  </button>
                )}
                {!isLastStep && (
                  <button
                    onClick={handleSkipClick}
                    className="px-4 py-2.5 text-[13px] font-medium text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-colors"
                  >
                    跳过引导
                  </button>
                )}
              </div>
              <button
                onClick={handleNext}
                className="px-5 py-2.5 text-[13px] font-medium text-white bg-[#007AFF] hover:bg-[#0051D5] rounded-xl transition-colors active:opacity-90"
              >
                {isLastStep ? '开始使用' : '下一步'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* 关闭引导：先二次确认（PRD：挽留式跳过） */}
        <button
          onClick={handleSkipClick}
          className="absolute top-6 right-6 w-9 h-9 rounded-full border border-white/30 text-white/90 hover:text-white hover:border-white/50 flex items-center justify-center transition-colors text-[20px] leading-none font-light"
          aria-label="关闭引导"
        >
          ×
        </button>

        {/* 跳过二次确认 Modal（PRD：确定要放弃？狠心跳过 / 继续学习） */}
        <AnimatePresence>
          {showSkipConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-[101] bg-black/30"
              onClick={() => setShowSkipConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl border border-[#E5E5EA] shadow-xl p-6 w-[320px]"
              >
                <p className="text-[15px] text-[#1D1D1F] font-medium">确定要放弃新手引导吗？</p>
                <p className="mt-2 text-[13px] text-[#86868B]">可能会错过核心功能说明。</p>
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSkipConfirm(false)}
                    className="px-4 py-2.5 text-[13px] font-medium text-[#007AFF] hover:bg-[#F0F7FF] rounded-xl transition-colors"
                  >
                    继续学习
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipConfirm}
                    className="px-4 py-2.5 text-[13px] font-medium text-white bg-[#1D1D1F] hover:bg-[#000] rounded-xl transition-colors"
                  >
                    狠心跳过
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 键盘提示（桌面端）- PRD 4.5：← → 切换步骤，Enter 下一步，Esc 跳过引导 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-4 text-white/45 text-[12px]">
          <span className="flex items-center gap-1.5">
            <span className="text-white/55">←</span>
            <span className="text-white/55">→</span>
            <span className="ml-0.5">切换步骤</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-white/55">Esc</span>
            <span className="ml-0.5">跳过引导</span>
          </span>
        </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// 重新开始引导的工具函数
export const resetOnboardingTour = () => {
  localStorage.removeItem(TOUR_STORAGE_KEY);
};

// 检查是否已完成引导
export const hasCompletedOnboarding = () => {
  return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
};

export default OnboardingTour;
