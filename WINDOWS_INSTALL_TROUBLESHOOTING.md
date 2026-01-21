# Windows 安装故障排除指南

## 问题概述

在老的 Windows 系统上运行 `npm install -g stigmergy` 时可能失败。

## 常见原因和解决方案

### 原因 1: npm 版本过低

**症状:**
```
npm ERR! code ETARGET
npm ERR! notarget No matching version found for stigmergy@latest
```

**原因:**
- 老的 npm 版本不支持某些包规范
- npm 5.x 及以下版本有已知的 bug

**检测:**
```bash
npm --version
# 如果显示 5.x.x 或更低，需要升级
```

**解决方案:**
```bash
# 方案 A: 使用 npm 自身升级
npm install -g npm@latest

# 方案 B: 手动下载最新 npm
# 访问: https://github.com/npm/cli/releases
# 下载并解压到 Node.js 目录

# 验证版本
npm --version
# 应该显示 6.x.x 或更高
```

---

### 原因 2: Node.js 版本过低

**症状:**
```
npm ERR! engine Not compatible with your version of Node.js
```

**原因:**
- Stigmergy 可能需要 Node 14+ 特性
- 老的 Node.js 版本不支持新的 JavaScript 语法

**检测:**
```bash
node --version
# 如果显示 v12.x.x 或更低，需要升级
```

**解决方案:**
```bash
# 1. 下载最新 LTS 版本
# 访问: https://nodejs.org/
# 下载 Windows Installer (.msi)

# 2. 卸载旧版本
# 控制面板 -> 程序和功能 -> Node.js -> 卸载

# 3. 安装新版本
# 双击下载的 .msi 文件，按提示安装

# 4. 验证
node --version
npm --version
```

---

### 原因 3: 权限问题

**症状:**
```
npm ERR! code EACCES
npm ERR! syscall mkdir
npm ERR! path C:\Program Files\nodejs\stigmergy
npm ERR! errno -13
npm ERR! Error: EACCES: permission denied
```

**原因:**
- npm 全局目录是 `C:\Program Files\nodejs\`
- 这个目录需要管理员权限才能写入
- 普通用户无法安装全局包

**检测:**
```bash
npm config get prefix
# 如果显示 C:\Program Files\nodejs 或 C:\nodejs，需要权限
```

**解决方案:**

**方案 A: 以管理员身份运行（推荐）**

1. 右键点击 `PowerShell` 或 `命令提示符`
2. 选择 **"以管理员身份运行"**
3. 在管理员终端中运行:
   ```bash
   npm install -g stigmergy
   ```

**方案 B: 使用用户目录安装（无需管理员）**

```bash
# 1. 创建用户 npm 目录
mkdir %USERPROFILE%\npm-global

# 2. 配置 npm 使用用户目录
npm config set prefix "%USERPROFILE%\npm-global"

# 3. 添加到 PATH (需要重启终端)
# 方法 A: 临时设置
set PATH=%USERPROFILE%\npm-global;%PATH%

# 方法 B: 永久设置（推荐）
setx PATH "%USERPROFILE%\npm-global;%PATH%"
# 然后重启终端

# 4. 安装
npm install -g stigmergy
```

**方案 C: 修改默认目录权限**

```powershell
# 以管理员身份运行 PowerShell
$acl = Get-Acl "C:\Program Files\nodejs"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "$env:USERNAME",
    "FullControl",
    "ContainerInherit,ObjectInherit",
    "None",
    "Allow"
)
$acl.SetAccessRule($accessRule)
Set-Acl "C:\Program Files\nodejs" $acl
```

---

### 原因 4: PATH 配置问题

**症状:**
```bash
# 安装成功
npm install -g stigmergy
# + stigmergy@1.x.x

# 但无法运行
stigmergy
# 'stigmergy' 不是内部或外部命令
```

**原因:**
- npm 的 bin 目录不在 PATH 环境变量中
- Windows 找不到 `stigmergy` 命令

**检测:**
```bash
# 查看 npm bin 目录
npm bin
# 输出: C:\Users\YourName\AppData\Roaming\npm

# 检查是否在 PATH 中
echo %PATH%
# 查看输出中是否包含上述路径
```

**解决方案:**

**方法 A: 使用 setx（永久设置）**

```bash
# 获取 npm bin 目录
for /f "delims=" %i in ('npm bin') do set NPM_BIN=%i

# 添加到 PATH
setx PATH "%NPM_BIN%;%PATH%"

# 重启终端后验证
echo %PATH%
stigmergy --version
```

**方法 B: 手动设置（GUI）**

1. 右键点击 **"此电脑"** -> **"属性"**
2. 点击 **"高级系统设置"**
3. 点击 **"环境变量"**
4. 在 **"系统变量"** 中找到 `Path`
5. 点击 **"编辑"**
6. 点击 **"新建"**
7. 添加 npm bin 目录（例如：`C:\Users\YourName\AppData\Roaming\npm`）
8. 点击 **"确定"** 保存
9. **重启终端**

**方法 C: 临时设置（仅当前会话）**

```bash
# 临时添加到 PATH（不需要重启）
set PATH=%PATH%;C:\Users\YourName\AppData\Roaming\npm

# 验证
stigmergy --version
```

---

### 原因 5: 长路径问题

**症状:**
```
npm ERR! code ENAMETOOLONG
npm ERR! errno -14
npm ERR! filename too long
```

**原因:**
- Windows 默认路径长度限制为 260 字符
- npm 的 `node_modules` 目录嵌套很深，可能超过限制
- 这个问题在 Windows 7/8 上特别常见

**解决方案:**

**方案 A: 启用长路径支持（Windows 10+）**

1. 打开注册表编辑器 (`Win + R`, 输入 `regedit`)
2. 导航到:
   ```
   HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem
   ```
3. 找到 `LongPathsEnabled`
4. 双击修改值为 `1`
5. 重启电脑

**方案 B: 使用用户目录安装**

```bash
# 用户目录路径通常较短
mkdir %USERPROFILE%\npm-global
npm config set prefix "%USERPROFILE%\npm-global"
npm install -g stigmergy
```

**方案 C: 使用 flatten 目录结构**

```bash
# 使用 npm 的 --legacy-bundling 选项
npm install -g stigmergy --legacy-bundling
```

---

### 原因 6: 网络问题

**症状:**
```
npm ERR! network request failed
npm ERR! network ERR_CONNECTION_TIMED_OUT
```

**原因:**
- npm registry 访问受限
- 防火墙阻止
- 代理配置问题

**解决方案:**

```bash
# 方案 A: 使用国内镜像（推荐）
npm config set registry https://registry.npmmirror.com
npm install -g stigmergy

# 方案 B: 配置代理
npm config set proxy http://proxy-server:port
npm config set https-proxy http://proxy-server:port
npm install -g stigmergy

# 方案 C: 使用其他镜像
npm config set registry https://registry.npmjs.org
npm install -g stigmergy
```

---

### 原因 7: PowerShell 执行策略

**症状:**
```
无法加载文件，因为在此系统上禁止运行脚本
```

**原因:**
- PowerShell 默认执行策略限制脚本运行
- 某些 npm 包使用 PowerShell 脚本

**解决方案:**

```powershell
# 以管理员身份运行 PowerShell
# 查看当前策略
Get-ExecutionPolicy

# 修改为 RemoteSigned（推荐）
Set-ExecutionPolicy RemoteSigned

# 或修改为 Unrestricted（不推荐）
Set-ExecutionPolicy Unrestricted

# 验证
Get-ExecutionPolicy
```

---

### 原因 8: Python 或构建工具缺失

**症状:**
```
npm ERR! gyp ERR! stack Error: `make` failed with exit code: 2
gyp ERR! stack Error: Python not found
```

**原因:**
- 某些 npm 包包含原生 C++ 扩展
- 需要编译，但没有安装构建工具

**解决方案:**

```bash
# 方案 A: 安装 Windows 构建工具
npm install -g windows-build-tools
# 这会自动安装 Python 和 Visual Studio Build Tools

# 方案 B: 手动安装构建工具
# 1. 安装 Python 2.7 或 3.x
# 下载: https://www.python.org/downloads/

# 2. 安装 Visual Studio Build Tools
# 下载: https://visualstudio.microsoft.com/downloads/
# 选择 "Build Tools for Visual Studio"

# 3. 配置 npm 使用 Python
npm config set python "C:\Python27\python.exe"

# 方案 C: 跳过可选依赖
npm install -g stigmergy --ignore-scripts
```

---

## 完整安装流程（推荐）

### 方法 1: 标准安装（需要管理员）

```bash
# 1. 以管理员身份运行 PowerShell
# 右键点击 PowerShell -> "以管理员身份运行"

# 2. 检查版本
node --version  # 应该 >= 14.x.x
npm --version   # 应该 >= 6.x.x

# 3. 升级 npm（如果需要）
npm install -g npm@latest

# 4. 安装 stigmergy
npm install -g stigmergy

# 5. 验证
stigmergy --version
```

### 方法 2: 用户目录安装（无需管理员）

```bash
# 1. 创建用户 npm 目录
mkdir %USERPROFILE%\npm-global

# 2. 配置 npm
npm config set prefix "%USERPROFILE%\npm-global"

# 3. 添加到 PATH
setx PATH "%USERPROFILE%\npm-global;%PATH%"

# 4. 重启终端，然后安装
npm install -g stigmergy

# 5. 验证
stigmergy --version
```

### 方法 3: 国内网络优化

```bash
# 1. 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 2. 安装
npm install -g stigmergy

# 3. 验证
stigmergy --version
```

## 诊断工具

使用提供的诊断工具检测问题：

```bash
# 运行诊断工具
node test-windows-install.js

# 查看详细报告
# 会列出所有可能的问题和解决方案
```

## Windows 版本兼容性

| Windows 版本 | Node.js 最低版本 | npm 最低版本 | 状态 |
|--------------|-----------------|-------------|------|
| Windows 11 (22H2+) | 18.x | 9.x | ✅ 完全支持 |
| Windows 10 (21H2+) | 16.x | 8.x | ✅ 完全支持 |
| Windows 10 (1909+) | 14.x | 6.x | ✅ 支持 |
| Windows 10 (1809+) | 12.x | 6.x | ⚠️ 需要启用长路径 |
| Windows 8.1 | 12.x | 6.x | ⚠️ 可能需要长路径支持 |
| Windows 7 | 10.x | 6.x | ❌ 不推荐 |
| Windows Server 2022 | 18.x | 9.x | ✅ 完全支持 |
| Windows Server 2019 | 14.x | 6.x | ✅ 支持 |

## 快速解决方案

### 问题：安装失败，提示权限错误

```bash
# 快速修复：使用用户目录
npm config set prefix "%USERPROFILE%\npm-global"
setx PATH "%USERPROFILE%\npm-global;%PATH%"
# 重启终端
npm install -g stigmergy
```

### 问题：安装成功，但命令未找到

```bash
# 快速修复：手动添加到 PATH
# 1. 获取 npm bin 目录
npm bin

# 2. 手动添加到系统 PATH（见上文"方法 B: 手动设置"）
```

### 问题：网络超时或连接失败

```bash
# 快速修复：使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install -g stigmergy
```

### 问题：npm 版本过低

```bash
# 快速修复：升级 npm
npm install -g npm@latest
npm install -g stigmergy
```

## 验证安装

```bash
# 1. 检查版本
stigmergy --version

# 2. 检查可用性
stigmergy --help

# 3. 扫描 CLI 工具
stigmergy scan

# 4. 查看状态
stigmergy status
```

## 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| `EACCES` | 权限拒绝 | 使用管理员权限或用户目录 |
| `ETARGET` | 包未找到 | 检查包名，升级 npm |
| `ENOTFOUND` | 网络未找到 | 检查网络，使用镜像 |
| `ECONNREFUSED` | 连接被拒绝 | 检查防火墙，使用代理 |
| `ENAMETOOLONG` | 路径过长 | 启用长路径或使用用户目录 |
| `ENGINE` | Node 版本不兼容 | 升级 Node.js |

## 获取帮助

如果以上方案都无法解决问题：

1. 运行诊断工具: `node test-windows-install.js`
2. 查看详细日志: `npm install -g stigmergy --verbose`
3. 提交 issue 并附上:
   - Windows 版本 (`winver`)
   - Node.js 版本 (`node --version`)
   - npm 版本 (`npm --version`)
   - 完整错误信息

---

**更新日期**: 2025-12-24
**版本**: 1.3.2-beta.0
**适用于**: Windows 7/8/10/11
