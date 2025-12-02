#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI CLI Tools Smart Installer
Automatically detect system environment and deploy appropriate versions
"""

import os
import sys
import platform
import subprocess
import json
import urllib.request
from pathlib import Path

class EnvironmentDetector:
    """Environment Detector"""
    
    def __init__(self):
        self.system = platform.system().lower()
        self.architecture = platform.machine().lower()
        self.python_version = sys.version_info
        self.shell = self._detect_shell()
    
    def _detect_shell(self):
        """Detect current shell"""
        if os.name == 'nt':  # Windows
            return os.environ.get('COMSPEC', 'cmd.exe')
        else:  # Unix-like
            return os.environ.get('SHELL', '/bin/sh')
    
    def get_system_info(self):
        """Get complete system information"""
        return {
            "os": self.system,
            "arch": self.architecture,
            "python_version": f"{self.python_version.major}.{self.python_version.minor}.{self.python_version.micro}",
            "shell": self.shell,
            "node_version": self._get_node_version(),
            "has_internet": self._check_internet()
        }
    
    def _get_node_version(self):
        """Get Node.js version"""
        try:
            result = subprocess.run(["node", "--version"], 
                                  capture_output=True, text=True, timeout=10)
            return result.stdout.strip() if result.returncode == 0 else "Not installed"
        except:
            return "Not installed"
    
    def _check_internet(self):
        """Check internet connection"""
        try:
            urllib.request.urlopen("https://api.github.com", timeout=5)
            return True
        except:
            return False

class ConfigAdapter:
    """Config Adapter"""
    
    def __init__(self, system_info):
        self.system_info = system_info
    
    def get_optimal_config(self):
        """Get optimal config based on system info"""
        os_type = self.system_info["os"]
        
        if os_type == "windows":
            return self._get_windows_config()
        elif os_type == "linux":
            return self._get_linux_config()
        elif os_type == "darwin":
            return self._get_macos_config()
        else:
            return self._get_default_config()
    
    def _get_windows_config(self):
        """Windows config"""
        return {
            "os": "windows",
            "script_extension": ".bat",
            "path_separator": "\\",
            "shell_commands": {
                "new_terminal": "start cmd /k",
                "background_process": "start /b"
            },
            "requires_admin": False
        }
    
    def _get_linux_config(self):
        """Linux config"""
        return {
            "os": "linux",
            "script_extension": ".sh",
            "path_separator": "/",
            "shell_commands": {
                "new_terminal": "gnome-terminal --",
                "background_process": "nohup"
            },
            "requires_admin": False
        }
    
    def _get_macos_config(self):
        """macOS config"""
        return {
            "os": "darwin",
            "script_extension": ".sh",
            "path_separator": "/",
            "shell_commands": {
                "new_terminal": "osascript -e 'tell app \"Terminal\" to do script'",
                "background_process": "nohup"
            },
            "requires_admin": False
        }
    
    def _get_default_config(self):
        """Default config"""
        return {
            "os": "unknown",
            "script_extension": ".sh",
            "path_separator": "/",
            "shell_commands": {
                "new_terminal": "xterm -e",
                "background_process": "nohup"
            },
            "requires_admin": False
        }

class ScriptDeployer:
    """Script Deployer"""
    
    def __init__(self, config, install_dir):
        self.config = config
        self.install_dir = Path(install_dir)
        self.install_dir.mkdir(parents=True, exist_ok=True)
    
    def deploy_all_scripts(self):
        """Deploy all scripts"""
        tools = ["claude", "gemini", "qwen", "iflow", "codebuddy", "codex", "copilot"]
        
        for tool in tools:
            self._deploy_tool_script(tool)
        
        # Deploy cross-platform Python script
        self._deploy_python_script()
        
        return len(tools) + 1  # Return number of deployed scripts
    
    def _deploy_tool_script(self, tool_name):
        """Deploy tool script"""
        script_name = f"{tool_name}-call{self.config['script_extension']}"
        script_path = self.install_dir / script_name
        
        if self.config["os"] == "windows":
            content = self._generate_windows_script(tool_name)
        else:
            content = self._generate_unix_script(tool_name)
        
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        # Set execute permission for Unix systems
        if self.config["os"] != "windows":
            os.chmod(script_path, 0o755)
    
    def _deploy_python_script(self):
        """Deploy cross-platform Python script"""
        script_path = self.install_dir / "ai-call.py"
        
        content = '''#!/usr/bin/env python3
import subprocess
import sys
import platform

def run_cli_command(cli_name, arguments):
    if platform.system().lower() == "windows":
        full_command = f"{cli_name} {' '.join(arguments) if arguments else ''}"
        return subprocess.run(full_command, shell=True, capture_output=True, text=True, timeout=300)
    else:
        cmd_parts = [cli_name] + arguments
        return subprocess.run(cmd_parts, capture_output=True, text=True, timeout=300)

def main():
    if len(sys.argv) < 2:
        print("Usage: ai-call <cli_name> [arguments...]")
        return 1
    
    cli_name = sys.argv[1]
    arguments = sys.argv[2:] if len(sys.argv) > 2 else []
    
    try:
        result = run_cli_command(cli_name, arguments)
        print(f"Return code: {result.returncode}")
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
        return result.returncode
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
'''
        
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(content)
    
    def _generate_windows_script(self, tool_name):
        """Generate Windows batch script"""
        return f'''@echo off
REM {tool_name.capitalize()} CLI Tool Call Script
REM For calling other installed CLI tools on Windows

setlocal enabledelayedexpansion

REM Check arguments
if "%%~1"=="" (
    echo Usage: {tool_name}-call ^<cli_name^> [arguments...]
    echo Example: {tool_name}-call claude --version
    exit /b 1
)

REM Get CLI name
set "CLI_NAME=%%~1"
shift

REM Build arguments string
set "ARGS="
:build_args
if "%%~1"=="" goto args_done
set "ARGS=%%ARGS%% %%1"
shift
goto build_args
:args_done

REM Call the command
echo Calling %%CLI_NAME%% CLI: %%CLI_NAME%%%%ARGS%%
echo --------------------------------------------------
%%CLI_NAME%%%%ARGS%%
exit /b %%ERRORLEVEL%%
'''
    
    def _generate_unix_script(self, tool_name):
        """Generate Unix shell script"""
        return f'''#!/bin/bash
# {tool_name.capitalize()} CLI Tool Call Script
# For calling other installed CLI tools on Linux/macOS

# Check arguments
if [ $# -eq 0 ]; then
    echo "Usage: {tool_name}-call <cli_name> [arguments...]"
    echo "Example: {tool_name}-call claude --version"
    exit 1
fi

# Get CLI name
CLI_NAME="$1"
shift

# Call the command
echo "Calling $CLI_NAME CLI: $CLI_NAME $*"
echo "--------------------------------------------------"
"$CLI_NAME" "$@"
'''

class SmartInstaller:
    """Smart Installer Main Class"""
    
    def __init__(self):
        self.detector = EnvironmentDetector()
        self.system_info = self.detector.get_system_info()
        
    def install(self):
        """Execute full installation process"""
        print("AI CLI Tools Smart Installer")
        print("=" * 50)
        
        # 1. Show system info
        self._show_system_info()
        
        # 2. Get optimal config
        adapter = ConfigAdapter(self.system_info)
        config = adapter.get_optimal_config()
        
        # 3. Deploy scripts
        install_dir = Path.home() / ".ai-cli-tools"
        deployer = ScriptDeployer(config, install_dir)
        script_count = deployer.deploy_all_scripts()
        
        # 4. Show installation result
        self._show_installation_result(install_dir, script_count, config)
        
        return True
    
    def _show_system_info(self):
        """Show system info"""
        print("Detected System Environment:")
        for key, value in self.system_info.items():
            print(f"  {key}: {value}")
        print()
    
    def _show_installation_result(self, install_dir, script_count, config):
        """Show installation result"""
        print("Installation Complete!")
        print(f"Installation Directory: {install_dir}")
        print(f"Deployed Scripts: {script_count}")
        print(f"System Type: {config['os']}")
        print()
        print("Usage:")
        print("   Cross-platform call: python ai-call.py <tool_name> [arguments...]")
        print(f"   System-specific call: .{config['path_separator']}ai-cli-tools{config['path_separator']}tool-call{config['script_extension']} <tool_name> [arguments...]")
        print()
        print("Now you can call all AI CLI tools across platforms!")

def main():
    try:
        installer = SmartInstaller()
        success = installer.install()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\\nInstallation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"Error during installation: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()