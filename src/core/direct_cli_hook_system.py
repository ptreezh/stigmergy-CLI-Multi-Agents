"""
真实CLI Hook系统 - 基于已安装CLI的直接Hook和调用
严格基于真实研究，严禁推测
"""

import os
import sys
import json
import subprocess
import time
import signal
from pathlib import Path
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from datetime import datetime
import threading
from concurrent.futures import ThreadPoolExecutor

# 导入跨CLI调用系统
sys.path.append(str(Path(__file__).parent))
from real_cross_cli_system import RealCrossCLISystem

@dataclass
class CLIHookEvent:
    """CLI Hook事件"""
    timestamp: str
    source_cli: str
    event_type: str  # 'input', 'output', 'command', 'cross_cli_intent'
    content: str
    working_directory: str
    user_intent: Optional[str] = None
    target_clis: List[str] = None
    confidence: float = 0.0
    detected_pattern: Optional[str] = None

class DirectCLIHookManager:
    """直接CLI Hook管理器 - 基于已安装CLI的真实Hook"""
    
    def __init__(self, hook_dir: str = None):
        self.hook_dir = Path(hook_dir or Path.home() / '.direct_cli_hooks')
        self.hook_dir.mkdir(parents=True, exist_ok=True)
        
        # 跨CLI调用系统
        self.cross_system = RealCrossCLISystem()
        
        # Hook配置文件
        self.hook_config_file = self.hook_dir / 'hook_config.json'
        self.event_log_file = self.hook_dir / 'hook_events.json'
        self.intercept_patterns_file = self.hook_dir / 'intercept_patterns.json'
        self.hook_scripts_dir = self.hook_dir / 'hook_scripts'
        self.hook_scripts_dir.mkdir(exist_ok=True)
        
        # 运行时状态
        self.active_hooks = {}
        self.event_processors = {}
        self.pattern_matchers = {}
        
        self._initialize_hooks()
    
    def _initialize_hooks(self):
        """初始化Hook系统"""
        # 初始化配置
        if not self.hook_config_file.exists():
            config = {
                'enabled_hooks': ['shell_interception', 'intent_detection', 'auto_cross_call'],
                'detection_confidence_threshold': 0.7,
                'auto_cross_call_enabled': True,
                'supported_clis': list(self.cross_system.cli_methods.keys()),
                'hook_timeout': 30,
                'max_concurrent_hooks': 5,
                'shell_integration': True,
                'version': '1.0.0'
            }
            self._safe_write_json(self.hook_config_file, config)
        
        # 初始化拦截模式
        if not self.intercept_patterns_file.exists():
            patterns = {
                'cross_cli_patterns': [
                    r'(?:call|invoke|use|run|execute|ask|tell|request)\s+(?:the\s+)?([a-z]+)\s+(?:cli|tool|assistant|ai)',
                    r'(?:with|using|via|through)\s+([a-z]+)',
                    r'(?:let|have|can|should)\s+([a-z]+)\s+(?:help|assist|process|handle|deal)',
                    r'(?:switch|change|switch to)\s+([a-z]+)',
                    r'(?:in|using)\s+([a-z]+)\s+(?:mode|context)',
                ],
                'intent_keywords': {
                    'code_generation': [
                        'generate', 'create', 'write', 'build', 'develop', 'implement', 'make', 'produce'
                    ],
                    'code_analysis': [
                        'analyze', 'review', 'check', 'examine', 'inspect', 'audit', 'look at', 'scan'
                    ],
                    'debugging': [
                        'fix', 'debug', 'repair', 'solve', 'resolve', 'troubleshoot', 'correct'
                    ],
                    'documentation': [
                        'document', 'explain', 'describe', 'comment', 'manual', 'guide'
                    ],
                    'optimization': [
                        'optimize', 'improve', 'refactor', 'enhance', 'better', 'faster'
                    ],
                    'testing': [
                        'test', 'validate', 'verify', 'check', 'run tests'
                    ]
                },
                'cli_aliases': {
                    'claude': ['claude', 'anthropic', 'ai-assistant'],
                    'gemini': ['gemini', 'google', 'bard'],
                    'copilot': ['copilot', 'github', 'gh'],
                    'iflow': ['iflow', 'flow', 'mindflow'],
                    'qwencode': ['qwencode', 'qwen', 'alibaba'],
                    'qoder': ['qoder', 'code-assistant'],
                    'codebuddy': ['codebuddy', 'tencent', 'buddy'],
                    'codex': ['codex', 'openai', 'gpt']
                },
                'version': '1.0.0'
            }
            self._safe_write_json(self.intercept_patterns_file, patterns)
        
        # 加载配置
        self._load_configurations()
    
    def _load_configurations(self):
        """加载配置文件"""
        try:
            with open(self.hook_config_file, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
        except:
            self.config = {'enabled_hooks': [], 'supported_clis': []}
        
        try:
            with open(self.intercept_patterns_file, 'r', encoding='utf-8') as f:
                patterns = json.load(f)
                self.cross_cli_patterns = patterns.get('cross_cli_patterns', [])
                self.intent_keywords = patterns.get('intent_keywords', {})
                self.cli_aliases = patterns.get('cli_aliases', {})
        except:
            self.cross_cli_patterns = []
            self.intent_keywords = {}
            self.cli_aliases = {}
    
    def install_shell_hooks(self) -> Dict[str, Any]:
        """安装Shell级别Hook - 不修改CLI本身，Hook Shell输入"""
        result = {
            'success': False,
            'message': '',
            'installed_hooks': [],
            'shell_type': '',
            'integration_method': ''
        }
        
        try:
            # 检测Shell类型
            shell_type = self._detect_shell_type()
            
            if shell_type == 'bash':
                hooks = self._install_bash_hooks()
            elif shell_type == 'zsh':
                hooks = self._install_zsh_hooks()
            elif shell_type == 'powershell':
                hooks = self._install_powershell_hooks()
            elif shell_type == 'cmd':
                hooks = self._install_cmd_hooks()
            else:
                hooks = self._install_generic_hooks()
            
            result.update({
                'success': True,
                'message': f"Successfully installed Shell hooks for {shell_type}",
                'installed_hooks': hooks,
                'shell_type': shell_type,
                'integration_method': 'shell_function_interception'
            })
            
            # 注册事件处理器
            self._register_event_processors()
            
        except Exception as e:
            result['message'] = f"Hook installation failed: {str(e)}"
        
        return result
    
    def _detect_shell_type(self) -> str:
        """检测当前Shell类型"""
        shell = os.environ.get('SHELL', '').lower()
        
        if 'bash' in shell:
            return 'bash'
        elif 'zsh' in shell:
            return 'zsh'
        elif 'powershell' in shell or 'pwsh' in shell:
            return 'powershell'
        elif 'cmd' in shell or os.name == 'nt':
            return 'cmd'
        else:
            return 'generic'
    
    def _install_bash_hooks(self) -> List[str]:
        """安装Bash Hook"""
        hooks = []
        
        # 创建Bash Hook函数
        bash_hook_content = f'''#!/bin/bash
# Direct CLI Hook System for Bash

# Hook配置目录
HOOK_DIR="{self.hook_dir}"
EVENT_LOG="$HOOK_DIR/hook_events.json"

# 记录Hook事件
log_hook_event() {{
    local event_type="$1"
    local content="$2"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    local working_dir=$(pwd)
    
    # 创建事件JSON
    local event='{{'
    event+='"timestamp":"'"$timestamp"'",'
    event+='"source_cli":"shell",'
    event+='"event_type":"'"$event_type"'",'
    event+='"content":"'"$content"'",'
    event+='"working_directory":"'"$working_dir"'"'
    event+='}}'
    
    # 添加到事件日志
    echo "$event" >> "$EVENT_LOG.tmp"
    
    # 检测跨CLI意图
    if [[ "$event_type" == "input" ]]; then
        detect_cross_cli_intent "$content" &
    fi
}}

# 检测跨CLI意图
detect_cross_cli_intent() {{
    local input="$1"
    local intent_file="$HOOK_DIR/intent_detection.tmp"
    
    # 调用Python脚本进行意图检测
    echo "$input" | python3 "{Path(__file__).parent}/intent_detector.py" "$intent_file" &
    
    # 等待检测结果
    wait
    
    if [[ -f "$intent_file" ]]; then
        local detection=$(cat "$intent_file")
        if [[ "$detection" != "none" ]]; then
            echo "🔗 检测到跨CLI协作意图: $detection"
            
            # 触发跨CLI调用（如果启用）
            if {str(self.config.get('auto_cross_call_enabled', False)).lower()}; then
                execute_cross_cli_call "$input" "$detection" &
            fi
        fi
        rm -f "$intent_file"
    fi
}}

# 执行跨CLI调用
execute_cross_cli_call() {{
    local input="$1"
    local detection="$2"
    local python_script="{Path(__file__).parent}/cross_cli_executor.py"
    
    # 调用Python执行器
    python3 "$python_script" --shell-input "$input" --target-cli "$detection" &
}}

# Hook命令执行
hook_command_execution() {{
    local command="$*"
    
    # 记录输入事件
    log_hook_event "input" "$command"
    
    # 执行原始命令
    eval "$command"
    local exit_code=$?
    
    # 记录输出事件
    log_hook_event "output" "Command completed with exit code: $exit_code"
    
    return $exit_code
}}

# Shell集成：重写命令执行函数
if [[ "{self.config.get('shell_integration', True)}" == "True" ]]; then
    # 创建alias来hook常见命令
    alias {self.config.get('hooked_commands', ['echo', 'cat', 'ls'])[0]}='hook_command_execution {self.config.get('hooked_commands', ['echo', 'cat', 'ls'])[0]}'
    
    # 重写PROMPT_COMMAND来捕获命令
    if [[ -z "$PROMPT_COMMAND" ]]; then
        PROMPT_COMMAND="log_hook_event prompt \$PWD"
    else
        PROMPT_COMMAND="$PROMPT_COMMAND; log_hook_event prompt \$PWD"
    fi
fi
'''
        
        bash_hook_file = self.hook_scripts_dir / 'bash_hooks.sh'
        self._safe_write_file(bash_hook_file, bash_hook_content)
        hooks.append(f"bash_hook_script: {bash_hook_file}")
        
        # 创建加载脚本
        loader_content = f'''#!/bin/bash
# Load Direct CLI Hooks

if [[ -f "{bash_hook_file}" ]]; then
    source "{bash_hook_file}"
    echo "✅ Direct CLI Hooks loaded in Bash"
else
    echo "❌ Hook file not found: {bash_hook_file}"
fi
'''
        
        loader_file = self.hook_scripts_dir / 'load_bash_hooks.sh'
        self._safe_write_file(loader_file, loader_content)
        hooks.append(f"bash_loader: {loader_file}")
        
        return hooks
    
    def _install_powershell_hooks(self) -> List[str]:
        """安装PowerShell Hook"""
        hooks = []
        
        ps_hook_content = f'''# Direct CLI Hook System for PowerShell

# Hook配置
$Global:HookDir = "{self.hook_dir}"
$Global:EventLog = Join-Path $HookDir "hook_events.json"

# 记录Hook事件
function Log-HookEvent {{
    param(
        [string]$EventType,
        [string]$Content
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
    $workingDir = Get-Location
    
    $event = @{{
        timestamp = $timestamp
        source_cli = "powershell"
        event_type = $EventType
        content = $Content
        working_directory = $workingDir
    }}
    
    $eventJson = $event | ConvertTo-Json -Compress
    Add-Content -Path "$($Global:EventLog).tmp" -Value $eventJson
    
    # 检测跨CLI意图
    if ($EventType -eq "input") {{
        Detect-CrossCLIIntent -Input $Content
    }}
}}

# 检测跨CLI意图
function Detect-CrossCLIIntent {{
    param([string]$Input)
    
    $intentFile = Join-Path $Global:HookDir "intent_detection.tmp"
    $pythonScript = "{Path(__file__).parent}/intent_detector.py"
    
    try {{
        $Input | python3 $pythonScript $intentFile
        if (Test-Path $intentFile) {{
            $detection = Get-Content $intentFile
            if ($detection -ne "none") {{
                Write-Host "🔗 检测到跨CLI协作意图: $detection" -ForegroundColor Green
                
                if ({str(self.config.get('auto_cross_call_enabled', False)).lower()}) {{
                    Execute-CrossCLICall -Input $Input -TargetCLI $detection
                }}
            }}
            Remove-Item $intentFile -ErrorAction SilentlyContinue
        }}
    }} catch {{
        # 意图检测失败，继续执行
    }}
}}

# 执行跨CLI调用
function Execute-CrossCLICall {{
    param(
        [string]$Input,
        [string]$TargetCLI
    )
    
    $pythonScript = "{Path(__file__).parent}/cross_cli_executor.py"
    
    Start-Job -ScriptBlock {{
        param($Script, $Input, $Target)
        & python3 $Script --shell-input $Input --target-cli $Target
    }} -ArgumentList $pythonScript, $Input, $TargetCLI | Out-Null
}}

# Hook命令执行
function Invoke-OriginalCommand {{
    param([string]$Command)
    
    # 记录输入事件
    Log-HookEvent -EventType "input" -Content $Command
    
    # 执行原始命令
    try {{
        $result = Invoke-Expression $Command
        $exitCode = $LASTEXITCODE
        
        # 记录输出事件
        Log-HookEvent -EventType "output" -Content "Command completed with exit code: $exitCode"
        
        return $result
    }} catch {{
        Log-HookEvent -EventType "error" -Content "Command failed: $($_.Exception.Message)"
        throw
    }}
}}

# PowerShell集成
if ({str(self.config.get('shell_integration', True)).lower()}) {{
    # 重写一些常用的PowerShell命令
    Set-Alias -Name hooked-echo -Value Invoke-OriginalCommand
    
    # 添加到PowerShell Profile
    $profilePath = $PROFILE.CurrentUserAllHosts
    if (-not (Test-Path $profilePath)) {{
        New-Item -ItemType File -Path $profilePath -Force
    }}
    
    # 避免重复加载
    $hookLine = "# Direct CLI Hooks loaded"
    $profileContent = Get-Content $profilePath -ErrorAction SilentlyContinue
    if ($hookLine -notin $profileContent) {{
        Add-Content -Path $profilePath -Value @"
# Direct CLI Hooks - Auto-generated
$hookLine
if (Test-Path "{self.hook_scripts_dir}/powershell_hooks.ps1") {{
    . "{self.hook_scripts_dir}/powershell_hooks.ps1"
    Write-Host "✅ Direct CLI Hooks loaded in PowerShell" -ForegroundColor Green
}}
"@
    }}
}}
'''
        
        ps_hook_file = self.hook_scripts_dir / 'powershell_hooks.ps1'
        self._safe_write_file(ps_hook_file, ps_hook_content)
        hooks.append(f"powershell_hook_script: {ps_hook_file}")
        
        return hooks
    
    def _install_zsh_hooks(self) -> List[str]:
        """安装Zsh Hook"""
        hooks = []
        
        zsh_hook_content = f'''#!/bin/zsh
# Direct CLI Hook System for Zsh

# Hook配置目录
HOOK_DIR="{self.hook_dir}"
EVENT_LOG="$HOOK_DIR/hook_events.json"

# 记录Hook事件
log_hook_event() {{
    local event_type="$1"
    local content="$2"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    local working_dir=$(pwd)
    
    # 创建事件JSON
    local event='{{'
    event+='"timestamp":"'"$timestamp"'",'
    event+='"source_cli":"zsh",'
    event+='"event_type":"'"$event_type"'",'
    event+='"content":"'"$content"'",'
    event+='"working_directory":"'"$working_dir"'"'
    event+='}}'
    
    # 添加到事件日志
    echo "$event" >> "$EVENT_LOG.tmp"
    
    # 检测跨CLI意图
    if [[ "$event_type" == "input" ]]; then
        detect_cross_cli_intent "$content" &
    fi
}}

# Zsh特定Hook：使用preexec和precmd
autoload -Uz add-zsh-hook

# 命令执行前Hook
hook_preexec() {{
    local command="$1"
    log_hook_event "input" "$command"
}}

# 命令执行后Hook  
hook_precmd() {{
    local exit_code=$?
    log_hook_event "output" "Command completed with exit code: $exit_code"
}}

# 注册Hook
add-zsh-hook preexec hook_preexec
add-zsh-hook precmd hook_precmd

echo "✅ Direct CLI Hooks loaded in Zsh"
'''
        
        zsh_hook_file = self.hook_scripts_dir / 'zsh_hooks.zsh'
        self._safe_write_file(zsh_hook_file, zsh_hook_content)
        hooks.append(f"zsh_hook_script: {zsh_hook_file}")
        
        return hooks
    
    def _install_cmd_hooks(self) -> List[str]:
        """安装Windows CMD Hook"""
        hooks = []
        
        # CMD Hook需要使用批处理文件和doskey
        cmd_hook_content = f'''@echo off
REM Direct CLI Hook System for Windows CMD

set HOOK_DIR={self.hook_dir}
set EVENT_LOG=%HOOK_DIR%\\hook_events.json

REM 记录Hook事件
:log_hook_event
set event_type=%1
set content=%2

REM 获取时间戳
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set timestamp=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%T%dt:~8,2%:%dt:~10,2%:%dt:~12,2%.%dt:~15,3%Z

REM 获取当前目录
set working_dir=%CD%

REM 创建事件JSON（简化版）
echo { "timestamp": "%timestamp%", "source_cli": "cmd", "event_type": "%event_type%", "content": "%content%", "working_directory": "%working_dir%" } >> "%EVENT_LOG%.tmp"

goto :eof

REM 主Hook函数
:hook_command
set command=%*
call :log_hook_event "input" "%command%"

REM 执行原始命令
%command%
set exit_code=%errorlevel%

call :log_hook_event "output" "Command completed with exit code: %exit_code%"

goto :eof
'''
        
        cmd_hook_file = self.hook_scripts_dir / 'cmd_hooks.bat'
        self._safe_write_file(cmd_hook_file, cmd_hook_content)
        hooks.append(f"cmd_hook_script: {cmd_hook_file}")
        
        # 创建doskey加载脚本
        doskey_content = f'''@echo off
REM Load Direct CLI Hooks for CMD

doskey hook=call "{cmd_hook_file}" $*
echo ✅ Direct CLI Hooks loaded in CMD
'''
        
        doskey_file = self.hook_scripts_dir / 'load_cmd_hooks.bat'
        self._safe_write_file(doskey_file, doskey_content)
        hooks.append(f"cmd_doskey_loader: {doskey_file}")
        
        return hooks
    
    def _install_generic_hooks(self) -> List[str]:
        """安装通用Hook"""
        hooks = []
        
        # 创建通用Python脚本作为Hook入口
        generic_hook_content = f'''#!/usr/bin/env python3
"""
Direct CLI Hook System - Generic Hook
"""

import os
import sys
import json
import subprocess
from datetime import datetime

# Hook配置
HOOK_DIR = "{self.hook_dir}"
EVENT_LOG = os.path.join(HOOK_DIR, "hook_events.json")

def log_hook_event(event_type, content):
    """记录Hook事件"""
    timestamp = datetime.now().isoformat() + "Z"
    working_dir = os.getcwd()
    
    event = {{
        "timestamp": timestamp,
        "source_cli": "generic",
        "event_type": event_type,
        "content": content,
        "working_directory": working_dir
    }}
    
    # 添加到事件日志
    with open(f"{{EVENT_LOG}}.tmp", "a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\\n")

def main():
    if len(sys.argv) < 3:
        print("Usage: python generic_hook.py <event_type> <content>")
        return 1
    
    event_type = sys.argv[1]
    content = " ".join(sys.argv[2:])
    
    log_hook_event(event_type, content)
    return 0

if __name__ == "__main__":
    sys.exit(main())
'''
        
        generic_hook_file = self.hook_scripts_dir / 'generic_hook.py'
        self._safe_write_file(generic_hook_file, generic_hook_content)
        hooks.append(f"generic_hook_script: {generic_hook_file}")
        
        # 创建Shell别名生成脚本
        alias_generator_content = f'''#!/bin/bash
# Generate Shell Aliases for Direct CLI Hooks

GENERIC_HOOK="{generic_hook_file}"

echo "# Direct CLI Hooks - Generated Aliases"
echo "# Add these to your shell configuration (.bashrc, .zshrc, etc.)"
echo ""

# 为常见命令生成别名
commands=("ls" "cat" "echo" "grep" "find" "mkdir" "rm" "cp" "mv")

for cmd in "${{commands[@]}}"; do
    echo "alias $cmd='python3 $GENERIC_HOOK input \"\\$*\" && $cmd'"
done

echo ""
echo "# Load aliases with: source generated_aliases.sh"
'''
        
        alias_file = self.hook_scripts_dir / 'generate_aliases.sh'
        self._safe_write_file(alias_file, alias_generator_content)
        hooks.append(f"alias_generator: {alias_file}")
        
        return hooks
    
    def _register_event_processors(self):
        """注册事件处理器"""
        self.event_processors = {
            'input': self._process_input_event,
            'output': self._process_output_event,
            'error': self._process_error_event,
            'cross_cli_intent': self._process_cross_cli_intent_event
        }
        
        # 注册模式匹配器
        self.pattern_matchers = {
            'cross_cli_detection': self._detect_cross_cli_patterns,
            'intent_classification': self._classify_user_intent
        }
    
    def _process_input_event(self, event: CLIHookEvent):
        """处理输入事件"""
        # 检测跨CLI意图
        intent = self._detect_cross_cli_patterns(event.content)
        if intent:
            event.user_intent = 'cross_cli_call'
            event.target_clis = intent['target_clis']
            event.confidence = intent['confidence']
            event.detected_pattern = intent['pattern']
            
            # 如果启用自动调用
            if self.config.get('auto_cross_call_enabled', False):
                self._execute_auto_cross_call(event)
    
    def _process_output_event(self, event: CLIHookEvent):
        """处理输出事件"""
        # 分析输出，学习成功模式
        pass
    
    def _process_error_event(self, event: CLIHookEvent):
        """处理错误事件"""
        # 记录错误，优化检测
        pass
    
    def _process_cross_cli_intent_event(self, event: CLIHookEvent):
        """处理跨CLI意图事件"""
        # 执行跨CLI调用
        for target_cli in event.target_clis:
            result = self.cross_system.call_cli(
                source_cli=event.source_cli,
                target_cli=target_cli,
                request=event.content,
                working_dir=event.working_directory
            )
            
            # 显示结果
            if result['success']:
                print(f"\\n🔗 跨CLI协作结果 ({event.source_cli} -> {target_cli}):")
                print(result['response'][:500] + '...' if len(result['response']) > 500 else result['response'])
                print("-" * 50)
    
    def _detect_cross_cli_patterns(self, content: str) -> Optional[Dict[str, Any]]:
        """检测跨CLI协作模式"""
        content_lower = content.lower()
        
        # 检测跨CLI模式
        for pattern in self.cross_cli_patterns:
            import re
            match = re.search(pattern, content_lower)
            if match:
                target_cli = match.group(1)
                
                # 解析CLI别名
                for canonical_name, aliases in self.cli_aliases.items():
                    if target_cli in aliases:
                        target_cli = canonical_name
                        break
                
                if target_cli in self.cross_system.cli_methods:
                    return {
                        'target_clis': [target_cli],
                        'confidence': 0.8,
                        'pattern': pattern,
                        'detected_text': match.group(0)
                    }
        
        return None
    
    def _classify_user_intent(self, content: str) -> Optional[str]:
        """分类用户意图"""
        content_lower = content.lower()
        
        for intent_type, keywords in self.intent_keywords.items():
            for keyword in keywords:
                if keyword in content_lower:
                    return intent_type
        
        return None
    
    def _execute_auto_cross_call(self, event: CLIHookEvent):
        """执行自动跨CLI调用"""
        if not event.target_clis or event.confidence < self.config.get('detection_confidence_threshold', 0.7):
            return
        
        for target_cli in event.target_clis:
            # 检查目标CLI是否可用
            status = self.cross_system.check_cli_status(target_cli)
            if not status['exists']:
                continue
            
            # 异步执行跨CLI调用
            def async_call():
                result = self.cross_system.call_cli(
                    source_cli=event.source_cli,
                    target_cli=target_cli,
                    request=event.content,
                    working_dir=event.working_directory
                )
                
                if result['success']:
                    self._display_cross_cli_result(event, target_cli, result)
            
            # 在后台线程中执行
            threading.Thread(target=async_call, daemon=True).start()
    
    def _display_cross_cli_result(self, event: CLIHookEvent, target_cli: str, result: Dict[str, Any]):
        """显示跨CLI调用结果"""
        print(f"\\n🔗 跨CLI协作结果 ({event.source_cli} -> {target_cli}):")
        print(f"⏱️  执行时间: {result.get('execution_time', 0):.2f}s")
        
        response = result.get('response', '')
        if len(response) > 800:
            print(response[:800] + "\\n... (响应已截断)")
        else:
            print(response)
        
        print("-" * 50)
    
    def process_pending_events(self):
        """处理待处理的事件"""
        temp_event_file = self.event_log_file.with_suffix('.json.tmp')
        
        if not temp_event_file.exists():
            return
        
        try:
            # 读取临时事件文件
            with open(temp_event_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            if not lines:
                return
            
            # 处理每个事件
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                try:
                    event_data = json.loads(line)
                    event = CLIHookEvent(**event_data)
                    
                    # 根据事件类型处理
                    if event.event_type in self.event_processors:
                        self.event_processors[event.event_type](event)
                    
                    # 记录到主事件日志
                    self._record_event(event)
                    
                except json.JSONDecodeError:
                    continue
                except Exception as e:
                    print(f"Warning: Failed to process event: {e}")
                    continue
            
            # 清空临时文件
            temp_event_file.unlink()
            
        except Exception as e:
            print(f"Warning: Failed to process pending events: {e}")
    
    def _record_event(self, event: CLIHookEvent):
        """记录Hook事件到主日志"""
        try:
            if self.event_log_file.exists():
                with open(self.event_log_file, 'r', encoding='utf-8') as f:
                    events = json.load(f)
            else:
                events = []
            
            events.append(asdict(event))
            
            # 保留最近1000个事件
            if len(events) > 1000:
                events = events[-1000:]
            
            self._safe_write_json(self.event_log_file, events)
            
        except Exception as e:
            print(f"Warning: Failed to record event: {e}")
    
    def _safe_write_file(self, file_path: Path, content: str):
        """安全写入文件"""
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # 设置执行权限（对于脚本文件）
            if file_path.suffix in ['.sh', '.py', '.bat', '.ps1', '.zsh']:
                os.chmod(file_path, 0o755)
                
        except Exception as e:
            raise Exception(f"Failed to write file {file_path}: {e}")
    
    def _safe_write_json(self, file_path: Path, data: Any):
        """安全写入JSON文件"""
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            raise Exception(f"Failed to write JSON file {file_path}: {e}")
    
    def get_hook_status(self) -> Dict[str, Any]:
        """获取Hook状态"""
        status = {
            'config': self.config,
            'hook_directory': str(self.hook_dir),
            'hook_scripts': [],
            'event_count': 0,
            'recent_events': [],
            'active_processors': list(self.event_processors.keys()),
            'pattern_matchers': list(self.pattern_matchers.keys())
        }
        
        # 列出Hook脚本
        if self.hook_scripts_dir.exists():
            status['hook_scripts'] = [f.name for f in self.hook_scripts_dir.iterdir() if f.is_file()]
        
        # 统计事件数量
        try:
            if self.event_log_file.exists():
                with open(self.event_log_file, 'r', encoding='utf-8') as f:
                    events = json.load(f)
                status['event_count'] = len(events)
                status['recent_events'] = events[-5:]  # 最近5个事件
        except:
            pass
        
        return status

# 使用示例
if __name__ == '__main__':
    hook_manager = DirectCLIHookManager()
    
    print("🔗 真实CLI Hook系统")
    print("=" * 50)
    
    # 安装Shell Hook
    print("🔧 安装Shell Hook...")
    install_result = hook_manager.install_shell_hooks()
    
    if install_result['success']:
        print(f"✅ Hook安装成功: {install_result['shell_type']}")
        print(f"📁 Hook目录: {hook_manager.hook_dir}")
        print(f"📄 安装的Hook: {len(install_result['installed_hooks'])}")
        
        for hook in install_result['installed_hooks']:
            print(f"   - {hook}")
        
        # 处理待处理事件
        print("\\n🔄 处理待处理事件...")
        hook_manager.process_pending_events()
        
        # 获取Hook状态
        print("\\n📊 Hook状态:")
        status = hook_manager.get_hook_status()
        print(f"   Hook脚本数量: {len(status['hook_scripts'])}")
        print(f"   事件处理器: {', '.join(status['active_processors'])}")
        print(f"   模式匹配器: {', '.join(status['pattern_matchers'])}")
        print(f"   事件数量: {status['event_count']}")
        
        # 显示使用说明
        print("\\n📖 使用说明:")
        if install_result['shell_type'] == 'bash':
            print("   在Bash中运行: source ~/.direct_cli_hooks/hook_scripts/load_bash_hooks.sh")
        elif install_result['shell_type'] == 'powershell':
            print("   在PowerShell中重新启动或运行: . ~/.direct_cli_hooks/hook_scripts/powershell_hooks.ps1")
        elif install_result['shell_type'] == 'zsh':
            print("   在Zsh中运行: source ~/.direct_cli_hooks/hook_scripts/zsh_hooks.zsh")
        else:
            print("   手动加载Hook脚本中的函数到你的Shell配置文件")
        
        print("\\n🔍 Hook现在可以检测跨CLI协作意图:")
        print("   示例: 'call claude to analyze this file'")
        print("   示例: 'using gemini to generate code'")
        print("   示例: 'ask copilot to help with debugging'")
        
    else:
        print(f"❌ Hook安装失败: {install_result['message']}")
    
    print("\\n✅ Hook系统初始化完成!")