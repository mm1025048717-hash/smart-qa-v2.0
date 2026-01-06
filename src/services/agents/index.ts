/**
 * 数字员工统一入口
 * 支持分类管理不同客户/行业的数字员工
 */

import type { AgentProfile } from '../../types';
import { AIMA_AGENTS, getAimaAgentKeywords } from './aima/aimaAgents';
// 直接导入通用员工（agents.ts 不会导入这个文件，所以不会有循环依赖）
import { AGENTS as COMMON_AGENTS } from '../agents';

// 导出所有数字员工（通用 + 爱玛电动车）
export const ALL_AGENTS: AgentProfile[] = [
  ...COMMON_AGENTS,
  ...AIMA_AGENTS,
];

// 导出爱玛电动车员工
export { AIMA_AGENTS } from './aima/aimaAgents';
export { getAimaSystemPrompt, getAimaAgentKeywords } from './aima/aimaAgents';

// 重新导出工具函数（更新为使用ALL_AGENTS）
export function getAgentById(id?: string): AgentProfile {
  return ALL_AGENTS.find((a) => a.id === id) ?? ALL_AGENTS[0];
}

export function getAgentByName(name: string): AgentProfile | undefined {
  // 精确匹配
  const exact = ALL_AGENTS.find((a) => a.name === name);
  if (exact) return exact;
  
  // 模糊匹配：名字包含搜索词，或搜索词包含名字
  const fuzzy = ALL_AGENTS.find((a) => 
    a.name.includes(name) || name.includes(a.name)
  );
  if (fuzzy) return fuzzy;
  
  // 根据关键词匹配（包括爱玛的关键词）
  const aimaKeywords = getAimaAgentKeywords();
  
  const keywords: Record<string, string[]> = {
    'alisa': ['alisa', 'sql', '数据库'],
    'nora': ['nora', '语义', '故事', '叙事'],
    'attributor': ['归因', '归因哥', '根因', '原因分析'],
    'viz-master': ['可视化', '小王', '图表'],
    'metrics-pro': ['emily', '指标', '口径'],
    'report-lisa': ['lisa', '报表', '报告'],
    'predictor': ['预测', '预测君', '趋势预测'],
    'growth-hacker': ['kevin', '增长', '转化'],
    'operation-pro': ['小美', '运营', '活动'],
    'yum-china-expert': ['百胜', '百胜专家', '百胜中国', 'yum', 'kfc', '肯德基', '必胜客', '塔可钟', '塔可贝尔', '餐饮', '门店', '坪效', '翻台率', '客单价', 'GMV', '人效', '售罄率', '连带率', '复购率', '库存周转', '缺货率', '配送时效', '供应链', '多品牌对比'],
    // 爱玛电动车关键词
    ...aimaKeywords,
  };
  
  const lowerName = name.toLowerCase();
  for (const [agentId, words] of Object.entries(keywords)) {
    if (words.some(w => lowerName.includes(w) || w.includes(lowerName))) {
      return ALL_AGENTS.find(a => a.id === agentId);
    }
  }
  
  return undefined;
}

// 按分类获取员工
export function getAgentsByCategory(category: 'common' | 'aima' = 'common'): AgentProfile[] {
  switch (category) {
    case 'aima':
      return AIMA_AGENTS;
    case 'common':
    default:
      return COMMON_AGENTS;
  }
}

// 检查是否是爱玛电动车员工
export function isAimaAgent(agentId: string): boolean {
  return AIMA_AGENTS.some(a => a.id === agentId);
}
