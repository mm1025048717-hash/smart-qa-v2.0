# 🚀 快速开始 - 5分钟完成部署

## 第一步：将代码推送到 GitHub

```bash
# 初始化 Git（如果还没有）
git init

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/your-repo.git

# 添加所有文件
git add .

# 提交
git commit -m "初始提交"

# 推送到 GitHub
git push -u origin main
```

## 第二步：在 Vercel 创建项目

1. 访问 [Vercel](https://vercel.com) 并登录（使用 GitHub 账号）
2. 点击 **"New Project"**
3. 选择你的 GitHub 仓库
4. 配置环境变量：
   - 点击 **"Environment Variables"**
   - 添加：`DEEPSEEK_API_KEY` = `sk-e8312e0eae874f2f9122f6aa334f4b3f`
   - 添加：`NODE_ENV` = `production`
5. 点击 **"Deploy"**
6. 等待部署完成（约 1-2 分钟）

## 第三步：配置 GitHub Actions 自动部署

### 3.1 获取 Vercel 配置信息

在项目目录下运行：

```bash
# 安装 Vercel CLI
npm install -g vercel

# 链接项目（会显示 Org ID 和 Project ID）
vercel link
```

### 3.2 获取 Vercel Token

1. 访问 [Vercel Tokens](https://vercel.com/account/tokens)
2. 点击 **"Create Token"**
3. 输入名称，选择 "No Expiration"
4. 复制生成的 Token

### 3.3 配置 GitHub Secrets

1. 进入 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 添加以下三个 Secrets：

   | Name | Value |
   |------|-------|
   | `VERCEL_TOKEN` | 你的 Vercel Token |
   | `VERCEL_ORG_ID` | 从 `vercel link` 获取 |
   | `VERCEL_PROJECT_ID` | 从 `vercel link` 获取 |

## 完成！✅

现在每次你推送代码到 GitHub，GitHub Actions 会自动：
- ✅ 检测代码变更
- ✅ 自动部署到 Vercel
- ✅ 更新访问链接

## 获取访问链接

部署完成后，访问链接格式为：
```
https://your-project-name.vercel.app
```

**这个链接可以分享给任何人进行演示！**

## 查看部署状态

- **GitHub Actions**: 仓库 → Actions 标签
- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)

## 需要帮助？

查看详细文档：
- [完整部署指南](./DEPLOY.md)
- [GitHub Actions 设置指南](.github/workflows/setup-vercel.md)

