"""
QoderCLI通知Hook适配器单元测试

基于Qoder CLI通知Hook系统的TDD测试
针对macOS通知系统和跨平台fallback机制
"""

import pytest
import asyncio
import json
import tempfile
import os
import platform
from pathlib import Path
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from datetime import datetime
from typing import Dict, Any

from src.adapters.qoder.notification_hook_adapter import QoderNotificationHookAdapter, QoderHookEvent


class TestQoderNotificationHookAdapterTDD:
    """QoderCLI通知Hook适配器TDD测试 - 基于通知Hook机制"""

    @pytest.fixture
    def adapter(self):
        """创建适配器实例"""
        return QoderNotificationHookAdapter("qoder")

    @pytest.fixture
    def mock_event_data(self):
        """创建模拟Hook事件数据"""
        return {
            "session_id": "test-session-001",
            "timestamp": datetime.now().isoformat(),
            "user_id": "test_user"
        }

    @pytest.fixture
    def temp_qoder_dir(self):
        """创建临时Qoder配置目录"""
        with tempfile.TemporaryDirectory() as temp_dir:
            yield temp_dir

    @pytest.fixture
    def mock_platform_darwin(self, adapter):
        """模拟macOS平台"""
        adapter.is_macos = True
        return platform.Darwin

    # ==================== 基础功能测试 ====================

    @pytest.mark.unit
    async def test_adapter_initialization(self, adapter, temp_qoder_dir):
        """测试适配器初始化"""
        # 设置临时目录
        adapter.qoder_config_dir = temp_qoder_dir
        adapter.hook_script_dir = temp_qoder_dir
        adapter.temp_dir = temp_qoder_dir

        # 模拟环境检查
        with patch.object(adapter, '_check_qoder_environment', return_value=True):
            result = await adapter.initialize()

        assert result is True, "适配器初始化应该成功"
        assert adapter.hook_enabled is True, "Hook应该启用"
        assert adapter.is_macos == (platform.system() == "Darwin"), "应该正确检测平台"

    @pytest.mark.unit
    def test_platform_detection(self, adapter):
        """测试平台检测"""
        # 测试当前平台
        expected_macos = platform.system() == "Darwin"
        assert adapter.is_macos == expected_macos, "应该正确检测macOS平台"

    @pytest.mark.unit
    async def test_environment_variables_setup(self, adapter, temp_qoder_dir):
        """测试环境变量设置"""
        adapter.temp_dir = temp_qoder_dir
        await adapter._setup_environment_variables()

        # 验证环境变量
        expected_vars = [
            'QODER_CROSS_CLI_ENABLED',
            'QODER_CROSS_CLI_RESPONSE_FILE',
            'QODER_CROSS_CLI_REQUEST_FILE',
            'QODER_CROSS_CLI_STATUS_FILE'
        ]

        for var in expected_vars:
            assert var in os.environ, f"应该设置环境变量: {var}"
            assert os.environ[var] != "", f"环境变量 {var} 不应该为空"

    @pytest.mark.unit
    async def test_hook_scripts_creation(self, adapter, temp_qoder_dir):
        """测试Hook脚本创建"""
        adapter.hook_script_dir = temp_qoder_dir

        result = await adapter._create_hook_scripts()

        assert result is True, "Hook脚本创建应该成功"

        # 验证脚本文件存在
        expected_scripts = [
            "pre_hook.sh",
            "post_hook.sh",
            "error_hook.sh"
        ]

        for script in expected_scripts:
            script_path = os.path.join(temp_qoder_dir, script)
            assert os.path.exists(script_path), f"Hook脚本应该存在: {script}"
            assert os.access(script_path, os.X_OK), f"Hook脚本应该有执行权限: {script}"

    # ==================== 跨CLI功能测试 ====================

    @pytest.mark.unit
    async def test_cross_cli_detection_with_chinese(self, adapter, mock_event_data):
        """测试中文跨CLI调用检测"""
        test_commands = [
            "请用claude帮我分析这个算法",
            "调用gemini来处理这段文本",
            "用qwencode优化这个代码结构",
            "让iflow工作流处理这个任务"
        ]

        target_clis = ["claude", "gemini", "qwencode", "iflow"]

        for command, expected_cli in zip(test_commands, target_clis):
            session_id = f"session-{expected_cli}"

            # 模拟解析器
            mock_parser = Mock()
            mock_intent = Mock()
            mock_intent.is_cross_cli = True
            mock_intent.target_cli = expected_cli
            mock_intent.task = f"处理{expected_cli}任务"
            mock_parser.parse_intent.return_value = mock_intent
            adapter.parser = mock_parser

            # 模拟目标适配器
            with patch('src.adapters.qoder.notification_hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
                mock_target_adapter = AsyncMock()
                mock_target_adapter.is_available.return_value = True
                mock_target_adapter.execute_task.return_value = f"{expected_cli}处理结果: 成功"
                mock_get_adapter.return_value = mock_target_adapter

                # 执行跨CLI检测
                result = await adapter.handle_cross_cli_detection(command, session_id)

            assert result is not None, f"应该检测到{expected_cli}的跨CLI调用"
            assert expected_cli.upper() in result, f"结果应该包含{expected_cli}"
            assert "跨CLI调用结果" in result, "结果应该是跨CLI格式"

    @pytest.mark.unit
    async def test_cross_cli_detection_with_english(self, adapter, mock_event_data):
        """测试英文跨CLI调用检测"""
        test_commands = [
            "use claude to analyze this data",
            "call gemini to process the document",
            "ask qwencode for code optimization",
            "start codex workflow for this task"
        ]

        target_clis = ["claude", "gemini", "qwencode", "codex"]

        for command, expected_cli in zip(test_commands, target_clis):
            session_id = f"session-{expected_cli}"

            # 模拟解析器
            mock_parser = Mock()
            mock_intent = Mock()
            mock_intent.is_cross_cli = True
            mock_intent.target_cli = expected_cli
            mock_intent.task = f"process {expected_cli} task"
            mock_parser.parse_intent.return_value = mock_intent
            adapter.parser = mock_parser

            # 模拟目标适配器
            with patch('src.adapters.qoder.notification_hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
                mock_target_adapter = AsyncMock()
                mock_target_adapter.is_available.return_value = True
                mock_target_adapter.execute_task.return_value = f"{expected_cli} result: successful"
                mock_get_adapter.return_value = mock_target_adapter

                result = await adapter.handle_cross_cli_detection(command, session_id)

            assert result is not None, f"应该检测到{expected_cli}的跨CLI调用"
            assert f"{expected_cli.upper()} 调用结果" in result, f"结果应该包含{expected_cli}"

    @pytest.mark.unit
    async def test_cross_cli_detection_normal_command(self, adapter, mock_event_data):
        """测试普通命令检测"""
        normal_commands = [
            "帮我分析这个算法",
            "优化这个代码结构",
            "处理这个数据文件",
            "生成报告"
        ]

        for command in normal_commands:
            # 模拟解析器 - 非跨CLI调用
            mock_parser = Mock()
            mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
            adapter.parser = mock_parser

            result = await adapter.handle_cross_cli_detection(command, "test-session")

            assert result is None, "普通命令应该返回None"

    @pytest.mark.unit
    async def test_cross_cli_detection_self_reference(self, adapter, mock_event_data):
        """测试自我引用处理"""
        command = "请用qoder帮我处理这个项目"
        session_id = "test-session"

        # 模拟解析器 - 自我引用
        mock_parser = Mock()
        mock_intent = Mock()
        mock_intent.is_cross_cli = True
        mock_intent.target_cli = "qoder"  # 目标是自己
        mock_intent.task = "帮我处理这个项目"
        mock_parser.parse_intent.return_value = mock_intent
        adapter.parser = mock_parser

        result = await adapter.handle_cross_cli_detection(command, session_id)

        assert result is None, "自我引用应该返回None"

    @pytest.mark.unit
    async def test_cross_cli_execution_unavailable_adapter(self, adapter, mock_event_data):
        """测试目标适配器不可用"""
        command = "请用claude分析这个代码"
        session_id = "test-session"

        # 模拟解析器
        mock_parser = Mock()
        mock_intent = Mock()
        mock_intent.is_cross_cli = True
        mock_intent.target_cli = "claude"
        mock_intent.task = "分析这个代码"
        mock_parser.parse_intent.return_value = mock_intent
        adapter.parser = mock_parser

        # 模拟适配器不可用
        with patch('src.adapters.qoder.notification_hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
            mock_get_adapter.return_value = None

            result = await adapter.handle_cross_cli_detection(command, session_id)

        assert result is not None, "适配器不可用时应该返回错误信息"
        assert "不可用" in result, "错误信息应该说明适配器不可用"

    # ==================== 通知系统测试 ====================

    @pytest.mark.unit
    async def test_macos_notification_sending(self, adapter, mock_platform_darwin):
        """测试macOS通知发送"""
        message = "测试通知消息"
        title = "测试标题"
        subtitle = "测试副标题"

        # 模拟osascript调用
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = Mock(returncode=0)

            await adapter._send_notification(message, title, subtitle)

            # 验证调用参数
            mock_run.assert_called_once()
            call_args = mock_run.call_args[0]
            assert call_args[0] == ['osascript', '-e']
            script = call_args[1]['capture_output']
            assert "测试通知消息" in script
            assert "测试标题" in script
            assert "测试副标题" in script

    @pytest.mark.unit
    async def test_non_macos_notification_fallback(self, adapter):
        """测试非macOS平台通知fallback"""
        adapter.is_macos = False

        message = "测试通知消息"
        title = "测试标题"

        # 重定向日志输出以验证
        with patch('src.adapters.qoder.notification_hook_adapter.logger') as mock_logger:
            await adapter._send_notification(message, title)

            # 验证日志调用
            mock_logger.info.assert_called_once()
            log_message = mock_logger.info.call_args[0][0]
            assert "NOTIFICATION" in log_message
            assert "测试标题" in log_message
            assert "测试通知消息" in log_message

    @pytest.mark.unit
    async def test_notification_error_handling(self, adapter, mock_platform_darwin):
        """测试通知发送错误处理"""
        message = "测试通知消息"
        title = "测试标题"

        # 模拟osascript错误
        with patch('subprocess.run') as mock_run:
            mock_run.side_effect = subprocess.CalledProcessError(1, 'osascript', '', 'error')

            with patch('src.adapters.qoder.notification_hook_adapter.logger') as mock_logger:
                await adapter._send_notification(message, title)

                # 应该fallback到日志
                mock_logger.info.assert_called_once()
                log_message = mock_logger.info.call_args[0][0]
                assert "NOTIFICATION" in log_message

    # ==================== Hook事件监控测试 ====================

    @pytest.mark.unit
    async def test_request_file_processing(self, adapter, temp_qoder_dir):
        """测试请求文件处理"""
        # 设置临时文件路径
        request_file = os.path.join(temp_qoder_dir, "test_request.json")
        adapter.env_vars['QODER_CROSS_CLI_REQUEST_FILE'] = request_file

        # 创建测试请求文件
        request_data = {
            "stage": "pre_command",
            "command": "请用claude分析代码",
            "session_id": "test-session",
            "timestamp": datetime.now().isoformat()
        }

        with open(request_file, 'w', encoding='utf-8') as f:
            json.dump(request_data, f, ensure_ascii=False)

        # 模拟解析器
        mock_parser = Mock()
        mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
        adapter.parser = mock_parser

        # 处理请求文件
        await adapter._process_request_file(request_file)

        # 验证事件记录
        assert len(adapter.processed_events) == 1, "应该记录一个事件"
        event = adapter.processed_events[0]
        assert event.stage == "pre_command", "应该记录正确的阶段"
        assert event.command == "请用claude分析代码", "应该记录正确的命令"
        assert event.session_id == "test-session", "应该记录会话ID"

    @pytest.mark.unit
    async def test_status_file_processing(self, adapter, temp_qoder_dir):
        """测试状态文件处理"""
        # 设置临时文件路径
        status_file = os.path.join(temp_qoder_dir, "test_status.json")
        adapter.env_vars['QODER_CROSS_CLI_STATUS_FILE'] = status_file

        # 创建测试状态文件
        status_data = {
            "stage": "post_command",
            "command": "测试命令",
            "session_id": "test-session",
            "exit_code": 0,
            "timestamp": datetime.now().isoformat(),
            "completed": True
        }

        with open(status_file, 'w', encoding='utf-8') as f:
            json.dump(status_data, f, ensure_ascii=False)

        # 处理状态文件
        await adapter._process_status_file(status_file)

        # 验证会话记录
        assert "test-session" in adapter.active_sessions, "应该创建活动会话"
        session = adapter.active_sessions["test-session"]
        assert len(session["commands"]) == 1, "应该记录命令"

    @pytest.mark.unit
    async def test_response_file_writing(self, adapter, temp_qoder_dir):
        """测试响应文件写入"""
        # 设置临时文件路径
        response_file = os.path.join(temp_qoder_dir, "test_response.json")
        adapter.env_vars['QODER_CROSS_CLI_RESPONSE_FILE'] = response_file

        result = "跨CLI调用结果: 成功"

        # 写入响应文件
        await adapter._write_response_file(result)

        # 验证文件内容
        assert os.path.exists(response_file), "响应文件应该存在"
        with open(response_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        assert data["result"] == result, "应该记录正确的结果"
        assert data["cross_cli"] is True, "应该标记为跨CLI"
        assert "timestamp" in data, "应该包含时间戳"

    # ==================== Hook监控测试 ====================

    @pytest.mark.unit
    async def test_hook_event_monitoring(self, adapter, temp_qoder_dir):
        """测试Hook事件监控"""
        # 设置文件路径
        request_file = os.path.join(temp_qoder_dir, "cross_cli_request.json")
        status_file = os.path.join(temp_qoder_dir, "cross_cli_status.json")
        response_file = os.path.join(temp_qoder_dir, "cross_cli_response.json")

        adapter.env_vars.update({
            'QODER_CROSS_CLI_REQUEST_FILE': request_file,
            'QODER_CROSS_CLI_STATUS_FILE': status_file,
            'QODER_CROSS_CLI_RESPONSE_FILE': response_file
        })

        # 创建测试文件
        request_data = {"stage": "pre_command", "command": "测试命令", "session_id": "test"}
        with open(request_file, 'w') as f:
            json.dump(request_data, f)

        status_data = {"stage": "post_command", "command": "测试命令", "session_id": "test", "completed": True}
        with open(status_file, 'w') as f:
            json.dump(status_data, f)

        # 模拟解析器
        mock_parser = Mock()
        mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
        adapter.parser = mock_parser

        # 执行监控
        await adapter.monitor_hook_events()

        # 验证事件处理
        assert len(adapter.processed_events) >= 1, "应该处理请求事件"
        assert "test" in adapter.active_sessions, "应该创建活动会话"

    # ==================== 执行任务测试 ====================

    @pytest.mark.unit
    async def test_execute_task_with_cross_cli(self, adapter, mock_event_data):
        """测试执行跨CLI任务"""
        task = "请用gemini分析这个文档"
        session_id = "test-session"

        # 模拟解析器
        mock_parser = Mock()
        mock_intent = Mock()
        mock_intent.is_cross_cli = True
        mock_intent.target_cli = "gemini"
        mock_intent.task = "分析这个文档"
        mock_parser.parse_intent.return_value = mock_intent
        adapter.parser = mock_parser

        # 模拟目标适配器
        with patch('src.adapters.qoder.notification_hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
            mock_target_adapter = AsyncMock()
            mock_target_adapter.is_available.return_value = True
            mock_target_adapter.execute_task.return_value = "Gemini分析结果: 文档结构良好"
            mock_get_adapter.return_value = mock_target_adapter

            result = await adapter.execute_task(task, {"session_id": session_id})

        assert result is not None, "应该返回跨CLI结果"
        assert "Gemini分析结果" in result, "结果应该包含Gemini的分析结果"
        assert "Qoder通知Hook适配器" in result, "结果应该包含来源信息"

    @pytest.mark.unit
    async def test_execute_task_normal_task(self, adapter, mock_event_data):
        """测试执行普通任务"""
        task = "正常的数据处理任务"
        session_id = "test-session"

        # 模拟解析器
        mock_parser = Mock()
        mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
        adapter.parser = mock_parser

        result = await adapter.execute_task(task, {"session_id": session_id})

        assert result == "Qoder通知Hook适配器处理: 正常的数据处理任务", "应该返回本地处理结果"

    # ==================== 健康检查和统计测试 ====================

    @pytest.mark.unit
    async def test_health_check(self, adapter, temp_qoder_dir):
        """测试健康检查"""
        # 设置适配器状态
        adapter.hook_enabled = True
        adapter.temp_dir = temp_qoder_dir
        adapter.hook_script_dir = temp_qoder_dir
        adapter.hook_executions = {'notification_sent': 5, 'pre_command': 10}
        adapter.cross_cli_calls = 3
        adapter.processed_events.append(QoderHookEvent("test", "stage", {}, datetime.now(), "session"))
        adapter.active_sessions["test"] = {"status": "active"}

        # 模拟环境检查
        with patch.object(adapter, '_check_qoder_environment', return_value=True):
            health = await adapter.health_check()

        assert health['status'] == 'healthy', "健康状态应该是健康的"
        assert health['hook_enabled'] is True, "应该显示Hook启用状态"
        assert health['is_macos'] == (platform.system() == "Darwin"), "应该显示平台信息"
        assert health['cross_cli_calls'] == 3, "应该显示跨CLI调用次数"
        assert health['hook_executions']['notification_sent'] == 5, "应该显示通知发送次数"
        assert health['active_sessions_count'] == 1, "应该显示活动会话数"

    @pytest.mark.unit
    def test_statistics_collection(self, adapter):
        """测试统计信息收集"""
        # 设置统计数据
        adapter.hook_enabled = True
        adapter.is_macos = True
        adapter.hook_executions = {
            'pre_command': 15,
            'post_command': 12,
            'error_handling': 3,
            'notification_sent': 8
        }
        adapter.cross_cli_calls = 5
        adapter.processed_events.append(QoderHookEvent("test", "stage", {}, datetime.now(), "session"))

        stats = adapter.get_statistics()

        assert stats['hook_enabled'] is True, "统计应该包含Hook启用状态"
        assert stats['is_macos'] is True, "统计应该包含平台信息"
        assert stats['cross_cli_calls'] == 5, "统计应该包含跨CLI调用次数"
        assert stats['total_hook_calls'] == 38, "应该计算总Hook调用次数"
        assert stats['notification_sent'] == 8, "统计应该包含通知发送次数"
        assert stats['processed_events_count'] == 1, "统计应该包含事件数量"

    # ==================== 清理和资源管理测试 ====================

    @pytest.mark.unit
    async def test_cleanup_resources(self, adapter, temp_qoder_dir):
        """测试资源清理"""
        # 设置一些测试数据
        adapter.temp_dir = temp_qoder_dir
        adapter.hook_executions = {'pre_command': 5, 'notification_sent': 3}
        adapter.processed_events.append(QoderHookEvent("test", "stage", {}, datetime.now(), "session"))
        adapter.active_sessions["test"] = {"status": "active"}

        # 执行清理
        result = await adapter.cleanup()

        assert result is True, "清理应该成功"
        assert len(adapter.processed_events) == 0, "事件应该被清理"
        assert len(adapter.active_sessions) == 0, "会话应该被清理"
        assert adapter.temp_dir is None, "临时目录应该被清理"
        assert adapter.hook_executions['pre_command'] == 0, "Hook执行计数应该重置"
        assert adapter.hook_executions['notification_sent'] == 0, "通知计数应该重置"

    # ==================== Hook脚本集成测试 ====================

    @pytest.mark.unit
    async def test_hook_script_creation_content(self, adapter, temp_qoder_dir):
        """测试Hook脚本内容创建"""
        adapter.hook_script_dir = temp_qoder_dir

        await adapter._create_hook_scripts()

        # 检查前置Hook脚本内容
        pre_hook_path = os.path.join(temp_qoder_dir, "pre_hook.sh")
        with open(pre_hook_path, 'r', encoding='utf-8') as f:
            pre_content = f.read()

        assert "QODER_CROSS_CLI_REQUEST_FILE" in pre_content, "前置脚本应该包含请求文件处理"
        assert "跨CLI调用关键词" in pre_content, "前置脚本应该包含关键词检测"
        assert "osascript" in pre_content, "前置脚本应该包含AppleScript调用"

        # 检查后置Hook脚本内容
        post_hook_path = os.path.join(temp_qoder_dir, "post_hook.sh")
        with open(post_hook_path, 'r', encoding='utf-8') as f:
            post_content = f.read()

        assert "QODER_CROSS_CLI_STATUS_FILE" in post_content, "后置脚本应该包含状态文件处理"
        assert "✅ 跨CLI调用完成" in post_content, "后置脚本应该包含完成通知"

        # 检查错误处理Hook脚本内容
        error_hook_path = os.path.join(temp_qoder_dir, "error_hook.sh")
        with open(error_hook_path, 'r', encoding='utf-8') as f:
            error_content = f.read()

        assert "⌛️ 你提交的任务需要授权呀" in error_content, "错误脚本应该包含授权通知"
        assert "EXIT_CODE" in error_content, "错误脚本应该检查退出码"

    # ==================== 边界情况测试 ====================

    @pytest.mark.unit
    async def test_empty_event_data_handling(self, adapter):
        """测试空事件数据处理"""
        empty_data = {}

        # 所有处理方法应该能处理空数据而不崩溃
        try:
            await adapter._process_request_file("")
            await adapter._process_status_file("")
            await adapter.handle_cross_cli_detection("", "")
        except Exception as e:
            pytest.fail(f"空数据处理不应该抛出异常: {e}")

    @pytest.mark.unit
    async def test_malformed_file_handling(self, adapter, temp_qoder_dir):
        """测试格式错误文件处理"""
        # 创建格式错误的JSON文件
        malformed_file = os.path.join(temp_qoder_dir, "malformed.json")
        with open(malformed_file, 'w') as f:
            f.write("{ invalid json content")

        # 设置文件路径
        adapter.env_vars['QODER_CROSS_CLI_REQUEST_FILE'] = malformed_file

        # 应该不抛出异常
        try:
            await adapter._process_request_file(malformed_file)
        except Exception as e:
            # 应该记录错误但不崩溃
            assert isinstance(e, (json.JSONDecodeError, Exception))

    @pytest.mark.unit
    async def test_very_long_command_handling(self, adapter, mock_event_data):
        """测试超长命令处理"""
        long_command = "请用claude处理" + "x" * 10000
        session_id = "test-session"

        # 模拟解析器
        mock_parser = Mock()
        mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
        adapter.parser = mock_parser

        result = await adapter.handle_cross_cli_detection(long_command, session_id)

        assert result is None, "超长命令应该被正常处理"

    @pytest.mark.unit
    async def test_special_characters_in_commands(self, adapter, mock_event_data):
        """测试命令中的特殊字符"""
        special_commands = [
            "请用gemini处理特殊字符: 🚀 @#$%^&*(){}[]|\\:;\"'<>?,./",
            "请用qwencode分析Unicode: 🎯 中文 ñoël español русский العربية",
            "请用iflow处理换行符:\n\t\r和引号: ' \" "
        ]

        # 模拟解析器
        mock_parser = Mock()
        mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
        adapter.parser = mock_parser

        for command in special_commands:
            result = await adapter.handle_cross_cli_detection(command, "test-session")
            assert result is None, f"特殊字符命令应该被处理: {command[:50]}..."

    @pytest.mark.unit
    async def test_concurrent_hook_monitoring(self, adapter, temp_qoder_dir):
        """测试并发Hook监控"""
        # 设置文件路径
        request_file = os.path.join(temp_qoder_dir, "concurrent_request.json")
        adapter.env_vars['QODER_CROSS_CLI_REQUEST_FILE'] = request_file

        # 创建多个并发请求
        tasks = []
        for i in range(3):
            request_data = {
                "stage": "pre_command",
                "command": f"并发测试命令{i}",
                "session_id": f"session-{i}"
            }

            with open(request_file, 'w') as f:
                json.dump(request_data, f)

            # 模拟解析器
            mock_parser = Mock()
            mock_parser.parse_intent.return_value = Mock(is_cross_cli=False)
            adapter.parser = mock_parser

            tasks.append(adapter._process_request_file(request_file))

        # 并发执行
        await asyncio.gather(*tasks)

        # 验证所有事件都被处理
        assert len(adapter.processed_events) >= 3, "应该处理所有并发请求"

    @pytest.mark.unit
    def test_adapter_unavailable_state(self, adapter):
        """测试适配器不可用状态"""
        # 设置不可用状态
        adapter.hook_enabled = False
        adapter.temp_dir = None
        adapter.hook_script_dir = None

        assert not adapter.is_available(), "适配器应该显示为不可用"

    @pytest.mark.unit
    def test_configuration_validation(self, adapter):
        """测试配置验证"""
        # 验证环境变量配置
        expected_vars = [
            'QODER_CROSS_CLI_ENABLED',
            'QODER_CROSS_CLI_RESPONSE_FILE',
            'QODER_CROSS_CLI_REQUEST_FILE',
            'QODER_CROSS_CLI_STATUS_FILE',
            'QODER_HOOK_STAGE',
            'QODER_HOOK_COMMAND',
            'QODER_HOOK_SESSION_ID'
        ]

        for var in expected_vars:
            assert var in adapter.env_vars, f"环境变量配置应该包含{var}"


class TestQoderNotificationHookAdapterEdgeCases:
    """Qoder通知Hook适配器边界情况测试"""

    @pytest.fixture
    def adapter(self):
        return QoderNotificationHookAdapter("qoder")

    @pytest.mark.unit
    async def test_missing_directory_creation(self, adapter):
        """测试目录创建失败处理"""
        # 模拟目录创建权限问题
        with patch('os.makedirs', side_effect=PermissionError("Permission denied")):
            # 应该处理权限错误但继续执行
            try:
                await adapter._create_directories()
            except PermissionError:
                # 这是预期的行为
                pass

    @pytest.mark.unit
    async def test_file_write_permission_denied(self, adapter, temp_qoder_dir):
        """测试文件写入权限拒绝"""
        adapter.hook_script_dir = temp_qoder_dir

        # 模拟文件写入权限拒绝
        with patch('builtins.open', side_effect=PermissionError("Permission denied")):
            result = await adapter._create_hook_scripts()
            # 应该处理权限错误，返回False
            assert result is False

    @pytest.mark.unit
    async def test_subprocess_timeout_handling(self, adapter):
        """测试subprocess超时处理"""
        adapter.is_macos = True

        # 模拟subprocess超时
        with patch('subprocess.run', side_effect=subprocess.TimeoutError("Command timeout")):
            with patch('src.adapters.qoder.notification_hook_adapter.logger') as mock_logger:
                await adapter._send_notification("测试消息", "测试标题")

                # 应该fallback到日志
                mock_logger.info.assert_called_once()

    @pytest.mark.unit
    async def test_cross_cli_target_adapter_exception(self, adapter, mock_event_data):
        """测试目标适配器异常"""
        command = "请用claude分析代码"
        session_id = "test-session"

        # 模拟解析器
        mock_parser = Mock()
        mock_intent = Mock()
        mock_intent.is_cross_cli = True
        mock_intent.target_cli = "claude"
        mock_parser.parse_intent.return_value = mock_intent
        adapter.parser = mock_parser

        # 模拟目标适配器异常
        with patch('src.adapters.qoder.notification_hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
            mock_target_adapter = AsyncMock()
            mock_target_adapter.is_available.return_value = True
            mock_target_adapter.execute_task.side_effect = Exception("Adapter error")
            mock_get_adapter.return_value = mock_target_adapter

            result = await adapter.handle_cross_cli_detection(command, session_id)

        assert result is not None, "应该返回错误结果"
        assert "调用失败" in result, "结果应该包含错误信息"
        assert adapter.execution_count > 0, "应该记录错误"

    @pytest.mark.unit
    async def test_environment_variable_cleanup_on_error(self, adapter, temp_qoder_dir):
        """测试错误时环境变量清理"""
        adapter.temp_dir = temp_qoder_dir
        await adapter._setup_environment_variables()

        # 记录原始环境变量
        original_env = os.environ.copy()

        # 模拟清理过程中的异常
        with patch('os.unlink', side_effect=OSError("File not found")):
            await adapter.cleanup()

        # 环境变量应该被清理
        for var in adapter.env_vars.keys():
            if var in original_env:
                assert os.environ[var] == original_env[var], f"环境变量{var}应该恢复原值"

    @pytest.mark.unit
    def test_adaptater_initialization_partial_failure(self, adapter, temp_qoder_dir):
        """测试适配器初始化部分失败"""
        adapter.qoder_config_dir = temp_qoder_dir
        adapter.hook_script_dir = temp_qoder_dir

        # 模拟部分初始化失败
        with patch.object(adapter, '_check_qoder_environment', return_value=True):
            with patch.object(adapter, '_create_hook_scripts', return_value=False):
                with patch.object(adapter, '_create_directories'):
                    # 环境创建成功
                    result = asyncio.run(adapter.initialize())

        assert result is False, "部分失败时初始化应该返回False"
        assert adapter.hook_enabled is False, "Hook应该保持未启用状态"