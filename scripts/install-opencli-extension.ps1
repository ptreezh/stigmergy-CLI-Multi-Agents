#Requires -Version 5.1
<#
.SYNOPSIS
    Stigmergy OpenCLI 浏览器扩展安装器
.DESCRIPTION
    自动安装 OpenCLI Browser Bridge 扩展到 Chrome 或 Edge
    复用已登录的浏览器会话，无需重新登录网站
.NOTES
    路径: %USERPROFILE%\.stigmergy\opencli-extension\
#>

$ErrorActionPreference = "Stop"
$ExtensionSource = Join-Path $PSScriptRoot "..\assets\opencli-extension"
$ExtensionDest = Join-Path $env:USERPROFILE ".stigmergy\opencli-extension"

# 优先使用 Stigmergy 内置的预编译扩展
if (Test-Path (Join-Path $ExtensionSource "dist\background.js")) {
    Write-Host "✅ 使用 Stigmergy 内置预编译扩展" -ForegroundColor Green
} else {
    # 否则从 npm 包复制
    $NpmExtension = "$env:APPDATA\npm\node_modules\@jackwener\opencli\extension"
    if (Test-Path $NpmExtension) {
        $ExtensionSource = $NpmExtension
        Write-Host "⚠️  使用 npm 包中的扩展（可能需要编译）" -ForegroundColor Yellow
    }
}

Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Stigmergy OpenCLI 浏览器扩展安装器              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 复制扩展到用户目录
if (-not (Test-Path $ExtensionDest)) {
    Write-Host "📦 正在复制扩展到用户目录..." -ForegroundColor Yellow
    Copy-Item -Path $ExtensionSource -Destination $ExtensionDest -Recurse -Force
    Write-Host "✅ 扩展已复制到: $ExtensionDest" -ForegroundColor Green
    Write-Host ""
}

$ExtensionPath = $ExtensionDest

# 检查扩展是否存在
if (-not (Test-Path $ExtensionPath)) {
    Write-Host "❌ 扩展文件不存在: $ExtensionPath" -ForegroundColor Red
    Write-Host "请先运行: npm install -g @jackwener/opencli" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 扩展文件就绪: $ExtensionPath" -ForegroundColor Green
Write-Host ""

# 检测浏览器
$EdgePath = $null
$ChromePath = $null

# 查找 Edge
$EdgePaths = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
)
foreach ($p in $EdgePaths) {
    if (Test-Path $p) { $EdgePath = $p; break }
}

# 查找 Chrome
$ChromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)
foreach ($p in $ChromePaths) {
    if (Test-Path $p) { $ChromePath = $p; break }
}

if ($null -eq $EdgePath -and $null -eq $ChromePath) {
    Write-Host "❌ 未检测到 Chrome 或 Edge 浏览器" -ForegroundColor Red
    exit 1
}

# 自动选择浏览器（Edge 优先，因为它正在运行）
$BrowserPath = $null
$BrowserName = $null
$BrowserExe = $null

# 检查 Edge 是否在运行
$EdgeRunning = Get-Process -Name "msedge" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($EdgePath -and $EdgeRunning) {
    $BrowserPath = $EdgePath
    $BrowserName = "Edge"
    $BrowserExe = "msedge"
    Write-Host "🔍 检测到 Edge 正在运行，自动选择 Edge" -ForegroundColor Green
} elseif ($EdgePath) {
    $BrowserPath = $EdgePath
    $BrowserName = "Edge"
    $BrowserExe = "msedge"
} elseif ($ChromePath) {
    $BrowserPath = $ChromePath
    $BrowserName = "Chrome"
    $BrowserExe = "chrome"
}

Write-Host ""
Write-Host "🌐 正在启动 $BrowserName 并加载扩展..." -ForegroundColor Yellow
Write-Host ""

$ExtensionsUrl = if ($BrowserName -eq "Edge") { "edge://extensions" } else { "chrome://extensions" }

# 关闭已运行的浏览器（确保 --load-extension 生效）
Write-Host "⚠️  正在关闭所有 $BrowserName 窗口..." -ForegroundColor Yellow
Stop-Process -Name $BrowserExe -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# 启动浏览器并加载扩展
Write-Host "🚀 启动 $BrowserName 并加载 OpenCLI 扩展..." -ForegroundColor Yellow
Start-Process $BrowserPath -ArgumentList @(
    "--load-extension=`"$ExtensionPath`""
    $ExtensionsUrl
)

Write-Host ""
Write-Host "✅ $BrowserName 已启动，扩展正在加载..." -ForegroundColor Green
Write-Host "等待扩展连接..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "扩展已自动加载！请确认以下步骤：" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  在 $BrowserName 扩展页面确认:" -ForegroundColor White
Write-Host "    ✅ OpenCLI Browser Bridge 已启用" -ForegroundColor Green
Write-Host ""
Write-Host "2️⃣  关闭此页面，正常打开浏览器即可" -ForegroundColor White
Write-Host "    （扩展会随浏览器自动启动，自动连接 OpenCLI）" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  验证连接:" -ForegroundColor White
Write-Host "    opencli doctor" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 安装完成后，所有已登录的网站都可以直接通过 CLI 调用！" -ForegroundColor Green
Write-Host "    无需重新登录，扩展自动复用浏览器 Cookie" -ForegroundColor Yellow
Write-Host ""

# 自动验证（非阻塞）
Write-Host "🔍 正在检查 OpenCLI 连接状态..." -ForegroundColor Yellow
try {
    $doctorOutput = opencli doctor 2>&1
    $doctorOutput | ForEach-Object { Write-Host "  $_" }
    
    if ($doctorOutput -match "\[OK\].*Extension.*connected") {
        Write-Host ""
        Write-Host "✅ 扩展已连接！所有网站命令现在可用！" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  扩展尚未连接，可能需要几秒。请稍后运行:" -ForegroundColor Yellow
        Write-Host "  stigmergy opencli --doctor" -ForegroundColor Cyan
    }
} catch {
    Write-Host "  $_.Exception.Message" -ForegroundColor Yellow
}
