#!/usr/bin/env python3
"""
调试Claude CLI调用
"""

import subprocess
import os
import sys
import time

def debug_claude_call():
    """调试Claude CLI调用"""
    
    print("🔍 调试Claude CLI调用")
    print("=" * 30)
    
    # 简单测试提示词
    simple_prompt = "请简单回答：1+1等于几？"
    
    print(f"📝 提示词: {simple_prompt}")
    
    try:
        print("   📤 发送到Claude...")
        
        # 使用claude CLI (PowerShell脚本)，修复编码问题
        result = subprocess.run(
            ["powershell", "-Command", f"claude '{simple_prompt}'"],
            capture_output=True,
            text=True,
            encoding='utf-8',
            timeout=30  # 30秒超时
        )
        
        print(f"   📊 返回码: {result.returncode}")
        
        if result.returncode == 0:
            print(f"   ✅ Claude响应成功")
            if result.stdout:
                output = result.stdout.strip()
                print(f"   📄 响应: {output}")
                print(f"   📏 长度: {len(output)} 字符")
            else:
                print(f"   📄 响应: (空)")
                print(f"   📏 长度: 0 字符")
            
            if result.stderr:
                print(f"   ⚠️ 错误输出: {result.stderr}")
                
        else:
            print(f"   ❌ Claude响应失败")
            print(f"   📄 标准输出: {result.stdout}")
            print(f"   📄 错误输出: {result.stderr}")
            
    except subprocess.TimeoutExpired:
        print(f"   ⏰ Claude响应超时")
    except Exception as e:
        print(f"   ❌ 执行错误: {e}")
        print(f"   📋 错误类型: {type(e).__name__}")

if __name__ == "__main__":
    debug_claude_call()