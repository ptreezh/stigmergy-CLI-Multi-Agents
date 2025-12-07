# Stigmergy Multi-AI CLI Collaboration

This project is configured for Stigmergy-based multi-AI CLI collaboration.

## Available AI CLI Tools



## Usage Examples

### Cross-CLI Collaboration
```bash
# Use Claude to analyze code
stigmergy call claude "analyze this function"

# Use Gemini for documentation
stigmergy call gemini "generate docs for this file"

# Use Qwen for translation
stigmergy call qwen "translate to English"
```

### Project Initialization
```bash
# Initialize with Claude as primary AI
stigmergy init --primary claude

# Initialize with multiple AI tools
stigmergy init --all-tools
```

## Configuration

Global configuration: `~/.stigmergy/config.json`

## Getting Started

1. Run `stigmergy status` to verify setup
2. Use `stigmergy call <ai-tool> "<prompt>"` to collaborate with AI CLI tools
3. Check project-specific configurations in individual CLI tool directories

For more information: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
