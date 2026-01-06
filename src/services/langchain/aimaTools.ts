/**
 * 爱玛电动车数字员工定制化工具
 * 使用 LangChain Tool Calling 风格实现
 * 支持 PPT 生成、报告生成等定制化技能
 */

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, {
        type: string;
        description: string;
        enum?: string[];
      }>;
      required: string[];
    };
  };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface ToolResult {
  tool_call_id: string;
  name: string;
  result: any;
}

/**
 * 爱玛员工可用工具定义
 */
export const AIMA_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'generate_ppt',
      description: '生成PPT演示文稿。根据提供的内容和主题，生成结构化的PPT大纲和内容，包括标题、章节、要点等。适用于销售报告、市场分析、门店运营分析等场景。',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'PPT标题，例如："2024年Q4销售分析报告"',
          },
          theme: {
            type: 'string',
            description: 'PPT主题/场景，例如：销售分析、市场分析、门店运营、库存管理',
            enum: ['销售分析', '市场分析', '门店运营', '库存管理', '竞品对比', '综合报告'],
          },
          sections: {
            type: 'string',
            description: 'PPT章节列表，JSON格式的字符串数组，例如：["市场概况", "销售数据", "趋势分析", "建议措施"]',
          },
          data_summary: {
            type: 'string',
            description: '数据摘要，包含关键数据点和洞察',
          },
        },
        required: ['title', 'theme'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_report',
      description: '生成数据分析报告。根据提供的数据和分析结果，生成结构化的分析报告，包括执行摘要、数据分析、洞察建议等。',
      parameters: {
        type: 'object',
        properties: {
          report_type: {
            type: 'string',
            description: '报告类型',
            enum: ['销售报告', '门店运营报告', '库存分析报告', '市场分析报告', '竞品对比报告'],
          },
          time_period: {
            type: 'string',
            description: '时间周期，例如："2024年Q4"、"2024年12月"',
          },
          key_findings: {
            type: 'string',
            description: '关键发现，JSON格式的字符串数组',
          },
          recommendations: {
            type: 'string',
            description: '建议措施，JSON格式的字符串数组',
          },
        },
        required: ['report_type', 'time_period'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyze_data_trend',
      description: '分析数据趋势。对指定的数据指标进行趋势分析，识别增长、下降、波动等模式，并提供业务洞察。',
      parameters: {
        type: 'object',
        properties: {
          metric: {
            type: 'string',
            description: '分析指标，例如：销售额、销量、门店坪效、库存周转率',
          },
          time_range: {
            type: 'string',
            description: '时间范围，例如："近3个月"、"2024年Q4"',
          },
          dimension: {
            type: 'string',
            description: '分析维度，例如：区域、产品、门店',
          },
        },
        required: ['metric', 'time_range'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compare_competitors',
      description: '对比竞品数据。对比爱玛与主要竞争对手（雅迪、新日、小牛、九号）的市场表现、销售数据等。',
      parameters: {
        type: 'object',
        properties: {
          competitor: {
            type: 'string',
            description: '竞争对手名称',
            enum: ['雅迪控股', '新日股份', '小牛电动', '九号公司', '全部竞品'],
          },
          comparison_dimension: {
            type: 'string',
            description: '对比维度',
            enum: ['市场份额', '销售额', '销量', '增长率', '产品线', '综合对比'],
          },
          time_period: {
            type: 'string',
            description: '时间周期，例如："2024年Q4"',
          },
        },
        required: ['competitor', 'comparison_dimension'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_dashboard',
      description: '生成数据看板。根据用户需求，生成包含关键指标、图表、趋势的数据看板结构。',
      parameters: {
        type: 'object',
        properties: {
          dashboard_type: {
            type: 'string',
            description: '看板类型',
            enum: ['销售看板', '门店运营看板', '库存看板', '市场看板', '综合看板'],
          },
          key_metrics: {
            type: 'string',
            description: '关键指标列表，JSON格式的字符串数组',
          },
          time_period: {
            type: 'string',
            description: '时间周期',
          },
        },
        required: ['dashboard_type'],
      },
    },
  },
];

/**
 * 执行工具调用
 */
export async function executeTool(toolCall: ToolCall): Promise<ToolResult> {
  const { name, arguments: argsStr } = toolCall.function;
  let args: Record<string, any>;
  
  try {
    args = JSON.parse(argsStr);
  } catch (e) {
    throw new Error(`Invalid tool arguments: ${argsStr}`);
  }

  console.log('[Aima Tools] 执行工具:', { name, args });

  switch (name) {
    case 'generate_ppt':
      return await executeGeneratePPT(args);
    case 'generate_report':
      return await executeGenerateReport(args);
    case 'analyze_data_trend':
      return await executeAnalyzeDataTrend(args);
    case 'compare_competitors':
      return await executeCompareCompetitors(args);
    case 'generate_dashboard':
      return await executeGenerateDashboard(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/**
 * 生成PPT
 */
async function executeGeneratePPT(args: Record<string, any>): Promise<ToolResult> {
  const { title, theme, sections, data_summary } = args;
  
  // 解析sections（如果是JSON字符串）
  let sectionsList: string[] = [];
  if (sections) {
    try {
      sectionsList = typeof sections === 'string' ? JSON.parse(sections) : sections;
    } catch (e) {
      sectionsList = [sections];
    }
  } else {
    // 根据theme生成默认章节
    sectionsList = getDefaultSections(theme);
  }

  // 生成PPT结构
  const pptStructure = {
    title,
    theme,
    slides: sectionsList.map((section, index) => ({
      slideNumber: index + 1,
      title: section,
      content: `这是${section}的详细内容。${data_summary ? `数据摘要：${data_summary}` : ''}`,
      notes: `建议在${section}中重点展示相关数据和洞察`,
    })),
    summary: `已生成${sectionsList.length}页PPT，主题：${theme}`,
  };

  return {
    tool_call_id: '',
    name: 'generate_ppt',
    result: {
      success: true,
      ppt: pptStructure,
      message: `已为您生成PPT大纲：${title}，共${sectionsList.length}页。您可以根据需要进一步细化每页内容。`,
    },
  };
}

/**
 * 生成报告
 */
async function executeGenerateReport(args: Record<string, any>): Promise<ToolResult> {
  const { report_type, time_period, key_findings, recommendations } = args;
  
  let findingsList: string[] = [];
  let recommendationsList: string[] = [];
  
  if (key_findings) {
    try {
      findingsList = typeof key_findings === 'string' ? JSON.parse(key_findings) : key_findings;
    } catch (e) {
      findingsList = [key_findings];
    }
  }
  
  if (recommendations) {
    try {
      recommendationsList = typeof recommendations === 'string' ? JSON.parse(recommendations) : recommendations;
    } catch (e) {
      recommendationsList = [recommendations];
    }
  }

  const report = {
    type: report_type,
    timePeriod: time_period,
    executiveSummary: `本报告分析了${time_period}的${report_type}情况。`,
    keyFindings: findingsList,
    recommendations: recommendationsList,
    generatedAt: new Date().toISOString(),
  };

  return {
    tool_call_id: '',
    name: 'generate_report',
    result: {
      success: true,
      report,
      message: `已为您生成${report_type}报告（${time_period}）。`,
    },
  };
}

/**
 * 分析数据趋势
 */
async function executeAnalyzeDataTrend(args: Record<string, any>): Promise<ToolResult> {
  const { metric, time_range, dimension } = args;
  
  // 模拟趋势分析结果
  const trendAnalysis = {
    metric,
    timeRange: time_range,
    dimension: dimension || '整体',
    trend: '增长',
    growthRate: '5.2%',
    insights: [
      `${metric}在${time_range}呈现增长趋势`,
      dimension ? `按${dimension}维度分析，发现不同${dimension}表现差异明显` : '',
      '建议持续关注该指标的变化趋势',
    ].filter(Boolean),
  };

  return {
    tool_call_id: '',
    name: 'analyze_data_trend',
    result: {
      success: true,
      analysis: trendAnalysis,
      message: `已分析${metric}在${time_range}的趋势。`,
    },
  };
}

/**
 * 对比竞品
 */
async function executeCompareCompetitors(args: Record<string, any>): Promise<ToolResult> {
  const { competitor, comparison_dimension, time_period } = args;
  
  const comparison = {
    competitor,
    dimension: comparison_dimension,
    timePeriod: time_period || '最新数据',
    result: {
      aima: '爱玛在该维度表现良好',
      competitor: `${competitor}在该维度表现${comparison_dimension === '市场份额' ? '略高' : '相当'}`,
      gap: '差距较小，建议持续关注',
    },
  };

  return {
    tool_call_id: '',
    name: 'compare_competitors',
    result: {
      success: true,
      comparison,
      message: `已对比爱玛与${competitor}的${comparison_dimension}。`,
    },
  };
}

/**
 * 生成数据看板
 */
async function executeGenerateDashboard(args: Record<string, any>): Promise<ToolResult> {
  const { dashboard_type, key_metrics, time_period } = args;
  
  let metricsList: string[] = [];
  if (key_metrics) {
    try {
      metricsList = typeof key_metrics === 'string' ? JSON.parse(key_metrics) : key_metrics;
    } catch (e) {
      metricsList = [key_metrics];
    }
  } else {
    // 根据dashboard_type生成默认指标
    metricsList = getDefaultMetrics(dashboard_type);
  }

  const dashboard = {
    type: dashboard_type,
    timePeriod: time_period || '当前',
    metrics: metricsList,
    layout: 'grid',
    charts: metricsList.map(metric => ({
      type: 'line',
      title: `${metric}趋势`,
      metric,
    })),
  };

  return {
    tool_call_id: '',
    name: 'generate_dashboard',
    result: {
      success: true,
      dashboard,
      message: `已生成${dashboard_type}看板结构，包含${metricsList.length}个关键指标。`,
    },
  };
}

/**
 * 根据主题获取默认章节
 */
function getDefaultSections(theme: string): string[] {
  const sectionMap: Record<string, string[]> = {
    '销售分析': ['市场概况', '销售数据', '区域对比', '趋势分析', '建议措施'],
    '市场分析': ['市场概况', '竞争格局', '机会点', '威胁分析', '战略建议'],
    '门店运营': ['运营概况', '门店排名', '坪效分析', '异常诊断', '优化建议'],
    '库存管理': ['库存概况', '周转分析', '缺货预警', '滞销分析', '优化建议'],
    '竞品对比': ['竞品概况', '对比分析', '优劣势', '市场机会', '应对策略'],
    '综合报告': ['执行摘要', '数据分析', '关键发现', '业务洞察', '行动建议'],
  };
  
  return sectionMap[theme] || ['概述', '分析', '结论', '建议'];
}

/**
 * 根据看板类型获取默认指标
 */
function getDefaultMetrics(dashboardType: string): string[] {
  const metricsMap: Record<string, string[]> = {
    '销售看板': ['销售额', '销量', '同比增长率', '客单价'],
    '门店运营看板': ['门店坪效', '人效', '转化率', '库存周转率'],
    '库存看板': ['库存周转率', '缺货率', '滞销率', '库存成本'],
    '市场看板': ['市场份额', '市场排名', '市场增长率', '市场渗透率'],
    '综合看板': ['销售额', '门店坪效', '市场份额', '客户满意度'],
  };
  
  return metricsMap[dashboardType] || ['销售额', '销量'];
}

/**
 * 获取工具定义（用于API调用）
 */
export function getToolsForAPI(): ToolDefinition[] {
  return AIMA_TOOLS;
}

