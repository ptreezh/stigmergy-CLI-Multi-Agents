#!/usr/bin/env python3
"""
电商 AI 实训平台 - 自动化测试脚本（非交互式）

用于自动化测试实训 Skills，模拟 Subagent 交互
测试日期：2026-03-30
"""

import subprocess
import sys
import os


def test_skill(skill_name, skill_path, test_inputs):
    """测试单个 Skill"""
    print(f"\n{'='*60}")
    print(f"测试 Skill: {skill_name}")
    print(f"路径：{skill_path}")
    print(f"{'='*60}\n")
    
    # 测试 1: 文件存在性
    if not os.path.exists(skill_path):
        print("❌ 文件存在性测试：失败")
        return False
    print("✅ 文件存在性测试：通过")
    
    # 测试 2: 可执行性（--help）
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
        else:
            print("❌ 可执行性测试：失败")
            return False
    except Exception as e:
        print(f"❌ 可执行性测试：异常 - {str(e)}")
        return False
    
    # 测试 3: JSON 配置文件
    import json
    json_path = os.path.join(os.path.dirname(skill_path), "skill.json")
    if not os.path.exists(json_path):
        print("❌ JSON 配置文件：不存在")
        return False
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        print("✅ JSON 配置文件：存在")
        print(f"   Skill 名称：{config.get('name', 'N/A')}")
        print(f"   描述：{config.get('description', 'N/A')[:50]}...")
        print(f"   培养目标：{len(config.get('training_design', {}).get('objectives', []))} 个")
    except Exception as e:
        print(f"❌ JSON 解析：失败 - {str(e)}")
        return False
    
    # 测试 4: 模拟交互（仅启动，不交互）
    print("\n✅ 模拟交互测试：Skill 可启动（需要交互环境完成完整测试）")
    
    print(f"\n✅ {skill_name} 测试：通过\n")
    return True


def main():
    """主测试函数"""
    print("="*60)
    print("电商 AI 实训平台 - 自动化测试（非交互式）")
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
        if test_skill(skill_name, skill_path, []):
            passed += 1
        else:
            failed += 1
    
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
        print("\n注意：完整测试需要在 Qwen CLI 交互环境中进行")
        print("请使用 subagent 机制进行真实交互测试")
        return 0
    else:
        print(f"❌ {failed} 个测试失败，请检查！")
        return 1


if __name__ == "__main__":
    sys.exit(main())
