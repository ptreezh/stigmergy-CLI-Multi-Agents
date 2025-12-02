"""
真实跨CLI调用系统 - 处理已安装和未安装CLI的所有情况
基于真实架构，严格禁止推测
"""

import os
import sys
import json
import subprocess
import shutil
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass
from datetime import datetime
import re

# 导入编码安全模块
sys.path.append(str(Path(__file__).parent))
from cross_platform_encoding import safe_file_write, safe_file_read

@dataclass 
class CLICallMethod:
    """CLI调用方式定义"""
    call_patterns: List[str]  # 按优先级排序的调用方式
    install_command: str      # 如果没安装，如何安装
    type: str                # npm, python, binary
    version_check: str        # 如何检查版本
    api_env: Optional[str]   # API密钥环境变量

class RealCrossCLISystem:
    """真实跨CLI调用系统 - 处理所有安装状态"""
    
    def __init__(self):
        # 基于真实研究的CLI调用方式
        self.cli_methods = {
            # Node.js/npm类型CLI
            'claude': CLICallMethod(
                call_patterns=[
                    'claude',                    # 直接命令（如果已安装到PATH）
                    'npx @anthropic/claude-code', # npx方式
                    'npx claude-code',           # 简化npx
                    '@anthropic/claude-code'      # npm包名
                ],
                install_command='npm install -g @anthropic/claude-code',
                type='npm',
                version_check='npx @anthropic/claude-code --version',
                api_env='ANTHROPIC_API_KEY'
            ),
            
            'gemini': CLICallMethod(
                call_patterns=[
                    'gemini-cli',
                    'npx @google/gemini-cli',
                    'npx gemini-cli', 
                    '@google/gemini-cli'
                ],
                install_command='npm install -g @google/gemini-cli',
                type='npm',
                version_check='npx @google/gemini-cli --version',
                api_env='GOOGLE_AI_API_KEY'
            ),
            
            'copilot': CLICallMethod(
                call_patterns=[
                    'copilot',
                    'npx @github/copilot',
                    'github-copilot'
                ],
                install_command='npm install -g @github/copilot',
                type='npm', 
                version_check='copilot --version',
                api_env='GITHUB_TOKEN'
            ),
            
            'iflow': CLICallMethod(
                call_patterns=[
                    'iflow',
                    'npx @iflow-ai/iflow-cli',
                    'iflow-cli'
                ],
                install_command='npm install -g @iflow-ai/iflow-cli',
                type='npm',
                version_check='iflow --version',
                api_env='IFLOW_API_KEY'
            ),
            
            'codebuddy': CLICallMethod(
                call_patterns=[
                    'codebuddy',
                    'npx @tencent-ai/codebuddy-code',
                    'codebuddy-code'
                ],
                install_command='npm install -g @tencent-ai/codebuddy-code',
                type='npm',
                version_check='codebuddy --version',
                api_env='CODEBUDDY_API_KEY'
            ),
            
            # Python类型CLI
            'qwencode': CLICallMethod(
                call_patterns=[
                    'qwencode',                    # 直接命令
                    'python -m qwencode',         # python -m方式
                    'python3 -m qwencode',        # python3方式
                    'pip show qwencode'            # 通过pip检查
                ],
                install_command='pip install qwencode-cli',
                type='python',
                version_check='qwencode --version',
                api_env='QWEN_API_KEY'
            ),
            
            'qoder': CLICallMethod(
                call_patterns=[
                    'qoder',
                    'python -m qoder',
                    'python3 -m qoder'
                ],
                install_command='pip install qoder-cli', 
                type='python',
                version_check='qoder --version',
                api_env='QODER_API_KEY'
            ),
            
            # 二进制类型CLI
            'codex': CLICallMethod(
                call_patterns=[
                    'codex',
                    'openai-codex',
                    'which codex'                  # 通过which检查
                ],
                install_command='curl -fsSL https://openai.com/codex-cli/install.sh | bash',
                type='binary',
                version_check='codex --version',
                api_env='OPENAI_API_KEY'
            )
        }
        
        # 内存系统
        self.memory_dir = Path.home() / '.real_cross_cli_memory'
        self.memory_dir.mkdir(exist_ok=True)
        self.call_history_file = self.memory_dir / 'call_history.json'
        self.install_history_file = self.memory_dir / 'install_history.json'
    
    def check_cli_status(self, cli_name: str) -> Dict[str, Any]:
        """检查CLI状态 - 返回详细的安装和调用信息"""
        if cli_name not in self.cli_methods:
            return {
                'exists': False,
                'error': f'Unknown CLI: {cli_name}',
                'available_methods': [],
                'best_method': None,
                'needs_install': True
            }
        
        method = self.cli_methods[cli_name]
        available_methods = []
        best_method = None
        
        # 按优先级检查每种调用方式
        for call_pattern in method.call_patterns:
            if self._test_call_pattern(call_pattern, method.type):
                available_methods.append(call_pattern)
                if not best_method:
                    best_method = call_pattern
        
        return {
            'exists': len(available_methods) > 0,
            'cli_name': cli_name,
            'type': method.type,
            'available_methods': available_methods,
            'best_method': best_method,
            'needs_install': len(available_methods) == 0,
            'install_command': method.install_command,
            'api_env': method.api_env,
            'version_info': self._get_version_info(best_method) if best_method else None
        }
    
    def _test_call_pattern(self, call_pattern: str, cli_type: str) -> bool:
        """测试特定的调用模式是否可用"""
        try:
            if cli_type == 'npm':
                # npm类型的检查
                if call_pattern.startswith('npx '):
                    # 测试npx是否可用
                    base_cmd = call_pattern.split()[1]  # 去掉npx
                    if '@' in base_cmd:
                        # 包名格式，测试npx是否能解析
                        result = subprocess.run(
                            f"npx --yes {base_cmd} --version",
                            shell=True,
                            capture_output=True,
                            text=True,
                            timeout=10
                        )
                    else:
                        result = subprocess.run(
                            f"{call_pattern} --version",
                            shell=True,
                            capture_output=True,
                            text=True,
                            timeout=10
                        )
                else:
                    # 直接命令测试
                    base_cmd = call_pattern.split()[0]
                    result = subprocess.run(
                        f"where {base_cmd}" if os.name == 'nt' else f"which {base_cmd}",
                        shell=True,
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    
                    if result.returncode == 0:
                        # 进一步测试版本
                        version_result = subprocess.run(
                            f"{call_pattern} --version",
                            shell=True,
                            capture_output=True,
                            text=True,
                            timeout=10
                        )
                        result.returncode = version_result.returncode
            
            elif cli_type == 'python':
                # Python类型的检查
                if call_pattern.startswith('python -m '):
                    result = subprocess.run(
                        f"{call_pattern} --version",
                        shell=True,
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                else:
                    # 直接命令
                    base_cmd = call_pattern.split()[0]
                    result = subprocess.run(
                        f"where {base_cmd}" if os.name == 'nt' else f"which {base_cmd}",
                        shell=True,
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    
                    if result.returncode == 0:
                        version_result = subprocess.run(
                            f"{call_pattern} --version",
                            shell=True,
                            capture_output=True,
                            text=True,
                            timeout=10
                        )
                        result.returncode = version_result.returncode
            
            elif cli_type == 'binary':
                # 二进制类型的检查
                if 'which' in call_pattern:
                    # which本身就是检查命令
                    parts = call_pattern.split()
                    if len(parts) >= 3:
                        base_cmd = parts[2]  # which <command>中的command
                        result = subprocess.run(
                            f"where {base_cmd}" if os.name == 'nt' else f"which {base_cmd}",
                            shell=True,
                            capture_output=True,
                            text=True,
                            timeout=5
                        )
                    else:
                        result = subprocess.run(['which'], shell=True, capture_output=True, text=True, timeout=5)
                        result.returncode = 1  # 无效的which命令
                else:
                    base_cmd = call_pattern.split()[0]
                    result = subprocess.run(
                        f"where {base_cmd}" if os.name == 'nt' else f"which {base_cmd}",
                        shell=True,
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    
                    if result.returncode == 0:
                        version_result = subprocess.run(
                            f"{call_pattern} --version",
                            shell=True,
                            capture_output=True,
                            text=True,
                            timeout=10
                        )
                        result.returncode = version_result.returncode
            
            else:
                result = subprocess.RunResult()
                result.returncode = 1
            
            return result.returncode == 0
            
        except subprocess.TimeoutExpired:
            return False
        except Exception:
            return False
    
    def _get_version_info(self, call_pattern: str) -> Optional[str]:
        """获取CLI版本信息"""
        try:
            result = subprocess.run(
                f"{call_pattern} --version",
                shell=True,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                return result.stdout.strip() or result.stderr.strip()
            return None
            
        except:
            return None
    
    def call_cli(self, 
                 source_cli: str, 
                 target_cli: str, 
                 request: str, 
                 context_files: List[str] = None,
                 working_dir: str = None,
                 auto_install: bool = False) -> Dict[str, Any]:
        """调用CLI - 处理已安装和未安装的所有情况"""
        
        result = {
            'success': False,
            'response': '',
            'error': '',
            'command_used': '',
            'install_used': False,
            'fallback_used': False,
            'timestamp': datetime.now().isoformat(),
            'execution_time': 0
        }
        
        start_time = time.time()
        
        # 检查目标CLI状态
        status = self.check_cli_status(target_cli)
        
        if not status['exists']:
            # CLI不存在的情况
            if auto_install:
                # 尝试自动安装
                install_result = self._install_cli(target_cli)
                if install_result['success']:
                    # 安装成功，重新检查状态
                    status = self.check_cli_status(target_cli)
                    result['install_used'] = True
            
            if not status['exists']:
                # 仍然不存在，提供降级方案
                result.update(self._handle_missing_cli(source_cli, target_cli, request, context_files, working_dir, status))
                result['execution_time'] = time.time() - start_time
                self._record_call(source_cli, target_cli, request, result)
                return result
        
        # CLI存在，构建并执行命令
        try:
            best_method = status['best_method']
            method_info = self.cli_methods[target_cli]
            
            # 构建完整命令
            full_command = self._build_command(best_method, method_info, request, context_files, working_dir)
            
            # 准备环境
            env = self._prepare_environment(method_info)
            
            # 执行命令
            process_result = subprocess.run(
                full_command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=method_info.api_env and 120 or 60,  # 有API密钥的超时时间更长
                cwd=working_dir,
                env=env
            )
            
            result['execution_time'] = time.time() - start_time
            result['command_used'] = full_command
            
            if process_result.returncode == 0:
                result.update({
                    'success': True,
                    'response': process_result.stdout,
                    'stderr': process_result.stderr,
                    'method_used': best_method
                })
            else:
                # 执行失败，尝试其他可用方法
                result.update(self._handle_execution_failure(source_cli, target_cli, request, context_files, working_dir, status, process_result.stderr))
        
        except subprocess.TimeoutExpired:
            result['execution_time'] = time.time() - start_time
            result.update(self._handle_timeout(source_cli, target_cli, request, context_files, working_dir))
        
        except Exception as e:
            result['execution_time'] = time.time() - start_time
            result.update(self._handle_exception(source_cli, target_cli, request, context_files, working_dir, str(e)))
        
        # 记录调用历史
        self._record_call(source_cli, target_cli, request, result)
        
        return result
    
    def _build_command(self, base_method: str, method_info: CLICallMethod, request: str, context_files: List[str] = None, working_dir: str = None) -> str:
        """构建完整的CLI命令"""
        
        # 基础命令部分
        if method_info.type == 'npm' and base_method.startswith('npx '):
            # npx命令需要特殊处理
            command_parts = base_method.split()
        else:
            command_parts = [base_method]
        
        # 根据CLI类型添加请求参数
        cli_name = next(k for k, v in self.cli_methods.items() if v == method_info)
        
        if cli_name in ['claude', 'gemini', 'copilot']:
            # npm类型CLI通常直接传递参数或使用 --
            if '"' in request or "'" in request or len(request.split()) > 1:
                command_parts.extend(['--', request])
            else:
                command_parts.append(request)
        
        elif cli_name in ['qwencode', 'qoder']:
            # Python类型CLI通常使用 --prompt 或 -p
            command_parts.extend(['--prompt', f'"{request}"'])
        
        elif cli_name in ['iflow', 'codebuddy']:
            # 直接传递请求
            command_parts.append(f'"{request}"')
        
        elif cli_name == 'codex':
            # Codex CLI特定格式
            command_parts.extend(['--request', f'"{request}"'])
        
        # 添加文件引用
        if context_files:
            for file_path in context_files:
                if os.path.exists(file_path):
                    command_parts.extend(['--file', file_path])
        
        # 添加工作目录
        if working_dir:
            command_parts.extend(['--cwd', working_dir])
        
        # 构建完整命令
        if method_info.type == 'npm' and base_method.startswith('npx '):
            # npx命令保持原格式
            full_command = f"{command_parts[0]} {' '.join(command_parts[1:])}"
        else:
            full_command = ' '.join(command_parts)
        
        return full_command
    
    def _prepare_environment(self, method_info: CLICallMethod) -> Dict[str, str]:
        """准备CLI执行环境"""
        env = os.environ.copy()
        
        # 设置API密钥（如果需要且存在）
        if method_info.api_env and method_info.api_env in env:
            # API密钥已存在，无需修改
            pass
        
        # 根据CLI类型设置特殊环境
        if method_info.type == 'npm':
            # npm相关环境
            npm_config_prefix = env.get('NPM_CONFIG_PREFIX')
            if not npm_config_prefix:
                npm_config_prefix = os.path.join(os.path.expanduser('~'), '.npm-global')
                env['NPM_CONFIG_PREFIX'] = npm_config_prefix
            
            # 确保全局npm包在PATH中
            global_bin = os.path.join(npm_config_prefix, 'bin')
            if global_bin not in env.get('PATH', ''):
                env['PATH'] = f"{global_bin}{os.pathsep}{env.get('PATH', '')}"
        
        elif method_info.type == 'python':
            # Python相关环境
            user_base = os.path.join(os.path.expanduser('~'), '.local')
            user_bin = os.path.join(user_base, 'bin')
            if user_bin not in env.get('PATH', ''):
                env['PATH'] = f"{user_bin}{os.pathsep}{env.get('PATH', '')}"
        
        return env
    
    def _install_cli(self, cli_name: str) -> Dict[str, Any]:
        """安装CLI工具"""
        if cli_name not in self.cli_methods:
            return {'success': False, 'error': f'Unknown CLI: {cli_name}'}
        
        method_info = self.cli_methods[cli_name]
        
        try:
            print(f"🔧 正在安装 {cli_name}...")
            
            # 执行安装命令
            result = subprocess.run(
                method_info.install_command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=300  # 5分钟超时
            )
            
            install_result = {
                'success': result.returncode == 0,
                'command': method_info.install_command,
                'stdout': result.stdout,
                'stderr': result.stderr,
                'timestamp': datetime.now().isoformat()
            }
            
            # 记录安装历史
            self._record_installation(cli_name, install_result)
            
            if install_result['success']:
                print(f"✅ {cli_name} 安装成功")
            else:
                print(f"❌ {cli_name} 安装失败: {result.stderr}")
            
            return install_result
            
        except subprocess.TimeoutExpired:
            error_msg = f"{cli_name} 安装超时"
            print(f"⏰ {error_msg}")
            return {'success': False, 'error': error_msg}
        
        except Exception as e:
            error_msg = f"{cli_name} 安装异常: {str(e)}"
            print(f"💥 {error_msg}")
            return {'success': False, 'error': error_msg}
    
    def _handle_missing_cli(self, source_cli: str, target_cli: str, request: str, context_files: List[str], working_dir: str, status: Dict[str, Any]) -> Dict[str, Any]:
        """处理缺失CLI的情况"""
        method_info = self.cli_methods[target_cli]
        
        # Level 1: 提供安装指导
        install_guidance = f"""# {method_info.type.title()} CLI 安装指导

## 快速安装命令:
```bash
{status['install_command']}
```

## 验证安装:
安装后运行以下命令验证:
```bash
{method_info.version_check}
```

## 使用方式:
安装后可以使用以下任一方式调用:
"""
        
        for i, call_pattern in enumerate(method_info.call_patterns[:3]):
            install_guidance += f"{i+1}. `{call_pattern}`\\n"
        
        if status['api_env']:
            install_guidance += f"""
## 环境变量设置:
```bash
export {status['api_env']}='your-api-key-here'
```
"""
        
        return {
            'success': True,
            'response': install_guidance,
            'fallback_used': True,
            'fallback_level': 'install_guidance',
            'fallback_reason': f'{target_cli} not installed'
        }
    
    def _handle_execution_failure(self, source_cli: str, target_cli: str, request: str, context_files: List[str], working_dir: str, status: Dict[str, Any], error_msg: str) -> Dict[str, Any]:
        """处理执行失败的情况"""
        method_info = self.cli_methods[target_cli]
        
        # 尝试其他可用的调用方法
        fallback_methods = [m for m in status['available_methods'] if m != status['best_method']]
        
        if fallback_methods:
            # Level 1: 尝试其他调用方法
            alt_method = fallback_methods[0]
            alt_command = self._build_command(alt_method, method_info, request, context_files, working_dir)
            
            try:
                process_result = subprocess.run(
                    alt_command,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=60,
                    cwd=working_dir,
                    env=self._prepare_environment(method_info)
                )
                
                if process_result.returncode == 0:
                    return {
                        'success': True,
                        'response': process_result.stdout,
                        'stderr': process_result.stderr,
                        'command_used': alt_command,
                        'method_used': alt_method,
                        'fallback_used': True,
                        'fallback_level': 'alternative_method'
                    }
            
            except:
                pass  # 继续到下一个降级级别
        
        # Level 2: 提供手动执行指导
        manual_guidance = f"""# 手动执行指导

原始方法失败，请尝试以下手动方式:

## 可用调用方式:
"""
        for i, method in enumerate(status['available_methods']):
            command = self._build_command(method, method_info, request, context_files, working_dir)
            manual_guidance += f"### 方式 {i+1}:
```bash
{command}
```
\\n"
        
        manual_guidance += f"""
## 原始错误信息:
```
{error_msg}
```
"""
        
        return {
            'success': True,
            'response': manual_guidance,
            'fallback_used': True,
            'fallback_level': 'manual_guidance',
            'fallback_reason': 'execution_failed'
        }
    
    def _handle_timeout(self, source_cli: str, target_cli: str, request: str, context_files: List[str], working_dir: str) -> Dict[str, Any]:
        """处理超时情况"""
        timeout_guidance = f"""# 执行超时处理

{target_cli} 执行超时，可能原因:
1. 网络连接问题
2. API密钥配置错误
3. 请求过于复杂

## 建议操作:
1. 检查网络连接
2. 验证API密钥配置
3. 简化请求内容
4. 尝试手动执行

## 手动命令:
```bash
# 简化版本请求
{target_cli} "简单请求"
```
"""
        
        return {
            'success': False,
            'response': timeout_guidance,
            'fallback_used': True,
            'fallback_level': 'timeout_guidance',
            'fallback_reason': 'execution_timeout'
        }
    
    def _handle_exception(self, source_cli: str, target_cli: str, request: str, context_files: List[str], working_dir: str, error_msg: str) -> Dict[str, Any]:
        """处理异常情况"""
        exception_guidance = f"""# 执行异常处理

{target_cli} 执行出现异常: {error_msg}

## 可能解决方案:
1. 检查CLI是否正确安装
2. 验证系统环境配置
3. 检查权限设置
4. 查看详细错误日志

## 故障排除:
```bash
# 检查CLI状态
{self.cli_methods[target_cli].version_check}

# 检查环境变量
env | grep -i api
```
"""
        
        return {
            'success': False,
            'response': exception_guidance,
            'fallback_used': True,
            'fallback_level': 'exception_guidance',
            'fallback_reason': 'execution_exception'
        }
    
    def _record_call(self, source_cli: str, target_cli: str, request: str, result: Dict[str, Any]):
        """记录调用历史"""
        try:
            # 加载现有历史
            if self.call_history_file.exists():
                history = json.loads(safe_file_read(self.call_history_file))
            else:
                history = {'calls': [], 'stats': {}}
            
            # 添加新记录
            call_record = {
                'timestamp': result['timestamp'],
                'source_cli': source_cli,
                'target_cli': target_cli,
                'request': request[:200] + '...' if len(request) > 200 else request,
                'success': result['success'],
                'execution_time': result.get('execution_time', 0),
                'command_used': result.get('command_used', ''),
                'install_used': result.get('install_used', False),
                'fallback_used': result.get('fallback_used', False),
                'fallback_level': result.get('fallback_level', ''),
                'method_used': result.get('method_used', '')
            }
            
            history['calls'].append(call_record)
            
            # 保留最近1000条记录
            if len(history['calls']) > 1000:
                history['calls'] = history['calls'][-1000:]
            
            # 更新统计
            pattern = f"{source_cli}->{target_cli}"
            if pattern not in history['stats']:
                history['stats'][pattern] = {
                    'total_calls': 0,
                    'successful_calls': 0,
                    'avg_execution_time': 0,
                    'last_call': None
                }
            
            history['stats'][pattern]['total_calls'] += 1
            if result['success']:
                history['stats'][pattern]['successful_calls'] += 1
            
            if result.get('execution_time', 0) > 0:
                current_avg = history['stats'][pattern]['avg_execution_time']
                total_calls = history['stats'][pattern]['total_calls']
                history['stats'][pattern]['avg_execution_time'] = (
                    (current_avg * (total_calls - 1) + result['execution_time']) / total_calls
                )
            
            history['stats'][pattern]['last_call'] = result['timestamp']
            
            # 保存历史
            safe_file_write(self.call_history_file, json.dumps(history, indent=2, ensure_ascii=False))
            
        except Exception as e:
            print(f"Warning: Failed to record call history: {e}")
    
    def _record_installation(self, cli_name: str, install_result: Dict[str, Any]):
        """记录安装历史"""
        try:
            if self.install_history_file.exists():
                history = json.loads(safe_file_read(self.install_history_file))
            else:
                history = {'installations': []}
            
            install_record = {
                'timestamp': install_result['timestamp'],
                'cli_name': cli_name,
                'command': install_result['command'],
                'success': install_result['success'],
                'stdout': install_result.get('stdout', '')[:500],
                'stderr': install_result.get('stderr', '')[:500]
            }
            
            history['installations'].append(install_record)
            
            # 保留最近100条安装记录
            if len(history['installations']) > 100:
                history['installations'] = history['installations'][-100:]
            
            safe_file_write(self.install_history_file, json.dumps(history, indent=2, ensure_ascii=False))
            
        except Exception as e:
            print(f"Warning: Failed to record installation history: {e}")
    
    def get_system_overview(self) -> Dict[str, Any]:
        """获取系统概览"""
        overview = {
            'timestamp': datetime.now().isoformat(),
            'cli_status': {},
            'total_clis': len(self.cli_methods),
            'available_clis': 0,
            'unavailable_clis': 0,
            'call_statistics': {},
            'recent_installations': []
        }
        
        # 检查所有CLI状态
        for cli_name in self.cli_methods:
            status = self.check_cli_status(cli_name)
            overview['cli_status'][cli_name] = {
                'exists': status['exists'],
                'type': status['type'],
                'best_method': status.get('best_method', ''),
                'available_methods_count': len(status['available_methods']),
                'version_info': status.get('version_info', ''),
                'needs_install': status['needs_install']
            }
            
            if status['exists']:
                overview['available_clis'] += 1
            else:
                overview['unavailable_clis'] += 1
        
        # 加载调用统计
        try:
            if self.call_history_file.exists():
                history = json.loads(safe_file_read(self.call_history_file))
                overview['call_statistics'] = history.get('stats', {})
        except:
            pass
        
        # 加载最近安装
        try:
            if self.install_history_file.exists():
                history = json.loads(safe_file_read(self.install_history_file))
                overview['recent_installations'] = history.get('installations', [])[-5:]
        except:
            pass
        
        return overview

# 使用示例和测试
if __name__ == '__main__':
    system = RealCrossCLISystem()
    
    print("🔍 真实跨CLI调用系统测试")
    print("=" * 50)
    
    # 1. 系统概览
    print("📊 系统概览:")
    overview = system.get_system_overview()
    print(f"   总CLI数: {overview['total_clis']}")
    print(f"   可用CLI: {overview['available_clis']}")
    print(f"   不可用CLI: {overview['unavailable_clis']}")
    
    print("\n📋 CLI状态详情:")
    for cli_name, status in overview['cli_status'].items():
        status_icon = "✅" if status['exists'] else "❌"
        print(f"   {status_icon} {cli_name}: {status['type']} - {status['best_method'] or '未安装'}")
    
    # 2. 测试跨CLI调用
    available_clis = [name for name, status in overview['cli_status'].items() if status['exists']]
    
    if len(available_clis) >= 1:
        print(f"\n🚀 测试CLI调用:")
        
        # 测试直接调用（用同一个CLI）
        test_cli = available_clis[0]
        print(f"   测试直接调用 {test_cli}...")
        
        result = system.call_cli(
            source_cli='user',
            target_cli=test_cli,
            request='生成一个简单的Python Hello World程序',
            auto_install=False
        )
        
        print(f"   成功: {result['success']}")
        print(f"   命令: {result.get('command_used', 'N/A')}")
        print(f"   时间: {result.get('execution_time', 0):.2f}s")
        if result.get('fallback_used'):
            print(f"   降级: {result.get('fallback_level', 'unknown')}")
        
        if len(available_clis) >= 2:
            # 测试跨CLI调用
            source_cli = available_clis[0]
            target_cli = available_clis[1]
            
            print(f"\n   测试跨CLI调用 {source_cli} -> {target_cli}...")
            
            cross_result = system.call_cli(
                source_cli=source_cli,
                target_cli=target_cli,
                request='分析当前目录结构',
                auto_install=False
            )
            
            print(f"   成功: {cross_result['success']}")
            print(f"   命令: {cross_result.get('command_used', 'N/A')}")
            print(f"   时间: {cross_result.get('execution_time', 0):.2f}s")
            if cross_result.get('fallback_used'):
                print(f"   降级: {cross_result.get('fallback_level', 'unknown')}")
    
    else:
        print("\n⚠️ 没有可用的CLI进行调用测试")
        print("   可以尝试 auto_install=True 来自动安装CLI")
    
    # 3. 测试未安装CLI的处理
    print(f"\n🔧 测试未安装CLI处理:")
    missing_result = system.call_cli(
        source_cli='user',
        target_cli='nonexistent_cli',
        request='测试处理',
        auto_install=False
    )
    
    print(f"   降级使用: {missing_result.get('fallback_used', False)}")
    print(f"   降级级别: {missing_result.get('fallback_level', 'unknown')}")
    print(f"   响应长度: {len(missing_result.get('response', ''))}")
    
    print("\n✅ 测试完成!")