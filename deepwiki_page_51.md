# /obra/superpowers/10.5-release-notes-archive

Release Notes Archive | obra/superpowers | DeepWiki

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

# Release Notes Archive

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)

This document provides a comprehensive archive of all Superpowers releases, organized by major version family. It documents the evolution of the system architecture, breaking changes, feature additions, and migration paths between versions.

For installation instructions for the current version, see [Getting Started](obra/superpowers/2-getting-started.md). For current architecture details, see [Architecture](obra/superpowers/4-architecture.md). For platform-specific features in the current version, see [Platform-Specific Features](obra/superpowers/5-platform-specific-features.md).

---

## Purpose and Scope

This archive tracks changes across all Superpowers releases, enabling users to:

- **Understand breaking changes** when upgrading between versions
- **Trace architectural evolution** from monolithic plugin to separated repository design
- **Identify when specific features were introduced** (e.g., two-stage review, platform support)
- **Follow migration paths** for upgrading from older versions
- **Reference specific bug fixes** and their version numbers

The archive is organized chronologically within major version families, with emphasis on breaking changes and architectural shifts.

**Sources:** [RELEASE-NOTES.md1-639](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L1-L639)

---

## Version Timeline Overview

The following diagram shows the major version milestones and their key architectural changes:

**Version Evolution Timeline**

```
```

**Sources:** [RELEASE-NOTES.md1-639](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L1-L639)

---

## Current Release Family: v4.0.x

The v4.0.x series represents a major maturation of the skills system with focus on **enforcement**, **testing infrastructure**, and **workflow refinement**.

### v4.0.3 (2025-12-26) - Current Release

**Key Changes:**

| Component                 | Change                                                         | Files Modified                                                                                   |
| ------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `using-superpowers` skill | Strengthened "The Rule" for explicit skill requests            | `skills/using-superpowers/SKILL.md`                                                              |
| Rule wording              | "Invoke relevant or requested skills" (was "Check for skills") | [RELEASE-NOTES.md12](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L12-L12) |
| Rule scope                | "BEFORE any response or action" (was only "response")          | [RELEASE-NOTES.md13](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L13-L13) |
| Red flags                 | Added "I know what that means" rationalization                 | [RELEASE-NOTES.md15](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L15-L15) |
| Test suite                | New `tests/explicit-skill-requests/` directory                 | [RELEASE-NOTES.md19](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L19-L19) |

**Problem Addressed:** Claude was skipping skill invocation when users explicitly requested skills by name (e.g., "use subagent-driven-development"), rationalizing "I know what that means" and working directly.

**Sources:** [RELEASE-NOTES.md3-19](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L3-L19)

---

### v4.0.2 (2025-12-23)

**Breaking Change:** Slash commands converted to user-only invocation:

```
```

**Affected Commands:**

- `/brainstorm` → user-only, redirects to `superpowers:brainstorming`
- `/execute-plan` → user-only, redirects to `superpowers:executing-plans`
- `/write-plan` → user-only, redirects to `superpowers:writing-plans`

The underlying skills remain available for autonomous Claude invocation via the Skill tool. This prevents confusion where Claude would invoke a command that just redirects to a skill.

**Sources:** [RELEASE-NOTES.md21-30](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L21-L30)

---

### v4.0.1 (2025-12-23)

**Improvements:**

1. **Skill access clarification** in `using-superpowers`

   - Added "How to Access Skills" section
   - Changed "read the skill" → "invoke the skill"
   - Specified that Skill tool loads content directly

2. **Community contributions:**

   - GitHub thread reply guidance (h/t @ralphbean) - `receiving-code-review` skill
   - Automation-over-documentation guidance (h/t @EthanJStark) - `writing-skills` skill

**Sources:** [RELEASE-NOTES.md31-50](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L31-L50)

---

### v4.0.0 (2025-12-17) - Major Release

This release introduced multiple major features that fundamentally changed how skills enforce workflows.

**Two-Stage Code Review System**

The `subagent-driven-development` skill now mandates two separate review phases:

```
```

**New Files:**

- `skills/subagent-driven-development/implementer-prompt.md`
- `skills/subagent-driven-development/spec-reviewer-prompt.md`
- `skills/subagent-driven-development/code-quality-reviewer-prompt.md`

**Sources:** [RELEASE-NOTES.md55-75](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L55-L75)

---

**DOT Flowcharts as Executable Specifications**

Key skills rewritten using GraphViz DOT syntax as authoritative process definitions:

| Skill                         | Flowchart Purpose                    |
| ----------------------------- | ------------------------------------ |
| `brainstorming`               | Interactive design refinement phases |
| `writing-plans`               | Plan structure and validation        |
| `subagent-driven-development` | Two-stage review loops               |
| `systematic-debugging`        | Four-phase debugging process         |

**The Description Trap Discovery:**

```
```

When skill descriptions contain workflow summaries, Claude follows the short description instead of reading the detailed flowchart. Fix: descriptions must be trigger-only with no process details.

**Sources:** [RELEASE-NOTES.md107-121](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L107-L121)

---

**Testing Infrastructure**

Three new test frameworks introduced:

| Test Suite           | Location                     | Purpose                                | Method                                               |
| -------------------- | ---------------------------- | -------------------------------------- | ---------------------------------------------------- |
| Skill Triggering     | `tests/skill-triggering/`    | Validates naive prompt triggering      | 6 skills tested without explicit naming              |
| Integration Tests    | `tests/claude-code/`         | Validates skill usage in real sessions | Headless `claude -p` with JSONL analysis             |
| End-to-End Workflows | `tests/subagent-driven-dev/` | Complete workflow validation           | `go-fractals/` (10 tasks), `svelte-todo/` (12 tasks) |

**New Files:**

- `tests/claude-code/analyze-token-usage.py` - Extract token counts from JSONL transcripts
- `tests/skill-triggering/run-tests.sh` - Orchestrator for triggering tests
- `tests/subagent-driven-dev/go-fractals/` - CLI tool test project
- `tests/subagent-driven-dev/svelte-todo/` - CRUD app test project

**Sources:** [RELEASE-NOTES.md93-104](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L93-L104)

---

**Skill Consolidation (Breaking Change)**

Six standalone skills merged into parent skills:

| Removed Skill                   | New Location                                       |
| ------------------------------- | -------------------------------------------------- |
| `root-cause-tracing`            | `systematic-debugging/root-cause-tracing.md`       |
| `defense-in-depth`              | `systematic-debugging/defense-in-depth.md`         |
| `condition-based-waiting`       | `systematic-debugging/condition-based-waiting.md`  |
| `testing-skills-with-subagents` | `writing-skills/testing-skills-with-subagents.md`  |
| `testing-anti-patterns`         | `test-driven-development/testing-anti-patterns.md` |
| `sharing-skills`                | Removed (obsolete)                                 |

**Sources:** [RELEASE-NOTES.md122-128](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L122-L128)

---

**Other v4.0.0 Features:**

- **Debugging tools bundled:** `find-polluter.sh`, `condition-based-waiting-example.ts`
- **Rationalizations table:** Scannable format in `using-superpowers` with 12+ excuses
- **render-graphs.js:** Tool to extract and render DOT diagrams from skills
- **Priority system:** Process skills (brainstorming, debugging) before implementation skills

**Sources:** [RELEASE-NOTES.md129-134](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L129-L134)

---

## Platform Expansion Era: v3.x

The v3.x series focused on **multi-platform support** and **cross-platform compatibility**, adding native support for OpenCode.ai and experimental Codex integration.

### Architecture Evolution: v3.x Platforms

```
```

**Sources:** [RELEASE-NOTES.md160-240](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L160-L240)

---

### v3.6.2 (2025-12-03) - Linux Compatibility

**Fix:** Polyglot hook wrapper POSIX compliance

```
```

**Problem:** Ubuntu/Debian systems where `/bin/sh` is dash (not bash) would error with "Bad substitution".

**Files Modified:** `.claude-plugin/hooks/run-hook.cmd`

**Sources:** [RELEASE-NOTES.md137-145](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L137-L145)

---

### v3.5.1 (2025-11-24) - OpenCode Bootstrap Refactor

**Change:** Event-driven bootstrap injection

```
```

**Benefits:**

- Bootstrap runs exactly once at session creation
- `noReply: true` prevents redundant skill loading
- Explicitly tells model that `using-superpowers` is already loaded

**Files Modified:**

- `.opencode/SuperpowersPlugin.js` - Event handler migration
- Created `getBootstrapContent()` helper function

**Sources:** [RELEASE-NOTES.md147-158](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L147-L158)

---

### v3.5.0 (2025-11-23) - OpenCode Support

**Major Feature:** Native JavaScript plugin for OpenCode.ai

**New File Structure:**

```
.opencode/
├── SuperpowersPlugin.js       # Main plugin class
├── README.opencode.md         # Platform-specific docs
└── (symlink to skills repo)

lib/
└── skills-core.js             # Shared ES module
```

**Custom Tools Added:**

| Tool          | Purpose                        | Implementation                       |
| ------------- | ------------------------------ | ------------------------------------ |
| `use_skill`   | Load and display skill content | `SuperpowersPlugin.js:use_skill()`   |
| `find_skills` | Search skills by keyword       | `SuperpowersPlugin.js:find_skills()` |

**Event Handlers:**

```
```

**Three-Tier Priority System:**

1. `.opencode/skills/` (project-local)
2. `~/.config/opencode/skills/` (personal)
3. `~/.config/superpowers/skills/` (superpowers core)

**Sources:** [RELEASE-NOTES.md160-188](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L160-L188)

---

**Shared Code Module: lib/skills-core.js**

Created to eliminate duplication between OpenCode and Codex implementations:

| Function               | Purpose                                  | Used By         |
| ---------------------- | ---------------------------------------- | --------------- |
| `extractFrontmatter()` | Parse YAML frontmatter from SKILL.md     | OpenCode, Codex |
| `stripFrontmatter()`   | Remove frontmatter, return content only  | OpenCode, Codex |
| `findSkillsInDir()`    | Recursively find all SKILL.md files      | OpenCode, Codex |
| `resolveSkillPath()`   | Handle namespace prefixes (superpowers:) | OpenCode, Codex |

**Sources:** [RELEASE-NOTES.md175-181](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L175-L181)

---

### v3.4.1 (2025-10-31) - Bootstrap Optimization

**Change:** Eliminated redundant skill execution

**Problem:** Session bootstrap was providing `using-superpowers` content, but Claude would still try to execute it manually via Skill tool, creating confusion.

**Solution:** Bootstrap now explicitly states that `using-superpowers` content is already provided and Skill tool is only for other skills.

**Sources:** [RELEASE-NOTES.md190-195](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L190-L195)

---

### v3.4.0 (2025-10-30) - Simplified Brainstorming

**Change:** Returned to conversational brainstorming model

**Removed:** Heavyweight 6-phase process with formal checklists

**Restored:** Natural dialogue pattern:

- Ask questions one at a time
- Present design in 200-300 word sections with validation
- Keep documentation and implementation handoff features

**Sources:** [RELEASE-NOTES.md196-201](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L196-L201)

---

### v3.3.1 (2025-10-28)

**Improvements:**

1. `brainstorming` skill: autonomous recon before questioning, recommendation-driven decisions
2. Writing clarity improvements following Strunk's "Elements of Style"
3. Fixed `writing-skills` directory references (was pointing to wrong paths)

**Sources:** [RELEASE-NOTES.md202-212](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L202-L212)

---

### v3.3.0 (2025-10-28) - Codex Support

**Major Feature:** Experimental Codex platform support

**New Files:**

```
.codex/
├── INSTALL.md                 # Codex-specific installation
├── superpowers-bootstrap.md   # Bootstrap with tool mappings
└── superpowers-codex          # Unified Node.js executable
```

**Unified Script Commands:**

```
```

**Tool Mapping System:**

| Claude Code Feature | Codex Equivalent              |
| ------------------- | ----------------------------- |
| `TodoWrite` tool    | `update_plan` command         |
| Agent dispatch      | Manual subagent workflow      |
| Skill tool          | `superpowers-codex use-skill` |

**Namespace Handling:**

- `superpowers:skill-name` → Core skills from obra/superpowers-skills
- `skill-name` → Personal skills from `~/.codex/skills/`
- Personal skills override core skills when names match

**Sources:** [RELEASE-NOTES.md213-240](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L213-L240)

---

### v3.2.3 (2025-10-23) - Skill Tool Migration

**Change:** Updated `using-superpowers` from Read tool to Skill tool

```
```

The Skill tool is the proper mechanism in Claude Code for invoking skills. This update corrected bootstrap instructions.

**Sources:** [RELEASE-NOTES.md241-255](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L241-L255)

---

### v3.2.2 (2025-10-21) - Rationalization Prevention

**Major Enhancement:** Strengthened enforcement against agent rationalization

**Three layers of enforcement added:**

1. **EXTREMELY-IMPORTANT block:**

   ```
   If even 1% chance a skill applies, you MUST read it
   You do not have a choice. You cannot rationalize your way out.
   ```

2. **MANDATORY FIRST RESPONSE PROTOCOL checklist:**

   - 5-step process before any response
   - Explicit "responding without this = failure" consequence

3. **Common Rationalizations section:**

   - "This is just a simple question" → WRONG
   - "I can check files quickly" → WRONG
   - "Let me gather information first" → WRONG
   - Plus 5 more observed patterns

**Sources:** [RELEASE-NOTES.md256-277](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L256-L277)

---

### v3.2.1 (2025-10-20) - Code Reviewer Agent

**New File:** `agents/code-reviewer.md`

Previously, code review skills required users to have personal agent configuration. This release bundled the agent directly in the plugin.

**All skill references updated:**

- `requesting-code-review` → references `superpowers:code-reviewer`
- `subagent-driven-development` → references `superpowers:code-reviewer`

**Sources:** [RELEASE-NOTES.md278-293](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L278-L293) [agents/code-reviewer.md1-49](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L49)

---

### v3.2.0 (2025-10-18) - Design Documentation

**New Feature:** Phase 4 added to `brainstorming` workflow

**Design Document Pattern:**

```
docs/plans/YYYY-MM-DD-<topic>-design.md   # Design document
docs/plans/YYYY-MM-DD-<topic>.md          # Implementation plan
```

Design documents written BEFORE worktree setup and implementation planning. Restores functionality from original brainstorming command.

**Breaking Change:** Skill namespace standardization

```
```

All internal skill references now use `superpowers:` prefix, aligning with Skill tool invocation syntax.

**Sources:** [RELEASE-NOTES.md294-320](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L294-L320)

---

### v3.1.1 (2025-10-17) - Command Syntax Fix

**Bug Fix:** README command syntax correction

```
```

Plugin-provided commands are automatically namespaced by Claude Code to avoid conflicts.

**Sources:** [RELEASE-NOTES.md321-326](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L321-L326)

---

### v3.1.0 (2025-10-17)

**Breaking Change:** Skill names standardized to lowercase

```
```

Ensures consistency between directory names, frontmatter, and documentation.

**New Features:**

- Enhanced `brainstorming` skill with Quick Reference table, workflow checklist, decision flowchart
- Anthropic best practices integration: `skills/writing-skills/anthropic-best-practices.md`

**Improvements:**

- Explicit requirement markers: `**REQUIRED BACKGROUND:**`, `**REQUIRED SUB-SKILL:**`, `**Complementary skills:**`
- Progressive disclosure patterns
- Scannable table formats

**Sources:** [RELEASE-NOTES.md327-385](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L327-L385)

---

### v3.0.1 (2025-10-16)

**Major Change:** Migration to Anthropic's first-party skills system

This release marks the transition from custom skill loading to using Claude Code's native Skill tool.

**Sources:** [RELEASE-NOTES.md386-391](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L386-L391)

---

## Repository Separation Era: v2.0.x

The v2.0.x series represents the **most significant architectural shift** in Superpowers history: separating the plugin from the skills repository.

### v2.0 Architecture Diagram

```
```

**Sources:** [RELEASE-NOTES.md408-446](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L408-L446)

---

### v2.0.2 (2025-10-12)

**Bug Fix:** Git state detection for upstream comparison

**Problem:** False warning when local repository had commits ahead of upstream.

**Fix:** Distinguish three git states:

1. Local behind upstream → "New skills available"
2. Local ahead of upstream → No warning
3. Diverged → "Manual sync needed"

**Implementation:** `lib/initialize-skills.sh` git state logic

**Sources:** [RELEASE-NOTES.md392-397](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L392-L397)

---

### v2.0.1 (2025-10-12)

**Bug Fix:** Session hook execution in plugin context

**Problem:** Hook failing silently with "Plugin hook error", preventing skills context from loading.

**Fix:** Two changes in `hooks/session-start.sh`:

```
```

**Sources:** [RELEASE-NOTES.md398-406](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L398-L406)

---

### v2.0.0 (2025-10-12) - Major Release

**Headline Change:** Skills repository separation

**Problem Solved:**

- Skills and plugin had same versioning (coupling)
- Contributing skills required plugin modification
- Updates required full plugin reinstall
- No community contribution workflow

**Solution:**

- Plugin becomes lightweight shim
- Skills live in separate `obra/superpowers-skills` repository
- Users fork skills repo for contributions
- Auto-update on session start

**Architecture Changes:**

```
```

**Sources:** [RELEASE-NOTES.md408-446](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L408-L446)

---

**Breaking Changes in v2.0.0:**

| Removed                               | Replacement                     |
| ------------------------------------- | ------------------------------- |
| Personal superpowers overlay system   | Git branch workflow             |
| Two-tier system (personal/core)       | Single-repo with fork/PR        |
| `hooks/setup-personal-superpowers.sh` | `lib/initialize-skills.sh`      |
| Skills in plugin directory            | `~/.config/superpowers/skills/` |

**Sources:** [RELEASE-NOTES.md420-445](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L420-L445)

---

**New Files in v2.0.0:**

```
lib/
└── initialize-skills.sh         # Skills repo management

docs/
└── TESTING-CHECKLIST.md         # Manual testing scenarios

.claude-plugin/
└── marketplace.json             # Local testing config
```

**Removed in v2.0.0:**

```
skills/                          # 82 files moved to obra/superpowers-skills
scripts/                         # Moved to skills/using-skills/
hooks/setup-personal-superpowers.sh  # Obsolete
```

**Sources:** [RELEASE-NOTES.md547-566](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L547-L566)

---

**New Skills in v2.0.0:**

Six problem-solving skills inspired by Amplifier patterns:

| Skill                            | Purpose                                     | Category        |
| -------------------------------- | ------------------------------------------- | --------------- |
| `collision-zone-thinking`        | Force unrelated concepts together           | Problem-Solving |
| `inversion-exercise`             | Flip assumptions to reveal constraints      | Problem-Solving |
| `meta-pattern-recognition`       | Spot universal principles across domains    | Problem-Solving |
| `scale-game`                     | Test at extremes to expose fundamentals     | Problem-Solving |
| `simplification-cascades`        | Find insights that eliminate components     | Problem-Solving |
| `when-stuck`                     | Dispatch to right problem-solving technique | Meta            |
| `tracing-knowledge-lineages`     | Understand how ideas evolved                | Research        |
| `preserving-productive-tensions` | Keep multiple valid approaches              | Architecture    |

**Sources:** [RELEASE-NOTES.md462-478](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L462-L478)

---

**Skills Improvements in v2.0.0:**

```
```

**Tools Improvements:**

```
```

**Sources:** [RELEASE-NOTES.md479-511](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L479-L511)

---

**Migration Path: v1.x → v2.0.0**

```
```

**Sources:** [RELEASE-NOTES.md575-609](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L575-L609)

---

## Version Comparison Matrix

This table summarizes key capabilities across major versions:

| Feature                      | v2.0.x  | v3.0-3.4    | v3.5-3.6  | v4.0.x              |
| ---------------------------- | ------- | ----------- | --------- | ------------------- |
| **Architecture**             |         |             |           |                     |
| Repository separation        | ✅       | ✅           | ✅         | ✅                   |
| Auto-update on session start | ✅       | ✅           | ✅         | ✅                   |
| Fork workflow                | ✅       | ✅           | ✅         | ✅                   |
| **Platform Support**         |         |             |           |                     |
| Claude Code                  | ✅       | ✅           | ✅         | ✅                   |
| Codex                        | ❌       | ✅ (v3.3+)   | ✅         | ✅                   |
| OpenCode.ai                  | ❌       | ❌           | ✅ (v3.5+) | ✅                   |
| **Skill Features**           |         |             |           |                     |
| First-party Skill tool       | ❌       | ✅ (v3.0+)   | ✅         | ✅                   |
| Namespace prefixes           | ❌       | ✅ (v3.2+)   | ✅         | ✅                   |
| Lowercase skill names        | ❌       | ✅ (v3.1+)   | ✅         | ✅                   |
| DOT flowcharts               | ❌       | ❌           | ❌         | ✅ (v4.0+)           |
| Two-stage review             | ❌       | ❌           | ❌         | ✅ (v4.0+)           |
| **Testing**                  |         |             |           |                     |
| Integration tests            | ❌       | ❌           | ❌         | ✅ (v4.0+)           |
| Skill triggering tests       | ❌       | ❌           | ❌         | ✅ (v4.0+)           |
| End-to-end workflows         | ❌       | ❌           | ❌         | ✅ (v4.0+)           |
| **Enforcement**              |         |             |           |                     |
| Rationalization prevention   | Minimal | ✅ (v3.2.2+) | ✅         | ✅ Enhanced (v4.0.3) |
| Explicit skill requests      | ❌       | ❌           | ❌         | ✅ (v4.0.3)          |
| Slash command restrictions   | ❌       | ❌           | ❌         | ✅ (v4.0.2)          |

**Sources:** [RELEASE-NOTES.md1-639](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L1-L639)

---

## Critical Breaking Changes Summary

The following table lists all breaking changes that require user action:

| Version | Breaking Change                       | Required Action                      | Impact |
| ------- | ------------------------------------- | ------------------------------------ | ------ |
| v2.0.0  | Skills moved to separate repository   | None (automatic migration)           | High   |
| v2.0.0  | Personal overlay system removed       | Migrate to git branches              | Medium |
| v3.0.1  | Migration to first-party Skill tool   | None (automatic)                     | Low    |
| v3.1.0  | Skill names lowercase                 | Update custom skill references       | Low    |
| v3.2.0  | Namespace prefix `superpowers:`       | Update cross-references              | Medium |
| v4.0.0  | Skill consolidation (6 skills merged) | Update skill names in plans          | Medium |
| v4.0.2  | Slash commands user-only              | Use underlying skills for automation | Low    |

**Sources:** [RELEASE-NOTES.md1-639](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L1-L639)

---

## File Evolution Tracking

Key files and their version history:

**Core Plugin Files:**

```
.claude-plugin/plugin.json
├── v2.0.0: Initial separation (was in plugin root)
├── v3.x: Version bumps, keyword updates
└── v4.0.x: Version bumps (4.0.0 → 4.0.1 → 4.0.2 → 4.0.3)

lib/initialize-skills.sh
├── v2.0.0: Created - skills repo clone/update
├── v2.0.1: Fixed git state detection
└── v3.x: Enhanced fork workflow, platform support

hooks/session-start.sh
├── v2.0.0: Updated for separated skills repo
├── v2.0.1: Fixed BASH_SOURCE fallback
└── v3.x: Platform-specific bootstrap content
```

**Platform-Specific Files:**

```
# v3.3.0: Codex support
.codex/superpowers-codex
.codex/INSTALL.md
.codex/superpowers-bootstrap.md

# v3.5.0: OpenCode support
.opencode/SuperpowersPlugin.js
lib/skills-core.js  # Shared between OpenCode and Codex

# v3.6.2: Polyglot wrapper
.claude-plugin/hooks/run-hook.cmd  # POSIX compliance fix
```

**Testing Infrastructure:**

```
# v4.0.0: Testing framework
tests/skill-triggering/         # Naive prompt tests
tests/claude-code/             # Integration tests
tests/claude-code/analyze-token-usage.py  # Cost tracking
tests/subagent-driven-dev/     # End-to-end workflows
tests/explicit-skill-requests/  # v4.0.3: Explicit request tests
```

**Sources:** [RELEASE-NOTES.md1-639](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L1-L639)

---

## Migration Checklist by Version

### Upgrading from v1.x to v2.0+

- [ ] Backup personal skills: `cp -r ~/.config/superpowers/skills ~/backup`
- [ ] Update plugin: `/plugin update superpowers`
- [ ] Wait for automatic migration on session start
- [ ] Verify skills location: `ls ~/.config/superpowers/skills/`
- [ ] Optionally fork repository via `gh` CLI
- [ ] Migrate personal skills to git branch if desired

### Upgrading from v2.x to v3.0+

- [ ] Update plugin: `/plugin update superpowers`
- [ ] No manual migration required (automatic)
- [ ] Test slash commands use namespaced syntax: `/superpowers:brainstorm`

### Upgrading from v3.0-3.4 to v3.5+

- [ ] Update plugin: `/plugin update superpowers`
- [ ] For OpenCode users: follow [OpenCode installation](obra/superpowers/2.2-installing-on-opencode.md)
- [ ] Verify bootstrap injection occurs at session start

### Upgrading from v3.x to v4.0+

- [ ] Update plugin: `/plugin update superpowers`

- [ ] Update skill references for consolidated skills:

  - `root-cause-tracing` → `systematic-debugging/root-cause-tracing.md`
  - `defense-in-depth` → `systematic-debugging/defense-in-depth.md`
  - `condition-based-waiting` → `systematic-debugging/condition-based-waiting.md`
  - `testing-skills-with-subagents` → `writing-skills/testing-skills-with-subagents.md`
  - `testing-anti-patterns` → `test-driven-development/testing-anti-patterns.md`

- [ ] Review new two-stage review system in subagent workflows

- [ ] Understand DOT flowcharts in key skills

### Upgrading within v4.0.x

- [ ] v4.0.0 → v4.0.1: No action required
- [ ] v4.0.1 → v4.0.2: Update automation that invokes slash commands (now user-only)
- [ ] v4.0.2 → v4.0.3: No action required (enforcement improvements)

**Sources:** [RELEASE-NOTES.md1-639](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L1-L639)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Release Notes Archive](#release-notes-archive.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Version Timeline Overview](#version-timeline-overview.md)
- [Current Release Family: v4.0.x](#current-release-family-v40x.md)
- [v4.0.3 (2025-12-26) - Current Release](#v403-2025-12-26---current-release.md)
- [v4.0.2 (2025-12-23)](#v402-2025-12-23.md)
- [v4.0.1 (2025-12-23)](#v401-2025-12-23.md)
- [v4.0.0 (2025-12-17) - Major Release](#v400-2025-12-17---major-release.md)
- [Platform Expansion Era: v3.x](#platform-expansion-era-v3x.md)
- [Architecture Evolution: v3.x Platforms](#architecture-evolution-v3x-platforms.md)
- [v3.6.2 (2025-12-03) - Linux Compatibility](#v362-2025-12-03---linux-compatibility.md)
- [v3.5.1 (2025-11-24) - OpenCode Bootstrap Refactor](#v351-2025-11-24---opencode-bootstrap-refactor.md)
- [v3.5.0 (2025-11-23) - OpenCode Support](#v350-2025-11-23---opencode-support.md)
- [v3.4.1 (2025-10-31) - Bootstrap Optimization](#v341-2025-10-31---bootstrap-optimization.md)
- [v3.4.0 (2025-10-30) - Simplified Brainstorming](#v340-2025-10-30---simplified-brainstorming.md)
- [v3.3.1 (2025-10-28)](#v331-2025-10-28.md)
- [v3.3.0 (2025-10-28) - Codex Support](#v330-2025-10-28---codex-support.md)
- [v3.2.3 (2025-10-23) - Skill Tool Migration](#v323-2025-10-23---skill-tool-migration.md)
- [v3.2.2 (2025-10-21) - Rationalization Prevention](#v322-2025-10-21---rationalization-prevention.md)
- [v3.2.1 (2025-10-20) - Code Reviewer Agent](#v321-2025-10-20---code-reviewer-agent.md)
- [v3.2.0 (2025-10-18) - Design Documentation](#v320-2025-10-18---design-documentation.md)
- [v3.1.1 (2025-10-17) - Command Syntax Fix](#v311-2025-10-17---command-syntax-fix.md)
- [v3.1.0 (2025-10-17)](#v310-2025-10-17.md)
- [v3.0.1 (2025-10-16)](#v301-2025-10-16.md)
- [Repository Separation Era: v2.0.x](#repository-separation-era-v20x.md)
- [v2.0 Architecture Diagram](#v20-architecture-diagram.md)
- [v2.0.2 (2025-10-12)](#v202-2025-10-12.md)
- [v2.0.1 (2025-10-12)](#v201-2025-10-12.md)
- [v2.0.0 (2025-10-12) - Major Release](#v200-2025-10-12---major-release.md)
- [Version Comparison Matrix](#version-comparison-matrix.md)
- [Critical Breaking Changes Summary](#critical-breaking-changes-summary.md)
- [File Evolution Tracking](#file-evolution-tracking.md)
- [Migration Checklist by Version](#migration-checklist-by-version.md)
- [Upgrading from v1.x to v2.0+](#upgrading-from-v1x-to-v20.md)
- [Upgrading from v2.x to v3.0+](#upgrading-from-v2x-to-v30.md)
- [Upgrading from v3.0-3.4 to v3.5+](#upgrading-from-v30-34-to-v35.md)
- [Upgrading from v3.x to v4.0+](#upgrading-from-v3x-to-v40.md)
- [Upgrading within v4.0.x](#upgrading-within-v40x.md)
