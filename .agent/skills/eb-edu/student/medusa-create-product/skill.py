#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 在 Medusa 平台创建商品

Usage:
    python skill.py --title "夏季连衣裙" --price 199 [--sku SKU001] [--inventory 50]

直接调用 Medusa REST API（绕过 CLI subprocess 中文编码 bug）
"""

import json
import os
import sys
import argparse
import requests

MEDUSA_API_URL = os.environ.get("MEDUSA_API_URL", "http://localhost:9001")
MEDUSA_TOKEN_FILE = os.path.join(os.path.expanduser("~"), ".medusa", ".token")


def get_token():
    """从会话文件读取 token"""
    try:
        with open(MEDUSA_TOKEN_FILE, "r", encoding="utf-8") as f:
            return f.read().strip()
    except Exception:
        return None


def api_headers():
    """构建带认证的请求头"""
    token = get_token()
    if not token:
        return None
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }


def create_product(title, subtitle="", description="", tags=""):
    """Step 1: 创建商品基础信息"""
    headers = api_headers()
    if not headers:
        return None, "未登录，请先运行: medusa auth login -e admin@medusa-test.com -p medusa123"

    data = {"title": title}
    if subtitle:
        data["subtitle"] = subtitle
    if description:
        data["description"] = description
    if tags:
        data["tags"] = [{"value": t.strip()} for t in tags.split(",")]

    try:
        resp = requests.post(
            f"{MEDUSA_API_URL}/admin/products",
            json=data,
            headers=headers,
            timeout=30,
        )
        if resp.status_code == 401:
            return None, "认证失败，请重新登录: medusa auth login"
        if not resp.ok:
            return None, f"API错误 {resp.status_code}: {resp.text[:200]}"
        result = resp.json()
        product = result.get("product", {})
        return product.get("id"), None
    except requests.RequestException as e:
        return None, f"请求失败: {e}"


def add_variant(product_id, title, price, sku="", inventory=100, currency="CNY"):
    """Step 2: 添加商品变体（含价格）"""
    headers = api_headers()
    if not headers:
        return None, "未登录"

    import uuid
    # SKU 必填以避免 UNIQUE constraint 冲突
    variant_sku = sku or f"SKU-{uuid.uuid4().hex[:8].upper()}"
    data = {
        "title": title,
        "sku": variant_sku,
        "prices": [{"amount": int(price * 100), "currency_code": currency.lower()}],
        "inventory_quantity": inventory or 0,
    }

    try:
        resp = requests.post(
            f"{MEDUSA_API_URL}/admin/products/{product_id}/variants",
            json=data,
            headers=headers,
            timeout=30,
        )
        if not resp.ok:
            return None, f"变体添加失败: {resp.status_code} {resp.text[:200]}"
        return True, None
    except requests.RequestException as e:
        return None, f"请求失败: {e}"


def format_output(product_id, variant_ok, args):
    """格式化输出"""
    lines = []
    lines.append("✅ 商品创建成功")
    lines.append("")
    lines.append("### 商品信息")
    lines.append(f"- **商品ID**: {product_id}")
    lines.append(f"- **标题**: {args.title}")
    lines.append(f"- **价格**: ¥{args.price}")
    if args.sku:
        lines.append(f"- **SKU**: {args.sku}")
    if args.inventory:
        lines.append(f"- **库存**: {args.inventory}件")
    if variant_ok:
        lines.append(f"- **变体**: ✅ 已添加")
    else:
        lines.append(f"- **变体**: ❌ 添加失败（商品已创建）")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="在 Medusa 平台创建商品")
    parser.add_argument("--title", type=str, required=True, help="商品标题")
    parser.add_argument("--price", type=float, required=True, help="商品价格")
    parser.add_argument("--subtitle", type=str, default="", help="副标题")
    parser.add_argument("--description", type=str, default="", help="商品描述")
    parser.add_argument("--sku", type=str, default="", help="SKU编码")
    parser.add_argument("--inventory", type=int, default=100, help="库存数量")
    args = parser.parse_args()

    # Step 1: 创建商品
    product_id, err = create_product(args.title, args.subtitle, args.description)
    if not product_id:
        print(f"❌ 创建失败\n\n**错误**: {err}")
        return 1

    # Step 2: 添加变体（含价格）
    variant_ok, err2 = add_variant(product_id, args.title, args.price, args.sku, args.inventory)

    print(format_output(product_id, variant_ok, args))
    return 0


if __name__ == "__main__":
    sys.exit(main())
