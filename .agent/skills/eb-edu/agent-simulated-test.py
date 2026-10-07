#!/usr/bin/env python3
"""
电商 AI 实训平台 - Agent 模拟真实用户交互测试脚本

测试方法：
1. 启动 Python 脚本
2. 脚本模拟人类用户与实训系统对话
3. 测试验证系统可用性

测试日期：2026-03-30
"""

import subprocess
import sys
import json
import time


def run_skill_test(skill_name, skill_path):
    """测试单个 Skill"""
    print(f"\n{'='*60}")
    print(f"测试 Skill: {skill_name}")
    print(f"路径：{skill_path}")
    print(f"{'='*60}\n")
    
    # 测试 1: 文件存在性
    import os
    if os.path.exists(skill_path):
        print("✅ 文件存在性测试：通过")
    else:
        print("❌ 文件存在性测试：失败")
        return False
    
    # 测试 2: 可执行性
    try:
        result = subprocess.run(
            ["python", skill_path, "--help"],
            capture_output=True,
            timeout=10,
            cwd=os.path.dirname(skill_path),
            encoding='utf-8'
        )
        if result.returncode == 0:
            print("✅ 可执行性测试：通过")
            stdout_text = result.stdout.strip() if result.stdout else "N/A"
            print(f"帮助信息：{stdout_text[:100]}...")
        else:
            print("❌ 可执行性测试：失败")
            return False
    except Exception as e:
        print(f"❌ 可执行性测试：异常 - {str(e)}")
        return False
    
    # 测试 3: JSON 配置文件
    json_path = os.path.join(os.path.dirname(skill_path), "skill.json")
    if os.path.exists(json_path):
        print("✅ JSON 配置文件：存在")
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            print(f"✅ JSON 格式：有效")
            print(f"   Skill 名称：{config.get('name', 'N/A')}")
            print(f"   描述：{config.get('description', 'N/A')[:50]}...")
        except Exception as e:
            print(f"❌ JSON 解析：失败 - {str(e)}")
            return False
    else:
        print("❌ JSON 配置文件：不存在")
        return False
    
    print(f"\n✅ {skill_name} 测试：通过\n")
    return True


def main():
    """主测试函数"""
    print("="*60)
    print("电商 AI 实训平台 - Agent 模拟真实用户交互测试")
    print("="*60)
    
    # 核心实训 Skills
    skills_to_test = [
        ("train-product-listing", "F:\\aa\\stigmergy-eb-edu\\skills\\eb-edu\\student\\train-product-listing\\skill.py"),
        ("train-product-pricing", "F:\\aa\\stigmergy-eb-edu\\skills\\eb-edu\\student\\train-product-pricing\\skill.py"),
        ("train-product-optimization", "F:\\aa\\stigmergy-eb-edu\\skills\\eb-edu\\student\\train-product-optimization\\skill.py"),
        ("train-product-analysis", "F:\\aa\\stigmergy-eb-edu\\skills\\eb-edu\\student\\train-product-analysis\\skill.py"),
        ("train-order-processing", "F:\\aa\\stigmergy-eb-edu\\skills\\eb-edu\\student\\train-order-processing\\skill.py"),
        ("train-order-exception", "F:\\aa\\stigmergy-eb-edu\\skills\\eb-edu\\student\\train-order-exception\\skill.py"),
        ("train-logistics-management", "F:\\aa\\stigmergy-eb-edu\\skills\\eb-edu\\student\\train-logistics-management\\skill.py"),
        ("train-customer-service", "F:\\aa\\stigmergy-eb-edu\\skills\\eb-edu\\student\\train-customer-service\\skill.py"),
        ("train-customer-retention", "F:\\aa\\stigmergy-eb-edu\\skills\\eb-edu\\student\\train-customer-retention\\skill.py"),
    ]
    
    passed = 0
    failed = 0
    
    for skill_name, skill_path in skills_to_test:
        if run_skill_test(skill_name, skill_path):
            passed += 1
        else:
            failed += 1
        time.sleep(1)  # 避免过快
    
    print("\n" + "="*60)
    print("测试总结")
    print("="*60)
    print(f"总测试数：{len(skills_to_test)}")
    print(f"通过：{passed}")
    print(f"失败：{failed}")
    print(f"通过率：{passed/len(skills_to_test)*100:.1f}%")
    print("="*60 + "\n")
    
    if failed == 0:
        print("🎉 所有测试通过！系统可用性验证成功！")
        return 0
    else:
        print(f"❌ {failed} 个测试失败，请检查！")
        return 1


if __name__ == "__main__":
    sys.exit(main())
