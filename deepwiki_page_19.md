# /obra/superpowers/5-platform-specific-features

Platform-Specific Features | obra/superpowers | DeepWiki

Loading...

Index your code with Devin

[DeepWiki](.md)

[DeepWiki](.md)

[obra/superpowers](https://github.com/obra/superpowers "Open repository")

Index your code with

Devin

Edit WikiShare

Loading...

Last indexed: 24 January 2026 ([a01a13](https://github.com/obra/superpowers/commits/a01a135f))

- [Overview](obra/superpowers/1-overview.md)
- [Getting Started](obra/superpowers/2-getting-started.md)
- [Installing on Claude Code](obra/superpowers/2.1-installing-on-claude-code.md)
- [Installing on OpenCode](obra/superpowers/2.2-installing-on-opencode.md)
- [Installing on Codex](obra/superpowers/2.3-installing-on-codex.md)
- [Core Concepts](obra/superpowers/3-core-concepts.md)
- [What Are Skills](obra/superpowers/3.1-what-are-skills.md)
- [The Rule: Mandatory First Response Protocol](obra/superpowers/3.2-the-rule:-mandatory-first-response-protocol.md)
- [Finding and Invoking Skills](obra/superpowers/3.3-finding-and-invoking-skills.md)
- [Architecture](obra/superpowers/4-architecture.md)
- [Dual Repository Design](obra/superpowers/4.1-dual-repository-design.md)
- [Skills Repository Management](obra/superpowers/4.2-skills-repository-management.md)
- [Multi-Platform Integration](obra/superpowers/4.3-multi-platform-integration.md)
- [Session Lifecycle and Bootstrap](obra/superpowers/4.4-session-lifecycle-and-bootstrap.md)
- [Skills Resolution and Priority](obra/superpowers/4.5-skills-resolution-and-priority.md)
- [Platform-Specific Features](obra/superpowers/5-platform-specific-features.md)
- [Claude Code: Skill Tool and Hooks](obra/superpowers/5.1-claude-code:-skill-tool-and-hooks.md)
- [OpenCode: Plugin and Custom Tools](obra/superpowers/5.2-opencode:-plugin-and-custom-tools.md)
- [Codex: CLI Tool](obra/superpowers/5.3-codex:-cli-tool.md)
- [skills-core.js Shared Module](obra/superpowers/5.4-skills-core.js-shared-module.md)
- [Development Workflows](obra/superpowers/6-development-workflows.md)
- [Brainstorming and Design](obra/superpowers/6.1-brainstorming-and-design.md)
- [Using Git Worktrees](obra/superpowers/6.2-using-git-worktrees.md)
- [Writing Implementation Plans](obra/superpowers/6.3-writing-implementation-plans.md)
- [Subagent-Driven Development](obra/superpowers/6.4-subagent-driven-development.md)
- [Executing Plans in Batches](obra/superpowers/6.5-executing-plans-in-batches.md)
- [Code Review Process](obra/superpowers/6.6-code-review-process.md)
- [Finishing Development Branches](obra/superpowers/6.7-finishing-development-branches.md)
- [Key Skills Reference](obra/superpowers/7-key-skills-reference.md)
- [using-superpowers (Meta-Skill)](obra/superpowers/7.1-using-superpowers-\(meta-skill\).md)
- [Test-Driven Development](obra/superpowers/7.2-test-driven-development.md)
- [Systematic Debugging](obra/superpowers/7.3-systematic-debugging.md)
- [Other Essential Skills](obra/superpowers/7.4-other-essential-skills.md)
- [Creating Skills](obra/superpowers/8-creating-skills.md)
- [Writing Skills with TDD](obra/superpowers/8.1-writing-skills-with-tdd.md)
- [Skill Structure and SKILL.md Format](obra/superpowers/8.2-skill-structure-and-skill.md-format.md)
- [Testing Skills with Pressure Scenarios](obra/superpowers/8.3-testing-skills-with-pressure-scenarios.md)
- [Claude Search Optimization (CSO)](obra/superpowers/8.4-claude-search-optimization-\(cso\).md)
- [Contributing Skills via Pull Request](obra/superpowers/8.5-contributing-skills-via-pull-request.md)
- [Testing Infrastructure](obra/superpowers/9-testing-infrastructure.md)
- [Test Suite Architecture](obra/superpowers/9.1-test-suite-architecture.md)
- [Integration Test Cases](obra/superpowers/9.2-integration-test-cases.md)
- [Token Usage Analysis](obra/superpowers/9.3-token-usage-analysis.md)
- [Testing Tools and Helpers](obra/superpowers/9.4-testing-tools-and-helpers.md)
- [Technical Reference](obra/superpowers/10-technical-reference.md)
- [Directory Structure](obra/superpowers/10.1-directory-structure.md)
- [Configuration Files](obra/superpowers/10.2-configuration-files.md)
- [Environment Variables](obra/superpowers/10.3-environment-variables.md)
- [Polyglot Wrapper Pattern](obra/superpowers/10.4-polyglot-wrapper-pattern.md)
- [Release Notes Archive](obra/superpowers/10.5-release-notes-archive.md)

Menu

# Platform-Specific Features

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)

This page documents the unique integration details for each AI platform that supports Superpowers. Each platform provides different mechanisms for skill invocation, session initialization, and context management, but all platforms share the same skills repository and core skill discovery logic.

For architectural context on the dual repository design, see [Architecture](obra/superpowers/4-architecture.md). For the shared skills library structure, see [Core Concepts](obra/superpowers/3-core-concepts.md).

## Overview

Superpowers integrates with three AI platforms through distinct technical approaches:

| Platform        | Integration Type   | Skill Invocation                       | Bootstrap Method            |
| --------------- | ------------------ | -------------------------------------- | --------------------------- |
| **Claude Code** | Native Plugin      | `Skill` tool (built-in)                | Automatic via session hooks |
| **OpenCode.ai** | JavaScript Plugin  | Custom `use_skill`/`find_skills` tools | Event-driven injection      |
| **Codex**       | Node.js CLI Script | `superpowers-codex` commands           | Manual via `AGENTS.md`      |

**Platform maturity:**

- **Claude Code** (v4.0.3): Most mature integration with native tool support, agent delegation, and slash commands
- **OpenCode** (v3.5.0+): Native plugin with custom tools and context persistence across compaction
- **Codex** (v3.3.0+): Experimental CLI-based integration with tool substitution patterns

All three platforms share:

- Skills repository at `~/.config/superpowers/skills/` (or platform-specific variants)
- [lib/skills-core.js1-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L200) module for skill discovery and parsing
- Three-tier priority system (project → personal → superpowers)

**Sources:** [RELEASE-NOTES.md147-187](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L147-L187) [RELEASE-NOTES.md217-239](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L217-L239)

## Platform Integration Architecture

```
```

**Platform-specific tool locations:**

| Platform    | Skill Invocation Path                                                                      | Skills Location                 |
| ----------- | ------------------------------------------------------------------------------------------ | ------------------------------- |
| Claude Code | Native `Skill` tool → `~/.config/superpowers/skills/`                                      | `~/.config/superpowers/skills/` |
| OpenCode    | `use_skill` → `SuperpowersPlugin.js` → `lib/skills-core.js` → `~/.config/opencode/skills/` | `~/.config/opencode/skills/`    |
| Codex       | `superpowers-codex use-skill` → `lib/skills-core.js` → `~/.codex/superpowers/skills/`      | `~/.codex/superpowers/skills/`  |

**Sources:** [RELEASE-NOTES.md147-187](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L147-L187) [RELEASE-NOTES.md217-239](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L217-L239)

## Claude Code: Native Integration

Claude Code provides the most complete integration through first-party plugin infrastructure. The plugin uses native tools and hooks without requiring custom code execution.

### Skill Tool (Native)

Claude Code's built-in `Skill` tool loads and executes skill files directly:

```
Tool: Skill
Parameter: skill_name (string)
Behavior: Loads ~/.config/superpowers/skills/skills/<skill_name>/SKILL.md into context
```

**Key characteristics:**

- Fully qualified names: `superpowers:skill-name` for core skills, `skill-name` for personal skills
- Content loaded directly without file path handling
- Frontmatter stripped automatically by platform
- No explicit file reads required by agent

**Tool updates:**

- [RELEASE-NOTES.md36-41](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L36-L41): v4.0.1 clarified that `Skill` tool loads content directly, eliminating confusion about using `Read` tool separately

### Session Hooks

Session lifecycle managed through [.claude-plugin/hooks.json1-20](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/hooks.json#L1-L20):

**Hook configuration:**

```
```

**Execution flow:**

```
```

[.claude-plugin/hooks/session-start.sh1-50](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/hooks/session-start.sh#L1-L50) executes:

1. Sources `lib/initialize-skills.sh` to ensure repository is current
2. Runs auto-update check (`git fetch` + status comparison)
3. Generates JSON-formatted skills list with descriptions
4. Displays update status (synchronized/behind/diverged)
5. Warns if legacy `~/.config/superpowers/.git` directory found

**Bootstrap content:**

- Full `using-superpowers/SKILL.md` content injected at session start
- Skills list with descriptions for discovery
- Update status notifications

### Slash Commands

Three convenience commands redirect to underlying skills [RELEASE-NOTES.md25-29](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L25-L29):

| Command         | Target Skill                  | User-Only     |
| --------------- | ----------------------------- | ------------- |
| `/brainstorm`   | `superpowers:brainstorming`   | Yes (v4.0.2+) |
| `/write-plan`   | `superpowers:writing-plans`   | Yes (v4.0.2+) |
| `/execute-plan` | `superpowers:executing-plans` | Yes (v4.0.2+) |

**disable-model-invocation flag:**

- Set to `true` in [.claude-plugin/commands/brainstorm.md1-10](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/commands/brainstorm.md#L1-L10)
- Prevents Claude from invoking commands directly
- User must manually trigger via `/` prefix
- Skills remain autonomously invokable via `Skill` tool

### Agent Support

Native subagent delegation through [agents/code-reviewer.md1-49](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L49):

**Agent definition:**

```
```

**Invocation:**

- Agent dispatched through platform's native delegation mechanism
- Inherits model from parent session
- Receives task context through platform's message passing
- Returns structured review with severity categorization (Critical/Important/Suggestions)

**Namespace handling:**

- Plugin-provided agents: `superpowers:code-reviewer`
- Personal agents: `code-reviewer` (no namespace prefix)
- [RELEASE-NOTES.md282-292](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L282-L292): v3.2.1 bundled code-reviewer with plugin

### TodoWrite Tool (Native)

Platform provides `TodoWrite` tool for checklist management:

**Usage in skills:**

- `writing-plans` skill creates implementation task checklists
- `executing-plans` skill tracks batch execution progress
- `subagent-driven-development` skill loads plan into TodoWrite at start

**Tool behavior:**

- Creates structured todo items with checkboxes
- Persists across session suspension/resumption
- Visible in Claude Code UI sidebar

### Platform-Specific Files

| File                                                                                                                                            | Purpose                        | Line Count |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------- |
| [.claude-plugin/plugin.json1-14](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L14)                           | Plugin metadata, version 4.0.3 | 14         |
| [.claude-plugin/hooks.json1-20](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/hooks.json#L1-L20)                             | Session hook configuration     | \~10       |
| [.claude-plugin/hooks/session-start.sh1-50](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/hooks/session-start.sh#L1-L50)     | Bootstrap execution            | \~50       |
| [.claude-plugin/commands/brainstorm.md1-10](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/commands/brainstorm.md#L1-L10)     | Slash command redirect         | \~10       |
| [.claude-plugin/commands/write-plan.md1-10](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/commands/write-plan.md#L1-L10)     | Slash command redirect         | \~10       |
| [.claude-plugin/commands/execute-plan.md1-10](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/commands/execute-plan.md#L1-L10) | Slash command redirect         | \~10       |
| [agents/code-reviewer.md1-49](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L49)                                 | Code review agent definition   | 49         |

**Sources:** [RELEASE-NOTES.md1-53](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L1-L53) [RELEASE-NOTES.md282-292](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L282-L292) [.claude-plugin/plugin.json1-14](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L14) [agents/code-reviewer.md1-49](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L49)

## OpenCode: JavaScript Plugin Integration

OpenCode.ai uses a custom JavaScript plugin with event-driven bootstrap and context persistence mechanisms. Unlike Claude Code's native hooks, OpenCode requires explicit tool definitions and event handlers.

### SuperpowersPlugin.js

[docs/README.opencode.md1-100](https://github.com/obra/superpowers/blob/a01a135f/docs/README.opencode.md#L1-L100) describes the plugin structure:

**Plugin registration:**

```
```

**Installation:**

- Symlink from OpenCode plugins directory to plugin root
- OpenCode auto-loads on startup
- Skills directory: `~/.config/opencode/skills/`

### Custom Tools

#### use\_skill Tool

Loads and returns skill content:

**Tool signature:**

```
```

**Implementation flow:**

```
```

**Resolution priority** (uses [lib/skills-core.js1-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L200)):

1. Project-local: `.opencode/skills/<skill_name>/SKILL.md`
2. Personal: `~/.config/opencode/skills/<skill_name>/SKILL.md`
3. Superpowers: `~/.config/superpowers/skills/skills/<skill_name>/SKILL.md`

#### find\_skills Tool

Searches and filters available skills:

**Tool signature:**

```
```

**Returns:**

```
```

**Search behavior:**

- No keyword: returns all skills with metadata
- With keyword: filters by name/description substring match (case-insensitive)
- Uses `findSkillsInDir()` from [lib/skills-core.js1-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L200)

### Event Handlers

#### session.created Event

Triggered when new session starts [RELEASE-NOTES.md147-157](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L147-L157):

**Handler behavior:**

```
```

**Bootstrap injection:**

- Calls `session.prompt(content, { noReply: true })` [RELEASE-NOTES.md150-152](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L150-L152)
- Explicitly states `using-superpowers` already loaded to prevent redundant skill invocation
- Injects skills list with descriptions
- Consolidated into shared `getBootstrapContent()` helper (v3.5.1)

**Key difference from Claude Code:**

- Uses `noReply: true` flag to prevent agent response to bootstrap
- No native hook system, requires explicit event subscription

#### session.compacted Event

Triggered after context window compaction [RELEASE-NOTES.md166-168](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L166-L168):

**Purpose:**

- Re-inject critical skills context after compaction removes it
- Ensures `using-superpowers` protocol remains in context
- Maintains skills list availability

**Implementation:**

```
```

**Context persistence pattern:**

- Original approach (v3.5.0): `chat.message` hook with message insertion
- Current approach (v3.5.1): `session.created` + `session.compacted` events
- Message insertion removed, replaced with persistent prompt injection

### Platform-Specific Configuration

**Skills directory priorities:**

| Directory                              | Priority    | Purpose              |
| -------------------------------------- | ----------- | -------------------- |
| `.opencode/skills/`                    | 1 (highest) | Project-local skills |
| `~/.config/opencode/skills/`           | 2           | Personal skills      |
| `~/.config/superpowers/skills/skills/` | 3           | Superpowers library  |

**Shared code module:**

- Uses [lib/skills-core.js1-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L200) ES module
- Shared with Codex implementation
- Functions: `extractFrontmatter()`, `stripFrontmatter()`, `findSkillsInDir()`, `resolveSkillPath()`

### Platform Files

| File                      | Purpose                | Description                      |
| ------------------------- | ---------------------- | -------------------------------- |
| `SuperpowersPlugin.js`    | Main plugin entry      | Tool definitions, event handlers |
| `docs/README.opencode.md` | OpenCode documentation | Installation and usage guide     |
| `lib/skills-core.js`      | Shared module          | Skill discovery and parsing      |

**Sources:** [RELEASE-NOTES.md147-187](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L147-L187) [docs/README.opencode.md1-100](https://github.com/obra/superpowers/blob/a01a135f/docs/README.opencode.md#L1-L100)

## Codex: CLI Script Integration

Codex support is experimental and uses a unified Node.js script for all operations. Unlike the other platforms, Codex requires manual bootstrap configuration in `AGENTS.md`.

### superpowers-codex Script

[docs/README.codex.md1-100](https://github.com/obra/superpowers/blob/a01a135f/docs/README.codex.md#L1-L100) describes the unified CLI approach:

**Script location:**

- `.codex/superpowers-codex` (Node.js executable)
- Shebang: `#!/usr/bin/env node`
- Cross-platform: Works on Windows, macOS, Linux

**Command structure:**

```
```

### Commands

#### bootstrap Command

Initializes skills repository and displays status:

**Usage:**

```
```

**Execution flow:**

```
```

**Output:**

- Skills repository location
- Update status
- Available skills count
- Instructions for manual invocation

**Manual bootstrap requirement:**

- Add to `AGENTS.md` in Codex config directory
- Codex agent reads `AGENTS.md` at session start
- Agent manually invokes bootstrap command
- [RELEASE-NOTES.md225-227](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L225-L227): Minimal `AGENTS.md` configuration provided

#### use-skill Command

Loads and displays skill content:

**Usage:**

```
```

**Implementation:**

```
```

**Resolution order:**

1. Personal: `~/.codex/skills/<skill-name>/SKILL.md`
2. Superpowers: `~/.codex/superpowers/skills/skills/<skill-name>/SKILL.md`

**Output formatting:**

- Frontmatter stripped using [lib/skills-core.js1-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L200)
- Raw markdown content to stdout
- Agent receives as command output

#### find-skills Command

Searches skills with optional keyword filter:

**Usage:**

```
```

**Output format:**

```
Available skills:

superpowers:test-driven-development
  Description: Use when writing new code...
  Path: ~/.codex/superpowers/skills/skills/test-driven-development/

brainstorming
  Description: You MUST use this before any creative work...
  Path: ~/.codex/superpowers/skills/skills/brainstorming/
```

**Namespace prefixes:**

- `superpowers:` prefix for library skills
- No prefix for personal skills
- Personal skills override library skills when names collide

### Tool Substitution System

Codex lacks some tools available in Claude Code [RELEASE-NOTES.md224-225](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L224-L225):

**Mapping table:**

| Generic Tool        | Codex Equivalent              | Implementation                 |
| ------------------- | ----------------------------- | ------------------------------ |
| `TodoWrite`         | `update_plan`                 | Codex native planning tool     |
| Subagent delegation | Manual execution              | Agent notes "execute manually" |
| `Skill`             | `superpowers-codex use-skill` | CLI command invocation         |
| `Read`              | Native file access            | Direct file I/O                |

**Skill adaptations:**

- Skills detect Codex environment (via absence of certain tools)
- Provide alternative instructions for manual execution
- Example: `subagent-driven-development` provides manual task-by-task workflow

### Manual Bootstrap Configuration

**AGENTS.md entry:**

```
```

This loads the skills library. Use `superpowers-codex find-skills` to search skills.

````

**Workflow:**
1. User adds entry to Codex `AGENTS.md`
2. Codex agent reads `AGENTS.md` at session start
3. Agent invokes `superpowers-codex bootstrap`
4. Bootstrap output provides skills context

**Key difference from other platforms:**
- No automatic execution
- Agent must explicitly invoke commands
- Relies on agent reading and following `AGENTS.md` instructions

### Platform-Specific Paths

**Skills location:**
- Primary: `~/.codex/superpowers/skills/` (from superpowers-skills repo)
- Personal: `~/.codex/skills/` (user-created)

**Configuration files:**
- `.codex/INSTALL.md` - Installation instructions
- `.codex/superpowers-bootstrap.md` - Bootstrap content with Codex adaptations
- `.codex/superpowers-codex` - Unified CLI script

### Shared Module Usage

Uses <FileRef file-url="https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L200" min=1 max=200 file-path="lib/skills-core.js">Hii</FileRef> for skill operations:

**Module import:**
```javascript
import { 
  extractFrontmatter,
  stripFrontmatter,
  findSkillsInDir,
  resolveSkillPath 
} from '../lib/skills-core.js';
````

**Function usage:**

- `extractFrontmatter()`: Parse YAML frontmatter from SKILL.md
- `stripFrontmatter()`: Remove frontmatter for clean display
- `findSkillsInDir()`: Recursively scan skills directories
- `resolveSkillPath()`: Resolve skill name to file path with priority

**Cross-platform compatibility:**

- ES module loaded successfully by Node.js
- Shared with OpenCode implementation (v3.5.0+)
- Single source of truth for skill discovery logic

**Sources:** [RELEASE-NOTES.md217-239](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L217-L239) [docs/README.codex.md1-100](https://github.com/obra/superpowers/blob/a01a135f/docs/README.codex.md#L1-L100)

## lib/skills-core.js Shared Module

The [lib/skills-core.js1-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L200) module provides shared functionality for OpenCode and Codex implementations. It eliminates code duplication and ensures consistent skill discovery across platforms.

**Module introduction:** [RELEASE-NOTES.md175-180](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L175-L180) - v3.5.0 added shared core module

### Module Exports

**Function signatures:**

```
```

### extractFrontmatter() Implementation

**Purpose:** Parse YAML frontmatter from `SKILL.md` files

**Behavior:**

```
```

**Edge cases:**

- Returns `null` if no frontmatter found
- Handles multi-line YAML values
- Strips `---` delimiters

### stripFrontmatter() Implementation

**Purpose:** Remove YAML frontmatter for clean content display

**Behavior:**

```
```

**Usage:**

- OpenCode `use_skill` tool strips frontmatter before returning
- Codex `use-skill` command strips frontmatter before outputting
- Agent receives clean markdown without metadata

### findSkillsInDir() Implementation

**Purpose:** Recursively scan directory for all `SKILL.md` files

**Algorithm:**

```
```

**Output structure:**

```
```

### resolveSkillPath() Implementation

**Purpose:** Find skill file with directory priority

**Resolution algorithm:**

```
```

**Example:**

```
```

**Override behavior:**

- Higher-priority directories win
- Enables project-specific skill overrides
- Personal skills override superpowers skills

### Cross-Platform Usage

**OpenCode integration:**

```
```

**Codex integration:**

```
```

### Module Benefits

**Code reuse:**

- Single implementation of skill discovery logic
- Shared between OpenCode and Codex
- Consistent behavior across platforms

**Maintainability:**

- Bug fixes apply to both platforms
- Feature additions benefit both integrations
- Single source of truth for skill metadata parsing

**Testing:**

- [RELEASE-NOTES.md172](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L172-L172): Automated test suite with proper isolation
- Tests in `tests/opencode/` directory
- Validates shared module behavior

**Sources:** [RELEASE-NOTES.md147-187](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L147-L187) [lib/skills-core.js1-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L200)

## Platform Comparison

### Feature Matrix

| Feature                      | Claude Code                        | OpenCode                     | Codex                                   |
| ---------------------------- | ---------------------------------- | ---------------------------- | --------------------------------------- |
| **Skill Invocation**         | Native `Skill` tool                | Custom `use_skill` tool      | `superpowers-codex use-skill` command   |
| **Skill Discovery**          | Native `Skill` tool                | Custom `find_skills` tool    | `superpowers-codex find-skills` command |
| **Bootstrap Method**         | Automatic (session hooks)          | Automatic (event handlers)   | Manual (`AGENTS.md` config)             |
| **Session Persistence**      | Native hook re-execution           | Event-driven re-injection    | Manual re-invocation                    |
| **Subagent Support**         | Native delegation                  | Native delegation            | Manual execution                        |
| **TodoWrite**                | Native `TodoWrite` tool            | Native tool                  | `update_plan` (Codex native)            |
| **Personal Skills Location** | `~/.claude/skills/`                | `~/.config/opencode/skills/` | `~/.codex/skills/`                      |
| **Slash Commands**           | Yes (`/brainstorm`, etc.)          | No                           | No                                      |
| **Code Review Agent**        | Native `superpowers:code-reviewer` | Native delegation            | Manual process                          |

### Skills Repository Locations

**Claude Code:**

```
~/.config/superpowers/skills/          # Superpowers library
~/.claude/skills/                      # Personal skills (override)
```

**OpenCode:**

```
~/.config/superpowers/skills/          # Superpowers library (shared with Claude Code)
~/.config/opencode/skills/             # Personal skills
.opencode/skills/                      # Project-local skills (highest priority)
```

**Codex:**

```
~/.codex/superpowers/skills/           # Superpowers library
~/.codex/skills/                       # Personal skills (override)
```

### Tool Invocation Patterns

**Claude Code:**

```
# Agent uses native tool
<use_skill>
  <skill_name>superpowers:test-driven-development</skill_name>
</use_skill>
```

**OpenCode:**

```
```

**Codex:**

```
```

### Bootstrap Comparison

```
```

**Automation levels:**

- **Claude Code:** Fully automatic, zero configuration
- **OpenCode:** Fully automatic after plugin installation
- **Codex:** Manual, requires `AGENTS.md` setup

**Sources:** [RELEASE-NOTES.md147-187](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L147-L187) [RELEASE-NOTES.md217-239](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L217-L239)

## Integration File Reference

Complete mapping of platform-specific files:

### Claude Code Files

| File                                                                                                                                            | Purpose                         | Lines |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----- |
| [.claude-plugin/plugin.json1-14](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L14)                           | Plugin metadata (version 4.0.3) | 14    |
| [.claude-plugin/hooks.json1-20](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/hooks.json#L1-L20)                             | Session hook configuration      | \~10  |
| [.claude-plugin/hooks/session-start.sh1-50](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/hooks/session-start.sh#L1-L50)     | Session bootstrap script        | \~50  |
| [.claude-plugin/commands/brainstorm.md1-10](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/commands/brainstorm.md#L1-L10)     | `/brainstorm` slash command     | \~10  |
| [.claude-plugin/commands/write-plan.md1-10](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/commands/write-plan.md#L1-L10)     | `/write-plan` slash command     | \~10  |
| [.claude-plugin/commands/execute-plan.md1-10](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/commands/execute-plan.md#L1-L10) | `/execute-plan` slash command   | \~10  |
| [agents/code-reviewer.md1-49](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L49)                                 | Code review subagent definition | 49    |

### OpenCode Files

| File                                                                                                    | Purpose                           | Lines |
| ------------------------------------------------------------------------------------------------------- | --------------------------------- | ----- |
| `SuperpowersPlugin.js`                                                                                  | Main plugin with tool definitions | \~200 |
| `docs/README.opencode.md`                                                                               | OpenCode-specific documentation   | \~100 |
| [lib/skills-core.js1-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L200) | Shared skill discovery module     | \~200 |

### Codex Files

| File                                                                                                    | Purpose                         | Lines |
| ------------------------------------------------------------------------------------------------------- | ------------------------------- | ----- |
| `.codex/superpowers-codex`                                                                              | Unified CLI tool (Node.js)      | \~150 |
| `.codex/INSTALL.md`                                                                                     | Installation instructions       | \~50  |
| `.codex/superpowers-bootstrap.md`                                                                       | Bootstrap content for AGENTS.md | \~100 |
| [lib/skills-core.js1-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L200) | Shared skill discovery module   | \~200 |

### Shared Infrastructure

| File                                                                                                                | Purpose                        | Lines |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----- |
| [lib/initialize-skills.sh1-200](https://github.com/obra/superpowers/blob/a01a135f/lib/initialize-skills.sh#L1-L200) | Repository clone and update    | \~200 |
| [lib/skills-core.js1-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L200)             | ES module for skill operations | \~200 |

**Sources:** [RELEASE-NOTES.md147-187](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L147-L187) [RELEASE-NOTES.md217-239](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L217-L239) [.claude-plugin/plugin.json1-14](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L14) [agents/code-reviewer.md1-49](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L49)

## Enforcement Mechanism: Mandatory First Response Protocol

The skills discovery system is coupled with enforcement mechanisms that ensure agents use discovered skills:

**Protocol checklist** (from `using-superpowers` skill):

```
1. ☐ List available skills in your mind
2. ☐ Ask yourself: "Does ANY skill match this request?"
3. ☐ If yes → Use the Skill tool to read and run the skill file
4. ☐ Announce which skill you're using
5. ☐ Follow the skill exactly
```

**Enforcement language:**

- "MANDATORY FIRST RESPONSE PROTOCOL"
- "Responding WITHOUT completing this checklist = automatic failure"
- "If even 1% chance a skill might apply... you ABSOLUTELY MUST read the skill"

This creates a behavioral contract where discovery of a relevant skill mandates its usage.

**Sources:** [skills/using-superpowers/SKILL.md16-26](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L16-L26) [skills/using-superpowers/SKILL.md6-12](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L6-L12) [RELEASE-NOTES.md61-74](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L61-L74)

## Bootstrap Sequence Comparison

The following diagram shows how both platforms arrive at the same functional state through different initialization paths:

```
```

**Sources:** [RELEASE-NOTES.md18-40](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L18-L40) [RELEASE-NOTES.md249-256](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L249-L256)

## Directory Layout

The components create and manage the following directory structure:

```
~/.config/superpowers/
├── skills/                          # Local clone of obra/superpowers-skills
│   ├── .git/                        # Git repository metadata
│   ├── skills/                      # Skills library
│   │   ├── collaboration/
│   │   ├── debugging/
│   │   ├── meta/
│   │   ├── testing/
│   │   └── using-superpowers/       # Bootstrap skill
│   └── README.md
└── skills.bak/                      # Backup from v2.0 migration (if applicable)

~/.claude/skills/                    # Personal skills (Claude Code)
~/.codex/skills/                     # Personal skills (Codex)
```

**Personal skills override behavior:**

When a personal skill has the same name as a superpowers skill, the personal version takes precedence. This enables users to:

- Override default behavior for their workflow
- Test skill modifications before contributing
- Maintain private workflow adaptations

**Sources:** [RELEASE-NOTES.md224-245](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L224-L245) [RELEASE-NOTES.md12-13](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L12-L13)

## Environment Variables Reference

| Variable                  | Set By                 | Purpose                             | Default Value                                    |
| ------------------------- | ---------------------- | ----------------------------------- | ------------------------------------------------ |
| `SUPERPOWERS_SKILLS_ROOT` | `session-start.sh`     | Root directory of skills repository | `~/.config/superpowers/skills`                   |
| `SKILLS_REPO`             | `initialize-skills.sh` | Upstream repository URL             | `https://github.com/obra/superpowers-skills.git` |
| `SKILLS_DIR`              | `initialize-skills.sh` | Local clone directory               | `~/.config/superpowers/skills`                   |
| `CLAUDE_PLUGIN_ROOT`      | Claude Code platform   | Plugin installation directory       | Set by platform                                  |

**Sources:** [RELEASE-NOTES.md322-324](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L322-L324)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Platform-Specific Features](#platform-specific-features.md)
- [Overview](#overview.md)
- [Platform Integration Architecture](#platform-integration-architecture.md)
- [Claude Code: Native Integration](#claude-code-native-integration.md)
- [Skill Tool (Native)](#skill-tool-native.md)
- [Session Hooks](#session-hooks.md)
- [Slash Commands](#slash-commands.md)
- [Agent Support](#agent-support.md)
- [TodoWrite Tool (Native)](#todowrite-tool-native.md)
- [Platform-Specific Files](#platform-specific-files.md)
- [OpenCode: JavaScript Plugin Integration](#opencode-javascript-plugin-integration.md)
- [SuperpowersPlugin.js](#superpowerspluginjs.md)
- [Custom Tools](#custom-tools.md)
- [use\_skill Tool](#use_skill-tool.md)
- [find\_skills Tool](#find_skills-tool.md)
- [Event Handlers](#event-handlers.md)
- [session.created Event](#sessioncreated-event.md)
- [session.compacted Event](#sessioncompacted-event.md)
- [Platform-Specific Configuration](#platform-specific-configuration.md)
- [Platform Files](#platform-files.md)
- [Codex: CLI Script Integration](#codex-cli-script-integration.md)
- [superpowers-codex Script](#superpowers-codex-script.md)
- [Commands](#commands.md)
- [bootstrap Command](#bootstrap-command.md)
- [use-skill Command](#use-skill-command.md)
- [find-skills Command](#find-skills-command.md)
- [Tool Substitution System](#tool-substitution-system.md)
- [Manual Bootstrap Configuration](#manual-bootstrap-configuration.md)
- [lib/skills-core.js Shared Module](#libskills-corejs-shared-module.md)
- [Module Exports](#module-exports.md)
- [extractFrontmatter() Implementation](#extractfrontmatter-implementation.md)
- [stripFrontmatter() Implementation](#stripfrontmatter-implementation.md)
- [findSkillsInDir() Implementation](#findskillsindir-implementation.md)
- [resolveSkillPath() Implementation](#resolveskillpath-implementation.md)
- [Cross-Platform Usage](#cross-platform-usage.md)
- [Module Benefits](#module-benefits.md)
- [Platform Comparison](#platform-comparison.md)
- [Feature Matrix](#feature-matrix.md)
- [Skills Repository Locations](#skills-repository-locations.md)
- [Tool Invocation Patterns](#tool-invocation-patterns.md)
- [Bootstrap Comparison](#bootstrap-comparison.md)
- [Integration File Reference](#integration-file-reference.md)
- [Claude Code Files](#claude-code-files.md)
- [OpenCode Files](#opencode-files.md)
- [Codex Files](#codex-files.md)
- [Shared Infrastructure](#shared-infrastructure.md)
- [Enforcement Mechanism: Mandatory First Response Protocol](#enforcement-mechanism-mandatory-first-response-protocol.md)
- [Bootstrap Sequence Comparison](#bootstrap-sequence-comparison.md)
- [Directory Layout](#directory-layout.md)
- [Environment Variables Reference](#environment-variables-reference.md)
