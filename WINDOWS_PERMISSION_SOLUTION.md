# Windows权限解决方案

## 🚨 重要提醒

**Windows PowerShell 没有sudo命令！**

## ✅ Windows正确的权限解决方案

### 方法1：管理员PowerShell（推荐）
```powershell
# 步骤：
# 1. 在开始菜单搜索 "PowerShell"
# 2. 右键点击 "PowerShell"
# 3. 选择 "以管理员身份运行"
# 4. 在管理员PowerShell中运行：
npm install -g stigmergy
```

### 方法2：命令行启动管理员PowerShell
```powershell
# 在普通PowerShell中运行：
Start-Process PowerShell -Verb RunAs -ArgumentList "npm install -g stigmergy"

# 或者：
powershell -Command "Start-Process PowerShell -Verb RunAs -ArgumentList 'npm install -g stigmergy'"
```

### 方法3：强制安装（遇到权限问题时）
```powershell
# 在管理员PowerShell中：
npm install -g stigmergy --force
```

## 🔧 不同Windows版本的处理

### Windows 11/10
```powershell
# 使用管理员权限的PowerShell或Windows Terminal
# 右键 -> "以管理员身份运行"
npm install -g stigmergy
```

### Windows 8/7
```powershell
# 搜索 "PowerShell"
# 右键 -> "以管理员身份运行"
npm install -g stigmergy
```

## ❓ 常见错误和解决方案

### 错误1："npm ERR! code EPERM"
```powershell
# 解决方案：使用管理员PowerShell
# 然后运行：
npm install -g stigmergy --force
```

### 错误2："Access is denied"
```powershell
# 解决方案：检查PowerShell是否以管理员身份运行
# 检查命令：
[Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()
# 如果不是管理员，重新以管理员身份启动PowerShell
```

### 错误3："无法创建目录"
```powershell
# 解决方案：强制创建
npm install -g stigmergy --force
```

## 🎯 Windows vs macOS/Linux 权限对比

| 平台 | 权限提升方式 | 命令示例 |
|------|-------------|----------|
| **Windows** | 管理员PowerShell | `npm install -g stigmergy` (在管理员PowerShell中) |
| **macOS** | sudo | `sudo npm install -g stigmergy` |
| **Linux** | sudo | `sudo npm install -g stigmergy` |

## 💡 最佳实践

### 1. 首次安装
```powershell
# 始终使用管理员PowerShell进行首次全局安装
# 避免后续权限问题
```

### 2. 企业环境
```powershell
# 如果有企业npm配置
npm config set registry "https://企业npm仓库地址"
npm install -g stigmergy
```

### 3. 网络代理环境
```powershell
# 如果需要代理
npm config set proxy "http://代理服务器:端口"
npm install -g stigmergy
```

## 🎮 交互式权限提升脚本

可以创建一个PowerShell脚本来自动处理权限问题：

```powershell
# Save as install-stigmergy.ps1
param(
    [switch]$Force
)

# 检查是否管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "需要管理员权限安装全局包，正在请求权限提升..." -ForegroundColor Yellow
    $arguments = "-File `"$PSCommandPath`""
    if ($Force) {
        $arguments += " -Force"
    }
    Start-Process PowerShell -Verb RunAs -ArgumentList $arguments
    exit
}

Write-Host "管理员权限确认，开始安装..." -ForegroundColor Green

$installCommand = "npm install -g stigmergy"
if ($Force) {
    $installCommand += " --force"
}

Write-Host "执行: $installCommand" -ForegroundColor Cyan
Invoke-Expression $installCommand

Write-Host "安装完成！" -ForegroundColor Green
```

使用方法：
```powershell
# 普通安装
.\install-stigmergy.ps1

# 强制安装
.\install-stigmergy.ps1 -Force
```

## 🏆 总结

**Windows权限解决方案的核心是管理员PowerShell，而不是sudo！**

记住这个关键区别：
- ✅ **Windows**: 管理员PowerShell
- ✅ **macOS/Linux**: sudo命令

**不要在Windows中尝试使用sudo命令，它不存在！**