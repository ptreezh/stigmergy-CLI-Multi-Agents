"""
Codex CLI Adapter Package

Slash command and MCP extension system based on OpenAI Codex API
Supports native integration and cross CLI call functionality
"""

from .slash_command_adapter import CodexSlashCommandAdapter
from .mcp_server import CrossCliMCPServer

__all__ = ['CodexSlashCommandAdapter', 'CrossCliMCPServer']