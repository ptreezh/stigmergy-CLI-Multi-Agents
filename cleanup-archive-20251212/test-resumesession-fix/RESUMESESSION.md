# ResumeSession Integration

This project is configured for cross-CLI session recovery with ResumeSession.

## Supported CLI Tools
- claude
- gemini
- qwen
- iflow
- codebuddy
- qodercli
- codex

## Usage

In any of the supported CLI tools, use the following commands:

### Basic Commands
- `/history` - Show all project sessions (most recent first)
- `/history --cli <tool>` - Show sessions from specific CLI
- `/history --search <keyword>` - Search sessions by content
- `/history --limit <number>` - Limit number of sessions shown

### Time-based Filtering
- `/history --today` - Show today's sessions only
- `/history --week` - Show sessions from last 7 days
- `/history --month` - Show sessions from last 30 days

### View Formats
- `/history --format summary` - Summary view (default)
- `/history --format timeline` - Chronological timeline
- `/history --format detailed` - Detailed session information
- `/history --format context` - Get context to continue conversation

### Examples
```bash
# Show all React-related sessions
/history --search "react"

# Show recent Claude sessions
/history --cli claude --today

# Get context from most recent session
/history --format context

# Show timeline of all sessions
/history --format timeline
```

## Features
- ✅ Cross-CLI session discovery
- ✅ Project-aware filtering
- ✅ Time-based sorting (most recent first)
- ✅ Content search
- ✅ Context recovery
- ✅ Multiple view formats

## Configuration
Configuration is saved in `.resumesession` file in project root.

## Need Help?
Run `resumesession --help` for more commands.
