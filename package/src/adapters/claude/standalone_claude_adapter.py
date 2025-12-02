"""
独立 Claude CLI 适配器 - 完全无抽象层

基于 Claude CLI 官方 Hook 系统的原生集成：
- 使用 Claude CLI 官方 Hook 机制
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


class ClaudeHookContext:
    """Claude CLI Hook 上下文 - 独立实现"""

    def __init__(self, prompt: str = "", metadata: Optional[Dict] = None):
        self.prompt = prompt
        self.metadata = metadata or {}
        self.session_id = self.metadata.get('session_id', 'unknown')
        self.user_id = self.metadata.get('user_id', 'unknown')
        self.timestamp = datetime.now()


class StandaloneClaudeAdapter:
    """
    独立的 Claude CLI Hook 适配器

    直接基于 Claude CLI 官方 Hook 系统，无任何抽象层：
    - user_prompt_submit Hook
    - tool_use_pre/post Hooks
    - response_generated Hook
    """

    def __init__(self):
        """初始化 - 纯实现，无抽象"""
        self.cli_name = "claude"
        self.version = "1.0.0"

        # Hook 配置
        self.hooks_config_file = os.path.expanduser("~/.config/claude/hooks.json")
        self.hooks_registered = False

        # 统计信息
        self.execution_count = 0
        self.error_count = 0
        self.hook_calls_count = 0
        self.cross_cli_calls_count = 0
        self.processed_requests: List[Dict[str, Any]] = []
        self.last_execution: Optional[datetime] = None

        # Hook 处理器
        self.hook_handlers = {
            'user_prompt_submit': self.on_user_prompt_submit,
            'tool_use_pre': self.on_tool_use_pre,
            'tool_use_post': self.on_tool_use_post,
            'response_generated': self.on_response_generated,
        }

        # 直接跨CLI处理器 - 无Factory
        self._cli_handlers = {}
        self._init_cli_handlers()

        # 配置
        self.config = self._load_config()

        logger.info("独立 Claude CLI Hook 适配器初始化完成")

    def _load_config(self) -> Dict[str, Any]:
        """加载配置"""
        config_file = os.path.join(os.path.dirname(__file__), "config.json")
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"配置加载失败: {e}")
            return {"hooks": [], "integration_settings": {"enable_cross_cli": True}}

    def _init_cli_handlers(self):
        """初始化跨CLI处理器 - 直接导入，无Factory"""
        try:
            # 可以直接添加其他CLI处理器
            # from ..codex.standalone_codex_adapter import get_standalone_codex_adapter
            # self._cli_handlers['codex'] = get_standalone_codex_adapter()
            logger.info("跨CLI处理器初始化完成")
        except Exception as e:
            logger.warning(f"跨CLI处理器初始化失败: {e}")

    def is_available(self) -> bool:
        """检查是否可用 - 直接检查 Claude CLI"""
        try:
            # 检查Claude CLI是否可用
            import subprocess
            result = subprocess.run(['claude', '--version'], capture_output=True, text=True, timeout=10)
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

            # 创建 Hook 上下文
            hook_context = ClaudeHookContext(
                prompt=task,
                metadata=context.get('metadata', {})
            )

            # 通过 Hook 系统处理
            result = await self.on_user_prompt_submit(hook_context)

            # 如果 Hook 没有处理，则本地处理
            if result is None:
                # 检测跨CLI调用
                cross_cli_intent = self._detect_cross_cli_intent(task)
                if cross_cli_intent:
                    return await self._handle_cross_cli_call(cross_cli_intent, context)

                # 本地 Claude 处理
                result = f"[Claude CLI 本地处理] {task}"

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
                    result = await handler.execute_task(task, {'source_cli': 'claude'})
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

**源工具**: Claude CLI (Hook 系统)
**目标工具**: {target_cli.upper()}
**任务**: {task}
**执行时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

{result}

---

*Claude Hook 系统原生集成 - 无抽象层*"""

    # Hook 处理方法 - 基于 Claude CLI 官方 Hook 机制
    async def on_user_prompt_submit(self, context: ClaudeHookContext) -> Optional[str]:
        """
        用户提示提交 Hook - 核心跨CLI检测点

        这是基于 Claude CLI 官方 Hook 系统的原生实现。
        """
        try:
            self.hook_calls_count += 1
            user_input = context.prompt

            # 记录请求
            self.processed_requests.append({
                'hook_type': 'user_prompt_submit',
                'prompt': user_input,
                'metadata': context.metadata,
                'timestamp': datetime.now().isoformat()
            })

            # 检测跨CLI调用
            cross_cli_intent = self._detect_cross_cli_intent(user_input)
            if cross_cli_intent:
                return await self._handle_cross_cli_call(cross_cli_intent, context.metadata)

            # 不是跨CLI调用，让 Claude 正常处理
            return None

        except Exception as e:
            logger.error(f"用户提示 Hook 处理失败: {e}")
            self.error_count += 1
            return None  # 错误时让 Claude 继续正常处理

    async def on_tool_use_pre(self, context: ClaudeHookContext) -> Optional[str]:
        """工具使用前 Hook"""
        # 预处理工具调用
        return None

    async def on_tool_use_post(self, context: ClaudeHookContext) -> Optional[str]:
        """工具使用后 Hook"""
        # 后处理工具调用结果
        return None

    async def on_response_generated(self, context: ClaudeHookContext) -> Optional[str]:
        """响应生成后 Hook"""
        # 后处理 Claude 响应
        return None

    async def initialize(self) -> bool:
        """初始化适配器"""
        try:
            # 检查 Claude CLI 环境
            if not self.is_available():
                logger.warning("Claude CLI 不可用")
                return False

            # 注册 Hook 到 Claude CLI
            await self._register_hooks()

            # 创建配置目录
            os.makedirs(os.path.dirname(self.hooks_config_file), exist_ok=True)

            self.hooks_registered = True
            logger.info("Claude Hook 适配器初始化成功 - 独立模式")
            return True

        except Exception as e:
            logger.error(f"适配器初始化失败: {e}")
            return False

    async def _register_hooks(self) -> bool:
        """注册 Hook 到 Claude CLI"""
        try:
            # 读取现有 hooks 配置
            hooks_config = self._load_hooks_config()

            # 添加跨CLI Hook
            cross_cli_hook = {
                "name": "cross-cli-hooks",
                "version": "1.0.0",
                "description": "跨CLI调用集成Hook系统",
                "author": "Smart CLI Router",
                "module": "src.adapters.claude.standalone_claude_adapter",
                "class": "StandaloneClaudeAdapter",
                "enabled": True,
                "priority": 100,
                "hooks": list(self.hook_handlers.keys())
            }

            # 检查是否已存在
            existing_hooks = hooks_config.get('hooks', [])
            hook_exists = any(hook['name'] == cross_cli_hook['name'] for hook in existing_hooks)

            if not hook_exists:
                existing_hooks.append(cross_cli_hook)
                hooks_config['hooks'] = existing_hooks
                await self._save_hooks_config(hooks_config)
                logger.info(f"注册 Hook: {cross_cli_hook['name']}")
            else:
                logger.info("Hook 已存在，跳过注册")

            return True

        except Exception as e:
            logger.error(f"Hook 注册失败: {e}")
            return False

    def _load_hooks_config(self) -> Dict[str, Any]:
        """加载 Hooks 配置"""
        if os.path.exists(self.hooks_config_file):
            try:
                with open(self.hooks_config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"加载 Hook 配置失败: {e}")

        return {"version": "1.0", "hooks": []}

    async def _save_hooks_config(self, config: Dict[str, Any]) -> bool:
        """保存 Hooks 配置"""
        try:
            with open(self.hooks_config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            logger.error(f"保存 Hook 配置失败: {e}")
            return False

    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息 - 直接实现"""
        success_rate = ((self.execution_count - self.error_count) / self.execution_count) if self.execution_count > 0 else 1.0

        return {
            'cli_name': self.cli_name,
            'version': self.version,
            'hooks_registered': self.hooks_registered,
            'execution_count': self.execution_count,
            'hook_calls_count': self.hook_calls_count,
            'cross_cli_calls_count': self.cross_cli_calls_count,
            'error_count': self.error_count,
            'success_rate': success_rate,
            'last_execution': self.last_execution.isoformat() if self.last_execution else None,
            'design': 'standalone_hook_native',
            'no_abstraction': True,
            'hooks_config_file': self.hooks_config_file
        }


# 便捷函数 - 无抽象层
def get_standalone_claude_adapter() -> StandaloneClaudeAdapter:
    """获取独立的 Claude CLI 适配器实例"""
    return StandaloneClaudeAdapter()


# 保持向后兼容的函数名
def get_claude_hook_adapter() -> StandaloneClaudeAdapter:
    """获取 Claude Hook 适配器实例（向后兼容）"""
    return get_standalone_claude_adapter()