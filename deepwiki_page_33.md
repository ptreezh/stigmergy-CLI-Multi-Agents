# /obra/superpowers/7.3-systematic-debugging

Systematic Debugging | obra/superpowers | DeepWiki

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

# Systematic Debugging

Relevant source files

- [skills/executing-plans/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md)
- [skills/systematic-debugging/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md)
- [skills/writing-plans/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md)

## Purpose and Scope

This page documents the `systematic-debugging` skill, a four-phase framework that ensures root cause understanding before attempting solutions to any technical issue. This skill applies to test failures, bugs, unexpected behavior, build failures, and integration issues.

For writing the tests that verify fixes work, see [Test-Driven Development](obra/superpowers/7.2-test-driven-development.md). For complex multi-layer tracing, the skill references the `root-cause-tracing` sub-skill. For overall verification practices, see [Verification Before Completion](obra/superpowers/6.5-executing-plans-in-batches.md).

**Sources:** [skills/systematic-debugging/SKILL.md1-6](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L1-L6)

---

## Core Principle and The Iron Law

The systematic debugging skill is built on a single uncompromising principle: **find the root cause before attempting fixes**. Random fixes waste time, create new bugs, and mask underlying issues.

### The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If Phase 1 (Root Cause Investigation) has not been completed, proposing fixes is prohibited. As stated in the skill: "Violating the letter of this process is violating the spirit of debugging."

**Sources:** [skills/systematic-debugging/SKILL.md12-22](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L12-L22)

---

## When to Use This Skill

The `systematic-debugging` skill applies to **any** technical issue:

| Issue Type           | Examples                                       |
| -------------------- | ---------------------------------------------- |
| Test failures        | Unit tests, integration tests, E2E tests       |
| Bugs in production   | Runtime errors, incorrect behavior             |
| Performance problems | Slow queries, memory leaks, bottlenecks        |
| Build failures       | Compilation errors, packaging issues           |
| Integration issues   | API mismatches, service communication failures |

### Critical Use Cases

The skill is **especially required** when:

- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

The skill explicitly states: "Don't skip when issue seems simple" - simple bugs have root causes too. The systematic approach is faster than guess-and-check thrashing.

**Sources:** [skills/systematic-debugging/SKILL.md24-45](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L24-L45)

---

## The Four-Phase Framework

The skill enforces strict sequential phase completion. Each phase must be completed before proceeding to the next.

```
```

**Diagram: Four-Phase Sequential Process with Decision Points**

**Sources:** [skills/systematic-debugging/SKILL.md46-49](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L46-L49) [skills/systematic-debugging/SKILL.md258-265](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L258-L265)

---

## Phase 1: Root Cause Investigation

Phase 1 is the foundation - no fixes can be proposed without completing this phase. The phase consists of five required steps.

### Step 1: Read Error Messages Carefully

Error messages often contain the exact solution. Requirements:

- Don't skip past errors or warnings
- Read stack traces completely
- Note line numbers, file paths, error codes

### Step 2: Reproduce Consistently

Can you trigger the issue reliably? Document:

- Exact steps to reproduce
- Whether it happens every time
- If not reproducible → gather more data, **do not guess**

### Step 3: Check Recent Changes

Identify what changed:

- Git diff, recent commits
- New dependencies, config changes
- Environmental differences

### Step 4: Gather Evidence in Multi-Component Systems

**This step is required when the system has multiple components** (e.g., CI → build → signing, or API → service → database).

Before proposing fixes, add diagnostic instrumentation at each component boundary:

```
For EACH component boundary:
  - Log what data enters component
  - Log what data exits component
  - Verify environment/config propagation
  - Check state at each layer

Run once to gather evidence showing WHERE it breaks
THEN analyze evidence to identify failing component
THEN investigate that specific component
```

**Sources:** [skills/systematic-debugging/SKILL.md50-109](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L50-L109)

### Multi-Component Diagnostic Pattern

The skill provides a concrete example for multi-layer systems:

```
```

**Diagram: Multi-Layer Diagnostic Instrumentation Pattern**

The pattern shown in [skills/systematic-debugging/SKILL.md89-106](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L89-L106) demonstrates adding diagnostics at each layer boundary to identify where data flow breaks.

**Sources:** [skills/systematic-debugging/SKILL.md73-109](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L73-L109)

### Step 5: Trace Data Flow

When an error is deep in the call stack, the skill **requires** using the `root-cause-tracing` sub-skill for backward tracing:

- Where does the bad value originate?
- What called this with the bad value?
- Keep tracing up until you find the source
- **Fix at source, not at symptom**

**Sources:** [skills/systematic-debugging/SKILL.md110-121](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L110-L121)

---

## Phase 2: Pattern Analysis

Before fixing anything, identify the pattern by comparing working and broken code.

| Step                       | Activity                                          | Purpose                          |
| -------------------------- | ------------------------------------------------- | -------------------------------- |
| Find Working Examples      | Locate similar working code in same codebase      | Establish baseline behavior      |
| Compare Against References | Read reference implementation **completely**      | Understand pattern fully         |
| Identify Differences       | List every difference, however small              | Don't assume "that can't matter" |
| Understand Dependencies    | Document required components, config, environment | Identify missing prerequisites   |

The skill emphasizes: "If implementing pattern, read reference implementation COMPLETELY. Don't skim - read every line."

**Sources:** [skills/systematic-debugging/SKILL.md122-144](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L122-L144)

---

## Phase 3: Hypothesis and Testing

Apply the scientific method with controlled experiments.

### Process

1. **Form Single Hypothesis**

   - State clearly: "I think X is the root cause because Y"
   - Write it down explicitly
   - Be specific, not vague

2. **Test Minimally**

   - Make the **smallest possible** change to test hypothesis
   - One variable at a time
   - Don't fix multiple things at once

3. **Verify Before Continuing**

   - Did it work? Yes → proceed to Phase 4
   - Didn't work? Form **new** hypothesis
   - **Don't** add more fixes on top

4. **When You Don't Know**

   - Say "I don't understand X"
   - Don't pretend to know
   - Ask for help or research more

**Sources:** [skills/systematic-debugging/SKILL.md145-169](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L145-L169)

---

## Phase 4: Implementation

Fix the root cause identified in previous phases, not symptoms.

### Implementation Steps

1. **Create Failing Test Case** (Required Sub-Skill)

   - Simplest possible reproduction
   - Automated test if possible
   - One-off test script if no framework
   - **Must have before fixing**
   - **Required:** Use `test-driven-development` skill (see [Test-Driven Development](obra/superpowers/7.2-test-driven-development.md))

2. **Implement Single Fix**

   - Address the root cause identified
   - **One change at a time**
   - No "while I'm here" improvements
   - No bundled refactoring

3. **Verify Fix**

   - Test passes now?
   - No other tests broken?
   - Issue actually resolved?

4. **If Fix Doesn't Work**

   - **STOP**
   - Count: How many fixes have you tried?
   - If < 3: Return to Phase 1, re-analyze with new information
   - **If ≥ 3: STOP and question the architecture (see below)**
   - Don't attempt Fix #4 without architectural discussion

**Sources:** [skills/systematic-debugging/SKILL.md170-198](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L170-L198)

### The 3+ Fixes Rule: Question Architecture

```
```

**Diagram: Architecture Questioning After 3 Failed Fixes**

After three failed fix attempts, the skill requires **stopping and questioning the architecture**. Patterns indicating architectural problems:

- Each fix reveals new shared state/coupling/problem in a different place
- Fixes require "massive refactoring" to implement
- Each fix creates new symptoms elsewhere

At this point: **"This is NOT a failed hypothesis - this is a wrong architecture."**

The skill requires discussing with your human partner before attempting additional fixes.

**Sources:** [skills/systematic-debugging/SKILL.md199-214](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L199-L214)

---

## Red Flags: When to Stop and Return to Phase 1

The skill lists explicit "red flags" - thoughts that indicate you're violating the process:

| Red Flag Thought                               | What It Means                        |
| ---------------------------------------------- | ------------------------------------ |
| "Quick fix for now, investigate later"         | Skipping root cause investigation    |
| "Just try changing X and see if it works"      | Guessing instead of understanding    |
| "Add multiple changes, run tests"              | Not isolating variables              |
| "Skip the test, I'll manually verify"          | No proof fix works                   |
| "It's probably X, let me fix that"             | Proposing solution without evidence  |
| "Pattern says X but I'll adapt it differently" | Not reading references completely    |
| "Here are the main problems: \[lists fixes]"   | Proposing fixes before investigation |
| "One more fix attempt" (when already tried 2+) | Ignoring the 3+ fixes rule           |

**All of these mean: STOP. Return to Phase 1.**

If 3+ fixes have failed: Question the architecture (see Phase 4.5 above).

**Sources:** [skills/systematic-debugging/SKILL.md215-232](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L215-L232)

### Human Partner Signals

The skill documents common redirections from human partners that indicate process violations:

| Human Signal                | What You Did Wrong                           |
| --------------------------- | -------------------------------------------- |
| "Is that not happening?"    | You assumed without verifying                |
| "Will it show us...?"       | You should have added evidence gathering     |
| "Stop guessing"             | You're proposing fixes without understanding |
| "Ultrathink this"           | Question fundamentals, not just symptoms     |
| "We're stuck?" (frustrated) | Your approach isn't working                  |

**When you see these: STOP. Return to Phase 1.**

**Sources:** [skills/systematic-debugging/SKILL.md234-244](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L234-L244)

---

## Common Rationalizations

The skill documents common excuses for skipping the process and the reality:

| Excuse                                       | Reality                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| "Issue is simple, don't need process"        | Simple issues have root causes too. Process is fast for simple bugs.    |
| "Emergency, no time for process"             | Systematic debugging is **FASTER** than guess-and-check thrashing.      |
| "Just try this first, then investigate"      | First fix sets the pattern. Do it right from the start.                 |
| "I'll write test after confirming fix works" | Untested fixes don't stick. Test first proves it.                       |
| "Multiple fixes at once saves time"          | Can't isolate what worked. Causes new bugs.                             |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely.              |
| "I see the problem, let me fix it"           | Seeing symptoms ≠ understanding root cause.                             |
| "One more fix attempt" (after 2+ failures)   | 3+ failures = architectural problem. Question pattern, don't fix again. |

**Sources:** [skills/systematic-debugging/SKILL.md246-257](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L246-L257)

---

## Integration with Other Skills

The `systematic-debugging` skill integrates with several other skills in the Superpowers system:

```
```

**Diagram: Skill Integration Dependencies**

### Required Sub-Skills

| Skill                     | When Required                                      | Reference                                                                                                                                                                                                                  |
| ------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root-cause-tracing`      | Phase 1, Step 5 - when error is deep in call stack | [skills/systematic-debugging/SKILL.md114-121](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L114-L121)                                                                            |
| `test-driven-development` | Phase 4, Step 1 - creating failing test case       | [skills/systematic-debugging/SKILL.md179](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L179-L179) see [Test-Driven Development](obra/superpowers/7.2-test-driven-development.md) |

### Complementary Skills

| Skill                            | Usage                                                      | Reference                                                                                                                                                                                                               |
| -------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defense-in-depth`               | Add validation at multiple layers after finding root cause | [skills/systematic-debugging/SKILL.md285](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L285-L285)                                                                             |
| `condition-based-waiting`        | Replace arbitrary timeouts identified in Phase 2           | [skills/systematic-debugging/SKILL.md286](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L286-L286) see [Condition-Based Waiting](obra/superpowers/7.3-systematic-debugging.md) |
| `verification-before-completion` | Verify fix worked before claiming success                  | [skills/systematic-debugging/SKILL.md287](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L287-L287)                                                                             |

**Sources:** [skills/systematic-debugging/SKILL.md279-288](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L279-L288)

---

## Skill Structure and Metadata

The `systematic-debugging` skill is defined in `skills/systematic-debugging/SKILL.md` with the following structure:

```
```

The skill document contains:

| Section                 | Lines                                                                | Content                                   |
| ----------------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| YAML Frontmatter        | [1-4](https://github.com/obra/superpowers/blob/a01a135f/1-4)         | Skill name and description for discovery  |
| Overview & Iron Law     | [6-22](https://github.com/obra/superpowers/blob/a01a135f/6-22)       | Core principle and non-negotiable rule    |
| When to Use             | [24-45](https://github.com/obra/superpowers/blob/a01a135f/24-45)     | Trigger conditions and critical use cases |
| Four Phases             | [46-214](https://github.com/obra/superpowers/blob/a01a135f/46-214)   | Detailed phase-by-phase procedures        |
| Red Flags               | [215-232](https://github.com/obra/superpowers/blob/a01a135f/215-232) | Stop signals for process violations       |
| Human Signals           | [234-244](https://github.com/obra/superpowers/blob/a01a135f/234-244) | Partner redirections indicating issues    |
| Common Rationalizations | [246-257](https://github.com/obra/superpowers/blob/a01a135f/246-257) | Excuses table with rebuttals              |
| Quick Reference         | [258-265](https://github.com/obra/superpowers/blob/a01a135f/258-265) | Summary table of phases                   |
| Integration             | [279-288](https://github.com/obra/superpowers/blob/a01a135f/279-288) | Required and complementary skills         |
| Real-World Impact       | [290-296](https://github.com/obra/superpowers/blob/a01a135f/290-296) | Performance metrics                       |

**Sources:** [skills/systematic-debugging/SKILL.md1-296](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L1-L296)

---

## Real-World Impact

The skill documents measured performance differences between systematic and random approaches:

| Metric              | Systematic Approach | Random Fixes Approach  |
| ------------------- | ------------------- | ---------------------- |
| Time to fix         | 15-30 minutes       | 2-3 hours of thrashing |
| First-time fix rate | 95%                 | 40%                    |
| New bugs introduced | Near zero           | Common                 |

These metrics demonstrate that the systematic approach is not just more reliable but actually **faster** than guess-and-check debugging.

**Sources:** [skills/systematic-debugging/SKILL.md289-296](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L289-L296)

---

## Quick Reference Table

The skill provides a summary table of the four phases:

| Phase                 | Key Activities                                         | Success Criteria            |
| --------------------- | ------------------------------------------------------ | --------------------------- |
| **1. Root Cause**     | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY     |
| **2. Pattern**        | Find working examples, compare                         | Identify differences        |
| **3. Hypothesis**     | Form theory, test minimally                            | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify                               | Bug resolved, tests pass    |

**Sources:** [skills/systematic-debugging/SKILL.md258-265](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md#L258-L265)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Systematic Debugging](#systematic-debugging.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Core Principle and The Iron Law](#core-principle-and-the-iron-law.md)
- [The Iron Law](#the-iron-law.md)
- [When to Use This Skill](#when-to-use-this-skill.md)
- [Critical Use Cases](#critical-use-cases.md)
- [The Four-Phase Framework](#the-four-phase-framework.md)
- [Phase 1: Root Cause Investigation](#phase-1-root-cause-investigation.md)
- [Step 1: Read Error Messages Carefully](#step-1-read-error-messages-carefully.md)
- [Step 2: Reproduce Consistently](#step-2-reproduce-consistently.md)
- [Step 3: Check Recent Changes](#step-3-check-recent-changes.md)
- [Step 4: Gather Evidence in Multi-Component Systems](#step-4-gather-evidence-in-multi-component-systems.md)
- [Multi-Component Diagnostic Pattern](#multi-component-diagnostic-pattern.md)
- [Step 5: Trace Data Flow](#step-5-trace-data-flow.md)
- [Phase 2: Pattern Analysis](#phase-2-pattern-analysis.md)
- [Phase 3: Hypothesis and Testing](#phase-3-hypothesis-and-testing.md)
- [Process](#process.md)
- [Phase 4: Implementation](#phase-4-implementation.md)
- [Implementation Steps](#implementation-steps.md)
- [The 3+ Fixes Rule: Question Architecture](#the-3-fixes-rule-question-architecture.md)
- [Red Flags: When to Stop and Return to Phase 1](#red-flags-when-to-stop-and-return-to-phase-1.md)
- [Human Partner Signals](#human-partner-signals.md)
- [Common Rationalizations](#common-rationalizations.md)
- [Integration with Other Skills](#integration-with-other-skills.md)
- [Required Sub-Skills](#required-sub-skills.md)
- [Complementary Skills](#complementary-skills.md)
- [Skill Structure and Metadata](#skill-structure-and-metadata.md)
- [Real-World Impact](#real-world-impact.md)
- [Quick Reference Table](#quick-reference-table.md)
