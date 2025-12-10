# GitHub Copilot CLI CLI Documentation

## Overview
This document contains configuration and usage information for the GitHub Copilot CLI CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: copilot
- **Tool Name**: GitHub Copilot CLI
- **Installation Command**: `npm install -g @github/copilot-cli`
- **Version Check**: `copilot --version`

## Usage Patterns
The GitHub Copilot CLI CLI can be invoked in several ways:
1. Direct execution: `copilot [arguments]`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call GitHub Copilot CLI from another CLI tool:
```bash
# From any other supported CLI
use copilot to [task description]
# or
call copilot [task description]
# or
ask copilot [task description]
```

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\WIN10\.copilot\mcp`

## Last Updated
2025-12-09T14:06:21.978Z

---
*This file is automatically managed by Stigmergy CLI*
