# /obra/superpowers/5.2-opencode:-plugin-and-custom-tools

OpenCode: Plugin and Custom Tools | obra/superpowers | DeepWiki

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

# OpenCode: Plugin and Custom Tools

Relevant source files

- [.opencode/INSTALL.md](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md)
- [.opencode/plugin/superpowers.js](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js)
- [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js)
- [tests/opencode/test-skills-core.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh)

This page documents the OpenCode.ai platform-specific implementation of superpowers. It covers the JavaScript plugin architecture, custom tools (`use_skill` and `find_skills`), event-driven bootstrap injection, and session persistence mechanisms. For Claude Code platform features, see [5.1](obra/superpowers/5.1-claude-code:-skill-tool-and-hooks.md). For Codex CLI implementation, see [5.3](obra/superpowers/5.3-codex:-cli-tool.md). For the shared `skills-core.js` module used by both OpenCode and Codex, see [5.4](obra/superpowers/5.4-skills-core.js-shared-module.md).

## Plugin Architecture Overview

The OpenCode plugin is implemented as an ES module in [.opencode/plugin/superpowers.js](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js) that exports the `SuperpowersPlugin` async function. This function receives the OpenCode `client` API and project `directory` as parameters, then returns an object with `tool` and `event` properties.

### Plugin Entry Point and Module Structure

The plugin exports the `SuperpowersPlugin` function at [.opencode/plugin/superpowers.js32-234](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L32-L234) The plugin is registered by symlinking into `~/.config/opencode/plugin/superpowers.js`, allowing OpenCode's plugin discovery system to load it at startup.

**SuperpowersPlugin Function Signature:**

```
```

**Module Dependencies:**

| Import             | Source                     | Purpose                   |
| ------------------ | -------------------------- | ------------------------- |
| `path`, `fs`, `os` | Node.js builtins           | File system operations    |
| `fileURLToPath`    | `url`                      | ES module path resolution |
| `tool`             | `@opencode-ai/plugin/tool` | Tool definition schema    |
| `* as skillsCore`  | `../../lib/skills-core.js` | Shared skill utilities    |

**Plugin Lifecycle and Component Registration:**

```
```

**Sources:** [.opencode/plugin/superpowers.js1-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L1-L40)

### Directory Resolution Strategy

The plugin resolves three skill directory paths in [.opencode/plugin/superpowers.js33-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L33-L40):

**Directory Resolution Code Flow:**

| Variable               | Value                                                      | Line | Priority    |
| ---------------------- | ---------------------------------------------------------- | ---- | ----------- |
| `homeDir`              | `os.homedir()`                                             | 33   | N/A         |
| `projectSkillsDir`     | `path.join(directory, '.opencode/skills')`                 | 34   | Highest (1) |
| `superpowersSkillsDir` | `path.resolve(__dirname, '../../skills')`                  | 36   | Lowest (3)  |
| `envConfigDir`         | `normalizePath(process.env.OPENCODE_CONFIG_DIR, homeDir)`  | 38   | If set      |
| `configDir`            | `envConfigDir \|\| path.join(homeDir, '.config/opencode')` | 39   | Default     |
| `personalSkillsDir`    | `path.join(configDir, 'skills')`                           | 40   | Middle (2)  |

**normalizePath Function:** [.opencode/plugin/superpowers.js17-30](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L17-L30) normalizes paths by trimming whitespace, expanding `~` to home directory, and resolving to absolute paths.

**Key Implementation Details:**

1. **Project Skills:** Resolved relative to OpenCode's `directory` parameter (the opened project)
2. **Superpowers Skills:** Resolved relative to plugin's `__dirname` using `path.resolve(__dirname, '../../skills')`, which works for both symlinked and local plugin installations
3. **Personal Skills:** Respects `OPENCODE_CONFIG_DIR` environment variable if set, otherwise defaults to `~/.config/opencode/skills/`

**Sources:** [.opencode/plugin/superpowers.js17-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L17-L40) [.opencode/INSTALL.md14-24](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L14-L24)

## Custom Tools

The plugin provides two custom tools that agents can invoke to discover and load skills.

### use\_skill Tool

The `use_skill` tool is defined at [.opencode/plugin/superpowers.js99-166](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L99-L166) using the `@opencode-ai/plugin/tool` schema. It loads a specific skill by name and injects it into the conversation context with persistence across compaction.

**Tool Definition Schema:**

```
```

**use\_skill Execution Flow with Code Symbols:**

```
```

**Key Implementation Details:**

1. **Namespace Prefix Parsing** [.opencode/plugin/superpowers.js109-110](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L109-L110):

   - `forceProject = skill_name.startsWith('project:')`
   - `actualSkillName = forceProject ? skill_name.replace(/^project:/, '') : skill_name`

2. **Project Skills Resolution** [.opencode/plugin/superpowers.js115-125](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L115-L125):

   ```
   ```

3. **Fallback to skills-core Resolution** [.opencode/plugin/superpowers.js128-130](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L128-L130):

   - Calls `skillsCore.resolveSkillPath()` which checks personal → superpowers
   - Only called if project lookup failed and `forceProject` is false

4. **Frontmatter Extraction** [.opencode/plugin/superpowers.js136-138](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L136-L138):

   ```
   ```

5. **Session Injection with Persistence** [.opencode/plugin/superpowers.js147-158](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L147-L158):

   ```
   ```

6. **Error Handling** [.opencode/plugin/superpowers.js132-134](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L132-L134): Returns error message if skill not found, suggesting use of `find_skills` tool.

**Sources:** [.opencode/plugin/superpowers.js99-166](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L99-L166) [lib/skills-core.js108-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L108-L140)

### find\_skills Tool

The `find_skills` tool is defined at [.opencode/plugin/superpowers.js167-208](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L167-L208) with no arguments. It recursively scans all three skill directories and returns a formatted list with namespace prefixes and descriptions.

**Tool Definition Schema:**

```
```

**find\_skills Execution Flow with Code Symbols:**

```
```

**Key Implementation Details:**

1. **Parallel Directory Scanning** [.opencode/plugin/superpowers.js171-173](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L171-L173):

   ```
   ```

   - Each call to `findSkillsInDir` returns `Array<{path, skillFile, name, description, sourceType}>`
   - `maxDepth: 3` allows skills nested up to 3 directories deep

2. **Array Merge Preserving Priority** [.opencode/plugin/superpowers.js176](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L176-L176):

   ```
   ```

   - Does NOT deduplicate - shows all skills even if names conflict
   - Order matters: project skills listed first, then personal, then superpowers

3. **Namespace Prefix Assignment** [.opencode/plugin/superpowers.js186-195](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L186-L195):

   ```
   ```

4. **Output Formatting** [.opencode/plugin/superpowers.js196-202](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L196-L202):

   ```
   ```

**Sources:** [.opencode/plugin/superpowers.js167-208](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L167-L208) [lib/skills-core.js62-97](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L62-L97)

## Event-Driven Bootstrap System

The plugin uses OpenCode's event system to automatically inject the `using-superpowers` meta-skill at appropriate times during the session lifecycle.

### Session Lifecycle Events

The plugin's event handler at [.opencode/plugin/superpowers.js209-233](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L209-L233) listens for `session.created` and `session.compacted` events to inject and re-inject bootstrap content.

**Event Handler Code Structure:**

```
```

**Session Lifecycle Sequence with Code Symbols:**

```
```

**Sources:** [.opencode/plugin/superpowers.js209-233](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L209-L233)

### Bootstrap Content Generation

The `getBootstrapContent()` function at [.opencode/plugin/superpowers.js42-76](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L42-L76) generates the bootstrap message that loads the `using-superpowers` meta-skill. It accepts a `compact` parameter to control output verbosity.

**getBootstrapContent Function Structure:**

```
```

**Bootstrap Content Generation Flow:**

```
```

**Full Bootstrap Mode (compact=false):**

Invoked at [.opencode/plugin/superpowers.js221](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L221-L221) during `session.created`. Includes detailed tool mapping at [.opencode/plugin/superpowers.js54-65](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L54-L65):

```
```

**Compact Bootstrap Mode (compact=true):**

Invoked at [.opencode/plugin/superpowers.js229](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L229-L229) during `session.compacted`. Uses abbreviated mapping at [.opencode/plugin/superpowers.js50-52](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L50-L52):

```
```

**Anti-Recursion Warning:**

Both modes include the warning at [.opencode/plugin/superpowers.js70](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L70-L70):

```
```

**Sources:** [.opencode/plugin/superpowers.js42-76](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L42-L76)

### Session ID Extraction and Bootstrap Injection

The `getSessionID()` helper at [.opencode/plugin/superpowers.js211-215](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L211-L215) extracts the session ID from different event property paths:

```
```

This defensive approach handles different OpenCode API versions where the session ID may be located at different paths in the event object.

The `injectBootstrap()` helper at [.opencode/plugin/superpowers.js78-95](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L78-L95) wraps the bootstrap injection logic:

```
```

**Key Parameters:**

| Parameter            | Value       | Purpose                                                |
| -------------------- | ----------- | ------------------------------------------------------ |
| `path.id`            | `sessionID` | Target session for injection                           |
| `body.noReply`       | `true`      | Suppress agent response to injected content            |
| `parts[0].synthetic` | `true`      | Mark as system-generated (persists through compaction) |

**Sources:** [.opencode/plugin/superpowers.js78-95](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L78-L95) [.opencode/plugin/superpowers.js211-215](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L211-L215)

## Session Persistence with client.session.prompt

The plugin uses `client.session.prompt()` instead of tool return values to achieve persistent content injection that survives context compaction.

### Persistence Mechanism Comparison

**Tool Return Value (Ephemeral):**

- Content returned from `execute()` function
- Agent processes in immediate response
- Lost during context compaction
- Requires reloading skill after compaction

**client.session.prompt (Persistent):**

- Content injected directly into message log
- Marked with `synthetic: true` flag
- Preserved during context compaction
- Remains available throughout session

**Persistence Flow Comparison:**

```
```

**Key Implementation in use\_skill:**

The `use_skill` tool uses `client.session.prompt()` at [.opencode/plugin/superpowers.js147-158](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L147-L158) with these critical parameters:

```
```

**Parameter Breakdown:**

| Parameter            | Value               | Purpose                                | Line |
| -------------------- | ------------------- | -------------------------------------- | ---- |
| `path.id`            | `context.sessionID` | Target the current session             | 148  |
| `body.agent`         | `context.agent`     | Associate with current agent           | 151  |
| `body.noReply`       | `true`              | Prevent immediate agent response       | 152  |
| `parts[0].synthetic` | `true`              | Mark as system-generated               | 154  |
| `parts[1].synthetic` | `true`              | Mark skill content as system-generated | 155  |

**Fallback to Return Value:**

If `client.session.prompt()` fails (network error, API change, etc.), the tool falls back to returning content directly at [.opencode/plugin/superpowers.js159-161](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L159-L161):

```
```

**Sources:** [.opencode/plugin/superpowers.js147-161](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L147-L161)

## Tool Mapping for Cross-Platform Compatibility

Skills are primarily written for Claude Code, which has a different tool set than OpenCode. The plugin provides explicit tool mapping instructions to help agents translate between platforms.

### Tool Substitution Table

| Claude Code Tool                | OpenCode Equivalent | Usage                       |
| ------------------------------- | ------------------- | --------------------------- |
| `TodoWrite`                     | `update_plan`       | Update implementation plans |
| `Task` with subagents           | `@mention` syntax   | Invoke OpenCode subagents   |
| `Skill`                         | `use_skill`         | Load skills                 |
| `Read`, `Write`, `Edit`, `Bash` | Native tools        | File operations (no change) |

**Mapping Definition:** [.opencode/plugin/superpowers.js36-41](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L36-L41)

This mapping is injected in the bootstrap content so agents automatically know how to translate tool invocations when following skills.

**Sources:** [.opencode/plugin/superpowers.js32-47](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L32-L47)

## Installation and Registration

The OpenCode plugin must be manually installed and registered via symlink.

### Installation Process

From [.opencode/INSTALL.md10-28](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L10-L28):

1. **Clone Repository:**

   ```
   ```

2. **Register Plugin:**

   ```
   ```

3. **Restart OpenCode:** The plugin will be discovered and loaded automatically on next startup.

### Verification

To verify the plugin is active, ask the agent: "Do you have superpowers?" The agent should confirm and be able to list available skills using the `find_skills` tool.

**Sources:** [.opencode/INSTALL.md1-31](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L1-L31)

## Skills Discovery and Invocation

### Discovering Skills

Agents can discover available skills using the `find_skills` tool. The output shows all skills with their namespace prefixes, descriptions, and directory paths.

Example output format [.opencode/plugin/superpowers.js179-183](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L179-L183):

```
project:my-custom-skill
  Project-specific implementation helper
  Directory: /path/to/project/.opencode/skills/my-custom-skill

brainstorming
  Use before building any new feature - Structured design exploration
  Directory: ~/.config/opencode/skills/brainstorming

superpowers:test-driven-development
  RED-GREEN-REFACTOR cycle enforcement
  Directory: ~/.config/opencode/superpowers/skills/test-driven-development
```

### Invoking Skills

Skills are invoked using the `use_skill` tool with the skill name (optionally including namespace prefix):

- **Without prefix:** Searches project → personal → superpowers (e.g., `brainstorming`)
- **With `project:` prefix:** Forces project skill lookup (e.g., `project:my-skill`)
- **With `superpowers:` prefix:** Forces superpowers skill lookup (e.g., `superpowers:brainstorming`)

**Sources:** [.opencode/plugin/superpowers.js81-116](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L81-L116) [.opencode/INSTALL.md98-101](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L98-L101)

## Testing the Plugin

The plugin's shared functionality is tested via `lib/skills-core.js` tests in [tests/opencode/test-skills-core.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh) This test suite validates:

- **Frontmatter Extraction:** [tests/opencode/test-skills-core.sh17-84](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L17-L84)
- **Frontmatter Stripping:** [tests/opencode/test-skills-core.sh86-132](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L86-L132)
- **Directory Scanning:** [tests/opencode/test-skills-core.sh134-246](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L134-L246)
- **Skill Path Resolution:** [tests/opencode/test-skills-core.sh248-363](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L248-L363)
- **Update Checking:** [tests/opencode/test-skills-core.sh365-437](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L365-L437)

The tests use inline function definitions to avoid ESM path resolution issues in test environments, ensuring pure library functionality validation without OpenCode runtime dependencies.

**Sources:** [tests/opencode/test-skills-core.sh1-441](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L1-L441)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [OpenCode: Plugin and Custom Tools](#opencode-plugin-and-custom-tools.md)
- [Plugin Architecture Overview](#plugin-architecture-overview.md)
- [Plugin Entry Point and Module Structure](#plugin-entry-point-and-module-structure.md)
- [Directory Resolution Strategy](#directory-resolution-strategy.md)
- [Custom Tools](#custom-tools.md)
- [use\_skill Tool](#use_skill-tool.md)
- [find\_skills Tool](#find_skills-tool.md)
- [Event-Driven Bootstrap System](#event-driven-bootstrap-system.md)
- [Session Lifecycle Events](#session-lifecycle-events.md)
- [Bootstrap Content Generation](#bootstrap-content-generation.md)
- [Session ID Extraction and Bootstrap Injection](#session-id-extraction-and-bootstrap-injection.md)
- [Session Persistence with client.session.prompt](#session-persistence-with-clientsessionprompt.md)
- [Persistence Mechanism Comparison](#persistence-mechanism-comparison.md)
- [Tool Mapping for Cross-Platform Compatibility](#tool-mapping-for-cross-platform-compatibility.md)
- [Tool Substitution Table](#tool-substitution-table.md)
- [Installation and Registration](#installation-and-registration.md)
- [Installation Process](#installation-process.md)
- [Verification](#verification.md)
- [Skills Discovery and Invocation](#skills-discovery-and-invocation.md)
- [Discovering Skills](#discovering-skills.md)
- [Invoking Skills](#invoking-skills.md)
- [Testing the Plugin](#testing-the-plugin.md)
