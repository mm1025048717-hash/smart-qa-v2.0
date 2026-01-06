#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
配置 TTS 服务
"""

from pathlib import Path
import re

def configure_tts_service(service='deepgram'):
    """配置 TTS 服务"""
    env_file = Path(__file__).parent / '.env'
    
    if not env_file.exists():
        print("❌ .env 文件不存在，请先运行 自动配置.bat")
        return False
    
    content = env_file.read_text(encoding='utf-8')
    
    # 更新或添加 TTS_SERVICE
    if 'TTS_SERVICE=' in content:
        content = re.sub(r'TTS_SERVICE=.*', f'TTS_SERVICE={service}', content)
    else:
        # 在 DEEPGRAM_API_KEY 后面添加
        if 'DEEPGRAM_API_KEY=' in content:
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('DEEPGRAM_API_KEY='):
                    lines.insert(i + 1, f'\n# TTS 服务选择 (deepgram, cartesia, elevenlabs, piper, openai)')
                    lines.insert(i + 2, f'TTS_SERVICE={service}')
                    break
            content = '\n'.join(lines)
        else:
            content += f'\n# TTS 服务选择\nTTS_SERVICE={service}\n'
    
    env_file.write_text(content, encoding='utf-8')
    print(f"✅ 已配置使用 {service.upper()} TTS")
    return True

if __name__ == '__main__':
    import sys
    service = sys.argv[1] if len(sys.argv) > 1 else 'deepgram'
    configure_tts_service(service)



