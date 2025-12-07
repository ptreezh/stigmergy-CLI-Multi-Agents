"""
Qwen CLI 适配器包

基于 Qwen CLI 官方 Class Inheritance 系统的原生集成
完全无抽象层设计
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from qwencode.standalone_qwencode_adapter import get_standalone_qwencode_adapter, StandaloneQwenCodeAdapter

# 向后兼容的别名
QwenCodeInheritanceAdapter = StandaloneQwenCodeAdapter

__all__ = ['StandaloneQwenCodeAdapter', 'get_standalone_qwencode_adapter', 'QwenCodeInheritanceAdapter']