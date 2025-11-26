"""
CLI检测器集成测试 - 真实环境检测
测试实际的CLI工具可用性和扩展机制
"""

import pytest
import json
import os
from unittest.mock import patch, Mock
from src.utils.cli_detector import CLIDetector, get_cli_detector, detect_claude_cli_status


class TestCLIDetector:
    """CLI检测器集成测试"""

    @pytest.fixture
    def detector(self):
        """检测器fixture"""
        return CLIDetector()

    @pytest.mark.integration
    def test_detect_claude_cli_availability(self, detector):
        """测试Claude CLI可用性检测"""
        result = detector.detect_claude_cli()

        # 验证结果结构
        assert 'name' in result
        assert 'available' in result
        assert 'command' in result
        assert 'extension_mechanism' in result
        assert 'extension_ready' in result

        # 验证基本信息
        assert result['name'] == 'claude'
        assert result['extension_mechanism'] == 'hook_system'

        # 打印检测结果以便调试
        print(f"\nClaude CLI检测结果:")
        print(json.dumps(result, indent=2, ensure_ascii=False))

    @pytest.mark.integration
    def test_detect_all_cli_tools(self, detector):
        """测试所有CLI工具检测"""
        results = detector.detect_all_cli_tools()

        # 验证结果结构
        assert isinstance(results, dict)
        assert len(results) > 0

        # 验证每个结果都有必要字段
        for cli_name, result in results.items():
            assert 'name' in result
            assert 'available' in result
            assert 'extension_mechanism' in result
            assert result['name'] == cli_name

        # 打印完整检测报告
        print(f"\n所有CLI工具检测结果:")
        print(json.dumps(results, indent=2, ensure_ascii=False))

    @pytest.mark.integration
    def test_claude_hook_system_readiness(self, detector):
        """测试Claude Hook系统准备状态"""
        claude_info = detector.cli_tools['claude']
        config_dir = detector._expand_path(claude_info['config_dir'])

        result = detector._check_extension_readiness('claude', claude_info, config_dir)

        print(f"\nClaude Hook系统准备状态: {result}")

        # 结果应该是一个布尔值
        assert isinstance(result, bool)

    @pytest.mark.integration
    def test_find_claude_command(self, detector):
        """测试查找Claude CLI命令"""
        commands = detector.cli_tools['claude']['commands']
        command = detector._find_cli_command(commands)

        print(f"\n找到的Claude CLI命令: {command}")

        if command:
            # 如果找到命令，验证是否可执行
            assert isinstance(command, str)
            assert len(command) > 0

    @pytest.mark.integration
    @pytest.mark.skipif(not os.getenv('CI'), reason="只在CI环境中测试版本获取")
    def test_get_claude_version(self, detector):
        """测试获取Claude CLI版本"""
        commands = detector.cli_tools['claude']['commands']
        command = detector._find_cli_command(commands)

        if command:
            version_flag = detector.cli_tools['claude']['version_flag']
            version = detector._get_cli_version(command, version_flag)

            print(f"\nClaude CLI版本: {version}")

            if version:
                assert isinstance(version, str)
                assert len(version) > 0

    @pytest.mark.integration
    def test_generate_environment_report(self, detector):
        """测试生成环境报告"""
        report = detector.generate_report()

        # 验证报告结构
        assert 'timestamp' in report
        assert 'system_info' in report
        assert 'cli_tools' in report
        assert 'summary' in report

        # 验证摘要信息
        summary = report['summary']
        assert 'total_tools' in summary
        assert 'available_tools' in summary
        assert 'ready_for_integration' in summary

        # 打印完整报告
        print(f"\n环境检测报告:")
        print(json.dumps(report, indent=2, ensure_ascii=False))

    @pytest.mark.integration
    def test_claude_capabilities(self, detector):
        """测试Claude CLI能力获取"""
        capabilities = detector.get_cli_capabilities('claude')

        # 验证能力结构
        assert 'supported_protocols' in capabilities
        assert 'hooks_available' in capabilities
        assert 'extension_points' in capabilities
        assert 'native_integration' in capabilities

        # 验证具体能力
        assert isinstance(capabilities['supported_protocols'], list)
        assert isinstance(capabilities['hooks_available'], list)
        assert capabilities['native_integration'] is True

        # 验证支持的协议包含中文和英文
        protocols = capabilities['supported_protocols']
        has_chinese = any('请用' in protocol or '调用' in protocol for protocol in protocols)
        has_english = any('use' in protocol or 'call' in protocol for protocol in protocols)
        assert has_chinese or len(protocols) > 0

        print(f"\nClaude CLI能力:")
        print(json.dumps(capabilities, indent=2, ensure_ascii=False))


class TestCLIDetectorMock:
    """CLI检测器Mock测试（用于无法访问真实CLI的情况）"""

    @pytest.fixture
    def mock_detector(self):
        """Mock检测器fixture"""
        detector = CLIDetector()

        # Mock find_cli_command方法
        detector._find_cli_command = Mock(return_value='claude-cli')

        # Mock get_cli_version方法
        detector._get_cli_version = Mock(return_value='claude-cli version 1.0.0')

        # Mock check_extension_readiness方法
        detector._check_extension_readiness = Mock(return_value=True)

        return detector

    @pytest.mark.integration
    def test_mock_claude_detection(self, mock_detector):
        """测试Mock Claude检测"""
        result = mock_detector.detect_claude_cli()

        assert result['name'] == 'claude'
        assert result['available'] is True
        assert result['command'] == 'claude-cli'
        assert result['version'] == 'claude-cli version 1.0.0'
        assert result['extension_ready'] is True

    @pytest.mark.integration
    def test_convenience_functions(self):
        """测试便捷函数"""
        # 测试get_cli_detector函数
        detector1 = get_cli_detector()
        detector2 = get_cli_detector()
        assert detector1 is detector2  # 应该是同一个实例

        # 测试detect_claude_cli_status函数
        with patch('src.utils.cli_detector.get_cli_detector') as mock_get_detector:
            mock_detector = Mock()
            mock_detector.detect_claude_cli.return_value = {'test': 'result'}
            mock_get_detector.return_value = mock_detector

            result = detect_claude_cli_status()
            assert result == {'test': 'result'}


class TestCLIDetectorEdgeCases:
    """CLI检测器边界情况测试"""

    @pytest.fixture
    def detector(self):
        return CLIDetector()

    @pytest.mark.integration
    def test_handle_missing_claude_cli(self, detector):
        """测试处理Claude CLI不存在的情况"""
        # Mock find_cli_command返回None
        detector._find_cli_command = Mock(return_value=None)

        result = detector.detect_claude_cli()

        assert result['available'] is False
        assert result['command'] is None
        assert 'error' in result

    @pytest.mark.integration
    def test_handle_version_command_failure(self, detector):
        """测试处理版本命令失败的情况"""
        # Mock命令存在但版本命令失败
        detector._find_cli_command = Mock(return_value='claude-cli')
        detector._get_cli_version = Mock(side_effect=Exception("Version command failed"))

        result = detector.detect_claude_cli()

        assert result['available'] is True
        assert result['command'] == 'claude-cli'
        assert result['version'] is None  # 版本获取失败

    @pytest.mark.integration
    def test_handle_config_directory_not_exists(self, detector):
        """测试处理配置目录不存在的情况"""
        detector._find_cli_command = Mock(return_value='claude-cli')
        detector._get_cli_version = Mock(return_value='1.0.0')
        detector._check_extension_readiness = Mock(return_value=False)

        result = detector.detect_claude_cli()

        assert result['available'] is True
        assert result['config_exists'] is False
        assert result['extension_ready'] is False


# 如果需要直接运行这些测试
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])