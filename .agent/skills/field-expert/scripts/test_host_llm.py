#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试宿主 LLM 调用机制
"""

import json
import sys
from pathlib import Path

# 路径配置
SKILL_DIR = Path(__file__).parent
PROJECT_ROOT = SKILL_DIR.parent.parent

# 读取提示词模板
PROMPT_FILE = SKILL_DIR / "prompts" / "boundary_analysis.txt"
INPUT_FILE = SKILL_DIR / "field_analysis_workflow" / "input" / "processed" / "combined_input.json"


def test_prompt_loading():
    """测试提示词加载"""
    print("=" * 60)
    print("测试1: 加载提示词模板")
    print("=" * 60)
    
    if not PROMPT_FILE.exists():
        print(f"❌ 提示词文件不存在: {PROMPT_FILE}")
        return False
    
    with open(PROMPT_FILE, 'r', encoding='utf-8') as f:
        prompt_content = f.read()
    
    print(f"✅ 提示词文件存在: {PROMPT_FILE}")
    print(f"   大小: {len(prompt_content)} 字符")
    print(f"\n前500字符预览:\n{prompt_content[:500]}")
    return True


def test_input_data_loading():
    """测试输入数据加载"""
    print("\n" + "=" * 60)
    print("测试2: 加载输入数据")
    print("=" * 60)
    
    if not INPUT_FILE.exists():
        print(f"❌ 输入文件不存在: {INPUT_FILE}")
        return False
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        input_data = json.load(f)
    
    print(f"✅ 输入文件存在: {INPUT_FILE}")
    print(f"   大小: {len(json.dumps(input_data, ensure_ascii=False))} 字符")
    
    metadata = input_data.get("metadata", {})
    print(f"\n数据摘要:")
    print(f"   - 扎根理论: {metadata.get('grounded_theory_count', 0)} 个文件")
    print(f"   - 社会网络: {metadata.get('social_network_count', 0)} 个文件")
    print(f"   - ESOC框架: {metadata.get('esoc_framework_count', 0)} 个文件")
    print(f"   - 总文件数: {metadata.get('total_files', 0)}")
    return True


def test_context_injection():
    """测试上下文注入"""
    print("\n" + "=" * 60)
    print("测试3: 上下文注入（{context} 替换）")
    print("=" * 60)
    
    # 读取提示词
    with open(PROMPT_FILE, 'r', encoding='utf-8') as f:
        prompt_template = f.read()
    
    # 读取输入数据
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        input_data = json.load(f)
    
    # 替换 {context}
    if "{context}" in prompt_template:
        context_str = json.dumps(input_data, ensure_ascii=False, indent=2)
        # 截取部分内容，避免过长
        if len(context_str) > 5000:
            context_str = context_str[:5000] + "\n... (内容已截断)"
        
        final_prompt = prompt_template.replace("{context}", context_str)
        print("✅ 上下文注入成功")
        print(f"\n注入后提示词长度: {len(final_prompt)} 字符")
        print(f"\n前800字符预览:\n{final_prompt[:800]}")
    else:
        print("⚠️ 提示词中未找到 {context} 占位符")
    return True


def generate_llm_request():
    """生成要发送给宿主 LLM 的请求"""
    print("\n" + "=" * 60)
    print("测试4: 生成宿主 LLM 请求")
    print("=" * 60)
    
    # 读取提示词模板
    with open(PROMPT_FILE, 'r', encoding='utf-8') as f:
        prompt_template = f.read()
    
    # 读取输入数据
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        input_data = json.load(f)
    
    # 替换 {context}
    context_str = json.dumps(input_data, ensure_ascii=False, indent=2)
    if len(context_str) > 10000:
        context_str = context_str[:10000] + "\n... (内容已截断)"
    
    final_prompt = prompt_template.replace("{context}", context_str)
    
    print("✅ 请求已生成")
    print(f"\n完整提示词长度: {len(final_prompt)} 字符")
    
    # 保存请求
    request_file = PROJECT_ROOT / "test_data" / "llm_request_boundary.json"
    request_data = {
        "system_prompt": "你是布迪厄场域理论专家。请基于以下数据进行场域边界分析，输出JSON格式。",
        "user_prompt": final_prompt,
        "output_format": "JSON",
        "input_summary": input_data.get("metadata", {})
    }
    
    with open(request_file, 'w', encoding='utf-8') as f:
        json.dump(request_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 请求已保存: {request_file}")
    return request_data


def main():
    """主测试函数"""
    print("\n" + "=" * 60)
    print("  宿主 LLM 调用机制测试")
    print("  测试环境: iFlow CLI")
    print("=" * 60)
    
    # 执行测试
    test_prompt_loading()
    test_input_data_loading()
    test_context_injection()
    request = generate_llm_request()
    
    print("\n" + "=" * 60)
    print("  测试完成")
    print("=" * 60)
    
    print("\n📋 下一步:")
    print("   1. 将生成的请求发送给宿主 LLM")
    print("   2. 宿主 LLM 返回 JSON 结果")
    print("   3. 写入 boundary_results.json")
    print("   4. 继续步骤3-6")
    
    print("\n💡 可能的宿主 LLM 调用方式:")
    print("   - task 工具: 发送给子智能体处理")
    print("   - 直接对话: 宿主 LLM 读取文件后分析")
    print("   - API 调用: 通过外部 API 发送请求")


if __name__ == "__main__":
    main()
