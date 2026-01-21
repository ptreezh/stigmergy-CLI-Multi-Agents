"""
Gemini CLI Adapter Package

Native integration based on Gemini CLI's official Extension system
Complete no abstraction layer design
"""

from .standalone_gemini_adapter import get_standalone_gemini_adapter, StandaloneGeminiAdapter

# 向后兼容的别名
GeminiExtensionAdapter = StandaloneGeminiAdapter

__all__ = ['StandaloneGeminiAdapter', 'get_standalone_gemini_adapter', 'GeminiExtensionAdapter']