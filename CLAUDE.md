# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stigmergy CLI is a multi-agent cross-AI CLI tools collaboration system that enables seamless communication and intelligent task routing between different AI CLI tools (Claude, Gemini, Qwen, iFlow, QoderCLI, CodeBuddy, Copilot, Codex, Kode). It implements a soul evolution system for autonomous learning and improvement.

## Critical Principles

### 🔴 Rigorous Verification First Principle (Highest Priority)

This is the absolute core principle that must never be violated:

**All reports, claims, and conclusions must undergo the most rigorous, complete testing and verification before being reported.**

#### Verification Levels
- **Level 1**: Basic verification - code runs, basic functionality works
- **Level 2**: Integration verification - tested in real environment (minimum required to claim "completed")
- **Level 3**: Stress verification - edge cases and pressure testing
- **Level 4**: Production verification - tested in actual production environment

#### Requirements
1. **Real Execution**: All features must be actually executed and tested; no simulations, assumptions, or hypothetical results
2. **Complete Verification**: Test not just basic functionality but also edge cases, error paths, and real environments
3. **Strict Testing**: Must undergo real scenario testing with multiple rounds of verification
4. **Honest Reporting**: Unverified content cannot be reported as "completed"; limitations must be explicitly stated

### Gatekeeper Hook System

All reports must pass the gatekeeper check before publication. The gatekeeper enforces the verification first principle through mandatory checkpoints:

```bash
# Run gatekeeper check before any report
npm run gatekeeper
```

**Gatekeeper checkpoints**:
- Test authenticity (real execution vs simulation)
- Verification level accuracy
- Limitation disclosure
- Evidence completeness
- Title accuracy
- Soul.md principle alignment

**Location**: `.gates/GATEKEEPER.md` and `.gates/gatekeeper.js`

### Soul Evolution System

Stigmergy implements an autonomous evolution system inspired by OpenClaw:
- **Dual-source memory**: Markdown storage + vector database (SQLite-vec)
- **Autonomous reflection**: Self-critique, error analysis, self-correction
- **Continuous evolution**: Skill discovery, capability enhancement
- **Knowledge production**: Multi-agent debate and consensus computation

## Key Commands

### Development
```bash
# Start the CLI
npm start

# Build orchestration layer (TypeScript)
npm run build:orchestration

# Watch mode for development
npm run dev

# Linting
npm run lint
npm run format
```

### Testing
```bash
# Run all tests
npm test

# Unit tests with coverage
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# Quick tests (skip E2E)
npm run test:quick

# Comprehensive test suite
npm run test:comprehensive

# Run specific test file
npx jest tests/unit/<filename>.test.js

# Run single test by name
npx jest --testNamePattern="<pattern>"
```

### Installation & Setup
```bash
# Complete setup (install + deploy + init)
stigmergy setup

# Install all AI CLI tools
stigmergy install

# Deploy hooks for cross-CLI integration
stigmergy deploy

# Initialize project for session recovery
stigmergy init

# Check status
stigmergy status
```

### CLI Tools Management
```bash
# Scan for available CLI tools
stigmergy scan

# Check/install specific tool
stigmergy install claude
stigmergy install gemini
```

## Architecture

### Entry Point
- `src/index.js` - Main entry point that delegates to `src/cli/router-beta.js`
- `src/cli/router-beta.js` - Modular router implementation with separated command handlers

### Core Components

#### 1. CLI Tools Configuration
- `src/core/cli_tools.js` - Defines all supported AI CLI tools with installation commands, hooks directories, and OAuth configurations
- `src/core/cli_path_detector.js` - Detects and caches paths to available CLI tools
- `src/core/cli_adapters.js` - Normalizes parameter differences between CLI tools (interactive vs one-time modes)

#### 2. Smart Routing System
- `src/core/smart_router.js` - Analyzes user input and automatically selects the best AI tool
- `src/core/cli_help_analyzer.js` - Analyzes CLI help text to extract patterns and capabilities
- `src/core/execution_mode_detector.js` - Detects execution mode (interactive vs one-time)

#### 3. Coordination Layer
- `src/core/coordination/` - Cross-CLI communication and coordination
  - `nodejs/` - Node.js-specific coordination components
    - `HookDeploymentManager.js` - Manages hook deployment to CLI tools
    - `CLIIntegrationManager.js` - Manages CLI tool integrations
    - `AdapterManager.js` - Adapts different CLI tool interfaces
  - `cross_cli_executor.js` - Executes commands across different CLI tools
  - `collaboration_coordinator.js` - Coordinates multi-CLI collaboration
  - `intent_router.js` - Routes user intents to appropriate handlers

#### 4. Command Handlers (`src/cli/commands/`)
- `install.js` - CLI tool installation
- `status.js` - Status checking
- `scan.js` - CLI tool scanning
- `skills.js` - Skill management
- `project.js` - Project-level commands (setup, deploy, init, call)
- `interactive.js` - Interactive mode controller
- `autoinstall.js` - Automatic installation hooks

#### 5. Orchestration Layer (TypeScript)
- `src/orchestration/` - Advanced orchestration and agent coordination
  - `core/CentralOrchestrator.ts` - Core orchestrator for task planning and execution
  - `managers/` - Various managers (GitWorktreeManager, StateLockManager, TaskPlanningFiles, etc.)
  - `events/EventBus.ts` - Event system
  - `hooks/` - Hook system and installer
  - `integration/ResumeSessionIntegration.ts` - ResumeSession integration

#### 6. Soul Engine
- `src/core/soul_engine/` - Autonomous evolution system
  - Memory management, reflection mechanisms, skill discovery
  - Knowledge production through multi-agent debate

### Key Concepts

#### Execution Modes
- **Interactive Mode**: Execute prompt and keep CLI running for continuous conversation
- **One-Time Mode**: Execute prompt and exit (return control to caller)
- Different CLI tools have different flags for these modes (handled by `cli_adapters.js`)

#### Smart Routing
- `stigmergy call "task description"` - Automatically selects the best AI tool
- Uses pattern matching and CLI capability analysis
- Falls back to Claude if no better match found

#### Cross-CLI Communication
```bash
stigmergy <tool_name> <task_description>
```
- Uses hooks deployed to each CLI tool's hooks directory
- Supports OAuth authentication for tools like Qwen

#### Session Recovery
- ResumeSession integration (v1.2.1)
- Generates AGENTS.md and CLI-specific documentation files
- Supports cross-CLI memory sharing

### Testing Structure
- `tests/unit/` - Unit tests for individual components
- `tests/integration/` - Integration tests for component interactions
- `tests/e2e/` - End-to-end tests for complete workflows
- `tests/regression/` - Regression tests
- `tests/performance/` - Performance tests

**Coverage thresholds**: branches 70%, functions 75%, lines/statements 80%

### TypeScript Configuration
- `tsconfig.json` - General TypeScript configuration
- `tsconfig.build.json` - Build configuration for orchestration layer only
- Orchestration layer compiles to `dist/orchestration/`
- `npm run build:orchestration` builds only `src/orchestration/**/*`

## Available CLI Tools

Supported AI CLI tools (defined in `src/core/cli_tools.js`):
- **claude** - Claude CLI (`@anthropic-ai/claude-code`)
- **gemini** - Gemini CLI (`@google/gemini-cli`)
- **qwen** - Qwen CLI (`@qwen-code/qwen-code`)
- **iflow** - iFlow CLI (`@iflow-ai/iflow-cli`)
- **qodercli** - Qoder CLI (`@qoder-ai/qodercli`)
- **codebuddy** - CodeBuddy CLI (`@tencent-ai/codebuddy-code`)
- **copilot** - GitHub Copilot CLI (`@github/copilot`)
- **codex** - OpenAI Codex CLI (`@openai/codex`)
- **kode** - Kode CLI (`@shareai-lab/kode`)

## Skills System

Stigmergy integrates with OpenSkills for skill management:
- `src/core/skills/StigmergySkillManager.js` - Unified skill manager
- `src/core/skills/embedded-openskills/` - OpenSkills core functionality
- `src/commands/skill.js` - Skill command handler
- Skills can be installed from GitHub repositories
- Search paths: `~/.stigmergy/skills`, project `.agent/skills`, `.claude/skills`

## Code Style Guidelines

### General
- Use ES2020+ features (ESM via CommonJS for compatibility)
- File encoding: UTF-8
- Indent: 2 spaces
- Quotes: Single quotes
- Semicolons: Always required

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

## Dependencies

### Core Dependencies
- **chalk** - Terminal styling
- **commander** - CLI framework
- **inquirer** - Interactive prompts
- **js-yaml** - YAML parsing
- **semver** - Semantic versioning
- **axios** - HTTP requests
- **playwright** - Browser automation (for Gateway)

### Node Version
- Requires Node.js >= 16.0.0

## Error Handling
- `src/core/error_handler.js` - Centralized error handling
- Custom error types with proper categorization
- Global error handlers set up in router-beta.js

## Interactive Mode
- `src/interactive/InteractiveModeController.js` - Interactive mode controller
- `src/cli/commands/interactive.js` - Interactive command handler
- Enables continuous conversation sessions with AI tools
- Features Project Status Board for cross-session collaboration

## Stigmergy Gateway

Remote CLI orchestration via chat platforms (Feishu, Telegram, Slack, Discord):

```bash
# Start Gateway with Feishu
stigmergy gateway --feishu --port 3000

# Start with Telegram
stigmergy gateway --telegram --port 3000

# Enable public tunnel
stigmergy gateway --feishu --tunnel

# Multi-platform mode
stigmergy gateway --feishu --telegram --slack --port 3000
```

**Gateway directory**: `src/gateway/`
- Platform adapters for each chat service
- Message parsing and routing
- Command execution and response handling

## Quality Standards

### Before Completing Any Task
1. Run gatekeeper check: `npm run gatekeeper`
2. Verify all claims with real execution
3. Explicitly state any limitations
4. Provide evidence for all conclusions
5. Never use simulation to claim real functionality

### Testing Requirements
- All new features must have tests
- Coverage thresholds must be met
- Tests must be repeatable and reliable
- Mock external services, test core logic

### Documentation Requirements
- Update CLAUDE.md for architectural changes
- Update README.md for user-facing changes
- Document API changes in relevant files
- Maintain AGENTS.md for AI agent guidelines

## Important Files

- **SOUL.md** - Soul evolution system principles and verification standards (READ THIS!)
- **AGENTS.md** - Guidelines for AI coding agents
- **CLAUDE.md** - This file - guidance for Claude Code
- **README.md** - User-facing documentation
- **CHANGELOG.md** - Version history

## Development Workflow

1. **Before starting**: Understand the soul evolution principles and verification standards
2. **During development**: Follow code style guidelines, write tests
3. **Before claiming completion**: Run gatekeeper check, verify with real execution
4. **After completion**: Update documentation, reflect on lessons learned

## Integrity Constraints

### Prohibited Behaviors
- ❌ Falsifying citations, data, or results
- ❌ Intentionally misleading users
- ❌ Concealing important information
- ❌ Exaggerating capabilities or results

### Required Behaviors
- ✅ Admit ignorance when uncertain
- ✅ Explicitly mark uncertain content
- ✅ Provide evidence for claims
- ✅ Immediately correct discovered errors

### Quality Standards
- **High confidence**: Only provide high-confidence information
- **Verifiability**: All claims must be verifiable
- **Reproducibility**: All experiments must be reproducible
- **Transparency**: Processes and decisions must be transparent

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
<name>advanced-test-skill</name>
<description></description>
<location>stigmergy</location>
</skill>

<skill>
<name>algorithmic-art</name>
<description>Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists&apos; work to avoid copyright violations.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>auto-memory</name>
<description></description>
<location>stigmergy</location>
</skill>

<skill>
<name>auto-task-skill</name>
<description>从 2 个经验教训中提取，实现 添加自动测试, 优化错误处理</description>
<location>stigmergy</location>
</skill>

<skill>
<name>brand-guidelines</name>
<description>Applies Anthropic&apos;s official brand colors and typography to any sort of artifact that may benefit from having Anthropic&apos;s look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>business-workflow</name>
<description></description>
<location>stigmergy</location>
</skill>

<skill>
<name>canvas-design</name>
<description>Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists&apos; work to avoid copyright violations.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>doc-coauthoring</name>
<description>Guide users through a structured workflow for co-authoring documentation. Use when user wants to write documentation, proposals, technical specs, decision docs, or similar structured content. This workflow helps users efficiently transfer context, refine content through iteration, and verify the doc works for readers. Trigger when user mentions writing docs, creating proposals, drafting specs, or similar documentation tasks.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>docx</name>
<description>Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. When Claude needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks</description>
<location>stigmergy</location>
</skill>

<skill>
<name>executing-plans</name>
<description>严格测试技能 - 用于验证CLI的真实激活机制</description>
<location>stigmergy</location>
</skill>

<skill>
<name>frontend-design</name>
<description>Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>internal-comms</name>
<description>A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill whenever asked to write some sort of internal communications (status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports, project updates, etc.).</description>
<location>stigmergy</location>
</skill>

<skill>
<name>mcp-builder</name>
<description>Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).</description>
<location>stigmergy</location>
</skill>

<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When Claude needs to fill in a PDF form or programmatically process, generate, or analyze PDF documents at scale.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>planning-with-files</name>
<description>Implements Manus-style file-based planning for complex tasks. Creates task_plan.md, findings.md, and progress.md. Use when starting complex multi-step tasks, research projects, or any task requiring &gt;5 tool calls.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>pptx</name>
<description>Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks</description>
<location>stigmergy</location>
</skill>

<skill>
<name>resumesession</name>
<description>Cross-CLI session recovery and history management skill</description>
<location>stigmergy</location>
</skill>

<skill>
<name>search-skill</name>
<description>Search and recommend Claude Code skills from trusted marketplaces</description>
<location>stigmergy</location>
</skill>

<skill>
<name>simple-crud</name>
<description></description>
<location>stigmergy</location>
</skill>

<skill>
<name>skill-creator</name>
<description>Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude&apos;s capabilities with specialized knowledge, workflows, or tool integrations.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>skill-from-github</name>
<description>Create skills by learning from high-quality GitHub projects</description>
<location>stigmergy</location>
</skill>

<skill>
<name>skill-from-masters</name>
<description>Help users create high-quality skills by discovering and incorporating proven methodologies from domain experts. Use this skill BEFORE skill-creator when users want to create a new skill - it enhances skill-creator by first identifying expert frameworks and best practices to incorporate. Triggers on requests like &quot;help me create a skill for X&quot; or &quot;I want to make a skill that does Y&quot;. This skill guides methodology selection, then hands off to skill-creator for the actual skill generation.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>slack-gif-creator</name>
<description>Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like &quot;make me a GIF of X doing Y for Slack.&quot;</description>
<location>stigmergy</location>
</skill>

<skill>
<name>strict-test-skill</name>
<description>严格测试技能 - 用于验证CLI的真实激活机制</description>
<location>stigmergy</location>
</skill>

<skill>
<name>systematic-debugging</name>
<description>严格测试技能 - 用于验证CLI的真实激活机制</description>
<location>stigmergy</location>
</skill>

<skill>
<name>template-skill</name>
<description>Replace with description of the skill and when Claude should use it.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>test-crud-skill</name>
<description></description>
<location>stigmergy</location>
</skill>

<skill>
<name>test-driven-development</name>
<description>严格测试技能 - 用于验证CLI的真实激活机制</description>
<location>stigmergy</location>
</skill>

<skill>
<name>test-skill-direct</name>
<description></description>
<location>stigmergy</location>
</skill>

<skill>
<name>theme-factory</name>
<description>Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>user-management</name>
<description></description>
<location>stigmergy</location>
</skill>

<skill>
<name>using-git-worktrees</name>
<description>严格测试技能 - 用于验证CLI的真实激活机制</description>
<location>stigmergy</location>
</skill>

<skill>
<name>web-artifacts-builder</name>
<description>Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>webapp-testing</name>
<description>Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>writing-plans</name>
<description>Implements Manus-style file-based planning for complex tasks. Creates task_plan.md, findings.md, and progress.md. Use when starting complex multi-step tasks, research projects, or any task requiring &gt;5 tool calls.</description>
<location>stigmergy</location>
</skill>

<skill>
<name>xlsx</name>
<description>Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization. When Claude needs to work with spreadsheets (.xlsx, .xlsm, .csv, .tsv, etc) for: (1) Creating new spreadsheets with formulas and formatting, (2) Reading or analyzing data, (3) Modify existing spreadsheets while preserving formulas, (4) Data analysis and visualization in spreadsheets, or (5) Recalculating formulas</description>
<location>stigmergy</location>
</skill>

<skill>
<name>ant</name>
<description>当用户需要执行行动者网络理论分析，包括参与者识别、关系网络构建、转译过程追踪和网络动态分析时使用此技能</description>
<location>universal</location>
</skill>

<skill>
<name>business-ecosystem-analysis</name>
<description>商业生态系统分析技能，整合多个子技能进行全面的商业生态系统分析</description>
<location>universal</location>
</skill>

<skill>
<name>conflict-resolution</name>
<description>当用户需要解决学术研究中的理论、方法论、解释、价值观等分歧，提供建设性对话和共识建立策略时使用此技能</description>
<location>universal</location>
</skill>

<skill>
<name>digital-transformation</name>
<description>数字化转型分析技能，整合多个子技能进行全面的数字化转型分析</description>
<location>universal</location>
</skill>

<skill>
<name>ecosystem-analysis</name>
<description>生态系统分析技能，整合多个子技能进行全面的生态系统分析</description>
<location>universal</location>
</skill>

<skill>
<name>field-analysis</name>
<description>执行布迪厄场域分析，包括场域边界识别、资本分布分析、自主性评估和习性模式分析。当需要分析社会场域的结构、权力关系和文化资本时使用此技能。</description>
<location>universal</location>
</skill>

<skill>
<name>field-expert</name>
<description>布迪厄场域理论专家分析技能，整合场域边界识别、资本分析、习性分析和场域动力学分析功能，基于渐进式信息披露原则支持宿主agent动态加载提示词模板。</description>
<location>universal</location>
</skill>

<skill>
<name>grounded-theory-expert</name>
<description>扎根理论专家分析技能，整合开放编码、轴心编码、选择式编码、备忘录撰写和理论饱和度检验功能，提供完整的扎根理论分析框架</description>
<location>universal</location>
</skill>

<skill>
<name>mathematical-statistics</name>
<description>当用户需要执行社会科学研究的数理统计分析，包括描述性统计、推断统计、回归分析、方差分析、因子分析等时使用此技能</description>
<location>universal</location>
</skill>

<skill>
<name>network-computation</name>
<description>社会网络计算分析工具，提供网络构建、中心性测量、社区检测、网络可视化等完整的网络分析支持</description>
<location>universal</location>
</skill>

<skill>
<name>system-engineering-task-decomposition</name>
<description>基于复杂任务分解和系统工程思维的技能，能够有效把复杂任务分解，并按照系统工程的思维管理多层次分解的子任务和系统集成。能够有效监控任务执行过程中的token消耗，确保任务分解后的复杂程度能够在128k上下文完成。</description>
<location>universal</location>
</skill>

<skill>
<name>test-skill</name>
<description>A simple test skill for verifying the skills system</description>
<location>universal</location>
</skill>

<skill>
<name>validity-reliability</name>
<description>当用户需要执行研究信度效度分析，包括内部一致性、重测信度、评分者信度、构念效度、内容效度、效标效度等全面分析时使用此技能</description>
<location>universal</location>
</skill>

<skill>
<name>auto-memory-claude</name>
<description>Advanced auto-memory skill for Claude CLI with JavaScript execution - Enables collaborative evolution and experience sharing across CLIs</description>
<location>claude</location>
</skill>

<skill>
<name>brainstorming</name>
<description>You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.</description>
<location>claude</location>
</skill>

<skill>
<name>dispatching-parallel-agents</name>
<description>Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies</description>
<location>claude</location>
</skill>

<skill>
<name>finishing-a-development-branch</name>
<description>Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup</description>
<location>claude</location>
</skill>

<skill>
<name>literature-search-zh</name>
<description>中文学术文献搜索技能 - 支持PubMed、CNKI、万方等中英文数据库，提供中文检索策略和文献管理</description>
<location>claude</location>
</skill>

<skill>
<name>playwright-visible-automation</name>
<description>Advanced visible browser automation using Playwright MCP tools with complete session inheritance and intelligent login detection. Enforces visible browser operation for debugging and transparency while preserving existing authentication states.</description>
<location>claude</location>
</skill>

<skill>
<name>receiving-code-review</name>
<description>Use when receiving code review feedback, before implementing suggestions, especially if feedback seems unclear or technically questionable - requires technical rigor and verification, not performative agreement or blind implementation</description>
<location>claude</location>
</skill>

<skill>
<name>requesting-code-review</name>
<description>Use when completing tasks, implementing major features, or before merging to verify work meets requirements</description>
<location>claude</location>
</skill>

<skill>
<name>scientific-writing-zh</name>
<description>中文学术论文写作技能 - IMRAD结构、中文学术规范、图表制作、引用格式，适用于中文学术期刊和论文撰写</description>
<location>claude</location>
</skill>

<skill>
<name>soul-co-evolve</name>
<description>协同进化 - 基于双Agent循环的多CLI协作学习</description>
<location>claude</location>
</skill>

<skill>
<name>soul-compete</name>
<description>竞争进化 - 基于双Agent循环的方案对比与最优选择</description>
<location>claude</location>
</skill>

<skill>
<name>soul-evolution</name>
<description>自主进化 - 基于双Agent循环的自我学习与进化</description>
<location>claude</location>
</skill>

<skill>
<name>soul-reflection</name>
<description>自我反思 - 基于双Agent循环的分析与学习提取</description>
<location>claude</location>
</skill>

<skill>
<name>subagent-driven-development</name>
<description>Use when executing implementation plans with independent tasks in the current session</description>
<location>claude</location>
</skill>

<skill>
<name>two-agent-loop</name>
<description>双Agent循环 - 所有进化的基础执行机制</description>
<location>claude</location>
</skill>

<skill>
<name>using-superpowers</name>
<description>Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions</description>
<location>claude</location>
</skill>

<skill>
<name>verification-before-completion</name>
<description>Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evidence before assertions always</description>
<location>claude</location>
</skill>

<skill>
<name>writing-skills</name>
<description>Use when creating new skills, editing existing skills, or verifying skills work before deployment</description>
<location>claude</location>
</skill>

</available_skills>

</skills_system>
<!-- SKILLS_END -->
