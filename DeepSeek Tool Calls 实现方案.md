# DeepSeek Tool Calls 实现方案

## 📋 概述

根据 [DeepSeek API 的 Tool Calls 文档](https://api-docs.deepseek.com/zh-cn/guides/tool_calls)，我们可以通过 Tool Calls 功能实现联网搜索，而不需要使用腾讯云 API。

## 🔑 核心原理

### Tool Calls 工作流程

1. **定义工具函数**：在 API 请求中传入 `tools` 参数，定义 `web_search` 工具
2. **模型调用工具**：当模型需要搜索时，它会返回一个 `tool_calls` 响应
3. **执行工具**：我们在前端/后端执行实际的搜索（使用 Google Search API、Bing Search API 等）
4. **返回结果**：将搜索结果作为 `tool` 角色的消息返回给模型
5. **生成回复**：模型基于搜索结果生成最终回复

### API 请求格式

```typescript
{
  model: "deepseek-chat",
  messages: [
    { role: "system", content: "..." },
    { role: "user", content: "搜索最新的AI行业报告" }
  ],
  tools: [
    {
      type: "function",
      function: {
        name: "web_search",
        description: "搜索互联网上的最新信息。当用户需要实时信息、最新资讯、行业报告、新闻动态等时使用此工具。",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "搜索查询关键词，使用中文或英文"
            }
          },
          required: ["query"]
        }
      }
    }
  ],
  stream: true
}
```

### 响应处理

当模型需要调用工具时，响应格式如下：

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": null,
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "web_search",
          "arguments": "{\"query\": \"AI行业报告2024\"}"
        }
      }]
    }
  }]
}
```

我们需要：
1. 检测 `tool_calls` 的存在
2. 执行搜索函数
3. 将结果作为新消息追加到对话中
4. 再次调用 API 生成最终回复

## 📝 实现步骤

### 步骤 1: 定义 Web Search 工具

在 `src/services/deepseekApi.ts` 中定义工具：

```typescript
const WEB_SEARCH_TOOL = {
  type: "function" as const,
  function: {
    name: "web_search",
    description: "搜索互联网上的最新信息。当用户需要实时信息、最新资讯、行业报告、新闻动态、市场分析、竞品信息等时使用此工具。",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "搜索查询关键词，使用中文或英文。例如：'AI行业报告2024'、'最新的ChatGPT动态'"
        }
      },
      required: ["query"]
    }
  }
};
```

### 步骤 2: 实现搜索函数

需要选择并集成一个搜索 API：

**选项 1: Google Custom Search API（推荐）**
- 免费额度：每天 100 次搜索
- 需要 API Key 和 Search Engine ID
- 文档：https://developers.google.com/custom-search/v1/overview

**选项 2: Bing Search API**
- 免费额度：每月 1000 次搜索
- 需要 API Key
- 文档：https://www.microsoft.com/en-us/bing/apis/bing-web-search-api

**选项 3: SerpAPI**
- 付费服务，但提供免费试用
- 文档：https://serpapi.com/

**选项 4: DuckDuckGo（免费，无 API Key）**
- 通过 HTML 抓取实现
- 不需要 API Key
- 但可能不稳定

### 步骤 3: 修改 API 调用逻辑

需要修改 `chatCompletionStream` 函数：

1. 在请求中添加 `tools` 参数
2. 处理流式响应中的 `tool_calls`
3. 执行搜索函数
4. 将搜索结果追加到消息列表
5. 再次调用 API 生成最终回复

### 步骤 4: 处理工具调用循环

由于工具调用可能需要多轮交互，需要实现循环处理：

```
用户查询 → API 调用（带 tools） → 检测 tool_calls → 执行搜索 → 追加 tool response → 再次调用 API → 返回最终回复
```

## 💡 优势

相比腾讯云 API 方案：

1. ✅ **使用官方 API**：不需要切换 API 提供商
2. ✅ **更灵活**：可以自定义搜索逻辑和结果处理
3. ✅ **成本可控**：可以选择免费或低成本的搜索 API
4. ✅ **功能扩展**：未来可以添加更多工具（如计算器、天气查询等）

## ⚠️ 注意事项

1. **搜索 API 选择**：需要选择一个可靠的搜索 API 服务
2. **错误处理**：需要处理搜索失败的情况
3. **流式响应**：工具调用的处理需要适配流式响应格式
4. **多轮对话**：工具调用可能发生在多轮对话中，需要正确处理消息历史

## 🚀 下一步

1. 选择并配置搜索 API（推荐 Google Custom Search API）
2. 实现搜索函数
3. 修改 `chatCompletionStream` 以支持工具调用
4. 测试工具调用流程
5. 处理错误情况和边界情况

