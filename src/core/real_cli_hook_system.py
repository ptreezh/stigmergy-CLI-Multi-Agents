"""
真实CLI Hook系统 - 基于实际架构的跨CLI协作
严格基于真实研究，严禁推测
"""

import os
import sys
import json
import subprocess
import re
import time
from pathlib import Path
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from datetime import datetime
import threading
from concurrent.futures import ThreadPoolExecutor

# 导入编码安全和跨CLI执行器
sys.path.append(str(Path(__file__).parent))
from cross_platform_encoding import CrossPlatformEncoding
from cross_cli_executor import CrossCLIExecutor, RealCLIArchitectures

@dataclass
class CLIHookEvent:
    """CLI Hook事件"""
    timestamp: str
    source_cli: str
    event_type: str  # 'input', 'output', 'command', 'file_operation'
    content: str
    working_directory: str
    user_intent: Optional[str] = None
    target_clis: List[str] = None
    confidence: float = 0.0

class RealCLIHookManager:
    """基于真实架构的CLI Hook管理器"""
    
    def __init__(self, hook_dir: str = None):
        self.hook_dir = Path(hook_dir or Path.home() / '.stigmergy_cli_hooks')
        self.hook_dir.mkdir(parents=True, exist_ok=True)
        
        self.cross_executor = CrossCLIExecutor()
        self.architectures = RealCLIArchitectures()
        
        # Hook配置文件
        self.hook_config_file = self.hook_dir / 'hook_config.json'
        self.event_log_file = self.hook_dir / 'hook_events.json'
        self.intercept_patterns_file = self.hook_dir / 'intercept_patterns.json'
        
        # 运行时状态
        self.active_hooks = {}
        self.intercept_patterns = {}
        self.event_handlers = {}
        
        self._initialize_hooks()
    
    def _initialize_hooks(self):
        """初始化Hook系统"""
        # 初始化配置
        if not self.hook_config_file.exists():
            config = {
                'enabled_hooks': ['input_interception', 'collaboration_detection', 'automatic_cross_call'],
                'detection_confidence_threshold': 0.7,
                'auto_cross_call_enabled': True,
                'supported_clis': list(self.architectures.ARCHITECTURES.keys()),
                'hook_timeout': 30,
                'max_concurrent_hooks': 5,
                'version': '1.0.0'
            }
            safe_file_write(self.hook_config_file, json.dumps(config, indent=2, ensure_ascii=False))
        
        # 初始化拦截模式
        if not self.intercept_patterns_file.exists():
            patterns = {
                'cross_cli_indicators': [
                    r'(?:call|invoke|use|run|execute)\s+(?:the\s+)?([a-z]+)\s+(?:cli|tool|assistant)',
                    r'(?:with|using|via)\s+([a-z]+)',
                    r'(?:ask|tell|request)\s+([a-z]+)\s+to',
                    r'([a-z]+)(?:\s+can|should|will)\s+(?:help|assist|process|handle)',
                ],
                'intent_classifiers': {
                    'code_generation': [
                        r'generate', r'create', r'write', r'build', r'develop', r'implement'
                    ],
                    'code_analysis': [
                        r'analyze', r'review', r'check', r'examine', r'inspect', r'audit'
                    ],
                    'debugging': [
                        r'fix', r'debug', r'repair', r'solve', r'resolve', r'troubleshoot'
                    ],
                    'documentation': [
                        r'document', r'explain', r'describe', r'comment', r'manual'
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
                    'codex': ['codex', 'openai', 'gpt'],
                    'cline': ['cline', 'mcp', 'model-context-protocol']
                },
                'version': '1.0.0'
            }
            safe_file_write(self.intercept_patterns_file, json.dumps(patterns, indent=2, ensure_ascii=False))
        
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
                self.intercept_patterns = patterns.get('cross_cli_indicators', [])
                self.intent_classifiers = patterns.get('intent_classifiers', {})
                self.cli_aliases = patterns.get('cli_aliases', {})
        except:
            self.intercept_patterns = []
            self.intent_classifiers = {}
            self.cli_aliases = {}
    
    def install_hooks(self, cli_name: str) -> Dict[str, Any]:
        """为指定CLI安装Hook"""
        result = {
            'success': False,
            'message': '',
            'installed_hooks': [],
            'configuration_changes': []
        }
        
        if cli_name not in self.architectures.ARCHITECTURES:
            result['message'] = f"Unsupported CLI: {cli_name}"
            return result
        
        arch = self.architectures.ARCHITECTURES[cli_name]
        
        try:
            # 检查CLI可用性
            available, message = self.cross_executor.check_cli_availability(cli_name)
            if not available:
                result['message'] = f"CLI not available: {message}"
                return result
            
            # 根据CLI架构类型安装Hook
            if arch.architecture_type == 'npm':
                hooks = self._install_npm_hooks(cli_name, arch)
            elif arch.architecture_type == 'python':
                hooks = self._install_python_hooks(cli_name, arch)
            elif arch.architecture_type == 'binary':
                hooks = self._install_binary_hooks(cli_name, arch)
            else:
                hooks = self._install_generic_hooks(cli_name, arch)
            
            # 注册Hook处理器
            self._register_hook_handlers(cli_name, hooks)
            
            result.update({
                'success': True,
                'message': f"Successfully installed hooks for {arch.name}",
                'installed_hooks': hooks,
                'configuration_changes': self._get_config_changes(cli_name)
            })
            
        except Exception as e:
            result['message'] = f"Hook installation failed: {str(e)}"
        
        return result
    
    def _install_npm_hooks(self, cli_name: str, arch) -> List[str]:
        """为npm类型CLI安装Hook"""
        hooks = []
        
        # 创建npm包装脚本
        wrapper_script = self._create_npm_wrapper(cli_name, arch)
        hooks.append(f"npm_wrapper: {wrapper_script}")
        
        # 创建shell别名或函数
        alias_script = self._create_shell_alias(cli_name, arch)
        hooks.append(f"shell_alias: {alias_script}")
        
        # 设置环境变量Hook
        env_hook = self._setup_environment_hook(cli_name, arch)
        hooks.append(f"environment_hook: {env_hook}")
        
        return hooks
    
    def _install_python_hooks(self, cli_name: str, arch) -> List[str]:
        """为Python类型CLI安装Hook"""
        hooks = []
        
        # 创建Python包装器
        wrapper_script = self._create_python_wrapper(cli_name, arch)
        hooks.append(f"python_wrapper: {wrapper_script}")
        
        # 修改Python site-packages
        if self._can_modify_site_packages(cli_name):
            site_hook = self._install_site_package_hook(cli_name, arch)
            hooks.append(f"site_package_hook: {site_hook}")
        
        return hooks
    
    def _install_binary_hooks(self, cli_name: str, arch) -> List[str]:
        """为二进制CLI安装Hook"""
        hooks = []
        
        # 创建二进制包装器
        wrapper_script = self._create_binary_wrapper(cli_name, arch)
        hooks.append(f"binary_wrapper: {wrapper_script}")
        
        # 设置PATH重定向
        path_hook = self._setup_path_redirection(cli_name, arch)
        hooks.append(f"path_redirection: {path_hook}")
        
        return hooks
    
    def _install_generic_hooks(self, cli_name: str, arch) -> List[str]:
        """安装通用Hook"""
        hooks = []
        
        # Shell函数Hook
        shell_hook = self._create_shell_function_hook(cli_name, arch)
        hooks.append(f"shell_function: {shell_hook}")
        
        # 启动脚本Hook
        startup_hook = self._create_startup_hook(cli_name, arch)
        hooks.append(f"startup_hook: {startup_hook}")
        
        return hooks
    
    def _create_npm_wrapper(self, cli_name: str, arch) -> str:
        """创建npm包装脚本"""
        wrapper_dir = self.hook_dir / 'npm_wrappers'
        wrapper_dir.mkdir(exist_ok=True)
        
        wrapper_script = wrapper_dir / f"{cli_name}_wrapper.js"
        
        wrapper_content = f'''#!/usr/bin/env node

/**
 * {arch.name} Hook Wrapper
 * Intercepts calls and enables cross-CLI collaboration
 */

const {{ spawn }} = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Hook配置
const HOOK_DIR = '{self.hook_dir}';
const CLI_NAME = '{cli_name}';
const ORIGINAL_COMMAND = '{arch.execution_command}';

// 事件记录函数
function logEvent(eventType, content, workingDir) {{
    const event = {{
        timestamp: new Date().toISOString(),
        source_cli: CLI_NAME,
        event_type: eventType,
        content: content,
        working_directory: workingDir || process.cwd(),
        user_intent: null,
        target_clis: [],
        confidence: 0.0
    }};
    
    const eventFile = path.join(HOOK_DIR, 'hook_events.json');
    try {{
        let events = [];
        if (fs.existsSync(eventFile)) {{
            const data = fs.readFileSync(eventFile, 'utf8');
            events = JSON.parse(data);
        }}
        events.push(event);
        
        // 保留最近1000个事件
        if (events.length > 1000) {{
            events = events.slice(-1000);
        }}
        
        fs.writeFileSync(eventFile, JSON.stringify(events, null, 2));
    }} catch (error) {{
        console.error('Failed to log event:', error.message);
    }}
}}

// 检测跨CLI协作意图
function detectCrossCLIIntent(args) {{
    const input = args.join(' ').toLowerCase();
    const patterns = {json.dumps(self.intercept_patterns)};
    
    for (const pattern of patterns) {{
        const regex = new RegExp(pattern, 'i');
        const match = input.match(regex);
        if (match) {{
            return {{
                detected: true,
                target_cli: match[1],
                confidence: 0.8
            }};
        }}
    }}
    
    return {{ detected: false }};
}}

// 主执行函数
function main() {{
    const args = process.argv.slice(2);
    const workingDir = process.cwd();
    
    // 记录输入事件
    logEvent('input', args.join(' '), workingDir);
    
    // 检测跨CLI意图
    const intent = detectCrossCLIIntent(args);
    if (intent.detected && intent.target_cli !== CLI_NAME) {{
        console.log(`🔗 检测到跨CLI协作意图: {{CLI_NAME}} -> {{intent.target_cli}}`);
        
        // 这里可以添加自动跨CLI调用逻辑
        // 暂时记录意图，继续执行原命令
    }}
    
    // 执行原始命令
    const originalArgs = ORIGINAL_COMMAND.includes('npx') 
        ? ['npx'].concat(ORIGINAL_COMMAND.split(' ').slice(1), args)
        : [ORIGINAL_COMMAND].concat(args);
    
    const child = spawn(originalArgs[0], originalArgs.slice(1), {{
        stdio: 'inherit',
        cwd: workingDir,
        env: {{ ...process.env }}
    }});
    
    child.on('close', (code) => {{
        // 记录输出事件
        logEvent('output', `Command completed with code: ${{code}}`, workingDir);
        process.exit(code);
    }});
    
    child.on('error', (error) => {{
        logEvent('error', error.message, workingDir);
        process.exit(1);
    }});
}}

// 启动Hook
if (require.main === module) {{
    main();
}}

module.exports = {{ logEvent, detectCrossCLIIntent }};
'''
        
        safe_file_write(str(wrapper_script), wrapper_content)
        
        # 设置执行权限
        try:
            os.chmod(wrapper_script, 0o755)
        except:
            pass
        
        return str(wrapper_script)
    
    def _create_python_wrapper(self, cli_name: str, arch) -> str:
        """创建Python包装器"""
        wrapper_dir = self.hook_dir / 'python_wrappers'
        wrapper_dir.mkdir(exist_ok=True)
        
        wrapper_script = wrapper_dir / f"{cli_name}_wrapper.py"
        
        wrapper_content = f'''#!/usr/bin/env python3
"""
{arch.name} Python Hook Wrapper
Intercepts Python CLI calls and enables cross-CLI collaboration
"""

import sys
import os
import json
import subprocess
import argparse
from pathlib import Path
from datetime import datetime

# Hook配置
HOOK_DIR = r"{self.hook_dir}"
CLI_NAME = "{cli_name}"
ORIGINAL_COMMAND = "{arch.execution_command}"

def log_event(event_type, content, working_dir=None):
    """记录Hook事件"""
    event = {{
        "timestamp": datetime.now().isoformat(),
        "source_cli": CLI_NAME,
        "event_type": event_type,
        "content": content,
        "working_directory": working_dir or os.getcwd(),
        "user_intent": None,
        "target_clis": [],
        "confidence": 0.0
    }}
    
    event_file = Path(HOOK_DIR) / 'hook_events.json'
    try:
        if event_file.exists():
            with open(event_file, 'r', encoding='utf-8') as f:
                events = json.load(f)
        else:
            events = []
        
        events.append(event)
        
        # 保留最近1000个事件
        if len(events) > 1000:
            events = events[-1000:]
        
        with open(event_file, 'w', encoding='utf-8') as f:
            json.dump(events, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Failed to log event: {{e}}", file=sys.stderr)

def detect_cross_cli_intent(args):
    """检测跨CLI协作意图"""
    input_text = ' '.join(args).lower()
    patterns = {json.dumps(self.intercept_patterns)}
    
    for pattern in patterns:
        import re
        match = re.search(pattern, input_text, re.IGNORECASE)
        if match:
            return {{
                "detected": True,
                "target_cli": match.group(1),
                "confidence": 0.8
            }}
    
    return {{"detected": False}}

def main():
    """主执行函数"""
    args = sys.argv[1:]
    working_dir = os.getcwd()
    
    # 记录输入事件
    log_event('input', ' '.join(args), working_dir)
    
    # 检测跨CLI意图
    intent = detect_cross_cli_intent(args)
    if intent["detected"] and intent["target_cli"] != CLI_NAME:
        print(f"🔗 检测到跨CLI协作意图: {{CLI_NAME}} -> {{intent['target_cli']}}")
        
        # 这里可以添加自动跨CLI调用逻辑
        # 暂时记录意图，继续执行原命令
    
    # 执行原始命令
    try:
        if ORIGINAL_COMMAND == cli_name:
            # 直接执行CLI命令
            result = subprocess.run([ORIGINAL_COMMAND] + args, 
                                  cwd=working_dir,
                                  capture_output=False,
                                  text=True)
        else:
            # 执行完整命令
            cmd = ORIGINAL_COMMAND.split() + args
            result = subprocess.run(cmd,
                                  cwd=working_dir,
                                  capture_output=False,
                                  text=True)
        
        # 记录输出事件
        log_event('output', f"Command completed with code: {{result.returncode}}", working_dir)
        sys.exit(result.returncode)
        
    except Exception as e:
        log_event('error', str(e), working_dir)
        sys.exit(1)

if __name__ == '__main__':
    main()
'''
        
        safe_file_write(str(wrapper_script), wrapper_content)
        
        # 设置执行权限
        try:
            os.chmod(wrapper_script, 0o755)
        except:
            pass
        
        return str(wrapper_script)
    
    def _create_shell_alias(self, cli_name: str, arch) -> str:
        """创建Shell别名"""
        alias_file = self.hook_dir / 'shell_aliases' / f"{cli_name}_alias.sh"
        alias_file.parent.mkdir(exist_ok=True)
        
        alias_content = f'''#!/bin/bash
# {arch.name} Hook Alias

# 原始命令别名
alias {cli_name}_original="{arch.execution_command}"

# Hook包装函数
{cli_name}() {{
    # 记录调用事件
    local event_file="{self.hook_dir}/hook_events.json"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    local working_dir=$(pwd)
    local input_args="$*"
    
    # 创建事件记录
    local event='{{'
    event+='"timestamp":"'"$timestamp"'",'
    event+='"source_cli":"{cli_name}",'
    event+='"event_type":"input",'
    event+='"content":"'"$input_args"'",'
    event+='"working_directory":"'"$working_dir"'"'
    event+='}}'
    
    # 写入事件文件
    echo "$event" >> "$event_file.tmp"
    
    # 检测跨CLI意图（简化版）
    if [[ "$input_args" =~ (call|invoke|use|run|execute)\\s+([a-z]+) ]]; then
        echo "🔗 检测到跨CLI协作意图: {cli_name} -> ${{BASH_REMATCH[2]}}"
    fi
    
    # 执行原始命令
    {cli_name}_original "$@"
    local exit_code=$?
    
    # 记录完成事件
    local completion_event='{{'
    completion_event+='"timestamp":"'"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")"'",'
    completion_event+='"source_cli":"{cli_name}",'
    completion_event+='"event_type":"output",'
    completion_event+='"content":"Command completed with code: '"$exit_code"'",'
    completion_event+='"working_directory":"'"$working_dir"'"'
    completion_event+='}}'
    
    echo "$completion_event" >> "$event_file.tmp"
    
    # 合并临时事件文件
    if [[ -f "$event_file.tmp" ]]; then
        python3 -c "
import json
from pathlib import Path
import sys

event_file = Path('{self.hook_dir}/hook_events.json')
temp_file = Path('{self.hook_dir}/hook_events.json.tmp')

try:
    if event_file.exists():
        events = json.loads(event_file.read_text(encoding='utf-8'))
    else:
        events = []
    
    if temp_file.exists():
        temp_content = temp_file.read_text(encoding='utf-8').strip()
        for line in temp_content.split('}}\\n'):
            if line.strip():
                try:
                    event = json.loads(line + '}}')
                    events.append(event)
                except:
                    pass
        temp_file.unlink()
    
    # 保留最近1000个事件
    if len(events) > 1000:
        events = events[-1000:]
    
    event_file.write_text(json.dumps(events, indent=2, ensure_ascii=False), encoding='utf-8')
except Exception as e:
    print(f'Warning: Failed to merge hook events: {{e}}', file=sys.stderr)
"
    fi
    
    return $exit_code
}}
'''
        
        safe_file_write(str(alias_file), alias_content)
        return str(alias_file)
    
    def _register_hook_handlers(self, cli_name: str, hooks: List[str]):
        """注册Hook处理器"""
        self.active_hooks[cli_name] = {
            'hooks': hooks,
            'installed_at': datetime.now().isoformat(),
            'status': 'active'
        }
        
        # 注册事件处理器
        self.event_handlers[cli_name] = {
            'on_input': self._handle_input_event,
            'on_output': self._handle_output_event,
            'on_error': self._handle_error_event,
            'on_cross_cli_intent': self._handle_cross_cli_intent
        }
    
    def _handle_input_event(self, event: CLIHookEvent):
        """处理输入事件"""
        # 检测跨CLI协作意图
        intent = self._analyze_intent(event.content)
        if intent:
            event.user_intent = intent['type']
            event.target_clis = intent['target_clis']
            event.confidence = intent['confidence']
            
            # 如果配置了自动跨CLI调用
            if self.config.get('auto_cross_call_enabled', False):
                self._try_auto_cross_call(event)
    
    def _handle_output_event(self, event: CLIHookEvent):
        """处理输出事件"""
        # 分析输出结果，学习成功模式
        self._learn_from_output(event)
    
    def _handle_error_event(self, event: CLIHookEvent):
        """处理错误事件"""
        # 记录错误，优化后续检测
        self._learn_from_error(event)
    
    def _handle_cross_cli_intent(self, event: CLIHookEvent):
        """处理跨CLI协作意图"""
        # 执行跨CLI调用
        for target_cli in event.target_clis:
            result = self.cross_executor.execute_cross_cli_call(
                source_cli=event.source_cli,
                target_cli=target_cli,
                request=event.content,
                working_dir=event.working_directory
            )
            
            # 记录结果
            self._log_cross_cli_result(event, target_cli, result)
    
    def _analyze_intent(self, content: str) -> Optional[Dict[str, Any]]:
        """分析用户意图"""
        content_lower = content.lower()
        
        # 检测跨CLI指示符
        for pattern in self.intercept_patterns:
            match = re.search(pattern, content_lower)
            if match:
                target_cli = match.group(1)
                
                # 解析别名
                for canonical_name, aliases in self.cli_aliases.items():
                    if target_cli in aliases:
                        target_cli = canonical_name
                        break
                
                if target_cli in self.architectures.ARCHITECTURES:
                    return {
                        'type': 'cross_cli_call',
                        'target_clis': [target_cli],
                        'confidence': 0.8,
                        'pattern_used': pattern
                    }
        
        # 检测意图类型
        for intent_type, patterns in self.intent_classifiers.items():
            for pattern in patterns:
                if re.search(pattern, content_lower):
                    return {
                        'type': intent_type,
                        'target_clis': [],
                        'confidence': 0.6,
                        'pattern_used': pattern
                    }
        
        return None
    
    def _try_auto_cross_call(self, event: CLIHookEvent):
        """尝试自动跨CLI调用"""
        if not event.target_clis or event.confidence < self.config.get('detection_confidence_threshold', 0.7):
            return
        
        for target_cli in event.target_clis:
            # 检查目标CLI是否可用
            available, _ = self.cross_executor.check_cli_availability(target_cli)
            if not available:
                continue
            
            # 执行跨CLI调用
            result = self.cross_executor.execute_cross_cli_call(
                source_cli=event.source_cli,
                target_cli=target_cli,
                request=event.content,
                working_dir=event.working_directory
            )
            
            # 如果成功，显示结果
            if result['success']:
                print(f"\\n🔗 跨CLI协作结果 ({event.source_cli} -> {target_cli}):")
                print(result['response'])
                print("-" * 50)
    
    def _learn_from_output(self, event: CLIHookEvent):
        """从输出中学习"""
        # 这里可以实现机器学习逻辑
        # 分析哪些类型的调用在什么情况下成功
        pass
    
    def _learn_from_error(self, event: CLIHookEvent):
        """从错误中学习"""
        # 记录错误模式，改进检测算法
        pass
    
    def _log_cross_cli_result(self, event: CLIHookEvent, target_cli: str, result: Dict[str, Any]):
        """记录跨CLI调用结果"""
        result_event = CLIHookEvent(
            timestamp=datetime.now().isoformat(),
            source_cli=event.source_cli,
            event_type='cross_cli_result',
            content=f"Cross-CLI call to {target_cli}: {result['success']}",
            working_directory=event.working_directory,
            user_intent=event.user_intent,
            target_clis=[target_cli],
            confidence=result.get('confidence', 0.0)
        )
        
        self._record_event(result_event)
    
    def _record_event(self, event: CLIHookEvent):
        """记录Hook事件"""
        try:
            if self.event_log_file.exists():
                events = json.loads(safe_file_read(self.event_log_file))
            else:
                events = []
            
            events.append(asdict(event))
            
            # 保留最近1000个事件
            if len(events) > 1000:
                events = events[-1000:]
            
            safe_file_write(self.event_log_file, json.dumps(events, indent=2, ensure_ascii=False))
        except Exception as e:
            print(f"Warning: Failed to record hook event: {e}")
    
    def get_hook_status(self) -> Dict[str, Any]:
        """获取Hook状态"""
        status = {
            'active_hooks': self.active_hooks,
            'event_handlers_count': len(self.event_handlers),
            'config': self.config,
            'total_events': 0,
            'recent_events': []
        }
        
        # 统计事件数量
        try:
            if self.event_log_file.exists():
                events = json.loads(safe_file_read(self.event_log_file))
                status['total_events'] = len(events)
                status['recent_events'] = events[-10:]  # 最近10个事件
        except:
            pass
        
        return status
    
    def uninstall_hooks(self, cli_name: str) -> Dict[str, Any]:
        """卸载CLI Hook"""
        result = {
            'success': False,
            'message': '',
            'removed_hooks': []
        }
        
        if cli_name not in self.active_hooks:
            result['message'] = f"No hooks installed for {cli_name}"
            return result
        
        try:
            # 移除Hook文件
            hooks_info = self.active_hooks[cli_name]['hooks']
            removed_hooks = []
            
            for hook in hooks_info:
                if ': ' in hook:
                    hook_type, hook_path = hook.split(': ', 1)
                    if os.path.exists(hook_path):
                        try:
                            os.remove(hook_path)
                            removed_hooks.append(hook)
                        except:
                            pass
            
            # 清理注册信息
            del self.active_hooks[cli_name]
            if cli_name in self.event_handlers:
                del self.event_handlers[cli_name]
            
            result.update({
                'success': True,
                'message': f"Successfully uninstalled hooks for {cli_name}",
                'removed_hooks': removed_hooks
            })
            
        except Exception as e:
            result['message'] = f"Hook uninstallation failed: {str(e)}"
        
        return result

# 使用示例
if __name__ == '__main__':
    hook_manager = RealCLIHookManager()
    
    # 安装Hook示例
    print("=== Installing CLI Hooks ===")
    for cli_name in ['iflow', 'codebuddy']:
        result = hook_manager.install_hooks(cli_name)
        print(f"{cli_name}: {'✓ Success' if result['success'] else '✗ Failed'} - {result['message']}")
    
    # 获取Hook状态
    print("\\n=== Hook Status ===")
    status = hook_manager.get_hook_status()
    print(f"Active hooks: {list(status['active_hooks'].keys())}")
    print(f"Total events: {status['total_events']}")
    
    # 测试事件记录
    test_event = CLIHookEvent(
        timestamp=datetime.now().isoformat(),
        source_cli='iflow',
        event_type='input',
        content='call claude to analyze this code',
        working_directory=os.getcwd(),
        user_intent='cross_cli_call',
        target_clis=['claude'],
        confidence=0.8
    )
    
    hook_manager._record_event(test_event)
    print(f"\\nTest event recorded. Total events: {len(json.loads(safe_file_read(hook_manager.event_log_file)))}")