"""
Claude CLI Adapter Package

Native integration based on Claude CLI's official Hook system
Supports multiple implementation approaches, all without abstraction layer
"""

from .standalone_claude_adapter import get_standalone_claude_adapter, StandaloneClaudeAdapter

# 向后兼容的别名
ClaudeHookAdapter = StandaloneClaudeAdapter

__all__ = ['StandaloneClaudeAdapter', 'get_standalone_claude_adapter', 'ClaudeHookAdapter']