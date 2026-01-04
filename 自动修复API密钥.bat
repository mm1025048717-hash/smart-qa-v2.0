@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ════════════════════════════════════════
echo   自动修复 API Key 配置
echo ════════════════════════════════════════
echo.

python 自动修复API密钥.py

if errorlevel 1 (
    echo.
    echo ❌ 自动修复失败
    echo.
    echo 请手动运行:
    echo   立即修复API密钥.bat
    echo   修复前端API密钥.bat
    pause
    exit /b 1
)

echo.
pause

