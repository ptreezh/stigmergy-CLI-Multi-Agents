#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
跨平台安全CLI调用系统
解决权限、编码、跨平台兼容性问题
支持所有主流AI CLI工具的安全调用
"""

import os
import sys
import json
import subprocess
import platform
import shutil
import stat
import tempfile
import signal
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

# 导入跨平台编码库
sys.path.insert(0, str(Path(__file__).parent / 'src' / 'core'))
try:
    from cross_platform_encoding import get_cross_platform_installer, encoding_safe
except ImportError:
    # 如果无法导入，创建基础版本
    def get_cross_platform_installer():
        class BasicInstaller:
            def print_system_info(self):
                print("基础安装器模式")
        return BasicInstaller()
    
    def encoding_safe(func):
        return func

class PermissionLevel(Enum):
    """权限级别枚举"""
    MINIMAL = "minimal"      # 最小权限
    USER = "user"           # 用户权限
    ELEVATED = "elevated"   # 提升权限
    ADMIN = "admin"         # 管理员权限
    SYSTEM = "system"       # 系统权限

class CLIStatus(Enum):
    """CLI状态枚举"""
    AVAILABLE = "available"     # 可用
    INSTALLED = "installed"       # 已安装
    CONFIGURED = "configured"     # 已配置
    AUTHENTICATED = "authenticated" # 已认证
    ERROR = "error"              # 错误
    NOT_FOUND = "not_found"       # 未找到

@dataclass
class CLIConfig:
    """CLI配置数据类"""
    name: str
    display_name: str
    command: str
    description: str
    required_env_vars: List[str]
    optional_env_vars: List[str]
    config_files: List[str]
    auth_method: str
    supported_file_types: List[str]
    input_format: str
    output_format: str
    permission_level: PermissionLevel
    version_check_command: Optional[str] = None
    auth_command: Optional[str] = None
    help_command: Optional[str] = None

@dataclass
class CLICommand:
    """CLI命令数据类"""
    cli_name: str
    command_type: str  # 'prompt', 'file', 'config', 'auth', 'help'
    command: str
    description: str
    parameters: Dict[str, Any]
    input_files: List[str]
    output_files: List[str]
    working_dir: Optional[str] = None
    timeout: int = 300
    required_permission: PermissionLevel = PermissionLevel.USER

@dataclass
class ExecutionResult:
    """执行结果数据类"""
    success: bool
    exit_code: int
    stdout: str
    stderr: str
    execution_time: float
    command_executed: str
    cli_name: str
    files_created: List[str]
    files_modified: List[str]
    error_message: Optional[str] = None
    output_files: Dict[str, Path] = None

class PermissionManager:
    """权限管理器"""
    
    def __init__(self):
        self.system = platform.system().lower()
        self.current_user = self._get_current_user()
    
    def _get_current_user(self) -> str:
        """获取当前用户"""
        try:
            if self.system == 'windows':
                return os.environ.get('USERNAME', 'unknown')
            else:
                return os.environ.get('USER', 'unknown')
        except:
            return 'unknown'
    
    def check_permission_level(self, cli_config: CLIConfig) -> PermissionLevel:
        """检查CLI所需权限级别"""
        required_level = cli_config.permission_level
        
        # Windows权限检查
        if self.system == 'windows':
            return self._check_windows_permission(required_level)
        else:
            return self._check_unix_permission(required_level)
    
    def _check_windows_permission(self, required_level: PermissionLevel) -> PermissionLevel:
        """Windows权限检查"""
        try:
            import ctypes
            import win32api
            import win32con
            import win32security
            
            # 检查是否管理员
            is_admin = ctypes.windll.shell32.IsUserAnAdmin() != 0
            
            if is_admin:
                return PermissionLevel.ADMIN
            else:
                return PermissionLevel.USER
        except ImportError:
            # 如果没有win32库，使用基础检查
            try:
                # 尝试写入系统目录检查权限
                test_path = Path(os.environ.get('WINDIR', 'C:\\Windows'))
                test_file = test_path / 'stigmergy_permission_test.tmp'
                try:
                    test_file.write_text('test')
                    test_file.unlink()
                    return PermissionLevel.ADMIN
                except:
                    return PermissionLevel.USER
            except:
                return PermissionLevel.USER
    
    def _check_unix_permission(self, required_level: PermissionLevel) -> PermissionLevel:
        """Unix权限检查"""
        try:
            # 检查是否root
            if os.geteuid() == 0:
                return PermissionLevel.SYSTEM
            # 检查是否在sudo组
            elif self._check_sudo_access():
                return PermissionLevel.ADMIN
            else:
                return PermissionLevel.USER
        except:
            return PermissionLevel.USER
    
    def _check_sudo_access(self) -> bool:
        """检查sudo访问权限"""
        try:
            # 尝试执行一个需要sudo权限的命令
            result = subprocess.run(
                ['sudo', '-n', 'true'],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except:
            return False
    
    def elevate_privileges(self, required_level: PermissionLevel) -> Tuple[bool, str]:
        """提升权限"""
        if required_level == PermissionLevel.USER:
            return True, "用户权限足够"
        
        if self.system == 'windows':
            return self._elevate_windows(required_level)
        else:
            return self._elevate_unix(required_level)
    
    def _elevate_windows(self, required_level: PermissionLevel) -> Tuple[bool, str]:
        """Windows权限提升"""
        try:
            if required_level in [PermissionLevel.ADMIN, PermissionLevel.SYSTEM]:
                # 请求管理员权限
                ctypes.windll.shell32.ShellExecuteW(
                    None, "runas", sys.executable, " ".join(sys.argv), None, 1
                )
                return True, "已请求管理员权限"
        except Exception as e:
            return False, f"权限提升失败: {e}"
        
        return False, "无法提升权限"
    
    def _elevate_unix(self, required_level: PermissionLevel) -> Tuple[bool, str]:
        """Unix权限提升"""
        try:
            if required_level in [PermissionLevel.ADMIN, PermissionLevel.SYSTEM]:
                # 使用sudo重新执行
                sudo_command = ['sudo'] + sys.argv
                result = subprocess.run(sudo_command)
                return result.returncode == 0, "权限提升完成"
        except Exception as e:
            return False, f"权限提升失败: {e}"
        
        return False, "无法提升权限"

class CrossPlatformSafeCLI:
    """跨平台安全CLI调用器"""
    
    def __init__(self):
        self.system = platform.system().lower()
        self.temp_dir = Path(tempfile.gettempdir()) / 'stigmergy_cli_safe'
        self.temp_dir.mkdir(exist_ok=True)
        
        # 设置日志
        self.logger = self._setup_logging()
        
        # 初始化权限管理器
        self.permission_manager = PermissionManager()
        
        # 获取编码安全安装器
        self.encoding_installer = get_cross_platform_installer()
        
        # CLI配置映射
        self.cli_configs = self._load_cli_configs()
        
        # 权限缓存
        self._permission_cache = {}
    
    def _setup_logging(self) -> logging.Logger:
        """设置日志"""
        logger = logging.getLogger('CrossPlatformSafeCLI')
        logger.setLevel(logging.INFO)
        
        # 确保日志目录存在
        log_dir = self.temp_dir / 'logs'
        log_dir.mkdir(exist_ok=True)
        
        # 文件处理器
        log_file = log_dir / f'cli_execution_{datetime.now().strftime("%Y%m%d")}.log'
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(logging.INFO)
        
        # 控制台处理器
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.WARNING)
        
        # 格式化器
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        return logger
    
    def _load_cli_configs(self) -> Dict[str, CLIConfig]:
        """加载CLI配置"""
        configs = {}
        
        # Claude CLI配置
        configs['claude'] = CLIConfig(
            name='claude',
            display_name='Claude CLI',
            command='claude',
            description='Anthropic Claude CLI工具',
            required_env_vars=['ANTHROPIC_API_KEY'],
            optional_env_vars=['ANTHROPIC_BASE_URL', 'ANTHROPIC_API_URL'],
            config_files=['~/.claude/config.json', '~/.config/claude/config.json'],
            auth_method='api_key',
            supported_file_types=['.txt', '.md', '.py', '.js', '.ts', '.java', '.cpp', '.c', '.h'],
            input_format='text',
            output_format='text',
            permission_level=PermissionLevel.USER,
            version_check_command='claude --version',
            auth_command='claude auth',
            help_command='claude --help'
        )
        
        # Gemini CLI配置
        configs['gemini'] = CLIConfig(
            name='gemini',
            display_name='Gemini CLI',
            command='gemini',
            description='Google Gemini CLI工具',
            required_env_vars=['GEMINI_API_KEY'],
            optional_env_vars=['GOOGLE_CLOUD_PROJECT', 'GOOGLE_APPLICATION_CREDENTIALS'],
            config_files=['~/.gemini/config.json', '~/.config/gemini/config.json'],
            auth_method='api_key',
            supported_file_types=['.txt', '.md', '.py', '.js', '.ts', '.java', '.cpp', '.c', '.h', '.png', '.jpg', '.jpeg'],
            input_format='text_or_image',
            output_format='text',
            permission_level=PermissionLevel.USER,
            version_check_command='gemini --version',
            auth_command='gemini auth',
            help_command='gemini --help'
        )
        
        # QwenCode CLI配置
        configs['qwencode'] = CLIConfig(
            name='qwencode',
            display_name='QwenCode CLI',
            command='qwencode',
            description='阿里云QwenCode CLI工具',
            required_env_vars=['QWEN_API_KEY'],
            optional_env_vars=['QWEN_BASE_URL', 'QWEN_MODEL'],
            config_files=['~/.qwencode/config.json', '~/.config/qwencode/config.json'],
            auth_method='api_key',
            supported_file_types=['.txt', '.md', '.py', '.js', '.ts', '.java', '.cpp', '.c', '.h'],
            input_format='text',
            output_format='text',
            permission_level=PermissionLevel.USER,
            version_check_command='qwencode --version',
            auth_command='qwencode auth',
            help_command='qwencode --help'
        )
        
        # iFlow CLI配置
        configs['iflow'] = CLIConfig(
            name='iflow',
            display_name='iFlow CLI',
            command='iflow',
            description='iFlow工作流CLI工具',
            required_env_vars=['IFLOW_API_KEY'],
            optional_env_vars=['IFLOW_BASE_URL', 'IFLOW_WORKSPACE'],
            config_files=['~/.iflow/config.json', '~/.config/iflow/config.json'],
            auth_method='api_key',
            supported_file_types=['.yml', '.yaml', '.json', '.txt', '.md'],
            input_format='workflow',
            output_format='workflow',
            permission_level=PermissionLevel.USER,
            version_check_command='iflow --version',
            help_command='iflow --help'
        )
        
        # Qoder CLI配置
        configs['qoder'] = CLIConfig(
            name='qoder',
            display_name='Qoder CLI',
            command='qoder',
            description='Qoder代码生成CLI工具',
            required_env_vars=['QODER_API_KEY'],
            optional_env_vars=['QODER_BASE_URL', 'QODER_MODEL'],
            config_files=['~/.qoder/config.json', '~/.config/qoder/config.json'],
            auth_method='api_key',
            supported_file_types=['.txt', '.md', '.py', '.js', '.ts', '.java', '.cpp', '.c', '.h'],
            input_format='text',
            output_format='code',
            permission_level=PermissionLevel.USER,
            version_check_command='qoder --version',
            help_command='qoder --help'
        )
        
        # CodeBuddy CLI配置
        configs['codebuddy'] = CLIConfig(
            name='codebuddy',
            display_name='CodeBuddy CLI',
            command='codebuddy',
            description='CodeBuddy编程助手CLI工具',
            required_env_vars=['CODEBUDDY_API_KEY'],
            optional_env_vars=['CODEBUDDY_BASE_URL', 'CODEBUDDY_MODEL'],
            config_files=['~/.codebuddy/config.json', '~/.config/codebuddy/config.json'],
            auth_method='api_key',
            supported_file_types=['.txt', '.md', '.py', '.js', '.ts', '.java', '.cpp', '.c', '.h'],
            input_format='text',
            output_format='text',
            permission_level=PermissionLevel.USER,
            version_check_command='codebuddy --version',
            help_command='codebuddy --help'
        )
        
        # Copilot CLI配置
        configs['copilot'] = CLIConfig(
            name='copilot',
            display_name='GitHub Copilot CLI',
            command='copilot',
            description='GitHub Copilot CLI工具',
            required_env_vars=['GITHUB_TOKEN'],
            optional_env_vars=['COPILOT_API_KEY', 'COPILOT_MODEL'],
            config_files=['~/.config/copilot/config.json', '~/.config/github/copilot/config.json'],
            auth_method='oauth_or_token',
            supported_file_types=['.txt', '.md', '.py', '.js', '.ts', '.java', '.cpp', '.c', '.h'],
            input_format='text',
            output_format='text',
            permission_level=PermissionLevel.USER,
            version_check_command='copilot --version',
            auth_command='copilot auth',
            help_command='copilot --help'
        )
        
        # Codex CLI配置
        configs['codex'] = CLIConfig(
            name='codex',
            display_name='Codex CLI',
            command='codex',
            description='OpenAI Codex代码分析CLI工具',
            required_env_vars=['OPENAI_API_KEY'],
            optional_env_vars=['OPENAI_ORGANIZATION', 'OPENAI_BASE_URL'],
            config_files=['~/.codex/config.json', '~/.config/codex/config.json'],
            auth_method='api_key',
            supported_file_types=['.txt', '.md', '.py', '.js', '.ts', '.java', '.cpp', '.c', '.h'],
            input_format='text',
            output_format='text',
            permission_level=PermissionLevel.USER,
            version_check_command='codex --version',
            help_command='codex --help'
        )
        
        # Cline CLI配置
        configs['cline'] = CLIConfig(
            name='cline',
            display_name='Cline CLI',
            command='cline',
            description='Cline AI助手CLI工具 - 支持任务生命周期钩子和多智能体编排',
            required_env_vars=['ANTHROPIC_API_KEY'],  # Cline支持多种API提供商
            optional_env_vars=['OPENAI_API_KEY', 'GEMINI_API_KEY', 'OPENROUTER_API_KEY', 'CLINE_MODEL', 'CLINE_PROVIDER'],
            config_files=['~/.cline/config.json', '~/.config/cline/config.json'],
            auth_method='api_key_or_oauth',
            supported_file_types=['.txt', '.md', '.py', '.js', '.ts', '.java', '.cpp', '.c', '.h', '.json', '.yml', '.yaml'],
            input_format='text',
            output_format='text',
            permission_level=PermissionLevel.USER,
            version_check_command='cline --version',
            auth_command='cline auth',
            help_command='cline --help'
        )
        
        return configs
    
    def check_cli_status(self, cli_name: str) -> Tuple[CLIStatus, str]:
        """检查CLI状态"""
        if cli_name not in self.cli_configs:
            return CLIStatus.NOT_FOUND, f"CLI工具 '{cli_name}' 不支持"
        
        config = self.cli_configs[cli_name]
        
        # 检查是否安装
        try:
            result = subprocess.run(
                [config.command, '--version'],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode != 0:
                return CLIStatus.NOT_FOUND, f"CLI工具 '{config.display_name}' 未安装"
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return CLIStatus.NOT_FOUND, f"CLI工具 '{config.display_name}' 未安装"
        
        # 检查环境变量
        missing_vars = []
        for var in config.required_env_vars:
            if not os.environ.get(var):
                missing_vars.append(var)
        
        if missing_vars:
            return CLIStatus.ERROR, f"缺少环境变量: {', '.join(missing_vars)}"
        
        # 检查认证
        if config.auth_method == 'api_key':
            return CLIStatus.AUTHENTICATED, f"{config.display_name} 已认证"
        elif config.auth_command:
            # 尝试运行认证检查命令
            try:
                auth_result = subprocess.run(
                    config.auth_command.split(),
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                if auth_result.returncode == 0:
                    return CLIStatus.AUTHENTICATED, f"{config.display_name} 已认证"
                else:
                    return CLIStatus.CONFIGURED, f"{config.display_name} 需要重新认证"
            except:
                return CLIStatus.CONFIGURED, f"{config.display_name} 认证状态未知"
        
        return CLIStatus.CONFIGURED, f"{config.display_name} 已配置"
    
    @encoding_safe
    def execute_cli_command(self, command: CLICommand) -> ExecutionResult:
        """安全执行CLI命令"""
        start_time = datetime.now()
        
        # 检查权限
        required_permission = command.required_permission
        current_permission = self.permission_manager.check_permission_level(
            self.cli_configs[command.cli_name]
        )
        
        # 权限不足时尝试提升
        if self._compare_permission_levels(current_permission, required_permission) < 0:
            success, message = self.permission_manager.elevate_privileges(required_permission)
            if not success:
                return ExecutionResult(
                    success=False,
                    exit_code=-1,
                    stdout="",
                    stderr=f"权限不足: {message}",
                    execution_time=0,
                    command_executed=command.command,
                    cli_name=command.cli_name,
                    files_created=[],
                    files_modified=[],
                    error_message=f"权限提升失败: {message}"
                )
        
        # 准备执行环境
        env = self._prepare_execution_environment(command.cli_name)
        working_dir = Path(command.working_dir) if command.working_dir else Path.cwd()
        
        # 准备命令
        full_command = self._build_command(command)
        
        try:
            # 执行命令
            self.logger.info(f"执行命令: {full_command} 在目录: {working_dir}")
            
            # 记录执行前的文件状态
            before_files = set(working_dir.rglob('*')) if working_dir.exists() else set()
            
            result = subprocess.run(
                full_command,
                cwd=working_dir,
                env=env,
                capture_output=True,
                text=True,
                timeout=command.timeout
            )
            
            # 记录执行后的文件状态
            after_files = set(working_dir.rglob('*')) if working_dir.exists() else set()
            files_created = list(after_files - before_files)
            files_modified = [f for f in before_files.intersection(after_files) if f.is_file()]
            
            # 分析输出文件
            output_files = self._analyze_output_files(
                result.stdout, 
                command.output_files, 
                working_dir
            )
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            # 记录结果
            self.logger.info(f"命令执行完成: 退出码={result.returncode}, 耗时={execution_time}秒")
            
            return ExecutionResult(
                success=result.returncode == 0,
                exit_code=result.returncode,
                stdout=result.stdout,
                stderr=result.stderr,
                execution_time=execution_time,
                command_executed=full_command,
                cli_name=command.cli_name,
                files_created=[str(f) for f in files_created],
                files_modified=[str(f) for f in files_modified],
                output_files=output_files
            )
            
        except subprocess.TimeoutExpired:
            return ExecutionResult(
                success=False,
                exit_code=-1,
                stdout="",
                stderr=f"命令执行超时 ({command.timeout}秒)",
                execution_time=command.timeout,
                command_executed=full_command,
                cli_name=command.cli_name,
                files_created=[],
                files_modified=[],
                error_message="执行超时"
            )
        except Exception as e:
            return ExecutionResult(
                success=False,
                exit_code=-1,
                stdout="",
                stderr=str(e),
                execution_time=(datetime.now() - start_time).total_seconds(),
                command_executed=full_command,
                cli_name=command.cli_name,
                files_created=[],
                files_modified=[],
                error_message=str(e)
            )
    
    def _compare_permission_levels(self, current: PermissionLevel, required: PermissionLevel) -> int:
        """比较权限级别"""
        levels = {
            PermissionLevel.MINIMAL: 0,
            PermissionLevel.USER: 1,
            PermissionLevel.ELEVATED: 2,
            PermissionLevel.ADMIN: 3,
            PermissionLevel.SYSTEM: 4
        }
        return levels.get(current, 0) - levels.get(required, 0)
    
    def _prepare_execution_environment(self, cli_name: str) -> Dict[str, str]:
        """准备执行环境"""
        env = os.environ.copy()
        
        # 设置编码环境
        env['PYTHONIOENCODING'] = 'utf-8'
        if self.system == 'windows':
            env['PYTHONLEGACYWINDOWSSTDIO'] = 'utf-8'
        
        # 设置CLI特定环境变量
        config = self.cli_configs[cli_name]
        for var in config.required_env_vars + config.optional_env_vars:
            if var not in env:
                env[var] = os.environ.get(var, '')
        
        return env
    
    def _build_command(self, command: CLICommand) -> List[str]:
        """构建执行命令"""
        config = self.cli_configs[command.cli_name]
        cmd_parts = [config.command]
        
        # 添加命令特定参数
        if command.command_type == 'prompt':
            # 处理提示词命令
            if isinstance(command.command, str):
                cmd_parts.extend(command.command.split())
            else:
                cmd_parts.extend(command.command)
        elif command.command_type == 'file':
            # 处理文件命令
            for file_path in command.input_files:
                cmd_parts.extend(['--file', str(file_path)])
        elif command.command_type == 'config':
            # 处理配置命令
            cmd_parts.extend(['config'] + command.command.split())
        elif command.command_type == 'auth':
            # 处理认证命令
            cmd_parts.extend(['auth'] + command.command.split())
        elif command.command_type == 'help':
            # 处理帮助命令
            cmd_parts.append('--help')
        
        return cmd_parts
    
    def _analyze_output_files(self, stdout: str, expected_patterns: List[str], 
                             working_dir: Path) -> Dict[str, Path]:
        """分析输出文件"""
        output_files = {}
        
        # 从输出中查找文件路径
        import re
        
        # 匹配文件路径的正则表达式
        file_patterns = [
            r'输出文件[：:]\s*([^\s\n]+)',
            r'output[：:]\s*([^\s\n]+)',
            r'result[：:]\s*([^\s\n]+)',
            r'文件已保存到[：:]\s*([^\s\n]+)',
            r'file saved to[：:]\s*([^\s\n]+)'
        ]
        
        for pattern in file_patterns:
            matches = re.findall(pattern, stdout, re.IGNORECASE)
            for match in matches:
                file_path = Path(match)
                if not file_path.is_absolute():
                    file_path = working_dir / file_path
                
                if file_path.exists():
                    output_files[f'output_{len(output_files)}'] = file_path
        
        # 检查预期的输出文件
        for pattern in expected_patterns:
            matching_files = working_dir.glob(pattern)
            for file_path in matching_files:
                output_files[f'expected_{file_path.name}'] = file_path
        
        return output_files
    
    def get_cli_help(self, cli_name: str) -> Optional[str]:
        """获取CLI帮助信息"""
        if cli_name not in self.cli_configs:
            return None
        
        config = self.cli_configs[cli_name]
        
        try:
            result = subprocess.run(
                [config.command, '--help'],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.stdout if result.returncode == 0 else None
        except:
            return None
    
    def create_global_memory_document(self, cli_name: str) -> Optional[Dict[str, Any]]:
        """创建全局记忆文档"""
        if cli_name not in self.cli_configs:
            return None
        
        config = self.cli_configs[cli_name]
        status, message = self.check_cli_status(cli_name)
        help_text = self.get_cli_help(cli_name)
        
        memory_doc = {
            'cli_name': cli_name,
            'display_name': config.display_name,
            'description': config.description,
            'command': config.command,
            'status': status.value,
            'status_message': message,
            'auth_method': config.auth_method,
            'supported_file_types': config.supported_file_types,
            'input_format': config.input_format,
            'output_format': config.output_format,
            'required_env_vars': config.required_env_vars,
            'optional_env_vars': config.optional_env_vars,
            'config_files': config.config_files,
            'permission_level': config.permission_level.value,
            'version_check_command': config.version_check_command,
            'auth_command': config.auth_command,
            'help_command': config.help_command,
            'help_text': help_text,
            'usage_examples': self._generate_usage_examples(config),
            'integration_capabilities': self._get_integration_capabilities(config),
            'cross_cli_collaboration': self._get_cross_cli_collaboration_info(config),
            'last_updated': datetime.now().isoformat()
        }
        
        return memory_doc
    
    def _generate_usage_examples(self, config: CLIConfig) -> List[Dict[str, str]]:
        """生成使用示例"""
        examples = []
        
        # 基本提示词示例
        examples.append({
            'type': 'prompt',
            'description': f'{config.display_name} 基本提示词',
            'command': f'{config.command} "请解释这段代码的功能"',
            'example': f'{config.command} "请解释这段Python代码的功能"'
        })
        
        # 文件处理示例
        if config.supported_file_types:
            examples.append({
                'type': 'file',
                'description': f'{config.display_name} 处理文件',
                'command': f'{config.command} --file example.py',
                'example': f'{config.command} --file ./src/main.py'
            })
        
        # 跨CLI协作示例
        examples.append({
            'type': 'cross_cli',
            'description': f'{config.display_name} 跨CLI协作',
            'command': f'{config.command} "请用gemini帮我优化这段代码"',
            'example': f'{config.command} "请用claude帮我分析这个算法"'
        })
        
        return examples
    
    def _get_integration_capabilities(self, config: CLIConfig) -> Dict[str, Any]:
        """获取集成能力"""
        return {
            'can_process_files': len(config.supported_file_types) > 0,
            'supports_images': 'image' in config.input_format.lower(),
            'supports_workflows': config.input_format == 'workflow',
            'can_generate_code': config.output_format == 'code',
            'requires_authentication': config.auth_method in ['api_key', 'oauth'],
            'supports_batch_processing': 'batch' in config.command.lower(),
            'supports_streaming': 'stream' in config.command.lower()
        }
    
    def _get_cross_cli_collaboration_info(self, config: CLIConfig) -> Dict[str, Any]:
        """获取跨CLI协作信息"""
        all_clis = list(self.cli_configs.keys())
        other_clis = [cli for cli in all_clis if cli != config.name]
        
        return {
            'can_call_other_clis': True,
            'supported_target_clis': other_clis,
            'collaboration_patterns': [
                {
                    'pattern': f'请用{{target_cli}}帮我{{action}}',
                    'description': '标准跨CLI调用模式',
                    'example': f'请用claude帮我审查代码'
                },
                {
                    'pattern': f'use {{target_cli}} to {{action}}',
                    'description': '英文跨CLI调用模式',
                    'example': f'use gemini to analyze this code'
                },
                {
                    'pattern': f'调用{{target_cli}}{{action}}',
                    'description': '中文跨CLI调用模式',
                    'example': f'调用qwen生成测试用例'
                }
            ],
            'supported_collaborations': {
                'claude': ['code_review', 'analysis', 'documentation'],
                'gemini': ['translation', 'optimization', 'refactoring'],
                'qwencode': ['code_generation', 'debugging', 'testing'],
                'iflow': ['workflow_creation', 'automation', 'integration'],
                'qoder': ['code_completion', 'snippet_generation', 'template_creation'],
                'codebuddy': ['learning', 'tutorial', 'explanation'],
                'copilot': ['pair_programming', 'suggestion', 'completion'],
                'codex': ['code_analysis', 'pattern_detection', 'optimization']
            }.get(config.name, [])
        }

# 全局实例
_cli_executor = None

def get_cli_executor() -> CrossPlatformSafeCLI:
    """获取CLI执行器实例"""
    global _cli_executor
    if _cli_executor is None:
        _cli_executor = CrossPlatformSafeCLI()
    return _cli_executor

@encoding_safe
def create_all_global_memory_documents() -> Dict[str, Dict[str, Any]]:
    """创建所有CLI的全局记忆文档"""
    executor = get_cli_executor()
    memory_docs = {}
    
    for cli_name in executor.cli_configs.keys():
        doc = executor.create_global_memory_document(cli_name)
        if doc:
            memory_docs[cli_name] = doc
    
    return memory_docs

def main():
    """主函数"""
    executor = get_cli_executor()
    
    print("🔧 跨平台安全CLI调用系统")
    print("=" * 50)
    executor.encoding_installer.print_system_info()
    
    # 检查所有CLI状态
    print("\n📋 CLI工具状态检查:")
    for cli_name in executor.cli_configs.keys():
        status, message = executor.check_cli_status(cli_name)
        status_icon = "✅" if status in [CLIStatus.AVAILABLE, CLIStatus.INSTALLED, CLIStatus.CONFIGURED, CLIStatus.AUTHENTICATED] else "❌"
        print(f"   {status_icon} {executor.cli_configs[cli_name].display_name:<20} {status.value}: {message}")
    
    # 创建全局记忆文档
    print("\n📚 创建全局记忆文档...")
    memory_docs = create_all_global_memory_documents()
    
    # 保存到文件
    memory_dir = Path('.') / 'global_memory'
    memory_dir.mkdir(exist_ok=True)
    
    for cli_name, doc in memory_docs.items():
        memory_file = memory_dir / f'{cli_name}_memory.json'
        try:
            with open(memory_file, 'w', encoding='utf-8') as f:
                json.dump(doc, f, indent=2, ensure_ascii=False)
            print(f"   ✅ {doc['display_name']} 记忆文档已创建")
        except Exception as e:
            print(f"   ❌ {doc['display_name']} 记忆文档创建失败: {e}")
    
    print(f"\n📁 全局记忆文档已保存到: {memory_dir}")
    print("\n🎯 CLI调用系统就绪！")

if __name__ == "__main__":
    main()