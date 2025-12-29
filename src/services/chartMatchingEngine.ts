/**
 * KPI与图表匹配规则引擎
 * 基于问题意图、数据特征、KPI内容来匹配图表类型
 */

import { IntentType, KPIData } from '../types';

export interface MatchingRule {
  // 问题特征
  questionKeywords: string[];      // 问题关键词
  questionIntent: IntentType[];    // 问题意图（支持多个）
  
  // KPI特征
  kpiLabels?: string[];            // KPI标签模式
  kpiHasTrend?: boolean;            // 是否包含趋势
  kpiHasComparison?: boolean;      // 是否包含对比
  
  // 数据特征
  hasTimeDimension?: boolean;       // 是否有时间维度
  hasCategoryDimension?: boolean;  // 是否有分类维度
  timeRange?: 'year' | 'quarter' | 'month' | 'day'; // 时间范围
  
  // 推荐图表
  recommendedChart: {
    type: string;                   // 图表类型
    subtype?: string;               // 子类型（如 year-comparison）
    reason: string;                 // 匹配理由
  };
  
  // 优先级（数字越大优先级越高）
  priority: number;
}

// 匹配规则库
const MATCHING_RULES: MatchingRule[] = [
  {
    questionKeywords: ['今年', '年度', '全年', '2024年', '本年'],
    questionIntent: ['single_metric', 'yoy_mom'],
    kpiLabels: ['年度', '年', '2024'],
    kpiHasTrend: true,
    hasTimeDimension: true,
    timeRange: 'year',
    recommendedChart: {
      type: 'line-chart',
      subtype: 'year-comparison',
      reason: '年度销售额查询，需要展示年度对比趋势，年度趋势对比图最适合展示2024 vs 2023的对比'
    },
    priority: 10
  },
  {
    questionKeywords: ['季度', 'Q1', 'Q2', 'Q3', 'Q4', '各季度'],
    questionIntent: ['multi_metric', 'dimension_compare'],
    hasCategoryDimension: true,
    recommendedChart: {
      type: 'bar-chart',
      reason: '季度是离散分类，柱状图最适合展示各季度的对比'
    },
    priority: 9
  },
  {
    questionKeywords: ['趋势', '变化', '走势', '波动'],
    questionIntent: ['trend_analysis'],
    hasTimeDimension: true,
    recommendedChart: {
      type: 'line-chart',
      reason: '趋势分析需要展示时间序列变化，折线图最适合'
    },
    priority: 8
  },
  {
    questionKeywords: ['占比', '构成', '分布', '比例'],
    questionIntent: ['composition'],
    recommendedChart: {
      type: 'pie-chart',
      reason: '占比分析需要展示比例关系，饼图最适合'
    },
    priority: 8
  },
  {
    questionKeywords: ['各地区', '各城市', '各区域', '分地区', '按地区'],
    questionIntent: ['dimension_compare', 'ranking'],
    hasCategoryDimension: true,
    recommendedChart: {
      type: 'bar-chart',
      reason: '地区对比是分类对比，柱状图最适合展示各地区的数据对比'
    },
    priority: 7
  },
  {
    questionKeywords: ['各渠道', '分渠道', '按渠道'],
    questionIntent: ['composition', 'dimension_compare'],
    recommendedChart: {
      type: 'pie-chart',
      reason: '渠道分析通常关注占比关系，饼图最适合展示渠道构成'
    },
    priority: 7
  },
  {
    questionKeywords: ['排名', 'TOP', '前', '最高', '最低'],
    questionIntent: ['ranking'],
    recommendedChart: {
      type: 'bar-chart',
      reason: '排名展示需要对比数值大小，柱状图最适合'
    },
    priority: 7
  },
  {
    questionKeywords: ['同比', '环比', '对比', '比较'],
    questionIntent: ['yoy_mom'],
    kpiHasTrend: true,
    hasTimeDimension: true,
    recommendedChart: {
      type: 'line-chart',
      reason: '同比环比分析需要展示时间序列对比，折线图最适合'
    },
    priority: 8
  },
  {
    questionKeywords: ['月度', '每月', '各月'],
    questionIntent: ['trend_analysis', 'dimension_compare'],
    hasTimeDimension: true,
    timeRange: 'month',
    recommendedChart: {
      type: 'line-chart',
      reason: '月度数据是时间序列，折线图最适合展示月度趋势'
    },
    priority: 7
  },
];

// 默认匹配规则
const DEFAULT_RULE: MatchingRule = {
  questionKeywords: [],
  questionIntent: [],
  recommendedChart: {
    type: 'line-chart',
    reason: '默认使用折线图展示趋势'
  },
  priority: 1
};

/**
 * 匹配KPI到图表类型
 */
export function matchKpiToChart(
  question: string,
  kpiData: KPIData[],
  intent: IntentType
): MatchingRule {
  const questionLower = question.toLowerCase();
  
  // 提取KPI特征
  const kpiLabels = kpiData.map(k => k.label?.toLowerCase() || '');
  const kpiHasTrend = kpiData.some(k => k.trend !== undefined);
  
  // 检查时间维度
  const hasTimeDimension = /年|月|日|季度|Q[1-4]/.test(question) || 
    kpiLabels.some(label => /年|月|日|季度/.test(label));
  
  // 检查分类维度
  const hasCategoryDimension = /各|分|按|不同/.test(question) ||
    kpiLabels.some(label => /各|分|按/.test(label));
  
  // 检查时间范围
  let timeRange: 'year' | 'quarter' | 'month' | 'day' | undefined;
  if (/年|年度|全年/.test(question)) timeRange = 'year';
  else if (/季度|Q[1-4]/.test(question)) timeRange = 'quarter';
  else if (/月|每月/.test(question)) timeRange = 'month';
  else if (/日|每天/.test(question)) timeRange = 'day';
  
  // 匹配规则
  let bestMatch: MatchingRule | null = null;
  let bestScore = 0;
  
  for (const rule of MATCHING_RULES) {
    let score = 0;
    
    // 检查问题关键词
    const keywordMatches = rule.questionKeywords.filter(kw => 
      questionLower.includes(kw.toLowerCase())
    ).length;
    if (keywordMatches === 0 && rule.questionKeywords.length > 0) continue;
    score += keywordMatches * 2;
    
    // 检查意图
    if (!rule.questionIntent.includes(intent)) continue;
    score += 3;
    
    // 检查KPI标签
    if (rule.kpiLabels) {
      const labelMatches = rule.kpiLabels.some(label => 
        kpiLabels.some(kpiLabel => kpiLabel.includes(label.toLowerCase()))
      );
      if (!labelMatches) continue;
      score += 2;
    }
    
    // 检查趋势
    if (rule.kpiHasTrend !== undefined && rule.kpiHasTrend !== kpiHasTrend) continue;
    if (rule.kpiHasTrend === kpiHasTrend) score += 1;
    
    // 检查时间维度
    if (rule.hasTimeDimension !== undefined && rule.hasTimeDimension !== hasTimeDimension) continue;
    if (rule.hasTimeDimension === hasTimeDimension) score += 1;
    
    // 检查分类维度
    if (rule.hasCategoryDimension !== undefined && rule.hasCategoryDimension !== hasCategoryDimension) continue;
    if (rule.hasCategoryDimension === hasCategoryDimension) score += 1;
    
    // 检查时间范围
    if (rule.timeRange && rule.timeRange !== timeRange) continue;
    if (rule.timeRange === timeRange) score += 2;
    
    // 加上规则优先级
    score += rule.priority;
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }
  
  return bestMatch || DEFAULT_RULE;
}

/**
 * 验证匹配是否正确
 */
export interface MatchValidation {
  isValid: boolean;
  confidence: number;        // 匹配置信度 0-1
  reason: string;            // 匹配理由
  alternatives?: string[];   // 备选方案
}

export function validateMatch(
  question: string,
  kpiData: KPIData[],
  chartType: string,
  chartSubtype?: string,
  intent?: IntentType
): MatchValidation {
  if (!intent) {
    return {
      isValid: false,
      confidence: 0,
      reason: '无法识别问题意图'
    };
  }
  
  const rule = matchKpiToChart(question, kpiData, intent);
  
  const isCorrect = rule.recommendedChart.type === chartType && 
    (!rule.recommendedChart.subtype || rule.recommendedChart.subtype === chartSubtype);
  
  return {
    isValid: isCorrect,
    confidence: isCorrect ? 0.9 : 0.3,
    reason: isCorrect 
      ? rule.recommendedChart.reason
      : `建议使用${rule.recommendedChart.type}${rule.recommendedChart.subtype ? ` (${rule.recommendedChart.subtype})` : ''}，而不是${chartType}`,
    alternatives: isCorrect ? undefined : [rule.recommendedChart.type]
  };
}

/**
 * 根据匹配规则生成图表配置
 */
export function generateChartConfig(
  question: string,
  kpiData: KPIData[],
  intent: IntentType
): { type: string; subtype?: string; reason: string } {
  const rule = matchKpiToChart(question, kpiData, intent);
  return rule.recommendedChart;
}

