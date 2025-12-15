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
# From any other supported CLI
use iflow to [task description]
# or
call iflow [task description]
# or
ask iflow [task description]
```

## Configuration
This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\WIN10\.iflow\hooks`

## Last Updated
2025-12-09T14:06:21.978Z

---
*This file is automatically managed by Stigmergy CLI*
