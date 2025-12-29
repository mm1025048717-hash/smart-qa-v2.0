/**
 * 预设响应系统 - 完全贴合《智能问答系统显示规则与匹配逻辑完整说明》
 * 每个问题对应唯一的响应，不依赖大模型
 */

// 简化的内容块类型
interface PresetContentBlock {
  type: string;
  data: unknown;
  content?: string; // 兼容旧格式
}

// 响应规则类型
export interface ResponseRule {
  id: string;
  keywords: string[];  // 匹配关键词
  exactMatch?: string; // 精确匹配
  response: PresetResponse;
  ruleRef?: string; // 对应文档规则引用
}

export interface PresetResponse {
  content: PresetContentBlock[];
  recommendations?: string[]; // 过滤后的推荐
  filteredRecommendations?: string[]; // 被过滤的推荐（用于展示去重逻辑）
  ruleApplied?: string; // 应用的规则说明
}

// ============================================
// 规则1：KPI与图表匹配规则
// ============================================

/**
 * 创建 Visualizer 块（筛选条件 + 操作按钮）
 */
function createVisualizer(config: {
  datasource?: string;
  groupBy?: string;
  dateRange?: string;
  metric?: string;
  filter?: string;
}) {
  const conditions = [];
  
  if (config.datasource) {
    conditions.push({ id: 'ds', type: 'datasource', label: '数据源', value: config.datasource, removable: false });
  }
  if (config.groupBy) {
    conditions.push({ id: 'gb', type: 'groupby', label: '按', value: config.groupBy });
  }
  if (config.dateRange) {
    conditions.push({ id: 'dt', type: 'date', label: '日期', value: config.dateRange });
  }
  if (config.metric) {
    conditions.push({ id: 'mt', type: 'filter', label: '指标', value: config.metric });
  }
  if (config.filter) {
    conditions.push({ id: 'ft', type: 'filter', label: '筛选', value: config.filter });
  }
  
  return {
    type: 'visualizer',
    data: conditions.length > 0 ? conditions : [
      { id: 'ds', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'dt', type: 'date', label: '日期', value: '当前查询', removable: true },
    ]
  };
}

// 年度销售额 → 年度趋势对比图
const yearlyResponse: PresetResponse = {
  ruleApplied: '规则2.2.1: 年度销售额查询 → 年度趋势对比图',
  content: [
    createVisualizer({ datasource: '销售流水', groupBy: '月度 分组', dateRange: '2024年', metric: '销售额' }),
    {
      type: 'kpi',
      data: {
        id: 'yearly_sales',
        label: '2024年度销售额',
        value: 3856,
        unit: '万元',
        prefix: '¥',
        trend: { value: 19.8, direction: 'up', label: '同比增长' },
        subMetrics: [
          { label: 'Q1', value: '823万' },
          { label: 'Q2', value: '945万' },
          { label: 'Q3', value: '1028万' },
          { label: 'Q4', value: '1060万' },
        ]
      }
    },
    {
      type: 'text',
      data: '2024年度销售额表现优异，实现¥3856万元，同比增长19.8%。Q4达到年度峰值¥1060万元，环比增长3.1%。全年呈稳步上升趋势，下半年增长势头强劲。'
    },
    {
      type: 'year-comparison',
      data: {
        title: '年度趋势对比（2024 vs 2023）',
        currentYear: '2024',
        lastYear: '2023',
        xKey: 'month',
        data: [
          { month: '1月', '2024': 280, '2023': 230 },
          { month: '2月', '2024': 260, '2023': 220 },
          { month: '3月', '2024': 283, '2023': 245 },
          { month: '4月', '2024': 305, '2023': 260 },
          { month: '5月', '2024': 315, '2023': 275 },
          { month: '6月', '2024': 325, '2023': 285 },
          { month: '7月', '2024': 335, '2023': 295 },
          { month: '8月', '2024': 345, '2023': 305 },
          { month: '9月', '2024': 348, '2023': 310 },
          { month: '10月', '2024': 355, '2023': 315 },
          { month: '11月', '2024': 350, '2023': 318 },
          { month: '12月', '2024': 355, '2023': 320 },
        ]
      }
    }
  ],
  recommendations: ['查看地区分布', '分析渠道构成', '分析增长来源', '预测下月趋势'],
  filteredRecommendations: ['季度分析（已包含）', '对比去年同期（已包含）']
};

// 季度分析 → 柱状图
const quarterlyResponse: PresetResponse = {
  ruleApplied: '规则2.2.1: 季度分析 → 柱状图',
  content: [
    createVisualizer({ datasource: '销售流水', groupBy: '季度 分组', dateRange: '2024年', metric: '销售额' }),
    {
      type: 'kpi-group',
      data: [
        { id: 'q1', label: 'Q1销售额', value: 823, unit: '万元', prefix: '¥', trend: { value: 12.5, direction: 'up', label: '同比' } },
        { id: 'q2', label: 'Q2销售额', value: 945, unit: '万元', prefix: '¥', trend: { value: 18.2, direction: 'up', label: '同比' } },
        { id: 'q3', label: 'Q3销售额', value: 1028, unit: '万元', prefix: '¥', trend: { value: 22.1, direction: 'up', label: '同比' } },
        { id: 'q4', label: 'Q4销售额', value: 1060, unit: '万元', prefix: '¥', trend: { value: 25.3, direction: 'up', label: '同比' } },
      ]
    },
    {
      type: 'text',
      data: '各季度销售额呈稳步增长。Q4表现最佳达¥1060万元，同比增长25.3%。从Q1到Q4，环比增长逐季提升。'
    },
    {
      type: 'bar-chart',
      data: {
        title: '各季度销售额对比',
        data: [
          { name: 'Q1', value: 823, lastYear: 732 },
          { name: 'Q2', value: 945, lastYear: 800 },
          { name: 'Q3', value: 1028, lastYear: 842 },
          { name: 'Q4', value: 1060, lastYear: 846 },
        ],
        xKey: 'name',
        yKey: 'value',
        unit: '万元'
      }
    }
  ],
  recommendations: ['查看各季度地区分布', '分析季度环比变化', '对比各季度渠道表现'],
  filteredRecommendations: ['季度销售额（已展示）']
};

// 趋势分析 → 折线图
const trendResponse: PresetResponse = {
  ruleApplied: '规则2.2.1: 趋势分析 → 折线图',
  content: [
    createVisualizer({ datasource: '销售流水', groupBy: '月度 分组', dateRange: '近3个月', metric: '销售额' }),
    {
      type: 'kpi',
      data: {
        id: 'trend_sales',
        label: '近3个月销售额',
        value: 2500,
        unit: '万元',
        prefix: '¥',
        trend: { value: 15.2, direction: 'up', label: '环比增长' }
      }
    },
    {
      type: 'text',
      data: '近3个月销售额呈上升趋势，累计¥2500万元，环比增长15.2%。10月¥800万，11月¥820万，12月冲高至¥880万，月均增速约5%。'
    },
    {
      type: 'line-chart',
      data: {
        title: '销售额趋势',
        data: [
          { date: '10月', value: 800 },
          { date: '11月', value: 820 },
          { date: '12月', value: 880 },
        ],
        xKey: 'date',
        yKeys: [{ key: 'value', name: '销售额（万元）', color: '#007AFF' }],
        unit: '万元'
      }
    }
  ],
  recommendations: ['分析趋势变化原因', '查看各渠道趋势', '预测未来趋势']
};

// 月度环比（12月） → KPI + 对比图（用于归因入口验证）
const decMoMResponse: PresetResponse = {
  ruleApplied: '规则2.2.1: 月度销售额环比 → 环比对比 + 归因入口',
  content: [
    createVisualizer({ datasource: '销售流水', groupBy: '月度 对比', dateRange: '12月', metric: '销售额,环比' }),
    {
      type: 'kpi',
      data: {
        id: 'dec_mom_sales',
        label: '2024年12月销售额',
        value: 350,
        unit: '万元',
        prefix: '¥',
        trend: { value: 2.8, direction: 'down', label: '环比下降' },
      }
    },
    {
      type: 'text',
      data: '12月销售额为¥350万元，较11月¥360万元环比下降2.8%。可点击"归因"查看下降原因拆解。'
    },
    {
      type: 'bar-chart',
      data: {
        title: '11月 vs 12月销售额对比',
        data: [
          { name: '11月', value: 360 },
          { name: '12月', value: 350 },
        ],
        xKey: 'name',
        yKey: 'value',
        unit: '万元'
      }
    }
  ],
  recommendations: ['分析下降原因', '查看同比表现', '拆解渠道贡献'],
};

// 占比分析 → 饼图
const pieChartResponse: PresetResponse = {
  ruleApplied: '规则2.2.1: 占比分析 → 饼图',
  content: [
    createVisualizer({ datasource: '销售流水', groupBy: '渠道 分组', dateRange: '2024年', metric: '销售额占比' }),
    {
      type: 'kpi',
      data: {
        id: 'channel_total',
        label: '渠道总销售额',
        value: 3856,
        unit: '万元',
        prefix: '¥'
      }
    },
    {
      type: 'text',
      data: '渠道销售构成：线上渠道占比45%（¥1735万），线下渠道占比30%（¥1157万），门店渠道占比25%（¥964万）。线上渠道领先，是主要销售来源。'
    },
    {
      type: 'pie-chart',
      data: {
        title: '各渠道销售额占比',
        data: [
          { name: '线上', value: 1735 },
          { name: '线下', value: 1157 },
          { name: '门店', value: 964 },
        ]
      }
    }
  ],
  recommendations: ['分析各渠道增长趋势', '对比渠道转化率', '查看渠道地区分布'],
  filteredRecommendations: ['渠道占比（已展示）', '渠道构成（已展示）']
};

// 地区对比 → 柱状图
const regionCompareResponse: PresetResponse = {
  ruleApplied: '规则2.2.1: 地区对比 → 柱状图',
  content: [
    createVisualizer({ datasource: '销售流水', groupBy: '地区 分组', dateRange: '2024年', metric: '销售额' }),
    {
      type: 'kpi-group',
      data: [
        { id: 'east', label: '华东区', value: 1542, unit: '万元', prefix: '¥', trend: { value: 22.5, direction: 'up', label: '同比' } },
        { id: 'south', label: '华南区', value: 1028, unit: '万元', prefix: '¥', trend: { value: 18.2, direction: 'up', label: '同比' } },
        { id: 'north', label: '华北区', value: 771, unit: '万元', prefix: '¥', trend: { value: 15.8, direction: 'up', label: '同比' } },
        { id: 'other', label: '其他', value: 515, unit: '万元', prefix: '¥', trend: { value: 12.3, direction: 'up', label: '同比' } },
      ]
    },
    {
      type: 'text',
      data: '地区销售对比：华东区以¥1542万领跑，同比增长22.5%，占总销售额40%。华南区¥1028万位居第二，华北区¥771万稳步增长。各地区均实现正增长。'
    },
    {
      type: 'bar-chart',
      data: {
        title: '各地区销售额对比',
        data: [
          { name: '华东', value: 1542 },
          { name: '华南', value: 1028 },
          { name: '华北', value: 771 },
          { name: '西南', value: 320 },
          { name: '其他', value: 195 },
        ],
        xKey: 'name',
        yKey: 'value',
        unit: '万元'
      }
    }
  ],
  recommendations: ['下钻华东区详情', '分析地区增长原因', '查看各地区渠道分布'],
  filteredRecommendations: ['地区对比（已展示）', '地区分布（已展示）']
};

// ============================================
// 规则2：空状态显示规则
// ============================================

// 完全无数据
const emptyDataResponse: PresetResponse = {
  ruleApplied: '规则1.1: 数据为空/无数据显示规则',
  content: [
    // 空状态不需要 visualizer
    {
      type: 'empty-state',
      data: {
        type: 'no-data',
        title: '暂无数据',
        description: '当前查询条件下暂无销售数据',
        suggestions: [
          '调整查询时间范围（如选择2024年）',
          '检查数据源连接状态',
          '联系管理员确认数据权限'
        ],
        actions: [
          { label: '修改查询条件', action: 'modify' },
          { label: '刷新数据', action: 'refresh' }
        ]
      }
    }
  ],
  recommendations: ['查询2024年数据', '查看历史数据范围']
};

// 查询条件错误
const queryErrorResponse: PresetResponse = {
  ruleApplied: '规则1.1: 查询条件错误显示规则',
  content: [
    {
      type: 'empty-state',
      data: {
        type: 'query-error',
        title: '查询条件可能有误',
        description: '时间范围超出数据有效范围（2020-2024）',
        errorHighlight: '该时间范围不在有效数据范围内',
        suggestions: [
          '请选择2020-2024年的有效时间范围',
          '当前系统数据截止到2024年12月'
        ],
        actions: [
          { label: '修正查询条件', action: 'fix' },
          { label: '使用默认时间范围', action: 'default' }
        ]
      }
    }
  ],
  recommendations: ['查询2024年数据', '查询近期数据']
};

// 连接失败（模拟）
const connectionErrorResponse: PresetResponse = {
  ruleApplied: '规则1.1: 数据源连接失败显示规则',
  content: [
    {
      type: 'empty-state',
      data: {
        type: 'connection-error',
        title: '数据源连接失败',
        description: '无法连接到数据服务器，请检查网络设置或稍后重试',
        suggestions: [
          '检查您的网络连接',
          '尝试刷新页面或重试连接',
          '如持续失败，请联系系统管理员'
        ],
        actions: [
          { label: '重试连接', action: 'retry', primary: true },
          { label: '检查状态', action: 'check' }
        ]
      }
    }
  ]
};

// 权限不足（模拟）
const permissionDeniedResponse: PresetResponse = {
  ruleApplied: '规则1.1: 权限不足显示规则',
  content: [
    {
      type: 'empty-state',
      data: {
        type: 'permission-denied',
        title: '暂无数据访问权限',
        description: '您当前账号没有权限查看该敏感数据',
        suggestions: [
          '请联系部门管理员申请权限',
          '查看您有权限访问的其他数据'
        ],
        actions: [
          { label: '申请权限', action: 'apply', primary: true },
          { label: '联系管理员', action: 'contact' }
        ]
      }
    }
  ]
};

// ============================================
// 规则3：数据量极小显示规则
// ============================================

// 单日数据
const singleDayResponse: PresetResponse = {
  ruleApplied: '规则1.2: 单日数据场景（隐藏季度分解）',
  content: [
    {
      type: 'kpi',
      data: {
        label: '2024-12-01 销售额',
        value: 82.3,
        unit: '万元'
      }
    },
    {
      type: 'info-banner',
      data: {
        type: 'info',
        icon: 'info',
        message: '数据时间范围：2024-12-01（单日）',
        subMessage: '单日数据，暂不展示季度分解和同比分析',
        background: 'blue'
      }
    },
    {
      type: 'text',
      data: '2024年12月1日销售额为¥82.3万元。建议扩大查询时间范围以获得更完整的分析。'
    }
  ],
  recommendations: ['扩大查询时间范围', '查看本月销售数据', '查看上周销售数据']
};

// 短期数据（2-6天）
const shortRangeResponse: PresetResponse = {
  ruleApplied: '规则1.2: 短期数据场景（隐藏季度分解）',
  content: [
    {
      type: 'kpi',
      data: {
        label: '近3天销售额',
        value: 246.9,
        unit: '万元',
        trend: { value: 8.5, direction: 'up', label: '同比增长' }
      }
    },
    {
      type: 'info-banner',
      data: {
        type: 'info',
        icon: 'info',
        message: '数据时间范围较短（3天）',
        subMessage: '暂不展示季度分解，可显示同比数据',
        dateRange: '2024-12-15 至 2024-12-17',
        background: 'blue'
      }
    },
    {
      type: 'line-chart',
      data: {
        title: '近3天销售额趋势',
        data: [
          { date: '12-15', value: 78.5 },
          { date: '12-16', value: 82.1 },
          { date: '12-17', value: 86.3 },
        ],
        xKey: 'date',
        yKey: 'value',
        unit: '万元'
      }
    }
  ],
  recommendations: ['扩大查询时间范围', '查看本月完整数据', '对比上周同期']
};

// 数据点不足
const insufficientDataResponse: PresetResponse = {
  ruleApplied: '规则1.2: 数据点不足场景（隐藏所有分解）',
  content: [
    {
      type: 'kpi',
      data: {
        label: '查询销售额',
        value: 165.2,
        unit: '万元'
      }
    },
    {
      type: 'info-banner',
      data: {
        type: 'warning',
        icon: 'warning',
        message: '数据点不足（仅2个）',
        subMessage: '无法进行季度分析和趋势对比，建议扩大查询时间范围',
        background: 'yellow'
      }
    }
  ],
  recommendations: ['扩大查询时间范围', '选择完整月份', '查看全年数据']
};

// ============================================
// 规则4：推荐区域智能去重
// ============================================

// 完整分析场景（展示推荐去重逻辑）
const fullAnalysisResponse: PresetResponse = {
  ruleApplied: '规则3.4: 智能推荐去重',
  content: [
    {
      type: 'kpi',
      data: {
        label: '2024年度销售额',
        value: 3856,
        unit: '万元',
        trend: { value: 19.8, direction: 'up', label: '同比增长' },
        secondary: [
          { label: 'Q1', value: 823, unit: '万元' },
          { label: 'Q2', value: 945, unit: '万元' },
          { label: 'Q3', value: 1028, unit: '万元' },
          { label: 'Q4', value: 1060, unit: '万元' },
        ]
      }
    },
    {
      type: 'text',
      data: '2024年度销售额¥3856万元，同比增长19.8%。Q4达到峰值¥1060万元，全年稳步上升。'
    },
    {
      type: 'year-comparison',
      data: {
        title: '年度趋势对比（2024 vs 2023）',
        data: [
          { month: '1月', '2024': 280, '2023': 230 },
          { month: '2月', '2024': 260, '2023': 220 },
          { month: '3月', '2024': 283, '2023': 245 },
          { month: '4月', '2024': 305, '2023': 260 },
          { month: '5月', '2024': 315, '2023': 275 },
          { month: '6月', '2024': 325, '2023': 285 },
          { month: '7月', '2024': 335, '2023': 295 },
          { month: '8月', '2024': 345, '2023': 305 },
          { month: '9月', '2024': 348, '2023': 310 },
          { month: '10月', '2024': 355, '2023': 315 },
          { month: '11月', '2024': 350, '2023': 318 },
          { month: '12月', '2024': 355, '2023': 320 },
        ],
        xKey: 'month',
        yKeys: ['2024', '2023'],
        unit: '万元'
      }
    }
  ],
  recommendations: ['查看地区分布', '分析渠道构成', '分析增长来源', '预测下月趋势'],
  filteredRecommendations: ['季度分析（已包含）', '对比去年同期（已包含）']
};

// ============================================
// 匹配规则库
// ============================================

export const RESPONSE_RULES: ResponseRule[] = [
  // KPI匹配规则 - 年度
  {
    id: 'yearly-sales',
    // 移除 "本年营收"，防止误杀 "看一下营收以及利润"
    keywords: ['今年销售额', '年度销售额', '全年销售额', '2024年销售额', '2024年度'],
    response: yearlyResponse,
    ruleRef: '规则2.2.1: 年度销售额查询 → 年度趋势对比图'
  },
  // KPI匹配规则 - 季度
  {
    id: 'quarterly-sales',
    keywords: ['各季度', 'Q1到Q4', 'Q1-Q4', '季度销售额', '分季度'],
    response: quarterlyResponse,
    ruleRef: '规则2.2.1: 季度分析 → 柱状图'
  },
  // KPI匹配规则 - 趋势
  {
    id: 'trend-analysis',
    keywords: ['趋势', '变化', '走势', '波动', '近3个月'],
    response: trendResponse,
    ruleRef: '规则2.2.1: 趋势分析 → 折线图'
  },
  // KPI匹配规则 - 12月环比
  {
    id: 'dec-mom-sales',
    // 移除单独的 "销售额" 和 "环比"，只保留 "12月"，防止误杀
    // 组合逻辑会在 matchPresetResponse 中处理
    keywords: ['12月', '12月份'],
    response: decMoMResponse,
    ruleRef: '规则2.2.1: 月度销售额环比 → 环比对比'
  },
  // KPI匹配规则 - 占比
  {
    id: 'pie-chart',
    keywords: ['占比', '构成', '分布', '比例', '各渠道', '用户年龄', '品类销售额'],
    response: pieChartResponse,
    ruleRef: '规则2.2.1: 占比分析 → 饼图'
  },
  // KPI匹配规则 - 地区对比
  {
    id: 'region-compare',
    keywords: ['各地区', '各城市', '地区对比', '城市对比', '地区销售额', '城市排名'],
    response: regionCompareResponse,
    ruleRef: '规则2.2.1: 地区对比 → 柱状图'
  },
  
  // 空状态规则 - 无数据
  {
    id: 'empty-data',
    keywords: ['2030年', '2025年以后', '未来日期', '不存在的产品'],
    response: emptyDataResponse,
    ruleRef: '规则1.1: 数据为空/无数据时的显示逻辑'
  },
  // 空状态规则 - 查询条件错误
  {
    id: 'query-error',
    keywords: ['超过10年', '时间范围错误', '无效时间', '过去20年', '范围过大'],
    response: queryErrorResponse,
    ruleRef: '规则1.1: 查询条件错误场景'
  },
  // 空状态规则 - 连接失败
  {
    id: 'connection-error',
    keywords: ['连接失败', '无法连接', '断开了', '服务器没响应'],
    exactMatch: '如果数据源连接失败了会显示什么？',
    response: connectionErrorResponse,
    ruleRef: '规则1.1: 数据源连接失败场景'
  },
  // 空状态规则 - 权限不足
  {
    id: 'permission-denied',
    keywords: ['权限不足', '没有权限', '无法访问', '拒绝访问'],
    exactMatch: '如果没有权限查看数据会显示什么？',
    response: permissionDeniedResponse,
    ruleRef: '规则1.1: 权限不足场景'
  },
  
  // 数据量规则 - 单日
  {
    id: 'single-day',
    keywords: ['2024-12-01的', '某一天的', '单日'],
    exactMatch: '查询2024年12月1日的销售额',
    response: singleDayResponse,
    ruleRef: '规则1.2: 单日数据场景（1天）'
  },
  // 数据量规则 - 短期
  {
    id: 'short-range',
    keywords: ['最近3天', '近3天', '近几天'],
    exactMatch: '查询最近3天的销售额',
    response: shortRangeResponse,
    ruleRef: '规则1.2: 短期数据场景（2-6天）'
  },
  // 数据量规则 - 数据点不足
  {
    id: 'insufficient-data',
    keywords: ['只有2个数据点', '数据点不足', '两个数据', '只有两天'],
    exactMatch: '查询只有两天的销售数据会怎么样？',
    response: insufficientDataResponse,
    ruleRef: '规则1.2: 数据点不足场景（< 3个）'
  },
  
  // 推荐去重规则
  {
    id: 'full-analysis',
    keywords: ['分析今年销售情况', '全面分析', '完整分析'],
    response: fullAnalysisResponse,
    ruleRef: '规则3.4: 智能推荐去重'
  }
];

/**
 * 归因专区问题列表 - 这些问题应该由 narrativeGenerator 处理，不走 presetResponses
 */
const ATTRIBUTION_QUESTIONS = [
  '为什么销售额下降了',
  '为什么销售额下降了？',
  '分析销售额增长原因',
  '为什么11月销售额下降了',
  '为什么11月销售额下降了？',
  '利润下滑的影响因素有哪些',
  '利润下滑的影响因素有哪些？',
  '分析转化率偏低的原因',
  '华东区销售下降的原因',
  '线上渠道增长的驱动因素',
  '产品A销量下滑原因分析',
  '详细分析华东区下降原因',
  // 关键词
  '为什么',
  '原因',
  '归因',
  '下降了',
  '下滑',
  '增长原因',
  '驱动因素',
  '影响因素',
];

/**
 * 叙事故事问题列表 - 这些问题应该由 narrativeGenerator 处理（有精美的叙事报告）
 */
const NARRATIVE_QUESTIONS = [
  // S-01: 年度业绩报告
  '讲讲今年销售额的情况',
  '讲讲今年销售额',
  '今年销售额情况',
  // S-02: 趋势叙事
  '近三个月销售额趋势怎么样',
  '近三个月销售额趋势怎么样？',
  '近3个月销售额趋势怎么样',
  // S-03: 完整归因报告
  '详细分析11月销售下降原因',
  // S-04: 异常诊断报告
  '昨天订单量是不是有问题',
  '昨天订单量是不是有问题？',
  // P-01: 分层渐进披露
  '全面分析今年销售情况',
  // G-01: 智能引导追问
  '销售额下降了',
  // E2E-01: 端到端分析
  '今年业务怎么样',
  '今年业务怎么样？',
];

/**
 * 检查是否为归因专区问题
 */
export function isAttributionQuestion(question: string): boolean {
  const normalized = question.toLowerCase().trim();
  // 检查是否包含归因相关关键词
  const isAttr = ATTRIBUTION_QUESTIONS.some(q => normalized.includes(q.toLowerCase()));
  if (isAttr) {
    console.log(`[isAttributionQuestion] 识别为归因问题: ${question}`);
  }
  return isAttr;
}

/**
 * 检查是否为叙事故事问题（需要走 narrativeGenerator 显示精美报告）
 */
export function isNarrativeQuestion(question: string): boolean {
  const normalized = question.toLowerCase().trim();
  // 精确匹配叙事问题
  const isNarr = NARRATIVE_QUESTIONS.some(q => normalized.includes(q.toLowerCase()));
  if (isNarr) {
    console.log(`[isNarrativeQuestion] 识别为叙事问题: ${question}`);
  }
  return isNarr;
}

/**
 * 根据问题匹配预设响应
 */
export function matchPresetResponse(question: string): PresetResponse | null {
  const normalizedQuestion = question.toLowerCase().trim();
  
  // ⚠️ 归因专区问题不走这里，交给 narrativeGenerator 处理
  if (isAttributionQuestion(question)) {
    console.log(`[PresetResponse] 跳过归因问题: ${question}`);
    return null;
  }
  
  // ⚠️ 叙事故事问题不走这里，交给 narrativeGenerator 处理（有精美的叙事报告）
  if (isNarrativeQuestion(question)) {
    console.log(`[PresetResponse] 跳过叙事问题: ${question}`);
    return null;
  }
  
  // 1. 先尝试精确匹配
  for (const rule of RESPONSE_RULES) {
    if (rule.exactMatch && normalizedQuestion === rule.exactMatch.toLowerCase()) {
      console.log(`[PresetResponse] 精确匹配: ${rule.id}`);
      return rule.response;
    }
  }
  
  // 2. 关键词匹配（需要更严格的匹配）
  for (const rule of RESPONSE_RULES) {
    // 对于 dec-mom-sales 规则，需要同时包含"12月"和"环比"
    if (rule.id === 'dec-mom-sales') {
      if (normalizedQuestion.includes('12月') && normalizedQuestion.includes('环比')) {
        console.log(`[PresetResponse] 组合匹配: ${rule.id}`);
        return rule.response;
      }
      continue;
    }
    
    for (const keyword of rule.keywords) {
      if (normalizedQuestion.includes(keyword.toLowerCase())) {
        console.log(`[PresetResponse] 关键词匹配: ${rule.id}, keyword: ${keyword}`);
        return rule.response;
      }
    }
  }
  
  return null;
}

/**
 * 获取规则说明
 */
export function getRuleExplanation(question: string): string | null {
  const normalizedQuestion = question.toLowerCase().trim();
  
  for (const rule of RESPONSE_RULES) {
    if (rule.exactMatch && normalizedQuestion === rule.exactMatch.toLowerCase()) {
      return rule.ruleRef || null;
    }
    for (const keyword of rule.keywords) {
      if (normalizedQuestion.includes(keyword.toLowerCase())) {
        return rule.ruleRef || null;
      }
    }
  }
  
  return null;
}

/**
 * 检查是否有预设响应
 */
export function hasPresetResponse(question: string): boolean {
  return matchPresetResponse(question) !== null;
}
