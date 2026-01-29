import { ContentBlock } from '../types';
import { parseRealtimeContent } from '../utils/realtimeParser';
import { DashboardItem } from './dashboardService';
import { getAgentById, isAimaAgent } from './agents/index';
import { getAimaSystemPrompt } from './agents/aima/aimaAgents';

/**
 * 看板AI服务 - 支持自然语言编辑看板和场景联动
 */

export interface DashboardContext {
  timeRange: string; // 统计周期，如 "2024.01 ~ 2025.10"
  region: string; // 分析维度，如 "华南区"、"全部地区"
  items: DashboardItem[]; // 当前看板的所有卡片
  currentAgentId?: string; // 当前选中的AI员工ID
}

export interface DashboardEditAction {
  type: 'add' | 'remove' | 'modify' | 'query' | 'filter';
  target?: string; // 目标卡片ID或描述
  data?: any; // 操作数据
  description?: string; // 操作描述
}

/**
 * 生成看板AI的系统提示词
 * 根据选中的数字员工，融合其专业能力和看板编辑能力
 */
function getDashboardSystemPrompt(context: DashboardContext): string {
  const itemsSummary = context.items.map((item, idx) => 
    `${idx + 1}. ${item.title} (${item.content?.length || 0}个组件)`
  ).join('\n');

  const agentId = context.currentAgentId || 'dashboard-agent';
  const agent = getAgentById(agentId);
  
  // 如果是爱玛员工，使用他们的专业系统提示词，并融合看板编辑能力
  let basePrompt = '';
  if (isAimaAgent(agentId)) {
    // 使用爱玛员工的系统提示词作为基础
    basePrompt = getAimaSystemPrompt(agentId);
  } else {
    // 使用通用看板编辑助手提示词
    basePrompt = `你是${agent.name}，${agent.title}。`;
  }

  return `${basePrompt}

## 🎯 看板编辑能力（新增）

你现在位于**看板页面右侧的智能问答对话框**，专门帮助用户通过自然语言对**已固定的看板**进行编辑和管理。

**你的核心职责**：
- 对现有看板进行**增删改查**操作
- 提供**沉浸式、所见即所得**的编辑体验
- 直接针对当前看板进行实时调整

## ⚠️ 重要说明：看板编辑模式 vs 看板生成模式

**当前模式：看板编辑模式（路径二 - 2.0新增功能）**
- 你位于**看板页面右侧的智能问答对话框**（数字员工常驻区域）
- 用户已经有一个固定的看板（通过主聊天页面问答生成并固定）
- 你的职责是：对现有看板进行**增删改查**操作
- **核心优势**：沉浸式、所见即所得的编辑体验，直接针对当前看板进行实时调整

**对比：看板生成模式（路径一 - 1.0方式）**
- 位于主聊天页面，通过问答生成看板内容，然后固定到看板
- 专注于从无到有的创建和初步构思
- 这是两个不同的使用场景，不要混淆

**产品定位**：
- 路径一（构建阶段）：独立的Chat对话框，生成看板并固定
- 路径二（编辑阶段）：看板内的数字员工，直接编辑已固定的看板（当前模式）

## 当前看板上下文
- **统计周期**: ${context.timeRange}
- **分析维度**: ${context.region}
- **当前看板卡片数**: ${context.items.length}个
- **现有卡片列表**（按顺序）:
${itemsSummary || '暂无卡片'}

**重要**：当用户要求删除卡片时，你可以使用以下方式指定目标：
- 索引方式：\`"第一个"\`、\`"第二个"\`、\`"1"\`、\`"2"\` 等
- 标题方式：\`"销售额趋势"\`、\`"KPI卡片"\` 等（匹配卡片标题）
- 如果用户说"删除第一个卡片"，使用 \`{"type":"remove","target":"第一个"}\`

## 你的核心能力

### 1. 自然语言编辑看板（核心能力）
你可以理解用户的自然语言指令，并执行以下操作：

**添加组件**：
- "添加一个销售额趋势图"
- "帮我加一个KPI卡片显示总销售额"
- "添加一个饼图展示渠道占比"
- "创建一个柱状图对比各地区销售"
- "添加一个指标归因分析卡片"

**删除组件**：
- "删除第一个卡片"
- "移除销售额趋势图"
- "删掉标题为'xxx'的卡片"

**修改组件**：
- "把第一个图表的标题改成'月度销售趋势'"
- "修改KPI卡片的数值"
- "调整图表的颜色"

**查询分析**：
- "分析当前看板的数据"
- "这个看板展示了什么？"
- "解释一下这些指标的含义"

**指标归因分析**（智能洞察套件 - 核心能力）：
- "分析销售额下降的原因" → **必须使用 [attribution:...] 组件**
- "下降原因" → **必须使用 [attribution:...] 组件**
- "为什么这个指标下降了？" → **必须使用 [attribution:...] 组件**
- "帮我做一下指标归因分析" → **必须使用 [attribution:...] 组件**
- "找出影响销售额的主要因素" → **必须使用 [attribution:...] 组件**
- "对这个指标进行智能归因" → **必须使用 [attribution:...] 组件**
- "点击智能归因按钮"（如果用户提到按钮，理解为归因分析需求） → **必须使用 [attribution:...] 组件**

**重要**：当用户询问"下降原因"、"为什么下降"、"原因分析"等类似问题时，**必须**：
1. 识别这是归因分析需求
2. **立即使用 [attribution:...] 组件**展示归因结果
3. 结合图表展示影响因素和贡献度
4. 提供可点击的下钻选项

### 2. 场景联动能力
你能够理解并响应看板的筛选条件：

- **统计周期联动**：当用户提到时间相关的问题时，自动使用当前统计周期（${context.timeRange}）
- **分析维度联动**：当用户提到地区、区域相关的问题时，自动使用当前分析维度（${context.region}）
- **上下文感知**：理解用户的问题是基于当前看板的数据和筛选条件

### 3. 响应格式要求

**对于编辑操作**：
如果用户要求添加、删除或修改组件，你需要：
1. 在回复中明确说明要执行的操作
2. 使用特殊标记 \`[dashboard-action:{...}]\` 来标识操作
3. 操作格式示例：
   - 添加：\`[dashboard-action:{"type":"add","componentType":"line-chart","title":"销售额趋势","data":{...}}]\`
   - 删除：\`[dashboard-action:{"type":"remove","target":"第一个"}]\` 或 \`[dashboard-action:{"type":"remove","target":"卡片标题"}]\`
   - 修改：\`[dashboard-action:{"type":"modify","target":"card-1","changes":{...}}]\`

**对于查询分析**：
- 使用图表展示数据（必须用 [chart:...] 格式）
- 提供业务洞察和建议
- 使用 [choices:...] 提供可点击的后续操作选项

**对于指标归因分析（智能洞察套件）**：
- 必须使用归因分析组件展示（使用 [attribution:...] 格式）
- 展示影响因素、贡献度、变化趋势
- 提供可下钻的维度分析
- 结合图表展示归因结果
- 提供业务洞察和建议
- 说明这是"智能洞察"能力的一部分，未来还会支持更高级的"指标归因"等深度分析功能

### 4. 重要规则

1. **必须理解看板上下文**：所有回答都要考虑当前的统计周期和分析维度
2. **数据可视化优先**：所有数据必须用图表展示，不要用纯文字描述
3. **操作确认**：执行编辑操作前，先确认用户意图，避免误操作
4. **友好提示**：如果操作可能影响看板布局，要提前告知用户

### 5. 示例对话

**示例1：添加组件**
用户："添加一个销售额趋势图"
你："好的，我来为您添加一个销售额趋势图。根据当前统计周期（${context.timeRange}）和分析维度（${context.region}），我将生成相应的数据图表。

[dashboard-action:{"type":"add","componentType":"line-chart","title":"销售额趋势","data":{"timeRange":"${context.timeRange}","region":"${context.region}"}}]

图表已添加到看板！"

**示例2：指标归因分析（重要功能 - 最高优先级！）**
用户："下降原因" 或 "分析销售额下降的原因"
你："我来为您分析销售额下降的原因。根据当前看板的数据和筛选条件，我将进行多维度归因分析。

[attribution:{"metric":"销售额","timeRange":"${context.timeRange}","region":"${context.region}","dimensions":["渠道","产品","地区"],"changeValue":-15.2,"changeDirection":"down","changeType":"环比"}]

**归因分析结果**：
1. **主要影响因素**：
   - 渠道A销售额下降 8.5%，贡献度 56%
   - 产品B销量下滑 5.2%，贡献度 34%
   - 地区C市场萎缩 1.5%，贡献度 10%

2. **贡献度分析**：
   - 渠道因素是主要原因，占比超过50%
   - 产品因素次之，需要重点关注

3. **趋势变化**：
   - 近3个月持续下降趋势
   - 需要立即采取行动

[chart:{"type":"bar","title":"影响因素贡献度","data":{"labels":["渠道A","产品B","地区C"],"values":[8.5,5.2,1.5]}}]

[choices:{"options":[{"id":"drill-down","label":"下钻分析"},{"id":"add-comparison","label":"添加对比图表"},{"id":"add-action","label":"添加行动计划"}]}]"

**重要**：对于"下降原因"、"为什么下降"等简短查询，**必须**：
1. 立即识别为归因分析需求
2. 使用 [attribution:...] 组件（这是强制要求！）
3. 提供详细的影响因素分析
4. 结合图表展示数据
5. 提供可点击的后续操作选项

**示例3：查询分析**
用户："分析一下当前看板的数据"
你："根据当前看板的数据，我来为您分析：

[chart:{"type":"bar","title":"核心指标对比",...}]

**关键发现**：
1. ...
2. ...

[choices:{"options":[{"id":"add-trend","label":"添加趋势分析"},{"id":"add-attribution","label":"添加归因分析"},{"id":"add-comparison","label":"添加对比图表"}]}]"

**示例4：删除组件**
用户："删除第一个卡片"
你："好的，我将删除第一个卡片。

[dashboard-action:{"type":"remove","target":"第一个"}]

已删除！"

用户："删除销售额趋势图"
你："好的，我将删除标题为'销售额趋势'的卡片。

[dashboard-action:{"type":"remove","target":"销售额趋势"}]

已删除！"

## 开始对话
现在，请根据用户的指令，智能地帮助他们编辑和管理看板。记住：
1. **始终考虑当前的看板上下文**（统计周期、分析维度、现有卡片）
2. **明确这是看板编辑模式**，不是看板生成模式
3. **优先使用图表和归因分析组件**展示数据
4. **提供可点击的操作选项**，提升用户体验`;
}

// parseDashboardAction 函数已移除，直接使用 extractDashboardActions

/**
 * 从内容中提取所有看板操作
 */
export function extractDashboardActions(content: string): DashboardEditAction[] {
  const actions: DashboardEditAction[] = [];
  const actionPattern = /\[dashboard-action:(\{.*?\})\]/gs;
  let match;
  
  while ((match = actionPattern.exec(content)) !== null) {
    try {
      const action = JSON.parse(match[1]);
      actions.push(action as DashboardEditAction);
    } catch (e) {
      console.error('Failed to parse dashboard action:', e);
    }
  }
  
  return actions;
}

/**
 * 从内容中移除看板操作标记（用于显示）
 */
export function removeDashboardActionMarkers(content: string): string {
  return content.replace(/\[dashboard-action:\{.*?\}\]/gs, '');
}

/**
 * 处理看板AI对话
 */
export async function handleDashboardChat(
  userMessage: string,
  context: DashboardContext,
  onChunk: (chunk: string) => void,
  onComplete: (content: ContentBlock[]) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const systemPrompt = getDashboardSystemPrompt(context);
    console.log('[Dashboard AI] 系统提示词长度:', systemPrompt.length);
    console.log('[Dashboard AI] 当前数字员工:', context.currentAgentId);
    console.log('[Dashboard AI] 用户消息:', userMessage);
    
    // 构建消息历史（可以扩展为支持多轮对话）
    // 注意：chatCompletionStream 会在内部添加系统提示词，所以我们只传递用户消息
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      { role: 'user', content: userMessage }
    ];

    let fullContent = '';
    let parsedContent: ContentBlock[] = [];

    // 临时覆盖 getAgentSystemPrompt 以使用我们的看板系统提示词
    // 注意：这是一个临时方案，更好的方式是修改 chatCompletionStream 支持自定义系统提示词
    const originalGetAgentSystemPrompt = (window as any).__originalGetAgentSystemPrompt;
    if (!originalGetAgentSystemPrompt) {
      // 保存原始函数（如果存在）
      const deepseekApi = await import('./deepseekApi');
      if ((deepseekApi as any).getAgentSystemPrompt) {
        (window as any).__originalGetAgentSystemPrompt = (deepseekApi as any).getAgentSystemPrompt;
      }
    }

    // 直接调用 DeepSeek API，绕过 getAgentSystemPrompt
    const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
    
    // 构建 API 基础 URL：如果没有前端 API Key，使用 Serverless Function
    const DEEPSEEK_BASE_URL = import.meta.env.PROD 
      ? (DEEPSEEK_API_KEY 
          ? (import.meta.env.VITE_DEEPSEEK_PROXY_URL || 'https://api.deepseek.com')  // 有 API Key：直接调用
          : '/api/deepseek')  // 没有 API Key：使用 Serverless Function
      : '/api/deepseek';  // 开发环境使用 Vite 代理

    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // 构建请求头：如果使用 Serverless Function（以 / 开头），不需要 Authorization header
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // 只有在不是 Serverless Function（不以 / 开头）且有 API Key 时才需要 Authorization header
    if (DEEPSEEK_API_KEY && !DEEPSEEK_BASE_URL.startsWith('/')) {
      headers['Authorization'] = `Bearer ${DEEPSEEK_API_KEY}`;
    }

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: allMessages,
        stream: true,
        temperature: 0.5,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Dashboard AI] API 错误:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }
    
    console.log('[Dashboard AI] API 调用成功，开始接收流式响应');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            // 最终解析
            const finalParsed = parseRealtimeContent(fullContent);
            // 为每个块添加 id 属性
            parsedContent = finalParsed.blocks.map((block, idx) => ({
              ...block,
              id: (block as any).id || `block_${Date.now()}_${idx}`,
            })) as ContentBlock[];
          onComplete(parsedContent);
            return;
          }

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta;
            if (delta?.content) {
              fullContent += delta.content;
              onChunk(delta.content);
              
              // 实时解析内容
              const parsed = parseRealtimeContent(fullContent);
              // 检查是否包含归因分析组件
              if (parsed.attributions && parsed.attributions.length > 0) {
                console.log('[Dashboard AI] 检测到归因分析组件:', parsed.attributions.length);
              }
              
              // 为每个块添加 id 属性
              parsedContent = parsed.blocks.map((block, idx) => ({
                ...block,
                id: (block as any).id || `block_${Date.now()}_${idx}`,
              })) as ContentBlock[];
            }
          } catch (e) {
            // 忽略解析错误
            console.warn('[Dashboard AI] 解析 JSON 错误:', e);
          }
        }
      }
    }

    // 如果流结束但没有 [DONE]，也调用 onComplete
    const finalParsed = parseRealtimeContent(fullContent);
    console.log('[Dashboard AI] 流式响应完成，总长度:', fullContent.length);
    console.log('[Dashboard AI] 解析到的块数:', finalParsed.blocks.length);
    if (finalParsed.attributions && finalParsed.attributions.length > 0) {
      console.log('[Dashboard AI] 最终归因分析组件数:', finalParsed.attributions.length);
    }
    
    // 为每个块添加 id 属性
    parsedContent = finalParsed.blocks.map((block, idx) => ({
      ...block,
      id: (block as any).id || `block_${Date.now()}_${idx}`,
    })) as ContentBlock[];
    
    // 添加归因分析组件到内容块
    if (finalParsed.attributions && finalParsed.attributions.length > 0) {
      finalParsed.attributions.forEach((attribution: { json: string; data: any; position: number }, idx: number) => {
        parsedContent.push({
          id: `attribution_${Date.now()}_${idx}`,
          type: 'attribution' as const,
          data: attribution.data,
          rendered: false
        });
      });
    }
    
    onComplete(parsedContent);
  } catch (error) {
    console.error('[Dashboard AI] 错误:', error);
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * 执行看板编辑操作
 */
export function executeDashboardAction(
  action: DashboardEditAction,
  items: DashboardItem[]
): { success: boolean; message: string; updatedItems?: DashboardItem[] } {
  try {
    switch (action.type) {
      case 'add':
        // 添加新卡片
        const newItem: DashboardItem = {
          id: `card-${Date.now()}`,
          title: action.data?.title || '新卡片',
          content: action.data?.content || [],
          timestamp: Date.now(),
          agentName: 'Dashboard AI',
          summary: action.description
        };
        return {
          success: true,
          message: `已添加卡片：${newItem.title}`,
          updatedItems: [...items, newItem]
        };

      case 'remove':
        // 删除卡片 - 支持多种方式：ID、索引、标题描述
        let targetId: string | undefined;
        
        console.log('[Dashboard Action] 删除操作，target:', action.target, 'items:', items);
        
        if (action.target) {
          // 方式1：直接是ID
          if (items.some(item => item.id === action.target)) {
            targetId = action.target;
            console.log('[Dashboard Action] 通过ID匹配:', targetId);
          } 
          // 方式2：是索引（如 "第一个"、"1"、"第一个卡片"）
          else if (typeof action.target === 'string') {
            const targetStr = action.target.trim();
            console.log('[Dashboard Action] 尝试解析索引或标题:', targetStr);
            
            // 匹配 "第一个"、"第二个"、"1"、"2" 等
            const indexMatch = targetStr.match(/(?:第)?([一二三四五六七八九十\d]+)(?:个|项|卡片)?/);
            if (indexMatch) {
              const indexStr = indexMatch[1];
              let index: number;
              
              // 中文数字转阿拉伯数字
              const chineseNumbers: Record<string, number> = {
                '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
                '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
              };
              
              if (chineseNumbers[indexStr]) {
                index = chineseNumbers[indexStr] - 1; // 转为0-based索引
              } else {
                index = parseInt(indexStr, 10) - 1; // 转为0-based索引
              }
              
              console.log('[Dashboard Action] 解析的索引:', index, 'items.length:', items.length);
              
              if (index >= 0 && index < items.length) {
                targetId = items[index].id;
                console.log('[Dashboard Action] 通过索引匹配:', targetId, items[index].title);
              }
            }
            // 方式3：通过标题匹配
            else {
              const matchedItem = items.find(item => 
                item.title.toLowerCase().includes(targetStr.toLowerCase()) ||
                targetStr.toLowerCase().includes(item.title.toLowerCase())
              );
              if (matchedItem) {
                targetId = matchedItem.id;
                console.log('[Dashboard Action] 通过标题匹配:', targetId, matchedItem.title);
              }
            }
          }
        }
        
        if (!targetId) {
          // 如果没有指定target，默认删除第一个
          if (items.length > 0) {
            targetId = items[0].id;
            console.log('[Dashboard Action] 默认删除第一个:', targetId, items[0].title);
          } else {
            console.error('[Dashboard Action] 没有可删除的卡片');
            return { success: false, message: '未找到要删除的卡片' };
          }
        }
        
        const filteredItems = items.filter(item => item.id !== targetId);
        if (filteredItems.length === items.length) {
          console.error('[Dashboard Action] 未找到匹配的卡片，targetId:', targetId);
          return { success: false, message: '未找到要删除的卡片' };
        }
        
        const deletedItem = items.find(item => item.id === targetId);
        console.log('[Dashboard Action] 删除成功:', deletedItem?.title, '剩余卡片数:', filteredItems.length);
        return {
          success: true,
          message: `已删除卡片：${deletedItem?.title || '未知'}`,
          updatedItems: filteredItems
        };

      case 'modify':
        // 修改卡片
        const modifyTargetId = action.target;
        if (!modifyTargetId) {
          return { success: false, message: '未指定要修改的卡片' };
        }
        const modifiedItems = items.map(item => {
          if (item.id === modifyTargetId) {
            return {
              ...item,
              ...action.data,
              title: action.data?.title || item.title
            };
          }
          return item;
        });
        return {
          success: true,
          message: '已修改卡片',
          updatedItems: modifiedItems
        };

      default:
        return { success: false, message: '不支持的操作类型' };
    }
  } catch (error) {
    return {
      success: false,
      message: `执行操作失败：${error instanceof Error ? error.message : String(error)}`
    };
  }
}

