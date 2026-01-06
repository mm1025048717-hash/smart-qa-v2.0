@echo off
chcp 65001 >nul
echo 🚀 启动 DataAgent 语音服务...
echo.

cd /d "%~dp0"

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Python，请先安装 Python 3.10+
    pause
    exit /b 1
)

REM 检查是否已安装依赖
python -c "import pipecat" >nul 2>&1
if errorlevel 1 (
    echo 📦 正在安装依赖...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)

REM 检查 .env 文件
if not exist .env (
    echo ⚠️  警告: 未找到 .env 文件
    echo 📝 请复制 env.example 到 .env 并填写 API Keys
    if exist env.example (
        copy env.example .env
        echo ✅ 已创建 .env 文件，请编辑并填写 API Keys
    )
    pause
)

REM 获取 agent_id 参数（默认为 alisa）
set AGENT_ID=alisa
if not "%1"=="" set AGENT_ID=%1

echo 🎤 启动语音服务 (Agent: %AGENT_ID%)...
echo.

python voice_bot.py %AGENT_ID%

pause



