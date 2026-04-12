# Coding Conventions

**Analysis Date:** 2026-04-12

## Naming Patterns

**Files:**
- Pattern: kebab-case (e.g., `cli-help-analyzer.js`, `smart-router.js`)
- Command modules: kebab-case with descriptive names (e.g., `install.js`, `status.js`)

**Classes:**
- Pattern: PascalCase (e.g., `SmartRouter`, `ErrorHandler`, `StigmergyError`, `VerificationGate`)

**Functions:**
- Pattern: camelCase (e.g., `maxOfTwo`, `getCLIPath`, `createError`, `logError`)
- Private methods: prefix with `_` (e.g., `_initInternal`, `_wrapAsync`)

**Variables:**
- Pattern: camelCase (e.g., `cliTools`, `tempDir`, `testInstallDir`)

**Constants:**
- Pattern: UPPER_SNAKE_CASE (e.g., `ERROR_TYPES`, `LOG_LEVELS`, `VALID_CLI_TOOLS`)
- Defined as `const` objects at module level

**Types/Interfaces:**
- Pattern: PascalCase (e.g., `ErrorType`, `CLIToolConfig`)

## Code Style

**Formatting:**
- Tool: ESLint 9.39.2 + Prettier 3.7.4
- Indent: 2 spaces (enforced by ESLint rule `indent: ['error', 2]`)
- Line endings: Unix-style (enforced by ESLint `linebreak-style`)
- Semicolons: Always required (enforced by ESLint `semi: ['error', 'always']`)
- Quotes: Single quotes (enforced by ESLint `quotes: ['error', 'single']`)

**ESLint Configuration** (`.eslintrc.js`):
```javascript
module.exports = {
  env: { es6: true, node: true },
  extends: ['eslint:recommended'],
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': 'warn',
    'no-console': 'off',  // chalk used for colored output instead
  },
};
```

**Babel Configuration** (`.babelrc`):
- Uses `@babel/preset-env` targeting Node 16
- Required for ES module imports in test files

## Import Organization

**Order (when applicable):**
1. Node.js built-ins (`fs`, `path`, `os`)
2. External packages (`chalk`, `commander`, `axios`, etc.)
3. Internal modules (relative paths)

**Examples**:
```javascript
// Built-ins first
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

// External packages
const chalk = require('chalk');
const { Command } = require('commander');

// Internal modules (relative)
const CLIPathDetector = require('./cli_path_detector');
const { errorHandler } = require('../core/error_handler');
```

**Path Aliases:**
- None currently configured
- Use relative paths (`./`, `../`)

## Error Handling

**Custom Error Class** (`src/core/error_handler.js`):
```javascript
class StigmergyError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, code = null, details = null) {
    super(message);
    this.name = 'StigmergyError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}
```

**Error Types Enumeration**:
```javascript
const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  FILE_SYSTEM: 'FILE_SYSTEM_ERROR',
  CLI_TOOL: 'CLI_TOOL_ERROR',
  CONFIGURATION: 'CONFIGURATION_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};
```

**Log Levels Enumeration**:
```javascript
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};
```

**Error Handler Usage**:
- Use `ErrorHandler` singleton for consistent logging
- Use `errorHandler.createError()` for typed errors
- Use `errorHandler.logError()` for logging
- Wrap async functions with `errorHandler.wrapAsync()`
- Use `errorHandler.handleCLIError()`, `handleFileError()`, `handleNetworkError()` for domain-specific errors

**Global Error Handlers**:
- Setup via `setupGlobalErrorHandlers()` in `src/core/error_handler.js`
- Handles `unhandledRejection` and `uncaughtException`
- Graceful exit after logging

**Logging with Chalk**:
```javascript
const chalk = require('chalk');

console.error(chalk.red.bold('[ERROR]'));
console.warn(chalk.yellow.bold('[WARN]'));
console.info(chalk.blue('[INFO]'));
console.debug(chalk.gray('[DEBUG]'));
```

## Comments

**JSDoc Style** for functions:
```javascript
/**
 * Create a standardized Stigmergy error
 * @param {string} message - Error message
 * @param {string} type - Error type from ERROR_TYPES
 * @param {string|null} code - Error code
 * @param {Object|null} details - Additional error details
 * @returns {StigmergyError}
 */
createError(message, type = ERROR_TYPES.UNKNOWN, code = null, details = null) {
  return new StigmergyError(message, type, code, details);
}
```

**When to Comment:**
- Complex business logic
- Non-obvious implementation decisions
- Async/await patterns
- Error handling rationale

## Function Design

**Size Guidelines:**
- Target: < 50 lines per function
- Maximum: 80-100 lines
- Extract complex logic to helper functions

**Parameters:**
- Use destructuring for objects: `({ option1, option2 })`
- Provide defaults for optional parameters
- Document all parameters in JSDoc

**Return Values:**
- Always return consistent types
- Use `null` instead of `undefined` for "no value"
- Return objects with clear structure

## Module Design

**Export Pattern**:
```javascript
// Named exports for utilities
module.exports = {
  ErrorHandler,
  errorHandler,  // singleton instance
  StigmergyError,
  ERROR_TYPES,
  LOG_LEVELS,
  setupGlobalErrorHandlers,
};
```

**Class Pattern**:
```javascript
class MyClass {
  constructor(options = {}) {
    this.property = options.property || 'default';
  }

  _privateMethod() {
    // Implementation
  }

  publicMethod() {
    return this._privateMethod();
  }
}
```

**Singleton Pattern** (for handlers):
```javascript
const myHandler = new MyHandler();
module.exports = { myHandler };
```

## File Organization

**Source Structure**:
```
src/
  cli/              # CLI routing and commands
    commands/       # Command handlers (install.js, scan.js, etc.)
    utils/         # CLI utilities (formatters.js, environment.js)
  core/             # Core business logic
    skills/        # Skill management
    coordination/   # Cross-CLI coordination
    hooks/         # Hook system
  commands/         # Business commands
  adapters/        # Platform adapters
  utils/            # Shared utilities
```

**Many Small Files > Few Large Files:**
- High cohesion, low coupling
- Extract utilities from large modules
- Organize by feature/domain, not by type

---

*Convention analysis: 2026-04-12*
