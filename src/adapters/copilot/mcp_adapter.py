"""
CopilotCLI MCP适配器 - 基于Model Context Protocol (MCP)的原生集成

这是TDD驱动的实现，基于test_copilot_adapter.py中的测试用例
完全符合项目约束条件：
- 使用Copilot CLI官方MCP服务器机制
- 不改变CLI启动和使用方式
- 不依赖包装器
- 完全无损扩展
"""

import os
import json
import logging
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime
from pathlib import Path

from ...core.parser import NaturalLanguageParser

logger = logging.getLogger(__name__)


class CopilotMCPContext:
    """Copilot CLI MCP上下文模拟类"""

    def __init__(self, prompt: str = "", metadata: Optional[Dict] = None):
        self.prompt = prompt
        self.metadata = metadata or {}
        self.session_id = self.metadata.get('session_id', 'unknown')
        self.user_id = self.metadata.get('user_id', 'unknown')
        self.timestamp = datetime.now()
        self.tool_permissions = self.metadata.get('tool_permissions', {})


class CopilotMCPAdapter:
    """
    Copilot CLI MCP适配器

    通过Copilot CLI官方MCP服务器系统实现跨CLI调用功能。
    这是完全基于原生MCP机制的无损扩展实现。

    MCP集成机制:
    - 通过自定义MCP服务器注册到Copilot CLI
    - 使用MCP工具调用接口处理跨CLI请求
    - 利用Copilot的权限管理系统确保安全
    - 支持并行工具执行和异步任务委托
    """

    def __init__(self, cli_name: str = "copilot"):
        """
        初始化Copilot MCP适配器

        Args:
            cli_name: CLI工具名称，默认为"copilot"
        """
        super().__init__(cli_name)

        # MCP相关配置
        self.copilot_config_dir = os.path.expanduser("~/.copilot")
        self.mcp_config_file = os.path.join(self.copilot_config_dir, "mcp-config.json")
        self.custom_agents_dir = os.path.join(self.copilot_config_dir, "agents")
        self.mcp_server_registered = False

        # 跨CLI MCP服务器配置
        self.cross_cli_mcp_server = {
            "name": "cross-cli-adapter",
            "description": "Cross-CLI integration adapter for universal AI tool collaboration",
            "version": "1.0.0",
            "command": "python",
            "args": [
                "-m", "src.adapters.copilot.mcp_server"
            ],
            "env": {
                "CROSS_CLI_ADAPTER": "enabled",
                "LOG_LEVEL": "INFO"
            }
        }

        # 统计信息
        self.mcp_calls_count = 0
        self.cross_cli_calls_count = 0
        self.processed_requests: List[Dict[str, Any]] = []
        self.agent_executions: List[Dict[str, Any]] = []

        # 解析器
        self.parser = NaturalLanguageParser()

        # 跨CLI适配器访问 - 使用新的注册机制
        from .. import get_cross_cli_adapter
        self.get_adapter = get_cross_cli_adapter

    async def initialize(self) -> bool:
        """
        初始化适配器

        Returns:
            bool: 初始化是否成功
        """
        try:
            # 1. 检查Copilot CLI环境
            if not self._check_copilot_environment():
                logger.error("Copilot CLI环境检查失败")
                return False

            # 2. 注册MCP服务器
            if not await self._register_mcp_server():
                logger.error("MCP服务器注册失败")
                return False

            # 3. 创建自定义代理
            await self._create_custom_agents()

            # 4. 确保配置目录存在
            await self._ensure_config_directory()

            self.mcp_server_registered = True
            logger.info("Copilot MCP适配器初始化成功")
            return True

        except Exception as e:
            logger.error(f"初始化Copilot MCP适配器失败: {e}")
            self.record_error()
            return False

    async def _register_mcp_server(self) -> bool:
        """
        注册MCP服务器到Copilot CLI

        Returns:
            bool: 注册是否成功
        """
        try:
            # 读取现有MCP配置
            mcp_config = self._load_mcp_config()

            # 添加我们的跨CLI MCP服务器
            mcp_servers = mcp_config.get('mcpServers', {})

            # 检查是否已存在
            if self.cross_cli_mcp_server['name'] not in mcp_servers:
                mcp_servers[self.cross_cli_mcp_server['name']] = {
                    "command": self.cross_cli_mcp_server['command'],
                    "args": self.cross_cli_mcp_server['args'],
                    "env": self.cross_cli_mcp_server['env']
                }

                mcp_config['mcpServers'] = mcp_servers

                # 保存配置
                await self._save_mcp_config(mcp_config)
                logger.info(f"注册MCP服务器: {self.cross_cli_mcp_server['name']}")
            else:
                logger.info("MCP服务器已存在，跳过注册")

            return True

        except Exception as e:
            logger.error(f"注册MCP服务器失败: {e}")
            return False

    def _load_mcp_config(self) -> Dict[str, Any]:
        """
        加载MCP配置

        Returns:
            Dict[str, Any]: MCP配置
        """
        if os.path.exists(self.mcp_config_file):
            try:
                with open(self.mcp_config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                logger.warning(f"加载MCP配置失败，使用默认配置: {e}")

        # 返回默认配置
        return {
            "mcpServers": {}
        }

    async def _save_mcp_config(self, config: Dict[str, Any]) -> bool:
        """
        保存MCP配置

        Args:
            config: MCP配置

        Returns:
            bool: 保存是否成功
        """
        try:
            os.makedirs(os.path.dirname(self.mcp_config_file), exist_ok=True)

            with open(self.mcp_config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            logger.info(f"保存MCP配置到: {self.mcp_config_file}")
            return True

        except Exception as e:
            logger.error(f"保存MCP配置失败: {e}")
            return False

    async def _create_custom_agents(self) -> bool:
        """
        创建自定义代理用于跨CLI调用

        Returns:
            bool: 创建是否成功
        """
        try:
            os.makedirs(self.custom_agents_dir, exist_ok=True)

            # 创建跨CLI调用代理
            cross_cli_agent = {
                "name": "cross-cli-caller",
                "description": "Agent for handling cross-CLI tool calls and collaboration",
                "version": "1.0.0",
                "instructions": """You are a cross-CLI integration agent that helps users collaborate between different AI CLI tools.

When you detect a request to use another CLI tool (like Claude, Gemini, QwenCode, etc.):
1. Parse the target CLI and task from the user's request
2. Execute the task using the appropriate CLI tool
3. Return the results in a clear, structured format

Support both Chinese and English collaboration patterns:
- "请用{CLI}帮我{task}" -> Use {CLI} to help with {task}
- "use {CLI} to {task}" -> Execute {task} with {CLI}

Always maintain the original intent and context of the user's request.""",
                "tools": [
                    "cross_cli_execute",
                    "get_available_clis",
                    "check_cli_status"
                ],
                "permissions": {
                    "allowShellExecution": True,
                    "allowNetworkAccess": True,
                    "allowedPaths": ["*"]
                }
            }

            agent_file = os.path.join(self.custom_agents_dir, "cross-cli-caller.json")
            with open(agent_file, 'w', encoding='utf-8') as f:
                json.dump(cross_cli_agent, f, indent=2, ensure_ascii=False)

            logger.info(f"创建自定义代理: {cross_cli_agent['name']}")
            return True

        except Exception as e:
            logger.error(f"创建自定义代理失败: {e}")
            return False

    async def _ensure_config_directory(self) -> bool:
        """
        确保配置目录存在

        Returns:
            bool: 创建是否成功
        """
        try:
            directories = [
                self.copilot_config_dir,
                self.custom_agents_dir,
                os.path.join(self.copilot_config_dir, "sessions"),
                os.path.join(self.copilot_config_dir, "logs")
            ]

            for directory in directories:
                os.makedirs(directory, exist_ok=True)

            logger.info(f"配置目录已准备: {self.copilot_config_dir}")
            return True

        except Exception as e:
            logger.error(f"创建配置目录失败: {e}")
            return False

    def _check_copilot_environment(self) -> bool:
        """
        检查Copilot CLI环境

        Returns:
            bool: 环境是否可用
        """
        try:
            # 检查配置目录
            if not os.path.exists(self.copilot_config_dir):
                logger.warning(f"Copilot配置目录不存在: {self.copilot_config_dir}")
                return False

            # 检查是否有copilot命令（简化检查）
            # 在实际环境中，这里应该检查copilot命令是否可用
            return True

        except Exception as e:
            logger.error(f"检查Copilot环境失败: {e}")
            return False

    async def on_mcp_tool_call(self, tool_name: str, arguments: Dict[str, Any], context: CopilotMCPContext) -> Optional[str]:
        """
        处理MCP工具调用

        这是核心Hook，用于检测和执行跨CLI调用。

        Args:
            tool_name: 工具名称
            arguments: 工具参数
            context: MCP上下文

        Returns:
            Optional[str]: 处理结果
        """
        try:
            self.mcp_calls_count += 1

            # 记录请求
            request_record = {
                'tool_name': tool_name,
                'arguments': arguments,
                'context': context.__dict__,
                'timestamp': datetime.now().isoformat()
            }
            self.processed_requests.append(request_record)

            if tool_name == "cross_cli_execute":
                return await self._handle_cross_cli_execute(arguments, context)
            elif tool_name == "get_available_clis":
                return await self._handle_get_available_clis(context)
            elif tool_name == "check_cli_status":
                return await self._handle_check_cli_status(arguments, context)

            return None

        except Exception as e:
            logger.error(f"MCP工具调用处理失败: {tool_name}, {e}")
            self.record_error()
            return None

    async def _handle_cross_cli_execute(self, arguments: Dict[str, Any], context: CopilotMCPContext) -> str:
        """
        处理跨CLI执行请求

        Args:
            arguments: 执行参数，包含target_cli和task
            context: MCP上下文

        Returns:
            str: 执行结果
        """
        target_cli = arguments.get('target_cli')
        task = arguments.get('task')

        if not target_cli or not task:
            return self._format_error_result(
                target_cli or "unknown",
                task or "unknown",
                "缺少必要参数：target_cli和task"
            )

        # 避免自我调用
        if target_cli.lower() == self.cli_name:
            return self._format_error_result(
                target_cli,
                task,
                "不能自我调用，请使用其他CLI工具"
            )

        try:
            logger.info(f"执行跨CLI调用: {target_cli} -> {task}")

            # 获取目标CLI适配器
            target_adapter = self.get_adapter(target_cli)

            if not target_adapter:
                logger.warning(f"目标CLI适配器不可用: {target_cli}")
                return self._format_error_result(
                    target_cli,
                    task,
                    f"目标CLI工具 '{target_cli}' 不可用或未安装"
                )

            if not target_adapter.is_available():
                logger.warning(f"目标CLI工具不可用: {target_cli}")
                return self._format_error_result(
                    target_cli,
                    task,
                    f"目标CLI工具 '{target_cli}' 当前不可用"
                )

            # 构建执行上下文
            execution_context = {
                'source_cli': self.cli_name,
                'target_cli': target_cli,
                'original_task': task,
                'mcp_context': context.__dict__,
                'timestamp': datetime.now().isoformat()
            }

            # 执行任务
            result = await target_adapter.execute_task(task, execution_context)

            # 记录成功的跨CLI调用
            self.cross_cli_calls_count += 1
            self.processed_requests.append({
                'type': 'cross_cli_execution',
                'target_cli': target_cli,
                'task': task,
                'success': True,
                'result_length': len(result),
                'timestamp': datetime.now().isoformat()
            })

            # 格式化结果
            formatted_result = self._format_success_result(target_cli, task, result)

            logger.info(f"跨CLI调用成功: {target_cli}")
            return formatted_result

        except Exception as e:
            logger.error(f"跨CLI调用失败: {target_cli}, {e}")
            self.record_error()

            self.processed_requests.append({
                'type': 'cross_cli_execution',
                'target_cli': target_cli,
                'task': task,
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })

            return self._format_error_result(target_cli, task, str(e))

    async def _handle_get_available_clis(self, context: CopilotMCPContext) -> str:
        """
        处理获取可用CLI列表请求

        Args:
            context: MCP上下文

        Returns:
            str: 可用CLI列表
        """
        try:
            # 使用新的适配器注册机制获取所有适配器
            from .. import _ADAPTER_REGISTRY
            adapters = list(_ADAPTER_REGISTRY.values())

            available_clis = []
            for name, adapter in adapters.items():
                if adapter.is_available():
                    available_clis.append({
                        'name': name,
                        'version': getattr(adapter, 'version', 'unknown'),
                        'type': adapter.__class__.__name__
                    })

            result = {
                'available_clis': available_clis,
                'total_count': len(available_clis),
                'timestamp': datetime.now().isoformat()
            }

            return json.dumps(result, indent=2, ensure_ascii=False)

        except Exception as e:
            logger.error(f"获取可用CLI列表失败: {e}")
            return json.dumps({'error': str(e)}, ensure_ascii=False)

    async def _handle_check_cli_status(self, arguments: Dict[str, Any], context: CopilotMCPContext) -> str:
        """
        处理检查CLI状态请求

        Args:
            arguments: 包含cli_name的参数
            context: MCP上下文

        Returns:
            str: CLI状态信息
        """
        cli_name = arguments.get('cli_name')

        if not cli_name:
            return json.dumps({'error': '缺少cli_name参数'}, ensure_ascii=False)

        try:
            target_adapter = self.get_adapter(cli_name)

            if not target_adapter:
                return json.dumps({
                    'cli_name': cli_name,
                    'available': False,
                    'reason': '适配器未找到'
                }, ensure_ascii=False)

            health = await target_adapter.health_check()
            stats = target_adapter.get_statistics()

            result = {
                'cli_name': cli_name,
                'available': target_adapter.is_available(),
                'health': health,
                'statistics': stats,
                'timestamp': datetime.now().isoformat()
            }

            return json.dumps(result, indent=2, ensure_ascii=False)

        except Exception as e:
            logger.error(f"检查CLI状态失败: {cli_name}, {e}")
            return json.dumps({
                'cli_name': cli_name,
                'available': False,
                'error': str(e)
            }, ensure_ascii=False)

    def _format_success_result(
        self,
        target_cli: str,
        task: str,
        result: str
    ) -> str:
        """
        格式化成功的跨CLI调用结果

        Args:
            target_cli: 目标CLI工具
            task: 原始任务
            result: 执行结果

        Returns:
            str: 格式化的结果
        """
        return f"""## 🔗 跨CLI调用结果

**源工具**: Copilot CLI
**目标工具**: {target_cli.upper()}
**原始任务**: {task}
**执行时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

{result}

---

*此结果由跨CLI集成系统通过Copilot CLI MCP提供*"""

    def _format_error_result(
        self,
        target_cli: str,
        task: str,
        error_message: str
    ) -> str:
        """
        格式化错误的跨CLI调用结果

        Args:
            target_cli: 目标CLI工具
            task: 原始任务
            error_message: 错误信息

        Returns:
            str: 格式化的错误结果
        """
        return f"""## ❌ 跨CLI调用失败

**源工具**: Copilot CLI
**目标工具**: {target_cli.upper()}
**原始任务**: {task}
**错误信息**: {error_message}
**失败时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

请检查目标CLI工具是否正确安装和配置。

---

*此错误由跨CLI集成系统报告*"""

    def is_available(self) -> bool:
        """
        检查适配器是否可用

        Returns:
            bool: 是否可用
        """
        return self.mcp_server_registered and self._check_copilot_environment()

    async def health_check(self) -> Dict[str, Any]:
        """
        健康检查

        Returns:
            Dict[str, Any]: 健康状态
        """
        base_health = await super().health_check()

        copilot_health = {
            'mcp_server_registered': self.mcp_server_registered,
            'mcp_calls_count': self.mcp_calls_count,
            'cross_cli_calls_count': self.cross_cli_calls_count,
            'processed_requests_count': len(self.processed_requests),
            'agent_executions_count': len(self.agent_executions),
            'mcp_config_file': self.mcp_config_file,
            'mcp_config_exists': os.path.exists(self.mcp_config_file),
            'custom_agents_dir': self.custom_agents_dir,
            'custom_agents_dir_exists': os.path.exists(self.custom_agents_dir)
        }

        # 检查环境
        try:
            copilot_health['copilot_environment'] = self._check_copilot_environment()
        except Exception as e:
            copilot_health['copilot_environment_error'] = str(e)

        # 合并基础健康信息
        base_health.update(copilot_health)
        return base_health

    def get_statistics(self) -> Dict[str, Any]:
        """
        获取适配器统计信息

        Returns:
            Dict[str, Any]: 统计信息
        """
        base_stats = super().get_statistics()

        copilot_stats = {
            'mcp_server_registered': self.mcp_server_registered,
            'mcp_calls_count': self.mcp_calls_count,
            'cross_cli_calls_count': self.cross_cli_calls_count,
            'agent_executions_count': len(self.agent_executions),
            'success_rate': self._calculate_success_rate(),
            'last_activity': self._get_last_activity(),
            'mcp_server_name': self.cross_cli_mcp_server['name']
        }

        base_stats.update(copilot_stats)
        return base_stats

    def _calculate_success_rate(self) -> float:
        """
        计算成功率

        Returns:
            float: 成功率 (0.0 - 1.0)
        """
        total_cross_cli = self.cross_cli_calls_count

        if total_cross_cli == 0:
            return 1.0

        successful_calls = sum(
            1 for req in self.processed_requests
            if req.get('type') == 'cross_cli_execution' and req.get('success')
        )

        return successful_calls / total_cross_cli

    def _get_last_activity(self) -> Optional[str]:
        """
        获取最后活动时间

        Returns:
            Optional[str]: 最后活动时间戳
        """
        if not self.processed_requests:
            return None

        return max(req['timestamp'] for req in self.processed_requests)

    async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
        """
        执行跨CLI任务 - Copilot适配器的具体实现

        Args:
            task: 要执行的任务描述
            context: 执行上下文信息

        Returns:
            str: 任务执行结果
        """
        try:
            # 创建MCP上下文
            mcp_context = CopilotMCPContext(
                prompt=task,
                metadata=context.get('metadata', {})
            )

            # 检查是否为跨CLI调用
            intent = self.parser.parse_intent(task, "copilot")
            if intent.is_cross_cli and intent.target_cli != self.cli_name:
                # 执行跨CLI调用
                result = await self._handle_cross_cli_execute(
                    {'target_cli': intent.target_cli, 'task': intent.task},
                    mcp_context
                )
                return result
            else:
                # 本地Copilot任务处理
                return f"Copilot MCP适配器本地处理: {task}"

        except Exception as e:
            logger.error(f"执行任务失败: {task}, 错误: {e}")
            self.record_error()
            return f"任务执行失败: {str(e)}"

    async def cleanup(self) -> bool:
        """
        清理适配器资源

        Returns:
            bool: 清理是否成功
        """
        try:
            # 清理统计信息
            self.processed_requests.clear()
            self.agent_executions.clear()

            # 注销MCP服务器（如果需要）
            # 这里可以实现MCP服务器注销逻辑

            logger.info("Copilot MCP适配器清理完成")
            return True

        except Exception as e:
            logger.error(f"清理Copilot MCP适配器失败: {e}")
            return False


# 创建全局适配器实例
_global_adapter: Optional[CopilotMCPAdapter] = None


def get_copilot_mcp_adapter() -> CopilotMCPAdapter:
    """
    获取Copilot MCP适配器实例

    Returns:
        CopilotMCPAdapter: 适配器实例
    """
    global _global_adapter
    if _global_adapter is None:
        _global_adapter = CopilotMCPAdapter()
        # 异步初始化需要在调用时进行
    return _global_adapter


# 便捷函数
async def initialize_copilot_adapter() -> bool:
    """
    初始化Copilot MCP适配器

    Returns:
        bool: 初始化是否成功
    """
    adapter = get_copilot_mcp_adapter()
    return await adapter.initialize()


def is_copilot_adapter_available() -> bool:
    """
    检查Copilot MCP适配器是否可用

    Returns:
        bool: 是否可用
    """
    adapter = get_copilot_mcp_adapter()
    return adapter.is_available()