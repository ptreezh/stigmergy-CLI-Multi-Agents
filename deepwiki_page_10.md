# /obra/superpowers/4-architecture

Architecture | obra/superpowers | DeepWiki

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

# Architecture

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)

This page provides an architectural overview of the superpowers system, explaining how the plugin, skills repository, and platform integrations work together to deliver a consistent skill library across multiple AI development environments.

For platform-specific implementation details, see [Multi-Platform Integration](obra/superpowers/4.3-multi-platform-integration.md). For detailed skills repository management, see [Skills Repository Management](obra/superpowers/4.2-skills-repository-management.md). For bootstrap and session initialization, see [Session Lifecycle and Bootstrap](obra/superpowers/4.4-session-lifecycle-and-bootstrap.md).

---

## Dual Repository Design

The superpowers system separates the plugin implementation from the skills content through a dual-repository architecture:

1. **Plugin Repository** (`obra/superpowers`) - Contains platform integration code, hooks, and bootstrap logic. Versioned independently, updated through plugin managers.

2. **Skills Repository** (`obra/superpowers-skills`) - Contains all skill documents, supporting files, and skill-specific tools. Cloned locally and auto-updated via git.

**Separation Rationale:**

- Skills evolve more rapidly than plugin infrastructure
- Users can fork skills for contributions without forking plugin code
- Skills can be updated without reinstalling the plugin
- Multiple platforms share the same skills without duplication

### Repository Locations

```
```

**Sources:** [RELEASE-NOTES.md407-443](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L407-L443) [RELEASE-NOTES.md449-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L461)

---

## Three-Tier Architecture

The system implements a three-tier architecture that enforces separation of concerns:

### Architectural Layers

| Layer                | Responsibility                                         | Components                                               |
| -------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| **Platform Adapter** | Integrate with AI development environment              | Plugin files, hooks, event handlers                      |
| **Core System**      | Manage skills repository lifecycle, bootstrap sessions | `lib/initialize-skills.sh`, `lib/skills-core.js`         |
| **Skills Library**   | Provide reusable development methodologies             | Individual skill SKILL.md files and supporting resources |

```
```

**Sources:** [RELEASE-NOTES.md422-435](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L422-L435) [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13)

---

## Platform Adapter Layer

Each platform uses a different integration mechanism while sharing the core skills repository:

### Integration Mechanisms by Platform

| Platform        | Integration Type              | Primary Components                                      | Session Bootstrap                                      |
| --------------- | ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| **Claude Code** | Native plugin with hooks      | `hooks/session-start.sh`, `run-hook.cmd`, Skill tool    | Hook executes `initialize-skills.sh`                   |
| **OpenCode**    | JavaScript plugin with events | `.opencode/plugin/superpowers.js`, `lib/skills-core.js` | `session.created` event injects via `session.prompt()` |
| **Codex**       | Node.js CLI tool              | `.codex/superpowers-codex`, `lib/skills-core.js`        | CLI `bootstrap` command in AGENTS.md                   |

```
```

**Sources:** [RELEASE-NOTES.md160-188](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L160-L188) [RELEASE-NOTES.md213-239](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L213-L239)

---

## Skills Storage and Resolution

Skills are resolved from three locations in priority order:

### Resolution Priority

1. **Project Skills** (`.opencode/skills/` or `.claude/skills/` in project directory)
2. **Personal Skills** (`~/.claude/skills/` or `~/.codex/skills/`)
3. **Superpowers Skills** (`$SUPERPOWERS_SKILLS_ROOT`)

When a skill name matches in multiple locations, the higher-priority location takes precedence. Skills from the superpowers repository use the `superpowers:` namespace prefix to avoid collisions.

### Skills Directory Structure

```
```

**Sources:** [RELEASE-NOTES.md169](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L169-L169) [RELEASE-NOTES.md520-523](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L520-L523)

---

## Session Lifecycle and Bootstrap

Every session follows a consistent initialization sequence regardless of platform:

### Session Initialization Flow

```
```

**Sources:** [RELEASE-NOTES.md449-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L461) [RELEASE-NOTES.md512-528](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L512-L528) [RELEASE-NOTES.md150-157](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L150-L157)

---

## Key Code Components

The following table maps architectural concepts to concrete code entities:

| Component                            | File Path                                                    | Purpose                                                                                 |
| ------------------------------------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **Skills Repository Initialization** | `lib/initialize-skills.sh`                                   | Clones skills repo, sets up remotes, auto-updates on session start                      |
| **Shared Skill Discovery**           | `lib/skills-core.js`                                         | ES module for finding, parsing, and loading skills (OpenCode + Codex)                   |
| **Polyglot Hook Wrapper**            | `run-hook.cmd`                                               | Enables bash scripts to run on Windows CMD and Unix shells                              |
| **Claude Code Session Hook**         | `hooks/session-start.sh`                                     | Triggers `initialize-skills.sh`, announces available skills                             |
| **OpenCode Plugin**                  | `.opencode/plugin/superpowers.js`                            | Implements custom tools (`use_skill`, `find_skills`) and event handlers                 |
| **Codex CLI Tool**                   | `.codex/superpowers-codex`                                   | Node.js script with `bootstrap`, `use-skill`, `find-skills` commands                    |
| **Bootstrap Meta-Skill**             | `$SUPERPOWERS_SKILLS_ROOT/skills/using-superpowers/SKILL.md` | Loaded at session start, enforces skill-checking protocol                               |
| **Code Reviewer Agent**              | `agents/code-reviewer.md`                                    | Agent definition for systematic code review (namespaced as `superpowers:code-reviewer`) |

**Sources:** [RELEASE-NOTES.md449-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L461) [RELEASE-NOTES.md160-188](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L160-L188) [RELEASE-NOTES.md213-239](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L213-L239) [RELEASE-NOTES.md139-145](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L139-L145) [agents/code-reviewer.md1-49](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L49)

---

## Cross-Platform Compatibility

The system achieves cross-platform operation through several mechanisms:

### Windows Compatibility Pattern

The `run-hook.cmd` polyglot wrapper enables bash scripts to run on both Windows and Unix systems:

```
```

The wrapper script uses a hybrid syntax that CMD treats as a label jump (`:<<BATCH`) and bash treats as a here-document redirect.

**Sources:** [RELEASE-NOTES.md139-145](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L139-L145) [RELEASE-NOTES.md399-405](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L399-L405)

### Shared Logic Pattern

OpenCode and Codex share skill discovery logic via the `lib/skills-core.js` ES module:

```
```

This eliminates code duplication and ensures consistent behavior across platforms.

**Sources:** [RELEASE-NOTES.md175-181](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L175-L181)

---

## Environment Variables

The system uses environment variables to maintain consistent paths across platforms:

| Variable                  | Set By                                                  | Purpose                                    | Typical Value                                                   |
| ------------------------- | ------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `SUPERPOWERS_SKILLS_ROOT` | `lib/initialize-skills.sh` (Claude Code) or CLI (Codex) | Root directory of cloned skills repository | `~/.config/superpowers/skills` or `~/.codex/superpowers/skills` |
| `CLAUDE_PLUGIN_ROOT`      | Claude Code platform                                    | Plugin installation directory              | Platform-specific                                               |

All path references in hooks, commands, and tools use `$SUPERPOWERS_SKILLS_ROOT` to locate skills, ensuring portability across installations.

**Sources:** [RELEASE-NOTES.md520-523](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L520-L523)

---

## Auto-Update Mechanism

Skills automatically update on every session start through `lib/initialize-skills.sh`:

### Update Logic Flow

```
```

**Divergence Handling:** When local changes prevent fast-forward merge, the system warns but continues with the current state. Users must manually sync using the `pulling-updates-from-skills-repository` skill.

**Sources:** [RELEASE-NOTES.md449-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L461) [RELEASE-NOTES.md497-500](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L497-L500)

---

## Platform-Specific Session Hooks

Each platform triggers the bootstrap sequence differently:

### Claude Code: Hook System

- **Trigger:** `hooks/session-start.sh` executed by Claude Code at session initialization
- **Mechanism:** Native plugin hook system
- **Bootstrap:** Hook output appears in session context
- **Tool Access:** Skills invoked via native Skill tool

### OpenCode: Event System

- **Trigger:** `session.created` event in `.opencode/plugin/superpowers.js`
- **Mechanism:** JavaScript event handler with `session.prompt(content, { noReply: true })`
- **Bootstrap:** Injected as system message with no reply expected
- **Tool Access:** Skills invoked via custom `use_skill` tool
- **Re-injection:** `session.compacted` event re-injects bootstrap after context compression

### Codex: CLI Bootstrap

- **Trigger:** Manual execution of `superpowers-codex bootstrap` command
- **Mechanism:** Command outputs bootstrap content for AGENTS.md inclusion
- **Bootstrap:** Statically included in project configuration
- **Tool Access:** Skills invoked via `use-skill` CLI command

**Sources:** [RELEASE-NOTES.md150-157](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L150-L157) [RELEASE-NOTES.md166-169](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L166-L169) [RELEASE-NOTES.md217-225](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L217-L225)

---

For detailed information on specific architectural subsystems, see:

- [Dual Repository Design](obra/superpowers/4.1-dual-repository-design.md) - Versioning strategy and auto-update details
- [Skills Repository Management](obra/superpowers/4.2-skills-repository-management.md) - Git workflow, forking, and manual sync
- [Multi-Platform Integration](obra/superpowers/4.3-multi-platform-integration.md) - Platform-specific implementation details
- [Session Lifecycle and Bootstrap](obra/superpowers/4.4-session-lifecycle-and-bootstrap.md) - Bootstrap content injection and context compaction
- [Skills Resolution and Priority](obra/superpowers/4.5-skills-resolution-and-priority.md) - Namespace prefixes and resolution order

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Architecture](#architecture.md)
- [Dual Repository Design](#dual-repository-design.md)
- [Repository Locations](#repository-locations.md)
- [Three-Tier Architecture](#three-tier-architecture.md)
- [Architectural Layers](#architectural-layers.md)
- [Platform Adapter Layer](#platform-adapter-layer.md)
- [Integration Mechanisms by Platform](#integration-mechanisms-by-platform.md)
- [Skills Storage and Resolution](#skills-storage-and-resolution.md)
- [Resolution Priority](#resolution-priority.md)
- [Skills Directory Structure](#skills-directory-structure.md)
- [Session Lifecycle and Bootstrap](#session-lifecycle-and-bootstrap.md)
- [Session Initialization Flow](#session-initialization-flow.md)
- [Key Code Components](#key-code-components.md)
- [Cross-Platform Compatibility](#cross-platform-compatibility.md)
- [Windows Compatibility Pattern](#windows-compatibility-pattern.md)
- [Shared Logic Pattern](#shared-logic-pattern.md)
- [Environment Variables](#environment-variables.md)
- [Auto-Update Mechanism](#auto-update-mechanism.md)
- [Update Logic Flow](#update-logic-flow.md)
- [Platform-Specific Session Hooks](#platform-specific-session-hooks.md)
- [Claude Code: Hook System](#claude-code-hook-system.md)
- [OpenCode: Event System](#opencode-event-system.md)
- [Codex: CLI Bootstrap](#codex-cli-bootstrap.md)
