"""
Claude CLI Hook适配器 - 基于Claude CLI官方Hook系统的原生集成

这是TDD驱动的实现，基于test_claude_adapter.py中的测试用例
完全符合项目约束条件：
- 使用Claude CLI官方Hook机制
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


class HookContext:
    """Claude CLI Hook上下文模拟类"""

    def __init__(self, prompt: str = "", metadata: Optional[Dict] = None):
        self.prompt = prompt
        self.metadata = metadata or {}
        self.session_id = self.metadata.get('session_id', 'unknown')
        self.user_id = self.metadata.get('user_id', 'unknown')
        self.timestamp = datetime.now()


class ClaudeHookAdapter(BaseCrossCLIAdapter):
    """
    Claude CLI Hook适配器

    通过Claude CLI官方Hook系统实现跨CLI调用功能。
    这是完全基于原生机制的无损扩展实现。

    Hook机制:
    - user_prompt_submit: 用户提交提示时触发
    - tool_use_pre: 工具使用前触发
    - tool_use_post: 工具使用后触发
    - response_generated: 响应生成时触发
    """

    def __init__(self, cli_name: str = "claude"):
        """
        初始化Claude Hook适配器

        Args:
            cli_name: CLI工具名称，默认为"claude"
        """
        super().__init__(cli_name)

        # Hook相关配置
        self.hooks_config_file = os.path.expanduser("~/.config/claude/hooks.json")
        self.hooks_registered = False
        self.hook_handlers = {
            'user_prompt_submit': self.on_user_prompt_submit,
            'tool_use_pre': self.on_tool_use_pre,
            'tool_use_post': self.on_tool_use_post,
            'response_generated': self.on_response_generated,
        }

        # 统计信息
        self.hook_calls_count = 0
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
            # 1. 检查Claude CLI环境
            if not self._check_claude_environment():
                logger.error("Claude CLI环境检查失败")
                return False

            # 2. 注册Hook
            if not await self._register_hooks():
                logger.error("Hook注册失败")
                return False

            # 3. 创建配置目录
            await self._ensure_config_directory()

            self.hooks_registered = True
            logger.info("Claude Hook适配器初始化成功")
            return True

        except Exception as e:
            logger.error(f"初始化Claude Hook适配器失败: {e}")
            self.record_error()
            return False

    async def _register_hooks(self) -> bool:
        """
        注册Hook到Claude CLI

        Returns:
            bool: 注册是否成功
        """
        try:
            # 读取现有hooks配置
            hooks_config = self._load_hooks_config()

            # 添加我们的Hook
            cross_cli_hook = {
                "name": "cross-cli-adapter",
                "module": "src.adapters.claude.hook_adapter",
                "class": "ClaudeHookAdapter",
                "enabled": True,
                "priority": 100,
                "hooks": [
                    "user_prompt_submit",
                    "tool_use_pre",
                    "tool_use_post",
                    "response_generated"
                ]
            }

            # 检查是否已存在
            existing_hooks = hooks_config.get('hooks', [])
            hook_exists = any(
                hook['name'] == cross_cli_hook['name']
                for hook in existing_hooks
            )

            if not hook_exists:
                existing_hooks.append(cross_cli_hook)
                hooks_config['hooks'] = existing_hooks

                # 保存配置
                await self._save_hooks_config(hooks_config)
                logger.info(f"注册Hook: {cross_cli_hook['name']}")
            else:
                logger.info("Hook已存在，跳过注册")

            return True

        except Exception as e:
            logger.error(f"注册Hook失败: {e}")
            return False

    def _load_hooks_config(self) -> Dict[str, Any]:
        """
        加载Hooks配置

        Returns:
            Dict[str, Any]: Hook配置
        """
        if os.path.exists(self.hooks_config_file):
            try:
                with open(self.hooks_config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                logger.warning(f"加载Hook配置失败，使用默认配置: {e}")

        # 返回默认配置
        return {
            "version": "1.0",
            "hooks": []
        }

    async def _save_hooks_config(self, config: Dict[str, Any]) -> bool:
        """
        保存Hooks配置

        Args:
            config: Hook配置

        Returns:
            bool: 保存是否成功
        """
        try:
            os.makedirs(os.path.dirname(self.hooks_config_file), exist_ok=True)

            with open(self.hooks_config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            logger.info(f"保存Hook配置到: {self.hooks_config_file}")
            return True

        except Exception as e:
            logger.error(f"保存Hook配置失败: {e}")
            return False

    async def _ensure_config_directory(self) -> bool:
        """
        确保配置目录存在

        Returns:
            bool: 创建是否成功
        """
        try:
            config_dir = os.path.expanduser("~/.config/claude")
            os.makedirs(config_dir, exist_ok=True)

            # 创建适配器配置目录
            adapter_dir = os.path.join(config_dir, "adapters")
            os.makedirs(adapter_dir, exist_ok=True)

            logger.info(f"配置目录已准备: {config_dir}")
            return True

        except Exception as e:
            logger.error(f"创建配置目录失败: {e}")
            return False

    def _check_claude_environment(self) -> bool:
        """
        检查Claude CLI环境

        Returns:
            bool: 环境是否可用
        """
        # 这里应该检查Claude CLI是否可用
        # 暂时返回True，实际实现中需要检查CLI命令和配置
        return True

    async def on_user_prompt_submit(self, context: HookContext) -> Optional[str]:
        """
        用户提示提交Hook处理函数

        这是核心Hook，用于检测和执行跨CLI调用。

        Args:
            context: Hook上下文

        Returns:
            Optional[str]: 处理结果，如果返回None则让Claude继续正常处理
        """
        try:
            self.hook_calls_count += 1
            user_input = context.prompt

            # 记录请求
            request_record = {
                'hook_type': 'user_prompt_submit',
                'prompt': user_input,
                'metadata': context.metadata,
                'timestamp': datetime.now().isoformat()
            }
            self.processed_requests.append(request_record)

            # 1. 检测是否为跨CLI调用意图
            intent = self.parser.parse_intent(user_input, "claude")

            if not intent.is_cross_cli:
                # 不是跨CLI调用，让Claude继续处理
                return None

            # 2. 避免自我调用
            if intent.target_cli == self.cli_name:
                # 目标是Claude自己，让Claude处理
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
            logger.error(f"用户提示Hook处理失败: {e}")
            self.record_error()
            return None

    async def on_tool_use_pre(self, context: HookContext) -> Optional[str]:
        """
        工具使用前Hook处理函数

        Args:
            context: Hook上下文

        Returns:
            Optional[str]: 处理结果
        """
        # 可以在这里预处理工具调用
        return None

    async def on_tool_use_post(self, context: HookContext) -> Optional[str]:
        """
        工具使用后Hook处理函数

        Args:
            context: Hook上下文

        Returns:
            Optional[str]: 处理结果
        """
        # 可以在这里后处理工具调用结果
        return None

    async def on_response_generated(self, context: HookContext) -> Optional[str]:
        """
        响应生成后Hook处理函数

        Args:
            context: Hook上下文

        Returns:
            Optional[str]: 处理结果
        """
        # 可以在这里后处理Claude的响应
        return None

    async def _execute_cross_cli_call(
        self,
        target_cli: str,
        task: str,
        context: HookContext
    ) -> Optional[str]:
        """
        执行跨CLI调用

        Args:
            target_cli: 目标CLI工具
            task: 要执行的任务
            context: Hook上下文

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
                'hook_context': context.__dict__,
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

**源工具**: Claude CLI
**目标工具**: {target_cli.upper()}
**原始任务**: {task}
**执行时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

{result}

---

*此结果由跨CLI集成系统通过Claude CLI Hook提供*"""

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

**源工具**: Claude CLI
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
        return self.hooks_registered and self._check_claude_environment()

    async def health_check(self) -> Dict[str, Any]:
        """
        健康检查

        Returns:
            Dict[str, Any]: 健康状态
        """
        base_health = await super().health_check()

        claude_health = {
            'hooks_registered': self.hooks_registered,
            'hook_calls_count': self.hook_calls_count,
            'cross_cli_calls_count': self.cross_cli_calls_count,
            'processed_requests_count': len(self.processed_requests),
            'hooks_config_file': self.hooks_config_file,
            'hooks_config_exists': os.path.exists(self.hooks_config_file)
        }

        # 检查环境
        try:
            claude_health['claude_environment'] = self._check_claude_environment()
        except Exception as e:
            claude_health['claude_environment_error'] = str(e)

        # 合并基础健康信息
        base_health.update(claude_health)
        return base_health

    def get_statistics(self) -> Dict[str, Any]:
        """
        获取适配器统计信息

        Returns:
            Dict[str, Any]: 统计信息
        """
        base_stats = super().get_statistics()

        claude_stats = {
            'hooks_registered': self.hooks_registered,
            'hook_calls_count': self.hook_calls_count,
            'cross_cli_calls_count': self.cross_cli_calls_count,
            'success_rate': self._calculate_success_rate(),
            'last_activity': self._get_last_activity(),
            'supported_hooks': list(self.hook_handlers.keys())
        }

        base_stats.update(claude_stats)
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
        执行跨CLI任务 - Claude适配器的具体实现

        Args:
            task: 要执行的任务描述
            context: 执行上下文信息

        Returns:
            str: 任务执行结果
        """
        try:
            # Claude适配器的任务执行主要是通过Hook系统
            # 这里创建一个模拟的Hook上下文来处理任务
            hook_context = HookContext(
                prompt=task,
                metadata=context.get('metadata', {})
            )

            # 检查是否为跨CLI调用
            intent = self.parser.parse_intent(task, "claude")
            if intent.is_cross_cli and intent.target_cli != self.cli_name:
                # 执行跨CLI调用
                result = await self._execute_cross_cli_call(
                    intent.target_cli,
                    intent.task,
                    hook_context
                )
                return result or f"Claude Hook适配器处理了任务: {task}"
            else:
                # 本地Claude任务处理
                return f"Claude Hook适配器本地处理: {task}"

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

            # 注销Hook（如果需要）
            # 这里可以实现Hook注销逻辑

            logger.info("Claude Hook适配器清理完成")
            return True

        except Exception as e:
            logger.error(f"清理Claude Hook适配器失败: {e}")
            return False


# 创建全局适配器实例
_global_adapter: Optional[ClaudeHookAdapter] = None


def get_claude_hook_adapter() -> ClaudeHookAdapter:
    """
    获取Claude Hook适配器实例

    Returns:
        ClaudeHookAdapter: 适配器实例
    """
    global _global_adapter
    if _global_adapter is None:
        _global_adapter = ClaudeHookAdapter()
        # 异步初始化需要在调用时进行
    return _global_adapter


# 便捷函数
async def initialize_claude_adapter() -> bool:
    """
    初始化Claude Hook适配器

    Returns:
        bool: 初始化是否成功
    """
    adapter = get_claude_hook_adapter()
    return await adapter.initialize()


def is_claude_adapter_available() -> bool:
    """
    检查Claude Hook适配器是否可用

    Returns:
        bool: 是否可用
    """
    adapter = get_claude_hook_adapter()
    return adapter.is_available()