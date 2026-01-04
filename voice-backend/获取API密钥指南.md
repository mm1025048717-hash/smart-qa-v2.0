# 🔑 获取 API 密钥指南

## 已自动配置 ✅

- **DeepSeek API Key**: 已从项目中自动提取并配置

## 需要手动获取的 API Keys

### 1. Deepgram API Key（语音转文字）

**用途**: 将你的语音转换为文字

**获取步骤**:
1. 访问：https://console.deepgram.com/signup
2. 注册/登录账号
3. 进入 Dashboard → API Keys
4. 点击 "Create API Key"
5. 复制 API Key（格式类似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

**免费额度**: 每月 $200 免费额度，足够使用

---

### 2. OpenAI API Key（文字转语音）

**用途**: 将 DataAgent 的文字回复转换为语音

**获取步骤**:
1. 访问：https://platform.openai.com/api-keys
2. 注册/登录账号
3. 点击 "Create new secret key"
4. 复制 API Key（格式类似：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

**免费额度**: 新用户有 $5 免费额度

**替代方案**: 如果不想使用 OpenAI，可以使用：
- **Cartesia** (推荐): https://play.cartesia.ai/sign-up
- **ElevenLabs**: https://elevenlabs.io/
- **Deepgram TTS**: 与 STT 使用同一个 API Key

---

## 配置方法

### 方法 1: 编辑 .env 文件（推荐）

1. 打开 `voice-backend` 文件夹
2. 用文本编辑器打开 `.env` 文件
3. 找到以下两行：
   ```ini
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. 替换为你的实际 API Keys：
   ```ini
   DEEPGRAM_API_KEY=你的_Deepgram_API_Key
   OPENAI_API_KEY=你的_OpenAI_API_Key
   ```
5. 保存文件

### 方法 2: 使用环境变量

在 Windows 中设置系统环境变量：
- `DEEPGRAM_API_KEY`
- `OPENAI_API_KEY`

然后重新运行 `自动配置.bat`，脚本会自动读取环境变量。

---

## 快速测试

配置完成后，运行：

```bash
start.bat
```

如果配置正确，服务会正常启动。如果有错误，请检查：
1. API Keys 是否正确填写
2. API Keys 是否有效（未过期）
3. 网络连接是否正常

---

## 费用说明

- **Deepgram**: 每月 $200 免费额度，超出后按使用量付费
- **OpenAI TTS**: 按使用量付费，约 $15/100万字符
- **DeepSeek**: 已配置，费用由项目统一管理

**建议**: 先使用免费额度测试，确认功能正常后再考虑付费方案。


