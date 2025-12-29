/**
 * 筛选条件生成器
 * 根据不同的查询场景生成对应的数据筛选条件
 */

import { FilterCondition } from '../components/DataVisualizer';

// 生成唯一ID
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

// ============================================
// 基础筛选条件构建器
// ============================================
export const FC = {
  // 数据源
  datasource: (value: string): FilterCondition => ({
    id: generateId('ds'),
    type: 'datasource',
    label: '数据源',
    value,
    removable: false,
  }),

  // 分组方式
  groupby: (field: string, method: string = '分组'): FilterCondition => ({
    id: generateId('gb'),
    type: 'groupby',
    label: '按',
    value: `${field} ${method}`,
  }),

  // 过滤条件
  filter: (field: string, condition: string): FilterCondition => ({
    id: generateId('ft'),
    type: 'filter',
    label: field,
    value: condition,
  }),

  // 日期范围
  date: (value: string): FilterCondition => ({
    id: generateId('dt'),
    type: 'date',
    label: '日期',
    value,
  }),

  // 指标大于等于
  metricGte: (metric: string, value: string): FilterCondition => ({
    id: generateId('mgte'),
    type: 'metric_gte',
    label: metric,
    value: `>=${value}`,
    operator: '>=',
  }),

  // 指标小于等于
  metricLte: (metric: string, value: string): FilterCondition => ({
    id: generateId('mlte'),
    type: 'metric_lte',
    label: metric,
    value: `<=${value}`,
    operator: '<=',
  }),

  // 同比条件
  metricYoy: (metric: string, value: string): FilterCondition => ({
    id: generateId('myoy'),
    type: 'metric_yoy',
    label: metric,
    value,
    operator: value.startsWith('>=') ? '>=' : '<=',
  }),
};

// ============================================
// 预设场景筛选条件
// ============================================
export const FilterPresets = {
  // 销售额查询
  sales: (options?: { year?: string; region?: string; channel?: string }) => [
    FC.datasource('销售流水'),
    FC.groupby('产品', '分组'),
    FC.filter('产品', '不为空'),
    FC.date(options?.year || '2024年'),
    ...(options?.region ? [FC.filter('地区', options.region)] : []),
    ...(options?.channel ? [FC.filter('渠道', options.channel)] : []),
  ],

  // 销售额同比分析
  salesYoy: (year?: string) => [
    FC.datasource('销售流水'),
    FC.groupby('产品', '分组'),
    FC.filter('产品', '不为空'),
    FC.date(year || '2024年'),
    FC.metricGte('同期销售额今年', '500000'),
    FC.metricYoy('同期销售额同比今年', '<=-0.2'),
  ],

  // 订单量查询
  orders: (period?: string) => [
    FC.datasource('订单表'),
    FC.groupby('时间', '按日'),
    FC.date(period || '本月'),
    FC.filter('订单状态', '已完成'),
  ],

  // 趋势分析
  trend: (metric: string, period: string) => [
    FC.datasource('销售流水'),
    FC.groupby('时间', '按日'),
    FC.date(period),
    FC.filter(metric, '不为空'),
  ],

  // 地区分析
  region: (regions?: string[]) => [
    FC.datasource('销售流水'),
    FC.groupby('地区', '分组'),
    FC.date('2024年'),
    ...(regions?.map(r => FC.filter('地区', r)) || []),
  ],

  // 渠道分析
  channel: () => [
    FC.datasource('销售流水'),
    FC.groupby('渠道', '分组'),
    FC.date('2024年'),
    FC.filter('渠道', '不为空'),
  ],

  // 品类分析
  category: () => [
    FC.datasource('销售流水'),
    FC.groupby('品类', '分组'),
    FC.date('2024年'),
    FC.filter('品类', '不为空'),
  ],

  // 库存查询
  inventory: () => [
    FC.datasource('库存表'),
    FC.groupby('SKU', '分组'),
    FC.date('当前'),
    FC.metricLte('库存数量', '安全线'),
  ],

  // 用户分析
  users: (dimension?: string) => [
    FC.datasource('用户表'),
    FC.groupby(dimension || '年龄段', '分组'),
    FC.date('2024年'),
    FC.filter('用户状态', '活跃'),
  ],

  // 异常检测
  anomaly: (metric: string) => [
    FC.datasource('销售流水'),
    FC.groupby('时间', '按日'),
    FC.date('最近7天'),
    FC.filter(metric, '异常'),
  ],

  // 预测分析
  prediction: (metric: string, period: string) => [
    FC.datasource('销售流水'),
    FC.groupby('时间', '按日'),
    FC.date(period),
    FC.filter('预测模型', 'ARIMA'),
  ],

  // 排名分析
  ranking: (dimension: string, metric: string, topN: number) => [
    FC.datasource('销售流水'),
    FC.groupby(dimension, '排序'),
    FC.date('2024年'),
    FC.metricGte(metric, `TOP${topN}`),
  ],

  // 环比分析
  mom: (metric: string) => [
    FC.datasource('销售流水'),
    FC.groupby('月份', '对比'),
    FC.date('近2个月'),
    FC.filter(metric, '不为空'),
  ],

  // 同比分析  
  yoy: (metric: string) => [
    FC.datasource('销售流水'),
    FC.groupby('年份', '对比'),
    FC.date('2023-2024年'),
    FC.filter(metric, '不为空'),
  ],

  // 转化漏斗
  funnel: (channel?: string) => [
    FC.datasource('用户行为表'),
    FC.groupby('转化阶段', '漏斗'),
    FC.date('本月'),
    ...(channel ? [FC.filter('渠道', channel)] : []),
  ],

  // 利润分析
  profit: () => [
    FC.datasource('财务流水'),
    FC.groupby('产品线', '分组'),
    FC.date('2024年'),
    FC.filter('利润', '不为空'),
  ],

  // 门店分析
  store: (region?: string) => [
    FC.datasource('门店销售'),
    FC.groupby('门店', '排名'),
    FC.date('本月'),
    ...(region ? [FC.filter('区域', region)] : []),
  ],

  // 下钻分析
  drilldown: (dimension: string, value: string) => [
    FC.datasource('销售流水'),
    FC.groupby(dimension, '下钻'),
    FC.filter(dimension, value),
    FC.date('2024年'),
  ],
};

export default FilterPresets;

