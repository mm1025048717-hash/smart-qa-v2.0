import { motion } from 'framer-motion';
import clsx from 'clsx';

// --- 基础叙事组件 ---

export const ReportTitle = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <header className="mb-12 text-center py-8">
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center px-3 py-1 rounded-full bg-[#F0F7FF] text-[#0055FF] text-[12px] font-semibold mb-4"
    >
      <span>AI 自动生成深度分析报告</span>
    </motion.div>
    <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight leading-tight mb-4">
      {title}
    </h1>
    {subtitle && (
      <p className="text-lg text-[#6B7280] font-medium max-w-xl mx-auto">
        {subtitle}
      </p>
    )}
  </header>
);

export const Section = ({ title, subtitle, delay }: { title: string, subtitle?: string, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="mt-12 mb-6"
  >
    <h2 className="text-2xl font-bold text-[#111827] flex items-center gap-3">
      <div className="w-1.5 h-6 bg-[#0055FF] rounded-full" />
      {title}
    </h2>
    {subtitle && <p className="mt-2 text-[#6B7280] text-sm">{subtitle}</p>}
  </motion.div>
);

export const QuoteParagraph = ({ content }: { content: string }) => (
  <div className="relative my-8 py-10 px-12 bg-[#F9FAFB] rounded-[32px] overflow-hidden border border-[#E5E7EB]">
    <p className="relative z-10 text-xl text-[#475569] leading-relaxed font-medium italic">
      {content}
    </p>
  </div>
);

export const QuoteParagraphLight = ({ content }: { content: string }) => (
  <div className="my-6 px-6 py-4 border-l-4 border-[#0055FF]/30 bg-[#F0F7FF] rounded-r-2xl">
    <p className="text-[#475569] leading-relaxed italic text-[15px]">
      {content}
    </p>
  </div>
);

export const QuoteBox = ({ content, author }: { content: string, author?: string }) => (
  <div className="my-8 p-8 bg-white border border-[#E5E7EB] rounded-3xl shadow-sm relative">
    <p className="text-lg text-[#475569] font-medium leading-relaxed mb-4">{content}</p>
    {author && <div className="text-sm text-[#6B7280] font-bold">— {author}</div>}
  </div>
);

export const Divider = () => (
  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-12" />
);

// --- 数据卡片组件 ---

export const MetricsPreviewCard = ({ metrics, title, delay }: { metrics: any[], title?: string, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-[24px] border border-[#E5E7EB] p-6 shadow-sm hover:shadow-md transition-shadow"
  >
    {title && <h4 className="text-[13px] font-bold text-[#6B7280] uppercase tracking-wider mb-5">{title}</h4>}
    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
      {metrics.map((m, i) => (
        <div key={i} className="space-y-1">
          <div className="text-[12px] text-[#6B7280] font-medium">{m.label}</div>
          <div className="text-xl font-bold text-[#111827]">{m.value}</div>
          {m.trend && (
            <div className={clsx(
              "text-[11px] font-bold", 
              m.trend.includes('+') ? "text-[#10B981]" : "text-[#EF4444]"
            )}>
              {m.trend}
            </div>
          )}
        </div>
      ))}
    </div>
  </motion.div>
);

export const RegionCards = ({ items, delay }: { items: any[], delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="grid grid-cols-2 gap-4 my-6"
  >
    {items.map((r, i) => (
      <div key={i} className="p-4 rounded-[20px] border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors group">
        <div className="text-[12px] font-bold text-[#6B7280] mb-1 group-hover:text-[#0055FF] transition-colors">{r.name}</div>
        <div className="text-[16px] font-bold text-[#111827]">{r.value}</div>
        {r.trend && <div className="text-[10px] text-[#10B981] mt-0.5">{r.trend}</div>}
      </div>
    ))}
  </motion.div>
);

export const InsightBox = ({ title, content, variant = 'primary', delay }: { title: string, content: string, variant?: 'primary' | 'success' | 'warning' | 'danger', delay?: number }) => {
  const styles = {
    primary: "bg-[#F0F7FF] border-[#0055FF]/20 text-[#0055FF]",
    success: "bg-[#F0FDF4] border-[#10B981]/20 text-[#10B981]",
    warning: "bg-[#FFFBEB] border-[#F59E0B]/20 text-[#F59E0B]",
    danger: "bg-[#FEF2F2] border-[#EF4444]/20 text-[#EF4444]"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={clsx("p-6 rounded-[24px] border-l-4 space-y-3 shadow-sm", styles[variant])}
    >
      <div className="font-bold text-sm uppercase tracking-wider">
        {title}
      </div>
      <p className="text-[#475569] leading-relaxed text-[15px] font-medium">
        {content}
      </p>
    </motion.div>
  );
};

export const CompareCard = ({ items }: { items: any[] }) => (
  <div className="grid grid-cols-2 gap-4 my-8">
    {items.map((item, i) => (
      <div key={i} className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-sm relative overflow-hidden group hover:border-[#0055FF]/30 transition-all">
        {i === 0 && <div className="absolute top-0 right-0 w-12 h-12 bg-[#F0F7FF] rounded-bl-3xl flex items-center justify-center text-[#0055FF] font-bold text-xs">对比 A</div>}
        {i === 1 && <div className="absolute top-0 right-0 w-12 h-12 bg-[#F9FAFB] rounded-bl-3xl flex items-center justify-center text-[#6B7280] font-bold text-xs">对比 B</div>}
        <div className="text-sm font-bold text-[#6B7280] mb-2">{item.label}</div>
        <div className="text-2xl font-black text-[#111827] mb-1">{item.value}</div>
        <div className="text-xs text-[#10B981] font-bold">{item.subValue}</div>
      </div>
    ))}
  </div>
);

export const CompareCardLight = ({ items, delay }: { items: any[], delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex items-center gap-4 bg-[#F9FAFB] p-2 rounded-[28px] border border-[#E5E7EB] mb-8"
  >
    {items.map((item, i) => (
      <div key={i} className={clsx(
        "flex-1 p-5 rounded-[22px] flex flex-col gap-1",
        i === 0 ? "bg-white shadow-sm border border-[#0055FF]/10" : "bg-transparent"
      )}>
        <div className="text-[11px] font-bold text-[#6B7280] uppercase">{item.label}</div>
        <div className="text-xl font-extrabold text-[#111827]">{item.value}</div>
        <div className="text-[10px] text-[#6B7280] opacity-60">{item.subValue}</div>
      </div>
    ))}
  </motion.div>
);

export const DataPreviewCard = ({ items, title }: { items: any[], title?: string }) => (
  <div className="bg-[#1d1d1f] rounded-[32px] p-8 text-white my-8 shadow-2xl relative overflow-hidden">
    <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[60px]" />
    {title && <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">{title}</h4>}
    <div className="space-y-6">
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between group cursor-default">
          <div className="text-gray-300 font-medium group-hover:text-white transition-colors">{item.label}</div>
          <div className="flex flex-col items-end">
            <div className="text-lg font-bold">{item.value}</div>
            {item.trend && <div className="text-[10px] text-blue-400 font-bold">{item.trend}</div>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const DataPreviewCardLight = ({ items }: { items: any[] }) => (
  <div className="grid grid-cols-1 gap-2 my-6">
    {items.map((item, i) => (
      <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
        <span className="text-[14px] font-medium text-gray-600">{item.label}</span>
        <span className="text-[14px] font-bold text-gray-900">{item.value}</span>
      </div>
    ))}
  </div>
);

export const StructuredListItem = ({ title, content, index, delay }: { title: string, content: string, index: number, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex gap-4 p-5 bg-white rounded-3xl border border-[#E5E7EB] shadow-sm hover:border-[#0055FF]/30 transition-all group"
  >
    <div className="w-10 h-10 rounded-2xl bg-[#F0F7FF] flex items-center justify-center text-[#0055FF] font-bold group-hover:bg-[#0055FF] group-hover:text-white transition-all">
      {index + 1}
    </div>
    <div className="flex-1 space-y-1">
      <div className="font-bold text-[#111827]">{title}</div>
      <p className="text-sm text-[#6B7280] leading-relaxed">{content}</p>
    </div>
  </motion.div>
);

export const AnalystQuote = ({ text, analyst, delay }: { text: string, analyst?: string, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="my-10 p-10 bg-[#111827] rounded-[40px] text-white relative shadow-2xl"
  >
    <p className="text-xl font-medium leading-relaxed mb-6 italic">"{text}"</p>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-[#0055FF] flex items-center justify-center font-bold text-sm">
        {analyst ? analyst.charAt(0) : 'AI'}
      </div>
      <div>
        <div className="text-sm font-bold">{analyst || '数据分析专家'}</div>
        <div className="text-[11px] text-[#9CA3AF]">智能决策顾问</div>
      </div>
    </div>
  </motion.div>
);

export const ReportHeroCard = ({ category, title, description, tags, stats }: { category?: string, title: string, description?: string, tags?: string[], stats?: any[] }) => (
  <div className="bg-white rounded-[40px] p-10 border border-[#E5E7EB] shadow-xl my-10 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0F7FF] rounded-bl-full" />
    {category && <div className="text-[12px] font-black text-[#0055FF] uppercase tracking-[4px] mb-6">{category}</div>}
    <h1 className="text-4xl font-black text-[#111827] leading-tight mb-6 max-w-xl">{title}</h1>
    {description && <p className="text-[#6B7280] text-lg font-medium mb-8 max-w-lg leading-relaxed">{description}</p>}
    
    <div className="flex flex-wrap gap-2 mb-10">
      {tags?.map(t => (
        <span key={t} className="px-4 py-1.5 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] text-[12px] font-bold text-[#6B7280]">
          #{t}
        </span>
      ))}
    </div>

    {stats && (
      <div className="grid grid-cols-3 gap-6 pt-10 border-t border-[#F3F4F6]">
        {stats.map((s, i) => (
          <div key={i} className="space-y-1">
            <div className="text-[11px] text-[#6B7280] font-bold uppercase">{s.label}</div>
            <div className="text-2xl font-black text-[#111827]">{s.value}</div>
            {s.trend && <div className="text-[10px] text-[#10B981] font-bold">{s.trend}</div>}
          </div>
        ))}
      </div>
    )}
  </div>
);

export const ReportLayerCard = ({ items }: { items: any[] }) => (
  <div className="flex flex-col gap-3 my-8">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm hover:translate-x-2 transition-transform cursor-default group">
        <div className="w-2 h-2 rounded-full bg-[#0055FF] opacity-40 group-hover:opacity-100 transition-opacity" />
        <div className="flex-1 flex justify-between items-center">
          <span className="font-bold text-[#111827]">{item.label}</span>
          <span className="text-[14px] text-[#0055FF] font-bold">{item.value}</span>
        </div>
      </div>
    ))}
  </div>
);

export const CalloutCard = ({ title, content, type = 'info' }: { title: string, content: string, type?: 'info' | 'warning' | 'danger' | 'success' }) => {
  const configs = {
    info: { bg: 'bg-[#F0F7FF]', border: 'border-[#0055FF]/20', color: 'text-[#0055FF]' },
    warning: { bg: 'bg-[#FFFBEB]', border: 'border-[#F59E0B]/20', color: 'text-[#F59E0B]' },
    danger: { bg: 'bg-[#FEF2F2]', border: 'border-[#EF4444]/20', color: 'text-[#EF4444]' },
    success: { bg: 'bg-[#F0FDF4]', border: 'border-[#10B981]/20', color: 'text-[#10B981]' }
  };
  const config = configs[type];

  return (
    <div className={clsx("p-6 rounded-[28px] border flex gap-4 my-8", config.bg, config.border)}>
      <div className="space-y-1">
        <div className={clsx("font-bold text-[15px]", config.color)}>{title}</div>
        <p className="text-[#475569] text-[14px] leading-relaxed font-medium">{content}</p>
      </div>
    </div>
  );
};

export const StrategyCard = ({ title, actions }: { title: string, actions: string[] }) => (
  <div className="bg-[#111827] rounded-[32px] p-8 text-white my-10 shadow-2xl relative overflow-hidden group">
    <div className="absolute left-0 top-0 w-full h-1 bg-[#0055FF] opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="mb-8">
      <h3 className="text-xl font-bold tracking-tight">{title}</h3>
    </div>
    <div className="space-y-5">
      {actions.map((act, i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group/item">
          <div className="w-6 h-6 rounded-full bg-[#0055FF]/20 text-[#60A5FA] flex items-center justify-center text-[12px] font-bold group-hover/item:bg-[#0055FF] group-hover/item:text-white transition-all">
            {i + 1}
          </div>
          <p className="text-[#E5E7EB] text-[15px] font-medium leading-relaxed flex-1">{act}</p>
        </div>
      ))}
    </div>
  </div>
);

export const ActionBar = ({ items = [] }: { items?: any[] }) => (
  <div className="flex items-center gap-2 p-1.5 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] my-6 w-fit ml-auto">
    {items.map((it, i) => {
      return (
        <button key={i} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-[#6B7280] hover:text-[#111827] transition-all flex items-center gap-2">
          {it.label && <span className="text-xs font-bold">{it.label}</span>}
        </button>
      );
    })}
  </div>
);

export const TrendMetric = ({ label, value, trend, subValue }: { label: string, value: string, trend: string, subValue?: string }) => (
  <div className="bg-white rounded-[24px] p-6 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
    <div className="text-[12px] font-bold text-[#6B7280] uppercase tracking-widest mb-3">{label}</div>
    <div className="flex items-end gap-3 mb-2">
      <div className="text-3xl font-black text-[#111827]">{value}</div>
      <div className={clsx(
        "text-[13px] font-bold pb-1",
        trend.includes('+') ? "text-[#10B981]" : "text-[#EF4444]"
      )}>
        {trend}
      </div>
    </div>
    {subValue && <div className="text-sm text-[#6B7280] font-medium">{subValue}</div>}
  </div>
);
