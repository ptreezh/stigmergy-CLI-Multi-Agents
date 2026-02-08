# /obra/superpowers/7.1-using-superpowers-(meta-skill)

using-superpowers (Meta-Skill) | obra/superpowers | DeepWiki

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

# using-superpowers

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [skills/using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md)

This document provides complete reference documentation for the `using-superpowers` skill, the foundational meta-skill that establishes mandatory workflows for all agent interactions with the Superpowers system. This skill defines the MANDATORY FIRST RESPONSE PROTOCOL, anti-rationalization mechanisms, TodoWrite requirements, and the distinction between rigid and flexible skills.

For information about how to find and invoke skills generally, see [5.2](obra/superpowers/5.2-opencode:-plugin-and-custom-tools.md). For broader workflow patterns that build on this skill, see [6](obra/superpowers/6-development-workflows.md). For how this skill gets injected into agent sessions during bootstrap, see [3.4](#3.4.md).

## Overview

The `using-superpowers` skill is automatically loaded during session bootstrap on all three platforms (Claude Code, OpenCode, Codex) and serves as the "operating manual" for agents working within the Superpowers system. It establishes non-negotiable behavioral requirements that transform a generic AI agent into one that follows structured, skill-based workflows.

**Key Responsibilities:**

- Enforce pre-response skill checking before any action
- Block common rationalization patterns that lead to skipping skills
- Mandate TodoWrite tracking for skills with checklists
- Require transparent announcement of skill usage
- Define skill rigidity spectrum (rigid rules vs flexible patterns)

The skill uses `<EXTREMELY-IMPORTANT>` tags and explicit failure language to ensure agents prioritize these rules over natural tendencies toward efficiency or shortcuts.

**Sources:** [skills/using-superpowers/SKILL.md1-102](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L1-L102)

## MANDATORY FIRST RESPONSE PROTOCOL

The core mechanism of the `using-superpowers` skill is a 5-step checklist that agents must complete before responding to any user message. This protocol prevents the common failure mode of agents taking action without considering whether existing skills apply.

### The Five-Step Checklist

```
```

**Protocol Enforcement:**

| Step | Action                          | Tool Required                                                      | Failure Consequence                            |
| ---- | ------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| 1    | List available skills mentally  | None                                                               | Automatic failure if skipped                   |
| 2    | Pattern match request to skills | None                                                               | Automatic failure if skipped                   |
| 3    | Read skill file with tool       | `Skill` tool (Claude), `use_skill` (OpenCode), `use-skill` (Codex) | Automatic failure if skill exists but not read |
| 4    | Announce skill usage            | None                                                               | Loss of transparency, early error detection    |
| 5    | Follow skill exactly            | None                                                               | Task failure from incorrect execution          |

The protocol explicitly states: "Responding WITHOUT completing this checklist = automatic failure." This language is intentionally absolute to override agent tendencies toward perceived efficiency.

**Sources:** [skills/using-superpowers/SKILL.md16-26](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L16-L26)

## Critical Rules

The skill defines two overarching rules that apply to all interactions:

### Rule 1: Follow Mandatory Workflows

Certain workflows are non-optional regardless of task complexity:

- **Brainstorming before coding** - All implementation work must be preceded by design
- **Skill checking before any task** - The MANDATORY FIRST RESPONSE PROTOCOL applies universally

This rule prevents agents from jumping directly to implementation, which leads to architectural mistakes and rework.

### Rule 2: Execute Skills with the Skill Tool

Skills must be read from their current source files using the appropriate tool for each platform:

| Platform    | Tool/Command            | Syntax                                      |
| ----------- | ----------------------- | ------------------------------------------- |
| Claude Code | `Skill` tool            | Appears as callable tool in agent interface |
| OpenCode    | `use_skill` custom tool | `use_skill(skill_name)`                     |
| Codex       | `use-skill` CLI command | `superpowers-codex use-skill <name>`        |

This requirement ensures agents always work with the latest skill version rather than relying on potentially stale memory or training data.

**Sources:** [skills/using-superpowers/SKILL.md28-32](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L28-L32)

## Anti-Rationalization Mechanisms

The skill includes a comprehensive list of rationalization patterns that indicate an agent is about to skip the MANDATORY FIRST RESPONSE PROTOCOL. This section functions as a "thought pattern detector" that helps agents catch themselves before making procedural errors.

### Rationalization Detection Flow

```
```

### Common Rationalization Patterns

| Rationalization                     | Why It's Wrong                                      | Correct Behavior                                                            |
| ----------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| "This is just a simple question"    | Questions are tasks requiring structured approaches | Check for skills, questions may need brainstorming or systematic approaches |
| "I can check git/files quickly"     | Files lack conversation context                     | Check for skills that provide context-aware workflows                       |
| "Let me gather information first"   | Skills define HOW to gather information             | Check for skills, they specify the gathering method                         |
| "This doesn't need a formal skill"  | If a skill exists for it, it does need it           | Check for skills, existence indicates proven value                          |
| "I remember this skill"             | Skills evolve and are updated                       | Always run the current version with Skill tool                              |
| "This doesn't count as a task"      | If you're taking action, it's a task                | Check for skills before any action                                          |
| "The skill is overkill for this"    | Skills exist because simple things become complex   | Use the skill, it prevents known complications                              |
| "I'll just do this one thing first" | "One thing" leads to workflow violation             | Check for skills BEFORE doing anything                                      |

The skill provides explicit rationale for each pattern: "Skills document proven techniques that save time and prevent mistakes. Not using available skills means repeating solved problems and making known errors."

**Sources:** [skills/using-superpowers/SKILL.md34-50](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L34-L50)

## TodoWrite Requirements

Skills that contain checklists require the agent to create TodoWrite todos for each checklist item. This requirement prevents the common failure mode of mental checklist tracking, which leads to skipped steps.

### TodoWrite Enforcement Logic

```
```

### Anti-Pattern Table

| Don't Do                           | Why It Fails                                             | Cost              |
| ---------------------------------- | -------------------------------------------------------- | ----------------- |
| Work through checklist mentally    | No external tracking, easy to forget items               | Steps get skipped |
| Skip creating todos "to save time" | Mental shortcuts don't scale to real-world interruptions | Steps get skipped |
| Batch multiple items into one todo | Loses granular tracking and verification                 | Steps get skipped |
| Mark complete without doing them   | Defeats the entire purpose of tracking                   | Steps get skipped |

The skill provides explicit reasoning: "The overhead of TodoWrite is tiny compared to the cost of missing steps."

**TodoWrite Platform Mapping:**

| Platform    | TodoWrite Tool | Native Equivalent              |
| ----------- | -------------- | ------------------------------ |
| Claude Code | `TodoWrite`    | Built-in Todo tool             |
| OpenCode    | `update_plan`  | Custom tool via superpowers.js |
| Codex       | `@mention`     | Agent mention creates todo     |

**Sources:** [skills/using-superpowers/SKILL.md51-62](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L51-L62)

## Announcing Skill Usage

Before using any skill, agents must explicitly announce which skill they are using and what they're doing with it. This transparency requirement serves multiple purposes: confirming the agent actually read the skill, helping the human partner understand the process, and enabling early error detection.

### Announcement Format

**Template:**

```
I'm using [Skill Name] to [what you're doing].
```

**Examples:**

- "I'm using the brainstorming skill to refine your idea into a design."
- "I'm using the test-driven-development skill to implement this feature."

### Announcement Flow

```
```

The announcement serves as a commitment point: once the agent publicly states they're using a skill, they've committed to following it exactly. This prevents silent abandonment of skill guidance mid-execution.

**Rationale:** "Transparency helps your human partner understand your process and catch errors early. It also confirms you actually read the skill."

**Sources:** [skills/using-superpowers/SKILL.md63-73](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L63-L73)

## Skill Types: Rigid vs Flexible

The `using-superpowers` skill defines two categories of skills that require different levels of adherence. Understanding this distinction is critical for correct skill execution.

### Classification Criteria

```
```

### Rigidity Indicators

| Skill Category | Identification Markers                                                                      | Adherence Level                             |
| -------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Rigid**      | Contains step-by-step protocols, checklists, mandatory sequences (e.g., RED-GREEN-REFACTOR) | Exact - no adaptation permitted             |
| **Flexible**   | Contains principles, patterns, heuristics without strict ordering                           | Adaptive - apply core principles to context |

**Key Rule:** "The skill itself tells you which type it is." Skills self-identify their rigidity level in their content. If a skill says "you MUST" or provides numbered steps, it's rigid. If it says "consider" or "adapt," it's flexible.

**Rigid Skill Example:** The test-driven-development skill mandates:

1. Write failing test
2. Watch it fail
3. Write minimal code
4. Watch it pass
5. Commit

This sequence cannot be reordered or abbreviated.

**Flexible Skill Example:** An architecture skill might suggest patterns (MVC, layering) but allow contextual adaptation based on project constraints.

**Sources:** [skills/using-superpowers/SKILL.md74-81](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L74-L81)

## Instructions vs Workflows

A critical clarification: specific user instructions describe WHAT to do, not HOW to do it. This distinction prevents agents from misinterpreting detailed requirements as permission to skip mandatory workflows.

### Instruction Interpretation Model

```
```

### Instruction Parsing Rules

| User Says                        | Agent Interprets As                   | Mandatory Workflows Still Apply                |
| -------------------------------- | ------------------------------------- | ---------------------------------------------- |
| "Add feature X"                  | Goal: Feature X exists                | ✓ Brainstorming, TDD, RED-GREEN-REFACTOR       |
| "Fix bug Y"                      | Goal: Bug Y resolved                  | ✓ Systematic debugging, TDD, verification      |
| "Implement this specific design" | Goal: Design implemented as specified | ✓ TDD, RED-GREEN-REFACTOR, code review         |
| "This is urgent"                 | Goal: Quick completion desired        | ✓ All workflows (urgency ≠ permission to skip) |

**Critical Insight:** "Specific instructions mean clear requirements, which is when workflows matter MOST. Skipping process on 'simple' tasks is how simple tasks become complex problems."

The skill explicitly blocks the rationalization pattern: instructions being "specific" or "simple" are not escape hatches from workflow discipline. In fact, clear specifications make disciplined workflows more valuable, not less.

**Sources:** [skills/using-superpowers/SKILL.md82-91](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L82-L91)

## Summary Workflow

The `using-superpowers` skill concludes with a simplified workflow summary that distills the core protocol into essential steps.

### Core Protocol Summary

```
```

### Quick Reference Checklist

**Starting any task:**

1. If relevant skill exists → Use the skill
2. Announce you're using it
3. Follow what it says

**Skill has checklist?** → TodoWrite for every item

**Finding a relevant skill = mandatory to read and use it. Not optional.**

This summary provides agents with a minimal viable protocol that captures the essence of the MANDATORY FIRST RESPONSE PROTOCOL without requiring rereading the entire skill.

**Sources:** [skills/using-superpowers/SKILL.md92-102](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L92-L102)

## Platform-Specific Tool Mappings

Each platform provides equivalent tools for executing the `using-superpowers` workflow, with different names and invocation patterns.

| Function               | Claude Code                                            | OpenCode                                                                           | Codex                                                                 |
| ---------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Read/execute skill     | `Skill` tool                                           | `use_skill(name)`                                                                  | `superpowers-codex use-skill <name>`                                  |
| List available skills  | Built-in knowledge                                     | `find_skills()`                                                                    | `superpowers-codex find-skills`                                       |
| Create checklist todos | `TodoWrite` tool                                       | `update_plan(todos)`                                                               | `@mention` agent                                                      |
| Skill file location    | `~/.claude/skills/` or `~/.config/superpowers/skills/` | `.opencode/skills/`, `~/.config/opencode/skills/`, `~/.config/superpowers/skills/` | `.codex/skills/`, `~/.codex/skills/`, `~/.config/superpowers/skills/` |

All platforms share the same three-tier priority system: project-specific skills override personal skills, which override superpowers skills. The namespace prefixes `project:` and `superpowers:` work identically across all platforms.

For detailed platform-specific integration patterns, see [3.2](obra/superpowers/3.2-the-rule:-mandatory-first-response-protocol.md).

**Sources:** [skills/using-superpowers/SKILL.md1-102](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L1-L102) (implicit from skill design for cross-platform usage)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [using-superpowers](#using-superpowers.md)
- [Overview](#overview.md)
- [MANDATORY FIRST RESPONSE PROTOCOL](#mandatory-first-response-protocol.md)
- [The Five-Step Checklist](#the-five-step-checklist.md)
- [Critical Rules](#critical-rules.md)
- [Rule 1: Follow Mandatory Workflows](#rule-1-follow-mandatory-workflows.md)
- [Rule 2: Execute Skills with the Skill Tool](#rule-2-execute-skills-with-the-skill-tool.md)
- [Anti-Rationalization Mechanisms](#anti-rationalization-mechanisms.md)
- [Rationalization Detection Flow](#rationalization-detection-flow.md)
- [Common Rationalization Patterns](#common-rationalization-patterns.md)
- [TodoWrite Requirements](#todowrite-requirements.md)
- [TodoWrite Enforcement Logic](#todowrite-enforcement-logic.md)
- [Anti-Pattern Table](#anti-pattern-table.md)
- [Announcing Skill Usage](#announcing-skill-usage.md)
- [Announcement Format](#announcement-format.md)
- [Announcement Flow](#announcement-flow.md)
- [Skill Types: Rigid vs Flexible](#skill-types-rigid-vs-flexible.md)
- [Classification Criteria](#classification-criteria.md)
- [Rigidity Indicators](#rigidity-indicators.md)
- [Instructions vs Workflows](#instructions-vs-workflows.md)
- [Instruction Interpretation Model](#instruction-interpretation-model.md)
- [Instruction Parsing Rules](#instruction-parsing-rules.md)
- [Summary Workflow](#summary-workflow.md)
- [Core Protocol Summary](#core-protocol-summary.md)
- [Quick Reference Checklist](#quick-reference-checklist.md)
- [Platform-Specific Tool Mappings](#platform-specific-tool-mappings.md)
