/**
 * L3层级下钻、叙事故事、边界条件测试用例
 * 数据故事场景 - 专业分析师风格的完整叙事报告
 */

import { ContentBlock } from '../types';
import { B } from './testCaseData';

// ============================================
// L3 下钻探索
// ============================================
export const L3_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // L3-01: 详细看看华东区数据 - 区域下钻
  'L3-01': () => [
    B.visualizer([
      { id: 'ds_301', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_301', type: 'groupby', label: '按', value: '城市 下钻' },
      { id: 'dt_301', type: 'date', label: '日期', value: '2024年' },
      { id: 'ft_301', type: 'filter', label: '地区', value: '华东' },
    ]),
    B.heading(' 华东区销售深度分析'),
    B.text('基于刚才的分析，为您深入展开华东区数据：'),
    B.kpi({
      id: 'east',
      label: '华东区年度销售额',
      value: 12500000,
      prefix: '¥',
      trend: { value: 22, direction: 'up', label: '同比增长' },
    }),
    B.barChart({
      data: [
        { city: '上海', value: 520, growth: 18 },
        { city: '杭州', value: 410, growth: 28 },
        { city: '南京', value: 250, growth: 15 },
        { city: '苏州', value: 220, growth: 22 },
        { city: '宁波', value: 180, growth: 20 },
        { city: '其他', value: 170, growth: 12 },
      ],
      xKey: 'city',
      yKey: 'value',
      title: '华东各城市销售额（万元）',
      summary: [
        { label: '华东总计', value: '1,250', unit: '万元', highlight: true },
        { label: '城市数', value: '4', unit: '个' },
        { label: '占全国', value: '32.4', unit: '%' },
      ],
    }),
    B.text('**华东区核心洞察**：\n\n华东区以 **1250万** 销售额贡献全国 **32.4%**，是绝对的业务核心区域。\n\n• **上海** 作为区域龙头，贡献520万（占华东41.6%）\n• **杭州** 增速最快（+28%），电商生态优势明显\n• **南京** 表现稳健，有进一步提升空间'),
    B.pieChart({
      data: [
        { name: '上海', value: 41.6 },
        { name: '杭州', value: 32.8 },
        { name: '南京', value: 20 },
        { name: '其他', value: 5.6 },
      ],
      title: '华东城市占比',
      summary: [
        { label: '龙头城市', value: '上海', unit: '41.6%', highlight: true },
        { label: '增速最快', value: '杭州', unit: '+28%' },
      ],
    }),
    B.insight('战略建议', '建议将杭州作为增长极重点投入，同时深挖南京、苏州等二线城市潜力。', 'success'),
    B.actions([
      { id: '1', label: '深入杭州', query: '展开说说杭州的情况', icon: 'search' },
      { id: '2', label: '增长分析', query: '华东区增长驱动因素', icon: 'pie' },
    ]),
  ],

  // L3-02: 展开说说杭州的情况 - 城市下钻
  'L3-02': () => [
    B.visualizer([
      { id: 'ds_302', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_302', type: 'groupby', label: '按', value: '区域 下钻' },
      { id: 'dt_302', type: 'date', label: '日期', value: '2024年' },
      { id: 'ft_302', type: 'filter', label: '城市', value: '杭州' },
    ]),
    B.heading('🏙️ 杭州市场深度画像'),
    B.quote('杭州作为新一线城市标杆，展现出独特的消费特征和增长潜力。', true),
    B.kpi({
      id: 'hangzhou',
      label: '杭州年度销售额',
      value: 4100000,
      prefix: '¥',
      trend: { value: 28, direction: 'up', label: '同比增长 · 增速第一' },
    }),
    B.kpiGroup([
      { id: 'orders', label: '年度订单量', value: 15800, unit: '单', trend: { value: 25, direction: 'up' } },
      { id: 'avgOrder', label: '平均客单价', value: 259, prefix: '¥', trend: { value: 2.4, direction: 'up' } },
      { id: 'newUser', label: '新客占比', value: '38%', trend: { value: 5, direction: 'up' } },
    ]),
    B.section(' 区域分布'),
    B.barChart({
      data: [
        { district: '西湖区', value: 125, stores: 8 },
        { district: '滨江区', value: 98, stores: 5 },
        { district: '拱墅区', value: 85, stores: 6 },
        { district: '余杭区', value: 72, stores: 4 },
        { district: '其他', value: 30, stores: 3 },
      ],
      xKey: 'district',
      yKey: 'value',
      title: '杭州各区销售额（万元）',
      summary: [
        { label: '杭州总计', value: '410', unit: '万元', highlight: true },
        { label: '门店总数', value: '26', unit: '家' },
        { label: '店均销售', value: '15.8', unit: '万元' },
      ],
    }),
    B.section(' 市场特征'),
    B.text('**杭州市场三大特点**：\n\n1️⃣ **高增长**：同比+28%，远超全国均值（19.8%），连续3年保持20%+增速\n\n2️⃣ **年轻化**：25-35岁用户占比62%，高于全国平均（48%），消费意愿强\n\n3️⃣ **线上偏好**：线上渠道占比68%（全国55%），直播、社交电商渗透率高'),
    B.insight('增长密码', '杭州的电商基因、年轻人口结构、以及浓厚的互联网氛围是高增长的核心驱动力。建议加大直播带货和社交裂变投入。', 'success'),
    B.actions([
      { id: '1', label: '门店分析', query: '具体到各门店分析', icon: 'bar' },
      { id: '2', label: '用户画像', query: '杭州用户画像分析', icon: 'search' },
    ]),
  ],

  // L3-03: 具体到各门店分析 - 门店下钻
  'L3-03': () => [
    B.visualizer([
      { id: 'ds_303', type: 'datasource', label: '数据源', value: '门店销售', removable: false },
      { id: 'gb_303', type: 'groupby', label: '按', value: '门店 排名' },
      { id: 'dt_303', type: 'date', label: '日期', value: '本月' },
      { id: 'ft_303', type: 'filter', label: '城市', value: '杭州' },
    ]),
    B.heading('🏪 杭州门店经营分析'),
    B.text('下钻到门店级别，为您呈现各店铺的详细经营数据：'),
    B.barChart({
      data: [
        { store: '西湖银泰店', value: 68, target: 65, staff: 12, rate: 104.6 },
        { store: '武林广场店', value: 57, target: 60, staff: 10, rate: 95.0 },
        { store: '滨江龙湖店', value: 52, target: 50, staff: 8, rate: 104.0 },
        { store: '城西银泰店', value: 45, target: 48, staff: 8, rate: 93.8 },
        { store: '下沙金沙店', value: 38, target: 35, staff: 6, rate: 108.6 },
      ],
      xKey: 'store',
      yKey: 'value',
      title: '杭州各门店月销售额（万元）',
      summary: [
        { label: '门店总销售', value: '260', unit: '万元', highlight: true },
        { label: '达标门店', value: '3', unit: '家' },
        { label: '平均达成率', value: '101.2', unit: '%' },
      ],
    }),
    B.section('✅ 达标门店分析'),
    B.text('**3家门店超额完成目标**：\n\n🥇 **下沙金沙店**：达成率108.6%（最佳）\n   • 人效6.3万/人，全市最高\n   • 成功经验：社区深耕+会员运营\n\n🥈 **西湖银泰店**：达成率104.6%\n   • 位置优势，客流量稳定\n\n🥉 **滨江龙湖店**：达成率104.0%\n   • 科技人群聚集，高客单价'),
    B.section(' 未达标门店诊断'),
    B.text('**2家门店需要关注**：\n\n❌ **武林广场店**：达成率95.0%（差3万）\n   • 问题：客流大但转化低（2.1% vs 均值3.5%）\n   • 建议：优化陈列+销售话术培训\n\n❌ **城西银泰店**：达成率93.8%（差3万）\n   • 问题：周边竞品分流\n   • 建议：差异化选品+会员专属活动'),
    B.kpiGroup([
      { id: 'avg', label: '平均人效', value: 5.9, unit: '万/人', trend: { value: 8, direction: 'up' } },
      { id: 'best', label: '最高人效', value: 6.3, unit: '万/人' },
      { id: 'worst', label: '最低人效', value: 5.1, unit: '万/人' },
    ]),
    B.insight('管理建议', '下沙店的"社区深耕+会员运营"模式值得推广。武林店需立即启动转化率提升专项。', 'warning'),
    B.actions([
      { id: '1', label: '武林店诊断', query: '分析武林广场店未达标原因', icon: 'search' },
      { id: '2', label: '最佳实践', query: '下沙店成功经验分享', icon: 'bar' },
    ]),
  ],
};

// ============================================
// 叙事与故事场景 - 专业分析师风格
// ============================================
export const NARRATIVE_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // S-01: 今年销售额是多少 - 故事化回答（叙事版本）
  'S-01': () => [
    B.heading(' 2024年度销售业绩分析报告'),
    B.divider(),
    
    B.quote('2024年是充满挑战与机遇的一年，面对复杂的市场环境，我们交出了一份超预期的答卷。年度销售额首次突破3800万大关，创下历史新高。', true),
    
    B.section('核心业绩速览'),
    B.metricsPreview('年度销售核心指标', '', [
      { value: '3856万', label: '年度销售额', color: 'text-[#007AFF]' },
      { value: '+19.8%', label: '同比增长', color: 'text-emerald-500' },
      { value: '110.2%', label: '目标达成率', color: 'text-[#5AC8FA]' },
    ]),
    
    B.text('2024年度销售额达到 **3856万元**，较去年同期增长 **19.8%**，不仅超额完成年初制定的3500万目标（达成率110.2%），更创下公司历史新高。'),
    
    B.section('季度表现对比'),
    B.regionCards([
      { flag: '🌸', name: 'Q1 (1-3月)', value: '823万', desc: '开局稳健，春节后快速恢复', color: 'text-[#007AFF]' },
      { flag: '☀️', name: 'Q2 (4-6月)', value: '945万', desc: '新品上市拉动，环比+15%', color: 'text-[#34C759]' },
      { flag: '🍂', name: 'Q3 (7-9月)', value: '1028万', desc: '暑期营销成效显著', color: 'text-[#FF9500]' },
      { flag: '❄️', name: 'Q4 (10-12月)', value: '1060万', desc: '全年最强，双11+双12驱动', color: 'text-[#5AC8FA]' },
    ]),
    
    B.section('年度增长轨迹'),
    B.lineChart({
      data: [
        { month: '1月', '2024': 280, '2023': 240 },
        { month: '2月', '2024': 260, '2023': 220 },
        { month: '3月', '2024': 283, '2023': 250 },
        { month: '4月', '2024': 310, '2023': 265 },
        { month: '5月', '2024': 320, '2023': 280 },
        { month: '6月', '2024': 315, '2023': 270 },
        { month: '7月', '2024': 340, '2023': 290 },
        { month: '8月', '2024': 350, '2023': 300 },
        { month: '9月', '2024': 338, '2023': 285 },
        { month: '10月', '2024': 360, '2023': 310 },
        { month: '11月', '2024': 350, '2023': 300 },
        { month: '12月', '2024': 354, '2023': 310 },
      ],
      xKey: 'month',
      type: 'year-comparison',
      currentYear: '2024',
      lastYear: '2023',
      title: '年度趋势对比（万元）',
      summary: [
        { label: '2024年总计', value: '3,856', unit: '万元', highlight: true },
        { label: '2023年总计', value: '3,220', unit: '万元' },
        { label: '同比增长', value: '+19.8', unit: '%' },
      ],
    }),
    
    B.text('从月度走势来看，全年呈现**稳步攀升**态势：\n\n• **上半年**（1-6月）：夯实基础期，同比增长16%\n• **下半年**（7-12月）：加速增长期，同比增长23%\n• **Q4单季**：达到1060万峰值，贡献全年27.5%'),
    
    B.divider(),
    
    B.section('增长驱动归因'),
    B.pieChart({
      data: [
        { name: '新客增长', value: 40 },
        { name: '客单价提升', value: 25 },
        { name: '复购率提高', value: 20 },
        { name: '渠道扩展', value: 15 },
      ],
      title: '增长驱动因素',
      summary: [
        { label: '增长总额', value: '+638', unit: '万元', highlight: true },
        { label: '主因', value: '新客增长', unit: '40%' },
      ],
    }),
    
    B.text('• **新客增长（贡献40%）**： 新客户数同比+35%，获客成本反而下降12%，品牌影响力显著提升。'),
    B.text('• **客单价提升（贡献25%）**： 高端产品占比从8%提升到15%，平均客单价增长6.7%。'),
    B.text('• **渠道扩展（贡献15%）**： 线上渠道增速35%，占比首超40%。'),
    
    B.insight(' 关键洞察', '新客增长是最大驱动力，说明品牌影响力和获客能力显著提升。但需关注老客复购率略有下滑（-2%），建议加强会员运营体系。', 'success'),
    
    B.divider(),
    
    B.section('总结与展望'),
    B.text('2024年的出色表现，为2025年冲击5000万目标奠定了坚实基础。下一步，建议在保持新客增长的同时，重点提升老客价值和区域均衡性。'),
    
    B.analystQuote(
      '数字背后是团队的付出，每一个百分点的增长都凝聚着汗水和智慧。',
      '销售分析师',
      '年度业绩报告',
      '💼'
    ),
    
    B.actions([
      { id: '1', label: '查看地区分布', query: '各地区销售额对比', icon: 'map' },
      { id: '2', label: '分析渠道构成', query: '销售渠道占比分析', icon: 'pie' },
      { id: '3', label: '对比去年同期', query: '对比去年和今年营收', icon: 'trend' },
    ]),
  ],

  // S-02: 近三个月销售额趋势怎么样 - 趋势叙事
  'S-02': () => [
    B.heading(' 近三个月销售趋势深度分析'),
    B.quote('在促销红利消退的背景下，销售额进入平稳调整期，这是健康的市场表现。', true),
    
    B.section('当前态势'),
    B.kpi({
      id: 'current',
      label: '本月销售额',
      value: 3500000,
      prefix: '¥',
      trend: { value: 2.8, direction: 'down', label: '环比微降' },
    }),
    
    B.text('近三个月销售额呈现"**先升后稳**"的态势，这是大促后的典型走势：'),
    
    B.lineChart({
      data: [
        { date: '10/1', value: 115, event: '国庆促销' },
        { date: '10/10', value: 125, event: '高峰' },
        { date: '10/20', value: 130, event: '' },
        { date: '11/1', value: 128, event: '双11预热' },
        { date: '11/11', value: 145, event: '双11' },
        { date: '11/20', value: 112, event: '回落' },
        { date: '12/1', value: 115, event: '' },
        { date: '12/10', value: 118, event: '平稳' },
      ],
      xKey: 'date',
      yKeys: [{ key: 'value', name: '日销售额(万)', color: '#3b82f6' }],
      title: '近三个月销售走势',
    }),
    
    B.section('关键节点解读'),
    B.text(' **10月（360万）**：\n达到近期高点，主要受国庆大促拉动。日均销售12万，峰值出现在10月10日（13万）。\n\n **11月（350万）**：\n环比下降2.8%，但双11期间单日突破14.5万。下旬明显回落是促销透支的正常反应。\n\n **12月（350万）**：\n进入平稳期，日均波动收窄。12月中旬有一次短暂下探，已恢复正常。'),
    
    B.section('同期对比'),
    B.barChart({
      data: [
        { month: '10月', '2024': 360, '2023': 310 },
        { month: '11月', '2024': 350, '2023': 300 },
        { month: '12月', '2024': 350, '2023': 310 },
      ],
      xKey: 'month',
      yKey: '2024',
      title: '同比对比（万元）',
    }),
    
    B.text('尽管环比微降，但**同比仍保持15%增长**，说明基本面依然健康。增速放缓主要是去年同期基数提高所致。'),
    
    B.insight(' 值得关注', '12月中旬出现一次异常波动（单日下降15%），经排查为竞品大促分流所致，已于12月18日恢复。建议持续监控竞品动态。', 'warning'),
    
    B.divider(),
    B.text('💬 **"短期波动是正常现象，关键是保持趋势向上。"**\n\n—— 资深数据分析师'),
    
    B.actions([
      { id: '1', label: '分析波动原因', query: '为什么11月销售额下降了', icon: 'search' },
      { id: '2', label: '预测下月趋势', query: '预测下月销售额', icon: 'trend' },
      { id: '3', label: '对比各渠道', query: '各渠道销售趋势', icon: 'bar' },
    ]),
  ],

  // S-03: 为什么11月销售额下降了 - 详细归因报告
  'S-03': () => [
    B.heading(' 11月销售下滑归因分析报告'),
    B.quote('找准问题根源，才能对症下药。让我们用数据说话。', true),
    
    B.section('问题确认'),
    B.kpi({
      id: 'nov',
      label: '11月销售额',
      value: 3500000,
      prefix: '¥',
      trend: { value: 15, direction: 'down', label: '环比↓15% | 同比↓8%' },
    }),
    
    B.text('11月销售额 **350万**，出现明显下滑。这是今年首次出现环比、同比双降，需要深入分析。'),
    
    B.divider(),
    B.section(' 维度一：时间分布'),
    B.lineChart({
      data: [
        { week: '第1周', value: 98, label: '双11预热' },
        { week: '第2周', value: 125, label: '双11高峰' },
        { week: '第3周', value: 68, label: '促销结束' },
        { week: '第4周', value: 59, label: '回落期' },
      ],
      xKey: 'week',
      yKeys: [{ key: 'value', name: '周销售额(万)', color: '#3b82f6' }],
      title: '11月周度走势',
    }),
    
    B.text('**发现**：下降始于11月第3周（双11结束后）\n\n• 第1-2周：正常甚至超预期（双11拉动）\n• 第3-4周：断崖式下跌（周均63万 vs 月均87万）\n\n**结论**：这是典型的"**促销透支效应**"——大促期间提前释放了消费需求。'),
    
    B.divider(),
    B.section(' 维度二：地区贡献'),
    B.barChart({
      data: [
        { region: '华东区', decline: -25, amount: -52 },
        { region: '华南区', decline: -12, amount: -24 },
        { region: '华北区', decline: -8, amount: -12 },
        { region: '其他', decline: -3, amount: -4 },
      ],
      xKey: 'region',
      yKey: 'decline',
      title: '各地区下降幅度（%）',
      color: '#ef4444',
    }),
    
    B.text('**发现**：华东区下降最严重（-25%），贡献了总下降额的 **57%**\n\n **华东异常需重点关注**：\n• 杭州：-30%（双11后报复性下跌）\n• 上海：-22%（竞品分流明显）\n• 南京：-18%（相对温和）'),
    
    B.divider(),
    B.section(' 维度三：渠道分析'),
    B.pieChart({
      data: [
        { name: '线上渠道下降贡献', value: 62 },
        { name: '线下渠道下降贡献', value: 38 },
      ],
      title: '各渠道下降贡献度',
    }),
    
    B.text('**发现**：线上渠道是主要"拖累"\n\n• **线上下降贡献占62%**：天猫、京东等平台流量被双11透支\n• **线下相对稳定**：门店客流影响较小，抗周期性更强'),
    
    B.divider(),
    B.section('📋 归因总结'),
    B.text('| 因素 | 影响权重 | 金额影响 | 说明 |\n|-----|---------|---------|-----|\n| 促销透支效应 | **45%** | -42万 | 双11提前释放需求 |\n| 华东区异常 | **30%** | -28万 | 竞品活动+基数高 |\n| 线上流量下滑 | **25%** | -23万 | 平台流量分配变化 |'),
    
    B.insight(' 综合判断', '本次下降属于"**预期内的结构性调整**"，主要是大促透支效应，非系统性风险。预计12月将企稳回升。', 'primary'),
    
    B.section(' 行动建议'),
    B.text('1. **短期**：针对华东区启动"冬季暖心购"小促活动\n2. **中期**：优化大促节奏，避免过度集中\n3. **长期**：加强线下渠道建设，平衡线上依赖'),
    
    B.actions([
      { id: '1', label: '下钻华东区', query: '详细看看华东区数据', icon: 'search' },
      { id: '2', label: '分析线上渠道', query: '线上各平台表现对比', icon: 'bar' },
      { id: '3', label: '查看历史同期', query: '历史11月表现规律', icon: 'trend' },
    ]),
  ],

  // S-04: 昨天订单量是不是有问题 - 异常诊断报告
  'S-04': () => [
    B.heading(' 订单异常诊断报告'),
    B.quote('是的，昨日订单量存在显著异常。已完成初步排查，请查阅诊断结果。', true),
    
    B.section('异常确认'),
    B.kpi({
      id: 'yesterday',
      label: '昨日订单量',
      value: 850,
      unit: '单',
      trend: { value: 28.5, direction: 'down', label: '🔴 显著偏离' },
    }),
    
    B.kpiGroup([
      { id: 'avg', label: '近30天日均', value: 1150, unit: '单' },
      { id: 'std', label: '标准差', value: 85, unit: '单' },
      { id: 'deviation', label: '偏离度', value: '-3.5σ' },
    ]),
    
    B.text('昨日订单 **850单**，较近30天均值低 **26%**，超出3个标准差，**确认为统计学显著异常**。'),
    
    B.divider(),
    B.section('🔬 异常程度评估'),
    B.boxPlot({
      data: {
        min: 950,
        q1: 1050,
        median: 1150,
        q3: 1250,
        max: 1400,
        outliers: [850],
      },
      title: '近30天订单分布',
    }),
    
    B.text('从箱线图可以清晰看到：昨日数据点（850）远离正常分布区间，是近30天**唯一的离群点**。'),
    
    B.divider(),
    B.section(' 异常时段定位'),
    B.barChart({
      data: [
        { hour: '08-10', normal: 120, actual: 115, status: 'normal' },
        { hour: '10-12', normal: 180, actual: 175, status: 'normal' },
        { hour: '12-14', normal: 220, actual: 210, status: 'normal' },
        { hour: '14-16', normal: 250, actual: 95, status: 'danger' },
        { hour: '16-18', normal: 230, actual: 85, status: 'danger' },
        { hour: '18-20', normal: 180, actual: 170, status: 'normal' },
      ],
      xKey: 'hour',
      yKey: 'actual',
      title: '分时段订单对比',
    }),
    
    B.text(' **异常精准定位**：\n\n• **异常时段**：14:00 - 18:00（共4小时）\n• **正常预期**：480单\n• **实际完成**：180单\n• **缺口**：300单（占全天缺口的100%）\n\n其他时段均在正常范围内。'),
    
    B.divider(),
    B.section(' 原因排查'),
    B.text('| 可能原因 | 可能性 | 排查结果 |\n|---------|-------|--------|\n| **系统故障** | ⭐⭐⭐ | 🔴 14:00-14:15有15分钟服务中断 |\n| 支付通道异常 | ⭐⭐ | 🟢 支付成功率正常（98.2%） |\n| 竞品大促分流 | ⭐⭐ | 🟡 竞品有活动，但影响有限 |\n| 正常波动 | ⭐ | 🔴 不符合历史规律 |'),
    
    B.insight('⚡ 根本原因', '技术团队确认：14:00-14:15服务器发生15分钟宕机，导致后续订单堆积和用户流失。系统恢复后，部分用户已离开。', 'danger'),
    
    B.section(' 影响评估'),
    B.text('• **直接损失**：约300单 × 均价¥268 = **¥8万**\n• **间接影响**：部分用户体验受损，可能影响后续复购\n• **修复状态**：系统已恢复，正在运行稳定'),
    
    B.section(' 后续行动'),
    B.text('1. ✅ 技术团队已完成故障复盘，优化了监控告警\n2. 📧 建议对受影响用户发送致歉优惠券（已准备方案）\n3.  未来72小时重点监控系统稳定性'),
    
    B.actions([
      { id: '1', label: '查看系统日志', query: '检查14点后系统状态', icon: 'search' },
      { id: '2', label: '用户补偿方案', query: '支付环节异常排查', icon: 'bar' },
      { id: '3', label: '历史异常对比', query: '历史同日订单表现', icon: 'trend' },
    ]),
  ],

  // P-01: 全面分析今年销售情况 - 分层渐进披露
  'P-01': () => [
    B.reportHero({
      title: '2024年度销售综合分析报告',
      subtitle: '全方位复盘年度业绩，洞察增长密码，为新一年战略提供依据。',
      badges: [
        { label: '年度销售额', value: '¥3,856万', helper: '+19.8% YoY' },
        { label: '目标达成率', value: '110.2%', helper: '+10.2% vs 目标' },
        { label: '新增客户', value: '+35%', helper: '获客成本-12%' },
      ],
      tags: ['首次突破3500万', '年度增速最快'],
    }),

    B.reportLayer({
      layer: '第一层',
      title: '核心结论',
      description: '2024年交出超预期答卷，销售规模与增速双双创下历史新高。',
      highlights: [
        '年度销售额3856万，同比+19.8%，超额完成目标10.2%，首次突破3500万大关。',
        '增长动力来自“线上渠道 + 高客单产品”双引擎，贡献全年增量的72%。',
      ],
    }),

    B.reportLayer({
      layer: '第二层',
      title: '关键指标仪表',
      kpis: [
        { label: '年销售额', value: '¥3,856万', trend: '+19.8%' },
        { label: '目标达成率', value: '110.2%', trend: '+10.2%' },
        { label: '订单总量', value: '12.6万单', trend: '+12.3%' },
        { label: '平均客单价', value: '¥307', trend: '+6.7%' },
      ],
    }),

    B.lineChart({
      data: [
        { month: '1月', value: 280 },
        { month: '2月', value: 260 },
        { month: '3月', value: 283 },
        { month: '4月', value: 310 },
        { month: '5月', value: 320 },
        { month: '6月', value: 315 },
        { month: '7月', value: 340 },
        { month: '8月', value: 350 },
        { month: '9月', value: 338 },
        { month: '10月', value: 360 },
        { month: '11月', value: 350 },
        { month: '12月', value: 354 },
      ],
      xKey: 'month',
      yKeys: [{ key: 'value', name: '销售额(万)', color: '#3b82f6' }],
      title: '月度销售趋势',
    }),
    
    B.reportLayer({
      layer: '第三层',
      title: '趋势洞察',
      accent: 'purple',
      description: '全年呈现稳步上升态势，Q2-Q4 逐季抬升，10月达到全年高峰360万。',
      highlights: [
        'Q1 开局稳健（823万），春节后迅速恢复；Q2 新品上市带来环比+15%。',
        'Q3 暑期营销成效显著，Q4 由双11+双12驱动，占全年收入的28%。',
      ],
    }),

    B.reportLayer({
      layer: '第四层',
      title: '增长引擎',
      accent: 'green',
      highlights: [
        '高端突破：客单价>500元的订单占比从8%提升至15%，贡献销售增量的34%。',
        '线上腾飞：线上渠道增速35%，占比首次超过40%，拉动全年新增收入的42%。',
      ],
    }),

    B.pieChart({
      data: [
        { name: '华东', value: 32.4 },
        { name: '华南', value: 25.4 },
        { name: '华北', value: 18.7 },
        { name: '华中', value: 13.2 },
        { name: '其他', value: 10.3 },
      ],
      title: '地区销售占比',
    }),
    
    B.text('**渠道构成**'),
    B.barChart({
      data: [
        { channel: '线上直营', value: 41, growth: 35 },
        { channel: '线下门店', value: 32, growth: 12 },
        { channel: '分销渠道', value: 18, growth: 8 },
        { channel: '企业客户', value: 9, growth: 25 },
      ],
      xKey: 'channel',
      yKey: 'value',
      title: '渠道占比（%）',
    }),
    
    B.calloutCard({
      title: '需要关注',
      variant: 'warning',
      items: [
        { label: '华北疲软', desc: '增速仅8%，低于全国均值，需要专项突破。' },
        { label: '老客流失', desc: '复购率下降3个百分点，会员运营力度不足。' },
        { label: '利润压力', desc: '大促频次高导致毛利率下降2%。' },
      ],
    }),

    B.strategyCard({
      title: '2025战略建议',
      description: '聚焦“固盘 + 提效 + 新客”三条主线，确保增长质量。',
      steps: [
        { title: '华北市场专项突破', desc: '设立区域突击队，集中营销预算与渠道激励，弥补增长短板。' },
        { title: '会员体系升级', desc: '重构积分与权益，推动老客分层运营，目标复购率回升到42%。' },
        { title: '控频增效', desc: '减少无效促销，打造标杆新品与精品直播，实现收入与利润双提升。' },
      ],
    }),

    B.analystQuote('“2024年验证了我们的方向，2025年要在效率上更进一步。”', '销售战略分析'),
    
    B.actions([
      { id: '1', label: '地区深入分析', query: '各地区销售额对比', icon: 'map' },
      { id: '2', label: '渠道详细分析', query: '销售渠道占比分析', icon: 'pie' },
      { id: '3', label: '产品结构分析', query: '各品类销售额构成', icon: 'bar' },
    ]),
  ],

  // G-01: 销售额下降了 - 智能引导追问
  'G-01': () => [
    B.heading('🤔 销售额下降分析'),
    B.text('我注意到您提到销售额下降。为了给您最精准的分析，请帮我确认几个信息：'),
    
    B.divider(),
    B.section('1️⃣ 您关注的时间范围？'),
    B.actions([
      { id: 't1', label: '📅 本月', query: '本月销售额下降原因分析', icon: 'calendar' },
      { id: 't2', label: '📅 本周', query: '本周销售额下降原因分析', icon: 'calendar' },
      { id: 't3', label: '📅 昨天', query: '昨天销售额下降原因分析', icon: 'calendar' },
    ]),
    
    B.section('2️⃣ 您想对比的基准？'),
    B.actions([
      { id: 'c1', label: ' 环比上期', query: '销售额环比分析', icon: 'trend' },
      { id: 'c2', label: ' 同比去年', query: '销售额同比分析', icon: 'trend' },
      { id: 'c3', label: ' 对比目标', query: '销售额目标达成分析', icon: 'target' },
    ]),
    
    B.section('3️⃣ 您最想了解什么？'),
    B.actions([
      { id: 'f1', label: ' 下降原因', query: '为什么销售额下降', icon: 'search' },
      { id: 'f2', label: '🗺️ 影响范围', query: '销售额下降影响哪些区域', icon: 'map' },
      { id: 'f3', label: ' 恢复建议', query: '如何提升销售额', icon: 'bar' },
    ]),
    
    B.divider(),
    B.insight(' 快捷分析', '您也可以直接输入完整问题，例如：\n• "本月销售额比上月下降的原因"\n• "华东区销售为什么下滑"\n• "双11后销售额下降如何恢复"'),
  ],

  // E2E-01: 今年业务怎么样 - 端到端分析（灵光风格完整报告）
  'E2E-01': () => [
    B.heading(' 2024年度业务全景报告'),
    B.divider(),
    
    B.quote('让数据说话，全面审视年度经营成果，洞察机遇与挑战。2024年是充满挑战与机遇的"突破之年"，我们交出了一份超预期的答卷。', true),
    
    B.section('核心预测速览'),
    B.metricsPreview('2024年度业绩指标', '', [
      { value: '3856万', label: '年销售额', color: 'text-[#007AFF]' },
      { value: '852万', label: '净利润', color: 'text-emerald-500' },
      { value: '85.6万', label: '活跃用户', color: 'text-[#5AC8FA]' },
    ]),
    
    B.section('主要区域表现'),
    B.regionCards([
      { flag: '🇨🇳', name: '华东区', value: '32.4%', desc: '增速22%，核心增长引擎', color: 'text-[#007AFF]' },
      { flag: '🌊', name: '华南区', value: '25.4%', desc: '增速18%，稳健增长', color: 'text-emerald-500' },
      { flag: '⛰️', name: '华北区', value: '18.7%', desc: '增速8%，需重点关注', color: 'text-amber-500' },
    ]),
    
    B.text('**华东区**： 作为核心增长引擎，贡献全国32.4%销售额。上海、杭州表现突出，其中杭州增速达28%，成为新的增长极。'),
    
    B.text('**华南区**： 保持稳健增长态势，深圳科技人群消费力强，广州传统渠道稳固。建议加大线上直播投入。'),
    
    B.text('**华北区**： 增速低于预期，主要受竞品活动冲击和渠道调整影响。建议成立专项小组，制定针对性策略。'),
    
    B.divider(),
    
    B.section('关键驱动因素与风险'),
    
    B.text('**核心驱动力：**'),
    B.text('• **新客增长（+35%）**： 品牌影响力提升，获客成本反而下降12%，说明口碑效应正在形成。'),
    B.text('• **线上渠道爆发（+35%）**： 占比首超40%，电商生态红利持续释放。'),
    B.text('• **高端产品突破**： 客单价>500元订单占比从8%提升到15%。'),
    
    B.text('**主要风险与挑战：**'),
    B.text('• **东北区持续低迷**： 同比下滑32%，是唯一负增长区域，需重点关注。'),
    B.text('• **老客复购率下滑**： 从42%降至39%，会员运营需要加强。'),
    B.text('• **入门产品线利润薄弱**： 销量占比35%，利润贡献仅8%。'),
    
    B.divider(),
    
    B.section('季度业绩走势'),
    B.lineChart({
      data: [
        { quarter: 'Q1', sales: 823, profit: 165 },
        { quarter: 'Q2', sales: 945, profit: 198 },
        { quarter: 'Q3', sales: 1028, profit: 237 },
        { quarter: 'Q4', sales: 1060, profit: 252 },
      ],
      xKey: 'quarter',
      yKeys: [
        { key: 'sales', name: '销售额(万)', color: '#3b82f6' },
        { key: 'profit', name: '利润(万)', color: '#10b981' },
      ],
      title: '季度业绩趋势',
    }),
    
    B.divider(),
    
    B.section('总结与展望'),
    
    B.text('综合来看，2024年是充满挑战与机遇的"新常态"时期。整体增长强劲（+19.8%），核心区域表现优异，但区域不均衡和老客流失风险需要重点关注。'),
    
    B.text('对于2025年，建议在"质"上下功夫：提升老客价值、优化产品结构、改善区域均衡性。东北专项、会员体系升级、入门产品线调整是三大优先级任务。'),
    
    B.analystQuote(
      '在充满不确定性的时代，洞察结构性变化比预测短期波动更为重要。',
      '数据分析师',
      '年度复盘报告',
      '🌐'
    ),
    
    B.actions([
      { id: '1', label: '东北区分析', query: '分析东北区下降原因', icon: 'search' },
      { id: '2', label: '地区详情', query: '各地区销售额对比', icon: 'map' },
      { id: '3', label: '产品结构', query: '各品类利润率分析', icon: 'pie' },
    ]),
  ],
};

// ============================================
// 边界条件测试
// ============================================
export const EDGE_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // E-01: 2030年销售额趋势 - 无数据处理
  'E-01': () => [
    B.heading('📅 数据范围提示'),
    B.text('抱歉，暂无 **2030年** 的销售数据。'),
    B.kpiGroup([
      { id: 'earliest', label: '最早数据', value: '2022年1月' },
      { id: 'latest', label: '最新数据', value: '2024年12月' },
      { id: 'predict', label: '可预测至', value: '2025年Q2' },
    ]),
    B.text('您可以查询历史数据或使用预测功能：'),
    B.actions([
      { id: '1', label: '查看2024年数据', query: '今年销售额是多少', icon: 'bar' },
      { id: '2', label: '预测下月销售', query: '预测下月销售额', icon: 'trend' },
      { id: '3', label: '查看历史趋势', query: '近3年销售额趋势', icon: 'trend' },
    ]),
  ],

  // E-02: 火星地区销售分布 - 无匹配维度
  'E-02': () => [
    B.heading('🌍 地区查询提示'),
    B.text('抱歉，未找到"**火星**"地区的销售数据。'),
    B.text('当前支持的地区维度：\n• **国内大区**：华东、华南、华北、华中、西南、东北、西北\n• **省份**：31个省市自治区\n• **城市**：主要300+城市'),
    B.actions([
      { id: '1', label: '各地区销售', query: '各地区销售额对比', icon: 'map' },
      { id: '2', label: '省份分布', query: '各省份销售分布', icon: 'map' },
      { id: '3', label: 'TOP城市', query: 'TOP10销售城市', icon: 'bar' },
    ]),
  ],

  // E-03: 销售 - 模糊意图引导
  'E-03': () => [
    B.heading(' 销售数据查询'),
    B.text('您想了解"**销售**"的哪方面信息？'),
    B.section(' 销售数据'),
    B.actions([
      { id: '1', label: '今年销售额', query: '今年销售额是多少', icon: 'bar' },
      { id: '2', label: '本月销售额', query: '本月销售额是多少', icon: 'bar' },
      { id: '3', label: '销售订单量', query: '本月订单量有多少', icon: 'bar' },
    ]),
    B.section(' 趋势分析'),
    B.actions([
      { id: '4', label: '销售趋势', query: '近3个月销售额趋势', icon: 'trend' },
      { id: '5', label: '同比对比', query: '对比去年和今年营收', icon: 'trend' },
    ]),
    B.section('🗺️ 分布分析'),
    B.actions([
      { id: '6', label: '地区分布', query: '各地区销售额对比', icon: 'map' },
      { id: '7', label: '渠道占比', query: '销售渠道占比分析', icon: 'pie' },
    ]),
  ],

  // E-04: 看看数据 - 泛泛询问
  'E-04': () => [
    B.heading(' 数据概览'),
    B.text('好的，为您展示核心业务数据：'),
    B.kpiGroup([
      { id: 'sales', label: '本月销售额', value: 3500000, prefix: '¥', trend: { value: 12.3, direction: 'up' } },
      { id: 'orders', label: '本月订单', value: 11823, unit: '单', trend: { value: 8.5, direction: 'up' } },
      { id: 'users', label: '活跃用户', value: 45280, trend: { value: 5.6, direction: 'up' } },
    ]),
    B.text('您想深入了解哪方面？'),
    B.actions([
      { id: '1', label: '销售分析', query: '全面分析今年销售情况', icon: 'bar' },
      { id: '2', label: '趋势分析', query: '近3个月销售额趋势', icon: 'trend' },
      { id: '3', label: '地区分析', query: '各地区销售额对比', icon: 'map' },
      { id: '4', label: '用户分析', query: '日活还有月活数据', icon: 'pie' },
    ]),
  ],

  // E-05: 帮我分析一下 - 提供常见分析选项
  'E-05': () => [
    B.heading(' 智能分析助手'),
    B.text('请告诉我您想分析什么？以下是常见的分析场景：'),
    B.section('🔥 热门分析'),
    B.actions([
      { id: '1', label: '业务总览', query: '今年业务怎么样', icon: 'bar' },
      { id: '2', label: '销售趋势', query: '近3个月销售额趋势', icon: 'trend' },
      { id: '3', label: '异常检测', query: '昨天订单量是不是有问题', icon: 'alert' },
    ]),
    B.section(' 维度分析'),
    B.actions([
      { id: '4', label: '地区对比', query: '各地区销售额对比', icon: 'map' },
      { id: '5', label: '渠道分析', query: '销售渠道占比分析', icon: 'pie' },
      { id: '6', label: '产品分析', query: '各品类销售额构成', icon: 'bar' },
    ]),
    B.section(' 问题诊断'),
    B.actions([
      { id: '7', label: '下降原因', query: '为什么销售额下降', icon: 'search' },
      { id: '8', label: '转化分析', query: '分析转化率偏低的原因', icon: 'bar' },
      { id: '9', label: '利润分析', query: '利润下滑的影响因素', icon: 'pie' },
    ]),
  ],

  // E-06: 超长复杂问题 - 拆解为多步骤
  'E-06': () => [
    B.heading('📋 复杂分析任务执行'),
    B.quote('检测到复杂多维分析需求，已自动拆解为5个步骤为您呈现。', true),
    B.text(' **分析进度：[■■■■■] 5/5 已完成**'),
    
    B.divider(),
    B.section('步骤 1/5：整体概览 ✅'),
    B.kpi({
      id: 'total',
      label: 'Q1-Q3销售额',
      value: 30880000,
      prefix: '¥',
      trend: { value: 18.5, direction: 'up', label: '同比' },
    }),
    
    B.section('步骤 2/5：地区维度 ✅'),
    B.barChart({
      data: [
        { region: '华东', value: 1050, yoy: 22 },
        { region: '华南', value: 820, yoy: 18 },
        { region: '华北', value: 580, yoy: 15 },
        { region: '其他', value: 638, yoy: 12 },
      ],
      xKey: 'region',
      yKey: 'value',
      title: 'Q1-Q3各地区销售（万元）',
    }),
    
    B.section('步骤 3/5：产品线维度 ✅'),
    B.barChart({
      data: [
        { product: '电子产品', value: 1180, yoy: 25 },
        { product: '家居用品', value: 780, yoy: 18 },
        { product: '服装鞋帽', value: 560, yoy: 12 },
        { product: '其他', value: 568, yoy: 8 },
      ],
      xKey: 'product',
      yKey: 'value',
      title: '各产品线销售（万元）',
    }),
    
    B.section('步骤 4/5：同环比趋势 ✅'),
    B.lineChart({
      data: [
        { month: '1月', value: 280, yoy: 16 },
        { month: '2月', value: 260, yoy: 18 },
        { month: '3月', value: 283, yoy: 13 },
        { month: '4月', value: 310, yoy: 17 },
        { month: '5月', value: 320, yoy: 14 },
        { month: '6月', value: 315, yoy: 17 },
        { month: '7月', value: 340, yoy: 17 },
        { month: '8月', value: 350, yoy: 17 },
        { month: '9月', value: 338, yoy: 19 },
      ],
      xKey: 'month',
      yKeys: [{ key: 'value', name: '销售额(万)', color: '#3b82f6' }],
      title: 'Q1-Q3月度走势',
    }),
    
    B.section('步骤 5/5：异常检测 ✅'),
    B.text(' **发现3个需关注的异常点**：\n\n1. **华北区8月**：环比下降15%，疑似区域竞品活动影响\n2. **服装品类6月**：同比下降8%，可能是季节性因素\n3. **西南区Q3**：增速放缓至5%，低于预期'),
    
    B.divider(),
    B.section('📋 综合结论'),
    B.text('**核心发现**：\n• 整体业绩健康，同比+18.5%\n• 华东电子产品组合表现最佳（+28%）\n• 华北家居需重点关注（增速垫底）\n• 西南区潜力待挖掘\n\n**建议行动**：\n1. 深入分析华北区8月异常\n2. 评估服装品类战略定位\n3. 制定西南区提升方案'),
    
    B.actions([
      { id: '1', label: '华北异常分析', query: '分析华北区8月下降原因', icon: 'search' },
      { id: '2', label: '导出报告', query: '导出Q1-Q3分析报告', icon: 'bar' },
    ]),
  ],
};
