# API Key 更新指南

## 问题说明

如果 DeepSeek API Key 过期了，会出现以下错误：
- `401 Unauthorized` - API Key 无效或已过期
- `403 Forbidden` - API 访问被拒绝
- 无法连接到 DeepSeek API

## 解决方案

### 方案一：使用环境变量（推荐）

1. **获取新的 API Key**
   - 访问 [DeepSeek API 控制台](https://platform.deepseek.com/)
   - 登录账号，获取新的 API Key

2. **创建 `.env` 文件**
   
   在项目根目录创建 `.env` 文件（如果不存在）：
   ```env
   # 前端使用的 API Key（Vite 环境变量）
   VITE_DEEPSEEK_API_KEY=你的新API-Key
   
   # 后端使用的 API Key（Node.js 环境变量）
   DEEPSEEK_API_KEY=你的新API-Key
   ```

3. **重启服务**
   - 停止当前运行的服务（Ctrl+C）
   - 重新启动开发服务器：`npm run dev`
   - 重新启动后端服务器：`node server.js`

### 方案二：直接修改代码（快速但不推荐）

如果不想使用环境变量，可以直接修改代码中的 API Key：

1. **修改前端 API Key**
   
   编辑 `src/services/deepseekApi.ts` 第4行：
   ```typescript
   const DEEPSEEK_API_KEY = '你的新API-Key';
   ```

2. **修改后端 API Key**
   
   编辑 `server.js` 第16行：
   ```javascript
   const DEEPSEEK_API_KEY = '你的新API-Key';
   ```

3. **重启服务**

## 验证更新

更新后，测试一下 API 是否正常工作：
1. 打开应用，发送一条消息
2. 检查浏览器控制台是否有错误
3. 如果看到正常的 AI 回复，说明更新成功

## 注意事项

1. **不要提交 API Key 到 Git**
   - `.env` 文件已经在 `.gitignore` 中，不会被提交
   - 如果直接修改代码，记得不要提交包含真实 API Key 的代码

2. **API Key 格式**
   - DeepSeek API Key 通常以 `sk-` 开头
   - 例如：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **环境变量优先级**
   - 代码已更新为优先使用环境变量
   - 如果环境变量不存在，会使用代码中的默认值（用于开发环境）

## 常见问题

### Q: 更新后还是报错？
A: 检查以下几点：
1. API Key 是否正确（没有多余空格）
2. 是否重启了服务
3. 网络连接是否正常
4. API Key 是否还有配额

### Q: 如何检查 API Key 是否有效？
A: 可以使用 curl 命令测试：
```bash
curl https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer 你的API-Key"
```

如果返回模型列表，说明 API Key 有效。

### Q: 生产环境如何配置？
A: 生产环境建议：
1. 使用环境变量（不要硬编码）
2. 使用密钥管理服务（如 AWS Secrets Manager、Azure Key Vault）
3. 定期轮换 API Key



