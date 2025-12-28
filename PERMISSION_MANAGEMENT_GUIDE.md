# Stigmergy CLI 权限管理指南
## 解决 macOS/Linux 终端目录权限问题

---

## 🎯 问题背景

### 常见场景
用户在 macOS 或 Linux 系统上第一次打开终端时，经常会遇到以下问题：

1. **系统目录无权限**：终端默认在 `/`、`/root`、`/var` 等系统目录
2. **npm 安装失败**：全局安装时权限不足
3. **目录创建失败**：无法在工作目录创建文件和子目录
4. **安装体验差**：需要手动切换目录和配置权限

### 典型错误信息
```
npm ERR! code EACCES
npm ERR! syscall open
npm ERR! path /usr/local/lib/node_modules/stigmergy/package.json
npm ERR! errno -13
npm ERR! Error: EACCES: permission denied
```

---

## 🔧 解决方案概述

Stigmergy CLI 现在包含**智能权限管理系统**，能够：

1. **自动检测目录权限**：检测当前目录是否有写入权限
2. **智能目录切换**：自动切换到用户有权限的目录
3. **npm 配置优化**：为 npm 配置有权限的全局安装目录
4. **Shell 环境配置**：永久保存配置到用户 shell 配置文件
5. **无缝安装体验**：权限问题自动解决，用户无需干预

---

## 📋 功能特性

### ✨ 自动权限检测
- 实时检测当前目录写入权限
- 智能识别系统目录 vs 用户目录
- 支持多平台：macOS、Linux、Windows

### 🔧 智能目录管理
- 自动寻找最佳工作目录
- 优先级：当前目录 → 用户目录 → 桌面 → 文档 → 临时目录
- 如需要，自动创建专用工作空间

### 📦 npm 配置管理
- 动态配置 npm 全局前缀
- 创建用户专属的 npm 全局目录
- 自动更新 PATH 环境变量

### 🐚 Shell 环境集成
- 自动识别 Shell 类型：zsh、bash、fish、csh、tcsh
- 智能更新配置文件：.zshrc、.bash_profile、.bashrc
- 提供手动配置备选方案

### 🚀 无缝安装集成
- 与现有安装流程完全集成
- 保持向后兼容性
- 提供详细的成功/失败反馈

---

## 🎮 使用方法

### 方法 1：自动权限修复（推荐）
```bash
# 运行权限修复工具
node fix-permissions.js

# 或使用 Stigmergy 命令
stigmergy fix-perms
```

### 方法 2：权限检查
```bash
# 检查当前目录权限
stigmergy perm-check

# 或使用脚本
node fix-permissions.js --check
```

### 方法 3：正常安装（自动权限处理）
```bash
# 安装命令会自动处理权限问题
npm install -g stigmergy
stigmergy install
```

### 方法 4：手动模式
```bash
# 仅权限设置，不安装工具
node fix-permissions.js --auto
```

---

## 🔍 工作流程详解

### 自动权限处理流程

```
1. 用户运行: stigmergy install
   ↓
2. 检测当前目录权限
   ↓
3. 如果有权限 → 正常安装流程
   如果无权限 → 触发权限管理
   ↓
4. 寻找可用目录:
   - 用户主目录 (~/)
   - 桌面 (~/Desktop)
   - 文档 (~/Documents)
   - 临时目录 (/tmp)
   ↓
5. 配置 npm:
   - 创建 ~/.npm-global 目录
   - 设置 npm_config_prefix
   - 更新 PATH 变量
   ↓
6. 配置 Shell:
   - 检测 Shell 类型
   - 更新配置文件 (.zshrc, .bashrc 等)
   - 生成持久配置
   ↓
7. 切换工作目录
   ↓
8. 继续正常安装流程
```

### 权限检测算法

```javascript
// 1. 尝试写入测试文件
try {
  await fs.writeFile('.stigmergy-permission-test', 'test');
  await fs.unlink('.stigmergy-permission-test');
  return true; // 有权限
} catch (error) {
  return false; // 无权限
}

// 2. 寻找可用目录
const searchDirectories = [
  process.cwd(), // 当前目录
  os.homedir(), // 用户主目录
  path.join(os.homedir(), 'Desktop'),
  path.join(os.homedir(), 'Documents'),
  os.tmpdir(), // 临时目录
  '/tmp'
];
```

---

## 📁 目录结构示例

### 权限修复后的目录结构
```
/Users/username/
├── .npm-global/              # npm 全局目录
│   ├── bin/                  # 可执行文件
│   │   ├── stigmergy
│   │   ├── claude
│   │   ├── gemini
│   │   └── ...
│   └── lib/                  # npm 包
│       └── node_modules/
│           └── stigmergy/
├── stigmergy-workspace/      # 工作空间（如需要）
│   └── .npm-global/         # 备用 npm 目录
├── .zshrc                    # Shell 配置
├── .bash_profile             # Bash 配置 (macOS)
└── .bashrc                   # Bash 配置 (Linux)
```

### Shell 配置示例
```bash
# ~/.zshrc 或 ~/.bash_profile 中添加的配置

# Stigmergy CLI Environment Configuration
export npm_config_prefix="/Users/username/.npm-global"
export PATH="/Users/username/.npm-global/bin:$PATH"
```

---

## 🛠️ 高级功能

### 环境变量控制
```bash
# 禁用权限检查
export STIGMERGY_SKIP_PERMISSION_CHECK=true

# 禁用自动安装
export STIGMERGY_AUTO_INSTALL=false

# 启用详细日志
export DEBUG=true
```

### 配置选项
```javascript
// 自定义权限管理器
const manager = new DirectoryPermissionManager({
  verbose: true,                    // 详细日志
  fallbackDir: '/custom/dir',       // 自定义备用目录
  createStigmergyDir: true          // 创建 stigmergy 工作空间
});

// 自定义安装器
const installer = new EnhancedCLIInstaller({
  verbose: false,                   // 简化输出
  autoRetry: true,                  // 启用自动重试
  maxRetries: 2                     // 最大重试次数
});
```

### 故障排除
```bash
# 查看详细诊断信息
stigmergy diagnostic

# 检查权限状态
stigmergy perm-check --verbose

# 手动修复权限
node fix-permissions.js --verbose

# 清理并重新安装
stigmergy clean
stigmergy install
```

---

## 🔧 技术实现细节

### 核心组件

1. **DirectoryPermissionManager**
   - 权限检测和目录管理
   - Shell 环境检测和配置
   - 跨平台兼容性处理

2. **EnhancedCLIInstaller**
   - 集成权限管理和安装流程
   - 自动化 npm 配置
   - 完整的用户体验设计和权限处理

3. **集成到 CLI Router**
   - 无缝集成现有命令
   - 向后兼容保证
   - 用户友好的错误处理

### 平台兼容性

| 平台 | Shell | 配置文件 | 支持状态 |
|------|-------|----------|----------|
| macOS | zsh | ~/.zshrc | ✅ 完全支持 |
| macOS | bash | ~/.bash_profile | ✅ 完全支持 |
| Linux | bash | ~/.bashrc | ✅ 完全支持 |
| Linux | zsh | ~/.zshrc | ✅ 完全支持 |
| Linux | fish | ~/.config/fish/config.fish | ✅ 支持 |
| Linux | csh/tcsh | ~/.cshrc | ✅ 支持 |
| Windows | PowerShell | $PROFILE | ✅ 支持 |

---

## 📊 使用场景和最佳实践

### 场景 1：新用户首次安装
```bash
# 一键解决所有权限问题
node fix-permissions.js --auto
npm install -g stigmergy
stigmergy install
```

### 场景 2：CI/CD 环境安装
```bash
# 非交互式安装
export STIGMERGY_AUTO_INSTALL=true
npm install -g stigmergy
```

### 场景 3：系统管理员部署
```bash
# 检查权限状态
stigmergy perm-check

# 手动配置
export npm_config_prefix="/opt/stigmergy/.npm-global"
export PATH="/opt/stigmergy/.npm-global/bin:$PATH"
```

### 场景 4：多用户环境
```bash
# 用户级别安装（无需 sudo）
node fix-permissions.js

# 系统级别安装（需要 sudo）
sudo npm install -g stigmergy
```

---

## 🔍 调试和故障排除

### 常见问题

**问题 1**: 权限检测失败
```bash
# 解决方案：使用详细模式查看问题
node fix-permissions.js --verbose --check
```

**问题 2**: Shell 配置未生效
```bash
# 解决方案：手动应用配置
source ~/.zshrc  # 或 ~/.bashrc
```

**问题 3**: npm 仍然使用系统目录
```bash
# 解决方案：验证 npm 配置
npm config get prefix
npm config set prefix ~/.npm-global
```

**问题 4**: PATH 环境变量未更新
```bash
# 解决方案：手动添加到 PATH
export PATH="$HOME/.npm-global/bin:$PATH"
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
```

### 调试命令
```bash
# 完整系统诊断
stigmergy diagnostic

# 检查权限状态
stigmergy perm-check

# 验证 npm 配置
npm config list

# 检查环境变量
echo $npm_config_prefix
echo $PATH
```

---

## 📈 性能和优化

### 权限检测优化
- 缓存权限检测结果
- 避免重复文件系统操作
- 快速失败机制

### 目录选择优化
- 智能目录优先级排序
- 避免系统目录扫描
- 快速用户目录定位

### Shell 配置优化
- 最小化配置文件修改
- 避免重复配置添加
- 配置验证和回滚

---

## 🔮 未来改进计划

### 短期改进
- [ ] 图形化权限修复工具
- [ ] 更多 Shell 类型支持
- [ ] 配置导入/导出功能
- [ ] 权限修复历史记录

### 长期规划
- [ ] 与系统包管理器集成
- [ ] 企业级权限管理
- [ ] 多用户配置管理
- [ ] 权限监控和报警

---

## 📝 总结

Stigmergy CLI 的权限管理系统为用户提供了：

1. **零配置体验**：自动检测和修复权限问题
2. **跨平台支持**：支持主流操作系统和 Shell
3. **用户友好**：清晰的错误信息和解决建议
4. **向后兼容**：不影响现有用户和功能
5. **可定制性**：提供多种配置和自定义选项

通过这套系统，用户不再需要手动处理目录权限问题，可以专注于使用 Stigmergy CLI 的核心功能。

**🎉 问题彻底解决！**