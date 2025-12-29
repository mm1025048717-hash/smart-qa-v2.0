/**
 * 预设响应 Hook - 用于拦截问题并返回预设响应
 * 完全贴合《智能问答系统显示规则与匹配逻辑完整说明》
 */

import { useCallback } from 'react';
import { ContentBlock, Message } from '../types';
import { matchPresetResponse, PresetResponse, getRuleExplanation } from '../services/presetResponses';

interface UsePresetResponseResult {
  /**
   * 检查问题是否有预设响应
   */
  hasPreset: (question: string) => boolean;
  
  /**
   * 获取预设响应（如果有）
   */
  getPresetResponse: (question: string, messageId: string) => Message | null;
  
  /**
   * 获取规则说明
   */
  getRuleRef: (question: string) => string | null;
}

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 将预设响应转换为消息格式
 */
function convertToMessage(preset: PresetResponse, messageId: string): Message {
  // 为每个内容块添加唯一ID
  const contentBlocks: ContentBlock[] = preset.content.map((block, index) => {
    // 数据已经是对象格式，直接使用
    const data = block.data || block.content;
    
    return {
      id: `${messageId}_${index}_${generateId()}`,
      type: block.type as ContentBlock['type'],
      data,
    };
  });
  
  // 如果有规则说明，在开头添加规则说明卡片
  if (preset.ruleApplied) {
    const ruleBlock: ContentBlock = {
      id: `${messageId}_rule_${generateId()}`,
      type: 'rule-explanation',
      data: {
        rule: preset.ruleApplied,
        chartType: extractChartType(preset.ruleApplied),
      },
    };
    contentBlocks.unshift(ruleBlock);
  }
  
  // 如果有推荐和被过滤的推荐，添加推荐去重展示
  if (preset.recommendations && preset.filteredRecommendations && preset.filteredRecommendations.length > 0) {
    contentBlocks.push({
      id: `${messageId}_filter_${generateId()}`,
      type: 'recommendation-filter',
      data: {
        kept: preset.recommendations,
        filtered: preset.filteredRecommendations,
      },
    });
  }
  
  // 添加推荐建议（如果只有推荐没有过滤）
  if (preset.recommendations && preset.recommendations.length > 0 && !preset.filteredRecommendations) {
    contentBlocks.push({
      id: `${messageId}_suggestions_${generateId()}`,
      type: 'suggestions',
      data: { items: preset.recommendations.map((text, i) => ({ id: `sug_${i}`, text })) },
    });
  }
  
  return {
    id: messageId,
    role: 'assistant',
    content: contentBlocks,
    timestamp: Date.now(),
    status: 'complete',
  };
}

/**
 * 从规则说明中提取图表类型
 */
function extractChartType(rule: string): string | undefined {
  if (rule.includes('年度趋势对比图')) return 'year-comparison';
  if (rule.includes('柱状图')) return 'bar-chart';
  if (rule.includes('折线图')) return 'line-chart';
  if (rule.includes('饼图')) return 'pie-chart';
  if (rule.includes('空状态')) return 'empty-state';
  return undefined;
}

/**
 * 预设响应 Hook
 */
export function usePresetResponse(): UsePresetResponseResult {
  const hasPreset = useCallback((question: string): boolean => {
    const preset = matchPresetResponse(question);
    return preset !== null;
  }, []);
  
  const getPresetResponse = useCallback((question: string, messageId: string): Message | null => {
    const preset = matchPresetResponse(question);
    if (!preset) return null;
    
    console.log('[usePresetResponse] 使用预设响应:', {
      question,
      ruleApplied: preset.ruleApplied,
    });
    
    return convertToMessage(preset, messageId);
  }, []);
  
  const getRuleRef = useCallback((question: string): string | null => {
    return getRuleExplanation(question);
  }, []);
  
  return {
    hasPreset,
    getPresetResponse,
    getRuleRef,
  };
}

export default usePresetResponse;

