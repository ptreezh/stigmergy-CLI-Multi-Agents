#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 登录 eb-edu 后端

Usage:
    python skill.py --username admin --password admin123 [--school-id school_001]

直接调用 eb-edu CLI（不走stigmergy）
"""

import json
import os
import sys
import subprocess
import argparse
from pathlib import Path

EB_EDU_API_URL = os.environ.get("EB_EDU_API_URL", "http://localhost:9000/api/v1")
EB_EDU_TOKEN_FILE = Path.home() / ".eb_edu" / ".token"


def run_eb_edu(args_list, timeout=30):
    """直接调用 eb-edu CLI"""
    import shutil
    eb_edu_cmd = shutil.which("eb-edu") or "eb-edu"
    cmd = [eb_edu_cmd, "--url", EB_EDU_API_URL] + args_list
    try:
        result = subprocess.run(cmd, shell=False, capture_output=True, text=True, timeout=timeout, encoding='utf-8', errors='replace')
        return result
    except Exception:
        return None


def login(username, password, school_id=""):
    """登录 eb-edu"""
    args = ["auth", "login", "--username", username, "--password", password]
    if school_id:
        args += ["--school-id", school_id]

    result = run_eb_edu(args)
    if not result or result.returncode != 0:
        return False, result.stderr if result else "eb-edu执行失败"
    return True, None


def format_output(success, err):
    if success:
        return "✅ eb-edu 登录成功\n\n- Token 已保存至 C:\Users\Zhang/.eb_edu/.token"
    else:
        return f"❌ 登录失败\n\n**错误**: {err}"


def main():
    parser = argparse.ArgumentParser(description="登录 eb-edu 教学平台")
    parser.add_argument("--username", type=str, required=True, help="用户名")
    parser.add_argument("--password", type=str, required=True, help="密码")
    parser.add_argument("--school-id", type=str, default="", help="学校ID")
    args = parser.parse_args()

    success, err = login(args.username, args.password, args.school_id)
    print(format_output(success, err))
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
