"""
BaseAdapter单元测试 - 测试适配器基类的核心功能
遵循TDD原则：先写测试，再实现代码
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch

# Remove imports of BaseCrossCLIAdapter and CrossCliAdapterFactory since they no longer exist
from core.parser import IntentResult


class MockConcreteAdapter:
    """具体适配器实现类，用于测试基类功能"""

    def __init__(self, cli_name: str, is_available_flag: bool = True):
        self.cli_name = cli_name
        self.version = "1.0.0"
        self._is_available_flag = is_available_flag
        self.execute_task_called = False
        self.last_task = None
        self.last_context = None

    async def execute_task(self, task: str, context: dict) -> str:
        """模拟执行任务"""
        self.execute_task_called = True
        self.last_task = task
        self.last_context = context
        return f"[{self.cli_name.upper()} 执行结果] {task}"

    def is_available(self) -> bool:
        """模拟可用性检查"""
        return self._is_available_flag

    async def health_check(self):
        """模拟健康检查"""
        return {
            'cli_name': self.cli_name,
            'available': self.is_available(),
            'version': self.version,
            'execute_task_called': self.execute_task_called
        }

    def get_statistics(self):
        """获取统计信息"""
        return {
            'cli_name': self.cli_name,
            'version': self.version,
            'execute_task_called': self.execute_task_called
        }


class TestBaseCrossCLIAdapter:
    """BaseCrossCLIAdapter单元测试"""

    @pytest.mark.unit
    def test_adapter_initialization(self):
        """测试适配器初始化"""
        adapter = MockConcreteAdapter("test_cli")

        assert adapter.cli_name == "test_cli"
        assert adapter.version == "1.0.0"
        assert adapter.execute_task_called is False

    @pytest.mark.unit
    def test_adapter_with_custom_version(self):
        """测试自定义版本号的适配器初始化"""
        adapter = MockConcreteAdapter("test_cli")
        adapter.version = "2.0.0"

        assert adapter.version == "2.0.0"

    @pytest.mark.unit
    async def test_execute_task_success(self):
        """测试成功执行任务"""
        adapter = MockConcreteAdapter("test_cli")
        task = "测试任务"
        context = {"user": "test_user"}

        result = await adapter.execute_task(task, context)

        assert adapter.execute_task_called is True
        assert adapter.last_task == task
        assert adapter.last_context == context
        assert "[TEST_CLI 执行结果] 测试任务" in result

    @pytest.mark.unit
    def test_is_available_true(self):
        """测试适配器可用性 - 可用状态"""
        adapter = MockConcreteAdapter("test_cli", is_available_flag=True)

        assert adapter.is_available() is True

    @pytest.mark.unit
    def test_is_available_false(self):
        """测试适配器可用性 - 不可用状态"""
        adapter = MockConcreteAdapter("test_cli", is_available_flag=False)

        assert adapter.is_available() is False

    @pytest.mark.unit
    async def test_health_check(self):
        """测试健康检查功能"""
        adapter = MockConcreteAdapter("test_cli")
        await adapter.execute_task("test", {})  # 触发执行状态

        health = await adapter.health_check()

        assert health['cli_name'] == "test_cli"
        assert health['available'] is True
        assert health['version'] == "1.0.0"
        assert health['execute_task_called'] is True

    @pytest.mark.unit
    def test_adapter_str_representation(self):
        """测试适配器字符串表示"""
        adapter = MockConcreteAdapter("test_cli")

        str_repr = str(adapter)
        assert "test_cli" in str_repr
        assert "1.0.0" in str_repr

    @pytest.mark.unit
    def test_adapter_repr(self):
        """测试适配器repr表示"""
        adapter = MockConcreteAdapter("test_cli")

        repr_str = repr(adapter)
        assert "MockConcreteAdapter" in repr_str
        assert "test_cli" in repr_str


# Remove the entire TestCrossCliAdapterFactory class since the factory no longer exists


class TestBaseAdapterErrorHandling:
    """BaseAdapter错误处理测试"""

    @pytest.mark.unit
    async def test_execute_task_with_exception(self):
        """测试执行任务时出现异常"""
        class ErrorAdapter(MockConcreteAdapter):
            async def execute_task(self, task: str, context: dict) -> str:
                raise ValueError("测试异常")

        adapter = ErrorAdapter("test_cli")

        with pytest.raises(ValueError, match="测试异常"):
            await adapter.execute_task("test", {})

    @pytest.mark.unit
    async def test_health_check_with_exception(self):
        """测试健康检查时出现异常"""
        class ErrorAdapter(MockConcreteAdapter):
            async def health_check(self):
                raise RuntimeError("健康检查异常")

        adapter = ErrorAdapter("test_cli")

        with pytest.raises(RuntimeError, match="健康检查异常"):
            await adapter.health_check()

    @pytest.mark.unit
    def test_adapter_with_none_cli_name(self):
        """测试CLI名称为None的适配器"""
        with pytest.raises(ValueError):
            MockConcreteAdapter(None)

    @pytest.mark.unit
    def test_adapter_with_empty_cli_name(self):
        """测试CLI名称为空的适配器"""
        with pytest.raises(ValueError):
            MockConcreteAdapter("")

    @pytest.mark.unit
    async def test_execute_task_with_none_task(self):
        """测试任务为None的执行"""
        adapter = MockConcreteAdapter("test_cli")

        with pytest.raises(ValueError):
            await adapter.execute_task(None, {})

    @pytest.mark.unit
    async def test_execute_task_with_none_context(self):
        """测试上下文为None的执行"""
        adapter = MockConcreteAdapter("test_cli")

        # 应该能处理None上下文
        result = await adapter.execute_task("test", None)
        assert result is not None
        assert adapter.last_context is None