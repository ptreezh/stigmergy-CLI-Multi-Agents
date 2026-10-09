# Structure

> Fresh gsd-scan (`tech+arch`) output. Supersedes the stale 2026-04-12 copy.
> Ground truth: direct `Get-ChildItem -Recurse` listings. File counts and line counts measured directly.

## 1. Repository root

```
D:\stigmergy-CLI-Multi-Agents\
├── src/                    155 files  ← SOURCE OF TRUTH (101 .js, 1 .ts, 34 .py, 11 .md)
├── tests/                  34 files   (10 *.test.js + runner scripts + fixtures)
├── scripts/                159 files  (install/deploy/verify/convert helpers; .js + .py)
├── bin/                    8 files
├── bus/                    10 files   (file-bus protocol)
├── config/                 21 files   (gateway.json, hooks.json, builtin/predefined skills, boundaries)
├── packages/               14605 files (workspace pkgs: cli, core, mcp-server, professional, scenarios — mostly vendored)
├── dist/                   157 files  (STALE published snapshot — do not edit)
├── docs/                   259 files
├── wiki/                   3 files
├── skills/                 84 files   (seed skill library)
├── openskills/             61 files   (embedded skill runtime; separate tsconfig.json)
├── SmartWorkstation/       123874 files (large vendored app; separate tsconfig.json)
├── .gates/                 4 files    (gatekeeper.js, GATEKEEPER.md, OATH.md, README.md)
├── .github/                4 files    (templates only — NO workflows)
├── .planning/codebase/     ← generated scan docs (this output)
└── (many stray root files: *.tgz, *-test-report*.json, scratch *.py, *.md)
```

Key root files: `package.json`, `package-lock.json`, `src/index.js`, `index.js`, `jest.config.js`, `.eslintrc.js`, `eslint.config.js`, `babel.config.js`, `pytest.ini`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `CHANGELOG.md`, `LICENSE`, `SOUL.md`.

> ⚠️ **Root is polluted**: 8 checked-in `*.tgz` builds (`stigmergy-1.3.77` … `stigmergy-1.11.0`), numerous `*-test-report-*.json`, `collaboration-report.json`, and scratch Python (`add_numbers.py`, `fibonacci.py`, `pdf_table_extractor.py`, `system_engineering_skill.py`, `token_monitor.py`). None are part of the published package.

## 2. `src/` layout (source of truth)

```
src/
├── index.js                 (36)  entry: requires ./cli/router-beta, exports core
├── auth.py                  (196)
├── cli/
│   ├── router-beta.js       (1078) commander router, ~38 commands, VerificationGate
│   ├── commands/            23 handlers (install, scan, project, soul, gateway, concurrent, …)
│   └── utils/                formatters.js, environment.js
├── core/                    26 top-level .js + 7 subdirs
│   ├── smart_router.js (632), cli_help_analyzer.js (1166)
│   ├── cli_adapters.js (473), execution_mode_detector.js (227)
│   ├── cli_tools.js (822), desktop-tools.js (338), agent_registry.js (267), cli_path_detector.js (745)
│   ├── installer.js (1400), enhanced_cli_installer.js (1365), enhanced_cli_parameter_handler.js (450)
│   ├── agent_coordinator.js (712), agent_state_collector.js (420), ProjectStatusBoard.js (887)
│   ├── memory_manager.js (83), directory_permission_manager.js (637), error_handler.js (406)
│   ├── skill_orchestrator.js (257), skill_ontology_search.js (226), local_skill_scanner.js (732)
│   ├── soul_manager.js (610), soul_*.js
│   ├── coordination/  error_handler.js + nodejs/HookDeploymentManager.js + nodejs/generators/*
│   ├── hooks/         evolution-hook.js, verification-gate.js
│   ├── memory/        EnhancedExperienceManager.js
│   ├── scheduler/     cron_scheduler.js, platform_utils.js, task_history.js
│   ├── skills/        StigmergySkillManager.js, SkillSyncManager.js, BuiltinSkillsDeployer.js,
│   │                  embedded-openskills/{SkillReader,SkillParser,SkillInstaller}.js, __tests__/*
│   └── soul/          soul_manager helpers + DECI/* (Decision Engine) + DeadLetterQueue.js + DecisionAuditor.js
├── adapters/          per-tool: cc-connect, claude, codebuddy, codex, copilot, gemini, iflow, qoder, qwen
├── agent-forensics/   8 files (session forensics)
├── gateway/           server.js (433)
├── interactive/       InteractiveModeController.js, PersistentCLIPool.js, FileLock.js
├── orchestration/     core/CentralOrchestrator.ts (422) + empty hooks/  ← vestigial
├── tunnel/            ngrok.js
├── commands/          STUB (only agent.md) — real commands are in src/cli/commands/
└── utils/             execute_command.js + helpers
```

Also at `src/` root: `agent.md`, `AUTH_README.md`, `data_structures.md`, `utils.js`.

## 3. `src/cli/commands/` (23 handlers)

`agent-forensics.js`, `auto-coordinator.js`, `autoinstall.js`, `cc-config.js`, `concurrent.js`, `dashboard.js`, `errors.js`, `install.js`, `interactive.js`, `opencli.js`, `permissions.js`, `project.js`, `scan.js`, `scheduler.js`, `skills.js`, `soul-create-interactive.js`, `soul.js`, `status.js`, `stigmergy-resume.js`, `superpowers.js`, `system.js`, `takeover.js`, `wiki-scan.js`.

## 4. `bin/`

`stigmergy` (+ `stigmergy.cmd` Windows shim), `stigmergy-gateway`, `auto-coordinator.js`, `soul-evolve.js`, `soul-runner.js`, `soul_scheduler_cli.js`, `soul_wiki_cli.js`.

## 5. `bus/` (coordination protocol, no server)

`coordinator.js` (389) plus protocol dirs: `daily/`, `handoffs/`, `onetime/`, `registry/`, `reviews/`, `sessions/`, `shared/`. Runtime bus lives at `~/.stigmergy/bus` (env `STIGMERGY_BUS_DIR`).

## 6. `config/`

`gateway.json` (port 3000, host 0.0.0.0; ngrok us; all platforms disabled), `hooks.json`, `boundaries.json`, `builtin-skills.json`, `predefined-skills.json`, plus bundled skill `SKILL.md` files.

## 7. `packages/` (workspace, mostly vendored)

`cli/`, `core/`, `mcp-server/`, `professional/`, `scenarios/`. 14605 files — treat as vendored; not the primary build target.

## 8. `tests/`

- `*.test.js` (10): `stigmergy-orchestrator.test.js`; `unit/{agent_coordinator,agent_registry,agent_state_collector,auto-coordinator,takeover}.test.js`; `unit/agent-forensics/{detect,matcher,sessions}.test.js`; `unit/hooks/verification-gate.test.js`.
- Non-test runner scripts: `create-real-tasks.js`, `demo-multi-cli.js`, `level2-integration-test.js`, `multi-cli-evolution-test.js`, `process-real-tasks.js`, `setup.js`, `skill-recommendation-test.js`, `test-cold-start.js`, `test-cross-cli-sharing.js`, `test-unified-comm-adapter.js`.
- Fixtures: `tests/tests/{coze,marvis,opencode,poe,qoder,workbuddy}/{session,signature}.json`.
- Jest config `roots: ["<rootDir>/tests"]`, `testMatch: ["**/tests/**/*.test.js"]`.

## 9. Where to put new things

| You are adding… | Put it in… |
|---|---|
| A new CLI command | `src/cli/commands/<name>.js` + register in `src/cli/router-beta.js` |
| A new core service | `src/core/<name>.js` (or a new `src/core/<area>/` subdir) |
| A new AI tool adapter | `src/adapters/<tool>/`; register in `src/core/cli_tools.js` (`CLI_TOOLS`) |
| A new desktop agent | `src/core/desktop-tools.js` (`DESKTOP_TOOLS`) |
| A new IM gateway | `src/core/cli_tools.js` (`IM_GATEWAYS`) |
| A new skill subsystem file | `src/core/skills/` (+ tests in `src/core/skills/__tests__/`) |
| A new autonomy rule | `src/core/soul/` or `src/core/soul/DECI/` |
| A new hook | `src/core/hooks/` |
| A new test | `tests/unit/...` (must match `**/tests/**/*.test.js`) |
| A new script | `scripts/` |

## 10. Structure drift / caveats

- `src/commands/` is a **stub** (only `agent.md`); real command handlers are in `src/cli/commands/`.
- No `src/adapters/opencode/` directory despite opencode being a registered tool.
- `src/orchestration/` is not part of the live CLI path; only `core/CentralOrchestrator.ts` remains.
- `dist/` is a stale published snapshot (contains `RELEASE_NOTES_v1.2.5.md`, its own `tsconfig.json`) — never treat as source.
- `packages/` and `SmartWorkstation/` dominate file counts with vendored content; scope searches to `src/`, `tests/`, `scripts/`, `config/`, `bus/` for real code.
