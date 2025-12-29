# GitHub 仓库推送脚本
# 使用方法：在 PowerShell 中运行此脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   GitHub 仓库推送助手" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
$currentDir = Get-Location
$projectDir = "C:\Users\陈宣任\Desktop\smart-qa v1.3"

if ($currentDir.Path -ne $projectDir) {
    Write-Host "切换到项目目录..." -ForegroundColor Yellow
    Set-Location $projectDir
}

# 检查 Git 状态
Write-Host "检查 Git 状态..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "发现未提交的更改，正在添加..." -ForegroundColor Yellow
    git add .
    $commitMsg = Read-Host "请输入提交信息（直接回车使用默认信息）"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "更新代码"
    }
    git commit -m $commitMsg
}

# 检查远程仓库
Write-Host "检查远程仓库配置..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "远程仓库: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "未找到远程仓库配置" -ForegroundColor Red
    exit 1
}

# 尝试推送
Write-Host ""
Write-Host "正在推送到 GitHub..." -ForegroundColor Yellow
Write-Host "如果提示需要认证，请使用 Personal Access Token" -ForegroundColor Cyan
Write-Host ""

$pushResult = git push -u origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 推送成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步操作：" -ForegroundColor Cyan
    Write-Host "1. 访问仓库: https://github.com/mm1025048717-hash/smart-qa-v1.3" -ForegroundColor White
    Write-Host "2. 进入 Settings → Pages" -ForegroundColor White
    Write-Host "3. Source 选择: GitHub Actions" -ForegroundColor White
    Write-Host "4. 等待自动部署完成" -ForegroundColor White
    Write-Host "5. 访问网站: https://mm1025048717-hash.github.io/smart-qa-v1.3/" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ 推送失败！" -ForegroundColor Red
    Write-Host ""
    
    if ($pushResult -match "Repository not found") {
        Write-Host "错误原因: GitHub 上还没有创建这个仓库" -ForegroundColor Red
        Write-Host ""
        Write-Host "解决方案：" -ForegroundColor Yellow
        Write-Host "1. 访问 https://github.com/new 创建仓库" -ForegroundColor White
        Write-Host "2. 仓库名称: smart-qa-v1.3" -ForegroundColor White
        Write-Host "3. 不要勾选任何初始化选项" -ForegroundColor White
        Write-Host "4. 创建完成后，再次运行此脚本" -ForegroundColor White
    } elseif ($pushResult -match "authentication") {
        Write-Host "错误原因: 需要身份认证" -ForegroundColor Red
        Write-Host ""
        Write-Host "解决方案：" -ForegroundColor Yellow
        Write-Host "1. 访问 https://github.com/settings/tokens" -ForegroundColor White
        Write-Host "2. 创建 Personal Access Token (classic)" -ForegroundColor White
        Write-Host "3. 权限选择: repo" -ForegroundColor White
        Write-Host "4. 推送时，用户名输入 GitHub 用户名，密码输入 Token" -ForegroundColor White
    } else {
        Write-Host "错误详情: $pushResult" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

