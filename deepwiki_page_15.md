# /obra/superpowers/4.5-skills-resolution-and-priority

Skills Resolution and Priority | obra/superpowers | DeepWiki

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

# Skills Resolution and Priority

Relevant source files

- [.codex/INSTALL.md](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md)
- [.codex/superpowers-bootstrap.md](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md)
- [.codex/superpowers-codex](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex)
- [.opencode/INSTALL.md](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md)
- [.opencode/plugin/superpowers.js](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js)
- [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js)
- [tests/opencode/test-skills-core.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh)

This document describes the three-tier priority system used to resolve skill names across project, personal, and superpowers skills. It explains namespace prefixes, the resolution algorithm implementation, and how overrides work across different platforms.

For information about how skills are discovered and listed, see [Finding and Invoking Skills](obra/superpowers/3.3-finding-and-invoking-skills.md). For platform-specific integration details, see [Multi-Platform Integration](obra/superpowers/4.3-multi-platform-integration.md).

---

## Overview of the Three-Tier System

Skills can exist in three locations, each with a specific priority level:

| Priority    | Location Type          | Description                                              | Example Path (OpenCode)                                |
| ----------- | ---------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| 1 (Highest) | **Project Skills**     | Project-specific skills in the current working directory | `.opencode/skills/my-project-skill/`                   |
| 2 (Middle)  | **Personal Skills**    | User-specific skills shared across all projects          | `~/.config/opencode/skills/my-skill/`                  |
| 3 (Lowest)  | **Superpowers Skills** | Official skills from the superpowers repository          | `~/.config/opencode/superpowers/skills/brainstorming/` |

When a skill name matches in multiple locations, the higher-priority location wins. This allows project-specific customizations to override personal customizations, which in turn override the official superpowers skills.

**Note:** Codex does not support project-level skills, only personal and superpowers tiers.

**Sources:** [.opencode/plugin/superpowers.js32-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L32-L40) [.codex/superpowers-codex9-13](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L9-L13) [.opencode/INSTALL.md96](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L96-L96)

---

## Namespace Prefixes

Namespace prefixes allow explicit control over skill resolution:

| Prefix         | Behavior                            | Example                     | Priority Override                |
| -------------- | ----------------------------------- | --------------------------- | -------------------------------- |
| `project:`     | Force project skill lookup only     | `project:my-skill`          | Bypasses personal/superpowers    |
| (none)         | Search in priority order            | `my-skill`                  | project → personal → superpowers |
| `superpowers:` | Force superpowers skill lookup only | `superpowers:brainstorming` | Bypasses personal/project        |

### Usage Examples

```
```

The `superpowers:` prefix is particularly useful when you have a personal skill that overrides a superpowers skill, but you want to access the original version.

**Sources:** [.opencode/plugin/superpowers.js102](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L102-L102) [.opencode/INSTALL.md98-101](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L98-L101) [lib/skills-core.js108-111](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L108-L111)

---

## Resolution Algorithm

### High-Level Resolution Flow

```
```

**Sources:** [.opencode/plugin/superpowers.js104-134](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L104-L134) [lib/skills-core.js108-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L108-L140)

---

## Core Resolution Implementation

### OpenCode: Three-Tier Resolution with Project Skills

OpenCode supports all three priority levels. The resolution happens in `use_skill` tool execution:

```
```

**Implementation Details:**

1. **Project skill detection** [.opencode/plugin/superpowers.js109-124](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L109-L124):

   - Checks for `project:` prefix or absence of `superpowers:` prefix
   - Constructs path: `projectSkillsDir/actualSkillName/SKILL.md`
   - If found, returns immediately with `sourceType: 'project'`

2. **Fallback to core resolution** [.opencode/plugin/superpowers.js128-130](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L128-L130):

   - Only invoked if project skill not found and not forced with `project:` prefix
   - Delegates to `skillsCore.resolveSkillPath()` for personal/superpowers resolution

**Sources:** [.opencode/plugin/superpowers.js99-165](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L99-L165)

---

### Shared Core: Personal/Superpowers Resolution

The `resolveSkillPath()` function in `lib/skills-core.js` handles personal and superpowers resolution, shared by OpenCode and Codex:

```
```

**Key Logic:**

- **Line 110**: `const forceSuperpowers = skillName.startsWith('superpowers:');`
- **Lines 114-124**: Personal skill check (only if not forced superpowers)
- **Lines 127-137**: Superpowers skill check (fallback or forced)

**Sources:** [lib/skills-core.js108-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L108-L140)

---

### Codex: Two-Tier Resolution

Codex only supports personal and superpowers skills (no project tier):

```
```

**Implementation:**

- **Lines 140-146**: Parse `superpowers:` prefix
- **Lines 172-187**: Try personal skills first (unless forced)
- **Lines 190-199**: Fallback to superpowers skills

**Sources:** [.codex/superpowers-codex126-208](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L126-L208)

---

## Directory Paths by Platform

### OpenCode Directory Configuration

```
```

**Path Construction** [.opencode/plugin/superpowers.js34-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L34-L40):

```
projectSkillsDir = path.join(directory, '.opencode/skills')
personalSkillsDir = path.join(configDir, 'skills')
superpowersSkillsDir = path.resolve(__dirname, '../../skills')
```

**Environment Variable Support:**

- `OPENCODE_CONFIG_DIR` can override the default `~/.config/opencode` location [.opencode/plugin/superpowers.js38-39](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L38-L39)

**Sources:** [.opencode/plugin/superpowers.js32-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L32-L40)

---

### Codex Directory Configuration

```
```

**Path Construction** [.codex/superpowers-codex9-11](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L9-L11):

```
superpowersSkillsDir = path.join(homeDir, '.codex', 'superpowers', 'skills')
personalSkillsDir = path.join(homeDir, '.codex', 'skills')
```

**Note:** Codex does not have a concept of project-level skills.

**Sources:** [.codex/superpowers-codex9-13](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L9-L13)

---

### Claude Code Directory Configuration

Claude Code uses native Skill tool and session hooks for resolution. Skills are managed via `initialize-skills.sh` which clones to:

```
~/.config/superpowers/skills/
```

Personal skills can be placed in a separate directory and registered via configuration. See [Claude Code: Skill Tool and Hooks](obra/superpowers/5.1-claude-code:-skill-tool-and-hooks.md) for details.

**Sources:** [Diagram 4 from high-level overview](<https://github.com/obra/superpowers/blob/a01a135f/Diagram 4 from high-level overview>) [Architecture: Session Lifecycle](obra/superpowers/4.4-session-lifecycle-and-bootstrap.md)

---

## Override Mechanisms

### Shadowing by Name

When multiple skill locations contain a skill with the same name, the higher-priority location "shadows" the lower-priority ones:

| Scenario               | Project | Personal | Superpowers | Result                 |
| ---------------------- | ------- | -------- | ----------- | ---------------------- |
| All present            | ✓       | ✓        | ✓           | Project skill used     |
| Personal + Superpowers | -       | ✓        | ✓           | Personal skill used    |
| Superpowers only       | -       | -        | ✓           | Superpowers skill used |

**Example:**

```
# Directory structure:
.opencode/skills/brainstorming/SKILL.md           # Project override
~/.config/opencode/skills/brainstorming/SKILL.md  # Personal override
~/.config/opencode/superpowers/skills/brainstorming/SKILL.md  # Original

# When you invoke:
use_skill("brainstorming")

# Result: Project skill is used (highest priority)
```

**Testing Shadow Behavior:**

The test suite validates shadowing in [tests/opencode/test-skills-core.sh248-363](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L248-L363):

- Creates `shared-skill` in both personal and superpowers locations
- Verifies personal version is returned by default
- Verifies `superpowers:` prefix forces superpowers version

**Sources:** [tests/opencode/test-skills-core.sh248-363](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L248-L363) [.opencode/INSTALL.md72-96](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L72-L96)

---

### Forcing Specific Locations

Use namespace prefixes to bypass priority and force specific locations:

#### Force Project Skill

```
```

**OpenCode Implementation** [.opencode/plugin/superpowers.js109-124](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L109-L124):

- Checks `skill_name.startsWith('project:')` → sets `forceProject = true`
- Only searches `projectSkillsDir`, returns error if not found

#### Force Superpowers Skill

```
```

**Core Implementation** [lib/skills-core.js110-114](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L110-L114):

- Sets `forceSuperpowers = true`
- Skips personal skills directory check
- Only searches `superpowersSkillsDir`

This is useful when you have a personal override but want to temporarily use the original superpowers version for reference.

**Sources:** [.opencode/plugin/superpowers.js109-124](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L109-L124) [lib/skills-core.js108-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L108-L140)

---

## Skill Discovery with Priority

The `find_skills` tool (OpenCode) or `find-skills` command (Codex) lists all skills in priority order:

### OpenCode find\_skills Implementation

```
```

**Key Points:**

- Skills are discovered in all three locations [.opencode/plugin/superpowers.js171-173](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L171-L173)
- Array concatenation order preserves priority: `[...projectSkills, ...personalSkills, ...superpowersSkills]` [.opencode/plugin/superpowers.js176](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L176-L176)
- Namespace prefix shows skill origin [.opencode/plugin/superpowers.js186-195](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L186-L195)

**Sources:** [.opencode/plugin/superpowers.js167-207](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L167-L207)

---

### Codex find-skills Implementation

Codex implementation shows personal skills before superpowers, with explicit shadowing detection:

**Key Logic** [.codex/superpowers-codex37-69](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L37-L69):

1. Scan personal skills, add to `foundSkills` set
2. Scan superpowers skills, only show if not already in `foundSkills` set
3. This prevents duplicate listings when personal skill overrides superpowers skill

**Sources:** [.codex/superpowers-codex37-69](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L37-L69)

---

## Bootstrap Content and Priority Display

All platforms display skill priority information during session bootstrap:

### OpenCode Bootstrap Display

```
```

**Source:** [.opencode/plugin/superpowers.js61-65](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L61-L65)

### Codex Bootstrap Display

```
```

**Source:** [.codex/superpowers-bootstrap.md17-19](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L17-L19)

**Sources:** [.opencode/plugin/superpowers.js43-76](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L43-L76) [.codex/superpowers-bootstrap.md17-20](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L17-L20)

---

## Testing Priority and Resolution

### Unit Tests for resolveSkillPath

The test suite validates all priority scenarios in [tests/opencode/test-skills-core.sh248-363](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L248-L363):

| Test Case                    | Setup                              | Expected Result              | Validation                  |
| ---------------------------- | ---------------------------------- | ---------------------------- | --------------------------- |
| Personal shadows superpowers | `shared-skill` in both locations   | Personal version returned    | `sourceType: 'personal'`    |
| Force superpowers prefix     | `superpowers:shared-skill`         | Superpowers version returned | `sourceType: 'superpowers'` |
| Unique superpowers skill     | `unique-skill` only in superpowers | Superpowers version returned | `sourceType: 'superpowers'` |
| Non-existent skill           | Skill doesn't exist anywhere       | `null` returned              | `NOTFOUND: null`            |

**Test Execution:**

```
```

**Sources:** [tests/opencode/test-skills-core.sh248-363](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L248-L363)

---

## Error Handling

### Skill Not Found

When a skill cannot be resolved, platforms return user-friendly error messages:

**OpenCode** [.opencode/plugin/superpowers.js132-134](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L132-L134):

```
Error: Skill "${skill_name}" not found.

Run find_skills to see available skills.
```

**Codex** [.codex/superpowers-codex203-207](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L203-L207):

```
Error: Skill not found: ${actualSkillPath}

Available skills:
[runs find-skills command]
```

### Invalid Prefix

If a prefix like `project:my-skill` is used but the skill doesn't exist in that location, the resolution returns null/error without checking lower-priority locations. This is intentional - prefixes are explicit requests.

**Sources:** [.opencode/plugin/superpowers.js132-134](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L132-L134) [.codex/superpowers-codex203-207](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L203-L207)

---

## Summary Table: Resolution by Platform

| Feature                   | OpenCode                                   | Codex                               | Claude Code                       |
| ------------------------- | ------------------------------------------ | ----------------------------------- | --------------------------------- |
| **Project Skills**        | ✓ `.opencode/skills/`                      | ✗ Not supported                     | ✗ Not supported                   |
| **Personal Skills**       | ✓ `~/.config/opencode/skills/`             | ✓ `~/.codex/skills/`                | ✓ Custom location                 |
| **Superpowers Skills**    | ✓ `~/.config/opencode/superpowers/skills/` | ✓ `~/.codex/superpowers/skills/`    | ✓ `~/.config/superpowers/skills/` |
| **`project:` prefix**     | ✓ Forces project lookup                    | ✗ N/A                               | ✗ N/A                             |
| **`superpowers:` prefix** | ✓ Forces superpowers lookup                | ✓ Forces superpowers lookup         | ✓ Supported                       |
| **No prefix**             | Searches: project → personal → superpowers | Searches: personal → superpowers    | Searches: personal → superpowers  |
| **Resolution Function**   | `use_skill` tool + `resolveSkillPath()`    | `runUseSkill()` + `findSkillFile()` | Native Skill tool                 |
| **Discovery Function**    | `find_skills` tool                         | `find-skills` command               | Native listing                    |

**Sources:** [.opencode/plugin/superpowers.js32-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L32-L40) [.codex/superpowers-codex9-13](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L9-L13) [Architecture diagrams](<https://github.com/obra/superpowers/blob/a01a135f/Architecture diagrams>)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Skills Resolution and Priority](#skills-resolution-and-priority.md)
- [Overview of the Three-Tier System](#overview-of-the-three-tier-system.md)
- [Namespace Prefixes](#namespace-prefixes.md)
- [Usage Examples](#usage-examples.md)
- [Resolution Algorithm](#resolution-algorithm.md)
- [High-Level Resolution Flow](#high-level-resolution-flow.md)
- [Core Resolution Implementation](#core-resolution-implementation.md)
- [OpenCode: Three-Tier Resolution with Project Skills](#opencode-three-tier-resolution-with-project-skills.md)
- [Shared Core: Personal/Superpowers Resolution](#shared-core-personalsuperpowers-resolution.md)
- [Codex: Two-Tier Resolution](#codex-two-tier-resolution.md)
- [Directory Paths by Platform](#directory-paths-by-platform.md)
- [OpenCode Directory Configuration](#opencode-directory-configuration.md)
- [Codex Directory Configuration](#codex-directory-configuration.md)
- [Claude Code Directory Configuration](#claude-code-directory-configuration.md)
- [Override Mechanisms](#override-mechanisms.md)
- [Shadowing by Name](#shadowing-by-name.md)
- [Forcing Specific Locations](#forcing-specific-locations.md)
- [Force Project Skill](#force-project-skill.md)
- [Force Superpowers Skill](#force-superpowers-skill.md)
- [Skill Discovery with Priority](#skill-discovery-with-priority.md)
- [OpenCode find\_skills Implementation](#opencode-find_skills-implementation.md)
- [Codex find-skills Implementation](#codex-find-skills-implementation.md)
- [Bootstrap Content and Priority Display](#bootstrap-content-and-priority-display.md)
- [OpenCode Bootstrap Display](#opencode-bootstrap-display.md)
- [Codex Bootstrap Display](#codex-bootstrap-display.md)
- [Testing Priority and Resolution](#testing-priority-and-resolution.md)
- [Unit Tests for resolveSkillPath](#unit-tests-for-resolveskillpath.md)
- [Error Handling](#error-handling.md)
- [Skill Not Found](#skill-not-found.md)
- [Invalid Prefix](#invalid-prefix.md)
- [Summary Table: Resolution by Platform](#summary-table-resolution-by-platform.md)
