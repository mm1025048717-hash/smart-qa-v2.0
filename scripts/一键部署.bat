@echo off
chcp 65001 >nul
echo ========================================
echo    Smart QA 一键部署脚本
echo ========================================
echo.

cd /d "%~dp0\.."

echo [1/3] 检查Docker是否安装...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未检测到Docker，请先安装Docker Desktop
    echo 下载地址：https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✅ Docker已安装
echo.

echo [2/3] 停止并删除旧容器（如果存在）...
docker-compose -f docker/docker-compose.yml down 2>nul
echo ✅ 清理完成
echo.

echo [3/3] 构建并启动服务...
echo 这可能需要几分钟，请耐心等待...
docker-compose -f docker/docker-compose.yml up -d --build

if errorlevel 1 (
    echo.
    echo ❌ 部署失败！请检查错误信息
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ 部署成功！
echo ========================================
echo.
echo 📱 访问地址：
echo    本地访问：http://localhost
echo    局域网访问：http://你的服务器IP
echo    公网访问：http://你的公网IP
echo.
echo 💡 提示：
echo    - 端口80是HTTP默认端口，访问时不需要加:80
echo    - 如果80端口被占用，请修改docker/docker-compose.yml中的端口号
echo    - 查看日志：docker-compose -f docker/docker-compose.yml logs -f
echo    - 停止服务：docker-compose -f docker/docker-compose.yml down
echo.
pause












