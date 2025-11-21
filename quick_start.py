#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Smart CLI Router 一键启动脚本
"""

import os
import sys
import subprocess
import json
from pathlib import Path


def detect_python():
    """检测Python环境"""
    print("🐍 检测Python环境...")
    print(f"   Python版本: {sys.version}")
    print(f"   Python路径: {sys.executable}")
    return True


def check_dependencies():
    """检查依赖"""
    print("📦 检查依赖...")
    
    # 本项目主要使用Python标准库，无需额外依赖
    print("   ✅ 无需额外依赖")
    return True


def quick_setup():
    """快速设置"""
    print("⚡ 快速设置...")
    
    # 检查是否有现有配置
    config_file = Path("config.json")
    if config_file.exists():
        print("   📁 发现现有配置文件")
        return True
    
    # 运行自动部署
    try:
        result = subprocess.run([
            sys.executable, "deploy.py", "--auto"
        ], capture_output=True, text=True, encoding='utf-8', timeout=60)
        
        if result.returncode == 0:
            print("   ✅ 自动部署成功")
            return True
        else:
            print(f"   ❌ 自动部署失败: {result.stderr}")
            return False
    except Exception as e:
        print(f"   ❌ 部署异常: {e}")
        return False


def show_usage():
    """显示使用说明"""
    print("\n🎯 使用说明")
    print("=" * 40)
    
    # 检查生成的路由器
    output_dir = Path("output")
    if output_dir.exists():
        routers = list(output_dir.glob("*_router.*"))
        if routers:
            print("📋 可用的路由器:")
            for router in routers:
                name = router.stem.replace("_router", "")
                ext = router.suffix
                print(f"   {name} ({ext})")
                print(f"     使用: {router.name} '用AI工具写代码'")
    
    print("\n📚 更多信息:")
    print("   - 运行 'python deploy.py --interactive' 进行交互式配置")
    print("   - 运行 'python deploy.py --detect' 检测可用工具")
    print("   - 查看 README.md 了解详细使用方法")


def main():
    """主函数"""
    print("🚀 Smart CLI Router 一键启动")
    print("=" * 40)
    
    # 检查Python环境
    if not detect_python():
        print("❌ Python环境检查失败")
        return False
    
    # 检查依赖
    if not check_dependencies():
        print("❌ 依赖检查失败")
        return False
    
    # 快速设置
    if not quick_setup():
        print("❌ 快速设置失败")
        print("\n💡 尝试手动设置:")
        print("   python deploy.py --interactive")
        return False
    
    # 显示使用说明
    show_usage()
    
    print("\n🎉 启动完成！")
    return True


if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⏹️  启动被中断")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ 启动失败: {e}")
        sys.exit(1)