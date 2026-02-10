import { IntentType, IntentResult, ContentBlock, ActionButton } from '../types';

// ============================================
// 意图识别关键词映射 (覆盖PRD 3.1全部13种意图)
// ============================================
const INTENT_KEYWORDS: Record<IntentType, { keywords: string[]; priority: number }> = {
  // L1 层级
  single_metric: {
    keywords: ['是多少', '有多少', '数值', '具体数字', '多少钱', '总额', '总量', '当前', '现在'],
    priority: 1,
  },
  multi_metric: {
    keywords: ['和', '以及', '还有', '同时', '一起看', '并且'],
    priority: 1,
  },
  
  // L2 层级
  trend_analysis: {
    keywords: ['趋势', '变化', '走势', '波动', '发展', '怎么样', '情况'],
    priority: 2,
  },
  yoy_mom: {
    keywords: ['比上月', '同比', '环比', '增长', '下降', '对比去年', '比去年', '较上期'],
    priority: 2,
  },
  composition: {
    keywords: ['占比', '构成', '比例', '份额', '分布', '组成'],
    priority: 2,
  },
  dimension_compare: {
    keywords: ['各地区', '各产品', '分渠道', '哪个最好', '各城市', '各省份', '按', '分别'],
    priority: 2,
  },
  ranking: {
    keywords: ['TOP', '最低', '排名', '前五', '最高', '前十', '倒数', '第一'],
    priority: 2,
  },
  anomaly: {
    keywords: ['异常', '突增', '突降', '不正常', '有问题', '怎么回事', '出了什么'],
    priority: 3,
  },
  attribution: {
    keywords: ['为什么', '原因', '影响因素', '怎么导致', '分析原因', '归因'],
    priority: 3,
  },
  prediction: {
    keywords: ['预计', '预测', '未来', '预估', '会怎样', '下个月', '明年'],
    priority: 2,
  },
  
  // L3 层级
  drill_down: {
    keywords: ['详细看看', '展开说说', '具体到', '深入分析', '下钻', '细看'],
    priority: 3,
  },
  
  // 知识库查询意图（优先级最高，避免与数据分析混淆）
  // ⚠️ 注意：不要因为提到"产品"就判断为知识库查询，必须结合查询类动词
  // ⚠️ 如果包含数据分析关键词（分析、占比、对比、趋势等），不是知识库查询
  knowledge_query: {
    keywords: [
      // 明确的介绍类（必须包含"介绍"）
      '产品介绍', '公司介绍', '功能介绍', '特性介绍',
      // 明确的了解类（必须包含"了解"、"是什么"等查询动词）
      '了解产品', '想了解产品', '产品是什么', '什么是产品',
      '了解.*产品', '想了解.*产品', // 匹配"了解XX产品"
      // 知识库相关
      '知识库', '文档', '说明文档', '帮助文档',
      // 产品信息查询（必须明确是信息查询，不是数据分析）
      '产品功能', '产品特性', '产品优势', '产品特点',
      // 使用方法相关
      '怎么用', '如何使用', '使用方法', '使用说明',
      // 技术相关
      '技术架构', '架构', '原理', '工作原理',
      // 案例相关
      '客户案例', '成功案例', '应用案例',
      // 对比相关（但必须是知识库对比，不是数据分析对比）
      '竞品对比', // 注意：数据分析中的"对比"不匹配这里
      // 产品名称相关（必须结合查询动词）
      '了解.*data.*agent', '了解.*亿问', '了解.*Data.*Agent',
      'data agent.*介绍', '亿问.*介绍',
    ],
    priority: 4, // 最高优先级，确保优先识别
  },
};

// 时间维度识别
const TIME_PATTERNS = [
  { pattern: /今年|本年|2024年?/, value: 'current_year', label: '2024年' },
  { pattern: /去年|上一年|2023年?/, value: 'last_year', label: '2023年' },
  { pattern: /本月|这个月|当月/, value: 'current_month', label: '本月' },
  { pattern: /上月|上个月/, value: 'last_month', label: '上月' },
  { pattern: /本周|这周/, value: 'current_week', label: '本周' },
  { pattern: /昨天|昨日/, value: 'yesterday', label: '昨天' },
  { pattern: /近(\d+)(天|日)/, value: 'recent_days', label: '近N天' },
  { pattern: /近(\d+)个?月/, value: 'recent_months', label: '近N月' },
  { pattern: /Q[1-4]|第[一二三四]季度/, value: 'quarter', label: '季度' },
  { pattern: /(\d+)月份?/, value: 'specific_month', label: '指定月份' },
  { pattern: /每小时|小时/, value: 'hourly', label: '小时粒度' },
];

// 指标识别
const METRIC_PATTERNS = [
  { pattern: /销售额|销售金额|营收|收入|营业额/, value: 'sales_amount', label: '销售额' },
  { pattern: /订单(量|数|总数)?/, value: 'order_count', label: '订单量' },
  { pattern: /客单价/, value: 'avg_order_value', label: '客单价' },
  { pattern: /转化率/, value: 'conversion_rate', label: '转化率' },
  { pattern: /日活|DAU/, value: 'dau', label: '日活' },
  { pattern: /月活|MAU/, value: 'mau', label: '月活' },
  { pattern: /利润/, value: 'profit', label: '利润' },
  { pattern: /成本|费用/, value: 'cost', label: '成本' },
  { pattern: /目标达成率|完成率/, value: 'target_completion', label: '达成率' },
  { pattern: /库存/, value: 'inventory', label: '库存' },
  { pattern: /复购率/, value: 'repurchase_rate', label: '复购率' },
  { pattern: /用户数|客户数/, value: 'user_count', label: '用户数' },
  // 餐饮零售行业专业指标
  { pattern: /坪效|每平方米销售额|单位面积销售额/, value: 'sales_per_sqm', label: '坪效' },
  { pattern: /翻台率|桌台周转率/, value: 'table_turnover_rate', label: '翻台率' },
  { pattern: /GMV|商品交易总额|交易总额/, value: 'gmv', label: 'GMV' },
  { pattern: /人效|人均销售额|人均产出/, value: 'sales_per_person', label: '人效' },
  { pattern: /售罄率|销售完毕率|清仓率/, value: 'sell_through_rate', label: '售罄率' },
  { pattern: /连带率|客件数|平均每单件数/, value: 'items_per_order', label: '连带率' },
  { pattern: /库存周转率|周转率/, value: 'inventory_turnover', label: '库存周转率' },
  { pattern: /缺货率|断货率/, value: 'out_of_stock_rate', label: '缺货率' },
  { pattern: /配送时效|配送时间|配送时长/, value: 'delivery_time', label: '配送时效' },
  { pattern: /ROI|投资回报率|活动ROI|营销ROI/, value: 'roi', label: 'ROI' },
];

// 维度识别
const DIMENSION_PATTERNS = [
  { pattern: /地区|区域|城市|省份|大区/, value: 'region', label: '地区' },
  { pattern: /产品|品类|商品|产品线|SKU/, value: 'product', label: '产品' },
  { pattern: /渠道/, value: 'channel', label: '渠道' },
  { pattern: /用户|客户|会员/, value: 'customer', label: '用户' },
  { pattern: /时间|日期|月份/, value: 'time', label: '时间' },
  { pattern: /门店|店铺/, value: 'store', label: '门店' },
  { pattern: /年龄/, value: 'age', label: '年龄' },
  { pattern: /价格/, value: 'price', label: '价格' },
  // 餐饮零售行业专业维度
  { pattern: /品牌|多品牌/, value: 'brand', label: '品牌' },
  { pattern: /KFC|肯德基/, value: 'kfc', label: 'KFC' },
  { pattern: /必胜客|Pizza.*Hut/, value: 'pizza_hut', label: '必胜客' },
  { pattern: /塔可钟|塔可贝尔|Taco.*Bell/, value: 'taco_bell', label: '塔可钟' },
  { pattern: /华东|华北|华南|西部|华中|东北/, value: 'region_detail', label: '具体区域' },
];

// ============================================
// 意图识别主函数
// ============================================
export function detectIntent(query: string): IntentResult {
  // ⚠️ 先检查排除模式：如果包含数据分析关键词，排除知识库查询
  const analysisKeywords = ['分析', '占比', '对比', '趋势', '排名', '销量', '销售额', '订单量', '品类分析', '各产品', '产品占比', '产品销量'];
  const hasAnalysisIntent = analysisKeywords.some(keyword => query.includes(keyword));
  
  // 1. 识别意图类型（支持复合意图）
  const detectedIntents: { type: IntentType; score: number; priority: number }[] = [];

  for (const [intent, config] of Object.entries(INTENT_KEYWORDS)) {
    // ⚠️ 如果是知识库查询意图，但包含数据分析关键词，跳过
    if (intent === 'knowledge_query' && hasAnalysisIntent) {
      continue; // 跳过知识库查询识别
    }
    
    const matchedKeywords = config.keywords.filter(kw => {
      // 对于知识库查询，使用更严格的匹配（必须是完整短语或正则）
      if (intent === 'knowledge_query') {
        // 检查是否是正则模式（包含.*）
        if (kw.includes('.*')) {
          const pattern = new RegExp(kw, 'i');
          return pattern.test(query);
        }
        // 完整短语匹配
        return query.includes(kw);
      }
      return query.includes(kw);
    });
    
    if (matchedKeywords.length > 0) {
      detectedIntents.push({
        type: intent as IntentType,
        score: matchedKeywords.length,
        priority: config.priority,
      });
    }
  }

  // ⚠️ 如果包含数据分析关键词，移除知识库查询意图（使用之前已定义的 hasAnalysisIntent）
  if (hasAnalysisIntent) {
    const filteredIntents = detectedIntents.filter(intent => intent.type !== 'knowledge_query');
    if (filteredIntents.length > 0) {
      detectedIntents.length = 0;
      detectedIntents.push(...filteredIntents);
    }
  }

  // 按优先级和分数排序
  detectedIntents.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.score - a.score;
  });

  // 主意图
  const primaryIntent = detectedIntents[0]?.type || 'single_metric';
  
  // 2. 识别实体
  const metrics: string[] = [];
  const dimensions: string[] = [];
  let timeRange = '';

  METRIC_PATTERNS.forEach(({ pattern, value }) => {
    if (pattern.test(query)) {
      metrics.push(value);
    }
  });

  DIMENSION_PATTERNS.forEach(({ pattern, value }) => {
    if (pattern.test(query)) dimensions.push(value);
  });

  for (const { pattern, value } of TIME_PATTERNS) {
    if (pattern.test(query)) {
      timeRange = value;
      break;
    }
  }

  // 3. 确定意图层级
  let level: 'L1' | 'L2' | 'L3' = 'L1';
  
  // 知识库查询意图不参与数据分析层级判断
  if (primaryIntent === 'knowledge_query') {
    level = 'L1'; // 知识库查询属于基础查询
  } else if (['trend_analysis', 'composition', 'dimension_compare', 'ranking', 'yoy_mom', 'prediction'].includes(primaryIntent)) {
    level = 'L2';
  } else if (['attribution', 'drill_down', 'anomaly'].includes(primaryIntent)) {
    level = 'L2';
  }
  if (primaryIntent === 'drill_down') {
    level = 'L3';
  }

  // 4. 生成建议组件
  const suggestedComponents = getSuggestedComponents(primaryIntent, metrics, dimensions, query);
  
  // 5. 生成追问建议
  const followUpQuestions = generateFollowUpQuestions(primaryIntent, metrics, dimensions);

  // 6. 计算置信度
  const confidence = calculateConfidence(detectedIntents, metrics, dimensions, timeRange);

  return {
    type: primaryIntent,
    level,
    confidence,
    entities: {
      metrics,
      dimensions,
      timeRange,
    },
    suggestedComponents,
    followUpQuestions,
  };
}

// 计算置信度
function calculateConfidence(
  intents: { type: IntentType; score: number }[],
  metrics: string[],
  dimensions: string[],
  timeRange: string
): number {
  let confidence = 0.5;
  
  if (intents.length > 0) confidence += 0.2;
  if (intents[0]?.score > 1) confidence += 0.1;
  if (metrics.length > 0) confidence += 0.1;
  if (dimensions.length > 0 || timeRange) confidence += 0.1;
  
  return Math.min(0.95, confidence);
}

// 获取建议组件（集成匹配规则）
function getSuggestedComponents(
  intent: IntentType, 
  _metrics: string[], 
  _dimensions: string[],
  _query?: string
): ContentBlock['type'][] {
  // 基础组件映射
  const componentMap: Record<IntentType, ContentBlock['type'][]> = {
    single_metric: ['text', 'kpi', 'kpi-group', 'line-chart', 'action-buttons'],
    multi_metric: ['text', 'kpi-group', 'bar-chart', 'action-buttons'],
    trend_analysis: ['text', 'kpi', 'line-chart', 'text', 'action-buttons'],
    yoy_mom: ['text', 'kpi', 'line-chart', 'text', 'action-buttons'],
    composition: ['text', 'kpi', 'pie-chart', 'text', 'action-buttons'],
    dimension_compare: ['text', 'bar-chart', 'text', 'action-buttons'],
    ranking: ['text', 'bar-chart', 'text', 'action-buttons'],
    anomaly: ['heading', 'kpi', 'line-chart', 'text', 'action-buttons'],
    attribution: ['heading', 'kpi', 'line-chart', 'bar-chart', 'pie-chart', 'text', 'action-buttons'],
    drill_down: ['text', 'kpi-group', 'bar-chart', 'text', 'action-buttons'],
    prediction: ['text', 'kpi', 'line-chart', 'text', 'action-buttons'],
    knowledge_query: ['text', 'action-buttons'], // 知识库查询只返回文本和操作按钮
  };

  // 如果有查询文本，可以根据匹配规则优化建议
  // 这里保持基础映射，实际匹配在生成内容时进行
  return componentMap[intent] || ['text', 'kpi', 'action-buttons'];
}

// 生成追问建议
function generateFollowUpQuestions(
  intent: IntentType, 
  _metrics: string[],
  _dimensions: string[]
): ActionButton[] {
  const baseQuestions: Record<IntentType, ActionButton[]> = {
    single_metric: [
      { id: '1', label: '为什么下降了？', query: '为什么下降了？', icon: 'search' },
      { id: '2', label: '查看趋势变化', query: '查看近3个月趋势', icon: 'trend' },
      { id: '3', label: '分地区查看', query: '各地区销售额对比', icon: 'map' },
      { id: '4', label: '分渠道查看', query: '各渠道销售占比', icon: 'pie' },
    ],
    multi_metric: [
      { id: '1', label: '分析关联性', query: '分析这些指标的关联', icon: 'search' },
      { id: '2', label: '查看趋势', query: '查看这些指标的趋势', icon: 'trend' },
    ],
    trend_analysis: [
      { id: '1', label: '对比去年同期', query: '对比去年同期数据', icon: 'trend' },
      { id: '2', label: '分析波动原因', query: '分析波动的原因', icon: 'search' },
      { id: '3', label: '预测下期趋势', query: '预测下个月趋势', icon: 'calendar' },
    ],
    yoy_mom: [
      { id: '1', label: '查看详细对比', query: '查看逐月详细对比', icon: 'trend' },
      { id: '2', label: '分析增长原因', query: '分析增长/下降的原因', icon: 'search' },
    ],
    composition: [
      { id: '1', label: '查看各部分趋势', query: '各构成部分的趋势变化', icon: 'trend' },
      { id: '2', label: '对比去年占比', query: '对比去年同期占比', icon: 'pie' },
    ],
    dimension_compare: [
      { id: '1', label: '查看TOP5详情', query: '查看TOP5的详细数据', icon: 'bar' },
      { id: '2', label: '分析差异原因', query: '分析差异的原因', icon: 'search' },
    ],
    ranking: [
      { id: '1', label: '查看完整排名', query: '查看完整排名列表', icon: 'bar' },
      { id: '2', label: '分析排名变化', query: '分析排名变化趋势', icon: 'trend' },
    ],
    anomaly: [
      { id: '1', label: '查看异常详情', query: '查看异常时段详细数据', icon: 'search' },
      { id: '2', label: '排查原因', query: '排查异常原因', icon: 'search' },
      { id: '3', label: '历史异常对比', query: '查看历史异常记录', icon: 'calendar' },
    ],
    attribution: [
      { id: '1', label: '深入主要因素', query: '深入分析最主要的影响因素', icon: 'search' },
      { id: '2', label: '制定改进措施', query: '根据分析结果制定改进措施', icon: 'bar' },
      { id: '3', label: '查看历史对比', query: '查看历史同期对比', icon: 'calendar' },
    ],
    drill_down: [
      { id: '1', label: '继续下钻', query: '继续查看更细粒度数据', icon: 'search' },
      { id: '2', label: '返回上层', query: '返回上一层分析', icon: 'bar' },
    ],
    prediction: [
      { id: '1', label: '调整预测参数', query: '使用不同参数重新预测', icon: 'search' },
      { id: '2', label: '查看预测依据', query: '查看预测的数据依据', icon: 'bar' },
    ],
    knowledge_query: [
      { id: '1', label: '了解更多功能', query: '了解产品功能', icon: 'search' },
      { id: '2', label: '查看客户案例', query: '查看客户案例', icon: 'bar' },
      { id: '3', label: '技术架构说明', query: '了解技术架构', icon: 'search' },
    ],
  };

  return baseQuestions[intent] || [];
}

// 检测是否为模糊意图
export function isVagueIntent(query: string): boolean {
  const trimmedQuery = query.trim();
  
  // 单字或短词（1-2个字），且不包含明确的查询动词
  const singleWordPatterns = [
    /^(产品|品类|商品|销售|数据|看看|分析|订单|用户|客户|渠道|地区|区域)$/,
    /^.{1,2}$/, // 1-2个字符
  ];
  
  // 模糊短语
  const vaguePhrases = [
    /^帮我.{0,3}$/,
    /^查一下$/,
    /^看看$/,
    /^分析$/,
    /^数据$/,
  ];
  
  // 如果只是提到维度词但没有明确意图
  const dimensionOnly = /^(产品|品类|商品|销售|数据|订单|用户|客户|渠道|地区|区域)$/i.test(trimmedQuery);
  
  return singleWordPatterns.some(p => p.test(trimmedQuery)) ||
         vaguePhrases.some(p => p.test(trimmedQuery)) ||
         dimensionOnly;
}

// 检测是否为复杂查询
export function isComplexQuery(query: string): boolean {
  const complexIndicators = [
    /各.+各/,  // 多维度
    /并且|同时|以及.*以及/,  // 多条件
    /.{50,}/,  // 长查询
  ];
  
  return complexIndicators.some(p => p.test(query));
}

// 导出匹配规则相关函数（供系统提示词使用）
export { generateChartConfig, matchKpiToChart, validateMatch } from './chartMatchingEngine';

export default { detectIntent, isVagueIntent, isComplexQuery };
