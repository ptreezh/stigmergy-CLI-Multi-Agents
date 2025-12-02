#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
跨平台CLI工具调用脚本
支持Windows、Linux和macOS系统
"""

import subprocess
import sys
import os
import platform

# 已安装的CLI工具列表
AVAILABLE_CLIS = {
    "claude": {"command": "claude", "version": "2.0.37", "description": "Anthropic Claude CLI"},
    "gemini": {"command": "gemini", "version": "0.10.0", "description": "Google Gemini CLI"},
    "qwen": {"command": "qwen", "version": "0.3.0", "description": "Qwen CLI"},
    "iflow": {"command": "iflow", "version": "0.3.9", "description": "iFlow CLI"},
    "codebuddy": {"command": "codebuddy", "version": "2.10.0", "description": "CodeBuddy CLI"},
    "codex": {"command": "codex", "version": "0.63.0", "description": "Codex CLI"},
    "copilot": {"command": "copilot", "version": "0.0.350", "description": "Copilot CLI"}
}

def run_cli_command(cli_name, arguments):
    """
    跨平台运行指定的CLI命令
    
    Args:
        cli_name: CLI工具名称
        arguments: 要传递给CLI的参数列表
        
    Returns:
        subprocess.CompletedProcess对象
    """
    if cli_name not in AVAILABLE_CLIS:
        raise ValueError(f"CLI工具 '{cli_name}' 未找到或未安装")
    
    cli_command = AVAILABLE_CLIS[cli_name]["command"]
    
    # 构建完整的命令
    if isinstance(arguments, str):
        # 在Windows上使用shell=True，在其他系统上分割命令
        if platform.system().lower() == "windows":
            full_command = f"{cli_command} {arguments}"
            return subprocess.run(full_command, shell=True, capture_output=True, text=True, timeout=300)
        else:
            # Linux/macOS系统分割命令
            if arguments.strip():
                cmd_parts = [cli_command] + arguments.split()
            else:
                cmd_parts = [cli_command]
            return subprocess.run(cmd_parts, capture_output=True, text=True, timeout=300)
    else:
        # arguments是列表形式
        cmd_parts = [cli_command] + arguments
        return subprocess.run(cmd_parts, capture_output=True, text=True, timeout=300)

def list_available_tools():
    """列出所有可用的CLI工具"""
    print("已安装的CLI工具:")
    for name, info in AVAILABLE_CLIS.items():
        print(f"  - {name}: {info['description']} (版本 {info['version']})")

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: ai-call <cli_name> [arguments...]")
        print("示例: ai-call claude --version")
        print("示例: ai-call gemini \"分析这段代码\"")
        print("")
        list_available_tools()
        return 1
    
    cli_name = sys.argv[1]
    arguments = sys.argv[2:] if len(sys.argv) > 2 else []
    
    try:
        print(f"正在调用CLI工具: {cli_name}")
        if arguments:
            print(f"参数: {' '.join(arguments)}")
        print("-" * 50)
        
        # 如果arguments是列表且只有一个元素，且该元素包含空格，则将其作为字符串处理
        if len(arguments) == 1 and " " in arguments[0]:
            result = run_cli_command(cli_name, arguments[0])
        else:
            result = run_cli_command(cli_name, arguments)
        
        print(f"返回码: {result.returncode}")
        if result.stdout:
            print("标准输出:")
            print(result.stdout)
        if result.stderr:
            print("错误输出:")
            print(result.stderr)
            
        return result.returncode
    except ValueError as e:
        print(f"错误: {e}")
        list_available_tools()
        return 1
    except subprocess.TimeoutExpired:
        print(f"错误: 命令执行超时")
        return 1
    except Exception as e:
        print(f"错误: 执行命令时出错: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())