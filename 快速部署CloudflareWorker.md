# 快速部署 Cloudflare Worker（5分钟搞定）

## 步骤 1: 进入 Workers 页面

1. 在 Cloudflare 控制台，点击左侧菜单 **"Workers & Pages"**
2. 如果看不到，点击左侧菜单的 **"Workers"** 或 **"Workers & Pages"**

## 步骤 2: 创建 Worker

1. 点击 **"Create application"** 或 **"Create Worker"** 按钮
2. 选择 **"Create Worker"**（不是 Pages）
3. 输入 Worker 名称：`deepseek-api-proxy`
4. 点击 **"Deploy"** 按钮

## 步骤 3: 配置代码

1. 部署成功后，点击 **"Edit code"** 或 **"Configure Worker"**
2. 删除编辑器中的所有默认代码
3. 复制 `cloudflare-worker.js` 文件的内容
4. 粘贴到编辑器中
5. 点击 **"Save and deploy"** 或 **"Deploy"**

## 步骤 4: 配置 API Key（重要！）

1. 在 Worker 页面，点击 **"Settings"** 标签
2. 点击 **"Variables"** 或 **"Environment Variables"**
3. 在 **"Environment Variables"** 部分，点击 **"Add variable"**
4. 输入：
   - **Variable name**: `DEEPSEEK_API_KEY`
   - **Value**: `sk-b1551c8a25d042a7ae8b0166820249a8`
5. 点击 **"Save"**

## 步骤 5: 获取 Worker URL

1. 在 Worker 页面，点击 **"Triggers"** 或 **"Settings"** 标签
2. 找到 **"Routes"** 或 **"Preview"** 部分
3. 复制 Worker URL，格式类似：
   ```
   https://deepseek-api-proxy.your-username.workers.dev
   ```
   或者：
   ```
   https://deepseek-api-proxy-xxxx.your-subdomain.workers.dev
   ```

## 步骤 6: 配置 GitHub Secrets

1. 访问：https://github.com/mm1025048717-hash/smart-qa-v2.0/settings/secrets/actions
2. 点击 **"New repository secret"**
3. 输入：
   - **Name**: `VITE_DEEPSEEK_PROXY_URL`
   - **Secret**: 粘贴你复制的 Worker URL（例如：`https://deepseek-api-proxy.xxx.workers.dev`）
4. 点击 **"Add secret"**

## 步骤 7: 重新部署

在项目目录运行：

```bash
git add .
git commit -m "配置 Cloudflare Worker 代理"
git push
```

## 验证

1. 等待 GitHub Actions 部署完成（约 2-3 分钟）
2. 访问：https://mm1025048717-hash.github.io/smart-qa-v2.0/
3. 测试 DeepSeek API 是否正常工作

## 常见问题

### Q: 找不到 "Workers & Pages"？
A: 在左侧菜单找 "Workers" 或直接访问：https://dash.cloudflare.com/workers

### Q: Worker URL 在哪里？
A: 在 Worker 页面的 "Triggers" 或 "Settings" 标签中，或者部署成功后会在页面顶部显示

### Q: 代码在哪里？
A: 在项目根目录的 `cloudflare-worker.js` 文件

### Q: 部署后还是 CORS 错误？
A: 检查：
1. Worker 代码是否正确部署
2. API Key 是否正确配置
3. GitHub Secrets 中的 `VITE_DEEPSEEK_PROXY_URL` 是否正确

## 完成！

部署完成后，你的应用就可以正常使用 DeepSeek API 了！



