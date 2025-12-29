/**
 * 测试运行脚本
 * 运行所有匹配规则和推荐引擎的测试用例
 */

import { runMatchingTests, runValidationTests } from './chartMatchingEngine.test';
import { runRecommendationTests, runExtractionTests } from './recommendationEngine.test';

/**
 * 运行所有测试
 */
export function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 开始运行完整测试套件');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const results = {
    matching: { passed: 0, failed: 0, total: 0 },
    validation: { passed: 0, failed: 0, total: 0 },
    recommendation: { passed: 0, failed: 0, total: 0 },
    extraction: { passed: 0, failed: 0, total: 0 }
  };
  
  // 1. KPI与图表匹配测试
  console.log('【测试1】KPI与图表匹配规则引擎');
  console.log('─────────────────────────────────────────────────────');
  results.matching = runMatchingTests();
  
  // 2. 匹配验证测试
  console.log('【测试2】匹配验证功能');
  console.log('─────────────────────────────────────────────────────');
  results.validation = runValidationTests();
  
  // 3. 推荐引擎测试
  console.log('【测试3】智能推荐引擎');
  console.log('─────────────────────────────────────────────────────');
  results.recommendation = runRecommendationTests();
  
  // 4. 内容提取测试
  console.log('【测试4】内容提取功能');
  console.log('─────────────────────────────────────────────────────');
  results.extraction = runExtractionTests();
  
  // 汇总结果
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 测试结果汇总');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const totalPassed = 
    results.matching.passed + 
    results.validation.passed + 
    results.recommendation.passed + 
    results.extraction.passed;
  
  const totalFailed = 
    results.matching.failed + 
    results.validation.failed + 
    results.recommendation.failed + 
    results.extraction.failed;
  
  const total = totalPassed + totalFailed;
  
  console.log('测试类别               通过    失败    总计    通过率');
  console.log('─────────────────────────────────────────────────────');
  console.log(`KPI匹配规则            ${results.matching.passed.toString().padStart(4)}    ${results.matching.failed.toString().padStart(4)}    ${results.matching.total.toString().padStart(4)}    ${((results.matching.passed / results.matching.total) * 100).toFixed(1).padStart(5)}%`);
  console.log(`匹配验证               ${results.validation.passed.toString().padStart(4)}    ${results.validation.failed.toString().padStart(4)}    ${results.validation.total.toString().padStart(4)}    ${((results.validation.passed / results.validation.total) * 100).toFixed(1).padStart(5)}%`);
  console.log(`推荐引擎               ${results.recommendation.passed.toString().padStart(4)}    ${results.recommendation.failed.toString().padStart(4)}    ${results.recommendation.total.toString().padStart(4)}    ${((results.recommendation.passed / results.recommendation.total) * 100).toFixed(1).padStart(5)}%`);
  console.log(`内容提取               ${results.extraction.passed.toString().padStart(4)}    ${results.extraction.failed.toString().padStart(4)}    ${results.extraction.total.toString().padStart(4)}    ${((results.extraction.passed / results.extraction.total) * 100).toFixed(1).padStart(5)}%`);
  console.log('─────────────────────────────────────────────────────');
  console.log(`总计                   ${totalPassed.toString().padStart(4)}    ${totalFailed.toString().padStart(4)}    ${total.toString().padStart(4)}    ${((totalPassed / total) * 100).toFixed(1).padStart(5)}%`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (totalFailed === 0) {
    console.log('✅ 所有测试通过！');
  } else {
    console.log(`⚠️  有 ${totalFailed} 个测试失败，请检查上述输出`);
  }
  
  return {
    totalPassed,
    totalFailed,
    total,
    passRate: (totalPassed / total) * 100
  };
}

// 如果直接运行此文件，执行所有测试
// 注意：在浏览器环境中，require.main === module 不可用
// 如需运行测试，请直接调用 runAllTests()
// if (require.main === module) {
//   runAllTests();
// }

export default { runAllTests };

