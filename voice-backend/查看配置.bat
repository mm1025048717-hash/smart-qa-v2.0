@echo off
chcp 65001 >nul
echo ========================================
echo 🔍 当前配置状态
echo ========================================
echo.

cd /d "%~dp0"

python 查看配置.py

echo.
pause


