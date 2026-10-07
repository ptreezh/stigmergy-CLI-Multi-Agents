#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 物流管理实训（引导式）

培养能力：
- 物流公司选择能力
- 运费模板设置能力
- 物流跟踪能力
- 物流异常处理能力
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
    "logistics_selection": """
你是一位电商物流管理导师，正在指导学生选择物流公司。

订单信息:
{order_data}

物流公司选项:
{logistics_options}

学生选择:
{student_selection}

请评估:
1. 学生是否考虑了客户需求？
2. 学生是否比较了不同物流公司？
3. 学生是否考虑了成本因素？

要求:
- 先肯定学生的正确选择
- 指出遗漏的考虑因素
- 提出 1-2 个追问
""",

    "exception_handling": """
你是一位电商物流管理专家，正在指导学生处理物流异常。

异常情况:
{exception_situation}

学生处理方案:
{student_plan}

请评估:
1. 处理方案是否合理？
2. 是否考虑了客户感受？
3. 是否及时有效？

要求:
- 先肯定合理部分
- 指出可以改进的地方
- 给出具体建议
""",

    "review": """
你是一位电商物流管理专家，正在给学生物流管理实训做最终点评。

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


def run_logistics_management_training():
    """运行物流管理实训"""
    
    cross_platform_print("\n")
    cross_platform_print("╔" + "═" * 58 + "╗")
    cross_platform_print("║" + " " * 16 + "电商 AI 实训平台 - 物流管理实训（引导式）" + " " * 16 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 情境导入 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 情境导入")
    cross_platform_print("=" * 60)
    cross_platform_print("""
你是一家电商公司的物流专员，今天有以下工作：

📦 待发货订单:
   - 订单号：ORD-2026-001
   - 客户：张三
   - 地址：北京市朝阳区
   - 商品：夏季连衣裙 x 2
   - 重量：0.5kg

🚚 可选物流公司:
   - 顺丰速运：快（1-2 天），¥23
   - 圆通速递：中（2-3 天），¥15
   - 中通快递：经济（3-4 天），¥12

请完成物流管理全流程。

AI 导师会全程引导你完成实训。
""")
    get_cross_platform_input("准备好了吗？（按回车开始）")
    
    # ========== 环节 1: 物流公司选择（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 1: 物流公司选择")
    cross_platform_print("=" * 60)
    cross_platform_print("""
首先，我们需要选择合适的物流公司。

订单信息:
- 地址：北京市朝阳区
- 重量：0.5kg
- 客户期望：尽快收到

物流公司选项:
- 顺丰速运：快（1-2 天），¥23
- 圆通速递：中（2-3 天），¥15
- 中通快递：经济（3-4 天），¥12

请选择物流公司并说明理由。
""")
    
    student_selection = get_cross_platform_input("你的选择及理由:")
    
    # 🤖 LLM 评估选择
    cross_platform_print("\n🤖 AI 导师正在分析你的选择...")
    llm_prompt = LLM_PROMPTS["logistics_selection"].format(
        order_data="订单 ORD-2026-001，北京朝阳区，0.5kg，客户期望尽快收到",
        logistics_options="顺丰¥23(1-2 天)，圆通¥15(2-3 天)，中通¥12(3-4 天)",
        student_selection=student_selection
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 2: 运费模板设置 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 2: 运费模板设置")
    cross_platform_print("=" * 60)
    cross_platform_print("""
现在，请设置运费模板。

运费模板配置:
- 模板名称：全国包邮（偏远地区除外）
- 包邮地区：全国（除新疆、西藏、内蒙古）
- 不包邮地区：新疆¥15，西藏¥15，内蒙古¥10

请确认运费模板设置。
""")
    
    template_confirm = get_cross_platform_input("是否确认运费模板设置？(y/n):")
    
    if template_confirm.lower() == 'y':
        cross_platform_print("\n✅ 运费模板设置成功！")
    else:
        cross_platform_print("\n⚠️ 运费模板设置已跳过")
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 3: 物流跟踪 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 3: 物流跟踪")
    cross_platform_print("=" * 60)
    cross_platform_print("""
订单已发货，现在需要跟踪物流状态。

物流信息:
- 物流单号：SF123456789
- 物流公司：顺丰速运
- 发货时间：2026-03-30 10:00

当前物流状态:
- 2026-03-30 10:00 已收件
- 2026-03-30 12:00 运输中
- 2026-03-30 18:00 到达北京分拨中心
- 2026-03-31 08:00 派送中

请分析物流状态并决定是否需要跟进。
""")
    
    tracking_analysis = get_cross_platform_input("你的分析:")
    
    cross_platform_print("\n✅ 物流跟踪完成！")
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 4: 物流异常处理（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 4: 物流异常处理")
    cross_platform_print("=" * 60)
    cross_platform_print("""
假设客户联系客服，说物流 3 天没有更新了。

异常情况:
- 物流单号：SF123456789
- 最后更新：2026-03-31 08:00 派送中
- 当前时间：2026-04-03 10:00
- 客户诉求：为什么还没收到货？

请处理这个物流异常。
""")
    
    student_plan = get_cross_platform_input("你的处理方案:")
    
    # 🤖 LLM 评估处理方案
    cross_platform_print("\n🤖 AI 导师正在分析你的处理方案...")
    llm_prompt = LLM_PROMPTS["exception_handling"].format(
        exception_situation="物流 3 天未更新，客户询问",
        student_plan=student_plan
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 5: 复盘总结（LLM 点评） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 5: 复盘总结")
    cross_platform_print("=" * 60)
    
    cross_platform_print("🤖 AI 导师正在生成最终点评...")
    
    student_plan_summary = f"""
物流公司选择：{student_selection}
运费模板设置：{template_confirm}
物流跟踪分析：{tracking_analysis}
异常处理方案：{student_plan}
"""
    
    llm_prompt = LLM_PROMPTS["review"].format(
        student_plan=student_plan_summary,
        decision_reasoning=f"物流选择：{student_selection}\n异常处理：{student_plan}",
        execution_result="物流管理完成"
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("🎓 物流管理实训完成！")
    cross_platform_print("=" * 60)
    cross_platform_print("""
能力收获:
✓ 物流公司选择能力
✓ 运费模板设置能力
✓ 物流跟踪能力
✓ 物流异常处理能力

建议:
- 回顾 AI 导师的反馈
- 思考如何改进
- 继续学习其他实训任务

💡 进阶学习:
- [物流管理完整教程](./tutorials/logistics-management.md)
- [物流公司选择指南](./guides/logistics-selection.md)
- [物流异常处理最佳实践](./guides/logistics-exception.md)
""")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="物流管理实训（引导式）")
    args = parser.parse_args()
    return run_logistics_management_training()


if __name__ == "__main__":
    sys.exit(main())
