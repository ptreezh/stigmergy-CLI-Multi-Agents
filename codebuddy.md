# CodeBuddy CLI CLI Documentation

## Overview
This document contains configuration and usage information for the CodeBuddy CLI CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: codebuddy
- **Tool Name**: CodeBuddy CLI
- **Installation Command**: `npm install -g codebuddy-cli`
- **Version Check**: `codebuddy --version`

## Usage Patterns
The CodeBuddy CLI CLI can be invoked in several ways:
1. Direct execution: `codebuddy [arguments]`
2. Through Stigmergy coordination layer
3. Cross-CLI calls from other tools

## Cross-CLI Communication
To call CodeBuddy CLI from another CLI tool:
```bash
# From any other supported CLI
use codebuddy to [task description]
# or
call codebuddy [task description]
# or
ask codebuddy [task description]
```

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\WIN10\.codebuddy\hooks`

## Last Updated
2025-12-09T14:06:21.978Z

---
*This file is automatically managed by Stigmergy CLI*
