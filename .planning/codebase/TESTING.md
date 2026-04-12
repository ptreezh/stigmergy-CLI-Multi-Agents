# Testing Patterns

**Analysis Date:** 2026-04-12

## Test Framework

**Runner:**
- Jest 30.2.0
- Config: Jest with Babel integration
- Additional tools: jest-junit 16.0.0 for XML reports

**Assertion Library:**
- Jest built-in assertions (`expect`, `toBe`, `toEqual`, `toThrow`, etc.)
- Jest globals: `describe`, `it`, `test`, `beforeEach`, `afterEach`, `beforeAll`, `afterAll`

**Run Commands** (from `package.json`):
```bash
npm test                 # Run all tests via scripts/run-tests.js
npm run test:unit        # Unit tests with coverage
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests
npm run test:automation  # Automation tests
npm run test:functional  # Functional tests
npm run test:watch       # Watch mode
npm run test:coverage     # Coverage report
npm run test:report       # HTML coverage report
```

## Test File Organization

**Location:**
- Co-located with source code in `__tests__` directories
- Centralized in `tests/` directory for integration/E2E

**Directory Structure:**
```
tests/
  unit/           # Unit tests
    core/
      smart_router.test.js
      concurrent.test.js
      installer.test.js
      skills.test.js
      cli_path_detector.test.js
    hooks/
      verification-gate.test.js
    incubator/
      cli-generator.test.js
      builtin-cli-generator.test.js
      cli-anything-integrator.test.js
  integration/     # Integration tests
    multi-cli.test.js
  e2e/            # End-to-end tests
    installation.test.js
  automation/     # Automation tests
    auto-install.test.js
  functional/     # Functional tests
```

**Naming Convention:**
- Files: `*.test.js` (primary) or `*.spec.js`
- Describe blocks: descriptive test suite names (e.g., "SmartRouter", "SkillInstaller")

## Test Structure

**Unit Test Pattern** (`tests/unit/core/smart_router.test.js`):
```javascript
describe("SmartRouter", () => {
  let SmartRouter;
  let originalEnv;

  beforeAll(() => {
    SmartRouter = require("../../../src/core/smart_router");
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("VALID_CLI_TOOLS", () => {
    test("应该包含 opencode", () => {
      const router = new SmartRouter();
      expect(router.validTools).toContain("opencode");
    });
  });

  describe("smartRoute()", () => {
    test("smartRoute 不应该路由到未安装的 CLI", async () => {
      const router = new SmartRouter();
      const result = await router.smartRoute("测试任务");

      expect(result).toBeDefined();
      expect(result.tool).toBeDefined();
    });
  });
});
```

**Integration Test Pattern** (`tests/integration/multi-cli.test.js`):
```javascript
describe('Multi-CLI Integration', () => {
  const testTimeout = 120000;  // 2 minute timeout
  let tempDir;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), 'stigmergy-integration-test-' + Date.now());
    fs.mkdirSync(tempDir, { recursive: true });
    process.chdir(tempDir);
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('CLI调用测试', () => {
    test(
      '应该能够调用Claude CLI',
      async () => {
        try {
          const result = execSync('stigmergy claude "echo hello"', {
            encoding: 'utf-8',
            stdio: 'pipe',
            timeout: 30000
          });
          expect(result).toBeDefined();
        } catch (error) {
          if (error.message.includes('not found')) {
            console.log('Claude CLI not installed, skipping test');
            return;
          }
          throw error;
        }
      },
      testTimeout
    );
  });
});
```

**E2E Test Pattern** (`tests/e2e/installation.test.js`):
```javascript
describe('Installation E2E', () => {
  const testTimeout = 120000; // 2 minutes

  test(
    '应该能够全局安装stigmergy',
    async () => {
      try {
        const result = execSync('npm install -g stigmergy@beta', {
          encoding: 'utf-8',
          stdio: 'pipe'
        });
        expect(result).toBeDefined();
      } catch (error) {
        if (error.message.includes('already installed')) {
          console.log('Stigmergy already installed, skipping');
          return;
        }
        throw error;
      }
    },
    testTimeout
  );
});
```

**Skill Tests with Arrange-Act-Assert** (`src/core/skills/__tests__/SkillInstaller.test.js`):
```javascript
describe('SkillInstaller', () => {
  describe('parseGitHubUrl', () => {
    it('should parse standard GitHub URL', () => {
      // Arrange
      const url = 'https://github.com/owner/repo';

      // Act
      const result = installer.parseGitHubUrl(url);

      // Assert
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
    });

    it('should throw error for invalid URL', () => {
      // Arrange
      const url = 'not-a-valid-url';

      // Act & Assert
      expect(() => installer.parseGitHubUrl(url))
        .toThrow('Invalid GitHub URL');
    });
  });
});
```

## Mocking

**Module Mocking**:
```javascript
// Mock a module
jest.mock('../some-module');

// Mock with implementation
jest.mock('../module', () => ({
  function1: jest.fn(),
  function2: jest.fn().mockResolvedValue({}),
}));

// Mock fs module for testing
jest.mock('fs/promises', () => ({
  access: jest.fn(),
  mkdir: jest.fn(),
  readFile: jest.fn(),
}));
```

**Spying**:
```javascript
const originalFunc = require('./module');
jest.spyOn(require('./module'), 'functionName');
```

**Environment Variable Mocking**:
```javascript
beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = { ...originalEnv };
});

// Usage
process.env.SOME_VAR = 'test-value';
```

## Fixtures and Factories

**Test Data Factories**:
```javascript
function createMockSkill(name = 'test-skill') {
  return {
    name,
    description: `Test skill: ${name}`,
    version: '1.0.0',
    path: `/path/to/${name}`,
  };
}
```

**Temp Directory Fixtures**:
```javascript
beforeEach(async () => {
  testDir = path.join(os.tmpdir(), `test-${Date.now()}`);
  await fs.mkdir(testDir, { recursive: true });
});

afterEach(async () => {
  await fs.rm(testDir, { recursive: true, force: true });
});
```

## Coverage

**Requirements:**
- Not explicitly enforced in config
- Coverage reports available via `npm run test:coverage`

**Coverage Commands:**
```bash
npm run test:coverage    # Run with coverage
npm run test:report      # HTML report in coverage/
```

**Coverage Files:**
- Source: `src/**/*.js`
- Excluded: `node_modules/`, `archive/`, test files

## Test Types

**Unit Tests:**
- Location: `tests/unit/`
- Scope: Individual functions, classes, modules
- Characteristics: Fast, isolated, mocked dependencies
- Example: `tests/unit/core/smart_router.test.js`

**Integration Tests:**
- Location: `tests/integration/`
- Scope: Component interactions, CLI commands
- Characteristics: Use temp directories, test real file operations
- Example: `tests/integration/multi-cli.test.js`

**E2E Tests:**
- Location: `tests/e2e/`
- Scope: Complete workflows
- Characteristics: Long timeout (120s), may require actual CLI installations
- Example: `tests/e2e/installation.test.js`

**Automation Tests:**
- Location: `tests/automation/`
- Scope: Automated workflows (init, deploy)
- Characteristics: Real CLI execution in temp directories
- Example: `tests/automation/auto-install.test.js`

## Common Patterns

**Async Testing with Promises:**
```javascript
test('should handle async operations', async () => {
  const result = await someAsyncFunction();
  expect(result).toBe(expected);
});
```

**Error Testing:**
```javascript
test('should throw error for invalid input', () => {
  expect(() => parseUrl('invalid'))
    .toThrow('Invalid URL');
});
```

**Skip Tests Gracefully:**
```javascript
test('should work if CLI installed', async () => {
  try {
    execSync('some-cli --version', { stdio: 'pipe' });
  } catch (error) {
    if (error.message.includes('not found')) {
      console.log('CLI not installed, skipping');
      return;
    }
    throw error;
  }
});
```

**Source Code Testing** (for config validation):
```javascript
test('should have correct CLI order', () => {
  const sourceCode = fs.readFileSync(
    path.join(__dirname, '../../../src/cli/commands/concurrent.js'),
    'utf8'
  );
  expect(sourceCode).toContain('"claude"');
  expect(sourceCode).not.toContain('"kilocode"');
});
```

**Timeout Configuration:**
```javascript
// Default integration test timeout
const testTimeout = 120000; // 2 minutes

// Longer timeouts for slow operations
test('complex workflow', async () => {
  // test implementation
}, testTimeout * 4);
```

## Global Setup/Teardown

**Test Setup** (`tests/setup.js`):
- May include test environment preparation
- See `tests/setup.js` for actual implementation

---

*Testing analysis: 2026-04-12*
