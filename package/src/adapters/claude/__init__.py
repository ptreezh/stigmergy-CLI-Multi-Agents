"""
Claude CLI 适配器包

基于 Claude CLI 官方 Hook 系统的原生集成
支持多种实现方式，全部无抽象层
"""

from .standalone_claude_adapter import get_standalone_claude_adapter, StandaloneClaudeAdapter

# 向后兼容的别名
ClaudeHookAdapter = StandaloneClaudeAdapter

__all__ = ['StandaloneClaudeAdapter', 'get_standalone_claude_adapter', 'ClaudeHookAdapter']