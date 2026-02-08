# Comprehensive Analysis: Obra/Superpowers Plugin Mechanism

**Date:** 2026-01-26
**Repository:** obra/superpowers v4.0.3
**Focus:** Plugin Architecture & Context Injection (NOT Skills Content)

---

## Executive Summary

The **superpowers** system uses a **dual-repository architecture**:

1. **Plugin Repository** (`obra/superpowers`) - Lightweight integration shim (~15KB)
2. **Skills Repository** (embedded in plugin as of v4.0+) - Markdown skill files

**CRITICAL DISTINCTION:** The plugin mechanism is **NOT** the skills themselves. The plugin is a **delivery and bootstrapping system** that injects skill content into Claude's context at session start.

---

## 1. Directory Structure

### Complete Plugin Directory (v4.0.3)

```
~/.claude/plugins/superpowers/
├── .claude-plugin/
│   ├── plugin.json             # Metadata: name, version, keywords
│   ├── marketplace.json        # Marketplace registration
│   └── commands/
│       ├── brainstorm.md       # /brainstorm slash command
│       ├── write-plan.md       # /write-plan slash command
│       └── execute-plan.md     # /execute-plan slash command
│
├── hooks/
│   ├── hooks.json              # SessionStart hook registration
│   ├── run-hook.cmd            # Polyglot wrapper (Windows + Unix)
│   └── session-start.sh        # Bootstrap script - KEY FILE
│
├── skills/                     # BUNDLED skills (NOT external repo in v4.x)
│   ├── using-superpowers/
│   │   └── SKILL.md            # Meta-skill: mandatory protocol
│   ├── brainstorming/
│   │   └── SKILL.md
│   ├── test-driven-development/
│   │   └── SKILL.md
│   ├── systematic-debugging/
│   │   └── SKILL.md
│   ├── subagent-driven-development/
│   │   ├── SKILL.md
│   │   ├── implementer-prompt.md
│   │   ├── spec-reviewer-prompt.md
│   │   └── code-quality-reviewer-prompt.md
│   ├── writing-plans/
│   │   └── SKILL.md
│   ├── executing-plans/
│   │   └── SKILL.md
│   ├── using-git-worktrees/
│   │   └── SKILL.md
│   ├── finishing-a-development-branch/
│   │   └── SKILL.md
│   ├── requesting-code-review/
│   │   └── SKILL.md
│   ├── receiving-code-review/
│   │   └── SKILL.md
│   └── writing-skills/
│       ├── SKILL.md
│       └── anthropic-best-practices.md
│
└── agents/
    └── code-reviewer.md        # superpowers:code-reviewer agent
```

**Key Changes in v4.0+:**
- Skills are now **BUNDLED** with the plugin (no external git clone)
- Removed: `lib/initialize-skills.sh` (no longer needed)
- Removed: `SUPERPOWERS_SKILLS_ROOT` environment variable
- Skills directory: `~/.claude/plugins/superpowers/skills/`

---

## 2. Configuration Files

### 2.1 `hooks/hooks.json` - Hook Registration

**Purpose:** Register the `SessionStart` hook with Claude Code

**Content:**
```json
{
  "hooks": [
    {
      "name": "SessionStart",
      "matchers": ["startup|resume|clear|compact"],
      "command": "$CLAUDE_PLUGIN_ROOT/hooks/run-hook.cmd $CLAUDE_PLUGIN_ROOT/hooks/session-start.sh"
    }
  ]
}
```

**Key Details:**
- `matchers`: Hook triggers on startup, resume, clear, or compact events
- `command`: Executes polyglot wrapper with session-start.sh as argument
- `$CLAUDE_PLUGIN_ROOT`: Environment variable set by Claude Code

### 2.2 `.claude-plugin/plugin.json` - Plugin Metadata

**Content:**
```json
{
  "name": "superpowers",
  "version": "4.0.3",
  "description": "Core skills library for Claude Code: TDD, debugging, collaboration patterns, and proven techniques",
  "author": "obra",
  "keywords": ["skills", "tdd", "debugging", "workflow", "development"]
}
```

### 2.3 `.claude-plugin/marketplace.json` - Marketplace Configuration

Registers the plugin with Claude Code's marketplace system for discovery and installation.

---

## 3. The Plugin Mechanism: `session-start.sh`

### 3.1 What It Does

The `session-start.sh` script is the **heart of the plugin mechanism**. It:

1. **Reads** the `using-superpowers/SKILL.md` file from the bundled skills directory
2. **Escapes** the content for JSON (pure bash, no sed/awk dependencies)
3. **Outputs** structured JSON to stdout with `hookSpecificOutput.additionalContext`
4. **Injects** the skill content into Claude's initial session context

### 3.2 Script Flow (Step-by-Step)

```bash
#!/usr/bin/env bash

# Lines 7-8: Resolve plugin directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Lines 12-15: Legacy directory detection (migration warning)
LEGACY_DIR="$HOME/.config/superpowers/skills"
if [ -d "$LEGACY_DIR" ]; then
  warning_message="⚠️ WARNING: Superpowers now uses Claude Code's skills system..."
fi

# Line 18: Read the using-superpowers skill file
SKILL_FILE="$PLUGIN_ROOT/skills/using-superpowers/SKILL.md"
skill_content=$(cat "$SKILL_FILE")

# Lines 21-37: Pure bash JSON escaping function
escape_for_json() {
  local string="$1"
  # Character-by-character escaping using case matching
  echo "$string" | while IFS= read -r -n1 char; do
    case "$char" in
      '"')  echo -n '\\"' ;;
      '\\') echo -n '\\\\' ;;
      $'\n') echo -n '\\n' ;;
      $'\r') echo -n '\\r' ;;
      $'\t') echo -n '\\t' ;;
      *)    echo -n "$char" ;;
    esac
  done
}

# Lines 43-50: Output JSON structure to stdout
escaped_skill=$(escape_for_json "$skill_content")
cat <<EOF
{
  "hookSpecificOutput": {
    "additionalContext": "<EXTREMELY_IMPORTANT>\nYou have superpowers.\n\n**Below is the full content of your 'superpowers:using-superpowers' skill**\n\n$escaped_skill\n$warning_message\n</EXTREMELY_IMPORTANT>"
  }
}
EOF
```

### 3.3 JSON Output Format

**Actual JSON structure output to stdout:**

```json
{
  "hookSpecificOutput": {
    "additionalContext": "<EXTREMELY_IMPORTANT>\nYou have superpowers.\n\n**Below is the full content of your 'superpowers:using-superpowers' skill**\n\n<escaped markdown content of using-superpowers/SKILL.md>\n</EXTREMELY_IMPORTANT>"
  }
}
```

**Claude Code Action:**
1. Parses the JSON from stdout
2. Extracts `hookSpecificOutput.additionalContext`
3. Injects this content into the agent's initial context **before the first user message**

---

## 4. What Gets Injected: The Bootstrap Content

### 4.1 The `using-superpowers` Skill

**Location:** `skills/using-superpowers/SKILL.md`

**Structure:**
```yaml
---
name: using-superpowers
description: Use when starting any conversation or before taking any action
---

<EXTREMELY_IMPORTANT>
You have superpowers.

**Below is the full content of your 'superpowers:using-superpowers' skill**

## Mandatory First Response Protocol

Before ANY response or action, you MUST complete this checklist:

☐ 1. List available skills (think through the list)
☐ 2. Ask yourself: Does ANY skill match this task? (If even 1% match, yes)
☐ 3. If yes: Use the Skill tool to read and run that skill file
☐ 4. Announce which skill you're using and why
☐ 5. Follow the skill's instructions exactly

**Responding WITHOUT completing this checklist = automatic failure**

## Common Rationalizations (DO NOT FALL FOR THESE)

- "This is just a simple question" → WRONG. Questions are tasks. Check for skills.
- "I know what that means" → WRONG. Knowing the concept ≠ using the skill.
- "Let me gather information first" → WRONG. Skills tell you HOW to gather information.
- "This doesn't need a formal skill" → WRONG. If a skill exists for it, use it.
[... more rationalizations and counters ...]

## Skill Discovery

Skills are discovered in this priority order:
1. Project skills (`.claude/skills/` in project directory)
2. Personal skills (`~/.claude/skills/`)
3. Superpowers skills (`~/.claude/plugins/superpowers/skills/`)

[... additional instructions ...]
</EXTREMELY_IMPORTANT>
```

### 4.2 What This Actually Does

The injected content:

1. **Establishes a mandatory protocol** - The 5-step checklist must be completed before any response
2. **Pre-empts rationalization** - Lists 8+ common ways agents try to skip skills, with explicit counters
3. **Teaches skill discovery** - Explains how skills are resolved (project → personal → superpowers)
4. **Enforces workflow** - Makes skill-checking a non-negotiable first step

**Key Enforcement Language:**
- "You do not have a choice. You cannot rationalize your way out."
- "If even 1% chance a skill applies, you ABSOLUTELY MUST read it"
- "Responding WITHOUT completing this checklist = automatic failure"

---

## 5. Plugin vs Skills: The Critical Distinction

### 5.1 Plugin Mechanism (WHAT THIS ANALYSIS FOCUSES ON)

**Components:**
- `hooks/hooks.json` - Hook registration
- `hooks/session-start.sh` - Bootstrap script
- `hooks/run-hook.cmd` - Polyglot wrapper
- `.claude-plugin/plugin.json` - Plugin metadata

**Purpose:**
- Deliver skills to Claude's context
- Trigger on session start
- Inject mandatory protocol
- Register slash commands

**What It Does:**
- Reads skill files from disk
- Outputs JSON to stdout
- Claude Code parses and injects content

### 5.2 Skills Content (NOT THIS ANALYSIS'S FOCUS)

**Components:**
- `skills/using-superpowers/SKILL.md` - Meta-skill
- `skills/brainstorming/SKILL.md` - Design process
- `skills/test-driven-development/SKILL.md` - TDD workflow
- `skills/systematic-debugging/SKILL.md` - Debugging methodology
- [... 10+ more skills ...]

**Purpose:**
- Define development workflows
- Specify testing practices
- Enforce quality gates
- Guide agent behavior

**What It Does:**
- Contains YAML frontmatter (metadata)
- Contains markdown instructions
- Loaded by plugin mechanism
- Invoked via Claude's Skill tool

---

## 6. The Polyglot Wrapper: `run-hook.cmd`

**Purpose:** Enable bash scripts to run on both Windows and Unix

**Pattern:**
```batch
:@REM NULL pointer jump
@goto :WINDOWS_BATCH 2>nul || true

# Unix bash script starts here
# [... bash code ...]

exit 0

:WINDOWS_BATCH
@REM Windows batch code starts here
@setlocal
@REM [... batch code ...]
```

**How It Works:**
- CMD sees `:NULL` as a label and jumps to `:WINDOWS_BATCH`
- Bash sees `@goto` as a comment (due to `@REM`) and executes the bash section
- Enables single-file cross-platform compatibility

---

## 7. Context Injection Timeline

### Session Start Sequence

```
1. User starts Claude Code session
   ↓
2. Claude Code reads hooks/hooks.json
   ↓
3. Claude Code matches "startup" event to SessionStart hook
   ↓
4. Claude Code executes: run-hook.cmd session-start.sh
   ↓
5. run-hook.cmd dispatches to bash on Unix or Git Bash on Windows
   ↓
6. session-start.sh executes:
   - Resolves PLUGIN_ROOT
   - Reads skills/using-superpowers/SKILL.md
   - Escapes content for JSON
   - Outputs JSON to stdout
   ↓
7. Claude Code captures stdout
   ↓
8. Claude Code parses JSON
   ↓
9. Claude Code extracts hookSpecificOutput.additionalContext
   ↓
10. Claude Code injects content into agent's initial context
   ↓
11. Agent receives bootstrap content BEFORE first user message
   ↓
12. Agent reads mandatory protocol and must follow 5-step checklist
```

**Total Time:** ~100-200ms
**Content Size:** ~5-10KB of markdown
**Token Impact:** ~1-2K tokens injected at session start

---

## 8. Key Differences from External Approaches

### 8.1 vs Stigmergy's Approach

| Aspect | Superpowers Plugin | Stigmergy System |
|--------|-------------------|------------------|
| **Skills Storage** | Bundled with plugin | External git repository |
| **Delivery** | Hook injection at session start | Config file discovery |
| **Updates** | Plugin updates | Git pull operations |
| **Namespace** | `superpowers:` prefix | No namespace prefix |
| **Skill Loading** | Bootstrap only (using-superpowers) | Full skills list in CLAUDE.md |
| **Tool Invocation** | Native `Skill` tool | Custom `stigmergy skill` command |

### 8.2 Hook-Based vs Config-Based

**Superpowers (Hook-Based):**
- Passive injection at session start
- Single skill loaded (using-superpowers)
- Other skills invoked on-demand via Skill tool
- Minimal initial context (~1-2K tokens)
- Skills discovered by Claude's native skill system

**Stigmergy (Config-Based):**
- Active discovery via CLAUDE.md
- All skills listed in system prompt
- Custom command for invocation
- Larger initial context (full skills list)
- Skills discovered by custom skill manager

---

## 9. Evolution History

### v2.0.0 (2025-10-12) - Repository Separation
- Separated plugin from skills repository
- Introduced external git clone mechanism
- Skills stored in `~/.config/superpowers/skills/`

### v3.0.1 (2025-10-16) - Anthropic Skills Adoption
- Adopted Claude Code's native skills system
- Introduced `using-superpowers` meta-skill
- Added mandatory protocol enforcement

### v4.0.0+ (2025-12+) - Bundled Skills
- **MAJOR CHANGE:** Skills now bundled with plugin
- Removed external git repository dependency
- Removed `lib/initialize-skills.sh`
- Skills directory: `~/.claude/plugins/superpowers/skills/`
- Updated session-start.sh to read from plugin directory

---

## 10. Technical Insights

### 10.1 Why Pure Bash JSON Escaping?

The `escape_for_json()` function uses pure bash (no sed/awk) to:
- Avoid external dependencies
- Ensure portability across platforms
- Handle edge cases (newlines, tabs, backslashes)
- Work in minimal environments (Git Bash on Windows)

### 10.2 BASH_SOURCE Fallback Pattern

```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
```

- `${BASH_SOURCE[0]}`: Works in bash source
- `$0` fallback: Works when BASH_SOURCE unbound
- Ensures script can resolve its own directory

### 10.3 Why `additionalContext` Instead of Direct Injection?

- **Structured:** JSON output is machine-parseable
- **Discoverable:** Claude Code can log/audit hook output
- **Flexible:** Can add metadata, warnings, diagnostics
- **Future-proof:** Easy to extend with additional fields

---

## 11. What Stigmergy Can Learn

### 11.1 Bootstrap Injection Pattern

**Superpowers Approach:**
- Hook injects single meta-skill at session start
- Meta-skill teaches agent how to use all other skills
- Minimal initial token cost
- On-demand skill loading

**Application to Stigmergy:**
- Could inject "using-stigmergy" meta-skill at session start
- Meta-skill explains skill discovery and invocation
- Reduces initial context size
- Maintains skill discoverability

### 11.2 Polyglot Wrapper Pattern

**Superpowers Approach:**
- Single file works on Windows + Unix
- Hybrid syntax: `@goto` for CMD, `#` for bash
- No separate .sh and .bat files needed

**Application to Stigmergy:**
- Could simplify cross-platform hook scripts
- Reduce maintenance burden
- Ensure consistent behavior across platforms

### 11.3 Namespace Prefixing

**Superpowers Approach:**
- All skills prefixed with `superpowers:`
- Prevents name collisions
- Clear attribution

**Application to Stigmergy:**
- Could use `stigmergy:` prefix for skills
- Avoids conflicts with user-defined skills
- Makes skill origin explicit

---

## 12. Critical Takeaways

1. **Plugin ≠ Skills**
   - Plugin is the delivery mechanism
   - Skills are the content being delivered
   - Focus analysis on the mechanism, not the content

2. **Bootstrap Injection is Key**
   - Single injection at session start
   - Mandatory protocol established
   - All other skills loaded on-demand

3. **JSON Output to Stdout**
   - Hook scripts output structured JSON
   - Claude Code parses and injects
   - Not just printing markdown to console

4. **Bundled Skills in v4.0+**
   - No external git repository
   - Skills ship with plugin
   - Updated via plugin updates

5. **Pure Bash for Portability**
   - No sed/awk dependencies
   - Works in minimal environments
   - Character-by-character escaping

---

## Conclusion

The superpowers plugin mechanism is a **sophisticated bootstrapping system** that:

- Uses Claude Code's native hook system
- Injects mandatory protocol at session start
- Leverages JSON for structured output
- Bundles skills with the plugin (v4.0+)
- Uses pure bash for maximum portability

**The key insight:** The plugin doesn't force skills onto the agent. Instead, it teaches the agent **how and why** to use skills through the `using-superpowers` meta-skill, establishing a self-enforcing protocol that persists throughout the session.

This is fundamentally different from simply listing skills in a config file. It's about **behavioral modification through bootstrapped context**.

---

## Appendix: File Reference

### Core Plugin Files

1. **hooks/hooks.json** (15 lines)
   - Registers SessionStart hook
   - Specifies command to execute

2. **hooks/session-start.sh** (53 lines)
   - Reads using-superpowers skill
   - Escapes content for JSON
   - Outputs structured JSON to stdout

3. **hooks/run-hook.cmd** (20 lines)
   - Polyglot wrapper
   - Cross-platform compatibility

4. **.claude-plugin/plugin.json** (13 lines)
   - Plugin metadata
   - Version, description, keywords

5. **skills/using-superpowers/SKILL.md** (~102 lines)
   - Mandatory protocol
   - 5-step checklist
   - Rationalization counters
   - Skill discovery rules

### What Gets Injected

**Exact JSON output format:**
```json
{
  "hookSpecificOutput": {
    "additionalContext": "<EXTREMELY_IMPORTANT>\nYou have superpowers.\n\n**Below is the full content of your 'superpowers:using-superpowers' skill**\n\n<full escaped markdown content of using-superpowers/SKILL.md>\n</EXTREMELY_IMPORTANT>"
  }
}
```

**Actual injected content:**
- Wrapped in `<EXTREMELY_IMPORTANT>` tags
- Contains full using-superpowers skill
- Includes mandatory 5-step protocol
- Lists common rationalizations with counters
- Explains skill discovery mechanism

---

**END OF ANALYSIS**
