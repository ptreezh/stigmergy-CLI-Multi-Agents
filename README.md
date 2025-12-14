# Stigmergy CLI Multi-Agents System

A comprehensive system for collaboration between multiple AI CLI tools. This monorepo contains several related packages:

## Packages

- `stigmergy` (Core): Main coordination system for multi-agent AI CLI tools
- `@stigmergy/skills`: Natural language skills for AI CLI tools
- `@stigmergy/resume`: Cross-CLI memory sharing and session recovery
- `@stigmergy/sessions`: Cross-CLI session management and recovery

## Features

- 🤖 Multi-agent AI CLI tools collaboration (Claude, Gemini, Qwen, etc.)
- 🎯 Natural language skills processing
- 🧠 Cross-CLI memory sharing and session recovery
- 🔗 Hook integration for seamless AI tool usage
- 🌍 International encoding support (ANSI-based for global compatibility)
- ⚡ Intelligent command routing and execution

## Quick Start

```bash
# Install the core system
npm install -g stigmergy

# Install packages
npm install -g @stigmergy/skills @stigmergy/resume @stigmergy/sessions

# Use unified commands
sg-skills "translate this to English"
sg-resume status
sg-sessions stats
```

## Documentation

- [Main System](./README.md)
- [Skills Package](./packages/skills/README.md)
- [Resume Session](./packages/resume/README.md)
- [Session Management](./packages/sessions/README.md)

## Contributing

This project follows the MIT License. Contributions are welcome!