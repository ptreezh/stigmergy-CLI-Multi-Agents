"""
CodeBuddy Skills Integration 单元测试
测试技能发现、加载和管理功能
"""

import pytest
import asyncio
import json
import tempfile
from unittest.mock import Mock, AsyncMock, patch
from pathlib import Path

# 导入被测试的模块
import sys
sys.path.append(str(Path(__file__).parent.parent.parent.parent))

from src.adapters.codebuddy.skills_integration import (
    SkillLoader,
    SkillManager,
    SkillMetadata,
    create_skill_from_config
)


class TestSkillMetadata:
    """测试SkillMetadata类"""

    def test_skill_metadata_creation(self):
        """测试技能元数据创建"""
        metadata = SkillMetadata(
            name="test_skill",
            version="2.0.0",
            author="Test Author",
            description="测试技能",
            category="test",
            tags=["test", "demo"],
            dependencies=["asyncio"],
            entry_point="main.py",
            config_schema={"timeout": 30}
        )

        assert metadata.name == "test_skill"
        assert metadata.version == "2.0.0"
        assert metadata.author == "Test Author"
        assert metadata.description == "测试技能"
        assert metadata.category == "test"
        assert metadata.tags == ["test", "demo"]
        assert metadata.dependencies == ["asyncio"]
        assert metadata.entry_point == "main.py"
        assert metadata.config_schema["timeout"] == 30

    def test_skill_metadata_defaults(self):
        """测试技能元数据默认值"""
        metadata = SkillMetadata(name="minimal_skill")

        assert metadata.name == "minimal_skill"
        assert metadata.version == "1.0.0"
        assert metadata.author == ""
        assert metadata.description == ""
        assert metadata.category == ""
        assert metadata.tags == []
        assert metadata.dependencies == []
        assert metadata.entry_point == ""
        assert metadata.config_schema == {}


class TestSkillLoader:
    """测试SkillLoader类"""

    @pytest.fixture
    def temp_skills_dir(self):
        """创建临时技能目录"""
        with tempfile.TemporaryDirectory() as temp_dir:
            skills_dir = Path(temp_dir) / "skills"
            skills_dir.mkdir()
            yield skills_dir

    @pytest.fixture
    def skill_loader(self, temp_skills_dir):
        """创建技能加载器"""
        return SkillLoader(str(temp_skills_dir))

    def test_skill_loader_initialization(self, skill_loader):
        """测试技能加载器初始化"""
        assert skill_loader.skills_directory.exists()
        assert skill_loader.loaded_skills == {}
        assert skill_loader.skill_registry == {}

    @pytest.mark.asyncio
    async def test_discover_skills_no_skills(self, skill_loader):
        """测试发现技能（无技能）"""
        skills = await skill_loader.discover_skills()
        assert len(skills) == 0

    @pytest.mark.asyncio
    async def test_discover_skills_from_directory(self, skill_loader, temp_skills_dir):
        """测试从目录发现技能"""
        # 创建技能目录和配置文件
        test_skill_dir = temp_skills_dir / "test_skill"
        test_skill_dir.mkdir()

        config_file = test_skill_dir / "skill.json"
        config_data = {
            "name": "test_skill",
            "version": "1.0.0",
            "author": "Test Author",
            "description": "测试技能",
            "category": "test",
            "tags": ["test"],
            "dependencies": [],
            "entry_point": "main.py"
        }

        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config_data, f)

        skills = await skill_loader.discover_skills()

        assert len(skills) == 1
        assert skills[0].name == "test_skill"
        assert skills[0].author == "Test Author"
        assert skills[0].description == "测试技能"

    @pytest.mark.asyncio
    async def test_discover_skills_invalid_config(self, skill_loader, temp_skills_dir):
        """测试发现技能（无效配置）"""
        # 创建技能目录和无效配置文件
        test_skill_dir = temp_skills_dir / "invalid_skill"
        test_skill_dir.mkdir()

        config_file = test_skill_dir / "skill.json"
        with open(config_file, 'w', encoding='utf-8') as f:
            f.write("invalid json content")

        skills = await skill_loader.discover_skills()

        assert len(skills) == 0

    @pytest.mark.asyncio
    async def test_discover_skills_no_config_file(self, skill_loader, temp_skills_dir):
        """测试发现技能（无配置文件）"""
        # 创建技能目录但不创建配置文件
        test_skill_dir = temp_skills_dir / "no_config_skill"
        test_skill_dir.mkdir()

        skills = await skill_loader.discover_skills()

        assert len(skills) == 0

    @pytest.mark.asyncio
    async def test_load_skill_metadata_success(self, skill_loader, temp_skills_dir):
        """测试加载技能元数据成功"""
        # 创建技能目录和配置文件
        test_skill_dir = temp_skills_dir / "metadata_skill"
        test_skill_dir.mkdir()

        config_file = test_skill_dir / "config.json"
        config_data = {
            "name": "metadata_skill",
            "version": "2.0.0",
            "description": "元数据测试技能",
            "category": "metadata",
            "tags": ["metadata", "test"],
            "dependencies": ["json"],
            "entry_point": "handler.py"
        }

        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config_data, f)

        metadata = await skill_loader._load_skill_metadata(test_skill_dir)

        assert metadata is not None
        assert metadata.name == "metadata_skill"
        assert metadata.version == "2.0.0"
        assert metadata.description == "元数据测试技能"
        assert metadata.category == "metadata"
        assert metadata.tags == ["metadata", "test"]
        assert metadata.dependencies == ["json"]
        assert metadata.entry_point == "handler.py"

    @pytest.mark.asyncio
    async def test_load_config_skills(self, skill_loader):
        """测试从配置文件加载技能"""
        # 模拟配置文件存在
        config_data = {
            "external_skills": [
                {
                    "name": "config_skill1",
                    "version": "1.0.0",
                    "author": "Config Author",
                    "description": "配置技能1",
                    "category": "config",
                    "tags": ["config", "external"],
                    "entry_point": "external1.py"
                },
                {
                    "name": "config_skill2",
                    "description": "配置技能2",
                    "entry_point": "external2.py"
                }
            ]
        }

        with patch('pathlib.Path.exists', return_value=True):
            with patch('builtins.open', create=True) as mock_open:
                mock_open.return_value.__enter__.return_value.read.return_value = json.dumps(config_data)
                with patch('json.load', return_value=config_data):
                    skills = await skill_loader._load_config_skills()

        assert len(skills) == 2
        assert skills[0].name == "config_skill1"
        assert skills[0].author == "Config Author"
        assert skills[1].name == "config_skill2"
        assert skills[1].version == "1.0.0"  # 默认版本

    @pytest.mark.asyncio
    async def test_load_skill_success(self, skill_loader):
        """测试加载技能成功"""
        metadata = SkillMetadata(
            name="loadable_skill",
            description="可加载技能",
            tags=["test"],
            entry_point=""
        )

        # 模拟依赖检查和代码加载
        skill_loader._check_dependencies = AsyncMock()
        skill_loader._load_skill_code = AsyncMock()

        skill = await skill_loader.load_skill(metadata)

        assert skill is not None
        assert skill.config.name == "loadable_skill"
        assert skill.config.description == "可加载技能"
        assert skill.config.capabilities == ["test"]

        # 验证注册到加载器
        assert "loadable_skill" in skill_loader.loaded_skills
        assert "loadable_skill" in skill_loader.skill_registry

    @pytest.mark.asyncio
    async def test_load_skill_dependency_missing(self, skill_loader):
        """测试加载技能（依赖缺失）"""
        metadata = SkillMetadata(
            name="dependent_skill",
            dependencies=["nonexistent_module"]
        )

        # 模拟依赖检查失败
        skill_loader._check_dependencies = AsyncMock(side_effect=ImportError("模块不存在"))

        skill = await skill_loader.load_skill(metadata)

        assert skill is None

    @pytest.mark.asyncio
    async def test_check_dependencies_success(self, skill_loader):
        """测试检查依赖成功"""
        metadata = SkillMetadata(dependencies=["json", "os"])

        # 不应该抛出异常
        await skill_loader._check_dependencies(metadata)

    @pytest.mark.asyncio
    async def test_check_dependencies_failure(self, skill_loader):
        """测试检查依赖失败"""
        metadata = SkillMetadata(dependencies=["nonexistent_module_12345"])

        with pytest.raises(ImportError):
            await skill_loader._check_dependencies(metadata)

    @pytest.mark.asyncio
    async def test_load_skill_code_no_entry_point(self, skill_loader):
        """测试加载技能代码（无入口点）"""
        from src.adapters.codebuddy.skills_hook_adapter import Skill

        metadata = SkillMetadata(name="no_entry_skill", entry_point="")
        skill = Skill(config=Mock())

        # 模拟加载钩子处理器
        skill_loader._load_hook_handlers = AsyncMock()

        await skill_loader._load_skill_code(skill, metadata)

        # 应该只调用钩子处理器加载，不调用模块加载
        skill_loader._load_hook_handlers.assert_called_once_with(skill, metadata)


class TestSkillManager:
    """测试SkillManager类"""

    @pytest.fixture
    def mock_adapter(self):
        """模拟适配器"""
        adapter = Mock()
        adapter.register_external_skill = AsyncMock(return_value=True)
        return adapter

    @pytest.fixture
    def skill_manager(self, mock_adapter):
        """创建技能管理器"""
        with tempfile.TemporaryDirectory() as temp_dir:
            manager = SkillManager(mock_adapter, temp_dir)
            yield manager

    @pytest.mark.asyncio
    async def test_skill_manager_initialization(self, skill_manager):
        """测试技能管理器初始化"""
        # 模拟发现和加载过程
        skill_manager.loader.discover_skills = AsyncMock(return_value=[])
        skill_manager.loader.load_skill = AsyncMock(return_value=None)
        skill_manager.register_skill = AsyncMock(return_value=True)

        await skill_manager.initialize()

        skill_manager.loader.discover_skills.assert_called_once()

    @pytest.mark.asyncio
    async def test_register_skill_success(self, skill_manager):
        """测试注册技能成功"""
        # 创建模拟技能
        mock_skill = Mock()
        mock_skill.config = Mock()
        mock_skill.config.name = "registerable_skill"
        mock_skill.config.description = "可注册技能"
        mock_skill.config.capabilities = ["注册"]
        mock_skill.config.priority = 80
        mock_skill.config.hooks = []
        mock_skill.activate = AsyncMock()

        result = await skill_manager.register_skill(mock_skill)

        assert result is True
        assert "registerable_skill" in skill_manager.active_skills
        assert "registerable_skill" in skill_manager.skill_stats
        assert skill_manager.skill_stats["registerable_skill"]["registered_at"] > 0

    @pytest.mark.asyncio
    async def test_register_skill_failure(self, skill_manager):
        """测试注册技能失败"""
        # 模拟适配器注册失败
        skill_manager.adapter.register_external_skill = AsyncMock(return_value=False)

        mock_skill = Mock()
        mock_skill.config = Mock()
        mock_skill.config.name = "fail_skill"
        mock_skill.activate = AsyncMock()

        result = await skill_manager.register_skill(mock_skill)

        assert result is False
        assert "fail_skill" not in skill_manager.active_skills

    @pytest.mark.asyncio
    async def test_unregister_skill_success(self, skill_manager):
        """测试注销技能成功"""
        # 添加技能到活动技能
        mock_skill = Mock()
        mock_skill.deactivate = AsyncMock()
        skill_manager.active_skills["test_skill"] = mock_skill
        skill_manager.skill_stats["test_skill"] = {"data": "test"}

        result = await skill_manager.unregister_skill("test_skill")

        assert result is True
        assert "test_skill" not in skill_manager.active_skills
        assert "test_skill" not in skill_manager.skill_stats

    @pytest.mark.asyncio
    async def test_unregister_skill_not_found(self, skill_manager):
        """测试注销技能（未找到）"""
        result = await skill_manager.unregister_skill("nonexistent_skill")

        assert result is False

    def test_get_skill_stats(self, skill_manager):
        """测试获取技能统计"""
        skill_manager.skill_stats["test_skill"] = {
            "registered_at": 1234567890,
            "hooks_triggered": 10,
            "errors": 2
        }

        stats = skill_manager.get_skill_stats("test_skill")

        assert stats["registered_at"] == 1234567890
        assert stats["hooks_triggered"] == 10
        assert stats["errors"] == 2

    def test_get_skill_stats_not_found(self, skill_manager):
        """测试获取技能统计（未找到）"""
        stats = skill_manager.get_skill_stats("nonexistent_skill")

        assert stats == {}

    def test_get_all_stats(self, skill_manager):
        """测试获取所有技能统计"""
        skill_manager.active_skills = {
            "skill1": Mock(),
            "skill2": Mock(),
            "skill3": Mock()
        }
        skill_manager.skill_stats = {
            "skill1": {"hooks_triggered": 5},
            "skill2": {"hooks_triggered": 3},
            "skill3": {"hooks_triggered": 7}
        }

        all_stats = skill_manager.get_all_stats()

        assert all_stats["total_skills"] == 3
        assert len(all_stats["skill_stats"]) == 3
        assert all_stats["skill_stats"]["skill1"]["hooks_triggered"] == 5

    @pytest.mark.asyncio
    async def test_reload_skill_success(self, skill_manager):
        """测试重新加载技能成功"""
        # 模拟发现和加载过程
        metadata = SkillMetadata(name="reload_skill")
        mock_skill = Mock()
        mock_skill.config.name = "reload_skill"

        skill_manager.loader.discover_skills = AsyncMock(return_value=[metadata])
        skill_manager.loader.load_skill = AsyncMock(return_value=mock_skill)
        skill_manager.unregister_skill = AsyncMock(return_value=True)
        skill_manager.register_skill = AsyncMock(return_value=True)

        result = await skill_manager.reload_skill("reload_skill")

        assert result is True
        skill_manager.unregister_skill.assert_called_once_with("reload_skill")
        skill_manager.register_skill.assert_called_once_with(mock_skill)

    @pytest.mark.asyncio
    async def test_reload_skill_not_found(self, skill_manager):
        """测试重新加载技能（未找到）"""
        skill_manager.loader.discover_skills = AsyncMock(return_value=[])

        result = await skill_manager.reload_skill("nonexistent_skill")

        assert result is False

    @pytest.mark.asyncio
    async def test_enable_skill_success(self, skill_manager):
        """测试启用技能成功"""
        # 添加技能但未激活
        mock_skill = Mock()
        mock_skill.activate = AsyncMock()
        skill_manager.active_skills["test_skill"] = mock_skill

        result = await skill_manager.enable_skill("test_skill")

        assert result is True
        mock_skill.activate.assert_called_once()

    @pytest.mark.asyncio
    async def test_enable_skill_not_found(self, skill_manager):
        """测试启用技能（未找到）"""
        result = await skill_manager.enable_skill("nonexistent_skill")

        assert result is False

    @pytest.mark.asyncio
    async def test_disable_skill_success(self, skill_manager):
        """测试禁用技能成功"""
        # 添加技能
        mock_skill = Mock()
        mock_skill.deactivate = AsyncMock()
        skill_manager.active_skills["test_skill"] = mock_skill

        result = await skill_manager.disable_skill("test_skill")

        assert result is True
        mock_skill.deactivate.assert_called_once()

    @pytest.mark.asyncio
    async def test_disable_skill_not_found(self, skill_manager):
        """测试禁用技能（未找到）"""
        result = await skill_manager.disable_skill("nonexistent_skill")

        assert result is False

    def test_list_skills(self, skill_manager):
        """测试列出所有技能"""
        # 创建模拟技能
        skill1 = Mock()
        skill1.config = Mock()
        skill1.config.name = "skill1"
        skill1.config.description = "技能1"
        skill1.config.capabilities = ["测试1"]
        skill1.config.priority = 80
        skill1.config.hooks = ["pre_command"]
        skill1.active = True

        skill2 = Mock()
        skill2.config = Mock()
        skill2.config.name = "skill2"
        skill2.config.description = "技能2"
        skill2.config.capabilities = ["测试2"]
        skill2.config.priority = 60
        skill2.config.hooks = ["post_command"]
        skill2.active = False

        skill_manager.active_skills = {
            "skill1": skill1,
            "skill2": skill2
        }
        skill_manager.skill_stats = {
            "skill1": {"hooks_triggered": 5},
            "skill2": {"hooks_triggered": 3}
        }

        skills = skill_manager.list_skills()

        assert len(skills) == 2
        assert skills[0]["name"] == "skill1"
        assert skills[0]["description"] == "技能1"
        assert skills[0]["capabilities"] == ["测试1"]
        assert skills[0]["priority"] == 80
        assert skills[0]["active"] is True
        assert skills[0]["hooks"] == ["pre_command"]
        assert skills[0]["stats"]["hooks_triggered"] == 5

        assert skills[1]["name"] == "skill2"
        assert skills[1]["active"] is False


class TestCreateSkillFromConfig:
    """测试从配置创建技能功能"""

    def test_create_skill_complete_config(self):
        """测试创建技能（完整配置）"""
        from src.adapters.codebuddy.skills_hook_adapter import SkillConfig, HookType

        skill_config = {
            "name": "complete_skill",
            "description": "完整配置技能",
            "capabilities": ["完整", "测试"],
            "priority": 90,
            "protocols": ["chinese", "english"],
            "hooks": ["pre_command", "post_command"],
            "handlers": {
                "pre_command": "handle_pre_command",
                "post_command": "handle_post_command"
            }
        }

        skill = create_skill_from_config(skill_config)

        assert skill.config.name == "complete_skill"
        assert skill.config.description == "完整配置技能"
        assert skill.config.capabilities == ["完整", "测试"]
        assert skill.config.priority == 90
        assert skill.config.protocols == ["chinese", "english"]
        assert skill.config.hooks == [HookType.PRE_COMMAND, HookType.POST_COMMAND]
        assert len(skill.registered_hooks) == 2

    def test_create_skill_minimal_config(self):
        """测试创建技能（最小配置）"""
        skill_config = {
            "name": "minimal_skill"
        }

        skill = create_skill_from_config(skill_config)

        assert skill.config.name == "minimal_skill"
        assert skill.config.description == ""
        assert skill.config.capabilities == []
        assert skill.config.priority == 50
        assert skill.config.protocols == ["chinese", "english"]
        assert skill.config.hooks == []
        assert len(skill.registered_hooks) == 0

    def test_create_skill_invalid_hook(self):
        """测试创建技能（无效钩子）"""
        skill_config = {
            "name": "invalid_hook_skill",
            "hooks": ["invalid_hook_type"],
            "handlers": {
                "invalid_hook_type": "handle_invalid"
            }
        }

        # 应该创建技能但不注册无效钩子
        skill = create_skill_from_config(skill_config)

        assert skill.config.name == "invalid_hook_skill"
        assert skill.config.hooks == []  # 空列表，因为钩子类型无效
        assert len(skill.registered_hooks) == 0


class TestIntegrationScenarios:
    """集成测试场景"""

    @pytest.mark.asyncio
    async def test_full_skill_lifecycle(self):
        """测试完整技能生命周期"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # 创建模拟适配器
            mock_adapter = Mock()
            mock_adapter.register_external_skill = AsyncMock(return_value=True)

            # 创建技能管理器
            manager = SkillManager(mock_adapter, temp_dir)

            # 创建临时技能
            skill_dir = Path(temp_dir) / "skills" / "lifecycle_skill"
            skill_dir.mkdir(parents=True)

            config_file = skill_dir / "skill.json"
            config_data = {
                "name": "lifecycle_skill",
                "description": "生命周期测试技能",
                "category": "test",
                "tags": ["lifecycle", "test"]
            }

            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(config_data, f)

            # 初始化技能管理器
            await manager.initialize()

            # 验证技能已注册
            assert len(manager.active_skills) == 1

            # 测试启用/禁用
            await manager.disable_skill("lifecycle_skill")
            await manager.enable_skill("lifecycle_skill")

            # 测试重新加载
            await manager.reload_skill("lifecycle_skill")

            # 测试注销
            await manager.unregister_skill("lifecycle_skill")

            # 验证技能已移除
            assert len(manager.active_skills) == 0

    @pytest.mark.asyncio
    async def test_multiple_skills_management(self):
        """测试多技能管理"""
        with tempfile.TemporaryDirectory() as temp_dir:
            mock_adapter = Mock()
            mock_adapter.register_external_skill = AsyncMock(return_value=True)

            manager = SkillManager(mock_adapter, temp_dir)

            # 创建多个技能
            skills_dir = Path(temp_dir) / "skills"
            skills_dir.mkdir()

            for i in range(3):
                skill_dir = skills_dir / f"skill_{i}"
                skill_dir.mkdir()

                config_file = skill_dir / "skill.json"
                config_data = {
                    "name": f"skill_{i}",
                    "description": f"技能 {i}",
                    "category": "test",
                    "tags": [f"skill_{i}"]
                }

                with open(config_file, 'w', encoding='utf-8') as f:
                    json.dump(config_data, f)

            # 初始化
            await manager.initialize()

            # 验证所有技能已加载
            assert len(manager.active_skills) == 3

            # 获取统计信息
            stats = manager.get_all_stats()
            assert stats["total_skills"] == 3

            # 列出技能
            skills_list = manager.list_skills()
            assert len(skills_list) == 3

            # 验证技能信息
            skill_names = [skill["name"] for skill in skills_list]
            assert "skill_0" in skill_names
            assert "skill_1" in skill_names
            assert "skill_2" in skill_names


if __name__ == "__main__":
    # 运行测试
    pytest.main([__file__, "-v"])