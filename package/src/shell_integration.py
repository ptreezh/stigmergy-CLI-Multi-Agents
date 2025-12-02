#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Shell集成模块 - 将CLI工具集成到shell环境中
支持各种shell的参数传递和命令执行
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from typing import Dict, List, Optional, Any


class ShellIntegration:
    """Shell集成类"""
    
    def __init__(self):
        self.script_dir = Path(__file__).parent
        self.cli_script = self.script_dir / 'iflow_cli.py'
        self.hook_script = self.script_dir / 'cli_intents_hook.py'
        self.shell_configs = self._get_shell_configs()
    
    def _get_shell_configs(self) -> Dict[str, Dict]:
        """获取各种shell的配置"""
        return {
            "bash": {
                "rc_file": "~/.bashrc",
                "profile_file": "~/.bash_profile",
                "alias_template": "alias {name}='python {script}'",
                "function_template": """
{name}() {{
    python {hook_script} "$@"
}}
"""
            },
            "zsh": {
                "rc_file": "~/.zshrc",
                "profile_file": "~/.zprofile",
                "alias_template": "alias {name}='python {script}'",
                "function_template": """
{name}() {{
    python {hook_script} "$@"
}}
"""
            },
            "fish": {
                "rc_file": "~/.config/fish/config.fish",
                "alias_template": "alias {name} 'python {script}'",
                "function_template": """
function {name}
    python {hook_script} $argv
end
"""
            },
            "powershell": {
                "profile_file": "~/Documents/PowerShell/Microsoft.PowerShell_profile.ps1",
                "alias_template": "Set-Alias -Name {name} -Value 'python {script}'",
                "function_template": """
function {name} {{
    python {hook_script} $args
}}
"""
            },
            "cmd": {
                "batch_file": "%USERPROFILE%\\iflow_cli.bat",
                "template": """@echo off
python "{script}" %*
"""
            }
        }
    
    def detect_shell(self) -> str:
        """检测当前使用的shell"""
        shell_env = os.environ.get('SHELL', '')
        if 'bash' in shell_env:
            return 'bash'
        elif 'zsh' in shell_env:
            return 'zsh'
        elif 'fish' in shell_env:
            return 'fish'
        elif sys.platform == 'win32':
            # Windows环境检测
            if 'POWERSHELL' in os.environ or 'PSModulePath' in os.environ:
                return 'powershell'
            else:
                return 'cmd'
        else:
            return 'bash'  # 默认
    
    def install_shell_integration(self, shell_type: str = None, global_command: str = "ai") -> bool:
        """安装shell集成"""
        if shell_type is None:
            shell_type = self.detect_shell()
        
        if shell_type not in self.shell_configs:
            print(f"❌ 不支持的shell类型: {shell_type}")
            return False
        
        config = self.shell_configs[shell_type]
        
        try:
            if shell_type in ['bash', 'zsh']:
                return self._install_unix_shell(shell_type, config, global_command)
            elif shell_type == 'fish':
                return self._install_fish_shell(config, global_command)
            elif shell_type == 'powershell':
                return self._install_powershell(config, global_command)
            elif shell_type == 'cmd':
                return self._install_cmd_batch(config, global_command)
        
        except Exception as e:
            print(f"❌ 安装失败: {e}")
            return False
    
    def _install_unix_shell(self, shell_type: str, config: Dict, global_command: str) -> bool:
        """安装Unix shell (bash/zsh) 集成"""
        rc_file = Path(config["rc_file"]).expanduser()
        
        # 创建函数定义
        function_def = config["function_template"].format(
            name=global_command,
            hook_script=str(self.hook_script)
        )
        
        # 检查是否已经存在
        if rc_file.exists():
            content = rc_file.read_text(encoding='utf-8')
            if f"function {global_command}" in content or f"{global_command}()" in content:
                print(f"✅ {shell_type} 集成已存在")
                return True
        
        # 添加到配置文件
        with open(rc_file, 'a', encoding='utf-8') as f:
            f.write(f"\n# iFlow CLI Integration\n")
            f.write(function_def)
        
        print(f"✅ {shell_type} 集成安装成功")
        print(f"📝 配置文件: {rc_file}")
        print(f"🚀 使用: {global_command} '你的命令'")
        print(f"💡 重新加载shell或运行: source {rc_file}")
        
        return True
    
    def _install_fish_shell(self, config: Dict, global_command: str) -> bool:
        """安装Fish shell集成"""
        config_dir = Path(config["rc_file"]).parent
        config_dir.mkdir(parents=True, exist_ok=True)
        
        config_file = Path(config["rc_file"])
        
        # 创建函数定义
        function_def = config["function_template"].format(
            name=global_command,
            hook_script=str(self.hook_script)
        )
        
        # 检查是否已经存在
        if config_file.exists():
            content = config_file.read_text(encoding='utf-8')
            if f"function {global_command}" in content:
                print("✅ Fish 集成已存在")
                return True
        
        # 添加到配置文件
        with open(config_file, 'a', encoding='utf-8') as f:
            f.write(f"\n# iFlow CLI Integration\n")
            f.write(function_def)
        
        print("✅ Fish 集成安装成功")
        print(f"📝 配置文件: {config_file}")
        print(f"🚀 使用: {global_command} '你的命令'")
        
        return True
    
    def _install_powershell(self, config: Dict, global_command: str) -> bool:
        """安装PowerShell集成"""
        profile_file = Path(config["profile_file"]).expanduser()
        profile_file.parent.mkdir(parents=True, exist_ok=True)
        
        # 创建函数定义
        function_def = config["function_template"].format(
            name=global_command,
            hook_script=str(self.hook_script)
        )
        
        # 检查是否已经存在
        if profile_file.exists():
            content = profile_file.read_text(encoding='utf-8')
            if f"function {global_command}" in content:
                print("✅ PowerShell 集成已存在")
                return True
        
        # 添加到配置文件
        with open(profile_file, 'a', encoding='utf-8') as f:
            f.write(f"\n# iFlow CLI Integration\n")
            f.write(function_def)
        
        print("✅ PowerShell 集成安装成功")
        print(f"📝 配置文件: {profile_file}")
        print(f"🚀 使用: {global_command} '你的命令'")
        print("💡 重新启动PowerShell以加载配置")
        
        return True
    
    def _install_cmd_batch(self, config: Dict, global_command: str) -> bool:
        """安装CMD批处理集成"""
        batch_file = Path(os.environ['USERPROFILE']) / f'{global_command}.bat'
        
        # 创建批处理文件
        batch_content = config["template"].format(
            script=str(self.hook_script)
        )
        
        with open(batch_file, 'w', encoding='utf-8') as f:
            f.write(batch_content)
        
        # 检查PATH环境变量
        user_profile = os.environ['USERPROFILE']
        if user_profile not in os.environ.get('PATH', ''):
            print(f"⚠️  建议将 {user_profile} 添加到PATH环境变量")
        
        print("✅ CMD 集成安装成功")
        print(f"📝 批处理文件: {batch_file}")
        print(f"🚀 使用: {global_command} '你的命令'")
        
        return True
    
    def create_global_shortcuts(self, shortcuts: Dict[str, str]) -> bool:
        """创建全局快捷命令"""
        try:
            shell_type = self.detect_shell()
            config = self.shell_configs[shell_type]
            
            if shell_type in ['bash', 'zsh', 'fish']:
                rc_file = Path(config["rc_file"]).expanduser()
                
                with open(rc_file, 'a', encoding='utf-8') as f:
                    f.write("\n# iFlow CLI Shortcuts\n")
                    for shortcut, command in shortcuts.items():
                        alias_def = config["alias_template"].format(
                            name=shortcut,
                            script=f"{self.cli_script} {command}"
                        )
                        f.write(f"{alias_def}\n")
                
                print(f"✅ 快捷命令已添加到 {rc_file}")
                return True
            
            elif shell_type == 'powershell':
                profile_file = Path(config["profile_file"]).expanduser()
                
                with open(profile_file, 'a', encoding='utf-8') as f:
                    f.write("\n# iFlow CLI Shortcuts\n")
                    for shortcut, command in shortcuts.items():
                        alias_def = config["alias_template"].format(
                            name=shortcut,
                            script=f"{self.cli_script} {command}"
                        )
                        f.write(f"{alias_def}\n")
                
                print(f"✅ 快捷命令已添加到 {profile_file}")
                return True
        
        except Exception as e:
            print(f"❌ 创建快捷命令失败: {e}")
            return False
    
    def test_integration(self) -> bool:
        """测试集成是否正常工作"""
        try:
            # 测试CLI脚本
            result = subprocess.run(
                ["python", str(self.cli_script), "list"],
                capture_output=True,
                text=True,
                encoding='utf-8',
                timeout=10
            )
            
            if result.returncode != 0:
                print(f"❌ CLI脚本测试失败: {result.stderr}")
                return False
            
            # 测试Hook脚本
            result = subprocess.run(
                ["python", str(self.hook_script), "--list-intents"],
                capture_output=True,
                text=True,
                encoding='utf-8',
                timeout=10
            )
            
            if result.returncode != 0:
                print(f"❌ Hook脚本测试失败: {result.stderr}")
                return False
            
            print("✅ 集成测试通过")
            return True
        
        except Exception as e:
            print(f"❌ 集成测试失败: {e}")
            return False
    
    def uninstall_shell_integration(self, shell_type: str = None, global_command: str = "ai") -> bool:
        """卸载shell集成"""
        if shell_type is None:
            shell_type = self.detect_shell()
        
        if shell_type not in self.shell_configs:
            print(f"❌ 不支持的shell类型: {shell_type}")
            return False
        
        try:
            if shell_type in ['bash', 'zsh']:
                rc_file = Path(self.shell_configs[shell_type]["rc_file"]).expanduser()
                if rc_file.exists():
                    content = rc_file.read_text(encoding='utf-8')
                    lines = content.split('\n')
                    new_lines = []
                    skip = False
                    
                    for line in lines:
                        if f"# iFlow CLI Integration" in line:
                            skip = True
                        elif skip and line.strip() and not line.startswith('#'):
                            skip = False
                        if not skip:
                            new_lines.append(line)
                    
                    rc_file.write_text('\n'.join(new_lines), encoding='utf-8')
                    print(f"✅ {shell_type} 集成已移除")
                    return True
            
            elif shell_type == 'cmd':
                batch_file = Path(os.environ['USERPROFILE']) / f'{global_command}.bat'
                if batch_file.exists():
                    batch_file.unlink()
                    print("✅ CMD 集成已移除")
                    return True
        
        except Exception as e:
            print(f"❌ 卸载失败: {e}")
            return False
        
        print(f"⚠️  未找到 {shell_type} 集成")
        return False


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Shell集成工具")
    parser.add_argument("--install", action="store_true", help="安装shell集成")
    parser.add_argument("--uninstall", action="store_true", help="卸载shell集成")
    parser.add_argument("--test", action="store_true", help="测试集成")
    parser.add_argument("--shell", help="指定shell类型 (bash/zsh/fish/powershell/cmd)")
    parser.add_argument("--command", default="ai", help="全局命令名称")
    parser.add_argument("--shortcuts", help="创建快捷命令 (JSON格式)")
    
    args = parser.parse_args()
    
    integration = ShellIntegration()
    
    if args.install:
        integration.install_shell_integration(args.shell, args.command)
        if args.shortcuts:
            shortcuts = json.loads(args.shortcuts)
            integration.create_global_shortcuts(shortcuts)
    
    elif args.uninstall:
        integration.uninstall_shell_integration(args.shell, args.command)
    
    elif args.test:
        integration.test_integration()
    
    else:
        # 自动检测并安装
        shell_type = integration.detect_shell()
        print(f"🔍 检测到shell: {shell_type}")
        
        if integration.install_shell_integration(shell_type, args.command):
            # 创建常用快捷命令
            shortcuts = {
                "ai-chat": "gemini",
                "ai-code": "qodercli", 
                "ai-local": "ollama",
                "ai-list": "list"
            }
            integration.create_global_shortcuts(shortcuts)
        
        integration.test_integration()


if __name__ == "__main__":
    main()