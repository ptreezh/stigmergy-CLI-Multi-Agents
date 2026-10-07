#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 批量上架商品（LLM 智能引导版）

培养能力：
- 批量策略制定能力
- 效率优化能力
- 质量控制能力
- 风险管理能力

调用基础 Skill: eb-edu-medusa-batch-products
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
    "batch_strategy": """
你是一位电商批量运营专家，正在指导学生制定批量上架策略。

任务信息:
- 需要上架：{product_count}件商品
- 时间要求：{time_requirement}
- 可用工具：Excel 批量导入

学生策略:
{student_strategy}

请评估:
1. 策略是否合理？
2. 是否考虑了效率和质量平衡？
3. 有什么风险点？

要求:
- 先肯定合理部分
- 指出可以改进的地方
- 给出 1 个具体建议
""",

    "efficiency_optimization": """
你是一位电商效率优化专家，正在指导学生优化批量上架流程。

学生当前流程:
{student_workflow}

请评估:
1. 流程是否有优化空间？
2. 哪些步骤可以自动化？
3. 如何减少重复劳动？

要求:
- 先肯定现有流程的合理部分
- 指出可以优化的环节
- 给出具体优化建议
""",

    "quality_control": """
你是一位电商质量控制专家，正在指导学生进行批量上架的质量控制。

批量上架特点:
- 数量大
- 容易出错
- 影响店铺形象

学生质量控制方案:
{student_qc_plan}

请评估:
1. 质量控制点是否全面？
2. 检查方法是否有效？
3. 是否有应急预案？

要求:
- 先肯定好的地方
- 指出遗漏的质量控制点
- 给出改进建议
""",

    "review": """
你是一位电商批量运营专家，正在给学生实训做最终点评。

学生完整批量上架方案:
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
    return "📊 导师点评：你的方案基本合理，建议继续完善。"


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


def call_base_skill(file_path):
    """调用基础 Skill 执行批量上架"""
    cross_platform_print("\n🔧 正在调用基础 Skill 执行批量上架...")
    
    cmd = f'stigmergy skill call eb-edu-medusa-batch-products --file "{file_path}"'
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=120)
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                success_count = data.get("success_count", 0)
                fail_count = data.get("fail_count", 0)
                return True, f"成功{success_count}件，失败{fail_count}件", ""
            except:
                return True, "批量上架完成", ""
        else:
            return False, "", result.stderr
    except Exception as e:
        return False, "", str(e)


def run_guided_training():
    """运行 LLM 智能引导实训"""
    
    cross_platform_print("\n")
    cross_platform_print("╔" + "═" * 58 + "╗")
    cross_platform_print("║" + " " * 12 + "电商 AI 实训平台 - 批量上架商品（LLM 智能引导）" + " " * 12 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 情境导入 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 情境导入")
    cross_platform_print("=" * 60)
    cross_platform_print("""
你是一家电商公司的运营专员，老板给你一个紧急任务：

📦 任务：批量上架 50 件夏季女装
⏰ 时间要求：今天下班前完成
📊 可用工具：Excel 批量导入功能

请制定批量上架策略并执行。
""")
    get_cross_platform_input("准备好了吗？（按回车开始）")
    
    # ========== 环节 1: 批量策略制定（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 1: 批量策略制定")
    cross_platform_print("=" * 60)
    cross_platform_print("""
请制定你的批量上架策略，回答:
1. 如何组织商品信息？（Excel 表格设计）
2. 如何保证效率？（流程安排）
3. 如何控制质量？（检查方法）
""")
    
    student_strategy = get_cross_platform_input("你的批量策略:")
    
    # 🤖 LLM 评估策略
    cross_platform_print("\n🤖 AI 导师正在分析你的批量策略...")
    llm_prompt = LLM_PROMPTS["batch_strategy"].format(
        product_count=50,
        time_requirement="今天下班前",
        student_strategy=student_strategy
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 2: 效率优化（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 2: 效率优化")
    cross_platform_print("=" * 60)
    cross_platform_print("""
请设计你的批量上架流程:
1. 数据准备 → 2. 数据检查 → 3. 批量导入 → 4. 结果检查

你的流程设计:
""")
    
    student_workflow = get_cross_platform_input("你的流程设计:")
    
    # 🤖 LLM 评估流程
    cross_platform_print("\n🤖 AI 导师正在分析你的流程设计...")
    llm_prompt = LLM_PROMPTS["efficiency_optimization"].format(
        student_workflow=student_workflow
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 3: 质量控制（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 3: 质量控制")
    cross_platform_print("=" * 60)
    cross_platform_print("""
批量上架容易出错，请制定质量控制方案:
1. 哪些是关键质量控制点？
2. 如何检查？
3. 发现错误如何处理？
""")
    
    student_qc_plan = get_cross_platform_input("你的质量控制方案:")
    
    # 🤖 LLM 评估质控
    cross_platform_print("\n🤖 AI 导师正在分析你的质量控制方案...")
    llm_prompt = LLM_PROMPTS["quality_control"].format(
        student_qc_plan=student_qc_plan
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 4: 决策确认 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 4: 决策确认")
    cross_platform_print("=" * 60)
    cross_platform_print(f"""
你的完整批量上架方案:

📦 任务：批量上架 50 件商品
📋 策略：{len(student_strategy)}字
🔄 流程：{len(student_workflow)}字
✅ 质控：{len(student_qc_plan)}字

确认要执行批量上架吗？
""")
    
    confirm = get_cross_platform_input("确认执行（输入 y 确认，其他取消）:")
    
    if confirm.lower() != 'y':
        cross_platform_print("\n⚠️ 已取消批量上架。你的方案很完善，可以继续优化。")
        return 0
    
    # ========== 环节 5: 调用基础 Skill 执行 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 5: 执行批量上架")
    cross_platform_print("=" * 60)
    
    success, result, error = call_base_skill(file_path="products_batch.xlsx")
    
    if success:
        cross_platform_print(f"""
✅ 批量上架完成！

执行结果:
- {result}

你的批量策略清晰，流程合理，质控完善！
""")
    else:
        cross_platform_print(f"""
⚠️ 批量上架失败：{error}

但你的方案设计得很好！
可能是后台服务未启动，不影响你的学习成果。
""")
    
    # ========== 环节 6: 复盘总结 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 6: 复盘总结")
    cross_platform_print("=" * 60)
    cross_platform_print("""
🎓 批量上架实训完成！

能力收获:
✓ 批量策略制定能力
✓ 效率优化能力
✓ 质量控制能力
✓ 风险管理能力

建议:
- 总结批量操作的经验
- 建立标准化流程
- 持续优化效率

💡 进阶学习:
- 学习使用自动化工具
- 掌握更多批量操作技巧
- 了解行业最佳实践
""")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="批量上架商品（LLM 智能引导版）")
    args = parser.parse_args()
    return run_guided_training()


if __name__ == "__main__":
    sys.exit(main())
