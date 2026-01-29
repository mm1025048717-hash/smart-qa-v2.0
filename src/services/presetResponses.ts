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

// 本月销售额是多少 → 销售额和订单量并列展示（固定回复，不调用API）
const monthlySalesResponse: PresetResponse = {
  ruleApplied: '规则2.2.1: 本月销售额查询 → 销售额和订单量并列展示',
  content: [
    createVisualizer({ datasource: '销售流水', groupBy: '指标 并列', dateRange: '本月', metric: '销售额,订单量' }),
    {
      type: 'text',
      data: '销售额与订单量并列展示：'
    },
    {
      type: 'kpi-group',
      data: [
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
          value: 10000,
          unit: '单',
          trend: { value: 8.5, direction: 'up', label: '同比' }
        }
      ]
    },
    {
      type: 'text',
      data: '销售额增速（12.3%）高于订单量增速（8.5%），说明客单价有所提升。'
    },
    {
      type: 'bar-chart',
      data: {
        title: '核心指标增速对比（%）',
        data: [
          { metric: '销售额增速', value: 12.3 },
          { metric: '订单量增速', value: 8.5 },
          { metric: '客单价增速', value: 3.5 },
        ],
        xKey: 'metric',
        yKey: 'value',
        unit: '%'
      }
    }
  ],
  recommendations: ['分析客单价', '转化率分析', '查看渠道表现'],
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
    createVisualizer({ datasource: '销售流水', groupBy: '日期 分组', dateRange: '最近3天', metric: '销售额' }),
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
        yKeys: [{ key: 'value', name: '销售额（万元）' }],
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
  // KPI匹配规则 - 本月销售额（固定回复，不调用API）
  {
    id: 'monthly-sales',
    keywords: ['本月销售额是多少', '本月销售额', '这个月销售额'],
    exactMatch: '本月销售额是多少',
    response: monthlySalesResponse,
    ruleRef: '规则2.2.1: 本月销售额查询 → 销售额和订单量并列展示'
  },
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
    keywords: ['权限不足', '没有权限', '无法访问', '拒绝访问', '如果没有权限查看数据会显示什么'],
    exactMatch: '如果没有权限查看数据会显示什么',
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
    keywords: ['最近3天', '近3天', '近几天', '查询最近3天的销售额', '最近3天的销售额'],
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
  },
  
  // 财务场景 - 利润率下滑分析（固定回复，不走大模型）
  {
    id: 'profit-decline-analysis',
    keywords: ['为什么利润率在下滑', '利润率下滑', '利润率下降', '利润率为什么下降', '利润下滑原因'],
    exactMatch: '为什么利润率在下滑？',
    response: {
      content: [
        createVisualizer({ datasource: '财务流水', groupBy: '月度 分组', dateRange: '近3个月', metric: '利润率' }),
        {
          type: 'thought-chain',
          data: [
            {
              key: 'understand',
              title: '理解问题',
              description: '分析用户意图：需要找出利润率下滑的根本原因',
              status: 'success'
            },
            {
              key: 'query-data',
              title: '查询数据',
              description: '获取近3个月的利润率、成本结构和费用数据',
              status: 'success',
              collapsible: true,
              content: '查询利润率趋势、管理费用变化、原材料成本变化、营销费用ROI等关键指标'
            },
            {
              key: 'analyze-cost',
              title: '成本分析',
              description: '深度分析成本结构变化，识别影响利润的关键因素',
              status: 'success',
              collapsible: true,
              content: '发现管理费用上涨15%，原材料成本增加12%，这两项是主要影响因素'
            },
            {
              key: 'identify-issues',
              title: '问题定位',
              description: '定位利润率下滑的核心问题',
              status: 'success',
              collapsible: true,
              content: '成本端双重压力：管理费用和原材料成本同时上涨，挤压利润空间'
            },
            {
              key: 'generate-insight',
              title: '生成洞察',
              description: '基于数据分析生成商业洞察和优化建议',
              status: 'success',
              collapsible: true,
              content: '建议重新评估营销活动ROI，优化成本结构，控制费用增长'
            }
          ]
        },
        {
          type: 'kpi',
          data: {
            id: 'profit_margin',
            label: '当前利润率',
            value: 12.5,
            unit: '%',
            trend: { value: 3.2, direction: 'down', label: '环比下降' }
          }
        },
        {
          type: 'heading',
          data: '核心发现'
        },
        {
          type: 'text',
          data: '**管理费用上涨了+15%**\n\n这是影响利润率的主要因素之一。管理费用的快速增长直接压缩了利润空间。'
        },
        {
          type: 'text',
          data: '**原材料成本增加了+12%**\n\n成本端的压力明显增大，原材料价格上涨对整体盈利能力造成冲击。'
        },
        {
          type: 'bar-chart',
          data: {
            title: '成本结构变化对比',
            data: [
              { name: '管理费用', value: 115, lastMonth: 100 },
              { name: '原材料成本', value: 112, lastMonth: 100 },
              { name: '人工成本', value: 98, lastMonth: 100 },
              { name: '其他成本', value: 95, lastMonth: 100 }
            ],
            xKey: 'name',
            yKey: 'value',
            unit: '万元（基准=100）'
          }
        },
        {
          type: 'heading',
          data: '优化建议'
        },
        {
          type: 'text',
          data: '> 建议重新评估营销活动的ROI\n\n部分营销投入未能带来预期回报，建议优化营销预算分配，提高投资效率。'
        },
        {
          type: 'text',
          data: '从成本结构来看，管理费用和原材料成本的双重上涨挤压了利润空间。同时，营销活动的投资回报率需要重新评估。\n\n这不是表格和图表，这是基于深度分析的商业洞察。'
        }
      ],
      recommendations: ['分析成本结构', '评估营销ROI', '优化费用管理', '查看利润趋势']
    }
  },
  
  // 供应链场景 - 库存监控与需求预测（固定回复，不走大模型）
  {
    id: 'supply-chain-inventory',
    keywords: ['实时监控库存', '库存水平', '库存情况', '当前库存', '库存监控', '库存状态'],
    exactMatch: '实时监控库存',
    response: {
      content: [
        createVisualizer({ datasource: '库存表', groupBy: 'SKU 分组', dateRange: '当前', metric: '库存水平' }),
        {
          type: 'thought-chain',
          data: [
            {
              key: 'understand',
              title: '理解需求',
              description: '分析用户意图：需要实时了解库存水平和库存状态',
              status: 'success'
            },
            {
              key: 'query-inventory',
              title: '查询库存数据',
              description: '获取当前所有SKU的库存水平、周转率、缺货风险等数据',
              status: 'success',
              collapsible: true,
              content: '查询当前库存总量、各SKU库存分布、库存周转率、安全库存水平等关键指标'
            },
            {
              key: 'analyze-status',
              title: '分析库存状态',
              description: '识别库存异常、缺货风险和滞销商品',
              status: 'success',
              collapsible: true,
              content: '发现3个SKU存在缺货风险，5个SKU库存周转率低于平均水平'
            },
            {
              key: 'predict-demand',
              title: '智能预测需求',
              description: '基于历史数据和趋势，预测未来需求',
              status: 'success',
              collapsible: true,
              content: '预测下月需求增长15%，建议提前备货，避免缺货'
            },
            {
              key: 'optimize-procurement',
              title: '优化采购建议',
              description: '基于库存分析和需求预测，生成采购优化建议',
              status: 'success',
              collapsible: true,
              content: '建议优化采购流程，提高采购效率，降低缺货风险'
            }
          ]
        },
        {
          type: 'kpi-group',
          data: [
            { id: 'total_inventory', label: '当前库存总量', value: 12580, unit: '件', prefix: '' },
            { id: 'turnover_rate', label: '库存周转率', value: 8.5, unit: '次/年', trend: { value: 12.3, direction: 'up', label: '同比提升' } },
            { id: 'out_of_stock', label: '缺货风险SKU', value: 3, unit: '个' }
          ]
        },
        {
          type: 'heading',
          data: '实时库存监控'
        },
        {
          type: 'text',
          data: '**当前库存总量：12,580件**\n\n库存周转率8.5次/年，同比增长12.3%，库存管理效率持续提升。'
        },
        {
          type: 'line-chart',
          data: {
            title: '库存水平动态监控',
            data: [
              { date: '1月', value: 11800, safety: 10000 },
              { date: '2月', value: 12000, safety: 10000 },
              { date: '3月', value: 12200, safety: 10000 },
              { date: '4月', value: 12400, safety: 10000 },
              { date: '5月', value: 12580, safety: 10000 }
            ],
            xKey: 'date',
            yKeys: [
              { key: 'value', name: '实际库存', color: '#007AFF' },
              { key: 'safety', name: '安全库存线', color: '#FF3B30', isDashed: true }
            ],
            unit: '件'
          }
        },
        {
          type: 'heading',
          data: '智能需求预测'
        },
        {
          type: 'text',
          data: '**预测下月需求增长+15%**\n\n基于历史数据和市场趋势，预计下月需求量将达到14,500件，建议提前备货。'
        },
        {
          type: 'line-chart',
          data: {
            title: '需求预测 vs 实际需求',
            data: [
              { date: '1月', actual: 10500, predicted: 10200 },
              { date: '2月', actual: 10800, predicted: 11000 },
              { date: '3月', actual: 11200, predicted: 11500 },
              { date: '4月', actual: 11500, predicted: 11800 },
              { date: '5月', actual: 12000, predicted: 12200 },
              { date: '6月', actual: null, predicted: 14500 }
            ],
            xKey: 'date',
            yKeys: [
              { key: 'actual', name: '实际需求', color: '#34C759' },
              { key: 'predicted', name: '预测需求', color: '#FF9500', isDashed: true }
            ],
            unit: '件'
          }
        },
        {
          type: 'heading',
          data: '采购流程优化'
        },
        {
          type: 'text',
          data: '> 建议优化采购流程\n\n当前采购周期为7天，建议通过供应商协同和智能补货系统，将采购周期缩短至5天，提高响应速度。'
        },
        {
          type: 'text',
          data: '通过实时监控库存、智能预测需求和优化采购流程，可以确保供应链高效运转，降低缺货风险，提高库存周转效率。'
        }
      ],
      recommendations: ['查看缺货风险SKU', '分析库存周转详情', '优化采购计划', '查看供应商表现']
    }
  },
  
  // 销售场景 - 客户行为分析与增长策略（固定回复，不走大模型）
  {
    id: 'sales-customer-analysis',
    keywords: ['客户行为分析', '分析客户行为', '客户分群', '客户分析', '客户行为', '市场趋势预测', '增长策略'],
    exactMatch: '客户行为分析',
    response: {
      content: [
        createVisualizer({ datasource: '用户表', groupBy: '客户分群', dateRange: '近3个月', metric: '客户行为' }),
        {
          type: 'thought-chain',
          data: [
            {
              key: 'understand',
              title: '理解需求',
              description: '分析用户意图：需要深入了解客户行为，制定增长策略',
              status: 'success'
            },
            {
              key: 'query-customer',
              title: '查询客户数据',
              description: '获取客户购买行为、偏好、分群、转化率等数据',
              status: 'success',
              collapsible: true,
              content: '查询客户购买频次、客单价、复购率、流失率、客户分群等关键指标'
            },
            {
              key: 'analyze-behavior',
              title: '分析客户行为',
              description: '深度分析客户购买行为模式，进行客户分群',
              status: 'success',
              collapsible: true,
              content: '识别出4个主要客户群体：高价值客户、活跃客户、潜在客户、流失风险客户'
            },
            {
              key: 'predict-trend',
              title: '预测市场趋势',
              description: '基于客户行为和市场数据，预测未来市场趋势',
              status: 'success',
              collapsible: true,
              content: '预测未来3个月市场增长15%，高价值客户占比将提升至35%'
            },
            {
              key: 'generate-strategy',
              title: '制定增长策略',
              description: '基于客户分析和趋势预测，制定可执行的增长策略',
              status: 'success',
              collapsible: true,
              content: '制定精准营销策略、客户留存计划、新客户获取策略等增长方案'
            }
          ]
        },
        {
          type: 'kpi-group',
          data: [
            { id: 'total_customers', label: '总客户数', value: 125800, unit: '人', trend: { value: 18.5, direction: 'up', label: '同比增长' } },
            { id: 'avg_order', label: '平均客单价', value: 285, unit: '元', trend: { value: 12.3, direction: 'up', label: '环比提升' } },
            { id: 'repurchase_rate', label: '复购率', value: 45.8, unit: '%', trend: { value: 5.2, direction: 'up', label: '环比提升' } }
          ]
        },
        {
          type: 'heading',
          data: '客户行为分析'
        },
        {
          type: 'text',
          data: '**客户总数：125,800人，同比增长18.5%**\n\n平均客单价285元，环比提升12.3%，客户价值持续提升。'
        },
        {
          type: 'pie-chart',
          data: {
            title: '客户分群可视化',
            data: [
              { name: '高价值客户', value: 25160, color: '#007AFF' },
              { name: '活跃客户', value: 44030, color: '#34C759' },
              { name: '潜在客户', value: 37740, color: '#FF9500' },
              { name: '流失风险客户', value: 18870, color: '#FF3B30' }
            ]
          }
        },
        {
          type: 'text',
          data: '客户分群分析显示：高价值客户占比20%，活跃客户占比35%，潜在客户占比30%，流失风险客户占比15%。'
        },
        {
          type: 'heading',
          data: '市场趋势预测'
        },
        {
          type: 'text',
          data: '**预测未来3个月市场增长+15%**\n\n基于客户行为和市场数据，预计未来3个月客户总数将增长至144,670人，高价值客户占比提升至35%。'
        },
        {
          type: 'line-chart',
          data: {
            title: '市场趋势预测',
            data: [
              { date: '1月', actual: 105000, predicted: null },
              { date: '2月', actual: 112000, predicted: null },
              { date: '3月', actual: 118000, predicted: null },
              { date: '4月', actual: 125800, predicted: null },
              { date: '5月', actual: null, predicted: 135000 },
              { date: '6月', actual: null, predicted: 140000 },
              { date: '7月', actual: null, predicted: 144670 }
            ],
            xKey: 'date',
            yKeys: [
              { key: 'actual', name: '实际客户数', color: '#34C759' },
              { key: 'predicted', name: '预测客户数', color: '#FF9500', isDashed: true }
            ],
            unit: '人'
          }
        },
        {
          type: 'heading',
          data: '增长策略制定'
        },
        {
          type: 'text',
          data: '> 制定精准营销策略\n\n针对高价值客户：提供VIP服务和专属优惠，提升客户忠诚度。\n\n针对活跃客户：通过交叉销售和向上销售，提升客单价。\n\n针对潜在客户：通过精准营销和优惠活动，促进转化。\n\n针对流失风险客户：通过挽留活动和个性化推荐，降低流失率。'
        },
        {
          type: 'text',
          data: '通过深入分析客户行为、准确预测市场趋势和制定增长策略，可以助力销售业绩提升，实现可持续增长。'
        }
      ],
      recommendations: ['查看客户分群详情', '分析转化漏斗', '优化营销策略', '预测销售趋势']
    }
  }
];

/**
 * 归因专区问题列表 - 这些问题应该由 narrativeGenerator 处理，不走 presetResponses
 * ⚠️ 注意：财务场景的"为什么利润率在下滑？"使用固定回复，不走归因流程
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
  // 关键词（但排除财务场景的固定回复）
  // '为什么', // 移除，因为"为什么利润率在下滑"需要走固定回复
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
 * ⚠️ 注意：财务场景、供应链场景、销售场景的固定回复问题，不走归因流程
 */
export function isAttributionQuestion(question: string): boolean {
  const normalized = question.toLowerCase().trim();
  
  // 固定回复场景问题，不走归因流程
  const fixedResponseKeywords = [
    // 财务场景
    '为什么利润率在下滑', '利润率下滑', '利润率下降', '利润率为什么下降',
    // 供应链场景
    '实时监控库存', '库存水平', '库存情况', '当前库存', '库存监控', '库存状态',
    // 销售场景
    '客户行为分析', '分析客户行为', '客户分群', '市场趋势预测', '增长策略'
  ];
  
  if (fixedResponseKeywords.some(kw => normalized.includes(kw.toLowerCase()))) {
    console.log(`[isAttributionQuestion] 跳过固定回复场景问题: ${question}`);
    return false;
  }
  
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
  
  // 1. 优先检查固定回复场景（必须在归因检测之前）
  const fixedResponseRules = [
    RESPONSE_RULES.find(rule => rule.id === 'profit-decline-analysis'),
    RESPONSE_RULES.find(rule => rule.id === 'supply-chain-inventory'),
    RESPONSE_RULES.find(rule => rule.id === 'sales-customer-analysis')
  ].filter(Boolean);
  
  for (const rule of fixedResponseRules) {
    if (!rule) continue;
    
    // 精确匹配 - 支持忽略问号、空格等标点符号
    if (rule.exactMatch) {
      const normalizedExactMatch = rule.exactMatch.toLowerCase().trim().replace(/[？?。，,]/g, '');
      const normalizedQuery = normalizedQuestion.replace(/[？?。，,]/g, '');
      if (normalizedQuery === normalizedExactMatch) {
        console.log(`[PresetResponse] 固定回复场景（精确匹配）: ${rule.id}`);
        return rule.response;
      }
    }
    
    // 关键词匹配
    for (const keyword of rule.keywords) {
      if (normalizedQuestion.includes(keyword.toLowerCase())) {
        console.log(`[PresetResponse] 固定回复场景（关键词匹配）: ${rule.id}, keyword: ${keyword}`);
        return rule.response;
      }
    }
  }
  
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
  
  // 2. 先尝试精确匹配（其他规则）- 支持忽略问号、空格等标点符号
  const fixedResponseIds = ['profit-decline-analysis', 'supply-chain-inventory', 'sales-customer-analysis'];
  for (const rule of RESPONSE_RULES) {
    if (fixedResponseIds.includes(rule.id)) continue; // 已处理
    if (rule.exactMatch) {
      // 移除问号、空格等标点符号后比较，使匹配更灵活
      const normalizedExactMatch = rule.exactMatch.toLowerCase().trim().replace(/[？?。，,]/g, '');
      const normalizedQuery = normalizedQuestion.replace(/[？?。，,]/g, '');
      if (normalizedQuery === normalizedExactMatch) {
        console.log(`[PresetResponse] 精确匹配: ${rule.id}`);
        return rule.response;
      }
    }
  }
  
  // 3. 关键词匹配（需要更严格的匹配）
  for (const rule of RESPONSE_RULES) {
    if (fixedResponseIds.includes(rule.id)) continue; // 已处理
    
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
