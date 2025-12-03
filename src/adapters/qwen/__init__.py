"""
Qwen CLI Adapter Package

Native integration based on Qwen CLI official Class Inheritance system
Completely no abstraction layer design
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from qwencode.standalone_qwencode_adapter import get_standalone_qwencode_adapter, StandaloneQwenCodeAdapter

# Backward compatible alias
QwenCodeInheritanceAdapter = StandaloneQwenCodeAdapter

__all__ = ['StandaloneQwenCodeAdapter', 'get_standalone_qwencode_adapter', 'QwenCodeInheritanceAdapter']