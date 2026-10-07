#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 客户维护实训（引导式）

培养能力：
- 客户分类能力
- 维护方案能力
- 定期联系能力
- 复购率提升能力
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
    "customer_segmentation": """
你是一位电商客户管理导师，正在指导学生进行客户分类。

客户数据:
{customer_data}

学生分类:
{student_segmentation}

请评估:
1. 学生是否正确理解了客户分类标准？
2. 学生是否考虑了客户价值？
3. 学生是否考虑了客户行为？

要求:
- 先肯定学生的正确分类
- 指出遗漏的关键点
- 提出 1-2 个追问
""",

    "retention_plan": """
你是一位电商客户管理专家，正在指导学生制定客户维护方案。

客户类型:
{customer_type}

学生维护方案:
{student_plan}

请评估:
1. 维护方案是否合理？
2. 是否针对客户类型？
3. 是否可执行？

要求:
- 先肯定合理部分
- 指出可以改进的地方
- 给出具体建议
""",

    "review": """
你是一位电商客户管理专家，正在给学生客户维护实训做最终点评。

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


def run_customer_retention_training():
    """运行客户维护实训"""
    
    cross_platform_print("\n")
    cross_platform_print("╔" + "═" * 58 + "╗")
    cross_platform_print("║" + " " * 16 + "电商 AI 实训平台 - 客户维护实训（引导式）" + " " * 16 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 情境导入 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 情境导入")
    cross_platform_print("=" * 60)
    cross_platform_print("""
你是一家电商公司的客户关系专员，老板给你一个任务：

👥 客户数据（近 90 天）:
   - 客户 A: 消费 5 次，总额¥5000+，最近购买 7 天前
   - 客户 B: 消费 2 次，总额¥1000+，最近购买 30 天前
   - 客户 C: 消费 1 次，总额¥500+，最近购买 60 天前
   - 客户 D: 注册未购买，90 天前注册

请制定客户维护方案。

AI 导师会全程引导你完成实训。
""")
    get_cross_platform_input("准备好了吗？（按回车开始）")
    
    # ========== 环节 1: 客户分类（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 1: 客户分类")
    cross_platform_print("=" * 60)
    cross_platform_print("""
首先，我们需要对客户进行分类。

客户数据（近 90 天）:
- 客户 A: 消费 5 次，总额¥5000+，最近购买 7 天前
- 客户 B: 消费 2 次，总额¥1000+，最近购买 30 天前
- 客户 C: 消费 1 次，总额¥500+，最近购买 60 天前
- 客户 D: 注册未购买，90 天前注册

请分析:
1. 如何对这些客户进行分类？
2. 分类标准是什么？
3. 每类客户的特征是什么？
""")
    
    student_segmentation = get_cross_platform_input("你的分类:")
    
    # 🤖 LLM 评估分类
    cross_platform_print("\n🤖 AI 导师正在分析你的分类...")
    llm_prompt = LLM_PROMPTS["customer_segmentation"].format(
        customer_data="客户 A:5 次¥5000+，客户 B:2 次¥1000+，客户 C:1 次¥500+，客户 D:注册未购买",
        student_segmentation=student_segmentation
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 2: 维护方案制定（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 2: 维护方案制定")
    cross_platform_print("=" * 60)
    cross_platform_print("""
基于客户分类，现在请制定维护方案。

客户分类:
- VIP 客户（客户 A）：高价值、高活跃
- 普通客户（客户 B）：中价值、中活跃
- 沉睡客户（客户 C）：低价值、低活跃
- 潜在客户（客户 D）：未转化

请为每类客户制定维护方案:
1. VIP 客户如何维护？
2. 普通客户如何提升？
3. 沉睡客户如何激活？
4. 潜在客户如何转化？
""")
    
    student_plan = get_cross_platform_input("你的维护方案:")
    
    # 🤖 LLM 评估维护方案
    cross_platform_print("\n🤖 AI 导师正在分析你的维护方案...")
    llm_prompt = LLM_PROMPTS["retention_plan"].format(
        customer_type="VIP 客户、普通客户、沉睡客户、潜在客户",
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
客户分类：{student_segmentation}
维护方案：{student_plan}
"""
    
    llm_prompt = LLM_PROMPTS["review"].format(
        student_plan=student_plan_summary,
        decision_reasoning=f"客户分类：{student_segmentation}\n维护方案：{student_plan}",
        execution_result="维护方案制定完成"
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("🎓 客户维护实训完成！")
    cross_platform_print("=" * 60)
    cross_platform_print("""
能力收获:
✓ 客户分类能力
✓ 维护方案能力
✓ 定期联系能力
✓ 复购率提升能力

建议:
- 回顾 AI 导师的反馈
- 思考如何改进
- 继续学习其他实训任务

💡 进阶学习:
- [客户维护完整教程](./tutorials/customer-retention.md)
- [客户分类指南](./guides/customer-segmentation.md)
- [复购率提升最佳实践](./guides/repurchase-rate.md)
""")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="客户维护实训（引导式）")
    args = parser.parse_args()
    return run_customer_retention_training()


if __name__ == "__main__":
    sys.exit(main())
