import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  X,
  FlaskConical,
} from 'lucide-react';
import clsx from 'clsx';

interface TestScenarioPanelProps {
  onQuestionSelect: (question: string, options?: { forceWebSearch?: boolean }) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface QuestionCategory {
  id: string;
  name: string;
  description?: string;
  questions: { id: string; text: string; desc?: string }[];
}

// 完整的测试用例集 - 全自然语言问句版
const TEST_QUESTIONS: QuestionCategory[] = [
  // ========== 第一部分：规则验证测试 ==========
  {
    id: 'kpi-year',
    name: '规则1.1 年度对比匹配',
    description: '应匹配年度趋势对比图',
    questions: [
      { id: '1.1-1', text: '今年销售额是多少？', desc: '年度趋势对比' },
      { id: '1.1-2', text: '2024年度销售额表现如何？', desc: '年度趋势对比' },
      { id: '1.1-3', text: '全年销售额统计', desc: '年度趋势对比' },
      { id: '1.1-4', text: '本年营收情况怎么样？', desc: '年度趋势对比' },
    ]
  },
  {
    id: 'kpi-quarter',
    name: '规则1.2 季度分析匹配',
    description: '应匹配柱状图',
    questions: [
      { id: '1.2-1', text: '各季度销售额是多少？', desc: '柱状图' },
      { id: '1.2-2', text: 'Q1到Q4的销售额对比', desc: '柱状图' },
      { id: '1.2-3', text: '季度销售额对比情况', desc: '柱状图' },
    ]
  },
  {
    id: 'kpi-trend',
    name: '规则1.3 趋势分析匹配',
    description: '应匹配折线图',
    questions: [
      { id: '1.3-1', text: '销售额趋势如何？', desc: '折线图' },
      { id: '1.3-2', text: '近3个月销售额变化趋势', desc: '折线图' },
      { id: '1.3-3', text: '销售额走势怎么样？', desc: '折线图' },
      { id: '1.3-4', text: '销售额波动情况', desc: '折线图' },
    ]
  },
  {
    id: 'kpi-pie',
    name: '规则1.4 占比分析匹配',
    description: '应匹配饼图',
    questions: [
      { id: '1.4-1', text: '各渠道销售额占比是多少？', desc: '饼图' },
      { id: '1.4-2', text: '销售渠道构成分析', desc: '饼图' },
      { id: '1.4-3', text: '各品类销售额分布情况', desc: '饼图' },
      { id: '1.4-4', text: '用户年龄分布比例', desc: '饼图' },
    ]
  },
  {
    id: 'kpi-region',
    name: '规则1.5 地区对比匹配',
    description: '应匹配柱状图',
    questions: [
      { id: '1.5-1', text: '各地区销售额对比', desc: '柱状图' },
      { id: '1.5-2', text: '各城市销售额排名', desc: '柱状图' },
      { id: '1.5-3', text: '分地区看销量情况', desc: '柱状图' },
    ]
  },
  {
    id: 'empty-state',
    name: '规则2.0 空状态与异常',
    description: '无数据/错误/权限/连接',
    questions: [
      { id: '2.1-1', text: '查询2030年的销售额', desc: '完全无数据' },
      { id: '2.1-2', text: '查询不存在的产品数据', desc: '完全无数据' },
      { id: '2.2-1', text: '查询2025年12月的销售额', desc: '错误提示' },
      { id: '2.2-2', text: '查询过去20年的销售趋势', desc: '警告提示' },
      { id: '2.3-1', text: '如果数据源连接失败了会显示什么？', desc: '连接失败' },
      { id: '2.4-1', text: '如果没有权限查看数据会显示什么？', desc: '权限拒绝' },
    ]
  },
  {
    id: 'data-volume',
    name: '规则3.0 数据量极小',
    description: '单日/短期/数据点不足',
    questions: [
      { id: '3.1-1', text: '查询2024年12月1日的销售额', desc: '单日数据' },
      { id: '3.2-1', text: '查询最近3天的销售额', desc: '短期数据' },
      { id: '3.3-1', text: '查询只有两天的销售数据会怎么样？', desc: '点数不足' },
    ]
  },
  {
    id: 'recommend-dedup',
    name: '规则4.0 智能推荐去重',
    description: '过滤重复维度',
    questions: [
      { id: '4.1-1', text: '今年销售额是多少？', desc: '过滤时间维度' },
      { id: '4.2-1', text: '各地区销售额对比', desc: '过滤地区维度' },
      { id: '4.3-1', text: '各渠道销售额占比', desc: '过滤渠道维度' },
    ]
  },

  // ========== 多度确认交互测试 ==========
  {
    id: 'multi-dim-confirm',
    name: '多度确认交互',
    description: '测试模糊问题澄清功能',
    questions: [
      { id: 'confirm-1', text: '看看数据', desc: '模糊问题 → AI反问澄清' },
      { id: 'confirm-2', text: '帮我看看', desc: '模糊问题 → AI反问澄清' },
      { id: 'confirm-3', text: '查看数据', desc: '模糊问题 → AI反问澄清' },
      { id: 'confirm-4', text: '数据分析', desc: '模糊问题 → AI反问澄清' },
      { id: 'confirm-5', text: '做个分析', desc: '模糊问题 → AI反问澄清' },
    ]
  },
  {
    id: 'ambiguous-metric',
    name: '模糊指标确认',
    description: '销售额（税前/税后）→AI反问选择',
    questions: [
      { id: 'amb-metric-1', text: '销售额是多少', desc: '销售额（税前/税后）→AI反问选择' },
      { id: 'amb-metric-2', text: '今年的销售额', desc: '销售额（税前/税后）→AI反问选择' },
      { id: 'amb-metric-3', text: '本月销售额', desc: '销售额（税前/税后）→AI反问选择' },
      { id: 'amb-metric-4', text: '销售额数据', desc: '销售额（税前/税后）→AI反问选择' },
    ]
  },
  {
    id: 'ambiguous-employee',
    name: '同名员工确认',
    description: '同名员工（张三）→AI反问选择',
    questions: [
      { id: 'amb-emp-1', text: '张三今年的业绩', desc: '同名员工（张三）→AI反问选择' },
      { id: 'amb-emp-2', text: '张三的销售额', desc: '同名员工（张三）→AI反问选择' },
      { id: 'amb-emp-3', text: '张三这个月表现怎么样', desc: '同名员工（张三）→AI反问选择' },
      { id: 'amb-emp-4', text: '查询张三的数据', desc: '同名员工（张三）→AI反问选择' },
    ]
  },

  // ========== 第二部分：基础功能与场景测试 ==========
  {
    id: 'l1',
    name: 'L1 基础查询',
    description: '单指标与多指标查询',
    questions: [
      { id: 'L1-01', text: '今年销售额是多少？', desc: '单指标+同比环比' },
      { id: 'L1-02', text: '本月订单量有多少？', desc: '单指标+趋势标签' },
      { id: 'L1-03', text: '现在的库存数值是多少？', desc: '简单数值展示' },
      { id: 'L1-04', text: '帮我看看销售额和订单量', desc: '多指标并列' },
      { id: 'L1-05', text: '我想看一下营收以及利润', desc: '多指标对比' },
    ]
  },
  {
    id: 'l2-trend',
    name: 'L2 趋势与同环比',
    description: '时间维度分析',
    questions: [
      { id: 'L2-01', text: '近3个月销售额趋势如何？', desc: '趋势折线图' },
      { id: 'L2-02', text: '今年销售额变化情况', desc: '月度走势' },
      { id: 'L2-03', text: '最近一周订单量波动大吗？', desc: '日粒度趋势' },
      { id: 'L2-04', text: '本月销售额比上月如何？', desc: '环比分析' },
      { id: 'L1-07', text: '12月份的销售额环比？', desc: '环比 + 归因入口（文字）' },
      { id: 'L2-05', text: '对比一下去年和今年的营收', desc: '年度对比' },
      { id: 'L2-06', text: 'Q3销售额同比增长情况', desc: '季度增长' },
    ]
  },
  {
    id: 'l2-dim',
    name: 'L2 构成与分布',
    description: '维度与占比分析',
    questions: [
      { id: 'L2-07', text: '销售渠道占比分析', desc: '饼图构成' },
      { id: 'L2-08', text: '各品类销售额构成是怎样的？', desc: '多品类分布' },
      { id: 'L2-09', text: '用户年龄分布比例', desc: '分段占比' },
      { id: 'L2-10', text: '各地区销售额对比', desc: '柱状图对比' },
      { id: 'L2-11', text: '分产品线看销量排名', desc: '产品排行' },
      { id: 'L2-12', text: '各渠道转化率哪个最好？', desc: '渠道转化率' },
    ]
  },
  {
    id: 'l2-geo',
    name: 'L2 地域分布',
    description: '地图可视化',
    questions: [
      { id: 'L2-16', text: '查看各省份销售分布', desc: '省份热力图' },
      { id: 'L2-17', text: '用户地域分布情况', desc: '用户地图' },
      { id: 'L2-18', text: '各城市订单量热力图', desc: '城市热力' },
    ]
  },
  {
    id: 'l2-rank',
    name: 'L2 排名与评估',
    description: 'TopN与四象限',
    questions: [
      { id: 'L2-19', text: '列出TOP10销售城市', desc: '降序排列' },
      { id: 'L2-20', text: '销量最低的5个产品是哪些？', desc: '升序排列' },
      { id: 'L2-21', text: '各门店业绩排名', desc: '门店排名' },
      { id: 'L2-13', text: '分析一下产品健康度', desc: '四象限分析' },
      { id: 'L2-14', text: '销售额和利润率有什么关系？', desc: '相关性分析' },
      { id: 'L2-15', text: '同时看客单价和复购率', desc: '散点图分析' },
    ]
  },
  {
    id: 'l2-anomaly',
    name: 'L2 异常检测',
    description: '异常发现与诊断',
    questions: [
      { id: 'L2-22', text: '找出异常交易数据', desc: '箱线图检测' },
      { id: 'L2-23', text: '昨天订单量突降原因是什么？', desc: '异常点归因' },
      { id: 'L2-24', text: '帮我检测销售额不正常的区域', desc: '区域异常' },
    ]
  },
  {
    id: 'web-search',
    name: '🌐 联网搜索测试',
    description: '需要联网搜索的问题',
    questions: [
      { id: 'web-01', text: '搜索最新的AI行业报告', desc: '行业报告搜索' },
      { id: 'web-02', text: '查找一下ChatGPT的最新动态', desc: '最新资讯搜索' },
      { id: 'web-03', text: '帮我搜索2024年电商市场分析', desc: '市场分析搜索' },
      { id: 'web-04', text: '找一下Python的最新教程', desc: '技术文档搜索' },
      { id: 'web-05', text: '搜索一下竞争对手的定价策略', desc: '竞品分析搜索' },
      { id: 'web-06', text: '查找最新的政策法规', desc: '政策法规搜索' },
      { id: 'web-07', text: '搜索实时股票行情', desc: '实时数据搜索' },
      { id: 'web-08', text: '帮我找一下行业趋势报告', desc: '趋势报告搜索' },
    ]
  },
  {
    id: 'l2-attr',
    name: '🔍 归因分析专区',
    description: '定制化预设答案（不走大模型）',
    questions: [
      // === 直接提问归因（每个都有独立定制答案） ===
      { id: 'attr-01', text: '为什么销售额下降了？', desc: '→ 多维度归因面板+饼图+柱状图' },
      { id: 'attr-02', text: '分析销售额增长原因', desc: '→ 增长驱动因素分析+线上贡献拆解' },
      { id: 'attr-03', text: '为什么11月销售额下降了？', desc: '→ 11月专项归因+双11透支效应分析' },
      { id: 'attr-04', text: '利润下滑的影响因素有哪些？', desc: '→ 成本因素拆解+优化建议' },
      { id: 'attr-05', text: '分析转化率偏低的原因', desc: '→ 漏斗诊断+环节流失率分析' },
      // === 带归因入口的查询 ===
      { id: 'attr-06', text: '12月份的销售额环比？', desc: '→ 环比KPI+11月vs12月对比图' },
      { id: 'attr-07', text: '今年销售额是多少？', desc: '→ 年度KPI+月度趋势对比图' },
      { id: 'attr-08', text: '本月销售额比上月如何？', desc: '→ 环比分析+周销售趋势' },
      // === 地区/渠道/产品归因 ===
      { id: 'attr-09', text: '华东区销售下降的原因', desc: '→ 华东城市拆解+门店装修影响' },
      { id: 'attr-10', text: '线上渠道增长的驱动因素', desc: '→ 平台贡献+抖音直播分析' },
      { id: 'attr-11', text: '产品A销量下滑原因分析', desc: '→ 产品归因+新品替代效应' },
      // === 下钻归因 ===
      { id: 'attr-12', text: '详细分析华东区下降原因', desc: '→ 三层归因(地区→城市→门店)' },
    ]
  },
  {
    id: 'l2-pred',
    name: 'L2 预测分析',
    description: '趋势预测',
    questions: [
      { id: 'L2-28', text: '预测下月销售额', desc: '置信区间' },
      { id: 'L2-29', text: '未来一周订单趋势预测', desc: '日粒度预测' },
      { id: 'L2-30', text: '预计Q4能完成多少营收？', desc: '目标预测' },
    ]
  },
  {
    id: 'l3',
    name: 'L3 下钻探索',
    description: '上下文交互',
    questions: [
      { id: 'L3-01', text: '详细看看华东区数据', desc: '区域下钻' },
      { id: 'L3-02', text: '展开说说杭州的情况', desc: '城市下钻' },
      { id: 'L3-03', text: '具体到各门店分析', desc: '门店下钻' },
    ]
  },
  {
    id: 'narrative',
    name: '叙事与故事',
    description: '完整分析报告',
    questions: [
      { id: 'S-01', text: '讲讲今年销售额的情况', desc: '年度业绩报告' },
      { id: 'S-02', text: '近三个月销售额趋势怎么样？', desc: '趋势叙事' },
      { id: 'S-03', text: '详细分析11月销售下降原因', desc: '完整归因报告（叙事版）' },
      { id: 'S-04', text: '昨天订单量是不是有问题？', desc: '异常诊断报告' },
      { id: 'P-01', text: '全面分析今年销售情况', desc: '分层渐进披露' },
      { id: 'G-01', text: '销售额下降了', desc: '智能引导追问' },
      { id: 'E2E-01', text: '今年业务怎么样？', desc: '端到端分析' },
    ]
  },
  {
    id: 'edge',
    name: '边界条件',
    description: '异常输入处理',
    questions: [
      { id: 'E-03', text: '销售', desc: '模糊意图引导' },
      { id: 'E-04', text: '看看数据', desc: '泛泛询问' },
      { id: 'E-05', text: '帮我分析一下', desc: '通用引导' },
      { id: 'E-06', text: '分析2024年Q1-Q3各地区各产品线销售额同比环比变化趋势并找出异常', desc: '超长复杂问题' },
    ]
  },
];

const CategoryItem = ({
  category,
  isExpanded,
  onToggle,
  onSelect,
}: {
  category: QuestionCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (text: string) => void;
}) => {
  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className={clsx(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 group',
          isExpanded 
            ? 'bg-[#F0F7FF] shadow-sm border border-[#007AFF]/10' 
            : 'bg-white hover:bg-[#F8FAFC] border border-transparent shadow-sm'
        )}
      >
        <div className="flex-1 text-left min-w-0">
          <div className={clsx(
            "text-[13px] transition-colors duration-300 truncate",
            isExpanded ? "text-[#007AFF] font-semibold" : "text-[#1d1d1f] font-medium"
          )}>
            {category.name}
          </div>
          <div className={clsx(
            "text-[11px] mt-0.5 transition-colors duration-300 truncate",
            isExpanded ? "text-[#007AFF]/70" : "text-[#86868b]"
          )}>
            {category.description}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!isExpanded && (
            <span className="text-[10px] text-[#007AFF] bg-[#007AFF]/5 px-1.5 py-0.5 rounded-full font-medium">
              {category.questions.length}
            </span>
          )}
          <div className={clsx(
            "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
            isExpanded ? "bg-[#007AFF] text-white rotate-180" : "bg-[#F5F5F7] text-[#86868b] group-hover:bg-[#007AFF]/10 group-hover:text-[#007AFF]"
          )}>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-1.5 pb-1.5 px-0.5 space-y-0.5">
              {category.questions.map((q) => {
                const isWebSearch = category.id === 'web-search';
                return (
                  <button
                    key={q.id}
                    onClick={() => onSelect(q.text, { forceWebSearch: isWebSearch })}
                    className={clsx(
                      "w-full text-left px-3 py-2 rounded-lg transition-all group relative",
                      "hover:bg-[#007AFF]/5 hover:shadow-sm border border-transparent hover:border-[#007AFF]/5",
                      "flex items-start gap-2"
                    )}
                  >
                    <div className={clsx(
                      "w-1 h-1 rounded-full transition-colors mt-1.5 flex-shrink-0",
                      isWebSearch ? "bg-[#34C759]/30 group-hover:bg-[#34C759]" : "bg-[#007AFF]/20 group-hover:bg-[#007AFF]"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-[#1d1d1f] group-hover:text-[#007AFF] transition-colors font-medium leading-relaxed">
                        {q.text}
                      </div>
                      {q.desc && (
                        <div className="text-[10px] text-[#86868b] group-hover:text-[#007AFF]/60 transition-colors mt-0.5">
                          {q.desc}
                        </div>
                      )}
                    </div>
                    {isWebSearch && (
                      <div className="opacity-60 group-hover:opacity-100 transition-opacity text-[#34C759] flex-shrink-0 mt-0.5">
                        <Search className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CollapsedToggle = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={onClick}
    className="fixed right-6 top-24 z-40 w-11 h-11 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#007AFF]/10 rounded-full flex items-center justify-center text-[#007AFF] hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,122,255,0.2)] transition-all duration-300"
  >
    <FlaskConical className="w-5 h-5" />
  </motion.button>
);

export const TestScenarioPanel = ({ onQuestionSelect, isOpen, onToggle }: TestScenarioPanelProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('kpi-year');
  const [searchQuery, setSearchQuery] = useState('');
  
  const totalQuestions = TEST_QUESTIONS.reduce((acc, cat) => acc + cat.questions.length, 0);

  if (!isOpen) return <CollapsedToggle onClick={onToggle} />;

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 260, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      className="h-full bg-white shadow-2xl border-l border-[#007AFF]/5 flex flex-col flex-shrink-0 z-50 relative"
    >
      {/* 头部 - 纯白通透 */}
      <div className="px-4 py-3.5 flex items-center justify-between bg-white sticky top-0 z-20 border-b border-[#E5E5EA]/30">
        <div>
          <h3 className="font-bold text-[#1d1d1f] text-[15px] tracking-tight flex items-center gap-1.5">
            <span className="w-0.5 h-3.5 bg-[#007AFF] rounded-full"></span>
            测试用例
          </h3>
          <p className="text-[10px] text-[#86868b] font-medium mt-0.5 pl-2.5">
            全量覆盖 <span className="text-[#d2d2d7] mx-1">|</span> 精确匹配
          </p>
        </div>
        <button
          onClick={onToggle}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F5F5F7] text-[#86868b] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 搜索框 - 悬浮质感 */}
      <div className="px-4 pb-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#86868b] group-focus-within:text-[#007AFF] transition-colors" />
          <input
            type="text"
            placeholder="搜索测试场景..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[12px] bg-[#F5F5F7] rounded-lg border border-transparent focus:bg-white focus:border-[#007AFF]/20 focus:ring-2 focus:ring-[#007AFF]/5 transition-all outline-none placeholder:text-[#86868b]"
          />
        </div>
      </div>

      {/* 统计 - 蓝白胶囊 */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between bg-[#F0F7FF] rounded-lg p-2 border border-[#007AFF]/5">
          <div className="flex flex-col items-center flex-1 border-r border-[#007AFF]/10">
            <span className="text-[14px] font-bold text-[#007AFF]">{totalQuestions}</span>
            <span className="text-[9px] text-[#007AFF]/60 font-medium">测试点</span>
          </div>
          <div className="flex flex-col items-center flex-1 border-r border-[#007AFF]/10">
            <span className="text-[14px] font-bold text-[#1d1d1f]">{TEST_QUESTIONS.length}</span>
            <span className="text-[9px] text-[#86868b] font-medium">场景分类</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[14px] font-bold text-[#34C759]">100%</span>
            <span className="text-[9px] text-[#34C759]/80 font-medium">覆盖率</span>
          </div>
        </div>
      </div>

      {/* 列表区域 - 纯净背景 */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-hide bg-white">
        {TEST_QUESTIONS
          .filter(category => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
              category.name.toLowerCase().includes(query) ||
              (category.description && category.description.toLowerCase().includes(query)) ||
              category.questions.some(q => 
                q.text.toLowerCase().includes(query) || 
                (q.desc && q.desc.toLowerCase().includes(query))
              )
            );
          })
          .map((category) => {
            const filteredCategory = searchQuery
              ? {
                  ...category,
                  questions: category.questions.filter(q => {
                    const query = searchQuery.toLowerCase();
                    return (
                      q.text.toLowerCase().includes(query) ||
                      (q.desc && q.desc.toLowerCase().includes(query))
                    );
                  })
                }
              : category;
            
            if (filteredCategory.questions.length === 0) return null;
            
            return (
              <CategoryItem
                key={category.id}
                category={filteredCategory}
                isExpanded={expandedCategory === category.id || !!searchQuery}
                onToggle={() =>
                  setExpandedCategory(expandedCategory === category.id ? null : category.id)
                }
                onSelect={onQuestionSelect}
              />
            );
          })}
        
        <div className="h-4" />
      </div>
    </motion.div>
  );
};

export default TestScenarioPanel;
