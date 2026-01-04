# 🎤 Cartesia TTS 配置指南

## ✅ 当前状态

- ✅ 已切换到 Cartesia TTS
- ⚠️ 需要配置 API Key

## 📝 配置步骤

### 步骤 1: 获取 API Key

1. **访问注册页面**（已自动打开浏览器）：
   - https://play.cartesia.ai/sign-up

2. **注册/登录账号**：
   - 可以使用 Google/GitHub 账号快速登录
   - 或使用邮箱注册

3. **获取 API Key**：
   - 登录后，在 Dashboard 中找到 API Key
   - 点击复制 API Key

### 步骤 2: 配置 API Key

**方法 1: 使用脚本（推荐）**

获取 API Key 后，运行：
```bash
python 配置Cartesia密钥.py <your_api_key>
```

例如：
```bash
python 配置Cartesia密钥.py cartesia_xxxxxxxxxxxxxxxxxxxx
```

**方法 2: 手动编辑 .env 文件**

1. 打开 `voice-backend\.env` 文件
2. 找到或添加以下行：
   ```ini
   CARTESIA_API_KEY=your_api_key_here
   ```
3. 将 `your_api_key_here` 替换为您的实际 API Key
4. 确保 `TTS_SERVICE=cartesia` 已设置

### 步骤 3: 启动服务

配置完成后，运行：
```bash
启动服务.bat
```

## 💡 免费额度

- **每月 $10 免费额度**
- 足够日常使用
- 高质量语音合成

## 🎯 语音 ID 选择（可选）

Cartesia 支持多种语音，默认使用：
- `71a7ad14-091c-4e8e-a314-022ece01c121`（默认女性声音）

如需更改，在 .env 文件中设置：
```ini
CARTESIA_VOICE_ID=your_voice_id_here
```

可在 Cartesia Dashboard 中查看可用的语音 ID。

## ❓ 遇到问题？

1. **API Key 无效**：检查是否复制完整，确保没有多余空格
2. **连接失败**：检查网络连接，确保可以访问 Cartesia 服务
3. **服务启动失败**：检查 .env 文件中 API Key 是否正确配置

