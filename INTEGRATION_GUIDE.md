# AI CLI Router 集成指南

> 📖 详细说明如何将 AI CLI Router 集成到各个AI CLI工具中

## 🎯 集成原理

AI CLI Router **不是独立的CLI工具**，而是一个**增强系统**，通过以下方式工作：

1. **钩子/扩展集成** - 在各个AI CLI工具的钩子系统中注册
2. **`/init` 指令增强** - 增强 `init` 斜杠指令的功能
3. **项目记忆生成** - 自动生成包含AI协作感知的项目记忆文档

## 🔧 集成步骤

### 步骤1: 安装AI CLI Router

```bash
# 克隆项目
git clone https://github.com/ai-cli-router/smart-cli-router.git
cd smart-cli-router

# 安装Python包
pip install -e .
```

### 步骤2: 自动部署（推荐）

```bash
# 一键部署到所有可用的AI CLI工具
python deploy.py deploy

# 检查部署状态
python deploy.py status
```

### 步骤3: 手动集成（可选）

如果自动部署失败，可以手动集成到特定CLI工具。

## 🛠️ 各CLI工具的具体集成方法

### Claude CLI 集成

#### 方法1: 使用Hook系统

```python
# 在Claude CLI的钩子配置中添加
{
  "hooks": {
    "user_prompt_submit": {
      "enabled": true,
      "script": "python -c \"import sys; sys.path.insert(0, '/path/to/ai-cli-router'); from src.core.cli_hook_integration import ClaudeHookIntegration; import asyncio; result = asyncio.run(ClaudeHookIntegration.on_user_prompt_submit({'prompt': '$PROMPT'})); print(result) if result else None\"",
      "timeout": 30
    }
  }
}
```

#### 方法2: 代码集成

```python
# 在Claude CLI的钩子处理代码中
from src.core.cli_hook_integration import ClaudeHookIntegration

class ClaudeHookHandler:
    def __init__(self):
        self.ai_integration = ClaudeHookIntegration()

    async def on_user_prompt_submit(self, context):
        """处理用户提示词提交"""
        user_input = context.get("prompt", "").strip()

        if user_input == "/init":
            return await self.ai_integration.on_user_prompt_submit(context)

        return None
```

### Gemini CLI 集成

#### 方法1: 使用Extension系统

```python
# 在Gemini CLI的扩展配置中添加
{
  "extensions": {
    "ai_cli_router": {
      "name": "AI CLI Router",
      "version": "1.0.0",
      "enabled": true,
      "hooks": ["on_prompt_submit"],
      "handler": "src.core.cli_hook_integration:GeminiExtensionIntegration"
    }
  }
}
```

#### 方法2: 装饰器集成

```python
from src.core.cli_hook_integration import GeminiExtensionIntegration
from gemini_cli import extend

@extend('preprocessor')
async def ai_cli_router_preprocessor(context):
    """AI CLI Router 预处理器"""
    return await GeminiExtensionIntegration.on_prompt_submit(context)
```

### QwenCode CLI 集成

#### 方法1: 使用插件继承

```python
# 创建继承插件
from src.core.cli_hook_integration import QwenCodeInheritanceIntegration
from qwencode_cli import BaseQwenCodePlugin

class AICLIRouterPlugin(BaseQwenCodePlugin):
    def __init__(self):
        super().__init__()
        self.integration = QwenCodeInheritanceIntegration()

    async def on_prompt_received(self, context):
        """处理提示词接收"""
        prompt = context.get("prompt", "").strip()

        if prompt == "/init":
            return await self.integration.on_prompt_received(context)

        return None
```

#### 方法2: 插件配置

```json
{
  "plugins": {
    "ai_cli_router": {
      "name": "AI CLI Router Plugin",
      "class": "AICLIRouterPlugin",
      "enabled": true,
      "hooks": ["on_prompt_received"]
    }
  }
}
```

### iFlow CLI 集成

#### 方法1: 使用工作流钩子

```yaml
# 在 iFlow 的 hooks.yml 中配置
hooks:
  UserPromptSubmit:
    - name: "ai_cli_router_init"
      enabled: true
      script: "python -c \"import sys; sys.path.insert(0, '/path/to/ai-cli-router'); from src.core.cli_hook_integration import IFlowWorkflowIntegration; import asyncio; result = asyncio.run(IFlowWorkflowIntegration.on_user_prompt_submit({'prompt': '$PROMPT'})); print(result) if result else None\""
      pattern: ".*init.*"
      timeout: 30
```

#### 方法2: Python集成

```python
from src.core.cli_hook_integration import IFlowWorkflowIntegration

class IFLOWHookHandler:
    def __init__(self):
        self.ai_integration = IFlowWorkflowIntegration()

    async def on_user_prompt_submit(self, context):
        return await self.ai_integration.on_user_prompt_submit(context)
```

### Qoder CLI 集成

```python
from src.core.cli_hook_integration import QoderNotificationIntegration

class QoderHookHandler:
    def __init__(self):
        self.ai_integration = QoderNotificationIntegration()

    async def on_command_execution(self, context):
        command = context.get("command", "").strip()

        if command == "/init":
            return await self.ai_integration.on_command_execution(context)

        return None
```

### CodeBuddy CLI 集成

```python
from src.core.cli_hook_integration import CodeBuddySkillsIntegration

class CodeBuddySkillHandler:
    def __init__(self):
        self.ai_integration = CodeBuddySkillsIntegration()

    async def on_skill_activation(self, context):
        skill_name = context.get("skill_name", "")

        if skill_name == "ai_cli_init":
            return await self.ai_integration.on_skill_activation(context)

        return None
```

### Copilot CLI 集成

```python
from src.core.cli_hook_integration import CopilotMCPIntegration

class CopilotMCPHandler:
    def __init__(self):
        self.ai_integration = CopilotMCPIntegration()

    async def on_agent_execution(self, context):
        request = context.get("request", "").strip()

        if request == "/init":
            return await self.ai_integration.on_agent_execution(context)

        return None
```

### Codex CLI 集成

```python
from src.core.cli_hook_integration import CodexSlashIntegration

class CodexSlashHandler:
    def __init__(self):
        self.ai_integration = CodexSlashIntegration()

    async def on_slash_command(self, context):
        command = context.get("command", "")
        args = context.get("args", [])

        if command == "init" and not args:
            return await self.ai_integration.on_slash_command(context)

        return None
```

## 📝 验证集成

### 验证方法

1. **启动任意AI CLI工具**
   ```bash
   claude-cli  # 或 gemini-cli, qwencode-cli 等
   ```

2. **执行 `/init` 指令**
   ```
   > /init
   ```

3. **检查输出**
   - 应该看到AI环境扫描结果
   - 应该生成包含协作感知的MD文档
   - 应该显示可用的其他AI工具

4. **检查生成的文档**
   ```bash
   ls *.md
   # 应该看到 claude.md, gemini.md, qwen.md 等文件
   ```

5. **测试跨AI协作**
   ```
   > 请用gemini帮我分析这段代码的性能
   ```

## 🔧 故障排除

### 常见问题

#### 1. 部署失败

**症状**: `python deploy.py deploy` 失败

**解决方案**:
```bash
# 检查Python路径
python --version

# 检查依赖
pip install -r requirements.txt

# 强制重新部署
python deploy.py deploy --force
```

#### 2. `/init` 指令无响应

**症状**: 执行 `/init` 没有任何输出

**解决方案**:
1. 检查钩子配置是否正确
2. 检查Python脚本路径
3. 查看CLI工具的日志文件

#### 3. 协作功能不工作

**症状**: 无法识别跨AI工具调用

**解决方案**:
1. 确认所有AI工具都已部署
2. 检查协作协议格式
3. 查看项目配置文件

### 调试方法

#### 启用详细日志

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

#### 检查配置文件

```bash
# Claude CLI
cat ~/.config/claude/hooks.json

# Gemini CLI
cat ~/.config/gemini/extensions.json

# QwenCode CLI
cat ~/.config/qwencode/plugins.json
```

#### 查看AI环境状态

```python
from src.core.ai_environment_scanner import AIEnvironmentScanner

async def check_environment():
    scanner = AIEnvironmentScanner()
    env = await scanner.scan_ai_environment(".")
    print(f"可用工具: {list(env.available_clis.keys())}")

import asyncio
asyncio.run(check_environment())
```

## 🚀 高级配置

### 自定义协作协议

```python
# 在集成代码中自定义协议
custom_protocols = {
    "chinese": [
        "让{tool}处理{task}",
        "通过{tool}执行{task}",
        "启动{tool}工作流{task}"
    ],
    "english": [
        "have {tool} {task}",
        "start {tool} workflow for {task}",
        "get {tool} to {task}"
    ]
}
```

### 自定义项目模板

```python
from src.core.md_generator import MDDocumentGenerator

class CustomMDDocumentGenerator(MDDocumentGenerator):
    async def generate_custom_section(self, cli_name, ai_environment):
        # 自定义文档章节
        return "## 自定义章节\n\n这里是自定义内容..."
```

## 📚 更多资源

- [API文档](docs/api.md)
- [配置参考](docs/configuration.md)
- [示例项目](examples/)
- [社区支持](https://github.com/ai-cli-router/discussions)

---

**AI CLI Router** - 让AI工具智能协作，创造更大价值！ 🚀