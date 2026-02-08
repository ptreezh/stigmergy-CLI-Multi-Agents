# /obra/superpowers/2-getting-started

Getting Started | obra/superpowers | DeepWiki

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

# Getting Started

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [README.md](https://github.com/obra/superpowers/blob/a01a135f/README.md)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md)
- [skills/writing-skills/testing-skills-with-subagents.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md)

This page provides an overview of installing and configuring Superpowers on both Claude Code and Codex platforms. It covers the high-level installation architecture, what happens during first-time setup, and how to verify your installation is working.

For platform-specific installation steps, see:

- Claude Code installation: [Installing on Claude Code](obra/superpowers/2.1-installing-on-claude-code.md)
- Codex installation: [Installing on Codex](obra/superpowers/2.2-installing-on-opencode.md)

For information about the underlying architecture, see [Architecture](obra/superpowers/3-core-concepts.md).

## Installation Overview

Superpowers uses a two-repository architecture:

1. **Plugin Repository** (`obra/superpowers`) - Lightweight shim that manages skills
2. **Skills Repository** (`obra/superpowers-skills`) - Actual skills content

The installation process differs by platform but achieves the same result: a local clone of the skills repository synchronized with upstream, and platform integration that loads skills at session start.

| Platform    | Integration Method            | Installation Complexity | Maturity     |
| ----------- | ----------------------------- | ----------------------- | ------------ |
| Claude Code | Native plugin via marketplace | Low - automated         | Stable       |
| Codex       | Manual CLI script setup       | Medium - manual steps   | Experimental |

Sources: [README.md1-159](https://github.com/obra/superpowers/blob/a01a135f/README.md#L1-L159) [RELEASE-NOTES.md1-440](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L1-L440)

## Installation Architecture

```
```

**Installation Flow Comparison**

This diagram shows how both platforms install the plugin code and establish the local skills repository. The key difference is the installation mechanism: Claude Code uses the native plugin system, while Codex requires manual script download and configuration. Both platforms share the same local skills directory at `~/.config/superpowers/skills/`.

Sources: [README.md23-48](https://github.com/obra/superpowers/blob/a01a135f/README.md#L23-L48) [RELEASE-NOTES.md18-40](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L18-L40) [RELEASE-NOTES.md223-245](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L223-L245)

## Directory Structure After Installation

After successful installation, your filesystem will contain these directories:

```
```

**Post-Installation Directory Layout**

This diagram shows the actual filesystem paths created during installation. Claude Code places plugin files in `~/.claude/plugins/superpowers/`, while Codex uses a single executable at `~/bin/superpowers-codex`. Both platforms share `~/.config/superpowers/skills/` for the skills repository clone and support platform-specific personal skills directories that can override core skills.

Sources: [RELEASE-NOTES.md223-245](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L223-L245) [README.md80-107](https://github.com/obra/superpowers/blob/a01a135f/README.md#L80-L107)

## First Session Initialization

When you start your first session after installation, the following initialization sequence occurs:

```
```

**Session Initialization Sequence**

This diagram traces the actual code execution during session startup. The [hooks/session-start.sh](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh) (Claude Code) or [scripts/superpowers-codex](https://github.com/obra/superpowers/blob/a01a135f/scripts/superpowers-codex) `bootstrap` command (Codex) invokes [lib/initialize-skills.sh](https://github.com/obra/superpowers/blob/a01a135f/lib/initialize-skills.sh) which handles cloning, forking, and updating the skills repository. The initialization script uses Git operations to manage the local clone at `~/.config/superpowers/skills/` and automatically attempts fast-forward updates on subsequent sessions.

Sources: [RELEASE-NOTES.md250-263](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L250-L263) [RELEASE-NOTES.md317-321](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L317-L321) [README.md117-122](https://github.com/obra/superpowers/blob/a01a135f/README.md#L117-L122)

## Verification Steps

After installation, verify that the system is working correctly:

### Check Session Output

When you start a session, you should see output similar to:

```
Superpowers skills loaded from: ~/.config/superpowers/skills

Available skills:
- superpowers:brainstorming
- superpowers:writing-plans
- superpowers:executing-plans
- superpowers:test-driven-development
- superpowers:systematic-debugging
[... more skills ...]
```

**What this confirms:**

- Skills repository was cloned successfully
- Session hook is executing
- Skills metadata was parsed correctly

Sources: [RELEASE-NOTES.md317-321](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L317-L321)

### Verify Commands Are Available

For **Claude Code**, check that slash commands appear:

```
```

Expected output should include:

```
/superpowers:brainstorm - Interactive design refinement
/superpowers:write-plan - Create implementation plan
/superpowers:execute-plan - Execute plan in batches
```

For **Codex**, verify the CLI tool works:

```
```

Expected output shows available skills with their descriptions.

Sources: [README.md34-42](https://github.com/obra/superpowers/blob/a01a135f/README.md#L34-L42) [RELEASE-NOTES.md19-27](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L19-L27)

### Test Mandatory First Response Protocol

Ask the assistant: "What skills are available?"

The assistant should:

1. Announce it's using the `using-superpowers` skill
2. List available skills organized by category
3. Explain the mandatory first response protocol

If the assistant responds without mentioning skills, the `using-superpowers` skill may not have loaded. Check the session output for errors.

Sources: [skills/using-superpowers/SKILL.md1-102](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L1-L102)

## Common First-Time Issues

| Issue                   | Symptom                                | Solution                                                                                                                                |
| ----------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Skills not loading      | No skill list at session start         | Check `~/.config/superpowers/skills/` exists and contains `.git/`                                                                       |
| Commands not found      | `/superpowers:*` commands missing      | Claude Code only: Update plugin with `/plugin update superpowers`                                                                       |
| CLI tool not found      | `command not found: superpowers-codex` | Codex only: Verify script is in `$PATH` and executable                                                                                  |
| Update warnings persist | "New skills available" every session   | Run `git pull` manually in `~/.config/superpowers/skills/`                                                                              |
| Fork setup failed       | No remote named `origin`               | Re-run [lib/initialize-skills.sh](https://github.com/obra/superpowers/blob/a01a135f/lib/initialize-skills.sh) with GitHub CLI installed |

Sources: [RELEASE-NOTES.md195-207](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L195-L207) [RELEASE-NOTES.md326-331](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L326-L331)

## What Happens Next

After successful installation and verification:

1. **Every session start:** Skills auto-update via fast-forward merge from upstream
2. **First user message:** Assistant applies the Mandatory First Response Protocol from [skills/using-superpowers/SKILL.md16-26](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L16-L26)
3. **Skill discovery:** Assistant scans skill metadata to find relevant skills for your task
4. **Skill execution:** Assistant announces which skill it's using and follows its workflow

For detailed usage instructions, see [Using Superpowers](obra/superpowers/5-platform-specific-features.md).

For understanding the automatic update mechanism, see [Auto-Update Mechanism](obra/superpowers/4.3-multi-platform-integration.md).

## Next Steps

- **Claude Code users:** See detailed installation steps in [Installing on Claude Code](obra/superpowers/2.1-installing-on-claude-code.md)
- **Codex users:** See detailed installation steps in [Installing on Codex](obra/superpowers/2.2-installing-on-opencode.md)
- **After installation:** Learn about the [Mandatory First Response Protocol](obra/superpowers/5.1-claude-code:-skill-tool-and-hooks.md)
- **Understanding workflows:** Explore [Development Workflows](obra/superpowers/6-development-workflows.md)

Sources: [README.md1-159](https://github.com/obra/superpowers/blob/a01a135f/README.md#L1-L159) [skills/using-superpowers/SKILL.md1-102](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L1-L102)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Getting Started](#getting-started.md)
- [Installation Overview](#installation-overview.md)
- [Installation Architecture](#installation-architecture.md)
- [Directory Structure After Installation](#directory-structure-after-installation.md)
- [First Session Initialization](#first-session-initialization.md)
- [Verification Steps](#verification-steps.md)
- [Check Session Output](#check-session-output.md)
- [Verify Commands Are Available](#verify-commands-are-available.md)
- [Test Mandatory First Response Protocol](#test-mandatory-first-response-protocol.md)
- [Common First-Time Issues](#common-first-time-issues.md)
- [What Happens Next](#what-happens-next.md)
- [Next Steps](#next-steps.md)
