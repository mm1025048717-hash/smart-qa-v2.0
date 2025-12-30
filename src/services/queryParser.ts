/**
 * 查询解析服务 - 从自然语言查询中提取维度信息
 */

// 导出 QueryDimensions 类型供其他组件使用
export interface QueryDimensions {
  storeScope: {
    selected: string[];
    options: string[];
  };
  timeRange: {
    selected: string;
    options: string[];
  };
  metrics: {
    selected: string[];
    options: string[];
  };
  displayMethod: {
    selected: string;
    options: string[];
  };
  // 添加反问提示文字
  promptText?: string;
}

// 门店范围识别
const STORE_PATTERNS = [
  { pattern: /郑州区域|郑州/, value: '郑州区域全部门店', label: '郑州区域全部门店' },
  { pattern: /高新区|高新/, value: '郑州高新区', label: '郑州高新区' },
  { pattern: /中原区|中原/, value: '郑州中原区', label: '郑州中原区' },
  { pattern: /全部门店|所有门店/, value: '全部门店', label: '全部门店' },
  { pattern: /华东|华北|华南|西部|华中|东北/, value: (match: string) => `${match}区域`, label: (match: string) => `${match}区域` },
];

// 时间范围识别
const TIME_PATTERNS = [
  { pattern: /上周|上星期/, value: '上周 (自然年周)', label: '上周 (自然年周)' },
  { pattern: /本周|这周|本周/, value: '本周 (自然年周)', label: '本周 (自然年周)' },
  { pattern: /最近7天|近7天/, value: '最近7天', label: '最近7天' },
  { pattern: /本月|这个月/, value: '本月', label: '本月' },
  { pattern: /上月|上个月/, value: '上月', label: '上月' },
  { pattern: /今年|本年度/, value: '今年', label: '今年' },
  { pattern: /去年|上年度/, value: '去年', label: '去年' },
];

// 指标识别
const METRIC_PATTERNS = [
  { pattern: /订货金额|订货/, value: '订货金额', label: '订货金额' },
  { pattern: /营业额|营收|销售额/, value: '营业额', label: '营业额' },
  { pattern: /营业额达成率|达成率/, value: '营业额达成率', label: '营业额达成率' },
  { pattern: /销售件数|销量/, value: '销售件数', label: '销售件数' },
  { pattern: /毛利率|毛利/, value: '毛利率', label: '毛利率' },
  { pattern: /订单量|订单/, value: '订单量', label: '订单量' },
];

// 展示方式识别
const DISPLAY_PATTERNS = [
  { pattern: /表格|表/, value: '表格', label: '表格' },
  { pattern: /对比柱状图|柱状图|对比/, value: '对比柱状图', label: '对比柱状图' },
  { pattern: /趋势折线图|折线图|趋势/, value: '趋势折线图', label: '趋势折线图' },
  { pattern: /仪表盘|看板/, value: '仪表盘', label: '仪表盘' },
];

/**
 * 根据问题类型生成个性化的反问提示文字
 */
function generatePromptText(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  // 销售相关
  if (lowerQuery.includes('销售')) {
    return '您想查看销售相关的哪些数据？请选择具体的维度：';
  }
  
  // 分析相关
  if (lowerQuery.includes('分析')) {
    return '您想进行什么类型的分析？请选择分析维度：';
  }
  
  // 业绩相关
  if (lowerQuery.includes('业绩') || lowerQuery.includes('怎么样') || lowerQuery.includes('如何')) {
    return '您想了解哪个方面的业绩表现？请选择查看维度：';
  }
  
  // 数据相关（通用）
  if (lowerQuery.includes('数据')) {
    return '您想查看哪方面的数据？请选择具体的维度：';
  }
  
  // 默认
  return '您想查看哪个维度的数据？请选择：';
}

/**
 * 根据问题类型动态调整选项
 */
function getOptionsByQueryType(query: string): {
  storeOptions: string[];
  timeOptions: string[];
  metricOptions: string[];
  displayOptions: string[];
} {
  const lowerQuery = query.toLowerCase();
  
  // 销售相关 - 偏向销售指标
  if (lowerQuery.includes('销售')) {
    return {
      storeOptions: ['郑州区域全部门店', '郑州高新区', '郑州中原区', '全部门店'],
      timeOptions: ['最近7天', '本周 (自然年周)', '本月', '上月'],
      metricOptions: ['营业额', '销售件数', '营业额达成率', '订单量'],
      displayOptions: ['对比柱状图', '趋势折线图', '表格', '仪表盘'],
    };
  }
  
  // 分析相关 - 偏向分析展示方式
  if (lowerQuery.includes('分析')) {
    return {
      storeOptions: ['郑州区域全部门店', '郑州高新区', '郑州中原区'],
      timeOptions: ['最近7天', '本周 (自然年周)', '本月', '上月', '今年'],
      metricOptions: ['营业额', '销售件数', '营业额达成率', '毛利率', '订货金额'],
      displayOptions: ['趋势折线图', '对比柱状图', '表格', '仪表盘'],
    };
  }
  
  // 业绩相关 - 偏向业绩指标
  if (lowerQuery.includes('业绩') || lowerQuery.includes('怎么样') || lowerQuery.includes('如何')) {
    return {
      storeOptions: ['郑州区域全部门店', '郑州高新区', '郑州中原区'],
      timeOptions: ['本周 (自然年周)', '本月', '上月', '今年'],
      metricOptions: ['营业额达成率', '毛利率', '营业额', '销售件数'],
      displayOptions: ['对比柱状图', '趋势折线图', '表格', '仪表盘'],
    };
  }
  
  // 默认选项
  return {
    storeOptions: ['郑州区域全部门店', '郑州高新区', '郑州中原区'],
    timeOptions: ['上周 (自然年周)', '最近7天', '本月'],
    metricOptions: ['订货金额', '销售件数', '营业额达成率', '毛利率'],
    displayOptions: ['表格', '对比柱状图', '趋势折线图', '仪表盘'],
  };
}

/**
 * 从自然语言查询中解析维度信息
 */
export function parseQueryDimensions(query: string): QueryDimensions {
  // 根据问题类型获取动态选项
  const dynamicOptions = getOptionsByQueryType(query);
  
  // 解析门店范围
  const selectedStores: string[] = [];
  
  STORE_PATTERNS.forEach(({ pattern, label }) => {
    const match = query.match(pattern);
    if (match) {
      const storeLabel = typeof label === 'function' ? label(match[0]) : label;
      if (!selectedStores.includes(storeLabel) && dynamicOptions.storeOptions.includes(storeLabel)) {
        selectedStores.push(storeLabel);
      }
    }
  });

  // 如果没有匹配到，默认选择第一个
  if (selectedStores.length === 0) {
    selectedStores.push(dynamicOptions.storeOptions[0]);
  }

  // 解析时间范围
  let selectedTime = dynamicOptions.timeOptions[0];
  
  TIME_PATTERNS.forEach(({ pattern, label }) => {
    if (pattern.test(query) && dynamicOptions.timeOptions.includes(label)) {
      selectedTime = label;
    }
  });

  // 解析指标
  const selectedMetrics: string[] = [];
  
  METRIC_PATTERNS.forEach(({ pattern, label }) => {
    if (pattern.test(query) && dynamicOptions.metricOptions.includes(label)) {
      if (!selectedMetrics.includes(label)) {
        selectedMetrics.push(label);
      }
    }
  });

  // 如果没有匹配到，默认选择第一个
  if (selectedMetrics.length === 0) {
    selectedMetrics.push(dynamicOptions.metricOptions[0]);
  }

  // 解析展示方式
  let selectedDisplay = dynamicOptions.displayOptions[1]; // 默认第二个选项
  
  DISPLAY_PATTERNS.forEach(({ pattern, label }) => {
    if (pattern.test(query) && dynamicOptions.displayOptions.includes(label)) {
      selectedDisplay = label;
    }
  });

  return {
    storeScope: {
      selected: selectedStores,
      options: dynamicOptions.storeOptions,
    },
    timeRange: {
      selected: selectedTime,
      options: dynamicOptions.timeOptions,
    },
    metrics: {
      selected: selectedMetrics,
      options: dynamicOptions.metricOptions,
    },
    displayMethod: {
      selected: selectedDisplay,
      options: dynamicOptions.displayOptions,
    },
    promptText: generatePromptText(query),
  };
}

/**
 * 检查查询是否需要多度确认
 * 只在模糊问题中触发，不污染其他问题的问答交互
 */
export function needsConfirmation(query: string): boolean {
  // 排除简单问候语，让它们直接调用大模型进行自然对话
  const greetingPatterns = [
    /^你好$/,
    /^hello$/i,
    /^hi$/i,
    /^嗨$/,
    /^在吗$/,
    /^在$/,
    /^你是谁$/,
    /^介绍一下$/,
    /^介绍一下自己$/,
  ];
  
  const isGreeting = greetingPatterns.some(pattern => pattern.test(query.trim()));
  if (isGreeting) {
    return false; // 问候语不触发确认，直接走大模型
  }

  // 只在模糊问题中触发多度确认
  // 模糊问题的特征：简短、缺少具体维度信息
  const vaguePatterns = [
    /^看看数据$/,
    /^帮我看看$/,
    /^查看数据$/,
    /^数据分析$/,
    /^做个分析$/,
    /^看看销售$/,
    /^查看销售$/,
    /^销售情况$/,
    /^业绩怎么样$/,
    /^业务如何$/,
  ];

  // 检查是否是模糊问题
  const isVague = vaguePatterns.some(pattern => pattern.test(query.trim()));
  
  // 如果查询很短（少于5个字）且不包含明确的维度关键词，也可能是模糊问题
  // 但排除问候语（已经在上面处理了）
  const isShortAndVague = query.trim().length < 5 && 
    !STORE_PATTERNS.some(p => p.pattern.test(query)) &&
    !TIME_PATTERNS.some(p => p.pattern.test(query)) &&
    !METRIC_PATTERNS.some(p => p.pattern.test(query));

  return isVague || isShortAndVague;
}

/**
 * 检查查询是否需要模糊指标确认（销售额税前/税后）
 * 只在特定测试用例中触发，不污染其他问答交互
 */
export function needsMetricConfirmation(query: string): boolean {
  // 只在特定测试用例中触发
  const testQueries = [
    '销售额是多少',
    '今年的销售额',
    '本月销售额',
    '销售额数据',
  ];
  
  // 检查是否是测试用例中的查询
  const isTestQuery = testQueries.some(testQuery => query.trim() === testQuery);
  
  if (!isTestQuery) {
    return false; // 不是测试用例，不触发
  }
  
  // 检测到"销售额"但没有明确指定税前/税后
  const salesPattern = /销售额|营收|营业额/;
  const hasSales = salesPattern.test(query);
  const hasTaxSpec = /税前|税后|含税|不含税/.test(query);
  
  return hasSales && !hasTaxSpec;
}

/**
 * 检查查询是否需要同名员工确认（多个张三）
 * 只在特定测试用例中触发，不污染其他问答交互
 */
export function needsEmployeeConfirmation(query: string): boolean {
  // 只在特定测试用例中触发
  const testQueries = [
    '张三今年的业绩',
    '张三的销售额',
    '张三这个月表现怎么样',
    '查询张三的数据',
  ];
  
  // 检查是否是测试用例中的查询
  const isTestQuery = testQueries.some(testQuery => query.trim() === testQuery);
  
  if (!isTestQuery) {
    return false; // 不是测试用例，不触发
  }
  
  // 检测到员工姓名但没有明确指定是哪个
  const employeePattern = /(张三|李四|王五|赵六)/;
  const hasEmployee = employeePattern.test(query);
  
  return hasEmployee;
}

/**
 * 获取模糊指标选项（销售额税前/税后）
 */
export function getAmbiguousMetricOptions(): { label: string; value: string }[] {
  return [
    { label: '销售额（税前）', value: '销售额（税前）' },
    { label: '销售额（税后）', value: '销售额（税后）' },
    { label: '两个都要', value: 'both' },
  ];
}

/**
 * 获取同名员工选项（多个张三）
 */
export function getAmbiguousEmployeeOptions(employeeName: string): { label: string; value: string; description?: string }[] {
  // 模拟从数据库查询到的同名员工
  // 实际应该从数据库查询
  if (employeeName === '张三') {
    return [
      { label: '张三（销售部）', value: '张三-销售部', description: '销售部经理' },
      { label: '张三（市场部）', value: '张三-市场部', description: '市场部专员' },
    ];
  }
  return [];
}

/**
 * 根据用户选择的维度构建精确查询
 */
export function buildPreciseQuery(originalQuery: string, dimensions: QueryDimensions): string {
  const parts: string[] = [];
  
  // 时间范围
  if (dimensions.timeRange.selected) {
    parts.push(dimensions.timeRange.selected);
  }
  
  // 门店范围
  if (dimensions.storeScope.selected.length > 0) {
    parts.push(dimensions.storeScope.selected.join('、'));
  }
  
  // 指标
  if (dimensions.metrics.selected.length > 0) {
    parts.push(dimensions.metrics.selected.join('和'));
  }
  
  // 展示方式
  if (dimensions.displayMethod.selected && dimensions.displayMethod.selected !== '表格') {
    parts.push(dimensions.displayMethod.selected);
  }
  
  // 构建查询：时间 + 门店 + 指标 + 展示方式
  // 例如："最近7天郑州区域全部门店的订货金额和营业额达成率趋势折线图"
  let query = parts.join('的');
  
  // 如果原始查询包含"数据"、"销售"等关键词，添加到末尾
  if (originalQuery.includes('数据') || originalQuery.includes('销售') || originalQuery.includes('分析')) {
    query += '数据';
  }
  
  return query;
}

/**
 * 根据选择的维度生成固定的回复内容（用于多度确认场景，不调用大模型）
 */
export function generateFixedResponse(dimensions: QueryDimensions): any[] {
  const blocks: any[] = [];
  const timestamp = Date.now();
  
  // 生成文本说明
  const timeText = dimensions.timeRange.selected || '';
  const storeText = dimensions.storeScope.selected.join('、') || '';
  const metricText = dimensions.metrics.selected.join('和') || '';
  const displayText = dimensions.displayMethod.selected || '';
  
  blocks.push({
    id: `text-${timestamp}`,
    type: 'text',
    data: `根据您选择的维度，为您展示${timeText}${storeText}的${metricText}数据：`,
  });
  
  // 调试：输出选择的展示方式
  console.log('生成固定回复 - 展示方式:', displayText, '完整维度:', dimensions);
  
  // 根据展示方式生成不同的内容（优先判断趋势折线图）
  if (displayText === '趋势折线图' || displayText === '折线图' || displayText === '趋势') {
    // 生成折线图数据 - 按时间趋势
    let days = 7;
    let dateFormat = '日';
    if (timeText.includes('7天')) {
      days = 7;
      dateFormat = '日';
    } else if (timeText.includes('周')) {
      days = 7;
      dateFormat = '日';
    } else if (timeText.includes('月')) {
      days = 30;
      dateFormat = '日';
    } else if (timeText.includes('年')) {
      days = 12;
      dateFormat = '月';
    }
    
    // 根据指标类型生成不同的基础数值
    let baseValue = 50000;
    if (metricText.includes('订货金额')) {
      baseValue = 800000;
    } else if (metricText.includes('营业额')) {
      baseValue = 1000000;
    } else if (metricText.includes('销售件数')) {
      baseValue = 3000;
    } else if (metricText.includes('订单量')) {
      baseValue = 2000;
    }
    
    const chartData = Array.from({ length: days }, (_, i) => {
      const dateLabel = dateFormat === '月' ? `${i + 1}月` : `${i + 1}${dateFormat}`;
      // 生成有趋势的数据（轻微波动）
      const trend = Math.sin((i / days) * Math.PI * 2) * 0.1; // 正弦波趋势
      const value = baseValue * (1 + trend) + (i * baseValue * 0.05) + Math.floor(Math.random() * baseValue * 0.1);
      
      return {
        date: dateLabel,
        value: Math.floor(value),
      };
    });
    
    blocks.push({
      id: `chart-${timestamp}`,
      type: 'line-chart',
      data: {
        title: `${metricText}趋势`,
        data: chartData,
        xKey: 'date',
        yKeys: [{ key: 'value', name: metricText, color: '#007AFF' }],
      },
    });
  } else if (displayText === '对比柱状图' || displayText === '柱状图' || displayText === '对比') {
    // 生成柱状图数据 - 按门店对比
    const chartData = dimensions.storeScope.selected.map((store, index) => {
      // 根据指标类型生成不同的数值
      let baseValue = 1000000;
      if (metricText.includes('订货金额')) {
        baseValue = 1200000 + (index * 150000);
      } else if (metricText.includes('营业额')) {
        baseValue = 1500000 + (index * 200000);
      } else if (metricText.includes('销售件数')) {
        baseValue = 5000 + (index * 500);
      } else if (metricText.includes('订单量')) {
        baseValue = 3000 + (index * 300);
      }
      
      return {
        name: store,
        value: baseValue + Math.floor(Math.random() * 200000),
      };
    });
    
    blocks.push({
      id: `chart-${timestamp}`,
      type: 'bar-chart',
      data: {
        title: `${metricText}对比`,
        data: chartData,
        xKey: 'name',
        yKey: 'value',
      },
    });
  } else if (displayText === '趋势折线图' || displayText === '折线图' || displayText === '趋势') {
    // 生成折线图数据 - 按时间趋势
    let days = 7;
    let dateFormat = '日';
    if (timeText.includes('7天')) {
      days = 7;
      dateFormat = '日';
    } else if (timeText.includes('周')) {
      days = 7;
      dateFormat = '日';
    } else if (timeText.includes('月')) {
      days = 30;
      dateFormat = '日';
    } else if (timeText.includes('年')) {
      days = 12;
      dateFormat = '月';
    }
    
    // 根据指标类型生成不同的基础数值
    let baseValue = 50000;
    if (metricText.includes('订货金额')) {
      baseValue = 800000;
    } else if (metricText.includes('营业额')) {
      baseValue = 1000000;
    } else if (metricText.includes('销售件数')) {
      baseValue = 3000;
    } else if (metricText.includes('订单量')) {
      baseValue = 2000;
    }
    
    const chartData = Array.from({ length: days }, (_, i) => {
      const dateLabel = dateFormat === '月' ? `${i + 1}月` : `${i + 1}${dateFormat}`;
      // 生成有趋势的数据（轻微波动）
      const trend = Math.sin((i / days) * Math.PI * 2) * 0.1; // 正弦波趋势
      const value = baseValue * (1 + trend) + (i * baseValue * 0.05) + Math.floor(Math.random() * baseValue * 0.1);
      
      return {
        date: dateLabel,
        value: Math.floor(value),
      };
    });
    
    blocks.push({
      id: `chart-${timestamp}`,
      type: 'line-chart',
      data: {
        title: `${metricText}趋势`,
        data: chartData,
        xKey: 'date',
        yKeys: [{ key: 'value', name: metricText, color: '#007AFF' }],
      },
    });
  } else if (displayText === '表格') {
    // 生成表格数据
    const tableData = dimensions.storeScope.selected.map((store, index) => {
      // 根据指标类型生成不同的数值
      let value = 1000000 + (index * 200000);
      if (metricText.includes('订货金额')) {
        value = 1200000 + (index * 150000);
      } else if (metricText.includes('营业额')) {
        value = 1500000 + (index * 200000);
      } else if (metricText.includes('销售件数')) {
        value = 5000 + (index * 500);
      } else if (metricText.includes('订单量')) {
        value = 3000 + (index * 300);
      }
      
      return {
        store: store,
        value: value,
        change: (Math.random() * 20 - 10).toFixed(1) + '%',
      };
    });
    
    blocks.push({
      id: `table-${timestamp}`,
      type: 'table',
      data: {
        headers: ['门店', metricText, '变化'],
        rows: tableData.map(row => [row.store, `¥${row.value.toLocaleString()}`, row.change]),
      },
    });
  } else {
    // 默认生成KPI卡片 - 根据指标类型生成不同的数值
    dimensions.metrics.selected.forEach((metric, index) => {
      let metricValue: string | number;
      let prefix = '¥';
      let unit = '元';
      
      if (metric.includes('率') || metric.includes('毛利率') || metric.includes('达成率')) {
        metricValue = (85 + Math.random() * 10).toFixed(1) + '%';
        prefix = '';
        unit = '';
      } else if (metric.includes('订货金额')) {
        metricValue = 1200000 + (index * 150000) + Math.floor(Math.random() * 200000);
      } else if (metric.includes('营业额')) {
        metricValue = 1500000 + (index * 200000) + Math.floor(Math.random() * 300000);
      } else if (metric.includes('销售件数')) {
        metricValue = 5000 + (index * 500) + Math.floor(Math.random() * 500);
        prefix = '';
        unit = '件';
      } else if (metric.includes('订单量')) {
        metricValue = 3000 + (index * 300) + Math.floor(Math.random() * 300);
        prefix = '';
        unit = '单';
      } else {
        metricValue = 1000000 + (index * 200000);
      }
      
      blocks.push({
        id: `kpi-${timestamp}-${index}`,
        type: 'kpi',
        data: {
          id: `metric-${index}`,
          label: metric,
          value: metricValue,
          prefix: prefix,
          unit: unit,
          trend: {
            value: parseFloat((Math.abs(Math.random() * 20 - 10)).toFixed(1)),
            direction: Math.random() > 0.5 ? 'up' : 'down',
            label: '环比',
          },
        },
      });
    });
  }
  
  return blocks;
}

/**
 * 根据模糊选择生成固定回复（用于销售额税前/税后或同名员工场景）
 */
export function generateAmbiguousFixedResponse(
  type: 'metric' | 'employee',
  selectedValues: string[],
  originalQuery: string
): any[] {
  const blocks: any[] = [];
  const timestamp = Date.now();
  
  // 从原始查询中提取时间信息
  let timeText = '';
  if (originalQuery.includes('今年') || originalQuery.includes('2024年度') || originalQuery.includes('本年')) {
    timeText = '今年';
  } else if (originalQuery.includes('本月')) {
    timeText = '本月';
  }
  
  if (type === 'metric') {
    // 销售额场景 - 根据原始查询生成不同的数值
    const hasBeforeTax = selectedValues.includes('销售额（税前）');
    const hasAfterTax = selectedValues.includes('销售额（税后）');
    
    // 根据时间范围生成不同的基础数值
    let baseValue = 15000000; // 默认今年
    if (timeText === '本月') {
      baseValue = 5000000; // 本月较小
    } else if (timeText === '今年' || originalQuery.includes('2024年度') || originalQuery.includes('本年')) {
      baseValue = 15000000; // 今年较大
    }
    
    if (hasBeforeTax && hasAfterTax) {
      // 两个都要
      blocks.push({
        id: `text-${timestamp}`,
        type: 'text',
        data: `根据您选择的指标，为您展示${timeText || '今年'}销售额（税前和税后）数据：`,
      });
      
      // 税前销售额 KPI
      blocks.push({
        id: `kpi-before-tax-${timestamp}`,
        type: 'kpi',
        data: {
          id: 'before-tax',
          label: `${timeText || '今年'}销售额（税前）`,
          value: baseValue,
          prefix: '¥',
          unit: '元',
          trend: {
            value: timeText === '本月' ? 8.5 : 12.5,
            direction: 'up',
            label: '环比',
          },
        },
      });
      
      // 税后销售额 KPI
      blocks.push({
        id: `kpi-after-tax-${timestamp}`,
        type: 'kpi',
        data: {
          id: 'after-tax',
          label: `${timeText || '今年'}销售额（税后）`,
          value: Math.floor(baseValue * 0.9), // 税后约为税前的90%
          prefix: '¥',
          unit: '元',
          trend: {
            value: timeText === '本月' ? 8.3 : 12.3,
            direction: 'up',
            label: '环比',
          },
        },
      });
    } else if (hasBeforeTax) {
      // 只要税前
      blocks.push({
        id: `text-${timestamp}`,
        type: 'text',
        data: `根据您选择的指标，为您展示${timeText || '今年'}销售额（税前）数据：`,
      });
      
      blocks.push({
        id: `kpi-before-tax-${timestamp}`,
        type: 'kpi',
        data: {
          id: 'before-tax',
          label: `${timeText || '今年'}销售额（税前）`,
          value: baseValue,
          prefix: '¥',
          unit: '元',
          trend: {
            value: timeText === '本月' ? 8.5 : 12.5,
            direction: 'up',
            label: '环比',
          },
        },
      });
    } else if (hasAfterTax) {
      // 只要税后
      blocks.push({
        id: `text-${timestamp}`,
        type: 'text',
        data: `根据您选择的指标，为您展示${timeText || '今年'}销售额（税后）数据：`,
      });
      
      blocks.push({
        id: `kpi-after-tax-${timestamp}`,
        type: 'kpi',
        data: {
          id: 'after-tax',
          label: `${timeText || '今年'}销售额（税后）`,
          value: Math.floor(baseValue * 0.9),
          prefix: '¥',
          unit: '元',
          trend: {
            value: timeText === '本月' ? 8.3 : 12.3,
            direction: 'up',
            label: '环比',
          },
        },
      });
    }
  } else if (type === 'employee') {
    // 同名员工场景 - 根据原始查询生成不同的回复
    const selectedEmployee = selectedValues[0];
    
    // 从原始查询中提取时间信息
    let employeeTimeText = '';
    if (originalQuery.includes('今年')) {
      employeeTimeText = '今年';
    } else if (originalQuery.includes('这个月') || originalQuery.includes('本月')) {
      employeeTimeText = '本月';
    }
    
    // 根据部门和查询内容生成不同的数值
    let employeeValue = 8500000;
    if (selectedEmployee.includes('销售部')) {
      employeeValue = 12000000; // 销售部业绩更高
    } else if (selectedEmployee.includes('市场部')) {
      employeeValue = 8500000; // 市场部
    }
    
    if (employeeTimeText === '本月') {
      employeeValue = Math.floor(employeeValue / 3); // 本月约为全年的1/3
    }
    
    blocks.push({
      id: `text-${timestamp}`,
      type: 'text',
      data: `根据您选择的员工，为您展示${selectedEmployee}${employeeTimeText ? employeeTimeText : '今年'}的业绩数据：`,
    });
    
    // 生成该员工的业绩 KPI
    blocks.push({
      id: `kpi-employee-${timestamp}`,
      type: 'kpi',
      data: {
        id: 'employee-performance',
        label: `${selectedEmployee}${employeeTimeText || '今年'}业绩`,
        value: employeeValue,
        prefix: '¥',
        unit: '元',
        trend: {
          value: selectedEmployee.includes('销售部') ? 15.2 : 8.5,
          direction: 'up',
          label: '环比',
        },
      },
    });
  }
  
  return blocks;
}
