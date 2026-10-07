#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - [Skill 名称]

培养能力：
- [能力 1]
- [能力 2]
- [能力 3]

特性：
- 跨平台兼容（Windows/Linux/macOS）
- 自适应编码（UTF-8/GBK）
- 无外部依赖（仅使用 Python 标准库）
- 中文无乱码

使用方式：
    python skill.py
    python skill.py --help
"""

# 导入跨平台工具（必须是相对导入）
import os
import sys

# 添加 skill_utils 到路径
script_dir = os.path.dirname(os.path.abspath(__file__))
utils_path = os.path.join(script_dir, "..", "..")  # 返回到 eb-edu 目录
if utils_path not in sys.path:
    sys.path.insert(0, utils_path)

# 现在可以导入 skill_utils
try:
    from skill_utils import (
        cross_platform_print,
        cross_platform_input,
        safe_json_loads,
        run_command_safe,
        get_resource_path
    )
except ImportError:
    # 如果导入失败，定义备用函数
    def cross_platform_print(text):
        print(text)
    
    def cross_platform_input(prompt):
        print(prompt)
        return input()
    
    def safe_json_loads(json_str):
        import json
        try:
            return json.loads(json_str)
        except:
            return {}
    
    def run_command_safe(command, timeout=30):
        import subprocess
        try:
            result = subprocess.run(
                command, shell=True, capture_output=True,
                text=True, timeout=timeout, encoding='utf-8'
            )
            return (result.returncode == 0, result.stdout, result.stderr)
        except:
            return (False, "", "Error")
    
    def get_resource_path(relative_path):
        return os.path.join(os.path.dirname(__file__), relative_path)


import json
import argparse


# Skill 元数据
SKILL_METADATA = {
    "name": "[skill-name]",
    "version": "1.0",
    "description": "[Skill 描述]",
    "author": "电商 AI 实训平台",
    "category": "education"
}


def load_skill_config():
    """
    加载 Skill 配置文件
    
    Returns:
        dict: Skill 配置
    """
    config_path = get_resource_path("skill.json")
    
    if os.path.exists(config_path):
        content = read_file_safe(config_path)
        return safe_json_loads(content)
    else:
        return {}


def get_input(prompt, allow_empty=False):
    """
    获取用户输入（跨平台兼容）
    
    Args:
        prompt (str): 提示文本
        allow_empty (bool): 是否允许空输入
    
    Returns:
        str: 用户输入的文本
    """
    try:
        while True:
            answer = cross_platform_input(f"\n{prompt}\n> ").strip()
            if answer or allow_empty:
                return answer
    except EOFError:
        return ""
    except KeyboardInterrupt:
        print("\n\n操作已取消")
        sys.exit(0)


def call_llm(prompt):
    """
    调用 LLM（跨平台兼容）
    
    Args:
        prompt (str): LLM 提示
    
    Returns:
        str: LLM 回应
    """
    # 方法 1: 调用 stigmergy qwen
    success, stdout, stderr = run_command_safe(
        f'stigmergy qwen "{prompt}"',
        timeout=60
    )
    
    if success and stdout:
        return stdout.strip()
    
    # 方法 2: 备用回应（当 LLM 不可用时）
    return "📊 导师点评：你的方案基本合理，建议继续完善。"


def main():
    """主函数"""
    # 解析命令行参数
    parser = argparse.ArgumentParser(
        description=SKILL_METADATA["description"]
    )
    # 添加参数...
    # parser.add_argument("--param", type=str, help="参数说明")
    
    args = parser.parse_args()
    
    # 打印 Skill 介绍
    cross_platform_print("=" * 60)
    cross_platform_print(f"{SKILL_METADATA['name']}")
    cross_platform_print("=" * 60)
    
    # 执行 Skill 逻辑...
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
