"""
iFlow CLI Hook适配器安装脚本
为iFlow CLI安装跨CLI协作感知能力

使用方法：
python install_iflow_integration.py [--verify|--uninstall]
"""

import os
import sys
import json
import shutil
import argparse
import yaml
from pathlib import Path
from datetime import datetime

# iFlow CLI配置路径
IFLOW_CONFIG_DIR = os.path.expanduser("~/.config/iflow")
IFLOW_HOOKS_FILE = os.path.join(IFLOW_CONFIG_DIR, "hooks.yml")

def create_iflow_config_directory():
    """创建iFlow配置目录"""
    os.makedirs(IFLOW_CONFIG_DIR, exist_ok=True)
    print("[OK] 创建iFlow配置目录: {}".format(IFLOW_CONFIG_DIR))

def install_iflow_hooks():
    """安装iFlow Hook配置"""
    # 读取现有hooks配置
    existing_hooks = {}
    if os.path.exists(IFLOW_HOOKS_FILE):
        try:
            with open(IFLOW_HOOKS_FILE, 'r', encoding='utf-8') as f:
                existing_hooks = yaml.safe_load(f) or {}
        except Exception as e:
            print("警告: 读取现有hooks配置失败: {}".format(e))
            existing_hooks = {}

    # 定义跨CLI协作的Hook配置
    cross_cli_hooks = {
        "cross_cli_adapter": {
            "module": "src.adapters.iflow.hook_adapter",
            "class": "IFlowHookAdapter",
            "enabled": True,
            "priority": 100,
            "events": ["workflow_start", "task_execute", "pipeline_complete", "user_input"]
        }
    }

    # 合并配置（保留现有配置，添加协作功能）
    merged_hooks = existing_hooks.copy()
    for hook_name, hook_config in cross_cli_hooks.items():
        merged_hooks[hook_name] = hook_config

    # 写入hooks配置文件
    try:
        with open(IFLOW_HOOKS_FILE, 'w', encoding='utf-8') as f:
            yaml.dump(merged_hooks, f, indent=2, allow_unicode=True)

        print("[OK] iFlow Hook配置已安装: {}".format(IFLOW_HOOKS_FILE))
        print("已安装的Hook:")
        for hook_name in cross_cli_hooks.keys():
            print("   - {}: [OK] 跨CLI协作感知".format(hook_name))

        return True
    except Exception as e:
        print("错误: 安装iFlow Hook配置失败: {}".format(e))
        return False

def copy_adapter_file():
    """复制适配器文件到iFlow配置目录"""
    try:
        # 创建适配器目录
        adapter_dir = os.path.join(IFLOW_CONFIG_DIR, "adapters")
        os.makedirs(adapter_dir, exist_ok=True)

        # 获取当前脚本目录
        current_dir = Path(__file__).parent
        adapter_source = current_dir / "hook_adapter.py"
        adapter_dest = Path(adapter_dir) / "hook_adapter.py"

        # 复制适配器文件
        if adapter_source.exists():
            shutil.copy2(adapter_source, adapter_dest)
            print("[OK] 复制适配器文件: {}".format(adapter_dest))
        else:
            print("错误: 适配器源文件不存在: {}".format(adapter_source))
            return False
            
        # 创建全局Cross-CLI文档
        create_global_cross_cli_documentation(IFLOW_CONFIG_DIR)
            
        return True
    except Exception as e:
        print("错误: 复制适配器文件失败: {}".format(e))
        return False

def verify_installation():
    """验证安装"""
    checks = [
        ("iFlow配置目录", os.path.exists(IFLOW_CONFIG_DIR)),
        ("iFlow Hooks文件", os.path.exists(IFLOW_HOOKS_FILE)),
    ]

    all_passed = True
    for check_name, check_result in checks:
        status = "[OK]" if check_result else "[FAIL]"
        print("{} {}".format(status, check_name))
        if not check_result:
            all_passed = False

    return all_passed

def uninstall_integration():
    """卸载集成"""
    try:
        # 删除hooks配置中的跨CLI适配器
        if os.path.exists(IFLOW_HOOKS_FILE):
            with open(IFLOW_HOOKS_FILE, 'r', encoding='utf-8') as f:
                hooks_config = yaml.safe_load(f) or {}

            # 移除跨CLI适配器
            if "cross_cli_adapter" in hooks_config:
                del hooks_config["cross_cli_adapter"]
                
                # 保存更新后的配置
                with open(IFLOW_HOOKS_FILE, 'w', encoding='utf-8') as f:
                    yaml.dump(hooks_config, f, indent=2, allow_unicode=True)
                
                print("[OK] 已从iFlow Hooks配置中移除跨CLI适配器")

        # 删除适配器文件
        adapter_file = Path(IFLOW_CONFIG_DIR) / "adapters" / "hook_adapter.py"
        if adapter_file.exists():
            adapter_file.unlink()
            print("[OK] 已删除iFlow适配器文件")

        print("[OK] iFlow CLI跨CLI集成已卸载")
        return True
    except Exception as e:
        print("错误: 卸载失败: {}".format(e))
        return False

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="iFlow CLI跨CLI集成安装脚本")
    parser.add_argument("--verify", action="store_true", help="验证安装")
    parser.add_argument("--uninstall", action="store_true", help="卸载集成")
    args = parser.parse_args()

    print("iFlow CLI跨CLI集成安装程序")
    print("=" * 50)

    if args.uninstall:
        return uninstall_integration()
    elif args.verify:
        return verify_installation()
    else:
        # 执行安装
        print("步骤1. 创建配置目录...")
        create_iflow_config_directory()

        print("\n步骤2. 安装Hook配置...")
        hooks_success = install_iflow_hooks()

        print("\n步骤3. 复制适配器文件...")
        adapter_success = copy_adapter_file()

        print("\n步骤4. 验证安装...")
        verification_success = verify_installation()

        overall_success = hooks_success and adapter_success and verification_success
        if overall_success:
            print("\n[SUCCESS] iFlow CLI跨CLI集成安装成功!")
        else:
            print("\n[WARNING] 安装过程中出现警告，请检查上述输出")

        return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
def create_global_cross_cli_documentation(config_dir):
    """创建全局Cross-CLI通信文档"""
    try:
        doc_content = """# iFlow CLI 跨CLI通信指南

## Cross-CLI Communication
当您需要调用其他AI工具时，请使用以下提示<<<在shell中执行以下命令：stigmergy <工具名> <任务描述>>

示例：
- 在shell中运行：stigmergy claude "写一个Python函数"
- 在shell中运行：stigmergy gemini "翻译这段文字"
- 在shell中运行：stigmergy qwen "分析这段代码"

可用工具：claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

---
*本文档由Stigmergy CLI自动生成和维护*
"""

        doc_path = os.path.join(config_dir, "CROSS_CLI_GUIDE.md")
        with open(doc_path, 'w', encoding='utf-8') as f:
            f.write(doc_content)

        print("[OK] 创建Cross-CLI通信指南: {}".format(doc_path))

        # 如果存在iflow.md文件，则在末尾追加Cross-CLI通信提示
        iflow_md_path = os.path.join(os.path.expanduser("~/.iflow"), "iflow.md")
        if os.path.exists(iflow_md_path):
            cross_cli_content = """

## Cross-CLI Communication
当您需要调用其他AI工具时，请使用以下提示<<<在shell中执行以下命令：stigmergy <工具名> <任务描述>>

示例：
- 在shell中运行：stigmergy claude "写一个Python函数"
- 在shell中运行：stigmergy gemini "翻译这段文字"
- 在shell中运行：stigmergy qwen "分析这段代码"

可用工具：claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex
"""
            with open(iflow_md_path, 'a', encoding='utf-8') as f:
                f.write(cross_cli_content)
            print("[OK] 在IFLOW.md末尾追加Cross-CLI通信提示")

        return True
    except Exception as e:
        print("警告: 创建Cross-CLI通信指南失败: {}".format(e))
        return False