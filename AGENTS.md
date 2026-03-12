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

- Run `npm run lint` before committing
- Run `npm run format` to auto-format code
- Coverage thresholds enforced: branches 70%, functions 75%, statements/lines 80%
- Test timeout: 120000ms (2 minutes)

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
<name>subagent-driven-development</name>
<description>Coordinate multiple subagents for complex tasks</description>
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

<skill>
<name>verification-before-completion</name>
<description>Use when about to claim work is complete - requires running verification commands and confirming output before making any success claims</description>
<location>superpowers</location>
</skill>

<skill>
<name>dispatching-parallel-agents</name>
<description>Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies</description>
<location>superpowers</location>
</skill>

<skill>
<name>skill-creator</name>
<description>Guide for creating effective skills - use when users want to create a new skill</description>
<location>superpowers</location>
</skill>

<skill>
<name>skill-from-github</name>
<description>Create skills by learning from high-quality GitHub projects</description>
<location>superpowers</location>
</skill>

<skill>
<name>skill-from-masters</name>
<description>Discover expert frameworks before creating skills - guides methodology selection</description>
<location>superpowers</location>
</skill>

<skill>
<name>web-artifacts-builder</name>
<description>Suite of tools for creating elaborate HTML artifacts using React, Tailwind CSS, shadcn/ui</description>
<location>superpowers</location>
</skill>

<skill>
<name>frontend-design</name>
<description>Create distinctive, production-grade frontend interfaces with high design quality</description>
<location>superpowers</location>
</skill>

<skill>
<name>webapp-testing</name>
<description>Toolkit for interacting with and testing local web applications using Playwright</description>
<location>superpowers</location>
</skill>

<skill>
<name>testing-skills-with-subagents</name>
<description>Use when creating or editing skills, before deployment, to verify they work under pressure</description>
<location>superpowers</location>
</skill>

<skill>
<name>testing-anti-patterns</name>
<description>Use when writing or changing tests - prevents testing mock behavior and production pollution</description>
<location>superpowers</location>
</skill>

<skill>
<name>condition-based-waiting</name>
<description>Use when tests have race conditions - replaces arbitrary timeouts with condition polling</description>
<location>superpowers</location>
</skill>

<skill>
<name>root-cause-tracing</name>
<description>Use when errors occur deep in execution - systematically traces bugs backward through call stack</description>
<location>superpowers</location>
</skill>

<skill>
<name>defense-in-depth</name>
<description>Use when invalid data causes failures deep in execution - validates at every layer data passes through</description>
<location>superpowers</location>
</skill>

<skill>
<name>sharing-skills</name>
<description>Use when you've developed a broadly useful skill and want to contribute it upstream via pull request</description>
<location>superpowers</location>
</skill>

<skill>
<name>resumesession</name>
<description>Cross-CLI session recovery and history management skill</description>
<location>superpowers</location>
</skill>

<skill>
<name>planning-with-files</name>
<description>Implements Manus-style file-based planning for complex tasks</description>
<location>superpowers</location>
</skill>

<skill>
<name>auto-memory-claude</name>
<description>Advanced auto-memory skill for Claude CLI with JavaScript execution</description>
<location>superpowers</location>
</skill>

<skill>
<name>literature-search-zh</name>
<description>中文学术文献搜索技能 - 支持PubMed、CNKI、万方等中英文数据库</description>
<location>superpowers</location>
</skill>

<skill>
<name>scientific-writing-zh</name>
<description>中文学术论文写作技能 - IMRAD结构、中文学术规范</description>
<location>superpowers</location>
</skill>

<skill>
<name>soul-evolution</name>
<description>自主进化 - 基于双Agent循环的自我学习与进化</description>
<location>superpowers</location>
</skill>

<skill>
<name>soul-compete</name>
<description>竞争进化 - 基于双Agent循环的方案对比与最优选择</description>
<location>superpowers</location>
</skill>

<skill>
<name>soul-co-evolve</name>
<description>协同进化 - 基于双Agent循环的多CLI协作学习</description>
<location>superpowers</location>
</skill>

<skill>
<name>soul-reflection</name>
<description>自我反思 - 基于双Agent循环的分析与学习提取</description>
<location>superpowers</location>
</skill>

<skill>
<name>two-agent-loop</name>
<description>双Agent循环 - 所有进化的基础执行机制</description>
<location>superpowers</location>
</skill>

<skill>
<name>theme-factory</name>
<description>Toolkit for styling artifacts with a theme - 10 pre-set themes</description>
<location>superpowers</location>
</skill>

<skill>
<name>docx</name>
<description>Comprehensive document creation, editing, and analysis for .docx files</description>
<location>superpowers</location>
</skill>

<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit</description>
<location>superpowers</location>
</skill>

<skill>
<name>pptx</name>
<description>Presentation creation, editing, and analysis for .pptx files</description>
<location>superpowers</location>
</skill>

<skill>
<name>xlsx</name>
<description>Comprehensive spreadsheet creation, editing, and analysis with formulas</description>
<location>superpowers</location>
</skill>

<skill>
<name>search-skill</name>
<description>Search and recommend Claude Code skills from trusted marketplaces</description>
<location>superpowers</location>
</skill>

<skill>
<name>mcp-builder</name>
<description>Guide for creating high-quality MCP (Model Context Protocol) servers</description>
<location>superpowers</location>
</skill>

<skill>
<name>slack-gif-creator</name>
<description>Knowledge and utilities for creating animated GIFs optimized for Slack</description>
<location>superpowers</location>
</skill>

<skill>
<name>internal-comms</name>
<description>A set of resources for writing internal communications</description>
<location>superpowers</location>
</skill>

<skill>
<name>canvas-design</name>
<description>Create beautiful visual art in .png and .pdf documents</description>
<location>superpowers</location>
</skill>

<skill>
<name>algorithmic-art</name>
<description>Creating algorithmic art using p5.js with seeded randomness</description>
<location>superpowers</location>
</skill>

<skill>
<name>doc-coauthoring</name>
<description>Guide users through a structured workflow for co-authoring documentation</description>
<location>superpowers</location>
</skill>

<skill>
<name>brand-guidelines</name>
<description>Applies Anthropic's official brand colors and typography</description>
<location>superpowers</location>
</skill>

<skill>
<name>template-skill</name>
<description>Template skill for creating new skills</description>
<location>superpowers</location>
</skill>

</available_skills>

</skills_system>

<!-- SKILLS_END -->
