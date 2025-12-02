# 🔧 Stigmergy CLI - Multi-Agents Cross-AI CLI Tool Collaboration System

> **⚠️ Important Clarification: This is not a standalone CLI tool, but an enhancement system!**
>
> Stigmergy CLI enables existing AI CLI tools to collaborate with each other through a plugin system, rather than replacing them.

[![Node.js](https://img.shields.io/badge/node-16+-green.svg)](https://nodejs.org)
[![NPM](https://img.shields.io/badge/npm-stigmergy-cli-blue.svg)](https://www.npmjs.com/package/stigmergy-cli)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()

## 🚀 Quick Start

### One-Click Deployment (Recommended)

```bash
# One-click deployment of the complete collaboration system (detection + installation + configuration)
npx -y git+https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git#main quick-deploy
```

Or, if you have already installed stigmergy-cli globally:

```bash
# Run through the installed CLI
npx stigmergy-cli quick-deploy
```

### Manual Installation

```bash
# Install globally via NPM
npm install -g stigmergy-cli

# Initialize project
stigmergy-cli init

# Intelligent deployment (scan environment + prompt + auto-install)
stigmergy-cli deploy

# Or use npx (no installation required)
npx stigmergy-cli init
npx stigmergy-cli deploy
```

## ✨ Core Features

### 🎯 Direct Cross-CLI Collaboration
- **Natural Language Invocation**: Directly invoke other AI tools in any supported CLI
- **Seamless Integration**: Does not change the existing usage of CLI tools
- **Smart Routing**: Automatically identifies collaboration intent and delegates to the appropriate tool

### 📋 Supported CLI Tools

#### Core Tools (Required)
- **Claude CLI** - Anthropic Claude CLI tool
- **Gemini CLI** - Google Gemini CLI tool

#### Extended Tools (Optional)
- **QwenCode CLI** - Alibaba Cloud QwenCode CLI tool
- **iFlow CLI** - iFlow workflow CLI tool
- **Qoder CLI** - Qoder code generation CLI tool
- **CodeBuddy CLI** - CodeBuddy programming assistant CLI tool
- **GitHub Copilot CLI** - GitHub Copilot CLI tool
- **Codex CLI** - OpenAI Codex code analysis CLI tool

### 🧩 Intelligent Deployment System

```bash
# Intelligent deployment (recommended)
stigmergy-cli deploy

# Sample output:
🔍 Scanning system CLI tool status...

  🔴 ❌ Claude CLI           | CLI: Not installed | Integration: Not installed
  🟢 ✅ Gemini CLI          | CLI: Available | Integration: Installed
  🔴 ❌ QwenCode CLI       | CLI: Not installed | Integration: Not installed

📋 Detected the following uninstalled tools:

🔴 Uninstalled CLI tools:
  - Claude CLI (required) - Anthropic Claude CLI tool
  - QwenCode CLI (optional) - Alibaba Cloud QwenCode CLI tool

Do you want to try automatically installing 2 CLI tools? (Y/n): Y
```

## 🎯 Cross-CLI Collaboration Examples

After installation, you can directly invoke other tools in any supported CLI:

### In Claude CLI
```bash
# Invoke other AI tools
Please use gemini to help me translate this code
Call qwen to analyze this requirement
Use iflow to create a workflow
Let qoder generate Python code
Start codebuddy assistant
```

### In Gemini CLI
```bash
# Cross-tool collaboration
Use claude to check code quality
Let qwen help me write documentation
Use copilot to generate code snippets
```

## 🛠️ Complete Command List

```bash
# Basic commands
stigmergy-cli init          # Initialize project
stigmergy-cli status        # View status
stigmergy-cli scan          # Scan environment

# Deployment commands
stigmergy-cli deploy        # Intelligent deployment (default)
stigmergy-cli deploy-all    # Full deployment

# Project management
stigmergy-cli check-project # Check project
stigmergy-cli validate      # Validate configuration
stigmergy-cli clean         # Clean environment

# Development commands
npm run build              # Build project
npm run publish-to-npm     # Publish to NPM
npm run test               # Run tests
```

## 📁 Project Structure

```
stigmergy-CLI-Multi-Agents/
├── package.json          # NPM package configuration
├── src/
│   ├── main.js          # Main entry file
│   ├── deploy.js        # Intelligent deployment script
│   ├── adapters/        # CLI adapters
│   │   ├── claude/
│   │   ├── gemini/
│   │   ├── qwencode/
│   │   └── ...
│   └── core/            # Core modules
├── adapters/            # CLI installation scripts
│   ├── claude/install_claude_integration.py
│   ├── gemini/install_gemini_integration.py
│   └── ...
└── templates/           # Configuration templates
```

## 🔧 Automatic CLI Tool Installation

The intelligent deployment script supports automatic installation of all CLI tools:

### Core Tools
```bash
npm install -g @anthropic-ai/claude-code
npm install -g @google/gemini-cli
```

### Extended Tools
```bash
npm install -g @qwen-code/qwen-code@latest
npm install -g @iflow-ai/iflow-cli@latest
npm install -g @qoder-ai/qodercli
npm install -g @tencent-ai/codebuddy-code
npm install -g @github/copilot
npm i -g @openai/codex --registry=https://registry.npmmirror.com
```

## 🎯 Use Cases

### Scenario 1: Individual Developer Environment
```bash
# Quick setup for new development environment
git clone my-project
cd my-project
stigmergy-cli deploy

# Now you can collaborate across tools in any CLI
claude-cli "Please use gemini to help me optimize the performance of this code"
```

### Scenario 2: Team Collaboration
```bash
# Team-shared project configuration
git clone team-project
cd team-project
stigmergy-cli init

# All team members use the same collaboration context
gemini-cli "Use claude to check the design patterns of this module"
```

### Scenario 3: Multi-Language Development
```bash
# Complementing different AI tool specializations
qwen-cli "Use copilot to generate front-end components"
iflow-cli "Let gemini create API documentation"
```

## 🔧 Development Environment Setup

```bash
# Clone project
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# Install dependencies
npm install

# Run in development mode
npm run start
npm run status
npm run scan

# Build and publish
npm run build
npm run publish-to-npm
```

## 🚀 Publishing New Versions

```bash
# Update version number
npm version patch    # Patch version
npm version minor    # Minor version
npm version major    # Major version

# Publish to NPM
npm run publish-to-npm

# Verify publication
npx stigmergy-cli --version
```

## 🛠️ Troubleshooting

### Common Issues

1. **Node.js version incompatible**
   ```bash
   # Ensure Node.js 16+ is used
   node --version
   ```

2. **Permission errors**
   ```bash
   # Use administrator privileges
   sudo npm install -g stigmergy-cli
   ```

3. **Network connection issues**
   ```bash
   # Set NPM mirror
   npm config set registry https://registry.npmmirror.com
   ```

4. **CLI tool installation failed**
   ```bash
   # Manually install specific tool
   npm install -g @anthropic-ai/claude-code
   ```

### Debug Mode

```bash
# Detailed debug output
DEBUG=stigmergy:* stigmergy-cli deploy

# Status scan only
stigmergy-cli scan
```

## 📚 More Information

- **GitHub**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- **NPM**: https://www.npmjs.com/package/stigmergy-cli
- **Documentation**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#readme
- **Issue Feedback**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues

## 🤝 Contributing

Pull Requests and Issues are welcome!

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎯 Stigmergy CLI - True cross-CLI collaboration, enabling each AI tool to maximize its value!**