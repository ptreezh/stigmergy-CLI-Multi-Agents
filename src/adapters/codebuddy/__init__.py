"""
CodeBuddy CLI Adapter Package

Native integration based on CodeBuddy CLI's official Skills Hook system
Complete no abstraction layer design
"""

from .standalone_codebuddy_adapter import get_standalone_codebuddy_adapter, StandaloneCodeBuddyAdapter

# 向后兼容的别名
CodeBuddySkillsHookAdapter = StandaloneCodeBuddyAdapter

__all__ = ['StandaloneCodeBuddyAdapter', 'get_standalone_codebuddy_adapter', 'CodeBuddySkillsHookAdapter']