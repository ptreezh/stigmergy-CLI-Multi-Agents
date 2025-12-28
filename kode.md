# Kode CLI Documentation

## Overview

This document contains configuration and usage information for the Kode CLI tool within the Stigmergy system.

## Basic Information
- **CLI Name**: kode
- **Tool Name**: Kode CLI (Multi-Model Collaboration System)
- **Version**: 1.2.0
- **Installation Command**: `npm install -g @shareai-lab/kode`
- **Version Check**: `kode --version`

## Usage Patterns

The Kode CLI can be invoked in several ways:

1. **Direct execution**: `kode -p [arguments]`
2. **Through Stigmergy coordination layer**: `stigmergy kode "[task]"`
3. **Cross-CLI calls from other tools**: Natural language patterns

### Important Notes
- Kode requires the `-p` flag for non-interactive (pipe/script) execution
- Without `-p`, Kode defaults to interactive mode which requires a TTY
- For Stigmergy integration, always use the `-p` flag format

## Installation

```bash
npm install -g @shareai-lab/kode
```

## Configuration

This tool integrates with Stigmergy through hooks deployed to:
`C:\Users\Zhang\.kode\agents`

## Kode CLI Features

### 1. Multi-Model Support
Kode supports multiple AI models and providers:
- Claude (Anthropic)
- GPT-4/GPT-3.5 (OpenAI)
- Gemini (Google)
- And others via MCP integration

### 2. Agent System
Kode includes a built-in agent management system:
```
/agents - Manage agent configurations
/config - Open config panel
/model - Change your AI provider and model settings
```

### 3. Special Options

| Option | Short | Description |
|--------|-------|-------------|
| `--print` | `-p` | Print response and exit (useful for pipes) |
| `--cwd` | `-c` | Set current working directory |
| `--debug` | `-d` | Enable debug mode |
| `--enable-architect` | `-e` | Enable the Architect tool |
| `--safe` | | Enable strict permission checking mode |
| `--verbose` | | Override verbose mode setting |

### 4. Interactive Commands
When running in interactive mode (without `-p`), Kode supports:
- `/agents` - Manage agent configurations
- `/clear` - Clear conversation history
- `/compact` - Clear history but keep summary
- `/config` - Open config panel
- `/cost` - Show total cost and duration
- `/doctor` - Check installation health
- `/help` - Show help and available commands
- `/init` - Initialize AGENTS.md file
- `/mcp` - Show MCP server connection status
- `/model` - Change AI provider and model settings
- `/modelstatus` - Display current model configuration
- `/onboarding` - Run through the onboarding flow
- `/refresh-commands` - Reload custom commands
- `/resume` - Resume a previous conversation
- `/ctx-viz` - Show token usage breakdown

## Cross-CLI Communication

To call Kode from another CLI tool:

```bash
# Use stigmergy command
stigmergy kode "[task description]"

# Examples:
stigmergy kode "分析这段代码"
stigmergy kode "translate this text"
stigmergy kode "use digital marxist agent for analysis"
```

## Agent/Skill Support

### Supported Agent Types
- Expert agents (专家智能体)
- Skill-based agents (技能智能体)
- Analysis agents (分析智能体)
- General purpose agents (通用智能体)

### Skill Keywords
Kode recognizes the following skill-related keywords:
- Chinese: `技能`, `智能体`, `分析`, `工具`, `方法`, `多模型`, `协作`
- English: `skill`, `agent`, `analysis`, `tool`, `method`, `multi-model`, `collaboration`

### Pre-configured Skills

| Skill Name | Chinese Name | Description |
|------------|--------------|-------------|
| Alienation Analysis | 异化分析技能 | Marxist analysis of worker alienation |
| Digital Marx | 数字马克思智能体 | Digital Marxist theory analysis |
| Technical Analysis | 技术分析技能 | Technical and code analysis |
| Class Analysis | 阶级分析技能 | Social class analysis |

## 12-Language Natural Language Support

Kode CLI supports auto-call patterns in 12 languages:

| Language | Pattern Example | Translation |
|----------|-----------------|-------------|
| English | `use kode to analyze code` | Use Kode to analyze code |
| Chinese | `请用kode帮我分析代码` | Please use Kode to help analyze code |
| Japanese | `kodeを使って分析してください` | Please use Kode to analyze |
| German | `benutze kode um code zu analysieren` | Use Kode to analyze code |
| French | `utilise kode pour analyser le code` | Use Kode to analyze code |
| Spanish | `usa kode para analizar código` | Use Kode to analyze code |
| Italian | `usa kode per analizzare il codice` | Use Kode to analyze code |
| Russian | `использовать kode для анализа кода` | Use Kode to analyze code |
| Korean | `kode를 사용하여 코드 분석` | Use Kode to analyze code |
| Turkish | `kode kullanarak kod analiz et` | Analyze code using Kode |
| Portuguese | `use kode para analisar código` | Use Kode to analyze code |
| Arabic | `استخدم kode لتحليل الكود` | Use Kode to analyze code |

## Usage Examples

### Basic Usage
```bash
# Simple task
stigmergy kode "explain how recursion works"

# Code analysis
stigmergy kode "analyze this Python function"

# Translation
stigmergy kode "translate to Spanish: Hello world"
```

### Using Agents
```bash
# Digital Marx agent
stigmergy kode "use digital marxist agent to analyze worker alienation in tech"

# Technical analysis
stigmergy kode "use technical analysis skill to review this code architecture"
```

### Multi-Model Collaboration
```bash
# Switch models during conversation
stigmergy kode "/model switch to claude-3-opus for this task"

# Enable architect mode
stigmergy kode --enable-architect "design a microservices architecture"
```

### Working Directory
```bash
# Set custom working directory
stigmergy kode --cwd /path/to/project "analyze the codebase"
```

## Parameter Format Support

Stigmergy automatically optimizes parameters for Kode:

### Input
```
请用 kode 数字马克思智能体 进行异化分析
```

### Optimized Command
```bash
kode -p "请用 kode 数字马克思智能体 进行异化分析技能"
```

### Compatibility Scoring
- **Base Score**: 0.9 (supports agent and skill detection)
- **Agent Mention**: +0.1 (when agent is mentioned)
- **Skill Mention**: +0.0 (already included in base)
- **Maximum**: 1.0 (perfect compatibility)

## Integration with Stigmergy

### Command Format
```javascript
commandFormat: 'kode -p "{prompt}"'
```

### Features
- **Agent Detection**: ✅ Enabled
- **Skill Detection**: ✅ Enabled
- **Natural Language Support**: ✅ Enabled
- **Positional Arguments**: ✅ Enabled
- **12-Language Patterns**: ✅ Supported

### Hook Integration
Hooks are deployed to:
- `~/.kode/agents/` - Agent configurations
- `~/.kode/config.json` - Main configuration file
- `~/.stigmergy/hooks/kode/` - Stigmergy integration hooks

## Troubleshooting

### Issue: "too many arguments"
**Cause**: Kode requires arguments to be passed as a single string with `-p` flag
**Solution**: Stigmergy automatically handles this with `kode -p "{prompt}"` format

### Issue: API 429 Error (Account Suspended)
**Cause**: Insufficient balance in Kode account
**Solution**: Recharge your Kode API account at https://shareai-lab.com

### Issue: Interactive Mode Hangs
**Cause**: Kode defaults to interactive mode without `-p` flag
**Solution**: Always use the `-p` flag for non-interactive execution

## Advanced Usage

### MCP Server Integration
Kode supports Model Context Protocol (MCP) servers:
```bash
# Check MCP connection status
kode "/mcp"

# Use MCP tools in your prompts
stigmergy kode "use the filesystem MCP tool to list files"
```

### Session Management
```bash
# Resume previous session
kode resume 0  # Resume session 0
kode resume    # Resume most recent session

# View conversation logs
kode log 0     # View log for session 0
```

### Error Analysis
```bash
# View error logs
kode error 0   # View error log 0
kode error -1  # View most recent error
```

## Configuration File

Location: `~/.kode/config.json`

Example structure:
```json
{
  "theme": "dark",
  "defaultModel": "claude-3-5-sonnet-20241022",
  "enableArchitect": false,
  "safeMode": false,
  "verbose": false
}
```

## Tips and Best Practices

1. **Always use `-p` flag** for script/pipe integration
2. **Use agent names** for specialized tasks
3. **Enable architect mode** (`-e`) for system design tasks
4. **Set working directory** (`-c`) for project-specific tasks
5. **Check model status** before complex multi-step tasks
6. **Use `/compact`** to save context during long conversations

## See Also

- [Stigmergy Main Documentation](./STIGMERGY.md)
- [README.md](./README.md)
- [AGENTS.md](./AGENTS.md)
- Kode Official: https://github.com/shareai-lab/kode

---

**Last Updated**: 2025-12-23
**Version**: 1.3.1-beta.0
**Integration Status**: ✅ Fully Integrated
