"""
iFlow CLI官方Hook适配器单元测试

基于iFlow CLI官方文档的9种Hook类型TDD测试
严格遵循官方Hook规范和matcher机制
"""

import pytest
import asyncio
import json
import tempfile
import os
from pathlib import Path
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from datetime import datetime
from typing import Dict, Any

from src.adapters.iflow.official_hook_adapter import IFlowOfficialHookAdapter, IFlowHookEvent


class TestIFlowOfficialHookAdapterTDD:
    """iFlow CLI官方Hook适配器TDD测试 - 基于官方9种Hook类型"""

    @pytest.fixture
    def adapter(self):
        """创建适配器实例"""
        return IFlowOfficialHookAdapter("iflow")

    @pytest.fixture
    def mock_event_data(self):
        """创建模拟Hook事件数据"""
        return {
            "session_id": "test-session-001",
            "timestamp": datetime.now().isoformat(),
            "user_id": "test_user"
        }

    @pytest.fixture
    def temp_iflow_dir(self):
        """创建临时iFlow配置目录"""
        with tempfile.TemporaryDirectory() as temp_dir:
            yield temp_dir

    # ==================== 1. PreToolUse Hook测试 ====================

    @pytest.mark.unit
    async def test_pre_tool_use_hook_with_cross_cli(self, adapter, mock_event_data):
        """测试PreToolUse Hook检测跨CLI调用"""
        # 模拟工具使用数据
        tool_data = {
            **mock_event_data,
            "tool_name": "Edit",
            "args": ["请用claude帮我修改这个文件"]
        }

        # 模拟解析器
        mock_parser = Mock()
        mock_intent = Mock()
        mock_intent.is_cross_cli = True
        mock_intent.target_cli = "claude"
        mock_intent.task = "修改这个文件"
        mock_parser.parse_intent.return_value = mock_intent
        adapter.parser = mock_parser

        # 模拟目标适配器
        with patch('src.adapters.iflow.official_hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
            mock_target_adapter = AsyncMock()
            mock_target_adapter.is_available.return_value = True
            mock_target_adapter.execute_task.return_value = "Claude修改结果: 文件已更新"
            mock_get_adapter.return_value = mock_target_adapter

            # 执行PreToolUse Hook
            result = await adapter.handle_pre_tool_use(tool_data)

        assert result is not None, "PreToolUse Hook应该返回跨CLI结果"
        assert "Claude" in result, "结果应该包含目标CLI"
        assert "跨CLI调用结果" in result, "结果应该是跨CLI格式"
        assert adapter.hook_executions['PreToolUse'] == 1, "应该记录Hook执行"

    @pytest.mark.unit
    async def test_pre_tool_use_hook_normal_tool(self, adapter, mock_event_data):
        """测试PreToolUse Hook处理普通工具"""
        tool_data = {
            **mock_event_data,
            "tool_name": "Edit",
            "args": ["普通文件编辑"]
        }

        # 模拟解析器 - 非跨CLI调用
        mock_parser = Mock()
        mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
        adapter.parser = mock_parser

        # 执行PreToolUse Hook
        result = await adapter.handle_pre_tool_use(tool_data)

        assert result is None, "普通工具调用应该返回None继续执行"
        assert adapter.hook_executions['PreToolUse'] == 1, "应该记录Hook执行"

    @pytest.mark.unit
    async def test_pre_tool_use_tool_matcher_patterns(self, adapter, mock_event_data):
        """测试PreToolUse工具匹配模式"""
        test_cases = [
            ("Edit", "文件编辑工具"),
            ("Write", "文件写入工具"),
            ("Replace", "文件替换工具"),
            ("RunShell", "Shell执行工具"),
            ("Search", "搜索工具")
        ]

        for tool_name, description in test_cases:
            tool_data = {
                **mock_event_data,
                "tool_name": tool_name,
                "args": [f"{description}测试"]
            }

            result = await adapter.handle_pre_tool_use(tool_data)
            assert result is None, f"{tool_name}工具应该正常处理"

    # ==================== 2. PostToolUse Hook测试 ====================

    @pytest.mark.unit
    async def test_post_tool_use_hook_result_processing(self, adapter, mock_event_data):
        """测试PostToolUse Hook结果处理"""
        tool_data = {
            **mock_event_data,
            "tool_name": "Edit",
            "result": "文件编辑成功",
            "execution_time": 1.5
        }

        # 执行PostToolUse Hook
        result = await adapter.handle_post_tool_use(tool_data)

        assert result is None, "PostToolUse Hook应该返回None"
        assert adapter.hook_executions['PostToolUse'] == 1, "应该记录Hook执行"

        # 验证事件记录
        events = [e for e in adapter.processed_events if e.hook_type == 'PostToolUse']
        assert len(events) == 1, "应该记录PostToolUse事件"
        assert events[0].tool_name == "Edit", "事件应该包含工具名称"

    # ==================== 3. SetUpEnvironment Hook测试 ====================

    @pytest.mark.unit
    async def test_set_up_environment_hook_initialization(self, adapter, mock_event_data):
        """测试SetUpEnvironment Hook环境初始化"""
        env_data = {
            **mock_event_data,
            "environment_type": "development",
            "working_directory": "/tmp/test"
        }

        # 执行SetUpEnvironment Hook
        result = await adapter.handle_set_up_environment(env_data)

        assert result is None, "SetUpEnvironment Hook应该返回None"
        assert adapter.hook_executions['SetUpEnvironment'] == 1, "应该记录Hook执行"
        assert mock_event_data['session_id'] in adapter.active_sessions, "应该创建活动会话"

        # 验证会话数据
        session = adapter.active_sessions[mock_event_data['session_id']]
        assert session['environment'] == 'ready', "环境应该设置为ready"

    # ==================== 4. Stop Hook测试 ====================

    @pytest.mark.unit
    async def test_stop_hook_session_cleanup(self, adapter, mock_event_data):
        """测试Stop Hook会话清理"""
        # 先创建活动会话
        adapter.active_sessions[mock_event_data['session_id']] = {
            'start_time': datetime.now(),
            'cross_cli_calls': 5,
            'environment': 'active'
        }

        # 执行Stop Hook
        result = await adapter.handle_stop(mock_event_data)

        assert result is None, "Stop Hook应该返回None"
        assert adapter.hook_executions['Stop'] == 1, "应该记录Hook执行"
        assert mock_event_data['session_id'] not in adapter.active_sessions, "应该清理会话"

    # ==================== 5. SubagentStop Hook测试 ====================

    @pytest.mark.unit
    async def test_subagent_stop_hook_cleanup(self, adapter, mock_event_data):
        """测试SubagentStop Hook子代理清理"""
        subagent_data = {
            **mock_event_data,
            "subagent_id": "subagent-001",
            "parent_session_id": "parent-session-001",
            "task_result": "子任务完成"
        }

        # 执行SubagentStop Hook
        result = await adapter.handle_subagent_stop(subagent_data)

        assert result is None, "SubagentStop Hook应该返回None"
        assert adapter.hook_executions['SubagentStop'] == 1, "应该记录Hook执行"

    # ==================== 6. SessionStart Hook测试 ====================

    @pytest.mark.unit
    async def test_session_start_hook_startup(self, adapter, mock_event_data):
        """测试SessionStart Hook新启动会话"""
        startup_data = {
            **mock_event_data,
            "session_type": "startup",
            "resume_data": None
        }

        # 执行SessionStart Hook
        result = await adapter.handle_session_start(startup_data)

        assert result is None, "SessionStart Hook应该返回None"
        assert adapter.hook_executions['SessionStart'] == 1, "应该记录Hook执行"

        # 验证会话创建
        session = adapter.active_sessions[mock_event_data['session_id']]
        assert session['session_type'] == 'startup', "会话类型应该是startup"
        assert session['environment'] == 'initialized', "环境应该初始化"

    @pytest.mark.unit
    async def test_session_start_hook_resume(self, adapter, mock_event_data):
        """测试SessionStart Hook恢复会话"""
        resume_data = {
            **mock_event_data,
            "session_type": "resume",
            "previous_state": {"last_command": "edit"}
        }

        # 执行SessionStart Hook
        result = await adapter.handle_session_start(resume_data)

        assert result is None, "SessionStart Hook应该返回None"

        # 验证恢复会话处理
        session = adapter.active_sessions[mock_event_data['session_id']]
        assert session['session_type'] == 'resumed', "会话类型应该是resumed"

    @pytest.mark.unit
    async def test_session_start_hook_clear_compress(self, adapter, mock_event_data):
        """测试SessionStart Hook清理和压缩会话"""
        test_types = ["clear", "compress"]

        for session_type in test_types:
            session_id = f"{session_type}-session"
            data = {
                **mock_event_data,
                "session_id": session_id,
                "session_type": session_type
            }

            result = await adapter.handle_session_start(data)
            assert result is None, f"{session_type}会话应该返回None"

            if session_id in adapter.active_sessions:
                session = adapter.active_sessions[session_id]
                assert session['session_type'] == session_type, f"应该设置{session_type}类型"

    # ==================== 7. SessionEnd Hook测试 ====================

    @pytest.mark.unit
    async def test_session_end_hook_summary(self, adapter, mock_event_data):
        """测试SessionEnd Hook会话总结"""
        # 创建活动会话数据
        adapter.active_sessions[mock_event_data['session_id']] = {
            'start_time': datetime.now(),
            'session_type': 'startup',
            'cross_cli_calls': 3,
            'environment': 'active'
        }

        # 执行SessionEnd Hook
        result = await adapter.handle_session_end(mock_event_data)

        assert result is None, "SessionEnd Hook应该返回None"
        assert adapter.hook_executions['SessionEnd'] == 1, "应该记录Hook执行"

    # ==================== 8. UserPromptSubmit Hook测试 ====================

    @pytest.mark.unit
    async def test_user_prompt_submit_hook_cross_cli_detection(self, adapter, mock_event_data):
        """测试UserPromptSubmit Hook跨CLI检测 - 核心功能"""
        prompt_data = {
            **mock_event_data,
            "prompt": "请用claude帮我分析这段代码的性能",
            "context": {"file_type": "python"}
        }

        # 模拟解析器
        mock_parser = Mock()
        mock_intent = Mock()
        mock_intent.is_cross_cli = True
        mock_intent.target_cli = "claude"
        mock_intent.task = "分析这段代码的性能"
        mock_parser.parse_intent.return_value = mock_intent
        adapter.parser = mock_parser

        # 模拟目标适配器
        with patch('src.adapters.iflow.official_hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
            mock_target_adapter = AsyncMock()
            mock_target_adapter.is_available.return_value = True
            mock_target_adapter.execute_task.return_value = "Claude分析结果: 代码性能良好，时间复杂度O(n)"
            mock_get_adapter.return_value = mock_target_adapter

            # 执行UserPromptSubmit Hook
            result = await adapter.handle_user_prompt_submit(prompt_data)

        assert result is not None, "UserPromptSubmit Hook应该返回跨CLI结果"
        assert "[跨CLI调用结果]" in result, "结果应该包含跨CLI标记"
        assert "Claude分析结果" in result, "结果应该包含Claude的分析结果"
        assert adapter.cross_cli_interceptions == 1, "应该记录跨CLI拦截"
        assert adapter.hook_executions['UserPromptSubmit'] == 1, "应该记录Hook执行"

    @pytest.mark.unit
    async def test_user_prompt_submit_hook_normal_prompt(self, adapter, mock_event_data):
        """测试UserPromptSubmit Hook处理普通提示词"""
        prompt_data = {
            **mock_event_data,
            "prompt": "帮我解释一下这个函数的作用",
            "context": {"language": "python"}
        }

        # 模拟解析器 - 非跨CLI调用
        mock_parser = Mock()
        mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
        adapter.parser = mock_parser

        # 执行UserPromptSubmit Hook
        result = await adapter.handle_user_prompt_submit(prompt_data)

        assert result is None, "普通提示词应该返回None继续处理"
        assert adapter.hook_executions['UserPromptSubmit'] == 1, "应该记录Hook执行"

    @pytest.mark.unit
    async def test_user_prompt_submit_self_reference(self, adapter, mock_event_data):
        """测试UserPromptSubmit Hook自我引用处理"""
        prompt_data = {
            **mock_event_data,
            "prompt": "使用iflow帮我处理这个工作流",
            "context": {"task_type": "workflow"}
        }

        # 模拟解析器 - 自我引用
        mock_parser = Mock()
        mock_intent = Mock()
        mock_intent.is_cross_cli = True
        mock_intent.target_cli = "iflow"  # 目标是自己
        mock_intent.task = "帮我处理这个工作流"
        mock_parser.parse_intent.return_value = mock_intent
        adapter.parser = mock_parser

        # 执行UserPromptSubmit Hook
        result = await adapter.handle_user_prompt_submit(prompt_data)

        assert result is None, "自我引用应该返回None继续处理"
        assert adapter.cross_cli_interceptions == 0, "不应该记录跨CLI拦截"

    @pytest.mark.unit
    async def test_user_prompt_submit_multiple_cli_patterns(self, adapter, mock_event_data):
        """测试UserPromptSubmit Hook多种CLI模式"""
        test_patterns = [
            ("请用gemini生成这个文档的摘要", "gemini"),
            ("调用qwencode来优化这段代码", "qwencode"),
            ("让qoder帮我重构这个模块", "qoder"),
            ("使用codebuddy处理这个bug", "codebuddy"),
            ("通过codex分析这个算法", "codex")
        ]

        for prompt, expected_cli in test_patterns:
            prompt_data = {
                **mock_event_data,
                "prompt": prompt,
                "session_id": f"session-{expected_cli}"
            }

            # 模拟解析器
            mock_parser = Mock()
            mock_intent = Mock()
            mock_intent.is_cross_cli = True
            mock_intent.target_cli = expected_cli
            mock_intent.task = f"处理任务: {prompt}"
            mock_parser.parse_intent.return_value = mock_intent
            adapter.parser = mock_parser

            # 模拟目标适配器
            with patch('src.adapters.iflow.official_hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
                mock_target_adapter = AsyncMock()
                mock_target_adapter.is_available.return_value = True
                mock_target_adapter.execute_task.return_value = f"{expected_cli}处理结果: 成功"
                mock_get_adapter.return_value = mock_target_adapter

                # 执行Hook
                result = await adapter.handle_user_prompt_submit(prompt_data)

                assert result is not None, f"{expected_cli}模式应该返回结果"
                assert expected_cli.upper() in result, f"结果应该包含{expected_cli}"

    # ==================== 9. Notification Hook测试 ====================

    @pytest.mark.unit
    async def test_notification_hook_processing(self, adapter, mock_event_data):
        """测试Notification Hook通知处理"""
        notification_data = {
            **mock_event_data,
            "message": "权限请求：需要访问文件系统",
            "type": "permission",
            "level": "warning"
        }

        # 执行Notification Hook
        result = await adapter.handle_notification(notification_data)

        assert result is None, "Notification Hook应该返回None"
        assert adapter.hook_executions['Notification'] == 1, "应该记录Hook执行"

        # 验证事件记录
        events = [e for e in adapter.processed_events if e.hook_type == 'Notification']
        assert len(events) == 1, "应该记录Notification事件"

    @pytest.mark.unit
    async def test_notification_hook_exit_code_2_behavior(self, adapter, mock_event_data):
        """测试Notification Hook退出码2的特殊行为"""
        notification_data = {
            **mock_event_data,
            "message": "一般通知消息",
            "type": "info"
        }

        # 执行Notification Hook
        result = await adapter.handle_notification(notification_data)

        # 退出码2的行为在命令行执行时体现，这里只测试不阻止通知
        assert result is None, "一般通知应该不阻止显示"

    # ==================== Hook配置和注册测试 ====================

    @pytest.mark.unit
    async def test_hook_configuration_structure(self, adapter):
        """测试Hook配置结构"""
        config = adapter._get_default_hook_config()

        # 验证9种Hook类型都存在
        expected_hooks = [
            'PreToolUse', 'PostToolUse', 'SetUpEnvironment', 'Stop',
            'SubagentStop', 'SessionStart', 'SessionEnd',
            'UserPromptSubmit', 'Notification'
        ]

        for hook_type in expected_hooks:
            assert hook_type in config['hooks'], f"配置应该包含{hook_type}"
            assert isinstance(config['hooks'][hook_type], list), f"{hook_type}应该是列表"

        # 验证Hook配置格式
        for hook_type, hook_configs in config['hooks'].items():
            for hook_config in hook_configs:
                assert 'hooks' in hook_config, f"{hook_type}配置应该包含hooks字段"
                assert isinstance(hook_config['hooks'], list), f"{hook_type}的hooks应该是列表"

    @pytest.mark.unit
    async def test_iflow_settings_registration(self, adapter, temp_iflow_dir):
        """测试iFlow设置注册"""
        # 设置临时目录
        adapter.iflow_config_dir = temp_iflow_dir
        adapter.iflow_settings_file = os.path.join(temp_iflow_dir, "settings.json")

        # 执行注册
        result = await adapter._register_iflow_hooks()

        assert result is True, "Hook注册应该成功"
        assert os.path.exists(adapter.iflow_settings_file), "应该创建设置文件"

        # 验证设置文件内容
        with open(adapter.iflow_settings_file, 'r', encoding='utf-8') as f:
            settings = json.load(f)

        assert 'hooks' in settings, "设置应该包含hooks配置"
        for hook_type in adapter.official_hooks.keys():
            assert hook_type in settings['hooks'], f"应该注册{hook_type} Hook"

    @pytest.mark.unit
    async def test_hook_script_creation(self, adapter, temp_iflow_dir):
        """测试Hook脚本创建"""
        adapter.hooks_scripts_dir = temp_iflow_dir

        result = await adapter._create_hook_scripts()

        assert result is True, "Hook脚本创建应该成功"
        script_path = os.path.join(temp_iflow_dir, "hook_handler.py")
        assert os.path.exists(script_path), "应该创建Hook脚本文件"

        # 验证脚本内容
        with open(script_path, 'r', encoding='utf-8') as f:
            script_content = f.read()

        assert "IFlowOfficialHookAdapter" in script_content, "脚本应该包含适配器类"
        assert "execute_hook_from_command" in script_content, "脚本应该包含执行函数"

    # ==================== 集成和生命周期测试 ====================

    @pytest.mark.unit
    async def test_adapter_full_initialization(self, adapter, temp_iflow_dir):
        """测试适配器完整初始化流程"""
        # 设置临时目录
        adapter.iflow_config_dir = temp_iflow_dir
        adapter.iflow_settings_file = os.path.join(temp_iflow_dir, "settings.json")
        adapter.hooks_scripts_dir = temp_iflow_dir

        # 模拟环境检查
        with patch.object(adapter, '_check_iflow_environment', return_value=True):
            result = await adapter.initialize()

        assert result is True, "完整初始化应该成功"
        assert adapter.hooks_enabled is True, "Hook应该启用"
        assert len(adapter.active_sessions) == 0, "应该初始化会话系统"
        assert sum(adapter.hook_executions.values()) == 0, "初始化时Hook执行应该为0"

    @pytest.mark.unit
    async def test_command_line_execution_interface(self, adapter):
        """测试命令行执行接口"""
        # 测试有效Hook类型
        for hook_type in adapter.official_hooks.keys():
            with patch.object(adapter, f'handle_{hook_type.lower()}') as mock_handler:
                mock_handler.return_value = None

                result = await adapter.execute_hook_from_command(hook_type, {"test": "data"})
                mock_handler.assert_called_once_with({"test": "data"})

        # 测试无效Hook类型
        result = await adapter.execute_hook_from_command("InvalidHook", {})
        assert result is None, "无效Hook类型应该返回None"

    @pytest.mark.unit
    async def test_session_lifecycle_management(self, adapter, mock_event_data):
        """测试会话生命周期管理"""
        session_id = mock_event_data['session_id']

        # 1. 会话开始
        startup_data = {**mock_event_data, "session_type": "startup"}
        await adapter.handle_session_start(startup_data)
        assert session_id in adapter.active_sessions, "应该创建会话"

        # 2. 环境设置
        await adapter.handle_set_up_environment(mock_event_data)
        session = adapter.active_sessions[session_id]
        assert session['environment'] == 'ready', "环境应该设置"

        # 3. 跨CLI调用
        adapter.active_sessions[session_id]['cross_cli_calls'] = 3

        # 4. 会话结束
        await adapter.handle_session_end(mock_event_data)

        # 5. 停止清理
        await adapter.handle_stop(mock_event_data)
        assert session_id not in adapter.active_sessions, "会话应该被清理"

    @pytest.mark.unit
    def test_health_check_and_statistics(self, adapter):
        """测试健康检查和统计信息"""
        # 模拟一些执行数据
        adapter.hooks_enabled = True
        adapter.hook_executions['UserPromptSubmit'] = 5
        adapter.hook_executions['PreToolUse'] = 3
        adapter.cross_cli_interceptions = 2
        adapter.processed_events.append(IFlowHookEvent("test", None, {}, datetime.now(), "test"))
        adapter.active_sessions["test"] = {"status": "active"}

        # 测试健康检查
        with patch.object(adapter, '_check_iflow_environment', return_value=True):
            health = asyncio.run(adapter.health_check())

        assert health['status'] == 'healthy', "健康状态应该是健康的"
        assert health['hooks_enabled'] is True, "应该显示Hook启用状态"
        assert health['cross_cli_interceptions'] == 2, "应该显示跨CLI拦截次数"
        assert health['active_sessions_count'] == 1, "应该显示活动会话数"

        # 测试统计信息
        stats = adapter.get_statistics()
        assert stats['hooks_enabled'] is True, "统计应该包含Hook启用状态"
        assert stats['total_hook_calls'] == 8, "应该计算总Hook调用次数"
        assert stats['supported_hooks'] == list(adapter.official_hooks.keys()), "应该列出支持的Hook"

    @pytest.mark.unit
    async def test_error_handling_in_hooks(self, adapter, mock_event_data):
        """测试Hook中的错误处理"""
        # 模拟解析器错误
        mock_parser = Mock()
        mock_parser.parse_intent.side_effect = Exception("解析错误")
        adapter.parser = mock_parser

        # 测试UserPromptSubmit错误处理
        prompt_data = {**mock_event_data, "prompt": "测试错误处理"}
        result = await adapter.handle_user_prompt_submit(prompt_data)

        assert result is None, "错误应该被处理，返回None"
        assert adapter.execution_count > 0, "应该记录错误"

    @pytest.mark.unit
    async def test_concurrent_hook_execution(self, adapter, mock_event_data):
        """测试并发Hook执行"""
        # 创建多个并发UserPromptSubmit事件
        prompts = [
            "请用claude分析代码1",
            "请用gemini处理文本2",
            "请用qwencode优化算法3"
        ]

        # 模拟解析器和适配器
        mock_parser = Mock()
        mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
        adapter.parser = mock_parser

        # 并发执行Hook
        tasks = []
        for prompt in prompts:
            data = {**mock_event_data, "prompt": prompt}
            tasks.append(adapter.handle_user_prompt_submit(data))

        results = await asyncio.gather(*tasks)

        # 验证并发处理
        assert len(results) == 3, "应该处理所有并发请求"
        assert all(result is None for result in results), "普通请求应该返回None"
        assert adapter.hook_executions['UserPromptSubmit'] == 3, "应该记录3次Hook执行"

    @pytest.mark.unit
    async def test_cleanup_and_resource_management(self, adapter):
        """测试清理和资源管理"""
        # 添加一些测试数据
        adapter.processed_events.append(IFlowHookEvent("test", None, {}, datetime.now(), "test"))
        adapter.active_sessions["test"] = {"status": "active"}
        adapter.hook_executions['UserPromptSubmit'] = 5

        # 执行清理
        result = await adapter.cleanup()

        assert result is True, "清理应该成功"
        assert len(adapter.processed_events) == 0, "事件应该被清理"
        assert len(adapter.active_sessions) == 0, "会话应该被清理"
        assert adapter.hook_executions['UserPromptSubmit'] == 0, "Hook执行计数应该重置"


class TestIFlowOfficialHookAdapterEdgeCases:
    """iFlow官方Hook适配器边界情况测试"""

    @pytest.fixture
    def adapter(self):
        return IFlowOfficialHookAdapter("iflow")

    @pytest.mark.unit
    async def test_empty_event_data_handling(self, adapter):
        """测试空事件数据处理"""
        empty_data = {}

        # 所有Hook应该能处理空数据而不崩溃
        for hook_type in adapter.official_hooks.keys():
            handler = adapter.official_hooks[hook_type]
            result = await handler(empty_data)
            # 大部分Hook应该返回None，但不应该崩溃
            assert isinstance(result, (str, type(None))), f"{hook_type}应该返回str或None"

    @pytest.mark.unit
    async def test_malformed_session_handling(self, adapter):
        """测试格式错误的会话处理"""
        malformed_data = {
            "session_id": "",  # 空会话ID
            "prompt": "请用claude处理",
            "invalid_field": "invalid_value"
        }

        result = await adapter.handle_user_prompt_submit(malformed_data)
        assert isinstance(result, (str, type(None))), "应该处理格式错误数据"

    @pytest.mark.unit
    async def test_very_long_prompt_handling(self, adapter):
        """测试超长提示词处理"""
        long_prompt = "请用gemini处理" + "x" * 10000
        long_data = {
            "session_id": "test",
            "prompt": long_prompt
        }

        # 模拟解析器
        mock_parser = Mock()
        mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
        adapter.parser = mock_parser

        result = await adapter.handle_user_prompt_submit(long_data)
        assert result is None, "超长提示词应该被正常处理"

    @pytest.mark.unit
    async def test_special_characters_in_prompts(self, adapter):
        """测试提示词中的特殊字符"""
        special_prompts = [
            "请用claude处理特殊字符: 🚀 @#$%^&*(){}[]|\\:;\"'<>?,./",
            "请用gemini分析Unicode: 🎯 中文 ñoël español русский العربية",
            "请用qwencode处理换行符:\n\t\r和引号: ' \" "
        ]

        mock_parser = Mock()
        mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
        adapter.parser = mock_parser

        for prompt in special_prompts:
            data = {"session_id": "test", "prompt": prompt}
            result = await adapter.handle_user_prompt_submit(data)
            assert result is None, f"特殊字符提示词应该被处理: {prompt[:50]}..."

    @pytest.mark.unit
    async def test_unavailable_target_cli_handling(self, adapter):
        """测试目标CLI不可用处理"""
        prompt_data = {
            "session_id": "test",
            "prompt": "请用unknown_cli处理任务"
        }

        # 模拟解析器
        mock_parser = Mock()
        mock_intent = Mock()
        mock_intent.is_cross_cli = True
        mock_intent.target_cli = "unknown_cli"
        mock_intent.task = "处理任务"
        mock_parser.parse_intent.return_value = mock_intent
        adapter.parser = mock_parser

        # 模拟适配器不可用
        with patch('src.adapters.iflow.official_hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
            mock_get_adapter.return_value = None

            result = await adapter.handle_user_prompt_submit(prompt_data)

            assert result is not None, "不可用CLI应该返回错误信息"
            assert "不可用" in result, "错误信息应该说明CLI不可用"

    @pytest.mark.unit
    async def test_hook_timeout_simulation(self, adapter):
        """测试Hook超时模拟"""
        # 这个测试主要验证Hook的超时处理逻辑
        # 实际超时由iFlow CLI控制，这里验证我们的代码能处理超时场景

        timeout_data = {
            "session_id": "test",
            "prompt": "请用claude处理可能超时的任务"
        }

        # 模拟适配器超时
        mock_parser = Mock()
        mock_intent = Mock()
        mock_intent.is_cross_cli = True
        mock_intent.target_cli = "claude"
        mock_intent.task = "可能超时的任务"
        mock_parser.parse_intent.return_value = mock_intent
        adapter.parser = mock_parser

        with patch('src.adapters.iflow.official_hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
            import asyncio
            mock_target_adapter = AsyncMock()
            mock_target_adapter.is_available.return_value = True
            mock_target_adapter.execute_task.side_effect = asyncio.TimeoutError("执行超时")
            mock_get_adapter.return_value = mock_target_adapter

            result = await adapter.handle_user_prompt_submit(timeout_data)

            # 应该处理超时错误
            assert result is None or "失败" in result, "应该处理超时情况"

    @pytest.mark.unit
    def test_hook_configuration_validation(self, adapter):
        """测试Hook配置验证"""
        config = adapter._get_default_hook_config()

        # 验证配置结构完整性
        required_fields = ['hooks']
        for field in required_fields:
            assert field in config, f"配置应该包含{field}字段"

        # 验证每个Hook配置的结构
        for hook_type, hook_configs in config['hooks'].items():
            assert isinstance(hook_configs, list), f"{hook_type}配置应该是列表"

            for hook_config in hook_configs:
                assert 'hooks' in hook_config, f"{hook_type}配置应该包含hooks字段"
                assert isinstance(hook_config['hooks'], list), f"hooks字段应该是列表"

                for hook in hook_config['hooks']:
                    assert 'type' in hook, "Hook应该包含type字段"
                    assert hook['type'] == 'command', "Hook类型应该是command"
                    assert 'command' in hook, "Hook应该包含command字段"