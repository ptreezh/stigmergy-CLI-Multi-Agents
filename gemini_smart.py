#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gemini 智能路由器 - 简化版
版本: 0.16.0
"""

import sys
import subprocess

def smart_route():
    if len(sys.argv) < 2:
        print("🚀 gemini 简化路由器")
        print("💡 用法: python gemini_smart.py \"用其他工具帮我...\"")
        return

    user_input = " ".join(sys.argv[1:])
    
    # 路由目标
    targets = ["claude", "gemini", "qwen", "kimi", "codebuddy", "qoder", "iflow", "copilot"]
    
    for target in targets:
        if target.lower() in user_input.lower():
            # 清理输入
            clean_input = user_input.replace(target, "", 1).strip()
            clean_input = clean_input.replace("用", "").replace("帮我", "").strip()
            
            print("🚀 路由到: {0}".format(target))
            try:
                subprocess.run([target, clean_input])
            except FileNotFoundError:
                print("❌ {0} 未找到".format(target))
            return
    
    # 默认执行原工具
    try:
        subprocess.run(["gemini", user_input])
    except FileNotFoundError:
        print("❌ gemini 未找到")

if __name__ == "__main__":
    smart_route()
