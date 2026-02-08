# /obra/superpowers/6-development-workflows

Development Workflows | obra/superpowers | DeepWiki

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

# Development Workflows

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [README.md](https://github.com/obra/superpowers/blob/a01a135f/README.md)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md)
- [skills/writing-skills/testing-skills-with-subagents.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md)

## Purpose and Scope

This page documents the end-to-end development workflows that superpowers enforces for feature development. The workflow is a mandatory sequential pipeline from design through implementation to completion, orchestrated by the `using-superpowers` meta-skill.

**For detailed information on specific phases:**

- Design and specification: see [Brainstorming and Design](obra/superpowers/6.1-brainstorming-and-design.md)
- Workspace isolation: see [Using Git Worktrees](obra/superpowers/6.2-using-git-worktrees.md)
- Task planning: see [Writing Implementation Plans](obra/superpowers/6.3-writing-implementation-plans.md)
- Same-session implementation: see [Subagent-Driven Development](obra/superpowers/6.4-subagent-driven-development.md)
- Parallel-session implementation: see [Executing Plans](obra/superpowers/6.5-executing-plans-in-batches.md)
- Quality gates: see [Code Review Process](obra/superpowers/6.6-code-review-process.md)
- Completion and cleanup: see [Finishing Development Branches](obra/superpowers/6.7-finishing-development-branches.md)

**For workflow enforcement mechanics:** see [Mandatory First Response Protocol](obra/superpowers/3.2-the-rule:-mandatory-first-response-protocol.md) and [using-superpowers (Meta-Skill)](obra/superpowers/7.1-using-superpowers-\(meta-skill\).md)

---

## The Sequential Workflow Pipeline

The superpowers workflow enforces a strict sequence of phases, each handled by specific skills. The `using-superpowers` meta-skill ensures agents check for and invoke these skills before taking any action.

**Workflow Phases with Mandatory Skills**

```
```

**Sources:** [README.md80-96](https://github.com/obra/superpowers/blob/a01a135f/README.md#L80-L96) [skills/using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md)

---

## Workflow Entry Points and Mandatory Phases

The workflow has different entry points depending on the type of work. The `using-superpowers` meta-skill determines which phases are mandatory.

| Work Type                            | Entry Point             | Mandatory Phases                  | Can Skip                 |
| ------------------------------------ | ----------------------- | --------------------------------- | ------------------------ |
| **New feature**                      | Phase 1 (brainstorming) | All phases                        | None                     |
| **Feature modification**             | Phase 1 (brainstorming) | All phases                        | None                     |
| **Bug fix with design implications** | Phase 1 (brainstorming) | All phases                        | None                     |
| **Simple bug fix**                   | Phase 3 (writing-plans) | Planning → Execution → Completion | Brainstorming, Worktrees |
| **Refactoring existing code**        | Phase 3 (writing-plans) | Planning → Execution → Completion | Brainstorming, Worktrees |
| **Documentation changes**            | None                    | TDD may apply                     | Most workflow phases     |

**Creative Work Detection:**

The `using-superpowers` meta-skill classifies work as "creative" if it involves:

- Building new functionality
- Adding new features
- Designing new systems
- Making architectural changes

For creative work, `brainstorming` is **mandatory** and must complete before any implementation. Attempting to skip it triggers red flag detection.

**Sources:** [README.md80-86](https://github.com/obra/superpowers/blob/a01a135f/README.md#L80-L86) [skills/using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md) [skills/brainstorming/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md)

---

## Workflow Enforcement Mechanism

```
```

**Sources:** [skills/using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md) [README.md96](https://github.com/obra/superpowers/blob/a01a135f/README.md#L96-L96)

---

## Two Execution Modes: Same-Session vs Parallel-Session

After planning completes, there are two execution modes with different trade-offs.

### Same-Session: subagent-driven-development

**When to Use:**

- Continuous iteration without context switching
- Want automated two-stage review process
- Can dedicate full session to implementation
- Plan has 5-15 tasks (\~2-5 minutes each)

**Process:**

```
```

**Sources:** [skills/subagent-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md) [README.md88](https://github.com/obra/superpowers/blob/a01a135f/README.md#L88-L88) [README.md118](https://github.com/obra/superpowers/blob/a01a135f/README.md#L118-L118)

### Parallel-Session: executing-plans

**When to Use:**

- Need to context-switch between tasks
- Want manual review checkpoints
- Large plan (20+ tasks)
- Multiple contributors working in parallel

**Process:**

```
```

**Sources:** [skills/executing-plans/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md) [README.md88](https://github.com/obra/superpowers/blob/a01a135f/README.md#L88-L88) [README.md112](https://github.com/obra/superpowers/blob/a01a135f/README.md#L112-L112)

### Comparison Table

| Aspect                   | subagent-driven-development  | executing-plans                 |
| ------------------------ | ---------------------------- | ------------------------------- |
| **Session continuity**   | Single session               | Multiple sessions               |
| **Review frequency**     | Every task (automated)       | Every batch (\~3 tasks, manual) |
| **Context preservation** | Full plan context maintained | Must re-read plan each session  |
| **Human involvement**    | Minimal (watch progress)     | Active (review each batch)      |
| **Best for**             | 5-15 tasks, continuous work  | 20+ tasks, interrupted work     |
| **Review type**          | Two-stage: spec + quality    | Single-stage: human review      |
| **Task marking**         | `TodoWrite` tool             | Manual `[x]` in plan            |

**Sources:** [skills/subagent-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md) [skills/executing-plans/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md)

---

## Workflow Artifacts and State Management

Each phase creates specific artifacts that subsequent phases consume.

### Artifacts Created by Phase

```
```

### Artifact Locations

| Artifact                  | Path                                | Created By                                                            | Used By                                          |
| ------------------------- | ----------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------ |
| **Design document**       | `docs/plans/design.md`              | `brainstorming`                                                       | `using-git-worktrees`, `writing-plans`           |
| **Implementation plan**   | `docs/plans/implementation-plan.md` | `writing-plans`                                                       | `subagent-driven-development`, `executing-plans` |
| **Worktree**              | `features/<branch-name>/`           | `using-git-worktrees`                                                 | All execution phases                             |
| **Task completion marks** | In `implementation-plan.md`         | `subagent-driven-development` (TodoWrite), `executing-plans` (manual) | Progress tracking                                |

**Sources:** [skills/brainstorming/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md) [skills/using-git-worktrees/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-git-worktrees/SKILL.md) [skills/writing-plans/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md)

---

## Workflow State Transitions

The workflow maintains state through file artifacts and task completion tracking.

**State Diagram: Development Branch Lifecycle**

```
```

**Sources:** [skills/brainstorming/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md) [skills/subagent-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md) [skills/executing-plans/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md) [skills/finishing-a-development-branch/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md)

---

## Error Handling and Recovery

The workflow includes multiple safety gates and recovery mechanisms.

### Review Loop: Spec Compliance

In `subagent-driven-development`, the first review stage catches implementation mismatches:

**Review Questions:**

1. Does the code match the task specification exactly?
2. Did it implement anything NOT in the spec?
3. Did it skip anything IN the spec?
4. Does the test verify the requirement?

**On Issues:**

- Implementer subagent receives issues list
- Must fix before quality review
- Re-submit for spec compliance review
- Loop continues until spec-compliant

**Sources:** [skills/subagent-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md) [skills/requesting-code-review/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/requesting-code-review/SKILL.md)

### Review Loop: Code Quality

After spec compliance, the second review stage ensures code quality:

**Review Questions:**

1. Is the code well-tested?
2. Is it maintainable?
3. Does it follow project conventions?
4. Are there obvious bugs?

**On Issues:**

- Implementer receives quality issues
- Must fix before task completion
- Re-submit for quality review
- Loop continues until quality approved

**Sources:** [skills/subagent-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md) [skills/requesting-code-review/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/requesting-code-review/SKILL.md)

### Test Gate: Completion

The `finishing-a-development-branch` skill enforces a test gate before any completion option:

```
```

**No option to skip tests.** The test gate is mandatory.

**Sources:** [skills/finishing-a-development-branch/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md)

---

## Red Flags and Workflow Bypass Prevention

The `using-superpowers` meta-skill detects common rationalization patterns that indicate workflow bypass attempts.

### Red Flag Categories

| Red Flag Pattern                     | What It Indicates             | Mandatory Response                    |
| ------------------------------------ | ----------------------------- | ------------------------------------- |
| **"I know what X means"**            | Skipping skill read           | Invoke skill, follow exactly          |
| **"Just try changing..."**           | Skipping systematic debugging | Invoke `systematic-debugging`         |
| **"Skip formalities"**               | Skipping brainstorming        | Invoke `brainstorming`                |
| **"Quick fix for now"**              | Skipping TDD                  | Invoke `test-driven-development`      |
| **"Tests after achieve same goals"** | Violating TDD order           | Delete code, restart with tests first |
| **"Keep as reference"**              | Bypassing TDD deletion rule   | Delete means delete, no reference     |
| **"Following spirit not letter"**    | Rationalizing rule violation  | Spirit IS letter, both required       |

**Enforcement:**

When red flags detected:

1. Agent MUST stop current action
2. Agent MUST invoke the relevant skill
3. Agent MUST follow the skill exactly
4. No exceptions, no "adapting the concept"

**Sources:** [skills/using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md) [skills/test-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md) [skills/writing-skills/testing-skills-with-subagents.md210-220](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L210-L220)

---

## Workflow Integration with Test-Driven Development

The `test-driven-development` skill integrates with all execution phases, enforcing RED-GREEN-REFACTOR for every code change.

### TDD Integration Points

```
```

**Iron Law:** No code without a failing test first. Code written before tests MUST be deleted.

**Sources:** [skills/test-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/test-driven-development/SKILL.md) [README.md90](https://github.com/obra/superpowers/blob/a01a135f/README.md#L90-L90) [README.md103](https://github.com/obra/superpowers/blob/a01a135f/README.md#L103-L103)

---

## Common Workflow Patterns

### Pattern 1: Feature Development (Full Pipeline)

**Trigger:** User requests new functionality

**Path:** Brainstorming → Worktrees → Planning → Subagent-Driven-Dev → Finishing

**Example:**

```
User: "Build a payment processing system"
→ brainstorming: Design payment flow, select Stripe API
→ using-git-worktrees: Create features/payment-system/ worktree
→ writing-plans: Break into 12 tasks (2-5 min each)
→ subagent-driven-development: Execute all tasks with reviews
→ finishing-a-development-branch: Tests pass, create PR
```

**Sources:** [README.md80-96](https://github.com/obra/superpowers/blob/a01a135f/README.md#L80-L96)

### Pattern 2: Bug Fix with Unknown Root Cause

**Trigger:** Bug with unclear cause

**Path:** Systematic-Debugging → Planning → Execution → Finishing

**Example:**

```
User: "Auth sometimes fails intermittently"
→ systematic-debugging: Root cause analysis (race condition)
→ writing-plans: 3 tasks (add mutex, test race, verify fix)
→ executing-plans: Execute with manual checkpoints
→ finishing-a-development-branch: Merge to main
```

**Sources:** [skills/systematic-debugging/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/systematic-debugging/SKILL.md) [README.md106](https://github.com/obra/superpowers/blob/a01a135f/README.md#L106-L106)

### Pattern 3: Refactoring Existing Code

**Trigger:** Code needs restructuring

**Path:** Planning → Execution → Finishing (may skip worktrees)

**Example:**

```
User: "Refactor 300-line function into smaller pieces"
→ writing-plans: 5 tasks (extract methods, add tests, verify)
→ subagent-driven-development: Execute with TDD
→ finishing-a-development-branch: Tests pass, merge
```

**Sources:** [skills/writing-plans/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-plans/SKILL.md)

---

## Workflow Metrics and Monitoring

During execution, the workflow tracks progress through task completion markers.

### Task Completion Tracking

**In subagent-driven-development:**

- Uses `TodoWrite` tool to mark tasks: `[ ]` → `[x]`
- Automatic tracking after quality review approval
- No manual intervention required

**In executing-plans:**

- Manual marking: Edit `implementation-plan.md`
- Change `- [ ] Task` to `- [x] Task`
- Human verifies before marking

### Progress Visibility

```
```

**Sources:** [skills/subagent-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md) [skills/executing-plans/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md)

---

## Workflow Customization and Extensions

While the core workflow is mandatory, projects can add custom skills that integrate into the pipeline.

### Project-Specific Skills

Skills resolution follows this priority: project > personal > superpowers

**Example: Adding project-specific validation**

Create `project/skills/validate-api-contract/SKILL.md`:

```
```

This skill automatically integrates into the workflow through skill priority resolution.

**Sources:** [skills/using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md)

---

## Summary

The superpowers development workflow is a **mandatory sequential pipeline** enforced by the `using-superpowers` meta-skill:

1. **Design** (`brainstorming`) - Mandatory for creative work
2. **Isolation** (`using-git-worktrees`) - Optional for small changes
3. **Planning** (`writing-plans`) - Always required
4. **Execution** (`subagent-driven-development` OR `executing-plans`) - Choose mode
5. **Completion** (`finishing-a-development-branch`) - Test gate + options

**Key Enforcement Mechanisms:**

- Bootstrap injection loads `using-superpowers` at session start
- Mandatory skill checking before any response or action
- Red flag detection prevents rationalization and bypass
- Process skills (brainstorming, debugging) always precede implementation skills
- Test-driven development enforced during all code changes

**For details on specific phases, see the child pages (#6.1 through #6.7).**

**Sources:** [README.md1-160](https://github.com/obra/superpowers/blob/a01a135f/README.md#L1-L160) [skills/using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md) [skills/brainstorming/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/brainstorming/SKILL.md) [skills/subagent-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/subagent-driven-development/SKILL.md) [skills/executing-plans/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/executing-plans/SKILL.md) [skills/finishing-a-development-branch/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/finishing-a-development-branch/SKILL.md)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Development Workflows](#development-workflows.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [The Sequential Workflow Pipeline](#the-sequential-workflow-pipeline.md)
- [Workflow Entry Points and Mandatory Phases](#workflow-entry-points-and-mandatory-phases.md)
- [Workflow Enforcement Mechanism](#workflow-enforcement-mechanism.md)
- [Two Execution Modes: Same-Session vs Parallel-Session](#two-execution-modes-same-session-vs-parallel-session.md)
- [Same-Session: subagent-driven-development](#same-session-subagent-driven-development.md)
- [Parallel-Session: executing-plans](#parallel-session-executing-plans.md)
- [Comparison Table](#comparison-table.md)
- [Workflow Artifacts and State Management](#workflow-artifacts-and-state-management.md)
- [Artifacts Created by Phase](#artifacts-created-by-phase.md)
- [Artifact Locations](#artifact-locations.md)
- [Workflow State Transitions](#workflow-state-transitions.md)
- [Error Handling and Recovery](#error-handling-and-recovery.md)
- [Review Loop: Spec Compliance](#review-loop-spec-compliance.md)
- [Review Loop: Code Quality](#review-loop-code-quality.md)
- [Test Gate: Completion](#test-gate-completion.md)
- [Red Flags and Workflow Bypass Prevention](#red-flags-and-workflow-bypass-prevention.md)
- [Red Flag Categories](#red-flag-categories.md)
- [Workflow Integration with Test-Driven Development](#workflow-integration-with-test-driven-development.md)
- [TDD Integration Points](#tdd-integration-points.md)
- [Common Workflow Patterns](#common-workflow-patterns.md)
- [Pattern 1: Feature Development (Full Pipeline)](#pattern-1-feature-development-full-pipeline.md)
- [Pattern 2: Bug Fix with Unknown Root Cause](#pattern-2-bug-fix-with-unknown-root-cause.md)
- [Pattern 3: Refactoring Existing Code](#pattern-3-refactoring-existing-code.md)
- [Workflow Metrics and Monitoring](#workflow-metrics-and-monitoring.md)
- [Task Completion Tracking](#task-completion-tracking.md)
- [Progress Visibility](#progress-visibility.md)
- [Workflow Customization and Extensions](#workflow-customization-and-extensions.md)
- [Project-Specific Skills](#project-specific-skills.md)
- [Summary](#summary.md)
