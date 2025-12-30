/**
 * 简约输入界面 - 参考 ima copilot 设计
 * 完全独立的界面，包含输入框、切换数字员工、联网选择、常用场景等
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AgentProfile } from '../types';
import { AGENTS } from '../services/agents';
import { ChevronDown, Globe } from 'lucide-react';

interface SimpleInputPageProps {
  onQuestionSubmit: (question: string, options?: { agentId?: string; enableWebSearch?: boolean }) => void;
  agent: AgentProfile;
  onAgentChange?: (agentId: string) => void;
}

// 常用场景
const COMMON_SCENARIOS = [
  { id: 'sales', label: '销售概览', query: '今年销售额是多少' },
  { id: 'trend', label: '销售趋势', query: '近3个月销售额趋势' },
  { id: 'anomaly', label: '异常诊断', query: '为什么11月销售额下降了' },
  { id: 'compare', label: '地区对比', query: '各地区销售额对比' },
  { id: 'product', label: '产品分析', query: '各品类销售额构成' },
  { id: 'user', label: '用户分析', query: '日活还有月活数据' },
];

export const SimpleInputPage = ({ onQuestionSubmit, agent, onAgentChange }: SimpleInputPageProps) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(agent.id);
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showWebSearchDropdown, setShowWebSearchDropdown] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const agentDropdownRef = useRef<HTMLDivElement>(null);
  const webSearchDropdownRef = useRef<HTMLDivElement>(null);

  const selectedAgent = AGENTS.find(a => a.id === selectedAgentId) || agent;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      onQuestionSubmit(inputValue.trim(), {
        agentId: selectedAgentId !== agent.id ? selectedAgentId : undefined,
        enableWebSearch,
      });
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleScenarioClick = (query: string) => {
    onQuestionSubmit(query, {
      agentId: selectedAgentId !== agent.id ? selectedAgentId : undefined,
      enableWebSearch,
    });
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId);
    setShowAgentDropdown(false);
    if (onAgentChange) {
      onAgentChange(agentId);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(event.target as Node)) {
        setShowAgentDropdown(false);
      }
      if (webSearchDropdownRef.current && !webSearchDropdownRef.current.contains(event.target as Node)) {
        setShowWebSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-white overflow-x-hidden">
      <div className="flex-1 flex flex-col items-center justify-center pt-20 sm:pt-24 px-4 sm:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl flex flex-col items-center"
        >
        {/* 欢迎标题 - 顶级苹果设计 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 w-full"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold text-[#000000] mb-4 tracking-[-0.02em] leading-[1.05]">
            欢迎来到
          </h1>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-semibold text-[#007AFF] tracking-[-0.02em] leading-[1.05]">
            亿问 Data Agent
          </h2>
        </motion.div>

        {/* 大输入框 - 顶级苹果设计，层次感叠加 */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSubmit}
          className="relative mb-8 w-full max-w-4xl"
        >
          <div className="relative bg-white rounded-3xl border border-[#E5E5EA]/60 focus-within:border-[#007AFF]/40 focus-within:shadow-[0_0_0_1px_rgba(0,122,255,0.2),0_8px_24px_rgba(0,122,255,0.08)] transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="说说今天想做点什么..."
              className="w-full px-7 py-7 pr-28 text-[17px] text-[#000000] placeholder:text-[#8E8E93] bg-transparent border-none outline-none resize-none min-h-[110px] max-h-[260px] font-light"
              rows={1}
              style={{ 
                height: 'auto',
                overflow: 'hidden'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 250)}px`;
              }}
            />
            
            {/* 控制按钮 - 放在对话框内部左下角，顶级苹果设计 */}
            <div className="flex items-center gap-2.5 px-7 pb-5">
              {/* 切换数字员工 */}
              <div className="relative" ref={agentDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAgentDropdown(!showAgentDropdown);
                    setShowWebSearchDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-[13px] text-[#000000] bg-white border border-[#E5E5EA]/80 hover:border-[#007AFF]/30 hover:bg-[#F9F9FB] rounded-xl transition-all duration-200 font-light shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  {selectedAgent.avatar ? (
                    <img 
                      src={selectedAgent.avatar} 
                      alt={selectedAgent.name}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-[#E8F0FF]"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1664FF] to-[#4E8CFF] flex items-center justify-center text-white text-[10px] font-semibold ring-1 ring-[#E8F0FF]">
                      {selectedAgent.name.slice(0, 1)}
                    </div>
                  )}
                  <span className="font-light">{selectedAgent.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#007AFF]" />
                </button>
                {showAgentDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl border border-[#E5E5EA]/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] z-50 max-h-80 overflow-y-auto backdrop-blur-xl bg-white/98">
                    {AGENTS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleAgentSelect(a.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F9F9FB] transition-all duration-150 ${
                          selectedAgentId === a.id ? 'bg-[#F0F7FF]' : ''
                        }`}
                      >
                        {a.avatar ? (
                          <img src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-[#E5E5E5]" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1664FF] to-[#4E8CFF] flex items-center justify-center text-white text-xs font-semibold ring-1 ring-[#E5E5E5]">
                            {a.name.slice(0, 1)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                        <div className="font-light text-[#000000] text-sm">{a.name}</div>
                        <div className="text-xs text-[#8E8E93] truncate font-light">{a.title}</div>
                        </div>
                        {selectedAgentId === a.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 联网搜索 */}
              <div className="relative" ref={webSearchDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowWebSearchDropdown(!showWebSearchDropdown);
                    setShowAgentDropdown(false);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2.5 text-[13px] text-[#000000] bg-white border border-[#E5E5EA]/80 hover:border-[#007AFF]/30 hover:bg-[#F9F9FB] rounded-xl transition-all duration-200 font-light shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <Globe className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span className="font-light">{enableWebSearch ? '联网搜索' : '本地模式'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#007AFF]" />
                </button>
                {showWebSearchDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl border border-[#E5E5EA]/60 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] z-50 backdrop-blur-xl bg-white/98">
                    <button
                      type="button"
                      onClick={() => {
                        setEnableWebSearch(false);
                        setShowWebSearchDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[#F9F9FB] transition-all duration-150 ${
                        !enableWebSearch ? 'bg-[#F0F7FF]' : ''
                      }`}
                    >
                      <div className="flex-1">
                      <div className="font-light text-[#000000] text-sm">本地模式</div>
                      <div className="text-xs text-[#8E8E93] font-light">使用本地数据</div>
                      </div>
                      {!enableWebSearch && <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></div>}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEnableWebSearch(true);
                        setShowWebSearchDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[#F9F9FB] transition-all duration-150 ${
                        enableWebSearch ? 'bg-[#F0F7FF]' : ''
                      }`}
                    >
                      <div className="flex-1">
                      <div className="font-light text-[#000000] text-sm">联网搜索</div>
                      <div className="text-xs text-[#8E8E93] font-light">搜索最新信息</div>
                    </div>
                    {enableWebSearch && <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></div>}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* 发送按钮 - 右下角，顶级苹果设计 */}
            <div className="absolute right-7 bottom-5 flex items-center gap-2">
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`
                  w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200
                  ${inputValue.trim() 
                    ? 'bg-[#007AFF] text-white hover:bg-[#0051D5] active:scale-95 shadow-[0_4px_12px_rgba(0,122,255,0.25),0_1px_3px_rgba(0,122,255,0.15)]' 
                    : 'bg-white border border-[#E5E5EA]/60 text-[#C7C7CC] cursor-not-allowed shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                  }
                `}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M2 14L14 2M14 2H6M14 2V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </motion.form>

        {/* 常用场景 - 顶级苹果设计，层次感叠加 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap justify-center gap-3 w-full max-w-4xl mb-20"
        >
          {COMMON_SCENARIOS.map((scenario) => (
            <motion.button
              key={scenario.id}
              type="button"
              onClick={() => handleScenarioClick(scenario.query)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="group px-6 py-3 bg-white border border-[#E5E5EA]/60 hover:border-[#007AFF]/30 hover:bg-[#F9F9FB] rounded-full transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]"
            >
              <span className="text-[14px] font-light text-[#000000]">{scenario.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
};

