---
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills, requiring skill invocation before ANY response including clarifying questions
version: 1.0.0
author: universal
cli: universal
---

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

# Using Skills

## Overview

This meta-skill teaches you how to find and use other skills in this CLI environment.

## How to Access Skills

**CLI-Specific Instructions**:

- **Claude CLI**: Use the `Skill` tool to load skills
- **iFlow CLI**: Check `~/.iflow/skills/` directory and read skill.md files
- **Qwen CLI**: Check `~/.qwen/skills/` directory and read skill.md files
- **CodeBuddy CLI**: Check `~/.codebuddy/skills/` directory and read skill.md files

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.**

Even a 1% chance a skill might apply means that you should check for skills first. If an invoked skill turns out to be wrong for the situation, you don't need to use it.

## Decision Flow

```
User message received
    ↓
Might any skill apply?
    ↓ Yes
Check skills directory/Use Skill tool
    ↓
Announce: "Using [skill] to [purpose]"
    ↓
Follow skill instructions exactly
    ↓
Respond to user
```

## Red Flags - You're Rationalizing

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (brainstorming, test-driven-development, systematic-debugging)
   - These determine HOW to approach the task

2. **Implementation skills second** (frontend-design, backend-design)
   - These guide execution

Examples:
- "Let's build X" → brainstorming first, then implementation skills
- "Fix this bug" → systematic-debugging first, then domain-specific skills

## Skill Types

**Rigid Skills** (TDD, systematic-debugging):
- Follow exactly
- Don't adapt away from discipline

**Flexible Skills** (brainstorming, patterns):
- Adapt principles to context

The skill itself tells you which type it is.

## Common Mistakes

### Skipping the skill check
- **Problem**: Miss critical workflows, waste time
- **Fix**: ALWAYS check first, even for "simple" tasks

### Checking after gathering information
- **Problem**: Skills tell you HOW to gather information
- **Fix**: Check skills BEFORE any action

### Assuming you know the skill
- **Problem**: Skills evolve, old memories are wrong
- **Fix**: Always read current version

### Rationalizing away the skill
- **Problem**: Your brain will invent reasons to skip
- **Fix**: Trust the system, use the skill

## Quick Reference

| Situation | Action |
|-----------|--------|
| Starting any conversation | Load using-superpowers first |
| Not sure if skill applies | Load it anyway (1% rule) |
| Multiple skills apply | Process → Implementation order |
| Skill seems wrong | Load it, then decide |
| User says "use X skill" | Load X skill immediately |
| Simple question | Still check for skills |

## CLI-Specific Notes

### For iFlow CLI Users
Skills are stored in `~/.iflow/skills/skill-name/skill.md`
- Browse this directory when starting new tasks
- Read skill.md files to understand each skill
- Mention skill name to load it (e.g., "使用 brainstorming 技能")

### For Qwen CLI Users
Skills are stored in `~/.qwen/skills/skill-name/skill.md`
- Browse this directory when starting new tasks
- Read skill.md files to understand each skill
- Mention skill name to load it (e.g., "使用 brainstorming 技能")

### For CodeBuddy CLI Users
Skills are stored in `~/.codebuddy/skills/skill-name/skill.md`
- Browse this directory when starting new tasks
- Read skill.md files to understand each skill
- Mention skill name to load it (e.g., "使用 brainstorming 技能")

### For Claude CLI Users
Use the `Skill` tool to load skills from `~/.claude/skills/`
- Auto-loads based on description matching
- Most seamless experience

## Integration Examples

### Example 1: Creative Work
```
User: "Let's add a new feature"
AI (with using-superpowers):
  1. Recognizes this is creative work
  2. Loads brainstorming skill
  3. Follows brainstorming process
  4. May also load test-driven-development skill
```

### Example 2: Debugging
```
User: "There's a bug in my code"
AI (with using-superpowers):
  1. Recognizes this is debugging
  2. Loads systematic-debugging skill
  3. Follows debugging process
  4. May also load relevant domain skills
```

### Example 3: Analysis
```
User: "Analyze this system"
AI (with using-superpowers):
  1. Recognizes this is analysis work
  2. Loads relevant analysis skills (field-analysis, network-computation, etc.)
  3. Follows analysis framework
  4. Ensures thorough coverage
```

## Maintaining This Skill

This skill should be updated when:
- New CLI tools are added
- Skill access methods change
- New patterns emerge in skill usage

**Version History**:
- v1.0.0 (2025-01-25): Initial universal version
- Supports: claude, iflow, qwen, codebuddy, codex, gemini, copilot

---

*This is a universal meta-skill that establishes the foundation for all other skills in the system.*
