#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动修复 API Key 配置
从 server.js 提取 API Key 并配置到前端和后端
"""

import os
import re
import sys
from pathlib import Path

def extract_api_key_from_server_js():
    """从 server.js 提取 API Key"""
    project_root = Path(__file__).parent
    server_js = project_root / 'server.js'
    
    if not server_js.exists():
        print("❌ 错误: 找不到 server.js 文件")
        return None
    
    try:
        content = server_js.read_text(encoding='utf-8')
        # 匹配: const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'key';
        pattern = r"DEEPSEEK_API_KEY\s*=\s*process\.env\.DEEPSEEK_API_KEY\s*\|\|\s*['\"]([^'\"]+)['\"]"
        match = re.search(pattern, content)
        
        if match:
            key = match.group(1)
            if key.startswith('sk-') and len(key) > 20:
                print(f"✅ 从 server.js 提取到 API Key: {key[:20]}...")
                return key
    except Exception as e:
        print(f"⚠️  读取 server.js 失败: {e}")
    
    return None

def create_env_local(api_key):
    """创建前端 .env.local 文件"""
    project_root = Path(__file__).parent
    env_local = project_root / '.env.local'
    
    try:
        content = f"""# 前端环境变量配置
# 自动生成 - 请勿手动编辑（除非需要更新 API Key）

# DeepSeek API Key (用于前端直接调用)
VITE_DEEPSEEK_API_KEY={api_key}
"""
        env_local.write_text(content, encoding='utf-8')
        print(f"✅ 已创建 .env.local 文件: {env_local}")
        return True
    except Exception as e:
        print(f"❌ 创建 .env.local 失败: {e}")
        return False

def check_voice_backend_env(api_key):
    """检查并更新 voice-backend/.env 文件"""
    project_root = Path(__file__).parent
    voice_env = project_root / 'voice-backend' / '.env'
    voice_env_example = project_root / 'voice-backend' / 'env.example'
    
    # 如果 .env 不存在，从 env.example 创建
    if not voice_env.exists() and voice_env_example.exists():
        try:
            content = voice_env_example.read_text(encoding='utf-8')
            # 替换 DeepSeek API Key
            content = re.sub(
                r'DEEPSEEK_API_KEY=.*',
                f'DEEPSEEK_API_KEY={api_key}',
                content
            )
            content = re.sub(
                r'VITE_DEEPSEEK_API_KEY=.*',
                f'VITE_DEEPSEEK_API_KEY={api_key}',
                content
            )
            voice_env.write_text(content, encoding='utf-8')
            print(f"✅ 已创建 voice-backend/.env 文件")
        except Exception as e:
            print(f"⚠️  创建 voice-backend/.env 失败: {e}")
    elif voice_env.exists():
        # 更新现有的 .env 文件
        try:
            content = voice_env.read_text(encoding='utf-8')
            # 更新 DeepSeek API Key
            content = re.sub(
                r'DEEPSEEK_API_KEY=.*',
                f'DEEPSEEK_API_KEY={api_key}',
                content
            )
            content = re.sub(
                r'VITE_DEEPSEEK_API_KEY=.*',
                f'VITE_DEEPSEEK_API_KEY={api_key}',
                content
            )
            voice_env.write_text(content, encoding='utf-8')
            print(f"✅ 已更新 voice-backend/.env 文件")
        except Exception as e:
            print(f"⚠️  更新 voice-backend/.env 失败: {e}")

def main():
    print("=" * 60)
    print("  自动修复 API Key 配置")
    print("=" * 60)
    print()
    
    # 步骤 1: 从 server.js 提取 API Key
    print("[1/3] 提取 API Key...")
    api_key = extract_api_key_from_server_js()
    
    if not api_key:
        print()
        print("❌ 无法自动提取 API Key")
        print()
        print("请手动配置:")
        print("  1. 获取新的 DeepSeek API Key: https://platform.deepseek.com/api_keys")
        print("  2. 运行: 立即修复API密钥.bat")
        print("  3. 运行: 修复前端API密钥.bat")
        sys.exit(1)
    
    print()
    
    # 步骤 2: 创建前端 .env.local
    print("[2/3] 配置前端环境变量...")
    if not create_env_local(api_key):
        print("⚠️  前端配置失败，但可以继续")
    print()
    
    # 步骤 3: 更新 voice-backend/.env
    print("[3/3] 配置后端环境变量...")
    check_voice_backend_env(api_key)
    print()
    
    print("=" * 60)
    print("  ✅ 配置完成！")
    print("=" * 60)
    print()
    print("📋 配置摘要:")
    print(f"   ✅ 前端: .env.local 已创建")
    print(f"   ✅ 后端: voice-backend/.env 已更新")
    print(f"   ✅ API Key: {api_key[:20]}...")
    print()
    print("💡 下一步:")
    print("   1. 重启开发服务器 (npm run dev)")
    print("   2. 如果仍然出现 401 错误，说明 API Key 已失效")
    print("     请访问 https://platform.deepseek.com/api_keys 获取新 Key")
    print("     然后运行: 立即修复API密钥.bat")
    print()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ 用户取消操作")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

