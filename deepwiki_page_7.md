# /obra/superpowers/3-core-concepts

Core Concepts | obra/superpowers | DeepWiki

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

# Core Concepts

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [skills/using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md)

This page introduces the fundamental concepts of the Superpowers system: what skills are, how they are structured, the mandatory checking protocol that ensures they are used, and the mechanisms that prevent agents from bypassing them. For platform-specific installation and setup details, see [Getting Started](obra/superpowers/2-getting-started.md). For detailed workflow descriptions, see [Development Workflows](obra/superpowers/6-development-workflows.md). For creating your own skills, see [Creating Skills](obra/superpowers/8-creating-skills.md).

## What Are Skills

Skills are structured documentation files that guide AI agents through proven techniques and workflows. Each skill is a markdown file with YAML frontmatter containing metadata and triggering information.

### Skill File Structure

Skills are markdown files named `SKILL.md` located in skill directories. Each skill follows a two-part structure:

**Part 1: YAML Frontmatter (lines 1-4)**

```
```

| Field         | Format                 | Purpose                          | Constraints                                 |
| ------------- | ---------------------- | -------------------------------- | ------------------------------------------- |
| `name`        | lowercase-kebab-case   | Skill identifier                 | Must match directory name exactly           |
| `description` | Trigger-only statement | Claude Search Optimization (CSO) | Must describe WHEN to use, not WHAT it does |

The `description` field is parsed by Claude's skill discovery system and must trigger skill loading without explicit naming. Avoid workflow summaries in descriptions—they cause "The Description Trap" where Claude follows the short description instead of reading the full skill content.

**Part 2: Markdown Content**

```
```

**Example:** `skills/using-superpowers/SKILL.md` contains no supporting files, while `skills/systematic-debugging/` bundles `root-cause-tracing.md`, `defense-in-depth.md`, `condition-based-waiting.md`, and `find-polluter.sh` as a complete debugging toolkit.

**Sources:** [skills/using-superpowers/SKILL.md1-4](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L1-L4) [RELEASE-NOTES.md109-112](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L109-L112) [RELEASE-NOTES.md76-84](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L76-L84) [RELEASE-NOTES.md331-336](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L331-L336)

### Skill Discovery Mechanism

Claude discovers skills through description-based semantic search when the `Skill` tool is invoked without arguments. The system matches user intent against skill descriptions to determine relevance.

```
```

**Discovery optimization:** Verb-first descriptions ("Use when...") trigger more reliably than noun-based descriptions. The description field is the primary discovery mechanism—content organization is secondary to triggering accuracy.

**Sources:** [skills/using-superpowers/SKILL.md1-4](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L1-L4) [RELEASE-NOTES.md109-112](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L109-L112)

### Skill Categories

| Category                  | Purpose                           | Examples                                                                        | Behavior                                  |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- |
| **Process Skills**        | Determine HOW to approach work    | `brainstorming`, `systematic-debugging`                                         | Take priority, guide methodology          |
| **Implementation Skills** | Guide execution of specific tasks | `test-driven-development`, `using-git-worktrees`, `subagent-driven-development` | Follow process skills, provide techniques |
| **Meta Skills**           | Govern the skill system itself    | `using-superpowers`, `writing-skills`                                           | Bootstrap loaded, manage skill usage      |

**Sources:** [skills/using-superpowers/SKILL.md66-75](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L66-L75) [RELEASE-NOTES.md113-120](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L113-L120)

### Rigid vs Flexible Skills

```
```

**Rigid skills** enforce discipline and must be followed exactly. Examples: `test-driven-development` (the Iron Law: no code without failing test), `systematic-debugging` (4-phase root cause tracing).

**Flexible skills** provide patterns that adapt to context. The skill itself indicates which type it is.

**Sources:** [skills/using-superpowers/SKILL.md77-83](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L77-L83) [README.md126-130](https://github.com/obra/superpowers/blob/a01a135f/README.md#L126-L130)

## The Bootstrap and Mandatory Checking Protocol

The system enforces skill usage through bootstrap injection at session start. This is the core mechanism that prevents agents from working without checking for relevant skills.

### Bootstrap Injection Flow

Every platform injects the `using-superpowers` skill at session start to establish the mandatory checking protocol. The injection mechanism varies by platform but achieves the same result: skill awareness loaded before any user interaction.

**Claude Code Bootstrap Sequence:**

```
```

**Key code entities:**

- [hooks/session-start.sh](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh) - Orchestrates bootstrap
- [lib/initialize-skills.sh15-45](https://github.com/obra/superpowers/blob/a01a135f/lib/initialize-skills.sh#L15-L45) - `git fetch` + `git merge --ff-only` logic
- `additionalContext` field - Claude Code's context injection mechanism
- [skills/using-superpowers/SKILL.md1-88](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L1-L88) - The foundational skill

**OpenCode Bootstrap:**

- [.opencode/plugin/superpowers.js35-50](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L35-L50) - `session.created` event handler
- Calls `session.prompt(content, { noReply: true })` to inject without triggering response
- Explicitly states "using-superpowers is already loaded" to prevent redundant loading

**Codex Bootstrap:**

- [.codex/superpowers-codex](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#LNaN-LNaN) - Manual command invocation
- Outputs bootstrap content to terminal for copy/paste into AGENTS.md
- Requires explicit AGENTS.md configuration per project

**Sources:** [hooks/session-start.sh](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh) [lib/initialize-skills.sh](https://github.com/obra/superpowers/blob/a01a135f/lib/initialize-skills.sh) [.opencode/plugin/superpowers.js](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js) [RELEASE-NOTES.md147-157](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L147-L157) Diagram 6 from high-level architecture

### The Rule: Mandatory Checking Before Any Response

The `using-superpowers` skill, injected at session start, establishes **The Rule**:

> **Invoke relevant or requested skills BEFORE any response or action.**

This is enforced through multiple layers:

**Layer 1: Explicit mandate in using-superpowers**

```
```

**Sources:** [skills/using-superpowers/SKILL.md6-12](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L6-L12) [RELEASE-NOTES.md7-16](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L7-L16)

**Layer 2: Protocol enforcement flowchart**

The skill embeds a DOT/GraphViz flowchart (lines 26-46) that defines the exact checking sequence. This flowchart serves as the authoritative process definition:

```
```

**Critical decision points:**

1. **"Might any skill apply?"** - 1% threshold (line 24)
2. **"Has checklist?"** - If skill contains `- [ ]` markdown, create TodoWrite items
3. **"Follow skill exactly"** - No adaptation for rigid skills (TDD, debugging)

Claude reads this flowchart directly from the skill content. The flowchart format makes the sequence unambiguous—prose descriptions would allow interpretation flexibility.

**Sources:** [skills/using-superpowers/SKILL.md26-46](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L26-L46) [RELEASE-NOTES.md107-112](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L107-L112)

**Layer 3: Priority rules for multiple applicable skills**

```
```

Process skills (which determine HOW to approach work) always precede implementation skills (which guide execution).

**Sources:** [skills/using-superpowers/SKILL.md66-75](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L66-L75) [RELEASE-NOTES.md113-120](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L113-L120)

## Red Flags: Preventing Rationalization

The system includes a comprehensive table of rationalization patterns that agents commonly use to avoid checking skills. These "red flags" are explicitly countered in the `using-superpowers` skill.

### Red Flag Detection System

The `using-superpowers` skill includes a pre-emptive rationalization table (lines 48-66) that addresses 12 specific evasion patterns observed during pressure testing. Each rationalization maps to a counter-argument.

```
```

**Complete Red Flag Table:**

| Thought Pattern                     | Reality                                                | Source Version |
| ----------------------------------- | ------------------------------------------------------ | -------------- |
| "This is just a simple question"    | Questions are tasks. Check for skills.                 | v3.2.2         |
| "I need more context first"         | Skill check comes BEFORE clarifying questions.         | v4.0.0         |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first.           | v3.2.2         |
| "I can check git/files quickly"     | Files lack conversation context. Check for skills.     | v3.2.2         |
| "Let me gather information first"   | Skills tell you HOW to gather information.             | v3.2.2         |
| "This doesn't need a formal skill"  | If a skill exists, use it.                             | v3.2.2         |
| "I remember this skill"             | Skills evolve. Read current version.                   | v3.2.2         |
| "This doesn't count as a task"      | Action = task. Check for skills.                       | v3.2.2         |
| "The skill is overkill"             | Simple things become complex. Use it.                  | v3.2.2         |
| "I'll just do this one thing first" | Check BEFORE doing anything.                           | v3.2.2         |
| "This feels productive"             | Undisciplined action wastes time. Skills prevent this. | v4.0.0         |
| "I know what that means"            | Knowing the concept ≠ using the skill. Invoke it.      | v4.0.3         |

Each entry represents a failure mode discovered through pressure testing where agents found ways to rationalize around the mandatory checking protocol. The table evolves as new evasion patterns emerge.

**Testing methodology:** Skills undergo RED-GREEN-REFACTOR cycles with combined pressure scenarios (time pressure + sunk cost + authority). When agents fail under pressure, their rationalization is captured and added to the table. See [Creating Skills](obra/superpowers/8-creating-skills.md) for details on pressure testing.

**Sources:** [skills/using-superpowers/SKILL.md48-66](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L48-L66) [RELEASE-NOTES.md260-276](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L260-L276) [RELEASE-NOTES.md132-133](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L132-L133) [RELEASE-NOTES.md7-16](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L7-L16)

### Evolution of Red Flags

The red flags system evolved through testing with pressure scenarios:

**v3.2.2 (2025-10-21):** Added 8 initial rationalization patterns after observing agents skip skills under time pressure.

**v4.0.0 (2025-12-17):** Added "I need more context first", "Let me explore first", "This feels productive" after observing agents defer checking to gather information.

**v4.0.3 (2025-12-26):** Added "I know what that means" after discovering agents would skip explicitly requested skills by thinking they understood the concept.

**Sources:** [RELEASE-NOTES.md260-276](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L260-L276) [RELEASE-NOTES.md132-133](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L132-L133) [RELEASE-NOTES.md7-16](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L7-L16)

## Skill Priority System

When multiple skills could apply to a task, the system uses a priority mechanism to determine invocation order.

### Priority Resolution Flow

When multiple skills apply, `using-superpowers` (lines 66-75) establishes a two-tier priority system:

```
```

**Priority rules (lines 66-75):**

| Trigger       | Priority 1             | Priority 2                | Rationale                    |
| ------------- | ---------------------- | ------------------------- | ---------------------------- |
| "Build X"     | `brainstorming`        | Domain skills             | Design before implementation |
| "Fix bug"     | `systematic-debugging` | Implementation skills     | Diagnosis before repair      |
| "Add feature" | `brainstorming`        | `test-driven-development` | Plan before code             |

**Code enforcement:** The priority rules exist in prose form at [skills/using-superpowers/SKILL.md66-75](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L66-L75) No programmatic enforcement—Claude follows the written guidance.

**Sources:** [skills/using-superpowers/SKILL.md66-75](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L66-L75) [RELEASE-NOTES.md113-120](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L113-L120) Diagram 2 from high-level architecture

## Platform-Specific Invocation

Different platforms provide different mechanisms for invoking skills, but all share the same underlying protocol.

### Invocation Mechanisms by Platform

Each platform provides different tools for accessing skills, but all resolve to the same `~/.config/superpowers/skills/` repository.

**Claude Code - Native Skill Tool:**

```
```

**OpenCode - Custom JavaScript Tools:**

```
```

**Codex - CLI Node.js Script:**

```
```

**Shared resolution logic:** [lib/skills-core.js40-75](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L40-L75) implements `resolveSkillPath()` function used by OpenCode and Codex. Claude Code uses native resolution.

**Sources:** [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json) [.opencode/plugin/superpowers.js](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js) [.codex/superpowers-codex](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex) [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js) Diagram 4 from high-level architecture

### Skill Namespacing and Resolution

Skills use namespace prefixes to distinguish between different repositories. Resolution follows a three-tier priority system.

**Namespace Prefixes:**

| Namespace      | Repository Location                                   | Example                     | Who Uses           |
| -------------- | ----------------------------------------------------- | --------------------------- | ------------------ |
| `superpowers:` | `~/.config/superpowers/skills/`                       | `superpowers:brainstorming` | All platforms      |
| (no prefix)    | `~/.claude/skills/` or `~/.codex/superpowers/skills/` | `brainstorming`             | Personal overrides |
| `project:`     | `.opencode/skills/`                                   | `project:custom-workflow`   | OpenCode only      |

**Resolution Priority (lines 168-172 in superpowers.js):**

```
```

**Override behavior:** A personal `brainstorming` skill in `~/.claude/skills/brainstorming/SKILL.md` shadows `superpowers:brainstorming` from the core repository. Both skills exist, but the personal version loads when no namespace prefix is specified.

**Code references:**

- [.opencode/plugin/superpowers.js168-172](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L168-L172) - Project → personal → superpowers search order
- [lib/skills-core.js40-75](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L40-L75) - `resolveSkillPath()` function implements fallback logic

**Sources:** [RELEASE-NOTES.md221-225](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L221-L225) [RELEASE-NOTES.md169](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L169-L169) [.opencode/plugin/superpowers.js](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js) [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js) Diagram 4 from high-level architecture

## Skills Repository Architecture

Skills live in a separate repository ([obra/superpowers-skills](https://github.com/obra/superpowers/blob/a01a135f/obra/superpowers-skills)) that is cloned locally and auto-updated on session start.

### Repository Lifecycle

The skills repository ([obra/superpowers-skills](https://github.com/obra/superpowers/blob/a01a135f/obra/superpowers-skills)) is cloned locally and managed by `initialize-skills.sh`, which runs automatically on every session start.

**First Install Flow:**

```
```

**Key script functions in initialize-skills.sh:**

| Lines   | Function        | Purpose                                                |
| ------- | --------------- | ------------------------------------------------------ |
| 15-30   | Clone detection | Check if `~/.config/superpowers/skills/.git` exists    |
| 35-55   | Fork workflow   | Offer fork creation if `gh` command available          |
| 60-75   | Update check    | `git fetch` + `git status --porcelain`                 |
| 80-95   | Auto-merge      | `git merge --ff-only` if no divergence                 |
| 100-110 | Migration       | Backup old installation to `.git.bak` and `skills.bak` |

**Update states:**

```
```

**Sources:** [lib/initialize-skills.sh](https://github.com/obra/superpowers/blob/a01a135f/lib/initialize-skills.sh) [RELEASE-NOTES.md450-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L450-L461) [RELEASE-NOTES.md408-440](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L408-L440) Diagram 6 from high-level architecture

## Enforcement Through Testing

Skills are tested using Test-Driven Development methodology adapted for documentation. This ensures they work under pressure and resist rationalization.

### TDD for Skills

| TDD Phase    | Skill Testing Equivalent        | Purpose                                    |
| ------------ | ------------------------------- | ------------------------------------------ |
| **RED**      | Run scenario WITHOUT skill      | Watch agent fail, capture rationalizations |
| **GREEN**    | Write skill addressing failures | Agent now complies                         |
| **REFACTOR** | Close loopholes                 | Add counters for new rationalizations      |

**Pressure scenarios** combine 3+ stresses (time pressure + sunk cost + authority) to test whether agents follow skills when they want to break them.

**Example pressure scenario:**

```
```

Testing revealed rationalizations like "I already tested it manually" and "Tests after achieve same goals", which were added to the red flags table.

**Sources:** [skills/writing-skills/testing-skills-with-subagents.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md) [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md) [RELEASE-NOTES.md93-99](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L93-L99) Diagram 6 from high-level architecture

## Summary

The Superpowers system enforces skill usage through:

1. **Bootstrap injection** - `using-superpowers` loaded at every session start
2. **Mandatory checking protocol** - Check skills before ANY response (even 1% chance)
3. **Red flags system** - Pre-emptive counters to common rationalizations
4. **Priority rules** - Process skills before implementation skills
5. **TDD methodology** - Skills tested under pressure scenarios to be bulletproof

This multi-layered enforcement creates defense-in-depth against skill bypass. For details on specific skills, see [Key Skills Reference](obra/superpowers/7-key-skills-reference.md). For workflow orchestration, see [Development Workflows](obra/superpowers/6-development-workflows.md).

**Sources:** [skills/using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md) [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md) [README.md](https://github.com/obra/superpowers/blob/a01a135f/README.md) Diagram 5 from high-level architecture

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Core Concepts](#core-concepts.md)
- [What Are Skills](#what-are-skills.md)
- [Skill File Structure](#skill-file-structure.md)
- [Skill Discovery Mechanism](#skill-discovery-mechanism.md)
- [Skill Categories](#skill-categories.md)
- [Rigid vs Flexible Skills](#rigid-vs-flexible-skills.md)
- [The Bootstrap and Mandatory Checking Protocol](#the-bootstrap-and-mandatory-checking-protocol.md)
- [Bootstrap Injection Flow](#bootstrap-injection-flow.md)
- [The Rule: Mandatory Checking Before Any Response](#the-rule-mandatory-checking-before-any-response.md)
- [Red Flags: Preventing Rationalization](#red-flags-preventing-rationalization.md)
- [Red Flag Detection System](#red-flag-detection-system.md)
- [Evolution of Red Flags](#evolution-of-red-flags.md)
- [Skill Priority System](#skill-priority-system.md)
- [Priority Resolution Flow](#priority-resolution-flow.md)
- [Platform-Specific Invocation](#platform-specific-invocation.md)
- [Invocation Mechanisms by Platform](#invocation-mechanisms-by-platform.md)
- [Skill Namespacing and Resolution](#skill-namespacing-and-resolution.md)
- [Skills Repository Architecture](#skills-repository-architecture.md)
- [Repository Lifecycle](#repository-lifecycle.md)
- [Enforcement Through Testing](#enforcement-through-testing.md)
- [TDD for Skills](#tdd-for-skills.md)
- [Summary](#summary.md)
