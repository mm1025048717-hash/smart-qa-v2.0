# DataAgent 语音服务

基于 Pipecat 的语音服务，让 DataAgent 可以说话。

## 功能特性

- 🎤 **语音输入**: 使用 Deepgram 进行语音转文字 (STT)
- 🧠 **智能对话**: 使用 DeepSeek LLM 进行对话
- 🔊 **语音输出**: 使用 OpenAI TTS 进行文字转语音
- 🔌 **WebSocket 连接**: 实时双向音频流
- 👥 **多 Agent 支持**: 支持不同的 DataAgent (Alisa, Nora, 归因哥等)

## 快速开始

### 方式 1: 使用批处理脚本（Windows 推荐）⭐

1. **安装依赖**：
   ```bash
   # 双击运行或在命令行执行
   install.bat
   ```

2. **配置环境变量**：
   - 复制 `env.example` 到 `.env`
   - 编辑 `.env` 文件，填写 API Keys

3. **启动服务**：
   ```bash
   # 启动默认 Agent (Alisa)
   start.bat
   
   # 或指定 Agent
   start.bat nora
   start.bat attributor
   ```

### 方式 2: 使用 pip（通用方法）

1. **安装依赖**：
   ```bash
   cd voice-backend
   pip install -r requirements.txt
   ```

2. **配置环境变量**：
   ```bash
   # Windows
   copy env.example .env
   
   # Linux/Mac
   cp env.example .env
   ```
   
   然后编辑 `.env` 文件，填写以下 API Keys:
   - `DEEPSEEK_API_KEY`: DeepSeek API Key (用于 LLM)
   - `DEEPGRAM_API_KEY`: Deepgram API Key (用于 STT)
   - `OPENAI_API_KEY`: OpenAI API Key (用于 TTS)

3. **运行服务**：
   ```bash
   # 运行默认 Agent (Alisa)
   python voice_bot.py
   
   # 或指定 Agent
   python voice_bot.py alisa
   python voice_bot.py nora
   python voice_bot.py attributor
   ```

### 方式 3: 使用 uv（如果已安装）

```bash
uv sync
uv run voice_bot.py alisa
```

服务将在 `ws://localhost:8765` 启动 WebSocket 服务器。

## 支持的 Agent

- `alisa`: Alisa - 核心算法
- `nora`: Nora - 文科生
- `attributor`: 归因哥 - 归因分析师
- `viz-master`: 可视化小王
- `metrics-pro`: Emily - 指标体系专家
- `predictor`: 预测君
- 其他 Agent 使用默认配置

## 前端集成

前端通过 WebSocket 连接到 `ws://localhost:8765` 进行语音交互。

详见前端 `src/services/voiceService.ts` 和 `src/components/VoiceInput.tsx`。

## 注意事项

1. **首次运行**: 首次运行会下载模型，可能需要 20 秒左右
2. **API Keys**: 确保所有 API Keys 都已正确配置
3. **端口**: 默认端口 8765，可通过环境变量 `WS_PORT` 修改
4. **TTS 服务**: 可以替换为其他 TTS 服务（Cartesia, ElevenLabs 等）

