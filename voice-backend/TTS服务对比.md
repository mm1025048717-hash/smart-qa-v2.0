# 🎤 TTS 服务对比与选择指南

## 推荐方案（按优先级）

### 1. Deepgram TTS ⭐⭐⭐⭐⭐（最推荐）

**优势**:
- ✅ **与 STT 共用 API Key** - 您已经有 Deepgram API Key 了！
- ✅ **免费额度**: 每月 $200
- ✅ **低延迟**: 实时流式输出
- ✅ **高质量**: 自然语音
- ✅ **无需额外配置**: 直接使用现有 API Key

**配置**:
```bash
# .env 文件中设置
TTS_SERVICE=deepgram
DEEPGRAM_API_KEY=bef84eaf03683f526279912a2fdadfbd0b544897  # 您已有的 Key
```

**获取地址**: 您已经有了！https://console.deepgram.com/project/7b791280-0f5d-4427-acd7-24eb27a56db7/keys

---

### 2. Cartesia TTS ⭐⭐⭐⭐

**优势**:
- ✅ **免费额度**: 每月 $10
- ✅ **高质量**: 专业级语音
- ✅ **多种声音**: 支持多种语音模型
- ✅ **低延迟**: WebSocket 实时流式

**配置**:
```bash
TTS_SERVICE=cartesia
CARTESIA_API_KEY=your_cartesia_api_key
CARTESIA_VOICE_ID=71a7ad14-091c-4e8e-a314-022ece01c121  # 可选
```

**获取地址**: https://play.cartesia.ai/sign-up

---

### 3. Piper TTS ⭐⭐⭐⭐⭐（完全免费）

**优势**:
- ✅ **完全免费**: 本地运行，无需 API Key
- ✅ **离线可用**: 不依赖网络
- ✅ **开源**: 可自定义
- ⚠️ **需要下载模型**: 首次使用需下载（约 100MB）

**配置**:
```bash
TTS_SERVICE=piper
# 无需 API Key！
```

**安装**:
```bash
pip install pipecat-ai[piper]
```

---

### 4. ElevenLabs TTS ⭐⭐⭐

**优势**:
- ✅ **自然语音**: 最接近真人
- ✅ **情感表达**: 支持情感控制
- ⚠️ **价格较高**: 按字符数计费
- ⚠️ **免费额度有限**: 每月 10,000 字符

**配置**:
```bash
TTS_SERVICE=elevenlabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # 可选
```

**获取地址**: https://elevenlabs.io/

---

### 5. OpenAI TTS ⭐⭐⭐

**优势**:
- ✅ **质量稳定**: OpenAI 出品
- ⚠️ **需要 API Key**: 需要单独获取
- ⚠️ **按使用量付费**: 约 $15/100万字符

**配置**:
```bash
TTS_SERVICE=openai
OPENAI_API_KEY=your_openai_api_key
```

---

## 快速切换 TTS 服务

### 方法 1: 修改 .env 文件

编辑 `voice-backend/.env` 文件，添加或修改：

```ini
# 选择 TTS 服务: deepgram, cartesia, elevenlabs, piper, openai
TTS_SERVICE=deepgram
```

### 方法 2: 使用环境变量

```bash
set TTS_SERVICE=deepgram
python voice_bot.py
```

---

## 费用对比

| 服务 | 免费额度 | 付费价格 | 推荐度 |
|------|---------|---------|--------|
| **Deepgram** | $200/月 | 按使用量 | ⭐⭐⭐⭐⭐ |
| **Cartesia** | $10/月 | 按使用量 | ⭐⭐⭐⭐ |
| **Piper** | 完全免费 | 无 | ⭐⭐⭐⭐⭐ |
| **ElevenLabs** | 10K字符/月 | $5/月起 | ⭐⭐⭐ |
| **OpenAI** | 无 | $15/100万字符 | ⭐⭐⭐ |

---

## 推荐配置

### 方案 A: 使用 Deepgram（推荐）⭐

**理由**: 您已经有 Deepgram API Key，无需额外配置！

```ini
TTS_SERVICE=deepgram
DEEPGRAM_API_KEY=bef84eaf03683f526279912a2fdadfbd0b544897
```

### 方案 B: 使用 Piper（完全免费）

**理由**: 完全免费，本地运行，无需 API Key

```ini
TTS_SERVICE=piper
```

### 方案 C: 使用 Cartesia（高质量）

**理由**: 免费额度充足，质量高

```ini
TTS_SERVICE=cartesia
CARTESIA_API_KEY=your_cartesia_api_key
```

---

## 当前推荐

**立即使用 Deepgram TTS** - 因为您已经有 API Key 了！

只需在 `.env` 文件中添加：
```ini
TTS_SERVICE=deepgram
```

然后运行 `start.bat` 即可！

