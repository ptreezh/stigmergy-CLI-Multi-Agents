# Integrations

> Fresh gsd-scan (`tech+arch`) output. Supersedes the stale 2026-04-12 copy.
> Source of truth: `src/core/cli_tools.js` (`CLI_TOOLS`, `IM_GATEWAYS`), `src/core/desktop-tools.js` (`DESKTOP_TOOLS`), `src/core/agent_registry.js` (`NATIVE_SESSION_DIRS`), `config/gateway.json`.

Stigmergy integrates three classes of agents: **AI CLI tools**, **desktop/IDE AI agents**, and **IM gateways**. Every agent is registered in a single registry object and consumed by installer, hooks deployer, skill sync, gateway, and forensics.

## 1. AI CLI tools (`src/core/cli_tools.js` → `CLI_TOOLS`)

| Key | Name | Install command | Hooks dir | Skills support | autoInstall |
|---|---|---|---|---|---|
| `bun` | Bun Runtime | `npm i -g bun` | `~/.bun` | — | yes (prerequisite) |
| `claude` | Claude CLI | `npm i -g @anthropic-ai/claude-code` | `~/.claude/hooks` | skill-md, json hooks; plugin `cli-anything` | yes |
| `gemini` | Gemini CLI | `npm i -g @google/gemini-cli` | `~/.gemini/extensions` | skill-md, json hooks; plugin `cli-anything` | yes |
| `qwen` | Qwen CLI | `npm i -g @qwen-code/qwen-code` | `~/.qwen/hooks` | skill-md, json hooks; plugin `cli-anything` | yes |
| `iflow` | iFlow CLI | `npm i -g @iflow-ai/iflow-cli` | `~/.iflow/hooks` | skill-md, **yaml** hooks; plugin `cli-anything` | yes |
| `opencode` | OpenCode AI CLI | `npm i -g opencode-ai` | `~/.opencode/hooks` | skill-md, json hooks; `dependsOn: [bun, oh-my-opencode]` | yes |
| `qodercli` | Qoder CLI | `npm i -g @qoder-ai/qodercli` | `~/.qoder/hooks` | skill-md, json hooks; plugin `cli-anything` | yes |
| `codebuddy` | CodeBuddy CLI | `npm i -g @tencent-ai/codebuddy-code` | `~/.codebuddy/hooks` | skill-md, json hooks; plugin `cli-anything` | yes |
| `resumesession` | ResumeSession CLI | `npm i -g @stigmergy/resume` | `~/.resumesession/hooks` | — | no (internal feature) |
| `oh-my-opencode` | Oh-My-OpenCode Plugin | `bunx oh-my-opencode install …` | `~/.opencode/plugins` | — (plugin, `dependsOn: [bun]`) | yes |
| `kilocode` | KiloCode CLI | `npm i -g @kilocode/cli` | `~/.kilocode/hooks` | skill-md, json hooks; plugin `cli-anything` | yes |
| `copilot` | GitHub Copilot CLI | `npm i -g @github/copilot` | `~/.copilot/mcp` | skill-md, json hooks; plugin `cli-anything` | no |
| `codex` | OpenAI Codex CLI | `npm i -g @openai/codex` | `~/.config/codex/slash_commands` | skill-md, json hooks; plugin `cli-anything` | no |
| `kode` | Kode CLI | `npm i -g @shareai-lab/kode` | `~/.kode/agents` | skill-md, json hooks; plugin `cli-anything` | no |
| `opencli` | OpenCLI | `npm i -g @jackwener/opencli` | `~/.opencli/hooks` | skill-md, json hooks; browser bridge + 73+ site adapters | yes |
| `coze` | Coze CLI (扣子) | `npm i -g @coze/cli` | — | — | no |

Notes:
- Each CLI entry also carries `version` (a `<bin> --version` probe) and `config` (a per-tool config JSON path).
- `skills.format` is `skill-md` for all skill-capable tools; only `iflow` uses `hookFormat: "yaml"`, the rest use `"json"`.
- The `cli-anything` plugin is offered to every skill-capable CLI (install via `stigmergy skill install cli-anything`, source `skills/cli-anything`).

## 2. Desktop / IDE AI agents (`src/core/desktop-tools.js` → `DESKTOP_TOOLS`)

`desktop-tools.js` is the **single source of truth** for desktop-agent download links, install detection, and version checks. Desktop entries appear in `CLI_TOOLS` as `type: "desktop"` with `version: null`, `install: null`, and a `desktopRef` pointing here.

| Key | Name | Install URL | Skills dir |
|---|---|---|---|
| `workbuddy` | WorkBuddy Desktop (Tencent) | workbuddy.ai | `~/.workbuddy/skills` |
| `qwenwork` | QwenWork (Tongyi) | qwenwork.cn | `null` (path convention TBD) |
| `traework` | TraeWork (ByteDance) | trae.ai | `null` |
| `qoderwork` | QoderWork | qoder.com/qoderwork | `null` |
| `doubao` | Doubao Desktop (ByteDance) | doubao.com | `~/doubao/skills` |
| `kimiwork` | Kimi Work | kimi.com | `null` |
| `marvis` | Marvis (Tencent) | marvis.qq.com | `~/.marvis/skills` |
| `deepseek-harness-desktop` | DeepSeek Harness Desktop | github.com/deepseek-ai/deepseek-harness | `null` |
| `codex-desktop` | Codex Desktop (OpenAI) | chatgpt.com/download | `~/.codex/skills` |
| `openwork` | OpenWork | openworklabs.com | `~/.opencode/skills` |
| `claudework` | Claude Desktop (Anthropic) | claude.com/download | `null` |
| `muse` | Muse Desktop (Meta) | ai.meta.com/muse | `~/.muse/skills` |
| `coze-desktop` | Coze Desktop (扣子) | coze.cn | `null` |

Helpers exported: `resolveLocalDirs(toolName)`, `isDesktopInstalled(toolName)`, `getDesktopToolIds()`. Re-exported from `cli_tools.js`.

## 3. IM gateway (`src/core/cli_tools.js` → `IM_GATEWAYS`)

| Key | Name | Install | Type | Config | Platforms |
|---|---|---|---|---|---|
| `cc-connect` | cc-connect IM Gateway | `npm i -g cc-connect` | `im-gateway` | `~/.stigmergy/cc-connect/config.toml` | feishu, telegram, dingtalk, slack, discord, line, wecom, wechat, qq, qqbot |

`cc-connect` is treated as infrastructure (not an AI CLI); `autoInstall: true` and it installs ahead of AI CLIs. Repo config: `config/cc-connect-config.toml`.

## 4. Stigmergy Gateway (`src/gateway/server.js`, `config/gateway.json`)

HTTP server exposing remote CLI orchestration. `config/gateway.json` defaults:

| Setting | Value |
|---|---|
| port | `3000` |
| host | `0.0.0.0` |
| tunnel | ngrok, region `us`, autostart, enabled |
| platforms | feishu / telegram / slack / discord — **all disabled by default** |
| commands | `route`, `concurrent`, `ask`, `status` |

Endpoints (per README): `GET /status`, `POST /webhook/:platform`, `POST /execute`.
Related files: `src/gateway/server.js` (379 lines), `bin/stigmergy-gateway`.

## 5. Native session directories (`src/core/agent_registry.js` → `NATIVE_SESSION_DIRS`)

Used by ResumeSession / forensics to read each agent's native session store:

| Agent | Dir |
|---|---|
| claude | `~/.claude/projects` |
| gemini | `~/.gemini/tmp` |
| qwen | `~/.qwen/sessions` |
| iflow | `~/.iflow/sessions` |
| codebuddy | `~/.codebuddy/sessions` |
| codex | `~/.codex/sessions` |
| copilot | `~/.copilot/sessions` |
| opencode | `~/.opencode/sessions` |
| kilocode | `~/.kilocode/sessions` |
| kode | `~/.kode/sessions` |
| qodercli | `~/.qoder/sessions` |

`agent_registry.js` (226 lines) also defines `AGENT_STATES_DIR` and imports `CLI_TOOLS`, `DESKTOP_TOOLS`, `getCLIPath`.

## 6. Coordination bus (file-based, no server)

- Runtime dir: `~/.stigmergy/bus` (env `STIGMERGY_BUS_DIR`).
- Repo seed dirs under `bus/`: `daily/`, `handoffs/`, `onetime/`, `registry/`, `reviews/`, `sessions/`, `shared/`; logic in `bus/coordinator.js` (346 lines).
- Used for active handoffs, autonomous takeover, and global task alignment.

## 7. Skill search paths (priority order)

1. `~/.stigmergy/skills/` — Stigmergy unified storage
2. `./.agent/skills/` — project universal
3. `~/.agent/skills/` — global universal
4. `./.claude/skills/` — project Claude
5. `~/.claude/skills/` — global Claude

Skill subsystem lives in `src/core/skills/` (`StigmergySkillManager.js`, `SkillSyncManager.js`, `BuiltinSkillsDeployer.js`, `embedded-openskills/`). Repo skill seeds: `skills/`, plus 6 bundled `SKILL.md` under `config/`.

> Code-order caveat: the README order above is the documented contract. `StigmergySkillManager.js` (write/sync) resolves `~/.stigmergy/skills` → `./.agent/skills` → `~/.agent/skills`; `embedded-openskills/SkillReader.js` (read) checks `./.agent/skills` → `~/.agent/skills` → `~/.stigmergy/skills`. The `.stigmergy`-first order applies to storage/sync, not read resolution.

## 8. Config files (`config/`)

| File | Purpose |
|---|---|
| `gateway.json` | Gateway server (port/host/tunnel/platforms/commands) |
| `cc-connect-config.toml` | cc-connect IM gateway config |
| `builtin-skills.json` / `predefined-skills.json` | Skill catalogs |
| `enhanced-cli-config.json` | Enhanced CLI install/parameter handling |
| `boundaries.json` | Directory/permission boundaries |
| `hooks.json` | Hook definitions |
| `session-start.js` | Session-start hook |
| `config-bundle.json` / `deployment-manifest.json` | Deployment metadata |

## 9. Environment variables

| Var | Effect |
|---|---|
| `DEBUG=true` | Verbose/debug mode |
| `STIGMERGY_AUTO_INSTALL=true` | Force auto-install during `npm install` |
| `STIGMERGY_BUS_DIR` | Override coordination bus directory (default `~/.stigmergy/bus`) |

## 10. Adapters (`src/adapters/`)

Per-tool adapters: `cc-connect`, `claude`, `codebuddy`, `codex`, `copilot`, `gemini`, `iflow`, `qoder`, `qwen`. Python glue: `src/adapters/__init__.py` (152), `src/adapters/iflow/official_hook_adapter.py` (1028), `src/adapters/copilot/mcp_server.py` (142). Note: there is **no** `src/adapters/opencode/` directory (a stale doc claimed one).

## Drift / caveats

- Old INTEGRATIONS.md described `src/adapters/opencode/`, `src/orchestration/managers/`, `src/orchestration/events/`, and `src/commands/skill.js` — none exist today. Real command handlers live in `src/cli/commands/`.
- Desktop-agent skills dirs marked `null` are not yet convention-mapped; skill sync skips them.
