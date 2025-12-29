/**
 * 数字员工切换意图识别引擎
 * 支持自然语言切换数字员工，具备强大精准的意图识别能力
 */

import { getAgentById } from './agents';
import type { AgentProfile } from '../types';

// ============================================
// Agent 特征定义 - 用于能力匹配
// ============================================
export interface AgentFeatures {
  id: string;
  // 名字的各种形式（昵称、简称、谐音等）
  nameVariants: string[];
  // 能力关键词
  capabilities: string[];
  // 擅长的场景
  scenarios: string[];
  // 性格/风格描述
  personality: string[];
  // 专业领域
  domains: string[];
}

// 完整的 Agent 特征库
export const AGENT_FEATURES: AgentFeatures[] = [
  {
    id: 'alisa',
    nameVariants: ['alisa', 'Alisa', 'ALISA', '爱丽莎', '阿丽莎', '艾丽莎', 'sql专家', 'SQL专家'],
    capabilities: ['sql', 'SQL', '数据库', '查询', '字段', '表', '结构化', '精准查询', '数据定位'],
    scenarios: ['精准查询', '字段定位', 'SQL生成', '数据库查询', '结构化分析'],
    personality: ['理性', '精准', '专业', '严谨'],
    domains: ['数据库', 'SQL', '结构化数据'],
  },
  {
    id: 'nora',
    nameVariants: ['nora', 'Nora', 'NORA', '诺拉', '娜拉', '语义专家', '叙事专家', '故事专家'],
    capabilities: ['语义', '理解', '故事', '叙事', '推理', '表达', '解读', '复杂问题', '多轮对话', '引导', '温暖'],
    scenarios: ['复杂问题', '故事化表达', '多轮追问', '业务理解', '语义推理', '解读数据'],
    personality: ['温暖', '亲切', '有故事感', '善于引导', '文科生'],
    domains: ['自然语言', '业务叙事', '语义理解'],
  },
  {
    id: 'attributor',
    nameVariants: ['归因哥', '归因', '归因专家', '归因分析师', '诊断专家', '原因分析', '根因分析'],
    capabilities: ['归因', '根因', '原因', '诊断', '定位', '排查', '异常', '问题分析', '影响因素', '下降原因', '波动原因'],
    scenarios: ['异常诊断', '根因分析', '问题定位', '影响归因', '波动分析'],
    personality: ['侦探', '抽丝剥茧', '专注', '深入'],
    domains: ['归因分析', '异常诊断', '问题定位'],
  },
  {
    id: 'viz-master',
    nameVariants: ['小王', '可视化小王', '图表专家', '可视化专家', '图表大师', 'viz'],
    capabilities: ['可视化', '图表', '展示', '呈现', '折线图', '柱状图', '饼图', '散点图', '数据可视化', '图形'],
    scenarios: ['数据可视化', '图表展示', '报表呈现', '数据展示'],
    personality: ['直观', '清晰', '视觉化', '艺术感'],
    domains: ['数据可视化', '图表', '仪表盘'],
  },
  {
    id: 'metrics-pro',
    nameVariants: ['emily', 'Emily', 'EMILY', '艾米丽', '指标专家', '口径专家', '指标体系'],
    capabilities: ['指标', '口径', 'KPI', '定义', '体系', '标准', '规范', '指标体系', '业务指标'],
    scenarios: ['指标定义', '口径说明', 'KPI体系', '指标标准化'],
    personality: ['严谨', '规范', '标准化', '体系化'],
    domains: ['指标体系', 'KPI', '数据标准'],
  },
  {
    id: 'report-lisa',
    nameVariants: ['lisa', 'Lisa', 'LISA', '丽莎', '报表专家', '报表分析师', '报告专家'],
    capabilities: ['报表', '报告', '周报', '月报', '季报', '经营分析', '定期报表', '汇报', '总结'],
    scenarios: ['报表生成', '经营分析', '定期汇报', '数据汇总'],
    personality: ['全面', '系统', '周期性', '专业汇报'],
    domains: ['报表', '经营分析', '数据汇总'],
  },
  {
    id: 'predictor',
    nameVariants: ['预测君', '预测', '预测专家', '预测分析师', '趋势预测', '预言家'],
    capabilities: ['预测', '预估', '趋势', '未来', '预判', '时序', '前瞻', '展望', '会怎样', '下个月', '明年'],
    scenarios: ['销售预测', '趋势预判', '需求预测', '前瞻分析'],
    personality: ['前瞻', '预判', '战略', '长远'],
    domains: ['预测分析', '时序分析', '趋势预判'],
  },
  {
    id: 'quality-guard',
    nameVariants: ['数据卫士', '质检专家', '数据质量', '质量专家', '卫士'],
    capabilities: ['质量', '异常检测', '数据校验', '准确性', '完整性', '清洗', '监控', '核查'],
    scenarios: ['数据质量', '异常检测', '数据校验', '准确性检查'],
    personality: ['严格', '细致', '负责', '警惕'],
    domains: ['数据质量', '数据治理', '异常监控'],
  },
  {
    id: 'growth-hacker',
    nameVariants: ['kevin', 'Kevin', 'KEVIN', '凯文', '增长专家', '增长分析师', '转化专家'],
    capabilities: ['增长', '转化', '漏斗', '用户', '留存', '活跃', '拉新', 'DAU', 'MAU', '日活', '月活'],
    scenarios: ['增长分析', '转化漏斗', '用户分析', '留存分析'],
    personality: ['增长思维', '用户导向', '数据驱动', '实验精神'],
    domains: ['增长', '用户分析', '转化优化'],
  },
  {
    id: 'operation-pro',
    nameVariants: ['小美', '运营小美', '运营专家', '运营分析师', '活动分析'],
    capabilities: ['运营', '活动', '效果', '用户行为', '洞察', '决策', '门店', '业绩', '排名'],
    scenarios: ['活动分析', '运营效果', '用户洞察', '门店分析'],
    personality: ['灵活', '实战', '落地', '执行力强'],
    domains: ['运营分析', '活动效果', '用户行为'],
  },
  {
    id: 'data-detective',
    nameVariants: ['福尔摩斯', '侦探', '数据侦探', '破案专家'],
    capabilities: ['调查', '追踪', '线索', '破案', '侦查', '深挖', '追溯'],
    scenarios: ['数据调查', '异常追踪', '问题破案'],
    personality: ['敏锐', '逻辑', '推理', '不放过任何细节'],
    domains: ['数据调查', '问题追踪'],
  },
  {
    id: 'crystal-ball',
    nameVariants: ['水晶球', '水晶球大师', '预言家', '占卜'],
    capabilities: ['占卜', '预言', '未来', '测算', '预知'],
    scenarios: ['趋势预测', '未来展望', '目标测算'],
    personality: ['神秘', '趣味', '预言家风格'],
    domains: ['预测', '趋势分析'],
  },
  {
    id: 'spreadsheet-ninja',
    nameVariants: ['excel忍者', 'Excel忍者', '忍者', '表格专家', 'vlookup'],
    capabilities: ['表格', 'excel', 'Excel', '透视表', '公式', '汇总', '交叉分析'],
    scenarios: ['数据汇总', '交叉分析', '透视分析'],
    personality: ['快速', '高效', '忍者风格'],
    domains: ['表格处理', '数据汇总'],
  },
  {
    id: 'anxiety-analyst',
    nameVariants: ['焦虑分析师', '焦虑', '担心', '风险专家'],
    capabilities: ['风险', '预警', '担心', '压力测试', '危机', '问题'],
    scenarios: ['风险预警', '危机分析', '问题发现'],
    personality: ['警觉', '细心', '未雨绸缪'],
    domains: ['风险分析', '预警监控'],
  },
  {
    id: 'chill-guy',
    nameVariants: ['chill哥', 'Chill哥', 'chill', 'Chill', '佛系', '淡定'],
    capabilities: ['整体', '长期', '宏观', '淡定', '全局'],
    scenarios: ['宏观分析', '整体趋势', '长期观察'],
    personality: ['佛系', '淡定', '看得开', '不焦虑'],
    domains: ['宏观分析', '趋势观察'],
  },
  {
    id: 'data-rapper',
    nameVariants: ['mc数据', 'MC数据', '说唱', 'rapper', '数据说唱'],
    capabilities: ['说唱', 'rap', '押韵', '有趣', '好记'],
    scenarios: ['趣味分析', '数据说唱', '创意表达'],
    personality: ['有趣', '潮流', '音乐感', '好记忆'],
    domains: ['创意表达', '数据叙事'],
  },
  {
    id: 'time-traveler',
    nameVariants: ['时光旅人', '穿越者', '时间', '同环比'],
    capabilities: ['同比', '环比', '历史', '对比', '时间', '穿越', '回溯'],
    scenarios: ['同比分析', '环比分析', '历史对比', '时间序列'],
    personality: ['时间感', '历史感', '对比思维'],
    domains: ['时间分析', '同环比'],
  },
  {
    id: 'data-chef',
    nameVariants: ['数据大厨', '大厨', '厨师', '烹饪'],
    capabilities: ['烹饪', '加工', '呈现', '美味', '全餐'],
    scenarios: ['数据加工', '全面分析', '多维呈现'],
    personality: ['美食家', '精心', '色香味俱全'],
    domains: ['数据加工', '综合分析'],
  },
  {
    id: 'data-gossip',
    nameVariants: ['八卦王', '数据八卦王', '八卦', '情报'],
    capabilities: ['内幕', '八卦', '情报', '独家', '消息'],
    scenarios: ['内部分析', '独家洞察', '信息挖掘'],
    personality: ['消息灵通', '趣味', '社交'],
    domains: ['信息挖掘', '洞察发现'],
  },
  {
    id: 'yum-china-expert',
    nameVariants: ['百胜专家', '百胜', '百胜中国', 'yum', 'YUM', '百胜顾问', '餐饮专家', '零售专家'],
    capabilities: [
      '百胜', '百胜中国', 'yum', 'kfc', '肯德基', '必胜客', '塔可钟', '塔可贝尔', 
      '餐饮', '门店', '坪效', '翻台率', '客单价', 'GMV', '人效', '售罄率', 
      '连带率', '复购率', '库存周转', '缺货率', '配送时效', '供应链', 
      '多品牌对比', '门店运营', '营销效果', '活动ROI', '新品推广', 
      '会员分析', '区域对比', '门店排名', '业绩分析'
    ],
    scenarios: [
      '门店运营分析', '多品牌对比', '供应链优化', '营销效果分析', 
      '门店排名', '坪效分析', '翻台率分析', '客单价对比', 
      '库存周转分析', '缺货率监控', '配送时效分析', 
      '活动ROI分析', '新品推广效果', '会员复购率分析'
    ],
    personality: ['专业', '务实', '行业专家', '餐饮零售', '多品牌运营'],
    domains: ['餐饮零售', '多品牌运营', '门店管理', '供应链管理', '营销分析'],
  },
];

// ============================================
// 切换意图识别模式
// ============================================

// 直接召唤模式 - 用户明确要某个员工
// const DIRECT_SUMMON_PATTERNS = [
//   // "找/叫/让/请/换+名字" 格式
//   /(?:找|叫|让|请|换|问|切换到?|想找|想要|帮我找|帮我叫|麻烦|需要|要|呼叫|召唤|@)\s*(?:一下)?(.+?)(?:来|吧|呢|帮忙|过来|一下|$)/,
//   // "名字+呢/在吗/来/帮忙" 格式
//   /^(.+?)(?:呢|在吗|在不在|来一下|来帮忙|过来|帮我|来|可以吗|行吗|好吗)[？?]?$/,
//   // 直接说名字
//   /^(.+?)$/,
// ];

// 能力需求模式 - 用户描述需要什么能力
const CAPABILITY_PATTERNS = [
  /(?:找|需要|想要|有没有|谁)(?:一个)?(?:会|能|擅长|专门|专注|懂|熟悉|精通|负责|做)(.+?)的(?:员工|同事|人|专家|分析师|大师)?/,
  /谁(?:比较)?(?:会|能|擅长|专门|懂|熟悉|精通|负责|做)(.+)/,
  /(.+?)(?:方面|领域|这块|这块儿)(?:谁|哪个员工|哪位)(?:比较)?(?:厉害|专业|擅长|在行|强)/,
  /(?:我想|想要|希望|请给我)(?:做|分析|看看|了解)?(.+)/,
];

// 场景匹配模式 - 根据任务场景匹配
// const SCENARIO_PATTERNS = [
//   /(?:想|要|帮我|需要)(?:做|看|分析|了解|查|生成)?(.+?)(?:分析|报告|报表|图表|预测|归因)?/,
// ];

// 排除模式 - 这些不应该触发切换
const EXCLUDE_PATTERNS = [
  /(?:最厉害|最好|最强|谁更|哪个更|推荐|比较|评价|介绍)/,  // 询问比较
  /(?:还有呢|然后呢|接下来|继续|再说说)/,  // 追问
  /(?:你在干嘛|你是谁|你能做什么|你叫什么)/,  // 询问当前 agent
  /(?:谢谢|感谢|辛苦|不错|很好|棒)/,  // 表达感谢
  /(?:今年|去年|本月|上月|销售|营收|订单|利润|库存)/,  // 数据查询
  /(?:多少|怎么样|是多少|什么情况)/,  // 数据查询
  /(?:跟|和|与).+(?:关系|八卦|聊聊|说说)/,  // 聊其他员工
  /(?:同事|员工|团队)/,  // 谈论同事
];

// 必须有明确切换意图的模式 - 只有匹配这些才会触发切换
const EXPLICIT_SWITCH_PATTERNS = [
  /(?:找|叫|换|切换到?|请|让)\s*(.+?)\s*(?:来|帮忙|过来|一下|吧|$)/,  // "找XX来"
  /(?:我想找|我要找|帮我找|帮我叫)\s*(.+)/,  // "我想找XX"
  /^(?:换|切换|召唤|呼叫)\s*(.+)/,  // "换XX"
  /(.+?)\s*(?:来帮忙|来帮我|过来一下|在吗|可以帮我吗)[？?]?$/,  // "XX来帮忙"
];

// ============================================
// 意图识别结果
// ============================================
export interface AgentSwitchResult {
  shouldSwitch: boolean;           // 是否应该切换
  targetAgentId: string | null;    // 目标 Agent ID
  targetAgent: AgentProfile | null; // 目标 Agent 完整信息
  confidence: number;              // 置信度 0-1
  matchType: 'name' | 'capability' | 'scenario' | 'personality' | null;  // 匹配类型
  matchedKeywords: string[];       // 匹配到的关键词
  reason: string;                  // 识别理由（用于调试/展示）
  alternatives?: AgentProfile[];   // 备选 Agent（置信度不够时）
}

// ============================================
// 核心识别函数
// ============================================

/**
 * 检测是否有切换数字员工的意图
 */
export function detectAgentSwitch(
  query: string, 
  currentAgentId: string
): AgentSwitchResult {
  
  // 默认返回值
  const defaultResult: AgentSwitchResult = {
    shouldSwitch: false,
    targetAgentId: null,
    targetAgent: null,
    confidence: 0,
    matchType: null,
    matchedKeywords: [],
    reason: '未检测到切换意图',
  };

  // 1. 先检查排除模式
  if (shouldExclude(query)) {
    return { ...defaultResult, reason: '查询属于排除模式（数据查询/比较/追问等）' };
  }

  // 2. 尝试直接名字匹配（最高优先级）
  const nameMatch = matchByName(query);
  if (nameMatch && nameMatch.confidence > 0.7) {
    // 检查是否是当前员工
    if (nameMatch.targetAgentId === currentAgentId) {
      return { ...defaultResult, reason: `已经是 ${nameMatch.targetAgent?.name}，无需切换` };
    }
    return nameMatch;
  }

  // 3. 尝试能力匹配
  const capabilityMatch = matchByCapability(query);
  if (capabilityMatch && capabilityMatch.confidence > 0.6) {
    if (capabilityMatch.targetAgentId === currentAgentId) {
      return { 
        ...defaultResult, 
        reason: `当前 ${capabilityMatch.targetAgent?.name} 就能处理这个需求` 
      };
    }
    return capabilityMatch;
  }

  // 4. 尝试场景匹配
  const scenarioMatch = matchByScenario(query);
  if (scenarioMatch && scenarioMatch.confidence > 0.5) {
    if (scenarioMatch.targetAgentId === currentAgentId) {
      return { 
        ...defaultResult, 
        reason: `当前 ${scenarioMatch.targetAgent?.name} 适合处理这个场景` 
      };
    }
    return scenarioMatch;
  }

  // 5. 低置信度的名字匹配（作为最后的尝试）
  if (nameMatch && nameMatch.confidence > 0.4) {
    if (nameMatch.targetAgentId !== currentAgentId) {
      return { ...nameMatch, alternatives: findAlternatives(query, nameMatch.targetAgentId!) };
    }
  }

  return defaultResult;
}

/**
 * 检查是否应该排除
 */
function shouldExclude(query: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(query));
}

/**
 * 通过名字匹配 Agent - 只在有明确切换意图时才触发
 */
function matchByName(query: string): AgentSwitchResult | null {
  const normalizedQuery = query.toLowerCase();
  
  // 首先检查是否有明确的切换意图
  const hasExplicitIntent = EXPLICIT_SWITCH_PATTERNS.some(p => p.test(query));
  
  // 如果没有明确的切换意图，直接返回 null
  if (!hasExplicitIntent) {
    return null;
  }
  
  let bestMatch: { agent: AgentFeatures; score: number; matchedWord: string } | null = null;
  
  for (const agentFeature of AGENT_FEATURES) {
    for (const variant of agentFeature.nameVariants) {
      const normalizedVariant = variant.toLowerCase();
      
      // 完全匹配且有明确意图
      if (normalizedQuery === normalizedVariant) {
        return createResult(agentFeature.id, 'name', [variant], 0.95, `明确切换到: ${variant}`);
      }
      
      // 包含匹配且有明确意图
      if (normalizedQuery.includes(normalizedVariant)) {
        const score = 0.85;  // 有明确意图时给高分
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { agent: agentFeature, score, matchedWord: variant };
        }
      }
    }
  }
  
  if (bestMatch) {
    return createResult(
      bestMatch.agent.id, 
      'name', 
      [bestMatch.matchedWord], 
      bestMatch.score,
      `明确切换到: ${bestMatch.matchedWord}`
    );
  }
  
  return null;
}

/**
 * 通过能力匹配 Agent
 */
function matchByCapability(query: string): AgentSwitchResult | null {
  const normalizedQuery = query.toLowerCase();
  
  // 提取能力描述
  let capabilityDesc = '';
  for (const pattern of CAPABILITY_PATTERNS) {
    const match = query.match(pattern);
    if (match && match[1]) {
      capabilityDesc = match[1].trim();
      break;
    }
  }
  
  if (!capabilityDesc) {
    // 如果没有明确的能力描述，尝试从整个查询中匹配
    capabilityDesc = query;
  }
  
  // 评分每个 Agent
  const scores: { agentId: string; score: number; matchedKeywords: string[] }[] = [];
  
  for (const agentFeature of AGENT_FEATURES) {
    let score = 0;
    const matchedKeywords: string[] = [];
    
    // 检查能力关键词
    for (const cap of agentFeature.capabilities) {
      if (normalizedQuery.includes(cap.toLowerCase()) || capabilityDesc.toLowerCase().includes(cap.toLowerCase())) {
        score += 0.3;
        matchedKeywords.push(cap);
      }
    }
    
    // 检查域关键词
    for (const domain of agentFeature.domains) {
      if (normalizedQuery.includes(domain.toLowerCase())) {
        score += 0.2;
        matchedKeywords.push(domain);
      }
    }
    
    if (score > 0) {
      scores.push({ agentId: agentFeature.id, score: Math.min(score, 0.95), matchedKeywords });
    }
  }
  
  // 排序取最高分
  scores.sort((a, b) => b.score - a.score);
  
  if (scores.length > 0 && scores[0].score > 0.2) {
    return createResult(
      scores[0].agentId,
      'capability',
      scores[0].matchedKeywords,
      scores[0].score,
      `能力匹配: ${scores[0].matchedKeywords.join(', ')}`
    );
  }
  
  return null;
}

/**
 * 通过场景匹配 Agent
 */
function matchByScenario(query: string): AgentSwitchResult | null {
  const normalizedQuery = query.toLowerCase();
  
  const scores: { agentId: string; score: number; matchedScenarios: string[] }[] = [];
  
  for (const agentFeature of AGENT_FEATURES) {
    let score = 0;
    const matchedScenarios: string[] = [];
    
    for (const scenario of agentFeature.scenarios) {
      if (normalizedQuery.includes(scenario.toLowerCase())) {
        score += 0.4;
        matchedScenarios.push(scenario);
      }
    }
    
    // 性格匹配（较低权重）
    for (const personality of agentFeature.personality) {
      if (normalizedQuery.includes(personality.toLowerCase())) {
        score += 0.1;
      }
    }
    
    if (score > 0) {
      scores.push({ agentId: agentFeature.id, score: Math.min(score, 0.9), matchedScenarios });
    }
  }
  
  scores.sort((a, b) => b.score - a.score);
  
  if (scores.length > 0 && scores[0].score > 0.3) {
    return createResult(
      scores[0].agentId,
      'scenario',
      scores[0].matchedScenarios,
      scores[0].score,
      `场景匹配: ${scores[0].matchedScenarios.join(', ')}`
    );
  }
  
  return null;
}

/**
 * 查找备选 Agent
 */
function findAlternatives(query: string, excludeId: string): AgentProfile[] {
  const normalizedQuery = query.toLowerCase();
  const alternatives: { agent: AgentProfile; score: number }[] = [];
  
  for (const agentFeature of AGENT_FEATURES) {
    if (agentFeature.id === excludeId) continue;
    
    let score = 0;
    
    // 简单评分
    for (const cap of agentFeature.capabilities) {
      if (normalizedQuery.includes(cap.toLowerCase())) {
        score += 0.2;
      }
    }
    
    if (score > 0.1) {
      const agent = getAgentById(agentFeature.id);
      alternatives.push({ agent, score });
    }
  }
  
  return alternatives
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(a => a.agent);
}

/**
 * 创建识别结果
 */
function createResult(
  agentId: string,
  matchType: AgentSwitchResult['matchType'],
  matchedKeywords: string[],
  confidence: number,
  reason: string
): AgentSwitchResult {
  const agent = getAgentById(agentId);
  return {
    shouldSwitch: true,
    targetAgentId: agentId,
    targetAgent: agent,
    confidence,
    matchType,
    matchedKeywords,
    reason,
  };
}

/**
 * 计算字符串相似度（简化版 Levenshtein）
 * 注意：此函数当前未使用，保留以备将来需要
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  // 如果短字符串包含在长字符串中
  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }
  
  // 计算公共前缀/后缀
  let commonPrefix = 0;
  let commonSuffix = 0;
  
  const minLen = shorter.length;
  for (let i = 0; i < minLen; i++) {
    if (s1[i] === s2[i]) commonPrefix++;
    else break;
  }
  
  for (let i = 0; i < minLen - commonPrefix; i++) {
    if (s1[s1.length - 1 - i] === s2[s2.length - 1 - i]) commonSuffix++;
    else break;
  }
  
  return (commonPrefix + commonSuffix) / longer.length;
}

// ============================================
// 辅助函数 - 用于 UI 展示
// ============================================

/**
 * 获取推荐的 Agent 列表（用于智能推荐）
 */
export function getRecommendedAgents(query: string, currentAgentId: string): AgentProfile[] {
  const normalizedQuery = query.toLowerCase();
  const recommendations: { agent: AgentProfile; score: number }[] = [];
  
  for (const agentFeature of AGENT_FEATURES) {
    if (agentFeature.id === currentAgentId) continue;
    
    let score = 0;
    
    // 能力匹配
    for (const cap of agentFeature.capabilities) {
      if (normalizedQuery.includes(cap.toLowerCase())) {
        score += 0.3;
      }
    }
    
    // 场景匹配
    for (const scenario of agentFeature.scenarios) {
      if (normalizedQuery.includes(scenario.toLowerCase())) {
        score += 0.4;
      }
    }
    
    if (score > 0.2) {
      const agent = getAgentById(agentFeature.id);
      recommendations.push({ agent, score });
    }
  }
  
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(r => r.agent);
}

/**
 * 根据能力描述找到最匹配的 Agent
 */
export function findAgentByAbility(abilityDesc: string): AgentProfile | null {
  const result = matchByCapability(abilityDesc);
  return result?.targetAgent || null;
}

/**
 * 检测查询中是否包含其他员工名字（用于推荐切换）
 */
export function detectMentionedAgents(query: string, currentAgentId: string): AgentProfile[] {
  const mentioned: AgentProfile[] = [];
  
  for (const agentFeature of AGENT_FEATURES) {
    if (agentFeature.id === currentAgentId) continue;
    
    for (const variant of agentFeature.nameVariants) {
      if (query.toLowerCase().includes(variant.toLowerCase())) {
        const agent = getAgentById(agentFeature.id);
        if (!mentioned.find(a => a.id === agent.id)) {
          mentioned.push(agent);
        }
        break;
      }
    }
  }
  
  return mentioned;
}

export default { 
  detectAgentSwitch, 
  getRecommendedAgents, 
  findAgentByAbility,
  detectMentionedAgents,
  AGENT_FEATURES 
};


