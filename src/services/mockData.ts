import { ContentBlock, KPIData, Message } from '../types';

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// 模拟数据：年度销售额
export const salesOverviewData = {
  primaryKPI: {
    id: 'sales_2024',
    label: '2024年度销售额',
    value: 38560000,
    prefix: '¥',
    unit: '元',
    trend: {
      value: 19.8,
      direction: 'up' as const,
      label: '较去年同期',
    },
    subMetrics: [
      { label: 'Q1', value: 8230000 },
      { label: 'Q2', value: 9450000 },
      { label: 'Q3', value: 10280000 },
      { label: 'Q4', value: 10600000 },
    ],
  } as KPIData,
  
  secondaryKPIs: [
    {
      id: 'target_rate',
      label: '销售目标达成率',
      value: '87.5%',
      trend: { value: 5.2, direction: 'up' as const },
    },
    {
      id: 'order_count',
      label: '订单总数',
      value: 125600,
      unit: '单',
      trend: { value: 12.3, direction: 'up' as const },
    },
    {
      id: 'avg_order',
      label: '客单价',
      value: 307,
      prefix: '¥',
      trend: { value: 2.1, direction: 'down' as const },
    },
  ] as KPIData[],

  yearTrendData: [
    { month: '1月', '2024': 2800000, '2023': 2400000 },
    { month: '2月', '2024': 2600000, '2023': 2200000 },
    { month: '3月', '2024': 2830000, '2023': 2500000 },
    { month: '4月', '2024': 3100000, '2023': 2650000 },
    { month: '5月', '2024': 3200000, '2023': 2800000 },
    { month: '6月', '2024': 3150000, '2023': 2700000 },
    { month: '7月', '2024': 3400000, '2023': 2900000 },
    { month: '8月', '2024': 3500000, '2023': 3000000 },
    { month: '9月', '2024': 3380000, '2023': 2850000 },
    { month: '10月', '2024': 3600000, '2023': 3100000 },
    { month: '11月', '2024': 3500000, '2023': 3000000 },
    { month: '12月', '2024': 3500000, '2023': 3100000 },
  ],
};

// 模拟数据：地区对比
export const regionCompareData = {
  data: [
    { region: '华东', value: 12500000 },
    { region: '华南', value: 9800000 },
    { region: '华北', value: 7200000 },
    { region: '华中', value: 5100000 },
    { region: '西南', value: 2500000 },
    { region: '东北', value: 1460000 },
  ],
};

// 模拟数据：渠道占比
export const channelData = {
  data: [
    { name: '线上直营', value: 15800000 },
    { name: '线下门店', value: 12200000 },
    { name: '分销渠道', value: 6800000 },
    { name: '企业客户', value: 3760000 },
  ],
};

// 模拟数据：产品构成
export const productData = {
  data: [
    { name: '电动车', value: 18500000 },
    { name: '配件', value: 8200000 },
    { name: '服务', value: 6500000 },
    { name: '周边产品', value: 5360000 },
  ],
};

// 月度趋势数据
export const monthlyTrendData = [
  { month: '10月', value: 3600000 },
  { month: '11月', value: 3500000 },
  { month: '12月', value: 3500000 },
];

// 生成销售额查询响应
export function generateSalesResponse(): ContentBlock[] {
  return [
    {
      id: generateId(),
      type: 'text',
      data: '根据数据查询，为您展示今年的销售额情况：',
    },
    {
      id: generateId(),
      type: 'kpi',
      data: salesOverviewData.primaryKPI,
    },
    {
      id: generateId(),
      type: 'kpi-group',
      data: salesOverviewData.secondaryKPIs,
    },
    {
      id: generateId(),
      type: 'line-chart',
      data: {
        type: 'year-comparison',
        data: salesOverviewData.yearTrendData,
        xKey: 'month',
        currentYear: '2024',
        lastYear: '2023',
        title: '年度趋势对比',
      },
    },
    {
      id: generateId(),
      type: 'action-buttons',
      data: [
        { id: '1', label: '查看地区分布', query: '各地区销售额对比', icon: 'map' },
        { id: '2', label: '分析渠道构成', query: '销售渠道占比分析', icon: 'pie' },
        { id: '3', label: '查看月度明细', query: '近3个月销售趋势', icon: 'trend' },
      ],
    },
  ];
}

// 生成趋势分析响应
export function generateTrendResponse(): ContentBlock[] {
  return [
    {
      id: generateId(),
      type: 'text',
      data: '为您分析近期销售额趋势变化：',
    },
    {
      id: generateId(),
      type: 'kpi',
      data: {
        id: 'current_month',
        label: '本月销售额',
        value: 3500000,
        prefix: '¥',
        unit: '元',
        trend: {
          value: 2.8,
          direction: 'down' as const,
          label: '环比上月',
        },
      },
    },
    {
      id: generateId(),
      type: 'line-chart',
      data: {
        data: [
          { date: '11/1', value: 110000 },
          { date: '11/5', value: 125000 },
          { date: '11/10', value: 118000 },
          { date: '11/15', value: 132000 },
          { date: '11/20', value: 128000 },
          { date: '11/25', value: 145000 },
          { date: '11/30', value: 138000 },
        ],
        xKey: 'date',
        yKeys: [{ key: 'value', name: '销售额', color: '#3b82f6' }],
        title: '11月销售额日趋势',
      },
    },
    {
      id: generateId(),
      type: 'text',
      data: '从趋势图可以看出，11月销售额整体呈现波动上升态势，月末略有回落。11月25日达到峰值14.5万元，可能与促销活动相关。',
    },
    {
      id: generateId(),
      type: 'action-buttons',
      data: [
        { id: '1', label: '对比去年同期', query: '对比去年11月销售数据', icon: 'trend' },
        { id: '2', label: '分析波动原因', query: '分析11月25日销售高峰原因', icon: 'search' },
      ],
    },
  ];
}

// 生成地区对比响应
export function generateRegionResponse(): ContentBlock[] {
  return [
    {
      id: generateId(),
      type: 'text',
      data: '为您展示各地区销售额对比情况：',
    },
    {
      id: generateId(),
      type: 'bar-chart',
      data: {
        data: regionCompareData.data,
        xKey: 'region',
        yKey: 'value',
        title: '各地区销售额对比',
      },
    },
    {
      id: generateId(),
      type: 'text',
      data: '**华东地区**以1250万元销售额位居首位，占总销售额的32.4%。华南、华北地区紧随其后，三大区域合计贡献超过76%的销售额。',
    },
    {
      id: generateId(),
      type: 'action-buttons',
      data: [
        { id: '1', label: '查看华东详情', query: '华东地区销售详细分析', icon: 'search' },
        { id: '2', label: '分析地区差异', query: '分析各地区销售差异原因', icon: 'bar' },
      ],
    },
  ];
}

// 生成渠道占比响应
export function generateChannelResponse(): ContentBlock[] {
  return [
    {
      id: generateId(),
      type: 'text',
      data: '为您分析各销售渠道占比情况：',
    },
    {
      id: generateId(),
      type: 'pie-chart',
      data: {
        data: channelData.data,
        title: '销售渠道构成',
      },
    },
    {
      id: generateId(),
      type: 'text',
      data: '**线上直营渠道**占比最高达41%，是主要销售来源。线下门店占比32%，两者合计贡献超过七成销售额。建议持续优化线上体验，同时加强线下门店的客户转化。',
    },
    {
      id: generateId(),
      type: 'action-buttons',
      data: [
        { id: '1', label: '查看渠道趋势', query: '各渠道销售额月度趋势', icon: 'trend' },
        { id: '2', label: '分析渠道效率', query: '各渠道转化率对比', icon: 'bar' },
      ],
    },
  ];
}

// 生成异常分析响应
export function generateAnomalyResponse(): ContentBlock[] {
  return [
    {
      id: generateId(),
      type: 'heading',
      data: '销售异常分析报告',
    },
    {
      id: generateId(),
      type: 'kpi',
      data: {
        id: 'anomaly_metric',
        label: '昨日销售额',
        value: 85000,
        prefix: '¥',
        unit: '元',
        trend: {
          value: 28.5,
          direction: 'down' as const,
          label: '环比前日',
        },
      },
    },
    {
      id: generateId(),
      type: 'line-chart',
      data: {
        data: [
          { date: '12/1', value: 115000, baseline: 110000 },
          { date: '12/2', value: 122000, baseline: 112000 },
          { date: '12/3', value: 119000, baseline: 115000 },
          { date: '12/4', value: 85000, baseline: 118000 },
        ],
        xKey: 'date',
        yKeys: [
          { key: 'value', name: '实际值', color: '#ef4444' },
          { key: 'baseline', name: '预期值', color: '#94a3b8' },
        ],
        title: '近4日销售额（含异常标注）',
      },
    },
    {
      id: generateId(),
      type: 'text',
      data: '**异常检测结果**：12月4日销售额显著低于预期，偏离度达28.5%。\n\n**可能原因**：\n1. 系统故障导致订单未完成统计\n2. 促销活动结束后的正常回落\n3. 竞品活动分流客户',
    },
    {
      id: generateId(),
      type: 'action-buttons',
      data: [
        { id: '1', label: '查看时段分布', query: '查看12月4日各时段订单分布', icon: 'bar' },
        { id: '2', label: '检查系统日志', query: '检查12月4日系统运行状态', icon: 'search' },
        { id: '3', label: '查看竞品动态', query: '查看近期竞品促销活动', icon: 'search' },
      ],
    },
  ];
}

// 生成预测响应
export function generatePredictionResponse(): ContentBlock[] {
  return [
    {
      id: generateId(),
      type: 'text',
      data: '基于历史数据和趋势分析，为您预测下月销售情况：',
    },
    {
      id: generateId(),
      type: 'kpi',
      data: {
        id: 'prediction',
        label: '下月预测销售额',
        value: 3650000,
        prefix: '¥',
        unit: '元',
        trend: {
          value: 4.3,
          direction: 'up' as const,
          label: '预计环比',
        },
      },
    },
    {
      id: generateId(),
      type: 'line-chart',
      data: {
        data: [
          { month: '10月', actual: 3600000 },
          { month: '11月', actual: 3500000 },
          { month: '12月', actual: 3500000 },
          { month: '1月(预测)', predicted: 3650000, lower: 3450000, upper: 3850000 },
        ],
        xKey: 'month',
        yKeys: [
          { key: 'actual', name: '实际值', color: '#3b82f6' },
          { key: 'predicted', name: '预测值', color: '#10b981' },
        ],
        title: '销售额趋势预测',
      },
    },
    {
      id: generateId(),
      type: 'text',
      data: '**预测说明**：\n- 预测值：365万元\n- 置信区间：345-385万元（90%置信度）\n- 主要影响因素：春节促销、季节性波动、去年同期表现',
    },
    {
      id: generateId(),
      type: 'action-buttons',
      data: [
        { id: '1', label: '查看预测依据', query: '查看预测模型的详细依据', icon: 'search' },
        { id: '2', label: '调整预测参数', query: '使用不同参数重新预测', icon: 'bar' },
      ],
    },
  ];
}

// 根据意图生成响应
export function generateResponseByIntent(query: string): ContentBlock[] {
  const lowerQuery = query.toLowerCase();
  
  // 销售额查询
  if (lowerQuery.includes('销售额') && (lowerQuery.includes('今年') || lowerQuery.includes('是多少') || lowerQuery.includes('多少'))) {
    return generateSalesResponse();
  }
  
  // 趋势分析
  if (lowerQuery.includes('趋势') || lowerQuery.includes('变化') || lowerQuery.includes('走势')) {
    return generateTrendResponse();
  }
  
  // 地区对比
  if (lowerQuery.includes('地区') || lowerQuery.includes('区域') || lowerQuery.includes('城市')) {
    return generateRegionResponse();
  }
  
  // 渠道分析
  if (lowerQuery.includes('渠道') || lowerQuery.includes('占比') || lowerQuery.includes('构成')) {
    return generateChannelResponse();
  }
  
  // 异常分析
  if (lowerQuery.includes('异常') || lowerQuery.includes('为什么下降') || lowerQuery.includes('突降')) {
    return generateAnomalyResponse();
  }
  
  // 预测
  if (lowerQuery.includes('预测') || lowerQuery.includes('预计') || lowerQuery.includes('未来')) {
    return generatePredictionResponse();
  }
  
  // 默认返回销售概览
  return generateSalesResponse();
}

// 创建用户消息
export function createUserMessage(content: string): Message {
  return {
    id: generateId(),
    role: 'user',
    content,
    timestamp: new Date(),
    status: 'complete',
  };
}

// 创建系统消息
export function createSystemMessage(content: ContentBlock[], intent?: string): Message {
  return {
    id: generateId(),
    role: 'assistant',
    content,
    timestamp: new Date(),
    status: 'complete',
    intent: intent as Message['intent'],
  };
}

// 创建加载消息
export function createLoadingMessage(): Message {
  return {
    id: generateId(),
    role: 'assistant',
    content: [],
    timestamp: new Date(),
    status: 'streaming',
  };
}


