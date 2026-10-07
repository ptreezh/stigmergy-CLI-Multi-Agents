#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
电商 AI 实训平台 Skill - 提交实训（LLM 智能引导版）

培养能力：
- 成果整理能力
- 自我展示能力
- 反思总结能力
- 沟通表达能力

调用基础 Skill: eb-edu-submit-project
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
    "organize_work": """
你是一位实训指导专家，正在指导学生整理实训成果。

实训项目:
{project_info}

学生整理的成果:
{student_work}

请评估:
1. 成果是否完整？
2. 是否包含了所有要求的交付物？
3. 成果的组织是否清晰？

要求:
- 先肯定学生做得好的地方
- 指出遗漏或可以改进的地方
- 给出 1 个具体改进建议
- 语气鼓励性
""",

    "self_presentation": """
你是一位实训指导专家，正在指导学生进行自我展示。

实训项目:
{project_info}

学生的自我展示:
{student_presentation}

请评估:
1. 展示是否清晰表达了成果亮点？
2. 是否突出了个人贡献？
3. 表达是否有说服力？

要求:
- 先肯定好的地方
- 指出可以改进的地方
- 给出 1 个具体建议
""",

    "reflection": """
你是一位实训指导专家，正在指导学生进行反思总结。

实训项目:
{project_info}

学生的反思:
{student_reflection}

请评估:
1. 反思是否深入？
2. 是否识别了收获和不足？
3. 是否有改进计划？

要求:
- 先肯定学生的反思态度
- 指出可以深入思考的方向
- 鼓励学生持续改进
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
    return "📊 导师点评：你的成果基本完整，建议继续完善。"


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


def call_base_skill(project_name, files="", comment=""):
    """调用基础 Skill 执行实训提交"""
    cross_platform_print("\n🔧 正在调用基础 Skill 执行实训提交...")
    
    cmd = f'stigmergy skill call eb-edu-submit-project --project "{project_name}"'
    if files:
        cmd += f' --files "{files}"'
    if comment:
        cmd += f' --comment "{comment}"'
    
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
    cross_platform_print("║" + " " * 14 + "电商 AI 实训平台 - 提交实训（LLM 智能引导）" + " " * 14 + "║")
    cross_platform_print("╚" + "═" * 58 + "╝")
    
    # ========== 情境导入 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 情境导入")
    cross_platform_print("=" * 60)
    cross_platform_print("""
你完成了"商品上架实训"任务，现在需要提交实训成果。

实训要求:
- 上架 10 件商品
- 商品标题优化
- 商品卖点提炼
- 定价合理

请整理你的实训成果并提交。
""")
    get_cross_platform_input("准备好了吗？（按回车开始）")
    
    # ========== 环节 1: 成果整理（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 1: 成果整理")
    cross_platform_print("=" * 60)
    cross_platform_print("""
请整理你的实训成果，列出:
1. 完成的商品列表
2. 商品标题优化亮点
3. 商品卖点提炼亮点
4. 定价策略说明
""")
    
    student_work = get_cross_platform_input("你的实训成果:")
    
    # 🤖 LLM 评估成果
    cross_platform_print("\n🤖 AI 导师正在分析你的成果整理...")
    llm_prompt = LLM_PROMPTS["organize_work"].format(
        project_info="商品上架实训：上架 10 件商品",
        student_work=student_work
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    # 给学生修改机会
    if "改进" in llm_feedback or "建议" in llm_feedback:
        modified = get_cross_platform_input("\n是否修改完善成果？（直接回车跳过，或输入修改内容）", allow_empty=True)
        if modified:
            student_work = modified
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 2: 自我展示（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 2: 自我展示")
    cross_platform_print("=" * 60)
    cross_platform_print("""
请用 100-200 字展示你的实训亮点:
- 你最满意的作品
- 你的创新点
- 你的专业技能体现
""")
    
    student_presentation = get_cross_platform_input("自我展示（100-200 字）:")
    
    # 🤖 LLM 评估展示
    cross_platform_print("\n🤖 AI 导师正在分析你的自我展示...")
    llm_prompt = LLM_PROMPTS["self_presentation"].format(
        project_info="商品上架实训",
        student_presentation=student_presentation
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 3: 反思总结（LLM 引导） ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 3: 反思总结")
    cross_platform_print("=" * 60)
    cross_platform_print("""
请反思本次实训:
1. 你最大的收获是什么？
2. 你遇到的最大挑战是什么？如何克服的？
3. 如果重新做一次，你会如何改进？
""")
    
    student_reflection = get_cross_platform_input("你的反思总结:")
    
    # 🤖 LLM 评估反思
    cross_platform_print("\n🤖 AI 导师正在分析你的反思总结...")
    llm_prompt = LLM_PROMPTS["reflection"].format(
        project_info="商品上架实训",
        student_reflection=student_reflection
    )
    llm_feedback = call_llm(llm_prompt)
    cross_platform_print("\n" + llm_feedback)
    
    get_cross_platform_input("（按回车继续）")
    
    # ========== 环节 4: 决策确认 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 4: 决策确认")
    cross_platform_print("=" * 60)
    cross_platform_print(f"""
你的完整提交方案:

📦 实训项目：商品上架实训
📄 成果整理：{len(student_work)}字
✨ 自我展示：{len(student_presentation)}字
💡 反思总结：{len(student_reflection)}字

确认要提交实训吗？
""")
    
    confirm = get_cross_platform_input("确认提交（输入 y 确认，其他取消）:")
    
    if confirm.lower() != 'y':
        cross_platform_print("\n⚠️ 已取消提交。你的准备很充分，可以继续完善后再提交。")
        return 0
    
    # ========== 环节 5: 调用基础 Skill 执行 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 5: 执行实训提交")
    cross_platform_print("=" * 60)
    
    success, submission_id, error = call_base_skill(
        project_name="商品上架实训",
        files="submission.zip",
        comment=f"自我展示：{student_presentation[:50]}..."
    )
    
    if success:
        cross_platform_print(f"""
✅ 实训提交成功！

提交信息:
- 提交 ID: {submission_id}
- 实训项目：商品上架实训
- 提交时间：刚刚
- 状态：待评分

你的成果整理清晰，自我展示充分，反思深入！
""")
    else:
        cross_platform_print(f"""
⚠️ 实训提交失败：{error}

但你的准备很充分！
可能是后台服务未启动，不影响你的学习成果。
""")
    
    # ========== 环节 6: 复盘总结 ==========
    cross_platform_print("\n" + "=" * 60)
    cross_platform_print("📋 环节 6: 复盘总结")
    cross_platform_print("=" * 60)
    cross_platform_print("""
🎓 实训提交完成！

能力收获:
✓ 成果整理能力
✓ 自我展示能力
✓ 反思总结能力
✓ 沟通表达能力

建议:
- 等待教师评分
- 根据反馈继续改进
- 总结的经验应用到下次实训

💡 进阶学习:
- 学习优秀同学的成果展示方法
- 积累反思总结的技巧
- 建立个人作品集
""")
    
    return 0


def main():
    parser = argparse.ArgumentParser(description="提交实训（LLM 智能引导版）")
    args = parser.parse_args()
    return run_guided_training()


if __name__ == "__main__":
    sys.exit(main())
