# /obra/superpowers

obra/superpowers | DeepWiki

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

# Overview

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [README.md](https://github.com/obra/superpowers/blob/a01a135f/README.md)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [skills/writing-skills/examples/CLAUDE\_MD\_TESTING.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/examples/CLAUDE_MD_TESTING.md)
- [skills/writing-skills/testing-skills-with-subagents.md](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md)

This document provides a high-level introduction to the Superpowers system: what it is, why it exists, and the critical architectural decisions that shape how it works. For detailed installation steps, see [Getting Started](obra/superpowers/2-getting-started.md). For understanding skills and how to use them, see [Core Concepts](obra/superpowers/3-core-concepts.md). For deep technical details, see [Architecture](obra/superpowers/4-architecture.md).

## What is Superpowers

Superpowers is a skills library for AI coding agents that transforms them from helpful assistants into systematic software engineers. It provides a complete development workflow—from brainstorming through implementation to code review—as a collection of reusable, composable "skills" that the agent automatically checks and applies.

The system consists of two parts:

1. **Plugin** - A lightweight shim (\~15KB) that manages the skills repository
2. **Skills Repository** - A separate Git repository containing 20+ process documentation files

The plugin automatically clones [obra/superpowers-skills](https://github.com/obra/superpowers/blob/a01a135f/obra/superpowers-skills) to a local directory and keeps it updated. Skills auto-invoke based on context—the agent doesn't just have access to process documentation, it's required to check for and follow relevant skills before any response or action.

**Sources:** [README.md1-16](https://github.com/obra/superpowers/blob/a01a135f/README.md#L1-L16) [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13) [RELEASE-NOTES.md408-414](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L408-L414)

## The Problem: Ad-Hoc Agent Behavior

AI coding agents are capable but inconsistent. Without structured guidance, they:

- Skip design and jump directly to implementation
- Write code first, then tests (if they write tests at all)
- Make assumptions instead of asking clarifying questions
- Rationalize away best practices under time pressure
- Lack systematic debugging approaches

Superpowers solves this by encoding proven processes as machine-readable documentation that agents must check before working. Skills aren't suggestions—they're enforced workflows.

**Sources:** [README.md1-16](https://github.com/obra/superpowers/blob/a01a135f/README.md#L1-L16) [skills/writing-skills/testing-skills-with-subagents.md1-45](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L1-L45)

## Core Architecture: Dual Repository Design

The most critical architectural decision in Superpowers v2.0 (importance: 89.35) is the **separation of the plugin from the skills repository**. This design enables:

```
```

**Diagram: Plugin as Lightweight Shim Managing Skills Repository**

### Why Separate Repositories?

| Benefit                     | Implementation                                                                |
| --------------------------- | ----------------------------------------------------------------------------- |
| **Independent Versioning**  | Skills evolve faster than plugin; v4.0.3 plugin works with any skills version |
| **Community Contributions** | Fork skills repo, create branches, submit PRs without touching plugin code    |
| **Automatic Updates**       | `initialize-skills.sh` fetches and merges skills on every session start       |
| **Fork Workflow**           | Users can fork skills repo and sync with upstream via standard Git operations |
| **No Code Deployment**      | Skills are markdown files—deploy new processes without plugin updates         |

The plugin is essentially a repository manager. It handles cloning, forking, updating, and bootstrapping the skills into agent context.

**Sources:** [RELEASE-NOTES.md408-445](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L408-L445) [README.md27-79](https://github.com/obra/superpowers/blob/a01a135f/README.md#L27-L79)

## Plugin Components and File Locations

```
```

**Diagram: File Structure and Repository Locations**

The plugin directory contains:

- [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13) - Version 4.0.3, metadata, keywords
- [.claude-plugin/hooks/](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/hooks/) - `session-start.sh` that bootstraps skills context
- [.claude-plugin/commands/](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/commands/) - Slash command redirects to skills
- [.claude-plugin/agents/code-reviewer.md1-48](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/agents/code-reviewer.md#L1-L48) - Code review subagent

Initialization happens via [lib/initialize-skills.sh](https://github.com/obra/superpowers/blob/a01a135f/lib/initialize-skills.sh) which:

1. Clones `obra/superpowers-skills` on first run
2. Offers to fork the repository (if GitHub CLI available)
3. Sets up `origin` (fork) and `upstream` (main repo) remotes
4. Fetches and auto-merges updates on every session start

**Sources:** [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13) [RELEASE-NOTES.md450-460](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L450-L460) [agents/code-reviewer.md1-5](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L5)

## Skills as Executable Process Documentation

Skills are markdown files with YAML frontmatter that describe **how** to approach a task, not just **what** to build. Each skill lives in its own directory and consists of:

| Component            | Purpose                             | Example                                                                 |
| -------------------- | ----------------------------------- | ----------------------------------------------------------------------- |
| **SKILL.md**         | Main documentation with frontmatter | `name: test-driven-development` `description: Use when writing code...` |
| **Supporting Files** | References, examples, tools         | `testing-anti-patterns.md` `find-polluter.sh`                           |
| **Subdirectories**   | Bundled techniques                  | `systematic-debugging/root-cause-tracing.md`                            |

Skills are discovered via:

- **Native Skill tool** (Claude Code) - `Skill` tool with skill name parameter
- **Custom tools** (OpenCode) - `use_skill` and `find_skills` tools
- **CLI script** (Codex) - `superpowers-codex use-skill` command

The agent receives skill content directly, not file paths to read separately.

**Sources:** [README.md100-123](https://github.com/obra/superpowers/blob/a01a135f/README.md#L100-L123) [RELEASE-NOTES.md31-41](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L31-L41)

## Multi-Platform Integration Strategy

Superpowers supports three AI platforms with different integration approaches:

```
```

**Diagram: Platform-Specific Integration Methods**

| Platform        | Integration Type              | Key Features                                                                |
| --------------- | ----------------------------- | --------------------------------------------------------------------------- |
| **Claude Code** | Native plugin via marketplace | Skill tool, session hooks, agent support, slash commands                    |
| **OpenCode.ai** | JavaScript plugin             | Custom tools, event-driven bootstrap, context persistence across compaction |
| **Codex**       | Node.js CLI script            | Unified script, tool substitution, manual AGENTS.md config                  |

All platforms share the same skills repository but invoke skills differently. Claude Code has the most mature integration; OpenCode and Codex provide equivalent functionality with platform-specific adaptations.

**Sources:** [README.md27-79](https://github.com/obra/superpowers/blob/a01a135f/README.md#L27-L79) [RELEASE-NOTES.md160-239](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L160-L239)

## Workflow Enforcement: "The Rule"

Superpowers doesn't just provide documentation—it enforces process compliance through **"The Rule"** (defined in the `using-superpowers` skill):

> **Invoke relevant or requested skills BEFORE any response or action. If even 1% chance a skill applies, you MUST invoke it.**

This mandatory first-response protocol ensures:

1. Agent checks for applicable skills before working
2. Agent loads skill content via Skill tool (or platform equivalent)
3. Agent follows skill guidance, not ad-hoc approaches
4. Agent cannot rationalize away compliance

The enforcement happens through:

- **Session bootstrap** - `using-superpowers` injected at session start via `session-start.sh`
- **Claude Search Optimization (CSO)** - Skill descriptions trigger discovery from naive prompts
- **Red flags** - Common rationalizations pre-emptively addressed
- **Rationalization tables** - Documented excuses with counters

Example rationalizations that are explicitly prevented:

- "I know what that means" → Knowing the concept ≠ using the skill
- "This is just a simple question" → Even simple tasks may have skills
- "Let me gather information first" → Check for skills FIRST

**Sources:** [RELEASE-NOTES.md7-16](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L7-L16) [RELEASE-NOTES.md260-276](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L260-L276) [skills/writing-skills/testing-skills-with-subagents.md91-124](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L91-L124)

## Complete Development Lifecycle

Superpowers orchestrates a complete workflow from idea to deployment:

```
```

**Diagram: End-to-End Workflow Orchestration**

Each phase is a quality gate enforced by skills:

1. **brainstorming** - Cannot skip to coding; must refine design first
2. **using-git-worktrees** - Isolated environment with clean baseline
3. **writing-plans** - Bite-sized tasks (2-5 min each) with verification
4. **subagent-driven-development** - Two-stage review (spec → quality)
5. **test-driven-development** - RED-GREEN-REFACTOR enforced
6. **finishing-a-development-branch** - Structured completion workflow

**Sources:** [README.md80-97](https://github.com/obra/superpowers/blob/a01a135f/README.md#L80-L97) [RELEASE-NOTES.md55-75](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L55-L75)

## Skill Hierarchy and Dependencies

Skills form a dependency hierarchy from meta-skills to specialized workflows:

| Tier                       | Skills                                                                          | Purpose                         |
| -------------------------- | ------------------------------------------------------------------------------- | ------------------------------- |
| **Tier 1: Meta**           | `using-superpowers` `writing-skills`                                            | How to use the system itself    |
| **Tier 2: Process**        | `brainstorming` `writing-plans` `executing-plans`                               | HOW to approach work            |
| **Tier 3: Implementation** | `test-driven-development` `subagent-driven-development` `systematic-debugging`  | WHAT to build and how           |
| **Tier 4: Specialized**    | `requesting-code-review` `finishing-a-development-branch` `using-git-worktrees` | Specific tasks within workflows |

**Priority system:** When multiple skills apply, process skills (Tier 2) activate BEFORE implementation skills (Tier 3). For example, "Build feature X" triggers `brainstorming` first, then domain-specific skills.

**Sources:** [README.md100-123](https://github.com/obra/superpowers/blob/a01a135f/README.md#L100-L123) [RELEASE-NOTES.md113-119](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L113-L119)

## Testing Infrastructure

Superpowers applies TDD (Test-Driven Development) to its own documentation. Skills are tested using:

```
```

**Diagram: Multi-Layer Testing Strategy**

Testing validates:

- **Skill triggering** - Skills activate from context, not explicit naming
- **Rationalization resistance** - Skills work under combined pressures
- **Integration** - Headless `claude -p` execution with transcript analysis
- **Workflows** - Complete projects (CLI tool, CRUD app) with verification

**Sources:** [RELEASE-NOTES.md93-107](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L93-L107) [skills/writing-skills/testing-skills-with-subagents.md30-41](https://github.com/obra/superpowers/blob/a01a135f/skills/writing-skills/testing-skills-with-subagents.md#L30-L41)

## Version History and Evolution

Key milestones in Superpowers development:

| Version    | Release Date | Major Changes                                                                  |
| ---------- | ------------ | ------------------------------------------------------------------------------ |
| **v4.0.3** | 2025-12-26   | Strengthened explicit skill request handling, added explicit request tests     |
| **v4.0.0** | 2025-12-17   | Two-stage code review (spec → quality), skill triggering tests, DOT flowcharts |
| **v3.5.1** | 2025-11-24   | OpenCode bootstrap refactor using `session.created`                            |
| **v3.5.0** | 2025-11-23   | OpenCode.ai support with custom tools and event handlers                       |
| **v3.3.0** | 2025-10-28   | Codex experimental support with CLI script                                     |
| **v3.0.1** | 2025-10-16   | Anthropic first-party skills system adoption                                   |
| **v2.0.0** | 2025-10-12   | **Repository separation** - plugin becomes lightweight shim                    |

The v2.0.0 release is the architectural foundation that enables everything else: independent versioning, community contributions, automatic updates, and the fork workflow.

**Sources:** [RELEASE-NOTES.md1-638](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L1-L638) [.claude-plugin/plugin.json4](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L4-L4)

## Next Steps

- For installation instructions, see [Getting Started](obra/superpowers/2-getting-started.md)
- To understand skills and The Rule, see [Core Concepts](obra/superpowers/3-core-concepts.md)
- For architectural deep dive, see [Architecture](obra/superpowers/4-architecture.md)
- For platform-specific features, see [Platform-Specific Features](obra/superpowers/5-platform-specific-features.md)
- For complete workflow documentation, see [Development Workflows](obra/superpowers/6-development-workflows.md)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Overview](#overview.md)
- [What is Superpowers](#what-is-superpowers.md)
- [The Problem: Ad-Hoc Agent Behavior](#the-problem-ad-hoc-agent-behavior.md)
- [Core Architecture: Dual Repository Design](#core-architecture-dual-repository-design.md)
- [Why Separate Repositories?](#why-separate-repositories.md)
- [Plugin Components and File Locations](#plugin-components-and-file-locations.md)
- [Skills as Executable Process Documentation](#skills-as-executable-process-documentation.md)
- [Multi-Platform Integration Strategy](#multi-platform-integration-strategy.md)
- [Workflow Enforcement: "The Rule"](#workflow-enforcement-the-rule.md)
- [Complete Development Lifecycle](#complete-development-lifecycle.md)
- [Skill Hierarchy and Dependencies](#skill-hierarchy-and-dependencies.md)
- [Testing Infrastructure](#testing-infrastructure.md)
- [Version History and Evolution](#version-history-and-evolution.md)
- [Next Steps](#next-steps.md)
