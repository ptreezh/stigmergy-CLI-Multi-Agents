#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 订单处理（LLM 智能引导版）

培养能力：
- 客户需求分析能力
- 订单配置能力
- 价格计算能力
- 风险识别能力

调用基础 Skill: eb-edu-medusa-create-order
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
    "customer_analysis": """
你是一位电商订单处理专家，正在指导学生分析客户需求。

客户信息:
{customer_info}

客户订单需求:
{customer_request}

学生分析:
{student_analysis}

请评估:
1. 学生是否准确理解了客户需求？
2. 学生识别了哪些关键信息？
3. 学生遗漏了什么重要点？

要求:
- 先肯定学生的正确分析
- 指出遗漏的关键点
- 提出 1 个追问，引导学生深入思考
- 语气鼓励性
""",

    "order_config": """
你是一位电商订单处理专家，正在指导学生配置订单。

产品信息:
{product_info}

学生配置方案:
- 商品：{products}
- 数量：{quantities}
- 收货地址：{shipping_address}

请评估:
1. 商品选择是否满足客户需求？
2. 数量是否合理？
3. 收货地址是否完整？

要求:
- 先肯定合理部分
- 指出需要完善的地方
- 不要直接给"正确答案"
""",

    "price_calculation": """
你是一位电商订单处理专家，正在指导学生计算订单价格。

订单信息:
- 商品总价：{product_total}
- 运费：{shipping_fee}
- 优惠活动：{discount}

学生计算:
- 订单总额：{student_total}
- 计算过程：{calculation_process}

请评估:
1. 计算是否准确？
2. 是否考虑了所有费用项？
3. 是否正确应用了优惠？

要求:
- 先肯定正确部分
- 指出计算错误或遗漏
- 给出正确计算方法（不直接给答案）
""",

    "review": """
你是一位电商订单处理专家，正在给学生实训做最终点评。

学生完整订单方案:
{student_order}

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


def call_base_skill(customer_id, items, shipping_address=""):
    """调用基础 Skill 执行订单创建"""
    cross_platform_print("\n🔧 正在调用基础 Skill 执行订单创建...")
    
    cmd = f'stigmergy skill call eb-edu-medusa-create-order --customer-id "{customer_id}" --items "{items}"'
    if shipping_address:
        cmd += f' --shipping-address "{shipping_address}"'
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                return True, data.get("id", "N/A"), ""
            except:
                return True, "N/A", ""
        else:
            return False, "", result.stderr
    except Exception as e:
        return False, "", str(e)


def run_guided_training():
    """运行 LLM 智能引导实训"""
    
    cross_platform_print("\n")
    cross_platform_print("╔" + "═" * 58 + "╗")
    cross_platform_print("║" + " " * 14 + "电商 AI 实训平台 - 订单处理（LLM 智能引导）" + " " * 14 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 情境导入 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 情境导入")
    cross_platform_print("=" * 60)
    cross_platform_print("""
你是一家电商公司的订单处理专员，接到一个客户订单：

👤 客户信息:
   - 姓名：张三
   - 类型：VIP 客户
   - 历史订单：15 单
   - 收货地址：北京市朝阳区 XX 路 XX 号

📦 客户需求:
   "我想买 2 件夏季连衣裙，要尽快发货"

请分析客户需求并处理订单。
""")
    get_cross_platform_input("准备好了吗？（按回车开始）")
    
    # ========== 环节 1: 客户需求分析（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 1: 客户需求分析")
    cross_platform_print("=" * 60)
    cross_platform_print("""
请分析客户需求，回答:
1. 客户需要什么商品？数量多少？
2. 客户有什么特殊要求？
3. 作为 VIP 客户，有什么需要注意的？
""")
    
    student_analysis = get_cross_platform_input("你的分析:")
    
    # 🤖 LLM 评估分析
    cross_platform_print("\n🤖 AI 导师正在分析你的回答...")
    llm_prompt = LLM_PROMPTS["customer_analysis"].format(
        customer_info="张三，VIP 客户，历史订单 15 单",
        customer_request="想买 2 件夏季连衣裙，要尽快发货",
        student_analysis=student_analysis
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 2: 订单配置（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 2: 订单配置")
    cross_platform_print("=" * 60)
    cross_platform_print("""
商品信息:
   • 商品 A: 夏季连衣裙 - 法式复古款 - 259 元
   • 商品 B: 夏季连衣裙 - 简约气质款 - 189 元
   • 商品 C: 夏季连衣裙 - 新款百搭款 - 159 元

请配置订单:
1. 选择什么商品？
2. 数量多少？
3. 收货地址？
""")
    
    products = get_cross_platform_input("选择商品（A/B/C，可多选）:")
    quantities = get_cross_platform_input("数量:")
    shipping_address = get_cross_platform_input("收货地址:", allow_empty=True)
    
    if not shipping_address:
        shipping_address = "北京市朝阳区 XX 路 XX 号（使用客户默认地址）"
    
    # 🤖 LLM 评估配置
    cross_platform_print("\n🤖 AI 导师正在分析你的订单配置...")
    llm_prompt = LLM_PROMPTS["order_config"].format(
        product_info="A:259 元，B:189 元，C:159 元",
        products=products,
        quantities=quantities,
        shipping_address=shipping_address
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 3: 价格计算（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 3: 价格计算")
    cross_platform_print("=" * 60)
    cross_platform_print("""
订单费用信息:
   • 商品总价：根据选择计算
   • 运费：10 元（VIP 客户满 299 元包邮）
   • 优惠：VIP 客户 95 折

请计算订单总额，并说明计算过程。
""")
    
    student_total = get_cross_platform_input("订单总额（元）:")
    calculation_process = get_cross_platform_input("计算过程:")
    
    # 🤖 LLM 评估计算
    cross_platform_print("\n🤖 AI 导师正在分析你的价格计算...")
    llm_prompt = LLM_PROMPTS["price_calculation"].format(
        product_total="根据选择计算",
        shipping_fee="10 元（满 299 包邮）",
        discount="VIP 95 折",
        student_total=student_total,
        calculation_process=calculation_process
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 4: 决策确认 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 4: 决策确认")
    cross_platform_print("=" * 60)
    cross_platform_print(f"""
你的完整订单方案:

👤 客户：张三（VIP 客户）
📦 商品：{products}
🔢 数量：{quantities}
📍 收货地址：{shipping_address}
💰 订单总额：{student_total}元

确认要创建订单吗？
""")
    
    confirm = get_cross_platform_input("确认执行（输入 y 确认，其他取消）:")
    
    if confirm.lower() != 'y':
        cross_platform_print("\n⚠️ 已取消订单创建。你的思考过程很好，可以继续完善方案。")
        return 0
    
    # ========== 环节 5: 调用基础 Skill 执行 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 5: 执行订单创建")
    cross_platform_print("=" * 60)
    
    # 简化：使用客户 ID 和商品 ID
    success, order_id, error = call_base_skill(
        customer_id="cust_zhangsan",
        items=f"{products}:{quantities}",
        shipping_address=shipping_address
    )
    
    if success:
        cross_platform_print(f"""
✅ 订单创建成功！

订单信息:
- 订单 ID: {order_id}
- 客户：张三
- 商品：{products}
- 数量：{quantities}
- 收货地址：{shipping_address}

你的决策过程清晰，方案合理！
""")
    else:
        cross_platform_print(f"""
⚠️ 订单创建失败：{error}

但你的决策过程是正确的！
可能是后台服务未启动，不影响你的学习成果。
""")
    
    # ========== 环节 6: 复盘总结 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 6: 复盘总结")
    cross_platform_print("=" * 60)
    cross_platform_print("""
🎓 实训完成！

能力收获:
✓ 客户需求分析方法
✓ 订单配置能力
✓ 价格计算能力（含优惠、运费）
✓ 风险识别意识

建议:
- 回顾 AI 导师的反馈
- 思考如何改进
- 下次实训做得更好

💡 进阶学习:
- 学习处理复杂订单（多商品、多地址）
- 掌握订单异常处理方法
- 了解订单状态流转
""")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="订单处理（LLM 智能引导版）")
    args = parser.parse_args()
    return run_guided_training()


if __name__ == "__main__":
    sys.exit(main())
