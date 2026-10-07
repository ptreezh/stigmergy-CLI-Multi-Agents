#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 创建客户

Usage:
    python skill.py --email EMAIL [--first-name NAME] [--last-name NAME] [--phone PHONE]
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
        from eb_edu_executor import medusa_customer_create
        result = medusa_customer_create(
            args.email,
            getattr(args, "first_name", "") or "",
            getattr(args, "last_name", "") or "",
            getattr(args, "phone", "") or "",
        )
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}


def format_output(result, args):
    if result["success"]:
        raw = result["data"]
        output = ["## ✅ 客户已创建\n"]
        if isinstance(raw, str):
            for line in raw.strip().split("\n"):
                line = line.strip()
                if ": " in line:
                    parts = line.split(": ", 1)
                    k = parts[0].strip()
                    v = parts[1].strip()
                    output.append(f"- **{k}**: {v}")
                elif line.startswith("["):
                    continue
        elif isinstance(raw, dict):
            cid = raw.get("id", "N/A")
            email = raw.get("email", args.email)
            fname = raw.get("first_name", "") or getattr(args, "first_name", "")
            lname = raw.get("last_name", "") or getattr(args, "last_name", "")
            output.append(f"- **客户 ID**: {cid}")
            output.append(f"- **邮箱**: {email}")
            if fname or lname:
                output.append(f"- **姓名**: {fname} {lname}")
        else:
            output.append(f"- **邮箱**: {args.email}")
        return "\n".join(output)
    else:
        return f"❌ 创建失败\n\n**错误**: {result.get('error', '未知错误')}"


def main():
    parser = argparse.ArgumentParser(description="创建客户")
    parser.add_argument("--email", type=str, required=True, help="客户邮箱")
    parser.add_argument("--first-name", type=str, help="名字")
    parser.add_argument("--last-name", type=str, help="姓氏")
    parser.add_argument("--phone", type=str, help="手机号")
    args = parser.parse_args()
    result = execute(args)
    cross_platform_print(format_output(result, args))
    return 0 if result["success"] else 1


if __name__ == "__main__":
    sys.exit(main())
