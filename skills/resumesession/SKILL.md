---
name: resumesession
description: Cross-CLI session recovery and history management skill
author: stigmergy
version: 2.0.0
---

# ResumeSession Skill

Cross-CLI session recovery and history management skill for all CLI tools.

## Description

This skill enables session recovery across all supported CLI tools with intelligent project-based filtering.

## Usage

### Default Behavior - Recover Current Project's Latest Session

To quickly recover current project's latest session:

```bash
# Use stigmergy resume command
stigmergy resume
```

This command:
- **Filters by current project** (only shows sessions from current working directory)
- **Finds most recent session** from current project
- **Checks session content** - if latest session is empty, it recovers previous one
- **Displays context** for immediate recovery

### Show Multiple Sessions (Current Project Only)

To show multiple sessions from current project:

```bash
# Show 5 most recent sessions
stigmergy resume 5

# Show 10 most recent sessions
stigmergy resume 10
```

### Show Sessions from Specific CLI

To show sessions from a specific CLI (current project only):

```bash
# Show iFlow sessions
stigmergy resume iflow

# Show 3 iFlow sessions
stigmergy resume iflow 3
```

### Show All Projects' Sessions

To show sessions from all projects:

```bash
# Show all projects' sessions (default: 10 per CLI)
stigmergy resume --all

# Show all projects' sessions with limit
stigmergy resume --all 5
```

### Advanced Filters

```bash
# Search sessions by keyword
stigmergy resume --search "react"

# Show today's sessions
stigmergy resume --today

# Show sessions from last 7 days
stigmergy resume --week

# Show sessions from last 30 days
stigmergy resume --month

# Use different view formats
stigmergy resume --format timeline
stigmergy resume --format detailed
```

## Features

- ✅ **Project-Aware**: Automatically filters sessions by current working directory
- ✅ **Smart Content Check**: Skips empty sessions and finds previous one
- ✅ **Default Context Recovery**: Shows latest session context by default
- ✅ **Number-Based Control**: Use numbers to show multiple sessions
- ✅ **CLI Filtering**: Filter sessions by specific CLI tool
- ✅ **Content Search**: Search sessions by keywords
- ✅ **Time Filtering**: Filter by date ranges (today, week, month)
- ✅ **Multiple View Formats**: summary, timeline, detailed, context
- ✅ **Cross-CLI Support**: Works with Claude, Gemini, Qwen, iFlow, CodeBuddy, Codex, QoderCLI, Kode

## Command Behavior

| Command | Behavior |
|---------|----------|
| `stigmergy resume` | Shows **latest session** from **current project** (context format) |
| `stigmergy resume 5` | Shows **5 most recent sessions** from **current project** (summary format) |
| `stigmergy resume iflow` | Shows **latest iFlow session** from **current project** |
| `stigmergy resume iflow 5` | Shows **5 iFlow sessions** from **current project** |
| `stigmergy resume --all` | Shows **all projects' sessions** (10 per CLI) |
| `stigmergy resume --all 5` | Shows **all projects' sessions** (5 per CLI) |

## Supported CLIs

- Claude: `~/.claude/projects/{project-name}/`
- Gemini: `~/.config/gemini/tmp/{hash}/chats/`
- Qwen: `~/.qwen/projects/{project-name}/chats/`
- iFlow: `~/.iflow/projects/{project-name}/`
- CodeBuddy: `~/.codebuddy/projects/{project-name}/`
- Codex: `~/.config/codex/`
- QoderCLI: `~/.qoder/projects/{project-name}/`
- Kode: `~/.kode/projects/{project-name}/`

## Notes

**Best Practice**: Always open your terminal in project directory before using `stigmergy resume`. This ensures you recover sessions relevant to your current project.

**Important**: By default, only sessions from **current working directory** are shown. Use `--all` to see sessions from all projects.
