# 部署指南

## 🚀 GitHub Actions 全自动部署（推荐）

这是最简单的方式，配置一次后，每次推送代码都会自动部署！

### 快速设置步骤

1. **首次在 Vercel 创建项目**（只需一次）
   - 访问 [Vercel](https://vercel.com) 并登录
   - 点击 "New Project" → 导入 GitHub 仓库
   - 配置环境变量 `DEEPSEEK_API_KEY`
   - 完成首次部署

2. **配置 GitHub Secrets**（只需一次）
   - 详细步骤请查看 [GitHub Actions 设置指南](.github/workflows/setup-vercel.md)

3. **推送代码自动部署**
   ```bash
   git add .
   git commit -m "更新代码"
   git push origin main
   ```
   - 推送后，GitHub Actions 会自动部署到 Vercel
   - 部署完成后，访问链接会自动更新

### 其他部署方式

#### 方式一：通过 Vercel 网站部署

1. 访问 [Vercel](https://vercel.com) 并登录
2. 点击 "New Project" → 选择 GitHub 仓库
3. 配置环境变量并部署
4. 获取访问链接

#### 方式二：使用 Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 环境变量说明

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | 是 |
| `PORT` | 服务器端口（Vercel 自动分配） | 否 |
| `NODE_ENV` | 环境模式 | 否 |

## 访问链接

部署完成后，你会获得一个类似这样的链接：
```
https://yiwen-dataagent.vercel.app
```

这个链接可以：
- ✅ 直接访问应用
- ✅ 分享给其他人进行演示
- ✅ 支持 HTTPS（自动配置）
- ✅ 全球 CDN 加速

## 更新部署

### 自动更新
- 如果使用 GitHub Actions，每次推送代码到 main 分支会自动部署

### 手动更新
```bash
vercel --prod
```

## 常见问题

### Q: 部署后 API 调用失败？
A: 检查环境变量 `DEEPSEEK_API_KEY` 是否正确配置

### Q: 如何查看部署日志？
A: 在 Vercel 控制台的 "Deployments" 页面查看

### Q: 可以自定义域名吗？
A: 可以，在 Vercel 项目设置中添加自定义域名

## 技术支持

如有问题，请查看：
- [Vercel 文档](https://vercel.com/docs)
- [项目 README](./README.md)

