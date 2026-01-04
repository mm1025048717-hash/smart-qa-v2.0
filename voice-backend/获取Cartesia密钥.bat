@echo off
chcp 65001 >nul
echo ========================================
echo 🎤 获取 Cartesia API Key
echo ========================================
echo.
echo 📝 获取步骤:
echo.
echo    1. 访问: https://play.cartesia.ai/sign-up
echo    2. 注册/登录账号（可以使用 Google/GitHub 账号快速登录）
echo    3. 登录后，在 Dashboard 中找到 API Key
echo    4. 复制 API Key
echo.
echo 💡 免费额度: $10/月（足够使用）
echo.
echo ========================================
echo.
echo 是否要现在打开浏览器？(Y/N)
set /p choice=

if /i "%choice%"=="Y" (
    start https://play.cartesia.ai/sign-up
)

echo.
echo 📝 获取 API Key 后，运行以下命令配置:
echo    python 配置Cartesia密钥.py ^<your_api_key^>
echo.
echo 或者直接编辑 .env 文件，添加:
echo    CARTESIA_API_KEY=your_api_key_here
echo.
pause

