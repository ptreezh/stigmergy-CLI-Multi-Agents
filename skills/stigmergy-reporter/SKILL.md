# Stigmergy Reporter Skill

## Purpose

This skill enables any AI agent to autonomously report its own state, memory, projects, and history to the Stigmergy coordination bus. Unlike external scanning, self-reporting is accurate by design and requires no reverse-engineering.

## Activation

**Important**: This skill is OPTIONAL. Only execute when:
- You are currently idle or between tasks
- You have just completed a significant task
- Your session is ending
- You have been explicitly asked to report

**Do NOT interrupt ongoing work to run this skill.**

## Bus Location

The reporting bus is located at: `{STIGMERGY_BUS_DIR}`

Default: `./bus` relative to the Stigmergy project root.

Environment variable: `STIGMERGY_BUS_DIR`

## Report Types

### 1. One-Time Report

**When**: First time this skill is loaded, or when your configuration changes significantly.

**Content**:
- Installation path
- Help/documentation files you can access
- Memory file formats and locations
- Session storage format
- Available commands and capabilities
- Project directories you have access to

**Destination**: `{STIGMERGY_BUS_DIR}/onetime/{agent-name}.json`

**Frequency**: Once per agent lifetime (unless re-injected)

### 2. Daily Report

**When**: First session of the day, or when explicitly requested.

**Content**:
- Yesterday's completed tasks
- Current active projects
- Current blockers
- Today's planned work
- Recent sessions summary

**Destination**: `{STIGMERGY_BUS_DIR}/daily/{agent-name}/{YYYY-MM-DD}.json`

**Frequency**: Once per day

### 3. Session Report

**When**: Session ending, or when explicitly requested.

**Content**:
- This session's working directory
- Files modified
- Key decisions made
- Tasks completed
- Next steps

**Destination**: `{STIGMERGY_BUS_DIR}/sessions/{agent-name}/{session-id}.json`

**Frequency**: Per session

## Report Format

All reports use JSON format for machine readability.

### One-Time Report Schema

```json
{
  "agent": "opencode",
  "reportType": "onetime",
  "timestamp": "2026-10-07T08:00:00Z",
  "installation": {
    "path": "~/.opencode",
    "version": "1.0.0",
    "configFiles": ["config.json", "settings.json"]
  },
  "capabilities": {
    "commands": ["/help", "/scan", "/skill"],
    "tools": ["read", "write", "bash", "grep"],
    "memoryAccess": true
  },
  "memory": {
    "files": ["CONFIG.md", "CROSS_CLI_GUIDE.md", "history.jsonl"],
    "sessionPattern": "storage/session/*/ses_*.json",
    "sessionFormat": "json"
  },
  "projects": [
    {
      "path": "D:\\socienceAI",
      "role": "primary",
      "lastActive": "2026-10-07T01:38:00Z"
    }
  ],
  "help": {
    "files": ["README.md", "AGENTS.md"],
    "content": "Brief summary of what you can do"
  }
}
```

### Daily Report Schema

```json
{
  "agent": "opencode",
  "reportType": "daily",
  "date": "2026-10-07",
  "timestamp": "2026-10-07T08:00:00Z",
  "yesterday": {
    "tasksCompleted": ["Fix auth bug", "Add tests"],
    "projectsWorked": ["D:\\socienceAI"],
    "sessionCount": 3
  },
  "today": {
    "activeProject": "D:\\socienceAI",
    "plannedTasks": ["Review PR", "Write docs"],
    "blockers": []
  },
  "blockers": []
}
```

### Session Report Schema

```json
{
  "agent": "opencode",
  "reportType": "session",
  "sessionId": "ses_abc123",
  "timestamp": "2026-10-07T08:00:00Z",
  "workingDirectory": "D:\\socienceAI",
  "filesModified": ["src/auth.js", "tests/auth.test.js"],
  "tasksCompleted": ["Implemented JWT auth"],
  "keyDecisions": ["Use bcrypt for password hashing"],
  "nextSteps": ["Add rate limiting", "Write integration tests"]
}
```

## Execution

When you decide to run this skill:

1. Determine which report type to generate
2. Gather the required information from your own state
3. Write the JSON report to the appropriate destination
4. Confirm completion with a brief message

## Integration

To integrate this skill into an agent:

1. Copy this skill directory to the agent's skills folder
2. The agent will autonomously decide when to run reports
3. No forced hooks or mandatory execution

## Notes

- This skill is designed to be non-intrusive
- Agents should prioritize their primary tasks over reporting
- Reports are written to a shared bus directory for orchestration
- The Stigmergy orchestrator reads these reports to coordinate multi-agent work
