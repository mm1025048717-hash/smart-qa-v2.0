/**
 * 帮助文档面板 - 真实产品文档，简约结构化 + QA 式
 * PRD 4.4：基于文档的问答 (RAG) 模拟 - 输入关键词在文档中检索
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, HelpCircle, MessageCircle, LifeBuoy, Search } from 'lucide-react';

export interface HelpDocPanelProps {
  onClose: () => void;
}

const QA_LIST = [
  {
    q: '亿问 Data Agent 是什么？',
    a: '企业级数据智能助手，用自然语言查指标、看趋势、做归因分析。通过角色与分步引导，降低门槛，30 秒上手。',
  },
  {
    q: '如何开始使用？',
    a: '先选角色（管理层 / 数据分析师 / 业务负责人 / 运营 / 财务 / 新手），系统会推荐数字员工和常见问题。选完角色后未做过引导会自动进入约 30 秒的新手引导。',
  },
  {
    q: '如何提问？',
    a: '在页面中央输入框直接输入，例如「今年销售额是多少」「近 3 个月销售额趋势」「为什么 11 月销售下降」。下方可切换数字员工、选「本地模式」或「联网搜索」，复杂问题可开联网。',
  },
  {
    q: '不同角色看到的引导一样吗？',
    a: '不一样。CXO 极简 3 步；业务负责人多出看板与数字员工市场；一线业务侧重指标口径与知识库；数据开发为数据源 / 业务建模 / 指标管理。引导结束后会缩成右下角小助手，随时可点。',
  },
  {
    q: '右下角小助手能做什么？',
    a: '查看帮助文档（本页）、截图上报问题、转人工/提工单、重新体验引导。',
  },
  {
    q: '如何切换 AI 员工？',
    a: '在输入框下方点击当前员工名称，在列表中选择即可。',
  },
  {
    q: '本地模式和联网搜索有什么区别？',
    a: '本地模式仅用已接入数据与知识库；联网搜索可查最新公开信息。',
  },
  {
    q: '可以跳过引导吗？',
    a: '可以。点「跳过引导」会二次确认；之后可在小助手里选「重新体验引导」再看一遍。',
  },
  {
    q: '遇到问题怎么联系支持？',
    a: '点右下角小助手，用「截图上报问题」或「转人工/提工单」提交，我们会尽快排查或安排专人跟进。',
  },
];

export function HelpDocPanel({ onClose }: HelpDocPanelProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const filteredList = useMemo(() => {
    if (!searchKeyword.trim()) return QA_LIST;
    const k = searchKeyword.trim().toLowerCase();
    return QA_LIST.filter((item) => item.q.toLowerCase().includes(k) || item.a.toLowerCase().includes(k));
  }, [searchKeyword]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white border border-[#E5E5EA] shadow-xl overflow-hidden"
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5EA] bg-[#FAFAFA] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#007AFF]/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-[#007AFF]" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1D1D1F]">帮助文档</h2>
            <p className="text-[11px] text-[#86868B] mt-0.5">亿问 Data Agent · 使用说明</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-[#86868B] hover:bg-[#E5E5EA] hover:text-[#1D1D1F] transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* RAG 模拟：输入问题/关键词，从文档中检索 */}
      <div className="px-4 py-2 border-b border-[#E5E5EA] bg-white flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="输入问题或关键词，从文档中检索…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E5EA] text-[13px] placeholder:text-[#86868B] focus:outline-none focus:border-[#007AFF]/50"
          />
        </div>
      </div>

      {/* 内容区 - QA 列表（按检索结果过滤） */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-3">
          {filteredList.length === 0 ? (
            <p className="text-[13px] text-[#86868B] py-6 text-center">未找到与「{searchKeyword}」相关的内容</p>
          ) : (
          filteredList.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-[#E5E5EA] bg-[#FAFAFA]/80 hover:bg-[#F5F5F7] transition-colors overflow-hidden"
            >
              <div className="px-4 py-3 border-l-2 border-[#007AFF] bg-white/90">
                <p className="text-[13px] font-medium text-[#1D1D1F] flex items-start gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-[#007AFF] flex-shrink-0 mt-0.5" />
                  {item.q}
                </p>
                <p className="text-[12px] text-[#3A3A3C] leading-relaxed mt-2 pl-5">
                  {item.a}
                </p>
              </div>
            </motion.div>
          ))
          )}
        </div>

        {/* 底部快捷入口说明 */}
        <div className="px-4 pb-5 pt-1">
          <div className="rounded-xl bg-[#F0F7FF] border border-[#007AFF]/15 px-4 py-3 flex items-start gap-3">
            <LifeBuoy className="w-4 h-4 text-[#007AFF] flex-shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#3A3A3C] leading-relaxed">
              <span className="font-medium text-[#1D1D1F]">需要帮助？</span>
              <span className="ml-1">点击右下角</span>
              <span className="inline-flex items-center gap-1 mx-1 text-[#007AFF]">
                <MessageCircle className="w-3.5 h-3.5" />
                小助手
              </span>
              <span>，可截图上报或转人工。</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default HelpDocPanel;
