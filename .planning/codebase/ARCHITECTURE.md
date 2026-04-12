# Architecture

**Analysis Date:** 2026-04-12

## Pattern Overview

**Overall:** Modular Layered Architecture with Event-Driven Coordination

The Stigmergy system follows a **modular layered architecture** with event-driven coordination for cross-CLI collaboration. The design separates concerns across five distinct layers: CLI Platform, Core Services, Orchestration, Gateway, and Skills.

**Key Characteristics:**
- **CLI-Centric Abstraction**: All AI tools (Claude, Gemini, Qwen, iFlow, etc.) are normalized through adapters
- **Soul-Driven Identity**: Each CLI deployment has an autonomous identity system for self-evolution
- **Event-Sourced Coordination**: Tasks and state changes flow through an event bus
- **Skill Composition**: Domain skills are composable units that can be orchestrated together
- **Verification Gates**: Strict completion validation before claiming features are done

## Layers

### Layer 1: CLI Platform Layer (Entry Point)

**Entry Points:**
- `src/index.js` - Main entry point delegating to router-beta.js
- `src/cli/router-beta.js` - Modular command router (1020+ lines)

**CLI Tools Registry:**
- `src/core/cli_tools.js` - Defines 10+ CLI tools (claude, gemini, qwen, iflow, codebuddy, codex, qodercli, copilot, opencode, kode)

**Command Handlers:**
- `src/cli/commands/` - 25+ command files including:
  - `install.js` - CLI installation
  - `status.js` - Status checking
  - `scan.js` - CLI detection
  - `soul.js` - Soul evolution commands
  - `project.js` - Project setup/deploy
  - `interactive.js` - Interactive mode
  - `concurrent.js` - Multi-CLI execution

**Purpose:** User interface and CLI invocation routing

**Contains:** Command parsing, user interaction, CLI proxy delegation

**Depends on:** Core services layer

**Used by:** End users, CI/CD pipelines

---

### Layer 2: Core Services Layer

**Components:**

**CLI Abstraction:**
- `src/core/cli_tools.js` - CLI configuration, install commands, OAuth settings
- `src/core/cli_path_detector.js` - Detect and cache CLI executable paths
- `src/core/cli_adapters.js` - Normalize interactive vs one-time mode flags
- `src/core/execution_mode_detector.js` - Detect execution modes

**Smart Routing:**
- `src/core/smart_router.js` - Intent analysis and CLI selection
- `src/core/cli_help_analyzer.js` - Analyze CLI help text for patterns
- `src/core/cli_parameter_handler.js` - Intelligent argument generation

**Soul System:**
- `src/core/soul_manager.js` - Soul lifecycle management (identity, initialization)
- `src/core/soul_knowledge_base.js` - Knowledge storage and semantic search
- `src/core/soul_skill_evolver.js` - Skill discovery and creation
- `src/core/soul_memory_manager.js` - Dual-memory (Markdown + SQLite-vec)
- `src/core/soul_alignment_checker.js` - Mission alignment verification
- `src/core/soul_reflector.js` - Self-criticism and error analysis
- `src/core/soul_scheduler.js` - Evolution scheduling

**Coordination:**
- `src/core/coordination/` - Multi-CLI collaboration:
  - `cross_cli_executor.js` - Execute across CLIs
  - `collaboration_coordinator.js` - Multi-CLI coordination
  - `intent_router.js` - Route intents to handlers
  - `cli_adapter_registry.js` - CLI adapter registration

**Purpose:** Core business logic, CLI abstraction, Soul autonomous system

**Location:** `src/core/`

**Contains:** All core services and business logic

**Depends on:** Utilities layer

**Used by:** CLI layer, Orchestration layer

---

### Layer 3: Orchestration Layer (TypeScript)

**Purpose:** Task planning, coordination, and result aggregation

**Location:** `src/orchestration/`

**Core Components:**

**Central Orchestration:**
- `src/orchestration/core/CentralOrchestrator.ts` - Task planning and multi-CLI execution
- `src/orchestration/core/CentralOrchestrator-Realtime.ts` - Real-time execution variant

**Managers:**
- `src/orchestration/managers/GitWorktreeManager.ts` - Git worktree management for parallel tasks
- `src/orchestration/managers/StateLockManager.ts` - Distributed state locking
- `src/orchestration/managers/TaskPlanningFiles.ts` - Planning file management (task_plan.md, findings.md)
- `src/orchestration/managers/EnhancedTerminalManager.ts` - Terminal session management
- `src/orchestration/managers/ResultAggregator.ts` - Multi-CLI result aggregation

**Events:**
- `src/orchestration/events/EventBus.ts` - Event publication and subscription
- Event types: task.created, task.completed, task.failed, worktree.created, conflict.detected

**Hooks:**
- `src/orchestration/hooks/HookSystem.ts` - Coordination hook installation
- `src/orchestration/hooks/HookInstaller.ts` - Hook deployment to CLI tools

**Integration:**
- `src/orchestration/integration/ResumeSessionIntegration.ts` - Cross-CLI session recovery

**Configuration:**
- `src/orchestration/config/index.ts` - Orchestration configuration
- `src/orchestration/types/index.ts` - TypeScript type definitions

**TypeScript Build:**
- `tsconfig.json` - General TypeScript config
- `tsconfig.build.json` - Build only orchestration layer to `dist/orchestration/`

**Contains:** TypeScript orchestration logic, task coordination

**Used by:** CLI commands (concurrent, project)

---

### Layer 4: Gateway Layer (IM Integration)

**Purpose:** Unified messaging gateway across multiple IM platforms

**Location:** `src/gateway/`

**Components:**
- `src/gateway/server.js` - Multi-platform gateway server
- `src/gateway/core/parser.js` - Message parsing
- `src/gateway/core/formatter.js` - Response formatting
- `src/gateway/core/router.js` - Message routing
- `src/gateway/adapters/` - Platform-specific adapters (slack, etc.)

**IM Infrastructure:**
- `src/adapters/cc-connect/` - cc-connect IM gateway integration
- Supports: feishu, Telegram, dingtalk, Slack, Discord, LINE, WeChat, QQ

**Contains:** IM platform adapters, message parsing, response handling

**Used by:** Gateway command, scheduler

---

### Layer 5: Skills System

**Purpose:** Extensible skill packages for domain expertise

**Location:** `src/commands/`, `src/core/skills/`, `.agent/skills/`

**Components:**
- `src/commands/skill.js` - Skill command handler
- `src/commands/skills-hub.js` - Centralized meta-skill management
- `src/commands/skill-handler.js` - Skill execution
- `src/core/skills/` - Embedded OpenSkills core:
  - `embedded-openskills/` - OpenSkills implementation
  - Skill installation, parsing, reading, validation

**Skill Format:**
- `SKILL.md` - Skill main documentation
- `skill-manifest.json` - Identity and dependency declaration
- Skills stored in: `~/.stigmergy/skills`, `.agent/skills`, `.claude/skills`

**Contains:** Skill loading, execution, discovery, orchestration

**Used by:** All CLI tools via hooks

---

## Data Flow

### CLI Execution Flow

```
User Input (CLI command)
    ↓
src/index.js (entry point)
    ↓
src/cli/router-beta.js (command parsing)
    ↓
Command Handler (install.js, status.js, etc.)
    ↓
Core Services:
  - Soul System (identity check)
  - CLI Path Detector (find executable)
  - CLI Adapter (normalize arguments)
    ↓
Execute CLI with normalized args
    ↓
Capture output, handle errors
    ↓
Return to user
```

### Soul Evolution Flow

```
Soul Command (stigmergy soul evolve)
    ↓
src/cli/commands/soul.js
    ↓
src/core/soul_manager.js
    ↓
SoulSkillEvolver.evolve()
    ├→ Fetch authoritative sources
    ├→ Extract knowledge
    ├→ Create/update skills
    └→ Update knowledge base
    ↓
SoulAlignmentChecker (verify mission alignment)
    ↓
Update Soul state
    ↓
Emit events (task.created, skill.updated)
    ↓
Persist to skills/knowledge/evolution/
```

### Multi-CLI Coordination Flow

```
Concurrent Command (stigmergy concurrent)
    ↓
src/cli/commands/concurrent.js
    ↓
src/orchestration/core/CentralOrchestrator.ts
    ├→ CLI Selection (based on capabilities)
    ├→ Task Decomposition
    └→ Execution Strategy (parallel/sequential)
    ↓
GitWorktreeManager (create worktrees)
    ↓
StateLockManager (coordinate access)
    ↓
Execute on multiple CLIs in parallel
    ↓
EventBus (emit task.completed)
    ↓
ResultAggregator (merge results)
    ↓
Return aggregated output
```

## Key Abstractions

### Soul System

**Purpose:** Autonomous agent identity and self-evolution

**Files:**
- `src/core/soul_manager.js` - Soul lifecycle management
- `src/core/soul_knowledge_base.js` - Knowledge storage (Markdown + SQLite-vec)
- `src/core/soul_skill_evolver.js` - Skill discovery and creation
- `src/core/soul_memory_manager.js` - Dual-memory system
- `src/core/soul_alignment_checker.js` - Mission alignment verification
- `src/core/soul_reflector.js` - Self-criticism and error analysis
- `src/core/soul_scheduler.js` - Evolution scheduling

**Pattern:**
```javascript
// Soul initialization
const soulManager = new SoulManager({
  cliName: "claude",
  skillsPath: "./.stigmergy/skills"
});
await soulManager.detectSoul(skillsPath);
await soulManager.loadSoul();
await soulManager.initAutonomousSystem();

// Evolution cycle
const result = await soulManager.evolve("frontend");
const alignment = await soulManager.checkAlignment(output);
```

**State:**
- Identity: name, role, personality, mission, vision, expertise
- Knowledge base: entries with keywords, tags, expertise classification
- Evolution history: sources, created skills, errors

---

### Smart Router

**Purpose:** Intent analysis and optimal CLI selection

**File:** `src/core/smart_router.js`

**Pattern:**
```javascript
const SmartRouter = require("../core/smart_router");
const router = new SmartRouter();

// Route user input
const result = await router.route(input, {
  availableCLIs: ["claude", "gemini", "qwen"],
  preferCLIs: ["claude"],
  requireCapabilities: ["code"]
});
// Returns: { cli: "claude", confidence: 0.85, reason: "..." }
```

**Capabilities Mapping:**
- claude: analysis, documentation, reasoning, complex
- gemini: multilingual, creative, writing, design
- qwen: chinese, code, analysis
- codebuddy: completion, refactoring, optimization

---

### CLI Adapters

**Purpose:** Normalize different CLI interfaces into common patterns

**Files:**
- `src/core/cli_adapters.js` - CLI argument normalization
- `src/core/execution_mode_detector.js` - Interactive vs one-time detection

**Pattern:**
```javascript
const { CLIAdapterManager } = require("../core/cli_adapters");
const adapter = new CLIAdapterManager();

// Get normalized arguments for tool and mode
const args = adapter.getArguments("claude", "one-time", "write a function");
```

---

### Event Bus

**Purpose:** Decouple components through events

**File:** `src/orchestration/events/EventBus.ts`

**Pattern:**
```typescript
const eventBus = new EventBus();

// Subscribe to events
eventBus.subscribe('task.completed', async (event) => {
  await recordFinding(event);
});

// Publish events
await eventBus.publish({
  type: 'task.completed',
  data: { taskId, result },
  timestamp: new Date()
});
```

**Event Types:**
- task.created, task.completed, task.failed
- worktree.created, worktree.merged
- conflict.detected
- error.occurred

---

### Skill Orchestration

**Purpose:** Compose multiple skills into workflows

**File:** `src/core/skill_orchestrator.js`

**Pattern:**
```javascript
const SkillOrchestrator = require("../core/skill_orchestrator");
const orchestrator = new SkillOrchestrator({ skillsPath });

// Execute skill chain
const result = await orchestrator.executeChain([
  { skill: "code-review", input: code },
  { skill: "security-check", input: result.output }
]);
```

---

### Coordination Hooks

**Purpose:** Coordinate multi-agent access to shared files

**File:** `src/orchestration/hooks/HookSystem.ts`

**Hook Types:**
- task-detection: Detect and match tasks
- lock-acquisition: Acquire file locks
- lock-release: Release file locks
- conflict-detection: Detect git conflicts

**Deployed to:** Each CLI's hooks directory

---

## Entry Points

### CLI Entry Point

**File:** `src/index.js`
**Purpose:** Main entry point for stigmergy CLI
**Triggers:** `stigmergy <command>`
**Responsibilities:** Import router, set up error handlers, delegate to router

### Gateway Entry Point

**File:** `bin/stigmergy-gateway`
**Purpose:** IM gateway server
**Triggers:** `stigmergy-gateway` or `stigmergy gateway`
**Responsibilities:** Start multi-platform IM server

### Hook Entry Point

**Files:** Hooks deployed to `~/.claude/hooks/`, `~/.gemini/extensions/`, etc.
**Purpose:** Intercept CLI execution for coordination
**Triggers:** Before/after CLI commands

### Postinstall Entry

**File:** `scripts/postinstall-deploy.js`
**Purpose:** npm postinstall hook
**Triggers:** `npm install -g stigmergy`
**Responsibilities:** Auto-deploy hooks and initialize

---

## Error Handling

**Strategy:** Layered error handling with graceful degradation

**Components:**
- `src/core/error_handler.js` - Centralized error handling
- `src/core/coordination/error_handler.js` - Coordination-specific errors
- `src/cli/commands/errors.js` - Error reporting command

**Patterns:**
```javascript
// Try-catch at every async boundary
try {
  const result = await executeCLI(cli, args);
  return result;
} catch (error) {
  // Log with context
  logger.error('CLI execution failed', { cli, args, error });
  // Emit event
  eventBus.publish({ type: 'error.occurred', data: { error } });
  // Graceful degradation
  return { success: false, error: error.message };
}
```

**Verification Gate:**
- `src/core/hooks/verification-gate.js` - Intercepts console.log to enforce completion claims
- Validates: Level 0-4 completion, historical error patterns, limitation disclosure

---

## Cross-Cutting Concerns

**Logging:**
- `src/core/coordination/logger.js` - Centralized logging
- Logs to: `~/.stigmergy/logs/`
- Structured logging with correlation IDs

**Validation:**
- Input validation at all entry points (commands, gateway messages)
- Schema validation using native JSON validation

**Authentication:**
- OAuth handling in cli_adapters.js
- IM platform credentials in cc-connect
- API tokens in environment variables (NEVER hardcoded)

**Security:**
- Secrets in environment variables only
- Verification gate to prevent false completion claims
- Permission checks on file operations

**Configuration:**
- Global config: `~/.stigmergy/config.json`
- Project config: `.stigmergy/config.json`
- Environment-specific: `.env` (NEVER committed)

---

## Soul Evolution System

**Architecture:**
```
+------------------------------------------------------------+
|                    Soul Manager                              |
|  +-------------+  +-------------+  +---------------+        |
|  | Soul Knowledge| | Skill Evolver | | Alignment     |        |
|  | Base         |  |              |  | Checker       |        |
|  |              |  |              |  |               |        |
|  | - Markdown   |  | - Web search |  | - Mission     |        |
|  | - SQLite-vec |  | - GitHub     |  |   alignment   |        |
|  | - Semantic   |  | - Skill      |  | - Output      |        |
|  |   search     |  |   creation   |  |   validation  |        |
|  +-------------+  +-------------+  +---------------+        |
|                                                            |
|  +-------------+  +-------------+  +---------------+        |
|  | Memory      |  | Skill       |  | Scheduler     |        |
|  | Manager     |  | Orchestrator|  |               |        |
|  |             |  |             |  |               |        |
|  | - Session   |  | - Skill     |  | - Evolution   |        |
|  | - Reflection|  |   chains    |  |   timing      |        |
|  | - Instincts |  | - Workflows |  | - Batch ops   |        |
|  +-------------+  +-------------+  +---------------+        |
+------------------------------------------------------------+
```

**Evolution Cycle:**
1. **Intent Analysis**: Determine evolution direction
2. **Source Collection**: Fetch authoritative sources (GitHub, web)
3. **Knowledge Extraction**: Parse and index new information
4. **Skill Creation**: Generate or update skill packages
5. **Alignment Check**: Verify mission alignment
6. **State Update**: Persist to knowledge base
7. **Skill Registration**: Make skills available to CLI tools

**Memory System:**
- **Short-term**: Session memory (Markdown)
- **Long-term**: SQLite-vec vector database
- **Instincts**: Low-level behavioral patterns

**Quality Gates:**
- Verification gate intercepts completion claims
- Level 0-4 completion validation
- Honest limitation disclosure

---

*Architecture analysis: 2026-04-12*
