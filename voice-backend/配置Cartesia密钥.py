#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
配置 Cartesia API Key 到 .env 文件
"""

import sys
from pathlib import Path
import re

def update_cartesia_key(api_key):
    """更新 .env 文件中的 Cartesia API Key"""
    env_file = Path(__file__).parent / '.env'
    
    # 读取现有内容
    if env_file.exists():
        content = env_file.read_text(encoding='utf-8')
    else:
        # 如果不存在，从 env.example 创建
        example_file = Path(__file__).parent / 'env.example'
        if example_file.exists():
            content = example_file.read_text(encoding='utf-8')
        else:
            content = ""
    
    # 更新 Cartesia API Key
    pattern = r'CARTESIA_API_KEY=.*'
    replacement = f'CARTESIA_API_KEY={api_key}'
    
    if re.search(pattern, content):
        content = re.sub(pattern, replacement, content)
        print(f"✅ Cartesia API Key 已更新")
    else:
        # 如果不存在，添加到文件末尾
        if not content.endswith('\n'):
            content += '\n'
        content += f'\n# Cartesia API Key\n{replacement}\n'
        print(f"✅ Cartesia API Key 已添加")
    
    # 确保 TTS_SERVICE 设置为 cartesia
    tts_pattern = r'TTS_SERVICE=.*'
    tts_replacement = 'TTS_SERVICE=cartesia'
    if re.search(tts_pattern, content):
        content = re.sub(tts_pattern, tts_replacement, content)
    else:
        if not content.endswith('\n'):
            content += '\n'
        content += f'{tts_replacement}\n'
    
    # 保存文件
    env_file.write_text(content, encoding='utf-8')
    print(f"✅ .env 文件已更新: {env_file}")
    print(f"✅ TTS_SERVICE 已设置为 cartesia")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        api_key = sys.argv[1]
        update_cartesia_key(api_key)
    else:
        print("=" * 50)
        print("🎤 配置 Cartesia API Key")
        print("=" * 50)
        print()
        print("📝 使用方法:")
        print("   python 配置Cartesia密钥.py <your_api_key>")
        print()
        print("📝 获取 API Key:")
        print("   1. 访问: https://play.cartesia.ai/sign-up")
        print("   2. 注册/登录账号")
        print("   3. 在 Dashboard 中找到 API Key")
        print("   4. 复制 API Key")
        print()
        print("💡 或者直接编辑 .env 文件，添加:")
        print("   CARTESIA_API_KEY=your_api_key_here")
        print()

