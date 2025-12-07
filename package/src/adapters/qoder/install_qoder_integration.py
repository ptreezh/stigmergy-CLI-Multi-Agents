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
            print(f"⚠️ 读取现有config配置失败: {e}")
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

        print(f"[OK] Qoder配置已安装: {QODER_CONFIG_FILE}")
        print("🔗 已安装的Hook:")
        for hook_name in [hook.get('name') for hook in merged_config.get('hooks', [])]:
            if hook.get('enabled', False):
                status = "❌"
            else:
                status = "[OK]"
            print(f"   - {hook_name}: {status}")

        return True
    except Exception as e:
        print(f"❌ 安装Qoder配置失败: {e}")
        return False

def copy_adapter_file():
    """复制适配器文件到Qoder配置目录"""
    try:
        # 创建适配器目录
        adapter_dir = os.path.dirname(QODER_CONFIG_FILE)
        os.makedirs(adapter_dir, exist_ok=True)

        # 复制适配器文件
        adapter_files = [
            "notification_hook_adapter.py",
            "standalone_qoder_adapter.py"
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
    print("\n🔍 验证Qoder CLI集成安装...")

    # 检查配置文件
    if not os.path.exists(QODER_CONFIG_FILE):
        print(f"❌ 配置文件不存在: {QODER_CONFIG_FILE}")
        return False

    try:
        with open(QODER_CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = json.load(f)

        hooks = config.get('hooks', [])
        cross_cli_hook = None
        for hook in hooks:
            if hook.get('name') == 'CrossCLINotificationHook':
                cross_cli_hook = hook
                break

        if cross_cli_hook:
            print("[OK] 跨CLI协作Hook已安装")
            print(f"   - Hook名称: {cross_cli_hook.get('name')}")
            print(f"   - 启用状态: {'[OK]' if cross_cli_hook.get('enabled') else '❌'}")
            print(f"   - 支持的CLI工具: {cross_cli_hook.get('config', {}).get('supported_clis', [])}")
            print(f"   - 自动检测: {'[OK]' if cross_cli_hook.get('config', {}).get('auto_detect') else '❌'}")
        else:
            print("❌ 跨CLI协作Hook未找到")
            return False

        # 检查适配器文件
        adapter_dir = os.path.dirname(QODER_CONFIG_FILE)
        required_files = ["notification_hook_adapter.py"]
        missing_files = []

        for file_name in required_files:
            file_path = os.path.join(adapter_dir, file_name)
            if not os.path.exists(file_path):
                missing_files.append(file_name)

        if missing_files:
            print(f"❌ 缺失适配器文件: {missing_files}")
            return False
        else:
            print("[OK] 适配器文件已复制")

        return True
    except Exception as e:
        print(f"❌ 验证失败: {e}")
        return False

def uninstall_qoder_integration():
    """卸载Qoder集成"""
    try:
        # 备份现有配置
        if os.path.exists(QODER_CONFIG_FILE):
            backup_file = f"{QODER_CONFIG_FILE}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            shutil.copy2(QODER_CONFIG_FILE, backup_file)
            print(f"📦 已备份现有配置: {backup_file}")

        # 移除跨CLI协作Hook
        config_updated = False
        if os.path.exists(QODER_CONFIG_FILE):
            with open(QODER_CONFIG_FILE, 'r+', encoding='utf-8') as f:
                config = json.load(f)
                hooks = config.get('hooks', [])

                # 移除跨CLI协作Hook
                hooks = [hook for hook in hooks if hook.get('name') != 'CrossCLINotificationHook']

                config['hooks'] = hooks

                f.seek(0)
                f.truncate()
                json.dump(config, f, indent=2, ensure_ascii=False)
                config_updated = True

            print(f"🗑️ Qoder跨CLI协作集成已卸载")
        return True
    except Exception as e:
        print(f"❌ 卸载失败: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="Qoder CLI跨CLI协作集成安装脚本",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--install",
        action="store_true",
        help="安装Qoder CLI跨CLI协作集成"
    )

    parser.add_argument(
        "--verify",
        action="store_true",
        help="验证Qoder CLI集成安装"
    )

    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="卸载Qoder CLI跨CLI协作集成"
    )

    args = parser.parse_args()

    print("[CONFIG] Qoder CLI跨CLI协作集成安装器")
    print("=" * 50)

    if args.uninstall:
        print("[UNINSTALL] 卸载模式...")
        success = uninstall_qoder_integration()
    elif args.verify:
        print("🔍 验证模式...")
        success = verify_installation()
    elif args.install or len(sys.argv) == 1:
        print("📦 安装模式...")

        # 1. 安装配置
        config_success = install_qoder_hooks()

        # 2. 复制适配器文件
        adapter_success = copy_adapter_file()

        success = config_success and adapter_success

        if success:
            print("\n🎉 Qoder CLI跨CLI协作集成安装成功！")
            print("\n[INFO] 安装摘要:")
            print(f"   [OK] 配置文件: {QODER_CONFIG_FILE}")
            print(f"   [OK] 适配器目录: {os.path.dirname(QODER_CONFIG_FILE)}")
            print(f"   [OK] 跨CLI协作Hook: 已启用")

            print("\n[INSTALL] 下一步:")
            print("   1. 运行其他CLI工具的安装脚本")
            print("   2. 使用 ai-cli-router deploy --all 安装所有工具")
            print("   3. 使用 ai-cli-router init 初始化项目")
        else:
            print("\n❌ Qoder CLI跨CLI协作集成安装失败")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()