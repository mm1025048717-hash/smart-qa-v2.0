#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复 server.js 中的 DeepSeek API Key
自动从 voice-backend/.env 读取，或提示用户输入
"""

import os
import re
import sys
from pathlib import Path

def read_env_key():
    """尝试从 voice-backend/.env 读取 API Key"""
    project_root = Path(__file__).parent.parent
    env_file = project_root / 'voice-backend' / '.env'
    
    if env_file.exists():
        try:
            content = env_file.read_text(encoding='utf-8')
            for line in content.split('\n'):
                if line.strip().startswith('DEEPSEEK_API_KEY=') and not line.strip().startswith('#'):
                    key = line.split('=', 1)[1].strip()
                    if key and key.startswith('sk-') and len(key) > 20:
                        return key
        except Exception as e:
            print(f"⚠️  读取 .env 文件失败: {e}")
    
    return None

def update_server_js(api_key):
    """更新 server.js 中的 API Key"""
    project_root = Path(__file__).parent.parent
    server_js = project_root / 'server.js'
    
    if not server_js.exists():
        print(f"❌ 错误: 找不到 server.js 文件")
        return False
    
    try:
        content = server_js.read_text(encoding='utf-8')
        
        # 匹配: const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'old-key';
        pattern = r"(const DEEPSEEK_API_KEY = process\.env\.DEEPSEEK_API_KEY \|\| )'[^']*'"
        
        if re.search(pattern, content):
            new_content = re.sub(pattern, rf"\1'{api_key}'", content)
            server_js.write_text(new_content, encoding='utf-8')
            print(f"✅ 成功更新 server.js 中的 DeepSeek API Key")
            print(f"   新 Key: {api_key[:20]}...")
            return True
        else:
            print(f"❌ 错误: 无法在 server.js 中找到 API Key 配置")
            return False
    except Exception as e:
        print(f"❌ 错误: {e}")
        return False

def main():
    print("=" * 50)
    print("  修复 DeepSeek API Key 配置")
    print("=" * 50)
    print()
    
    # 尝试从 .env 读取
    api_key = read_env_key()
    
    if api_key:
        print(f"✅ 从 voice-backend/.env 读取到 API Key: {api_key[:20]}...")
        use_this = input("使用这个 Key？(Y/n): ").strip().lower()
        if use_this and use_this != 'y' and use_this != 'yes':
            api_key = None
    
    # 如果没找到或用户选择不使用，提示输入
    if not api_key:
        print()
        print("请提供有效的 DeepSeek API Key")
        print("格式: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
        print("获取地址: https://platform.deepseek.com/api_keys")
        print()
        api_key = input("请输入 API Key: ").strip()
        
        if not api_key:
            print("❌ API Key 不能为空")
            sys.exit(1)
        
        if not api_key.startswith('sk-') or len(api_key) < 20:
            print("❌ API Key 格式不正确（应该以 'sk-' 开头）")
            sys.exit(1)
    
    # 更新 server.js
    print()
    if update_server_js(api_key):
        print()
        print("💡 提示: 请重启服务器使更改生效")
        print("   如果是开发服务器，按 Ctrl+C 停止后重新运行 npm run dev")
    else:
        sys.exit(1)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ 用户取消操作")
        sys.exit(1)

