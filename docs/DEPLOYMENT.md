# GitHub 部署指南

## 📋 前置准备

1. 确保已安装 Git
2. 拥有 GitHub 账号
3. 已配置 Git 用户信息（如果未配置，请先执行）：
   ```bash
   git config --global user.name "你的名字"
   git config --global user.email "你的邮箱"
   ```

## 🚀 部署步骤

### 步骤 1: 在 GitHub 上创建新仓库

1. 登录 GitHub
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `smart-qa-v1.3` (或你喜欢的名字)
   - Description: `智能数据问答界面 - 动态分析叙事系统`
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"（因为我们已经有了）
4. 点击 "Create repository"

### 步骤 2: 连接本地仓库到 GitHub

在项目目录下执行以下命令（将 `YOUR_USERNAME` 和 `YOUR_REPO_NAME` 替换为你的实际信息）：

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 或者使用 SSH（如果你配置了 SSH key）
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git

# 查看远程仓库配置
git remote -v
```

### 步骤 3: 推送代码到 GitHub

```bash
# 推送代码到 GitHub（首次推送）
git push -u origin master

# 如果 GitHub 默认分支是 main，使用：
git branch -M main
git push -u origin main
```

### 步骤 4: 验证部署

1. 访问你的 GitHub 仓库页面
2. 确认所有文件都已上传
3. 检查 README.md 是否正确显示

## 🔄 后续更新

每次修改代码后，使用以下命令更新 GitHub：

```bash
# 查看修改状态
git status

# 添加所有修改
git add .

# 提交修改
git commit -m "描述你的修改内容"

# 推送到 GitHub
git push
```

## 📝 注意事项

1. **敏感信息**: 确保 `.env` 文件已添加到 `.gitignore`，不要提交 API 密钥等敏感信息
2. **node_modules**: 已自动忽略，不需要提交
3. **大文件**: 如果文件较大，考虑使用 Git LFS

## 🛠️ 故障排除

### 如果推送失败

1. **认证问题**: 如果提示需要认证，使用 Personal Access Token
   - GitHub Settings → Developer settings → Personal access tokens → Generate new token
   - 选择 `repo` 权限
   - 使用 token 作为密码

2. **分支名称不匹配**: 
   ```bash
   # 重命名本地分支
   git branch -M main
   # 然后推送
   git push -u origin main
   ```

3. **远程仓库已存在内容**:
   ```bash
   # 先拉取远程内容
   git pull origin main --allow-unrelated-histories
   # 解决冲突后推送
   git push -u origin main
   ```

## 🌐 GitHub Pages 部署（可选）

如果你想将项目部署为静态网站：

1. 在 GitHub 仓库设置中启用 GitHub Pages
2. 选择 `main` 分支和 `/docs` 或 `/root` 目录
3. 构建项目：
   ```bash
   npm run build
   ```
4. 将 `dist` 目录内容推送到仓库

## 📚 相关资源

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 帮助文档](https://docs.github.com/)
- [GitHub Pages 文档](https://docs.github.com/pages)
