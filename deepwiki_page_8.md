# /obra/superpowers/3.1-what-are-skills

What Are Skills | obra/superpowers | DeepWiki

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

# What Are Skills

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [README.md](https://github.com/obra/superpowers/blob/a01a135f/README.md)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [skills/writing-skills/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md)
- [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md)
- [skills/writing-skills/render-graphs.js](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/render-graphs.js)
- [skills/writing-skills/testing-skills-with-subagents.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md)

This page defines what skills are in the superpowers system, explains the different categories and types of skills, and documents the priority system that determines which skills take precedence when multiple skills could apply to a task.

For information about how agents discover and invoke skills, see [Finding and Invoking Skills](obra/superpowers/3.3-finding-and-invoking-skills.md). For the mandatory protocol that enforces skill usage, see [Mandatory First Response Protocol](obra/superpowers/3.2-the-rule:-mandatory-first-response-protocol.md).

## Definition

Skills are **reusable process documentation files** that guide AI agent behavior through structured workflows and rules. Each skill is a `SKILL.md` file containing:

1. **YAML frontmatter** - Metadata for skill discovery
2. **Markdown content** - Instructions agents follow exactly

Skills are **mandatory workflows**, not suggestions. When a skill applies to a task, the agent must invoke and follow it before proceeding.

**How Skills Guide AI Behavior:**

| Mechanism       | Implementation                                                       | Code Reference                                               |
| --------------- | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Discovery**   | Agent searches skill descriptions to find relevant skills            | `description` field in YAML frontmatter                      |
| **Loading**     | Agent reads full SKILL.md content via Skill tool                     | Platform-specific invocation (Skill tool, `use_skill`, etc.) |
| **Enforcement** | `using-superpowers` skill mandates invocation BEFORE any response    | Injected at session start via bootstrap                      |
| **Compliance**  | Skills contain red flags, rationalization tables, and explicit rules | Built into SKILL.md content structure                        |

**Sources:** [README.md1-16](https://github.com/obra/superpowers/blob/a01a135f/README.md#L1-L16) [skills/writing-skills/SKILL.md1-24](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L1-L24) [RELEASE-NOTES.md7-16](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L7-L16)

## File System Structure

Skills are cloned from the [obra/superpowers-skills](https://github.com/obra/superpowers/blob/a01a135f/obra/superpowers-skills) repository during plugin initialization via [lib/initialize-skills.sh](https://github.com/obra/superpowers/blob/a01a135f/lib/initialize-skills.sh)

**Installation Paths:**

| Platform    | Directory Path                  | Managed By                                                                                                          |
| ----------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Claude Code | `~/.config/superpowers/skills/` | [lib/initialize-skills.sh1-50](https://github.com/obra/superpowers/blob/a01a135f/lib/initialize-skills.sh#L1-L50)   |
| OpenCode    | `~/.config/superpowers/skills/` | [lib/initialize-skills.sh1-50](https://github.com/obra/superpowers/blob/a01a135f/lib/initialize-skills.sh#L1-L50)   |
| Codex       | `~/.codex/superpowers/skills/`  | [.codex/superpowers-codex1-100](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L1-L100) |

**Directory Structure Per Skill:**

```
skills/
  brainstorming/
    SKILL.md                    # Main skill file (required)
    examples/                   # Optional supporting files
  test-driven-development/
    SKILL.md
    testing-anti-patterns.md    # Optional reference
  systematic-debugging/
    SKILL.md
    root-cause-tracing.md       # Bundled technique
    find-polluter.sh            # Executable tool
  using-superpowers/
    SKILL.md
```

**Sources:** [README.md27-78](https://github.com/obra/superpowers/blob/a01a135f/README.md#L27-L78) [skills/writing-skills/SKILL.md72-84](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L72-L84) [RELEASE-NOTES.md450-459](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L450-L459)

## SKILL.md File Format

Each `SKILL.md` file contains exactly two sections:

### YAML Frontmatter (Required)

```
```

**Field Requirements:**

| Field         | Rules                                                      | Purpose                                             |
| ------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| `name`        | Letters, numbers, hyphens only. Must match directory name. | Skill identifier for invocation                     |
| `description` | Max 1024 chars. Third-person. Starts with "Use when..."    | Claude Search Optimization - triggers skill loading |

**Critical:** The `description` field determines when Claude loads the skill. It must contain **triggering conditions only**, never workflow summaries (see [Claude Search Optimization](#84.md) for why).

**Sources:** [skills/writing-skills/SKILL.md93-110](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L93-L110) [skills/writing-skills/SKILL.md140-173](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L140-L173)

### Markdown Content (Required)

```
```

**Sources:** [skills/writing-skills/SKILL.md93-137](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L93-L137)

## Concrete File System Layout

**Title: Actual Skills Repository Structure on Disk**

```
```

**Sources:** [README.md98-123](https://github.com/obra/superpowers/blob/a01a135f/README.md#L98-L123) [RELEASE-NOTES.md70-84](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L70-L84) [RELEASE-NOTES.md122-128](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L122-L128)

## Skill Categories

Skills are organized into two primary categories based on **what they determine** in the development workflow:

### Process Skills

Process skills determine **HOW to approach a task**. They guide the methodology and workflow before implementation begins.

| Skill                  | Purpose                                         | When It Applies                          |
| ---------------------- | ----------------------------------------------- | ---------------------------------------- |
| `brainstorming`        | Interactive design refinement through questions | Before writing any code for new features |
| `systematic-debugging` | Root cause analysis methodology                 | When bugs need investigation             |
| `debugging`            | General debugging techniques                    | Any debugging scenario                   |

Process skills **always take precedence** when multiple skills could apply. The agent must complete the process skill workflow before moving to implementation skills.

**Sources:** [README.md82-94](https://github.com/obra/superpowers/blob/a01a135f/README.md#L82-L94) [skills/using-superpowers/SKILL.md67-76](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L67-L76)

### Implementation Skills

Implementation skills guide **execution of work** once the approach is determined. They provide patterns, techniques, and workflows for actually building or modifying code.

| Skill                            | Purpose                               | When It Applies                    |
| -------------------------------- | ------------------------------------- | ---------------------------------- |
| `test-driven-development`        | RED-GREEN-REFACTOR cycle              | Any code implementation            |
| `using-git-worktrees`            | Branch isolation workflow             | When starting new feature work     |
| `writing-plans`                  | Task breakdown and planning           | After design is approved           |
| `subagent-driven-development`    | Iterative implementation with reviews | Executing complex multi-task plans |
| `executing-plans`                | Batch execution with checkpoints      | Parallel session execution         |
| `requesting-code-review`         | Pre-review checklist                  | Between tasks or before merge      |
| `finishing-a-development-branch` | Merge/PR/cleanup workflow             | When all tasks complete            |

**Sources:** [README.md82-118](https://github.com/obra/superpowers/blob/a01a135f/README.md#L82-L118) [skills/using-superpowers/SKILL.md67-76](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L67-L76)

### Meta Skills

Meta skills govern **how to use the skill system itself**:

| Skill                           | Purpose                                         |
| ------------------------------- | ----------------------------------------------- |
| `using-superpowers`             | Establishes mandatory skill invocation protocol |
| `writing-skills`                | Methodology for creating new skills             |
| `testing-skills-with-subagents` | TDD approach for skill testing                  |

**Sources:** [README.md120-122](https://github.com/obra/superpowers/blob/a01a135f/README.md#L120-L122)

## Skill Type System: Rigid vs Flexible

Beyond categories, skills have **flexibility types** that determine how strictly agents must follow them:

### Rigid Skills

Rigid skills enforce **discipline and process integrity**. They must be followed **exactly as written** with no adaptation or shortcuts.

**Characteristics:**

- Contain explicit rules with no exceptions
- Have red flags tables listing forbidden rationalizations
- Enforce workflows that prevent common failure patterns
- Cannot be "adapted to context"

**Examples:**

- `test-driven-development` - RED-GREEN-REFACTOR cycle cannot be reordered
- `systematic-debugging` - Four phases must be completed sequentially
- `brainstorming` - Question-answer flow cannot be skipped

**Why rigid:** These skills prevent agents from taking shortcuts that feel productive but lead to technical debt, incorrect implementations, or wasted effort. Violations of "the letter" are violations of "the spirit."

**Sources:** [skills/using-superpowers/SKILL.md77-84](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L77-L84) [skills/writing-skills/testing-skills-with-subagents.md19-28](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L19-L28)

### Flexible Skills

Flexible skills provide **patterns and principles** that agents adapt to the specific context while maintaining the core intent.

**Characteristics:**

- Provide architectural patterns or design guidance
- Offer multiple implementation approaches
- Expect adaptation to project constraints
- Focus on principles over exact steps

**Examples:**

- Domain-specific pattern libraries
- Architecture guidance documents
- Reference implementations

**The skill itself declares its type** in its content—agents don't decide flexibility.

**Sources:** [skills/using-superpowers/SKILL.md77-84](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L77-L84)

## Priority System

When multiple skills could apply to a task, the system enforces a **mandatory priority order**:

```
```

**Priority Rules:**

1. **Process skills ALWAYS precede implementation skills**

   - "Let's build X" → `brainstorming` first, then implementation skills
   - "Fix this bug" → `systematic-debugging` first, then domain-specific skills

2. **User explicit requests override automatic priority**

   - "Use skill X please" → invoke X directly regardless of priority

3. **If process skill chains to implementation, follow the chain**

   - `brainstorming` → `using-git-worktrees` → `writing-plans` → `subagent-driven-development`

**Sources:** [skills/using-superpowers/SKILL.md67-76](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L67-L76)

## Priority System Implementation

The priority system is enforced through the `using-superpowers` meta-skill, which is automatically injected at session start:

```
```

The rule is stated explicitly in [skills/using-superpowers/SKILL.md22-24](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L22-L24):

> **Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check.

**Sources:** [skills/using-superpowers/SKILL.md1-24](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L1-L24) [skills/using-superpowers/SKILL.md67-76](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L67-L76)

## Example: Skill Invocation Flow

**Scenario:** User says "Add user authentication to the API"

**Title: Skill Loading and Execution Sequence**

```
```

**Why This Order Matters:**

| Wrong Approach                    | Failure Mode                       | Correct Approach                               |
| --------------------------------- | ---------------------------------- | ---------------------------------------------- |
| Jump to `test-driven-development` | Tests for unvalidated design       | `brainstorming` first validates design         |
| Skip `brainstorming`              | Build wrong thing efficiently      | Process skills establish WHAT before HOW       |
| Implement in main branch          | Risk of conflicts, hard rollback   | `using-git-worktrees` isolates work            |
| No plan                           | Ad-hoc implementation, scope creep | `writing-plans` creates verifiable tasks       |
| Single-agent implementation       | No quality gates                   | `subagent-driven-development` two-stage review |

**Sources:** [README.md80-96](https://github.com/obra/superpowers/blob/a01a135f/README.md#L80-L96) [RELEASE-NOTES.md52-74](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L52-L74)

## Skill Naming and Invocation

Skills use hyphenated lowercase names matching their directory names:

| Directory Path                    | Skill Name                | Frontmatter `name` Field        |
| --------------------------------- | ------------------------- | ------------------------------- |
| `skills/brainstorming/`           | `brainstorming`           | `name: brainstorming`           |
| `skills/test-driven-development/` | `test-driven-development` | `name: test-driven-development` |
| `skills/using-superpowers/`       | `using-superpowers`       | `name: using-superpowers`       |

**Platform-Specific Invocation Mechanisms:**

| Platform        | Tool/Command                         | Implementation                                                                                                                                 | Code Reference                                                                                                      |
| --------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Claude Code** | `Skill` tool                         | Native tool, reads from `~/.config/superpowers/skills/`                                                                                        | Built-in to Claude Code                                                                                             |
| **OpenCode**    | `use_skill(name)`                    | Custom tool in [.opencode/SuperpowersPlugin.js1-200](https://github.com/obra/superpowers/blob/a01a135f/.opencode/SuperpowersPlugin.js#L1-L200) | [lib/skills-core.js1-100](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L100)             |
| **Codex**       | `superpowers-codex use-skill <name>` | Node.js CLI script                                                                                                                             | [.codex/superpowers-codex1-300](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L1-L300) |

**Namespace Prefixing:**

Skills in the main repository are prefixed with `superpowers:` when referenced:

- `superpowers:brainstorming`
- `superpowers:test-driven-development`
- `superpowers:code-reviewer` (agent, not skill)

Personal/project skills omit the prefix.

**Sources:** [RELEASE-NOTES.md331-336](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L331-L336) [RELEASE-NOTES.md306-313](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L306-L313) [README.md27-78](https://github.com/obra/superpowers/blob/a01a135f/README.md#L27-L78)

## Testing and Validation

Skills themselves are tested using **TDD methodology adapted for documentation**. The testing process ensures skills actually prevent the failures they claim to prevent:

**RED-GREEN-REFACTOR for Skills:**

| Phase    | Skill Testing Equivalent                  | Success Criteria                                |
| -------- | ----------------------------------------- | ----------------------------------------------- |
| RED      | Run scenario WITHOUT skill                | Agent fails, document rationalizations verbatim |
| GREEN    | Write skill addressing failures           | Agent now complies under pressure               |
| REFACTOR | Close loopholes from new rationalizations | Agent cannot rationalize away compliance        |

Pressure testing combines 3+ simultaneous pressures (time, sunk cost, authority, exhaustion) to verify skills work when agents have incentive to bypass them.

For details on creating and testing skills, see [Writing Skills with TDD](obra/superpowers/8.1-writing-skills-with-tdd.md) and [Testing Skills with Pressure Scenarios](obra/superpowers/8.3-testing-skills-with-pressure-scenarios.md).

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md1-42](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L1-L42) [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md1-190](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md#L1-L190)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [What Are Skills](#what-are-skills.md)
- [Definition](#definition.md)
- [File System Structure](#file-system-structure.md)
- [SKILL.md File Format](#skillmd-file-format.md)
- [YAML Frontmatter (Required)](#yaml-frontmatter-required.md)
- [Markdown Content (Required)](#markdown-content-required.md)
- [Concrete File System Layout](#concrete-file-system-layout.md)
- [Skill Categories](#skill-categories.md)
- [Process Skills](#process-skills.md)
- [Implementation Skills](#implementation-skills.md)
- [Meta Skills](#meta-skills.md)
- [Skill Type System: Rigid vs Flexible](#skill-type-system-rigid-vs-flexible.md)
- [Rigid Skills](#rigid-skills.md)
- [Flexible Skills](#flexible-skills.md)
- [Priority System](#priority-system.md)
- [Priority System Implementation](#priority-system-implementation.md)
- [Example: Skill Invocation Flow](#example-skill-invocation-flow.md)
- [Skill Naming and Invocation](#skill-naming-and-invocation.md)
- [Testing and Validation](#testing-and-validation.md)
