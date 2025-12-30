# 部署到目标服务器 http://47.94.146.148:8888/
# 运行: .\scripts\部署到服务器.ps1

param(
    [string]$ServerHost = "47.94.146.148",
    [int]$ServerPort = 8888,
    [string]$ServerUser = "",
    [string]$DeployPath = "/var/www/smart-qa"
)

Write-Host "🚀 Smart QA - 部署到服务器" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

# 检查 Node.js
Write-Host "📦 步骤 1/6: 检查环境..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "   ✓ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "   ✓ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

# 安装依赖
Write-Host ""
Write-Host "📥 步骤 2/6: 安装依赖..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "   ⚠️  node_modules 已存在，跳过安装" -ForegroundColor Yellow
    Write-Host "   如需重新安装，请删除 node_modules 目录后重试" -ForegroundColor Gray
} else {
    Write-Host "   正在安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✓ 依赖安装完成" -ForegroundColor Green
}

# 构建项目
Write-Host ""
Write-Host "🔨 步骤 3/6: 构建项目..." -ForegroundColor Cyan
Write-Host "   正在构建..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ 构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ 构建完成" -ForegroundColor Green

# 检查 dist 目录
Write-Host ""
Write-Host "📁 步骤 4/6: 检查构建结果..." -ForegroundColor Cyan
if (-not (Test-Path "dist")) {
    Write-Host "   ❌ dist 目录不存在，构建可能失败" -ForegroundColor Red
    exit 1
}
$distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   ✓ dist 目录大小: $([math]::Round($distSize, 2)) MB" -ForegroundColor Green

# 部署选项
Write-Host ""
Write-Host "🚀 步骤 5/6: 选择部署方式..." -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. 本地启动服务器 (http://localhost:8888)" -ForegroundColor White
Write-Host "   2. 使用 Node.js server.js 启动" -ForegroundColor White
Write-Host "   3. 使用 Docker 部署" -ForegroundColor White
Write-Host "   4. 手动部署到服务器 (需要 SSH 访问)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "   请选择 (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🌐 启动本地服务器..." -ForegroundColor Cyan
        Write-Host "   访问地址: http://localhost:8888" -ForegroundColor Green
        Write-Host "   按 Ctrl+C 停止服务器" -ForegroundColor Yellow
        Write-Host ""
        node server.js
    }
    "2" {
        Write-Host ""
        Write-Host "🌐 使用 Node.js 启动服务器..." -ForegroundColor Cyan
        Write-Host "   访问地址: http://localhost:8888" -ForegroundColor Green
        Write-Host "   按 Ctrl+C 停止服务器" -ForegroundColor Yellow
        Write-Host ""
        $env:PORT = "8888"
        node server.js
    }
    "3" {
        Write-Host ""
        Write-Host "🐳 使用 Docker 部署..." -ForegroundColor Cyan
        
        # 检查 Docker
        try {
            docker --version | Out-Null
            Write-Host "   ✓ Docker 已安装" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ 未找到 Docker，请先安装 Docker" -ForegroundColor Red
            exit 1
        }
        
        # 修改 docker-compose.yml 端口
        $dockerComposePath = "docker\docker-compose.yml"
        if (Test-Path $dockerComposePath) {
            $content = Get-Content $dockerComposePath -Raw
            $content = $content -replace '(\s+-\s+")80:80"', "`$1`"${ServerPort}:80`""
            Set-Content -Path $dockerComposePath -Value $content
            Write-Host "   ✓ 已更新 docker-compose.yml 端口为 $ServerPort" -ForegroundColor Green
        }
        
        Write-Host "   正在构建 Docker 镜像..." -ForegroundColor Yellow
        Set-Location docker
        docker-compose build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ❌ Docker 构建失败" -ForegroundColor Red
            Set-Location ..
            exit 1
        }
        
        Write-Host "   正在启动容器..." -ForegroundColor Yellow
        docker-compose up -d
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ❌ Docker 启动失败" -ForegroundColor Red
            Set-Location ..
            exit 1
        }
        
        Set-Location ..
        Write-Host ""
        Write-Host "   ✅ Docker 部署完成！" -ForegroundColor Green
        Write-Host "   访问地址: http://$ServerHost`:$ServerPort" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   查看日志: docker-compose -f docker/docker-compose.yml logs -f" -ForegroundColor Yellow
        Write-Host "   停止服务: docker-compose -f docker/docker-compose.yml down" -ForegroundColor Yellow
    }
    "4" {
        Write-Host ""
        Write-Host "📤 手动部署到服务器..." -ForegroundColor Cyan
        
        if (-not $ServerUser) {
            $ServerUser = Read-Host "   请输入服务器用户名 (例如: root)"
        }
        
        Write-Host ""
        Write-Host "   部署信息:" -ForegroundColor Yellow
        Write-Host "   服务器: $ServerUser@$ServerHost" -ForegroundColor White
        Write-Host "   端口: $ServerPort" -ForegroundColor White
        Write-Host "   部署路径: $DeployPath" -ForegroundColor White
        Write-Host ""
        
        $confirm = Read-Host "   确认部署? (y/n)"
        if ($confirm -ne "y" -and $confirm -ne "Y") {
            Write-Host "   已取消部署" -ForegroundColor Yellow
            exit 0
        }
        
        Write-Host ""
        Write-Host "   正在打包 dist 目录..." -ForegroundColor Yellow
        $timestamp = Get-Date -Format "yyyyMMddHHmmss"
        $zipFile = "dist-$timestamp.zip"
        Compress-Archive -Path "dist\*" -DestinationPath $zipFile -Force
        Write-Host "   ✓ 打包完成: $zipFile" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "   正在上传到服务器..." -ForegroundColor Yellow
        Write-Host "   请手动执行以下命令:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   scp $zipFile $ServerUser@$ServerHost`:/tmp/" -ForegroundColor White
        Write-Host "   ssh $ServerUser@$ServerHost `"mkdir -p $DeployPath && cd $DeployPath && unzip -o /tmp/$zipFile && rm /tmp/$zipFile`"" -ForegroundColor White
        Write-Host ""
        Write-Host "   或者使用以下命令启动 Node.js 服务器:" -ForegroundColor Cyan
        Write-Host "   ssh $ServerUser@$ServerHost `"cd $DeployPath && PORT=$ServerPort node server.js`"" -ForegroundColor White
    }
    default {
        Write-Host "   ❌ 无效的选择" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host ""

