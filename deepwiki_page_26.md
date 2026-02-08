# /obra/superpowers/6.2-using-git-worktrees

Using Git Worktrees | obra/superpowers | DeepWiki

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

# Using Git Worktrees

Relevant source files

- [skills/brainstorming/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md)
- [skills/finishing-a-development-branch/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md)
- [skills/using-git-worktrees/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md)

## Purpose and Scope

This document covers the `using-git-worktrees` skill, which creates isolated git worktrees for feature development. The skill implements a systematic directory selection process, safety verification checks, automatic dependency installation, and baseline test validation.

This skill is invoked after completing the design phase (see [Brainstorming and Design](obra/superpowers/6.1-brainstorming-and-design.md)) and before implementation begins. For cleanup after development completes, see [Finishing Development Branches](obra/superpowers/6.7-finishing-development-branches.md).

**Sources:** [skills/using-git-worktrees/SKILL.md1-218](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L1-L218)

---

## What Git Worktrees Provide

Git worktrees create isolated workspaces that share the same repository, enabling work on multiple branches simultaneously without switching. Each worktree has its own working directory and can be on a different branch, but all worktrees share the same `.git` directory.

**Core principle:** Systematic directory selection + safety verification = reliable isolation [skills/using-git-worktrees/SKILL.md12](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L12-L12)

The skill announces itself at invocation: "I'm using the using-git-worktrees skill to set up an isolated workspace." [skills/using-git-worktrees/SKILL.md14](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L14-L14)

**Sources:** [skills/using-git-worktrees/SKILL.md8-14](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L8-L14)

---

## Directory Selection Algorithm

The skill follows a strict priority order for determining where to create worktrees.

### Directory Selection Flowchart

```
```

### Priority Order

| Priority | Location             | Check Command                                        | Condition                                                     |
| -------- | -------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| 1        | `.worktrees/`        | `ls -d .worktrees 2>/dev/null`                       | If both `.worktrees` and `worktrees` exist, `.worktrees` wins |
| 2        | `worktrees/`         | `ls -d worktrees 2>/dev/null`                        | Used if `.worktrees` doesn't exist                            |
| 3        | CLAUDE.md preference | `grep -i "worktree.*director" CLAUDE.md 2>/dev/null` | Used if no existing directory                                 |
| 4        | User choice          | Interactive prompt                                   | Last resort if no preference exists                           |

**Sources:** [skills/using-git-worktrees/SKILL.md16-49](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L16-L49) [skills/using-git-worktrees/SKILL.md145-152](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L145-L152)

### User Prompt Format

When no directory exists and no CLAUDE.md preference is found, the skill presents exactly this prompt [skills/using-git-worktrees/SKILL.md40-49](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L40-L49):

```
No worktree directory found. Where should I create worktrees?

1. .worktrees/ (project-local, hidden)
2. ~/.config/superpowers/worktrees/<project-name>/ (global location)

Which would you prefer?
```

**Sources:** [skills/using-git-worktrees/SKILL.md38-49](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L38-L49)

---

## Safety Verification System

Before creating a worktree in a project-local directory, the skill must verify the directory is gitignored to prevent accidentally committing worktree contents.

### Verification Rules by Location

| Directory Type                     | Verification Required | Command                                                             |
| ---------------------------------- | --------------------- | ------------------------------------------------------------------- |
| `.worktrees/` or `worktrees/`      | **YES**               | `git check-ignore -q .worktrees` or `git check-ignore -q worktrees` |
| `~/.config/superpowers/worktrees/` | **NO**                | Not needed - outside project                                        |

**Sources:** [skills/using-git-worktrees/SKILL.md51-73](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L51-L73)

### Safety Check Implementation

```
```

The verification command [skills/using-git-worktrees/SKILL.md58-60](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L58-L60):

```
```

This command respects local, global, and system gitignore files.

### Automatic Remediation

If the directory is not ignored, the skill follows "Fix broken things immediately" [skills/using-git-worktrees/SKILL.md64](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L64-L64):

1. Add appropriate line to `.gitignore`
2. Commit the change
3. Proceed with worktree creation

**Critical:** This prevents accidentally committing worktree contents to the repository [skills/using-git-worktrees/SKILL.md69](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L69-L69)

**Sources:** [skills/using-git-worktrees/SKILL.md53-73](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L53-L73) [skills/using-git-worktrees/SKILL.md159-161](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L159-L161)

---

## Worktree Creation Process

### Complete Creation Sequence

```
```

**Sources:** [skills/using-git-worktrees/SKILL.md75-143](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L75-L143)

### Step 1: Project Name Detection

```
```

This extracts the project name for use in the global directory path [skills/using-git-worktrees/SKILL.md77-81](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L77-L81)

**Sources:** [skills/using-git-worktrees/SKILL.md77-81](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L77-L81)

### Step 2: Path Construction

The full path is constructed based on the selected location type [skills/using-git-worktrees/SKILL.md86-94](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L86-L94):

```
```

### Step 3: Worktree Creation

```
```

This creates the worktree with a new branch and changes into it [skills/using-git-worktrees/SKILL.md96-99](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L96-L99)

**Sources:** [skills/using-git-worktrees/SKILL.md84-99](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L84-L99)

---

## Project Setup Auto-Detection

The skill automatically detects the project type and runs the appropriate setup commands.

### Detection Logic

| Project Type    | Detection File     | Setup Command                     |
| --------------- | ------------------ | --------------------------------- |
| Node.js         | `package.json`     | `npm install`                     |
| Rust            | `Cargo.toml`       | `cargo build`                     |
| Python (pip)    | `requirements.txt` | `pip install -r requirements.txt` |
| Python (poetry) | `pyproject.toml`   | `poetry install`                  |
| Go              | `go.mod`           | `go mod download`                 |

**Sources:** [skills/using-git-worktrees/SKILL.md101-119](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L101-L119)

### Auto-Detection Commands

```
```

**Sources:** [skills/using-git-worktrees/SKILL.md105-118](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L105-L118)

---

## Baseline Testing Protocol

After setup, the skill runs the project's test suite to verify a clean baseline.

### Test Execution

```
```

**Sources:** [skills/using-git-worktrees/SKILL.md120-130](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L120-L130)

### Test Result Handling

```
```

**If tests fail:** Report failures, ask whether to proceed or investigate [skills/using-git-worktrees/SKILL.md132](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L132-L132)

**If tests pass:** Report ready [skills/using-git-worktrees/SKILL.md134](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L134-L134)

### Success Report Format

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

**Sources:** [skills/using-git-worktrees/SKILL.md120-143](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L120-L143)

---

## Integration Points

### Called By

The skill is invoked by other skills in the development workflow:

| Calling Skill   | When                                                         | Reference                                                                                                                                 |
| --------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `brainstorming` | Phase 4, after design is approved and implementation follows | [skills/brainstorming/SKILL.md44](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L44-L44)                |
| Any skill       | When isolated workspace needed                               | [skills/using-git-worktrees/SKILL.md213](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L213-L213) |

**Sources:** [skills/using-git-worktrees/SKILL.md209-214](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L209-L214) [skills/brainstorming/SKILL.md42-45](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L42-L45)

### Pairs With

| Paired Skill                                       | Relationship                                 | Reference                                                                                                                                 |
| -------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `finishing-a-development-branch`                   | **REQUIRED** for cleanup after work complete | [skills/using-git-worktrees/SKILL.md216](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L216-L216) |
| `executing-plans` or `subagent-driven-development` | Work happens in this worktree                | [skills/using-git-worktrees/SKILL.md217](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L217-L217) |

The `finishing-a-development-branch` skill cleans up worktrees created by this skill [skills/finishing-a-development-branch/SKILL.md200](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L200-L200)

**Sources:** [skills/using-git-worktrees/SKILL.md215-218](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L215-L218) [skills/finishing-a-development-branch/SKILL.md199-201](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L199-L201)

### Workflow Integration Example

```
```

**Sources:** [skills/brainstorming/SKILL.md42-45](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L42-L45) [skills/using-git-worktrees/SKILL.md209-218](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L209-L218) [skills/finishing-a-development-branch/SKILL.md193-201](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L193-L201)

---

## Common Mistakes and Red Flags

### Critical Mistakes

| Mistake                       | Problem                                             | Fix                                                                  | Reference                                                                                                                                     |
| ----------------------------- | --------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Skipping ignore verification  | Worktree contents get tracked, pollute git status   | Always use `git check-ignore` before creating project-local worktree | [skills/using-git-worktrees/SKILL.md159-161](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L159-L161) |
| Assuming directory location   | Creates inconsistency, violates project conventions | Follow priority: existing > CLAUDE.md > ask                          | [skills/using-git-worktrees/SKILL.md164-166](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L164-L166) |
| Proceeding with failing tests | Can't distinguish new bugs from pre-existing issues | Report failures, get explicit permission to proceed                  | [skills/using-git-worktrees/SKILL.md168-171](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L168-L171) |
| Hardcoding setup commands     | Breaks on projects using different tools            | Auto-detect from project files (package.json, etc.)                  | [skills/using-git-worktrees/SKILL.md173-176](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L173-L176) |

**Sources:** [skills/using-git-worktrees/SKILL.md156-177](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L156-L177)

### Never Do

- Create worktree without verifying it's ignored (project-local) [skills/using-git-worktrees/SKILL.md197](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L197-L197)
- Skip baseline test verification [skills/using-git-worktrees/SKILL.md198](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L198-L198)
- Proceed with failing tests without asking [skills/using-git-worktrees/SKILL.md199](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L199-L199)
- Assume directory location when ambiguous [skills/using-git-worktrees/SKILL.md200](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L200-L200)
- Skip CLAUDE.md check [skills/using-git-worktrees/SKILL.md201](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L201-L201)

### Always Do

- Follow directory priority: existing > CLAUDE.md > ask [skills/using-git-worktrees/SKILL.md204](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L204-L204)
- Verify directory is ignored for project-local [skills/using-git-worktrees/SKILL.md205](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L205-L205)
- Auto-detect and run project setup [skills/using-git-worktrees/SKILL.md206](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L206-L206)
- Verify clean test baseline [skills/using-git-worktrees/SKILL.md207](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L207-L207)

**Sources:** [skills/using-git-worktrees/SKILL.md194-208](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L194-L208)

---

## Complete Example Workflow

This example demonstrates the complete worktree creation process [skills/using-git-worktrees/SKILL.md179-192](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L179-L192):

```
You: I'm using the using-git-worktrees skill to set up an isolated workspace.

[Check .worktrees/ - exists]
[Verify ignored - git check-ignore confirms .worktrees/ is ignored]
[Create worktree: git worktree add .worktrees/auth -b feature/auth]
[Run npm install]
[Run npm test - 47 passing]

Worktree ready at /Users/jesse/myproject/.worktrees/auth
Tests passing (47 tests, 0 failures)
Ready to implement auth feature
```

**Sources:** [skills/using-git-worktrees/SKILL.md179-192](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L179-L192)

---

## Quick Reference Table

| Situation                  | Action                     | Reference                                                                                                                                 |
| -------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `.worktrees/` exists       | Use it (verify ignored)    | [skills/using-git-worktrees/SKILL.md148](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L148-L148) |
| `worktrees/` exists        | Use it (verify ignored)    | [skills/using-git-worktrees/SKILL.md149](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L149-L149) |
| Both exist                 | Use `.worktrees/`          | [skills/using-git-worktrees/SKILL.md150](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L150-L150) |
| Neither exists             | Check CLAUDE.md → Ask user | [skills/using-git-worktrees/SKILL.md151](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L151-L151) |
| Directory not ignored      | Add to .gitignore + commit | [skills/using-git-worktrees/SKILL.md152](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L152-L152) |
| Tests fail during baseline | Report failures + ask      | [skills/using-git-worktrees/SKILL.md153](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L153-L153) |
| No package.json/Cargo.toml | Skip dependency install    | [skills/using-git-worktrees/SKILL.md154](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L154-L154) |

**Sources:** [skills/using-git-worktrees/SKILL.md144-155](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L144-L155)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Using Git Worktrees](#using-git-worktrees.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [What Git Worktrees Provide](#what-git-worktrees-provide.md)
- [Directory Selection Algorithm](#directory-selection-algorithm.md)
- [Directory Selection Flowchart](#directory-selection-flowchart.md)
- [Priority Order](#priority-order.md)
- [User Prompt Format](#user-prompt-format.md)
- [Safety Verification System](#safety-verification-system.md)
- [Verification Rules by Location](#verification-rules-by-location.md)
- [Safety Check Implementation](#safety-check-implementation.md)
- [Automatic Remediation](#automatic-remediation.md)
- [Worktree Creation Process](#worktree-creation-process.md)
- [Complete Creation Sequence](#complete-creation-sequence.md)
- [Step 1: Project Name Detection](#step-1-project-name-detection.md)
- [Step 2: Path Construction](#step-2-path-construction.md)
- [Step 3: Worktree Creation](#step-3-worktree-creation.md)
- [Project Setup Auto-Detection](#project-setup-auto-detection.md)
- [Detection Logic](#detection-logic.md)
- [Auto-Detection Commands](#auto-detection-commands.md)
- [Baseline Testing Protocol](#baseline-testing-protocol.md)
- [Test Execution](#test-execution.md)
- [Test Result Handling](#test-result-handling.md)
- [Success Report Format](#success-report-format.md)
- [Integration Points](#integration-points.md)
- [Called By](#called-by.md)
- [Pairs With](#pairs-with.md)
- [Workflow Integration Example](#workflow-integration-example.md)
- [Common Mistakes and Red Flags](#common-mistakes-and-red-flags.md)
- [Critical Mistakes](#critical-mistakes.md)
- [Never Do](#never-do.md)
- [Always Do](#always-do.md)
- [Complete Example Workflow](#complete-example-workflow.md)
- [Quick Reference Table](#quick-reference-table.md)
