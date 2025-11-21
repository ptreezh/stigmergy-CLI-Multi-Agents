#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能CLI路由器 - 一键安装配置工具（无警告版）
最简单直观的安装方案
"""

import os
import json
import subprocess
import tempfile


def detect_tools():
    """检测已安装的工具"""
    print("🔍 正在检测已安装的AI CLI工具...")
    
    # 临时文件存储npm输出
    temp_file = tempfile.mktemp(suffix='.json')
    
    try:
        # 获取全局npm包列表
        subprocess.run('npm list -g --depth=0 --json > "{}"'.format(temp_file), 
                     shell=True, capture_output=True, timeout=15)
        
        detected = {}
        
        if os.path.exists(temp_file):
            with open(temp_file, 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                    
                    # 关键字映射
                    keywords = {
                        'claude': ['@anthropic-ai/claude-code'],
                        'gemini': ['@google/gemini-cli'],
                        'qwen': ['@qwen-code/qwen-code'], 
                        'copilot': ['@github/copilot'],
                        'kimi': ['@jacksontian/kimi-cli'],
                        'codebuddy': ['@tencent-ai/codebuddy-code'],
                        'qoder': ['@qoder-ai/qodercli'],
                        'iflow': ['@iflow-ai/iflow-cli']
                    }
                    
                    for pkg_name, pkg_info in data.get('dependencies', {}).items():
                        for tool_name, patterns in keywords.items():
                            for pattern in patterns:
                                if pattern.lower() in pkg_name.lower():
                                    version = pkg_info.get('version', 'unknown')
                                    detected[tool_name] = version
                                    print(f"  ✅ {tool_name}: {version}")
                                    break
                            
                    print(f"  📊 总计发现 {len(detected)} 个工具")
                    return detected
                    
                except json.JSONDecodeError:
                    print("  ❌ JSON解析失败")
                    return {}
    except Exception as e:
        print(f"  ❌ 检测失败: {e}")
        return {}
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)


def create_router(tool_name, version):
    """为单个工具创建路由器"""
    print(f"  🛠️  为 {tool_name} 创建路由器...")
    
    # 简单的CMD路由器 - 固定转义字符，避免警告
    cmd_content = '''@echo off
:: {0} 智能路由器 - 简化版
:: 版本: {1}

set "INPUT=%*"

if "%INPUT%"=="" (
    echo 🚀 {0} 简化路由器
    echo 💡 用法: {0}_smart "用其他工具帮我..."
    exit /b
)

:: 简单路由判断
set "ROUTE_TARGET="
set "CLEAN_INPUT=%INPUT%"

:: 检测路由目标
for %%t in (claude gemini qwen kimi codebuddy qoder iflow copilot) do (
    echo %INPUT% | findstr /i "%%t" >nul
    if %errorlevel% equ 0 (
        set "ROUTE_TARGET=%%t"
        goto route_to_target
    )
)

:route_to_target
if defined ROUTE_TARGET (
    echo 🚀 路由到: %ROUTE_TARGET%
    set "CLEAN_INPUT=%INPUT: %ROUTE_TARGET% =%"
    %ROUTE_TARGET% "%CLEAN_INPUT%"
) else (
    {0} %INPUT%
)
'''.format(tool_name, version)

    # 简单的Python路由器 - 固定转义字符
    py_content = '''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
{0} 智能路由器 - 简化版
版本: {1}
"""

import sys
import subprocess

def smart_route():
    if len(sys.argv) < 2:
        print("🚀 {0} 简化路由器")
        print("💡 用法: python {0}_smart.py \\"用其他工具帮我...\\"")
        return

    user_input = " ".join(sys.argv[1:])
    
    # 路由目标
    targets = ["claude", "gemini", "qwen", "kimi", "codebuddy", "qoder", "iflow", "copilot"]
    
    for target in targets:
        if target.lower() in user_input.lower():
            # 清理输入
            clean_input = user_input.replace(target, "", 1).strip()
            clean_input = clean_input.replace("用", "").replace("帮我", "").strip()
            
            print("🚀 路由到: {{0}}".format(target))
            try:
                subprocess.run([target, clean_input])
            except FileNotFoundError:
                print("❌ {{0}} 未找到".format(target))
            return
    
    # 默认执行原工具
    try:
        subprocess.run(["{0}", user_input])
    except FileNotFoundError:
        print("❌ {0} 未找到")

if __name__ == "__main__":
    smart_route()
'''.format(tool_name, version)

    # 生成文件
    with open(f"{tool_name}_smart.cmd", 'w', encoding='utf-8') as f:
        f.write(cmd_content)
    
    with open(f"{tool_name}_smart.py", 'w', encoding='utf-8') as f:
        f.write(py_content)
    
    print(f"    ✅ 创建: {tool_name}_smart.cmd, {tool_name}_smart.py")


def main():
    """主函数"""
    print("🚀 智能CLI路由器 - 一键安装配置工具（无警告版）")
    print("=" * 50)
    
    # 检测工具
    tools = detect_tools()
    
    if not tools:
        print("\n❌ 未检测到AI CLI工具")
        return
    
    # 为每个工具创建路由器
    print(f"\n⚙️  为 {len(tools)} 个工具创建智能路由器...")
    for tool_name, version in tools.items():
        create_router(tool_name, version)
    
    # 创建说明
    readme = """# 快速使用说明

## 使用方法

### CMD路由器
```
qwen_smart.cmd "用gemini帮我翻译"
claude_smart.cmd "让kimi帮我写代码"
```

### Python路由器  
```
python qwen_smart.py "用gemini解释这段代码"
python claude_smart.py "让kimi生成文档"
```

## 路由规则
- 系统会自动识别命令中的工具名并路由到相应工具
- 如果没有识别到特定工具，会使用原始工具执行
"""
    
    with open("QUICK_USAGE.md", 'w', encoding='utf-8') as f:
        f.write(readme)
    
    print(f"\n🎉 配置完成！")
    print(f"📋 创建了 {len(tools)*2+1} 个文件:")
    for tool in tools:
        print(f"  - {tool}_smart.cmd")
        print(f"  - {tool}_smart.py")
    print("  - QUICK_USAGE.md")
    
    print("\n💡 提示: 直接运行生成的路由器文件即可使用智能路由功能")


if __name__ == "__main__":
    main()