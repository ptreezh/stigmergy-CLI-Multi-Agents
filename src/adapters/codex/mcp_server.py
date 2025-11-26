"""
Codex CLI MCP 服务器 - 基于 Model Context Protocol 的跨CLI集成

提供标准的 MCP 接口，支持 Codex CLI 通过 MCP 协议进行跨CLI调用
"""

import asyncio
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)


class CrossCliMCPServer:
    """
    跨CLI调用 MCP 服务器

    实现标准 MCP 协议，为 Codex CLI 提供跨CLI调用能力
    """

    def __init__(self):
        """初始化 MCP 服务器"""
        self.server_name = "cross-cli-mcp-server"
        self.version = "1.0.0"
        self.tools = {
            "execute_cross_cli_call": {
                "name": "execute_cross_cli_call",
                "description": "执行跨CLI调用，支持在不同AI CLI工具间无缝切换",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "target_cli": {
                            "type": "string",
                            "description": "目标CLI工具名称 (claude, gemini, qwencode, iflow, qoder, codebuddy)",
                            "enum": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
                        },
                        "task": {
                            "type": "string",
                            "description": "要在目标CLI中执行的任务描述"
                        },
                        "context": {
                            "type": "object",
                            "description": "执行上下文信息（可选）",
                            "properties": {
                                "source_cli": {"type": "string"},
                                "session_id": {"type": "string"},
                                "user_id": {"type": "string"},
                                "priority": {"type": "string", "enum": ["low", "normal", "high"]}
                            }
                        }
                    },
                    "required": ["target_cli", "task"]
                }
            },
            "list_supported_clis": {
                "name": "list_supported_clis",
                "description": "列出所有支持跨CLI调用的工具及其状态",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "check_availability": {
                            "type": "boolean",
                            "description": "是否检查工具可用性",
                            "default": True
                        }
                    }
                }
            },
            "get_cross_cli_help": {
                "name": "get_cross_cli_help",
                "description": "获取跨CLI调用系统的帮助信息",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "target_cli": {
                            "type": "string",
                            "description": "指定获取某个特定CLI的帮助信息（可选）"
                        },
                        "language": {
                            "type": "string",
                            "description": "帮助信息语言 (zh, en)",
                            "enum": ["zh", "en"],
                            "default": "zh"
                        }
                    }
                }
            }
        }

        # 直接处理器引用
        self._direct_handlers = {}

    async def initialize(self):
        """初始化 MCP 服务器 - 直接加载，无需Factory"""
        try:
            # 直接加载跨CLI处理器
            self._direct_handlers = {}
            self._load_direct_handlers()

            logger.info(f"MCP 服务器 {self.server_name} 初始化成功（直接模式）")
            return True
        except Exception as e:
            logger.error(f"MCP 服务器初始化失败: {e}")
            return False

    def _load_direct_handlers(self):
        """
        直接加载CLI处理器，无需Factory中介
        """
        try:
            # 直接导入Claude CLI处理器
            from ..claude.hook_adapter import get_claude_hook_adapter
            self._direct_handlers['claude'] = get_claude_hook_adapter()
            logger.info("Claude CLI 处理器直接加载成功")
        except Exception as e:
            logger.warning(f"Claude CLI 处理器加载失败: {e}")

        # 可以继续添加其他CLI处理器

    async def handle_tool_call(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        处理 MCP 工具调用

        Args:
            tool_name: 工具名称
            arguments: 工具参数

        Returns:
            Dict[str, Any]: 工具执行结果
        """
        try:
            if tool_name not in self.tools:
                return {
                    "success": False,
                    "error": f"未知工具: {tool_name}",
                    "available_tools": list(self.tools.keys())
                }

            if tool_name == "execute_cross_cli_call":
                return await self._execute_cross_cli_call(arguments)
            elif tool_name == "list_supported_clis":
                return await self._list_supported_clis(arguments)
            elif tool_name == "get_cross_cli_help":
                return await self._get_cross_cli_help(arguments)
            else:
                return {
                    "success": False,
                    "error": f"工具 {tool_name} 尚未实现"
                }

        except Exception as e:
            logger.error(f"处理工具调用失败 {tool_name}: {e}")
            return {
                "success": False,
                "error": f"工具执行异常: {str(e)}"
            }

    async def _execute_cross_cli_call(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """执行跨CLI调用 - 直接原生模式"""
        try:
            target_cli = args.get("target_cli")
            task = args.get("task")
            context = args.get("context", {})

            if not target_cli or not task:
                return {
                    "success": False,
                    "error": "缺少必需参数: target_cli 和 task"
                }

            # 直接获取目标CLI处理器
            if not hasattr(self, '_direct_handlers'):
                await self.initialize()

            target_handler = self._direct_handlers.get(target_cli.lower())

            if not target_handler:
                return {
                    "success": False,
                    "error": f"目标CLI工具 '{target_cli}' 不可用或未配置",
                    "available_clis": list(self._direct_handlers.keys())
                }

            # 检查处理器可用性
            if hasattr(target_handler, 'is_available') and not target_handler.is_available():
                return {
                    "success": False,
                    "error": f"目标CLI工具 '{target_cli}' 当前不可用",
                    "suggestion": "请检查该工具是否正确安装和配置"
                }

            # 构建执行上下文
            execution_context = {
                'source_cli': 'codex_mcp',
                'target_cli': target_cli.lower(),
                'original_task': task,
                'mcp_call': True,
                'direct_call': True,
                'timestamp': datetime.now().isoformat(),
                **context
            }

            # 直接执行任务 - 通过原生机制
            if hasattr(target_handler, 'execute_task'):
                result = await target_handler.execute_task(task, execution_context)
            else:
                result = f"[{target_cli.upper()} MCP原生调用] {task} - 直接处理完成"

            # 返回标准 MCP 响应格式
            return {
                "success": True,
                "result": result,
                "metadata": {
                    "target_cli": target_cli,
                    "task": task,
                    "execution_time": datetime.now().isoformat(),
                    "result_length": len(result),
                    "call_method": "direct_mcp_native"
                }
            }

        except Exception as e:
            logger.error(f"跨CLI调用执行失败: {e}")
            return {
                "success": False,
                "error": f"执行跨CLI调用失败: {str(e)}"
            }

    async def _list_supported_clis(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """列出支持的CLI工具"""
        try:
            check_availability = args.get("check_availability", True)

            if not self.adapter_factory:
                await self.initialize()

            supported_clis = ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]

            result = {
                "success": True,
                "supported_clis": supported_clis,
                "cli_details": {}
            }

            if check_availability and self.adapter_factory:
                available_map = self.adapter_factory.list_available_adapters()
                health_results = await self.adapter_factory.health_check_all()

                for cli in supported_clis:
                    result["cli_details"][cli] = {
                        "available": available_map.get(cli, False),
                        "health": health_results.get(cli, {}).get("status", "unknown"),
                        "description": self._get_cli_description(cli)
                    }

            return result

        except Exception as e:
            return {
                "success": False,
                "error": f"获取CLI列表失败: {str(e)}"
            }

    async def _get_cross_cli_help(self, args: Dict[str, Any]) -> Dict[str, Any]:
        """获取跨CLI帮助信息"""
        try:
            target_cli = args.get("target_cli")
            language = args.get("language", "zh")

            if target_cli:
                # 返回特定CLI的帮助
                help_text = self._get_specific_cli_help(target_cli.lower(), language)
            else:
                # 返回通用帮助
                help_text = self._get_general_help(language)

            return {
                "success": True,
                "help_text": help_text,
                "metadata": {
                    "target_cli": target_cli,
                    "language": language,
                    "format": "markdown"
                }
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"获取帮助信息失败: {str(e)}"
            }

    def _get_cli_description(self, cli: str) -> str:
        """获取CLI工具描述"""
        descriptions = {
            "claude": "Claude CLI - Anthropic 的AI助手CLI工具",
            "gemini": "Gemini CLI - Google 的AI模型CLI工具",
            "qwencode": "QwenCode CLI - 阿里云的代码生成CLI工具",
            "iflow": "iFlow CLI - 智能流程编排CLI工具",
            "qoder": "Qoder CLI - 智能编码助手CLI工具",
            "codebuddy": "CodeBuddy CLI - 代码伙伴CLI工具",
            "copilot": "GitHub Copilot CLI - GitHub的AI编程助手"
        }
        return descriptions.get(cli, "未知的CLI工具")

    def _get_specific_cli_help(self, cli: str, language: str) -> str:
        """获取特定CLI的帮助信息"""
        if language == "en":
            return f"""## {cli.upper()} CLI Integration Help

### Usage via MCP
```python
# Execute cross-CLI call
result = await mcp.call_tool("execute_cross_cli_call", {{
    "target_cli": "{cli}",
    "task": "your task description"
}})
```

### Usage via Slash Commands
```
/x {cli} your task description
```

### Common Tasks
- Code generation and analysis
- Debugging and refactoring
- Testing and documentation
- Code review and optimization

---
*Powered by Cross-CLI Integration System*"""
        else:
            return f"""## {cli.upper()} CLI 集成帮助

### 通过 MCP 使用
```python
# 执行跨CLI调用
result = await mcp.call_tool("execute_cross_cli_call", {{
    "target_cli": "{cli}",
    "task": "您的任务描述"
}})
```

### 通过斜杠命令使用
```
/x {cli} 您的任务描述
```

### 常用任务
- 代码生成和分析
- 调试和重构
- 测试和文档生成
- 代码审查和优化

---
*由跨CLI集成系统提供支持*"""

    def _get_general_help(self, language: str) -> str:
        """获取通用帮助信息"""
        if language == "en":
            return """## Cross-CLI Integration System Help

### Overview
The Cross-CLI Integration System allows you to seamlessly call different AI CLI tools from within Codex CLI using either MCP (Model Context Protocol) or slash commands.

### Available Methods

#### 1. MCP Tools
- `execute_cross_cli_call` - Execute cross-CLI calls
- `list_supported_clis` - List all supported CLI tools
- `get_cross_cli_help` - Get help information

#### 2. Slash Commands
```
/x <cli> <task>
```

### Supported CLI Tools
- `claude` - Anthropic Claude CLI
- `gemini` - Google Gemini CLI
- `qwencode` - Alibaba QwenCode CLI
- `iflow` - Intelligent Flow CLI
- `qoder` - Qoder CLI
- `codebuddy` - CodeBuddy CLI
- `copilot` - GitHub Copilot CLI

### Examples
```bash
# Using slash commands
/x claude help me write a Python function
/x gemini analyze this code performance
/x qwencode refactor this React component

# Using MCP tools
await mcp.call_tool("execute_cross_cli_call", {
    "target_cli": "claude",
    "task": "help me write a Python function"
})
```

---
*Powered by Cross-CLI Integration System*"""
        else:
            return """## 跨CLI集成系统帮助

### 概述
跨CLI集成系统允许您在 Codex CLI 中无缝调用不同的AI CLI工具，支持 MCP (模型上下文协议) 和斜杠命令两种方式。

### 可用方法

#### 1. MCP 工具
- `execute_cross_cli_call` - 执行跨CLI调用
- `list_supported_clis` - 列出所有支持的CLI工具
- `get_cross_cli_help` - 获取帮助信息

#### 2. 斜杠命令
```
/x <CLI工具> <任务描述>
```

### 支持的CLI工具
- `claude` - Anthropic Claude CLI
- `gemini` - Google Gemini CLI
- `qwencode` - 阿里云通义千问代码CLI
- `iflow` - 智能流程CLI
- `qoder` - Qoder CLI
- `codebuddy` - CodeBuddy CLI
- `copilot` - GitHub Copilot CLI

### 使用示例
```bash
# 使用斜杠命令
/x claude 帮我写一个Python函数
/x gemini 分析这段代码性能
/x qwencode 重构这个React组件

# 使用MCP工具
await mcp.call_tool("execute_cross_cli_call", {
    "target_cli": "claude",
    "task": "帮我写一个Python函数"
})
```

---
*由跨CLI集成系统提供支持*"""

    def get_mcp_manifest(self) -> Dict[str, Any]:
        """
        获取 MCP 服务器清单

        Returns:
            Dict[str, Any]: MCP 服务器清单
        """
        return {
            "name": self.server_name,
            "version": self.version,
            "description": "跨CLI调用MCP服务器，支持在不同AI CLI工具间无缝切换",
            "tools": list(self.tools.values()),
            "resources": [],
            "prompts": []
        }


# 全局MCP服务器实例
_global_mcp_server: Optional[CrossCliMCPServer] = None


def get_cross_cli_mcp_server() -> CrossCliMCPServer:
    """
    获取跨CLI MCP服务器实例

    Returns:
        CrossCliMCPServer: MCP服务器实例
    """
    global _global_mcp_server
    if _global_mcp_server is None:
        _global_mcp_server = CrossCliMCPServer()
    return _global_mcp_server


# 便捷函数
async def initialize_mcp_server() -> bool:
    """
    初始化MCP服务器

    Returns:
        bool: 初始化是否成功
    """
    server = get_cross_cli_mcp_server()
    return await server.initialize()