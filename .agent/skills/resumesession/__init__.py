{
  "name": "resumesession",
  "displayName": "ResumeSession",
  "version": "2.0.0",
  "description": "Cross-CLI session recovery and history management with project-aware filtering",
  "capabilities": [
    "Recover latest session from current project",
    "Check session content and skip empty sessions",
    "Show multiple sessions from current project",
    "Filter sessions by specific CLI",
    "Search sessions by content keywords",
    "Filter sessions by date range (today, week, month)",
    "Show sessions from all projects with --all flag",
    "Multiple view formats: summary, timeline, detailed, context",
    "Cross-CLI support: Claude, Gemini, Qwen, iFlow, CodeBuddy, Codex, QoderCLI, Kode"
  ],
  "protocols": ["chinese", "english"],
  "hooks": [],
  "enabled": true,
  "category": "session-management",
  "author": "stigmergy",
  "dependencies": [],
  "implementations": [
    {
      "name": "stigmergy-resume",
      "version": "2.0.0",
      "language": "javascript",
      "description": "Project-aware session recovery tool",
      "runtime": "node",
      "entry_point": "src/cli/commands/stigmergy-resume.js"
    }
  ]
}
