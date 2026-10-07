#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 成绩分析（LLM 智能引导版）

培养能力：
- 数据分析能力
- 自我反思能力
- 问题诊断能力
- 改进计划制定能力
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
    "analyze_grades": """
你是一位学习数据分析专家，正在指导学生分析自己的成绩。

学生成绩数据:
{grades_data}

学生初步分析:
{student_analysis}

请评估:
1. 学生是否准确识别了优势科目？
2. 学生是否发现了薄弱环节？
3. 学生的分析深度如何？

要求:
- 先肯定学生的正确分析
- 指出可以深入分析的方向
- 提出 1-2 个追问，引导学生深入思考
""",

    "diagnose_problems": """
你是一位学习问题诊断专家，正在指导学生诊断学习问题。

成绩数据:
{grades_data}

学生诊断:
{student_diagnosis}

请评估:
1. 学生诊断的问题是否准确？
2. 学生是否找到了根本原因？
3. 还有那些潜在问题？

要求:
- 先肯定学生的诊断
- 指出可能的根本原因
- 引导学生深入思考
""",

    "improvement_plan": """
你是一位学习计划指导专家，正在指导学生制定改进计划。

学生问题诊断:
{student_diagnosis}

学生改进计划:
{student_plan}

请评估:
1. 计划是否针对性强？
2. 计划是否可执行？
3. 是否有明确的时间节点？

要求:
- 先肯定计划好的地方
- 指出可以改进的地方
- 给出 1 个具体建议
""",

    "review": """
你是一位学习数据分析专家，正在给学生实训做最终点评。

学生完整分析报告:
{student_report}

分析过程记录:
{analysis_process}

请给出最终点评:
1. 综合评分（0-100）
2. 分析亮点（2-3 点）
3. 改进建议（1-2 点）
4. 鼓励话语

要求:
- 评分要有依据
- 建议要具体可执行
- 语气鼓励性
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
    return "📊 导师点评：你的分析基本到位，建议继续深入。"


def get_cross_platform_input(prompt, allow_empty=False):
    """获取学生输入"""
    try:
        while True:
            answer = cross_platform_input(f"\n{prompt}\n> ").strip()
            if answer or allow_empty:
                return answer
            cross_platform_print("⚠️ 请输入内容")
    except EOFError:
        return ""


def run_guided_training():
    """运行 LLM 智能引导实训"""
    
    cross_platform_print("\n")
    cross_platform_print("╔" + "═" * 58 + "╗")
    cross_platform_print("║" + " " * 14 + "电商 AI 实训平台 - 成绩分析（LLM 智能引导）" + " " * 14 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 情境导入 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 情境导入")
    cross_platform_print("=" * 60)
    cross_platform_print("""
你完成了本学期的所有实训任务，现在需要分析自己的学习成绩。

你的成绩数据:
┌────────────────────────┬───────┬─────────┐
│ 实训项目               │ 分数  │ 班级平均│
├────────────────────────┼───────┼─────────┤
│ 商品上架实训           │ 87    │ 82      │
│ 竞品分析实训           │ 78    │ 80      │
│ 订单处理实训           │ 92    │ 85      │
│ 营销策划实训           │ 85    │ 83      │
│ 客服沟通实训           │ 80    │ 81      │
└────────────────────────┴───────┴─────────┘

请分析你的学习成绩。
""")
    get_cross_platform_input("准备好了吗？（按回车开始）")
    
    # ========== 环节 1: 成绩数据分析（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 1: 成绩数据分析")
    cross_platform_print("=" * 60)
    cross_platform_print("""
请分析你的成绩数据，回答:
1. 你的优势科目是什么？（高于班级平均 5 分以上）
2. 你的薄弱环节是什么？（低于班级平均）
3. 总体表现如何？
""")
    
    student_analysis = get_cross_platform_input("你的分析:")
    
    # 🤖 LLM 评估分析
    cross_platform_print("\n🤖 AI 导师正在分析你的回答...")
    llm_prompt = LLM_PROMPTS["analyze_grades"].format(
        grades_data="商品上架 87，竞品分析 78，订单处理 92，营销策划 85，客服沟通 80",
        student_analysis=student_analysis
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 2: 问题诊断（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 2: 问题诊断")
    cross_platform_print("=" * 60)
    cross_platform_print("""
基于成绩分析，请诊断你的学习问题:
1. 薄弱环节的根本原因是什么？
2. 是知识掌握问题，还是技能应用问题？
3. 是态度问题，还是方法问题？
""")
    
    student_diagnosis = get_cross_platform_input("你的问题诊断:")
    
    # 🤖 LLM 评估诊断
    cross_platform_print("\n🤖 AI 导师正在分析你的问题诊断...")
    llm_prompt = LLM_PROMPTS["diagnose_problems"].format(
        grades_data="商品上架 87，竞品分析 78，订单处理 92，营销策划 85，客服沟通 80",
        student_diagnosis=student_diagnosis
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 3: 改进计划（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 3: 改进计划")
    cross_platform_print("=" * 60)
    cross_platform_print("""
基于问题诊断，请制定改进计划:
1. 针对薄弱环节，你计划如何改进？
2. 具体的行动步骤是什么？
3. 时间节点是什么？
""")
    
    student_plan = get_cross_platform_input("你的改进计划:")
    
    # 🤖 LLM 评估计划
    cross_platform_print("\n🤖 AI 导师正在分析你的改进计划...")
    llm_prompt = LLM_PROMPTS["improvement_plan"].format(
        student_diagnosis=student_diagnosis,
        student_plan=student_plan
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 4: 复盘总结 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 4: 复盘总结")
    cross_platform_print("=" * 60)
    cross_platform_print("""
🎓 成绩分析完成！

能力收获:
✓ 数据分析能力
✓ 问题诊断能力
✓ 改进计划制定能力
✓ 自我反思能力

建议:
- 按照改进计划执行
- 定期检查进度
- 根据效果调整计划

💡 进阶学习:
- 学习使用数据可视化
- 掌握更多分析方法
- 建立个人学习档案
""")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="成绩分析（LLM 智能引导版）")
    args = parser.parse_args()
    return run_guided_training()


if __name__ == "__main__":
    sys.exit(main())
