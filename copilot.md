# GitHub Copilot CLI CLI Documentation

## Overview
This document contains configuration and usage information for the GitHub Copilot CLI CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: copilot
- **Tool Name**: GitHub Copilot CLI
- **Installation Command**: `npm install -g @github/copilot`
- **Version Check**: `copilot --version`

## Usage Patterns
The GitHub Copilot CLI CLI can be invoked in several ways:
1. Direct execution: `copilot [arguments]`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call GitHub Copilot CLI from another CLI tool:
```bash
# Use stigmergy command
stigmergy copilot "[task description]"

# Examples:
stigmergy copilot "分析这段代码"
stigmergy copilot "翻译这段文字"
stigmergy copilot "写一个Python函数"
```

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\Zhang\.copilot\mcp`

## Last Updated
2025-12-14T10:20:50.711Z

---
*This file is automatically managed by Stigmergy CLI*
