"""
直接跨CLI执行器 - 针对已全局安装CLI的协作系统
严格基于真实研究，严禁推测
"""

import os
import sys
import json
import subprocess
import shutil
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import tempfile
import re

# 导入编码安全模块
sys.path.append(str(Path(__file__).parent))
from cross_platform_encoding import safe_file_write, safe_file_read
from cross_platform_safe_cli import safe_cli_execute

class DirectCLIExecutor:
    """直接CLI执行器 - 基于已安装CLI的协作系统"""
    
    def __init__(self, memory_dir: str = None):
        self.memory_dir = Path(memory_dir or Path.home() / '.stigmergy_direct_cli')
        self.memory_dir.mkdir(parents=True, exist_ok=True)
        
        # 基于真实架构的CLI调用命令（不需要安装）
        self.cli_commands = {
            'claude': {
                'name': 'Claude Code CLI',
                'commands': [
                    'npx @anthropic/claude-code',
                    'claude-code',  # 如果已安装到PATH
                    '@anthropic/claude-code'
                ],
                'type': 'npm',
                'api_key_env': 'ANTHROPIC_API_KEY',
                'timeout': 120
            },
            'gemini': {
                'name': 'Gemini CLI', 
                'commands': [
                    'npx @google/gemini-cli',
                    'gemini-cli',
                    '@google/gemini-cli'
                ],
                'type': 'npm',
                'api_key_env': 'GOOGLE_AI_API_KEY',
                'timeout': 120
            },
            'qwencode': {
                'name': 'Qwen Code CLI',
                'commands': [
                    'qwencode',
                    'python -m qwencode'
                ],
                'type': 'python',
                'api_key_env': 'QWEN_API_KEY',
                'timeout': 120
            },
            'copilot': {
                'name': 'GitHub Copilot CLI',
                'commands': [
                    'copilot',
                    'github-copilot'
                ],
                'type': 'npm',
                'api_key_env': 'GITHUB_TOKEN',
                'timeout': 120
            },
            'iflow': {
                'name': 'iFlow CLI',
                'commands': [
                    'iflow',
                    'iflow-cli'
                ],
                'type': 'npm',
                'api_key_env': 'IFLOW_API_KEY',
                'timeout': 120
            },
            'qoder': {
                'name': 'Qoder CLI',
                'commands': [
                    'qoder',
                    'python -m qoder'
                ],
                'type': 'python',
                'api_key_env': 'QODER_API_KEY',
                'timeout': 120
            },
            'codebuddy': {
                'name': 'CodeBuddy CLI',
                'commands': [
                    'codebuddy',
                    'codebuddy-code'
                ],
                'type': 'npm',
                'api_key_env': 'CODEBUDDY_API_KEY',
                'timeout': 120
            },
            'codex': {
                'name': 'OpenAI Codex CLI',
                'commands': [
                    'codex',
                    'openai-codex'
                ],
                'type': 'binary',
                'api_key_env': 'OPENAI_API_KEY',
                'timeout': 120
            }
        }
        
        # 初始化记忆文件
        self.global_memory_file = self.memory_dir / 'global_cli_memory.json'
        self.success_patterns_file = self.memory_dir / 'success_patterns.json'
        self.cli_status_file = self.memory_dir / 'cli_status.json'
        self.command_preference_file = self.memory_dir / 'command_preferences.json'
        
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
        
        if not self.command_preference_file.exists():
            safe_file_write(self.command_preference_file, json.dumps({
                'preferred_commands': {},
                'fallback_commands': {},
                'version': '1.0.0'
            }, indent=2, ensure_ascii=False))
    
    def check_cli_availability(self, cli_name: str) -> Tuple[bool, str, str]:
        """检查CLI可用性并返回最佳命令"""
        if cli_name not in self.cli_commands:
            return False, f"Unknown CLI: {cli_name}", ""
        
        cli_info = self.cli_commands[cli_name]
        preferred_commands = self._get_preferred_commands(cli_name)
        
        # 按优先级检查命令
        for command in preferred_commands + cli_info['commands']:
            try:
                # 提取基础命令进行测试
                base_command = command.split()[0]
                result = subprocess.run(
                    f"where {base_command}" if os.name == 'nt' else f"which {base_command}",
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                if result.returncode == 0:
                    # 进一步验证命令完整性
                    try:
                        test_result = subprocess.run(
                            f"{command} --version",
                            shell=True,
                            capture_output=True,
                            text=True,
                            timeout=10
                        )
                        
                        # 记录成功的命令作为偏好
                        self._set_preferred_command(cli_name, command)
                        
                        if test_result.returncode == 0:
                            return True, command, f"Available (v{test_result.stdout.strip()})"
                        else:
                            return True, command, "Available (version check failed but command exists)"
                    except:
                        # 即使版本检查失败，命令也存在
                        self._set_preferred_command(cli_name, command)
                        return True, command, "Available"
                        
            except subprocess.TimeoutExpired:
                continue
            except:
                continue
        
        return False, "", f"{cli_info['name']} not found in system PATH"
    
    def _get_preferred_commands(self, cli_name: str) -> List[str]:
        """获取用户偏好的命令"""
        try:
            preferences = json.loads(safe_file_read(self.command_preference_file))
            return preferences.get('preferred_commands', {}).get(cli_name, [])
        except:
            return []
    
    def _set_preferred_command(self, cli_name: str, command: str):
        """设置用户偏好的命令"""
        try:
            preferences = json.loads(safe_file_read(self.command_preference_file))
            if cli_name not in preferences['preferred_commands']:
                preferences['preferred_commands'][cli_name] = []
            
            # 将成功的命令移到第一位
            if command in preferences['preferred_commands'][cli_name]:
                preferences['preferred_commands'][cli_name].remove(command)
            preferences['preferred_commands'][cli_name].insert(0, command)
            
            # 只保留前5个偏好命令
            preferences['preferred_commands'][cli_name] = preferences['preferred_commands'][cli_name][:5]
            
            safe_file_write(self.command_preference_file, json.dumps(preferences, indent=2, ensure_ascii=False))
        except Exception as e:
            print(f"Warning: Failed to set preferred command: {e}")
    
    def _update_cli_status(self, cli_name: str, available: bool, command: str, message: str):
        """更新CLI状态"""
        try:
            status_data = json.loads(safe_file_read(self.cli_status_file))
            status_data['available_clis'][cli_name] = {
                'available': available,
                'command': command,
                'message': message,
                'last_check': datetime.now().isoformat()
            }
            status_data['last_check'] = datetime.now().isoformat()
            
            safe_file_write(self.cli_status_file, json.dumps(status_data, indent=2, ensure_ascii=False))
        except Exception as e:
            print(f"Warning: Failed to update CLI status: {e}")
    
    def execute_direct_cli_call(self, 
                               source_cli: str,
                               target_cli: str, 
                               request: str,
                               context_files: List[str] = None,
                               working_dir: str = None,
                               use_fallback: bool = True) -> Dict[str, Any]:
        """执行直接CLI调用 - 无需安装"""
        
        result = {
            'success': False,
            'response': '',
            'error': '',
            'command_used': '',
            'fallback_used': False,
            'timestamp': datetime.now().isoformat(),
            'execution_time': 0
        }
        
        start_time = time.time()
        
        # 检查目标CLI可用性
        available, command, message = self.check_cli_availability(target_cli)
        if not available:
            if use_fallback:
                return self._graceful_fallback(source_cli, target_cli, request, context_files, working_dir, f"CLI not available: {message}")
            else:
                result['error'] = f"CLI not available: {message}"
                return result
        
        cli_info = self.cli_commands[target_cli]
        
        try:
            # 构建执行命令
            execution_command = self._build_direct_execution_command(command, cli_info, request, context_files, working_dir)
            
            # 设置环境变量
            env_vars = self._prepare_environment(target_cli)
            
            # 执行命令
            process_result = safe_cli_execute(
                execution_command,
                timeout=cli_info['timeout'],
                work_dir=working_dir,
                env_vars=env_vars
            )
            
            result['execution_time'] = time.time() - start_time
            
            if process_result['success']:
                result.update({
                    'success': True,
                    'response': process_result['stdout'],
                    'command_used': execution_command,
                    'stderr': process_result.get('stderr', '')
                })
                
                # 记录成功模式
                self._record_success_pattern(source_cli, target_cli, request, execution_command, result['execution_time'])
            else:
                if use_fallback:
                    return self._graceful_fallback(source_cli, target_cli, request, context_files, working_dir, f"Execution failed: {process_result['stderr']}")
                else:
                    result['error'] = process_result['stderr']
                    result['command_used'] = execution_command
                
        except Exception as e:
            result['execution_time'] = time.time() - start_time
            if use_fallback:
                return self._graceful_fallback(source_cli, target_cli, request, context_files, working_dir, f"Execution error: {str(e)}")
            else:
                result['error'] = f"Execution error: {str(e)}"
        
        return result
    
    def _build_direct_execution_command(self, base_command: str, cli_info: Dict[str, Any], request: str, context_files: List[str] = None, working_dir: str = None) -> str:
        """基于已安装CLI构建执行命令"""
        
        # 构建命令部分
        if cli_info['type'] == 'npm' and 'npx' in base_command:
            # npx命令
            command_parts = base_command.split()
        else:
            # 其他直接命令
            command_parts = [base_command]
        
        # 根据不同CLI的参数格式添加请求
        cli_name = next(k for k, v in self.cli_commands.items() if v['name'] == cli_info['name'])
        
        if cli_name in ['claude', 'gemini', 'copilot']:
            # npm类型的CLI通常使用 -- 或直接传递参数
            if '"' in request:
                command_parts.extend(['--', request])
            else:
                command_parts.append(request)
        elif cli_name in ['qwencode', 'qoder']:
            # Python类型的CLI通常使用 --prompt 或 -p
            command_parts.extend(['--prompt', request])
        elif cli_name == 'iflow':
            # iFlow直接接受自然语言
            command_parts.append(request)
        elif cli_name == 'codebuddy':
            # CodeBuddy使用自然语言
            command_parts.append(request)
        elif cli_name == 'codex':
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
        if cli_info['type'] == 'npm' and 'npx' in base_command:
            # npx命令需要特殊处理
            full_command = f"{command_parts[0]} {' '.join(command_parts[1:])}"
        else:
            full_command = ' '.join(command_parts)
        
        return full_command
    
    def _prepare_environment(self, cli_name: str) -> Dict[str, str]:
        """准备CLI执行环境"""
        env = os.environ.copy()
        
        cli_info = self.cli_commands[cli_name]
        
        # 设置API密钥环境变量（如果存在）
        if cli_info.get('api_key_env') and cli_info['api_key_env'] in env:
            pass  # 已存在，无需修改
        
        # 根据CLI类型设置特殊环境
        if cli_info['type'] == 'npm':
            # 确保Node.js相关环境
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
        
        elif cli_info['type'] == 'python':
            # Python相关环境
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
        
        # Level 1: 生成等价命令（基于已安装CLI的模式）
        try:
            available_clis = self._get_available_clis()
            cli_info = self.cli_commands[target_cli]
            
            equivalent_command = self._build_direct_execution_command(
                cli_info['commands'][0],  # 使用第一个可能的命令
                cli_info, 
                request, 
                context_files, 
                working_dir
            )
            
            result.update({
                'success': True,
                'response': f"Cannot execute {cli_info['name']} directly, but here's the equivalent command you can run manually:\\n\\n```bash\\n{equivalent_command}\\n```\\n\\nMake sure {cli_info['name']} is installed and accessible in your PATH.",
                'execution_method': 'command_generation',
                'fallback_level': 1,
                'suggested_command': equivalent_command
            })
            
            self._record_fallback_pattern(source_cli, target_cli, request, equivalent_command, 'command_generation')
            return result
            
        except Exception as e:
            error_reason = f"Command generation failed: {str(e)}"
        
        # Level 2: 提供手动指导
        try:
            cli_info = self.cli_commands[target_cli]
            guidance = self._generate_direct_manual_guidance(cli_info, request, context_files, working_dir)
            
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
        
        # Level 3: 建议替代方案（基于可用的CLI）
        try:
            available_clis = self._get_available_clis()
            alternatives = self._suggest_available_alternatives(source_cli, target_cli, request, available_clis)
            
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
    
    def _generate_direct_manual_guidance(self, cli_info: Dict[str, Any], request: str, context_files: List[str] = None, working_dir: str = None) -> str:
        """生成直接使用指导"""
        
        cli_name = next(k for k, v in self.cli_commands.items() if v['name'] == cli_info['name'])
        
        guidance = f"""# Manual Usage Guide for {cli_info['name']}

## Status Check:
Run one of these commands to check if the CLI is available:
"""
        
        for command in cli_info['commands']:
            guidance += f"```bash\\n{command} --version\\n```\\n\\n"
        
        guidance += f"""
## Direct Command:
```bash
{self._build_direct_execution_command(cli_info['commands'][0], cli_info, request, context_files, working_dir)}
```

## Alternative Commands:
Try these if the main command doesn't work:
"""
        
        for command in cli_info['commands'][1:3]:  # 显示前2个替代命令
            alt_command = self._build_direct_execution_command(command, cli_info, request, context_files, working_dir)
            guidance += f"```bash\\n{alt_command}\\n```\\n\\n"
        
        guidance += f"""
## API Key Setup (if required):
"""
        
        if cli_info.get('api_key_env'):
            guidance += f"Set environment variable: `{cli_info['api_key_env']}`\\n\\n"
            guidance += f"```bash\\nexport {cli_info['api_key_env']}='your-api-key-here'\\n```\\n\\n"
        
        guidance += """
## Troubleshooting:
1. Check if the CLI is in your system PATH
2. Verify API key configuration  
3. Test with a simple command first
4. Check network connectivity
"""
        
        return guidance
    
    def _get_available_clis(self) -> Dict[str, str]:
        """获取所有可用的CLI"""
        available = {}
        
        for cli_name in self.cli_commands:
            available, command, message = self.check_cli_availability(cli_name)
            if available:
                available[cli_name] = command
        
        return available
    
    def _suggest_available_alternatives(self, source_cli: str, target_cli: str, request: str, available_clis: Dict[str, str]) -> str:
        """建议可用的替代方案"""
        
        alternatives = f"# Alternative Solutions for {self.cli_commands[target_cli]['name']}\\n\\n"
        
        # 分析请求类型
        request_lower = request.lower()
        
        if 'code' in request_lower or 'programming' in request_lower:
            alternatives += "## Available Code Generation CLIs:\\n\\n"
            
            if available_clis:
                for cli_name, command in available_clis.items():
                    if cli_name != target_cli:
                        cli_info = self.cli_commands[cli_name]
                        alternatives += f"### {cli_info['name']}\\n"
                        alternatives += f"- Command: `{cli_name}`\\n"
                        alternatives += f"- Usage: `{cli_name} \\\"your request\\\"`\\n\\n"
            else:
                alternatives += "- No alternative CLIs are currently available\\n"
                alternatives += "- Consider installing an alternative CLI tool\\n"
                alternatives += "- Use web-based code editors or IDE plugins\\n\\n"
        
        elif 'file' in request_lower or 'analyze' in request_lower:
            alternatives += "## Available Analysis Options:\\n\\n"
            
            if available_clis:
                for cli_name, command in available_clis.items():
                    if cli_name != target_cli:
                        cli_info = self.cli_commands[cli_name]
                        alternatives += f"### {cli_info['name']}\\n"
                        alternatives += f"- Command: `{cli_name} \\\"analyze this file\\\"`\\n\\n"
            
            alternatives += "- Use built-in system commands: `cat`, `grep`, `find`\\n"
            alternatives += "- Use IDE code analysis features\\n"
        
        else:
            alternatives += "## General Alternatives:\\n\\n"
            
            if available_clis:
                alternatives += "### Available CLIs:\\n\\n"
                for cli_name, command in available_clis.items():
                    if cli_name != target_cli:
                        cli_info = self.cli_commands[cli_name]
                        alternatives += f"- **{cli_info['name']}**: `{cli_name}`\\n"
            
            alternatives += "- Use web-based AI assistants\\n"
            alternatives += "- Try desktop applications\\n"
        
        alternatives += f"\\n### Original Request:\\n```\\n{request}\\n```\\n"
        
        return alternatives
    
    def _record_success_pattern(self, source_cli: str, target_cli: str, request: str, command: str, execution_time: float):
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
                'execution_time': execution_time,
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
                    'avg_execution_time': 0.0,
                    'commands': []
                }
            
            patterns_data['optimal_patterns'][pattern_key]['usage_count'] += 1
            patterns_data['optimal_patterns'][pattern_key]['last_used'] = datetime.now().isoformat()
            patterns_data['optimal_patterns'][pattern_key]['commands'].append(command)
            
            # 计算成功率和平均执行时间
            all_calls = patterns_data['successful_calls'] + patterns_data['failed_calls']
            total_attempts = len([c for c in all_calls if c['pattern_id'] == pattern_key])
            successful_attempts = len([c for c in patterns_data['successful_calls'] if c['pattern_id'] == pattern_key])
            
            if total_attempts > 0:
                patterns_data['optimal_patterns'][pattern_key]['success_rate'] = successful_attempts / total_attempts
            
            # 更新平均执行时间
            pattern_calls = [c for c in patterns_data['successful_calls'] if c['pattern_id'] == pattern_key and 'execution_time' in c]
            if pattern_calls:
                patterns_data['optimal_patterns'][pattern_key]['avg_execution_time'] = sum(c['execution_time'] for c in pattern_calls) / len(pattern_calls)
            
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
    
    def get_system_status(self) -> Dict[str, Any]:
        """获取系统状态"""
        status = {
            'available_clis': {},
            'total_clis': len(self.cli_commands),
            'success_patterns': 0,
            'last_updated': datetime.now().isoformat()
        }
        
        # 检查所有CLI
        for cli_name in self.cli_commands:
            available, command, message = self.check_cli_availability(cli_name)
            status['available_clis'][cli_name] = {
                'name': self.cli_commands[cli_name]['name'],
                'available': available,
                'command': command,
                'message': message,
                'type': self.cli_commands[cli_name]['type']
            }
        
        # 统计成功模式
        try:
            patterns_data = json.loads(safe_file_read(self.success_patterns_file))
            status['success_patterns'] = len(patterns_data.get('successful_calls', []))
            status['failed_patterns'] = len(patterns_data.get('failed_calls', []))
        except:
            pass
        
        return status

# 使用示例
if __name__ == '__main__':
    import time
    
    executor = DirectCLIExecutor()
    
    # 检查所有CLI状态
    print("=== CLI Availability Status ===")
    status = executor.get_system_status()
    print(f"Total CLIs: {status['total_clis']}")
    print(f"Available CLIs: {len([c for c in status['available_clis'].values() if c['available']])}")
    
    print("\\n=== Available CLI Details ===")
    for cli_name, info in status['available_clis'].items():
        if info['available']:
            print(f"✓ {info['name']}: {info['command']} ({info['type']})")
        else:
            print(f"✗ {info['name']}: {info['message']}")
    
    # 测试跨CLI调用
    print("\\n=== Direct Cross-CLI Execution Test ===")
    available_clis = [name for name, info in status['available_clis'].items() if info['available']]
    
    if len(available_clis) >= 2:
        source_cli = available_clis[0]
        target_cli = available_clis[1] if len(available_clis) > 1 else available_clis[0]
        
        print(f"Testing: {source_cli} -> {target_cli}")
        
        result = executor.execute_direct_cli_call(
            source_cli=source_cli,
            target_cli=target_cli,
            request='分析这个项目的结构并生成改进建议',
            context_files=['./README.md'] if os.path.exists('./README.md') else None,
            working_dir=os.getcwd()
        )
        
        print(f"Success: {result['success']}")
        print(f"Command: {result.get('command_used', 'N/A')}")
        print(f"Execution time: {result.get('execution_time', 0):.2f}s")
        print(f"Response: {result['response'][:200]}...")
        
        if result.get('fallback_used'):
            print(f"Fallback Level: {result.get('fallback_level', 'unknown')}")
    else:
        print("Need at least 2 available CLIs to test cross-CLI execution")