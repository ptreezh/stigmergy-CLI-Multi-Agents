#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量修复安装脚本编码问题
一键更新所有CLI插件的安装脚本，确保跨平台编码安全
"""

import os
import sys
import re
from pathlib import Path
from typing import Dict, List, Tuple

class InstallScriptFixer:
    """安装脚本修复器"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.adapters_root = self.project_root / "src" / "adapters"
        self.core_root = self.project_root / "src" / "core"
        
        # 脚本模板
        self.encoding_template = '''# 导入跨平台编码安全库
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'src' / 'core'))
try:
    from cross_platform_encoding import get_cross_platform_installer, encoding_safe
except ImportError:
    print("❌ 无法导入跨平台编码库，请确保 cross_platform_encoding.py 存在")
    sys.exit(1)'''
        
        self.function_template = '''@encoding_safe
def {function_name}(installer):
    """{docstring}"""'''
        
        self.safe_read_template = '''    # 使用安全读取器读取现有配置
    existing_config = installer.reader.read_{config_type}({config_file})'''
        
        self.safe_write_template = '''    # 使用安全写入器写入配置文件
    if installer.writer.write_{config_type}({config_file}, merged_config, backup=True):'''
        
        self.safe_copy_template = '''    success = installer.copy_adapter_files(
        src_dir=current_dir,
        dst_dir={adapter_dir},
        file_patterns={file_patterns}
    )'''
    
    def fix_all_install_scripts(self) -> bool:
        """修复所有安装脚本"""
        print("🔧 批量修复安装脚本编码问题")
        print("=" * 50)
        
        # 首先确保跨平台编码库存在
        if not self.ensure_encoding_library():
            print("❌ 无法创建跨平台编码库")
            return False
        
        # 获取所有安装脚本
        install_scripts = list(self.adapters_root.glob("*/install_*_integration.py"))
        
        if not install_scripts:
            print("⚠️ 未找到任何安装脚本")
            return True
        
        print(f"📋 找到 {len(install_scripts)} 个安装脚本")
        print()
        
        success_count = 0
        
        for script_path in install_scripts:
            print(f"🔧 修复脚本: {script_path.name}")
            if self.fix_single_script(script_path):
                print(f"   ✅ 修复成功")
                success_count += 1
            else:
                print(f"   ❌ 修复失败")
            print()
        
        print(f"📊 修复结果: {success_count}/{len(install_scripts)} 个脚本修复成功")
        return success_count == len(install_scripts)
    
    def ensure_encoding_library(self) -> bool:
        """确保跨平台编码库存在"""
        encoding_lib_path = self.core_root / "cross_platform_encoding.py"
        
        if encoding_lib_path.exists():
            print(f"✅ 跨平台编码库已存在: {encoding_lib_path}")
            return True
        
        print("⚠️ 跨平台编码库不存在，请先运行主安装器创建")
        return False
    
    def fix_single_script(self, script_path: Path) -> bool:
        """修复单个安装脚本"""
        try:
            # 读取原始脚本
            with open(script_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 修复导入部分
            content = self.fix_imports(content)
            
            # 修复函数定义
            content = self.fix_function_definitions(content)
            
            # 修复文件读写操作
            content = self.fix_file_operations(content)
            
            # 修复main函数调用
            content = self.fix_main_function(content)
            
            # 写回文件
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return True
            
        except Exception as e:
            print(f"   ❌ 修复出错: {e}")
            return False
    
    def fix_imports(self, content: str) -> str:
        """修复导入部分"""
        lines = content.split('\n')
        new_lines = []
        
        # 找到导入部分的结束位置
        import_end_idx = -1
        for i, line in enumerate(lines):
            if line.strip().startswith('from pathlib import Path') or \
               line.strip().startswith('from datetime import datetime'):
                import_end_idx = i
                break
        
        if import_end_idx == -1:
            return content
        
        # 重新构建导入部分
        for i, line in enumerate(lines):
            new_lines.append(line)
            
            # 在Path导入后添加编码库导入
            if i == import_end_idx:
                new_lines.append('')
                new_lines.append(self.encoding_template)
                break
        
        # 添加剩余内容
        new_lines.extend(lines[import_end_idx + 1:])
        
        return '\n'.join(new_lines)
    
    def fix_function_definitions(self, content: str) -> str:
        """修复函数定义"""
        # 识别需要修复的函数
        functions_to_fix = [
            r'def create_.*_config_directory\(',
            r'def install_.*_hooks\(',
            r'def install_.*_plugins\(', 
            r'def install_.*_extensions\(',
            r'def copy_adapter_file\(',
            r'def verify_installation\(',
            r'def uninstall_.*_integration\('
        ]
        
        # 添加装饰器
        for func_pattern in functions_to_fix:
            content = re.sub(
                rf'(def {func_pattern})',
                r'@encoding_safe\n\1',
                content
            )
        
        # 添加installer参数
        content = re.sub(
            r'(def create_.*_config_directory)\(\):',
            r'\1(installer):',
            content
        )
        
        content = re.sub(
            r'(def install_.*_hooks)\(\):',
            r'\1(installer):',
            content
        )
        
        content = re.sub(
            r'(def install_.*_plugins)\(\):',
            r'\1(installer):',
            content
        )
        
        content = re.sub(
            r'(def install_.*_extensions)\(\):',
            r'\1(installer):',
            content
        )
        
        content = re.sub(
            r'(def copy_adapter_file)\(\):',
            r'\1(installer):',
            content
        )
        
        content = re.sub(
            r'(def verify_installation)\(\):',
            r'\1(installer):',
            content
        )
        
        content = re.sub(
            r'(def uninstall_.*_integration)\(\):',
            r'\1(installer):',
            content
        )
        
        return content
    
    def fix_file_operations(self, content: str) -> str:
        """修复文件读写操作"""
        # 修复JSON读取
        content = re.sub(
            r'existing_config = \{\}\s*if os\.path\.exists\(.*?\):\s*try:\s*with open\((.*?), [\'"]r[\'"], encoding=[\'"]utf-8[\'"]\) as f:\s*existing_config = json\.load\(f\)',
            r'existing_config = installer.reader.read_json(\1)',
            content,
            flags=re.DOTALL
        )
        
        # 修复YAML读取
        content = re.sub(
            r'existing_config = \{\}\s*if os\.path\.exists\(.*?\):\s*try:\s*import yaml\s*with open\((.*?), [\'"]r[\'"], encoding=[\'"]utf-8[\'"]\) as f:\s*existing_config = yaml\.safe_load\(f\) or \{\}',
            r'existing_config = installer.reader.read_yaml(\1)',
            content,
            flags=re.DOTALL
        )
        
        # 修复JSON写入
        content = re.sub(
            r'try:\s*with open\((.*?), [\'"]w[\'"], encoding=[\'"]utf-8[\'"]\) as f:\s*json\.dump\((.*?), f, indent=2, ensure_ascii=False\)\s*print\(.*?\)\s*return True\s*except Exception as e:\s*print\(.*?\)\s*return False',
            r'if installer.writer.write_json(\1, \2, backup=True):\n        print(f"[OK] 配置已安装: {\1}")\n        return True\n    else:\n        print("❌ 安装配置失败")\n        return False',
            content,
            flags=re.DOTALL
        )
        
        # 修复YAML写入
        content = re.sub(
            r'try:\s*import yaml\s*with open\((.*?), [\'"]w[\'"], encoding=[\'"]utf-8[\'"]\) as f:\s*yaml\.dump\((.*?), f, default_flow_style=False, allow_unicode=True\)\s*print\(.*?\)\s*return True\s*except Exception as e:\s*print\(.*?\)\s*return False',
            r'if installer.writer.write_yaml(\1, \2, backup=True):\n        print(f"[OK] 配置已安装: {\1}")\n        return True\n    else:\n        print("❌ 安装配置失败")\n        return False',
            content,
            flags=re.DOTALL
        )
        
        return content
    
    def fix_main_function(self, content: str) -> str:
        """修复main函数"""
        # 添加获取安装器的代码
        content = re.sub(
            r'(args = parser\.parse_args\(\))',
            r'\1\n\n    # 获取跨平台安装器\n    installer = get_cross_platform_installer()',
            content
        )
        
        # 添加系统信息显示
        content = re.sub(
            r'(print\("\[INSTALL\].*"\))',
            r'\1\n    print("=" * 60)\n    \n    # 显示系统信息\n    installer.print_system_info()',
            content
        )
        
        # 修复函数调用
        content = re.sub(
            r'dir_success = create_.*_config_directory\(\)',
            r'dir_success = create_.*_config_directory(installer)',
            content
        )
        
        content = re.sub(
            r'hooks_success = install_.*_hooks\(\)',
            r'hooks_success = install_.*_hooks(installer)',
            content
        )
        
        content = re.sub(
            r'plugins_success = install_.*_plugins\(\)',
            r'plugins_success = install_.*_plugins(installer)',
            content
        )
        
        content = re.sub(
            r'extensions_success = install_.*_extensions\(\)',
            r'extensions_success = install_.*_extensions(installer)',
            content
        )
        
        content = re.sub(
            r'adapter_success = copy_adapter_file\(\)',
            r'adapter_success = copy_adapter_file(installer)',
            content
        )
        
        content = re.sub(
            r'verify_success = verify_installation\(\)',
            r'verify_success = verify_installation(installer)',
            content
        )
        
        content = re.sub(
            r'success = uninstall_.*_integration\(\)',
            r'success = uninstall_.*_integration(installer)',
            content
        )
        
        content = re.sub(
            r'success = verify_installation\(\)',
            r'success = verify_installation(installer)',
            content
        )
        
        return content

def main():
    """主函数"""
    try:
        fixer = InstallScriptFixer()
        success = fixer.fix_all_install_scripts()
        
        if success:
            print("\n🎉 所有安装脚本修复完成！")
            print("\n🚀 下一步:")
            print("   1. 运行: python universal_cli_installer.py")
            print("   2. 选择安装所需的CLI工具")
        else:
            print("\n❌ 部分脚本修复失败，请检查错误信息")
            return 1
        
    except KeyboardInterrupt:
        print("\n\n👋 用户中断操作")
    except Exception as e:
        print(f"\n❌ 修复过程出错: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())