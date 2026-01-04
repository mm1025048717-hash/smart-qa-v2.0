@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ========================================
echo   一键启动 Smart QA 完整服务
echo ========================================
echo.

REM 检查语音服务是否运行
netstat -ano | findstr ":8765" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [1/2] 启动语音服务...
    start "" /MIN cmd /c "cd voice-backend && 启动服务.bat"
    timeout /t 3 /nobreak >nul
) else (
    echo [1/2] ✅ 语音服务已运行
)

echo.
echo [2/2] 启动前端应用...
echo.

REM 启动前端（新窗口）
start "" cmd /k "npm run dev"

REM 等待服务启动
timeout /t 5 /nobreak >nul

REM 打开浏览器
start "" "http://localhost:5173"

echo.
echo ========================================
echo   ✅ 服务已启动
echo ========================================
echo.
echo 📱 前端应用: http://localhost:5173
echo 🎤 语音服务: ws://localhost:8765
echo.
echo 💡 前端和语音服务窗口已打开
echo    关闭窗口即可停止服务
echo.
pause

