/**
 * 帮助文档面板 - 真实产品文档，非智能引导
 * 用于「查看帮助文档」入口，展示用户手册式内容
 */

import { motion } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';

export interface HelpDocPanelProps {
  onClose: () => void;
}

const SECTIONS = [
  {
    title: '产品介绍',
    content: `亿问 Data Agent 是企业级数据智能助手，支持用自然语言查询指标、看趋势、做归因分析。通过角色选择与分步引导，降低使用门槛，让老板 30 秒上手、让开发按需学习配置。`,
  },
  {
    title: '如何开始',
    content: `首次使用时，请先选择您的角色（管理层 / 数据分析师 / 业务负责人 / 运营 / 财务 / 新手）。系统会根据角色推荐合适的数字员工和常见问题。选择角色后，如未完成过新手引导，将自动进入聚光灯引导，约 30 秒了解核心功能。`,
  },
  {
    title: '如何提问',
    content: `在页面中央的输入框中直接输入您想分析的问题，例如：「今年销售额是多少」「近 3 个月销售额趋势」「为什么 11 月销售下降」。支持文字输入；下方可切换数字员工、选择「本地模式」或「联网搜索」。复杂问题可开启联网获取最新信息。`,
  },
  {
    title: '角色与引导',
    content: `四类典型角色对应不同引导路径：CXO 极简 3 步（如何提问、深度模式、追问与图表）；业务负责人在此基础上增加看板与数字员工市场说明；一线业务侧重指标口径与知识库；数据开发为分布式引导（数据源、业务建模、指标管理）。引导结束时会缩成右下角「亿问小助手」，可随时点击获取帮助。`,
  },
  {
    title: '亿问小助手',
    content: `点击右下角小助手可打开帮助面板：\n· 查看帮助文档：打开本说明\n· 截图上报问题：上传截图与描述，提交给技术支持\n· 转人工/提工单：描述问题并提交工单，客服会尽快联系\n· 重新体验引导：再次观看新手引导`,
  },
  {
    title: '常见问题',
    items: [
      '问：如何切换不同的 AI 员工？答：在输入框下方点击当前员工名称，在列表中选择即可。',
      '问：本地模式和联网搜索有什么区别？答：本地模式仅使用已接入的数据与知识库；联网搜索可查询最新公开信息。',
      '问：引导可以跳过吗？答：可以。点击「跳过引导」会弹出二次确认，确认后关闭；完成后可随时通过右下角小助手「重新体验引导」。',
    ],
  },
  {
    title: '联系支持',
    content: `遇到问题可使用小助手内的「截图上报问题」或「转人工/提工单」。我们会根据您提交的内容尽快排查或安排专人跟进。`,
  },
];

export function HelpDocPanel({ onClose }: HelpDocPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white border border-[#E5E5EA] shadow-xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5EA] bg-[#F9F9FB] flex-shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#007AFF]" />
          <h2 className="text-[17px] font-semibold text-[#1D1D1F]">帮助文档</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-[#86868B] hover:bg-[#E5E5EA] hover:text-[#1D1D1F] transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 text-[#1D1D1F]">
        <p className="text-[13px] text-[#86868B] mb-6">
          亿问 Data Agent 用户手册 · 了解产品功能与使用方式
        </p>
        {SECTIONS.map((section, i) => (
          <section key={i} className="mb-6">
            <h3 className="text-[15px] font-semibold text-[#1D1D1F] mb-2">{section.title}</h3>
            {'content' in section && (
              <p className="text-[13px] text-[#3A3A3C] leading-relaxed whitespace-pre-line">
                {(section as { content: string }).content}
              </p>
            )}
            {'items' in section && (
              <ul className="list-disc list-inside space-y-2 text-[13px] text-[#3A3A3C] leading-relaxed">
                {(section as { items: string[] }).items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </motion.div>
  );
}

export default HelpDocPanel;
