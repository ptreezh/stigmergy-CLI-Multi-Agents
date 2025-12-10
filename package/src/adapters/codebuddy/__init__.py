"""
CodeBuddy CLI 适配器包

基于 CodeBuddy CLI 官方 Skills Hook 系统的原生集成
完全无抽象层设计
"""

from .standalone_codebuddy_adapter import get_standalone_codebuddy_adapter, StandaloneCodeBuddyAdapter

# 向后兼容的别名
CodeBuddySkillsHookAdapter = StandaloneCodeBuddyAdapter

__all__ = ['StandaloneCodeBuddyAdapter', 'get_standalone_codebuddy_adapter', 'CodeBuddySkillsHookAdapter']