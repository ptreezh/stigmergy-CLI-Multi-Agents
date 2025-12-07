# Stigmergy CLI - Multi-Agents Cross-AI CLI Tool Collaboration System

> **Important: This is not a standalone CLI tool, but an enhancement system!**
>
> Stigmergy CLI enables existing AI CLI tools to collaborate with each other through a plugin system, rather than replacing them.

[![Node.js](https://img.shields.io/badge/node-16+-green.svg)](https://nodejs.org)
[![NPM](https://img.shields.io/badge/npm-stigmergy-blue.svg)](https://www.npmjs.com/package/stigmergy)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()

## Quick Start

### One-Click Deployment (Recommended)

```bash
# Install Stigmergy CLI globally
npm install -g stigmergy

# Run interactive setup
stigmergy
```

This command will:
- Scan your system for available AI CLI tools
- Install missing tools with your permission
- Configure automatic cross-tool collaboration
- Set up hook integrations for seamless communication

### Manual Installation

```bash
npm install -g stigmergy
stigmergy --help
```

## Supported AI CLI Tools

Stigmergy CLI enhances the following AI CLI tools:

- **Claude CLI** - Anthropic's Claude assistant
- **Gemini CLI** - Google's Gemini AI
- **Qwen CLI** - Alibaba's Qwen model
- **iFlow CLI** - Intelligent workflow automation
- **Qoder CLI** - AI-powered code generation
- **CodeBuddy CLI** - Programming assistant
- **GitHub Copilot CLI** - Microsoft's Copilot
- **OpenAI Codex CLI** - OpenAI's code completion

## Usage

### Basic Commands

```bash
# Show help
stigmergy --help

# Check version
stigmergy --version

# Scan for available AI CLI tools
stigmergy scan

# Check system status
stigmergy status

# Interactive installation mode
stigmergy install

# Deploy hooks to all tools
stigmergy deploy

# Complete setup (scan + install + deploy)
stigmergy setup
```

### Cross-CLI Collaboration

Once installed, you can use AI CLI tools to collaborate with each other:

```bash
# Use Claude to analyze code
stigmergy call claude "analyze this function"

# Use Gemini for documentation
stigmergy call gemini "generate docs for this file"

# Use Qwen for translation
stigmergy call qwen "translate to English"

# Use Copilot for code suggestions
stigmergy call copilot "suggest improvements"
```

### Installation Workflow

1. **Scan**: `stigmergy scan` - Detects installed AI CLI tools
2. **Install**: `stigmergy install` - Interactive tool installation
3. **Deploy**: `stigmergy deploy` - Sets up cross-tool communication
4. **Use**: `stigmergy call <tool> <prompt>` - Start collaborating

## Configuration

### Global Configuration

Configuration is stored in `~/.stigmergy/config.json`:

```json
{
  "version": "1.0.76",
  "installed": "2025-12-07T00:00:00.000Z",
  "projectPath": "/path/to/project",
  "availableTools": ["claude", "gemini", "qwen"],
  "collaboration": {
    "enabled": true,
    "protocols": [
      "Use {cli} to {task}",
      "Call {cli} to {task}",
      "Ask {cli} for {task}"
    ]
  }
}
```

### Project Configuration

Each project gets a `STIGMERGY.md` file with tool-specific usage instructions.

## Features

- **Automated Detection**: Scans for installed AI CLI tools
- **Interactive Installation**: One-click installation of missing tools
- **Cross-Tool Communication**: Enables AI CLI tools to work together
- **Hook Integration**: Deploys integration hooks to each tool
- **International Support**: Pure ANSI character output for global compatibility
- **Auto-Setup**: Configures everything automatically on npm install

## Development

### Project Structure

```
stigmergy-CLI-Multi-Agents/
├── src/
│   ├── main.js          # Main CLI logic
│   └── index.js         # Entry point
├── package.json         # NPM configuration
└── README.md           # This file
```

### Building from Source

```bash
# Clone the repository
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# Install dependencies
npm install

# Install globally for testing
npm install -g .
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- **Issues**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues
- **NPM**: https://www.npmjs.com/package/stigmergy

## Changelog

### Version 1.0.76
- Unified international version with pure ANSI characters
- Single source of truth for all CLI logic
- Automated installation and deployment system
- Enhanced error handling and validation
- Removed all redundant scripts and configurations