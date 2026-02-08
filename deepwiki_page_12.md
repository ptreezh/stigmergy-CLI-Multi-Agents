# /obra/superpowers/3.2-the-rule:-mandatory-first-response-protocol

The Rule: Mandatory First Response Protocol | obra/superpowers | DeepWiki

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

# Mandatory First Response Protocol

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [skills/using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md)

## Purpose and Scope

This page documents the MANDATORY FIRST RESPONSE PROTOCOL defined in the `using-superpowers` skill. This protocol is a 5-step checklist that agents must complete before responding to any user message. The protocol serves as the enforcement mechanism for the entire Superpowers workflow system, preventing agents from bypassing skill-based workflows through rationalization.

This page focuses specifically on the protocol itself, its anti-rationalization mechanisms, and why responding without completing the checklist constitutes automatic failure. For information about discovering and invoking skills, see [Finding and Invoking Skills](obra/superpowers/5.2-opencode:-plugin-and-custom-tools.md). For the complete `using-superpowers` skill reference, see [using-superpowers](obra/superpowers/7.1-using-superpowers-\(meta-skill\).md). For how this protocol is injected into agent context, see [Session Lifecycle and Bootstrap](#3.4.md).

**Sources:** [skills/using-superpowers/SKILL.md1-102](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L1-L102)

## The 5-Step Checklist

The protocol requires agents to complete the following checklist before responding to ANY user message:

| Step | Action                  | Description                                                                                                                       |
| ---- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1    | ☐ List available skills | Mentally enumerate all skills available in the current context                                                                    |
| 2    | ☐ Check for matches     | Ask: "Does ANY skill match this request?"                                                                                         |
| 3    | ☐ Read the skill        | If yes, use the Skill tool (Claude Code), `use_skill` tool (OpenCode), or `use-skill` command (Codex) to read the full skill file |
| 4    | ☐ Announce usage        | Explicitly state which skill you're using and what you're doing with it                                                           |
| 5    | ☐ Follow exactly        | Execute the skill's instructions precisely as written                                                                             |

**Critical requirement:** Responding without completing this checklist equals automatic failure.

```
```

**Title:** Mandatory First Response Protocol Decision Flow

The protocol is enforced through bootstrap content injected at session start. The `using-superpowers` skill is automatically loaded into agent context with explicit `<EXTREMELY-IMPORTANT>` tags emphasizing the mandatory nature of the protocol.

**Sources:** [skills/using-superpowers/SKILL.md16-26](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L16-L26) [skills/using-superpowers/SKILL.md6-12](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L6-L12)

## Critical Rules and Requirements

### Mandatory Workflow Following

The protocol enforces two critical rules:

1. **Follow mandatory workflows:** Always check for relevant skills before ANY task. Brainstorming before coding is non-negotiable.
2. **Execute skills with the Skill tool:** Don't work from memory—run the current version of the skill.

### Skill Tool Equivalents Across Platforms

| Platform    | Tool/Command            | Syntax                                     |
| ----------- | ----------------------- | ------------------------------------------ |
| Claude Code | Skill tool              | `<invoke_skill>` with skill name parameter |
| OpenCode    | `use_skill` custom tool | Invoked via tool call in conversation      |
| Codex       | `use-skill` command     | `superpowers-codex use-skill <skill-name>` |

All platforms resolve skills using the same three-tier priority system (project > personal > superpowers), documented in [Skills Resolution and Priority System](obra/superpowers/3.3-finding-and-invoking-skills.md).

**Sources:** [skills/using-superpowers/SKILL.md28-32](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L28-L32)

## Anti-Rationalization Mechanisms

The `using-superpowers` skill explicitly lists eight common rationalizations that agents use to avoid checking for or using skills. If an agent catches itself thinking any of these thoughts, it must STOP and check for skills:

| Rationalization                     | Why It's Wrong                                               |
| ----------------------------------- | ------------------------------------------------------------ |
| "This is just a simple question"    | Questions are tasks. Check for skills.                       |
| "I can check git/files quickly"     | Files don't have conversation context. Check for skills.     |
| "Let me gather information first"   | Skills tell you HOW to gather information. Check for skills. |
| "This doesn't need a formal skill"  | If a skill exists for it, use it.                            |
| "I remember this skill"             | Skills evolve. Run the current version.                      |
| "This doesn't count as a task"      | If you're taking action, it's a task. Check for skills.      |
| "The skill is overkill for this"    | Skills exist because simple things become complex. Use it.   |
| "I'll just do this one thing first" | Check for skills BEFORE doing anything.                      |

```
```

**Title:** Agent Decision Path with Rationalization Detection

### Why Rationalizations Are Dangerous

The anti-rationalization section exists because skills document proven techniques that save time and prevent mistakes. Not using available skills means:

- Repeating already-solved problems
- Making known errors
- Skipping quality gates that prevent bugs

**If a skill for your task exists, you must use it or you will fail at your task.**

**Sources:** [skills/using-superpowers/SKILL.md34-49](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L34-L49)

## TodoWrite Requirements for Checklist Skills

When a skill contains a checklist, agents MUST create `TodoWrite` todos for EACH item. This is enforced as a separate rule within the protocol.

### Required Behavior

| Action                                        | Required |
| --------------------------------------------- | -------- |
| Create TodoWrite todo for each checklist item | ✅ Yes    |
| Work through checklist mentally               | ❌ No     |
| Skip creating todos "to save time"            | ❌ No     |
| Batch multiple items into one todo            | ❌ No     |
| Mark complete without doing them              | ❌ No     |

### TodoWrite Tool Mapping

The `TodoWrite` tool has different names across platforms:

| Platform    | Tool Name       | Purpose                                             |
| ----------- | --------------- | --------------------------------------------------- |
| Claude Code | `@TodoWrite`    | Creates persistent checklist items in agent context |
| OpenCode    | `update_plan`   | Updates task plan with completion status            |
| Codex       | Manual tracking | Requires explicit task status updates               |

### Why TodoWrite Enforcement Exists

**Checklists without TodoWrite tracking = steps get skipped. Every time.**

The overhead of `TodoWrite` is tiny compared to the cost of missing steps. This requirement prevents the common failure mode where agents mentally track checklist progress but forget items under cognitive load.

**Sources:** [skills/using-superpowers/SKILL.md51-61](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L51-L61)

## Announcing Skill Usage

Before using a skill, agents must announce that they are using it with the following format:

```
"I'm using [Skill Name] to [what you're doing]."
```

### Examples

| Announcement                                                             | Context                     |
| ------------------------------------------------------------------------ | --------------------------- |
| "I'm using the brainstorming skill to refine your idea into a design."   | Starting design exploration |
| "I'm using the test-driven-development skill to implement this feature." | Beginning TDD workflow      |
| "I'm using the systematic-debugging skill to diagnose this issue."       | Starting debugging process  |

### Purpose of Announcements

Transparency helps the human partner:

- Understand the agent's process
- Catch errors early
- Confirm the agent actually read the skill (not working from memory)

**Sources:** [skills/using-superpowers/SKILL.md63-72](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L63-L72)

## Bootstrap Injection Mechanism

The MANDATORY FIRST RESPONSE PROTOCOL is enforced through bootstrap content injection at session start. Each platform implements this differently but achieves the same goal: making the protocol part of the agent's operating context.

```
```

**Title:** Bootstrap Injection Mechanism Across Platforms

### Code References

| Platform    | Bootstrap Implementation                                                                                                                         | Protocol Source                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code | [hooks/session-start.sh](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh)                                               | Reads [skills/using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md) directly |
| OpenCode    | [.opencode/plugin/superpowers.js](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js) via `getBootstrapContent()` | Loads via `resolveSkillPath()` from [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js)          |
| Codex       | [.codex/superpowers-codex](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex) via `bootstrap` command                   | Loads via `resolveSkillPath()` from [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js)          |

All platforms inject the exact same protocol text from [skills/using-superpowers/SKILL.md16-26](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L16-L26) ensuring consistent behavior across environments.

**Sources:** [skills/using-superpowers/SKILL.md1-102](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L1-L102)

## Skill Types: Rigid vs Flexible

The protocol distinguishes between two types of skills, and this distinction affects how strictly the agent must follow the skill's instructions:

### Rigid Skills

**Must be followed exactly. No adaptation.**

Skills containing:

- Test-Driven Development (RED-GREEN-REFACTOR cycle)
- Debugging workflows (systematic steps)
- Verification procedures (quality gates)

These skills contain proven discipline that prevents common errors. Adapting them away defeats their purpose.

### Flexible Skills

**Core principles adapted to context.**

Skills containing:

- Architecture patterns
- Naming conventions
- Design approaches

These skills provide frameworks that should be adapted to specific situations while preserving core principles.

### How to Determine Skill Type

**The skill itself tells you which type it is.** Each skill document includes guidance on whether it requires exact following or contextual adaptation.

| Skill Type | Example Skills                                                       | Following Behavior            |
| ---------- | -------------------------------------------------------------------- | ----------------------------- |
| Rigid      | `test-driven-development`, `systematic-debugging`, `executing-plans` | Follow steps exactly in order |
| Flexible   | `brainstorming`, `writing-skills`                                    | Adapt principles to context   |

**Sources:** [skills/using-superpowers/SKILL.md74-80](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L74-L80)

## Instructions vs Workflows

A critical clarification: the human partner's specific instructions describe **WHAT** to do, not **HOW** to do it.

### Common Misunderstanding

| Human Says       | Agent Misinterprets As        | Actually Means                                                    |
| ---------------- | ----------------------------- | ----------------------------------------------------------------- |
| "Add X"          | Skip brainstorming, just code | Goal: Add X Method: Use brainstorming skill first                 |
| "Fix Y"          | Skip TDD, just fix it         | Goal: Fix Y Method: Use TDD skill for fix                         |
| "This is simple" | Workflow is overkill          | Goal: Simple feature Method: Simple features still need workflows |

### Red Flags Indicating Workflow Skip

If the agent catches itself thinking:

- "Instruction was specific"
- "Seems simple"
- "Workflow is overkill"

These are rationalizations. The protocol requires checking for and using skills regardless of instruction specificity.

### Why Specific Instructions Matter Most

**Specific instructions mean clear requirements, which is when workflows matter MOST.**

Skipping process on "simple" tasks is how simple tasks become complex problems. The protocol exists specifically to prevent this failure mode.

**Sources:** [skills/using-superpowers/SKILL.md82-90](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L82-L90)

## Protocol Enforcement Summary

```
```

**Title:** Complete Protocol Enforcement Flow

### The Core Rule

**Finding a relevant skill = mandatory to read and use it. Not optional.**

If a skill for your task exists, you must use it or you will fail at your task. The MANDATORY FIRST RESPONSE PROTOCOL is the enforcement mechanism that prevents rationalization-based bypasses of this rule.

**Sources:** [skills/using-superpowers/SKILL.md92-102](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L92-L102)

## Why This Protocol Exists

The protocol exists to solve a specific problem: agents naturally rationalize their way out of following structured workflows when those workflows feel like "unnecessary overhead."

### The Problem Without the Protocol

Without enforcement:

1. Agent sees a "simple" task
2. Agent thinks: "This doesn't need a formal skill"
3. Agent implements directly without checking
4. Agent misses edge cases documented in the skill
5. Simple task becomes complex problem
6. Time spent debugging exceeds time saved skipping skill

### The Solution: Mandatory Checking

The protocol makes skill checking non-negotiable by:

1. **Requiring checklist completion before ANY response** - No bypassing
2. **Listing common rationalizations explicitly** - Makes rationalization visible
3. **Stating consequences directly** - "Automatic failure" removes ambiguity
4. **Emphasizing with EXTREMELY-IMPORTANT tags** - Conveys severity

### Cost-Benefit Analysis

| Overhead                  | Cost                           |
| ------------------------- | ------------------------------ |
| Complete 5-step checklist | \~5 seconds per message        |
| Read skill if applicable  | \~30 seconds per task          |
| Create TodoWrite todos    | \~2 seconds per checklist item |

| Avoided Costs                     | Savings                |
| --------------------------------- | ---------------------- |
| Debugging missing edge cases      | Hours per bug          |
| Rework from skipped quality gates | Hours per review cycle |
| Re-implementing solved problems   | Hours per reinvention  |

The protocol's overhead is measured in seconds. The costs it prevents are measured in hours.

**Sources:** [skills/using-superpowers/SKILL.md34-49](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L34-L49)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Mandatory First Response Protocol](#mandatory-first-response-protocol.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [The 5-Step Checklist](#the-5-step-checklist.md)
- [Critical Rules and Requirements](#critical-rules-and-requirements.md)
- [Mandatory Workflow Following](#mandatory-workflow-following.md)
- [Skill Tool Equivalents Across Platforms](#skill-tool-equivalents-across-platforms.md)
- [Anti-Rationalization Mechanisms](#anti-rationalization-mechanisms.md)
- [Why Rationalizations Are Dangerous](#why-rationalizations-are-dangerous.md)
- [TodoWrite Requirements for Checklist Skills](#todowrite-requirements-for-checklist-skills.md)
- [Required Behavior](#required-behavior.md)
- [TodoWrite Tool Mapping](#todowrite-tool-mapping.md)
- [Why TodoWrite Enforcement Exists](#why-todowrite-enforcement-exists.md)
- [Announcing Skill Usage](#announcing-skill-usage.md)
- [Examples](#examples.md)
- [Purpose of Announcements](#purpose-of-announcements.md)
- [Bootstrap Injection Mechanism](#bootstrap-injection-mechanism.md)
- [Code References](#code-references.md)
- [Skill Types: Rigid vs Flexible](#skill-types-rigid-vs-flexible.md)
- [Rigid Skills](#rigid-skills.md)
- [Flexible Skills](#flexible-skills.md)
- [How to Determine Skill Type](#how-to-determine-skill-type.md)
- [Instructions vs Workflows](#instructions-vs-workflows.md)
- [Common Misunderstanding](#common-misunderstanding.md)
- [Red Flags Indicating Workflow Skip](#red-flags-indicating-workflow-skip.md)
- [Why Specific Instructions Matter Most](#why-specific-instructions-matter-most.md)
- [Protocol Enforcement Summary](#protocol-enforcement-summary.md)
- [The Core Rule](#the-core-rule.md)
- [Why This Protocol Exists](#why-this-protocol-exists.md)
- [The Problem Without the Protocol](#the-problem-without-the-protocol.md)
- [The Solution: Mandatory Checking](#the-solution-mandatory-checking.md)
- [Cost-Benefit Analysis](#cost-benefit-analysis.md)
