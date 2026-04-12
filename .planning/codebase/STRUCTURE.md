# Codebase Structure

**Analysis Date:** 2026-04-12

## Directory Layout

```
stigmergy-CLI-Multi-Agents/
├── src/                          # Main source code
│   ├── index.js                  # Main entry point
│   ├── utils.js                  # Utility functions
│   ├── auth.py                   # Authentication utilities
│   │
│   ├── adapters/                 # Platform-specific adapters
│   │   ├── cc-connect/           # IM gateway adapters
│   │   ├── claude/              # Claude CLI adapter
│   │   ├── gemini/              # Gemini CLI adapter
│   │   ├── qwen/                # Qwen CLI adapter
│   │   ├── iflow/               # iFlow CLI adapter
│   │   ├── codebuddy/           # CodeBuddy adapter
│   │   ├── codex/               # Codex adapter
│   │   ├── copilot/             # Copilot adapter
│   │   ├── qoder/               # Qoder CLI adapter
│   │   └── opencode/            # OpenCode adapter
│   │
│   ├── cli/                      # CLI command layer
│   │   ├── router-beta.js        # Modular command router
│   │   ├── commands/             # Command handlers (25+ files)
│   │   │   ├── install.js        # CLI installation
│   │   │   ├── status.js         # Status checking
│   │   │   ├── scan.js           # CLI scanning
│   │   │   ├── soul.js           # Soul evolution commands
│   │   │   ├── project.js        # Project setup/deploy
│   │   │   ├── interactive.js    # Interactive mode
│   │   │   ├── concurrent.js    # Multi-CLI execution
│   │   │   ├── opencli.js        # OpenCLI integration
│   │   │   ├── cc-config.js      # IM config management
│   │   │   └── ...
│   │   └── utils/                # CLI utilities
│   │
│   ├── core/                     # Core business logic
│   │   ├── cli_tools.js          # CLI configuration (10+ tools)
│   │   ├── cli_path_detector.js  # CLI path detection
│   │   ├── cli_adapters.js       # CLI argument normalization
│   │   ├── execution_mode_detector.js  # Interactive vs one-time
│   │   ├── smart_router.js       # Intent routing
│   │   ├── cli_help_analyzer.js  # Help text analysis
│   │   ├── error_handler.js      # Error handling
│   │   ├── installer.js          # CLI installer
│   │   ├── enhanced_cli_installer.js  # Enhanced installation
│   │   │
│   │   ├── soul_*.js            # Soul autonomous system
│   │   │   ├── soul_manager.js
│   │   │   ├── soul_knowledge_base.js
│   │   │   ├── soul_skill_evolver.js
│   │   │   ├── soul_memory_manager.js
│   │   │   ├── soul_alignment_checker.js
│   │   │   ├── soul_reflector.js
│   │   │   ├── soul_scheduler.js
│   │   │   └── soul_merger.js
│   │   │
│   │   ├── coordination/         # Multi-CLI coordination
│   │   │   ├── cross_cli_executor.js
│   │   │   ├── collaboration_coordinator.js
│   │   │   ├── intent_router.js
│   │   │   ├── cli_adapter_registry.js
│   │   │   └── nodejs/          # Node.js coordination tools
│   │   │
│   │   ├── hooks/                # Hook system
│   │   │   └── verification-gate.js
│   │   │
│   │   ├── skills/               # Skills system
│   │   │   ├── embedded-openskills/
│   │   │   └── skill_*.js
│   │   │
│   │   ├── scheduler/            # Task scheduling
│   │   ├── memory/               # Memory management
│   │   ├── evolution/            # Evolution system
│   │   ├── extraction/           # Data extraction
│   │   ├── config/               # Configuration
│   │   └── plugins/              # Plugin system
│   │
│   ├── orchestration/            # TypeScript orchestration layer
│   │   ├── core/
│   │   │   ├── CentralOrchestrator.ts
│   │   │   └── CentralOrchestrator-Realtime.ts
│   │   ├── managers/
│   │   │   ├── GitWorktreeManager.ts
│   │   │   ├── StateLockManager.ts
│   │   │   ├── TaskPlanningFiles.ts
│   │   │   ├── EnhancedTerminalManager.ts
│   │   │   └── ResultAggregator.ts
│   │   ├── events/
│   │   │   └── EventBus.ts
│   │   ├── hooks/
│   │   │   ├── HookSystem.ts
│   │   │   └── HookInstaller.ts
│   │   ├── integration/
│   │   │   └── ResumeSessionIntegration.ts
│   │   ├── config/
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │
│   ├── gateway/                   # IM gateway layer
│   │   ├── server.js            # Gateway server
│   │   ├── core/
│   │   │   ├── parser.js
│   │   │   ├── formatter.js
│   │   │   └── router.js
│   │   └── adapters/             # Platform adapters
│   │       └── slack.js
│   │
│   ├── commands/                 # Command handlers
│   │   ├── skill.js
│   │   ├── skills-hub.js
│   │   ├── skill-handler.js
│   │   ├── enhanced-skill-manager.js
│   │   └── skill-bridge.js
│   │
│   ├── interactive/              # Interactive mode
│   │   ├── InteractiveModeController.js
│   │   ├── FileLock.js
│   │   └── SharedContextManager.js
│   │
│   ├── tunnel/                   # Network tunneling
│   │   └── ngrok.js
│   │
│   ├── communication/            # Communication protocols
│   └── utils/                    # Utilities
│
├── bin/                          # Binary entry points
│   ├── stigmergy
│   └── stigmergy-gateway
│
├── dist/                         # Compiled TypeScript output
│   └── orchestration/
│       └── [compiled .js files]
│
├── scripts/                      # Build and utility scripts
│   ├── postinstall-deploy.js    # npm postinstall hook
│   ├── run-tests.js
│   └── verify-package-content.js
│
├── tests/                        # Test suite
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── regression/
│   ├── performance/
│   ├── automation/
│   └── functional/
│
├── config/                       # Configuration files
│   ├── builtin-skills.json
│   └── [other configs]
│
├── .agent/                       # Agent-specific skills (project-level)
│   └── skills/
│       ├── [skill-name]/
│       │   ├── agent.md
│       │   ├── SKILL.md
│       │   └── tests/
│
├── .planning/                    # Planning documentation
│   └── codebase/
│       ├── ARCHITECTURE.md
│       └── STRUCTURE.md
│
├── .gates/                       # Verification gates
│   ├── GATEKEEPER.md
│   ├── gatekeeper.js
│   └── gatekeeper-ci.js
│
├── .claude/                      # Claude Code configuration
│   ├── settings.json
│   ├── agents/
│   └── rules/
│
├── tsconfig.json                # TypeScript config
├── tsconfig.build.json          # Build-specific TypeScript config
├── package.json
├── README.md
├── SOUL.md                      # Soul system documentation
├── CLAUDE.md                    # Claude Code guidance
└── AGENTS.md                    # Agent guidelines
```

## Directory Purposes

### Source Code (src/)

**Purpose:** Main application code

**Contains:** All JavaScript, TypeScript, Python source files organized by functional area

**Key Subdirectories:**

#### `src/cli/`
- **Purpose:** Command-line interface layer
- **Contains:** Router, command handlers, utilities
- **Key files:**
  - `router-beta.js` - Main command routing (1020+ lines)
  - `commands/` - 25+ individual command handlers
  - `utils/` - CLI utilities (formatters, environment)

#### `src/core/`
- **Purpose:** Core business logic and services
- **Contains:** CLI tools, Soul system, coordination, skills
- **Key files:**
  - `cli_tools.js` - CLI configuration (10+ tools)
  - `soul_*.js` - Soul autonomous system (8 files)
  - `coordination/` - Multi-agent coordination
  - `skills/` - Skills system

#### `src/orchestration/`
- **Purpose:** Task orchestration and coordination (TypeScript)
- **Contains:** Central orchestrator, managers, events, hooks
- **Key files:**
  - `core/CentralOrchestrator.ts` - Task planning and execution
  - `managers/` - Git worktrees, state locks, planning files
  - `events/EventBus.ts` - Event system

#### `src/gateway/`
- **Purpose:** IM platform integration
- **Contains:** Gateway server, platform adapters, message handling
- **Key files:**
  - `server.js` - Multi-platform gateway
  - `adapters/` - Platform-specific implementations

#### `src/adapters/`
- **Purpose:** Platform-specific CLI adapters
- **Contains:** Adapters for 10+ CLI tools
- **Structure:** Each tool in separate directory with:
  - `install_*.js` - Installation script
  - `*_adapter.js` - Main adapter
  - `skills_*` - Skills integration
  - `config.json` - Tool configuration

### Configuration (config/)

**Purpose:** Application configuration

**Contains:**
- `builtin-skills.json` - Built-in skill definitions
- Other JSON configuration files

**Note:** User-specific config goes in `~/.stigmergy/`

### Tests (tests/)

**Purpose:** Comprehensive test suite

**Contains:**
- `unit/` - Unit tests for individual functions
- `integration/` - Component interaction tests
- `e2e/` - End-to-end workflow tests
- `regression/` - Regression test suite
- `performance/` - Performance benchmarks
- `automation/` - Automation tests
- `functional/` - Functional tests

### Project Skills (.agent/skills/)

**Purpose:** Project-level skill packages

**Contains:** Domain-specific skills created for this project

**Structure:**
```
.agent/skills/[skill-name]/
├── agent.md           # Agent configuration
├── SKILL.md          # Skill documentation
├── skill-manifest.json  # Skill metadata
├── CLI-PROVENANCE.md # CLI source tracking
├── tests/            # Skill-specific tests
└── [other resources]
```

### Planning (.planning/)

**Purpose:** Implementation planning and architecture documentation

**Contains:**
- `codebase/` - Codebase analysis documents
- `ARCHITECTURE.md` - System architecture
- `STRUCTURE.md` - Directory structure

### Gates (.gates/)

**Purpose:** Verification and quality gates

**Contains:**
- `GATEKEEPER.md` - Verification gate definition
- `gatekeeper.js` - Verification gate implementation
- `gatekeeper-ci.js` - CI-specific verification

---

## Key File Locations

### Entry Points

| Purpose | File Path |
|---------|-----------|
| CLI entry | `src/index.js` |
| Gateway entry | `bin/stigmergy-gateway` |
| Router | `src/cli/router-beta.js` |
| Command handlers | `src/cli/commands/*.js` |

### Core Services

| Purpose | File Path |
|---------|-----------|
| CLI tools config | `src/core/cli_tools.js` |
| CLI path detection | `src/core/cli_path_detector.js` |
| CLI adapters | `src/core/cli_adapters.js` |
| Smart routing | `src/core/smart_router.js` |
| Error handling | `src/core/error_handler.js` |

### Soul System

| Purpose | File Path |
|---------|-----------|
| Soul manager | `src/core/soul_manager.js` |
| Knowledge base | `src/core/soul_knowledge_base.js` |
| Skill evolver | `src/core/soul_skill_evolver.js` |
| Memory manager | `src/core/soul_memory_manager.js` |
| Alignment checker | `src/core/soul_alignment_checker.js` |

### Orchestration (TypeScript)

| Purpose | File Path |
|---------|-----------|
| Central orchestrator | `src/orchestration/core/CentralOrchestrator.ts` |
| Event bus | `src/orchestration/events/EventBus.ts` |
| Git worktree manager | `src/orchestration/managers/GitWorktreeManager.ts` |
| State lock manager | `src/orchestration/managers/StateLockManager.ts` |
| Task planning files | `src/orchestration/managers/TaskPlanningFiles.ts` |
| Hook system | `src/orchestration/hooks/HookSystem.ts` |

### Configuration

| Purpose | File Path |
|---------|-----------|
| TypeScript config | `tsconfig.json` |
| TypeScript build config | `tsconfig.build.json` |
| Global config | `~/.stigmergy/config.json` |
| Project config | `.stigmergy/config.json` |
| Built-in skills | `config/builtin-skills.json` |

### Testing

| Purpose | File Path |
|---------|-----------|
| Test runner | `scripts/run-tests.js` |
| Unit tests | `tests/unit/**/*.test.js` |
| Integration tests | `tests/integration/**/*.test.js` |
| E2E tests | `tests/e2e/**/*.test.js` |

---

## Naming Conventions

### Files

**JavaScript/Node:**
- **Commands:** kebab-case (e.g., `soul.js`, `install.js`)
- **Classes:** PascalCase (e.g., `SoulManager.js`, `CLIAdapter.js`)
- **Utilities:** kebab-case (e.g., `formatters.js`, `helpers.js`)

**TypeScript:**
- **Classes:** PascalCase (e.g., `CentralOrchestrator.ts`, `EventBus.ts`)
- **Interfaces:** PascalCase (e.g., `TaskType`, `CLIConfig`)
- **Types:** PascalCase (e.g., `ExecutionStrategy`, `EventType`)

**Directories:**
- **Functional areas:** kebab-case (e.g., `cli/`, `core/`, `orchestration/`)
- **Platform adapters:** lowercase (e.g., `claude/`, `gemini/`, `qwen/`)

**Config files:**
- **JSON:** camelCase (e.g., `builtin-skills.json`)
- **Markdown:** UPPER-CASE for docs (e.g., `SOUL.md`, `CLAUDE.md`)
- **TypeScript:** camelCase (e.g., `tsconfig.json`)

### Classes and Functions

**Classes:**
- PascalCase (e.g., `SoulManager`, `CLIAdapter`, `CentralOrchestrator`)

**Methods:**
- camelCase (e.g., `detectSoul()`, `loadSoul()`, `evolve()`)

**Private methods:**
- Prefix with `_` (e.g., `_findSoulFile()`, `_parseSoulContent()`)

**Functions:**
- camelCase (e.g., `handleInstallCommand()`, `getCLIPath()`)

**Constants:**
- UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `CLI_TOOLS`)

**TypeScript interfaces:**
- PascalCase (e.g., `CLIConfig`, `Task`, `ExecutionResult`)

### Variables

**Instance variables:**
- camelCase (e.g., `this.soulPath`, `this.knowledgeBase`)

**Local variables:**
- camelCase (e.g., `const identity = ...`)

**Options objects:**
- camelCase (e.g., `{ cliName, skillsPath, autoLearn }`)

---

## Where to Add New Code

### New CLI Command

**Primary location:** `src/cli/commands/[command-name].js`

**Steps:**
1. Create command handler file in `src/cli/commands/`
2. Export handler function
3. Register command in `src/cli/router-beta.js`
4. Add tests in `tests/unit/` or `tests/integration/`

**Template:**
```javascript
async function handleCommand(options) {
  // Implementation
}

module.exports = { handleCommand };
```

**Registration:**
```javascript
// In router-beta.js
const { handleCommand } = require("./commands/command-name");

program
  .command("command")
  .description("Description")
  .action(async (options) => {
    await handleCommand(options);
  });
```

---

### New CLI Tool Adapter

**Primary location:** `src/adapters/[tool-name]/`

**Files to create:**
```
src/adapters/[tool-name]/
├── install_[tool]_integration.js  # Installation script
├── standalone_[tool]_adapter.js    # Standalone adapter
├── skills_[tool]_adapter.js      # Skills integration
├── [tool]_adapter.js             # Main adapter (optional)
└── config.json                   # Tool configuration
```

**Configuration in `src/core/cli_tools.js`:**
```javascript
const CLI_TOOLS = {
  // ... existing tools ...
  [tool]: {
    name: "[Tool] CLI",
    version: "[tool] --version",
    install: "npm install -g @[org]/[tool]",
    hooksDir: path.join(os.homedir(), ".[tool]", "hooks"),
    autoInstall: true,
    skills: { dir: "skills", format: "skill-md" }
  }
};
```

---

### New Soul System Component

**Primary location:** `src/core/`

**Files to create:**
- `src/core/soul_[component].js` - Main component
- Tests in `tests/unit/`

**Integration:**
```javascript
// In soul_manager.js
const SoulComponent = require("./soul_[component]");

// In initAutonomousSystem():
this.component = new SoulComponent({
  soulIdentity: this.identity,
  skillsPath: this.skillsPath,
  knowledgeBase: this.knowledgeBase
});
```

---

### New Orchestration Manager

**Primary location:** `src/orchestration/managers/`

**Files to create:**
- `src/orchestration/managers/[ManagerName].ts`
- Tests in `src/orchestration/managers/__tests__/`

**Template:**
```typescript
export class ManagerName {
  constructor(options: {
    // dependencies
  }) {}

  async initialize(): Promise<void> {}
  
  // Manager methods...
}
```

**TypeScript Build:**
- Ensure included in `tsconfig.build.json` patterns
- Run `npm run build:orchestration` to compile

---

### New Event Type

**Primary location:** `src/orchestration/`

**Files to update:**
- `src/orchestration/types/index.ts` - Add event type
- `src/orchestration/events/EventBus.ts` - Add event handler
- Consumer files - Subscribe to event

**Definition:**
```typescript
// In types/index.ts
export type EventType = 
  | 'task.created'
  | 'task.completed'
  | // ... existing types ...
  | 'custom.event';
```

**Publishing:**
```typescript
await eventBus.publish({
  type: 'custom.event',
  data: { /* event data */ },
  timestamp: new Date()
});
```

**Subscribing:**
```typescript
eventBus.subscribe('custom.event', async (event) => {
  // Handle event
});
```

---

### New Skill Package

**Primary location:** `.agent/skills/[skill-name]/`

**Files to create:**
```
.agent/skills/[skill-name]/
├── agent.md               # Agent configuration
├── SKILL.md              # Main skill documentation
├── skill-manifest.json   # Identity and dependencies
├── CLI-PROVENANCE.md    # CLI source tracking
├── tests/               # Skill-specific tests
└── [resources]          # Additional resources
```

**Skill manifest:**
```json
{
  "name": "[skill-name]",
  "version": "1.0.0",
  "description": "...",
  "capabilities": ["..."],
  "dependencies": ["..."],
  "cli_provenance": {
    "primary": "claude",
    "fallback": ["gemini"]
  }
}
```

---

### New Gateway Adapter

**Primary location:** `src/gateway/adapters/`

**Files to create:**
- `src/gateway/adapters/[platform].js`

**Implementation:**
```javascript
class PlatformAdapter {
  constructor(config) {
    this.platform = 'platform';
  }

  async parseMessage(raw) {
    // Parse platform-specific message format
  }

  async formatResponse(response) {
    // Format for platform
  }

  async send(payload) {
    // Send to platform
  }
}

module.exports = PlatformAdapter;
```

**Registration in `src/gateway/server.js`:**
```javascript
const PlatformAdapter = require('./adapters/platform');
const server = new GatewayServer({
  platforms: { platform: { enabled: true, adapter: PlatformAdapter } }
});
```

---

### New CLI Hook

**Primary location:** `src/orchestration/hooks/`

**Files to create:**
- `src/orchestration/hooks/[HookName].ts`

**Hook types:**
- **Pre-execution:** task-detection, lock-acquisition
- **Post-execution:** lock-release
- **Conflict:** conflict-detection

**Implementation:**
```typescript
export async function hookName(context: HookContext): Promise<HookResult> {
  // Hook logic
  return { matched: true, success: true };
}
```

**Installation:**
```typescript
const hookSystem = new HookSystem();
await hookSystem.installCoordinationHooks(cliName, hooksDir);
```

---

## Special Directories

### `src/orchestration/` (TypeScript)

- **Purpose:** TypeScript orchestration layer
- **Generated:** Compiled to `dist/orchestration/` by `npm run build:orchestration`
- **Committed:** Yes, both source (`.ts`) and compiled (`.js`)
- **Build command:** `npm run build:orchestration`

### `src/adapters/`

- **Purpose:** Platform-specific CLI adapters
- **Generated:** No
- **Committed:** Yes
- **Pattern:** Each tool gets own directory with `install_*.js` and adapter files

### `.agent/skills/`

- **Purpose:** Project-level skill packages
- **Generated:** No
- **Committed:** Yes
- **Priority:** Higher than global skills in `~/.stigmergy/skills`

### `.planning/codebase/`

- **Purpose:** Codebase analysis documentation
- **Generated:** Yes (by this analysis)
- **Committed:** Yes
- **Contains:** ARCHITECTURE.md, STRUCTURE.md, STACK.md, etc.

### `.gates/`

- **Purpose:** Verification and quality gates
- **Generated:** No
- **Committed:** Yes
- **Tools:** gatekeeper.js, gatekeeper-ci.js

### `dist/orchestration/`

- **Purpose:** Compiled TypeScript output
- **Generated:** Yes (by TypeScript compiler)
- **Committed:** Yes (in package.json files)
- **Build command:** `npm run build:orchestration`

---

*Structure analysis: 2026-04-12*
