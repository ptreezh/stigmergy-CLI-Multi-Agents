# /obra/superpowers/10.2-configuration-files

Configuration Files | obra/superpowers | DeepWiki

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

# Configuration Files

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [.gitignore](https://github.com/obra/superpowers/blob/a01a135f/.gitignore)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [docs/windows/polyglot-hooks.md](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md)
- [hooks/hooks.json](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json)
- [hooks/run-hook.cmd](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd)
- [hooks/session-start.sh](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh)

This document provides a technical reference for all configuration files used by the Superpowers system across its three platform integrations (Claude Code, OpenCode, Codex). These configuration files control plugin metadata, marketplace registration, agent definitions, skill metadata, and integration behavior.

For information about directory structure and where these files are located, see [Directory Structure](obra/superpowers/10.1-directory-structure.md). For environment variables that affect configuration behavior, see [Environment Variables](obra/superpowers/10.3-environment-variables.md).

## Overview of Configuration Files

The Superpowers system uses different configuration files depending on the platform and component:

| Configuration File | Platform      | Purpose                            | Location                  |
| ------------------ | ------------- | ---------------------------------- | ------------------------- |
| `plugin.json`      | Claude Code   | Plugin metadata and version        | `.claude-plugin/`         |
| `marketplace.json` | Claude Code   | Marketplace listing                | `.claude-plugin/`         |
| `AGENTS.md`        | Codex         | Agent definitions with frontmatter | `.codex/` or project root |
| `*.md` (agents)    | Claude Code   | Agent definitions with frontmatter | `agents/` directory       |
| `SKILL.md`         | All platforms | Skill metadata and content         | Within skill directories  |

## Configuration File Relationships

```
```

**Sources:** [.claude-plugin/plugin.json1-14](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L14) [.claude-plugin/marketplace.json1-21](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json#L1-L21) [agents/code-reviewer.md1-48](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L48)

## Claude Code Plugin Configuration

### plugin.json

The `plugin.json` file defines the plugin metadata for Claude Code marketplace registration. It is read by Claude Code at plugin installation and activation.

**Structure:**

[.claude-plugin/plugin.json1-14](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L14)

| Field         | Type   | Required | Description                                       |
| ------------- | ------ | -------- | ------------------------------------------------- |
| `name`        | string | Yes      | Plugin identifier (must be unique in marketplace) |
| `description` | string | Yes      | Human-readable plugin description                 |
| `version`     | string | Yes      | Semantic version (major.minor.patch)              |
| `author`      | object | Yes      | Author metadata with `name` and `email`           |
| `homepage`    | string | Yes      | URL to plugin homepage/documentation              |
| `repository`  | string | Yes      | URL to source code repository                     |
| `license`     | string | Yes      | SPDX license identifier                           |
| `keywords`    | array  | No       | Array of keyword strings for discoverability      |

**Example:**

```
```

**Sources:** [.claude-plugin/plugin.json1-14](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L14)

### marketplace.json

The `marketplace.json` file defines marketplace-level metadata and can list multiple plugins. This is used when distributing plugins through a custom Claude Code marketplace.

**Structure:**

[.claude-plugin/marketplace.json1-21](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json#L1-L21)

| Field         | Type   | Required | Description                                                           |
| ------------- | ------ | -------- | --------------------------------------------------------------------- |
| `name`        | string | Yes      | Marketplace identifier                                                |
| `description` | string | Yes      | Marketplace description                                               |
| `owner`       | object | Yes      | Marketplace owner with `name` and `email`                             |
| `plugins`     | array  | Yes      | Array of plugin objects (same structure as plugin.json plus `source`) |

**Plugin Object in Marketplace:**

| Field         | Type   | Required | Description                          |
| ------------- | ------ | -------- | ------------------------------------ |
| `name`        | string | Yes      | Plugin name (must match plugin.json) |
| `description` | string | Yes      | Plugin description                   |
| `version`     | string | Yes      | Plugin version                       |
| `source`      | string | Yes      | Relative path to plugin directory    |
| `author`      | object | Yes      | Plugin author metadata               |

**Example:**

```
```

**Sources:** [.claude-plugin/marketplace.json1-21](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json#L1-L21)

## Agent Configuration

### Agent Frontmatter Format

Agent definitions use YAML frontmatter at the beginning of markdown files. The frontmatter block is delimited by `---` markers and contains structured metadata.

**Agent Frontmatter Structure:**

```
```

**Frontmatter Fields:**

| Field         | Type   | Required | Description                                                       |
| ------------- | ------ | -------- | ----------------------------------------------------------------- |
| `name`        | string | Yes      | Agent identifier (used for invocation)                            |
| `description` | string | Yes      | Usage instructions including when to use the agent, with examples |

**Example from code-reviewer Agent:**

[agents/code-reviewer.md1-5](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L5)

```
```

**Description Field Best Practices:**

The `description` field should include:

1. **When to use the agent** - Clear trigger conditions
2. **Example scenarios** - Wrapped in `<example>` tags with context, user input, assistant response, and `<commentary>` explaining the decision
3. **Multi-line formatting** - Use YAML pipe (`|`) for multi-line descriptions

**Sources:** [agents/code-reviewer.md1-5](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L5)

## Skill Configuration

### SKILL.md Frontmatter Format

Every skill must have a `SKILL.md` file with YAML frontmatter. The frontmatter is parsed by `extractFrontmatter` function in [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js)

**Skill Frontmatter Structure:**

```
```

**Required Frontmatter Fields:**

| Field         | Type   | Required | Description                                        | Example                                                                     |
| ------------- | ------ | -------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| `name`        | string | Yes      | Skill identifier (kebab-case)                      | `test-driven-development`                                                   |
| `description` | string | Yes      | When to use this skill, written in imperative form | `Use when implementing new code - ensures test coverage and design quality` |

**Optional Frontmatter Fields:**

Additional fields may be added for future extensibility, but are not currently processed by the system.

**Example from Installation Documentation:**

[.opencode/INSTALL.md61-66](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L61-L66)

```
```

**Frontmatter Parsing Rules:**

1. **Delimiter:** Frontmatter must start and end with `---` on separate lines
2. **Format:** Valid YAML syntax
3. **Name format:** Kebab-case (lowercase with hyphens)
4. **Description format:** Should start with "Use when..." for consistency
5. **Content separation:** At least one blank line should separate frontmatter from content

**Example Complete Skill Structure:**

```
```

**Sources:** [.opencode/INSTALL.md61-95](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L61-L95)

## Skill Resolution Configuration Paths

Skills are discovered from three priority tiers, with each tier having platform-specific paths:

```
```

**Configuration Hierarchy:**

1. **Project skills** override personal and superpowers skills
2. **Personal skills** override superpowers skills
3. **Superpowers skills** provide system defaults

Each skill directory must contain a `SKILL.md` file with proper frontmatter.

**Sources:** [.opencode/INSTALL.md74-101](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L74-L101)

## Platform-Specific Configuration Files

### Codex AGENTS.md

The Codex platform uses an `AGENTS.md` file for agent configuration. This file is referenced in the installation documentation and bootstrap command.

**Expected Location:** `.codex/AGENTS.md` or project root

**Structure:** The file should define which agents are available and how to invoke them. While the exact format is not shown in the provided files, it follows a markdown-based structure similar to skill definitions.

### OpenCode Plugin Configuration

OpenCode uses a JavaScript-based plugin system. The plugin file is located at:

**Location:** `.opencode/plugin/superpowers.js`

**Discovery:** OpenCode discovers plugins via symlink from `~/.config/opencode/plugin/superpowers.js` to the plugin implementation.

[.opencode/INSTALL.md20-25](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L20-L25)

The plugin file exports tool definitions and event handlers, but its configuration is code-based rather than declarative.

**Sources:** [.opencode/INSTALL.md20-25](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L20-L25)

## Polyglot Hook Wrapper Configuration

### run-hook.cmd

The `run-hook.cmd` file is a polyglot script that works on both Windows and Unix systems.

**Location:** `hooks/run-hook.cmd`

**Structure:**

[hooks/run-hook.cmd1-20](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L20)

The file uses a clever technique:

1. **Lines 1-13:** Windows batch script wrapped in bash heredoc syntax (ignored by bash)
2. **Lines 15-20:** Unix shell script (ignored by Windows CMD)

**Windows Section:**

- Validates script name argument
- Executes bash.exe from Git installation
- Passes all arguments to the target script

**Unix Section:**

- Determines script directory
- Shifts arguments to remove script name
- Executes target script with remaining arguments

**Usage Pattern:**

```
```

This allows the same hook wrapper to be referenced in Claude Code configuration regardless of platform.

**Sources:** [hooks/run-hook.cmd1-20](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L20)

## Configuration File Validation

### Validation Requirements

| Configuration File   | Validation Mechanism   | When Validated           |
| -------------------- | ---------------------- | ------------------------ |
| `plugin.json`        | Claude Code parser     | Plugin installation      |
| `marketplace.json`   | Claude Code parser     | Marketplace registration |
| Agent frontmatter    | YAML parser            | Agent invocation         |
| SKILL.md frontmatter | `extractFrontmatter()` | Skill discovery/loading  |

### Common Configuration Errors

**plugin.json / marketplace.json:**

- Missing required fields (`name`, `version`, `author`)
- Invalid semantic version format
- Duplicate plugin names in marketplace

**Agent frontmatter:**

- Invalid YAML syntax
- Missing `name` or `description` fields
- Unclosed YAML frontmatter delimiters

**SKILL.md frontmatter:**

- Missing frontmatter delimiters (`---`)
- Invalid YAML syntax
- Missing required `name` or `description` fields
- Name not in kebab-case format

**Sources:** [.claude-plugin/plugin.json1-14](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L14) [agents/code-reviewer.md1-5](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L5) [.opencode/INSTALL.md61-66](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L61-L66)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Configuration Files](#configuration-files.md)
- [Overview of Configuration Files](#overview-of-configuration-files.md)
- [Configuration File Relationships](#configuration-file-relationships.md)
- [Claude Code Plugin Configuration](#claude-code-plugin-configuration.md)
- [plugin.json](#pluginjson.md)
- [marketplace.json](#marketplacejson.md)
- [Agent Configuration](#agent-configuration.md)
- [Agent Frontmatter Format](#agent-frontmatter-format.md)
- [Skill Configuration](#skill-configuration.md)
- [SKILL.md Frontmatter Format](#skillmd-frontmatter-format.md)
- [Skill Resolution Configuration Paths](#skill-resolution-configuration-paths.md)
- [Platform-Specific Configuration Files](#platform-specific-configuration-files.md)
- [Codex AGENTS.md](#codex-agentsmd.md)
- [OpenCode Plugin Configuration](#opencode-plugin-configuration.md)
- [Polyglot Hook Wrapper Configuration](#polyglot-hook-wrapper-configuration.md)
- [run-hook.cmd](#run-hookcmd.md)
- [Configuration File Validation](#configuration-file-validation.md)
- [Validation Requirements](#validation-requirements.md)
- [Common Configuration Errors](#common-configuration-errors.md)
