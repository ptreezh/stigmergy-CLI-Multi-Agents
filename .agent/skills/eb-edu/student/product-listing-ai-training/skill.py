#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 商品上架实训（LLM 智能引导版）

核心特点:
- 依赖 AI LLM 智能引导，不是硬编码问答
- LLM 分析学生回答，给出个性化反馈
- LLM 生成追问，引导学生深度思考
- LLM 评估决策过程，不是只看结果

Usage:
    stigmergy skill call eb-edu-product-listing-ai-training
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


# LLM 引导提示词模板
LLM_PROMPTS = {
    "market_analysis": """
你是一位资深电商运营导师，正在指导学生进行市场分析。

竞品数据:
{competitors_data}

学生分析:
{student_analysis}

请评估学生的分析:
1. 学生是否准确识别了价格带？
2. 学生是否发现了竞品的成功因素？
3. 学生是否找到了市场机会？

要求:
- 先肯定学生的正确发现
- 指出学生遗漏的关键点
- 提出 1-2 个追问，引导学生深入思考
- 语气鼓励性，不要直接给答案
""",

    "pricing_strategy": """
你是一位资深电商运营导师，正在指导学生制定定价策略。

产品信息:
- 产品：{product}
- 成本：{cost}元
- 竞品价格：{competitor_prices}

学生定价方案:
- 定价：{student_price}元
- 理由：{student_reason}

请评估学生的定价策略:
1. 定价是否合理（考虑成本、竞品、定位）？
2. 理由是否充分？
3. 学生考虑了哪些因素，遗漏了哪些？

要求:
- 先肯定合理部分
- 指出遗漏的考虑因素
- 提出 1 个追问，引导学生完善策略
- 不要直接告诉学生"正确价格"
""",

    "selling_points": """
你是一位资深电商营销专家，正在指导学生提炼卖点。

产品信息:
- 产品：{product}
- 目标用户：{target_users}

竞品卖点:
{competitor_features}

学生提炼的卖点:
{student_selling_points}

请评估:
1. 卖点是否差异化（与竞品对比）？
2. 卖点是否针对目标用户痛点？
3. 卖点是否具体可感知？

要求:
- 先肯定好的地方
- 指出可以改进的地方
- 给出 1 个具体改进建议
- 不要直接重写卖点
""",

    "final_review": """
你是一位资深电商运营导师，正在给学生实训做最终点评。

学生完整方案:
- 定价：{price}元
- 标题：{title}
- 卖点：{selling_points}

决策依据记录:
{decision_reasoning}

请给出最终点评:
1. 综合评分（0-100）
2. 方案亮点（2-3 点）
3. 改进建议（1-2 点）
4. 行业最佳实践对比

要求:
- 评分要有依据
- 建议要具体可执行
- 语气鼓励性
"""
}


def call_llm(prompt):
    """
    调用 AI LLM（通过 stigmergy 或直接调用 qwen/claude 等）
    
    这里可以配置使用任何 LLM:
    - stigmergy call qwen
    - stigmergy call claude
    - 直接调用 OpenAI API
    - 本地 LLM
    """
    
    # 方案 1: 调用 stigmergy qwen
    try:
        cmd = f'stigmergy qwen "{prompt}"'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            return result.stdout.strip()
    except:
        pass
    
    # 方案 2: 模拟 LLM 回复（离线模式）
    return simulate_llm_response(prompt)


def simulate_llm_response(prompt):
    """
    模拟 LLM 回复（当没有 AI CLI 时）
    实际部署时应该调用真实 LLM
    """
    
    # 简单关键词匹配，给出通用反馈
    if "定价" in prompt:
        return """
📊 导师点评:
你的定价策略考虑了成本和竞品，这是很好的开始。

但请思考:
1. 你的目标用户愿意为这个产品支付多少？
2. 你的定价与你的定位是否一致？（高端 vs 性价比）

建议：查看竞品的用户评价，了解用户愿意为什么买单。
"""
    elif "卖点" in prompt:
        return """
📊 导师点评:
你提炼的卖点清晰，但差异化不够明显。

建议:
1. 找出竞品没有强调的特点
2. 从用户痛点出发，而不是从产品功能出发

例如：不是"透气面料"，而是"夏天穿也不闷汗"
"""
    else:
        return """
📊 导师点评:
你的分析基本正确，继续深入思考。

建议:
1. 多看竞品的评价，了解用户真实需求
2. 找出市场空白点，差异化定位
"""


def get_student_cross_platform_input(prompt, allow_empty=False):
    """获取学生输入"""
    try:
        while True:
            answer = cross_platform_input(f"\n{prompt}\n> ").strip()
            if answer or allow_empty:
                return answer
            cross_platform_print("⚠️ 请输入你的想法（不能为空）")
    except EOFError:
        return ""


def run_ai_training(scenario_name):
    """运行 LLM 智能引导实训"""
    
    # 实训场景数据
    scenarios = {
        "dress": {
            "product": "夏季连衣裙",
            "cost": 80,
            "target_users": "18-25 岁女性，大学生，职场新人",
            "competitors": [
                {"title": "夏季新款连衣裙女", "price": 159, "sales": 3000, "features": ["新款", "百搭"]},
                {"title": "法式复古连衣裙", "price": 259, "sales": 1000, "features": ["法式", "复古"]},
                {"title": "简约气质连衣裙", "price": 189, "sales": 2000, "features": ["简约", "气质"]}
            ]
        },
        "headphones": {
            "product": "无线蓝牙耳机",
            "cost": 45,
            "target_users": "学生，上班族，运动爱好者",
            "competitors": [
                {"title": "无线蓝牙耳机 5.0", "price": 79, "sales": 5000, "features": ["蓝牙 5.0", "长续航"]},
                {"title": "运动蓝牙耳机 挂耳式", "price": 129, "sales": 3000, "features": ["运动", "防汗"]},
                {"title": "降噪蓝牙耳机", "price": 199, "sales": 1500, "features": ["主动降噪", "高品质"]}
            ]
        }
    }
    
    scenario = scenarios.get(scenario_name, scenarios["dress"])
    
    cross_platform_print("\n")
    cross_platform_print("╔" + "═" * 58 + "╗")
    cross_platform_print("║" + " " * 12 + "电商 AI 实训平台 - 商品上架实训 (LLM 智能引导)" + " " * 12 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 阶段 1: 情境导入 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 阶段 1: 情境导入")
    cross_platform_print("=" * 60)
    cross_platform_print(f"""
你是一家电商公司的运营专员，老板给你一个任务:

📦 产品：{scenario['product']}
💰 成本：{scenario['cost']}元
👥 目标用户：{scenario['target_users']}

今天，AI 导师会全程引导你完成上架方案。
""")
    get_student_cross_platform_input("准备好了吗？（按回车开始）")
    
    # ========== 阶段 2: 市场分析（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 阶段 2: 市场分析")
    cross_platform_print("=" * 60)
    
    competitors_data = "\n".join([
        f"   • 竞品{i}: 《{c['title']}》- {c['price']}元 - 月销{c['sales']}+ - 卖点：{', '.join(c['features'])}"
        for i, c in enumerate(scenario["competitors"], 1)
    ])
    
    cross_platform_print(f"""
请先查看竞品数据:

{competitors_data}

现在，请写下你的分析（至少 3 点）:
- 价格分布特点
- 竞品成功因素
- 市场机会点
""")
    
    student_analysis = get_student_cross_platform_input("你的分析:")
    
    # 🤖 调用 LLM 评估分析
    cross_platform_print("\n🤖 AI 导师正在分析你的回答...")
    llm_prompt = LLM_PROMPTS["market_analysis"].format(
        competitors_data=competitors_data,
        student_analysis=student_analysis
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    # 追问（可选）
    if "追问" in llm_feedback or "思考" in llm_feedback:
        follow_up = get_student_cross_platform_input("针对导师的追问，你的补充思考:")
    
    get_student_cross_platform_input("（按回车继续）")
    
    # ========== 阶段 3: 定价策略（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 阶段 3: 定价策略")
    cross_platform_print("=" * 60)
    
    competitor_prices = f"{min(c['price'] for c in scenario['competitors'])}-{max(c['price'] for c in scenario['competitors'])}元"
    
    cross_platform_print(f"""
基于市场分析，现在请制定你的定价策略。

产品信息:
- 成本：{scenario['cost']}元
- 竞品价格带：{competitor_prices}

请回答:
1. 你的定价是多少？
2. 为什么定这个价格？（说明理由）
""")
    
    student_price = get_student_cross_platform_input("你的定价（元）:")
    student_reason = get_student_cross_platform_input("定价理由:")
    
    # 🤖 调用 LLM 评估定价
    cross_platform_print("\n🤖 AI 导师正在分析你的定价策略...")
    llm_prompt = LLM_PROMPTS["pricing_strategy"].format(
        product=scenario['product'],
        cost=scenario['cost'],
        competitor_prices=competitor_prices,
        student_price=student_price,
        student_reason=student_reason
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_student_cross_platform_input("（按回车继续）")
    
    # ========== 阶段 4: 卖点提炼（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 阶段 4: 卖点提炼")
    cross_platform_print("=" * 60)
    
    competitor_features = "\n".join([f"- {c['title']}: {', '.join(c['features'])}" for c in scenario["competitors"]])
    
    cross_platform_print(f"""
现在请提炼商品标题和核心卖点。

竞品卖点分析:
{competitor_features}

好卖点的特点:
- 差异化（竞品没有的）
- 痛点导向（解决用户问题）
- 可感知（用户能感受到价值）

请回答:
1. 商品标题（30 字以内）
2. 3 个核心卖点（用逗号分隔）
""")
    
    title = get_student_cross_platform_input("商品标题:")
    selling_points = get_student_cross_platform_input("3 个核心卖点:")
    
    # 🤖 调用 LLM 评估卖点
    cross_platform_print("\n🤖 AI 导师正在分析你的卖点提炼...")
    llm_prompt = LLM_PROMPTS["selling_points"].format(
        product=scenario['product'],
        target_users=scenario['target_users'],
        competitor_features=competitor_features,
        student_selling_points=selling_points
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_student_cross_platform_input("（按回车继续）")
    
    # ========== 阶段 5: 执行上架（调用 CLI） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 阶段 5: 执行上架")
    cross_platform_print("=" * 60)
    
    cross_platform_print(f"""
根据你的方案，现在执行商品上架。

你的方案:
- 标题：{title}
- 定价：{student_price}元
- 卖点：{selling_points}
- 定价理由：{student_reason}
""")
    
    cross_platform_print("🔧 正在调用后台 CLI 执行上架...")
    cli_cmd = f'stigmergy eb-edu medusa product create --title "{title}" --price {student_price}'
    
    try:
        result = subprocess.run(cli_cmd, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            try:
                product_data = json.loads(result.stdout)
                cross_platform_print(f"\n✅ 商品创建成功！")
                cross_platform_print(f"   商品 ID: {product_data.get('id', 'N/A')}")
                cross_platform_print(f"   标题：{title}")
                cross_platform_print(f"   价格：{student_price}元")
            except:
                cross_platform_print(f"\n✅ 商品创建成功！")
        else:
            cross_platform_print(f"\n⚠️ 上架失败：{result.stderr}")
            cross_platform_print("但你的决策过程是正确的，继续复盘...")
    except Exception as e:
        cross_platform_print(f"\n⚠️ CLI 执行异常：{e}")
        cross_platform_print("模拟上架完成（后台服务可能未启动）")
    
    get_student_cross_platform_input("（按回车继续）")
    
    # ========== 阶段 6: 复盘总结（LLM 点评） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 阶段 6: 复盘总结")
    cross_platform_print("=" * 60)
    
    cross_platform_print("🤖 AI 导师正在生成最终点评...\n")
    
    llm_prompt = LLM_PROMPTS["final_review"].format(
        price=student_price,
        title=title,
        selling_points=selling_points,
        decision_reasoning=student_reason
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print(llm_feedback)
    
    # 最终评分（LLM 给出）
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("🎓 实训完成！")
    cross_platform_print("=" * 60)
    cross_platform_print("""
能力收获:
✓ 市场分析方法
✓ 定价策略思维
✓ 卖点提炼技巧
✓ 决策依据意识

建议:
- 回顾 AI 导师的反馈
- 思考如何改进
- 下次实训做得更好
""")


def main():
    parser = argparse.ArgumentParser(description="商品上架实训（LLM 智能引导版）")
    parser.add_argument(
        "--scenario",
        type=str,
        default="dress",
        choices=["dress", "headphones"],
        help="实训场景"
    )
    parser.add_argument(
        "--llm",
        type=str,
        default="qwen",
        choices=["qwen", "claude", "offline"],
        help="使用的 LLM"
    )
    
    args = parser.parse_args()
    run_ai_training(args.scenario)
    return 0


if __name__ == "__main__":
    sys.exit(main())
