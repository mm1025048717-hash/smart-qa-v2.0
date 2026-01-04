@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ========================================
echo   启动 DataAgent 语音服务
echo ========================================
echo.
echo 正在启动服务，请稍候...
echo.

REM 检查并关闭可能占用端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8765" ^| findstr "LISTENING"') do (
    echo 发现端口 8765 被进程 %%a 占用，正在关闭...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo 启动语音服务...
python voice_bot.py

pause


