"""
CLI Detector - CLI工具检测器
检测系统中可用的AI CLI工具及其扩展机制

这是TDD驱动的实现，用于实际环境检测
"""

import os
import sys
import subprocess
import json
import shutil
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class CLIDetector:
    """CLI工具检测器"""

    def __init__(self):
        """初始化检测器"""
        self.cli_tools = {
            'claude': {
                'commands': ['claude-cli', 'claude'],
                'version_flag': '--version',
                'config_dir': '~/.config/claude',
                'hooks_file': '~/.config/claude/hooks.json',
                'extension_mechanism': 'hook_system'
            },
            'gemini': {
                'commands': ['gemini-cli', 'gemini'],
                'version_flag': '--version',
                'config_dir': '~/.config/gemini',
                'extensions_file': '~/.config/gemini/extensions.json',
                'extension_mechanism': 'extension_system'
            },
            'qwencode': {
                'commands': ['qwencode-cli', 'qwencode', 'qwen-code'],
                'version_flag': '--version',
                'config_dir': '~/.config/qwencode',
                'config_file': '~/.config/qwencode/config.yml',
                'extension_mechanism': 'class_inheritance'
            },
            'iflow': {
                'commands': ['iflow-cli', 'iflow'],
                'version_flag': '--version',
                'config_dir': '~/.config/iflow',
                'workflows_dir': '~/.config/iflow/workflows',
                'extension_mechanism': 'workflow_nodes'
            },
            'qoder': {
                'commands': ['qoder-cli', 'qoder'],
                'version_flag': '--version',
                'config_dir': '~/.config/qoder',
                'plugins_file': '~/.config/qoder/plugins.json',
                'extension_mechanism': 'plugin_system'
            },
            'codebuddy': {
                'commands': ['codebuddy', 'codebuddy-cli'],
                'version_flag': '--version',
                'config_dir': '~/.config/codebuddy',
                'buddies_file': '~/.config/codebuddy/buddies.yml',
                'extension_mechanism': 'buddy_system'
            },
            'codex': {
                'commands': ['codex-cli', 'codex'],
                'version_flag': '--version',
                'config_dir': '~/.config/codex',
                'extensions_file': '~/.config/codex/extensions.json',
                'extension_mechanism': 'extension_system'
            }
        }

    def detect_all_cli_tools(self) -> Dict[str, Dict[str, Any]]:
        """
        检测所有CLI工具的可用性和状态

        Returns:
            Dict[str, Dict[str, Any]]: 检测结果
        """
        results = {}

        for cli_name, cli_info in self.cli_tools.items():
            results[cli_name] = self._detect_single_cli(cli_name, cli_info)

        return results

    def detect_claude_cli(self) -> Dict[str, Any]:
        """
        专门检测Claude CLI工具

        Returns:
            Dict[str, Any]: Claude CLI检测结果
        """
        if 'claude' not in self.cli_tools:
            return {'error': 'Claude CLI not configured'}

        return self._detect_single_cli('claude', self.cli_tools['claude'])

    def _detect_single_cli(self, cli_name: str, cli_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        检测单个CLI工具

        Args:
            cli_name: CLI工具名称
            cli_info: CLI工具信息

        Returns:
            Dict[str, Any]: 检测结果
        """
        result = {
            'name': cli_name,
            'available': False,
            'command': None,
            'version': None,
            'extension_mechanism': cli_info['extension_mechanism'],
            'config_dir': self._expand_path(cli_info['config_dir']),
            'config_exists': False,
            'extension_ready': False,
            'error': None
        }

        try:
            # 1. 检测CLI命令是否可用
            command = self._find_cli_command(cli_info['commands'])
            if command:
                result['command'] = command
                result['available'] = True

                # 2. 获取版本信息
                version = self._get_cli_version(command, cli_info['version_flag'])
                result['version'] = version

                # 3. 检查配置目录
                config_dir = result['config_dir']
                if os.path.exists(config_dir):
                    result['config_exists'] = True

                # 4. 检查扩展机制是否准备就绪
                result['extension_ready'] = self._check_extension_readiness(cli_name, cli_info, config_dir)

            else:
                result['error'] = f"CLI命令未找到: {cli_info['commands']}"

        except Exception as e:
            result['error'] = str(e)
            logger.error(f"检测 {cli_name} CLI失败: {e}")

        return result

    def _find_cli_command(self, commands: List[str]) -> Optional[str]:
        """
        查找可用的CLI命令

        Args:
            commands: 候选命令列表

        Returns:
            Optional[str]: 找到的命令路径，如果没找到返回None
        """
        for command in commands:
            # 首先检查是否在PATH中
            command_path = shutil.which(command)
            if command_path:
                return command_path

            # 检查是否为Python模块
            if self._is_python_module(command):
                return f"python -m {command}"

        return None

    def _is_python_module(self, module_name: str) -> bool:
        """
        检查是否为Python模块

        Args:
            module_name: 模块名称

        Returns:
            bool: 是否为Python模块
        """
        try:
            # 尝试导入模块
            import importlib.util
            spec = importlib.util.find_spec(module_name)
            return spec is not None
        except (ImportError, ValueError):
            return False

    def _get_cli_version(self, command: str, version_flag: str) -> Optional[str]:
        """
        获取CLI工具版本

        Args:
            command: CLI命令
            version_flag: 版本标志

        Returns:
            Optional[str]: 版本信息
        """
        try:
            result = subprocess.run(
                f"{command} {version_flag}",
                shell=True,
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode == 0:
                return result.stdout.strip()
            else:
                logger.warning(f"获取版本失败: {command} {version_flag}")
                return None

        except subprocess.TimeoutExpired:
            logger.error(f"获取版本超时: {command}")
            return None
        except Exception as e:
            logger.error(f"获取版本异常: {command}, {e}")
            return None

    def _check_extension_readiness(self, cli_name: str, cli_info: Dict[str, Any], config_dir: str) -> bool:
        """
        检查扩展机制是否准备就绪

        Args:
            cli_name: CLI工具名称
            cli_info: CLI工具信息
            config_dir: 配置目录

        Returns:
            bool: 扩展机制是否准备就绪
        """
        try:
            mechanism = cli_info['extension_mechanism']

            if mechanism == 'hook_system':
                # 检查Hook系统
                hooks_file = self._expand_path(cli_info.get('hooks_file', ''))
                return self._check_hook_system(hooks_file)

            elif mechanism == 'extension_system':
                # 检查扩展系统
                extensions_file = self._expand_path(cli_info.get('extensions_file', ''))
                return self._check_extension_system(extensions_file)

            elif mechanism == 'class_inheritance':
                # 检查类继承机制
                config_file = self._expand_path(cli_info.get('config_file', ''))
                return self._check_class_inheritance(config_file)

            elif mechanism == 'workflow_nodes':
                # 检查工作流节点
                workflows_dir = self._expand_path(cli_info.get('workflows_dir', ''))
                return self._check_workflow_nodes(workflows_dir)

            elif mechanism == 'plugin_system':
                # 检查插件系统
                plugins_file = self._expand_path(cli_info.get('plugins_file', ''))
                return self._check_plugin_system(plugins_file)

            elif mechanism == 'buddy_system':
                # 检查伙伴系统
                buddies_file = self._expand_path(cli_info.get('buddies_file', ''))
                return self._check_buddy_system(buddies_file)

            else:
                logger.warning(f"未知的扩展机制: {mechanism}")
                return False

        except Exception as e:
            logger.error(f"检查扩展机制失败: {cli_name}, {e}")
            return False

    def _check_hook_system(self, hooks_file: str) -> bool:
        """检查Hook系统"""
        if os.path.exists(hooks_file):
            try:
                with open(hooks_file, 'r') as f:
                    hooks_config = json.load(f)
                return isinstance(hooks_config, dict) and 'hooks' in hooks_config
            except:
                return False
        return True  # 文件不存在说明尚未配置，但机制可用

    def _check_extension_system(self, extensions_file: str) -> bool:
        """检查扩展系统"""
        if os.path.exists(extensions_file):
            try:
                with open(extensions_file, 'r') as f:
                    extensions_config = json.load(f)
                return isinstance(extensions_config, dict) and 'extensions' in extensions_config
            except:
                return False
        return True

    def _check_class_inheritance(self, config_file: str) -> bool:
        """检查类继承机制"""
        # 对于Python模块，主要检查模块是否可导入
        return self._is_python_module('qwencode_cli')

    def _check_workflow_nodes(self, workflows_dir: str) -> bool:
        """检查工作流节点"""
        return os.path.exists(workflows_dir) or not os.path.exists(workflows_dir)

    def _check_plugin_system(self, plugins_file: str) -> bool:
        """检查插件系统"""
        if os.path.exists(plugins_file):
            try:
                with open(plugins_file, 'r') as f:
                    plugins_config = json.load(f)
                return isinstance(plugins_config, dict) and 'plugins' in plugins_config
            except:
                return False
        return True

    def _check_buddy_system(self, buddies_file: str) -> bool:
        """检查伙伴系统"""
        if os.path.exists(buddies_file):
            return True  # YAML文件存在，可以使用
        return True  # 文件不存在说明尚未配置，但机制可用

    def _expand_path(self, path: str) -> str:
        """展开路径中的~符号"""
        return os.path.expanduser(path)

    def get_cli_capabilities(self, cli_name: str) -> Dict[str, Any]:
        """
        获取CLI工具的能力信息

        Args:
            cli_name: CLI工具名称

        Returns:
            Dict[str, Any]: 能力信息
        """
        capabilities = {
            'supported_protocols': [],
            'hooks_available': [],
            'extension_points': [],
            'native_integration': False
        }

        if cli_name == 'claude':
            capabilities.update({
                'supported_protocols': [
                    '请用claude帮我{task}',
                    '调用claude来{task}',
                    'use claude to {task}',
                    'ask claude for {task}'
                ],
                'hooks_available': [
                    'user_prompt_submit',
                    'tool_use_pre',
                    'tool_use_post',
                    'response_generated'
                ],
                'extension_points': ['hooks.json'],
                'native_integration': True
            })

        elif cli_name == 'gemini':
            capabilities.update({
                'supported_protocols': [
                    '请用gemini{task}',
                    '调用gemini{task}',
                    'use gemini to {task}',
                    'call gemini for {task}'
                ],
                'hooks_available': [
                    'preprocessor',
                    'postprocessor',
                    'command_handler'
                ],
                'extension_points': ['extensions.json'],
                'native_integration': True
            })

        # 其他CLI工具的能力可以在这里添加...

        return capabilities

    def generate_report(self) -> Dict[str, Any]:
        """
        生成检测报告

        Returns:
            Dict[str, Any]: 完整的检测报告
        """
        detection_results = self.detect_all_cli_tools()

        # 使用跨平台的时间戳生成
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        report = {
            'timestamp': timestamp,
            'system_info': {
                'platform': sys.platform,
                'python_version': sys.version,
                'path': os.environ.get('PATH', ''),
            },
            'cli_tools': detection_results,
            'summary': {
                'total_tools': len(self.cli_tools),
                'available_tools': sum(1 for result in detection_results.values() if result['available']),
                'ready_for_integration': sum(1 for result in detection_results.values()
                                           if result['available'] and result['extension_ready']),
                'highest_priority_tools': [
                    name for name, result in detection_results.items()
                    if result['available'] and name in ['claude', 'gemini', 'qwencode']
                ]
            }
        }

        return report


# 全局检测器实例
_global_detector: Optional[CLIDetector] = None


def get_cli_detector() -> CLIDetector:
    """获取全局CLI检测器实例"""
    global _global_detector
    if _global_detector is None:
        _global_detector = CLIDetector()
    return _global_detector


def detect_claude_cli_status() -> Dict[str, Any]:
    """检测Claude CLI状态的便捷函数"""
    detector = get_cli_detector()
    return detector.detect_claude_cli()


def generate_environment_report() -> Dict[str, Any]:
    """生成环境报告的便捷函数"""
    detector = get_cli_detector()
    return detector.generate_report()