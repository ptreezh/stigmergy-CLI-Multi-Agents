---
name: resumesession
description: Cross-CLI session recovery and history management skill
author: stigmergy
version: 2.2.0
---

# ResumeSession Skill

Cross-CLI session recovery and history management skill for all CLI tools with cross-platform support.

## Description

This skill enables Claude CLI and other AI assistants to recover and manage sessions across different CLI tools on multiple platforms (Windows, macOS, Linux). When users ask to "恢复上次对话" (recover last conversation) or "查看历史会话" (view session history), this skill provides intelligent project-based filtering and context recovery.

**Configuration**: CLI paths and detection are managed by stigmergy. The skill reads configuration from `~/.stigmergy/config.json`.

## When to Use This Skill

Use this skill when users request:
- 恢复上次对话 (recover last conversation)
- 查看历史会话 (view session history)
- 继续之前的讨论 (continue previous discussion)
- 找到之前的某个会话 (find a previous session)
- 查看某个 CLI 的会话 (view sessions from a specific CLI)

## How It Works

### 1. Identify User Intent

Analyze the user's request to determine:
- Whether they want to recover the latest session or browse multiple sessions
- Whether they want sessions from a specific CLI or all CLIs
- Whether they want sessions from current project or all projects

### 2. Execute Recovery Tool

Call the cross-platform recovery command with appropriate parameters:

```javascript
// Cross-platform approach using os.homedir() for automatic platform adaptation
Bash("node " + require("os").homedir() + "/.claude/skills/resumesession/independent-resume.js")

// Show 5 recent sessions from current project
Bash("node " + require("os").homedir() + "/.claude/skills/resumesession/independent-resume.js 5")

// Show iFlow sessions from current project
Bash("node " + require("os").homedir() + "/.claude/skills/resumesession/independent-resume.js iflow")

// Show all CLI sessions from current project
Bash("node " + require("os").homedir() + "/.claude/skills/resumesession/independent-resume.js --all")

// Show all sessions from all projects
Bash("node " + require("os").homedir() + "/.claude/skills/resumesession/independent-resume.js --complete")

// Alternative approach if stigmergy command is available:
// Bash("stigmergy resume")
```

### 3. Analyze and Present Results

The tool returns session data in a structured format. Use LLM intelligence to:
- Summarize the session content
- Highlight key information
- Provide context for continuation
- Help user select the right session if multiple are shown

### 4. Continue Conversation

After displaying the session content, ask the user:
- "是否要继续这个会话？" (Do you want to continue this session?)
- "需要查看其他会话吗？" (Do you need to view other sessions?)
- "需要我帮你做什么？" (What would you like me to do?)

## Cross-Platform Compatibility

This skill is designed to work across different operating systems using `require("os").homedir()`:

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
require("os").homedir() + "/.claude/skills/resumesession/independent-resume.js"
```

## Configuration

**No manual configuration required!** The tool automatically detects installed CLI tools using a two-tier strategy:

### Priority 1: Stigmergy Configuration (if available)

If stigmergy is installed and configured, the tool uses its CLI configuration:
- Reads from `~/.stigmergy/config.json`
- Uses stigmergy's scan results for CLI paths
- Supports custom CLI paths and multiple instances
- Provides the most accurate CLI detection

### Priority 2: Automatic Detection (fallback)

If stigmergy is not available or has no configuration, the tool automatically scans common installation locations:
- Scans multiple common paths for each CLI
- Supports both Linux/Mac and Windows paths
- Detects CLI tools without user intervention
- Works out of the box for most installations

**Scanned Locations** (for each CLI):
- `~/.cli-name/projects/` (Linux/Mac)
- `~/.config/cli-name/projects/` (Linux/Mac)
- `~/AppData/Roaming/cli-name/projects/` (Windows)

**Supported CLI Tools**:
- Claude
- Gemini
- Qwen
- iFlow
- CodeBuddy
- Codex
- QoderCLI
- Kode
- OpenCode

**Custom Installation Support**:
If a CLI is installed in a custom location:
- With stigmergy: Configure in stigmergy for best results
- Without stigmergy: The tool scans multiple candidate paths automatically

## Usage Examples

### Example 1: Quick Recovery

**User**: "恢复上次对话"

**AI Response**:
1. Execute: `node ` + `require("os").homedir() + "/.claude/skills/resumesession/independent-resume.js"`
2. Display the latest session content
3. Ask: "已恢复上次对话。是否要继续？"

### Example 2: Browse Recent Sessions

**User**: "查看最近几次会话"

**AI Response**:
1. Execute: `node ` + `require("os").homedir() + "/.claude/skills/resumesession/independent-resume.js 5"`
2. Display the 5 most recent sessions with summaries
3. Ask: "找到了 5 个会话。你想继续哪个？"

### Example 3: Filter by CLI

**User**: "看看 iFlow 的会话"

**AI Response**:
1. Execute: `node ` + `require("os").homedir() + "/.claude/skills/resumesession/independent-resume.js iflow"`
2. Display all iFlow sessions from current project
3. Ask: "找到了 X 个 iFlow 会话。你想继续哪个？"

### Example 4: View All Projects

**User**: "查看所有项目的会话"

**AI Response**:
1. Execute: `node ` + `require("os").homedir() + "/.claude/skills/resumesession/independent-resume.js --complete"`
2. Display sessions grouped by project
3. Ask: "你想查看哪个项目的会话？"

## Features

- ✅ **Cross-platform compatibility**: Works on Windows, macOS, and Linux using `require("os").homedir()`
- ✅ **Project-Aware**: Automatically filters sessions by current working directory
- ✅ **Default Context Recovery**: Shows latest session content by default
- ✅ **Number-Based Control**: Use numbers to show multiple sessions
- ✅ **CLI Filtering**: Filter sessions by specific CLI tool
- ✅ **All CLI View**: Show all CLI sessions for current project
- ✅ **Complete View**: Show all projects' sessions grouped by project
- ✅ **Cross-CLI Support**: Works with Claude, Gemini, Qwen, iFlow, CodeBuddy, Codex, QoderCLI, Kode, OpenCode
- ✅ **Smart Project Recognition**: Automatically matches sessions to current project
- ✅ **Relative Time Display**: Shows relative time (e.g., "5 minutes ago")

## Tool Parameters

| Parameter | Description |
|-----------|-------------|
| (none) | Recover latest session from current project |
| `[number]` | Show N most recent sessions from current project |
| `[cli-name]` | Show sessions from specific CLI (current project) |
| `[cli-name] [number]` | Show N sessions from specific CLI |
| `--all` | Show all CLI sessions from current project |
| `--complete` | Show all sessions from all projects |

## Supported CLIs

This skill supports any CLI tool that:
- Stores sessions in files (typically JSON)
- Can be configured in stigmergy
- Has extractable project and session information

**Common CLI Tools** (examples, not limited to):
- Claude
- Gemini
- Qwen
- iFlow
- CodeBuddy
- Codex
- QoderCLI
- Kode
- OpenCode

**Custom CLI Support**:
- Add any CLI to stigmergy configuration
- Support multiple instances of the same CLI
- Support custom installation paths
- Support custom session formats

## Notes

**Configuration Strategy**:
- **Priority 1**: Uses stigmergy configuration if available (most accurate)
- **Priority 2**: Falls back to automatic detection (works out of the box)
- No manual configuration required in either case
- Seamlessly switches between strategies based on environment

**Context Loading**: When recovering a session, load the conversation history as context for the LLM to understand the previous discussion.

**Project Awareness**: The tool automatically identifies the current project based on the working directory. Ensure users are in the correct project directory.

**Cross-Platform Best Practice**: Use the cross-platform approach with `require("os").homedir()` to ensure compatibility across all operating systems.

**Error Handling**: 
- If no sessions are found, inform the user and suggest they check if CLI tools have created sessions
- The tool automatically detects installed CLI tools (with or without stigmergy)
- If CLI is installed in a custom location, ensure the session directory is accessible