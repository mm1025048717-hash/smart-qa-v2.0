/**
 * 新手引导（游戏式聚光灯）- PRD 4.2 分角色差异化引导
 * 千人千面：管理层极简 3 步，业务负责人 4 步，一线 3 步（不同内容），其余角色适中步骤。
 * 目标：在有限步骤内让用户快速会问、会看效果，不是鼓励跳过。
 */

import { useState, useEffect, useCallback, useRef, useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackTourStart, trackTourComplete, trackTourSkip } from '../utils/tourTracking';

interface TourStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlight?: 'rect' | 'circle';
  padding?: number;
}

// PRD F.2.1 CXO 极简路径：3 步，全程聚光灯高亮当前步骤，收尾聚光灯打在发送按钮；进入数据分析后有追问引导
const TOUR_STEPS_CXO: TourStep[] = [
  { id: 'input-area', target: '[data-tour="input-area"]', title: '如何提问', description: '这是您的专属对话框，支持语音、文字输入。已为您填入「上周销售额是多少？」。', position: 'bottom', highlight: 'rect', padding: 12 },
  { id: 'deep-mode', target: '[data-tour="deep-mode"]', title: '联网搜索', description: '发送前可在此选择「联网搜索」，获取深度分析。选好后点击发送进入数据分析界面。', position: 'bottom', highlight: 'rect', padding: 8 },
  { id: 'send-button', target: '[data-tour="send-button"]', title: '点击发送进入追问', description: '点击右侧蓝色发送按钮，进入数据分析页。回复下方会出现追问引导按钮（如「为什么下降了？」「各地区对比」），可一键追问。', position: 'left', highlight: 'circle', padding: 12 },
];

// PRD F.2.2 业务负责人路径：CXO 步骤 + 看板（步骤 4 自动导航到看板 Tab）
const TOUR_STEPS_MANAGER: TourStep[] = [
  { id: 'input-area', target: '[data-tour="input-area"]', title: '如何提问', description: '这是您的专属对话框，支持语音、文字输入。试试问一句：「上周销售额是多少？」输入后请点击右侧蓝色发送按钮发送。', position: 'bottom', highlight: 'rect', padding: 12 },
  { id: 'deep-mode', target: '[data-tour="deep-mode"]', title: '联网搜索', description: '遇到复杂难题？开启「联网搜索」，获取深度分析。', position: 'bottom', highlight: 'rect', padding: 8 },
  { id: 'capability-actions', target: '[data-tour="capability-actions"]', title: '能力与看板', description: '这里是您关注的指标与能力入口。指标查询、趋势分析、看板生成等，支持订阅推送到飞书。', position: 'top', highlight: 'rect', padding: 8 },
  { id: 'dashboard-tab', target: '[data-tour="dashboard-tab"]', title: '查看看板', description: '点击「看板」可查看核心指标看板，销售、运营、财务一目了然。', position: 'top', highlight: 'rect', padding: 8 },
  { id: 'complete-mgr', target: '[data-tour="helper-button"]', title: '准备就绪', description: '开始输入您的第一个问题吧。点「探索数字员工」可雇佣更专业的 AI 员工。如需帮助随时点这里的小助手。', position: 'left', highlight: 'rect', padding: 8 },
];

// PRD F.2.3 一线业务路径：全能问答、指标/知识库（口径+新建术语）、求助上报
const TOUR_STEPS_FRONTLINE: TourStep[] = [
  { id: 'input-area', target: '[data-tour="input-area"]', title: '全能问答 / 搜索', description: '不仅能查数，还能查黑话。试试输入「什么是 GMV？」或「今年销售额是多少」。', position: 'bottom', highlight: 'rect', padding: 12 },
  { id: 'knowledge-indicators', target: '[data-tour="knowledge-indicators"]', title: '指标与口径', description: '这里可查看指标口径说明，确保和你的认知一致。点击「新建术语」可添加业务黑话、指标定义。', position: 'top', highlight: 'rect', padding: 8 },
  { id: 'complete-fl', target: '[data-tour="helper-button"]', title: '求助与上报', description: '遇到数据不对或系统报错？点这里的小助手，直接召唤技术支持，支持截图上传。', position: 'left', highlight: 'rect', padding: 8 },
];

// PRD F.2.4 数据开发路径：完整引导覆盖所有数据开发功能
const TOUR_STEPS_DEVELOPER: TourStep[] = [
  { id: 'data-dev-tab', target: '[data-tour="data-dev-tab"]', title: '数据开发中心', description: '这是您的数据开发工作区。点击「数据开发」标签进入配置面板，管理数据源、业务建模与指标口径。', position: 'bottom', highlight: 'rect', padding: 8 },
  { id: 'dev-audit', target: '[data-tour="dev-audit"]', title: '审计日志', description: '时刻监控 AI 的回答准确性。这里是所有的问答记录和 SQL 执行日志，支持合规审计与问题追溯。', position: 'top', highlight: 'rect', padding: 8 },
  { id: 'dev-datasource', target: '[data-tour="dev-datasource"]', title: '数据源管理', description: '第一步：建立连接。点击进入数据源管理页，接入 Doris / MySQL 等数据库，支持 SSH 隧道安全连接。', position: 'top', highlight: 'rect', padding: 8 },
  { id: 'dev-modeling', target: '[data-tour="dev-modeling"]', title: '业务建模', description: '第二步：定义模型。管理表结构、配置字段语义类型与同义词，开启动态 SQL 允许 AI 自由组合查询。', position: 'top', highlight: 'rect', padding: 8 },
  { id: 'dev-indicators', target: '[data-tour="dev-indicators"]', title: '指标管理', description: '第三步：统一口径。定义「毛利」「客单价」等计算公式，确保 AI 回答与业务标准一致。', position: 'top', highlight: 'rect', padding: 8 },
  { id: 'complete-dev', target: '[data-tour="helper-button"]', title: '准备就绪', description: '数据开发配置完成后，Agent 即可基于真实数据回答查询。如需帮助随时点击小助手。', position: 'left', highlight: 'rect', padding: 8 },
];

// 默认路径（新手/数据分析师/财务等）：适中步骤，教会会问、会点、会求助
const TOUR_STEPS_DEFAULT: TourStep[] = [
  { id: 'welcome', target: '', title: '欢迎使用', description: '用最少步骤带你了解核心：怎么问、问完怎么看、遇到困难找谁。', position: 'center' },
  { id: 'input-area', target: '[data-tour="input-area"]', title: '如何提问', description: '在输入框直接输入你想分析的问题，例如「今年销售额是多少」「近 3 个月趋势」。', position: 'bottom', highlight: 'rect', padding: 12 },
  { id: 'employee-cards', target: '[data-tour="employee-cards"]', title: '结果与数字员工', description: '问完后会得到图表与结论；这里也会推荐适合你的数字员工，点击可切换。', position: 'top', highlight: 'rect', padding: 8 },
  { id: 'complete-def', target: '[data-tour="helper-button"]', title: '准备就绪', description: '开始你的第一个问题吧。如需帮助随时点击这里的小助手。', position: 'left', highlight: 'rect', padding: 8 },
];

function getStepsForRole(roleId: string | undefined): TourStep[] {
  if (roleId === 'exec') return TOUR_STEPS_CXO;
  if (roleId === 'business') return TOUR_STEPS_MANAGER;
  if (roleId === 'ops') return TOUR_STEPS_FRONTLINE;
  if (roleId === 'developer') return TOUR_STEPS_DEVELOPER;
  return TOUR_STEPS_DEFAULT;
}

const TOUR_STORAGE_KEY = 'yiwen_onboarding_completed_v1';
const APP_VERSION_KEY = 'yiwen_app_version';
const APP_VERSION = '2.0.0';

export interface OnboardingTourProps {
  onComplete?: () => void;
  /** 蒙层收缩到右下角动画结束时立即调用，用于触发悬浮球回归+打光动画 */
  onMorphComplete?: () => void;
  forceShow?: boolean;
  /** 当前用户角色 id，用于 PRD 分角色差异化引导：exec=极简3步, business=4步, ops=一线3步 */
  userRoleId?: string;
  /** 进入某一步时回调（用于 CXO 步骤 1 自动键入演示等） */
  onStepEnter?: (stepId: string, stepIndex: number) => void;
  /** 点击「点我打开 AI 问答」气泡时调用，用于打开小助手面板，保证气泡始终可点 */
  onGuideBubbleClick?: () => void;
}

export const OnboardingTour = ({ onComplete, onMorphComplete, forceShow = false, userRoleId, onStepEnter, onGuideBubbleClick }: OnboardingTourProps) => {
  const steps = useMemo(() => getStepsForRole(userRoleId), [userRoleId]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // PRD 6：版本更新时仅对新功能做增量引导，不重播全量——新版本清除完成标记
  useEffect(() => {
    const stored = localStorage.getItem(APP_VERSION_KEY);
    if (stored !== APP_VERSION) {
      localStorage.removeItem(TOUR_STORAGE_KEY);
      localStorage.setItem(APP_VERSION_KEY, APP_VERSION);
    }
  }, []);

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

  // 埋点：引导开始
  useEffect(() => {
    if (isVisible && steps.length) {
      trackTourStart(userRoleId, steps.length);
    }
  }, [isVisible]); // eslint-disable-line react-hooks/exhaustive-deps -- only on visible

  // steps 变化时校正 currentStep，避免越界导致 step 为 undefined
  useEffect(() => {
    if (currentStep >= steps.length && steps.length > 0) {
      setCurrentStep(steps.length - 1);
    }
  }, [steps.length, currentStep]);

  // 进入某步时回调（CXO 步骤 1 自动键入等）
  useEffect(() => {
    if (!isVisible || !steps[currentStep]) return;
    onStepEnter?.(steps[currentStep].id, currentStep);
  }, [isVisible, currentStep, steps, onStepEnter]);

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
          handleSkipClick();
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

  // 完成引导（最后一步可带动效：蒙版缩到右下角变成小助手；CXO 不收缩，直接关闭以便用户点击发送）
  const handleComplete = useCallback(() => {
    const lastStep = currentStep >= steps.length - 1;
    const isCxo = userRoleId === 'exec';
    if (lastStep && !isMorphing && !isCxo) {
      setIsMorphing(true);
      return;
    }
    trackTourComplete(userRoleId, steps.length);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  }, [currentStep, steps.length, isMorphing, onComplete, userRoleId]);

  const [showBubble, setShowBubble] = useState(false);
  const onMorphCompleteRef = useRef(onMorphComplete);
  onMorphCompleteRef.current = onMorphComplete;

  // 蒙层收缩动画约 0.5s，结束后仅一次通知父组件触发悬浮球回归+打光（只依赖 isMorphing，避免因 onMorphComplete 引用变化重复设定时器导致聚光灯重复）
  const MORPH_DURATION_MS = 500;
  useEffect(() => {
    if (!isMorphing) return;
    const t0 = setTimeout(() => onMorphCompleteRef.current?.(), MORPH_DURATION_MS);
    return () => clearTimeout(t0);
  }, [isMorphing]);

  // 变形动画结束后先显示气泡（PRD F.3.1），5 秒后再关闭
  useEffect(() => {
    if (!isMorphing) return;
    const t1 = setTimeout(() => setShowBubble(true), 800);
    return () => clearTimeout(t1);
  }, [isMorphing]);

  useEffect(() => {
    if (!showBubble) return;
    trackTourComplete(userRoleId, steps.length);
    const t2 = setTimeout(() => {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      setIsVisible(false);
      onComplete?.();
    }, 5000);
    return () => clearTimeout(t2);
  }, [showBubble, onComplete, userRoleId, steps.length]);

  // 跳过引导：先弹出二次确认（PRD：挽留式跳过）
  const handleSkipClick = () => setShowSkipConfirm(true);
  const handleSkipConfirm = () => {
    trackTourSkip(userRoleId, steps.length, currentStep + 1);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setShowSkipConfirm(false);
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  if (!step) return null;

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
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    // 垂直方向限制在视口内，避免引导框被裁切
    const clampTop = (idealTop: number) =>
      Math.max(margin, Math.min(vh - tooltipHeight - margin, idealTop));
    const clampLeft = (idealLeft: number) =>
      Math.max(margin, Math.min(vw - tooltipWidth - margin, idealLeft));

    switch (step.position) {
      case 'top': {
        const top = clampTop(targetRect.top - tooltipHeight - arrowOffset);
        return {
          top: `${top}px`,
          left: `${clampLeft(targetRect.left + targetRect.width / 2 - tooltipWidth / 2)}px`,
        };
      }
      case 'bottom': {
        const top = clampTop(targetRect.bottom + arrowOffset);
        return {
          top: `${top}px`,
          left: `${clampLeft(targetRect.left + targetRect.width / 2 - tooltipWidth / 2)}px`,
        };
      }
      case 'left': {
        const idealTop = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        const top = clampTop(idealTop);
        const left = Math.max(margin, targetRect.left - tooltipWidth - arrowOffset);
        return {
          top: `${top}px`,
          left: `${left}px`,
        };
      }
      case 'right': {
        const top = clampTop(targetRect.top + targetRect.height / 2 - tooltipHeight / 2);
        return {
          top: `${top}px`,
          left: `${Math.min(vw - tooltipWidth - margin, targetRect.right + arrowOffset)}px`,
        };
      }
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  // 生成遮罩路径（高亮区域透明）；支持 rect 与 circle（聚光灯打在圆形按钮上）
  const getMaskPath = () => {
    if (!targetRect || isCenterStep) {
      return '';
    }

    const outer = `M 0 0 L ${window.innerWidth} 0 L ${window.innerWidth} ${window.innerHeight} L 0 ${window.innerHeight} Z`;

    if (step.highlight === 'circle') {
      const cx = targetRect.left + targetRect.width / 2;
      const cy = targetRect.top + targetRect.height / 2;
      const radius = Math.max(targetRect.width, targetRect.height) / 2 + padding;
      const circle = `M ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy} Z`;
      return `${outer} ${circle}`;
    }

    const x = targetRect.left - padding;
    const y = targetRect.top - padding;
    const w = targetRect.width + padding * 2;
    const h = targetRect.height + padding * 2;
    const r = 16; // 圆角半径
    return `${outer} M ${x + r} ${y}
      L ${x + w - r} ${y}
      Q ${x + w} ${y} ${x + w} ${y + r}
      L ${x + w} ${y + h - r}
      Q ${x + w} ${y + h} ${x + w - r} ${y + h}
      L ${x + r} ${y + h}
      Q ${x} ${y + h} ${x} ${y + h - r}
      L ${x} ${y + r}
      Q ${x} ${y} ${x + r} ${y}
      Z`;
  };

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        ref={overlayRef}
        initial={false}
        animate={
          isMorphing
            ? { opacity: 0, top: 'auto', left: 'auto', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: 'transparent' }
            : { opacity: 1, top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', borderRadius: 0, backgroundColor: 'transparent' }
        }
        exit={{ opacity: 0 }}
        transition={{ duration: isMorphing ? 0.5 : 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed z-[100] bg-transparent"
        style={{ pointerEvents: 'none' }}
      >
        {/* 聚光灯式引导：每步用 SVG 镂空高亮当前目标，暗区遮罩其余区域；变形时隐藏；镂空区可穿透点击 */}
        <div className={isMorphing ? 'opacity-0 pointer-events-none' : ''}>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto"
          aria-hidden
          onClick={(e) => e.stopPropagation()}
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

        {/* 高亮区域边框 - 发送按钮用圆形聚光灯 */}
        {targetRect && !isCenterStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={step.highlight === 'circle' ? 'absolute pointer-events-none rounded-full border-2 border-[#007AFF]' : 'absolute pointer-events-none rounded-2xl border-2 border-[#007AFF]'}
            style={
              step.highlight === 'circle'
                ? (() => {
                    const size = Math.max(targetRect.width, targetRect.height) + padding * 2;
                    return {
                      left: targetRect.left + targetRect.width / 2 - size / 2,
                      top: targetRect.top + targetRect.height / 2 - size / 2,
                      width: size,
                      height: size,
                    };
                  })()
                : {
                    left: targetRect.left - padding,
                    top: targetRect.top - padding,
                    width: targetRect.width + padding * 2,
                    height: targetRect.height + padding * 2,
                  }
            }
          />
        )}

        {/* 提示卡片 - 极简：白底 + 细边框；PRD 6 小屏重排：最大 95vw；需可点击 */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-[min(380px,95vw)] max-w-[95vw] bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden pointer-events-auto"
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
                {isLastStep ? '完成引导' : '下一步'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* 关闭引导：先二次确认（PRD：挽留式跳过） */}
        <button
          onClick={handleSkipClick}
          className="absolute top-6 right-6 w-9 h-9 rounded-full border border-white/30 text-white/90 hover:text-white hover:border-white/50 flex items-center justify-center transition-colors text-[20px] leading-none font-light pointer-events-auto"
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
              className="absolute inset-0 flex items-center justify-center z-[101] bg-black/30 pointer-events-auto"
              onClick={() => setShowSkipConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl border border-[#E5E5EA] shadow-xl p-6 w-[320px] pointer-events-auto"
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

      {/* PRD F.3.1：变形完成后头像旁气泡，可点击打开小助手（pointer-events-auto），5 秒后自动消失 */}
      <Fragment key="tour-bubble">
        <AnimatePresence>
          {showBubble && (
            <motion.button
              key="bubble"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={() => onGuideBubbleClick?.()}
              className="fixed right-[100px] bottom-[88px] z-[65] max-w-[260px] px-4 py-3 rounded-2xl bg-white border border-[#E5E5EA] shadow-lg text-[13px] text-[#1D1D1F] leading-relaxed text-left cursor-pointer hover:bg-[#F9F9FB] hover:border-[#007AFF]/30 active:scale-[0.98] transition-colors"
            >
              点我打开 AI 问答，随时提问、截图上报、知识库检索。
            </motion.button>
          )}
        </AnimatePresence>
      </Fragment>
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
