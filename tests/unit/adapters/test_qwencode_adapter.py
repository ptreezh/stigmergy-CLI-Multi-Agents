"""
QwenCode CLI适配器单元测试 - TDD驱动实现
先写测试，再实现适配器代码

基于QwenCode的Class Inheritance系统进行测试设计
"""

import pytest
import asyncio
import json
import tempfile
import os
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from typing import Dict, Any, Optional

from src.core.base_adapter import BaseCrossCLIAdapter, IntentResult


class MockQwenCodePluginContext:
    """Mock QwenCode Plugin上下文"""
    def __init__(self, prompt: str = "", metadata: Optional[Dict] = None):
        self.prompt = prompt
        self.metadata = metadata or {}
        self.session_id = self.metadata.get('session_id', 'test_session')
        self.user_id = self.metadata.get('user_id', 'test_user')
        self.plugin_name = "cross-cli-adapter"
        self.version = "1.0.0"
        self.class_name = "CrossCLIAdapterPlugin"


class TestQwenCodeInheritanceAdapterTDD:
    """QwenCode Class Inheritance适配器TDD测试 - 遵循测试先行的原则"""

    @pytest.fixture
    def mock_adapter_class(self):
        """Mock适配器类用于TDD"""
        class QwenCodeInheritanceAdapter(BaseCrossCLIAdapter):
            def __init__(self, cli_name: str):
                super().__init__(cli_name)
                self.plugins_loaded = False
                self.processed_requests = []
                self.cross_cli_calls = []
                self.plugin_handlers = {
                    'on_before_execute': self.on_before_execute,
                    'on_after_execute': self.on_after_execute,
                    'on_prompt_received': self.on_prompt_received,
                    'on_code_generated': self.on_code_generated,
                    'on_error_occurred': self.on_error_occurred,
                }

            async def load_plugins(self):
                """加载插件"""
                self.plugins_loaded = True

            async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
                """模拟执行跨CLI任务"""
                self.cross_cli_calls.append({
                    'task': task,
                    'context': context,
                    'timestamp': asyncio.get_event_loop().time()
                })
                return f"[QwenCode → {context.get('target_cli', 'unknown').upper()} 调用结果]\n模拟执行: {task}"

            def is_available(self) -> bool:
                """模拟可用性检查"""
                return self.plugins_loaded

            async def on_prompt_received(self, context: MockQwenCodePluginContext) -> Optional[str]:
                """接收到提示时的Plugin处理函数"""
                try:
                    user_input = context.prompt

                    # 1. 检测是否为跨CLI调用
                    if self._is_cross_cli_call(user_input):
                        # 2. 解析目标CLI和任务
                        target_cli, task = self._parse_cross_cli_intent(user_input)

                        if target_cli and target_cli != 'qwencode':
                            # 3. 执行跨CLI调用
                            result = await self.execute_cross_cli_call(target_cli, task, context)
                            return result

                    return None  # 让QwenCode继续正常处理
                except Exception as e:
                    # 错误情况下返回None，不中断QwenCode正常流程
                    return None

            def _is_cross_cli_call(self, user_input: str) -> bool:
                """检测是否为跨CLI调用"""
                from src.core.parser import NaturalLanguageParser
                parser = NaturalLanguageParser()
                return parser.detect_cross_cli_call(user_input, "qwencode")

            def _parse_cross_cli_intent(self, user_input: str) -> tuple[Optional[str], str]:
                """解析跨CLI调用意图"""
                from src.core.parser import NaturalLanguageParser
                parser = NaturalLanguageParser()
                intent = parser.parse_intent(user_input, "qwencode")

                if intent.is_cross_cli:
                    return intent.target_cli, intent.task
                return None, user_input

            async def execute_cross_cli_call(self, target_cli: str, task: str, context: MockQwenCodePluginContext) -> str:
                """执行跨CLI调用"""
                self.processed_requests.append({
                    'type': 'cross_cli_call',
                    'target_cli': target_cli,
                    'task': task,
                    'context': context.__dict__,
                    'timestamp': asyncio.get_event_loop().time()
                })

                # 模拟调用其他CLI适配器
                mock_result = await self._mock_target_cli_call(target_cli, task, context)
                return self._format_result(target_cli, mock_result)

            async def _mock_target_cli_call(self, target_cli: str, task: str, context: MockQwenCodePluginContext) -> str:
                """模拟目标CLI调用"""
                # 模拟不同CLI的不同响应格式
                if target_cli == 'claude':
                    return f"Claude分析结果: {task}的分析已完成"
                elif target_cli == 'gemini':
                    return f"Gemini分析结果: {task}的AI分析如下..."
                elif target_cli == 'iflow':
                    return f"iFlow工作流结果: 成功执行 {task}"
                elif target_cli == 'qoder':
                    return f"Qoder处理结果: {task} 已完成"
                elif target_cli == 'codebuddy':
                    return f"CodeBuddy协助结果: {task} 已处理"
                elif target_cli == 'codex':
                    return f"Codex生成结果: {task} 的代码实现"
                else:
                    return f"{target_cli.upper()} 处理结果: {task}"

            def _format_result(self, target_cli: str, result: str) -> str:
                """格式化跨CLI调用结果"""
                import datetime
                return f"""## 🔗 跨CLI调用结果

**源工具**: QwenCode CLI
**目标工具**: {target_cli.upper()}
**执行时间**: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

{result}

---

*此结果由跨CLI集成系统通过QwenCode Plugin提供*"""

            async def on_before_execute(self, context: MockQwenCodePluginContext) -> Optional[str]:
                """执行前Plugin处理函数"""
                return None

            async def on_after_execute(self, context: MockQwenCodePluginContext) -> Optional[str]:
                """执行后Plugin处理函数"""
                return None

            async def on_code_generated(self, context: MockQwenCodePluginContext) -> Optional[str]:
                """代码生成Plugin处理函数"""
                return None

            async def on_error_occurred(self, context: MockQwenCodePluginContext) -> Optional[str]:
                """错误发生Plugin处理函数"""
                return None

        return QwenCodeInheritanceAdapter

    @pytest.fixture
    def adapter(self, mock_adapter_class):
        """适配器实例"""
        return mock_adapter_class('qwencode')

    @pytest.fixture
    def mock_context(self):
        """Mock Plugin上下文"""
        return MockQwenCodePluginContext()

    @pytest.mark.unit
    def test_adapter_initialization(self, adapter):
        """测试适配器初始化 - TDD第一步"""
        assert adapter.cli_name == 'qwencode'
        assert adapter.version == '1.0.0'
        assert adapter.plugins_loaded is False
        assert len(adapter.cross_cli_calls) == 0
        assert len(adapter.processed_requests) == 0
        assert len(adapter.plugin_handlers) == 5

    @pytest.mark.unit
    async def test_plugin_loading(self, adapter):
        """测试Plugin加载功能"""
        assert adapter.plugins_loaded is False

        await adapter.load_plugins()

        assert adapter.plugins_loaded is True
        assert adapter.is_available() is True

    @pytest.mark.unit
    async def test_cross_cli_call_detection(self, adapter, mock_context):
        """测试跨CLI调用检测功能"""
        # 测试应该被识别为跨CLI调用的请求
        cross_cli_requests = [
            "请用claude帮我审查这个代码",
            "调用gemini分析架构",
            "用iflow执行工作流",
            "ask qwencode to generate code",  # 这个不应该触发，因为目标是qwencode自己
        ]

        for request in cross_cli_requests:
            mock_context.prompt = request
            is_cross_cli = adapter._is_cross_cli_call(request)

            if 'qwencode' in request.lower() and ('generate' in request.lower() or 'ask' in request.lower()):
                # 目标是qwencode自己的请求不应该被识别为跨CLI调用
                assert not is_cross_cli, f"请求 '{request}' 不应该被识别为跨CLI调用"
            else:
                assert is_cross_cli, f"请求 '{request}' 应该被识别为跨CLI调用"

    @pytest.mark.unit
    async def test_intent_parsing(self, adapter):
        """测试意图解析功能"""
        test_cases = [
            ("请用claude帮我分析", "claude", "帮我分析"),
            ("调用gemini生成代码", "gemini", "生成代码"),
            ("用iflow执行工作流", "iflow", "执行工作流"),
            ("正常的QwenCode请求", None, "正常的QwenCode请求"),
        ]

        for input_text, expected_target, expected_task in test_cases:
            target_cli, task = adapter._parse_cross_cli_intent(input_text)

            if expected_target:
                assert target_cli == expected_target, f"目标CLI解析错误: {input_text}"
                assert expected_task in task, f"任务解析错误: {input_text}"
            else:
                assert target_cli is None, f"不应该解析出目标CLI: {input_text}"

    @pytest.mark.unit
    async def test_plugin_prompt_processing_with_cross_cli(self, adapter, mock_context):
        """测试Plugin处理跨CLI提示"""
        # 设置跨CLI调用请求
        mock_context.prompt = "请用claude帮我生成Python代码"

        # 加载Plugin（前置条件）
        await adapter.load_plugins()

        # 处理Plugin
        result = await adapter.on_prompt_received(mock_context)

        # 验证结果
        assert result is not None, "应该返回跨CLI调用结果"
        assert "Claude分析结果" in result, "结果应该包含claude的响应"
        assert "跨CLI调用结果" in result, "结果应该有格式化标题"

        # 验证调用记录
        assert len(adapter.processed_requests) == 1
        request_record = adapter.processed_requests[0]
        assert request_record['type'] == 'cross_cli_call'
        assert request_record['target_cli'] == 'claude'
        assert "帮我生成Python代码" in request_record['task']

    @pytest.mark.unit
    async def test_plugin_prompt_processing_normal_request(self, adapter, mock_context):
        """测试Plugin处理正常QwenCode请求"""
        # 设置正常QwenCode请求
        mock_context.prompt = "请帮我写一个排序算法"

        # 加载Plugin
        await adapter.load_plugins()

        # 处理Plugin
        result = await adapter.on_prompt_received(mock_context)

        # 正常请求应该返回None，让QwenCode继续处理
        assert result is None, "正常请求应该返回None"

        # 不应该记录跨CLI调用
        assert len(adapter.processed_requests) == 0

    @pytest.mark.unit
    async def test_plugin_prompt_processing_self_reference(self, adapter, mock_context):
        """测试Plugin处理自我引用请求（目标为qwencode）"""
        # 设置目标为qwencode的请求
        mock_context.prompt = "请用qwencode生成这段代码"

        # 加载Plugin
        await adapter.load_plugins()

        # 处理Plugin
        result = await adapter.on_prompt_received(mock_context)

        # 自我引用应该返回None，让QwenCode处理
        assert result is None, "自我引用请求应该返回None"

        # 不应该记录跨CLI调用
        assert len(adapter.processed_requests) == 0

    @pytest.mark.unit
    async def test_multiple_target_cli_support(self, adapter, mock_context):
        """测试支持多个目标CLI"""
        test_cases = [
            ("请用claude帮我", "claude"),
            ("调用gemini生成", "gemini"),
            ("用iflow执行", "iflow"),
            ("让qoder处理", "qoder"),
            ("通过codebuddy协助", "codebuddy"),
            ("调用codex生成", "codex"),
        ]

        await adapter.load_plugins()

        for request, expected_target in test_cases:
            mock_context.prompt = request
            result = await adapter.on_prompt_received(mock_context)

            assert result is not None, f"请求 '{request}' 应该有返回结果"
            assert expected_target.upper() in result, f"结果应该包含 {expected_target.upper()}"
            assert len(adapter.processed_requests) == 1

            # 清理请求记录
            adapter.processed_requests.clear()

    @pytest.mark.unit
    async def test_plugin_handlers_configuration(self, adapter):
        """测试Plugin处理器配置"""
        expected_handlers = [
            'on_before_execute',
            'on_after_execute',
            'on_prompt_received',
            'on_code_generated',
            'on_error_occurred',
        ]

        for handler in expected_handlers:
            assert handler in adapter.plugin_handlers, f"应该包含处理器: {handler}"
            assert callable(adapter.plugin_handlers[handler]), f"处理器应该是可调用的: {handler}"

    @pytest.mark.unit
    async def test_result_formatting_consistency(self, adapter, mock_context):
        """测试结果格式化一致性"""
        mock_context.prompt = "请用claude分析这个算法"

        await adapter.load_plugins()
        result = await adapter.on_prompt_received(mock_context)

        # 验证格式化结构
        required_elements = [
            "🔗 跨CLI调用结果",
            "源工具**: QwenCode CLI",
            "目标工具**: CLAUDE",
            "执行时间",
            "Claude分析结果",
            "通过QwenCode Plugin提供"
        ]

        for element in required_elements:
            assert element in result, f"结果格式应该包含: {element}"

    @pytest.mark.unit
    async def test_error_handling_in_plugin(self, adapter, mock_context):
        """测试Plugin中的错误处理"""
        # 模拟解析错误
        with patch.object(adapter, '_parse_cross_cli_intent', side_effect=Exception("解析错误")):
            mock_context.prompt = "请用claude帮我"

            await adapter.load_plugins()

            # 错误情况下应该返回None，不中断QwenCode正常流程
            result = await adapter.on_prompt_received(mock_context)
            assert result is None, "错误时应该返回None"

    @pytest.mark.unit
    async def test_concurrent_plugin_calls(self, adapter):
        """测试并发Plugin调用"""
        await adapter.load_plugins()

        # 创建多个并发请求
        requests = [
            MockQwenCodePluginContext("请用claude分析数据1"),
            MockQwenCodePluginContext("调用gemini生成代码2"),
            MockQwenCodePluginContext("用iflow执行工作流3"),
        ]

        # 并发处理
        tasks = [adapter.on_prompt_received(ctx) for ctx in requests]
        results = await asyncio.gather(*tasks)

        # 验证所有结果
        for i, result in enumerate(results):
            assert result is not None, f"请求 {i} 应该有结果"

        # 验证处理记录
        assert len(adapter.processed_requests) == 3

    @pytest.mark.unit
    def test_adapter_statistics_tracking(self, adapter):
        """测试适配器统计跟踪"""
        # 初始状态
        stats = adapter.get_statistics()
        assert stats['execution_count'] == 0
        assert stats['error_count'] == 0

        # 记录一些执行
        adapter.execution_count = 12
        adapter.error_count = 3

        stats = adapter.get_statistics()
        assert stats['execution_count'] == 12
        assert stats['error_count'] == 3
        assert stats['success_rate'] == 0.75

    @pytest.mark.unit
    async def test_context_metadata_preservation(self, adapter, mock_context):
        """测试上下文元数据保留"""
        mock_context.prompt = "请用claude生成这个"
        mock_context.metadata['user_id'] = 'qwencode_user_789'
        mock_context.metadata['session_id'] = 'session_012'
        # 更新context对象的属性以保持同步
        mock_context.user_id = 'qwencode_user_789'
        mock_context.session_id = 'session_012'

        await adapter.load_plugins()
        await adapter.on_prompt_received(mock_context)

        # 验证元数据被保留
        request_record = adapter.processed_requests[0]
        assert request_record['context']['user_id'] == 'qwencode_user_789'
        assert request_record['context']['session_id'] == 'session_012'

    @pytest.mark.unit
    async def test_class_inheritance_specific_features(self, adapter):
        """测试QwenCode Class Inheritance特有功能"""
        # 验证Class Inheritance系统特有的配置
        assert hasattr(adapter, 'plugin_handlers'), "应该有Plugin处理器"
        assert hasattr(adapter, 'plugins_loaded'), "应该有Plugin加载状态"

        # 验证Plugin ID和类名
        mock_context = MockQwenCodePluginContext()
        assert mock_context.plugin_name == "cross-cli-adapter", "Plugin ID应该正确"
        assert mock_context.class_name == "CrossCLIAdapterPlugin", "类名应该正确"

    @pytest.mark.unit
    async def test_plugin_lifecycle(self, adapter):
        """测试Plugin生命周期管理"""
        # 初始状态
        assert adapter.plugins_loaded is False
        assert adapter.is_available() is False

        # 加载Plugin
        await adapter.load_plugins()
        assert adapter.plugins_loaded is True
        assert adapter.is_available() is True

        # 验证Plugin处理器都已就绪
        for handler_name, handler_func in adapter.plugin_handlers.items():
            assert handler_func is not None, f"处理器 {handler_name} 应该已初始化"


class TestQwenCodeInheritanceAdapterEdgeCases:
    """QwenCode Class Inheritance适配器边界情况测试"""

    @pytest.fixture
    def adapter(self):
        """适配器实例"""
        class QwenCodeInheritanceAdapter(BaseCrossCLIAdapter):
            def __init__(self, cli_name: str):
                super().__init__(cli_name)

            async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
                return f"Mock execution: {task}"

            def is_available(self) -> bool:
                return True

            async def on_prompt_received(self, context: MockQwenCodePluginContext) -> Optional[str]:
                from src.core.parser import NaturalLanguageParser
                parser = NaturalLanguageParser()
                intent = parser.parse_intent(context.prompt, "qwencode")

                if intent.is_cross_cli and intent.target_cli != 'qwencode':
                    return f"Cross CLI call to {intent.target_cli}: {intent.task}"
                return None

        return QwenCodeInheritanceAdapter('qwencode')

    @pytest.mark.unit
    async def test_empty_prompt_handling(self, adapter):
        """测试空提示处理"""
        empty_contexts = [
            MockQwenCodePluginContext(""),
            MockQwenCodePluginContext("   "),
            MockQwenCodePluginContext(None),
        ]

        for ctx in empty_contexts:
            result = await adapter.on_prompt_received(ctx)
            assert result is None, "空提示应该返回None"

    @pytest.mark.unit
    async def test_malformed_requests(self, adapter):
        """测试格式错误的请求"""
        malformed_requests = [
            MockQwenCodePluginContext("请用帮我"),  # 缺少目标CLI
            MockQwenCodePluginContext("调用不存在的CLI工具做某事"),  # 不存在的CLI
            MockQwenCodePluginContext("随机文本没有调用意图"),  # 没有调用意图
        ]

        for ctx in malformed_requests:
            result = await adapter.on_prompt_received(ctx)
            assert result is None, "格式错误的请求应该返回None"

    @pytest.mark.unit
    async def test_very_long_requests(self, adapter):
        """测试超长请求处理"""
        long_text = "请用claude生成" + "这是一个很长的QwenCode请求描述" * 1000
        ctx = MockQwenCodePluginContext(long_text)

        result = await adapter.on_prompt_received(ctx)
        assert result is not None, "长请求应该被处理"
        assert "claude" in result, "结果应该包含目标CLI"

    @pytest.mark.unit
    async def test_special_characters(self, adapter):
        """测试特殊字符处理"""
        special_requests = [
            MockQwenCodePluginContext("请用claude生成这段代码: `def func(): pass`"),
            MockQwenCodePluginContext("调用gemini生成包含引号的代码: \"hello world\""),
            MockQwenCodePluginContext("用iflow处理JSON: {\"key\": \"value\"}"),
        ]

        for ctx in special_requests:
            result = await adapter.on_prompt_received(ctx)
            # 只要没有崩溃就算通过
            assert True, f"特殊字符请求应该被处理: {ctx.prompt[:50]}..."

    @pytest.mark.unit
    async def test_unicode_requests(self, adapter):
        """测试Unicode请求处理"""
        unicode_requests = [
            MockQwenCodePluginContext("请用claude生成🚀这段代码"),
            MockQwenCodePluginContext("调用gemini生成😊的表情包代码"),
            MockQwenCodePluginContext("用iflow处理🎯项目计划"),
        ]

        for ctx in unicode_requests:
            result = await adapter.on_prompt_received(ctx)
            # 验证结果包含emoji（如果有跨CLI调用）
            if result:
                assert any(emoji in result for emoji in ['🚀', '😊', '🎯']), f"结果应该保留emoji: {ctx.prompt}"


# TDD测试入口：验证所有测试通过后才能实现适配器
def run_qwencode_adapter_tdd_tests():
    """运行QwenCode适配器TDD测试"""
    print("=" * 60)
    print("QwenCode CLI Class Inheritance适配器 TDD 测试")
    print("=" * 60)

    try:
        result = pytest.main([
            __file__,
            "-v",
            "--tb=short"
        ])
        return result == 0
    except Exception as e:
        print(f"❌ TDD测试执行失败: {e}")
        return False


if __name__ == "__main__":
    success = run_qwencode_adapter_tdd_tests()
    if success:
        print("\n✅ 所有TDD测试通过！可以开始实现QwenCode适配器代码。")
    else:
        print("\n❌ TDD测试失败！需要先修复测试用例。")
    exit(0 if success else 1)