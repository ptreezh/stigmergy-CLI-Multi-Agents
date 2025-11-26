"""
Gemini CLI Extension适配器 - 基于Gemini CLI官方Extension系统的原生集成

这是TDD驱动的实现，基于test_gemini_adapter.py中的测试用例
完全符合项目约束条件：
- 使用Gemini CLI官方Extension机制
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

from ...core.base_adapter import BaseCrossCLIAdapter, IntentResult
from ...core.parser import NaturalLanguageParser

logger = logging.getLogger(__name__)


class ExtensionContext:
    """Gemini CLI Extension上下文模拟类"""

    def __init__(self, prompt: str = "", metadata: Optional[Dict] = None):
        self.prompt = prompt
        self.metadata = metadata or {}
        self.session_id = self.metadata.get('session_id', 'unknown')
        self.user_id = self.metadata.get('user_id', 'unknown')
        self.extension_id = "cross-cli-adapter"
        self.version = "1.0.0"
        self.timestamp = datetime.now()


class GeminiExtensionAdapter(BaseCrossCLIAdapter):
    """
    Gemini CLI Extension适配器

    通过Gemini CLI官方Extension系统实现跨CLI调用功能。
    这是完全基于原生机制的无损扩展实现。

    Extension机制:
    - on_prompt_submit: 用户提交提示时触发
    - on_command_execute: 命令执行时触发
    - on_response_format: 响应格式化时触发
    - on_tool_call: 工具调用时触发
    - on_file_operation: 文件操作时触发
    """

    def __init__(self, cli_name: str = "gemini"):
        """
        初始化Gemini Extension适配器

        Args:
            cli_name: CLI工具名称，默认为"gemini"
        """
        super().__init__(cli_name)

        # Extension相关配置
        self.extensions_file = os.path.expanduser("~/.config/gemini/extensions.json")
        self.extensions_registered = False
        self.extension_handlers = {
            'on_prompt_submit': self.on_prompt_submit,
            'on_command_execute': self.on_command_execute,
            'on_response_format': self.on_response_format,
            'on_tool_call': self.on_tool_call,
            'on_file_operation': self.on_file_operation,
        }

        # 统计信息
        self.extension_calls_count = 0
        self.cross_cli_calls_count = 0
        self.processed_requests: List[Dict[str, Any]] = []

        # 解析器
        self.parser = NaturalLanguageParser()

        # 跨CLI适配器工厂
        from ...core.base_adapter import get_cross_cli_adapter
        self.get_adapter = get_cross_cli_adapter

    async def initialize(self) -> bool:
        """
        初始化适配器

        Returns:
            bool: 初始化是否成功
        """
        try:
            # 1. 检查Gemini CLI环境
            if not self._check_gemini_environment():
                logger.error("Gemini CLI环境检查失败")
                return False

            # 2. 注册Extension
            if not await self._register_extensions():
                logger.error("Extension注册失败")
                return False

            # 3. 创建配置目录
            await self._ensure_config_directory()

            self.extensions_registered = True
            logger.info("Gemini Extension适配器初始化成功")
            return True

        except Exception as e:
            logger.error(f"初始化Gemini Extension适配器失败: {e}")
            self.record_error()
            return False

    async def _register_extensions(self) -> bool:
        """
        注册Extension到Gemini CLI

        Returns:
            bool: 注册是否成功
        """
        try:
            # 读取现有extensions配置
            extensions_config = self._load_extensions_config()

            # 添加我们的Extension
            cross_cli_extension = {
                "id": "cross-cli-adapter",
                "name": "Cross-CLI Integration Extension",
                "description": "Enables cross-CLI tool calling from Gemini CLI",
                "version": "1.0.0",
                "author": "Smart CLI Router",
                "enabled": True,
                "priority": 90,
                "handlers": [
                    "on_prompt_submit",
                    "on_command_execute",
                    "on_response_format",
                    "on_tool_call",
                    "on_file_operation"
                ],
                "config": {
                    "cross_cli_enabled": True,
                    "supported_clis": ["claude", "qwencode", "iflow", "qoder", "codebuddy", "codex"],
                    "auto_detect": True,
                    "timeout": 30
                }
            }

            # 检查是否已存在
            existing_extensions = extensions_config.get('extensions', [])
            extension_exists = any(
                ext['id'] == cross_cli_extension['id']
                for ext in existing_extensions
            )

            if not extension_exists:
                existing_extensions.append(cross_cli_extension)
                extensions_config['extensions'] = existing_extensions

                # 保存配置
                await self._save_extensions_config(extensions_config)
                logger.info(f"注册Extension: {cross_cli_extension['id']}")
            else:
                logger.info("Extension已存在，跳过注册")

            return True

        except Exception as e:
            logger.error(f"注册Extension失败: {e}")
            return False

    def _load_extensions_config(self) -> Dict[str, Any]:
        """
        加载Extensions配置

        Returns:
            Dict[str, Any]: Extension配置
        """
        if os.path.exists(self.extensions_file):
            try:
                with open(self.extensions_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                logger.warning(f"加载Extension配置失败，使用默认配置: {e}")

        # 返回默认配置
        return {
            "version": "1.0",
            "extensions": []
        }

    async def _save_extensions_config(self, config: Dict[str, Any]) -> bool:
        """
        保存Extensions配置

        Args:
            config: Extension配置

        Returns:
            bool: 保存是否成功
        """
        try:
            os.makedirs(os.path.dirname(self.extensions_file), exist_ok=True)

            with open(self.extensions_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            logger.info(f"保存Extension配置到: {self.extensions_file}")
            return True

        except Exception as e:
            logger.error(f"保存Extension配置失败: {e}")
            return False

    async def _ensure_config_directory(self) -> bool:
        """
        确保配置目录存在

        Returns:
            bool: 创建是否成功
        """
        try:
            config_dir = os.path.expanduser("~/.config/gemini")
            os.makedirs(config_dir, exist_ok=True)

            # 创建适配器配置目录
            adapter_dir = os.path.join(config_dir, "adapters")
            os.makedirs(adapter_dir, exist_ok=True)

            logger.info(f"配置目录已准备: {config_dir}")
            return True

        except Exception as e:
            logger.error(f"创建配置目录失败: {e}")
            return False

    def _check_gemini_environment(self) -> bool:
        """
        检查Gemini CLI环境

        Returns:
            bool: 环境是否可用
        """
        # 这里应该检查Gemini CLI是否可用
        # 暂时返回True，实际实现中需要检查CLI命令和配置
        return True

    async def on_prompt_submit(self, context: ExtensionContext) -> Optional[str]:
        """
        用户提示提交Extension处理函数

        这是核心Extension，用于检测和执行跨CLI调用。

        Args:
            context: Extension上下文

        Returns:
            Optional[str]: 处理结果，如果返回None则让Gemini继续正常处理
        """
        try:
            self.extension_calls_count += 1
            user_input = context.prompt

            # 记录请求
            request_record = {
                'extension_type': 'on_prompt_submit',
                'prompt': user_input,
                'metadata': context.metadata,
                'timestamp': datetime.now().isoformat()
            }
            self.processed_requests.append(request_record)

            # 1. 检测是否为跨CLI调用意图
            intent = self.parser.parse_intent(user_input, "gemini")

            if not intent.is_cross_cli:
                # 不是跨CLI调用，让Gemini继续处理
                return None

            # 2. 避免自我调用
            if intent.target_cli == self.cli_name:
                # 目标是Gemini自己，让Gemini处理
                return None

            # 3. 执行跨CLI调用
            result = await self._execute_cross_cli_call(
                intent.target_cli,
                intent.task,
                context
            )

            if result:
                self.cross_cli_calls_count += 1
                return result

            return None

        except Exception as e:
            logger.error(f"用户提示Extension处理失败: {e}")
            self.record_error()
            return None

    async def on_command_execute(self, context: ExtensionContext) -> Optional[str]:
        """
        命令执行Extension处理函数

        Args:
            context: Extension上下文

        Returns:
            Optional[str]: 处理结果
        """
        # 可以在这里预处理命令执行
        return None

    async def on_response_format(self, context: ExtensionContext) -> Optional[str]:
        """
        响应格式化Extension处理函数

        Args:
            context: Extension上下文

        Returns:
            Optional[str]: 处理结果
        """
        # 可以在这里后处理Gemini的响应
        return None

    async def on_tool_call(self, context: ExtensionContext) -> Optional[str]:
        """
        工具调用Extension处理函数

        Args:
            context: Extension上下文

        Returns:
            Optional[str]: 处理结果
        """
        # 可以在这里处理工具调用相关的跨CLI功能
        return None

    async def on_file_operation(self, context: ExtensionContext) -> Optional[str]:
        """
        文件操作Extension处理函数

        Args:
            context: Extension上下文

        Returns:
            Optional[str]: 处理结果
        """
        # 可以在这里处理文件操作相关的跨CLI功能
        return None

    async def _execute_cross_cli_call(
        self,
        target_cli: str,
        task: str,
        context: ExtensionContext
    ) -> Optional[str]:
        """
        执行跨CLI调用

        Args:
            target_cli: 目标CLI工具
            task: 要执行的任务
            context: Extension上下文

        Returns:
            Optional[str]: 执行结果
        """
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
                'extension_context': context.__dict__,
                'timestamp': datetime.now().isoformat()
            }

            # 执行任务
            result = await target_adapter.execute_task(task, execution_context)

            # 记录成功的跨CLI调用
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

**源工具**: Gemini CLI
**目标工具**: {target_cli.upper()}
**原始任务**: {task}
**执行时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

{result}

---

*此结果由跨CLI集成系统通过Gemini CLI Extension提供*"""

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

**源工具**: Gemini CLI
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
        return self.extensions_registered and self._check_gemini_environment()

    async def health_check(self) -> Dict[str, Any]:
        """
        健康检查

        Returns:
            Dict[str, Any]: 健康状态
        """
        base_health = await super().health_check()

        gemini_health = {
            'extensions_registered': self.extensions_registered,
            'extension_calls_count': self.extension_calls_count,
            'cross_cli_calls_count': self.cross_cli_calls_count,
            'processed_requests_count': len(self.processed_requests),
            'extensions_file': self.extensions_file,
            'extensions_config_exists': os.path.exists(self.extensions_file),
            'extension_handlers': list(self.extension_handlers.keys())
        }

        # 检查环境
        try:
            gemini_health['gemini_environment'] = self._check_gemini_environment()
        except Exception as e:
            gemini_health['gemini_environment_error'] = str(e)

        # 合并基础健康信息
        base_health.update(gemini_health)
        return base_health

    def get_statistics(self) -> Dict[str, Any]:
        """
        获取适配器统计信息

        Returns:
            Dict[str, Any]: 统计信息
        """
        base_stats = super().get_statistics()

        gemini_stats = {
            'extensions_registered': self.extensions_registered,
            'extension_calls_count': self.extension_calls_count,
            'cross_cli_calls_count': self.cross_cli_calls_count,
            'success_rate': self._calculate_success_rate(),
            'last_activity': self._get_last_activity(),
            'supported_extensions': list(self.extension_handlers.keys())
        }

        base_stats.update(gemini_stats)
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
        执行跨CLI任务 - Gemini适配器的具体实现

        Args:
            task: 要执行的任务描述
            context: 执行上下文信息

        Returns:
            str: 任务执行结果
        """
        try:
            # Gemini适配器的任务执行主要是通过Extension系统
            # 这里创建一个模拟的Extension上下文来处理任务
            extension_context = ExtensionContext(
                prompt=task,
                metadata=context.get('metadata', {})
            )

            # 检查是否为跨CLI调用
            intent = self.parser.parse_intent(task, "gemini")
            if intent.is_cross_cli and intent.target_cli != self.cli_name:
                # 执行跨CLI调用
                result = await self._execute_cross_cli_call(
                    intent.target_cli,
                    intent.task,
                    extension_context
                )
                return result or f"Gemini Extension适配器处理了任务: {task}"
            else:
                # 本地Gemini任务处理
                return f"Gemini Extension适配器本地处理: {task}"

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

            # 注销Extension（如果需要）
            # 这里可以实现Extension注销逻辑

            logger.info("Gemini Extension适配器清理完成")
            return True

        except Exception as e:
            logger.error(f"清理Gemini Extension适配器失败: {e}")
            return False


# 创建全局适配器实例
_global_adapter: Optional[GeminiExtensionAdapter] = None


def get_gemini_extension_adapter() -> GeminiExtensionAdapter:
    """
    获取Gemini Extension适配器实例

    Returns:
        GeminiExtensionAdapter: 适配器实例
    """
    global _global_adapter
    if _global_adapter is None:
        _global_adapter = GeminiExtensionAdapter()
        # 异步初始化需要在调用时进行
    return _global_adapter


# 便捷函数
async def initialize_gemini_adapter() -> bool:
    """
    初始化Gemini Extension适配器

    Returns:
        bool: 初始化是否成功
    """
    adapter = get_gemini_extension_adapter()
    return await adapter.initialize()


def is_gemini_adapter_available() -> bool:
    """
    检查Gemini Extension适配器是否可用

    Returns:
        bool: 是否可用
    """
    adapter = get_gemini_extension_adapter()
    return adapter.is_available()