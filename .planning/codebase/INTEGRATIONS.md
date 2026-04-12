# External Integrations

**Analysis Date:** 2026-04-12

## AI CLI Tools (Layer 1)

Supported AI CLI tools managed via `src/core/cli_tools.js`. All use hooks-based integration deployed to each tool's hooks directory.

| Tool | Package | Hooks Dir | Skills Dir | Auth |
|------|---------|-----------|------------|------|
| `claude` | `@anthropic-ai/claude-code` | `~/.claude/hooks/` | `~/.claude/skills/` | API key |
| `gemini` | `@google/gemini-cli` | `~/.gemini/extensions/` | `~/.gemini/skills/` | OAuth |
| `qwen` | `@qwen-code/qwen-code` | `~/.qwen/hooks/` | `~/.qwen/skills/` | OAuth (access token) |
| `iflow` | `@iflow-ai/iflow-cli` | `~/.iflow/hooks/` | `~/.iflow/skills/` | API key |
| `opencode` | `opencode-ai` | `~/.opencode/hooks/` | `~/.opencode/skills/` | API key |
| `qodercli` | `@qoder-ai/qodercli` | `~/.qoder/hooks/` | `~/.qoder/skills/` | API key |
| `codebuddy` | `@tencent-ai/codebuddy-code` | `~/.codebuddy/hooks/` | `~/.codebuddy/skills/` | API key |
| `kilocode` | `@kilocode/cli` | `~/.kilocode/hooks/` | `~/.kilocode/skills/` | API key |
| `copilot` | `@github/copilot` | `~/.copilot/mcp/` | `~/.copilot/skills/` | OAuth |
| `codex` | `@openai/codex` | `~/.config/codex/slash_commands/` | `~/.codex/skills/` | API key |
| `kode` | `@shareai-lab/kode` | `~/.kode/agents/` | `~/.kode/skills/` | API key |
| `opencli` | `@jackwener/opencli` | `~/.opencli/hooks/` | `~/.opencli/skills/` | Browser-ext |
| `bun` | `bun` | `~/.bun/` | N/A | Runtime |
| `resumesession` | `@stigmergy/resume` | `~/.resumesession/hooks/` | N/A | Internal |
| `oh-my-opencode` | (bunx) | `~/.opencode/plugins/` | N/A | Plugin |

**Global skills path aliases:**
- `~/.stigmergy/skills/` - Global install
- `.agent/skills/` - Project-local
- `.claude/skills/` - Claude-specific
- `src/core/skills/embedded-openskills/` - Bundled OpenSkills core

## IM Gateway (cc-connect)

**Package:** `cc-connect` (npm global)
**Config:** `~/.stigmergy/cc-connect/config.toml`
**Supported platforms:** feishu, telegram, dingtalk, slack, discord, line, wecom, wechat, qq, qqbot

**Commands:**
```bash
stigmergy cc-config init
stigmergy cc-config set <platform> <key> <value>
stigmergy cc-config generate
stigmergy cc-config start
stigmergy cc-config status
```

## Browser Automation

**Playwright** (optional peer dep) - Used for E2E testing and OpenCLI browser extension integration.

## Domain CLI Proxies (Python)

Domain CLIs are Python packages proxy-wrapped through Stigmergy CLI:

| Domain CLI | Python Package | Purpose |
|------------|---------------|---------|
| `stigmergy medusa` | `medusa` (pip) | E-commerce CLI proxy |
| `stigmergy eb-edu` | `eb-edu` (pip) | Teaching platform CLI proxy |

Implementation: `src/cli/router-beta.js` (lines 977-1005) spawns Python processes with `which` detection.

## Cross-CLI Execution

**Hook-based integration:** Hooks deployed to each CLI's hooks directory enable:
- `/resumesession` slash command registration
- Session state sharing
- Result aggregation

**CLI Adapters:** `src/core/cli_adapters.js` normalizes flags between interactive vs one-time execution modes across tools.

**Smart Router:** `src/core/smart_router.js` routes user prompts to the best CLI based on keyword matching and capability analysis.

## OpenCLI (Website-to-CLI Bridge)

**Package:** `@jackwener/opencli` - Converts 453+ websites to CLI commands
**Browser Extension:** OpenCLI Browser Bridge for reusing authenticated browser sessions
**Built-in adapters:** 73+ sites (B站/知乎/小红书/Twitter/Reddit/YouTube/etc.)

**Command:**
```bash
stigmergy opencli <site> <command> [args]
stigmergy opencli --explore <url>   # Generate new CLI
stigmergy opencli --install-ext     # Install browser extension
```

## Verification Gate

**Implementation:** `src/core/hooks/verification-gate.js`
**Log:** `~/.stigmergy/logs/verification-gate.log`
**Features:**
- Completion level detection (Level 0-4)
- Historical error pattern matching
- Limitation completeness checks

**Run:**
```bash
npm run gatekeeper
npm run gatekeeper:ci    # CI mode
```

## Scheduler / Automation

**Cron-based scheduler** at `src/core/scheduler/`:
- Task types: cli, gateway, webhook, script
- Supports: feishu, telegram, slack, discord platforms
- Retry logic, timeout, history tracking

**Command:**
```bash
stigmergy scheduler list
stigmergy scheduler add --name "..." --cron "0 * * * *" --cli claude
stigmergy scheduler delete --id <id>
```

## Gateway Server

**Implementation:** `src/gateway/server.js`
**Server:** Native Node.js `http` module (no Express/Fastify dependency detected)
**Platform adapters:** `src/gateway/adapters/` - per IM platform
**Tunneling:** `src/tunnel/ngrok.js` - ngrok for public URLs

**Command:**
```bash
stigmergy gateway --feishu --telegram --port 3000 --tunnel
```

## CI/CD

**GitHub Actions:** `.github/workflows/`
**No external CI service detected.**

## Configuration

**Project config dirs:**
- `~/.stigmergy/` - Global runtime state (hooks, locks, skills, scheduler, soul-state)
- `~/.stigmergy/environment/` - Environment config
- `~/.stigmergy/shared-feedbacks/` - Cross-CLI feedback
- `.stigmergy/` - Project-local overrides

**Env var pattern:** All secrets via `process.env` (no hardcoded values observed in source).

---

*Integration audit: 2026-04-12*
