@echo off
chcp 65001 >nul
echo ========================================
echo 腾讯云 DeepSeek API 配置助手
echo ========================================
echo.

set /p API_KEY="请输入您的腾讯云 DeepSeek API Key: "

if "%API_KEY%"=="" (
    echo ❌ API Key 不能为空！
    pause
    exit /b 1
)

echo.
echo 📋 正在配置腾讯云 DeepSeek API...
echo.

REM 检查 .env 文件是否存在
if not exist ".env" (
    echo 📝 创建 .env 文件...
    (
        echo # 腾讯云 DeepSeek API 配置
        echo VITE_DEEPSEEK_API_KEY=%API_KEY%
        echo VITE_DEEPSEEK_BASE_URL=https://api.lkeap.cloud.tencent.com/v1
        echo VITE_DEEPSEEK_ENABLE_SEARCH=true
    ) > .env
    echo ✅ .env 文件已创建
) else (
    echo 📝 更新 .env 文件...
    
    REM 使用 PowerShell 更新 .env 文件
    powershell -Command ^
        "$content = Get-Content .env -Raw; " ^
        "$content = $content -replace 'VITE_DEEPSEEK_API_KEY=.*', 'VITE_DEEPSEEK_API_KEY=%API_KEY%'; " ^
        "$content = $content -replace 'VITE_DEEPSEEK_BASE_URL=.*', 'VITE_DEEPSEEK_BASE_URL=https://api.lkeap.cloud.tencent.com/v1'; " ^
        "$content = $content -replace 'VITE_DEEPSEEK_ENABLE_SEARCH=.*', 'VITE_DEEPSEEK_ENABLE_SEARCH=true'; " ^
        "if ($content -notmatch 'VITE_DEEPSEEK_API_KEY') { $content += \"`nVITE_DEEPSEEK_API_KEY=%API_KEY%`n\" }; " ^
        "if ($content -notmatch 'VITE_DEEPSEEK_BASE_URL') { $content += \"`nVITE_DEEPSEEK_BASE_URL=https://api.lkeap.cloud.tencent.com/v1`n\" }; " ^
        "if ($content -notmatch 'VITE_DEEPSEEK_ENABLE_SEARCH') { $content += \"`nVITE_DEEPSEEK_ENABLE_SEARCH=true`n\" }; " ^
        "Set-Content .env -Value $content -NoNewline"
    
    echo ✅ .env 文件已更新
)

echo.
echo ========================================
echo ✅ 配置完成！
echo ========================================
echo.
echo 📋 配置信息:
echo    API Key: %API_KEY:~0,10%...
echo    Base URL: https://api.lkeap.cloud.tencent.com/v1
echo    联网搜索: 已启用
echo.
echo ⚠️  下一步:
echo    1. 需要修改代码以支持 search_enabled 参数
echo    2. 重启开发服务器
echo    3. 测试联网搜索功能
echo.
echo 💡 提示:
echo    - 查看 "腾讯云DeepSeek API配置指南.md" 了解详细配置步骤
echo    - 需要修改 src/services/deepseekApi.ts 文件以启用联网搜索
echo.
pause

