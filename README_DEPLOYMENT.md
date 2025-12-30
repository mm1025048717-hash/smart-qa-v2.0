# 部署完成指南

## ✅ 已完成的配置

1. **GitHub Secrets 已配置**：`VITE_DEEPSEEK_API_KEY`
2. **GitHub Actions 工作流已配置**：自动从 Secrets 读取 API Key
3. **代码已更新**：支持生产环境调用 DeepSeek API

## ⚠️ 重要：处理 CORS 问题

由于 GitHub Pages 是静态托管，直接调用 DeepSeek API 会遇到 CORS 跨域限制。

### 推荐方案：使用 Cloudflare Worker 代理（免费）

#### 快速部署步骤：

1. **注册 Cloudflare**：https://dash.cloudflare.com/sign-up

2. **创建 Worker**：
   - 登录后，点击 "Workers & Pages" → "Create Worker"
   - 名称：`deepseek-api-proxy`
   - 点击 "Deploy"

3. **配置代码**：
   - 点击 "Edit code"
   - 复制 `cloudflare-worker.js` 的内容
   - 粘贴并保存

4. **配置 API Key**：
   - Settings → Variables → Add variable
   - Name: `DEEPSEEK_API_KEY`
   - Value: `sk-b1551c8a25d042a7ae8b0166820249a8`
   - Save

5. **获取 Worker URL**：
   - 格式：`https://deepseek-api-proxy.your-username.workers.dev`
   - 复制这个 URL

6. **配置 GitHub Secrets**：
   - 访问：https://github.com/mm1025048717-hash/smart-qa-v2.0/settings/secrets/actions
   - 添加新的 Secret：
     - Name: `VITE_DEEPSEEK_PROXY_URL`
     - Value: 你的 Cloudflare Worker URL（例如：`https://deepseek-api-proxy.xxx.workers.dev`）

7. **重新部署**：
   ```bash
   git add .
   git commit -m "配置 Cloudflare Worker 代理"
   git push
   ```

### 详细部署文档

查看 `.cloudflare-deploy.md` 获取完整步骤。

## 🔍 验证部署

部署完成后，访问：
- GitHub Pages：https://mm1025048717-hash.github.io/smart-qa-v2.0/
- 测试 DeepSeek API 是否正常工作

## 📝 当前配置状态

- ✅ GitHub Secrets：`VITE_DEEPSEEK_API_KEY` 已配置
- ⏳ Cloudflare Worker：待部署（推荐）
- ⏳ GitHub Secrets：`VITE_DEEPSEEK_PROXY_URL` 待配置（部署 Worker 后）

## 🆘 如果遇到问题

1. **CORS 错误**：必须使用代理服务（Cloudflare Worker）
2. **API Key 错误**：检查 GitHub Secrets 配置
3. **部署失败**：检查 GitHub Actions 日志

## 📚 参考文档

- [DeepSeek API 文档](https://api-docs.deepseek.com/zh-cn/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)



