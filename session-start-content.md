# /obra/superpowers/2.1-installing-on-claude-code

Installing on Claude Code | obra/superpowers | DeepWiki

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

# Installing on Claude Code

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [docs/windows/polyglot-hooks.md](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md)
- [hooks/hooks.json](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json)
- [hooks/run-hook.cmd](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd)
- [hooks/session-start.sh](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh)

This document provides step-by-step installation instructions for Superpowers on Claude Code using the plugin marketplace system. The installation is fully automated.

For OpenCode installation, see page 2.2. For Codex installation, see page 2.3.

## Overview

Superpowers integrates with Claude Code as a native plugin that:

1. Installs via the marketplace system
2. Bundles all skills within the plugin package
3. Configures a `SessionStart` hook to load the mandatory protocol
4. Provides slash commands (`/brainstorm`, `/write-plan`, `/execute-plan`)

All skills are distributed as part of the plugin package. Updates to skills are delivered through plugin updates.

Sources: [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13) [hooks/session-start.sh1-53](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L53)

## Prerequisites

| Requirement | Purpose       | Required |
| ----------- | ------------- | -------- |
| Claude Code | Host platform | Yes      |

No additional dependencies are required. All skills are bundled with the plugin.

Sources: [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13)

## Installation Steps

### 1. Add the Marketplace

```
```

This registers the Superpowers marketplace with Claude Code, enabling plugin discovery and installation.

### 2. Install the Plugin

```
```

Claude Code downloads and installs the plugin to `~/.claude/plugins/superpowers/`, which includes:

- Skills library in `skills/` directory
- `SessionStart` hook registration from `hooks/hooks.json`
- Slash command definitions in `.claude-plugin/commands/`
- `code-reviewer` agent in `agents/`

### 3. Verify Installation

Start a new session or run:

```
```

Confirm these commands appear:

```
/brainstorm - Interactive design refinement
/write-plan - Create implementation plan
/execute-plan - Execute plan in batches
```

The commands are available for manual invocation. The underlying skills (`superpowers:brainstorming`, `superpowers:writing-plans`, `superpowers:executing-plans`) can be invoked by Claude autonomously via the Skill tool.

Sources: [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13) [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15) [RELEASE-NOTES.md25-29](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L25-L29)

**Installation Flow: Marketplace to Local Plugin Directory**

```
```

Claude Code reads configuration files from the plugin directory to register hooks and commands. Skills are bundled directly in the `skills/` directory.

Sources: [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13) [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15) [hooks/session-start.sh1-53](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L53)

## First Session Bootstrap

When you start a session, Claude Code triggers the `SessionStart` hook defined in `hooks/hooks.json`, which executes `hooks/session-start.sh` via the `run-hook.cmd` polyglot wrapper.

**Session Startup Sequence**

```
```

The hook executes via `run-hook.cmd` polyglot wrapper [hooks/run-hook.cmd1-20](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L20) which handles cross-platform execution. The bash script [hooks/session-start.sh1-53](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L53) performs:

1. **Legacy detection** (line 13): Checks if `~/.config/superpowers/skills/` exists
2. **Skill loading** (line 18): Reads `skills/using-superpowers/SKILL.md` via `cat`
3. **JSON escaping** (lines 21-37): Pure bash `escape_for_json()` function using character-by-character case matching
4. **Structured output** (lines 43-49): Returns JSON with `hookSpecificOutput.additionalContext` field
5. **Context injection**: Claude Code parses JSON and injects content wrapped in `<EXTREMELY_IMPORTANT>` tags

Sources: [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15) [hooks/run-hook.cmd1-20](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L20) [hooks/session-start.sh1-53](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L53)

## Plugin Directory Structure

```
~/.claude/plugins/superpowers/
├── .claude-plugin/
│   ├── plugin.json             # name, version, metadata
│   ├── marketplace.json        # Marketplace configuration
│   └── commands/
│       ├── brainstorm.md       # /brainstorm command
│       ├── write-plan.md       # /write-plan command
│       └── execute-plan.md     # /execute-plan command
├── hooks/
│   ├── hooks.json              # SessionStart hook registration
│   ├── run-hook.cmd            # Polyglot wrapper (Windows + Unix)
│   └── session-start.sh        # Bootstrap script
├── skills/
│   ├── using-superpowers/
│   │   └── SKILL.md            # Mandatory first-response protocol
│   ├── brainstorming/
│   │   └── SKILL.md
│   ├── test-driven-development/
│   │   └── SKILL.md
│   ├── systematic-debugging/
│   │   └── SKILL.md
│   ├── subagent-driven-development/
│   │   ├── SKILL.md
│   │   ├── implementer-prompt.md
│   │   ├── spec-reviewer-prompt.md
│   │   └── code-quality-reviewer-prompt.md
│   ├── writing-plans/
│   │   └── SKILL.md
│   ├── executing-plans/
│   │   └── SKILL.md
│   ├── using-git-worktrees/
│   │   └── SKILL.md
│   ├── finishing-a-development-branch/
│   │   └── SKILL.md
│   ├── requesting-code-review/
│   │   └── SKILL.md
│   ├── receiving-code-review/
│   │   └── SKILL.md
│   └── writing-skills/
│       ├── SKILL.md
│       └── anthropic-best-practices.md
└── agents/
    └── code-reviewer.md        # superpowers:code-reviewer agent
```

All skills are distributed as part of the plugin package. Each skill directory contains a `SKILL.md` file with YAML frontmatter and markdown content. Some skills include supporting files (prompt templates, examples, reference documents).

Sources: [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13) [hooks/session-start.sh1-53](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L53) [agents/code-reviewer.md1-49](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L49)

## Legacy Directory Warning

If you upgraded from an earlier version of Superpowers (v3.x or earlier), you may have a legacy skills directory at `~/.config/superpowers/skills/`. The current version bundles skills in the plugin directory and no longer uses this location.

The `session-start.sh` hook checks for this directory and displays a warning in your first message:

```
⚠️ WARNING: Superpowers now uses Claude Code's skills system.
Custom skills in ~/.config/superpowers/skills will not be read.
Move custom skills to ~/.claude/skills instead.
To make this message go away, remove ~/.config/superpowers/skills
```

**Migration steps:**

1. Review custom skills in `~/.config/superpowers/skills/`
2. Move them to `~/.claude/skills/` (personal skills directory)
3. Remove the old directory: `rm -rf ~/.config/superpowers/skills`

Personal skills in `~/.claude/skills/` are discovered by Claude Code's native skills system alongside plugin-provided skills.

Sources: [hooks/session-start.sh10-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L10-L15) [RELEASE-NOTES.md4](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L4-L4)

## Environment Variables

Claude Code provides plugin context via environment variables:

| Variable             | Value                           | Set By      | Used In                          | Purpose                            |
| -------------------- | ------------------------------- | ----------- | -------------------------------- | ---------------------------------- |
| `CLAUDE_PLUGIN_ROOT` | `~/.claude/plugins/superpowers` | Claude Code | `hooks.json`, `session-start.sh` | Plugin installation directory path |

**Usage in code:**

1. **hooks.json** (line 9): References hook script path

   ```
   ```

2. **session-start.sh** (lines 7-8): Resolves plugin root from `BASH_SOURCE[0]`

   ```
   ```

   The script calculates `PLUGIN_ROOT` independently rather than relying on `CLAUDE_PLUGIN_ROOT` to ensure portability.

**Deprecated variables:**

| Variable                  | Status          | Notes                                  |
| ------------------------- | --------------- | -------------------------------------- |
| `SUPERPOWERS_SKILLS_ROOT` | Removed in v4.x | Skills now bundled in plugin directory |

Sources: [hooks/hooks.json9](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L9-L9) [hooks/session-start.sh7-8](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L7-L8)

**Bootstrap Context Injection Flow**

```
```

The injection process uses structured JSON output from the hook script:

| Step                 | Line(s)  | Operation                                 | Output                      |
| -------------------- | -------- | ----------------------------------------- | --------------------------- |
| 1. Environment       | -        | Claude Code sets `CLAUDE_PLUGIN_ROOT`     | Plugin directory path       |
| 2. Hook trigger      | 3-14     | `hooks.json` matches event pattern        | Execute command             |
| 3. Wrapper exec      | 11 or 19 | `run-hook.cmd` dispatches to bash         | Platform-specific execution |
| 4. Directory resolve | 7-8      | Calculate `PLUGIN_ROOT` from `SCRIPT_DIR` | Absolute path to plugin     |
| 5. Legacy check      | 13       | Test for `~/.config/superpowers/skills/`  | Warning string or empty     |
| 6. Skill read        | 18       | `cat` command reads file                  | Raw markdown content        |
| 7. JSON escape       | 21-37    | Pure bash `escape_for_json()` function    | JSON-safe string            |
| 8. JSON output       | 43-49    | `cat <<EOF` heredoc                       | Structured JSON to stdout   |
| 9. Context inject    | -        | Claude Code parses and injects            | Skill content in session    |

The `additionalContext` field content follows this template [hooks/session-start.sh47](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L47-L47):

```
<EXTREMELY_IMPORTANT>
You have superpowers.

**Below is the full content of your 'superpowers:using-superpowers' skill...**

[escaped skill content]

[optional warning about legacy directory]
</EXTREMELY_IMPORTANT>
```

Sources: [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15) [hooks/run-hook.cmd1-20](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L20) [hooks/session-start.sh1-53](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L53)

## Updating the Plugin

Skills updates are delivered through plugin updates, not separate git operations. To update:

```
```

This downloads the latest version from the marketplace, which includes:

- Updated skill content
- New skills
- Bug fixes to hooks and scripts
- Updated agent definitions

Check the release notes at the repository for version-specific changes.

Sources: [.claude-plugin/plugin.json4](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L4-L4) [.claude-plugin/marketplace.json12](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json#L12-L12)

## Verification After Installation

### Check Plugin is Installed

```
```

Expected output:

```
superpowers (4.0.3)
  Core skills library for Claude Code: TDD, debugging, collaboration patterns, and proven techniques
```

Verify fields match [.claude-plugin/plugin.json2-4](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L2-L4):

- `name`: "superpowers"
- `version`: "4.0.3"
- `description`: "Core skills library for Claude Code: TDD, debugging, collaboration patterns, and proven techniques"

### Check Skills Directory

```
```

Expected directories (each contains `SKILL.md`):

```
brainstorming/
executing-plans/
finishing-a-development-branch/
receiving-code-review/
requesting-code-review/
subagent-driven-development/
systematic-debugging/
test-driven-development/
using-git-worktrees/
using-superpowers/
writing-plans/
writing-skills/
```

### Verify Session Bootstrap

**Test the bootstrap injection:**

1. Start a new Claude Code session (triggers `SessionStart` hook)
2. Check that Claude acknowledges superpowers context
3. Verify Claude follows the mandatory first-response protocol (checks skills before responding)

**Expected behavior:**

- Claude has access to `using-superpowers` skill content without invoking it
- Claude invokes other skills via Skill tool when relevant
- If legacy directory exists, warning appears in first response

**Technical verification:**

The session context should include content from [hooks/session-start.sh47](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L47-L47):

```
<EXTREMELY_IMPORTANT>
You have superpowers.

**Below is the full content of your 'superpowers:using-superpowers' skill...**
```

You can confirm bootstrap execution by checking hook logs or observing that Claude references the skills system immediately.

Sources: [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13) [hooks/session-start.sh18-53](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L18-L53) [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15)

## Personal Skills Directory

Claude Code's native skills system supports personal skills in `~/.claude/skills/`:

```
~/.claude/skills/
└── your-custom-skill/
    └── SKILL.md
```

Personal skills:

- Are discovered by Claude Code's Skill tool alongside plugin skills
- Can be referenced as `your-custom-skill` (no namespace prefix)
- Take precedence if names match plugin-provided skills
- Are not managed by the Superpowers plugin

This allows extending the skills library without modifying the plugin. Skills should follow the same structure: a directory with `SKILL.md` containing YAML frontmatter and markdown content.

Sources: [hooks/session-start.sh10-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L10-L15)

## Troubleshooting

### Bootstrap Not Loading

**Symptom:** Claude doesn't follow mandatory first-response protocol, doesn't check skills

**Diagnosis:**

| Check            | Command                                                               | Expected Result                            |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------ |
| Plugin installed | `/plugin list`                                                        | Shows `superpowers (4.0.3)`                |
| Hooks config     | `cat ~/.claude/plugins/superpowers/hooks/hooks.json`                  | JSON with `SessionStart` hook              |
| Hook script      | `cat ~/.claude/plugins/superpowers/hooks/session-start.sh`            | Bash script, line 1: `#!/usr/bin/env bash` |
| Skill file       | `cat ~/.claude/plugins/superpowers/skills/using-superpowers/SKILL.md` | Markdown with YAML frontmatter             |

**Fix:**

1. Update plugin: `/plugin update superpowers`
2. Start new session (triggers `SessionStart` hook)
3. If issue persists, check Claude Code logs for hook errors

**Root causes:**

- Hook script not executable (Unix): `chmod +x ~/.claude/plugins/superpowers/hooks/*.{cmd,sh}`
- YAML frontmatter parse error in `SKILL.md`
- `run-hook.cmd` polyglot wrapper fails on platform

Sources: [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15) [hooks/session-start.sh1-53](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L53) [hooks/run-hook.cmd1-20](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L20)

### Slash Commands Not Available

**Symptom:** `/brainstorm`, `/write-plan`, `/execute-plan` not found in `/help`

**Diagnosis:**

Commands defined in [.claude-plugin/commands/](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/commands/):

- `brainstorm.md` → `/superpowers:brainstorm` (note: namespace prefix added by Claude Code)
- `write-plan.md` → `/superpowers:write-plan`
- `execute-plan.md` → `/superpowers:execute-plan`

**Check:**

```
```

**Fix:** Reinstall plugin:

```
```

**Note:** As of v4.0.2, commands have `disable-model-invocation: true` [RELEASE-NOTES.md25-29](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L25-L29) - they're user-only, Claude cannot invoke them.

Sources: [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13) [RELEASE-NOTES.md22-29](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L22-L29)

### Polyglot Wrapper Fails on Linux

**Symptom:** "Bad substitution" error in hook logs on Ubuntu/Debian

**Root cause:** `/bin/sh` is `dash` (not bash) on some Linux distributions. The wrapper used bash-specific `${BASH_SOURCE[0]:-$0}` syntax.

**Status:** Fixed in v3.6.2 [RELEASE-NOTES.md138-145](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L138-L145) Line 16 now uses POSIX-compliant `$0`:

```
```

**Fix:** Update plugin to v4.0.3+:

```
```

Sources: [RELEASE-NOTES.md138-145](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L138-L145) [hooks/run-hook.cmd16](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L16-L16)

### Legacy Directory Warning Persists

**Symptom:** Warning appears every session: "⚠️ WARNING: Superpowers now uses Claude Code's skills system. Custom skills in \~/.config/superpowers/skills will not be read."

**Cause:** Legacy directory from v2.x/v3.x installation exists at `~/.config/superpowers/skills/`

**Detection logic** [hooks/session-start.sh12-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L12-L15):

```
```

**Fix:**

1. **Backup custom skills** (if any):
   ```
   ```
2. **Move to personal skills directory**:
   ```
   ```
3. **Remove legacy directory**:
   ```
   ```

Sources: [hooks/session-start.sh10-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L10-L15)

### Hook Execution Fails on Windows

**Symptom:** "bash is not recognized" or "cygpath: command not found"

**Cause:** Git for Windows not installed or bash.exe not at expected path

**Expected path** [hooks/run-hook.cmd11](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L11-L11):

```
```

**Check:**

```
```

**Fix:**

- Install [Git for Windows](https://git-scm.com/download/win) to default location
- Or modify [hooks/run-hook.cmd11](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L11-L11) to point to your Git Bash location

Sources: [hooks/run-hook.cmd11](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L11-L11) [docs/windows/polyglot-hooks.md86-91](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L86-L91)

## Next Steps

After successful installation:

1. **Read** the `using-superpowers` skill loaded at session start
2. **Try** a slash command: `/superpowers:brainstorm`
3. **Explore** skills in `~/.config/superpowers/skills/skills/`
4. **Learn** about the mandatory first response protocol in [Using Superpowers](obra/superpowers/5.1-claude-code:-skill-tool-and-hooks.md)

For details about what happens during each session, see [Session Lifecycle and Bootstrap](#3.4.md).

Sources: [README.md50-76](https://github.com/obra/superpowers/blob/a01a135f/README.md#L50-L76) [skills/using-superpowers/SKILL.md1-102](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L1-L102)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Installing on Claude Code](#installing-on-claude-code.md)
- [Overview](#overview.md)
- [Prerequisites](#prerequisites.md)
- [Installation Steps](#installation-steps.md)
- [1. Add the Marketplace](#1-add-the-marketplace.md)
- [2. Install the Plugin](#2-install-the-plugin.md)
- [3. Verify Installation](#3-verify-installation.md)
- [First Session Bootstrap](#first-session-bootstrap.md)
- [Plugin Directory Structure](#plugin-directory-structure.md)
- [Legacy Directory Warning](#legacy-directory-warning.md)
- [Environment Variables](#environment-variables.md)
- [Updating the Plugin](#updating-the-plugin.md)
- [Verification After Installation](#verification-after-installation.md)
- [Check Plugin is Installed](#check-plugin-is-installed.md)
- [Check Skills Directory](#check-skills-directory.md)
- [Verify Session Bootstrap](#verify-session-bootstrap.md)
- [Personal Skills Directory](#personal-skills-directory.md)
- [Troubleshooting](#troubleshooting.md)
- [Bootstrap Not Loading](#bootstrap-not-loading.md)
- [Slash Commands Not Available](#slash-commands-not-available.md)
- [Polyglot Wrapper Fails on Linux](#polyglot-wrapper-fails-on-linux.md)
- [Legacy Directory Warning Persists](#legacy-directory-warning-persists.md)
- [Hook Execution Fails on Windows](#hook-execution-fails-on-windows.md)
- [Next Steps](#next-steps.md)
