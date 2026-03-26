# Stigmergy CLI v1.2.6 Release Notes

## 🎉 新增功能

### 中英文双语钩子指令支持增强
- **英文指令模式**：
  - `ask <tool> to <task>` → 例如：`ask copilot to create a React component`
  - `use <tool> to <task>` → 例如：`use claude to write a Python function`
  - `call <tool> to <task>` → 例如：`call qwen to explain quantum computing`
  - `<tool>, <task>` → 例如：`gemini, please translate this text`

- **中文指令模式**：
  - `请用<工具>帮我<任务>` → 例如：`请用copilot帮我创建一个React组件`
  - `调用<工具>来<任务>` → 例如：`调用qwen来解释量子计算`
  - `用<工具>帮我<任务>` → 例如：`用claude帮我写一个Python函数`
  - `<工具>，<任务>` → 例如：`gemini，请翻译这段文字`
  - `让<工具><任务>` → 例如：`让codebuddy分析这段代码`

## 🛠 技术改进

### 钩子机制优化
- 修复了钩子部署中的正则表达式模式问题
- 增强了模式匹配的准确性
- 改进了跨CLI调用的参数处理

### 部署机制
- 钩子全局部署在 `~/.stigmergy/hooks/` 目录下
- 支持所有8个CLI工具的自动部署
- 无需在每个项目目录下重复配置

### 国际化支持
- 增强中文语言支持用于跨CLI通信
- 改进了ANSI编码兼容性

## 🚀 使用方法

### 直接路由调用（推荐）
```bash
stigmergy claude "write a Python function"
stigmergy copilot "create a React component"
stigmergy qwen "explain quantum computing"
```

### 钩子指令调用
在任何支持的CLI工具中输入：
```bash
# 英文指令
ask copilot to create a React component
use claude to write a Python function
call qwen to explain quantum computing
gemini, please translate this text

# 中文指令
请用copilot帮我创建一个React组件
调用qwen来解释量子计算
用claude帮我写一个Python函数
gemini，请翻译这段文字
让codebuddy分析这段代码
```

## 📊 兼容性

- **操作系统**：Windows、macOS、Linux
- **Node.js**：>=16.0.0
- **CLI工具**：所有主流AI CLI工具

## 📝 注意事项

1. 需要先安装对应的CLI工具
2. 部分工具可能需要认证配置
3. 钩子指令在CLI工具内部使用，直接路由通过Stigmergy CLI

---
*Stigmergy CLI - 让AI工具协同工作*