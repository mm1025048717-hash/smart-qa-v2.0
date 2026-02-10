import type { ComponentType } from 'react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Send, Mic, Paperclip, ChevronDown, Zap, BookOpen, FileText, Camera, HeadphonesIcon, Sparkles, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { AgentProfile } from '../types';
import { VoiceInput } from './VoiceInput';
import { ASSISTANT_FIXED_REPLIES, type FixedReplyItem, type FixedReplyIconId } from '../data/assistantFixedReplies';

const FIXED_REPLY_ICONS: Record<FixedReplyIconId, ComponentType<{ className?: string }>> = {
  zap: Zap,
  book: BookOpen,
  file: FileText,
  camera: Camera,
  headset: HeadphonesIcon,
  sparkles: Sparkles,
};

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  // Agent 相关
  agents?: AgentProfile[];
  currentAgent?: AgentProfile;
  onAgentChange?: (agentId: string) => void;
  // 停止输出相关
  isStreaming?: boolean;
  onStop?: () => void;
  /** CXO 引导：在数据分析页内仅填入示例追问，不自动发送，引导用户自己点击发送或输入问题 */
  demoFollowUp?: { phrase: string; delayMs: number };
  onDemoComplete?: () => void;
  /** CXO 追问场景：为 true 时显示「点击发送进行追问」等引导，鼓励主动输入（不自动填入） */
  followUpScenario?: boolean;
  /** 底部固定回复快捷按钮（深度检索、用户手册等），不传则不显示 */
  fixedReplies?: FixedReplyItem[];
  /** 点击固定回复中 action 类按钮时的回调 */
  onFixedReplyAction?: (action: import('../data/assistantFixedReplies').FixedReplyActionId) => void;
}

export const ChatInput = ({ 
  onSend, 
  disabled = false, 
  placeholder = "输入你的数据分析问题...",
  agents = [],
  currentAgent,
  onAgentChange,
  isStreaming = false,
  onStop,
  demoFollowUp,
  onDemoComplete,
  followUpScenario = false,
  fixedReplies,
  onFixedReplyAction,
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [hasSentInFollowUpScenario, setHasSentInFollowUpScenario] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [showAgentHint, setShowAgentHint] = useState(() => {
    // 首次访问时显示提示
    return !localStorage.getItem('agent_hint_dismissed');
  });
  const [hoveredAlisa, setHoveredAlisa] = useState<string | null>(null);
  const [alisaButtonRect, setAlisaButtonRect] = useState<DOMRect | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px';
    }
  }, [message]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAgentDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // CXO 引导：仅填入示例追问文案，不自动发送，引导用户点击发送或输入问题
  useEffect(() => {
    if (!demoFollowUp?.phrase || disabled) return;
    const phrase = demoFollowUp.phrase;
    let typingId: ReturnType<typeof setInterval> | undefined;
    let doneTimeout: ReturnType<typeof setTimeout> | undefined;
    const startTimeout = setTimeout(() => {
      inputRef.current?.focus();
      let idx = 0;
      typingId = setInterval(() => {
        idx += 1;
        setMessage(phrase.slice(0, idx));
        if (idx >= phrase.length) {
          if (typingId != null) clearInterval(typingId);
          // 只填入输入框，不调用 onSend；引导用户自己点击发送
          doneTimeout = setTimeout(() => onDemoComplete?.(), 300);
        }
      }, 80);
    }, demoFollowUp.delayMs);
    return () => {
      clearTimeout(startTimeout);
      if (typingId != null) clearInterval(typingId);
      if (doneTimeout != null) clearTimeout(doneTimeout);
    };
  }, [demoFollowUp?.phrase, demoFollowUp?.delayMs, disabled]); // 仅依赖 demo 配置，避免重复执行

  // 追问场景：进入时重置「未发送」状态，使按钮一直显示引导文案直到用户点击发送
  useEffect(() => {
    if (demoFollowUp || followUpScenario) setHasSentInFollowUpScenario(false);
  }, [demoFollowUp, followUpScenario]);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      if (demoFollowUp || followUpScenario) setHasSentInFollowUpScenario(true);
      onSend(message.trim());
      setMessage('');
    }
  };

  const showFollowUpGuidance = Boolean((demoFollowUp || followUpScenario) && !hasSentInFollowUpScenario);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAgentSelect = (agentId: string) => {
    onAgentChange?.(agentId);
    setAgentDropdownOpen(false);
    // 选择后隐藏提示
    if (showAgentHint) {
      setShowAgentHint(false);
      localStorage.setItem('agent_hint_dismissed', 'true');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const showAgentSelector = agents.length > 0 && currentAgent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'relative bg-white rounded-[26px] transition-all duration-300 border',
        isFocused 
          ? 'shadow-xl border-[#1664FF]/20 ring-2 ring-[#E8F0FF]' 
          : 'shadow-lg border-[#E8F0FF] hover:shadow-xl hover:border-[#1664FF]/30'
      )}
    >
      {/* Agent 切换器 - 左上角 */}
      {showAgentSelector && (
        <div className="px-4 pt-3 pb-2 border-b border-[#E8F0FF] relative" ref={dropdownRef}>
          <div className="flex items-center gap-3">
            <motion.button
              key={currentAgent.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setAgentDropdownOpen(!agentDropdownOpen);
                // 点击也隐藏提示
                if (showAgentHint) {
                  setShowAgentHint(false);
                  localStorage.setItem('agent_hint_dismissed', 'true');
                }
              }}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#E8F0FF] bg-white text-[13px] text-[#1D2129] hover:border-[#1664FF] hover:text-[#1664FF] transition-colors"
            >
              <motion.div
                key={currentAgent.avatar}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {currentAgent.avatar ? (
                  <img 
                    src={currentAgent.avatar} 
                    alt={currentAgent.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary-500/15 text-primary-600 flex items-center justify-center text-[10px] font-semibold">
                    {currentAgent.name.slice(0, 2)}
                  </div>
                )}
              </motion.div>
              <motion.span 
                key={currentAgent.name}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-medium"
              >
                {currentAgent.name}
              </motion.span>
              <ChevronDown className={clsx(
                "w-3.5 h-3.5 text-[#86909C] transition-transform",
                agentDropdownOpen && "rotate-180"
              )} />
            </motion.button>

            {/* 首次提示 */}
            <AnimatePresence>
              {showAgentHint && !agentDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="text-[12px] text-[#007AFF]"
                >
                  ← 点击选择 AI 员工
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Agent 下拉列表 - 向上展开 */}
          <AnimatePresence>
            {agentDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute left-4 bottom-full mb-2 w-[280px] bg-white rounded-xl shadow-lg border border-[#E8F0FF] z-50"
                style={{ overflow: 'visible' }}
              >
                <div className="px-4 py-2 bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs font-medium text-[#6B7280]">
                  切换 AI 员工
                </div>
                
                <div className="py-1 max-h-80" style={{ overflowY: 'auto', overflowX: 'visible' }}>
                  {agents.map((agent, index) => {
                    const isAlisa = agent.id === 'alisa';
                    return (
                    <motion.button
                      key={agent.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAgentSelect(agent.id)}
                      onMouseEnter={(e) => {
                        if (isAlisa) {
                          setHoveredAlisa(agent.id);
                          setAlisaButtonRect(e.currentTarget.getBoundingClientRect());
                        }
                      }}
                      onMouseLeave={() => {
                        if (isAlisa) {
                          setHoveredAlisa(null);
                          setAlisaButtonRect(null);
                        }
                      }}
                      className={clsx(
                        "w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left relative",
                        isAlisa 
                          ? "bg-[#F0F7FF] hover:bg-[#E0EFFF] border-l-2 border-[#0055FF]" 
                          : "hover:bg-[#F9FAFB]",
                        agent.id === currentAgent.id && (isAlisa ? "bg-[#E0EFFF]" : "bg-[#F9FAFB]")
                      )}
                    >
                      <motion.div
                        animate={agent.id === currentAgent.id ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.3 }}
                        className={clsx(isAlisa && "ring-2 ring-[#0055FF]/20 rounded-full")}
                      >
                        {agent.avatar ? (
                          <img 
                            src={agent.avatar} 
                            alt={agent.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className={clsx(
                            "w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold",
                            isAlisa ? "bg-[#0055FF] text-white" : "bg-[#E5E7EB] text-[#6B7280]"
                          )}>
                            {agent.name.slice(0, 2)}
                          </div>
                        )}
                      </motion.div>
                      
                      <div className="flex-1 relative" style={{ overflow: 'visible' }}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={clsx("text-sm font-medium", isAlisa ? "text-[#0055FF] font-bold" : "text-[#111827]")}>
                            {agent.name}
                          </span>
                          {isAlisa && (
                            <>
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-[#0055FF] text-white rounded">
                                最快
                              </span>
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-[#0055FF] text-white rounded">
                                最准
                              </span>
                            </>
                          )}
                          {agent.badge && !isAlisa && (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-[#F3F4F6] text-[#6B7280] rounded">
                              {agent.badge}
                            </span>
                          )}
                          {isAlisa && agent.badge && (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-[#0055FF]/10 text-[#0055FF] rounded">
                              {agent.badge}
                            </span>
                          )}
                        </div>
                        <div className={clsx("text-xs mt-0.5", isAlisa ? "text-[#475569] font-medium" : "text-[#6B7280]")}>
                          {agent.title}
                        </div>
                      </div>

                      <AnimatePresence>
                        {agent.id === currentAgent.id && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={clsx(
                              "w-2 h-2 rounded-full",
                              isAlisa ? "bg-[#0055FF]" : "bg-[#6B7280]"
                            )}
                          />
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 词槽填充式引导：追问场景下在输入框上方展示可点击词槽，箭头指向词槽 */}
      {followUpScenario && !hasSentInFollowUpScenario && (
        <div className="px-4 pt-2 pb-1">
          <div className="flex items-center justify-center gap-1.5 text-[#007AFF] mb-1.5">
            <ArrowDown className="w-4 h-4 flex-shrink-0" aria-hidden />
            <span className="text-[12px] font-medium">点击下方词槽填入追问</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-[#86909C]">追问词槽：</span>
            {['为什么下降了？', '各地区对比', '查看趋势变化', '分渠道查看'].map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setMessage(slot)}
              className="px-3 py-1.5 rounded-lg text-[13px] bg-[#F0F7FF] text-[#007AFF] border border-[#007AFF]/25 hover:bg-[#E0EFFF] hover:border-[#007AFF]/40 transition-colors"
            >
              {slot}
            </button>
          ))}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="relative flex items-end gap-2 px-4 py-3">
        {/* 左侧工具栏 - 只保留语音对话按钮 */}
        <div className="flex items-center gap-1 pb-1">
          {/* 语音对话界面按钮 - 唯一入口 */}
          <button
            onClick={() => {
              window.history.pushState({}, '', '?page=voice-chat');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="p-2 rounded-lg transition-all duration-200 text-[#007AFF] bg-[#F0F7FF] hover:bg-[#E0EFFF] active:scale-95"
            title="打开语音对话界面"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* 输入框 */}
        <div className="flex-1 py-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none bg-transparent border-none outline-none text-[#1D2129] placeholder:text-[#86909C] text-[15px] leading-relaxed"
            style={{ maxHeight: '150px' }}
          />
        </div>

        {/* 停止/发送按钮 */}
        <div className="pb-1 flex items-center gap-2">
          {/* 停止按钮 - 仅在流式输出时显示 */}
          <AnimatePresence>
            {isStreaming && onStop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onStop}
                className="flex items-center justify-center px-4 py-2 rounded-xl bg-[#FF3B30] text-white hover:bg-[#E63329] transition-all shadow-md hover:shadow-lg text-sm font-medium"
                title="停止输出"
              >
                停止
              </motion.button>
            )}
          </AnimatePresence>

          {/* 发送按钮 - 追问场景下有输入时按钮显示「点击发送进行追问」，不再重复气泡 */}
          <div className="relative">
            <div
              className={clsx(
                'relative transition-all duration-300',
                showFollowUpGuidance && message.trim()
                  ? 'rounded-full ring-4 ring-[#007AFF] ring-offset-2 ring-offset-white animate-pulse shadow-[0_0_0_2px_rgba(0,122,255,0.3)]'
                  : 'rounded-full'
              )}
              data-tour="send-button"
            >
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || disabled}
                className={clsx(
                  'flex items-center justify-center gap-1.5 transition-all duration-200',
                  message.trim() && !disabled
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:scale-[1.02] active:scale-95 min-h-10'
                    : 'bg-[#F5F9FF] text-[#86909C] cursor-not-allowed w-10 h-10 rounded-full',
                  showFollowUpGuidance && message.trim()
                    ? 'rounded-full px-4 py-2.5 min-w-[10rem] text-[13px] font-medium'
                    : 'rounded-full w-10 h-10'
                )}
              >
                {showFollowUpGuidance && message.trim() ? (
                  <span className="whitespace-nowrap">点击发送进行追问</span>
                ) : message.trim() ? (
                  <Send className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 语音输入区域 */}
      <AnimatePresence>
        {voiceEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 border-t border-[#E8F0FF]"
          >
            <VoiceInput
              agentId={currentAgent?.id}
              onTranscript={(text) => {
                setMessage(text);
                // 自动发送（可选）
                // if (text.trim()) {
                //   onSend(text.trim());
                // }
              }}
              onError={(error) => {
                // 静默处理语音服务错误，避免控制台噪音
                // 连接状态会通过 UI 显示（连接状态指示器）
                // 只在开发环境记录详细错误
                if (import.meta.env.DEV) {
                  console.warn('[ChatInput] Voice service unavailable:', error.message);
                }
              }}
              disabled={disabled}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 固定回复快捷按钮 */}
      {(fixedReplies?.length ?? 0) > 0 && (
        <div className="px-4 pt-2 flex flex-wrap items-center gap-1.5">
          {fixedReplies!
            .filter((item) => item.action !== 'guide' || onFixedReplyAction)
            .map((item: FixedReplyItem) => {
              const Icon = FIXED_REPLY_ICONS[item.icon];
              const isGuide = item.action === 'guide';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.type === 'fill' && item.phrase != null) {
                      setMessage((s) => (s ? `${s} ` : '') + item.phrase);
                      return;
                    }
                    if (item.type === 'action' && item.action != null) {
                      onFixedReplyAction?.(item.action);
                    }
                  }}
                  className={clsx(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[12px] transition-colors',
                    isGuide
                      ? 'border-[#007AFF]/40 bg-[#F0F7FF] text-[#007AFF] hover:bg-[#E6F0FF] font-medium'
                      : 'border-[#E5E5EA] bg-white text-[#3A3A3C] hover:bg-[#F5F5F7]'
                  )}
                >
                  <Icon className={clsx('w-3.5 h-3.5', !isGuide && 'text-[#007AFF]')} />
                  <span>{item.label}</span>
                </button>
              );
            })}
        </div>
      )}

      {/* 底部提示 */}
      <div className="px-4 pb-2 flex items-center justify-between text-xs text-[#6B7280]">
        <span>Enter 发送 · Shift+Enter 换行</span>
        {voiceEnabled && (
          <span className="text-[#1664FF]">🎤 语音输入已开启</span>
        )}
      </div>

      {/* Alisa 技术说明 Portal - 使用 fixed 定位避免被裁剪 */}
      {hoveredAlisa && alisaButtonRect && agents.find(a => a.id === hoveredAlisa)?.techInfo && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-white border border-[#E5E7EB] rounded-lg shadow-xl p-2.5 z-[10000] pointer-events-none"
            style={{
              left: (() => {
                const cardWidth = 200;
                const rightPos = alisaButtonRect.right + 8;
                // 如果右侧空间不足，显示在左侧
                if (rightPos + cardWidth > window.innerWidth - 20) {
                  return (alisaButtonRect.left - cardWidth - 8) + 'px';
                }
                return rightPos + 'px';
              })(),
              top: (() => {
                const cardHeight = 60;
                const topPos = alisaButtonRect.top;
                // 如果底部空间不足，向上调整
                if (topPos + cardHeight > window.innerHeight - 20) {
                  return (window.innerHeight - cardHeight - 20) + 'px';
                }
                return topPos + 'px';
              })(),
              width: '200px',
            }}
          >
            <div className="text-[10px] text-[#6B7280] leading-relaxed">
              <div className="text-[#0055FF] font-medium mb-0.5">Alisa NLU + SemanticDB</div>
              <div className="text-[9px]">查询快 3-5 倍 · 准确率 99.8%</div>
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};

export default ChatInput;
