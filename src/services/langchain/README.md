# LangChain 风格服务 - 爱玛电动车数字员工

## 📋 概述

这是为爱玛电动车数字员工设计的 LangChain 风格对话服务。虽然不直接依赖 LangChain 库（避免浏览器兼容性问题），但采用了 LangChain 的核心设计理念：

- **提示词模板管理**：使用模板化的系统提示词
- **对话记忆管理**：为每个员工维护独立的对话历史
- **链式调用**：系统提示词 + 历史记录 + 当前查询的链式处理
- **流式响应**：支持实时流式输出

## 🏗️ 架构设计

### 核心组件

1. **ConversationMemory**：对话记忆管理类
   - 自动维护对话历史
   - 限制历史长度（最近20轮）
   - 为每个员工创建独立记忆实例

2. **streamAimaResponse**：流式对话服务
   - 自动获取系统提示词
   - 管理对话历史
   - 调用 DeepSeek API 流式响应
   - 实时更新记忆

3. **getAimaResponse**：非流式对话服务
   - 用于快速响应场景
   - 同样支持记忆管理

## 🔄 工作流程

```
用户查询
  ↓
检测是否为爱玛员工 (agentId.startsWith('aima-'))
  ↓
调用 LangChain 风格服务
  ↓
获取系统提示词模板 (getAimaSystemPrompt)
  ↓
加载对话记忆 (ConversationMemory)
  ↓
构建消息链：[系统提示词] + [历史记录] + [当前查询]
  ↓
调用 DeepSeek API (流式)
  ↓
实时返回响应块 (onChunk)
  ↓
更新对话记忆
  ↓
完成 (onComplete)
```

## 🎯 核心特性

### 1. 智能提示词管理
- 使用 `getAimaSystemPrompt()` 获取专业的系统提示词
- 包含完整的爱玛业务背景和角色设定
- 支持不同员工使用不同的提示词模板

### 2. 对话记忆管理
- 每个爱玛员工有独立的记忆实例
- 自动维护最近20轮对话历史
- 支持清除记忆（`clearAimaMemory`）

### 3. 流式响应
- 实时返回 AI 生成的内容
- 支持用户中途停止
- 自动更新对话记忆

### 4. 错误处理
- 完善的错误捕获和日志记录
- 失败时自动回退到标准 API 调用
- 不影响其他数字员工的使用

## 📝 使用示例

### 在 App.tsx 中的自动调用

当用户选择爱玛员工并发送消息时，系统会自动：

1. 检测 `agentId.startsWith('aima-')`
2. 调用 `streamAimaResponse`
3. 使用 LangChain 风格服务处理

### 手动调用（如果需要）

```typescript
import { streamAimaResponse } from './services/langchain/aimaLangChainService';

await streamAimaResponse(
  'aima-data-master',
  '艾玛数据专家',
  '爱玛数据部门 · 数据分析专家',
  '分析本月电动自行车销售情况',
  [], // 对话历史
  (chunk) => console.log('收到:', chunk),
  () => console.log('完成'),
  (error) => console.error('错误:', error)
);
```

## 🔧 配置说明

### 环境变量
- `VITE_DEEPSEEK_API_KEY`：DeepSeek API 密钥（必需）

### 记忆配置
- `maxHistoryLength`：默认保留最近20轮对话
- 可在 `ConversationMemory` 类中调整

## 🆚 与标准 API 调用的区别

| 特性 | 标准 API 调用 | LangChain 风格服务 |
|------|--------------|-------------------|
| 提示词管理 | 字符串拼接 | 模板化系统提示词 |
| 对话记忆 | 手动管理 | 自动管理（独立实例） |
| 错误处理 | 基础重试 | 完善错误处理 + 自动回退 |
| 日志记录 | 基础日志 | 详细日志（开发调试） |
| 适用场景 | 通用员工 | 爱玛专用员工 |

## 📊 性能优化

1. **记忆限制**：只保留最近20轮对话，避免上下文过长
2. **延迟加载**：LangChain 服务按需动态导入
3. **错误回退**：失败时自动回退，不影响用户体验

## 🐛 调试

启用详细日志：
- 查看浏览器控制台的 `[LangChain Service]` 日志
- 查看 `[DeepSeek API]` 日志了解调用流程

## 🔄 后续扩展

可以进一步扩展：
1. 添加工具调用（Tools）
2. 添加检索增强生成（RAG）
3. 添加多步骤推理链
4. 添加输出解析器



