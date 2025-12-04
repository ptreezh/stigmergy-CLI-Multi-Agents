# 🔧 Stigmergy CLI - Multi-Agents Cross-AI CLI Tool Collaboration System

> **⚠️ Important Clarification: This is not a standalone CLI tool, but an enhancement system!**
> 
> Stigmergy CLI enables existing AI CLI tools to collaborate with each other through a plugin system, rather than replacing them.

[![Node.js](https://img.shields.io/badge/node-16+-green.svg)](https://nodejs.org)
[![NPM](https://img.shields.io/badge/npm-stigmergy-cli-blue.svg)](https://www.npmjs.com/package/stigmergy-cli)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()

## 🚀 Quick Start

### One-Click Deployment (Recommended)

```bash
# One-click deployment of the complete collaboration system (detection + installation + configuration)
npx -y git+https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git#main quick-deploy
```

Or, if you have already installed stigmergy-cli globally:

```bash
# Run through the installed CLI
npx stigmergy-cli quick-deploy
```

### Manual Installation

```bash
# Install globally via NPM
npm install -g stigmergy-cli

# Initialize project
stigmergy-cli init

# Intelligent deployment (scan environment + prompt + auto-install)
stigmergy-cli deploy

# Or use npx (no installation required)
npx stigmergy-cli init
npx stigmergy-cli deploy
```

## ✨ Core Features

### 🎯 Direct Cross-CLI Collaboration
- **Natural Language Invocation**: Directly invoke other AI tools in any supported CLI
- **Seamless Integration**: Does not change the existing usage of CLI tools
- **Smart Routing**: Automatically identifies collaboration intent and delegates to the appropriate tool

### 🔧 Enhanced CLI Help Information Parsing
- **Real-time Extraction**: Dynamically parse actual CLI `--help` output to get latest command specifications
- **Smart Options Detection**: Automatically identify global options, subcommands, and parameters
- **Graceful Fallback**: Falls back to preset templates when real-time parsing fails
- **Persistent Updates**: Stores parsed results for future use, continuously improving accuracy

### 📋 Supported CLI Tools

#### Core Tools (Required)
- **Claude CLI** - Anthropic Claude CLI Tool
- **Gemini CLI** - Google Gemini CLI Tool

#### Extension Tools (Optional)
- **QwenCode CLI** - Alibaba Cloud QwenCode CLI Tool
- **iFlow CLI** - iFlow Workflow CLI Tool
- **Qoder CLI** - Qoder Code Generation CLI Tool
- **CodeBuddy CLI** - CodeBuddy Programming Assistant CLI Tool
- **GitHub Copilot CLI** - GitHub Copilot CLI Tool
- **Codex CLI** - OpenAI Codex Code Analysis CLI Tool
- **Cline CLI** - Cline AI Assistant CLI Tool - Supports task lifecycle hooks and multi-agent orchestration

### 🧩 Intelligent Deployment System

```bash
# Intelligent deployment (recommended)
stigmergy-cli deploy

# Sample output:
🔍 Scanning system CLI tool status...

  🔴 ❌ Claude CLI           | CLI: Not installed | Integration: Not installed
  🟢 ✅ Gemini CLI          | CLI: Available | Integration: Installed
  🔴 ❌ QwenCode CLI       | CLI: Not installed | Integration: Not installed

📋 Detected the following tools not installed:

🔴 CLI Tools Not Installed:
  - Claude CLI (Required) - Anthropic Claude CLI Tool
  - QwenCode CLI (Optional) - Alibaba Cloud QwenCode CLI Tool

Would you like to try automatically installing 2 CLI tools? (Y/n): Y
```

## 🎯 Cross-CLI Collaboration Examples

After installation, you can directly call other tools within any supported CLI:

### In Claude CLI
```bash
# Invoke other AI tools
Please use gemini to help me translate this code
Call qwen to analyze this requirement
Use iflow to create a workflow
Have qoder generate Python code
Start codebuddy assistant
```

### In Gemini CLI
```bash
# Cross-CLI collaboration
Use claude to review this code
Call qwen for translation
Let copilot suggest improvements
Ask codex for code analysis
```

### In QwenCode CLI
```bash
# Multi-tool orchestration
Let claude check for security issues
Use gemini for optimization
Call iflow to automate the process
```

## 🔧 Advanced Features

### Real-time CLI Help Parsing
The system now includes advanced real-time CLI help parsing capabilities:

```python
# Example of real-time help parsing
specs = _parse_cli_help(cli_name)
# Automatically extracts:
# - Global options (--help, --version, --verbose, etc.)
# - Subcommands (chat, file, config, auth, etc.)
# - Parameters (input, output, model, temperature, etc.)
# - Usage patterns and examples
```

### Persistent Storage Mechanism
- **Dynamic Templates**: Updated CLI command specifications are stored persistently
- **Continuous Improvement**: Each successful parse improves future accuracy
- **Fallback Support**: Preset templates ensure functionality even when real-time parsing fails

### Internationalization
- **Global Design**: Fully English-based interface for international users
- **Multi-language Support**: Ready for expansion to multiple languages
- **Cross-platform Compatibility**: Works seamlessly across Windows, Linux, and macOS

## 📊 Global Memory Documents

The system generates comprehensive memory documents for each CLI tool:

### JSON Format
```json
{
  "cli_name": "claude",
  "display_name": "Claude CLI",
  "command": "claude",
  "description": "Anthropic Claude CLI Tool",
  "version_info": "...",
  "command_specs": {
    "global_options": {
      "--help": "Show help information",
      "--version": "Show version information",
      "--verbose": "Detailed output"
    },
    "subcommands": {
      "chat": "Chat mode",
      "file": "File processing mode",
      "config": "Configuration management"
    },
    "parameters": {
      "input": "Input file or prompt",
      "output": "Output file path",
      "model": "Model selection"
    }
  }
}
```

### Markdown Documentation
- **Comprehensive Guides**: Detailed documentation for each CLI tool
- **Usage Examples**: Practical examples for common use cases
- **Integration Patterns**: Best practices for cross-CLI collaboration
- **Command Reference**: Complete command specifications and parameters

## 🛠️ Local Generation and Management

### Generate Global Memory Documents
```bash
# Generate comprehensive memory documents for all tools
python generate_global_memory.py

# Creates:
# - global_memory/claude_global_memory.json
# - global_memory/claude_global_memory.md
# - global_memory/gemini_global_memory.json
# - global_memory/gemini_global_memory.md
# ... and more for all supported CLIs
```

### Advanced Command Specification Generation
The enhanced `generate_global_memory.py` script now includes:

1. **Real-time CLI Parsing**: Directly calls `--help` commands to extract accurate specifications
2. **Smart Pattern Recognition**: Uses regex and intelligent parsing to extract options, subcommands, and parameters
3. **Fallback Templates**: Provides comprehensive default templates when live parsing isn't available
4. **Dynamic Updates**: Continuously improves templates based on real-world CLI behavior
5. **Persistent Storage**: Saves parsed specifications for improved future accuracy

## 🌐 Cross-Platform Support

### Windows
```bash
# Windows deployment
npx stigmergy-cli deploy
```

### Linux/macOS
```bash
# Unix-like systems
npx stigmergy-cli deploy
```

## 📄 Global Memory Documentation

### CLI Command Specifications
Each CLI tool gets detailed command specifications including:
- **Global Options**: Common flags like `--help`, `--version`, `--verbose`
- **Subcommands**: Specific modes like `chat`, `file`, `config`, `auth`
- **Parameters**: Detailed parameter definitions with descriptions
- **Usage Examples**: Practical usage patterns and best practices

### Collaboration Patterns
- **Automatic Recognition**: Detects cross-CLI collaboration patterns
- **Template Matching**: Matches natural language patterns to CLI commands
- **Intelligent Routing**: Routes requests to the most appropriate CLI tool

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ (for deployment scripts)
- Python 3.8+ (for advanced features)
- Git (for installation)

### Quick Setup
1. **Install the system**
   ```bash
   npm install -g stigmergy-cli
   ```

2. **Initialize project**
   ```bash
   stigmergy-cli init
   ```

3. **Deploy integrations**
   ```bash
   stigmergy-cli deploy
   ```

4. **Start collaborating**
   ```bash
   claude "Please use gemini to help me analyze this code"
   gemini "Ask claude to review the security aspects"
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**🎯 Stigmergy CLI - True Cross-CLI Collaboration, Making Every AI Tool Deliver Maximum Value!**