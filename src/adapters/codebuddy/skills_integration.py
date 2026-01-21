"""
CodeBuddy Skills Integration
技能系统集成模块，提供技能发现、加载和管理功能
"""

import os
import json
import asyncio
import importlib.util
from pathlib import Path
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass
import logging

from .skills_hook_adapter import SkillConfig, Skill, HookType

logger = logging.getLogger(__name__)


@dataclass
class SkillMetadata:
    """技能元数据"""
    name: str
    version: str = "1.0.0"
    author: str = ""
    description: str = ""
    category: str = ""
    tags: List[str] = None
    dependencies: List[str] = None
    entry_point: str = ""
    config_schema: Dict[str, Any] = None

    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.dependencies is None:
            self.dependencies = []
        if self.config_schema is None:
            self.config_schema = {}


class SkillLoader:
    """技能加载器"""

    def __init__(self, skills_directory: str = None):
        self.skills_directory = Path(skills_directory) if skills_directory else Path(__file__).parent / "skills"
        self.loaded_skills = {}
        self.skill_registry = {}

        # 确保技能目录存在
        self.skills_directory.mkdir(exist_ok=True)

    async def discover_skills(self) -> List[SkillMetadata]:
        """发现所有可用技能"""
        skills = []

        # 扫描技能目录
        if self.skills_directory.exists():
            for skill_dir in self.skills_directory.iterdir():
                if skill_dir.is_dir():
                    skill_metadata = await self._load_skill_metadata(skill_dir)
                    if skill_metadata:
                        skills.append(skill_metadata)

        # 扫描配置文件中的技能
        config_skills = await self._load_config_skills()
        skills.extend(config_skills)

        logger.info(f"发现 {len(skills)} 个技能")
        return skills

    async def _load_skill_metadata(self, skill_dir: Path) -> Optional[SkillMetadata]:
        """加载技能元数据"""
        try:
            # 查找技能配置文件
            config_files = [
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
                logger.warning(f"技能目录 {skill_dir} 没有配置文件")
                return None

            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)

            return SkillMetadata(
                name=config.get("name", skill_dir.name),
                version=config.get("version", "1.0.0"),
                author=config.get("author", ""),
                description=config.get("description", ""),
                category=config.get("category", ""),
                tags=config.get("tags", []),
                dependencies=config.get("dependencies", []),
                entry_point=config.get("entry_point", "main.py"),
                config_schema=config.get("config_schema", {})
            )

        except Exception as e:
            logger.error(f"加载技能元数据失败 {skill_dir}: {e}")
            return None

    async def _load_config_skills(self) -> List[SkillMetadata]:
        """从配置文件加载技能"""
        try:
            config_path = Path(__file__).parent / "config.json"
            if not config_path.exists():
                return []

            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)

            skills_config = config.get("external_skills", [])
            skills = []

            for skill_config in skills_config:
                metadata = SkillMetadata(
                    name=skill_config.get("name", ""),
                    version=skill_config.get("version", "1.0.0"),
                    author=skill_config.get("author", ""),
                    description=skill_config.get("description", ""),
                    category=skill_config.get("category", ""),
                    tags=skill_config.get("tags", []),
                    dependencies=skill_config.get("dependencies", []),
                    entry_point=skill_config.get("entry_point", ""),
                    config_schema=skill_config.get("config_schema", {})
                )
                skills.append(metadata)

            return skills

        except Exception as e:
            logger.error(f"从配置加载技能失败: {e}")
            return []

    async def load_skill(self, metadata: SkillMetadata) -> Optional[Skill]:
        """加载单个技能"""
        try:
            # 检查依赖
            await self._check_dependencies(metadata)

            # 创建技能配置
            skill_config = SkillConfig(
                name=metadata.name,
                description=metadata.description,
                capabilities=metadata.tags,
                priority=50,
                protocols=["chinese", "english"]
            )

            # 创建技能实例
            skill = Skill(skill_config)

            # 加载技能代码
            await self._load_skill_code(skill, metadata)

            # 注册到已加载技能
            self.loaded_skills[metadata.name] = skill
            self.skill_registry[metadata.name] = metadata

            logger.info(f"技能 {metadata.name} 加载成功")
            return skill

        except Exception as e:
            logger.error(f"加载技能失败 {metadata.name}: {e}")
            return None

    async def _check_dependencies(self, metadata: SkillMetadata):
        """检查技能依赖"""
        for dep in metadata.dependencies:
            try:
                importlib.import_module(dep)
            except ImportError:
                logger.error(f"技能 {metadata.name} 依赖缺失: {dep}")
                raise

    async def _load_skill_code(self, skill: Skill, metadata: SkillMetadata):
        """加载技能代码"""
        try:
            if metadata.entry_point:
                # 从文件加载
                entry_path = self.skills_directory / metadata.name / metadata.entry_point
                if entry_path.exists():
                    spec = importlib.util.spec_from_file_location(f"skill_{metadata.name}", entry_path)
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)

                    # 调用技能初始化函数
                    if hasattr(module, 'initialize_skill'):
                        await module.initialize_skill(skill, metadata)

            # 从配置加载钩子处理器
            await self._load_hook_handlers(skill, metadata)

        except Exception as e:
            logger.error(f"加载技能代码失败 {metadata.name}: {e}")
            raise

    async def _load_hook_handlers(self, skill: Skill, metadata: SkillMetadata):
        """从配置加载钩子处理器"""
        try:
            config_path = self.skills_directory / metadata.name / "hooks.json"
            if not config_path.exists():
                return

            with open(config_path, 'r', encoding='utf-8') as f:
                hooks_config = json.load(f)

            for hook_config in hooks_config.get("hooks", []):
                hook_type = HookType(hook_config.get("type"))
                handler_code = hook_config.get("handler")

                if handler_code:
                    # 创建简单的处理器函数
                    async def handler(event, code=handler_code):
                        # 这里可以执行简单的代码或调用外部脚本
                        return f"执行钩子处理器: {code[:50]}..."

                    skill.register_hook(hook_type, handler)

        except Exception as e:
            logger.error(f"加载钩子处理器失败 {metadata.name}: {e}")


class SkillManager:
    """技能管理器"""

    def __init__(self, adapter, skills_directory: str = None):
        self.adapter = adapter
        self.loader = SkillLoader(skills_directory)
        self.active_skills = {}
        self.skill_stats = {}

    async def initialize(self):
        """初始化技能管理器"""
        try:
            # 发现所有技能
            discovered_skills = await self.loader.discover_skills()

            # 加载所有技能
            for metadata in discovered_skills:
                skill = await self.loader.load_skill(metadata)
                if skill:
                    await self.register_skill(skill)

            logger.info(f"技能管理器初始化完成，加载了 {len(self.active_skills)} 个技能")

        except Exception as e:
            logger.error(f"技能管理器初始化失败: {e}")

    async def register_skill(self, skill: Skill) -> bool:
        """注册技能到适配器"""
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
                    "hooks": [hook.value for hook in skill.config.hooks]
                }
            )

            if success:
                self.active_skills[skill.config.name] = skill
                self.skill_stats[skill.config.name] = {
                    "registered_at": asyncio.get_event_loop().time(),
                    "hooks_triggered": 0,
                    "errors": 0
                }

            return success

        except Exception as e:
            logger.error(f"注册技能失败 {skill.config.name}: {e}")
            return False

    async def unregister_skill(self, skill_name: str) -> bool:
        """注销技能"""
        try:
            if skill_name in self.active_skills:
                skill = self.active_skills[skill_name]
                await skill.deactivate()
                del self.active_skills[skill_name]
                del self.skill_stats[skill_name]

                logger.info(f"技能 {skill_name} 注销成功")
                return True

        except Exception as e:
            logger.error(f"注销技能失败 {skill_name}: {e}")

        return False

    def get_skill_stats(self, skill_name: str) -> Dict[str, Any]:
        """获取技能统计"""
        return self.skill_stats.get(skill_name, {})

    def get_all_stats(self) -> Dict[str, Any]:
        """获取所有技能统计"""
        return {
            "total_skills": len(self.active_skills),
            "skill_stats": dict(self.skill_stats)
        }

    async def reload_skill(self, skill_name: str) -> bool:
        """重新加载技能"""
        try:
            # 注销旧技能
            await self.unregister_skill(skill_name)

            # 重新发现和加载
            discovered_skills = await self.loader.discover_skills()
            for metadata in discovered_skills:
                if metadata.name == skill_name:
                    skill = await self.loader.load_skill(metadata)
                    if skill:
                        return await self.register_skill(skill)
                    break

        except Exception as e:
            logger.error(f"重新加载技能失败 {skill_name}: {e}")

        return False

    async def enable_skill(self, skill_name: str) -> bool:
        """启用技能"""
        if skill_name in self.active_skills:
            await self.active_skills[skill_name].activate()
            return True
        return False

    async def disable_skill(self, skill_name: str) -> bool:
        """禁用技能"""
        if skill_name in self.active_skills:
            await self.active_skills[skill_name].deactivate()
            return True
        return False

    def list_skills(self) -> List[Dict[str, Any]]:
        """列出所有技能"""
        skills = []
        for name, skill in self.active_skills.items():
            skills.append({
                "name": name,
                "description": skill.config.description,
                "capabilities": skill.config.capabilities,
                "priority": skill.config.priority,
                "active": skill.active,
                "hooks": [hook.value for hook in skill.config.hooks],
                "stats": self.skill_stats.get(name, {})
            })
        return skills


def create_skill_from_config(skill_config: Dict[str, Any]) -> Skill:
    """从配置创建技能"""
    config = SkillConfig(
        name=skill_config.get("name", "unnamed_skill"),
        description=skill_config.get("description", ""),
        capabilities=skill_config.get("capabilities", []),
        priority=skill_config.get("priority", 50),
        protocols=skill_config.get("protocols", ["chinese", "english"]),
        hooks=[HookType(hook) for hook in skill_config.get("hooks", [])]
    )

    skill = Skill(config)

    # 添加钩子处理器
    handlers = skill_config.get("handlers", {})
    for hook_name, handler_code in handlers.items():
        try:
            hook_type = HookType(hook_name)

            async def handler(event, code=handler_code):
                # 简单的处理器实现
                return f"Skill {config.name} handling {hook_name}"

            skill.register_hook(hook_type, handler)
        except ValueError:
            logger.warning(f"无效的钩子类型: {hook_name}")

    return skill