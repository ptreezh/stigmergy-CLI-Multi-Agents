# /obra/superpowers/4.4-session-lifecycle-and-bootstrap

Session Lifecycle and Bootstrap | obra/superpowers | DeepWiki

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

# Session Lifecycle and Bootstrap

Relevant source files

- [.claude-plugin/marketplace.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/marketplace.json)
- [.claude-plugin/plugin.json](https://github.com/obra/superpowers/blob/a01a135f/.claude-plugin/plugin.json)
- [RELEASE-NOTES.md](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md)
- [agents/code-reviewer.md](https://github.com/obra/superpowers/blob/a01a135f/agents/code-reviewer.md)
- [docs/windows/polyglot-hooks.md](https://github.com/obra/superpowers/blob/a01a135f/docs/windows/polyglot-hooks.md)
- [hooks/hooks.json](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json)
- [hooks/run-hook.cmd](https://github.com/obra/superpowers/blob/a01a135f/hooks/run-hook.cmd)
- [hooks/session-start.sh](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh)

## Purpose and Scope

This page documents how bootstrap content is injected into agent context at session initialization across Claude Code, OpenCode, and Codex platforms. It covers:

- The `session-start.sh` hook execution in Claude Code
- The `SuperpowersPlugin` event handlers (`session.created`, `session.compacted`) in OpenCode
- The `runBootstrap()` CLI command in Codex
- The `using-superpowers` skill content and its enforcement mechanisms

This page focuses on session-level bootstrap. For skills repository initialization, see page 4.5. For skills resolution priority, see page 3.3.

---

## Bootstrap Trigger Points by Platform

| Platform        | Trigger Event                                                          | Mechanism                | Entry Point                                                                                                                           |
| --------------- | ---------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Claude Code** | `SessionStart` hook (`startup`, `resume`, `clear`, `compact` matchers) | Automatic hook execution | [hooks/session-start.sh1-52](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L52)                         |
| **OpenCode**    | `session.created` event                                                | Event handler in plugin  | [.opencode/plugin/superpowers.js199-204](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L199-L204) |
| **OpenCode**    | `session.compacted` event (re-injection)                               | Event handler in plugin  | [.opencode/plugin/superpowers.js207-212](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L207-L212) |
| **Codex**       | Manual invocation or `AGENTS.md` instruction                           | CLI command              | [.codex/superpowers-codex72-124](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L72-L124)                 |

Claude Code uses [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15) to register the `SessionStart` hook with matchers `"startup|resume|clear|compact"`, executing [hooks/session-start.sh1-52](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L52) automatically. OpenCode registers event handlers via the `event` export in [.opencode/plugin/superpowers.js190-214](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L190-L214) Codex requires explicit invocation of the `bootstrap` command.

**Sources:** [hooks/hooks.json1-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L1-L15) [hooks/session-start.sh1-52](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L52) [.opencode/plugin/superpowers.js190-214](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L190-L214) [.codex/superpowers-codex72-124](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L72-L124)

---

## Claude Code Bootstrap Architecture

### session-start.sh Execution Flow

```
```

**Sources:** [hooks/session-start.sh7-8](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L7-L8) [hooks/session-start.sh12-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L12-L15) [hooks/session-start.sh18](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L18-L18) [hooks/session-start.sh21-37](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L21-L37) [hooks/session-start.sh39-40](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L39-L40) [hooks/session-start.sh43-50](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L43-L50)

---

## Claude Code Implementation Details

### BASH\_SOURCE Fallback Pattern

[hooks/session-start.sh7-8](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L7-L8) uses `${BASH_SOURCE[0]:-$0}` to resolve the script directory:

```
```

The `:-` operator provides `$0` as fallback when `BASH_SOURCE` is unbound in Claude Code's hook execution context. This prevents "Plugin hook error" failures when hooks run in non-standard shells.

### Legacy Directory Detection

[hooks/session-start.sh12-15](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L12-L15) checks for `~/.config/superpowers/skills`:

```
```

The `warning_message` variable is appended to `additionalContext` only when the directory exists. This guards against silent skill loading failures after v3.0 migration.

### Pure Bash JSON Escaping

[hooks/session-start.sh18](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L18-L18) reads the skill file:

```
```

[hooks/session-start.sh21-37](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L21-L37) defines `escape_for_json()` using pure bash (no sed/awk dependencies):

```
```

This character-by-character escaping ensures proper JSON encoding without external dependencies.

### hookSpecificOutput JSON Structure

[hooks/session-start.sh43-50](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L43-L50) outputs to stdout:

```
```

Claude Code runtime parses `hookSpecificOutput.additionalContext` and injects it into the agent's initial context before the first user message.

**Sources:** [hooks/session-start.sh43-50](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L43-L50)

## OpenCode Bootstrap Architecture

### SuperpowersPlugin Event Handlers

```
```

**Sources:** [.opencode/plugin/superpowers.js17](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L17-L17) [.opencode/plugin/superpowers.js25-58](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L25-L58) [.opencode/plugin/superpowers.js61-77](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L61-L77) [.opencode/plugin/superpowers.js190-214](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L190-L214)

### noReply: true Flag for Context Persistence

[.opencode/plugin/superpowers.js66-72](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L66-L72) uses `client.session.prompt()` with `noReply: true`:

```
```

The `noReply: true` flag injects content into context without triggering an agent response. The `synthetic: true` flag marks the content as system-generated. This pattern inserts bootstrap content silently into the conversation history.

### session.compacted Re-injection

[.opencode/plugin/superpowers.js207-212](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L207-L212) listens for `session.compacted` events:

```
```

When OpenCode compacts context (removes old messages to fit within token limits), the `session.compacted` event fires. The plugin re-injects bootstrap content with `compact = true`, using a shorter tool mapping to save tokens while maintaining the mandatory protocol.

**Sources:** [.opencode/plugin/superpowers.js61-77](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L61-L77) [.opencode/plugin/superpowers.js207-212](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L207-L212)

---

## Codex Bootstrap Architecture

### runBootstrap() CLI Command

```
```

**Sources:** [.codex/superpowers-codex72-124](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L72-L124) [.codex/superpowers-codex242-267](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L242-L267)

### Bootstrap File Structure

[.codex/superpowers-codex89-101](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L89-L101) outputs [.codex/superpowers-bootstrap.md1-33](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L1-L33) content:

- Tool mapping for Codex (`TodoWrite` → `update_plan`, subagents → manual fallback)
- Skill naming conventions (`superpowers:skill-name` vs `skill-name`)
- Mandatory skill usage protocol
- Skills location directories

After displaying bootstrap instructions, [.codex/superpowers-codex115](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L115-L115) auto-loads `superpowers:using-superpowers` via `runUseSkill()`, ensuring the agent receives the full mandatory protocol.

**Sources:** [.codex/superpowers-codex89-101](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L89-L101) [.codex/superpowers-codex115](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L115-L115) [.codex/superpowers-bootstrap.md1-33](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L1-L33)

---

## Bootstrap Content: using-superpowers Skill

### File Structure and Content Sections

The `using-superpowers` skill is stored at `skills/using-superpowers/SKILL.md` and loaded by all platforms. It contains:

| Section                           | Purpose                                       | Key Enforcement                                                    |
| --------------------------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| YAML Frontmatter                  | `name: using-superpowers`, `description: ...` | Metadata for skill discovery                                       |
| `<EXTREMELY_IMPORTANT>` Block     | Forces mandatory skill usage                  | "If even 1% chance a skill applies, you ABSOLUTELY MUST read it"   |
| Mandatory First Response Protocol | 5-step checklist                              | "Responding WITHOUT completing this checklist = automatic failure" |
| Common Rationalizations           | 8 pre-emptive counters                        | "This is just a simple question" → WRONG                           |
| Skills with Checklists            | TodoWrite integration                         | "Create a `TodoWrite` todo for EVERY checkbox"                     |
| Announcing Skill Usage            | Transparency requirement                      | "I've read the \[Skill Name] skill and I'm using it to \[purpose]" |
| Rigid vs Flexible Skills          | Skill types                                   | Some require exact adherence, others allow adaptation              |
| Instructions ≠ Permission         | User authority limits                         | "The user can't override skills"                                   |

**Sources:** [skills/using-superpowers/SKILL.md1-102](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L1-L102)

### Enforcement Language Evolution

The skill's language has been strengthened through multiple iterations:

- **v3.2.2**: Added `<EXTREMELY_IMPORTANT>` wrapper, 5-step checklist, 8 rationalization counters
- **v3.2.3**: Changed skill invocation from `Read` tool to `Skill` tool

Key enforcement patterns:

- Absolute language: "You do not have a choice. You cannot rationalize your way out."
- Explicit consequences: "Responding WITHOUT completing this checklist = automatic failure"
- Pre-emptive counters: Each common rationalization gets a direct rebuttal

This adversarial design assumes agents will attempt to rationalize around mandatory workflows.

**Sources:** [RELEASE-NOTES.md42-55](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L42-L55) [RELEASE-NOTES.md57-77](https://github.com/obra/superpowers/blob/a01a135f/RELEASE-NOTES.md#L57-L77)

## Mandatory First Response Protocol

### 5-Step Checklist Structure

The protocol from `using-superpowers` SKILL.md requires agents to complete this checklist before every response:

```
☐ 1. List available skills (think through the list)
☐ 2. Ask yourself: Does ANY skill match this task? (If even 1% match, yes)
☐ 3. If yes: Use the Skill tool to read and run that skill file
☐ 4. Announce which skill you're using and why
☐ 5. Follow the skill's instructions exactly
```

Skipping this checklist is defined as "automatic failure".

### Common Rationalization Counters

The skill includes 8 pre-emptive counters to agent evasion patterns:

| Agent Rationalization               | Counter-Argument                                             |
| ----------------------------------- | ------------------------------------------------------------ |
| "This is just a simple question"    | Questions are tasks. Check for skills.                       |
| "I can check git/files quickly"     | Files don't have conversation context. Check for skills.     |
| "Let me gather information first"   | Skills tell you HOW to gather information. Check for skills. |
| "This doesn't need a formal skill"  | If a skill exists for it, use it.                            |
| "I remember this skill"             | Skills evolve. Run the current version.                      |
| "This doesn't count as a task"      | If you're taking action, it's a task. Check for skills.      |
| "The skill is overkill for this"    | Skills exist because simple things become complex. Use it.   |
| "I'll just do this one thing first" | Check for skills BEFORE doing anything.                      |

Each follows the format: `"[Rationalization]" → WRONG. [Counter]`. This repetitive structure targets agent pattern recognition.

**Sources:** [skills/using-superpowers/SKILL.md34-49](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L34-L49)

## Platform-Specific Tool Mappings

### Claude Code Tool Mapping

Claude Code has native `Skill` tool support, so `using-superpowers` is loaded directly without mapping translation. Other skills reference the `Skill` tool for skill invocation.

### OpenCode Tool Mapping

[.opencode/plugin/superpowers.js32-47](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L32-L47) includes tool mapping in bootstrap content:

```
```

The `compact` version is used after `session.compacted` events to save tokens.

**Sources:** [.opencode/plugin/superpowers.js32-47](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L32-L47)

### Codex Tool Mapping

[.codex/superpowers-bootstrap.md6-14](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L6-L14) documents tool mappings:

```
```

The Codex mapping lacks true subagent support, instructing agents to notify users of the limitation.

**Sources:** [.codex/superpowers-bootstrap.md6-14](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-bootstrap.md#L6-L14)

## Cross-Platform Bootstrap Comparison

```
```

| Aspect               | Claude Code                                                                                                   | OpenCode                                                                                                                              | Codex                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Trigger**          | Automatic (hook matcher)                                                                                      | Automatic (event listener)                                                                                                            | Manual (CLI invocation)                                                                                               |
| **Entry Point**      | [hooks/session-start.sh1-52](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L52) | [.opencode/plugin/superpowers.js190-214](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L190-L214) | [.codex/superpowers-codex72-124](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L72-L124) |
| **Content Source**   | `skills/using-superpowers/SKILL.md`                                                                           | `skills/using-superpowers/SKILL.md`                                                                                                   | `.codex/superpowers-bootstrap.md` + auto-loaded skill                                                                 |
| **Injection Method** | `hookSpecificOutput.additionalContext`                                                                        | `client.session.prompt({ noReply: true })`                                                                                            | stdout (agent copies into context)                                                                                    |
| **Re-injection**     | On resume/clear/compact                                                                                       | On `session.compacted` event                                                                                                          | Manual re-run                                                                                                         |
| **Tool Mapping**     | Native `Skill` tool                                                                                           | Custom `use_skill` tool                                                                                                               | CLI command                                                                                                           |

**Sources:** [hooks/session-start.sh1-52](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L52) [.opencode/plugin/superpowers.js190-214](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L190-L214) [.codex/superpowers-codex72-124](https://github.com/obra/superpowers/blob/a01a135f/.codex/superpowers-codex#L72-L124)

## Bootstrap Content Lifecycle

### Single Injection vs Re-injection

| Platform        | Initial Injection                     | Re-injection                                | Persistence                          |
| --------------- | ------------------------------------- | ------------------------------------------- | ------------------------------------ |
| **Claude Code** | `SessionStart` hook (startup, resume) | Also triggers on `clear`, `compact`         | Persists until session end           |
| **OpenCode**    | `session.created` event               | `session.compacted` event (compact version) | Re-injected after context compaction |
| **Codex**       | Manual `bootstrap` command            | Manual re-run                               | Persists in conversation history     |

OpenCode is the only platform that automatically re-injects bootstrap content. [.opencode/plugin/superpowers.js207-212](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L207-L212) listens for `session.compacted` events and calls `injectBootstrap(sessionID, true)` with a shortened tool mapping to conserve tokens.

### Bootstrap Content Persistence

Once injected, bootstrap content remains in agent context for the session lifetime. The `using-superpowers` skill establishes the mandatory protocol that governs all subsequent skill invocations. Agents must complete the 5-step checklist before each response, creating a persistent behavioral constraint.

**Sources:** [.opencode/plugin/superpowers.js207-212](https://github.com/obra/superpowers/blob/a01a135f/.opencode/plugin/superpowers.js#L207-L212) [hooks/hooks.json5](https://github.com/obra/superpowers/blob/a01a135f/hooks/hooks.json#L5-L5)

## Testing and Verification

### Manual Verification Steps

**Claude Code:**

1. Start new session → agent should reference skills in first response
2. Create `~/.config/superpowers/skills` → start session → verify legacy warning appears
3. Remove directory → start session → verify warning gone
4. Ask agent to debug → verify agent announces `systematic-debugging` skill usage

**OpenCode:**

1. Check `session.created` fires → verify bootstrap injection via dev tools
2. Trigger context compaction → verify `session.compacted` re-injection occurs
3. Verify `noReply: true` flag prevents agent response to bootstrap

**Codex:**

1. Run `~/.codex/superpowers/.codex/superpowers-codex bootstrap`
2. Verify output includes `.codex/superpowers-bootstrap.md` content
3. Verify auto-loaded `superpowers:using-superpowers` skill appears
4. Verify tool mappings documented in output

### Test File References

[tests/opencode/test-skills-core.sh1-441](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L1-L441) tests `skills-core.js` functions including `extractFrontmatter`, `stripFrontmatter`, `findSkillsInDir`, `resolveSkillPath`, and `checkForUpdates`.

**Sources:** [tests/opencode/test-skills-core.sh1-441](https://github.com/obra/superpowers/blob/a01a135f/tests/opencode/test-skills-core.sh#L1-L441)

---

## Summary

The session lifecycle bootstrap system establishes mandatory protocols through automatic context injection. In Claude Code, the [hooks/session-start.sh1-35](https://github.com/obra/superpowers/blob/a01a135f/hooks/session-start.sh#L1-L35) script executes on every session start, loading [skills/using-superpowers/SKILL.md1-102](https://github.com/obra/superpowers/blob/a01a135f/skills/using-superpowers/SKILL.md#L1-L102) into the agent's initial context. This bootstrap content includes the 5-step mandatory first response protocol, explicit counters to common rationalization patterns, and rules for skill usage enforcement.

The system is defensive by design: it assumes agents will attempt to rationalize around skill usage and provides forceful language and pre-emptive counters to prevent evasion. The `<EXTREMELY_IMPORTANT>` wrapper, absolute language ("You do not have a choice"), and explicit failure consequences ("automatic failure") reflect lessons learned from observing agent behavior patterns in practice.

Platform differences are handled through separate bootstrap mechanisms: Claude Code uses automatic hooks with JSON output, while Codex requires manual CLI invocation with adapted tool mappings. Both platforms ultimately load similar mandatory protocols, ensuring consistent agent behavior across platforms.

Dismiss

Refresh this wiki

This wiki was recently refreshed. Please wait 6 days to refresh again.

### On this page

- [Session Lifecycle and Bootstrap](#session-lifecycle-and-bootstrap.md)
- [Purpose and Scope](#purpose-and-scope.md)
- [Bootstrap Trigger Points by Platform](#bootstrap-trigger-points-by-platform.md)
- [Claude Code Bootstrap Architecture](#claude-code-bootstrap-architecture.md)
- [session-start.sh Execution Flow](#session-startsh-execution-flow.md)
- [Claude Code Implementation Details](#claude-code-implementation-details.md)
- [BASH\_SOURCE Fallback Pattern](#bash_source-fallback-pattern.md)
- [Legacy Directory Detection](#legacy-directory-detection.md)
- [Pure Bash JSON Escaping](#pure-bash-json-escaping.md)
- [hookSpecificOutput JSON Structure](#hookspecificoutput-json-structure.md)
- [OpenCode Bootstrap Architecture](#opencode-bootstrap-architecture.md)
- [SuperpowersPlugin Event Handlers](#superpowersplugin-event-handlers.md)
- [noReply: true Flag for Context Persistence](#noreply-true-flag-for-context-persistence.md)
- [session.compacted Re-injection](#sessioncompacted-re-injection.md)
- [Codex Bootstrap Architecture](#codex-bootstrap-architecture.md)
- [runBootstrap() CLI Command](#runbootstrap-cli-command.md)
- [Bootstrap File Structure](#bootstrap-file-structure.md)
- [Bootstrap Content: using-superpowers Skill](#bootstrap-content-using-superpowers-skill.md)
- [File Structure and Content Sections](#file-structure-and-content-sections.md)
- [Enforcement Language Evolution](#enforcement-language-evolution.md)
- [Mandatory First Response Protocol](#mandatory-first-response-protocol.md)
- [5-Step Checklist Structure](#5-step-checklist-structure.md)
- [Common Rationalization Counters](#common-rationalization-counters.md)
- [Platform-Specific Tool Mappings](#platform-specific-tool-mappings.md)
- [Claude Code Tool Mapping](#claude-code-tool-mapping.md)
- [OpenCode Tool Mapping](#opencode-tool-mapping.md)
- [Codex Tool Mapping](#codex-tool-mapping.md)
- [Cross-Platform Bootstrap Comparison](#cross-platform-bootstrap-comparison.md)
- [Bootstrap Content Lifecycle](#bootstrap-content-lifecycle.md)
- [Single Injection vs Re-injection](#single-injection-vs-re-injection.md)
- [Bootstrap Content Persistence](#bootstrap-content-persistence.md)
- [Testing and Verification](#testing-and-verification.md)
- [Manual Verification Steps](#manual-verification-steps.md)
- [Test File References](#test-file-references.md)
- [Summary](#summary.md)
