@echo off
chcp 65001 >nul
echo ========================================
echo 🤖 DataAgent 语音服务 - 自动配置工具
echo ========================================
echo.

cd /d "%~dp0"

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Python，请先安装 Python 3.10+
    pause
    exit /b 1
)

echo ✅ Python 已安装
echo.

REM 运行 Python 自动配置脚本
python auto_config.py

if errorlevel 1 (
    echo.
    echo ❌ 配置失败，请检查错误信息
    pause
    exit /b 1
)

echo.
pause

