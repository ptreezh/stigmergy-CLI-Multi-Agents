#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
优雅降级的跨CLI执行器
确保在任何情况下都能提供有用的结果
"""

import os
import sys
import subprocess
import json
import platform
import tempfile
import asyncio
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass
from enum import Enum

# 导入跨平台编码库
sys.path.insert(0, str(Path(__file__).parent / 'src' / 'core'))
try:
    from cross_platform_encoding import get_cross_platform_installer, encoding_safe
    from cross_platform_safe_cli import get_cli_executor, CLICommand
except ImportError:
    def get_cross_platform_installer():
        class BasicInstaller:
            def print_system_info(self):
                print("基础安装器模式")
        return BasicInstaller()
    
    def encoding_safe(func):
        return func

class ExecutionLevel(Enum):
    """执行级别枚举"""
    FULL_EXECUTION = "full_execution"      # 完全执行，获取真实结果
    COMMAND_GENERATION = "command_generation"  # 生成命令，用户确认执行
    MANUAL_GUIDANCE = "manual_guidance"      # 手动指导，步骤说明
    ERROR_FALLBACK = "error_fallback"         # 错误回退，替代建议

class CLIArchitecture(Enum):
    """CLI架构类型"""
    NPM_NPX = "npm_npx"           # Node.js通过npx执行
    NPM_GLOBAL = "npm_global"     # Node.js全局安装
    PYTHON_DIRECT = "python_direct" # Python直接执行
    PYTHON_MODULE = "python_module" # Python模块执行
    BINARY_CARGO = "binary_cargo"  # Rust/Cargo二进制
    BINARY_DIRECT = "binary_direct" # 直接二进制文件
    UNKNOWN = "unknown"              # 未知架构

@dataclass
class CLIConfig:
    """CLI配置信息"""
    name: str
    display_name: str
    architecture: CLIArchitecture
    primary_command: str
    alternative_commands: List[str]
    installation_method: str
    dependencies: List[str]
    detection_commands: List[str]
    execution_template: str
    fallback_commands: List[str]

@dataclass
class ExecutionResult:
    """执行结果"""
    success: bool
    execution_level: ExecutionLevel
    actual_command: str
    stdout: str
    stderr: str
    exit_code: int
    fallback_reason: Optional[str] = None
    manual_steps: List[str] = None
    alternative_suggestions: List[str] = None
    execution_time: float = 0.0

class GracefulCLIExecutor:
    """优雅降级的CLI执行器"""
    
    def __init__(self):
        self.system = platform.system().lower()
        self.encoding_installer = get_cross_platform_installer()
        self.cli_configs = self._load_cli_configs()
        self.temp_dir = Path(tempfile.gettempdir()) / 'stigmergy_graceful'
        self.temp_dir.mkdir(exist_ok=True)
        
        # 设置日志
        self.logger = self._setup_logging()
        
        # 执行历史和缓存
        self.execution_cache = {}
        self.success_patterns = {}
        
    def _setup_logging(self) -> logging.Logger:
        """设置日志"""
        logger = logging.getLogger('GracefulCLIExecutor')
        logger.setLevel(logging.INFO)
        
        log_file = self.temp_dir / 'execution.log'
        handler = logging.FileHandler(log_file, encoding='utf-8')
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    def _load_cli_configs(self) -> Dict[str, CLIConfig]:
        """加载CLI配置信息"""
        configs = {}
        
        # Claude CLI - Node.js + npx
        configs['claude'] = CLIConfig(
            name='claude',
            display_name='Claude CLI',
            architecture=CLIArchitecture.NPM_NPX,
            primary_command='npx @anthropic-ai/claude-code',
            alternative_commands=[
                'claude',  # 如果全局安装
                'node ./node_modules/@anthropic-ai/claude-code/dist/cli.js'
            ],
            installation_method='npm install -g @anthropic-ai/claude-code',
            dependencies=['node>=18.0.0'],
            detection_commands=[
                'npx @anthropic-ai/claude-code --version',
                'claude --version',
                'npm list -g @anthropic-ai/claude-code'
            ],
            execution_template='{command} "{task}"',
            fallback_commands=[
                'npx @anthropic-ai/claude-code -p "{task}"',
                'claude "{task}"'
            ]
        )
        
        # Gemini CLI - Node.js + npx
        configs['gemini'] = CLIConfig(
            name='gemini',
            display_name='Gemini CLI',
            architecture=CLIArchitecture.NPM_NPX,
            primary_command='npx @google/gemini-cli',
            alternative_commands=[
                'gemini',  # 如果全局安装
                'node ./node_modules/@google/gemini-cli/dist/index.js'
            ],
            installation_method='npm install -g @google/gemini-cli',
            dependencies=['node>=18.0.0'],
            detection_commands=[
                'npx @google/gemini-cli --version',
                'gemini --version',
                'npm list -g @google/gemini-cli'
            ],
            execution_template='{command} "{task}"',
            fallback_commands=[
                'npx @google/gemini-cli --prompt "{task}"',
                'gemini "{task}"'
            ]
        )
        
        # QwenCode CLI - Python + pip
        configs['qwencode'] = CLIConfig(
            name='qwencode',
            display_name='QwenCode CLI',
            architecture=CLIArchitecture.PYTHON_DIRECT,
            primary_command='qwencode-cli',
            alternative_commands=[
                'python -m qwencode.cli',
                'python3 -m qwencode.cli',
                'qwencode'
            ],
            installation_method='pip install qwencode-cli',
            dependencies=['python>=3.8'],
            detection_commands=[
                'qwencode-cli --version',
                'python -m qwencode.cli --version',
                'pip show qwencode-cli'
            ],
            execution_template='{command} "{task}"',
            fallback_commands=[
                'python -m qwencode.cli "{task}"',
                'echo "{task}" | qwencode-cli'
            ]
        )
        
        # GitHub Copilot CLI - Node.js + npx
        configs['copilot'] = CLIConfig(
            name='copilot',
            display_name='GitHub Copilot CLI',
            architecture=CLIArchitecture.NPM_NPX,
            primary_command='npx @github/copilot',
            alternative_commands=[
                'copilot',
                'node ./node_modules/@github/copilot/dist/cli.js'
            ],
            installation_method='npm install -g @github/copilot',
            dependencies=['node>=18.0.0'],
            detection_commands=[
                'npx @github/copilot --version',
                'copilot --version',
                'npm list -g @github/copilot'
            ],
            execution_template='{command} "{task}"',
            fallback_commands=[
                'npx @github/copilot suggest "{task}"',
                'copilot "{task}"'
            ]
        )
        
        # iFlow CLI - Rust + Cargo
        configs['iflow'] = CLIConfig(
            name='iflow',
            display_name='iFlow CLI',
            architecture=CLIArchitecture.BINARY_CARGO,
            primary_command='iflow',
            alternative_commands=[
                'iflow-cli',
                './iflow'  # 如果在本地路径
            ],
            installation_method='cargo install iflow-cli',
            dependencies=['rust>=1.60'],
            detection_commands=[
                'iflow --version',
                'cargo list --installed | grep iflow'
            ],
            execution_template='{command} "{task}"',
            fallback_commands=[
                'iflow execute "{task}"',
                'iflow run "{task}"'
            ]
        )
        
        # Qoder CLI - Python + pip
        configs['qoder'] = CLIConfig(
            name='qoder',
            display_name='Qoder CLI',
            architecture=CLIArchitecture.PYTHON_DIRECT,
            primary_command='qoder-cli',
            alternative_commands=[
                'python -m qoder.cli',
                'python3 -m qoder.cli'
            ],
            installation_method='pip install qoder-cli',
            dependencies=['python>=3.8'],
            detection_commands=[
                'qoder-cli --version',
                'python -m qoder.cli --version',
                'pip show qoder-cli'
            ],
            execution_template='{command} "{task}"',
            fallback_commands=[
                'python -m qoder.cli "{task}"',
                'echo "{task}" | qoder-cli'
            ]
        )
        
        # CodeBuddy CLI - Python + pip
        configs['codebuddy'] = CLIConfig(
            name='codebuddy',
            display_name='CodeBuddy CLI',
            architecture=CLIArchitecture.PYTHON_DIRECT,
            primary_command='codebuddy',
            alternative_commands=[
                'python -m codebuddy.cli',
                'python3 -m codebuddy.cli'
            ],
            installation_method='pip install codebuddy-cli',
            dependencies=['python>=3.8'],
            detection_commands=[
                'codebuddy --version',
                'python -m codebuddy.cli --version',
                'pip show codebuddy-cli'
            ],
            execution_template='{command} "{task}"',
            fallback_commands=[
                'python -m codebuddy.cli "{task}"',
                'codebuddy chat "{task}"'
            ]
        )
        
        # Codex CLI - Python + pip
        configs['codex'] = CLIConfig(
            name='codex',
            display_name='Codex CLI',
            architecture=CLIArchitecture.PYTHON_DIRECT,
            primary_command='codex',
            alternative_commands=[
                'python -m codex.cli',
                'python3 -m codex.cli'
            ],
            installation_method='pip install codex-cli',
            dependencies=['python>=3.8'],
            detection_commands=[
                'codex --version',
                'python -m codex.cli --version',
                'pip show codex-cli'
            ],
            execution_template='{command} "{task}"',
            fallback_commands=[
                'python -m codex.cli "{task}"',
                'codex generate "{task}"'
            ]
        )
        
        return configs
    
    @encoding_safe
    def execute_cli_with_fallback(self, source_cli: str, target_cli: str, 
                                    task: str, context: str = "") -> ExecutionResult:
        """
        优雅降级的CLI执行
        
        Args:
            source_cli: 源CLI名称
            target_cli: 目标CLI名称  
            task: 要执行的任务
            context: 上下文信息
            
        Returns:
            ExecutionResult: 执行结果
        """
        self.logger.info(f"开始优雅降级执行: {source_cli} -> {target_cli}")
        
        # 获取目标CLI配置
        if target_cli not in self.cli_configs:
            return self._create_error_result(
                target_cli, task, f"不支持的CLI: {target_cli}"
            )
        
        config = self.cli_configs[target_cli]
        
        # 级别1: 尝试完全执行
        result = self._try_full_execution(config, task, context)
        if result.success:
            self.logger.info(f"级别1执行成功: {target_cli}")
            return result
        
        # 级别2: 命令生成 + 用户确认
        result = self._try_command_generation(config, task, context)
        if result.success:
            self.logger.info(f"级别2执行成功: {target_cli}")
            return result
        
        # 级别3: 手动指导
        result = self._try_manual_guidance(config, task, context)
        if result.success:
            self.logger.info(f"级别3执行成功: {target_cli}")
            return result
        
        # 级别4: 错误回退
        result = self._try_error_fallback(config, task, context)
        self.logger.info(f"级别4执行: {target_cli} - 错误回退")
        
        return result
    
    def _try_full_execution(self, config: CLIConfig, task: str, 
                            context: str) -> ExecutionResult:
        """级别1: 完全执行，获取真实结果"""
        try:
            # 检测CLI是否可用
            cli_available = self._check_cli_availability(config)
            if not cli_available:
                return self._create_error_result(
                    config.name, task, f"CLI {config.display_name} 不可用: {cli_available.reason}"
                )
            
            # 尝试主命令
            command = config.execution_template.format(command=config.primary_command, task=task)
            result = self._execute_command(command, config.name)
            
            if result.success:
                return ExecutionResult(
                    success=True,
                    execution_level=ExecutionLevel.FULL_EXECUTION,
                    actual_command=command,
                    stdout=result.stdout,
                    stderr=result.stderr,
                    exit_code=result.exit_code,
                    execution_time=result.execution_time
                )
            
            # 尝试备用命令
            for alt_command in config.alternative_commands:
                alt_command_full = config.execution_template.format(command=alt_command, task=task)
                alt_result = self._execute_command(alt_command_full, config.name)
                
                if alt_result.success:
                    return ExecutionResult(
                        success=True,
                        execution_level=ExecutionLevel.FULL_EXECUTION,
                        actual_command=alt_command_full,
                        stdout=alt_result.stdout,
                        stderr=alt_result.stderr,
                        exit_code=alt_result.exit_code,
                        execution_time=alt_result.execution_time,
                        fallback_reason=f"主命令失败，使用备用命令: {alt_command}"
                    )
            
            return self._create_error_result(
                config.name, task, "所有执行命令都失败"
            )
            
        except Exception as e:
            return self._create_error_result(
                config.name, task, f"执行异常: {e}"
            )
    
    def _try_command_generation(self, config: CLIConfig, task: str, 
                               context: str) -> ExecutionResult:
        """级别2: 命令生成 + 用户确认"""
        try:
            # 生成最佳执行命令
            recommended_command = self._generate_optimal_command(config, task)
            
            # 生成手动执行步骤
            manual_steps = self._generate_manual_steps(config, task, recommended_command)
            
            # 生成替代方案
            alternatives = self._generate_alternatives(config, task)
            
            # 构建响应消息
            response = f"""
我为您生成了 {config.display_name} 的执行命令：

## 📋 推荐命令
```bash
{recommended_command}
```

## 🔧 手动执行步骤
{chr(10).join(f"{i+1}. {step}" for i, step in enumerate(manual_steps, 1))}

## 🔄 替代方案
{chr(10).join(f"- {alt}" for alt in alternatives)}

## 📝 执行说明
请复制上述命令在终端中执行，或按照手动步骤操作。

如果您希望我自动执行，请确认命令是否正确。
"""
            
            return ExecutionResult(
                success=True,
                execution_level=ExecutionLevel.COMMAND_GENERATION,
                actual_command=recommended_command,
                stdout=response,
                stderr="",
                exit_code=0,
                manual_steps=manual_steps,
                alternative_suggestions=alternatives,
                fallback_reason="CLI执行失败，提供命令生成方案"
            )
            
        except Exception as e:
            return self._create_error_result(
                config.name, task, f"命令生成失败: {e}"
            )
    
    def _try_manual_guidance(self, config: CLIConfig, task: str, 
                              context: str) -> ExecutionResult:
        """级别3: 手动指导，步骤说明"""
        try:
            # 检查安装状态
            install_status = self._check_install_status(config)
            
            # 生成详细指导
            guidance = f"""
## 📋 {config.display_name} 使用指导

### 🔍 当前状态
{install_status.status}

### 📦 安装方法
**方法1: 使用包管理器安装**
```bash
{config.installation_method}
```

**方法2: 检查是否已安装**
```bash
{' | '.join(config.detection_commands)}
```

### 🚀 手动执行步骤
1. 确保 {config.display_name} 已正确安装
2. 打开终端或命令行工具
3. 执行以下命令完成任务：
   ```bash
   {config.primary_command} "{task}"
   ```

### 🔧 故障排除
如果上述命令失败，请尝试：
{chr(10).join(f"- {alt}" for alt in config.alternative_commands[:2])}

### 📚 更多帮助
- 查看官方文档: {self._get_cli_help_url(config.name)}
- 检查依赖项: {', '.join(config.dependencies)}

### 💡 使用提示
- 确保 {config.primary_command} 在系统PATH中
- 检查网络连接（如需要API调用）
- 验证API密钥配置
"""
            
            return ExecutionResult(
                success=True,
                execution_level=ExecutionLevel.MANUAL_GUIDANCE,
                actual_command=config.primary_command,
                stdout=guidance,
                stderr="",
                exit_code=0,
                fallback_reason="CLI不可执行，提供手动指导"
            )
            
        except Exception as e:
            return self._create_error_result(
                config.name, task, f"手动指导生成失败: {e}"
            )
    
    def _try_error_fallback(self, config: CLIConfig, task: str, 
                          context: str) -> ExecutionResult:
        """级别4: 错误回退，替代建议"""
        try:
            # 分析任务类型
            task_type = self._analyze_task_type(task)
            
            # 生成替代建议
            alternatives = self._generate_task_alternatives(config, task, task_type)
            
            # 生成通用建议
            general_advice = f"""
## ⚠️ {config.display_name} 不可用

### 🔍 问题分析
- {config.display_name} 可能未安装或配置不正确
- 系统环境可能不满足要求
- 依赖项可能缺失

### 🔄 替代方案

#### 基于您的任务类型（{task_type}），您可以尝试：

{chr(10).join(f"**{alt['tool']}**: {alt['description']}\n   ```bash\n   {alt['command']}\n   ```\n" for alt in alternatives)}

### 🛠️ 通用解决建议

1. **安装 {config.display_name}**
   ```bash
   {config.installation_method}
   ```

2. **检查系统要求**
   - 操作系统: {self._get_system_info()}
   - 依赖要求: {', '.join(config.dependencies)}

3. **验证安装**
   ```bash
   {config.primary_command} --version
   ```

4. **获取帮助**
   ```bash
   {config.primary_command} --help
   ```

### 📞 获取支持
- 查看官方文档
- 联系技术支持
- 搜索相关教程和社区帮助

### 💡 建议
您也可以：
- 使用其他可用的AI CLI工具
- 尝试Web版本的对应服务
- 手动执行相关任务
"""
            
            return ExecutionResult(
                success=False,
                execution_level=ExecutionLevel.ERROR_FALLBACK,
                actual_command="",
                stdout=general_advice,
                stderr=f"CLI {config.display_name} 不可用",
                exit_code=1,
                fallback_reason="CLI不可用，提供替代方案",
                alternative_suggestions=[alt['command'] for alt in alternatives]
            )
            
        except Exception as e:
            return self._create_error_result(
                config.name, task, f"错误回退失败: {e}"
            )
    
    def _check_cli_availability(self, config: CLIConfig) -> Union[bool, str]:
        """检查CLI是否可用"""
        try:
            for detect_cmd in config.detection_commands[:2]:  # 只检查前两个
                result = subprocess.run(
                    detect_cmd.split(),
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if result.returncode == 0:
                    return True
            
            return False
            
        except subprocess.TimeoutExpired:
            return f"检测超时"
        except FileNotFoundError:
            return f"命令未找到"
        except Exception as e:
            return f"检测失败: {e}"
    
    def _execute_command(self, command: str, cli_name: str) -> subprocess.CompletedProcess:
        """安全执行命令"""
        try:
            # 设置环境
            env = os.environ.copy()
            env['PYTHONIOENCODING'] = 'utf-8'
            if self.system == 'windows':
                env['PYTHONLEGACYWINDOWSSTDIO'] = 'utf-8'
            
            # 执行命令
            start_time = time.time()
            result = subprocess.run(
                command.split(),
                capture_output=True,
                text=True,
                timeout=60,
                env=env
            )
            
            # 添加执行时间
            execution_time = time.time() - start_time
            result.execution_time = execution_time
            
            return result
            
        except subprocess.TimeoutExpired:
            return subprocess.CompletedProcess([], 124, "", "命令执行超时")
        except Exception as e:
            return subprocess.CompletedProcess([], 1, "", f"执行异常: {e}")
    
    def _generate_optimal_command(self, config: CLIConfig, task: str) -> str:
        """生成最优执行命令"""
        # 基于架构类型生成命令
        if config.architecture == CLIArchitecture.NPM_NPX:
            return f"{config.primary_command} \"{task}\""
        elif config.architecture == CLIArchitecture.PYTHON_DIRECT:
            return f"{config.primary_command} \"{task}\""
        elif config.architecture == CLIArchitecture.PYTHON_MODULE:
            return f"python -m {config.primary_command.replace('python -m ', '')} \"{task}\""
        elif config.architecture == CLIArchitecture.BINARY_CARGO:
            return f"{config.primary_command} \"{task}\""
        else:
            return f"{config.primary_command} \"{task}\""
    
    def _generate_manual_steps(self, config: CLIConfig, task: str, 
                                recommended_command: str) -> List[str]:
        """生成手动执行步骤"""
        steps = [
            f"打开终端或命令行工具",
            f"检查 {config.display_name} 是否已安装：{config.primary_command} --version",
            f"如果未安装，运行：{config.installation_method}",
            f"执行任务命令：{recommended_command}",
            f"查看输出结果",
            f"如遇问题，运行：{config.primary_command} --help"
        ]
        
        return steps
    
    def _generate_alternatives(self, config: CLIConfig, task: str) -> List[str]:
        """生成替代方案"""
        alternatives = []
        
        for i, alt_cmd in enumerate(config.alternative_commands[:3], 1):
            alternatives.append(f"使用替代命令{i}: {alt_cmd} \"{task}\"")
        
        # 添加Web版本建议
        web_versions = self._get_web_versions(config.name)
        for web_ver in web_versions:
            alternatives.append(f"使用Web版本: {web_ver}")
        
        return alternatives
    
    def _check_install_status(self, config: CLIConfig):
        """检查安装状态"""
        class InstallStatus:
            def __init__(self, status: str):
                self.status = status
        
        try:
            # 尝试版本检查
            for detect_cmd in config.detection_commands[:1]:
                result = subprocess.run(
                    detect_cmd.split(),
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if result.returncode == 0:
                    return InstallStatus(f"✅ {config.display_name} 已安装")
            
            return InstallStatus(f"❌ {config.display_name} 未安装或不可用")
            
        except Exception as e:
            return InstallStatus(f"⚠️ 无法检测 {config.display_name} 状态: {e}")
    
    def _analyze_task_type(self, task: str) -> str:
        """分析任务类型"""
        task_lower = task.lower()
        
        if any(word in task_lower for word in ['翻译', 'translate', '翻译成']):
            return '翻译'
        elif any(word in task_lower for word in ['生成', 'generate', '创建', 'create', '编写', '写']):
            return '生成'
        elif any(word in task_lower for word in ['优化', 'optimize', '改进', 'improve', '优化']):
            return '优化'
        elif any(word in task_lower for word in ['审查', 'review', '检查', 'check', '审阅']):
            return '审查'
        elif any(word in task_lower for word in ['调试', 'debug', 'debugging', '排错']):
            return '调试'
        elif any(word in task_lower for word in ['文档', 'doc', 'document', '说明', '注释']):
            return '文档'
        else:
            return '通用'
    
    def _generate_task_alternatives(self, config: CLIConfig, task: str, 
                                   task_type: str) -> List[Dict[str, str]]:
        """生成任务替代方案"""
        alternatives = []
        
        # 根据任务类型推荐其他CLI
        if task_type == '翻译':
            alternatives.extend([
                {
                    'tool': 'Gemini CLI',
                    'description': '多语言翻译和本地化',
                    'command': 'npx @google/gemini-cli "翻译内容"'
                },
                {
                    'tool': 'Claude CLI',
                    'description': '高质量翻译和本地化',
                    'command': 'npx @anthropic-ai/claude-code "翻译内容"'
                }
            ])
        elif task_type == '生成':
            alternatives.extend([
                {
                    'tool': 'Qoder CLI',
                    'description': '代码片段和模板生成',
                    'command': 'qoder-cli "生成代码"'
                },
                {
                    'tool': 'CodeBuddy CLI',
                    'description': '学习和指导性代码生成',
                    'command': 'codebuddy "生成代码"'
                }
            ])
        elif task_type == '优化':
            alternatives.extend([
                {
                    'tool': 'Codex CLI',
                    'description': '性能优化和模式识别',
                    'command': 'codex "优化代码"'
                },
                {
                    'tool': 'Gemini CLI',
                    'description': '快速优化和改进建议',
                    'command': 'npx @google/gemini-cli "优化代码"'
                }
            ])
        elif task_type == '审查':
            alternatives.extend([
                {
                    'tool': 'Claude CLI',
                    'description': '深度代码审查和分析',
                    'command': 'npx @anthropic-ai/claude-code "审查代码"'
                },
                {
                    'tool': 'Copilot CLI',
                    'description': '实时代码审查和建议',
                    'command': 'npx @github/copilot "审查代码"'
                }
            ])
        
        # 添加通用建议
        alternatives.extend([
            {
                'tool': 'Web版本',
                'description': f'{config.display_name} Web界面',
                'command': f'访问 {config.name.lower()} 官方网站'
            },
            {
                'tool': '手动操作',
                'description': '手动完成任务',
                'command': '参考在线文档和教程'
            }
        ])
        
        return alternatives
    
    def _get_web_versions(self, cli_name: str) -> List[str]:
        """获取Web版本"""
        web_urls = {
            'claude': 'https://claude.ai',
            'gemini': 'https://ai.google.dev',
            'qwencode': 'https://qwen.ai',
            'copilot': 'https://github.com/features/copilot',
            'iflow': 'https://iflow.ai',
            'qoder': 'https://qoder.ai',
            'codebuddy': 'https://codebuddy.ai',
            'codex': 'https://openai.com'
        }
        
        return [web_urls.get(cli_name, f'访问 {cli_name} 官方网站')]
    
    def _get_cli_help_url(self, cli_name: str) -> str:
        """获取CLI帮助URL"""
        help_urls = {
            'claude': 'https://docs.anthropic.com/claude/docs/with-cli',
            'gemini': 'https://ai.google.dev/cli',
            'qwencode': 'https://help.aliyun.com/zh/model-developer/qwenwen/quickstart',
            'copilot': 'https://docs.github.com/copilot/overview-of-github-copilot',
            'iflow': 'https://docs.iflow.ai',
            'qoder': 'https://qoder.ai/docs',
            'codebuddy': 'https://codebuddy.ai/docs',
            'codex': 'https://platform.openai.com/docs/models/codex'
        }
        
        return help_urls.get(cli_name, f'{cli_name} 官方文档')
    
    def _get_system_info(self) -> str:
        """获取系统信息"""
        return f"{platform.system()} {platform.release()}, Python {sys.version.split()[0]}"
    
    def _create_error_result(self, cli_name: str, task: str, 
                           error_message: str) -> ExecutionResult:
        """创建错误结果"""
        return ExecutionResult(
            success=False,
            execution_level=ExecutionLevel.ERROR_FALLBACK,
            actual_command="",
            stdout="",
            stderr=error_message,
            exit_code=1,
            fallback_reason=error_message
        )

# 全局实例
_graceful_executor = None

def get_graceful_executor() -> GracefulCLIExecutor:
    """获取优雅执行器实例"""
    global _graceful_executor
    if _graceful_executor is None:
        _graceful_executor = GracefulCLIExecutor()
    return _graceful_executor

def main():
    """主函数测试"""
    executor = get_graceful_executor()
    
    print("🔧 优雅降级CLI执行器测试")
    print("=" * 40)
    
    # 测试不同CLI的执行
    test_cases = [
        ('claude', 'gemini', '请翻译这段代码成Python'),
        ('gemini', 'claude', '请审查这个函数的安全性'),
        ('qwencode', 'iflow', '请生成一个CI/CD工作流'),
        ('copilot', 'qoder', '请生成一个React组件'),
        ('iflow', 'qwencode', '请创建自动化脚本'),
        ('qoder', 'codebuddy', '请解释这个算法的工作原理'),
        ('codebuddy', 'codex', '请优化这段代码的性能'),
        ('codex', 'iflow', '请设计一个微服务架构')
    ]
    
    for source_cli, target_cli, task in test_cases:
        print(f"\n🎯 测试: {source_cli} -> {target_cli}")
        print(f"📝 任务: {task}")
        print("-" * 30)
        
        result = executor.execute_cli_with_fallback(source_cli, target_cli, task)
        
        print(f"✅ 成功: {result.success}")
        print(f"📊 执行级别: {result.execution_level.value}")
        print(f"🔧 实际命令: {result.actual_command}")
        
        if result.execution_level == ExecutionLevel.FULL_EXECUTION:
            print(f"📤 输出长度: {len(result.stdout)} 字符")
            print(f"📥 前100字符: {result.stdout[:100]}...")
        elif result.execution_level == ExecutionLevel.COMMAND_GENERATION:
            print(f"📋 生成的命令已提供给用户")
        elif result.execution_level == ExecutionLevel.MANUAL_GUIDANCE:
            print(f"📖 手动指导已提供")
        elif result.execution_level == ExecutionLevel.ERROR_FALLBACK:
            print(f"⚠️ 错误回退: {result.fallback_reason}")
        
        print(f"⏱️ 执行时间: {result.execution_time:.2f}秒")
        print()

if __name__ == "__main__":
    import time
    main()