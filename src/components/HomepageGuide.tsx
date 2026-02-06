/**
 * 首页引导 - 契合亿问 Data Agent PRD，覆盖智能输入、数字员工、能力入口与追问交互
 * 点击右下角头像触发，聚光灯高亮 + 白色 GUIDE 卡片
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'dataagent_home_guide_completed_v1';

interface GuideStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position: 'bottom' | 'center' | 'right';
  highlight?: 'rect' | 'circle';
  padding?: number;
}

// 引导步骤：与 PRD 功能模块对应，文案自然、不死板，数字员工单独做引导
const STEPS: GuideStep[] = [
  {
    id: 'welcome',
    target: '',
    title: '用一句话拿到数据洞察',
    description: '这里是亿问 Data Agent，不用记指标、不用写 SQL，用业务语言提问就行。接下来带你快速认认地盘～',
    position: 'center',
    padding: 0,
  },
  {
    id: 'input-area',
    target: '[data-tour="input-area"]',
    title: '想说啥就输啥',
    description: '直接说你关心的事：比如「上周销售额是多少」「为什么 11 月掉了」。支持文字输入，下方还能选联网或本地模式，复杂问题可以开联网做深度分析。',
    position: 'bottom',
    highlight: 'rect',
    padding: 12,
  },
  {
    id: 'agent-selector',
    target: '[data-tour="agent-selector"]',
    title: '数字员工：选对人，答得准',
    description: '不同数字员工有不同专长：Alisa 查数准、Nora 会做分析和讲故事、归因哥专治「为什么」。根据你的角色已经推荐好了，也可以随时切换。',
    position: 'bottom',
    highlight: 'rect',
    padding: 10,
  },
  {
    id: 'capability-actions',
    target: '[data-tour="capability-actions"]',
    title: '懒得打字就点胶囊',
    description: '指标查询、趋势分析、对比、归因诊断、看板生成… 点一下就能把预设问题填进输入框，秒开分析。',
    position: 'bottom',
    highlight: 'rect',
    padding: 10,
  },
  {
    id: 'employee-cards',
    target: '[data-tour="employee-cards"]',
    title: '场景卡片与推荐员工',
    description: '这里按业务场景（销售概览、异常诊断、用户分析等）推荐了数字员工和示例问题，点卡片就能直接问，不用自己想话术。',
    position: 'bottom',
    highlight: 'rect',
    padding: 12,
  },
  {
    id: 'sidebar',
    target: '[data-tour="sidebar"]',
    title: '左侧栏：任务与导航',
    description: '新建任务清空输入、重新开始；搜索可筛任务记录；「探索数字员工」一键滚到推荐区；下方是历史提问，点一下就能再问。底部可随时换角色，系统会按角色推荐不同员工。',
    position: 'right',
    highlight: 'rect',
    padding: 12,
  },
  {
    id: 'follow-up',
    target: '',
    title: '回复可以接着玩',
    description: '分析结果里的图表可以点开看详情、下钻；有疑问直接追问「为什么下降了」「哪个区域拖后腿」就行。准备就绪，随便问～',
    position: 'center',
    padding: 0,
  },
];

interface HomepageGuideProps {
  onComplete?: () => void;
  /** 强制显示（例如从设置里「再次查看引导」） */
  forceShow?: boolean;
  /** 延迟多少 ms 后显示，避免与角色选择等冲突 */
  delayMs?: number;
}

export function HomepageGuide({
  onComplete,
  forceShow = false,
  delayMs = 600,
}: HomepageGuideProps) {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;
  const isCenterStep = !step.target;

  const prev = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const updateTargetRect = useCallback(() => {
    if (!step.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [step.target]);

  // 仅在被强制展示时显示（由父组件通过 forceShow 控制，如点击右下角头像触发）
  useEffect(() => {
    if (forceShow) {
      setVisible(true);
      setStepIndex(0);
    } else {
      setVisible(false);
    }
  }, [forceShow]);

  useEffect(() => {
    if (!visible) return;
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [visible, stepIndex, updateTargetRect]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    onComplete?.();
  };

  const skip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    onComplete?.();
  };

  const next = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      finish();
    }
  };

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
      if (e.key === 'Enter' || e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, stepIndex]);

  if (!visible) return null;

  const padding = step.padding ?? 8;

  // 遮罩路径：全屏暗色，高亮区域镂空
  const getMaskPath = () => {
    if (!targetRect || isCenterStep) return '';
    const x = targetRect.left - padding;
    const y = targetRect.top - padding;
    const w = targetRect.width + padding * 2;
    const h = targetRect.height + padding * 2;
    const r = step.highlight === 'circle' ? Math.max(w, h) / 2 : 12;
    if (step.highlight === 'circle') {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const rad = Math.max(w, h) / 2 + 4;
      return `
        M 0 0 L ${window.innerWidth} 0 L ${window.innerWidth} ${window.innerHeight} L 0 ${window.innerHeight} Z
        M ${cx + rad} ${cy} A ${rad} ${rad} 0 1 1 ${cx - rad} ${cy} A ${rad} ${rad} 0 1 1 ${cx + rad} ${cy}
      `;
    }
    return `
      M 0 0 L ${window.innerWidth} 0 L ${window.innerWidth} ${window.innerHeight} L 0 ${window.innerHeight} Z
      M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r}
      L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h}
      L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z
    `;
  };

  // 提示卡位置：居中 / 目标下方 / 目标右侧（左侧栏时）
  const cardStyle: React.CSSProperties = isCenterStep
    ? {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    : step.position === 'right' && targetRect
    ? {
        top: `${Math.max(24, targetRect.top + targetRect.height / 2 - 120)}px`,
        left: `${targetRect.right + padding + 16}px`,
        transform: 'none',
      }
    : {
        top: targetRect
          ? `${targetRect.bottom + padding + 16}px`
          : '50%',
        left: targetRect
          ? `${Math.max(24, Math.min(window.innerWidth - 400, targetRect.left + targetRect.width / 2 - 200))}px`
          : '50%',
        transform: targetRect ? 'none' : 'translate(-50%, -50%)',
      };

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100]"
        style={{ pointerEvents: 'auto' }}
      >
        {/* 半透明遮罩 + 镂空高亮 */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          {isCenterStep ? (
            <rect x={0} y={0} width="100%" height="100%" fill="rgba(0,0,0,0.6)" />
          ) : (
            <path d={getMaskPath()} fill="rgba(0,0,0,0.6)" fillRule="evenodd" />
          )}
        </svg>

        {/* 高亮区域描边（可选光圈感） */}
        {targetRect && !isCenterStep && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute pointer-events-none"
            style={{
              left: targetRect.left - padding,
              top: targetRect.top - padding,
              width: targetRect.width + padding * 2,
              height: targetRect.height + padding * 2,
              borderRadius: step.highlight === 'circle' ? '50%' : 16,
              border: '2px solid rgba(0, 122, 255, 0.5)',
              boxShadow: '0 0 0 4px rgba(0, 122, 255, 0.12)',
            }}
          />
        )}

        {/* 白色 GUIDE 卡片 */}
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-xl overflow-hidden"
          style={cardStyle}
        >
          <div className="px-5 pt-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-[#007AFF] uppercase tracking-wide">
                Guide
              </span>
              <span className="text-[12px] text-[#8E8E93]">
                {stepIndex + 1}/{STEPS.length}
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#1D1D1F] mb-2">
              {step.title}
            </h3>
            <p className="text-[13px] text-[#3A3A3C] leading-relaxed mb-5">
              {step.description}
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button
                    type="button"
                    onClick={prev}
                    className="px-3 py-2 text-[13px] font-medium text-[#8E8E93] hover:text-[#1D1D1F] hover:bg-[#F2F2F7] rounded-lg transition-colors"
                  >
                    上一步
                  </button>
                )}
                {!isLast && (
                  <button
                    type="button"
                    onClick={skip}
                    className="px-3 py-2 text-[13px] font-medium text-[#8E8E93] hover:text-[#1D1D1F] hover:bg-[#F2F2F7] rounded-lg transition-colors"
                  >
                    跳过
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={next}
                className="px-4 py-2 text-[13px] font-medium text-white bg-[#007AFF] hover:bg-[#0051D5] rounded-lg transition-colors"
              >
                {isLast ? '开始使用' : '下一步'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function resetHomepageGuide() {
  localStorage.removeItem(STORAGE_KEY);
}

export default HomepageGuide;
