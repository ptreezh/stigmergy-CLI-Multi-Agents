# Qwen CLI CLI Documentation

## Overview
This document contains configuration and usage information for the Qwen CLI CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: qwen
- **Tool Name**: Qwen CLI
- **Installation Command**: `npm install -g @qwen-code/qwen-code`
- **Version Check**: `qwen --version`

## Usage Patterns
The Qwen CLI CLI can be invoked in several ways:
1. Direct execution: `qwen [arguments]`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call Qwen CLI from another CLI tool:
```bash
# Use stigmergy command
stigmergy qwen "[task description]"

# Examples:
stigmergy qwen "分析这段代码"
stigmergy qwen "翻译这段文字"
stigmergy qwen "写一个Python函数"
```

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\Zhang\.qwen\hooks`

## Last Updated
2025-12-14T10:20:50.710Z

---
*This file is automatically managed by Stigmergy CLI*
