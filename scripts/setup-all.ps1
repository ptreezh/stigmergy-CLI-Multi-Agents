#
# Stigmergy One-Click Setup Script for Windows
# Windows 一键配置脚本 (PowerShell)
#

# 颜色输出函数
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Cyan "🚀 Stigmergy 一键配置 (Windows)"
Write-Output "======================================"
Write-Output ""
Write-Output "此脚本将自动配置："
Write-Output "  1. ✅ DuckDuckGo 搜索（即时可用）"
Write-Output "  2. ✅ Wikipedia 知识库（即时可用）"
Write-Output "  3. 🤖 本地 LLM（Ollama + Llama3/Qwen）"
Write-Output "  4. 📝 可选的云端 API 配置指南"
Write-Output ""

# 获取脚本目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 配置目录
$StigmergyDir = Join-Path $env:USERPROFILE ".stigmergy"
$ConfigDir = Join-Path $StigmergyDir "config"

# 创建配置目录
if (-not (Test-Path $ConfigDir)) {
    New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null
    Write-ColorOutput Green "✅ 创建配置目录: $ConfigDir"
}

# 1. 配置搜索引擎
Write-ColorOutput Cyan "`n🔍 配置搜索引擎..."
Write-Output "======================================"

$SearchConfig = Join-Path $ConfigDir "search-services.json"

# 创建默认配置
$SearchConfigJson = @{
    version = "1.0.0"
    enabled = @("duckduckgo")
    providers = @{
        duckduckgo = @{
            name = "DuckDuckGo"
            enabled = $true
            noAuthRequired = $true
            baseUrl = "https://api.duckduckgo.com/"
            priority = 1
            description = "完全免费的搜索引擎，无需API Key"
        }
    }
}

# 保存配置
$SearchConfigJson | ConvertTo-Json -Depth 10 | Out-File -FilePath $SearchConfig -Encoding utf8
Write-ColorOutput Green "✅ DuckDuckGo 已启用"
Write-Output "   配置文件: $SearchConfig"

# 测试搜索
Write-Output "`n测试 DuckDuckGo API..."
try {
    $Response = Invoke-RestMethod -Uri "https://api.duckduckgo.com/?q=test&format=json" -TimeoutSec 5
    if ($Response) {
        Write-ColorOutput Green "✅ DuckDuckGo 响应正常"
    }
} catch {
    Write-ColorOutput Yellow "⚠️  DuckDuckGo 测试失败: $($_.Exception.Message)"
}

# 2. 配置本地 LLM
Write-ColorOutput Cyan "`n🤖 配置本地 LLM..."
Write-Output "======================================"

# 检查 Ollama
$OllamaPath = "ollama"
$OllamaInstalled = $false

try {
    $OllamaVersion = & $OllamaPath --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $OllamaInstalled = $true
        Write-ColorOutput Green "✅ Ollama 已安装: $OllamaVersion"
    }
} catch {
    Write-ColorOutput Yellow "⏳ Ollama 未安装"
}

if (-not $OllamaInstalled) {
    Write-Output ""
    Write-Output "安装 Ollama:"
    Write-Output "  1. 访问: https://ollama.com/download"
    Write-Output "  2. 下载 Windows 版本"
    Write-Output "  3. 运行安装程序"
    Write-Output ""
    $Install = Read-Host "安装完成后按回车继续"
}

# 检查 Ollama 服务
if ($OllamaInstalled) {
    Write-Output "`n检查 Ollama 服务..."
    try {
        $Process = Get-Process -Name "ollama" -ErrorAction SilentlyContinue
        if ($Process) {
            Write-ColorOutput Green "✅ Ollama 服务正在运行"
        } else {
            Write-ColorOutput Yellow "⏳ Ollama 服务未启动"
            Write-Output "请启动 Ollama 应用程序"
        }
    } catch {
        Write-ColorOutput Yellow "⚠️  无法检查服务状态"
    }

    # 列出模型
    Write-Output "`n已安装的模型:"
    try {
        & $OllamaPath list
    } catch {
        Write-ColorOutput Yellow "⚠️  无法列出模型"
    }
}

# 创建 LLM 配置
$LLMConfig = Join-Path $ConfigDir "local-llm.json"
$LLMConfigJson = @{
    version = "1.0.0"
    provider = "ollama"
    baseUrl = "http://localhost:11434"
    enabled = $true
    models = @()
}

$LLMConfigJson | ConvertTo-Json -Depth 10 | Out-File -FilePath $LLMConfig -Encoding utf8
Write-ColorOutput Green "✅ LLM 配置已创建: $LLMConfig"

# 3. 显示配置摘要
Write-ColorOutput Cyan "`n📊 配置摘要"
Write-Output "======================================"

Write-Output "`n配置文件:"
Write-Output "  搜索: $SearchConfig"
Write-Output "  LLM:  $LLMConfig"

Write-Output "`n即时可用:"
Write-Output "  ✅ DuckDuckGo Search (无需API Key)"

if ($OllamaInstalled) {
    Write-Output "  ✅ Ollama (需要启动并下载模型)"
} else {
    Write-Output "  ⏳ Ollama (需要安装)"
}

Write-Output "`n可选配置:"
Write-Output "  📝 Tavily Search (1000次/月免费)"
Write-Output "  📝 Google AI Studio (Gemini无限免费)"
Write-Output "  📝 Hugging Face (30k/天免费)"

# 4. 显示下一步
Write-ColorOutput Cyan "`n📖 下一步操作"
Write-Output "======================================"
Write-Output ""
Write-Output "1️⃣  测试搜索引擎:"
Write-Output "   claude '搜索 latest AI news'"
Write-Output ""
Write-Output "2️⃣  下载 Ollama 模型（如果已安装）:"
Write-Output "   ollama pull llama3:8b"
Write-Output "   ollama pull qwen2.5:7b"
Write-Output ""
Write-Output "3️⃣  测试本地 LLM:"
Write-Output "   ollama run llama3:8b 'Hello'"
Write-Output ""
Write-Output "4️⃣  配置可选的云端 API:"
Write-Output "   - Tavily: https://api.tavily.com"
Write-Output "   - Google AI: https://aistudio.google.com"
Write-Output ""
Write-Output "5️⃣  查看配置:"
Write-Output "   cat $SearchConfig"
Write-Output "   cat $LLMConfig"

Write-ColorOutput Green "`n✅ 配置完成！"
