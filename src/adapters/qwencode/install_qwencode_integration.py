"""
QwenCode CLI Inheritance集成安装脚本
为QwenCode CLI安装跨CLI协作感知能力

使用方法：
python install_qwencode_integration.py [--verify|--uninstall]
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

# QwenCode CLI配置路径
QWENCODE_CONFIG_DIR = os.path.expanduser("~/.config/qwencode")
QWENCODE_CONFIG_FILE = os.path.join(QWENCODE_CONFIG_DIR, "config.yml")

def create_qwencode_config_directory():
    """创建QwenCode配置目录"""
    os.makedirs(QWENCODE_CONFIG_DIR, exist_ok=True)
    print(f"✅ 创建QwenCode配置目录: {QWENCODE_CONFIG_DIR}")

def install_qwencode_plugins():
    """安装QwenCode Plugin配置"""
    # 读取现有config配置
    existing_config = {}
    if os.path.exists(QWENCODE_CONFIG_FILE):
        try:
            import yaml
            with open(QWENCODE_CONFIG_FILE, 'r', encoding='utf-8') as f:
                existing_config = yaml.safe_load(f) or {}
        except Exception as e:
            print(f"⚠️ 读取现有config配置失败: {e}")
            existing_config = {}

    # 定义跨CLI协作的Plugin配置
    cross_cli_plugins = {
        "cross_cli_inheritance_adapter": {
            "name": "CrossCLIAdapterPlugin",
            "module": "src.adapters.qwencode.inheritance_adapter",
            "class": "QwenCodeInheritanceAdapter",
            "enabled": True,
            "priority": 100,
            "base_class": "BaseQwenCodePlugin",
            "handlers": [
                "on_prompt_received",
                "on_code_generated",
                "on_error_occurred",
                "on_file_created",
                "on_before_save"
            ],
            "config": {
                "cross_cli_enabled": True,
                "supported_clis": ["claude", "gemini", "iflow", "qoder", "codebuddy", "copilot"],
                "auto_detect": True,
                "timeout": 30,
                "error_handling": "continue",
                "collaboration_mode": "active"
            }
        }
    }

    # 合并配置（保留现有配置，添加协作功能）
    merged_config = existing_config.copy()
    if 'plugins' not in merged_config:
        merged_config['plugins'] = []

    # 检查是否已存在跨CLI插件
    existing_plugins = merged_config.get('plugins', [])
    cross_cli_plugin_exists = any(
        plugin.get('name') == 'CrossCLIAdapterPlugin'
        for plugin in existing_plugins
    )

    if not cross_cli_plugin_exists:
        merged_config['plugins'].append(cross_cli_plugins['cross_cli_inheritance_adapter'])

    # 写入config配置文件
    try:
        import yaml
        with open(QWENCODE_CONFIG_FILE, 'w', encoding='utf-8') as f:
            yaml.dump(merged_config, f, default_flow_style=False, allow_unicode=True)

        print(f"✅ QwenCode配置已安装: {QWENCODE_CONFIG_FILE}")
        print("🔗 已安装的Plugin:")
        for plugin in merged_config.get('plugins', []):
            if plugin.get('name') == 'CrossCLIAdapterPlugin':
                print(f"   - {plugin['name']}: ✅ 跨CLI协作感知")

        return True
    except Exception as e:
        print(f"❌ 安装QwenCode配置失败: {e}")
        return False

def copy_adapter_file():
    """复制适配器文件到QwenCode配置目录"""
    try:
        # 创建适配器目录
        adapter_dir = os.path.join(QWENCODE_CONFIG_DIR, "plugins")
        os.makedirs(adapter_dir, exist_ok=True)

        # 复制适配器文件
        adapter_files = [
            "inheritance_adapter.py",
            "standalone_qwencode_adapter.py"
        ]

        for file_name in adapter_files:
            src_file = current_dir / file_name
            dst_file = os.path.join(adapter_dir, file_name)

            if src_file.exists():
                shutil.copy2(src_file, dst_file)
                print(f"✅ 复制适配器文件: {file_name}")
            else:
                print(f"⚠️ 适配器文件不存在: {file_name}")

        return True
    except Exception as e:
        print(f"❌ 复制适配器文件失败: {e}")
        return False

def verify_installation():
    """验证安装是否成功"""
    print("\n🔍 验证QwenCode CLI集成安装...")

    # 检查配置目录
    if not os.path.exists(QWENCODE_CONFIG_DIR):
        print(f"❌ 配置目录不存在: {QWENCODE_CONFIG_DIR}")
        return False

    # 检查配置文件
    if not os.path.exists(QWENCODE_CONFIG_FILE):
        print(f"❌ 配置文件不存在: {QWENCODE_CONFIG_FILE}")
        return False

    # 检查适配器目录
    adapter_dir = os.path.join(QWENCODE_CONFIG_DIR, "plugins")
    if not os.path.exists(adapter_dir):
        print(f"❌ 适配器目录不存在: {adapter_dir}")
        return False

    # 读取并验证配置
    try:
        import yaml
        with open(QWENCODE_CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f) or {}

        plugins = config.get('plugins', [])
        cross_cli_plugin = None

        for plugin in plugins:
            if plugin.get('name') == 'CrossCLIAdapterPlugin':
                cross_cli_plugin = plugin
                break

        if cross_cli_plugin:
            plugin_config = cross_cli_plugin.get('config', {})
            if plugin_config.get('cross_cli_enabled'):
                print("[SUCCESS] 跨CLI协作插件: 已启用")
                print("[SUCCESS] 支持的CLI工具:")
                supported_clis = plugin_config.get('supported_clis', [])
                for cli in supported_clis:
                    print(f"   - {cli}")
                print("[SUCCESS] 自动检测: 已启用")
                return True
            else:
                print("[WARNING] 跨CLI协作插件: 未启用")
                return False
        else:
            print("❌ 跨CLI协作插件: 未找到")
            return False

    except Exception as e:
        print(f"❌ 验证配置失败: {e}")
        return False

def uninstall_qwencode_integration():
    """卸载QwenCode集成"""
    try:
        # 备份现有配置
        if os.path.exists(QWENCODE_CONFIG_FILE):
            backup_file = f"{QWENCODE_CONFIG_FILE}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            shutil.copy2(QWENCODE_CONFIG_FILE, backup_file)
            print(f"📦 已备份现有配置: {backup_file}")

        # 移除适配器目录
        adapter_dir = os.path.join(QWENCODE_CONFIG_DIR, "plugins")
        if os.path.exists(adapter_dir):
            shutil.rmtree(adapter_dir)
            print(f"🗑️ 已删除适配器目录: {adapter_dir}")

        print("✅ QwenCode集成已卸载")
        return True
    except Exception as e:
        print(f"❌ 卸载失败: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="QwenCode CLI跨CLI协作集成安装脚本",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--install",
        action="store_true",
        help="安装QwenCode CLI跨CLI协作集成"
    )

    parser.add_argument(
        "--verify",
        action="store_true",
        help="验证QwenCode CLI集成安装"
    )

    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="卸载QwenCode CLI跨CLI协作集成"
    )

    args = parser.parse_args()

    print("[INSTALL] QwenCode CLI跨CLI协作集成安装器")
    print("=" * 60)

    if args.uninstall:
        print("[UNINSTALL] 卸载模式...")
        success = uninstall_qwencode_integration()
    elif args.verify:
        print("[VERIFY] 验证模式...")
        success = verify_installation()
    elif args.install or len(sys.argv) == 1:
        print("[INSTALL] 安装模式...")

        # 1. 创建配置目录
        print("Step 1. 创建配置目录...")
        create_qwencode_config_directory()

        # 2. 安装插件配置
        print("Step 2. 安装插件配置...")
        config_success = install_qwencode_plugins()

        # 3. 复制适配器文件
        print("Step 3. 复制适配器文件...")
        adapter_success = copy_adapter_file()

        success = config_success and adapter_success

        if success:
            print("\n[SUCCESS] QwenCode CLI集成安装成功！")
            print("\n📋 安装摘要:")
            print(f"   [SUCCESS] 配置目录: {QWENCODE_CONFIG_DIR}")
            print(f"   [SUCCESS] 配置文件: {QWENCODE_CONFIG_FILE}")
            print(f"   [SUCCESS] 适配器目录: {os.path.join(QWENCODE_CONFIG_DIR, 'plugins')}")
            print("   [SUCCESS] 跨CLI协作: 已启用")

            print("\n[INFO] 下一步:")
            print("   1. 安装其他CLI工具的集成: ai-cli-router deploy --all")
            print("   2. 初始化项目: ai-cli-router init")
            print("   3. 开始协作: qwencode-cli '请用gemini帮我分析代码'")
        else:
            print("\n❌ QwenCode CLI集成安装失败，请检查错误信息")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()