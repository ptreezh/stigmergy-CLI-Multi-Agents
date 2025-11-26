"""
BaseAdapter单元测试 - 测试适配器基类的核心功能
遵循TDD原则：先写测试，再实现代码
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch

from core.base_adapter import BaseCrossCLIAdapter, CrossCliAdapterFactory
from core.parser import IntentResult


class MockConcreteAdapter(BaseCrossCLIAdapter):
    """具体适配器实现类，用于测试基类功能"""

    def __init__(self, cli_name: str, is_available_flag: bool = True):
        super().__init__(cli_name)
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


class TestCrossCliAdapterFactory:
    """CrossCliAdapterFactory单元测试"""

    @pytest.fixture
    def mock_adapter_classes(self):
        """Mock适配器类字典"""
        return {
            'claude': MockConcreteAdapter,
            'gemini': MockConcreteAdapter,
            'qwencode': MockConcreteAdapter
        }

    @pytest.mark.unit
    def test_factory_initialization(self, mock_adapter_classes):
        """测试工厂初始化"""
        with patch('core.factory.ADAPTER_CLASSES', mock_adapter_classes):
            factory = CrossCliAdapterFactory()

            assert len(factory._adapters) == len(mock_adapter_classes)
            assert 'claude' in factory._adapters
            assert 'gemini' in factory._adapters
            assert 'qwencode' in factory._adapters

    @pytest.mark.unit
    def test_get_adapter_success(self, mock_adapter_classes):
        """测试成功获取适配器"""
        with patch('core.factory.ADAPTER_CLASSES', mock_adapter_classes):
            factory = CrossCliAdapterFactory()
            adapter = factory.get_adapter('claude')

            assert adapter is not None
            assert isinstance(adapter, MockConcreteAdapter)
            assert adapter.cli_name == 'claude'

    @pytest.mark.unit
    def test_get_adapter_not_found(self, mock_adapter_classes):
        """测试获取不存在的适配器"""
        with patch('core.factory.ADAPTER_CLASSES', mock_adapter_classes):
            factory = CrossCliAdapterFactory()
            adapter = factory.get_adapter('nonexistent')

            assert adapter is None

    @pytest.mark.unit
    def test_list_available_adapters(self, mock_adapter_classes):
        """测试列出可用适配器"""
        # 创建一些可用的和不可用的适配器
        mock_adapter_classes['available'] = lambda: MockConcreteAdapter("available", True)
        mock_adapter_classes['unavailable'] = lambda: MockConcreteAdapter("unavailable", False)

        with patch('core.factory.ADAPTER_CLASSES', mock_adapter_classes):
            factory = CrossCliAdapterFactory()
            available_adapters = factory.list_available_adapters()

            assert 'available' in available_adapters
            assert available_adapters['available'] is True
            assert 'unavailable' in available_adapters
            assert available_adapters['unavailable'] is False

    @pytest.mark.unit
    async def test_health_check_all(self, mock_adapter_classes):
        """测试所有适配器健康检查"""
        with patch('core.factory.ADAPTER_CLASSES', mock_adapter_classes):
            factory = CrossCliAdapterFactory()
            health_results = await factory.health_check_all()

            assert len(health_results) == len(mock_adapter_classes)

            for cli_name, result in health_results.items():
                assert cli_name in ['claude', 'gemini', 'qwencode']
                assert 'cli_name' in result
                assert 'available' in result
                assert 'version' in result
                assert result['cli_name'] == cli_name

    @pytest.mark.unit
    def test_factory_singleton_behavior(self, mock_adapter_classes):
        """测试工厂单例行为"""
        with patch('core.factory.ADAPTER_CLASSES', mock_adapter_classes):
            factory1 = CrossCliAdapterFactory()
            factory2 = CrossCliAdapterFactory()

            # 获取相同的适配器实例
            adapter1 = factory1.get_adapter('claude')
            adapter2 = factory2.get_adapter('claude')

            # 验证它们是不同的实例（工厂不是单例）
            assert adapter1 is not adapter2
            # 但都是相同类型的适配器
            assert type(adapter1) == type(adapter2)


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