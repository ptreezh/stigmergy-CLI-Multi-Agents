# Agent Skills Root

This directory contains the Stigmergy skill system that extends AI CLI capabilities with specialized domain knowledge and workflows.

## Skills Directory

- `.agent/skills/` - 50+ skill packages organized by domain

## How Skills Work

Skills are loaded via the Stigmergy skill manager. Each skill has a `SKILL.md` that defines:
- **When to use**: Triggers and descriptions for activation
- **How to use**: Workflows, scripts, and reference files
- **What it provides**: Domain-specific capabilities

## Quick Access

```
stigmergy skill read <skill-name>
```

Or via cross-CLI routing:
```
stigmergy call skill <skill-name>
```

See each skill's `SKILL.md` for full details.
