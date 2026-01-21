# Stigmergy Multi-AI CLI Collaboration

This project is configured for Stigmergy-based multi-AI CLI collaboration.

## Available AI CLI Tools

Cross-CLI communication is enabled between all supported AI tools:
- Claude (Anthropic)
- Qwen (Alibaba)
- Gemini (Google)
- iFlow (Intelligent Workflow)
- Qoder CLI
- CodeBuddy
- GitHub Copilot
- OpenAI Codex
- Kode (Multi-Model Collaboration System)

## Project Contributors

This project is made possible through the contribution of various AI systems:
- Claude (Anthropic)
- Qwen (Alibaba)
- iFlow (Intelligent Workflow)
- QoderCLI
- GLM4.5 (Zhipu AI)
- And other AI systems

## Cross-CLI Collaboration

Stigmergy provides a unified command interface for cross-CLI communication:

### How It Works
1. Each CLI tool has hooks deployed by Stigmergy
2. Use the stigmergy command to route tasks to specific AI tools
3. The target tool executes the requested task and returns results

### Usage Pattern
Use the stigmergy command with the following format:
```bash
stigmergy <tool_name> <task_description>
```

Examples:
```bash
stigmergy claude "write a Python function"
stigmergy gemini "translate this text"
stigmergy qwen "analyze this code"
stigmergy iflow "create a workflow"
stigmergy qodercli "review this code"
stigmergy codebuddy "help me debug"
stigmergy copilot "suggest improvements"
stigmergy codex "generate documentation"
stigmergy kode "use digital marxist agent for analysis"
```

## Project Memory and Documentation

This project automatically generates documentation for each CLI tool:
- claude.md
- qwen.md
- gemini.md
- iflow.md
- qodercli.md
- codebuddy.md
- copilot.md
- codex.md
- kode.md

Each documentation file contains:
- Tool configuration information
- Usage patterns
- Cross-CLI communication instructions

## Configuration

Global configuration: `~/.stigmergy/config.json`

## Getting Started

1. Run `stigmergy status` to verify setup
2. Check individual CLI documentation files for specific usage instructions
3. Use natural language requests within any CLI tool to trigger cross-CLI communication

For more information: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents