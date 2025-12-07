"""
CodeBuddy CLI Skills集成安装脚本
为CodeBuddy CLI安装跨CLI协作感知能力

使用方法：
python install_codebuddy_integration.py [--verify|--uninstall]
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

# CodeBuddy CLI配置路径
CODEBUDDY_CONFIG_DIR = os.path.expanduser("~/.codebuddy")
CODEBUDDY_CONFIG_FILE = os.path.join(CODEBUDDY_CONFIG_DIR, "buddy_config.json")

def create_codebuddy_config_directory():
    """创建CodeBuddy配置目录"""
    os.makedirs(CODEBUDDY_CONFIG_DIR, exist_ok=True)
    print(f"[OK] 创建CodeBuddy配置目录: {CODEBUDDY_CONFIG_DIR}")

def install_codebuddy_skills():
    """安装CodeBuddy Skills配置"""
    # 读取现有buddy_config配置
    existing_config = {}
    if os.path.exists(CODEBUDDY_CONFIG_FILE):
        try:
            with open(CODEBUDDY_CONFIG_FILE, 'r', encoding='utf-8') as f:
                existing_config = json.load(f)
        except Exception as e:
            print(f"⚠️ 读取现有buddy_config配置失败: {e}")
            existing_config = {}

    # 定义跨CLI协作的Skills配置
    cross_cli_skills = {
        "cross_cli_skill": {
            "name": "CrossCLICoordinationSkill",
            "description": "Cross-CLI工具协调技能",
            "module": "src.adapters.codebuddy.skills_hook_adapter",
            "class": "CodeBuddySkillsHookAdapter",
            "enabled": True,
            "priority": 100,
            "triggers": [
                "on_skill_activation",
                "on_user_command"
            ],
            "config": {
                "cross_cli_enabled": True,
                "supported_clis": ["claude", "gemini", "qwencode", "iflow", "qoder", "copilot"],
                "auto_route": True,
                "timeout": 30,
                "collaboration_mode": "active"
            }
        }
    }

    # 合并配置（保留现有skills，添加协作功能）
    merged_config = existing_config.copy()
    if 'skills' not in merged_config:
        merged_config['skills'] = []

    # 检查是否已存在跨CLI协调技能
    existing_skill_names = [skill.get('name') for skill in merged_config.get('skills', [])]
    cross_cli_skill_name = "CrossCLICoordinationSkill"

    if cross_cli_skill_name not in existing_skill_names:
        merged_config['skills'].append(cross_cli_skills['cross_cli_skill'])

    # 写入配置文件
    try:
        with open(CODEBUDDY_CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(merged_config, f, indent=2, ensure_ascii=False)

        print(f"[OK] CodeBuddy配置已安装: {CODEBUDDY_CONFIG_FILE}")
        print("🔗 已安装的Skills:")
        for skill in merged_config.get('skills', []):
            status = "[OK]" if skill.get('enabled') else "❌"
            print(f"   - {skill.get('name')}: {status}")

        return True
    except Exception as e:
        print(f"❌ 安装CodeBuddy配置失败: {e}")
        return False

def copy_adapter_file():
    """复制适配器文件到CodeBuddy配置目录"""
    try:
        # 创建适配器目录
        adapter_dir = CODEBUDDY_CONFIG_DIR
        os.makedirs(adapter_dir, exist_ok=True)

        # 复制适配器文件
        adapter_files = [
            "skills_hook_adapter.py",
            "standalone_codebuddy_adapter.py"
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
    print("\n🔍 验证CodeBuddy CLI集成安装...")

    # 检查配置文件
    if not os.path.exists(CODEBUDDY_CONFIG_FILE):
        print(f"❌ 配置文件不存在: {CODEBUDDY_CONFIG_FILE}")
        return False

    try:
        with open(CODEBUDDY_CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = json.load(f)

        skills = config.get('skills', [])
        cross_cli_skill = None
        for skill in skills:
            if skill.get('name') == 'CrossCLICoordinationSkill':
                cross_cli_skill = skill
                break

        if cross_cli_skill:
            print("[OK] 跨CLI协作Skill已安装")
            print(f"   - 技能名称: {cross_cli_skill.get('name')}")
            print(f"   - 描述: {cross_cli_skill.get('description')}")
            print(f"   - 启用状态: {'[OK]' if cross_cli_skill.get('enabled') else '❌'}")
            print(f"   - 支持的CLI工具: {cross_cli_skill.get('config', {}).get('supported_clis', [])}")
            print(f"   - 自动路由: {'[OK]' if cross_cli_skill.get('config', {}).get('auto_route') else '❌'}")
        else:
            print("❌ 跨CLI协作Skill未找到")
            return False

        # 检查适配器文件
        required_files = ["skills_hook_adapter.py"]
        missing_files = []

        for file_name in required_files:
            file_path = os.path.join(CODEBUDDY_CONFIG_DIR, file_name)
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

def uninstall_codebuddy_integration():
    """卸载CodeBuddy集成"""
    try:
        # 备份现有配置
        if os.path.exists(CODEBUDDY_CONFIG_FILE):
            backup_file = f"{CODEBUDDY_CONFIG_FILE}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            shutil.copy2(CODEBUDDY_CONFIG_FILE, backup_file)
            print(f"📦 已备份现有配置: {backup_file}")

        # 移除跨CLI协作Skill
        config_updated = False
        if os.path.exists(CODEBUDDY_CONFIG_FILE):
            with open(CODEBUDDY_CONFIG_FILE, 'r+', encoding='utf-8') as f:
                config = json.load(f)
                skills = config.get('skills', [])

                # 移除跨CLI协作Skill
                skills = [skill for skill in skills if skill.get('name') != 'CrossCLICoordinationSkill']

                f.seek(0)
                f.truncate()
                json.dump({
                    'skills': skills,
                    'version': config.get('version', '1.0.0')
                }, f, indent=2, ensure_ascii=False)
                config_updated = True

            print(f"🗑️ CodeBuddy跨CLI协作集成已卸载")
        return True
    except Exception as e:
        print(f"❌ 卸载失败: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="CodeBuddy CLI跨CLI协作集成安装脚本",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--install",
        action="store_true",
        help="安装CodeBuddy CLI跨CLI协作集成"
    )

    parser.add_argument(
        "--verify",
        action="store_true",
        help="验证CodeBuddy CLI集成安装"
    )

    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="卸载CodeBuddy CLI跨CLI协作集成"
    )

    args = parser.parse_args()

    print("[INSTALL] CodeBuddy CLI跨CLI协作集成安装器")
    print("=" * 50)

    if args.uninstall:
        print("[UNINSTALL] 卸载模式...")
        success = uninstall_codebuddy_integration()
    elif args.verify:
        print("[VERIFY] 验证模式...")
        success = verify_installation()
    elif args.install or len(sys.argv) == 1:
        print("[INSTALL] 安装模式...")

        # 1. 创建配置目录
        print("Step 1. 创建配置目录...")
        create_codebuddy_config_directory()

        # 2. 安装Skills配置
        print("Step 2. 安装Skills配置...")
        config_success = install_codebuddy_skills()

        # 3. 复制适配器文件
        print("Step 3. 复制适配器文件...")
        adapter_success = copy_adapter_file()

        # 4. 验证安装
        print("Step 4. 验证安装...")
        verify_success = verify_installation()

        success = config_success and adapter_success and verify_success

        if success:
            print("\n🎉 CodeBuddy CLI跨CLI协作集成安装成功！")
            print("\n[INFO] 安装摘要:")
            print(f"   [OK] 配置目录: {CODEBUDDY_CONFIG_DIR}")
            print(f"   [OK] 配置文件: {CODEBUDDY_CONFIG_FILE}")
            print(f"   [OK] 适配器目录: {CODEBUDDY_CONFIG_DIR}")
            print(f"   [OK] 跨CLI协作Skill: 已启用")

            print("\n[INSTALL] 下一步:")
            print("   1. 安装其他CLI工具的集成")
            print("   2. 使用 ai-cli-router deploy --all")
            print("   3. 使用 ai-cli-router init 初始化项目")
        else:
            print("\n❌ CodeBuddy CLI跨CLI协作集成安装失败")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()