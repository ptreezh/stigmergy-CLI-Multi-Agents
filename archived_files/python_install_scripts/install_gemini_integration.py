"""
Gemini CLI Extension集成安装脚本
为Gemini CLI安装跨CLI协作感知能力

使用方法：
python install_gemini_integration.py [--verify|--uninstall]
"""

import os
import sys
import json
import shutil
import argparse
from pathlib import Path
from datetime import datetime

# Gemini CLI配置路径
GEMINI_CONFIG_DIR = os.path.expanduser("~/.config/gemini")
GEMINI_EXTENSIONS_FILE = os.path.join(GEMINI_CONFIG_DIR, "extensions.json")

def create_gemini_config_directory():
    """创建Gemini配置目录"""
    os.makedirs(GEMINI_CONFIG_DIR, exist_ok=True)
    print("[OK] 创建Gemini配置目录: {}".format(GEMINI_CONFIG_DIR))

def install_gemini_extensions():
    """安装Gemini Extension配置"""
    # 读取现有extensions配置
    existing_extensions = {}
    if os.path.exists(GEMINI_EXTENSIONS_FILE):
        try:
            with open(GEMINI_EXTENSIONS_FILE, 'r', encoding='utf-8') as f:
                existing_extensions = json.load(f)
        except Exception as e:
            print("警告: 读取现有extensions配置失败: {}".format(e))
            existing_extensions = {}

    # 定义跨CLI协作的Extension配置
    cross_cli_extensions = {
        "cross_cli_preprocessor": {
            "module": "src.adapters.gemini.extension_adapter",
            "class": "GeminiExtensionAdapter",
            "enabled": True,
            "priority": 100,
            "config": {
                "cross_cli_enabled": True,
                "supported_clis": ["claude", "qwencode", "iflow", "qoder", "codebuddy", "copilot"],
                "auto_detect": True,
                "timeout": 30,
                "error_handling": "continue",
                "collaboration_mode": "active"
            }
        },
        "cross_cli_response_processor": {
            "module": "src.adapters.gemini.extension_adapter",
            "class": "GeminiExtensionAdapter",
            "enabled": True,
            "priority": 90,
            "config": {
                "cross_cli_enabled": True,
                "format_cross_cli_results": True,
                "add_collaboration_header": True,
                "include_tool_status": True
            }
        }
    }

    # 合并配置（保留现有配置，添加协作功能）
    merged_extensions = existing_extensions.copy()
    for ext_name, ext_config in cross_cli_extensions.items():
        merged_extensions[ext_name] = ext_config

    # 写入extensions配置文件
    try:
        with open(GEMINI_EXTENSIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(merged_extensions, f, indent=2, ensure_ascii=False)

        print("[OK] Gemini Extension配置已安装: {}".format(GEMINI_EXTENSIONS_FILE))
        print("已安装的Extension:")
        for ext_name in cross_cli_extensions.keys():
            print("   - {}: [OK] 跨CLI协作感知".format(ext_name))

        return True
    except Exception as e:
        print("错误: 安装Gemini Extension配置失败: {}".format(e))
        return False

def copy_adapter_file():
    """复制适配器文件到Gemini配置目录"""
    try:
        # 创建适配器目录
        adapter_dir = os.path.join(GEMINI_CONFIG_DIR, "adapters")
        os.makedirs(adapter_dir, exist_ok=True)

        # 获取当前脚本目录
        current_dir = Path(__file__).parent
        adapter_source = current_dir / "extension_adapter.py"
        adapter_dest = Path(adapter_dir) / "extension_adapter.py"

        # 复制适配器文件
        if adapter_source.exists():
            shutil.copy2(adapter_source, adapter_dest)
            print("[OK] 复制适配器文件: {}".format(adapter_dest))
            return True
        else:
            print("警告: 适配器源文件不存在: {}".format(adapter_source))
            return True  # 不强制要求适配器文件
    except Exception as e:
        print("警告: 复制适配器文件失败: {}".format(e))
        return True  # 不强制要求适配器文件

def verify_installation():
    """验证安装"""
    checks = [
        ("Gemini配置目录", os.path.exists(GEMINI_CONFIG_DIR)),
        ("Gemini Extensions文件", os.path.exists(GEMINI_EXTENSIONS_FILE)),
    ]

    all_passed = True
    for check_name, check_result in checks:
        status = "[OK]" if check_result else "[FAIL]"
        print("{} {}".format(status, check_name))
        if not check_result:
            all_passed = False

    return all_passed

def uninstall_integration():
    """卸载集成"""
    try:
        # 删除extensions配置中的跨CLI适配器
        if os.path.exists(GEMINI_EXTENSIONS_FILE):
            with open(GEMINI_EXTENSIONS_FILE, 'r', encoding='utf-8') as f:
                extensions_config = json.load(f)

            # 移除跨CLI适配器
            extensions_to_remove = ["cross_cli_preprocessor", "cross_cli_response_processor"]
            removed_count = 0
            for ext_name in extensions_to_remove:
                if ext_name in extensions_config:
                    del extensions_config[ext_name]
                    removed_count += 1
                
            # 保存更新后的配置
            if removed_count > 0:
                with open(GEMINI_EXTENSIONS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(extensions_config, f, indent=2, ensure_ascii=False)
                
                print("[OK] 已从Gemini Extensions配置中移除{}个跨CLI适配器".format(removed_count))

        # 删除适配器文件
        adapter_file = Path(GEMINI_CONFIG_DIR) / "adapters" / "extension_adapter.py"
        if adapter_file.exists():
            adapter_file.unlink()
            print("[OK] 已删除Gemini适配器文件")

        print("[OK] Gemini CLI跨CLI集成已卸载")
        return True
    except Exception as e:
        print("错误: 卸载失败: {}".format(e))
        return False

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="Gemini CLI跨CLI集成安装脚本")
    parser.add_argument("--verify", action="store_true", help="验证安装")
    parser.add_argument("--uninstall", action="store_true", help="卸载集成")
    args = parser.parse_args()

    print("Gemini CLI跨CLI集成安装程序")
    print("=" * 50)

    if args.uninstall:
        return uninstall_integration()
    elif args.verify:
        return verify_installation()
    else:
        # 执行安装
        print("步骤1. 创建配置目录...")
        create_gemini_config_directory()

        print("\n步骤2. 安装Extension配置...")
        extensions_success = install_gemini_extensions()

        print("\n步骤3. 复制适配器文件...")
        adapter_success = copy_adapter_file()

        print("\n步骤4. 验证安装...")
        verification_success = verify_installation()

        overall_success = extensions_success and adapter_success and verification_success
        if overall_success:
            print("\n[SUCCESS] Gemini CLI跨CLI集成安装成功!")
        else:
            print("\n[WARNING] 安装过程中出现警告，请检查上述输出")

        return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)