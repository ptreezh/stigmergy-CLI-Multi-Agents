---
name: resumesession
description: Cross-CLI session recovery and history management skill
author: stigmergy
version: 1.0.0
---

# ResumeSession Skill

Cross-CLI session recovery and history management skill for Qoder CLI.

## Description

This skill enables Qoder CLI to:
- Scan and display sessions from all supported CLI tools (Claude, Gemini, Qwen, iFlow, CodeBuddy, Codex, QoderCLI)
- Filter sessions by CLI tool, time range, or search terms
- Recover context from previous sessions
- Provide multiple view formats (summary, timeline, detailed, context)

## Usage

### Basic Commands

Use the Bash tool to invoke ResumeSession functionality:

```bash
# Show all project sessions
Bash("stigmergy resume")

# Show sessions from specific CLI
Bash("stigmergy resume --cli claude")

# Search sessions by content
Bash("stigmergy resume --search react")

# Show today's sessions only
Bash("stigmergy resume --today")

# Show sessions from last 7 days
Bash("stigmergy resume --week")

# Show sessions from last 30 days
Bash("stigmergy resume --month")

# Limit number of sessions shown
Bash("stigmergy resume --limit 5")

# Use different view formats
Bash("stigmergy resume --format timeline")
Bash("stigmergy resume --format detailed")
Bash("stigmergy resume --format context")

# Get context from most recent session
Bash("stigmergy resume --format context")
```

### Examples

```bash
# Show all React-related sessions
Bash("stigmergy resume --search react")

# Show recent Claude sessions
Bash("stigmergy resume --cli claude --today")

# Get context from most recent session
Bash("stigmergy resume --format context")

# Show timeline of all sessions
Bash("stigmergy resume --format timeline")
```

## Features

- ✅ Cross-CLI session discovery
- ✅ Project-aware filtering
- ✅ Time-based sorting (most recent first)
- ✅ Content search
- ✅ Context recovery
- ✅ Multiple view formats

## Configuration

The skill automatically detects the current project path and scans session directories for all supported CLI tools.

Session paths are automatically detected from:
- `~/.claude/projects` (Claude)
- `~/.config/gemini/tmp` (Gemini)
- `~/.qwen/projects` (Qwen)
- `~/.iflow/projects` (iFlow)
- `~/.codebuddy` (CodeBuddy)
- `~/.config/codex` (Codex)
- `~/.qoder/projects` (QoderCLI)

## Notes

This skill requires the Stigmergy CLI to be installed and configured. The `stigmergy resume` command handles all session scanning and formatting logic.