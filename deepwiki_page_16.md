# /obra/superpowers/5.1-claude-code:-skill-tool-and-hooks

Claude Code: Skill Tool and Hooks | obra/superpowers | DeepWiki

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

# Claude Code: Skill Tool and Hooks

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [commands/brainstorm.md](https://github.com/obra/superpowers/blob/a01a135f/commands/brainstorm.md)
- [commands/execute-plan.md](https://github.com/obra/superpowers/blob/a01a135f/commands/execute-plan.md)
- [commands/write-plan.md](https://github.com/obra/superpowers/blob/a01a135f/commands/write-plan.md)
- [docs/windows/polyglot-hooks.md](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md)
- [hooks/hooks.json](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json)
- [hooks/run-hook.cmd](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd)
- [hooks/session-start.sh](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh)

## Purpose and Scope

This page documents Claude Code's native integration features for Superpowers: the built-in Skill tool, session initialization hooks, slash commands, and agent support. These features make Claude Code the primary platform for Superpowers with the most mature integration.

For details about the underlying skills repository management and multi-platform architecture, see [Skills Repository Management](obra/superpowers/4.2-skills-repository-management.md) and [Multi-Platform Integration](obra/superpowers/4.3-multi-platform-integration.md). For OpenCode and Codex integration approaches, see [OpenCode: Plugin and Custom Tools](obra/superpowers/5.2-opencode:-plugin-and-custom-tools.md) and [Codex: CLI Tool](obra/superpowers/5.3-codex:-cli-tool.md).

---

## Native Skill Tool

Claude Code provides a first-party **Skill tool** that allows Claude to invoke skills by name without requiring file system operations. This is the primary mechanism for skill invocation on Claude Code.

### How It Works

Skills are invoked using fully qualified names with the format `superpowers:skill-name` (e.g., `superpowers:test-driven-development`, `superpowers:brainstorming`). The Skill tool:

1. Locates the skill by name in the skills directory hierarchy
2. Loads the `SKILL.md` file content
3. Delivers the full skill content directly to Claude's context
4. No separate Read tool invocation needed

The `using-superpowers` skill explicitly instructs Claude that the Skill tool loads content directly, preventing the confusion pattern where Claude would invoke a skill via Skill tool, then try to Read the file separately [RELEASE-NOTES.md36-41](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L36-L41)

### Three-Tier Priority System

Skills are resolved in priority order:

1. **Project skills**: `.claude/skills/` in project directory
2. **Personal skills**: `~/.claude/skills/` in home directory
3. **Superpowers skills**: Loaded from plugin's `skills/` directory

When multiple skills with the same name exist, the highest priority version is used. Personal and project skills can override superpowers skills.

### Diagram: Skill Tool Resolution Flow

```
```

**Sources**: [RELEASE-NOTES.md36-41](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L36-L41) [hooks/session-start.sh1-52](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L52)

---

## Session Lifecycle and Bootstrap System

### SessionStart Hook Architecture

The plugin uses a **SessionStart hook** to inject bootstrap content at the beginning of every session. This ensures Claude always has access to the `using-superpowers` skill without requiring manual invocation.

**Diagram: Session Initialization Flow**

```
```

**Sources**: [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15) [hooks/run-hook.cmd1-20](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L20) [hooks/session-start.sh1-52](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L52)

### Hook Configuration

The hook is configured in `hooks/hooks.json` [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15):

| Field                           | Value                                                         | Purpose                    |
| ------------------------------- | ------------------------------------------------------------- | -------------------------- |
| `hooks.SessionStart[0].matcher` | `"startup\|resume\|clear\|compact"`                           | Triggers on session events |
| `hooks[0].type`                 | `"command"`                                                   | Executes system command    |
| `hooks[0].command`              | `"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd" session-start.sh` | Polyglot wrapper path      |

The `${CLAUDE_PLUGIN_ROOT}` environment variable is set by Claude Code and points to the plugin's installation directory. The command must be quoted because the path may contain spaces on Windows.

### Bootstrap Content Injection

The `session-start.sh` script outputs JSON to stdout with the following structure [hooks/session-start.sh43-50](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L43-L50):

```
```

The `additionalContext` field contains:

1. **Introduction**: "You have superpowers" with emphasis
2. **Full skill content**: Complete `using-superpowers/SKILL.md` content
3. **Tool guidance**: "For all other skills, use the 'Skill' tool"
4. **Legacy warning** (if applicable): Alert about deprecated directory

This approach (implemented in v4.0.1) prevents Claude from redundantly invoking `using-superpowers` via the Skill tool when it's already loaded [RELEASE-NOTES.md36-41](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L36-L41)

### Legacy Directory Warning

The hook checks for the existence of `~/.config/superpowers/skills/` [hooks/session-start.sh11-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L11-L15) This directory is from the v2.0 architecture before Claude Code's native skills system. If found, a warning is injected telling the user to migrate custom skills to `~/.claude/skills/` and remove the old directory.

### Pure Bash JSON Escaping

To avoid dependencies on external tools like `sed`, `awk`, or `jq`, the hook implements JSON string escaping using only bash builtins [hooks/session-start.sh21-37](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L21-L37):

The `escape_for_json()` function iterates character-by-character, escaping:

- Backslashes (`\` → `\\`)
- Quotes (`"` → `\"`)
- Newlines (`\n` → `\\n`)
- Carriage returns (`\r` → `\\r`)
- Tabs (`\t` → `\\t`)

This ensures the hook works on Windows (via Git Bash) without requiring additional Unix utilities in the PATH.

**Sources**: [hooks/session-start.sh1-52](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L52) [RELEASE-NOTES.md36-41](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L36-L41)

---

## Cross-Platform Hook Execution

### The Polyglot Wrapper Pattern

Claude Code runs hooks through the system's default shell (CMD on Windows, bash/sh on Unix). To support cross-platform execution, Superpowers uses a **polyglot script** that is valid syntax in both CMD and bash simultaneously.

**Diagram: Hook Execution Architecture**

```
```

**Sources**: [hooks/run-hook.cmd1-20](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L20) [docs/windows/polyglot-hooks.md1-213](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L1-L213)

### How the Polyglot Works

The `run-hook.cmd` file [hooks/run-hook.cmd1-20](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L20) contains:

**Lines 1-13 (CMD Block)**:

```
```

**Lines 15-19 (Bash Block)**:

```
```

### Platform-Specific Parsing

| Platform        | Interpretation                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------- |
| **Windows CMD** | Sees `:` as a label (ignored), executes `@echo off` through `exit /b`, never reaches bash block |
| **Unix bash**   | Sees `: << 'CMDBLOCK'` as heredoc (consumes lines until `CMDBLOCK`), then executes bash block   |

The key insight: the CMDBLOCK heredoc in bash consumes the entire CMD section as discarded input, while CMD's label syntax ignores the heredoc marker and executes the block as regular commands.

### Windows Execution Details

On Windows, the CMD block [hooks/run-hook.cmd2-12](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L2-L12):

1. Uses `@echo off` to suppress command echoing
2. Calls Git Bash with full path: `"C:\Program Files\Git\bin\bash.exe"`
3. Uses `-l` flag for login shell (sets up proper PATH with Unix utilities)
4. `%~dp0` expands to the directory of the wrapper script
5. `%~1` is the first argument (target script name like `session-start.sh`)
6. `%2 %3 ...` passes remaining arguments
7. `exit /b` exits CMD immediately, never reaching the bash block

### Unix Execution Details

On Unix, the bash block [hooks/run-hook.cmd16-19](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L16-L19):

1. Determines the script directory using `dirname "$0"`
2. Extracts the first argument as `SCRIPT_NAME`
3. Uses `shift` to remove first argument from `$@`
4. Executes the target script with remaining arguments

The use of `"$0"` (not `${BASH_SOURCE[0]}`) ensures POSIX compatibility. The v3.6.2 release fixed a Linux compatibility issue by removing bash-specific syntax [RELEASE-NOTES.md141-144](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L141-L144)

**Sources**: [hooks/run-hook.cmd1-20](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L20) [docs/windows/polyglot-hooks.md1-213](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L1-L213) [RELEASE-NOTES.md141-144](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L141-L144)

---

## Slash Commands

Claude Code supports **slash commands** that users can manually invoke. Superpowers provides three commands that redirect to their corresponding skills.

### Command Definitions

| Command         | File                       | Target Skill                  | User-Only    |
| --------------- | -------------------------- | ----------------------------- | ------------ |
| `/brainstorm`   | `commands/brainstorm.md`   | `superpowers:brainstorming`   | Yes (v4.0.2) |
| `/write-plan`   | `commands/write-plan.md`   | `superpowers:writing-plans`   | Yes (v4.0.2) |
| `/execute-plan` | `commands/execute-plan.md` | `superpowers:executing-plans` | Yes (v4.0.2) |

### Command Structure

Each command file has YAML frontmatter followed by a single instruction [commands/brainstorm.md1-7](https://github.com/obra/superpowers/blob/a01a135f/commands/brainstorm.md#L1-L7):

```
```

### The `disable-model-invocation` Flag

Version 4.0.2 added `disable-model-invocation: true` to all three commands [RELEASE-NOTES.md25-29](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L25-L29) This prevents Claude from invoking the slash commands via the Skill tool.

**Rationale**: Claude was sometimes autonomously invoking slash commands, which would just redirect to the underlying skill. This created unnecessary indirection. Now:

- **Users** can invoke `/brainstorm`, `/write-plan`, `/execute-plan` manually
- **Claude** invokes `superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:executing-plans` directly

This eliminates confusion while maintaining both invocation paths.

### Brainstorming Command Emphasis

The `/brainstorm` command has particularly strong language in its description [commands/brainstorm.md2](https://github.com/obra/superpowers/blob/a01a135f/commands/brainstorm.md#L2-L2):

> "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior."

This imperative phrasing (added in v4.0.0) addresses the failure mode where Claude would skip design and jump straight to implementation. The underlying `superpowers:brainstorming` skill has similar enforcement [RELEASE-NOTES.md118-119](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L118-L119)

**Sources**: [commands/brainstorm.md1-7](https://github.com/obra/superpowers/blob/a01a135f/commands/brainstorm.md#L1-L7) [commands/write-plan.md1-7](https://github.com/obra/superpowers/blob/a01a135f/commands/write-plan.md#L1-L7) [commands/execute-plan.md1-7](https://github.com/obra/superpowers/blob/a01a135f/commands/execute-plan.md#L1-L7) [RELEASE-NOTES.md25-29](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L25-L29) [RELEASE-NOTES.md118-119](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L118-L119)

---

## Agent Support

### The code-reviewer Agent

Superpowers includes a built-in **code-reviewer agent** definition at `agents/code-reviewer.md` [agents/code-reviewer.md1-48](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L48) This agent is invoked during two-stage review in subagent-driven development workflows.

**Agent Frontmatter** [agents/code-reviewer.md2-6](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L2-L6):

```
```

The `model: inherit` setting means the agent uses the same model as the main session (typically Claude 3.5 Sonnet or Claude 3 Opus).

### Invocation Pattern

Claude invokes the agent using the namespaced name `superpowers:code-reviewer` after a task is completed in subagent workflows. The agent is referenced in multiple skills:

- `requesting-code-review` [RELEASE-NOTES.md290-292](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L290-L292)
- `subagent-driven-development` [RELEASE-NOTES.md290-292](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L290-L292)

### Two-Stage Review System

The code-reviewer plays the second role in the v4.0.0 two-stage review system [RELEASE-NOTES.md56-63](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L56-L63):

1. **Spec compliance review**: Skeptical reviewer verifies implementation matches requirements
2. **Code quality review**: `superpowers:code-reviewer` reviews for clean code, maintainability, test coverage

The agent is only invoked after spec compliance passes. This prevents wasting time on code quality reviews when the implementation doesn't match requirements.

### Review Categories

The agent evaluates code across six dimensions [agents/code-reviewer.md12-40](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L12-L40):

| Category             | Focus Area                                                 |
| -------------------- | ---------------------------------------------------------- |
| Plan Alignment       | Compare against original requirements, identify deviations |
| Code Quality         | Patterns, conventions, error handling, type safety         |
| Architecture         | SOLID principles, separation of concerns, loose coupling   |
| Documentation        | Comments, function docs, inline explanations               |
| Issue Identification | Critical/Important/Suggestions with severity levels        |
| Communication        | Structured feedback, acknowledge strengths before issues   |

### Agent Output Format

The agent provides:

- **Issue categorization**: Critical (must fix) / Important (should fix) / Suggestions (nice to have)
- **Specific examples**: Concrete code references for each issue
- **Actionable recommendations**: How to fix with code examples when helpful
- **Constructive tone**: Acknowledges what was done well first

**Sources**: [agents/code-reviewer.md1-48](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L48) [RELEASE-NOTES.md56-75](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L56-L75) [RELEASE-NOTES.md282-292](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L282-L292)

---

## TodoWrite Tool Integration

Claude Code provides a **TodoWrite tool** that the `subagent-driven-development` skill uses for task tracking. When executing plans, the skill:

1. Reads the implementation plan from `docs/plans/YYYY-MM-DD-feature-name.md`
2. Extracts task list to TodoWrite (v4.0.0 improvement) [RELEASE-NOTES.md69](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L69-L69)
3. Updates task status as implementation progresses

This integration is unique to Claude Code. Other platforms (OpenCode, Codex) use different mechanisms for plan tracking. See [Codex: CLI Tool](obra/superpowers/5.3-codex:-cli-tool.md) for the tool substitution approach.

**Sources**: [RELEASE-NOTES.md69](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L69-L69)

---

## Plugin Metadata and Configuration

### plugin.json

The plugin manifest [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13) defines:

| Field         | Value                                 | Purpose                             |
| ------------- | ------------------------------------- | ----------------------------------- |
| `name`        | `"superpowers"`                       | Plugin identifier                   |
| `version`     | `"4.0.3"`                             | Current version (updated regularly) |
| `description` | Core skills library description       | Shown in marketplace                |
| `homepage`    | `https://github.com/obra/superpowers` | Plugin repository                   |
| `keywords`    | `["skills", "tdd", "debugging", ...]` | Marketplace search terms            |

### Directory Structure

```
.claude-plugin/
├── plugin.json              # Plugin metadata
└── marketplace.json         # Dev marketplace config

hooks/
├── hooks.json               # Hook configuration
├── run-hook.cmd            # Polyglot wrapper
└── session-start.sh        # SessionStart implementation

commands/
├── brainstorm.md           # /brainstorm slash command
├── write-plan.md           # /write-plan slash command
└── execute-plan.md         # /execute-plan slash command

agents/
└── code-reviewer.md        # code-reviewer agent definition

skills/
└── using-superpowers/
    └── SKILL.md            # Bootstrap skill content
```

The `skills/` directory contains only the `using-superpowers` skill. All other skills are managed by the separate skills repository. See [Skills Repository Management](obra/superpowers/4.2-skills-repository-management.md) for details on how skills are cloned and updated.

**Sources**: [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13) [.claude-plugin/marketplace.json1-20](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json#L1-L20)

---

## Version History and Evolution

### v4.0.x: Strengthening Phase

- **v4.0.3** (2025-12-26): Added explicit skill request tests, strengthened "The Rule" [RELEASE-NOTES.md7-19](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L7-L19)
- **v4.0.2** (2025-12-23): Added `disable-model-invocation` to slash commands [RELEASE-NOTES.md25-29](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L25-L29)
- **v4.0.1** (2025-12-23): Clarified Skill tool usage, preventing Read tool confusion [RELEASE-NOTES.md36-41](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L36-L41)
- **v4.0.0** (2025-12-17): Two-stage code review system, DOT flowcharts, skill consolidation [RELEASE-NOTES.md54-134](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L54-L134)

### v3.x: Platform Expansion

- **v3.6.2** (2025-12-03): Fixed Linux compatibility in polyglot wrapper [RELEASE-NOTES.md141-144](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L141-L144)
- **v3.5.1** (2025-11-24): OpenCode bootstrap refactor to `session.created` [RELEASE-NOTES.md149-157](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L149-L157)
- **v3.5.0** (2025-11-23): Added OpenCode support, shared `lib/skills-core.js` [RELEASE-NOTES.md162-187](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L162-L187)
- **v3.3.0** (2025-10-28): Experimental Codex support [RELEASE-NOTES.md215-239](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L215-L239)
- **v3.2.3** (2025-10-23): Changed from Read tool to Skill tool in instructions [RELEASE-NOTES.md245-255](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L245-L255)

### v3.0.x: Skills System Migration

- **v3.0.1** (2025-10-16): Adopted Anthropic's first-party skills system [RELEASE-NOTES.md389-390](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L389-L390)

### v2.0.x: Repository Separation

- **v2.0.0** (2025-10-12): Major architecture shift - separated skills repository [RELEASE-NOTES.md408-637](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L408-L637)

The evolution shows progressive strengthening of enforcement mechanisms (The Rule, pressure scenarios, disable-model-invocation) and expansion to multiple platforms while maintaining Claude Code as the primary integration target.

**Sources**: [RELEASE-NOTES.md1-637](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L1-L637)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Claude Code: Skill Tool and Hooks](#claude-code-skill-tool-and-hooks.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Native Skill Tool](#native-skill-tool.md)
- [How It Works](#how-it-works.md)
- [Three-Tier Priority System](#three-tier-priority-system.md)
- [Diagram: Skill Tool Resolution Flow](#diagram-skill-tool-resolution-flow.md)
- [Session Lifecycle and Bootstrap System](#session-lifecycle-and-bootstrap-system.md)
- [SessionStart Hook Architecture](#sessionstart-hook-architecture.md)
- [Hook Configuration](#hook-configuration.md)
- [Bootstrap Content Injection](#bootstrap-content-injection.md)
- [Legacy Directory Warning](#legacy-directory-warning.md)
- [Pure Bash JSON Escaping](#pure-bash-json-escaping.md)
- [Cross-Platform Hook Execution](#cross-platform-hook-execution.md)
- [The Polyglot Wrapper Pattern](#the-polyglot-wrapper-pattern.md)
- [How the Polyglot Works](#how-the-polyglot-works.md)
- [Platform-Specific Parsing](#platform-specific-parsing.md)
- [Windows Execution Details](#windows-execution-details.md)
- [Unix Execution Details](#unix-execution-details.md)
- [Slash Commands](#slash-commands.md)
- [Command Definitions](#command-definitions.md)
- [Command Structure](#command-structure.md)
- [The \`disable-model-invocation\` Flag](#the-disable-model-invocation-flag.md)
- [Brainstorming Command Emphasis](#brainstorming-command-emphasis.md)
- [Agent Support](#agent-support.md)
- [The code-reviewer Agent](#the-code-reviewer-agent.md)
- [Invocation Pattern](#invocation-pattern.md)
- [Two-Stage Review System](#two-stage-review-system.md)
- [Review Categories](#review-categories.md)
- [Agent Output Format](#agent-output-format.md)
- [TodoWrite Tool Integration](#todowrite-tool-integration.md)
- [Plugin Metadata and Configuration](#plugin-metadata-and-configuration.md)
- [plugin.json](#pluginjson.md)
- [Directory Structure](#directory-structure.md)
- [Version History and Evolution](#version-history-and-evolution.md)
- [v4.0.x: Strengthening Phase](#v40x-strengthening-phase.md)
- [v3.x: Platform Expansion](#v3x-platform-expansion.md)
- [v3.0.x: Skills System Migration](#v30x-skills-system-migration.md)
- [v2.0.x: Repository Separation](#v20x-repository-separation.md)
