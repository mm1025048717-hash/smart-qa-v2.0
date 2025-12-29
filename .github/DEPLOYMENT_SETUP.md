# GitHub Actions 自动部署设置指南

## 🚀 快速开始

项目已配置 GitHub Actions 自动部署工作流。当你推送代码到 `main` 分支时，会自动构建并部署到 GitHub Pages。

## 📋 首次设置步骤

### 1. 启用 GitHub Pages

1. 访问你的 GitHub 仓库：`https://github.com/mm1025048717-hash/smart-qa-v1.3`
2. 点击 **Settings**（设置）
3. 在左侧菜单中找到 **Pages**（页面）
4. 在 **Source**（源）部分：
   - 选择 **GitHub Actions** 作为部署源
   - 不要选择 "Deploy from a branch"
5. 保存设置

### 2. 配置仓库权限（如果需要）

1. 在仓库 **Settings** → **Actions** → **General**
2. 找到 **Workflow permissions**（工作流权限）
3. 选择 **Read and write permissions**（读写权限）
4. 勾选 **Allow GitHub Actions to create and approve pull requests**
5. 保存更改

## 🔄 工作流程

### 自动触发

- **推送代码到 main 分支**：自动触发构建和部署
- **手动触发**：在 Actions 标签页中，选择工作流，点击 "Run workflow"

### 部署过程

1. **构建阶段**：
   - 检出代码
   - 安装 Node.js 和依赖
   - 运行 `npm run build`
   - 上传构建产物

2. **部署阶段**：
   - 将构建产物部署到 GitHub Pages
   - 生成部署 URL

### 查看部署状态

1. 访问仓库的 **Actions** 标签页
2. 查看最新的工作流运行状态
3. 绿色 ✓ 表示成功，红色 ✗ 表示失败

### 访问部署的网站

部署成功后，你的网站将可以通过以下 URL 访问：

```
https://mm1025048717-hash.github.io/smart-qa-v1.3/
```

> **注意**：首次部署可能需要几分钟时间。GitHub Pages 的 URL 格式为：`https://[用户名].github.io/[仓库名]/`

## 🔧 环境变量配置（可选）

如果你的项目需要在构建时使用环境变量（如 API Key），可以配置 GitHub Secrets：

1. 进入仓库 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加以下 Secret（如果需要）：
   - `VITE_DEEPSEEK_API_KEY`: 你的 DeepSeek API Key

然后在 `.github/workflows/deploy.yml` 中取消注释相关行：

```yaml
env:
  VITE_DEEPSEEK_API_KEY: ${{ secrets.VITE_DEEPSEEK_API_KEY }}
```

> **⚠️ 重要**：GitHub Pages 是静态网站托管，无法运行后端服务。如果你的应用需要后端 API，建议使用其他平台（如 Vercel、Netlify）或配置 API 代理。

## 🐛 故障排除

### 问题 1: 部署失败

**检查清单**：
- [ ] GitHub Pages 是否已启用？
- [ ] 工作流权限是否配置正确？
- [ ] 构建是否有错误？（查看 Actions 日志）
- [ ] `package.json` 中的构建脚本是否正确？

### 问题 2: 网站显示 404

**可能原因**：
- GitHub Pages 需要几分钟时间才能生效
- 检查 `vite.config.ts` 中的 `base` 路径是否正确
- 确认仓库名称与配置的 base 路径匹配

### 问题 3: 样式或资源加载失败

**解决方案**：
- 检查 `vite.config.ts` 中的 `base` 配置
- 确保所有资源路径使用相对路径或正确的 base 路径

## 📝 自定义配置

### 修改部署分支

如果你想从其他分支部署，编辑 `.github/workflows/deploy.yml`：

```yaml
on:
  push:
    branches:
      - main  # 改为你的分支名
```

### 修改构建命令

如果需要自定义构建命令，编辑工作流文件中的 `Build` 步骤。

## 🔗 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

## ✅ 验证部署

部署成功后，你可以：

1. 访问部署的 URL
2. 检查浏览器控制台是否有错误
3. 测试应用的主要功能
4. 验证所有资源（CSS、JS、图片）是否正确加载

---

**提示**：每次推送代码到 main 分支后，等待几分钟，然后访问你的 GitHub Pages URL 查看最新版本。

