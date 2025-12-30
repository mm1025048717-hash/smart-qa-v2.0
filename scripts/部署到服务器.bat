@echo off
chcp 65001 >nul
echo ========================================
echo    Smart QA - 部署到服务器
echo    目标: http://47.94.146.148:8888/
echo ========================================
echo.

cd /d "%~dp0\.."

echo [1/5] 检查环境...
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
node --version
npm --version
echo ✅ 环境检查完成
echo.

echo [2/5] 安装依赖...
if not exist "node_modules" (
    echo 正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo ⚠️  node_modules 已存在，跳过安装
)
echo.

echo [3/5] 构建项目...
call npm run build
if errorlevel 1 (
    echo ❌ 构建失败
    pause
    exit /b 1
)
echo ✅ 构建完成
echo.

echo [4/5] 检查构建结果...
if not exist "dist" (
    echo ❌ dist 目录不存在
    pause
    exit /b 1
)
echo ✅ dist 目录存在
echo.

echo [5/5] 启动服务器...
echo.
echo 📱 访问地址：
echo    本地：http://localhost:8888
echo    外部：http://47.94.146.148:8888
echo.
echo 💡 按 Ctrl+C 停止服务器
echo.

set PORT=8888
node server.js

pause

