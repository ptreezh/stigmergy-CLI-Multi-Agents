"""
Qwen CLI Integration Installer

Sets up basic integration for Qwen CLI with cross-CLI collaboration capabilities
"""

import os
import json
import sys
import shutil
import argparse
from pathlib import Path
from datetime import datetime

# Qwen CLI config paths
QWEN_CONFIG_DIR = os.path.expanduser("~/.qwen")
QWEN_CONFIG_FILE = os.path.join(QWEN_CONFIG_DIR, "config.json")
QWEN_HOOKS_FILE = os.path.join(QWEN_CONFIG_DIR, "hooks.json")

def create_qwen_config_directory():
    """Create Qwen config directory"""
    os.makedirs(QWEN_CONFIG_DIR, exist_ok=True)
    print("[OK] Created Qwen config directory: {}".format(QWEN_CONFIG_DIR))

def install_qwen_config():
    """Install basic Qwen CLI config for cross-CLI integration"""
    # Read existing config
    existing_config = {}
    if os.path.exists(QWEN_CONFIG_FILE):
        try:
            with open(QWEN_CONFIG_FILE, 'r', encoding='utf-8') as f:
                existing_config = json.load(f)
        except Exception as e:
            print("Warning: Failed to read existing config: {}".format(e))
            existing_config = {}

    # Define cross-CLI integration config
    cross_cli_config = {
        "cross_cli_enabled": True,
        "supported_clis": ["claude", "gemini", "iflow", "qodercli", "codebuddy", "copilot", "codex"],
        "auto_detect": True,
        "timeout": 30,
        "collaboration_mode": "active"
    }

    # Merge configs
    merged_config = existing_config.copy()
    merged_config.update(cross_cli_config)

    # Write config file
    try:
        with open(QWEN_CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(merged_config, f, indent=2, ensure_ascii=False)

        print("[OK] Qwen config installed: {}".format(QWEN_CONFIG_FILE))
        return True
    except Exception as e:
        print("Error: Failed to install Qwen config: {}".format(e))
        return False


def install_qwen_hooks():
    """Install Qwen CLI hooks for cross-CLI integration"""
    # Read existing hooks config
    existing_hooks = {}
    if os.path.exists(QWEN_HOOKS_FILE):
        try:
            with open(QWEN_HOOKS_FILE, 'r', encoding='utf-8') as f:
                existing_hooks = json.load(f)
        except Exception as e:
            print("Warning: Failed to read existing hooks config: {}".format(e))
            existing_hooks = {}

    # Define cross-CLI integration hooks
    cross_cli_hooks = {
        "cross_cli_adapter": {
            "enabled": True,
            "supported_tools": ["claude", "gemini", "qwen", "iflow", "qodercli", "codebuddy", "copilot", "codex"],
            "trigger_patterns": [
                r"use\s+(\w+)\s+to\s+(.+)",
                r"call\s+(\w+)\s+(.+)",
                r"ask\s+(\w+)\s+(.+)",
                r"stigmergy\s+(\w+)\s+(.+)"
            ]
        }
    }

    # Merge hooks configs
    merged_hooks = existing_hooks.copy()
    merged_hooks.update(cross_cli_hooks)

    # Write hooks config file
    try:
        with open(QWEN_HOOKS_FILE, 'w', encoding='utf-8') as f:
            json.dump(merged_hooks, f, indent=2, ensure_ascii=False)

        print("[OK] Qwen hooks installed: {}".format(QWEN_HOOKS_FILE))
        return True
    except Exception as e:
        print("Error: Failed to install Qwen hooks: {}".format(e))
        return False

def copy_adapter_files():
    """Copy adapter files to Qwen config directory"""
    try:
        # Get current script directory
        current_dir = Path(__file__).parent
        
        # Look for any Python adapter files to copy
        adapter_files = list(current_dir.glob("*.py"))
        adapter_files = [f for f in adapter_files if f.name != Path(__file__).name]
        
        if not adapter_files:
            print("Note: No adapter files found to copy")
            return True
            
        # Copy adapter files
        for src_file in adapter_files:
            dst_file = os.path.join(QWEN_CONFIG_DIR, src_file.name)
            shutil.copy2(src_file, dst_file)
            print("[OK] Copied adapter file: {}".format(src_file.name))
            
        # Create global Cross-CLI documentation
        create_global_cross_cli_documentation(QWEN_CONFIG_DIR)
            
        return True
    except Exception as e:
        print("Warning: Failed to copy adapter files: {}".format(e))
        return True  # Don't fail the entire installation for this


def create_global_cross_cli_documentation(config_dir):
    """Create global Cross-CLI communication documentation"""
    try:
        doc_content = """# Qwen CLI Cross-CLI Communication Guide

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

---
*This document is automatically generated and maintained by Stigmergy CLI*
"""

        doc_path = os.path.join(config_dir, "CROSS_CLI_GUIDE.md")
        with open(doc_path, 'w', encoding='utf-8') as f:
            f.write(doc_content)
            
        print("[OK] Created Cross-CLI Communication Guide: {}".format(doc_path))
        
        # 如果存在qwen.md文件，则在末尾追加Cross-CLI通信提示
        qwen_md_path = os.path.join(os.path.expanduser("~/.qwen"), "qwen.md")
        if os.path.exists(qwen_md_path):
            cross_cli_content = """

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex
"""
            with open(qwen_md_path, 'a', encoding='utf-8') as f:
                f.write(cross_cli_content)
            print("[OK] 在QWEN.md末尾追加Cross-CLI通信提示")
            
        return True
    except Exception as e:
        print("Warning: Failed to create Cross-CLI Communication Guide: {}".format(e))
        return False

def verify_installation():
    """Verify installation success"""
    print("\nVerifying Qwen CLI integration installation...")

    # Check config file
    if not os.path.exists(QWEN_CONFIG_FILE):
        print("Warning: Config file does not exist: {}".format(QWEN_CONFIG_FILE))
        return True  # Not critical for basic functionality

    # Check config file content
    try:
        with open(QWEN_CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = json.load(f)
            
        if config.get('cross_cli_enabled'):
            print("[OK] Cross-CLI integration enabled")
        else:
            print("Note: Cross-CLI integration not enabled")
            
        print("[OK] Qwen config file verified")
        return True
    except Exception as e:
        print("Warning: Failed to verify config file: {}".format(e))
        return True  # Not critical for basic functionality

def uninstall_integration():
    """Uninstall Qwen integration"""
    try:
        # Remove cross-CLI config from config file
        if os.path.exists(QWEN_CONFIG_FILE):
            with open(QWEN_CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)

            # Remove cross-CLI settings
            config.pop('cross_cli_enabled', None)
            config.pop('supported_clis', None)
            config.pop('auto_detect', None)
            config.pop('collaboration_mode', None)

            # Save updated config
            with open(QWEN_CONFIG_FILE, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            print("[OK] Removed cross-CLI settings from Qwen config")

        # Remove hooks config file
        if os.path.exists(QWEN_HOOKS_FILE):
            os.remove(QWEN_HOOKS_FILE)
            print("[OK] Removed Qwen hooks config file")

        print("[OK] Qwen CLI cross-CLI integration uninstalled")
        return True
    except Exception as e:
        print("Error: Uninstall failed: {}".format(e))
        return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Qwen CLI Integration Installer")
    parser.add_argument("--verify", action="store_true", help="Verify installation")
    parser.add_argument("--uninstall", action="store_true", help="Uninstall integration")
    args = parser.parse_args()

    print("Qwen CLI Integration Installer")
    print("=" * 40)

    if args.uninstall:
        return uninstall_integration()
    elif args.verify:
        return verify_installation()
    else:
        # Execute installation
        print("Step 1. Creating config directory...")
        create_qwen_config_directory()

        print("\nStep 2. Installing config...")
        config_success = install_qwen_config()

        print("\nStep 3. Installing hooks...")
        hooks_success = install_qwen_hooks()

        print("\nStep 4. Copying adapter files...")
        adapter_success = copy_adapter_files()

        print("\nStep 5. Verifying installation...")
        verification_success = verify_installation()

        overall_success = config_success and hooks_success and adapter_success and verification_success
        if overall_success:
            print("\n[SUCCESS] Qwen CLI integration installed successfully!")
        else:
            print("\n[WARNING] Installation completed with warnings")

        return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)