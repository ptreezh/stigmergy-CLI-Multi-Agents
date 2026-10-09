# Stack

> Fresh gsd-scan (`tech+arch`) output. Supersedes the stale 2026-04-12 copy.
> Ground truth: `package.json` (v1.11.0), `jest.config.js`, `.eslintrc.js`, `eslint.config.js`, root tree.

## Package

| Field | Value |
|---|---|
| name | `stigmergy` |
| version | `1.11.0` |
| description | Orchestration layer for multiple AI CLI tools |
| main | `src/index.js` |
| bin | `stigmergy` → `src/index.js` |
| license | MIT |
| repository | `github.com/ptreezh/stigmergy-CLI-Multi-Agents` |
| published files | `src/`, `skills/`, `config/`, `scripts/`, `docs/`, `wiki/`, `dist/`, README, LICENSE, CHANGELOG |

## Languages

| Language | Role | Evidence |
|---|---|---|
| JavaScript (CommonJS) | Primary — CLI, core services, commands | `src/**/*.js` (101 files) |
| TypeScript | Orchestration layer only | `src/orchestration/core/CentralOrchestrator.ts`; prebuilt `dist/orchestration/core/CentralOrchestrator.js` |
| Python | Adapter glue only (34 `.py` under `src/`) | `src/adapters/__init__.py` (169), `src/adapters/iflow/official_hook_adapter.py` (1271), `src/adapters/copilot/mcp_server.py` (168), `src/auth.py` (196) |

Module system: CommonJS (`require`/`module.exports`). Style: ES2020+ features, 2-space indent, single quotes, semicolons.

## Runtime

- **Node.js**: `>=16.0.0` (`engines.node`).
- **Package manager**: npm with committed `package-lock.json`.
- No bundler for runtime; `babel-jest` only transforms tests.

## Dependencies (`dependencies`)

| Package | Version |
|---|---|
| axios | ^1.13.6 |
| chalk | ^4.1.2 |
| commander | ^14.0.2 |
| cron-parser | ^4.9.0 |
| inquirer | ^8.2.6 |
| js-yaml | ^4.1.1 |
| qrcode-terminal | ^0.12.0 |
| semver | ^7.7.3 |

## Optional peer dependencies (all `optional: true`)

| Package | Version | Purpose |
|---|---|---|
| wechaty | ^1.20.2 | WeChat bot integration |
| wechaty-puppet-wechat | ^1.18.4 | WeChat puppet backend |
| playwright | ^1.58.2 | Browser automation |
| qrcode | ^1.5.4 | QR rendering |
| file-box | ^1.5.5 | WeChat file transfer |

## Dev dependencies

| Package | Version |
|---|---|
| @babel/core | ^7.28.6 |
| @babel/preset-env | ^7.28.6 |
| @types/jest | ^30.0.0 |
| @types/node | ^25.0.9 |
| babel-jest | ^30.2.0 |
| eslint | ^9.39.2 |
| fs-extra | ^11.3.3 |
| jest | ^30.2.0 |
| jest-junit | ^16.0.0 |
| prettier | ^3.7.4 |
| rimraf | ^6.1.2 |
| ts-node | ^10.9.2 |
| typescript | ^5.9.3 |

`overrides`: `minimatch` 9.0.5, `brace-expansion` ^2.0.2, `picomatch` ^4.0.3.

## Scripts (`package.json`)

```
postinstall      node scripts/postinstall-deploy.js
start            node src/index.js
build            npm run build:orchestration
build:orchestration  tsc --project tsconfig.build.json
pack             npm pack --dry-run
verify:package   node scripts/verify-package-content.js
concurrent       node src/index.js concurrent
interactive      node src/index.js interactive
status           node src/index.js status
scan             node src/index.js scan
wiki:scan        node src/index.js wiki-scan
init             node src/index.js init
setup            node src/index.js setup
call             node src/index.js call
check:desktop-versions  node scripts/check-desktop-versions.js
clean            node cleanup.js
test             node scripts/run-tests.js
test:unit        jest tests/unit --coverage
test:integration jest tests/integration
test:e2e         jest tests/e2e
test:automation  jest tests/automation
test:functional  jest tests/functional
test:all         node scripts/run-tests.js all
test:watch       jest --watch
test:coverage    jest --coverage
test:report      jest --coverage --coverageReporters=html
lint             eslint src/**/*.js
format           prettier --write src/**/*.js
gatekeeper       node .gates/gatekeeper.js
gatekeeper:check node .gates/gatekeeper.js
gatekeeper:ci    node .gates/gatekeeper-ci.js
precommit        npm run gatekeeper
```

## Build & tooling facts

- **TypeScript build**: `npm run build` → `tsc --project tsconfig.build.json`.
  - ⚠️ **DISCREPANCY**: no `tsconfig.json` and no `tsconfig.build.json` exist at the repo root. The only `tsconfig.json` files found are `dist/tsconfig.json`, `openskills/tsconfig.json`, `SmartWorkstation/tsconfig.json`. As-is, `npm run build` cannot succeed at the root; a compiled `dist/orchestration/core/CentralOrchestrator.js` is checked in and consumed directly.
- **Lint**: ESLint ^9 with both `.eslintrc.js` (legacy flat-less config) and `eslint.config.js` present.
- **Format**: Prettier ^3. Note: **no `.prettierrc` at root** (a prior doc claimed one existed).
- **Pre-commit gate**: `.gates/gatekeeper.js` (`npm run precommit` → `gatekeeper`). `.gates/` also holds `GATEKEEPER.md`, `OATH.md`, `README.md`.
- **Editor/CI**: `.github/` contains PR template, community health, and issue templates only — **no GitHub Actions workflows**.

## Test tooling

`jest.config.js`:
- `roots: ["<rootDir>/tests"]`
- `testMatch: ["**/tests/**/*.test.js"]`
- transform: `babel-jest`
- `testTimeout: 120000`
- `moduleNameMapper`: `^@/(.*)$` → `<rootDir>/src/$1`
- reporters include `jest-junit`

Existing test entry points: `scripts/run-tests.js` (`test`, `test:all`); per-suite jest scripts (`test:unit`, `test:integration`, `test:e2e`, `test:automation`, `test:functional`).

## Notes / drift from stale docs

- Prior STACK.md listed Node `>=16`, Commander `^14.0.2`, Jest `^30.2.0`, Playwright `^1.58.2` and a `.prettierrc` — versions match, but the Prettier config file does not exist.
- `dist/` is itself a stale published snapshot (contains `RELEASE_NOTES_v1.2.5.md`, `stigmergy-1.6.4.tgz`, its own `tsconfig.json`) — do not treat `dist/` as current source. `src/` is the source of truth.
