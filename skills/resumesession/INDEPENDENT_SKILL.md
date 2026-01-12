---
name: resumesession
description: Cross-CLI session recovery and history management skill
author: stigmergy
version: 1.0.0
---

# ResumeSession Skill

Cross-CLI session recovery and history management skill for Claude CLI.

## Description

This skill enables Claude CLI to:
- **Quickly recover the latest session** from all supported CLI tools
- Compare sessions across CLIs to find the most recent one
- Display full session content for immediate context recovery
- Advanced mode: list sessions or show summary only
- **Completely independent**: Does NOT depend on Stigmergy installation

## Usage

### Default Mode - Recover Latest Session (Recommended)

To quickly recover the latest session from any CLI:

```bash
# Use independent recovery tool (no Stigmergy dependency)
Bash("node {stigmergy_cli_path}/independent-resume.js")
```

**Important**: Since this tool is completely independent, you need to specify the path to the tool:
- Replace `{stigmergy_cli_path}` with the actual path to `independent-resume.js`
- For example: `C:\Users\YourName\.stigmergy\cli\independent-resume.js`
- Or install this tool globally and use: `resume-session`

This command:
- **Compares all CLIs** (Claude, Gemini, Qwen, iFlow, CodeBuddy, Codex, QoderCLI, Kode)
- **Finds the most recent session** across all tools
- **Displays full session content** for immediate context recovery
- **No intermediate steps** shown to user
- **Silent operation** - only the recovered session is displayed

### Advanced Options

For more advanced usage:

```bash
# List all sessions without recovering (show available sessions)
Bash("node {stigmergy_cli_path}/independent-resume.js --list")

# Show summary only (not full content)
Bash("node {stigmergy_cli_path}/independent-resume.js --summary")

# Recover latest session from specific CLI only
Bash("node {stigmergy_cli_path}/independent-resume.js --cli claude")
Bash("node {stigmergy_cli_path}/independent-resume.js --cli iflow")
```

## Workflow

### Standard Workflow (Default)

When a user asks to recover a previous conversation (e.g., "恢复上次对话", "恢复 Claude 的上次对话"):

1. **Execute recovery command**:
   ```bash
   Bash("node {stigmergy_cli_path}/independent-resume.js")
   ```

2. **The tool will**:
   - Scan all CLI session directories
   - Compare modification times across all CLIs
   - Find the most recent session
   - Display complete session content

3. **Display result directly to the user**:
   - Session metadata (source CLI, time, file)
   - Full conversation content
   - No intermediate steps or debug information

4. **Continue the conversation** based on the recovered context

### Advanced Workflow

When a user needs to explore sessions:

1. **List available sessions**:
   ```bash
   Bash("node {stigmergy_cli_path}/independent-resume.js --list")
   ```

2. **User selects which session to recover** based on the list

3. **Recover specific CLI's latest session**:
   ```bash
   Bash("node {stigmergy_cli_path}/independent-resume.js --cli <cli-name>")
   ```

## Installation & Deployment

This tool is designed to be **completely independent** and does not depend on Stigmergy.

### Option 1: Install Globally (Recommended)

```bash
# Copy to a global location
npm install -g https://github.com/your-repo/independent-resume

# Then you can use from anywhere
resume-session
```

### Option 2: Copy to Local Path

```bash
# Copy to your preferred location
cp independent-resume.js ~/.local/bin/resume-session

# Add to PATH in your shell config
export PATH="$PATH:$HOME/.local/bin"
```

### Option 3: Use Relative Path from Current CLI

Since the skill file is deployed to CLI tools, it can reference the relative path to `independent-resume.js`:

```bash
# Assuming skill is deployed to ~/.claude/skills/resumesession/
Bash("node ../independent-resume.js")  # If in CLI root
Bash("node ~/.claude/skills/resumesession/independent-resume.js")  # Full path
```

## Features

- ✅ **Universal Recovery**: Finds the latest session across all CLIs automatically
- ✅ **Smart Comparison**: Compares modification times to find the most recent session
- ✅ **Full Content Recovery**: Displays complete session content by default
- ✅ **Silent Operation**: No intermediate steps or debug output
- ✅ **Cross-CLI Support**: Works with Claude, Gemini, Qwen, iFlow, CodeBuddy, Codex, QoderCLI, Kode
- ✅ **Completely Independent**: Does NOT depend on Stigmergy installation
- ✅ **Flexible Deployment**: Can be installed globally or used from any location
- ✅ **Advanced Mode**: Optional listing and summary-only modes

## Command Options

- `--list` or `-l`: List all available sessions without recovering (advanced mode)
- `--summary` or `-s`: Show session summary only, not full content (advanced mode)
- `--cli <name>`: Recover latest session from a specific CLI only (advanced mode)

## Supported CLIs

- Claude (`.claude/projects/`)
- Gemini (`.config/gemini/tmp/`)
- Qwen (`.qwen/projects/`)
- iFlow (`.iflow/projects/`)
- CodeBuddy (`.codebuddy/`)
- Codex (`.config/codex/`)
- QoderCLI (`.qoder/projects/`)
- Kode (`.kode/projects/`)

## Notes

**Important**: This tool is completely independent and does NOT require Stigmergy to be installed.

**Default behavior**: Always recovers the latest session with full content for immediate context recovery without any user interaction or intermediate steps.

**Path Resolution**: You need to provide the correct path to `independent-resume.js` in the command. This can be:
- A global installation path
- A local path
- A relative path from the CLI's skill directory
