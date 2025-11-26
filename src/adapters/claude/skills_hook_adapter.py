"""
Claude CLI Skills-based Hook Adapter
基于Claude技能系统的钩子适配器，实现技能与钩子的冗余跨CLI协同
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
    """Claude Hook类型"""
    USER_PROMPT_SUBMIT = "user_prompt_submit"
    TOOL_USE_PRE = "tool_use_pre"
    TOOL_USE_POST = "tool_use_post"
    RESPONSE_GENERATED = "response_generated"
    SESSION_START = "session_start"
    SESSION_END = "session_end"
    SKILL_REGISTER = "skill_register"
    CROSS_CLI_REQUEST = "cross_cli_request"
    ERROR_HANDLING = "error_handling"


@dataclass
class HookEvent:
    """Hook事件数据"""
    hook_type: HookType
    prompt: str = ""
    session_id: str = ""
    user_id: str = ""
    metadata: Dict[str, Any] = None
    timestamp: float = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
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
    category: str = ""
    author: str = ""

    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = []
        if self.protocols is None:
            self.protocols = ["chinese", "english"]
        if self.hooks is None:
            self.hooks = []


class ClaudeSkill:
    """Claude技能基类"""
    def __init__(self, config: SkillConfig):
        self.config = config
        self.registered_hooks = {}
        self.active = False
        self.usage_count = 0
        self.success_count = 0

    def register_hook(self, hook_type: HookType, handler: Callable):
        """注册钩子处理器"""
        self.registered_hooks[hook_type] = handler
        logger.debug(f"Claude技能 {self.config.name} 注册钩子: {hook_type.value}")

    async def trigger_hook(self, event: HookEvent) -> Any:
        """触发钩子"""
        handler = self.registered_hooks.get(event.hook_type)
        if handler:
            try:
                self.usage_count += 1
                result = await handler(event)
                if result:
                    self.success_count += 1
                return result
            except Exception as e:
                logger.error(f"Claude技能钩子处理失败 {event.hook_type.value}: {e}")
                return None
        return None

    async def activate(self):
        """激活技能"""
        self.active = True
        logger.info(f"Claude技能 {self.config.name} 已激活")

    async def deactivate(self):
        """停用技能"""
        self.active = False
        logger.info(f"Claude技能 {self.config.name} 已停用")

    def get_stats(self) -> Dict[str, Any]:
        """获取技能统计"""
        return {
            "usage_count": self.usage_count,
            "success_count": self.success_count,
            "success_rate": self.success_count / max(self.usage_count, 1),
            "active": self.active
        }


class ClaudeSkillsHookAdapter(BaseAdapter):
    """
    Claude CLI Skills-based Hook Adapter
    基于Claude技能和钩子的冗余跨CLI协同适配器
    """

    def __init__(self, config_manager: ConfigManager):
        super().__init__("claude", config_manager)
        self.parser = UnifiedIntentParser()

        # Claude特定配置
        self.hooks_config_file = os.path.expanduser("~/.config/claude/hooks.json")
        self.claude_config_dir = os.path.expanduser("~/.config/claude")
        self.adapter_config_dir = os.path.join(self.claude_config_dir, "adapters")

        # 技能系统
        self.skills = {}
        self.skill_configs = {}
        self.hook_registry = {hook_type: [] for hook_type in HookType}

        # 钩子系统
        self.hooks_enabled = True
        self.hook_fallback_enabled = True
        self.hooks_registered = False

        # 跨CLI协同
        self.cross_cli_skills = {}
        self.active_collaborations = {}

        # 会话管理
        self.session_hooks = {}

        # 统计信息
        self.hook_calls_count = 0
        self.cross_cli_calls_count = 0
        self.processed_requests = []

        # 配置
        self._load_config()
        self._setup_builtin_skills()
        self._setup_hook_system()

        logger.info("Claude Skills-Hook Adapter 初始化完成")

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
            logger.warning(f"加载Claude配置失败: {e}")

    def _setup_builtin_skills(self):
        """设置内置技能"""
        # 技能1: Claude跨CLI协调器
        cross_cli_config = SkillConfig(
            name="claude_cross_cli_coordinator",
            description="Claude跨CLI协调器 - 通过技能和钩子系统协调不同AI CLI工具",
            capabilities=["跨CLI调用协调", "智能路由", "Claude原生集成", "冗余处理"],
            priority=100,
            hooks=[HookType.USER_PROMPT_SUBMIT, HookType.CROSS_CLI_REQUEST, HookType.TOOL_USE_PRE],
            protocols=["chinese", "english"],
            category="coordination",
            author="Smart CLI Router"
        )

        cross_cli_skill = ClaudeSkill(cross_cli_config)

        # 注册钩子处理器
        async def handle_user_prompt_submit(event: HookEvent):
            """处理用户提示提交钩子 - Claude核心Hook"""
            return await self._handle_claude_user_prompt_submit(event)

        async def handle_cross_cli_request(event: HookEvent):
            """处理跨CLI请求钩子"""
            return await self._handle_cross_cli_request(event)

        async def handle_tool_use_pre(event: HookEvent):
            """处理工具使用前钩子 - 冗余检测"""
            return await self._redundant_cross_cli_detection(event)

        cross_cli_skill.register_hook(HookType.USER_PROMPT_SUBMIT, handle_user_prompt_submit)
        cross_cli_skill.register_hook(HookType.CROSS_CLI_REQUEST, handle_cross_cli_request)
        cross_cli_skill.register_hook(HookType.TOOL_USE_PRE, handle_tool_use_pre)

        self.skills[cross_cli_config.name] = cross_cli_skill
        self.cross_cli_skills[cross_cli_config.name] = cross_cli_skill

        # 技能2: Claude智能代理
        intelligent_agent_config = SkillConfig(
            name="claude_intelligent_agent",
            description="Claude智能代理 - 基于Claude能力的智能任务代理",
            capabilities=["智能分析", "任务理解", "结果优化", "上下文管理"],
            priority=90,
            hooks=[HookType.RESPONSE_GENERATED, HookType.TOOL_USE_POST],
            protocols=["chinese", "english"],
            category="intelligence",
            author="Smart CLI Router"
        )

        intelligent_agent_skill = ClaudeSkill(intelligent_agent_config)

        async def handle_response_generated(event: HookEvent):
            """处理响应生成钩子 - 智能优化"""
            return await self._intelligent_response_optimization(event)

        async def handle_tool_use_post(event: HookEvent):
            """处理工具使用后钩子 - 结果验证"""
            return await self._intelligent_result_verification(event)

        intelligent_agent_skill.register_hook(HookType.RESPONSE_GENERATED, handle_response_generated)
        intelligent_agent_skill.register_hook(HookType.TOOL_USE_POST, handle_tool_use_post)

        self.skills[intelligent_agent_config.name] = intelligent_agent_skill

        # 技能3: Claude错误恢复专家
        error_recovery_config = SkillConfig(
            name="claude_error_recovery_expert",
            description="Claude错误恢复专家 - 利用Claude智能处理跨CLI调用失败",
            capabilities=["错误智能分析", "自动恢复", "智能回退", "学习优化"],
            priority=95,
            hooks=[HookType.ERROR_HANDLING, HookType.SESSION_END],
            protocols=["chinese", "english"],
            category="recovery",
            author="Smart CLI Router"
        )

        error_recovery_skill = ClaudeSkill(error_recovery_config)

        async def handle_error(event: HookEvent):
            """处理错误钩子 - 智能错误分析"""
            return await self._intelligent_error_analysis(event)

        async def handle_session_end(event: HookEvent):
            """处理会话结束钩子 - 学习总结"""
            return await self._learning_summary(event)

        error_recovery_skill.register_hook(HookType.ERROR_HANDLING, handle_error)
        error_recovery_skill.register_hook(HookType.SESSION_END, handle_session_end)

        self.skills[error_recovery_config.name] = error_recovery_skill

        # 技能4: Claude会话管理器
        session_manager_config = SkillConfig(
            name="claude_session_manager",
            description="Claude会话管理器 - 管理Claude跨CLI会话生命周期",
            capabilities=["会话智能管理", "状态跟踪", "上下文保持", "个性化配置"],
            priority=85,
            hooks=[HookType.SESSION_START, HookType.SESSION_END, HookType.SKILL_REGISTER],
            protocols=["chinese", "english"],
            category="session",
            author="Smart CLI Router"
        )

        session_manager_skill = ClaudeSkill(session_manager_config)

        async def handle_session_start(event: HookEvent):
            """处理会话开始钩子"""
            return await self._setup_claude_session(event)

        async def handle_skill_register(event: HookEvent):
            """处理技能注册钩子"""
            return await self._register_claude_skill(event)

        session_manager_skill.register_hook(HookType.SESSION_START, handle_session_start)
        session_manager_skill.register_hook(HookType.SESSION_END, handle_session_end)  # 复用会话结束处理
        session_manager_skill.register_hook(HookType.SKILL_REGISTER, handle_skill_register)

        self.skills[session_manager_config.name] = session_manager_skill

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

        logger.info(f"Claude钩子系统设置完成，注册钩子: {list(self.hook_registry.keys())}")

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
                    logger.error(f"Claude技能 {skill.config.name} 钩子执行失败: {e}")

        return results

    async def _handle_claude_user_prompt_submit(self, event: HookEvent) -> Optional[str]:
        """处理Claude用户提示提交钩子 - 核心Hook"""
        try:
            self.hook_calls_count += 1
            user_input = event.prompt

            # 记录请求
            request_record = {
                'hook_type': 'user_prompt_submit',
                'prompt': user_input,
                'metadata': event.metadata,
                'timestamp': time.time()
            }
            self.processed_requests.append(request_record)

            # 1. Claude原生跨CLI检测
            intent = self.parser.parse_intent(user_input, "claude")

            if not intent.is_cross_cli:
                # 不是跨CLI调用，让Claude继续处理
                return None

            # 2. 避免自我调用
            if intent.target_cli == self.cli_name:
                return None

            # 3. 技能处理方式
            result1 = await self._execute_cross_cli_via_skills(intent, event)

            # 4. 钩子处理方式（冗余）
            result2 = await self._execute_cross_cli_via_hooks(intent, event)

            # 5. 选择最佳结果
            best_result = self._select_best_result(result1, result2)

            if best_result:
                self.cross_cli_calls_count += 1

                # 记录成功的跨CLI调用
                self.processed_requests.append({
                    'type': 'cross_cli_execution',
                    'target_cli': intent.target_cli,
                    'task': intent.task,
                    'success': True,
                    'result_length': len(best_result),
                    'timestamp': time.time()
                })

                return best_result

            return None

        except Exception as e:
            logger.error(f"处理Claude用户提示钩子失败: {e}")
            return None

    async def _handle_cross_cli_request(self, event: HookEvent) -> Optional[str]:
        """处理跨CLI请求钩子"""
        try:
            command = event.prompt
            user_prompt = command

            logger.info(f"跨CLI请求钩子触发: {user_prompt}")

            # 解析跨CLI意图
            intent = self.parser.parse_intent(user_prompt, "claude")

            if intent.is_cross_cli and intent.target_cli != self.cli_name:
                # Claude技能处理方式
                result1 = await self._execute_cross_cli_via_skills(intent, event)

                # Claude钩子处理方式（冗余）
                result2 = await self._execute_cross_cli_via_hooks(intent, event)

                # 选择最佳结果
                return self._select_best_result(result1, result2)

        except Exception as e:
            logger.error(f"处理跨CLI请求钩子失败: {e}")
            return None

    async def _execute_cross_cli_via_skills(self, intent, event: HookEvent) -> Optional[str]:
        """通过Claude技能系统执行跨CLI调用"""
        try:
            # 触发跨CLI技能
            cross_cli_event = HookEvent(
                hook_type=HookType.CROSS_CLI_REQUEST,
                prompt=f"call {intent.target_cli} for {intent.task}",
                session_id=event.session_id,
                metadata={"intent": intent.__dict__}
            )

            results = await self.trigger_hooks(HookType.CROSS_CLI_REQUEST, cross_cli_event)

            if results:
                return results[0]  # 返回第一个有效结果

        except Exception as e:
            logger.error(f"Claude技能系统跨CLI调用失败: {e}")

        return None

    async def _execute_cross_cli_via_hooks(self, intent, event: HookEvent) -> Optional[str]:
        """通过Claude钩子系统执行跨CLI调用"""
        try:
            # 创建临时钩子事件
            hook_event = HookEvent(
                hook_type=HookType.TOOL_USE_PRE,
                prompt=f"use {intent.target_cli} to {intent.task}",
                session_id=event.session_id,
                metadata={"original_event": event.__dict__}
            )

            results = await self.trigger_hooks(HookType.TOOL_USE_PRE, hook_event)

            if results:
                return results[0]

        except Exception as e:
            logger.error(f"Claude钩子系统跨CLI调用失败: {e}")

        return None

    def _select_best_result(self, result1: Optional[str], result2: Optional[str]) -> Optional[str]:
        """选择最佳结果 - Claude智能选择"""
        # Claude特定的结果选择逻辑
        if result1 and result2:
            # 优先选择包含Claude智能分析的结果
            claude_indicators = ["Claude分析", "智能", "优化", "✅", "成功"]
            if any(indicator in result1 for indicator in claude_indicators):
                return result1
            elif any(indicator in result2 for indicator in claude_indicators):
                return result2

            # 选择长度更长且质量更高的结果
            return result1 if len(result1) > len(result2) else result2
        elif result1:
            return result1
        elif result2:
            return result2
        return None

    async def _redundant_cross_cli_detection(self, event: HookEvent) -> Optional[str]:
        """冗余跨CLI检测 - Claude增强版"""
        try:
            prompt = event.prompt

            # Claude增强的检测方式
            detection_methods = [
                self._detect_via_claude_patterns(prompt),
                self._detect_via_semantic_analysis(prompt),
                self._detect_via_context_clues(event)
            ]

            # 如果任一方法检测到跨CLI意图
            for detected_intent in detection_methods:
                if detected_intent:
                    logger.info(f"Claude冗余检测到跨CLI意图: {detected_intent}")

                    # 创建跨CLI事件
                    cross_cli_event = HookEvent(
                        hook_type=HookType.CROSS_CLI_REQUEST,
                        prompt=detected_intent["command"],
                        session_id=event.session_id,
                        metadata={"detection_method": detected_intent["method"]}
                    )

                    results = await self.trigger_hooks(HookType.CROSS_CLI_REQUEST, cross_cli_event)
                    if results:
                        return results[0]

        except Exception as e:
            logger.error(f"Claude冗余跨CLI检测失败: {e}")

        return None

    def _detect_via_claude_patterns(self, prompt: str) -> Optional[Dict]:
        """通过Claude增强模式检测"""
        patterns = [
            r"请用(.*)帮我(.*)",
            r"call (.*) to (.*)",
            r"让(.*)处理(.*)",
            r"use (.*) for (.*)",
            r"通过(.*)执行(.*)",
            r"借助(.*)完成(.*)"
        ]

        import re
        for pattern in patterns:
            match = re.search(pattern, prompt, re.IGNORECASE)
            if match:
                cli, task = match.groups()
                supported_clis = ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "codex"]
                if cli.lower() in supported_clis:
                    return {
                        "command": prompt,
                        "target_cli": cli.lower(),
                        "task": task,
                        "method": "claude_pattern_detection"
                    }
        return None

    def _detect_via_semantic_analysis(self, prompt: str) -> Optional[Dict]:
        """通过语义分析检测"""
        # 模拟Claude的语义分析能力
        semantic_keywords = {
            "claude": ["claude", "克劳德", "anthropic"],
            "gemini": ["gemini", "杰米尼", "google"],
            "qwencode": ["qwencode", "qwen", "通义"],
            "iflow": ["iflow", "ai流程"],
            "qoder": ["qoder", "代码助手"],
            "codebuddy": ["codebuddy", "代码伙伴"],
            "codex": ["codex", "openai", "gpt"]
        }

        prompt_lower = prompt.lower()
        for cli, keywords in semantic_keywords.items():
            for keyword in keywords:
                if keyword in prompt_lower:
                    # 提取任务内容
                    task = prompt.replace(keyword, "").strip()
                    return {
                        "command": prompt,
                        "target_cli": cli,
                        "task": task,
                        "method": "semantic_analysis"
                    }
        return None

    def _detect_via_context_clues(self, event: HookEvent) -> Optional[Dict]:
        """通过上下文线索检测"""
        # 分析事件元数据中的线索
        metadata = event.metadata or {}

        # 检查是否包含工具调用信息
        if "tool_calls" in metadata:
            for tool_call in metadata["tool_calls"]:
                if "function" in tool_call:
                    function_name = tool_call["function"].get("name", "")
                    # 检查是否为跨CLI工具调用
                    for cli in ["gemini", "qwencode", "iflow", "qoder", "codebuddy", "codex"]:
                        if cli in function_name.lower():
                            return {
                                "command": event.prompt,
                                "target_cli": cli,
                                "task": tool_call["function"].get("arguments", ""),
                                "method": "context_analysis"
                            }

        return None

    async def _intelligent_response_optimization(self, event: HookEvent) -> Optional[str]:
        """智能响应优化"""
        try:
            response = event.metadata.get("response", "")
            if response and self._is_cross_cli_result(response):
                # Claude智能优化结果
                optimized_response = self._optimize_response_with_claude(response)
                return f"🧠 Claude智能优化:\n{optimized_response}"
        except Exception as e:
            logger.error(f"智能响应优化失败: {e}")
        return None

    async def _intelligent_result_verification(self, event: HookEvent) -> Optional[str]:
        """智能结果验证"""
        try:
            result = event.metadata.get("result", "")
            if result and self._is_cross_cli_result(result):
                # Claude智能验证结果
                verification_result = self._verify_result_with_claude(result)
                if verification_result:
                    return f"✅ Claude智能验证: {verification_result}"
        except Exception as e:
            logger.error(f"智能结果验证失败: {e}")
        return None

    def _optimize_response_with_claude(self, response: str) -> str:
        """使用Claude智能优化响应"""
        # 模拟Claude的智能优化
        optimizations = []

        # 1. 结构优化
        if not response.startswith("#") and not response.startswith("##"):
            optimizations.append("添加结构化标题")

        # 2. 内容优化
        if len(response) < 50:
            optimizations.append("内容过于简短，建议扩充")

        # 3. 格式优化
        if "**" not in response and "*" not in response:
            optimizations.append("建议添加格式化标记")

        if optimizations:
            return f"已优化: {', '.join(optimizations)}"
        else:
            return "响应质量良好，无需优化"

    def _verify_result_with_claude(self, result: str) -> str:
        """使用Claude智能验证结果"""
        # 模拟Claude的智能验证
        quality_score = 0
        issues = []

        # 检查完整性
        if len(result) < 10:
            issues.append("结果过短")
        else:
            quality_score += 25

        # 检查错误标记
        error_indicators = ["错误", "error", "失败", "failed", "❌"]
        if any(indicator in result.lower() for indicator in error_indicators):
            issues.append("包含错误指示")
        else:
            quality_score += 25

        # 检查成功标记
        success_indicators = ["成功", "success", "完成", "completed", "✅"]
        if any(indicator in result.lower() for indicator in success_indicators):
            quality_score += 25

        # 检查结构
        if any(marker in result for marker in ["#", "##", "**", "*"]):
            quality_score += 25

        if quality_score >= 75:
            return f"质量优秀 (评分: {quality_score}/100)"
        elif quality_score >= 50:
            return f"质量良好 (评分: {quality_score}/100)"
        else:
            return f"质量待改进 (评分: {quality_score}/100), 问题: {', '.join(issues)}"

    async def _intelligent_error_analysis(self, event: HookEvent) -> Optional[str]:
        """智能错误分析"""
        try:
            error_info = event.metadata.get("error", "")
            if error_info:
                # Claude智能分析错误
                analysis = self._analyze_error_with_claude(error_info)
                recovery_suggestion = self._suggest_recovery_with_claude(error_info)
                return f"🧠 Claude错误分析:\n{analysis}\n💡 恢复建议: {recovery_suggestion}"
        except Exception as e:
            logger.error(f"智能错误分析失败: {e}")
        return None

    def _analyze_error_with_claude(self, error_info: str) -> str:
        """使用Claude智能分析错误"""
        # 模拟Claude的错误分析
        error_patterns = {
            "网络": ["network", "connection", "timeout"],
            "权限": ["permission", "access", "unauthorized"],
            "配置": ["config", "not found", "missing"],
            "执行": ["failed", "error", "exception"]
        }

        error_lower = error_info.lower()
        for category, keywords in error_patterns.items():
            if any(keyword in error_lower for keyword in keywords):
                return f"错误类型: {category}类错误"

        return "错误类型: 未知类型错误"

    def _suggest_recovery_with_claude(self, error_info: str) -> str:
        """使用Claude智能建议恢复方案"""
        # 模拟Claude的恢复建议
        if "network" in error_info.lower():
            return "检查网络连接，稍后重试"
        elif "permission" in error_info.lower():
            return "检查权限设置，确保有足够的访问权限"
        elif "not found" in error_info.lower():
            return "检查目标CLI工具是否正确安装和配置"
        else:
            return "尝试使用其他CLI工具或简化任务要求"

    async def _learning_summary(self, event: HookEvent) -> Optional[str]:
        """学习总结"""
        try:
            session_id = event.session_id
            if session_id in self.session_hooks:
                session_info = self.session_hooks[session_id]

                # Claude智能学习总结
                summary = self._generate_learning_summary(session_info)
                return f"🧠 Claude学习总结:\n{summary}"
        except Exception as e:
            logger.error(f"学习总结失败: {e}")
        return None

    def _generate_learning_summary(self, session_info: Dict) -> str:
        """生成学习总结"""
        total_hooks = session_info.get("hooks_triggered", 0)
        cross_cli_calls = session_info.get("cross_cli_calls", 0)
        success_rate = (cross_cli_calls / max(total_hooks, 1)) * 100

        summary_points = []
        if success_rate > 80:
            summary_points.append("跨CLI协作表现优秀")
        elif success_rate > 60:
            summary_points.append("跨CLI协作表现良好")
        else:
            summary_points.append("跨CLI协作有待改进")

        if cross_cli_calls > 5:
            summary_points.append("频繁使用跨CLI功能")

        return "; ".join(summary_points)

    async def _setup_claude_session(self, event: HookEvent) -> Optional[str]:
        """设置Claude会话"""
        session_id = event.session_id or f"claude_session_{int(time.time())}"
        self.session_hooks[session_id] = {
            "start_time": time.time(),
            "hooks_triggered": 0,
            "cross_cli_calls": 0,
            "claude_features_used": []
        }
        return f"Claude会话 {session_id} 设置完成"

    async def _register_claude_skill(self, event: HookEvent) -> Optional[str]:
        """注册Claude技能"""
        try:
            skill_info = event.metadata.get("skill_info")
            if skill_info:
                # 处理Claude技能注册
                return f"Claude技能 {skill_info.get('name')} 注册完成"
        except Exception as e:
            logger.error(f"注册Claude技能失败: {e}")
        return None

    def _is_cross_cli_result(self, result: str) -> bool:
        """判断是否为跨CLI结果"""
        indicators = ["调用", "called", "执行", "executed", "via", "通过", "跨CLI", "cross-cli"]
        return any(indicator in result for indicator in indicators)

    async def register_external_skill(self, skill_name: str, skill_config: Dict[str, Any]) -> bool:
        """注册外部Claude技能"""
        try:
            config = SkillConfig(name=skill_name, **skill_config)
            skill = ClaudeSkill(config)

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
                metadata={"skill_info": {"name": skill_name, "config": skill_config}}
            )

            await self.trigger_hooks(HookType.SKILL_REGISTER, event)

            logger.info(f"外部Claude技能 {skill_name} 注册成功")
            return True

        except Exception as e:
            logger.error(f"注册外部Claude技能失败: {e}")
            return False

    def get_system_status(self) -> Dict[str, Any]:
        """获取系统状态"""
        active_skills = [name for name, skill in self.skills.items() if skill.active]
        skill_stats = {name: skill.get_stats() for name, skill in self.skills.items()}
        hook_counts = {hook_type.value: len(skills) for hook_type, skills in self.hook_registry.items()}

        return {
            "adapter_type": "Claude Skills-Hook",
            "active_skills": active_skills,
            "total_skills": len(self.skills),
            "skill_stats": skill_stats,
            "hook_counts": hook_counts,
            "hooks_enabled": self.hooks_enabled,
            "hooks_registered": self.hooks_registered,
            "hook_calls_count": self.hook_calls_count,
            "cross_cli_calls_count": self.cross_cli_calls_count,
            "active_sessions": len(self.session_hooks),
            "claude_features": ["智能分析", "语义检测", "上下文理解", "学习优化"]
        }

    async def cleanup(self):
        """清理资源"""
        # 停用所有技能
        for skill in self.skills.values():
            await skill.deactivate()

        # 清理会话钩子
        self.session_hooks.clear()

        # 清理请求记录
        self.processed_requests.clear()

        logger.info("Claude Skills-Hook Adapter 资源清理完成")