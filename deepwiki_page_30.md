# /obra/superpowers/7-key-skills-reference

Key Skills Reference | obra/superpowers | DeepWiki

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

# Key Skills Reference

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)

This document provides detailed technical documentation for the most important skills in the superpowers system. These are the skills users will encounter most frequently during development workflows.

For information about skill creation and authoring, see [Creating Skills](obra/superpowers/8-creating-skills.md). For platform-specific invocation mechanisms, see [Platform-Specific Features](obra/superpowers/5-platform-specific-features.md). For the complete development workflow, see [Development Workflows](obra/superpowers/6-development-workflows.md).

## Overview

Skills in the superpowers system are structured as SKILL.md files with YAML frontmatter containing metadata and markdown content providing guidance. Skills are organized hierarchically with meta-skills at the top that guide usage of process skills, which in turn invoke implementation skills.

### Skill File Structure

Every skill follows a consistent structure:

| Component        | Purpose                                        | Location                        |
| ---------------- | ---------------------------------------------- | ------------------------------- |
| YAML frontmatter | Metadata (`name`, `description`) for discovery | Lines 1-4 of SKILL.md           |
| Overview         | High-level purpose and context                 | First section after frontmatter |
| When to Use      | Explicit triggers for skill invocation         | Second section                  |
| Core Pattern     | Main workflow or process                       | Middle sections                 |
| Integration      | Related skills and dependencies                | Later sections                  |

Skills are stored in `~/.config/superpowers/skills/` (or platform-specific locations) and invoked via the Skill tool using namespace syntax like `superpowers:skill-name`.

**Sources:** [RELEASE-NOTES.md478-492](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L478-L492)

### Skill Hierarchy

The following diagram shows how key skills relate to each other in the four-tier hierarchy:

**Skill Dependency Hierarchy**

```
```

**Sources:** [RELEASE-NOTES.md112-116](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L112-L116) Diagram 2 from context

### Skill Types: Rigid vs Flexible

Skills are categorized by enforcement level:

| Type                | Characteristics                             | Examples                                       |
| ------------------- | ------------------------------------------- | ---------------------------------------------- |
| **Rigid Skills**    | Absolute requirements, no deviation allowed | `using-superpowers`, `test-driven-development` |
| **Flexible Skills** | Guidelines with room for adaptation         | `brainstorming`, `systematic-debugging`        |

Rigid skills contain "MUST", "REQUIRED", "NEVER" language and represent tested protocols. Flexible skills use "should", "consider", "typically" and provide frameworks rather than absolute rules.

**Sources:** Diagram 2 from context

## using-superpowers (Meta-Skill)

The foundational skill that establishes the mandatory protocol for skill usage. This skill is automatically injected at session start and defines how all other skills are discovered and invoked.

### The Rule: Mandatory First Response Protocol

**The Rule** requires that relevant or requested skills must be invoked BEFORE any response or action. This is enforced through specific language:

> "Invoke relevant or requested skills BEFORE any response or action"

The protocol includes a **1% threshold**: if there is even a 1% chance a skill applies, the skill must be invoked. This prevents rationalization where agents skip skills they think they understand.

**Sources:** [RELEASE-NOTES.md7-15](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L7-L15) [RELEASE-NOTES.md260-273](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L260-L273)

### Red Flags and Rationalization Prevention

The skill maintains a table of common rationalizations that agents use to skip skill invocation:

| Rationalization                   | Reality                        |
| --------------------------------- | ------------------------------ |
| "This is just a simple question"  | Skills apply to ALL work       |
| "I can check files quickly"       | Checking files ≠ using skills  |
| "Let me gather information first" | Skills tell you WHAT to gather |
| "I know what that means"          | Knowing concept ≠ using skill  |
| "This feels productive"           | Feeling ≠ following protocol   |

**Sources:** [RELEASE-NOTES.md132](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L132-L132) [RELEASE-NOTES.md267-271](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L267-L271)

### Priority System

When multiple skills apply, the priority order is:

1. **Process skills first** (brainstorming, debugging) - HOW to approach work
2. **Implementation skills second** (TDD, domain-specific) - WHAT to build

Example: Request "Build feature X" triggers `brainstorming` before any domain-specific implementation skills.

**Sources:** [RELEASE-NOTES.md112-116](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L112-L116) Diagram 2 from context

### Skill Invocation in Claude Code

The skill explicitly states the invocation mechanism to prevent confusion:

```
Use the Skill tool to read and run relevant skills
```

This replaced earlier guidance that incorrectly referenced the Read tool. The Skill tool loads skill content directly without requiring separate file reading operations.

**Sources:** [RELEASE-NOTES.md35-41](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L35-L41) [RELEASE-NOTES.md245-255](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L245-L255)

### File Structure

```
```

**Sources:** [RELEASE-NOTES.md260-277](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L260-L277)

## test-driven-development

The TDD skill enforces the RED-GREEN-REFACTOR cycle and contains the "Iron Law" that prohibits writing implementation code before a failing test exists.

### Core Protocol: RED-GREEN-REFACTOR

The skill defines three mandatory phases:

| Phase        | Action                                       | Verification                    |
| ------------ | -------------------------------------------- | ------------------------------- |
| **RED**      | Write failing test that captures requirement | Test must fail for right reason |
| **GREEN**    | Write minimal code to pass test              | Test must pass, no more         |
| **REFACTOR** | Improve design while maintaining green tests | All tests remain passing        |

**Sources:** [RELEASE-NOTES.md121-125](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L121-L125)

### The Iron Law

> "No implementation code without a failing test"

This absolute rule prevents the common failure mode where developers implement features and then write tests that confirm existing behavior rather than driving design.

**Sources:** Diagram 2 description from context

### Verification Checklist

The skill includes a checklist that must be completed:

- [ ] Test written before implementation
- [ ] Test fails for the right reason (not compilation error, not wrong assertion)
- [ ] Minimal implementation written
- [ ] Test passes
- [ ] Code refactored while maintaining passing tests

### Testing Anti-Patterns

The skill bundles `testing-anti-patterns.md` documenting failure modes:

| Anti-Pattern                  | Description                                       | Impact                           |
| ----------------------------- | ------------------------------------------------- | -------------------------------- |
| Testing mock behavior         | Test verifies mock was called, not real behavior  | Tests pass but code doesn't work |
| Test-only methods             | Add methods to production code solely for testing | Pollutes API surface             |
| Incomplete mocks              | Mock doesn't match real dependency structure      | Tests pass, integration fails    |
| Mocking without understanding | Mock created before understanding what to mock    | Wrong test isolation             |

**Sources:** [RELEASE-NOTES.md85-92](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L85-L92)

### File Structure

```
```

**Sources:** [RELEASE-NOTES.md85-92](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L85-L92) [RELEASE-NOTES.md121-125](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L121-L125)

## systematic-debugging

The systematic-debugging skill provides a four-phase debugging process with bundled supporting techniques and tools.

### Four-Phase Debugging Process

```
```

Each phase has specific activities:

| Phase                         | Activities                                  | Output                 |
| ----------------------------- | ------------------------------------------- | ---------------------- |
| Root Cause Investigation      | Stack trace analysis, reproduction steps    | Precise error location |
| Pattern Analysis              | Check for similar issues, identify patterns | Hypothesis candidates  |
| Hypothesis Testing            | Minimal changes to test theory              | Confirmed root cause   |
| Implementation & Verification | Apply fix, add regression tests             | Verified solution      |

**Sources:** Diagram 2 from context, [RELEASE-NOTES.md77-84](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L77-L84)

### Bundled Techniques

The skill bundles three supporting technique documents:

#### root-cause-tracing.md

Technique for tracing bugs backward through the call stack to find the original cause rather than treating symptoms.

#### defense-in-depth.md

Pattern for adding validation at multiple layers to prevent invalid state propagation.

#### condition-based-waiting.md

Technique for replacing arbitrary `sleep()` timeouts with condition polling. Includes `condition-based-waiting-example.ts` showing complete implementation.

**Sources:** [RELEASE-NOTES.md77-84](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L77-L84)

### find-polluter.sh Tool

Bisection script for finding which test creates environmental pollution affecting other tests:

```
skills/systematic-debugging/find-polluter.sh
```

Uses binary search to identify the polluting test in O(log n) time.

**Sources:** [RELEASE-NOTES.md82](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L82-L82)

### File Structure

```
```

**Sources:** [RELEASE-NOTES.md77-84](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L77-L84)

## subagent-driven-development

The SDD skill implements task-by-task execution with fresh subagents for each task, enforcing a mandatory two-stage review process.

### Two-Stage Review System

The critical innovation in SDD is separating spec compliance verification from code quality review:

```
```

**Stage 1: Spec Compliance Review**

Skeptical reviewer verifies implementation matches specification exactly. Catches:

- Missing requirements
- Over-building (implementing unspecified features)
- Misinterpretation of requirements

Reviewer does not trust implementer's report—reads actual code.

**Stage 2: Code Quality Review**

Only runs after spec compliance passes. Reviews:

- Clean code practices
- Test coverage
- Maintainability
- Design patterns

Both stages are **loops, not one-shot**: if reviewer finds issues, implementer fixes them, then reviewer checks again until passing.

**Sources:** [RELEASE-NOTES.md55-69](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L55-L69) Diagram 3 from context

### Prompt Templates

The skill bundles three prompt templates:

| Template                          | Purpose                                  | Location                            |
| --------------------------------- | ---------------------------------------- | ----------------------------------- |
| `implementer-prompt.md`           | Subagent instructions for implementation | skills/subagent-driven-development/ |
| `spec-reviewer-prompt.md`         | Skeptical spec verification              | skills/subagent-driven-development/ |
| `code-quality-reviewer-prompt.md` | Standard code review                     | skills/subagent-driven-development/ |

**Sources:** [RELEASE-NOTES.md71-74](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L71-L74)

### Workflow Improvements

Additional protocol elements:

- Controller provides **full task text** to workers (not file references)
- Workers can ask **clarifying questions** before AND during work
- **Self-review checklist** required before reporting completion
- Plan read once at start, extracted to TodoWrite

**Sources:** [RELEASE-NOTES.md65-69](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L65-L69)

### Integration with code-reviewer Agent

The skill uses the `superpowers:code-reviewer` agent for code quality review:

```
superpowers:code-reviewer
```

This agent is defined in [agents/code-reviewer.md1-49](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L49) and provides structured review output with severity categorization (Critical/Important/Suggestions).

**Sources:** [RELEASE-NOTES.md282-292](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L282-L292) [agents/code-reviewer.md1-49](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L49)

## Other Essential Skills

### brainstorming

**Mandatory first step** for any creative work. Description uses imperative language:

> "You MUST use this before any creative work—creating features, building components, adding functionality, or modifying behavior."

The skill enforces interactive design refinement through Q\&A before writing design documents to `docs/plans/YYYY-MM-DD-topic-design.md`.

**Trigger priority:** When a user says "Build X", `brainstorming` triggers before any domain-specific implementation skills.

**Sources:** [RELEASE-NOTES.md117-119](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L117-L119) [RELEASE-NOTES.md297-304](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L297-L304) Diagram 3 from context

### writing-plans

Converts design documents into detailed, bite-sized task plans with 2-5 minute task granularity. Creates implementation plans at `docs/plans/YYYY-MM-DD-feature-name.md` (note: different suffix from `-design.md`).

Each task includes:

- Specific action to take
- Expected outcome
- Verification criteria

**Sources:** [RELEASE-NOTES.md315-319](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L315-L319) Diagram 3 from context

### executing-plans

Batch execution mode for parallel sessions. Default batch size is 3 tasks with review checkpoints between batches. Use when:

- Tasks are independent
- Parallel execution beneficial
- Same session execution not required

Contrast with `subagent-driven-development` which executes in same session with controller orchestration.

**Sources:** Diagram 3 from context

### using-git-worktrees

Creates isolated development environments for feature work. Process:

1. Directory selection (careful path construction)
2. Safety verification (no uncommitted changes)
3. Worktree creation
4. Dependency installation
5. Baseline testing (verify clean starting state)

Prevents contamination of main working directory.

**Sources:** Diagram 3 from context

### requesting-code-review

Invokes `superpowers:code-reviewer` agent with git SHA specification. Review output includes:

- **Critical issues** (must fix)
- **Important issues** (should fix)
- **Suggestions** (nice to have)

Includes guidance for replying to inline GitHub review comments in original thread rather than as top-level PR comments.

**Sources:** [RELEASE-NOTES.md43-45](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L43-L45) [agents/code-reviewer.md1-49](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L49)

### finishing-a-development-branch

Completion workflow with four structured options:

1. **Merge** to main branch (fast-forward or merge commit)
2. **Create PR** for upstream contribution
3. **Keep** worktree for future work
4. **Discard** worktree and changes

Includes test verification before merge and worktree cleanup.

**Sources:** Diagram 3 from context

### writing-skills

Meta-skill for skill authors. Contains guidance on:

- TDD methodology for documentation (RED-GREEN-REFACTOR for skills)
- SKILL.md structure requirements
- Claude Search Optimization (CSO)
- Cross-referencing with `**REQUIRED SUB-SKILL:**` markers
- Automation over documentation principle

Updated in v4.0.1 to emphasize that mechanical constraints should be automated, not documented—skills are for judgment calls.

Bundles `anthropic-best-practices.md` providing official Anthropic guidance and includes `testing-skills-with-subagents` (formerly standalone skill).

**Sources:** [RELEASE-NOTES.md47-49](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L47-L49) [RELEASE-NOTES.md347-349](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L347-L349) [RELEASE-NOTES.md488-492](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L488-L492)

## Skill Resolution

### Three-Tier Priority System

Skills are resolved using a three-tier priority system:

```
```

Higher priority skills override lower priority skills when names match.

**Sources:** [RELEASE-NOTES.md169](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L169-L169) Diagram 4 from context

### Namespace Prefixes

Skills can be invoked with explicit namespace:

- `superpowers:skill-name` - Force superpowers skills
- `skill-name` - Use priority resolution

All internal skill references use `superpowers:` prefix for clarity.

**Sources:** [RELEASE-NOTES.md307-312](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L307-L312) [RELEASE-NOTES.md220](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L220-L220)

## Skill Updates and Versioning

### Auto-Update Mechanism

On every session start, `lib/initialize-skills.sh` performs:

1. `git fetch upstream` (or tracking remote)
2. Fast-forward merge if possible
3. Display update status
4. Warn if manual sync needed (diverged branches)

**Sources:** [RELEASE-NOTES.md456-460](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L456-L460) Diagram 6 from context

### Version Independence

Skills repository versions independently from plugin:

- **Plugin version:** [.claude-plugin/plugin.json3](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L3-L3) (`"version": "4.0.3"`)
- **Skills repository:** Separate git repository with own versioning

This separation enables rapid skill evolution without plugin releases.

**Sources:** [RELEASE-NOTES.md414](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L414-L414) Diagram 1 from context

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Key Skills Reference](#key-skills-reference.md)
- [Overview](#overview.md)
- [Skill File Structure](#skill-file-structure.md)
- [Skill Hierarchy](#skill-hierarchy.md)
- [Skill Types: Rigid vs Flexible](#skill-types-rigid-vs-flexible.md)
- [using-superpowers (Meta-Skill)](#using-superpowers-meta-skill.md)
- [The Rule: Mandatory First Response Protocol](#the-rule-mandatory-first-response-protocol.md)
- [Red Flags and Rationalization Prevention](#red-flags-and-rationalization-prevention.md)
- [Priority System](#priority-system.md)
- [Skill Invocation in Claude Code](#skill-invocation-in-claude-code.md)
- [File Structure](#file-structure.md)
- [test-driven-development](#test-driven-development.md)
- [Core Protocol: RED-GREEN-REFACTOR](#core-protocol-red-green-refactor.md)
- [The Iron Law](#the-iron-law.md)
- [Verification Checklist](#verification-checklist.md)
- [Testing Anti-Patterns](#testing-anti-patterns.md)
- [File Structure](#file-structure-1.md)
- [systematic-debugging](#systematic-debugging.md)
- [Four-Phase Debugging Process](#four-phase-debugging-process.md)
- [Bundled Techniques](#bundled-techniques.md)
- [root-cause-tracing.md](#root-cause-tracingmd.md)
- [defense-in-depth.md](#defense-in-depthmd.md)
- [condition-based-waiting.md](#condition-based-waitingmd.md)
- [find-polluter.sh Tool](#find-pollutersh-tool.md)
- [File Structure](#file-structure-2.md)
- [subagent-driven-development](#subagent-driven-development.md)
- [Two-Stage Review System](#two-stage-review-system.md)
- [Prompt Templates](#prompt-templates.md)
- [Workflow Improvements](#workflow-improvements.md)
- [Integration with code-reviewer Agent](#integration-with-code-reviewer-agent.md)
- [Other Essential Skills](#other-essential-skills.md)
- [brainstorming](#brainstorming.md)
- [writing-plans](#writing-plans.md)
- [executing-plans](#executing-plans.md)
- [using-git-worktrees](#using-git-worktrees.md)
- [requesting-code-review](#requesting-code-review.md)
- [finishing-a-development-branch](#finishing-a-development-branch.md)
- [writing-skills](#writing-skills.md)
- [Skill Resolution](#skill-resolution.md)
- [Three-Tier Priority System](#three-tier-priority-system.md)
- [Namespace Prefixes](#namespace-prefixes.md)
- [Skill Updates and Versioning](#skill-updates-and-versioning.md)
- [Auto-Update Mechanism](#auto-update-mechanism.md)
- [Version Independence](#version-independence.md)
