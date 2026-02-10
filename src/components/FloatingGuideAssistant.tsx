/**
 * 浮动引导助手 - 右下角按钮 + 亿问小助手帮助面板（PRD 真实功能）
 * 帮助文档、RAG 知识库问答、截图上报（多模态诊断）、转人工、重新体验引导
 */

import type { ComponentType } from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, FileText, Camera, HeadphonesIcon, Sparkles, X, Check, Send, Zap, BookOpen } from 'lucide-react';
import { searchKnowledge } from '../data/helperKnowledge';
import { ASSISTANT_FIXED_REPLIES, type FixedReplyItem, type FixedReplyIconId } from '../data/assistantFixedReplies';

const FIXED_REPLY_ICONS: Record<FixedReplyIconId, ComponentType<{ className?: string }>> = {
  zap: Zap,
  book: BookOpen,
  file: FileText,
  camera: Camera,
  headset: HeadphonesIcon,
  sparkles: Sparkles,
};

/** 知识库对话单条消息 */
interface RagMessage {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
}

/** 多模态诊断结果（便于后续接入真实 OCR/视觉 API） */
export interface DiagnosisResult {
  summary: string;
  details?: string;
  suggestion: string;
  /** 识别到的报错关键词等，可选 */
  keywords?: string[];
}

/** 截图诊断：当前为结构化占位，后续可替换为真实 OCR/视觉接口 */
export async function diagnoseScreenshot(_file: File | null): Promise<DiagnosisResult> {
  // TODO: 接入真实 API，例如 POST /api/vision/diagnose { image: base64 }
  await new Promise((r) => setTimeout(r, 1200));
  return {
    summary: '检测到可能的问题',
    details: '页面报错或网络异常；若截图中含错误信息，将在此解析并给出建议。',
    suggestion: '建议检查网络连接后重试；若持续出现可提交给支持进一步排查。',
    keywords: ['网络异常', '报错'],
  };
}

export interface FloatingGuideAssistantProps {
  /** 点击「重新体验引导」时触发聚光灯式新手引导 */
  onTriggerGuide?: () => void;
  /** 点击「查看帮助文档」时跳转到帮助/引导面板 */
  onOpenHelpDoc?: () => void;
  agentName?: string;
  agentAvatar?: string;
  /** 受控：是否展开帮助面板（口述稿「前往小助手」时由外部设为 true） */
  open?: boolean;
  /** 受控：面板展开/关闭回调 */
  onOpenChange?: (open: boolean) => void;
  onQuestionSelect?: (question: string) => void;
  autoOpen?: boolean;
  onAutoOpenComplete?: () => void;
  userRole?: string;
  /** PRD 4.4 页面感知：当前所在页，用于「这个怎么配？」等上下文回答 */
  pageContext?: string;
  /** PRD F.3.1：引导结束气泡消失后 5 秒内头像半透明驻留 */
  dimmed?: boolean;
  /** 引导完成后触发一次悬浮球缩放回归动画（从缩小到正常），传变化的值即可触发 */
  returnAnimationKey?: number;
  /** 当前是否处于「聚光灯」状态（周围暗、只照亮小球）；用户点击小球时可调用以关闭聚光灯 */
  spotlightActive?: boolean;
  onSpotlightDismiss?: () => void;
}

export const FloatingGuideAssistant = ({
  onTriggerGuide,
  onOpenHelpDoc,
  agentName = '亿问小助手',
  agentAvatar,
  open: controlledOpen,
  onOpenChange,
  pageContext,
  dimmed = false,
  returnAnimationKey,
  spotlightActive,
  onSpotlightDismiss,
}: FloatingGuideAssistantProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  };

  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [screenshotSuccess, setScreenshotSuccess] = useState(false);
  const [screenshotPhase, setScreenshotPhase] = useState<'form' | 'analyzing' | 'diagnosis' | 'submitted'>('form');
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const screenshotFileRef = useRef<File | null>(null);

  // 自然语言对话：仅保留对话视图，无菜单切换
  const [ragMessages, setRagMessages] = useState<RagMessage[]>([]);
  const [ragInput, setRagInput] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const ragListRef = useRef<HTMLDivElement>(null);

  const handleRagSend = () => {
    const q = ragInput.trim();
    if (!q || ragLoading) return;
    setRagMessages((prev) => [...prev, { role: 'user', content: q }]);
    setRagInput('');
    setRagLoading(true);
    setTimeout(() => {
      const result = searchKnowledge(q);
      if (result) {
        setRagMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.answer, source: result.source },
        ]);
      } else {
        setRagMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '暂未找到相关答案，请换一种问法或查看帮助文档。' },
        ]);
      }
      setRagLoading(false);
    }, 400);
  };

  useEffect(() => {
    ragListRef.current?.scrollTo({ top: ragListRef.current.scrollHeight, behavior: 'smooth' });
  }, [ragMessages, ragLoading]);

  /** 自然语言对话面板（唯一视图）：标题+当前页、欢迎/对话区、输入栏+快捷技能，适配弹窗尺寸 */
  const renderConversationPanel = () => (
    <div className="flex flex-col w-[min(360px,90vw)] h-[min(480px,80vh)] bg-white rounded-2xl overflow-hidden">
      {/* 标题栏：与当前界面一致，仅关闭按钮 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5EA] bg-[#F5F5F7] flex-shrink-0">
        <div className="min-w-0">
          <span className="text-[13px] font-semibold text-[#1D1D1F]">{agentName}</span>
          {pageContext && (
            <p className="text-[11px] text-[#86868B] mt-0.5 truncate">当前：{pageContext}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-1.5 rounded-lg text-[#86868B] hover:bg-[#E5E5EA] hover:text-[#1D1D1F] flex-shrink-0"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* 对话区：欢迎语 或 消息列表 */}
      <div
        ref={ragListRef}
        className="flex-1 overflow-y-auto min-h-0 flex flex-col"
      >
        {ragMessages.length === 0 && !ragLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 text-center">
            <p className="text-[17px] font-medium text-[#1D1D1F]">有什么我能帮你的吗？</p>
            <p className="mt-2.5 text-[12px] text-[#86868B] max-w-[260px] leading-relaxed">
              发消息或输入「/」选择技能，从知识库查答案、查看帮助、截图上报、转人工等。
            </p>
            <p className="mt-4 text-[11px] text-[#86868B]">遇到困难点我，我是你的 24 小时技术顾问。</p>
            <button
              type="button"
              onClick={() => { setOpen(false); onOpenHelpDoc?.(); }}
              className="mt-2 text-[11px] text-[#007AFF] hover:underline"
            >
              若无法连接可查看帮助中心
            </button>
          </div>
        ) : (
          <div className="flex-1 px-4 py-3 space-y-4">
            {ragMessages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={msg.role === 'user'
                    ? 'max-w-[85%] px-3 py-2 rounded-2xl rounded-br-md bg-[#007AFF] text-white text-[13px]'
                    : 'max-w-[90%] px-3 py-2.5 rounded-2xl rounded-bl-md bg-[#F2F2F7] text-[#1D1D1F] text-[13px] leading-relaxed'}
                >
                  <p>{msg.content}</p>
                  {msg.source && (
                    <p className="mt-2 text-[11px] text-[#007AFF]">引用自：{msg.source}</p>
                  )}
                </div>
              </div>
            ))}
            {ragLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2.5 rounded-2xl rounded-bl-md bg-[#F2F2F7] text-[#86868B] text-[13px]">正在查找…</div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* 底部：输入栏 + 快捷技能（原菜单能力并入） */}
      <div className="flex-shrink-0 p-3 pt-2 pb-3 bg-[#F5F5F7] border-t border-[#E5E5EA]">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={ragInput}
            onChange={(e) => setRagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRagSend(); } }}
            placeholder="发消息或输入「/」选择技能"
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5E5EA] bg-white text-[13px] placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF]/50 focus:ring-1 focus:ring-[#007AFF]/20"
          />
          <button
            type="button"
            onClick={handleRagSend}
            disabled={ragLoading || !ragInput.trim()}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#007AFF] text-white hover:bg-[#0051D5] disabled:opacity-50 flex-shrink-0"
            aria-label="发送"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {ASSISTANT_FIXED_REPLIES.filter((item) => item.action !== 'guide' || onTriggerGuide).map((item: FixedReplyItem) => {
            const Icon = FIXED_REPLY_ICONS[item.icon];
            const isGuide = item.action === 'guide';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.type === 'fill' && item.phrase != null) {
                    setRagInput((s) => (s ? `${s} ` : '') + item.phrase);
                    return;
                  }
                  if (item.type === 'action' && item.action === 'help_doc') {
                    setOpen(false);
                    onOpenHelpDoc?.();
                  } else if (item.type === 'action' && item.action === 'screenshot') {
                    setShowScreenshotModal(true);
                    setScreenshotSuccess(false);
                    setScreenshotPhase('form');
                    setDiagnosisResult(null);
                    screenshotFileRef.current = null;
                  } else if (item.type === 'action' && item.action === 'ticket') {
                    setShowTicketModal(true);
                    setTicketSuccess(false);
                  } else if (item.type === 'action' && item.action === 'guide') {
                    setOpen(false);
                    onTriggerGuide?.();
                  }
                }}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-[#E5E5EA] text-[11px] hover:bg-[#F0F0F0] ${isGuide ? 'text-[#007AFF] hover:bg-[#F0F7FF] font-medium' : 'text-[#3A3A3C]'}`}
              >
                <Icon className={`w-3 h-3 ${isGuide ? '' : 'text-[#007AFF]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <span className="text-[10px] text-[#86868B] ml-auto">Enter 发送</span>
        </div>
      </div>
    </div>
  );

  const isReturnAnimation = returnAnimationKey != null && returnAnimationKey > 0;

  return (
    <motion.div
      key={returnAnimationKey ?? 'default'}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: dimmed ? 0.5 : 1 }}
      transition={{
        scale: { delay: isReturnAnimation ? 0 : 0.5, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.35 },
      }}
      className="fixed bottom-6 right-6 z-[70]"
    >
      <motion.button
        type="button"
        data-tour="helper-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (spotlightActive) onSpotlightDismiss?.();
          setOpen(!isOpen);
        }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center transition-colors bg-white text-[#5C5C5E] border border-[#E5E5EA] shadow-md hover:bg-[#F9F9FB] hover:border-[#D1D1D6]"
        aria-label={isOpen ? '关闭帮助' : `打开${agentName}`}
      >
        {agentAvatar ? (
          <img src={agentAvatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-[#007AFF]" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[69]"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute bottom-full right-0 mb-2 z-[71]"
            >
              {renderConversationPanel()}
            </motion.div>

            {/* 截图上报弹窗 - 真实表单 */}
            <AnimatePresence>
              {showScreenshotModal && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 z-[80]"
                    onClick={() => { if (screenshotPhase !== 'submitted' && !screenshotSuccess) { setShowScreenshotModal(false); setScreenshotPhase('form'); } }}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    onClick={(e) => e.stopPropagation()}
                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[81] w-[min(90vw,360px)] rounded-2xl bg-white border border-[#E5E5EA] shadow-xl p-5"
                  >
                    {screenshotPhase === 'submitted' || screenshotSuccess ? (
                      <div className="py-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-[#34C759]/20 flex items-center justify-center mx-auto mb-3">
                          <Check className="w-6 h-6 text-[#34C759]" />
                        </div>
                        <p className="text-[15px] font-medium text-[#1D1D1F]">已提交</p>
                        <p className="text-[13px] text-[#86868B] mt-1">我们会尽快排查并联系您</p>
                        <button
                          type="button"
                          onClick={() => { setShowScreenshotModal(false); setScreenshotPhase('form'); setScreenshotSuccess(false); }}
                          className="mt-4 px-4 py-2.5 text-[13px] font-medium text-white bg-[#007AFF] rounded-xl"
                        >
                          关闭
                        </button>
                      </div>
                    ) : screenshotPhase === 'analyzing' ? (
                      <div className="py-8 text-center">
                        <div className="w-10 h-10 rounded-full bg-[#007AFF]/10 flex items-center justify-center mx-auto mb-3">
                          <Camera className="w-5 h-5 text-[#007AFF]" />
                        </div>
                        <p className="text-[14px] font-medium text-[#1D1D1F]">正在分析截图…</p>
                        <p className="text-[12px] text-[#86868B] mt-1">多模态诊断中</p>
                      </div>
                    ) : screenshotPhase === 'diagnosis' && diagnosisResult ? (
                      <div className="py-2">
                        <h3 className="text-[14px] font-semibold text-[#1D1D1F]">初步诊断</h3>
                        <div className="mt-3 p-3 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-[12px] text-[#3A3A3C] leading-relaxed space-y-2">
                          <p><span className="font-medium text-[#1D1D1F]">概况：</span>{diagnosisResult.summary}</p>
                          {diagnosisResult.details && (
                            <p><span className="font-medium text-[#1D1D1F]">详情：</span>{diagnosisResult.details}</p>
                          )}
                          <p><span className="font-medium text-[#1D1D1F]">建议：</span>{diagnosisResult.suggestion}</p>
                          {diagnosisResult.keywords && diagnosisResult.keywords.length > 0 && (
                            <p className="text-[11px] text-[#86868B]">识别到：{diagnosisResult.keywords.join('、')}</p>
                          )}
                        </div>
                        <div className="mt-4 flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => { setScreenshotPhase('form'); setDiagnosisResult(null); }}
                            className="px-4 py-2.5 text-[13px] text-[#86868B] hover:bg-[#F5F5F7] rounded-xl"
                          >
                            重新上传
                          </button>
                          <button
                            type="button"
                            onClick={() => { setScreenshotPhase('submitted'); setScreenshotSuccess(true); }}
                            className="px-4 py-2.5 text-[13px] font-medium text-white bg-[#007AFF] rounded-xl"
                          >
                            提交给支持
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-[15px] font-semibold text-[#1D1D1F]">截图上报问题</h3>
                        <p className="text-[12px] text-[#86868B] mt-1">上传截图并描述问题，便于我们快速定位（支持多模态诊断）</p>
                        <input
                          ref={screenshotInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => { screenshotFileRef.current = e.target.files?.[0] ?? null; }}
                        />
                        <button
                          type="button"
                          onClick={() => screenshotInputRef.current?.click()}
                          className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E5E5EA] text-[13px] text-[#007AFF] hover:bg-[#F0F7FF]"
                        >
                          <Camera className="w-4 h-4" />
                          选择截图或拍照
                        </button>
                        <textarea
                          placeholder="请简要描述问题（选填）"
                          className="mt-3 w-full px-3 py-2.5 rounded-xl border border-[#E5E5EA] text-[13px] placeholder:text-[#86868B] resize-none h-20"
                          rows={3}
                        />
                        <div className="mt-4 flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => { setShowScreenshotModal(false); setScreenshotPhase('form'); setDiagnosisResult(null); }}
                            className="px-4 py-2.5 text-[13px] text-[#86868B] hover:bg-[#F5F5F7] rounded-xl"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setScreenshotPhase('analyzing');
                              const result = await diagnoseScreenshot(screenshotFileRef.current);
                              setDiagnosisResult(result);
                              setScreenshotPhase('diagnosis');
                            }}
                            className="px-4 py-2.5 text-[13px] font-medium text-white bg-[#007AFF] rounded-xl"
                          >
                            提交并分析
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* 转人工/提工单弹窗 - 真实表单 */}
            <AnimatePresence>
              {showTicketModal && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 z-[80]"
                    onClick={() => !ticketSuccess && setShowTicketModal(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    onClick={(e) => e.stopPropagation()}
                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[81] w-[min(90vw,360px)] rounded-2xl bg-white border border-[#E5E5EA] shadow-xl p-5"
                  >
                    {ticketSuccess ? (
                      <div className="py-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-[#34C759]/20 flex items-center justify-center mx-auto mb-3">
                          <Check className="w-6 h-6 text-[#34C759]" />
                        </div>
                        <p className="text-[15px] font-medium text-[#1D1D1F]">工单已提交</p>
                        <p className="text-[13px] text-[#86868B] mt-1">客服会尽快联系您</p>
                        <button
                          type="button"
                          onClick={() => setShowTicketModal(false)}
                          className="mt-4 px-4 py-2.5 text-[13px] font-medium text-white bg-[#007AFF] rounded-xl"
                        >
                          关闭
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-[15px] font-semibold text-[#1D1D1F]">转人工 / 提工单</h3>
                        <p className="text-[12px] text-[#86868B] mt-1">描述您的问题，我们将安排专人跟进</p>
                        <textarea
                          placeholder="请描述遇到的问题或需求…"
                          className="mt-3 w-full px-3 py-2.5 rounded-xl border border-[#E5E5EA] text-[13px] placeholder:text-[#86868B] resize-none h-24"
                          rows={4}
                        />
                        <input
                          type="text"
                          placeholder="您的联系方式（选填）"
                          className="mt-3 w-full px-3 py-2.5 rounded-xl border border-[#E5E5EA] text-[13px] placeholder:text-[#86868B]"
                        />
                        <div className="mt-4 flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setShowTicketModal(false)}
                            className="px-4 py-2.5 text-[13px] text-[#86868B] hover:bg-[#F5F5F7] rounded-xl"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={() => setTicketSuccess(true)}
                            className="px-4 py-2.5 text-[13px] font-medium text-white bg-[#007AFF] rounded-xl"
                          >
                            提交工单
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FloatingGuideAssistant;
