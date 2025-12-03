"""
Claude CLI Adapter Package

Native integration based on Claude CLI official Hook system
Supports multiple implementation approaches, all without abstraction layers
"""

from .standalone_claude_adapter import get_standalone_claude_adapter, StandaloneClaudeAdapter

# Backward compatible alias
ClaudeHookAdapter = StandaloneClaudeAdapter

__all__ = ['StandaloneClaudeAdapter', 'get_standalone_claude_adapter', 'ClaudeHookAdapter']