# iFlow CLI CLI Documentation

## Overview
This document contains configuration and usage information for the iFlow CLI CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: iflow
- **Tool Name**: iFlow CLI
- **Installation Command**: `npm install -g @iflow-ai/iflow-cli`
- **Version Check**: `iflow --version`

## Usage Patterns
The iFlow CLI CLI can be invoked in several ways:
1. Direct execution: `iflow [arguments]`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call iFlow CLI from another CLI tool:
```bash
# Use stigmergy command
stigmergy iflow "[task description]"

# Examples:
stigmergy iflow "分析这段代码"
stigmergy iflow "翻译这段文字"
stigmergy iflow "写一个Python函数"
```

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex, glm4

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\Zhang\.iflow\hooks`

## Last Updated
2025-12-14T10:20:50.710Z

---
*This file is automatically managed by Stigmergy CLI*
