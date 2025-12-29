# GitHub 部署检查清单

## ✅ 部署前检查

### 1. 敏感信息检查
- [x] 已移除硬编码的 API Key
- [x] 已创建 `.env.example` 模板文件
- [x] 已确认 `.env` 文件在 `.gitignore` 中
- [x] 已检查所有代码文件，无敏感信息泄露

### 2. 文件清理
- [x] 已清理临时文件（*.zip, *.md 临时文档）
- [x] 已清理构建产物（dist/）
- [x] 已清理日志文件（*.log）
- [x] 已清理 IDE 配置文件（.vscode/, .idea/）

### 3. 配置文件
- [x] `.gitignore` 已更新，包含所有需要忽略的文件
- [x] `package.json` 已检查，无敏感信息
- [x] `README.md` 已更新，包含部署说明
- [x] 已创建 `.env.example` 作为配置模板

### 4. 代码质量
- [x] 已检查 TypeScript 编译错误
- [x] 已检查 ESLint 警告
- [x] 已移除未使用的导入和变量
- [x] 已检查控制台无错误输出

### 5. 文档
- [x] `README.md` 包含完整的项目说明
- [x] 包含安装和运行指南
- [x] 包含配置说明（API Key 等）
- [x] 包含常见问题解答

## 📝 部署步骤

### 1. 初始化 Git 仓库（如果还没有）
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. 创建 GitHub 仓库
1. 在 GitHub 上创建新仓库
2. 不要初始化 README、.gitignore 或 license（因为本地已有）

### 3. 连接远程仓库
```bash
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

### 4. 配置 GitHub Secrets（如果需要 CI/CD）
在 GitHub 仓库设置中添加：
- `VITE_DEEPSEEK_API_KEY`: DeepSeek API Key

## 🔒 安全注意事项

1. **永远不要提交 `.env` 文件**
2. **不要硬编码 API Key 在代码中**
3. **使用环境变量管理敏感配置**
4. **定期检查代码中是否有敏感信息泄露**

## 📚 相关文档

- [GitHub 文档](https://docs.github.com/)
- [Vite 环境变量](https://vitejs.dev/guide/env-and-mode.html)
- [DeepSeek API 文档](https://api-docs.deepseek.com/)

