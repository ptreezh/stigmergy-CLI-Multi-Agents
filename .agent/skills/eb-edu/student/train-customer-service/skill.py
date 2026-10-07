#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 客户服务实训（引导式）

培养能力：
- 客户沟通能力
- 投诉处理能力
- 客户维护能力
- 客户关系管理能力
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
    "customer_inquiry": """
你是一位电商客服导师，正在指导学生处理客户咨询。

客户咨询:
{inquiry_data}

学生回复:
{student_reply}

请评估:
1. 回复是否专业？
2. 是否解决了客户问题？
3. 语气是否友好？

要求:
- 先肯定学生的正确回复
- 指出可以改进的地方
- 提供改进建议
""",

    "complaint_handling": """
你是一位电商客服导师，正在指导学生处理客户投诉。

投诉情况:
{complaint_data}

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
你是一位电商客服导师，正在给学生客户服务实训做最终点评。

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


def run_customer_service_training():
    """运行客户服务实训"""
    
    cross_platform_print("\n")
    cross_platform_print("╔" + "═" * 58 + "╗")
    cross_platform_print("║" + " " * 12 + "电商 AI 实训平台 - 客户服务实训（引导式）" + " " * 12 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 情境导入 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 情境导入")
    cross_platform_print("=" * 60)
    cross_platform_print("""
你是一家电商公司的客服专员，今天接到以下工作：

💼 工作任务:
1. 处理客户咨询
2. 处理客户投诉
3. 客户维护

请完成客户服务全流程。

AI 导师会全程引导你完成实训。
""")
    get_cross_platform_input("准备好了吗？（按回车开始）")
    
    # ========== 环节 1: 客户咨询处理（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 1: 客户咨询处理")
    cross_platform_print("=" * 60)
    cross_platform_print("""
客户咨询:

客户：你好，我昨天买的连衣裙，什么时候能发货？
订单号：ORD-2026-001

请回复客户。
""")
    
    student_reply = get_cross_platform_input("你的回复:")
    
    # 🤖 LLM 评估回复
    cross_platform_print("\n🤖 AI 导师正在分析你的回复...")
    llm_prompt = LLM_PROMPTS["customer_inquiry"].format(
        inquiry_data="客户询问订单 ORD-2026-001 什么时候发货",
        student_reply=student_reply
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 2: 客户投诉处理（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 2: 客户投诉处理")
    cross_platform_print("=" * 60)
    cross_platform_print("""
客户投诉:

客户：我收到的商品有破损，要求退款！
订单号：ORD-2026-002
商品：夏季连衣裙
问题：衣服下摆有破损

请处理这个投诉。
""")
    
    student_plan = get_cross_platform_input("你的处理方案:")
    
    # 🤖 LLM 评估处理方案
    cross_platform_print("\n🤖 AI 导师正在分析你的处理方案...")
    llm_prompt = LLM_PROMPTS["complaint_handling"].format(
        complaint_data="客户收到商品有破损，要求退款",
        student_plan=student_plan
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 3: 客户维护 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 3: 客户维护")
    cross_platform_print("=" * 60)
    cross_platform_print("""
客户维护:

客户张三，近 3 个月购买了 5 次，消费总额¥2000+。

请制定客户维护方案:
1. 如何维护这个客户？
2. 如何提高客户复购率？
""")
    
    retention_plan = get_cross_platform_input("你的维护方案:")
    
    cross_platform_print("\n✅ 客户维护方案已记录！")
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 4: 复盘总结（LLM 点评） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 4: 复盘总结")
    cross_platform_print("=" * 60)
    
    cross_platform_print("🤖 AI 导师正在生成最终点评...")
    
    student_plan_summary = f"""
客户咨询回复：{student_reply}
投诉处理方案：{student_plan}
客户维护方案：{retention_plan}
"""
    
    llm_prompt = LLM_PROMPTS["review"].format(
        student_plan=student_plan_summary,
        decision_reasoning=f"咨询回复：{student_reply}\n投诉处理：{student_plan}\n维护方案：{retention_plan}",
        execution_result="客户服务完成"
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("🎓 客户服务实训完成！")
    cross_platform_print("=" * 60)
    cross_platform_print("""
能力收获:
✓ 客户沟通能力
✓ 投诉处理能力
✓ 客户维护能力
✓ 客户关系管理能力

建议:
- 回顾 AI 导师的反馈
- 思考如何改进
- 继续学习其他实训任务

💡 进阶学习:
- [客户服务完整教程](./tutorials/customer-service.md)
- [投诉处理技巧](./guides/complaint-handling.md)
- [客户维护最佳实践](./guides/customer-retention.md)
""")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="客户服务实训（引导式）")
    args = parser.parse_args()
    return run_customer_service_training()


if __name__ == "__main__":
    sys.exit(main())
