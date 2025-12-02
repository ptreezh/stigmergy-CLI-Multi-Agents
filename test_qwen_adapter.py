#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Qwen CLI 适配器导入测试
验证Qwen适配器是否可以正确导入
"""

import sys
import os

def test_qwen_adapter_import():
    """测试Qwen适配器是否可以正确导入"""
    try:
        print("测试Qwen适配器导入...")
        # 添加适配器路径到Python路径
        adapters_path = os.path.join(os.path.dirname(__file__), 'src', 'adapters')
        if adapters_path not in sys.path:
            sys.path.insert(0, adapters_path)
        
        # 尝试导入Qwen适配器
        from qwen import QwenCodeInheritanceAdapter
        print("[PASS] Qwen适配器导入成功")
        return True
    except Exception as e:
        print(f"[FAIL] Qwen适配器导入失败: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_qwen_adapter_import()
    sys.exit(0 if success else 1)