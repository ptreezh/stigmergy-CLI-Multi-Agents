#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 查看班级列表

Usage:
    python skill.py [--school-id SCHOOL_ID]

直接调用 eb-edu CLI（通过 eb_edu_executor，不依赖 stigmergy）
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


def build_command(args):
    # 直接调用，不走 stigmergy
    return None  # 不需要命令字符串


def execute(args):
    """直接调用 executor，不通过 subprocess"""
    try:
        from eb_edu_executor import class_list
        result = class_list(getattr(args, "school_id", "") or "")
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}


def parse_class_list(text):
    """解析 eb-edu class list 输出的纯文本"""
    lines = text.strip().split("\n")
    classes = []
    current = {}
    for line in lines:
        line = line.strip()
        if not line or line.startswith("班级列表"):
            continue
        if line.startswith("["):
            if current:
                classes.append(current)
            m = line.match(r'\[(\d+)\]') if False else None
            continue
        if ": " in line:
            key, _, val = line.partition(": ")
            key = key.strip()
            val = val.strip().rstrip(",")
            current[key] = val
    if current:
        classes.append(current)
    return classes


def format_output(result, args):
    if result["success"]:
        raw = result["data"]
        if isinstance(raw, str):
            classes = []
            for line in raw.strip().split("\n"):
                line = line.strip()
                if not line or "班级列表" in line:
                    continue
                if line.startswith("["):
                    if classes and isinstance(classes[-1], dict) and len(classes[-1]) > 1:
                        pass
                    continue
                if ": " in line:
                    parts = line.split(": ", 1)
                    k = parts[0].strip()
                    v = parts[1].strip().rstrip(",").strip('"')
                    if classes and k in ("name", "grade", "id", "schoolId") and k not in classes[-1]:
                        classes[-1][k] = v
                    elif k in ("name", "grade", "id", "schoolId"):
                        if not any(k in c for c in classes):
                            classes.append({k: v})
            # dedupe
            seen = set()
            deduped = []
            for c in classes:
                key = c.get("id", "")
                if key and key not in seen:
                    seen.add(key)
                    deduped.append(c)
                elif not key:
                    deduped.append(c)
            classes = deduped
        else:
            classes = raw if isinstance(raw, list) else []

        output = ["## 📚 班级列表\n"]
        if classes:
            for c in classes:
                output.append(f"- **{c.get('name', 'N/A')}** ({c.get('grade', 'N/A')}) - {c.get('id', '')[:8]}...")
        else:
            output.append("暂无班级")
        return "\n".join(output)
    else:
        return f"❌ 查询失败\n\n**错误**: {result.get('error', '未知错误')}"


def main():
    parser = argparse.ArgumentParser(description="查看班级列表")
    parser.add_argument("--school-id", type=str, default=None, help="学校ID")
    args = parser.parse_args()
    result = execute(args)
    cross_platform_print(format_output(result, args))
    return 0 if result["success"] else 1


if __name__ == "__main__":
    sys.exit(main())
