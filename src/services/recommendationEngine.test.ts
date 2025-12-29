/**
 * 智能推荐引擎测试用例
 * 验证推荐去重逻辑的正确性
 */

import { generateRecommendations, extractAnswerContent, AnswerContent } from './recommendationEngine';
import { ContentBlock } from '../types';

// 测试用例数据
const testCases = [
  {
    id: 'RC-001',
    name: '年度销售额查询 - 应过滤季度和年度对比推荐',
    answerContent: {
      containsQuarterlyData: true,
      containsYearComparison: true,
      containsRegionalData: false,
      containsChannelData: false,
      containsTrendAnalysis: true,
      mainMetrics: ['销售额', '同比增长']
    },
    expectedFiltered: ['季度分析', '对比去年同期'], // 应该被过滤掉
    expectedIncluded: ['查看地区分布', '分析渠道构成', '分析增长来源'] // 应该包含
  },
  {
    id: 'RC-002',
    name: '地区分析查询 - 应过滤地区相关推荐',
    answerContent: {
      containsQuarterlyData: false,
      containsYearComparison: false,
      containsRegionalData: true,
      containsChannelData: false,
      containsTrendAnalysis: false,
      mainMetrics: ['地区销售额']
    },
    expectedFiltered: ['查看地区分布', '城市排名'],
    expectedIncluded: ['季度分析', '分析渠道构成']
  },
  {
    id: 'RC-003',
    name: '渠道分析查询 - 应过滤渠道相关推荐',
    answerContent: {
      containsQuarterlyData: false,
      containsYearComparison: false,
      containsRegionalData: false,
      containsChannelData: true,
      containsTrendAnalysis: false,
      mainMetrics: ['渠道占比']
    },
    expectedFiltered: ['分析渠道构成', '渠道增长分析'],
    expectedIncluded: ['查看地区分布', '季度分析']
  },
  {
    id: 'RC-004',
    name: '完整分析 - 应推荐互补维度',
    answerContent: {
      containsQuarterlyData: true,
      containsYearComparison: true,
      containsRegionalData: true,
      containsChannelData: true,
      containsTrendAnalysis: true,
      mainMetrics: ['销售额', '同比增长', '地区', '渠道']
    },
    expectedFiltered: ['季度分析', '对比去年同期', '查看地区分布', '分析渠道构成'],
    expectedIncluded: ['分析增长来源', '预测下月趋势'] // 应该推荐原因分析和预测
  }
];

/**
 * 运行推荐引擎测试
 */
export function runRecommendationTests() {
  console.log('🧪 开始测试智能推荐引擎...\n');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    const recommendations = generateRecommendations(testCase.answerContent);
    const recommendationLabels = recommendations.map(r => r.label);
    
    // 检查应该被过滤的推荐是否被过滤
    const hasFiltered = testCase.expectedFiltered.some(filtered => 
      recommendationLabels.includes(filtered)
    );
    
    // 检查应该包含的推荐是否包含
    const hasIncluded = testCase.expectedIncluded.some(included => 
      recommendationLabels.includes(included)
    );
    
    if (!hasFiltered && hasIncluded) {
      console.log(`✅ ${testCase.id}: ${testCase.name}`);
      console.log(`   推荐: ${recommendationLabels.join(', ')}`);
      passed++;
    } else {
      console.log(`❌ ${testCase.id}: ${testCase.name}`);
      if (hasFiltered) {
        const found = testCase.expectedFiltered.filter(f => recommendationLabels.includes(f));
        console.log(`   错误: 应该被过滤的推荐仍然存在: ${found.join(', ')}`);
      }
      if (!hasIncluded) {
        const missing = testCase.expectedIncluded.filter(i => !recommendationLabels.includes(i));
        console.log(`   错误: 应该包含的推荐缺失: ${missing.join(', ')}`);
      }
      console.log(`   实际推荐: ${recommendationLabels.join(', ')}`);
      failed++;
    }
  });
  
  console.log(`\n📊 测试结果: ${passed} 通过, ${failed} 失败, 总计 ${testCases.length}`);
  console.log(`通过率: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);
  
  return { passed, failed, total: testCases.length };
}

/**
 * 测试内容提取功能
 */
export function runExtractionTests() {
  console.log('🔍 开始测试内容提取功能...\n');
  
  const extractionTests = [
    {
      name: '提取季度数据特征',
      blocks: [
        {
          type: 'kpi',
          data: { label: 'Q1销售额', value: 8230000 }
        },
        {
          type: 'kpi',
          data: { label: 'Q2销售额', value: 9450000 }
        }
      ] as ContentBlock[],
      expected: {
        containsQuarterlyData: true,
        containsYearComparison: false
      }
    },
    {
      name: '提取年度对比特征',
      blocks: [
        {
          type: 'kpi',
          data: { label: '2024年度销售额', value: 38560000, trend: { value: 19.8, direction: 'up', label: '同比增长' } }
        },
        {
          type: 'line-chart',
          data: { type: 'year-comparison', currentYear: '2024', lastYear: '2023' }
        }
      ] as ContentBlock[],
      expected: {
        containsQuarterlyData: false,
        containsYearComparison: true
      }
    },
    {
      name: '提取地区数据特征',
      blocks: [
        {
          type: 'bar-chart',
          data: { title: '各地区销售额对比' }
        }
      ] as ContentBlock[],
      expected: {
        containsRegionalData: true,
        containsChannelData: false
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  extractionTests.forEach(test => {
    const result = extractAnswerContent(test.blocks);
    
    const isMatch = Object.keys(test.expected).every(key => 
      result[key as keyof AnswerContent] === test.expected[key as keyof typeof test.expected]
    );
    
    if (isMatch) {
      console.log(`✅ ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   期望:`, test.expected);
      console.log(`   实际:`, {
        containsQuarterlyData: result.containsQuarterlyData,
        containsYearComparison: result.containsYearComparison,
        containsRegionalData: result.containsRegionalData,
        containsChannelData: result.containsChannelData
      });
      failed++;
    }
  });
  
  console.log(`\n📊 提取测试结果: ${passed} 通过, ${failed} 失败\n`);
  
  return { passed, failed, total: extractionTests.length };
}

// 如果直接运行此文件，执行测试
// 注意：在浏览器环境中，require.main 不可用，测试应通过测试框架运行
// if (typeof require !== 'undefined' && require.main === module) {
//   runRecommendationTests();
//   runExtractionTests();
// }

export { testCases };

