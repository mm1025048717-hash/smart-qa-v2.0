import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Send, Mic, Paperclip, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { AgentProfile } from '../types';
import { VoiceInput } from './VoiceInput';

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
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
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


  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

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

          {/* 发送按钮 */}
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            className={clsx(
              'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
              message.trim() && !disabled
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 hover:scale-105 active:scale-95'
                : 'bg-[#F5F9FF] text-[#86909C] cursor-not-allowed'
            )}
          >
            {message.trim() ? <Send className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
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
