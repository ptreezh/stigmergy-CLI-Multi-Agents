#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 商品上架（能力培养版）

特点：
- 不是直接执行，而是引导学生思考
- 培养市场分析、定价策略、卖点提炼能力
- AI 作为引导者，不是执行者

Usage:
    stigmergy skill call eb-edu-product-listing-training
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
from pathlib import Path


# 实训场景数据
TRAINING_SCENARIOS = {
    "dress": {
        "product": "夏季连衣裙",
        "cost": 80,
        "target_users": ["18-25 岁女性", "大学生", "职场新人"],
        "competitors": [
            {"title": "夏季新款连衣裙女", "price": 159, "sales": 3000, "features": ["新款", "百搭"]},
            {"title": "法式复古连衣裙", "price": 259, "sales": 1000, "features": ["法式", "复古"]},
            {"title": "简约气质连衣裙", "price": 189, "sales": 2000, "features": ["简约", "气质"]}
        ]
    },
    "headphones": {
        "product": "无线蓝牙耳机",
        "cost": 45,
        "target_users": ["学生", "上班族", "运动爱好者"],
        "competitors": [
            {"title": "无线蓝牙耳机 5.0", "price": 79, "sales": 5000, "features": ["蓝牙 5.0", "长续航"]},
            {"title": "运动蓝牙耳机 挂耳式", "price": 129, "sales": 3000, "features": ["运动", "防汗"]},
            {"title": "降噪蓝牙耳机", "price": 199, "sales": 1500, "features": ["主动降噪", "高品质"]}
        ]
    },
    "juicer": {
        "product": "便携式榨汁杯",
        "cost": 45,
        "target_users": ["上班族", "学生", "健身爱好者"],
        "competitors": [
            {"title": "便携式榨汁杯", "price": 79, "sales": 4000, "features": ["便携", "USB 充电"]},
            {"title": "迷你榨汁机", "price": 129, "sales": 2500, "features": ["大容量", "强劲动力"]},
            {"title": "无线榨汁杯", "price": 159, "sales": 1800, "features": ["无线", "安全"]}
        ]
    }
}


def print_step(step_title, content, questions=None):
    """打印实训步骤"""
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print(f"📋 {step_title}")
    cross_platform_print("=" * 60)
    cross_platform_print(content)
    
    if questions:
        cross_platform_print("\n❓ 请思考并回答：")
        for i, q in enumerate(questions, 1):
            cross_platform_print(f"   {i}. {q}")


def get_user_cross_platform_input(prompt):
    """获取用户输入"""
    try:
        return cross_platform_input(f"\n{prompt}\n> ").strip()
    except EOFError:
        return ""


def evaluate_pricing(answer, scenario):
    """评估定价策略"""
    cost = scenario["cost"]
    competitors = scenario["competitors"]
    
    # 分析学生答案
    try:
        price = float(answer)
        price_range = [c["price"] for c in competitors]
        min_price, max_price = min(price_range), max(price_range)
        
        feedback = []
        score = 0
        
        # 评估是否考虑成本
        if price > cost * 1.5:
            feedback.append("✓ 考虑了成本和利润空间")
            score += 30
        else:
            feedback.append("✗ 利润率过低，建议重新考虑")
        
        # 评估是否参考竞品
        if min_price <= price <= max_price:
            feedback.append("✓ 价格在竞品价格带内，合理")
            score += 40
        elif price < min_price:
            feedback.append("⚠ 价格低于所有竞品，可能影响品质感知")
            score += 20
        else:
            feedback.append("⚠ 价格高于所有竞品，需要有足够差异化")
            score += 25
        
        # 评估是否有策略
        if abs(price - min_price) < 10:
            feedback.append("✓ 采用低价策略，有价格优势")
            score += 30
        elif abs(price - max_price) < 10:
            feedback.append("✓ 采用高价策略，需要强调品质")
            score += 30
        else:
            feedback.append("✓ 采用中间策略，平衡性价比")
            score += 30
        
        return score, "\n".join(feedback)
    
    except ValueError:
        return 0, "✗ 请输入有效价格数字"


def evaluate_selling_points(answer, scenario):
    """评估卖点提炼"""
    competitors = scenario["competitors"]
    
    # 收集竞品已有卖点
    existing_features = set()
    for c in competitors:
        for f in c["features"]:
            existing_features.add(f)
    
    feedback = []
    score = 0
    
    # 简单评估
    if len(answer) > 10:
        feedback.append("✓ 卖点描述详细")
        score += 30
    else:
        feedback.append("✗ 卖点描述过于简单")
    
    # 检查差异化
    for feature in existing_features:
        if feature in answer:
            feedback.append(f"⚠ '{feature}'竞品已用，建议差异化")
            score += 10
        else:
            feedback.append(f"✓ 突出差异化卖点")
            score += 30
            break
    
    return min(score, 100), "\n".join(feedback)


def run_training(scenario_name):
    """运行实训"""
    scenario = TRAINING_SCENARIOS.get(scenario_name, TRAINING_SCENARIOS["dress"])
    
    cross_platform_print("\n")
    cross_platform_print("╔" + "═" * 58 + "╗")
    cross_platform_print("║" + " " * 15 + "电商 AI 实训平台 - 商品上架实训" + " " * 15 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # 阶段 1: 情境导入
    print_step(
        "阶段 1: 情境导入",
        f"""你是一家电商公司的运营专员，老板给你一个任务：

📦 产品：{scenario['product']}
💰 成本：{scenario['cost']}元
👥 目标用户：{', '.join(scenario['target_users'])}

请完成这款商品的上架方案，包括：定价、标题、卖点提炼。"""
    )
    get_user_cross_platform_input("准备好了吗？（按回车继续）")
    
    # 阶段 2: 市场分析
    competitors_info = "\n".join([
        f"   • 竞品{i}: 《{c['title']}》- {c['price']}元 - 月销{c['sales']}+ - 卖点：{', '.join(c['features'])}"
        for i, c in enumerate(scenario["competitors"], 1)
    ])
    
    print_step(
        "阶段 2: 市场分析",
        f"""请先分析竞品数据：

{competitors_info}

观察要点：
- 价格分布：{min(c['price'] for c in scenario['competitors'])}元 - {max(c['price'] for c in scenario['competitors'])}元
- 销量最高的竞品有什么特点？
- 竞品都在强调什么卖点？""",
        [
            "竞品的主要价格带是什么？",
            "销量最高的竞品，它的优势是什么？",
            "你发现什么市场机会？（差异化的可能性）"
        ]
    )
    analysis = get_user_cross_platform_input("请写下你的分析（简要）：")
    
    # 阶段 3: 定价决策
    print_step(
        "阶段 3: 定价决策",
        f"""基于竞品分析，现在请制定你的定价策略。

产品信息：
- 成本：{scenario['cost']}元
- 竞品价格带：{min(c['price'] for c in scenario['competitors'])}-{max(c['price'] for c in scenario['competitors'])}元

定价考虑因素：
- 成本 + 利润
- 竞品价格
- 目标用户购买力
- 差异化定位""",
        ["你的定价是多少？", "为什么定这个价格？（说明理由）"]
    )
    pricing_answer = get_user_cross_platform_input("请输入你的定价（元）：")
    pricing_score, pricing_feedback = evaluate_pricing(pricing_answer, scenario)
    
    cross_platform_print(f"\n📊 定价评估：{pricing_score}/100")
    cross_platform_print(pricing_feedback)
    get_user_cross_platform_input("（按回车继续）")
    
    # 阶段 4: 标题和卖点提炼
    print_step(
        "阶段 4: 标题和卖点提炼",
        f"""现在请撰写商品标题和提炼核心卖点。

好标题的特点：
- 包含热搜词
- 突出差异化卖点
- 吸引目标用户
- 长度适中（30 字以内）

卖点提炼原则：
- 差异化（竞品没有的）
- 痛点导向（解决用户问题）
- 可感知（用户能感受到价值）""",
        ["你的商品标题是什么？", "你的 3 个核心卖点是什么？"]
    )
    title = get_user_cross_platform_input("请输入商品标题：")
    selling_points = get_user_cross_platform_input("请输入 3 个核心卖点（用逗号分隔）：")
    sp_score, sp_feedback = evaluate_selling_points(selling_points, scenario)
    
    cross_platform_print(f"\n📊 卖点评估：{sp_score}/100")
    cross_platform_print(sp_feedback)
    get_user_cross_platform_input("（按回车继续）")
    
    # 阶段 5: 执行上架（真正调用 CLI）
    print_step(
        "阶段 5: 执行上架",
        f"""现在根据你的方案，执行商品上架。

你的方案：
- 标题：{title}
- 定价：{pricing_answer}元
- 卖点：{selling_points}

正在调用后台 CLI 执行上架...""",
        []
    )
    
    # 真正调用 CLI 执行上架
    cross_platform_print("\n⏳ 正在创建商品...")
    cross_platform_print("🔧 执行命令：stigmergy eb-edu medusa product create")
    
    cli_cmd = f'stigmergy eb-edu medusa product create --title "{title}" --price {pricing_answer}'
    
    try:
        result = subprocess.run(cli_cmd, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            try:
                product_data = json.loads(result.stdout)
                cross_platform_print(f"✅ 商品创建成功！")
                cross_platform_print(f"   商品 ID: {product_data.get('id', 'N/A')}")
                cross_platform_print(f"   标题：{title}")
                cross_platform_print(f"   价格：{pricing_answer}元")
            except:
                cross_platform_print(f"✅ 商品创建成功！")
                cross_platform_print(result.stdout)
        else:
            cross_platform_print(f"⚠️ 上架失败：{result.stderr}")
            cross_platform_print("但你的决策过程是正确的，继续复盘...")
    except Exception as e:
        cross_platform_print(f"⚠️ CLI 执行异常：{e}")
        cross_platform_print("模拟上架完成（后台服务可能未启动）")
    
    time.sleep(1)
    
    # 阶段 6: 复盘总结
    print_step(
        "阶段 6: 复盘总结",
        f"""实训完成！现在请反思：

你的决策：
- 定价：{pricing_answer}元（得分：{pricing_score}）
- 卖点：{selling_points}（得分：{sp_score}）

思考：
- 你的决策依据是什么？
- 哪些地方可以改进？
- 如果重新做一次，你会怎么做？

行业最佳实践参考：
- 定价：通常采用"成本×2+ 竞品参考"
- 标题：热搜词 + 核心卖点 + 产品词
- 卖点：突出 1-2 个差异化特点，不要贪多""",
        []
    )
    
    # 最终评分
    total_score = (pricing_score + sp_score) // 2
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print(f"🎓 实训完成！综合评分：{total_score}/100")
    
    if total_score >= 80:
        cross_platform_print("评级：优秀！你展现了良好的电商运营思维。")
    elif total_score >= 60:
        cross_platform_print("评级：良好！基本掌握，继续练习会更好。")
    else:
        cross_platform_print("评级：需要加强！建议重新学习定价和卖点提炼方法。")
    
    cross_platform_print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(description="商品上架实训（能力培养版）")
    parser.add_argument(
        "--scenario",
        type=str,
        default="dress",
        choices=["dress", "headphones", "juicer"],
        help="实训场景：dress（连衣裙）, headphones（耳机）, juicer（榨汁杯）"
    )
    
    args = parser.parse_args()
    run_training(args.scenario)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
