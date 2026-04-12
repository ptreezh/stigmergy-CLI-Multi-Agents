# CLI Adapters

Per-tool adapters that normalize installation, hooks directories, skills paths, and parameter interfaces across all supported AI CLI tools.

## Tool Adapters

| Tool | ID | Notes |
|------|----|-------|
| `claude/` | claude | OpenSkills + CLI-Anything plugin support |
| `gemini/` | gemini | Google Gemini CLI |
| `qwen/` | qwen | Qwen/Wanx CLI, supports OAuth |
| `iflow/` | iflow | iFlow AI CLI |
| `codebuddy/` | codebuddy | Tencent CodeBuddy |
| `copilot/` | copilot | GitHub Copilot CLI |
| `codex/` | codex | OpenAI Codex CLI |
| `qoder/` | qoder | Qoder AI CLI |
| `opencode/` | opencode | OpenCode CLI |
| `kilocode/` | kilocode | KiloCode CLI |
| `cc-connect/` | cc-connect | Multi-platform IM gateway (Feishu/Telegram/WeChat/DingTalk/Slack/Discord/LINE) |

Each adapter directory exports tool metadata (version command, install command, config/hooks paths, OAuth flags).
