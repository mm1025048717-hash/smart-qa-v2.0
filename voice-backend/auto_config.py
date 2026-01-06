#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动配置 DataAgent 语音服务
从项目中提取 DeepSeek API Key 并创建 .env 文件
"""

import os
import re
import sys
from pathlib import Path

def extract_deepseek_key():
    """从项目文件中提取 DeepSeek API Key"""
    project_root = Path(__file__).parent.parent
    possible_files = [
        project_root / 'server.js',
        project_root / 'api' / 'deepseek.js',
    ]
    
    # 默认 API Key（从代码中找到的）
    default_key = 'sk-b1551c8a25d042a7ae8b0166820249a8'
    
    for file_path in possible_files:
        if file_path.exists():
            try:
                content = file_path.read_text(encoding='utf-8')
                # 匹配 DEEPSEEK_API_KEY = '...' 或 "..." 或 process.env.DEEPSEEK_API_KEY || '...'
                patterns = [
                    r"DEEPSEEK_API_KEY\s*=\s*['\"]([^'\"]+)['\"]",
                    r"DEEPSEEK_API_KEY\s*\|\|\s*['\"]([^'\"]+)['\"]",
                    r"['\"](sk-[^'\"]+)['\"]",
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, content)
                    if match:
                        key = match.group(1)
                        # 验证是否是有效的 API Key 格式
                        if key.startswith('sk-') and len(key) > 20:
                            if key != 'your-api-key' and key != 'your_deepseek_api_key_here':
                                print(f"✅ 从 {file_path.name} 中提取到 DeepSeek API Key")
                                return key
            except Exception as e:
                print(f"⚠️  读取 {file_path} 失败: {e}")
                continue
    
    print(f"⚠️  未找到 DeepSeek API Key，使用默认值")
    return default_key

def create_env_file(deepseek_key):
    """创建 .env 文件"""
    env_file = Path(__file__).parent / '.env'
    
    # 检查是否已有 .env 文件
    existing_keys = {}
    if env_file.exists():
        content = env_file.read_text(encoding='utf-8')
        for line in content.split('\n'):
            if '=' in line and not line.strip().startswith('#'):
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                if key in ['DEEPGRAM_API_KEY', 'OPENAI_API_KEY']:
                    if value and value not in ['your_deepgram_api_key_here', 'your_openai_api_key_here']:
                        existing_keys[key] = value
    
    # 从系统环境变量读取
    deepgram_key = existing_keys.get('DEEPGRAM_API_KEY') or os.getenv('DEEPGRAM_API_KEY', 'your_deepgram_api_key_here')
    openai_key = existing_keys.get('OPENAI_API_KEY') or os.getenv('OPENAI_API_KEY', 'your_openai_api_key_here')
    
    # 生成 .env 内容
    env_content = f"""# DataAgent 语音服务配置
# 自动生成时间: {os.popen('date /t').read().strip() if sys.platform == 'win32' else ''}

# DeepSeek API Key (用于 LLM，与前端共用)
# ✅ 已自动从项目中提取
DEEPSEEK_API_KEY={deepseek_key}
VITE_DEEPSEEK_API_KEY={deepseek_key}

# Deepgram API Key (用于语音转文字 STT)
# 获取地址: https://console.deepgram.com/signup
# 免费额度: 每月 $200
DEEPGRAM_API_KEY={deepgram_key}

# OpenAI API Key (用于文字转语音 TTS)
# 获取地址: https://platform.openai.com/api-keys
# 免费额度: 新用户 $5
OPENAI_API_KEY={openai_key}

# WebSocket 服务器配置
WS_HOST=localhost
WS_PORT=8765
"""
    
    env_file.write_text(env_content, encoding='utf-8')
    print(f"✅ .env 文件已创建/更新: {env_file}")
    
    # 显示配置摘要
    print("\n📋 配置摘要:")
    print(f"   ✅ DeepSeek API Key: 已配置 ({deepseek_key[:20]}...)")
    if deepgram_key != 'your_deepgram_api_key_here':
        print(f"   ✅ Deepgram API Key: 已配置 ({deepgram_key[:20]}...)")
    else:
        print(f"   ⚠️  Deepgram API Key: 需要配置 (编辑 .env 文件)")
    if openai_key != 'your_openai_api_key_here':
        print(f"   ✅ OpenAI API Key: 已配置 ({openai_key[:20]}...)")
    else:
        print(f"   ⚠️  OpenAI API Key: 需要配置 (编辑 .env 文件)")
    
    return deepgram_key == 'your_deepgram_api_key_here' or openai_key == 'your_openai_api_key_here'

if __name__ == '__main__':
    print("=" * 50)
    print("🤖 DataAgent 语音服务 - 自动配置工具")
    print("=" * 50)
    print()
    
    # 提取 DeepSeek API Key
    deepseek_key = extract_deepseek_key()
    print()
    
    # 创建 .env 文件
    needs_config = create_env_file(deepseek_key)
    print()
    
    if needs_config:
        print("⚠️  注意: 还有 API Keys 需要配置")
        print("   请编辑 .env 文件填写 DEEPGRAM_API_KEY 和 OPENAI_API_KEY")
        print("   或查看 获取API密钥指南.md 了解如何获取")
        print()
    
    print("=" * 50)
    print("✅ 配置完成！")
    print("=" * 50)



