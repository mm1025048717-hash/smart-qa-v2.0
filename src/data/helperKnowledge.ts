/**
 * 小助手知识库 - 用于 RAG 文档问答（检索 + 引用展示）
 * 可与《用户手册》《开发文档》等挂载，便于后续接入真实向量检索
 */

export interface KnowledgeItem {
  q: string;
  a: string;
  source: string; // 引用来源，用于 RAG 展示
}

export const HELPER_QA: KnowledgeItem[] = [
  { q: '亿问 Data Agent 是什么？', a: '企业级数据智能助手，用自然语言查指标、看趋势、做归因分析。通过角色与分步引导，降低门槛，30 秒上手。', source: '《亿问 Data Agent 用户手册》第 1 章' },
  { q: '如何开始使用？', a: '先选角色（管理层 / 业务负责人 / 一线业务 / 数据开发等），系统会推荐数字员工和常见问题。选完角色后未做过引导会自动进入约 30 秒的新手引导。', source: '《用户手册》· 快速开始' },
  { q: '如何提问？', a: '在页面中央输入框直接输入，例如「今年销售额是多少」「近 3 个月销售额趋势」「为什么 11 月销售下降」。下方可切换数字员工、选「本地模式」或「联网搜索」。', source: '《用户手册》· 如何提问' },
  { q: '不同角色看到的引导一样吗？', a: '不一样。CXO 极简 3 步；业务负责人多出看板与数字员工市场；一线业务侧重指标口径与知识库；数据开发为数据源 / 业务建模 / 指标管理。引导结束后会缩成右下角小助手。', source: '《用户手册》· 分角色引导' },
  { q: '右下角小助手能做什么？', a: '查看帮助文档、知识库问答（从文档检索回答）、截图上报问题、转人工/提工单、重新体验引导。', source: '《用户手册》· 亿问小助手' },
  { q: '如何切换 AI 员工？', a: '在输入框下方点击当前员工名称，在列表中选择即可。', source: '《用户手册》· 数字员工' },
  { q: '本地模式和联网搜索有什么区别？', a: '本地模式仅用已接入数据与知识库；联网搜索可查最新公开信息。', source: '《用户手册》· 联网搜索' },
  { q: '可以跳过引导吗？', a: '可以。点「跳过引导」会二次确认；之后可在小助手里选「重新体验引导」再看一遍。', source: '《用户手册》· 新手引导' },
  { q: '遇到问题怎么联系支持？', a: '点右下角小助手，用「截图上报问题」或「转人工/提工单」提交，我们会尽快排查或安排专人跟进。', source: '《用户手册》· 联系支持' },
  { q: '什么是动态 SQL 模式？', a: '动态 SQL 模式允许 Agent 根据用户的自然语言，动态组合 Schema 中的字段生成查询，适合灵活探索。关闭则限制只能查预置指标。', source: '《开发文档》第 3.2 章' },
  { q: '数据源怎么配置？', a: '在数据开发 Tab 中点击「数据源」，新建连接并填写 Host、Port、库名与凭证。支持 SSH 隧道。', source: '《开发文档》· 数据源接入' },
  { q: '指标口径在哪里定义？', a: '在「指标」Tab 中可查看指标口径说明；点击「新建术语」可添加业务黑话与指标定义，供 AI 统一理解。', source: '《用户手册》· 指标与知识库' },
];

/**
 * 从知识库检索最相关的一条（简单关键词匹配，后续可换为向量检索）
 */
export function searchKnowledge(query: string): { answer: string; source: string; question: string } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  let best: { item: KnowledgeItem; score: number } | null = null;
  for (const item of HELPER_QA) {
    const question = item.q.toLowerCase();
    const answer = item.a.toLowerCase();
    let score = 0;
    const terms = q.split(/\s+/).filter(Boolean);
    for (const t of terms) {
      if (question.includes(t)) score += 3;
      if (answer.includes(t)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { item, score };
  }
  if (!best) return null;
  return {
    answer: best.item.a,
    source: best.item.source,
    question: best.item.q,
  };
}
