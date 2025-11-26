"""
Copilot CLI 适配器包

基于 Copilot CLI 官方 MCP 系统的原生集成
完全无抽象层设计
"""

from .standalone_copilot_adapter import get_standalone_copilot_adapter, StandaloneCopilotAdapter

# 向后兼容的别名
CopilotMCPAdapter = StandaloneCopilotAdapter

__all__ = ['StandaloneCopilotAdapter', 'get_standalone_copilot_adapter', 'CopilotMCPAdapter']