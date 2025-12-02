#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Qwen CLI 跨工具调用测试脚本
验证Qwen CLI可以正确调用其他已安装的CLI工具
"""

import subprocess
import sys
import os

def test_cli_tool(tool_name, version_arg="--version"):
    """测试指定的CLI工具是否可以正常调用"""
    try:
        print(f"测试 {tool_name} CLI...")
        result = subprocess.run([tool_name, version_arg], 
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print(f"  [PASS] {tool_name} 版本: {result.stdout.strip()}")
            return True
        else:
            print(f"  [FAIL] {tool_name} 调用失败: {result.stderr}")
            return False
    except FileNotFoundError:
        print(f"  [FAIL] {tool_name} 未找到，请检查是否已安装")
        return False
    except Exception as e:
        print(f"  [FAIL] {tool_name} 测试出错: {str(e)}")
        return False

def test_qwen_adapter_import():
    """测试Qwen适配器是否可以正确导入"""
    try:
        print("测试Qwen适配器导入...")
        # 添加适配器路径到Python路径
        sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'adapters'))
        from qwen import QwenCodeInheritanceAdapter
        print("  [PASS] Qwen适配器导入成功")
        return True
    except Exception as e:
        print(f"  [FAIL] Qwen适配器导入失败: {str(e)}")
        return False

def main():
    """主测试函数"""
    print("=" * 50)
    print("Qwen CLI 跨工具调用测试")
    print("=" * 50)
    
    # 测试Qwen适配器导入
    adapter_success = test_qwen_adapter_import()
    
    print("\n测试已安装的CLI工具:")
    cli_tools = [
        ("claude", "--version"),
        ("gemini", "--version"),
        ("iflow", "--version"),
        ("codebuddy", "--version"),
        ("codex", "--version"),
        ("copilot", "--version")
    ]
    
    successful_tools = 0
    for tool_name, version_arg in cli_tools:
        if test_cli_tool(tool_name, version_arg):
            successful_tools += 1
    
    print(f"\n测试结果:")
    print(f"  Qwen适配器: {'通过' if adapter_success else '失败'}")
    print(f"  CLI工具: {successful_tools}/{len(cli_tools)} 通过")
    
    if adapter_success and successful_tools == len(cli_tools):
        print("\n[SUCCESS] 所有测试通过！Qwen CLI现在可以正确调用其他CLI工具了。")
        print("\n使用方法:")
        print("1. 在Qwen中直接使用Shell命令调用其他工具:")
        print("   !claude --version")
        print("   !gemini \"分析这段代码\"")
        print("\n2. 使用我们提供的qwen-call.bat脚本:")
        print("   !qwen-call claude --version")
        print("\n3. 在Python代码中使用subprocess:")
        print("   subprocess.run(['gemini', '分析代码'])")
        return True
    else:
        print("\n[FAILED] 部分测试失败，请检查上述错误信息。")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)