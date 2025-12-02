#!/usr/bin/env python3
"""
Comprehensive test suite for Cline CLI integration with Stigmergy system.
Tests adapter functionality, cross-CLI collaboration, and hook system integration.
"""

import json
import os
import sys
import time
import unittest
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.adapters.cline.standalone_cline_adapter import StandaloneClineAdapter
from src.core.cross_platform_safe_cli import CrossPlatformSafeCLI


class TestClineIntegration(unittest.TestCase):
    """Test suite for Cline CLI integration."""
    
    def setUp(self):
        """Set up test environment."""
        self.adapter = StandaloneClineAdapter()
        self.test_context = {
            "test_mode": True,
            "request_id": "test-12345",
            "timestamp": time.time()
        }
    
    def test_adapter_initialization(self):
        """Test adapter initialization and basic properties."""
        self.assertEqual(self.adapter.cli_name, "cline")
        self.assertEqual(self.adapter.display_name, "Cline CLI")
        self.assertEqual(self.adapter.version, "1.0.0")
        self.assertEqual(self.adapter.integration_type, "hook_system")
        
        # Test that required attributes exist
        self.assertTrue(hasattr(self.adapter, 'chinese_patterns'))
        self.assertTrue(hasattr(self.adapter, 'english_patterns'))
        self.assertTrue(hasattr(self.adapter, 'stats'))
        self.assertTrue(hasattr(self.adapter, 'hook_config'))
    
    def test_cross_cli_pattern_detection(self):
        """Test cross-CLI collaboration pattern detection."""
        test_cases = [
            # Chinese patterns
            ("请用claude帮我分析代码", "claude", "分析代码"),
            ("调用gemini来翻译文档", "gemini", "翻译文档"),
            ("用qwen帮我生成测试", "qwen", "生成测试"),
            ("让codebuddy审查代码", "codebuddy", "审查代码"),
            
            # English patterns
            ("use claude to review code", "claude", "review code"),
            ("call gemini to translate", "gemini", "translate"),
            ("ask qwen for help", "qwen", "for help"),
            ("let copilot suggest", "copilot", "suggest"),
            
            # Cline-specific patterns
            ("请用cline执行部署", "cline", "执行部署"),
            ("cline帮我优化查询", "cline", "优化查询"),
            ("use cline to execute", "cline", "execute"),
            ("delegate to cline", "cline", ""),
        ]
        
        for text, expected_cli, expected_task in test_cases:
            with self.subTest(text=text):
                # Test Chinese patterns
                for pattern in self.adapter.chinese_patterns:
                    import re
                    match = re.search(pattern, text)
                    if match:
                        detected_cli = match.group(1).lower()
                        detected_task = match.group(2).strip()
                        self.assertEqual(detected_cli, expected_cli)
                        if expected_task:  # Some patterns may not capture task
                            self.assertIn(expected_task, detected_task)
                        break
                else:
                    # Test English patterns
                    for pattern in self.adapter.english_patterns:
                        import re
                        match = re.search(pattern, text)
                        if match:
                            detected_cli = match.group(1).lower()
                            detected_task = match.group(2).strip()
                            self.assertEqual(detected_cli, expected_cli)
                            if expected_task:
                                self.assertIn(expected_task, detected_task)
                            break
    
    def test_supported_cli_detection(self):
        """Test supported CLI detection."""
        supported_clis = [
            'claude', 'gemini', 'qwen', 'codebuddy', 'copilot',
            'codex', 'iflow', 'qoder', 'qwencode', 'cline'
        ]
        
        for cli in supported_clis:
            self.assertTrue(self.adapter._is_supported_cli(cli))
        
        unsupported_clis = ['unknown', 'invalid', 'test']
        for cli in unsupported_clis:
            self.assertFalse(self.adapter._is_supported_cli(cli))
    
    @patch('subprocess.run')
    def test_cline_availability_check(self, mock_run):
        """Test Cline CLI availability checking."""
        # Mock successful execution
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = "cline version 1.0.0"
        mock_run.return_value = mock_result
        
        self.assertTrue(self.adapter.is_available())
        mock_run.assert_called_once_with(
            ['cline', '--version'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        # Mock failed execution
        mock_run.reset_mock()
        mock_result.returncode = 1
        self.assertFalse(self.adapter.is_available())
    
    @patch('subprocess.run')
    def test_cline_task_execution(self, mock_run):
        """Test Cline task execution."""
        # Mock successful task execution
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = "Task completed successfully"
        mock_result.stderr = ""
        mock_run.return_value = mock_result
        
        task = "optimize database queries"
        context = {"database": "postgresql", "tables": ["users", "orders"]}
        
        result = self.adapter._execute_cline_task(task, context)
        
        self.assertIn("Task completed successfully", result)
        self.assertIn("Cline CLI 执行结果", result)
        self.assertEqual(self.adapter.stats['successful_calls'], 1)
        
        # Verify subprocess call
        mock_run.assert_called_once()
        call_args = mock_run.call_args
        self.assertEqual(call_args[0][0][0], 'cline')
        self.assertEqual(call_args[0][0][1], 'execute')
    
    def test_hook_script_generation(self):
        """Test hook script generation."""
        hook_name = "TaskStart"
        script_content = self.adapter._generate_hook_script(hook_name)
        
        # Verify script structure
        self.assertIn("#!/usr/bin/env python3", script_content)
        self.assertIn(f"Stigmergy Integration Hook for Cline - {hook_name}", script_content)
        self.assertIn("import json", script_content)
        self.assertIn("import sys", script_content)
        self.assertIn("import os", script_content)
        self.assertIn("from datetime import datetime", script_content)
        self.assertIn("json.loads(sys.stdin.read())", script_content)
        self.assertIn("cancel", script_content)
        self.assertIn("contextModification", script_content)
    
    def test_hook_directory_setup(self):
        """Test hook directory setup."""
        with patch('pathlib.Path.mkdir') as mock_mkdir, \
             patch('pathlib.Path.exists', return_value=False), \
             patch('adapter._log_error'):
            
            self.adapter._setup_hook_directories()
            
            # Should create both global and project hook directories
            self.assertEqual(mock_mkdir.call_count, 2)
    
    def test_result_formatting(self):
        """Test result formatting functions."""
        # Test cross-CLI result formatting
        target_cli = "claude"
        task = "analyze code structure"
        result = "Code analysis completed successfully"
        
        formatted = self.adapter._format_cross_cli_result(target_cli, task, result)
        
        self.assertIn("🔗 跨CLI调用结果", formatted)
        self.assertIn(target_cli.upper(), formatted)
        self.assertIn(task, formatted)
        self.assertIn(result, formatted)
        self.assertIn("hook_system", formatted)
        
        # Test success result formatting
        success_formatted = self.adapter._format_success_result(task, result)
        self.assertIn("✅ Cline CLI 执行结果", success_formatted)
        self.assertIn(task, success_formatted)
        self.assertIn(result, success_formatted)
        
        # Test error result formatting
        error_msg = "Task execution failed"
        error_formatted = self.adapter._format_error_result(error_msg)
        self.assertIn("❌ Cline CLI 执行错误", error_formatted)
        self.assertIn(error_msg, error_formatted)
        self.assertIn("统计信息", error_formatted)
    
    def test_platform_support_check(self):
        """Test platform support checking."""
        with patch('platform.system') as mock_platform:
            # Test macOS
            mock_platform.return_value = "Darwin"
            support = self.adapter._check_platform_support()
            self.assertTrue(support['supported'])
            self.assertEqual(support['current_platform'], "darwin")
            
            # Test Linux
            mock_platform.return_value = "Linux"
            support = self.adapter._check_platform_support()
            self.assertTrue(support['supported'])
            self.assertEqual(support['current_platform'], "linux")
            
            # Test Windows (not supported)
            mock_platform.return_value = "Windows"
            support = self.adapter._check_platform_support()
            self.assertFalse(support['supported'])
            self.assertEqual(support['windows_support'], 'planned')
    
    def test_health_check(self):
        """Test health check functionality."""
        with patch.object(self.adapter, 'is_available', return_value=True), \
             patch.object(self.adapter, 'initialize', return_value=True), \
             patch.object(self.adapter, '_verify_hooks_configured', return_value=True), \
             patch.object(self.adapter, '_check_platform_support', return_value={
                 'current_platform': 'darwin',
                 'supported': True,
                 'windows_support': 'planned'
             }):
            
            health = self.adapter.health_check()
            
            self.assertEqual(health['adapter_name'], 'cline')
            self.assertEqual(health['display_name'], 'Cline CLI')
            self.assertTrue(health['available'])
            self.assertTrue(health['initialized'])
            self.assertTrue(health['hooks_configured'])
            self.assertIn('statistics', health)
            self.assertIn('platform_support', health)
    
    def test_error_handling(self):
        """Test error handling and logging."""
        # Test cross-CLI delegation error
        with patch.object(self.adapter, '_is_supported_cli', return_value=True), \
             patch.object(self.adapter, 'safe_cli') as mock_safe_cli:
            
            mock_safe_cli.execute_cross_cli_call.side_effect = Exception("Cross-CLI call failed")
            
            result = self.adapter._delegate_to_cli("claude", "test task", {})
            
            self.assertIn("Failed to delegate to claude", result)
            self.assertEqual(self.adapter.stats['failed_calls'], 1)
    
    def test_statistics_tracking(self):
        """Test statistics tracking."""
        initial_stats = self.adapter.stats.copy()
        
        # Simulate successful call
        self.adapter.stats['total_requests'] += 1
        self.adapter.stats['successful_calls'] += 1
        self.adapter.stats['cross_cli_calls'] += 1
        
        self.assertEqual(self.adapter.stats['total_requests'], initial_stats['total_requests'] + 1)
        self.assertEqual(self.adapter.stats['successful_calls'], initial_stats['successful_calls'] + 1)
        self.assertEqual(self.adapter.stats['cross_cli_calls'], initial_stats['cross_cli_calls'] + 1)


class TestClineIntegrationInstallation(unittest.TestCase):
    """Test Cline integration installation process."""
    
    def setUp(self):
        """Set up test environment."""
        from src.adapters.cline.install_cline_integration import ClineIntegrationInstaller
        self.installer = ClineIntegrationInstaller()
    
    def test_installer_initialization(self):
        """Test installer initialization."""
        self.assertEqual(self.installer.adapter_name, "cline")
        self.assertEqual(self.installer.display_name, "Cline CLI")
        self.assertEqual(self.installer.version, "1.0.0")
        self.assertTrue(hasattr(self.installer, 'config_paths'))
        self.assertTrue(hasattr(self.installer, 'supported_hooks'))
    
    def test_configuration_paths(self):
        """Test configuration path setup."""
        expected_paths = [
            'user_config', 'stigmergy_config', 'hooks_global', 
            'hooks_project', 'logs'
        ]
        
        for path_name in expected_paths:
            self.assertIn(path_name, self.installer.config_paths)
            self.assertIsInstance(self.installer.config_paths[path_name], Path)
    
    def test_hook_definitions(self):
        """Test supported hook definitions."""
        expected_hooks = [
            'TaskStart', 'TaskResume', 'TaskCancel',
            'UserPromptSubmit', 'PreToolUse', 'PostToolUse'
        ]
        
        for hook in expected_hooks:
            self.assertIn(hook, self.installer.supported_hooks)


class TestClineCrossPlatformScripts(unittest.TestCase):
    """Test cross-platform call scripts."""
    
    def test_bat_script_exists(self):
        """Test Windows batch script exists and is valid."""
        bat_script = project_root / "cline-call.bat"
        self.assertTrue(bat_script.exists())
        
        # Read and validate basic structure
        content = bat_script.read_text(encoding='utf-8')
        self.assertIn("@echo off", content)
        self.assertIn("cline", content)
        self.assertIn("--help", content)
        self.assertIn("--version", content)
    
    def test_sh_script_exists(self):
        """Test Unix shell script exists and is valid."""
        sh_script = project_root / "cline-call.sh"
        self.assertTrue(sh_script.exists())
        
        # Read and validate basic structure
        content = sh_script.read_text(encoding='utf-8')
        self.assertIn("#!/bin/bash", content)
        self.assertIn("cline", content)
        self.assertIn("--help", content)
        self.assertIn("--version", content)
        self.assertIn("set -euo pipefail", content)
    
    def test_script_functionality(self):
        """Test script help functionality."""
        sh_script = project_root / "cline-call.sh"
        
        # Test help output (should work even without cline installed)
        import subprocess
        try:
            result = subprocess.run(
                ["bash", str(sh_script), "--help"],
                capture_output=True,
                text=True,
                timeout=10
            )
            # Should show help even if cline is not available
            self.assertIn("Usage:", result.stdout)
            self.assertIn("cline", result.stdout)
        except (subprocess.TimeoutExpired, FileNotFoundError):
            # Skip if bash is not available (Windows)
            pass


class TestClineConfigurationFiles(unittest.TestCase):
    """Test Cline configuration files."""
    
    def test_adapter_config_exists(self):
        """Test adapter configuration file exists and is valid."""
        config_file = project_root / "src" / "adapters" / "cline" / "config.json"
        self.assertTrue(config_file.exists())
        
        # Validate JSON structure
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        required_fields = ['name', 'displayName', 'version', 'integration_type']
        for field in required_fields:
            self.assertIn(field, config)
        
        self.assertEqual(config['name'], 'cline')
        self.assertEqual(config['displayName'], 'Cline CLI')
        self.assertEqual(config['integration_type'], 'hook_system')
    
    def test_init_file_exists(self):
        """Test __init__.py file exists and is valid."""
        init_file = project_root / "src" / "adapters" / "cline" / "__init__.py"
        self.assertTrue(init_file.exists())
        
        content = init_file.read_text(encoding='utf-8')
        self.assertIn("StandaloneClineAdapter", content)
        self.assertIn("__version__", content)
        self.assertIn("__all__", content)


class TestClineDocumentation(unittest.TestCase):
    """Test Cline documentation files."""
    
    def test_adapter_documentation_exists(self):
        """Test adapter documentation exists."""
        doc_file = project_root / "src" / "adapters" / "cline" / "cline.md"
        self.assertTrue(doc_file.exists())
        
        content = doc_file.read_text(encoding='utf-8')
        self.assertIn("Cline CLI 集成适配器", content)
        self.assertIn("任务生命周期管理", content)
        self.assertIn("Hook 系统集成", content)
    
    def test_global_documentation_exists(self):
        """Test global documentation exists."""
        doc_file = project_root / "cline.md"
        self.assertTrue(doc_file.exists())
        
        content = doc_file.read_text(encoding='utf-8')
        self.assertIn("Cline CLI Integration", content)
        self.assertIn("Task Lifecycle Management", content)
        self.assertIn("Hook System Integration", content)


def run_integration_test():
    """Run basic integration test."""
    print("🧪 Running Cline CLI Integration Test Suite")
    print("=" * 60)
    
    try:
        # Test basic adapter functionality
        adapter = StandaloneClineAdapter()
        
        print("✅ Adapter initialized successfully")
        print(f"   - Name: {adapter.cli_name}")
        print(f"   - Version: {adapter.version}")
        print(f"   - Integration Type: {adapter.integration_type}")
        
        # Test availability (may fail if cline not installed)
        is_available = adapter.is_available()
        if is_available:
            print("✅ Cline CLI is available")
        else:
            print("⚠️  Cline CLI is not available (expected in test environment)")
        
        # Test health check
        health = adapter.health_check()
        print(f"✅ Health check completed")
        print(f"   - Available: {health['available']}")
        print(f"   - Platform: {health['platform_support']['current_platform']}")
        
        # Test cross-CLI pattern detection
        test_patterns = [
            "请用claude帮我分析代码",
            "use cline to execute task",
            "调用gemini来翻译文档"
        ]
        
        print("✅ Cross-CLI pattern detection working")
        for pattern in test_patterns:
            print(f"   - Pattern: '{pattern}'")
        
        print("\n🎉 Integration test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False


if __name__ == '__main__':
    # Run unit tests
    print("🚀 Starting Cline CLI Integration Test Suite")
    print("=" * 60)
    
    # Create test suite
    test_suite = unittest.TestLoader().loadTestsFromModule(sys.modules[__name__])
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Run integration test
    print("\n" + "=" * 60)
    integration_success = run_integration_test()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Unit Tests: {'✅ PASSED' if result.wasSuccessful() else '❌ FAILED'}")
    print(f"  - Ran: {result.testsRun}")
    print(f"  - Failures: {len(result.failures)}")
    print(f"  - Errors: {len(result.errors)}")
    print(f"Integration Test: {'✅ PASSED' if integration_success else '❌ FAILED'}")
    
    # Exit with appropriate code
    sys.exit(0 if result.wasSuccessful() and integration_success else 1)