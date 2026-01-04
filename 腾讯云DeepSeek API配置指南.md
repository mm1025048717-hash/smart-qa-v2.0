# 腾讯云 DeepSeek API 配置指南

## 📋 概述

腾讯云已上线 DeepSeek-R1 和 V3 原版模型的 API 接口，并**率先支持联网搜索功能**。这使得开发者能够快速构建基于 DeepSeek 大模型的联网应用。

## 🔑 关键信息

### 接入点地址
- **Base URL**: `https://api.lkeap.cloud.tencent.com/v1`
- **完整 API 端点**: `https://api.lkeap.cloud.tencent.com/v1/chat/completions`

### 启用联网搜索参数
- **参数名**: `search_enabled`
- **参数值**: `true`
- **说明**: 在 API 请求中设置此参数为 `true` 即可启用联网搜索功能

## 📝 配置步骤

### 步骤 1: 注册/登录腾讯云账号

1. 访问腾讯云官网: https://cloud.tencent.com/
2. 注册或登录您的账号

### 步骤 2: 开通 DeepSeek API 服务

1. 登录腾讯云控制台
2. 搜索并进入"大模型知识引擎"或"DeepSeek API"服务
3. 开通服务并获取 API Key

### 步骤 3: 获取 API Key

1. 在腾讯云控制台的 API 密钥管理页面
2. 创建并获取您的 API Key
3. 保存好 API Key（格式类似: `sk-xxxxx`）

### 步骤 4: 配置到项目

#### 方法 1: 通过环境变量配置（推荐）

1. 在项目根目录的 `.env` 文件中添加：
   ```env
   # 腾讯云 DeepSeek API
   VITE_DEEPSEEK_API_KEY=your_tencent_cloud_api_key_here
   VITE_DEEPSEEK_BASE_URL=https://api.lkeap.cloud.tencent.com/v1
   VITE_DEEPSEEK_ENABLE_SEARCH=true
   ```

2. 重启开发服务器

#### 方法 2: 修改代码配置

需要修改以下文件：

1. **`src/services/deepseekApi.ts`**
   - 修改 `DEEPSEEK_BASE_URL` 为腾讯云地址
   - 在 API 请求中添加 `search_enabled: true` 参数

2. **`api/deepseek.js`** (如果使用代理)
   - 修改 `DEEPSEEK_API_URL` 为腾讯云地址
   - 在请求体中添加 `search_enabled: true` 参数

## 💻 代码示例

### 前端调用示例 (TypeScript)

```typescript
const response = await fetch('https://api.lkeap.cloud.tencent.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${YOUR_TENCENT_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'deepseek-chat',  // 或 'deepseek-reasoner'
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: '搜索最新的AI行业报告' }
    ],
    stream: false,
    search_enabled: true,  // ⭐ 启用联网搜索
    temperature: 0.7,
  }),
});
```

### 后端代理示例 (Node.js)

```javascript
const response = await fetch('https://api.lkeap.cloud.tencent.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.TENCENT_DEEPSEEK_API_KEY}`,
  },
  body: JSON.stringify({
    ...requestBody,
    search_enabled: true,  // ⭐ 启用联网搜索
  }),
});
```

## 🔄 与官方 API 的区别

| 特性 | DeepSeek 官方 API | 腾讯云 DeepSeek API |
|------|------------------|-------------------|
| Base URL | `https://api.deepseek.com` | `https://api.lkeap.cloud.tencent.com/v1` |
| 联网搜索 | ❌ 不支持 | ✅ 支持 (`search_enabled: true`) |
| API Key 格式 | `sk-xxxxx` | `sk-xxxxx` (相同格式) |
| 模型支持 | deepseek-chat, deepseek-reasoner | 相同 |
| 费用 | DeepSeek 官方定价 | 腾讯云定价 |

## ⚠️ 注意事项

1. **API Key 安全**
   - 不要将 API Key 提交到 Git 仓库
   - 使用环境变量存储 API Key
   - `.env` 文件已在 `.gitignore` 中

2. **费用说明**
   - 腾讯云 DeepSeek API 使用腾讯云的计费方式
   - 请查看腾讯云的定价页面了解费用详情

3. **网络要求**
   - 确保服务器可以访问 `api.lkeap.cloud.tencent.com`
   - 如果使用代理，需要配置相应的代理规则

4. **参数兼容性**
   - 腾讯云 API 兼容 OpenAI 格式
   - 大多数参数与官方 API 相同
   - 主要区别是增加了 `search_enabled` 参数

## 🚀 快速开始

1. **获取腾讯云 API Key**
   - 登录腾讯云控制台
   - 创建并获取 API Key

2. **配置环境变量**
   ```bash
   # 在 .env 文件中添加
   VITE_DEEPSEEK_API_KEY=your_tencent_api_key
   VITE_DEEPSEEK_BASE_URL=https://api.lkeap.cloud.tencent.com/v1
   VITE_DEEPSEEK_ENABLE_SEARCH=true
   ```

3. **修改代码启用联网搜索**
   - 修改 `src/services/deepseekApi.ts`
   - 在 API 请求中添加 `search_enabled: true`

4. **测试联网搜索功能**
   - 启动开发服务器
   - 测试"联网搜索测试"用例
   - 验证是否能正常搜索网络内容

## 📚 参考资源

- [腾讯云大模型知识引擎文档](https://cloud.tencent.com/document/product/1729)
- [DeepSeek 官方 API 文档](https://api-docs.deepseek.com/zh-cn/)
- [腾讯云控制台](https://console.cloud.tencent.com/)

## ❓ 常见问题

### Q: 腾讯云 API 和官方 API 可以同时使用吗？
A: 可以，但需要分别配置不同的 Base URL 和 API Key。

### Q: 联网搜索是否需要额外费用？
A: 请查看腾讯云的定价页面，联网搜索功能可能有额外的费用。

### Q: 如何切换回官方 API？
A: 只需将 `VITE_DEEPSEEK_BASE_URL` 改回 `https://api.deepseek.com`，并移除 `search_enabled` 参数。

### Q: 联网搜索的搜索结果如何控制？
A: 腾讯云 API 会自动处理搜索逻辑，搜索结果会包含在模型回复中。您可以通过系统提示词引导模型使用搜索结果。

