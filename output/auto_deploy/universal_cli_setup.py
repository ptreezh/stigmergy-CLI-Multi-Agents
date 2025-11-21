#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
通用CLI智能路由自动化部署脚本
可配置、跨平台、自适应不同环境和AI工具
"""

import os
import sys
import json
import platform
import subprocess
import shutil
from pathlib import Path


class UniversalCLISetup:
    """通用CLI设置管理器"""
    
    def __init__(self):
        self.config_file = "cli_config.json"
        self.setup_dir = Path.cwd()
        self.system = platform.system().lower()
        self.config = self.load_or_create_config()
    
    def load_or_create_config(self):
        """加载或创建配置"""
        default_config = {
            "version": "1.0.0",
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
                    "check_command": ["--version"]
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
                    "check_command": ["--version"]
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
                    "check_command": ["--version"]
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
                    "check_command": ["--version"]
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
                    "check_command": ["--version"]
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
                    "check_command": ["--version"]
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
                    "check_command": ["--version"]
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
                    "check_command": ["--version"]
                }
            },
            "route_keywords": ["用", "帮我", "请", "智能", "ai", "写", "生成", "解释", "分析", "翻译", "代码", "文章"],
            "default_tool": "claude",
            "fallback_strategy": "first_available",
            "wrapper_scripts": {
                "kimi_wrapper": "kimi_wrapper.py"
            },
            "output_formats": ["cmd", "powershell", "bash", "python"],
            "install_global": False
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
    
    def discover_available_tools(self):
        """发现可用工具"""
        available = {}
        
        for tool_name, tool_config in self.config["tools"].items():
            command = tool_config["command"][self.system]
            
            # 特殊处理包装器
            if tool_config.get("wrapper") and tool_config.get("wrapper_script"):
                wrapper_path = self.setup_dir / tool_config["wrapper_script"]
                if wrapper_path.exists():
                    available[tool_name] = True
                    continue
            
            # 检查命令可用性
            try:
                if self.system == "windows":
                    result = subprocess.run(["where", command.split()[0]], 
                                          capture_output=True, text=True, timeout=5)
                    available[tool_name] = result.returncode == 0
                else:
                    result = subprocess.run(["which", command], 
                                          capture_output=True, text=True, timeout=5)
                    available[tool_name] = result.returncode == 0
            except:
                available[tool_name] = False
        
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

:: 智能{cli_name}路由器 - 自动生成
:: 系统: {self.system}
:: 可用工具: {list(available_tools.keys())}

set "USER_INPUT=%*"

if "%USER_INPUT%"=="" (
    echo 🎯 智能{cli_name}路由器
    echo 💡 原始功能: {cli_name} [参数]
    echo 🤖 智能路由示例:
'''
        
        # 添加可用工具的路由逻辑
        for tool_name in sorted(available_tools.keys(), key=lambda x: self.config["tools"][x]["priority"]):
            if available_tools[tool_name]:
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
        for tool_name in sorted(available_tools.keys(), key=lambda x: self.config["tools"][x]["priority"]):
            if available_tools[tool_name]:
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
        if default_tool in available_tools:
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
        router_content = f'''# 智能{cli_name}路由器 - PowerShell版本
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
        for tool_name in sorted(available_tools.keys(), key=lambda x: self.config["tools"][x]["priority"]):
            if available_tools[tool_name]:
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
        if default_tool in available_tools:
            command = self.config["tools"][default_tool]["command"][self.system]
            router_content += f'''
    # 默认路由到{self.config["tools"][default_tool]["description"]}
    $cleanInput = $Input
    $cleanInput = $cleanInput -replace "^用", "" -replace "^帮我", "" -replace "^请", "" -replace "^写", "" -replace "^生成", "" -replace "^解释", "" -replace "^分析", "" -replace "^翻译", "" -replace "^代码", "" -replace "^文章", ""
    {command} $cleanInput.Trim()
'''
        else:
            router_content += f'''    # 执行原始{cli_name}
    {cli_name} $Input'''
        
        router_content += '''
}

# 主逻辑
if (-not $UserInput) {{
    Write-Host "🎯 智能{cli_name}路由器 - PowerShell版本"
    Write-Host "💡 原始功能: .\smart_{cli_name}.ps1 '参数'"
    Write-Host "🤖 智能路由示例:"
'''
        
        # 添加可用工具示例
        for tool_name in sorted(available_tools.keys(), key=lambda x: self.config["tools"][x]["priority"]):
            if available_tools[tool_name]:
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
        """生成Bash路由器"""
        router_content = f'''#!/bin/bash
# 智能{cli_name}路由器 - Bash版本
# 系统: {self.system}
# 可用工具: {list(available_tools.keys())}

USER_INPUT="$*"

# 检查是否需要智能路由
if [[ -z "$USER_INPUT" ]]; then
    echo "🎯 智能{cli_name}路由器 - Bash版本"
    echo "💡 原始功能: ./smart_{cli_name}.sh '参数'"
    echo "🤖 智能路由示例:"
'''
        
        # 添加可用工具示例
        for tool_name in sorted(available_tools.keys(), key=lambda x: self.config["tools"][x]["priority"]):
            if available_tools[tool_name]:
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
    done

if [ "$NEEDS_ROUTE" = false ]; then
    # 不需要路由，执行原始命令
    {cli_name} $USER_INPUT
    exit 0
fi

# 智能路由逻辑
'''
        
        # 生成路由逻辑
        for tool_name in sorted(available_tools.keys(), key=lambda x: self.config["tools"][x]["priority"]):
            if available_tools[tool_name]:
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
        if default_tool in available_tools:
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
        """生成Python路由器"""
        router_content = f'''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能{cli_name}路由器 - Python版本
系统: {self.system}
可用工具: {list(available_tools.keys())}
"""

import sys
import subprocess
import re
import os

class SmartRouter:
    def __init__(self):
        self.cli_name = "{cli_name}"
        self.available_tools = {repr(available_tools)}
        self.tools = {repr(self.config["tools"])}
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
            if not self.available_tools.get(tool_name, False):
                continue
                
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
        print("🎯 智能{{cli_name}}路由器 - Python版本")
        print("💡 原始功能: python smart_{cli_name}.py '参数'")
        print("🤖 智能路由示例:")
'''
        
        # 添加可用工具示例
        for tool_name in sorted(available_tools.keys(), key=lambda x: self.config["tools"][x]["priority"]):
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
    
    def setup_environment(self):
        """设置环境"""
        print(f"🔧 正在设置{self.system}环境...")
        
        # 检测并安装依赖
        self._check_python()
        self._check_required_files()
        
        # 创建必要的包装器
        self._create_wrappers()
        
        # 设置PATH（如果需要）
        if self.config.get("install_global", False):
            self._install_global()
    
    def _check_python(self):
        """检查Python环境"""
        try:
            subprocess.run([sys.executable, "--version"], check=True, capture_output=True)
            print("✅ Python环境正常")
        except subprocess.CalledProcessError:
            print("❌ Python环境检查失败")
            sys.exit(1)
    
    def _check_required_files(self):
        """检查必需文件"""
        required_files = self.config.get("wrapper_scripts", {})
        for script_name, script_path in required_files.items():
            if not os.path.exists(script_path):
                print(f"⚠️  缺少必需文件: {script_path}")
                print(f"💡 请确保 {script_path} 存在")
    
    def _create_wrappers(self):
        """创建包装器脚本"""
        for tool_name, tool_config in self.config["tools"].items():
            if tool_config.get("wrapper") and tool_config.get("wrapper_script"):
                script_path = self.setup_dir / tool_config["wrapper_script"]
                if not script_path.exists():
                    self._create_generic_wrapper(tool_name)
    
    def _create_generic_wrapper(self, tool_name):
        """创建通用包装器"""
        wrapper_content = f'''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
{tool_name}通用包装器
"""

import subprocess
import sys

def main():
    if len(sys.argv) < 2:
        print(f"🎯 {tool_name}包装器")
        print("💡 用法: python {tool_name}_wrapper.py '参数'")
        return
    
    user_input = ' '.join(sys.argv[1:])
    
    try:
        # 尝试执行原始{tool_name}
        result = subprocess.run(["{tool_name}", user_input], capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
        return result.returncode
    except Exception as e:
        print(f"❌ {tool_name}执行失败: {{e}}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
'''
        
        script_path = self.setup_dir / f"{tool_name}_wrapper.py"
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(wrapper_content)
        print(f"✅ 创建通用包装器: {script_path}")
    
    def _install_global(self):
        """全局安装"""
        print("🌍 设置全局访问...")
        
        # 这里可以添加全局安装逻辑
        # 例如：复制到系统PATH、创建符号链接等
    
    def save_setup_report(self):
        """保存设置报告"""
        report = {
            "timestamp": str(Path.cwd()),
            "system": self.system,
            "config_file": self.config_file,
            "available_tools": self.discover_available_tools(),
            "setup_directory": str(self.setup_dir),
            "created_files": os.listdir(self.setup_dir)
        }
        
        report_file = self.setup_dir / "setup_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f"📊 设置报告已保存: {report_file}")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="通用CLI智能路由自动化部署脚本")
    parser.add_argument("--setup", action="store_true", help="设置环境")
    parser.add_argument("--cli", help="指定CLI名称")
    parser.add_argument("--format", choices=["cmd", "powershell", "bash", "python"], default="cmd", help="输出格式")
    parser.add_argument("--config", help="配置文件路径")
    parser.add_argument("--list", action="store_true", help="列出可用工具")
    parser.add_argument("--generate", help="生成智能路由器")
    
    args = parser.parse_args()
    
    setup = UniversalCLISetup()
    
    if args.config:
        setup.config_file = args.config
        setup.config = setup.load_or_create_config()
    
    if args.setup:
        setup.setup_environment()
        setup.save_setup_report()
        return
    
    if args.list:
        available = setup.discover_available_tools()
        print(f"🔧 可用工具 ({len(available)}个):")
        for name, available in available.items():
            status = "✅" if available else "❌"
            description = setup.config["tools"][name]["description"]
            print(f"  {status} {name:<10} - {description}")
        return
    
    if args.cli and not args.setup and not args.list:
        try:
            router_content = setup.generate_smart_router(args.cli, args.format)
            filename = f"smart_{args.cli}.{args.format}"
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(router_content)
            
            print(f"✅ 智能路由器已创建: {filename}")
            print(f"📝 使用示例: {filename} '用kimi写代码'")
        except Exception as e:
            print(f"❌ 生成失败: {e}")
        return
    
    parser.print_help()


if __name__ == "__main__":
    main()
