@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ════════════════════════════════════════
echo   一键启动语音服务
echo ════════════════════════════════════════
echo.

REM 检查服务是否已运行
netstat -ano | findstr ":8765" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo ✅ 语音服务已在运行
    echo.
    echo 如果按钮仍然无法点击:
    echo   1. 刷新浏览器页面
    echo   2. 检查浏览器控制台是否有错误
    echo   3. 确保已允许麦克风权限
    echo.
    pause
    exit /b 0
)

echo [1/3] 检查配置...
cd voice-backend

if not exist ".env" (
    echo ⚠️  .env 文件不存在，正在创建...
    if exist "env.example" (
        copy env.example .env >nul
        echo ✅ 已创建 .env 文件
    ) else (
        echo ❌ 找不到 env.example 文件
        pause
        exit /b 1
    )
)

echo ✅ 配置文件检查完成
echo.

echo [2/3] 检查依赖...
python -c "import pipecat" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  依赖未安装，正在安装...
    call install.bat
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo ✅ 依赖已安装
)

echo.

echo [3/3] 启动语音服务...
echo.
echo ════════════════════════════════════════
echo   语音服务正在启动...
echo ════════════════════════════════════════
echo.
echo 服务地址: ws://localhost:8765
echo.
echo 💡 提示:
echo   - 服务启动后，刷新浏览器页面
echo   - 点击语音按钮，允许麦克风权限
echo   - 如果按钮仍然无法点击，检查浏览器控制台
echo.
echo 按 Ctrl+C 停止服务
echo.

python voice_bot.py

pause

