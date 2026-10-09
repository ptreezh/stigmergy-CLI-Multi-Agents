# Testing Patterns

**Analysis Date:** 2026-10-09 (refresh; prior copy dated 2026-04-12)

Sources: `jest.config.js`, `scripts/run-tests.js`, `package.json`, `pytest.ini`, `.gates/gatekeeper.js`, `tests/`.

## Test Framework: Jest

- `jest` `^30.2.0`, `babel-jest` `^30.2.0`; env `node`; transform `^.+\.js$ → babel-jest` (Babel via `babel.config.js` (9) / `.babelrc` (12)).
- Assertions: Jest built-ins (`expect`, `toBe`, `toEqual`, `toThrow`); globals `describe/it/test/beforeEach/…`.

### `jest.config.js` (28 lines)
- `roots: ["<rootDir>/tests"]`
- `testMatch: ["**/tests/**/*.test.js"]`
- `testPathIgnorePatterns`: `/node_modules/`, `/SmartWorkstation/`, `/dist/`, `/.stigmergy/`
- `collectCoverageFrom`: `src/**/*.js`, excl. `*.test.js`, `__tests__`
- `coverageDirectory: "coverage"`; reporters `["text","lcov","html"]`
- `verbose: true`; `testTimeout: 120000`
- `moduleNameMapper`: `^@/(.*)$ → <rootDir>/src/$1`
- **No `coverageThreshold`** → coverage collected, never gated.

## Test Layout & Inventory

`tests/` has two levels only:
- `tests/stigmergy-orchestrator.test.js`
- `tests/unit/`: `agent_coordinator.test.js`, `agent_registry.test.js`, `agent_state_collector.test.js`, `auto-coordinator.test.js`, `takeover.test.js`, `agent-forensics/detect.test.js`, `agent-forensics/matcher.test.js`, `agent-forensics/sessions.test.js`, `hooks/verification-gate.test.js`

**Total `.test.js`: 10.**

> **DRIFT**: npm scripts + `scripts/run-tests.js` target `tests/integration`, `tests/e2e`, `tests/automation`, `tests/functional` — **none exist**. `run-tests.js` masks via `--passWithNoTests`. (The 2026-04-12 copy of this doc listed those directories as if populated — they are not present.)
> **DRIFT**: prior doc mentioned co-located `__tests__` dirs (e.g. `src/core/skills/__tests__/SkillInstaller.test.js`) — none found under `src/` this pass.

## npm Test Scripts (`package.json`)

| Script | Command |
|---|---|
| `test` | `node scripts/run-tests.js` |
| `test:unit` | `jest tests/unit --coverage` |
| `test:integration` | `jest tests/integration` |
| `test:e2e` | `jest tests/e2e` |
| `test:automation` | `jest tests/automation` |
| `test:functional` | `jest tests/functional` |
| `test:all` | `node scripts/run-tests.js all` |
| `test:watch` | `jest --watch` |
| `test:coverage` | `jest --coverage` |
| `test:report` | `jest --coverage --coverageReporters=html` |

### `scripts/run-tests.js` (168 lines, all-JS)
- Wraps `execSync('npx jest <path> [--coverage] [--passWithNoTests]')`.
- ANSI-colored console output, per-suite timing; writes `test-results/<type>-results.json`.
- Types: `unit (--coverage)`, `integration`, `e2e`, `automation`, `functional`, `all (--coverage)`. Sequential.

## Coverage

- `npm test` → `jest --coverage --passWithNoTests`.
- AGENTS.md claims branches 70 / functions 75 / lines+statements 80.
- **DRIFT**: no `coverageThreshold` in `jest.config.js` → thresholds not enforced.

## Python Testing

- `pytest.ini` (2 lines) **malformed**: header `[tool.pytest.ini_options]` (a `pyproject.toml` key, not a valid standalone `.ini` section for pytest) with body `asyncio_mode = "strict"`. Likely ignored by default discovery.
- Python tests live only in vendored skills, not `src/`: `.agent/skills/digital-transformation/tests/test_digital_transformation.py`, `.agent/skills/ecosystem-analysis/tests/test_ecosystem_analysis.py`, `.agent/skills/field-expert/scripts/test_host_llm.py`, `.agent/skills/pdf/scripts/check_bounding_boxes_test.py`.
- `src/` has 34 `.py` files and **no** matching Python tests.

## Quality Gate: Gatekeeper

- `.gates/gatekeeper.js` (341 lines) — publication gate; 6 checks: simulation-testing ban, verification-level honesty, limitations disclosure, evidence completeness, title accuracy, soul.md alignment.
- npm scripts: `gatekeeper`/`gatekeeper:check` → `node .gates/gatekeeper.js`; `gatekeeper:ci` → `node .gates/gatekeeper-ci.js`; `precommit` → `npm run gatekeeper`.
- Docs: `.gates/README.md`, `.gates/GATEKEEPER.md`.

## CI

- **No CI**: `.github/workflows/` does not exist; no GitLab/CircleCI config observed. Tests/gatekeeper run manually or via local `precommit`.

## Conventions for New Tests

- Files must be `*.test.js` under `tests/` (Jest `testMatch`).
- New unit tests → `tests/unit/`, mirroring `src/`; import via relative paths or `@/` alias.
- Respect 120s timeout; avoid real network/CLI spawning in unit tests.
- To activate the dangling npm scripts, create the missing `tests/<type>/` directories.

---

**Verified**: `jest.config.js` 28, `pytest.ini` 2, `package.json` 160, `scripts/run-tests.js` 168 (all via `(Get-Content).Count`). `tests/` subdirs = `unit` only; `.test.js` enumerated = 10. `.github/workflows` absent (`Test-Path` False).
