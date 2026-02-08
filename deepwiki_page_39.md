# /obra/superpowers/8.4-claude-search-optimization-(cso)

Claude Search Optimization (CSO) | obra/superpowers | DeepWiki

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

# Claude Search Optimization (CSO)

Relevant source files

- [skills/writing-skills/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md)
- [skills/writing-skills/render-graphs.js](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/render-graphs.js)

## Purpose and Scope

Claude Search Optimization (CSO) is the practice of writing skill descriptions and content to maximize the likelihood that AI agents will discover and load the appropriate skills for a given task. This page covers the specific techniques for optimizing skill discoverability, description formatting, keyword usage, and token efficiency.

For broader guidance on skill structure and the TDD methodology for creating skills, see [Writing Skills with TDD](obra/superpowers/8.1-writing-skills-with-tdd.md). For the complete skill creation process including testing and deployment, see [Skill Structure and SKILL.md Format](obra/superpowers/8.2-skill-structure-and-skill.md-format.md).

## The Discovery Challenge

Every skill in the repository competes for attention when an agent encounters a problem. The agent must decide which skills to load based on limited information—primarily the skill's name and description field. Poor optimization results in relevant skills being overlooked, while irrelevant skills waste context window.

The discovery process follows a specific workflow where the YAML frontmatter serves as the primary filter. If the description doesn't match the agent's current context, the skill body never gets read.

**Sources:** [skills/writing-skills/SKILL.md140-158](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L140-L158)

## The Critical Rule: Descriptions Are Triggers, Not Summaries

### Why Workflow Summaries Break Discovery

**The fundamental rule:** The `description` field must contain **only triggering conditions**—never workflow summaries or process descriptions.

Testing revealed that when a description summarizes what a skill does (its workflow or process), agents follow the description instead of reading the full skill content. This creates a dangerous shortcut where the skill body becomes documentation that gets skipped.

**Real-world example from testing:**

- **Description with workflow summary:** "Use when executing plans - dispatches subagent per task with code review between tasks"
- **Result:** Claude performed ONE review (as described in the summary)
- **Actual skill content:** Flowchart showing TWO distinct reviews (spec compliance, then code quality)
- **Fixed description:** "Use when executing implementation plans with independent tasks in the current session"
- **New result:** Claude correctly read the flowchart and performed both reviews

The trap is subtle: workflow summaries create a mental model that agents use instead of reading the detailed instructions. The skill body becomes reference material that gets ignored.

**Sources:** [skills/writing-skills/SKILL.md150-172](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L150-L172)

### Description Field Syntax and Format

```
```

| Field         | Requirements                                                                 |
| ------------- | ---------------------------------------------------------------------------- |
| `name`        | Letters, numbers, hyphens only (no parentheses or special characters)        |
| `description` | Start with "Use when...", third person, max 1024 chars total for frontmatter |
| Purpose       | Answer "Should I read this skill right now?" not "What does this skill do?"  |

**Good descriptions:**

```
```

**Bad descriptions:**

```
```

**Sources:** [skills/writing-skills/SKILL.md160-197](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L160-L197)

### Discovery Workflow Diagram

```
```

**Sources:** [skills/writing-skills/SKILL.md635-645](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L635-L645)

### The Shortcut Problem

```
```

**Sources:** [skills/writing-skills/SKILL.md150-172](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L150-L172)

## Keyword Coverage Strategy

### Types of Keywords

Claude searches for skills using natural language queries derived from the current problem context. Effective keywords match the vocabulary Claude would naturally use when encountering a problem.

| Keyword Type         | Purpose                     | Examples                                                          |
| -------------------- | --------------------------- | ----------------------------------------------------------------- |
| **Error messages**   | Exact text from failures    | "Hook timed out", "ENOTEMPTY", "Cannot read property"             |
| **Symptoms**         | Observable behaviors        | "flaky", "hanging", "zombie process", "test pollution"            |
| **Synonyms**         | Alternative terminology     | "timeout/hang/freeze", "cleanup/teardown/afterEach"               |
| **Tools**            | Specific commands/libraries | `git worktree`, `vitest`, `React Router`, actual command names    |
| **Problem patterns** | Technology-agnostic issues  | "race conditions", "timing dependencies", "inconsistent behavior" |

**Technology-agnostic vs specific:**

- Describe the **problem** (race conditions, inconsistent behavior)
- NOT language-specific symptoms (setTimeout, sleep) unless the skill is language-specific
- If skill IS technology-specific, make that explicit in triggers

**Sources:** [skills/writing-skills/SKILL.md199-206](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L199-L206)

### Keyword Placement Strategy

Keywords should appear throughout the skill, with strategic placement for maximum discoverability:

```
```

**Placement priorities:**

1. **Description field** - Primary filter, highest weight
2. **When to Use section** - Common search target
3. **Common Mistakes section** - Error-driven discovery
4. **Throughout body** - Natural keyword density

**Sources:** [skills/writing-skills/SKILL.md199-206](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L199-L206)

## Naming Conventions

### Active Voice and Verb-First

Skill names should describe the action being taken, not the abstract concept. This matches how agents think about applying skills.

| ✅ Good (Active, Verb-First)     | ❌ Bad (Passive, Noun-First) |
| ------------------------------- | --------------------------- |
| `creating-skills`               | `skill-creation`            |
| `condition-based-waiting`       | `async-test-helpers`        |
| `writing-plans`                 | `plan-documentation`        |
| `debugging-with-logs`           | `log-analysis`              |
| `testing-skills-with-subagents` | `skill-testing-methodology` |

### Gerunds for Processes

The `-ing` form (gerund) works well for ongoing processes and methodologies:

- `brainstorming` - The process of exploring design approaches
- `executing-plans` - The process of implementing tasks
- `requesting-code-review` - The process of getting review

### Core Insight Names

For pattern skills, name by the core insight or what you actually do:

- `flatten-with-flags` (the technique) not `data-structure-refactoring` (the category)
- `root-cause-tracing` (the action) not `debugging-techniques` (the domain)

**Sources:** [skills/writing-skills/SKILL.md207-277](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L207-L277)

### Name to File Path Mapping

```
```

**Sources:** [skills/writing-skills/SKILL.md96-99](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L96-L99)

## Token Efficiency

### Why Token Count Matters

Frequently-referenced skills (like `using-superpowers`) load into **every conversation**. Skills that are part of getting-started workflows also load frequently. Every token in these skills consumes context window space that could be used for code, conversation, or other skills.

**Target word counts:**

| Skill Category                    | Target           | Rationale                     |
| --------------------------------- | ---------------- | ----------------------------- |
| **getting-started workflows**     | <150 words each  | Loaded in most new sessions   |
| **Frequently-loaded meta-skills** | <200 words total | Present in every conversation |
| **Other skills**                  | <500 words       | Still be concise              |

**Verification command:**

```
```

**Sources:** [skills/writing-skills/SKILL.md213-266](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L213-L266)

### Compression Techniques

#### 1. Move Details to Tool Help

Instead of documenting all flags and options in SKILL.md, reference the tool's `--help`:

```
```

#### 2. Use Cross-References

Avoid repeating workflow details that exist in other skills:

```
```

#### 3. Compress Examples

Minimize verbosity in example dialogues:

```
```

#### 4. Eliminate Redundancy

- Don't repeat what's in cross-referenced skills
- Don't explain what's obvious from command names
- Don't include multiple examples of the same pattern
- Remove narrative storytelling

**Sources:** [skills/writing-skills/SKILL.md224-266](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L224-L266)

### Token Budget Impact

```
```

**Sources:** [skills/writing-skills/SKILL.md213-221](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L213-L221)

## Cross-Referencing Other Skills

### Skill Name References

When a skill needs to reference another skill, use the skill name with explicit requirement markers. **Never use `@` syntax** which force-loads files immediately.

| Syntax                                                                   | Effect                             | When to Use                   |
| ------------------------------------------------------------------------ | ---------------------------------- | ----------------------------- |
| `superpowers:test-driven-development`                                    | Agent searches and loads if needed | Reference related skill       |
| `**REQUIRED SUB-SKILL:** Use superpowers:systematic-debugging`           | Strong requirement signal          | Prerequisite technique        |
| `**REQUIRED BACKGROUND:** You MUST understand superpowers:writing-plans` | Mandatory knowledge                | Foundation knowledge          |
| `@skills/testing/test-driven-development/SKILL.md`                       | ❌ Force-loads immediately          | **Never use** - burns context |

**Why no `@` links:**

- `@` syntax loads files immediately (200k+ context)
- Skills load on-demand only when relevant
- Allows agent to decide if reference is needed

**Good cross-reference:**

```
```

**Bad cross-reference:**

```
```

The `@` link immediately consumes context for a skill that may not be relevant yet. The skill name reference lets the agent load it only if needed.

**Sources:** [skills/writing-skills/SKILL.md278-288](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L278-L288)

### Cross-Reference Resolution

```
```

**Sources:** [skills/writing-skills/SKILL.md278-288](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L278-L288)

## YAML Frontmatter Format

### Structure and Constraints

Every skill must have a YAML frontmatter block at the top of `SKILL.md`:

```
```

**Field specifications:**

| Field         | Type   | Constraints                      | Purpose                                               |
| ------------- | ------ | -------------------------------- | ----------------------------------------------------- |
| `name`        | String | Letters, numbers, hyphens only   | Skill identifier, must match directory name           |
| `description` | String | Max 1024 chars total frontmatter | Primary discovery filter - triggering conditions only |

**Character restrictions on `name`:**

- ✅ Allowed: `a-z A-Z 0-9 -` (hyphen)
- ❌ Forbidden: `()` (parentheses), special characters, underscores, spaces

**Description format:**

- Start with "Use when..." to focus on triggers
- Third person (injected into system prompt)
- Under 500 characters if possible
- **NEVER** summarize workflow or process

**Sources:** [skills/writing-skills/SKILL.md95-103](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L95-L103)

### Frontmatter to Skill Loading

```
```

**Sources:** [skills/writing-skills/SKILL.md95-103](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L95-L103) reference to [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js) frontmatter parsing

## Discovery Optimization Checklist

When writing or editing a skill, verify each CSO element:

### Description Field

- [ ] Starts with "Use when..."
- [ ] Contains ONLY triggering conditions (no workflow summary)
- [ ] Written in third person
- [ ] Includes specific symptoms, error messages, or contexts
- [ ] Under 500 characters if possible
- [ ] Max 1024 characters total for YAML frontmatter

### Naming

- [ ] Uses letters, numbers, hyphens only (no parentheses/special chars)
- [ ] Active voice, verb-first
- [ ] Matches directory name exactly
- [ ] Describes the action, not the category

### Keyword Coverage

- [ ] Error messages agents would encounter
- [ ] Symptoms and observable behaviors
- [ ] Tool names and actual commands
- [ ] Synonyms and alternative terminology
- [ ] Keywords appear in description, "When to Use", and "Common Mistakes"

### Token Efficiency

- [ ] Target word count appropriate for skill frequency
- [ ] Details moved to tool `--help` where applicable
- [ ] Cross-references used instead of repeating content
- [ ] Examples compressed (minimal dialogue)
- [ ] No redundancy with cross-referenced skills

### Cross-References

- [ ] Use skill name syntax: `superpowers:skill-name`
- [ ] Explicit requirement markers where needed: `**REQUIRED SUB-SKILL:**`
- [ ] NO `@` links (they force-load files)

**Sources:** [skills/writing-skills/SKILL.md140-288](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/SKILL.md#L140-L288)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Claude Search Optimization (CSO)](#claude-search-optimization-cso.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [The Discovery Challenge](#the-discovery-challenge.md)
- [The Critical Rule: Descriptions Are Triggers, Not Summaries](#the-critical-rule-descriptions-are-triggers-not-summaries.md)
- [Why Workflow Summaries Break Discovery](#why-workflow-summaries-break-discovery.md)
- [Description Field Syntax and Format](#description-field-syntax-and-format.md)
- [Discovery Workflow Diagram](#discovery-workflow-diagram.md)
- [The Shortcut Problem](#the-shortcut-problem.md)
- [Keyword Coverage Strategy](#keyword-coverage-strategy.md)
- [Types of Keywords](#types-of-keywords.md)
- [Keyword Placement Strategy](#keyword-placement-strategy.md)
- [Naming Conventions](#naming-conventions.md)
- [Active Voice and Verb-First](#active-voice-and-verb-first.md)
- [Gerunds for Processes](#gerunds-for-processes.md)
- [Core Insight Names](#core-insight-names.md)
- [Name to File Path Mapping](#name-to-file-path-mapping.md)
- [Token Efficiency](#token-efficiency.md)
- [Why Token Count Matters](#why-token-count-matters.md)
- [Compression Techniques](#compression-techniques.md)
- [1. Move Details to Tool Help](#1-move-details-to-tool-help.md)
- [2. Use Cross-References](#2-use-cross-references.md)
- [3. Compress Examples](#3-compress-examples.md)
- [4. Eliminate Redundancy](#4-eliminate-redundancy.md)
- [Token Budget Impact](#token-budget-impact.md)
- [Cross-Referencing Other Skills](#cross-referencing-other-skills.md)
- [Skill Name References](#skill-name-references.md)
- [Cross-Reference Resolution](#cross-reference-resolution.md)
- [YAML Frontmatter Format](#yaml-frontmatter-format.md)
- [Structure and Constraints](#structure-and-constraints.md)
- [Frontmatter to Skill Loading](#frontmatter-to-skill-loading.md)
- [Discovery Optimization Checklist](#discovery-optimization-checklist.md)
- [Description Field](#description-field.md)
- [Naming](#naming.md)
- [Keyword Coverage](#keyword-coverage.md)
- [Token Efficiency](#token-efficiency-1.md)
- [Cross-References](#cross-references.md)
