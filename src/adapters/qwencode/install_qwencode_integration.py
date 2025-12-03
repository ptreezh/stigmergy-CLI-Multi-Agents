"""
QwenCode CLI Inheritance Integration Installation Script
Install cross-CLI collaboration awareness capabilities for QwenCode CLI

Usage:
python install_qwencode_integration.py [--verify|--uninstall]
"""

import os
import sys
import json
import shutil
import argparse
from pathlib import Path
from datetime import datetime

# Get current file directory
current_dir = Path(__file__).parent
project_root = current_dir.parent.parent.parent

# QwenCode CLI configuration paths
QWENCODE_CONFIG_DIR = os.path.expanduser("~/.config/qwencode")
QWENCODE_CONFIG_FILE = os.path.join(QWENCODE_CONFIG_DIR, "config.yml")

def create_qwencode_config_directory():
    """Create QwenCode configuration directory"""
    os.makedirs(QWENCODE_CONFIG_DIR, exist_ok=True)
    print(f"[OK] Created QwenCode configuration directory: {QWENCODE_CONFIG_DIR}")

def install_qwencode_plugins():
    """Install QwenCode Plugin configuration"""
    # Read existing config configuration
    existing_config = {}
    if os.path.exists(QWENCODE_CONFIG_FILE):
        try:
            import yaml
            with open(QWENCODE_CONFIG_FILE, 'r', encoding='utf-8') as f:
                existing_config = yaml.safe_load(f) or {}
        except Exception as e:
            print(f"⚠️ Failed to read existing config configuration: {e}")
            existing_config = {}

    # Define cross-CLI collaboration Plugin configuration
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

    # Merge configuration (preserve existing configuration, add collaboration features)
    merged_config = existing_config.copy()
    if 'plugins' not in merged_config:
        merged_config['plugins'] = []

    # Check if cross-CLI plugin already exists
    existing_plugins = merged_config.get('plugins', [])
    cross_cli_plugin_exists = any(
        plugin.get('name') == 'CrossCLIAdapterPlugin'
        for plugin in existing_plugins
    )

    if not cross_cli_plugin_exists:
        merged_config['plugins'].append(cross_cli_plugins['cross_cli_inheritance_adapter'])

    # Write config configuration file
    try:
        import yaml
        with open(QWENCODE_CONFIG_FILE, 'w', encoding='utf-8') as f:
            yaml.dump(merged_config, f, default_flow_style=False, allow_unicode=True)

        print(f"[OK] QwenCode configuration installed: {QWENCODE_CONFIG_FILE}")
        print("🔗 Installed Plugins:")
        for plugin in merged_config.get('plugins', []):
            if plugin.get('name') == 'CrossCLIAdapterPlugin':
                print(f"   - {plugin['name']}: [OK] Cross-CLI collaboration awareness")

        return True
    except Exception as e:
        print(f"[ERROR] Failed to install QwenCode configuration: {e}")
        return False

def copy_adapter_file():
    """Copy adapter files to QwenCode configuration directory"""
    try:
        # 创建适配器目录
        adapter_dir = os.path.join(QWENCODE_CONFIG_DIR, "plugins")
        os.makedirs(adapter_dir, exist_ok=True)

        # Copy adapter files
        adapter_files = [
            "inheritance_adapter.py",
            "standalone_qwencode_adapter.py"
        ]

        for file_name in adapter_files:
            src_file = current_dir / file_name
            dst_file = os.path.join(adapter_dir, file_name)

            if src_file.exists():
                shutil.copy2(src_file, dst_file)
                print(f"[OK] Copied adapter file: {file_name}")
            else:
                print(f"[WARNING] Adapter file does not exist: {file_name}")

        return True
    except Exception as e:
        print(f"[ERROR] Failed to copy adapter files: {e}")
        return False

def verify_installation():
    """Verify installation was successful"""
    print("\n[VERIFY] Verifying QwenCode CLI integration installation...")

    # Check configuration directory
    if not os.path.exists(QWENCODE_CONFIG_DIR):
        print(f"[ERROR] Configuration directory does not exist: {QWENCODE_CONFIG_DIR}")
        return False

    # Check configuration file
    if not os.path.exists(QWENCODE_CONFIG_FILE):
        print(f"[ERROR] Configuration file does not exist: {QWENCODE_CONFIG_FILE}")
        return False

    # Check adapter directory
    adapter_dir = os.path.join(QWENCODE_CONFIG_DIR, "plugins")
    if not os.path.exists(adapter_dir):
        print(f"[ERROR] Adapter directory does not exist: {adapter_dir}")
        return False

    # Read and verify configuration
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
                print("[SUCCESS] Cross-CLI collaboration plugin: Enabled")
                print("[SUCCESS] Supported CLI tools:")
                supported_clis = plugin_config.get('supported_clis', [])
                for cli in supported_clis:
                    print(f"   - {cli}")
                print("[SUCCESS] Auto-detection: Enabled")
                return True
            else:
                print("[WARNING] Cross-CLI collaboration plugin: Disabled")
                return False
        else:
            print("[ERROR] Cross-CLI collaboration plugin: Not found")
            return False

    except Exception as e:
        print(f"[ERROR] Failed to verify configuration: {e}")
        return False

def uninstall_qwencode_integration():
    """Uninstall QwenCode integration"""
    try:
        # Backup existing configuration
        if os.path.exists(QWENCODE_CONFIG_FILE):
            backup_file = f"{QWENCODE_CONFIG_FILE}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            shutil.copy2(QWENCODE_CONFIG_FILE, backup_file)
            print(f"[BACKUP] Backed up existing configuration: {backup_file}")

        # Remove adapter directory
        adapter_dir = os.path.join(QWENCODE_CONFIG_DIR, "plugins")
        if os.path.exists(adapter_dir):
            shutil.rmtree(adapter_dir)
            print(f"[DELETE] Deleted adapter directory: {adapter_dir}")

        print("[OK] QwenCode integration uninstalled")
        return True
    except Exception as e:
        print(f"[ERROR] Uninstall failed: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="QwenCode CLI Cross-CLI Collaboration Integration Installation Script",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--install",
        action="store_true",
        help="Install QwenCode CLI Cross-CLI Collaboration Integration"
    )

    parser.add_argument(
        "--verify",
        action="store_true",
        help="Verify QwenCode CLI integration installation"
    )

    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="Uninstall QwenCode CLI Cross-CLI Collaboration Integration"
    )

    args = parser.parse_args()

    print("[INSTALL] QwenCode CLI Cross-CLI Collaboration Integration Installer")
    print("=" * 60)

    if args.uninstall:
        print("[UNINSTALL] Uninstall mode...")
        success = uninstall_qwencode_integration()
    elif args.verify:
        print("[VERIFY] Verification mode...")
        success = verify_installation()
    elif args.install or len(sys.argv) == 1:
        print("[INSTALL] Installation mode...")

        # 1. Create configuration directory
        print("Step 1. Create configuration directory...")
        create_qwencode_config_directory()

        # 2. Install plugin configuration
        print("Step 2. Install plugin configuration...")
        config_success = install_qwencode_plugins()

        # 3. Copy adapter files
        print("Step 3. Copy adapter files...")
        adapter_success = copy_adapter_file()

        success = config_success and adapter_success

        if success:
            print("\n[SUCCESS] QwenCode CLI integration installed successfully!")
            print("\n[INFO] Installation Summary:")
            print(f"   [SUCCESS] 配置目录: {QWENCODE_CONFIG_DIR}")
            print(f"   [SUCCESS] 配置文件: {QWENCODE_CONFIG_FILE}")
            print(f"   [SUCCESS] 适配器目录: {os.path.join(QWENCODE_CONFIG_DIR, 'plugins')}")
            print("   [SUCCESS] Cross-CLI collaboration: Enabled")

            print("\n[INFO] Next steps:")
            print("   1. 安装其他CLI工具的集成: ai-cli-router deploy --all")
            print("   2. 初始化项目: ai-cli-router init")
            print("   3. 开始协作: qwencode-cli '请用gemini帮我分析代码'")
        else:
            print("\n[ERROR] QwenCode CLI integration installation failed, please check error messages")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()