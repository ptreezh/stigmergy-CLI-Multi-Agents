#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Smart CLI Router 项目验证脚本
验证项目完整性和基本功能
"""

import os
import sys
import subprocess
import json
from pathlib import Path


class ProjectValidator:
    """项目验证器"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.errors = []
        self.warnings = []
        self.success_count = 0
        self.total_checks = 0
    
    def log(self, message, level="info"):
        """记录日志"""
        if level == "error":
            self.errors.append(message)
            print(f"❌ {message}")
        elif level == "warning":
            self.warnings.append(message)
            print(f"⚠️  {message}")
        elif level == "success":
            self.success_count += 1
            print(f"✅ {message}")
        else:
            print(f"ℹ️  {message}")
    
    def check_project_structure(self):
        """检查项目结构"""
        print("\n🔍 检查项目结构...")
        self.total_checks += 1
        
        required_dirs = ["src", "docs", "examples", "tests"]
        required_files = [
            "README.md",
            "LICENSE", 
            "setup.py",
            "pyproject.toml",
            "requirements.txt",
            ".gitignore",
            "CHANGELOG.md",
            "CONTRIBUTING.md"
        ]
        
        # 检查目录
        for dir_name in required_dirs:
            dir_path = self.project_root / dir_name
            if dir_path.exists() and dir_path.is_dir():
                self.log(f"目录存在: {dir_name}/")
            else:
                self.log(f"缺少目录: {dir_name}/", "error")
                return
        
        # 检查文件
        for file_name in required_files:
            file_path = self.project_root / file_name
            if file_path.exists() and file_path.is_file():
                self.log(f"文件存在: {file_name}")
            else:
                self.log(f"缺少文件: {file_name}", "error")
                return
        
        self.log("项目结构检查通过", "success")
    
    def check_source_files(self):
        """检查源文件"""
        print("\n📦 检查源文件...")
        self.total_checks += 1
        
        src_dir = self.project_root / "src"
        required_py_files = [
            "universal_cli_setup.py",
            "smart_router_creator.py", 
            "kimi_wrapper.py",
            "shell_integration.py"
        ]
        
        for py_file in required_py_files:
            file_path = src_dir / py_file
            if file_path.exists():
                # 检查Python语法
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    compile(content, str(file_path), 'exec')
                    self.log(f"Python语法正确: {py_file}")
                except SyntaxError as e:
                    self.log(f"Python语法错误 {py_file}: {e}", "error")
                    return
                except Exception as e:
                    self.log(f"文件读取错误 {py_file}: {e}", "error")
                    return
            else:
                self.log(f"缺少源文件: {py_file}", "error")
                return
        
        self.log("源文件检查通过", "success")
    
    def check_documentation(self):
        """检查文档"""
        print("\n📚 检查文档...")
        self.total_checks += 1
        
        docs_dir = self.project_root / "docs"
        required_docs = [
            "UNIVERSAL_CLI_DEPLOYMENT_GUIDE.md",
            "QUICK_START.md",
            "PROJECT_SUMMARY.md"
        ]
        
        for doc_file in required_docs:
            file_path = docs_dir / doc_file
            if file_path.exists():
                # 检查文件大小
                size = file_path.stat().st_size
                if size > 100:  # 至少100字节
                    self.log(f"文档完整: {doc_file} ({size} bytes)")
                else:
                    self.log(f"文档过小: {doc_file} ({size} bytes)", "warning")
            else:
                self.log(f"缺少文档: {doc_file}", "error")
                return
        
        # 检查README
        readme_path = self.project_root / "README.md"
        if readme_path.exists():
            with open(readme_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 检查必要章节
            required_sections = ["特性", "快速开始", "安装", "使用"]
            missing_sections = []
            
            for section in required_sections:
                if section not in content:
                    missing_sections.append(section)
            
            if missing_sections:
                self.log(f"README缺少章节: {', '.join(missing_sections)}", "warning")
            else:
                self.log("README结构完整")
        
        self.log("文档检查通过", "success")
    
    def check_examples(self):
        """检查示例"""
        print("\n🎯 检查示例...")
        self.total_checks += 1
        
        examples_dir = self.project_root / "examples"
        basic_usage = examples_dir / "basic_usage.py"
        
        if basic_usage.exists():
            # 检查Python语法
            try:
                with open(basic_usage, 'r', encoding='utf-8') as f:
                    content = f.read()
                compile(content, str(basic_usage), 'exec')
                self.log("示例代码语法正确")
                
                # 检查示例内容
                if "def example_" in content:
                    self.log("示例包含完整函数")
                else:
                    self.log("示例函数不完整", "warning")
                    
            except SyntaxError as e:
                self.log(f"示例语法错误: {e}", "error")
                return
        else:
            self.log("缺少基本示例文件", "error")
            return
        
        self.log("示例检查通过", "success")
    
    def check_configuration(self):
        """检查配置文件"""
        print("\n⚙️  检查配置文件...")
        self.total_checks += 1
        
        # 检查setup.py
        setup_path = self.project_root / "setup.py"
        if setup_path.exists():
            try:
                with open(setup_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                compile(content, str(setup_path), 'exec')
                self.log("setup.py语法正确")
            except SyntaxError as e:
                self.log(f"setup.py语法错误: {e}", "error")
                return
        
        # 检查pyproject.toml
        pyproject_path = self.project_root / "pyproject.toml"
        if pyproject_path.exists():
            try:
                import toml
                with open(pyproject_path, 'r', encoding='utf-8') as f:
                    config = toml.load(f)
                
                # 检查必要字段
                if "project" in config and "name" in config["project"]:
                    self.log(f"项目名称: {config['project']['name']}")
                else:
                    self.log("pyproject.toml缺少项目信息", "warning")
                    
            except ImportError:
                self.log("缺少toml库，跳过pyproject.toml检查", "warning")
            except Exception as e:
                self.log(f"pyproject.toml格式错误: {e}", "error")
                return
        
        self.log("配置文件检查通过", "success")
    
    def test_basic_functionality(self):
        """测试基本功能"""
        print("\n🧪 测试基本功能...")
        self.total_checks += 1
        
        # 测试导入
        src_dir = self.project_root / "src"
        sys.path.insert(0, str(src_dir))
        
        try:
            # 测试核心模块导入
            import universal_cli_setup
            import smart_router_creator
            
            self.log("核心模块导入成功")
            
            # 测试基本功能
            setup = universal_cli_setup.UniversalCLISetup()
            tools = setup.discover_available_tools()
            
            if isinstance(tools, dict):
                self.log(f"工具检测功能正常 (发现 {len(tools)} 个工具)")
            else:
                self.log("工具检测功能异常", "error")
                return
                
        except ImportError as e:
            self.log(f"模块导入失败: {e}", "error")
            return
        except Exception as e:
            self.log(f"功能测试失败: {e}", "error")
            return
        finally:
            if src_dir in sys.path:
                sys.path.remove(src_dir)
        
        self.log("基本功能测试通过", "success")
    
    def validate_license(self):
        """验证许可证"""
        print("\n📄 验证许可证...")
        self.total_checks += 1
        
        license_path = self.project_root / "LICENSE"
        if license_path.exists():
            with open(license_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if "MIT License" in content:
                self.log("许可证类型正确 (MIT)")
            else:
                self.log("许可证类型不明确", "warning")
            
            if len(content) > 500:
                self.log("许可证内容完整")
            else:
                self.log("许可证内容过短", "warning")
        else:
            self.log("缺少许可证文件", "error")
            return
        
        self.log("许可证验证通过", "success")
    
    def run_validation(self):
        """运行完整验证"""
        print("🚀 Smart CLI Router 项目验证")
        print("=" * 50)
        
        # 运行所有检查
        self.check_project_structure()
        self.check_source_files()
        self.check_documentation()
        self.check_examples()
        self.check_configuration()
        self.test_basic_functionality()
        self.validate_license()
        
        # 输出总结
        print("\n" + "=" * 50)
        print("📊 验证总结")
        print("=" * 50)
        
        print(f"总检查项: {self.total_checks}")
        print(f"通过检查: {self.success_count}")
        print(f"警告数量: {len(self.warnings)}")
        print(f"错误数量: {len(self.errors)}")
        
        if self.errors:
            print("\n❌ 发现错误:")
            for error in self.errors:
                print(f"  - {error}")
        
        if self.warnings:
            print("\n⚠️  警告信息:")
            for warning in self.warnings:
                print(f"  - {warning}")
        
        # 判断验证结果
        if not self.errors:
            if not self.warnings:
                print("\n🎉 项目验证完全通过！可以发布！")
                return True
            else:
                print("\n✅ 项目验证基本通过，有少量警告。")
                return True
        else:
            print("\n❌ 项目验证失败，请修复错误后重试。")
            return False


def main():
    """主函数"""
    validator = ProjectValidator()
    success = validator.run_validation()
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()