# /obra/superpowers/2.3-installing-on-codex

Installing on Codex | obra/superpowers | DeepWiki

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

# Installing on Codex

Relevant source files

- [.codex/INSTALL.md](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md)
- [.codex/superpowers-bootstrap.md](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md)
- [.codex/superpowers-codex](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex)

This page covers the installation and initial configuration of Superpowers for Codex. Codex support is experimental and uses a CLI-based integration model rather than native plugin hooks. For Claude Code installation, see [Installing on Claude Code](obra/superpowers/2.1-installing-on-claude-code.md).

**Scope:** Manual repository cloning, `AGENTS.md` configuration, and bootstrap verification. For understanding platform differences, see [Platform Integrations](obra/superpowers/3.3-finding-and-invoking-skills.md). For session lifecycle details, see [Session Lifecycle and Bootstrap](#3.4.md).

## Prerequisites

- **Codex installed and running**
- **Git installed** (for cloning and updates)
- **Node.js installed** (the `superpowers-codex` script is a Node.js executable)
- **Terminal access** to run installation commands

Sources: [.codex/INSTALL.md1-35](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L1-L35)

## Installation Steps

### 1. Clone Superpowers Repository

Clone the repository to `~/.codex/superpowers`:

```
```

This creates the directory structure:

```
~/.codex/
├── superpowers/           # Cloned superpowers repository
│   ├── .codex/
│   │   ├── superpowers-codex           # Main CLI script
│   │   ├── superpowers-bootstrap.md    # Bootstrap instructions
│   │   └── INSTALL.md                  # Installation guide
│   └── skills/            # Superpowers skills (cloned from obra/superpowers-skills)
└── skills/                # Personal skills directory (to be created)
```

**Note:** The repository includes the skills as a subdirectory. Unlike Claude Code which clones skills to `~/.config/superpowers/skills/`, Codex installations keep skills within the cloned repository at `~/.codex/superpowers/skills/`.

Sources: [.codex/INSTALL.md7-12](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L7-L12)

### 2. Create Personal Skills Directory

```
```

Personal skills placed in `~/.codex/skills/` override superpowers skills when names match. This directory structure mirrors the superpowers skills layout:

```
~/.codex/skills/
├── skill-name-1/
│   └── SKILL.md
└── category-name/
    └── skill-name-2/
        └── SKILL.md
```

Sources: [.codex/INSTALL.md14-17](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L14-L17) [.codex/superpowers-codex11](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L11-L11)

### 3. Directory Structure Overview

**Installation Directory Structure:**

```
```

Sources: [.codex/superpowers-codex9-13](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L9-L13) [.codex/INSTALL.md7-17](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L7-L17)

## AGENTS.md Configuration

Edit or create `~/.codex/AGENTS.md` to trigger automatic bootstrap on session start. Add this section to the file:

```
```

This configuration instructs the agent to execute the bootstrap command immediately upon session start.

**Bootstrap Flow:**

```
```

Sources: [.codex/INSTALL.md19-26](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L19-L26) [.codex/superpowers-codex168-220](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L168-L220)

### Bootstrap Command Behavior

The `superpowers-codex bootstrap` command executes three main operations:

1. **Update Check** - Fetches from `origin` with 3-second timeout, checks if local is behind
2. **Bootstrap Instructions** - Displays tool mapping and skill usage rules from `superpowers-bootstrap.md`
3. **Skills Discovery** - Lists all available skills with metadata
4. **Auto-Load** - Automatically loads the `superpowers:using-superpowers` skill

Sources: [.codex/superpowers-codex168-220](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L168-L220) [.codex/superpowers-codex16-38](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L16-L38)

## Verification

Test the installation by running the bootstrap command manually:

```
```

**Expected output structure:**

1. **Update status** (if available):

   ```
   ## Update Available
   ⚠️  Your superpowers installation is behind the latest version.
   To update, run: `cd ~/.codex/superpowers && git pull`
   ```

2. **Bootstrap instructions** with tool mappings and critical rules

3. **Available skills list** with namespace prefixes:

   ```
   Available skills:
   ==================

   superpowers:brainstorming
     Use when starting any new development effort - refines ideas through...

   superpowers:test-driven-development
     Use when implementing any feature or fix - enforces RED-GREEN-REFACTOR...
   ```

4. **Auto-loaded using-superpowers skill** with mandatory protocol

Sources: [.codex/INSTALL.md28-35](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L28-L35) [.codex/superpowers-codex168-220](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L168-L220)

## Understanding the Integration

### CLI Script Architecture

**superpowers-codex Script Flow:**

```
```

Sources: [.codex/superpowers-codex1-388](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L1-L388)

### Skill Resolution Order

When loading a skill, the CLI searches in this order:

1. **Personal skills** (`~/.codex/skills/`) - Checked first if no namespace prefix
2. **Superpowers skills** (`~/.codex/superpowers/skills/`) - Fallback if not found in personal

**Resolution Logic:**

| Skill Reference             | Resolution Path                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| `superpowers:brainstorming` | `~/.codex/superpowers/skills/brainstorming/` (forced)                                       |
| `brainstorming`             | `~/.codex/skills/brainstorming/` → fallback to `~/.codex/superpowers/skills/brainstorming/` |
| `my-custom-skill`           | `~/.codex/skills/my-custom-skill/` only                                                     |

Sources: [.codex/superpowers-codex232-295](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L232-L295)

### CLI Commands Reference

| Command            | Purpose                         | Usage                                                   |
| ------------------ | ------------------------------- | ------------------------------------------------------- |
| `bootstrap`        | Complete session initialization | `superpowers-codex bootstrap`                           |
| `use-skill <name>` | Load and display a skill        | `superpowers-codex use-skill superpowers:brainstorming` |
| `find-skills`      | List all available skills       | `superpowers-codex find-skills`                         |

**Command Examples:**

```
```

Sources: [.codex/superpowers-codex363-388](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L363-L388) [.codex/superpowers-codex222-360](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L222-L360)

## Tool Mapping for Codex

Superpowers skills reference tools available in Claude Code. Codex requires mapping to equivalent functionality:

| Skill Reference                 | Claude Code Tool           | Codex Equivalent                                          |
| ------------------------------- | -------------------------- | --------------------------------------------------------- |
| `TodoWrite`                     | Native TodoWrite tool      | `update_plan` command                                     |
| `Skill` tool                    | Native Skill tool          | `~/.codex/superpowers/.codex/superpowers-codex use-skill` |
| `Task` tool with subagents      | Native subagent delegation | Manual work (notify user subagents unavailable)           |
| `Read`, `Write`, `Edit`, `Bash` | Native tools               | Codex native I/O tools                                    |
| `AskUserQuestion`               | Native user interaction    | Codex native user interaction                             |

**Critical Substitution Rules:**

- **TodoWrite → update\_plan**: When a skill says "create TodoWrite todos", use `update_plan` to track tasks
- **Subagents → Manual**: Skills requiring subagents (e.g., `subagent-driven-development`) must be adapted to manual execution
- **Skill tool → CLI command**: Every skill invocation translates to running the `superpowers-codex use-skill` command

Sources: [.codex/superpowers-bootstrap.md9-14](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L9-L14) [RELEASE-NOTES.md29-33](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L29-L33)

### Tool Mapping Example

**Skill instruction:**

```
Create TodoWrite todos for each checklist item
```

**Codex translation:**

```
Create update_plan entries for each checklist item
```

**Skill instruction:**

```
Use the Skill tool to load superpowers:systematic-debugging
```

**Codex translation:**

```
Run: ~/.codex/superpowers/.codex/superpowers-codex use-skill superpowers:systematic-debugging
```

Sources: [.codex/superpowers-bootstrap.md9-14](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L9-L14)

## Namespace Conventions

Skills use namespacing to distinguish between superpowers-provided and personal skills:

**Namespace Format:**

| Namespace      | Location                           | Example                              |
| -------------- | ---------------------------------- | ------------------------------------ |
| `superpowers:` | `~/.codex/superpowers/skills/`     | `superpowers:brainstorming`          |
| No prefix      | `~/.codex/skills/` (with fallback) | `brainstorming` or `my-custom-skill` |

**Override Behavior:**

When a personal skill and superpowers skill share the same name, the personal skill takes precedence:

```
# Both exist:
~/.codex/skills/brainstorming/SKILL.md
~/.codex/superpowers/skills/brainstorming/SKILL.md

# Without namespace: loads personal version
superpowers-codex use-skill brainstorming  → personal

# With namespace: forces superpowers version
superpowers-codex use-skill superpowers:brainstorming  → superpowers
```

Sources: [.codex/superpowers-codex232-243](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L232-L243) [.codex/superpowers-bootstrap.md16-19](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L16-L19)

## Updating Superpowers

The bootstrap command checks for updates automatically but does not auto-update. To update:

```
```

**Update Check Logic:**

The `checkForUpdates()` function uses a 3-second timeout to avoid blocking:

```
```

**Warning Display:**

```
## Update Available

⚠️  Your superpowers installation is behind the latest version.
To update, run: `cd ~/.codex/superpowers && git pull`
```

Sources: [.codex/superpowers-codex16-38](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L16-L38) [.codex/superpowers-codex173-182](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L173-L182)

## Troubleshooting

### Bootstrap Command Not Found

**Symptom:** `command not found: superpowers-codex`

**Solution:** Verify installation path and make script executable:

```
```

Sources: [.codex/superpowers-codex1](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L1-L1) [.codex/INSTALL.md28-35](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L28-L35)

### Node.js Not Available

**Symptom:** `/usr/bin/env: 'node': No such file or directory`

**Solution:** Install Node.js for your platform. The script uses the shebang `#!/usr/bin/env node`.

Sources: [.codex/superpowers-codex1](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L1-L1)

### Skills Not Loading

**Symptom:** Skills directory empty or skills not found

**Verification:**

```
```

**Solution:** If empty, the repository may not have been cloned correctly. Re-clone:

```
```

Sources: [.codex/superpowers-codex10](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L10-L10) [.codex/INSTALL.md7-12](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L7-L12)

### AGENTS.md Not Triggering Bootstrap

**Symptom:** Agent doesn't run bootstrap on session start

**Verification:** Confirm `AGENTS.md` contains the required section with correct path:

```
```

**Common Issues:**

- Incorrect path (missing `.codex` directory in path)
- Missing `<EXTREMELY_IMPORTANT>` tags
- Typo in command

Sources: [.codex/INSTALL.md19-26](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L19-L26)

### Update Check Hangs

**Symptom:** Bootstrap command takes too long or appears frozen

**Cause:** Network timeout when checking for updates. The script uses a 3-second timeout but may still appear slow on very poor connections.

**Workaround:** The script will proceed after timeout. For offline use, disable the update check by commenting out the update check section in the script (not recommended).

Sources: [.codex/superpowers-codex16-38](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L16-L38)

## Platform Differences Summary

| Feature          | Claude Code                     | Codex                               |
| ---------------- | ------------------------------- | ----------------------------------- |
| Installation     | Marketplace plugin              | Manual repository clone             |
| Session Start    | Automatic hook                  | Manual `AGENTS.md` configuration    |
| Skill Invocation | Native `Skill` tool             | CLI command via `superpowers-codex` |
| Tool Support     | Full (TodoWrite, subagents)     | Partial (requires mapping)          |
| Updates          | Auto-check and fast-forward     | Manual `git pull`                   |
| Skills Location  | `~/.config/superpowers/skills/` | `~/.codex/superpowers/skills/`      |
| Personal Skills  | `~/.claude/skills/`             | `~/.codex/skills/`                  |

For detailed platform comparison, see [Platform Integrations](obra/superpowers/3.3-finding-and-invoking-skills.md).

Sources: [RELEASE-NOTES.md18-40](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L18-L40)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Installing on Codex](#installing-on-codex.md)
- [Prerequisites](#prerequisites.md)
- [Installation Steps](#installation-steps.md)
- [1. Clone Superpowers Repository](#1-clone-superpowers-repository.md)
- [2. Create Personal Skills Directory](#2-create-personal-skills-directory.md)
- [3. Directory Structure Overview](#3-directory-structure-overview.md)
- [AGENTS.md Configuration](#agentsmd-configuration.md)
- [Bootstrap Command Behavior](#bootstrap-command-behavior.md)
- [Verification](#verification.md)
- [Understanding the Integration](#understanding-the-integration.md)
- [CLI Script Architecture](#cli-script-architecture.md)
- [Skill Resolution Order](#skill-resolution-order.md)
- [CLI Commands Reference](#cli-commands-reference.md)
- [Tool Mapping for Codex](#tool-mapping-for-codex.md)
- [Tool Mapping Example](#tool-mapping-example.md)
- [Namespace Conventions](#namespace-conventions.md)
- [Updating Superpowers](#updating-superpowers.md)
- [Troubleshooting](#troubleshooting.md)
- [Bootstrap Command Not Found](#bootstrap-command-not-found.md)
- [Node.js Not Available](#nodejs-not-available.md)
- [Skills Not Loading](#skills-not-loading.md)
- [AGENTS.md Not Triggering Bootstrap](#agentsmd-not-triggering-bootstrap.md)
- [Update Check Hangs](#update-check-hangs.md)
- [Platform Differences Summary](#platform-differences-summary.md)
