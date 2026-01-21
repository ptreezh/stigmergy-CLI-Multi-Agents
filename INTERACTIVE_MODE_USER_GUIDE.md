# Stigmergy 交互式模式使用指南

## 概述

Stigmergy 交互式模式允许您与 AI CLI 工具进行持续的对话，支持自动任务委托和 CLI 切换。

## 快速开始

### 启动交互式模式

```bash
# 方法 1: 使用 node 命令
node src/index.js interactive

# 方法 2: 使用 stigmergy 命令（需要全局安装）
stigmergy interactive

# 方法 3: 使用快捷命令
stigmergy i
```

### 基本使用

启动后，您将看到欢迎消息：

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

## 命令说明

### 发送消息

直接输入您的消息，系统会自动使用 qwen CLI 处理：

```
stigmergy> 你好，请介绍一下你自己
stigmergy> 帮我写一个 Python 函数
stigmergy> 解释一下什么是 React Hooks
```

### 可用命令

- **help**: 显示帮助信息
- **status**: 显示当前状态
- **exit**: 退出交互式模式

## CLI 工具配置

### 主 CLI: qwen

- 默认使用 qwen 处理所有任务
- 使用位置参数 + -y (YOLO mode)
- 自动批准所有操作

### 备用 CLI: iflow

- 当 qwen 失败时自动切换
- 使用 -p 参数传递任务
- 提供备用解决方案

### 自动 Fallback 机制

当 qwen CLI 失败时（退出码非 0、启动错误等），系统会自动切换到 iflow CLI 继续处理任务。

## 高级选项

### 命令行选项

```bash
# 设置 CLI 执行超时时间（毫秒）
stigmergy interactive --timeout 120000

# 禁用自动保存会话历史
stigmergy interactive --no-save

# 启用详细输出
stigmergy interactive --verbose
```

### 编程调用

```javascript
const { InteractiveModeController } = require('./src/interactive/InteractiveModeController');

const controller = new InteractiveModeController({
  autoEnterLoop: false,  // 不自动进入命令循环
  cliTimeout: 60000,     // 60秒超时
  autoSave: true         // 自动保存
});

await controller.start();

// 执行任务
const result = await controller.executeCommand({
  type: 'task',
  task: '你好，请介绍一下你自己'
});

console.log(result);

await controller.stop();
```

## 使用场景

### 场景 1: 代码开发

```
stigmergy> 帮我写一个 React 组件
stigmergy> 添加一些样式
stigmergy> 优化性能
```

### 场景 2: 问题解答

```
stigmergy> 解释一下 JavaScript 的闭包
stigmergy> 给我一些例子
stigmergy> 有什么注意事项？
```

### 场景 3: 文档编写

```
stigmergy> 帮我写一个 API 文档
stigmergy> 添加一些示例
stigmergy> 格式化一下
```

## 故障排除

### 问题: 命令未找到

如果 `stigmergy interactive` 命令未找到，请使用：

```bash
node src/index.js interactive
```

### 问题: CLI 执行超时

如果任务执行时间较长，可以增加超时时间：

```bash
stigmergy interactive --timeout 120000
```

### 问题: qwen CLI 失败

如果 qwen CLI 失败，系统会自动切换到 iflow CLI。您也可以检查 qwen CLI 是否正确安装：

```bash
stigmergy status
```

## 测试

运行测试脚本验证交互式模式：

```bash
# 运行集成测试
node test-integration-simple.js

# 运行完整测试
node test-complete-controller.js

# 运行 fallback 测试
node test-fallback.js
```

## 技术细节

### 执行流程

1. 用户输入消息
2. 系统解析命令
3. 使用 qwen CLI 执行任务
4. 捕获输出并显示
5. 如果失败，自动切换到 iflow CLI
6. 返回结果给用户

### 架构组件

- **InteractiveModeController**: 主控制器
- **CommandParser**: 命令解析器
- **SessionManager**: 会话管理器
- **ContextManager**: 上下文管理器

### 性能优化

- 使用 spawn 而非 exec，避免阻塞
- 实时输出显示
- 自动超时处理
- 资源自动清理

## 下一步

- 查看完整实现报告: `INTERACTIVE_MODE_IMPLEMENTATION_REPORT.md`
- 查看需求文档: `SPECKIT_INTERACTIVE_MODE_REQUIREMENTS.md`
- 查看设计文档: `INTERACTIVE_MODE_DESIGN.md`
- 查看实施计划: `INTERACTIVE_MODE_IMPLEMENTATION_PLAN.md`

## 贡献

欢迎提交问题和改进建议！