# 📜 脚本使用说明

## 🎯 脚本分类

### API 密钥修复脚本

| 脚本 | 用途 | 位置 |
|------|------|------|
| `立即修复API密钥.bat` | 修复后端 server.js 中的 API Key | 根目录 |
| `修复前端API密钥.bat` | 修复前端环境变量配置 | 根目录 |
| `自动修复API密钥.bat` | 自动提取并配置 API Key（调用 Python 脚本） | 根目录 |
| `自动修复API密钥.py` | Python 自动化脚本，提取并配置 API Key | 根目录 |
| `验证API配置.bat` | 验证 API Key 配置是否正确 | 根目录 |
| `打开获取API密钥.bat` | 打开 API Key 获取页面 | 根目录 |

### 启动脚本

| 脚本 | 用途 | 位置 |
|------|------|------|
| `一键启动.bat` | 启动完整服务（前端 + 语音服务） | 根目录 |
| `启动前端.bat` | 仅启动前端开发服务器 | 根目录 |
| `一键启动语音服务.bat` | 启动语音服务（带检查和配置） | 根目录 |

### 语音服务脚本

| 脚本 | 用途 | 位置 |
|------|------|------|
| `修复WebSocket连接.bat` | 修复 WebSocket 连接问题 | 根目录 |
| `诊断语音服务.bat` | 诊断语音服务问题 | 根目录 |
| `voice-backend/启动服务.bat` | 启动语音服务（带端口检查） | voice-backend/ |
| `voice-backend/start.bat` | 标准启动脚本 | voice-backend/ |
| `voice-backend/完成所有配置.bat` | 全自动配置（推荐首次使用） | voice-backend/ |

### 部署脚本

| 脚本 | 用途 | 位置 |
|------|------|------|
| `scripts/部署到服务器.bat` | 部署到自定义服务器 | scripts/ |
| `scripts/部署到服务器.ps1` | PowerShell 部署脚本 | scripts/ |
| `scripts/一键部署.bat` | Docker 一键部署 | scripts/ |
| `scripts/完整部署.bat` | 完整部署流程 | scripts/ |
| `scripts/deploy-to-github.ps1` | 部署到 GitHub Pages | scripts/ |

## 🚀 快速使用

### 首次配置

1. **配置 API Key**：
   ```bash
   立即修复API密钥.bat
   修复前端API密钥.bat
   ```

2. **配置语音服务**：
   ```bash
   voice-backend\完成所有配置.bat
   ```

### 日常使用

1. **启动完整服务**：
   ```bash
   一键启动.bat
   ```

2. **仅启动前端**：
   ```bash
   启动前端.bat
   ```

3. **仅启动语音服务**：
   ```bash
   一键启动语音服务.bat
   ```

### 故障排除

1. **API Key 问题**：
   ```bash
   验证API配置.bat
   立即修复API密钥.bat
   ```

2. **语音服务问题**：
   ```bash
   诊断语音服务.bat
   修复WebSocket连接.bat
   ```

## 📝 脚本说明

### API 密钥修复

- **立即修复API密钥.bat**: 更新 `server.js` 中的 API Key（用于后端代理）
- **修复前端API密钥.bat**: 创建/更新 `.env.local` 文件（用于前端直接调用）
- **自动修复API密钥.bat**: 自动从 `server.js` 提取 API Key 并配置到前端和后端

### 启动脚本

- **一键启动.bat**: 同时启动前端和语音服务
- **启动前端.bat**: 仅启动前端开发服务器（端口 5173）
- **一键启动语音服务.bat**: 启动语音服务（端口 8765），带自动检查和配置

### 语音服务

- **修复WebSocket连接.bat**: 修复 WebSocket 连接问题（关闭占用端口的进程并重启服务）
- **诊断语音服务.bat**: 诊断语音服务问题（检查端口、Python、依赖、配置）

## 🔧 脚本位置建议

建议将以下脚本移动到 `scripts/` 目录：
- API 密钥相关脚本（保留根目录的快捷方式）
- 启动脚本（保留根目录的快捷方式）

这样可以保持根目录整洁，同时方便使用。

