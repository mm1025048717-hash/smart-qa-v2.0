@echo off
chcp 65001 >nul
echo ========================================
echo    Smart QA 完整部署脚本
echo ========================================
echo.

cd /d "%~dp0\.."

echo [1/4] 检查dist目录...
if not exist "dist" (
    echo ⚠️  dist目录不存在，开始构建...
    call npm run build
    if errorlevel 1 (
        echo ❌ 构建失败，尝试跳过类型检查...
        call npx vite build
        if errorlevel 1 (
            echo ❌ 构建失败，请检查错误信息
            pause
            exit /b 1
        )
    )
) else (
    echo ✅ dist目录已存在
)
echo.

echo [2/4] 停止旧服务...
for /f "tokens=2" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo ✅ 旧服务已停止
echo.

echo [3/4] 添加防火墙规则...
netsh advfirewall firewall delete rule name="Smart QA Web Server" >nul 2>&1
netsh advfirewall firewall add rule name="Smart QA Web Server" dir=in action=allow protocol=TCP localport=8080 >nul 2>&1
echo ✅ 防火墙规则已添加
echo.

echo [4/4] 启动服务...
start /B npx --yes http-server dist -p 8080 -a 0.0.0.0 --cors
timeout /t 3 /nobreak >nul

netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo ❌ 服务启动失败
    pause
    exit /b 1
)

echo ✅ 服务已启动
echo.
echo ========================================
echo   ✅ 部署完成！
echo ========================================
echo.
echo 📱 访问地址：
echo    本地：http://localhost:8080
echo    局域网：http://192.200.238.15:8080
echo.
echo 💡 设置开机自启动：
echo    运行"安装开机自启.bat"（需要管理员权限）
echo.
pause

