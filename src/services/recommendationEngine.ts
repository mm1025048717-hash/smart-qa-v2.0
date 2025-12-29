/**
 * 智能推荐引擎
 * 根据主回答内容，动态调整推荐问题，避免重复
 */

export interface RecommendationItem {
  label: string;
  query: string;
  dimension: 'time' | 'space' | 'channel' | 'cause' | 'prediction';
  priority: number; // 优先级 1-10
}

export interface AnswerContent {
  containsQuarterlyData: boolean;
  containsYearComparison: boolean;
  containsRegionalData: boolean;
  containsChannelData: boolean;
  containsTrendAnalysis: boolean;
  mainMetrics: string[];
  timeRange?: { start: Date; end: Date };
}

/**
 * 生成推荐问题列表
 */
export function generateRecommendations(answerContent: AnswerContent): RecommendationItem[] {
  const allRecommendations: RecommendationItem[] = [
    // 时间维度
    { label: '季度分析', query: '各季度销售额对比', dimension: 'time', priority: 8 },
    { label: '月度趋势', query: '各月销售额趋势', dimension: 'time', priority: 7 },
    { label: '对比去年同期', query: '对比去年同期销售额', dimension: 'time', priority: 6 },
    
    // 空间维度
    { label: '查看地区分布', query: '各地区销售额对比', dimension: 'space', priority: 9 },
    { label: '城市排名', query: '销售额排名前10的城市', dimension: 'space', priority: 7 },
    
    // 渠道维度
    { label: '分析渠道构成', query: '各渠道销售额占比', dimension: 'channel', priority: 8 },
    { label: '渠道增长分析', query: '各渠道销售额增长情况', dimension: 'channel', priority: 6 },
    
    // 原因分析
    { label: '分析增长来源', query: '分析销售额增长原因', dimension: 'cause', priority: 9 },
    { label: '异常分析', query: '销售额异常波动分析', dimension: 'cause', priority: 5 },
    
    // 预测
    { label: '预测下月趋势', query: '预测下月销售额', dimension: 'prediction', priority: 7 },
    { label: '年度预测', query: '预测全年销售额', dimension: 'prediction', priority: 6 },
  ];
  
  // 过滤已包含的维度
  const filteredRecommendations = allRecommendations.filter(rec => {
    // 如果主回答已包含季度数据，过滤掉时间维度的重复推荐
    if (answerContent.containsQuarterlyData && rec.dimension === 'time') {
      // 但保留"月度趋势"（更细粒度）
      return rec.label === '月度趋势';
    }
    
    // 如果主回答已包含年度对比，过滤掉"对比去年同期"
    if (answerContent.containsYearComparison && rec.label === '对比去年同期') {
      return false;
    }
    
    // 如果主回答已包含地区数据，过滤掉空间维度推荐
    if (answerContent.containsRegionalData && rec.dimension === 'space') {
      return false;
    }
    
    // 如果主回答已包含渠道数据，过滤掉渠道维度推荐
    if (answerContent.containsChannelData && rec.dimension === 'channel') {
      return false;
    }
    
    return true;
  });
  
  // 按优先级排序，取前3-4个
  return filteredRecommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);
}

/**
 * 从内容块中提取答案特征
 */
export function extractAnswerContent(blocks: any[]): AnswerContent {
  const content: AnswerContent = {
    containsQuarterlyData: false,
    containsYearComparison: false,
    containsRegionalData: false,
    containsChannelData: false,
    containsTrendAnalysis: false,
    mainMetrics: [],
  };
  
  for (const block of blocks) {
    // 检查KPI数据
    if (block.type === 'kpi' || block.type === 'kpi-group') {
      const kpiData = Array.isArray(block.data) ? block.data : [block.data];
      for (const kpi of kpiData) {
        const label = (kpi.label || '').toLowerCase();
        
        // 检查季度数据
        if (/Q[1-4]|季度|q[1-4]/.test(label)) {
          content.containsQuarterlyData = true;
        }
        
        // 检查年度对比
        if (/同比|环比|对比|比较/.test(label) || /2024.*2023|今年.*去年/.test(label)) {
          content.containsYearComparison = true;
        }
        
        // 检查地区数据
        if (/地区|区域|城市|省份/.test(label)) {
          content.containsRegionalData = true;
        }
        
        // 检查渠道数据
        if (/渠道/.test(label)) {
          content.containsChannelData = true;
        }
        
        // 提取指标
        if (kpi.label) {
          content.mainMetrics.push(kpi.label);
        }
      }
    }
    
    // 检查图表数据
    if (block.type === 'line-chart' || block.type === 'bar-chart' || block.type === 'pie-chart') {
      const chartData = block.data;
      
      // 检查年度对比图
      if (chartData?.type === 'year-comparison' || 
          chartData?.title?.includes('年度') || 
          chartData?.title?.includes('对比')) {
        content.containsYearComparison = true;
      }
      
      // 检查趋势图
      if (block.type === 'line-chart' || chartData?.title?.includes('趋势')) {
        content.containsTrendAnalysis = true;
      }
      
      // 检查地区相关图表
      if (chartData?.title?.includes('地区') || chartData?.title?.includes('区域')) {
        content.containsRegionalData = true;
      }
      
      // 检查渠道相关图表
      if (chartData?.title?.includes('渠道')) {
        content.containsChannelData = true;
      }
    }
    
    // 检查文本内容
    if (block.type === 'text' && typeof block.data === 'string') {
      const text = block.data.toLowerCase();
      if (/季度|Q[1-4]/.test(text)) content.containsQuarterlyData = true;
      if (/同比|环比|对比/.test(text)) content.containsYearComparison = true;
      if (/地区|区域/.test(text)) content.containsRegionalData = true;
      if (/渠道/.test(text)) content.containsChannelData = true;
      if (/趋势|变化|走势/.test(text)) content.containsTrendAnalysis = true;
    }
  }
  
  return content;
}

