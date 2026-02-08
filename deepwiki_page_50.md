# /obra/superpowers/10.4-polyglot-wrapper-pattern

Polyglot Wrapper Pattern | obra/superpowers | DeepWiki

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

# Polyglot Wrapper Pattern

Relevant source files

- [docs/windows/polyglot-hooks.md](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md)
- [hooks/hooks.json](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json)
- [hooks/run-hook.cmd](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd)
- [hooks/session-start.sh](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh)

This document describes the cross-platform shell script execution mechanism implemented in [hooks/run-hook.cmd](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd) The wrapper allows `.sh` scripts to execute on both Windows (CMD.exe) and Unix systems (bash/sh) using a polyglot syntax technique. This pattern is essential for session hooks that must work across all supported platforms.

For information about session lifecycle and hook execution, see [Session Lifecycle and Bootstrap](obra/superpowers/4.4-session-lifecycle-and-bootstrap.md). For platform-specific integration details, see [Multi-Platform Integration](obra/superpowers/4.3-multi-platform-integration.md).

---

## The Cross-Platform Challenge

Claude Code executes hook commands through the system's default shell, which creates platform-specific execution barriers:

| Platform    | Shell          | Problems                                                        |
| ----------- | -------------- | --------------------------------------------------------------- |
| Windows     | `CMD.exe`      | Cannot execute `.sh` files directly; treats them as text files  |
| macOS/Linux | `bash` or `sh` | Cannot execute `.cmd` files; Windows-specific syntax is invalid |

Additional complications include:

- **Path format differences**: Windows uses backslashes (`C:\path`), Unix uses forward slashes (`/path`)
- **Environment variable syntax**: `$VAR` syntax doesn't work in CMD
- **Missing bash in PATH**: Git Bash's `bash.exe` is not in the Windows PATH by default

The superpowers plugin requires hooks to work identically across platforms without maintaining separate platform-specific files or requiring user configuration.

**Sources**: [docs/windows/polyglot-hooks.md5-17](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L5-L17)

---

## Polyglot Script Technique

The solution is a script that is syntactically valid in both CMD batch language and bash shell language simultaneously. The same file executes different code paths depending on which interpreter runs it.

### Dual Syntax Structure

```
CMD Execution Path (Windows)
┌─────────────────────────────────┐
│ : << 'CMDBLOCK'                 │ ← CMD sees : as label, ignores rest
│ @echo off                        │ ← CMD executes from here
│ [Windows-specific commands]     │
│ exit /b                          │ ← CMD stops here
│ CMDBLOCK                         │
│                                  │
│ # Unix shell runs from here     │ ← Never reached by CMD
│ [Unix-specific commands]         │
└─────────────────────────────────┘

Bash Execution Path (Unix)
┌─────────────────────────────────┐
│ : << 'CMDBLOCK'                 │ ← Bash starts heredoc
│ @echo off                        │ ← Consumed by heredoc (ignored)
│ [Windows-specific commands]     │ ← Consumed by heredoc (ignored)
│ exit /b                          │ ← Consumed by heredoc (ignored)
│ CMDBLOCK                         │ ← Heredoc ends
│                                  │
│ # Unix shell runs from here     │ ← Bash executes from here
│ [Unix-specific commands]         │
└─────────────────────────────────┘
```

**Sources**: [hooks/run-hook.cmd1-20](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L20) [docs/windows/polyglot-hooks.md20-51](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L20-L51)

---

## Platform-Specific Execution Flow

The following diagram shows how the same file executes differently on each platform:

### Execution Path by Platform

```
```

**Sources**: [hooks/run-hook.cmd1-20](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L20) [docs/windows/polyglot-hooks.md34-51](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L34-L51)

---

## The CMDBLOCK Heredoc Marker

The polyglot technique relies on how CMD and bash interpret the `: << 'CMDBLOCK'` syntax differently:

### CMD Interpretation

In CMD batch language:

- `:` is a **label marker** (like `:label` for `goto` statements)
- Everything after `:` on the same line is ignored
- CMD continues executing the next line (`@echo off`)
- The `exit /b` command stops execution before reaching bash-specific code

[hooks/run-hook.cmd1-12](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L12) shows the CMD path executing lines 2-12, then stopping.

### Bash Interpretation

In bash shell language:

- `:` is a **no-op command** (null command)
- `<< 'CMDBLOCK'` starts a **heredoc** (here-document) with delimiter `CMDBLOCK`
- All lines until the delimiter are consumed and discarded
- Bash continues executing after the `CMDBLOCK` line

[hooks/run-hook.cmd1-19](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L19) shows bash consuming lines 2-13 as heredoc content, then executing from line 16 onward.

### Heredoc Delimiter Properties

| Property       | Value                      | Reason                                     |
| -------------- | -------------------------- | ------------------------------------------ |
| Delimiter name | `CMDBLOCK`                 | Descriptive; indicates CMD block content   |
| Quote style    | Single quotes `'CMDBLOCK'` | Prevents variable expansion inside heredoc |
| Position       | Must be on its own line    | Bash heredoc terminator requirement        |

**Sources**: [hooks/run-hook.cmd1-13](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L13) [docs/windows/polyglot-hooks.md37-50](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L37-L50)

---

## Invocation via hooks.json

The wrapper is invoked through Claude Code's hook system as specified in [hooks/hooks.json](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json):

```
```

### Invocation Sequence

```
```

### Path Quoting Requirements

The `${CLAUDE_PLUGIN_ROOT}` variable must be quoted because:

- Windows paths may contain spaces (e.g., `C:\Program Files\Claude\plugins\`)
- Without quotes, CMD tokenizes on spaces, breaking the path
- [hooks/hooks.json9](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L9-L9) uses `\"${CLAUDE_PLUGIN_ROOT}/...\"` for this reason

**Sources**: [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15) [docs/windows/polyglot-hooks.md61-81](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L61-L81)

---

## Implementation Breakdown

### Windows (CMD) Code Path

The Windows execution path in [hooks/run-hook.cmd1-12](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L12):

```
: << 'CMDBLOCK'                     # Line 1: Treated as :label
@echo off                            # Line 2: Suppress echo
REM Polyglot wrapper...              # Lines 3-5: Comments
                                     # Line 6: Empty
if "%~1"=="" (                       # Lines 7-10: Validate arg
    echo run-hook.cmd: missing script name >&2
    exit /b 1
)
"C:\Program Files\Git\bin\bash.exe" -l "%~dp0%~1" %2 %3 %4 %5 %6 %7 %8 %9  # Line 11
exit /b                              # Line 12: Exit CMD
```

#### CMD-Specific Constructs

| Construct      | Purpose                      | Example                                  |
| -------------- | ---------------------------- | ---------------------------------------- |
| `%~1`          | First argument               | `session-start.sh`                       |
| `%~dp0`        | Drive and path of batch file | `C:\path\to\hooks\`                      |
| `%2 %3 ... %9` | Forward up to 9 arguments    | Additional script args                   |
| `exit /b`      | Exit with return code        | Returns to caller without closing window |

The wrapper uses the **full path** to `bash.exe` because Git Bash is not in CMD's PATH by default. The `-l` flag runs bash as a login shell, ensuring proper PATH setup with Unix utilities.

**Sources**: [hooks/run-hook.cmd1-12](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L12) [docs/windows/polyglot-hooks.md36-44](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L36-L44)

### Unix (Bash) Code Path

The Unix execution path in [hooks/run-hook.cmd15-19](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L15-L19):

```
```

#### Bash-Specific Constructs

| Construct          | Purpose                          | Value Example                                  |
| ------------------ | -------------------------------- | ---------------------------------------------- |
| `$(dirname "$0")`  | Directory of wrapper script      | `/home/user/.claude/plugins/superpowers/hooks` |
| `$(cd ... && pwd)` | Absolute path resolution         | Canonicalized path                             |
| `$1`               | First argument                   | `session-start.sh`                             |
| `shift`            | Remove first argument from `$@`  | Remaining args for target script               |
| `"$@"`             | All remaining arguments (quoted) | Preserves argument boundaries                  |

The wrapper changes to its own directory before executing the target script, ensuring relative paths work correctly regardless of the current working directory.

**Sources**: [hooks/run-hook.cmd15-19](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L15-L19) [docs/windows/polyglot-hooks.md46-51](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L46-L51)

---

## File Structure and Dependencies

### Hook System File Organization

```
plugins/superpowers/
├── hooks/
│   ├── hooks.json              # Hook registration
│   ├── run-hook.cmd            # Polyglot wrapper (cross-platform entry)
│   └── session-start.sh        # Hook implementation (bash script)
└── skills/
    └── using-superpowers/
        └── SKILL.md            # Content loaded by session-start.sh
```

### Dependency Chain

```
```

**Sources**: [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15) [hooks/run-hook.cmd1-20](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L1-L20) [hooks/session-start.sh1-19](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L19)

---

## Requirements and Constraints

### Windows Requirements

| Requirement               | Reason                                 | Detection Method                                    |
| ------------------------- | -------------------------------------- | --------------------------------------------------- |
| Git for Windows installed | Provides `bash.exe` and Unix utilities | Check `C:\Program Files\Git\bin\bash.exe` existence |
| Default installation path | Wrapper hardcodes path                 | Modify wrapper if non-standard                      |
| Git Bash login shell      | `-l` flag required for PATH            | Ensures `dirname`, `cd`, `pwd` available            |

If Git for Windows is installed in a non-standard location, [hooks/run-hook.cmd11](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L11-L11) must be modified to use the correct path.

**Sources**: [docs/windows/polyglot-hooks.md84-89](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L84-L89) [hooks/run-hook.cmd11](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L11-L11)

### Unix Requirements

| Requirement        | Reason                         | Verification Method                  |
| ------------------ | ------------------------------ | ------------------------------------ |
| Execute permission | `.cmd` file must be executable | `chmod +x hooks/run-hook.cmd`        |
| Standard bash/sh   | POSIX-compliant shell          | Available on all macOS/Linux systems |
| UTF-8 support      | For script content             | Standard in modern Unix systems      |

The `.cmd` extension may seem unusual on Unix, but the file is a valid shell script due to the polyglot structure. The shebang is not used; the wrapper is executed by bash as specified in [hooks/hooks.json](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json)

**Sources**: [docs/windows/polyglot-hooks.md90-92](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L90-L92)

---

## Script Development Guidelines

When creating scripts to be executed via `run-hook.cmd`, follow these constraints to ensure Windows compatibility:

### Compatible Bash Constructs

```
```

### JSON Escaping Example

[hooks/session-start.sh21-37](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L21-L37) demonstrates pure bash JSON escaping without external dependencies:

```
```

This function avoids `sed`, `awk`, and `grep`, which may have different implementations or be missing from Git Bash's minimal environment.

**Sources**: [hooks/session-start.sh21-37](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L21-L37) [docs/windows/polyglot-hooks.md94-134](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L94-L134)

---

## Common Issues and Troubleshooting

### Problem: "bash is not recognized as an internal or external command"

**Cause**: Git for Windows not installed, or installed in non-standard location.

**Solution**: Install Git for Windows, or modify [hooks/run-hook.cmd11](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L11-L11) to use the correct path:

```
```

### Problem: "cygpath: command not found" or "dirname: command not found"

**Cause**: Bash not running as login shell; PATH not set up with Unix utilities.

**Solution**: Ensure `-l` flag is used in [hooks/run-hook.cmd11](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd#L11-L11) Git Bash's login shell sources `/etc/profile` to set up PATH.

### Problem: Script opens in text editor instead of executing

**Cause**: [hooks/hooks.json](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json) points directly to `.sh` file instead of `.cmd` wrapper.

**Solution**: Change:

```
```

### Problem: Path contains mixed separators like `C:\path\/hooks`

**Cause**: Windows path from `${CLAUDE_PLUGIN_ROOT}` concatenated with Unix-style `/hooks/...`.

**Solution**: Windows CMD and Git Bash both accept forward slashes. The issue is cosmetic; execution still works. To fix display, use `cygpath -u` for full path conversion (not implemented in current version).

**Sources**: [docs/windows/polyglot-hooks.md188-207](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L188-L207)

---

## Reusable Pattern Template

The `run-hook.cmd` wrapper is designed for reuse with multiple hook scripts. Instead of creating separate wrappers for each hook, a single wrapper accepts the script name as an argument:

### Generic Wrapper Usage

```
```

This pattern allows adding new hooks by:

1. Creating new `.sh` script in `hooks/` directory
2. Adding entry to `hooks.json` referencing `run-hook.cmd` with script name
3. No need to create platform-specific wrapper for each hook

**Sources**: [docs/windows/polyglot-hooks.md136-185](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md#L136-L185) [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Polyglot Wrapper Pattern](#polyglot-wrapper-pattern.md)
- [The Cross-Platform Challenge](#the-cross-platform-challenge.md)
- [Polyglot Script Technique](#polyglot-script-technique.md)
- [Dual Syntax Structure](#dual-syntax-structure.md)
- [Platform-Specific Execution Flow](#platform-specific-execution-flow.md)
- [Execution Path by Platform](#execution-path-by-platform.md)
- [The CMDBLOCK Heredoc Marker](#the-cmdblock-heredoc-marker.md)
- [CMD Interpretation](#cmd-interpretation.md)
- [Bash Interpretation](#bash-interpretation.md)
- [Heredoc Delimiter Properties](#heredoc-delimiter-properties.md)
- [Invocation via hooks.json](#invocation-via-hooksjson.md)
- [Invocation Sequence](#invocation-sequence.md)
- [Path Quoting Requirements](#path-quoting-requirements.md)
- [Implementation Breakdown](#implementation-breakdown.md)
- [Windows (CMD) Code Path](#windows-cmd-code-path.md)
- [CMD-Specific Constructs](#cmd-specific-constructs.md)
- [Unix (Bash) Code Path](#unix-bash-code-path.md)
- [Bash-Specific Constructs](#bash-specific-constructs.md)
- [File Structure and Dependencies](#file-structure-and-dependencies.md)
- [Hook System File Organization](#hook-system-file-organization.md)
- [Dependency Chain](#dependency-chain.md)
- [Requirements and Constraints](#requirements-and-constraints.md)
- [Windows Requirements](#windows-requirements.md)
- [Unix Requirements](#unix-requirements.md)
- [Script Development Guidelines](#script-development-guidelines.md)
- [Compatible Bash Constructs](#compatible-bash-constructs.md)
- [JSON Escaping Example](#json-escaping-example.md)
- [Common Issues and Troubleshooting](#common-issues-and-troubleshooting.md)
- [Problem: "bash is not recognized as an internal or external command"](#problem-bash-is-not-recognized-as-an-internal-or-external-command.md)
- [Problem: "cygpath: command not found" or "dirname: command not found"](#problem-cygpath-command-not-found-or-dirname-command-not-found.md)
- [Problem: Script opens in text editor instead of executing](#problem-script-opens-in-text-editor-instead-of-executing.md)
- [Problem: Path contains mixed separators like \`C:\path\\/hooks\`](#problem-path-contains-mixed-separators-like-cpathhooks.md)
- [Reusable Pattern Template](#reusable-pattern-template.md)
- [Generic Wrapper Usage](#generic-wrapper-usage.md)
