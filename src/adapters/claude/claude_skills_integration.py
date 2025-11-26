"""
Claude Skills Integration
Claude技能系统集成模块，提供Claude特化的技能发现、加载和管理功能
"""

import os
import json
import asyncio
import importlib.util
from pathlib import Path
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass
import logging

from .skills_hook_adapter import ClaudeSkill, SkillConfig, HookType

logger = logging.getLogger(__name__)


@dataclass
class ClaudeSkillMetadata:
    """Claude技能元数据"""
    name: str
    version: str = "1.0.0"
    author: str = ""
    description: str = ""
    category: str = ""
    tags: List[str] = None
    dependencies: List[str] = None
    entry_point: str = ""
    claude_features: List[str] = None
    intelligence_level: str = "standard"  # basic, standard, advanced
    learning_enabled: bool = True
    config_schema: Dict[str, Any] = None

    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.dependencies is None:
            self.dependencies = []
        if self.claude_features is None:
            self.claude_features = []
        if self.config_schema is None:
            self.config_schema = {}


class ClaudeSkillLoader:
    """Claude技能加载器"""

    def __init__(self, skills_directory: str = None):
        self.skills_directory = Path(skills_directory) if skills_directory else Path(__file__).parent / "claude_skills"
        self.loaded_skills = {}
        self.skill_registry = {}
        self.claude_feature_registry = {}

        # 确保技能目录存在
        self.skills_directory.mkdir(exist_ok=True)

    async def discover_claude_skills(self) -> List[ClaudeSkillMetadata]:
        """发现所有可用Claude技能"""
        skills = []

        # 扫描Claude技能目录
        if self.skills_directory.exists():
            for skill_dir in self.skills_directory.iterdir():
                if skill_dir.is_dir():
                    skill_metadata = await self._load_claude_skill_metadata(skill_dir)
                    if skill_metadata:
                        skills.append(skill_metadata)

        # 扫描配置文件中的Claude技能
        config_skills = await self._load_config_claude_skills()
        skills.extend(config_skills)

        # 注册Claude特性
        self._register_claude_features(skills)

        logger.info(f"发现 {len(skills)} 个Claude技能")
        return skills

    async def _load_claude_skill_metadata(self, skill_dir: Path) -> Optional[ClaudeSkillMetadata]:
        """加载Claude技能元数据"""
        try:
            # 查找Claude技能配置文件
            config_files = [
                skill_dir / "claude_skill.json",
                skill_dir / "skill.json",
                skill_dir / "config.json",
                skill_dir / "metadata.json"
            ]

            config_file = None
            for file_path in config_files:
                if file_path.exists():
                    config_file = file_path
                    break

            if not config_file:
                logger.warning(f"Claude技能目录 {skill_dir} 没有配置文件")
                return None

            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)

            return ClaudeSkillMetadata(
                name=config.get("name", skill_dir.name),
                version=config.get("version", "1.0.0"),
                author=config.get("author", ""),
                description=config.get("description", ""),
                category=config.get("category", ""),
                tags=config.get("tags", []),
                dependencies=config.get("dependencies", []),
                entry_point=config.get("entry_point", "main.py"),
                claude_features=config.get("claude_features", []),
                intelligence_level=config.get("intelligence_level", "standard"),
                learning_enabled=config.get("learning_enabled", True),
                config_schema=config.get("config_schema", {})
            )

        except Exception as e:
            logger.error(f"加载Claude技能元数据失败 {skill_dir}: {e}")
            return None

    async def _load_config_claude_skills(self) -> List[ClaudeSkillMetadata]:
        """从配置文件加载Claude技能"""
        try:
            config_path = Path(__file__).parent / "claude_skills_config.json"
            if not config_path.exists():
                return []

            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)

            skills_config = config.get("claude_skills", [])
            skills = []

            for skill_config in skills_config:
                metadata = ClaudeSkillMetadata(
                    name=skill_config.get("name", ""),
                    version=skill_config.get("version", "1.0.0"),
                    author=skill_config.get("author", ""),
                    description=skill_config.get("description", ""),
                    category=skill_config.get("category", ""),
                    tags=skill_config.get("tags", []),
                    dependencies=skill_config.get("dependencies", []),
                    entry_point=skill_config.get("entry_point", ""),
                    claude_features=skill_config.get("claude_features", []),
                    intelligence_level=skill_config.get("intelligence_level", "standard"),
                    learning_enabled=skill_config.get("learning_enabled", True),
                    config_schema=skill_config.get("config_schema", {})
                )
                skills.append(metadata)

            return skills

        except Exception as e:
            logger.error(f"从配置加载Claude技能失败: {e}")
            return []

    def _register_claude_features(self, skills: List[ClaudeSkillMetadata]):
        """注册Claude特性"""
        self.claude_feature_registry.clear()

        for skill in skills:
            for feature in skill.claude_features:
                if feature not in self.claude_feature_registry:
                    self.claude_feature_registry[feature] = []
                self.claude_feature_registry[feature].append(skill.name)

        logger.info(f"注册Claude特性: {list(self.claude_feature_registry.keys())}")

    async def load_claude_skill(self, metadata: ClaudeSkillMetadata) -> Optional[ClaudeSkill]:
        """加载单个Claude技能"""
        try:
            # 检查依赖
            await self._check_dependencies(metadata)

            # 创建技能配置
            skill_config = SkillConfig(
                name=metadata.name,
                description=metadata.description,
                capabilities=metadata.tags + metadata.claude_features,
                priority=self._calculate_priority(metadata),
                protocols=["chinese", "english"],
                category=metadata.category,
                author=metadata.author
            )

            # 创建Claude技能实例
            skill = ClaudeSkill(skill_config)

            # 设置Claude特有属性
            skill.intelligence_level = metadata.intelligence_level
            skill.learning_enabled = metadata.learning_enabled
            skill.claude_features = metadata.claude_features

            # 加载技能代码
            await self._load_claude_skill_code(skill, metadata)

            # 注册到已加载技能
            self.loaded_skills[metadata.name] = skill
            self.skill_registry[metadata.name] = metadata

            logger.info(f"Claude技能 {metadata.name} 加载成功")
            return skill

        except Exception as e:
            logger.error(f"加载Claude技能失败 {metadata.name}: {e}")
            return None

    def _calculate_priority(self, metadata: ClaudeSkillMetadata) -> int:
        """计算技能优先级"""
        base_priority = 50

        # 根据智能等级调整优先级
        intelligence_bonus = {
            "basic": 0,
            "standard": 10,
            "advanced": 25
        }
        base_priority += intelligence_bonus.get(metadata.intelligence_level, 0)

        # 根据Claude特性数量调整优先级
        base_priority += len(metadata.claude_features) * 5

        # 根据学习功能调整优先级
        if metadata.learning_enabled:
            base_priority += 15

        return min(base_priority, 100)  # 最大优先级100

    async def _check_dependencies(self, metadata: ClaudeSkillMetadata):
        """检查技能依赖"""
        for dep in metadata.dependencies:
            try:
                importlib.import_module(dep)
            except ImportError:
                logger.error(f"Claude技能 {metadata.name} 依赖缺失: {dep}")
                raise

    async def _load_claude_skill_code(self, skill: ClaudeSkill, metadata: ClaudeSkillMetadata):
        """加载Claude技能代码"""
        try:
            if metadata.entry_point:
                # 从文件加载
                entry_path = self.skills_directory / metadata.name / metadata.entry_point
                if entry_path.exists():
                    spec = importlib.util.spec_from_file_location(f"claude_skill_{metadata.name}", entry_path)
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)

                    # 调用Claude技能初始化函数
                    if hasattr(module, 'initialize_claude_skill'):
                        await module.initialize_claude_skill(skill, metadata)

            # 从配置加载钩子处理器
            await self._load_claude_hook_handlers(skill, metadata)

            # 加载Claude特性
            await self._load_claude_features(skill, metadata)

        except Exception as e:
            logger.error(f"加载Claude技能代码失败 {metadata.name}: {e}")
            raise

    async def _load_claude_hook_handlers(self, skill: ClaudeSkill, metadata: ClaudeSkillMetadata):
        """从配置加载Claude钩子处理器"""
        try:
            config_path = self.skills_directory / metadata.name / "claude_hooks.json"
            if not config_path.exists():
                return

            with open(config_path, 'r', encoding='utf-8') as f:
                hooks_config = json.load(f)

            for hook_config in hooks_config.get("claude_hooks", []):
                hook_type = HookType(hook_config.get("type"))
                handler_code = hook_config.get("handler")
                claude_enhanced = hook_config.get("claude_enhanced", False)

                if handler_code:
                    # 创建Claude增强的处理器函数
                    async def claude_handler(event, code=handler_code, enhanced=claude_enhanced):
                        if enhanced:
                            # Claude增强处理
                            return f"🧠 Claude增强处理: {code[:50]}..."
                        else:
                            # 标准处理
                            return f"Claude处理: {code[:50]}..."

                    skill.register_hook(hook_type, claude_handler)

        except Exception as e:
            logger.error(f"加载Claude钩子处理器失败 {metadata.name}: {e}")

    async def _load_claude_features(self, skill: ClaudeSkill, metadata: ClaudeSkillMetadata):
        """加载Claude特性"""
        try:
            for feature in metadata.claude_features:
                # 根据特性类型设置相应的功能
                if feature == "intelligent_analysis":
                    skill.has_intelligent_analysis = True
                elif feature == "context_awareness":
                    skill.has_context_awareness = True
                elif feature == "learning_optimization":
                    skill.has_learning_optimization = True
                elif feature == "semantic_understanding":
                    skill.has_semantic_understanding = True
                elif feature == "natural_language_processing":
                    skill.has_natural_language_processing = True

        except Exception as e:
            logger.error(f"加载Claude特性失败 {metadata.name}: {e}")

    def get_skills_by_feature(self, feature: str) -> List[str]:
        """根据特性获取技能列表"""
        return self.claude_feature_registry.get(feature, [])

    def get_all_features(self) -> List[str]:
        """获取所有Claude特性"""
        return list(self.claude_feature_registry.keys())


class ClaudeSkillManager:
    """Claude技能管理器"""

    def __init__(self, adapter, skills_directory: str = None):
        self.adapter = adapter
        self.loader = ClaudeSkillLoader(skills_directory)
        self.active_skills = {}
        self.skill_stats = {}
        self.learning_data = {}

    async def initialize(self):
        """初始化Claude技能管理器"""
        try:
            # 发现所有Claude技能
            discovered_skills = await self.loader.discover_claude_skills()

            # 加载所有Claude技能
            for metadata in discovered_skills:
                skill = await self.loader.load_claude_skill(metadata)
                if skill:
                    await self.register_claude_skill(skill)

            logger.info(f"Claude技能管理器初始化完成，加载了 {len(self.active_skills)} 个技能")

        except Exception as e:
            logger.error(f"Claude技能管理器初始化失败: {e}")

    async def register_claude_skill(self, skill: ClaudeSkill) -> bool:
        """注册Claude技能到适配器"""
        try:
            # 激活技能
            await skill.activate()

            # 注册到适配器
            success = await self.adapter.register_external_skill(
                skill.config.name,
                {
                    "description": skill.config.description,
                    "capabilities": skill.config.capabilities,
                    "priority": skill.config.priority,
                    "hooks": [hook.value for hook in skill.config.hooks],
                    "category": skill.config.category,
                    "author": skill.config.author,
                    "claude_features": getattr(skill, 'claude_features', []),
                    "intelligence_level": getattr(skill, 'intelligence_level', 'standard'),
                    "learning_enabled": getattr(skill, 'learning_enabled', True)
                }
            )

            if success:
                self.active_skills[skill.config.name] = skill
                self.skill_stats[skill.config.name] = {
                    "registered_at": asyncio.get_event_loop().time(),
                    "hooks_triggered": 0,
                    "errors": 0,
                    "learning_updates": 0,
                    "claude_features_used": set()
                }

                # 初始化学习数据
                if getattr(skill, 'learning_enabled', False):
                    self.learning_data[skill.config.name] = {
                        "performance_history": [],
                        "optimization_suggestions": [],
                        "usage_patterns": {}
                    }

            return success

        except Exception as e:
            logger.error(f"注册Claude技能失败 {skill.config.name}: {e}")
            return False

    async def update_learning_data(self, skill_name: str, performance_data: Dict[str, Any]):
        """更新学习数据"""
        if skill_name in self.learning_data:
            learning_data = self.learning_data[skill_name]

            # 添加性能历史
            learning_data["performance_history"].append({
                "timestamp": asyncio.get_event_loop().time(),
                "performance": performance_data
            })

            # 限制历史记录数量
            if len(learning_data["performance_history"]) > 100:
                learning_data["performance_history"] = learning_data["performance_history"][-50:]

            # 更新使用模式
            self._update_usage_patterns(skill_name, performance_data)

            # 生成优化建议
            suggestions = self._generate_optimization_suggestions(skill_name, learning_data)
            learning_data["optimization_suggestions"] = suggestions

            # 更新统计
            self.skill_stats[skill_name]["learning_updates"] += 1

            logger.info(f"Claude技能 {skill_name} 学习数据已更新")

    def _update_usage_patterns(self, skill_name: str, performance_data: Dict[str, Any]):
        """更新使用模式"""
        if skill_name in self.learning_data:
            patterns = self.learning_data[skill_name]["usage_patterns"]

            # 记录使用频率
            current_hour = int(time.time()) // 3600 % 24
            patterns.setdefault("hourly_usage", {})
            patterns["hourly_usage"][current_hour] = patterns["hourly_usage"].get(current_hour, 0) + 1

            # 记录成功模式
            if performance_data.get("success", False):
                patterns.setdefault("successful_patterns", [])
                patterns["successful_patterns"].append(performance_data.get("context", {}))

    def _generate_optimization_suggestions(self, skill_name: str, learning_data: Dict) -> List[str]:
        """生成优化建议"""
        suggestions = []
        performance_history = learning_data.get("performance_history", [])
        patterns = learning_data.get("usage_patterns", {})

        if len(performance_history) >= 10:
            # 分析性能趋势
            recent_performance = performance_history[-10:]
            success_rate = sum(1 for p in recent_performance if p.get("performance", {}).get("success", False)) / len(recent_performance)

            if success_rate < 0.7:
                suggestions.append("成功率较低，建议检查技能配置或增加错误处理")

            if success_rate > 0.9:
                suggestions.append("表现优秀，可以考虑增加更多功能")

        # 分析使用模式
        hourly_usage = patterns.get("hourly_usage", {})
        if hourly_usage:
            peak_hour = max(hourly_usage, key=hourly_usage.get)
            suggestions.append(f"使用高峰时段：{peak_hour}:00，可以考虑在此时段优化性能")

        return suggestions

    def get_learning_insights(self, skill_name: str) -> Dict[str, Any]:
        """获取学习洞察"""
        if skill_name not in self.learning_data:
            return {}

        learning_data = self.learning_data[skill_name]
        insights = {
            "total_learning_updates": self.skill_stats[skill_name]["learning_updates"],
            "optimization_suggestions": learning_data.get("optimization_suggestions", []),
            "usage_patterns": learning_data.get("usage_patterns", {}),
            "performance_summary": self._summarize_performance(learning_data.get("performance_history", []))
        }

        return insights

    def _summarize_performance(self, performance_history: List[Dict]) -> Dict[str, Any]:
        """总结性能数据"""
        if not performance_history:
            return {}

        recent_data = performance_history[-20:]  # 最近20次记录
        success_count = sum(1 for p in recent_data if p.get("performance", {}).get("success", False))

        return {
            "recent_success_rate": success_count / len(recent_data),
            "total_executions": len(recent_data),
            "average_response_time": sum(p.get("performance", {}).get("response_time", 0) for p in recent_data) / len(recent_data)
        }

    def get_claude_feature_stats(self) -> Dict[str, Any]:
        """获取Claude特性统计"""
        feature_usage = {}
        feature_effectiveness = {}

        for skill_name, skill in self.active_skills.items():
            claude_features = getattr(skill, 'claude_features', [])
            stats = self.skill_stats.get(skill_name, {})
            used_features = stats.get("claude_features_used", set())

            for feature in claude_features:
                feature_usage[feature] = feature_usage.get(feature, 0) + 1
                if feature in used_features:
                    feature_effectiveness[feature] = feature_effectiveness.get(feature, 0) + 1

        return {
            "feature_usage": feature_usage,
            "feature_effectiveness": feature_effectiveness,
            "total_features": len(self.loader.get_all_features()),
            "most_used_features": sorted(feature_usage.items(), key=lambda x: x[1], reverse=True)[:5]
        }

    async def optimize_skill_performance(self, skill_name: str) -> bool:
        """优化技能性能"""
        if skill_name not in self.active_skills:
            return False

        try:
            skill = self.active_skills[skill_name]
            learning_data = self.learning_data.get(skill_name, {})

            # 基于学习数据优化技能
            suggestions = learning_data.get("optimization_suggestions", [])

            # 应用优化建议
            for suggestion in suggestions:
                if "成功率较低" in suggestion:
                    # 增加重试机制
                    if hasattr(skill, 'retry_count'):
                        skill.retry_count = min(skill.retry_count + 1, 5)
                elif "使用高峰时段" in suggestion:
                    # 在高峰时段优先处理
                    if hasattr(skill, 'priority'):
                        skill.priority += 10

            logger.info(f"Claude技能 {skill_name} 性能优化完成")
            return True

        except Exception as e:
            logger.error(f"优化Claude技能性能失败 {skill_name}: {e}")
            return False

    def get_skill_stats(self, skill_name: str) -> Dict[str, Any]:
        """获取技能统计"""
        stats = self.skill_stats.get(skill_name, {})
        learning_insights = self.get_learning_insights(skill_name)

        return {
            **stats,
            "learning_insights": learning_insights,
            "claude_features": getattr(self.active_skills.get(skill_name), 'claude_features', []),
            "intelligence_level": getattr(self.active_skills.get(skill_name), 'intelligence_level', 'standard')
        }

    def get_all_stats(self) -> Dict[str, Any]:
        """获取所有技能统计"""
        base_stats = {
            "total_skills": len(self.active_skills),
            "skill_stats": {},
            "learning_enabled_skills": len([s for s in self.active_skills.values() if getattr(s, 'learning_enabled', False)]),
            "claude_feature_stats": self.get_claude_feature_stats()
        }

        for skill_name in self.active_skills:
            base_stats["skill_stats"][skill_name] = self.get_skill_stats(skill_name)

        return base_stats


def create_claude_skill_from_config(skill_config: Dict[str, Any]) -> ClaudeSkill:
    """从配置创建Claude技能"""
    config = SkillConfig(
        name=skill_config.get("name", "unnamed_claude_skill"),
        description=skill_config.get("description", ""),
        capabilities=skill_config.get("capabilities", []),
        priority=skill_config.get("priority", 50),
        protocols=skill_config.get("protocols", ["chinese", "english"]),
        hooks=[HookType(hook) for hook in skill_config.get("hooks", [])],
        category=skill_config.get("category", ""),
        author=skill_config.get("author", "")
    )

    skill = ClaudeSkill(config)

    # 设置Claude特有属性
    skill.intelligence_level = skill_config.get("intelligence_level", "standard")
    skill.learning_enabled = skill_config.get("learning_enabled", True)
    skill.claude_features = skill_config.get("claude_features", [])

    # 添加钩子处理器
    handlers = skill_config.get("handlers", {})
    for hook_name, handler_code in handlers.items():
        try:
            hook_type = HookType(hook_name)
            claude_enhanced = handlers.get("claude_enhanced", False)

            async def claude_handler(event, code=handler_code, enhanced=claude_enhanced):
                if enhanced:
                    return f"🧠 Claude增强 {config.name} 处理 {hook_name}"
                else:
                    return f"Claude {config.name} 处理 {hook_name}"

            skill.register_hook(hook_type, claude_handler)
        except ValueError:
            logger.warning(f"无效的钩子类型: {hook_name}")

    return skill