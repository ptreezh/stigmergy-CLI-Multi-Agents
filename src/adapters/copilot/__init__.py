"""
Copilot CLI Adapter Package

Native integration based on Copilot CLI's official MCP system
Complete no abstraction layer design
"""

from .standalone_copilot_adapter import get_standalone_copilot_adapter, StandaloneCopilotAdapter

# 向后兼容的别名
CopilotMCPAdapter = StandaloneCopilotAdapter

__all__ = ['StandaloneCopilotAdapter', 'get_standalone_copilot_adapter', 'CopilotMCPAdapter']