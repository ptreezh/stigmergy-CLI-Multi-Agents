# Skill Command Modules

High-level skill management commands, bridging Stigmergy to OpenSkills.

## Files

- `skill.js` - Main skill command handler, delegates to `StigmergySkillManager` + `SkillSyncManager`
- `enhanced-skill-manager.js` - Extended commands: list-collections, presets, search, info
- `skill-handler.js`, `skill-bridge.js`, `skills-hub.js` - OpenSkills bridge components

## Key Actions

`install`, `list-collections`, `presets`, `search`, `info`, `describe` - all routed through `StigmergySkillManager` in `src/core/skills/`.
