# Stigmergy CLI v1.2.7 Release Notes

## 🛠 技术改进

### LanguagePatternManager 路径和构造函数修复
- 修复了部署的钩子中 LanguagePatternManager 模块路径查找问题
- 修复了 LanguagePatternManager 构造函数的多种导入场景处理
- 增强了模块导入的健壮性，支持多种导入方式（默认导出、命名导出等）

### 钩子部署机制优化
- 改进了 HookDeploymentManager 中的多路径查找逻辑
- 优化了部署钩子的错误处理和回退机制
- 修复了模块实例化逻辑，确保在各种环境下的兼容性

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