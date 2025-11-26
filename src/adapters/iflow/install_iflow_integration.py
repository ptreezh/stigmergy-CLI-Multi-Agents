"""
iFlow CLI Hook集成安装脚本
为iFlow CLI安装跨CLI协作感知能力

使用方法：
python install_iflow_integration.py [--verify|--uninstall]
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

# iFlow CLI配置路径
IFLOW_CONFIG_DIR = os.path.expanduser("~/.config/iflow")
IFLOW_HOOKS_FILE = os.path.join(IFLOW_CONFIG_DIR, "hooks.yml")

def create_iflow_config_directory():
    """创建iFlow配置目录"""
    os.makedirs(IFLOW_CONFIG_DIR, exist_ok=True)
    print(f"✅ 创建iFlow配置目录: {IFLOW_CONFIG_DIR}")

def install_iflow_hooks():
    """安装iFlow Hook配置"""
    # 读取现有hooks配置
    existing_hooks = {}
    if os.path.exists(IFLOW_HOOKS_FILE):
        try:
            import yaml
            with open(IFLOW_HOOKS_FILE, 'r', encoding='utf-8') as f:
                existing_hooks = yaml.safe_load(f) or {}
        except Exception as e:
            print(f"⚠️ 读取现有hooks配置失败: {e}")
            existing_hooks = {}

    # 定义跨CLI协作的Hook配置
    cross_cli_hooks = {
        "cross_cli_hook_adapter": {
            "name": "CrossCLIHookAdapter",
            "module": "src.adapters.iflow.hook_adapter",
            "class": "IFlowHookAdapter",
            "enabled": True,
            "priority": 100,
            "hooks": [
                "on_command_start",
                "on_command_end",
                "on_user_input",
                "on_workflow_stage",
                "on_pipeline_execute",
                "on_output_render",
                "on_error"
            ],
            "config": {
                "cross_cli_enabled": True,
                "supported_clis": ["claude", "gemini", "qwencode", "qoder", "codebuddy", "copilot"],
                "auto_detect": True,
                "timeout": 30,
                "error_handling": "continue",
                "collaboration_mode": "active"
            }
        }
    }

    # 合并配置（保留现有hooks，添加协作功能）
    merged_hooks = existing_hooks.copy()
    if 'plugins' not in merged_hooks:
        merged_hooks['plugins'] = []

    # 检查是否已存在跨CLI Hook
    existing_plugin_names = [plugin.get('name') for plugin in merged_hooks.get('plugins', [])]
    cross_cli_hook_exists = any(plugin_name == 'CrossCLIHookAdapter' for plugin_name in existing_plugin_names)

    if not cross_cli_hook_exists:
        merged_hooks['plugins'].append(cross_cli_hooks['cross_cli_hook_adapter'])

    # 写入hooks配置文件
    try:
        import yaml
        with open(IFLOW_HOOKS_FILE, 'w', encoding='utf-8') as f:
            yaml.dump(merged_hooks, f, default_flow_style=False, allow_unicode=True)

        print(f"✅ iFlow Hook配置已安装: {IFLOW_HOOKS_FILE}")
        print("🔗 已安装的Hook:")
        for plugin in merged_hooks.get('plugins', []):
            if plugin.get('name') == 'CrossCLIHookAdapter':
                print(f"   - {plugin['name']}: ✅ 跨CLI协作感知")
                print(f"     支持的CLI: {', '.join(plugin['config'].get('supported_clis', []))}")

        return True
    except Exception as e:
        print(f"❌ 安装iFlow Hook配置失败: {e}")
        return False

def copy_adapter_file():
    """复制适配器文件到iFlow配置目录"""
    try:
        # 创建适配器目录
        adapter_dir = os.path.join(IFLOW_CONFIG_DIR, "adapters")
        os.makedirs(adapter_dir, exist_ok=True)

        # 复制适配器文件
        adapter_files = [
            "hook_adapter.py",
            "standalone_iflow_adapter.py"
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
    print("\n🔍 验证iFlow CLI集成安装...")

    # 检查配置目录
    if not os.path.exists(IFLOW_CONFIG_DIR):
        print(f"❌ 配置目录不存在: {IFLOW_CONFIG_DIR}")
        return False

    # 检查hooks文件
    if not os.path.exists(IFLOW_HOOKS_FILE):
        print(f"❌ Hooks配置文件不存在: {IFLOW_HOOKS_FILE}")
        return False

    # 检查适配器目录
    adapter_dir = os.path.join(IFLOW_CONFIG_DIR, "adapters")
    if not os.path.exists(adapter_dir):
        print(f"❌ 适配器目录不存在: {adapter_dir}")
        return False

    # 读取并验证hooks配置
    try:
        import yaml
        with open(IFLOW_HOOKS_FILE, 'r', encoding='utf-8') as f:
            hooks_config = yaml.safe_load(f) or {}

        plugins = hooks_config.get('plugins', [])
        cross_cli_plugin = None

        for plugin in plugins:
            if plugin.get('name') == 'CrossCLIHookAdapter':
                cross_cli_plugin = plugin
                print(f"✅ 跨CLI协作Hook: 已启用")
                print(f"✅ 支持的CLI工具: {', '.join(plugin.get('config', {}).get('supported_clis', []))}")
                break

        if not cross_cli_plugin:
            print("❌ 跨CLI协作Hook: 未找到")
            return False

    except Exception as e:
        print(f"❌ 读取hooks配置失败: {e}")
        return False

def uninstall_iflow_integration():
    """卸载iFlow集成"""
    try:
        # 备份现有配置
        if os.path.exists(IFLOW_HOOKS_FILE):
            backup_file = f"{IFLOW_HOOKS_FILE}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            shutil.copy2(IFLOW_HOOKS_FILE, backup_file)
            print(f"📦 已备份现有配置: {backup_file}")

        # 移除跨CLI Hook
        if os.path.exists(IFLOW_HOOKS_FILE):
            import yaml
            with open(IFLOW_HOOKS_FILE, 'r', encoding='utf-8') as f:
                hooks_config = yaml.safe_load(f) or {}

            if 'plugins' in hooks_config:
                plugins = hooks_config['plugins']
                # 移除跨CLI Hook
                plugins = [p for p in plugins if p.get('name') != 'CrossCLIHookAdapter']

                hooks_config['plugins'] = plugins

                # 写回配置
                with open(IFLOW_HOOKS_FILE, 'w', encoding='utf-8') as f:
                    yaml.dump(hooks_config, f, default_flow_style=False, allow_unicode=True)

        print("✅ iFlow跨CLI协作集成已卸载")
        return True
    except Exception as e:
        print(f"❌ 卸载失败: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="iFlow CLI跨CLI协作集成安装脚本",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--install",
        action="store_true",
        help="安装iFlow CLI跨CLI协作集成"
    )

    parser.add_argument(
        "--verify",
        action="store_true",
        help="验证iFlow CLI集成安装"
    )

    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="卸载iFlow CLI跨CLI协作集成"
    )

    args = parser.parse_args()

    print("🔄 iFlow CLI跨CLI协作集成安装器")
    print("=" * 60)

    if args.uninstall:
        print("🗑️ 卸载模式...")
        success = uninstall_iflow_integration()
    elif args.verify:
        print("🔍 验证模式...")
        success = verify_installation()
    elif args.install or len(sys.argv) == 1:
        print("📦 安装模式...")

        # 1. 创建配置目录
        print("1️⃣ 创建配置目录...")
        create_iflow_config_directory()

        # 2. 安装hooks配置
        print("2️⃣ 安装hooks配置...")
        hooks_success = install_iflow_hooks()

        # 3. 复制适配器文件
        print("3️⃣ 复制适配器文件...")
        adapter_success = copy_adapter_file()

        success = hooks_success and adapter_success

        if success:
            print("\n🎉 iFlow CLI集成安装成功！")
            print("\n📋 安装摘要:")
            print(f"   ✅ 配置目录: {IFLOW_CONFIG_DIR}")
            print(f"   ✅ Hooks文件: {IFLOW_HOOKS_FILE}")
            print(f"   ✅ 适配器目录: {os.path.join(IFLOW_CONFIG_DIR, 'adapters')}")
            print(f"   ✅ 跨CLI协作: 已启用")
            print(f"   ✅ 支持的CLI: claude, gemini, qwencode, qoder, codebuddy, copilot")
        else:
            print("\n❌ iFlow CLI集成安装失败！")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()