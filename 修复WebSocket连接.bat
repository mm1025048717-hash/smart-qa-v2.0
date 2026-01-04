@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ════════════════════════════════════════
echo   修复 WebSocket 连接问题
echo ════════════════════════════════════════
echo.

REM 检查并关闭可能占用端口的进程
echo [1/4] 检查端口占用...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8765" ^| findstr "LISTENING"') do (
    echo 发现端口 8765 被进程 %%a 占用，正在关闭...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo.

REM 检查配置
echo [2/4] 检查配置...
cd voice-backend
if not exist ".env" (
    echo ⚠️  .env 文件不存在，正在创建...
    if exist "env.example" (
        copy env.example .env >nul
        echo ✅ 已创建 .env 文件
    )
)

echo.

REM 检查依赖
echo [3/4] 检查依赖...
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

REM 启动服务
echo [4/4] 启动语音服务...
echo.
echo ════════════════════════════════════════
echo   语音服务正在启动...
echo ════════════════════════════════════════
echo.
echo 服务地址: ws://localhost:8765
echo.
echo 💡 提示:
echo   - 等待看到 "WebSocket server ready" 消息
echo   - 然后刷新浏览器页面
echo   - 语音按钮应该可以点击了
echo.
echo 按 Ctrl+C 停止服务
echo.

python voice_bot.py

pause

