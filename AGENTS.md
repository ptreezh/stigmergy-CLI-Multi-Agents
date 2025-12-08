# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview
This is the Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System. It enables existing AI CLI tools to collaborate with each other through a plugin system rather than replacing them. The system supports tools like Claude, Gemini, Qwen, iFlow, Qoder, CodeBuddy, Copilot, and Codex.

## Common Commands

### Development Workflow
```bash
# Run the CLI locally
npm start

# Watch mode for development
npm run dev

# Run all tests
npm test

# Run specific tests
node test/real-test.js

# Lint the code
npm run lint

# Format code
npm run format
```

### Authentication Commands
```bash
# Register a new user
stigmergy register <username> <password>

# Log in
stigmergy login <username> <password>

# Check authentication status
stigmergy auth-status

# Log out
stigmergy logout
```

### Build and Deployment
```bash
# Build the project
npm run build

# Deploy hooks
npm run deploy

# Auto-install during postinstall
npm run postinstall
```

### CLI Operations
```bash
# Check system status
npm run status

# Scan for available AI CLI tools
npm run scan

# Initialize system
npm run init

# Validate installation
npm run validate

# Clean system
npm run clean

# Remove all Stigmergy hooks
stigmergy remove
```

## Code Architecture and Structure

### Core Components
1. **Main Entry Point**: `src/main_english.js` - Contains the primary CLI logic and routing system
2. **Core Module**: `src/core/cli_help_analyzer.js` - Handles CLI help analysis and parsing
3. **Adapters**: `src/adapters/` - Contains tool-specific adapters for each supported AI CLI
4. **Index File**: `src/index.js` - Simple entry point that loads main.js

### Key Classes and Systems
1. **SmartRouter**: Handles intelligent routing of user prompts to appropriate AI tools based on keywords
2. **MemoryManager**: Manages interaction history and memory storage in both global and project contexts
3. **CLI_TOOLS Configuration**: Central configuration defining all supported AI CLI tools with their installation methods and paths

### Adapter System
Each AI tool has its own adapter directory under `src/adapters/` containing:
- Hook adapters for integrating with the tool's extension system
- Installation scripts for setting up the integration
- Skill integration modules for advanced functionality

### Testing Structure
Tests are located in the `test/` directory with:
- Integration tests for various system components
- Unit tests in the `test/unit` subdirectory
- Real-world scenario tests for cross-CLI collaboration

### Configuration Files
- `package.json`: Defines npm scripts, dependencies, and entry points
- `STIGMERGY.md`: Project-specific memory and configuration
- Global configuration in `~/.stigmergy/config.json`

## Cross-CLI Collaboration Flow
1. User inputs a request through the stigmergy CLI
2. SmartRouter analyzes the input and determines the appropriate AI tool
3. The request is routed to the specific tool's adapter
4. The adapter communicates with the AI tool
5. Responses are captured and managed by MemoryManager
6. Results are returned to the user with context preservation