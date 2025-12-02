#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Windows GBK编码修复安装脚本
解决Windows系统中GBK编码导致的安装错误
"""

import os
import sys
import json
import shutil
import argparse
import locale
from pathlib import Path
from datetime import datetime

# Windows编码修复
def setup_windows_encoding():
    """设置Windows编码支持"""
    if sys.platform == 'win32':
        # 设置Python默认编码
        import codecs
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
        
        # 设置环境变量
        os.environ['PYTHONIOENCODING'] = 'utf-8'
        
        # 尝试设置系统编码
        try:
            import locale
            locale.setlocale(locale.LC_ALL, 'zh_CN.UTF-8')
        except:
            try:
                locale.setlocale(locale.LC_ALL, 'Chinese.UTF-8')
            except:
                pass  # 保持默认

def safe_write_json(file_path, data, backup=True):
    """安全写入JSON文件，处理编码问题"""
    file_path = Path(file_path)
    
    # 备份现有文件
    if backup and file_path.exists():
        backup_path = file_path.with_suffix(f'.backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
        shutil.copy2(file_path, backup_path)
        print(f"📦 已备份现有配置: {backup_path}")
    
    try:
        # 确保目录存在
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 先写入临时文件，然后重命名（避免写入中断导致文件损坏）
        temp_path = file_path.with_suffix('.tmp')
        
        with open(temp_path, 'w', encoding='utf-8', errors='replace') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # 重命名为最终文件
        temp_path.replace(file_path)
        
        print(f"[OK] 配置文件已安全写入: {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ 写入配置文件失败: {e}")
        
        # 清理临时文件
        if temp_path.exists():
            temp_path.unlink()
        
        # 尝试使用GBK编码写入（降级方案）
        try:
            print("🔄 尝试使用GBK编码...")
            with open(file_path, 'w', encoding='gbk', errors='replace') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"[OK] 使用GBK编码写入成功: {file_path}")
            return True
        except Exception as e2:
            print(f"❌ GBK编码也失败了: {e2}")
            return False

def safe_copy_file(src, dst):
    """安全复制文件，处理编码问题"""
    try:
        src = Path(src)
        dst = Path(dst)
        
        if not src.exists():
            print(f"⚠️ 源文件不存在: {src}")
            return False
        
        # 确保目标目录存在
        dst.parent.mkdir(parents=True, exist_ok=True)
        
        # 复制文件
        shutil.copy2(src, dst)
        print(f"[OK] 文件复制成功: {src} -> {dst}")
        return True
        
    except Exception as e:
        print(f"❌ 文件复制失败: {e}")
        return False

def install_with_encoding_fix(tool_name, install_func):
    """带编码修复的安装函数"""
    print(f"[INSTALL] {tool_name} CLI跨CLI协作集成安装器（Windows编码修复版）")
    print("=" * 60)
    
    # 设置Windows编码
    setup_windows_encoding()
    
    print(f"[INFO] 为{tool_name} CLI安装跨CLI协作感知能力")
    print("这将让{tool_name} CLI能够:")
    print("   - 检测跨CLI调用意图 (如: '请用gemini帮我分析')")
    print("   - 自动路由到目标CLI工具")
    print("   - 格式化协作结果")
    print("   - 与其他CLI工具间接协作")
    print()
    
    return install_func()

# Claude CLI安装函数（修复版）
def install_claude_with_fix():
    current_dir = Path(__file__).parent
    project_root = current_dir.parent.parent.parent
    
    # Claude CLI配置路径
    CLAUDE_CONFIG_DIR = os.path.expanduser("~/.config/claude")
    CLAUDE_HOOKS_FILE = os.path.join(CLAUDE_CONFIG_DIR, "hooks.json")
    
    # 1. 创建配置目录
    print("1️⃣ 创建配置目录...")
    os.makedirs(CLAUDE_CONFIG_DIR, exist_ok=True)
    print(f"[OK] 创建Claude配置目录: {CLAUDE_CONFIG_DIR}")
    
    # 2. 安装Hook配置
    print("\nStep 2. 安装Hook配置...")
    
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
    
    # 使用安全写入方法
    hooks_success = safe_write_json(CLAUDE_HOOKS_FILE, cross_cli_hooks, backup=True)
    
    if hooks_success:
        print("🔗 已安装的Hook:")
        for hook_name in cross_cli_hooks.keys():
            print(f"   - {hook_name}: [OK] 跨CLI协作感知")
    
    # 3. 复制适配器文件
    print("\nStep 3. 复制适配器文件...")
    adapter_dir = os.path.join(CLAUDE_CONFIG_DIR, "adapters")
    os.makedirs(adapter_dir, exist_ok=True)
    
    adapter_files = [
        "hook_adapter.py",
        "claude_skills_integration.py", 
        "skills_hook_adapter.py"
    ]
    
    adapter_success = True
    for file_name in adapter_files:
        src_file = current_dir / file_name
        dst_file = os.path.join(adapter_dir, file_name)
        if not safe_copy_file(src_file, dst_file):
            adapter_success = False
    
    success = hooks_success and adapter_success
    
    if success:
        print("\n🎉 Claude CLI集成安装成功！")
        print("\n[INFO] 安装摘要:")
        print(f"   [OK] 配置目录: {CLAUDE_CONFIG_DIR}")
        print(f"   [OK] Hooks文件: {CLAUDE_HOOKS_FILE}")
        print("   [OK] 跨CLI协作感知: 已启用")
        print("\n[INSTALL] 下一步:")
        print("   1. 安装其他CLI工具的集成")
        print("   2. 运行: stigmergy-cli init")
        print("   3. 开始使用: claude-cli '请用gemini帮我分析代码'")
    else:
        print("\n❌ Claude CLI集成安装失败，请检查错误信息")
    
    return success

def main():
    parser = argparse.ArgumentParser(
        description="Windows GBK编码修复版CLI工具集成安装器",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        "--tool",
        choices=["claude", "gemini", "all"],
        default="claude",
        help="选择要安装的CLI工具"
    )
    
    args = parser.parse_args()
    
    if args.tool == "claude":
        success = install_with_encoding_fix("Claude", install_claude_with_fix)
    elif args.tool == "all":
        print("暂不支持all选项，请逐个安装")
        success = False
    else:
        print("暂不支持该工具")
        success = False
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())