# /obra/superpowers/4.3-multi-platform-integration

Multi-Platform Integration | obra/superpowers | DeepWiki

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

# Multi-Platform Integration

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [.codex/INSTALL.md](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md)
- [.codex/superpowers-bootstrap.md](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md)
- [.codex/superpowers-codex](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex)
- [.opencode/INSTALL.md](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md)
- [.opencode/plugin/superpowers.js](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js)
- [tests/opencode/test-skills-core.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh)

## Purpose and Scope

This page documents how the superpowers system integrates with three different AI coding platforms—Claude Code, OpenCode, and Codex—while maintaining a single shared skills repository. It covers the platform-specific integration mechanisms, shared infrastructure, bootstrap strategies, and tool mapping patterns that enable consistent skill functionality across platforms.

For skills repository management details, see [Skills Repository Management](obra/superpowers/4.2-skills-repository-management.md). For session lifecycle and bootstrap content injection, see [Session Lifecycle and Bootstrap](obra/superpowers/4.4-session-lifecycle-and-bootstrap.md).

---

## Integration Architecture

The superpowers system achieves platform independence through a three-layer architecture: platform-specific adapters, shared core logic, and a unified skills repository.

### Code-Level Integration Architecture

```
```

**Sources:** [.opencode/plugin/superpowers.js1-234](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L1-L234) [.codex/superpowers-codex1-268](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L1-L268) [lib/skills-core.js1-209](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L209)

---

## Shared Infrastructure

All three platform implementations share common components to eliminate code duplication and ensure consistent skill resolution behavior.

### skills-core.js Module

The `lib/skills-core.js` module provides ES module functions used by both OpenCode and Codex for skill discovery, frontmatter parsing, and path resolution.

#### Core Functions

| Function                                                   | Implementation Location                                                                                     | Return Type                                               | Purpose                                            |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| `extractFrontmatter(filePath)`                             | [lib/skills-core.js16-52](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L16-L52)     | `{name: string, description: string}`                     | Parse YAML frontmatter from SKILL.md files         |
| `stripFrontmatter(content)`                                | [lib/skills-core.js178-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L178-L200) | `string`                                                  | Remove frontmatter delimiters, return content only |
| `findSkillsInDir(dir, sourceType, maxDepth)`               | [lib/skills-core.js62-97](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L62-L97)     | `Array<{path, skillFile, name, description, sourceType}>` | Recursively discover skills with metadata          |
| `resolveSkillPath(skillName, superpowersDir, personalDir)` | [lib/skills-core.js108-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L108-L140) | `{skillFile, sourceType, skillPath} \| null`              | Resolve skill name with shadowing support          |
| `checkForUpdates(repoDir)`                                 | [lib/skills-core.js148-170](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L148-L170) | `boolean`                                                 | Git fetch + status check (3s timeout)              |

**Algorithm details:**

- `extractFrontmatter`: Parses lines between `---` delimiters, matches `key: value` pairs for `name` and `description` fields
- `findSkillsInDir`: Recurses up to `maxDepth`, checks for `SKILL.md` in each directory
- `resolveSkillPath`: Checks personal directory first (unless `superpowers:` prefix), falls back to superpowers directory
- `checkForUpdates`: Uses `execSync('git fetch origin && git status --porcelain=v1 --branch')`, parses for `[behind ]` string

**Sources:** [lib/skills-core.js1-209](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L209) [tests/opencode/test-skills-core.sh1-441](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L1-L441)

#### Skill Resolution Logic

```
```

**Sources:** [lib/skills-core.js99-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L99-L140) [tests/opencode/test-skills-core.sh248-363](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L248-L363)

### initialize-skills.sh

The `lib/initialize-skills.sh` script manages the skills repository lifecycle: cloning on first install, offering fork creation, and checking for updates on session start. Used by Claude Code via the polyglot wrapper.

**Sources:** [RELEASE-NOTES.md449-461](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L449-L461)

---

## Claude Code Integration

Claude Code uses native plugin mechanisms with hooks, slash commands, and the polyglot wrapper pattern for cross-platform compatibility.

### Plugin Structure

```
```

**Sources:** [.claude-plugin/plugin.json1-14](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L14) [RELEASE-NOTES.md25-29](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L25-L29)

### Hooks System

Claude Code invokes hooks at specific lifecycle events. The `session-start.sh` hook is registered in `.claude-plugin/hooks.json` and runs at the beginning of each session.

#### session-start.sh Workflow

[hooks/session-start.sh](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh) is invoked via [hooks/run-hook.cmd](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd) which provides cross-platform compatibility. The hook:

1. Sources `lib/initialize-skills.sh` to ensure skills repository is up-to-date
2. Sets `SUPERPOWERS_SKILLS_ROOT` environment variable
3. Loads `using-superpowers/SKILL.md` content for bootstrap injection
4. Displays available skills list to agent
5. Shows update status (success/behind upstream)

**Sources:** [RELEASE-NOTES.md513-520](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L513-L520) [.claude-plugin/marketplace.json1-21](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json#L1-L21)

### Polyglot Wrapper Pattern

The `hooks/run-hook.cmd` file uses a polyglot pattern—valid as both Windows CMD and Unix bash—to enable hook scripts to run on all platforms.

#### run-hook.cmd Structure

```
```

The polyglot wrapper uses CMD-specific syntax (`@echo off`, `%*`) in a comment block for bash, and bash-specific syntax (`#!/bin/bash`, `$0`) in a CMD label/comment block. When executed:

- **Windows CMD**: Executes `@echo off` and jumps to `:windows` label, which calls `bash` to re-execute the file
- **Unix bash**: Ignores CMD commands (treated as syntax errors that evaluate to no-op), executes bash shebang

**Sources:** [RELEASE-NOTES.md141-145](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L141-L145)

### Slash Commands

Claude Code provides three slash commands that redirect to the native Skill tool:

| Command         | Skill Invoked                 | Purpose                          |
| --------------- | ----------------------------- | -------------------------------- |
| `/brainstorm`   | `superpowers:brainstorming`   | Launch brainstorming workflow    |
| `/write-plan`   | `superpowers:writing-plans`   | Create implementation plan       |
| `/execute-plan` | `superpowers:executing-plans` | Execute plan in parallel session |

All commands have `disable-model-invocation: true` flag, restricting them to manual user invocation only. Agents use the Skill tool directly to invoke skills autonomously.

**Sources:** [RELEASE-NOTES.md25-29](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L25-L29) [RELEASE-NOTES.md37-41](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L37-L41)

---

## OpenCode Integration

OpenCode uses a JavaScript plugin with custom tools and event-driven bootstrap injection.

### OpenCode Plugin Code Structure

```
```

**Key implementation details:**

- **Plugin entry point**: `SuperpowersPlugin` async function exports `tool` object and `event` handler [.opencode/plugin/superpowers.js32-234](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L32-L234)
- **Path resolution**: Derives `superpowersSkillsDir` from plugin location using `path.resolve(__dirname, '../../skills')` [.opencode/plugin/superpowers.js36](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L36-L36)
- **Config directory**: Respects `OPENCODE_CONFIG_DIR` environment variable, falls back to `~/.config/opencode` [.opencode/plugin/superpowers.js38-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L38-L40)
- **Tool registration**: Uses `tool()` wrapper from `@opencode-ai/plugin/tool` with `description` and `args` schema [.opencode/plugin/superpowers.js99-100](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L99-L100)
- **Event extraction**: Gets `sessionID` from multiple possible event property paths [.opencode/plugin/superpowers.js211-215](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L211-L215)

**Sources:** [.opencode/plugin/superpowers.js1-234](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L1-L234) [.opencode/INSTALL.md1-136](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L1-L136)

### Custom Tools

OpenCode agents access skills via two custom tools registered in [.opencode/plugin/superpowers.js80-189](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L80-L189)

#### use\_skill Tool

The `use_skill` tool loads a skill and injects it into session context for persistence across compaction events.

**Function signature:**

```
```

**Implementation location:** [.opencode/plugin/superpowers.js99-166](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L99-L166)

**Resolution algorithm:**

```
1. Extract actualSkillName:
   - If starts with "project:" → forceProject = true, strip prefix
   - Otherwise → forceProject = false, use as-is

2. Check project skills (if forceProject OR no "superpowers:" prefix):
   - Path: projectSkillsDir + actualSkillName + "/SKILL.md"
   - If exists → return {skillFile, sourceType: 'project', skillPath}

3. Fall back to personal/superpowers (if !forceProject):
   - Call skillsCore.resolveSkillPath(skill_name, superpowersSkillsDir, personalSkillsDir)
   - Returns: {skillFile, sourceType: 'personal'|'superpowers', skillPath} or null

4. If not resolved → return error message
```

**Injection mechanism:**

```
```

This uses `noReply: true` with `synthetic: true` parts to insert skill content as user messages that persist across context compaction [.opencode/plugin/superpowers.js147-159](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L147-L159)

**Sources:** [.opencode/plugin/superpowers.js99-166](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L99-L166) [RELEASE-NOTES.md165-167](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L165-L167)

#### find\_skills Tool

The `find_skills` tool lists all available skills in priority order: project → personal → superpowers.

**Implementation location:** [.opencode/plugin/superpowers.js167-207](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L167-L207)

**Discovery algorithm:**

```
```

**Namespace assignment:**

```
```

**Output format:**

```
Available skills:

project:my-project-skill
  Project-specific workflow
  Directory: /path/to/project/.opencode/skills/my-project-skill

my-personal-skill
  Personal skill description
  Directory: /home/user/.config/opencode/skills/my-personal-skill

superpowers:brainstorming
  Use when starting any creative work...
  Directory: /plugin/path/skills/brainstorming
```

**Sources:** [.opencode/plugin/superpowers.js167-207](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L167-L207)

### Event-Driven Bootstrap

OpenCode injects bootstrap content at two lifecycle events to ensure `using-superpowers` skill persists across context compaction.

#### Bootstrap Injection Flow

```
```

**Implementation details:**

- **getSessionID()**: Extracts session ID from `event.properties?.info?.id || event.properties?.sessionID || event.session?.id` [.opencode/plugin/superpowers.js211-215](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L211-L215)
- **session.created handler**: Checks `event.type === 'session.created'`, calls `injectBootstrap(sessionID, false)` [.opencode/plugin/superpowers.js218-222](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L218-L222)
- **session.compacted handler**: Checks `event.type === 'session.compacted'`, calls `injectBootstrap(sessionID, true)` [.opencode/plugin/superpowers.js226-230](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L226-L230)
- **Bootstrap content generation**: Reads `using-superpowers/SKILL.md`, strips frontmatter, wraps in `<EXTREMELY_IMPORTANT>` tags with tool mapping [.opencode/plugin/superpowers.js43-76](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L43-L76)
- **Compact mode**: Uses shorter tool mapping text when `compact=true` [.opencode/plugin/superpowers.js50-53](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L50-L53)

**Sources:** [.opencode/plugin/superpowers.js43-95](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L43-L95) [.opencode/plugin/superpowers.js209-232](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L209-L232) [RELEASE-NOTES.md148-157](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L148-L157)

### Tool Mapping

OpenCode provides different tools than Claude Code, so the bootstrap content includes tool mapping instructions:

| Claude Code Tool                | OpenCode Equivalent     | Usage              |
| ------------------------------- | ----------------------- | ------------------ |
| `Skill`                         | `use_skill` custom tool | Load skills        |
| `TodoWrite`                     | `update_plan`           | Task tracking      |
| `Task` with subagents           | `@mention` syntax       | Dispatch subagents |
| `Read`, `Write`, `Edit`, `Bash` | Native OpenCode tools   | File operations    |

**Sources:** [.opencode/plugin/superpowers.js32-47](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L32-L47)

---

## Codex Integration

Codex uses a unified Node.js CLI script that provides all functionality through subcommands.

### Codex CLI Code Structure

```
```

**Key implementation details:**

- **Path constants**: Set at module level using `path.join(homeDir, '.codex', ...)` [.codex/superpowers-codex9-13](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L9-L13)
- **Skills core import**: Uses `require('../lib/skills-core')` with CommonJS interop [.codex/superpowers-codex6](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L6-L6)
- **CLI dispatch**: Uses `switch(command)` statement on `process.argv[2]` [.codex/superpowers-codex245-267](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L245-L267)
- **Namespace handling**: Strips `superpowers:` prefix with `skillName.substring('superpowers:'.length)` [.codex/superpowers-codex140-146](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L140-L146)

**Sources:** [.codex/superpowers-codex1-268](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L1-L268)

### Command Reference

#### bootstrap Command

The `runBootstrap()` function performs complete session initialization [.codex/superpowers-codex72-124](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L72-L124)

**Execution flow:**

```
```

**File dependencies:**

- `bootstrapFile` = `~/.codex/superpowers/.codex/superpowers-bootstrap.md` [.codex/superpowers-codex12](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L12-L12)
- `superpowersRepoDir` = `~/.codex/superpowers` [.codex/superpowers-codex13](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L13-L13)

**Usage:**

```
```

**Sources:** [.codex/superpowers-codex72-124](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L72-L124) [.codex/superpowers-bootstrap.md1-33](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L1-L33)

#### use-skill Command

The `runUseSkill(skillName)` function loads and displays a specific skill [.codex/superpowers-codex126-239](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L126-L239)

**Resolution algorithm:**

```
```

**Helper function `findSkillFile(searchPath)`** [.codex/superpowers-codex154-167](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L154-L167):

- Checks for `SKILL.md` in directory: `path.join(searchPath, 'SKILL.md')`
- Checks if path itself is `SKILL.md` file: `searchPath.endsWith('SKILL.md')`
- Returns path or null

**Usage:**

```
```

**Sources:** [.codex/superpowers-codex126-239](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L126-L239) [.codex/superpowers-codex154-167](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L154-L167)

#### find-skills Command

The `runFindSkills()` function lists all available skills [.codex/superpowers-codex37-70](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L37-L70)

**Discovery algorithm:**

```
```

**Helper function `printSkill(skillPath, sourceType)`** [.codex/superpowers-codex16-34](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L16-L34):

```
```

**Output example:**

```
Available skills:
==================

my-custom-skill
  Personal skill description

superpowers:brainstorming
  Use when starting any creative work...
```

**Sources:** [.codex/superpowers-codex37-70](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L37-L70) [.codex/superpowers-codex16-34](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L16-L34)

### Tool Substitution

Codex has different tools than Claude Code, so the bootstrap instructions provide tool mapping guidance.

**Tool mapping from `.codex/superpowers-bootstrap.md`** [.codex/superpowers-bootstrap.md9-15](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L9-L15):

| Claude Code Skill Reference     | Codex Equivalent                                          | Implementation Notes                  |
| ------------------------------- | --------------------------------------------------------- | ------------------------------------- |
| `TodoWrite` tool                | `update_plan` tool                                        | Codex's native planning/task tracking |
| `Task` tool (subagents)         | Manual work by agent                                      | Subagents not available yet in Codex  |
| `Skill` tool                    | `~/.codex/superpowers/.codex/superpowers-codex use-skill` | CLI command execution                 |
| `Read`, `Write`, `Edit`, `Bash` | Native Codex tools                                        | Use equivalent file operation tools   |

**Critical rules from bootstrap** [.codex/superpowers-bootstrap.md21-27](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L21-L27):

```
```

**Sources:** [.codex/superpowers-bootstrap.md1-33](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L1-L33) [RELEASE-NOTES.md217-239](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L217-L239)

### Installation and Activation

Codex requires manual bootstrap invocation in `~/.codex/AGENTS.md`:

```
```

**Sources:** [.codex/INSTALL.md19-26](https://github.com/obra/superpowers/blob/a01a135f/.codex/INSTALL.md#L19-L26)

---

## Bootstrap Comparison

Each platform injects the `using-superpowers` skill content at session start using different mechanisms.

### Bootstrap Mechanisms by Platform

| Platform        | Trigger                    | Mechanism                                      | Persistence                           | Content Source                                                          |
| --------------- | -------------------------- | ---------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| **Claude Code** | `session-start.sh` hook    | Hook script executes, outputs to stdout        | Claude Code handles injection         | `hooks/session-start.sh` loads from `$SUPERPOWERS_SKILLS_ROOT`          |
| **OpenCode**    | `session.created` event    | `client.session.prompt()` with `noReply: true` | Synthetic message survives compaction | `getBootstrapContent()` reads from resolved skills directory            |
| **Codex**       | Manual `AGENTS.md` trigger | CLI command outputs to stdout                  | Agent copies into context             | `superpowers-codex bootstrap` reads from `~/.codex/superpowers/skills/` |

### Re-injection After Compaction

| Platform        | Re-injection Support   | Mechanism                                                  |
| --------------- | ---------------------- | ---------------------------------------------------------- |
| **Claude Code** | No re-injection needed | Native persistence by platform                             |
| **OpenCode**    | Yes                    | `session.compacted` event → compact bootstrap re-injection |
| **Codex**       | No automatic mechanism | Agent must re-run bootstrap command if needed              |

**Sources:** [RELEASE-NOTES.md150-157](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L150-L157) [.opencode/plugin/superpowers.js60-77](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L60-L77) [.opencode/plugin/superpowers.js206-212](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L206-L212)

---

## Path Resolution and Namespacing

All three platforms use consistent namespace prefixes to identify skill sources, though path locations differ.

### Skills Directory Locations

```
```

### Namespace Resolution Rules

All platforms follow consistent priority order, though Claude Code lacks project-level skills:

1. **Project skills** (OpenCode only): `project:skill-name` → `.opencode/skills/skill-name/SKILL.md`
2. **Personal skills**: `skill-name` → personal directory
3. **Superpowers skills**: `superpowers:skill-name` → superpowers directory

**Shadowing behavior:**

- Personal skills override superpowers skills when names match
- Explicit `superpowers:` prefix bypasses shadowing, forces superpowers directory
- `project:` prefix (OpenCode) forces project directory

**Sources:** [.opencode/plugin/superpowers.js89-112](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L89-L112) [.codex/superpowers-codex126-199](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L126-L199) [lib/skills-core.js108-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L108-L140)

### Skill File Structure

All platforms expect consistent directory structure:

```
skill-name/
├── SKILL.md              # Required: main skill content with YAML frontmatter
├── supporting-file.md    # Optional: referenced from SKILL.md
├── example.ts            # Optional: code examples
└── helper-script.sh      # Optional: automation scripts
```

**YAML frontmatter format:**

```
```

**Sources:** [lib/skills-core.js6-15](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L6-L15) [lib/skills-core.js16-52](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L16-L52)

---

## Summary

The multi-platform integration architecture achieves three goals:

1. **Code reuse**: `lib/skills-core.js` eliminates duplication between OpenCode and Codex
2. **Platform optimization**: Each platform uses native mechanisms (hooks for Claude Code, events for OpenCode, CLI for Codex)
3. **Consistent behavior**: Skill resolution, namespacing, and shadowing work identically across platforms

The polyglot wrapper pattern (Claude Code) and event-driven re-injection (OpenCode) demonstrate platform-specific solutions to cross-platform compatibility and context persistence challenges.

**Sources:** [RELEASE-NOTES.md160-188](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L160-L188) [RELEASE-NOTES.md174-181](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L174-L181)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Multi-Platform Integration](#multi-platform-integration.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Integration Architecture](#integration-architecture.md)
- [Code-Level Integration Architecture](#code-level-integration-architecture.md)
- [Shared Infrastructure](#shared-infrastructure.md)
- [skills-core.js Module](#skills-corejs-module.md)
- [Core Functions](#core-functions.md)
- [Skill Resolution Logic](#skill-resolution-logic.md)
- [initialize-skills.sh](#initialize-skillssh.md)
- [Claude Code Integration](#claude-code-integration.md)
- [Plugin Structure](#plugin-structure.md)
- [Hooks System](#hooks-system.md)
- [session-start.sh Workflow](#session-startsh-workflow.md)
- [Polyglot Wrapper Pattern](#polyglot-wrapper-pattern.md)
- [run-hook.cmd Structure](#run-hookcmd-structure.md)
- [Slash Commands](#slash-commands.md)
- [OpenCode Integration](#opencode-integration.md)
- [OpenCode Plugin Code Structure](#opencode-plugin-code-structure.md)
- [Custom Tools](#custom-tools.md)
- [use\_skill Tool](#use_skill-tool.md)
- [find\_skills Tool](#find_skills-tool.md)
- [Event-Driven Bootstrap](#event-driven-bootstrap.md)
- [Bootstrap Injection Flow](#bootstrap-injection-flow.md)
- [Tool Mapping](#tool-mapping.md)
- [Codex Integration](#codex-integration.md)
- [Codex CLI Code Structure](#codex-cli-code-structure.md)
- [Command Reference](#command-reference.md)
- [bootstrap Command](#bootstrap-command.md)
- [use-skill Command](#use-skill-command.md)
- [find-skills Command](#find-skills-command.md)
- [Tool Substitution](#tool-substitution.md)
- [Installation and Activation](#installation-and-activation.md)
- [Bootstrap Comparison](#bootstrap-comparison.md)
- [Bootstrap Mechanisms by Platform](#bootstrap-mechanisms-by-platform.md)
- [Re-injection After Compaction](#re-injection-after-compaction.md)
- [Path Resolution and Namespacing](#path-resolution-and-namespacing.md)
- [Skills Directory Locations](#skills-directory-locations.md)
- [Namespace Resolution Rules](#namespace-resolution-rules.md)
- [Skill File Structure](#skill-file-structure.md)
- [Summary](#summary.md)
