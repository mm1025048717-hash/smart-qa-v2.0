@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ════════════════════════════════════════
echo   修复前端 DeepSeek API Key (401错误)
echo ════════════════════════════════════════
echo.
echo 问题: 前端直接调用 API 时缺少 API Key
echo.
echo 解决方案有两种:
echo.
echo 方案 1: 配置前端环境变量 (推荐用于开发)
echo   前端会直接调用 API，需要配置 VITE_DEEPSEEK_API_KEY
echo.
echo 方案 2: 使用 server.js 代理 (推荐用于生产)
echo   前端通过 /api/deepseek 代理，使用 server.js 中的 API Key
echo   需要确保 server.js 中的 API Key 有效
echo.
echo ════════════════════════════════════════
echo.
set /p choice="请选择方案 (1=前端环境变量, 2=使用代理, 默认2): "
if "%choice%"=="" set choice=2

if "%choice%"=="1" (
    echo.
    echo 方案 1: 配置前端环境变量
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
    echo 正在创建 .env.local 文件...
    
    REM 创建 .env.local 文件
    (
        echo # 前端环境变量配置
        echo # DeepSeek API Key (用于前端直接调用)
        echo VITE_DEEPSEEK_API_KEY=%api_key%
    ) > .env.local
    
    echo.
    echo ✅ 已创建 .env.local 文件
    echo    新 Key: %api_key:~0,20%...
    echo.
    echo 💡 提示: 请重启开发服务器 (npm run dev)
    echo.
    goto :end
)

if "%choice%"=="2" (
    echo.
    echo 方案 2: 使用 server.js 代理
    echo.
    echo 前端会通过 /api/deepseek 代理调用 API
    echo 代理会使用 server.js 中的 API Key
    echo.
    echo 请确保 server.js 中的 API Key 已正确配置
    echo 如果没有，请先运行: 立即修复API密钥.bat
    echo.
    echo 正在删除 .env.local 文件 (如果存在)...
    if exist .env.local del .env.local
    echo.
    echo ✅ 已切换到代理模式
    echo.
    echo 💡 提示: 
    echo    1. 确保 server.js 中的 API Key 有效
    echo    2. 重启开发服务器 (npm run dev)
    echo.
    goto :end
)

echo ❌ 无效的选择
pause
exit /b 1

:end
pause

