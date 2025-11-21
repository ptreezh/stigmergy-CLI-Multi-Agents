#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
调试路由功能
"""

import re

def debug_route_extraction():
    """调试路由提取逻辑"""
    # 定义路由模式 - 包含更多模式
    route_patterns = {
        'claude': [
            r'(?i)用claude\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
            r'(?i)让claude\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
            r'(?i)请claude\s*(?:帮忙|写|翻译|解释|分析|优化)'
        ],
        'gemini': [
            r'(?i)用gemini\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
            r'(?i)让gemini\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
            r'(?i)请gemini\s*(?:帮忙|写|翻译|解释|分析|优化)'
        ],
        'qwen': [
            r'(?i)用qwen\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
            r'(?i)让qwen\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
            r'(?i)请qwen\s*(?:帮忙|写|翻译|解释|分析|优化)'
        ],
        'kimi': [
            r'(?i)用kimi\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
            r'(?i)让kimi\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
            r'(?i)请kimi\s*(?:帮忙|写|翻译|解释|分析|优化)'
        ],
        'codebuddy': [
            r'(?i)用codebuddy\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
            r'(?i)让codebuddy\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
            r'(?i)请codebuddy\s*(?:帮忙|写代码|代码|分析|优化)'
        ],
        'copilot': [
            r'(?i)用copilot\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
            r'(?i)让copilot\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
            r'(?i)请copilot\s*(?:帮忙|写代码|代码|分析|优化)'
        ],
        'qoder': [
            r'(?i)用qoder\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
            r'(?i)让qoder\s*(?:帮我|帮我写代码|帮我分析|写|翻译|解释|分析|代码|优化)',
            r'(?i)请qoder\s*(?:帮忙|写代码|代码|分析|优化)'
        ],
        'iflow': [
            r'(?i)用iflow\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
            r'(?i)让iflow\s*(?:帮我|帮我写|帮我翻译|帮我解释|写|翻译|解释|分析|优化)',
            r'(?i)请iflow\s*(?:帮忙|写|翻译|解释|分析|优化)'
        ]
    }

    test_inputs = [
        '用gemini帮我翻译Hello World',
        '让qwen帮我写代码',
        '请claude帮我分析需求',
        '用kimi生成文档',
        '让codebuddy帮我优化代码',
        '正常请求，不包含路由',
        'USE GEMINI TO TRANSLATE',  # 测试大小写
        '用CLAUD帮我分析'  # 测试大小写模糊
    ]

    for user_input in test_inputs:
        print(f"\n测试: '{user_input}'")
        user_lower = user_input.lower()
        
        found_match = False
        for target_tool, patterns in route_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, user_lower)
                if match:
                    print(f"  ✓ 匹配到工具: {target_tool}")
                    print(f"  匹配文本: '{match.group(0)}'")
                    
                    # 提取剩余输入
                    remaining = user_input.replace(match.group(0), '', 1).strip()
                    print(f"  剩余输入: '{remaining}'")
                    
                    # 清理前导词
                    remaining_cleaned = re.sub(r'^(?:用|让|请|麻烦|帮我|帮我写|帮我翻译|帮我解释|帮忙|代我|替我|使用|请用)\s*', '', remaining, flags=re.IGNORECASE).strip()
                    print(f"  清理后: '{remaining_cleaned}'")
                    
                    # 更彻底的清理
                    for directive in ['帮我', '帮我写', '帮我翻译', '帮我解释', '帮忙', '代我', '替我', '帮我分析', '帮我优化']:
                        remaining_cleaned = remaining_cleaned.replace(directive, '', 1)
                    remaining_cleaned = ' '.join(remaining_cleaned.split()).strip()
                    print(f"  最终: '{remaining_cleaned}'")
                    
                    result = {
                        'target_tool': target_tool,
                        'remaining_input': remaining_cleaned,
                        'original_input': user_input
                    }
                    print(f"  结果: {result}")
                    
                    found_match = True
                    break
            if found_match:
                break
        
        if not found_match:
            print("  - 未找到匹配的路由模式")


if __name__ == "__main__":
    debug_route_extraction()