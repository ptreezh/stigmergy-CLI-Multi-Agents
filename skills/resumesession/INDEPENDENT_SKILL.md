---
name: resumesession
description: Cross-CLI session recovery and history management skill
author: stigmergy
version: 2.0.0
---

# ResumeSession Skill

Cross-CLI session recovery and history management skill.

## Description

This skill provides a cross-CLI session recovery tool that:
- Can be deployed and used independently
- Helps all CLI tools recover sessions across different CLI environments
- **Automatically detects installed CLI tools** - no manual configuration required
- **Prioritizes stigmergy configuration** if available, falls back to automatic detection
- Supports intelligent project-based filtering
- Provides flexible session browsing and recovery options

**Configuration Strategy**:
1. **Priority 1**: Uses stigmergy configuration (if installed and configured)
2. **Priority 2**: Falls back to automatic detection (scans common locations)
3. **No manual configuration required** in either case

## Core Features

### 1. Default Behavior - Recover Current Project's Latest Session

Recover the latest session from current project directory (regardless of which CLI created it):

```bash
# Use the tool
node independent-resume.js

# Or if globally installed
resume-session
```

This command:
- **Identifies current project** by working directory
- **Finds most recent session** from current project (any CLI)
- **Displays full session content** for immediate recovery

### 2. Number Parameter - Show Recent Sessions

Display a summary list of the most recent N sessions from current project:

```bash
# Show 5 most recent sessions
node independent-resume.js 5

# Show 10 most recent sessions
node independent-resume.js 10
```

This displays a summary list with:
- Session index number
- CLI name
- Project name
- Timestamp
- Session ID
- Content preview (first 200 characters)
- File path

### 3. CLI Parameter - Show Specific CLI Sessions

Display sessions from a specific CLI related to current project:

```bash
# Show iFlow sessions
node independent-resume.js iflow

# Show 3 most recent iFlow sessions
node independent-resume.js iflow 3

# Show Claude sessions
node independent-resume.js claude

# Show 5 most recent Gemini sessions
node independent-resume.js gemini 5
```

### 4. --all Parameter - Show All CLI Sessions for Current Project

Display all CLI sessions related to current project:

```bash
# Show all CLI sessions for current project
node independent-resume.js --all
```

This shows sessions from all CLI tools (Claude, Gemini, Qwen, iFlow, etc.) that are related to the current project.

### 5. --complete Parameter - Show All Projects' Sessions

Display all sessions from all CLI tools grouped by project:

```bash
# Show all CLI sessions from all projects
node independent-resume.js --complete
```

This provides a comprehensive view of all sessions across all projects and CLI tools.

## Installation & Deployment

### Option 1: Global Installation (Recommended)

```bash
# Navigate to the tool directory
cd /path/to/resumesession

# Install globally
npm install -g .

# Now you can use from anywhere
resume-session
```

### Option 2: Direct Node.js Execution

```bash
# Navigate to the tool directory
cd /path/to/resumesession

# Run directly with Node.js
node independent-resume.js [parameters]
```

### Option 3: Copy to Local Path

```bash
# Copy to your preferred location
cp independent-resume.js ~/.local/bin/resume-session

# Make it executable (Linux/Mac)
chmod +x ~/.local/bin/resume-session

# Add to PATH in your shell config
export PATH="$PATH:$HOME/.local/bin"
```

### Option 4: Use from CLI Skill Directory

Since the skill is deployed to CLI tools, you can reference the relative path:

```bash
# If skill is deployed to CLI's skills directory
node ../resumesession/independent-resume.js

# Or use full path
node ~/.claude/skills/resumesession/independent-resume.js
```

## Usage in CLI Skills

When integrating this tool into CLI skills, use the appropriate command based on deployment:

```javascript
// If globally installed
Bash("resume-session")

// If using relative path from skill directory
Bash("node ../resumesession/independent-resume.js")

// If using full path
Bash("node ~/.claude/skills/resumesession/independent-resume.js")
```

## Command Reference

| Parameter | Description |
|-----------|-------------|
| (none) | Recover current project's latest session (any CLI) |
| `[number]` | Show N most recent sessions from current project |
| `[cli-name]` | Show sessions from specific CLI for current project |
| `[cli-name] [number]` | Show N most recent sessions from specific CLI |
| `--all` | Show all CLI sessions for current project |
| `--complete` | Show all sessions from all projects |
| `--help` | Display help information |

## Supported CLIs

This tool automatically detects CLI tools by scanning common installation locations. No manual configuration required.

**Supported CLI Tools**:
- Claude
- Gemini
- Qwen
- iFlow
- CodeBuddy
- Codex
- QoderCLI
- Kode

**Automatic Detection**:
The tool scans the following locations for each CLI:
- `~/.cli-name/projects/` (Linux/Mac)
- `~/.config/cli-name/projects/` (Linux/Mac)
- `~/AppData/Roaming/cli-name/projects/` (Windows)

**Custom Installation**:
If a CLI is installed in a custom location, ensure the session directory is accessible. The tool scans multiple candidate paths automatically and finds the first valid location.

## Project Recognition

The tool uses intelligent project recognition (in priority order):

1. **Exact Match**: Project name exactly matches current directory name
2. **Path Contains**: Project name is in current working directory path
3. **Name Contains**: Current directory name is in project name
4. **File Path**: Session file path contains current working directory path

All matching is case-insensitive.

## Examples

### Example 1: Quick Recovery

```bash
# User is working on project "my-app" and wants to continue previous conversation
cd ~/projects/my-app
resume-session

# Output:
# Current working directory: /home/user/projects/my-app
# Found 3 related sessions, showing latest session:
#
# ================================================================================
# Session Source: iFlow
# Project: my-app
# Time: 2026/1/13 14:30:25 (5 minutes ago)
# Session ID: abc123
# ================================================================================
#
# [User]: Help me implement user authentication
# [Assistant]: I'll help you implement user authentication...
# ...
```

### Example 2: Browse Recent Sessions

```bash
cd ~/projects/my-app
resume-session 5

# Output:
# Found 8 sessions (showing first 5):
# ================================================================================
#
# [1] iFlow - my-app
#     Time: 2026/1/13 14:30:25 (5 minutes ago)
#     Session ID: abc123
#     Summary: [User]: Help me implement user authentication [Assistant]: I'll help...
# --------------------------------------------------------------------------------
#
# [2] Claude - my-app
#     Time: 2026/1/13 12:15:10 (2 hours ago)
#     Session ID: def456
#     Summary: [User]: How to optimize database queries? [Assistant]: Consider using...
# --------------------------------------------------------------------------------
# ...
```

### Example 3: Filter by CLI

```bash
cd ~/projects/my-app
resume-session iflow 3

# Output:
# Found 5 iFlow sessions (showing first 3):
# ================================================================================
#
# [1] iFlow - my-app
#     Time: 2026/1/13 14:30:25 (5 minutes ago)
#     Session ID: abc123
#     Summary: [User]: Help me implement user authentication [Assistant]: I'll help...
# --------------------------------------------------------------------------------
# ...
```

### Example 4: View All CLI Sessions

```bash
cd ~/projects/my-app
resume-session --all

# Output:
# Current working directory: /home/user/projects/my-app
#
# Found 12 sessions:
# ================================================================================
#
# [1] iFlow - my-app
#     Time: 2026/1/13 14:30:25 (5 minutes ago)
#     Session ID: abc123
#     Summary: [User]: Help me implement user authentication [Assistant]: I'll help...
# --------------------------------------------------------------------------------
# ...
```

### Example 5: View All Projects

```bash
resume-session --complete

# Output:
# ================================================================================
# Session List (Grouped by Project)
# ================================================================================
#
# my-app (5 sessions)
# --------------------------------------------------------------------------------
#   iFlow - 2026/1/13 14:30:25 (5 minutes ago)
#     Session ID: abc123
#   Claude - 2026/1/13 12:15:10 (2 hours ago)
#     Session ID: def456
# ...
#
# another-project (3 sessions)
# --------------------------------------------------------------------------------
#   Gemini - 2026/1/12 16:45:30 (1 day ago)
#     Session ID: xyz789
# ...
```

## Features

- ✅ **Universal Recovery**: Finds latest session across all CLIs automatically
- ✅ **Smart Project Recognition**: Automatically matches sessions to current project
- ✅ **Flexible Filtering**: Filter by CLI, number, or view all sessions
- ✅ **Full Content Recovery**: Displays complete session content by default
- ✅ **Summary View**: Optional summary view for browsing sessions
- ✅ **Cross-CLI Support**: Works with any CLI configured in stigmergy
- ✅ **Multiple Deployment Options**: Can be installed globally or used from any location
- ✅ **Easy Integration**: Simple to integrate into any CLI skill
- ✅ **Relative Time Display**: Shows relative time for better UX

## Notes

**Best Practice**: Always run the tool from your project directory to ensure accurate project recognition.

**Configuration Management**: CLI paths and detection are managed by stigmergy. The tool reads configuration from `~/.stigmergy/config.json`. Must run stigmergy CLI initialization before using this tool.

**Default Behavior**: When no parameters are provided, the tool recovers the latest session from the current project with full content for immediate context recovery.

**Path Resolution**: The tool can be invoked using:
- Global installation path (if installed globally)
- Local path (if copied to a local directory)
- Relative path from CLI's skill directory
- Full absolute path

## Troubleshooting

### No sessions found

If no sessions are found:
- Ensure at least one CLI tool has created sessions
- Check if CLI session directories exist
- Use `--complete` to see all sessions from all projects
- Verify that CLI tools are installed and have created sessions

### CLI not detected

If a CLI tool is not detected:
- The tool automatically scans common installation locations
- If CLI is installed in a custom location, ensure the session directory is accessible
- Check if the CLI has created any sessions yet
- The tool scans multiple candidate paths automatically

### Current project sessions not found

If current project sessions are not found:
- Ensure you're in the correct project directory
- Use `--complete` to view all projects' sessions
- Check if session project names match current directory
- Try running from parent directory

### Cannot read session content

If session content cannot be read:
- Verify session files are valid JSON
- Ensure session files are not locked by other programs
- Check file permissions

### Wrong sessions found

If wrong sessions are found:
- Project name matching may have matched similar projects
- Use `--all` to see all matching sessions
- Use CLI name parameter to filter specific CLI
- Check if project name is similar to other projects

## License

MIT License

## Author

stigmergy
