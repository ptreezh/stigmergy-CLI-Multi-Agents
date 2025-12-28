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
- kode

## Usage

In any of the supported CLI tools, use the following commands:

### Basic Commands
- `/stigmergy-resume` - Show all project sessions (most recent first)
- `/stigmergy-resume --cli <tool>` - Show sessions from specific CLI
- `/stigmergy-resume --search <keyword>` - Search sessions by content
- `/stigmergy-resume --limit <number>` - Limit number of sessions shown

### Time-based Filtering
- `/stigmergy-resume --today` - Show today's sessions only
- `/stigmergy-resume --week` - Show sessions from last 7 days
- `/stigmergy-resume --month` - Show sessions from last 30 days

### View Formats
- `/stigmergy-resume --format summary` - Summary view (default)
- `/stigmergy-resume --format timeline` - Chronological timeline
- `/stigmergy-resume --format detailed` - Detailed session information
- `/stigmergy-resume --format context` - Get context to continue conversation

### Examples
```bash
# Show all React-related sessions
/stigmergy-resume --search "react"

# Show recent Claude sessions
/stigmergy-resume --cli claude --today

# Get context from most recent session
/stigmergy-resume --format context

# Show timeline of all sessions
/stigmergy-resume --format timeline
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
