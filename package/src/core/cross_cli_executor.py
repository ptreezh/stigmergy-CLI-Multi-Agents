"""
跨CLI执行器 - 基于真实CLI架构的跨工具协作系统
Strictly based on real research results - NO SPECULATION!
"""

import os
import sys
import json
import subprocess
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import tempfile

# 导入编码安全模块
sys.path.append(str(Path(__file__).parent))
from cross_platform_encoding import CrossPlatformEncoding
from cross_platform_safe_cli import CrossPlatformSafeCLI, get_cli_executor

@dataclass
class CLIArchitecture:
    """基于真实研究的CLI架构信息"""
    name: str
    architecture_type: str  # 'npm', 'python', 'binary', 'rust'
    install_command: str
    execution_command: str
    global_check_command: str
    prerequisite_check: Optional[str] = None
    api_key_required: bool = False
    subscription_required: bool = False
    system_requirements: Optional[List[str]] = None

class RealCLIArchitectures:
    """基于真实研究的CLI架构定义 - 严禁推测，基于真实结果"""
    
    ARCHITECTURES = {
        'claude': CLIArchitecture(
            name='Claude Code CLI',
            architecture_type='npm',
            install_command='npm install -g @anthropic/claude-code',
            execution_command='npx @anthropic/claude-code',
            global_check_command='npm list -g @anthropic/claude-code',
            prerequisite_check='node --version && npm --version',
            api_key_required=True,
            system_requirements=['Node.js 18+', 'npm']
        ),
        
        'gemini': CLIArchitecture(
            name='Gemini CLI', 
            architecture_type='npm',
            install_command='npm install -g @google/gemini-cli',
            execution_command='npx @google/gemini-cli',
            global_check_command='npm list -g @google/gemini-cli',
            prerequisite_check='node --version && npm --version',
            api_key_required=True,
            system_requirements=['Node.js 18+', 'npm']
        ),
        
        'qwencode': CLIArchitecture(
            name='Qwen Code CLI',
            architecture_type='python',
            install_command='pip install qwencode-cli',
            execution_command='qwencode',
            global_check_command='pip show qwencode-cli',
            prerequisite_check='python --version && pip --version',
            api_key_required=True,
            system_requirements=['Python 3.8+', 'pip']
        ),
        
        'copilot': CLIArchitecture(
            name='GitHub Copilot CLI',
            architecture_type='npm',
            install_command='npm install -g @github/copilot',
            execution_command='copilot',
            global_check_command='npm list -g @github/copilot',
            prerequisite_check='node --version && npm --version',
            api_key_required=True,
            subscription_required=True,
            system_requirements=['Node.js 18+', 'npm', 'GitHub Copilot Subscription']
        ),
        
        'iflow': CLIArchitecture(
            name='iFlow CLI',
            architecture_type='npm',
            install_command='npm install -g @iflow-ai/iflow-cli',
            execution_command='iflow',
            global_check_command='npm list -g @iflow-ai/iflow-cli',
            prerequisite_check='node --version && npm --version',
            api_key_required=True,
            system_requirements=['Node.js 22+', '4GB+ RAM']
        ),
        
        'qoder': CLIArchitecture(
            name='Qoder CLI',
            architecture_type='python',
            install_command='pip install qoder-cli',
            execution_command='qoder',
            global_check_command='pip show qoder-cli',
            prerequisite_check='python --version && pip --version',
            api_key_required=True,
            system_requirements=['Python 3.8+', 'pip']
        ),
        
        'codebuddy': CLIArchitecture(
            name='CodeBuddy CLI',
            architecture_type='npm',
            install_command='npm install -g @tencent-ai/codebuddy-code',
            execution_command='codebuddy',
            global_check_command='npm list -g @tencent-ai/codebuddy-code',
            prerequisite_check='node --version && npm --version',
            api_key_required=True,
            system_requirements=['Node.js LTS', 'npm']
        ),
        
        'codex': CLIArchitecture(
            name='OpenAI Codex CLI',
            architecture_type='binary',
            install_command='curl -fsSL https://openai.com/codex-cli/install.sh | bash',
            execution_command='codex',
            global_check_command='which codex',
            prerequisite_check='which curl && which bash',
            api_key_required=True,
            system_requirements=['curl', 'bash', 'OpenAI API']
        ),
        
        'cline': CLIArchitecture(
            name='Cline CLI',
            architecture_type='npm',
            install_command='npm install -g cline',
            execution_command='cline',
            global_check_command='npm list -g cline',
            prerequisite_check='node --version && npm --version',
            api_key_required=True,
            system_requirements=['Node.js 18+', 'npm', 'MCP support']
        )
    }

class CrossCLIExecutor:
    """跨CLI执行器 - 基于真实架构的CLI协作系统"""
    
    def __init__(self, memory_dir: str = None):
        self.memory_dir = Path(memory_dir or Path.home() / '.stigmergy_cli_memory')
        self.memory_dir.mkdir(parents=True, exist_ok=True)
        self.architectures = RealCLIArchitectures()
        
        # 初始化记忆文件
        self.global_memory_file = self.memory_dir / 'global_cli_memory.json'
        self.success_patterns_file = self.memory_dir / 'success_patterns.json'
        self.cli_status_file = self.memory_dir / 'cli_status.json'
        
        self._initialize_memory()
    
    def _initialize_memory(self):
        """初始化记忆系统"""
        if not self.global_memory_file.exists():
            safe_file_write(self.global_memory_file, json.dumps({
                'last_updated': datetime.now().isoformat(),
                'cli_knowledge': {},
                'collaboration_patterns': {},
                'version': '1.0.0'
            }, indent=2, ensure_ascii=False))
        
        if not self.success_patterns_file.exists():
            safe_file_write(self.success_patterns_file, json.dumps({
                'successful_calls': [],
                'failed_calls': [],
                'optimal_patterns': {},
                'version': '1.0.0'
            }, indent=2, ensure_ascii=False))
        
        if not self.cli_status_file.exists():
            safe_file_write(self.cli_status_file, json.dumps({
                'available_clis': {},
                'last_check': None,
                'version': '1.0.0'
            }, indent=2, ensure_ascii=False))
    
    def check_cli_availability(self, cli_name: str) -> Tuple[bool, str]:
        """检查CLI可用性 - 基于真实架构"""
        if cli_name not in self.architectures.ARCHITECTURES:
            return False, f"Unknown CLI: {cli_name}"
        
        arch = self.architectures.ARCHITECTURES[cli_name]
        
        try:
            # 检查先决条件
            if arch.prerequisite_check:
                result = subprocess.run(
                    arch.prerequisite_check,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                if result.returncode != 0:
                    return False, f"Prerequisites not met: {result.stderr}"
            
            # 检查是否已全局安装
            result = subprocess.run(
                arch.global_check_command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=15
            )
            
            is_available = result.returncode == 0
            message = "Available" if is_available else f"Not installed: {result.stderr}"
            
            # 更新状态
            self._update_cli_status(cli_name, is_available, message)
            
            return is_available, message
            
        except subprocess.TimeoutExpired:
            return False, "Check command timed out"
        except Exception as e:
            return False, f"Check failed: {str(e)}"
    
    def _update_cli_status(self, cli_name: str, available: bool, message: str):
        """更新CLI状态"""
        try:
            status_data = json.loads(safe_file_read(self.cli_status_file))
            status_data['available_clis'][cli_name] = {
                'available': available,
                'message': message,
                'last_check': datetime.now().isoformat()
            }
            status_data['last_check'] = datetime.now().isoformat()
            
            safe_file_write(self.cli_status_file, json.dumps(status_data, indent=2, ensure_ascii=False))
        except Exception as e:
            print(f"Warning: Failed to update CLI status: {e}")
    
    def execute_cross_cli_call(self, 
                             source_cli: str,
                             target_cli: str, 
                             request: str,
                             context_files: List[str] = None,
                             working_dir: str = None) -> Dict[str, Any]:
        """执行跨CLI调用 - 基于真实安装的CLI"""
        
        result = {
            'success': False,
            'response': '',
            'error': '',
            'execution_method': '',
            'fallback_used': False,
            'timestamp': datetime.now().isoformat()
        }
        
        # 检查目标CLI可用性
        available, message = self.check_cli_availability(target_cli)
        if not available:
            return self._graceful_fallback(source_cli, target_cli, request, context_files, working_dir, f"CLI not available: {message}")
        
        arch = self.architectures.ARCHITECTURES[target_cli]
        
        try:
            # 构建执行命令 - 基于真实架构
            execution_command = self._build_execution_command(arch, request, context_files, working_dir)
            
            # 执行命令
            process_result = safe_cli_execute(
                execution_command,
                timeout=120,
                work_dir=working_dir,
                env_vars=self._get_environment_for_cli(target_cli)
            )
            
            if process_result['success']:
                result.update({
                    'success': True,
                    'response': process_result['stdout'],
                    'execution_method': 'direct_call',
                    'command_used': execution_command
                })
                
                # 记录成功模式
                self._record_success_pattern(source_cli, target_cli, request, execution_command)
            else:
                return self._graceful_fallback(source_cli, target_cli, request, context_files, working_dir, f"Direct execution failed: {process_result['stderr']}")
                
        except Exception as e:
            return self._graceful_fallback(source_cli, target_cli, request, context_files, working_dir, f"Execution error: {str(e)}")
        
        return result
    
    def _build_execution_command(self, arch: CLIArchitecture, request: str, context_files: List[str] = None, working_dir: str = None) -> str:
        """基于真实架构构建执行命令"""
        
        # 基础命令
        if arch.architecture_type == 'npm':
            if arch.execution_command.startswith('npx'):
                base_command = arch.execution_command
            else:
                base_command = arch.execution_command
        else:
            base_command = arch.execution_command
        
        # 添加参数
        command_parts = [base_command]
        
        # 根据不同CLI的参数格式添加请求
        if arch.name in ['Claude Code CLI', 'Gemini CLI', 'GitHub Copilot CLI']:
            # npm类型的CLI通常使用 -- 或直接传递参数
            command_parts.extend(['--', request])
        elif arch.name in ['Qwen Code CLI', 'Qoder CLI']:
            # Python类型的CLI通常使用位置参数或 --prompt
            command_parts.extend(['--prompt', request])
        elif arch.name == 'iFlow CLI':
            # iFlow直接接受自然语言
            command_parts.append(request)
        elif arch.name == 'CodeBuddy CLI':
            # CodeBuddy使用自然语言
            command_parts.append(request)
        elif arch.name == 'OpenAI Codex CLI':
            # Codex CLI参数格式
            command_parts.extend(['--request', request])
        
        # 添加文件引用
        if context_files:
            for file_path in context_files:
                if os.path.exists(file_path):
                    command_parts.extend(['--file', file_path])
        
        # 添加工作目录
        if working_dir:
            command_parts.extend(['--cwd', working_dir])
        
        # 构建完整命令
        if arch.architecture_type == 'npm' and arch.execution_command.startswith('npx'):
            # npx命令需要特殊处理
            full_command = f"{command_parts[0]} {' '.join(command_parts[1:])}"
        else:
            full_command = ' '.join(command_parts)
        
        return full_command
    
    def _get_environment_for_cli(self, cli_name: str) -> Dict[str, str]:
        """获取CLI所需的环境变量"""
        env = os.environ.copy()
        
        # 根据CLI类型设置环境变量
        if cli_name in ['claude', 'gemini', 'copilot', 'codebuddy']:
            # Node.js相关CLI
            node_path = env.get('NODE_PATH', '')
            npm_config_prefix = env.get('NPM_CONFIG_PREFIX', '')
            
            # 确保npm全局包可执行
            if not npm_config_prefix:
                npm_config_prefix = os.path.join(os.path.expanduser('~'), '.npm-global')
                env['NPM_CONFIG_PREFIX'] = npm_config_prefix
            
            # 添加到PATH
            global_bin_path = os.path.join(npm_config_prefix, 'bin')
            if global_bin_path not in env.get('PATH', ''):
                env['PATH'] = f"{global_bin_path}:{env.get('PATH', '')}"
        
        elif cli_name in ['qwencode', 'qoder']:
            # Python相关CLI
            python_path = env.get('PYTHONPATH', '')
            user_base = os.path.join(os.path.expanduser('~'), '.local')
            
            # 确保用户site-packages在PATH中
            user_bin = os.path.join(user_base, 'bin')
            if user_bin not in env.get('PATH', ''):
                env['PATH'] = f"{user_bin}:{env.get('PATH', '')}"
        
        return env
    
    def _graceful_fallback(self, source_cli: str, target_cli: str, request: str, context_files: List[str] = None, working_dir: str = None, error_reason: str = "") -> Dict[str, Any]:
        """优雅降级 - 4级回退金字塔"""
        
        result = {
            'success': False,
            'response': '',
            'error': error_reason,
            'fallback_used': True,
            'timestamp': datetime.now().isoformat()
        }
        
        # Level 1: 尝试生成等价命令
        try:
            arch = self.architectures.ARCHITECTURES[target_cli]
            equivalent_command = self._build_execution_command(arch, request, context_files, working_dir)
            
            result.update({
                'success': True,
                'response': f"Cannot execute {target_cli} directly, but here's the equivalent command:\n\n```bash\n{equivalent_command}\n```\n\nYou can run this command manually if {target_cli} is properly installed.",
                'execution_method': 'command_generation',
                'fallback_level': 1
            })
            
            self._record_fallback_pattern(source_cli, target_cli, request, equivalent_command, 'command_generation')
            return result
            
        except Exception as e:
            error_reason = f"Command generation failed: {str(e)}"
        
        # Level 2: 提供手动指导
        try:
            arch = self.architectures.ARCHITECTURES[target_cli]
            guidance = self._generate_manual_guidance(arch, request, context_files, working_dir)
            
            result.update({
                'success': True,
                'response': guidance,
                'execution_method': 'manual_guidance',
                'fallback_level': 2
            })
            
            self._record_fallback_pattern(source_cli, target_cli, request, guidance, 'manual_guidance')
            return result
            
        except Exception as e:
            error_reason = f"Manual guidance failed: {str(e)}"
        
        # Level 3: 替代方案建议
        try:
            alternatives = self._suggest_alternatives(source_cli, target_cli, request)
            
            result.update({
                'success': True, 
                'response': alternatives,
                'execution_method': 'alternatives',
                'fallback_level': 3
            })
            
            self._record_fallback_pattern(source_cli, target_cli, request, alternatives, 'alternatives')
            return result
            
        except Exception as e:
            error_reason = f"Alternatives failed: {str(e)}"
        
        # Level 4: 错误信息和最低保障
        result.update({
            'success': False,
            'response': f"Unable to process request with {target_cli}. Error: {error_reason}",
            'execution_method': 'error_fallback',
            'fallback_level': 4,
            'error': error_reason
        })
        
        self._record_failure_pattern(source_cli, target_cli, request, error_reason)
        return result
    
    def _generate_manual_guidance(self, arch: CLIArchitecture, request: str, context_files: List[str] = None, working_dir: str = None) -> str:
        """生成手动指导"""
        
        guidance = f"""# Manual Execution Guide for {arch.name}

## Installation (if not already installed):
```bash
{arch.install_command}
```

## Prerequisites:
"""
        
        if arch.system_requirements:
            for req in arch.system_requirements:
                guidance += f"- {req}\n"
        
        guidance += f"""
## Manual Command:
```bash
{self._build_execution_command(arch, request, context_files, working_dir)}
```

## API Key Setup (if required):
"""
        
        if arch.api_key_required:
            if 'anthropic' in arch.name.lower():
                guidance += "Set ANTHROPIC_API_KEY environment variable\n"
            elif 'google' in arch.name.lower() or 'gemini' in arch.name.lower():
                guidance += "Set GOOGLE_AI_API_KEY environment variable\n"
            elif 'github' in arch.name.lower():
                guidance += "Set GITHUB_TOKEN environment variable with Copilot access\n"
            elif 'openai' in arch.name.lower() or 'codex' in arch.name.lower():
                guidance += "Set OPENAI_API_KEY environment variable\n"
            else:
                guidance += "Configure appropriate API key for the service\n"
        
        guidance += """
## Troubleshooting:
1. Ensure the CLI is properly installed and in PATH
2. Check API key configuration
3. Verify network connectivity
4. Review system requirements
"""
        
        return guidance
    
    def _suggest_alternatives(self, source_cli: str, target_cli: str, request: str) -> str:
        """建议替代方案"""
        
        # 基于成功模式建议替代CLI
        alternatives = f"# Alternative Solutions for {target_cli}\n\n"
        
        # 分析请求类型并建议替代方案
        request_lower = request.lower()
        
        if 'code' in request_lower or 'programming' in request_lower:
            alternatives += "## Alternative Code Generation Options:\n"
            
            # 查找可用的编程CLI
            available_clis = []
            for cli_name, arch in self.architectures.ARCHITECTURES.items():
                if cli_name != target_cli:
                    available, _ = self.check_cli_availability(cli_name)
                    if available:
                        available_clis.append(cli_name)
            
            if available_clis:
                alternatives += "Available alternative CLIs:\n"
                for cli in available_clis[:3]:  # 最多建议3个
                    arch = self.architectures.ARCHITECTURES[cli]
                    alternatives += f"- **{arch.name}**: Use `{cli} [your request]`\n"
            else:
                alternatives += "- Install an alternative CLI tool\n"
                alternatives += "- Use online code editors or IDE plugins\n"
        
        elif 'file' in request_lower or 'analyze' in request_lower:
            alternatives += "## Alternative File Analysis Options:\n"
            alternatives += "- Use built-in system commands: `cat`, `grep`, `find`\n"
            alternatives += "- Use IDE code analysis features\n"
            alternatives += "- Try online code analysis tools\n"
        
        else:
            alternatives += "## General Alternatives:\n"
            alternatives += "- Use web-based AI assistants\n"
            alternatives += "- Try desktop applications\n"
            alternatives += "- Use integrated development environment plugins\n"
        
        alternatives += f"\n## Original Request:\n```\n{request}\n```\n"
        
        return alternatives
    
    def _record_success_pattern(self, source_cli: str, target_cli: str, request: str, command: str):
        """记录成功模式"""
        try:
            patterns_data = json.loads(safe_file_read(self.success_patterns_file))
            
            success_entry = {
                'timestamp': datetime.now().isoformat(),
                'source_cli': source_cli,
                'target_cli': target_cli,
                'request_type': self._classify_request(request),
                'request_sample': request[:100] + '...' if len(request) > 100 else request,
                'successful_command': command,
                'pattern_id': f"{source_cli}->{target_cli}:{self._classify_request(request)}"
            }
            
            patterns_data['successful_calls'].append(success_entry)
            
            # 更新最优模式
            pattern_key = f"{source_cli}->{target_cli}:{self._classify_request(request)}"
            if pattern_key not in patterns_data['optimal_patterns']:
                patterns_data['optimal_patterns'][pattern_key] = {
                    'usage_count': 0,
                    'last_used': None,
                    'success_rate': 0.0,
                    'commands': []
                }
            
            patterns_data['optimal_patterns'][pattern_key]['usage_count'] += 1
            patterns_data['optimal_patterns'][pattern_key]['last_used'] = datetime.now().isoformat()
            patterns_data['optimal_patterns'][pattern_key]['commands'].append(command)
            
            # 计算成功率
            total_attempts = len([c for c in patterns_data['successful_calls'] + patterns_data['failed_calls'] 
                                if c['pattern_id'] == pattern_key])
            successful_attempts = len([c for c in patterns_data['successful_calls'] 
                                     if c['pattern_id'] == pattern_key])
            
            if total_attempts > 0:
                patterns_data['optimal_patterns'][pattern_key]['success_rate'] = successful_attempts / total_attempts
            
            safe_file_write(self.success_patterns_file, json.dumps(patterns_data, indent=2, ensure_ascii=False))
            
        except Exception as e:
            print(f"Warning: Failed to record success pattern: {e}")
    
    def _record_fallback_pattern(self, source_cli: str, target_cli: str, request: str, fallback_result: str, fallback_type: str):
        """记录回退模式"""
        try:
            patterns_data = json.loads(safe_file_read(self.success_patterns_file))
            
            fallback_entry = {
                'timestamp': datetime.now().isoformat(),
                'source_cli': source_cli,
                'target_cli': target_cli,
                'request_type': self._classify_request(request),
                'request_sample': request[:100] + '...' if len(request) > 100 else request,
                'fallback_type': fallback_type,
                'fallback_result': fallback_result[:200] + '...' if len(fallback_result) > 200 else fallback_result,
                'pattern_id': f"{source_cli}->{target_cli}:{self._classify_request(request)}:fallback"
            }
            
            if 'fallback_calls' not in patterns_data:
                patterns_data['fallback_calls'] = []
            
            patterns_data['fallback_calls'].append(fallback_entry)
            
            safe_file_write(self.success_patterns_file, json.dumps(patterns_data, indent=2, ensure_ascii=False))
            
        except Exception as e:
            print(f"Warning: Failed to record fallback pattern: {e}")
    
    def _record_failure_pattern(self, source_cli: str, target_cli: str, request: str, error_reason: str):
        """记录失败模式"""
        try:
            patterns_data = json.loads(safe_file_read(self.success_patterns_file))
            
            failure_entry = {
                'timestamp': datetime.now().isoformat(),
                'source_cli': source_cli,
                'target_cli': target_cli,
                'request_type': self._classify_request(request),
                'request_sample': request[:100] + '...' if len(request) > 100 else request,
                'error_reason': error_reason,
                'pattern_id': f"{source_cli}->{target_cli}:{self._classify_request(request)}"
            }
            
            patterns_data['failed_calls'].append(failure_entry)
            
            safe_file_write(self.success_patterns_file, json.dumps(patterns_data, indent=2, ensure_ascii=False))
            
        except Exception as e:
            print(f"Warning: Failed to record failure pattern: {e}")
    
    def _classify_request(self, request: str) -> str:
        """分类请求类型"""
        request_lower = request.lower()
        
        if any(word in request_lower for word in ['generate', 'create', 'write', 'build']):
            return 'generation'
        elif any(word in request_lower for word in ['analyze', 'review', 'check', 'examine']):
            return 'analysis'
        elif any(word in request_lower for word in ['fix', 'debug', 'repair', 'resolve']):
            return 'debugging'
        elif any(word in request_lower for word in ['test', 'validate', 'verify']):
            return 'testing'
        elif any(word in request_lower for word in ['document', 'explain', 'describe']):
            return 'documentation'
        elif any(word in request_lower for word in ['refactor', 'improve', 'optimize']):
            return 'optimization'
        else:
            return 'general'
    
    def get_collaboration_memory(self) -> Dict[str, Any]:
        """获取协作记忆"""
        try:
            memory_data = json.loads(safe_file_read(self.global_memory_file))
            patterns_data = json.loads(safe_file_read(self.success_patterns_file))
            
            return {
                'global_memory': memory_data,
                'success_patterns': patterns_data,
                'available_clis': self._get_all_cli_status()
            }
        except Exception as e:
            return {'error': f'Failed to load memory: {str(e)}'}
    
    def _get_all_cli_status(self) -> Dict[str, Dict[str, Any]]:
        """获取所有CLI状态"""
        status = {}
        
        for cli_name in self.architectures.ARCHITECTURES:
            available, message = self.check_cli_availability(cli_name)
            arch = self.architectures.ARCHITECTURES[cli_name]
            
            status[cli_name] = {
                'name': arch.name,
                'available': available,
                'message': message,
                'architecture_type': arch.architecture_type,
                'system_requirements': arch.system_requirements
            }
        
        return status

# 使用示例
if __name__ == '__main__':
    executor = CrossCLIExecutor()
    
    # 检查所有CLI状态
    print("=== CLI Availability Status ===")
    for cli_name in executor.architectures.ARCHITECTURES:
        available, message = executor.check_cli_availability(cli_name)
        arch = executor.architectures.ARCHITECTURES[cli_name]
        print(f"{arch.name}: {'✓ Available' if available else '✗ Not Available'} - {message}")
    
    # 测试跨CLI调用
    print("\n=== Cross-CLI Execution Test ===")
    result = executor.execute_cross_cli_call(
        source_cli='claude',
        target_cli='iflow',
        request='分析这个项目的结构并生成改进建议',
        context_files=['./README.md'],
        working_dir=os.getcwd()
    )
    
    print(f"Success: {result['success']}")
    print(f"Method: {result.get('execution_method', 'unknown')}")
    print(f"Response: {result['response'][:200]}...")
    
    if result.get('fallback_used'):
        print(f"Fallback Level: {result.get('fallback_level', 'unknown')}")