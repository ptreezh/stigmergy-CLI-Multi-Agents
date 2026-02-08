# /obra/superpowers/3.3-finding-and-invoking-skills

Finding and Invoking Skills | obra/superpowers | DeepWiki

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

# Finding and Invoking Skills

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [.opencode/INSTALL.md](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md)
- [.opencode/plugin/superpowers.js](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js)
- [skills/using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md)
- [tests/opencode/test-skills-core.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh)

This page explains the mechanisms for discovering available skills and invoking them in agent sessions. It covers the three-tier skill resolution system (project > personal > superpowers), platform-specific invocation tools, and skill namespacing conventions.

For the mandatory protocol that governs when skills must be invoked, see [3.2](obra/superpowers/3.2-the-rule:-mandatory-first-response-protocol.md). For skill categories and priorities (process vs implementation), see [3.1](obra/superpowers/3.1-what-are-skills.md). For the bootstrap mechanism that makes skills available at session start, see [4.4](obra/superpowers/4.4-session-lifecycle-and-bootstrap.md).

---

## Skill Discovery Mechanisms

Skills become available through bootstrap injection at session start. The `using-superpowers` skill is automatically loaded, establishing the mandatory checking protocol. All other skills are discovered on-demand through platform-specific tools.

### Bootstrap Content Injection

Each platform injects the `using-superpowers` skill content at session initialization:

```
```

**Sources:** [.opencode/plugin/superpowers.js24-58](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L24-L58) [.opencode/plugin/superpowers.js199-204](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L199-L204) [RELEASE-NOTES.md150-157](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L150-L157)

### Discovery Tools by Platform

Each platform provides tools for querying available skills:

| Platform        | Discovery Tool                  | Implementation                                                                                        | Output Format                         |
| --------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Claude Code** | Native `Skill` tool with search | Built-in platform feature                                                                             | Skill descriptions searchable by tool |
| **OpenCode**    | `find_skills` custom tool       | [superpowers.js148-188](https://github.com/obra/superpowers/blob/a01a135f/superpowers.js#L148-L188)   | List with namespaces and descriptions |
| **Codex**       | `superpowers-codex find-skills` | [superpowers-codex37-70](https://github.com/obra/superpowers/blob/a01a135f/superpowers-codex#L37-L70) | List with namespaces and descriptions |

**Sources:** [.opencode/plugin/superpowers.js148-188](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L148-L188) [.codex/superpowers-codex37-70](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L37-L70) [RELEASE-NOTES.md25-42](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L25-L42)

---

## Skill Namespacing and Resolution

Skills are organized in three tiers with explicit namespace prefixes controlling resolution priority.

### Namespace Prefixes

```
```

**Sources:** [.opencode/plugin/superpowers.js89-112](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L89-L112) [lib/skills-core.js108-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L108-L140) [.codex/superpowers-codex126-199](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L126-L199)

### Resolution Implementation

The `resolveSkillPath` function implements priority resolution:

```
```

**Example resolution paths:**

| Skill Name                | Personal Exists | Superpowers Exists | Resolved To                        |
| ------------------------- | --------------- | ------------------ | ---------------------------------- |
| `brainstorming`           | No              | Yes                | `superpowers:brainstorming`        |
| `my-workflow`             | Yes             | No                 | `my-workflow` (personal)           |
| `shared-name`             | Yes             | Yes                | `shared-name` (personal)           |
| `superpowers:shared-name` | Yes             | Yes                | `superpowers:shared-name` (forced) |

**Sources:** [lib/skills-core.js99-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L99-L140) [tests/opencode/test-skills-core.sh248-363](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L248-L363)

### Directory Structure

```
```

**Sources:** [.opencode/plugin/superpowers.js18-22](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L18-L22) [.codex/superpowers-codex9-13](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L9-L13) [RELEASE-NOTES.md163-173](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L163-L173)

---

## Skill Invocation Methods

### Explicit Invocation by Platform

Each platform provides specific mechanisms for explicitly loading skills:

```
```

**Sources:** [RELEASE-NOTES.md25-42](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L25-L42) [.opencode/plugin/superpowers.js81-147](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L81-L147) [.codex/superpowers-codex126-238](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L126-L238)

#### Claude Code: Skill Tool

The native `Skill` tool loads skill content directly:

```
Skill tool arguments:
- skill: "superpowers:brainstorming"
```

The tool reads the skill file and provides content to the agent. No separate file reading is required.

Slash commands provide shortcuts for common workflows:

| Command         | Maps To                       | User-Only                            |
| --------------- | ----------------------------- | ------------------------------------ |
| `/brainstorm`   | `superpowers:brainstorming`   | Yes (disable-model-invocation: true) |
| `/write-plan`   | `superpowers:writing-plans`   | Yes                                  |
| `/execute-plan` | `superpowers:executing-plans` | Yes                                  |

**Sources:** [RELEASE-NOTES.md7-29](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L7-L29) [RELEASE-NOTES.md244-251](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L244-L251) [.claude-plugin/plugin.json1-13](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L13)

#### OpenCode: use\_skill Tool

The `use_skill` custom tool executes the following workflow:

1. Parse `skill_name` argument for namespace prefix
2. Call `resolveSkillPath()` with priority: project > personal > superpowers
3. Read skill file from resolved path
4. Extract frontmatter using `extractFrontmatter()`
5. Strip frontmatter using `stripFrontmatter()`
6. Inject skill content via `client.session.prompt()` with `noReply: true`
7. Return launch confirmation message

```
```

**Sources:** [.opencode/plugin/superpowers.js81-147](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L81-L147) [lib/skills-core.js99-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L99-L140) [lib/skills-core.js16-52](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L16-L52)

#### Codex: CLI Command

The `superpowers-codex` script outputs skill content to stdout:

```
```

**Output format:**

```
# brainstorming
# Use when [description from frontmatter]
# Skill-specific tools and reference files live in /path/to/skill/dir
# ============================================

[Skill content without frontmatter]
```

**Sources:** [.codex/superpowers-codex126-238](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L126-L238) [.codex/superpowers-bootstrap.md1-33](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L1-L33)

### Automatic Invocation Protocol

The `using-superpowers` skill establishes mandatory checking:

```
```

**Red flags that trigger forced invocation:**

- "I know what that means" → Must invoke anyway
- "Just try changing..." → Must invoke systematic-debugging
- "Skip formalities" → Must follow complete workflow
- "Quick fix for now" → Must invoke proper skill

**Sources:** [RELEASE-NOTES.md7-16](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L7-L16) [RELEASE-NOTES.md260-276](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L260-L276) [RELEASE-NOTES.md113-120](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L113-L120)

---

## Skill Metadata and Frontmatter

### SKILL.md Format

Every skill file follows this structure:

```
```

The frontmatter uses YAML format with two required fields:

| Field         | Purpose                                        | Example                                                 |
| ------------- | ---------------------------------------------- | ------------------------------------------------------- |
| `name`        | Skill identifier (lowercase kebab-case)        | `brainstorming`                                         |
| `description` | Trigger-only description (no workflow details) | `Use when starting creative work - explores approaches` |

**Sources:** [lib/skills-core.js6-52](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L6-L52) [RELEASE-NOTES.md107-112](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L107-L112) [RELEASE-NOTES.md329-336](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L329-L336)

### Metadata Extraction

The `extractFrontmatter()` function parses YAML frontmatter:

```
```

The `stripFrontmatter()` function removes frontmatter for content display:

```
```

**Sources:** [lib/skills-core.js16-52](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L16-L52) [lib/skills-core.js173-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L173-L200) [tests/opencode/test-skills-core.sh18-132](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L18-L132)

---

## Skill Discovery API

### findSkillsInDir Function

The `findSkillsInDir()` function recursively discovers skills:

```
```

**Default maximum depth:** 3 levels

**Output structure:**

```
```

**Sources:** [lib/skills-core.js54-97](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L54-L97) [tests/opencode/test-skills-core.sh134-246](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L134-L246) [.opencode/plugin/superpowers.js152-154](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L152-L154)

---

## Platform-Specific Tool Mapping

Skills reference tools that may not exist on all platforms. The bootstrap injection includes tool mapping instructions:

### Tool Substitution Table

| Skill Tool Reference            | Claude Code         | OpenCode                | Codex                         |
| ------------------------------- | ------------------- | ----------------------- | ----------------------------- |
| `Skill` tool                    | Native `Skill` tool | `use_skill` custom tool | `superpowers-codex use-skill` |
| `TodoWrite`                     | Native `TodoWrite`  | `update_plan`           | `update_plan`                 |
| `Task` (subagents)              | Native `Task` tool  | `@mention` syntax       | Manual work (no subagents)    |
| `Read`, `Write`, `Edit`, `Bash` | Native tools        | Native tools            | Native tools                  |

The tool mapping is injected during bootstrap:

**OpenCode example:**

```
```

**Codex example:**

```
```

**Sources:** [.opencode/plugin/superpowers.js36-47](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L36-L47) [.codex/superpowers-bootstrap.md6-14](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L6-L14) [RELEASE-NOTES.md218-233](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L218-L233)

---

## Complete Invocation Workflow

### End-to-End Skill Loading

```
```

**Sources:** [.opencode/plugin/superpowers.js81-147](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L81-L147) [lib/skills-core.js99-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L99-L140) [.codex/superpowers-codex126-238](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L126-L238)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Finding and Invoking Skills](#finding-and-invoking-skills.md)
- [Skill Discovery Mechanisms](#skill-discovery-mechanisms.md)
- [Bootstrap Content Injection](#bootstrap-content-injection.md)
- [Discovery Tools by Platform](#discovery-tools-by-platform.md)
- [Skill Namespacing and Resolution](#skill-namespacing-and-resolution.md)
- [Namespace Prefixes](#namespace-prefixes.md)
- [Resolution Implementation](#resolution-implementation.md)
- [Directory Structure](#directory-structure.md)
- [Skill Invocation Methods](#skill-invocation-methods.md)
- [Explicit Invocation by Platform](#explicit-invocation-by-platform.md)
- [Claude Code: Skill Tool](#claude-code-skill-tool.md)
- [OpenCode: use\_skill Tool](#opencode-use_skill-tool.md)
- [Codex: CLI Command](#codex-cli-command.md)
- [Automatic Invocation Protocol](#automatic-invocation-protocol.md)
- [Skill Metadata and Frontmatter](#skill-metadata-and-frontmatter.md)
- [SKILL.md Format](#skillmd-format.md)
- [Metadata Extraction](#metadata-extraction.md)
- [Skill Discovery API](#skill-discovery-api.md)
- [findSkillsInDir Function](#findskillsindir-function.md)
- [Platform-Specific Tool Mapping](#platform-specific-tool-mapping.md)
- [Tool Substitution Table](#tool-substitution-table.md)
- [Complete Invocation Workflow](#complete-invocation-workflow.md)
- [End-to-End Skill Loading](#end-to-end-skill-loading.md)
