#!/usr/bin/env python3
"""
Standalone Cline CLI Adapter for Stigmergy System

This adapter provides integration between Cline CLI and the Stigmergy multi-CLI collaboration system.
Implements hook-based integration with cross-CLI delegation capabilities.

Based on Cline's gRPC architecture and hook system for seamless integration.
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent))


class StandaloneClineAdapter:
    """
    Cline CLI adapter implementing hook-based integration with cross-CLI capabilities.
    
    Features:
    - Task lifecycle hook integration
    - Cross-CLI delegation and collaboration
    - JSON-based communication protocol
    - Multi-agent orchestration support
    - Comprehensive error handling and statistics
    """
    
    def __init__(self):
        self.cli_name = "cline"
        self.display_name = "Cline CLI"
        self.integration_type = "hook_system"
        
        # Cross-CLI collaboration patterns
        self.chinese_patterns = [
            r'请用(\w+)\s*帮我?([^。！？\n]*)',
            r'调用(\w+)\s*来([^。！？\n]*)',
            r'用(\w+)\s*帮我?([^。！？\n]*)',
            r'让(\w+)\s*([^。！？\n]*)',
        ]
        
        self.english_patterns = [
            r'use\s+(\w+)\s+to\s+([^\.\n!?]*)',
            r'call\s+(\w+)\s+to\s+([^\.\n!?]*)',
            r'ask\s+(\w+)\s+for\s+([^\.\n!?]*)',
            r'let\s+(\w+)\s+([^\.\n!?]*)',
        ]
        
        # Statistics tracking
        self.stats = {
            'total_requests': 0,
            'cross_cli_calls': 0,
            'successful_calls': 0,
            'failed_calls': 0,
            'start_time': datetime.now()
        }
        
        # Hook configuration
        self.hook_config = {
            'hook_directory': Path.home() / 'Documents' / 'Cline' / 'Rules' / 'hooks',
            'project_hook_directory': '.clinerules/hooks',
            'supported_hooks': [
                'TaskStart', 'TaskResume', 'TaskCancel',
                'UserPromptSubmit', 'PreToolUse', 'PostToolUse'
            ]
        }
        
        # Initialize safe CLI executor
        self.safe_cli = None  # Removed dependency on CrossPlatformSafeCLI

    def is_available(self) -> bool:
        """Check if Cline CLI is available and properly configured."""
        try:
            result = subprocess.run(
                ['cline', '--version'], 
                capture_output=True, 
                text=True, 
                timeout=10
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError):
            return False

    def initialize(self) -> bool:
        """Initialize the Cline CLI adapter and setup hooks."""
        try:
            if not self.is_available():
                return False
                
            # Create hook directories if they don't exist
            self._setup_hook_directories()
            
            # Install Stigmergy-specific hooks
            self._install_stigmergy_hooks()
            
            return True
        except Exception as e:
            self._log_error(f"Failed to initialize Cline adapter: {e}")
            return False

    def execute_task(self, task: str, context: Dict[str, Any]) -> str:
        """
        Execute a task using Cline CLI with cross-CLI collaboration support.
        
        Args:
            task: The task description or command
            context: Additional context information
            
        Returns:
            Task execution result
        """
        self.stats['total_requests'] += 1
        
        try:
            # Check for cross-CLI collaboration requests
            cross_cli_result = self._handle_cross_cli_collaboration(task, context)
            if cross_cli_result:
                return cross_cli_result
            
            # Execute task with Cline CLI
            return self._execute_cline_task(task, context)
            
        except Exception as e:
            self.stats['failed_calls'] += 1
            error_msg = f"Error executing Cline task: {str(e)}"
            self._log_error(error_msg)
            return self._format_error_result(error_msg)

    def health_check(self) -> Dict[str, Any]:
        """Perform comprehensive health check of Cline CLI integration."""
        health_status = {
            'adapter_name': self.cli_name,
            'display_name': self.display_name,
            'version': self.version,
            'integration_type': self.integration_type,
            'available': self.is_available(),
            'initialized': False,
            'hooks_configured': False,
            'statistics': self.stats.copy(),
            'platform_support': self._check_platform_support(),
            'errors': []
        }
        
        try:
            if health_status['available']:
                health_status['initialized'] = self.initialize()
                health_status['hooks_configured'] = self._verify_hooks_configured()
                
                # Get Cline version info
                version_result = subprocess.run(
                    ['cline', '--version'], 
                    capture_output=True, 
                    text=True, 
                    timeout=5
                )
                if version_result.returncode == 0:
                    health_status['cline_version'] = version_result.stdout.strip()
                    
        except Exception as e:
            health_status['errors'].append(str(e))
            
        return health_status

    def _setup_hook_directories(self):
        """Create necessary hook directories for Cline integration."""
        try:
            # Create global hook directory
            self.hook_config['hook_directory'].mkdir(parents=True, exist_ok=True)
            
            # Create project-specific hook directory
            project_hook_dir = Path.cwd() / self.hook_config['project_hook_directory']
            project_hook_dir.mkdir(parents=True, exist_ok=True)
            
        except Exception as e:
            self._log_error(f"Failed to setup hook directories: {e}")

    def _install_stigmergy_hooks(self):
        """Install Stigmergy-specific hooks for Cline integration."""
        try:
            for hook_name in self.hook_config['supported_hooks']:
                self._create_hook_file(hook_name)
        except Exception as e:
            self._log_error(f"Failed to install Stigmergy hooks: {e}")

    def _create_hook_file(self, hook_name: str):
        """Create a specific hook file for Cline integration."""
        hook_content = self._generate_hook_script(hook_name)
        
        # Create in global hooks directory
        global_hook_path = self.hook_config['hook_directory'] / hook_name
        global_hook_path.write_text(hook_content)
        global_hook_path.chmod(0o755)
        
        # Create in project hooks directory
        project_hook_path = Path.cwd() / self.hook_config['project_hook_directory'] / hook_name
        project_hook_path.write_text(hook_content)
        project_hook_path.chmod(0o755)

    def _generate_hook_script(self, hook_name: str) -> str:
        """Generate hook script content for Stigmergy integration."""
        return f'''#!/usr/bin/env python3
"""
Stigmergy Integration Hook for Cline - {hook_name}
This hook enables cross-CLI collaboration and task tracking.
"""

import json
import sys
import os
from datetime import datetime

def main():
    try:
        # Read JSON input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Log hook execution for Stigmergy tracking
        log_entry = {{
            'hook_name': '{hook_name}',
            'timestamp': datetime.now().isoformat(),
            'input_data': input_data,
            'cline_version': input_data.get('clineVersion', 'unknown'),
            'task_id': input_data.get('taskId', 'unknown')
        }}
        
        # Write to Stigmergy log (if available)
        log_path = os.path.expanduser('~/.stigmergy/logs/cline_hooks.log')
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(json.dumps(log_entry) + '\n')
        
        # Return neutral response (don't interfere with Cline operations)
        response = {{
            "cancel": False,
            "contextModification": ""
        }}
        
        print(json.dumps(response))
        
    except Exception as e:
        # On error, still allow Cline to continue
        response = {{
            "cancel": False,
            "contextModification": f"Hook error: {{str(e)}}"
        }}
        print(json.dumps(response))

if __name__ == '__main__':
    main()
'''

    def _handle_cross_cli_collaboration(self, task: str, context: Dict[str, Any]) -> Optional[str]:
        """Handle cross-CLI collaboration requests."""
        # Check for Chinese collaboration patterns
        for pattern in self.chinese_patterns:
            match = re.search(pattern, task)
            if match:
                target_cli = match.group(1).lower()
                sub_task = match.group(2).strip()
                
                if target_cli != self.cli_name and self._is_supported_cli(target_cli):
                    return self._delegate_to_cli(target_cli, sub_task, context)
        
        # Check for English collaboration patterns
        for pattern in self.english_patterns:
            match = re.search(pattern, task)
            if match:
                target_cli = match.group(1).lower()
                sub_task = match.group(2).strip()
                
                if target_cli != self.cli_name and self._is_supported_cli(target_cli):
                    return self._delegate_to_cli(target_cli, sub_task, context)
        
        return None

    def _is_supported_cli(self, cli_name: str) -> bool:
        """Check if a CLI tool is supported by Stigmergy."""
        supported_clis = [
            'claude', 'gemini', 'qwen', 'codebuddy', 'copilot', 
            'codex', 'iflow', 'qoder', 'qwencode', 'cline'
        ]
        return cli_name in supported_clis

    def _delegate_to_cli(self, target_cli: str, task: str, context: Dict[str, Any]) -> str:
        """Delegate task to another CLI tool."""
        self.stats['cross_cli_calls'] += 1
        
        try:
            # Use the safe CLI executor for cross-CLI calls
            result = self.safe_cli.execute_cross_cli_call(target_cli, task, context)
            self.stats['successful_calls'] += 1
            
            return self._format_cross_cli_result(target_cli, task, result)
            
        except Exception as e:
            self.stats['failed_calls'] += 1
            error_msg = f"Failed to delegate to {target_cli}: {str(e)}"
            self._log_error(error_msg)
            return self._format_error_result(error_msg)

    def _execute_cline_task(self, task: str, context: Dict[str, Any]) -> str:
        """Execute task using Cline CLI directly."""
        try:
            # Prepare Cline command
            cline_cmd = ['cline', 'execute', '--task', task]
            
            # Add context parameters if available
            if context:
                context_json = json.dumps(context)
                cline_cmd.extend(['--context', context_json])
            
            # Execute Cline command
            result = subprocess.run(
                cline_cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode == 0:
                self.stats['successful_calls'] += 1
                return self._format_success_result(task, result.stdout)
            else:
                self.stats['failed_calls'] += 1
                error_msg = f"Cline execution failed: {result.stderr}"
                return self._format_error_result(error_msg)
                
        except subprocess.TimeoutExpired:
            self.stats['failed_calls'] += 1
            return self._format_error_result("Cline execution timed out")
        except Exception as e:
            self.stats['failed_calls'] += 1
            error_msg = f"Cline execution error: {str(e)}"
            return self._format_error_result(error_msg)

    def _verify_hooks_configured(self) -> bool:
        """Verify that Stigmergy hooks are properly configured."""
        try:
            required_hooks = self.hook_config['supported_hooks']
            hook_dir = self.hook_config['hook_directory']
            
            for hook_name in required_hooks:
                hook_path = hook_dir / hook_name
                if not hook_path.exists() or not hook_path.is_file():
                    return False
            
            return True
        except Exception:
            return False

    def _check_platform_support(self) -> Dict[str, Any]:
        """Check platform support status for Cline CLI."""
        import platform
        current_platform = platform.system().lower()
        
        support_status = {
            'current_platform': current_platform,
            'supported': current_platform in ['darwin', 'linux'],
            'windows_support': 'planned'
        }
        
        return support_status

    def _format_cross_cli_result(self, target_cli: str, task: str, result: str) -> str:
        """Format cross-CLI collaboration result."""
        return f"""## 🔗 跨CLI调用结果

**源工具**: {self.display_name.upper()} ({self.integration_type})
**目标工具**: {target_cli.upper()}
**任务**: {task}
**执行时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

{result}

---

*{self.integration_type}系统原生集成 - 无抽象层*"""

    def _format_success_result(self, task: str, output: str) -> str:
        """Format successful Cline execution result."""
        return f"""## ✅ Cline CLI 执行结果

**任务**: {task}
**状态**: 成功
**执行时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

{output}

---

*Cline v{self.version} - Hook系统集成*"""

    def _format_error_result(self, error_msg: str) -> str:
        """Format error result."""
        return f"""## ❌ Cline CLI 执行错误

**错误信息**: {error_msg}
**发生时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

**统计信息**:
- 总请求数: {self.stats['total_requests']}
- 成功调用: {self.stats['successful_calls']}
- 失败调用: {self.stats['failed_calls']}
- 跨CLI调用: {self.stats['cross_cli_calls']}

---

*请检查Cline CLI配置和系统环境*"""

    def _log_error(self, error_msg: str):
        """Log error to Stigmergy error log."""
        try:
            log_path = Path.home() / '.stigmergy' / 'logs' / 'cline_errors.log'
            log_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(log_path, 'a', encoding='utf-8') as f:
                f.write(f"[{datetime.now().isoformat()}] {error_msg}\n")
        except Exception:
            pass  # Silent fail for logging errors


    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息 - 直接实现"""
        total_requests = self.stats.get('total_requests', 0)
        failed_calls = self.stats.get('failed_calls', 0)
        success_rate = ((total_requests - failed_calls) / total_requests) if total_requests > 0 else 1.0
        
        return {
            'cli_name': self.cli_name,
            'display_name': self.display_name,
            'integration_type': self.integration_type,
            'total_requests': total_requests,
            'cross_cli_calls': self.stats.get('cross_cli_calls', 0),
            'successful_calls': self.stats.get('successful_calls', 0),
            'failed_calls': failed_calls,
            'success_rate': success_rate,
            'start_time': self.stats.get('start_time').isoformat() if self.stats.get('start_time') else None,
            'design': 'standalone_hook_native',
            'no_abstraction': True,
            'hook_directory': str(self.hook_config.get('hook_directory', '')),
            'supported_hooks': self.hook_config.get('supported_hooks', [])
        }


# 便捷函数 - 无抽象层
def get_standalone_cline_adapter() -> StandaloneClineAdapter:
    """获取独立的 Cline CLI 适配器实例"""
    return StandaloneClineAdapter()


# 保持向后兼容的函数名
def get_cline_hook_adapter() -> StandaloneClineAdapter:
    """获取 Cline Hook 适配器实例（向后兼容）"""
    return get_standalone_cline_adapter()


def main():
    """Main function for standalone testing."""
    import sys
    adapter = StandaloneClineAdapter()
    
    if not adapter.is_available():
        print("Cline CLI is not available. Please install Cline CLI first.")
        return 1
    
    if not adapter.initialize():
        print("Failed to initialize Cline adapter.")
        return 1
    
    # Test basic functionality
    health = adapter.health_check()
    print(f"Cline Adapter Health: {json.dumps(health, indent=2, ensure_ascii=False)}")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())


if __name__ == '__main__':
    sys.exit(main())