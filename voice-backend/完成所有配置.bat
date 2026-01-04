@echo off
chcp 65001 >nul
title DataAgent 语音服务 - 完成所有配置
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║     🤖 DataAgent 语音服务 - 全自动配置完成              ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM 步骤 1: 自动配置 API Keys
echo [1/4] 📝 自动配置 API Keys...
python auto_config.py
if errorlevel 1 (
    color 0C
    echo ❌ 配置失败
    pause
    exit /b 1
)

echo.
echo [2/4] 🎤 配置 TTS 服务（使用 Deepgram，与 STT 共用 API Key）...
python 配置TTS服务.py deepgram
if errorlevel 1 (
    echo ⚠️  TTS 配置失败，将使用默认设置
)

echo.
echo [3/4] 📦 安装依赖...
python -m pip install -q --upgrade pip 2>nul
python -m pip install -q pipecat-ai[websocket,deepgram] python-dotenv loguru websockets 2>nul
if errorlevel 1 (
    echo ⚠️  使用国内镜像重试...
    python -m pip install -q -i https://pypi.tuna.tsinghua.edu.cn/simple pipecat-ai[websocket,deepgram] python-dotenv loguru websockets
    if errorlevel 1 (
        color 0C
        echo ❌ 依赖安装失败
        echo    请手动运行: pip install -r requirements.txt
        pause
        exit /b 1
    )
)
echo ✅ 依赖安装完成

echo.
echo [4/4] 🔍 检查配置状态...
python 查看配置.py

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                    ✅ 配置完成！                         ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║                                                          ║
echo ║  🎉 所有配置已完成，可以启动服务了！                     ║
echo ║                                                          ║
echo ║  🚀 下一步: 运行 start.bat 启动服务                     ║
echo ║                                                          ║
echo ║  💡 提示:                                                ║
echo ║     - DeepSeek: 文字对话 ✅                              ║
echo ║     - Deepgram: 语音输入 ✅                             ║
echo ║     - Deepgram: 语音输出 ✅ (与 STT 共用 API Key)        ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

pause


