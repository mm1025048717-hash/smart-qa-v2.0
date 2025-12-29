/**
 * L2层级测试用例数据 - 分析查询
 */

import { ContentBlock } from '../types';
import { B } from './testCaseData';

// ============================================
// L2 趋势分析
// ============================================
export const L2_TREND_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // L2-01: 近3个月销售额趋势
  'L2-01': () => [
    B.visualizer([
      { id: 'ds_201', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_201', type: 'groupby', label: '按', value: '日期 趋势' },
      { id: 'dt_201', type: 'date', label: '日期', value: '近3个月' },
      { id: 'ft_201', type: 'filter', label: '销售额', value: '不为空' },
    ]),
    B.heading(' 近三个月销售额趋势分析'),
    B.kpi({
      id: 'current',
      label: '本月销售额',
      value: 3500000,
      prefix: '¥',
      trend: { value: 2.8, direction: 'down', label: '环比' },
    }),
    B.text('近三个月销售额呈现"先升后稳"的态势：'),
    B.lineChart({
      data: [
        { date: '10月1日', value: 115 },
        { date: '10月15日', value: 125 },
        { date: '11月1日', value: 118 },
        { date: '11月15日', value: 132 },
        { date: '12月1日', value: 128 },
        { date: '12月15日', value: 125 },
      ],
      xKey: 'date',
      yKeys: [{ key: 'value', name: '销售额(万)', color: '#3b82f6' }],
      title: '近3个月销售额走势',
      summary: [
        { label: '3个月累计', value: '1050', unit: '万元', highlight: true },
        { label: '环比变化', value: '-2.8', unit: '%' },
      ],
    }),
    B.text('**关键节点分析**：\n• 10月：达到近期高点360万，主要受国庆促销拉动\n• 11月：环比下降2.8%，促销红利消退\n• 12月：基本持平，进入平稳期'),
    B.actions([
      { id: '1', label: '分析波动原因', query: '为什么11月销售额下降了', icon: 'search' },
      { id: '2', label: '预测下月趋势', query: '预测下月销售额', icon: 'trend' },
    ]),
  ],

  // L2-02: 今年销售额变化情况
  'L2-02': () => [
    B.visualizer([
      { id: 'ds_202', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_202', type: 'groupby', label: '按', value: '月份 汇总' },
      { id: 'dt_202', type: 'date', label: '日期', value: '2024年' },
      { id: 'ft_202', type: 'filter', label: '目标值', value: '对比' },
    ]),
    B.heading(' 2024全年销售额变化分析'),
    B.kpi({
      id: 'total',
      label: '年累计销售额',
      value: 38560000,
      prefix: '¥',
      trend: { value: 19.8, direction: 'up', label: '同比' },
    }),
    B.lineChart({
      data: [
        { month: '1月', value: 280, target: 270 },
        { month: '2月', value: 260, target: 265 },
        { month: '3月', value: 283, target: 280 },
        { month: '4月', value: 310, target: 295 },
        { month: '5月', value: 320, target: 305 },
        { month: '6月', value: 315, target: 310 },
        { month: '7月', value: 340, target: 320 },
        { month: '8月', value: 350, target: 330 },
        { month: '9月', value: 338, target: 335 },
        { month: '10月', value: 360, target: 345 },
        { month: '11月', value: 350, target: 350 },
        { month: '12月', value: 354, target: 355 },
      ],
      xKey: 'month',
      yKeys: [
        { key: 'value', name: '实际销售额', color: '#3b82f6' },
        { key: 'target', name: '目标值', color: '#94a3b8', dashArray: '5,5' },
      ],
      title: '月度销售额与目标对比（万元）',
      summary: [
        { label: '年度累计', value: '3,860', unit: '万元', highlight: true },
        { label: '目标完成率', value: '103.2', unit: '%' },
        { label: '月均销售额', value: '321.7', unit: '万元' },
      ],
    }),
    B.text('全年销售额呈现稳步上升趋势，**上半年增速较快**，下半年进入稳定期。10月达到全年峰值360万，与国庆大促相关。'),
    B.insight('年度总结', 'Q4整体表现最强，贡献全年28%销售额，超额完成年度目标3.2%。'),
    B.actions([
      { id: '1', label: '季度分析', query: 'Q3销售额同比增长情况', icon: 'bar' },
      { id: '2', label: '地区拆解', query: '各地区销售额对比', icon: 'map' },
    ]),
  ],

  // L2-03: 最近一周订单量波动
  'L2-03': () => [
    B.visualizer([
      { id: 'ds_203', type: 'datasource', label: '数据源', value: '订单表', removable: false },
      { id: 'gb_203', type: 'groupby', label: '按', value: '星期 分布' },
      { id: 'dt_203', type: 'date', label: '日期', value: '本周' },
      { id: 'ft_203', type: 'filter', label: '历史均值', value: '对比' },
    ]),
    B.heading('本周订单量波动分析'),
    B.kpi({
      id: 'weekly',
      label: '本周总订单',
      value: 8650,
      unit: '单',
      trend: { value: 5.2, direction: 'up', label: '环比上周' },
    }),
    B.lineChart({
      data: [
        { day: '周一', value: 1050, avg: 1100 },
        { day: '周二', value: 1120, avg: 1100 },
        { day: '周三', value: 1080, avg: 1100 },
        { day: '周四', value: 1150, avg: 1100 },
        { day: '周五', value: 1380, avg: 1200 },
        { day: '周六', value: 1520, avg: 1400 },
        { day: '周日', value: 1350, avg: 1300 },
      ],
      xKey: 'day',
      yKeys: [
        { key: 'value', name: '实际订单', color: '#3b82f6' },
        { key: 'avg', name: '历史均值', color: '#94a3b8', dashArray: '5,5' },
      ],
      title: '日订单量分布',
      summary: [
        { label: '周总订单', value: '8,650', unit: '单', highlight: true },
        { label: '日均订单', value: '1,236', unit: '单' },
        { label: '峰值(周六)', value: '1,520', unit: '单' },
      ],
    }),
    B.text('订单量呈现明显的**周末效应**：\n• 工作日日均：1096单\n• 周末日均：1435单（高出31%）\n• 周六达到峰值1520单'),
    B.insight('异常监测', '本周三订单量略低于历史均值，需关注是否存在特殊因素。', 'warning'),
    B.actions([
      { id: '1', label: '分析周三异常', query: '分析周三订单下降原因', icon: 'search' },
      { id: '2', label: '查看转化率', query: '各渠道转化率对比', icon: 'bar' },
    ]),
  ],

  // L2-04: 本月销售额比上月如何 - 环比分析
  'L2-04': () => [
    B.visualizer([
      { id: 'ds_204', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_204', type: 'groupby', label: '按', value: '月份 环比' },
      { id: 'dt_204', type: 'date', label: '日期', value: '近2个月' },
      { id: 'ft_204', type: 'filter', label: '对比类型', value: '环比' },
    ]),
    B.heading('📉 本月销售额环比分析'),
    B.kpiGroup([
      { id: 'this', label: '本月销售额', value: 3500000, prefix: '¥' },
      { id: 'last', label: '上月销售额', value: 3600000, prefix: '¥' },
      { id: 'diff', label: '环比变化', value: '-2.78%', trend: { value: 2.78, direction: 'down' } },
    ]),
    B.lineChart({
      data: [
        { period: '上月第1周', this: 0, last: 850 },
        { period: '上月第2周', this: 0, last: 920 },
        { period: '上月第3周', this: 0, last: 950 },
        { period: '上月第4周', this: 0, last: 880 },
        { period: '本月第1周', this: 830, last: 0 },
        { period: '本月第2周', this: 870, last: 0 },
        { period: '本月第3周', this: 900, last: 0 },
        { period: '本月第4周', this: 900, last: 0 },
      ],
      xKey: 'period',
      yKeys: [
        { key: 'this', name: '本月', color: '#3b82f6' },
        { key: 'last', name: '上月', color: '#94a3b8' },
      ],
      title: '周销售额对比（万元）',
      summary: [
        { label: '本月合计', value: '350', unit: '万元', highlight: true },
        { label: '上月合计', value: '360', unit: '万元' },
        { label: '环比变化', value: '-2.78', unit: '%' },
      ],
    }),
    B.text('本月销售额 **350万**，较上月下降 **2.78%**（约10万）。\n\n**环比下降主要原因**：\n1. 上月有国庆大促加持\n2. 本月无重大营销活动\n3. 属于季节性正常波动'),
    B.insight('预期判断', '本次下降属于促销后的正常回落，幅度在可接受范围内。'),
    B.actions([
      { id: '1', label: '查看同比', query: '对比去年和今年营收', icon: 'trend' },
      { id: '2', label: '分析原因', query: '为什么销售额下降', icon: 'search' },
    ]),
  ],

  // L2-05: 对比去年和今年营收 - 年度对比
  'L2-05': () => [
    B.visualizer([
      { id: 'ds_205', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_205', type: 'groupby', label: '按', value: '年份 同比' },
      { id: 'dt_205', type: 'date', label: '日期', value: '2023-2024年' },
      { id: 'ft_205', type: 'filter', label: '对比类型', value: '同比' },
    ]),
    B.heading(' 年度营收对比分析'),
    B.kpiGroup([
      { id: '2024', label: '2024年营收', value: 38560000, prefix: '¥', trend: { value: 19.8, direction: 'up' } },
      { id: '2023', label: '2023年营收', value: 32180000, prefix: '¥' },
      { id: 'growth', label: '同比增长', value: '+638万' },
    ]),
    B.lineChart({
      type: 'year-comparison',
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
        { month: '12月', '2024': 354, '2023': 270 },
      ],
      xKey: 'month',
      currentYear: '2024',
      lastYear: '2023',
      title: '年度月营收对比（万元）',
      summary: [
        { label: '2024年总计', value: '3,856', unit: '万元', highlight: true },
        { label: '2023年总计', value: '3,218', unit: '万元' },
        { label: '同比增长', value: '+19.8', unit: '%', highlight: true },
      ],
    }),
    B.text('2024年全年营收 **3856万**，较2023年增长 **19.8%**（+638万）。\n\n**增长驱动因素**：\n• Q1增速15%：春节促销效果好\n• Q2增速21%：新品上市拉动\n• Q3增速18%：暑期营销活动\n• Q4增速24%：双11+双12大促'),
    B.insight('亮点', '下半年增速显著加快，Q4同比增长达24%，创历史新高！', 'success'),
    B.actions([
      { id: '1', label: '分析增长来源', query: '分析销售额增长原因', icon: 'pie' },
      { id: '2', label: '查看Q4详情', query: 'Q4销售额详细分析', icon: 'bar' },
    ]),
  ],

  // L2-06: Q3销售额同比增长情况 - 季度增长
  'L2-06': () => [
    B.visualizer([
      { id: 'ds_206', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_206', type: 'groupby', label: '按', value: '季度 同比' },
      { id: 'dt_206', type: 'date', label: '日期', value: 'Q3 2023-2024' },
      { id: 'ft_206', type: 'filter', label: '季度', value: 'Q3' },
    ]),
    B.heading(' Q3销售额同比分析'),
    B.kpiGroup([
      { id: 'q3_2024', label: '2024年Q3', value: 10280000, prefix: '¥' },
      { id: 'q3_2023', label: '2023年Q3', value: 8750000, prefix: '¥' },
      { id: 'growth', label: '同比增长率', value: '+17.5%', trend: { value: 17.5, direction: 'up' } },
    ]),
    B.barChart({
      data: [
        { quarter: 'Q3-2023', value: 875 },
        { quarter: 'Q3-2024', value: 1028 },
      ],
      xKey: 'quarter',
      yKey: 'value',
      title: 'Q3同比对比（万元）',
      summary: [
        { label: 'Q3总增长', value: '+153', unit: '万元', highlight: true },
        { label: '同比增幅', value: '+17.5', unit: '%' },
      ],
    }),
    B.text('2024年Q3销售额 **1028万**，同比增长 **17.5%**。\n\n**月度拆解**：\n• 7月：340万（同比+17.2%）\n• 8月：350万（同比+16.7%）\n• 9月：338万（同比+18.6%）'),
    B.pieChart({
      data: [
        { name: '新客贡献', value: 42 },
        { name: '老客复购', value: 38 },
        { name: '客单提升', value: 20 },
      ],
      title: 'Q3增长归因',
      summary: [
        { label: '增长总额', value: '153', unit: '万元', highlight: true },
        { label: '最大贡献', value: '新客', unit: '42%' },
      ],
    }),
    B.actions([
      { id: '1', label: '对比其他季度', query: '各季度销售对比', icon: 'bar' },
      { id: '2', label: '分析增长来源', query: '分析Q3增长驱动因素', icon: 'pie' },
    ]),
  ],
};

// ============================================
// L2 构成分析
// ============================================
export const L2_COMPOSITION_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // L2-07: 销售渠道占比分析
  'L2-07': () => [
    B.visualizer([
      { id: 'ds_207', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_207', type: 'groupby', label: '按', value: '渠道 分组' },
      { id: 'dt_207', type: 'date', label: '日期', value: '2024年' },
      { id: 'ft_207', type: 'filter', label: '渠道', value: '不为空' },
    ]),
    B.heading(' 销售渠道构成分析'),
    B.kpi({
      id: 'total',
      label: '总销售额',
      value: 38560000,
      prefix: '¥',
    }),
    B.pieChart({
      data: [
        { name: '线上直营', value: 41, amount: 1581 },
        { name: '线下门店', value: 32, amount: 1234 },
        { name: '分销渠道', value: 18, amount: 694 },
        { name: '企业客户', value: 9, amount: 347 },
      ],
      title: '销售渠道占比',
      summary: [
        { label: '渠道总数', value: '4', unit: '个' },
        { label: '总销售额', value: '3856', unit: '万元', highlight: true },
      ],
    }),
    B.text('**渠道分析**：\n\n• **线上直营** 占比最高达 **41%**（1581万），是核心销售渠道\n• **线下门店** 占比 **32%**（1234万），表现稳定\n• **分销渠道** 占比 **18%**（694万），有提升空间\n• **企业客户** 占比 **9%**（347万），高毛利细分市场'),
    B.insight('建议', '线上渠道增速最快（同比+35%），建议持续加大投入；分销渠道有优化空间。'),
    B.actions([
      { id: '1', label: '渠道趋势', query: '各渠道销售额月度趋势', icon: 'trend' },
      { id: '2', label: '渠道效率', query: '各渠道转化率对比', icon: 'bar' },
    ]),
  ],

  // L2-08: 各品类销售额构成
  'L2-08': () => [
    B.visualizer([
      { id: 'ds_208', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_208', type: 'groupby', label: '按', value: '品类 分组' },
      { id: 'dt_208', type: 'date', label: '日期', value: '2024年' },
      { id: 'ft_208', type: 'filter', label: '品类', value: '不为空' },
    ]),
    B.heading('🏷️ 产品品类构成分析'),
    B.pieChart({
      data: [
        { name: '电子产品', value: 38, amount: 1465 },
        { name: '家居用品', value: 25, amount: 964 },
        { name: '服装鞋帽', value: 18, amount: 694 },
        { name: '美妆护肤', value: 12, amount: 463 },
        { name: '其他', value: 7, amount: 270 },
      ],
      title: '品类销售占比',
      summary: [
        { label: '品类总数', value: '5', unit: '个' },
        { label: '总销售额', value: '3,856', unit: '万元', highlight: true },
        { label: '最大品类', value: '电子产品', unit: '38%' },
      ],
    }),
    B.barChart({
      data: [
        { category: '电子产品', value: 1465, growth: 25 },
        { category: '家居用品', value: 964, growth: 18 },
        { category: '服装鞋帽', value: 694, growth: 12 },
        { category: '美妆护肤', value: 463, growth: 35 },
        { category: '其他', value: 270, growth: 8 },
      ],
      xKey: 'category',
      yKey: 'value',
      title: '品类销售额（万元）',
      summary: [
        { label: '合计销售额', value: '3,856', unit: '万元', highlight: true },
        { label: '平均增速', value: '19.6', unit: '%' },
        { label: '最高增速品类', value: '美妆护肤', unit: '+35%' },
      ],
    }),
    B.text('**品类洞察**：\n\n• **电子产品** 是销售主力（38%），但增速放缓\n• **美妆护肤** 虽占比小但增速最快（+35%），值得重点培育\n• **其他品类** 已合并展示（占比<5%的合并）'),
    B.actions([
      { id: '1', label: '品类趋势', query: '各品类月度销售趋势', icon: 'trend' },
      { id: '2', label: '爆品分析', query: 'TOP10热销产品', icon: 'bar' },
    ]),
  ],

  // L2-09: 用户年龄分布比例
  'L2-09': () => [
    B.visualizer([
      { id: 'ds_209', type: 'datasource', label: '数据源', value: '用户表', removable: false },
      { id: 'gb_209', type: 'groupby', label: '按', value: '年龄段 分组' },
      { id: 'dt_209', type: 'date', label: '日期', value: '2024年' },
      { id: 'ft_209', type: 'filter', label: '用户状态', value: '活跃' },
    ]),
    B.heading('用户年龄分布分析'),
    B.pieChart({
      data: [
        { name: '18-24岁', value: 22 },
        { name: '25-34岁', value: 38 },
        { name: '35-44岁', value: 25 },
        { name: '45-54岁', value: 11 },
        { name: '55岁以上', value: 4 },
      ],
      title: '用户年龄分布',
      summary: [
        { label: '活跃用户总数', value: '85.6', unit: '万人', highlight: true },
        { label: '主力年龄段', value: '25-34岁', unit: '38%' },
      ],
    }),
    B.text('**用户画像洞察**：\n\n• **核心用户群**：25-34岁占比 **38%**，是消费主力\n• **潜力用户群**：18-24岁占比 **22%**，增速最快\n• **高价值用户**：35-44岁占比 **25%**，客单价最高'),
    B.barChart({
      data: [
        { age: '18-24岁', avgOrder: 185, frequency: 3.2 },
        { age: '25-34岁', avgOrder: 268, frequency: 4.5 },
        { age: '35-44岁', avgOrder: 356, frequency: 3.8 },
        { age: '45-54岁', avgOrder: 412, frequency: 2.9 },
        { age: '55岁以上', avgOrder: 298, frequency: 2.1 },
      ],
      xKey: 'age',
      yKey: 'avgOrder',
      title: '各年龄段客单价（元）',
      summary: [
        { label: '平均客单价', value: '304', unit: '元', highlight: true },
        { label: '最高客单价', value: '45-54岁', unit: '¥412' },
        { label: '平均复购频次', value: '3.3', unit: '次/年' },
      ],
    }),
    B.insight('策略建议', '45-54岁用户客单价最高但占比低，可针对性营销提升份额。'),
    B.actions([
      { id: '1', label: '用户消费分析', query: '高价值用户特征分析', icon: 'search' },
      { id: '2', label: '用户增长趋势', query: '各年龄段用户增长趋势', icon: 'trend' },
    ]),
  ],
};

// ============================================
// L2 维度对比
// ============================================
export const L2_COMPARE_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // L2-10: 各地区销售额对比
  'L2-10': () => [
    B.visualizer([
      { id: 'ds_210', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_210', type: 'groupby', label: '按', value: '地区 分组' },
      { id: 'dt_210', type: 'date', label: '日期', value: '2024年' },
      { id: 'ft_210', type: 'filter', label: '地区', value: '不为空' },
    ]),
    B.heading('🗺️ 各地区销售额对比'),
    B.barChart({
      data: [
        { region: '华东', value: 1250, growth: 22 },
        { region: '华南', value: 980, growth: 18 },
        { region: '华北', value: 720, growth: 15 },
        { region: '华中', value: 510, growth: 20 },
        { region: '西南', value: 250, growth: 28 },
        { region: '东北', value: 146, growth: 8 },
      ],
      xKey: 'region',
      yKey: 'value',
      title: '地区销售额排名（万元）',
      summary: [
        { label: '地区总数', value: '6', unit: '个' },
        { label: '全国总计', value: '3856', unit: '万元', highlight: true },
        { label: '平均增速', value: '+18.5', unit: '%' },
      ],
    }),
    B.text('**地区分析**：\n\n• **华东** 以1250万领跑，占总销售额 **32.4%**\n• **华南+华北** 合计贡献 **44.1%**\n• **西南** 增速最快（+28%），潜力巨大\n• **东北** 增速较慢（+8%），需重点关注'),
    B.pieChart({
      data: [
        { name: '华东', value: 32.4 },
        { name: '华南', value: 25.4 },
        { name: '华北', value: 18.7 },
        { name: '华中', value: 13.2 },
        { name: '西南', value: 6.5 },
        { name: '东北', value: 3.8 },
      ],
      title: '地区占比分布',
      summary: [
        { label: '最大地区', value: '华东', unit: '32.4%', highlight: true },
        { label: '增速最快', value: '西南', unit: '+28%' },
      ],
    }),
    B.actions([
      { id: '1', label: '华东详情', query: '详细看看华东区数据', icon: 'search' },
      { id: '2', label: '分析差异', query: '分析各地区销售差异原因', icon: 'bar' },
    ]),
  ],

  // L2-11: 分产品线看销量
  'L2-11': () => [
    B.visualizer([
      { id: 'ds_211', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_211', type: 'groupby', label: '按', value: '产品线 分组' },
      { id: 'dt_211', type: 'date', label: '日期', value: '2024年' },
      { id: 'ft_211', type: 'filter', label: '指标', value: '销量' },
    ]),
    B.heading('产品线销量分析'),
    B.barChart({
      data: [
        { product: '旗舰系列', value: 18500, units: 3200 },
        { product: '标准系列', value: 15200, units: 8500 },
        { product: '入门系列', value: 8600, units: 12000 },
        { product: '配件', value: 4200, units: 25000 },
        { product: '服务包', value: 2060, units: 4100 },
      ],
      xKey: 'product',
      yKey: 'units',
      title: '各产品线销量（件）',
      summary: [
        { label: '总销量', value: '52,800', unit: '件', highlight: true },
        { label: '总销售额', value: '4,856', unit: '万元' },
        { label: '平均客单价', value: '920', unit: '元' },
      ],
    }),
    B.text('**产品线洞察**：\n\n• **配件** 销量最高（25000件），但客单价低\n• **入门系列** 销量12000件，是用户入口产品\n• **旗舰系列** 销量3200件但贡献最高销售额'),
    B.kpiGroup([
      { id: 'flagship', label: '旗舰系列客单价', value: 5781, prefix: '¥' },
      { id: 'standard', label: '标准系列客单价', value: 1788, prefix: '¥' },
      { id: 'entry', label: '入门系列客单价', value: 717, prefix: '¥' },
    ]),
    B.actions([
      { id: '1', label: '产品趋势', query: '各产品线月度销量趋势', icon: 'trend' },
      { id: '2', label: '利润分析', query: '各产品线利润贡献', icon: 'pie' },
    ]),
  ],

  // L2-12: 各渠道转化率哪个最好
  'L2-12': () => [
    B.heading('渠道转化率对比'),
    B.barChart({
      data: [
        { channel: '官网', rate: 4.2, benchmark: 3.5 },
        { channel: 'APP', rate: 5.8, benchmark: 4.0 },
        { channel: '小程序', rate: 6.5, benchmark: 4.5 },
        { channel: '天猫', rate: 3.8, benchmark: 3.2 },
        { channel: '京东', rate: 3.5, benchmark: 3.0 },
      ],
      xKey: 'channel',
      yKey: 'rate',
      title: '渠道转化率对比（%）',
      summary: [
        { label: '平均转化率', value: '4.76', unit: '%', highlight: true },
        { label: '最高转化', value: '小程序', unit: '6.5%' },
        { label: '超基准渠道', value: '5', unit: '个' },
      ],
    }),
    B.text('**转化率分析**：\n\n🏆 **小程序** 转化率最高达 **6.5%**，超行业基准44%\n\n• **APP** 次之（5.8%），用户粘性强\n• **官网** 表现中规中矩（4.2%）\n• **平台渠道** 转化率较低，但流量大'),
    B.insight('优化建议', '小程序和APP转化率高但流量有限，建议加大社交裂变投入。', 'success'),
    B.actions([
      { id: '1', label: '转化漏斗', query: '各渠道转化漏斗分析', icon: 'bar' },
      { id: '2', label: '流量分析', query: '各渠道流量来源', icon: 'pie' },
    ]),
  ],
};


