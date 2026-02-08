# /obra/superpowers/6.6-code-review-process

Code Review Process | obra/superpowers | DeepWiki

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

# Code Review Process

Relevant source files

- [skills/requesting-code-review/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/requesting-code-review/SKILL.md)
- [skills/subagent-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md)
- [skills/subagent-driven-development/code-quality-reviewer-prompt.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/code-quality-reviewer-prompt.md)
- [skills/subagent-driven-development/implementer-prompt.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/implementer-prompt.md)
- [skills/subagent-driven-development/spec-reviewer-prompt.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/spec-reviewer-prompt.md)

**Purpose:** This document explains the two-stage code review system used in superpowers workflows: spec compliance review (verifies implementation matches requirements exactly) followed by code quality review (verifies implementation is well-built). This process is primarily used in subagent-driven development workflows to catch both wrong implementations and poorly-written correct implementations.

**Scope:** Covers the review process itself, review loop mechanics, and the reviewer prompts. For the broader subagent workflow that uses these reviews, see [Subagent-Driven Development](obra/superpowers/6.4-subagent-driven-development.md). For the execution alternative without continuous review, see [Executing Plans (Parallel Session)](obra/superpowers/6.5-executing-plans-in-batches.md). For branch completion after all reviews pass, see [Finishing Development Branches](obra/superpowers/6.7-finishing-development-branches.md).

## Overview: Two-Stage Review System

The superpowers code review process enforces a mandatory two-stage review after each task implementation:

| Stage                  | Purpose                          | Reviews For                                             | Blocks Next Stage If               |
| ---------------------- | -------------------------------- | ------------------------------------------------------- | ---------------------------------- |
| **1. Spec Compliance** | Verify correct implementation    | Missing requirements, extra features, misunderstandings | Any spec deviation found           |
| **2. Code Quality**    | Verify well-built implementation | Clean code, test coverage, maintainability, patterns    | Critical or important issues found |

**Key principle:** These stages are sequential and mandatory. Code quality review never starts until spec compliance review passes. This prevents wasting time reviewing code style on implementations that don't match requirements.

### When Reviews Occur

```
```

**Sources:** [RELEASE-NOTES.md55-74](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L55-L74) [skills/subagent-driven-development/SKILL.md40-83](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L40-L83)

## Stage 1: Spec Compliance Review

**Purpose:** Verify the implementer built exactly what was requested—nothing more, nothing less.

### What Spec Compliance Reviews Check

The spec reviewer is explicitly skeptical and does not trust the implementer's report:

| Check Category           | Verification                                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Missing Requirements** | Did they implement everything requested? Any requirements skipped? Did they claim something works but not actually implement it? |
| **Extra/Unneeded Work**  | Did they build things not requested? Over-engineer? Add "nice to haves" not in spec?                                             |
| **Misunderstandings**    | Did they interpret requirements differently? Solve the wrong problem? Right feature but wrong way?                               |

### The Skeptical Reviewer Pattern

The spec reviewer prompt explicitly instructs skepticism:

```
## CRITICAL: Do Not Trust the Report

The implementer finished suspiciously quickly. Their report may be incomplete,
inaccurate, or optimistic. You MUST verify everything independently.

**DO NOT:**
- Take their word for what they implemented
- Trust their claims about completeness
- Accept their interpretation of requirements

**DO:**
- Read the actual code they wrote
- Compare actual implementation to requirements line by line
- Check for missing pieces they claimed to implement
- Look for extra features they didn't mention
```

**Sources:** [skills/subagent-driven-development/spec-reviewer-prompt.md21-36](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/spec-reviewer-prompt.md#L21-L36)

### Spec Reviewer Dispatch

```
```

The controller dispatches the spec reviewer using a general-purpose task tool with the full task requirements text (not a file reference):

- **What Was Requested:** Full text of task requirements from plan
- **What Implementer Claims:** From implementer's completion report
- **Instruction:** Read actual code, compare to requirements line-by-line, report missing/extra items

**Sources:** [skills/subagent-driven-development/spec-reviewer-prompt.md1-62](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/spec-reviewer-prompt.md#L1-L62) [skills/subagent-driven-development/SKILL.md70-72](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L70-L72)

### Spec Compliance Outcomes

| Result               | Next Action                                                     |
| -------------------- | --------------------------------------------------------------- |
| **✅ Spec Compliant** | Proceed to Stage 2 (Code Quality Review)                        |
| **❌ Issues Found**   | Implementer fixes, then spec reviewer re-reviews (loop until ✅) |

The spec reviewer reports issues with specific file:line references, not vague descriptions.

**Sources:** [skills/subagent-driven-development/SKILL.md136-148](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L136-L148)

## Stage 2: Code Quality Review

**Purpose:** Verify the implementation is well-built—clean code, proper tests, maintainable.

**Only runs after spec compliance review passes.** Never review code quality on an implementation that doesn't match requirements.

### What Code Quality Reviews Check

The code quality reviewer evaluates implementation against coding standards:

| Category               | Checks                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| **Strengths**          | What was done well (acknowledge positives first)                     |
| **Issues - Critical**  | Must fix before proceeding (security, correctness, breaking changes) |
| **Issues - Important** | Should fix (maintainability, test gaps, patterns)                    |
| **Issues - Minor**     | Nice to have (style, naming suggestions)                             |
| **Assessment**         | Overall evaluation and approval decision                             |

### Code Quality Reviewer Dispatch

```
```

The controller dispatches code quality review using the `superpowers:code-reviewer` agent via the template at [skills/subagent-driven-development/code-quality-reviewer-prompt.md1-21](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/code-quality-reviewer-prompt.md#L1-L21):

- **WHAT\_WAS\_IMPLEMENTED:** From implementer's report
- **PLAN\_OR\_REQUIREMENTS:** Task N from plan file
- **BASE\_SHA:** Commit before task started
- **HEAD\_SHA:** Current commit after implementation
- **DESCRIPTION:** Task summary

The code-reviewer agent template is at [agents/code-reviewer.md1-49](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L49)

**Sources:** [skills/subagent-driven-development/code-quality-reviewer-prompt.md1-21](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/code-quality-reviewer-prompt.md#L1-L21) [skills/subagent-driven-development/SKILL.md73-77](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L73-L77)

### Code Quality Outcomes

| Result           | Next Action                                                        |
| ---------------- | ------------------------------------------------------------------ |
| **✅ Approved**   | Mark task complete, move to next task                              |
| **Issues Found** | Implementer fixes, then quality reviewer re-reviews (loop until ✅) |

Only Critical and Important issues block progress. Minor issues can be addressed but don't block task completion.

**Sources:** [skills/subagent-driven-development/SKILL.md149-156](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L149-L156)

## Review Loop Mechanism

Both review stages implement a loop pattern: if issues are found, the implementer (same subagent) fixes them, then the reviewer re-reviews.

### Review Loop Flow

```
```

### Loop Characteristics

| Aspect        | Implementation                                                       |
| ------------- | -------------------------------------------------------------------- |
| **Who Fixes** | Same implementer subagent that did original work (maintains context) |
| **Fix Scope** | Only the specific issues identified by reviewer                      |
| **Re-review** | Always required after fixes (don't skip verification)                |
| **Loop Exit** | Only when reviewer explicitly approves (✅)                           |

**Red Flag:** Moving to next task while either review has open issues. Both reviews must reach ✅ before task completion.

**Sources:** [skills/subagent-driven-development/SKILL.md72-223](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L72-L223)

## The code-reviewer Agent

The `superpowers:code-reviewer` agent provides systematic code quality review functionality.

### Agent Configuration

```
```

Location: [agents/code-reviewer.md1-6](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L6)

### Review Process

The code-reviewer agent executes six review phases:

1. **Plan Alignment Analysis:** Compare implementation to original planning document, identify deviations, assess if justified
2. **Code Quality Assessment:** Review for patterns, error handling, type safety, organization, test coverage
3. **Architecture and Design Review:** Verify SOLID principles, separation of concerns, integration, scalability
4. **Documentation and Standards:** Check comments, function docs, file headers, adherence to conventions
5. **Issue Identification:** Categorize as Critical/Important/Suggestions with specific examples and recommendations
6. **Communication Protocol:** Ask agent to review deviations, recommend plan updates, provide clear guidance

**Sources:** [agents/code-reviewer.md10-47](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L10-L47)

### Output Structure

The code-reviewer returns structured feedback:

| Section                  | Content                                                 |
| ------------------------ | ------------------------------------------------------- |
| **Strengths**            | What was done well (always acknowledge positives first) |
| **Issues - Critical**    | Must fix before proceeding                              |
| **Issues - Important**   | Should fix for maintainability                          |
| **Issues - Suggestions** | Nice to have improvements                               |
| **Plan Deviations**      | Comparison to original plan, assessment of deviations   |
| **Assessment**           | Overall evaluation and approval recommendation          |

**Sources:** [agents/code-reviewer.md35-40](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L35-L40)

## Integration with Development Workflows

### Subagent-Driven Development

The two-stage review is mandatory in subagent-driven-development workflow:

```
```

The implementer performs self-review before handoff using the checklist at [skills/subagent-driven-development/implementer-prompt.md44-68](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/implementer-prompt.md#L44-L68) checking completeness, quality, discipline, and testing. However, self-review does not replace the two-stage formal review—both are required.

**Sources:** [skills/subagent-driven-development/SKILL.md38-83](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L38-L83) [skills/subagent-driven-development/implementer-prompt.md44-78](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/implementer-prompt.md#L44-L78)

### Executing Plans (Parallel Session)

The executing-plans workflow does not use continuous two-stage review. Instead, it executes tasks in batches with human review checkpoints between batches.

**Sources:** [skills/subagent-driven-development/SKILL.md32-37](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L32-L37)

### Final Cross-Task Review

After all tasks complete in subagent-driven-development, a final code reviewer subagent reviews the entire implementation for cross-task consistency:

```
[After all tasks]
[Dispatch final code-reviewer]
Final reviewer: All requirements met, ready to merge
```

This catches issues that span multiple tasks that individual task reviews might miss.

**Sources:** [skills/subagent-driven-development/SKILL.md61-162](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L61-L162)

## Red Flags

### Never Do

| Red Flag                                  | Why It's Wrong                               | Correct Approach                          |
| ----------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| **Skip spec compliance review**           | Can't verify if implementation is correct    | Always run spec review first              |
| **Skip code quality review**              | Can't verify if implementation is well-built | Always run quality review after spec ✅    |
| **Start quality review before spec ✅**    | Wastes time reviewing wrong implementation   | Sequential: spec first, then quality      |
| **Proceed with unfixed issues**           | Compounds problems in later tasks            | Loop until reviewer approves              |
| **Skip review loops**                     | Reviewer found issues = not done             | Implementer fixes, reviewer re-reviews    |
| **Accept "close enough" on spec**         | Spec reviewer found issues = not done        | Fix all spec issues before quality review |
| **Move to next task with open issues**    | Either review has issues = task incomplete   | Both reviews must reach ✅                 |
| **Let self-review replace formal review** | Self-review catches obvious issues only      | Both are needed: self + formal            |
| **Trust implementer's report**            | Report may be incomplete or optimistic       | Spec reviewer reads actual code           |

**Sources:** [skills/subagent-driven-development/SKILL.md201-223](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L201-L223) [RELEASE-NOTES.md55-65](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L55-L65)

### Review-Specific Red Flags

**Spec compliance:**

- Trusting implementer's word instead of reading code
- Accepting interpretations that deviate from requirements
- Ignoring extra features not requested

**Code quality:**

- Reviewing code quality before spec compliance passes
- Only noting what's wrong without acknowledging what's right
- Blocking on minor style issues (use Critical/Important/Minor categorization)

**Sources:** [skills/subagent-driven-development/spec-reviewer-prompt.md21-36](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/spec-reviewer-prompt.md#L21-L36) [agents/code-reviewer.md35-46](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L35-L46)

## Cost Considerations

The two-stage review system increases subagent invocations:

| Component               | Subagent Invocations                   |
| ----------------------- | -------------------------------------- |
| Implementation          | 1 per task                             |
| Spec compliance review  | 1+ per task (includes re-review loops) |
| Code quality review     | 1+ per task (includes re-review loops) |
| Final cross-task review | 1 per complete implementation          |

**Total per task:** Minimum 3 subagents (implementer + spec reviewer + quality reviewer), more if review loops find issues.

**Trade-off:** More upfront cost but catches issues early, which is cheaper than debugging later or shipping wrong implementations.

**Sources:** [skills/subagent-driven-development/SKILL.md193-197](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md#L193-L197) [RELEASE-NOTES.md55-74](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L55-L74)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Code Review Process](#code-review-process.md)
- [Overview: Two-Stage Review System](#overview-two-stage-review-system.md)
- [When Reviews Occur](#when-reviews-occur.md)
- [Stage 1: Spec Compliance Review](#stage-1-spec-compliance-review.md)
- [What Spec Compliance Reviews Check](#what-spec-compliance-reviews-check.md)
- [The Skeptical Reviewer Pattern](#the-skeptical-reviewer-pattern.md)
- [Spec Reviewer Dispatch](#spec-reviewer-dispatch.md)
- [Spec Compliance Outcomes](#spec-compliance-outcomes.md)
- [Stage 2: Code Quality Review](#stage-2-code-quality-review.md)
- [What Code Quality Reviews Check](#what-code-quality-reviews-check.md)
- [Code Quality Reviewer Dispatch](#code-quality-reviewer-dispatch.md)
- [Code Quality Outcomes](#code-quality-outcomes.md)
- [Review Loop Mechanism](#review-loop-mechanism.md)
- [Review Loop Flow](#review-loop-flow.md)
- [Loop Characteristics](#loop-characteristics.md)
- [The code-reviewer Agent](#the-code-reviewer-agent.md)
- [Agent Configuration](#agent-configuration.md)
- [Review Process](#review-process.md)
- [Output Structure](#output-structure.md)
- [Integration with Development Workflows](#integration-with-development-workflows.md)
- [Subagent-Driven Development](#subagent-driven-development.md)
- [Executing Plans (Parallel Session)](#executing-plans-parallel-session.md)
- [Final Cross-Task Review](#final-cross-task-review.md)
- [Red Flags](#red-flags.md)
- [Never Do](#never-do.md)
- [Review-Specific Red Flags](#review-specific-red-flags.md)
- [Cost Considerations](#cost-considerations.md)
