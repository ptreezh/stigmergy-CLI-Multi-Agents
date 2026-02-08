# /obra/superpowers/2.2-installing-on-opencode

Installing on OpenCode | obra/superpowers | DeepWiki

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

# Installing on OpenCode

Relevant source files

- [.opencode/INSTALL.md](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md)
- [.opencode/plugin/superpowers.js](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js)
- [lib/skills-core.js](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js)
- [tests/opencode/test-skills-core.sh](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh)

**Purpose and Scope**: This document provides step-by-step installation instructions for Superpowers on the OpenCode.ai platform. It covers plugin registration via symlink creation, event-driven bootstrap injection, and basic usage of the `use_skill` and `find_skills` custom tools. For installation on other platforms, see [Installing on Claude Code](obra/superpowers/2.1-installing-on-claude-code.md) or [Installing on Codex](obra/superpowers/2.3-installing-on-codex.md). For detailed platform-specific features, see [OpenCode: Plugin and Custom Tools](obra/superpowers/5.2-opencode:-plugin-and-custom-tools.md).

## Prerequisites

The following must be installed before proceeding:

| Requirement     | Purpose                                         |
| --------------- | ----------------------------------------------- |
| **OpenCode.ai** | The AI platform that will load the plugin       |
| **Node.js**     | Required for JavaScript plugin execution        |
| **Git**         | Used to clone the repository and manage updates |

**Sources**: [.opencode/INSTALL.md3-8](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L3-L8)

## Installation Steps

### 1. Clone the Repository

Clone the Superpowers repository to OpenCode's configuration directory:

```
```

This creates a local copy of the plugin code and skills repository. The location `~/.config/opencode/superpowers` is the standard installation path for OpenCode plugins.

**Note**: If you have the `OPENCODE_CONFIG_DIR` environment variable set, adjust paths accordingly. The plugin respects this variable at runtime ([.opencode/plugin/superpowers.js38-39](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L38-L39)).

**Sources**: [.opencode/INSTALL.md11-16](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L11-L16)

### 2. Create Plugin Symlink

Register the plugin by creating a symlink that OpenCode will discover on startup:

```
```

The symlink allows OpenCode to load `SuperpowersPlugin` from [.opencode/plugin/superpowers.js32](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L32-L32) without duplicating files. This also enables `git pull` updates to take effect immediately without re-installation.

**Sources**: [.opencode/INSTALL.md18-25](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L18-L25)

### 3. Restart OpenCode

Restart the OpenCode application. The plugin will automatically register and inject bootstrap content on the first session.

To verify installation, start a new session and ask:

```
do you have superpowers?
```

The agent should confirm awareness of the superpowers system and reference skills available via the `use_skill` tool.

**Sources**: [.opencode/INSTALL.md27-31](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L27-L31)

## How the Plugin Works

The OpenCode integration uses a custom plugin architecture with event-driven bootstrap injection. The following diagram shows the complete initialization and skill loading flow:

```
```

**OpenCode Plugin Architecture**

**Sources**: [.opencode/plugin/superpowers.js32-96](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L32-L96) [.opencode/plugin/superpowers.js209-232](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L209-L232)

### Event-Driven Bootstrap

The plugin exports an `event` handler that responds to session lifecycle events ([.opencode/plugin/superpowers.js209-232](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L209-L232)):

| Event Type          | Action                                                 | Bootstrap Type                      |
| ------------------- | ------------------------------------------------------ | ----------------------------------- |
| `session.created`   | Inject full `using-superpowers` content on new session | Full (includes complete skill text) |
| `session.compacted` | Re-inject condensed bootstrap after context compaction | Compact (abbreviated tool mapping)  |

The `getBootstrapContent()` function ([.opencode/plugin/superpowers.js43-76](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L43-L76)) loads the `using-superpowers` skill using `resolveSkillPath()` from `skills-core.js`, strips YAML frontmatter with `stripFrontmatter()`, and appends OpenCode-specific tool mappings.

The `injectBootstrap()` function ([.opencode/plugin/superpowers.js79-95](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L79-L95)) uses `client.session.prompt()` with `noReply: true` and `synthetic: true` flags to inject content that persists across compaction without generating a visible assistant response.

**Sources**: [.opencode/plugin/superpowers.js43-95](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L43-L95) [.opencode/plugin/superpowers.js209-232](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L209-L232)

## Skills Directory Resolution

The plugin searches for skills in three locations with a priority system:

```
```

**Skills Directory Resolution Flow**

Directory variables are computed in the plugin initialization ([.opencode/plugin/superpowers.js33-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L33-L40)):

- `projectSkillsDir`: `path.join(directory, '.opencode/skills')` - Current project's skills
- `personalSkillsDir`: `path.join(configDir, 'skills')` - User's personal skills
- `superpowersSkillsDir`: `path.resolve(__dirname, '../../skills')` - Bundled skills from the repository

The `use_skill` tool ([.opencode/plugin/superpowers.js104-165](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L104-L165)) implements the priority resolution logic, checking project skills first (lines 115-125), then falling back to `resolveSkillPath()` from `skills-core.js` (line 129) which checks personal before superpowers.

**Sources**: [.opencode/plugin/superpowers.js33-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L33-L40) [.opencode/plugin/superpowers.js104-165](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L104-L165) [lib/skills-core.js99-140](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L99-L140)

## Custom Tools

The plugin provides two custom tools that integrate with OpenCode's tool system:

### use\_skill Tool

```
```

**use\_skill Tool Execution Flow**

The `use_skill` tool definition ([.opencode/plugin/superpowers.js99-166](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L99-L166)) accepts a `skill_name` argument and executes the following steps:

1. **Parse namespace prefix** (lines 109-110): Detect `project:` or `superpowers:` prefix
2. **Resolve skill path** (lines 115-130): Search directories in priority order
3. **Read skill file** (line 136): Load `SKILL.md` content
4. **Extract metadata** (line 137): Parse YAML frontmatter using `extractFrontmatter()` from `skills-core.js`
5. **Strip frontmatter** (line 138): Remove YAML using `stripFrontmatter()` from `skills-core.js`
6. **Inject into session** (lines 147-158): Use `client.session.prompt()` with `noReply: true` to persist skill content

The injected content includes a header with the skill name, description, and supporting files directory path (lines 141-144).

**Sources**: [.opencode/plugin/superpowers.js99-166](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L99-L166) [lib/skills-core.js16-52](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L16-L52) [lib/skills-core.js173-200](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L173-L200)

### find\_skills Tool

The `find_skills` tool ([.opencode/plugin/superpowers.js167-207](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L167-L207)) lists all available skills by:

1. Calling `findSkillsInDir()` from `skills-core.js` for each directory (lines 171-173)

2. Combining results in priority order: project → personal → superpowers (line 176)

3. Formatting output with namespace prefixes (lines 185-195):

   - `project:skill-name` for project skills
   - `skill-name` for personal skills
   - `superpowers:skill-name` for superpowers skills

The `findSkillsInDir()` function ([lib/skills-core.js62-97](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L62-L97)) recursively searches directories up to `maxDepth: 3`, looking for subdirectories containing `SKILL.md` files.

**Sources**: [.opencode/plugin/superpowers.js167-207](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L167-L207) [lib/skills-core.js62-97](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L62-L97)

## Directory Structure After Installation

```
~/.config/opencode/
├── plugin/
│   └── superpowers.js → ~/.config/opencode/superpowers/.opencode/plugin/superpowers.js (symlink)
├── superpowers/                  # Cloned repository
│   ├── .opencode/
│   │   └── plugin/
│   │       └── superpowers.js    # Plugin implementation
│   ├── lib/
│   │   └── skills-core.js        # Shared utility module
│   ├── skills/                   # Superpowers skills repository
│   │   ├── using-superpowers/
│   │   ├── brainstorming/
│   │   ├── test-driven-development/
│   │   └── ...
│   └── plugin.json
└── skills/                       # Personal skills (optional)
    └── my-custom-skill/
        └── SKILL.md

[project-directory]/              # Your project
└── .opencode/
    └── skills/                   # Project-specific skills (optional)
        └── project-skill/
            └── SKILL.md
```

**Sources**: [.opencode/plugin/superpowers.js33-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L33-L40) [.opencode/INSTALL.md53-101](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L53-L101)

## Verification

To verify the installation is working correctly:

### 1. Check Plugin Loading

Start a new OpenCode session and ask:

```
do you have superpowers?
```

The agent should confirm it has superpowers and reference the `use_skill` tool. This verifies that the `session.created` event handler successfully injected the bootstrap content.

### 2. List Available Skills

Invoke the `find_skills` tool:

```
use the find_skills tool
```

Expected output should list skills in three categories with appropriate namespace prefixes. For example:

```
Available skills:

project:my-project-skill
  Project-specific skill description
  Directory: /path/to/project/.opencode/skills/my-project-skill

my-custom-skill
  Personal skill description
  Directory: ~/.config/opencode/skills/my-custom-skill

superpowers:brainstorming
  Use when starting any new feature, project, or significant work
  Directory: ~/.config/opencode/superpowers/skills/brainstorming

superpowers:test-driven-development
  Use when writing any new code or modifying existing code
  Directory: ~/.config/opencode/superpowers/skills/test-driven-development
```

### 3. Load a Skill

Test loading a skill by invoking `use_skill`:

```
use the use_skill tool with skill_name: "superpowers:using-superpowers"
```

The agent should respond with "Launching skill: using-superpowers" and the skill content should be injected into the session context. Verify by asking the agent to summarize the skill's key concepts.

**Sources**: [.opencode/INSTALL.md33-49](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L33-L49) [.opencode/plugin/superpowers.js99-166](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L99-L166) [.opencode/plugin/superpowers.js167-207](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L167-L207)

## Creating Custom Skills

You can create personal and project-specific skills that override superpowers defaults.

### Personal Skills

Personal skills are stored in `~/.config/opencode/skills/` and apply to all your OpenCode sessions:

```
```

Invoke personal skills without a namespace prefix: `use_skill({ skill_name: "my-skill" })`

### Project Skills

Project skills are stored in `.opencode/skills/` within your project directory:

```
```

Invoke project skills with the `project:` prefix: `use_skill({ skill_name: "project:project-skill" })`

**Priority Rules**:

- Project skills with matching names override personal and superpowers skills
- Personal skills with matching names override superpowers skills
- Use explicit prefixes (`project:`, `superpowers:`) to force specific resolution

**Sources**: [.opencode/INSTALL.md52-101](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L52-L101) [.opencode/plugin/superpowers.js107-130](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L107-L130)

## Updating Superpowers

To update to the latest version of superpowers:

```
```

Since the plugin is symlinked, changes take effect immediately. Restart OpenCode or start a new session to load the updated skills and plugin code.

**Sources**: [.opencode/INSTALL.md104-108](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L104-L108)

## Troubleshooting

### Plugin Not Loading

**Symptom**: Agent doesn't respond to "do you have superpowers?" or `use_skill` tool is unavailable.

**Diagnosis**:

1. Verify the plugin file exists:

   ```
   ```

   Should show a symlink to `~/.config/opencode/superpowers/.opencode/plugin/superpowers.js`

2. Verify the plugin source exists:

   ```
   ```

3. Check OpenCode logs for JavaScript errors during plugin loading

4. Verify Node.js version:

   ```
   ```

   The plugin uses ES6 modules (`import` statements) which require Node.js 14+

**Solution**: Re-create the symlink using the installation steps above.

**Sources**: [.opencode/INSTALL.md110-117](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L110-L117)

### Skills Not Found

**Symptom**: `use_skill` returns "Error: Skill not found"

**Diagnosis**:

1. Verify skills directory exists:

   ```
   ```

2. Use `find_skills` tool to see what's discovered:

   ```
   use the find_skills tool
   ```

3. Check skill file structure - each skill must have a `SKILL.md` file:

   ```
   ```

**Solution**: If the skills directory is missing, the repository clone may have failed. Re-clone following the installation steps.

**Sources**: [.opencode/INSTALL.md119-123](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L119-L123)

### Tool Mapping Issues

**Symptom**: Skills reference tools that don't exist in OpenCode (e.g., `TodoWrite`, `Task`, `Skill`)

**Explanation**: Many skills are written for Claude Code which has different native tools. The plugin automatically includes tool mapping guidance in the bootstrap content ([.opencode/plugin/superpowers.js50-65](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L50-L65)).

**OpenCode Tool Equivalents**:

| Claude Code Tool                          | OpenCode Equivalent                   |
| ----------------------------------------- | ------------------------------------- |
| `TodoWrite`                               | `update_plan`                         |
| `Task` with subagents                     | `@mention` syntax to invoke subagents |
| `Skill`                                   | `use_skill` custom tool               |
| File operations (`Read`, `Write`, `Edit`) | Your native file tools                |
| `Bash`                                    | Your native bash tool                 |

The agent should automatically apply these mappings when executing skills. If not, explicitly remind the agent: "Use update\_plan instead of TodoWrite" or "Use @mention to invoke subagents instead of the Task tool".

**Sources**: [.opencode/INSTALL.md125-131](https://github.com/obra/superpowers/blob/a01a135f/.opencode/INSTALL.md#L125-L131) [.opencode/plugin/superpowers.js50-65](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L50-L65)

### OPENCODE\_CONFIG\_DIR Environment Variable

If you have `OPENCODE_CONFIG_DIR` set, the plugin respects this for personal skills resolution ([.opencode/plugin/superpowers.js38-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L38-L40)):

```
```

Personal skills should be placed in `$OPENCODE_CONFIG_DIR/skills/` instead of `~/.config/opencode/skills/` in this case.

**Sources**: [.opencode/plugin/superpowers.js38-40](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L38-L40)

## Technical Implementation Details

For developers interested in how the OpenCode integration works:

- **Plugin export structure**: The `SuperpowersPlugin` async function ([.opencode/plugin/superpowers.js32](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L32-L32)) exports an object with `tool` and `event` properties
- **Shared module usage**: The plugin imports `skills-core.js` ([.opencode/plugin/superpowers.js13](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L13-L13)) for cross-platform utility functions like `resolveSkillPath()`, `extractFrontmatter()`, `stripFrontmatter()`, and `findSkillsInDir()`
- **Context persistence**: Skills are injected using `noReply: true` and `synthetic: true` flags ([.opencode/plugin/superpowers.js87-89](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L87-L89)) to ensure they persist across context compaction
- **Bootstrap optimization**: After compaction, a condensed bootstrap is re-injected ([.opencode/plugin/superpowers.js226-230](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L226-L230)) to save tokens while maintaining essential guidance

For detailed technical information about the shared utilities, see [skills-core.js Shared Module](obra/superpowers/5.4-skills-core.js-shared-module.md).

**Sources**: [.opencode/plugin/superpowers.js1-235](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L1-L235) [lib/skills-core.js1-209](https://github.com/obra/superpowers/blob/a01a135f/lib/skills-core.js#L1-L209)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Installing on OpenCode](#installing-on-opencode.md)
- [Prerequisites](#prerequisites.md)
- [Installation Steps](#installation-steps.md)
- [1. Clone the Repository](#1-clone-the-repository.md)
- [2. Create Plugin Symlink](#2-create-plugin-symlink.md)
- [3. Restart OpenCode](#3-restart-opencode.md)
- [How the Plugin Works](#how-the-plugin-works.md)
- [Event-Driven Bootstrap](#event-driven-bootstrap.md)
- [Skills Directory Resolution](#skills-directory-resolution.md)
- [Custom Tools](#custom-tools.md)
- [use\_skill Tool](#use_skill-tool.md)
- [find\_skills Tool](#find_skills-tool.md)
- [Directory Structure After Installation](#directory-structure-after-installation.md)
- [Verification](#verification.md)
- [1. Check Plugin Loading](#1-check-plugin-loading.md)
- [2. List Available Skills](#2-list-available-skills.md)
- [3. Load a Skill](#3-load-a-skill.md)
- [Creating Custom Skills](#creating-custom-skills.md)
- [Personal Skills](#personal-skills.md)
- [Project Skills](#project-skills.md)
- [Updating Superpowers](#updating-superpowers.md)
- [Troubleshooting](#troubleshooting.md)
- [Plugin Not Loading](#plugin-not-loading.md)
- [Skills Not Found](#skills-not-found.md)
- [Tool Mapping Issues](#tool-mapping-issues.md)
- [OPENCODE\_CONFIG\_DIR Environment Variable](#opencode_config_dir-environment-variable.md)
- [Technical Implementation Details](#technical-implementation-details.md)
