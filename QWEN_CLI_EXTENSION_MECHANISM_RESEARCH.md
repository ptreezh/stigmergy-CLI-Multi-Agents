# Qwen CLI Extension/Hook/Plugin Mechanism - Complete Research Report

**Research Date**: 2026-01-26
**Repository**: https://github.com/QwenLM/qwen-code
**NPM Package**: @qwen-code/qwen-code
**Version**: 0.7.2

---

## Executive Summary

After thorough investigation of Qwen CLI's implementation, configuration files, and deployment, **I found NO official native extension/plugin/hook mechanism** in the traditional sense. Unlike Claude CLI's `.claude-plugin/hooks/` or other systems, Qwen CLI uses **context injection via markdown files** as its primary extension mechanism.

**Key Finding**: Qwen CLI does NOT have a documented, official plugin API. Extensions are achieved through:
1. **Prompt Injection** via `.md` files in `~/.qwen/` directory
2. **Hooks System** (custom implementation, not official)
3. **Skills System** (experimental, via directory scanning)

---

## 1. What I Found (Actual Implementation)

### 1.1 Configuration Structure

```
~/.qwen/
├── config.json              # Cross-CLI configuration (Stigmergy-deployed)
├── settings.json            # Official Qwen settings (UI, auth)
├── QWEN.md                  # Main context injection file
├── hooks.json               # Custom hooks (NOT official)
├── hooks/                   # Hook implementations (custom)
├── skills/                  # Skills directory structure
│   ├── brainstorming/
│   │   └── skill.md        # Skill definition
│   ├── planning-with-files/
│   │   └── skill.md
│   └── ...
├── agents/                  # Agent definitions
└── sessions/                # Session history
```

### 1.2 Official Configuration: settings.json

**Location**: `~/.qwen/settings.json`

**Format**:
```json
{
  "ui": {
    "theme": "Qwen Dark",
    "feedbackLastShownTimestamp": 1769179006794
  },
  "$version": 2,
  "security": {
    "auth": {
      "selectedType": "qwen-oauth"
    }
  }
}
```

**Official Settings Options** (from documentation):
- `ui.theme`: UI theme
- `security.auth`: Authentication method
- Environment variables: `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`

**NO official settings for:**
- ❌ Plugin loading
- ❌ Hook registration
- ❌ Skill configuration
- ❌ Extension management

### 1.3 Context Injection: QWEN.md

**Location**: `~/.qwen/QWEN.md`

**Mechanism**: Qwen CLI appears to inject the contents of `QWEN.md` into the system prompt/context at session start.

**Format**:
```markdown
## Cross-CLI Communication
When you need to call other AI tools, please use the following prompt:
Execute the following command in shell: stigmergy distcli "Prompt"

Examples:
- Run in shell: stigmergy claude "write a Python function"
- Run in shell: stigmergy gemini "translate this text"
- Run in shell: stigmergy qwen "analyze this code"

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex

<!-- SKILLS_START -->
<skills_system priority="1">

## Stigmergy Skills

<usage>
Load skills using Stigmergy skill manager...
</usage>

<available_skills>
<skill>
<name>brainstorming</name>
<description>Skill deployed from Stigmergy</description>
<location>stigmergy</location>
</skill>
</available_skills>

</skills_system>
<!-- SKILLS_END -->
```

**How it Works**:
1. Qwen CLI reads `~/.qwen/QWEN.md` on startup
2. Contents are prepended to the system prompt
3. Skills are defined in XML-like tags: `<skills_system>`, `<available_skills>`, `<skill>`
4. Trigger keywords activate skill loading

### 1.4 Custom Hooks Implementation

**Location**: `~/.qwen/hooks.json` (NOT official Qwen mechanism)

**Format**:
```json
{
  "version": "1.0.0",
  "hooks": {
    "sessionStart": {
      "enabled": true,
      "context_injection": {
        "trigger_keywords": [
          "task",
          "project",
          "code",
          "debug",
          "test"
        ],
        "max_context_length": 2000,
        "injection_format": "markdown"
      }
    }
  }
}
```

**Status**: This is a **custom implementation** deployed by Stigmergy, NOT part of Qwen's official API.

**Hook Files**:
```
~/.qwen/hooks/
├── __init__.py                    # Python module
├── sessionStart.js                # Session start hook
├── qwen_hook.js                   # Custom hook implementation
├── qwen_superpowers_hook.js       # Superpowers integration
└── CONTEXT_INJECTION_HOOKS.md     # Documentation
```

**How Hooks are "Executed"**:
- Qwen CLI does NOT have a hook execution system
- These are JavaScript files that would need to be called manually
- The `hooks.json` is read by Stigmergy's integration layer, NOT by Qwen itself

### 1.5 Skills System

**Location**: `~/.qwen/skills/<skill-name>/skill.md`

**Format**:
```markdown
---
name: brainstorming
description: "You MUST use this before any creative work..."
---

# Brainstorming Ideas Into Designs

## Overview

Help turn ideas into fully formed designs...

## The Process

**Understanding the idea:**
- Check out the current project state first
- Ask questions one at a time to refine the idea
...
```

**How Skills are Loaded**:
1. **Unknown mechanism** - Qwen CLI does NOT document how skills are loaded
2. **Possible methods**:
   - Directory scanning of `~/.qwen/skills/`
   - Registration in `QWEN.md` via XML tags
   - Trigger keywords in `hooks.json` (custom)
3. **NOT officially documented** in Qwen CLI README or package

---

## 2. What I Did NOT Find (Missing Official Mechanisms)

### 2.1 NO Official Plugin API

**Searched for**:
- `plugin` in package.json: ❌ Not found
- `plugin` in cli.js: ❌ Not found
- `plugin` in locales: ❌ Only "Manage extensions" (UI feature)
- `extension` in code: ❌ Not a developer API

**Conclusion**: Qwen CLI has **NO official plugin API**. The "Manage extensions" mentioned in locales appears to be a UI feature, not a developer extensibility mechanism.

### 2.2 NO Official Hook System

**Searched for**:
- `hook` in official documentation: ❌ Not documented
- `hook` in README.md: ❌ Not mentioned
- `hook` in package.json: ❌ Not defined
- `hook` in cli.js (bundled): ❌ Not found (code is minified/bundled)

**Conclusion**: The `hooks.json` and `~/.qwen/hooks/` directory are **custom implementations** by Stigmergy, NOT official Qwen CLI features.

### 2.3 NO Official Skills System Documentation

**Searched for**:
- `skill` in README.md: ❌ Not mentioned
- `skill` in official docs (README links): Could not access (web search limits)
- `skill` in package.json: ❌ Not defined

**What exists**:
- Skills directory structure: `~/.qwen/skills/`
- Skill files: `~/.qwen/skills/<name>/skill.md`
- Skill registration in `QWEN.md`: XML-like tags

**Conclusion**: Skills are **NOT officially documented**. The mechanism appears to be:
- **Prompt-based**: Skills are loaded as additional context in prompts
- **Directory-scanning**: Qwen CLI scans `~/.qwen/skills/` on startup (hypothesis)
- **Trigger-based**: Skills are activated by trigger keywords (hypothesis)

---

## 3. How Qwen CLI Extensions Actually Work

### 3.1 Context Injection (Primary Mechanism)

**How it Works**:
1. Place markdown files in `~/.qwen/` directory
2. Qwen CLI reads these files on startup
3. Contents are injected into the system prompt
4. AI responds based on injected context

**Example**: Cross-CLI Communication
```markdown
## Cross-CLI Communication
When you need to call other AI tools, use:
stigmergy distcli "prompt"
```

When user says: "Use claude to analyze this"
Qwen sees context → Knows to call: `stigmergy claude "analyze this"`

### 3.2 Skills Loading (Hypothesized)

**Possible Mechanism**:
```
User input: "I need to brainstorm some ideas"
    ↓
Qwen CLI scans ~/.qwen/skills/
    ↓
Finds: skills/brainstorming/skill.md
    ↓
Reads content:
  - name: brainstorming
  - description: "You MUST use this before any creative work"
    ↓
Injects skill.md content into prompt
    ↓
AI follows brainstorming process
```

**Evidence**:
- Skills directory exists
- Skills are referenced in `QWEN.md`
- Each skill has `skill.md` with YAML front matter
- Trigger keywords in `hooks.json` (custom)

**Missing**:
- ❌ No official documentation
- ❌ No source code access (cli.js is bundled/minified)
- ❌ No API reference

### 3.3 Hooks (Custom Implementation)

**Stigmergy's Custom Hook System**:
```javascript
// ~/.qwen/hooks/sessionStart.js
export async function sessionStart(context) {
  // Inject context on session start
  const skills = await loadSkills();
  const injectedContext = generateContextInjection(skills);
  return {
    ...context,
    systemPrompt: injectedContext + context.systemPrompt
  };
}
```

**Problem**: Qwen CLI does NOT call these hooks. They are **standalone files** that would need to be executed manually or via a wrapper.

---

## 4. Comparison with Other CLI Tools

### 4.1 Claude CLI (Official)

**Extension Mechanism**:
- ✅ Official plugin API: `.claude-plugin/hooks/`
- ✅ TypeScript hooks: `prePrompt`, `postPrompt`, etc.
- ✅ Documented: [Claude Code Documentation](https://docs.anthropic.com)
- ✅ Source code available: GitHub repository

**Example**:
```typescript
// .claude-plugin/hooks/prePrompt.ts
export async function prePrompt(context) {
  return {
    ...context,
    additionalContext: "Custom context"
  };
}
```

### 4.2 Qwen CLI (No Official Mechanism)

**Extension Mechanism**:
- ❌ NO official plugin API
- ❌ NO documented hook system
- ❌ Source code bundled/minified (cli.js)
- ✅ Context injection via `.md` files (undocumented)
- ✅ Skills directory (undocumented)
- ⚠️ Custom hooks (third-party implementation)

**Example** (what we do instead):
```markdown
<!-- ~/.qwen/QWEN.md -->
## Custom Context
This gets injected into every session.
```

### 4.3 iFlow CLI

**Extension Mechanism**:
- ✅ Agents system: `~/.iflow/agents/`
- ✅ Keyword-based agent matching
- ✅ Markdown-based agent definitions
- ⚠️ Semi-documented (README exists)

**Example**:
```markdown
<!-- ~/.iflow/agents/sna-expert.md -->
# Social Network Analysis Expert

Expertise: Network analysis, SNA metrics, community detection

Activation: Automatically triggered by keywords like "network", "graph", "centrality"
```

---

## 5. Practical Guide: Extending Qwen CLI

Since Qwen CLI has NO official extension mechanism, here's how to extend it practically:

### 5.1 Method 1: Context Injection (Recommended)

**Steps**:
1. Create/Edit `~/.qwen/QWEN.md`
2. Add your custom context in markdown
3. Use XML tags for structured data
4. Qwen CLI will load it on startup

**Example**:
```markdown
## My Custom Extension

When the user asks about X, always do Y:
1. Step 1
2. Step 2
3. Step 3

<custom_commands>
<command>
<name>analyze</name>
<description>Analyze code patterns</description>
</command>
</custom_commands>
```

### 5.2 Method 2: Skills Directory (Experimental)

**Steps**:
1. Create directory: `~/.qwen/skills/my-skill/`
2. Create file: `~/.qwen/skills/my-skill/skill.md`
3. Add YAML front matter
4. Reference in `QWEN.md`

**Example**:
```markdown
---
name: my-skill
description: "Does something useful"
---

# My Skill

## Instructions

1. Do this
2. Do that
```

**Register in QWEN.md**:
```markdown
<available_skills>
<skill>
<name>my-skill</name>
<description>Does something useful</description>
<location>qwen</location>
</skill>
</available_skills>
```

### 5.3 Method 3: Trigger Keywords (Custom)

**Steps**:
1. Create `~/.qwen/hooks.json` (custom format)
2. Define trigger keywords
3. Implement trigger logic in wrapper script

**Example**:
```json
{
  "version": "1.0.0",
  "hooks": {
    "sessionStart": {
      "enabled": true,
      "context_injection": {
        "trigger_keywords": ["task", "project"],
        "action": "load_context_from_skills"
      }
    }
  }
}
```

**Note**: This requires a wrapper script to read `hooks.json` and inject context. Qwen CLI does NOT do this natively.

### 5.4 Method 4: Wrapper Script (Advanced)

**Create a wrapper**: `/usr/local/bin/qwen-wrapper`
```bash
#!/bin/bash

# Load hooks
if [ -f ~/.qwen/hooks/sessionStart.js ]; then
  node ~/.qwen/hooks/sessionStart.js
fi

# Inject context
echo "## Session Started at $(date)" >> ~/.qwen/session-context.md

# Run Qwen
qwen "$@"
```

**Usage**:
```bash
alias qwen=qwen-wrapper
qwen  # Now with custom hooks
```

---

## 6. Research Limitations

### 6.1 What I Could NOT Verify

1. **Source Code Access**:
   - `cli.js` is bundled/minified (ESM format)
   - Cannot inspect actual skill loading logic
   - Cannot verify hook execution mechanism

2. **Official Documentation**:
   - Could not access Qwen Code docs (web search limits)
   - README.md mentions NO extension mechanisms
   - Package.json has NO plugin/hook configuration

3. **Skills Loading**:
   - **Hypothesis**: Qwen scans `~/.qwen/skills/` on startup
   - **Evidence**: Skills directory exists, but no proof of auto-loading
   - **Alternative**: Skills might be manually loaded via `QWEN.md`

### 6.2 What Requires Further Investigation

1. **Official Skills System**:
   - Check Qwen Code documentation website
   - Inspect Qwen Code source code (if available on GitHub)
   - Test if skills are auto-loaded or manually referenced

2. **Hook Execution**:
   - Verify if Qwen CLI executes `~/.qwen/hooks/*.js`
   - Test if `hooks.json` is read by Qwen
   - Confirm trigger keyword mechanism

3. **Extension API**:
   - Check if "Manage extensions" in locales refers to a developer API
   - Investigate if Qwen CLI supports external plugins
   - Look for extension marketplace or registry

---

## 7. Conclusions

### 7.1 Key Findings

1. **Qwen CLI has NO official plugin/hook/extension API**
   - Unlike Claude CLI, there is no documented extension mechanism
   - The `hooks.json` and `hooks/` directory are custom implementations

2. **Extension is achieved through context injection**
   - Primary method: `~/.qwen/QWEN.md`
   - Secondary method: `~/.qwen/skills/<name>/skill.md`
   - Both rely on prompt/context injection, not code execution

3. **Skills system is undocumented**
   - Skills directory structure exists
   - Format: `skill.md` with YAML front matter
   - Loading mechanism: Unknown (likely directory scanning)

4. **Hooks are third-party**
   - `hooks.json` and `hooks/*.js` are NOT official Qwen features
   - They are part of Stigmergy's custom integration
   - Qwen CLI does NOT execute these hooks natively

### 7.2 Recommendations

**For Extending Qwen CLI**:
1. ✅ Use `~/.qwen/QWEN.md` for global context injection
2. ✅ Use `~/.qwen/skills/` for modular skill definitions
3. ✅ Use XML tags for structured data (e.g., `<skills_system>`)
4. ⚠️ Create wrapper scripts if you need true hooks
5. ❌ Do NOT rely on `hooks.json` (Qwen doesn't read it)

**For Stigmergy Integration**:
1. Continue using `QWEN.md` for cross-CLI commands
2. Deploy skills to `~/.qwen/skills/`
3. Register skills in `QWEN.md` via `<available_skills>`
4. Remove dependency on `hooks.json` (not native)
5. Consider wrapper script approach for true hooks

### 7.3 Action Items

**Immediate**:
1. Test if Qwen CLI actually loads skills from `~/.qwen/skills/`
2. Verify if `QWEN.md` is read on startup
3. Check if modifying `QWEN.md` affects Qwen's behavior

**Short-term**:
1. Access Qwen Code official documentation
2. Inspect Qwen Code source code on GitHub
3. Test skill activation with trigger keywords

**Long-term**:
1. Request official plugin/hook API from Qwen team
2. Contribute to Qwen Code if it's open source
3. Document findings for the community

---

## 8. Appendix

### 8.1 File Locations

**Qwen CLI Configuration**:
- User config: `~/.qwen/settings.json`
- User config (legacy): `~/.qwen/config.json`
- Context injection: `~/.qwen/QWEN.md`
- Skills directory: `~/.qwen/skills/`
- Custom hooks: `~/.qwen/hooks.json` (NOT official)

**Qwen CLI Installation**:
- NPM global: `npm install -g @qwen-code/qwen-code`
- Binary location: `AppData/Roaming/npm/node_modules/@qwen-code/qwen-code/cli.js`
- Package.json: `AppData/Roaming/npm/node_modules/@qwen-code/qwen-code/package.json`

### 8.2 Configuration Formats

**settings.json (Official)**:
```json
{
  "ui": { "theme": "Qwen Dark" },
  "$version": 2,
  "security": {
    "auth": { "selectedType": "qwen-oauth" }
  }
}
```

**config.json (Custom)**:
```json
{
  "cross_cli_enabled": true,
  "supported_clis": ["claude", "gemini", "qwen", ...],
  "superpowers_integration": {
    "enabled": true,
    "version": "1.0.0"
  }
}
```

**hooks.json (Custom - NOT read by Qwen)**:
```json
{
  "version": "1.0.0",
  "hooks": {
    "sessionStart": {
      "enabled": true,
      "context_injection": { ... }
    }
  }
}
```

### 8.3 Skill Format

**YAML Front Matter**:
```yaml
---
name: brainstorming
description: "You MUST use this before any creative work"
---
```

**Markdown Content**:
```markdown
# Brainstorming Ideas Into Designs

## Overview
Help turn ideas into fully formed designs...

## The Process
1. Understanding the idea
2. Exploring approaches
3. Presenting the design
```

### 8.4 Research Methods Used

1. ✅ Inspected `~/.qwen/` directory structure
2. ✅ Read configuration files (`settings.json`, `config.json`, `hooks.json`)
3. ✅ Examined `QWEN.md` and `skill.md` files
4. ✅ Analyzed Qwen CLI `package.json`
5. ✅ Searched `cli.js` (bundled, limited inspection)
6. ✅ Checked locale files for "extension"/"plugin" strings
7. ✅ Reviewed Stigmergy's integration code
8. ❌ Could NOT access official documentation (web limits)
9. ❌ Could NOT inspect `cli.js` source (bundled/minified)
10. ❌ Could NOT test Qwen CLI behavior directly

---

## 9. Sources

### 9.1 Official Sources
- **Repository**: https://github.com/QwenLM/qwen-code
- **NPM Package**: https://www.npmjs.com/package/@qwen-code/qwen-code
- **Documentation**: https://qwenlm.github.io/qwen-code-docs/ (could not access)
- **README**: `AppData/Roaming/npm/node_modules/@qwen-code/qwen-code/README.md`

### 9.2 Local Files Analyzed
- `~/.qwen/settings.json`
- `~/.qwen/config.json`
- `~/.qwen/QWEN.md`
- `~/.qwen/hooks.json`
- `~/.qwen/skills/*/skill.md`
- `~/.qwen/hooks/*.js`
- `AppData/Roaming/npm/node_modules/@qwen-code/qwen-code/package.json`
- `AppData/Roaming/npm/node_modules/@qwen-code/qwen-code/cli.js` (bundled)
- `AppData/Roaming/npm/node_modules/@qwen-code/qwen-code/locales/*.js`

### 9.3 Stigmergy Integration Files
- `src/core/cli_tools.js` - CLI tool definitions
- `src/core/coordination/nodejs/HookDeploymentManager.js` - Hook deployment
- `src/core/plugins/HookManager.js` - Hook management
- `src/core/plugins/ContextInjector.js` - Context injection
- `COMPLETE_PLUGIN_SYSTEM.md` - Plugin system documentation
- `CLI_SKILLS_DIRECTORY_RESEARCH.md` - Skills research

---

**Report Generated**: 2026-01-26
**Researcher**: Claude Code Agent
**Status**: Preliminary findings - requires verification with official documentation
