# /obra/superpowers/10-technical-reference

Technical Reference | obra/superpowers | DeepWiki

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

# Technical Reference

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)

This page documents low-level technical implementation details for the Superpowers plugin infrastructure. It covers file system layouts, configuration formats, environment variables, and cross-platform compatibility patterns used in the plugin shim. For conceptual architecture, see [Architecture](obra/superpowers/4-architecture.md). For platform-specific integration details, see [Platform-Specific Features](obra/superpowers/5-platform-specific-features.md).

## Overview

The Superpowers plugin operates as a lightweight shim that manages a local clone of the skills repository. The plugin itself contains minimal code—primarily hooks, initialization scripts, and platform-specific integration modules. The actual skills content lives in a separate Git repository that is cloned and managed locally.

This separation creates distinct technical domains:

- **Plugin infrastructure**: Installation, session lifecycle, platform integration
- **Skills repository**: Skill content, supporting scripts, skill metadata
- **Local configuration**: User-specific settings, personal skills, project overrides

**Sources:** [RELEASE-NOTES.md408-424](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L408-L424)

---

## File System Layout

### Plugin Directory Structure

The plugin installation varies by platform but follows a consistent internal organization:

**Directory Structure: Claude Code Platform**

```
```

**Sources:** [RELEASE-NOTES.md550-565](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L550-L565) [plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/plugin.json#L1-L13) [marketplace.json1-20](https://github.com/obra/superpowers/blob/a01a135f/marketplace.json#L1-L20)

### Skills Repository Locations

The skills repository clone location varies by platform. The plugin manages three-tier priority for skill resolution:

| Platform    | Skills Repository Path          | Personal Skills Path                  | Project Skills Path |
| ----------- | ------------------------------- | ------------------------------------- | ------------------- |
| Claude Code | `~/.config/superpowers/skills/` | `~/.claude/skills/`                   | `.claude/skills/`   |
| OpenCode    | `~/.config/opencode/skills/`    | `~/.config/opencode/personal-skills/` | `.opencode/skills/` |
| Codex       | `~/.codex/superpowers/skills/`  | `~/.codex/skills/`                    | `.codex/skills/`    |

**Priority Resolution:** Project → Personal → Superpowers (searched in order until skill found)

**Sources:** [RELEASE-NOTES.md165-170](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L165-L170) [RELEASE-NOTES.md220-221](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L220-L221)

### Skills Repository Internal Structure

```
```

**Sources:** [RELEASE-NOTES.md463-501](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L463-L501)

---

## Configuration Files

### plugin.json

Primary plugin manifest for Claude Code marketplace integration:

[.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13)

**Key Fields:**

- `name`: Plugin identifier (`"superpowers"`)
- `version`: Semantic version tracking (current: `"4.0.3"`)
- `description`: Marketplace listing description
- `repository`: GitHub source URL for plugin updates
- `keywords`: Searchable tags for marketplace discovery

**Sources:** [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13)

### marketplace.json

Development marketplace configuration for local testing:

[.claude-plugin/marketplace.json1-20](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json#L1-L20)

**Purpose:** Enables plugin installation from local directory during development using `/plugin marketplace add` workflow.

**Sources:** [.claude-plugin/marketplace.json1-20](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json#L1-L20) [RELEASE-NOTES.md551-553](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L551-L553)

### Session Hook Configuration

Session hooks are configured via platform-specific mechanisms:

**Claude Code:** `hooks/session-start.sh` automatically executed at session creation **OpenCode:** Event handlers in `SuperpowersPlugin.js` respond to `session.created` and `session.compacted` events **Codex:** Bootstrap content injected via `AGENTS.md` configuration

The session start hook performs:

1. Execute `lib/initialize-skills.sh` to check for updates
2. Load `using-superpowers/SKILL.md` content
3. Generate skills list with paths
4. Inject bootstrap context into session

**Sources:** [RELEASE-NOTES.md513-519](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L513-L519) [RELEASE-NOTES.md147-157](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L147-L157)

### Agent Definitions

Agent configurations use YAML frontmatter + markdown format:

[agents/code-reviewer.md1-6](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L6)

**Structure:**

- **Frontmatter:** `name`, `description` (with triggering examples), `model`
- **Content:** System prompt defining agent behavior and protocols

The `superpowers:code-reviewer` agent is namespaced and bundled with the plugin, making it universally available without user configuration.

**Sources:** [agents/code-reviewer.md1-48](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L48) [RELEASE-NOTES.md282-292](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L282-L292)

---

## Environment Variables

### CLAUDE\_PLUGIN\_ROOT / PLUGIN\_DIR

**Purpose:** Absolute path to the plugin installation directory

**Platform Variations:**

```
```

**Usage Locations:**

- Hook scripts for locating `lib/` utilities
- Command redirects for skill path resolution
- Initialization scripts for relative path calculations

**Sources:** [RELEASE-NOTES.md142-144](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L142-L144) [RELEASE-NOTES.md403-405](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L403-L405)

### SUPERPOWERS\_SKILLS\_ROOT

**Purpose:** Absolute path to the skills repository clone

**Default Values:**

```
```

**Usage:** All skill path references resolve through this variable to support platform-specific locations.

**Sources:** [RELEASE-NOTES.md520-524](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L520-L524) [RELEASE-NOTES.md561-565](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L561-L565)

---

## Implementation Patterns

### Polyglot Hook Wrapper

**Pattern: Cross-Platform Shell Script Execution**

The `run-hook.cmd` file implements a CMD/Bash polyglot that enables shell scripts to execute on Windows via `.cmd` extension:

```
```

**Key Implementation Detail:**

The pattern uses:

1. **Windows path:** Lines 1-8 contain CMD batch syntax with `@CMDBLOCK` marker
2. **Unix path:** Shebang line and POSIX shell syntax execute bash
3. **Fallback handling:** Uses `$0` instead of `${BASH_SOURCE[0]}` for POSIX compatibility

**Critical Fix (v3.6.2):** Changed from bash-specific `${BASH_SOURCE[0]:-$0}` to POSIX `$0` to support systems where `/bin/sh` is dash (Ubuntu/Debian).

**Sources:** [RELEASE-NOTES.md139-145](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L139-L145)

### Skills Repository Initialization

**Pattern: Clone-On-Demand with Auto-Update**

The `lib/initialize-skills.sh` script implements:

**Initialization Flow**

```
```

**State Detection Logic:**

- **Behind:** `git merge-base --is-ancestor HEAD upstream/main` → auto-merge
- **Ahead:** `git merge-base --is-ancestor upstream/main HEAD` → skip update
- **Diverged:** Neither ancestor check passes → warn user

**Sources:** [RELEASE-NOTES.md450-460](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L450-L460) [RELEASE-NOTES.md394-405](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L394-L405)

### Multi-Platform Tool Abstraction

**Pattern: Shared Core with Platform Adapters**

The `lib/skills-core.js` module provides common functionality used by both OpenCode and Codex:

**Shared Functions:**

- `extractFrontmatter(content)`: Parse YAML frontmatter from skill files
- `stripFrontmatter(content)`: Remove frontmatter for display
- `findSkillsInDir(dir)`: Recursively discover SKILL.md files
- `resolveSkillPath(skillName, searchDirs)`: Resolve skill by priority

**Platform Adapters:**

- **OpenCode:** `SuperpowersPlugin.js` imports as ES module, registers custom tools
- **Codex:** `superpowers-codex` imports via Node.js interop, provides CLI commands

**Sources:** [RELEASE-NOTES.md176-181](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L176-L181)

---

## Version History Reference

### Current Version: v4.0.3

**Major Version Categories:**

| Version | Focus                 | Key Changes                                                 |
| ------- | --------------------- | ----------------------------------------------------------- |
| v4.0.x  | Skill Strengthening   | Explicit request handling, two-stage review, DOT flowcharts |
| v3.x    | Platform Expansion    | OpenCode support, Codex support, session hook refactoring   |
| v2.0    | Repository Separation | Skills moved to obra/superpowers-skills, fork workflow      |
| v1.x    | Monolithic Plugin     | (Pre-separation era)                                        |

**Sources:** [RELEASE-NOTES.md1-639](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L1-L639)

### Breaking Changes Archive

**v4.0.0 Breaking Changes:**

- Skill consolidation: `root-cause-tracing`, `defense-in-depth`, `condition-based-waiting` bundled into `systematic-debugging`
- `testing-skills-with-subagents` bundled into `writing-skills`
- `testing-anti-patterns` bundled into `test-driven-development`
- `sharing-skills` removed (obsolete)

**v3.0.1 Breaking Changes:**

- Migration to Anthropic's first-party skills system
- Skill tool replaces Read tool for skill invocation

**v2.0.0 Breaking Changes:**

- Skills repository separated to obra/superpowers-skills
- Personal superpowers overlay system removed
- `setup-personal-superpowers` hook removed
- Skills directory moved from plugin to `~/.config/superpowers/skills/`

**Sources:** [RELEASE-NOTES.md121-128](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L121-L128) [RELEASE-NOTES.md389-390](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L389-L390) [RELEASE-NOTES.md420-444](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L420-L444)

### Migration Handling

**v2.0 Migration Logic:**

```
```

**Backup Locations:**

- Old Git metadata: `~/.config/superpowers/.git.bak`
- Old skills: `~/.config/superpowers/skills.bak`

**Sources:** [RELEASE-NOTES.md434-440](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L434-L440)

### Release Cadence

**Recent Release Pattern:**

```
```

**Pattern:** Rapid iteration with frequent patch releases for platform compatibility and skill refinements.

**Sources:** [RELEASE-NOTES.md1-240](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L1-L240)

---

## Configuration Reference Tables

### Slash Command Configuration

Slash commands are defined in `commands/` directory with YAML frontmatter:

| Command         | Skill Reference               | Model Invocation  | Purpose                        |
| --------------- | ----------------------------- | ----------------- | ------------------------------ |
| `/brainstorm`   | `superpowers:brainstorming`   | Disabled (v4.0.2) | User-initiated design session  |
| `/write-plan`   | `superpowers:writing-plans`   | Disabled (v4.0.2) | User-initiated task planning   |
| `/execute-plan` | `superpowers:executing-plans` | Disabled (v4.0.2) | User-initiated batch execution |

**Note:** `disable-model-invocation: true` prevents Claude from invoking slash commands; only manual user invocation allowed. The underlying skills remain available for autonomous invocation.

**Sources:** [RELEASE-NOTES.md22-29](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L22-L29)

### Skill Metadata Format

Every skill contains YAML frontmatter in `SKILL.md`:

```
```

**Critical Fields:**

- `name`: Must match directory name (lowercase kebab-case)
- `description`: Claude Search Optimization (CSO) field—triggers skill discovery, must not contain workflow summaries

**Sources:** [RELEASE-NOTES.md329-336](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L329-L336) [RELEASE-NOTES.md107-111](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L107-L111)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Technical Reference](#technical-reference.md)
- [Overview](#overview.md)
- [File System Layout](#file-system-layout.md)
- [Plugin Directory Structure](#plugin-directory-structure.md)
- [Skills Repository Locations](#skills-repository-locations.md)
- [Skills Repository Internal Structure](#skills-repository-internal-structure.md)
- [Configuration Files](#configuration-files.md)
- [plugin.json](#pluginjson.md)
- [marketplace.json](#marketplacejson.md)
- [Session Hook Configuration](#session-hook-configuration.md)
- [Agent Definitions](#agent-definitions.md)
- [Environment Variables](#environment-variables.md)
- [CLAUDE\_PLUGIN\_ROOT / PLUGIN\_DIR](#claude_plugin_root-plugin_dir.md)
- [SUPERPOWERS\_SKILLS\_ROOT](#superpowers_skills_root.md)
- [Implementation Patterns](#implementation-patterns.md)
- [Polyglot Hook Wrapper](#polyglot-hook-wrapper.md)
- [Skills Repository Initialization](#skills-repository-initialization.md)
- [Multi-Platform Tool Abstraction](#multi-platform-tool-abstraction.md)
- [Version History Reference](#version-history-reference.md)
- [Current Version: v4.0.3](#current-version-v403.md)
- [Breaking Changes Archive](#breaking-changes-archive.md)
- [Migration Handling](#migration-handling.md)
- [Release Cadence](#release-cadence.md)
- [Configuration Reference Tables](#configuration-reference-tables.md)
- [Slash Command Configuration](#slash-command-configuration.md)
- [Skill Metadata Format](#skill-metadata-format.md)
