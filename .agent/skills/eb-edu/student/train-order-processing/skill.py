#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 订单处理实训（引导式）

培养能力：
- 订单确认能力
- 配货打包能力
- 发货物流能力
- 异常处理能力
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
    "order_confirmation": """
你是一位电商订单处理导师，正在指导学生进行订单确认。

订单信息:
{order_data}

学生分析:
{student_analysis}

请评估:
1. 学生是否检查了库存？
2. 学生是否确认了客户信息？
3. 学生是否发现了潜在问题？

要求:
- 先肯定学生的正确分析
- 指出遗漏的关键点
- 提出 1-2 个追问
""",

    "exception_handling": """
你是一位电商客服导师，正在指导学生处理异常订单。

异常情况:
{exception_data}

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
你是一位电商运营导师，正在给学生订单处理实训做最终点评。

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


def call_base_skill(skill_name, **kwargs):
    """调用基础 Skills"""
    cmd = f"stigmergy skill call {skill_name}"
    for key, value in kwargs.items():
        cmd += f' --{key} "{value}"'
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            try:
                return {"success": True, "data": json.loads(result.stdout)}
            except:
                return {"success": True, "data": result.stdout}
        else:
            return {"success": False, "error": result.stderr}
    except Exception as e:
        return {"success": False, "error": str(e)}


def run_order_processing_training():
    """运行订单处理实训"""
    
    cross_platform_print("\n")
    cross_platform_print("╔" + "═" * 58 + "╗")
    cross_platform_print("║" + " " * 12 + "电商 AI 实训平台 - 订单处理实训（引导式）" + " " * 12 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 情境导入 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 情境导入")
    cross_platform_print("=" * 60)
    cross_platform_print("""
你是一家电商公司的订单处理专员，接到一个订单：

📦 订单信息:
   - 订单号：ORD-2026-001
   - 客户：张三
   - 商品：夏季连衣裙 x 2
   - 总额：¥398
   - 地址：北京市朝阳区 XX 路 XX 号

请完成订单处理全流程，包括：
1. 订单确认
2. 配货打包
3. 发货物流
4. 异常处理（如有）

AI 导师会全程引导你完成实训。
""")
    get_cross_platform_input("准备好了吗？（按回车开始）")
    
    # ========== 环节 1: 订单确认（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 1: 订单确认")
    cross_platform_print("=" * 60)
    cross_platform_print("""
首先，我们需要确认订单信息。

请检查以下内容:
1. 库存是否充足？
2. 客户信息是否完整？
3. 是否有潜在问题？
""")
    
    student_analysis = get_cross_platform_input("你的分析:")
    
    # 🤖 LLM 评估分析
    cross_platform_print("\n🤖 AI 导师正在分析你的回答...")
    llm_prompt = LLM_PROMPTS["order_confirmation"].format(
        order_data="订单号：ORD-2026-001，商品：夏季连衣裙 x 2，总额：¥398",
        student_analysis=student_analysis
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 2: 配货打包 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 2: 配货打包")
    cross_platform_print("=" * 60)
    cross_platform_print("""
订单确认无误，现在进行配货打包。

配货清单:
- 夏季连衣裙 x 2
  - 颜色：红色
  - 尺码：L
  - SKU: DRESS-RED-L

打包要求:
- 选择合适包装
- 放入商品
- 放入发货单
- 封箱打包
""")
    
    packaging_note = get_cross_platform_input("打包备注（可选）:")
    
    cross_platform_print("\n✅ 配货打包完成！")
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 3: 发货物流 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 3: 发货物流")
    cross_platform_print("=" * 60)
    cross_platform_print("""
现在选择物流公司并发货。

可选物流公司:
1. 顺丰速运（快，¥23）
2. 圆通速递（中等，¥15）
3. 中通快递（经济，¥12）
""")
    
    logistics_company = get_cross_platform_input("选择物流公司（输入名称）:")
    tracking_number = get_cross_platform_input("输入物流单号:")
    
    # 调用基础 Skill 发货
    cross_platform_print("\n🔧 正在发货...")
    result = call_base_skill(
        "eb-edu-medusa-fulfill-order",
        order_id="ORD-2026-001",
        tracking_number=tracking_number,
        carrier=logistics_company
    )
    
    if result["success"]:
        cross_platform_print("✅ 发货成功！")
        execution_result = "订单已发货"
    else:
        cross_platform_print(f"⚠️ 发货失败：{result.get('error', '未知错误')}")
        execution_result = f"发货失败：{result.get('error', '未知错误')}"
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 4: 异常处理（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 4: 异常处理")
    cross_platform_print("=" * 60)
    cross_platform_print("""
假设客户联系客服，说收到的商品有破损。

请处理这个异常情况:
1. 安抚客户情绪
2. 了解具体情况
3. 提出解决方案
""")
    
    student_plan = get_cross_platform_input("你的处理方案:")
    
    # 🤖 LLM 评估处理方案
    cross_platform_print("\n🤖 AI 导师正在分析你的处理方案...")
    llm_prompt = LLM_PROMPTS["exception_handling"].format(
        exception_data="客户收到商品有破损",
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
订单确认：{student_analysis}
打包备注：{packaging_note}
物流公司：{logistics_company}
物流单号：{tracking_number}
异常处理：{student_plan}
"""
    
    llm_prompt = LLM_PROMPTS["review"].format(
        student_plan=student_plan_summary,
        decision_reasoning=f"订单确认分析：{student_analysis}\n异常处理方案：{student_plan}",
        execution_result=execution_result
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("🎓 订单处理实训完成！")
    cross_platform_print("=" * 60)
    cross_platform_print("""
能力收获:
✓ 订单确认能力
✓ 配货打包能力
✓ 发货物流能力
✓ 异常处理能力

建议:
- 回顾 AI 导师的反馈
- 思考如何改进
- 继续学习其他实训任务

💡 进阶学习:
- [订单处理完整教程](./tutorials/order-processing.md)
- [客户服务技巧](./guides/customer-service.md)
- [物流管理最佳实践](./guides/logistics.md)
""")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="订单处理实训（引导式）")
    args = parser.parse_args()
    return run_order_processing_training()


if __name__ == "__main__":
    sys.exit(main())
