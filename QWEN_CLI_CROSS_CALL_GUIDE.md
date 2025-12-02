# Qwen CLI 跨工具调用指南

本文档说明如何在Qwen CLI中通过Shell调用其他已安装的CLI工具。

## 已安装的CLI工具

以下CLI工具已在您的系统中安装并可直接调用:

1. **claude** (版本 2.0.37) - Anthropic Claude CLI
2. **gemini** (版本 0.10.0) - Google Gemini CLI
3. **iflow** (版本 0.3.9) - iFlow CLI
4. **codebuddy** (版本 2.10.0) - CodeBuddy CLI
5. **codex** (版本 0.63.0) - Codex CLI
6. **copilot** (版本 0.0.350) - Copilot CLI

## 通过Shell调用CLI工具的方法

### 方法1: 直接使用Shell命令

您可以在Qwen中使用以下语法直接调用其他CLI工具:

```bash
# 调用Claude CLI
!claude --version

# 调用Gemini CLI
!gemini "请分析这段代码的性能问题"

# 调用iFlow CLI创建工作流
!iflow create workflow my-workflow

# 调用CodeBuddy进行代码审查
!codebuddy review src/main.js

# 调用Codex生成代码
!codex generate "创建一个Python函数来计算斐波那契数列"

# 调用Copilot获取建议
!copilot suggest "如何优化这个数据库查询"
```

### 方法2: 使用Python subprocess模块

在Python代码中，您可以使用subprocess模块调用CLI工具:

```python
import subprocess

# 调用Claude CLI获取版本信息
result = subprocess.run(['claude', '--version'], capture_output=True, text=True)
print(f"Claude版本: {result.stdout}")

# 调用Gemini CLI处理任务
result = subprocess.run(['gemini', '分析这段代码'], capture_output=True, text=True)
print(f"Gemini响应: {result.stdout}")
```

### 方法3: 使用批处理脚本 (Windows)

在Windows系统中，您可以使用我们提供的`qwen-call.bat`脚本来调用CLI工具:

```bash
# 调用Claude CLI
!qwen-call claude --version

# 调用Gemini CLI
!qwen-call gemini "请分析这段代码的性能问题"
```

## 在新终端窗口中运行CLI工具

如果您希望在新的终端窗口中运行CLI工具，可以使用以下命令:

### Windows (CMD)
```bash
# 在新CMD窗口中运行Claude
!start cmd /k claude --version

# 在新CMD窗口中运行Gemini
!start cmd /k gemini "分析代码"
```

### Windows (PowerShell)
```bash
# 在新PowerShell窗口中运行Claude
!start powershell -NoExit -Command "claude --version"

# 在新PowerShell窗口中运行Gemini
!start powershell -NoExit -Command "gemini '分析代码'"
```

## 注意事项

1. 所有CLI工具都已正确安装在系统PATH中，可以直接调用
2. 调用时请注意各工具的命令语法和参数格式
3. 某些工具可能需要额外的配置或认证
4. 长时间运行的任务建议在新终端窗口中执行，以免阻塞当前会话

## 故障排除

如果遇到CLI工具调用问题，请检查:

1. 工具是否已正确安装: `where <tool_name>`
2. 工具版本: `<tool_name> --version`
3. 系统PATH环境变量是否包含CLI工具的安装路径