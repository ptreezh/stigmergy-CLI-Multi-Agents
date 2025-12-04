#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Stigmergy CLI Multi-Agents 主执行脚本
一键启动跨平台安全的CLI协作系统
"""

import os
import sys
import json
import platform
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime

# 导入核心模块
sys.path.insert(0, str(Path(__file__).parent / 'src' / 'core'))

try:
    from cross_platform_encoding import get_cross_platform_installer, encoding_safe
    from cross_platform_safe_cli import get_cli_executor, CLICommand, CLIStatus
    from cross_cli_mapping import CrossCLIMapper, CollaborationType
except ImportError as e:
    print(f"❌ 核心模块导入失败: {e}")
    print("💡 请确保所有依赖文件已正确安装")
    sys.exit(1)

class StigmergyCLIMain:
    """Stigmergy CLI Multi-Agents 主执行器"""
    
    def __init__(self):
        self.encoding_installer = get_cross_platform_installer()
        self.cli_executor = get_cli_executor()
        self.cli_mapper = CrossCLIMapper()
        self.project_root = Path(__file__).parent
        self.system = platform.system().lower()
        
    @encoding_safe
    def run(self) -> int:
        """主执行流程"""
        print("🔧 Stigmergy CLI - Multi-Agents跨AI CLI工具协作系统")
        print("=" * 60)
        print("🌐 跨平台编码安全 | 🔗 跨CLI协作 | 🔒 权限管理")
        print()
        
        # 显示系统信息
        self.encoding_installer.print_system_info()
        print()
        
        # 主菜单
        while True:
            try:
                choice = self._show_main_menu()
                
                if choice == '0':
                    print("👋 退出 Stigmergy CLI 系统")
                    return 0
                
                result = self._handle_menu_choice(choice)
                if result == -1:
                    print("❌ 命令执行失败，请检查错误信息")
                elif result == -2:
                    print("👋 用户取消操作")
                    return 0
                    
                input("\n按回车键继续...")
                
            except KeyboardInterrupt:
                print("\n\n👋 用户中断操作")
                return 0
            except Exception as e:
                print(f"\n❌ 执行出错: {e}")
                input("按回车键继续...")
    
    def _show_main_menu(self) -> str:
        """Show main menu"""
        print("🎯 Please select an operation:")
        print("1. 📊 Check all CLI tools status")
        print("2. 🔧 Generate/Update global memory documents")
        print("3. 🔗 Cross-CLI collaboration suggestions")
        print("4. 🚀 Execute cross-CLI commands")
        print("5. 🔍 Verify installation and configuration")
        print("6. 🛠️ System diagnosis and repair")
        print("7. 📚 View CLI documentation")
        print("8. ⚙️ System configuration management")
        print("0. 📋 Exit")
        print()

        choice = input("Please enter your choice (0-8): ").strip()
        return choice
    
    def _handle_menu_choice(self, choice: str) -> int:
        """处理菜单选择"""
        handlers = {
            '1': self._check_cli_status,
            '2': self._generate_global_memory,
            '3': self._suggest_collaboration,
            '4': self._execute_cross_cli_command,
            '5': self._verify_installation,
            '6': self._system_diagnosis,
            '7': self._view_documentation,
            '8': self._system_configuration
        }
        
        handler = handlers.get(choice)
        if handler:
            return handler()
        else:
            print("❌ Invalid choice, please re-enter")
            return 0
    
    def _check_cli_status(self) -> int:
        """Check CLI status"""
        print("📊 Check CLI tools status")
        print("-" * 40)

        all_available = True
        total_count = len(self.cli_executor.cli_configs)
        available_count = 0

        for cli_name, config in self.cli_executor.cli_configs.items():
            status, message = self.cli_executor.check_cli_status(cli_name)

            # Status icon
            if status == CLIStatus.AUTHENTICATED:
                icon = "✅"
                available_count += 1
            elif status == CLIStatus.CONFIGURED:
                icon = "🟡"
                available_count += 1
            elif status == CLIStatus.AVAILABLE or status == CLIStatus.INSTALLED:
                icon = "🟠"
                available_count += 1
            else:
                icon = "❌"
                all_available = False

            print(f"   {icon} {config.display_name:<20} {status.value}")
            print(f"      💬 {message}")
            print()

        print(f"📊 Status Summary: {available_count}/{total_count} CLI tools available")

        if all_available:
            print("🎉 All CLI tools are available!")
        else:
            print("⚠️ Some CLI tools require configuration or installation")

        return 0
    
    def _generate_global_memory(self) -> int:
        """Generate global memory documents"""
        print("🔧 Generate Global Memory Documents")
        print("-" * 40)

        try:
            # Import global memory generator
            from generate_global_memory import GlobalMemoryGenerator
            generator = GlobalMemoryGenerator()

            success = generator.generate_all_memories()

            if success:
                print("🎉 Global memory documents generation completed!")
                memory_dir = Path('.') / 'global_memory'
                if memory_dir.exists():
                    print("📁 Generated documents:")
                    for file_path in memory_dir.glob('*'):
                        print(f"   📄 {file_path}")
            else:
                print("❌ Global memory documents generation failed")
                return -1

        except ImportError:
            print("❌ Unable to import global memory generator")
            return -1
        except Exception as e:
            print(f"❌ Generation process error: {e}")
            return -1

        return 0
    
    def _suggest_collaboration(self) -> int:
        """协作建议"""
        print("🔗 跨CLI协作建议")
        print("-" * 40)
        
        available_clis = []
        for cli_name, config in self.cli_executor.cli_configs.items():
            status, _ = self.cli_executor.check_cli_status(cli_name)
            if status in [CLIStatus.AUTHENTICATED, CLIStatus.CONFIGURED, CLIStatus.AVAILABLE, CLIStatus.INSTALLED]:
                available_clis.append(cli_name)
        
        if len(available_clis) < 2:
            print("⚠️ Available CLI tools less than 2, cannot perform collaboration")
            return 0

        print("💡 Enter task description to get collaboration suggestions:")
        task_description = input("Task description: ").strip()

        if not task_description:
            print("⚠️ Task description cannot be empty")
            return 0

        suggestions = self.cli_mapper.suggest_optimal_collaboration(
            task_description, available_clis
        )

        if not suggestions:
            print("⚠️ No suitable collaboration plans found")
            return 0

        print("\n🎯 Recommended collaboration plans:")
        for i, (source, target, score) in enumerate(suggestions[:5], 1):
            source_compat = self.cli_mapper.get_cli_compatibility(source)
            target_compat = self.cli_mapper.get_cli_compatibility(target)

            source_strength = source_compat.strengths[0] if source_compat.strengths else "Comprehensive capability"
            target_strength = target_compat.strengths[0] if target_compat.strengths else "Comprehensive capability"
            
            print(f"   {i}. {source} → {target} (Match Score: {score:.2f})")
            print(f"      🔸 {source_strength} → {target_strength}")

        return 0
    
    def _execute_cross_cli_command(self) -> int:
        """执行跨CLI命令"""
        print("🚀 执行跨CLI命令")
        print("-" * 40)
        
        # Show available CLI
        available_clis = []
        print("📋 Available CLI tools:")
        for i, (cli_name, config) in enumerate(self.cli_executor.cli_configs.items(), 1):
            status, _ = self.cli_executor.check_cli_status(cli_name)
            if status in [CLIStatus.AUTHENTICATED, CLIStatus.CONFIGURED]:
                icon = "✅"
                available_clis.append(cli_name)
            else:
                icon = "❌"

            print(f"   {i:2d}. {icon} {config.display_name}")

        if len(available_clis) < 1:
            print("⚠️ No available CLI tools")
            return 0

        # Select CLI
        try:
            cli_choice = int(input(f"\nSelect CLI tool (1-{len(available_clis)}): ")) - 1
            if cli_choice < 0 or cli_choice >= len(available_clis):
                print("❌ Invalid choice")
                return 0

            selected_cli = available_clis[cli_choice]
        except ValueError:
            print("❌ Input format error")
            return 0

        # Get command
        print(f"\n🎯 Selected {self.cli_executor.cli_configs[selected_cli].display_name}")
        command_input = input("Please enter command or prompt: ").strip()

        if not command_input:
            print("⚠️ Command cannot be empty")
            return 0
        
        # 检查是否为跨CLI调用
        cross_cli_found = False
        for other_cli in available_clis:
            if other_cli != selected_cli and other_cli in command_input.lower():
                cross_cli_found = True
                break
        
        # 执行命令
        try:
            cli_command = CLICommand(
                cli_name=selected_cli,
                command_type='prompt',
                command=command_input,
                description=f"执行用户命令: {command_input[:50]}...",
                parameters={},
                input_files=[],
                output_files=[]
            )
            
            print(f"\n🚀 执行命令: {selected_cli} '{command_input}'")
            print("-" * 40)
            
            result = self.cli_executor.execute_cli_command(cli_command)
            
            if result.success:
                print("✅ 命令执行成功")
                if result.stdout:
                    print("📤 输出:")
                    print(result.stdout)
                
                if result.output_files:
                    print("\n📁 生成的文件:")
                    for name, path in result.output_files.items():
                        print(f"   📄 {name}: {path}")
            else:
                print("❌ 命令执行失败")
                if result.stderr:
                    print("📥 错误信息:")
                    print(result.stderr)
                
                if result.error_message:
                    print(f"📝 错误详情: {result.error_message}")
            
            print(f"\n⏱️ 执行时间: {result.execution_time:.2f}秒")
            
        except Exception as e:
            print(f"❌ 执行出错: {e}")
            return -1
        
        return 0
    
    def _verify_installation(self) -> int:
        """验证安装"""
        print("🔍 验证安装和配置")
        print("-" * 40)
        
        verification_results = {
            'encoding_library': self._verify_encoding_library(),
            'cli_executable': self._verify_cli_executables(),
            'global_memory': self._verify_global_memory(),
            'permissions': self._verify_permissions(),
            'configuration': self._verify_configuration()
        }
        
        print("\n📊 验证结果:")
        all_passed = True
        
        for component, result in verification_results.items():
            status_icon = "✅" if result['passed'] else "❌"
            component_name = self._get_component_display_name(component)
            print(f"   {status_icon} {component_name}")
            
            if not result['passed']:
                all_passed = False
                for issue in result['issues']:
                    print(f"      ⚠️ {issue}")
        
        print(f"\n📊 验证摘要: {'通过' if all_passed else '失败'}")
        
        if all_passed:
            print("🎉 系统验证通过，可以正常使用！")
        else:
            print("⚠️ 存在问题，建议运行系统诊断和修复")
        
        return 0
    
    def _system_diagnosis(self) -> int:
        """系统诊断"""
        print("🛠️ 系统诊断和修复")
        print("-" * 40)
        
        issues_found = []
        fixes_applied = []
        
        # 诊断各个组件
        diagnosis_results = [
            self._diagnose_encoding_environment(),
            self._diagnose_cli_installations(),
            self._diagnose_file_permissions(),
            self._diagnose_memory_documents()
        ]
        
        # 收集问题和修复
        for result in diagnosis_results:
            issues_found.extend(result['issues'])
            fixes_applied.extend(result['fixes'])
        
        # 显示诊断结果
        if not issues_found:
            print("✅ 系统诊断通过，未发现问题")
        else:
            print(f"🔍 发现 {len(issues_found)} 个问题:")
            for i, issue in enumerate(issues_found, 1):
                print(f"   {i}. {issue}")
        
        if fixes_applied:
            print(f"\n🔧 应用了 {len(fixes_applied)} 个修复:")
            for i, fix in enumerate(fixes_applied, 1):
                print(f"   {i}. {fix}")
        
        return 0
    
    def _view_documentation(self) -> int:
        """查看文档"""
        print("📚 查看CLI文档")
        print("-" * 40)
        
        memory_dir = Path('.') / 'global_memory'
        if not memory_dir.exists():
            print("❌ 全局记忆文档目录不存在")
            print("💡 请先运行选项2生成全局记忆文档")
            return 0
        
        # 列出可用文档
        md_files = list(memory_dir.glob('*_global_memory.md'))
        if not md_files:
            print("❌ 未找到Markdown格式的文档文件")
            return 0
        
        print("📋 可用的文档:")
        for i, file_path in enumerate(md_files, 1):
            cli_name = file_path.stem.replace('_global_memory', '')
            config = self.cli_executor.cli_configs.get(cli_name)
            display_name = config.display_name if config else cli_name.upper()
            print(f"   {i:2d}. {display_name}")
        
        try:
            choice = int(input(f"\n选择要查看的文档 (1-{len(md_files)}): ")) - 1
            if choice < 0 or choice >= len(md_files):
                print("❌ 无效选择")
                return 0
            
            selected_file = md_files[choice]
            
            # 显示文档内容
            print(f"\n📖 {selected_file.name}")
            print("=" * 60)
            
            with open(selected_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 限制显示长度
            max_lines = 50
            lines = content.split('\n')
            
            if len(lines) > max_lines:
                print('\n'.join(lines[:max_lines]))
                print(f"\n... (还有 {len(lines) - max_lines} 行)")
                show_more = input("是否显示全部内容? (y/N): ").strip().lower()
                if show_more == 'y':
                    print('\n'.join(lines[max_lines:]))
            else:
                print(content)
            
        except ValueError:
            print("❌ 输入格式错误")
            return 0
        except Exception as e:
            print(f"❌ 读取文档失败: {e}")
            return -1
        
        return 0
    
    def _system_configuration(self) -> int:
        """系统配置"""
        print("⚙️ 系统配置管理")
        print("-" * 40)
        
        print("🎯 请选择配置操作:")
        print("1. 查看当前配置")
        print("2. 修改环境变量")
        print("3. 重置配置")
        print("4. 导出/导入配置")
        print("0. 返回主菜单")
        print()
        
        choice = input("请输入选择 (0-4): ").strip()
        
        if choice == '1':
            return self._view_configuration()
        elif choice == '2':
            return self._modify_environment()
        elif choice == '3':
            return self._reset_configuration()
        elif choice == '4':
            return self._export_import_config()
        elif choice == '0':
            return 0
        else:
            print("❌ 无效选择")
            return 0
    
    # 以下是各种验证和诊断方法的实现
    
    def _verify_encoding_library(self) -> Dict[str, Any]:
        """验证编码库"""
        result = {'passed': True, 'issues': [], 'fixes': []}
        
        try:
            from cross_platform_encoding import get_cross_platform_installer
            installer = get_cross_platform_installer()
            result['passed'] = True
        except ImportError as e:
            result['passed'] = False
            result['issues'].append(f"编码库导入失败: {e}")
            result['fixes'].append("请重新安装项目依赖")
        
        return result
    
    def _verify_cli_executables(self) -> Dict[str, Any]:
        """验证CLI可执行文件"""
        result = {'passed': True, 'issues': [], 'fixes': []}
        
        missing_clis = []
        for cli_name, config in self.cli_executor.cli_configs.items():
            try:
                subprocess.run(
                    [config.command, '--version'],
                    capture_output=True,
                    timeout=5
                )
            except (subprocess.TimeoutExpired, FileNotFoundError):
                missing_clis.append(config.display_name)
                result['passed'] = False
        
        if missing_clis:
            result['issues'].append(f"未安装的CLI: {', '.join(missing_clis)}")
            result['fixes'].append("运行安装命令安装缺失的CLI工具")
        
        return result
    
    def _verify_global_memory(self) -> Dict[str, Any]:
        """验证全局记忆文档"""
        result = {'passed': True, 'issues': [], 'fixes': []}
        
        memory_dir = Path('.') / 'global_memory'
        if not memory_dir.exists():
            result['passed'] = False
            result['issues'].append("全局记忆文档目录不存在")
            result['fixes'].append("运行生成全局记忆文档")
            return result
        
        for cli_name in self.cli_executor.cli_configs.keys():
            json_file = memory_dir / f'{cli_name}_global_memory.json'
            md_file = memory_dir / f'{cli_name}_global_memory.md'
            
            if not json_file.exists():
                result['issues'].append(f"缺少 {cli_name} 的JSON记忆文档")
                result['passed'] = False
            
            if not md_file.exists():
                result['issues'].append(f"缺少 {cli_name} 的Markdown记忆文档")
                result['passed'] = False
        
        if result['issues']:
            result['fixes'].append("重新生成全局记忆文档")
        
        return result
    
    def _verify_permissions(self) -> Dict[str, Any]:
        """验证权限"""
        result = {'passed': True, 'issues': [], 'fixes': []}
        
        # 检查临时目录写权限
        try:
            test_file = Path(tempfile.gettempdir()) / 'stigmergy_test.tmp'
            test_file.write_text('test')
            test_file.unlink()
        except Exception:
            result['passed'] = False
            result['issues'].append("临时目录写权限不足")
            result['fixes'].append("检查用户权限或以管理员身份运行")
        
        return result
    
    def _verify_configuration(self) -> Dict[str, Any]:
        """验证配置"""
        result = {'passed': True, 'issues': [], 'fixes': []}
        
        missing_env_vars = []
        for cli_name, config in self.cli_executor.cli_configs.items():
            for var in config.required_env_vars:
                if not os.environ.get(var):
                    missing_env_vars.append(f"{config.display_name}: {var}")
        
        if missing_env_vars:
            result['passed'] = False
            result['issues'].append(f"缺少环境变量: {', '.join(missing_env_vars)}")
            result['fixes'].append("配置必需的环境变量")
        
        return result
    
    def _diagnose_encoding_environment(self) -> Dict[str, List[str]]:
        """诊断编码环境"""
        result = {'issues': [], 'fixes': []}
        
        # 设置编码环境变量
        if 'PYTHONIOENCODING' not in os.environ:
            os.environ['PYTHONIOENCODING'] = 'utf-8'
            result['fixes'].append("设置 PYTHONIOENCODING=utf-8")
        
        if self.system == 'windows' and 'PYTHONLEGACYWINDOWSSTDIO' not in os.environ:
            os.environ['PYTHONLEGACYWINDOWSSTDIO'] = 'utf-8'
            result['fixes'].append("设置 PYTHONLEGACYWINDOWSSTDIO=utf-8")
        
        return result
    
    def _diagnose_cli_installations(self) -> Dict[str, List[str]]:
        """诊断CLI安装"""
        result = {'issues': [], 'fixes': []}
        
        # 这里可以添加更多诊断逻辑
        return result
    
    def _diagnose_file_permissions(self) -> Dict[str, List[str]]:
        """诊断文件权限"""
        result = {'issues': [], 'fixes': []}
        
        # 确保必要目录存在并有正确权限
        directories_to_check = [
            Path('.') / 'global_memory',
            Path('.') / 'src' / 'core',
            Path('.') / 'logs'
        ]
        
        for directory in directories_to_check:
            try:
                directory.mkdir(exist_ok=True)
                # 测试写权限
                test_file = directory / 'permission_test.tmp'
                test_file.write_text('test')
                test_file.unlink()
            except Exception as e:
                result['issues'].append(f"目录权限问题: {directory}")
                result['fixes'].append(f"修复 {directory} 目录权限")
        
        return result
    
    def _diagnose_memory_documents(self) -> Dict[str, List[str]]:
        """诊断记忆文档"""
        result = {'issues': [], 'fixes': []}
        
        memory_dir = Path('.') / 'global_memory'
        if not memory_dir.exists():
            memory_dir.mkdir(exist_ok=True)
            result['fixes'].append("创建全局记忆文档目录")
        
        return result
    
    def _get_component_display_name(self, component: str) -> str:
        """获取组件显示名称"""
        display_names = {
            'encoding_library': '编码库',
            'cli_executable': 'CLI可执行文件',
            'global_memory': '全局记忆文档',
            'permissions': '文件权限',
            'configuration': '系统配置'
        }
        return display_names.get(component, component)
    
    def _view_configuration(self) -> int:
        """查看当前配置"""
        print("📋 当前系统配置")
        print("-" * 40)
        
        print("🔧 编码环境:")
        print(f"   PYTHONIOENCODING: {os.environ.get('PYTHONIOENCODING', '未设置')}")
        print(f"   PYTHONLEGACYWINDOWSSTDIO: {os.environ.get('PYTHONLEGACYWINDOWSSTDIO', '未设置')}")
        print()
        
        print("🌐 系统信息:")
        print(f"   操作系统: {platform.system()} {platform.release()}")
        print(f"   Python版本: {sys.version.split()[0]}")
        print(f"   工作目录: {Path.cwd()}")
        print()
        
        print("🔑 环境变量状态:")
        for cli_name, config in self.cli_executor.cli_configs.items():
            status, _ = self.cli_executor.check_cli_status(cli_name)
            if status in [CLIStatus.AUTHENTICATED, CLIStatus.CONFIGURED]:
                print(f"   ✅ {config.display_name}: 已配置")
            else:
                missing_vars = [var for var in config.required_env_vars if not os.environ.get(var)]
                if missing_vars:
                    print(f"   ❌ {config.display_name}: 缺少 {', '.join(missing_vars)}")
                else:
                    print(f"   ⚠️ {config.display_name}: 未认证")
        
        return 0
    
    def _modify_environment(self) -> int:
        """修改环境变量"""
        print("🔧 修改环境变量")
        print("-" * 40)
        
        print("⚠️ 注意: 这将修改当前会话的环境变量")
        print("💡 永久修改请修改系统环境变量配置")
        print()
        
        # 列出可配置的环境变量
        all_env_vars = set()
        for config in self.cli_executor.cli_configs.values():
            all_env_vars.update(config.required_env_vars + config.optional_env_vars)
        
        print("📋 可配置的环境变量:")
        env_list = sorted(all_env_vars)
        for i, var in enumerate(env_list, 1):
            current_value = os.environ.get(var, '未设置')
            print(f"   {i:2d}. {var}: {current_value}")
        
        try:
            choice = int(input(f"\n选择要修改的环境变量 (1-{len(env_list)}): ")) - 1
            if choice < 0 or choice >= len(env_list):
                print("❌ 无效选择")
                return 0
            
            selected_var = env_list[choice]
            current_value = os.environ.get(selected_var, '')
            
            print(f"\n当前值: {current_value}")
            new_value = input("输入新值 (留空保持不变): ").strip()
            
            if new_value:
                os.environ[selected_var] = new_value
                print(f"✅ 已设置 {selected_var} = {new_value}")
            else:
                print("📝 值未修改")
            
        except ValueError:
            print("❌ 输入格式错误")
            return 0
        
        return 0
    
    def _reset_configuration(self) -> int:
        """重置配置"""
        print("🔄 重置配置")
        print("-" * 40)
        
        confirm = input("⚠️ 确定要重置所有配置吗? (y/N): ").strip().lower()
        if confirm != 'y':
            print("📝 操作已取消")
            return 0
        
        # 重置编码环境
        os.environ['PYTHONIOENCODING'] = 'utf-8'
        if self.system == 'windows':
            os.environ['PYTHONLEGACYWINDOWSSTDIO'] = 'utf-8'
        
        print("✅ 编码环境已重置")
        
        # 清理缓存
        try:
            import tempfile
            cache_dir = Path(tempfile.gettempdir()) / 'stigmergy_cli_safe'
            if cache_dir.exists():
                import shutil
                shutil.rmtree(cache_dir)
                print("✅ 缓存已清理")
        except:
            pass
        
        print("🎉 配置重置完成")
        return 0
    
    def _export_import_config(self) -> int:
        """导出/导入配置"""
        print("📤 导出/导入配置")
        print("-" * 40)
        
        choice = input("选择操作 (1-导出, 2-导入, 0-返回): ").strip()
        
        if choice == '1':
            return self._export_configuration()
        elif choice == '2':
            return self._import_configuration()
        elif choice == '0':
            return 0
        else:
            print("❌ 无效选择")
            return 0
    
    def _export_configuration(self) -> int:
        """导出配置"""
        try:
            config_data = {
                'environment_variables': {},
                'system_info': {
                    'platform': platform.system(),
                    'python_version': sys.version,
                    'working_directory': str(Path.cwd())
                },
                'cli_configurations': {},
                'export_timestamp': datetime.now().isoformat()
            }
            
            # 收集环境变量
            all_env_vars = set()
            for config in self.cli_executor.cli_configs.values():
                all_env_vars.update(config.required_env_vars + config.optional_env_vars)
            
            for var in all_env_vars:
                value = os.environ.get(var)
                if value:
                    config_data['environment_variables'][var] = value
            
            # 收集CLI状态
            for cli_name, config in self.cli_executor.cli_configs.items():
                status, message = self.cli_executor.check_cli_status(cli_name)
                config_data['cli_configurations'][cli_name] = {
                    'status': status.value,
                    'message': message,
                    'display_name': config.display_name
                }
            
            # 保存配置
            config_file = Path('.') / 'stigmergy_config_export.json'
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(config_data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ 配置已导出到: {config_file}")
            return 0
            
        except Exception as e:
            print(f"❌ 导出失败: {e}")
            return -1
    
    def _import_configuration(self) -> int:
        """导入配置"""
        config_file = Path('.') / 'stigmergy_config_export.json'
        
        if not config_file.exists():
            print("❌ 未找到配置文件")
            print("💡 请先导出配置文件")
            return 0
        
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                config_data = json.load(f)
            
            # 导入环境变量
            env_vars = config_data.get('environment_variables', {})
            for var, value in env_vars.items():
                os.environ[var] = value
                print(f"✅ 设置 {var}")
            
            print("🎉 配置导入完成")
            return 0
            
        except Exception as e:
            print(f"❌ 导入失败: {e}")
            return -1

def main():
    """主入口函数"""
    try:
        app = StigmergyCLIMain()
        return app.run()
    except KeyboardInterrupt:
        print("\n\n👋 用户中断操作")
        return 0
    except Exception as e:
        print(f"\n❌ 程序运行出错: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())