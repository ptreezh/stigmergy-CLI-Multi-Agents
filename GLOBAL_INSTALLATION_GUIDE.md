# Stigmergy CLI - 全局安装指南

## 已发布到 npm！

Stigmergy CLI 已经成功发布到 npm，版本为 **1.3.37-beta.0**。

## 安装方法

### 方法 1: 安装最新 beta 版本（推荐）

```bash
npm install -g stigmergy@beta
```

### 方法 2: 安装特定版本

```bash
npm install -g stigmergy@1.3.37-beta.0
```

## 使用方法

安装完成后，您可以在**任何目录**下使用 stigmergy 命令：

### 启动交互式模式

```bash
# 完整命令
stigmergy interactive

# 快捷命令
stigmergy i

# 带选项
stigmergy interactive --timeout 120000
stigmergy interactive --no-save
stigmergy interactive --verbose
```

### 其他命令

```bash
# 查看版本
stigmergy --version

# 查看帮助
stigmergy --help

# 查看交互式模式帮助
stigmergy interactive --help

# 查看状态
stigmergy status

# 扫描 CLI 工具
stigmergy scan
```

## 验证安装

安装后，在任何目录下运行：

```bash
stigmergy --version
```

应该显示：`1.3.37-beta.0`

## 交互式模式使用

启动交互式模式后：

```
========================================
  Stigmergy Interactive Mode
========================================

Welcome to Stigmergy Interactive Mode!

Default CLI Tools:
  1. qwen (primary) - qwen -p "prompt" -y
  2. iflow (fallback) - iflow -p "prompt"

Available commands:
  <your message>       - Send message to qwen (auto-selects)
  help                - Show help
  status              - Show status
  exit                - Exit interactive mode

Type your message or "exit" to quit.
========================================
```

### 示例对话

```
stigmergy> 你好，请介绍一下你自己
stigmergy> 帮我写一个 Python 函数
stigmergy> 解释一下什么是 React Hooks
stigmergy> exit
```

## 系统要求

- Node.js >= 16.0.0
- npm >= 6.0.0

## 更新到最新版本

```bash
npm update -g stigmergy@beta
```

## 卸载

```bash
npm uninstall -g stigmergy
```

## 故障排除

### 问题: 命令未找到

如果 `stigmergy` 命令未找到，请检查 npm 全局路径：

```bash
npm config get prefix
```

确保该路径在您的系统 PATH 环境变量中。

### 问题: 权限错误

如果在安装时遇到权限错误，请尝试：

```bash
# Windows (以管理员身份运行 PowerShell)
npm install -g stigmergy@beta

# Linux/macOS
sudo npm install -g stigmergy@beta
```

## 更多信息

- GitHub: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- npm: https://www.npmjs.com/package/stigmergy
- 交互式模式文档: `INTERACTIVE_MODE_USER_GUIDE.md`

## 版本信息

- **当前版本**: 1.3.37-beta.0
- **发布时间**: 2026-01-16
- **发布者**: niuxiaozhang

## 新功能

### 1.3.37-beta.0

- ✨ 新增交互式对话模式
- ✨ 支持 qwen 和 iflow CLI 自动切换
- ✨ 实时输出显示
- ✨ 可配置超时时间
- ✨ 自动 fallback 机制

享受使用！🎉