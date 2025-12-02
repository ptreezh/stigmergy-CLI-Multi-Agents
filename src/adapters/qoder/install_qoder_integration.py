"""
Qoder CLI Notification Hook集成安装脚本
为Qoder CLI安装跨CLI协作感知能力

使用方法：
python install_qoder_integration.py [--verify|--uninstall]
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

# Qoder CLI配置路径
QODER_CONFIG_FILE = os.path.expanduser("~/.qoder/config.json")

def install_qoder_hooks():
    """安装Qoder Notification Hook配置"""
    # 读取现有config配置
    existing_config = {}
    if os.path.exists(QODER_CONFIG_FILE):
        try:
            with open(QODER_CONFIG_FILE, 'r', encoding='utf-8') as f:
                existing_config = json.load(f)
        except Exception as e:
            print(f"[WARNING] Failed to read existing config: {e}")
            existing_config = {}

    # 定义跨CLI协作的Hook配置
    cross_cli_hooks = {
        "cross_cli_notification_hook": {
            "name": "CrossCLINotificationHook",
            "module": "src.adapters.qoder.notification_hook_adapter",
            "class": "QoderNotificationHookAdapter",
            "enabled": True,
            "priority": 100,
            "triggers": [
                "on_command_execution",
                "on_tool_detected",
                "on_collaboration_request"
            ],
            "config": {
                "cross_cli_enabled": True,
                "supported_clis": ["claude", "gemini", "qwencode", "iflow", "codebuddy", "copilot"],
                "auto_detect": True,
                "timeout": 30,
                "notification_channel": "file_system",
                "error_handling": "continue"
            }
        }
    }

    # 合并配置（保留现有hooks，添加协作功能）
    merged_config = existing_config.copy()
    if 'hooks' not in merged_config:
        merged_config['hooks'] = []

    # 检查是否已存在跨CLI通知Hook
    existing_hook_names = [hook.get('name') for hook in merged_config.get('hooks', [])]
    cross_cli_hook_name = "CrossCLINotificationHook"

    if cross_cli_hook_name not in existing_hook_names:
        merged_config['hooks'].append(cross_cli_hooks['cross_cli_notification_hook'])

    # 写入配置文件
    try:
        with open(QODER_CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(merged_config, f, indent=2, ensure_ascii=False)

        print(f"[OK] Qoder configuration installed: {QODER_CONFIG_FILE}")
        print("Installed Hooks:")
        for hook in merged_config.get('hooks', []):
            hook_name = hook.get('name')
            if hook.get('enabled', False):
                status = "[OK]"
            else:
                status = "[DISABLED]"
            print(f"   - {hook_name}: {status}")

        return True
    except Exception as e:
        print(f"[ERROR] Failed to install Qoder configuration: {e}")
        return False

def copy_adapter_file():
    """复制适配器文件到Qoder配置目录"""
    try:
        # 创建适配器目录
        adapter_dir = os.path.dirname(QODER_CONFIG_FILE)
        os.makedirs(adapter_dir, exist_ok=True)

        # 复制适配器文件
        adapter_files = [
            ("notification_hook_adapter.py", "src/adapters/qoder/notification_hook_adapter.py"),
            ("standalone_qoder_adapter.py", "src/adapters/qoder/standalone_qoder_adapter.py")
        ]

        for target_name, source_path in adapter_files:
            source_file = project_root / source_path
            target_file = Path(adapter_dir) / target_name

            if source_file.exists():
                shutil.copy2(source_file, target_file)
                print(f"[OK] Copied adapter file: {target_name}")
            else:
                print(f"[WARNING] Source adapter file not found: {source_file}")

        return True
    except Exception as e:
        print(f"[ERROR] Failed to copy adapter files: {e}")
        return False

def verify_installation():
    """验证安装"""
    try:
        # 检查配置文件
        if not os.path.exists(QODER_CONFIG_FILE):
            print("[ERROR] Qoder configuration file not found")
            return False

        # 读取配置文件
        with open(QODER_CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = json.load(f)

        # 检查Hook配置
        hooks = config.get('hooks', [])
        cross_cli_hook_found = any(hook.get('name') == 'CrossCLINotificationHook' for hook in hooks)

        if not cross_cli_hook_found:
            print("[ERROR] Cross-CLI Notification Hook not found in configuration")
            return False

        print("[OK] Installation verified successfully")
        return True
    except Exception as e:
        print(f"[ERROR] Installation verification failed: {e}")
        return False

def uninstall_qoder_integration():
    """卸载Qoder集成"""
    try:
        # 检查配置文件
        if not os.path.exists(QODER_CONFIG_FILE):
            print("[WARNING] Qoder configuration file not found")
            return True

        # 读取配置文件
        with open(QODER_CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = json.load(f)

        # 移除跨CLI通知Hook
        hooks = config.get('hooks', [])
        filtered_hooks = [hook for hook in hooks if hook.get('name') != 'CrossCLINotificationHook']
        config['hooks'] = filtered_hooks

        # 写入更新后的配置
        with open(QODER_CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)

        print("[OK] Qoder integration uninstalled successfully")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to uninstall Qoder integration: {e}")
        return False

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="Qoder CLI Notification Hook集成安装脚本")
    parser.add_argument("--verify", action="store_true", help="验证安装")
    parser.add_argument("--uninstall", action="store_true", help="卸载集成")
    parser.add_argument("--install", action="store_true", help="安装集成")
    args = parser.parse_args()

    print("Qoder CLI Cross-CLI Collaboration Integration Installer")
    print("=" * 50)

    if args.uninstall:
        print("Uninstall mode...")
        success = uninstall_qoder_integration()
    elif args.verify:
        print("Verification mode...")
        success = verify_installation()
    elif args.install or len(sys.argv) == 1:
        print("Installing Qoder CLI Cross-CLI Collaboration Integration...")
        
        # 1. 安装配置
        config_success = install_qoder_hooks()

        # 2. 复制适配器文件
        adapter_success = copy_adapter_file()

        success = config_success and adapter_success

        if success:
            print("\nQoder CLI Cross-CLI Collaboration Integration installed successfully!")
            print("\nInstallation Summary:")
            print(f"   [OK] Configuration file: {QODER_CONFIG_FILE}")
            print(f"   [OK] Adapter directory: {os.path.dirname(QODER_CONFIG_FILE)}")
            print(f"   [OK] Cross-CLI Collaboration Hook: Enabled")
            
            print("\nNext steps:")
            print("   1. Run installation scripts for other CLI tools")
            print("   2. Use ai-cli-router deploy --all to install all tools")
            print("   3. Use ai-cli-router init to initialize your project")
        else:
            print("\nQoder CLI Cross-CLI Collaboration Integration installation failed")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()