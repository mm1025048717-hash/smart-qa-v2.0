@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ════════════════════════════════════════
echo   验证 API Key 配置
echo ════════════════════════════════════════
echo.

REM 检查前端配置
if exist ".env.local" (
    echo ✅ 前端配置: .env.local 存在
    findstr "VITE_DEEPSEEK_API_KEY" .env.local >nul
    if errorlevel 1 (
        echo ⚠️  警告: .env.local 中未找到 VITE_DEEPSEEK_API_KEY
    ) else (
        echo ✅ 前端 API Key 已配置
    )
) else (
    echo ❌ 前端配置: .env.local 不存在
    echo    运行: 自动修复API密钥.bat
)

echo.

REM 检查后端配置
if exist "voice-backend\.env" (
    echo ✅ 后端配置: voice-backend/.env 存在
    findstr "DEEPSEEK_API_KEY" voice-backend\.env >nul
    if errorlevel 1 (
        echo ⚠️  警告: voice-backend/.env 中未找到 DEEPSEEK_API_KEY
    ) else (
        echo ✅ 后端 API Key 已配置
    )
) else (
    echo ⚠️  后端配置: voice-backend/.env 不存在（可选）
)

echo.

REM 检查 server.js
findstr "DEEPSEEK_API_KEY" server.js >nul
if errorlevel 1 (
    echo ❌ server.js 中未找到 DEEPSEEK_API_KEY 配置
) else (
    echo ✅ server.js 中已配置 API Key
)

echo.
echo ════════════════════════════════════════
echo   重要提示
echo ════════════════════════════════════════
echo.
echo 如果仍然出现 401 错误:
echo   1. 说明当前 API Key 已失效
echo   2. 请访问: https://platform.deepseek.com/api_keys
echo   3. 获取新的 API Key
echo   4. 运行: 立即修复API密钥.bat
echo.
echo 配置完成后，请重启开发服务器！
echo.
pause

