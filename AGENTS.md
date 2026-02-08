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

- `.eslintrc.js` - Linting rules
- `jest.config.js` - Test configuration
- `package.json` - Scripts and dependencies

<!-- SKILLS_START -->

<skills_system priority="1">

## Stigmergy Skills

<usage>
Load skills using Stigmergy skill manager:

Direct call (current CLI):
Bash("stigmergy skill read <skill-name>")

Cross-CLI call (specify CLI):
Bash("stigmergy use <cli-name> skill <skill-name>")

Smart routing (auto-select best CLI):
Bash("stigmergy call skill <skill-name>")

The skill content will load with detailed instructions.
Base directory will be provided for resolving bundled resources.
</usage>

<available_skills>

<skill>
<name>ant</name>
<description>行动者网络理论分析</description>
<location>stigmergy</location>
</skill>

<skill>
<name>business-ecosystem-analysis</name>
<description>商业生态系统分析</description>
<location>stigmergy</location>
</skill>

<skill>
<name>conflict-resolution</name>
<description>学术研究分歧解决</description>
<location>stigmergy</location>
</skill>

<skill>
<name>digital-transformation</name>
<description>数字化转型分析</description>
<location>stigmergy</location>
</skill>

<skill>
<name>ecosystem-analysis</name>
<description>生态系统分析</description>
<location>stigmergy</location>
</skill>

<skill>
<name>field-expert</name>
<description>布迪厄场域理论分析</description>
<location>stigmergy</location>
</skill>

<skill>
<name>grounded-theory-expert</name>
<description>扎根理论分析</description>
<location>stigmergy</location>
</skill>

<skill>
<name>mathematical-statistics</name>
<description>数理统计分析</description>
<location>stigmergy</location>
</skill>

<skill>
<name>network-computation</name>
<description>社会网络计算</description>
<location>stigmergy</location>
</skill>

<skill>
<name>validity-reliability</name>
<description>研究信度效度分析</description>
<location>stigmergy</location>
</skill>

<!-- Superpowers Skills (bundled from obra/superpowers) -->

<skill>
<name>using-superpowers</name>
<description>Superpowers Meta-Skill - Mandatory First Response Protocol</description>
<location>superpowers</location>
</skill>

<skill>
<name>brainstorming</name>
<description>Structured design process and brainstorming methodology</description>
<location>superpowers</location>
</skill>

<skill>
<name>test-driven-development</name>
<description>TDD workflow: Red-Green-Refactor cycle</description>
<location>superpowers</location>
</skill>

<skill>
<name>systematic-debugging</name>
<description>Systematic debugging methodology</description>
<location>superpowers</location>
</skill>

<skill>
<name>subagent-driven-development</description>Coordinate multiple subagents for complex tasks</description>
<location>superpowers</location>
</skill>

<skill>
<name>writing-plans</name>
<description>Create comprehensive implementation plans</description>
<location>superpowers</location>
</skill>

<skill>
<name>executing-plans</name>
<description>Execute previously created plans systematically</description>
<location>superpowers</location>
</skill>

<skill>
<name>using-git-worktrees</name>
<description>Create isolated git worktrees for feature development</description>
<location>superpowers</location>
</skill>

<skill>
<name>finishing-a-development-branch</name>
<description>Complete and merge development branches</description>
<location>superpowers</location>
</skill>

<skill>
<name>requesting-code-review</name>
<description>Request code reviews from other agents</description>
<location>superpowers</location>
</skill>

<skill>
<name>receiving-code-review</name>
<description>Receive and respond to code reviews</description>
<location>superpowers</location>
</skill>

<skill>
<name>writing-skills</name>
<description>Create new skills following best practices</description>
<location>superpowers</location>
</skill>

<skill>
<name>code-reviewer</name>
<description>Superpowers code-reviewer agent (Claude only)</description>
<location>superpowers</location>
</skill>

</available_skills>

</skills_system>

<!-- SKILLS_END -->
