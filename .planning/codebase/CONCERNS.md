# Codebase Concerns

**Analysis Date:** 2026-10-09 (refresh; prior copy dated 2026-04-12)

Every item below is **directly measured this pass** unless explicitly marked "(unverified — carried from prior audit)". Line counts via `(Get-Content).Count`.

## Build & Tooling

### TS orchestration build is broken
**Issue:** `npm run build` → `build:orchestration` → `tsc --project tsconfig.build.json`, but **neither `tsconfig.json` nor `tsconfig.build.json` exists** at root (`Test-Path` False for both).
**Impact:** `npm run build` cannot succeed; `README.md` Development section instructs `npm run build:orchestration`.
**Fix approach:** Add `tsconfig.json` + `tsconfig.build.json`, or remove/repair the script and README step.

### Duplicate `keywords` key in `package.json`
**Issue:** The `keywords` key appears **twice** (verified: 2 matches). The second definition silently overrides the first, dropping the earlier SEO keyword set.
**Impact:** npm search metadata reduced; classic silent-overwrite footgun.
**Fix approach:** Merge the two keyword arrays into one.

### Dual, conflicting ESLint configs
**Issue:** `.eslintrc.js` (strict: indent 2 / LF / single quotes) AND `eslint.config.js` (flat, permissive: those rules **off**). ESLint `^9.39.2` defaults to flat config → the strict `.eslintrc.js` is effectively ignored.
**Impact:** Style rules documented in AGENTS.md are not enforced by `npm run lint`.
**Fix approach:** Keep one config; port intended rules into the flat config.

### `lint` script glob unreliable on Windows
**Issue:** `lint` = `eslint src/**/*.js`. Shell glob expansion of `**` differs by shell; on Windows/PowerShell the pattern may not expand as intended.
**Impact:** Lint may silently cover wrong/zero files.
**Fix approach:** Use `eslint src` (directory) or `eslint .` with flat-config ignores.

### Prettier configured but unconfgured
**Issue:** `format` script + `prettier@^3.7.4` present, but **no `.prettierrc`/`.prettierrc.json`/`prettier.config.js`/`.editorconfig`**. AGENTS.md references `.prettierrc` — it does not exist.
**Impact:** Prettier defaults (double quotes) conflict with the eslintrc single-quote rule; formatting is non-deterministic vs docs.
**Fix approach:** Add a Prettier config aligned with ESLint.

## Testing Gaps

### Coverage not enforced
**Issue:** `jest.config.js` has **no `coverageThreshold`**, yet AGENTS.md claims 70/75/80 thresholds.
**Impact:** Coverage is reported but never gated; regressions pass CI-less.
**Fix approach:** Add `coverageThreshold` matching the documented numbers (or update docs).

### Missing test-category directories
**Issue:** npm scripts + `scripts/run-tests.js` target `tests/integration`, `tests/e2e`, `tests/automation`, `tests/functional` — **none exist** (only `tests/` and `tests/unit/`). `run-tests.js` uses `--passWithNoTests`, hiding the gap.
**Impact:** Those suites silently "pass" while doing nothing.
**Fix approach:** Create the dirs with real tests, or remove the dead scripts.

### Thin suite
**Issue:** Only **10 `.test.js`** files; no tests under `src/` despite evidence from the prior audit of `__tests__` claims.
**Impact:** Core coordination/install/gateway modules largely untested.
**Fix approach:** Prioritize unit tests for `src/core/agent_*`, `installer`, `gateway/server.js`.

### Malformed `pytest.ini`
**Issue:** Header `[tool.pytest.ini_options]` (a `pyproject.toml` TOML key) in a `.ini` file, body `asyncio_mode = "strict"`.
**Impact:** Python config likely ignored; `.agent/skills` Python tests may run with wrong asyncio mode.
**Fix approach:** Move config to `pyproject.toml` `[tool.pytest.ini_options]` or fix the `.ini` section to `[pytest]`.

## Packaging & Repo Hygiene

### Root artifact pollution
**Issue:** 8 `*.tgz` (stigmergy-1.3.77 … 1.11.0) and 10 `*test-report*.json` at repo root, plus 5 scratch scripts: `add_numbers.py`, `fibonacci.py`, `pdf_table_extractor.py`, `system_engineering_skill.py`, `token_monitor.py`.
**Impact:** Root clutter; scratch `.py` violates the "no non-UTF-8 / no stray scripts" hygiene expectation and confuses tooling.
**Fix approach:** Remove or relocate under `test-results/` and a scratch dir; gitignore them.

### Stale build artifact shipped
**Issue:** `dist/` exists and is listed in `package.json` `files`.
**Impact:** Stale compiled output may ship if not rebuilt.
**Fix approach:** Rebuild in CI/prepublish or exclude from `files`.

### Encoding-tooling contract unmet
**Issue:** The global encoding contract references `scripts/check_encoding.py` and `scripts/convert_to_utf8.py`; both **absent**. `scripts/` = 156 files, **0 `.py`**.
**Impact:** No automated UTF-8 enforcement despite the documented contract and pre-commit expectation.
**Fix approach:** Add the scripts and wire the pre-commit hook, or amend the contract.
**Note:** Current files **are** valid UTF-8 no-BOM (sampled: `AGENTS.md`, `README.md`, `src/core/cli_tools.js`, `src/core/desktop-tools.js`, `docs/project-constitution.md`). The prior "GBK/mojibake" claim is **refuted** by strict-UTF-8 decode.

## Documentation & Consistency Drift

### Doc/behavior discrepancies
**Issue:** AGENTS.md and README assert things not true in the tree: coverage thresholds (none), `tsconfig.build.json` (absent), `.prettierrc` (absent), test dirs (absent), `scripts/*.py` encoding tools (absent).
**Impact:** Contributors/agents follow wrong instructions.
**Fix approach:** Reconcile docs with the actual tree after deciding which side to change.

### Agent-count inconsistency in README
**Issue:** README cites "20 agents verified", "22 agents in ontology", "17+ verified agents", "10+ verified agents with heterogeneous path conventions" in different sections.
**Impact:** Unclear authoritative count.
**Fix approach:** Single source of truth for counts.

### Documentation volume
**Issue:** 233 `.md` files under `docs/`.
**Impact:** Doc bloat risks drift and contradicts the "no doc bloat" rule in AGENTS.md.
**Fix approach:** Periodic consolidation; auto-generate where possible.

## Dependencies

### Unpinned/loose core deps
**Issue:** Key deps use caret ranges (`eslint ^9`, `jest ^30`, `prettier ^3`, `commander/chalk/inquirer`). Major bumps can break CLI/tests.
**Impact:** Non-reproducible installs; surprise breakage.
**Fix approach:** Add `package-lock.json` commitment + pin critical ranges; add Renovate/Dependabot.

## Carried from prior audit (2026-04-12) — UNVERIFIED THIS PASS

Not re-measured this pass; verify before acting:
- Empty catch blocks reported at `src/cli/commands/project.js:449`, `src/cli/commands/superpowers.js:228,280`, `src/core/soul_task_planner.js:468`, `src/core/soul_system_scheduler.js`, `src/core/soul_auto_merger.js`, `src/core/soul_cli_integration.js:73`.
- `evolution-log.jsonl` showing consecutive soul-evolution failures.
- `src/interactive/InteractiveModeController.js.backup-20260126-215905` leftover backup file.
- WeChat login stub (`skills/wechat-hub.js`), secret-handling pattern in `skills/unified-comm-adapter.js`.
- Gatekeeper manual-only (no CI enforcement) — **confirmed** this pass (no `.github/workflows`).

---

**Verified this pass**: `tsconfig.json`/`tsconfig.build.json`/`.prettierrc`/`.prettierrc.json`/`prettier.config.js`/`.editorconfig` all `Test-Path` False; `keywords` count = 2; root `*.tgz` = 8, `*test-report*.json` = 10, scratch `.py` = 5; `scripts/` = 156 files / 0 `.py`; `docs/*.md` = 233; `.github/workflows` absent; `SmartWorkstation/` present; `dist/` present; encoding probes UTF-8/no-BOM OK.
