@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ════════════════════════════════════════
echo   修复 DeepSeek API Key (401错误)
echo ════════════════════════════════════════
echo.
echo 问题: API Key 无效，导致 401 认证失败
echo.
echo ⚠️  需要有效的 DeepSeek API Key
echo.
echo 获取方式:
echo   访问: https://platform.deepseek.com/api_keys
echo   登录后创建新的 API Key
echo.
echo ════════════════════════════════════════
echo.
set /p api_key="请输入你的 DeepSeek API Key: "

if "%api_key%"=="" (
    echo.
    echo ❌ 错误: API Key 不能为空
    pause
    exit /b 1
)

if not "%api_key:~0,3%"=="sk-" (
    echo.
    echo ❌ 错误: API Key 格式不正确
    echo    应该以 'sk-' 开头
    pause
    exit /b 1
)

echo.
echo 正在更新 server.js...

REM 使用 PowerShell 进行替换
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$file = 'server.js'; ^
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8); ^
$pattern = '(const DEEPSEEK_API_KEY = process\.env\.DEEPSEEK_API_KEY \|\| )''[^'']*'''; ^
$replacement = '$1'''%api_key%''' ; ^
$newContent = $content -replace $pattern, $replacement; ^
[System.IO.File]::WriteAllText($file, $newContent, [System.Text.Encoding]::UTF8)"

if errorlevel 1 (
    echo.
    echo ❌ 更新失败
    echo.
    echo 请手动编辑 server.js 文件:
    echo   找到第 18 行，将 'sk-b1551c8a25d042a7ae8b0166820249a8'
    echo   替换为你的 API Key: %api_key%
    pause
    exit /b 1
)

echo.
echo ✅ 成功更新 server.js
echo    新 Key: %api_key:~0,20%...
echo.
echo ════════════════════════════════════════
echo   重要: 请重启服务器！
echo ════════════════════════════════════════
echo.
echo 如果服务器正在运行:
echo   1. 找到运行服务器的命令行窗口
echo   2. 按 Ctrl+C 停止服务器
echo   3. 重新运行启动命令 (npm run dev 或 node server.js)
echo.
pause

