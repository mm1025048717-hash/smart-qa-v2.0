/**
 * 完整测试用例数据配置
 * 每个测试用例对应唯一的响应数据
 */

import { ContentBlock, KPIData } from '../types';

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// ============================================
// 构建器函数
// ============================================
export const B = {
  text: (content: string): ContentBlock => ({ id: generateId(), type: 'text', data: content }),
  heading: (content: string): ContentBlock => ({ id: generateId(), type: 'heading', data: content }),
  kpi: (data: KPIData): ContentBlock => ({ id: generateId(), type: 'kpi', data }),
  kpiGroup: (items: KPIData[]): ContentBlock => ({ id: generateId(), type: 'kpi-group', data: items }),
  lineChart: (data: any): ContentBlock => ({ id: generateId(), type: 'line-chart', data }),
  barChart: (data: any): ContentBlock => ({ id: generateId(), type: 'bar-chart', data }),
  pieChart: (data: any): ContentBlock => ({ id: generateId(), type: 'pie-chart', data }),
  scatterChart: (data: any): ContentBlock => ({ id: generateId(), type: 'scatter-chart', data }),
  funnelChart: (data: any): ContentBlock => ({ id: generateId(), type: 'funnel-chart', data }),
  mapChart: (data: any): ContentBlock => ({ id: generateId(), type: 'map-chart', data }),
  boxPlot: (data: any): ContentBlock => ({ id: generateId(), type: 'box-plot', data }),
  quadrantChart: (data: any): ContentBlock => ({ id: generateId(), type: 'quadrant-chart', data }),
  quote: (content: string, showQuote = true): ContentBlock => ({ 
    id: generateId(), type: 'quote-paragraph', data: { content, showQuote } 
  }),
  insight: (title: string, content: string, variant = 'primary'): ContentBlock => ({ 
    id: generateId(), type: 'insight-box', data: { title, content, variant } 
  }),
  actions: (items: any[]): ContentBlock => ({ id: generateId(), type: 'action-buttons', data: items }),
  divider: (): ContentBlock => ({ id: generateId(), type: 'divider', data: null }),
  section: (title: string): ContentBlock => ({ id: generateId(), type: 'section', data: title }),
  // 新增故事组件构建器
  regionCards: (items: any[]): ContentBlock => ({ id: generateId(), type: 'region-cards', data: items }),
  metricsPreview: (title: string, icon: string, metrics: any[]): ContentBlock => ({ 
    id: generateId(), type: 'metrics-preview', data: { title, icon, metrics } 
  }),
  analystQuote: (quote: string, author?: string, role?: string, icon?: string): ContentBlock => ({ 
    id: generateId(), type: 'analyst-quote', data: { quote, author, role, icon } 
  }),
  reportHero: (data: any): ContentBlock => ({ id: generateId(), type: 'report-hero', data }),
  reportLayer: (data: any): ContentBlock => ({ id: generateId(), type: 'report-layer', data }),
  calloutCard: (data: any): ContentBlock => ({ id: generateId(), type: 'callout-card', data }),
  strategyCard: (data: any): ContentBlock => ({ id: generateId(), type: 'strategy-card', data }),
  // 数据可视化筛选条件
  visualizer: (conditions: any[]): ContentBlock => ({ id: generateId(), type: 'visualizer', data: conditions }),
  // 表格（支持下钻）
  table: (data: { headers: string[]; rows: Array<string[] | { cells: string[]; children?: Array<{ cells: string[] }>; drillDown?: { type?: 'button' | 'hover' | 'text'; count?: number; label?: string } }> }): ContentBlock => ({ 
    id: generateId(), 
    type: 'table', 
    data 
  }),
  // 工作流执行
  workflowExecution: (data: any): ContentBlock => ({
    id: generateId(),
    type: 'workflow-execution',
    data,
  }),
};

// ============================================
// L1 基础查询数据
// ============================================
export const L1_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // L1-01: 今年销售额是多少 - 单指标+同比环比
  'L1-01': () => [
    B.visualizer([
      { id: 'ds_1', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_1', type: 'groupby', label: '按', value: '产品 分组' },
      { id: 'ft_1', type: 'filter', label: '产品', value: '不为空' },
      { id: 'dt_1', type: 'date', label: '日期', value: '2024年' },
      { id: 'mgte_1', type: 'metric_gte', label: '同期销售额今年', value: '>=500000' },
      { id: 'myoy_1', type: 'metric_yoy', label: '同期销售额同比今年', value: '<=-0.2' },
    ]),
    B.text('根据数据查询，为您展示今年的销售额情况：'),
    B.kpi({
      id: 'sales_2024',
      label: '2024年度销售额',
      value: 38560000,
      prefix: '¥',
      unit: '元',
      trend: { value: 19.8, direction: 'up', label: '同比增长' },
      subMetrics: [
        { label: 'Q1', value: '823万' },
        { label: 'Q2', value: '945万' },
        { label: 'Q3', value: '1028万' },
        { label: 'Q4', value: '1060万' },
      ],
    }),
    B.text('2024年度销售额达到 **3856万元**，较去年同期增长 **19.8%**，整体表现良好。从季度分布来看，销售额呈现稳步上升趋势，Q4表现最为突出。'),
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
        { month: '12月', '2024': 350, '2023': 310 },
      ],
      xKey: 'month',
      type: 'year-comparison',
      currentYear: '2024',
      lastYear: '2023',
      title: '年度趋势对比（万元）',
      summary: [
        { label: '2024年累计', value: '3856', unit: '万元', highlight: true },
        { label: '同比增长', value: '+19.8', unit: '%', highlight: true },
      ],
    }),
    B.actions([
      { id: '1', label: '查看地区分布', query: '各地区销售额对比', icon: 'map' },
      { id: '2', label: '分析渠道构成', query: '销售渠道占比分析', icon: 'pie' },
      { id: '3', label: '对比去年同期', query: '对比去年和今年营收', icon: 'trend' },
    ]),
  ],

  // L1-02: 本月订单量有多少 - 单指标+趋势标签
  'L1-02': () => [
    B.visualizer([
      { id: 'ds_2', type: 'datasource', label: '数据源', value: '订单表', removable: false },
      { id: 'gb_2', type: 'groupby', label: '按', value: '时间 按日' },
      { id: 'dt_2', type: 'date', label: '日期', value: '本月' },
      { id: 'ft_2', type: 'filter', label: '订单状态', value: '已完成' },
    ]),
    B.text('📦 为您查询本月订单量数据：'),
    B.kpi({
      id: 'orders_month',
      label: '本月订单量',
      value: 11823,
      unit: '单',
      trend: { value: 8.5, direction: 'up', label: '环比增长' },
    }),
    B.text('本月累计订单 **11,823单**，环比上月增长 **8.5%**。日均订单约 **394单**，处于历史较高水平。'),
    B.barChart({
      data: [
        { week: '第1周', value: 2650 },
        { week: '第2周', value: 2890 },
        { week: '第3周', value: 3120 },
        { week: '第4周', value: 3163 },
      ],
      xKey: 'week',
      yKey: 'value',
      title: '本月周订单分布',
      summary: [
        { label: '本月总订单', value: '11,823', unit: '单', highlight: true },
        { label: '日均订单', value: '394', unit: '单' },
      ],
    }),
    B.insight('趋势洞察', '订单量呈持续上升趋势，第3-4周增长明显，可能与月末促销活动相关。'),
    B.actions([
      { id: '1', label: '查看订单来源', query: '各渠道订单量占比', icon: 'pie' },
      { id: '2', label: '分析客单价', query: '本月客单价变化', icon: 'trend' },
    ]),
  ],

  // L1-03: 当前库存数值 - 简单数值展示
  'L1-03': () => [
    B.visualizer([
      { id: 'ds_3', type: 'datasource', label: '数据源', value: '库存表', removable: false },
      { id: 'gb_3', type: 'groupby', label: '按', value: 'SKU 分组' },
      { id: 'dt_3', type: 'date', label: '日期', value: '当前' },
      { id: 'ft_3', type: 'metric_lte', label: '库存数量', value: '<=安全线' },
    ]),
    B.text('📦 当前库存状态：'),
    B.kpi({
      id: 'inventory',
      label: '当前库存总量',
      value: 15420,
      unit: '件',
      trend: { value: 2.1, direction: 'down', label: '较上周' },
    }),
    B.kpiGroup([
      { id: 'safe', label: '安全库存线', value: 12000, unit: '件' },
      { id: 'turnover', label: '库存周转天数', value: 45, unit: '天' },
      { id: 'warning', label: '预警SKU数', value: 23, unit: '个' },
    ]),
    B.text('当前库存 **15,420件**，高于安全库存线，库存周转天数 **45天** 处于健康区间。有 **23个SKU** 触发库存预警，建议关注。'),
    B.actions([
      { id: '1', label: '查看预警详情', query: '查看库存预警SKU详情', icon: 'alert' },
      { id: '2', label: '库存周转分析', query: '分析库存周转效率', icon: 'trend' },
    ]),
  ],

  // L1-04: 销售额和订单量 - 多指标并列
  'L1-04': () => [
    B.visualizer([
      { id: 'ds_4', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_4', type: 'groupby', label: '按', value: '指标 并列' },
      { id: 'dt_4', type: 'date', label: '日期', value: '本月' },
      { id: 'ft_4', type: 'filter', label: '指标', value: '销售额,订单量' },
    ]),
    B.text(' 销售额与订单量并列展示：'),
    B.kpiGroup([
      { 
        id: 'sales', 
        label: '本月销售额', 
        value: 3560000, 
        prefix: '¥',
        trend: { value: 12.3, direction: 'up', label: '同比' }
      },
      { 
        id: 'orders', 
        label: '本月订单量', 
        value: 11823, 
        unit: '单',
        trend: { value: 8.5, direction: 'up', label: '同比' }
      },
    ]),
    B.text('销售额增速（12.3%）高于订单量增速（8.5%），说明 **客单价有所提升**。'),
    B.barChart({
      data: [
        { metric: '销售额增速', value: 12.3 },
        { metric: '订单量增速', value: 8.5 },
        { metric: '客单价增速', value: 3.5 },
      ],
      xKey: 'metric',
      yKey: 'value',
      title: '核心指标增速对比（%）',
      summary: [
        { label: '平均增速', value: '8.1', unit: '%', highlight: true },
        { label: '最高增速', value: '12.3', unit: '%' },
      ],
    }),
    B.actions([
      { id: '1', label: '分析客单价', query: '客单价变化趋势', icon: 'trend' },
      { id: '2', label: '转化率分析', query: '各渠道转化率对比', icon: 'bar' },
    ]),
  ],

  // L1-05: 看一下营收以及利润 - 多指标对比
  'L1-05': () => [
    B.visualizer([
      { id: 'ds_5', type: 'datasource', label: '数据源', value: '财务流水', removable: false },
      { id: 'gb_5', type: 'groupby', label: '按', value: '季度 分组' },
      { id: 'dt_5', type: 'date', label: '日期', value: '2024年' },
      { id: 'ft_5', type: 'filter', label: '指标', value: '营收,利润' },
    ]),
    B.text('💰 营收与利润核心指标：'),
    B.kpiGroup([
      { 
        id: 'revenue', 
        label: '总营收', 
        value: 38560000, 
        prefix: '¥',
        trend: { value: 19.8, direction: 'up', label: '同比' }
      },
      { 
        id: 'profit', 
        label: '净利润', 
        value: 8520000, 
        prefix: '¥',
        trend: { value: 25.6, direction: 'up', label: '同比' }
      },
      { 
        id: 'margin', 
        label: '利润率', 
        value: '22.1%',
        trend: { value: 1.8, direction: 'up', label: '同比提升' }
      },
    ]),
    B.insight('关键发现', '利润增速（25.6%）显著高于营收增速（19.8%），表明盈利能力持续优化，成本控制效果显著。', 'success'),
    B.lineChart({
      data: [
        { month: 'Q1', revenue: 823, profit: 165 },
        { month: 'Q2', revenue: 945, profit: 198 },
        { month: 'Q3', revenue: 1028, profit: 237 },
        { month: 'Q4', revenue: 1060, profit: 252 },
      ],
      xKey: 'month',
      yKeys: [
        { key: 'revenue', name: '营收', color: '#3b82f6' },
        { key: 'profit', name: '利润', color: '#10b981' },
      ],
      title: '季度营收与利润趋势（万元）',
      summary: [
        { label: '年度总营收', value: '3856', unit: '万元', highlight: true },
        { label: '年度净利润', value: '852', unit: '万元', highlight: true },
        { label: '利润率', value: '22.1', unit: '%' },
      ],
    }),
    B.actions([
      { id: '1', label: '成本结构分析', query: '分析成本构成', icon: 'pie' },
      { id: '2', label: '利润率趋势', query: '利润率月度变化', icon: 'trend' },
    ]),
  ],

  // L1-06: 日活还有月活数据 - DAU/MAU展示
  'L1-06': () => [
    B.visualizer([
      { id: 'ds_6', type: 'datasource', label: '数据源', value: '用户行为表', removable: false },
      { id: 'gb_6', type: 'groupby', label: '按', value: '日期 汇总' },
      { id: 'dt_6', type: 'date', label: '日期', value: '本周' },
      { id: 'ft_6', type: 'filter', label: '用户状态', value: '活跃' },
    ]),
    B.text('👥 用户活跃度指标：'),
    B.kpiGroup([
      { 
        id: 'dau', 
        label: '日活跃用户 (DAU)', 
        value: 45280,
        trend: { value: 5.6, direction: 'up', label: '较昨日' }
      },
      { 
        id: 'mau', 
        label: '月活跃用户 (MAU)', 
        value: 856000,
        trend: { value: 3.2, direction: 'up', label: '环比' }
      },
      { 
        id: 'ratio', 
        label: 'DAU/MAU 粘性指数', 
        value: '5.29%',
        trend: { value: 0.3, direction: 'up', label: '环比' }
      },
    ]),
    B.text('DAU/MAU 比值为 **5.29%**，用户粘性保持稳定。行业基准约 5%，我们处于健康水平。'),
    B.lineChart({
      data: [
        { date: '周一', dau: 42000, wau: 185000 },
        { date: '周二', dau: 43500, wau: 188000 },
        { date: '周三', dau: 44200, wau: 190000 },
        { date: '周四', dau: 45800, wau: 192000 },
        { date: '周五', dau: 48000, wau: 198000 },
        { date: '周六', dau: 52000, wau: 210000 },
        { date: '周日', dau: 51000, wau: 208000 },
      ],
      xKey: 'date',
      yKeys: [
        { key: 'dau', name: 'DAU', color: '#3b82f6' },
      ],
      title: '本周DAU趋势',
      summary: [
        { label: '周均DAU', value: '46,643', unit: '人', highlight: true },
        { label: '峰值DAU', value: '52,000', unit: '人' },
        { label: '周末增幅', value: '+15.2', unit: '%' },
      ],
    }),
    B.insight('洞察', '周末DAU明显上升，用户使用呈现显著的周末效应。'),
    B.actions([
      { id: '1', label: '用户留存分析', query: '分析用户留存率', icon: 'trend' },
      { id: '2', label: '新增用户趋势', query: '新增用户变化', icon: 'bar' },
    ]),
  ],

  // L1-07: 12月份的销售额环比 - 直接验证“归因”入口（文字按钮）
  'L1-07': () => [
    B.visualizer([
      { id: 'ds_7', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_7', type: 'groupby', label: '按', value: '月份 汇总' },
      { id: 'dt_7', type: 'date', label: '日期', value: '2024年11-12月' },
      { id: 'ft_7', type: 'filter', label: '指标', value: '销售额' },
      { id: 'cmp_7', type: 'compare', label: '对比', value: '环比' },
    ]),
    B.text('为您查询 12 月销售额，并计算环比变化：'),
    B.kpi({
      id: 'sales_dec',
      label: '2024年12月销售额',
      value: 3500000,
      prefix: '¥',
      unit: '元',
      trend: { value: 2.8, direction: 'down', label: '环比下降' },
    }),
    B.text('12月销售额为 **350万**，较11月（**360万**）环比下降 **2.8%**。你可以点击右侧的 **归因** 按钮查看下降原因拆解。'),
    B.barChart({
      data: [
        { month: '11月', value: 360 },
        { month: '12月', value: 350 },
      ],
      xKey: 'month',
      yKey: 'value',
      title: '11月 vs 12月销售额对比（万元）',
      summary: [
        { label: '11月', value: '360', unit: '万元' },
        { label: '12月', value: '350', unit: '万元', highlight: true },
        { label: '环比', value: '-2.8', unit: '%' },
      ],
    }),
    B.actions([
      { id: '1', label: '分析下降原因', query: '为什么销售额下降了？', icon: 'search' },
      { id: '2', label: '查看本月销售额', query: '本月销售额比上月如何？', icon: 'trend' },
    ]),
  ],
  
  // 示例：带下钻功能的表格（只使用 text 类型的下钻）
  'table-drilldown-example': () => [
    B.text('以下是各地区销售额对比，点击"查看详情"可查看详细信息：'),
    B.table({
      headers: ['地区', '销售额', '增长率', '操作'],
      rows: [
        {
          cells: ['华东地区', '¥1,350万', '+25.3%'],
          drillDown: {
            type: 'text',
            label: '查看详情'
          }
        },
        {
          cells: ['华南地区', '¥980万', '+18.5%'],
          drillDown: {
            type: 'text',
            label: '查看详情'
          }
        },
        {
          cells: ['华北地区', '¥720万', '+15.2%'],
          drillDown: {
            type: 'text',
            label: '查看详情'
          }
        },
        {
          cells: ['西南地区', '¥650万', '+12.8%'],
          drillDown: {
            type: 'text',
            label: '查看详情'
          }
        },
      ]
    }),
  ],
  
  // 工作流执行示例
  'workflow-execution-example': () => [
    B.text('以下是销售数据分析工作流的执行状态：'),
    B.workflowExecution({
      id: 'workflow_001',
      title: '销售数据分析工作流',
      status: 'running',
      progress: 65,
      elapsedTime: 150, // 2分30秒
      estimatedTime: 240, // 4分钟
      steps: [
        {
          id: 'step_1',
          name: '数据提取',
          status: 'completed',
          duration: 15,
        },
        {
          id: 'step_2',
          name: '数据清洗',
          status: 'completed',
          duration: 45,
        },
        {
          id: 'step_3',
          name: '数据分析',
          status: 'running',
          progress: 65,
          logs: ['正在分析销售趋势...', '已完成65%的数据处理'],
        },
        {
          id: 'step_4',
          name: '报告生成',
          status: 'pending',
        },
        {
          id: 'step_5',
          name: '结果分发',
          status: 'pending',
        },
      ],
      onPause: () => {
        console.log('暂停工作流');
      },
      onStop: () => {
        console.log('停止工作流');
      },
      onExport: () => {
        console.log('导出工作流结果');
      },
      onViewLogs: (stepId: string) => {
        console.log('查看步骤日志:', stepId);
      },
    }),
  ],
};

