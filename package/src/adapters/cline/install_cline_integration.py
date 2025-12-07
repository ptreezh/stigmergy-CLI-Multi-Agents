"""
Cline CLI Integration Installation Script

This script handles the installation and configuration of Cline CLI
integration with the Stigmergy system, including MCP server setup
and cross-platform compatibility.

Features:
- Cross-platform installation (Windows, Linux, macOS)
- MCP server configuration
- Environment variable setup
- Dependency verification
- Safe encoding handling
"""

import os
import sys
import json
import subprocess
import shutil
import logging
import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add project root to path
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from src.utils.platform_utils import get_platform_info, is_windows, is_linux, is_macos
from src.utils.encoding_utils import safe_encode_command, safe_decode_output
from src.utils.file_utils import ensure_directory_exists, safe_write_json_file, safe_read_json_file
from src.adapters.cline.config import (
    CLINE_CONFIG, 
    get_cline_config_path, 
    get_mcp_settings_path,
    get_mcp_server_directory,
    create_default_mcp_settings
)


class ClineInstaller:
    """Cline CLI installation and configuration manager"""
    
    def __init__(self):
        self.platform = get_platform_info()
        self.node_version = None
        self.npm_version = None
        self.cline_installed = False
        self.mcp_configured = False
        
    def check_prerequisites(self) -> Dict[str, Any]:
        """Check system prerequisites for Cline installation"""
        logger.info("Checking system prerequisites...")
        
        results = {
            "node_available": False,
            "npm_available": False,
            "node_version": None,
            "npm_version": None,
            "node_compatible": False,
            "npm_compatible": False,
            "all_met": False
        }
        
        # Check Node.js
        try:
            result = subprocess.run(
                ["node", "--version"], 
                capture_output=True, 
                text=True, 
                timeout=10
            )
            if result.returncode == 0:
                node_version = result.stdout.strip()
                results["node_available"] = True
                results["node_version"] = node_version
                
                # Check version compatibility (Node.js 18+)
                version_parts = node_version.lstrip('v').split('.')
                if len(version_parts) >= 1:
                    major_version = int(version_parts[0])
                    results["node_compatible"] = major_version >= 18
                
        except (subprocess.TimeoutExpired, FileNotFoundError, Exception) as e:
            logger.warning(f"Node.js check failed: {e}")
        
        # Check npm
        try:
            result = subprocess.run(
                ["npm", "--version"], 
                capture_output=True, 
                text=True, 
                timeout=10
            )
            if result.returncode == 0:
                npm_version = result.stdout.strip()
                results["npm_available"] = True
                results["npm_version"] = npm_version
                
                # Check version compatibility (npm 7+)
                version_parts = npm_version.split('.')
                if len(version_parts) >= 1:
                    major_version = int(version_parts[0])
                    results["npm_compatible"] = major_version >= 7
                
        except (subprocess.TimeoutExpired, FileNotFoundError, Exception) as e:
            logger.warning(f"npm check failed: {e}")
        
        # Overall compatibility
        results["all_met"] = (
            results["node_available"] and 
            results["npm_available"] and 
            results["node_compatible"] and 
            results["npm_compatible"]
        )
        
        return results
    
    def install_cline(self, use_global: bool = True) -> bool:
        """Install Cline CLI package"""
        logger.info("Installing Cline CLI...")
        
        try:
            if use_global:
                # Global installation
                cmd = ["npm", "install", "-g", CLINE_CONFIG["npm_package"]]
                logger.info(f"Running: {' '.join(cmd)}")
                
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=300,  # 5 minutes timeout
                    env=self._get_safe_environment()
                )
            else:
                # Local installation (for development)
                cmd = ["npm", "install", CLINE_CONFIG["npm_package"]]
                logger.info(f"Running: {' '.join(cmd)}")
                
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=300,
                    env=self._get_safe_environment()
                )
            
            if result.returncode == 0:
                logger.info("Cline CLI installed successfully")
                self.cline_installed = True
                return True
            else:
                logger.error(f"Cline installation failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("Cline installation timed out")
            return False
        except Exception as e:
            logger.error(f"Cline installation error: {e}")
            return False
    
    def verify_cline_installation(self) -> bool:
        """Verify that Cline CLI is properly installed"""
        logger.info("Verifying Cline CLI installation...")
        
        try:
            result = subprocess.run(
                ["cline", "--version"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                version = result.stdout.strip()
                logger.info(f"Cline CLI version: {version}")
                return True
            else:
                # Try npx alternative
                result = subprocess.run(
                    ["npx", "-y", "cline", "--version"],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                if result.returncode == 0:
                    version = result.stdout.strip()
                    logger.info(f"Cline CLI version (via npx): {version}")
                    return True
                else:
                    logger.error(f"Cline verification failed: {result.stderr}")
                    return False
                    
        except (subprocess.TimeoutExpired, FileNotFoundError, Exception) as e:
            logger.error(f"Cline verification error: {e}")
            return False
    
    def setup_mcp_configuration(self) -> bool:
        """Setup MCP configuration for Cline integration"""
        logger.info("Setting up MCP configuration...")
        
        try:
            # Create Cline configuration directory
            config_path = get_cline_config_path()
            ensure_directory_exists(config_path)
            
            # Create MCP settings
            mcp_settings = create_default_mcp_settings()
            
            # Add Stigmergy-specific MCP server configuration
            stigmergy_server_config = {
                "command": "python",
                "args": ["-m", "src.adapters.cline.mcp_server"],
                "env": {
                    "STIGMERGY_PROJECT_ROOT": self.project_root,
                    "STIGMERGY_COLLABORATION_MODE": "enabled",
                    "PYTHONPATH": str(project_root)
                },
                "disabled": False,
                "autoStart": True,
                "timeout": CLINE_CONFIG["mcp_default_timeout"]
            }
            
            mcp_settings["mcpServers"]["stigmergy"] = stigmergy_server_config
            
            # Write MCP settings
            settings_path = get_mcp_settings_path()
            safe_write_json_file(settings_path, mcp_settings)
            
            # Create MCP server directory
            mcp_server_dir = get_mcp_server_directory()
            ensure_directory_exists(mcp_server_dir)
            
            # Create server manifest
            manifest = {
                "name": "stigmergy-mcp-server",
                "version": "1.0.0",
                "description": "Stigmergy CLI Multi-Agents MCP Server",
                "tools": [
                    {
                        "name": "search_files",
                        "description": "Search for files in the project"
                    },
                    {
                        "name": "read_project_file",
                        "description": "Read project file content"
                    },
                    {
                        "name": "get_project_structure",
                        "description": "Get project directory structure"
                    },
                    {
                        "name": "analyze_codebase",
                        "description": "Analyze codebase patterns"
                    },
                    {
                        "name": "collaborate_with_cli",
                        "description": "Collaborate with other CLI tools"
                    }
                ]
            }
            
            manifest_path = mcp_server_dir / "stigmergy-mcp-manifest.json"
            safe_write_json_file(manifest_path, manifest)
            
            self.mcp_configured = True
            logger.info("MCP configuration completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"MCP configuration error: {e}")
            return False
    
    def create_cross_platform_scripts(self) -> bool:
        """Create cross-platform execution scripts"""
        logger.info("Creating cross-platform execution scripts...")
        
        try:
            # Create scripts directory
            scripts_dir = project_root / "scripts" / "cline"
            ensure_directory_exists(scripts_dir)
            
            # Windows batch script
            if is_windows():
                self._create_windows_scripts(scripts_dir)
            
            # Unix shell scripts
            if is_linux() or is_macos():
                self._create_unix_scripts(scripts_dir)
            
            # Cross-platform Python script
            self._create_python_script(scripts_dir)
            
            logger.info("Cross-platform scripts created successfully")
            return True
            
        except Exception as e:
            logger.error(f"Script creation error: {e}")
            return False
    
    def _create_windows_scripts(self, scripts_dir: Path):
        """Create Windows batch scripts"""
        # Main execution script
        batch_content = f"""@echo off
REM Cline CLI Execution Script for Windows
REM Generated by Stigmergy Cline Integration

setlocal enabledelayedexpansion

REM Set up environment
set "STIGMERGY_PROJECT_ROOT={project_root}"
set "STIGMERGY_COLLABORATION_MODE=enabled"
set "PYTHONPATH={project_root}"

REM Check if cline is available
where cline >nul 2>nul
if %errorlevel% equ 0 (
    REM Use direct cline command
    cline %*
) else (
    REM Fallback to npx
    npx -y cline %*
)

endlocal
"""
        
        batch_path = scripts_dir / "cline.bat"
        with open(batch_path, 'w', encoding='utf-8') as f:
            f.write(batch_content)
        
        # MCP server startup script
        mcp_batch_content = f"""@echo off
REM Stigmergy MCP Server Startup Script for Windows

setlocal enabledelayedexpansion

REM Set up environment
set "STIGMERGY_PROJECT_ROOT={project_root}"
set "STIGMERGY_COLLABORATION_MODE=enabled"
set "PYTHONPATH={project_root}"

REM Start MCP server
python -m src.adapters.cline.mcp_server

endlocal
"""
        
        mcp_batch_path = scripts_dir / "cline-mcp-server.bat"
        with open(mcp_batch_path, 'w', encoding='utf-8') as f:
            f.write(mcp_batch_content)
    
    def _create_unix_scripts(self, scripts_dir: Path):
        """Create Unix shell scripts"""
        # Main execution script
        shell_content = f"""#!/bin/bash
# Cline CLI Execution Script for Unix
# Generated by Stigmergy Cline Integration

# Set up environment
export STIGMERGY_PROJECT_ROOT="{project_root}"
export STIGMERGY_COLLABORATION_MODE="enabled"
export PYTHONPATH="{project_root}"

# Check if cline is available
if command -v cline >/dev/null 2>&1; then
    # Use direct cline command
    cline "$@"
else
    # Fallback to npx
    npx -y cline "$@"
fi
"""
        
        shell_path = scripts_dir / "cline.sh"
        with open(shell_path, 'w', encoding='utf-8') as f:
            f.write(shell_content)
        
        # Make executable
        os.chmod(shell_path, 0o755)
        
        # MCP server startup script
        mcp_shell_content = f"""#!/bin/bash
# Stigmergy MCP Server Startup Script for Unix

# Set up environment
export STIGMERGY_PROJECT_ROOT="{project_root}"
export STIGMERGY_COLLABORATION_MODE="enabled"
export PYTHONPATH="{project_root}"

# Start MCP server
python -m src.adapters.cline.mcp_server
"""
        
        mcp_shell_path = scripts_dir / "cline-mcp-server.sh"
        with open(mcp_shell_path, 'w', encoding='utf-8') as f:
            f.write(mcp_shell_content)
        
        # Make executable
        os.chmod(mcp_shell_path, 0o755)
    
    def _create_python_script(self, scripts_dir: Path):
        """Create cross-platform Python script"""
        python_content = f"""#!/usr/bin/env python3
\"\"\"
Cross-platform Cline CLI Execution Script
Generated by Stigmergy Cline Integration
\"\"\"

import os
import sys
import subprocess
import platform
from pathlib import Path

def main():
    # Set up environment
    project_root = Path(r"{project_root}")
    os.environ["STIGMERGY_PROJECT_ROOT"] = str(project_root)
    os.environ["STIGMERGY_COLLABORATION_MODE"] = "enabled"
    os.environ["PYTHONPATH"] = str(project_root)
    
    # Check if cline is available
    try:
        result = subprocess.run(
            ["cline", "--version"],
            capture_output=True,
            timeout=10
        )
        if result.returncode == 0:
            # Use direct cline command
            cmd = ["cline"] + sys.argv[1:]
        else:
            # Fallback to npx
            cmd = ["npx", "-y", "cline"] + sys.argv[1:]
    except (FileNotFoundError, subprocess.TimeoutExpired):
        # Fallback to npx
        cmd = ["npx", "-y", "cline"] + sys.argv[1:]
    
    # Execute command
    try:
        result = subprocess.run(cmd, check=True)
        return result.returncode
    except subprocess.CalledProcessError as e:
        print(f"Cline execution failed: {{e}}")
        return e.returncode
    except Exception as e:
        print(f"Error executing Cline: {{e}}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
"""
        
        python_path = scripts_dir / "cline.py"
        with open(python_path, 'w', encoding='utf-8') as f:
            f.write(python_content)
        
        # Make executable on Unix
        if not is_windows():
            os.chmod(python_path, 0o755)
    
    def _get_safe_environment(self) -> Dict[str, str]:
        """Get safe environment variables for subprocess execution"""
        env = os.environ.copy()
        
        # Ensure Node.js and npm are in PATH
        if is_windows():
            # Common Node.js installation paths on Windows
            node_paths = [
                r"C:\Program Files\nodejs",
                r"C:\Program Files (x86)\nodejs",
                os.path.expanduser(r"~\AppData\Roaming\npm")
            ]
        else:
            # Common Node.js installation paths on Unix
            node_paths = [
                "/usr/local/bin",
                "/usr/bin",
                os.path.expanduser("~/.npm-global/bin"),
                os.path.expanduser("~/.local/bin")
            ]
        
        # Add to PATH if not already present
        current_path = env.get("PATH", "")
        for node_path in node_paths:
            if os.path.exists(node_path) and node_path not in current_path:
                env["PATH"] = f"{node_path}{os.pathsep}{current_path}"
        
        # Set project-specific environment variables
        env["STIGMERGY_PROJECT_ROOT"] = str(project_root)
        env["STIGMERGY_COLLABORATION_MODE"] = "enabled"
        env["PYTHONPATH"] = str(project_root)
        
        return env
    
    def create_integration_report(self) -> Dict[str, Any]:
        """Create installation integration report"""
        return {
            "installation_date": str(datetime.datetime.now()),
            "platform": self.platform,
            "cline_installed": self.cline_installed,
            "mcp_configured": self.mcp_configured,
            "node_version": self.node_version,
            "npm_version": self.npm_version,
            "config_paths": {
                "cline_config": str(get_cline_config_path()),
                "mcp_settings": str(get_mcp_settings_path()),
                "mcp_server_dir": str(get_mcp_server_directory())
            },
            "status": "success" if (self.cline_installed and self.mcp_configured) else "partial"
        }
    
    def run_full_installation(self) -> bool:
        """Run the complete installation process"""
        logger.info("Starting Cline CLI integration installation...")
        
        # Check prerequisites
        prereqs = self.check_prerequisites()
        if not prereqs["all_met"]:
            logger.error("Prerequisites not met:")
            if not prereqs["node_available"]:
                logger.error("- Node.js not found")
            if not prereqs["npm_available"]:
                logger.error("- npm not found")
            if not prereqs["node_compatible"]:
                logger.error(f"- Node.js version incompatible (need 18+, got {prereqs['node_version']})")
            if not prereqs["npm_compatible"]:
                logger.error(f"- npm version incompatible (need 7+, got {prereqs['npm_version']})")
            return False
        
        self.node_version = prereqs["node_version"]
        self.npm_version = prereqs["npm_version"]
        
        # Install Cline CLI
        if not self.install_cline():
            logger.error("Cline CLI installation failed")
            return False
        
        # Verify installation
        if not self.verify_cline_installation():
            logger.error("Cline CLI verification failed")
            return False
        
        # Setup MCP configuration
        if not self.setup_mcp_configuration():
            logger.error("MCP configuration failed")
            return False
        
        # Create cross-platform scripts
        if not self.create_cross_platform_scripts():
            logger.error("Cross-platform script creation failed")
            return False
        
        logger.info("Cline CLI integration installation completed successfully!")
        return True


def main():
    """Main installation function"""
    installer = ClineInstaller()
    
    try:
        success = installer.run_full_installation()
        
        if success:
            # Create integration report
            report = installer.create_integration_report()
            report_path = project_root / "cline_integration_report.json"
            
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Integration report saved to: {report_path}")
            logger.info("✅ Cline CLI integration installation completed successfully!")
            
            # Print usage instructions
            print("\n" + "="*60)
            print("Cline CLI Integration - Usage Instructions")
            print("="*60)
            print(f"📁 Configuration directory: {get_cline_config_path()}")
            print(f"⚙️  MCP settings: {get_mcp_settings_path()}")
            print(f"🖥️  MCP server directory: {get_mcp_server_directory()}")
            print("\n🚀 Quick start:")
            print("   cline task 'Analyze this codebase'")
            print("   cline task 'Create a tool that searches for TODO comments'")
            print("\n🔄 Cross-CLI collaboration:")
            print("   use cline to analyze the project structure")
            print("   call cline to create a new tool")
            print("\n📚 For more information, see: cline.md")
            
            return 0
        else:
            logger.error("❌ Installation failed. Check the logs above for details.")
            return 1
            
    except KeyboardInterrupt:
        logger.info("Installation interrupted by user")
        return 1
    except Exception as e:
        logger.error(f"Unexpected error during installation: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())