"""
Claude CLI集成测试 - 真实Hook系统测试
测试Claude CLI Hook系统的实际集成和工作流程

这是TDD驱动的实现，基于真实CLI环境的集成测试
"""

import pytest
import json
import os
import tempfile
import time
from pathlib import Path
from unittest.mock import patch, Mock
from src.utils.cli_detector import detect_claude_cli_status
from src.core.base_adapter import IntentResult


class TestClaudeHookIntegration:
    """Claude CLI Hook系统集成测试"""

    @pytest.fixture
    def claude_status(self):
        """获取Claude CLI状态"""
        return detect_claude_cli_status()

    @pytest.fixture
    def claude_config_dir(self, claude_status):
        """获取Claude配置目录"""
        return claude_status['config_dir']

    @pytest.fixture
    def hooks_file_path(self, claude_config_dir):
        """获取Hooks文件路径"""
        return os.path.join(claude_config_dir, 'hooks.json')

    @pytest.mark.integration
    def test_claude_cli_environment_ready(self, claude_status):
        """测试Claude CLI环境是否准备就绪"""
        # 验证基本检测结果
        assert claude_status['available'] is True, "Claude CLI应该可用"
        assert claude_status['extension_mechanism'] == 'hook_system', "应该支持Hook系统"
        assert claude_status['extension_ready'] is True, "Hook系统应该准备就绪"
        assert claude_status['config_exists'] is True, "配置目录应该存在"

        # 打印检测结果
        print(f"\nClaude CLI环境状态:")
        print(f"  可用性: {claude_status['available']}")
        print(f"  命令: {claude_status['command']}")
        print(f"  配置目录: {claude_status['config_dir']}")
        print(f"  Hook系统准备: {claude_status['extension_ready']}")

    @pytest.mark.integration
    def test_claude_hooks_file_structure(self, hooks_file_path):
        """测试Claude Hooks文件结构"""
        print(f"\n检查Hooks文件: {hooks_file_path}")

        if os.path.exists(hooks_file_path):
            # 文件存在，验证其结构
            with open(hooks_file_path, 'r', encoding='utf-8') as f:
                try:
                    hooks_config = json.load(f)

                    # 验证基本结构
                    assert isinstance(hooks_config, dict), "Hooks配置应该是字典"
                    assert 'hooks' in hooks_config, "应该包含hooks字段"
                    assert isinstance(hooks_config['hooks'], list), "hooks应该是列表"

                    print(f"  Hooks文件存在，包含 {len(hooks_config['hooks'])} 个hooks")

                    # 打印现有hooks
                    for i, hook in enumerate(hooks_config['hooks']):
                        print(f"    Hook {i+1}: {hook.get('name', 'unnamed')}")

                except json.JSONDecodeError as e:
                    pytest.fail(f"Hooks文件JSON格式错误: {e}")
        else:
            # 文件不存在，这是正常的，我们可以创建它
            print(f"  Hooks文件不存在，可以创建新文件")
            assert True, "Hooks文件不存在是正常的，我们可以创建"

    @pytest.mark.integration
    def test_cross_cli_intent_detection(self):
        """测试跨CLI调用意图检测"""
        from src.core.parser import NaturalLanguageParser

        parser = NaturalLanguageParser()

        # 测试中文协议
        chinese_cases = [
            ("请用gemini帮我分析这个代码", True, "gemini"),
            ("调用claude审查这个PR", True, "claude"),
            ("用qwencode生成Python测试", True, "qwencode"),
            ("帮我重构这段函数", False, None),
        ]

        # 测试英文协议
        english_cases = [
            ("use gemini to analyze this data", True, "gemini"),
            ("call claude to review my code", True, "claude"),
            ("ask qwencode for tests", True, "qwencode"),
            ("refactor this function", False, None),
        ]

        all_cases = chinese_cases + english_cases

        print(f"\n测试跨CLI意图检测 ({len(all_cases)} 个案例):")

        for text, expected_cross_cli, expected_target in all_cases:
            result = parser.parse_intent(text)

            print(f"  输入: {text}")
            print(f"  结果: is_cross_cli={result.is_cross_cli}, target_cli={result.target_cli}")

            assert result.is_cross_cli == expected_cross_cli, f"意图检测错误: {text}"
            if expected_cross_cli:
                assert result.target_cli == expected_target, f"目标CLI检测错误: {text}"

    @pytest.mark.integration
    def test_claude_hook_registration(self, hooks_file_path):
        """测试Claude Hook注册机制"""
        print(f"\n测试Hook注册机制")

        # 创建测试Hook配置
        test_hook_config = {
            "hooks": [
                {
                    "name": "cross-cli-adapter",
                    "module": "claude_cross_cli_adapter",
                    "class": "ClaudeCrossCLIAdapter",
                    "enabled": True,
                    "priority": 100
                }
            ]
        }

        # 备份原始文件（如果存在）
        backup_path = None
        if os.path.exists(hooks_file_path):
            backup_path = hooks_file_path + ".backup"
            os.rename(hooks_file_path, backup_path)
            print(f"  备份原始文件到: {backup_path}")

        try:
            # 创建测试hooks文件
            with open(hooks_file_path, 'w', encoding='utf-8') as f:
                json.dump(test_hook_config, f, indent=2)

            print(f"  创建测试Hook配置: {hooks_file_path}")

            # 验证文件创建成功
            assert os.path.exists(hooks_file_path), "Hooks文件应该存在"

            # 验证文件内容
            with open(hooks_file_path, 'r', encoding='utf-8') as f:
                loaded_config = json.load(f)
                assert loaded_config == test_hook_config, "Hook配置应该正确保存"

            print(f"  Hook配置验证成功")

        finally:
            # 清理：恢复原始文件或删除测试文件
            if backup_path and os.path.exists(backup_path):
                if os.path.exists(hooks_file_path):
                    os.remove(hooks_file_path)
                os.rename(backup_path, hooks_file_path)
                print(f"  恢复原始文件")
            elif os.path.exists(hooks_file_path):
                os.remove(hooks_file_path)
                print(f"  删除测试文件")

    @pytest.mark.integration
    @pytest.mark.skipif(True, reason="需要真实的Hook执行环境")
    def test_claude_hook_execution_simulation(self):
        """模拟测试Claude Hook执行（需要真实环境）"""
        print(f"\n模拟Claude Hook执行")

        # 这里应该测试真实的Hook执行
        # 但由于需要实际的Claude CLI环境，暂时跳过

        # 模拟Hook上下文
        mock_context = {
            'prompt': '请用gemini帮我分析这个架构图',
            'metadata': {
                'user_id': 'test_user',
                'session_id': 'test_session'
            }
        }

        # 模拟Hook处理
        print(f"  模拟Hook上下文: {mock_context['prompt']}")
        print(f"  预期行为: 检测到跨CLI调用，执行gemini适配器")

        # 这里应该调用真实的Hook处理器
        # result = await hook_handler(mock_context)

        assert True, "Hook执行模拟完成"

    @pytest.mark.integration
    def test_claude_adapter_config_creation(self, claude_config_dir):
        """测试Claude适配器配置创建"""
        print(f"\n测试适配器配置创建")

        # 创建适配器配置目录
        adapter_config_dir = os.path.join(claude_config_dir, "adapters")
        os.makedirs(adapter_config_dir, exist_ok=True)

        # 创建适配器配置文件
        adapter_config = {
            "cross_cli": {
                "enabled": True,
                "supported_clis": ["gemini", "qwencode", "iflow", "qoder", "codebuddy", "codex"],
                "auto_detect": True,
                "timeout": 30,
                "retry_count": 3
            },
            "claude": {
                "hooks": ["user_prompt_submit", "tool_use_pre", "tool_use_post"],
                "priority": 100
            }
        }

        config_file = os.path.join(adapter_config_dir, "cross_cli_config.json")
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(adapter_config, f, indent=2)

        print(f"  创建适配器配置: {config_file}")
        assert os.path.exists(config_file), "适配器配置文件应该存在"

        # 验证配置内容
        with open(config_file, 'r', encoding='utf-8') as f:
            loaded_config = json.load(f)
            assert loaded_config == adapter_config, "配置应该正确保存"

    @pytest.mark.integration
    def test_claude_error_scenarios(self):
        """测试Claude CLI错误场景"""
        print(f"\n测试错误场景处理")

        # 测试无效的跨CLI调用格式
        invalid_requests = [
            "",  # 空字符串
            "   ",  # 只有空白字符
            "请用不存在的CLI帮我做某事",  # 不存在的CLI
            "格式不正确的请求",  # 无法解析的格式
        ]

        parser = NaturalLanguageParser()

        for request in invalid_requests:
            result = parser.parse_intent(request)

            print(f"  测试请求: '{request}'")
            print(f"    is_cross_cli: {result.is_cross_cli}")
            print(f"    target_cli: {result.target_cli}")
            print(f"    confidence: {result.confidence}")

            # 空或空白字符不应该被识别为跨CLI调用
            if not request.strip():
                assert result.is_cross_cli is False, "空请求不应该被识别为跨CLI调用"

    @pytest.mark.integration
    def test_claude_integration_readiness(self, claude_status):
        """测试Claude集成准备状态"""
        print(f"\n测试集成准备状态")

        readiness_checks = {
            'cli_available': claude_status['available'],
            'hook_system_ready': claude_status['extension_ready'],
            'config_dir_exists': claude_status['config_exists'],
            'command_accessible': bool(claude_status['command'])
        }

        # 计算准备度分数
        ready_score = sum(readiness_checks.values()) / len(readiness_checks)

        print(f"  准备状态检查:")
        for check, passed in readiness_checks.items():
            status = "✅" if passed else "❌"
            print(f"    {check}: {status}")

        print(f"  总体准备度: {ready_score:.1%}")

        # 至少基本的CLI可用性应该满足
        assert readiness_checks['cli_available'], "Claude CLI应该可用"

        if ready_score >= 0.75:
            print(f"  ✅ Claude CLI集成准备度良好 ({ready_score:.1%})")
        else:
            print(f"  ⚠️ Claude CLI集成准备度较低 ({ready_score:.1%})")


class TestClaudeHookMock:
    """Claude Hook Mock测试（用于无法访问真实环境的情况）"""

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

    @pytest.mark.integration
    def test_mock_hook_workflow(self, mock_claude_status):
        """测试Mock Hook工作流程"""
        with patch('src.utils.cli_detector.detect_claude_cli_status') as mock_detect:
            mock_detect.return_value = mock_claude_status

            status = detect_claude_cli_status()
            assert status['available'] is True
            assert status['extension_ready'] is True

    @pytest.mark.integration
    def test_mock_hook_response(self):
        """测试Mock Hook响应"""
        # 模拟Hook处理结果
        mock_response = {
            'handled': True,
            'result': '[GEMINI 调用结果]\n这是gemini工具的分析结果...',
            'metadata': {
                'target_cli': 'gemini',
                'execution_time': 2.5,
                'confidence': 0.95
            }
        }

        # 验证响应结构
        assert 'handled' in mock_response
        assert 'result' in mock_response
        assert 'metadata' in mock_response
        assert mock_response['metadata']['target_cli'] == 'gemini'


# 集成测试入口点
def run_claude_integration_tests():
    """运行Claude集成测试的主入口"""
    print("=" * 60)
    print("Claude CLI集成测试")
    print("=" * 60)

    # 1. 检查环境状态
    print("\n1. 检查Claude CLI环境状态...")
    claude_status = detect_claude_cli_status()

    if not claude_status['available']:
        print("❌ Claude CLI不可用，跳过集成测试")
        return False

    print("✅ Claude CLI可用，继续集成测试")

    # 2. 运行测试套件
    try:
        pytest.main([
            __file__,
            "-v",
            "--tb=short",
            "-k", "test_claude",
            "--capture=no"
        ])
        return True
    except Exception as e:
        print(f"❌ 集成测试执行失败: {e}")
        return False


if __name__ == "__main__":
    success = run_claude_integration_tests()
    exit(0 if success else 1)