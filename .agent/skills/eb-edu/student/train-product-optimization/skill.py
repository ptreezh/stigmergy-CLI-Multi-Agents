#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 商品优化实训（引导式）

培养能力：
- 数据分析能力
- 问题发现能力
- 优化方案能力
- 效果评估能力
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
    "data_analysis": """
你是一位电商商品优化导师，正在指导学生进行商品数据分析。

商品数据:
{product_data}

学生分析:
{student_analysis}

请评估:
1. 学生是否正确分析了数据？
2. 学生是否发现了关键问题？
3. 学生是否理解了数据背后的原因？

要求:
- 先肯定学生的正确分析
- 指出遗漏的关键点
- 提出 1-2 个追问
""",

    "optimization_plan": """
你是一位电商商品优化专家，正在指导学生制定优化方案。

问题诊断:
{problem_diagnosis}

学生优化方案:
{student_plan}

请评估:
1. 优化方案是否合理？
2. 是否针对发现的问题？
3. 是否可执行？

要求:
- 先肯定合理部分
- 指出可以改进的地方
- 给出具体建议
""",

    "review": """
你是一位电商商品优化专家，正在给学生商品优化实训做最终点评。

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


def run_product_optimization_training():
    """运行商品优化实训"""
    
    cross_platform_print("\n")
    cross_platform_print("╔" + "═" * 58 + "╗")
    cross_platform_print("║" + " " * 14 + "电商 AI 实训平台 - 商品优化实训（引导式）" + " " * 14 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 情境导入 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 情境导入")
    cross_platform_print("=" * 60)
    cross_platform_print("""
你是一家电商公司的商品运营专员，老板给你一个任务：

📦 产品：夏季连衣裙
📊 销售数据:
   - 上架时间：30 天
   - 总销量：50 件
   - 转化率：1.5%
   - 点击率：2.0%

📊 行业平均:
   - 转化率：3.0%
   - 点击率：3.5%

请分析数据并制定优化方案。

AI 导师会全程引导你完成实训。
""")
    get_cross_platform_input("准备好了吗？（按回车开始）")
    
    # ========== 环节 1: 数据分析（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 1: 数据分析")
    cross_platform_print("=" * 60)
    cross_platform_print("""
首先，我们需要分析商品数据。

销售数据:
- 上架时间：30 天
- 总销量：50 件
- 转化率：1.5%
- 点击率：2.0%

行业平均:
- 转化率：3.0%
- 点击率：3.5%

请分析:
1. 商品表现如何？
2. 存在什么问题？
3. 可能的原因是什么？
""")
    
    student_analysis = get_cross_platform_input("你的分析:")
    
    # 🤖 LLM 评估分析
    cross_platform_print("\n🤖 AI 导师正在分析你的回答...")
    llm_prompt = LLM_PROMPTS["data_analysis"].format(
        product_data="上架 30 天，销量 50 件，转化率 1.5%，点击率 2.0%",
        student_analysis=student_analysis
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 2: 优化方案制定（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 2: 优化方案制定")
    cross_platform_print("=" * 60)
    cross_platform_print("""
基于数据分析，现在请制定你的优化方案。

问题诊断:
- 转化率低于行业平均（1.5% vs 3.0%）
- 点击率低于行业平均（2.0% vs 3.5%）

请制定优化方案:
1. 如何提升点击率？
2. 如何提升转化率？
3. 具体优化措施是什么？
""")
    
    student_plan = get_cross_platform_input("你的优化方案:")
    
    # 🤖 LLM 评估优化方案
    cross_platform_print("\n🤖 AI 导师正在分析你的优化方案...")
    llm_prompt = LLM_PROMPTS["optimization_plan"].format(
        problem_diagnosis="转化率 1.5% vs 3.0%，点击率 2.0% vs 3.5%",
        student_plan=student_plan
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 3: 复盘总结（LLM 点评） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 3: 复盘总结")
    cross_platform_print("=" * 60)
    
    cross_platform_print("🤖 AI 导师正在生成最终点评...")
    
    student_plan_summary = f"""
数据分析：{student_analysis}
优化方案：{student_plan}
"""
    
    llm_prompt = LLM_PROMPTS["review"].format(
        student_plan=student_plan_summary,
        decision_reasoning=f"数据分析：{student_analysis}\n优化方案：{student_plan}",
        execution_result="优化方案制定完成"
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("🎓 商品优化实训完成！")
    cross_platform_print("=" * 60)
    cross_platform_print("""
能力收获:
✓ 数据分析能力
✓ 问题发现能力
✓ 优化方案能力
✓ 效果评估能力

建议:
- 回顾 AI 导师的反馈
- 思考如何改进
- 继续学习其他实训任务

💡 进阶学习:
- [商品优化完整教程](./tutorials/product-optimization.md)
- [数据分析指南](./guides/data-analysis.md)
- [转化率优化最佳实践](./guides/cro.md)
""")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="商品优化实训（引导式）")
    args = parser.parse_args()
    return run_product_optimization_training()


if __name__ == "__main__":
    sys.exit(main())
