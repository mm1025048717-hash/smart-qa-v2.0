#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""查看当前配置状态"""

from pathlib import Path

env_file = Path(__file__).parent / '.env'

if not env_file.exists():
    print("❌ .env 文件不存在，请先运行 自动配置.bat")
    exit(1)

content = env_file.read_text(encoding='utf-8')

# 提取各个 API Keys
deepseek = None
deepgram = None
openai = None

for line in content.split('\n'):
    if line.startswith('DEEPSEEK_API_KEY='):
        deepseek = line.split('=', 1)[1].strip()
    elif line.startswith('DEEPGRAM_API_KEY='):
        deepgram = line.split('=', 1)[1].strip()
    elif line.startswith('OPENAI_API_KEY='):
        openai = line.split('=', 1)[1].strip()

print("📋 当前配置状态:\n")

# DeepSeek
if deepseek and deepseek != 'your_deepseek_api_key_here':
    print(f"✅ DeepSeek API Key: 已配置 ({deepseek[:20]}...)")
else:
    print("❌ DeepSeek API Key: 未配置")

# Deepgram
if deepgram and deepgram != 'your_deepgram_api_key_here':
    print(f"✅ Deepgram API Key: 已配置 ({deepgram[:20]}...)")
else:
    print("⚠️  Deepgram API Key: 未配置 (语音转文字功能需要)")

# OpenAI
if openai and openai != 'your_openai_api_key_here':
    print(f"✅ OpenAI API Key: 已配置 ({openai[:20]}...)")
else:
    print("⚠️  OpenAI API Key: 未配置 (文字转语音功能需要)")

print()

# 检查 TTS 服务配置
tts_service = None
for line in content.split('\n'):
    if line.startswith('TTS_SERVICE='):
        tts_service = line.split('=', 1)[1].strip().lower()
        break

# 总结
has_deepseek = deepseek and deepseek != 'your_deepseek_api_key_here'
has_deepgram = deepgram and deepgram != 'your_deepgram_api_key_here'
has_openai = openai and openai != 'your_openai_api_key_here'

# 判断是否需要 OpenAI（取决于 TTS 服务选择）
needs_openai = tts_service and tts_service == 'openai' and not has_openai
using_deepgram_tts = (tts_service == 'deepgram' or not tts_service) and has_deepgram

if has_deepseek and has_deepgram:
    print("=" * 50)
    if using_deepgram_tts:
        print("✅ 所有配置已完成！可以启动服务了。")
        print("   - DeepSeek: 文字对话 ✅")
        print("   - Deepgram: 语音输入 ✅")
        print("   - Deepgram: 语音输出 ✅ (与 STT 共用 API Key)")
    elif needs_openai:
        print("✅ 基础配置已完成")
        print("   - DeepSeek: 文字对话 ✅")
        print("   - Deepgram: 语音输入 ✅")
        print("   ⚠️  语音输出需要 OpenAI API Key (当前使用 OpenAI TTS)")
    else:
        print("✅ 所有配置已完成！可以启动服务了。")
    print("=" * 50)
    print("\n🚀 运行 start.bat 启动服务")
elif has_deepseek:
    print("=" * 50)
    print("✅ DeepSeek 已配置，文字对话功能可用")
    if not has_deepgram:
        print("⚠️  语音输入功能需要 Deepgram API Key")
    if needs_openai:
        print("⚠️  语音输出功能需要 OpenAI API Key")
    print("=" * 50)
else:
    print("=" * 50)
    print("⚠️  请先运行 自动配置.bat 完成基础配置")
    print("=" * 50)

