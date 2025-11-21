#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Smart CLI Router 基本使用示例
"""

import sys
import os
from pathlib import Path

# 添加src目录到Python路径
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from universal_cli_setup import UniversalCLISetup
from smart_router_creator import create_smart_router


def example_basic_setup():
    """示例1: 基本设置和工具检测"""
    print("🔍 示例1: 基本设置和工具检测")
    print("=" * 50)
    
    # 创建设置实例
    setup = UniversalCLISetup()
    
    # 检查可用工具
    available_tools = setup.discover_available_tools()
    
    print(f"🔧 发现 {len(available_tools)} 个工具:")
    for tool_name, is_available in available_tools.items():
        status = "✅" if is_available else "❌"
        tool_info = setup.config["tools"][tool_name]
        print(f"  {status} {tool_name:<12} - {tool_info['description']}")
    
    print()


def example_generate_router():
    """示例2: 生成智能路由器"""
    print("🚀 示例2: 生成智能路由器")
    print("=" * 50)
    
    # 使用简化版创建器
    cli_name = "myai"
    output_format = "cmd"
    
    try:
        router_content = create_smart_router(cli_name, output_format)
        filename = f"smart_{cli_name}.bat"
        
        # 保存到examples目录
        filepath = Path(__file__).parent / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(router_content)
        
        print(f"✅ 智能路由器已创建: {filename}")
        print(f"📝 使用示例:")
        print(f"   {filename} 用claude写代码")
        print(f"   {filename} 用gemini分析问题")
        print(f"   {filename} 用kimi写文章")
        
    except Exception as e:
        print(f"❌ 生成失败: {e}")
    
    print()


def example_custom_config():
    """示例3: 自定义配置"""
    print("⚙️  示例3: 自定义配置")
    print("=" * 50)
    
    # 创建自定义配置
    custom_config = {
        "version": "1.0.0",
        "tools": {
            "my_custom_tool": {
                "command": {
                    "windows": "mytool.cmd",
                    "linux": "mytool",
                    "darwin": "mytool"
                },
                "description": "我的自定义AI工具",
                "keywords": ["mytool", "自定义", "custom"],
                "priority": 1,
                "wrapper": False
            }
        },
        "route_keywords": ["用", "帮我", "请", "智能"],
        "default_tool": "my_custom_tool"
    }
    
    # 保存自定义配置
    config_path = Path(__file__).parent / "custom_config.json"
    import json
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(custom_config, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 自定义配置已创建: {config_path}")
    print("📝 配置内容:")
    print(json.dumps(custom_config, ensure_ascii=False, indent=2))
    
    print()


def example_cross_platform():
    """示例4: 跨平台路由器生成"""
    print("🌍 示例4: 跨平台路由器生成")
    print("=" * 50)
    
    cli_name = "crossai"
    formats = ["cmd", "powershell", "bash", "python"]
    
    for fmt in formats:
        try:
            if fmt in ["cmd", "powershell", "python"]:
                # 使用通用设置脚本
                setup = UniversalCLISetup()
                content = setup.generate_smart_router(cli_name, fmt)
            else:
                # 使用简化版创建器
                content = create_smart_router(cli_name, fmt)
            
            # 确定文件扩展名
            extensions = {
                "cmd": "cmd",
                "powershell": "ps1", 
                "bash": "sh",
                "python": "py"
            }
            
            filename = f"smart_{cli_name}.{extensions[fmt]}"
            filepath = Path(__file__).parent / filename
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ {fmt.upper():<10} - {filename}")
            
        except Exception as e:
            print(f"❌ {fmt.upper():<10} - 失败: {e}")
    
    print()


def main():
    """主函数"""
    print("🤖 Smart CLI Router 使用示例")
    print("=" * 60)
    print()
    
    # 运行所有示例
    example_basic_setup()
    example_generate_router()
    example_custom_config()
    example_cross_platform()
    
    print("🎉 所有示例运行完成！")
    print()
    print("📚 更多信息请查看:")
    print("   - docs/UNIVERSAL_CLI_DEPLOYMENT_GUIDE.md")
    print("   - docs/QUICK_START.md")
    print("   - README.md")


if __name__ == "__main__":
    main()