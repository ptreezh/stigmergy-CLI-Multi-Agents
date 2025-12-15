# Gemini CLI CLI Documentation

## Overview
This document contains configuration and usage information for the Gemini CLI CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: gemini
- **Tool Name**: Gemini CLI
- **Installation Command**: `npm install -g @google/gemini-cli`
- **Version Check**: `gemini --version`

## Usage Patterns
The Gemini CLI CLI can be invoked in several ways:
1. Direct execution: `gemini [arguments]`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call Gemini CLI from another CLI tool:
```bash
# Use stigmergy command
stigmergy gemini "[task description]"

# Examples:
stigmergy gemini "分析这段代码"
stigmergy gemini "翻译这段文字"
stigmergy gemini "写一个Python函数"
```

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex, glm4

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\Zhang\.gemini\extensions`

## Last Updated
2025-12-14T10:20:50.710Z

---
*This file is automatically managed by Stigmergy CLI*
