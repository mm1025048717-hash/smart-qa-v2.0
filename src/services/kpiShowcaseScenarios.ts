/**
 * KPI卡片展示场景的问答效果响应
 * 每个KPI展示场景对应一个专门的问答响应，确保点击"查看问答效果"后显示正确的KPI卡片
 */

import { ContentBlock } from '../types';
import { B } from './testCaseData';

// ============================================
// KPI展示场景问答响应
// ============================================
export const KPI_SHOWCASE_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // showcase-basic: 基础KPI卡片 - 本月销售额是多少
  'showcase-basic': () => [
    B.visualizer([
      { id: 'ds_showcase_basic', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_basic', type: 'date', label: '日期', value: '本月' },
      { id: 'ft_showcase_basic', type: 'filter', label: '指标', value: '销售额' },
    ]),
    B.text('📊 本月销售额：'),
    B.kpi({
      id: 'sales_basic',
      label: '销售额',
      value: 12500000,
      prefix: '¥',
      unit: '元',
    }),
    B.text('本月销售额为 **1250万元**。'),
  ],

  // showcase-with-trend: 带趋势的KPI卡片 - 近3个月销售额如何
  'showcase-with-trend': () => [
    B.visualizer([
      { id: 'ds_showcase_trend', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_showcase_trend', type: 'groupby', label: '按', value: '月度 分组' },
      { id: 'dt_showcase_trend', type: 'date', label: '日期', value: '近3个月' },
      { id: 'ft_showcase_trend', type: 'filter', label: '指标', value: '销售额' },
    ]),
    B.text('📊 近3个月销售额：'),
    B.kpi({
      id: 'sales_trend',
      label: '近3个月销售额',
      value: 25000000,
      prefix: '¥',
      unit: '万元',
      trend: {
        value: 15.2,
        direction: 'up',
        label: '环比增长',
        mom: 15.2,
        yoy: 19.8,
      },
    }),
    B.text('近3个月销售额为 **2500万元**，环比增长 **15.2%**，同比增长 **19.8%**。'),
  ],

  // showcase-with-submetrics: 带子指标的KPI卡片 - 今年销售额是多少，各季度如何
  'showcase-with-submetrics': () => [
    B.visualizer([
      { id: 'ds_showcase_sub', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_showcase_sub', type: 'groupby', label: '按', value: '季度 分组' },
      { id: 'dt_showcase_sub', type: 'date', label: '日期', value: '2024年' },
      { id: 'ft_showcase_sub', type: 'filter', label: '指标', value: '销售额' },
    ]),
    B.text('📊 2024年销售额：'),
    B.kpi({
      id: 'sales_submetrics',
      label: '2024年销售额',
      value: 38560000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: 19.8,
        direction: 'up',
        label: '较2023年增长',
      },
      subMetrics: [
        { label: 'Q1', value: '850万' },
        { label: 'Q2', value: '920万' },
        { label: 'Q3', value: '980万' },
        { label: 'Q4', value: '1106万' },
      ],
    }),
    B.text('2024年销售额为 **3856万元**，较2023年增长 **19.8%**。各季度分布：Q1 **850万**，Q2 **920万**，Q3 **980万**，Q4 **1106万**。'),
  ],

  // showcase-single-day: 单日数据场景 - 查询2024年12月1日的销售额
  'showcase-single-day': () => [
    B.visualizer([
      { id: 'ds_showcase_single', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_single', type: 'date', label: '日期', value: '2024年12月1日' },
    ]),
    B.text('📊 2024年12月1日销售额：'),
    B.kpi({
      id: 'sales_single_day',
      label: '2024年12月1日销售额',
      value: 125000,
      prefix: '¥',
      unit: '元',
    }),
    B.text('**2024年12月1日**销售额为**12.5万元**。'),
  ],

  // showcase-short-range: 短期数据场景 - 查询最近3天的销售额
  'showcase-short-range': () => [
    B.visualizer([
      { id: 'ds_showcase_short', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_short', type: 'date', label: '日期', value: '最近3天' },
    ]),
    B.text('📊 最近3天销售额：'),
    B.kpi({
      id: 'sales_short_range',
      label: '最近3天销售额',
      value: 385000,
      prefix: '¥',
      unit: '元',
    }),
    B.text('**最近3天**销售额为**38.5万元**。'),
  ],

  // showcase-no-data: 无数据场景 - 查询2030年的销售额
  'showcase-no-data': () => [
    B.visualizer([
      { id: 'ds_showcase_no_data', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_no_data', type: 'date', label: '日期', value: '2030年' },
    ]),
    B.text('📊 2030年销售额：'),
    B.kpi({
      id: 'sales_no_data',
      label: '2030年销售额',
      value: 0,
      prefix: '¥',
      unit: '元',
    }),
    B.text('暂无数据。'),
  ],

  // showcase-connection-error: 连接失败场景
  'showcase-connection-error': () => [
    B.visualizer([
      { id: 'ds_showcase_error', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
    ]),
    B.text('❌ 数据源连接失败'),
    B.kpi({
      id: 'sales_error',
      label: '销售额',
      value: 0,
      prefix: '¥',
      unit: '元',
    }),
    B.text('无法连接到数据服务器，请检查网络设置或稍后重试。'),
  ],

  // showcase-permission-denied: 权限不足场景
  'showcase-permission-denied': () => [
    B.visualizer([
      { id: 'ds_showcase_permission', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
    ]),
    B.text('🔒 暂无数据访问权限'),
    B.kpi({
      id: 'sales_permission',
      label: '销售额',
      value: 0,
      prefix: '¥',
      unit: '元',
    }),
    B.text('您暂无权限查看此数据，请联系管理员申请权限。'),
  ],

  // showcase-with-attribution: 带归因的KPI卡片 - 12月份的销售额环比
  'showcase-with-attribution': () => [
    B.visualizer([
      { id: 'ds_showcase_attr', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_attr', type: 'date', label: '日期', value: '12月' },
    ]),
    B.text('📊 12月份销售额：'),
    B.kpi({
      id: 'sales_attribution',
      label: '12月销售额',
      value: 8800000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: 7.3,
        direction: 'up',
        label: '环比增长',
        mom: 7.3,
      },
    }),
    B.text('12月销售额为 **880万元**，环比增长 **7.3%**。'),
  ],

  // showcase-with-add-button: 带添加按钮的KPI卡片
  'showcase-with-add-button': () => [
    B.visualizer([
      { id: 'ds_showcase_add', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_add', type: 'date', label: '日期', value: '本月' },
    ]),
    B.text('📊 本月销售额：'),
    B.kpi({
      id: 'sales_addable',
      label: '本月销售额',
      value: 12500000,
      prefix: '¥',
      unit: '元',
    }),
    B.text('本月销售额为 **1250万元**。'),
  ],

  // showcase-warning-low: 预警场景 - 数值过低
  'showcase-warning-low': () => [
    B.visualizer([
      { id: 'ds_showcase_warning', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_warning', type: 'date', label: '日期', value: '本月' },
    ]),
    B.text('⚠️ 本月销售额（预警）：'),
    B.kpi({
      id: 'sales_warning',
      label: '本月销售额',
      value: 5000000,
      prefix: '¥',
      unit: '元',
      alertRule: {
        warningThreshold: 8000000,
        warningStyle: 'red',
      },
      trend: {
        value: -15.2,
        direction: 'down',
        label: '环比下降',
        mom: -15.2,
        yoy: -8.5,
      },
    }),
    B.text('本月销售额为 **500万元**，低于预警阈值，环比下降 **15.2%**，同比下降 **8.5%**。'),
  ],

  // showcase-excellent-high: 优秀表现场景 - 数值优秀
  'showcase-excellent-high': () => [
    B.visualizer([
      { id: 'ds_showcase_excellent', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_excellent', type: 'date', label: '日期', value: '本月' },
    ]),
    B.text('✨ 本月销售额（优秀表现）：'),
    B.kpi({
      id: 'sales_excellent',
      label: '本月销售额',
      value: 15000000,
      prefix: '¥',
      unit: '元',
      alertRule: {
        excellentThreshold: 12000000,
        excellentStyle: 'green',
      },
      trend: {
        value: 25.8,
        direction: 'up',
        label: '环比增长',
        mom: 25.8,
        yoy: 32.5,
      },
    }),
    B.text('本月销售额为 **1500万元**，超过优秀阈值，环比增长 **25.8%**，同比增长 **32.5%**。'),
  ],

  // showcase-with-yoy-mom: 环比同比展示场景
  'showcase-with-yoy-mom': () => [
    B.visualizer([
      { id: 'ds_showcase_yoy_mom', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_yoy_mom', type: 'date', label: '日期', value: '近3个月' },
    ]),
    B.text('📊 近3个月销售额：'),
    B.kpi({
      id: 'sales_yoy_mom',
      label: '近3个月销售额',
      value: 25000000,
      prefix: '¥',
      unit: '万元',
      trend: {
        value: 15.2,
        direction: 'up',
        label: '环比增长',
        mom: 15.2,
        yoy: 19.8,
      },
    }),
    B.text('近3个月销售额为 **2500万元**，环比增长 **15.2%**，同比增长 **19.8%**。'),
  ],

  // showcase-with-target: 带目标值的KPI卡片
  'showcase-with-target': () => [
    B.visualizer([
      { id: 'ds_showcase_target', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_target', type: 'date', label: '日期', value: '本月' },
    ]),
    B.text('📊 本月销售额目标：'),
    B.kpi({
      id: 'sales_target',
      label: '本月销售额目标',
      value: 12000000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: 85,
        direction: 'up',
        label: '完成度',
      },
      subMetrics: [
        { label: '目标', value: '1400万' },
        { label: '完成', value: '1200万' },
        { label: '进度', value: '85%' },
        { label: '剩余', value: '200万' },
      ],
    }),
    B.text('本月销售额目标为 **1400万元**，当前完成 **1200万元**，完成度 **85%**，剩余 **200万元**。'),
  ],

  // showcase-percentage-value: 百分比类型KPI卡片
  'showcase-percentage-value': () => [
    B.visualizer([
      { id: 'ds_showcase_percentage', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
    ]),
    B.text('📊 转化率：'),
    B.kpi({
      id: 'conversion_rate',
      label: '转化率',
      value: 3.2,
      unit: '%',
      trend: {
        value: 0.5,
        direction: 'up',
        mom: 0.5,
        yoy: 1.2,
      },
    }),
    B.text('转化率为 **3.2%**，环比增长 **0.5%**，同比增长 **1.2%**。'),
  ],

  // showcase-large-number: 大数值KPI卡片
  'showcase-large-number': () => [
    B.visualizer([
      { id: 'ds_showcase_large', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_large', type: 'date', label: '日期', value: '累计' },
    ]),
    B.text('📊 累计销售额：'),
    B.kpi({
      id: 'sales_large',
      label: '累计销售额',
      value: 3856000000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: 19.8,
        direction: 'up',
        mom: 2.5,
        yoy: 19.8,
      },
    }),
    B.text('累计销售额为 **38.56亿元**，环比增长 **2.5%**，同比增长 **19.8%**。'),
  ],

  // showcase-negative-trend: 下降趋势KPI卡片
  'showcase-negative-trend': () => [
    B.visualizer([
      { id: 'ds_showcase_negative', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_negative', type: 'date', label: '日期', value: '11月' },
    ]),
    B.text('📊 11月销售额：'),
    B.kpi({
      id: 'sales_negative',
      label: '11月销售额',
      value: 8200000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: -8.5,
        direction: 'down',
        mom: -8.5,
        yoy: -5.2,
      },
    }),
    B.text('11月销售额为 **820万元**，环比下降 **8.5%**，同比下降 **5.2%**。'),
  ],

  // showcase-flat-trend: 持平趋势KPI卡片
  'showcase-flat-trend': () => [
    B.visualizer([
      { id: 'ds_showcase_flat', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_flat', type: 'date', label: '日期', value: '本月' },
    ]),
    B.text('📊 本月销售额：'),
    B.kpi({
      id: 'sales_flat',
      label: '本月销售额',
      value: 10000000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: 0.2,
        direction: 'flat',
        mom: 0.2,
        yoy: 0.5,
      },
    }),
    B.text('本月销售额为 **1000万元**，环比基本持平（**0.2%**），同比基本持平（**0.5%**）。'),
  ],

  // showcase-ecommerce-gmv: 电商GMV场景
  'showcase-ecommerce-gmv': () => [
    B.visualizer([
      { id: 'ds_showcase_gmv', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt_showcase_gmv', type: 'date', label: '日期', value: '本月' },
    ]),
    B.text('📊 GMV成交总额：'),
    B.kpi({
      id: 'gmv',
      label: 'GMV成交总额',
      value: 125000000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: 28.5,
        direction: 'up',
        mom: 28.5,
        yoy: 35.2,
      },
      subMetrics: [
        { label: '订单数', value: '12.5万' },
        { label: '客单价', value: '¥100' },
        { label: '转化率', value: '3.2%' },
        { label: '复购率', value: '45%' },
      ],
    }),
    B.text('GMV成交总额为 **1.25亿元**，环比增长 **28.5%**，同比增长 **35.2%**。'),
  ],

  // showcase-finance-revenue: 财务营收场景
  'showcase-finance-revenue': () => [
    B.visualizer([
      { id: 'ds_showcase_finance', type: 'datasource', label: '数据源', value: '财务流水', removable: false },
      { id: 'dt_showcase_finance', type: 'date', label: '日期', value: '本月' },
    ]),
    B.text('📊 营业收入：'),
    B.kpi({
      id: 'revenue',
      label: '营业收入',
      value: 50000000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: 15.8,
        direction: 'up',
        mom: 15.8,
        yoy: 22.3,
      },
    }),
    B.text('营业收入为 **5000万元**，环比增长 **15.8%**，同比增长 **22.3%**。'),
  ],

  // showcase-marketing-roi: 营销ROI场景
  'showcase-marketing-roi': () => [
    B.visualizer([
      { id: 'ds_showcase_roi', type: 'datasource', label: '数据源', value: '营销数据', removable: false },
    ]),
    B.text('📊 营销ROI：'),
    B.kpi({
      id: 'roi',
      label: '营销ROI',
      value: 3.5,
      unit: '倍',
      trend: {
        value: 0.8,
        direction: 'up',
        mom: 0.8,
        yoy: 1.2,
      },
    }),
    B.text('营销ROI为 **3.5倍**，环比增长 **0.8倍**，同比增长 **1.2倍**。'),
  ],

  // showcase-hr-attendance: HR考勤场景
  'showcase-hr-attendance': () => [
    B.visualizer([
      { id: 'ds_showcase_hr', type: 'datasource', label: '数据源', value: 'HR数据', removable: false },
    ]),
    B.text('📊 出勤率：'),
    B.kpi({
      id: 'attendance',
      label: '出勤率',
      value: 96.5,
      unit: '%',
      trend: {
        value: 1.2,
        direction: 'up',
        mom: 1.2,
        yoy: 2.5,
      },
    }),
    B.text('出勤率为 **96.5%**，环比增长 **1.2%**，同比增长 **2.5%**。'),
  ],

  // showcase-kpi-group: KPI卡片组场景
  'showcase-kpi-group': () => [
    B.visualizer([
      { id: 'ds_showcase_group', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_showcase_group', type: 'groupby', label: '按', value: '指标 并列' },
      { id: 'dt_showcase_group', type: 'date', label: '日期', value: '本月' },
      { id: 'ft_showcase_group', type: 'filter', label: '指标', value: '销售额,订单量,利润,转化率' },
    ]),
    B.text('📊 核心指标展示：'),
    B.kpiGroup([
      {
        id: 'sales',
        label: '销售额',
        value: 12500000,
        prefix: '¥',
        unit: '元',
        trend: {
          value: 15.2,
          direction: 'up',
          mom: 15.2,
          yoy: 19.8,
        },
      },
      {
        id: 'orders',
        label: '订单量',
        value: 12500,
        unit: '单',
        trend: {
          value: 8.5,
          direction: 'up',
          mom: 8.5,
          yoy: 12.3,
        },
      },
      {
        id: 'profit',
        label: '利润',
        value: 2500000,
        prefix: '¥',
        unit: '元',
        trend: {
          value: -2.1,
          direction: 'down',
          mom: -2.1,
          yoy: -5.3,
        },
      },
      {
        id: 'conversion',
        label: '转化率',
        value: 3.2,
        unit: '%',
        trend: {
          value: 0.5,
          direction: 'up',
          mom: 0.5,
          yoy: 1.2,
        },
      },
    ]),
    B.text('核心指标概览：销售额 **1250万元**（环比+15.2%），订单量 **1.25万单**（环比+8.5%），利润 **250万元**（环比-2.1%），转化率 **3.2%**（环比+0.5%）。'),
  ],
};
