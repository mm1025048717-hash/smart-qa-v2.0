@echo off
chcp 65001 >nul
echo ========================================
echo 📦 安装 Cartesia TTS 依赖包
echo ========================================
echo.

cd /d "%~dp0"

echo 📝 正在安装 cartesia 包...
pip install cartesia

if errorlevel 1 (
    echo ❌ 安装失败
    pause
    exit /b 1
)

echo.
echo ✅ 安装完成！
echo.
echo 💡 下一步：运行 启动服务.bat 启动服务
echo.
pause

