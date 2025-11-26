"""
Codex CLI 适配器包

基于 OpenAI Codex API 的斜杠命令和 MCP 扩展系统
支持原生集成和跨 CLI 调用功能
"""

from .slash_command_adapter import CodexSlashCommandAdapter
from .mcp_server import CrossCliMCPServer

__all__ = ['CodexSlashCommandAdapter', 'CrossCliMCPServer']