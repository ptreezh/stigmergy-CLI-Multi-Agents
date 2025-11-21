#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能路由器创建器 - 简化版
"""

import os
import sys


def create_smart_router(cli_name, output_format="cmd"):
    """创建智能路由器"""
    
    # 基础配置
    tools = {
        "claude": {"cmd": "claude.cmd", "keywords": ["claude", "anthropic"], "priority": 1},
        "gemini": {"cmd": "gemini.cmd", "keywords": ["gemini", "google", "谷歌"], "priority": 2},
        "kimi": {"cmd": "kimi_wrapper", "keywords": ["kimi", "月之暗面"], "priority": 3, "wrapper": True},
        "qwen": {"cmd": "qwen.cmd", "keywords": ["qwen", "通义", "阿里"], "priority": 4},
        "ollama": {"cmd": "ollama", "keywords": ["ollama", "本地", "离线"], "priority": 5},
        "codebuddy": {"cmd": "codebuddy", "keywords": ["codebuddy", "代码助手", "编程"], "priority": 6},
        "qodercli": {"cmd": "qodercli", "keywords": ["qodercli", "代码生成", "编程"], "priority": 7},
        "iflow": {"cmd": "iflow", "keywords": ["iflow", "智能", "助手", "心流"], "priority": 8}
    }
    
    route_keywords = ["用", "帮我", "请", "智能", "ai", "写", "生成", "解释", "分析", "翻译", "代码", "文章"]
    default_tool = "claude"
    
    if output_format == "cmd":
        return _create_cmd_router(cli_name, tools)
    elif output_format == "powershell":
        return _create_powershell_router(cli_name, tools)
    elif output_format == "python":
        return _create_python_router(cli_name, tools)
    else:
        raise ValueError(f"不支持的格式: {output_format}")


def _create_cmd_router(cli_name, tools):
    """创建CMD路由器"""
    content = f'''@echo off
setlocal enabledelayedexpansion

:: 智能{cli_name}路由器

set "USER_INPUT=%*"

if "%USER_INPUT%"=="" (
    echo 🎯 智能{cli_name}路由器
    echo 💡 用法: smart_{cli_name}.bat '用kimi写代码'
    exit /b
)

:: 检测路由关键词
echo %USER_INPUT% | findstr /i "用 帮我 请 智能 ai 写 生成 解释 分析 翻译 代码 文章" >nul
if !errorlevel! equ 0 (
    {cli_name} %USER_INPUT%
    exit /b
)

'''
    
    # 按优先级生成路由逻辑
    router_content = ""
    for tool_name, tool_info in sorted(tools.items(), key=lambda x: x[1]["priority"]):
        keywords = tool_info["keywords"]
        command = tool_info["cmd"]
        
        for keyword in keywords:
            content = f'''echo %USER_INPUT% | findstr /i "{keyword}" >nul
if !errorlevel! equ 0 (
    echo 🚀 智能路由到: {tool_name}
    set "CLEAN_INPUT=!USER_INPUT!"
'''
            
            # 清理输入
            for clean_word in ["用", "帮我", "请", "写", "生成", "解释", "分析", "翻译", "代码", "文章"]:
                content += f'''    set "CLEAN_INPUT=!CLEAN_INPUT:{clean_word}=!"
'''
            
            content += f'''    '''
            
            if tool_info.get("wrapper"):
                content += '''    python kimi_wrapper.py "!CLEAN_INPUT!"'''
            else:
                content += f'''    {command} "!CLEAN_INPUT!"'''
            
            content += '''
    exit /b
)
'''
            
            router_content += content
    
    return content + router_content


def _create_powershell_router(cli_name, tools):
    """创建PowerShell路由器"""
    content = f'''# 智能{cli_name}路由器 - PowerShell版本

param(
    [string]$UserInput = ""
)

function SmartRoute {{
    param([string]$Input)
    $routeKeywords = @("用", "帮我", "请", "智能", "ai", "写", "生成", "解释", "analysis", "translate", "code", "article")
    
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
    
    for tool_name, tool_info in sorted(tools.items(), key=lambda x: x[1]["priority"]):
        keywords = tool_info["keywords"]
        command = tool_info["cmd"]
        
        content += f'''    if ($Input -like "*{keywords[0]}*") {{
        Write-Host "🚀 智能路由到: {tool_name}"
        $cleanInput = $Input
'''
        
        for keyword in keywords:
            content += f'''        $cleanInput = $cleanInput -replace "{keyword}", ""'''
        
        content += f'''        $cleanInput = $cleanInput -replace "^用", "" -replace "^帮我", "" -replace "^请", "" -replace "^写", "" -replace "^生成", "" -replace "^解释", "" -replace "^分析", "" -replace "^翻译", "" -replace "^代码", "" -replace "^文章", ""
'''
        
        if tool_info.get("wrapper"):
            content += '''        python kimi_wrapper.py $cleanInput.Trim()'''
        else:
            content += f'''        {command} $cleanInput.Trim()'''
        
        content += '''
        return
    }
'''
    
    # 默认路由
    default_tool = "claude"
    if default_tool in tools:
        command = tools[default_tool]["cmd"]
        content += f'''    # 默认路由到{tools[default_tool]["description"]}
    $cleanInput = $Input
    $cleanInput = $cleanInput -replace "^用", "" -replace "^帮我", "" -replace "^请", "" -replace "^写", "" -replace "^生成", "" -replace "^解释", "" -replace "^分析", "" -replace "^翻译", "" -replace "^代码", "" -replace "^文章", ""
    {command} $cleanInput.Trim()
'''
    else:
        content += f'''    # 执行原始{cli_name}
    {cli_name} $Input'''
    
    content += '''
}

# 主逻辑
if (-not $UserInput) {{
    Write-Host "🎯 智能{cli_name}路由器 - PowerShell版本"
    Write-Host "💡 用法: .\smart_{cli_name}.ps1 '用kimi写代码'"
    exit
}}

if (SmartRoute $UserInput) {{
    Route-ToTool $UserInput
}} else {{
    {cli_name} $UserInput
}}
'''
        
    return content


def _create_python_router(cli_name, tools):
    """创建Python路由器"""
    content = f'''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能{cli_name}路由器 - Python版本
"""

import sys
import subprocess
import re

class SmartRouter:
    def __init__(self):
        self.cli_name = "{cli_name}"
        self.tools = {repr(tools)}
        self.route_keywords = ["用", "帮我", "请", "智能", "ai", "写", "生成", "解释", "分析", "翻译", "代码", "文章"]
        self.default_tool = "claude"
    
    def should_route(self, user_input):
        return any(keyword.lower() in user_input.lower() for keyword in self.route_keywords)
    
    def smart_route(self, user_input):
        user_input = user_input.strip()
        
        for tool_name, tool_info in self.tools.items():
            for keyword in tool_info["keywords"]:
                if keyword.lower() in user_input.lower():
                    clean_input = user_input.replace(keyword, "", 1).strip()
                    clean_input = re.sub(r'^(用|帮我|请|麻烦|给我|帮我写|帮我生成)\\s*', '', clean_input, flags=re.IGNORECASE).strip()
                    return tool_name, [clean_input] if clean_input else []
        
        clean_input = re.sub(r'^(用|帮我|请|麻烦|给我|帮我写|帮我生成)\\s*', '', user_input, flags=re.IGNORECASE).strip()
        return self.default_tool, [clean_input] if clean_input else []
    
    def execute_tool(self, tool_name, args):
        if tool_name not in self.tools:
            return 1, "", f"未知工具: {{tool_name}}"
        
        tool_info = self.tools[tool_name]
        command = tool_info["cmd"]
        
        if tool_info.get("wrapper"):
            cmd = ["python", "kimi_wrapper.py"] + args
        else:
            cmd = [command] + args
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', timeout=60)
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return -1, "", f"执行失败: {{e}}"
    
    def execute_original_cli(self, args):
        try:
            cmd = ["{cli_name}"] + args
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return -1, "", f"原始CLI执行失败: {{e}}"

def main():
    router = SmartRouter()
    
    if len(sys.argv) < 2:
        print("🎯 智能{cli_name}路由器 - Python版本")
        print("💡 用法: python smart_{cli_name}.py '用kimi写代码'")
        return
    
    user_input = ' '.join(sys.argv[1:])
    
    if router.should_route(user_input):
        tool_name, args = router.smart_route(user_input)
        if tool_name and tool_name != router.cli_name:
            print(f"🚀 智能路由到: {{tool_name}}")
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
        
    return content


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="智能路由器创建器")
    parser.add_argument("--cli", help="指定CLI名称")
    parser.add_argument("--format", choices=["cmd", "powershell", "python"], default="cmd", help="输出格式")
    parser.add_argument("--all", help="为所有工具创建路由器")
    
    args = parser.parse_args()
    
    if args.all:
        tools = ["claude", "gemini", "kimi", "qwen", "ollama", "codebuddy", "qodercli", "iflow"]
        for tool in tools:
            try:
                content = create_smart_router(tool, args.format)
                filename = f"smart_{tool}.bat"
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ 创建: {filename}")
            except Exception as e:
                print(f"❌ 创建 {tool} 失败: {e}")
        return
    
    if args.cli:
        try:
            content = create_smart_router(args.cli, args.format)
            filename = f"smart_{args.cli}.{args.format}"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ 智能路由器已创建: {filename}")
            print(f"📝 使用: {filename} '用kimi写代码'")
        except Exception as e:
            print(f"❌ 创建失败: {e}")
    
    else:
        print("🎯 智能路由器创建器")
        print("\n使用方法:")
        print("  python smart_router_creator.py --cli mytool cmd")
        print("  python smart_router_creator.py --cli mytool powershell")
        print("  python smart_router_creator.py --all")
        print("\n支持的CLI工具:")
        print("  claude, gemini, kimi, qwen, ollama, codebuddy, qodercli, iflow")


if __name__ == "__main__":
    main()
