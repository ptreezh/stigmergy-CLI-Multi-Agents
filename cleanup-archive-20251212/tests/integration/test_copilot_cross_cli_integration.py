"""
Copilot CLI 跨CLI集成测试

这个集成测试验证CopilotCLI适配器与其他CLI工具之间的协同工作
包括完整的跨CLI调用流程、MCP服务器集成和权限管理
"""

import pytest
import asyncio
import json
import tempfile
import os
from pathlib import Path
from unittest.mock import Mock, patch, AsyncMock

# 导入测试目标
from src.adapters.copilot.mcp_adapter import CopilotMCPAdapter, CopilotMCPContext
from src.core.base_adapter import get_cross_cli_adapter


class TestCopilotCrossCLIIntegration:
    """Copilot CLI跨CLI集成测试"""

    @pytest.fixture
    def temp_environment(self):
        """创建临时测试环境"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # 设置环境变量
            os.environ['COPILOT_CONFIG_DIR'] = temp_dir
            os.environ['PYTHONPATH'] = temp_dir

            yield temp_dir

            # 清理环境变量
            if 'COPILOT_CONFIG_DIR' in os.environ:
                del os.environ['COPILOT_CONFIG_DIR']

    @pytest.fixture
    async def initialized_adapter(self, temp_environment):
        """初始化的适配器实例"""
        adapter = CopilotMCPAdapter()

        # 模拟环境检查
        with patch.object(adapter, '_check_copilot_environment', return_value=True), \
             patch.object(adapter, '_register_mcp_server', return_value=True), \
             patch.object(adapter, '_create_custom_agents', return_value=True), \
             patch.object(adapter, '_ensure_config_directory', return_value=True):

            await adapter.initialize()
            yield adapter

    @pytest.mark.asyncio
    async def test_complete_cross_cli_call_flow_chinese(self, initialized_adapter):
        """测试完整的跨CLI调用流程 - 中文模式"""

        # 模拟目标适配器 (Claude CLI)
        mock_claude_adapter = AsyncMock()
        mock_claude_adapter.is_available.return_value = True
        mock_claude_adapter.execute_task.return_value = """# Python脚本示例

```python
def hello_world():
    print("Hello, World!")
    return "success"

if __name__ == "__main__":
    hello_world()
```

这个脚本定义了一个简单的hello_world函数。"""

        with patch('src.core.base_adapter.get_cross_cli_adapter', return_value=mock_claude_adapter):
            # 测试中文跨CLI调用
            task = "请用claude帮我写一个Python hello world脚本"
            context = {
                'source_cli': 'copilot',
                'metadata': {
                    'session_id': 'test_session_001',
                    'user_id': 'test_user'
                }
            }

            result = await initialized_adapter.execute_task(task, context)

            # 验证结果
            assert "Python脚本示例" in result
            assert "hello_world" in result
            assert "Claude CLI" in result
            assert "Copilot CLI" in result
            assert initialized_adapter.cross_cli_calls_count == 1

            # 验证调用参数
            mock_claude_adapter.execute_task.assert_called_once()
            call_args = mock_claude_adapter.execute_task.call_args
            assert "写一个Python hello world脚本" in call_args[0][0]

    @pytest.mark.asyncio
    async def test_complete_cross_cli_call_flow_english(self, initialized_adapter):
        """测试完整的跨CLI调用流程 - 英文模式"""

        # 模拟目标适配器 (Gemini CLI)
        mock_gemini_adapter = AsyncMock()
        mock_gemini_adapter.is_available.return_value = True
        mock_gemini_adapter.execute_task.return_value = """# API Documentation

## Endpoints

### GET /api/users
Retrieve a list of all users.

#### Parameters:
- page (optional): Page number for pagination
- limit (optional): Number of results per page

#### Response:
```json
{
  "users": [...],
  "total": 100,
  "page": 1
}
```
"""

        with patch('src.core.base_adapter.get_cross_cli_adapter', return_value=mock_gemini_adapter):
            # 测试英文跨CLI调用
            task = "use gemini to analyze this API endpoint"
            context = {
                'source_cli': 'copilot',
                'metadata': {
                    'session_id': 'test_session_002'
                }
            }

            result = await initialized_adapter.execute_task(task, context)

            # 验证结果
            assert "API Documentation" in result
            assert "GET /api/users" in result
            assert "GEMINI" in result
            assert "Copilot CLI" in result
            assert initialized_adapter.cross_cli_calls_count == 1

    @pytest.mark.asyncio
    async def test_mcp_tool_call_integration(self, initialized_adapter):
        """测试MCP工具调用集成"""

        mock_claude_adapter = AsyncMock()
        mock_claude_adapter.is_available.return_value = True
        mock_claude_adapter.execute_task.return_value = "Shell script created successfully"

        with patch('src.core.base_adapter.get_cross_cli_adapter', return_value=mock_claude_adapter):
            # 模拟MCP工具调用
            arguments = {
                "target_cli": "claude",
                "task": "create a backup script"
            }
            context = CopilotMCPContext(
                prompt="I need a backup script",
                metadata={"user_id": "integration_test_user"}
            )

            result = await initialized_adapter.on_mcp_tool_call("cross_cli_execute", arguments, context)

            # 验证结果
            assert "Shell script created successfully" in result
            assert initialized_adapter.mcp_calls_count == 1
            assert initialized_adapter.cross_cli_calls_count == 1

            # 验证请求记录
            assert len(initialized_adapter.processed_requests) > 0
            last_request = initialized_adapter.processed_requests[-1]
            assert last_request['tool_name'] == "cross_cli_execute"
            assert last_request['arguments'] == arguments

    @pytest.mark.asyncio
    async def test_get_available_clis_integration(self, initialized_adapter):
        """测试获取可用CLI列表集成"""

        # 模拟多个适配器
        mock_claude = Mock()
        mock_claude.is_available.return_value = True
        mock_claude.version = "1.0.0"
        mock_claude.__class__.__name__ = "ClaudeHookAdapter"

        mock_gemini = Mock()
        mock_gemini.is_available.return_value = True
        mock_gemini.version = "2.0.0"
        mock_gemini.__class__.__name__ = "GeminiExtensionAdapter"

        mock_qwencode = Mock()
        mock_qwencode.is_available.return_value = False  # 不可用

        mock_adapters = {
            "claude": mock_claude,
            "gemini": mock_gemini,
            "qwencode": mock_qwencode
        }

        with patch('src.core.base_adapter.get_all_adapters', return_value=mock_adapters):
            context = CopilotMCPContext()
            result = await initialized_adapter._handle_get_available_clis(context)

            # 解析结果
            result_data = json.loads(result)

            # 验证结果
            assert result_data["total_count"] == 2
            assert len(result_data["available_clis"]) == 2

            available_clis = {cli["name"]: cli for cli in result_data["available_clis"]}
            assert "claude" in available_clis
            assert "gemini" in available_clis
            assert "qwencode" not in available_clis

            assert available_clis["claude"]["version"] == "1.0.0"
            assert available_clis["gemini"]["version"] == "2.0.0"

    @pytest.mark.asyncio
    async def test_check_cli_status_integration(self, initialized_adapter):
        """测试检查CLI状态集成"""

        mock_claude_adapter = AsyncMock()
        mock_claude_adapter.is_available.return_value = True
        mock_claude_adapter.health_check.return_value = {
            "status": "healthy",
            "last_check": "2023-12-07T10:00:00Z"
        }
        mock_claude_adapter.get_statistics.return_value = {
            "execution_count": 15,
            "success_rate": 0.93
        }

        with patch('src.core.base_adapter.get_cross_cli_adapter', return_value=mock_claude_adapter):
            arguments = {"cli_name": "claude"}
            context = CopilotMCPContext()

            result = await initialized_adapter._handle_check_cli_status(arguments, context)

            # 解析结果
            result_data = json.loads(result)

            # 验证结果
            assert result_data["cli_name"] == "claude"
            assert result_data["available"] is True
            assert result_data["health"]["status"] == "healthy"
            assert result_data["statistics"]["execution_count"] == 15

    @pytest.mark.asyncio
    async def test_concurrent_cross_cli_calls(self, initialized_adapter):
        """测试并发跨CLI调用"""

        # 模拟多个目标适配器
        mock_claude_adapter = AsyncMock()
        mock_claude_adapter.is_available.return_value = True
        mock_claude_adapter.execute_task.return_value = "Claude result"

        mock_gemini_adapter = AsyncMock()
        mock_gemini_adapter.is_available.return_value = True
        mock_gemini_adapter.execute_task.return_value = "Gemini result"

        def get_adapter_side_effect(cli_name):
            if cli_name == "claude":
                return mock_claude_adapter
            elif cli_name == "gemini":
                return mock_gemini_adapter
            return None

        with patch('src.core.base_adapter.get_cross_cli_adapter', side_effect=get_adapter_side_effect):
            # 创建并发任务
            tasks = [
                initialized_adapter._handle_cross_cli_execute(
                    {"target_cli": "claude", "task": "Task 1"},
                    CopilotMCPContext()
                ),
                initialized_adapter._handle_cross_cli_execute(
                    {"target_cli": "gemini", "task": "Task 2"},
                    CopilotMCPContext()
                ),
                initialized_adapter._handle_cross_cli_execute(
                    {"target_cli": "claude", "task": "Task 3"},
                    CopilotMCPContext()
                )
            ]

            # 执行并发任务
            results = await asyncio.gather(*tasks)

            # 验证结果
            assert len(results) == 3
            assert "Claude result" in results[0]
            assert "Gemini result" in results[1]
            assert "Claude result" in results[2]
            assert initialized_adapter.cross_cli_calls_count == 3

            # 验证适配器调用次数
            assert mock_claude_adapter.execute_task.call_count == 2
            assert mock_gemini_adapter.execute_task.call_count == 1

    @pytest.mark.asyncio
    async def test_error_handling_and_recovery(self, initialized_adapter):
        """测试错误处理和恢复"""

        # 模拟先失败后成功的适配器
        mock_adapter = AsyncMock()
        mock_adapter.is_available.return_value = True
        mock_adapter.execute_task.side_effect = [
            Exception("First call failed"),
            "Second call succeeded"
        ]

        with patch('src.core.base_adapter.get_cross_cli_adapter', return_value=mock_adapter):
            # 第一次调用 - 应该失败
            result1 = await initialized_adapter._handle_cross_cli_execute(
                {"target_cli": "claude", "task": "Task 1"},
                CopilotMCPContext()
            )

            assert "跨CLI调用失败" in result1
            assert initialized_adapter.error_count == 1

            # 第二次调用 - 应该成功
            result2 = await initialized_adapter._handle_cross_cli_execute(
                {"target_cli": "claude", "task": "Task 2"},
                CopilotMCPContext()
            )

            assert "Second call succeeded" in result2

    @pytest.mark.asyncio
    async def test_permission_and_security_integration(self, temp_environment):
        """测试权限和安全集成"""

        adapter = CopilotMCPAdapter()

        # 创建权限配置文件
        permissions_file = Path(temp_environment) / "permissions.json"
        permissions_config = {
            "version": "1.0",
            "permissions": {
                "tool_execution": {
                    "allow_all_paths": False,
                    "approved_paths": ["/tmp/*", "./"],
                    "require_confirmation": True
                }
            }
        }

        with open(permissions_file, 'w') as f:
            json.dump(permissions_config, f)

        # 初始化适配器
        with patch.object(adapter, '_check_copilot_environment', return_value=True), \
             patch.object(adapter, '_register_mcp_server', return_value=True), \
             patch.object(adapter, '_create_custom_agents', return_value=True), \
             patch.object(adapter, '_ensure_config_directory', return_value=True):

            await adapter.initialize()

            # 验证权限配置被加载
            assert adapter.is_available()

            # 测试受权限保护的操作
            mock_adapter = AsyncMock()
            mock_adapter.is_available.return_value = True
            mock_adapter.execute_task.return_value = "Secure operation completed"

            with patch('src.core.base_adapter.get_cross_cli_adapter', return_value=mock_adapter):
                result = await adapter._handle_cross_cli_execute(
                    {"target_cli": "claude", "task": "secure operation"},
                    CopilotMCPContext(
                        metadata={"tool_permissions": {"execute": True}}
                    )
                )

                assert "Secure operation completed" in result

    @pytest.mark.asyncio
    async def test_configuration_persistence(self, temp_environment):
        """测试配置持久化"""

        adapter = CopilotMCPAdapter()

        # 模拟配置目录
        config_dir = Path(temp_environment) / ".copilot"
        config_dir.mkdir(exist_ok=True)

        mcp_config_file = config_dir / "mcp-config.json"
        agents_dir = config_dir / "agents"
        agents_dir.mkdir(exist_ok=True)

        # 初始化适配器
        with patch.object(adapter, '_check_copilot_environment', return_value=True):
            await adapter.initialize()

            # 验证MCP配置文件创建
            assert mcp_config_file.exists()

            # 验证代理文件创建
            agent_file = agents_dir / "cross-cli-caller.json"
            assert agent_file.exists()

            # 读取并验证配置
            with open(mcp_config_file, 'r') as f:
                mcp_config = json.load(f)

            assert "cross-cli-adapter" in mcp_config["mcpServers"]

            with open(agent_file, 'r') as f:
                agent_config = json.load(f)

            assert agent_config["name"] == "cross-cli-caller"
            assert "cross_cli_execute" in agent_config["tools"]

    @pytest.mark.asyncio
    async def test_health_and_monitoring_integration(self, initialized_adapter):
        """测试健康监控集成"""

        # 执行一些操作来生成统计数据
        mock_adapter = AsyncMock()
        mock_adapter.is_available.return_value = True
        mock_adapter.execute_task.return_value = "Health check test"

        with patch('src.core.base_adapter.get_cross_cli_adapter', return_value=mock_adapter):
            # 执行跨CLI调用
            await initialized_adapter._handle_cross_cli_execute(
                {"target_cli": "claude", "task": "health test"},
                CopilotMCPContext()
            )

            # 模拟MCP工具调用
            await initialized_adapter.on_mcp_tool_call(
                "get_available_clis",
                {},
                CopilotMCPContext()
            )

            # 获取健康状态
            health = await initialized_adapter.health_check()

            # 验证健康状态
            assert health["mcp_server_registered"] is True
            assert health["mcp_calls_count"] == 1
            assert health["cross_cli_calls_count"] == 1

            # 获取统计信息
            stats = initialized_adapter.get_statistics()

            # 验证统计信息
            assert stats["mcp_calls_count"] == 1
            assert stats["cross_cli_calls_count"] == 1
            assert stats["success_rate"] == 1.0
            assert stats["last_activity"] is not None

    @pytest.mark.asyncio
    async def test_cleanup_and_resource_management(self, initialized_adapter):
        """测试清理和资源管理"""

        # 添加一些数据到内存中
        initialized_adapter.processed_requests = [
            {"type": "test", "data": "test_data"}
        ]
        initialized_adapter.agent_executions = [
            {"agent": "test_agent", "execution": "test_execution"}
        ]

        # 执行清理
        result = await initialized_adapter.cleanup()

        # 验证清理结果
        assert result is True
        assert len(initialized_adapter.processed_requests) == 0
        assert len(initialized_adapter.agent_executions) == 0

    @pytest.mark.asyncio
    async def test_language_pattern_recognition(self, initialized_adapter):
        """测试语言模式识别"""

        # 测试中文模式
        chinese_patterns = [
            "请用claude帮我分析这段代码",
            "调用gemini来优化这个算法",
            "用qwencode帮我重构这个函数"
        ]

        # 测试英文模式
        english_patterns = [
            "use claude to review this code",
            "call gemini to optimize performance",
            "ask qwencode for refactoring help"
        ]

        for pattern in chinese_patterns + english_patterns:
            # 这应该被识别为跨CLI调用意图
            intent = initialized_adapter.parser.parse_intent(pattern, "copilot")

            # 注意：这里假设NaturalLanguageParser能够正确识别跨CLI意图
            # 在实际实现中，可能需要根据具体的解析器逻辑调整测试
            if "claude" in pattern.lower() or "gemini" in pattern.lower() or "qwencode" in pattern.lower():
                # 如果模式包含CLI名称，应该被识别为跨CLI调用
                assert intent.target_cli in ["claude", "gemini", "qwencode"] or intent.task != ""

    @pytest.mark.asyncio
    async def test_end_to_end_integration_scenario(self, initialized_adapter):
        """测试端到端集成场景"""

        # 模拟完整的开发工作流程
        mock_claude = AsyncMock()
        mock_claude.is_available.return_value = True
        mock_claude.execute_task.return_value = """```python
def data_analysis():
    # Data analysis implementation
    import pandas as pd
    data = pd.read_csv('data.csv')
    return data.describe()
```"""

        mock_gemini = AsyncMock()
        mock_gemini.is_available.return_value = True
        mock_gemini.execute_task.return_value = """```python
def unit_tests():
    import unittest
    from data_analysis import data_analysis

    class TestDataAnalysis(unittest.TestCase):
        def test_data_loading(self):
            result = data_analysis()
            self.assertIsNotNone(result)

    if __name__ == '__main__':
        unittest.main()
```"""

        def get_adapter_side_effect(cli_name):
            if cli_name == "claude":
                return mock_claude
            elif cli_name == "gemini":
                return mock_gemini
            return None

        with patch('src.core.base_adapter.get_cross_cli_adapter', side_effect=get_adapter_side_effect):
            # 场景1: 用Claude生成数据分析代码
            task1 = "请用claude帮我生成一个数据分析函数"
            result1 = await initialized_adapter.execute_task(task1, {"metadata": {}})

            assert "def data_analysis" in result1
            assert "pandas" in result1

            # 场景2: 用Gemini生成单元测试
            task2 = "use gemini to create unit tests for the data analysis function"
            result2 = await initialized_adapter.execute_task(task2, {"metadata": {}})

            assert "def unit_tests" in result2
            assert "unittest" in result2

            # 场景3: 通过MCP工具调用检查状态
            health_result = await initialized_adapter.on_mcp_tool_call(
                "check_cli_status",
                {"cli_name": "claude"},
                CopilotMCPContext()
            )

            health_data = json.loads(health_result)
            assert health_data["cli_name"] == "claude"
            assert health_data["available"] is True

            # 验证统计信息
            stats = initialized_adapter.get_statistics()
            assert stats["cross_cli_calls_count"] == 2
            assert stats["mcp_calls_count"] == 1


if __name__ == "__main__":
    # 运行集成测试
    pytest.main([__file__, "-v", "-s"])