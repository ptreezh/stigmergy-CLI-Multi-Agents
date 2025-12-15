# Claude CLI CLI Documentation

## Overview
This document contains configuration and usage information for the Claude CLI CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: claude
- **Tool Name**: Claude CLI
- **Installation Command**: `npm install -g @anthropic-ai/claude-code`
- **Version Check**: `claude --version`

## Usage Patterns
The Claude CLI CLI can be invoked in several ways:
1. Direct execution: `claude [arguments]`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call Claude CLI from another CLI tool:
```bash
# Use stigmergy command
stigmergy claude "[task description]"

# Examples:
stigmergy claude "分析这段代码"
stigmergy claude "翻译这段文字"
stigmergy claude "写一个Python函数"
```

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex, glm4

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\Zhang\.claude\hooks`

## Last Updated
2025-12-14T10:20:50.708Z

---
*This file is automatically managed by Stigmergy CLI*
