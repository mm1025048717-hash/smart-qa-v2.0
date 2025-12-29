# 宝塔面板部署 - API Key 更新指南

## 部署环境说明

根据你的部署信息：
- **服务器地址**：`http://47.94.146.148`
- **宝塔面板**：`http://47.94.146.148:8888`
- **反向代理配置**：`/api/deepseek` → `https://api.deepseek.com` ✅ 已配置

## 问题分析

API Key 过期后，需要更新前端代码中的配置。由于前端代码被打包到 `dist` 目录，需要：
1. 更新源代码中的 API Key
2. 重新构建前端代码
3. 上传新的 `dist` 目录到服务器

## 解决方案

### 方案一：使用环境变量构建（推荐）

这种方式可以在不修改代码的情况下，通过环境变量更新 API Key。

#### 步骤 1：更新源代码

代码已经支持环境变量，你只需要：

1. **在本地项目根目录创建 `.env` 文件**：
   ```env
   VITE_DEEPSEEK_API_KEY=你的新API-Key
   ```

2. **或者直接修改代码**（如果不想用环境变量）：
   
   编辑 `src/services/deepseekApi.ts` 第4行：
   ```typescript
   const DEEPSEEK_API_KEY = '你的新API-Key';
   ```

#### 步骤 2：重新构建前端

在本地项目目录执行：

```bash
# 安装依赖（如果还没有）
npm install

# 构建生产版本
npm run build
```

构建完成后，会在项目根目录生成 `dist` 目录。

#### 步骤 3：上传到服务器

**方法 A：通过宝塔面板文件管理**

1. 登录宝塔面板：`http://47.94.146.148:8888`
2. 进入 **文件** → 找到你的网站目录（通常是 `/www/wwwroot/你的域名/`）
3. 删除旧的 `dist` 目录（或备份）
4. 上传新的 `dist` 目录
5. 确保文件权限正确（通常是 755）

**方法 B：通过 FTP/SFTP**

1. 使用 FTP 客户端（如 FileZilla）连接到服务器
2. 上传 `dist` 目录到网站根目录
3. 覆盖旧文件

**方法 C：通过 Git（如果使用 Git 部署）**

```bash
# 在本地提交更改
git add .
git commit -m "更新 DeepSeek API Key"
git push

# 在服务器上拉取更新并构建
cd /www/wwwroot/你的项目目录
git pull
npm run build
```

#### 步骤 4：清除浏览器缓存

更新后，访问网站的用户需要：
- 按 `Ctrl + Shift + Delete` 清除浏览器缓存
- 或按 `Ctrl + F5` 强制刷新页面

### 方案二：直接在服务器上修改（快速但不推荐）

如果你有服务器 SSH 访问权限，可以直接在服务器上修改：

1. **SSH 连接到服务器**
2. **找到网站目录**（通常在 `/www/wwwroot/你的域名/`）
3. **编辑打包后的 JavaScript 文件**（不推荐，因为文件是压缩的）

⚠️ **注意**：这种方式不推荐，因为：
- 打包后的代码是压缩的，难以编辑
- 下次重新部署会被覆盖
- 容易出错

## 宝塔面板 Node.js 项目配置（如果使用）

如果你使用的是宝塔面板的 **Node.js 项目**，可以配置环境变量：

1. 进入宝塔面板 → **网站** → 找到你的项目
2. 点击 **设置** → **Node 版本管理**
3. 在 **环境变量** 中添加：
   ```
   VITE_DEEPSEEK_API_KEY=你的新API-Key
   ```
4. 重启 Node.js 项目

## 验证更新

更新后，测试 API 是否正常工作：

1. 访问网站：`http://47.94.146.148/`
2. 打开浏览器开发者工具（F12）
3. 发送一条消息测试 AI 功能
4. 查看 **Network** 标签，检查 `/api/deepseek` 请求：
   - 状态码应该是 `200`（成功）
   - 如果看到 `401` 或 `403`，说明 API Key 还是有问题

## 常见问题

### Q: 更新后还是报 401 错误？

**可能原因**：
1. API Key 格式错误（有多余空格）
2. 浏览器缓存了旧代码
3. 服务器上的文件没有更新成功

**解决方法**：
1. 检查 API Key 是否正确（以 `sk-` 开头）
2. 清除浏览器缓存（Ctrl + Shift + Delete）
3. 确认服务器上的 `dist` 目录已更新
4. 检查文件修改时间，确认是最新的

### Q: 如何确认文件已更新？

在服务器上检查：

```bash
# SSH 连接到服务器后
cd /www/wwwroot/你的项目目录/dist/assets
ls -lh *.js

# 查看文件修改时间，应该是刚刚的时间
```

### Q: 反向代理需要重新配置吗？

**不需要**。反向代理配置（`/api/deepseek` → `https://api.deepseek.com`）不需要修改，因为：
- 反向代理只是转发请求，不涉及 API Key
- API Key 是在前端代码中发送的

### Q: 如何获取新的 API Key？

1. 访问 [DeepSeek 控制台](https://platform.deepseek.com/)
2. 登录账号
3. 进入 **API Keys** 页面
4. 创建新的 API Key 或查看现有 Key

### Q: 更新后需要重启服务吗？

**通常不需要**，因为：
- 前端是静态文件，Nginx 会自动加载新文件
- 如果使用 Node.js 项目，可能需要重启

如果更新后不生效，可以尝试：
1. 重启 Nginx：`systemctl restart nginx`
2. 或重启 Node.js 项目（在宝塔面板中）

## 快速更新脚本

如果你经常需要更新，可以创建一个更新脚本：

**`update-api-key.sh`**：
```bash
#!/bin/bash

# 设置新的 API Key
NEW_API_KEY="你的新API-Key"

# 更新源代码
sed -i "s/const DEEPSEEK_API_KEY = '.*';/const DEEPSEEK_API_KEY = '${NEW_API_KEY}';/" src/services/deepseekApi.ts

# 重新构建
npm run build

echo "✅ API Key 已更新，dist 目录已重新构建"
echo "📦 请上传 dist 目录到服务器"
```

使用方法：
```bash
chmod +x update-api-key.sh
./update-api-key.sh
```

## 安全建议

1. **不要提交 API Key 到 Git**
   - 使用 `.env` 文件（已在 `.gitignore` 中）
   - 或使用环境变量

2. **定期轮换 API Key**
   - 建议每 3-6 个月更新一次
   - 更新后立即删除旧 Key

3. **监控 API 使用情况**
   - 在 DeepSeek 控制台查看使用量
   - 设置使用限额，避免意外超支

