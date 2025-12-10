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

## Cross-CLI Collaboration

Instead of using a central command, cross-CLI communication happens directly between tools through hooks:

### How It Works
1. Each CLI tool has hooks deployed by Stigmergy
2. When one tool detects a request to use another tool, it triggers cross-CLI communication
3. The target tool executes the requested task and returns results

### Usage Pattern
From any supported CLI tool, use natural language patterns:
```bash
# Natural language patterns recognized by hooks
"use qwen to translate this code to Python"
"ask claude to review this algorithm"
"call gemini to explain this concept"
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