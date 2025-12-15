"""
iFlow CLI Hook适配器单元测试

基于iFlow CLI官方Hook系统的TDD测试
测试9种Hook类型和跨CLI集成功能
"""

import pytest
import asyncio
import json
import yaml
import tempfile
import os
from pathlib import Path
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from typing import Dict, Any, Optional, List

from src.adapters.iflow.hook_adapter import IFlowHookAdapter, IFlowHookContext, IFlowEvent


class TestIFlowHookAdapterTDD:
    """iFlow CLI Hook适配器TDD测试 - 遵循测试先行的原则"""

    @pytest.fixture
    def adapter(self):
        """创建适配器实例"""
        return IFlowHookAdapter("iflow")

    @pytest.fixture
    def mock_context(self):
        """创建模拟Hook上下文"""
        return IFlowHookContext(
            command="test_command",
            args=["--option"],
            user_input="请用claude帮我分析这个代码",
            pipeline_name="test-pipeline",
            workflow_id="test-workflow-001",
            stage_name="input_processing",
            metadata={"session_id": "test-session"}
        )

    @pytest.fixture
    def temp_config_dir(self):
        """创建临时配置目录"""
        with tempfile.TemporaryDirectory() as temp_dir:
            yield temp_dir

    # ==================== 基础功能测试 ====================

    @pytest.mark.unit
    async def test_adapter_initialization(self, adapter):
        """测试适配器初始化"""
        # 模拟环境检查
        with patch.object(adapter, '_check_iflow_environment', return_value=True):
            with patch.object(adapter, '_load_hook_config', return_value=True):
                with patch.object(adapter, '_register_iflow_hooks', return_value=True):
                    with patch.object(adapter, '_initialize_event_bus', return_value=True):
                        result = await adapter.initialize()

        assert result is True, "适配器初始化应该成功"
        assert adapter.hooks_registered is True, "Hook应该已注册"
        assert len(adapter.hook_handlers) > 0, "应该有Hook处理器"

    @pytest.mark.unit
    def test_hook_handlers_setup(self, adapter):
        """测试Hook处理器设置"""
        expected_hooks = [
            'on_command_start',
            'on_command_end',
            'on_user_input',
            'on_workflow_stage',
            'on_pipeline_execute',
            'on_error',
            'on_output_render'
        ]

        assert set(adapter.hook_handlers.keys()) == set(expected_hooks), "应该设置所有Hook处理器"

        # 验证每个处理器都是可调用的
        for hook_name, handler in adapter.hook_handlers.items():
            assert callable(handler), f"Hook处理器 {hook_name} 应该是可调用的"

    @pytest.mark.unit
    async def test_user_prompt_submit_hook_cross_cli_detection(self, adapter, mock_context):
        """测试用户输入Hook的跨CLI检测功能"""
        # 设置解析器模拟
        mock_parser = Mock()
        mock_intent = Mock()
        mock_intent.is_cross_cli = True
        mock_intent.target_cli = "claude"
        mock_intent.task = "分析这个代码"
        mock_parser.parse_intent.return_value = mock_intent
        adapter.parser = mock_parser

        # 模拟跨CLI适配器获取
        with patch('src.adapters.iflow.hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
            mock_target_adapter = AsyncMock()
            mock_target_adapter.is_available.return_value = True
            mock_target_adapter.execute_task.return_value = "Claude分析结果: 代码质量良好"
            mock_get_adapter.return_value = mock_target_adapter

            # 执行Hook
            result = await adapter.on_user_input(mock_context)

        assert result is not None, "跨CLI调用应该返回结果"
        assert "Claude" in result, "结果应该包含目标CLI名称"
        assert "分析结果" in result, "结果应该包含执行结果"
        assert "跨CLI调用结果" in result, "结果应该是跨CLI格式"

    @pytest.mark.unit
    async def test_user_prompt_submit_hook_normal_input(self, adapter, mock_context):
        """测试用户输入Hook处理普通输入"""
        # 设置解析器模拟 - 非跨CLI调用
        mock_parser = Mock()
        mock_intent = Mock()
        mock_intent.is_cross_cli = False
        mock_parser.parse_intent.return_value = mock_intent
        adapter.parser = mock_parser

        # 执行Hook
        result = await adapter.on_user_input(mock_context)

        assert result is None, "普通输入应该返回None"
        assert adapter.hook_calls_count > 0, "应该记录Hook调用"

    @pytest.mark.unit
    async def test_pre_tool_use_hook(self, adapter, mock_context):
        """测试PreToolUse Hook"""
        with patch.object(adapter, 'on_command_start') as mock_command_start:
            mock_command_start.return_value = None

            # 模拟工具调用上下文
            tool_context = IFlowHookContext(
                command="Edit",
                user_input="编辑文件",
                metadata={"tool_name": "Edit"}
            )

            result = await adapter.on_command_start(tool_context)

            assert result is None, "PreToolUse Hook应该返回None继续执行"
            mock_command_start.assert_called_once()

    @pytest.mark.unit
    async def test_post_tool_use_hook(self, adapter, mock_context):
        """测试PostToolUse Hook"""
        with patch.object(adapter, 'on_command_end') as mock_command_end:
            mock_command_end.return_value = None

            tool_result = "文件编辑完成"
            result = await adapter.on_command_end(mock_context, tool_result)

            assert result is None, "PostToolUse Hook应该返回None"
            mock_command_end.assert_called_once_with(mock_context, tool_result)

    @pytest.mark.unit
    async def test_set_up_environment_hook(self, adapter, mock_context):
        """测试SetUpEnvironment Hook"""
        # 模拟会话开始
        session_context = IFlowHookContext(
            command="session_start",
            metadata={"session_type": "startup"}
        )

        # 触发环境设置
        await adapter._initialize_collaboration_system()

        assert adapter.collaboration_enabled is True, "协作系统应该启用"
        assert isinstance(adapter.active_workflows, dict), "活动工作流应该是字典"

    @pytest.mark.unit
    async def test_session_start_hook(self, adapter):
        """测试SessionStart Hook"""
        startup_context = IFlowHookContext(
            command="session_start",
            metadata={"session_type": "startup"}
        )

        # 模拟事件触发
        with patch.object(adapter, '_emit_event') as mock_emit:
            await adapter._emit_event("workflow_started", {"context": startup_context})

            mock_emit.assert_called_once()

    @pytest.mark.unit
    async def test_session_end_hook(self, adapter):
        """测试SessionEnd Hook"""
        end_context = IFlowHookContext(
            command="session_end",
            metadata={"session_type": "normal"}
        )

        # 执行清理
        result = await adapter.cleanup()

        assert result is True, "清理应该成功"
        assert len(adapter.processed_events) == 0, "事件应该被清理"

    @pytest.mark.unit
    async def test_notification_hook(self, adapter):
        """测试Notification Hook"""
        notification_context = IFlowHookContext(
            command="notification",
            metadata={"message": "权限请求", "type": "permission"}
        )

        # 模拟输出渲染
        test_output = "权限请求通知"
        result = await adapter.on_output_render(notification_context, test_output)

        assert result == test_output, "输出渲染应该返回原输出"

    @pytest.mark.unit
    async def test_cross_cli_execution_with_different_targets(self, adapter, mock_context):
        """测试不同目标CLI的跨CLI执行"""
        supported_clis = ['claude', 'gemini', 'qwencode', 'qoder', 'codebuddy', 'codex']

        for target_cli in supported_clis:
            # 设置解析器模拟
            mock_parser = Mock()
            mock_intent = Mock()
            mock_intent.is_cross_cli = True
            mock_intent.target_cli = target_cli
            mock_intent.task = f"测试任务-{target_cli}"
            mock_parser.parse_intent.return_value = mock_intent
            adapter.parser = mock_parser

            # 模拟目标适配器
            with patch('src.adapters.iflow.hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
                mock_target_adapter = AsyncMock()
                mock_target_adapter.is_available.return_value = True
                mock_target_adapter.execute_task.return_value = f"{target_cli}执行结果: 成功"
                mock_get_adapter.return_value = mock_target_adapter

                result = await adapter.on_user_input(mock_context)

                assert result is not None, f"{target_cli}调用应该返回结果"
                assert target_cli.upper() in result, f"结果应该包含{target_cli}"

    @pytest.mark.unit
    async def test_hook_configuration_loading(self, adapter, temp_config_dir):
        """测试Hook配置加载"""
        # 创建临时配置文件
        config_data = {
            "version": "1.0",
            "plugins": [
                {
                    "name": "cross-cli-adapter",
                    "enabled": True,
                    "priority": 100
                }
            ]
        }

        config_file = os.path.join(temp_config_dir, "hooks.yml")
        with open(config_file, 'w') as f:
            yaml.dump(config_data, f)

        # 修改适配器使用临时配置
        adapter.hooks_config_file = config_file

        result = await adapter._load_hook_config()
        assert result is True, "配置加载应该成功"
        assert 'plugins' in adapter.hook_config, "应该加载插件配置"

    @pytest.mark.unit
    async def test_hook_registration_with_existing_config(self, adapter, temp_config_dir):
        """测试与现有配置的Hook注册"""
        # 创建现有配置
        existing_config = {
            "version": "1.0",
            "plugins": [
                {
                    "name": "existing-plugin",
                    "enabled": True
                }
            ]
        }

        config_file = os.path.join(temp_config_dir, "hooks.yml")
        with open(config_file, 'w') as f:
            yaml.dump(existing_config, f)

        adapter.hooks_config_file = config_file

        # 注册Hook
        result = await adapter._register_iflow_hooks()
        assert result is True, "Hook注册应该成功"

        # 验证现有插件保持
        with open(config_file, 'r') as f:
            config = yaml.safe_load(f)

        plugin_names = [p['name'] for p in config.get('plugins', [])]
        assert 'existing-plugin' in plugin_names, "现有插件应该保持"
        assert 'cross-cli-adapter' in plugin_names, "新插件应该添加"

    @pytest.mark.unit
    async def test_event_bus_functionality(self, adapter):
        """测试事件总线功能"""
        # 初始化事件总线
        await adapter._initialize_event_bus()

        # 添加事件监听器
        event_received = []

        def test_listener(data):
            event_received.append(data)

        adapter.add_event_listener("test_event", test_listener)

        # 触发事件
        test_data = {"message": "test"}
        await adapter._emit_event("test_event", test_data)

        assert len(event_received) == 1, "应该接收到事件"
        assert event_received[0] == test_data, "事件数据应该正确"

    @pytest.mark.unit
    async def test_workflow_collaboration_opportunity(self, adapter, mock_context):
        """测试工作流协作机会检测"""
        stage_data = {
            "collaboration_request": True,
            "target_cli": "gemini",
            "task": "协作任务"
        }

        # 模拟目标适配器
        with patch('src.adapters.iflow.hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
            mock_target_adapter = AsyncMock()
            mock_target_adapter.is_available.return_value = True
            mock_target_adapter.execute_task.return_value = "协作结果"
            mock_get_adapter.return_value = mock_target_adapter

            result = await adapter._check_collaboration_opportunity(mock_context, stage_data)

            assert result is not None, "协作机会应该被处理"
            assert "协作结果" in result, "结果应该包含协作执行结果"

    @pytest.mark.unit
    def test_error_handling_in_hooks(self, adapter, mock_context):
        """测试Hook中的错误处理"""
        # 模拟解析器错误
        mock_parser = Mock()
        mock_parser.parse_intent.side_effect = Exception("解析错误")
        adapter.parser = mock_parser

        # 应该不抛出异常
        assert asyncio.iscoroutinefunction(adapter.on_user_input), "Hook方法应该是协程"

    @pytest.mark.unit
    async def test_health_check_functionality(self, adapter):
        """测试健康检查功能"""
        # 模拟初始化
        adapter.hooks_registered = True
        adapter.hook_calls_count = 10
        adapter.cross_cli_calls_count = 5

        with patch.object(adapter, '_check_iflow_environment', return_value=True):
            health = await adapter.health_check()

        assert health['status'] == 'healthy', "健康状态应该是健康的"
        assert health['hooks_registered'] is True, "Hook应该已注册"
        assert health['hook_calls_count'] == 10, "应该记录Hook调用次数"
        assert health['cross_cli_calls_count'] == 5, "应该记录跨CLI调用次数"

    @pytest.mark.unit
    def test_statistics_collection(self, adapter):
        """测试统计信息收集"""
        adapter.hooks_registered = True
        adapter.hook_calls_count = 20
        adapter.cross_cli_calls_count = 8

        stats = adapter.get_statistics()

        assert stats['hooks_registered'] is True, "统计应该包含Hook注册状态"
        assert stats['hook_calls_count'] == 20, "统计应该包含Hook调用次数"
        assert stats['cross_cli_calls_count'] == 8, "统计应该包含跨CLI调用次数"
        assert 'supported_hooks' in stats, "统计应该包含支持的Hook列表"

    @pytest.mark.unit
    async def test_context_data_preservation(self, adapter, mock_context):
        """测试上下文数据保留"""
        # 记录原始上下文
        original_data = mock_context.__dict__.copy()

        # 处理Hook
        with patch.object(adapter, 'parser') as mock_parser:
            mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)

            await adapter.on_user_input(mock_context)

        # 验证上下文未被修改
        assert mock_context.command == original_data['command'], "命令应该保持不变"
        assert mock_context.user_input == original_data['user_input'], "用户输入应该保持不变"

    @pytest.mark.unit
    async def test_timeout_handling(self, adapter, mock_context):
        """测试超时处理"""
        # 模拟超时的适配器调用
        with patch('src.adapters.iflow.hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
            mock_target_adapter = AsyncMock()
            mock_target_adapter.is_available.return_value = True
            mock_target_adapter.execute_task.side_effect = asyncio.TimeoutError("执行超时")
            mock_get_adapter.return_value = mock_target_adapter

            # 设置解析器
            mock_parser = Mock()
            mock_intent = Mock()
            mock_intent.is_cross_cli = True
            mock_intent.target_cli = "claude"
            mock_intent.task = "超时测试"
            mock_parser.parse_intent.return_value = mock_intent
            adapter.parser = mock_parser

            result = await adapter.on_user_input(mock_context)

            # 应该处理超时错误
            assert result is None or "失败" in result, "应该处理超时情况"

    @pytest.mark.unit
    async def test_concurrent_hook_execution(self, adapter):
        """测试并发Hook执行"""
        # 创建多个并发上下文
        contexts = []
        for i in range(3):
            context = IFlowHookContext(
                command=f"command_{i}",
                user_input=f"请用gemini处理任务{i}",
                workflow_id=f"workflow_{i}"
            )
            contexts.append(context)

        # 模拟并发处理
        with patch.object(adapter, 'parser') as mock_parser:
            mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)

            tasks = [adapter.on_user_input(context) for context in contexts]
            results = await asyncio.gather(*tasks)

        # 验证并发处理
        assert len(results) == 3, "应该处理所有并发请求"
        assert all(result is None for result in results), "普通请求应该返回None"

    @pytest.mark.unit
    async def test_hook_configuration_validation(self, adapter):
        """测试Hook配置验证"""
        # 测试默认配置
        default_config = adapter._get_default_hook_config()

        assert 'plugins' in default_config, "默认配置应该包含插件"
        assert 'version' in default_config, "默认配置应该包含版本"
        assert len(default_config['plugins']) > 0, "默认配置应该有插件"

        # 验证插件结构
        plugin = default_config['plugins'][0]
        required_fields = ['name', 'module', 'class', 'enabled', 'priority']
        for field in required_fields:
            assert field in plugin, f"插件应该包含{field}字段"

    @pytest.mark.unit
    async def test_resource_cleanup(self, adapter):
        """测试资源清理"""
        # 添加一些测试数据
        adapter.processed_events.append(IFlowEvent("test", {}, "test", datetime.now()))
        adapter.active_workflows["test"] = {"status": "active"}

        # 执行清理
        result = await adapter.cleanup()

        assert result is True, "清理应该成功"
        assert len(adapter.processed_events) == 0, "事件应该被清理"
        assert len(adapter.active_workflows) == 0, "活动工作流应该被清理"


class TestIFlowHookAdapterEdgeCases:
    """iFlow Hook适配器边界情况测试"""

    @pytest.fixture
    def adapter(self):
        return IFlowHookAdapter("iflow")

    @pytest.mark.unit
    async def test_empty_user_input_handling(self, adapter):
        """测试空用户输入处理"""
        empty_context = IFlowHookContext(
            command="",
            user_input="",
            args=[]
        )

        result = await adapter.on_user_input(empty_context)
        assert result is None, "空输入应该返回None"

    @pytest.mark.unit
    async def test_malformed_hook_context(self, adapter):
        """测试格式错误的Hook上下文"""
        # 创建不完整的上下文
        malformed_context = IFlowHookContext()
        # 不设置任何字段

        # 应该不抛出异常
        result = await adapter.on_user_input(malformed_context)
        assert result is None, "格式错误上下文应该返回None"

    @pytest.mark.unit
    async def test_very_long_user_input(self, adapter):
        """测试超长用户输入"""
        long_input = "请用claude处理" + "x" * 10000
        long_context = IFlowHookContext(user_input=long_input)

        # 应该不抛出异常
        with patch.object(adapter, 'parser') as mock_parser:
            mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
            result = await adapter.on_user_input(long_context)
            assert result is None, "超长输入应该被处理"

    @pytest.mark.unit
    async def test_special_characters_in_input(self, adapter):
        """测试输入中的特殊字符"""
        special_input = "请用gemini处理特殊字符: 🚀 @#$%^&*(){}[]|\\:;\"'<>?,./"
        special_context = IFlowHookContext(user_input=special_input)

        with patch.object(adapter, 'parser') as mock_parser:
            mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
            result = await adapter.on_user_input(special_context)
            assert result is None, "特殊字符应该被正确处理"

    @pytest.mark.unit
    async def test_unicode_content_handling(self, adapter):
        """测试Unicode内容处理"""
        unicode_input = "请用qwencode处理Unicode: 🎯 中文 ñoël español русский العربية"
        unicode_context = IFlowHookContext(user_input=unicode_input)

        with patch.object(adapter, 'parser') as mock_parser:
            mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
            result = await adapter.on_user_input(unicode_context)
            assert result is None, "Unicode内容应该被正确处理"

    @pytest.mark.unit
    async def test_hook_adapter_unavailable(self, adapter):
        """测试Hook适配器不可用情况"""
        # 模拟适配器不可用
        with patch('src.adapters.iflow.hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
            mock_get_adapter.return_value = None

            # 设置解析器
            mock_parser = Mock()
            mock_intent = Mock()
            mock_intent.is_cross_cli = True
            mock_intent.target_cli = "claude"
            mock_parser.parse_intent.return_value = mock_intent
            adapter.parser = mock_parser

            context = IFlowHookContext(user_input="请用claude分析")
            result = await adapter.on_user_input(context)

            assert result is not None, "适配器不可用时应该返回错误信息"
            assert "不可用" in result, "错误信息应该说明适配器不可用"

    @pytest.mark.unit
    async def test_multiple_hooks_same_type(self, adapter):
        """测试同类型多个Hook"""
        # 添加多个事件监听器
        events_received = []

        def listener1(data):
            events_received.append("listener1")

        def listener2(data):
            events_received.append("listener2")

        adapter.add_event_listener("test_event", listener1)
        adapter.add_event_listener("test_event", listener2)

        await adapter._emit_event("test_event", {"data": "test"})

        assert len(events_received) == 2, "应该触发所有监听器"
        assert "listener1" in events_received, "应该触发监听器1"
        assert "listener2" in events_received, "应该触发监听器2"

    @pytest.mark.unit
    async def test_hook_execution_statistics(self, adapter):
        """测试Hook执行统计"""
        initial_count = adapter.hook_calls_count

        # 执行多个Hook
        context = IFlowHookContext(user_input="测试输入")

        with patch.object(adapter, 'parser') as mock_parser:
            mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)

            await adapter.on_user_input(context)
            await adapter.on_command_start(context)
            await adapter.on_command_end(context, "result")

        final_count = adapter.hook_calls_count
        assert final_count > initial_count, "应该记录Hook调用次数"
        assert final_count - initial_count == 3, "应该记录3次Hook调用"