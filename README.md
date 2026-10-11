# Stigmergy CLI

> **Write a skill once. Run it in every AI CLI.**
> Stigmergy is a portability + coordination layer across the AI CLIs you already use. Install an agent skill in one place, and Claude, Gemini, Qwen, iFlow, Qoder, CodeBuddy, Codex, KiloCode, and opencode can all use it — and share session context instead of making you re-explain everything.

[![npm version](https://badge.fury.io/js/stigmergy.svg)](https://www.npmjs.com/package/stigmergy)
[![CI](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/actions/workflows/ci.yml/badge.svg)](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/stigmergy)](https://www.npmjs.com/package/stigmergy)

**English** · A portability + coordination layer for multiple AI CLIs: install skills once and use them anywhere, recover session context across CLIs, and (optionally) route or fan out one task to several agents.

**中文** · 多 AI CLI 的可移植与协作层：技能装一次、处处可用；会话上下文跨 CLI 恢复；可选地把一个任务路由或并发派发给多个 agent。

## The problem

You already run several AI CLIs (Claude, Gemini, Qwen, iFlow, Qoder, CodeBuddy, Codex, KiloCode, opencode…). Each keeps its **own** skills directory (`~/.claude/skills`, `~/.qwen/skills`, …), its **own** session history, and its **own** conventions. So you reinstall the same skill everywhere, re-explain the same context every time you switch tools, and cannot hand a task from one CLI to another.

Stigmergy centralizes that: **one skill store, one session bridge, one optional router.**

## 60-second demo (real output, trimmed)

```console
$ stigmergy --version
1.11.0

# Detect what is ACTUALLY installed (probes PATH; reports only what it finds):
$ stigmergy scan
 Found 9 CLI tools:
   Claude CLI          Version: 2.1.295 (Claude Code)
   Gemini CLI          Version: 0.63.0
   Qwen CLI            Version: 0.25.0
   iFlow CLI           Version: 0.5.19
   OpenCode AI CLI     Version: 1.18.35
   Qoder CLI           Version: 1.1.66
   CodeBuddy CLI       Version: 2.162.0
   KiloCode CLI        Version: 7.8.8
   OpenAI Codex CLI    Version: codex-cli 0.146.0
   (copilot, kode: probed, NOT found — nothing above is hard-coded)

# Every skill Stigmergy has unified, across all your CLIs:
$ stigmergy skill list
Installed skills (352):
  [UNIVERSAL] universal:
    algorithmic-art     Creating algorithmic art using p5.js with seeded randomness…
    brainstorming       You MUST use this before any creative work…
    …
```

The `scan`/`status` lists are produced by probing your `PATH`; `skill list`
counts only skills actually installed. **Letter-for-letter transcript:**
[`examples/quickstart.md`](./examples/quickstart.md).

## The one thing to try

```bash
# Install a skill from any public GitHub repo — once:
stigmergy skill install anthropics/skills

# It is now readable by every CLI that has Stigmergy hooks deployed:
stigmergy skill read pdf        # prints the SKILL.md for the calling agent
```

Cross-CLI skill and session portability is the core, demand-backed use case (see the comparison below): sibling projects prove the niche is real, yet multi-CLI skill sharing remained largely un-served.

## Install

Requires Node.js >= 16.

```bash
npm install -g stigmergy@beta   # current npm channel
stigmergy setup                 # scan CLIs, deploy hooks, install shared skills
```

> **Status — read before production use.** Stigmergy is effectively **pre-1.0**: the npm `latest` tag currently points at a `1.10.10-beta.5` build, while this repository is at `1.11.0`. A true stable release (cutting `1.11.0` and moving betas to the `@beta` tag) is on the roadmap. Recent work hardened cross-CLI skill sync so it writes only the memory filenames each CLI actually reads — see [CHANGELOG.md](./CHANGELOG.md). Pin `@beta` and check the changelog before relying on it.

## How it compares

| Project | Focus | Cross-CLI skill portability | Cross-CLI session recovery |
|---|---|---|---|
| **Stigmergy** | Portable skills + session bridge across many AI CLIs | ✅ install once, run anywhere | ✅ shared session bus |
| `rtk-ai/icm` (543★) | Cross-agent memory | partial (memory, not skills) | partial |
| `Kaseban/baton` (26★) | Session conversion | no | yes (converts one session) |
| `opencode` | One AI coding agent for the terminal | no (single tool) | no |
| `Cline` (69,556★) | Autonomous coding agent in the IDE | no (single tool) | no |

Star counts measured 2026-10-10. Single-tool projects are excellent — they just do not span multiple CLIs by design. Stigmergy **coordinates** the tools you already use rather than replacing them.

## Other features (Experimental)

These ship today but are newer and less proven than the core portability path. Treat them as experimental:

- **Smart routing** — `stigmergy call "<task>"` chooses a CLI for the prompt.
- **Concurrent execution** — `stigmergy concurrent "<task>"` fans one task out to several agents.
- **Project Status Board** — `stigmergy interactive` keeps a per-directory board at `.stigmergy/status/PROJECT_STATUS.md`.
- **Agent observatory** — `stigmergy wiki-scan` reads agent memory files and summarizes real activity (evidence-first: reports only detected agents).
- **Gateway** — `stigmergy gateway --feishu | --telegram | --slack` exposes CLIs over chat platforms.
- **Soul self-evolution** — `stigmergy soul evolve | reflect | co-evolve | compete`.

## Supported CLIs

Claude · Gemini · Qwen · iFlow · Qoder · CodeBuddy · Codex · KiloCode · opencode · WorkBuddy Desktop.
Add or refresh adapters with `stigmergy install <tool>`.

## Documentation

- [Project Constitution](./docs/project-constitution.md) — what this project is and its principles
- [Tutorials: multi-agent workflows](./docs/tutorials/multi-agent-workflows.md)
- [AI products ontology](./docs/ai-products-ontology.md) — supported agents and their configs
- [Self-reporting architecture](./docs/self-reporting-architecture.md)
- [Launch post (draft, unpublished)](./docs/launch-2026-10-07.md)
- [Changelog](./CHANGELOG.md) · [Contributing](./CONTRIBUTING.md) · [Security](./SECURITY.md)

## Roadmap

- Cut a true **stable** release and move betas to the `@beta` tag.
- Record a real asciinema/GIF demo from [`examples/quickstart.md`](./examples/quickstart.md).
- Curate `docs/` (in progress) and keep the surface small.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The project is maintained by a human maintainer working with AI collaborators; contributions are welcome.

```bash
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
npm install && npm run build:orchestration && npm test
```

## License

MIT — see [LICENSE](./LICENSE) (Chinese translation: [LICENSE.zh.md](./LICENSE.zh.md)).

---

_Version: 1.11.0 (development) · Latest npm: 1.10.10-beta.5_
