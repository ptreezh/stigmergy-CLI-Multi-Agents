"""
Gemini CLI 适配器包

基于 Gemini CLI 官方 Extension 系统的原生集成
完全无抽象层设计
"""

from .standalone_gemini_adapter import get_standalone_gemini_adapter, StandaloneGeminiAdapter

# 向后兼容的别名
GeminiExtensionAdapter = StandaloneGeminiAdapter

__all__ = ['StandaloneGeminiAdapter', 'get_standalone_gemini_adapter', 'GeminiExtensionAdapter']