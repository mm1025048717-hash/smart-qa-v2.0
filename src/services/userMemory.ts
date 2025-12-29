/**
 * 用户记忆服务 - 让 AI 越用越懂用户
 * 存储用户偏好、常用查询、关注指标等
 */

export interface UserMemory {
  // 用户基本信息
  userId: string;
  
  // 关注的指标
  focusMetrics: string[];
  
  // 常用的查询类型
  frequentQueries: { query: string; count: number; lastUsed: Date }[];
  
  // 偏好的数据维度
  preferredDimensions: string[];
  
  // 关注的业务领域
  focusAreas: string[];
  
  // 用户行为特征
  traits: {
    preferDetailedAnalysis: boolean;  // 喜欢详细分析
    preferVisualization: boolean;      // 喜欢图表
    preferQuickAnswer: boolean;        // 喜欢快速回答
    askFollowUp: boolean;              // 经常追问
  };
  
  // 最近的对话主题
  recentTopics: string[];
  
  // 用户反馈偏好
  feedback: {
    likedResponses: string[];
    dislikedPatterns: string[];
  };
  
  // 更新时间
  lastUpdated: Date;
}

const MEMORY_KEY = 'smart-qa-user-memory';

// 默认记忆
const defaultMemory: UserMemory = {
  userId: 'default',
  focusMetrics: [],
  frequentQueries: [],
  preferredDimensions: [],
  focusAreas: [],
  traits: {
    preferDetailedAnalysis: false,
    preferVisualization: true,
    preferQuickAnswer: false,
    askFollowUp: false,
  },
  recentTopics: [],
  feedback: {
    likedResponses: [],
    dislikedPatterns: [],
  },
  lastUpdated: new Date(),
};

// 加载用户记忆
export function loadUserMemory(): UserMemory {
  try {
    const stored = localStorage.getItem(MEMORY_KEY);
    if (stored) {
      const memory = JSON.parse(stored);
      return { ...defaultMemory, ...memory, lastUpdated: new Date(memory.lastUpdated) };
    }
  } catch (e) {
    console.error('Failed to load user memory:', e);
  }
  return { ...defaultMemory };
}

// 保存用户记忆
export function saveUserMemory(memory: UserMemory): void {
  try {
    memory.lastUpdated = new Date();
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch (e) {
    console.error('Failed to save user memory:', e);
  }
}

// 从用户查询中学习
export function learnFromQuery(memory: UserMemory, query: string): UserMemory {
  const newMemory = { ...memory };
  
  // 1. 记录查询频率
  const existingQuery = newMemory.frequentQueries.find(q => q.query === query);
  if (existingQuery) {
    existingQuery.count++;
    existingQuery.lastUsed = new Date();
  } else {
    newMemory.frequentQueries.push({ query, count: 1, lastUsed: new Date() });
  }
  // 保留最近 20 条
  newMemory.frequentQueries = newMemory.frequentQueries
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  
  // 2. 提取关注的指标
  const metricKeywords = ['销售额', '订单量', 'GMV', '转化率', '日活', '月活', '留存率', '客单价', '利润', '营收', '增长率'];
  metricKeywords.forEach(metric => {
    if (query.includes(metric) && !newMemory.focusMetrics.includes(metric)) {
      newMemory.focusMetrics.push(metric);
    }
  });
  newMemory.focusMetrics = newMemory.focusMetrics.slice(0, 10);
  
  // 3. 提取偏好维度
  const dimensionKeywords = ['按地区', '按渠道', '按产品', '按时间', '按门店', '按品类', '同比', '环比'];
  dimensionKeywords.forEach(dim => {
    if (query.includes(dim) && !newMemory.preferredDimensions.includes(dim)) {
      newMemory.preferredDimensions.push(dim);
    }
  });
  newMemory.preferredDimensions = newMemory.preferredDimensions.slice(0, 8);
  
  // 4. 提取业务领域
  const areaKeywords: Record<string, string> = {
    '销售': '销售分析',
    '用户': '用户分析',
    '财务': '财务分析',
    '运营': '运营分析',
    '库存': '库存管理',
    '营销': '营销分析',
  };
  Object.entries(areaKeywords).forEach(([keyword, area]) => {
    if (query.includes(keyword) && !newMemory.focusAreas.includes(area)) {
      newMemory.focusAreas.push(area);
    }
  });
  newMemory.focusAreas = newMemory.focusAreas.slice(0, 5);
  
  // 5. 更新最近话题
  const topic = extractTopic(query);
  if (topic) {
    newMemory.recentTopics = [topic, ...newMemory.recentTopics.filter(t => t !== topic)].slice(0, 5);
  }
  
  // 6. 分析用户行为特征
  if (query.includes('详细') || query.includes('深入') || query.includes('具体')) {
    newMemory.traits.preferDetailedAnalysis = true;
  }
  if (query.includes('图表') || query.includes('可视化') || query.includes('看看')) {
    newMemory.traits.preferVisualization = true;
  }
  if (query.length < 20) {
    newMemory.traits.preferQuickAnswer = true;
  }
  
  saveUserMemory(newMemory);
  return newMemory;
}

// 从查询中提取主题
function extractTopic(query: string): string | null {
  const topicPatterns: [RegExp, string][] = [
    [/销售|GMV|营收/, '销售业绩'],
    [/用户|日活|月活|留存/, '用户指标'],
    [/订单|转化/, '订单分析'],
    [/下降|异常|问题/, '问题诊断'],
    [/趋势|预测/, '趋势预测'],
    [/对比|同比|环比/, '对比分析'],
  ];
  
  for (const [pattern, topic] of topicPatterns) {
    if (pattern.test(query)) {
      return topic;
    }
  }
  return null;
}

// 生成个性化系统提示
export function generateMemoryPrompt(memory: UserMemory): string {
  const parts: string[] = [];
  
  if (memory.focusMetrics.length > 0) {
    parts.push(`用户经常关注这些指标：${memory.focusMetrics.join('、')}`);
  }
  
  if (memory.focusAreas.length > 0) {
    parts.push(`用户主要关注的业务领域：${memory.focusAreas.join('、')}`);
  }
  
  if (memory.preferredDimensions.length > 0) {
    parts.push(`用户喜欢的分析维度：${memory.preferredDimensions.join('、')}`);
  }
  
  if (memory.recentTopics.length > 0) {
    parts.push(`用户最近关注的话题：${memory.recentTopics.join('、')}`);
  }
  
  // 根据用户特征调整回复风格
  const styleHints: string[] = [];
  if (memory.traits.preferDetailedAnalysis) {
    styleHints.push('用户喜欢详细深入的分析，可以多给一些细节');
  }
  if (memory.traits.preferVisualization) {
    styleHints.push('用户喜欢图表，优先用 [chart:JSON] 展示数据');
  }
  if (memory.traits.preferQuickAnswer) {
    styleHints.push('用户喜欢简洁的回答，先给结论再展开');
  }
  
  if (styleHints.length > 0) {
    parts.push(`回复风格建议：${styleHints.join('；')}`);
  }
  
  // 常用查询提示
  const topQueries = memory.frequentQueries.slice(0, 3);
  if (topQueries.length > 0) {
    parts.push(`用户常问的问题：${topQueries.map(q => q.query).join('、')}`);
  }
  
  if (parts.length === 0) {
    return '';
  }
  
  return `\n【用户画像 - 根据历史对话学习】\n${parts.join('\n')}\n\n请根据以上用户特征，提供更个性化的回答。`;
}

// 获取推荐问题
export function getRecommendedQuestions(memory: UserMemory): string[] {
  const recommendations: string[] = [];
  
  // 基于最近话题推荐
  if (memory.recentTopics.includes('销售业绩')) {
    recommendations.push('本月销售额达成情况');
  }
  if (memory.recentTopics.includes('用户指标')) {
    recommendations.push('最近用户活跃度怎么样');
  }
  
  // 基于关注指标推荐
  if (memory.focusMetrics.includes('转化率')) {
    recommendations.push('各渠道转化率对比');
  }
  if (memory.focusMetrics.includes('客单价')) {
    recommendations.push('客单价变化趋势');
  }
  
  // 基于常用查询推荐相关问题
  const topQuery = memory.frequentQueries[0];
  if (topQuery) {
    if (topQuery.query.includes('销售')) {
      recommendations.push('销售额同比增长情况');
    }
  }
  
  // 补充默认推荐
  const defaults = [
    '今天有什么数据异常吗',
    '给我一个业务概览',
    '最近有什么值得关注的趋势',
  ];
  
  return [...new Set([...recommendations, ...defaults])].slice(0, 4);
}

// 清除用户记忆
export function clearUserMemory(): void {
  localStorage.removeItem(MEMORY_KEY);
}













