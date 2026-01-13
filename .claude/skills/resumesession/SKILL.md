---
name: resumesession
description: Cross-CLI session recovery and history management skill
author: stigmergy
version: 1.0.0
---

# ResumeSession Skill

Cross-CLI session recovery and history management skill for Claude CLI.

## Description

This skill enables Claude CLI to quickly recover the latest session from previous conversations.

## Usage

### Quick Start - Recover Latest Session (Recommended)

To quickly recover latest Claude session for current project:

```bash
# Use the simple version - directly recover latest session without intermediate steps
Bash("node D:\\stigmergy-CLI-Multi-Agents\\src\\cli\\commands\\simple-resume.js")
```

This command:
- Automatically detects the current project
- Finds the latest Claude session
- Displays session summary and recent conversation content
- No intermediate steps are shown to the user

### Advanced Options

For more detailed session exploration:

### Advanced Options

For more detailed session exploration, use the full version:

```bash
# Show timeline of all Claude sessions
Bash("node D:\\stigmergy-CLI-Multi-Agents\\src\\cli\\commands\\stigmergy-resume.js --cli claude --format timeline")

# Show today's sessions only
Bash("node D:\\stigmergy-CLI-Multi-Agents\\src\\cli\\commands\\stigmergy-resume.js --cli claude --today")

# Search sessions by content
Bash("node D:\\stigmergy-CLI-Multi-Agents\\src\\cli\\commands\\stigmergy-resume.js --search <keyword>")
```

## Workflow

When a user asks to recover a previous conversation (e.g., "恢复 Claude 的上次对话"):

1. **Execute the simple command**:
   ```bash
   Bash("node D:\\stigmergy-CLI-Multi-Agents\\src\\cli\\commands\\simple-resume.js")
   ```

2. **Display the result directly to the user** without showing intermediate steps

3. **Continue the conversation** based on the recovered context

## Features

- ✅ Quick recovery of the latest session
- ✅ Clean output without intermediate steps
- ✅ Automatic project detection
- ✅ Session summary and recent conversation preview
- ✅ Cross-CLI support (Claude, Gemini, Qwen, iFlow, CodeBuddy, Codex, QoderCLI)

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