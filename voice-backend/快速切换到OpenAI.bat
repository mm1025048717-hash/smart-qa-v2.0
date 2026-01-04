@echo off
chcp 65001 >nul
echo ========================================
echo 🎤 快速切换到 OpenAI TTS
echo ========================================
echo.

cd /d "%~dp0"

echo 📝 请先确保您已获取 OpenAI API Key
echo    获取地址: https://platform.openai.com/api-keys
echo    新用户有 $5 免费额度
echo.
pause

echo.
echo 📝 切换到 OpenAI TTS...
python 配置TTS服务.py openai

if errorlevel 1 (
    echo ❌ 切换失败
    pause
    exit /b 1
)

echo.
echo ✅ 切换完成！
echo.
echo 💡 下一步：
echo    1. 运行 更新API密钥.py 配置 OpenAI API Key
echo    2. 或在 .env 文件中添加: OPENAI_API_KEY=sk-your-key-here
echo    3. 运行 启动服务.bat 启动服务
echo.
pause

