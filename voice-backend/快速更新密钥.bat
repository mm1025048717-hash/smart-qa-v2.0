@echo off
chcp 65001 >nul
echo ========================================
echo 🔑 快速更新 API Keys
echo ========================================
echo.

cd /d "%~dp0"

if "%1"=="" (
    echo 使用方法:
    echo   快速更新密钥.bat ^<Deepgram_API_Key^> [OpenAI_API_Key]
    echo.
    echo 示例:
    echo   快速更新密钥.bat bef84eaf03683f526279912a2fdadfbd0b544897
    echo   快速更新密钥.bat bef84eaf03683f526279912a2fdadfbd0b544897 sk-xxxxxxxxxxxxx
    echo.
    pause
    exit /b 1
)

echo 📝 正在更新 API Keys...
python 更新API密钥.py %1 %2

if errorlevel 1 (
    echo ❌ 更新失败
    pause
    exit /b 1
)

echo.
echo ✅ 更新完成！
echo.
pause


