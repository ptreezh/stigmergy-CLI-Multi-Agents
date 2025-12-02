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

# 获取当前文件目录
current_dir = Path(__file__).parent
project_root = current_dir.parent.parent.parent

# Gemini CLI配置路径
GEMINI_CONFIG_DIR = os.path.expanduser("~/.config/gemini")
GEMINI_EXTENSIONS_FILE = os.path.join(GEMINI_CONFIG_DIR, "extensions.json")

def create_gemini_config_directory():
    """创建Gemini配置目录"""
    os.makedirs(GEMINI_CONFIG_DIR, exist_ok=True)
    print(f"[OK] 创建Gemini配置目录: {GEMINI_CONFIG_DIR}")

def install_gemini_extensions():
    """安装Gemini Extension配置"""
    # 读取现有extensions配置
    existing_extensions = {}
    if os.path.exists(GEMINI_EXTENSIONS_FILE):
        try:
            with open(GEMINI_EXTENSIONS_FILE, 'r', encoding='utf-8') as f:
                existing_extensions = json.load(f)
        except Exception as e:
            print(f"⚠️ 读取现有extensions配置失败: {e}")
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

        print(f"[OK] Gemini Extension配置已安装: {GEMINI_EXTENSIONS_FILE}")
        print("🔗 已安装的Extension:")
        for ext_name in cross_cli_extensions.keys():
            print(f"   - {ext_name}: [OK] 跨CLI协作感知")

        return True
    except Exception as e:
        print(f"❌ 安装Gemini Extension配置失败: {e}")
        return False

def copy_adapter_file():
    """复制适配器文件到Gemini配置目录"""
    try:
        # 创建适配器目录
        adapter_dir = os.path.join(GEMINI_CONFIG_DIR, "adapters")
        os.makedirs(adapter_dir, exist_ok=True)

        # 复制适配器文件
        adapter_files = [
            "extension_adapter.py",
            "standalone_gemini_adapter.py"
        ]

        for file_name in adapter_files:
            src_file = current_dir / file_name
            dst_file = os.path.join(adapter_dir, file_name)

            if src_file.exists():
                shutil.copy2(src_file, dst_file)
                print(f"[OK] 复制适配器文件: {file_name}")
            else:
                print(f"⚠️ 适配器文件不存在: {file_name}")

        return True
    except Exception as e:
        print(f"❌ 复制适配器文件失败: {e}")
        return False

def verify_installation():
    """验证安装是否成功"""
    print("\n🔍 验证Gemini CLI集成安装...")

    # 检查配置目录
    if not os.path.exists(GEMINI_CONFIG_DIR):
        print(f"❌ 配置目录不存在: {GEMINI_CONFIG_DIR}")
        return False

    # 检查extensions文件
    if not os.path.exists(GEMINI_EXTENSIONS_FILE):
        print(f"❌ Extensions配置文件不存在: {GEMINI_EXTENSIONS_FILE}")
        return False

    # 检查适配器目录
    adapter_dir = os.path.join(GEMINI_CONFIG_DIR, "adapters")
    if not os.path.exists(adapter_dir):
        print(f"❌ 适配器目录不存在: {adapter_dir}")
        return False

    # 读取并验证extensions配置
    try:
        with open(GEMINI_EXTENSIONS_FILE, 'r', encoding='utf-8') as f:
            extensions_config = json.load(f)

        required_extensions = ["cross_cli_preprocessor", "cross_cli_response_processor"]
        for ext_name in required_extensions:
            if ext_name in extensions_config:
                ext_config = extensions_config[ext_name]
                if ext_config.get("enabled", False):
                    print(f"[OK] Extension {ext_name}: 已启用")
                    if "cross_cli_enabled" in ext_config.get("config", {}):
                        print(f"[OK]   跨CLI协作: 已启用")
                else:
                    print(f"⚠️ Extension {ext_name}: 未启用")
            else:
                print(f"❌ 缺少Extension: {ext_name}")

        return True
    except Exception as e:
        print(f"❌ 验证配置失败: {e}")
        return False

def uninstall_gemini_integration():
    """卸载Gemini CLI集成"""
    try:
        # 备份现有配置
        if os.path.exists(GEMINI_EXTENSIONS_FILE):
            backup_file = f"{GEMINI_EXTENSIONS_FILE}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            shutil.copy2(GEMINI_EXTENSIONS_FILE, backup_file)
            print(f"📦 已备份现有配置: {backup_file}")

        # 移除适配器目录
        adapter_dir = os.path.join(GEMINI_CONFIG_DIR, "adapters")
        if os.path.exists(adapter_dir):
            shutil.rmtree(adapter_dir)
            print(f"🗑️ 已删除适配器目录: {adapter_dir}")

        print("[OK] Gemini CLI集成已卸载")
        return True
    except Exception as e:
        print(f"❌ 卸载失败: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="Gemini CLI跨CLI协作集成安装脚本",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--install",
        action="store_true",
        help="安装Gemini CLI跨CLI协作集成"
    )

    parser.add_argument(
        "--verify",
        action="store_true",
        help="验证Gemini CLI集成安装"
    )

    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="卸载Gemini CLI跨CLI协作集成"
    )

    args = parser.parse_args()

    print("[INSTALL] Gemini CLI跨CLI协作集成安装器")
    print("=" * 50)

    if args.uninstall:
        print("[UNINSTALL] 卸载模式...")
        success = uninstall_gemini_integration()
    elif args.verify:
        print("[VERIFY] 验证模式...")
        success = verify_installation()
    elif args.install or len(sys.argv) == 1:
        print("[INSTALL] 安装模式...")

        # 1. 创建配置目录
        print("\nStep 1. 创建配置目录...")
        create_gemini_config_directory()

        # 2. 安装Extension配置
        print("\nStep 2. 安装Extension配置...")
        extensions_success = install_gemini_extensions()

        # 3. 复制适配器文件
        print("\nStep 3. 复制适配器文件...")
        adapter_success = copy_adapter_file()

        # 4. 验证安装
        print("\nStep 4. 验证安装...")
        verify_success = verify_installation()

        success = extensions_success and adapter_success and verify_success

        if success:
            print("\n🎉 Gemini CLI集成安装成功！")
            print("\n[INFO] 安装摘要:")
            print(f"   [OK] 配置目录: {GEMINI_CONFIG_DIR}")
            print(f"   [OK] Extensions配置: {GEMINI_EXTENSIONS_FILE}")
            print(f"   [OK] 适配器目录: {os.path.join(GEMINI_CONFIG_DIR, 'adapters')}")

            print("\n[INSTALL] 下一步:")
            print("   1. 安装其他CLI工具的集成: ai-cli-router deploy --all")
            print("   2. 初始化项目: ai-cli-router init")
            print("   3. 开始使用协作功能: gemini-cli '请用claude帮我审查代码'")
        else:
            print("\n❌ Gemini CLI集成安装失败，请检查错误信息")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()