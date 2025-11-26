"""
Copilot CLI适配器的TDD测试

这个测试文件遵循测试驱动开发(TDD)原则，确保CopilotCLI MCP适配器的
所有功能都按照项目约束条件正确实现。

测试覆盖:
- MCP服务器注册和管理
- 自定义代理创建
- 跨CLI调用处理
- 权限管理集成
- 配置文件操作
- 错误处理和边界情况
"""

import pytest
import asyncio
import json
import tempfile
import os
from unittest.mock import Mock, patch, AsyncMock, mock_open
from pathlib import Path
from datetime import datetime

# 导入测试目标
from src.adapters.copilot.mcp_adapter import (
    CopilotMCPAdapter,
    CopilotMCPContext,
    get_copilot_mcp_adapter,
    initialize_copilot_adapter,
    is_copilot_adapter_available
)

from src.core.base_adapter import IntentResult


class TestCopilotMCPContext:
    """测试CopilotMCPContext类"""

    def test_context_initialization_with_default_values(self):
        """测试上下文使用默认值初始化"""
        context = CopilotMCPContext()

        assert context.prompt == ""
        assert context.metadata == {}
        assert context.session_id == "unknown"
        assert context.user_id == "unknown"
        assert isinstance(context.timestamp, datetime)

    def test_context_initialization_with_custom_values(self):
        """测试上下文使用自定义值初始化"""
        custom_metadata = {
            "session_id": "test_session_123",
            "user_id": "test_user_456",
            "tool_permissions": {"execute": True}
        }

        context = CopilotMCPContext(
            prompt="Test prompt",
            metadata=custom_metadata
        )

        assert context.prompt == "Test prompt"
        assert context.metadata == custom_metadata
        assert context.session_id == "test_session_123"
        assert context.user_id == "test_user_456"
        assert context.tool_permissions == {"execute": True}


class TestCopilotMCPAdapter:
    """测试CopilotMCPAdapter类"""

    @pytest.fixture
    def temp_config_dir(self):
        """创建临时配置目录"""
        with tempfile.TemporaryDirectory() as temp_dir:
            yield temp_dir

    @pytest.fixture
    def adapter(self, temp_config_dir):
        """创建适配器实例"""
        with patch('os.path.expanduser') as mock_expanduser:
            mock_expanduser.return_value = temp_config_dir
            adapter = CopilotMCPAdapter()
            return adapter

    def test_adapter_initialization(self, adapter):
        """测试适配器初始化"""
        assert adapter.cli_name == "copilot"
        assert adapter.version == "1.0.0"
        assert adapter.execution_count == 0
        assert adapter.error_count == 0
        assert adapter.mcp_calls_count == 0
        assert adapter.cross_cli_calls_count == 0
        assert not adapter.mcp_server_registered

    def test_adapter_initialization_with_custom_cli_name(self):
        """测试使用自定义CLI名称初始化适配器"""
        adapter = CopilotMCPAdapter("custom_copilot")
        assert adapter.cli_name == "custom_copilot"

    def test_cross_cli_mcp_server_config(self, adapter):
        """测试跨CLI MCP服务器配置"""
        server_config = adapter.cross_cli_mcp_server

        assert server_config["name"] == "cross-cli-adapter"
        assert "Model Context Protocol" in server_config["description"]
        assert server_config["command"] == "python"
        assert "-m" in server_config["args"]
        assert "src.adapters.copilot.mcp_server" in server_config["args"]
        assert server_config["env"]["CROSS_CLI_ADAPTER"] == "enabled"

    @pytest.mark.asyncio
    async def test_initialize_success(self, adapter):
        """测试成功初始化"""
        with patch.object(adapter, '_check_copilot_environment', return_value=True), \
             patch.object(adapter, '_register_mcp_server', return_value=True), \
             patch.object(adapter, '_create_custom_agents', return_value=True), \
             patch.object(adapter, '_ensure_config_directory', return_value=True):

            result = await adapter.initialize()

            assert result is True
            assert adapter.mcp_server_registered is True

    @pytest.mark.asyncio
    async def test_initialize_copilot_environment_check_failure(self, adapter):
        """测试Copilot环境检查失败时的初始化"""
        with patch.object(adapter, '_check_copilot_environment', return_value=False):
            result = await adapter.initialize()

            assert result is False
            assert adapter.mcp_server_registered is False
            assert adapter.error_count == 1

    @pytest.mark.asyncio
    async def test_register_mcp_server_new_server(self, adapter, temp_config_dir):
        """测试注册新的MCP服务器"""
        # 创建MCP配置目录
        mcp_config_file = Path(temp_config_dir) / "mcp-config.json"

        with patch.object(adapter, '_save_mcp_config', return_value=True):
            result = await adapter._register_mcp_server()

            assert result is True

    @pytest.mark.asyncio
    async def test_register_mcp_server_existing_server(self, adapter, temp_config_dir):
        """测试注册已存在的MCP服务器"""
        # 创建现有配置
        mcp_config_file = Path(temp_config_dir) / "mcp-config.json"
        existing_config = {
            "mcpServers": {
                "cross-cli-adapter": {
                    "command": "python",
                    "args": ["test"]
                }
            }
        }

        with open(mcp_config_file, 'w') as f:
            json.dump(existing_config, f)

        result = await adapter._register_mcp_server()

        assert result is True

    def test_load_mcp_config_existing_file(self, adapter, temp_config_dir):
        """测试加载现有MCP配置文件"""
        # 创建配置文件
        mcp_config_file = Path(temp_config_dir) / "mcp-config.json"
        test_config = {
            "mcpServers": {
                "test-server": {
                    "command": "node",
                    "args": ["server.js"]
                }
            }
        }

        with open(mcp_config_file, 'w') as f:
            json.dump(test_config, f)

        config = adapter._load_mcp_config()

        assert config == test_config

    def test_load_mcp_config_no_existing_file(self, adapter):
        """测试加载不存在的MCP配置文件"""
        with patch('os.path.exists', return_value=False):
            config = adapter._load_mcp_config()

            assert config == {"mcpServers": {}}

    def test_load_mcp_config_invalid_json(self, adapter, temp_config_dir):
        """测试加载无效的MCP配置文件"""
        # 创建无效JSON文件
        mcp_config_file = Path(temp_config_dir) / "mcp-config.json"
        with open(mcp_config_file, 'w') as f:
            f.write("{ invalid json }")

        with patch('os.path.exists', return_value=True):
            config = adapter._load_mcp_config()

            assert config == {"mcpServers": {}}

    @pytest.mark.asyncio
    async def test_save_mcp_config_success(self, adapter, temp_config_dir):
        """测试成功保存MCP配置"""
        mcp_config_file = Path(temp_config_dir) / "mcp-config.json"
        adapter.mcp_config_file = str(mcp_config_file)

        test_config = {
            "mcpServers": {
                "test-server": {
                    "command": "python",
                    "args": ["-m", "test"]
                }
            }
        }

        result = await adapter._save_mcp_config(test_config)

        assert result is True
        assert mcp_config_file.exists()

        with open(mcp_config_file, 'r') as f:
            saved_config = json.load(f)

        assert saved_config == test_config

    @pytest.mark.asyncio
    async def test_create_custom_agents(self, adapter, temp_config_dir):
        """测试创建自定义代理"""
        agents_dir = Path(temp_config_dir) / "agents"
        adapter.custom_agents_dir = str(agents_dir)

        result = await adapter._create_custom_agents()

        assert result is True
        assert agents_dir.exists()

        # 检查代理文件是否创建
        agent_file = agents_dir / "cross-cli-caller.json"
        assert agent_file.exists()

        with open(agent_file, 'r') as f:
            agent_config = json.load(f)

        assert agent_config["name"] == "cross-cli-caller"
        assert "cross-CLI integration agent" in agent_config["description"]
        assert "cross_cli_execute" in agent_config["tools"]
        assert agent_config["permissions"]["allowShellExecution"] is True

    @pytest.mark.asyncio
    async def test_handle_cross_cli_execute_success(self, adapter):
        """测试成功处理跨CLI执行请求"""
        # 模拟目标适配器
        mock_target_adapter = AsyncMock()
        mock_target_adapter.is_available.return_value = True
        mock_target_adapter.execute_task.return_value = "Task completed successfully"

        with patch.object(adapter, 'get_adapter', return_value=mock_target_adapter):
            arguments = {
                "target_cli": "claude",
                "task": "Write a Python script"
            }
            context = CopilotMCPContext()

            result = await adapter._handle_cross_cli_execute(arguments, context)

            assert "Write a Python script" in result
            assert "Claude CLI" in result
            assert "Task completed successfully" in result
            assert adapter.cross_cli_calls_count == 1

    @pytest.mark.asyncio
    async def test_handle_cross_cli_execute_missing_parameters(self, adapter):
        """测试处理跨CLI执行请求缺少参数"""
        context = CopilotMCPContext()

        # 测试缺少target_cli
        arguments = {"task": "Write a script"}
        result = await adapter._handle_cross_cli_execute(arguments, context)
        assert "缺少必要参数" in result

        # 测试缺少task
        arguments = {"target_cli": "claude"}
        result = await adapter._handle_cross_cli_execute(arguments, context)
        assert "缺少必要参数" in result

    @pytest.mark.asyncio
    async def test_handle_cross_cli_execute_self_call(self, adapter):
        """测试处理跨CLI执行自我调用"""
        arguments = {
            "target_cli": "copilot",
            "task": "Execute task"
        }
        context = CopilotMCPContext()

        result = await adapter._handle_cross_cli_execute(arguments, context)

        assert "不能自我调用" in result

    @pytest.mark.asyncio
    async def test_handle_cross_cli_execute_target_not_available(self, adapter):
        """测试处理目标CLI不可用的情况"""
        with patch.object(adapter, 'get_adapter', return_value=None):
            arguments = {
                "target_cli": "nonexistent_cli",
                "task": "Test task"
            }
            context = CopilotMCPContext()

            result = await adapter._handle_cross_cli_execute(arguments, context)

            assert "不可用或未安装" in result

    @pytest.mark.asyncio
    async def test_handle_cross_cli_execute_target_unavailable(self, adapter):
        """测试处理目标CLI当前不可用的情况"""
        mock_target_adapter = Mock()
        mock_target_adapter.is_available.return_value = False

        with patch.object(adapter, 'get_adapter', return_value=mock_target_adapter):
            arguments = {
                "target_cli": "claude",
                "task": "Test task"
            }
            context = CopilotMCPContext()

            result = await adapter._handle_cross_cli_execute(arguments, context)

            assert "当前不可用" in result

    @pytest.mark.asyncio
    async def test_handle_cross_cli_execute_exception(self, adapter):
        """测试处理跨CLI执行异常"""
        mock_target_adapter = AsyncMock()
        mock_target_adapter.is_available.return_value = True
        mock_target_adapter.execute_task.side_effect = Exception("Execution failed")

        with patch.object(adapter, 'get_adapter', return_value=mock_target_adapter):
            arguments = {
                "target_cli": "claude",
                "task": "Test task"
            }
            context = CopilotMCPContext()

            result = await adapter._handle_cross_cli_execute(arguments, context)

            assert "跨CLI调用失败" in result
            assert adapter.error_count == 1

    @pytest.mark.asyncio
    async def test_handle_get_available_clis(self, adapter):
        """测试处理获取可用CLI列表请求"""
        # 模拟适配器列表
        mock_adapter1 = Mock()
        mock_adapter1.is_available.return_value = True
        mock_adapter1.version = "1.0.0"
        mock_adapter1.__class__.__name__ = "TestAdapter1"

        mock_adapter2 = Mock()
        mock_adapter2.is_available.return_value = False  # 不可用的适配器

        mock_adapters = {
            "claude": mock_adapter1,
            "gemini": mock_adapter2
        }

        with patch('src.core.base_adapter.get_all_adapters', return_value=mock_adapters):
            context = CopilotMCPContext()

            result = await adapter._handle_get_available_clis(context)

            result_data = json.loads(result)
            assert result_data["total_count"] == 1
            assert len(result_data["available_clis"]) == 1
            assert result_data["available_clis"][0]["name"] == "claude"

    @pytest.mark.asyncio
    async def test_handle_check_cli_status(self, adapter):
        """测试处理检查CLI状态请求"""
        mock_adapter = AsyncMock()
        mock_adapter.is_available.return_value = True
        mock_adapter.health_check.return_value = {"status": "healthy"}
        mock_adapter.get_statistics.return_value = {"calls": 10}

        with patch.object(adapter, 'get_adapter', return_value=mock_adapter):
            arguments = {"cli_name": "claude"}
            context = CopilotMCPContext()

            result = await adapter._handle_check_cli_status(arguments, context)

            result_data = json.loads(result)
            assert result_data["cli_name"] == "claude"
            assert result_data["available"] is True
            assert result_data["health"]["status"] == "healthy"
            assert result_data["statistics"]["calls"] == 10

    @pytest.mark.asyncio
    async def test_handle_check_cli_status_missing_cli_name(self, adapter):
        """测试处理检查CLI状态请求缺少cli_name参数"""
        arguments = {}
        context = CopilotMCPContext()

        result = await adapter._handle_check_cli_status(arguments, context)

        result_data = json.loads(result)
        assert "缺少cli_name参数" in result_data["error"]

    @pytest.mark.asyncio
    async def test_handle_check_cli_status_adapter_not_found(self, adapter):
        """测试处理检查CLI状态时适配器未找到"""
        with patch.object(adapter, 'get_adapter', return_value=None):
            arguments = {"cli_name": "nonexistent"}
            context = CopilotMCPContext()

            result = await adapter._handle_check_cli_status(arguments, context)

            result_data = json.loads(result)
            assert result_data["available"] is False
            assert "适配器未找到" in result_data["reason"]

    @pytest.mark.asyncio
    async def test_on_mcp_tool_call_cross_cli_execute(self, adapter):
        """测试MCP工具调用 - 跨CLI执行"""
        with patch.object(adapter, '_handle_cross_cli_execute', return_value="Success") as mock_handle:
            arguments = {
                "target_cli": "claude",
                "task": "Test task"
            }
            context = CopilotMCPContext()

            result = await adapter.on_mcp_tool_call("cross_cli_execute", arguments, context)

            assert result == "Success"
            mock_handle.assert_called_once_with(arguments, context)
            assert adapter.mcp_calls_count == 1

    @pytest.mark.asyncio
    async def test_on_mcp_tool_call_unknown_tool(self, adapter):
        """测试MCP工具调用 - 未知工具"""
        arguments = {"test": "value"}
        context = CopilotMCPContext()

        result = await adapter.on_mcp_tool_call("unknown_tool", arguments, context)

        assert result is None
        assert adapter.mcp_calls_count == 1

    @pytest.mark.asyncio
    async def test_on_mcp_tool_call_exception(self, adapter):
        """测试MCP工具调用异常"""
        with patch.object(adapter, '_handle_cross_cli_execute', side_effect=Exception("Test error")):
            arguments = {"target_cli": "claude", "task": "Test"}
            context = CopilotMCPContext()

            result = await adapter.on_mcp_tool_call("cross_cli_execute", arguments, context)

            assert result is None
            assert adapter.mcp_calls_count == 1
            assert adapter.error_count == 1

    def test_is_available_not_registered(self, adapter):
        """测试适配器未注册时的可用性检查"""
        adapter.mcp_server_registered = False

        with patch.object(adapter, '_check_copilot_environment', return_value=True):
            assert adapter.is_available() is False

    def test_is_available_environment_check_failure(self, adapter):
        """测试环境检查失败时的可用性检查"""
        adapter.mcp_server_registered = True

        with patch.object(adapter, '_check_copilot_environment', return_value=False):
            assert adapter.is_available() is False

    def test_is_available_success(self, adapter):
        """测试适配器可用性检查成功"""
        adapter.mcp_server_registered = True

        with patch.object(adapter, '_check_copilot_environment', return_value=True):
            assert adapter.is_available() is True

    @pytest.mark.asyncio
    async def test_health_check(self, adapter):
        """测试健康检查"""
        adapter.mcp_server_registered = True
        adapter.mcp_calls_count = 5
        adapter.cross_cli_calls_count = 3
        adapter.processed_requests = [{"test": "request"}]

        with patch.object(adapter, '_check_copilot_environment', return_value=True):
            health = await adapter.health_check()

            assert health["mcp_server_registered"] is True
            assert health["mcp_calls_count"] == 5
            assert health["cross_cli_calls_count"] == 3
            assert health["processed_requests_count"] == 1
            assert health["copilot_environment"] is True

    def test_get_statistics(self, adapter):
        """测试获取统计信息"""
        adapter.mcp_server_registered = True
        adapter.mcp_calls_count = 10
        adapter.cross_cli_calls_count = 7
        adapter.processed_requests = [
            {"type": "cross_cli_execution", "success": True},
            {"type": "cross_cli_execution", "success": False}
        ]

        stats = adapter.get_statistics()

        assert stats["mcp_server_registered"] is True
        assert stats["mcp_calls_count"] == 10
        assert stats["cross_cli_calls_count"] == 7
        assert stats["success_rate"] == 0.5  # 1 success / 2 total
        assert stats["mcp_server_name"] == "cross-cli-adapter"

    def test_calculate_success_rate_no_calls(self, adapter):
        """测试计算成功率 - 无调用"""
        adapter.cross_cli_calls_count = 0

        success_rate = adapter._calculate_success_rate()

        assert success_rate == 1.0

    def test_calculate_success_rate_with_calls(self, adapter):
        """测试计算成功率 - 有调用"""
        adapter.cross_cli_calls_count = 3
        adapter.processed_requests = [
            {"type": "cross_cli_execution", "success": True},
            {"type": "cross_cli_execution", "success": True},
            {"type": "other_type", "success": True}  # 不计入统计
        ]

        success_rate = adapter._calculate_success_rate()

        assert success_rate == 2.0 / 3.0

    def test_get_last_activity_no_requests(self, adapter):
        """测试获取最后活动时间 - 无请求"""
        adapter.processed_requests = []

        last_activity = adapter._get_last_activity()

        assert last_activity is None

    def test_get_last_activity_with_requests(self, adapter):
        """测试获取最后活动时间 - 有请求"""
        timestamp1 = "2023-01-01T10:00:00"
        timestamp2 = "2023-01-01T11:00:00"

        adapter.processed_requests = [
            {"timestamp": timestamp1},
            {"timestamp": timestamp2}
        ]

        last_activity = adapter._get_last_activity()

        assert last_activity == timestamp2

    @pytest.mark.asyncio
    async def test_execute_task_cross_cli_call(self, adapter):
        """测试执行任务 - 跨CLI调用"""
        with patch.object(adapter, '_handle_cross_cli_execute', return_value="Cross-CLI result") as mock_handle:
            task = "use claude to write python code"
            context = {"metadata": {"test": "value"}}

            result = await adapter.execute_task(task, context)

            assert "Cross-CLI result" in result
            mock_handle.assert_called_once()

    @pytest.mark.asyncio
    async def test_execute_task_local_processing(self, adapter):
        """测试执行任务 - 本地处理"""
        task = "local task processing"
        context = {"metadata": {"test": "value"}}

        result = await adapter.execute_task(task, context)

        assert "Copilot MCP适配器本地处理" in result
        assert task in result

    @pytest.mark.asyncio
    async def test_execute_task_exception(self, adapter):
        """测试执行任务异常"""
        with patch.object(adapter, '_handle_cross_cli_execute', side_effect=Exception("Task failed")):
            task = "use claude to write code"
            context = {"metadata": {"test": "value"}}

            result = await adapter.execute_task(task, context)

            assert "任务执行失败" in result
            assert adapter.error_count == 1

    @pytest.mark.asyncio
    async def test_cleanup(self, adapter):
        """测试清理适配器资源"""
        adapter.processed_requests = [{"test": "request"}]
        adapter.agent_executions = [{"test": "agent"}]

        result = await adapter.cleanup()

        assert result is True
        assert len(adapter.processed_requests) == 0
        assert len(adapter.agent_executions) == 0

    def test_format_success_result(self, adapter):
        """测试格式化成功结果"""
        result = adapter._format_success_result("claude", "Write code", "Code written successfully")

        assert "Copilot CLI" in result
        assert "CLAUDE" in result
        assert "Write code" in result
        assert "Code written successfully" in result
        assert "Copilot CLI MCP" in result

    def test_format_error_result(self, adapter):
        """测试格式化错误结果"""
        result = adapter._format_error_result("claude", "Write code", "Tool not available")

        assert "Copilot CLI" in result
        assert "CLAUDE" in result
        assert "Write code" in result
        assert "Tool not available" in result
        assert "跨CLI集成系统" in result


class TestGlobalAdapterFunctions:
    """测试全局适配器函数"""

    def test_get_copilot_mcp_adapter_singleton(self):
        """测试获取Copilot MCP适配器单例"""
        adapter1 = get_copilot_mcp_adapter()
        adapter2 = get_copilot_mcp_adapter()

        assert adapter1 is adapter2
        assert isinstance(adapter1, CopilotMCPAdapter)

    @pytest.mark.asyncio
    async def test_initialize_copilot_adapter_success(self):
        """测试初始化Copilot适配器成功"""
        with patch('src.adapters.copilot.mcp_adapter.get_copilot_mcp_adapter') as mock_get:
            mock_adapter = AsyncMock()
            mock_adapter.initialize.return_value = True
            mock_get.return_value = mock_adapter

            result = await initialize_copilot_adapter()

            assert result is True
            mock_adapter.initialize.assert_called_once()

    @pytest.mark.asyncio
    async def test_initialize_copilot_adapter_failure(self):
        """测试初始化Copilot适配器失败"""
        with patch('src.adapters.copilot.mcp_adapter.get_copilot_mcp_adapter') as mock_get:
            mock_adapter = AsyncMock()
            mock_adapter.initialize.return_value = False
            mock_get.return_value = mock_adapter

            result = await initialize_copilot_adapter()

            assert result is False

    def test_is_copilot_adapter_available_true(self):
        """测试检查Copilot适配器可用性 - 可用"""
        with patch('src.adapters.copilot.mcp_adapter.get_copilot_mcp_adapter') as mock_get:
            mock_adapter = Mock()
            mock_adapter.is_available.return_value = True
            mock_get.return_value = mock_adapter

            result = is_copilot_adapter_available()

            assert result is True

    def test_is_copilot_adapter_available_false(self):
        """测试检查Copilot适配器可用性 - 不可用"""
        with patch('src.adapters.copilot.mcp_adapter.get_copilot_mcp_adapter') as mock_get:
            mock_adapter = Mock()
            mock_adapter.is_available.return_value = False
            mock_get.return_value = mock_adapter

            result = is_copilot_adapter_available()

            assert result is False


class TestEdgeCasesAndErrorHandling:
    """测试边界情况和错误处理"""

    @pytest.mark.asyncio
    async def test_mcp_config_file_permission_error(self, adapter):
        """测试MCP配置文件权限错误"""
        with patch('builtins.open', side_effect=PermissionError("Permission denied")):
            with pytest.raises(Exception):
                await adapter._save_mcp_config({"test": "config"})

    @pytest.mark.asyncio
    async def test_custom_agents_directory_creation_failure(self, adapter):
        """测试自定义代理目录创建失败"""
        with patch('os.makedirs', side_effect=OSError("Directory creation failed")):
            result = await adapter._create_custom_agents()
            assert result is False

    def test_check_copilot_environment_missing_config_dir(self, adapter):
        """测试检查Copilot环境 - 配置目录缺失"""
        with patch('os.path.exists', return_value=False):
            result = adapter._check_copilot_environment()
            assert result is False

    def test_check_copilot_environment_exception(self, adapter):
        """测试检查Copilot环境异常"""
        with patch('os.path.exists', side_effect=Exception("Check failed")):
            with pytest.raises(Exception):
                adapter._check_copilot_environment()

    @pytest.mark.asyncio
    async def test_handle_cross_cli_execute_invalid_arguments_type(self, adapter):
        """测试处理跨CLI执行 - 无效参数类型"""
        arguments = "invalid_string_type"
        context = CopilotMCPContext()

        # 应该不崩溃，返回错误信息
        result = await adapter._handle_cross_cli_execute(arguments, context)

        assert "错误" in result or "失败" in result

    @pytest.mark.asyncio
    async def test_large_task_execution(self, adapter):
        """测试大任务执行"""
        large_task = "Write code " * 1000  # 创建大任务

        # 确保不会因为任务过大而崩溃
        result = await adapter._handle_cross_cli_execute(
            {"target_cli": "claude", "task": large_task},
            CopilotMCPContext()
        )

        assert isinstance(result, str)

    def test_concurrent_access(self, adapter):
        """测试并发访问"""
        import threading
        import time

        results = []

        def check_availability():
            for _ in range(10):
                results.append(adapter.is_available())
                time.sleep(0.01)

        threads = [threading.Thread(target=check_availability) for _ in range(3)]

        for thread in threads:
            thread.start()

        for thread in threads:
            thread.join()

        # 所有调用应该都返回相同的结果（False，因为未初始化）
        assert all(result == False for result in results)


if __name__ == "__main__":
    # 运行测试
    pytest.main([__file__, "-v"])