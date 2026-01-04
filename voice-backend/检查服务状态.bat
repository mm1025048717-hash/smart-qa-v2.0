@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ========================================
echo   检查语音服务状态
echo ========================================
echo.

netstat -ano | findstr ":8765" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ✅ 服务运行正常！
    echo     WebSocket 服务器正在监听端口 8765
    echo     连接地址: ws://localhost:8765
    echo.
    netstat -ano | findstr ":8765" | findstr "LISTENING"
) else (
    echo ❌ 服务未运行
    echo     端口 8765 未被占用
    echo.
    echo 请运行 "启动服务.bat" 启动服务
)

echo.
pause

