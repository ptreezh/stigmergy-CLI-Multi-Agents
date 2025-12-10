# OpenAI Codex CLI CLI Documentation

## Overview
This document contains configuration and usage information for the OpenAI Codex CLI CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: codex
- **Tool Name**: OpenAI Codex CLI
- **Installation Command**: `npm install -g openai-codex-cli`
- **Version Check**: `codex --version`

## Usage Patterns
The OpenAI Codex CLI CLI can be invoked in several ways:
1. Direct execution: `codex [arguments]`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call OpenAI Codex CLI from another CLI tool:
```bash
# From any other supported CLI
use codex to [task description]
# or
call codex [task description]
# or
ask codex [task description]
```

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\WIN10\.config\codex\slash_commands`

## Last Updated
2025-12-09T14:06:21.978Z

---
*This file is automatically managed by Stigmergy CLI*
