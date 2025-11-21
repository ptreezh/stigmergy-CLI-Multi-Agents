#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能CLI路由器 - 安装向导
最简单直观的一键安装配置方案
"""

import os
import sys
import json
import subprocess
import platform
import tempfile
from pathlib import Path


def detect_installed_tools():
    """检测已安装的工具"""
    print("🔍 正在检测已安装的AI CLI工具...")
    
    # 创建临时文件存储npm输出
    temp_file = tempfile.mktemp(suffix='.json')
    
    try:
        # 获取npm全局包列表
        subprocess.run(f'npm list -g --depth=0 --json > "{temp_file}"', 
                     shell=True, capture_output=True, timeout=15)
        
        detected_tools = {}
        
        if os.path.exists(temp_file):
            with open(temp_file, 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                    
                    # 定义AI工具包映射
                    tool_mappings = {
                        '@anthropic-ai/claude-code': 'claude',
                        '@google/gemini-cli': 'gemini', 
                        '@qwen-code/qwen-code': 'qwen',
                        '@github/copilot': 'copilot',
                        '@jacksontian/kimi-cli': 'kimi',
                        '@tencent-ai/codebuddy-code': 'codebuddy',
                        '@qoder-ai/qodercli': 'qoder',
                        '@iflow-ai/iflow-cli': 'iflow'
                    }
                    
                    for pkg_name, pkg_info in data.get('dependencies', {}).items():
                        for npm_pattern, tool_name in tool_mappings.items():
                            if npm_pattern in pkg_name.lower():
                                version = pkg_info.get('version', 'unknown')
                                detected_tools[tool_name] = {
                                    'version': version,
                                    'package': pkg_name
                                }
                                print(f"  ✅ {tool_name}: {version}")
                                break
                    
                    print(f"  📊 总计检测到 {len(detected_tools)} 个AI工具")
                    return detected_tools
                    
                except json.JSONDecodeError:
                    print("  ❌ 无法解析npm输出")
                    return {}
    except Exception as e:
        print(f"  ❌ 检测失败: {e}")
        return {}
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)


def create_smart_routers(detected_tools):
    """为检测到的工具创建智能路由器"""
    print(f"\n🚀 为 {len(detected_tools)} 个工具创建智能路由器...")
    
    # CMD路由器模板
    cmd_router = '''@echo off
setlocal enabledelayedexpansion

:: {tool_name} 智能路由器 - 一键配置版
set "USER_INPUT=%*"

if "%USER_INPUT%"=="" (
    echo 🚀 {tool_name} 智能路由器 - 一键配置版
    echo 💡 用法: {tool_name}_smart "用qwen帮我写代码"
    exit /b
)

:: 简单路由逻辑
set "ROUTE_TO="

:: 检测路由关键字
for %%t in (claude gemini qwen kimi codebuddy qoder iflow copilot ollama) do (
    echo %USER_INPUT% | findstr /i "%%t" >nul
    if !errorlevel! equ 0 (
        set "ROUTE_TO=%%t"
        goto execute
    )
)

:execute
if defined ROUTE_TO (
    echo 🚀 智能路由到: !ROUTE_TO!
    set "CLEAN_INPUT=%USER_INPUT: !ROUTE_TO! =%"
    set "CLEAN_INPUT=!CLEAN_INPUT:用=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:帮我=!"
    set "CLEAN_INPUT=!CLEAN_INPUT:请=!"
    !ROUTE_TO! "!CLEAN_INPUT!"
) else (
    {tool_name} %USER_INPUT%
)
'''
    
    # Python路由器模板  
    py_router = '''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
{tool_name} 智能路由器 - 一键配置版
"""

import sys
import subprocess
import re


def main():
    if len(sys.argv) < 2:
        print("🚀 {tool_name} 智能路由器 - 一键配置版")
        print("💡 用法: python {tool_name}_smart.py '用qwen帮我写代码'")
        return

    user_input = ' '.join(sys.argv[1:])
    
    # 检测路由目标
    route_targets = ['claude', 'gemini', 'qwen', 'kimi', 'codebuddy', 'qoder', 'iflow', 'copilot', 'ollama']
    
    for target in route_targets:
        if target.lower() in user_input.lower():
            # 清理输入
            clean_input = re.sub(target, '', user_input, flags=re.IGNORECASE)
            clean_input = re.sub(r'^(用|帮我|请|麻烦)', '', clean_input, flags=re.IGNORECASE).strip()
            
            print(f"🚀 智能路由到: {target}")
            try:
                result = subprocess.run([target, clean_input], capture_output=True, text=True)
                print(result.stdout)
                if result.stderr:
                    print(result.stderr, file=sys.stderr)
            except FileNotFoundError:
                print(f"❌ {target} 未找到")
            return
    
    # 默认执行原工具
    try:
        result = subprocess.run(['{tool_name}', user_input], capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
    except FileNotFoundError:
        print(f"❌ 原始 {tool_name} 未找到")


if __name__ == "__main__":
    main()
'''
    
    for tool_name in detected_tools:
        print(f"  🛠️  生成 {tool_name} 路由器...")
        
        # 生成CMD路由器
        cmd_content = cmd_router.format(tool_name=tool_name)
        cmd_file = f"{tool_name}_smart.cmd"
        with open(cmd_file, 'w', encoding='utf-8') as f:
            f.write(cmd_content)
        print(f"    ✅ {cmd_file}")
        
        # 生成Python路由器
        py_content = py_router.format(tool_name=tool_name)
        py_file = f"{tool_name}_smart.py"
        with open(py_file, 'w', encoding='utf-8') as f:
            f.write(py_content)
        print(f"    ✅ {py_file}")


def create_quick_start_guide():
    """创建使用指南"""
    guide = """# 智能CLI路由器 - 一键配置版

## 安装
运行 `python install_wizard.py` 自动检测和配置您的AI CLI工具

## 使用方法

### 1. 智能路由命令
```bash
# 使用智能路由功能
qwen_smart.cmd "用gemini帮我翻译这段文字"
python claude_smart.py "让kimi帮我写代码"

# 系统会自动识别关键词并路由到相应工具
```

### 2. 路由规则
路由器会自动识别以下关键词并路由到相应工具：
- claude, anthropic → Claude
- gemini, google → Gemini
- qwen, 通义, 阿里 → Qwen
- kimi, 月之暗面 → Kimi
- codebuddy, 代码助手 → CodeBuddy
- copilot, github → Copilot
- qoder, qodercli → Qoder
- iflow, 心流 → iFlow

### 3. 优势
- ✨ 无需记忆复杂的命令
- 🚀 智能路由到最合适的工具
- 🎯 自然语言指令
- ⚡ 快速一键配置
"""
    
    with open("ONE_CLICK_INSTALL_GUIDE.md", 'w', encoding='utf-8') as f:
        f.write(guide)
    
    print("  📋 创建使用指南: ONE_CLICK_INSTALL_GUIDE.md")


def main():
    """主要流程"""
    print("🚀 智能CLI路由器 - 一键安装配置向导")
    print("=" * 50)
    
    # 检测工具
    detected_tools = detect_installed_tools()
    
    if not detected_tools:
        print("\n❌ 未检测到任何AI CLI工具")
        print("💡 提示: 请先安装AI CLI工具（如通过npm install -g），然后重新运行")
        return
    
    # 创建路由器
    create_smart_routers(detected_tools)
    
    # 创建指南
    create_quick_start_guide()
    
    print(f"\n🎉 配置完成！共为 {len(detected_tools)} 个工具创建了智能路由器")
    print("=" * 50)
    print("📁 生成的文件:")
    for tool in detected_tools:
        print(f"   - {tool}_smart.cmd")
        print(f"   - {tool}_smart.py")
    print("   - ONE_CLICK_INSTALL_GUIDE.md")
    
    print("\n💡 使用说明:")
    print("   直接运行生成的路由器文件，如: qwen_smart.cmd '用kimi写代码'")


if __name__ == "__main__":
    main()