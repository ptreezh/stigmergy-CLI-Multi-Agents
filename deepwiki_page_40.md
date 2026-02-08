# /obra/superpowers/8.5-contributing-skills-via-pull-request

Contributing Skills via Pull Request | obra/superpowers | DeepWiki

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

# Contributing Skills via Pull Request

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [skills/writing-skills/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md)
- [skills/writing-skills/render-graphs.js](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/render-graphs.js)

This page describes the workflow for contributing new skills or improvements to the community skills repository via pull requests. It covers fork setup, branch-based development, testing requirements, and the PR submission process.

For information about creating the skill content itself, see [Writing Skills with TDD](obra/superpowers/8.1-writing-skills-with-tdd.md) and [Skill Structure and SKILL.md Format](obra/superpowers/8.2-skill-structure-and-skill.md-format.md). For testing methodology, see [Testing Skills with Pressure Scenarios](obra/superpowers/8.3-testing-skills-with-pressure-scenarios.md).

---

## Overview

The superpowers skills library uses a **fork-and-pull-request workflow**. Skills are developed in your personal fork, tested locally, then contributed back to the main repository at `obra/superpowers-skills` via pull request.

**Key characteristics:**

- **Separate repository**: Skills live at `obra/superpowers-skills`, not in the plugin
- **Local clone**: Managed at `~/.config/superpowers/skills/` by the plugin
- **Fork offered**: During first installation if `gh` CLI is available
- **Branch-based development**: Work on feature branches, not main
- **Dual remotes**: `upstream` points to `obra/superpowers-skills`, `origin` points to your fork

**Sources:** [RELEASE-NOTES.md408-446](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L408-L446) [RELEASE-NOTES.md449-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L461)

---

## Repository Architecture

```
```

**Sources:** [RELEASE-NOTES.md422-433](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L422-L433) [RELEASE-NOTES.md449-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L461)

---

## Fork Setup

### Automatic Fork Creation

During first installation, [\`lib/initialize-skills.sh\`](https://github.com/obra/superpowers/blob/a01a135f/`lib/initialize-skills.sh`) offers to create a fork if GitHub CLI (`gh`) is installed:

```
```

**If you accepted the fork:**

- `origin` remote points to your fork
- `upstream` remote points to `obra/superpowers-skills`
- Ready for pull request workflow

**If you declined the fork:**

- Only `origin` remote (points to `obra/superpowers-skills`)
- Can still develop locally, but can't push to GitHub
- Can create fork later manually

**Sources:** [RELEASE-NOTES.md449-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L461)

### Manual Fork Creation

If you initially declined or want to set up a fork later:

```
```

**Sources:** [RELEASE-NOTES.md449-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L461)

---

## Development Workflow

### Complete Contribution Process

```
```

**Sources:** [RELEASE-NOTES.md422-433](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L422-L433) [skills/writing-skills/SKILL.md596-633](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L596-L633)

---

## Step-by-Step Contribution Guide

### 1. Create Feature Branch

Always work on a dedicated feature branch, never on `main`:

```
```

**Branch naming conventions:**

- `add-{skill-name}` for new skills
- `improve-{skill-name}-{aspect}` for enhancements
- `fix-{skill-name}-{issue}` for bug fixes

**Sources:** [RELEASE-NOTES.md430-433](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L430-L433)

### 2. Develop with TDD

Follow the RED-GREEN-REFACTOR cycle from [Writing Skills with TDD](obra/superpowers/8.1-writing-skills-with-tdd.md):

```
```

**Sources:** [skills/writing-skills/SKILL.md533-560](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L533-L560)

### 3. Complete Pre-Submission Checklist

Before committing, verify all checklist items from [\`skills/writing-skills/SKILL.md596-633](https://github.com/obra/superpowers/blob/a01a135f/`skills/writing-skills/SKILL.md#L596-L633):

| Category        | Requirements                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Frontmatter** | Name uses only letters/numbers/hyphens; YAML has only `name` and `description` (max 1024 chars); Description starts with "Use when..." in third person |
| **Testing**     | RED phase complete (baseline failures documented); GREEN phase complete (agents comply with skill); REFACTOR phase complete (loopholes closed)         |
| **Content**     | Clear overview with core principle; Addresses specific baseline failures; One excellent example (not multi-language); Keywords for search              |
| **Quality**     | Small flowchart only if decision non-obvious; Quick reference table; Common mistakes section; No narrative storytelling                                |

**Sources:** [skills/writing-skills/SKILL.md596-633](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L596-L633)

### 4. Commit Changes

Use clear, descriptive commit messages:

```
```

**Commit message structure:**

```
Summary line (50 chars max)

Detailed description:
- What the skill does
- Key features
- Testing performed

(optional) References: #issue-number
```

**Sources:** [skills/writing-skills/SKILL.md631-633](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L631-L633)

### 5. Push to Your Fork

```
```

**Note:** Use `--force-with-lease` instead of `--force` to prevent accidentally overwriting others' changes if you're collaborating on a branch.

**Sources:** [RELEASE-NOTES.md430-433](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L430-L433)

### 6. Create Pull Request

**Via GitHub CLI:**

```
```

**Via GitHub Web UI:**

1. Navigate to your fork: `https://github.com/your-username/superpowers-skills`

2. GitHub will show a "Compare & pull request" banner

3. Click the banner

4. Fill in PR details:

   - **Title**: Clear, descriptive (50 chars recommended)
   - **Description**: What does this skill do? Why is it useful? How was it tested?

5. Submit pull request

**Sources:** [RELEASE-NOTES.md430-433](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L430-L433)

---

## Pull Request Guidelines

### PR Description Template

```
```

### What Reviewers Look For

| Aspect              | Criteria                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| **Testing**         | Evidence of RED-GREEN-REFACTOR cycle; Baseline failures documented; Pressure scenarios completed |
| **Content Quality** | Clear core principle; Addresses specific problems; Actionable guidance                           |
| **Discoverability** | Rich description field; Keywords for search; Descriptive skill name                              |
| **Structure**       | Valid YAML frontmatter; Proper section organization; Supporting files only when needed           |
| **Reusability**     | Technique applies broadly; Not project-specific; Not one-off solution                            |

**Sources:** [skills/writing-skills/SKILL.md47-60](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L47-L60) [skills/writing-skills/SKILL.md596-633](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L596-L633)

---

## Post-Merge Workflow

### Sync Your Local Clone

After your PR is merged, update your local `main` branch:

```
```

**Automatic updates:** The plugin's [\`hooks/session-start.sh\`](https://github.com/obra/superpowers/blob/a01a135f/`hooks/session-start.sh`) will automatically fetch and merge upstream changes on your next session start.

**Sources:** [RELEASE-NOTES.md456-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L456-L461)

---

## Git Remote Configuration

### Verify Remotes

Check your remote setup:

```
```

**Sources:** [RELEASE-NOTES.md449-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L461)

### Fix Remotes Manually

If remotes are not configured correctly:

```
```

**Sources:** [RELEASE-NOTES.md449-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L461)

---

## Common Workflows

### Contributing Multiple Skills

When contributing multiple related skills, consider whether to:

**Option 1: Separate PRs (Recommended)**

- One PR per skill
- Easier to review
- Can merge independently
- Each skill gets focused discussion

```
```

**Option 2: Single PR for Related Skills**

- Only if skills are tightly coupled
- E.g., a technique and its supporting tool
- Mention relationship in PR description

```
```

**Sources:** [skills/writing-skills/SKILL.md585-592](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L585-L592)

### Improving Existing Skills

For changes to existing skills:

```
```

**Sources:** [skills/writing-skills/SKILL.md377-392](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L377-L392)

### Fixing Skill Issues

For bug fixes:

```
```

**Sources:** [skills/writing-skills/SKILL.md551-554](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L551-L554)

---

## Integration with Plugin Updates

### How Skills Updates Work

```
```

**Automatic behavior:**

- [\`hooks/session-start.sh\`](https://github.com/obra/superpowers/blob/a01a135f/`hooks/session-start.sh`) runs on every session start
- Fetches from `upstream` (or `origin` if no fork)
- Auto-merges with fast-forward if possible
- Warns if branch has diverged

**Manual sync required when:**

- You have uncommitted changes
- Your local commits conflict with upstream
- Your branch has diverged from upstream

**Sources:** [RELEASE-NOTES.md456-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L456-L461)

### Manual Sync Process

If auto-update shows "Manual sync needed":

```
```

**Sources:** [RELEASE-NOTES.md456-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L456-L461)

---

## Troubleshooting

### "Permission denied" when pushing

**Problem:** Can't push to `obra/superpowers-skills` directly

**Solution:** You need to push to your fork, not upstream:

```
```

**Sources:** [RELEASE-NOTES.md449-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L461)

### Merge conflicts during sync

**Problem:** Local changes conflict with upstream updates

**Solution:**

```
```

### Fork not set up

**Problem:** Only have `origin` remote pointing to `obra/superpowers-skills`

**Solution:** Create fork and reconfigure remotes:

```
```

**Sources:** [RELEASE-NOTES.md449-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L461)

---

## Best Practices Summary

| Practice                              | Rationale                                                     |
| ------------------------------------- | ------------------------------------------------------------- |
| **Always work on feature branches**   | Keeps `main` clean; easier to sync with upstream              |
| **One skill per branch**              | Focused PRs; easier review; independent merging               |
| **Complete TDD cycle before pushing** | Ensures quality; provides testing evidence for reviewers      |
| **Write descriptive commit messages** | Helps reviewers understand changes; useful for git history    |
| **Test after every change**           | Catches regressions; verifies improvements actually work      |
| **Keep PRs focused**                  | Easier to review; faster to merge; clearer discussion         |
| **Update your fork regularly**        | Reduces merge conflicts; stays current with community changes |

**Sources:** [skills/writing-skills/SKILL.md1-656](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L1-L656) [RELEASE-NOTES.md408-637](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L408-L637)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Contributing Skills via Pull Request](#contributing-skills-via-pull-request.md)
- [Overview](#overview.md)
- [Repository Architecture](#repository-architecture.md)
- [Fork Setup](#fork-setup.md)
- [Automatic Fork Creation](#automatic-fork-creation.md)
- [Manual Fork Creation](#manual-fork-creation.md)
- [Development Workflow](#development-workflow.md)
- [Complete Contribution Process](#complete-contribution-process.md)
- [Step-by-Step Contribution Guide](#step-by-step-contribution-guide.md)
- [1. Create Feature Branch](#1-create-feature-branch.md)
- [2. Develop with TDD](#2-develop-with-tdd.md)
- [3. Complete Pre-Submission Checklist](#3-complete-pre-submission-checklist.md)
- [4. Commit Changes](#4-commit-changes.md)
- [5. Push to Your Fork](#5-push-to-your-fork.md)
- [6. Create Pull Request](#6-create-pull-request.md)
- [Pull Request Guidelines](#pull-request-guidelines.md)
- [PR Description Template](#pr-description-template.md)
- [What Reviewers Look For](#what-reviewers-look-for.md)
- [Post-Merge Workflow](#post-merge-workflow.md)
- [Sync Your Local Clone](#sync-your-local-clone.md)
- [Git Remote Configuration](#git-remote-configuration.md)
- [Verify Remotes](#verify-remotes.md)
- [Fix Remotes Manually](#fix-remotes-manually.md)
- [Common Workflows](#common-workflows.md)
- [Contributing Multiple Skills](#contributing-multiple-skills.md)
- [Improving Existing Skills](#improving-existing-skills.md)
- [Fixing Skill Issues](#fixing-skill-issues.md)
- [Integration with Plugin Updates](#integration-with-plugin-updates.md)
- [How Skills Updates Work](#how-skills-updates-work.md)
- [Manual Sync Process](#manual-sync-process.md)
- [Troubleshooting](#troubleshooting.md)
- ["Permission denied" when pushing](#permission-denied-when-pushing.md)
- [Merge conflicts during sync](#merge-conflicts-during-sync.md)
- [Fork not set up](#fork-not-set-up.md)
- [Best Practices Summary](#best-practices-summary.md)
