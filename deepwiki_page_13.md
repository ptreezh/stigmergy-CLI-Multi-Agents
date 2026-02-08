# /obra/superpowers/4.1-dual-repository-design

Dual Repository Design | obra/superpowers | DeepWiki

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

# Dual Repository Design

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)

This document explains the separation between the plugin repository and skills repository, their independent versioning strategy, and the automatic update mechanism that keeps skills current without requiring plugin reinstallation.

For platform-specific installation procedures, see [Installing on Claude Code](obra/superpowers/2.1-installing-on-claude-code.md), [Installing on OpenCode](obra/superpowers/2.2-installing-on-opencode.md), and [Installing on Codex](obra/superpowers/2.3-installing-on-codex.md). For details on how skills are discovered and loaded during sessions, see [Session Lifecycle and Bootstrap](obra/superpowers/4.4-session-lifecycle-and-bootstrap.md). For the mechanics of the skills repository initialization script, see [Skills Repository Management](obra/superpowers/4.2-skills-repository-management.md).

---

## Purpose of Repository Separation

The superpowers system uses two separate GitHub repositories that serve distinct purposes:

| Repository            | URL                       | Purpose                                             | Update Frequency             |
| --------------------- | ------------------------- | --------------------------------------------------- | ---------------------------- |
| **Plugin Repository** | `obra/superpowers`        | Platform integration, hooks, tools, bootstrap logic | Stable (semantic versioning) |
| **Skills Repository** | `obra/superpowers-skills` | Skill content, documentation, techniques            | Frequent (community-driven)  |

This architectural separation enables:

- **Independent versioning**: Skills evolve rapidly without breaking plugin compatibility
- **Automatic updates**: Skills refresh on every session start without reinstalling plugins
- **Community contributions**: Users fork and contribute skills via standard git workflows
- **Platform stability**: Core integration code remains stable while content improves
- **User customization**: Fork skills repository for personal modifications without affecting plugin

**Sources**: [RELEASE-NOTES.md408-419](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L408-L419)

---

## Repository Structure

### Plugin Repository: The Lightweight Shim

The `obra/superpowers` repository is a **lightweight shim** containing only integration logic—no skill content. Its primary function is to bootstrap the skills repository and provide platform-specific tool wrappers.

**Core Components**:

| Component              | Path                              | Purpose                                          | Lines of Code |
| ---------------------- | --------------------------------- | ------------------------------------------------ | ------------- |
| **Plugin metadata**    | `.claude-plugin/plugin.json`      | Version (4.0.3), marketplace registration        | 14 lines      |
| **Skills initializer** | `lib/initialize-skills.sh`        | Clone/update obra/superpowers-skills             | \~150 lines   |
| **Bootstrap hook**     | `hooks/session-start.sh`          | Load using-superpowers, inject context           | \~50 lines    |
| **Claude Code tools**  | `.claude-plugin/plugin.json`      | Skill tool (native), slash commands              | Declarative   |
| **OpenCode plugin**    | `.opencode/plugin/superpowers.js` | use\_skill/find\_skills tools, event handlers    | \~200 lines   |
| **Codex script**       | `.codex/superpowers-codex`        | CLI commands (bootstrap, use-skill, find-skills) | \~150 lines   |
| **Shared module**      | `lib/skills-core.js`              | Skill discovery, frontmatter parsing             | \~100 lines   |
| **Bundled agent**      | `agents/code-reviewer.md`         | Code review subagent                             | 49 lines      |

The plugin contains **zero SKILL.md files**. All skill content lives in the separate `obra/superpowers-skills` repository, which is cloned to a platform-specific location during first session.

**Key architectural principle**: The plugin provides the "how to load" logic; the skills repository provides the "what to load" content.

**Sources**: [.claude-plugin/plugin.json1-14](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L1-L14) [agents/code-reviewer.md1-49](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md#L1-L49) [RELEASE-NOTES.md550-565](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L550-L565)

### Skills Repository: The Content Library

The `obra/superpowers-skills` repository contains **only skill documentation and supporting files**—no plugin code. This separation enables skills to evolve independently through community contributions.

**Structure**:

```
obra/superpowers-skills/
├── skills/
│   ├── using-superpowers/         # Meta-skill with "The Rule"
│   │   └── SKILL.md               # YAML frontmatter + markdown
│   ├── brainstorming/             # Mandatory first step
│   │   └── SKILL.md
│   ├── test-driven-development/   # RED-GREEN-REFACTOR
│   │   └── SKILL.md
│   ├── subagent-driven-development/ # Two-stage review workflow
│   │   ├── SKILL.md
│   │   ├── implementer-prompt.md
│   │   ├── spec-reviewer-prompt.md
│   │   └── code-quality-reviewer-prompt.md
│   ├── systematic-debugging/      # Skills with bundled techniques
│   │   ├── SKILL.md
│   │   ├── root-cause-tracing.md
│   │   ├── defense-in-depth.md
│   │   └── find-polluter.sh       # Bisection script
│   └── [80+ other skills]/
└── README.md
```

**Skill File Format**:

- YAML frontmatter: `name`, `description` (for Claude Search Optimization)
- Markdown content: Overview, When to Use, Core Pattern, Anti-Patterns
- Optional supporting files: templates, scripts, examples

Each skill directory is self-contained. Skills reference each other using the `superpowers:` namespace prefix (e.g., `superpowers:test-driven-development`).

**Sources**: [RELEASE-NOTES.md423-433](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L423-L433) [RELEASE-NOTES.md70-84](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L70-L84) [RELEASE-NOTES.md86-93](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L86-L93)

---

## Versioning Strategy

### Plugin Version (Semantic)

The plugin follows semantic versioning in [.claude-plugin/plugin.json4](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L4-L4):

```
"version": "4.0.3"
```

Version changes indicate:

- **Major**: Breaking API changes, platform integration changes
- **Minor**: New platform support, tool additions
- **Patch**: Bug fixes, documentation improvements

Current version is `4.0.3`, indicating a mature, stable platform integration layer.

### Skills Version (Continuous)

The skills repository has **no version number**. It is a continuously-updated library. Users always get the latest skills from `main` branch via automatic updates.

This design allows:

- Skills to evolve daily based on testing and feedback
- Immediate propagation of improvements to all users
- No coordination required between plugin and skills releases

**Sources**: [RELEASE-NOTES.md414-415](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L414-L415) [.claude-plugin/plugin.json4](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json#L4-L4)

---

## Directory Locations by Platform

The skills repository is cloned to platform-specific locations:

| Platform    | Skills Location                 | Environment Variable      |
| ----------- | ------------------------------- | ------------------------- |
| Claude Code | `~/.config/superpowers/skills/` | `SUPERPOWERS_SKILLS_ROOT` |
| OpenCode    | `~/.config/superpowers/skills/` | `SUPERPOWERS_SKILLS_ROOT` |
| Codex       | `~/.codex/superpowers/skills/`  | `SUPERPOWERS_SKILLS_ROOT` |

All platforms set the `SUPERPOWERS_SKILLS_ROOT` environment variable to point to the skills directory, enabling consistent path references across different integration mechanisms.

**Sources**: [RELEASE-NOTES.md428-429](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L428-L429) [RELEASE-NOTES.md522](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L522-L522)

---

## Automatic Update Mechanism

The plugin's core function is managing the skills repository lifecycle: clone on first install, update on every session start.

### Initialization Flow

**Diagram: initialize-skills.sh Execution Flow**

```
```

**Sources**: [RELEASE-NOTES.md450-460](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L450-L460) [RELEASE-NOTES.md515-528](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L515-L528) [RELEASE-NOTES.md394-405](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L394-L405)

### Update Logic Implementation

The `lib/initialize-skills.sh` script contains two main functions: `first_install()` for initial setup and `update_skills()` for session-start updates.

### Update Logic

The `lib/initialize-skills.sh` script implements three git states:

| Git State        | Detection                                                   | Action                | User Message                  |
| ---------------- | ----------------------------------------------------------- | --------------------- | ----------------------------- |
| **Local behind** | `git merge-base --is-ancestor HEAD tracking/main` returns 0 | `git merge --ff-only` | "Skills updated successfully" |
| **Local ahead**  | `git merge-base --is-ancestor tracking/main HEAD` returns 0 | No action             | (No warning)                  |
| **Diverged**     | Neither ancestor check passes                               | No action             | "⚠️ Skills behind upstream"   |

When diverged, users must manually sync using the `pulling-updates-from-skills-repository` skill to resolve conflicts.

**Sources**: [RELEASE-NOTES.md394-396](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L394-L396) [RELEASE-NOTES.md457-460](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L457-L460)

---

## Fork and Contribution Workflow

### Remote Configuration

**Diagram: Git Remote Setup**

```
```

Users who fork the repository get two remotes:

- `upstream`: Points to `obra/superpowers-skills` (read-only, for updates)
- `origin`: Points to user's fork (read-write, for contributions)

Users without forks get:

- `origin`: Points to `obra/superpowers-skills` (for updates)

**Sources**: [RELEASE-NOTES.md429-433](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L429-L433) [RELEASE-NOTES.md451-454](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L451-L454)

### Contribution Workflow

To contribute a new skill or improve an existing one:

1. **Create branch** in local clone:

   ```
   cd ~/.config/superpowers/skills
   git checkout -b feature/my-new-skill
   ```

2. **Make changes** and commit:

   ```
   # Edit skills/my-new-skill/SKILL.md
   git add skills/my-new-skill/
   git commit -m "Add my-new-skill"
   ```

3. **Push to fork** (if configured):

   ```
   git push origin feature/my-new-skill
   ```

4. **Create Pull Request** to `obra/superpowers-skills:main`

The automatic update mechanism will pull merged changes on the next session start.

**Sources**: [RELEASE-NOTES.md431](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L431-L431) [RELEASE-NOTES.md616-622](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L616-L622)

---

## Migration from v1.x

### Pre-v2.0 Architecture

Before v2.0.0, all skills lived inside the plugin repository:

```
obra/superpowers/
├── .claude-plugin/
├── hooks/
└── skills/              # Skills bundled with plugin
    ├── using-superpowers/
    ├── brainstorming/
    └── [other skills]/
```

This created several problems:

- Skills updates required plugin reinstallation
- Users shadowed core skills with personal skills in `~/.config/superpowers/skills/`
- No version control for personal modifications
- Contributing improvements was complex

**Sources**: [RELEASE-NOTES.md420-442](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L420-L442)

### v2.0.0 Migration Behavior

The `lib/initialize-skills.sh` script automatically migrates old installations:

1. **Backup old git state**: Moves `~/.config/superpowers/.git` to `~/.config/superpowers/.git.bak`
2. **Backup old skills**: Moves `~/.config/superpowers/skills/` to `~/.config/superpowers/skills.bak`
3. **Fresh clone**: Clones `obra/superpowers-skills` to `~/.config/superpowers/skills/`
4. **Prompt for fork**: If `gh` CLI is available, offers to create fork

Users with personal skills must manually migrate them:

- Create branch in new clone
- Copy personal skills from `skills.bak/`
- Commit to branch
- Push to fork (optional)

**Sources**: [RELEASE-NOTES.md434-440](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L434-L440) [RELEASE-NOTES.md589-608](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L589-L608)

---

## Implementation Details

### Platform-Specific Integration Points

Each platform implements the dual repository pattern differently but achieves the same result: fresh skills on every session.

**Diagram: Platform Integration Architecture**

```
```

**Environment Variable Assignment**:

| Platform        | Set Location                | Value                                                         | Used By                           |
| --------------- | --------------------------- | ------------------------------------------------------------- | --------------------------------- |
| **Claude Code** | `hooks/session-start.sh`    | `$HOME/.config/superpowers/skills`                            | Skill tool, session-start.sh      |
| **OpenCode**    | `superpowers.js` runtime    | `path.join(os.homedir(), '.config', 'superpowers', 'skills')` | use\_skill, find\_skills tools    |
| **Codex**       | `superpowers-codex` runtime | `path.join(os.homedir(), '.codex', 'superpowers', 'skills')`  | bootstrap, use-skill, find-skills |

**Shared Code Reuse**:

- `lib/initialize-skills.sh`: Sourced by Claude Code, executed via `execSync()` by OpenCode and Codex
- `lib/skills-core.js`: Imported by both OpenCode plugin and Codex script for skill parsing

**Sources**: [RELEASE-NOTES.md513-519](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L513-L519) [RELEASE-NOTES.md521-522](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L521-L522) [RELEASE-NOTES.md177-181](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L177-L181)

---

## Benefits of Dual Repository Design

### For Users

| Benefit             | Implementation                                   |
| ------------------- | ------------------------------------------------ |
| **Always current**  | Auto-update on session start, no action required |
| **Stable platform** | Plugin updates are infrequent, reducing risk     |
| **Customization**   | Fork skills repo, maintain branches              |
| **Zero downtime**   | Skills update in <1 second via git pull          |

### For Contributors

| Benefit                  | Implementation                                  |
| ------------------------ | ----------------------------------------------- |
| **Standard workflow**    | Fork, branch, PR - familiar to all developers   |
| **Fast iteration**       | Changes merged to main appear immediately       |
| **No coordination**      | Skill improvements don't require plugin release |
| **Testing in isolation** | Test skills without touching plugin code        |

### For Maintainers

| Benefit                    | Implementation                                 |
| -------------------------- | ---------------------------------------------- |
| **Focused releases**       | Plugin releases only for platform changes      |
| **Community velocity**     | Skills improve continuously via PRs            |
| **Backward compatibility** | Skills reference plugin features, not versions |
| **Clear separation**       | Platform bugs vs content issues are obvious    |

**Sources**: [RELEASE-NOTES.md410-418](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L410-L418)

---

## Comparison: Monolithic vs Dual Repository

**Diagram: Architectural Evolution**

```
```

**Sources**: [RELEASE-NOTES.md408-442](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L408-L442)

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Dual Repository Design](#dual-repository-design.md)
- [Purpose of Repository Separation](#purpose-of-repository-separation.md)
- [Repository Structure](#repository-structure.md)
- [Plugin Repository: The Lightweight Shim](#plugin-repository-the-lightweight-shim.md)
- [Skills Repository: The Content Library](#skills-repository-the-content-library.md)
- [Versioning Strategy](#versioning-strategy.md)
- [Plugin Version (Semantic)](#plugin-version-semantic.md)
- [Skills Version (Continuous)](#skills-version-continuous.md)
- [Directory Locations by Platform](#directory-locations-by-platform.md)
- [Automatic Update Mechanism](#automatic-update-mechanism.md)
- [Initialization Flow](#initialization-flow.md)
- [Update Logic Implementation](#update-logic-implementation.md)
- [Update Logic](#update-logic.md)
- [Fork and Contribution Workflow](#fork-and-contribution-workflow.md)
- [Remote Configuration](#remote-configuration.md)
- [Contribution Workflow](#contribution-workflow.md)
- [Migration from v1.x](#migration-from-v1x.md)
- [Pre-v2.0 Architecture](#pre-v20-architecture.md)
- [v2.0.0 Migration Behavior](#v200-migration-behavior.md)
- [Implementation Details](#implementation-details.md)
- [Platform-Specific Integration Points](#platform-specific-integration-points.md)
- [Benefits of Dual Repository Design](#benefits-of-dual-repository-design.md)
- [For Users](#for-users.md)
- [For Contributors](#for-contributors.md)
- [For Maintainers](#for-maintainers.md)
- [Comparison: Monolithic vs Dual Repository](#comparison-monolithic-vs-dual-repository.md)
