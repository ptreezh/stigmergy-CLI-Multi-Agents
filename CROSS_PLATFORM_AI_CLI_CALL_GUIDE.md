# 跨平台AI CLI工具调用指南

本文档为所有AI CLI工具提供统一的跨平台调用方法说明。

## 🌐 可用AI工具

以下CLI工具已在系统中验证可以正常调用：

1. **claude** (版本 2.0.37) - Anthropic Claude CLI
2. **gemini** (版本 0.10.0) - Google Gemini CLI
3. **qwen** (版本 0.3.0) - Qwen CLI
4. **iflow** (版本 0.3.9) - iFlow CLI
5. **codebuddy** (版本 2.10.0) - CodeBuddy CLI
6. **codex** (版本 0.63.0) - Codex CLI
7. **copilot** (版本 0.0.350) - Copilot CLI

## 🛠️ 四种跨平台调用方法

所有AI CLI工具都支持以下四种跨工具调用方法：

### 1. 直接Shell调用

在任何AI CLI工具中，您可以直接使用感叹号(!)前缀来调用其他已安装的CLI工具：

```
# 调用其他CLI工具的基本语法
!<tool_name> [arguments...]

# 示例
!claude --version
!qwen "分析这段代码的性能问题"
!iflow create workflow my-project
!codebuddy review src/main.py
!codex generate "创建一个验证邮箱格式的函数"
!copilot suggest "如何优化这个数据库查询"
!gemini "解释量子计算的基本原理"
```

### 2. 专用调用脚本

我们为每个工具和每种操作系统都提供了专用的调用脚本：

#### Windows系统
```
# 使用批处理脚本
!<tool-name>-call.bat <target_tool> [arguments...]

# 示例
!claude-call.bat gemini --version
!gemini-call.bat qwen "分析代码性能"
```

#### Linux/macOS系统
```
# 使用Shell脚本
!./<tool-name>-call.sh <target_tool> [arguments...]

# 示例
!./claude-call.sh gemini --version
!./gemini-call.sh qwen "分析代码性能"
```

#### 所有平台通用
```
# 使用Python脚本
!python ai-call.py <target_tool> [arguments...]

# 示例
!python ai-call.py claude --version
!python ai-call.py qwen "分析代码性能"
```

### 3. 在新终端窗口中运行

如果您希望在新的终端窗口中运行CLI工具（推荐用于长时间运行的任务），可以使用以下命令：

#### Windows系统
```bash
# Windows CMD (在新窗口中运行)
!start cmd /k <tool_name> [arguments...]

# Windows PowerShell (在新窗口中运行)
!start powershell -NoExit -Command "<tool_name> [arguments...]"

# 示例
!start cmd /k claude --version
!start powershell -NoExit -Command "qwen '分析代码'"
```

#### Linux系统
```bash
# 在新终端窗口中运行
!gnome-terminal -- <tool_name> [arguments...]
!xterm -e "<tool_name> [arguments...]"

# 示例
!gnome-terminal -- claude --version
!xterm -e "qwen '分析代码'"
```

#### macOS系统
```bash
# 在新终端窗口中运行
!osascript -e 'tell app "Terminal" to do script "<tool_name> [arguments...]"'

# 示例
!osascript -e 'tell app "Terminal" to do script "claude --version"'
```

### 4. 使用Python subprocess模块

在Python代码中，您可以使用subprocess模块调用CLI工具：

```python
import subprocess

# 调用CLI工具的基本语法
result = subprocess.run(['<tool_name>', 'argument1', 'argument2'], 
                       capture_output=True, text=True, timeout=300)

# 示例
# 调用Claude CLI
result = subprocess.run(['claude', '--version'], capture_output=True, text=True)
print(f"Claude版本: {result.stdout}")

# 调用Qwen CLI处理任务
result = subprocess.run(['qwen', '分析这段代码'], capture_output=True, text=True)
print(f"Qwen响应: {result.stdout}")

# 调用Gemini CLI进行复杂任务
result = subprocess.run(['gemini', '解释量子计算的基本原理'], 
                       capture_output=True, text=True, timeout=300)
print(f"Gemini响应: {result.stdout}")
```

## 📋 各工具特定的调用脚本清单

### Windows批处理脚本 (.bat)
- `claude-call.bat`
- `gemini-call.bat`
- `qwen-call.bat`
- `iflow-call.bat`
- `codebuddy-call.bat`
- `codex-call.bat`
- `copilot-call.bat`

### Linux/macOS Shell脚本 (.sh)
- `claude-call.sh`
- `gemini-call.sh`
- `qwen-call.sh`
- `iflow-call.sh`
- `codebuddy-call.sh`
- `codex-call.sh`
- `copilot-call.sh`

### 跨平台Python脚本
- `ai-call.py` - 适用于所有操作系统的通用调用脚本

## ⚠️ 注意事项

1. 所有CLI工具都已正确安装在系统PATH中，可以直接调用
2. 调用时请注意各工具的命令语法和参数格式
3. 某些工具可能需要额外的配置或认证
4. 长时间运行的任务建议在新终端窗口中执行，以免阻塞当前会话
5. 使用Python subprocess时建议设置合理的超时时间
6. Shell脚本需要执行权限：`chmod +x *.sh`

##  troubleshoot 故障排除

如果遇到CLI工具调用问题，请检查:

1. 工具是否已正确安装: 
   - Windows: `where <tool_name>`
   - Linux/macOS: `which <tool_name>`
2. 工具版本: `<tool_name> --version`
3. 系统PATH环境变量是否包含CLI工具的安装路径
4. 是否有足够的权限运行该工具
5. 脚本文件是否有执行权限 (Linux/macOS)

## 📚 相关文档

- 各工具的详细文档请参考对应的.md文件
- 技术实现详情请参考 `src/adapters/` 目录下的适配器源代码