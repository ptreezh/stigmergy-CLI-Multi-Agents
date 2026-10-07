#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 竞品分析实训（能力培养版）

特点：
- 提供真实竞品数据
- 引导学生分析市场机会
- 培养数据解读和洞察能力

Usage:
    stigmergy skill call eb-edu-competitor-analysis-training
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
import argparse
import time


# 竞品分析数据（模拟真实数据）
ANALYSIS_DATA = {
    "wireless_mouse": {
        "category": "无线鼠标",
        "total_products": 156,
        "avg_price": 89,
        "price_ranges": [
            {"range": "0-50 元", "count": 45, "avg_sales": 800},
            {"range": "50-100 元", "count": 68, "avg_sales": 1500},
            {"range": "100-200 元", "count": 32, "avg_sales": 600},
            {"range": "200 元以上", "count": 11, "avg_sales": 200}
        ],
        "top_sellers": [
            {"name": "罗技 M170", "price": 79, "monthly_sales": 8000, "features": ["品牌", "耐用", "性价比高"]},
            {"name": "雷蛇毒蝰", "price": 199, "monthly_sales": 5000, "features": ["游戏", "RGB", "轻量化"]},
            {"name": "小米鼠标", "price": 49, "monthly_sales": 6000, "features": ["便宜", "简约", "USB-C"]}
        ],
        "trending_features": ["静音", "可充电", "多设备切换", "人体工学"]
    },
    "phone_case": {
        "category": "手机壳",
        "total_products": 520,
        "avg_price": 39,
        "price_ranges": [
            {"range": "0-30 元", "count": 280, "avg_sales": 2000},
            {"range": "30-60 元", "count": 180, "avg_sales": 1200},
            {"range": "60-100 元", "count": 50, "avg_sales": 400},
            {"range": "100 元以上", "count": 10, "avg_sales": 100}
        ],
        "top_sellers": [
            {"name": "透明硅胶壳", "price": 19, "monthly_sales": 15000, "features": ["便宜", "透明", "防摔"]},
            {"name": "磁吸 MagSafe", "price": 59, "monthly_sales": 8000, "features": ["磁吸", "方便", "苹果官方"]},
            {"name": "皮质奢华壳", "price": 199, "monthly_sales": 500, "features": ["真皮", "奢华", "商务"]}
        ],
        "trending_features": ["MagSafe", "防摔", "可站立", "卡包一体"]
    }
}


def print_header(title):
    cross_platform_print("\n" + "╔" + "═" * 58 + "╗")
    cross_platform_print("║" + title.center(58) + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")


def print_section(title, content):
    cross_platform_print(f"\n📊 {title}")
    cross_platform_print("-" * 40)
    cross_platform_print(content)


def get_cross_platform_input(prompt):
    try:
        return cross_platform_input(f"\n❓ {prompt}\n> ").strip()
    except EOFError:
        return ""


def evaluate_analysis(student_answer, correct_points):
    """评估学生分析"""
    score = 0
    feedback = []
    
    for point in correct_points:
        if point.lower() in student_answer.lower():
            score += 25
            feedback.append(f"✓ 发现了：{point}")
        else:
            feedback.append(f"✗ 未发现：{point}")
    
    return min(score, 100), "\n".join(feedback)


def run_analysis_training(category):
    """运行竞品分析实训"""
    data = ANALYSIS_DATA.get(category, ANALYSIS_DATA["wireless_mouse"])
    
    print_header("电商 AI 实训平台 - 竞品分析实训")
    
    # 阶段 1: 数据呈现
    print_section("阶段 1: 查看数据", f"""
你接到任务：为公司新品制定上市策略

品类：{data['category']}
市场总产品数：{data['total_products']}款
平均价格：{data['avg_price']}元

价格带分布:
""")
    
    for pr in data["price_ranges"]:
        cross_platform_print(f"   {pr['range']}: {pr['count']}款产品，平均销量{pr['avg_sales']}件/月")
    
    print_section("阶段 2: 头部竞品分析", """
销量前 3 的竞品:""")
    
    for i, seller in enumerate(data["top_sellers"], 1):
        cross_platform_print(f"\n   {i}. {seller['name']}")
        cross_platform_print(f"      价格：{seller['price']}元")
        cross_platform_print(f"      月销：{seller['monthly_sales']}件")
        cross_platform_print(f"      卖点：{', '.join(seller['features'])}")
    
    print_section("阶段 3: 流行趋势", f"""
当前上升趋势的卖点：
{', '.join(data['trending_features'])}
""")
    
    # 分析问题
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📝 分析问题")
    cross_platform_print("=" * 60)
    
    questions = [
        "1. 哪个价格带竞争最激烈？哪个价格带有机会？",
        "2. 销量最高的竞品，它的成功因素是什么？",
        "3. 你发现什么市场机会？（差异化切入点）",
        "4. 如果公司要进入这个市场，你建议什么策略？"
    ]
    
    for q in questions:
        cross_platform_print(f"\n{q}")
        answer = get_cross_platform_input("请回答：")
        
        # 简单评估
        if len(answer) > 10:
            cross_platform_print("✓ 回答详细，继续思考...")
        else:
            cross_platform_print("⚠ 回答较简单，请深入思考")
    
    # 总结
    print_section("实训总结", """
竞品分析的核心要点：

1. 价格带分析
   - 找出竞争最激烈的价格带（避开红海）
   - 找出有机会的价格带（蓝海市场）

2. 头部竞品分析
   - 分析成功因素（价格？功能？品牌？）
   - 找出可借鉴点

3. 趋势分析
   - 关注上升卖点
   - 抓住市场机会

4. 策略建议
   - 差异化定位
   - 价格策略
   - 卖点策略

课后作业：
- 选择一个你感兴趣的品类
- 用今天学到的方法分析竞品
- 写一份 300 字的分析报告
""")
    
    print_header("实训完成！")


def main():
    parser = argparse.ArgumentParser(description="竞品分析实训")
    parser.add_argument(
        "--category",
        type=str,
        default="wireless_mouse",
        choices=["wireless_mouse", "phone_case"],
        help="分析品类"
    )
    
    args = parser.parse_args()
    run_analysis_training(args.category)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
