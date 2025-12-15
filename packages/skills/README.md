# Stigmergy Skills 🎯

[![npm version](https://badge.fury.io/js/stigmergy-skills.svg)](https://badge.fury.io/js/stigmergy-skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

Natural Language Skills System for AI CLI Tools - Transform your AI tools into intelligent skill-powered assistants.

## ✨ Features

- 🧠 **Natural Language Processing** - Understand user intent in Chinese and English
- 🎯 **Skill Detection** - Automatically identify translation, analysis, generation, and documentation tasks
- 🛠️ **Multi-AI Tool Support** - Works with Claude, Gemini, Qwen, iFlow, CodeBuddy, and more
- 🔗 **Hook Integration** - Seamless integration with existing AI CLI tools
- 🌍 **International Encoding** - Pure ANSI encoding for global compatibility
- ⚡ **Smart Execution** - Intelligent parameter extraction and validation

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g stigmergy-skills

# Or use without installation
npx stigmergy-skills "translate this to English"
```

### Basic Usage

```bash
# Interactive mode (recommended for first-time users)
stigmergy-skills --interactive

# Single command execution
stigmergy-skills "translate this code comment to English"
stigmergy-skills "analyze the security of this React component"
stigmergy-skills "generate a user authentication function in Python"
stigmergy-skills "create documentation for this API"
```

### Advanced Usage

```bash
# Specify AI tool
stigmergy-skills --tool=gemini "translate this to Spanish"

# Verbose output
stigmergy-skills --verbose "analyze this code"

# List available skills
stigmergy-skills list

# Show system status
stigmergy-skills status

# Install CLI hooks for automatic skill detection
stigmergy-skills install-hooks
```

## 📝 Supported Skills

### 🔤 Translation
Translate text between languages with automatic language detection.

**Examples:**
```bash
"Translate this comment to English"
"请把这段中文翻译成法文"
"Convert this code documentation to Spanish"
```

### 🔍 Code Analysis
Analyze code for security vulnerabilities, performance issues, and quality metrics.

**Examples:**
```bash
"Analyze the security of this React component"
"Check this code for performance bottlenecks"
"Review this function for potential bugs"
```

### 💻 Code Generation
Generate code based on natural language requirements.

**Examples:**
```bash
"Generate a user login function in Python"
"Create a REST API endpoint for user management"
"Write a React component for data visualization"
```

### 📚 Documentation
Automatically generate documentation for code and APIs.

**Examples:**
```bash
"Create documentation for this API"
"Generate inline comments for this function"
"Write a README for this project"
```

### 📄 Academic Research Tools

Advanced academic research capabilities with real database access:

#### Paper Download (`paperDL`)
Academic paper search and download from multiple databases (arXiv, PubMed, IEEE Xplore, etc.)

**Examples:**
```bash
sg-skills paperDL "BERT model research papers"
sg-skills paperDL "computer vision deep learning papers" --max-results 10
```

#### Paper DOI Retrieval (`paperDOI`)
DOI and citation information lookup from CrossRef, Semantic Scholar, etc.

**Examples:**
```bash
sg-skills paperDOI "attention mechanisms in neural networks"
sg-skills paperDOI "transformer architecture research" --format apa
```

#### CNKI Search (`cnki`)
Search academic papers on China National Knowledge Infrastructure using persistent browser automation

**Examples:**
```bash
sg-skills cnki "digital transformation in manufacturing"
sg-cnki "impact of AI on education" --max-results 5
/cnki "machine learning applications"
```

*Note: These features interact with real academic databases and generate execution plans for browser automation - no simulation or mocking.*

## 🛠️ AI Tool Integration

Stigmergy Skills integrates with multiple AI CLI tools:

| Tool | Command | Status | Features |
|------|---------|--------|---------|
| [Claude CLI](https://claude.ai/cli) | `claude` | ✅ Available | Translation, Analysis, Generation |
| [Gemini CLI](https://ai.google.dev/cli) | `gemini` | ✅ Available | Translation, Analysis, Documentation |
| [QwenCode CLI](https://qwen.aliyun.com) | `qwen` | ✅ Available | Code Analysis, Generation |
| [iFlow CLI](https://iflow.ai) | `iflow` | ✅ Available | Workflow Automation |
| [CodeBuddy CLI](https://codebuddy.qq.com) | `codebuddy` | ✅ Available | Code Generation, Analysis |
| [GitHub Copilot](https://github.com/features/copilot) | `gh copilot` | ✅ Available | Code Generation |

## 🔗 Integration with Main Stigmergy

This skills package is designed to work both independently and alongside the main `stigmergy` package:

### As Standalone Package
```bash
# Use directly
npm install -g stigmergy-skills
stigmergy-skills "translate this to English"
```

### With Stigmergy Core
```bash
# Both packages work together
npm install -g stigmergy stigmergy-skills
stigmergy install  # Install core system
stigmergy-skills install-hooks  # Install skill hooks
```

## 📖 API Usage

You can also use the skills system programmatically:

```javascript
import SkillsPackage from 'stigigmergy-skills';

const skills = new SkillsPackage();
await skills.initialize();

// Process natural language input
const result = await skills.processNaturalLanguage(
    "translate this code to English",
    { tool: 'claude', verbose: true }
);

if (result.success) {
    console.log(`Skill: ${result.skill}`);
    console.log(`Confidence: ${result.confidence}/10`);
    console.log(`Output: ${result.execution.output}`);
}
```

## 🔧 Configuration

### Environment Variables
- `STIGMERGY_SKILLS_DEBUG` - Enable debug logging
- `STIGMERGY_SKILLS_TIMEOUT` - Command execution timeout (ms)
- `STIGMERGY_SKILLS_RETRIES` - Number of retries for failed commands

### Hook Configuration
Hooks are automatically installed in the standard configuration directories:
- `~/.claude/hooks/`
- `~/.gemini/hooks/`
- `~/.qwen/hooks/`
- `~/.iflow/hooks/`
- `~/.codebuddy/hooks/`

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:natural-language
npm run test:encoding
```

## 📦 Building

Build the package for distribution:

```bash
# Build the package
npm run build

# Create distributable
npm pack
```

## 🔍 Troubleshooting

### Common Issues

**Hook Installation Failed:**
```bash
# Manually check hook directories
ls ~/.claude/hooks ~/.gemini/hooks

# Reinstall hooks
stigmergy-skills install-hooks
```

**Skill Detection Not Working:**
```bash
# Check natural language processor
stigmergy-skills status

# Use verbose mode for debugging
stigmergy-skills --verbose "translate this"
```

**AI Tool Not Available:**
```bash
# Check which AI tools are installed
stigmergy-skills status

# Install missing AI tools
npm install -g claude-cli gemini-cli
```

### Debug Mode

Enable debug logging for detailed troubleshooting:

```bash
STIGMERGY_SKILLS_DEBUG=1 stigmergy-skills "translate this"
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents
cd skills-package

# Install dependencies
npm install

# Run development server
npm start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stigmergy CLI](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents) - Main project
- All AI CLI tool providers for their excellent tools
- The open-source community for feedback and contributions

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/discussions)
- 📧 **Email**: support@stigmergy.ai

---

**Made with ❤️ by the Stigmergy CLI Team**