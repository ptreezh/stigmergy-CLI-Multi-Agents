"""
CodeBuddy CLI Buddy适配器 - 基于CodeBuddy CLI Buddy系统的原生集成

基于CodeBuddy CLI的Buddy系统实现跨CLI调用功能。
CodeBuddy CLI使用Buddy模式，每个Buddy代表一个特定的技能或功能领域。

Buddy系统机制:
- @buddy装饰器: 用于注册Buddy技能
- 能力声明: 声明Buddy的功能和专长
- 优先级系统: Buddy调用时的优先级排序
- 协作协议: Buddy之间的协作机制
- 配置文件: buddy_config.json配置Buddy技能

完全符合项目约束条件：
- 使用CodeBuddy CLI官方Buddy机制
- 不改变CLI启动和使用方式
- 不依赖包装器
- 完全无损扩展
"""

import os
import sys
import json
import logging
import asyncio
import importlib
import inspect
from typing import Dict, Any, Optional, List, Callable, Union
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, field
from functools import wraps

from ...core.base_adapter import BaseCrossCLIAdapter, IntentResult
from ...core.parser import NaturalLanguageParser

logger = logging.getLogger(__name__)


@dataclass
class BuddySkill:
    """Buddy技能数据类"""
    name: str
    description: str
    version: str = "1.0.0"
    capabilities: List[str] = field(default_factory=list)
    priority: int = 50
    supported_clis: List[str] = field(default_factory=list)
    protocols: List[str] = field(default_factory=list)
    cross_cli_enabled: bool = True
    auto_collaboration: bool = False
    requires_authorization: bool = False
    dependencies: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class BuddyContext:
    """Buddy上下文"""
    session_id: str
    user_input: str
    intent: Optional[IntentResult] = None
    buddy_name: str = ""
    stage: str = "processing"
    parameters: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)


class CodeBuddyBuddyAdapter(BaseCrossCLIAdapter):
    """
    CodeBuddy CLI Buddy适配器

    通过CodeBuddy CLI的Buddy系统实现跨CLI调用功能。
    每个Buddy代表一个特定的AI技能或功能领域。

    Buddy机制:
    - @buddy装饰器注册技能
    - can_handle方法判断处理能力
    - handle_request方法执行任务
    - get_capabilities获取技能声明
    - 优先级和能力匹配
    """

    def __init__(self, cli_name: str = "codebuddy"):
        """
        初始化CodeBuddy Buddy适配器

        Args:
            cli_name: CLI工具名称，默认为"codebuddy"
        """
        super().__init__(cli_name)

        # Buddy系统配置
        self.buddy_config_file = os.path.expanduser("~/.codebuddy/buddy_config.json")
        self.buddy_modules_dir = os.path.expanduser("~/.codebuddy/buddies")
        self.skills_registry: Dict[str, BuddySkill] = {}
        self.active_buddies: Dict[str, Any] = {}
        self.buddy_instances: Dict[str, Any] = {}

        # 统计信息
        self.buddy_calls_count = 0
        self.cross_cli_calls_count = 0
        self.processed_requests: List[Dict[str, Any]] = []
        self.collaboration_sessions: Dict[str, Dict] = {}

        # 组件
        self.parser = NaturalLanguageParser()

        # Buddy配置
        self.buddy_config = {
            "enabled": True,
            "auto_discovery": True,
            "max_concurrent_buddies": 10,
            "default_timeout": 30,
            "fallback_buddy": "general_assistant",
            "cross_cli_integration": {
                "enabled": True,
                "preferred_buddies": [
                    "cross_cli_coordinator",
                    "ai_tool_bridge",
                    "universal_assistant"
                ]
            }
        }

        logger.info("CodeBuddy Buddy适配器初始化完成")

    async def initialize(self) -> bool:
        """
        初始化适配器

        Returns:
            bool: 初始化是否成功
        """
        try:
            logger.info("开始初始化CodeBuddy Buddy适配器...")

            # 1. 检查CodeBuddy CLI环境
            if not self._check_codebuddy_environment():
                logger.error("CodeBuddy CLI环境检查失败")
                return False

            # 2. 创建Buddy配置目录
            await self._ensure_buddy_directories()

            # 3. 加载Buddy配置
            await self._load_buddy_config()

            # 4. 注册Buddy技能
            if not await self._register_builtin_buddies():
                logger.error("Buddy技能注册失败")
                return False

            # 5. 发现和加载外部Buddy模块
            if self.buddy_config["auto_discovery"]:
                await self._discover_buddy_modules()

            # 6. 初始化跨CLI协作系统
            await self._initialize_cross_cli_system()

            logger.info("CodeBuddy Buddy适配器初始化成功")
            return True

        except Exception as e:
            logger.error(f"初始化CodeBuddy Buddy适配器失败: {e}")
            self.record_error()
            return False

    def _check_codebuddy_environment(self) -> bool:
        """
        检查CodeBuddy CLI环境

        Returns:
            bool: 环境是否可用
        """
        try:
            # 检查CodeBuddy CLI命令
            import subprocess
            result = subprocess.run(
                ['codebuddy', '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode == 0:
                logger.info(f"检测到CodeBuddy CLI: {result.stdout.strip()}")
                return True
            else:
                logger.warning("CodeBuddy CLI不可用，使用开发模式")
                return True  # 开发环境中继续

        except (subprocess.TimeoutExpired, FileNotFoundError):
            logger.warning("CodeBuddy CLI环境检查失败，使用开发模式")
            return True  # 开发环境中继续

    async def _ensure_buddy directories(self) -> None:
        """确保Buddy目录存在"""
        directories = [
            os.path.expanduser("~/.codebuddy"),
            self.buddy_modules_dir,
            os.path.expanduser("~/.codebuddy/logs"),
            os.path.expanduser("~/.codebuddy/cache"),
            os.path.expanduser("~/.codebuddy/collaboration")
        ]

        for directory in directories:
            os.makedirs(directory, exist_ok=True)

    async def _load_buddy_config(self) -> None:
        """加载Buddy配置"""
        try:
            if os.path.exists(self.buddy_config_file):
                with open(self.buddy_config_file, 'r', encoding='utf-8') as f:
                    loaded_config = json.load(f)

                # 合并配置
                for key, value in loaded_config.items():
                    if key in self.buddy_config:
                        if isinstance(self.buddy_config[key], dict) and isinstance(value, dict):
                            self.buddy_config[key].update(value)
                        else:
                            self.buddy_config[key] = value
                    else:
                        self.buddy_config[key] = value

                logger.info("Buddy配置加载成功")
            else:
                logger.info("Buddy配置文件不存在，使用默认配置")
                await self._save_buddy_config()

        except Exception as e:
            logger.error(f"加载Buddy配置失败: {e}")
            logger.info("使用默认Buddy配置")

    async def _save_buddy_config(self) -> bool:
        """保存Buddy配置"""
        try:
            os.makedirs(os.path.dirname(self.buddy_config_file), exist_ok=True)
            with open(self.buddy_config_file, 'w', encoding='utf-8') as f:
                json.dump(self.buddy_config, f, indent=2, ensure_ascii=False)

            logger.info(f"Buddy配置已保存到: {self.buddy_config_file}")
            return True

        except Exception as e:
            logger.error(f"保存Buddy配置失败: {e}")
            return False

    async def _register_builtin_buddies(self) -> bool:
        """
        注册内置Buddy技能

        Returns:
            bool: 注册是否成功
        """
        try:
            # 注册跨CLI协作Buddy
            await self._register_cross_cli_coordinator_buddy()

            # 注册通用AI工具Buddy
            await self._register_ai_tool_bridge_buddy()

            # 注册通用助手Buddy
            await self._register_universal_assistant_buddy()

            logger.info("内置Buddy技能注册成功")
            return True

        except Exception as e:
            logger.error(f"注册内置Buddy技能失败: {e}")
            return False

    def buddy(self, name: str = "", description: str = "",
             capabilities: List[str] = None, priority: int = 50,
             supported_clis: List[str] = None, protocols: List[str] = None,
             cross_cli_enabled: bool = True, auto_collaboration: bool = False):
        """
        Buddy装饰器，用于注册Buddy技能

        Args:
            name: Buddy名称
            description: Buddy描述
            capabilities: Buddy能力列表
            priority: 优先级
            supported_clis: 支持的CLI工具列表
            protocols: 支持的协议列表
            cross_cli_enabled: 是否启用跨CLI功能
            auto_collaboration: 是否启用自动协作
        """
        def decorator(func: Callable):
            # 创建Buddy技能
            buddy_skill = BuddySkill(
                name=name or func.__name__,
                description=description or f"Buddy技能: {func.__name__}",
                version="1.0.0",
                capabilities=capabilities or [],
                priority=priority,
                supported_clis=supported_clis or [],
                protocols=protocols or [
                    "请用{cli}帮我{task}",
                    "调用{cli}来{task}",
                    "用{cli}处理{task}",
                    "use {cli} to {task}",
                    "ask {cli} for {task}"
                ],
                cross_cli_enabled=cross_cli_enabled,
                auto_collaboration=auto_collaboration
            )

            # 存储技能信息
            buddy_skill.metadata['function'] = func.__name__
            buddy_skill.metadata['module'] = func.__module__
            buddy_skill.metadata['docstring'] = func.__doc__

            # 包装原始函数
            @wraps(func)
            async def wrapped_func(context: BuddyContext, *args, **kwargs) -> Any:
                try:
                    logger.info(f"执行Buddy技能: {buddy_skill.name}")

                    # 记录Buddy调用
                    self.buddy_calls_count += 1

                    # 执行原始函数
                    result = await func(context, *args, **kwargs)

                    logger.info(f"Buddy技能 {buddy_skill.name} 执行完成")
                    return result

                except Exception as e:
                    logger.error(f"Buddy技能 {buddy_skill.name} 执行失败: {e}")
                    self.record_error()
                    raise

            # 注册技能
            self.skills_registry[buddy_skill.name] = buddy_skill

            # 如果启用了跨CLI功能，注册跨CLI能力
            if buddy_skill.cross_cli_enabled:
                await self._register_cross_cli_capabilities(buddy_skill, wrapped_func)

            return wrapped_func

        return decorator

    async def _register_cross_cli_coordinator_buddy(self) -> None:
        """注册跨CLI协调器Buddy"""

        @self.buddy(
            name="cross_cli_coordinator",
            description="跨CLI协调器 - 协调不同AI CLI工具的调用",
            capabilities=[
                "跨CLI调用协调",
                "多工具协作",
                "任务路由",
                "结果整合"
            ],
            priority=100,
            supported_clis=["claude", "gemini", "qwencode", "iflow", "qoder", "codex"],
            cross_cli_enabled=True,
            auto_collaboration=True
        )
        async def cross_cli_coordinator_buddy(context: BuddyContext) -> str:
            """跨CLI协调器Buddy处理函数"""
            if not context.intent or not context.intent.is_cross_cli:
                return "没有检测到跨CLI调用意图"

            target_cli = context.intent.target_cli
            task = context.intent.task

            logger.info(f"跨CLI协调器: 调用 {target_cli} 执行任务: {task}")

            # 获取目标CLI适配器
            from ...core.base_adapter import get_cross_cli_adapter
            target_adapter = get_cross_cli_adapter(target_cli)

            if not target_adapter or not target_adapter.is_available():
                return f"目标CLI工具 '{target_cli}' 不可用"

            # 构建执行上下文
            execution_context = {
                'source_cli': self.cli_name,
                'target_cli': target_cli,
                'original_task': task,
                'buddy_context': {
                    'buddy_name': 'cross_cli_coordinator',
                    'capabilities': ['跨CLI调用协调', '多工具协作']
                },
                'timestamp': datetime.now().isoformat()
            }

            # 执行跨CLI调用
            result = await target_adapter.execute_task(task, execution_context)

            # 格式化结果
            formatted_result = self._format_buddy_result(
                "cross_cli_coordinator",
                target_cli,
                task,
                result
            )

            return formatted_result

    async def _register_ai_tool_bridge_buddy(self) -> None:
        """注册AI工具桥接Buddy"""

        @self.buddy(
            name="ai_tool_bridge",
            description="AI工具桥接器 - 连接各种AI工具的通用接口",
            capabilities=[
                "AI工具调用",
                "工具适配",
                "结果转换",
                "错误处理"
            ],
            priority=90,
            supported_clis=["claude", "gemini", "qwencode", "iflow", "qoder", "codex"],
            cross_cli_enabled=True,
            auto_collaboration=False
        )
        async def ai_tool_bridge_buddy(context: BuddyContext) -> str:
            """AI工具桥接器Buddy处理函数"""
            if not context.intent or not context.intent.is_cross_cli:
                return "没有检测到跨CLI调用意图"

            target_cli = context.intent.target_cli
            task = context.intent.task

            # 标准化CLI名称
            cli_mapping = {
                'claude': 'claude',
                'gemini': 'gemini',
                'qwen': 'qwencode',
                'iflow': 'iflow',
                'qoder': 'qoder',
                'codebuddy': 'codex'
            }

            normalized_cli = cli_mapping.get(target_cli.lower(), target_cli)

            logger.info(f"AI工具桥接器: 桥接调用 {normalized_cli} 执行任务: {task}")

            # 获取目标CLI适配器
            from ...core.base_adapter import get_cross_cli_adapter
            target_adapter = get_cross_cli_adapter(normalized_cli)

            if not target_adapter or not target_adapter.is_available():
                return f"目标AI工具 '{normalized_cli}' 不可用或未安装"

            # 预处理任务内容
            processed_task = self._preprocess_task_for_cli(task, normalized_cli)

            # 构建执行上下文
            execution_context = {
                'source_cli': self.cli_name,
                'target_cli': normalized_cli,
                'original_task': task,
                'processed_task': processed_task,
                'buddy_context': {
                    'buddy_name': 'ai_tool_bridge',
                    'capabilities': ['AI工具调用', '工具适配', '结果转换']
                },
                'timestamp': datetime.now().isoformat()
            }

            # 执行跨CLI调用
            result = await target_adapter.execute_task(processed_task, execution_context)

            # 后处理结果
            processed_result = self._postprocess_result_from_cli(result, normalized_cli)

            # 格式化结果
            formatted_result = self._format_buddy_result(
                "ai_tool_bridge",
                normalized_cli,
                task,
                processed_result
            )

            return formatted_result

    async def _register_universal_assistant_buddy(self) -> None:
        """注册通用助手Buddy"""

        @self.buddy(
            name="universal_assistant",
            description="通用助手 - 处理各种通用任务和协调其他Buddy",
            capabilities=[
                "通用问题解答",
                "任务协调",
                "结果整合",
                "Buddy协作"
            ],
            priority=70,
            supported_clis=["claude", "gemini", "qwencode", "iflow", "qoder", "codex"],
            cross_cli_enabled=True,
            auto_collaboration=True
        )
        async def universal_assistant_buddy(context: BuddyContext) -> str:
            """通用助手Buddy处理函数"""
            user_input = context.user_input

            # 首先检查是否为跨CLI调用
            if context.intent and context.intent.is_cross_cli:
                return await self._handle_cross_cli_with_universal_assistant(context)

            # 处理通用任务
            result = await self._handle_general_task_with_universal_assistant(context)
            return result

    async def _handle_cross_cli_with_universal_assistant(self, context: BuddyContext) -> str:
        """通过通用助手处理跨CLI调用"""
        target_cli = context.intent.target_cli
        task = context.intent.task

        logger.info(f"通用助手: 处理跨CLI调用到 {target_cli}")

        # 使用AI工具桥接器
        from ...core.base_adapter import get_cross_cli_adapter
        target_adapter = get_cross_cli_adapter(target_cli)

        if not target_adapter or not target_adapter.is_available():
            return f"目标工具 '{target_cli}' 不可用"

        execution_context = {
            'source_cli': self.cli_name,
            'target_cli': target_cli,
            'original_task': task,
            'buddy_context': {
                'buddy_name': 'universal_assistant',
                'handling_mode': 'cross_cli'
            },
            'timestamp': datetime.now().isoformat()
        }

        result = await target_adapter.execute_task(task, execution_context)

        return self._format_buddy_result("universal_assistant", target_cli, task, result)

    async def _handle_general_task_with_universal_assistant(self, context: BuddyContext) -> str:
        """通过通用助手处理通用任务"""
        user_input = context.user_input

        # 尝试在当前CLI中处理
        try:
            # 这里可以添加CodeBuddy自身的任务处理逻辑
            result = f"CodeBuddy处理任务: {user_input[:100]}..."

            # 记录处理
            self.processed_requests.append({
                'type': 'buddy_task',
                'buddy_name': 'universal_assistant',
                'task': user_input,
                'result': result,
                'timestamp': datetime.now().isoformat()
            })

            return result

        except Exception as e:
            logger.error(f"通用任务处理失败: {e}")
            return f"任务处理失败: {str(e)}"

    def _preprocess_task_for_cli(self, task: str, target_cli: str) -> str:
        """为特定CLI预处理任务"""
        # 根据目标CLI特性调整任务内容
        cli_specific_adjustments = {
            'claude': {
                'prefix': 'Please help me ',
                'suffix': ' Provide detailed analysis.'
            },
            'gemini': {
                'prefix': 'Analyze and process: ',
                'suffix': ' Give comprehensive insights.'
            },
            'qwencode': {
                'prefix': 'Optimize and implement: ',
                'suffix': ' Focus on code quality and best practices.'
            },
            'iflow': {
                'prefix': 'Process through workflow: ',
                'suffix': ' Use appropriate stages and tools.'
            },
            'qoder': {
                'prefix': 'Analyze and suggest: ',
                'suffix': ' Provide actionable recommendations.'
            },
            'codex': {
                'prefix': 'Generate and explain: ',
                'suffix': ' Include code examples and documentation.'
            }
        }

        if target_cli.lower() in cli_specific_adjustments:
            adjustment = cli_specific_adjustments[target_cli.lower()]
            return f"{adjustment['prefix']}{task}{adjustment['suffix']}"

        return task

    def _postprocess_result_from_cli(self, result: str, target_cli: str) -> str:
        """后处理来自特定CLI的结果"""
        # 根据CLI特性调整结果格式
        cli_specific_postprocessing = {
            'claude': {
                'add_source_attribution': True,
                'format_response': True
            },
            'gemini': {
                'add_confidence_scores': True,
                'format_response': True
            }
        }

        if target_cli.lower() in cli_specific_postprocessing:
            processing = cli_specific_postprocessing[target_cli.lower()]

            if processing.get('format_response', False):
                # 简单的响应格式化
                if not result.strip().endswith(('.', '!', '?')):
                    result = result.rstrip('.') + '.'

            if processing.get('add_source_attribution', False):
                # 添加来源标注
                result = f"[{target_cli.upper()}]\n{result}"

        return result

    def _format_buddy_result(self, buddy_name: str, target_cli: str, task: str, result: str) -> str:
        """
        格式化Buddy结果

        Args:
            buddy_name: Buddy名称
            target_cli: 目标CLI工具
            task: 原始任务
            result: 执行结果

        Returns:
            str: 格式化的结果
        """
        return f"""## 🤖 CodeBuddy Buddy结果

**执行Buddy**: {buddy_name}
**调用工具**: {target_cli.upper()}
**原始任务**: {task}
**执行时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

{result}

---

*此结果由CodeBuddy CLI Buddy系统提供*"""

    # ==================== Buddy技能注册方法 ====================

    async def _register_cross_cli_capabilities(self, buddy_skill: BuddySkill, handler_func: Callable) -> None:
        """为Buddy注册跨CLI能力"""
        try:
            # 动态添加跨CLI检测方法
            original_can_handle = getattr(handler_func, 'can_handle', None)

            async def enhanced_can_handle(context: BuddyContext, *args, **kwargs) -> float:
                # 优先检查跨CLI调用
                if context.intent and context.intent.is_cross_cli:
                    # 检查Buddy是否支持目标CLI
                    if (buddy_skill.cross_cli_enabled and
                        context.intent.target_cli.lower() in [cli.lower() for cli in buddy_skill.supported_clis]):
                        return 0.9  # 高优先级处理跨CLI调用

                # 如果不是跨CLI调用，调用原始方法
                if original_can_handle:
                    return await original_can_handle(context, *args, **kwargs)

                return 0.0  # 默认不处理

            # 包装原始函数的can_handle方法
            setattr(handler_func, 'can_handle', enhanced_can_handle)

        except Exception as e:
            logger.error(f"注册跨CLI能力失败: {e}")

    async def _discover_buddy_modules(self) -> None:
        """发现和加载外部Buddy模块"""
        try:
            if not os.path.exists(self.buddy_modules_dir):
                logger.info("Buddy模块目录不存在，跳过发现")
                return

            # 扫描Python文件
            for module_file in Path(self.buddy_modules_dir).glob("*.py"):
                if module_file.name.startswith("__"):
                    continue

                try:
                    # 动态导入模块
                    module_name = f"buddies.{module_file.stem}"
                    spec = importlib.util.spec_from_file_location(module_name, module_file)
                    module = importlib.util.module_from_spec(spec)

                    # 查找Buddy装饰器的方法
                    for attr_name in dir(module):
                        attr = getattr(module, attr_name)
                        if callable(attr) and hasattr(attr, '__wrapped__'):
                            # 这是一个被@buddy装饰的方法
                            original_func = attr.__wrapped__

                            # 获取Buddy技能信息
                            buddy_name = getattr(original_func, '_buddy_name', attr_name)
                            if buddy_name not in self.skills_registry:
                                # 创建默认技能信息
                                buddy_skill = BuddySkill(
                                    name=buddy_name,
                                    description=f"外部Buddy技能: {attr_name}",
                                    capabilities=[],
                                    priority=50
                                )

                                # 存储原始函数引用
                                buddy_skill.metadata['function'] = original_func.__name__
                                buddy_skill.metadata['module'] = module_name
                                self.skills_registry[buddy_name] = buddy_skill

                                # 注册跨CLI能力
                                await self._register_cross_cli_capabilities(buddy_skill, attr)

                            self.buddy_instances[buddy_name] = attr
                            self.active_buddies[buddy_name] = {
                                'module': module_name,
                                'instance': attr,
                                'last_used': datetime.now()
                            }

                    logger.info(f"发现并加载Buddy模块: {module_file.name}")

                except Exception as e:
                    logger.error(f"加载Buddy模块 {module_file} 失败: {e}")

        except Exception as e:
            logger.error(f"Buddy模块发现失败: {e}")

    async def _initialize_cross_cli_system(self) -> None:
        """初始化跨CLI协作系统"""
        try:
            logger.info("初始化CodeBuddy跨CLI协作系统")

            # 设置协作会话跟踪
            self.collaboration_sessions = {}

            logger.info("跨CLI协作系统初始化完成")

        except Exception as e:
            logger.error(f"初始化跨CLI协作系统失败: {e}")

    # ==================== Buddy调用处理 ====================

    async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
        """
        执行跨CLI任务 - CodeBuddy适配器的具体实现

        Args:
            task: 要执行的任务描述
            context: 执行上下文信息

        Returns:
            str: 任务执行结果
        """
        try:
            session_id = context.get('session_id', f"task-{datetime.now().timestamp()}")

            # 创建Buddy上下文
            buddy_context = BuddyContext(
                session_id=session_id,
                user_input=task,
                parameters=context.get('parameters', {}),
                metadata=context.get('metadata', {})
            )

            # 解析意图
            intent = self.parser.parse_intent(task, "codebuddy")
            buddy_context.intent = intent

            # 选择最合适的Buddy
            selected_buddy = await self._select_best_buddy(buddy_context)

            if selected_buddy:
                # 调用选中的Buddy
                buddy_instance = self.active_buddies.get(selected_buddy)
                if buddy_instance:
                    # 更新使用时间
                    self.active_buddies[selected_buddy]['last_used'] = datetime.now()

                    # 设置Buddy名称到上下文
                    buddy_context.buddy_name = selected_buddy

                    try:
                        # 调用Buddy处理函数
                        result = await buddy_instance(buddy_context)

                        # 记录Buddy调用
                        self.processed_requests.append({
                            'type': 'buddy_call',
                            'buddy_name': selected_buddy,
                            'task': task,
                            'session_id': session_id,
                            'success': True,
                            'result_length': len(str(result)),
                            'timestamp': datetime.now().isoformat()
                        })

                        return result

                    except Exception as e:
                        logger.error(f"Buddy {selected_buddy} 调用失败: {e}")
                        self.record_error()

                        # 记录失败
                        self.processed_requests.append({
                            'type': 'buddy_call',
                            'buddy_name': selected_buddy,
                            'task': task,
                            'session_id': session_id,
                            'success': False,
                            'error': str(e),
                            'timestamp': datetime.now().isoformat()
                        })

                        return f"Buddy {selected_buddy} 调用失败: {str(e)}"
            else:
                # 没有合适的Buddy，使用通用助手
                logger.warning("没有找到合适的Buddy，使用通用助手")
                return await self._fallback_to_general_assistant(buddy_context)

        except Exception as e:
            logger.error(f"执行任务失败: {task}, 错误: {e}")
            self.record_error()
            return f"任务执行失败: {str(e)}"

    async def _select_best_buddy(self, context: BuddyContext) -> Optional[str]:
        """
        选择最合适的Buddy

        Args:
            context: Buddy上下文

        Returns:
            Optional[str]: 选择的Buddy名称，如果没有合适的返回None
        """
        try:
            candidates = []

            for buddy_name, buddy_instance in self.active_buddies.items():
                try:
                    # 检查Buddy是否愿意处理
                    can_handle = await buddy_instance.can_handle(context)
                    if can_handle > 0:
                        buddy_skill = self.skills_registry.get(buddy_name)
                        if buddy_skill:
                            candidates.append({
                                'name': buddy_name,
                                'priority': buddy_skill.priority,
                                'can_handle': can_handle,
                                'buddy_skill': buddy_skill
                            })
                except Exception as e:
                    logger.warning(f"检查Buddy {buddy_name} 处理能力失败: {e}")
                    continue

            # 如果是跨CLI调用，优先选择支持跨CLI的Buddy
            if context.intent and context.intent.is_cross_cli:
                cross_cli_candidates = [
                    c for c in candidates
                    if (c['buddy_skill'].cross_cli_enabled and
                        context.intent.target_cli.lower() in [cli.lower() for cli in c['buddy_skill'].supported_clis])
                ]
                if cross_cli_candidates:
                    # 选择优先级最高的跨CLI Buddy
                    cross_cli_candidates.sort(key=lambda x: (x['priority'], x['can_handle']), reverse=True)
                    return cross_cli_candidates[0]['name']

            # 按优先级和匹配度排序
            if candidates:
                candidates.sort(key=lambda x: (x['priority'], x['can_handle']), reverse=True)
                return candidates[0]['name']

            return None

        except Exception as e:
            logger.error(f"选择Buddy失败: {e}")
            return None

    async def _fallback_to_general_assistant(self, context: BuddyContext) -> str:
        """回退到通用助手"""
        try:
            # 使用内置的通用助手Buddy
            universal_buddy = self.active_buddies.get('universal_assistant')
            if universal_buddy:
                context.buddy_name = 'universal_assistant'
                return await universal_buddy(context)

            return "CodeBuddy: 没有可用的助手来处理这个任务"

        except Exception as e:
            logger.error(f"通用助手回退失败: {e}")
            return f"任务处理失败: {str(e)}"

    # ==================== 基础接口实现 ====================

    def is_available(self) -> bool:
        """
        检查适配器是否可用

        Returns:
            bool: 是否可用
        """
        return (
            len(self.skills_registry) > 0 and
            len(self.active_buddies) > 0 and
            os.path.exists(self.buddy_config_file)
        )

    async def health_check(self) -> Dict[str, Any]:
        """
        健康检查

        Returns:
            Dict[str, Any]: 健康状态
        """
        base_health = await super().health_check()

        codebuddy_health = {
            'buddy_config_file': self.buddy_config_file,
            'buddy_modules_dir': self.buddy_modules_dir,
            'config_exists': os.path.exists(self.buddy_config_file),
            'modules_dir_exists': os.path.exists(self.buddy_modules_dir),
            'registered_skills_count': len(self.skills_registry),
            'active_buddies_count': len(self.active_buddies),
            'buddy_calls_count': self.buddy_calls_count,
            'cross_cli_calls_count': self.cross_cli_calls_count,
            'processed_requests_count': len(self.processed_requests),
            'collaboration_sessions_count': len(self.collaboration_sessions),
            'buddy_config': self.buddy_config.copy(),
            'supported_clis': list(set().union(*[
                skill.supported_clis for skill in self.skills_registry.values()
            ])),
            'enabled_buddies': list(self.skills_registry.keys())
        }

        # 检查环境
        try:
            codebuddy_health['codebuddy_environment'] = self._check_codebuddy_environment()
        except Exception as e:
            codebuddy_health['codebuddy_environment_error'] = str(e)

        # 检查Buddy状态
        try:
            for buddy_name, buddy_instance in self.active_buddies.items():
                buddy_skill = self.skills_registry.get(buddy_name)
                if buddy_skill:
                    # 尝试检查Buddy是否响应
                    if hasattr(buddy_instance, 'is_healthy'):
                        if isinstance(buddy_instance.is_healthy, type(True)):
                            healthy = buddy_instance.is_healthy()
                        else:
                            # 假设为健康
                            healthy = True
                    else:
                        healthy = True

                    codebuddy_health[f'buddy_{buddy_name}_healthy'] = healthy

        except Exception as e:
            logger.error(f"检查Buddy状态失败: {e}")

        # 合并基础健康信息
        base_health.update(codebuddy_health)
        return base_health

    def get_statistics(self) -> Dict[str, Any]:
        """
        获取适配器统计信息

        Returns:
            Dict[str, Any]: 统计信息
        """
        base_stats = super().get_statistics()

        codebuddy_stats = {
            'registered_skills_count': len(self.skills_registry),
            'active_buddies_count': len(self.active_buddy_instances),
            'buddy_calls_count': self.buddy_calls_count,
            'cross_cli_calls_count': self.cross_cli_calls_count,
            'processed_requests_count': len(self.processed_requests),
            'collaboration_sessions_count': len(self.collaboration_sessions),
            'supported_clis': list(set().union(*[
                skill.supported_clis for skill in self.skills_registry.values()
            ])),
            'enabled_buddies': list(self.skills_registry.keys()),
            'buddy_priorities': {
                name: skill.priority for name, skill in self.skills_registry.items()
            }
        }

        # 计算Buddy使用统计
        buddy_usage = {}
        for buddy_name, buddy_info in self.active_buddies.items():
            buddy_skill = self.skills_registry.get(buddy_name)
            if buddy_skill:
                buddy_usage[buddy_name] = {
                    'calls': buddy_info.get('call_count', 0),
                    'last_used': buddy_info.get('last_used'),
                    'priority': buddy_skill.priority
                }

        codebuddy_stats['buddy_usage'] = buddy_usage
        base_stats.update(codebuddy_stats)
        return base_stats

    async def cleanup(self) -> bool:
        """
        清理适配器资源

        Returns:
            bool: 清理是否成功
        """
        try:
            # 清理统计信息
            self.processed_requests.clear()
            self.collaboration_sessions.clear()
            self.buddy_calls_count = 0
            self.cross_cli_calls_count = 0

            # 清理Buddy实例
            self.buddy_instances.clear()
            self.active_buddies.clear()

            logger.info("CodeBuddy Buddy适配器清理完成")
            return True

        except Exception as e:
            logger.error(f"清理CodeBuddy Buddy适配器失败: {e}")
            return False


# 创建全局适配器实例
_global_adapter: Optional[CodeBuddyBuddyAdapter] = None


def get_codebuddy_buddy_adapter() -> CodeBuddyBuddyAdapter:
    """
    获取CodeBuddy Buddy适配器实例

    Returns:
        CodeBuddyBuddyAdapter: 适配器实例
    """
    global _global_adapter
    if _global_adapter is None:
        _global_adapter = CodeBuddyBuddyAdapter()
        # 异步初始化需要在调用时进行
    return _global_adapter


# 便捷函数
async def initialize_codebuddy_buddy_adapter() -> bool:
    """
    初始化CodeBuddy Buddy适配器

    Returns:
        bool: 初始化是否成功
    """
    adapter = get_codebuddy_buddy_adapter()
    return await adapter.initialize()


def is_codebuddy_buddy_adapter_available() -> bool:
    """
    检查CodeBuddy Buddy适配器是否可用

    Returns:
        bool: 是否可用
    """
    adapter = get_codebuddy_buddy_adapter()
    return adapter.is_available()


# 便捷装饰器
def register_buddy(name: str = "", description: str = "", **kwargs):
    """
    便捷的Buddy注册装饰器

    Args:
        name: Buddy名称
        description: Buddy描述
        **kwargs: 其他参数传递给@buddy装饰器
    """
    adapter = get_codebuddy_buddy_adapter()
    return adapter.buddy(name, description, **kwargs)


if __name__ == "__main__":
    import asyncio

    async def main():
        """主函数 - 用于测试和独立运行"""
        adapter = CodeBuddyBuddyAdapter()

        # 初始化
        if await adapter.initialize():
            print("CodeBuddy Buddy适配器初始化成功")

            # 显示统计信息
            stats = adapter.get_statistics()
            print("\nBuddy系统统计:")
            print(f"注册技能数: {stats['registered_skills_count']}")
            print(f"活动Buddy数: {stats['active_buddies_count']}")
            print(f"支持的CLI工具: {', '.join(stats['supported_clis'])}")

        else:
            print("CodeBuddy Buddy适配器初始化失败")

    asyncio.run(main())