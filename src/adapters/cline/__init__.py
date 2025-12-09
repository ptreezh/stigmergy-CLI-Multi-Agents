"""
Cline CLI Adapter for Stigmergy System

This module provides integration with Cline CLI through MCP (Model Context Protocol)
support, enabling cross-CLI collaboration and tool extension capabilities.

Key Features:
- MCP server integration for tool management
- Cross-CLI task delegation
- Context preservation across sessions
- Real-time collaboration with other CLI tools
"""

from .standalone_cline_adapter import (
    StandaloneClineAdapter,
    get_standalone_cline_adapter,
    get_cline_hook_adapter
)
from .config import CLINE_CONFIG

__version__ = "1.0.0"
__author__ = "Stigmergy CLI Multi-Agents System"

__all__ = [
    "StandaloneClineAdapter", 
    "get_standalone_cline_adapter",
    "get_cline_hook_adapter",
    "CLINE_CONFIG"
]