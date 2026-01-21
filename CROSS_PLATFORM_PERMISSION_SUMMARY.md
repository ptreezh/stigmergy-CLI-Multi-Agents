# Stigmergy CLI 跨平台权限管理系统
## Windows + macOS + Linux 完整解决方案

---

## 🎯 权限管理系统总览

Stigmergy CLI 现在具备**完整的跨平台权限管理能力**，能够自动处理所有主流操作系统上的目录权限问题，为用户提供**真正零配置**的安装体验。

### 🔧 核心功能
1. **智能权限检测** - 自动检测当前目录写入权限
2. **跨平台支持** - Windows、macOS、Linux 全平台支持
3. **智能目录管理** - 自动寻找最佳工作目录
4. **Shell 环境集成** - 支持所有主流 Shell 环境
5. **无缝安装体验** - 权限问题自动解决

---

## 📊 平台支持矩阵

| 平台 | Shell | 配置文件 | 权限检测 | 自动修复 | 支持状态 |
|------|-------|----------|----------|----------|----------|
| **Windows 11** | PowerShell 7.x | `.ps1` | ✅ | ✅ | 完全支持 |
| **Windows 11** | PowerShell 5.x | `.ps1` | ✅ | ✅ | 完全支持 |
| **Windows 10** | Command Prompt | Registry | ✅ | ✅ | 完全支持 |
| **Windows 10** | Git Bash | `.bashrc` | ✅ | ✅ | 完全支持 |
| **Windows 10** | WSL | `.bashrc`/`.zshrc` | ✅ | ✅ | 完全支持 |
| **macOS 12+** | Zsh | `.zshrc` | ✅ | ✅ | 完全支持 |
| **macOS 10.15+** | Bash | `.bash_profile` | ✅ | ✅ | 完全支持 |
| **Ubuntu 20.04+** | Bash | `.bashrc` | ✅ | ✅ | 完全支持 |
| **Ubuntu 22.04+** | Zsh | `.zshrc` | ✅ | ✅ | 完全支持 |
| **CentOS 7+** | Bash | `.bashrc` | ✅ | ✅ | 完全支持 |
| **Debian 10+** | Bash | `.bashrc` | ✅ | ✅ | 完全支持 |

---

## 🏗️ 系统架构

### 核心组件

```
┌─────────────────────────────────────────────────────┐
│                 Stigmergy CLI                       │
├─────────────────────────────────────────────────────┤
│  CLI Router (src/cli/router.js)                     │
│  ├─ install command (自动权限检测)                  │
│  ├─ auto-install case (npm postinstall)            │
│  ├─ fix-perms command (专门权限修复)                │
│  └─ perm-check command (权限状态检查)              │
├─────────────────────────────────────────────────────┤
│  Permission-Aware Installer                        │
│  ├─ 集成权限管理和安装流程                          │
│  ├─ Shell 环境配置                                 │
│  └─ 用户友好的错误处理                             │
├─────────────────────────────────────────────────────┤
│  Directory Permission Manager                      │
│  ├─ 跨平台权限检测                                  │
│  ├─ 智能目录选择                                    │
│  ├─ Shell 类型检测                                  │
│  └─ 平台特定配置生成                                │
└─────────────────────────────────────────────────────┘
```

### 工作流程

```
用户运行安装命令
        ↓
    权限检测
        ↓
    有权限？ ──是──→ 正常安装流程
        ↓否
    智能目录搜索
        ↓
    找到可用目录
        ↓
    配置 npm 环境
        ↓
    配置 Shell 环境
        ↓
    切换工作目录
        ↓
    继续正常安装
        ↓
    安装完成 + 环境配置
```

---

## 🖥️ Windows 特性

### Shell 检测
```javascript
// 自动检测 Windows Shell 类型
if (process.env.PSModulePath) return 'powershell';     // PowerShell
if (process.env.COMSPEC?.includes('cmd.exe')) return 'cmd'; // Command Prompt
if (process.env.WSL_DISTRO_NAME) return 'wsl';         // WSL
return 'powershell'; // 默认 PowerShell
```

### 目录搜索
```javascript
const windowsDirectories = [
  process.env.USERPROFILE,                    // C:\Users\{username}
  path.join(process.env.USERPROFILE, 'Desktop'),
  path.join(process.env.USERPROFILE, 'Documents'),
  path.join(process.env.USERPROFILE, 'Downloads'),
  process.env.LOCALAPPDATA,                  // AppData\Local
  process.env.TEMP || process.env.TMP,       // 临时目录
  'C:\\temp',
  os.tmpdir()
];
```

### PowerShell 配置
```powershell
# 临时设置
$env:npm_config_prefix = "C:\Users\{username}\.npm-global"
$env:PATH = "C:\Users\{username}\.npm-global\bin;$env:PATH"

# 永久设置
Add-Content -Path $PROFILE -Value '$env:npm_config_prefix = "C:\Users\{username}\.npm-global"'
Add-Content -Path $PROFILE -Value '$env:PATH = "C:\Users\{username}\.npm-global\bin;$env:PATH"'
```

### UAC 兼容
- 自动避免需要管理员权限的目录
- 优先使用用户目录 (`C:\Users\{username}`)
- 不修改系统目录或注册表
- 不写入 `C:\Program Files`

---

## 🍎 macOS 特性

### Shell 检测
```javascript
// macOS Shell 检测优先级
if (shell.includes('zsh')) return 'zsh';        // 默认 macOS Shell
if (shell.includes('bash')) return 'bash';      // 兼容性 Bash
if (shell.includes('fish')) return 'fish';      // Fish Shell
```

### 目录搜索
```javascript
const macDirectories = [
  os.homedir(),                                // /Users/{username}
  path.join(os.homedir(), 'Desktop'),
  path.join(os.homedir(), 'Documents'),
  path.join(os.homedir(), 'Downloads'),
  path.join(os.homedir(), 'Projects'),
  '/tmp',
  '/var/tmp'
];
```

### Shell 配置
```bash
# .zshrc (macOS 默认)
export npm_config_prefix="/Users/{username}/.npm-global"
export PATH="/Users/{username}/.npm-global/bin:$PATH"

# .bash_profile (旧版 macOS)
export npm_config_prefix="/Users/{username}/.npm-global"
export PATH="/Users/{username}/.npm-global/bin:$PATH"
```

### SIP 兼容
- 避免系统完整性保护保护的目录
- 不修改 `/usr` 或 `/System` 目录
- 用户目录优先级最高

---

## 🐧 Linux 特性

### Shell 检测
```javascript
// Linux Shell 多样性支持
if (shell.includes('bash')) return 'bash';      // 最常用
if (shell.includes('zsh')) return 'zsh';        // 高级用户
if (shell.includes('fish')) return 'fish';      // 现代化 Shell
if (shell.includes('csh')) return 'csh';        // 兼容性
if (shell.includes('tcsh')) return 'tcsh';      // 增强版 csh
```

### 目录搜索
```javascript
const linuxDirectories = [
  os.homedir(),                                // /home/{username}
  '/tmp',                                      // 通用临时目录
  '/var/tmp',                                  // 系统临时目录
  path.join(os.homedir(), 'Desktop'),          // 桌面
  path.join(os.homedir(), 'Documents'),        // 文档
  path.join(os.homedir(), 'Downloads'),        // 下载
  os.tmpdir()                                  // Node.js 临时目录
];
```

### 发行版支持
- Ubuntu/Debian: `.bashrc`
- CentOS/RHEL: `.bashrc`
- Fedora: `.bashrc`
- Arch Linux: `.bashrc`
- openSUSE: `.bashrc`

---

## 🎮 统一使用方法

### 基本命令 (所有平台)
```bash
# 检查权限状态
stigmergy perm-check

# 自动修复权限问题
stigmergy fix-perms

# 正常安装 (自动处理权限)
stigmergy install

# npm 安装 (自动处理权限)
npm install -g stigmergy
```

### 高级选项
```bash
# 详细模式
stigmergy perm-check --verbose

# 自动模式 (非交互式)
node fix-permissions.js --auto

# 跳过权限检查
export STIGMERGY_SKIP_PERMISSION_CHECK=true
stigmergy install
```

### 平台特定优化

**Windows PowerShell:**
```powershell
# 自动权限修复
node fix-permissions.js --auto

# 验证配置
Get-ChildItem Env:npm_config_prefix
Get-ChildItem Env:PATH
```

**macOS/Linux:**
```bash
# 自动权限修复
node fix-permissions.js --auto

# 重新加载 Shell 配置
source ~/.zshrc  # 或 ~/.bashrc
```

---

## 📁 目录结构对比

### Windows
```
C:\Users\{username}\
├── .npm-global\                              # npm 全局目录
│   ├── bin\                                 # 可执行文件 (.cmd)
│   └── lib\node_modules\                    # npm 包
├── Documents\WindowsPowerShell\
│   └── Microsoft.PowerShell_profile.ps1     # PowerShell 配置
└── AppData\Local\Temp\                      # 临时工作目录
```

### macOS
```
/Users/{username}/
├── .npm-global/                             # npm 全局目录
│   ├── bin/                                 # 可执行文件 (符号链接)
│   └── lib/node_modules/                    # npm 包
├── .zshrc                                   # Zsh 配置
├── .bash_profile                            # Bash 配置
└── Desktop/                                  # 备用工作目录
```

### Linux
```
/home/{username}/
├── .npm-global/                             # npm 全局目录
│   ├── bin/                                 # 可执行文件 (符号链接)
│   └── lib/node_modules/                    # npm 包
├── .bashrc                                  # Bash 配置
├── .zshrc                                   # Zsh 配置
└── .config/fish/config.fish                # Fish 配置
```

---

## 🔧 故障排除指南

### 通用问题
```bash
# 系统诊断
stigmergy diagnostic

# 权限检查
stigmergy perm-check --verbose

# 重新安装
stigmergy clean && stigmergy install
```

### Windows 特定问题
```powershell
# PowerShell 执行策略
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# npm 配置验证
npm config get prefix
npm config set prefix C:\Users\{username}\.npm-global

# 环境变量检查
Get-ChildItem Env: | Where-Object { $_.Name -like "*npm*" }
```

### macOS/Linux 特定问题
```bash
# Shell 配置检查
ls -la ~/.zshrc ~/.bashrc ~/.bash_profile

# 权限修复
chmod 755 ~/.npm-global
chmod +x ~/.npm-global/bin/*

# npm 配置
npm config get prefix
npm config set prefix ~/.npm-global
```

---

## 🚀 性能优化

### 跨平台优化
1. **权限缓存**：避免重复文件系统检查
2. **目录优先级**：智能排序，快速找到可用目录
3. **配置检测**：避免重复写入配置文件
4. **错误处理**：快速失败机制

### Windows 优化
- 使用 `fs.access` 进行快速权限检查
- 避免深度递归目录搜索
- 利用 Windows 环境变量快速定位

### macOS/Linux 优化
- 利用 Unix 权限模型进行快速检测
- 使用 `stat` 系统调用获取文件信息
- 优化 Shell 配置文件操作

---

## 🔮 未来发展

### 短期改进
- [ ] 图形化权限修复工具
- [ ] Windows 安装包 (.msi/.exe)
- [ ] macOS 磁盘映像 (.dmg)
- [ ] Linux 包管理器集成 (apt/yum/pacman)

### 长期规划
- [ ] 容器化权限管理
- [ ] 云端权限配置同步
- [ ] 企业级权限策略
- [ ] 权限监控和报警

---

## 📝 总结

Stigmergy CLI 的跨平台权限管理系统提供了：

### ✨ 核心优势
1. **真正跨平台**：Windows、macOS、Linux 完全支持
2. **零配置体验**：用户无需了解系统权限配置
3. **智能自适应**：自动检测和适配不同环境
4. **完全兼容**：不干扰现有用户和配置
5. **详细反馈**：清晰的错误信息和解决建议

### 🎯 用户体验
**修改前**：
```
$ npm install -g stigmergy
npm ERR! code EACCES
npm ERR! permission denied
用户需要手动解决权限问题
```

**修改后**：
```
$ npm install -g stigmergy
🚀 STIGMERGY CLI AUTO-INSTALL STARTING
⚠️ Directory permission detected, setting up permission-aware installation...
✅ Working directory configured with proper permissions
✅ npm global directory configured
✅ Shell environment configured
✅ Installation completed successfully!
```

### 🌟 技术特点
- **平台无关**：使用 Node.js 跨平台 API
- **Shell 智能检测**：支持 10+ 种 Shell 环境
- **错误恢复**：多种备用方案确保成功
- **性能优化**：智能缓存和快速检测
- **安全设计**：避免系统关键目录操作

通过这套完整的权限管理系统，Stigmergy CLI 在所有主流平台上都能提供**一致、简单、可靠**的安装体验，彻底解决了跨平台权限问题的复杂性。

**🎉 跨平台权限管理，完全实现！**