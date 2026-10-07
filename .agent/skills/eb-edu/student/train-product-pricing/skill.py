#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 定价策略实训（引导式）

培养能力：
- 成本分析能力
- 竞品调研能力
- 定价策略能力
- 价格调整能力
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


LLM_PROMPTS = {
    "cost_analysis": """
你是一位电商定价策略导师，正在指导学生进行成本分析。

产品信息:
- 采购成本：{procurement_cost}元
- 运营成本：{operating_cost}元
- 物流成本：{shipping_cost}元

学生分析:
{student_analysis}

请评估:
1. 学生是否正确计算了总成本？
2. 学生是否考虑了所有成本项？
3. 学生是否理解了成本结构？

要求:
- 先肯定学生的正确分析
- 指出遗漏的成本项
- 提出 1-2 个追问
""",

    "pricing_strategy": """
你是一位电商定价策略专家，正在指导学生制定定价策略。

成本数据:
- 总成本：{total_cost}元

竞品数据:
- 竞品 A: {competitor_a}元
- 竞品 B: {competitor_b}元
- 竞品 C: {competitor_c}元

学生定价方案:
- 价格：{student_price}元
- 策略：{student_strategy}
- 理由：{student_reason}

请评估:
1. 定价是否合理（考虑成本、竞品、定位）？
2. 策略是否合适？
3. 理由是否充分？

要求:
- 先肯定合理部分
- 指出遗漏的考虑因素
- 提出 1 个追问
""",

    "review": """
你是一位电商定价策略专家，正在给学生定价策略实训做最终点评。

学生完整方案:
{student_plan}

决策过程记录:
{decision_reasoning}

执行结果:
{execution_result}

请给出最终点评:
1. 综合评分（0-100）
2. 方案亮点（2-3 点）
3. 改进建议（1-2 点）
4. 行业最佳实践对比
"""
}


def call_llm(prompt):
    """调用 AI LLM"""
    try:
        cmd = f'stigmergy qwen "{prompt}"'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            return result.stdout.strip()
    except:
        pass
    return "📊 导师点评：你的方案基本合理，建议继续完善。"


def get_cross_platform_input(prompt, allow_empty=False):
    """获取学生输入"""
    try:
        while True:
            answer = cross_platform_input(f"\n{prompt}\n> ").strip()
            if answer or allow_empty:
                return answer
    except EOFError:
        return ""


def run_pricing_strategy_training():
    """运行定价策略实训"""
    
    cross_platform_print("\n")
    cross_platform_print("╔" + "═" * 58 + "╗")
    cross_platform_print("║" + " " * 14 + "电商 AI 实训平台 - 定价策略实训（引导式）" + " " * 14 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 情境导入 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 情境导入")
    cross_platform_print("=" * 60)
    cross_platform_print("""
你是一家电商公司的商品运营专员，老板给你一个任务：

📦 产品：夏季连衣裙
💰 成本数据:
   - 采购成本：80 元
   - 运营成本：20 元
   - 物流成本：15 元

📊 竞品数据:
   - 竞品 A: 159 元（月销 3000+）
   - 竞品 B: 259 元（月销 1000+）
   - 竞品 C: 189 元（月销 2000+）

请制定合理的定价策略。

AI 导师会全程引导你完成实训。
""")
    get_cross_platform_input("准备好了吗？（按回车开始）")
    
    # ========== 环节 1: 成本分析（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 1: 成本分析")
    cross_platform_print("=" * 60)
    cross_platform_print("""
首先，我们需要分析产品成本。

成本数据:
- 采购成本：80 元
- 运营成本：20 元
- 物流成本：15 元

请分析:
1. 总成本是多少？
2. 各项成本占比如何？
3. 保本价格是多少？
""")
    
    student_analysis = get_cross_platform_input("你的分析:")
    
    # 🤖 LLM 评估分析
    cross_platform_print("\n🤖 AI 导师正在分析你的回答...")
    llm_prompt = LLM_PROMPTS["cost_analysis"].format(
        procurement_cost=80,
        operating_cost=20,
        shipping_cost=15,
        student_analysis=student_analysis
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 2: 定价策略制定（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 2: 定价策略制定")
    cross_platform_print("=" * 60)
    cross_platform_print("""
基于成本分析，现在请制定你的定价策略。

成本数据:
- 总成本：115 元

竞品数据:
- 竞品 A: 159 元（月销 3000+）
- 竞品 B: 259 元（月销 1000+）
- 竞品 C: 189 元（月销 2000+）

请回答:
1. 你的定价是多少？
2. 你采用什么定价策略？（成本加成/竞争定价/价值定价）
3. 为什么定这个价格？（说明理由）
""")
    
    student_price = get_cross_platform_input("你的定价（元）:")
    student_strategy = get_cross_platform_input("定价策略（成本加成/竞争定价/价值定价）:")
    student_reason = get_cross_platform_input("定价理由:")
    
    # 🤖 LLM 评估定价策略
    cross_platform_print("\n🤖 AI 导师正在分析你的定价策略...")
    llm_prompt = LLM_PROMPTS["pricing_strategy"].format(
        total_cost=115,
        competitor_a="159",
        competitor_b="259",
        competitor_c="189",
        student_price=student_price,
        student_strategy=student_strategy,
        student_reason=student_reason
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 3: 复盘总结（LLM 点评） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 3: 复盘总结")
    cross_platform_print("=" * 60)
    
    cross_platform_print("🤖 AI 导师正在生成最终点评...")
    
    student_plan = f"""
成本分析：{student_analysis}
定价：{student_price}元
策略：{student_strategy}
理由：{student_reason}
"""
    
    llm_prompt = LLM_PROMPTS["review"].format(
        student_plan=student_plan,
        decision_reasoning=f"成本分析：{student_analysis}\n定价策略：{student_strategy}\n理由：{student_reason}",
        execution_result="定价策略制定完成"
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("🎓 定价策略实训完成！")
    cross_platform_print("=" * 60)
    cross_platform_print("""
能力收获:
✓ 成本分析能力
✓ 竞品调研能力
✓ 定价策略能力
✓ 价格调整能力

建议:
- 回顾 AI 导师的反馈
- 思考如何改进
- 继续学习其他实训任务

💡 进阶学习:
- [商品定价完整教程](./tutorials/product-pricing.md)
- [成本分析指南](./guides/cost-analysis.md)
- [竞争定价最佳实践](./guides/competitive-pricing.md)
""")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="定价策略实训（引导式）")
    args = parser.parse_args()
    return run_pricing_strategy_training()


if __name__ == "__main__":
    sys.exit(main())
