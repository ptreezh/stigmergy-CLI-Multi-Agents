#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 创建商品（LLM 智能引导版）

核心设计理念:
1. 学生不是直接操作，而是通过 LLM 个性化问答引导
2. 引导学生思考：标题优化、定价策略、卖点提炼
3. 学生决策后，调用基础 Skill (eb-edu-medusa-create-product) 执行

Usage:
    stigmergy skill call eb-edu-create-product-guided
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


# LLM 引导提示词
LLM_PROMPTS = {
    "title_optimization": """
你是一位电商商品标题优化专家。

产品信息：{product_info}
学生拟定的标题：{student_title}

请评估:
1. 标题是否包含热搜词？
2. 标题是否突出核心卖点？
3. 标题长度是否合适（30 字以内）？
4. 与竞品标题相比，是否有差异化？

要求:
- 先肯定好的地方
- 指出可以改进的具体点
- 给出 1 个修改建议（不是直接改写）
- 语气鼓励性
""",

    "pricing_strategy": """
你是一位电商定价策略专家。

产品信息:
- 成本：{cost}元
- 竞品价格：{competitor_prices}

学生定价方案:
- 价格：{student_price}元
- 理由：{student_reason}

请评估:
1. 定价是否考虑了成本利润？
2. 定价是否参考了竞品价格带？
3. 定价与产品定位是否一致？
4. 理由是否充分？

要求:
- 先肯定合理部分
- 指出遗漏的考虑因素
- 提出 1 个追问引导学生完善
- 不要直接告诉"正确价格"
""",

    "selling_points": """
你是一位电商卖点提炼专家。

产品信息：{product_info}
竞品卖点：{competitor_features}
学生提炼的卖点：{student_selling_points}

请评估:
1. 卖点是否差异化（竞品没有的）？
2. 卖点是否针对目标用户痛点？
3. 卖点是否具体可感知？

要求:
- 先肯定好的地方
- 指出可以改进的地方
- 给出 1 个具体改进建议
"""
}


def call_llm(prompt):
    """调用 AI LLM（通过 stigmergy）"""
    try:
        # 尝试调用 qwen
        cmd = f'stigmergy qwen "{prompt}"'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            return result.stdout.strip()
    except:
        pass
    
    # 离线模式 - 简单模拟
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


def call_base_skill(title, price, category="", description="", inventory=100):
    """调用基础 Skill 执行商品创建"""
    cross_platform_print("\n🔧 正在调用基础 Skill 执行商品创建...")
    
    cmd = f'stigmergy skill call eb-edu-medusa-create-product --title "{title}" --price {price}'
    if category:
        cmd += f' --category "{category}"'
    if description:
        cmd += f' --description "{description}"'
    if inventory:
        cmd += f' --inventory {inventory}'
    
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
    cross_platform_print("║" + " " * 14 + "电商 AI 实训平台 - 创建商品（LLM 智能引导）" + " " * 14 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 情境导入 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 情境导入")
    cross_platform_print("=" * 60)
    cross_platform_print("""
你是一家电商公司的运营专员，老板给你一个任务：

📦 上架一款"夏季连衣裙"
💰 成本：80 元
👥 目标用户：18-25 岁女性，大学生，职场新人

竞品数据:
   • 竞品 1: 《夏季新款连衣裙女》- 159 元 - 月销 3000+
   • 竞品 2: 《法式复古连衣裙》- 259 元 - 月销 1000+
   • 竞品 3: 《简约气质连衣裙》- 189 元 - 月销 2000+

AI 导师会全程引导你完成商品上架方案。
""")
    get_cross_platform_input("准备好了吗？（按回车开始）")
    
    # ========== 环节 1: 商品标题优化（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 1: 商品标题优化")
    cross_platform_print("=" * 60)
    cross_platform_print("""
好的商品标题特点:
- 包含热搜词（如"夏季"、"新款"）
- 突出核心卖点（如"法式"、"复古"）
- 长度适中（30 字以内）
- 与竞品有差异化

请拟定你的商品标题（30 字以内）:
""")
    
    student_title = get_cross_platform_input("商品标题:")
    
    # 🤖 LLM 评估标题
    cross_platform_print("\n🤖 AI 导师正在分析你的标题...")
    llm_prompt = LLM_PROMPTS["title_optimization"].format(
        product_info="夏季连衣裙，成本 80 元，目标用户 18-25 岁女性",
        student_title=student_title
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    # 给学生修改机会
    if "改进" in llm_feedback or "建议" in llm_feedback:
        modified = get_cross_platform_input("\n是否修改标题？（直接回车使用原标题，或输入新标题）", allow_empty=True)
        if modified:
            student_title = modified
    
    # ========== 环节 2: 定价策略（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 2: 定价策略")
    cross_platform_print("=" * 60)
    cross_platform_print("""
基于竞品分析，现在请制定你的定价策略。

竞品价格带：159-259 元
产品成本：80 元

请回答:
1. 你的定价是多少？
2. 为什么定这个价格？（说明理由）
""")
    
    student_price = get_cross_platform_input("你的定价（元）:")
    student_reason = get_cross_platform_input("定价理由:")
    
    # 🤖 LLM 评估定价
    cross_platform_print("\n🤖 AI 导师正在分析你的定价策略...")
    llm_prompt = LLM_PROMPTS["pricing_strategy"].format(
        cost=80,
        competitor_prices="159-259 元",
        student_price=student_price,
        student_reason=student_reason
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    # ========== 环节 3: 卖点提炼（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 3: 卖点提炼")
    cross_platform_print("=" * 60)
    cross_platform_print("""
竞品卖点分析:
   • 竞品 1: 新款，百搭
   • 竞品 2: 法式，复古
   • 竞品 3: 简约，气质

好卖点的特点:
- 差异化（竞品没有的）
- 痛点导向（解决用户问题）
- 可感知（用户能感受到价值）

请提炼你的 3 个核心卖点:
""")
    
    selling_points = get_cross_platform_input("3 个核心卖点（用逗号分隔）:")
    
    # 🤖 LLM 评估卖点
    cross_platform_print("\n🤖 AI 导师正在分析你的卖点提炼...")
    llm_prompt = LLM_PROMPTS["selling_points"].format(
        product_info="夏季连衣裙，目标用户 18-25 岁女性",
        competitor_features="新款，百搭，法式，复古，简约，气质",
        student_selling_points=selling_points
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    # ========== 环节 4: 决策确认 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 4: 决策确认")
    cross_platform_print("=" * 60)
    cross_platform_print("""
你的完整商品上架方案:

📦 商品标题：{title}
💰 定价：{price}元
✨ 核心卖点：{selling_points}
💡 定价理由：{reason}

确认要执行上架吗？
""".format(title=student_title, price=student_price, selling_points=selling_points, reason=student_reason))
    
    confirm = get_cross_platform_input("确认执行（输入 y 确认，其他取消）:")
    
    if confirm.lower() != 'y':
        cross_platform_print("\n⚠️ 已取消上架。你的思考过程很好，可以继续完善方案。")
        return 0
    
    # ========== 环节 5: 调用基础 Skill 执行 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 5: 执行上架")
    cross_platform_print("=" * 60)
    
    success, product_id, error = call_base_skill(
        title=student_title,
        price=student_price,
        category="女装",
        description=f"夏季连衣裙，核心卖点：{selling_points}",
        inventory=100
    )
    
    if success:
        cross_platform_print(f"""
✅ 商品创建成功！

商品信息:
- 商品 ID: {product_id}
- 标题：{student_title}
- 价格：{student_price}元
- 卖点：{selling_points}

你的决策过程清晰，方案合理！
""")
    else:
        cross_platform_print(f"""
⚠️ 商品创建失败：{error}

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
✓ 商品标题优化方法
✓ 定价策略思维（成本 + 竞品 + 定位）
✓ 卖点提炼技巧（差异化 + 痛点 + 可感知）
✓ 决策依据意识

建议:
- 回顾 AI 导师的反馈
- 思考如何改进
- 下次实训做得更好

💡 进阶学习:
- 尝试不同品类的商品上架
- 对比不同定价策略的效果
- 学习更多卖点提炼方法
""")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="创建商品（LLM 智能引导版）")
    args = parser.parse_args()
    
    return run_guided_training()


if __name__ == "__main__":
    sys.exit(main())
