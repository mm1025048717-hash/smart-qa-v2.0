@echo off
chcp 65001 >nul
echo 正在停止服务...

for /f "tokens=2" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo 找到进程 %%a，正在结束...
    taskkill /F /PID %%a >nul 2>&1
)

echo ✅ 服务已停止
pause












