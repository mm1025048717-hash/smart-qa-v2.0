@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ========================================
echo   启动 Smart QA 前端应用
echo ========================================
echo.

REM 检查 Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查依赖
if not exist "node_modules" (
    echo 📦 正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)

echo.
echo 🚀 启动开发服务器...
echo    访问地址: http://localhost:5173
echo.
echo 💡 按 Ctrl+C 停止服务器
echo.

REM 等待2秒后自动打开浏览器
start "" "http://localhost:5173" >nul 2>&1
timeout /t 2 /nobreak >nul

REM 启动开发服务器
npm run dev

pause


