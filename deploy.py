#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Smart CLI Router 通用自动化部署脚本
支持不同操作系统和AI CLI工具环境的自动适配
"""

import os
import sys
import json
import platform
import subprocess
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Any


class UniversalDeployer:
    """通用部署器"""
    
    def __init__(self):
        self.system = platform.system().lower()
        self.project_root = Path(__file__).parent
        self.config_dir = self.project_root / "config"
        self.templates_dir = self.project_root / "templates"
        self.output_dir = self.project_root / "output"
        
        # 确保目录存在
        self.config_dir.mkdir(exist_ok=True)
        self.templates_dir.mkdir(exist_ok=True)
        self.output_dir.mkdir(exist_ok=True)
        
        self.load_environment_info()
    
    def load_environment_info(self):
        """加载环境信息"""
        self.env_info = {
            "system": self.system,
            "python_version": sys.version,
            "platform": platform.platform(),
            "architecture": platform.architecture(),
            "machine": platform.machine(),
            "processor": platform.processor(),
        }
    
    def detect_available_tools(self) -> Dict[str, bool]:
        """检测系统中可用的AI工具"""
        print("🔍 检测系统中可用的AI工具...")
        
        # 常见AI工具的检测命令
        tool_commands = {
            "claude": {
                "windows": ["where", "claude"],
                "linux": ["which", "claude"],
                "darwin": ["which", "claude"]
            },
            "gemini": {
                "windows": ["where", "gemini"],
                "linux": ["which", "gemini"],
                "darwin": ["which", "gemini"]
            },
            "kimi": {
                "windows": ["where", "kimi"],
                "linux": ["which", "kimi"],
                "darwin": ["which", "kimi"]
            },
            "qwen": {
                "windows": ["where", "qwen"],
                "linux": ["which", "qwen"],
                "darwin": ["which", "qwen"]
            },
            "ollama": {
                "windows": ["where", "ollama"],
                "linux": ["which", "ollama"],
                "darwin": ["which", "ollama"]
            },
            "codebuddy": {
                "windows": ["where", "codebuddy"],
                "linux": ["which", "codebuddy"],
                "darwin": ["which", "codebuddy"]
            },
            "qodercli": {
                "windows": ["where", "qodercli"],
                "linux": ["which", "qodercli"],
                "darwin": ["which", "qodercli"]
            },
            "iflow": {
                "windows": ["where", "iflow"],
                "linux": ["which", "iflow"],
                "darwin": ["which", "iflow"]
            }
        }
        
        available_tools = {}
        
        for tool_name, commands in tool_commands.items():
            try:
                command = commands.get(self.system, commands["linux"])
                result = subprocess.run(command, 
                                      capture_output=True, 
                                      text=True, 
                                      timeout=5)
                available_tools[tool_name] = result.returncode == 0
                status = "✅" if result.returncode == 0 else "❌"
                print(f"  {status} {tool_name}")
            except Exception:
                available_tools[tool_name] = False
                print(f"  ❌ {tool_name}")
        
        return available_tools
    
    def generate_custom_config(self, available_tools: Dict[str, bool], 
                             user_preferences: Dict[str, Any] = None) -> Dict[str, Any]:
        """生成自定义配置"""
        print("\n⚙️  生成自定义配置...")
        
        # 基础配置模板
        config = {
            "version": "1.0.0",
            "system": self.system,
            "generated_at": str(Path.cwd()),
            "environment": self.env_info,
            "tools": {},
            "route_keywords": user_preferences.get("route_keywords", [
                "用", "帮我", "请", "智能", "ai", "写", "生成", 
                "解释", "分析", "翻译", "代码", "文章"
            ]),
            "default_tool": user_preferences.get("default_tool", "claude"),
            "fallback_strategy": user_preferences.get("fallback_strategy", "first_available"),
            "output_formats": user_preferences.get("output_formats", ["cmd", "python"]),
            "install_global": user_preferences.get("install_global", False)
        }
        
        # 为可用工具生成配置
        tool_templates = {
            "claude": {
                "description": "Anthropic Claude",
                "keywords": ["claude", "anthropic"],
                "priority": 1,
                "wrapper": False
            },
            "gemini": {
                "description": "Google Gemini AI",
                "keywords": ["gemini", "google", "谷歌"],
                "priority": 2,
                "wrapper": False
            },
            "kimi": {
                "description": "月之暗面Kimi",
                "keywords": ["kimi", "月之暗面", "moonshot"],
                "priority": 3,
                "wrapper": True,
                "wrapper_script": "kimi_wrapper.py"
            },
            "qwen": {
                "description": "阿里通义千问",
                "keywords": ["qwen", "通义", "阿里"],
                "priority": 4,
                "wrapper": False
            },
            "ollama": {
                "description": "Ollama本地模型",
                "keywords": ["ollama", "本地", "离线"],
                "priority": 5,
                "wrapper": False
            },
            "codebuddy": {
                "description": "CodeBuddy代码助手",
                "keywords": ["codebuddy", "代码助手", "编程"],
                "priority": 6,
                "wrapper": False
            },
            "qodercli": {
                "description": "QoderCLI代码生成",
                "keywords": ["qodercli", "代码生成", "编程"],
                "priority": 7,
                "wrapper": False
            },
            "iflow": {
                "description": "iFlow智能助手",
                "keywords": ["iflow", "智能", "助手", "心流"],
                "priority": 8,
                "wrapper": False
            }
        }
        
        for tool_name, is_available in available_tools.items():
            if is_available and tool_name in tool_templates:
                template = tool_templates[tool_name]
                
                # 确定命令
                if self.system == "windows":
                    command = f"{tool_name}.cmd" if tool_name not in ["ollama"] else tool_name
                else:
                    command = tool_name
                
                config["tools"][tool_name] = {
                    "command": {
                        "windows": f"{tool_name}.cmd" if tool_name not in ["ollama"] else tool_name,
                        "linux": tool_name,
                        "darwin": tool_name
                    },
                    **template
                }
                
                print(f"  ✅ 添加工具: {tool_name} - {template['description']}")
        
        return config
    
    def save_config(self, config: Dict[str, Any], filename: str = "custom_config.json"):
        """保存配置文件"""
        config_path = self.config_dir / filename
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        print(f"📁 配置已保存: {config_path}")
        return config_path
    
    def generate_routers(self, config: Dict[str, Any], cli_names: List[str] = None):
        """生成智能路由器"""
        if cli_names is None:
            cli_names = ["smart", "ai", "assistant"]
        
        print(f"\n🚀 生成智能路由器...")
        
        # 导入路由生成器
        sys.path.insert(0, str(self.project_root / "src"))
        try:
            from universal_cli_setup import UniversalCLISetup
            
            setup = UniversalCLISetup()
            setup.config = config
            
            for cli_name in cli_names:
                for format_type in config["output_formats"]:
                    try:
                        router_content = setup.generate_smart_router(cli_name, format_type)
                        
                        # 确定文件扩展名
                        extensions = {
                            "cmd": "cmd" if self.system == "windows" else "sh",
                            "powershell": "ps1",
                            "bash": "sh",
                            "python": "py"
                        }
                        
                        ext = extensions.get(format_type, format_type)
                        filename = f"{cli_name}_router.{ext}"
                        filepath = self.output_dir / filename
                        
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(router_content)
                        
                        print(f"  ✅ 生成: {filename}")
                        
                        # 设置可执行权限 (Linux/macOS)
                        if self.system in ["linux", "darwin"] and ext == "sh":
                            os.chmod(filepath, 0o755)
                            
                    except Exception as e:
                        print(f"  ❌ 生成失败 {cli_name}.{format_type}: {e}")
                        
        except ImportError as e:
            print(f"❌ 无法导入路由生成器: {e}")
        finally:
            if str(self.project_root / "src") in sys.path:
                sys.path.remove(str(self.project_root / "src"))
    
    def create_deployment_package(self, config: Dict[str, Any], package_name: str = None):
        """创建部署包"""
        if package_name is None:
            package_name = f"smart_cli_router_{self.system}"
        
        print(f"\n📦 创建部署包: {package_name}")
        
        package_dir = self.output_dir / package_name
        package_dir.mkdir(exist_ok=True)
        
        # 复制必要文件
        files_to_copy = [
            ("src/universal_cli_setup.py", "universal_cli_setup.py"),
            ("src/smart_router_creator.py", "smart_router_creator.py"),
            ("src/kimi_wrapper.py", "kimi_wrapper.py"),
            ("src/shell_integration.py", "shell_integration.py"),
            ("validate_project.py", "validate_project.py")
        ]
        
        for src_file, dest_file in files_to_copy:
            src_path = self.project_root / src_file
            dest_path = package_dir / dest_file
            if src_path.exists():
                shutil.copy2(src_path, dest_path)
                print(f"  ✅ 复制: {dest_file}")
        
        # 复制配置文件
        config_path = self.config_dir / "custom_config.json"
        if config_path.exists():
            shutil.copy2(config_path, package_dir / "config.json")
            print(f"  ✅ 复制: config.json")
        
        # 复制生成的路由器
        for router_file in self.output_dir.glob("*_router.*"):
            if router_file.is_file() and router_file.parent != package_dir:
                shutil.copy2(router_file, package_dir / router_file.name)
                print(f"  ✅ 复制: {router_file.name}")
        
        # 创建使用说明
        self.create_usage_guide(package_dir, config)
        
        print(f"📁 部署包已创建: {package_dir}")
        return package_dir
    
    def create_usage_guide(self, package_dir: Path, config: Dict[str, Any]):
        """创建使用说明"""
        guide_content = f"""# Smart CLI Router 使用指南

## 环境信息
- 系统: {self.env_info['system']}
- 平台: {self.env_info['platform']}
- Python: {self.env_info['python_version']}

## 可用工具
"""
        
        for tool_name, tool_config in config["tools"].items():
            guide_content += f"- **{tool_name}**: {tool_config['description']}\n"
        
        guide_content += f"""
## 使用方法

### 1. 直接使用生成的路由器
"""
        
        for router_file in package_dir.glob("*_router.*"):
            if router_file.suffix in [".cmd", ".sh", ".py"]:
                router_name = router_file.stem.replace("_router", "")
                guide_content += f"""
#### {router_name} 路由器
```bash
# Windows
{router_file.name} 用claude写代码

# Linux/macOS
./{router_file.name} 用gemini分析问题
```
"""
        
        guide_content += f"""
### 2. 自定义生成路由器
```bash
python universal_cli_setup.py --config config.json --cli mytool --format cmd
```

### 3. 检查工具状态
```bash
python universal_cli_setup.py --config config.json --list
```

## 支持的指令关键词
{', '.join(config['route_keywords'])}

## 默认工具
{config['default_tool']}

---
生成时间: {config['generated_at']}
"""
        
        guide_path = package_dir / "使用指南.md"
        with open(guide_path, 'w', encoding='utf-8') as f:
            f.write(guide_content)
        
        print(f"  ✅ 创建: 使用指南.md")
    
    def interactive_setup(self):
        """交互式设置"""
        print("🎯 Smart CLI Router 交互式部署向导")
        print("=" * 50)
        
        # 检测可用工具
        available_tools = self.detect_available_tools()
        
        if not any(available_tools.values()):
            print("❌ 未检测到任何AI工具，请先安装至少一个AI CLI工具")
            return False
        
        # 用户偏好设置
        user_preferences = {}
        
        # 选择默认工具
        available_names = [name for name, available in available_tools.items() if available]
        print(f"\n可用的AI工具: {', '.join(available_names)}")
        
        default_tool = input(f"选择默认工具 [{available_names[0]}]: ").strip()
        user_preferences["default_tool"] = default_tool or available_names[0]
        
        # 选择输出格式
        print("\n支持的输出格式:")
        print("1. cmd (Windows命令行)")
        print("2. powershell (PowerShell脚本)")
        print("3. bash (Linux/macOS脚本)")
        print("4. python (Python脚本)")
        
        format_choice = input("选择输出格式 [多个用逗号分隔，默认: cmd,python]: ").strip()
        if format_choice:
            format_map = {
                "1": "cmd", "2": "powershell", "3": "bash", "4": "python",
                "cmd": "cmd", "powershell": "powershell", "bash": "bash", "python": "python"
            }
            formats = []
            for choice in format_choice.split(","):
                choice = choice.strip().lower()
                if choice in format_map:
                    formats.append(format_map[choice])
            user_preferences["output_formats"] = formats or ["cmd", "python"]
        else:
            user_preferences["output_formats"] = ["cmd", "python"]
        
        # CLI名称
        cli_names_input = input("输入CLI名称 [多个用逗号分隔，默认: smart,ai]: ").strip()
        if cli_names_input:
            cli_names = [name.strip() for name in cli_names_input.split(",")]
        else:
            cli_names = ["smart", "ai"]
        
        # 生成配置和路由器
        config = self.generate_custom_config(available_tools, user_preferences)
        self.save_config(config)
        self.generate_routers(config, cli_names)
        
        # 创建部署包
        package_name = input("输入部署包名称 [默认: auto_generated]: ").strip()
        package_name = package_name or "auto_generated"
        
        package_dir = self.create_deployment_package(config, package_name)
        
        print(f"\n🎉 部署完成！")
        print(f"📁 部署包位置: {package_dir}")
        print(f"📖 使用指南: {package_dir}/使用指南.md")
        
        return True
    
    def auto_deploy(self, config_file: str = None):
        """自动部署"""
        print("🚀 Smart CLI Router 自动部署")
        print("=" * 50)
        
        # 检测可用工具
        available_tools = self.detect_available_tools()
        
        if not any(available_tools.values()):
            print("❌ 未检测到任何AI工具")
            return False
        
        # 加载或生成配置
        if config_file and Path(config_file).exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
            print(f"📁 使用配置文件: {config_file}")
        else:
            # 使用默认用户偏好
            default_preferences = {
                "route_keywords": ["用", "帮我", "请", "智能", "ai", "写", "生成", "解释", "分析", "翻译", "代码", "文章"],
                "default_tool": "claude",
                "output_formats": ["cmd", "python"]
            }
            config = self.generate_custom_config(available_tools, default_preferences)
            self.save_config(config)
        
        # 生成路由器
        self.generate_routers(config, ["smart", "ai"])
        
        # 创建部署包
        package_dir = self.create_deployment_package(config, "auto_deploy")
        
        print(f"\n🎉 自动部署完成！")
        print(f"📁 部署包: {package_dir}")
        
        return True


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Smart CLI Router 通用部署脚本")
    parser.add_argument("--interactive", "-i", action="store_true", help="交互式部署")
    parser.add_argument("--auto", "-a", action="store_true", help="自动部署")
    parser.add_argument("--config", "-c", help="配置文件路径")
    parser.add_argument("--detect", "-d", action="store_true", help="仅检测可用工具")
    
    args = parser.parse_args()
    
    deployer = UniversalDeployer()
    
    if args.detect:
        deployer.detect_available_tools()
    elif args.interactive:
        deployer.interactive_setup()
    elif args.auto:
        deployer.auto_deploy(args.config)
    else:
        print("🎯 Smart CLI Router 通用部署脚本")
        print("\n使用方法:")
        print("  python deploy.py --interactive  # 交互式部署")
        print("  python deploy.py --auto         # 自动部署")
        print("  python deploy.py --detect       # 检测可用工具")
        print("  python deploy.py --auto --config my_config.json  # 使用指定配置")


if __name__ == "__main__":
    main()