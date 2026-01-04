@echo off
chcp 65001 >nul
echo 📦 安装 DataAgent 语音服务依赖...
echo.

cd /d "%~dp0"

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Python，请先安装 Python 3.10+
    pause
    exit /b 1
)

echo ✅ Python 已安装
echo.

echo 📥 正在安装依赖包（这可能需要几分钟）...
pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ 安装失败
    pause
    exit /b 1
)

echo.
echo ✅ 依赖安装完成！
echo.
echo 📝 下一步：
echo    1. 复制 env.example 到 .env
echo    2. 编辑 .env 文件，填写 API Keys
echo    3. 运行 start.bat 启动服务
echo.

pause


