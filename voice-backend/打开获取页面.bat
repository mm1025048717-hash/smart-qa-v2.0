@echo off
chcp 65001 >nul
echo 🔗 正在打开 API Keys 获取页面...
echo.

REM 打开 OpenAI API Keys 页面
echo 📝 打开 OpenAI API Keys 页面...
start https://platform.openai.com/api-keys
timeout /t 1 >nul

REM 打开 Deepgram 页面
echo 📝 打开 Deepgram API Keys 页面...
start https://console.deepgram.com/project/7b791280-0f5d-4427-acd7-24eb27a56db7/keys
timeout /t 1 >nul

echo.
echo ✅ 页面已打开
echo.
echo 💡 提示:
echo    - OpenAI: 用于文字转语音 (TTS)
echo    - Deepgram: 用于语音转文字 (STT) - 您已配置
echo.
echo 📝 获取 API Key 后，运行:
echo    快速更新密钥.bat ^<Deepgram_Key^> ^<OpenAI_Key^>
echo.
pause

