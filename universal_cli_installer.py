#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
跨平台统一安装管理器
一键解决所有CLI工具的编码问题和安装问题
"""

import os
import sys
import subprocess
import platform
from pathlib import Path
from typing import List, Dict, Any

# 导入跨平台编码安全库
sys.path.insert(0, str(Path(__file__).parent / 'src' / 'core'))
try:
    from cross_platform_encoding import get_cross_platform_installer, setup_cross_platform_encoding
except ImportError:
    print("❌ 无法导入跨平台编码库，请确保 cross_platform_encoding.py 存在")
    sys.exit(1)

class CLIInstallerManager:
    """CLI工具安装管理器"""
    
    def __init__(self):
        self.installer = setup_cross_platform_encoding()
        self.project_root = Path(__file__).parent
        self.adapters_root = self.project_root / "src" / "adapters"
        
        # 支持的CLI工具列表
        self.supported_clis = [
            {
                "name": "claude",
                "display_name": "Claude CLI",
                "install_script": "install_claude_integration.py",
                "description": "Anthropic Claude CLI工具",
                "required": True
            },
            {
                "name": "gemini",
                "display_name": "Gemini CLI", 
                "install_script": "install_gemini_integration.py",
                "description": "Google Gemini CLI工具",
                "required": True
            },
            {
                "name": "qwencode",
                "display_name": "QwenCode CLI",
                "install_script": "install_qwencode_integration.py", 
                "description": "阿里云QwenCode CLI工具",
                "required": False
            },
            {
                "name": "iflow",
                "display_name": "iFlow CLI",
                "install_script": "install_iflow_integration.py",
                "description": "iFlow工作流CLI工具", 
                "required": False
            },
            {
                "name": "qoder",
                "display_name": "Qoder CLI",
                "install_script": "install_qoder_integration.py",
                "description": "Qoder代码生成CLI工具",
                "required": False
            },
            {
                "name": "codebuddy",
                "display_name": "CodeBuddy CLI", 
                "install_script": "install_codebuddy_integration.py",
                "description": "CodeBuddy编程助手CLI工具",
                "required": False
            },
            {
                "name": "copilot",
                "display_name": "GitHub Copilot CLI",
                "install_script": "install_copilot_integration.py", 
                "description": "GitHub Copilot CLI工具",
                "required": False
            },
            {
                "name": "codex",
                "display_name": "Codex CLI",
                "install_script": "install_codex_integration.py",
                "description": "OpenAI Codex代码分析CLI工具",
                "required": False
            }
        ]
    
    def display_welcome(self):
        """显示欢迎信息"""
        print("🔧 Stigmergy CLI - Multi-Agents跨AI CLI工具协作系统")
        print("=" * 60)
        print("🌐 跨平台编码安全安装管理器")
        print("💡 解决Windows/Linux/macOS上GBK/UTF-8编码冲突问题")
        print()
    
    def display_available_clis(self):
        """显示可用的CLI工具"""
        print("📋 支持的CLI工具:")
        print()
        
        for i, cli in enumerate(self.supported_clis, 1):
            required_mark = "🔴 (必需)" if cli["required"] else "🟢 (可选)"
            status = f"{i:2d}. {cli['display_name']:<20} {required_mark}"
            print(status)
            print(f"     📝 {cli['description']}")
            print()
    
    def run_installation_script(self, cli_name: str, script_path: str, 
                               action: str = "install") -> bool:
        """运行安装脚本"""
        try:
            print(f"🚀 正在{action} {cli_name}...")
            print("-" * 40)
            
            # 构建命令
            cmd = [sys.executable, str(script_path)]
            if action == "verify":
                cmd.append("--verify")
            elif action == "uninstall":
                cmd.append("--uninstall")
            elif action == "install":
                cmd.append("--install")
            
            # 设置环境变量
            env = os.environ.copy()
            env['PYTHONIOENCODING'] = 'utf-8'
            if platform.system().lower() == 'windows':
                env['PYTHONLEGACYWINDOWSSTDIO'] = 'utf-8'
            
            # 运行脚本
            result = subprocess.run(
                cmd,
                cwd=script_path.parent,
                env=env,
                capture_output=False,
                text=True
            )
            
            success = result.returncode == 0
            if success:
                print(f"✅ {cli_name} {action}成功！")
            else:
                print(f"❌ {cli_name} {action}失败！")
            
            print()
            return success
            
        except Exception as e:
            print(f"❌ 运行{cli_name}安装脚本时出错: {e}")
            print()
            return False
    
    def install_cli(self, cli_name: str, action: str = "install") -> bool:
        """安装指定CLI"""
        cli_info = None
        for cli in self.supported_clis:
            if cli["name"] == cli_name:
                cli_info = cli
                break
        
        if not cli_info:
            print(f"❌ 不支持的CLI工具: {cli_name}")
            return False
        
        script_path = self.adapters_root / cli_name / cli_info["install_script"]
        
        if not script_path.exists():
            print(f"❌ 安装脚本不存在: {script_path}")
            return False
        
        return self.run_installation_script(
            cli_info["display_name"], 
            script_path, 
            action
        )
    
    def install_required_clis(self) -> Dict[str, bool]:
        """安装必需的CLI工具"""
        results = {}
        required_clis = [cli for cli in self.supported_clis if cli["required"]]
        
        print("🔴 安装必需CLI工具...")
        print()
        
        for cli in required_clis:
            print(f"📦 安装 {cli['display_name']}...")
            success = self.install_cli(cli["name"], "install")
            results[cli["name"]] = success
            
            if not success:
                print(f"⚠️ {cli['display_name']} 安装失败，但继续安装其他工具...")
        
        return results
    
    def install_optional_clis(self, selected_clis: List[str]) -> Dict[str, bool]:
        """安装可选的CLI工具"""
        results = {}
        optional_clis = [cli for cli in self.supported_clis if not cli["required"]]
        
        for cli in optional_clis:
            if cli["name"] in selected_clis:
                print(f"📦 安装 {cli['display_name']}...")
                success = self.install_cli(cli["name"], "install")
                results[cli["name"]] = success
                
                if not success:
                    print(f"⚠️ {cli['display_name']} 安装失败，但继续安装其他工具...")
        
        return results
    
    def verify_installations(self) -> Dict[str, bool]:
        """验证所有安装"""
        results = {}
        
        print("🔍 验证所有CLI工具安装...")
        print()
        
        for cli in self.supported_clis:
            script_path = self.adapters_root / cli["name"] / cli["install_script"]
            
            if script_path.exists():
                success = self.run_installation_script(
                    cli["display_name"],
                    script_path,
                    "verify"
                )
                results[cli["name"]] = success
            else:
                results[cli["name"]] = False
        
        return results
    
    def interactive_install(self):
        """交互式安装"""
        self.display_welcome()
        self.display_available_clis()
        
        print("🎯 请选择安装模式:")
        print("1. 🔴 安装必需CLI工具 (Claude + Gemini)")
        print("2. 🟢 安装可选CLI工具")
        print("3. 🚀 安装所有CLI工具")
        print("4. 🔍 验证现有安装")
        print("5. 🗑️ 卸载指定CLI工具")
        print("0. 📋 退出")
        print()
        
        while True:
            try:
                choice = input("请输入选择 (0-5): ").strip()
                
                if choice == "0":
                    print("👋 退出安装程序")
                    return
                
                elif choice == "1":
                    results = self.install_required_clis()
                    self.display_installation_summary(results)
                    
                elif choice == "2":
                    selected = self.select_optional_clis()
                    if selected:
                        results = self.install_optional_clis(selected)
                        self.display_installation_summary(results)
                    
                elif choice == "3":
                    # 安装所有
                    print("🚀 安装所有CLI工具...")
                    required_results = self.install_required_clis()
                    all_names = [cli["name"] for cli in self.supported_clis]
                    optional_results = self.install_optional_clis(all_names)
                    results = {**required_results, **optional_results}
                    self.display_installation_summary(results)
                    
                elif choice == "4":
                    results = self.verify_installations()
                    self.display_verification_summary(results)
                    
                elif choice == "5":
                    selected = self.select_clis_for_uninstall()
                    if selected:
                        for cli_name in selected:
                            self.install_cli(cli_name, "uninstall")
                
                else:
                    print("❌ 无效选择，请重新输入")
                    continue
                
                break
                
            except KeyboardInterrupt:
                print("\n\n👋 用户取消操作")
                return
            except Exception as e:
                print(f"❌ 操作出错: {e}")
                continue
    
    def select_optional_clis(self) -> List[str]:
        """选择可选CLI工具"""
        optional_clis = [cli for cli in self.supported_clis if not cli["required"]]
        
        if not optional_clis:
            print("📋 没有可选的CLI工具")
            return []
        
        print("\n🟢 可选CLI工具列表:")
        for i, cli in enumerate(optional_clis, 1):
            print(f"{i}. {cli['display_name']} - {cli['description']}")
        
        print("\n输入数字选择工具（用逗号分隔多个选择）:")
        selection = input("选择 (例如: 1,3,5): ").strip()
        
        if not selection:
            return []
        
        selected_clis = []
        try:
            indices = [int(x.strip()) for x in selection.split(',')]
            for index in indices:
                if 1 <= index <= len(optional_clis):
                    selected_clis.append(optional_clis[index - 1]["name"])
                else:
                    print(f"⚠️ 忽略无效选择: {index}")
        except ValueError:
            print("❌ 输入格式错误")
            return []
        
        return selected_clis
    
    def select_clis_for_uninstall(self) -> List[str]:
        """选择要卸载的CLI工具"""
        print("\n🗑️ 选择要卸载的CLI工具:")
        for i, cli in enumerate(self.supported_clis, 1):
            print(f"{i}. {cli['display_name']}")
        
        print("\n输入数字选择工具（用逗号分隔多个选择）:")
        selection = input("选择 (例如: 1,3,5): ").strip()
        
        if not selection:
            return []
        
        selected_clis = []
        try:
            indices = [int(x.strip()) for x in selection.split(',')]
            for index in indices:
                if 1 <= index <= len(self.supported_clis):
                    selected_clis.append(self.supported_clis[index - 1]["name"])
                else:
                    print(f"⚠️ 忽略无效选择: {index}")
        except ValueError:
            print("❌ 输入格式错误")
            return []
        
        return selected_clis
    
    def display_installation_summary(self, results: Dict[str, bool]):
        """显示安装摘要"""
        print("\n" + "=" * 60)
        print("📊 安装结果摘要:")
        print()
        
        success_count = 0
        total_count = len(results)
        
        for cli_name, success in results.items():
            cli_info = next((cli for cli in self.supported_clis if cli["name"] == cli_name), None)
            if cli_info:
                status = "✅ 成功" if success else "❌ 失败"
                print(f"   {cli_info['display_name']:<20} {status}")
                if success:
                    success_count += 1
        
        print()
        print(f"📈 总计: {success_count}/{total_count} 个工具安装成功")
        
        if success_count == total_count:
            print("🎉 所有工具安装完成！")
            print("\n🚀 下一步:")
            print("   1. 运行: stigmergy-cli init")
            print("   2. 开始使用: claude-cli '请用gemini帮我分析代码'")
        else:
            print("⚠️ 部分工具安装失败，请检查错误信息")
    
    def display_verification_summary(self, results: Dict[str, bool]):
        """显示验证摘要"""
        print("\n" + "=" * 60)
        print("🔍 验证结果摘要:")
        print()
        
        success_count = 0
        total_count = len(results)
        
        for cli_name, success in results.items():
            cli_info = next((cli for cli in self.supported_clis if cli["name"] == cli_name), None)
            if cli_info:
                status = "✅ 正常" if success else "❌ 异常"
                print(f"   {cli_info['display_name']:<20} {status}")
                if success:
                    success_count += 1
        
        print()
        print(f"📈 总计: {success_count}/{total_count} 个工具状态正常")
        
        if success_count == total_count:
            print("🎉 所有工具验证通过！")
        else:
            print("⚠️ 部分工具存在问题，建议重新安装")

def main():
    """主函数"""
    try:
        manager = CLIInstallerManager()
        manager.interactive_install()
    except KeyboardInterrupt:
        print("\n\n👋 用户中断操作")
    except Exception as e:
        print(f"\n❌ 程序运行出错: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())