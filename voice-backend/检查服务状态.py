#!/usr/bin/env python3
"""
检查后端服务状态和配置
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
env_file = Path(__file__).parent / '.env'
if env_file.exists():
    load_dotenv(env_file, override=True)
    print("✅ 已加载 .env 文件")
else:
    print("❌ .env 文件不存在")
    sys.exit(1)

print("\n📋 服务配置检查:")
print("=" * 50)

# 检查 WebSocket 配置
ws_host = os.getenv("WS_HOST", "localhost")
ws_port = int(os.getenv("WS_PORT", "8765"))
print(f"WebSocket 服务器: ws://{ws_host}:{ws_port}")

# 检查 TTS 服务配置
tts_service = os.getenv("TTS_SERVICE", "deepgram").lower()
print(f"\nTTS 服务: {tts_service.upper()}")

if tts_service == "cartesia":
    api_key = os.getenv("CARTESIA_API_KEY")
    voice_id = os.getenv("CARTESIA_VOICE_ID", "71a7ad14-091c-4e8e-a314-022ece01c121")
    if api_key:
        print(f"  ✅ Cartesia API Key: {api_key[:20]}...")
        print(f"  ✅ Voice ID: {voice_id}")
    else:
        print("  ❌ Cartesia API Key 未设置")
elif tts_service == "deepgram":
    api_key = os.getenv("DEEPGRAM_API_KEY")
    if api_key:
        print(f"  ✅ Deepgram API Key: {api_key[:20]}...")
    else:
        print("  ❌ Deepgram API Key 未设置")

# 检查必需的 API Keys
print(f"\n必需的 API Keys:")
deepgram_stt_key = os.getenv("DEEPGRAM_API_KEY")
deepseek_key = os.getenv("DEEPSEEK_API_KEY") or os.getenv("VITE_DEEPSEEK_API_KEY")

if deepgram_stt_key:
    print(f"  ✅ Deepgram STT API Key: {deepgram_stt_key[:20]}...")
else:
    print("  ❌ Deepgram STT API Key 未设置（STT 需要）")

if deepseek_key:
    print(f"  ✅ DeepSeek API Key: {deepseek_key[:20]}...")
else:
    print("  ❌ DeepSeek API Key 未设置（LLM 需要）")

# 检查 Python 包
print(f"\nPython 包检查:")
try:
    import cartesia
    print("  ✅ cartesia")
except ImportError:
    print("  ❌ cartesia (未安装)")

try:
    import pipecat
    print("  ✅ pipecat")
except ImportError:
    print("  ❌ pipecat (未安装)")

try:
    import websockets
    print("  ✅ websockets")
except ImportError:
    print("  ❌ websockets (未安装)")

try:
    import deepgram
    print("  ✅ deepgram-sdk")
except ImportError:
    print("  ❌ deepgram-sdk (未安装)")

print("\n" + "=" * 50)
print("💡 提示:")
print("  1. 确保所有必需的 API Keys 都已配置")
print("  2. 运行后端服务: python voice_bot.py")
print("  3. 检查是否有错误日志")
print("  4. 确保端口 8765 未被占用")

