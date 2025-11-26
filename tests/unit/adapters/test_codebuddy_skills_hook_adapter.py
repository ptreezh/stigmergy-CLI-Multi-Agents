"""
CodeBuddy Skills-Hook Adapter 单元测试
测试基于技能和钩子的冗余跨CLI协同功能
"""

import pytest
import asyncio
import json
from unittest.mock import Mock, AsyncMock, patch
from pathlib import Path

# 导入被测试的模块
import sys
sys.path.append(str(Path(__file__).parent.parent.parent.parent))

from src.adapters.codebuddy.skills_hook_adapter import (
    CodeBuddySkillsHookAdapter,
    HookType,
    HookEvent,
    Skill,
    SkillConfig
)
from src.core.config_manager import ConfigManager


class TestSkillConfig:
    """测试SkillConfig类"""

    def test_skill_config_creation(self):
        """测试技能配置创建"""
        config = SkillConfig(
            name="test_skill",
            description="测试技能",
            capabilities=["测试", "验证"],
            priority=80,
            hooks=[HookType.PRE_COMMAND, HookType.POST_COMMAND]
        )

        assert config.name == "test_skill"
        assert config.description == "测试技能"
        assert config.capabilities == ["测试", "验证"]
        assert config.priority == 80
        assert config.hooks == [HookType.PRE_COMMAND, HookType.POST_COMMAND]

    def test_skill_config_defaults(self):
        """测试技能配置默认值"""
        config = SkillConfig(name="default_skill")

        assert config.name == "default_skill"
        assert config.description == ""
        assert config.capabilities == []
        assert config.priority == 50
        assert config.protocols == ["chinese", "english"]
        assert config.hooks == []
        assert config.enabled is True


class TestHookEvent:
    """测试HookEvent类"""

    def test_hook_event_creation(self):
        """测试钩子事件创建"""
        event = HookEvent(
            hook_type=HookType.PRE_COMMAND,
            command="test command",
            session_id="test_session",
            context={"key": "value"}
        )

        assert event.hook_type == HookType.PRE_COMMAND
        assert event.command == "test command"
        assert event.session_id == "test_session"
        assert event.context == {"key": "value"}
        assert event.timestamp is not None

    def test_hook_event_defaults(self):
        """测试钩子事件默认值"""
        event = HookEvent(hook_type=HookType.ERROR)

        assert event.hook_type == HookType.ERROR
        assert event.command == ""
        assert event.session_id == ""
        assert event.context == {}
        assert event.timestamp is not None


class TestSkill:
    """测试Skill类"""

    @pytest.fixture
    def skill_config(self):
        """创建测试技能配置"""
        return SkillConfig(
            name="test_skill",
            description="测试技能",
            capabilities=["测试"],
            hooks=[HookType.PRE_COMMAND]
        )

    @pytest.fixture
    def test_skill(self, skill_config):
        """创建测试技能实例"""
        return Skill(skill_config)

    def test_skill_creation(self, test_skill, skill_config):
        """测试技能创建"""
        assert test_skill.config == skill_config
        assert test_skill.registered_hooks == {}
        assert test_skill.active is False

    @pytest.mark.asyncio
    async def test_hook_registration(self, test_skill):
        """测试钩子注册"""
        async def test_handler(event):
            return "handled"

        test_skill.register_hook(HookType.PRE_COMMAND, test_handler)

        assert HookType.PRE_COMMAND in test_skill.registered_hooks
        assert test_skill.registered_hooks[HookType.PRE_COMMAND] == test_handler

    @pytest.mark.asyncio
    async def test_hook_trigger_success(self, test_skill):
        """测试钩子触发成功"""
        async def test_handler(event):
            return "handled"

        test_skill.register_hook(HookType.PRE_COMMAND, test_handler)

        event = HookEvent(hook_type=HookType.PRE_COMMAND)
        result = await test_skill.trigger_hook(event)

        assert result == "handled"

    @pytest.mark.asyncio
    async def test_hook_trigger_no_handler(self, test_skill):
        """测试钩子触发无处理器"""
        event = HookEvent(hook_type=HookType.PRE_COMMAND)
        result = await test_skill.trigger_hook(event)

        assert result is None

    @pytest.mark.asyncio
    async def test_hook_trigger_handler_error(self, test_skill):
        """测试钩子处理器错误"""
        async def error_handler(event):
            raise ValueError("测试错误")

        test_skill.register_hook(HookType.PRE_COMMAND, error_handler)

        event = HookEvent(hook_type=HookType.PRE_COMMAND)
        result = await test_skill.trigger_hook(event)

        assert result is None

    @pytest.mark.asyncio
    async def test_skill_activate_deactivate(self, test_skill):
        """测试技能激活和停用"""
        assert test_skill.active is False

        await test_skill.activate()
        assert test_skill.active is True

        await test_skill.deactivate()
        assert test_skill.active is False


class TestCodeBuddySkillsHookAdapter:
    """测试CodeBuddySkillsHookAdapter类"""

    @pytest.fixture
    def mock_config_manager(self):
        """模拟配置管理器"""
        config_manager = Mock(spec=ConfigManager)
        return config_manager

    @pytest.fixture
    def adapter(self, mock_config_manager):
        """创建适配器实例"""
        # 模拟配置文件不存在
        with patch('pathlib.Path.exists', return_value=False):
            adapter = CodeBuddySkillsHookAdapter(mock_config_manager)
        return adapter

    def test_adapter_initialization(self, adapter):
        """测试适配器初始化"""
        assert adapter.cli_name == "codebuddy"
        assert adapter.parser is not None
        assert len(adapter.skills) == 3  # 三个内置技能
        assert adapter.hooks_enabled is True
        assert adapter.hook_fallback_enabled is True
        assert len(adapter.hook_registry) > 0

    def test_builtin_skills_creation(self, adapter):
        """测试内置技能创建"""
        expected_skills = [
            "cross_cli_coordinator",
            "error_recovery_expert",
            "session_monitor"
        ]

        for skill_name in expected_skills:
            assert skill_name in adapter.skills
            assert adapter.skills[skill_name].active is True

    def test_cross_cli_skills_registration(self, adapter):
        """测试跨CLI技能注册"""
        cross_cli_skills = adapter.cross_cli_skills
        assert "cross_cli_coordinator" in cross_cli_skills
        assert len(cross_cli_skills) == 1

    @pytest.mark.asyncio
    async def test_trigger_hooks_no_hooks(self, adapter):
        """测试触发钩子（无钩子启用）"""
        adapter.hooks_enabled = False

        event = HookEvent(hook_type=HookType.PRE_COMMAND)
        results = await adapter.trigger_hooks(HookType.PRE_COMMAND, event)

        assert results == []

    @pytest.mark.asyncio
    async def test_trigger_hooks_success(self, adapter):
        """测试触发钩子成功"""
        event = HookEvent(hook_type=HookType.PRE_COMMAND, command="test")

        results = await adapter.trigger_hooks(HookType.PRE_COMMAND, event)

        assert isinstance(results, list)

    @pytest.mark.asyncio
    async def test_handle_cross_cli_request_success(self, adapter):
        """测试处理跨CLI请求成功"""
        # 模拟意图解析
        mock_intent = Mock()
        mock_intent.is_cross_cli = True
        mock_intent.target_cli = "claude"
        mock_intent.task = "测试任务"

        adapter.parser.parse_intent = Mock(return_value=mock_intent)

        # 模拟跨CLI执行
        adapter._execute_cross_cli_via_skills = AsyncMock(return_value="技能结果")
        adapter._execute_cross_cli_via_hooks = AsyncMock(return_value="钩子结果")

        event = HookEvent(
            hook_type=HookType.CROSS_CLI_REQUEST,
            command="用claude帮我测试"
        )

        result = await adapter._handle_cross_cli_request(event)

        assert result is not None
        adapter.parser.parse_intent.assert_called_once()

    @pytest.mark.asyncio
    async def test_handle_cross_cli_request_no_intent(self, adapter):
        """测试处理跨CLI请求（无跨CLI意图）"""
        mock_intent = Mock()
        mock_intent.is_cross_cli = False

        adapter.parser.parse_intent = Mock(return_value=mock_intent)

        event = HookEvent(
            hook_type=HookType.CROSS_CLI_REQUEST,
            command="普通命令"
        )

        result = await adapter._handle_cross_cli_request(event)

        assert result is None

    @pytest.mark.asyncio
    async def test_redundant_cross_cli_detection(self, adapter):
        """测试冗余跨CLI检测"""
        # 模拟检测方法
        adapter._detect_via_patterns = Mock(return_value=None)
        adapter._detect_via_keywords = Mock(return_value={
            "command": "用claude测试",
            "target_cli": "claude",
            "task": "测试",
            "method": "keyword_detection"
        })
        adapter._detect_via_structure = Mock(return_value=None)

        # 模拟钩子触发
        adapter.trigger_hooks = AsyncMock(return_value=["检测结果"])

        event = HookEvent(
            hook_type=HookType.PRE_COMMAND,
            command="用claude帮我测试"
        )

        result = await adapter._redundant_cross_cli_detection(event)

        assert result == "检测结果"
        adapter._detect_via_keywords.assert_called_once()

    def test_detect_via_patterns(self, adapter):
        """测试通过模式检测"""
        command = "用claude帮我编写代码"
        result = adapter._detect_via_patterns(command)

        assert result is not None
        assert result["target_cli"] == "claude"
        assert result["method"] == "pattern_detection"

    def test_detect_via_patterns_no_match(self, adapter):
        """测试通过模式检测（无匹配）"""
        command = "普通命令，没有跨CLI意图"
        result = adapter._detect_via_patterns(command)

        assert result is None

    def test_detect_via_keywords(self, adapter):
        """测试通过关键词检测"""
        command = "请克劳德帮我解决问题"
        result = adapter._detect_via_keywords(command)

        assert result is not None
        assert result["target_cli"] == "claude"
        assert result["method"] == "keyword_detection"

    def test_detect_via_structure(self, adapter):
        """测试通过结构检测"""
        command = "帮我 gemini 分析数据"
        result = adapter._detect_via_structure(command)

        assert result is not None
        assert result["target_cli"] == "gemini"
        assert result["method"] == "structure_detection"

    def test_select_best_result(self, adapter):
        """测试选择最佳结果"""
        result1 = "✅ 技能处理成功"
        result2 = "钩子处理完成"

        best = adapter._select_best_result(result1, result2)

        assert best == result1  # 选择包含成功标记的结果

    def test_select_best_result_none(self, adapter):
        """测试选择最佳结果（空结果）"""
        result1 = None
        result2 = None

        best = adapter._select_best_result(result1, result2)

        assert best is None

    def test_select_best_result_single(self, adapter):
        """测试选择最佳结果（单个结果）"""
        result1 = "技能处理结果"
        result2 = None

        best = adapter._select_best_result(result1, result2)

        assert best == result1

    @pytest.mark.asyncio
    async def test_handle_cross_cli_error(self, adapter):
        """测试处理跨CLI错误"""
        adapter._try_fallback_solution = AsyncMock(return_value="回退方案执行")

        event = HookEvent(
            hook_type=HookType.ERROR,
            context={"cross_cli_failed": True}
        )

        result = await adapter._handle_cross_cli_error(event)

        assert result == "回退方案执行"

    @pytest.mark.asyncio
    async def test_try_fallback_solution(self, adapter):
        """测试回退方案"""
        result = await adapter._try_fallback_solution(HookEvent(hook_type=HookType.ERROR))

        assert result == "⚠️ 跨CLI调用失败，已启用回退方案处理"

    @pytest.mark.asyncio
    async def test_verify_cross_cli_result_success(self, adapter):
        """测试验证跨CLI结果成功"""
        result_text = "✅ 通过claude调用成功完成任务"
        event = HookEvent(
            hook_type=HookType.POST_COMMAND,
            context={"result": result_text}
        )

        result = await adapter._verify_cross_cli_result(event)

        assert result == "✅ 跨CLI结果验证通过"

    @pytest.mark.asyncio
    async def test_verify_cross_cli_result_no_cross_cli(self, adapter):
        """测试验证跨CLI结果（非跨CLI结果）"""
        result_text = "普通命令执行完成"
        event = HookEvent(
            hook_type=HookType.POST_COMMAND,
            context={"result": result_text}
        )

        result = await adapter._verify_cross_cli_result(event)

        assert result is None

    @pytest.mark.asyncio
    async def test_setup_session_hooks(self, adapter):
        """测试设置会话钩子"""
        session_id = "test_session"
        event = HookEvent(hook_type=HookType.SESSION_START, session_id=session_id)

        result = await adapter._setup_session_hooks(event)

        assert session_id in adapter.session_hooks
        assert result == f"会话 {session_id} 钩子设置完成"

    @pytest.mark.asyncio
    async def test_cleanup_session_hooks(self, adapter):
        """测试清理会话钩子"""
        session_id = "test_session"
        adapter.session_hooks[session_id] = {
            "start_time": 1234567890,
            "hooks_triggered": 5,
            "cross_cli_calls": 2
        }

        event = HookEvent(hook_type=HookType.SESSION_END, session_id=session_id)

        result = await adapter._cleanup_session_hooks(event)

        assert session_id not in adapter.session_hooks
        assert "触发钩子 5 次" in result

    @pytest.mark.asyncio
    async def test_register_skill_hooks(self, adapter):
        """测试注册技能钩子"""
        skill_info = {"name": "test_skill", "type": "external"}
        event = HookEvent(
            hook_type=HookType.SKILL_REGISTER,
            context={"skill_info": skill_info}
        )

        result = await adapter._register_skill_hooks(event)

        assert result == "技能 test_skill 钩子注册完成"

    def test_should_handle_cross_cli(self, adapter):
        """测试判断是否应该处理跨CLI调用"""
        command1 = "用claude帮我测试"
        command2 = "普通命令"

        assert adapter._should_handle_cross_cli(command1) is True
        assert adapter._should_handle_cross_cli(command2) is False

    @pytest.mark.asyncio
    async def test_handle_message_cross_cli(self, adapter):
        """测试处理消息（跨CLI）"""
        # 模拟前置钩子处理
        adapter.trigger_hooks = AsyncMock(return_value=["跨CLI处理结果"])

        result = await adapter.handle_message("用claude帮我测试")

        assert result == "跨CLI处理结果"

    @pytest.mark.asyncio
    async def test_handle_message_normal(self, adapter):
        """测试处理消息（普通消息）"""
        # 模拟前置钩子无处理
        adapter.trigger_hooks = AsyncMock(return_value=[])

        result = await adapter.handle_message("普通命令")

        assert result is None

    @pytest.mark.asyncio
    async def test_process_response_with_hooks(self, adapter):
        """测试处理响应（有钩子处理）"""
        adapter.trigger_hooks = AsyncMock(return_value=["钩子处理结果"])

        response = "原始响应"
        result = await adapter.process_response(response)

        assert result == "原始响应\n\n钩子处理结果"

    @pytest.mark.asyncio
    async def test_process_response_no_hooks(self, adapter):
        """测试处理响应（无钩子处理）"""
        adapter.trigger_hooks = AsyncMock(return_value=[])

        response = "原始响应"
        result = await adapter.process_response(response)

        assert result == response

    @pytest.mark.asyncio
    async def test_handle_error_with_hooks(self, adapter):
        """测试处理错误（有钩子处理）"""
        adapter.trigger_hooks = AsyncMock(return_value=["错误处理结果"])

        error = ValueError("测试错误")
        result = await adapter.handle_error(error)

        assert result == "错误处理结果"

    @pytest.mark.asyncio
    async def test_handle_error_no_hooks(self, adapter):
        """测试处理错误（无钩子处理）"""
        adapter.trigger_hooks = AsyncMock(return_value=[])

        error = ValueError("测试错误")
        result = await adapter.handle_error(error)

        assert result is None

    @pytest.mark.asyncio
    async def test_register_external_skill_success(self, adapter):
        """测试注册外部技能成功"""
        skill_config = {
            "description": "外部测试技能",
            "capabilities": ["测试"],
            "priority": 70,
            "hooks": ["pre_command"]
        }

        result = await adapter.register_external_skill("external_skill", skill_config)

        assert result is True
        assert "external_skill" in adapter.skills

    @pytest.mark.asyncio
    async def test_register_external_skill_failure(self, adapter):
        """测试注册外部技能失败"""
        # 模拟异常
        with patch('src.adapters.codebuddy.skills_hook_adapter.Skill') as mock_skill_class:
            mock_skill_class.side_effect = Exception("创建技能失败")

            skill_config = {"description": "失败技能"}
            result = await adapter.register_external_skill("fail_skill", skill_config)

            assert result is False

    def test_get_system_status(self, adapter):
        """测试获取系统状态"""
        status = adapter.get_system_status()

        assert status["adapter_type"] == "CodeBuddy Skills-Hook"
        assert "active_skills" in status
        assert "total_skills" in status
        assert "hook_counts" in status
        assert status["hooks_enabled"] is True
        assert status["fallback_enabled"] is True
        assert len(status["cross_cli_skills"]) > 0

    @pytest.mark.asyncio
    async def test_cleanup(self, adapter):
        """测试清理资源"""
        # 确保技能是激活的
        for skill in adapter.skills.values():
            skill.active = True

        # 添加会话钩子
        adapter.session_hooks["test_session"] = {"data": "test"}

        await adapter.cleanup()

        # 验证技能已停用
        for skill in adapter.skills.values():
            assert skill.active is False

        # 验证会话钩子已清理
        assert len(adapter.session_hooks) == 0


class TestIntegrationScenarios:
    """集成测试场景"""

    @pytest.fixture
    def adapter(self):
        """创建完整的适配器实例"""
        mock_config_manager = Mock(spec=ConfigManager)
        with patch('pathlib.Path.exists', return_value=False):
            adapter = CodeBuddySkillsHookAdapter(mock_config_manager)
        return adapter

    @pytest.mark.asyncio
    async def test_full_cross_cli_workflow(self, adapter):
        """测试完整的跨CLI工作流程"""
        # 1. 消息处理检测跨CLI意图
        adapter.parser.parse_intent = Mock(return_value=Mock(
            is_cross_cli=True,
            target_cli="claude",
            task="编写代码"
        ))

        adapter._execute_cross_cli_via_skills = AsyncMock(return_value="✅ 通过技能调用Claude完成")
        adapter._execute_cross_cli_via_hooks = AsyncMock(return_value="✅ 通过钩子调用Claude完成")

        # 2. 处理消息
        result = await adapter.handle_message("用claude帮我编写代码")

        assert result is not None and "✅" in result

    @pytest.mark.asyncio
    async def test_error_recovery_workflow(self, adapter):
        """测试错误恢复工作流程"""
        # 1. 模拟跨CLI调用失败
        error_event = HookEvent(
            hook_type=HookType.ERROR,
            context={"cross_cli_failed": True, "original_command": "用gemini分析"}
        )

        # 2. 处理错误
        adapter._try_fallback_solution = AsyncMock(return_value="⚠️ 已启用本地回退方案")

        result = await adapter.trigger_hooks(HookType.ERROR, error_event)

        assert any("回退" in str(r) for r in result if r)

    @pytest.mark.asyncio
    async def test_session_lifecycle_workflow(self, adapter):
        """测试会话生命周期工作流程"""
        session_id = "test_session_123"

        # 1. 会话开始
        start_event = HookEvent(hook_type=HookType.SESSION_START, session_id=session_id)
        start_result = await adapter.trigger_hooks(HookType.SESSION_START, start_event)

        assert session_id in adapter.session_hooks

        # 2. 会话中处理
        mid_event = HookEvent(
            hook_type=HookType.PRE_COMMAND,
            command="测试命令",
            session_id=session_id
        )
        await adapter.trigger_hooks(HookType.PRE_COMMAND, mid_event)

        # 3. 会话结束
        end_event = HookEvent(hook_type=HookType.SESSION_END, session_id=session_id)
        end_result = await adapter.trigger_hooks(HookType.SESSION_END, end_event)

        assert session_id not in adapter.session_hooks


if __name__ == "__main__":
    # 运行测试
    pytest.main([__file__, "-v"])