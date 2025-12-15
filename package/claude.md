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
# From any other supported CLI
use claude to [task description]
# or
call claude [task description]
# or
ask claude [task description]
```

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\WIN10\.claude\hooks`

## Last Updated
2025-12-09T14:06:21.978Z

---
*This file is automatically managed by Stigmergy CLI*
