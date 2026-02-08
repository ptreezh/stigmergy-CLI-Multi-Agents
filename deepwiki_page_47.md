# /obra/superpowers/10.1-directory-structure

Directory Structure | obra/superpowers | DeepWiki

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

# Directory Structure

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [.codex/INSTALL.md](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md)
- [.codex/superpowers-bootstrap.md](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md)
- [.codex/superpowers-codex](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex)
- [.opencode/INSTALL.md](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md)
- [.opencode/plugin/superpowers.js](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js)
- [tests/opencode/test-skills-core.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh)

This page documents the complete file system layout of the Superpowers system across both the plugin repository and the skills repository. It covers directory structures for all supported platforms (Claude Code, OpenCode, Codex) and explains the location resolution and priority mechanisms.

For configuration file details, see [Configuration Files](obra/superpowers/10.2-configuration-files.md). For environment variables used in path resolution, see [Environment Variables](obra/superpowers/10.3-environment-variables.md).

---

## Overview: Dual Repository Architecture

Superpowers uses a **two-repository architecture** (introduced in v2.0) that separates the lightweight plugin shim from the skills content:

| Repository            | Purpose                                                    | Location                  | Versioning               |
| --------------------- | ---------------------------------------------------------- | ------------------------- | ------------------------ |
| **Plugin Repository** | Platform integration code, session hooks, tool definitions | `obra/superpowers`        | Plugin versions (v4.0.x) |
| **Skills Repository** | Skill content, documentation, supporting files             | `obra/superpowers-skills` | Independent versioning   |

The plugin repository is minimal (under 50 files) and provides platform-specific integration. The skills repository contains the actual skill library and is cloned locally during installation.

**Sources:** [RELEASE-NOTES.md408-438](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L408-L438)

---

## Plugin Repository Structure

The plugin repository (`obra/superpowers`) contains platform-specific integration code:

```
obra/superpowers/
├── .claude-plugin/          # Claude Code plugin definition
│   ├── plugin.json          # Plugin metadata (v4.0.3)
│   ├── hooks.json           # Session hook registration
│   └── marketplace.json     # Development marketplace config
│
├── .opencode/              # OpenCode.ai integration
│   ├── plugin/
│   │   └── superpowers.js  # Plugin implementation with use_skill/find_skills tools
│   └── INSTALL.md          # OpenCode installation guide
│
├── .codex/                 # Codex integration
│   ├── superpowers-codex   # Unified CLI script (bootstrap/use-skill/find-skills)
│   ├── superpowers-bootstrap.md  # Bootstrap instructions
│   └── INSTALL.md          # Codex installation guide
│
├── lib/                    # Shared utilities
│   ├── skills-core.js      # Core skill operations (ES module)
│   └── initialize-skills.sh # Skills repository manager
│
├── hooks/                  # Claude Code session hooks
│   ├── session-start.sh    # Bootstrap and auto-update
│   └── run-hook.cmd        # Cross-platform polyglot wrapper
│
├── agents/                 # Agent definitions
│   └── code-reviewer.md    # superpowers:code-reviewer agent
│
├── tests/                  # Testing infrastructure
│   ├── skill-triggering/   # Naive prompt triggering tests
│   ├── claude-code/        # Integration tests with claude -p
│   ├── opencode/           # OpenCode plugin tests
│   └── subagent-driven-dev/ # End-to-end workflow tests
│
└── docs/                   # Documentation
    └── TESTING-CHECKLIST.md
```

**Sources:** [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13) [.opencode/plugin/superpowers.js1-234](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L1-L234) [.codex/superpowers-codex1-267](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L1-L267)

---

## Diagram: Repository File Structure

```
```

**Sources:** [lib/skills-core.js1-209](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L209) [lib/initialize-skills.sh (referenced)](<https://github.com/obra/superpowers/blob/a01a135f/lib/initialize-skills.sh (referenced)>) [hooks/session-start.sh (referenced)](<https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh (referenced)>)

---

## Claude Code Directory Structure

Claude Code uses the native plugin system with session hooks:

### Plugin Installation Directory

```
~/.config/claude-code/plugins/superpowers/
├── .claude-plugin/
│   ├── plugin.json         # name: "superpowers", version: "4.0.3"
│   └── hooks.json          # registers session-start hook
├── hooks/
│   ├── session-start.sh    # loads using-superpowers, checks updates
│   └── run-hook.cmd        # polyglot CMD/bash wrapper
├── lib/
│   └── initialize-skills.sh # clones/updates skills repo
└── agents/
    └── code-reviewer.md    # available as superpowers:code-reviewer
```

### Skills Installation Directory

```
~/.config/superpowers/skills/    # Local clone of obra/superpowers-skills
├── .git/                        # Git repository metadata
├── using-superpowers/
│   └── SKILL.md                 # The mandatory first response protocol
├── brainstorming/
│   └── SKILL.md
├── test-driven-development/
│   ├── SKILL.md
│   └── testing-anti-patterns.md
├── subagent-driven-development/
│   ├── SKILL.md
│   ├── implementer-prompt.md
│   ├── spec-reviewer-prompt.md
│   └── code-quality-reviewer-prompt.md
└── [other skills...]
```

The `initialize-skills.sh` script manages this directory on session start, performing git fetch and auto-merge if possible.

**Sources:** [RELEASE-NOTES.md450-459](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L450-L459) [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13) [RELEASE-NOTES.md408-438](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L408-L438)

---

## OpenCode Directory Structure

OpenCode uses a JavaScript plugin with custom tools:

### Plugin Installation Directory

```
~/.config/opencode/plugin/
└── superpowers.js          # Symlink to actual plugin file
                            # Target: ~/.config/opencode/superpowers/.opencode/plugin/superpowers.js
```

### Superpowers Installation Directory

```
~/.config/opencode/superpowers/  # Git clone of obra/superpowers
├── .opencode/
│   └── plugin/
│       └── superpowers.js      # SuperpowersPlugin implementation
├── lib/
│   └── skills-core.js          # Shared with Codex
└── skills/                      # Symlink or clone of obra/superpowers-skills
    └── [skill directories...]
```

### Personal Skills Directory

```
~/.config/opencode/skills/       # Personal skill overrides
├── my-custom-skill/
│   └── SKILL.md
└── [other personal skills...]
```

### Project-Local Skills Directory

```
<project-root>/.opencode/skills/  # Project-specific skills (highest priority)
├── project-specific-skill/
│   └── SKILL.md
└── [other project skills...]
```

The `SuperpowersPlugin` class resolves skills with this priority: project → personal → superpowers.

**Sources:** [.opencode/plugin/superpowers.js32-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L32-L40) [.opencode/INSTALL.md1-136](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L1-L136)

---

## Codex Directory Structure

Codex uses a unified CLI script for skill operations:

### Superpowers Installation Directory

```
~/.codex/superpowers/            # Git clone of obra/superpowers
├── .codex/
│   ├── superpowers-codex        # Executable Node.js script
│   ├── superpowers-bootstrap.md # Bootstrap instructions
│   └── INSTALL.md               # Installation guide
├── lib/
│   └── skills-core.js           # Shared utility functions
└── skills/                       # Clone of obra/superpowers-skills
    └── [skill directories...]
```

### Personal Skills Directory

```
~/.codex/skills/                 # Personal skill overrides
├── my-custom-skill/
│   └── SKILL.md
└── [other personal skills...]
```

The `superpowers-codex` script uses these hardcoded paths:

- Superpowers skills: `~/.codex/superpowers/skills/`
- Personal skills: `~/.codex/skills/`

**Sources:** [.codex/superpowers-codex8-13](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L8-L13) [.codex/INSTALL.md1-35](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L1-L35)

---

## Diagram: Skills Directory Resolution by Platform

```
```

**Sources:** [.opencode/plugin/superpowers.js34-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L34-L40) [.codex/superpowers-codex8-13](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L8-L13) [RELEASE-NOTES.md450-459](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L450-L459)

---

## Skill Directory Structure

Each skill follows a standard directory structure:

```
skill-name/
├── SKILL.md                    # Required: skill content with YAML frontmatter
├── [supporting-file-1].md      # Optional: bundled documentation
├── [supporting-file-2].sh      # Optional: bundled tools/scripts
├── [prompt-template].md        # Optional: subagent prompt templates
└── [diagram].dot               # Optional: flowchart definitions
```

### SKILL.md Format

Every skill requires a `SKILL.md` file with YAML frontmatter:

```
```

The `name` field uses lowercase kebab-case matching the directory name. The `description` field is critical for skill discovery - it must contain only trigger conditions, not workflow details ("The Description Trap" in v4.0.0).

**Sources:** [RELEASE-NOTES.md106-112](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L106-L112) [lib/skills-core.js6-15](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L6-L15)

---

## Diagram: Skill File Structure and Parsing

```
```

**Sources:** [lib/skills-core.js16-52](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L16-L52) [lib/skills-core.js172-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L172-L200)

---

## Skills Repository Structure (obra/superpowers-skills)

The skills repository contains the actual skill library, organized by category:

```
obra/superpowers-skills/
├── using-superpowers/          # Meta-skill: mandatory protocol
│   └── SKILL.md
│
├── brainstorming/              # Workflow: design before implementation
│   └── SKILL.md
│
├── writing-plans/              # Workflow: convert design to tasks
│   └── SKILL.md
│
├── executing-plans/            # Workflow: batch task execution
│   └── SKILL.md
│
├── subagent-driven-development/ # Workflow: task-by-task with reviews
│   ├── SKILL.md
│   ├── implementer-prompt.md
│   ├── spec-reviewer-prompt.md
│   └── code-quality-reviewer-prompt.md
│
├── test-driven-development/    # Development: RED-GREEN-REFACTOR
│   ├── SKILL.md
│   └── testing-anti-patterns.md
│
├── systematic-debugging/       # Development: four-phase debugging
│   ├── SKILL.md
│   ├── root-cause-tracing.md
│   ├── defense-in-depth.md
│   ├── condition-based-waiting.md
│   └── find-polluter.sh
│
├── using-git-worktrees/        # Development: isolated environments
│   └── SKILL.md
│
├── requesting-code-review/     # Collaboration: invoke code-reviewer
│   └── SKILL.md
│
├── receiving-code-review/      # Collaboration: process review feedback
│   └── SKILL.md
│
├── finishing-a-development-branch/ # Collaboration: merge/PR/discard
│   └── SKILL.md
│
└── writing-skills/             # Meta: creating new skills
    ├── SKILL.md
    └── anthropic-best-practices.md
```

Each skill directory is self-contained with its supporting files.

**Sources:** [RELEASE-NOTES.md70-84](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L70-L84) [RELEASE-NOTES.md122-128](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L122-L128)

---

## Testing Infrastructure Directory Structure

The testing system has multiple layers:

```
tests/
├── skill-triggering/           # Naive prompt tests
│   ├── test-brainstorming-triggering.sh
│   ├── test-debugging-triggering.sh
│   ├── test-executing-plans-triggering.sh
│   ├── test-subagent-triggering.sh
│   ├── test-tdd-triggering.sh
│   └── test-writing-plans-triggering.sh
│
├── claude-code/                # Integration tests (headless)
│   ├── run-integration-tests.sh
│   ├── analyze-token-usage.py
│   └── [session transcript JSONL files]
│
├── opencode/                   # OpenCode plugin tests
│   ├── setup.sh
│   ├── test-skills-core.sh
│   └── test-superpowers-plugin.sh
│
├── subagent-driven-dev/        # End-to-end workflow tests
│   ├── go-fractals/            # CLI tool (10 tasks)
│   │   └── plan.md
│   └── svelte-todo/            # CRUD app (12 tasks)
│       └── plan.md
│
├── explicit-skill-requests/    # Explicit request tests
│   ├── single-turn/
│   └── multi-turn/
│
└── test-helpers.sh             # Shared test utilities
```

The `run-skill-tests.sh` orchestrator executes all test categories with timeout protection.

**Sources:** [RELEASE-NOTES.md93-104](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L93-L104) [tests/opencode/test-skills-core.sh1-440](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L1-L440)

---

## Diagram: Test Infrastructure and File Locations

```
```

**Sources:** [RELEASE-NOTES.md93-104](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L93-L104)

---

## lib/skills-core.js Function Reference

The `lib/skills-core.js` module provides shared utilities used by both OpenCode and Codex:

| Function                                                   | Purpose                                       | Return Type                                    |
| ---------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| `extractFrontmatter(filePath)`                             | Parse YAML frontmatter from SKILL.md          | `{name: string, description: string}`          |
| `stripFrontmatter(content)`                                | Remove frontmatter, return body only          | `string`                                       |
| `findSkillsInDir(dir, sourceType, maxDepth)`               | Recursively find all SKILL.md files           | `Array<{path, name, description, sourceType}>` |
| `resolveSkillPath(skillName, superpowersDir, personalDir)` | Resolve skill name to file path with priority | `{skillFile, sourceType, skillPath}` or `null` |
| `checkForUpdates(repoDir)`                                 | Check if git repo is behind upstream          | `boolean`                                      |

These functions handle:

- Frontmatter parsing ([lib/skills-core.js16-52](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L16-L52))
- Skill shadowing/priority ([lib/skills-core.js99-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L99-L140))
- Namespace prefix handling (`superpowers:`, `project:`)
- Graceful error handling (network timeouts, missing files)

**Sources:** [lib/skills-core.js1-209](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L209) [.opencode/plugin/superpowers.js13](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L13-L13) [.codex/superpowers-codex6](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L6-L6)

---

## Skill Resolution Priority System

Skills are resolved with different priority orders depending on the platform:

### OpenCode Priority (Three-Tier)

```
1. Project skills (.opencode/skills/)     → project:skill-name
2. Personal skills (~/.config/opencode/skills/) → skill-name
3. Superpowers skills (superpowers/skills/)    → superpowers:skill-name
```

Implemented in [.opencode/plugin/superpowers.js108-134](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L108-L134)

### Codex Priority (Two-Tier)

```
1. Personal skills (~/.codex/skills/)          → skill-name
2. Superpowers skills (~/.codex/superpowers/skills/) → superpowers:skill-name
```

Implemented in [.codex/superpowers-codex137-199](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L137-L199)

### Claude Code Priority (Single-Tier)

Claude Code only uses the superpowers skills directory (`~/.config/superpowers/skills/`) with no personal override mechanism. Users fork the skills repository for customization.

### Namespace Prefix Handling

All platforms support namespace prefixes to force specific resolution:

- `superpowers:skill-name` → Always use superpowers skills
- `project:skill-name` → Always use project skills (OpenCode only)
- `skill-name` → Use priority resolution

**Sources:** [.opencode/plugin/superpowers.js99-134](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L99-L134) [.codex/superpowers-codex126-199](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L126-L199) [lib/skills-core.js99-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L99-L140)

---

## File Path Environment Variables

Different platforms use different environment variables for path resolution:

| Platform    | Environment Variable      | Default Value                  | Usage                   |
| ----------- | ------------------------- | ------------------------------ | ----------------------- |
| Claude Code | `SUPERPOWERS_SKILLS_ROOT` | `~/.config/superpowers/skills` | Skills location         |
| Claude Code | `PLUGIN_DIR`              | Plugin installation directory  | Hook execution context  |
| OpenCode    | `OPENCODE_CONFIG_DIR`     | `~/.config/opencode`           | Configuration directory |
| Codex       | (none)                    | Hardcoded paths                | `~/.codex/superpowers/` |

The OpenCode plugin respects `OPENCODE_CONFIG_DIR` for flexible installation locations ([.opencode/plugin/superpowers.js38-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L38-L40)).

For more details on environment variables, see [Environment Variables](obra/superpowers/10.3-environment-variables.md).

**Sources:** [.opencode/plugin/superpowers.js38-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L38-L40) [.codex/superpowers-codex8-13](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L8-L13)

---

## Migration and Backup Directories

When upgrading from v1.x to v2.0, the `initialize-skills.sh` script creates backup directories:

```
~/.config/superpowers/
├── .git.bak/               # Old plugin git repository
├── skills.bak/             # Old skills directory (pre-v2.0)
└── skills/                 # New skills repository clone
    └── .git/               # Skills repository git metadata
```

These backups preserve old personal skills during the migration to the dual repository architecture.

**Sources:** [RELEASE-NOTES.md434-440](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L434-L440)

---

## Platform-Specific Installation Targets

Each platform has documented installation paths:

### Claude Code

```
```

### OpenCode

```
```

### Codex

```
```

**Sources:** [.opencode/INSTALL.md13-25](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L13-L25) [.codex/INSTALL.md7-17](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L7-L17)

---

## Summary: Key Directory Relationships

| Component              | Claude Code                                  | OpenCode                                             | Codex                          |
| ---------------------- | -------------------------------------------- | ---------------------------------------------------- | ------------------------------ |
| **Plugin Location**    | `~/.config/claude-code/plugins/superpowers/` | `~/.config/opencode/plugin/superpowers.js` (symlink) | `~/.codex/superpowers/`        |
| **Superpowers Skills** | `~/.config/superpowers/skills/`              | `~/.config/opencode/superpowers/skills/`             | `~/.codex/superpowers/skills/` |
| **Personal Skills**    | (use fork workflow)                          | `~/.config/opencode/skills/`                         | `~/.codex/skills/`             |
| **Project Skills**     | Not supported                                | `<project>/.opencode/skills/`                        | Not supported                  |
| **Auto-Update**        | Yes (session-start hook)                     | No (manual git pull)                                 | No (manual git pull)           |
| **Priority Tiers**     | 1 (superpowers only)                         | 3 (project > personal > superpowers)                 | 2 (personal > superpowers)     |

**Sources:** All sections above

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Directory Structure](#directory-structure.md)
- [Overview: Dual Repository Architecture](#overview-dual-repository-architecture.md)
- [Plugin Repository Structure](#plugin-repository-structure.md)
- [Diagram: Repository File Structure](#diagram-repository-file-structure.md)
- [Claude Code Directory Structure](#claude-code-directory-structure.md)
- [Plugin Installation Directory](#plugin-installation-directory.md)
- [Skills Installation Directory](#skills-installation-directory.md)
- [OpenCode Directory Structure](#opencode-directory-structure.md)
- [Plugin Installation Directory](#plugin-installation-directory-1.md)
- [Superpowers Installation Directory](#superpowers-installation-directory.md)
- [Personal Skills Directory](#personal-skills-directory.md)
- [Project-Local Skills Directory](#project-local-skills-directory.md)
- [Codex Directory Structure](#codex-directory-structure.md)
- [Superpowers Installation Directory](#superpowers-installation-directory-1.md)
- [Personal Skills Directory](#personal-skills-directory-1.md)
- [Diagram: Skills Directory Resolution by Platform](#diagram-skills-directory-resolution-by-platform.md)
- [Skill Directory Structure](#skill-directory-structure.md)
- [SKILL.md Format](#skillmd-format.md)
- [Diagram: Skill File Structure and Parsing](#diagram-skill-file-structure-and-parsing.md)
- [Skills Repository Structure (obra/superpowers-skills)](#skills-repository-structure-obrasuperpowers-skills.md)
- [Testing Infrastructure Directory Structure](#testing-infrastructure-directory-structure.md)
- [Diagram: Test Infrastructure and File Locations](#diagram-test-infrastructure-and-file-locations.md)
- [lib/skills-core.js Function Reference](#libskills-corejs-function-reference.md)
- [Skill Resolution Priority System](#skill-resolution-priority-system.md)
- [OpenCode Priority (Three-Tier)](#opencode-priority-three-tier.md)
- [Codex Priority (Two-Tier)](#codex-priority-two-tier.md)
- [Claude Code Priority (Single-Tier)](#claude-code-priority-single-tier.md)
- [Namespace Prefix Handling](#namespace-prefix-handling.md)
- [File Path Environment Variables](#file-path-environment-variables.md)
- [Migration and Backup Directories](#migration-and-backup-directories.md)
- [Platform-Specific Installation Targets](#platform-specific-installation-targets.md)
- [Claude Code](#claude-code.md)
- [OpenCode](#opencode.md)
- [Codex](#codex.md)
- [Summary: Key Directory Relationships](#summary-key-directory-relationships.md)
