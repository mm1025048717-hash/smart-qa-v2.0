// ============================================
// DataAgent 技能库 - 可调用的能力集合
// ============================================

import type { Skill, SkillType } from '../types/workflow';

// 完整的技能定义库
export const SKILL_LIBRARY: Record<SkillType, Skill> = {
  // ============ 数据获取类技能 ============
  data_query: {
    id: 'data_query',
    name: 'SQL 数据查询',
    description: '执行 SQL 查询获取结构化数据',
    category: 'data_source',
    inputSchema: {
      sql: { type: 'string', description: 'SQL 查询语句', required: true },
      database: { type: 'string', description: '数据库标识', required: true },
      params: { type: 'object', description: '查询参数', required: false },
      limit: { type: 'number', description: '返回行数限制', default: 1000 },
    },
    outputSchema: {
      data: { type: 'array', description: '查询结果集' },
      columns: { type: 'array', description: '列定义' },
      rowCount: { type: 'number', description: '返回行数' },
      executionTime: { type: 'number', description: '执行耗时(ms)' },
    },
    estimatedDuration: 2,
  },

  data_fetch: {
    id: 'data_fetch',
    name: 'API 数据拉取',
    description: '从外部 API 获取数据',
    category: 'data_source',
    inputSchema: {
      url: { type: 'string', description: 'API 端点 URL', required: true },
      method: { type: 'string', description: '请求方法', enum: ['GET', 'POST'], default: 'GET' },
      headers: { type: 'object', description: '请求头', required: false },
      body: { type: 'object', description: '请求体', required: false },
    },
    outputSchema: {
      data: { type: 'any', description: 'API 响应数据' },
      status: { type: 'number', description: 'HTTP 状态码' },
    },
    estimatedDuration: 3,
  },

  data_import: {
    id: 'data_import',
    name: '文件导入',
    description: '从文件导入数据（Excel, CSV, JSON）',
    category: 'data_source',
    inputSchema: {
      fileUrl: { type: 'string', description: '文件路径或URL', required: true },
      fileType: { type: 'string', description: '文件类型', enum: ['excel', 'csv', 'json'], required: true },
      sheetName: { type: 'string', description: 'Excel工作表名', required: false },
      encoding: { type: 'string', description: '文件编码', default: 'utf-8' },
    },
    outputSchema: {
      data: { type: 'array', description: '导入的数据' },
      columns: { type: 'array', description: '列名' },
      rowCount: { type: 'number', description: '行数' },
    },
    estimatedDuration: 5,
  },

  realtime_stream: {
    id: 'realtime_stream',
    name: '实时数据流',
    description: '订阅实时数据流',
    category: 'data_source',
    inputSchema: {
      streamId: { type: 'string', description: '数据流标识', required: true },
      filters: { type: 'object', description: '过滤条件', required: false },
      bufferSize: { type: 'number', description: '缓冲区大小', default: 100 },
    },
    outputSchema: {
      data: { type: 'array', description: '实时数据' },
      timestamp: { type: 'string', description: '数据时间戳' },
    },
    estimatedDuration: 1,
  },

  // ============ 数据处理类技能 ============
  data_clean: {
    id: 'data_clean',
    name: '数据清洗',
    description: '清洗和标准化数据',
    category: 'data_process',
    inputSchema: {
      data: { type: 'array', description: '待清洗数据', required: true },
      rules: { type: 'array', description: '清洗规则', required: true },
      handleNull: { type: 'string', description: '空值处理', enum: ['drop', 'fill', 'ignore'], default: 'drop' },
      fillValue: { type: 'any', description: '填充值', required: false },
    },
    outputSchema: {
      data: { type: 'array', description: '清洗后数据' },
      cleanedCount: { type: 'number', description: '清洗记录数' },
      droppedCount: { type: 'number', description: '丢弃记录数' },
    },
    estimatedDuration: 2,
  },

  data_transform: {
    id: 'data_transform',
    name: '数据转换',
    description: '转换数据格式和结构',
    category: 'data_process',
    inputSchema: {
      data: { type: 'array', description: '源数据', required: true },
      transformations: { type: 'array', description: '转换规则列表', required: true },
    },
    outputSchema: {
      data: { type: 'array', description: '转换后数据' },
    },
    estimatedDuration: 1,
  },

  data_aggregate: {
    id: 'data_aggregate',
    name: '数据聚合',
    description: '按维度聚合数据',
    category: 'data_process',
    inputSchema: {
      data: { type: 'array', description: '源数据', required: true },
      groupBy: { type: 'array', description: '分组字段', required: true },
      aggregations: { type: 'array', description: '聚合定义', required: true },
    },
    outputSchema: {
      data: { type: 'array', description: '聚合结果' },
      groupCount: { type: 'number', description: '分组数量' },
    },
    estimatedDuration: 2,
  },

  data_join: {
    id: 'data_join',
    name: '数据关联',
    description: '关联多个数据集',
    category: 'data_process',
    inputSchema: {
      leftData: { type: 'array', description: '左表数据', required: true },
      rightData: { type: 'array', description: '右表数据', required: true },
      leftKey: { type: 'string', description: '左表关联键', required: true },
      rightKey: { type: 'string', description: '右表关联键', required: true },
      joinType: { type: 'string', description: '关联类型', enum: ['inner', 'left', 'right', 'full'], default: 'inner' },
    },
    outputSchema: {
      data: { type: 'array', description: '关联结果' },
      matchedCount: { type: 'number', description: '匹配行数' },
    },
    estimatedDuration: 3,
  },

  // ============ 分析类技能 ============
  metric_calculate: {
    id: 'metric_calculate',
    name: '指标计算',
    description: '计算业务指标',
    category: 'analysis',
    inputSchema: {
      data: { type: 'array', description: '源数据', required: true },
      metrics: { type: 'array', description: '指标定义列表', required: true },
      timeGranularity: { type: 'string', description: '时间粒度', enum: ['hour', 'day', 'week', 'month', 'quarter', 'year'] },
    },
    outputSchema: {
      metrics: { type: 'object', description: '计算结果' },
      breakdown: { type: 'array', description: '明细数据' },
    },
    estimatedDuration: 2,
  },

  trend_analysis: {
    id: 'trend_analysis',
    name: '趋势分析',
    description: '分析时间序列趋势',
    category: 'analysis',
    inputSchema: {
      data: { type: 'array', description: '时序数据', required: true },
      timeField: { type: 'string', description: '时间字段', required: true },
      valueField: { type: 'string', description: '数值字段', required: true },
      method: { type: 'string', description: '分析方法', enum: ['linear', 'moving_avg', 'exponential'], default: 'linear' },
    },
    outputSchema: {
      trend: { type: 'string', description: '趋势方向', enum: ['up', 'down', 'stable'] },
      slope: { type: 'number', description: '斜率' },
      changeRate: { type: 'number', description: '变化率' },
      trendLine: { type: 'array', description: '趋势线数据' },
    },
    estimatedDuration: 3,
  },

  anomaly_detect: {
    id: 'anomaly_detect',
    name: '异常检测',
    description: '检测数据中的异常点',
    category: 'analysis',
    inputSchema: {
      data: { type: 'array', description: '待检测数据', required: true },
      valueField: { type: 'string', description: '数值字段', required: true },
      method: { type: 'string', description: '检测方法', enum: ['zscore', 'iqr', 'isolation_forest'], default: 'zscore' },
      threshold: { type: 'number', description: '阈值', default: 2.5 },
    },
    outputSchema: {
      anomalies: { type: 'array', description: '异常点列表' },
      anomalyRate: { type: 'number', description: '异常率' },
      statistics: { type: 'object', description: '统计信息' },
    },
    estimatedDuration: 4,
  },

  attribution: {
    id: 'attribution',
    name: '归因分析',
    description: '分析指标变化的归因',
    category: 'analysis',
    inputSchema: {
      currentData: { type: 'array', description: '当期数据', required: true },
      baselineData: { type: 'array', description: '基期数据', required: true },
      targetMetric: { type: 'string', description: '目标指标', required: true },
      dimensions: { type: 'array', description: '分析维度', required: true },
    },
    outputSchema: {
      totalChange: { type: 'number', description: '总变化量' },
      attributions: { type: 'array', description: '归因明细' },
      topFactors: { type: 'array', description: 'TOP影响因素' },
    },
    estimatedDuration: 5,
  },

  prediction: {
    id: 'prediction',
    name: '预测分析',
    description: '预测未来趋势',
    category: 'analysis',
    inputSchema: {
      data: { type: 'array', description: '历史数据', required: true },
      timeField: { type: 'string', description: '时间字段', required: true },
      valueField: { type: 'string', description: '数值字段', required: true },
      periods: { type: 'number', description: '预测期数', required: true },
      model: { type: 'string', description: '预测模型', enum: ['arima', 'prophet', 'linear'], default: 'linear' },
    },
    outputSchema: {
      predictions: { type: 'array', description: '预测结果' },
      confidence: { type: 'number', description: '置信度' },
      upperBound: { type: 'array', description: '上界' },
      lowerBound: { type: 'array', description: '下界' },
    },
    estimatedDuration: 6,
  },

  correlation: {
    id: 'correlation',
    name: '相关性分析',
    description: '分析变量间的相关性',
    category: 'analysis',
    inputSchema: {
      data: { type: 'array', description: '数据集', required: true },
      variables: { type: 'array', description: '分析变量', required: true },
      method: { type: 'string', description: '计算方法', enum: ['pearson', 'spearman', 'kendall'], default: 'pearson' },
    },
    outputSchema: {
      matrix: { type: 'array', description: '相关系数矩阵' },
      topCorrelations: { type: 'array', description: '强相关对' },
    },
    estimatedDuration: 3,
  },

  segmentation: {
    id: 'segmentation',
    name: '分群分析',
    description: '用户或产品分群',
    category: 'analysis',
    inputSchema: {
      data: { type: 'array', description: '数据集', required: true },
      features: { type: 'array', description: '分群特征', required: true },
      method: { type: 'string', description: '分群方法', enum: ['kmeans', 'rfm', 'rule_based'], default: 'kmeans' },
      numGroups: { type: 'number', description: '分群数量', default: 5 },
    },
    outputSchema: {
      segments: { type: 'array', description: '分群结果' },
      profiles: { type: 'array', description: '群体画像' },
    },
    estimatedDuration: 5,
  },

  // ============ 输出类技能 ============
  chart_render: {
    id: 'chart_render',
    name: '图表渲染',
    description: '生成可视化图表',
    category: 'output',
    inputSchema: {
      chartType: { type: 'string', description: '图表类型', enum: ['line', 'bar', 'pie', 'scatter', 'funnel', 'map'], required: true },
      data: { type: 'array', description: '图表数据', required: true },
      options: { type: 'object', description: '图表配置', required: false },
    },
    outputSchema: {
      chartConfig: { type: 'object', description: '图表配置对象' },
    },
    estimatedDuration: 1,
  },

  report_generate: {
    id: 'report_generate',
    name: '报告生成',
    description: '生成分析报告',
    category: 'output',
    inputSchema: {
      template: { type: 'string', description: '报告模板', required: true },
      data: { type: 'object', description: '报告数据', required: true },
      format: { type: 'string', description: '输出格式', enum: ['html', 'pdf', 'markdown'], default: 'html' },
    },
    outputSchema: {
      report: { type: 'string', description: '报告内容' },
      attachments: { type: 'array', description: '附件列表' },
    },
    estimatedDuration: 5,
  },

  insight_extract: {
    id: 'insight_extract',
    name: '洞察提取',
    description: '从数据中提取关键洞察',
    category: 'output',
    inputSchema: {
      data: { type: 'array', description: '分析数据', required: true },
      analysisResults: { type: 'object', description: '分析结果', required: true },
      maxInsights: { type: 'number', description: '最大洞察数', default: 5 },
    },
    outputSchema: {
      insights: { type: 'array', description: '洞察列表' },
      summary: { type: 'string', description: '总结' },
    },
    estimatedDuration: 3,
  },

  narrative_write: {
    id: 'narrative_write',
    name: '叙事生成',
    description: '将数据分析结果转化为自然语言叙述',
    category: 'output',
    inputSchema: {
      data: { type: 'object', description: '数据和分析结果', required: true },
      style: { type: 'string', description: '叙事风格', enum: ['professional', 'casual', 'executive'], default: 'professional' },
      audience: { type: 'string', description: '目标受众', enum: ['analyst', 'manager', 'executive'], default: 'manager' },
    },
    outputSchema: {
      narrative: { type: 'string', description: '叙事文本' },
      keyPoints: { type: 'array', description: '要点列表' },
    },
    estimatedDuration: 4,
  },

  alert_send: {
    id: 'alert_send',
    name: '告警发送',
    description: '发送数据告警通知',
    category: 'output',
    inputSchema: {
      alertType: { type: 'string', description: '告警类型', enum: ['info', 'warning', 'critical'], required: true },
      title: { type: 'string', description: '告警标题', required: true },
      message: { type: 'string', description: '告警内容', required: true },
      channels: { type: 'array', description: '发送渠道', enum: ['email', 'sms', 'webhook', 'dingtalk', 'wechat'] },
      recipients: { type: 'array', description: '接收人', required: true },
    },
    outputSchema: {
      sent: { type: 'boolean', description: '是否发送成功' },
      messageId: { type: 'string', description: '消息ID' },
    },
    estimatedDuration: 2,
  },

  // ============ 交互类技能 ============
  clarify_ask: {
    id: 'clarify_ask',
    name: '澄清追问',
    description: '向用户提出澄清问题',
    category: 'interaction',
    inputSchema: {
      context: { type: 'string', description: '当前上下文', required: true },
      ambiguities: { type: 'array', description: '待澄清项', required: true },
      questionType: { type: 'string', description: '问题类型', enum: ['choice', 'open', 'confirm'], default: 'choice' },
    },
    outputSchema: {
      question: { type: 'string', description: '澄清问题' },
      options: { type: 'array', description: '选项(如有)' },
    },
    estimatedDuration: 1,
  },

  recommend_action: {
    id: 'recommend_action',
    name: '推荐操作',
    description: '基于分析结果推荐下一步操作',
    category: 'interaction',
    inputSchema: {
      analysisResults: { type: 'object', description: '分析结果', required: true },
      userContext: { type: 'object', description: '用户上下文', required: false },
      maxRecommendations: { type: 'number', description: '最大推荐数', default: 3 },
    },
    outputSchema: {
      recommendations: { type: 'array', description: '推荐操作列表' },
    },
    estimatedDuration: 2,
  },

  collect_feedback: {
    id: 'collect_feedback',
    name: '收集反馈',
    description: '收集用户对结果的反馈',
    category: 'interaction',
    inputSchema: {
      resultId: { type: 'string', description: '结果ID', required: true },
      feedbackType: { type: 'string', description: '反馈类型', enum: ['rating', 'text', 'choice'], default: 'rating' },
    },
    outputSchema: {
      feedback: { type: 'any', description: '用户反馈' },
      timestamp: { type: 'string', description: '反馈时间' },
    },
    estimatedDuration: 1,
  },
};

// 按分类获取技能
export function getSkillsByCategory(category: Skill['category']): Skill[] {
  return Object.values(SKILL_LIBRARY).filter(skill => skill.category === category);
}

// 获取所有技能分类
export function getSkillCategories(): { category: Skill['category']; name: string; skills: Skill[] }[] {
  const categoryNames: Record<Skill['category'], string> = {
    data_source: '数据获取',
    data_process: '数据处理',
    analysis: '数据分析',
    output: '输出展示',
    interaction: '用户交互',
  };

  return Object.entries(categoryNames).map(([category, name]) => ({
    category: category as Skill['category'],
    name,
    skills: getSkillsByCategory(category as Skill['category']),
  }));
}

// 模拟技能执行器
export async function executeSkill(
  skillId: SkillType,
  params: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const skill = SKILL_LIBRARY[skillId];
  if (!skill) {
    return { success: false, error: `未知技能: ${skillId}` };
  }

  // 验证必需参数
  for (const [paramName, paramDef] of Object.entries(skill.inputSchema)) {
    if (paramDef.required && !(paramName in params)) {
      return { success: false, error: `缺少必需参数: ${paramName}` };
    }
  }

  // 模拟执行延迟
  await new Promise(resolve => setTimeout(resolve, (skill.estimatedDuration || 1) * 200));

  // 返回模拟结果（实际项目中这里会调用真实API）
  return {
    success: true,
    result: generateMockResult(skillId, params),
  };
}

// 生成模拟结果
function generateMockResult(skillId: SkillType, params: Record<string, unknown>): unknown {
  switch (skillId) {
    case 'data_query':
      return {
        data: [
          { month: '1月', sales: 1200000, orders: 3200 },
          { month: '2月', sales: 1150000, orders: 3100 },
          { month: '3月', sales: 1380000, orders: 3650 },
        ],
        columns: ['month', 'sales', 'orders'],
        rowCount: 3,
        executionTime: 156,
      };

    case 'metric_calculate':
      return {
        metrics: {
          totalSales: 12580000,
          avgOrderValue: 386,
          conversionRate: 0.032,
        },
        breakdown: [],
      };

    case 'trend_analysis':
      return {
        trend: 'up',
        slope: 0.15,
        changeRate: 12.5,
        trendLine: [],
      };

    case 'anomaly_detect':
      return {
        anomalies: [
          { date: '2024-11-15', value: 450000, zscore: 3.2 },
        ],
        anomalyRate: 0.02,
        statistics: { mean: 380000, std: 45000 },
      };

    case 'attribution':
      return {
        totalChange: -150000,
        attributions: [
          { dimension: '华东区', contribution: -80000, ratio: 0.53 },
          { dimension: '线上渠道', contribution: -50000, ratio: 0.33 },
        ],
        topFactors: ['华东区门店关闭', '双11后消费疲软'],
      };

    case 'insight_extract':
      return {
        insights: [
          { type: 'trend', content: '销售额呈上升趋势，环比增长12.5%' },
          { type: 'anomaly', content: '11月15日出现异常下降' },
          { type: 'opportunity', content: '华南区增长潜力较大' },
        ],
        summary: '整体业务表现良好，需关注华东区异常',
      };

    case 'narrative_write':
      return {
        narrative: '本月整体销售表现稳健，累计销售额达1258万元，环比增长12.5%。其中华东区贡献最大，占比35%；但需注意11月15日出现的异常波动，建议深入分析原因。',
        keyPoints: ['销售额1258万', '环比增长12.5%', '华东区占比35%'],
      };

    default:
      return { executed: true, skillId, params };
  }
}

export default {
  SKILL_LIBRARY,
  getSkillsByCategory,
  getSkillCategories,
  executeSkill,
};














