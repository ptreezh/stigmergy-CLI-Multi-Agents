# CodeBuddy CLI CLI Documentation

## Overview
This document contains configuration and usage information for the CodeBuddy CLI CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: codebuddy
- **Tool Name**: CodeBuddy CLI
- **Installation Command**: `npm install -g @tencent-ai/codebuddy-code`
- **Version Check**: `codebuddy --version`

## Usage Patterns
The CodeBuddy CLI CLI can be invoked in several ways:
1. Direct execution: `codebuddy [arguments]`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call CodeBuddy CLI from another CLI tool:
```bash
# Use stigmergy command
stigmergy codebuddy "[task description]"

# Examples:
stigmergy codebuddy "分析这段代码"
stigmergy codebuddy "翻译这段文字"
stigmergy codebuddy "写一个Python函数"
```

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\Zhang\.codebuddy\hooks`

## Last Updated
2025-12-14T10:20:50.711Z

---
*This file is automatically managed by Stigmergy CLI*
