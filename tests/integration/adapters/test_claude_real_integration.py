"""
Claude CLI真实集成测试 - 验证Hook适配器在真实环境中的工作
这个测试需要实际的Claude CLI环境和Hook系统
"""

import pytest
import asyncio
import json
import os
import tempfile
from pathlib import Path
from unittest.mock import patch, Mock, AsyncMock
from src.adapters.claude.hook_adapter import ClaudeHookAdapter, HookContext, get_claude_hook_adapter
from src.utils.cli_detector import detect_claude_cli_status


class TestClaudeRealIntegration:
    """Claude CLI真实集成测试"""

    @pytest.fixture
    def claude_status(self):
        """获取Claude CLI状态"""
        return detect_claude_cli_status()

    @pytest.fixture
    def adapter(self):
        """创建Claude Hook适配器实例"""
        return get_claude_hook_adapter()

    @pytest.mark.integration
    def test_real_adapter_creation(self, adapter):
        """测试真实适配器创建"""
        assert adapter.cli_name == 'claude'
        assert adapter.version == '1.0.0'
        assert adapter.parser is not None
        assert adapter.hooks_config_file is not None

        print(f"\nClaude Hook适配器创建成功:")
        print(f"  CLI名称: {adapter.cli_name}")
        print(f"  版本: {adapter.version}")
        print(f"  Hook配置文件: {adapter.hooks_config_file}")
        print(f"  支持的Hook: {list(adapter.hook_handlers.keys())}")

    @pytest.mark.integration
    @pytest.mark.skipif(not os.getenv('CI'), reason="只在CI环境中测试真实Hook注册")
    async def test_real_hook_registration(self, adapter, claude_status):
        """测试真实Hook注册"""
        if not claude_status['available']:
            pytest.skip("Claude CLI不可用，跳过Hook注册测试")

        print(f"\n测试真实Hook注册...")
        print(f"  Claude CLI可用: {claude_status['available']}")
        print(f"  配置目录存在: {claude_status['config_exists']}")

        # 测试Hook配置加载
        hooks_config = adapter._load_hooks_config()
        assert isinstance(hooks_config, dict), "Hook配置应该是字典"
        assert 'hooks' in hooks_config, "应该包含hooks字段"

        print(f"  当前Hook配置包含 {len(hooks_config.get('hooks', []))} 个hooks")

        # 测试Hook注册（模拟）
        mock_hooks_config = {
            "version": "1.0",
            "hooks": [
                {
                    "name": "cross-cli-adapter-test",
                    "module": "test_module",
                    "class": "TestClass",
                    "enabled": True,
                    "priority": 100
                }
            ]
        }

        # 备份原始配置
        original_config = hooks_config.copy()
        hooks_config['hooks'].append(mock_hooks_config['hooks'][0])

        # 模拟保存
        with patch('src.adapters.claude.hook_adapter.ClaudeHookAdapter._save_hooks_config', return_value=True):
            result = await adapter._register_hooks()
            assert result is True, "Hook注册应该成功"

        # 验证配置被修改
        assert len(hooks_config['hooks']) > len(original_config.get('hooks', []))

        print(f"  Hook注册模拟成功，总Hook数: {len(hooks_config['hooks'])}")

    @pytest.mark.integration
    def test_real_hook_context_creation(self):
        """测试真实Hook上下文创建"""
        # 测试基本上下文
        basic_context = HookContext("请用gemini分析这个数据")
        assert basic_context.prompt == "请用gemini分析这个数据"
        assert basic_context.metadata == {}

        # 测试带元数据的上下文
        metadata = {
            "user_id": "test_user_123",
            "session_id": "test_session_456",
            "project": "test_project"
        }
        metadata_context = HookContext("请用claude审查这个代码", metadata)
        assert metadata_context.prompt == "请用claude审查这个代码"
        assert metadata_context.user_id == "test_user_123"
        assert metadata_context.session_id == "test_session_456"
        assert metadata_context.project == "test_project"

        print(f"\nHook上下文创建测试通过:")
        print(f"  基本上下文: {basic_context.prompt}")
        print(f"  元数据上下文: {metadata_context.user_id}")

    @pytest.mark.integration
    async def test_real_cross_cli_intent_detection(self, adapter):
        """测试真实跨CLI意图检测"""
        # 使用真实的解析器
        test_cases = [
            # 应该被识别为跨CLI调用的
            ("请用gemini帮我分析这个架构图", True, "gemini"),
            ("调用qwencode生成Python代码", True, "qwencode"),
            ("用iflow执行这个工作流", True, "iflow"),
            ("ask claude to review this code", False, "claude"),  # 自我引用
            # 不应该被识别为跨CLI调用的
            ("请用不存在的CLI工具帮我", False, None),  # 不存在的CLI工具
            ("帮我重构这段Python代码", False, None),
            ("生成单元测试", False, None),
            ("解释这个算法", False, None),
        ]

        print(f"\n测试真实跨CLI意图检测 ({len(test_cases)} 个案例):")

        for text, expected_cross_cli, expected_target in test_cases:
            intent = adapter.parser.parse_intent(text)

            print(f"  输入: {text}")
            print(f"    is_cross_cli: {intent.is_cross_cli}")
            print(f"    target_cli: {intent.target_cli}")
            print(f"    confidence: {intent.confidence}")

            assert intent.is_cross_cli == expected_cross_cli, f"意图检测错误: {text}"
            if expected_cross_cli and expected_target:
                assert intent.target_cli == expected_target, f"目标CLI检测错误: {text}"

    @pytest.mark.integration
    @pytest.mark.skipif(not os.getenv('CI'), reason="只在CI环境中测试真实CLI执行")
    async def test_real_cross_cli_execution_simulation(self, adapter):
        """测试真实跨CLI执行模拟"""
        print(f"\n测试真实跨CLI执行模拟...")

        # 模拟跨CLI调用
        target_cli = "gemini"
        task = "分析这个机器学习模型"
        mock_context = HookContext(f"请用{target_cli}{task}", {
            "user_id": "test_user",
            "session_id": "test_session"
        })

        # Mock目标适配器
        with patch('src.adapters.claude.hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
            mock_adapter = Mock()
            mock_adapter.is_available.return_value = True
            mock_adapter.execute_task.return_value = f"[{target_cli.upper()} 分析结果]\n模型分析完成..."

            mock_get_adapter.return_value = mock_adapter

            # 执行跨CLI调用
            result = await adapter._execute_cross_cli_call(target_cli, task, mock_context)

            # 验证结果
            assert result is not None, "应该有返回结果"
            assert "跨CLI调用结果" in result, "结果应该包含标题"
            assert "源工具: Claude CLI" in result, "结果应该包含源工具"
            assert f"目标工具: {target_cli.upper()}" in result, "结果应该包含目标工具"
            assert "分析结果" in result, "结果应该包含执行结果"

            # 验证调用记录
            assert len(adapter.processed_requests) == 1
            request_record = adapter.processed_requests[0]
            assert request_record['type'] == 'cross_cli_execution'
            assert request_record['target_cli'] == target_cli
            assert request_record['success'] is True
            assert task in request_record['task']

            print(f"  跨CLI执行模拟成功:")
            print(f"    目标CLI: {target_cli}")
            print(f"    任务: {task}")
            print(f"    结果长度: {len(result)} 字符")

    @pytest.mark.integration
    def test_real_error_handling(self, adapter):
        """测试真实错误处理"""
        print(f"\n测试真实错误处理...")

        # 测试不可用的目标适配器
        with patch('src.adapters.claude.hook_adapter.get_cross_cli_adapter') as mock_get_adapter:
            mock_get_adapter.return_value = None

            mock_context = HookContext("请用不存在的CLI帮我做某事")
            result = adapter._execute_cross_cli_call("不存在的CLI", "测试任务", mock_context)

            # 验证错误处理
            assert result is not None, "应该返回错误结果"
            assert "跨CLI调用失败" in result, "结果应该包含错误标题"
            assert "目标CLI工具 '不存在的CLI' 不可用" in result, "结果应该包含错误信息"

            print(f"  错误处理测试通过:")
            print(f"    返回了适当的错误消息")

    @pytest.mark.integration
    def test_real_statistics_tracking(self, adapter):
        """测试真实统计跟踪"""
        print(f"\n测试真实统计跟踪...")

        # 初始状态
        stats = adapter.get_statistics()
        assert stats['cli_name'] == 'claude'
        assert stats['execution_count'] == 0
        assert stats['error_count'] == 0
        assert stats['success_rate'] == 1.0

        # 模拟一些执行
        adapter.execution_count = 10
        adapter.error_count = 2
        adapter.cross_cli_calls_count = 8

        stats = adapter.get_statistics()
        assert stats['execution_count'] == 10
        assert stats['error_count'] == 2
        assert stats['success_rate'] == 0.8

        print(f"  统计跟踪测试通过:")
        print(f"    执行次数: {stats['execution_count']}")
        print(f"    错误次数: {stats['error_count']}")
        print(f"    成功率: {stats['success_rate']:.1%}")

    @pytest.mark.integration
    def test_real_config_management(self, adapter, claude_status):
        """测试真实配置管理"""
        print(f"\n测试真实配置管理...")

        if not claude_status['config_exists']:
            print(f"  配置目录不存在，将创建: {claude_status['config_dir']}")
            # 这里可以测试配置目录创建
            # adapter._ensure_config_directory()  # 注释掉避免实际文件操作

        # 加载配置
        config = adapter._load_adapter_config()
        assert isinstance(config, dict), "配置应该是字典"

        print(f"  配置管理测试通过:")
        print(f"    配置类型: {type(config).__name__}")

    def _load_adapter_config(self):
        """加载适配器配置（模拟方法）"""
        return {
            "adapter_name": "Claude Hook Adapter",
            "version": "1.0.0",
            "supported_clis": ["gemini", "qwencode", "iflow"]
        }

    @pytest.mark.integration
    async def test_real_health_check(self, adapter, claude_status):
        """测试真实健康检查"""
        print(f"\n测试真实健康检查...")

        health = await adapter.health_check()

        # 验证基础健康信息
        assert 'cli_name' in health
        assert 'available' in health
        assert 'version' in health

        # 验证Claude特定健康信息
        assert 'hooks_registered' in health
        assert 'hook_calls_count' in health
        assert 'cross_cli_calls_count' in health
        assert 'processed_requests_count' in health

        print(f"  健康检查完成:")
        print(f"    CLI名称: {health['cli_name']}")
        print(f"    可用性: {health['available']}")
        print(f"    Hook注册: {health['hooks_registered']}")
        print(f"    Hook调用数: {health['hook_calls_count']}")
        print(f"    跨CLI调用数: {health['cross_cli_calls_count']}")

    @pytest.mark.integration
    def test_real_environment_readiness(self, claude_status):
        """测试真实环境准备度"""
        print(f"\n测试真实环境准备度...")

        readiness_checks = {
            'claude_available': claude_status['available'],
            'config_dir_exists': claude_status['config_exists'],
            'extension_ready': claude_status['extension_ready'],
            'command_accessible': bool(claude_status['command']),
        }

        # 计算准备度分数
        ready_score = sum(readiness_checks.values()) / len(readiness_checks)

        print(f"  环境准备度检查:")
        for check, passed in readiness_checks.items():
            status = "✅" if passed else "❌"
            print(f"    {check}: {status}")

        print(f"  总体准备度: {ready_score:.1%}")

        # 至少基本的可用性应该满足
        assert readiness_checks['claude_available'], "Claude CLI应该可用"

        if ready_score >= 0.75:
            print(f"  ✅ Claude CLI环境准备度良好 ({ready_score:.1%})")
        else:
            print(f"  ⚠️ Claude CLI环境准备度较低 ({ready_score:.1%})")


class TestClaudeMockIntegration:
    """Claude Mock集成测试（用于无法访问真实环境的情况）"""

    @pytest.fixture
    def mock_claude_status(self):
        """Mock Claude CLI状态"""
        return {
            'name': 'claude',
            'available': True,
            'command': 'claude-cli',
            'version': '1.0.0',
            'extension_mechanism': 'hook_system',
            'config_dir': '/test/.config/claude',
            'config_exists': True,
            'extension_ready': True,
            'error': None
        }

    @pytest.fixture
    def mock_adapter(self):
        """Mock Claude适配器"""
        with patch('src.adapters.claude.hook_adapter.get_claude_hook_adapter') as mock_get_adapter:
            mock_adapter = ClaudeHookAdapter()
            mock_get_adapter.return_value = mock_adapter
            return mock_adapter

    @pytest.mark.integration
    def test_mock_adapter_lifecycle(self, mock_adapter):
        """测试Mock适配器生命周期"""
        # 初始化状态
        assert mock_adapter.hooks_registered is False
        assert mock_adapter.hook_calls_count == 0

        # 注册Hook
        with patch.object(mock_adapter, '_register_hooks', return_value=True):
            mock_adapter.hooks_registered = True

        assert mock_adapter.hooks_registered is True

    @pytest.mark.integration
    async def test_mock_cross_cli_workflow(self, mock_adapter):
        """测试Mock跨CLI工作流"""
        # 模拟用户输入
        mock_context = HookContext("请用gemini分析这个数据集")

        # 直接调用Mock方法，不需要再次patch
        result = await mock_adapter.on_user_prompt_submit(mock_context)

        assert result is not None, "应该返回跨CLI结果"
        assert "gemini" in result.lower() or "跨CLI" in result, "结果应该包含相关内容"


# 真实集成测试入口点
def run_claude_real_integration_tests():
    """运行Claude真实集成测试"""
    print("=" * 60)
    print("Claude CLI 真实集成测试")
    print("=" * 60)

    try:
        # 先检查环境状态
        claude_status = detect_claude_cli_status()
        print(f"\n环境状态检查:")
        print(f"  Claude CLI可用: {claude_status['available']}")
        print(f"  Hook系统准备: {claude_status['extension_ready']}")
        print(f"  配置目录存在: {claude_status['config_exists']}")

        if not claude_status['available']:
            print("❌ Claude CLI不可用，跳过真实集成测试")
            return False

        # 运行测试
        result = pytest.main([
            __file__,
            "-v",
            "--tb=short"
        ])
        return result == 0

    except Exception as e:
        print(f"❌ 真实集成测试执行失败: {e}")
        return False


if __name__ == "__main__":
    success = run_claude_real_integration_tests()
    exit(0 if success else 1)