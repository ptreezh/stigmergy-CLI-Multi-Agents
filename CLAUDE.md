# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stigmergy CLI is a multi-agent cross-AI CLI tools collaboration system that enables seamless communication and intelligent task routing between different AI CLI tools (Claude, Gemini, Qwen, iFlow, QoderCLI, CodeBuddy, Copilot, Codex, Kode).

## Key Commands

### Development
```bash
# Start the CLI
npm start
# or
node src/index.js

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
npm run coverage:unit

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

# Run specific test layer
npm run test:layers
npm run test:layers-skip-e2e
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
- `src/core/cli_tools.js` - Defines all supported AI CLI tools with their installation commands, hooks directories, and OAuth configurations
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

## Dependencies

- **chalk** - Terminal styling
- **commander** - CLI framework
- **inquirer** - Interactive prompts
- **js-yaml** - YAML parsing
- **semver** - Semantic versioning

## Node Version
- Requires Node.js >= 16.0.0

## Error Handling
- `src/core/error_handler.js` - Centralized error handling
- Custom error types with proper categorization
- Global error handlers set up in router-beta.js

## Interactive Mode
- `src/interactive/InteractiveModeController.js` - Interactive mode controller
- `src/cli/commands/interactive.js` - Interactive command handler
- Enables continuous conversation sessions with AI tools


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
<description>当用户需要执行行动者网络理论分析，包括参与者识别、关系网络构建、转译过程追踪和网络动态分析时使用此技能</description>
<location>stigmergy</location>
</skill>

<skill>
<name>business-ecosystem-analysis</name>
<description>商业生态系统分析技能，整合多个子技能进行全面的商业生态系统分析</description>
<location>stigmergy</location>
</skill>

<skill>
<name>conflict-resolution</name>
<description>当用户需要解决学术研究中的理论、方法论、解释、价值观等分歧，提供建设性对话和共识建立策略时使用此技能</description>
<location>stigmergy</location>
</skill>

<skill>
<name>digital-transformation</name>
<description>数字化转型分析技能，整合多个子技能进行全面的数字化转型分析</description>
<location>stigmergy</location>
</skill>

<skill>
<name>ecosystem-analysis</name>
<description>生态系统分析技能，整合多个子技能进行全面的生态系统分析</description>
<location>stigmergy</location>
</skill>

<skill>
<name>field-analysis</name>
<description>执行布迪厄场域分析，包括场域边界识别、资本分布分析、自主性评估和习性模式分析。当需要分析社会场域的结构、权力关系和文化资本时使用此技能。</description>
<location>stigmergy</location>
</skill>

<skill>
<name>field-expert</name>
<description>布迪厄场域理论专家分析技能，整合场域边界识别、资本分析、习性分析和场域动力学分析功能，基于渐进式信息披露原则支持宿主agent动态加载提示词模板。</description>
<location>stigmergy</location>
</skill>

<skill>
<name>grounded-theory-expert</name>
<description>扎根理论专家分析技能，整合开放编码、轴心编码、选择式编码、备忘录撰写和理论饱和度检验功能，提供完整的扎根理论分析框架</description>
<location>stigmergy</location>
</skill>

<skill>
<name>mathematical-statistics</name>
<description>当用户需要执行社会科学研究的数理统计分析，包括描述性统计、推断统计、回归分析、方差分析、因子分析等时使用此技能</description>
<location>stigmergy</location>
</skill>

<skill>
<name>network-computation</name>
<description>社会网络计算分析工具，提供网络构建、中心性测量、社区检测、网络可视化等完整的网络分析支持</description>
<location>stigmergy</location>
</skill>

<skill>
<name>test-skill</name>
<description>A simple test skill for verifying the skills system</description>
<location>stigmergy</location>
</skill>

<skill>
<name>validity-reliability</name>
<description>当用户需要执行研究信度效度分析，包括内部一致性、重测信度、评分者信度、构念效度、内容效度、效标效度等全面分析时使用此技能</description>
<location>stigmergy</location>
</skill>

<skill>
<name>resumesession</name>
<description>Cross-CLI session recovery and history management skill</description>
<location>claude</location>
</skill>

<skill>
<name>dev-browser</name>
<description>Browser automation with persistent page state. Use when users ask to navigate websites, fill forms, take screenshots, extract web data, test web apps, or automate browser workflows. Trigger phrases include &quot;go to [url]&quot;, &quot;click on&quot;, &quot;fill out the form&quot;, &quot;take a screenshot&quot;, &quot;scrape&quot;, &quot;automate&quot;, &quot;test the website&quot;, &quot;log into&quot;, or any browser interaction request.</description>
<location>claude</location>
</skill>

</available_skills>

</skills_system>
<!-- SKILLS_END -->
