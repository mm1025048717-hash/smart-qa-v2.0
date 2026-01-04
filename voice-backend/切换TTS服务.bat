@echo off
chcp 65001 >nul
echo ========================================
echo 🎤 切换 TTS 服务
echo ========================================
echo.

cd /d "%~dp0"

if "%1"=="" (
    echo 使用方法:
    echo   切换TTS服务.bat ^<服务名称^>
    echo.
    echo 可选服务:
    echo   deepgram    - Deepgram TTS ^(推荐，与 STT 共用 API Key^)
    echo   cartesia    - Cartesia TTS ^(高质量，免费额度^)
    echo   elevenlabs  - ElevenLabs TTS ^(自然语音^)
    echo   piper       - Piper TTS ^(完全免费，本地运行^)
    echo   openai      - OpenAI TTS ^(需要 API Key^)
    echo.
    echo 示例:
    echo   切换TTS服务.bat deepgram
    echo.
    pause
    exit /b 1
)

echo 📝 正在切换到 %1 TTS 服务...
python 配置TTS服务.py %1

if errorlevel 1 (
    echo ❌ 切换失败
    pause
    exit /b 1
)

echo.
echo ✅ 切换完成！
echo.
echo 💡 提示: 运行 start.bat 启动服务以使用新的 TTS 服务
echo.
pause


