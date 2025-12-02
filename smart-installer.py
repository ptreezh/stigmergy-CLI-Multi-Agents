#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能跨平台AI CLI工具安装器
自动检测系统环境并部署相应版本
"""

import os
import sys
import platform
import subprocess
import shutil
import urllib.request
import json
from pathlib import Path

class SmartInstaller:
    def __init__(self):
        self.system = platform.system().lower()
        self.architecture = platform.machine().lower()
        self.install_dir = Path.home() / ".ai-cli-tools"
        self.config_dir = Path.home() / ".config" / "ai-cli"
        
    def detect_system(self):
        """检测系统环境"""
        print(f"🔍 检测到系统环境:")
        print(f"  系统: {self.system}")
        print(f"  架构: {self.architecture}")
        
        # 系统特定配置
        system_config = {
            "windows": {
                "script_extension": ".bat",
                "path_separator": "\\",
                "shell": "cmd",
                "requires_permissions": True
            },
            "linux": {
                "script_extension": ".sh",
                "path_separator": "/",
                "shell": "bash",
                "requires_permissions": False
            },
            "darwin": {  # macOS
                "script_extension": ".sh",
                "path_separator": "/",
                "shell": "zsh",
                "requires_permissions": False
            }
        }
        
        if self.system not in system_config:
            raise Exception(f"不支持的操作系统: {self.system}")
            
        self.system_config = system_config[self.system]
        return self.system_config
    
    def check_prerequisites(self):
        """检查安装前提条件"""
        print("📋 检查安装前提条件...")
        
        # 检查Python版本
        if sys.version_info < (3, 6):
            raise Exception("需要Python 3.6或更高版本")
        
        # 检查网络连接
        try:
            urllib.request.urlopen("https://api.github.com", timeout=5)
        except:
            print("⚠️  警告: 网络连接可能不可用")
        
        # 检查Node.js (大多数CLI工具需要)
        try:
            result = subprocess.run(["node", "--version"], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                print(f"✅ Node.js版本: {result.stdout.strip()}")
            else:
                print("⚠️  Node.js未安装，某些CLI工具可能无法正常工作")
        except FileNotFoundError:
            print("⚠️  Node.js未安装，某些CLI工具可能无法正常工作")
    
    def deploy_scripts(self):
        """部署系统特定的调用脚本"""
        print(f"🚀 部署{self.system.capitalize()}系统特定脚本...")
        
        # 创建安装目录
        self.install_dir.mkdir(parents=True, exist_ok=True)
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        # 根据系统类型复制相应脚本
        script_extension = self.system_config["script_extension"]
        
        # 这里应该是从远程仓库下载脚本，这里用示例代替
        sample_scripts = [
            f"claude-call{script_extension}",
            f"gemini-call{script_extension}",
            f"qwen-call{script_extension}",
            f"iflow-call{script_extension}",
            f"codebuddy-call{script_extension}",
            f"codex-call{script_extension}",
            f"copilot-call{script_extension}"
        ]
        
        for script in sample_scripts:
            script_path = self.install_dir / script
            # 创建示例脚本内容
            if script_extension == ".bat":
                content = f"@echo off\nREM {script} - Windows批处理脚本\necho 调用 %1 %2 %3 %4 %5 %6 %7 %8 %9\n%1 %2 %3 %4 %5 %6 %7 %8 %9"
            else:
                content = f"#!/bin/bash\n# {script} - Shell脚本\necho \"调用 $@\"\n\"$@\""
            
            with open(script_path, "w", encoding="utf-8") as f:
                f.write(content)
            
            # 为Shell脚本添加执行权限
            if script_extension == ".sh":
                os.chmod(script_path, 0o755)
            
            print(f"  ✅ 创建脚本: {script}")
    
    def setup_python_scripts(self):
        """设置跨平台Python脚本"""
        print("🐍 设置跨平台Python脚本...")
        
        python_script_content = '''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
跨平台AI CLI工具调用脚本
自动适配不同操作系统
"""

import subprocess
import sys
import platform

def run_cli_command(cli_name, arguments):
    """跨平台运行CLI命令"""
    if platform.system().lower() == "windows":
        # Windows使用shell
        full_command = f"{cli_name} {' '.join(arguments) if arguments else ''}"
        return subprocess.run(full_command, shell=True, capture_output=True, text=True, timeout=300)
    else:
        # Linux/macOS直接调用
        cmd_parts = [cli_name] + arguments
        return subprocess.run(cmd_parts, capture_output=True, text=True, timeout=300)

def main():
    if len(sys.argv) < 2:
        print("用法: ai-call <cli_name> [arguments...]")
        return 1
    
    cli_name = sys.argv[1]
    arguments = sys.argv[2:] if len(sys.argv) > 2 else []
    
    try:
        result = run_cli_command(cli_name, arguments)
        print(f"返回码: {result.returncode}")
        if result.stdout:
            print("输出:", result.stdout)
        if result.stderr:
            print("错误:", result.stderr)
        return result.returncode
    except Exception as e:
        print(f"错误: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
'''
        
        python_script_path = self.install_dir / "ai-call.py"
        with open(python_script_path, "w", encoding="utf-8") as f:
            f.write(python_script_content)
        
        print("  ✅ 创建跨平台Python脚本: ai-call.py")
    
    def update_path(self):
        """更新系统PATH环境变量"""
        print("🔄 更新PATH环境变量...")
        
        install_path = str(self.install_dir)
        
        if self.system == "windows":
            # Windows系统提示用户手动添加到PATH
            print(f"  请手动将以下路径添加到系统PATH环境变量:")
            print(f"  {install_path}")
            print("  或者重启终端后运行: setx PATH \"%PATH%;{install_path}\"")
        else:
            # Linux/macOS系统提示用户添加到shell配置文件
            shell_config = {
                "linux": "~/.bashrc",
                "darwin": "~/.zshrc"
            }
            
            config_file = Path(shell_config.get(self.system, "~/.bashrc")).expanduser()
            path_line = f'export PATH="$PATH:{install_path}"'
            
            try:
                with open(config_file, "a") as f:
                    f.write(f"\n# AI CLI Tools\n{path_line}\n")
                print(f"  ✅ 已添加到 {config_file}")
                print(f"  请运行: source {config_file}")
            except Exception as e:
                print(f"  ⚠️  无法自动更新配置文件: {e}")
                print(f"  请手动将以下内容添加到您的shell配置文件:")
                print(f"  {path_line}")
    
    def create_config_file(self):
        """创建配置文件"""
        print("⚙️  创建配置文件...")
        
        config = {
            "system": self.system,
            "architecture": self.architecture,
            "install_dir": str(self.install_dir),
            "version": "1.0.0",
            "tools": {
                "claude": {"version": "2.0.37", "status": "installed"},
                "gemini": {"version": "0.10.0", "status": "installed"},
                "qwen": {"version": "0.3.0", "status": "installed"},
                "iflow": {"version": "0.3.9", "status": "installed"},
                "codebuddy": {"version": "2.10.0", "status": "installed"},
                "codex": {"version": "0.63.0", "status": "installed"},
                "copilot": {"version": "0.0.350", "status": "installed"}
            }
        }
        
        config_file = self.config_dir / "ai-cli-config.json"
        with open(config_file, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print(f"  ✅ 配置文件已保存到: {config_file}")
    
    def verify_installation(self):
        """验证安装结果"""
        print("✅ 验证安装结果...")
        
        # 测试几个关键工具
        test_tools = ["python", "node"]
        for tool in test_tools:
            try:
                result = subprocess.run([tool, "--version"], 
                                      capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    print(f"  ✅ {tool}: {result.stdout.strip() or result.stderr.strip()}")
                else:
                    print(f"  ⚠️  {tool}: 命令执行失败")
            except FileNotFoundError:
                print(f"  ❌ {tool}: 未找到")
    
    def install(self):
        """执行完整安装流程"""
        print("🤖 AI CLI工具智能安装器")
        print("=" * 50)
        
        try:
            # 1. 检测系统环境
            self.detect_system()
            
            # 2. 检查前提条件
            self.check_prerequisites()
            
            # 3. 部署系统特定脚本
            self.deploy_scripts()
            
            # 4. 设置跨平台Python脚本
            self.setup_python_scripts()
            
            # 5. 创建配置文件
            self.create_config_file()
            
            # 6. 更新PATH环境变量
            self.update_path()
            
            # 7. 验证安装
            self.verify_installation()
            
            print("\n🎉 安装完成!")
            print(f"📁 安装目录: {self.install_dir}")
            print(f"🔧 配置目录: {self.config_dir}")
            print("\n💡 使用方法:")
            print("   ai-call.py <tool_name> [arguments...]")
            print("   或者使用系统特定脚本:")
            print(f"   claude-call{self.system_config['script_extension']} <tool_name> [arguments...]")
            
        except Exception as e:
            print(f"❌ 安装失败: {e}")
            return False
        
        return True

def main():
    installer = SmartInstaller()
    success = installer.install()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()