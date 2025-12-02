#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
增强版通用CLI智能路由自动化部署脚本
集成高级检测机制，使用npm包管理器进行精确工具检测
"""

import os
import sys
import json
import platform
import subprocess
import shutil
from pathlib import Path
import tempfile


class EnhancedCLISetup:
    """增强版CLI设置管理器"""

    def __init__(self):
        self.config_file = "cli_config.json"
        self.setup_dir = Path.cwd()
        self.system = platform.system().lower()
        self.config = self.load_or_create_config()
        
        # npm包名映射用于精确检测
        self.npm_package_map = {
            'claude': '@anthropic-ai/claude-code',
            'gemini': '@google/gemini-cli', 
            'qwen': '@qwen-code/qwen-code',
            'copilot': '@github/copilot',
            'codebuddy': '@tencent-ai/codebuddy-code',
            'qoder': '@qoder-ai/qodercli',
            'kimi': '@jacksontian/kimi-cli',
            'iflow': '@iflow-ai/iflow-cli',
            'arxiv': 'arxiv-mcp-server'
        }

    def load_or_create_config(self):
        """加载或创建配置"""
        default_config = {
            "version": "2.0.0",  # 增强版配置
            "system": self.system,
            "tools": {
                "claude": {
                    "command": {
                        "windows": "claude.cmd",
                        "linux": "claude",
                        "darwin": "claude"
                    },
                    "description": "Anthropic Claude",
                    "keywords": ["claude", "anthropic"],
                    "priority": 1,
                    "wrapper": False,
                    "check_command": ["--version"],
                    "npm_package": "@anthropic-ai/claude-code"
                },
                "gemini": {
                    "command": {
                        "windows": "gemini.cmd",
                        "linux": "gemini",
                        "darwin": "gemini"
                    },
                    "description": "Google Gemini AI",
                    "keywords": ["gemini", "google", "谷歌"],
                    "priority": 2,
                    "wrapper": False,
                    "check_command": ["--version"],
                    "npm_package": "@google/gemini-cli"
                },
                "kimi": {
                    "command": {
                        "windows": "kimi_wrapper",
                        "linux": "kimi_wrapper",
                        "darwin": "kimi_wrapper"
                    },
                    "description": "月之暗面Kimi",
                    "keywords": ["kimi", "月之暗面", "moonshot"],
                    "priority": 3,
                    "wrapper": True,
                    "wrapper_script": "kimi_wrapper.py",
                    "check_command": ["--version"],
                    "npm_package": "@jacksontian/kimi-cli"
                },
                "qwen": {
                    "command": {
                        "windows": "qwen.cmd",
                        "linux": "qwen",
                        "darwin": "qwen"
                    },
                    "description": "阿里通义千问",
                    "keywords": ["qwen", "通义", "阿里"],
                    "priority": 4,
                    "wrapper": False,
                    "check_command": ["--version"],
                    "npm_package": "@qwen-code/qwen-code"
                },
                "ollama": {
                    "command": {
                        "windows": "ollama",
                        "linux": "ollama",
                        "darwin": "ollama"
                    },
                    "description": "Ollama本地模型",
                    "keywords": ["ollama", "本地", "离线"],
                    "priority": 5,
                    "wrapper": False,
                    "check_command": ["--version"],
                    "npm_package": None
                },
                "codebuddy": {
                    "command": {
                        "windows": "codebuddy",
                        "linux": "codebuddy",
                        "darwin": "codebuddy"
                    },
                    "description": "CodeBuddy代码助手",
                    "keywords": ["codebuddy", "代码助手", "编程"],
                    "priority": 6,
                    "wrapper": False,
                    "check_command": ["--version"],
                    "npm_package": "@tencent-ai/codebuddy-code"
                },
                "qodercli": {
                    "command": {
                        "windows": "qodercli",
                        "linux": "qodercli",
                        "darwin": "qodercli"
                    },
                    "description": "QoderCLI代码生成",
                    "keywords": ["qodercli", "代码生成", "编程"],
                    "priority": 7,
                    "wrapper": False,
                    "check_command": ["--version"],
                    "npm_package": "@qoder-ai/qodercli"
                },
                "iflow": {
                    "command": {
                        "windows": "iflow.cmd",
                        "linux": "iflow",
                        "darwin": "iflow"
                    },
                    "description": "iFlow智能助手",
                    "keywords": ["iflow", "智能", "助手", "心流"],
                    "priority": 8,
                    "wrapper": False,
                    "check_command": ["--version"],
                    "npm_package": "@iflow-ai/iflow-cli"
                }
            },
            "route_keywords": ["用", "帮我", "请", "智能", "ai", "写", "生成", "解释", "分析", "翻译", "代码", "文章"],
            "default_tool": "claude",
            "fallback_strategy": "first_available",
            "wrapper_scripts": {
                "kimi_wrapper": "kimi_wrapper.py"
            },
            "output_formats": ["cmd", "powershell", "bash", "python"],
            "install_global": False,
            "enhanced_detection": True  # 标记使用增强检测
        }

        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                    # 合并配置，用户配置优先
                    self._merge_config(default_config, user_config)
                    return default_config
            except Exception as e:
                print(f"⚠️  配置文件加载失败，使用默认配置: {e}")

        # 保存默认配置
        self.save_config(default_config)
        return default_config

    def _merge_config(self, default, user):
        """递归合并配置"""
        for key, value in user.items():
            if key in default:
                if isinstance(default[key], dict) and isinstance(value, dict):
                    self._merge_config(default[key], value)
                else:
                    default[key] = value
            else:
                default[key] = value

    def save_config(self, config):
        """保存配置"""
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)

    def detect_with_npm(self, package_name: str, force_rescan=False) -> dict:
        """
        使用npm检测包安装状态（文件重定向方式）
        
        Args:
            package_name: npm包名
            force_rescan: 是否强制重新扫描（忽略缓存）
            
        Returns:
            检测结果字典
        """
        # 如果不是强制重扫描，可以检查缓存
        if not force_rescan:
            # TODO: 实现简单的内存缓存机制
            pass
        
        with tempfile.NamedTemporaryFile(mode='w+', delete=False, suffix='.json', encoding='utf-8') as tmp_file:
            temp_filename = tmp_file.name

        try:
            # 使用shell重定向方式运行npm命令
            # 添加 --depth=0 选项确保只检查顶层包，避免扫描所有依赖
            # 对于强制重扫描，我们确保每次都执行新命令
            subprocess.run(f'npm list -g --depth=0 --json > "{temp_filename}"', 
                         shell=True, capture_output=True, timeout=15)
            
            # 检查文件是否存在且有内容
            if os.path.exists(temp_filename):
                with open(temp_filename, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    if content:
                        packages = json.loads(content)
                        if 'dependencies' in packages:
                            for pkg_name, pkg_info in packages['dependencies'].items():
                                # 检查包名是否匹配
                                if pkg_name.lower() == package_name.lower():
                                    version = pkg_info.get('version', 'unknown')
                                    if not version or version == 'unknown':
                                        version = pkg_info.get('resolved', 'unknown')
                                    
                                    return {
                                        'installed': True,
                                        'version': version,
                                        'packageName': pkg_name,
                                        'installPath': pkg_info.get('resolved', 'unknown')
                                    }
                                
                                # 也检查部分匹配
                                if package_name.lower() in pkg_name.lower():
                                    version = pkg_info.get('version', 'unknown')
                                    if not version or version == 'unknown':
                                        version = pkg_info.get('resolved', 'unknown')
                                    
                                    return {
                                        'installed': True,
                                        'version': version,
                                        'packageName': pkg_name,
                                        'installPath': pkg_info.get('resolved', 'unknown')
                                    }

            return {
                'installed': False,
                'error': 'Package not found in npm global list'
            }
        except Exception as e:
            return {
                'installed': False,
                'error': str(e)
            }
        finally:
            # 清理临时文件
            if os.path.exists(temp_filename):
                os.unlink(temp_filename)

    def detect_with_which(self, command: str, force_rescan=False) -> bool:
        """使用which或where命令检测可执行文件
        
        Args:
            command: 要检测的命令
            force_rescan: 是否强制重新扫描（忽略缓存）
        """
        # which/where命令通常不需要缓存，但可以在这里实现缓存逻辑
        try:
            if platform.system() == 'Windows':
                result = subprocess.run(
                    ['where', command],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
            else:
                result = subprocess.run(
                    ['which', command],
                    capture_output=True,
                    text=True,
                    timeout=5
                )

            return result.returncode == 0
        except:
            return False

    def discover_available_tools(self, force_rescan=False):
        """发现可用工具 - 增强版，使用npm检测和命令检测双重机制
        
        Args:
            force_rescan: 是否强制重新扫描，清除缓存
        """
        available = {}
        npm_results = {}

        scan_type = "🔄 强制重新扫描" if force_rescan else "🔍 正在使用增强检测机制发现可用工具"
        print(f"{scan_type}...")

        for tool_name, tool_config in self.config["tools"].items():
            print(f"  检测 {tool_name}...")
            
            # 获取系统特定命令
            command = tool_config["command"][self.system]
            npm_package = tool_config.get("npm_package")
            
            # 方法1: npm包检测（如果适用）
            npm_installed = False
            npm_version = None
            if npm_package:
                npm_result = self.detect_with_npm(npm_package, force_rescan)
                npm_installed = npm_result.get('installed', False)
                npm_version = npm_result.get('version', 'unknown')
                npm_results[tool_name] = npm_result
                
                if npm_installed:
                    print(f"    npm: ✅ {npm_version}")
            
            # 方法2: 命令行检测
            cmd_installed = False
            if tool_config.get("wrapper") and tool_config.get("wrapper_script"):
                # 检查包装器脚本
                wrapper_path = self.setup_dir / tool_config["wrapper_script"]
                cmd_installed = wrapper_path.exists()
            else:
                # 检查命令是否存在
                cmd_installed = self.detect_with_which(command.split()[0], force_rescan)
            
            if cmd_installed:
                print(f"    cmd: ✅")
            
            # 工具可用性：npm或命令行任一检测到即可
            available[tool_name] = npm_installed or cmd_installed

        print(f"📊 检测完成: {sum(1 for v in available.values() if v)}/{len(available)} 个工具可用")
        return available

    def generate_smart_router(self, cli_name, output_format="cmd"):
        """生成智能路由器"""
        available_tools = self.discover_available_tools()

        if output_format == "cmd":
            return self._generate_cmd_router(cli_name, available_tools)
        elif output_format == "powershell":
            return self._generate_powershell_router(cli_name, available_tools)
        elif output_format == "bash":
            return self._generate_bash_router(cli_name, available_tools)
        elif output_format == "python":
            return self._generate_python_router(cli_name, available_tools)
        else:
            raise ValueError(f"不支持的输出格式: {output_format}")

    def _generate_cmd_router(self, cli_name, available_tools):
        """生成CMD路由器"""
        router_content = f'''@echo off
setlocal enabledelayedexpansion

:: 智能{cli_name}路由器 - 增强版
:: 系统: {self.system}
:: 可用工具: {list(available_tools.keys())}

set "USER_INPUT=%*"

if "%USER_INPUT%"=="" (
    echo 🎯 智能{cli_name}路由器 - 增强版
    echo 💡 原始功能: {cli_name} [参数]
    echo 🤖 智能路由示例:
'''

        # 添加可用工具的路由逻辑
        for tool_name in sorted(available_tools.keys(), 
                              key=lambda x: self.config["tools"][x].get("priority", 99) if x in self.config["tools"] else 99):
            if available_tools[tool_name] and tool_name in self.config["tools"]:
                keywords = self.config["tools"][tool_name]["keywords"]
                keyword_pattern = "|".join(keywords)
                router_content += f'''    echo     智能{cli_name}.bat 用{keyword_pattern}
'''

        router_content += f'''
    exit /b
)

:: 智能路由检测
echo %USER_INPUT% | findstr /i "{" ".join(self.config["route_keywords"])}" >nul
if %errorlevel% neq 0 (
    :: 不需要路由，执行原始命令
    {cli_name} %USER_INPUT%
    exit /b
)

'''

        # 生成路由逻辑
        for tool_name in sorted(available_tools.keys(), 
                              key=lambda x: self.config["tools"][x].get("priority", 99) if x in self.config["tools"] else 99):
            if available_tools[tool_name] and tool_name in self.config["tools"]:
                keywords = self.config["tools"][tool_name]["keywords"]
                command = self.config["tools"][tool_name]["command"][self.system]

                router_content += f'''echo %USER_INPUT% | findstr /i "{" ".join(keywords)}" >nul
if !errorlevel! equ 0 (
    echo 🚀 智能路由到: {self.config["tools"][tool_name]["description"]}
    set "CLEAN_INPUT=!USER_INPUT!"
'''

                for keyword in keywords:
                    router_content += f'''    set "CLEAN_INPUT=!CLEAN_INPUT:{keyword}=!"
'''

                router_content += f'''    set "CLEAN_INPUT=!CLEAN_INPUT:用=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:帮我=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:请=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:写=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:生成=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:解释=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:分析=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:翻译=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:代码=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:文章=!"

'''

                if self.config["tools"][tool_name].get("wrapper"):
                    wrapper_script = self.config["tools"][tool_name]["wrapper_script"]
                    router_content += f'''    python {wrapper_script} "!CLEAN_INPUT!"
'''
                else:
                    router_content += f'''    {command} "!CLEAN_INPUT!"
'''

                router_content += '''    exit /b
)
'''

        # 默认路由
        default_tool = self.config["default_tool"]
        if default_tool in available_tools and default_tool in self.config["tools"]:
            command = self.config["tools"][default_tool]["command"][self.system]
            router_content += f'''
:: 默认路由到{self.config["tools"][default_tool]["description"]}
set "CLEAN_INPUT=!USER_INPUT!"
set "CLEAN_INPUT=!CLEAN_INPUT:用=!"
set "CLEAN_INPUT=!CLEAN_INPUT:帮我=!"
set "CLEAN_INPUT=!CLEAN_INPUT:请=!"
set "CLEAN_INPUT=!CLEAN_INPUT:写=!"
set "CLEAN_INPUT=!CLEAN_INPUT:生成=!"
set "CLEAN_INPUT=!CLEAN_INPUT:解释=!"
set "CLEAN_INPUT=!CLEAN_INPUT:分析=!"
set "CLEAN_INPUT=!CLEAN_INPUT:翻译=!"
set "CLEAN_INPUT=!CLEAN_INPUT:代码=!"
set "CLEAN_INPUT=!CLEAN_INPUT:文章=!"
{command} "!CLEAN_INPUT!"
'''
        else:
            router_content += f'''
:: 执行原始{cli_name}
{cli_name} %USER_INPUT%
'''

        return router_content

    def _generate_powershell_router(self, cli_name, available_tools):
        """生成PowerShell路由器"""
        router_content = f'''# 智能{cli_name}路由器 - PowerShell版 - 增强版
# 系统: {self.system}
# 可用工具: {list(available_tools.keys())}

param(
    [string]$UserInput = ""
)

function SmartRoute {{
    param([string]$Input)

    $routeKeywords = @({', '.join([f'"{kw}"' for kw in self.config["route_keywords"]])})

    foreach ($keyword in $routeKeywords) {{
        if ($Input -like "*$keyword*") {{
            return $true
        }}
    }}

    return $false
}}

function Route-ToTool {{
    param([string]$Input)
'''

        # 生成路由逻辑
        for tool_name in sorted(available_tools.keys(), 
                              key=lambda x: self.config["tools"][x].get("priority", 99) if x in self.config["tools"] else 99):
            if available_tools[tool_name] and tool_name in self.config["tools"]:
                keywords = self.config["tools"][tool_name]["keywords"]
                command = self.config["tools"][tool_name]["command"][self.system]

                router_content += f'''
    if ($Input -like "*{keywords[0]}*") {{
        Write-Host "🚀 智能路由到: {self.config['tools'][tool_name]['description']}"
        $cleanInput = $Input
'''

                for keyword in keywords:
                    router_content += f'''        $cleanInput = $cleanInput -replace "{keyword}", ""'''

                router_content += '''        $cleanInput = $cleanInput -replace "^用", "" -replace "^帮我", "" -replace "^请", "" -replace "^写", "" -replace "^生成", "" -replace "^解释", "" -replace "^分析", "" -replace "^翻译", "" -replace "^代码", "" -replace "^文章", ""
'''

                if self.config["tools"][tool_name].get("wrapper"):
                    wrapper_script = self.config["tools"][tool_name]["wrapper_script"]
                    router_content += f'''        python {wrapper_script} $cleanInput.Trim()'''
                else:
                    router_content += f'''        {command} $cleanInput.Trim()'''

                router_content += '''        return
    }
'''

        # 默认路由
        default_tool = self.config["default_tool"]
        if default_tool in available_tools and default_tool in self.config["tools"]:
            command = self.config["tools"][default_tool]["command"][self.system]
            router_content += f'''
    # 默认路由到{self.config["tools"][default_tool]["description"]}
    $cleanInput = $Input
    $cleanInput = $cleanInput -replace "^用", "" -replace "^帮我", "" -replace "^请", "" -replace "^写", "" -replace "^生成", "" -replace "^解释", "" -replace "^分析", "" -replace "^翻译", "" -replace "^代码", "" -replace "^文章", ""
    {command} $cleanInput.Trim()
'''
        else:
            router_content += f'''    # 执行原始{cli_name}
    {cli_name} $UserInput'''

        router_content += '''
}

# 主逻辑
if (-not $UserInput) {{
    Write-Host "🎯 智能{cli_name}路由器 - PowerShell版 - 增强版"
    Write-Host "💡 原始功能: .\smart_{cli_name}.ps1 '参数'"
    Write-Host "🤖 智能路由示例:"
'''

        # 添加可用工具示例
        for tool_name in sorted(available_tools.keys(), 
                              key=lambda x: self.config["tools"][x].get("priority", 99) if x in self.config["tools"] else 99):
            if available_tools[tool_name] and tool_name in self.config["tools"]:
                keywords = self.config["tools"][tool_name]["keywords"]
                router_content += f'''    Write-Host "     .\smart_{cli_name}.ps1 '用{keywords[0]}写代码'"
'''

        router_content += '''    exit
}}

if (SmartRoute $UserInput) {{
    Route-ToTool $UserInput
}} else {{
    {cli_name} $UserInput
}}
'''

        return router_content

    def _generate_bash_router(self, cli_name, available_tools):
        """生成Bash路由器 - 增强版"""
        router_content = f'''#!/bin/bash
# 智能{cli_name}路由器 - Bash版 - 增强版
# 系统: {self.system}
# 可用工具: {list(available_tools.keys())}

USER_INPUT="$*"

# 检查是否需要智能路由
if [[ -z "$USER_INPUT" ]]; then
    echo "🎯 智能{cli_name}路由器 - Bash版 - 增强版"
    echo "💡 原始功能: ./smart_{cli_name}.sh '参数'"
    echo "🤖 智能路由示例:"
'''

        # 添加可用工具示例
        for tool_name in sorted(available_tools.keys(), 
                              key=lambda x: self.config["tools"][x].get("priority", 99) if x in self.config["tools"] else 99):
            if available_tools[tool_name] and tool_name in self.config["tools"]:
                keywords = self.config["tools"][tool_name]["keywords"]
                router_content += f'''    echo "    ./smart_{cli_name}.sh '用{keywords[0]}写代码'"
'''

        router_content += '''    exit 0
fi

# 智能路由检测
ROUTE_KEYWORDS="用 帮我 请 智能 ai 写 生成 解释 分析 翻译 代码 文章"
NEEDS_ROUTE=false

for keyword in $ROUTE_KEYWORDS; do
    if echo "$USER_INPUT" | grep -qi "$keyword"; then
        NEEDS_ROUTE=true
        break
    fi
done

if [ "$NEEDS_ROUTE" = false ]; then
    # 不需要路由，执行原始命令
    {cli_name} $USER_INPUT
    exit 0
fi

# 智能路由逻辑
'''

        # 生成路由逻辑
        for tool_name in sorted(available_tools.keys(), 
                              key=lambda x: self.config["tools"][x].get("priority", 99) if x in self.config["tools"] else 99):
            if available_tools[tool_name] and tool_name in self.config["tools"]:
                keywords = self.config["tools"][tool_name]["keywords"]
                command = self.config["tools"][tool_name]["command"][self.system]

                router_content += f'''
if echo "$USER_INPUT" | grep -qi "{keywords[0]}"; then
    echo "🚀 智能路由到: {self.config["tools"][tool_name]["description"]}"
    CLEAN_INPUT=$(echo "$USER_INPUT" | sed 's/{keywords[0]}//g' | sed 's/^用\s*//' | sed 's/^帮我\s*//' | sed 's/^请\s*//' | sed 's/^写\s*//' | sed 's/^生成\s*//' | sed 's/^解释\s*//' | sed 's/^分析\s*//' | sed 's/^翻译\s*//' | sed 's/^代码\s*//' | sed 's/^文章\s*//')
'''

                if self.config["tools"][tool_name].get("wrapper"):
                    wrapper_script = self.config["tools"][tool_name]["wrapper_script"]
                    router_content += f'''    python {wrapper_script} "$CLEAN_INPUT"'''
                else:
                    router_content += f'''    {command} "$CLEAN_INPUT"'''

                router_content += '''    exit 0
fi
'''

        # 默认路由
        default_tool = self.config["default_tool"]
        if default_tool in available_tools and default_tool in self.config["tools"]:
            command = self.config["tools"][default_tool]["command"][self.system]
            router_content += f'''
# 默认路由到{self.config["tools"][default_tool]["description"]}
echo "🚀 智能路由到: {self.config["tools"][default_tool]["description"]}"
CLEAN_INPUT=$(echo "$USER_INPUT" | sed 's/^用\s*//' | sed 's/^帮我\s*//' | sed 's/^请\s*//' | sed 's/^写\s*//' | sed 's/^生成\s*//' | sed 's/^解释\s*//' | sed 's/^分析\s*//' | sed 's/^翻译\s*//' | sed 's/^代码\s*//' | sed 's/^文章\s*//')
{command} "$CLEAN_INPUT"
'''
        else:
            router_content += f'''# 执行原始{cli_name}
{cli_name} "$USER_INPUT"
'''

        return router_content

    def _generate_python_router(self, cli_name, available_tools):
        """生成Python路由器 - 增强版"""
        router_content = f'''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能{cli_name}路由器 - Python版 - 增强版
系统: {self.system}
可用工具: {list(available_tools.keys())}
检测方式: npm包管理器 + 命令行双重检测
"""

import sys
import subprocess
import re
import os

class SmartRouter:
    def __init__(self):
        self.cli_name = "{cli_name}"
        self.available_tools = {repr(available_tools)}
        self.tools = {repr({k: v for k, v in self.config["tools"].items() if k in available_tools and v.get("installed", True)})}
        self.route_keywords = {repr(self.config["route_keywords"])}
        self.default_tool = "{self.config["default_tool"]}"

    def should_route(self, user_input):
        """检查是否需要智能路由"""
        return any(keyword.lower() in user_input.lower() for keyword in self.route_keywords)

    def smart_route(self, user_input):
        """智能路由到合适的工具"""
        user_input = user_input.strip()

        # 检测工具关键词
        for tool_name, tool_info in self.tools.items():
            for keyword in tool_info["keywords"]:
                if keyword.lower() in user_input.lower():
                    # 提取参数
                    clean_input = re.sub(rf'.*{{keyword}}\\s*', '', user_input, flags=re.IGNORECASE).strip()
                    clean_input = re.sub(r'^(用|帮我|请|麻烦|给我|帮我写|帮我生成)\\s*', '', clean_input, flags=re.IGNORECASE).strip()
                    return tool_name, [clean_input] if clean_input else []

        # 默认路由
        clean_input = re.sub(r'^(用|帮我|请|麻烦|给我|帮我写|帮我生成)\\s*', '', user_input, flags=re.IGNORECASE).strip()
        return self.default_tool, [clean_input] if clean_input else []

    def execute_tool(self, tool_name, args):
        """执行工具"""
        if tool_name not in self.tools:
            return 1, "", f"未知工具: {{tool_name}}"

        tool_info = self.tools[tool_name]
        command = tool_info["command"]["{self.system}"]

        if tool_info.get("wrapper"):
            wrapper_script = tool_info.get("wrapper_script")
            cmd = ["python", wrapper_script] + args
        else:
            cmd = [command] + args

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', timeout=60)
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return -1, "", f"执行失败: {{e}}"

    def execute_original_cli(self, args):
        """执行原始CLI"""
        try:
            cmd = ["{cli_name}"] + args
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return -1, "", f"原始CLI执行失败: {{e}}"

def main():
    router = SmartRouter()

    if len(sys.argv) < 2:
        print("🎯 智能{{cli_name}}路由器 - Python版 - 增强版")
        print("💡 原始功能: python smart_{cli_name}.py '参数'")
        print("🤖 智能路由示例:")
'''

        # 添加可用工具示例
        for tool_name in sorted(available_tools.keys(), 
                              key=lambda x: self.config["tools"][x].get("priority", 99) if x in self.config["tools"] else 99):
            if available_tools[tool_name] and tool_name in self.config["tools"]:
                keywords = self.config["tools"][tool_name]["keywords"]
                router_content += f'''        print("    python smart_{cli_name}.py '用{keywords[0]}写代码'")
'''

        router_content += '''        return 0

    user_input = ' '.join(sys.argv[1:])

    if router.should_route(user_input):
        tool_name, args = router.smart_route(user_input)
        if tool_name and tool_name != router.cli_name:
            print(f"🚀 智能路由到: {{router.tools[tool_name]['description']}}")
            returncode, stdout, stderr = router.execute_tool(tool_name, args)
            if stdout:
                print(stdout)
            if stderr:
                print(stderr, file=sys.stderr)
            sys.exit(returncode)

    # 执行原始CLI
    returncode, stdout, stderr = router.execute_original_cli(sys.argv[1:])
    if stdout:
        print(stdout)
    if stderr:
        print(stderr, file=sys.stderr)
    sys.exit(returncode)

if __name__ == "__main__":
    main()
'''

        return router_content

    def enhanced_setup_environment(self, refresh_after_install=True):
        """增强环境设置"""
        print(f"🚀 开始增强环境设置...")

        # 检测所有工具
        available_tools = self.discover_available_tools()
        
        # 生成所有增强路由器
        formats = self.config.get("output_formats", ["cmd", "powershell", "bash", "python"])
        
        print(f"🔧 为 {len(available_tools)} 个可用工具生成增强路由器...")
        
        for tool_name in available_tools:
            if available_tools[tool_name]:
                print(f"  生成 {tool_name} 路由器...")
                for fmt in formats:
                    try:
                        content = self.generate_smart_router(tool_name, fmt)
                        filename = f"smart_{tool_name}.{fmt if fmt != 'python' else 'py'}"
                        with open(filename, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"    ✅ {filename}")
                    except Exception as e:
                        print(f"    ❌ 生成 {tool_name}.{fmt} 失败: {e}")
        
        print(f"✅ 增强环境设置完成！")
        
        # 保存增强检测报告
        self.save_enhanced_report(available_tools)
    
    def refresh_tools_and_configure(self):
        """刷新工具列表并配置插件 - 用于CLI安装后重新扫描"""
        print("🔄 刷新工具列表...")
        
        # 强制重新扫描所有工具
        refreshed_tools = self.discover_available_tools(force_rescan=True)
        
        print(f"🔧 发现 {len(refreshed_tools)} 个工具，配置插件...")
        
        # 重新配置插件/路由器
        formats = self.config.get("output_formats", ["cmd", "powershell", "bash", "python"])
        
        for tool_name in refreshed_tools:
            if refreshed_tools[tool_name]:
                print(f"  为新安装的 {tool_name} 配置插件...")
                for fmt in formats:
                    try:
                        content = self.generate_smart_router(tool_name, fmt)
                        filename = f"smart_{tool_name}.{fmt if fmt != 'python' else 'py'}"
                        with open(filename, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"    ✅ {filename}")
                    except Exception as e:
                        print(f"    ❌ 配置 {tool_name}.{fmt} 失败: {e}")
        
        print("✅ 插件配置完成！")
        return refreshed_tools

    def save_enhanced_report(self, available_tools):
        """保存增强检测报告"""
        report = {
            "timestamp": str(Path.cwd()),
            "system": self.system,
            "config_file": self.config_file,
            "enhanced_detection": True,
            "available_tools": available_tools,
            "setup_directory": str(self.setup_dir),
            "detected_using_npm": [tool for tool, available in available_tools.items() if available],
            "enhancement_features": [
                "npm package detection",
                "dual detection mechanism",
                "enhanced routers generation",
                "improved accuracy"
            ]
        }

        report_file = self.setup_dir / "enhanced_setup_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        print(f"📊 增强检测报告已保存: {report_file}")


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="增强版通用CLI智能路由自动化部署脚本")
    parser.add_argument("--setup", action="store_true", help="运行增强设置")
    parser.add_argument("--cli", help="指定CLI名称")
    parser.add_argument("--format", choices=["cmd", "powershell", "bash", "python"], default="cmd", help="输出格式")
    parser.add_argument("--all", action="store_true", help="为所有工具生成路由器")
    parser.add_argument("--detect", action="store_true", help="仅运行检测")
    parser.add_argument("--enhanced", action="store_true", help="使用增强检测")
    parser.add_argument("--list-tools", action="store_true", help="列出所有工具")

    args = parser.parse_args()

    setup = EnhancedCLISetup()

    if args.enhanced or args.setup:
        setup.enhanced_setup_environment()
    elif args.detect:
        tools = setup.discover_available_tools()
        print("\n🔍 检测结果:")
        for tool, available in tools.items():
            status = "✅" if available else "❌"
            config = setup.config["tools"].get(tool, {})
            desc = config.get("description", tool)
            print(f"  {status} {tool}: {desc}")
        print(f"\n总计: {sum(1 for v in tools.values() if v)}/{len(tools)} 个工具可用")
    elif args.list_tools:
        print("📋 配置的工具:")
        for tool_name, config in setup.config["tools"].items():
            desc = config.get("description", tool_name)
            npm_pkg = config.get("npm_package", "N/A")
            print(f"  - {tool_name}: {desc} (npm: {npm_pkg})")
    elif args.all:
        available_tools = setup.discover_available_tools()
        formats = setup.config.get("output_formats", ["cmd", "powershell", "bash", "python"])
        
        for tool_name in available_tools:
            if available_tools[tool_name]:
                for fmt in formats:
                    try:
                        content = setup.generate_smart_router(tool_name, fmt)
                        filename = f"smart_{tool_name}.{fmt if fmt != 'python' else 'py'}"
                        with open(filename, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"✅ 生成: {filename}")
                    except Exception as e:
                        print(f"❌ 生成 {tool_name}.{fmt} 失败: {e}")
    elif args.cli:
        try:
            content = setup.generate_smart_router(args.cli, args.format)
            filename = f"smart_{args.cli}.{args.format if args.format != 'python' else 'py'}"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ 智能路由器已创建: {filename}")
            print(f"📝 使用: {filename} '用kimi写代码'")
        except Exception as e:
            print(f"❌ 创建失败: {e}")
    else:
        print("🎯 增强版通用CLI智能路由自动化部署脚本")
        print("💡 使用方法:")
        print("  python enhanced_universal_cli_setup.py --setup          # 运行增强设置")
        print("  python enhanced_universal_cli_setup.py --detect        # 仅检测工具")
        print("  python enhanced_universal_cli_setup.py --cli mytool    # 为特定工具创建路由器")
        print("  python enhanced_universal_cli_setup.py --all           # 为所有工具创建路由器")
        print("  python enhanced_universal_cli_setup.py --list-tools    # 列出所有工具")


if __name__ == "__main__":
    main()