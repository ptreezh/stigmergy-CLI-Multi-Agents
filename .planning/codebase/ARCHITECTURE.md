# Architecture

> Fresh gsd-scan (`tech+arch`) output. Supersedes the stale 2026-04-12 copy.
> Ground truth: `src/index.js`, `src/cli/router-beta.js`, `src/core/*`, `bus/*`, `src/gateway/server.js`. Line counts measured via `(Get-Content).Count` (not `Measure-Object -Line`).

## 1. Architectural style

Stigmergy is a **modular CommonJS CLI monolith** with a thin command-router front and orchestrating core services behind it. There is no framework — `commander` parses argv, a single router registers ~38 commands, and each command handler delegates to a core service. Cross-agent coordination is **file-bus based (no server)**, with an optional HTTP gateway for remote IM control. A legacy TypeScript "orchestration layer" exists but is effectively vestigial (see §7).

Key characteristics:
- **Graceful degradation**: Node.js primary, Python adapters as fallback glue for tools that need hook scripts.
- **Registry-driven**: tool support is data (`CLI_TOOLS`, `DESKTOP_TOOLS`, `IM_GATEWAYS`), not code branches.
- **Stigmergy metaphor**: agents coordinate via shared environment marks (`~/.stigmergy/bus/`, project status boards) rather than direct RPC.

## 2. Layered view

```
┌────────────────────────────────────────────────────────────────┐
│ Entry            src/index.js (36)  →  src/cli/router-beta.js (1078) │
│                        commander: ~38 commands registered       │
├────────────────────────────────────────────────────────────────┤
│ Command layer    src/cli/commands/*.js  (23 handlers)           │
│                  src/commands/*         (stub: agent.md only)   │
├────────────────────────────────────────────────────────────────┤
│ Service/core     src/core/*.js (26 top-level) + subdirs          │
│   routing        smart_router.js (632), cli_help_analyzer.js (1166) │
│   adaptation     cli_adapters.js (473), execution_mode_detector.js (227) │
│   registry       cli_tools.js (822), desktop-tools.js (338), agent_registry.js (267) │
│   install        installer.js (1400), enhanced_cli_installer.js (1365) │
│   coordination   agent_coordinator.js (712) → bus/coordinator.js (389) │
│   state          ProjectStatusBoard.js (887), memory_manager.js (83) │
│   skills         core/skills/*                                   │
│   soul (autonomy) core/soul/* + DECI/*                           │
├────────────────────────────────────────────────────────────────┤
│ Adapters         src/adapters/<tool>/*  (Python + JS per tool)   │
├────────────────────────────────────────────────────────────────┤
│ Transport        src/gateway/server.js (433) + tunnel/ngrok.js   │
│                  bus/ (file protocol)                            │
├────────────────────────────────────────────────────────────────┤
│ Infra            src/tunnel, src/utils, scripts/*, bin/*         │
└────────────────────────────────────────────────────────────────┘
```

## 3. Entry & routing flow

1. `bin/stigmergy` → `src/index.js`. `index.js` requires `./cli/router-beta` and invokes `main()`, re-exporting `MemoryManager`, `StigmergyInstaller`, `maxOfTwo`, `isAuthenticated` for backwards compatibility.
2. `router-beta.js` builds a `commander` `Command`, registers all subcommands, installs global error handlers (`setupGlobalErrorHandlers()`), and wires a **VerificationGate** hard-constraint interceptor (`src/core/hooks/verification-gate.js`) that logs to `~/.stigmergy/logs/verification-gate.log`.
3. Each subcommand handler (`src/cli/commands/<name>.js`) performs the work, delegating to core services.
4. For task execution, `SmartRouter` (`src/core/smart_router.js`) scores the prompt against tool-specific keywords/capabilities and returns a chosen CLI; `CLIAdapterManager` (`src/core/cli_adapters.js`) then spawns the tool with the right working dir (`src/cli/utils/environment.js`) and env.

The monolithic `router.js` was archived 2025-12-23; `router-beta.js` is the live router (banner still says "Version 2.0.0").

## 4. Command surface (`router-beta.js` registers)

`version`, `errors`, `install [gateway]`, `upgrade`, `deploy`, `superpowers`, `init`, `setup`, `call`, `interactive`, `status`, `dashboard`, `takeover`, `auto-coordinator`, `scan`, `wiki-scan`, `agent-forensics`, `fix-perms`, `perm-check`, `clean`, `diagnostic`, `skill` (+ shorthand `skill-i/-l/-r/-v/-d/-m`), `auto-install`, `resume`, `soul`, `opencli`, `cc-config`, `concurrent`, `scheduler`, `gateway`, `medusa [args...]`, `eb-edu [args...]`.

Handlers live in `src/cli/commands/` (23 files incl. `scan.js`, `install.js`, `project.js`, `soul.js`, `soul-create-interactive.js`, `superpowers.js`, `wiki-scan.js`, `agent-forensics.js`, `takeover.js`, `auto-coordinator.js`, `cc-config.js`, `dashboard.js`, `opencli.js`, `scheduler.js`, `system.js`, `permissions.js`, `errors.js`, `stigmergy-resume.js`, `skills.js`, `concurrent.js`, `interactive.js`, `autoinstall.js`).

## 5. Core subsystems

### Routing
- `smart_router.js` (632): keyword/whitelist scoring. `VALID_CLI_TOOLS` = claude, gemini, qwen, iflow, codebuddy, codex, qodercli, copilot, kode, opencode, kilocode. Depends on `cli_help_analyzer.js` (1166) `getEnhancedCLIPattern()`. Has failure cache (`FAILURE_CACHE_HOURS=1`) and fallback scoring.
- `cli_help_analyzer.js` (1166): parses each CLI's `--help` to infer capabilities.
- `cli_adapters.js` (473) + `execution_mode_detector.js` (227): adapter selection and stdin/TTY/interactive mode detection.

### Registry
- `cli_tools.js` (822): `CLI_TOOLS`, `IM_GATEWAYS`, re-exports `DESKTOP_TOOLS`. Also exposes `validateCLITool`, `getCLIPath`, `setupCLIPaths`, `CLIPathDetector`, `getPathDetector`.
- `desktop-tools.js` (338): `DESKTOP_TOOLS` (single source of truth for desktop download/install/version).
- `agent_registry.js` (267): `NATIVE_SESSION_DIRS`, `AGENT_STATES_DIR`; reads native session stores for resume/forensics.
- `cli_path_detector.js` (745): resolves each tool's binary path across platform conventions.

### Installation
- `installer.js` (1400): main install orchestrator.
- `enhanced_cli_installer.js` (1365) + `enhanced_cli_parameter_handler.js` (450): enhanced detection/parameter handling.
- `directory_permission_manager.js` (637): permission fixes (`perm-check`/`fix-perms`).

### Coordination
- `agent_coordinator.js` (712): handoffs, takeover candidates, global alignment; writes to the bus (`STIGMERGY_BUS_DIR` || `~/.stigmergy/bus`).
- `bus/coordinator.js` (389): file-protocol read/write for `daily/`, `handoffs/`, `onetime/`, `registry/`, `reviews/`, `sessions/`, `shared/`.
- `ProjectStatusBoard.js` (887): per-directory `.stigmergy/status/PROJECT_STATUS.md` shared state (tasks/findings/decisions/collaboration history).
- `agent_state_collector.js` (420): aggregates per-agent activity.

### Skills
- `StigmergySkillManager.js`, `SkillSyncManager.js`, `BuiltinSkillsDeployer.js` + `embedded-openskills/{SkillReader,SkillParser,SkillInstaller}.js`. Unit tests live in `core/skills/__tests__/`.
- Ontology search: `skill_ontology_search.js` (226); `skill_orchestrator.js` (257); `local_skill_scanner.js` (732).

### Soul (autonomous evolution)
- `core/soul/soul_manager.js` (610) + `soul_alignment_checker.js`, `soul_knowledge_base.js`, `soul_memory_manager.js`, `soul_skill_evolver.js`, `soul_task_integration.js`.
- `core/soul/DECI/` — Decision Engine: `SoulDecisionEngine.js`, `ConfidenceScorer.js`, `DecisionBoundary.js`, `DecisionContext.js`, `DecisionVerifier.js`, `EmergencyFallback.js`, `FallbackManager.js`, `index.js`.
- `core/soul/DeadLetterQueue.js`, `core/soul/DecisionAuditor.js`; evolution hook `core/hooks/evolution-hook.js`.

### Hooks deployment
- `core/coordination/nodejs/HookDeploymentManager.js` + generators (`CLIAdapterGenerator.js`, `ResumeSessionGenerator.js`, `SkillsIntegrationGenerator.js`); `error_handler.js` in the same tree.

## 6. Transport & persistence

- **Gateway** (`src/gateway/server.js`, 433): HTTP server (default port 3000, host 0.0.0.0). Endpoints `GET /status`, `POST /webhook/:platform`, `POST /execute`. Optional ngrok tunnel (`src/tunnel/ngrok.js`). Platform connectors declared in `config/gateway.json` (feishu/telegram/slack/discord, all disabled by default). CLI: `bin/stigmergy-gateway`, command `gateway`.
- **IM gateway**: `cc-connect` (external npm binary) bridges 10 IM platforms; configured via `config/cc-connect-config.toml` + `src/cli/commands/cc-config.js`.
- **Bus** (no server): plain files under `~/.stigmergy/bus` (env `STIGMERGY_BUS_DIR`).
- **State**: project boards `.stigmergy/status/PROJECT_STATUS.md`; scheduler history in `core/scheduler/task_history.js`; experience memory `core/memory/EnhancedExperienceManager.js`; decision logs (`~/.stigmergy/logs`, `verification-gate.log`).

## 7. TypeScript orchestration layer — status: vestigial

- `src/orchestration/` contains **only** `core/CentralOrchestrator.ts` (422 lines) and an empty `hooks/` dir.
- `CentralOrchestrator.ts` defines `Task`/`SubTask`/`ExecutionResult` types, `TaskType`, `ExecutionStrategy ('parallel'|'sequential'|'hybrid')`, planning/decomposition/CLI-selection/aggregation via `EventEmitter` + `child_process.spawn`.
- **It is not wired into the live CLI.** `router-beta.js` does not import `src/orchestration`; runtime parallel execution is handled by `src/cli/commands/concurrent.js` + `cli_adapters.js`.
- A stale doc claimed `src/orchestration/managers/` and `src/orchestration/events/` exist — they do not.
- **Build broken**: `npm run build:orchestration` → `tsc --project tsconfig.build.json`, but no root `tsconfig.json`/`tsconfig.build.json` exists. Only `dist/tsconfig.json`, `openskills/tsconfig.json`, `SmartWorkstation/tsconfig.json`. Compiled `dist/orchestration/core/CentralOrchestrator.js` is checked in.

## 8. Adapters (`src/adapters/`)

Per-tool adapter dirs: `cc-connect`, `claude`, `codebuddy`, `codex`, `copilot`, `gemini`, `iflow`, `qoder`, `qwen`. Python glue dominates (34 `.py` under `src/`), e.g. `iflow/official_hook_adapter.py` (1271), `iflow/hook_adapter.py` (1054), `codebuddy/buddy_adapter.py` (1091), `qoder/notification_hook_adapter.py` (861), `claude/skills_hook_adapter.py` (841), `iflow/workflow_adapter.py` (817), `copilot/mcp_adapter.py` (772), `qoder/hook_installer.py` (732). There is **no** `src/adapters/opencode/` dir.

## 9. Cross-cutting conventions

- **Language/i18n**: 12-language routing patterns; tool-specific keywords include Chinese aliases (e.g. `multi模型`).
- **Error handling**: central `core/error_handler.js` (406) with `errorHandler`, `ERROR_TYPES`, `setupGlobalErrorHandlers`; commands are expected to propagate to the main handler.
- **Gatekeeping**: `.gates/gatekeeper.js` + `OATH.md` enforce pre-commit rules (`npm run precommit`). `VerificationGate` enforces runtime hard constraints.
- **Coding style**: 2-space indent, single quotes, semicolons, LF, no `console` enforcement off (per `.eslintrc.js`).

## 10. Data-flow examples

- **Route & execute**: `stigmergy call "..."` → `commands/project.js#handleCallCommand` → `SmartRouter.route()` → chosen CLI → `CLIAdapterManager` spawn → result.
- **Cross-CLI handoff**: Agent A `auto-coordinator handoffs` write → `bus/coordinator.js` file → Agent B `takeover` scans bus → claims task → context preserved in bus.
- **Remote control**: IM message → cc-connect → Gateway `/webhook/:platform` → command router → CLI → response back through platform.
- **Skill install once**: `skill install owner/repo` → `SkillInstaller` writes `~/.stigmergy/skills` → `SkillSyncManager` fans out to each agent's skills dir per `CLI_TOOLS[*].skills.dir`.

## Drift / caveats

- Stale ARCHITECTURE.md referenced `src/orchestration/managers/`, `src/orchestration/events/`, and `src/commands/skill.js` — none exist.
- Line counts in the stale doc were lower; current counts (measured) are materially larger (e.g. `router-beta.js` 1078, `installer.js` 1400).
- Old doc described the orchestrator as central to execution; today it is dead code relative to the CLI path.
