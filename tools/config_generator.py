#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
配置生成器 - 用于生成自定义AI工具配置
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional


class ConfigGenerator:
    """配置生成器"""
    
    def __init__(self):
        self.templates_dir = Path(__file__).parent.parent / "templates"
        self.config_dir = Path(__file__).parent.parent / "config"
        self.config_dir.mkdir(exist_ok=True)
    
    def load_tool_template(self) -> Dict[str, Any]:
        """加载工具模板"""
        template_path = self.templates_dir / "tool_template.json"
        with open(template_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def create_tool_config(self, tool_name: str, description: str, 
                          keywords: List[str], command: str,
                          priority: int = 10, wrapper: bool = False,
                          wrapper_script: str = None,
                          examples: List[str] = None) -> Dict[str, Any]:
        """创建工具配置"""
        template = self.load_tool_template()
        
        # 获取模板结构（去掉tool_name键）
        tool_config = next(iter(template.values()))
        
        # 填充配置
        tool_config.update({
            "description": description,
            "keywords": keywords,
            "priority": priority,
            "wrapper": wrapper,
            "wrapper_script": wrapper_script,
            "command": {
                "windows": f"{command}.cmd",
                "linux": command,
                "darwin": command
            },
            "examples": examples or [f"用{keywords[0]}处理任务"]
        })
        
        return {tool_name: tool_config}
    
    def add_tool_to_config(self, config_path: str, tool_config: Dict[str, Any]):
        """将工具配置添加到现有配置文件"""
        config_file = Path(config_path)
        
        if config_file.exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
        else:
            config = {
                "version": "1.0.0",
                "tools": {},
                "route_keywords": ["用", "帮我", "请", "智能", "ai"],
                "default_tool": list(tool_config.keys())[0]
            }
        
        config["tools"].update(tool_config)
        
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 工具配置已添加到: {config_path}")
    
    def create_custom_config(self, tools: List[Dict[str, Any]], 
                           route_keywords: List[str] = None,
                           default_tool: str = None) -> Dict[str, Any]:
        """创建自定义配置"""
        config = {
            "version": "1.0.0",
            "tools": {},
            "route_keywords": route_keywords or ["用", "帮我", "请", "智能", "ai"],
            "default_tool": default_tool
        }
        
        for tool_config in tools:
            config["tools"].update(tool_config)
        
        if not default_tool and config["tools"]:
            # 选择优先级最高的工具作为默认
            default_tool = min(config["tools"].items(), 
                             key=lambda x: x[1]["priority"])[0]
            config["default_tool"] = default_tool
        
        return config
    
    def save_config(self, config: Dict[str, Any], filename: str):
        """保存配置文件"""
        config_path = self.config_dir / filename
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        print(f"📁 配置已保存: {config_path}")
        return config_path
    
    def interactive_tool_creation(self):
        """交互式工具创建"""
        print("🛠️  交互式AI工具配置生成器")
        print("=" * 40)
        
        tools = []
        
        while True:
            print(f"\n工具 #{len(tools) + 1}")
            
            tool_name = input("工具名称: ").strip()
            if not tool_name:
                break
            
            description = input("工具描述: ").strip()
            
            keywords_input = input("关键词 (用逗号分隔): ").strip()
            keywords = [kw.strip() for kw in keywords_input.split(",")]
            
            command = input("命令名称: ").strip()
            
            priority_input = input("优先级 (数字，越小优先级越高): ").strip()
            priority = int(priority_input) if priority_input.isdigit() else 10
            
            wrapper_input = input("是否需要包装器? (y/N): ").strip().lower()
            wrapper = wrapper_input in ['y', 'yes']
            
            wrapper_script = None
            if wrapper:
                wrapper_script = input("包装器脚本名: ").strip() or None
            
            examples_input = input("使用示例 (用逗号分隔): ").strip()
            examples = [ex.strip() for ex in examples_input.split(",")] if examples_input else []
            
            tool_config = self.create_tool_config(
                tool_name, description, keywords, command,
                priority, wrapper, wrapper_script, examples
            )
            
            tools.append(tool_config)
            print(f"✅ 工具 '{tool_name}' 已添加")
            
            continue_input = input("\n继续添加工具? (Y/n): ").strip().lower()
            if continue_input in ['n', 'no']:
                break
        
        if not tools:
            print("❌ 未添加任何工具")
            return
        
        # 询问路由关键词
        route_keywords_input = input("\n路由关键词 (用逗号分隔，默认: 用,帮我,请): ").strip()
        route_keywords = [kw.strip() for kw in route_keywords_input.split(",")] if route_keywords_input else ["用", "帮我", "请"]
        
        # 询问默认工具
        tool_names = [list(tool.keys())[0] for tool in tools]
        default_tool_input = input(f"默认工具 ({', '.join(tool_names)}): ").strip()
        default_tool = default_tool_input if default_tool_input in tool_names else tool_names[0]
        
        # 创建配置
        config = self.create_custom_config(tools, route_keywords, default_tool)
        
        # 保存配置
        filename = input("配置文件名 (默认: custom_tools.json): ").strip()
        filename = filename or "custom_tools.json"
        
        self.save_config(config, filename)
        
        print(f"\n🎉 配置生成完成！")
        print(f"📁 配置文件: {self.config_dir / filename}")
        print(f"🔧 可用工具: {', '.join(tool_names)}")
        print(f"🎯 默认工具: {default_tool}")


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="AI工具配置生成器")
    parser.add_argument("--interactive", "-i", action="store_true", help="交互式创建配置")
    parser.add_argument("--add", "-a", help="添加工具到现有配置")
    parser.add_argument("--name", "-n", help="工具名称")
    parser.add_argument("--desc", "-d", help="工具描述")
    parser.add_argument("--keywords", "-k", help="关键词 (逗号分隔)")
    parser.add_argument("--command", "-c", help="命令名称")
    parser.add_argument("--priority", "-p", type=int, default=10, help="优先级")
    parser.add_argument("--wrapper", "-w", action="store_true", help="需要包装器")
    parser.add_argument("--wrapper-script", help="包装器脚本名")
    parser.add_argument("--config", help="配置文件路径")
    
    args = parser.parse_args()
    
    generator = ConfigGenerator()
    
    if args.interactive:
        generator.interactive_tool_creation()
    elif args.add and args.name and args.desc and args.keywords and args.command:
        keywords = [kw.strip() for kw in args.keywords.split(",")]
        examples = [f"用{keywords[0]}处理任务"]
        
        tool_config = generator.create_tool_config(
            args.name, args.desc, keywords, args.command,
            args.priority, args.wrapper, args.wrapper_script, examples
        )
        
        config_path = args.config or "config.json"
        generator.add_tool_to_config(config_path, tool_config)
    else:
        print("🛠️  AI工具配置生成器")
        print("\n使用方法:")
        print("  python config_generator.py --interactive  # 交互式创建")
        print("  python config_generator.py --add --name tool --desc '描述' --keywords 'kw1,kw2' --command tool")
        print("\n示例:")
        print("  python config_generator.py --add --name myai --desc '我的AI工具' --keywords 'myai,我的' --command myai")


if __name__ == "__main__":
    main()