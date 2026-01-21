# Stigmergy 默认交互式模式

## 新功能

Stigmergy CLI 现在默认进入交互式模式！

### 使用方法

#### 无参数启动（默认交互式模式）

```bash
# 直接运行 stigmergy，自动进入交互式模式
stigmergy

# 等同于
stigmergy interactive
```

#### 其他命令仍然可用

```bash
# 查看版本
stigmergy --version

# 查看帮助
stigmergy --help

# 查看状态
stigmergy status

# 扫描 CLI 工具
stigmergy scan
```

## 版本信息

- **版本**: 1.3.38-beta.0
- **发布时间**: 2026-01-16

## 更新内容

### 新增
- ✨ 默认交互式模式：运行 `stigmergy` 不带参数时自动进入交互式模式

### 改进
- 优化用户体验，简化启动流程

## 安装

```bash
npm install -g stigmergy@beta
```

## 使用示例

```bash
# 安装后，直接运行
stigmergy

# 自动进入交互式模式
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

stigmergy> 你好，请介绍一下你自己
stigmergy> 帮我写一个 Python 函数
stigmergy> exit
```

## 技术细节

当运行 `stigmergy` 不带任何参数时：
1. 检测到没有提供命令
2. 自动启动交互式模式
3. 用户可以立即与 AI CLI 工具对话

## 向后兼容

所有现有命令仍然正常工作：
- `stigmergy --version`
- `stigmergy --help`
- `stigmergy interactive --help`
- `stigmergy status`
- 等等

## 测试

```bash
# 测试默认交互式模式
stigmergy

# 应该自动进入交互式模式
```