# Vercel 环境变量配置指南

## 🔑 问题说明

如果 Vercel 部署的应用出现 `401 Unauthorized` 错误，说明 DeepSeek API Key 未在 Vercel 中正确配置。

## 📝 配置步骤

### 方法 1：通过 Vercel Dashboard 配置（推荐）

1. **访问 Vercel Dashboard**
   - 打开 https://vercel.com/dashboard
   - 登录你的账号

2. **选择项目**
   - 找到 `smart-qa-v2.0` 项目
   - 点击进入项目详情页

3. **进入设置页面**
   - 点击顶部导航栏的 **Settings**（设置）
   - 在左侧菜单中找到 **Environment Variables**（环境变量）

4. **添加环境变量**
   - 点击 **Add New**（添加新变量）
   - 填写以下信息：
     - **Key（键）**: `VITE_DEEPSEEK_API_KEY`
     - **Value（值）**: 你的 DeepSeek API Key（例如：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）
     - **Environment（环境）**: 选择所有环境（Production、Preview、Development）

5. **保存并重新部署**
   - 点击 **Save**（保存）
   - 返回项目页面，点击 **Deployments**（部署）
   - 找到最新的部署，点击右侧的 **...** 菜单
   - 选择 **Redeploy**（重新部署）
   - 或者直接推送新的代码到 GitHub，Vercel 会自动重新部署

### 方法 2：通过 Vercel CLI 配置

如果你安装了 Vercel CLI，可以使用命令行配置：

```bash
# 安装 Vercel CLI（如果还没安装）
npm i -g vercel

# 登录 Vercel
vercel login

# 在项目目录下配置环境变量
vercel env add VITE_DEEPSEEK_API_KEY

# 按提示输入 API Key 值
# 选择环境：Production, Preview, Development（全部选择）

# 重新部署
vercel --prod
```

## 🔍 获取 DeepSeek API Key

1. **访问 DeepSeek 平台**
   - 打开 https://platform.deepseek.com/
   - 注册/登录账号

2. **创建 API Key**
   - 进入控制台
   - 找到 API Keys 或密钥管理
   - 点击创建新密钥
   - 复制生成的 API Key（格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

## ✅ 验证配置

配置完成后，检查以下内容：

1. **检查环境变量是否已添加**
   - 在 Vercel Dashboard 的 Environment Variables 页面
   - 确认 `VITE_DEEPSEEK_API_KEY` 已存在
   - 确认已应用到所有环境（Production、Preview、Development）

2. **重新部署应用**
   - 必须重新部署才能应用新的环境变量
   - 可以在 Vercel Dashboard 中手动触发重新部署
   - 或者推送新的代码到 GitHub

3. **检查部署日志**
   - 在 Vercel Dashboard 的 Deployments 页面
   - 点击最新的部署
   - 查看 Build Logs（构建日志）
   - 确认没有环境变量相关的错误

4. **测试应用**
   - 访问 https://smart-qa-v2-0.vercel.app/
   - 尝试发送一条消息
   - 如果不再出现 401 错误，说明配置成功

## 🆘 常见问题

### Q: 为什么配置了环境变量还是报 401 错误？

A: 可能的原因：
1. **没有重新部署**：修改环境变量后必须重新部署才能生效
2. **环境变量名称错误**：必须是 `VITE_DEEPSEEK_API_KEY`（注意 `VITE_` 前缀）
3. **环境变量未应用到所有环境**：确保选择了 Production、Preview、Development
4. **API Key 格式错误**：确保 API Key 以 `sk-` 开头
5. **API Key 已过期或无效**：检查 DeepSeek 平台中的 API Key 状态

### Q: 如何确认环境变量已正确配置？

A: 在 Vercel Dashboard 中：
1. 进入项目 Settings → Environment Variables
2. 确认 `VITE_DEEPSEEK_API_KEY` 存在
3. 点击变量可以查看（但不会显示完整值，只显示前几位）

### Q: 环境变量配置后多久生效？

A: 配置后需要重新部署才能生效。重新部署通常需要 1-3 分钟。

### Q: 可以在代码中直接写 API Key 吗？

A: **绝对不要！** 这样做会：
- 暴露 API Key 到 GitHub（任何人都能看到）
- 违反安全最佳实践
- 可能导致 API Key 被滥用

### Q: 如何为不同环境配置不同的 API Key？

A: 在 Vercel Dashboard 的 Environment Variables 页面：
- 添加环境变量时，可以选择应用的环境
- 可以为 Production、Preview、Development 分别配置不同的值
- 或者使用同一个 API Key 应用到所有环境

## 📚 相关文档

- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [DeepSeek API 文档](https://api-docs.deepseek.com/zh-cn/)

## 🔐 安全建议

1. **不要将 API Key 提交到 Git**
   - 确保 `.env` 文件在 `.gitignore` 中
   - 不要在代码中硬编码 API Key

2. **定期轮换 API Key**
   - 定期在 DeepSeek 平台更新 API Key
   - 更新后记得在 Vercel 中同步更新

3. **限制 API Key 权限**
   - 在 DeepSeek 平台中，如果支持，限制 API Key 的权限范围
   - 只授予必要的权限

4. **监控 API 使用**
   - 定期检查 DeepSeek 平台的 API 使用情况
   - 设置使用量告警，防止异常使用

