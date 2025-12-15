# Qoder CLI CLI Documentation

## Overview
This document contains configuration and usage information for the Qoder CLI CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: qodercli
- **Tool Name**: Qoder CLI
- **Installation Command**: `npm install -g @qoder-ai/qodercli`
- **Version Check**: `qodercli --version`

## Usage Patterns
The Qoder CLI CLI can be invoked in several ways:
1. Direct execution: `qodercli [arguments]`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call Qoder CLI from another CLI tool:
```bash
# Use stigmergy command
stigmergy qodercli "[task description]"

# Examples:
stigmergy qodercli "分析这段代码"
stigmergy qodercli "翻译这段文字"
stigmergy qodercli "写一个Python函数"
```

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex, glm4

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\Zhang\.qoder\hooks`

## Last Updated
2025-12-14T10:20:50.711Z

---
*This file is automatically managed by Stigmergy CLI*
