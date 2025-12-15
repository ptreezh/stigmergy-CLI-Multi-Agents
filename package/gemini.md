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
# From any other supported CLI
use gemini to [task description]
# or
call gemini [task description]
# or
ask gemini [task description]
```

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\WIN10\.gemini\extensions`

## Last Updated
2025-12-09T14:06:21.978Z

---
*This file is automatically managed by Stigmergy CLI*
