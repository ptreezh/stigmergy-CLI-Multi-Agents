"""
Claude Skills-Hook Adapter 单元测试
测试基于Claude技能和钩子的冗余跨CLI协同功能
"""

import pytest
import asyncio
import json
from unittest.mock import Mock, AsyncMock, patch
from pathlib import Path

# 导入被测试的模块
import sys
sys.path.append(str(Path(__file__).parent.parent.parent.parent))

from src.adapters.claude.skills_hook_adapter import (
    ClaudeSkillsHookAdapter,
    HookType,
    HookEvent,
    ClaudeSkill,
    SkillConfig
)
from src.core.config_manager import ConfigManager


class TestSkillConfig:
    """测试Claude SkillConfig类"""

    def test_claude_skill_config_creation(self):
        """测试Claude技能配置创建"""
        config = SkillConfig(
            name="test_claude_skill",
            description="Claude测试技能",
            capabilities=["Claude测试", "智能"],
            priority=80,
            hooks=[HookType.USER_PROMPT_SUBMIT],
            category="intelligence",
            author="Claude Team"
        )

        assert config.name == "test_claude_skill"
        assert config.description == "Claude测试技能"
        assert config.capabilities == ["Claude测试", "智能"]
        assert config.priority == 80
        assert config.hooks == [HookType.USER_PROMPT_SUBMIT]
        assert config.category == "intelligence"
        assert config.author == "Claude Team"

    def test_claude_skill_config_defaults(self):
        """测试Claude技能配置默认值"""
        config = SkillConfig(name="default_claude_skill")

        assert config.name == "default_claude_skill"
        assert config.description == ""
        assert config.capabilities == []
        assert config.priority == 50
        assert config.protocols == ["chinese", "english"]
        assert config.hooks == []
        assert config.enabled is True
        assert config.category == ""
        assert config.author == ""


class TestHookEvent:
    """测试Claude HookEvent类"""

    def test_hook_event_creation(self):
        """测试钩子事件创建"""
        event = HookEvent(
            hook_type=HookType.USER_PROMPT_SUBMIT,
            prompt="Claude测试提示",
            session_id="claude_test_session",
            metadata={"source": "test"}
        )

        assert event.hook_type == HookType.USER_PROMPT_SUBMIT
        assert event.prompt == "Claude测试提示"
        assert event.session_id == "claude_test_session"
        assert event.metadata == {"source": "test"}
        assert event.timestamp is not None

    def test_hook_event_defaults(self):
        """测试钩子事件默认值"""
        event = HookEvent(hook_type=HookType.RESPONSE_GENERATED)

        assert event.hook_type == HookType.RESPONSE_GENERATED
        assert event.prompt == ""
        assert event.session_id == ""
        assert event.metadata == {}
        assert event.timestamp is not None


class TestClaudeSkill:
    """测试ClaudeSkill类"""

    @pytest.fixture
    def claude_skill_config(self):
        """创建Claude测试技能配置"""
        return SkillConfig(
            name="test_claude_skill",
            description="Claude测试技能",
            capabilities=["Claude智能"],
            priority=90,
            hooks=[HookType.USER_PROMPT_SUBMIT],
            category="intelligence"
        )

    @pytest.fixture
    def test_claude_skill(self, claude_skill_config):
        """创建Claude测试技能实例"""
        return ClaudeSkill(claude_skill_config)

    def test_claude_skill_creation(self, test_claude_skill, claude_skill_config):
        """测试Claude技能创建"""
        assert test_claude_skill.config == claude_skill_config
        assert test_claude_skill.registered_hooks == {}
        assert test_claude_skill.active is False
        assert test_claude_skill.usage_count == 0
        assert test_claude_skill.success_count == 0

    @pytest.mark.asyncio
    async def test_claude_hook_registration(self, test_claude_skill):
        """测试Claude钩子注册"""
        async def test_handler(event):
            return "Claude handled"

        test_claude_skill.register_hook(HookType.USER_PROMPT_SUBMIT, test_handler)

        assert HookType.USER_PROMPT_SUBMIT in test_claude_skill.registered_hooks
        assert test_claude_skill.registered_hooks[HookType.USER_PROMPT_SUBMIT] == test_handler

    @pytest.mark.asyncio
    async def test_claude_hook_trigger_success(self, test_claude_skill):
        """测试Claude钩子触发成功"""
        async def test_handler(event):
            return "Claude handled successfully"

        test_claude_skill.register_hook(HookType.USER_PROMPT_SUBMIT, test_handler)

        event = HookEvent(hook_type=HookType.USER_PROMPT_SUBMIT)
        result = await test_claude_skill.trigger_hook(event)

        assert result == "Claude handled successfully"
        assert test_claude_skill.usage_count == 1
        assert test_claude_skill.success_count == 1

    @pytest.mark.asyncio
    async def test_claude_hook_trigger_failure(self, test_claude_skill):
        """测试Claude钩子触发失败"""
        async def error_handler(event):
            raise ValueError("Claude测试错误")

        test_claude_skill.register_hook(HookType.USER_PROMPT_SUBMIT, error_handler)

        event = HookEvent(hook_type=HookType.USER_PROMPT_SUBMIT)
        result = await test_claude_skill.trigger_hook(event)

        assert result is None
        assert test_claude_skill.usage_count == 1
        assert test_claude_skill.success_count == 0

    @pytest.mark.asyncio
    async def test_claude_skill_activate_deactivate(self, test_claude_skill):
        """测试Claude技能激活和停用"""
        assert test_claude_skill.active is False

        await test_claude_skill.activate()
        assert test_claude_skill.active is True

        await test_claude_skill.deactivate()
        assert test_claude_skill.active is False

    def test_claude_skill_stats(self, test_claude_skill):
        """测试Claude技能统计"""
        test_claude_skill.usage_count = 10
        test_claude_skill.success_count = 8
        test_claude_skill.active = True

        stats = test_claude_skill.get_stats()

        assert stats["usage_count"] == 10
        assert stats["success_count"] == 8
        assert stats["success_rate"] == 0.8
        assert stats["active"] is True


class TestClaudeSkillsHookAdapter:
    """测试ClaudeSkillsHookAdapter类"""

    @pytest.fixture
    def mock_config_manager(self):
        """模拟配置管理器"""
        config_manager = Mock(spec=ConfigManager)
        return config_manager

    @pytest.fixture
    def claude_adapter(self, mock_config_manager):
        """创建Claude适配器实例"""
        # 模拟配置文件不存在
        with patch('pathlib.Path.exists', return_value=False):
            adapter = ClaudeSkillsHookAdapter(mock_config_manager)
        return adapter

    def test_claude_adapter_initialization(self, claude_adapter):
        """测试Claude适配器初始化"""
        assert claude_adapter.cli_name == "claude"
        assert claude_adapter.parser is not None
        assert len(claude_adapter.skills) == 4  # 四个内置Claude技能
        assert claude_adapter.hooks_enabled is True
        assert claude_adapter.hook_fallback_enabled is True
        assert len(claude_adapter.hook_registry) > 0
        assert claude_adapter.hooks_config_file.endswith("hooks.json")

    def test_claude_builtin_skills_creation(self, claude_adapter):
        """测试Claude内置技能创建"""
        expected_skills = [
            "claude_cross_cli_coordinator",
            "claude_intelligent_agent",
            "claude_error_recovery_expert",
            "claude_session_manager"
        ]

        for skill_name in expected_skills:
            assert skill_name in claude_adapter.skills
            assert claude_adapter.skills[skill_name].active is True

    def test_claude_cross_cli_skills_registration(self, claude_adapter):
        """测试Claude跨CLI技能注册"""
        cross_cli_skills = claude_adapter.cross_cli_skills
        assert "claude_cross_cli_coordinator" in cross_cli_skills
        assert len(cross_cli_skills) == 1

    @pytest.mark.asyncio
    async def test_claude_trigger_hooks_no_hooks(self, claude_adapter):
        """测试触发Claude钩子（无钩子启用）"""
        claude_adapter.hooks_enabled = False

        event = HookEvent(hook_type=HookType.USER_PROMPT_SUBMIT)
        results = await claude_adapter.trigger_hooks(HookType.USER_PROMPT_SUBMIT, event)

        assert results == []

    @pytest.mark.asyncio
    async def test_claude_trigger_hooks_success(self, claude_adapter):
        """测试触发Claude钩子成功"""
        event = HookEvent(hook_type=HookType.USER_PROMPT_SUBMIT, prompt="Claude测试")

        results = await claude_adapter.trigger_hooks(HookType.USER_PROMPT_SUBMIT, event)

        assert isinstance(results, list)

    @pytest.mark.asyncio
    async def test_handle_claude_user_prompt_submit_cross_cli(self, claude_adapter):
        """测试处理Claude用户提示提交（跨CLI）"""
        # 模拟意图解析
        mock_intent = Mock()
        mock_intent.is_cross_cli = True
        mock_intent.target_cli = "gemini"
        mock_intent.task = "Claude跨CLI任务"

        claude_adapter.parser.parse_intent = Mock(return_value=mock_intent)

        # 模拟跨CLI执行
        claude_adapter._execute_cross_cli_via_skills = AsyncMock(return_value="Claude技能结果")
        claude_adapter._execute_cross_cli_via_hooks = AsyncMock(return_value="Claude钩子结果")

        event = HookEvent(
            hook_type=HookType.USER_PROMPT_SUBMIT,
            prompt="请用gemini帮我处理Claude跨CLI任务"
        )

        result = await claude_adapter._handle_claude_user_prompt_submit(event)

        assert result is not None
        claude_adapter.parser.parse_intent.assert_called_once()

    @pytest.mark.asyncio
    async def test_handle_claude_user_prompt_submit_no_cross_cli(self, claude_adapter):
        """测试处理Claude用户提示提交（无跨CLI意图）"""
        mock_intent = Mock()
        mock_intent.is_cross_cli = False

        claude_adapter.parser.parse_intent = Mock(return_value=mock_intent)

        event = HookEvent(
            hook_type=HookType.USER_PROMPT_SUBMIT,
            prompt="普通Claude命令"
        )

        result = await claude_adapter._handle_claude_user_prompt_submit(event)

        assert result is None

    @pytest.mark.asyncio
    async def test_handle_claude_user_prompt_submit_self_target(self, claude_adapter):
        """测试处理Claude用户提示提交（目标为Claude自己）"""
        mock_intent = Mock()
        mock_intent.is_cross_cli = True
        mock_intent.target_cli = "claude"

        claude_adapter.parser.parse_intent = Mock(return_value=mock_intent)

        event = HookEvent(
            hook_type=HookType.USER_PROMPT_SUBMIT,
            prompt="请用claude帮我处理"
        )

        result = await claude_adapter._handle_claude_user_prompt_submit(event)

        assert result is None

    @pytest.mark.asyncio
    async def test_claude_redundant_cross_cli_detection(self, claude_adapter):
        """测试Claude冗余跨CLI检测"""
        # 模拟检测方法
        claude_adapter._detect_via_claude_patterns = Mock(return_value=None)
        claude_adapter._detect_via_semantic_analysis = Mock(return_value={
            "command": "用gemini分析Claude数据",
            "target_cli": "gemini",
            "task": "分析Claude数据",
            "method": "semantic_analysis"
        })
        claude_adapter._detect_via_context_clues = Mock(return_value=None)

        # 模拟钩子触发
        claude_adapter.trigger_hooks = AsyncMock(return_value=["Claude检测结果"])

        event = HookEvent(
            hook_type=HookType.TOOL_USE_PRE,
            prompt="用gemini分析Claude数据"
        )

        result = await claude_adapter._redundant_cross_cli_detection(event)

        assert result == "Claude检测结果"
        claude_adapter._detect_via_semantic_analysis.assert_called_once()

    def test_detect_via_claude_patterns(self, claude_adapter):
        """测试通过Claude增强模式检测"""
        command = "请用gemini帮我编写Claude集成代码"
        result = claude_adapter._detect_via_claude_patterns(command)

        assert result is not None
        assert result["target_cli"] == "gemini"
        assert result["method"] == "claude_pattern_detection"

    def test_detect_via_claude_patterns_no_match(self, claude_adapter):
        """测试通过Claude增强模式检测（无匹配）"""
        command = "普通Claude命令，没有跨CLI意图"
        result = claude_adapter._detect_via_claude_patterns(command)

        assert result is None

    def test_detect_via_semantic_analysis(self, claude_adapter):
        """测试通过语义分析检测"""
        command = "请克劳德助手分析数据"
        result = claude_adapter._detect_via_semantic_analysis(command)

        assert result is not None
        assert result["target_cli"] == "claude"
        assert result["method"] == "semantic_analysis"

    def test_detect_via_context_clues(self, claude_adapter):
        """测试通过上下文线索检测"""
        metadata = {
            "tool_calls": [
                {
                    "function": {
                        "name": "call_gemini_function",
                        "arguments": "Claude测试参数"
                    }
                }
            ]
        }

        event = HookEvent(hook_type=HookType.TOOL_USE_PRE, metadata=metadata)
        result = claude_adapter._detect_via_context_clues(event)

        assert result is not None
        assert result["target_cli"] == "gemini"
        assert result["method"] == "context_analysis"

    def test_select_best_result_claude_intelligent(self, claude_adapter):
        """测试Claude智能选择最佳结果"""
        result1 = "🧠 Claude智能分析完成"
        result2 = "钩子处理完成"

        best = claude_adapter._select_best_result(result1, result2)

        assert best == result1  # 选择包含Claude智能分析的结果

    def test_select_best_result_claude_no_indicators(self, claude_adapter):
        """测试选择最佳结果（无Claude指示器）"""
        result1 = "普通处理结果"
        result2 = "更长的处理结果，包含更多详细信息"

        best = claude_adapter._select_best_result(result1, result2)

        assert best == result2  # 选择更长的结果

    @pytest.mark.asyncio
    async def test_intelligent_response_optimization(self, claude_adapter):
        """测试智能响应优化"""
        response = "跨CLI调用结果"
        event = HookEvent(
            hook_type=HookType.RESPONSE_GENERATED,
            metadata={"response": response}
        )

        result = await claude_adapter._intelligent_response_optimization(event)

        assert result is not None
        assert "Claude智能优化" in result

    @pytest.mark.asyncio
    async def test_intelligent_result_verification(self, claude_adapter):
        """测试智能结果验证"""
        result = "通过Claude调用gemini执行任务"
        event = HookEvent(
            hook_type=HookType.TOOL_USE_POST,
            metadata={"result": result}
        )

        result = await claude_adapter._intelligent_result_verification(event)

        assert result is not None
        assert "Claude智能验证" in result

    def test_optimize_response_with_claude(self, claude_adapter):
        """测试使用Claude智能优化响应"""
        # 测试需要优化的响应
        response1 = "短响应"
        response2 = "## 格式化响应\n**粗体文本**"
        response3 = "完美的响应，包含标题和格式\n\n## 结构良好\n**重点突出**"

        optimized1 = claude_adapter._optimize_response_with_claude(response1)
        optimized2 = claude_adapter._optimize_response_with_claude(response2)
        optimized3 = claude_adapter._optimize_response_with_claude(response3)

        assert "过简短" in optimized1
        assert "无需优化" in optimized3
        assert "优化" in optimized2

    def test_verify_result_with_claude(self, claude_adapter):
        """测试使用Claude智能验证结果"""
        # 测试不同质量的结果
        poor_result = "短"
        average_result = "这是一个中等长度的结果，包含一些信息"
        good_result = "✅ ## 成功完成\n这是一个结构良好的结果，包含成功指示器和格式"
        error_result = "❌ 错误：操作失败"

        verification1 = claude_adapter._verify_result_with_claude(poor_result)
        verification2 = claude_adapter._verify_result_with_claude(average_result)
        verification3 = claude_adapter._verify_result_with_claude(good_result)
        verification4 = claude_adapter._verify_result_with_claude(error_result)

        assert "质量待改进" in verification1
        assert "质量良好" in verification2
        assert "质量优秀" in verification3
        assert "质量问题" in verification4

    @pytest.mark.asyncio
    async def test_intelligent_error_analysis(self, claude_adapter):
        """测试智能错误分析"""
        error_info = "Network connection timeout"
        event = HookEvent(
            hook_type=HookType.ERROR_HANDLING,
            metadata={"error": error_info}
        )

        result = await claude_adapter._intelligent_error_analysis(event)

        assert result is not None
        assert "Claude错误分析" in result
        assert "恢复建议" in result

    def test_analyze_error_with_claude(self, claude_adapter):
        """测试使用Claude智能分析错误"""
        # 测试不同类型的错误
        network_error = "Network connection failed"
        permission_error = "Permission denied: access not authorized"
        config_error = "Configuration file not found"
        unknown_error = "Unknown error occurred"

        analysis1 = claude_adapter._analyze_error_with_claude(network_error)
        analysis2 = claude_adapter._analyze_error_with_claude(permission_error)
        analysis3 = claude_adapter._analyze_error_with_claude(config_error)
        analysis4 = claude_adapter._analyze_error_with_claude(unknown_error)

        assert "网络" in analysis1
        assert "权限" in analysis2
        assert "配置" in analysis3
        assert "未知" in analysis4

    def test_suggest_recovery_with_claude(self, claude_adapter):
        """测试使用Claude智能建议恢复方案"""
        # 测试不同类型的恢复建议
        network_error = "Network timeout"
        permission_error = "Access denied"
        not_found_error = "Tool not found"
        generic_error = "Some error"

        suggestion1 = claude_adapter._suggest_recovery_with_claude(network_error)
        suggestion2 = claude_adapter._suggest_recovery_with_claude(permission_error)
        suggestion3 = claude_adapter._suggest_recovery_with_claude(not_found_error)
        suggestion4 = claude_adapter._suggest_recovery_with_claude(generic_error)

        assert "网络" in suggestion1
        assert "权限" in suggestion2
        assert "安装" in suggestion3
        assert "其他" in suggestion4

    @pytest.mark.asyncio
    async def test_setup_claude_session(self, claude_adapter):
        """测试设置Claude会话"""
        session_id = "claude_test_session"
        event = HookEvent(hook_type=HookType.SESSION_START, session_id=session_id)

        result = await claude_adapter._setup_claude_session(event)

        assert session_id in claude_adapter.session_hooks
        assert f"Claude会话 {session_id}" in result

    @pytest.mark.asyncio
    async def test_register_claude_skill(self, claude_adapter):
        """测试注册Claude技能"""
        skill_info = {"name": "test_claude_skill", "type": "external"}
        event = HookEvent(
            hook_type=HookType.SKILL_REGISTER,
            metadata={"skill_info": skill_info}
        )

        result = await claude_adapter._register_claude_skill(event)

        assert result == f"Claude技能 test_claude_skill 注册完成"

    def test_is_cross_cli_result(self, claude_adapter):
        """测试判断是否为跨CLI结果"""
        cross_cli_result = "通过Claude调用gemini完成任务"
        normal_result = "普通任务执行结果"

        assert claude_adapter._is_cross_cli_result(cross_cli_result) is True
        assert claude_adapter._is_cross_cli_result(normal_result) is False

    @pytest.mark.asyncio
    async def test_register_external_claude_skill_success(self, claude_adapter):
        """测试注册外部Claude技能成功"""
        skill_config = {
            "description": "外部Claude测试技能",
            "capabilities": ["Claude测试", "智能"],
            "priority": 70,
            "hooks": ["user_prompt_submit"],
            "category": "external",
            "author": "External Developer"
        }

        result = await claude_adapter.register_external_skill("external_claude_skill", skill_config)

        assert result is True
        assert "external_claude_skill" in claude_adapter.skills

    @pytest.mark.asyncio
    async def test_register_external_claude_skill_failure(self, claude_adapter):
        """测试注册外部Claude技能失败"""
        # 模拟异常
        with patch('src.adapters.claude.skills_hook_adapter.ClaudeSkill') as mock_skill_class:
            mock_skill_class.side_effect = Exception("创建Claude技能失败")

            skill_config = {"description": "失败Claude技能"}
            result = await claude_adapter.register_external_skill("fail_claude_skill", skill_config)

            assert result is False

    def test_get_claude_system_status(self, claude_adapter):
        """测试获取Claude系统状态"""
        status = claude_adapter.get_system_status()

        assert status["adapter_type"] == "Claude Skills-Hook"
        assert "active_skills" in status
        assert "total_skills" in status
        assert "skill_stats" in status
        assert "hook_counts" in status
        assert status["hooks_enabled"] is True
        assert status["claude_features"] == ["智能分析", "语义检测", "上下文理解", "学习优化"]
        assert len(status["active_skills"]) == 4  # 四个内置技能

    @pytest.mark.asyncio
    async def test_claude_cleanup(self, claude_adapter):
        """测试Claude资源清理"""
        # 确保技能是激活的
        for skill in claude_adapter.skills.values():
            skill.active = True

        # 添加会话钩子
        claude_adapter.session_hooks["test_session"] = {"data": "test"}
        claude_adapter.processed_requests.append({"type": "test"})

        await claude_adapter.cleanup()

        # 验证技能已停用
        for skill in claude_adapter.skills.values():
            assert skill.active is False

        # 验证会话钩子已清理
        assert len(claude_adapter.session_hooks) == 0
        assert len(claude_adapter.processed_requests) == 0


class TestClaudeIntegrationScenarios:
    """Claude集成测试场景"""

    @pytest.fixture
    def claude_adapter(self):
        """创建完整的Claude适配器实例"""
        mock_config_manager = Mock(spec=ConfigManager)
        with patch('pathlib.Path.exists', return_value=False):
            adapter = ClaudeSkillsHookAdapter(mock_config_manager)
        return adapter

    @pytest.mark.asyncio
    async def test_full_claude_cross_cli_workflow(self, claude_adapter):
        """测试完整的Claude跨CLI工作流程"""
        # 1. 消息处理检测跨CLI意图
        claude_adapter.parser.parse_intent = Mock(return_value=Mock(
            is_cross_cli=True,
            target_cli="gemini",
            task="Claude跨CLI分析任务"
        ))

        claude_adapter._execute_cross_cli_via_skills = AsyncMock(return_value="🧠 Claude智能分析完成")
        claude_adapter._execute_cross_cli_via_hooks = AsyncMock(return_value="Claude钩子处理完成")

        # 2. 处理Claude用户提示
        event = HookEvent(
            hook_type=HookType.USER_PROMPT_SUBMIT,
            prompt="请用gemini帮我进行Claude智能分析"
        )

        result = await claude_adapter._handle_claude_user_prompt_submit(event)

        assert result is not None and "Claude" in result

    @pytest.mark.asyncio
    async def test_claude_error_recovery_workflow(self, claude_adapter):
        """测试Claude错误恢复工作流程"""
        # 1. 模拟Claude跨CLI调用失败
        error_event = HookEvent(
            hook_type=HookType.ERROR_HANDLING,
            metadata={"error": "Claude网络连接超时", "original_command": "用gemini分析Claude数据"}
        )

        # 2. 处理错误
        claude_adapter._suggest_recovery_with_claude = Mock(return_value="检查Claude网络连接，稍后重试")

        results = await claude_adapter.trigger_hooks(HookType.ERROR_HANDLING, error_event)

        assert any("Claude错误分析" in str(r) for r in results if r)

    @pytest.mark.asyncio
    async def test_claude_learning_workflow(self, claude_adapter):
        """测试Claude学习工作流程"""
        session_id = "claude_learning_session"

        # 1. 会话开始
        start_event = HookEvent(hook_type=HookType.SESSION_START, session_id=session_id)
        start_results = await claude_adapter.trigger_hooks(HookType.SESSION_START, start_event)

        assert session_id in claude_adapter.session_hooks

        # 2. 会话中处理
        mid_event = HookEvent(
            hook_type=HookType.TOOL_USE_POST,
            prompt="Claude智能处理",
            session_id=session_id,
            metadata={"result": "✅ Claude智能处理成功"}
        )
        await claude_adapter.trigger_hooks(HookType.TOOL_USE_POST, mid_event)

        # 3. 会话结束和学习总结
        end_event = HookEvent(hook_type=HookType.SESSION_END, session_id=session_id)
        end_results = await claude_adapter.trigger_hooks(HookType.SESSION_END, end_event)

        assert any("Claude学习总结" in str(r) for r in end_results if r)

    @pytest.mark.asyncio
    async def test_claude_intelligent_result_optimization_workflow(self, claude_adapter):
        """测试Claude智能结果优化工作流程"""
        # 1. 模拟跨CLI调用结果
        response_event = HookEvent(
            hook_type=HookType.RESPONSE_GENERATED,
            metadata={"response": "通过Claude调用gemini完成数据分析任务"}
        )

        # 2. 智能优化和验证
        optimization_results = await claude_adapter.trigger_hooks(HookType.RESPONSE_GENERATED, response_event)

        assert any("Claude智能优化" in str(r) for r in optimization_results if r)

        # 3. 结果验证
        verification_event = HookEvent(
            hook_type=HookType.TOOL_USE_POST,
            metadata={"result": "✅ 跨CLI调用成功完成"}
        )

        verification_results = await claude_adapter.trigger_hooks(HookType.TOOL_USE_POST, verification_event)

        assert any("Claude智能验证" in str(r) for r in verification_results if r)


if __name__ == "__main__":
    # 运行测试
    pytest.main([__file__, "-v"])