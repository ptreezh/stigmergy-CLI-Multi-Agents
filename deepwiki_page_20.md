# /obra/superpowers/5.3-codex:-cli-tool

Codex: CLI Tool | obra/superpowers | DeepWiki

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

# Codex CLI Tool

Relevant source files

- [.codex/INSTALL.md](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md)
- [.codex/superpowers-bootstrap.md](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md)
- [.codex/superpowers-codex](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex)

## Purpose and Scope

This document details the `superpowers-codex` CLI tool, which provides experimental Codex platform support for the Superpowers system. The CLI implements three core commands (`bootstrap`, `use-skill`, `find-skills`) and handles skill discovery, loading, and namespace resolution for Codex environments.

For platform comparison and architectural differences between Claude Code and Codex integration, see [Platform Integrations](obra/superpowers/3.3-finding-and-invoking-skills.md). For installation instructions, see [Installing on Codex](obra/superpowers/2.2-installing-on-opencode.md). For general skill discovery concepts, see [Skills Discovery System](obra/superpowers/4.4-session-lifecycle-and-bootstrap.md).

---

## Overview

The `superpowers-codex` script is a unified Node.js CLI tool located at [.codex/superpowers-codex1-388](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L1-L388) It bridges the Codex platform to the Superpowers skills system without native plugin support. Unlike Claude Code's hook-based integration, Codex requires manual invocation through the `AGENTS.md` bootstrap mechanism.

### Command Summary

| Command            | Purpose                                                                                                                         | Typical Usage                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `bootstrap`        | Complete session initialization with update check, bootstrap instructions, skill listings, and auto-load of `using-superpowers` | Called once per session via `AGENTS.md`  |
| `use-skill <name>` | Load and display a specific skill's content                                                                                     | Called when agent needs to apply a skill |
| `find-skills`      | List all available skills with metadata                                                                                         | Discovery and reference lookup           |

Sources: [.codex/superpowers-codex1-388](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L1-L388)

---

## Directory Structure

The Codex integration uses a distinct directory layout from Claude Code to avoid conflicts:

```
~/.codex/
├── superpowers/                    # Main repository clone
│   ├── .codex/
│   │   ├── superpowers-codex      # CLI tool (executable)
│   │   ├── superpowers-bootstrap.md # Bootstrap instructions
│   │   └── INSTALL.md             # Installation guide
│   └── skills/                    # Skills repository clone (auto-managed)
│       ├── brainstorming/
│       ├── systematic-debugging/
│       └── ...
└── skills/                        # Personal skills directory
    ├── my-custom-skill/
    └── ...
```

The tool references these paths via constants [.codex/superpowers-codex8-13](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L8-L13):

- `superpowersSkillsDir`: `~/.codex/superpowers/skills`
- `personalSkillsDir`: `~/.codex/skills`
- `bootstrapFile`: `~/.codex/superpowers/.codex/superpowers-bootstrap.md`
- `superpowersRepoDir`: `~/.codex/superpowers`

Sources: [.codex/superpowers-codex8-13](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L8-L13) [.codex/INSTALL.md1-35](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L1-L35)

---

## Command Architecture

### Command Dispatch Flow

```
```

**Diagram 1: Command Architecture and Execution Flow**

The CLI uses a simple switch statement [.codex/superpowers-codex366-387](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L366-L387) to dispatch commands. Each command is implemented as a standalone function with no shared state between invocations.

Sources: [.codex/superpowers-codex362-388](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L362-L388) [.codex/superpowers-codex133-166](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L133-L166) [.codex/superpowers-codex168-220](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L168-L220) [.codex/superpowers-codex222-360](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L222-L360)

---

## Skill Resolution Algorithm

### Namespace and Priority Rules

The tool implements a two-tier namespace system with override behavior:

1. **Personal Skills** (`~/.codex/skills/`): No namespace prefix, highest priority
2. **Superpowers Skills** (`~/.codex/superpowers/skills/`): `superpowers:` prefix, fallback priority

When a skill name is requested without a namespace prefix, personal skills are checked first. If not found, superpowers skills are searched. This allows users to override default skills with custom implementations.

### Resolution Flow Diagram

```
```

**Diagram 2: Skill Name Resolution and Loading Algorithm**

Sources: [.codex/superpowers-codex232-304](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L232-L304)

### Resolution Implementation Details

The resolution logic [.codex/superpowers-codex232-304](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L232-L304) implements these steps:

1. **Namespace Detection**: If skill name starts with `superpowers:`, strip prefix and set `forceSuperpowers = true`
2. **Path Stripping**: Remove any `skills/` prefix from the path [.codex/superpowers-codex244-247](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L244-L247)
3. **Personal Skills Check**: If not forced to superpowers, search `personalSkillsDir` first [.codex/superpowers-codex274-283](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L274-L283)
4. **Superpowers Fallback**: If not found in personal, search `superpowersSkillsDir` [.codex/superpowers-codex286-294](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L286-L294)
5. **File Lookup**: The `findSkillFile()` function checks for `SKILL.md` in the resolved directory [.codex/superpowers-codex249-263](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L249-L263)

### Example Resolution Paths

| Input                       | Resolution Path                       | Result                                                                                           |
| --------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `brainstorming`             | Personal → Superpowers                | `~/.codex/skills/brainstorming/SKILL.md` OR `~/.codex/superpowers/skills/brainstorming/SKILL.md` |
| `superpowers:brainstorming` | Superpowers only                      | `~/.codex/superpowers/skills/brainstorming/SKILL.md`                                             |
| `my-custom-skill`           | Personal → Superpowers                | `~/.codex/skills/my-custom-skill/SKILL.md` (personal only)                                       |
| `skills/brainstorming`      | Strip prefix → Personal → Superpowers | Same as `brainstorming`                                                                          |

Sources: [.codex/superpowers-codex222-304](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L222-L304)

---

## Bootstrap Command

### Bootstrap Sequence

```
```

**Diagram 3: Bootstrap Command Execution Sequence**

Sources: [.codex/superpowers-codex168-220](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L168-L220)

### Update Checking Mechanism

The `checkForUpdates()` function [.codex/superpowers-codex16-38](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L16-L38) performs a lightweight Git status check:

1. **Fetch Remote**: `git fetch origin` with 3-second timeout
2. **Parse Status**: Check `git status --porcelain=v1 --branch` output for `<FileRef file-url="https://github.com/obra/superpowers/blob/a01a135f/behind `indicator\n3. **Graceful Failure**#LNaN-LNaN" NaN file-path="behind `indicator\n3. **Graceful Failure**">Hii</FileRef> ensures bootstrap doesn't hang on network issues. This is critical because bootstrap runs automatically on every session start via`AGENTS.md\`.

### Bootstrap Output Structure

The bootstrap command outputs four sections:

1. **Update Warning** (conditional): Displayed if repository is behind remote [.codex/superpowers-codex174-182](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L174-L182)
2. **Bootstrap Instructions**: Content from `superpowers-bootstrap.md` [.codex/superpowers-codex185-197](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L185-L197) Includes tool mappings and critical rules
3. **Available Skills**: Complete skill listing via `runFindSkills()` [.codex/superpowers-codex199-202](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L199-L202)
4. **Auto-loaded Skill**: The `using-superpowers` skill content [.codex/superpowers-codex208-211](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L208-L211) which contains the Mandatory First Response Protocol

Sources: [.codex/superpowers-codex168-220](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L168-L220) [.codex/superpowers-bootstrap.md1-33](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L1-L33)

---

## Use-Skill Command

### Skill Loading Process

The `runUseSkill(skillName)` command [.codex/superpowers-codex222-360](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L222-L360) loads and displays a specific skill:

| Step                      | Function                                                                                                                | Description                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1. Namespace Parsing      | [.codex/superpowers-codex232-242](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L232-L242) | Strip `superpowers:` prefix if present                        |
| 2. Path Resolution        | [.codex/superpowers-codex249-304](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L249-L304) | Search personal → superpowers directories                     |
| 3. Frontmatter Extraction | [.codex/superpowers-codex307-338](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L307-L338) | Parse YAML frontmatter (`name`, `description`, `when_to_use`) |
| 4. Content Separation     | [.codex/superpowers-codex312-333](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L312-L333) | Split frontmatter from skill body                             |
| 5. Formatted Output       | [.codex/superpowers-codex340-359](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L340-L359) | Display header with metadata + skill content                  |

### Frontmatter Extraction

The `extractFrontmatter(filePath)` function [.codex/superpowers-codex40-74](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L40-L74) parses YAML frontmatter delimited by `---` markers:

```
---
name: Skill Name
description: Brief description
when_to_use: When to apply this skill
---

# Skill Content Begins Here
```

The parser reads line-by-line, extracting key-value pairs until the closing `---` marker [.codex/superpowers-codex50-68](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L50-L68) This metadata is used for skill listings and display headers.

### Output Format

The use-skill command outputs a formatted skill document [.codex/superpowers-codex340-359](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L340-L359):

```
```

This format provides context before the actual skill instructions, helping agents understand the skill's purpose before execution.

Sources: [.codex/superpowers-codex222-360](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L222-L360) [.codex/superpowers-codex40-74](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L40-L74)

---

## Find-Skills Command

### Skill Discovery Algorithm

```
```

**Diagram 4: Find-Skills Discovery and Deduplication Algorithm**

Sources: [.codex/superpowers-codex133-166](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L133-L166)

### Directory Scanning

The `findSkillsInDir(dir, sourceType, maxDepth)` function [.codex/superpowers-codex97-130](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L97-L130) recursively searches directories for skills:

1. **Directory Traversal**: Recursively scan up to `maxDepth` levels [.codex/superpowers-codex102-126](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L102-L126)

2. **Skill Detection**: A directory is a skill if it contains `SKILL.md` [.codex/superpowers-codex113-114](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L113-L114)

3. **Depth Limits**:

   - Personal skills: `maxDepth = 2` to support category/skill structure [.codex/superpowers-codex118-120](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L118-L120)
   - Superpowers skills: `maxDepth = 1` for flat structure

### Deduplication Logic

The find-skills command tracks found skills in a Set [.codex/superpowers-codex138-155](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L138-L155):

1. **Personal Skills First**: Scan personal directory and add all relative paths to `foundSkills` Set
2. **Superpowers Skills Second**: Scan superpowers directory but skip any path already in the Set
3. **Result**: Personal skills effectively "shadow" identically-named superpowers skills

### Output Format

Each skill is printed with metadata via `printSkill()` [.codex/superpowers-codex76-95](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L76-L95):

```
skill-name (or superpowers:skill-name)
  Brief description from frontmatter
  When to use: when_to_use from frontmatter
```

The namespace prefix is only added for superpowers skills [.codex/superpowers-codex83-87](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L83-L87) making personal skills the "default" namespace.

Sources: [.codex/superpowers-codex97-130](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L97-L130) [.codex/superpowers-codex133-166](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L133-L166) [.codex/superpowers-codex76-95](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L76-L95)

---

## Tool Mapping Layer

The Codex platform lacks some tools available in Claude Code. The bootstrap instructions include tool substitution mappings [.codex/superpowers-bootstrap.md9-14](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L9-L14):

| Skills Tool                     | Codex Equivalent              | Notes                                             |
| ------------------------------- | ----------------------------- | ------------------------------------------------- |
| `TodoWrite`                     | `update_plan`                 | Codex's native planning/task tracking tool        |
| `Task` (subagents)              | User notification             | Subagents not supported; agent does work directly |
| `Skill`                         | `superpowers-codex use-skill` | CLI command replaces native tool                  |
| `Read`, `Write`, `Edit`, `Bash` | Native Codex tools            | Direct mapping to similar tools                   |

### Subagent Limitation

Unlike Claude Code's native subagent delegation, Codex has no equivalent. Skills requiring subagents must adapt by:

1. **Notifying User**: "Subagents aren't available in Codex yet" [.codex/superpowers-bootstrap.md12](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L12-L12)
2. **Direct Execution**: Agent performs the work the subagent would have done
3. **Workflow Adjustment**: Skills like `subagent-driven-development` become less effective

This is documented prominently in bootstrap instructions to set expectations.

Sources: [.codex/superpowers-bootstrap.md1-33](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L1-L33)

---

## Integration with AGENTS.md

The Codex integration requires manual setup in `~/.codex/AGENTS.md` [.codex/INSTALL.md19-26](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L19-L26):

```
```

This block:

1. **Triggers Bootstrap**: Agent must run the bootstrap command immediately on session start
2. **Establishes Authority**: The `<EXTREMELY_IMPORTANT>` tags ensure high priority
3. **Self-Documenting**: Bootstrap output includes all necessary instructions

Unlike Claude Code's automatic session hooks, this requires user configuration but provides explicit control over when and how superpowers are loaded.

Sources: [.codex/INSTALL.md1-35](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L1-L35) [.codex/superpowers-bootstrap.md1-33](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L1-L33)

---

## Error Handling

The CLI implements graceful error handling throughout:

### Network and Git Errors

- **Update Check**: 3-second timeout on `git fetch` [.codex/superpowers-codex21-22](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L21-L22)
- **Failure Mode**: Returns `false` on network errors or timeouts [.codex/superpowers-codex34-37](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L34-L37)
- **Impact**: Bootstrap proceeds without update check; never blocks session start

### File System Errors

- **Directory Scanning**: Try-catch blocks ignore permission errors [.codex/superpowers-codex123-125](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L123-L125)
- **Missing Files**: Graceful return with empty metadata [.codex/superpowers-codex71-73](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L71-L73)
- **Skill Not Found**: Display available skills as fallback [.codex/superpowers-codex298-304](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L298-L304)

### Invalid Commands

- **Unknown Command**: Display help message with usage examples [.codex/superpowers-codex376-387](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L376-L387)
- **Missing Arguments**: Show command-specific usage [.codex/superpowers-codex224-229](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L224-L229)

All error handling prioritizes system availability over strict correctness—better to run with degraded functionality than to fail completely.

Sources: [.codex/superpowers-codex16-38](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L16-L38) [.codex/superpowers-codex123-125](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L123-L125) [.codex/superpowers-codex298-304](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L298-L304) [.codex/superpowers-codex376-387](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L376-L387)

---

## Command Reference

### bootstrap

**Synopsis**: `superpowers-codex bootstrap`

**Description**: Runs complete session initialization including update check, bootstrap instructions, skill discovery, and auto-loading of the `using-superpowers` skill.

**Output**:

1. Update warning (if behind remote)
2. Bootstrap instructions with tool mappings
3. Complete skill listing with metadata
4. Auto-loaded `using-superpowers` skill content

**Typical Usage**: Called once per session via `AGENTS.md` directive.

### use-skill

**Synopsis**: `superpowers-codex use-skill <skill-name>`

**Description**: Loads and displays a specific skill by name. Resolves personal skills first, then superpowers skills.

**Arguments**:

- `<skill-name>`: Skill identifier (e.g., `brainstorming`, `superpowers:brainstorming`)

**Namespace Behavior**:

- No prefix: Search personal → superpowers
- `superpowers:` prefix: Search superpowers only
- `skills/` prefix: Stripped automatically

**Output**: Formatted skill document with frontmatter metadata and content.

### find-skills

**Synopsis**: `superpowers-codex find-skills`

**Description**: Lists all available skills from both personal and superpowers directories with frontmatter metadata.

**Output**: Formatted skill listing with:

- Skill name (with namespace)
- Description
- When to use
- Usage instructions

**Deduplication**: Personal skills shadow identically-named superpowers skills.

Sources: [.codex/superpowers-codex168-220](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L168-L220) [.codex/superpowers-codex222-360](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L222-L360) [.codex/superpowers-codex133-166](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L133-L166)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Codex CLI Tool](#codex-cli-tool.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Overview](#overview.md)
- [Command Summary](#command-summary.md)
- [Directory Structure](#directory-structure.md)
- [Command Architecture](#command-architecture.md)
- [Command Dispatch Flow](#command-dispatch-flow.md)
- [Skill Resolution Algorithm](#skill-resolution-algorithm.md)
- [Namespace and Priority Rules](#namespace-and-priority-rules.md)
- [Resolution Flow Diagram](#resolution-flow-diagram.md)
- [Resolution Implementation Details](#resolution-implementation-details.md)
- [Example Resolution Paths](#example-resolution-paths.md)
- [Bootstrap Command](#bootstrap-command.md)
- [Bootstrap Sequence](#bootstrap-sequence.md)
- [Update Checking Mechanism](#update-checking-mechanism.md)
- [Bootstrap Output Structure](#bootstrap-output-structure.md)
- [Use-Skill Command](#use-skill-command.md)
- [Skill Loading Process](#skill-loading-process.md)
- [Frontmatter Extraction](#frontmatter-extraction.md)
- [Output Format](#output-format.md)
- [Find-Skills Command](#find-skills-command.md)
- [Skill Discovery Algorithm](#skill-discovery-algorithm.md)
- [Directory Scanning](#directory-scanning.md)
- [Deduplication Logic](#deduplication-logic.md)
- [Output Format](#output-format-1.md)
- [Tool Mapping Layer](#tool-mapping-layer.md)
- [Subagent Limitation](#subagent-limitation.md)
- [Integration with AGENTS.md](#integration-with-agentsmd.md)
- [Error Handling](#error-handling.md)
- [Network and Git Errors](#network-and-git-errors.md)
- [File System Errors](#file-system-errors.md)
- [Invalid Commands](#invalid-commands.md)
- [Command Reference](#command-reference.md)
- [bootstrap](#bootstrap.md)
- [use-skill](#use-skill.md)
- [find-skills](#find-skills.md)
