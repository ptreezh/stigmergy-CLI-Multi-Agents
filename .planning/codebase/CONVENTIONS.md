# Coding Conventions

**Analysis Date:** 2026-10-09 (refresh; prior copy dated 2026-04-12)

Sources: `.eslintrc.js`, `eslint.config.js`, `package.json`, `AGENTS.md`. Absent at root: `.prettierrc`, `.prettierrc.json`, `prettier.config.js`, `.editorconfig`.

## Language & Module System

- **Runtime**: Node.js `>=16.0.0` (`package.json` `engines`).
- **Module system**: CommonJS — `require(...)` / `module.exports`. `parserOptions.sourceType: 'module'` is declared in both ESLint configs (ESM syntax parses), but shipped code is CJS.
- **Language level**: ES2020 (`ecmaVersion: 2020`).
- **Entry point**: `src/index.js` (36 lines) → `src/cli/router-beta.js` (1078 lines).
- **Bin**: `stigmergy` → `src/index.js`.

## Formatting Rules

> **DRIFT**: two ESLint configs with conflicting rules + no Prettier config file → the effective ruleset is ambiguous. See `CONCERNS.md`.

### Legacy config — `.eslintrc.js` (21 lines, eslintrc format)
- `extends: ['eslint:recommended']`; `env: { es6: true, node: true }`.
- Enforced: `indent: ['error', 2]`, `linebreak-style: ['error', 'unix']` (LF), `quotes: ['error', 'single']`, `semi: ['error', 'always']`, `no-unused-vars: 'warn'`, `no-console: 'off'`.

### Flat config — `eslint.config.js` (40 lines, ESLint 9 flat format)
- `@eslint/js` recommended; `files: ["**/*.js"]`.
- **Disabled**: `quotes`, `indent`, `no-unused-vars`, `no-undef`, `no-empty`, `no-case-declarations`, `no-useless-catch`, `no-useless-escape`, `no-dupe-class-members`, `no-misleading-character-class`.
- **Kept**: `semi: ['error', 'always']`, `no-console: 'off'`.
- Declares Node globals explicitly (`console`, `process`, `require`, `module`, `exports`, `__dirname`, `__filename`, `Buffer`, timers).

> ESLint `^9.39.2`; ESLint 9 defaults to **flat config** and ignores `.eslintrc.js` unless `ESLINT_USE_FLAT_CONFIG=false`. Effective default: indent/quotes/no-unused-vars are **not** enforced.

### Prettier
- `prettier` `^3.7.4` devDep; `format` script = `prettier --write src/**/*.js`.
- **No config file present** (`.prettierrc` referenced by AGENTS.md does not exist). Prettier runs on defaults (double quotes, 2-space, semis, 80 cols) → **conflicts** with eslintrc `single`.

## Naming Patterns

Per `AGENTS.md`:
- **Files**: kebab-case (`cli-help-analyzer.js`). Observed exceptions: PascalCase class files (`ProjectStatusBoard.js`).
- **Classes**: PascalCase (`MemoryManager`, `SmartRouter`, `StigmergyError`, `VerificationGate`).
- **Functions/variables**: camelCase (`getUserConfig`). Private methods prefixed `_` (`_initInternal`).
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `CLI_TOOLS`, `DESKTOP_TOOLS`, `NATIVE_SESSION_DIRS`, `ERROR_TYPES`).
- **Types/Interfaces**: PascalCase (`ErrorType`, `CLIToolConfig`).

## Import Organization

Order: Node built-ins (`fs`, `path`, `os`) → external (`chalk`, `commander`) → internal relative (`../core/...`).
Path aliases: none in runtime config; Jest maps `@/` → `src/` (`moduleNameMapper`). Use relative imports.

## Error Handling

- Custom class `StigmergyError extends Error` (`src/core/error_handler.js`) with `type` (from `ERROR_TYPES`), `code`, `details`, `timestamp`.
- `ERROR_TYPES` enum: `VALIDATION, NETWORK, FILE_SYSTEM, CLI_TOOL, CONFIGURATION, PERMISSION, UNKNOWN`.
- `LOG_LEVELS`: `ERROR, WARN, INFO, DEBUG`.
- Use `ErrorHandler` singleton: `createError()`, `logError()`, `wrapAsync()`, plus `handleCLIError/handleFileError/handleNetworkError`. `setupGlobalErrorHandlers()` installs `unhandledRejection`/`uncaughtException`.
- Pattern: wrap async in `try/catch`, log with module tag, re-throw; never swallow. No empty catch blocks (hard rule; enforced socially by `.gates/gatekeeper.js`).

```javascript
try {
  await performOperation();
} catch (error) {
  console.error(`[MODULE] Failed to ${action}: ${error.message}`);
  throw error;
}
```

## Async Style

`async/await` only; `.then()/.catch()` chains disallowed (AGENTS.md). Handle promise rejections explicitly.

## Logging

`console` is allowed (`no-console: off`); colored output via `chalk` (`chalk.red.bold('[ERROR]')`, etc.).

## Comments

Minimal. JSDoc for public functions (params/returns); comment complex business logic and non-obvious decisions only.

## Function & Module Design

- Function size: target < 50 lines, max ~80–100.
- Destructure object params; provide defaults; document in JSDoc.
- Consistent return types; `null` (not `undefined`) for "no value".
- Export pattern: named exports object (`module.exports = { ErrorHandler, errorHandler, StigmergyError, ... }`); handlers as singletons.
- Class pattern: options-object constructor + `_privateMethod` convention.
- Prefer many cohesive small files over few large ones; organize by feature/domain.

## File Organization

```
src/
  cli/          # routing + commands
  core/         # core services (memory_manager, smart_router, installer, error_handler, cli_tools, agent_*)
  adapters/     # platform adapters (per-tool)
  gateway/      # IM gateway server
  commands/     # business command handlers
```

## Commit Conventions (from AGENTS.md)

Format `feat: Phase {N} Task {M} - {description}`. Types: `feat, fix, docs, chore, test, refactor, release`; fix priority `P0/P1/P2`.
Pre-commit checklist: message format ✓; `feat` includes test changes ✓; `< 5` files changed (else split); no duplicate celebration; `npm run lint` passes.
Banned: repeated "success" declarations, big-bang (>200-line unsplit features), re-implementing from scratch, reactive fix bursts, doc bloat.

## Documentation & Encoding

- Docs are bilingual (Chinese + English mixed); 233 `.md` files under `docs/`.
- **Encoding contract (global)**: all text files valid UTF-8, no BOM, no GBK/GB2312/latin-1 Python source declarations.
- Measured (this pass): `AGENTS.md`, `README.md`, `src/core/cli_tools.js`, `src/core/desktop-tools.js`, `docs/project-constitution.md` are all **valid UTF-8, no BOM**.
- **DRIFT**: global contract references `scripts/check_encoding.py` and `scripts/convert_to_utf8.py`; `scripts/` holds **0 `.py` files** (156 files, all `.js`) — enforcement tooling absent.

---

**Verified**: line counts via `(Get-Content).Count` — `.eslintrc.js` 21, `eslint.config.js` 40, `package.json` 160, `src/index.js` 36, `src/cli/router-beta.js` 1078. Root `Test-Path` False for `.prettierrc`, `.prettierrc.json`, `prettier.config.js`, `.editorconfig`, `tsconfig.json`, `tsconfig.build.json`.
