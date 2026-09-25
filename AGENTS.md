# AGENTS.md

This file provides guidance for AI coding agents working in this repository.

## Project Overview

Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System. Enables AI CLI tools (Claude, Gemini, Qwen, iFlow, Qoder, Copilot, etc.) to collaborate through a plugin architecture.

**Architecture**: Node.js primary, Python fallback for graceful degradation.

## Build/Lint/Test Commands

```bash
# Run CLI locally
npm start

# Run all tests
npm test

# Run specific test file
npx jest tests/unit/<filename>.test.js

# Run single test by name
npx jest --testNamePattern="<pattern>"

# Run unit tests with coverage
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run automation tests
npm run test:automation

# Run functional tests
npm run test:functional

# Run all tests with report
npm run test:all

# Run tests with coverage report
npm run test:coverage

# Generate HTML coverage report
npm run test:report

# Watch mode for development
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## Code Style Guidelines

### General

- Use ES2020+ features (ESM via CommonJS for compatibility)
- No comments unless explaining complex logic (per AGENTS.md rule)
- File encoding: UTF-8

### Formatting (ESLint + Prettier)

- Indent: 2 spaces
- Line endings: Unix (LF)
- Quotes: Single quotes
- Semicolons: Always required
- No console statements in production code (eslint rule: off in config but avoid)

### Imports

```javascript
// Core modules first
const fs = require("fs");
const path = require("path");

// Third-party
const chalk = require("chalk");
const { Command } = require("commander");

// Local (relative paths)
const MemoryManager = require("../core/memory_manager");
```

### Naming Conventions

- **Files**: kebab-case (e.g., `cli-help-analyzer.js`)
- **Classes**: PascalCase (e.g., `MemoryManager`)
- **Functions/variables**: camelCase (e.g., `getUserConfig`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Private methods**: prefix with `_` (e.g., `_initInternal`)

### Error Handling

- Always wrap async operations in try/catch
- Use descriptive error messages with context
- Propagate errors to main handler for CLI exit
- Never swallow errors silently

```javascript
try {
  await performOperation();
} catch (error) {
  console.error(`[MODULE] Failed to ${action}: ${error.message}`);
  throw error;
}
```

### Async/Await

- Never use .then()/.catch() chains; use async/await
- Always handle promise rejections explicitly

### Module Structure

```javascript
// 1. Shebang (for CLI entry points)
#!/usr/bin/env node

// 2. Dependencies
const core = require('...');

// 3. Constants
const CONFIG_PATH = '/path';

// 4. Main functions
function main() { ... }

// 5. Helpers (if exported)
exports.helper = function() { ... }

// 6. CLI entry
if (require.main === module) {
  main().catch(handleFatal);
}
```

## Architecture

### Entry Points

- `src/index.js` - Main entry, loads `cli/router-beta.js`
- `src/cli/router-beta.js` - Modular command router
- `src/commands/*.js` - Command handlers
- `src/core/*.js` - Core services (memory_manager, installer, smart_router)
- `src/adapters/*/` - Tool-specific adapters

### Core Systems

- **SmartRouter**: Routes prompts to appropriate AI tools
- **MemoryManager**: Interaction history storage
- **HookManager**: Plugin integration hooks
- **SkillManager**: Skill loading and execution

## CLI Commands

```bash
# Core operations
stigmergy start           # Run CLI
stigmergy scan            # Detect available AI CLI tools
stigmergy init            # Initialize system
stigmergy status          # System status
stigmergy install <tool>  # Install adapter (claude, gemini, qwen, iflow, qoder, copilot, codex, kilocode, kode, etc.)

# Skills
stigmergy skill read <name>     # Load skill
stigmergy use <cli> skill <n>   # Cross-CLI call
stigmergy call skill <n>        # Auto-route skill

# Auth
stigmergy register <user> <pass>
stigmergy login <user> <pass>
stigmergy auth-status
```

## Testing Guidelines

- Tests in `tests/unit/`, `tests/integration/`, `tests/e2e/`
- Test files: `*.test.js` suffix
- Coverage thresholds: branches 70%, functions 75%, lines/statements 80%
- Mock external services; test core logic
- Use Jest with `testMatch: ['**/tests/**/*.test.js']`

## Configuration Files

- `.eslintrc.js` - Linting rules (indent: 2, single quotes, Unix line endings, semicolons required)
- `jest.config.js` - Test configuration (coverage thresholds: branches 70%, functions 75%, lines 80%)
- `package.json` - Scripts and dependencies
- `.prettierrc` - Code formatting (if present)

## Code Quality

- Run 
pm run lint` before committing
- Run 
pm run format` to auto-format code
- Coverage thresholds enforced: branches 70%, functions 75%, statements/lines 80%
- Test timeout: 120000ms (2 minutes)

## Git History Best Practices (Lessons Learned)

> Based on Git history analysis (2025-01 to 2026-04), see `docs/git-history-analysis-best-practices.md` for details.

### Submission Standards

1. **Phase-based delivery**: Format `feat: Phase {N} Task {M} - {description}`, each Phase 3-5 commits
2. **Test-first**: Every `feat` commit must include test file changes (`*.test.*` or `tests/`)
3. **Small batch, high frequency**: Single commit = single feature, >5 files changed = consider splitting
4. **Doc-code pairing**: Documentation must be within 24h of related code commit
5. **No celebration commits**: Compress celebration to 1 commit max, must include verifiable changes

### Anti-Patterns to Avoid

1. **NO repeated "success" declarations**: `5e5830a3` + `b83efec8` duplicate celebration
2. **NO big-bang development**: Split >200 line features into >=3 testable sub-features
3. **NO re-implement from scratch**: Extend existing code with extension points (config/plugin/hooks)
4. **NO reactive fix bursts**: Use pre-commit hooks to catch lint/compatibility issues early
5. **NO doc bloat**: Auto-generate reports from test/CI output, not manual writing

### Commit Format

```
{type}: {description}

Types: feat, fix, docs, chore, test, refactor, release
Priority for fixes: P0 (critical), P1 (important), P2 (minor)
```

### Pre-Commit Checklist

- [ ] Commit message follows format
- [ ] feat includes test changes
- [ ] <5 files changed (or split into multiple commits)
- [ ] No duplicate celebration (check recent commits)
- [ ] Lint passes (
pm run lint`)

<!-- SKILLS_START -->
<skills_system priority="1">

## Stigmergy Skills

<usage>
Skills are discovered natively by OpenCode (see available_items in the system prompt).
List installed skills anytime with: Bash("stigmergy skill list").
</usage>

</skills_system>
<!-- SKILLS_END -->
