# 一键部署到 GitHub
# 运行: .\一键部署.ps1

Write-Host "🚀 智能数据问答界面 - GitHub 一键部署" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

# 1. 检查并提交所有更改
Write-Host "📝 步骤 1/4: 检查代码更改..." -ForegroundColor Cyan
$status = git status --porcelain
if ($status) {
    Write-Host "   发现未提交的更改，正在提交..." -ForegroundColor Yellow
    git add .
    git commit -m "Auto commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host "   ✓ 已提交" -ForegroundColor Green
} else {
    Write-Host "   ✓ 没有未提交的更改" -ForegroundColor Green
}

# 2. 重命名分支为 main
Write-Host ""
Write-Host "🌿 步骤 2/4: 检查分支..." -ForegroundColor Cyan
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "   重命名分支: $currentBranch -> main" -ForegroundColor Yellow
    git branch -M main
    Write-Host "   ✓ 分支已重命名" -ForegroundColor Green
} else {
    Write-Host "   ✓ 分支名称正确" -ForegroundColor Green
}

# 3. 获取用户信息
Write-Host ""
Write-Host "👤 步骤 3/4: 配置 GitHub 信息..." -ForegroundColor Cyan
$username = Read-Host "   请输入你的 GitHub 用户名"
if (-not $username) {
    Write-Host "   ❌ 用户名不能为空" -ForegroundColor Red
    exit 1
}

$repoName = Read-Host "   请输入仓库名 (直接回车使用: smart-qa-v1.3)"
if (-not $repoName) {
    $repoName = "smart-qa-v1.3"
}

# 4. 配置远程仓库
Write-Host ""
Write-Host "📦 步骤 4/4: 配置远程仓库..." -ForegroundColor Cyan
$remoteUrl = "https://github.com/$username/$repoName.git"

$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "   ⚠ 已存在远程仓库: $existingRemote" -ForegroundColor Yellow
    $update = Read-Host "   是否更新? (y/n)"
    if ($update -eq "y" -or $update -eq "Y") {
        git remote set-url origin $remoteUrl
        Write-Host "   ✓ 远程仓库已更新" -ForegroundColor Green
    }
} else {
    git remote add origin $remoteUrl
    Write-Host "   ✓ 远程仓库已添加: $remoteUrl" -ForegroundColor Green
}

# 5. 提示创建仓库
Write-Host ""
Write-Host "⚠ 重要提示:" -ForegroundColor Yellow
Write-Host "   请先在 GitHub 上创建仓库（如果还没有）:" -ForegroundColor White
Write-Host "   1. 访问: https://github.com/new" -ForegroundColor Cyan
Write-Host "   2. 仓库名: $repoName" -ForegroundColor White
Write-Host "   3. 描述: 智能数据问答界面 - 动态分析叙事系统" -ForegroundColor White
Write-Host "   4. 不要勾选 'Initialize with README'" -ForegroundColor White
Write-Host "   5. 点击 'Create repository'" -ForegroundColor White
Write-Host ""

$ready = Read-Host "   仓库已创建完成? (y/n)"
if ($ready -ne "y" -and $ready -ne "Y") {
    Write-Host ""
    Write-Host "   请先创建仓库，然后重新运行此脚本" -ForegroundColor Yellow
    exit 0
}

# 6. 推送代码
Write-Host ""
Write-Host "📤 正在推送到 GitHub..." -ForegroundColor Cyan
Write-Host ""

try {
    git push -u origin main
    Write-Host ""
    Write-Host "✅ 部署成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 仓库地址: https://github.com/$username/$repoName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 完成！你的代码已经成功部署到 GitHub！" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ 推送失败" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "1. 仓库不存在或名称错误" -ForegroundColor Gray
    Write-Host "2. 认证失败 - 请使用 Personal Access Token" -ForegroundColor Gray
    Write-Host "3. 网络问题" -ForegroundColor Gray
    Write-Host ""
    Write-Host "手动推送命令:" -ForegroundColor Cyan
    Write-Host "  git push -u origin main" -ForegroundColor White
    Write-Host ""
}
