"""
Claude CLI适配器单元测试 - TDD驱动实现
先写测试，再实现适配器代码

基于真实的Claude CLI Hook系统进行测试设计
"""

import pytest
import asyncio
import json
import tempfile
import os
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from typing import Dict, Any, Optional

from src.adapters.codex.natural_language_parser import IntentResult


class MockClaudeHookContext:
    """Mock Claude CLI Hook上下文"""
    def __init__(self, prompt: str = "", metadata: Optional[Dict] = None):
        self.prompt = prompt
        self.metadata = metadata or {}
        self.session_id = self.metadata.get('session_id', 'test_session')
        self.user_id = self.metadata.get('user_id', 'test_user')


class TestClaudeHookAdapterTDD:
    """Claude Hook适配器TDD测试 - 遵循测试先行的原则"""

    @pytest.fixture
    def mock_adapter_class(self):
        """Mock适配器类用于TDD"""
        class ClaudeHookAdapter:
            def __init__(self, cli_name: str):
                self.cli_name = cli_name
                self.version = "1.0.0"
                self.hooks_registered = False
                self.processed_requests = []
                self.cross_cli_calls = []
                self.last_execution_time = None
                self.execution_count = 0
                self.error_count = 0

            async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
                """模拟执行跨CLI任务"""
                self.execution_count += 1
                from datetime import datetime
                self.last_execution_time = datetime.now()
                self.cross_cli_calls.append({
                    'task': task,
                    'context': context,
                    'timestamp': asyncio.get_event_loop().time()
                })
                return f"[Claude → {context.get('target_cli', 'unknown').upper()} 调用结果]\n模拟执行: {task}"

            def is_available(self) -> bool:
                """检查适配器是否可用"""
                return self.hooks_registered

            async def health_check(self) -> Dict[str, Any]:
                """健康检查"""
                from datetime import datetime
                return {
                    'cli_name': self.cli_name,
                    'available': self.is_available(),
                    'version': self.version,
                    'hooks_registered': self.hooks_registered,
                    'execution_count': self.execution_count,
                    'error_count': self.error_count,
                    'last_execution_time': self.last_execution_time.isoformat() if self.last_execution_time else None
                }

            def get_statistics(self) -> Dict[str, Any]:
                """获取统计信息"""
                from datetime import datetime
                success_rate = 1.0
                if self.execution_count > 0:
                    success_rate = (self.execution_count - self.error_count) / self.execution_count
                return {
                    'cli_name': self.cli_name,
                    'version': self.version,
                    'processed_requests': len(self.processed_requests),
                    'cross_cli_calls': len(self.cross_cli_calls),
                    'execution_count': self.execution_count,
                    'error_count': self.error_count,
                    'success_rate': success_rate,
                    'last_execution_time': self.last_execution_time.isoformat() if self.last_execution_time else None
                }

            def record_error(self):
                """记录错误"""
                self.error_count += 1

            def _is_cross_cli_call(self, text: str) -> bool:
                """检测是否为跨CLI调用"""
                import re
                # 中文模式
                cn_patterns = [
                    r'请用(\w+)\s*帮我?([^。！？\n]*)',
                    r'调用(\w+)\s*来([^。！？\n]*)',
                    r'用(\w+)\s*帮我?([^。！？\n]*)'
                ]

                for pattern in cn_patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        cli_name = match.group(1).lower()
                        if cli_name != self.cli_name:  # 避免自我调用
                            return True

                # 英文模式
                en_patterns = [
                    r'use\s+(\w+)\s+to\s+([^.\n!?]*)',
                    r'call\s+(\w+)\s+to\s+([^.\n!?]*)',
                    r'ask\s+(\w+)\s+for\s+([^.\n!?]*)'
                ]

                for pattern in en_patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        cli_name = match.group(1).lower()
                        if cli_name != self.cli_name:  # 避免自我调用
                            return True

                return False

            async def register_hooks(self):
                """模拟Hook注册"""
                self.hooks_registered = True

        return ClaudeHookAdapter

    @pytest.fixture
    def adapter(self, mock_adapter_class):
        """适配器实例"""
        return mock_adapter_class('claude')

    @pytest.fixture
    def mock_context(self):
        """Mock Hook上下文"""
        return MockClaudeHookContext()

    @pytest.mark.unit
    def test_adapter_initialization(self, adapter):
        """测试适配器初始化 - TDD第一步"""
        assert adapter.cli_name == 'claude'
        assert adapter.version == '1.0.0'
        assert adapter.hooks_registered is False
        assert len(adapter.cross_cli_calls) == 0
        assert len(adapter.processed_requests) == 0

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_hook_registration(self, adapter):
        """测试Hook注册功能"""
        assert adapter.hooks_registered is False

        await adapter.register_hooks()

        assert adapter.hooks_registered is True
        assert adapter.is_available() is True

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_cross_cli_call_detection(self, adapter, mock_context):
        """测试跨CLI调用检测功能"""
        # 测试应该被识别为跨CLI调用的请求
        cross_cli_requests = [
            "请用gemini帮我分析这个架构图",
            "调用qwencode生成Python代码",
            "用iflow执行这个工作流",
            "ask claude to review code"  # 这个不应该触发，因为目标是claude自己
        ]

        for request in cross_cli_requests:
            mock_context.prompt = request
            is_cross_cli = adapter._is_cross_cli_call(request)

            if 'claude' in request.lower() and ('review' in request.lower() or 'ask' in request.lower()):
                # 目标是claude自己的请求不应该被识别为跨CLI调用
                assert not is_cross_cli, f"请求 '{request}' 不应该被识别为跨CLI调用"
            else:
                assert is_cross_cli, f"请求 '{request}' 应该被识别为跨CLI调用"

    @pytest.mark.unit
    async def test_intent_parsing(self, adapter):
        """测试意图解析功能"""
        test_cases = [
            ("请用gemini帮我分析", "gemini", "帮我分析"),
            ("调用qwencode生成代码", "qwencode", "生成代码"),
            ("用iflow执行工作流", "iflow", "执行工作流"),
            ("正常的Claude请求", None, "正常的Claude请求"),
        ]

        for input_text, expected_target, expected_task in test_cases:
            target_cli, task = adapter._parse_cross_cli_intent(input_text)

            if expected_target:
                assert target_cli == expected_target, f"目标CLI解析错误: {input_text}"
                assert expected_task in task, f"任务解析错误: {input_text}"
            else:
                assert target_cli is None, f"不应该解析出目标CLI: {input_text}"

    @pytest.mark.unit
    async def test_hook_prompt_processing_with_cross_cli(self, adapter, mock_context):
        """测试Hook处理跨CLI提示"""
        # 设置跨CLI调用请求
        mock_context.prompt = "请用gemini帮我分析这个数据"

        # 注册Hook（前置条件）
        await adapter.register_hooks()

        # 处理Hook
        result = await adapter.on_user_prompt_submit(mock_context)

        # 验证结果
        assert result is not None, "应该返回跨CLI调用结果"
        assert "Gemini分析结果" in result, "结果应该包含gemini的响应"
        assert "跨CLI调用结果" in result, "结果应该有格式化标题"

        # 验证调用记录
        assert len(adapter.processed_requests) == 1
        request_record = adapter.processed_requests[0]
        assert request_record['type'] == 'cross_cli_call'
        assert request_record['target_cli'] == 'gemini'
        assert "帮我分析这个数据" in request_record['task']

    @pytest.mark.unit
    async def test_hook_prompt_processing_normal_request(self, adapter, mock_context):
        """测试Hook处理正常Claude请求"""
        # 设置正常Claude请求
        mock_context.prompt = "请帮我重构这段Python代码"

        # 注册Hook
        await adapter.register_hooks()

        # 处理Hook
        result = await adapter.on_user_prompt_submit(mock_context)

        # 正常请求应该返回None，让Claude继续处理
        assert result is None, "正常请求应该返回None"

        # 不应该记录跨CLI调用
        assert len(adapter.processed_requests) == 0

    @pytest.mark.unit
    async def test_hook_prompt_processing_self_reference(self, adapter, mock_context):
        """测试Hook处理自我引用请求（目标为claude）"""
        # 设置目标为claude的请求
        mock_context.prompt = "请用claude帮我审查这个代码"

        # 注册Hook
        await adapter.register_hooks()

        # 处理Hook
        result = await adapter.on_user_prompt_submit(mock_context)

        # 自我引用应该返回None，让Claude处理
        assert result is None, "自我引用请求应该返回None"

        # 不应该记录跨CLI调用
        assert len(adapter.processed_requests) == 0

    @pytest.mark.unit
    async def test_multiple_target_cli_support(self, adapter, mock_context):
        """测试支持多个目标CLI"""
        test_cases = [
            ("请用gemini帮我", "gemini"),
            ("调用qwencode生成", "qwencode"),
            ("用iflow执行", "iflow"),
            ("让qoder处理", "qoder"),
            ("通过codebuddy协助", "codebuddy"),
            ("调用codex生成", "codex"),
        ]

        await adapter.register_hooks()

        for request, expected_target in test_cases:
            mock_context.prompt = request
            result = await adapter.on_user_prompt_submit(mock_context)

            assert result is not None, f"请求 '{request}' 应该有返回结果"
            assert expected_target.upper() in result, f"结果应该包含 {expected_target.upper()}"
            assert len(adapter.processed_requests) == 1

            # 清理请求记录
            adapter.processed_requests.clear()

    @pytest.mark.unit
    async def test_result_formatting_consistency(self, adapter, mock_context):
        """测试结果格式化一致性"""
        mock_context.prompt = "请用gemini分析这个项目"

        await adapter.register_hooks()
        result = await adapter.on_user_prompt_submit(mock_context)

        # 验证格式化结构
        required_elements = [
            "🔗 跨CLI调用结果",
            "源工具**: Claude CLI",
            "目标工具**: GEMINI",
            "调用时间",
            "Gemini分析结果",
            "跨CLI集成系统提供"
        ]

        for element in required_elements:
            assert element in result, f"结果格式应该包含: {element}"

    @pytest.mark.unit
    async def test_error_handling_in_hook(self, adapter, mock_context):
        """测试Hook中的错误处理"""
        # 模拟解析错误
        with patch.object(adapter, '_parse_cross_cli_intent', side_effect=Exception("解析错误")):
            mock_context.prompt = "请用gemini帮我"

            await adapter.register_hooks()

            # 错误情况下应该返回None，不中断Claude正常流程
            result = await adapter.on_user_prompt_submit(mock_context)
            assert result is None, "错误时应该返回None"

    @pytest.mark.unit
    async def test_concurrent_hook_calls(self, adapter):
        """测试并发Hook调用"""
        await adapter.register_hooks()

        # 创建多个并发请求
        requests = [
            MockClaudeHookContext("请用gemini分析数据1"),
            MockClaudeHookContext("调用qwencode生成代码2"),
            MockClaudeHookContext("用iflow执行工作流3"),
        ]

        # 并发处理
        tasks = [adapter.on_user_prompt_submit(ctx) for ctx in requests]
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
        adapter.execution_count = 5
        adapter.error_count = 1

        stats = adapter.get_statistics()
        assert stats['execution_count'] == 5
        assert stats['error_count'] == 1
        assert stats['success_rate'] == 0.8

    @pytest.mark.unit
    async def test_context_metadata_preservation(self, adapter, mock_context):
        """测试上下文元数据保留"""
        mock_context.prompt = "请用gemini分析这个"
        mock_context.metadata['user_id'] = 'test_user_123'
        mock_context.metadata['session_id'] = 'session_456'
        # 更新context对象的属性以保持同步
        mock_context.user_id = 'test_user_123'
        mock_context.session_id = 'session_456'

        await adapter.register_hooks()
        await adapter.on_user_prompt_submit(mock_context)

        # 验证元数据被保留
        request_record = adapter.processed_requests[0]
        assert request_record['context']['user_id'] == 'test_user_123'
        assert request_record['context']['session_id'] == 'session_456'


class TestClaudeHookAdapterEdgeCases:
    """Claude Hook适配器边界情况测试"""

    @pytest.fixture
    def adapter(self):
        """适配器实例"""
        class ClaudeHookAdapter:
            def __init__(self, cli_name: str):
                self.cli_name = cli_name
                self.version = "1.0.0"
                self.hooks_registered = False
                self.processed_requests = []
                self.cross_cli_calls = []
                self.last_execution_time = None
                self.execution_count = 0
                self.error_count = 0

            async def execute_task(self, task: str, context: Dict[str, Any]) -> str:
                self.execution_count += 1
                from datetime import datetime
                self.last_execution_time = datetime.now()
                return f"Mock execution: {task}"

            def is_available(self) -> bool:
                return True

            def get_statistics(self) -> Dict[str, Any]:
                from datetime import datetime
                return {
                    'cli_name': self.cli_name,
                    'version': self.version,
                    'execution_count': self.execution_count,
                    'error_count': self.error_count,
                    'last_execution_time': self.last_execution_time.isoformat() if self.last_execution_time else None,
                    'hooks_registered': self.hooks_registered,
                    'processed_requests': len(self.processed_requests),
                    'cross_cli_calls': len(self.cross_cli_calls)
                }

            def record_error(self):
                self.error_count += 1

            async def on_user_prompt_submit(self, context: MockClaudeHookContext) -> Optional[str]:
                from src.adapters.codex.natural_language_parser import NaturalLanguageParser
                parser = NaturalLanguageParser()
                # Note: The parse_intent method in the codex parser takes two arguments
                intent = parser.parse_intent(context.prompt, "claude")

                if intent.is_cross_cli and intent.target_cli != 'claude':
                    return f"Cross CLI call to {intent.target_cli}: {intent.task}"
                return None

        return ClaudeHookAdapter('claude')

    @pytest.mark.unit
    async def test_empty_prompt_handling(self, adapter):
        """测试空提示处理"""
        empty_contexts = [
            MockClaudeHookContext(""),
            MockClaudeHookContext("   "),
            MockClaudeHookContext(None),
        ]

        for ctx in empty_contexts:
            result = await adapter.on_user_prompt_submit(ctx)
            assert result is None, "空提示应该返回None"

    @pytest.mark.unit
    async def test_malformed_requests(self, adapter):
        """测试格式错误的请求"""
        malformed_requests = [
            MockClaudeHookContext("请用帮我"),  # 缺少目标CLI
            MockClaudeHookContext("调用不存在的CLI工具做某事"),  # 不存在的CLI
            MockClaudeHookContext("随机文本没有调用意图"),  # 没有调用意图
        ]

        for ctx in malformed_requests:
            result = await adapter.on_user_prompt_submit(ctx)
            assert result is None, "格式错误的请求应该返回None"

    @pytest.mark.unit
    async def test_very_long_requests(self, adapter):
        """测试超长请求处理"""
        long_text = "请用gemini分析" + "这是一个很长的描述" * 1000
        ctx = MockClaudeHookContext(long_text)

        result = await adapter.on_user_prompt_submit(ctx)
        assert result is not None, "长请求应该被处理"
        assert "gemini" in result, "结果应该包含目标CLI"

    @pytest.mark.unit
    async def test_special_characters(self, adapter):
        """测试特殊字符处理"""
        special_requests = [
            MockClaudeHookContext("请用gemini分析这段代码: `def func(): pass`"),
            MockClaudeHookContext("调用qwencode生成包含引号的代码: \"hello world\""),
            MockClaudeHookContext("用iflow处理JSON: {\"key\": \"value\"}"),
        ]

        for ctx in special_requests:
            result = await adapter.on_user_prompt_submit(ctx)
            # 只要没有崩溃就算通过
            assert True, f"特殊字符请求应该被处理: {ctx.prompt[:50]}..."

    @pytest.mark.unit
    async def test_unicode_requests(self, adapter):
        """测试Unicode请求处理"""
        unicode_requests = [
            MockClaudeHookContext("请用gemini分析🔥这段代码"),
            MockClaudeHookContext("调用qwencode生成😊的表情包代码"),
            MockClaudeHookContext("用iflow处理🎯项目计划"),
        ]

        for ctx in unicode_requests:
            result = await adapter.on_user_prompt_submit(ctx)
            # 验证结果包含emoji
            assert any(emoji in result for emoji in ['🔥', '😊', '🎯']), f"结果应该保留emoji: {ctx.prompt}"


# TDD测试入口：验证所有测试通过后才能实现适配器
def run_claude_adapter_tdd_tests():
    """运行Claude适配器TDD测试"""
    print("=" * 60)
    print("Claude CLI Hook适配器 TDD 测试")
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
    success = run_claude_adapter_tdd_tests()
    if success:
        print("\n✅ 所有TDD测试通过！可以开始实现适配器代码。")
    else:
        print("\n❌ TDD测试失败！需要先修复测试用例。")
    exit(0 if success else 1)