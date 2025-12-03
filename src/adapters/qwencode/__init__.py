"""
QwenCode CLI Adapter Package

Native integration based on QwenCode CLI official Class Inheritance system
Completely no abstraction layer design
"""

from .standalone_qwencode_adapter import get_standalone_qwencode_adapter, StandaloneQwenCodeAdapter

# Backward compatible alias
QwenCodeInheritanceAdapter = StandaloneQwenCodeAdapter

__all__ = ['StandaloneQwenCodeAdapter', 'get_standalone_qwencode_adapter', 'QwenCodeInheritanceAdapter']