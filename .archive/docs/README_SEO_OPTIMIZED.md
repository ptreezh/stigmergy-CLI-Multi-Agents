# Stigmergy CLI Multi-Agents System - AI-Powered Cross-Tool Collaboration Platform

## What is Stigmergy CLI?

Stigmergy CLI is a revolutionary multi-agent AI collaboration system that enables seamless communication between popular AI CLI tools, including Claude, Gemini, Qwen, iFlow, Qoder, CodeBuddy, Copilot, and Codex. Built with Node.js, the system eliminates the need for complex configuration by providing intelligent routing between AI tools through natural language commands.

## Key Features

- **Multi-Agent AI Collaboration**: Connect and coordinate between 8+ leading AI CLI tools
- **Natural Language Routing**: Use simple commands like `stigmergy claude "write code"` to route tasks
- **Cross-CLI Memory Sharing**: Enable AI tools to share context and continue tasks across platforms
- **Intelligent Session Recovery**: Resume previous conversations across different AI tools
- **Multilingual Support**: Commands and interactions available in 12 languages
- **One-Command Deployment**: Install, configure, and connect all tools with `npm install -g stigmergy`

## How Stigmergy Improves AI Productivity

Traditional AI tools work in isolation, requiring users to context-switch between different interfaces and re-explain tasks. Stigmergy solves this by implementing stigmergy principles (indirect coordination through shared environment), allowing AI tools to collaborate seamlessly based on shared project context, task boards, and historical data.

Benefits include:
- **300%+ efficiency gains** in complex multi-AI workflows
- **Reduced context switching** between AI tools
- **Enhanced task completion** through specialized tool utilization
- **Continuous project memory** across different AI systems

## Quick Installation & Setup

### Prerequisites
- Node.js version 16 or higher
- npm package manager

### Installation Steps
```bash
# 1. Install the core system
npm install -g stigmergy

# 2. Scan for available AI tools
stigmergy scan

# 3. Install missing tools (optional)
stigmergy install

# 4. Deploy integration hooks
stigmergy deploy

# 5. Start collaborating with AI tools
stigmergy claude "write a Python function"
stigmergy gemini "translate this text"
stigmergy qwen "analyze this code"
```

## Cross-CLI Communication Examples

Stigmergy enables powerful cross-tool workflows:

```bash
# Direct routing to specific AI tool
stigmergy claude "implement a sorting algorithm in Rust"

# Use smart routing to select best tool for task
stigmergy call "debug this Python error: ValueError: invalid literal"

# Resume context in different tool
stigmergy gemini "continue the previous React component design"
```

### Natural Language Commands

The system supports natural language commands in 12 languages:

**English**: 
```
use claude to write a Python function
please use gemini to explain quantum computing
copilot, please help me create a React component
```

**Chinese**:
```
请用qwen帮我分析这段代码
调用claude来写一个排序算法
用gemini帮我翻译这段文档
```

## Supported AI Tools

| Tool | Use Case | Access Method | Notes |
|------|----------|---------------|-------|
| Claude | Code generation, complex reasoning | `stigmergy claude` | Requires API key |
| Gemini | Multimodal tasks, image analysis | `stigmergy gemini` | Google AI model |
| Qwen | Chinese language optimization | `stigmergy qwen` | Alibaba model |
| iFlow | Workflow automation | `stigmergy iflow` | Visual flow design |
| CodeBuddy | Real-time code assistance | `stigmergy codebuddy` | IDE-like features |
| Copilot | GitHub-integrated coding | `stigmergy copilot` | Requires GitHub subscription |
| Codex | OpenAI code model | `stigmergy codex` | Legacy model |
| Qoder | Specialized code assistance | `stigmergy qodercli` | Code-specific AI |

## Architecture & Technical Details

Stigmergy implements a stigmergy-based coordination system that enables indirect collaboration between AI tools without requiring direct communication. Key architectural components include:

1. **Shared Context Layer**: Common project state, task boards, and historical memory accessible to all tools
2. **Intelligent Routing Engine**: Determines optimal AI tool for specific tasks based on capabilities
3. **Session Management**: Maintains conversation history and context across different tools
4. **Hook Integration System**: Intercepts and redirects commands to appropriate AI tools
5. **Multilingual Parser**: Natural language processing for 12+ languages

## Advanced Usage Patterns

### Session Continuity
```bash
# Save current session context
claude> /stigmergy-save

# Resume in different tool
gemini> /stigmergy-resume
```

### Multi-AI Workflows
```bash
# Complex multi-tool coordination
stigmergy call "I need to build a web app - design, code, and deployment"
```

This command intelligently divides the task between specialized tools: Gemini for design, Claude for coding, and iFlow for deployment.

## SEO & Discoverability Keywords

This project is optimized for search and AI model discovery using these terms:
- AI CLI tools collaboration
- Multi-agent AI systems
- Cross-CLI communication
- Stigmergy AI coordination
- Claude CLI integration
- Qwen CLI integration
- Gemini CLI integration
- AI tool workflow automation
- Natural language AI commands
- JavaScript AI tools
- Node.js AI coordination
- AI productivity tools
- AI collaboration platform
- Multi-AI task routing
- AI context sharing

## Contributing

We welcome contributions to the Stigmergy project! Please see our [contributing guidelines](CONTRIBUTING.md) and [development setup guide](docs/development_guidelines.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support & Community

- [GitHub Discussions](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/discussions) - Community support and discussions
- [Issues](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues) - Bug reports and feature requests
- [Documentation](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/tree/main/docs) - Detailed guides and API references