#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 查看商品列表

Usage:
    python skill.py [--page 1] [--limit 20] [--q KEYWORD] [--json]
"""

import json

import os
import sys

script_dir = os.path.dirname(os.path.abspath(__file__))
utils_path = os.path.join(script_dir, "..", "..")
if utils_path not in sys.path:
    sys.path.insert(0, utils_path)

try:
    from skill_utils import cross_platform_print
except ImportError:
    def cross_platform_print(text): print(text)

import argparse


def execute(args):
    """直接调用 executor"""
    try:
        from eb_edu_executor import product_list
        result = product_list()
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}


def format_output(result, args):
    if result["success"]:
        raw = result["data"]
        if isinstance(raw, str):
            products = []
            for line in raw.strip().split("\n"):
                line = line.strip()
                if not line or "商品列表" in line:
                    continue
                if ": " in line:
                    parts = line.split(": ", 1)
                    k = parts[0].strip()
                    v = parts[1].strip().rstrip(",").strip('"')
                    if products and k not in products[-1]:
                        products[-1][k] = v
                    elif k in ("title", "price", "id", "inventory"):
                        products.append({k: v})
        else:
            products = raw if isinstance(raw, list) else []

        output = ["## 📦 商品列表\n"]
        if not products:
            output.append("暂无商品")
        else:
            for i, p in enumerate(products[:10], 1):
                title = p.get("title", "N/A")
                price = p.get("price", "N/A")
                inv = p.get("inventory", "0")
                status = p.get("status", "")
                output.append(f"{i}. **{title}**")
                output.append(f"   - 价格：¥{price}")
                output.append(f"   - 库存：{inv}件")
                if status:
                    output.append(f"   - 状态：{status}")
                output.append("")
            if len(products) > 10:
                output.append(f"... 还有 {len(products) - 10} 件商品")
            output.append(f"\n共 {len(products)} 件商品")
        return "\n".join(output)
    else:
        return f"❌ 查询失败\n\n**错误**: {result.get('error', '未知错误')}"


def main():
    parser = argparse.ArgumentParser(description="查看商品列表")
    parser.add_argument("--page", type=int, default=1, help="页码")
    parser.add_argument("--limit", type=int, default=20, help="每页数量")
    parser.add_argument("--q", type=str, help="搜索关键词")
    parser.add_argument("--json", action="store_true", help="输出 JSON 格式")
    args = parser.parse_args()
    result = execute(args)
    cross_platform_print(format_output(result, args))
    return 0 if result["success"] else 1


if __name__ == "__main__":
    sys.exit(main())
