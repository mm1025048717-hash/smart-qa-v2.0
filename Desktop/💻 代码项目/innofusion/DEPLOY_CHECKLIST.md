# 部署检查清单 ✅

在部署之前，请确保以下所有项目都已完成：

## 📦 代码准备

- [ ] 代码已通过本地测试
- [ ] 所有环境变量已添加到 `.env.example` 文件（不要提交真实的 `.env`）
- [ ] `.gitignore` 已正确配置（排除 `.env`, `node_modules`, `dist` 等）
- [ ] README.md 已更新
- [ ] 代码已提交到本地 git 仓库

## 🐙 GitHub 准备

- [ ] 已在 GitHub 创建仓库
- [ ] 本地仓库已添加 remote origin
- [ ] 代码已推送到 GitHub
- [ ] 仓库设置为 Public 或已授权 Vercel/Railway 访问

## 🌐 Vercel 前端部署

- [ ] 已在 Vercel 创建账号并连接 GitHub
- [ ] 已导入 GitHub 仓库到 Vercel
- [ ] 项目设置正确：
  - Framework: Vite
  - Root Directory: `./`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] 环境变量已设置：
  - `VITE_API_URL`（后端 URL，格式：`https://your-backend.com/api`）
- [ ] 首次部署成功
- [ ] 前端 URL 已记录：`https://your-app.vercel.app`

## 🔧 后端部署（Railway/Render/Fly.io）

### Railway
- [ ] 已在 Railway 创建账号
- [ ] 已创建新项目并连接到 GitHub 仓库
- [ ] 已设置服务路径为 `server`
- [ ] 环境变量已配置：
  - `PORT=3001`
  - `NODE_ENV=production`
  - `MONGO_URI=your-mongodb-connection-string`
  - `JWT_SECRET=your-random-secret-key`
  - `CORS_ORIGIN=https://your-vercel-app.vercel.app`
  - `DEEPSEEK_API_KEY=your-api-key`（如需要）
- [ ] 部署成功
- [ ] 后端 URL 已记录：`https://your-app.railway.app`

### Render（备选）
- [ ] 已在 Render 创建账号
- [ ] 已创建 Web Service
- [ ] 已设置 Build Command: `cd server && npm install`
- [ ] 已设置 Start Command: `cd server && npm start`
- [ ] 环境变量已配置（同上）
- [ ] 部署成功

## 🗄️ 数据库配置

- [ ] 已在 MongoDB Atlas 创建账号
- [ ] 已创建免费集群
- [ ] 已创建数据库用户
- [ ] 已配置网络安全（允许后端服务器 IP 或 `0.0.0.0/0`）
- [ ] 已获取连接字符串
- [ ] 连接字符串已添加到后端环境变量

## 🔗 连接配置

- [ ] 前端 `VITE_API_URL` 已更新为后端实际 URL
- [ ] 后端 `CORS_ORIGIN` 包含前端 Vercel 域名
- [ ] 已重新部署前端（环境变量更新后）
- [ ] 已测试前后端连接

## 🧪 功能测试

- [ ] 前端可以正常访问
- [ ] API 请求可以成功发送到后端
- [ ] WebSocket 连接正常（如果有实时功能）
- [ ] 用户认证功能正常（注册/登录）
- [ ] 主要功能可以正常使用
- [ ] 移动端响应式布局正常

## 🔒 安全检查

- [ ] 所有敏感信息（API 密钥、数据库密码等）已从代码中移除
- [ ] 环境变量只包含在部署平台，不在代码仓库中
- [ ] JWT_SECRET 是强随机字符串
- [ ] MongoDB 连接字符串使用强密码
- [ ] CORS 配置正确，不包含不必要的域名

## 📝 文档更新

- [ ] README.md 中的部署说明已更新
- [ ] 环境变量说明文档已创建
- [ ] API 文档已更新（如适用）

## 🎉 完成检查

- [ ] 所有服务正常运行
- [ ] 日志中没有严重错误
- [ ] 性能表现正常
- [ ] 已通知团队成员部署完成

---

## 🆘 常见问题

如果遇到问题，请检查：

1. **CORS 错误**: 确保 `CORS_ORIGIN` 包含完整的前端 URL
2. **环境变量未生效**: 更新环境变量后需要重新部署
3. **构建失败**: 检查 Node.js 版本（需要 >= 20）和依赖安装
4. **Socket.IO 连接失败**: 确保后端平台支持 WebSocket
5. **数据库连接失败**: 检查 MongoDB Atlas 的 IP 白名单和连接字符串

更多帮助请查看 [DEPLOY.md](./DEPLOY.md)
