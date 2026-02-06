# 部署到 GitHub 与 Vercel

## 一、推送到 GitHub

在项目根目录执行：

```powershell
# 1. 添加所有更改
git add .

# 2. 提交（可按需修改说明）
git commit -m "feat: 首页布局与员工市场、创建机制等"

# 3. 推送到 main
git push -u origin main
```

如尚未配置 GitHub 远程或未登录，请先：

- 在 [GitHub](https://github.com/new) 新建仓库（可选：不勾选 README）
- 若本地已有仓库，添加远程：`git remote add origin https://github.com/你的用户名/仓库名.git`
- 使用 GitHub 账号或 Personal Access Token 完成推送

---

## 二、在 Vercel 部署

### 1. 连接仓库

1. 打开 [Vercel](https://vercel.com) 并登录（可用 GitHub 登录）。
2. 点击 **Add New** → **Project**。
3. 在 **Import Git Repository** 中选择你的 GitHub 仓库（如 `smart-qa-v2.0`），点击 **Import**。

### 2. 项目配置（一般自动识别）

Vercel 会读取项目中的 `vercel.json`，通常无需改：

- **Framework Preset**: Vite  
- **Build Command**: `npm run build`（或 `npm ci && npm run build`）  
- **Output Directory**: `dist`  
- **Install Command**: `npm ci`（可选）

确认 **Root Directory** 为 `./`。

### 3. 环境变量（必填）

在 **Environment Variables** 中至少添加：

| 名称 | 值 | 环境 |
|------|-----|------|
| `DEEPSEEK_API_KEY` | 你的 DeepSeek API Key（`sk-...`） | Production、Preview、Development |

如需前端也使用代理，可再加：

| 名称 | 值 |
|------|-----|
| `VITE_DEEPSEEK_API_KEY` | 同上（可选，看前端是否直接读） |

保存后勾选 **Production / Preview / Development**。

### 4. 部署

点击 **Deploy**，等待构建完成。完成后会得到：

- 生产地址：`https://你的项目名.vercel.app`
- 每次推送到 GitHub 会自动触发新部署。

### 5. 验证

- 打开上述链接，确认页面正常。
- 在页面里发一条消息，确认对话/API 正常（依赖 `DEEPSEEK_API_KEY`）。

---

## 三、可选：同时用 GitHub Pages

若希望同时部署到 GitHub Pages：

1. 仓库 **Settings** → **Pages** → **Source** 选 **GitHub Actions**。
2. 确保 `.github/workflows/deploy.yml` 存在且推送到 `main` 会触发。
3. 如需在构建时注入 API Key，在 **Settings** → **Secrets and variables** → **Actions** 里添加 `VITE_DEEPSEEK_API_KEY`。

注意：GitHub Pages 为静态站点，不能跑服务端 API；对话能力需用 Vercel 或其它后端。

---

## 四、常用命令速查

```powershell
# 本地安装依赖并构建（验证能否成功）
npm ci
npm run build

# 推送更新后，Vercel 会自动重新部署
git add .
git commit -m "你的提交说明"
git push origin main
```

---

## 五、参考

- 详细说明：[快速部署指南.md](./快速部署指南.md)
- Vercel 环境变量：[Vercel环境变量配置.md](./Vercel环境变量配置.md)
