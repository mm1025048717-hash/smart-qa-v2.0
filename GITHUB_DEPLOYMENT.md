# GitHub 部署指南

## 📋 部署前准备

### 1. 检查清单

在推送到 GitHub 之前，请确认：

- [x] ✅ 已移除硬编码的 API Key（已更新 `src/services/deepseekApi.ts`）
- [x] ✅ 已创建 `.env.example` 模板文件
- [x] ✅ 已更新 `.gitignore` 忽略敏感文件
- [x] ✅ 已创建 GitHub Issue 模板
- [x] ✅ 已更新 `README.md` 配置说明
- [x] ✅ 已创建 `LICENSE` 文件
- [x] ✅ 已创建 `CONTRIBUTING.md` 贡献指南

### 2. 需要手动处理的事项

#### 更新 package.json 中的仓库信息

编辑 `package.json`，将以下内容替换为你的实际仓库信息：

```json
"repository": {
  "type": "git",
  "url": "https://github.com/your-username/your-repo-name.git"
},
"author": "Your Name",
```

#### 创建 .env 文件（本地开发）

```bash
cp .env.example .env
```

然后编辑 `.env` 文件，填入你的 DeepSeek API Key。

## 🚀 部署步骤

### 步骤 1: 初始化 Git 仓库（如果还没有）

```bash
# 检查是否已有 Git 仓库
git status

# 如果没有，初始化仓库
git init
```

### 步骤 2: 添加所有文件

```bash
# 查看将要添加的文件（确认没有敏感信息）
git status

# 添加所有文件
git add .

# 查看将要提交的文件
git status
```

### 步骤 3: 提交代码

```bash
git commit -m "Initial commit: Smart QA Interface v2.0"
```

### 步骤 4: 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com/new)
2. 创建新仓库
3. **不要**勾选以下选项（因为本地已有）：
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license

### 步骤 5: 连接远程仓库并推送

```bash
# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/your-repo-name.git

# 重命名主分支为 main（如果还没有）
git branch -M main

# 推送到 GitHub
git push -u origin main
```

## 🔒 安全配置

### GitHub Secrets（用于 CI/CD）

如果使用 GitHub Actions 或其他 CI/CD，需要在仓库设置中添加 Secrets：

1. 进入仓库 Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加以下 Secret：
   - `VITE_DEEPSEEK_API_KEY`: 你的 DeepSeek API Key

### 环境变量配置

**开发环境**：
- 创建 `.env` 文件（已添加到 `.gitignore`）
- 填入 `VITE_DEEPSEEK_API_KEY=your-key-here`

**生产环境**：
- Vercel: 在项目设置中添加环境变量
- Netlify: 在 Site settings → Environment variables 中添加
- 其他平台: 参考平台文档配置环境变量

## 📝 后续维护

### 更新代码

```bash
# 查看更改
git status

# 添加更改
git add .

# 提交更改
git commit -m "描述你的更改"

# 推送到 GitHub
git push
```

### 创建新分支

```bash
# 创建并切换到新分支
git checkout -b feature/new-feature

# 开发完成后，推送到 GitHub
git push -u origin feature/new-feature

# 在 GitHub 上创建 Pull Request
```

## ⚠️ 重要提醒

1. **永远不要提交 `.env` 文件**
   - `.env` 已在 `.gitignore` 中
   - 如果意外提交了，立即撤销并更新 API Key

2. **不要硬编码 API Key**
   - 使用环境变量管理
   - 代码中已移除硬编码的 API Key

3. **定期检查敏感信息**
   - 使用 `git log` 检查历史提交
   - 如果发现敏感信息，立即更新并清理历史

4. **保护主分支**
   - 建议在 GitHub 设置中保护 `main` 分支
   - 要求 Pull Request 审查后才能合并

## 🐛 常见问题

### Q: 推送时提示需要认证？

A: 使用 Personal Access Token 或 SSH 密钥：
- [创建 Personal Access Token](https://github.com/settings/tokens)
- [设置 SSH 密钥](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

### Q: 如何撤销已提交的敏感信息？

A: 使用 `git filter-branch` 或 `git filter-repo` 清理历史：
```bash
# 警告：这会重写 Git 历史，谨慎使用
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

### Q: 如何忽略已跟踪的文件？

A: 如果文件已被 Git 跟踪，需要先移除：
```bash
git rm --cached filename
git commit -m "Remove tracked file"
```

## 📚 相关资源

- [GitHub 文档](https://docs.github.com/)
- [Git 文档](https://git-scm.com/doc)
- [Vite 环境变量](https://vitejs.dev/guide/env-and-mode.html)
- [DeepSeek API 文档](https://api-docs.deepseek.com/)

