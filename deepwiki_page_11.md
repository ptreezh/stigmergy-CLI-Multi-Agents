# /obra/superpowers/4.2-skills-repository-management

Skills Repository Management | obra/superpowers | DeepWiki

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

# Skills Repository Management

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [.gitignore](https://github.com/obra/superpowers/blob/a01a135f/.gitignore)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)

## Purpose and Scope

This document explains how the superpowers system manages the skills repository, including initial cloning, fork setup, automatic updates, and manual synchronization workflows. The skills repository ([obra/superpowers-skills](https://github.com/obra/superpowers/blob/a01a135f/obra/superpowers-skills)) is maintained separately from the plugin itself, enabling independent versioning and community contributions.

For information about how skills are resolved and prioritized across different skill sources (project, personal, superpowers), see [Skills Resolution and Priority](obra/superpowers/4.5-skills-resolution-and-priority.md). For platform-specific installation procedures, see [Getting Started](obra/superpowers/2-getting-started.md).

## Repository Location and Directory Structure

The skills repository is cloned to a platform-specific location on first session start:

| Platform    | Skills Root Path                |
| ----------- | ------------------------------- |
| Claude Code | `~/.config/superpowers/skills/` |
| OpenCode    | `~/.config/superpowers/skills/` |
| Codex       | `~/.codex/superpowers/skills/`  |

The `SUPERPOWERS_SKILLS_ROOT` environment variable is set to this location and used consistently throughout the system for path resolution.

### Skills Repository Contents

```
skills/
├── brainstorming/
│   ├── SKILL.md              # Main skill content
│   └── supporting-files/     # Optional supporting content
├── test-driven-development/
│   ├── SKILL.md
│   └── testing-anti-patterns.md
├── using-superpowers/
│   └── SKILL.md
└── ... (other skills)
```

Each skill directory contains a `SKILL.md` file with YAML frontmatter defining the skill's name and description. Skills may include supporting files for examples, templates, or tools.

**Sources:** [RELEASE-NOTES.md422-439](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L422-L439) [RELEASE-NOTES.md521-523](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L521-L523)

### Directory Structure Mapping

```
```

**Sources:** [RELEASE-NOTES.md427-429](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L427-L429) [RELEASE-NOTES.md521-523](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L521-L523)

## Initial Installation: Clone and Setup

The `lib/initialize-skills.sh` script handles repository initialization on first session start. This script is invoked by platform-specific hooks or bootstrap mechanisms.

### Clone Decision Flow

```
```

**Sources:** [RELEASE-NOTES.md449-454](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L454) [RELEASE-NOTES.md427-439](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L427-L439)

## Fork Setup and Remote Configuration

When GitHub CLI (`gh`) is available, the initialization script offers to create a fork for user contributions.

### Git Remote Configuration

After fork creation, the repository has two remotes configured:

| Remote Name | Purpose                             | URL Pattern                                      |
| ----------- | ----------------------------------- | ------------------------------------------------ |
| `origin`    | User's fork (push destination)      | `https://github.com/USERNAME/superpowers-skills` |
| `upstream`  | Canonical repository (fetch source) | `https://github.com/obra/superpowers-skills`     |

If no fork is created, a single `upstream` remote points to the canonical repository, and the local clone remains read-only for auto-updates.

### Remote Setup Process

```
```

**Sources:** [RELEASE-NOTES.md427-439](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L427-L439) [RELEASE-NOTES.md449-454](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L454)

## Automatic Update Mechanism

On every session start, `initialize-skills.sh` fetches updates from the tracking remote and attempts to merge changes automatically.

### Update Flow

```
```

**Sources:** [RELEASE-NOTES.md456-460](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L456-L460) [RELEASE-NOTES.md514-519](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L514-L519)

### Fast-Forward Merge Strategy

The auto-update uses `git merge --ff-only` to ensure safe updates:

- **Success case**: Local branch is behind remote; changes merge cleanly
- **Failure case**: Local branch has diverged; manual intervention required

This prevents data loss from user modifications or experimental branches. When fast-forward fails, the system displays a warning and suggests using the `pulling-updates-from-skills-repository` skill for manual synchronization.

**Sources:** [RELEASE-NOTES.md427-439](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L427-L439) [RELEASE-NOTES.md456-460](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L456-L460)

## Manual Synchronization Workflow

When the local repository diverges from upstream (e.g., from user modifications or experimental branches), the `pulling-updates-from-skills-repository` skill guides manual sync.

### Divergence Resolution Process

```
```

**Sources:** [RELEASE-NOTES.md456-460](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L456-L460) [RELEASE-NOTES.md497-500](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L497-L500)

### Git State Detection

The `initialize-skills.sh` script uses `git status` flags to determine repository state:

| Git Status Output       | Interpretation             | Action                         |
| ----------------------- | -------------------------- | ------------------------------ |
| `Your branch is behind` | Local behind remote        | Auto-merge with fast-forward   |
| `Your branch is ahead`  | Local has unpushed commits | No warning, no auto-merge      |
| `have diverged`         | Conflicting changes        | Warn user, require manual sync |
| `up to date`            | No changes                 | No action needed               |

**Sources:** [RELEASE-NOTES.md397-398](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L397-L398) [RELEASE-NOTES.md456-460](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L456-L460)

## Environment Variables and Configuration

The system uses environment variables to provide consistent path references across platforms and sessions.

### SUPERPOWERS\_SKILLS\_ROOT

Set by platform-specific initialization code to the skills repository clone location:

```
```

This variable is used by:

- Platform plugins for skill discovery: [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js)
- Session start hooks: [hooks/session-start.sh](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh)
- Slash commands: [commands/brainstorm.md](https://github.com/obra/superpowers/blob/a01a135f/commands/brainstorm.md) [commands/write-plan.md](https://github.com/obra/superpowers/blob/a01a135f/commands/write-plan.md) [commands/execute-plan.md](https://github.com/obra/superpowers/blob/a01a135f/commands/execute-plan.md)

All skill path resolution uses `SUPERPOWERS_SKILLS_ROOT` as the base, ensuring platform independence.

**Sources:** [RELEASE-NOTES.md521-523](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L521-L523) [RELEASE-NOTES.md560-565](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L560-L565)

### Session Start Hook Variables

The session start hook (`hooks/session-start.sh`) reads from the initialized skills repository:

```
```

**Sources:** [RELEASE-NOTES.md514-519](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L514-L519) [RELEASE-NOTES.md402-404](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L402-L404)

## Migration from Legacy Installations

The v2.0.0 release introduced the separate skills repository. The migration process preserves user data while transitioning to the new architecture.

### Migration Flow

```
```

**Sources:** [RELEASE-NOTES.md427-439](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L427-L439) [RELEASE-NOTES.md586-609](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L586-L609)

### Backup Locations

| Original Path                   | Backup Path                         | Contents                |
| ------------------------------- | ----------------------------------- | ----------------------- |
| `~/.config/superpowers/.git/`   | `~/.config/superpowers/.git.bak/`   | Old plugin git metadata |
| `~/.config/superpowers/skills/` | `~/.config/superpowers/skills.bak/` | Old embedded skills     |

Personal skills from the backup can be migrated to the new repository via branch workflow:

1. Create branch in local skills clone
2. Copy personal skills from `skills.bak`
3. Commit and push to fork
4. Optional: Submit PR to contribute upstream

**Sources:** [RELEASE-NOTES.md438-439](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L438-L439) [RELEASE-NOTES.md604-608](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L604-L608)

## Repository Separation Architecture Benefits

The dual-repository design enables several key capabilities:

| Capability                     | Implementation                       | Benefit                            |
| ------------------------------ | ------------------------------------ | ---------------------------------- |
| Independent versioning         | Skills repo has own version tags     | Skills evolve faster than plugin   |
| Auto-updates without reinstall | `git fetch` + `git merge --ff-only`  | Users get new skills automatically |
| Community contributions        | Fork + PR workflow                   | Standard git collaboration         |
| Platform independence          | Single skills repo, multiple plugins | Shared content across platforms    |
| User customization             | Branch-based workflow                | Safe experimentation               |

For details on how the plugin layer integrates with the skills repository across different platforms, see [Multi-Platform Integration](obra/superpowers/4.3-multi-platform-integration.md).

**Sources:** [RELEASE-NOTES.md410-418](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L410-L418) [RELEASE-NOTES.md422-433](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L422-L433)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Skills Repository Management](#skills-repository-management.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Repository Location and Directory Structure](#repository-location-and-directory-structure.md)
- [Skills Repository Contents](#skills-repository-contents.md)
- [Directory Structure Mapping](#directory-structure-mapping.md)
- [Initial Installation: Clone and Setup](#initial-installation-clone-and-setup.md)
- [Clone Decision Flow](#clone-decision-flow.md)
- [Fork Setup and Remote Configuration](#fork-setup-and-remote-configuration.md)
- [Git Remote Configuration](#git-remote-configuration.md)
- [Remote Setup Process](#remote-setup-process.md)
- [Automatic Update Mechanism](#automatic-update-mechanism.md)
- [Update Flow](#update-flow.md)
- [Fast-Forward Merge Strategy](#fast-forward-merge-strategy.md)
- [Manual Synchronization Workflow](#manual-synchronization-workflow.md)
- [Divergence Resolution Process](#divergence-resolution-process.md)
- [Git State Detection](#git-state-detection.md)
- [Environment Variables and Configuration](#environment-variables-and-configuration.md)
- [SUPERPOWERS\_SKILLS\_ROOT](#superpowers_skills_root.md)
- [Session Start Hook Variables](#session-start-hook-variables.md)
- [Migration from Legacy Installations](#migration-from-legacy-installations.md)
- [Migration Flow](#migration-flow.md)
- [Backup Locations](#backup-locations.md)
- [Repository Separation Architecture Benefits](#repository-separation-architecture-benefits.md)
