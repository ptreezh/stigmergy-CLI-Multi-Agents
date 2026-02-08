# /obra/superpowers/6.5-executing-plans-in-batches

Executing Plans in Batches | obra/superpowers | DeepWiki

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

# Executing Plans in Batches

Relevant source files

- [README.md](https://github.com/obra/superpowers/blob/a01a135f/README.md)
- [skills/executing-plans/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md)
- [skills/systematic-debugging/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md)
- [skills/writing-plans/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md)
- [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md)
- [skills/writing-skills/testing-skills-with-subagents.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md)

## Purpose and Scope

This page documents the batch execution workflow provided by the `executing-plans` skill. Batch execution enables parallel session implementation where tasks are executed in groups (default: 3 tasks) with human review checkpoints between batches. This approach is appropriate when the architect wants to review progress incrementally rather than having continuous oversight.

For information about creating implementation plans, see [Writing Implementation Plans](obra/superpowers/6.3-writing-implementation-plans.md). For the alternative execution model with continuous oversight, see [Subagent-Driven Development](obra/superpowers/6.4-subagent-driven-development.md). For completion workflows after all tasks are done, see [Finishing Development Branches](obra/superpowers/6.7-finishing-development-branches.md).

**Sources:** [skills/executing-plans/SKILL.md1-77](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L1-L77) [README.md80-96](https://github.com/obra/superpowers/blob/a01a135f/README.md#L80-L96)

---

## Execution Model Comparison

The system offers two execution models that differ in session structure and review frequency:

| Aspect               | Batch Execution (executing-plans)       | Subagent-Driven Development         |
| -------------------- | --------------------------------------- | ----------------------------------- |
| **Session**          | Separate parallel session               | Same session as planning            |
| **Review Frequency** | Between batches (every 3 tasks)         | Between every task                  |
| **Task Context**     | Direct execution by main agent          | Fresh subagent per task             |
| **Overhead**         | Lower (fewer checkpoints)               | Higher (subagent dispatch + review) |
| **Autonomy**         | Higher (batch completion before review) | Lower (continuous oversight)        |
| **Appropriate When** | Plan is detailed and clear              | Plan needs iteration/refinement     |

**Choice Point:** After plan creation, the `writing-plans` skill offers both options explicitly [skills/writing-plans/SKILL.md99-117](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L99-L117)

**Sources:** [skills/executing-plans/SKILL.md1-77](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L1-L77) [skills/writing-plans/SKILL.md99-117](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L99-L117) [skills/subagent-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md)

---

## The Five-Step Process

```
```

**Process Breakdown:**

### Step 1: Load and Review Plan

The skill begins by loading the plan file from `docs/plans/YYYY-MM-DD-<feature-name>.md` [skills/writing-plans/SKILL.md18](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L18-L18) and performing a critical review [skills/executing-plans/SKILL.md18-23](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L18-L23):

1. **Read plan file** - Parse the complete implementation plan
2. **Review critically** - Identify questions or concerns about feasibility, clarity, or completeness
3. **Raise concerns if any** - Block execution and request clarification before starting
4. **Create TodoWrite if clear** - Proceed to batch execution

**Sources:** [skills/executing-plans/SKILL.md18-23](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L18-L23) [skills/writing-plans/SKILL.md18](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L18-L18)

### Step 2: Execute Batch

Default batch size is **3 tasks** [skills/executing-plans/SKILL.md25](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L25-L25) For each task in the batch:

1. **Mark task as `in_progress`** in TodoWrite
2. **Follow each step exactly** - Plans contain bite-sized steps (2-5 minutes each) [skills/writing-plans/SKILL.md20-28](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L20-L28)
3. **Run verifications as specified** - Execute exact commands with expected output [skills/writing-plans/SKILL.md66-80](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L66-L80)
4. **Mark task as `completed`** in TodoWrite

**Sources:** [skills/executing-plans/SKILL.md24-33](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L24-L33) [skills/writing-plans/SKILL.md20-28](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L20-L28) [skills/writing-plans/SKILL.md66-80](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L66-L80)

### Step 3: Report

When batch completes [skills/executing-plans/SKILL.md34-38](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L34-L38):

- **Show what was implemented** - Summary of changes made
- **Show verification output** - Actual command results
- **Say: "Ready for feedback."** - Explicit checkpoint signal

**Sources:** [skills/executing-plans/SKILL.md34-38](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L34-L38)

### Step 4: Continue

Based on human feedback [skills/executing-plans/SKILL.md39-44](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L39-L44):

- **Apply changes if needed** - Address feedback on current batch
- **Execute next batch** - Continue with next 3 tasks
- **Repeat** - Until all tasks complete

**Sources:** [skills/executing-plans/SKILL.md39-44](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L39-L44)

### Step 5: Complete Development

After all tasks complete, the skill mandates using `finishing-a-development-branch` [skills/executing-plans/SKILL.md45-51](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L45-L51):

1. **Announce**: "I'm using the finishing-a-development-branch skill to complete this work."
2. **REQUIRED SUB-SKILL**: Use `superpowers:finishing-a-development-branch`
3. **Follow completion workflow**: Verify tests, present four structured options (merge/PR/keep/discard), execute choice

**Sources:** [skills/executing-plans/SKILL.md45-51](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L45-L51) [README.md94](https://github.com/obra/superpowers/blob/a01a135f/README.md#L94-L94)

---

## Stopping Conditions and Error Handling

```
```

### When to Stop Execution

The skill defines explicit stopping conditions [skills/executing-plans/SKILL.md52-60](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L52-L60):

**STOP executing immediately when:**

| Condition                         | Description                                         | Action                 |
| --------------------------------- | --------------------------------------------------- | ---------------------- |
| **Blocker mid-batch**             | Missing dependency, test fails, instruction unclear | Stop and ask for help  |
| **Critical plan gaps**            | Gaps preventing starting implementation             | Request plan revision  |
| **Don't understand instruction**  | Unclear step in plan                                | Ask for clarification  |
| **Verification fails repeatedly** | Same verification failing multiple times            | Report failure pattern |

**Key principle:** "Ask for clarification rather than guessing." [skills/executing-plans/SKILL.md60](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L60-L60)

### When to Revisit Earlier Steps

The skill defines conditions for returning to earlier phases [skills/executing-plans/SKILL.md63-68](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L63-L68):

**Return to Review (Step 1) when:**

- Partner updates the plan based on feedback
- Fundamental approach needs rethinking

**Don't force through blockers** - Stop and ask [skills/executing-plans/SKILL.md68](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L68-L68)

**Sources:** [skills/executing-plans/SKILL.md52-68](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L52-L68)

---

## TodoWrite Integration

```
```

The `executing-plans` skill creates a TodoWrite instance after plan review [skills/executing-plans/SKILL.md23](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L23-L23) This integration provides:

- **Task tracking** - Visual progress through plan
- **Status updates** - `in_progress` → `completed` transitions [skills/executing-plans/SKILL.md28-33](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L28-L33)
- **Checkpoint synchronization** - Batch boundaries align with review points

**Sources:** [skills/executing-plans/SKILL.md18-33](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L18-L33)

---

## Integration with Workflow Skills

```
```

### Upstream Skills

**writing-plans** [skills/writing-plans/SKILL.md99-117](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L99-L117) provides the execution handoff:

```
```

### Downstream Skills

**finishing-a-development-branch** is **REQUIRED** after task completion [skills/executing-plans/SKILL.md45-51](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L45-L51):

```
```

**requesting-code-review** is **OPTIONAL** between batches [skills/executing-plans/SKILL.md34-44](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L34-L44) as checkpoints provide natural review opportunities.

**Sources:** [skills/executing-plans/SKILL.md1-77](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L1-L77) [skills/writing-plans/SKILL.md99-117](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L99-L117) [README.md80-96](https://github.com/obra/superpowers/blob/a01a135f/README.md#L80-L96)

---

## Platform-Specific Commands

### Claude Code Slash Command

The skill is exposed as `/superpowers:execute-plan` [README.md57](https://github.com/obra/superpowers/blob/a01a135f/README.md#L57-L57):

```
```

Verification that command is available [README.md48-58](https://github.com/obra/superpowers/blob/a01a135f/README.md#L48-L58):

```
```

### OpenCode Integration

The skill is available via `use_skill` tool in OpenCode:

```
```

### Codex Integration

The skill is available via `use-skill` command in Codex:

```
```

**Sources:** [README.md48-58](https://github.com/obra/superpowers/blob/a01a135f/README.md#L48-L58) [README.md27-78](https://github.com/obra/superpowers/blob/a01a135f/README.md#L27-L78)

---

## Skill Announcement Protocol

The skill mandates explicit announcement at start [skills/executing-plans/SKILL.md14](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L14-L14):

```
```

This announcement serves multiple purposes:

1. **Transparency** - Human knows which workflow is active
2. **Context setting** - Agent commits to batch execution model
3. **Checkpoint expectation** - Human expects review after batches, not continuous oversight

Similarly, when transitioning to completion [skills/executing-plans/SKILL.md48](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L48-L48):

```
```

**Sources:** [skills/executing-plans/SKILL.md14](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L14-L14) [skills/executing-plans/SKILL.md48](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L48-L48)

---

## Key Constraints and Guidelines

### Core Principles

From [skills/executing-plans/SKILL.md12](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L12-L12):

```
```

### Execution Rules

From [skills/executing-plans/SKILL.md70-77](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L70-L77):

| Rule                                      | Description                                   |
| ----------------------------------------- | --------------------------------------------- |
| **Review plan critically first**          | Identify concerns before starting             |
| **Follow plan steps exactly**             | Plans contain bite-sized steps - no deviation |
| **Don't skip verifications**              | Run all verification commands as specified    |
| **Reference skills when plan says to**    | Plans may invoke other skills (e.g., TDD)     |
| **Between batches: just report and wait** | No autonomous continuation                    |
| **Stop when blocked, don't guess**        | Ask for clarification rather than improvising |

### Plan Structure Assumptions

The skill assumes plans follow the structure defined in `writing-plans` [skills/writing-plans/SKILL.md20-28](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L20-L28):

- **Bite-sized granularity**: Each step is 2-5 minutes
- **Exact file paths**: `exact/path/to/file.py`
- **Complete code**: Not placeholders like "add validation"
- **Exact commands**: With expected output
- **Skill references**: Using `@` syntax for sub-skills

**Sources:** [skills/executing-plans/SKILL.md12](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L12-L12) [skills/executing-plans/SKILL.md70-77](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L70-L77) [skills/writing-plans/SKILL.md20-28](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L20-L28)

---

## Decision Criteria: When to Use Batch Execution

```
```

### Use Batch Execution When:

- **Plan is comprehensive and clear** - All steps are well-defined
- **Minimal iteration expected** - Plan unlikely to need significant revision
- **Periodic review is sufficient** - Don't need to see every task
- **Want parallel work** - Can work on other tasks while execution proceeds
- **Lower overhead preferred** - Fewer checkpoints = less interruption

### Use Subagent-Driven Development When:

- **Plan needs refinement** - Expect to adjust approach during execution
- **Want continuous oversight** - Review every task before next
- **Same session workflow** - Continue from planning to execution
- **Higher iteration expected** - Plan may reveal issues during execution
- **Two-stage review needed** - Benefit from spec compliance + code quality reviews per task

**Sources:** [skills/executing-plans/SKILL.md1-77](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L1-L77) [skills/writing-plans/SKILL.md99-117](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L99-L117) [README.md88](https://github.com/obra/superpowers/blob/a01a135f/README.md#L88-L88)

---

## Summary

The `executing-plans` skill provides a batch execution model with the following characteristics:

| Aspect                 | Implementation                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **File**               | `skills/executing-plans/SKILL.md`                                                      |
| **Process**            | 5-step: Load → Execute Batch → Report → Continue → Complete                            |
| **Default Batch Size** | 3 tasks                                                                                |
| **Review Frequency**   | Between batches (human checkpoints)                                                    |
| **Session Model**      | Separate parallel session from planning                                                |
| **Completion**         | Mandatory use of `finishing-a-development-branch`                                      |
| **Error Handling**     | Stop immediately on blockers, ask for clarification                                    |
| **Platform Commands**  | `/superpowers:execute-plan` (Claude Code), `use_skill` (OpenCode), `use-skill` (Codex) |

**Sources:** [skills/executing-plans/SKILL.md1-77](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md#L1-L77) [README.md48-58](https://github.com/obra/superpowers/blob/a01a135f/README.md#L48-L58) [skills/writing-plans/SKILL.md99-117](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md#L99-L117)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Executing Plans in Batches](#executing-plans-in-batches.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Execution Model Comparison](#execution-model-comparison.md)
- [The Five-Step Process](#the-five-step-process.md)
- [Step 1: Load and Review Plan](#step-1-load-and-review-plan.md)
- [Step 2: Execute Batch](#step-2-execute-batch.md)
- [Step 3: Report](#step-3-report.md)
- [Step 4: Continue](#step-4-continue.md)
- [Step 5: Complete Development](#step-5-complete-development.md)
- [Stopping Conditions and Error Handling](#stopping-conditions-and-error-handling.md)
- [When to Stop Execution](#when-to-stop-execution.md)
- [When to Revisit Earlier Steps](#when-to-revisit-earlier-steps.md)
- [TodoWrite Integration](#todowrite-integration.md)
- [Integration with Workflow Skills](#integration-with-workflow-skills.md)
- [Upstream Skills](#upstream-skills.md)
- [Downstream Skills](#downstream-skills.md)
- [Platform-Specific Commands](#platform-specific-commands.md)
- [Claude Code Slash Command](#claude-code-slash-command.md)
- [OpenCode Integration](#opencode-integration.md)
- [Codex Integration](#codex-integration.md)
- [Skill Announcement Protocol](#skill-announcement-protocol.md)
- [Key Constraints and Guidelines](#key-constraints-and-guidelines.md)
- [Core Principles](#core-principles.md)
- [Execution Rules](#execution-rules.md)
- [Plan Structure Assumptions](#plan-structure-assumptions.md)
- [Decision Criteria: When to Use Batch Execution](#decision-criteria-when-to-use-batch-execution.md)
- [Use Batch Execution When:](#use-batch-execution-when.md)
- [Use Subagent-Driven Development When:](#use-subagent-driven-development-when.md)
- [Summary](#summary.md)
