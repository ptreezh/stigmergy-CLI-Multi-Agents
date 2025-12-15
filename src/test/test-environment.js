/**
 * Test Environment Isolation
 * Creates isolated environment for testing without affecting user setup
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class TestEnvironment {
  constructor(name = 'stigmergy-test') {
    this.name = name;
    this.baseDir = path.join(os.tmpdir(), name);
    this.originalEnv = { ...process.env };
    this.isSetup = false;
  }

  /**
   * Setup isolated test environment
   * @param {Object} options - Setup options
   */
  async setup(options = {}) {
    const { clean = true } = options;

    // Create base directory
    if (clean && fs.existsSync(this.baseDir)) {
      await this.cleanup();
    }
    fs.mkdirSync(this.baseDir, { recursive: true });

    // Setup home directory
    this.testHome = path.join(this.baseDir, 'home');
    fs.mkdirSync(this.testHome, { recursive: true });

    // Setup test configuration directories
    this.configDirs = {
      stigmergy: path.join(this.testHome, '.stigmergy'),
      claude: path.join(this.testHome, '.claude'),
      gemini: path.join(this.testHome, '.gemini'),
      qwen: path.join(this.testHome, '.qwen'),
      // Add more as needed
    };

    Object.values(this.configDirs).forEach(dir => {
      fs.mkdirSync(dir, { recursive: true });
    });

    // Modify environment variables
    process.env.HOME = this.testHome;
    process.env.USERPROFILE = this.testHome; // Windows
    process.env.PATH = this.createSafePath();

    this.isSetup = true;
  }

  /**
   * Create safe PATH with essential tools only
   * @returns {string} Safe PATH
   */
  createSafePath() {
    const essentialPaths = [
      '/usr/bin',
      '/usr/local/bin',
      path.join(process.env.ProgramFiles || '', 'Git', 'bin'),
      path.join(process.env.ProgramFiles || '', 'nodejs'),
    ].filter(p => p && fs.existsSync(p));

    return essentialPaths.join(path.delimiter);
  }

  /**
   * Setup mock CLI tools for testing
   * @param {Object} mockTools - Map of tool name to mock implementation
   */
  async setupMockCLIs(mockTools = {}) {
    const mockBinDir = path.join(this.testHome, 'bin');
    fs.mkdirSync(mockBinDir, { recursive: true });

    // Add mock bin directory to PATH
    process.env.PATH = `${mockBinDir}${path.delimiter}${process.env.PATH}`;

    for (const [toolName, behavior] of Object.entries(mockTools)) {
      await this.createMockCLI(toolName, behavior, mockBinDir);
    }
  }

  /**
   * Create a mock CLI tool
   * @param {string} name - Tool name
   * @param {Object} behavior - Mock behavior
   * @param {string} binDir - Binary directory
   */
  async createMockCLI(name, behavior, binDir) {
    const script = this.generateMockScript(name, behavior);
    const scriptPath = path.join(binDir, name);

    if (process.platform === 'win32') {
      // Windows batch file
      const batPath = scriptPath + '.cmd';
      fs.writeFileSync(batPath, `@echo off\n${script}\n`, 'utf8');
      // Make executable
      fs.chmodSync(batPath, '755');
    } else {
      // Unix shell script
      fs.writeFileSync(scriptPath, `#!/bin/bash\n${script}\n`, 'utf8');
      // Make executable
      fs.chmodSync(scriptPath, '755');
    }
  }

  /**
   * Generate mock script content
   * @param {string} toolName - Tool name
   * @param {Object} behavior - Mock behavior definition
   * @returns {string} Script content
   */
  generateMockScript(toolName, behavior) {
    const defaultBehavior = {
      version: `${toolName} version 1.0.0-mock`,
      success: true,
      delay: 0,
      output: `Mock ${toolName} executed successfully`
    };

    const config = { ...defaultBehavior, ...behavior };

    let script = '';
    if (config.delay > 0) {
      script += `sleep ${config.delay}\n`;
    }

    // Handle version command
    script += 'if echo "$*" | grep -q "\\-\\-version\\|-v"; then\n';
    script += `  echo "${config.version}"\n`;
    script += '  exit 0\n';
    script += 'fi\n';

    // Handle help command
    script += 'if echo "$*" | grep -q "\\-\\-help\\|-h"; then\n';
    script += `  echo "Mock ${toolName} help"\n`;
    script += `  echo "Usage: ${toolName} [options]"\n`;
    script += '  exit 0\n';
    script += 'fi\n';

    // Handle prompt flag
    script += 'PROMPT=""\n';
    script += 'for arg in "$@"; do\n';
    script += '  if [[ "$arg" == "-p" ]]; then\n';
    script += '    PROMPT="$1"\n';
    script += '    shift\n';
    script += '  fi\n';
    script += '  shift\n';
    script += 'done\n';

    // Generate response
    script += 'if [ -n "$PROMPT" ]; then\n';
    script += '  echo "Mock response for: $PROMPT"\n';
    script += `  echo "${config.output}"\n`;
    script += 'else\n';
    script += `  echo "${config.output}"\n`;
    script += 'fi\n';

    // Handle success/failure
    script += config.success ? 'exit 0\n' : 'exit 1\n';

    return script;
  }

  /**
   * Execute command in isolated environment
   * @param {string} command - Command to execute
   * @param {Array} args - Command arguments
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Execution result
   */
  async execute(command, args = [], options = {}) {
    if (!this.isSetup) {
      throw new Error('Test environment not setup. Call setup() first.');
    }

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';

      const child = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        env: process.env, // Use modified environment
        ...options
      });

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          stdout,
          stderr,
          exitCode: code
        });
      });

      child.on('error', (error) => {
        resolve({
          success: false,
          stdout,
          stderr,
          error: error.message
        });
      });
    });
  }

  /**
   * Create test data in environment
   * @param {Object} testData - Test data structure
   */
  createTestData(testData = {}) {
    for (const [filePath, content] of Object.entries(testData)) {
      const fullPath = path.join(this.testHome, filePath);
      const dir = path.dirname(fullPath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      if (typeof content === 'object') {
        fs.writeFileSync(fullPath, JSON.stringify(content, null, 2), 'utf8');
      } else {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }

  /**
   * Restore original environment
   */
  restore() {
    if (!this.isSetup) return;

    // Restore environment variables
    Object.keys(this.originalEnv).forEach(key => {
      process.env[key] = this.originalEnv[key];
    });

    // Remove any additions
    const addedKeys = Object.keys(process.env).filter(key => !this.originalEnv.hasOwnProperty(key));
    addedKeys.forEach(key => {
      delete process.env[key];
    });

    this.isSetup = false;
  }

  /**
   * Cleanup test environment
   */
  async cleanup() {
    this.restore();

    try {
      if (fs.existsSync(this.baseDir)) {
        fs.rmSync(this.baseDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn(`Warning: Could not cleanup test directory: ${error.message}`);
    }
  }

  /**
   * Get path in test environment
   * @param {...string} parts - Path parts
   * @returns {string} Full path in test environment
   */
  getPath(...parts) {
    return path.join(this.testHome, ...parts);
  }
}

module.exports = TestEnvironment;
