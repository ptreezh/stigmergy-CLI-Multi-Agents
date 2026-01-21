# Stigmergy CLI Windows 权限管理指南
## Windows 10/11 权限问题完整解决方案

---

## 🎯 Windows 特有权限问题

### 常见场景
Windows 用户在使用 Stigmergy CLI 时可能遇到以下权限问题：

1. **系统目录限制**：`C:\Windows\System32` 等系统目录无写入权限
2. **管理员权限**：npm 全局安装需要管理员权限
3. **UAC 限制**：用户账户控制阻止写入系统目录
4. **路径长度限制**：Windows 路径长度限制导致安装失败
5. **PowerShell 执行策略**：默认阻止脚本执行

### 典型错误信息
```
npm ERR! code EPERM
npm ERR! syscall open
npm ERR! path C:\Program Files\nodejs\stigmergy\package.json
npm ERR! errno -4048
npm ERR! Error: EPERM: operation not permitted

PowerShell:
File cannot be loaded because running scripts is disabled on this system.
```

---

## 🔧 Windows 解决方案

### ✨ 智能权限检测
Stigmergy CLI 现在支持完整的 Windows 权限管理：

- **自动 Shell 检测**：PowerShell、Command Prompt、Git Bash、WSL
- **智能目录选择**：用户目录、桌面、文档、AppData、临时目录
- **Windows 特定路径处理**：正确处理反斜杠路径分隔符
- **UAC 兼容**：避免需要管理员权限的目录

### 🏠 Windows 目录优先级
```javascript
// Windows 目录搜索优先级
const windowsDirectories = [
  'C:\\Users\\{username}',          // 用户主目录
  'C:\\Users\\{username}\\Desktop', // 桌面
  'C:\\Users\\{username}\\Documents', // 文档
  'C:\\Users\\{username}\\Downloads', // 下载
  'C:\\Users\\{username}\\AppData\\Local', // AppData
  'C:\\Users\\{username}\\AppData\\Local\\Temp', // 临时目录
  'C:\\temp',                       // 系统临时目录
  'C:\\Users\\Public\\Documents'    // 公共文档
];
```

### 🐚 Windows Shell 支持

#### PowerShell (推荐)
```powershell
# 临时设置
$env:npm_config_prefix = "C:\Users\{username}\.npm-global"
$env:PATH = "C:\Users\{username}\.npm-global\bin;$env:PATH"

# 永久设置
Add-Content -Path $PROFILE -Value '$env:npm_config_prefix = "C:\Users\{username}\.npm-global"'
Add-Content -Path $PROFILE -Value '$env:PATH = "C:\Users\{username}\.npm-global\bin;$env:PATH"'

# 重新加载配置
. $PROFILE
```

#### Command Prompt (cmd)
```cmd
:: 临时设置
set npm_config_prefix=C:\Users\{username}\.npm-global
set PATH=C:\Users\{username}\.npm-global\bin;%PATH%

:: 永久设置
setx npm_config_prefix "C:\Users\{username}\.npm-global"
setx PATH "%PATH%;C:\Users\{username}\.npm-global\bin"
```

#### Git Bash
```bash
# 与 Linux/macOS 相同
export npm_config_prefix="C:/Users/{username}/.npm-global"
export PATH="/c/Users/{username}/.npm-global/bin:$PATH"
```

---

## 🎮 Windows 使用方法

### 方法 1：自动修复（推荐）
```powershell
# PowerShell 中运行
node fix-permissions.js --auto

# 或使用 Stigmergy 命令
stigmergy fix-perms
```

### 方法 2：权限检查
```powershell
# 检查当前权限状态
stigmergy perm-check

# 检查详细系统信息
stigmergy diagnostic
```

### 方法 3：正常安装（自动处理权限）
```powershell
# 安装命令会自动处理权限问题
npm install -g stigmergy
stigmergy install
```

---

## 🔍 Windows 系统信息

### 检测结果示例
```
Platform: win32
Shell: powershell
Home Directory: C:\Users\Zhang
Shell Profile: C:\Users\Zhang\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
Current Directory: C:\Windows\System32
Write Permission: ❌ No
```

### Windows 环境变量
```javascript
// 自动检测的环境变量
process.env.USERPROFILE     // C:\Users\{username}
process.env.LOCALAPPDATA    // C:\Users\{username}\AppData\Local
process.env.TEMP           // C:\Users\{username}\AppData\Local\Temp
process.env.PATH           // 系统路径
process.env.PSModulePath   // PowerShell 检测标志
process.env.COMSPEC        // cmd.exe 路径
```

---

## 🛠️ Windows 特定功能

### PowerShell 执行策略处理
```powershell
# 检查执行策略
Get-ExecutionPolicy

# 设置执行策略（如果需要）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 或者仅为当前会话设置
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### UAC 和管理员权限
Stigmergy CLI 自动避免需要管理员权限的操作：
- 不使用 `C:\Program Files` 目录
- 不修改系统注册表
- 不写入系统目录
- 优先使用用户目录

### Windows 路径长度限制
```javascript
// 自动处理长路径问题
const maxPathLength = 260; // Windows 默认限制
const useLongPath = process.platform === 'win32' && process.env.NODE_ENV === 'development';

// 路径规范化
const normalizedPath = path.win32.normalize(dirPath);
```

---

## 📁 Windows 目录结构

### 安装后的目录结构
```
C:\Users\{username}\
├── .npm-global\                    # npm 全局目录
│   ├── bin\                       # 可执行文件
│   │   ├── stigmergy.cmd
│   │   ├── claude.cmd
│   │   ├── gemini.cmd
│   │   └── ...
│   └── lib\                       # npm 包
│       └── node_modules\
│           └── stigmergy\
├── Documents\WindowsPowerShell\    # PowerShell 配置
│   └── Microsoft.PowerShell_profile.ps1
├── AppData\Local\Temp\            # 临时目录（备用）
│   └── stigmergy-workspace\
└── Desktop\                       # 桌面（备用工作目录）
    └── stigmergy-projects\
```

### PowerShell 配置文件
```powershell
# C:\Users\{username}\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1

# Stigmergy CLI Environment Configuration - PowerShell
$env:npm_config_prefix = "C:\Users\{username}\.npm-global"
$env:PATH = "C:\Users\{username}\.npm-global\bin;$env:PATH"
```

---

## 🔧 Windows 故障排除

### 常见问题解决方案

**问题 1**: PowerShell 脚本执行被阻止
```powershell
# 解决方案：设置执行策略
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**问题 2**: npm 仍然使用系统目录
```powershell
# 解决方案：检查 npm 配置
npm config get prefix
npm config set prefix C:\Users\{username}\.npm-global
```

**问题 3**: PATH 环境变量未生效
```powershell
# 解决方案：重新启动 PowerShell 或手动设置
$env:PATH = "C:\Users\{username}\.npm-global\bin;$env:PATH"
```

**问题 4**: UAC 阻止文件写入
```powershell
# 解决方案：使用用户目录而不是系统目录
stigmergy fix-perms  # 自动选择合适的目录
```

### Windows 调试命令
```powershell
# 完整系统诊断
stigmergy diagnostic

# 检查权限状态
stigmergy perm-check --verbose

# 验证 npm 配置
npm config list

# 检查环境变量
Get-ChildItem Env: | Where-Object { $_.Name -like "*npm*" -or $_.Name -like "*PATH*" }

# 检查 PowerShell 执行策略
Get-ExecutionPolicy -List
```

### PowerShell 配置验证
```powershell
# 验证 PowerShell 配置文件
Test-Path $PROFILE
Get-Content $PROFILE | Select-String "stigmergy"

# 验证环境变量
Get-ChildItem Env:npm_config_prefix
Get-ChildItem Env:PATH | Select-String "npm-global"
```

---

## 🚀 Windows 最佳实践

### 安装最佳实践
1. **使用 PowerShell**：比 Command Prompt 功能更强大
2. **避免系统目录**：不要在 `C:\Program Files` 中安装
3. **使用用户目录**：`C:\Users\{username}` 是最安全的选择
4. **定期更新**：保持 npm 和 Node.js 为最新版本

### 安全最佳实践
```powershell
# 设置安全的执行策略
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 不使用管理员权限安装
# Stigmergy CLI 自动避免需要管理员权限

# 定期清理临时文件
stigmergy clean
```

### 性能最佳实践
```powershell
# 使用本地 npm 缓存
npm config set cache "C:\Users\{username}\.npm-cache"

# 启用 npm 并行安装
npm config set progress=false

# 使用 npm 预编译二进制文件
npm config set target_arch=current
```

---

## 📊 Windows 兼容性矩阵

| Windows 版本 | PowerShell | Command Prompt | Git Bash | WSL | 支持状态 |
|-------------|-----------|----------------|----------|-----|----------|
| Windows 11 | ✅ 5.1/7.0 | ✅ | ✅ | ✅ | 完全支持 |
| Windows 10 | ✅ 5.1/7.0 | ✅ | ✅ | ✅ | 完全支持 |
| Windows 8.1 | ✅ 4.0/5.1 | ✅ | ✅ | ❌ | 支持 |
| Windows 7 | ✅ 2.0/5.1 | ✅ | ✅ | ❌ | 有限支持 |
| Windows Server | ✅ | ✅ | ✅ | ✅ | 支持 |

| Shell 类型 | 自动检测 | 配置生成 | 权限修复 | 状态 |
|-----------|----------|----------|----------|------|
| PowerShell | ✅ | ✅ | ✅ | 完全支持 |
| Command Prompt | ✅ | ✅ | ✅ | 完全支持 |
| Git Bash | ✅ | ✅ | ✅ | 完全支持 |
| WSL | ✅ | ✅ | ✅ | 完全支持 |
| Windows Terminal | ✅ | ✅ | ✅ | 完全支持 |

---

## 📈 Windows 性能优化

### 快速启动优化
```powershell
# 设置 PowerShell 配置文件
if (!(Test-Path $PROFILE)) {
  New-Item -Path $PROFILE -ItemType File -Force
}

# 添加 Stigmergy CLI 到 PATH（永久）
Add-Content -Path $PROFILE -Value '$env:PATH = "C:\Users\{username}\.npm-global\bin;$env:PATH"'
```

### 缓存优化
```powershell
# 设置 npm 缓存到用户目录
npm config set cache "$env:LOCALAPPDATA\npm-cache"

# 设置 npm 全局目录到用户目录
npm config set prefix "$env:USERPROFILE\.npm-global"

# 启用 npm 并行下载
npm config set progress=false
npm config loglevel=warn
```

---

## 🔮 Windows 未来改进

### 计划中的功能
- [ ] Windows 安装包 (.msi)
- [ ] Windows 服务集成
- [ ] Windows 注册表管理
- [ ] Windows 通知集成
- [ ] Windows 资源管理器集成

### Windows 集成
- [ ] Windows Terminal 配置文件
- [ ] VS Code 集成
- [ ] Windows 子系统 Linux (WSL) 优化
- [ ] Docker Desktop 集成

---

## 📝 总结

Stigmergy CLI 的 Windows 权限管理系统提供了：

1. **完全 Windows 兼容**：支持 Windows 7-11 和 Server 版本
2. **多 Shell 支持**：PowerShell、Command Prompt、Git Bash、WSL
3. **智能目录选择**：自动选择最佳的 Windows 目录
4. **UAC 友好**：避免需要管理员权限的操作
5. **配置自动生成**：针对不同 Shell 的专门配置
6. **详细错误处理**：Windows 特定的错误信息和解决方案

通过这套系统，Windows 用户可以获得与 macOS/Linux 用户相同的**零配置体验**，无需处理复杂的 Windows 权限和环境配置问题。

**🎉 Windows 权限问题彻底解决！**