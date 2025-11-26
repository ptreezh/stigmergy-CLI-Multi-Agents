# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **AI CLI Universal Integration System** (smart-cli-router) - a sophisticated cross-CLI integration system that enables direct calling between different AI CLI tools using their native extension mechanisms. The system implements a dual-function approach:

1. **Cross-CLI Direct Calling**: Users can naturally call other AI CLI tools from within any supported CLI
2. **Indirect Collaboration**: AI tools can collaborate based on PROJECT_SPEC.json for coordinated task execution

### Strict Constraints (Non-negotiable)
- ❌ **No wrapper-based solutions** - Must use native CLI extension mechanisms
- ❌ **No changes to CLI startup/usage** - Users continue using CLI tools normally
- ❌ **No VS Code dependency** - Pure command-line solution
- ✅ **Native integration only** - Each CLI uses its optimal official extension method

## Development Commands

### Testing
```bash
# Run all tests
pytest

# Run specific test suites
pytest tests/unit/          # Unit tests only
pytest tests/integration/   # Integration tests only

# Run tests with coverage
pytest --cov=src --cov-report=html

# Run TDD-style (watch for changes)
pytest -f  # Requires pytest-watch
```

### Code Quality
```bash
# Format code
black src/ tests/

# Type checking
mypy src/

# Linting
pylint src/
flake8 src/

# Security scan
bandit -r src/
```

### Project Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Development installation
pip install -e .

# Run specific adapter tests
python -m pytest tests/unit/adapters/test_claude_adapter.py -v
```

## Architecture Overview

### Core Components (`src/core/`)

**BaseAdapter** (`base_adapter.py`): Abstract base class defining the interface for all CLI adapters
- `execute_task(task, context)`: Main execution method
- `is_available()`: Check if CLI tool is available
- Provides health monitoring and statistics tracking

**NaturalLanguageParser** (`parser.py`): Handles parsing of user input to detect cross-CLI intentions
- Supports Chinese and English collaboration protocols
- Pattern matching for CLI names and task extraction
- Confidence scoring and intent validation

**AdapterFactory**: Factory pattern for creating and managing CLI adapters
- Lazy loading of adapters
- Health check management for all adapters
- Statistics collection across adapters

### CLI Adapters (`src/adapters/`)

Each CLI tool has a dedicated adapter using its native integration mechanism:

**Claude CLI** (`adapters/claude/`): Uses official Hook system
- `user_prompt_submit` hook for intercepting user input
- `tool_use_pre/post` hooks for tool call processing
- Configuration in `~/.config/claude/hooks.json`

**QwenCodeCLI** (`adapters/qwencode/`): Uses Python class inheritance
- Extends native QwenCodeCLI class
- Overrides `process_command()` and `process_request()` methods
- Maintains all original functionality

**Gemini CLI** (`adapters/gemini/`): Uses official Extension interface
- Implements `@extend('preprocessor')` decorator
- Hooks into request processing pipeline
- Configuration in `~/.config/gemini/extensions.json`

**Other CLI tools** - Each using their optimal native approach (iFlow workflows, Qoder plugins, etc.)

### Key Design Patterns

1. **TDD-Driven Development**: All components have comprehensive tests first
2. **Factory Pattern**: Centralized adapter creation and management
3. **Hook-Based Integration**: Non-invasive extension of existing CLI tools
4. **Async/Await**: All operations are asynchronous for performance
5. **Error Isolation**: Adapter failures don't affect core CLI functionality

## Testing Strategy

### Test Structure
```
tests/
├── unit/           # Unit tests for individual components
│   ├── test_core/  # Core framework tests
│   └── adapters/   # Adapter-specific tests
└── integration/    # Cross-component and end-to-end tests
```

### TDD Approach
1. **Write tests first** - All functionality is specified in tests before implementation
2. **Red-Green-Refactor** - Follow standard TDD cycle
3. **High coverage target** - 90%+ for core components, 85%+ for adapters
4. **Mock external dependencies** - Isolate tests from actual CLI tools

### Running Tests
Use `pytest` for all testing. Key test files:
- `tests/unit/test_core/test_base_adapter.py` - Core adapter functionality
- `tests/unit/adapters/test_claude_adapter.py` - Claude CLI adapter tests
- `tests/integration/test_cross_cli_calls.py` - End-to-end integration tests

## Development Workflow

### Adding New CLI Adapters
1. Create adapter directory: `src/adapters/{cli_name}/`
2. Write tests: `tests/unit/adapters/test_{cli_name}_adapter.py`
3. Implement adapter class inheriting from `BaseCrossCLIAdapter`
4. Add adapter to factory in `base_adapter.py`
5. Create integration tests
6. Update documentation

### Native Integration Requirements
Each adapter must use the CLI's official native integration mechanism:
- **Hook systems** (Claude CLI)
- **Class inheritance** (QwenCodeCLI)
- **Plugin architectures** (CodeBuddyCLI)
- **Extension interfaces** (Gemini CLI, Codex CLI)
- **Workflow scripts** (iFlowCLI)
- **Environment variable hooks** (QoderCLI)

### Configuration Management
- Global config: `~/.config/ai-cli-unified/config.yml`
- CLI-specific configs: `~/.config/{cli}/config.yml`
- Adapter configs: `src/adapters/{cli}/config.json`

## Important Implementation Details

### Cross-CLI Call Detection
The parser supports these protocols:
- Chinese: "请用{CLI}帮我{task}", "调用{CLI}来{task}", "用{CLI}帮我{task}"
- English: "use {CLI} to {task}", "call {CLI} to {task}", "ask {CLI} for {task}"

### Error Handling
- Graceful degradation when CLI tools are unavailable
- Error isolation between adapters
- Comprehensive logging and debugging information
- User-friendly error messages

### Performance Considerations
- Lazy loading of adapters
- Async operations throughout
- Minimal overhead on CLI operations (<100ms target)
- Caching of adapter availability status

### Security
- No external API calls except to target CLI tools
- Local-only processing and state management
- Validation and sanitization of cross-CLI commands
- Respect for existing CLI permission systems

## Code Standards

- Follow PEP 8 for Python code formatting
- Use type hints for all function signatures
- Comprehensive docstrings for all public methods
- Async/await for all I/O operations
- Error handling with specific exception types
- Logging with appropriate levels throughout

## Project Status

This is a TDD-driven project currently in implementation phase. The architecture is fully designed and documented, with core components and several adapters already implemented. The system prioritizes native integration and zero-impact user experience above all other considerations.