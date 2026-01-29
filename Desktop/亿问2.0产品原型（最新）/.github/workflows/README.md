# GitHub Actions 工作流说明

## 自动部署工作流

本项目配置了 GitHub Actions 自动部署工作流，每次推送代码到 `main` 或 `master` 分支时，会自动部署到 Vercel。

## 工作流文件

- `deploy.yml` - 自动部署到 Vercel 的工作流

## 配置要求

在 GitHub 仓库的 Secrets 中需要配置以下三个密钥：

1. `VERCEL_TOKEN` - Vercel API Token
2. `VERCEL_ORG_ID` - Vercel 组织 ID
3. `VERCEL_PROJECT_ID` - Vercel 项目 ID

详细配置步骤请查看：[setup-vercel.md](./setup-vercel.md)

## 工作流触发条件

- 推送到 `main` 或 `master` 分支
- 手动触发（在 Actions 页面点击 "Run workflow"）

## 查看部署状态

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看最新的工作流运行记录

## 部署成功后

部署成功后，访问链接会在 Vercel Dashboard 中显示，格式为：
```
https://your-project-name.vercel.app
```

