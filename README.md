# Stigmergy CLI Multi-Agents System

A comprehensive system for collaboration between multiple AI CLI tools. This system enables seamless cross-CLI communication and intelligent task routing between different AI tools.

## Features

- 🤖 Multi-agent AI CLI tools collaboration (Claude, Gemini, Qwen, iFlow, Qoder, CodeBuddy, Copilot, Codex)
- 🎯 Natural language skills processing and cross-CLI task routing
- 🧠 Cross-CLI memory sharing and session recovery
- 🔗 Hook integration for seamless AI tool usage
- 🌍 JavaScript-based implementation (no Python dependencies)
- ⚡ Intelligent command routing and execution

## Quick Start

```bash
# Install the core system
npm install -g stigmergy

# Scan for available AI CLI tools
stigmergy scan

# Install missing tools
stigmergy install

# Deploy hooks for cross-CLI integration
stigmergy deploy

# Use cross-CLI collaboration
stigmergy claude "write a Python function"
stigmergy gemini "translate this text"
stigmergy qwen "analyze this code"
```

## Cross-CLI Communication

When you need to call other AI tools, use the following format:
```bash
stigmergy <tool_name> <task_description>
```

Examples:
```bash
stigmergy claude "write a Python function"
stigmergy gemini "translate this text"
stigmergy qwen "analyze this code"
```

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

## Documentation

- [Main System](./README.md)
- [Skills Package](./packages/skills/README.md)
- [Resume Session](./packages/resume/README.md)
- [Session Management](./packages/sessions/README.md)

## Contributing

This project is a collaboration between multiple AI systems:
- Claude (Anthropic)
- Qwen (Alibaba)
- iFlow (Intelligent Workflow)
- QoderCLI
- GLM4.5 (Zhipu AI)
- And other AI systems

Contributions are welcome!