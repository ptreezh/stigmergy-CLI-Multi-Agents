"""
Cline CLI Configuration Module

Defines configuration constants and utilities for Cline CLI integration
"""

import os
from pathlib import Path
from typing import Dict, Any, List

# Cline CLI Configuration
CLINE_CONFIG = {
    "name": "cline",
    "display_name": "Cline CLI",
    "version": "1.0.0",
    "mcp_protocol_version": "2024-11-05",
    
    # Installation and execution
    "npm_package": "cline",
    "install_command": "npm install -g cline",
    "execution_command": "cline",
    "npx_command": "npx -y cline",
    
    # Configuration files
    "mcp_settings_file": "cline_mcp_settings.json",
    "config_directory": ".cline",
    "mcp_server_directory": "~/Documents/Cline/MCP",
    
    # MCP Protocol settings
    "mcp_transport_mechanisms": ["stdio", "http"],
    "mcp_default_timeout": 60,  # seconds
    "mcp_max_retries": 3,
    
    # Cross-CLI patterns
    "intent_patterns": {
        "chinese": [
            r"请用cline\s*帮我?([^。！？\n]*)",
            r"调用cline\s*来([^。！？\n]*)",
            r"用cline\s*帮我?([^。！？\n]*)"
        ],
        "english": [
            r"use\s+cline\s+to\s+([^.\n!?]*)",
            r"call\s+cline\s+to\s+([^.\n!?]*)",
            r"ask\s+cline\s+for\s+([^.\n!?]*)"
        ]
    },
    
    # Tool capabilities
    "supported_tools": [
        "file_operations",
        "terminal_execution", 
        "browser_automation",
        "tool_creation",
        "context_management",
        "mcp_server_management"
    ],
    
    # API providers supported by Cline
    "supported_providers": [
        "anthropic",
        "openai", 
        "google",
        "openrouter",
        "aws_bedrock",
        "azure",
        "gcp_vertex",
        "cerebras",
        "groq",
        "local_ollama",
        "lm_studio"
    ]
}

def get_cline_config_path() -> Path:
    """Get Cline configuration directory path"""
    home = Path.home()
    return home / ".config" / "cline"

def get_mcp_settings_path() -> Path:
    """Get MCP settings file path"""
    return get_cline_config_path() / CLINE_CONFIG["mcp_settings_file"]

def get_mcp_server_directory() -> Path:
    """Get MCP server directory path"""
    home = Path.home()
    return home / "Documents" / "Cline" / "MCP"

def create_default_mcp_settings() -> Dict[str, Any]:
    """Create default MCP settings for Cline integration"""
    return {
        "mcpServers": {
            "stigmergy": {
                "command": "python",
                "args": ["-m", "src.adapters.cline.mcp_server"],
                "env": {
                    "STIGMERGY_PROJECT_ROOT": os.getcwd(),
                    "STIGMERGY_COLLABORATION_MODE": "enabled"
                },
                "disabled": False,
                "autoStart": True
            }
        },
        "globalSettings": {
            "timeout": CLINE_CONFIG["mcp_default_timeout"],
            "maxRetries": CLINE_CONFIG["mcp_max_retries"],
            "transport": "stdio"
        }
    }