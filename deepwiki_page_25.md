# /obra/superpowers/6.4-subagent-driven-development

Subagent-Driven Development | obra/superpowers | DeepWiki

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

# Subagent-Driven Development

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [skills/subagent-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md)
- [skills/subagent-driven-development/code-quality-reviewer-prompt.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/code-quality-reviewer-prompt.md)
- [skills/subagent-driven-development/implementer-prompt.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/implementer-prompt.md)
- [skills/subagent-driven-development/spec-reviewer-prompt.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/spec-reviewer-prompt.md)

## Purpose and Scope

This document describes the subagent-driven development workflow pattern for executing implementation plans using fresh subagents per task with a mandatory two-stage review system. This pattern is implemented in the skill at [skills/subagent-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md) and was introduced in v4.0.0.

For creating the implementation plan that this workflow executes, see [Writing Implementation Plans](obra/superpowers/6.3-writing-implementation-plans.md). For parallel-session execution instead of same-session execution, see [Executing Plans in Batches](obra/superpowers/6.5-executing-plans-in-batches.md). For the code review agent used in the second review stage, see [Code Review Process](obra/superpowers/6.6-code-review-process.md).

**Sources:** [skills/subagent-driven-development/SKILL.md1-10](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L1-L10)

---

## Overview

Subagent-driven development executes implementation plans by dispatching a fresh subagent per task, with two separate review stages after each task:

1. **Spec compliance review** - Verifies implementation matches requirements exactly (nothing missing, nothing extra)
2. **Code quality review** - Verifies implementation is well-built (clean code, test coverage, maintainability)

The key architectural principle is **fresh context per task**: each implementation subagent starts with no prior history, eliminating context pollution and ensuring each task is executed with focused attention.

**Sources:** [skills/subagent-driven-development/SKILL.md6-10](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L6-L10) [RELEASE-NOTES.md52-75](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L52-L75)

---

## When to Use Subagent-Driven Development

### Decision Tree

```
```

**Sources:** [skills/subagent-driven-development/SKILL.md13-30](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L13-L30)

### Comparison with Alternatives

| Characteristic       | Subagent-Driven Development     | Executing Plans                  | Manual Execution    |
| -------------------- | ------------------------------- | -------------------------------- | ------------------- |
| **Session context**  | Same session                    | Parallel sessions (3 by default) | Same session        |
| **Context per task** | Fresh subagent (no pollution)   | Fresh session per batch          | Accumulated context |
| **Review timing**    | After each task (2 stages)      | Checkpoint after batch           | Ad-hoc or none      |
| **Iteration speed**  | Fast (no human-in-loop)         | Slower (human reviews batches)   | Variable            |
| **Best for**         | Independent tasks, same session | Parallel work, batch review      | Exploratory work    |

**When to choose subagent-driven development:**

- Tasks in the plan are mostly independent
- You want to stay in the current session (no context switch)
- You want fast iteration with automatic review checkpoints
- Tasks can be executed sequentially without conflicts

**When to use alternatives:**

- **Executing plans**: Need to work on multiple tasks in parallel, willing to review in batches
- **Manual execution**: Tasks are tightly coupled, need continuous context, or plan is exploratory

**Sources:** [skills/subagent-driven-development/SKILL.md32-37](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L32-L37) [skills/subagent-driven-development/SKILL.md167-179](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L167-L179)

---

## The Two-Stage Review System

The two-stage review system was introduced in v4.0.0 to address the common failure mode where code is well-written but doesn't match what was requested.

### Review Architecture

```
```

**Sources:** [RELEASE-NOTES.md52-75](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L52-L75) [skills/subagent-driven-development/SKILL.md40-83](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L40-L83)

### Stage 1: Spec Compliance Review

**Purpose:** Verify implementation matches spec exactly (nothing more, nothing less)

**Template:** [skills/subagent-driven-development/spec-reviewer-prompt.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/spec-reviewer-prompt.md)

**Key characteristics:**

- Uses general-purpose Task tool

- Receives full task text and implementer's report

- **Critical instruction:** "Do not trust the report" - must read actual code independently

- Checks for:

  - Missing requirements (claimed but not implemented)
  - Extra/unneeded work (features not requested)
  - Misunderstandings (wrong interpretation of requirements)

**Output format:**

```
✅ Spec compliant
```

or

```
❌ Issues found:
- Missing: [specific requirement] at [file:line]
- Extra: [unneeded feature] at [file:line]
```

**Sources:** [skills/subagent-driven-development/spec-reviewer-prompt.md1-62](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/spec-reviewer-prompt.md#L1-L62) [RELEASE-NOTES.md59-60](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L59-L60)

### Stage 2: Code Quality Review

**Purpose:** Verify implementation is well-built (clean code, test coverage, maintainability)

**Template:** [skills/subagent-driven-development/code-quality-reviewer-prompt.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/code-quality-reviewer-prompt.md)

**Agent used:** `superpowers:code-reviewer` defined in [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)

**Only dispatched after spec compliance review passes.**

**Required information:**

- `WHAT_WAS_IMPLEMENTED`: From implementer's report
- `PLAN_OR_REQUIREMENTS`: Full task text
- `BASE_SHA`: Git commit before task started
- `HEAD_SHA`: Git commit after task completed
- `DESCRIPTION`: Task summary

**Review areas:**

1. Plan alignment analysis (compare to original plan)
2. Code quality assessment (patterns, conventions, error handling)
3. Architecture and design review (SOLID principles, separation of concerns)
4. Documentation and standards (comments, file headers)
5. Issue identification (Critical/Important/Suggestions)

**Output format:**

```
Strengths: [what was done well]
Issues:
  Critical: [must fix]
  Important: [should fix]
  Minor: [suggestions]
Assessment: [overall judgment]
```

**Sources:** [skills/subagent-driven-development/code-quality-reviewer-prompt.md1-21](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/code-quality-reviewer-prompt.md#L1-L21) [agents/code-reviewer.md1-48](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L48)

### Why Two Stages?

The two-stage system prevents these common failures:

| Without Two-Stage Review                   | With Two-Stage Review                                        |
| ------------------------------------------ | ------------------------------------------------------------ |
| Code is clean but missing requirements     | Spec review catches missing requirements                     |
| Code has extra features not requested      | Spec review catches over-building                            |
| Quality reviewer distracted by spec issues | Spec issues resolved first, quality reviewer focuses on code |
| Single reviewer must balance two concerns  | Separation of concerns: each reviewer has one focus          |

**Critical rule:** Never start code quality review before spec compliance is ✅. If you proceed with spec issues open, quality review becomes meaningless because the code doesn't match what was requested.

**Sources:** [RELEASE-NOTES.md52-63](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L52-L63) [skills/subagent-driven-development/SKILL.md199-213](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L199-L213)

---

## Complete Workflow Process

### High-Level Flow with Code Entities

```
```

**Sources:** [skills/subagent-driven-development/SKILL.md40-83](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L40-L83)

### Step-by-Step Process

#### 1. Initial Setup

**Controller responsibilities:**

1. Read implementation plan file **once** at start
2. Extract all tasks with full text (don't make subagents read plan)
3. Note context for each task (where it fits, dependencies, architectural context)
4. Create TodoWrite with all tasks

**Why read once?** Eliminates redundant file reading overhead. Controller curates exactly what context each subagent needs.

**Sources:** [skills/subagent-driven-development/SKILL.md59-69](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L59-L69) [RELEASE-NOTES.md66-67](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L66-L67)

#### 2. Per-Task Execution Loop

For each task:

**A. Dispatch Implementer Subagent**

Template: [skills/subagent-driven-development/implementer-prompt.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/implementer-prompt.md)

```
Task tool (general-purpose):
  description: "Implement Task N: [task name]"
  prompt: |
    ## Task Description
    [FULL TEXT pasted - not file reference]
    
    ## Context
    [Scene-setting: where this fits, dependencies]
    
    ## Before You Begin
    Ask questions if anything is unclear
    
    ## Your Job
    1. Implement exactly what task specifies
    2. Write tests (follow TDD if required)
    3. Verify implementation works
    4. Commit your work
    5. Self-review (completeness, quality, discipline, testing)
    6. Report back
```

**Implementer can:**

- Ask clarifying questions **before starting** work
- Ask questions **during** work if unexpected issues arise
- Self-review before reporting completion

**Sources:** [skills/subagent-driven-development/implementer-prompt.md1-78](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/implementer-prompt.md#L1-L78) [RELEASE-NOTES.md66-69](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L66-L69)

**B. Spec Compliance Review**

Template: [skills/subagent-driven-development/spec-reviewer-prompt.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/spec-reviewer-prompt.md)

Controller dispatches spec reviewer with:

- Full task requirements
- Implementer's completion report

**Critical instruction to reviewer:** "The implementer finished suspiciously quickly. Their report may be incomplete, inaccurate, or optimistic. You MUST verify everything independently."

Reviewer checks actual code for:

- Missing requirements
- Extra/unneeded features
- Misunderstandings

**Sources:** [skills/subagent-driven-development/spec-reviewer-prompt.md1-62](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/spec-reviewer-prompt.md#L1-L62)

**C. Review Loop (if needed)**

```
```

**Sources:** [skills/subagent-driven-development/SKILL.md70-73](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L70-L73) [RELEASE-NOTES.md63](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L63-L63)

**D. Code Quality Review**

Template: [skills/subagent-driven-development/code-quality-reviewer-prompt.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/code-quality-reviewer-prompt.md)

Agent: `superpowers:code-reviewer` from [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)

**Only dispatched after spec compliance is ✅**

Controller provides:

```
WHAT_WAS_IMPLEMENTED: [from implementer report]
PLAN_OR_REQUIREMENTS: Task N from [plan-file]
BASE_SHA: [commit before task]
HEAD_SHA: [current commit]
DESCRIPTION: [task summary]
```

Reviewer examines:

- Code quality (patterns, naming, error handling)
- Architecture (SOLID, separation of concerns)
- Test coverage and quality
- Documentation
- Security and performance

Issues categorized as Critical/Important/Minor.

**Sources:** [skills/subagent-driven-development/code-quality-reviewer-prompt.md1-21](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/code-quality-reviewer-prompt.md#L1-L21) [agents/code-reviewer.md12-48](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L12-L48)

**E. Quality Review Loop (if needed)**

Same pattern as spec review loop:

1. Code reviewer finds issues
2. Same implementer subagent fixes
3. Code reviewer reviews again
4. Repeat until approved

**Sources:** [skills/subagent-driven-development/SKILL.md74-77](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L74-L77)

**F. Mark Complete**

When both reviews pass:

- Controller marks task complete in TodoWrite
- Move to next task (loop back to step A)

**Sources:** [skills/subagent-driven-development/SKILL.md78](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L78-L78)

#### 3. Final Review and Completion

After all tasks:

1. Dispatch final `superpowers:code-reviewer` for entire implementation
2. Use `superpowers:finishing-a-development-branch` skill for merge/PR/discard workflow

**Sources:** [skills/subagent-driven-development/SKILL.md80-82](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L80-L82)

---

## Context Management

### Controller's Role

The controller (you, the main agent) is responsible for:

1. **Reading plan once** - Eliminates redundant file I/O
2. **Extracting all tasks upfront** - Full text, not just references
3. **Curating context** - Scene-setting for each task (where it fits, dependencies, architecture)
4. **Managing TodoWrite** - Tracking task status
5. **Providing full task text** - Subagents never read plan file directly
6. **Answering questions** - Before and during subagent work

**Why controller provides full text?** Efficiency gains:

- No file reading overhead for subagents
- Controller curates exactly what context is needed
- Subagent gets complete information upfront
- Questions surfaced before work begins (not after)

**Sources:** [skills/subagent-driven-development/SKILL.md180-185](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L180-L185) [RELEASE-NOTES.md66](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L66-L66)

### Subagent Context Isolation

```
```

**Benefits of fresh context:**

- No context pollution between tasks
- Each subagent focuses on single task
- Parallel-safe (subagents don't interfere)
- Subagents follow TDD naturally (no accumulated shortcuts)

**Sources:** [skills/subagent-driven-development/SKILL.md167-173](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L167-L173)

---

## Review Loops

### Loop Mechanics

Review loops are **not one-shot**. If a reviewer finds issues, the implementer fixes them, then the reviewer reviews again. This continues until the reviewer approves.

```
```

**Sources:** [skills/subagent-driven-development/SKILL.md219-223](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L219-L223) [RELEASE-NOTES.md63](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L63-L63)

### Red Flags in Review Loops

**Never:**

- Skip the re-review after implementer fixes issues
- Accept "close enough" on spec compliance
- Move to code quality review while spec compliance has open issues
- Move to next task while either review has open issues
- Let implementer self-review replace actual review (both are needed)

**If reviewer finds issues:**

1. Implementer (same subagent) fixes them
2. Reviewer reviews again (same reviewer)
3. Repeat until approved
4. Don't skip the re-review

**Sources:** [skills/subagent-driven-development/SKILL.md199-213](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L199-L213) [skills/subagent-driven-development/SKILL.md219-223](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L219-L223)

---

## Example Walkthrough

This example shows a typical subagent-driven development session for a plan with 5 tasks.

### Task 1: Hook Installation Script

```
You (Controller): I'm using Subagent-Driven Development to execute this plan.

[Read docs/plans/feature-plan.md once]
[Extract all 5 tasks with full text and context]
[Create TodoWrite with all 5 tasks]

Task 1: Hook installation script

[Already have Task 1 text and context from extraction]
[Dispatch implementation subagent with full task text + context]

Implementer: "Before I begin - should the hook be installed at user or system level?"

You: "User level (~/.config/superpowers/hooks/)"

Implementer: "Got it. Implementing now..."
[Later]
Implementer:
  - Implemented install-hook command
  - Added tests, 5/5 passing
  - Self-review: Found I missed --force flag, added it
  - Committed

[Get git SHAs]
[Dispatch spec compliance reviewer with task spec + implementer report]

Spec Reviewer: ✅ Spec compliant - all requirements met, nothing extra

[Dispatch code quality reviewer with SHAs + plan]

Code Reviewer: Strengths: Good test coverage, clean. Issues: None. Approved.

[Mark Task 1 complete in TodoWrite]
```

**Sources:** [skills/subagent-driven-development/SKILL.md91-123](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L91-L123)

### Task 2: Recovery Modes (with Review Loops)

```
Task 2: Recovery modes

[Already have Task 2 text and context from extraction]
[Dispatch implementation subagent with full task text + context]

Implementer: [No questions, proceeds]
Implementer:
  - Added verify/repair modes
  - 8/8 tests passing
  - Self-review: All good
  - Committed

[Dispatch spec compliance reviewer]

Spec Reviewer: ❌ Issues:
  - Missing: Progress reporting (spec says "report every 100 items")
  - Extra: Added --json flag (not requested)

[Implementer (same subagent) fixes issues]
Implementer: Removed --json flag, added progress reporting

[Spec reviewer reviews again - this is the loop]
Spec Reviewer: ✅ Spec compliant now

[Now proceed to code quality - only after spec is ✅]
[Dispatch code quality reviewer]

Code Reviewer: Strengths: Solid. Issues (Important): Magic number (100)

[Implementer fixes]
Implementer: Extracted PROGRESS_INTERVAL constant

[Code reviewer reviews again - another loop]
Code Reviewer: ✅ Approved

[Mark Task 2 complete in TodoWrite]
```

**Sources:** [skills/subagent-driven-development/SKILL.md125-157](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L125-L157)

### After All Tasks

```
[After Tasks 3, 4, 5 complete...]

[Dispatch final code-reviewer for entire implementation]
Final Reviewer: All requirements met, code quality excellent, ready to merge

[Use superpowers:finishing-a-development-branch]
Done!
```

**Sources:** [skills/subagent-driven-development/SKILL.md159-165](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L159-L165)

---

## Comparison with Alternative Approaches

### vs. Manual Execution

| Aspect               | Subagent-Driven Development    | Manual Execution                |
| -------------------- | ------------------------------ | ------------------------------- |
| **Context per task** | Fresh (no pollution)           | Accumulated (risk of shortcuts) |
| **TDD adherence**    | Subagents follow naturally     | Requires discipline             |
| **Questions**        | Subagent can ask before/during | Developer asks when stuck       |
| **Review**           | Automatic checkpoints          | Ad-hoc or none                  |
| **Parallel safety**  | Subagents don't interfere      | Single developer, no conflicts  |

**Sources:** [skills/subagent-driven-development/SKILL.md167-174](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L167-L174)

### vs. Executing Plans (Parallel Session)

| Aspect              | Subagent-Driven Development     | Executing Plans             |
| ------------------- | ------------------------------- | --------------------------- |
| **Session context** | Same session (no handoff)       | Parallel sessions           |
| **Progress**        | Continuous (no waiting)         | Human reviews batches       |
| **Review timing**   | After each task                 | Checkpoint after batch      |
| **Best for**        | Sequential work, fast iteration | Parallel work, batch review |

**Sources:** [skills/subagent-driven-development/SKILL.md175-179](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L175-L179)

---

## Cost Analysis

### Efficiency Gains

**Compared to manual execution:**

- No file reading overhead (controller provides full text)
- Controller curates exactly what context is needed
- Subagent gets complete information upfront
- Questions surfaced before work begins (not after)

**Sources:** [skills/subagent-driven-development/SKILL.md180-185](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L180-L185)

### Quality Gates

**Compared to no review:**

- Self-review catches issues before handoff
- Two-stage review: spec compliance, then code quality
- Review loops ensure fixes actually work
- Spec compliance prevents over/under-building
- Code quality ensures implementation is well-built

**Sources:** [skills/subagent-driven-development/SKILL.md186-192](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L186-L192)

### Additional Cost

**More subagent invocations:**

- Implementer subagent per task
- Spec reviewer subagent per task
- Code quality reviewer subagent per task
- Review loops add iterations

**Controller does more prep work:**

- Extracting all tasks upfront
- Curating context for each task
- Managing TodoWrite

**But catches issues early:** Cheaper than debugging later

**Sources:** [skills/subagent-driven-development/SKILL.md193-198](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L193-L198)

---

## Red Flags and Best Practices

### Never Do These

```
```

**Sources:** [skills/subagent-driven-development/SKILL.md199-213](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L199-L213)

### If Subagent Asks Questions

**Always:**

- Answer clearly and completely
- Provide additional context if needed
- Don't rush them into implementation

**Why?** Subagents surface questions to avoid guessing or making assumptions. Answering questions upfront is cheaper than fixing misunderstandings later.

**Sources:** [skills/subagent-driven-development/SKILL.md214-218](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L214-L218) [skills/subagent-driven-development/implementer-prompt.md19-27](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/implementer-prompt.md#L19-L27)

### If Reviewer Finds Issues

**Always:**

1. Same implementer subagent fixes them
2. Same reviewer reviews again
3. Repeat until approved
4. Don't skip the re-review

**Why?** Review loops ensure fixes actually work. "Close enough" compounds into technical debt.

**Sources:** [skills/subagent-driven-development/SKILL.md219-223](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L219-L223)

### If Subagent Fails Task

**Don't try to fix manually** - causes context pollution

**Instead:**

- Dispatch fix subagent with specific instructions
- Provide full context of what went wrong
- Let fix subagent complete the work

**Sources:** [skills/subagent-driven-development/SKILL.md224-227](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L224-L227)

---

## Integration with Other Skills

### Required Workflow Skills

The subagent-driven development workflow integrates with these other workflow skills:

```
```

**Sources:** [skills/subagent-driven-development/SKILL.md230-235](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L230-L235)

### Skills Used by Subagents

Subagents should use:

- **`superpowers:test-driven-development`** - Subagents follow TDD for each task

Subagents should NOT invoke workflow orchestration skills (like `subagent-driven-development` itself or `executing-plans`) - these are controller-level skills.

**Sources:** [skills/subagent-driven-development/SKILL.md236-238](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L236-L238)

### Code Review Integration

The code quality review stage uses:

- **`superpowers:requesting-code-review`** - Code review template for reviewer subagents
- **`superpowers:code-reviewer`** agent - Defined in [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)

The spec compliance review uses a general-purpose Task tool with custom prompt from [skills/subagent-driven-development/spec-reviewer-prompt.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/spec-reviewer-prompt.md)

**Sources:** [skills/subagent-driven-development/SKILL.md230-235](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L230-L235) [skills/subagent-driven-development/code-quality-reviewer-prompt.md9-19](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/code-quality-reviewer-prompt.md#L9-L19)

### Alternative Workflow

Instead of subagent-driven development, you can use:

- **`superpowers:executing-plans`** - For parallel session execution instead of same-session execution

**Sources:** [skills/subagent-driven-development/SKILL.md239-241](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L239-L241)

---

## Implementation History

The two-stage review system was introduced in v4.0.0 (2025-12-17) to address observed failure modes:

**Before v4.0.0:**

- Single-stage code review
- Common failure: code well-written but doesn't match requirements
- Reviewer distracted by both spec compliance and code quality concerns

**v4.0.0 changes:**

1. Split review into two separate stages
2. Spec compliance MUST pass before code quality review begins
3. Added review loops (iterative fix cycles)
4. Controller provides full task text (eliminates subagent file reading)
5. Workers can ask questions before AND during work
6. Added self-review checklist to implementer prompt

**Other improvements in v4.0.0:**

- Plan read once at start, extracted to TodoWrite
- Created three prompt templates: implementer, spec reviewer, code quality reviewer
- Moved `superpowers:code-reviewer` agent into plugin

**Sources:** [RELEASE-NOTES.md52-75](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L52-L75)

---

## File Structure

The subagent-driven development skill and its supporting files are located at:

```
skills/subagent-driven-development/
├── SKILL.md                         # Main skill definition with flowcharts
├── implementer-prompt.md            # Template for dispatching implementer subagents
├── spec-reviewer-prompt.md          # Template for spec compliance reviewers
└── code-quality-reviewer-prompt.md  # Template for code quality reviewers

agents/
└── code-reviewer.md                 # superpowers:code-reviewer agent definition
```

**Sources:** [skills/subagent-driven-development/SKILL.md1-4](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L1-L4) [skills/subagent-driven-development/implementer-prompt.md1-3](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/implementer-prompt.md#L1-L3) [skills/subagent-driven-development/spec-reviewer-prompt.md1-5](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/spec-reviewer-prompt.md#L1-L5) [skills/subagent-driven-development/code-quality-reviewer-prompt.md1-8](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/code-quality-reviewer-prompt.md#L1-L8) [agents/code-reviewer.md1-6](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L6)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Subagent-Driven Development](#subagent-driven-development.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Overview](#overview.md)
- [When to Use Subagent-Driven Development](#when-to-use-subagent-driven-development.md)
- [Decision Tree](#decision-tree.md)
- [Comparison with Alternatives](#comparison-with-alternatives.md)
- [The Two-Stage Review System](#the-two-stage-review-system.md)
- [Review Architecture](#review-architecture.md)
- [Stage 1: Spec Compliance Review](#stage-1-spec-compliance-review.md)
- [Stage 2: Code Quality Review](#stage-2-code-quality-review.md)
- [Why Two Stages?](#why-two-stages.md)
- [Complete Workflow Process](#complete-workflow-process.md)
- [High-Level Flow with Code Entities](#high-level-flow-with-code-entities.md)
- [Step-by-Step Process](#step-by-step-process.md)
- [1. Initial Setup](#1-initial-setup.md)
- [2. Per-Task Execution Loop](#2-per-task-execution-loop.md)
- [3. Final Review and Completion](#3-final-review-and-completion.md)
- [Context Management](#context-management.md)
- [Controller's Role](#controllers-role.md)
- [Subagent Context Isolation](#subagent-context-isolation.md)
- [Review Loops](#review-loops.md)
- [Loop Mechanics](#loop-mechanics.md)
- [Red Flags in Review Loops](#red-flags-in-review-loops.md)
- [Example Walkthrough](#example-walkthrough.md)
- [Task 1: Hook Installation Script](#task-1-hook-installation-script.md)
- [Task 2: Recovery Modes (with Review Loops)](#task-2-recovery-modes-with-review-loops.md)
- [After All Tasks](#after-all-tasks.md)
- [Comparison with Alternative Approaches](#comparison-with-alternative-approaches.md)
- [vs. Manual Execution](#vs-manual-execution.md)
- [vs. Executing Plans (Parallel Session)](#vs-executing-plans-parallel-session.md)
- [Cost Analysis](#cost-analysis.md)
- [Efficiency Gains](#efficiency-gains.md)
- [Quality Gates](#quality-gates.md)
- [Additional Cost](#additional-cost.md)
- [Red Flags and Best Practices](#red-flags-and-best-practices.md)
- [Never Do These](#never-do-these.md)
- [If Subagent Asks Questions](#if-subagent-asks-questions.md)
- [If Reviewer Finds Issues](#if-reviewer-finds-issues.md)
- [If Subagent Fails Task](#if-subagent-fails-task.md)
- [Integration with Other Skills](#integration-with-other-skills.md)
- [Required Workflow Skills](#required-workflow-skills.md)
- [Skills Used by Subagents](#skills-used-by-subagents.md)
- [Code Review Integration](#code-review-integration.md)
- [Alternative Workflow](#alternative-workflow.md)
- [Implementation History](#implementation-history.md)
- [File Structure](#file-structure.md)
