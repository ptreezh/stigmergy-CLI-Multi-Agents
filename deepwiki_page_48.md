# /obra/superpowers/10.3-environment-variables

Environment Variables | obra/superpowers | DeepWiki

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

# Environment Variables

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [docs/windows/polyglot-hooks.md](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md)
- [hooks/hooks.json](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json)
- [hooks/run-hook.cmd](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd)
- [hooks/session-start.sh](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh)

This document describes the environment variables used by the Superpowers plugin for Claude Code. The plugin uses a minimal set of variables for hook execution and path resolution. For information about the directory structure, see page 10.1. For configuration files, see page 10.2.

## Overview

The Superpowers plugin uses environment variables in two categories:

- **Platform-provided variables** - Set by Claude Code runtime (`CLAUDE_PLUGIN_ROOT`)
- **Standard OS variables** - System environment variables (`HOME`)
- **Internal derived variables** - Computed within hook scripts for path resolution

The plugin follows a minimalist design: most variables are derived internally from `BASH_SOURCE[0]` rather than requiring user configuration. This ensures the plugin works correctly regardless of installation location.

**Sources:** [hooks/session-start.sh1-52](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L52) [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15)

## Environment Variables Reference

The following table lists all environment variables used by the Superpowers plugin:

| Variable             | Example Value                         | Set By              | Used In                     | Purpose                       |
| -------------------- | ------------------------------------- | ------------------- | --------------------------- | ----------------------------- |
| `CLAUDE_PLUGIN_ROOT` | `~/.claude/plugins/superpowers`       | Claude Code runtime | hooks/hooks.json:9          | Plugin installation directory |
| `HOME`               | `/home/username` or `/Users/username` | Operating system    | hooks/session-start.sh:12   | Legacy directory check        |
| `BASH_SOURCE[0]`     | `/path/to/hooks/session-start.sh`     | Bash interpreter    | hooks/session-start.sh:7    | Script location resolution    |
| `SCRIPT_DIR`         | `/path/to/plugin/hooks`               | Derived in script   | hooks/session-start.sh:7-8  | Hooks directory path          |
| `PLUGIN_ROOT`        | `/path/to/plugin`                     | Derived in script   | hooks/session-start.sh:8,18 | Plugin root directory         |

**Variable Scope:**

- `CLAUDE_PLUGIN_ROOT` is available during hook command expansion but not within script execution
- `HOME` is inherited from the system environment
- `BASH_SOURCE[0]`, `SCRIPT_DIR`, and `PLUGIN_ROOT` are local to the hook script

**Sources:** [hooks/hooks.json9](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L9-L9) [hooks/session-start.sh7-8](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L7-L8) [hooks/session-start.sh12](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L12-L12)

## Platform-Provided Variables

### CLAUDE\_PLUGIN\_ROOT

The `CLAUDE_PLUGIN_ROOT` variable is set by the Claude Code runtime and points to the plugin's installation directory. This variable is **not user-configurable**—it is automatically set when the plugin is loaded.

**Typical value:** `~/.claude/plugins/superpowers`

**Usage:**

The variable appears in the hook command definition in `hooks.json`:

```
```

Claude Code expands `${CLAUDE_PLUGIN_ROOT}` to the absolute plugin path **before** executing the command. The variable is not accessible within the shell script itself—it is expanded during command construction.

**Hook Execution Flow:**

```
```

**Sources:** [hooks/hooks.json9](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L9-L9) [hooks/run-hook.cmd1-19](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L19)

### HOME

The `HOME` variable is the standard OS environment variable pointing to the user's home directory. It is inherited from the system environment and used by the session start hook.

**Purpose:**

Used to check for the legacy skills directory from Superpowers v2.x:

```
```

If the legacy directory exists, a warning is displayed instructing users to migrate custom skills to `~/.claude/skills/` and remove the old directory.

**Migration Note:**

Prior to v3.0.1, Superpowers cloned a separate skills repository to `~/.config/superpowers/skills/`. Since v3.0.1, the plugin uses Claude Code's native skills system with skills embedded in the plugin directory. Custom skills should be placed in `~/.claude/skills/` instead.

**Sources:** [hooks/session-start.sh12-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L12-L15) [RELEASE-NOTES.md389-391](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L389-L391)

## Script-Derived Variables

These variables are computed within `session-start.sh` and are not set by external systems.

### BASH\_SOURCE\[0]

`BASH_SOURCE[0]` is a built-in Bash array containing the path to the currently executing script file. The session start hook uses a fallback pattern to ensure compatibility:

```
```

The `${BASH_SOURCE[0]:-$0}` syntax provides a fallback to `$0` (the script name) when `BASH_SOURCE` is unavailable. This handles execution contexts where `BASH_SOURCE` may be unbound.

**Historical Context:**

In v2.0.1, the hook failed with "Plugin hook error" because `BASH_SOURCE` was unbound in Claude Code's execution context. The fallback pattern fixed this issue.

**Sources:** [hooks/session-start.sh7](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L7-L7) [RELEASE-NOTES.md399-404](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L399-L404)

### SCRIPT\_DIR and PLUGIN\_ROOT

These variables construct absolute paths for plugin resources:

```
```

**Usage:**

- `SCRIPT_DIR` - Absolute path to `hooks/` directory
- `PLUGIN_ROOT` - Absolute path to plugin installation root
- Read skill content: `cat "${PLUGIN_ROOT}/skills/using-superpowers/SKILL.md"` [hooks/session-start.sh18](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L18-L18)

**Path Resolution Process:**

```
```

**Sources:** [hooks/session-start.sh7-8](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L7-L8) [hooks/session-start.sh18](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L18-L18)

### Other Local Variables

The session start hook defines additional local variables for message construction:

| Variable                    | Line | Purpose                                             |
| --------------------------- | ---- | --------------------------------------------------- |
| `warning_message`           | 11   | Stores legacy directory warning if applicable       |
| `legacy_skills_dir`         | 12   | Path to check: `${HOME}/.config/superpowers/skills` |
| `using_superpowers_content` | 18   | Content of using-superpowers skill                  |
| `using_superpowers_escaped` | 39   | JSON-escaped skill content                          |
| `warning_escaped`           | 40   | JSON-escaped warning message                        |

These variables are scoped to the script execution and not exported to the environment.

**Sources:** [hooks/session-start.sh11-40](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L11-L40)

## Skills Directory Locations

The Superpowers plugin stores skills in the plugin directory and supports custom skills in the Claude Code skills directory. These paths are derived from environment variables and platform conventions:

| Directory            | Path                            | Purpose                                     |
| -------------------- | ------------------------------- | ------------------------------------------- |
| **Plugin Skills**    | `${PLUGIN_ROOT}/skills/`        | Skills shipped with the plugin              |
| **Personal Skills**  | `~/.claude/skills/`             | User's custom skills (Claude Code)          |
| **Legacy Directory** | `~/.config/superpowers/skills/` | Deprecated v2.x location (triggers warning) |

**Path Resolution in Code:**

```
```

**Legacy Directory Warning:**

If `~/.config/superpowers/skills/` exists, the session start hook displays:

```
⚠️ WARNING: Superpowers now uses Claude Code's skills system. 
Custom skills in ~/.config/superpowers/skills will not be read. 
Move custom skills to ~/.claude/skills instead. 
To make this message go away, remove ~/.config/superpowers/skills
```

This directory was used in v2.x for automatic skills repository cloning, which is no longer supported in v3.0+.

**Sources:** [hooks/session-start.sh12-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L12-L15) [hooks/session-start.sh18](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L18-L18) [RELEASE-NOTES.md389-391](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L389-L391)

## Variable Usage Across Files

The following diagram shows how environment variables flow through the hook execution system:

**Complete Variable Flow:**

```
```

**Variable Dependencies Table:**

| Variable             | Source      | Line                | Used By           | Purpose                 |
| -------------------- | ----------- | ------------------- | ----------------- | ----------------------- |
| `CLAUDE_PLUGIN_ROOT` | Claude Code | hooks.json:9        | Command expansion | Locate run-hook.cmd     |
| `BASH_SOURCE[0]`     | Bash        | session-start.sh:7  | dirname           | Find script location    |
| `SCRIPT_DIR`         | Derived     | session-start.sh:7  | Line 8            | Locate hooks/ directory |
| `PLUGIN_ROOT`        | Derived     | session-start.sh:8  | Line 18           | Read plugin skills      |
| `HOME`               | OS          | session-start.sh:12 | Line 13           | Check legacy directory  |

**Sources:** [hooks/hooks.json9](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L9-L9) [hooks/run-hook.cmd1-19](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L19) [hooks/session-start.sh7-18](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L7-L18)

## Variable Scope and Lifecycle

### Command Expansion vs. Script Execution

**Important distinction:** `CLAUDE_PLUGIN_ROOT` is expanded during command construction but is **not available** inside the executing script.

**Two-Phase Process:**

```
```

This design allows the script to determine its location independently, making it testable outside the Claude Code runtime.

**Sources:** [hooks/hooks.json9](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L9-L9) [hooks/session-start.sh7-8](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L7-L8)

### Script Variable Scope

All variables assigned in `session-start.sh` are local to that execution:

```
```

**Lifetime:**

- Variables exist only during hook execution
- Not exported to child processes (no `export` statements)
- Recalculated on each SessionStart event
- No persistent state between sessions

**Sources:** [hooks/session-start.sh7-18](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L7-L18)

## Legacy Variables (Deprecated)

The following variables were used in Superpowers v2.x but have been removed in v3.0+:

### SUPERPOWERS\_SKILLS\_ROOT

**Former Purpose:** Referenced the cloned skills repository at `~/.config/superpowers/skills`

**Status:** Removed in v3.0.1 when plugin switched to Claude Code's native skills system

**Migration:** Skills are now embedded in the plugin directory. The legacy directory path is only checked to display a migration warning.

### SKILLS\_DIR and SKILLS\_REPO

**Former Purpose:**

- `SKILLS_DIR` - Target directory for cloning `obra/superpowers-skills`
- `SKILLS_REPO` - Repository URL for automatic updates

**Used By:** `lib/initialize-skills.sh` (removed in v3.0)

**Status:** The v2.x auto-update architecture was completely removed when the plugin adopted Claude Code's native skills system. The separate skills repository workflow no longer exists.

**Legacy Directory Warning:**

The only remaining reference to the v2.x architecture is the warning check:

```
```

**Sources:** [hooks/session-start.sh12-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L12-L15) [RELEASE-NOTES.md389-391](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L389-L391) [RELEASE-NOTES.md522](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L522-L522)

## Debugging and Verification

### Verifying Path Resolution

To debug path resolution issues, manually test the script logic:

```
```

**Expected output:**

```
SCRIPT_DIR: /Users/username/.claude/plugins/superpowers/hooks
PLUGIN_ROOT: /Users/username/.claude/plugins/superpowers
```

### Testing Hook Execution

Run the session start hook manually to verify JSON output:

```
```

**Expected output:** Valid JSON with `hookSpecificOutput.additionalContext` containing the using-superpowers skill content.

**Common issues:**

- **"Error reading using-superpowers skill"** - `PLUGIN_ROOT` is incorrect or skills directory is missing
- **Malformed JSON** - Check the `escape_for_json` function for special character handling
- **Empty output** - Script may be failing early; check `set -euo pipefail` behavior

### Checking Legacy Directory

Verify if the legacy directory exists and should trigger a warning:

```
```

If present, the warning will appear in the session context. To remove the warning, delete this directory after migrating custom skills to `~/.claude/skills/`.

### Polyglot Wrapper Testing

Test cross-platform hook execution:

**On Unix/macOS:**

```
```

**On Windows:**

```
```

The wrapper should invoke `session-start.sh` correctly on both platforms.

**Sources:** [hooks/session-start.sh7-18](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L7-L18) [hooks/run-hook.cmd1-19](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L19)

## Summary

The Superpowers system uses a minimal environment variable footprint:

- **Two user-facing variables** (`SKILLS_DIR`, `SKILLS_REPO`) with sensible defaults
- **One platform variable** (`CLAUDE_PLUGIN_ROOT`) set automatically
- **Standard variables** (`HOME`) from the operating system

This design minimizes configuration complexity while allowing customization when needed. Most users never need to set or modify these variables—the defaults work correctly for standard installations.

**Sources:** [lib/initialize-skills.sh4-5](https://github.com/obra/superpowers/blob/a01a135f/lib/initialize-skills.sh#L4-L5) [hooks/hooks.json9](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L9-L9)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Environment Variables](#environment-variables.md)
- [Overview](#overview.md)
- [Environment Variables Reference](#environment-variables-reference.md)
- [Platform-Provided Variables](#platform-provided-variables.md)
- [CLAUDE\_PLUGIN\_ROOT](#claude_plugin_root.md)
- [HOME](#home.md)
- [Script-Derived Variables](#script-derived-variables.md)
- [BASH\_SOURCE\[0\]](#bash_source0.md)
- [SCRIPT\_DIR and PLUGIN\_ROOT](#script_dir-and-plugin_root.md)
- [Other Local Variables](#other-local-variables.md)
- [Skills Directory Locations](#skills-directory-locations.md)
- [Variable Usage Across Files](#variable-usage-across-files.md)
- [Variable Scope and Lifecycle](#variable-scope-and-lifecycle.md)
- [Command Expansion vs. Script Execution](#command-expansion-vs-script-execution.md)
- [Script Variable Scope](#script-variable-scope.md)
- [Legacy Variables (Deprecated)](#legacy-variables-deprecated.md)
- [SUPERPOWERS\_SKILLS\_ROOT](#superpowers_skills_root.md)
- [SKILLS\_DIR and SKILLS\_REPO](#skills_dir-and-skills_repo.md)
- [Debugging and Verification](#debugging-and-verification.md)
- [Verifying Path Resolution](#verifying-path-resolution.md)
- [Testing Hook Execution](#testing-hook-execution.md)
- [Checking Legacy Directory](#checking-legacy-directory.md)
- [Polyglot Wrapper Testing](#polyglot-wrapper-testing.md)
- [Summary](#summary.md)
