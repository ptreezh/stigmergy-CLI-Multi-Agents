#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gemini CLI 跨工具调用演示脚本
展示如何通过shell调用其他已安装的CLI工具
"""

import subprocess
import sys
import json
from typing import Dict, Any

# 已安装的CLI工具列表
AVAILABLE_CLIS = {
    "claude": {"command": "claude", "version": "2.0.37"},
    "qwen": {"command": "qwen", "version": "0.3.0"},
    "iflow": {"command": "iflow", "version": "0.3.9"},
    "codebuddy": {"command": "codebuddy", "version": "2.10.0"},
    "codex": {"command": "codex", "version": "0.63.0"},
    "copilot": {"command": "copilot", "version": "0.0.350"}
}

def run_cli_command(cli_name: str, arguments: str) -> Dict[str, Any]:
    """
    通过shell运行指定的CLI命令
    
    Args:
        cli_name: CLI工具名称
        arguments: 要传递给CLI的参数
        
    Returns:
        包含执行结果的字典
    """
    if cli_name not in AVAILABLE_CLIS:
        return {
            "success": False,
            "error": f"CLI工具 '{cli_name}' 未找到或未安装",
            "available_tools": list(AVAILABLE_CLIS.keys())
        }
    
    cli_command = AVAILABLE_CLIS[cli_name]["command"]
    full_command = f"{cli_command} {arguments}"
    
    try:
        # 使用shell执行命令
        result = subprocess.run(
            full_command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=300  # 5分钟超时
        )
        
        return {
            "success": True,
            "command": full_command,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": f"命令执行超时: {full_command}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"执行命令时出错: {str(e)}"
        }

def list_available_tools():
    """列出所有可用的CLI工具"""
    print("已安装的CLI工具:")
    for name, info in AVAILABLE_CLIS.items():
        print(f"  - {name}: {info['command']} (版本 {info['version']})")

def main():
    """主函数 - 演示CLI工具调用"""
    if len(sys.argv) < 2:
        print("用法: python gemini_cli_demo.py <cli_name> [arguments...]")
        print("示例: python gemini_cli_demo.py claude --version")
        print("")
        list_available_tools()
        return
    
    cli_name = sys.argv[1]
    arguments = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""
    
    print(f"正在调用CLI工具: {cli_name}")
    print(f"参数: {arguments}")
    print("-" * 50)
    
    result = run_cli_command(cli_name, arguments)
    
    if result["success"]:
        print(f"命令: {result['command']}")
        print(f"返回码: {result['returncode']}")
        if result['stdout']:
            print("标准输出:")
            print(result['stdout'])
        if result['stderr']:
            print("错误输出:")
            print(result['stderr'])
    else:
        print(f"错误: {result['error']}")
        if 'available_tools' in result:
            print("可用工具:", ", ".join(result['available_tools']))

if __name__ == "__main__":
    main()