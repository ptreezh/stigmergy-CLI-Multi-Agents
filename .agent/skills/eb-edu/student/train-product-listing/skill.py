#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 商品上架实训（引导式）

培养能力：
- 市场调研能力
- 商品录入能力
- 定价策略能力
- 上架操作能力

特性：
- 跨平台兼容（Windows/Linux/macOS）
- 自适应编码（UTF-8/GBK）
- 无外部依赖（仅使用 Python 标准库）
- 中文无乱码

调用基础 Skills:
- eb-edu-medusa-list-products
- eb-edu-medusa-create-product
- eb-edu-medusa-update-product

使用方式：
    python skill.py
    python skill.py --help
"""

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
    def cross_platform_print(text):
        print(text)
    def cross_platform_input(prompt):
        print(prompt)
        return input()
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

import json
import argparse


LLM_PROMPTS = {
    "market_research": """
你是一位电商运营导师，正在指导学生进行商品上架前的市场调研。

竞品数据:
{competitor_data}

学生分析:
{student_analysis}

请评估:
1. 学生是否准确识别了价格带？
2. 学生是否发现了竞品的成功因素？
3. 学生是否找到了市场机会？

要求:
- 先肯定学生的正确分析
- 指出遗漏的关键点
- 提出 1-2 个追问，引导学生深入思考
""",

    "pricing_strategy": """
你是一位电商定价策略专家，正在指导学生制定商品定价。

产品信息:
- 成本：{cost}元
- 竞品价格：{competitor_prices}

学生定价方案:
- 价格：{student_price}元
- 理由：{student_reason}

请评估:
1. 定价是否合理（考虑成本、竞品、定位）？
2. 理由是否充分？
3. 学生考虑了哪些因素，遗漏了哪些？

要求:
- 先肯定合理部分
- 指出遗漏的考虑因素
- 提出 1 个追问，引导学生完善方案
""",

    "listing_review": """
你是一位电商运营导师，正在给学生商品上架实训做最终点评。

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


def get_input(prompt, allow_empty=False):
    """获取学生输入（跨平台兼容）"""
    try:
        while True:
            answer = cross_platform_input(f"\n{prompt}\n> ").strip()
            if answer or allow_empty:
                return answer
    except EOFError:
        return ""
    except KeyboardInterrupt:
        print("\n\n操作已取消")
        sys.exit(0)


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


def run_product_listing_training():
    """运行商品上架实训"""
    
    cross_platform_print("\n")
    cross_platform_print("╔" + "═" * 58 + "╗")
    cross_platform_print("║" + " " * 16 + "电商 AI 实训平台 - 商品上架实训（引导式）" + " " * 16 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 情境导入 ==========
    print("\n" + "=" * 60)
    print("📋 情境导入")
    print("=" * 60)
    print("""
你是一家电商公司的运营专员，老板给你一个任务：

📦 任务：上架一款"夏季连衣裙"
💰 成本：80 元
👥 目标用户：18-25 岁女性，大学生，职场新人

请完成商品上架全流程，包括：
1. 市场调研
2. 商品录入
3. 定价策略
4. 上架确认

AI 导师会全程引导你完成实训。
""")
    get_input("准备好了吗？（按回车开始）")
    
    # ========== 环节 1: 市场调研（LLM 引导） ==========
    print("\n" + "=" * 60)
    print("📋 环节 1: 市场调研")
    print("=" * 60)
    print("""
首先，我们需要了解市场情况。

竞品数据:
   • 竞品 1: 《夏季新款连衣裙女》- 159 元 - 月销 3000+
   • 竞品 2: 《法式复古连衣裙》- 259 元 - 月销 1000+
   • 竞品 3: 《简约气质连衣裙》- 189 元 - 月销 2000+

请分析竞品数据，回答:
1. 竞品的主要价格带是什么？
2. 销量最高的竞品，它的优势是什么？
3. 你发现什么市场机会？
""")
    
    student_analysis = get_input("你的分析:")
    
    # 🤖 LLM 评估分析
    print("\n🤖 AI 导师正在分析你的回答...")
    llm_prompt = LLM_PROMPTS["market_research"].format(
        competitor_data="竞品 1: 159 元，月销 3000+；竞品 2: 259 元，月销 1000+；竞品 3: 189 元，月销 2000+",
        student_analysis=student_analysis
    )
    llm_feedback = call_llm(llm_prompt)
    print("\n" + llm_feedback)
    
    get_input("（按回车继续）")
    
    # ========== 环节 2: 商品录入 ==========
    print("\n" + "=" * 60)
    print("📋 环节 2: 商品录入")
    print("=" * 60)
    print("""
现在，请录入商品信息。

需要准备:
- 商品标题（吸引眼球）
- 商品描述（详细介绍）
- 商品图片（清晰美观）
- 商品规格（尺码、颜色等）
""")
    
    product_title = get_input("商品标题:")
    product_description = get_input("商品描述:")
    
    # 调用基础 Skill 创建商品
    print("\n🔧 正在创建商品...")
    result = call_base_skill(
        "eb-edu-medusa-create-product",
        title=product_title,
        description=product_description,
        price=199,
        inventory=100
    )
    
    if result["success"]:
        print("✅ 商品创建成功！")
        product_id = result["data"].get("id", "N/A") if isinstance(result["data"], dict) else "N/A"
        print(f"商品 ID: {product_id}")
    else:
        print(f"⚠️ 商品创建失败：{result.get('error', '未知错误')}")
        print("模拟创建商品，继续实训...")
        product_id = "prod_simulated"
    
    get_input("（按回车继续）")
    
    # ========== 环节 3: 定价策略（LLM 引导） ==========
    print("\n" + "=" * 60)
    print("📋 环节 3: 定价策略")
    print("=" * 60)
    print("""
基于市场调研，现在请制定你的定价策略。

产品信息:
- 成本：80 元
- 竞品价格：159 元、259 元、189 元

请回答:
1. 你的定价是多少？
2. 为什么定这个价格？（说明理由）
""")
    
    student_price = get_input("你的定价（元）:")
    student_reason = get_input("定价理由:")
    
    # 🤖 LLM 评估定价
    print("\n🤖 AI 导师正在分析你的定价策略...")
    llm_prompt = LLM_PROMPTS["pricing_strategy"].format(
        cost=80,
        competitor_prices="159 元、259 元、189 元",
        student_price=student_price,
        student_reason=student_reason
    )
    llm_feedback = call_llm(llm_prompt)
    print("\n" + llm_feedback)
    
    get_input("（按回车继续）")
    
    # ========== 环节 4: 上架确认 ==========
    print("\n" + "=" * 60)
    print("📋 环节 4: 上架确认")
    print("=" * 60)
    print(f"""
你的完整商品上架方案:

📦 商品标题：{product_title}
📝 商品描述：{product_description[:50]}...
💰 定价：{student_price}元
💡 定价理由：{student_reason}

确认要上架商品吗？
""")
    
    confirm = get_input("确认上架（输入 y 确认，其他取消）:")
    
    if confirm.lower() != 'y':
        print("\n⚠️ 已取消上架。你的方案很好，可以继续完善后再上架。")
        return 0
    
    # ========== 环节 5: 执行上架 ==========
    print("\n" + "=" * 60)
    print("📋 环节 5: 执行上架")
    print("=" * 60)
    
    print("🔧 正在更新商品状态为已发布...")
    result = call_base_skill(
        "eb-edu-medusa-update-product",
        product_id=product_id,
        price=student_price,
        status="published"
    )
    
    if result["success"]:
        print("✅ 商品上架成功！")
        execution_result = "商品已成功上架"
    else:
        print(f"⚠️ 商品上架失败：{result.get('error', '未知错误')}")
        execution_result = f"上架失败：{result.get('error', '未知错误')}"
    
    # ========== 环节 6: 复盘总结（LLM 点评） ==========
    print("\n" + "=" * 60)
    print("📋 环节 6: 复盘总结")
    print("=" * 60)
    
    print("🤖 AI 导师正在生成最终点评...")
    
    student_plan = f"""
商品标题：{product_title}
商品描述：{product_description}
定价：{student_price}元
定价理由：{student_reason}
"""
    
    llm_prompt = LLM_PROMPTS["listing_review"].format(
        student_plan=student_plan,
        decision_reasoning=f"市场调研分析：{student_analysis}\n定价理由：{student_reason}",
        execution_result=execution_result
    )
    llm_feedback = call_llm(llm_prompt)
    print("\n" + llm_feedback)
    
    print("\n" + "=" * 60)
    print("🎓 商品上架实训完成！")
    print("=" * 60)
    print("""
能力收获:
✓ 市场调研能力
✓ 商品录入能力
✓ 定价策略能力
✓ 上架操作能力

建议:
- 回顾 AI 导师的反馈
- 思考如何改进
- 继续学习其他实训任务

💡 进阶学习:
- [商品管理完整教程](./tutorials/product-management.md)
- [商品定价指南](./guides/pricing.md)
- [市场调研最佳实践](./guides/market-research.md)
""")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="商品上架实训（引导式）")
    args = parser.parse_args()
    return run_product_listing_training()


if __name__ == "__main__":
    sys.exit(main())
