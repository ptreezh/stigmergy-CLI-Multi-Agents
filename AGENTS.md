# agents.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Repository Overview

This is the Stigmergy CLI - Multi-Agents cross-AI CLI tool collaboration system. It enables existing AI CLI tools to collaborate with each other through a plugin system without replacing them.

## Key Architecture Components

1. **Core System**: Cross-platform encoding safety and intelligent deployment
2. **CLI Adapters**: Integration modules for different AI CLI tools (Claude, Gemini, Qwen, etc.)
3. **Hook System**: Native integration using official CLI hook mechanisms
4. **AI Environment Scanner**: Detects available AI CLI tools and their configurations
5. **Documentation Generator**: Creates collaboration-aware documentation for projects
6. **Natural Language Parser**: Unified parser for cross-CLI collaboration commands
7. **Installation System**: Automated CLI tool installation and user interaction

## Common Development Commands

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm run test

# Deploy the system
npm run deploy

# Scan for available AI CLI tools
node src/main.js scan

# Initialize project
node src/main.js init

# Check system status
node src/main.js status
```

## Project Structure

```
stigmergy-CLI-Multi-Agents/
├── src/
│   ├── core/                 # Core functionality
│   │   ├── ai_environment_scanner.py    # AI tool detection
│   │   ├── enhanced_init_processor.py   # Initialization logic
│   │   ├── md_enhancer.py              # Documentation enhancement
│   │   ├── md_generator.py             # Documentation generation
│   │   ├── parser.py                   # Natural language parser
│   │   └── models.py                   # Data models
│   ├── adapters/             # CLI tool adapters
│   │   ├── claude/           # Claude CLI integration
│   │   ├── gemini/           # Gemini CLI integration
│   │   └── ...               # Other CLI integrations
│   ├── main.js               # Main entry point
│   └── deploy.js             # Deployment script
├── package.json              # NPM configuration
├── agents.md                 # Qoder guidance documentation
├── CLI_EXTENSION_GUIDE.md    # Guide for adding new CLI tools
└── README.md                 # Project documentation
```

## Integration Types

Each AI CLI tool uses a different integration approach:
- **Claude**: Hook system
- **Gemini**: Extension system
- **Qwen**: Class inheritance
- **iFlow**: Workflow pipeline
- **Qoder**: Notification hook (generates agents.md)
- **CodeBuddy**: Skills integration
- **Copilot**: MCP server
- **Codex**: Slash commands

## Cross-CLI Collaboration

The system enables natural language cross-CLI calling:
- Chinese: "请用gemini帮我翻译这段代码"
- English: "use qwen to generate unit tests"

Collaboration is detected through natural language parsing and routed through the appropriate adapter.

## Adding New CLI Tools

To add new AI CLI tools to the system, follow the comprehensive guide in `CLI_EXTENSION_GUIDE.md`. This includes:
- Research and analysis of the CLI tool's extension mechanisms
- Adapter development for integration with the Stigmergy system
- Automated installation script creation
- User interaction and menu system integration
- Testing and deployment procedures