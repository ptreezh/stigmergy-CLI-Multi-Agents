# Stigmergy CLI PowerShell 发布脚本

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Stigmergy CLI v1.3.77-beta.0 发布脚本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 检查是否已登录npm
Write-Host "检查npm登录状态..." -ForegroundColor Yellow
$loginStatus = npm whoami 2>$null
if (-not $loginStatus) {
    Write-Host "❌ 未登录npm，请先运行: npm login" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ 已登录为: $loginStatus" -ForegroundColor Green
}

# 检查package.json版本
$packageJson = Get-Content -Path "./package.json" -Raw | ConvertFrom-Json
$packageVersion = $packageJson.version
Write-Host "📦 准备发布的版本: $packageVersion" -ForegroundColor Yellow

if ($packageVersion -ne "1.3.77-beta.0") {
    Write-Host "❌ 版本不匹配，期望 1.3.77-beta.0，实际 $packageVersion" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "包含以下更新：" -ForegroundColor Green
Write-Host "- 增强 resumesession 技能功能" -ForegroundColor White
Write-Host "  - 实现智能累积机制，当会话内容不足时自动追加更多会话" -ForegroundColor White
Write-Host "  - 只显示用户输入、模型输出和时间戳信息，去除冗余格式" -ForegroundColor White
Write-Host "  - 添加内容过滤功能，剔除无意义内容（如API超限提示）" -ForegroundColor White
Write-Host "  - 按日期分组显示，标注每组的起始和结束时间" -ForegroundColor White
Write-Host "  - 当没有会话时返回`"无`"" -ForegroundColor White

Write-Host ""
$confirmation = Read-Host "确定要发布吗? (y/N)"

if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host "📤 开始发布..." -ForegroundColor Yellow
    npm publish --tag beta
    $publishStatus = $LASTEXITCODE
    
    if ($publishStatus -eq 0) {
        Write-Host "✅ 发布成功!" -ForegroundColor Green
        Write-Host ""
        Write-Host "接下来的步骤：" -ForegroundColor Cyan
        Write-Host "1. git add ." -ForegroundColor White
        Write-Host "2. git commit -m `"feat: 发布 v1.3.77-beta.0 包含 resumesession 增强功能`"" -ForegroundColor White
        Write-Host "3. git tag -a v1.3.77-beta.0 -m `"v1.3.77-beta.0: resumesession 增强功能`"" -ForegroundColor White
        Write-Host "4. git push origin main" -ForegroundColor White
        Write-Host "5. git push origin v1.3.77-beta.0" -ForegroundColor White
    } else {
        Write-Host "❌ 发布失败，状态码: $publishStatus" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "发布已取消" -ForegroundColor Yellow
    exit 0
}