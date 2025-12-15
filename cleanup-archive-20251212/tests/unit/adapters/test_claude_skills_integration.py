"""
Claude Skills Integration 单元测试
测试Claude特化的技能发现、加载和管理功能
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

from src.adapters.claude.claude_skills_integration import (
    ClaudeSkillLoader,
    ClaudeSkillManager,
    ClaudeSkillMetadata,
    create_claude_skill_from_config
)


class TestClaudeSkillMetadata:
    """测试ClaudeSkillMetadata类"""

    def test_claude_skill_metadata_creation(self):
        """测试Claude技能元数据创建"""
        metadata = ClaudeSkillMetadata(
            name="test_claude_skill",
            version="2.0.0",
            author="Claude Team",
            description="Claude测试技能",
            category="intelligence",
            tags=["claude", "test", "ai"],
            dependencies=["asyncio", "json"],
            entry_point="main.py",
            claude_features=["intelligent_analysis", "learning_optimization"],
            intelligence_level="advanced",
            learning_enabled=True
        )

        assert metadata.name == "test_claude_skill"
        assert metadata.version == "2.0.0"
        assert metadata.author == "Claude Team"
        assert metadata.description == "Claude测试技能"
        assert metadata.category == "intelligence"
        assert metadata.tags == ["claude", "test", "ai"]
        assert metadata.dependencies == ["asyncio", "json"]
        assert metadata.entry_point == "main.py"
        assert metadata.claude_features == ["intelligent_analysis", "learning_optimization"]
        assert metadata.intelligence_level == "advanced"
        assert metadata.learning_enabled is True

    def test_claude_skill_metadata_defaults(self):
        """测试Claude技能元数据默认值"""
        metadata = ClaudeSkillMetadata(name="minimal_claude_skill")

        assert metadata.name == "minimal_claude_skill"
        assert metadata.version == "1.0.0"
        assert metadata.author == ""
        assert metadata.description == ""
        assert metadata.category == ""
        assert metadata.tags == []
        assert metadata.dependencies == []
        assert metadata.entry_point == ""
        assert metadata.claude_features == []
        assert metadata.intelligence_level == "standard"
        assert metadata.learning_enabled is True


class TestClaudeSkillLoader:
    """测试ClaudeSkillLoader类"""

    @pytest.fixture
    def temp_claude_skills_dir(self):
        """创建临时Claude技能目录"""
        with tempfile.TemporaryDirectory() as temp_dir:
            claude_skills_dir = Path(temp_dir) / "claude_skills"
            claude_skills_dir.mkdir()
            yield claude_skills_dir

    @pytest.fixture
    def claude_skill_loader(self, temp_claude_skills_dir):
        """创建Claude技能加载器"""
        return ClaudeSkillLoader(str(temp_claude_skills_dir))

    def test_claude_skill_loader_initialization(self, claude_skill_loader):
        """测试Claude技能加载器初始化"""
        assert claude_skill_loader.skills_directory.exists()
        assert claude_skill_loader.loaded_skills == {}
        assert claude_skill_loader.skill_registry == {}
        assert claude_skill_loader.claude_feature_registry == {}

    @pytest.mark.asyncio
    async def test_discover_claude_skills_no_skills(self, claude_skill_loader):
        """测试发现Claude技能（无技能）"""
        skills = await claude_skill_loader.discover_claude_skills()
        assert len(skills) == 0

    @pytest.mark.asyncio
    async def test_discover_claude_skills_from_directory(self, claude_skill_loader, temp_claude_skills_dir):
        """测试从目录发现Claude技能"""
        # 创建Claude技能目录和配置文件
        test_claude_skill_dir = temp_claude_skills_dir / "test_claude_skill"
        test_claude_skill_dir.mkdir()

        config_file = test_claude_skill_dir / "claude_skill.json"
        config_data = {
            "name": "test_claude_skill",
            "version": "2.0.0",
            "author": "Claude Developer",
            "description": "Claude测试技能",
            "category": "intelligence",
            "tags": ["claude", "test"],
            "dependencies": ["asyncio"],
            "entry_point": "main.py",
            "claude_features": ["intelligent_analysis"],
            "intelligence_level": "advanced",
            "learning_enabled": True
        }

        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config_data, f)

        skills = await claude_skill_loader.discover_claude_skills()

        assert len(skills) == 1
        assert skills[0].name == "test_claude_skill"
        assert skills[0].author == "Claude Developer"
        assert skills[0].claude_features == ["intelligent_analysis"]
        assert skills[0].intelligence_level == "advanced"

    @pytest.mark.asyncio
    async def test_discover_claude_skills_invalid_config(self, claude_skill_loader, temp_claude_skills_dir):
        """测试发现Claude技能（无效配置）"""
        # 创建Claude技能目录和无效配置文件
        test_claude_skill_dir = temp_claude_skills_dir / "invalid_claude_skill"
        test_claude_skill_dir.mkdir()

        config_file = test_claude_skill_dir / "claude_skill.json"
        with open(config_file, 'w', encoding='utf-8') as f:
            f.write("invalid json content")

        skills = await claude_skill_loader.discover_claude_skills()

        assert len(skills) == 0

    @pytest.mark.asyncio
    async def test_load_claude_skill_metadata_success(self, claude_skill_loader, temp_claude_skills_dir):
        """测试加载Claude技能元数据成功"""
        # 创建Claude技能目录和配置文件
        test_claude_skill_dir = temp_claude_skills_dir / "metadata_claude_skill"
        test_claude_skill_dir.mkdir()

        config_file = test_claude_skill_dir / "skill.json"
        config_data = {
            "name": "metadata_claude_skill",
            "version": "2.0.0",
            "description": "Claude元数据测试技能",
            "category": "metadata",
            "tags": ["metadata", "claude", "test"],
            "dependencies": ["json"],
            "entry_point": "handler.py",
            "claude_features": ["semantic_understanding", "context_awareness"],
            "intelligence_level": "advanced",
            "learning_enabled": True
        }

        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config_data, f)

        metadata = await claude_skill_loader._load_claude_skill_metadata(test_claude_skill_dir)

        assert metadata is not None
        assert metadata.name == "metadata_claude_skill"
        assert metadata.version == "2.0.0"
        assert metadata.description == "Claude元数据测试技能"
        assert metadata.category == "metadata"
        assert metadata.tags == ["metadata", "claude", "test"]
        assert metadata.dependencies == ["json"]
        assert metadata.entry_point == "handler.py"
        assert metadata.claude_features == ["semantic_understanding", "context_awareness"]
        assert metadata.intelligence_level == "advanced"
        assert metadata.learning_enabled is True

    @pytest.mark.asyncio
    async def test_load_config_claude_skills(self, claude_skill_loader):
        """测试从配置文件加载Claude技能"""
        # 模拟配置文件存在
        config_data = {
            "claude_skills": [
                {
                    "name": "config_claude_skill1",
                    "version": "2.0.0",
                    "author": "Config Claude Author",
                    "description": "Claude配置技能1",
                    "category": "config",
                    "tags": ["config", "claude", "external"],
                    "claude_features": ["intelligent_analysis"],
                    "entry_point": "external1.py",
                    "intelligence_level": "standard"
                },
                {
                    "name": "config_claude_skill2",
                    "description": "Claude配置技能2",
                    "claude_features": ["learning_optimization"],
                    "entry_point": "external2.py"
                }
            ]
        }

        with patch('pathlib.Path.exists', return_value=True):
            with patch('builtins.open', create=True) as mock_open:
                mock_open.return_value.__enter__.return_value.read.return_value = json.dumps(config_data)
                with patch('json.load', return_value=config_data):
                    skills = await claude_skill_loader._load_config_claude_skills()

        assert len(skills) == 2
        assert skills[0].name == "config_claude_skill1"
        assert skills[0].author == "Config Claude Author"
        assert skills[0].claude_features == ["intelligent_analysis"]
        assert skills[1].name == "config_claude_skill2"
        assert skills[1].version == "1.0.0"  # 默认版本
        assert skills[1].intelligence_level == "standard"  # 默认智能等级

    def test_register_claude_features(self, claude_skill_loader):
        """测试注册Claude特性"""
        # 创建测试技能元数据
        skill1 = ClaudeSkillMetadata(
            name="skill1",
            claude_features=["intelligent_analysis", "learning_optimization"]
        )
        skill2 = ClaudeSkillMetadata(
            name="skill2",
            claude_features=["intelligent_analysis", "semantic_understanding"]
        )
        skill3 = ClaudeSkillMetadata(
            name="skill3",
            claude_features=["context_awareness"]
        )

        skills = [skill1, skill2, skill3]

        claude_skill_loader._register_claude_features(skills)

        # 验证特性注册
        assert "intelligent_analysis" in claude_skill_loader.claude_feature_registry
        assert "learning_optimization" in claude_skill_loader.claude_feature_registry
        assert "semantic_understanding" in claude_skill_loader.claude_feature_registry
        assert "context_awareness" in claude_skill_loader.claude_feature_registry

        # 验证特性映射
        assert claude_skill_loader.claude_feature_registry["intelligent_analysis"] == ["skill1", "skill2"]
        assert claude_skill_loader.claude_feature_registry["learning_optimization"] == ["skill1"]
        assert claude_skill_loader.claude_feature_registry["semantic_understanding"] == ["skill2"]
        assert claude_skill_loader.claude_feature_registry["context_awareness"] == ["skill3"]

    def test_calculate_priority(self, claude_skill_loader):
        """测试计算技能优先级"""
        # 基础技能
        basic_skill = ClaudeSkillMetadata(
            name="basic_skill",
            intelligence_level="basic",
            claude_features=[],
            learning_enabled=False
        )
        priority_basic = claude_skill_loader._calculate_priority(basic_skill)
        assert priority_basic == 50

        # 标准技能
        standard_skill = ClaudeSkillMetadata(
            name="standard_skill",
            intelligence_level="standard",
            claude_features=["intelligent_analysis"],
            learning_enabled=True
        )
        priority_standard = claude_skill_loader._calculate_priority(standard_skill)
        assert priority_standard == 50 + 10 + 5 + 15  # 基础 + 智能等级 + 特性数量 + 学习功能

        # 高级技能
        advanced_skill = ClaudeSkillMetadata(
            name="advanced_skill",
            intelligence_level="advanced",
            claude_features=["intelligent_analysis", "learning_optimization", "semantic_understanding"],
            learning_enabled=True
        )
        priority_advanced = claude_skill_loader._calculate_priority(advanced_skill)
        expected = 50 + 25 + 15 + 15  # 基础 + 智能等级 + 特性数量 + 学习功能
        assert priority_advanced == min(expected, 100)  # 最大优先级100

    @pytest.mark.asyncio
    async def test_load_claude_skill_success(self, claude_skill_loader):
        """测试加载Claude技能成功"""
        metadata = ClaudeSkillMetadata(
            name="loadable_claude_skill",
            description="可加载Claude技能",
            tags=["test", "claude"],
            claude_features=["intelligent_analysis"],
            intelligence_level="advanced",
            entry_point=""
        )

        # 模拟依赖检查和代码加载
        claude_skill_loader._check_dependencies = AsyncMock()
        claude_skill_loader._load_claude_skill_code = AsyncMock()

        from src.adapters.claude.skills_hook_adapter import ClaudeSkill
        with patch('src.adapters.claude.claude_skills_integration.ClaudeSkill') as mock_skill_class:
            mock_skill = Mock(spec=ClaudeSkill)
            mock_skill_class.return_value = mock_skill

            skill = await claude_skill_loader.load_claude_skill(metadata)

            assert skill is not None
            claude_skill_loader._check_dependencies.assert_called_once_with(metadata)
            claude_skill_loader._load_claude_skill_code.assert_called_once_with(skill, metadata)

            # 验证注册到加载器
            assert "loadable_claude_skill" in claude_skill_loader.loaded_skills
            assert "loadable_claude_skill" in claude_skill_loader.skill_registry

    @pytest.mark.asyncio
    async def test_load_claude_skill_dependency_missing(self, claude_skill_loader):
        """测试加载Claude技能（依赖缺失）"""
        metadata = ClaudeSkillMetadata(
            name="dependent_claude_skill",
            dependencies=["nonexistent_claude_module"]
        )

        # 模拟依赖检查失败
        claude_skill_loader._check_dependencies = AsyncMock(side_effect=ImportError("Claude模块不存在"))

        skill = await claude_skill_loader.load_claude_skill(metadata)

        assert skill is None

    @pytest.mark.asyncio
    async def test_check_dependencies_success(self, claude_skill_loader):
        """测试检查Claude依赖成功"""
        metadata = ClaudeSkillMetadata(dependencies=["json", "asyncio", "os"])

        # 不应该抛出异常
        await claude_skill_loader._check_dependencies(metadata)

    @pytest.mark.asyncio
    async def test_check_dependencies_failure(self, claude_skill_loader):
        """测试检查Claude依赖失败"""
        metadata = ClaudeSkillMetadata(dependencies=["nonexistent_claude_module_12345"])

        with pytest.raises(ImportError):
            await claude_skill_loader._check_dependencies(metadata)

    @pytest.mark.asyncio
    async def test_load_claude_features(self, claude_skill_loader):
        """测试加载Claude特性"""
        from src.adapters.claude.skills_hook_adapter import ClaudeSkill
        mock_skill = Mock(spec=ClaudeSkill)

        metadata = ClaudeSkillMetadata(
            claude_features=[
                "intelligent_analysis",
                "context_awareness",
                "learning_optimization",
                "semantic_understanding",
                "natural_language_processing"
            ]
        )

        await claude_skill_loader._load_claude_features(mock_skill, metadata)

        # 验证特性设置
        assert mock_skill.has_intelligent_analysis is True
        assert mock_skill.has_context_awareness is True
        assert mock_skill.has_learning_optimization is True
        assert mock_skill.has_semantic_understanding is True
        assert mock_skill.has_natural_language_processing is True

    def test_get_skills_by_feature(self, claude_skill_loader):
        """测试根据特性获取Claude技能列表"""
        # 设置特性注册表
        claude_skill_loader.claude_feature_registry = {
            "intelligent_analysis": ["skill1", "skill3"],
            "learning_optimization": ["skill1", "skill2"],
            "semantic_understanding": ["skill3"]
        }

        analysis_skills = claude_skill_loader.get_skills_by_feature("intelligent_analysis")
        learning_skills = claude_skill_loader.get_skills_by_feature("learning_optimization")
        unknown_skills = claude_skill_loader.get_skills_by_feature("unknown_feature")

        assert analysis_skills == ["skill1", "skill3"]
        assert learning_skills == ["skill1", "skill2"]
        assert unknown_skills == []

    def test_get_all_features(self, claude_skill_loader):
        """测试获取所有Claude特性"""
        claude_skill_loader.claude_feature_registry = {
            "intelligent_analysis": ["skill1"],
            "learning_optimization": ["skill2"],
            "semantic_understanding": ["skill3"],
            "context_awareness": ["skill4"]
        }

        all_features = claude_skill_loader.get_all_features()

        assert set(all_features) == {
            "intelligent_analysis",
            "learning_optimization",
            "semantic_understanding",
            "context_awareness"
        }


class TestClaudeSkillManager:
    """测试ClaudeSkillManager类"""

    @pytest.fixture
    def mock_adapter(self):
        """模拟Claude适配器"""
        adapter = Mock()
        adapter.register_external_skill = AsyncMock(return_value=True)
        return adapter

    @pytest.fixture
    def claude_skill_manager(self, mock_adapter):
        """创建Claude技能管理器"""
        with tempfile.TemporaryDirectory() as temp_dir:
            manager = ClaudeSkillManager(mock_adapter, temp_dir)
            yield manager

    @pytest.mark.asyncio
    async def test_claude_skill_manager_initialization(self, claude_skill_manager):
        """测试Claude技能管理器初始化"""
        # 模拟发现和加载过程
        claude_skill_manager.loader.discover_claude_skills = AsyncMock(return_value=[])
        claude_skill_manager.loader.load_claude_skill = AsyncMock(return_value=None)
        claude_skill_manager.register_claude_skill = AsyncMock(return_value=True)

        await claude_skill_manager.initialize()

        claude_skill_manager.loader.discover_claude_skills.assert_called_once()

    @pytest.mark.asyncio
    async def test_register_claude_skill_success(self, claude_skill_manager):
        """测试注册Claude技能成功"""
        # 创建模拟Claude技能
        mock_claude_skill = Mock()
        mock_claude_skill.config = Mock()
        mock_claude_skill.config.name = "registerable_claude_skill"
        mock_claude_skill.config.description = "可注册Claude技能"
        mock_claude_skill.config.capabilities = ["Claude注册", "智能"]
        mock_claude_skill.config.priority = 80
        mock_claude_skill.config.hooks = []
        mock_claude_skill.config.category = "test"
        mock_claude_skill.config.author = "Claude Developer"
        mock_claude_skill.claude_features = ["intelligent_analysis"]
        mock_claude_skill.intelligence_level = "advanced"
        mock_claude_skill.learning_enabled = True
        mock_claude_skill.activate = AsyncMock()

        result = await claude_skill_manager.register_claude_skill(mock_claude_skill)

        assert result is True
        assert "registerable_claude_skill" in claude_skill_manager.active_skills
        assert "registerable_claude_skill" in claude_skill_manager.skill_stats
        assert claude_skill_manager.skill_stats["registerable_claude_skill"]["registered_at"] > 0
        assert "registerable_claude_skill" in claude_skill_manager.learning_data

    @pytest.mark.asyncio
    async def test_register_claude_skill_without_learning(self, claude_skill_manager):
        """测试注册Claude技能（无学习功能）"""
        # 创建模拟Claude技能（无学习功能）
        mock_claude_skill = Mock()
        mock_claude_skill.config = Mock()
        mock_claude_skill.config.name = "no_learning_claude_skill"
        mock_claude_skill.config.description = "无学习Claude技能"
        mock_claude_skill.config.capabilities = ["Claude测试"]
        mock_claude_skill.config.priority = 60
        mock_claude_skill.config.hooks = []
        mock_claude_skill.config.category = "test"
        mock_claude_skill.config.author = "Claude Developer"
        mock_claude_skill.claude_features = []
        mock_claude_skill.intelligence_level = "basic"
        mock_claude_skill.learning_enabled = False
        mock_claude_skill.activate = AsyncMock()

        result = await claude_skill_manager.register_claude_skill(mock_claude_skill)

        assert result is True
        assert "no_learning_claude_skill" in claude_skill_manager.active_skills
        assert "no_learning_claude_skill" in claude_skill_manager.skill_stats
        assert "no_learning_claude_skill" not in claude_skill_manager.learning_data  # 无学习功能

    @pytest.mark.asyncio
    async def test_register_claude_skill_failure(self, claude_skill_manager):
        """测试注册Claude技能失败"""
        # 模拟适配器注册失败
        claude_skill_manager.adapter.register_external_skill = AsyncMock(return_value=False)

        mock_claude_skill = Mock()
        mock_claude_skill.config = Mock()
        mock_claude_skill.config.name = "fail_claude_skill"
        mock_claude_skill.activate = AsyncMock()

        result = await claude_skill_manager.register_claude_skill(mock_claude_skill)

        assert result is False
        assert "fail_claude_skill" not in claude_skill_manager.active_skills

    @pytest.mark.asyncio
    async def test_update_learning_data(self, claude_skill_manager):
        """测试更新学习数据"""
        # 设置学习数据
        claude_skill_manager.learning_data["test_claude_skill"] = {
            "performance_history": [],
            "optimization_suggestions": [],
            "usage_patterns": {}
        }
        claude_skill_manager.skill_stats["test_claude_skill"] = {"learning_updates": 0}

        # 更新学习数据
        performance_data = {
            "success": True,
            "response_time": 1.5,
            "context": {"user_type": "developer"}
        }

        await claude_skill_manager.update_learning_data("test_claude_skill", performance_data)

        learning_data = claude_skill_manager.learning_data["test_claude_skill"]
        stats = claude_skill_manager.skill_stats["test_claude_skill"]

        assert len(learning_data["performance_history"]) == 1
        assert learning_data["performance_history"][0]["performance"] == performance_data
        assert stats["learning_updates"] == 1

    def test_update_usage_patterns(self, claude_skill_manager):
        """测试更新使用模式"""
        learning_data = {
            "usage_patterns": {}
        }

        performance_data = {
            "success": True,
            "context": {"task_type": "analysis"}
        }

        claude_skill_manager._update_usage_patterns("test_skill", performance_data)

        patterns = learning_data["usage_patterns"]
        assert "hourly_usage" in patterns
        assert "successful_patterns" in patterns
        assert len(patterns["successful_patterns"]) == 1

    def test_generate_optimization_suggestions(self, claude_skill_manager):
        """测试生成优化建议"""
        learning_data = {
            "performance_history": [
                {"performance": {"success": True, "response_time": 1.0}},
                {"performance": {"success": False, "response_time": 2.0}},
                {"performance": {"success": True, "response_time": 1.5}},
                {"performance": {"success": False, "response_time": 3.0}},
                {"performance": {"success": True, "response_time": 1.2}},
                {"performance": {"success": True, "response_time": 1.1}},
                {"performance": {"success": True, "response_time": 1.3}},
                {"performance": {"success": False, "response_time": 2.5}},
                {"performance": {"success": True, "response_time": 1.4}},
                {"performance": {"success": True, "response_time": 1.0}}
            ],
            "usage_patterns": {
                "hourly_usage": {14: 5, 15: 3, 16: 2}
            }
        }

        suggestions = claude_skill_manager._generate_optimization_suggestions("test_skill", learning_data)

        assert isinstance(suggestions, list)
        # 成功率60%，应该有改进建议
        assert any("成功率较低" in s for s in suggestions)

    def test_summarize_performance(self, claude_skill_manager):
        """测试总结性能数据"""
        performance_history = [
            {"performance": {"success": True, "response_time": 1.0}},
            {"performance": {"success": True, "response_time": 1.5}},
            {"performance": {"success": False, "response_time": 2.0}},
            {"performance": {"success": True, "response_time": 1.2}}
        ]

        summary = claude_skill_manager._summarize_performance(performance_history)

        assert summary["recent_success_rate"] == 0.75  # 3/4
        assert summary["total_executions"] == 4
        assert summary["average_response_time"] == 1.425  # (1.0+1.5+2.0+1.2)/4

    def test_get_learning_insights(self, claude_skill_manager):
        """测试获取学习洞察"""
        claude_skill_manager.learning_data["test_claude_skill"] = {
            "optimization_suggestions": ["建议1", "建议2"],
            "usage_patterns": {"hourly_usage": {14: 5}},
            "performance_history": [
                {"performance": {"success": True, "response_time": 1.0}}
            ]
        }
        claude_skill_manager.skill_stats["test_claude_skill"] = {"learning_updates": 5}

        insights = claude_skill_manager.get_learning_insights("test_claude_skill")

        assert insights["total_learning_updates"] == 5
        assert len(insights["optimization_suggestions"]) == 2
        assert "usage_patterns" in insights
        assert "performance_summary" in insights

    def test_get_claude_feature_stats(self, claude_skill_manager):
        """测试获取Claude特性统计"""
        # 设置活动技能
        claude_skill_manager.active_skills = {
            "skill1": Mock(claude_features=["intelligent_analysis", "learning_optimization"]),
            "skill2": Mock(claude_features=["intelligent_analysis", "semantic_understanding"]),
            "skill3": Mock(claude_features=["context_awareness"])
        }

        # 设置技能统计
        claude_skill_manager.skill_stats = {
            "skill1": {"claude_features_used": {"intelligent_analysis"}},
            "skill2": {"claude_features_used": {"intelligent_analysis", "semantic_understanding"}},
            "skill3": {"claude_features_used": set()}
        }

        feature_stats = claude_skill_manager.get_claude_feature_stats()

        assert feature_stats["feature_usage"]["intelligent_analysis"] == 2
        assert feature_stats["feature_usage"]["learning_optimization"] == 1
        assert feature_stats["feature_usage"]["semantic_understanding"] == 1
        assert feature_stats["feature_usage"]["context_awareness"] == 1

        assert feature_stats["feature_effectiveness"]["intelligent_analysis"] == 2
        assert feature_stats["feature_effectiveness"]["semantic_understanding"] == 1

        assert feature_stats["total_features"] == 4
        assert len(feature_stats["most_used_features"]) <= 5

    @pytest.mark.asyncio
    async def test_optimize_skill_performance(self, claude_skill_manager):
        """测试优化技能性能"""
        # 设置活动技能
        mock_skill = Mock()
        mock_skill.retry_count = 2
        mock_skill.priority = 80
        claude_skill_manager.active_skills["test_claude_skill"] = mock_skill

        # 设置学习数据
        claude_skill_manager.learning_data["test_claude_skill"] = {
            "optimization_suggestions": [
                "成功率较低，建议检查技能配置或增加错误处理",
                "使用高峰时段：14:00，可以考虑在此时段优化性能"
            ]
        }

        result = await claude_skill_manager.optimize_skill_performance("test_claude_skill")

        assert result is True
        assert mock_skill.retry_count == 3  # 增加重试次数
        assert mock_skill.priority == 90   # 增加优先级

    def test_get_skill_stats(self, claude_skill_manager):
        """测试获取Claude技能统计"""
        # 设置技能
        mock_skill = Mock()
        mock_skill.claude_features = ["intelligent_analysis", "learning_optimization"]
        mock_skill.intelligence_level = "advanced"
        claude_skill_manager.active_skills["test_claude_skill"] = mock_skill

        # 设置统计
        claude_skill_manager.skill_stats["test_claude_skill"] = {
            "registered_at": 1234567890,
            "hooks_triggered": 10,
            "errors": 2
        }
        claude_skill_manager.learning_data["test_claude_skill"] = {
            "optimization_suggestions": ["建议1"]
        }

        stats = claude_skill_manager.get_skill_stats("test_claude_skill")

        assert stats["registered_at"] == 1234567890
        assert stats["hooks_triggered"] == 10
        assert stats["errors"] == 2
        assert "learning_insights" in stats
        assert stats["claude_features"] == ["intelligent_analysis", "learning_optimization"]
        assert stats["intelligence_level"] == "advanced"

    def test_get_all_stats(self, claude_skill_manager):
        """测试获取所有Claude技能统计"""
        claude_skill_manager.active_skills = {
            "skill1": Mock(learning_enabled=True),
            "skill2": Mock(learning_enabled=False),
            "skill3": Mock(learning_enabled=True)
        }
        claude_skill_manager.skill_stats = {
            "skill1": {"hooks_triggered": 5},
            "skill2": {"hooks_triggered": 3},
            "skill3": {"hooks_triggered": 7}
        }

        claude_skill_manager.get_claude_feature_stats = Mock(return_value={
            "feature_usage": {"intelligent_analysis": 2},
            "most_used_features": [("intelligent_analysis", 2)]
        })

        all_stats = claude_skill_manager.get_all_stats()

        assert all_stats["total_skills"] == 3
        assert all_stats["learning_enabled_skills"] == 2
        assert "skill_stats" in all_stats
        assert "claude_feature_stats" in all_stats


class TestCreateClaudeSkillFromConfig:
    """测试从配置创建Claude技能功能"""

    def test_create_claude_skill_complete_config(self):
        """测试创建Claude技能（完整配置）"""
        from src.adapters.claude.skills_hook_adapter import SkillConfig, HookType

        skill_config = {
            "name": "complete_claude_skill",
            "description": "完整Claude配置技能",
            "capabilities": ["完整", "Claude智能"],
            "priority": 90,
            "protocols": ["chinese", "english"],
            "hooks": ["user_prompt_submit", "response_generated"],
            "category": "intelligence",
            "author": "Claude Developer",
            "claude_features": ["intelligent_analysis", "learning_optimization"],
            "intelligence_level": "advanced",
            "learning_enabled": True,
            "handlers": {
                "user_prompt_submit": "handle_claude_user_prompt",
                "response_generated": "handle_claude_response"
            }
        }

        skill = create_claude_skill_from_config(skill_config)

        assert skill.config.name == "complete_claude_skill"
        assert skill.config.description == "完整Claude配置技能"
        assert skill.config.capabilities == ["完整", "Claude智能"]
        assert skill.config.priority == 90
        assert skill.config.protocols == ["chinese", "english"]
        assert skill.config.hooks == [HookType.USER_PROMPT_SUBMIT, HookType.RESPONSE_GENERATED]
        assert skill.config.category == "intelligence"
        assert skill.config.author == "Claude Developer"
        assert len(skill.registered_hooks) == 2
        assert skill.intelligence_level == "advanced"
        assert skill.learning_enabled is True
        assert skill.claude_features == ["intelligent_analysis", "learning_optimization"]

    def test_create_claude_skill_minimal_config(self):
        """测试创建Claude技能（最小配置）"""
        skill_config = {
            "name": "minimal_claude_skill"
        }

        skill = create_claude_skill_from_config(skill_config)

        assert skill.config.name == "minimal_claude_skill"
        assert skill.config.description == ""
        assert skill.config.capabilities == []
        assert skill.config.priority == 50
        assert skill.config.protocols == ["chinese", "english"]
        assert skill.config.hooks == []
        assert skill.config.category == ""
        assert skill.config.author == ""
        assert len(skill.registered_hooks) == 0
        assert skill.intelligence_level == "standard"
        assert skill.learning_enabled is True
        assert skill.claude_features == []

    def test_create_claude_skill_invalid_hook(self):
        """测试创建Claude技能（无效钩子）"""
        skill_config = {
            "name": "invalid_hook_claude_skill",
            "hooks": ["invalid_claude_hook_type"],
            "handlers": {
                "invalid_claude_hook_type": "handle_invalid_claude"
            }
        }

        # 应该创建技能但不注册无效钩子
        skill = create_claude_skill_from_config(skill_config)

        assert skill.config.name == "invalid_hook_claude_skill"
        assert skill.config.hooks == []  # 空列表，因为钩子类型无效
        assert len(skill.registered_hooks) == 0


class TestClaudeIntegrationScenarios:
    """Claude集成测试场景"""

    @pytest.mark.asyncio
    async def test_full_claude_skill_lifecycle(self):
        """测试完整Claude技能生命周期"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # 创建模拟Claude适配器
            mock_adapter = Mock()
            mock_adapter.register_external_skill = AsyncMock(return_value=True)

            # 创建Claude技能管理器
            manager = ClaudeSkillManager(mock_adapter, temp_dir)

            # 创建临时Claude技能
            claude_skill_dir = Path(temp_dir) / "claude_skills" / "lifecycle_claude_skill"
            claude_skill_dir.mkdir(parents=True)

            config_file = claude_skill_dir / "claude_skill.json"
            config_data = {
                "name": "lifecycle_claude_skill",
                "description": "Claude生命周期测试技能",
                "category": "test",
                "tags": ["lifecycle", "claude", "test"],
                "claude_features": ["intelligent_analysis"],
                "intelligence_level": "advanced",
                "learning_enabled": True
            }

            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(config_data, f)

            # 初始化Claude技能管理器
            await manager.initialize()

            # 验证Claude技能已注册
            assert len(manager.active_skills) == 1

            # 测试学习数据更新
            performance_data = {
                "success": True,
                "response_time": 1.2,
                "context": {"test": True}
            }
            await manager.update_learning_data("lifecycle_claude_skill", performance_data)

            # 验证学习数据
            assert "lifecycle_claude_skill" in manager.learning_data
            assert len(manager.learning_data["lifecycle_claude_skill"]["performance_history"]) == 1

            # 测试性能优化
            await manager.optimize_skill_performance("lifecycle_claude_skill")

            # 获取学习洞察
            insights = manager.get_learning_insights("lifecycle_claude_skill")
            assert "learning_updates" in insights
            assert "optimization_suggestions" in insights

    @pytest.mark.asyncio
    async def test_multiple_claude_skills_management(self):
        """测试多Claude技能管理"""
        with tempfile.TemporaryDirectory() as temp_dir:
            mock_adapter = Mock()
            mock_adapter.register_external_skill = AsyncMock(return_value=True)

            manager = ClaudeSkillManager(mock_adapter, temp_dir)

            # 创建多个Claude技能
            claude_skills_dir = Path(temp_dir) / "claude_skills"
            claude_skills_dir.mkdir()

            claude_skills_config = [
                {
                    "name": "claude_analyzer",
                    "description": "Claude分析器",
                    "claude_features": ["intelligent_analysis"],
                    "intelligence_level": "advanced"
                },
                {
                    "name": "claude_learner",
                    "description": "Claude学习器",
                    "claude_features": ["learning_optimization"],
                    "learning_enabled": True
                },
                {
                    "name": "claude_processor",
                    "description": "Claude处理器",
                    "claude_features": ["semantic_understanding", "context_awareness"]
                }
            ]

            for i, skill_config in enumerate(claude_skills_config):
                skill_dir = claude_skills_dir / f"claude_skill_{i}"
                skill_dir.mkdir()

                config_file = skill_dir / "claude_skill.json"
                with open(config_file, 'w', encoding='utf-8') as f:
                    json.dump(skill_config, f)

            # 初始化
            await manager.initialize()

            # 验证所有Claude技能已加载
            assert len(manager.active_skills) == 3

            # 获取统计信息
            stats = manager.get_all_stats()
            assert stats["total_skills"] == 3
            assert stats["learning_enabled_skills"] >= 1

            # 获取Claude特性统计
            feature_stats = manager.get_claude_feature_stats()
            assert feature_stats["total_features"] > 0
            assert "most_used_features" in feature_stats

            # 列出技能
            skills_list = list(manager.active_skills.keys())
            assert "claude_analyzer" in skills_list
            assert "claude_learner" in skills_list
            assert "claude_processor" in skills_list


if __name__ == "__main__":
    # 运行测试
    pytest.main([__file__, "-v"])