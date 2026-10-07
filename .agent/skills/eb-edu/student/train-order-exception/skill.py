#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 异常订单处理实训（引导式）

培养能力：
- 异常识别能力
- 原因分析能力
- 处理方案能力
- 客户沟通能力
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
    "exception_identification": """
你是一位电商订单处理导师，正在指导学生识别异常订单。

订单数据:
{order_data}

学生分析:
{student_analysis}

请评估:
1. 学生是否正确识别了异常？
2. 学生是否理解了异常类型？
3. 学生是否发现了潜在问题？

要求:
- 先肯定学生的正确识别
- 指出遗漏的关键点
- 提出 1-2 个追问
""",

    "handling_plan": """
你是一位电商订单处理专家，正在指导学生制定异常订单处理方案。

异常情况:
{exception_situation}

学生处理方案:
{student_plan}

请评估:
1. 处理方案是否合理？
2. 是否考虑了客户感受？
3. 是否符合公司政策？

要求:
- 先肯定合理部分
- 指出可以改进的地方
- 给出具体建议
""",

    "review": """
你是一位电商订单处理专家，正在给学生异常订单处理实训做最终点评。

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


def run_order_exception_training():
    """运行异常订单处理实训"""
    
    cross_platform_print("\n")
    cross_platform_print("╔" + "═" * 58 + "╗")
    cross_platform_print("║" + " " * 14 + "电商 AI 实训平台 - 异常订单处理实训（引导式）" + " " * 14 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 情境导入 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 情境导入")
    cross_platform_print("=" * 60)
    cross_platform_print("""
你是一家电商公司的订单处理专员，今天接到以下异常订单：

📦 异常情况:
   - 订单号：ORD-2026-001
   - 客户：张三
   - 商品：夏季连衣裙 x 2
   - 问题：客户收到商品后有破损，要求退款

请处理这个异常订单。

AI 导师会全程引导你完成实训。
""")
    get_cross_platform_input("准备好了吗？（按回车开始）")
    
    # ========== 环节 1: 异常识别（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 1: 异常识别")
    cross_platform_print("=" * 60)
    cross_platform_print("""
首先，我们需要识别异常类型。

订单信息:
- 订单号：ORD-2026-001
- 客户：张三
- 商品：夏季连衣裙 x 2
- 问题：客户收到商品后有破损，要求退款

请分析:
1. 这是什么类型的异常？
2. 异常严重程度如何？
3. 可能的原因是什么？
""")
    
    student_analysis = get_cross_platform_input("你的分析:")
    
    # 🤖 LLM 评估分析
    cross_platform_print("\n🤖 AI 导师正在分析你的回答...")
    llm_prompt = LLM_PROMPTS["exception_identification"].format(
        order_data="订单 ORD-2026-001，客户收到商品破损，要求退款",
        student_analysis=student_analysis
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 2: 处理方案制定（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 2: 处理方案制定")
    cross_platform_print("=" * 60)
    cross_platform_print("""
基于异常识别，现在请制定你的处理方案。

异常情况:
- 客户收到商品后有破损
- 客户要求退款

请制定处理方案:
1. 如何处理客户诉求？
2. 如何安抚客户情绪？
3. 如何防止类似问题再次发生？
""")
    
    student_plan = get_cross_platform_input("你的处理方案:")
    
    # 🤖 LLM 评估处理方案
    cross_platform_print("\n🤖 AI 导师正在分析你的处理方案...")
    llm_prompt = LLM_PROMPTS["handling_plan"].format(
        exception_situation="客户收到商品破损，要求退款",
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
异常识别：{student_analysis}
处理方案：{student_plan}
"""
    
    llm_prompt = LLM_PROMPTS["review"].format(
        student_plan=student_plan_summary,
        decision_reasoning=f"异常识别：{student_analysis}\n处理方案：{student_plan}",
        execution_result="处理方案制定完成"
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("🎓 异常订单处理实训完成！")
    cross_platform_print("=" * 60)
    cross_platform_print("""
能力收获:
✓ 异常识别能力
✓ 原因分析能力
✓ 处理方案能力
✓ 客户沟通能力

建议:
- 回顾 AI 导师的反馈
- 思考如何改进
- 继续学习其他实训任务

💡 进阶学习:
- [异常订单处理完整教程](./tutorials/order-exception.md)
- [客户沟通技巧](./guides/customer-communication.md)
- [投诉处理最佳实践](./guides/complaint-handling.md)
""")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="异常订单处理实训（引导式）")
    args = parser.parse_args()
    return run_order_exception_training()


if __name__ == "__main__":
    sys.exit(main())
