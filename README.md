# Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System

**English**: A comprehensive system for seamless collaboration between multiple AI CLI tools. Enables intelligent task routing, cross-CLI communication, and unified skill management.

**中文**: 多AI命令行工具协作系统，实现智能任务路由、跨CLI通信和统一技能管理。

**SEO Keywords**: AI CLI, multi-agent collaboration, Claude CLI, Gemini CLI, Qwen CLI, stigmergy, stigmergy gateway, cross-AI orchestration, AI tool manager, command line AI, AI assistant CLI, multi-model AI, AI agents, remote CLI orchestration, AI gateway, chat-to-CLI

[![npm version](https://badge.fury.io/js/stigmergy.svg)](https://www.npmjs.com/package/stigmergy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🤖 **Multi-AI CLI Support**: Claude, Gemini, Qwen, iFlow, Qoder, CodeBuddy, Copilot, Codex, Kode
- 🎯 **Intelligent Task Routing**: Automatically selects the best AI tool for your task
- 🧠 **ResumeSession Integration**: Cross-CLI session recovery and memory sharing (v1.2.1)
- 🔗 **Hook System**: Seamless integration with all AI CLI tools
- 📦 **Agent Skills Manager**: Install and manage skills from any GitHub repository
- 🌍 **JavaScript-First**: No Python dependencies, pure Node.js implementation
- ⚡ **Smart Routing**: Auto-choose the best tool based on task analysis
- 🌐 **12-Language Support**: English, Chinese, Japanese, German, French, Spanish, Italian, Russian, Korean, Turkish, Portuguese, Arabic
- 🔄 **Cross-CLI Skill Sharing**: Skills installed once work across all AI tools
- 🌐 **Stigmergy Gateway**: Remote CLI orchestration via Feishu, Telegram, Slack, Discord - control AI agents from anywhere

---

## 🚀 Stigmergy Gateway - Remote CLI Orchestration

**Stigmergy Gateway** is Stigmergy's remote orchestration feature that lets you control AI CLI tools from chat platforms like Feishu, Telegram, Slack, and Discord. Manage your entire AI team from anywhere!

### 🎯 What is Stigmergy Gateway?

Stigmergy Gateway transforms Stigmergy into a powerful remote AI orchestration system:

- **📱 Chat-to-CLI Bridge**: Send messages on Feishu/Telegram/Slack/Discord → Execute AI CLI commands
- **🌍 Remote Control**: Manage AI agents from your phone or web chat
- **👥 Team Collaboration**: Share AI capabilities across your team via familiar chat tools
- **🔄 Cross-Platform**: Unified interface for 11+ AI CLI tools

### 📋 Stigmergy Gateway Supported Platforms

| Platform          | Status   | Use Case                      |
| ----------------- | -------- | ----------------------------- |
| **Feishu (飞书)** | ✅ Ready | Team collaboration in China   |
| **Telegram**      | ✅ Ready | Global users, bot integration |
| **Slack**         | ✅ Ready | Enterprise teams              |
| **Discord**       | ✅ Ready | Developer communities         |

### 🚀 Quick Start - Stigmergy Gateway

```bash
# Start Gateway with Feishu integration
stigmergy gateway --feishu --port 3000

# Start with Telegram bot
stigmergy gateway --telegram --port 3000

# Enable public access via ngrok tunnel
stigmergy gateway --feishu --tunnel

# Multi-platform mode
stigmergy gateway --feishu --telegram --slack --port 3000

# Set custom working directory
stigmergy gateway --feishu --workdir ./my-project
```

### 🎮 Stigmergy Gateway Usage Examples

#### Send Commands via Feishu

```
User: @AI-Stigmergy write a Python REST API
Stigmergy Bot: ✅ Executing with Claude CLI...
[Claude] Created: api.py with REST endpoints
```

#### Multi-Agent Task via Telegram

```
User: /concurrent analyze this codebase and generate docs
Stigmergy Bot: 🎯 Routing to Claude, Gemini, Qwen...
[Claude] Analysis complete
[Gemini] Docs generated
[Qwen] Summary: 3 files analyzed
```

### 🔧 Stigmergy Gateway Commands

```bash
# Initialize gateway configuration
stigmergy gateway init --feishu

# Check gateway status
stigmergy gateway status

# Stop gateway server
stigmergy gateway stop

# Start with all platforms
stigmergy gateway --feishu --telegram --slack --discord --tunnel
```

### 🌐 Stigmergy Gateway API Endpoints

When Gateway is running, access:

| Endpoint             | Method | Description                     |
| -------------------- | ------ | ------------------------------- |
| `/status`            | GET    | Server status and platform info |
| `/webhook/:platform` | POST   | Receive messages from platforms |
| `/execute`           | POST   | Execute CLI commands remotely   |

### 🔐 Stigmergy Gateway Security

- **Token Validation**: All incoming webhooks validated
- **Command Whitelist**: Configurable command restrictions
- **Audit Logging**: All commands logged for review
- **Rate Limiting**: Prevent abuse with request limits

### 📊 Stigmergy Gateway Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Stigmergy Gateway                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Feishu  │  │ Telegram │  │  Slack   │  │ Discord  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │            │            │            │          │
│       └────────────┴────────────┴────────────┘          │
│                        │                                │
│                ┌───────▼───────┐                        │
│                │  Message      │                        │
│                │  Parser       │                        │
│                └───────┬───────┘                        │
│                        │                                │
│                ┌───────▼───────┐                        │
│                │  Command      │                        │
│                │  Router       │                        │
│                └───────┬───────┘                        │
│                        │                                │
│        ┌───────────────┼───────────────┐               │
│        │               │               │               │
│  ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐         │
│  │   Claude  │  │   Gemini  │  │   Qwen    │         │
│  └───────────┘  └───────────┘  └───────────┘         │
│                      ...                               │
└─────────────────────────────────────────────────────────────┘
```

### 💡 Stigmergy Gateway Use Cases

1. **Remote Team Management**: Control AI agents from chat while commuting
2. **Multi-Channel Notifications**: AI results delivered to Slack/Discord
3. **Voice-to-CLI**: Use voice input via Telegram bots
4. **API Integration**: Build custom workflows with webhook endpoints
5. **CI/CD Pipeline**: Trigger AI tasks from chat commands

- 🌐 **Stigmergy Gateway**: Remote CLI orchestration via Feishu, Telegram, Slack, Discord - control AI agents from anywhere

---

## 📥 Installation

### Prerequisites

- **Node.js**: >= 16.0.0 ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js

### Quick Install

#### Install from npm (Latest Beta)

```bash
# Install globally
npm install -g stigmergy@beta

# Or install specific version
npm install -g stigmergy@1.3.76-beta.0
```

#### Windows (PowerShell as Administrator)

```powershell
# Method 1: Right-click PowerShell and "Run as Administrator"
npm install -g stigmergy@beta

# Method 2: Start PowerShell as Administrator from command line
Start-Process PowerShell -Verb RunAs -ArgumentList "npm install -g stigmergy@beta"
```

#### macOS/Linux

```bash
sudo npm install -g stigmergy@beta
```

### Verify Installation

```bash
stigmergy --version
# Output: 1.3.54-beta.0

stigmergy --help
```

---

## 🚀 Quick Start Guide

### 1️⃣ Complete Setup (Recommended)

```bash
# One-command complete setup
stigmergy setup
```

This command will:

- ✅ Scan for available AI CLI tools
- ✅ Deploy integration hooks to all found tools
- ✅ Install built-in skills (ResumeSession)
- ✅ Initialize project configuration

### 2️⃣ Manual Setup (Step-by-Step)

If you prefer manual control:

```bash
# Scan for available AI CLI tools
stigmergy scan

# Install CLI tools (optional - if you want Stigmergy to install them)
stigmergy install

# Deploy hooks to enable cross-CLI communication
stigmergy deploy hooks

# Initialize project for session recovery
stigmergy init

# Start Stigmergy Gateway for remote orchestration
stigmergy gateway --feishu --port 3000
```

### 3️⃣ Verify Installation

```bash
# Check status of all AI CLI tools
stigmergy status

# Expected output:
# ✓ Claude CLI: installed
# ✓ Gemini CLI: not installed
# ✓ Qwen CLI: installed
# ...
```

---

## 💡 Basic Usage

### Direct CLI Invocation

```bash
# Use specific AI tool
stigmergy claude "write a Python function to calculate fibonacci"
stigmergy gemini "translate this text to Japanese"
stigmergy qwen "analyze this code for security issues"
stigmergy kode "use digital marxist agent to analyze worker alienation"

# Remote orchestration via Stigmergy Gateway
stigmergy gateway --feishu --tunnel  # Control AI from Feishu
stigmergy gateway --telegram --port 3000  # Control AI from Telegram
```

### Smart Routing (Auto-Select Best Tool)

```bash
# Let Stigmergy choose the best tool automatically
stigmergy call "create a modern React component with TypeScript"
stigmergy call "analyze this database schema"
stigmergy call "write a bash script for file backup"
```

### Multi-Language Support

```bash
# Chinese
stigmergy call "请用 kode 帮我分析这个代码"

# Japanese
stigmergy call "kodeを使ってこのコードを分析してください"

# German
stigmergy call "analysiere diesen Code mit Kode"

# And 8 more languages...
```

---

## 📦 Agent Skills Management

Stigmergy includes a powerful skill manager compatible with all agent skill repositories (Vercel, Anthropic, etc.).

### Install Skills from GitHub

```bash
# Vercel AI Skills
stigmergy skill install vercel-labs/agent-skills

# Anthropic Claude Skills
stigmergy skill install anthropics/skills

# Any GitHub repository
stigmergy skill install owner/repo

# With specific path or branch
stigmergy skill install owner/repo@main/skills/pdf
```

### Manage Skills

```bash
# List all installed skills
stigmergy skill list

# Read skill content (for AI agents)
stigmergy skill read pdf

# Remove a skill
stigmergy skill remove pdf

# Validate skill format
stigmergy skill validate ./my-skill/SKILL.md

# Sync skills to AGENTS.md
stigmergy skill sync
```

### Use Skills in AI CLI

#### In Claude Code

```javascript
// Read skill content
Bash("stigmergy skill read algorithmic-art")

// Use skill
claude> Use the algorithmic-art skill to create generative art
```

#### Cross-CLI Skill Sharing

Skills installed with Stigmergy are automatically available across all AI CLI tools:

```bash
# Install once in Claude
stigmergy skill install vercel-labs/agent-skills

# Use in any CLI
claude> stigmergy skill read pdf

qwen> "使用 Claude 的 PDF 技能处理这个文档"

gemini> "analyze this PDF using claude's pdf skill"
```

### Supported URL Formats

Stigmergy intelligently parses 7+ GitHub URL formats:

- `owner/repo` - Shorthand
- `https://github.com/owner/repo` - Full repository URL
- `https://github.com/owner/repo/blob/branch/path` - Blob URL
- `https://raw.githubusercontent.com/...` - Raw URL
- `owner/repo/path/to/file` - With path
- `owner/repo@branch/path` - With branch
- And more...

---

## 🆕 What's New in v1.3.76-beta.0

### Major Features

- 🎯 **Project Status Board**: Persistent state management for cross-session collaboration
- 📊 **Interactive Mode Integration**: Status-driven collaboration with automatic context injection
- 🔄 **Hierarchical Status Boards**: Support for single and multi-board modes
- 🌳 **Directory Isolation**: Each project directory has independent status board
- 🧠 **ResumeSession v1.2.1**: Advanced session recovery with cross-CLI memory
- 📦 **Unified Skill Manager**: Compatible with all agent skill repositories

### Improvements

- 🛠️ Automated installation and configuration management
- 📊 Enhanced status checking and reporting
- 🔗 Improved hook deployment system
- 🧪 Better test coverage and reliability
- 🌐 Multi-Language Patterns: Improved support for 12 languages

---

## 📚 Advanced Usage

### Interactive Mode with Project Status Board

Stigmergy's interactive mode features a **Project Status Board** that enables cross-session collaboration through persistent shared state. Different CLI sessions automatically collaborate based on the project status, with automatic context injection.

```bash
# Start interactive session
stigmergy interactive
# or use the alias
stigmergy i
```

Once in interactive mode, you can use these commands:

#### Interactive Commands

```bash
# View project status board
> status
# Shows: tasks, findings, decisions, collaboration history

# Show cross-CLI context
> context
# Displays context from all CLI tools

# Switch to specific CLI
> use qwen
> use claude
> use iflow
> use gemini

# Execute task with automatic context injection
> your task here

# Exit interactive mode
> exit
```

#### Key Features

**📊 Project Status Board**

- Each project directory has its own independent status board
- Stored in `.stigmergy/status/PROJECT_STATUS.md`
- Tracks tasks, findings, decisions, and collaboration history
- Automatically updates as you work

**🔄 Cross-Session Collaboration**

- Different sessions read/write to the same status board
- Automatic context injection from previous work
- Shared memory across CLI tools and sessions

**🌳 Directory Isolation**

- Each project directory = independent status board
- Working in `/projectA` won't affect `/projectB`
- Subdirectories can have independent boards (optional)

**Example Session:**

```bash
$ stigmergy interactive

========================================
  Stigmergy Interactive Mode
========================================
Session ID: session-abc123
Use 'status' to view project state
Use 'help' for available commands

# View current status
> status
========================================
  项目全局状态看板
========================================

📋 任务统计:
  待处理: 5
  进行中: 2
  已完成: 10

💡 发现: 8条
🎯 决策: 3条
🤝 协作记录: 25条
========================================

# Switch to qwen CLI
> use qwen
[qwen] Switched to qwen CLI

# Work on a task (context auto-injected)
> design user authentication system
[qwen] Executing task...
[qwen] Context: 8 findings, 3 decisions loaded
[qwen] Response received in 2.3s

# Record finding manually
> finding: Using JWT for stateless authentication
✓ Finding recorded to status board

# Make decision
> decision: Use PostgreSQL as primary database
✓ Decision recorded to status board

# Exit
> exit
[POOL] Shutting down persistent CLI processes...
✓ Session saved to status board
```

#### Single vs Multi-Board Mode

**Single Board Mode (Default)**

- Best for small projects (< 10 modules)
- One status board for entire project
- Simple, unified perspective

```bash
cd my-small-project/
stigmergy i
> All work recorded to: .stigmergy/status/PROJECT_STATUS.md
```

**Multi-Board Mode (Optional)**

- Best for large projects or microservices
- Each subdirectory has independent board
- Enables parallel team development

```bash
cd my-large-project/
stigmergy i
> board init multi
> board create backend ./backend
> board create frontend ./frontend

cd backend/
stigmergy i
> use qwen
qwen> design database schema
✓ Recorded to: backend/.stigmergy/status/PROJECT_STATUS.md
```

**Directory Isolation Guaranteed:**

```
projectA/.stigmergy/status/PROJECT_STATUS.md  ← Project A's board
projectB/.stigmergy/status/PROJECT_STATUS.md  ← Project B's board
# Complete isolation, no mixing
```

### Resume Sessions

```bash
# List recent sessions
stigmergy resume --limit 10

# Resume specific session
stigmergy resume --session-id abc123

# Simple resume
stigmergy resume
```

### Project Commands

```bash
# Setup project
stigmergy setup

# Initialize in current directory
stigmergy init

# Deploy hooks only
stigmergy deploy hooks

# Deploy skills integration
stigmergy deploy skills
```

---

## 🔧 Configuration

### Skill Locations

Stigmergy searches for skills in the following locations (priority order):

1. `~/.stigmergy/skills/` - Stigmergy unified storage
2. `./.agent/skills/` - Project universal skills
3. `~/.agent/skills/` - Global universal skills
4. `./.claude/skills/` - Project Claude skills
5. `~/.claude/skills/` - Global Claude skills

### Environment Variables

```bash
# Enable debug mode
export DEBUG=true

# Force auto-install during npm install
export STIGMERGY_AUTO_INSTALL=true
```

---

## 🐛 Troubleshooting

### Permission Errors

**Windows:**

```powershell
npm install -g stigmergy@beta --force
```

**macOS/Linux:**

```bash
sudo npm install -g stigmergy@beta --unsafe-perm=true --allow-root
```

### CLI Tools Not Found

```bash
# Check which tools are installed
stigmergy scan

# Install specific tool
stigmergy install claude

# Or manually install AI CLI tools first:
npm install -g @anthropic-ai/claude-code
npm install -g @google/gemini-cli
# etc.
```

### Hooks Not Deployed

```bash
# Redeploy hooks
stigmergy deploy hooks --force

# Check hook status
stigmergy status
```

### Stigmergy Gateway Issues

```bash
# Gateway not starting
stigmergy gateway --feishu --verbose

# Check port availability
netstat -ano | findstr :3000

# Verify ngrok tunnel
stigmergy gateway --feishu --tunnel --verbose
```

### Skills Not Working

```bash
# Validate skill format
stigmergy skill validate ./my-skill/SKILL.md

# Reinstall skill
stigmergy skill install owner/repo --force

# Check skill list
stigmergy skill list
```

---

## 📖 Documentation

- [Main Documentation](./STIGMERGY.md) - Complete system documentation
- [Publishing Guide](./PUBLISHING_GUIDE.md) - How to publish to npm
- [Package Size Analysis](./PACKAGE_SIZE_FINAL_SOLUTION.md) - Optimization details
- [Agent Skills Comparison](./STIGMERGY_VS_ADD_SKILL_ANALYSIS.md) - Why not use add-skill

---

## 🤝 Contributing

Contributions are welcome! This project is a collaboration between multiple AI systems:

- **Claude** (Anthropic)
- **Qwen** (Alibaba)
- **iFlow** (Intelligent Workflow)
- **QoderCLI**
- **GLM4.5** (Zhipu AI)
- **Gemini** (Google)
- And other AI systems

### Development

```bash
# Clone repository
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git

# Install dependencies
npm install

# Build TypeScript orchestration layer
npm run build:orchestration

# Run tests
npm test

# Lint code
npm run lint
```

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on [GitHub](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents)!

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/discussions)
- **npm**: [npm Package](https://www.npmjs.com/package/stigmergy)

---

**Made with ❤️ by the Stigmergy CLI Team and AI collaborators**

_Version: 1.3.54-beta.0 | Published: 2026-01-17_
