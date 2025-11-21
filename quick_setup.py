#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能CLI路由器 - 快速安装配置方案
最简单直观的安装配置方式，自动探测和设置
"""

import os
import sys
import json
import subprocess
import platform
from pathlib import Path
import tempfile
import shutil


def detect_system():
    """检测操作系统"""
    return platform.system().lower()


def check_npm_packages():
    """快速检测npm全局包"""
    print("🔍 正在检测已安装的CLI工具...")
    
    # 临时文件存储npm输出
    with tempfile.NamedTemporaryFile(mode='w+', delete=False, suffix='.json', encoding='utf-8') as tmp_file:
        temp_filename = tmp_file.name

    try:
        # 使用shell重定向方式运行npm命令
        subprocess.run(f'npm list -g --depth=0 --json > "{temp_filename}"', 
                     shell=True, capture_output=True, timeout=15)
        
        detected_tools = {}
        if os.path.exists(temp_filename):
            with open(temp_filename, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if content:
                    try:
                        packages = json.loads(content)
                        if 'dependencies' in packages:
                            # 按关键词匹配已安装的AI CLI工具
                            ai_keywords = {
                                'claude': ['@anthropic-ai/claude-code', 'claude'],
                                'gemini': ['@google/gemini-cli', 'gemini'],
                                'qwen': ['@qwen-code/qwen-code', 'qwen'],
                                'copilot': ['@github/copilot', 'copilot'],
                                'kimi': ['@jacksontian/kimi-cli', 'kimi'],
                                'codebuddy': ['@tencent-ai/codebuddy-code', 'codebuddy'],
                                'qoder': ['@qoder-ai/qodercli', 'qodercli', 'qoder'],
                                'iflow': ['@iflow-ai/iflow-cli', 'iflow']
                            }
                            
                            for tool_name, patterns in ai_keywords.items():
                                for pkg_name, pkg_info in packages['dependencies'].items():
                                    for pattern in patterns:
                                        if pattern.lower() in pkg_name.lower():
                                            version = pkg_info.get('version', 'unknown')
                                            detected_tools[tool_name] = {
                                                'package': pkg_name,
                                                'version': version,
                                                'installed': True
                                            }
                                            print(f"  ✅ {tool_name}: {version}")
                                            break
                                    if tool_name in detected_tools:
                                        break
                            
                            if not detected_tools:
                                print("  ❌ 未检测到任何AI CLI工具")
                            else:
                                print(f"  📊 共计检测到 {len(detected_tools)} 个工具")
                                
                            return detected_tools
                    except json.JSONDecodeError as e:
                        print(f"  ❌ JSON解析错误: {e}")
        
        return {}
    except Exception as e:
        print(f"  ❌ 检测失败: {e}")
        return {}
    finally:
        if os.path.exists(temp_filename):
            os.unlink(temp_filename)


def generate_simple_router(tools_detected):
    """为检测到的工具生成简单路由器"""
    print("\n⚙️  为检测到的工具生成智能路由器...")
    
    router_template = {
        'cmd': '''@echo off
:: {tool_name} 智能路由器 - 由快速配置生成
:: 版本: {version}
:: 功能: 智能路由到多个AI工具

setlocal enabledelayedexpansion

set "USER_INPUT=%*"

if "%USER_INPUT%"=="" (
    echo 🚀 {tool_name} 智能路由器
    echo 💡 用法: {tool_name}_smart.bat "用{target_tool}帮我写代码"
    echo 🤖 支持路由到: {supported_tools}
    exit /b
)

:: 智能路由逻辑
set "TARGET_TOOL="
set "CLEAN_INPUT=

:: 检测目标工具
echo %USER_INPUT% | findstr /i "claude" >nul && if !errorlevel! equ 0 (set "TARGET_TOOL=claude" & goto clean)
echo %USER_INPUT% | findstr /i "gemini" >nul && if !errorlevel! equ 0 (set "TARGET_TOOL=gemini" & goto clean)
echo %USER_INPUT% | findstr /i "qwen" >nul && if !errorlevel! equ 0 (set "TARGET_TOOL=qwen" & goto clean)
echo %USER_INPUT% | findstr /i "kimi" >nul && if !errorlevel! equ 0 (set "TARGET_TOOL=kimi" & goto clean)
echo %USER_INPUT% | findstr /i "codebuddy" >nul && if !errorlevel! equ 0 (set "TARGET_TOOL=codebuddy" & goto clean)

:clean
:: 清理输入
set "CLEAN_INPUT=%USER_INPUT%"
for %%t in ("claude" "gemini" "qwen" "kimi" "codebuddy") do (
    set "CLEAN_INPUT=!CLEAN_INPUT:%%t=!"
)
set "CLEAN_INPUT=!CLEAN_INPUT:用=!"
set "CLEAN_INPUT=!CLEAN_INPUT:帮我=!"
set "CLEAN_INPUT=!CLEAN_INPUT:请=!"

:: 执行目标工具
if "!TARGET_TOOL!"=="" (
    :: 默认执行原工具
    {tool_name} %USER_INPUT%
) else (
    echo 🚀 智能路由到: !TARGET_TOOL!
    !TARGET_TOOL! "!CLEAN_INPUT!"
)
''',
        'py': '''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
{tool_name} 智能路由器 - 由快速配置生成
版本: {version}
功能: 智能路由到多个AI工具
"""

import sys
import subprocess
import re


def smart_route(user_input):
    """智能路由到合适工具"""
    user_input_lower = user_input.lower()
    
    # 路由规则
    routes = [
        ('claude', ['claude', 'anthropic']),
        ('gemini', ['gemini', 'google']),
        ('qwen', ['qwen', '通义', '阿里']),
        ('kimi', ['kimi', '月之暗面']),
        ('codebuddy', ['codebuddy', '代码']),
        ('copilot', ['copilot', 'github']),
    ]
    
    for target_tool, keywords in routes:
        if any(keyword in user_input_lower for keyword in keywords):
            # 清理输入
            clean_input = user_input
            for keyword in keywords:
                clean_input = clean_input.replace(keyword, '', 1)
            clean_input = re.sub(r'^(用|帮我|请|麻烦)', '', clean_input, flags=re.IGNORECASE).strip()
            return target_tool, clean_input
    
    return '{tool_name}', user_input


def main():
    if len(sys.argv) < 2:
        print("🚀 {tool_name} 智能路由器")
        print("💡 用法: python {tool_name}_smart.py '用qwen帮我写代码'")
        print("🤖 支持路由到: claude, gemini, qwen, kimi, codebuddy, copilot")
        return

    user_input = ' '.join(sys.argv[1:])
    target, clean_input = smart_route(user_input)
    
    if target == '{tool_name}':
        # 使用原工具
        try:
            result = subprocess.run(['{tool_name}', user_input], capture_output=True, text=True)
            print(result.stdout)
            if result.stderr:
                print(result.stderr, file=sys.stderr)
        except FileNotFoundError:
            print(f"❌ 原始 {tool_name} 未找到")
    else:
        # 智能路由
        print(f"🚀 智能路由到: {target}")
        try:
            result = subprocess.run([target, clean_input], capture_output=True, text=True)
            print(result.stdout)
            if result.stderr:
                print(result.stderr, file=sys.stderr)
        except FileNotFoundError:
            print(f"❌ {target} 未找到")


if __name__ == "__main__":
    main()
'''
    }
    
    supported_tools = list(tools_detected.keys())
    
    for tool_name in tools_detected:
        print(f"  🛠️  生成 {tool_name} 路由器...")
        
        # CMD路由器
        cmd_content = router_template['cmd'].format(
            tool_name=tool_name,
            target_tool=supported_tools[0] if supported_tools else tool_name,
            version=tools_detected[tool_name]['version'],
            supported_tools=', '.join(supported_tools)
        )
        cmd_filename = f"{tool_name}_smart.cmd"
        with open(cmd_filename, 'w', encoding='utf-8') as f:
            f.write(cmd_content)
        print(f"    ✅ {cmd_filename}")
        
        # Python路由器
        py_content = router_template['py'].format(
            tool_name=tool_name,
            target_tool=supported_tools[0] if supported_tools else tool_name,
            version=tools_detected[tool_name]['version']
        )
        py_filename = f"{tool_name}_smart.py"
        with open(py_filename, 'w', encoding='utf-8') as f:
            f.write(py_content)
        print(f"    ✅ {py_filename}")


def create_quick_start_guide():
    """创建快速入门指南"""
    guide = """# 智能CLI路由器 - 快速入门指南

## 安装
运行 `python quick_setup.py` 即可自动检测和配置所有已安装的AI CLI工具

## 使用方法

### 1. 基本使用
```bash
# 执行原工具
mycli "原功能参数"

# 智能路由
mycli_smart.cmd "用qwen帮我写代码"
python qwen_smart.py "用gemini解释这段代码"
```

### 2. 路由命令示例
- `"用claude写代码"` -> 自动路由到Claude
- `"让gemini翻译"` -> 自动路由到Gemini  
- `"请qwen分析"` -> 自动路由到Qwen
- `"kimi生成文档"` -> 自动路由到Kimi

### 3. 智能识别
路由器会自动识别以下关键词并路由到相应工具:
- Claude相关: claude, anthropic
- Gemini相关: gemini, google
- Qwen相关: qwen, 通义, 阿里
- Kimi相关: kimi, 月之暗面
- CodeBuddy相关: codebuddy, 代码

## 高级功能
- 无需记住每个工具的具体命令
- 智能清理输入参数
- 支持自然语言指令
- 自动降级到原工具
"""
    
    with open("QUICK_START_GUIDE.md", "w", encoding="utf-8") as f:
        f.write(guide)
    

def main():
    """主要配置流程"""
    print("🚀 智能CLI路由器 - 快速配置向导")
    print("=" * 50)
    
    print("\n🔍 第一步: 检测已安装的AI CLI工具...")
    detected_tools = check_npm_packages()
    
    if not detected_tools:
        print("\n❌ 未检测到任何AI CLI工具")
        print("💡 提示: 请先安装AI CLI工具，然后重新运行此脚本")
        return
    
    print(f"\n⚙️  第二步: 为 {len(detected_tools)} 个工具生成智能路由器...")
    generate_simple_router(detected_tools)
    
    print(f"\n📋 第三步: 创建快速入门指南...")
    create_quick_start_guide()
    
    print(f"\n🎉 配置完成！")
    print("=" * 50)
    print("生成的文件:")
    for tool in detected_tools:
        print(f"  - {tool}_smart.cmd")
        print(f"  - {tool}_smart.py")
    print("  - QUICK_START_GUIDE.md")
    print("\n💡 使用说明:")
    print("  1. 执行路由命令: tool_smart.cmd '用qwen写代码'")
    print("  2. 查看快速指南: QUICK_START_GUIDE.md")


if __name__ == "__main__":
    main()