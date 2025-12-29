// ============================================
// 业务场景模板库 - 预置可落地的业务流程
// ============================================

import type { BusinessScenario, Workflow } from '../types/workflow';
import { WorkflowBuilder } from './workflowEngine';

// 预置业务场景
export const BUSINESS_SCENARIOS: BusinessScenario[] = [
  // ============ 销售分析场景 ============
  {
    id: 'scenario_sales_overview',
    name: '销售概览分析',
    description: '全面分析销售业绩，包括销售额、订单量、趋势变化等核心指标',
    icon: '',
    category: 'sales_analysis',
    keyQuestions: [
      '今年销售额是多少',
      '近3个月销售额趋势',
      '各地区销售额对比',
      '各品类销售额构成',
    ],
    requiredAgents: [
      {
        agentId: 'metrics-pro',
        role: 'primary',
        responsibilities: ['计算销售指标', '提取核心KPI'],
      },
      {
        agentId: 'viz-master',
        role: 'support',
        responsibilities: ['生成销售趋势图', '制作对比图表'],
      },
      {
        agentId: 'nora',
        role: 'support',
        responsibilities: ['生成分析报告', '撰写洞察总结'],
      },
    ],
    workflow: createSalesOverviewWorkflow(),
    expectedOutputs: [
      { type: 'chart', name: '销售趋势图', description: '近3个月销售额趋势' },
      { type: 'table', name: '地区销售对比', description: '各地区销售额明细' },
      { type: 'insight', name: '关键洞察', description: '3-5条核心发现' },
      { type: 'report', name: '分析报告', description: '完整的销售分析报告' },
    ],
    useCases: [
      '每周销售周报',
      '月度业绩回顾',
      '季度经营分析',
      '销售目标达成评估',
    ],
    tags: ['销售', 'KPI', '趋势分析', '周报'],
  },

  // ============ 异常诊断场景 ============
  {
    id: 'scenario_anomaly_diagnosis',
    name: '异常诊断分析',
    description: '自动检测数据异常，深入分析原因，提供解决方案建议',
    icon: '',
    category: 'anomaly_diagnosis',
    keyQuestions: [
      '为什么11月销售额下降了',
      '昨天订单量是不是有问题',
      '检测销售额不正常的区域',
      '分析转化率偏低的原因',
    ],
    requiredAgents: [
      {
        agentId: 'attributor',
        role: 'primary',
        responsibilities: ['检测异常', '归因分析', '根因诊断'],
      },
      {
        agentId: 'quality-guard',
        role: 'support',
        responsibilities: ['数据质量检查', '异常点识别'],
      },
      {
        agentId: 'nora',
        role: 'support',
        responsibilities: ['生成诊断报告', '提供改进建议'],
      },
    ],
    workflow: createAnomalyDiagnosisWorkflow(),
    expectedOutputs: [
      { type: 'chart', name: '异常点标注图', description: '标注异常数据点' },
      { type: 'insight', name: '异常原因', description: '多维度归因分析' },
      { type: 'action', name: '改进建议', description: '可落地的解决方案' },
      { type: 'report', name: '诊断报告', description: '完整的异常诊断报告' },
    ],
    useCases: [
      '销售额突然下降',
      '订单异常波动',
      '转化率异常',
      '数据质量监控',
    ],
    tags: ['异常', '诊断', '归因', '问题排查'],
  },

  // ============ 用户分析场景 ============
  {
    id: 'scenario_user_analysis',
    name: '用户行为分析',
    description: '分析用户活跃度、留存率、转化漏斗等关键指标',
    icon: '',
    category: 'user_analysis',
    keyQuestions: [
      '日活还有月活数据',
      '用户留存率分析',
      '各渠道转化率哪个最好',
      '用户年龄分布比例',
    ],
    requiredAgents: [
      {
        agentId: 'growth-hacker',
        role: 'primary',
        responsibilities: ['用户指标计算', '转化分析', '分群分析'],
      },
      {
        agentId: 'alisa',
        role: 'support',
        responsibilities: ['数据查询', '数据聚合'],
      },
      {
        agentId: 'viz-master',
        role: 'support',
        responsibilities: ['漏斗图', '用户画像可视化'],
      },
    ],
    workflow: createUserAnalysisWorkflow(),
    expectedOutputs: [
      { type: 'chart', name: '转化漏斗图', description: '各环节转化率' },
      { type: 'chart', name: '留存曲线', description: '用户留存趋势' },
      { type: 'table', name: '用户分群', description: '用户群体特征' },
      { type: 'insight', name: '用户洞察', description: '关键发现和建议' },
    ],
    useCases: [
      '用户增长分析',
      '转化率优化',
      '用户分群运营',
      '留存率提升',
    ],
    tags: ['用户', '增长', '转化', '留存'],
  },

  // ============ 预测规划场景 ============
  {
    id: 'scenario_forecast_planning',
    name: '销售预测规划',
    description: '基于历史数据预测未来销售趋势，辅助业务规划',
    icon: '',
    category: 'forecast_planning',
    keyQuestions: [
      '预测下月销售额',
      '预计Q4能完成多少营收',
      '未来一周订单趋势预测',
      '什么时候做活动效果最好',
    ],
    requiredAgents: [
      {
        agentId: 'predictor',
        role: 'primary',
        responsibilities: ['趋势预测', '模型计算', '置信区间'],
      },
      {
        agentId: 'alisa',
        role: 'support',
        responsibilities: ['历史数据获取', '数据清洗'],
      },
      {
        agentId: 'nora',
        role: 'support',
        responsibilities: ['预测报告', '规划建议'],
      },
    ],
    workflow: createForecastWorkflow(),
    expectedOutputs: [
      { type: 'chart', name: '预测趋势图', description: '未来3-6个月预测' },
      { type: 'insight', name: '预测结论', description: '关键预测指标' },
      { type: 'action', name: '规划建议', description: '基于预测的行动建议' },
      { type: 'report', name: '预测报告', description: '完整的预测分析报告' },
    ],
    useCases: [
      '月度销售预测',
      '季度目标规划',
      '促销时机选择',
      '库存规划',
    ],
    tags: ['预测', '规划', '趋势', '决策支持'],
  },

  // ============ 运营监控场景 ============
  {
    id: 'scenario_operation_monitor',
    name: '运营实时监控',
    description: '实时监控核心运营指标，异常自动告警',
    icon: '',
    category: 'operation_monitor',
    keyQuestions: [
      '本月订单量有多少',
      '找出异常交易数据',
      '各门店业绩排名',
      '当前库存数值',
    ],
    requiredAgents: [
      {
        agentId: 'quality-guard',
        role: 'primary',
        responsibilities: ['实时监控', '异常检测', '告警发送'],
      },
      {
        agentId: 'metrics-pro',
        role: 'support',
        responsibilities: ['指标计算', '状态评估'],
      },
      {
        agentId: 'attributor',
        role: 'support',
        responsibilities: ['异常归因', '影响分析'],
      },
    ],
    workflow: createOperationMonitorWorkflow(),
    expectedOutputs: [
      { type: 'chart', name: '实时监控大屏', description: '核心指标实时展示' },
      { type: 'insight', name: '异常告警', description: '异常事件列表' },
      { type: 'action', name: '处理建议', description: '异常处理方案' },
    ],
    useCases: [
      '实时业务监控',
      '异常自动告警',
      '运营大屏',
      '值班监控',
    ],
    tags: ['监控', '实时', '告警', '运营'],
  },

  // ============ 财务报表场景 ============
  {
    id: 'scenario_financial_report',
    name: '财务报表生成',
    description: '自动生成月度/季度财务报表，包含收入、成本、利润等',
    icon: '',
    category: 'financial_report',
    keyQuestions: [
      '看一下营收以及利润',
      '各品类利润率分析',
      '对比去年和今年营收',
      'Q3销售额同比增长情况',
    ],
    requiredAgents: [
      {
        agentId: 'metrics-pro',
        role: 'primary',
        responsibilities: ['财务指标计算', '报表数据准备'],
      },
      {
        agentId: 'report-lisa',
        role: 'primary',
        responsibilities: ['报表生成', '财务分析'],
      },
      {
        agentId: 'nora',
        role: 'support',
        responsibilities: ['报告撰写', '洞察总结'],
      },
    ],
    workflow: createFinancialReportWorkflow(),
    expectedOutputs: [
      { type: 'table', name: '财务数据表', description: '收入成本利润明细' },
      { type: 'chart', name: '财务趋势图', description: '同比环比对比' },
      { type: 'report', name: '财务报表', description: '完整的财务分析报告' },
      { type: 'insight', name: '财务洞察', description: '关键财务发现' },
    ],
    useCases: [
      '月度财务报表',
      '季度财务回顾',
      '年度财务总结',
      '财务健康度评估',
    ],
    tags: ['财务', '报表', '利润', '成本'],
  },
];

// ============================================
// 工作流构建函数
// ============================================

function createSalesOverviewWorkflow(): Workflow {
  const builder = new WorkflowBuilder('销售概览分析', '全面分析销售业绩');
  builder.setCategory('sales_analysis');

  const startId = builder.addStartNode({ timeRange: 'current_month' });
  const queryId = builder.addSkillNode('查询销售数据', 'data_query', {
    sql: 'SELECT * FROM sales WHERE month = ${timeRange}',
  });
  const metricId = builder.addSkillNode('计算销售指标', 'metric_calculate', {
    data: '${queryId.data}',
    metrics: ['totalSales', 'orderCount', 'avgOrderValue'],
  });
  const trendId = builder.addSkillNode('分析销售趋势', 'trend_analysis', {
    data: '${queryId.data}',
    timeField: 'date',
    valueField: 'sales',
  });
  const insightId = builder.addSkillNode('提取关键洞察', 'insight_extract', {
    data: '${metricId.metrics}',
    analysisResults: '${trendId}',
  });
  const chartId = builder.addSkillNode('生成趋势图', 'chart_render', {
    chartType: 'line',
    data: '${queryId.data}',
  });
  const reportId = builder.addSkillNode('生成分析报告', 'narrative_write', {
    data: { metrics: '${metricId}', trend: '${trendId}', insights: '${insightId}' },
  });
  const endId = builder.addEndNode();

  builder.connect(startId, queryId);
  builder.connect(queryId, metricId);
  builder.connect(queryId, trendId);
  builder.connect(metricId, insightId);
  builder.connect(trendId, insightId);
  builder.connect(queryId, chartId);
  builder.connect(insightId, reportId);
  builder.connect(chartId, reportId);
  builder.connect(reportId, endId);

  return builder.build();
}

function createAnomalyDiagnosisWorkflow(): Workflow {
  const builder = new WorkflowBuilder('异常诊断分析', '检测并分析数据异常');
  builder.setCategory('anomaly_diagnosis');

  const startId = builder.addStartNode();
  const queryId = builder.addSkillNode('查询数据', 'data_query', {
    sql: 'SELECT * FROM sales ORDER BY date DESC LIMIT 30',
  });
  const detectId = builder.addSkillNode('检测异常', 'anomaly_detect', {
    data: '${queryId.data}',
    valueField: 'sales',
  });
  const attributionId = builder.addSkillNode('归因分析', 'attribution', {
    currentData: '${queryId.data}',
    baselineData: '${queryId.data}',
    targetMetric: 'sales',
    dimensions: ['region', 'channel', 'product'],
  });
  const insightId = builder.addSkillNode('生成诊断报告', 'insight_extract', {
    data: '${detectId.anomalies}',
    analysisResults: '${attributionId}',
  });
  const endId = builder.addEndNode();

  builder.connect(startId, queryId);
  builder.connect(queryId, detectId);
  builder.connect(detectId, attributionId);
  builder.connect(attributionId, insightId);
  builder.connect(insightId, endId);

  return builder.build();
}

function createUserAnalysisWorkflow(): Workflow {
  const builder = new WorkflowBuilder('用户行为分析', '分析用户活跃度和转化');
  builder.setCategory('user_analysis');

  const startId = builder.addStartNode();
  const queryId = builder.addSkillNode('查询用户数据', 'data_query', {
    sql: 'SELECT * FROM user_events WHERE date >= CURRENT_DATE - 30',
  });
  const metricId = builder.addSkillNode('计算用户指标', 'metric_calculate', {
    data: '${queryId.data}',
    metrics: ['dau', 'mau', 'retention_rate'],
  });
  const funnelId = builder.addSkillNode('转化漏斗分析', 'data_aggregate', {
    data: '${queryId.data}',
    groupBy: ['stage'],
    aggregations: ['count', 'conversion_rate'],
  });
  const chartId = builder.addSkillNode('生成漏斗图', 'chart_render', {
    chartType: 'funnel',
    data: '${funnelId.data}',
  });
  const endId = builder.addEndNode();

  builder.connect(startId, queryId);
  builder.connect(queryId, metricId);
  builder.connect(queryId, funnelId);
  builder.connect(funnelId, chartId);
  builder.connect(metricId, endId);
  builder.connect(chartId, endId);

  return builder.build();
}

function createForecastWorkflow(): Workflow {
  const builder = new WorkflowBuilder('销售预测规划', '预测未来销售趋势');
  builder.setCategory('forecast_planning');

  const startId = builder.addStartNode({ periods: 3 });
  const queryId = builder.addSkillNode('获取历史数据', 'data_query', {
    sql: 'SELECT * FROM sales WHERE date >= CURRENT_DATE - 180 ORDER BY date',
  });
  const trendId = builder.addSkillNode('分析历史趋势', 'trend_analysis', {
    data: '${queryId.data}',
    timeField: 'date',
    valueField: 'sales',
  });
  const predictId = builder.addSkillNode('执行预测', 'prediction', {
    data: '${queryId.data}',
    timeField: 'date',
    valueField: 'sales',
    periods: '${periods}',
  });
  const chartId = builder.addSkillNode('生成预测图', 'chart_render', {
    chartType: 'line',
    data: '${predictId.predictions}',
  });
  const reportId = builder.addSkillNode('生成预测报告', 'narrative_write', {
    data: { predictions: '${predictId}', trend: '${trendId}' },
  });
  const endId = builder.addEndNode();

  builder.connect(startId, queryId);
  builder.connect(queryId, trendId);
  builder.connect(trendId, predictId);
  builder.connect(predictId, chartId);
  builder.connect(predictId, reportId);
  builder.connect(chartId, reportId);
  builder.connect(reportId, endId);

  return builder.build();
}

function createOperationMonitorWorkflow(): Workflow {
  const builder = new WorkflowBuilder('运营实时监控', '实时监控核心指标');
  builder.setCategory('operation_monitor');

  const startId = builder.addStartNode();
  const streamId = builder.addSkillNode('获取实时数据', 'realtime_stream', {
    streamId: 'operation_metrics',
  });
  const metricId = builder.addSkillNode('计算核心指标', 'metric_calculate', {
    data: '${streamId.data}',
    metrics: ['sales', 'orders', 'conversion'],
  });
  const detectId = builder.addSkillNode('检测异常', 'anomaly_detect', {
    data: '${streamId.data}',
    valueField: 'sales',
  });
  const alertId = builder.addSkillNode('发送告警', 'alert_send', {
    alertType: 'warning',
    title: '运营指标异常',
    message: '检测到异常波动',
    channels: ['email', 'dingtalk'],
  });
  const endId = builder.addEndNode();

  builder.connect(startId, streamId);
  builder.connect(streamId, metricId);
  builder.connect(streamId, detectId);
  builder.connect(detectId, alertId);
  builder.connect(metricId, endId);
  builder.connect(alertId, endId);

  return builder.build();
}

function createFinancialReportWorkflow(): Workflow {
  const builder = new WorkflowBuilder('财务报表生成', '生成月度财务报表');
  builder.setCategory('financial_report');

  const startId = builder.addStartNode({ period: 'current_month' });
  const queryId = builder.addSkillNode('查询财务数据', 'data_query', {
    sql: 'SELECT * FROM financial WHERE period = ${period}',
  });
  const metricId = builder.addSkillNode('计算财务指标', 'metric_calculate', {
    data: '${queryId.data}',
    metrics: ['revenue', 'cost', 'profit', 'margin'],
  });
  const compareId = builder.addSkillNode('同比环比对比', 'trend_analysis', {
    data: '${queryId.data}',
    timeField: 'period',
    valueField: 'revenue',
  });
  const reportId = builder.addSkillNode('生成财务报表', 'report_generate', {
    template: 'financial_monthly',
    data: { metrics: '${metricId}', comparison: '${compareId}' },
  });
  const endId = builder.addEndNode();

  builder.connect(startId, queryId);
  builder.connect(queryId, metricId);
  builder.connect(queryId, compareId);
  builder.connect(metricId, reportId);
  builder.connect(compareId, reportId);
  builder.connect(reportId, endId);

  return builder.build();
}

// 根据分类获取场景
export function getScenariosByCategory(category: BusinessScenario['category']): BusinessScenario[] {
  return BUSINESS_SCENARIOS.filter(s => s.category === category);
}

// 根据ID获取场景
export function getScenarioById(id: string): BusinessScenario | undefined {
  return BUSINESS_SCENARIOS.find(s => s.id === id);
}

// 搜索场景
export function searchScenarios(keyword: string): BusinessScenario[] {
  const lowerKeyword = keyword.toLowerCase();
  return BUSINESS_SCENARIOS.filter(s =>
    s.name.toLowerCase().includes(lowerKeyword) ||
    s.description.toLowerCase().includes(lowerKeyword) ||
    s.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}

export default {
  BUSINESS_SCENARIOS,
  getScenariosByCategory,
  getScenarioById,
  searchScenarios,
};


