---
name: cli-integration-sop
description: CLI 集成标准操作程序 - 用于将新 CLI 工具集成到 Stigmergy 系统
version: 1.0.0
tags: [integration, sop, cli, checklist]
---

# CLI Integration SOP for Stigmergy

## Overview

This document provides a standardized Standard Operating Procedure (SOP) for integrating a new CLI tool into the Stigmergy Multi-Agents CLI Collaboration System.

## CLI Integration Checklist

### Phase 1: Basic Configuration (Files to Modify)

#### 1.1 Add to `src/core/cli_tools.js`

```javascript
// Add new CLI entry to CLI_TOOLS object
<CLI_NAME>: {
  name: '<CLI Full Name>',
  version: '<CLI_NAME> --version',
  install: 'npm install -g <NPM_PACKAGE>',
  hooksDir: path.join(os.homedir(), '.<CLI_NAME>', 'hooks'),
  config: path.join(os.homedir(), '.<CLI_NAME>', 'config.json'),
  autoInstall: true/false, // Set to true for auto-install during postinstall
},
```

#### 1.2 Add to `src/core/cli_path_detector.js`

```javascript
// Add to cliNameMap
this.cliNameMap = {
  // ... existing entries
  "<CLI_NAME>": ["<CLI_COMMAND>"], // Command to detect (e.g., 'kilo' for kilocode)
};
```

### Phase 2: CLI Adapters (src/core/cli_adapters.js)

#### 2.1 Add adapter configuration

```javascript
<CLI_NAME>: {
  // Interactive mode: prompt -> CLI args for interactive execution
  interactive: (prompt) => {
    return prompt ? ['-i', prompt] : [];
  },

  // One-time mode: prompt -> CLI args for non-interactive execution
  oneTime: (prompt) => {
    return ['-p', prompt];
  },

  // Auto mode: args for concurrent/routing modes
  autoMode: () => ['--yolo', '--print'],

  supportsInteractive: true,
  supportsOneTime: true,
  defaultMode: 'interactive',
  verified: false // Set to true after testing
}
```

### Phase 3: Help Analyzer (src/core/cli_help_analyzer.js)

#### 3.1 Add to enhancedPatterns

```javascript
enhancedPatterns: {
  // ... existing entries
  '<CLI_NAME>': {
    commandFormat: '<CLI_COMMAND> -p "{prompt}"',
    agentDetection: true,
    skillDetection: true,
    naturalLanguageSupport: true,
    positionalArgs: true/false,
    agentTypes: ['expert', 'skill', 'analysis', 'agent'],
    skillKeywords: ['技能', '智能体', '分析', '工具', '方法'],
    examples: [
      '<CLI_COMMAND> -p "请使用分析技能分析问题"',
      '<CLI_COMMAND> -p "执行某个任务"'
    ]
  }
}
```

#### 3.2 Add to skillMapping (for cross-CLI skill translation)

```javascript
skillMapping: {
  '<SKILL_NAME>': {
    // ... existing CLI entries
    '<CLI_NAME>': '<SKILL_NAME_IN_CLI>'
  }
}
```

### Phase 4: Concurrent Execution (src/cli/commands/concurrent.js)

#### 4.1 Add to availableCLIs array

```javascript
const availableCLIs = ["claude", "qwen", "gemini", "iflow", "<CLI_NAME>"];
```

#### 4.2 Add switch case for command arguments

```javascript
case '<CLI_NAME>':
  // Determine correct argument format
  args = ['-p', prompt]; // or positional args
  break;
```

### Phase 5: Interactive Mode (src/interactive/InteractiveModeController.js)

#### 5.1 Add to fallback registry in \_scanInstalledCLITools

```javascript
<CLI_NAME>: { name: '<CLI_NAME>', available: false }
```

### Phase 6: Hook Deployment (src/core/coordination/nodejs/HookDeploymentManager.js)

#### 6.1 Add to supportedCLIs array

```javascript
this.supportedCLIs = [
  // ... existing CLIs
  "<CLI_NAME>",
];
```

### Phase 7: Resume Session (src/core/coordination/nodejs/generators/ResumeSessionGenerator.js)

#### 7.1 Add to supportedCLIs

```javascript
this.supportedCLIs = [
  // ... existing CLIs
  "<CLI_NAME>",
];
```

#### 7.2 Add session path configuration

```javascript
getAllCLISessionPaths = () => ({
  // ... existing paths
  <CLI_NAME>: [path.join(homeDir, '.<CLI_NAME>', 'projects')]
});
```

#### 7.3 Add CLI registration code case

```javascript
generateCLIRegistrationCode(cliName) {
  switch(cliName.toLowerCase()) {
    // ... existing cases
    case '<CLI_NAME>':
      // Add CLI-specific registration logic
      break;
  }
}
```

### Phase 8: Skills Sync (src/core/skills/StigmergySkillManager.js)

#### 8.1 Add CLI skill directory

```javascript
const cliSkillDirs = [
  // ... existing dirs
  {
    name: "<CLI Display Name>",
    path: path.join(os.homedir(), ".<CLI_NAME>", "skills"),
  },
];
```

### Phase 9: Adapter Installation Script

#### 9.1 Create `src/adapters/<CLI_NAME>/install_<CLI_NAME>_integration.js`

```javascript
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class <CLI_NAME>Installer {
  constructor() {
    this.toolName = '<CLI_NAME>';
    this.configDir = path.join(os.homedir(), '.<CLI_NAME>');
    this.configFile = path.join(this.configDir, 'config.json');
    this.hooksFile = path.join(this.configDir, 'hooks.json');
  }

  async install() {
    // Create config directory
    await fs.mkdir(this.configDir, { recursive: true });

    // Install configuration
    await this.installConfig();

    // Install hooks
    await this.installHooks();

    // Create documentation
    await this.createCrossCliDocumentation();
  }

  async installConfig() {
    // Create cross-CLI configuration
    const config = {
      cross_cli_enabled: true,
      supported_clis: ['claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'copilot', 'codex', '<CLI_NAME>'],
      stigmergy_integration: true
    };
    await fs.writeFile(this.configFile, JSON.stringify(config, null, 2));
  }

  async installHooks() {
    const hooks = {
      cross_cli_adapter: {
        enabled: true,
        supported_tools: ['claude', 'gemini', 'qwen', 'iflow', 'qodercli', 'codebuddy', 'copilot', 'codex', '<CLI_NAME>']
      }
    };
    await fs.writeFile(this.hooksFile, JSON.stringify(hooks, null, 2));
  }

  async createCrossCliDocumentation() {
    const docPath = path.join(this.configDir, 'CROSS_CLI_GUIDE.md');
    const content = `# <CLI_NAME> CLI Cross-CLI Communication Guide

Cross-CLI communication: <<<Execute: stigmergy distcli "Prompt">>>

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex, <CLI_NAME>
`;
    await fs.writeFile(docPath, content);
  }
}

module.exports = <CLI_NAME>Installer;
```

### Phase 10: Update Documentation

#### 10.1 Update AGENTS.md

- Add CLI to `stigmergy install <tool>` command documentation
- Update any relevant sections

## Verification Steps

After integration, verify:

### 1. Path Detection

```bash
node -e "
const detector = require('./src/core/cli_path_detector');
detector.detectCLIPath('<CLI_NAME>').then(console.log);
"
```

### 2. CLI Adapter

```bash
node -e "
const { CLI_ADAPTERS } = require('./src/core/cli_adapters');
console.log(CLI_ADAPTERS['<CLI_NAME>']);
"
```

### 3. Concurrent Execution

```bash
stigmergy concurrent --concurrency 1 "test prompt"
```

### 4. Interactive Mode

```bash
stigmergy interactive
# Then type: use <CLI_NAME>
```

### 5. Skill Sync

```bash
stigmergy skill install <SOME_SKILL>
# Verify skill appears in ~.<CLI_NAME>/skills/
```

### 6. Resume Session

```bash
stigmergy resume --cli <CLI_NAME>
```

## Rollback Plan

If integration causes issues:

1. Remove from `cli_tools.js`: Comment out or set `autoInstall: false`
2. Remove from `cli_path_detector.js`: Remove from `cliNameMap`
3. Remove adapter: Comment out in `cli_adapters.js`
4. Remove help patterns: Comment out in `cli_help_analyzer.js`
5. Re-run: `stigmergy deploy`

## Common Issues

### CLI Not Detected

- Check npm global path: `npm config get prefix`
- Verify command exists: `which <CLI_COMMAND>` or `where <CLI_COMMAND>`
- Check PATH includes npm global bin directory

### Hook Deployment Fails

- Ensure CLI config directory exists: `~/.CLI_NAME/`
- Check file permissions
- Verify JSON format is valid

### Skills Not Syncing

- Check CLI skills directory exists
- Verify write permissions
- Check skill format compatibility

## Related Files

- `src/core/cli_tools.js` - CLI configuration
- `src/core/cli_path_detector.js` - Path detection
- `src/core/cli_adapters.js` - Execution adapters
- `src/core/cli_help_analyzer.js` - Help pattern analysis
- `src/cli/commands/concurrent.js` - Concurrent execution
- `src/interactive/InteractiveModeController.js` - Interactive mode
- `src/core/coordination/nodejs/HookDeploymentManager.js` - Hook deployment
- `src/core/coordination/nodejs/generators/ResumeSessionGenerator.js` - Resume session
- `src/core/skills/StigmergySkillManager.js` - Skills sync
- `src/adapters/<CLI_NAME>/install_<CLI_NAME>_integration.js` - Installation script
