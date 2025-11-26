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
from datetime import datetime


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
        """生成CMD路由器 - 支持协作日志记录"""
        router_content = f'''@echo off
setlocal enabledelayedexpansion

:: 智能{cli_name}路由器 - 支持多智能体协作 - 自动生成
:: 系统: {self.system}
:: 可用工具: {list(available_tools.keys())}
:: 支持基于项目规范文档的间接协同（Stigmergy）

set "USER_INPUT=%*"

if "%USER_INPUT%"=="" (
    echo 🎯 智能{cli_name}路由器 - 支持多智能体协作
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

:: 检查项目规范文档是否存在
if not exist "PROJECT_SPEC.json" (
    echo.>{{"project_name": "{cli_name} Collaboration Project", "created_at": "%date% %time%", "status": "active", "tasks": {{}}, "collaboration_history": [], "current_state": {{"active_task": null, "completed_tasks": [], "pending_tasks": []}}}} > PROJECT_SPEC.json
)

:: 记录协作日志的函数（通过临时文件）
:log_collaboration
set "AGENT_NAME=%~1"
set "MESSAGE=%~2"
set "TIMESTAMP=%date% %time%"
echo {{ "timestamp": "!TIMESTAMP!", "agent": "!AGENT_NAME!", "message": "!MESSAGE!" }} >> COLLAB_LOG_TEMP.txt
goto :eof

:: 智能路由检测
echo %USER_INPUT% | findstr /i "{" ".join(self.config["route_keywords"])}" >nul
if %errorlevel% neq 0 (
    :: 不需要路由，执行原始命令
    {cli_name} %USER_INPUT%
    exit /b
)

:: 检查是否需要协作
set "NEEDS_COLLAB=false"
echo %USER_INPUT% | findstr /i "协作 一起 共同 多个 团队 分工 complete project full solution entire task" >nul
if !errorlevel! equ 0 set "NEEDS_COLLAB=true"

if "!NEEDS_COLLAB!" == "true" (
    :: 创建协作任务记录
    echo. > COLLAB_TASK_TEMP.txt
    echo {{ "id": "collab_!random!!random!", "type": "collaboration", "description": "%USER_INPUT%", "status": "pending", "created_at": "%date% %time%" }} >> COLLAB_TASK_TEMP.txt
)

'''

        # 生成路由逻辑
        for tool_name in sorted(available_tools.keys(), key=lambda x: self.config["tools"][x]["priority"]):
            if available_tools[tool_name]:
                keywords = self.config["tools"][tool_name]["keywords"]
                command = self.config["tools"][tool_name]["command"][self.system]

                router_content += f'''
echo %USER_INPUT% | findstr /i "{" ".join(keywords)}" >nul
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

    :: 记录任务执行到项目规范
    call :log_collaboration "{tool_name}" "开始执行任务: !CLEAN_INPUT!"

'''

                if self.config["tools"][tool_name].get("wrapper"):
                    wrapper_script = self.config["tools"][tool_name]["wrapper_script"]
                    router_content += f'''    python {wrapper_script} "!CLEAN_INPUT!"
    set "TASK_RESULT=!ERRORLEVEL!"
'''
                else:
                    router_content += f'''    {command} "!CLEAN_INPUT!"
    set "TASK_RESULT=!ERRORLEVEL!"
'''

                router_content += f'''    :: 更新任务状态到项目规范
    if !TASK_RESULT! equ 0 (
        call :log_collaboration "{tool_name}" "任务成功完成: !CLEAN_INPUT!"
    ) else (
        call :log_collaboration "{tool_name}" "任务执行失败: !CLEAN_INPUT!"
    )

    exit /b
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

:: 记录任务执行到项目规范
call :log_collaboration "{default_tool}" "开始执行默认任务: !CLEAN_INPUT!"

{command} "!CLEAN_INPUT!"
set "TASK_RESULT=!ERRORLEVEL!"

:: 更新任务状态到项目规范
if !TASK_RESULT! equ 0 (
    call :log_collaboration "{default_tool}" "默认任务成功完成: !CLEAN_INPUT!"
) else (
    call :log_collaboration "{default_tool}" "默认任务执行失败: !CLEAN_INPUT!"
)
'''
        else:
            router_content += f'''
:: 执行原始{cli_name}
{cli_name} %USER_INPUT%
'''

        router_content += '''

exit /b

:: 子程序：记录协作日志
:log_collaboration
set "AGENT_NAME=%~1"
set "MESSAGE=%~2"
set "TIMESTAMP=%date% %time%"

:: 读取现有协作历史
set "HISTORY_FILE=PROJECT_SPEC.json"
if exist temp_history.txt del temp_history.txt
for /f "tokens=*" %%a in ('type "%HISTORY_FILE%" 2^>nul ^| findstr /v /c:"\"collaboration_history\":" ^| findstr /v /c:"\[.*\]"') do (
    echo %%a >> temp_history.txt
)

:: 添加新的协作日志
>> "%HISTORY_FILE%" (
    echo,
    echo     "collaboration_history": [
    echo         {{ "timestamp": "!TIMESTAMP!", "agent": "!AGENT_NAME!", "message": "!MESSAGE!" }},
    type temp_history.txt
)

goto :eof
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
        """生成Bash路由器 - 支持协作日志记录"""
        router_content = f'''#!/bin/bash
# 智能{cli_name}路由器 - 支持多智能体协作 - Bash版本
# 系统: {self.system}
# 可用工具: {list(available_tools.keys())}
# 支持基于项目规范文档的间接协同（Stigmergy）

USER_INPUT="$*"

# 检查并创建项目规范文档
if [ ! -f "PROJECT_SPEC.json" ]; then
    CURRENT_TIME=$(date -Iseconds)
    cat > PROJECT_SPEC.json << EOF
{{
  "project_name": "{cli_name} Collaboration Project",
  "created_at": "$CURRENT_TIME",
  "status": "active",
  "tasks": {{}},
  "collaboration_history": [],
  "current_state": {{
    "active_task": null,
    "completed_tasks": [],
    "pending_tasks": []
  }}
}}
EOF
fi

# 记录协作日志函数
log_collaboration() {{
    local agent_name="$1"
    local message="$2"
    local timestamp=$(date -Iseconds)

    # 读取当前规范文档
    local spec_content=$(cat PROJECT_SPEC.json)

    # 创建新的日志条目
    local new_log=$(printf '{{"timestamp": "%s", "agent": "%s", "message": "%s"}}' "$timestamp" "$agent_name" "$message")

    # 简单地追加到协作历史（实际使用时可能需要更复杂的JSON操作）
    echo "记录协作: [$agent_name] $message" >&2
}}

# 检查是否需要智能路由
if [[ -z "$USER_INPUT" ]]; then
    echo "🎯 智能{cli_name}路由器 - 支持多智能体协作"
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

# 检查是否需要协作
NEEDS_COLLAB=false
if [[ "$USER_INPUT" =~ 协作|一起|共同|多个|团队|分工|complete[[:space:]]+project|full[[:space:]]+solution|entire[[:space:]]+task ]]; then
    NEEDS_COLLAB=true

    # 创建协作任务记录
    TASK_ID="collab_$(date +%s)_$RANDOM"
    CURRENT_TIME=$(date -Iseconds)
    echo "创建协作任务: $TASK_ID" >&2

    # 简单地记录到临时文件，实际使用时应更新PROJECT_SPEC.json
    echo "{{\\"id\\": \\"$TASK_ID\\", \\"type\\": \\"collaboration\\", \\"description\\": \\"$USER_INPUT\\", \\"status\\": \\"pending\\", \\"created_at\\": \\"$CURRENT_TIME\\"}}" >> COLLAB_TASKS_TEMP.json 2>/dev/null
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
    {cli_name} "$USER_INPUT"
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

    # 记录任务执行到项目规范
    log_collaboration "{tool_name}" "开始执行任务: $USER_INPUT"

    CLEAN_INPUT=$(echo "$USER_INPUT" | sed 's/{keywords[0]}//g' | sed 's/^用[[:space:]]*//' | sed 's/^帮我[[:space:]]*//' | sed 's/^请[[:space:]]*//' | sed 's/^写[[:space:]]*//' | sed 's/^生成[[:space:]]*//' | sed 's/^解释[[:space:]]*//' | sed 's/^分析[[:space:]]*//' | sed 's/^翻译[[:space:]]*//' | sed 's/^代码[[:space:]]*//' | sed 's/^文章[[:space:]]*//')

    if [ "{self.config["tools"][tool_name].get("wrapper", False)}" = true ]; then
        python {self.config["tools"][tool_name]["wrapper_script"]} "$CLEAN_INPUT"
        TASK_RESULT=$?
    else
        {command} "$CLEAN_INPUT"
        TASK_RESULT=$?
    fi

    # 更新任务状态到项目规范
    if [ $TASK_RESULT -eq 0 ]; then
        log_collaboration "{tool_name}" "任务成功完成: $CLEAN_INPUT"
    else
        log_collaboration "{tool_name}" "任务执行失败: $CLEAN_INPUT"
    fi

    exit $TASK_RESULT
fi
'''

        # 默认路由
        default_tool = self.config["default_tool"]
        if default_tool in available_tools:
            command = self.config["tools"][default_tool]["command"][self.system]
            router_content += f'''
# 默认路由到{self.config["tools"][default_tool]["description"]}
echo "🚀 智能路由到: {self.config["tools"][default_tool]["description"]}"

# 记录任务执行到项目规范
log_collaboration "{default_tool}" "开始执行默认任务: $USER_INPUT"

CLEAN_INPUT=$(echo "$USER_INPUT" | sed 's/^用[[:space:]]*//' | sed 's/^帮我[[:space:]]*//' | sed 's/^请[[:space:]]*//' | sed 's/^写[[:space:]]*//' | sed 's/^生成[[:space:]]*//' | sed 's/^解释[[:space:]]*//' | sed 's/^分析[[:space:]]*//' | sed 's/^翻译[[:space:]]*//' | sed 's/^代码[[:space:]]*//' | sed 's/^文章[[:space:]]*//')

{command} "$CLEAN_INPUT"
TASK_RESULT=$?

# 更新任务状态到项目规范
if [ $TASK_RESULT -eq 0 ]; then
    log_collaboration "{default_tool}" "默认任务成功完成: $CLEAN_INPUT"
else
    log_collaboration "{default_tool}" "默认任务执行失败: $CLEAN_INPUT"
fi

exit $TASK_RESULT
'''
        else:
            router_content += f'''# 执行原始{cli_name}
{cli_name} "$USER_INPUT"
'''

        return router_content
    
    def _generate_python_router(self, cli_name, available_tools):
        """生成Python路由器 - 支持项目背景的间接协同"""
        router_content = f'''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能{cli_name}路由器 - Python版本 - 支持基于背景的间接协同
系统: {self.system}
可用工具: {list(available_tools.keys())}
基于项目目录背景的间接协同（Stigmergy）
"""

import sys
import subprocess
import re
import os
import json
from datetime import datetime
from pathlib import Path

class ProjectContext:
    """项目背景管理器 - 实现Stigmergy机制"""

    def __init__(self, project_path="."):
        self.project_path = Path(project_path)
        self.spec_file = self.project_path / "PROJECT_SPEC.json"
        self.readme_file = self.project_path / "README.md"
        self.tasks_file = self.project_path / "TASKS.md"  # 计划列表
        self.log_file = self.project_path / "COLLABORATION_LOG.md"  # 协作日志
        self.data = self._load_context()

    def _load_context(self):
        """加载项目背景"""
        if self.spec_file.exists():
            with open(self.spec_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            # 创建默认背景
            default_context = {{
                "project_name": "Collaboration Project",
                "created_at": datetime.now().isoformat(),
                "status": "active",
                "current_agents": {{}},
                "tasks": {{}},
                "collaboration_history": [],
                "decisions": [],
                "communication_log": [],
                "current_state": {{
                    "active_task": None,
                    "completed_tasks": [],
                    "pending_tasks": [],
                    "next_scheduled_task": None
                }}
            }}
            self._save_context(default_context)
            return default_context

    def _save_context(self, data=None):
        """保存项目背景"""
        if data:
            self.data = data
        with open(self.spec_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

    def add_collaboration_log(self, message, agent_name=None):
        """添加协作日志到背景"""
        log_entry = {{
            "timestamp": datetime.now().isoformat(),
            "agent": agent_name,
            "message": message
        }}
        self.data["collaboration_history"].append(log_entry)
        self._save_context()

        # 同时写入协作日志文件
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(f"[{{log_entry['timestamp']}}] [{{agent_name}}] {{message}}\\n")

    def update_task_status(self, task_id, status, result=None, completed_by=None):
        """更新任务状态到背景"""
        if task_id in self.data["tasks"]:
            self.data["tasks"][task_id].update({{
                "status": status,
                "completed_at": datetime.now().isoformat() if status == "completed" else None,
                "result": result,
                "completed_by": completed_by
            }})

            if status == "completed":
                self.data["current_state"]["completed_tasks"].append(task_id)
                if task_id in self.data["current_state"]["pending_tasks"]:
                    self.data["current_state"]["pending_tasks"].remove(task_id)

                # 更新任务文件
                self._update_tasks_file()

            self._save_context()

    def _update_tasks_file(self):
        """更新任务列表文件"""
        with open(self.tasks_file, 'w', encoding='utf-8') as f:
            f.write("# 项目任务列表\\n\\n")
            f.write("## 已完成任务\\n")
            for task_id in self.data["current_state"]["completed_tasks"]:
                task = self.data["tasks"].get(task_id, {{}})
                f.write(f"- [x] {{task.get('description', task_id)}} (完成于 {{task.get('completed_at', '')}})\\n")

            f.write("\\n## 待完成任务\\n")
            for task_id in self.data["current_state"]["pending_tasks"]:
                task = self.data["tasks"].get(task_id, {{}})
                f.write(f"- [ ] {{task.get('description', task_id)}}\\n")

    def analyze_context_for_next_action(self):
        """分析背景以决定下一步行动"""
        # 检查是否有未分配的任务
        for task_id, task in self.data["tasks"].items():
            if task["status"] == "pending" and task.get("assigned_to") is None:
                return task_id, task

        # 检查是否有阻塞的任务需要帮助
        # 检查是否有需要审查的任务
        # 检查是否有需要优化的任务
        # 等等...

        return None, None


class SmartRouter:
    def __init__(self):
        self.cli_name = "{cli_name}"
        self.available_tools = {repr(available_tools)}
        self.tools = {repr(self.config["tools"])}
        self.route_keywords = {repr(self.config["route_keywords"])}
        self.default_tool = "{self.config["default_tool"]}"
        # 初始化项目背景
        self.project_context = ProjectContext()

    def should_route(self, user_input):
        """检查是否需要智能路由"""
        return any(keyword.lower() in user_input.lower() for keyword in self.route_keywords)

    def smart_route(self, user_input):
        """智能路由到合适的工具"""
        user_input = user_input.strip()

        # 首先分析当前背景
        next_task_id, next_task = self.project_context.analyze_context_for_next_action()
        if next_task_id and next_task:
            # 根据背景中的任务进行路由，而不是仅根据用户输入
            task_description = next_task["description"]

            # 检测最适合处理此任务的工具
            for tool_name, tool_info in self.tools.items():
                if not self.available_tools.get(tool_name, False):
                    continue

                # 检查任务描述中是否包含工具关键词
                for keyword in tool_info["keywords"]:
                    if keyword.lower() in task_description.lower():
                        # 更新任务分配
                        self.project_context.data["tasks"][next_task_id]["assigned_to"] = tool_name
                        self.project_context._save_context()

                        # 准备执行任务
                        clean_input = re.sub(r'^(用|帮我|请|麻烦|给我|帮我写|帮我生成)\\s*', '', task_description, flags=re.IGNORECASE).strip()
                        return tool_name, [clean_input] if clean_input else []

        # 如果没有待处理任务，按原始方式路由
        for tool_name, tool_info in self.tools.items():
            if not self.available_tools.get(tool_name, False):
                continue

            for keyword in tool_info["keywords"]:
                if keyword.lower() in user_input.lower():
                    # 提取参数
                    clean_input = re.sub(rf'.*{{keyword}}\\s*', '', user_input, flags=re.IGNORECASE).strip()
                    clean_input = re.sub(r'^(用|帮我|请|麻烦|给我|帮我写|帮我生成)\\s*', '', clean_input, flags=re.IGNORECASE).strip()

                    # 分析协作意图（检查是否需要路由到其他工具）
                    target_agent, task_desc = self._analyze_collaboration_intent(clean_input)

                    # 确保这两个变量在所有分支中都定义
                    if target_agent and task_desc:
                        # 检查目标工具是否可用
                        if self._is_tool_available(target_agent):
                            # 目标工具可用，执行协作路由
                            self._create_collaboration_tasks(task_desc, target_agent)
                            return target_agent, [task_desc] if task_desc else []
                        else:
                            # 目标工具不可用，创建挂起任务
                            self._create_suspended_collaboration_tasks(clean_input, tool_name, target_agent)
                            # 返回友好提示 - 使用字符串拼接避免f-string作用域问题
                            message = "目标工具 " + target_agent + " 暂不可用，已记录任务: " + task_desc
                            return tool_name, [message]
                    elif self._needs_collaboration(clean_input):
                        # 检查是否需要协作 - 如果输入包含协作关键词但不是路由语法
                        # 创建协作任务
                        self._create_collaboration_tasks(clean_input, tool_name)

                    return tool_name, [clean_input] if clean_input else []

        # 默认路由
        clean_input = re.sub(r'^(用|帮我|请|麻烦|给我|帮我写|帮我生成)\\s*', '', user_input, flags=re.IGNORECASE).strip()
        return self.default_tool, [clean_input] if clean_input else []

    def _needs_collaboration(self, user_input):
        """检查是否需要协作"""
        collaboration_keywords = ["协作", "一起", "共同", "多个", "团队", "分工", "complete project", "full solution", "entire task"]
        return any(keyword in user_input.lower() for keyword in collaboration_keywords)

    def _analyze_collaboration_intent(self, user_input):
        """分析协作意图 - 检查是否需要路由到其他工具"""
        import re
        patterns = [
            # 让<工具名>帮我<任务>
            r'让\s*([a-zA-Z]+)\s*帮我\s*(.+)',
            # 用<工具名><任务>
            r'用\s*([a-zA-Z]+)\s*(.+)',
            # 请<工具名><任务>
            r'请\s*([a-zA-Z]+)\s*(.+)'
        ]

        for pattern in patterns:
            match = re.search(pattern, user_input, re.IGNORECASE)
            if match:
                target_tool = match.group(1).lower().strip()
                task_desc = match.group(2).strip()

                # 检查目标工具是否在已知工具列表中
                if target_tool in self.tools:
                    return target_tool, task_desc

        return None, None

    def _is_tool_available(self, tool_name):
        """检查工具是否可用"""
        import subprocess
        try:
            # 获取工具命令
            command = self.tools[tool_name]["command"][self.system]
            if isinstance(command, str):
                cmd_parts = command.split()
            else:
                # 如果command是字典，取当前系统的命令
                cmd_parts = command.get(self.system, tool_name).split()

            main_cmd = cmd_parts[0].split('.')[0]  # 只取主命令部分

            # 尝试查找命令
            if self.system == "windows":
                result = subprocess.run(["where", main_cmd],
                                      capture_output=True, text=True, timeout=5)
            else:
                result = subprocess.run(["which", main_cmd],
                                      capture_output=True, text=True, timeout=5)

            return result.returncode == 0
        except:
            return False

    def _create_suspended_collaboration_tasks(self, original_input, initiating_tool, target_agent):
        """创建挂起的协作任务 - 当目标工具不可用时"""
        import time
        task_id = f"suspended_collab_{int(time.time())}_{len(self.project_context.data['tasks'])}"

        task = {
            "id": task_id,
            "type": "collaboration",
            "description": original_input,
            "initiating_tool": initiating_tool,
            "target_tool": target_agent,
            "status": "suspended",  # 挂起状态
            "created_at": datetime.now().isoformat(),
            "assigned_to": target_agent,
            "result": "目标工具 " + target_agent + " 暂不可用，等待可用时自动执行",
            "completed_by": None,
            "completed_at": None
        }

        self.project_context.data["tasks"][task_id] = task
        # 不添加到pending_tasks，因为它暂时无法执行

        # 添加协作日志
        self.project_context.add_collaboration_log(
            "创建挂起协作任务 " + task_id + ": 需要 " + target_agent + "，但工具暂不可用: " + original_input,
            initiating_tool
        )

        self.project_context._save_context()

    def _create_collaboration_tasks(self, user_input, initiating_tool):
        """创建协作任务到项目背景"""
        task_id = f"collab_{int(datetime.now().timestamp())}"

        task = {{
            "id": task_id,
            "type": "collaboration",
            "description": user_input,
            "initiating_tool": initiating_tool,
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "assigned_to": None,  # 由智能体自主认领
            "result": None,
            "completed_by": None,
            "completed_at": None
        }}

        self.project_context.data["tasks"][task_id] = task
        self.project_context.data["current_state"]["pending_tasks"].append(task_id)

        # 记录协作任务创建 - 使用字符串拼接以避免生成代码时的转义问题
        log_msg = "协作任务创建: " + user_input + " (由 " + initiating_tool + " 发起)"
        self.project_context.add_collaboration_log(
            log_msg,
            initiating_tool
        )

        self.project_context._save_context()

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
            # 在执行前记录任务
            task_description = ' '.join(args) if args else "no specific task"
            task_id = "task_" + tool_name + "_" + str(int(datetime.now().timestamp()))
            task = {{
                "id": task_id,
                "type": "execution",
                "description": task_description,
                "initiating_tool": tool_name,
                "status": "in_progress",
                "created_at": datetime.now().isoformat(),
                "assigned_to": tool_name,
                "result": None,
                "completed_by": tool_name,
                "completed_at": None
            }}

            self.project_context.data["tasks"][task_id] = task
            self.project_context.data["current_state"]["active_task"] = task_id
            self.project_context._save_context()

            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', timeout=60)

            # 更新任务状态
            status = "completed" if result.returncode == 0 else "failed"
            self.project_context.update_task_status(task_id, status,
                                                  result.stdout if result.returncode == 0 else result.stderr,
                                                  tool_name)

            # 添加协作日志
            status_str = '成功' if result.returncode == 0 else '失败'
            self.project_context.add_collaboration_log(
                "执行任务 " + task_id + ": " + status_str,
                tool_name
            )

            # 执行后分析背景，检查是否需要其他智能体介入
            self._post_execution_analysis(result.stdout if result.returncode == 0 else result.stderr)

            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            # 记录异常情况
            task_id = "task_" + tool_name + "_" + str(int(datetime.now().timestamp())) + "_error"
            error_task = {{
                "id": task_id,
                "type": "error",
                "description": str(e),
                "initiating_tool": tool_name,
                "status": "failed",
                "created_at": datetime.now().isoformat(),
                "assigned_to": tool_name,
                "result": str(e),
                "completed_by": tool_name,
                "completed_at": datetime.now().isoformat()
            }}

            self.project_context.data["tasks"][task_id] = error_task
            self.project_context.update_task_status(task_id, "failed", str(e), tool_name)

            return -1, "", "执行失败: " + str(e)

    def _post_execution_analysis(self, result):
        """执行后分析背景 - 检查是否需要其他智能体介入"""
        # 检查结果中是否包含需要其他智能体处理的内容
        if "code" in result.lower() and "test" in result.lower():
            # 需要测试智能体介入
            task_id = "followup_test_" + str(int(datetime.now().timestamp()))
            task = {{
                "id": task_id,
                "type": "testing",
                "description": "为代码生成测试: " + result[:200] + "...",
                "initiating_tool": self.cli_name,
                "status": "pending",
                "created_at": datetime.now().isoformat(),
                "assigned_to": "codebuddy",  # 或其他测试相关的智能体
                "result": None,
                "completed_by": None,
                "completed_at": None
            }}

            self.project_context.data["tasks"][task_id] = task
            self.project_context.data["current_state"]["pending_tasks"].append(task_id)
            self.project_context.add_collaboration_log(
                "创建后续任务 " + task_id + ": 需要为结果生成测试",
                self.cli_name
            )
            self.project_context._save_context()

    def execute_original_cli(self, args):
        """执行原始CLI"""
        try:
            cmd = ["{cli_name}"] + args
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return -1, "", "原始CLI执行失败: " + str(e)

def main():
    router = SmartRouter()

    if len(sys.argv) < 2:
        print("🎯 智能{{cli_name}}路由器 - Python版本 - 基于背景的间接协同")
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
            print("🚀 智能路由到: " + router.tools[tool_name]['description'])
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
