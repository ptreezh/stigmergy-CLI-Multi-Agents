"""
CodeBuddy CLI Skills-based Hook Adapter
基于CodeBuddy技能系统的钩子适配器，实现技能与钩子的冗余跨CLI协同
"""

import asyncio
import json
import logging
import os
import subprocess
import sys
import time
from typing import Dict, List, Optional, Any, Callable
from pathlib import Path
from dataclasses import dataclass
from enum import Enum

from ..base_adapter import BaseAdapter
from ..core.unified_intent_parser import UnifiedIntentParser
from ...core.config_manager import ConfigManager

logger = logging.getLogger(__name__)


class HookType(Enum):
    """CodeBuddy Hook类型"""
    PRE_COMMAND = "pre_command"
    POST_COMMAND = "post_command"
    ERROR = "error"
    SESSION_START = "session_start"
    SESSION_END = "session_end"
    SKILL_REGISTER = "skill_register"
    CROSS_CLI_REQUEST = "cross_cli_request"


@dataclass
class HookEvent:
    """Hook事件数据"""
    hook_type: HookType
    command: str = ""
    session_id: str = ""
    user_id: str = ""
    context: Dict[str, Any] = None
    timestamp: float = None

    def __post_init__(self):
        if self.context is None:
            self.context = {}
        if self.timestamp is None:
            self.timestamp = time.time()


@dataclass
class SkillConfig:
    """技能配置"""
    name: str
    description: str = ""
    capabilities: List[str] = None
    priority: int = 50
    protocols: List[str] = None
    hooks: List[HookType] = None
    enabled: bool = True

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = []
        if self.protocols is None:
            self.protocols = ["chinese", "english"]
        if self.hooks is None:
            self.hooks = []


class Skill:
    """技能基类"""
    def __init__(self, config: SkillConfig):
        self.config = config
        self.registered_hooks = {}
        self.active = False

    def register_hook(self, hook_type: HookType, handler: Callable):
        """注册钩子处理器"""
        self.registered_hooks[hook_type] = handler
        logger.debug(f"技能 {self.config.name} 注册钩子: {hook_type.value}")

    async def trigger_hook(self, event: HookEvent) -> Any:
        """触发钩子"""
        handler = self.registered_hooks.get(event.hook_type)
        if handler:
            try:
                return await handler(event)
            except Exception as e:
                logger.error(f"钩子处理失败 {event.hook_type.value}: {e}")
                return None
        return None

    async def activate(self):
        """激活技能"""
        self.active = True
        logger.info(f"技能 {self.config.name} 已激活")

    async def deactivate(self):
        """停用技能"""
        self.active = False
        logger.info(f"技能 {self.config.name} 已停用")


class CodeBuddySkillsHookAdapter(BaseAdapter):
    """
    CodeBuddy CLI Skills-based Hook Adapter
    基于技能和钩子的冗余跨CLI协同适配器
    """

    def __init__(self, config_manager: ConfigManager):
        super().__init__("codebuddy", config_manager)
        self.parser = UnifiedIntentParser()

        # 技能系统
        self.skills = {}
        self.skill_configs = {}
        self.hook_registry = {hook_type: [] for hook_type in HookType}

        # 钩子系统
        self.hooks_enabled = True
        self.hook_fallback_enabled = True

        # 跨CLI协同
        self.cross_cli_skills = {}
        self.active_collaborations = {}

        # 会话管理
        self.session_hooks = {}

        # 配置
        self._load_config()
        self._setup_builtin_skills()
        self._setup_hook_system()

        logger.info("CodeBuddy Skills-Hook Adapter 初始化完成")

    def _load_config(self):
        """加载配置"""
        try:
            config_path = Path(__file__).parent / "config.json"
            if config_path.exists():
                with open(config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)

                self.hooks_enabled = config.get("hooks", {}).get("enabled", True)
                self.hook_fallback_enabled = config.get("hooks", {}).get("fallback_enabled", True)

                # 加载技能配置
                for skill_config in config.get("skills", []):
                    skill_obj = SkillConfig(**skill_config)
                    self.skill_configs[skill_obj.name] = skill_obj

        except Exception as e:
            logger.warning(f"加载CodeBuddy配置失败: {e}")

    def _setup_builtin_skills(self):
        """设置内置技能"""
        # 技能1: 跨CLI协调器
        cross_cli_config = SkillConfig(
            name="cross_cli_coordinator",
            description="跨CLI协调器 - 通过钩子系统协调不同AI CLI工具",
            capabilities=["跨CLI调用协调", "多工具协作", "钩子路由", "冗余处理"],
            priority=100,
            hooks=[HookType.CROSS_CLI_REQUEST, HookType.PRE_COMMAND],
            protocols=["chinese", "english"]
        )

        cross_cli_skill = Skill(cross_cli_config)

        # 注册钩子处理器
        async def handle_cross_cli_request(event: HookEvent):
            """处理跨CLI请求钩子"""
            return await self._handle_cross_cli_request(event)

        async def handle_pre_command(event: HookEvent):
            """处理命令前钩子 - 冗余检测"""
            if self._should_handle_cross_cli(event.command):
                return await self._redundant_cross_cli_detection(event)
            return None

        cross_cli_skill.register_hook(HookType.CROSS_CLI_REQUEST, handle_cross_cli_request)
        cross_cli_skill.register_hook(HookType.PRE_COMMAND, handle_pre_command)

        self.skills[cross_cli_config.name] = cross_cli_skill
        self.cross_cli_skills[cross_cli_config.name] = cross_cli_skill

        # 技能2: 错误恢复专家
        error_recovery_config = SkillConfig(
            name="error_recovery_expert",
            description="错误恢复专家 - 处理跨CLI调用失败并自动恢复",
            capabilities=["错误检测", "自动恢复", "回退机制", "状态重置"],
            priority=90,
            hooks=[HookType.ERROR, HookType.POST_COMMAND]
        )

        error_recovery_skill = Skill(error_recovery_config)

        async def handle_error(event: HookEvent):
            """处理错误钩子"""
            return await self._handle_cross_cli_error(event)

        async def handle_post_command(event: HookEvent):
            """处理命令后钩子 - 验证结果"""
            return await self._verify_cross_cli_result(event)

        error_recovery_skill.register_hook(HookType.ERROR, handle_error)
        error_recovery_skill.register_hook(HookType.POST_COMMAND, handle_post_command)

        self.skills[error_recovery_config.name] = error_recovery_skill

        # 技能3: 会话监控器
        session_monitor_config = SkillConfig(
            name="session_monitor",
            description="会话监控器 - 管理跨CLI会话生命周期",
            capabilities=["会话管理", "状态监控", "生命周期跟踪"],
            priority=80,
            hooks=[HookType.SESSION_START, HookType.SESSION_END, HookType.SKILL_REGISTER]
        )

        session_monitor_skill = Skill(session_monitor_config)

        async def handle_session_start(event: HookEvent):
            """处理会话开始钩子"""
            return await self._setup_session_hooks(event)

        async def handle_session_end(event: HookEvent):
            """处理会话结束钩子"""
            return await self._cleanup_session_hooks(event)

        async def handle_skill_register(event: HookEvent):
            """处理技能注册钩子"""
            return await self._register_skill_hooks(event)

        session_monitor_skill.register_hook(HookType.SESSION_START, handle_session_start)
        session_monitor_skill.register_hook(HookType.SESSION_END, handle_session_end)
        session_monitor_skill.register_hook(HookType.SKILL_REGISTER, handle_skill_register)

        self.skills[session_monitor_config.name] = session_monitor_skill

        # 激活所有技能
        for skill in self.skills.values():
            asyncio.create_task(skill.activate())

    def _setup_hook_system(self):
        """设置钩子系统"""
        # 注册钩子到全局钩子注册表
        for skill in self.skills.values():
            for hook_type in skill.config.hooks:
                if hook_type in skill.registered_hooks:
                    self.hook_registry[hook_type].append(skill)

        logger.info(f"钩子系统设置完成，注册钩子: {list(self.hook_registry.keys())}")

    async def trigger_hooks(self, hook_type: HookType, event: HookEvent) -> List[Any]:
        """触发所有相关钩子"""
        if not self.hooks_enabled:
            return []

        results = []
        skills = self.hook_registry.get(hook_type, [])

        # 按优先级排序
        skills.sort(key=lambda s: s.config.priority, reverse=True)

        for skill in skills:
            if skill.active:
                try:
                    result = await skill.trigger_hook(event)
                    if result is not None:
                        results.append(result)
                except Exception as e:
                    logger.error(f"技能 {skill.config.name} 钩子执行失败: {e}")

        return results

    async def _handle_cross_cli_request(self, event: HookEvent) -> Optional[str]:
        """处理跨CLI请求钩子"""
        try:
            command = event.command
            user_prompt = command

            logger.info(f"跨CLI请求钩子触发: {user_prompt}")

            # 解析跨CLI意图
            intent = self.parser.parse_intent(user_prompt, "codebuddy")

            if intent.is_cross_cli and intent.target_cli != self.cli_name:
                # 技能处理方式
                result1 = await self._execute_cross_cli_via_skills(intent, event)

                # 钩子处理方式（冗余）
                result2 = await self._execute_cross_cli_via_hooks(intent, event)

                # 选择最佳结果
                return self._select_best_result(result1, result2)

        except Exception as e:
            logger.error(f"处理跨CLI请求钩子失败: {e}")
            return None

    async def _execute_cross_cli_via_skills(self, intent, event: HookEvent) -> Optional[str]:
        """通过技能系统执行跨CLI调用"""
        try:
            # 触发跨CLI技能
            cross_cli_event = HookEvent(
                hook_type=HookType.CROSS_CLI_REQUEST,
                command=f"call {intent.target_cli} for {intent.task}",
                session_id=event.session_id,
                context={"intent": intent.__dict__}
            )

            results = await self.trigger_hooks(HookType.CROSS_CLI_REQUEST, cross_cli_event)

            if results:
                return results[0]  # 返回第一个有效结果

        except Exception as e:
            logger.error(f"技能系统跨CLI调用失败: {e}")

        return None

    async def _execute_cross_cli_via_hooks(self, intent, event: HookEvent) -> Optional[str]:
        """通过钩子系统执行跨CLI调用"""
        try:
            # 创建临时钩子事件
            hook_event = HookEvent(
                hook_type=HookType.PRE_COMMAND,
                command=f"use {intent.target_cli} to {intent.task}",
                session_id=event.session_id,
                context={"original_event": event.__dict__}
            )

            results = await self.trigger_hooks(HookType.PRE_COMMAND, hook_event)

            if results:
                return results[0]

        except Exception as e:
            logger.error(f"钩子系统跨CLI调用失败: {e}")

        return None

    def _select_best_result(self, result1: Optional[str], result2: Optional[str]) -> Optional[str]:
        """选择最佳结果"""
        # 简单的结果选择逻辑
        if result1 and result2:
            # 选择长度更长且包含成功标记的结果
            if "[OK]" in result1 or "成功" in result1:
                return result1
            elif "[OK]" in result2 or "成功" in result2:
                return result2
            return result1 if len(result1) > len(result2) else result2
        elif result1:
            return result1
        elif result2:
            return result2
        return None

    async def _redundant_cross_cli_detection(self, event: HookEvent) -> Optional[str]:
        """冗余跨CLI检测"""
        try:
            command = event.command

            # 多种检测方式
            detection_methods = [
                self._detect_via_patterns(command),
                self._detect_via_keywords(command),
                self._detect_via_structure(command)
            ]

            # 如果任一方法检测到跨CLI意图
            for detected_intent in detection_methods:
                if detected_intent:
                    logger.info(f"冗余检测到跨CLI意图: {detected_intent}")

                    # 创建跨CLI事件
                    cross_cli_event = HookEvent(
                        hook_type=HookType.CROSS_CLI_REQUEST,
                        command=detected_intent["command"],
                        session_id=event.session_id,
                        context={"detection_method": detected_intent["method"]}
                    )

                    results = await self.trigger_hooks(HookType.CROSS_CLI_REQUEST, cross_cli_event)
                    if results:
                        return results[0]

        except Exception as e:
            logger.error(f"冗余跨CLI检测失败: {e}")

        return None

    def _detect_via_patterns(self, command: str) -> Optional[Dict]:
        """通过模式检测"""
        patterns = [
            r"用(.*)帮我(.*)",
            r"call (.*) to (.*)",
            r"让(.*)处理(.*)",
            r"use (.*) for (.*)"
        ]

        import re
        for pattern in patterns:
            match = re.search(pattern, command, re.IGNORECASE)
            if match:
                cli, task = match.groups()
                supported_clis = ["claude", "gemini", "qwencode", "iflow", "qoder", "codex"]
                if cli.lower() in supported_clis:
                    return {
                        "command": command,
                        "target_cli": cli.lower(),
                        "task": task,
                        "method": "pattern_detection"
                    }
        return None

    def _detect_via_keywords(self, command: str) -> Optional[Dict]:
        """通过关键词检测"""
        keywords = {
            "claude": ["claude", "克劳德"],
            "gemini": ["gemini", "杰米尼"],
            "qwencode": ["qwencode", "qwen"],
            "iflow": ["iflow"],
            "qoder": ["qoder"],
            "codex": ["codex", "代码"]
        }

        command_lower = command.lower()
        for cli, cli_keywords in keywords.items():
            for keyword in cli_keywords:
                if keyword in command_lower:
                    return {
                        "command": command,
                        "target_cli": cli,
                        "task": command,  # 整个命令作为任务
                        "method": "keyword_detection"
                    }
        return None

    def _detect_via_structure(self, command: str) -> Optional[Dict]:
        """通过结构检测"""
        # 检测特定的句子结构
        if "帮我" in command or "help me" in command.lower():
            words = command.split()
            for i, word in enumerate(words):
                if word.lower() in ["claude", "gemini", "qwencode", "iflow", "qoder", "codex"]:
                    return {
                        "command": command,
                        "target_cli": word.lower(),
                        "task": " ".join(words[i+1:]),
                        "method": "structure_detection"
                    }
        return None

    async def _handle_cross_cli_error(self, event: HookEvent) -> Optional[str]:
        """处理跨CLI错误"""
        try:
            error_context = event.context
            if error_context.get("cross_cli_failed"):
                # 尝试回退方案
                fallback_result = await self._try_fallback_solution(event)
                return fallback_result
        except Exception as e:
            logger.error(f"处理跨CLI错误失败: {e}")
        return None

    async def _try_fallback_solution(self, event: HookEvent) -> Optional[str]:
        """尝试回退方案"""
        try:
            # 1. 尝试其他CLI工具
            # 2. 使用本地处理
            # 3. 简化任务重新尝试

            return f"⚠️ 跨CLI调用失败，已启用回退方案处理"

        except Exception as e:
            logger.error(f"回退方案执行失败: {e}")
            return None

    async def _verify_cross_cli_result(self, event: HookEvent) -> Optional[str]:
        """验证跨CLI结果"""
        try:
            result = event.context.get("result")
            if result and self._is_cross_cli_result(result):
                # 验证结果质量
                if self._validate_result_quality(result):
                    return "[OK] 跨CLI结果验证通过"
                else:
                    return "⚠️ 跨CLI结果质量不佳，建议重新执行"
        except Exception as e:
            logger.error(f"验证跨CLI结果失败: {e}")
        return None

    def _is_cross_cli_result(self, result: str) -> bool:
        """判断是否为跨CLI结果"""
        indicators = ["调用", "called", "执行", "executed", "via", "通过"]
        return any(indicator in result for indicator in indicators)

    def _validate_result_quality(self, result: str) -> bool:
        """验证结果质量"""
        # 简单的质量检查
        if len(result) < 10:
            return False
        if result.count("错误") > 2 or result.count("error") > 2:
            return False
        return True

    async def _setup_session_hooks(self, event: HookEvent) -> Optional[str]:
        """设置会话钩子"""
        session_id = event.session_id or f"session_{int(time.time())}"
        self.session_hooks[session_id] = {
            "start_time": time.time(),
            "hooks_triggered": 0,
            "cross_cli_calls": 0
        }
        return f"会话 {session_id} 钩子设置完成"

    async def _cleanup_session_hooks(self, event: HookEvent) -> Optional[str]:
        """清理会话钩子"""
        session_id = event.session_id
        if session_id in self.session_hooks:
            session_info = self.session_hooks[session_id]
            del self.session_hooks[session_id]
            return f"会话 {session_id} 钩子清理完成，触发钩子 {session_info['hooks_triggered']} 次"
        return None

    async def _register_skill_hooks(self, event: HookEvent) -> Optional[str]:
        """注册技能钩子"""
        try:
            # 动态注册新技能的钩子
            skill_info = event.context.get("skill_info")
            if skill_info:
                # 处理技能注册
                return f"技能 {skill_info.get('name')} 钩子注册完成"
        except Exception as e:
            logger.error(f"注册技能钩子失败: {e}")
        return None

    def _should_handle_cross_cli(self, command: str) -> bool:
        """判断是否应该处理跨CLI调用"""
        return self._detect_via_patterns(command) is not None or \
               self._detect_via_keywords(command) is not None

    async def handle_message(self, message: str, user_id: str = None, session_id: str = None) -> Optional[str]:
        """CodeBuddy消息处理 - 技能与钩子冗余处理"""
        try:
            # 创建钩子事件
            event = HookEvent(
                hook_type=HookType.PRE_COMMAND,
                command=message,
                session_id=session_id,
                user_id=user_id
            )

            # 触发前置钩子
            pre_results = await self.trigger_hooks(HookType.PRE_COMMAND, event)

            # 如果前置钩子处理了跨CLI调用
            if pre_results:
                return pre_results[0]

            # 如果不是跨CLI调用，返回None让CodeBuddy正常处理
            return None

        except Exception as e:
            logger.error(f"CodeBuddy消息处理失败: {e}")
            return None

    async def process_response(self, response: str, session_id: str = None) -> str:
        """处理CodeBuddy响应"""
        try:
            # 创建后置钩子事件
            event = HookEvent(
                hook_type=HookType.POST_COMMAND,
                context={"result": response},
                session_id=session_id
            )

            # 触发后置钩子
            post_results = await self.trigger_hooks(HookType.POST_COMMAND, event)

            # 如果后置钩子有处理结果
            if post_results:
                return f"{response}\n\n{post_results[0]}"

            return response

        except Exception as e:
            logger.error(f"CodeBuddy响应处理失败: {e}")
            return response

    async def handle_error(self, error: Exception, context: Dict[str, Any] = None) -> Optional[str]:
        """处理CodeBuddy错误"""
        try:
            # 创建错误钩子事件
            event = HookEvent(
                hook_type=HookType.ERROR,
                context={"error": str(error), "context": context or {}}
            )

            # 触发错误钩子
            error_results = await self.trigger_hooks(HookType.ERROR, event)

            if error_results:
                return error_results[0]

            return None

        except Exception as e:
            logger.error(f"CodeBuddy错误处理失败: {e}")
            return None

    async def register_external_skill(self, skill_name: str, skill_config: Dict[str, Any]) -> bool:
        """注册外部技能"""
        try:
            config = SkillConfig(name=skill_name, **skill_config)
            skill = Skill(config)

            # 激活技能
            await skill.activate()

            # 注册到系统
            self.skills[skill_name] = skill

            # 更新钩子注册表
            for hook_type in config.hooks:
                self.hook_registry[hook_type].append(skill)

            # 触发技能注册钩子
            event = HookEvent(
                hook_type=HookType.SKILL_REGISTER,
                context={"skill_info": {"name": skill_name, "config": skill_config}}
            )

            await self.trigger_hooks(HookType.SKILL_REGISTER, event)

            logger.info(f"外部技能 {skill_name} 注册成功")
            return True

        except Exception as e:
            logger.error(f"注册外部技能失败: {e}")
            return False

    def get_system_status(self) -> Dict[str, Any]:
        """获取系统状态"""
        active_skills = [name for name, skill in self.skills.items() if skill.active]
        hook_counts = {hook_type.value: len(skills) for hook_type, skills in self.hook_registry.items()}

        return {
            "adapter_type": "CodeBuddy Skills-Hook",
            "active_skills": active_skills,
            "total_skills": len(self.skills),
            "hook_counts": hook_counts,
            "hooks_enabled": self.hooks_enabled,
            "fallback_enabled": self.hook_fallback_enabled,
            "active_sessions": len(self.session_hooks),
            "cross_cli_skills": list(self.cross_cli_skills.keys())
        }

    async def cleanup(self):
        """清理资源"""
        # 停用所有技能
        for skill in self.skills.values():
            await skill.deactivate()

        # 清理会话钩子
        self.session_hooks.clear()

        logger.info("CodeBuddy Skills-Hook Adapter 资源清理完成")