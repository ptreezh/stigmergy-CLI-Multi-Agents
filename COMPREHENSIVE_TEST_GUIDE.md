# Comprehensive Test Suite Guide

## Overview

This document describes the comprehensive test suite for the Stigmergy CLI project, designed to achieve **100% statement and branch coverage** across all modules.

## Test Structure

```
tests/
├── comprehensive/           # NEW: Comprehensive test suite
│   ├── cli/
│   │   └── commands/        # CLI command tests
│   ├── core/                # Core module tests
│   ├── coordination/        # Coordination layer tests
│   ├── adapters/            # Adapter tests
│   └── utils/               # Utility tests
├── unit/                    # Existing unit tests
├── integration/             # Existing integration tests
├── e2e/                     # Existing E2E tests
└── regression/              # Existing regression tests
```

## Test Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Statements | 100% | TBD |
| Branches | 100% | TBD |
| Functions | 100% | TBD |
| Lines | 100% | TBD |

## Running Tests

### Run All Comprehensive Tests

```bash
npm run test:comprehensive
```

This will:
1. Run all unit tests
2. Run all integration tests
3. Run comprehensive tests
4. Generate coverage report
5. Display detailed summary

### Run Specific Test Categories

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Comprehensive tests only
jest tests/comprehensive --coverage

# E2E tests only
npm run test:e2e

# Regression tests only
npm run test:regression
```

### Generate Coverage Report

```bash
# Full coverage report
npm run test:coverage

# Unit test coverage
npm run coverage:unit

# Integration test coverage
npm run coverage:integration
```

## Test Files Created

### Core Modules

1. **enhanced_cli_installer.test.js**
   - Tests installation logic
   - Permission detection
   - Linux/macOS/Windows specific installations
   - Error handling

2. **installer.test.js**
   - Tests StigmergyInstaller class
   - CLI detection and scanning
   - Hook generation
   - Deployment operations

### CLI Commands

3. **install.test.js**
   - Tests install command
   - Interactive and non-interactive modes
   - Skills cache integration
   - Error handling

4. **autoinstall.test.js**
   - Tests auto-install functionality
   - NPM postinstall detection
   - Verification checks
   - Environment-specific behavior

### Coordination Layer

5. **HookDeploymentManager.test.js**
   - Tests hook deployment
   - Multi-CLI support
   - Generator integration
   - Configuration management

## Test Organization

### By Module Type

**CLI Commands** (`src/cli/commands/`)
- autoinstall.js ✅
- install.js ✅
- scan.js ⏳
- status.js ⏳
- skills.js ⏳
- resume.js ⏳
- permissions.js ⏳
- system.js ⏳
- project.js ⏳
- errors.js ⏳

**Core Modules** (`src/core/`)
- enhanced_cli_installer.js ✅
- installer.js ✅
- cli_path_detector.js ⏳
- cli_parameter_handler.js ⏳
- smart_router.js ⏳
- cache_cleaner.js ✅ (existing)
- error_handler.js ✅ (existing)
- memory_manager.js ⏳

**Coordination Layer** (`src/core/coordination/`)
- HookDeploymentManager.js ✅
- AdapterManager.js ⏳
- CLCommunication.js ⏳
- CLIIntegrationManager.js ⏳
- HealthChecker.js ⏳
- StatisticsCollector.js ⏳

**Generators** (`src/core/coordination/nodejs/generators/`)
- ResumeSessionGenerator.js ✅ (existing)
- SkillsIntegrationGenerator.js ✅ (existing)
- CLIAdapterGenerator.js ✅ (existing)

**Adapters** (`src/adapters/`)
- claude/install_claude_integration.js ⏳
- gemini/install_gemini_integration.js ⏳
- qwen/install_qwen_integration.js ⏳
- iflow/install_iflow_integration.js ⏳
- codebuddy/install_codebuddy_integration.js ⏳
- codex/install_codex_integration.js ⏳
- copilot/install_copilot_integration.js ⏳
- qoder/install_qoder_integration.js ⏳

**Utils** (`src/utils/`, `src/cli/utils/`)
- helpers.js ⏳
- formatters.js ⏳
- environment.js ⏳
- skills_cache.js ⏳

Legend:
- ✅ Complete
- ⏳ Pending
- ❌ Not Started

## Test Patterns

### Basic Test Structure

```javascript
describe('ModuleName', () => {
  let instance;

  beforeEach(() => {
    // Setup
    instance = new ModuleName();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    jest.restoreAllMocks();
  });

  describe('Method Group', () => {
    test('should do something correctly', () => {
      // Test implementation
      expect(result).toBe(expected);
    });

    test('should handle errors', () => {
      // Error test
      expect(() => instance.method(null)).toThrow();
    });
  });
});
```

### Mocking External Dependencies

```javascript
jest.mock('../../../src/dependency');

describe('ModuleName', () => {
  beforeEach(() => {
    // Setup mocks
    dependency.mockReturnValue(expectedValue);
  });
});
```

### Async Testing

```javascript
test('should handle async operations', async () => {
  const result = await instance.asyncMethod();
  expect(result).toBeDefined();
});
```

## Coverage Targets

### High Priority (Must have 100% coverage)

1. **Installer Logic** - Critical for user onboarding
2. **Hook Deployment** - Essential for CLI integration
3. **CLI Commands** - User-facing functionality
4. **Error Handling** - Reliability

### Medium Priority (95%+ coverage)

1. **Coordination Layer** - Cross-CLI communication
2. **Path Detection** - CLI discovery
3. **Parameter Handling** - Command parsing

### Standard Priority (90%+ coverage)

1. **Utilities** - Helper functions
2. **Adapters** - Individual CLI integrations
3. **Configuration** - Settings management

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run test:comprehensive
      - uses: codecov/codecov-action@v2
```

## Troubleshooting

### Tests Fail to Run

1. **Clear cache**: `npm cache clean --force`
2. **Reinstall dependencies**: `rm -rf node_modules && npm install`
3. **Check Node version**: `node --version` (should be 16+)

### Low Coverage

1. **Run with verbose**: `npm run test:comprehensive -- --verbose`
2. **Check coverage report**: `open coverage/lcov-report/index.html`
3. **Identify gaps**: Look for red lines in coverage report

### Mock Issues

1. **Clear all mocks**: `jest.clearAllMocks()` in beforeEach
2. **Restore mocks**: `jest.restoreAllMocks()` in afterEach
3. **Check mock implementation**: Verify mocked return values

## Best Practices

### DO ✅

- Test all branches (if/else, switch cases)
- Test error conditions
- Test edge cases (null, undefined, empty)
- Mock external dependencies
- Clean up in afterEach
- Use descriptive test names
- Group related tests in describe blocks

### DON'T ❌

- Don't test implementation details
- Don't write brittle tests
- Don't skip error cases
- Don't forget to clean up mocks
- Don't make tests depend on each other
- Don't use random data in tests
- Don't ignore console warnings in tests

## Adding New Tests

### Template

```javascript
/**
 * Comprehensive Test Suite for [ModuleName]
 * 100% Statement and Branch Coverage
 */

const ModuleName = require('../../../src/path/to/module');

describe('ModuleName', () => {
  let instance;

  beforeEach(() => {
    instance = new ModuleName();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize correctly', () => {
      expect(instance).toBeDefined();
    });
  });

  describe('Core Functionality', () => {
    test('should handle main use case', () => {
      // Test main functionality
    });

    test('should handle errors', () => {
      // Test error handling
    });
  });

  describe('Edge Cases', () => {
    test('should handle null inputs', () => {
      // Test null handling
    });

    test('should handle empty inputs', () => {
      // Test empty handling
    });
  });

  describe('Integration', () => {
    test('should integrate with other modules', () => {
      // Test integration
    });
  });
});
```

## Coverage Report Analysis

### View HTML Coverage Report

```bash
# Generate coverage
npm run test:comprehensive

# Open report (macOS)
open coverage/lcov-report/index.html

# Open report (Linux)
xdg-open coverage/lcov-report/index.html

# Open report (Windows)
start coverage/lcov-report/index.html
```

### Interpret Coverage Metrics

- **Statements**: Each executable statement
- **Branches**: Each if/else/switch branch
- **Functions**: Each function declaration
- **Lines**: Each line of code

### Improve Coverage

1. Identify uncovered code in coverage report
2. Add tests for uncovered branches
3. Test error conditions
4. Test edge cases
5. Re-run tests and verify improvement

## Maintenance

### Regular Tasks

- **Weekly**: Review coverage reports
- **Per PR**: Ensure new code has tests
- **Per Release**: Verify 100% coverage on critical paths
- **Quarterly**: Review and update test patterns

### Update Tests When Code Changes

1. Identify changed functions
2. Update related tests
3. Add tests for new functions
4. Remove tests for removed functions
5. Verify coverage maintained

## Support

For issues or questions about the test suite:

1. Check this guide first
2. Review test examples in `tests/comprehensive/`
3. Check Jest documentation: https://jestjs.io/
4. Open an issue with detailed error messages

## Summary

This comprehensive test suite ensures:
- ✅ 100% coverage of critical code paths
- ✅ Reliability through extensive testing
- ✅ Easy maintenance with clear structure
- ✅ Fast feedback with automated runs
- ✅ Confidence in code changes

Happy Testing! 🧪
