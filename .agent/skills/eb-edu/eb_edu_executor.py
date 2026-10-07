#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
eb-edu CLI 执行器（共享模块）

用途：
- 所有 eb-edu 技能共享的 CLI 调用基础设施
- 不依赖 stigmergy，直接调用 eb-edu CLI
- 后端地址通过环境变量配置，部署时固定

使用方式：
    from eb_edu_executor import run_eb_edu, eb_edu_args

    result = run_eb_edu(["class", "list"])
    result = run_eb_edu(["class", "create", "--name", "电商2301", "--grade", "2023"])
    result = run_eb_edu(["product", "list", "--json"])

返回格式：
    {
        "success": bool,
        "data": dict|str,
        "error": str|None,
        "message": str
    }
"""

from __future__ import annotations

import os
import sys
import json
import shutil
import subprocess
from typing import Optional, Any


# ── 配置 ──────────────────────────────────────────────────────────────────────

EB_EDU_API_URL: str = os.environ.get(
    "EB_EDU_API_URL",
    "http://localhost:9000/api/v1"
)

# eb-edu CLI 路径（按优先级）
EB_EDU_CMD: str = os.environ.get("EB_EDU_CLI", "eb-edu")


# ── 工具函数 ──────────────────────────────────────────────────────────────────

def find_eb_edu_cli() -> str:
    """查找 eb-edu CLI 可执行文件路径"""
    path = shutil.which(EB_EDU_CMD)
    if path:
        return path
    # 常见安装位置
    for alt in [
        "/e/Python312/Scripts/eb-edu",
        os.path.expanduser("C:\Users\Zhang/AppData/Python/Scripts/eb-edu"),
        os.path.expanduser("C:\Users\Zhang/.local/bin/eb-edu"),
    ]:
        if os.path.isfile(alt) or os.path.isfile(alt + ".exe"):
            return alt
    return EB_EDU_CMD


def _build_args(subcmd_list: list[str], extra_args: list[str] | None = None) -> list[str]:
    """构建完整 CLI 参数列表"""
    args = [find_eb_edu_cli(), "--url", EB_EDU_API_URL] + list(subcmd_list)
    if extra_args:
        args += list(extra_args)
    return args


def _parse_stdout(stdout: str) -> Any:
    """尝试解析 JSON 输出"""
    try:
        return json.loads(stdout)
    except (json.JSONDecodeError, ValueError):
        return stdout


# ── 核心执行函数 ───────────────────────────────────────────────────────────────

def run_eb_edu(
    subcmd_list: list[str],
    extra_args: list[str] | None = None,
    timeout: int = 30,
) -> dict[str, Any]:
    """
    执行 eb-edu CLI 命令并返回标准化结果

    参数:
        subcmd_list: eb-edu 子命令列表，如 ["class", "list"]
        extra_args:  额外参数列表，如 ["--json"]
        timeout:     超时秒数

    返回:
        {
            "success": bool,
            "data":    dict|str,
            "error":   str|None,
            "message": str
        }
    """
    args = _build_args(subcmd_list, extra_args)

    try:
        result = subprocess.run(
            args,
            shell=False,
            capture_output=True,
            text=True,
            timeout=timeout,
            encoding="utf-8",
            errors="replace",
        )

        if result.returncode == 0:
            return {
                "success": True,
                "data": _parse_stdout(result.stdout),
                "error": None,
                "message": "执行成功",
            }
        else:
            return {
                "success": False,
                "data": None,
                "error": result.stderr.strip() or result.stdout.strip() or f"exit {result.returncode}",
                "message": "执行失败",
            }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "data": None,
            "error": f"命令执行超时（{timeout}s）",
            "message": "超时",
        }
    except FileNotFoundError:
        return {
            "success": False,
            "data": None,
            "error": f"找不到 eb-edu CLI，请确认已安装（pip install eb-edu）",
            "message": "CLI 不存在",
        }
    except Exception as e:
        return {
            "success": False,
            "data": None,
            "error": str(e),
            "message": "执行异常",
        }


# ── 便捷包装 ───────────────────────────────────────────────────────────────────────

def class_list(school_id: str = "", extra: list[str] | None = None) -> dict:
    args = ["class", "list"]
    if school_id:
        args += ["--school-id", school_id]
    return run_eb_edu(args, extra)


def class_create(name: str, grade: str, school_id: str = "") -> dict:
    args = ["class", "create", "--name", name, "--grade", grade]
    if school_id:
        args += ["--school-id", school_id]
    return run_eb_edu(args)


def class_get(class_id: str) -> dict:
    return run_eb_edu(["class", "get", class_id])


def class_add_students(class_id: str, student_ids: list[str]) -> dict:
    ids = ",".join(student_ids)
    return run_eb_edu(["class", "add-students", class_id, "--student-ids", ids])


def school_list(extra: list[str] | None = None) -> dict:
    return run_eb_edu(["school", "list"], extra)


def school_create(name: str, code: str, extra: list[str] | None = None) -> dict:
    args = ["school", "create", "--name", name, "--code", code]
    return run_eb_edu(args, extra)


def school_get(school_id: str) -> dict:
    return run_eb_edu(["school", "get", school_id])


def user_list(role: str = "", school_id: str = "", page: int = 1, limit: int = 20) -> dict:
    args = ["user", "list", "--page", str(page), "--limit", str(limit)]
    if role:
        args += ["--role", role]
    if school_id:
        args += ["--school-id", school_id]
    return run_eb_edu(args)


def user_create(
    username: str, password: str, name: str, role: str,
    school_id: str, email: str = "", phone: str = ""
) -> dict:
    args = [
        "user", "create",
        "--username", username, "--password", password,
        "--name", name, "--role", role, "--school-id", school_id,
    ]
    if email:
        args += ["--email", email]
    if phone:
        args += ["--phone", phone]
    return run_eb_edu(args)


def user_get(user_id: str) -> dict:
    return run_eb_edu(["user", "get", user_id])


def user_delete(user_id: str) -> dict:
    return run_eb_edu(["user", "delete", user_id])


def product_list(extra: list[str] | None = None) -> dict:
    args = ["product", "list"]
    return run_eb_edu(args, extra)


def product_get(product_id: str) -> dict:
    return run_eb_edu(["product", "get", product_id])


def product_create(
    title: str, price: float,
    description: str = "", cost: float = 0, inventory: int = 100
) -> dict:
    args = [
        "product", "create",
        "--title", title, "--price", str(price),
    ]
    if description:
        args += ["--description", description]
    if cost:
        args += ["--cost", str(cost)]
    if inventory:
        args += ["--inventory", str(inventory)]
    return run_eb_edu(args)


def product_update(product_id: str, **kwargs) -> dict:
    args = ["product", "update", product_id]
    for k, v in kwargs.items():
        args += [f"--{k}", str(v)]
    return run_eb_edu(args)


def product_delete(product_id: str) -> dict:
    return run_eb_edu(["product", "delete", product_id])


def order_list(status: str = "", extra: list[str] | None = None) -> dict:
    args = ["order", "list"]
    if status:
        args += ["--status", status]
    return run_eb_edu(args, extra)


def order_get(order_id: str) -> dict:
    return run_eb_edu(["order", "get", order_id])


def customer_list(extra: list[str] | None = None) -> dict:
    return run_eb_edu(["customer", "list"], extra)


def customer_get(customer_id: str) -> dict:
    return run_eb_edu(["customer", "get", customer_id])


def auth_login(username: str, password: str, school_id: str = "") -> dict:
    args = ["auth", "login", "--username", username, "--password", password]
    if school_id:
        args += ["--school-id", school_id]
    return run_eb_edu(args)


def auth_status() -> dict:
    return run_eb_edu(["auth", "status"])


def admin_health() -> dict:
    return run_eb_edu(["admin", "health"])


# ── 扩展命令 ──────────────────────────────────────────────────────────────────

def exam_list(page: int = 1, limit: int = 20) -> dict:
    return run_eb_edu(["exam", "list", "--page", str(page), "--limit", str(limit)])


def exam_create(title: str, description: str = "") -> dict:
    args = ["exam", "create", "--title", title]
    if description:
        args += ["--description", description]
    return run_eb_edu(args)


def project_list(class_id: str = "", page: int = 1) -> dict:
    args = ["project", "list", "--page", str(page)]
    if class_id:
        args += ["--class-id", class_id]
    return run_eb_edu(args)


def project_create(name: str, description: str = "", class_id: str = "") -> dict:
    args = ["project", "create", "--name", name]
    if description:
        args += ["--description", description]
    if class_id:
        args += ["--class-id", class_id]
    return run_eb_edu(args)


def project_get(project_id: str) -> dict:
    return run_eb_edu(["project", "get", project_id])


def project_grade(project_id: str, score: float) -> dict:
    return run_eb_edu(["project", "grade", "--project-id", project_id, "--score", str(score)])


def project_submit(project: str) -> dict:
    return run_eb_edu(["project", "submit", "--project", project])


def grade_list(class_id: str = "", page: int = 1) -> dict:
    args = ["grade", "list", "--page", str(page)]
    if class_id:
        args += ["--class-id", class_id]
    return run_eb_edu(args)


def grade_export(class_id: str = "") -> dict:
    args = ["grade", "export"]
    if class_id:
        args += ["--class-id", class_id]
    return run_eb_edu(args)


def notification_list(page: int = 1) -> dict:
    return run_eb_edu(["notification", "list", "--page", str(page)])


def notification_send(title: str, message: str, class_id: str = "") -> dict:
    args = ["notification", "send", "--title", title, "--message", message]
    if class_id:
        args += ["--class-id", class_id]
    return run_eb_edu(args)


def school_stats() -> dict:
    return run_eb_edu(["report", "school-stats"])


def medusa_inventory_check() -> dict:
    return run_eb_edu(["medusa", "inventory", "check"])


def medusa_inventory_adjust(item_id: str, delta: int) -> dict:
    return run_eb_edu(["medusa", "inventory", "adjust", "--item-id", item_id, "--delta", str(delta)])


def medusa_inventory_warning() -> dict:
    return run_eb_edu(["medusa", "inventory", "warning"])


def medusa_order_list(status: str = "") -> dict:
    args = ["medusa", "order", "list"]
    if status:
        args += ["--status", status]
    return run_eb_edu(args)


def medusa_order_get(order_id: str) -> dict:
    return run_eb_edu(["medusa", "order", "get", order_id])


def medusa_order_cancel(order_id: str) -> dict:
    return run_eb_edu(["medusa", "order", "cancel", "--order-id", order_id])


def medusa_order_refund(order_id: str) -> dict:
    return run_eb_edu(["medusa", "order", "refund", "--order-id", order_id])


def medusa_order_update_status(order_id: str, status: str) -> dict:
    return run_eb_edu(["medusa", "order", "update-status", "--order-id", order_id, "--status", status])


def medusa_order_fulfill(order_id: str) -> dict:
    return run_eb_edu(["medusa", "shipping", "fulfill", "--order-id", order_id])


def medusa_customer_create(
    email: str, first_name: str = "", last_name: str = "", phone: str = ""
) -> dict:
    args = ["medusa", "customer", "create", "--email", email]
    if first_name:
        args += ["--first-name", first_name]
    if last_name:
        args += ["--last-name", last_name]
    if phone:
        args += ["--phone", phone]
    return run_eb_edu(args)


def medusa_customer_get(customer_id: str) -> dict:
    return run_eb_edu(["medusa", "customer", "get", customer_id])


def medusa_customer_list() -> dict:
    return run_eb_edu(["medusa", "customer", "list"])


def medusa_customer_groups(action: str = "list") -> dict:
    return run_eb_edu(["medusa", "customer", "groups", "--action", action])


def medusa_discount_create(code: str, percentage: float) -> dict:
    return run_eb_edu(["medusa", "discount", "create", "--code", code, "--percentage", str(percentage)])


def medusa_shipping_providers(action: str = "list") -> dict:
    return run_eb_edu(["medusa", "shipping", "providers", "--action", action])


def medusa_shipping_templates(action: str = "list") -> dict:
    return run_eb_edu(["medusa", "shipping", "templates", "--action", action])


def medusa_payment_configure(action: str = "list") -> dict:
    return run_eb_edu(["medusa", "payment", "configure", "--action", action])


def medusa_sales_analytics() -> dict:
    return run_eb_edu(["medusa", "analytics", "sales"])


def class_join(class_code: str) -> dict:
    return run_eb_edu(["class", "join", "--class-code", class_code])


def student_import_batch(file_path: str) -> dict:
    return run_eb_edu(["student", "import-batch", "--file", file_path])
