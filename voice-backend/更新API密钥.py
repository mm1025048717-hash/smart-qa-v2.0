#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新 API Keys 到 .env 文件
"""

import sys
from pathlib import Path

def update_env_file(deepgram_key=None, openai_key=None):
    """更新 .env 文件中的 API Keys"""
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
    
    # 更新 Deepgram API Key
    if deepgram_key:
        import re
        # 替换现有的 DEEPGRAM_API_KEY
        pattern = r'DEEPGRAM_API_KEY=.*'
        replacement = f'DEEPGRAM_API_KEY={deepgram_key}'
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
        else:
            # 如果不存在，添加到文件末尾
            if not content.endswith('\n'):
                content += '\n'
            content += f'\n# Deepgram API Key (已自动配置)\n{replacement}\n'
        print(f"✅ Deepgram API Key 已更新")
    
    # 更新 OpenAI API Key
    if openai_key:
        import re
        # 替换现有的 OPENAI_API_KEY
        pattern = r'OPENAI_API_KEY=.*'
        replacement = f'OPENAI_API_KEY={openai_key}'
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
        else:
            # 如果不存在，添加到文件末尾
            if not content.endswith('\n'):
                content += '\n'
            content += f'\n# OpenAI API Key (已自动配置)\n{replacement}\n'
        print(f"✅ OpenAI API Key 已更新")
    
    # 保存文件
    env_file.write_text(content, encoding='utf-8')
    print(f"✅ .env 文件已更新: {env_file}")

if __name__ == '__main__':
    # 从命令行参数获取 API Keys
    deepgram_key = None
    openai_key = None
    
    if len(sys.argv) > 1:
        deepgram_key = sys.argv[1]
    if len(sys.argv) > 2:
        openai_key = sys.argv[2]
    
    update_env_file(deepgram_key, openai_key)
    
    print("\n📋 当前配置:")
    env_file = Path(__file__).parent / '.env'
    if env_file.exists():
        content = env_file.read_text(encoding='utf-8')
        for line in content.split('\n'):
            if line.startswith('DEEPSEEK_API_KEY='):
                key = line.split('=', 1)[1].strip()
                print(f"   ✅ DeepSeek: {key[:20]}...")
            elif line.startswith('DEEPGRAM_API_KEY='):
                key = line.split('=', 1)[1].strip()
                if key and key != 'your_deepgram_api_key_here':
                    print(f"   ✅ Deepgram: {key[:20]}...")
                else:
                    print(f"   ⚠️  Deepgram: 未配置")
            elif line.startswith('OPENAI_API_KEY='):
                key = line.split('=', 1)[1].strip()
                if key and key != 'your_openai_api_key_here':
                    print(f"   ✅ OpenAI: {key[:20]}...")
                else:
                    print(f"   ⚠️  OpenAI: 未配置")



