---
name: resumesession
description: Cross-CLI session recovery and history management skill
author: stigmergy
version: 2.2.0
---

# ResumeSession Skill

Cross-CLI session recovery and history management skill for Claude CLI with cross-platform support.

## Description

This skill enables Claude CLI to quickly recover the latest session from previous conversations across different operating systems (Windows, macOS, Linux).

## Usage

### Quick Start - Recover Latest Session (Recommended)

To quickly recover latest session for current project from any CLI:

```javascript
// Use stigmergy command directly (recommended)
Bash("stigmergy resume");
```

Alternative approaches:

```bash
# Use quick-resume (simpler, works in Claude CLI directly)
Bash("node ~/.claude/skills/resumesession/quick-resume.js")
```

Alternative approaches:

```bash
# Use npx to run without global installation
Bash("npx stigmergy-CLI-Multi-Agents resume")

# Direct path approach (Windows compatible via __dirname)
Bash("node -e \"require('path').join(require('os').homedir(), '.claude/skills/resumesession/independent-resume.js')\"")
```

This command:

- Automatically detects the current project
- Finds the latest session across all CLI tools (Claude, Gemini, Qwen, iFlow, CodeBuddy, Codex, QoderCLI, OpenCode)
- Displays session summary and recent conversation content
- No intermediate steps are shown to the user

### Advanced Options

For more detailed session exploration:

```bash
# Show sessions from specific CLI (e.g., claude)
Bash("stigmergy resume --cli claude")

# List all recent sessions
Bash("stigmergy resume --list")

# Search sessions by content
Bash("stigmergy resume --search <keyword>")
```

## Workflow

When a user asks to recover a previous conversation (e.g., "恢复 Claude 的上次对话"):

1. **Execute the resume command**:

   ```javascript
   Bash("stigmergy resume");
   ```

2. **Display the result directly** (concise format):

   ```
   [2026/2/6 14:30] CLAUDE
   👤 请保存版本，更新库，推送到远程库
   🤖 Git Commit: Cognitive Bias Tests & Challenges
   ```

3. **Continue the conversation** based on the recovered context

## Cross-Platform Compatibility

This skill is designed to work across different operating systems:

### Windows, macOS, and Linux Support

- Uses `require("os").homedir()` to dynamically determine user home directory
- On Windows: `C:\Users\Username`
- On macOS/Linux: `/home/username` or `/Users/username`
- Then appends the standardized path: `/.claude/skills/resumesession/`

### Platform-Specific Path Resolution

```javascript
// This resolves to the correct path on any platform:
// Windows: C:\Users\Username\.claude\skills\resumesession\independent-resume.js
// macOS/Linux: /home/username/.claude/skills/resumesession/independent-resume.js
require("os").homedir() + "/.claude/skills/resumesession/independent-resume.js";
```

## Features

- ✅ Cross-platform compatibility (Windows, macOS, Linux) using `require("os").homedir()`
- ✅ Quick recovery of the latest session
- ✅ Clean output without intermediate steps
- ✅ Automatic project detection
- ✅ Session summary and recent conversation preview
- ✅ Cross-CLI support (Claude, Gemini, Qwen, iFlow, CodeBuddy, Codex, QoderCLI, OpenCode)
- ✅ Relative time display (e.g., "5 minutes ago")
- ✅ Number-based session selection
- ✅ CLI-specific filtering
- ✅ Project-aware session management

## Configuration

The skill automatically detects the current project path and scans session directories for all supported CLI tools.

Session paths are automatically detected across platforms using cross-platform logic:

- `~/.claude/projects` or `~\AppData\Roaming\claude\projects` (Claude)
- `~/.config/gemini/tmp` or `~\AppData\Roaming\gemini\tmp` (Gemini)
- `~/.qwen/projects` or `~\AppData\Roaming\qwen\projects` (Qwen)
- `~/.iflow/projects` or `~\AppData\Roaming\iflow\projects` (iFlow)
- `~/.codebuddy` or `~\AppData\Roaming\codebuddy` (CodeBuddy)
- `~/.config/codex` or `~\AppData\Roaming\codex` (Codex)
- `~/.qoder/projects` or `~\AppData\Roaming\qoder\projects` (QoderCLI)
- `~/.opencode/sessions` or `~\AppData\Roaming\opencode\sessions` (OpenCode)

## Notes

This skill requires the Stigmergy CLI to be installed globally with `npm install -g stigmergy-CLI-Multi-Agents`. The resume scripts handle all session scanning and formatting logic with cross-platform compatibility.

**Best Practice**: Use the cross-platform approach with `require("os").homedir()` to ensure compatibility across all operating systems.
