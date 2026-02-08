# /obra/superpowers/5.4-skills-core.js-shared-module

skills-core.js Shared Module | obra/superpowers | DeepWiki

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

# skills-core.js Shared Module

Relevant source files

- [.codex/INSTALL.md](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md)
- [.codex/superpowers-bootstrap.md](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md)
- [.codex/superpowers-codex](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex)
- [.opencode/INSTALL.md](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md)
- [.opencode/plugin/superpowers.js](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js)
- [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js)
- [tests/opencode/test-skills-core.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh)

This document covers the `lib/skills-core.js` ES module, which provides shared utility functions for skill discovery, resolution, and metadata extraction. This module is used by both the OpenCode plugin and Codex CLI to provide consistent skill management behavior across platforms.

For information about how specific platforms implement their integrations, see page 5.2 (OpenCode: Plugin and Custom Tools) and page 5.3 (Codex: CLI Tool). For the Claude Code session start hook, which implements its own skill loading logic independently, see page 5.1 (Claude Code: Slash Commands and Hooks).

## Module Overview

The `skills-core.js` module is an ES module that exports five core functions for skill management. It serves as the single source of truth for skill discovery and resolution logic across OpenCode and Codex platforms.

**Diagram: skills-core.js Module Integration Architecture**

```
```

**Sources:** [lib/skills-core.js1-209](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L209) [.opencode/plugin/superpowers.js13](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L13-L13) [.codex/superpowers-codex6](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L6-L6)

### Export Signature

The module exports five functions with the following signatures:

| Function             | Parameters                                                       | Return Type                           | Purpose                                       |
| -------------------- | ---------------------------------------------------------------- | ------------------------------------- | --------------------------------------------- |
| `extractFrontmatter` | `filePath: string`                                               | `{name: string, description: string}` | Parse YAML frontmatter from SKILL.md          |
| `stripFrontmatter`   | `content: string`                                                | `string`                              | Remove YAML frontmatter, return content only  |
| `findSkillsInDir`    | `dir: string, sourceType: string, maxDepth: number`              | `Array<SkillInfo>`                    | Recursively find all SKILL.md files           |
| `resolveSkillPath`   | `skillName: string, superpowersDir: string, personalDir: string` | `SkillResolution \| null`             | Resolve skill name to file path with priority |
| `checkForUpdates`    | `repoDir: string`                                                | `boolean`                             | Check if git repository has updates available |

**Sources:** [lib/skills-core.js16-52](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L16-L52) [lib/skills-core.js62-97](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L62-L97) [lib/skills-core.js108-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L108-L140) [lib/skills-core.js148-170](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L148-L170) [lib/skills-core.js178-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L178-L200)

### Type Definitions

While the module doesn't use TypeScript, the effective type signatures are:

```
```

**Sources:** [lib/skills-core.js60-61](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L60-L61) [lib/skills-core.js106-107](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L106-L107)

## extractFrontmatter Function

The `extractFrontmatter` function parses YAML frontmatter from SKILL.md files to extract metadata. It implements a simple state machine parser that looks for YAML delimiter markers (`---`).

**Diagram: extractFrontmatter() State Machine**

```
```

### Implementation Details

The parser [lib/skills-core.js16-52](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L16-L52):

- Reads file content and splits into lines
- Uses a boolean `inFrontmatter` flag to track parser state
- Matches lines against pattern `/^(\w+):\s*(.*)$/` to extract key-value pairs
- Only extracts `name` and `description` fields (other fields are ignored)
- Returns empty strings for missing fields
- Returns `{name: '', description: ''}` on errors (file not found, read errors)

### Usage Pattern

```
```

**Sources:** [lib/skills-core.js16-52](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L16-L52) [.opencode/plugin/superpowers.js119](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L119-L119) [.codex/superpowers-codex30](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L30-L30)

## stripFrontmatter Function

The `stripFrontmatter` function removes YAML frontmatter from skill content, returning only the content portion. This is used when injecting skill content into agent context.

**Diagram: stripFrontmatter() Processing Flow**

```
```

The function [lib/skills-core.js178-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L178-L200):

- Maintains two state flags: `inFrontmatter` and `frontmatterEnded`
- Skips lines between the two `---` delimiters
- Preserves all content after the closing `---`
- Trims leading/trailing whitespace from final output

### Usage Pattern

```
```

**Sources:** [lib/skills-core.js178-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L178-L200) [.opencode/plugin/superpowers.js30](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L30-L30) [.codex/superpowers-codex215](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L215-L215)

## findSkillsInDir Function

The `findSkillsInDir` function recursively discovers all skills in a directory tree by looking for `SKILL.md` files. It implements depth-limited recursion to prevent runaway directory traversal.

**Diagram: findSkillsInDir() Recursive Directory Traversal**

```
```

### Key Characteristics

The function [lib/skills-core.js62-97](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L62-L97):

- Uses `fs.readdirSync` with `{withFileTypes: true}` for efficient type checking
- Default `maxDepth` of 3 levels prevents deep directory traversal
- Extracts frontmatter for each discovered skill using `extractFrontmatter`
- Includes `sourceType` parameter to label results ('project', 'personal', 'superpowers')
- Returns array of `SkillInfo` objects with full metadata

### Platform-Specific Usage

| Platform | Project Dir        | Personal Dir                | Superpowers Dir               | Max Depth |
| -------- | ------------------ | --------------------------- | ----------------------------- | --------- |
| OpenCode | `.opencode/skills` | `~/.config/opencode/skills` | Resolved via plugin path      | 3         |
| Codex    | `.codex/skills`    | `~/.codex/skills`           | `~/.codex/superpowers/skills` | 1-2       |

**Sources:** [lib/skills-core.js62-97](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L62-L97) [.opencode/plugin/superpowers.js152-154](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L152-L154) [.codex/superpowers-codex45-53](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L45-L53)

## resolveSkillPath Function

The `resolveSkillPath` function implements the three-tier priority system for skill resolution. It resolves a skill name to an actual file path, respecting the personal > superpowers shadowing hierarchy and handling namespace prefixes.

**Diagram: resolveSkillPath() Priority-Based Resolution Algorithm**

```
```

### Namespace Handling

The function [lib/skills-core.js108-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L108-L140) handles two namespace prefixes:

| Prefix         | Behavior                                 | Example                                                             |
| -------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| None           | Normal priority (personal > superpowers) | `brainstorming` checks personal, then superpowers                   |
| `superpowers:` | Force superpowers directory              | `superpowers:brainstorming` skips personal, only checks superpowers |

Note: The `project:` prefix is handled by calling code (OpenCode plugin), not by this function.

### Usage in OpenCode

The OpenCode plugin [.opencode/plugin/superpowers.js89-112](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L89-L112) implements additional project-level resolution:

1. Check for `project:` prefix first (handled outside `resolveSkillPath`)
2. If project skill found, use it
3. Otherwise, call `resolveSkillPath` for personal/superpowers resolution

### Usage in Codex

The Codex CLI [.codex/superpowers-codex138-199](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L138-L199) implements similar logic but without project-level skills, using only personal and superpowers directories.

**Sources:** [lib/skills-core.js108-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L108-L140) [.opencode/plugin/superpowers.js89-112](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L89-L112) [.codex/superpowers-codex138-199](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L138-L199)

## checkForUpdates Function

The `checkForUpdates` function determines if a git repository has updates available from its remote. It's used to notify users when new skills are available without blocking the bootstrap process.

**Diagram: checkForUpdates() Git Status Check Sequence**

```
```

### Field Descriptions

| Field         | Type   | Required    | Purpose                | Example                                                         |
| ------------- | ------ | ----------- | ---------------------- | --------------------------------------------------------------- |
| `name`        | string | Recommended | Display name for skill | `Test-Driven Development`                                       |
| `description` | string | Recommended | When to use this skill | `Use when writing new code - enforces RED-GREEN-REFACTOR cycle` |

### Parsing Behavior

The `extractFrontmatter` function [lib/skills-core.js16-52](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L16-L52):

- Uses regex `/^(\w+):\s*(.*)$/` to parse key-value pairs
- Ignores unrecognized keys
- Returns empty strings for missing fields
- Does not validate field contents
- Trims whitespace from values

**Sources:** [lib/skills-core.js6-14](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L6-L14) [lib/skills-core.js16-52](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L16-L52)

## Integration Examples

### OpenCode Integration

The OpenCode plugin imports the module as an ES module and uses it throughout the plugin implementation:

```
```

**Sources:** [.opencode/plugin/superpowers.js13](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L13-L13) [.opencode/plugin/superpowers.js26-30](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L26-L30) [.opencode/plugin/superpowers.js111-121](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L111-L121) [.opencode/plugin/superpowers.js152-154](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L152-L154)

### Codex Integration

The Codex CLI uses CommonJS `require` since it runs as a Node.js script rather than an ES module:

```
```

**Sources:** [.codex/superpowers-codex6](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L6-L6) [.codex/superpowers-codex30-31](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L30-L31) [.codex/superpowers-codex45-53](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L45-L53) [.codex/superpowers-codex78](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L78-L78) [.codex/superpowers-codex214-215](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L214-L215)

## Error Handling Patterns

The module implements consistent error handling across all functions:

**Diagram: Error Handling Strategy Across Functions**

```
```

### Error Handling by Function

| Function             | Error Cases                      | Return Value                  | Rationale                           |
| -------------------- | -------------------------------- | ----------------------------- | ----------------------------------- |
| `extractFrontmatter` | File not found, read error       | `{name: '', description: ''}` | Allow callers to use fallback names |
| `findSkillsInDir`    | Directory not exists             | `[]`                          | Empty list is valid result          |
| `resolveSkillPath`   | Skill not found                  | `null`                        | Explicit not-found signal           |
| `checkForUpdates`    | Network down, git error, timeout | `false`                       | Never block bootstrap               |
| `stripFrontmatter`   | N/A                              | Processes input               | Assumes valid input                 |

This design ensures the module never crashes the calling platform and allows plugins/CLI to handle missing skills gracefully.

**Sources:** [lib/skills-core.js49-51](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L49-L51) [lib/skills-core.js65](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L65-L65) [lib/skills-core.js139](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L139-L139) [lib/skills-core.js166-169](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L166-L169)

## Testing

The module has comprehensive unit tests that exercise all functions independently of OpenCode. Tests use inline function definitions to avoid ES module path resolution issues in test environments.

### Test Coverage

The test suite [tests/opencode/test-skills-core.sh1-441](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L1-L441) validates:

- `extractFrontmatter`: Parse name and description from YAML
- `stripFrontmatter`: Remove frontmatter, preserve content
- `findSkillsInDir`: Discover skills recursively, including nested directories
- `resolveSkillPath`: Personal shadowing, namespace prefix handling, not-found cases
- `checkForUpdates`: Error handling for no remote, non-existent dirs, non-git dirs

Each test creates isolated directories in `$TEST_HOME` and validates function behavior using Node.js inline scripts.

**Sources:** [tests/opencode/test-skills-core.sh1-441](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L1-L441)

```
```

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [skills-core.js Shared Module](#skills-corejs-shared-module.md)
- [Module Overview](#module-overview.md)
- [Export Signature](#export-signature.md)
- [Type Definitions](#type-definitions.md)
- [extractFrontmatter Function](#extractfrontmatter-function.md)
- [Implementation Details](#implementation-details.md)
- [Usage Pattern](#usage-pattern.md)
- [stripFrontmatter Function](#stripfrontmatter-function.md)
- [Usage Pattern](#usage-pattern-1.md)
- [findSkillsInDir Function](#findskillsindir-function.md)
- [Key Characteristics](#key-characteristics.md)
- [Platform-Specific Usage](#platform-specific-usage.md)
- [resolveSkillPath Function](#resolveskillpath-function.md)
- [Namespace Handling](#namespace-handling.md)
- [Usage in OpenCode](#usage-in-opencode.md)
- [Usage in Codex](#usage-in-codex.md)
- [checkForUpdates Function](#checkforupdates-function.md)
- [Error Handling Philosophy](#error-handling-philosophy.md)
- [Status Parsing](#status-parsing.md)
- [YAML Frontmatter Format](#yaml-frontmatter-format.md)
- [Format Specification](#format-specification.md)
- [Field Descriptions](#field-descriptions.md)
- [Parsing Behavior](#parsing-behavior.md)
- [Integration Examples](#integration-examples.md)
- [OpenCode Integration](#opencode-integration.md)
- [Codex Integration](#codex-integration.md)
- [Error Handling Patterns](#error-handling-patterns.md)
- [Error Handling by Function](#error-handling-by-function.md)
- [Testing](#testing.md)
- [Test Coverage](#test-coverage.md)
