# 创建 GitHub 仓库并部署

## 📋 步骤 1: 在 GitHub 上创建仓库

### 方法 1: 通过 GitHub 网页创建

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `smart-qa-v1.3` (或你喜欢的名称)
   - **Description**: `智能问答界面 - 动态分析叙事系统`
   - **Visibility**: 选择 Public 或 Private
   - **⚠️ 重要**: **不要**勾选以下选项：
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
   （因为本地已有这些文件）

3. 点击 "Create repository"

### 方法 2: 使用 GitHub CLI (如果已安装)

```bash
gh repo create smart-qa-v1.3 --public --description "智能问答界面 - 动态分析叙事系统"
```

## 📋 步骤 2: 推送代码到 GitHub

创建仓库后，运行以下命令：

```powershell
# 确保在项目目录
cd "C:\Users\陈宣任\Desktop\smart-qa v1.3"

# 推送代码
git push -u origin main
```

## 🔐 如果遇到认证问题

### 使用 Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：
   - ✅ `repo` (完整仓库访问权限)
4. 生成并复制 token
5. 推送时使用 token 作为密码：
   ```powershell
   # 用户名: mm1025048717-hash
   # 密码: 粘贴你的 token
   git push -u origin main
   ```

### 或使用 SSH (推荐)

1. 生成 SSH 密钥（如果还没有）：
   ```powershell
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. 添加 SSH 密钥到 GitHub：
   - 复制 `~/.ssh/id_ed25519.pub` 的内容
   - 访问 https://github.com/settings/keys
   - 点击 "New SSH key"，粘贴并保存

3. 更新远程仓库地址为 SSH：
   ```powershell
   git remote set-url origin git@github.com:mm1025048717-hash/smart-qa-v1.3.git
   git push -u origin main
   ```

## ✅ 验证部署

推送成功后，访问：
https://github.com/mm1025048717-hash/smart-qa-v1.3

你应该能看到所有项目文件。

## 🎯 快速命令（创建仓库后）

```powershell
cd "C:\Users\陈宣任\Desktop\smart-qa v1.3"
git push -u origin main
```

