#!/usr/bin/env python3
"""
Copilot CLI Cross-CLI Integration Installer

Automatically installs and configures Copilot CLI cross-CLI integration features
including MCP server registration, custom agent creation, and permission configuration
"""

import os
import json
import sys
import logging
import shutil
import argparse
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class CopilotIntegrationInstaller:
    """Copilot CLI Integration Installer"""

    def __init__(self, config_path: Optional[str] = None, force: bool = False):
        """
        Initialize the installer

        Args:
            config_path: Configuration file path, if None uses default path
            force: Whether to force overwrite existing config
        """
        self.script_dir = Path(__file__).parent
        # Use script directory as project root for standalone installation
        self.project_root = self.script_dir.parent.parent.parent
        self.force = force

        if config_path:
            self.config_path = Path(config_path)
        else:
            # In npx environment, may need to search for config file in multiple locations
            possible_paths = [
                self.script_dir / "config.json",  # Standard location - should be the most likely path
                self.script_dir.parent / "copilot" / "config.json",  # In adapters/copilot/
                Path(__file__).parent / "config.json",  # Using script directory - also standard location
            ]

            # Check environment variables to get project root directory
            project_root_env = os.environ.get('STIGMERGY_PROJECT_ROOT', '')
            if project_root_env:
                # Add environment variable specified path to search list
                env_config_path = Path(project_root_env) / "src" / "adapters" / "copilot" / "config.json"
                possible_paths.append(env_config_path)

            for config_path_option in possible_paths:
                if config_path_option.exists():
                    self.config_path = config_path_option
                    logger.info("Using config file: {}".format(config_path_option))
                    break
            else:
                # If all options fail, use default location and dynamically create config
                self.config_path = self.script_dir / "config.json"

                # Create default config content
                default_config = {
                    "name": "copilot",
                    "displayName": "GitHub Copilot CLI",
                    "version": "1.0.0",
                    "integration_type": "mcp_server",
                    "config_file": "~/.config/copilot/config.json",
                    "global_doc": "copilot.md",
                    "description": "GitHub Copilot CLI MCP Server Integration Adapter",
                    "mcp_config": {
                        "server_name": "stigmergy-copilot-integration",
                        "command": "python",
                        "args": [
                            "src/adapters/copilot/mcp_server.py"
                        ],
                        "environment": {
                            "PYTHONPATH": ".",
                            "STIGMERGY_CONFIG_PATH": "~/.stigmergy",
                            "COPILOT_ADAPTER_MODE": "cross_cli"
                        },
                        "health_check_interval": 30,
                        "timeout": 60
                    },
                    "custom_agents": {
                        "cross_cli_caller": {
                            "name": "CrossCLICaller",
                            "description": "Cross-CLI Tool Calling Agent",
                            "version": "1.0.0",
                            "tools": [
                                "cross_cli_execute",
                                "get_available_clis",
                                "check_cli_status"
                            ],
                            "permissions": [
                                "execute_external_cli",
                                "read_config",
                                "write_logs"
                            ]
                        }
                    },
                    "supported_cli_tools": [
                        "claude",
                        "gemini",
                        "qwencode",
                        "iflow",
                        "qoder",
                        "codebuddy",
                        "codex"
                    ],
                    "permissions": {
                        "execute_external_cli": {
                            "description": "Execute external CLI tools",
                            "level": "high",
                            "requires_approval": False
                        },
                        "read_config": {
                            "description": "Read CLI config files",
                            "level": "medium",
                            "requires_approval": False
                        },
                        "write_logs": {
                            "description": "Write to log files",
                            "level": "low",
                            "requires_approval": False
                        }
                    },
                    "adapter": {
                        "name": "Copilot MCP Integration Adapter",
                        "version": "1.0.0",
                        "type": "mcp_server",
                        "module_path": "src.adapters.copilot.mcp_adapter",
                        "class_name": "CopilotMCPIntegrationAdapter",
                        "features": [
                            "cross_cli_detection",
                            "command_routing",
                            "result_formatting",
                            "collaboration_tracking"
                        ]
                    }
                }

                # Create config file
                try:
                    self.script_dir.mkdir(parents=True, exist_ok=True)
                    with open(self.config_path, 'w', encoding='utf-8') as f:
                        json.dump(default_config, f, indent=2, ensure_ascii=False)
                    logger.info("[OK] Created default config file: {}".format(self.config_path))
                except Exception as e:
                    logger.error("Failed to create default config file: {}".format(e))
                    raise

                logger.info("Using dynamically created config file: {}".format(self.config_path))

        self.config = self._load_config()

        # Copilot related paths
        self.home_dir = Path.home()
        self.copilot_dir = self.home_dir / ".copilot"
        self.mcp_config_file = self.copilot_dir / "mcp-config.json"
        self.custom_agents_dir = self.copilot_dir / "agents"

        # Project paths - fallback to script directory if src doesn't exist
        self.src_dir = self.project_root / "src"
        if not self.src_dir.exists():
            self.src_dir = self.script_dir

    def _load_config(self) -> Dict[str, Any]:
        """Load config file"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error("Failed to load config file: {}".format(e))
            sys.exit(1)

    def install(self) -> bool:
        """
        Execute full installation process

        Returns:
            bool: Whether installation succeeded
        """
        try:
            logger.info("Starting Copilot CLI cross-CLI integration installation...")

            # 1. Check environment
            if not self._check_environment():
                return False

            # 2. Create config directories
            if not self._create_directories():
                return False

            # 3. Install MCP server config
            if not self._install_mcp_server():
                return False

            # 4. Create custom agents
            if not self._create_custom_agents():
                return False

            # 5. Setup permissions config
            if not self._setup_permissions():
                return False

            # 6. Create global Cross-CLI documentation
            self._create_global_cross_cli_documentation()

            # 7. Verify installation
            if not self._verify_installation():
                return False

            logger.info("[OK] Copilot CLI cross-CLI integration installed successfully!")
            self._print_usage_instructions()
            return True

        except Exception as e:
            logger.error("Installation failed: {}".format(e))
            return False

    def _check_environment(self) -> bool:
        """Check installation environment"""
        logger.info("Checking installation environment...")

        # Check Python version
        if sys.version_info < (3, 8):
            logger.error("Python 3.8 or higher required")
            return False

        # Check if Copilot CLI is installed
        copilot_path = shutil.which("copilot")
        if not copilot_path:
            logger.warning("Copilot command not found, please ensure GitHub Copilot CLI is installed")
            logger.info("Installation method: npm install -g @github/copilot")

        # Check adapter file
        adapter_file = self.script_dir / "mcp_adapter.py"
        if not adapter_file.exists():
            logger.warning("Adapter file does not exist: {}".format(adapter_file))
            logger.info("Continuing without adapter file...")

        logger.info("[OK] Environment check passed")
        return True

    def _create_directories(self) -> bool:
        """Create necessary directories"""
        logger.info("Creating config directories...")

        directories = [
            self.copilot_dir,
            self.custom_agents_dir,
            self.copilot_dir / "logs",
            self.copilot_dir / "sessions"
        ]

        for directory in directories:
            try:
                directory.mkdir(parents=True, exist_ok=True)
                logger.debug("Created directory: {}".format(directory))
            except Exception as e:
                logger.error("Failed to create directory {}: {}".format(directory, e))
                return False

        logger.info("[OK] Directories created successfully")
        return True

    def _install_mcp_server(self) -> bool:
        """Install MCP server config"""
        logger.info("Installing MCP server config...")

        try:
            # Read existing MCP config
            mcp_config = self._load_existing_mcp_config()

            # Add our MCP server
            mcp_servers = mcp_config.get('mcpServers', {})
            server_name = self.config['mcp_config']['server_name']

            if server_name in mcp_servers and not self.force:
                logger.info("MCP server '{}' already exists, skipping...".format(server_name))
                return True

            # Build MCP server config
            # Use script directory as base path
            mcp_server_config = {
                "command": self.config['mcp_config']['command'],
                "args": self.config['mcp_config']['args'],
                "env": self.config['mcp_config']['environment']
            }

            # Add Python path to environment variables
            python_path = str(self.script_dir)
            if 'PYTHONPATH' in mcp_server_config['env']:
                mcp_server_config['env']['PYTHONPATH'] = "{}:{}".format(python_path, mcp_server_config['env']['PYTHONPATH'])
            else:
                mcp_server_config['env']['PYTHONPATH'] = python_path

            mcp_servers[server_name] = mcp_server_config
            mcp_config['mcpServers'] = mcp_servers

            # Save config
            with open(self.mcp_config_file, 'w', encoding='utf-8') as f:
                json.dump(mcp_config, f, indent=2, ensure_ascii=False)

            logger.info("[OK] MCP server config saved to: {}".format(self.mcp_config_file))
            return True

        except Exception as e:
            logger.error("Failed to install MCP server: {}".format(e))
            return False

    def _load_existing_mcp_config(self) -> Dict[str, Any]:
        """Load existing MCP config"""
        if self.mcp_config_file.exists():
            try:
                with open(self.mcp_config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning("Failed to read existing MCP config: {}".format(e))

        # Return default config
        return {
            "mcpServers": {}
        }

    def _create_custom_agents(self) -> bool:
        """Create custom agents"""
        logger.info("Creating custom agents...")

        try:
            for agent_name, agent_config in self.config['custom_agents'].items():
                agent_file = self.custom_agents_dir / "{}.json".format(agent_name)

                if agent_file.exists() and not self.force:
                    logger.info("Agent '{}' already exists, skipping...".format(agent_name))
                    continue

                # Create agent config
                agent_data = {
                    "name": agent_config['name'],
                    "description": agent_config['description'],
                    "version": agent_config['version'],
                    "instructions": self._get_agent_instructions(agent_name),
                    "tools": agent_config['tools'],
                    "permissions": agent_config['permissions']
                }

                with open(agent_file, 'w', encoding='utf-8') as f:
                    json.dump(agent_data, f, indent=2, ensure_ascii=False)

                logger.info("Created agent: {}".format(agent_name))

            logger.info("[OK] Custom agents created successfully")
            return True

        except Exception as e:
            logger.error("Failed to create custom agents: {}".format(e))
            return False

    def _get_agent_instructions(self, agent_name: str) -> str:
        """Get agent instructions"""
        instructions = {
            "cross_cli_caller": """You are a cross-CLI integration agent that helps users collaborate between different AI CLI tools.

When you detect a request to use another CLI tool (like Claude, Gemini, QwenCode, iFlow, etc.):
1. Parse the target CLI and task from the user's request
2. Execute the task using the appropriate CLI tool
3. Return the results in a clear, structured format

Support both Chinese and English collaboration patterns:
- "请用{CLI}帮我{task}" -> Use {CLI} to help with {task}
- "调用{CLI}来{task}" -> Call {CLI} to {task}
- "use {CLI} to {task}" -> Execute {task} with {CLI}
- "call {CLI} to {task}" -> Call {CLI} to execute {task}

Available tools:
- cross_cli_execute: Execute tasks on other CLI tools
- get_available_clis: Get list of available CLI tools
- check_cli_status: Check status of a specific CLI tool

Always maintain the original intent and context of the user's request.
Provide clear, structured results with execution details."""
        }

        return instructions.get(agent_name, "Cross-CLI integration agent")

    def _setup_permissions(self) -> bool:
        """Setup permissions config"""
        logger.info("Setting up permissions config...")

        try:
            permissions_config_file = self.copilot_dir / "permissions.json"

            permissions_config = {
                "version": "1.0",
                "permissions": self.config['permissions'],
                "created_at": datetime.now().isoformat(),
                "adapter_version": self.config['adapter']['version']
            }

            with open(permissions_config_file, 'w', encoding='utf-8') as f:
                json.dump(permissions_config, f, indent=2, ensure_ascii=False)

            logger.info("[OK] Permissions config setup completed")
            return True

        except Exception as e:
            logger.error("Failed to setup permissions config: {}".format(e))
            return False

    def _verify_installation(self) -> bool:
        """Verify installation"""
        logger.info("Verifying installation...")

        # Check MCP config file
        if not self.mcp_config_file.exists():
            logger.error("MCP config file does not exist")
            return False

        # Check custom agents
        for agent_name in self.config['custom_agents'].keys():
            agent_file = self.custom_agents_dir / "{}.json".format(agent_name)
            if not agent_file.exists():
                logger.error("Agent file does not exist: {}".format(agent_file))
                return False

        # Verify MCP config format
        try:
            with open(self.mcp_config_file, 'r', encoding='utf-8') as f:
                mcp_config = json.load(f)

            server_name = self.config['mcp_config']['server_name']
            if server_name not in mcp_config.get('mcpServers', {}):
                logger.error("MCP server config not found: {}".format(server_name))
                return False

        except Exception as e:
            logger.error("Failed to verify MCP config: {}".format(e))
            return False

        logger.info("[OK] Installation verified successfully")
        return True

    def _print_usage_instructions(self):
        """Print usage instructions"""
        print("\n" + "="*60)
        print("Copilot CLI Cross-CLI Integration Installation Complete!")
        print("="*60)
        print("\n[INFO] Usage Instructions:")
        print("1. Start Copilot CLI:")
        print("   copilot")
        print("\n2. Cross-CLI calling examples:")
        print("   Chinese: '请用claude帮我写一个Python脚本'")
        print("   English: 'use gemini to analyze this code'")
        print("\n3. Available agents:")
        for agent_name in self.config['custom_agents'].keys():
            print("   - {}".format(agent_name))
        print("\n4. Supported CLI tools:")
        for cli_tool in self.config['supported_cli_tools']:
            print("   - {}".format(cli_tool))
        print("\nConfig file locations:")
        print("   MCP config: {}".format(self.mcp_config_file))
        print("   Custom agents: {}".format(self.custom_agents_dir))
        print("\nSee project documentation for more information")

    def _create_global_cross_cli_documentation(self):
        """Create global Cross-CLI communication documentation"""
        try:
            doc_content = """# Copilot CLI Cross-CLI Communication Guide

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex, glm4

---
*This document is automatically generated and maintained by Stigmergy CLI*
"""

            doc_path = self.copilot_dir / "CROSS_CLI_GUIDE.md"
            with open(doc_path, 'w', encoding='utf-8') as f:
                f.write(doc_content)

            logger.info("[OK] Created Cross-CLI Communication Guide: {}".format(doc_path))

            # If copilot.md file exists, append Cross-CLI communication hint to the end
            copilot_md_path = self.copilot_dir / "copilot.md"
            if copilot_md_path.exists():
                cross_cli_content = """

## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt <<<Execute the following command in shell: stigmergy <tool_name> <task_description>>>

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex, glm4
"""
                with open(copilot_md_path, 'a', encoding='utf-8') as f:
                    f.write(cross_cli_content)
                logger.info("[OK] Appended Cross-CLI communication hint to COPILLOT.MD")

        except Exception as e:
            logger.warning("Failed to create Cross-CLI Communication Guide: {}".format(e))
        print("="*60)

    def uninstall(self) -> bool:
        """Uninstall integration"""
        logger.info("Uninstalling Copilot CLI cross-CLI integration...")

        try:
            # 1. Remove MCP server config
            if self.mcp_config_file.exists():
                mcp_config = self._load_existing_mcp_config()
                server_name = self.config['mcp_config']['server_name']

                if server_name in mcp_config.get('mcpServers', {}):
                    del mcp_config['mcpServers'][server_name]

                    with open(self.mcp_config_file, 'w', encoding='utf-8') as f:
                        json.dump(mcp_config, f, indent=2, ensure_ascii=False)

                    logger.info("Removed MCP server config: {}".format(server_name))

            # 2. Remove custom agents
            for agent_name in self.config['custom_agents'].keys():
                agent_file = self.custom_agents_dir / "{}.json".format(agent_name)
                if agent_file.exists():
                    agent_file.unlink()
                    logger.info("Removed agent: {}".format(agent_name))

            logger.info("[OK] Uninstallation completed")
            return True

        except Exception as e:
            logger.error("Uninstallation failed: {}".format(e))
            return False


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Copilot CLI Cross-CLI Integration Installer")
    parser.add_argument(
        "--config",
        help="Config file path",
        default=None
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force overwrite existing config"
    )
    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="Uninstall integration"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Verbose output"
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    installer = CopilotIntegrationInstaller(args.config, args.force)

    if args.uninstall:
        success = installer.uninstall()
    else:
        success = installer.install()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()