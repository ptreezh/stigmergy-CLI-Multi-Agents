"""
Codex CLI Slash Command集成安装脚本
为Codex CLI安装跨CLI协作感知能力

使用方法：
python install_codex_integration.py [--verify|--uninstall]
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

# Codex CLI配置路径
CODEX_CONFIG_DIR = os.path.expanduser("~/.config/codex")
CODEX_SLASH_COMMANDS_FILE = os.path.join(CODEX_CONFIG_DIR, "slash_commands.json")

def create_codex_config_directory():
    """创建Codex配置目录"""
    os.makedirs(CODEX_CONFIG_DIR, exist_ok=True)
    print(f"✅ 创建Codex配置目录: {CODEX_CONFIG_DIR}")

def install_codex_slash_commands():
    """安装Codex Slash Command配置"""
    # 读取现有slash_commands配置
    existing_config = {}
    if os.path.exists(CODEX_SLASH_COMMANDS_FILE):
        try:
            with open(CODEX_SLASH_COMMANDS_FILE, 'r', encoding='utf-8') as f:
                existing_config = json.load(f)
        except Exception as e:
            print(f"⚠️ 读取现有slash_commands配置失败: {e}")
            existing_config = {}

    # 定义跨CLI协作的Slash Command配置
    cross_cli_slash_commands = {
        "init": {
            "command": "init",
            "description": "初始化跨CLI协作项目",
            "module": "src.core.enhanced_init_processor",
            "enabled": True,
            "cross_cli_enabled": True,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        },
        "scan": {
            "command": "scan",
            "description": "扫描AI环境中的CLI工具",
            "module": "src.core.ai_environment_scanner",
            "enabled": True,
            "cross_cli_enabled": True,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        },
        "status": {
            "command": "status",
            "description": "查看所有CLI工具的状态",
            "module": "src.core.cli_hook_integration",
            "enabled": True,
            "cross_cli_enabled": True,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        },
        "deploy": {
            "command": "deploy",
            "description": "部署所有CLI工具的协作插件",
            "module": "src.core.cli_hook_integration",
            "enabled": True,
            "cross_cli_enabled": True,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        },
        "call": {
            "command": "call",
            "description": "调用其他CLI工具执行任务",
            "module": "src.core.cli_hook_integration",
            "enabled": True,
            "cross_cli_enabled": True,
            "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"]
        }
    }

    # 合并配置（保留现有slash_commands，添加协作功能）
    merged_config = existing_config.copy()
    if 'slash_commands' not in merged_config:
        merged_config['slash_commands'] = {}

    # 检查是否已存在跨CLI协作命令
    existing_command_names = [cmd.get('command') for cmd in merged_config.get('slash_commands', {}).values()]
    cross_cli_commands = ["init", "scan", "status", "deploy", "call"]

    # 添加跨CLI协作Slash Commands（如果不存在）
    for cmd_name, cmd_config in cross_cli_slash_commands.items():
        if cmd_name not in existing_command_names:
            merged_config['slash_commands'][cmd_name] = cmd_config

    # 写入配置文件
    try:
        with open(CODEX_SLASH_COMMANDS_FILE, 'w', encoding='utf-8') as f:
            json.dump(merged_config, f, indent=2, ensure_ascii=False)

        print(f"✅ Codex配置已安装: {CODEX_SLASH_COMMANDS_FILE}")
        print("🔗 已安装的跨CLI协作命令:")
        for cmd_name in cross_cli_commands:
            cmd_config = merged_config['slash_commands'].get(cmd_name, {})
            status = "✅" if cmd_config.get('enabled') else "❌"
            print(f"   - /{cmd_name}: {status} - {cmd_config.get('description')}")

        return True
    except Exception as e:
        print(f"❌ 安装Codex配置失败: {e}")
        return False

def copy_adapter_file():
    """复制适配器文件到Codex配置目录"""
    try:
        # 创建适配器目录
        adapter_dir = CODEX_CONFIG_DIR
        os.makedirs(adapter_dir, exist_ok=True)

        # 复制适配器文件
        adapter_files = [
            "mcp_server.py",
            "standalone_codex_adapter.py"
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
    print("\n🔍 验证Codex CLI集成安装...")

    # 检查配置文件
    if not os.path.exists(CODEX_SLASH_COMMANDS_FILE):
        print(f"❌ 配置文件不存在: {CODEX_SLASH_COMMANDS_FILE}")
        return False

    try:
        with open(CODEX_SLASH_COMMANDS_FILE, 'r', encoding='utf-8') as f:
            config = json.load(f)

        slash_commands = config.get('slash_commands', {})
        cross_cli_commands = ["init", "scan", "status", "deploy", "call"]

        # 验证跨CLI协作命令
        all_commands_found = True
        for cmd_name in cross_cli_commands:
            cmd_config = slash_commands.get(cmd_name, {})
            if not cmd_config:
                all_commands_found = False
                break
            if not cmd_config.get('cross_cli_enabled'):
                all_commands_found = False
                break

        if all_commands_found:
            print("✅ 跨CLI协作Slash Commands已安装")
            for cmd_name in cross_cli_commands:
                cmd_config = slash_commands.get(cmd_name, {})
                status = "✅" if cmd_config.get('enabled') else "❌"
                print(f"   - /{cmd_name}: {status} - {cmd_config.get('description')}")
        else:
            print("❌ 跨CLI协作Slash Commands未完全安装")
            return False

        # 检查适配器文件
        required_files = ["mcp_server.py"]
        missing_files = []

        for file_name in required_files:
            file_path = os.path.join(CODEX_CONFIG_DIR, file_name)
            if not os.path.exists(file_path):
                missing_files.append(file_name)

        if missing_files:
            print(f"❌ 缺失适配器文件: {missing_files}")
            return False
        else:
            print("✅ 适配器文件已复制")

        return True
    except Exception as e:
        print(f"❌ 验证失败: {e}")
        return False

def uninstall_codex_integration():
    """卸载Codex集成"""
    try:
        # 备份现有配置
        if os.path.exists(CODEX_SLASH_COMMANDS_FILE):
            backup_file = f"{CODEX_SLASH_COMMANDS_FILE}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            shutil.copy2(CODEX_SLASH_COMMANDS_FILE, backup_file)
            print(f"📦 已备份现有配置: {backup_file}")

        # 移除跨CLI协作Slash Commands
        config_updated = False
        if os.path.exists(CODEX_SLASH_COMMANDS_FILE):
            with open(CODEX_SLASH_COMMANDS_FILE, 'r+', encoding='utf-8') as f:
                config = json.load(f)
                slash_commands = config.get('slash_commands', {})

                # 禁用跨CLI协作命令
                for cmd_name in ["init", "scan", "status", "deploy", "call"]:
                    if cmd_name in slash_commands:
                        slash_commands[cmd_name]['cross_cli_enabled'] = False

                f.seek(0)
                f.truncate()
                json.dump({
                    'slash_commands': slash_commands,
                    'version': config.get('version', '1.0.0')
                }, f, indent=2, ensure_ascii=False)
                config_updated = True

            print(f"🗑️ Codex跨CLI协作集成已卸载")
        return True
    except Exception as e:
        print(f"❌ 卸载失败: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="Codex CLI跨CLI协作集成安装脚本",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--install",
        action="store_true",
        help="安装Codex CLI跨CLI协作集成"
    )

    parser.add_argument(
        "--verify",
        action="store_true",
        help="验证Codex CLI集成安装"
    )

    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="卸载Codex CLI跨CLI协作集成"
    )

    args = parser.parse_args()

    print("[INSTALL] Codex CLI跨CLI协作集成安装器")
    print("=" * 50)

    if args.uninstall:
        print("🗑️ 卸载模式...")
        success = uninstall_codex_integration()
    elif args.verify:
        print("🔍 验证模式...")
        success = verify_installation()
    elif args.install or len(sys.argv) == 1:
        print("📦 安装模式...")

        # 1. 创建配置目录
        print("1️⃣ 创建配置目录...")
        create_codex_config_directory()

        # 2. 安装Slash Commands配置
        print("2️⃣ 安装Slash Commands配置...")
        config_success = install_codex_slash_commands()

        # 3. 复制适配器文件
        print("3️⃣ 复制适配器文件...")
        adapter_success = copy_adapter_file()

        # 4. 验证安装
        print("4️⃣ 验证安装...")
        verify_success = verify_installation()

        success = config_success and adapter_success and verify_success

        if success:
            print("\n🎉 Codex CLI跨CLI协作集成安装成功！")
            print("\n📋 安装摘要:")
            print(f"   ✅ 配置目录: {CODEX_CONFIG_DIR}")
            print(f"   ✅ 配置文件: {CODEX_SLASH_COMMANDS_FILE}")
            print(f"   ✅ 适配器目录: {CODEX_CONFIG_DIR}")
            print(f"   ✅ 跨CLI协作Slash Commands: 已启用")

            print("\n🚀 下一步:")
            print("   1. 安装其他CLI工具的集成")
            print("   2. 使用 ai-cli-router deploy --all")
            print("   3. 使用 ai-cli-router init 初始化项目")
        else:
            print("\n❌ Codex CLI跨CLI协作集成安装失败")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()