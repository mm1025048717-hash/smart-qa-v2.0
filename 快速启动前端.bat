@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ════════════════════════════════════════
echo   快速启动前端服务
echo ════════════════════════════════════════
echo.

REM 检查 Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Node.js，请先安装 Node.js
    echo    下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查端口占用
echo [1/3] 检查端口 5173...
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo ⚠️  端口 5173 已被占用
    echo    正在关闭占用端口的进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo ✅ 已清理端口
) else (
    echo ✅ 端口 5173 可用
)

echo.

REM 检查依赖
echo [2/3] 检查依赖...
if not exist "node_modules" (
    echo 📦 正在安装依赖（首次运行需要几分钟）...
    call npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        echo.
        echo 请尝试:
        echo   1. 检查网络连接
        echo   2. 清除缓存: npm cache clean --force
        echo   3. 删除 node_modules 和 package-lock.json 后重试
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已安装
)

echo.

REM 启动服务
echo [3/3] 启动开发服务器...
echo.
echo ════════════════════════════════════════
echo   🚀 前端服务正在启动...
echo ════════════════════════════════════════
echo.
echo 📱 访问地址: http://localhost:5173
echo.
echo 💡 提示:
echo   - 服务启动后会自动打开浏览器
echo   - 如果浏览器未自动打开，请手动访问: http://localhost:5173
echo   - 按 Ctrl+C 停止服务器
echo.

REM 等待3秒后自动打开浏览器
start "" "http://localhost:5173" >nul 2>&1
timeout /t 3 /nobreak >nul

REM 启动开发服务器
npm run dev

pause

