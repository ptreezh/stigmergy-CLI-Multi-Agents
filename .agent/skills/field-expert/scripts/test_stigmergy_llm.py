#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试 stigmergy 调用宿主 LLM
"""

import subprocess
import json
from pathlib import Path


def test_stigmergy_qwen():
    """测试 stigmergy qwen 调用"""
    prompt = """你是布迪厄场域理论专家。请基于以下数据进行场域边界分析，输出JSON格式：

西游记文本包含佛界、天庭、人间、取经团队、妖界等场域。
核心行动者包括如来佛祖、观音菩萨、玉皇大帝、唐僧、孙悟空等。

请识别这5个场域的边界标识和进入条件。
输出JSON格式：
{
  "fields": [
    {"name": "场域名称", "core_actors": ["核心行动者1", "核心行动者2"], "boundary_markers": ["边界标识1", "边界标识2"]}
  ]
}"""
    
    print("=" * 60)
    print("测试 stigmergy qwen 调用")
    print("=" * 60)
    
    result = subprocess.run(
        ['stigmergy', 'qwen', prompt],
        capture_output=True,
        text=True,
        shell=True
    )
    
    print(f"\nReturn Code: {result.returncode}")
    print(f"\n--- STDOUT ---")
    print(result.stdout[:3000] if result.stdout else "(empty)")
    print(f"\n--- STDERR ---")
    print(result.stderr if result.stderr else "(empty)")
    
    return result.returncode == 0


def test_stigmergy_call_skill():
    """测试 stigmergy call skill"""
    print("\n" + "=" * 60)
    print("测试 stigmergy call skill")
    print("=" * 60)
    
    # 测试不同的 stigmergy 命令
    commands = [
        ['stigmergy', 'iflow', 'skill', 'list'],
        ['stigmergy', 'call', 'skill', 'field-analysis'],
    ]
    
    for cmd in commands:
        print(f"\n执行: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        print(f"Return Code: {result.returncode}")
        print(f"Output: {result.stdout[:500] if result.stdout else '(empty)'}")
        if result.stderr:
            print(f"Stderr: {result.stderr[:200]}")


def main():
    print("\n" + "=" * 60)
    print("  测试宿主 LLM 调用机制")
    print("=" * 60)
    
    # 测试1: 直接调用 qwen
    success1 = test_stigmergy_qwen()
    
    # 测试2: stigmergy skill 命令
    test_stigmergy_call_skill()
    
    print("\n" + "=" * 60)
    print("  测试完成")
    print("=" * 60)
    
    if success1:
        print("\n✅ stigmergy qwen 调用成功！")
        print("可以继续步骤2-5的LLM分析")
    else:
        print("\n⚠️ stigmergy 调用有问题")


if __name__ == "__main__":
    main()
