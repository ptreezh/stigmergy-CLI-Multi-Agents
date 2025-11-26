"""
Claude CLI Hook集成安装脚本
为Claude CLI安装跨CLI协作感知能力

使用方法：
python install_claude_integration.py [--verify|--uninstall]
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

# Claude CLI配置路径
CLAUDE_CONFIG_DIR = os.path.expanduser("~/.config/claude")
CLAUDE_HOOKS_FILE = os.path.join(CLADE_CONFIG_DIR, "hooks.json")

def create_claude_config_directory():
    """创建Claude配置目录"""
    os.makedirs(CLAUDE_CONFIG_DIR, exist_ok=True)
    print(f"✅ 创建Claude配置目录: {CLAUDE_CONFIG_DIR}")

def install_claude_hooks():
    """安装Claude Hook配置"""
    # 读取现有hooks配置
    existing_hooks = {}
    if os.path.exists(CLAUDE_HOOKS_FILE):
        try:
            with open(CLAUDE_HOOKS_FILE, 'r', encoding='utf-8') as f:
                existing_hooks = json.load(f)
        except Exception as e:
            print(f"⚠️ 读取现有hooks配置失败: {e}")
            existing_hooks = {}

    # 定义跨CLI协作的Hook配置
    cross_cli_hooks = {
        "user_prompt_submit": {
            "module": "src.adapters.claude.hook_adapter",
            "class": "ClaudeHookAdapter",
            "enabled": True,
            "priority": 100,
            "config": {
                "cross_cli_enabled": True,
                "supported_clis": ["gemini", "qwencode", "iflow", "qoder", "codebuddy", "copilot"],
                "auto_detect": True,
                "timeout": 30
            }
        },
        "tool_use_pre": {
            "module": "src.adapters.claude.hook_adapter",
            "class": "ClaudeHookAdapter",
            "enabled": True,
            "priority": 90,
            "config": {
                "cross_cli_enabled": True,
                "log_requests": True
            }
        },
        "response_generated": {
            "module": "src.adapters.claude.hook_adapter",
            "class": "ClaudeHookAdapter",
            "enabled": True,
            "priority": 85,
            "config": {
                "add_collaboration_header": True,
                "format_cross_cli_results": True
            }
        }
    }

    # 合并配置（保留现有配置，添加协作功能）
    merged_hooks = existing_hooks.copy()
    for hook_name, hook_config in cross_cli_hooks.items():
        merged_hooks[hook_name] = hook_config

    # 写入hooks配置文件
    try:
        with open(CLADE_HOOKS_FILE, 'w', encoding='utf-8') as f:
            json.dump(merged_hooks, f, indent=2, ensure_ascii=False)

        print(f"✅ Claude Hook配置已安装: {CLAUDE_HOOKS_FILE}")
        print("🔗 已安装的Hook:")
        for hook_name in cross_cli_hooks.keys():
            print(f"   - {hook_name}: ✅ 跨CLI协作感知")

        return True
    except Exception as e:
        print(f"❌ 安装Claude Hook配置失败: {e}")
        return False

def copy_adapter_file():
    """复制适配器文件到Claude配置目录"""
    try:
        # 创建适配器目录
        adapter_dir = os.path.join(CLAUDE_CONFIG_DIR, "adapters")
        os.makedirs(adapter_dir, exist_ok=True)

        # 复制适配器文件
        adapter_files = [
            "hook_adapter.py",
            "claude_skills_integration.py",
            "skills_hook_adapter.py"
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
    print("\n🔍 验证Claude CLI集成安装...")

    # 检查配置目录
    if not os.path.exists(CLAUDE_CONFIG_DIR):
        print(f"❌ 配置目录不存在: {CLAUDE_CONFIG_DIR}")
        return False

    # 检查hooks文件
    if not os.path.exists(CLAUDE_HOOKS_FILE):
        print(f"❌ Hooks配置文件不存在: {CLAUDE_HOOKS_FILE}")
        return False

    # 检查适配器文件
    adapter_dir = os.path.join(CLADE_CONFIG_DIR, "adapters")
    if not os.path.exists(adapter_dir):
        print(f"❌ 适配器目录不存在: {adapter_dir}")
        return False

    # 读取并验证hooks配置
    try:
        with open(CLAUDE_HOOKS_FILE, 'r', encoding='utf-8') as f:
            hooks_config = json.load(f)

        required_hooks = ["user_prompt_submit", "tool_use_pre", "response_generated"]
        for hook in required_hooks:
            if hook in hooks_config:
                hook_config = hooks_config[hook]
                if hook_config.get("enabled", False):
                    print(f"✅ Hook {hook}: 已启用")
                else:
                    print(f"⚠️ Hook {hook}: 未启用")
            else:
                print(f"❌ 缺少必需Hook: {hook}")
                return False

        return True
    except Exception as e:
        print(f"❌ 验证配置失败: {e}")
        return False

def uninstall_claude_integration():
    """卸载Claude CLI集成"""
    try:
        # 备份现有配置
        if os.path.exists(CLAUDE_HOOKS_FILE):
            backup_file = f"{CLAUDE_HOOKS_FILE}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            shutil.copy2(CLAUDE_HOOKS_FILE, backup_file)
            print(f"📦 已备份现有配置: {backup_file}")

        # 移除适配器目录
        adapter_dir = os.path.join(CLAUDE_CONFIG_DIR, "adapters")
        if os.path.exists(adapter_dir):
            shutil.rmtree(adapter_dir)
            print(f"🗑️ 已删除适配器目录: {adapter_dir}")

        print("✅ Claude CLI集成已卸载")
        return True
    except Exception as e:
        print(f"❌ 卸载失败: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="Claude CLI跨CLI协作集成安装脚本",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--install",
        action="store_true",
        help="安装Claude CLI跨CLI协作集成"
    )

    parser.add_argument(
        "--verify",
        action="store_true",
        help="验证Claude CLI集成安装"
    )

    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="卸载Claude CLI跨CLI协作集成"
    )

    args = parser.parse_args()

    print("🤖 Claude CLI跨CLI协作集成安装器")
    print("=" * 50)

    if args.uninstall:
        print("🗑️ 卸载模式...")
        success = uninstall_claude_integration()
    elif args.verify:
        print("🔍 验证模式...")
        success = verify_installation()
    elif args.install or len(sys.argv) == 1:
        print("📦 安装模式...")
        print("\n🎯 为Claude CLI安装跨CLI协作感知能力")
        print("这将让Claude CLI能够:")
        print("   - 检测跨CLI调用意图 (如: '请用gemini帮我分析')")
        print("   - 自动路由到目标CLI工具")
        print("   - 格式化协作结果")
        print("   - 与其他CLI工具间接协作")

        # 1. 创建配置目录
        print("\n1️⃣ 创建配置目录...")
        create_claude_config_directory()

        # 2. 安装Hook配置
        print("\n2️⃣ 安装Hook配置...")
        hooks_success = install_claude_hooks()

        # 3. 复制适配器文件
        print("\n3️⃣ 复制适配器文件...")
        adapter_success = copy_adapter_file()

        success = hooks_success and adapter_success

        if success:
            print("\n🎉 Claude CLI集成安装成功！")
            print("\n📋 安装摘要:")
            print(f"   ✅ 配置目录: {CLAUDE_CONFIG_DIR}")
            print(f"   ✅ Hooks文件: {CLAUDE_HOOKS_FILE}")
            print("   ✅ 跨CLI协作感知: 已启用")

            print("\n🚀 下一步:")
            print("   1. 安装其他CLI工具的集成")
            print("   2. 运行: ai-cli-router init")
            print("   3. 开始使用: claude-cli '请用gemini帮我分析代码'")
        else:
            print("\n❌ Claude CLI集成安装失败，请检查错误信息")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()