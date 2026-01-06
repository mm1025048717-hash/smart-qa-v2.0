/**
 * 爱玛电动车数字员工 LangChain 风格服务
 * 使用 LangChain 设计理念管理对话流程，集成 DeepSeek 大模型
 * 适配浏览器环境，不依赖 LangChain 库
 */

import { getAimaSystemPrompt } from '../agents/aima/aimaAgents';
import { getToolsForAPI, executeTool, type ToolCall, type ToolResult } from './aimaTools';

// DeepSeek API 配置
// 根据 DeepSeek API 文档: https://api-docs.deepseek.com/zh-cn/
// base_url: https://api.deepseek.com
// 与主服务保持一致：开发环境使用 Vite 代理，生产环境直接调用
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';

// 开发环境调试：检查 API Key 是否被正确读取
if (import.meta.env.DEV) {
  console.log('[LangChain Service] 🔑 API Key 状态:', {
    hasKey: !!DEEPSEEK_API_KEY,
    keyPrefix: DEEPSEEK_API_KEY ? `${DEEPSEEK_API_KEY.slice(0, 8)}...${DEEPSEEK_API_KEY.slice(-4)}` : '未设置',
    envVar: import.meta.env.VITE_DEEPSEEK_API_KEY ? '已读取' : '未读取',
  });
}
const DEEPSEEK_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_DEEPSEEK_PROXY_URL || 'https://api.deepseek.com')  // 生产环境：直接调用
  : '/api/deepseek';  // 开发环境使用 Vite 代理

/**
 * 对话记忆管理（LangChain 风格）
 */
class ConversationMemory {
  private history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private maxHistoryLength = 20; // 保留最近20轮对话

  addMessage(role: 'user' | 'assistant', content: string) {
    this.history.push({ role, content });
    // 保持历史记录在合理范围内
    if (this.history.length > this.maxHistoryLength) {
      this.history = this.history.slice(-this.maxHistoryLength);
    }
  }

  getHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return [...this.history];
  }

  clear() {
    this.history = [];
  }
}

// 为每个爱玛员工创建独立的记忆实例
const memoryStore: Map<string, ConversationMemory> = new Map();

function getMemory(agentId: string): ConversationMemory {
  if (!memoryStore.has(agentId)) {
    memoryStore.set(agentId, new ConversationMemory());
  }
  return memoryStore.get(agentId)!;
}

/**
 * 流式调用 LangChain 风格的对话服务
 */
export async function streamAimaResponse(
  agentId: string,
  agentName: string,
  agentTitle: string,
  userQuery: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    // 获取系统提示词（LangChain 风格：使用模板）
    const systemPrompt = getAimaSystemPrompt(agentId);

    // 获取对话记忆
    const memory = getMemory(agentId);
    
    // 更新记忆（使用传入的历史记录）
    memory.clear();
    chatHistory.forEach(msg => {
      memory.addMessage(msg.role, msg.content);
    });
    memory.addMessage('user', userQuery);

    // 构建消息（LangChain 风格：系统提示 + 历史 + 当前查询）
    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...memory.getHistory().map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    console.log('[LangChain Service] 🚀 开始调用 DeepSeek API', {
      agentId,
      agentName,
      userQuery,
      messageCount: allMessages.length,
      systemPromptLength: systemPrompt.length,
      chatHistoryLength: chatHistory.length,
      apiKey: DEEPSEEK_API_KEY ? `${DEEPSEEK_API_KEY.slice(0, 8)}...` : '未设置',
    });

    // 调用 DeepSeek API（流式）
    // 开发环境：使用代理路径（Vite 会自动添加 /v1/chat/completions）
    // 生产环境：直接调用完整路径
    const apiUrl = import.meta.env.PROD 
      ? `${DEEPSEEK_BASE_URL}/chat/completions`
      : `${DEEPSEEK_BASE_URL}/chat/completions`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: allMessages,
        stream: true,
        temperature: 0.5, // 降低温度，提高稳定性和速度
        top_p: 0.9, // 提高top_p，加快采样速度
        tools: getToolsForAPI(), // 添加工具定义
        tool_choice: 'auto', // 自动选择工具
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    // 处理流式响应（支持工具调用）
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let toolCalls: ToolCall[] = [];

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            // 处理工具调用
            if (toolCalls.length > 0) {
              await handleToolCalls(toolCalls, allMessages, onChunk, memory, agentId);
            }
            // 流式输出完成，更新记忆
            memory.addMessage('assistant', fullResponse);
            onComplete();
            return;
          }

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta || {};
            
            // 处理文本内容
            const content = delta.content || '';
            if (content) {
              fullResponse += content;
              onChunk(content);
            }

            // 处理工具调用
            if (delta.tool_calls) {
              for (const toolCallDelta of delta.tool_calls) {
                const index = toolCallDelta.index || 0;
                
                if (!toolCalls[index]) {
                  toolCalls[index] = {
                    id: toolCallDelta.id || `call_${index}`,
                    type: 'function',
                    function: {
                      name: '',
                      arguments: '',
                    },
                  };
                }
                
                if (toolCallDelta.function) {
                  if (toolCallDelta.function.name) {
                    toolCalls[index].function.name = toolCallDelta.function.name;
                  }
                  if (toolCallDelta.function.arguments) {
                    toolCalls[index].function.arguments += toolCallDelta.function.arguments;
                  }
                }
              }
            }
          } catch (e) {
            // 忽略解析错误，继续处理下一行
            console.warn('Failed to parse SSE chunk:', e);
          }
        }
      }
    }

    // 处理工具调用
    if (toolCalls.length > 0) {
      await handleToolCalls(toolCalls, allMessages, onChunk, memory);
    }

    // 流式输出完成
    memory.addMessage('assistant', fullResponse);
    onComplete();
  } catch (error) {
    console.error('[LangChain Service] Error:', error);
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * 处理工具调用 - 使用类似思维链的格式输出
 */
async function handleToolCalls(
  toolCalls: ToolCall[],
  allMessages: any[],
  onChunk: (chunk: string) => void,
  memory: ConversationMemory,
  agentId?: string
): Promise<void> {
  // 生成工具调用链数据
  const toolCallItems: Array<{
    id: string;
    toolName: string;
    toolDisplayName: string;
    status: 'loading' | 'success' | 'error';
    arguments?: Record<string, any>;
    result?: any;
    error?: string;
    startTime?: number;
    endTime?: number;
  }> = [];

  // 首先输出工具调用链的开始（loading状态）
  for (const toolCall of toolCalls) {
    let args: Record<string, any> = {};
    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.warn('[Tool Call] Failed to parse arguments:', toolCall.function.arguments);
    }

    const toolItem = {
      id: toolCall.id,
      toolName: toolCall.function.name,
      toolDisplayName: getToolDisplayName(toolCall.function.name),
      status: 'loading' as const,
      arguments: args,
      startTime: Date.now(),
    };
    toolCallItems.push(toolItem);
  }

  // 输出工具调用链（loading状态）
  const toolCallChainJson = JSON.stringify({
    items: toolCallItems,
  });
  onChunk(`[tool-call-chain:${toolCallChainJson}]`);

  // 执行工具调用
  const toolResults: ToolResult[] = [];
  
  for (let i = 0; i < toolCalls.length; i++) {
    const toolCall = toolCalls[i];
    const toolItem = toolCallItems[i];
    
    try {
      const startTime = Date.now();
      toolItem.startTime = startTime;
      
      // 更新状态为loading
      toolItem.status = 'loading';
      const loadingChainJson = JSON.stringify({
        items: toolCallItems,
      });
      onChunk(`[tool-call-chain:${loadingChainJson}]`);

      // 执行工具
      const result = await executeTool(toolCall);
      const endTime = Date.now();
      
      toolResults.push({
        ...result,
        tool_call_id: toolCall.id,
      });

      // 更新状态为success
      toolItem.status = 'success';
      toolItem.result = result.result;
      toolItem.endTime = endTime;

      // 输出更新后的工具调用链
      const successChainJson = JSON.stringify({
        items: toolCallItems,
      });
      onChunk(`[tool-call-chain:${successChainJson}]`);

    } catch (error) {
      console.error('[Tool Execution Error]', error);
      const endTime = Date.now();
      
      toolResults.push({
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        result: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      // 更新状态为error
      toolItem.status = 'error';
      toolItem.error = error instanceof Error ? error.message : String(error);
      toolItem.endTime = endTime;

      // 输出更新后的工具调用链
      const errorChainJson = JSON.stringify({
        items: toolCallItems,
      });
      onChunk(`[tool-call-chain:${errorChainJson}]`);
    }
  }

  // 如果有工具调用结果，再次调用API获取最终回复
  if (toolResults.length > 0 && toolResults.some(r => r.result?.success !== false)) {
    // 检查是否有PPT生成工具
    const hasPPTGeneration = toolCalls.some(tc => tc.function.name === 'generate_ppt');
    
    // 添加工具调用结果到消息中
    const toolMessages = toolResults.map(result => {
      let content = JSON.stringify(result.result);
      
      // 如果是PPT生成工具，添加明确的指令
      if (result.name === 'generate_ppt' && result.result?.ppt) {
        const pptData = result.result.ppt;
        content = `这是PPT生成工具的执行结果。你必须根据这个结果，生成真正的PPT内容，使用Markdown格式展示，包含标题页和所有章节页，每个章节必须包含图表展示数据。

PPT结构：
- 标题：${pptData.title}
- 主题：${pptData.theme}
- 章节数：${pptData.slides?.length || 0}页

请按照以下格式生成PPT内容：

# ${pptData.title}
${pptData.theme} | ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}

${pptData.slides?.map((slide: any, idx: number) => `## ${slide.title}

${slide.content || `这是${slide.title}的详细内容。`}

[请用图表展示${slide.title}相关的关键数据，使用 [chart:...] 格式]

${slide.notes || ''}`).join('\n\n') || ''}

**重要**：你必须用Markdown格式展示PPT，每个章节必须包含至少1-2个图表（使用 [chart:...] 格式），不要显示JSON结构。

原始工具结果（仅供参考）：
${JSON.stringify(result.result, null, 2)}`;
      }
      
      return {
        role: 'tool' as const,
        tool_call_id: result.tool_call_id,
        content,
      };
    });

    // 再次调用API，让模型基于工具结果生成最终回复
    try {
      // 获取正确的 agentId（从参数传入或使用默认值）
      const currentAgentId = agentId || 'aima-data-expert';
      const systemPrompt = getAimaSystemPrompt(currentAgentId);
      
      // 构建正确的消息序列：
      // 1. 系统消息（单独添加）
      // 2. 历史消息（排除系统消息和最后一个assistant消息，因为我们要添加带tool_calls的assistant消息）
      // 3. assistant 消息（包含 tool_calls）
      // 4. tool 消息（工具执行结果）
      const historyMessages = memory.getHistory().filter(msg => msg.role !== 'system');
      
      // 移除最后一个assistant消息（如果有），因为我们要添加带tool_calls的版本
      const filteredHistory = historyMessages.slice(0, -1);
      
      // 构建包含 tool_calls 的 assistant 消息
      // DeepSeek API 要求：当有 tool_calls 时，content 应该是空字符串或省略
      const assistantMessageWithToolCalls: any = {
        role: 'assistant',
        content: '', // 使用空字符串而不是 null
        tool_calls: toolCalls.map(tc => ({
          id: tc.id,
          type: tc.type,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        })),
      };

      // 构建完整的消息序列（不包含系统消息，系统消息会单独添加）
      const updatedMessages = [
        ...filteredHistory,
        assistantMessageWithToolCalls,
        ...toolMessages,
      ];

      const apiUrl = import.meta.env.PROD 
        ? `${DEEPSEEK_BASE_URL}/chat/completions`
        : `${DEEPSEEK_BASE_URL}/chat/completions`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            ...updatedMessages,
          ],
          stream: true,
          temperature: 0.5,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Tool Result API Error]', errorText);
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let finalResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }

              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content || '';
                if (content) {
                  finalResponse += content;
                  onChunk(content);
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      // 更新记忆
      memory.addMessage('assistant', finalResponse);
    } catch (error) {
      console.error('[Tool Result Processing Error]', error);
      // 即使处理失败，也继续显示工具调用结果
    }
  }
}

/**
 * 获取工具显示名称
 */
function getToolDisplayName(toolName: string): string {
  const displayNames: Record<string, string> = {
    generate_ppt: '生成PPT演示文稿',
    generate_report: '生成数据分析报告',
    analyze_data_trend: '分析数据趋势',
    compare_competitors: '对比竞品数据',
    generate_dashboard: '生成数据看板',
  };
  return displayNames[toolName] || toolName;
}

/**
 * 非流式调用（用于快速响应）
 */
export async function getAimaResponse(
  agentId: string,
  agentName: string,
  agentTitle: string,
  userQuery: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  try {
    const systemPrompt = getAimaSystemPrompt(agentId);
    const memory = getMemory(agentId);

    // 更新记忆
    memory.clear();
    chatHistory.forEach(msg => {
      memory.addMessage(msg.role, msg.content);
    });
    memory.addMessage('user', userQuery);

    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...memory.getHistory().map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const apiUrl = import.meta.env.PROD 
      ? `${DEEPSEEK_BASE_URL}/chat/completions`
      : `${DEEPSEEK_BASE_URL}/chat/completions`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: allMessages,
        stream: false,
        temperature: 0.5, // 降低温度，提高稳定性和速度
        top_p: 0.9, // 提高top_p，加快采样速度
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 更新记忆
    memory.addMessage('assistant', content);

    return content;
  } catch (error) {
    console.error('[LangChain Service] Error:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * 清除对话记忆
 */
export function clearAimaMemory(agentId: string) {
  const memory = getMemory(agentId);
  memory.clear();
}
