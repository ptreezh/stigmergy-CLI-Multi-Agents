# Qwen CLI CLI Documentation

## Overview
This document contains configuration and usage information for the Qwen CLI CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: qwen
- **Tool Name**: Qwen CLI
- **Installation Command**: `npm install -g @alibaba/qwen-cli`
- **Version Check**: `qwen --version`

## Usage Patterns
The Qwen CLI CLI can be invoked in several ways:
1. Direct execution: `qwen [arguments]`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call Qwen CLI from another CLI tool:
```bash
# From any other supported CLI
use qwen to [task description]
# or
call qwen [task description]
# or
ask qwen [task description]
```

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\WIN10\.qwen\hooks`

## Last Updated
2025-12-09T14:06:21.978Z

---
*This file is automatically managed by Stigmergy CLI*
