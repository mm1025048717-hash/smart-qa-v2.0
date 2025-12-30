# GitHub Actions 自动部署设置指南

## 第一步：在 Vercel 创建项目

1. 访问 [Vercel](https://vercel.com) 并登录（使用 GitHub 账号）
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 配置环境变量：
   - `DEEPSEEK_API_KEY`: `sk-e8312e0eae874f2f9122f6aa334f4b3f`
   - `NODE_ENV`: `production`
5. 点击 "Deploy" 完成首次部署

## 第二步：获取 Vercel 配置信息

部署完成后，需要获取以下信息用于 GitHub Actions：

### 方法一：通过 Vercel CLI（推荐）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 在项目目录下运行
vercel link

# 这会显示：
# - Vercel Org ID
# - Vercel Project ID
```

### 方法二：通过 Vercel 网站

1. 进入项目设置：`https://vercel.com/your-username/your-project/settings`
2. 在 "General" 页面可以看到：
   - Project ID
   - Team ID (Org ID)

## 第三步：获取 Vercel Token

1. 访问 [Vercel Tokens](https://vercel.com/account/tokens)
2. 点击 "Create Token"
3. 输入名称（如：`github-actions`）
4. 选择过期时间（建议选择 "No Expiration"）
5. 点击 "Create Token"
6. **复制 Token**（只显示一次，请妥善保存）

## 第四步：配置 GitHub Secrets

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**，添加以下三个 Secrets：

   | Secret 名称 | 值 | 说明 |
   |-----------|-----|------|
   | `VERCEL_TOKEN` | 你的 Vercel Token | 从第三步获取 |
   | `VERCEL_ORG_ID` | 你的 Org ID | 从第二步获取 |
   | `VERCEL_PROJECT_ID` | 你的 Project ID | 从第二步获取 |

## 第五步：推送代码触发部署

```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "配置 GitHub Actions 自动部署"

# 推送到 GitHub
git push origin main
```

## 完成！

推送代码后，GitHub Actions 会自动：
1. ✅ 检测代码变更
2. ✅ 运行测试（如果有）
3. ✅ 部署到 Vercel 生产环境
4. ✅ 生成可访问的链接

## 查看部署状态

1. **GitHub Actions**：
   - 进入仓库 → **Actions** 标签
   - 查看最新的工作流运行状态

2. **Vercel Dashboard**：
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 查看部署历史和状态

## 获取访问链接

部署成功后，访问链接格式为：
```
https://your-project-name.vercel.app
```

这个链接可以：
- ✅ 直接访问应用
- ✅ 分享给他人进行演示
- ✅ 支持 HTTPS（自动配置）
- ✅ 全球 CDN 加速

## 常见问题

### Q: GitHub Actions 部署失败？
A: 检查：
1. Secrets 是否正确配置
2. Vercel Token 是否有效
3. Org ID 和 Project ID 是否正确

### Q: 如何查看部署日志？
A: 
- GitHub Actions: 仓库 → Actions → 点击运行记录
- Vercel: Dashboard → 项目 → Deployments → 点击部署记录

### Q: 如何手动触发部署？
A: 
- GitHub Actions: 仓库 → Actions → 选择工作流 → Run workflow
- Vercel: Dashboard → 项目 → Deployments → Redeploy

