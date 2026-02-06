/**
 * 会议口述稿气泡 - 可打开的气泡，用于开会时口述 PRD 设计思路与看完后的想法
 * 使用 Portal 挂载到 body，保证气泡相对视口正中间显示
 * 触发按钮支持拖拽，可随意移动位置，位置会记住
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X } from 'lucide-react';

const MEETING_BUBBLE_POSITION_KEY = 'yiwen_meeting_bubble_position';

/** 可跳转到产品对应功能的锚点 */
export type NarrativeNavigateTarget =
  | 'role-picker'      // 角色选择（侧边栏底部）
  | 'input'            // 主输入框
  | 'agent-selector'   // 数字员工选择
  | 'deep-mode'        // 深度模式/联网
  | 'capability-actions'  // 指标查询、趋势分析等
  | 'employee-cards'  // 为XX推荐的数字员工
  | 'explore-employees'   // 探索数字员工
  | 'helper'          // 体验引导（聚光灯引导）
  | 'helper-panel';   // 亿问小助手帮助面板（帮助/截图上报/转人工）

interface NarrativeItem {
  text: string;
  link?: { label: string; target: NarrativeNavigateTarget };
}

const NARRATIVE_SECTIONS: { title: string; items: NarrativeItem[] }[] = [
  {
    title: '一、PRD 设计思路（口述要点）',
    items: [
      { text: '为什么做：Data Agent 很强但认知负荷高。老板 30 秒学不会就觉得难用，开发者配置上百项、学习成本高；缺分角色引导 → 小白被吓退、专家嫌啰嗦。' },
      { text: '四个设计哲学：千人千面（CEO 和开发看到的引导完全不同）、按需加载（点开数字员工才讲数字员工）、有的放矢（引导是为了教会完成任务）、无缝流转（引导结束变成左上角小助手）。', link: { label: '前往小助手', target: 'helper-panel' } },
      { text: '四类角色：CXO / 业务负责人 / 一线业务 / 数据开发。欢迎页必须选角色，决定后续菜单复杂度和引导路径。', link: { label: '前往角色选择', target: 'role-picker' } },
      { text: '用户旅程：全屏欢迎蒙版 → 角色选择（四张卡片必选）→ 分角色 Spotlight 高光引导（聚焦、不可点击蒙版关闭、有跳过二次确认）→ 最后一步「完成」时蒙版缩到左上角变成亿问小助手。', link: { label: '前往小助手', target: 'helper-panel' } },
      { text: 'CXO 路径：极简 3 步——如何提问（输入框 + demo）、深度模式开关、追问与图表交互。', link: { label: '主输入框', target: 'input' } },
      { text: '业务负责人：在 CXO 基础上 + 看板 Tab 引导；点「数字员工市场」时按需触发数字员工说明。', link: { label: '探索数字员工', target: 'explore-employees' } },
      { text: '一线业务：聚焦指标口径、知识库、新建术语；左上角悬浮球求助与上报。', link: { label: '能力与数字员工', target: 'employee-cards' } },
      { text: '数据开发：分布式引导。全局先讲审计日志；首次点数据源 / 业务建模 / 指标管理再分别 Lazy 讲（业务建模强调语义类型和同义词）。' },
      { text: '亿问小助手：RAG 文档问答、多模态截图诊断、页面感知、「这个怎么配」能结合当前页、支持转人工/工单。', link: { label: '前往小助手', target: 'helper-panel' } },
    ],
  },
  {
    title: '二、看完后的想法（开会可说的总结）',
    items: [
      { text: '把「谁在用」放在最前面，用角色决定看到什么、学什么，避免一刀切，这点是核心。', link: { label: '前往角色选择', target: 'role-picker' } },
      { text: '引导不是为了炫功能，是「教会完成任务」，所以有步骤、有聚焦、有进度条，还有挽留式的跳过确认。', link: { label: '体验引导', target: 'helper' } },
      { text: '结束不是结束，是形态转换：蒙版缩成小助手，体验连贯，也符合「无缝流转」哲学。', link: { label: '前往小助手', target: 'helper-panel' } },
      { text: '埋点、分辨率适配、误触跳过的二次确认、版本更新后的增量引导，PRD 都考虑了，落地时要跟进去做。' },
      { text: '整体上：降低认知负荷 + 分角色 + 按需加载 + 引导结束变助手，这套思路可以直接在会上按「背景 → 哲学 → 角色 → 旅程 → 各路径差异 → 小助手」口述出来。', link: { label: '前往小助手', target: 'helper-panel' } },
    ],
  },
];

function loadSavedPosition(): { left: number; top: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(MEETING_BUBBLE_POSITION_KEY);
    if (!raw) return null;
    const { left, top } = JSON.parse(raw) as { left: number; top: number };
    const margin = 8;
    const btnW = 140;
    const btnH = 44;
    if (left >= margin && top >= margin && left <= window.innerWidth - btnW - margin && top <= window.innerHeight - btnH - margin) {
      return { left, top };
    }
  } catch {
    // ignore
  }
  return null;
}

export interface MeetingNarrativeBubbleProps {
  /** 点击口述稿中的「跳转」链接时调用，传入目标锚点；若提供则关闭气泡并跳转到首页对应功能 */
  onNavigateTo?: (target: NarrativeNavigateTarget) => void;
}

export function MeetingNarrativeBubble({ onNavigateTo }: MeetingNarrativeBubbleProps = {}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(() => loadSavedPosition());
  const constraintsRef = useRef<HTMLDivElement>(null);
  const justDraggedRef = useRef(false);

  useEffect(() => {
    if (position) {
      try {
        localStorage.setItem(MEETING_BUBBLE_POSITION_KEY, JSON.stringify(position));
      } catch {
        // ignore
      }
    }
  }, [position]);

  const handleClick = () => {
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    setOpen(true);
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent) => {
    const el = (e as unknown as { target: HTMLElement }).target;
    if (el?.getBoundingClientRect) {
      const rect = el.getBoundingClientRect();
      setPosition({ left: rect.left, top: rect.top });
    }
    justDraggedRef.current = true;
  };

  return (
    <>
      {/* 拖拽约束区域：整个视口，不阻挡点击 */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[69]" aria-hidden />

      {/* 可拖拽的触发按钮 */}
      <motion.button
        key={position ? `${position.left}-${position.top}` : 'default'}
        type="button"
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.08}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, x: position ? 0 : -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        onClick={handleClick}
        style={position ? { left: position.left, top: position.top } : undefined}
        className={`fixed z-[70] flex items-center gap-2 px-3 py-2 rounded-full bg-[#1D1D1F] text-white border border-[#E5E5EA] shadow-lg hover:bg-[#2C2C2E] transition-colors cursor-grab active:cursor-grabbing select-none touch-none ${position ? '' : 'left-6 top-6'}`}
        aria-label="打开会议口述稿（可拖拽移动）"
      >
        <FileText className="w-5 h-5 flex-shrink-0 pointer-events-none" />
        <span className="text-sm font-medium whitespace-nowrap pointer-events-none">会议口述稿</span>
      </motion.button>

      {/* 蒙版 + 气泡用 Portal 挂到 body，保证相对整个视口居中 */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/40 z-[80]"
                  onClick={() => setOpen(false)}
                  aria-hidden
                />
                {/* 用 flex 居中容器保证弹窗严格在视口正中间 */}
                <div className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-[min(90vw,520px)] max-h-[85vh] flex flex-col rounded-2xl bg-white border border-[#E5E5EA] shadow-xl overflow-hidden pointer-events-auto"
                  >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5EA] bg-[#F5F5F7]">
                    <h2 className="text-base font-semibold text-[#1D1D1F]">会议口述稿 · PRD 设计思路与想法</h2>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="p-1.5 rounded-lg text-[#86868B] hover:bg-[#E5E5EA] hover:text-[#1D1D1F] transition-colors"
                      aria-label="关闭"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                    {NARRATIVE_SECTIONS.map((section, i) => (
                      <section key={i}>
                        <h3 className="text-sm font-semibold text-[#1D1D1F] mb-2">{section.title}</h3>
                        <ul className="space-y-2">
                          {section.items.map((item, j) => (
                            <li key={j} className="text-[13px] text-[#3A3A3C] leading-relaxed pl-3 border-l-2 border-[#007AFF]/40 flex flex-col gap-1">
                              <span>{item.text}</span>
                              {item.link && onNavigateTo && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpen(false);
                                    onNavigateTo(item.link!.target);
                                  }}
                                  className="self-start text-[12px] text-[#007AFF] hover:underline font-medium"
                                >
                                  → {item.link.label}
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

export default MeetingNarrativeBubble;
