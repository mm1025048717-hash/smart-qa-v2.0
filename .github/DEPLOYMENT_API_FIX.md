# GitHub Pages 部署 DeepSeek API 配置指南

## 问题说明

GitHub Pages 是静态网站托管，无法运行后端服务（如 Vite 开发服务器的代理）。因此：

1. **无法使用 `/api/deepseek` 代理路径**（这个路径在 GitHub Pages 上不存在）
2. **直接调用 `https://api.deepseek.com` 会遇到 CORS 跨域问题**
3. **API Key 需要安全配置**

## 解决方案

### 方案 1: 配置 GitHub Secrets（推荐）

1. **添加 API Key 到 GitHub Secrets**：
   - 访问：https://github.com/mm1025048717-hash/smart-qa-v2.0/settings/secrets/actions
   - 点击 "New repository secret"
   - Name: `VITE_DEEPSEEK_API_KEY`
   - Value: 你的 DeepSeek API Key
   - 点击 "Add secret"

2. **工作流已配置**：
   - `.github/workflows/deploy.yml` 已配置从 Secrets 读取 API Key
   - 构建时会自动注入到前端代码

3. **处理 CORS 问题**：
   - 由于浏览器直接调用会遇到 CORS，建议使用方案 2（后端代理）

### 方案 2: 使用后端代理服务（最佳方案）

由于 GitHub Pages 无法运行后端，需要部署一个独立的代理服务：

#### 选项 A: 使用 Vercel Serverless Functions

1. **创建 `api/deepseek.ts`**：
```typescript
export default async function handler(req: any, res: any) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured' });
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
```

2. **部署到 Vercel**：
   - 将项目部署到 Vercel
   - 在 Vercel 环境变量中配置 `DEEPSEEK_API_KEY`
   - 修改前端代码中的 `DEEPSEEK_BASE_URL` 为 Vercel 的 API 地址

#### 选项 B: 使用 Cloudflare Workers

创建 Cloudflare Worker 作为代理，处理 CORS 和 API Key。

#### 选项 C: 使用自己的服务器

如果你有自己的服务器，可以部署 `server.js` 作为代理服务。

### 方案 3: 临时解决方案（仅用于测试）

如果只是测试，可以：

1. **配置 GitHub Secrets**（必须）
2. **修改代码处理 CORS**（不推荐，仅测试用）

在 `src/services/deepseekApi.ts` 中添加错误处理，提示用户 CORS 问题。

## 当前配置状态

✅ **已修复**：
- 生产环境直接调用 `https://api.deepseek.com`
- GitHub Actions 工作流已配置读取 Secrets

⚠️ **待处理**：
- 需要配置 GitHub Secrets（添加 `VITE_DEEPSEEK_API_KEY`）
- 需要处理 CORS 问题（建议使用后端代理）

## 立即操作

1. **配置 GitHub Secrets**：
   ```
   https://github.com/mm1025048717-hash/smart-qa-v2.0/settings/secrets/actions
   ```

2. **重新触发部署**：
   - 推送一个小的更改，或
   - 在 Actions 页面手动触发工作流

3. **如果遇到 CORS 错误**：
   - 考虑使用 Vercel 或其他平台部署后端代理
   - 或使用自己的服务器运行 `server.js`



