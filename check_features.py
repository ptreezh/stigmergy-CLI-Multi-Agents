#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查项目实际支持的功能
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from src.core.cross_platform_safe_cli import get_cli_executor

def main():
    print("🔍 检查项目支持的CLI工具和功能")
    print("=" * 50)
    
    executor = get_cli_executor()
    
    print("📋 支持的CLI工具:")
    for cli_name, config in executor.cli_configs.items():
        print(f"   - {cli_name}: {config.display_name}")
        print(f"     描述: {config.description}")
        print(f"     命令: {config.command}")
        print(f"     支持文件类型: {', '.join(config.supported_file_types[:5])}")
        print()
    
    print("✨ 新增功能:")
    print("   1. 🆕 实时CLI帮助信息解析")
    print("   2. 🔄 智能选项、子命令和参数提取")
    print("   3. 📊 优雅降级机制")
    print("   4. 💾 动态预设模板更新")
    print("   5. 🔧 持久化存储机制")
    print("   6. 🌐 国际化英文界面")
    print("   7. 📝 增强的命令规格文档")

if __name__ == "__main__":
    main()