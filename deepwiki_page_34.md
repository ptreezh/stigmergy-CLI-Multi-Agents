# /obra/superpowers/7.4-other-essential-skills

Other Essential Skills | obra/superpowers | DeepWiki

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

# Other Essential Skills

Relevant source files

- [skills/brainstorming/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md)
- [skills/dispatching-parallel-agents/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/dispatching-parallel-agents/SKILL.md)
- [skills/finishing-a-development-branch/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md)
- [skills/test-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md)
- [skills/test-driven-development/testing-anti-patterns.md](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md)
- [skills/using-git-worktrees/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md)

## Purpose and Scope

This page provides an overview of additional important skills beyond the foundational meta-skill ([using-superpowers](obra/superpowers/7.1-using-superpowers-\(meta-skill\).md)), test-driven development ([TDD](obra/superpowers/7.2-test-driven-development.md)), and systematic debugging ([systematic-debugging](obra/superpowers/7.3-systematic-debugging.md)).

The skills covered here fall into three categories:

- **Agent Management**: Coordinating multiple AI agents for parallel work
- **Workflow Skills**: Already detailed in [Development Workflows](obra/superpowers/6-development-workflows.md) but summarized here for reference
- **Skill Development**: Creating and testing new skills (detailed in [Creating Skills](obra/superpowers/8-creating-skills.md))

For complete workflow details (brainstorming, planning, execution, code review, branch completion), see [Development Workflows](obra/superpowers/6-development-workflows.md). For skill creation methodology, see [Creating Skills](obra/superpowers/8-creating-skills.md).

---

## Dispatching Parallel Agents

### Overview

The `dispatching-parallel-agents` skill coordinates multiple independent AI agents to work on separate problems simultaneously. This parallelizes investigation and resolution of unrelated failures.

**Core principle**: One agent per independent problem domain, working concurrently without interference.

**File**: [skills/dispatching-parallel-agents/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/dispatching-parallel-agents/SKILL.md)

### When to Use

```
```

**Criteria for parallel dispatch**:

- 3+ test files failing with different root causes
- Multiple subsystems broken independently
- Each problem understandable without context from others
- No shared state between investigations

**Anti-patterns**:

- Related failures (fixing one might fix others)
- Need to understand full system state first
- Agents would interfere (editing same files)

Sources: [skills/dispatching-parallel-agents/SKILL.md15-43](https://github.com/obra/superpowers/blob/a01a135f/skills/dispatching-parallel-agents/SKILL.md#L15-L43)

### Agent Task Structure

Each dispatched agent receives:

| Component           | Purpose                    | Example                                             |
| ------------------- | -------------------------- | --------------------------------------------------- |
| **Specific scope**  | One test file or subsystem | `agent-tool-abort.test.ts`                          |
| **Clear goal**      | Make these tests pass      | "Fix 3 failing tests in this file"                  |
| **Constraints**     | Prevent interference       | "Do NOT change production code" or "Fix tests only" |
| **Expected output** | Summary for integration    | "Return summary of root cause and changes"          |

**Agent prompt template** [skills/dispatching-parallel-agents/SKILL.md83-108](https://github.com/obra/superpowers/blob/a01a135f/skills/dispatching-parallel-agents/SKILL.md#L83-L108):

```
```

Sources: [skills/dispatching-parallel-agents/SKILL.md56-108](https://github.com/obra/superpowers/blob/a01a135f/skills/dispatching-parallel-agents/SKILL.md#L56-L108)

### Dispatch and Integration Workflow

```
```

**Integration checklist** [skills/dispatching-parallel-agents/SKILL.md165-172](https://github.com/obra/superpowers/blob/a01a135f/skills/dispatching-parallel-agents/SKILL.md#L165-L172):

1. **Review each summary** - Understand what changed
2. **Check for conflicts** - Did agents edit same code?
3. **Run full suite** - Verify all fixes work together
4. **Spot check** - Agents can make systematic errors

Sources: [skills/dispatching-parallel-agents/SKILL.md47-108](https://github.com/obra/superpowers/blob/a01a135f/skills/dispatching-parallel-agents/SKILL.md#L47-L108) [skills/dispatching-parallel-agents/SKILL.md131-156](https://github.com/obra/superpowers/blob/a01a135f/skills/dispatching-parallel-agents/SKILL.md#L131-L156) [skills/dispatching-parallel-agents/SKILL.md165-181](https://github.com/obra/superpowers/blob/a01a135f/skills/dispatching-parallel-agents/SKILL.md#L165-L181)

### Real-World Impact

From actual debugging session [skills/dispatching-parallel-agents/SKILL.md174-181](https://github.com/obra/superpowers/blob/a01a135f/skills/dispatching-parallel-agents/SKILL.md#L174-L181):

- **6 failures** across 3 test files
- **3 agents** dispatched in parallel
- All investigations completed **concurrently**
- All fixes integrated successfully with **zero conflicts**
- Time saved: **3 problems solved in time of 1**

Sources: [skills/dispatching-parallel-agents/SKILL.md131-181](https://github.com/obra/superpowers/blob/a01a135f/skills/dispatching-parallel-agents/SKILL.md#L131-L181)

---

## Workflow Skills Summary

These skills are detailed in [Development Workflows](obra/superpowers/6-development-workflows.md) but summarized here for quick reference:

### brainstorming

**Purpose**: Mandatory first step before any feature work - explores user intent through interactive dialogue before implementation.

**Key requirements** [skills/brainstorming/SKILL.md1-4](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L1-L4):

- MUST use before creative work, creating features, building components
- One question at a time (not overwhelming)
- Multiple choice preferred when possible
- Present design in 200-300 word sections with validation

**Output**: Design document at `docs/plans/YYYY-MM-DD-<topic>-design.md` [skills/brainstorming/SKILL.md38](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L38-L38)

**Detailed coverage**: See [Brainstorming and Design](obra/superpowers/6.1-brainstorming-and-design.md)

Sources: [skills/brainstorming/SKILL.md1-55](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md#L1-L55)

### using-git-worktrees

**Purpose**: Creates isolated development environments sharing same repository, allowing work on multiple branches simultaneously.

**Directory priority** [skills/using-git-worktrees/SKILL.md16-49](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L16-L49):

1. Check existing directories (`.worktrees/` or `worktrees/`)
2. Check `CLAUDE.md` for preference
3. Ask user (project-local vs global)

**Safety verification** [skills/using-git-worktrees/SKILL.md52-73](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L52-L73):

- Project-local directories MUST be git-ignored
- Auto-fixes `.gitignore` if needed (per "Fix broken things immediately" rule)
- Runs baseline tests to verify clean starting state

**Detailed coverage**: See [Using Git Worktrees](obra/superpowers/6.2-using-git-worktrees.md)

Sources: [skills/using-git-worktrees/SKILL.md1-218](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md#L1-L218)

### finishing-a-development-branch

**Purpose**: Guides completion workflow after implementation is complete and all tests pass.

**Four structured options** [skills/finishing-a-development-branch/SKILL.md50-62](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L50-L62):

1. **Merge back to base branch locally** - Immediate integration
2. **Push and create Pull Request** - Review workflow
3. **Keep branch as-is** - User handles later
4. **Discard this work** - With typed confirmation

**Verification requirements** [skills/finishing-a-development-branch/SKILL.md18-36](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L18-L36):

- Tests MUST pass before presenting options
- Cannot proceed with merge/PR until green
- Always cleanup worktree (except Option 3)

**Detailed coverage**: See [Finishing Development Branches](obra/superpowers/6.7-finishing-development-branches.md)

Sources: [skills/finishing-a-development-branch/SKILL.md1-201](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md#L1-L201)

---

## Skill Development Skills

These skills are detailed in [Creating Skills](obra/superpowers/8-creating-skills.md) but listed here for completeness:

### writing-skills

**Purpose**: Meta-skill for creating new skills using TDD methodology (RED-GREEN-REFACTOR for documentation).

**Core process**:

1. **RED**: Baseline test without skill (document failures)
2. **GREEN**: Write minimal skill addressing failures
3. **REFACTOR**: Close loopholes through pressure scenarios

**File structure**: `SKILL.md` with YAML frontmatter (`name`, `description`)

**Detailed coverage**: See [Writing Skills with TDD](obra/superpowers/8.1-writing-skills-with-tdd.md) and [Skill Structure](obra/superpowers/8.2-skill-structure-and-skill.md-format.md)

### testing-skills-with-subagents

**Purpose**: Validates skills using pressure scenarios with combined stressors (time pressure, sunk cost, authority pressure).

**Testing methodology**:

- Create scenarios that force rationalization
- Document all excuses in rationalization tables
- Iterate until skill is "bulletproof" (max pressure resistance)

**Detailed coverage**: See [Testing Skills with Pressure Scenarios](obra/superpowers/8.3-testing-skills-with-pressure-scenarios.md)

### sharing-skills

**Purpose**: Guides contribution workflow for submitting skills to main repository.

**Process**:

1. Fork `obra/superpowers-skills` repository
2. Branch-based development
3. Skill deployment checklist
4. Pull request submission

**Detailed coverage**: See [Contributing Skills via Pull Request](obra/superpowers/8.5-contributing-skills-via-pull-request.md)

---

## Skill Type Categorization

Skills follow a hierarchical type system enforced by the `using-superpowers` meta-skill:

```
```

**Priority hierarchy**: Process skills (HOW to approach) activate before implementation skills (WHAT to build), preventing premature implementation.

Sources: Based on system architecture diagrams and skill relationships

---

## Testing Anti-Patterns Reference

The `testing-anti-patterns.md` reference document [skills/test-driven-development/testing-anti-patterns.md](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md) complements TDD by documenting common violations:

### Three Iron Laws

```
```

### Key Anti-Patterns

| Anti-Pattern                      | Symptom                           | Fix                                                                                                                                                   |
| --------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Testing mock behavior**         | Assert on `*-mock` test IDs       | Test real component or unmock it [testing-anti-patterns.md22-49](https://github.com/obra/superpowers/blob/a01a135f/testing-anti-patterns.md#L22-L49)  |
| **Test-only methods**             | Methods only called in test files | Move to test utilities [testing-anti-patterns.md63-116](https://github.com/obra/superpowers/blob/a01a135f/testing-anti-patterns.md#L63-L116)          |
| **Mocking without understanding** | Mock breaks test logic            | Understand side effects first [testing-anti-patterns.md118-175](https://github.com/obra/superpowers/blob/a01a135f/testing-anti-patterns.md#L118-L175) |
| **Incomplete mocks**              | Partial data structures           | Mirror real API completely [testing-anti-patterns.md177-226](https://github.com/obra/superpowers/blob/a01a135f/testing-anti-patterns.md#L177-L226)    |
| **Tests as afterthought**         | Implementation before tests       | TDD - tests first [testing-anti-patterns.md228-249](https://github.com/obra/superpowers/blob/a01a135f/testing-anti-patterns.md#L228-L249)             |

**Gate function example** [skills/test-driven-development/testing-anti-patterns.md52-61](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md#L52-L61):

```
BEFORE asserting on any mock element:
  Ask: "Am I testing real component behavior or just mock existence?"

  IF testing mock existence:
    STOP - Delete the assertion or unmock the component

  Test real behavior instead
```

Sources: [skills/test-driven-development/testing-anti-patterns.md1-300](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/testing-anti-patterns.md#L1-L300)

---

## Quick Reference Matrix

Comprehensive skill categorization by usage pattern:

| Skill                            | Type           | Mandatory?            | Triggers              | Output              |
| -------------------------------- | -------------- | --------------------- | --------------------- | ------------------- |
| `using-superpowers`              | Meta           | Always (The Rule)     | Before any response   | Context injection   |
| `brainstorming`                  | Process        | Before feature work   | Creating features     | Design document     |
| `writing-plans`                  | Process        | After design          | Converting design     | Implementation plan |
| `test-driven-development`        | Implementation | Always                | Any code changes      | Passing tests       |
| `systematic-debugging`           | Process        | Bug investigation     | Unexpected behavior   | Root cause + fix    |
| `subagent-driven-development`    | Implementation | Task execution        | Task-by-task work     | Completed tasks     |
| `executing-plans`                | Implementation | Batch execution       | Parallel sessions     | Completed batches   |
| `dispatching-parallel-agents`    | Specialized    | Independent failures  | 3+ unrelated problems | Concurrent fixes    |
| `using-git-worktrees`            | Specialized    | Before implementation | Need isolation        | Clean workspace     |
| `finishing-a-development-branch` | Specialized    | After completion      | All tests pass        | Integrated work     |

Sources: Combined from all skill files and system architecture

---

## Integration Patterns

### Typical Development Flow

```
```

### Debugging Flow

```
```

Sources: Based on workflow patterns from skills and system architecture diagrams

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Other Essential Skills](#other-essential-skills.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Dispatching Parallel Agents](#dispatching-parallel-agents.md)
- [Overview](#overview.md)
- [When to Use](#when-to-use.md)
- [Agent Task Structure](#agent-task-structure.md)
- [Dispatch and Integration Workflow](#dispatch-and-integration-workflow.md)
- [Real-World Impact](#real-world-impact.md)
- [Workflow Skills Summary](#workflow-skills-summary.md)
- [brainstorming](#brainstorming.md)
- [using-git-worktrees](#using-git-worktrees.md)
- [finishing-a-development-branch](#finishing-a-development-branch.md)
- [Skill Development Skills](#skill-development-skills.md)
- [writing-skills](#writing-skills.md)
- [testing-skills-with-subagents](#testing-skills-with-subagents.md)
- [sharing-skills](#sharing-skills.md)
- [Skill Type Categorization](#skill-type-categorization.md)
- [Testing Anti-Patterns Reference](#testing-anti-patterns-reference.md)
- [Three Iron Laws](#three-iron-laws.md)
- [Key Anti-Patterns](#key-anti-patterns.md)
- [Quick Reference Matrix](#quick-reference-matrix.md)
- [Integration Patterns](#integration-patterns.md)
- [Typical Development Flow](#typical-development-flow.md)
- [Debugging Flow](#debugging-flow.md)
