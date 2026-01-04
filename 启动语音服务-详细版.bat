@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ════════════════════════════════════════
echo   启动语音服务 - 详细诊断版
echo ════════════════════════════════════════
echo.

REM 检查并关闭可能占用端口的进程
echo [1/5] 检查端口占用...
netstat -ano | findstr ":8765" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo ⚠️  端口 8765 已被占用，正在关闭...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8765" ^| findstr "LISTENING"') do (
        echo    关闭进程 PID: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo ✅ 端口已释放
) else (
    echo ✅ 端口 8765 可用
)

echo.

REM 检查 Python
echo [2/5] 检查 Python 环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 未安装或不在 PATH 中
    echo.
    echo 请先安装 Python 3.10+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
) else (
    python --version
    echo ✅ Python 已安装
)

echo.

REM 检查依赖
echo [3/5] 检查 Python 依赖...
cd voice-backend
python -c "import pipecat" >nul 2>&1
if errorlevel 1 (
    echo ❌ pipecat 未安装
    echo.
    echo 正在安装依赖...
    call install.bat
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        echo.
        echo 请手动运行: voice-backend\install.bat
        pause
        exit /b 1
    )
) else (
    echo ✅ pipecat 已安装
)

echo.

REM 检查配置文件
echo [4/5] 检查配置文件...
if not exist ".env" (
    echo ⚠️  .env 文件不存在
    if exist "env.example" (
        echo    正在从 env.example 创建 .env 文件...
        copy env.example .env >nul
        echo ✅ 已创建 .env 文件
        echo.
        echo ⚠️  重要: 请编辑 .env 文件，填写 API Keys
        echo    必需的 API Keys:
        echo      - DEEPSEEK_API_KEY (用于 LLM)
        echo      - DEEPGRAM_API_KEY (用于语音转文字 STT)
        echo.
        echo    运行: 查看配置.bat 查看当前配置
        echo.
        pause
    ) else (
        echo ❌ 找不到 env.example 文件
        pause
        exit /b 1
    )
) else (
    echo ✅ .env 文件存在
    REM 检查 API Keys
    findstr "DEEPSEEK_API_KEY" .env | findstr /V "your_" | findstr /V "^#" >nul
    if errorlevel 1 (
        echo ⚠️  DeepSeek API Key 未配置或使用默认值
    ) else (
        echo ✅ DeepSeek API Key 已配置
    )
    findstr "DEEPGRAM_API_KEY" .env | findstr /V "your_" | findstr /V "^#" >nul
    if errorlevel 1 (
        echo ⚠️  Deepgram API Key 未配置或使用默认值
        echo    需要 Deepgram API Key 才能使用语音转文字功能
    ) else (
        echo ✅ Deepgram API Key 已配置
    )
)

echo.

REM 启动服务
echo [5/5] 启动语音服务...
echo.
echo ════════════════════════════════════════
echo   正在启动语音服务...
echo ════════════════════════════════════════
echo.
echo 📍 服务地址: ws://localhost:8765
echo.
echo 💡 提示:
echo   - 首次启动需要下载模型，可能需要 20-30 秒
echo   - 看到 "WebSocket server ready" 表示启动成功
echo   - 如果出现错误，请查看下方的错误信息
echo   - 按 Ctrl+C 停止服务
echo.
echo ════════════════════════════════════════
echo.

REM 运行 Python 脚本，显示所有输出
python voice_bot.py

REM 如果脚本退出，显示错误信息
if errorlevel 1 (
    echo.
    echo ════════════════════════════════════════
    echo   ❌ 服务启动失败
    echo ════════════════════════════════════════
    echo.
    echo 可能的原因:
    echo   1. API Key 配置错误
    echo   2. 依赖未正确安装
    echo   3. 端口被占用
    echo   4. Python 环境问题
    echo.
    echo 请检查上方的错误信息，或运行: 诊断语音服务.bat
    echo.
)

pause

