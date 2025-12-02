#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的CLI工具测试脚本
"""

import subprocess
import sys

def test_cli(tool_name):
    """测试指定的CLI工具"""
    try:
        print(f"测试 {tool_name}...")
        # 在Windows上使用shell=True
        result = subprocess.run(f"{tool_name} --version", shell=True, 
                              capture_output=True, text=True, timeout=30)
        print(f"  版本: {result.stdout.strip()}")
        return True
    except Exception as e:
        print(f"  错误: {e}")
        return False

if __name__ == "__main__":
    tools = ["claude", "gemini", "qwen", "iflow", "codebuddy", "codex", "copilot"]
    
    print("测试已安装的CLI工具:")
    for tool in tools:
        test_cli(tool)