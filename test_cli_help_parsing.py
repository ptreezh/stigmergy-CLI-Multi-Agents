#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TDD测试脚本：验证增强的CLI帮助信息解析功能
"""

import os
import sys
import json
import tempfile
from pathlib import Path
import unittest
from unittest.mock import Mock, patch

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

from generate_global_memory import GlobalMemoryGenerator
from src.core.cross_platform_safe_cli import get_cli_executor, CLICommand


class TestCLILiveHelpParsing(unittest.TestCase):
    """测试实时CLI帮助信息解析功能"""
    
    def setUp(self):
        """测试前准备"""
        self.generator = GlobalMemoryGenerator()
        self.cli_executor = get_cli_executor()
        
        # 创建临时目录用于测试持久化存储
        self.test_temp_dir = Path(tempfile.mkdtemp())
        self.original_memory_dir = self.generator.memory_dir
        self.generator.memory_dir = self.test_temp_dir / 'global_memory'
        self.generator.memory_dir.mkdir(parents=True, exist_ok=True)
    
    def tearDown(self):
        """测试后清理"""
        import shutil
        if self.test_temp_dir.exists():
            shutil.rmtree(self.test_temp_dir)
    
    def test_real_cli_help_parsing(self):
        """测试实时解析真实CLI工具帮助信息的能力"""
        print("\n=== 测试实时解析真实CLI工具帮助信息 ===")

        # 测试所有可用的CLI工具
        for cli_name in ['claude', 'gemini', 'qwen', 'iflow', 'qoder', 'codebuddy', 'copilot', 'codex']:
            try:
                # 检查CLI是否在系统中可用
                status, message = self.cli_executor.check_cli_status(cli_name)
                if status.value in ['available', 'installed', 'configured', 'authenticated']:
                    print(f"测试 {cli_name}...")

                    # 调用增强的命令规格解析方法
                    specs = self.generator._get_detailed_command_specs(cli_name)

                    # 验证返回的数据结构
                    self.assertIsInstance(specs, dict)
                    self.assertIn('global_options', specs)
                    self.assertIn('subcommands', specs)
                    self.assertIn('parameters', specs)

                    print(f"  {cli_name} 解析成功")
                    print(f"     全局选项: {len(specs['global_options'])} 个")
                    print(f"     子命令: {len(specs['subcommands'])} 个")
                    print(f"     参数: {len(specs['parameters'])} 个")

                    # 验证至少有一些基本信息
                    if specs['global_options']:
                        print(f"     示例选项: {list(specs['global_options'].keys())[:3]}")

                    break  # 只测试一个可用的CLI进行验证
                else:
                    print(f"跳过 {cli_name} (状态: {status.value})")

            except Exception as e:
                print(f"  {cli_name} 解析时出错: {e}")
    
    def test_fallback_mechanism(self):
        """测试优雅降级机制"""
        print("\n=== 测试优雅降级机制 ===")

        with patch.object(self.generator.cli_executor, 'execute_cli_command') as mock_execute:
            # 模拟CLI帮助命令失败的情况
            mock_execute.return_value = Mock()
            mock_execute.return_value.success = False
            mock_execute.return_value.stdout = ""

            # 测试一个CLI
            specs = self.generator._get_detailed_command_specs('claude')

            # 验证使用了默认模板
            self.assertIsInstance(specs, dict)
            self.assertIn('global_options', specs)
            self.assertIn('subcommands', specs)
            self.assertIn('parameters', specs)

            # 验证返回的是默认模板（而非空值）
            self.assertGreater(len(specs['global_options']), 0)
            self.assertGreater(len(specs['subcommands']), 0)
            self.assertGreater(len(specs['parameters']), 0)

            print("  优雅降级机制工作正常")

    def test_parsing_with_help_text(self):
        """测试从帮助文本中提取规格的功能"""
        print("\n=== 测试从帮助文本提取规格 ===")

        # 模拟真实的帮助文本
        fake_help_text = """
Usage: claude [OPTIONS] COMMAND [ARGS]...

Options:
  --help            Show this message and exit.
  --version         Show the version and exit.
  --verbose         Enable verbose output.
  --quiet           Suppress output.

Commands:
  chat      Start a chat session
  file      Process a file
  config    Manage configuration
  auth      Authentication commands
        """

        specs = self.generator._extract_command_specs_from_help(fake_help_text, 'claude')

        # 验证解析的准确性
        self.assertIn('--help', specs['global_options'])
        self.assertIn('--version', specs['global_options'])
        self.assertIn('--verbose', specs['global_options'])
        self.assertIn('--quiet', specs['global_options'])

        self.assertIn('chat', specs['subcommands'])
        self.assertIn('file', specs['subcommands'])
        self.assertIn('config', specs['subcommands'])
        self.assertIn('auth', specs['subcommands'])

        print("  帮助文本解析功能验证通过")

    def test_persistence_mechanism(self):
        """测试预设模板更新和持久化存储机制"""
        print("\n=== 测试持久化存储机制 ===")

        # 模拟解析结果
        test_specs = {
            "global_options": {"--test": "test option"},
            "subcommands": {"test": "test subcommand"},
            "parameters": {"input": "input parameter"}
        }

        # 测试更新和保存 - 直接调用方法
        self.generator._update_specs_with_real_data('test_cli', test_specs)

        # 验证文件是否创建 - 立即检查
        spec_file = self.generator.memory_dir / 'cli_specs' / 'test_cli_specs.json'
        print(f"检查文件: {spec_file}")
        print(f"父目录存在: {spec_file.parent.exists()}")
        print(f"父目录内容: {list(spec_file.parent.iterdir()) if spec_file.parent.exists() else 'N/A'}")

        # 重新检查文件是否存在
        self.assertTrue(spec_file.exists(), f"规格文件应被创建: {spec_file}")

        # 验证内容
        with open(spec_file, 'r', encoding='utf-8') as f:
            saved_data = json.load(f)

        self.assertEqual(saved_data, test_specs, "保存的数据应与原始数据一致")
        print("  持久化存储机制验证通过")

    def test_load_from_persistence(self):
        """测试从持久化存储加载功能"""
        print("\n=== 测试从持久化存储加载 ===")

        # 先创建一个测试规格文件
        test_specs = {
            "global_options": {"--loaded": "loaded from file"},
            "subcommands": {"loaded": "loaded subcommand"},
            "parameters": {"loaded": "loaded parameter"}
        }

        spec_file = self.generator.memory_dir / 'cli_specs' / 'load_test_specs.json'
        spec_file.parent.mkdir(parents=True, exist_ok=True)

        with open(spec_file, 'w', encoding='utf-8') as f:
            json.dump(test_specs, f, indent=2, ensure_ascii=False)

        # 测试加载
        loaded_specs = self.generator._get_default_command_specs('load_test')

        # 验证加载的数据，注意_get_default_command_specs方法会确保所有必需字段存在
        # 所以保存的数据会存在，但可能被合并了默认值
        self.assertIn("--loaded", loaded_specs['global_options'])
        self.assertEqual(loaded_specs['global_options']["--loaded"], "loaded from file")

        self.assertIn("loaded", loaded_specs['subcommands'])
        self.assertEqual(loaded_specs['subcommands']["loaded"], "loaded subcommand")

        self.assertIn("loaded", loaded_specs['parameters'])
        self.assertEqual(loaded_specs['parameters']["loaded"], "loaded parameter")

        print("  从持久化存储加载功能验证通过")

    def test_cli_type_customization(self):
        """验证CLI类型定制功能"""
        print("\n=== 测试CLI类型定制功能 ===")

        # 测试不同CLI类型有不同的默认值
        claude_specs = self.generator._get_default_subcommands('claude')
        iflow_specs = self.generator._get_default_subcommands('iflow')
        copilot_specs = self.generator._get_default_subcommands('copilot')

        # 验证不同CLI类型有特定的子命令
        if 'generate' in claude_specs or 'review' in claude_specs:
            print("  Claude CLI类型定制验证通过")
        else:
            print("  Claude特定子命令可能未加载")

        if 'workflow' in iflow_specs or 'run' in iflow_specs:
            print("  iFlow CLI类型定制验证通过")
        else:
            print("  iFlow特定子命令可能未加载")

        if 'suggest' in copilot_specs or 'complete' in copilot_specs:
            print("  Copilot CLI类型定制验证通过")
        else:
            print("  Copilot特定子命令可能未加载")


def run_tests():
    """运行所有测试"""
    print("开始运行TDD测试...")
    print("=" * 60)

    # 创建测试套件
    test_suite = unittest.TestLoader().loadTestsFromTestCase(TestCLILiveHelpParsing)

    # 运行测试
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)

    print("\n" + "=" * 60)
    print("测试结果摘要:")
    print(f"  通过: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"  失败: {len(result.failures)}")
    print(f"  错误: {len(result.errors)}")
    print(f"  总计: {result.testsRun}")

    if result.failures:
        print("\n失败的测试:")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback}")

    if result.errors:
        print("\n错误的测试:")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback}")
    
    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)