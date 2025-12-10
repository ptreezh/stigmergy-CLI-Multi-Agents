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

# CodeBuddy CLI配置路径
CODEBUDDY_CONFIG_DIR = os.path.expanduser("~/.codebuddy")
CODEBUDDY_CONFIG_FILE = os.path.join(CODEBUDDY_CONFIG_DIR, "buddy_config.json")

def create_codebuddy_config_directory():
    """创建CodeBuddy配置目录"""
    os.makedirs(CODEBUDDY_CONFIG_DIR, exist_ok=True)
    print("[OK] 创建CodeBuddy配置目录: {}".format(CODEBUDDY_CONFIG_DIR))

def install_codebuddy_skills():
    """安装CodeBuddy Skills配置"""
    # 读取现有buddy_config配置
    existing_config = {}
    if os.path.exists(CODEBUDDY_CONFIG_FILE):
        try:
            with open(CODEBUDDY_CONFIG_FILE, 'r', encoding='utf-8') as f:
                existing_config = json.load(f)
        except Exception as e:
            print("警告: 读取现有buddy_config配置失败: {}".format(e))
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

        print("[OK] CodeBuddy配置已安装: {}".format(CODEBUDDY_CONFIG_FILE))
        print("已安装的Skills:")
        for skill in merged_config.get('skills', []):
            status = "[OK]" if skill.get('enabled') else "[DISABLED]"
            print("   - {}: {}".format(skill.get('name'), status))

        return True
    except Exception as e:
        print("错误: 安装CodeBuddy配置失败: {}".format(e))
        return False

def copy_adapter_file():
    """复制适配器文件到CodeBuddy配置目录"""
    try:
        # 创建适配器目录
        adapter_dir = CODEBUDDY_CONFIG_DIR
        os.makedirs(adapter_dir, exist_ok=True)

        # 获取当前脚本目录
        current_dir = Path(__file__).parent
        
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
                print("[OK] 复制适配器文件: {}".format(file_name))
            else:
                print("警告: 适配器文件不存在: {}".format(file_name))

        return True
    except Exception as e:
        print("错误: 复制适配器文件失败: {}".format(e))
        return False

def verify_installation():
    """验证安装是否成功"""
    print("\n验证CodeBuddy CLI集成安装...")

    # 检查配置文件
    if not os.path.exists(CODEBUDDY_CONFIG_FILE):
        print("错误: 配置文件不存在: {}".format(CODEBUDDY_CONFIG_FILE))
        return False

    # 检查配置文件内容
    try:
        with open(CODEBUDDY_CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        # 检查是否存在跨CLI技能
        skills = config.get('skills', [])
        cross_cli_skill_found = any(skill.get('name') == 'CrossCLICoordinationSkill' for skill in skills)
        
        if cross_cli_skill_found:
            print("[OK] 跨CLI协调技能已安装")
        else:
            print("警告: 未找到跨CLI协调技能")
            
        print("[OK] CodeBuddy配置文件验证通过")
        return True
    except Exception as e:
        print("错误: 配置文件验证失败: {}".format(e))
        return False

def uninstall_integration():
    """卸载CodeBuddy集成"""
    try:
        # 从配置文件中移除跨CLI技能
        if os.path.exists(CODEBUDDY_CONFIG_FILE):
            with open(CODEBUDDY_CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)

            # 移除跨CLI技能
            skills = config.get('skills', [])
            skills = [skill for skill in skills if skill.get('name') != 'CrossCLICoordinationSkill']
            config['skills'] = skills

            # 保存更新后的配置
            with open(CODEBUDDY_CONFIG_FILE, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)

            print("[OK] 已从CodeBuddy配置中移除跨CLI协调技能")

        # 删除适配器文件
        adapter_files = [
            "skills_hook_adapter.py",
            "standalone_codebuddy_adapter.py"
        ]
        
        for file_name in adapter_files:
            adapter_file = os.path.join(CODEBUDDY_CONFIG_DIR, file_name)
            if os.path.exists(adapter_file):
                os.remove(adapter_file)
                print("[OK] 已删除适配器文件: {}".format(file_name))

        print("[OK] CodeBuddy CLI跨CLI集成已卸载")
        return True
    except Exception as e:
        print("错误: 卸载失败: {}".format(e))
        return False

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="CodeBuddy CLI跨CLI集成安装脚本")
    parser.add_argument("--verify", action="store_true", help="验证安装")
    parser.add_argument("--uninstall", action="store_true", help="卸载集成")
    args = parser.parse_args()

    print("CodeBuddy CLI跨CLI集成安装程序")
    print("=" * 50)

    if args.uninstall:
        return uninstall_integration()
    elif args.verify:
        return verify_installation()
    else:
        # 执行安装
        print("步骤1. 创建配置目录...")
        create_codebuddy_config_directory()

        print("\n步骤2. 安装Skills配置...")
        skills_success = install_codebuddy_skills()

        print("\n步骤3. 复制适配器文件...")
        adapter_success = copy_adapter_file()

        print("\n步骤4. 验证安装...")
        verification_success = verify_installation()

        overall_success = skills_success and adapter_success and verification_success
        if overall_success:
            print("\n[SUCCESS] CodeBuddy CLI跨CLI集成安装成功!")
        else:
            print("\n[WARNING] 安装过程中出现警告，请检查上述输出")

        return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)