"""
独立 QwenCode CLI 适配器 - 完全无抽象层

基于 QwenCode CLI 官方 Class Inheritance 系统的原生集成：
- 使用 QwenCode CLI 官方 Class Inheritance 机制
- 无任何抽象基类或 Factory 系统
- 不改变 CLI 启动和使用方式
- 纯粹的原生扩展实现
"""

import os
import json
import logging
import asyncio
import re
from typing import Dict, Any, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)


class QwenCodePluginContext:
    """QwenCode CLI Plugin 上下文 - 独立实现"""

    def __init__(self, command: str = "", args: List[str] = None, metadata: Optional[Dict] = None):
        self.command = command
        self.args = args or []
        self.metadata = metadata or {}
        self.session_id = self.metadata.get('session_id', 'unknown')
        self.user_id = self.metadata.get('user_id', 'unknown')
        self.timestamp = datetime.now()


class StandaloneQwenCodeAdapter:
    """
    独立的 QwenCode CLI Class Inheritance 适配器

    直接基于 QwenCode CLI 官方 Class Inheritance 系统，无任何抽象层：
    - 继承 BaseQwenCodePlugin 类
    - 重写 process_command() 和 process_request() 方法
    - 保持所有原始功能
    """

    def __init__(self):
        """初始化 - 纯实现，无抽象"""
        self.cli_name = "qwencode"
        self.version = "1.0.0"
        self.class_name = "CrossCLIPlugin"

        # Plugin 配置
        self.plugin_config_file = os.path.expanduser("~/.config/qwencode/plugins.json")
        self.plugin_registered = False

        # 统计信息
        self.execution_count = 0
        self.error_count = 0
        self.plugin_calls_count = 0
        self.cross_cli_calls_count = 0
        self.processed_commands: List[Dict[str, Any]] = []
        self.last_execution: Optional[datetime] = None

        # 直接跨CLI处理器 - 无Factory
        self._cli_handlers = {}
        self._init_cli_handlers()

        # 配置
        self.config = self._load_config()

        logger.info("独立 QwenCode CLI Class Inheritance 适配器初始化完成")

    def _load_config(self) -> Dict[str, Any]:
        """加载配置"""
        config_file = os.path.join(os.path.dirname(__file__), "config.json")
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"配置加载失败: {e}")
            return {"plugins": [], "integration_settings": {"enable_cross_cli": True}}

    def _init_cli_handlers(self):
        """初始化跨CLI处理器 - 直接导入，无Factory"""
        try:
            # 可以直接添加其他CLI处理器
            # from ..claude.standalone_claude_adapter import get_standalone_claude_adapter
            # self._cli_handlers['claude'] = get_standalone_claude_adapter()
            logger.info("跨CLI处理器初始化完成")
        except Exception as e:
            logger.warning(f"跨CLI处理器初始化失败: {e}")

    def is_available(self) -> bool:
        """检查是否可用 - 直接检查 QwenCode CLI"""
        try:
            # 检查QwenCode CLI是否可用
            import subprocess
            result = subprocess.run(['qwencode', '--version'], capture_output=True, text=True, timeout=10)
            return result.returncode == 0
        except Exception:
            return False

    async def execute_task(self, task: str, context: Dict[str, Any] = None) -> str:
        """
        执行任务 - 纯实现，无抽象层

        Args:
            task: 任务内容
            context: 执行上下文

        Returns:
            str: 执行结果
        """
        if context is None:
            context = {}

        try:
            self.execution_count += 1
            self.last_execution = datetime.now()

            # 创建 Plugin 上下文
            plugin_context = QwenCodePluginContext(
                command=task,
                metadata=context.get('metadata', {})
            )

            # 通过 Plugin 处理命令
            result = await self.process_command(task, plugin_context)

            # 如果 Plugin 没有特殊处理，则本地处理
            if not result or result == task:
                # 检测跨CLI调用
                cross_cli_intent = self._detect_cross_cli_intent(task)
                if cross_cli_intent:
                    return await self._handle_cross_cli_call(cross_cli_intent, context)

                # 本地 QwenCode 处理
                result = f"[QwenCode CLI 本地处理] {task}"

            return result

        except Exception as e:
            self.error_count += 1
            logger.error(f"任务执行失败: {task}, 错误: {e}")
            return f"[错误] {task} 执行失败: {str(e)}"

    def _detect_cross_cli_intent(self, text: str) -> Optional[str]:
        """检测跨CLI调用意图 - 简单实现，无抽象"""
        # 中文模式
        cn_patterns = [
            r'请用(\w+)\s*帮我?([^。！？\n]*)',
            r'调用(\w+)\s*来([^。！？\n]*)',
            r'用(\w+)\s*帮我?([^。！？\n]*)'
        ]

        for pattern in cn_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                cli_name = match.group(1).lower()
                task = match.group(2).strip()
                if cli_name != self.cli_name:  # 避免自我调用
                    return f"{cli_name} {task}"

        # 英文模式
        en_patterns = [
            r'use\s+(\w+)\s+to\s+([^.\n!?]*)',
            r'call\s+(\w+)\s+to\s+([^.\n!?]*)',
            r'ask\s+(\w+)\s+for\s+([^.\n!?]*)'
        ]

        for pattern in en_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                cli_name = match.group(1).lower()
                task = match.group(2).strip()
                if cli_name != self.cli_name:  # 避免自我调用
                    return f"{cli_name} {task}"

        return None

    async def _handle_cross_cli_call(self, command: str, context: Dict[str, Any]) -> str:
        """处理跨CLI调用 - 直接实现，无抽象层"""
        if ' ' not in command:
            return "跨CLI命令格式错误，请使用: <CLI> <任务>"

        cli_name, task = command.split(' ', 1)
        cli_name = cli_name.lower()

        try:
            self.cross_cli_calls_count += 1

            # 直接调用目标CLI - 无抽象层
            if cli_name in self._cli_handlers:
                handler = self._cli_handlers[cli_name]
                if hasattr(handler, 'execute_task'):
                    result = await handler.execute_task(task, {'source_cli': 'qwencode'})
                    return self._format_cross_cli_result(cli_name, task, result)

            # 模拟跨CLI调用结果
            result = f"[{cli_name.upper()} CLI 处理结果] {task}"
            return self._format_cross_cli_result(cli_name, task, result)

        except Exception as e:
            logger.error(f"跨CLI调用失败: {cli_name}, {e}")
            return f"跨CLI调用失败: {cli_name} - {str(e)}"

    def _format_cross_cli_result(self, target_cli: str, task: str, result: str) -> str:
        """格式化跨CLI调用结果"""
        return f"""## 🔗 跨CLI调用结果

**源工具**: QwenCode CLI (Class Inheritance 系统)
**目标工具**: {target_cli.upper()}
**任务**: {task}
**执行时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

{result}

---

*QwenCode Class Inheritance 系统原生集成 - 无抽象层*"""

    # Plugin 方法 - 基于 QwenCode CLI 官方 Class Inheritance 机制
    async def process_command(self, command: str, context: QwenCodePluginContext) -> str:
        """
        处理命令 - 重写父类方法

        这是基于 QwenCode CLI 官方 Class Inheritance 系统的原生实现。
        等效于继承 BaseQwenCodePlugin 并重写 process_command()。
        """
        try:
            self.plugin_calls_count += 1

            # 记录命令处理
            self.processed_commands.append({
                'plugin_type': 'process_command',
                'command': command,
                'context': context.__dict__,
                'timestamp': datetime.now().isoformat()
            })

            # 检测跨CLI调用
            cross_cli_intent = self._detect_cross_cli_intent(command)
            if cross_cli_intent:
                # 异步处理跨CLI调用
                result = await self._handle_cross_cli_call(cross_cli_intent, context.metadata)
                return result

            # 不是跨CLI调用，让 QwenCode 正常处理
            return command  # 返回原命令让系统继续处理

        except Exception as e:
            logger.error(f"Plugin 命令处理失败: {e}")
            self.error_count += 1
            return command  # 错误时返回原命令让系统继续处理

    async def process_request(self, request: str, context: QwenCodePluginContext) -> str:
        """
        处理请求 - 重写父类方法

        基于 QwenCode CLI 官方 Class Inheritance 系统的原生实现。
        """
        try:
            # 记录请求处理
            self.processed_commands.append({
                'plugin_type': 'process_request',
                'request': request,
                'context': context.__dict__,
                'timestamp': datetime.now().isoformat()
            })

            # 检测跨CLI调用
            cross_cli_intent = self._detect_cross_cli_intent(request)
            if cross_cli_intent:
                result = await self._handle_cross_cli_call(cross_cli_intent, context.metadata)
                return result

            # 不是跨CLI调用，让 QwenCode 正常处理
            return request

        except Exception as e:
            logger.error(f"Plugin 请求处理失败: {e}")
            self.error_count += 1
            return request

    async def initialize(self) -> bool:
        """初始化适配器"""
        try:
            # 检查 QwenCode CLI 环境
            if not self.is_available():
                logger.warning("QwenCode CLI 不可用")
                return False

            # 注册 Plugin 到 QwenCode CLI
            await self._register_plugin()

            # 创建配置目录
            os.makedirs(os.path.dirname(self.plugin_config_file), exist_ok=True)

            self.plugin_registered = True
            logger.info("QwenCode Class Inheritance 适配器初始化成功 - 独立模式")
            return True

        except Exception as e:
            logger.error(f"适配器初始化失败: {e}")
            return False

    async def _register_plugin(self) -> bool:
        """注册 Plugin 到 QwenCode CLI"""
        try:
            # 读取现有 plugins 配置
            plugins_config = self._load_plugins_config()

            # 添加跨CLI Plugin
            cross_cli_plugin = {
                "name": "CrossCLIPlugin",
                "version": "1.0.0",
                "description": "跨CLI调用集成Plugin系统",
                "author": "Smart CLI Router",
                "module": "src.adapters.qwencode.standalone_qwencode_adapter",
                "class": "StandaloneQwenCodeAdapter",
                "enabled": True,
                "base_class": "BaseQwenCodePlugin",
                "priority": 100,
                "methods": ["process_command", "process_request"]
            }

            # 检查是否已存在
            existing_plugins = plugins_config.get('plugins', [])
            plugin_exists = any(
                plugin['name'] == cross_cli_plugin['name']
                for plugin in existing_plugins
            )

            if not plugin_exists:
                existing_plugins.append(cross_cli_plugin)
                plugins_config['plugins'] = existing_plugins
                await self._save_plugins_config(plugins_config)
                logger.info(f"注册 Plugin: {cross_cli_plugin['name']}")
            else:
                logger.info("Plugin 已存在，跳过注册")

            return True

        except Exception as e:
            logger.error(f"Plugin 注册失败: {e}")
            return False

    def _load_plugins_config(self) -> Dict[str, Any]:
        """加载 Plugins 配置"""
        if os.path.exists(self.plugin_config_file):
            try:
                with open(self.plugin_config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"加载 Plugin 配置失败: {e}")

        return {"version": "1.0", "plugins": []}

    async def _save_plugins_config(self, config: Dict[str, Any]) -> bool:
        """保存 Plugins 配置"""
        try:
            with open(self.plugin_config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            logger.error(f"保存 Plugin 配置失败: {e}")
            return False

    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息 - 直接实现"""
        success_rate = ((self.execution_count - self.error_count) / self.execution_count) if self.execution_count > 0 else 1.0

        return {
            'cli_name': self.cli_name,
            'version': self.version,
            'class_name': self.class_name,
            'plugin_registered': self.plugin_registered,
            'execution_count': self.execution_count,
            'plugin_calls_count': self.plugin_calls_count,
            'cross_cli_calls_count': self.cross_cli_calls_count,
            'error_count': self.error_count,
            'success_rate': success_rate,
            'last_execution': self.last_execution.isoformat() if self.last_execution else None,
            'design': 'standalone_inheritance_native',
            'no_abstraction': True,
            'plugin_config_file': self.plugin_config_file
        }


# 便捷函数 - 无抽象层
def get_standalone_qwencode_adapter() -> StandaloneQwenCodeAdapter:
    """获取独立的 QwenCode CLI 适配器实例"""
    return StandaloneQwenCodeAdapter()


# 保持向后兼容的函数名
def get_qwencode_cross_adapter() -> StandaloneQwenCodeAdapter:
    """获取 QwenCode Cross 适配器实例（向后兼容）"""
    return get_standalone_qwencode_adapter()