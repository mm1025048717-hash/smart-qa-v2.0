# PowerShell 启动脚本
Write-Host "🚀 启动 DataAgent 语音服务..." -ForegroundColor Green
Write-Host ""

# 检查 Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到 Python，请先安装 Python 3.10+" -ForegroundColor Red
    exit 1
}

# 检查是否已安装依赖
try {
    python -c "import pipecat" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📦 正在安装依赖..." -ForegroundColor Yellow
        pip install -r requirements.txt
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ 依赖安装失败" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "📦 正在安装依赖..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# 检查 .env 文件
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  警告: 未找到 .env 文件" -ForegroundColor Yellow
    Write-Host "📝 请复制 env.example 到 .env 并填写 API Keys" -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ 已创建 .env 文件，请编辑并填写 API Keys" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "按任意键继续..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# 获取 agent_id 参数（默认为 alisa）
$agentId = "alisa"
if ($args.Count -gt 0) {
    $agentId = $args[0]
}

Write-Host "🎤 启动语音服务 (Agent: $agentId)..." -ForegroundColor Green
Write-Host ""

# 运行服务
python voice_bot.py $agentId



