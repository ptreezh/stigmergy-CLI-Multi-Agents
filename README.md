# Stigmergy CLI Multi-Agents System

A comprehensive system for collaboration between multiple AI CLI tools. This system enables seamless cross-CLI communication and intelligent task routing between different AI tools.

## Features

- 🤖 Multi-agent AI CLI tools collaboration (Claude, Gemini, Qwen, iFlow, Qoder, CodeBuddy, Copilot, Codex, Kode)
- 🎯 Natural language skills processing and cross-CLI task routing
- 🧠 Cross-CLI memory sharing and session recovery (ResumeSession v1.2.1)
- 🔗 Hook integration for seamless AI tool usage
- 🌍 JavaScript-based implementation (no Python dependencies)
- ⚡ Intelligent command routing and execution
- 🔄 Smart AI tool auto-routing based on task analysis
- 📦 Complete project setup with `stigmergy setup`
- 🔍 Advanced CLI tool scanning and status checking
- 🛠️ Automated installation and configuration management
- 🌐 12-language natural language pattern support (English, Chinese, Japanese, German, French, Spanish, Italian, Russian, Korean, Turkish, Portuguese, Arabic)

## Quick Start

### Installation (One Command)

**Windows:**
```powershell
# Method 1: Right-click PowerShell and "Run as Administrator"
npm install -g stigmergy

# Method 2: Start PowerShell as Administrator from command line
Start-Process PowerShell -Verb RunAs -ArgumentList "npm install -g stigmergy"
```

**macOS/Linux:**
```bash
sudo npm install -g stigmergy
```

### Setup and Use

```bash
# Complete setup (install + deploy + init)
stigmergy setup

# Or step by step:
# Install all AI CLI tools
stigmergy install

# Deploy hooks for cross-CLI integration
stigmergy deploy

# Initialize project for session recovery
stigmergy init

# Use cross-CLI collaboration
stigmergy claude "write a Python function"
stigmergy gemini "translate this text"
stigmergy qwen "analyze this code"
stigmergy kode "use digital marxist agent to analyze worker alienation"

# Smart routing (auto-choose best tool)
stigmergy call "create a modern web application"

# 12-language natural language support
stigmergy call "请用 kode 帮我分析这个代码"
stigmergy call "kodeを使って分析してください"
```

### Permission Issues?

**Windows:**
```powershell
# If you get permission errors:
npm install -g stigmergy --force
```

**macOS/Linux:**
```bash
# If you get permission errors:
sudo npm install -g stigmergy --unsafe-perm=true --allow-root
```

## 🆕 New in Version 1.3.0-beta.0

- 🔄 **Smart AI Tool Routing**: `stigmergy call` automatically chooses the best AI tool
- 📦 **Complete Setup Command**: `stigmergy setup` handles install + deploy + init
- 🧠 **ResumeSession Integration**: Built-in session recovery with v1.2.1
- ⚡ **Modular Architecture**: 92.4% size reduction with improved maintainability
- 🔍 **Enhanced CLI Discovery**: Better path detection and tool availability checking
- 🛠️ **Automated Installation**: npm postinstall auto-configuration support

## Cross-CLI Communication

When you need to call other AI tools, use the following format:
```bash
stigmergy <tool_name> <task_description>
```

Examples:
```bash
stigmergy claude "write a Python function"
stigmergy gemini "translate this text"
stigmergy qwen "analyze this code"
```

### Smart AI Tool Routing
```bash
# Let Stigmergy automatically choose the best tool
stigmergy call "create a React component with TypeScript"
stigmergy call "analyze this database schema"
```

Available tools: claude, gemini, qwen, iflow, qodercli, codebuddy, copilot, codex, kode

## Documentation

- [Main System](./README.md)
- [Skills Package](./packages/skills/README.md)
- [Resume Session](./packages/resume/README.md)
- [Session Management](./packages/sessions/README.md)

## Contributing

This project is a collaboration between multiple AI systems:
- Claude (Anthropic)
- Qwen (Alibaba)
- iFlow (Intelligent Workflow)
- QoderCLI
- GLM4.5 (Zhipu AI)
- And other AI systems

Contributions are welcome!