/**
 * KPI与图表匹配规则引擎测试用例
 * 验证匹配逻辑的正确性
 */

import { matchKpiToChart, validateMatch } from './chartMatchingEngine';
import { IntentType } from '../types';

// 测试用例数据
const testCases = [
  {
    id: 'TC-001',
    name: '年度销售额查询 - 应匹配年度趋势对比图',
    question: '今年销售额是多少',
    intent: 'single_metric' as IntentType,
    kpiData: [{
      id: 'sales_2024',
      label: '2024年度销售额',
      value: 38560000,
      prefix: '¥',
      trend: { value: 19.8, direction: 'up' as const, label: '同比增长' }
    }],
    expectedChart: {
      type: 'line-chart',
      subtype: 'year-comparison',
      reason: '年度销售额查询，需要展示年度对比趋势'
    }
  },
  {
    id: 'TC-002',
    name: '各季度销售额 - 应匹配柱状图',
    question: '各季度销售额是多少',
    intent: 'multi_metric' as IntentType,
    kpiData: [
      { id: 'q1', label: 'Q1销售额', value: 8230000 },
      { id: 'q2', label: 'Q2销售额', value: 9450000 },
      { id: 'q3', label: 'Q3销售额', value: 10280000 },
      { id: 'q4', label: 'Q4销售额', value: 10600000 }
    ],
    expectedChart: {
      type: 'bar-chart',
      reason: '季度是离散分类，柱状图最适合展示各季度的对比'
    }
  },
  {
    id: 'TC-003',
    name: '销售额趋势 - 应匹配折线图',
    question: '销售额趋势如何',
    intent: 'trend_analysis' as IntentType,
    kpiData: [{
      id: 'sales_trend',
      label: '近3个月销售额',
      value: 25000000,
      trend: { value: 15.2, direction: 'up' as const }
    }],
    expectedChart: {
      type: 'line-chart',
      reason: '趋势分析需要展示时间序列变化，折线图最适合'
    }
  },
  {
    id: 'TC-004',
    name: '渠道占比 - 应匹配饼图',
    question: '各渠道销售额占比',
    intent: 'composition' as IntentType,
    kpiData: [{
      id: 'channel',
      label: '渠道占比',
      value: 100
    }],
    expectedChart: {
      type: 'pie-chart',
      reason: '占比分析需要展示比例关系，饼图最适合'
    }
  },
  {
    id: 'TC-005',
    name: '地区对比 - 应匹配柱状图',
    question: '各地区销售额对比',
    intent: 'dimension_compare' as IntentType,
    kpiData: [
      { id: 'east', label: '华东', value: 24500000 },
      { id: 'south', label: '华南', value: 18900000 }
    ],
    expectedChart: {
      type: 'bar-chart',
      reason: '地区对比是分类对比，柱状图最适合展示各地区的数据对比'
    }
  },
  {
    id: 'TC-006',
    name: '同比分析 - 应匹配折线图',
    question: '对比去年同期销售额',
    intent: 'yoy_mom' as IntentType,
    kpiData: [{
      id: 'yoy',
      label: '销售额',
      value: 38560000,
      trend: { value: 19.8, direction: 'up' as const, label: '同比增长' }
    }],
    expectedChart: {
      type: 'line-chart',
      reason: '同比环比分析需要展示时间序列对比，折线图最适合'
    }
  }
];

/**
 * 运行测试用例
 */
export function runMatchingTests() {
  console.log('🧪 开始测试KPI与图表匹配规则引擎...\n');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    const result = matchKpiToChart(testCase.question, testCase.kpiData, testCase.intent);
    const isMatch = 
      result.recommendedChart.type === testCase.expectedChart.type &&
      (!testCase.expectedChart.subtype || result.recommendedChart.subtype === testCase.expectedChart.subtype);
    
    if (isMatch) {
      console.log(`✅ ${testCase.id}: ${testCase.name}`);
      passed++;
    } else {
      console.log(`❌ ${testCase.id}: ${testCase.name}`);
      console.log(`   期望: ${testCase.expectedChart.type}${testCase.expectedChart.subtype ? ` (${testCase.expectedChart.subtype})` : ''}`);
      console.log(`   实际: ${result.recommendedChart.type}${result.recommendedChart.subtype ? ` (${result.recommendedChart.subtype})` : ''}`);
      console.log(`   理由: ${result.recommendedChart.reason}`);
      failed++;
    }
  });
  
  console.log(`\n📊 测试结果: ${passed} 通过, ${failed} 失败, 总计 ${testCases.length}`);
  console.log(`通过率: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);
  
  return { passed, failed, total: testCases.length };
}

/**
 * 验证匹配正确性测试
 */
export function runValidationTests() {
  console.log('🔍 开始测试匹配验证功能...\n');
  
  const validationTests = [
    {
      name: '正确匹配验证',
      question: '今年销售额是多少',
      kpiData: [{
        id: 'sales',
        label: '2024年度销售额',
        value: 38560000,
        trend: { value: 19.8, direction: 'up' as const }
      }],
      chartType: 'line-chart',
      chartSubtype: 'year-comparison',
      intent: 'single_metric' as IntentType,
      expectedValid: true
    },
    {
      name: '错误匹配验证',
      question: '今年销售额是多少',
      kpiData: [{
        id: 'sales',
        label: '2024年度销售额',
        value: 38560000
      }],
      chartType: 'bar-chart', // 错误：应该是line-chart
      intent: 'single_metric' as IntentType,
      expectedValid: false
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  validationTests.forEach(test => {
    const result = validateMatch(
      test.question,
      test.kpiData,
      test.chartType,
      test.chartSubtype,
      test.intent
    );
    
    if (result.isValid === test.expectedValid) {
      console.log(`✅ ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   期望: ${test.expectedValid ? '有效' : '无效'}`);
      console.log(`   实际: ${result.isValid ? '有效' : '无效'}`);
      console.log(`   理由: ${result.reason}`);
      failed++;
    }
  });
  
  console.log(`\n📊 验证测试结果: ${passed} 通过, ${failed} 失败\n`);
  
  return { passed, failed, total: validationTests.length };
}

// 如果直接运行此文件，执行测试
// 注意：在浏览器环境中，require.main === module 不可用
// 如需运行测试，请直接调用 runMatchingTests() 和 runValidationTests()
// if (require.main === module) {
//   runMatchingTests();
//   runValidationTests();
// }

export { testCases };

