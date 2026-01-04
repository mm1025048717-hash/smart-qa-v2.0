# 🎤 DataAgent 语音功能集成指南

本指南说明如何将 Pipecat 语音功能集成到 DataAgent 系统中，让 DataAgent 可以说话。

## 📋 功能概述

- ✅ **语音输入**: 用户可以通过语音提问
- ✅ **语音输出**: DataAgent 可以用语音回答
- ✅ **实时对话**: 基于 WebSocket 的实时双向音频流
- ✅ **多 Agent 支持**: 支持所有 DataAgent (Alisa, Nora, 归因哥等)

## 🏗️ 架构说明

```
前端 (React)                   后端 (Python)
┌─────────────┐              ┌──────────────┐
│ VoiceInput  │  WebSocket   │ voice_bot.py │
│  Component  │ ◄──────────► │  (Pipecat)   │
└─────────────┘              └──────────────┘
     │                              │
     │                              │
     ▼                              ▼
┌─────────────┐              ┌──────────────┐
│ VoiceService│              │  STT + LLM   │
│  (WebSocket)│              │  + TTS       │
└─────────────┘              └──────────────┘
```

## 🚀 快速开始

### 1. 后端设置

#### 安装依赖

```bash
cd voice-backend
uv sync
# 或
pip install -r requirements.txt
```

#### 配置环境变量

复制 `env.example` 到 `.env` 并填写 API Keys:

```bash
cp env.example .env
```

需要配置的 API Keys:
- `DEEPSEEK_API_KEY`: DeepSeek API Key (用于 LLM，与前端共用)
- `DEEPGRAM_API_KEY`: Deepgram API Key (用于语音转文字 STT)
- `OPENAI_API_KEY`: OpenAI API Key (用于文字转语音 TTS)

#### 运行后端服务

```bash
# 运行默认 Agent (Alisa)
uv run voice_bot.py

# 或指定 Agent
uv run voice_bot.py alisa
uv run voice_bot.py nora
```

服务将在 `ws://localhost:8765` 启动 WebSocket 服务器。

### 2. 前端设置

#### 环境变量

在 `.env` 或 `vite.config.ts` 中配置 WebSocket URL:

```env
VITE_VOICE_WS_URL=ws://localhost:8765
```

#### 使用语音组件

语音功能已集成到 `ChatInput` 组件中：

1. 点击输入框左侧的 🎤 图标开启语音输入
2. 点击录音按钮开始说话
3. 语音会自动转换为文字并填入输入框
4. DataAgent 的回复会通过语音播放

## 📁 文件结构

```
voice-backend/
├── voice_bot.py          # Python 后端服务（Pipecat）
├── requirements.txt      # Python 依赖
├── env.example          # 环境变量示例
└── README.md            # 后端文档

src/
├── services/
│   └── voiceService.ts  # WebSocket 客户端服务
└── components/
    ├── VoiceInput.tsx   # 语音输入组件
    └── ChatInput.tsx    # 已集成语音功能
```

## 🔧 配置说明

### 支持的 Agent

后端支持以下 Agent，每个 Agent 都有独特的系统提示词：

- `alisa`: Alisa - 核心算法
- `nora`: Nora - 文科生
- `attributor`: 归因哥 - 归因分析师
- `viz-master`: 可视化小王
- `metrics-pro`: Emily - 指标体系专家
- `predictor`: 预测君
- 其他 Agent 使用默认配置

### TTS 服务选择

默认使用 OpenAI TTS，可以替换为其他服务：

- **Cartesia**: 高质量语音，支持多种声音
- **ElevenLabs**: 自然语音，支持情感表达
- **Deepgram**: 快速响应
- **其他**: 参考 Pipecat 文档

修改 `voice_bot.py` 中的 TTS 服务：

```python
# 替换为 Cartesia
from pipecat.services.cartesia.tts import CartesiaTTSService
tts = CartesiaTTSService(api_key=os.getenv("CARTESIA_API_KEY"))
```

## 🐛 故障排除

### 后端问题

1. **连接失败**: 检查 WebSocket 端口是否被占用
2. **API Key 错误**: 确认所有 API Keys 都已正确配置
3. **模型下载慢**: 首次运行需要下载模型，请耐心等待

### 前端问题

1. **麦克风权限**: 确保浏览器已授予麦克风权限
2. **WebSocket 连接失败**: 检查后端服务是否运行
3. **音频播放失败**: 检查浏览器音频权限

### 常见错误

- `WebSocket connection failed`: 后端服务未启动或端口错误
- `Microphone permission denied`: 需要在浏览器设置中允许麦克风
- `API Key invalid`: 检查环境变量配置

## 📚 相关文档

- [Pipecat 官方文档](https://docs.pipecat.ai/)
- [Deepgram API 文档](https://developers.deepgram.com/)
- [DeepSeek API 文档](https://api-docs.deepseek.com/)

## 🎯 下一步

- [ ] 添加更多 TTS 服务支持
- [ ] 实现语音唤醒功能
- [ ] 添加语音情感识别
- [ ] 支持多语言语音输入/输出


