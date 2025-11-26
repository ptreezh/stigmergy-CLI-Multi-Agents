"""
QwenCode CLI 适配器包

基于 QwenCode CLI 官方 Class Inheritance 系统的原生集成
完全无抽象层设计
"""

from .standalone_qwencode_adapter import get_standalone_qwencode_adapter, StandaloneQwenCodeAdapter

# 向后兼容的别名
QwenCodeInheritanceAdapter = StandaloneQwenCodeAdapter

__all__ = ['StandaloneQwenCodeAdapter', 'get_standalone_qwencode_adapter', 'QwenCodeInheritanceAdapter']