# 🚀 快速部署指南

## 快速开始（5 分钟部署）

### 前提条件
- GitHub 账号
- Vercel 账号（可用 GitHub 登录）
- MongoDB Atlas 账号（免费）
- Railway/Render 账号（用于后端，免费层可用）

---

## 步骤 1: 推送到 GitHub

```bash
# 如果还没有初始化 git
git init
git add .
git commit -m "Initial commit"

# 在 GitHub 创建仓库后
git remote add origin https://github.com/your-username/innofusion.git
git branch -M main
git push -u origin main
```

---

## 步骤 2: 部署前端到 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Import Project"
3. 选择你的 GitHub 仓库
4. 配置：
   - Framework: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 添加环境变量：
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```
   （先留空或使用占位符，部署后端后再更新）
6. 点击 "Deploy"

---

## 步骤 3: 部署后端到 Railway

1. 访问 [railway.app](https://railway.app)
2. 使用 GitHub 登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择仓库，路径设为 `server`
5. 添加环境变量：
   ```
   PORT=3001
   NODE_ENV=production
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/innofusion
   JWT_SECRET=your-random-secret-key-here
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   DEEPSEEK_API_KEY=your-api-key
   ```
6. Railway 会自动部署并给出 URL

---

## 步骤 4: 设置 MongoDB

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 创建数据库用户
4. 网络安全：添加 `0.0.0.0/0`（允许所有 IP）
5. 获取连接字符串，添加到 Railway 环境变量

---

## 步骤 5: 更新前端环境变量

在 Vercel 项目设置中更新：
```
VITE_API_URL=https://your-railway-url.railway.app/api
```
然后重新部署前端。

---

## ✅ 完成！

访问你的 Vercel URL，应用应该已经正常运行了！

---

## 故障排除

### CORS 错误
确保 `CORS_ORIGIN` 包含你的 Vercel 域名。

### Socket.IO 连接失败
检查后端 URL 是否正确，确保 Railway 支持 WebSocket。

### 构建失败
检查 Node.js 版本（需要 >= 20），查看构建日志。

更多详细信息请查看 [DEPLOY.md](./DEPLOY.md)
