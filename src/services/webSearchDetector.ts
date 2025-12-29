/**
 * 联网搜索意图识别器
 * 通过自然语言判断用户是否需要联网搜索
 */

// 需要联网搜索的关键词和模式
const WEB_SEARCH_KEYWORDS = {
  // 搜索类关键词
  search: ['搜索', '查找', '找一下', '帮我找', '搜一下', '查一下', '检索'],
  
  // 最新信息类
  latest: ['最新', '最近', '当前', '现在', '实时', '今天', '本周', '本月', '今年'],
  
  // 外部信息类
  external: [
    '行业报告', '市场报告', '研究报告', '分析报告', '发展报告', '年度报告', '季度报告',
    '行业分析', '市场分析', '竞品分析', '深度分析', '综合分析',
    '报告', '出报告', '生成报告', '写报告', '做报告', '给我报告',
    '新闻', '资讯', '动态', '趋势', '行情',
    '竞品', '竞争对手', '同行', '市场',
    '政策', '法规', '规定', '标准',
    '价格', '报价', '行情价', '市场价',
    '技术文档', '官方文档', 'API文档', '帮助文档',
    '经济', '宏观经济', '行业', '市场', '产业',
  ],
  
  // 实时数据类
  realtime: [
    '实时数据', '最新数据', '当前数据', '现在数据',
    '实时价格', '最新价格', '当前价格',
    '实时行情', '最新行情', '当前行情',
  ],
  
  // 网络资源类
  web: [
    '网站', '网页', '链接', 'URL', '网址',
    '在线', '网络', '互联网', '网上',
  ],
  
  // 查询外部信息
  query: [
    '是什么', '什么意思', '定义', '解释',
    '如何', '怎么', '方法', '教程', '指南',
  ],
};

// 不需要联网的关键词（内部数据相关）
// 注意：这些关键词只有在明确是内部数据查询时才排除联网
const INTERNAL_KEYWORDS = [
  '销售额', '订单', '用户', '客户', '指标',
  'SQL', '查询', '数据库', '内部', '公司', '业务',
  '我们的', '本公司', '公司内部', '内部数据',
];

// 报告相关关键词（需要联网）
const REPORT_KEYWORDS = [
  '报告', '出报告', '生成报告', '写报告', '做报告', '给我报告',
  '行业报告', '市场报告', '研究报告', '分析报告', '发展报告',
  '年度报告', '季度报告', '月度报告',
];

/**
 * 检测是否需要联网搜索
 * @param query 用户查询
 * @returns 是否需要联网搜索
 */
export function shouldEnableWebSearch(query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  
  // 0. 最高优先级：检查是否是报告相关查询（需要联网）
  const hasReportKeyword = REPORT_KEYWORDS.some(kw => 
    normalizedQuery.includes(kw)
  );
  
  if (hasReportKeyword) {
    // 报告相关查询通常需要联网获取最新数据
    // 除非明确说是"内部报告"或"公司报告"
    const isInternalReport = normalizedQuery.includes('内部报告') || 
                              normalizedQuery.includes('公司报告') ||
                              normalizedQuery.includes('我们的报告');
    if (!isInternalReport) {
      return true;
    }
  }
  
  // 1. 检查是否明确要求搜索
  const hasSearchKeyword = WEB_SEARCH_KEYWORDS.search.some(kw => 
    normalizedQuery.includes(kw)
  );
  
  if (hasSearchKeyword) {
    // 如果明确要求搜索，且不是内部数据查询，则需要联网
    const isInternalQuery = INTERNAL_KEYWORDS.some(kw => 
      normalizedQuery.includes(kw)
    );
    if (!isInternalQuery) {
      return true;
    }
  }
  
  // 2. 检查是否涉及外部信息
  const hasExternalKeyword = [
    ...WEB_SEARCH_KEYWORDS.external,
    ...WEB_SEARCH_KEYWORDS.realtime,
    ...WEB_SEARCH_KEYWORDS.web,
  ].some(kw => normalizedQuery.includes(kw));
  
  if (hasExternalKeyword) {
    // 检查是否同时包含内部数据关键词（可能是内部数据分析，不需要联网）
    const hasInternalKeyword = INTERNAL_KEYWORDS.some(kw => 
      normalizedQuery.includes(kw)
    );
    // 如果只有外部关键词，没有内部关键词，则需要联网
    if (!hasInternalKeyword) {
      return true;
    }
  }
  
  // 3. 检查是否要求最新信息
  const hasLatestKeyword = WEB_SEARCH_KEYWORDS.latest.some(kw => 
    normalizedQuery.includes(kw)
  );
  
  if (hasLatestKeyword) {
    // 如果要求最新信息，且涉及外部信息，则需要联网
    const hasExternalInfo = WEB_SEARCH_KEYWORDS.external.some(kw => 
      normalizedQuery.includes(kw)
    );
    if (hasExternalInfo) {
      return true;
    }
  }
  
  // 4. 检查特定模式
  // 模式：搜索 + 外部信息
  if (hasSearchKeyword && hasExternalKeyword) {
    return true;
  }
  
  // 模式：最新 + 外部信息
  if (hasLatestKeyword && hasExternalKeyword) {
    return true;
  }
  
  // 5. 检查是否明确是内部数据查询
  const isInternalDataQuery = INTERNAL_KEYWORDS.some(kw => 
    normalizedQuery.includes(kw)
  ) && !hasExternalKeyword && !hasReportKeyword;
  
  if (isInternalDataQuery) {
    return false;
  }
  
  // 默认不联网（保守策略）
  return false;
}

/**
 * 获取联网搜索的置信度（0-1）
 */
export function getWebSearchConfidence(query: string): number {
  const normalizedQuery = query.trim().toLowerCase();
  let score = 0;
  
  // 明确搜索关键词 +0.5
  if (WEB_SEARCH_KEYWORDS.search.some(kw => normalizedQuery.includes(kw))) {
    score += 0.5;
  }
  
  // 外部信息关键词 +0.3
  if (WEB_SEARCH_KEYWORDS.external.some(kw => normalizedQuery.includes(kw))) {
    score += 0.3;
  }
  
  // 最新信息关键词 +0.2
  if (WEB_SEARCH_KEYWORDS.latest.some(kw => normalizedQuery.includes(kw))) {
    score += 0.2;
  }
  
  // 实时数据关键词 +0.2
  if (WEB_SEARCH_KEYWORDS.realtime.some(kw => normalizedQuery.includes(kw))) {
    score += 0.2;
  }
  
  // 内部数据关键词 -0.5（降低联网需求）
  if (INTERNAL_KEYWORDS.some(kw => normalizedQuery.includes(kw))) {
    score -= 0.5;
  }
  
  return Math.max(0, Math.min(1, score));
}

