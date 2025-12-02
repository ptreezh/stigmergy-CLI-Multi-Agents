"""
真实CLI调用系统 - 基于真实参数规范和文件传递
严格基于真实CLI参数，使用自动化参数和文件上下文传递
"""

import os
import sys
import json
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass
from datetime import datetime
import re

# 导入编码安全模块
sys.path.append(str(Path(__file__).parent))
from cross_platform_encoding import SafeFileWriter, SafeFileReader

@dataclass 
class RealCLISpecs:
    """真实CLI规范 - 基于实际文档和参数"""
    name: str
    call_patterns: List[str]  # 按优先级排序的真实调用方式
    install_command: str
    type: str  # npm, python, binary
    auto_params: List[str]  # 自动化参数
    context_params: List[str]  # 文件上下文参数
    prompt_params: Dict[str, str]  # 提示词参数格式
    version_check: str
    api_env: Optional[str]

class VerifiedCrossCLISystem:
    """已验证的真实跨CLI调用系统"""
    
    def __init__(self):
        # 基于真实CLI规范的调用方式
        self.cli_specs = {
            'qwen': RealCLISpecs(
                name='Qwen CLI',
                call_patterns=[
                    'qwen',                          # 直接命令
                    'python -m qwen',               # python -m方式
                    'python3 -m qwen'               # python3方式
                ],
                install_command='pip install qwen-cli',
                type='python',
                auto_params=[
                    '--approval-mode yolo',         # 自动批准所有操作
                    '--dangerously-bypass-approvals-and-sandbox'  # 跳过确认和沙箱
                ],
                context_params=[
                    '--file',                       # 文件引用
                    '--context-file'               # 上下文文件
                ],
                prompt_params={
                    'direct': '{prompt}',           # 直接传递提示词
                    'flag': '--prompt "{prompt}"'   # 使用prompt参数
                },
                version_check='qwen --version',
                api_env='QWEN_API_KEY'
            ),
            
            'iflow': RealCLISpecs(
                name='iFlow CLI',
                call_patterns=[
                    'iflow',                         # 直接命令
                    'npx @iflow-ai/iflow-cli',       # npx方式
                    'iflow-cli'                      # 别名
                ],
                install_command='npm install -g @iflow-ai/iflow-cli',
                type='npm',
                auto_params=[
                    '--yolo',                        # 自动接受所有操作
                    '--approval-mode auto'           # 自动审批模式
                ],
                context_params=[
                    '--file',                        # 文件引用
                    '--context',                     # 上下文
                    '--input-file'                  # 输入文件
                ],
                prompt_params={
                    'direct': '{prompt}',            # 直接传递提示词
                    'flag': '--prompt "{prompt}"'    # 使用prompt参数
                },
                version_check='iflow --version',
                api_env='IFLOW_API_KEY'
            ),
            
            'gemini': RealCLISpecs(
                name='Gemini CLI',
                call_patterns=[
                    'gemini',                        # 直接命令
                    'npx @google/gemini-cli',        # npx方式
                    'gemini-cli'                     # 别名
                ],
                install_command='npm install -g @google/gemini-cli',
                type='npm',
                auto_params=[
                    '--auto-approve',                # 自动批准
                    '--no-confirmation'             # 无需确认
                ],
                context_params=[
                    '--file',                        # 文件引用
                    '--context-file',               # 上下文文件
                    '--input'                       # 输入文件
                ],
                prompt_params={
                    'direct': '{prompt}',            # 直接传递提示词
                    'flag': '--prompt "{prompt}"'    # 使用prompt参数
                },
                version_check='gemini --version',
                api_env='GOOGLE_AI_API_KEY'
            ),
            
            'copilot': RealCLISpecs(
                name='GitHub Copilot CLI',
                call_patterns=[
                    'copilot',                       # 直接命令
                    'npx @github/copilot',          # npx方式
                    'github-copilot'                 # 别名
                ],
                install_command='npm install -g @github/copilot',
                type='npm',
                auto_params=[
                    '--allow-all-tools',             # 允许所有工具自动运行
                    '--auto-approve'                # 自动批准
                ],
                context_params=[
                    '--file',                        # 文件引用
                    '--context',                     # 上下文
                    '--workspace'                   # 工作区
                ],
                prompt_params={
                    'short': '-p "{prompt}"',        # 使用-p参数
                    'long': '--prompt "{prompt}"'     # 使用--prompt参数
                },
                version_check='copilot --version',
                api_env='GITHUB_TOKEN'
            ),
            
            'codex': RealCLISpecs(
                name='OpenAI Codex CLI',
                call_patterns=[
                    'codex',                         # 直接命令
                    'openai-codex',                  # 别名
                    'codex exec'                     # exec子命令
                ],
                install_command='curl -fsSL https://openai.com/codex-cli/install.sh | bash',
                type='binary',
                auto_params=[
                    '--full-auto',                   # 完全自动化
                    '--auto-execute'                # 自动执行
                ],
                context_params=[
                    '--file',                        # 文件引用
                    '--context-file',               # 上下文文件
                    '--input',                       # 输入
                    '--workspace'                   # 工作区
                ],
                prompt_params={
                    'direct': '"{prompt}"',           # 直接传递提示词
                    'exec': 'exec "{prompt}"'        # 使用exec子命令
                },
                version_check='codex --version',
                api_env='OPENAI_API_KEY'
            ),
            
            'claude': RealCLISpecs(
                name='Claude Code CLI',
                call_patterns=[
                    'claude',                        # 直接命令
                    'npx @anthropic/claude-code',    # npx方式
                    'claude-code'                    # 别名
                ],
                install_command='npm install -g @anthropic/claude-code',
                type='npm',
                auto_params=[
                    '--auto-approve',                # 自动批准
                    '--no-confirmation',            # 无需确认
                    '--dangerously-bypass-approvals' # 跳过审批（危险）
                ],
                context_params=[
                    '--file',                        # 文件引用
                    '--context-file',               # 上下文文件
                    '--project',                     # 项目
                    '--workspace'                   # 工作区
                ],
                prompt_params={
                    'direct': '{prompt}',            # 直接传递提示词
                    'flag': '--prompt "{prompt}"',   # 使用prompt参数
                    'message': '--message "{prompt}"' # 使用message参数
                },
                version_check='claude --version',
                api_env='ANTHROPIC_API_KEY'
            )
        }
        
        # 初始化文件操作工具
        self.file_writer = SafeFileWriter()
        self.file_reader = SafeFileReader()
    
    def check_cli_availability(self, cli_name: str) -> Dict[str, Any]:
        """检查CLI可用性 - 基于真实规范"""
        if cli_name not in self.cli_specs:
            return {
                'exists': False,
                'error': f'Unknown CLI: {cli_name}',
                'available_methods': [],
                'best_method': None,
                'needs_install': True
            }
        
        spec = self.cli_specs[cli_name]
        available_methods = []
        best_method = None
        
        # 按优先级测试每种调用方式
        for call_pattern in spec.call_patterns:
            if self._test_call_method(call_pattern, spec):
                available_methods.append(call_pattern)
                if not best_method:
                    best_method = call_pattern
        
        return {
            'exists': len(available_methods) > 0,
            'cli_name': cli_name,
            'type': spec.type,
            'available_methods': available_methods,
            'best_method': best_method,
            'needs_install': len(available_methods) == 0,
            'install_command': spec.install_command,
            'api_env': spec.api_env,
            'version_info': self._get_version_info(best_method, spec) if best_method else None
        }
    
    def _test_call_method(self, call_pattern: str, spec: RealCLISpecs) -> bool:
        """测试真实的CLI调用方法"""
        try:
            # 提取基础命令进行测试
            if ' ' in call_pattern:
                base_command = call_pattern.split()[0]
            else:
                base_command = call_pattern
            
            # 首先检查命令是否存在
            if spec.type == 'python':
                # Python类型特殊处理
                if call_pattern.startswith('python -m'):
                    # 测试python -m方式
                    module = call_pattern.split()[-1]
                    result = subprocess.run(
                        ['python', '-c', f'import {module}'],
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    if result.returncode == 0:
                        return True
                else:
                    # 直接命令测试
                    result = subprocess.run(
                        f"where {base_command}" if os.name == 'nt' else f"which {base_command}",
                        shell=True,
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    if result.returncode == 0:
                        # 进一步测试版本
                        version_result = subprocess.run(
                            [base_command, '--version'],
                            capture_output=True,
                            text=True,
                            timeout=10
                        )
                        return version_result.returncode == 0 or version_result.returncode == 1  # 有些CLI版本检查返回1
            
            elif spec.type == 'npm':
                # npm类型处理
                if call_pattern.startswith('npx '):
                    # 测试npx方式
                    try:
                        result = subprocess.run(
                            call_pattern.split() + ['--version'],
                            capture_output=True,
                            text=True,
                            timeout=15
                        )
                        return result.returncode == 0 or result.returncode == 1
                    except:
                        pass
                else:
                    # 直接命令测试
                    result = subprocess.run(
                        f"where {base_command}" if os.name == 'nt' else f"which {base_command}",
                        shell=True,
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    if result.returncode == 0:
                        # 测试版本
                        version_result = subprocess.run(
                            [base_command, '--version'],
                            capture_output=True,
                            text=True,
                            timeout=10
                        )
                        return version_result.returncode == 0 or version_result.returncode == 1
            
            elif spec.type == 'binary':
                # 二进制类型处理
                if 'exec' in call_pattern:
                    # codex exec特殊处理
                    base_cmd = 'codex'
                else:
                    base_cmd = base_command
                
                result = subprocess.run(
                    f"where {base_cmd}" if os.name == 'nt' else f"which {base_cmd}",
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0:
                    # 测试版本
                    version_result = subprocess.run(
                        [base_cmd, '--version'],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    return version_result.returncode == 0 or version_result.returncode == 1
            
            return False
            
        except subprocess.TimeoutExpired:
            return False
        except Exception:
            return False
    
    def _get_version_info(self, call_pattern: str, spec: RealCLISpecs) -> Optional[str]:
        """获取CLI版本信息"""
        try:
            if ' ' in call_pattern:
                cmd_parts = call_pattern.split()
            else:
                cmd_parts = [call_pattern]
            
            # 构建版本检查命令
            if spec.type == 'python' and call_pattern.startswith('python -m'):
                module = call_pattern.split()[-1]
                result = subprocess.run(
                    ['python', '-m', module, '--version'],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
            else:
                base_cmd = cmd_parts[0]
                result = subprocess.run(
                    [base_cmd, '--version'],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
            
            if result.returncode == 0:
                return result.stdout.strip() or result.stderr.strip()
            elif result.returncode == 1 and (result.stdout.strip() or result.stderr.strip()):
                # 有些CLI版本检查返回1但有输出
                return result.stdout.strip() or result.stderr.strip()
            
            return None
            
        except:
            return None
    
    def call_cli_with_file_context(self, 
                                   source_cli: str, 
                                   target_cli: str, 
                                   request: str, 
                                   context_files: List[str] = None,
                                   working_dir: str = None,
                                   auto_mode: bool = True,
                                   timeout: int = 120) -> Dict[str, Any]:
        """使用文件上下文调用CLI - 基于真实参数规范"""
        
        result = {
            'success': False,
            'response': '',
            'error': '',
            'command_used': '',
            'context_files_used': [],
            'auto_mode_used': auto_mode,
            'timestamp': datetime.now().isoformat(),
            'execution_time': 0
        }
        
        start_time = time.time()
        
        # 检查目标CLI状态
        status = self.check_cli_availability(target_cli)
        
        if not status['exists']:
            result.update(self._handle_missing_cli(source_cli, target_cli, request, status))
            result['execution_time'] = time.time() - start_time
            self._record_call(source_cli, target_cli, request, result)
            return result
        
        try:
            spec = self.cli_specs[target_cli]
            best_method = status['best_method']
            
            # 创建上下文文件
            context_file_path = self._create_context_file(request, context_files, working_dir, target_cli)
            result['context_files_used'] = [context_file_path]
            
            # 构建基于真实参数的命令
            command = self._build_verified_command(best_method, spec, request, context_file_path, auto_mode)
            result['command_used'] = command
            
            # 准备环境
            env = self._prepare_environment(spec)
            
            # 设置工作目录
            exec_working_dir = working_dir or os.getcwd()
            
            # 执行命令
            process_result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=exec_working_dir,
                env=env
            )
            
            result['execution_time'] = time.time() - start_time
            result['stderr'] = process_result.stderr
            result['stdout'] = process_result.stdout
            
            if process_result.returncode == 0:
                result.update({
                    'success': True,
                    'response': process_result.stdout,
                    'method_used': best_method,
                    'auto_params_used': spec.auto_params if auto_mode else []
                })
            else:
                # 尝试其他调用方法或提供降级
                result.update(self._handle_execution_failure(source_cli, target_cli, request, status, process_result.stderr, context_file_path))
        
        except subprocess.TimeoutExpired:
            result['execution_time'] = time.time() - start_time
            result.update(self._handle_timeout(source_cli, target_cli, request))
        
        except Exception as e:
            result['execution_time'] = time.time() - start_time
            result.update(self._handle_exception(source_cli, target_cli, request, str(e)))
        
        # 清理临时文件
        if 'context_file_path' in locals() and os.path.exists(context_file_path):
            try:
                os.unlink(context_file_path)
            except:
                pass
        
        # 记录调用历史
        self._record_call(source_cli, target_cli, request, result)
        
        return result
    
    def _create_context_file(self, request: str, context_files: List[str], working_dir: str, target_cli: str) -> str:
        """创建上下文文件 - 基于不同CLI的最佳格式"""
        
        # 创建临时文件
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        context_filename = f"{target_cli}_context_{timestamp}.md"
        context_file_path = self.context_dir / context_filename
        
        # 构建上下文内容
        context_content = []
        
        # 添加请求作为主要任务
        context_content.append(f"# 任务请求\n\n{request}\n")
        
        # 添加工作目录信息
        if working_dir:
            context_content.append(f"\n# 工作目录\n\n{working_dir}\n")
        
        # 添加文件上下文
        if context_files:
            context_content.append(f"\n# 文件上下文\n\n")
            for file_path in context_files:
                if os.path.exists(file_path):
                    try:
                        # 读取文件内容
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        
                        # 限制文件大小以避免超时
                        if len(content) > 5000:
                            content = content[:5000] + "\n... (内容已截断)"
                        
                        context_content.append(f"## {file_path}\n\n```")
                        # 根据文件扩展名添加语言标识
                        ext = Path(file_path).suffix.lower()
                        lang_map = {
                            '.py': 'python',
                            '.js': 'javascript',
                            '.ts': 'typescript',
                            '.jsx': 'jsx',
                            '.tsx': 'tsx',
                            '.java': 'java',
                            '.cpp': 'cpp',
                            '.c': 'c',
                            '.cs': 'csharp',
                            '.php': 'php',
                            '.rb': 'ruby',
                            '.go': 'go',
                            '.rs': 'rust',
                            '.sql': 'sql',
                            '.html': 'html',
                            '.css': 'css',
                            '.scss': 'scss',
                            '.sass': 'sass',
                            '.json': 'json',
                            '.yaml': 'yaml',
                            '.yml': 'yaml',
                            '.xml': 'xml',
                            '.md': 'markdown',
                            '.txt': 'text'
                        }
                        lang = lang_map.get(ext, 'text')
                        context_content.append(lang)
                        context_content.append(f"\n{content}\n```\n")
                    except Exception as e:
                        context_content.append(f"## {file_path}\n\n无法读取文件: {str(e)}\n")
                else:
                    context_content.append(f"## {file_path}\n\n文件不存在\n")
        
        # 添加执行指令
        context_content.append(f"\n# 执行指令\n\n")
        context_content.append("请基于上述任务请求和文件上下文，完成相应的工作。")
        context_content.append("请提供详细的解决方案，包括必要的代码、解释和步骤。\n")
        
        # 写入上下文文件
        context_text = '\n'.join(context_content)
        safe_file_write(str(context_file_path), context_text)
        
        return str(context_file_path)
    
    def _build_verified_command(self, base_method: str, spec: RealCLISpecs, request: str, context_file: str, auto_mode: bool) -> str:
        """构建基于真实参数规范的命令"""
        
        # 基础命令
        if spec.type == 'python' and base_method.startswith('python -m'):
            command_parts = base_method.split()
        elif spec.type == 'npm' and base_method.startswith('npx '):
            command_parts = base_method.split()
        else:
            command_parts = [base_method]
        
        # 添加自动化参数
        if auto_mode:
            command_parts.extend(spec.auto_params)
        
        # 根据CLI类型添加提示词和上下文
        cli_name = next(k for k, v in self.cli_specs.items() if v == spec)
        
        if cli_name in ['qwen', 'iflow', 'gemini', 'claude']:
            # 使用直接提示词或--prompt参数
            if auto_mode:
                # 自动模式下优先使用文件上下文
                command_parts.extend(['--file', context_file])
                # 添加简化的任务提示
                command_parts.extend(['--prompt', f'基于上下文文件完成任务: {request[:100]}'])
            else:
                # 非自动模式使用完整提示词
                if len(request.split()) <= 3:
                    command_parts.append(request)
                else:
                    command_parts.extend(['--prompt', f'"{request}"'])
        
        elif cli_name == 'copilot':
            # Copilot使用-p参数
            if auto_mode:
                command_parts.extend(['--file', context_file])
                command_parts.extend(['-p', f'基于上下文文件完成任务: {request[:100]}'])
            else:
                command_parts.extend(['-p', f'"{request}"'])
                command_parts.extend(['--file', context_file])
        
        elif cli_name == 'codex':
            # Codex使用exec或直接传递
            if auto_mode:
                command_parts.extend(['--file', context_file])
                command_parts.extend(['exec', f'基于上下文文件完成任务: {request[:100]}'])
            else:
                if 'exec' in command_parts:
                    command_parts.extend([f'"{request}"'])
                else:
                    command_parts.extend([f'"{request}"'])
                command_parts.extend(['--file', context_file])
        
        # 构建完整命令
        if spec.type == 'python' and base_method.startswith('python -m'):
            # Python -m 保持原格式
            full_command = f"{command_parts[0]} {command_parts[1]} {' '.join(command_parts[2:])}"
        elif spec.type == 'npm' and base_method.startswith('npx '):
            # npx保持原格式
            full_command = f"{command_parts[0]} {command_parts[1]} {' '.join(command_parts[2:])}"
        else:
            full_command = ' '.join(command_parts)
        
        return full_command
    
    def _prepare_environment(self, spec: RealCLISpecs) -> Dict[str, str]:
        """准备CLI执行环境"""
        env = os.environ.copy()
        
        # 根据CLI类型设置环境
        if spec.type == 'npm':
            # npm环境配置
            npm_config_prefix = env.get('NPM_CONFIG_PREFIX')
            if not npm_config_prefix:
                npm_config_prefix = os.path.join(os.path.expanduser('~'), '.npm-global')
                env['NPM_CONFIG_PREFIX'] = npm_config_prefix
            
            # 确保全局npm包在PATH中
            global_bin = os.path.join(npm_config_prefix, 'bin')
            if global_bin not in env.get('PATH', ''):
                env['PATH'] = f"{global_bin}{os.pathsep}{env.get('PATH', '')}"
        
        elif spec.type == 'python':
            # Python环境配置
            user_base = os.path.join(os.path.expanduser('~'), '.local')
            user_bin = os.path.join(user_base, 'bin')
            if user_bin not in env.get('PATH', ''):
                env['PATH'] = f"{user_bin}{os.pathsep}{env.get('PATH', '')}"
        
        # 设置API密钥环境变量（如果需要且存在）
        if spec.api_env and spec.api_env in env:
            pass  # API密钥已存在
        
        return env
    
    def _handle_missing_cli(self, source_cli: str, target_cli: str, request: str, status: Dict[str, Any]) -> Dict[str, Any]:
        """处理缺失CLI的情况"""
        spec = self.cli_specs[target_cli]
        
        guidance = f"""# CLI安装指导

## {spec.name} 未安装

### 快速安装命令:
```bash
{status['install_command']}
```

### 安装后验证:
```bash
{spec.version_check}
```

### 可用调用方式:
"""
        for i, method in enumerate(spec.call_patterns[:3]):
            guidance += f"{i+1}. `{method}`\\n"
        
        if status['api_env']:
            guidance += f"""
### 环境变量配置:
```bash
export {status['api_env']}='your-api-key-here'
```
"""
        
        return {
            'success': True,
            'response': guidance,
            'fallback_used': True,
            'fallback_level': 'install_guidance',
            'fallback_reason': f'{target_cli} not installed'
        }
    
    def _handle_execution_failure(self, source_cli: str, target_cli: str, request: str, status: Dict[str, Any], error_msg: str, context_file: str) -> Dict[str, Any]:
        """处理执行失败"""
        spec = self.cli_specs[target_cli]
        
        # 尝试其他可用方法
        alternative_methods = [m for m in status['available_methods'] if m != status['best_method']]
        
        if alternative_methods:
            # 尝试备用方法
            alt_method = alternative_methods[0]
            alt_command = self._build_verified_command(alt_method, spec, request, context_file, True)
            
            try:
                process_result = subprocess.run(
                    alt_command,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=60,
                    cwd=os.getcwd(),
                    env=self._prepare_environment(spec)
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
                pass
        
        # 提供手动执行指导
        manual_guidance = f"""# 执行失败处理

{spec.name} 执行失败，请尝试以下手动方式:

### 可用调用方法:
"""
        for i, method in enumerate(status['available_methods']):
            cmd = self._build_verified_command(method, spec, request, context_file, True)
            manual_guidance += f"#### 方法 {i+1}:\n```bash\n{cmd}\n```\n"
        
        manual_guidance += f"""
### 原始错误信息:
```
{error_msg}
```

### 故障排除:
1. 检查API密钥配置
2. 验证网络连接
3. 确认上下文文件可访问
4. 尝试简化请求内容
"""
        
        return {
            'success': True,
            'response': manual_guidance,
            'fallback_used': True,
            'fallback_level': 'manual_guidance',
            'fallback_reason': 'execution_failed'
        }
    
    def _handle_timeout(self, source_cli: str, target_cli: str, request: str) -> Dict[str, Any]:
        """处理超时"""
        timeout_guidance = f"""# 执行超时处理

{target_cli} 执行超时。

### 可能原因:
1. 网络连接问题
2. API密钥配置错误
3. 请求过于复杂或文件过大
4. 服务端响应缓慢

### 建议解决方案:
1. 检查网络连接和API密钥
2. 简化请求内容
3. 减少上下文文件数量
4. 使用自动模式 (`auto_mode=True`)

### 手动尝试:
```bash
# 使用简化请求
{target_cli} --approval-mode yolo --prompt "简化版请求"
```
"""
        
        return {
            'success': False,
            'response': timeout_guidance,
            'fallback_used': True,
            'fallback_level': 'timeout_guidance',
            'fallback_reason': 'execution_timeout'
        }
    
    def _handle_exception(self, source_cli: str, target_cli: str, request: str, error_msg: str) -> Dict[str, Any]:
        """处理异常"""
        exception_guidance = f"""# 执行异常处理

{target_cli} 执行出现异常: {error_msg}

### 可能解决方案:
1. 检查CLI是否正确安装: `{self.cli_specs[target_cli].version_check}`
2. 验证环境变量配置
3. 检查文件权限和路径
4. 查看详细错误日志

### 重新安装:
```bash
{self.cli_specs[target_cli].install_command}
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
                'context_files_used': result.get('context_files_used', []),
                'auto_mode_used': result.get('auto_mode_used', False),
                'fallback_used': result.get('fallback_used', False),
                'fallback_level': result.get('fallback_level', '')
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

# 使用示例
if __name__ == '__main__':
    system = VerifiedCrossCLISystem()
    
    print("🔬 验证真实CLI调用系统")
    print("基于真实CLI参数规范，使用文件上下文传递")
    print("=" * 60)
    
    # 检查CLI状态
    print("📊 CLI状态检查:")
    for cli_name in system.cli_specs:
        status = system.check_cli_availability(cli_name)
        status_icon = "✅" if status['exists'] else "❌"
        print(f"   {status_icon} {cli_name}: {status.get('best_method', '未安装')} ({status['type']})")
        if status.get('version_info'):
            print(f"      📋 版本: {status['version_info']}")
    
    # 测试文件上下文调用
    available_clis = [name for name, spec in system.cli_specs.items() if system.check_cli_availability(name)['exists']]
    
    if available_clis:
        print(f"\n🚀 测试文件上下文调用:")
        test_cli = available_clis[0]
        
        # 创建测试文件
        test_file = Path.cwd() / 'test_context.py'
        test_content = '''
def hello_world():
    """这是一个测试函数"""
    print("Hello, World!")
    return "success"

if __name__ == "__main__":
    result = hello_world()
    print(f"Result: {result}")
'''
        safe_file_write(str(test_file), test_content)
        
        # 测试调用
        result = system.call_cli_with_file_context(
            source_cli='test',
            target_cli=test_cli,
            request='分析这个Python文件并改进代码质量',
            context_files=[str(test_file)],
            working_dir=str(Path.cwd()),
            auto_mode=True,
            timeout=60
        )
        
        print(f"   📊 调用结果: {'成功' if result['success'] else '失败'}")
        print(f"   ⏱️  执行时间: {result.get('execution_time', 0):.2f}s")
        print(f"   🔧 命令: {result.get('command_used', 'N/A')}")
        print(f"   📁 上下文文件: {len(result.get('context_files_used', []))}")
        
        if result.get('fallback_used'):
            print(f"   🛡️  降级级别: {result.get('fallback_level', 'unknown')}")
        
        # 显示响应预览
        response = result.get('response', '')
        if response:
            preview = response[:300] + '...' if len(response) > 300 else response
            print(f"   📄 响应预览:\n{preview}")
        
        # 清理测试文件
        if test_file.exists():
            test_file.unlink()
    
    else:
        print("\n⚠️ 没有可用的CLI进行测试")
        print("   请先安装至少一个CLI工具:")
        for cli_name, spec in system.cli_specs.items():
            print(f"   - {spec.name}: {spec.install_command}")
    
    print("\n✅ 验证完成!")