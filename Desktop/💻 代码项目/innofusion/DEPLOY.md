# 部署指南 - GitHub & Vercel

本指南将帮助你将 Innofusion 项目部署到 GitHub 和 Vercel。

## 📋 部署架构

- **前端（React + Vite）**：部署到 Vercel
- **后端（Express + Socket.IO）**：需要部署到支持 WebSocket 的平台（推荐 Railway、Render 或 Fly.io）
- **数据库（MongoDB）**：使用 MongoDB Atlas（免费层可用）

---

## 🚀 第一步：GitHub 部署

### 1. 初始化 Git 仓库（如果还没有）

```bash
# 在项目根目录执行
cd innofusion
git init
git add .
git commit -m "Initial commit"
```

### 2. 在 GitHub 上创建新仓库

1. 访问 [GitHub](https://github.com/new)
2. 创建新仓库（例如：`innofusion`）
3. **不要**初始化 README、.gitignore 或 license（我们已经有了）

### 3. 推送代码到 GitHub

```bash
git remote add origin https://github.com/your-username/innofusion.git
git branch -M main
git push -u origin main
```

---

## 🌐 第二步：Vercel 部署（前端）

### 1. 安装 Vercel CLI（可选，也可以使用网页界面）

```bash
npm i -g vercel
```

### 2. 使用 Vercel 网页界面部署（推荐）

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "Add New Project"
4. 导入你的 GitHub 仓库
5. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: `./`（项目根目录）
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. 配置环境变量

在 Vercel 项目设置中添加环境变量：

```
VITE_API_URL=https://your-backend-domain.com/api
```

⚠️ **注意**：此时后端还没有部署，先暂时使用本地地址，部署后端后再更新。

### 4. 部署

点击 "Deploy" 按钮，Vercel 会自动：
- 从 GitHub 拉取代码
- 安装依赖
- 运行构建命令
- 部署到 CDN

### 5. 使用 Vercel CLI 部署（备选）

```bash
# 在项目根目录
vercel

# 首次部署会要求登录和配置
# 后续部署直接运行 vercel 即可
```

---

## 🔧 第三步：后端部署

由于 Vercel 的 Serverless Functions **不支持 WebSocket**，后端需要部署到其他平台。

### 选项 A：Railway（推荐）

1. 访问 [Railway](https://railway.app)
2. 使用 GitHub 登录
3. 创建新项目，选择 "Deploy from GitHub repo"
4. 选择你的仓库，指定路径为 `server`
5. 在 Railway 项目设置中添加环境变量：
   ```
   PORT=3001
   NODE_ENV=production
   MONGO_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   DEEPSEEK_API_KEY=your-deepseek-api-key
   ```
6. Railway 会自动部署并提供 URL（例如：`https://your-app.railway.app`）

### 选项 B：Render

1. 访问 [Render](https://render.com)
2. 创建新的 "Web Service"
3. 连接 GitHub 仓库
4. 配置：
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Node
5. 添加环境变量（同 Railway）
6. 部署

### 选项 C：Fly.io

1. 安装 Fly CLI：`npm i -g @fly/cli`
2. 登录：`fly auth login`
3. 在 `server` 目录创建 `fly.toml`：
   ```toml
   app = "innofusion-api"
   primary_region = "iad"

   [build]

   [http_service]
     internal_port = 3001
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0

   [[vm]]
     cpu_kind = "shared"
     cpus = 1
     memory_mb = 512
   ```
4. 部署：`cd server && fly deploy`
5. 设置环境变量：`fly secrets set KEY=value`

---

## 🗄️ 第四步：设置 MongoDB Atlas

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费账号和集群
3. 创建数据库用户
4. 配置网络安全：添加 `0.0.0.0/0` 允许所有 IP（或限制为你的服务器 IP）
5. 获取连接字符串：
   ```
   mongodb+srv://username:password@cluster.mongodb.net/innofusion?retryWrites=true&w=majority
   ```
6. 将连接字符串添加到后端环境变量 `MONGO_URI`

---

## 🔄 第五步：更新前端环境变量

部署后端后，获取后端 URL，然后：

1. 在 Vercel 项目设置中更新环境变量：
   ```
   VITE_API_URL=https://your-backend-domain.com/api
   ```
2. 重新部署前端（Vercel 会自动触发或手动点击 "Redeploy"）

---

## 📝 检查清单

- [ ] 代码已推送到 GitHub
- [ ] 前端已部署到 Vercel
- [ ] 后端已部署到 Railway/Render/Fly.io
- [ ] MongoDB Atlas 已配置
- [ ] 所有环境变量已设置
- [ ] CORS 配置正确（包含前端域名）
- [ ] 前端环境变量指向正确的后端 URL
- [ ] 测试前后端连接

---

## 🐛 常见问题

### 1. CORS 错误

确保后端 `CORS_ORIGIN` 环境变量包含前端域名：
```
CORS_ORIGIN=https://your-vercel-app.vercel.app,https://your-vercel-app.vercel.app
```

### 2. Socket.IO 连接失败

- 检查后端 URL 是否正确
- 确保后端平台支持 WebSocket
- 检查防火墙/网络设置

### 3. 环境变量不生效

- Vercel：环境变量更改后需要重新部署
- 检查变量名是否正确（前端使用 `VITE_` 前缀）

### 4. 构建失败

- 检查 `package.json` 中的依赖是否正确
- 查看构建日志中的错误信息
- 确保 Node.js 版本兼容（后端需要 Node >= 20）

---

## 🔒 安全建议

1. **永远不要**在代码中硬编码 API 密钥或敏感信息
2. 使用强密码和随机的 `JWT_SECRET`
3. 限制 MongoDB Atlas 的 IP 访问范围
4. 定期更新依赖包
5. 启用 HTTPS（Vercel 和大多数平台自动提供）

---

## 📚 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Railway 文档](https://docs.railway.app)
- [Render 文档](https://render.com/docs)
- [MongoDB Atlas 文档](https://docs.atlas.mongodb.com)
- [Socket.IO 部署指南](https://socket.io/docs/v4/deployment/)

---

## 🎉 完成！

部署完成后，你的应用应该可以通过以下地址访问：

- **前端**: `https://your-app.vercel.app`
- **后端 API**: `https://your-backend.railway.app`（或你选择的平台）

如有问题，请查看平台日志或联系支持。
