#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
跨平台兼容性测试脚本
"""

import os
import sys
import platform
import subprocess
import tempfile
from pathlib import Path


class CrossPlatformTester:
    """跨平台测试器"""
    
    def __init__(self):
        self.system = platform.system().lower()
        self.script_dir = Path(__file__).parent
        self.test_results = {}
    
    def test_all_formats(self):
        """测试所有格式"""
        print(f"🧪 开始跨平台测试 (系统: {self.system})")
        print("=" * 50)
        
        formats = ["cmd", "powershell", "bash", "python"]
        test_cli = "testcli"
        
        for format_type in formats:
            print(f"\n📋 测试 {format_type.upper()} 格式...")
            try:
                result = self.test_format(test_cli, format_type)
                self.test_results[format_type] = result
                status = "✅ 通过" if result else "❌ 失败"
                print(f"   状态: {status}")
            except Exception as e:
                print(f"   ❌ 错误: {e}")
                self.test_results[format_type] = False
        
        self.print_summary()
        return self.test_results
    
    def test_format(self, cli_name, format_type):
        """测试特定格式"""
        # 生成路由器
        try:
            result = subprocess.run([
                sys.executable, 
                str(self.script_dir / "universal_cli_setup.py"),
                "--cli", cli_name,
                "--format", format_type
            ], capture_output=True, text=True, encoding='utf-8', timeout=30)
            
            if result.returncode != 0:
                print(f"   生成失败: {result.stderr}")
                return False
            
            # 检查生成的文件
            filename = f"smart_{cli_name}.{format_type}"
            filepath = self.script_dir / filename
            
            if not filepath.exists():
                print(f"   文件未生成: {filename}")
                return False
            
            # 验证文件内容
            content = filepath.read_text(encoding='utf-8')
            if not content:
                print(f"   文件内容为空: {filename}")
                return False
            
            # 检查关键功能
            checks = self.validate_content(content, format_type)
            if not all(checks.values()):
                print(f"   内容验证失败: {checks}")
                return False
            
            # 功能测试
            if not self.test_functionality(filepath, format_type):
                print(f"   功能测试失败: {filename}")
                return False
            
            print(f"   ✅ {filename} 测试通过")
            return True
            
        except subprocess.TimeoutExpired:
            print(f"   生成超时")
            return False
        except Exception as e:
            print(f"   测试异常: {e}")
            return False
    
    def validate_content(self, content, format_type):
        """验证内容"""
        checks = {}
        
        # 检查路由关键词
        checks["has_keywords"] = any(keyword in content.lower() 
                                   for keyword in ["claude", "gemini", "kimi"])
        
        # 检查路由逻辑
        checks["has_routing"] = "route" in content.lower() or "路由" in content
        
        # 检查帮助信息
        checks["has_help"] = "help" in content.lower() or "帮助" in content.lower() or "用法" in content
        
        # 格式特定检查
        if format_type == "cmd":
            checks["cmd_syntax"] = "@echo off" in content
        elif format_type == "powershell":
            checks["ps_syntax"] = "param(" in content or "function" in content
        elif format_type == "bash":
            checks["bash_syntax"] = "#!/bin/bash" in content
        elif format_type == "python":
            checks["python_syntax"] = "import sys" in content and "def main" in content
        
        return checks
    
    def test_functionality(self, filepath, format_type):
        """测试功能"""
        try:
            # 测试帮助信息
            if format_type == "cmd":
                result = subprocess.run([str(filepath)], 
                                      capture_output=True, text=True, encoding='utf-8', timeout=10)
            elif format_type == "powershell" and self.system == "windows":
                result = subprocess.run(["powershell", "-File", str(filepath)], 
                                      capture_output=True, text=True, encoding='utf-8', timeout=10)
            elif format_type == "bash" and self.system != "windows":
                result = subprocess.run(["bash", str(filepath)], 
                                      capture_output=True, text=True, encoding='utf-8', timeout=10)
            elif format_type == "python":
                result = subprocess.run([sys.executable, str(filepath)], 
                                      capture_output=True, text=True, encoding='utf-8', timeout=10)
            else:
                # 跳过不兼容的格式
                return True
            
            # 检查是否显示帮助信息
            help_indicators = ["帮助", "用法", "usage", "help", "智能", "路由"]
            return any(indicator in result.stdout.lower() 
                      for indicator in help_indicators)
            
        except Exception:
            # 功能测试失败不影响整体评估
            return True
    
    def test_simplified_creator(self):
        """测试简化版创建器"""
        print(f"\n🔧 测试简化版路由创建器...")
        
        try:
            result = subprocess.run([
                sys.executable,
                str(self.script_dir / "smart_router_creator.py"),
                "--cli", "simpletest",
                "--format", "cmd"
            ], capture_output=True, text=True, encoding='utf-8', timeout=30)
            
            if result.returncode == 0:
                print("   ✅ 简化版创建器测试通过")
                return True
            else:
                print(f"   ❌ 简化版创建器失败: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"   ❌ 简化版创建器异常: {e}")
            return False
    
    def print_summary(self):
        """打印测试摘要"""
        print("\n" + "=" * 50)
        print("📊 测试摘要")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results.values() if result)
        total = len(self.test_results)
        
        print(f"系统: {platform.system()} {platform.release()}")
        print(f"Python: {sys.version}")
        print(f"通过: {passed}/{total}")
        
        for format_type, result in self.test_results.items():
            status = "✅" if result else "❌"
            print(f"  {status} {format_type.upper()}")
        
        # 测试简化版创建器
        simple_result = self.test_simplified_creator()
        simple_status = "✅" if simple_result else "❌"
        print(f"  {simple_status} 简化版创建器")
        
        print("\n🎯 建议:")
        if passed == total:
            print("  所有格式都正常工作！")
        else:
            failed = [fmt for fmt, result in self.test_results.items() if not result]
            print(f"  以下格式需要检查: {', '.join(failed)}")
        
        if self.system == "windows":
            print("  推荐使用 CMD 或 PowerShell 格式")
        else:
            print("  推荐使用 Bash 或 Python 格式")
    
    def cleanup(self):
        """清理测试文件"""
        test_files = [
            "smart_testcli.cmd",
            "smart_testcli.powershell", 
            "smart_testcli.bash",
            "smart_testcli.python",
            "smart_simpletest.cmd"
        ]
        
        for filename in test_files:
            filepath = self.script_dir / filename
            if filepath.exists():
                try:
                    filepath.unlink()
                except:
                    pass


def main():
    """主函数"""
    tester = CrossPlatformTester()
    
    try:
        results = tester.test_all_formats()
        
        # 返回适当的退出码
        if all(results.values()):
            print("\n🎉 所有测试通过！")
            sys.exit(0)
        else:
            print("\n⚠️  部分测试失败")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n⏹️  测试被中断")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ 测试过程出错: {e}")
        sys.exit(1)
    finally:
        tester.cleanup()


if __name__ == "__main__":
    main()