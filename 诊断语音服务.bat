@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ════════════════════════════════════════
echo   诊断语音服务问题
echo ════════════════════════════════════════
echo.

REM 检查端口 8765
echo [1/4] 检查语音服务端口...
netstat -ano | findstr ":8765" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo ❌ 端口 8765 未监听 - 语音服务未启动
    set SERVICE_RUNNING=0
) else (
    echo ✅ 端口 8765 正在监听 - 语音服务运行中
    set SERVICE_RUNNING=1
)

echo.

REM 检查 Python
echo [2/4] 检查 Python 环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 未安装或不在 PATH 中
    set PYTHON_OK=0
) else (
    python --version
    echo ✅ Python 已安装
    set PYTHON_OK=1
)

echo.

REM 检查依赖
echo [3/4] 检查 Python 依赖...
cd voice-backend
python -c "import pipecat" >nul 2>&1
if errorlevel 1 (
    echo ❌ pipecat 未安装
    set DEPS_OK=0
) else (
    echo ✅ pipecat 已安装
    set DEPS_OK=1
)

cd ..

echo.

REM 检查配置文件
echo [4/4] 检查配置文件...
if exist "voice-backend\.env" (
    echo ✅ voice-backend/.env 存在
    findstr "DEEPSEEK_API_KEY" voice-backend\.env | findstr /V "your_" >nul
    if errorlevel 1 (
        echo ⚠️  DeepSeek API Key 未配置
    ) else (
        echo ✅ DeepSeek API Key 已配置
    )
) else (
    echo ❌ voice-backend/.env 不存在
)

echo.
echo ════════════════════════════════════════
echo   诊断结果
echo ════════════════════════════════════════
echo.

if %SERVICE_RUNNING%==0 (
    echo ❌ 问题: 语音服务未启动
    echo.
    echo 解决方案:
    echo   运行: voice-backend\启动服务.bat
    echo   或: voice-backend\start.bat
    echo.
) else (
    echo ✅ 语音服务运行正常
    echo.
    echo 如果按钮仍然无法点击，可能是:
    echo   1. 浏览器权限问题（需要允许麦克风权限）
    echo   2. WebSocket 连接问题（检查浏览器控制台）
    echo.
)

if %PYTHON_OK%==0 (
    echo ❌ 问题: Python 未安装
    echo   请先安装 Python 3.10+
    echo.
)

if %DEPS_OK%==0 (
    echo ❌ 问题: 依赖未安装
    echo   运行: voice-backend\install.bat
    echo.
)

echo.
pause

