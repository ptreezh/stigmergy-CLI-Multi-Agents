#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 创建优惠券

调用方式:
    stigmergy skill call eb-edu-medusa-create-discount \\
        --code "SUMMER20" \\
        --type "percentage" \\
        --value 20
"""

import json

# 导入跨平台工具
import os
import sys

# 添加 skill_utils 到路径
script_dir = os.path.dirname(os.path.abspath(__file__))
utils_path = os.path.join(script_dir, "..", "..")
if utils_path not in sys.path:
    sys.path.insert(0, utils_path)

try:
    from skill_utils import (
        cross_platform_print,
        cross_platform_input,
        safe_json_loads,
        run_command_safe,
        get_resource_path
    )
except ImportError:
    # 备用函数
    def cross_platform_cross_platform_print(text):
        cross_platform_print(text)
    def cross_platform_cross_platform_input(prompt):
        cross_platform_print(prompt)
        return cross_platform_input()
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
        return os.path.join(script_dir, relative_path)

import sys
import subprocess
import argparse


def build_command(args):
    """构建 CLI 命令"""
    cmd = "stigmergy eb-edu medusa discount create"
    
    if args.code:
        cmd += f' --code "{args.code}"'
    if args.type:
        cmd += f' --type "{args.type}"'
    if args.value:
        cmd += f' --value {args.value}'
    if args.starts_at:
        cmd += f' --starts-at "{args.starts_at}"'
    if args.ends_at:
        cmd += f' --ends-at "{args.ends_at}"'
    if args.usage_limit:
        cmd += f' --usage-limit {args.usage_limit}'
    
    return cmd


def execute_command(cmd):
    """执行 CLI 命令"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            try:
                return {"success": True, "data": json.loads(result.stdout)}
            except:
                return {"success": True, "data": result.stdout}
        else:
            return {"success": False, "error": result.stderr}
    
    except Exception as e:
        return {"success": False, "error": str(e)}


def format_output(result, args):
    """格式化输出结果"""
    if result["success"]:
        discount = result["data"]
        if isinstance(discount, str):
            try:
                discount = json.loads(discount)
            except:
                pass
        
        if isinstance(discount, dict):
            discount = discount.get("discount", discount.get("data", {}))
        
        output = ["## ✅ 优惠券已创建\n"]
        output.append(f"**代码**: {discount.get('code', args.code)}")
        output.append(f"**类型**: {discount.get('rule', {}).get('type', args.type)}")
        output.append(f"**价值**: {discount.get('rule', {}).get('value', args.value)}")
        output.append(f"**有效期**: {discount.get('starts_at', 'N/A')} 至 {discount.get('ends_at', '无')}")
        
        return "\n".join(output)
    else:
        return f"❌ 创建失败\n\n**错误**: {result.get('error', '未知错误')}"


def main():
    parser = argparse.ArgumentParser(description="创建优惠券")
    parser.add_argument("--code", type=str, required=True, help="优惠券代码")
    parser.add_argument("--type", type=str, default="percentage", choices=["percentage", "fixed"], help="优惠类型")
    parser.add_argument("--value", type=int, default=10, help="优惠值")
    parser.add_argument("--starts-at", type=str, help="开始时间")
    parser.add_argument("--ends-at", type=str, help="结束时间")
    parser.add_argument("--usage-limit", type=int, help="使用次数限制")
    
    args = parser.parse_args()
    
    cmd = build_command(args)
    result = execute_command(cmd)
    output = format_output(result, args)
    cross_platform_print(output)
    
    return 0 if result["success"] else 1


if __name__ == "__main__":
    sys.exit(main())
