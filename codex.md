# OpenAI Codex CLI CLI Documentation

## Overview
This document contains configuration and usage information for the OpenAI Codex CLI CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: codex
- **Tool Name**: OpenAI Codex CLI
- **Installation Command**: `npm install -g @openai/codex`
- **Version Check**: `codex --version`

## Usage Patterns
The OpenAI Codex CLI CLI can be invoked in several ways:
1. Direct execution: `codex [arguments]`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call OpenAI Codex CLI from another CLI tool:
```bash
# Use stigmergy command
stigmergy codex "[task description]"

# Examples:
stigmergy codex "分析这段代码"
stigmergy codex "翻译这段文字"
stigmergy codex "写一个Python函数"
```

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\Zhang\.config\codex\slash_commands`

## Last Updated
2025-12-14T10:20:50.711Z

---
*This file is automatically managed by Stigmergy CLI*
