"""
Codex CLI Cross-CLI Integration Installer

Automatically installs and configures Codex CLI cross-CLI integration features
including Slash Command registration and adapter setup
"""

import os
import json
import sys
import shutil
import argparse
from pathlib import Path
from datetime import datetime

# Codex CLI config paths
CODEX_CONFIG_DIR = os.path.expanduser("~/.config/codex")
CODEX_SLASH_COMMANDS_FILE = os.path.join(CODEX_CONFIG_DIR, "slash_commands.json")

def create_codex_config_directory():
    """Create Codex config directory"""
    os.makedirs(CODEX_CONFIG_DIR, exist_ok=True)
    print("[OK] Created Codex config directory: {}".format(CODEX_CONFIG_DIR))

def install_codex_slash_commands(force_update=True):
    """Install Codex Slash Command config"""
    # Read existing slash_commands config
    existing_config = {}
    if os.path.exists(CODEX_SLASH_COMMANDS_FILE):
        try:
            with open(CODEX_SLASH_COMMANDS_FILE, 'r', encoding='utf-8') as f:
                existing_config = json.load(f)
        except Exception as e:
            print("Warning: Failed to read existing slash_commands config: {}".format(e))
            existing_config = {}

    # Define cross-CLI collaboration Slash Command config (always use English descriptions)
    cross_cli_slash_commands = {
        "init": {
            "command": "init",
            "description": "Initialize cross-CLI collaboration project",
            "module": "src.core.enhanced_init_processor",
            "enabled": True,
            "cross_cli_enabled": True,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        },
        "scan": {
            "command": "scan",
            "description": "Scan AI environment for CLI tools",
            "module": "src.core.ai_environment_scanner",
            "enabled": True,
            "cross_cli_enabled": True,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        },
        "status": {
            "command": "status",
            "description": "View status of all CLI tools",
            "module": "src.core.cli_hook_integration",
            "enabled": True,
            "cross_cli_enabled": True,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        },
        "deploy": {
            "command": "deploy",
            "description": "Deploy collaboration plugins for all CLI tools",
            "module": "src.core.cli_hook_integration",
            "enabled": True,
            "cross_cli_enabled": True,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        },
        "call": {
            "command": "call",
            "description": "Call other CLI tools to execute tasks",
            "module": "src.core.cli_hook_integration",
            "enabled": True,
            "cross_cli_enabled": True,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        }
    }

    # Merge config (preserve existing slash_commands, but always update descriptions to English)
    merged_config = existing_config.copy()
    if 'slash_commands' not in merged_config:
        merged_config['slash_commands'] = {}

    # Always update or add cross-CLI collaboration Slash Commands with English descriptions
    for cmd_name, cmd_config in cross_cli_slash_commands.items():
        merged_config['slash_commands'][cmd_name] = cmd_config

    # Write config file
    try:
        with open(CODEX_SLASH_COMMANDS_FILE, 'w', encoding='utf-8') as f:
            json.dump(merged_config, f, indent=2, ensure_ascii=False)

        print("[OK] Codex config installed: {}".format(CODEX_SLASH_COMMANDS_FILE))
        print("Installed cross-CLI collaboration commands:")
        for cmd_name in ["init", "scan", "status", "deploy", "call"]:
            cmd_config = merged_config['slash_commands'].get(cmd_name, {})
            status = "[OK]" if cmd_config.get('enabled') else "[DISABLED]"
            print("   - /{}: {} - {}".format(cmd_name, status, cmd_config.get('description')))

        return True
    except Exception as e:
        print("Error: Failed to install Codex config: {}".format(e))
        return False

def copy_adapter_file():
    """Copy adapter files to Codex config directory"""
    try:
        # Create adapter directory
        adapter_dir = CODEX_CONFIG_DIR
        os.makedirs(adapter_dir, exist_ok=True)

        # Get current script directory
        current_dir = Path(__file__).parent

        # Copy adapter files
        adapter_files = [
            "mcp_server.py",
            "standalone_codex_adapter.py"
        ]

        for file_name in adapter_files:
            src_file = current_dir / file_name
            dst_file = os.path.join(adapter_dir, file_name)

            if src_file.exists():
                shutil.copy2(src_file, dst_file)
                print("[OK] Copied adapter file: {}".format(file_name))
            else:
                print("Warning: Adapter file does not exist: {}".format(file_name))

        return True
    except Exception as e:
        print("Error: Failed to copy adapter files: {}".format(e))
        return False

def verify_installation():
    """Verify installation success"""
    print("\nVerifying Codex CLI integration installation...")

    # Check config file
    if not os.path.exists(CODEX_SLASH_COMMANDS_FILE):
        print("Error: Config file does not exist: {}".format(CODEX_SLASH_COMMANDS_FILE))
        return False

    # Check config file content
    try:
        with open(CODEX_SLASH_COMMANDS_FILE, 'r', encoding='utf-8') as f:
            config = json.load(f)

        # Check if cross-CLI commands exist with English descriptions
        slash_commands = config.get('slash_commands', {})
        cross_cli_commands = ["init", "scan", "status", "deploy", "call"]
        missing_commands = []
        non_english_commands = []

        for cmd_name in cross_cli_commands:
            if cmd_name not in slash_commands:
                missing_commands.append(cmd_name)
            else:
                # Check if description is in English
                description = slash_commands[cmd_name].get('description', '').lower()
                if any(chinese_char in description for chinese_char in '初始化扫查看部署调用'):
                    non_english_commands.append(cmd_name)

        if missing_commands:
            print("Warning: Missing cross-CLI commands: {}".format(missing_commands))
        elif non_english_commands:
            print("Warning: Commands with non-English descriptions: {}".format(non_english_commands))
        else:
            print("[OK] All cross-CLI commands installed with English descriptions")

        print("[OK] Codex config file verified")
        return True
    except Exception as e:
        print("Error: Failed to verify config file: {}".format(e))
        return False

def uninstall_integration():
    """Uninstall Codex integration"""
    try:
        # Remove cross-CLI commands from config file
        if os.path.exists(CODEX_SLASH_COMMANDS_FILE):
            with open(CODEX_SLASH_COMMANDS_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)

            # Remove cross-CLI commands
            slash_commands = config.get('slash_commands', {})
            cross_cli_commands = ["init", "scan", "status", "deploy", "call"]

            for cmd in cross_cli_commands:
                if cmd in slash_commands:
                    del slash_commands[cmd]

            config['slash_commands'] = slash_commands

            # Save updated config
            with open(CODEX_SLASH_COMMANDS_FILE, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            print("[OK] Removed cross-CLI commands from Codex config")

        # Delete adapter files
        adapter_files = [
            "mcp_server.py",
            "standalone_codex_adapter.py"
        ]

        for file_name in adapter_files:
            adapter_file = os.path.join(CODEX_CONFIG_DIR, file_name)
            if os.path.exists(adapter_file):
                os.remove(adapter_file)
                print("[OK] Deleted adapter file: {}".format(file_name))

        print("[OK] Codex CLI cross-CLI integration uninstalled")
        return True
    except Exception as e:
        print("Error: Uninstall failed: {}".format(e))
        return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Codex CLI Cross-CLI Integration Installer")
    parser.add_argument("--verify", action="store_true", help="Verify installation")
    parser.add_argument("--uninstall", action="store_true", help="Uninstall integration")
    parser.add_argument("--force", action="store_true", help="Force update existing config")
    args = parser.parse_args()

    print("Codex CLI Cross-CLI Integration Installer")
    print("=" * 50)

    if args.uninstall:
        return uninstall_integration()
    elif args.verify:
        return verify_installation()
    else:
        # Execute installation
        print("Step 1. Creating config directory...")
        create_codex_config_directory()

        print("\nStep 2. Installing Slash Commands config...")
        slash_commands_success = install_codex_slash_commands(args.force)

        print("\nStep 3. Copying adapter files...")
        adapter_success = copy_adapter_file()

        print("\nStep 4. Verifying installation...")
        verification_success = verify_installation()

        overall_success = slash_commands_success and adapter_success and verification_success
        if overall_success:
            print("\n[SUCCESS] Codex CLI cross-CLI integration installed successfully!")
        else:
            print("\n[WARNING] Warnings occurred during installation, please check the output above")

        return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
def create_global_cross_cli_documentation(config_dir):
    """Create global Cross-CLI communication documentation"""
    try:
        doc_content = """# Codex CLI Cross-CLI Communication Guide

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

        # If codex.md file exists, append Cross-CLI communication hint to the end
        codex_md_path = os.path.join(os.path.expanduser("~/.config/codex"), "codex.md")
        if os.path.exists(codex_md_path):
            cross_cli_content = """

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex
"""
            with open(codex_md_path, 'a', encoding='utf-8') as f:
                f.write(cross_cli_content)
            print("[OK] 在CODEX.md末尾追加Cross-CLI通信提示")

        return True
    except Exception as e:
        print("Warning: Failed to create Cross-CLI Communication Guide: {}".format(e))
        return False
