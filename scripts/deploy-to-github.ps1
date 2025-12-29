# GitHub 自动部署脚本
# 使用方法: .\deploy-to-github.ps1 -Username "YOUR_USERNAME" -RepoName "YOUR_REPO_NAME"

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [string]$RepoName,
    
    [Parameter(Mandatory=$false)]
    [string]$Branch = "main",
    
    [Parameter(Mandatory=$false)]
    [switch]$UseSSH = $false
)

Write-Host "🚀 开始 GitHub 自动部署..." -ForegroundColor Green
Write-Host ""

# 检查 Git 是否安装
try {
    $gitVersion = git --version
    Write-Host "✓ Git 已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git 未安装，请先安装 Git" -ForegroundColor Red
    exit 1
}

# 检查是否在 Git 仓库中
if (-not (Test-Path ".git")) {
    Write-Host "✗ 当前目录不是 Git 仓库" -ForegroundColor Red
    exit 1
}

# 检查是否有未提交的更改
$status = git status --porcelain
if ($status) {
    Write-Host "⚠ 检测到未提交的更改，正在添加..." -ForegroundColor Yellow
    git add .
    $commitMessage = Read-Host "请输入提交信息（直接回车使用默认信息）"
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }
    git commit -m $commitMessage
    Write-Host "✓ 更改已提交" -ForegroundColor Green
}

# 设置远程仓库 URL
$remoteUrl = if ($UseSSH) {
    "git@github.com:$Username/$RepoName.git"
} else {
    "https://github.com/$Username/$RepoName.git"
}

Write-Host ""
Write-Host "📦 配置远程仓库..." -ForegroundColor Cyan
Write-Host "   仓库地址: $remoteUrl" -ForegroundColor Gray

# 检查是否已存在远程仓库
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "⚠ 已存在远程仓库: $existingRemote" -ForegroundColor Yellow
    $update = Read-Host "是否更新为新的仓库地址? (y/n)"
    if ($update -eq "y" -or $update -eq "Y") {
        git remote set-url origin $remoteUrl
        Write-Host "✓ 远程仓库地址已更新" -ForegroundColor Green
    } else {
        Write-Host "→ 使用现有远程仓库" -ForegroundColor Gray
        $remoteUrl = $existingRemote
    }
} else {
    git remote add origin $remoteUrl
    Write-Host "✓ 远程仓库已添加" -ForegroundColor Green
}

# 检查当前分支
$currentBranch = git branch --show-current
Write-Host ""
Write-Host "🌿 当前分支: $currentBranch" -ForegroundColor Cyan

# 如果分支名称不匹配，重命名分支
if ($currentBranch -ne $Branch) {
    Write-Host "⚠ 分支名称不匹配，重命名为: $Branch" -ForegroundColor Yellow
    git branch -M $Branch
    $currentBranch = $Branch
}

# 尝试推送
Write-Host ""
Write-Host "📤 正在推送到 GitHub..." -ForegroundColor Cyan
Write-Host "   分支: $currentBranch" -ForegroundColor Gray
Write-Host "   仓库: $remoteUrl" -ForegroundColor Gray
Write-Host ""

try {
    git push -u origin $currentBranch
    Write-Host ""
    Write-Host "✅ 部署成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 仓库地址: https://github.com/$Username/$RepoName" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ 推送失败" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "1. 仓库不存在 - 请先在 GitHub 上创建仓库: https://github.com/new" -ForegroundColor Gray
    Write-Host "2. 认证失败 - 请使用 Personal Access Token 或配置 SSH key" -ForegroundColor Gray
    Write-Host "3. 权限不足 - 确保你有该仓库的写入权限" -ForegroundColor Gray
    Write-Host ""
    Write-Host "手动创建仓库后，运行以下命令:" -ForegroundColor Cyan
    Write-Host "  git push -u origin $currentBranch" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "🎉 完成！" -ForegroundColor Green
