"""
Codex CLI适配器单元测试 - TDD驱动实现
先写测试，再实现适配器代码

基于Codex CLI的斜杠命令扩展系统进行测试设计
"""

import pytest
import asyncio
import json
import tempfile
import os
from unittest.mock import Mock, AsyncMock, patch, MagicMock, mock_open
from typing import Dict, Any, Optional

from src.core.base_adapter import BaseCrossCLIAdapter, IntentResult


class MockCodexCommandContext:
    """Mock Codex CLI 命令上下文"""
    def __init__(self, command: str = "", args: list = None, metadata: Optional[Dict] = None):
        self.command = command
        self.args = args or []
        self.metadata = metadata or {}
        self.session_id = self.metadata.get('session_id', 'test_session')
        self.user_id = self.metadata.get('user_id', 'test_user')
        self.input_text = self.metadata.get('input_text', '')
        self.output_format = self.metadata.get('output_format', 'text')


class TestCodexSlashCommandAdapterTDD:
    """Codex 斜杠命令适配器TDD测试 - 遵循测试先行的原则"""

    @pytest.fixture
    def mock_adapter_class(self):
        """Mock适配器类用于TDD"""
        class CodexSlashCommandAdapter(BaseCrossCLIAdapter):
            def __init__(self, cli_name: str):
                super().__init__(cli_name)
                self.extension_registered = False
                self.custom_commands = {}
                self.processed_commands = []
                self.cross_cli_calls = []
                self.command_calls_count = 0
                self.cross_cli_calls_count = 0

            async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
                """模拟执行跨CLI任务"""
                self.command_calls_count += 1

                # 检查是否为跨CLI调用命令
                if task.startswith('/x '):
                    self.cross_cli_calls_count += 1
                    parts = task[3:].strip().split(' ', 1)
                    if len(parts) == 2:
                        target_cli, task_content = parts
                        result = await self._execute_cross_cli_call(target_cli, task_content, context)
                        return result

                return f"[Codex → 处理完成]\n模拟执行: {task}"

            def is_available(self) -> bool:
                """模拟可用性检查"""
                return self.extension_registered and bool(self.custom_commands)

            async def register_extension(self):
                """模拟扩展注册"""
                self.extension_registered = True
                self.custom_commands = {
                    '/x': self._handle_cross_cli_command,
                    '/help-x': self._handle_help_command,
                    '/status-x': self._handle_status_command
                }

            async def _execute_cross_cli_call(self, target_cli: str, task: str, context: Dict[str, Any]) -> str:
                """执行跨CLI调用"""
                self.processed_commands.append({
                    'type': 'cross_cli_execution',
                    'target_cli': target_cli,
                    'task': task,
                    'success': True,
                    'timestamp': asyncio.get_event_loop().time()
                })

                return f"""## 🔗 跨CLI调用结果

**源工具**: Codex CLI
**目标工具**: {target_cli.upper()}
**原始任务**: {task}
**执行时间**: 模拟时间

---

模拟执行结果: {task}

---

*此结果由跨CLI集成系统通过 Codex CLI 斜杠命令提供*"""

            async def _handle_cross_cli_command(self, args: list, context: MockCodexCommandContext) -> str:
                """处理跨CLI命令"""
                if len(args) < 2:
                    return """❌ 使用方法不正确

**正确用法**:
```
/x <CLI工具> <任务描述>
```

**示例**:
```
/x claude 帮我分析这段代码
/x gemini 生成一个Python函数
/x qwencode 重构这个组件
```

使用 `/help-x` 查看完整帮助信息。"""

                target_cli = args[0].lower()
                task = ' '.join(args[1:])
                return await self._execute_cross_cli_call(target_cli, task, {})

            async def _handle_help_command(self, args: list, context: MockCodexCommandContext) -> str:
                """处理帮助命令"""
                return """## 🔗 跨CLI集成系统帮助

### 基本用法
```
/x <CLI工具> <任务描述>
```

### 支持的CLI工具
- `claude` - Claude CLI
- `gemini` - Gemini CLI
- `qwencode` - QwenCode CLI

### 示例
```bash
# 使用Claude分析代码
/x claude 分析这个Python函数的性能问题

# 使用Gemini生成测试
/x gemini 为这个组件写单元测试
```

---
*由跨CLI集成系统提供支持*"""

            async def _handle_status_command(self, args: list, context: MockCodexCommandContext) -> str:
                """处理状态命令"""
                return f"""## 📊 跨CLI适配器状态

**适配器**: Codex CLI 斜杠命令适配器
**版本**: 1.0.0
**状态**: healthy
**扩展注册**: ✅ 已注册

### 统计信息
- 命令调用次数: {self.command_calls_count}
- 跨CLI调用次数: {self.cross_cli_calls_count}
- 成功率: 100.0%
- 错误次数: 0

---
*状态更新时间: 模拟时间*"""

        return CodexSlashCommandAdapter

    @pytest.mark.asyncio
    async def test_adapter_initialization(self, mock_adapter_class):
        """测试适配器初始化"""
        adapter = mock_adapter_class("codex")

        # 验证基本属性
        assert adapter.cli_name == "codex"
        assert adapter.version == "1.0.0"
        assert adapter.execution_count == 0
        assert adapter.error_count == 0
        assert not adapter.extension_registered
        assert not adapter.custom_commands

    @pytest.mark.asyncio
    async def test_extension_registration(self, mock_adapter_class):
        """测试扩展注册功能"""
        adapter = mock_adapter_class("codex")

        # 注册扩展
        await adapter.register_extension()

        # 验证注册结果
        assert adapter.extension_registered
        assert '/x' in adapter.custom_commands
        assert '/help-x' in adapter.custom_commands
        assert '/status-x' in adapter.custom_commands
        assert adapter.is_available()

    @pytest.mark.asyncio
    async def test_cross_cli_command_parsing(self, mock_adapter_class):
        """测试跨CLI命令解析"""
        adapter = mock_adapter_class("codex")
        await adapter.register_extension()

        # 测试跨CLI命令
        result = await adapter.execute_task("/x claude 帮我写一个Python函数", {})

        assert "跨CLI调用结果" in result
        assert "CLAUDE" in result
        assert "帮我写一个Python函数" in result
        assert adapter.cross_cli_calls_count == 1
        assert len(adapter.processed_commands) == 1

    @pytest.mark.asyncio
    async def test_help_command(self, mock_adapter_class):
        """测试帮助命令"""
        adapter = mock_adapter_class("codex")
        await adapter.register_extension()

        # 测试帮助命令
        result = await adapter.execute_task("/help-x", {})

        assert "跨CLI集成系统帮助" in result
        assert "基本用法" in result
        assert "/x <CLI工具> <任务描述>" in result
        assert "支持的CLI工具" in result

    @pytest.mark.asyncio
    async def test_status_command(self, mock_adapter_class):
        """测试状态命令"""
        adapter = mock_adapter_class("codex")
        await adapter.register_extension()

        # 执行一些操作来生成统计数据
        await adapter.execute_task("/x claude test task", {})

        # 测试状态命令
        result = await adapter.execute_task("/status-x", {})

        assert "跨CLI适配器状态" in result
        assert "Codex CLI 斜杠命令适配器" in result
        assert "命令调用次数: 1" in result
        assert "跨CLI调用次数: 1" in result

    @pytest.mark.asyncio
    async def test_invalid_cross_cli_command(self, mock_adapter_class):
        """测试无效的跨CLI命令"""
        adapter = mock_adapter_class("codex")
        await adapter.register_extension()

        # 测试参数不足的命令
        result = await adapter.execute_task("/x", {})

        assert "使用方法不正确" in result
        assert "正确用法" in result

    @pytest.mark.asyncio
    async def test_natural_language_cross_cli_detection(self, mock_adapter_class):
        """测试自然语言跨CLI调用检测"""
        adapter = mock_adapter_class("codex")
        await adapter.register_extension()

        # 模拟解析器检测到跨CLI意图
        with patch('src.core.parser.NaturalLanguageParser') as mock_parser:
            mock_intent = Mock()
            mock_intent.is_cross_cli = True
            mock_intent.target_cli = "gemini"
            mock_intent.task = "分析这段代码"

            mock_parser_instance = Mock()
            mock_parser_instance.parse_intent.return_value = mock_intent
            mock_parser.return_value = mock_parser_instance

            # 这个功能需要在真实实现中完善
            # result = await adapter.execute_task("请用Gemini帮我分析这段代码", {})
            # assert "跨CLI调用结果" in result

    @pytest.mark.asyncio
    async def test_error_handling(self, mock_adapter_class):
        """测试错误处理"""
        adapter = mock_adapter_class("codex")

        # 测试未注册扩展时的处理
        result = await adapter.execute_task("/x claude test", {})
        assert "处理完成" in result  # 应该回退到本地处理

        # 测试错误统计
        assert adapter.execution_count == 1

    def test_statistics_tracking(self, mock_adapter_class):
        """测试统计信息跟踪"""
        adapter = mock_adapter_class("codex")

        # 初始统计
        stats = adapter.get_statistics()
        assert stats['execution_count'] == 0
        assert stats['error_count'] == 0
        assert stats['success_rate'] == 1.0

    @pytest.mark.asyncio
    async def test_health_check(self, mock_adapter_class):
        """测试健康检查"""
        adapter = mock_adapter_class("codex")

        # 未注册时的健康检查
        health = await adapter.health_check()
        assert health['cli_name'] == "codex"
        assert health['available'] == False
        assert health['status'] == "unavailable"

        # 注册后的健康检查
        await adapter.register_extension()
        health = await adapter.health_check()
        assert health['available'] == True
        assert health['status'] == "healthy"

    @pytest.mark.asyncio
    async def test_command_context_handling(self):
        """测试命令上下文处理"""
        from src.adapters.codex.slash_command_adapter import CodexCommandContext

        # 测试基本上下文创建
        context = CodexCommandContext(
            command="/x claude test",
            args=["claude", "test"],
            metadata={"session_id": "test123", "user_id": "user456"}
        )

        assert context.command == "/x claude test"
        assert context.args == ["claude", "test"]
        assert context.session_id == "test123"
        assert context.user_id == "user456"

    @pytest.mark.asyncio
    async def test_config_loading(self):
        """测试配置加载"""
        from src.adapters.codex.slash_command_adapter import CodexSlashCommandAdapter

        # Mock配置文件
        mock_config = {
            "version": "1.0.0",
            "cli_name": "codex",
            "extension_type": "slash_command",
            "integration_settings": {
                "enable_cross_cli": True,
                "cross_cli_prefix": "/x",
                "max_response_length": 4000,
                "timeout": 30000
            }
        }

        with patch("builtins.open", mock_open(read_data=json.dumps(mock_config))):
            with patch("os.path.exists", return_value=True):
                adapter = CodexSlashCommandAdapter("codex")
                config = adapter._load_adapter_config()

                assert config["cli_name"] == "codex"
                assert config["integration_settings"]["cross_cli_prefix"] == "/x"
                assert config["integration_settings"]["max_response_length"] == 4000

    @pytest.mark.asyncio
    async def test_environment_check(self):
        """测试环境检查"""
        from src.adapters.codex.slash_command_adapter import CodexSlashCommandAdapter

        adapter = CodexSlashCommandAdapter("codex")

        # Mock成功的环境检查
        with patch("subprocess.run") as mock_run:
            mock_process = Mock()
            mock_process.returncode = 0
            mock_process.stdout = "codex version 1.0.0"
            mock_run.return_value = mock_process

            result = adapter._check_codex_environment()
            assert result == True

        # Mock失败的环境检查
        with patch("subprocess.run") as mock_run:
            mock_run.side_effect = FileNotFoundError()

            result = adapter._check_codex_environment()
            assert result == False

    @pytest.mark.asyncio
    async def test_response_formatting(self):
        """测试响应格式化"""
        from src.adapters.codex.slash_command_adapter import CodexSlashCommandAdapter

        adapter = CodexSlashCommandAdapter("codex")

        # 测试成功响应格式化
        result = adapter._format_success_result("claude", "测试任务", "执行结果内容")

        assert "跨CLI调用结果" in result
        assert "Codex CLI" in result
        assert "CLAUDE" in result
        assert "测试任务" in result
        assert "执行结果内容" in result

        # 测试错误响应格式化
        error_result = adapter._format_error_result("gemini", "失败任务", "错误信息")

        assert "跨CLI调用失败" in error_result
        assert "Codex CLI" in error_result
        assert "GEMINI" in error_result
        assert "失败任务" in error_result
        assert "错误信息" in error_result

    @pytest.mark.asyncio
    async def test_response_length_limiting(self):
        """测试响应长度限制"""
        from src.adapters.codex.slash_command_adapter import CodexSlashCommandAdapter

        adapter = CodexSlashCommandAdapter("codex")

        # 创建一个很长的响应
        long_response = "x" * 5000

        # 设置较短的限制
        adapter.adapter_config = {
            "integration_settings": {
                "max_response_length": 100
            }
        }

        result = adapter._format_success_result("claude", "测试", long_response)

        # 验证响应被截断
        assert len(result) < len(long_response)
        assert "结果已截断" in result


class TestCodexAdapterIntegration:
    """Codex适配器集成测试"""

    @pytest.mark.asyncio
    async def test_full_cross_cli_workflow(self):
        """测试完整的跨CLI工作流程"""
        # 这里可以测试与其他适配器的集成
        # 需要模拟整个适配器工厂和其他适配器
        pass

    @pytest.mark.asyncio
    async def test_extension_config_persistence(self):
        """测试扩展配置持久化"""
        # 测试配置文件的保存和加载
        pass

    def test_adapter_factory_integration(self):
        """测试适配器工厂集成"""
        # 测试适配器能否正确集成到工厂系统中
        pass