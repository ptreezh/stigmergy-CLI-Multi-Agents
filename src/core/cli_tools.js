const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const { errorHandler, ERROR_TYPES } = require('./error_handler');
const CLIPathDetector = require('./cli_path_detector');

// AI CLI Tools Configuration
const CLI_TOOLS = {
  claude: {
    name: 'Claude CLI',
    version: 'claude --version',
    install: 'npm install -g @anthropic-ai/claude-code',
    hooksDir: path.join(os.homedir(), '.claude', 'hooks'),
    config: path.join(os.homedir(), '.claude', 'config.json'),
    autoInstall: false, // 默认不安装
  },
  gemini: {
    name: 'Gemini CLI',
    version: 'gemini --version',
    install: 'npm install -g @google/gemini-cli',
    hooksDir: path.join(os.homedir(), '.gemini', 'extensions'),
    config: path.join(os.homedir(), '.gemini', 'config.json'),
    autoInstall: false, // 默认不安装
  },
  qwen: {
    name: 'Qwen CLI',
    version: 'qwen --version',
    install: 'npm install -g @qwen-code/qwen-code',
    hooksDir: path.join(os.homedir(), '.qwen', 'hooks'),
    config: path.join(os.homedir(), '.qwen', 'config.json'),
    autoInstall: true, // 默认安装
  },
  iflow: {
    name: 'iFlow CLI',
    version: 'iflow --version',
    install: 'npm install -g @iflow-ai/iflow-cli',
    hooksDir: path.join(os.homedir(), '.iflow', 'hooks'),
    config: path.join(os.homedir(), '.iflow', 'config.json'),
    autoInstall: true, // 默认安装
  },
  qodercli: {
    name: 'Qoder CLI',
    version: 'qodercli --version',
    install: 'npm install -g @qoder-ai/qodercli',
    hooksDir: path.join(os.homedir(), '.qoder', 'hooks'),
    config: path.join(os.homedir(), '.qoder', 'config.json'),
    autoInstall: true, // 默认安装
  },
  codebuddy: {
    name: 'CodeBuddy CLI',
    version: 'codebuddy --version',
    install: 'npm install -g @tencent-ai/codebuddy-code',
    hooksDir: path.join(os.homedir(), '.codebuddy', 'hooks'),
    config: path.join(os.homedir(), '.codebuddy', 'config.json'),
    autoInstall: true, // 默认安装
  },
  copilot: {
    name: 'GitHub Copilot CLI',
    version: 'copilot --version',
    install: 'npm install -g @github/copilot',
    hooksDir: path.join(os.homedir(), '.copilot', 'mcp'),
    config: path.join(os.homedir(), '.copilot', 'config.json'),
    autoInstall: false, // 默认不安装
  },
  codex: {
    name: 'OpenAI Codex CLI',
    version: 'codex --version',
    install: 'npm install -g @openai/codex',
    hooksDir: path.join(os.homedir(), '.config', 'codex', 'slash_commands'),
    config: path.join(os.homedir(), '.codex', 'config.json'),
    autoInstall: false, // 默认不安装
  },
  kode: {
    name: 'Kode CLI',
    version: 'kode --version',
    install: 'npm install -g @shareai-lab/kode',
    hooksDir: path.join(os.homedir(), '.kode', 'agents'),
    config: path.join(os.homedir(), '.kode', 'config.json'),
    autoInstall: false, // 默认不安装
  },
  resumesession: {
    name: 'ResumeSession CLI',
    version: 'resumesession --version',
    install: 'npm install -g @stigmergy/resume',
    hooksDir: path.join(os.homedir(), '.resumesession', 'hooks'),
    config: path.join(os.homedir(), '.resumesession', 'config.json'),
    autoInstall: false, // 内部功能，不单独安装
  },
  opencode: {
    name: 'OpenCode AI CLI',
    version: 'opencode --version',
    install: 'npm install -g opencode-ai',
    hooksDir: path.join(os.homedir(), '.opencode', 'hooks'),
    config: path.join(os.homedir(), '.opencode', 'config.json'),
    autoInstall: false, // 默认不安装
  },
  'oh-my-opencode': {
    name: 'Oh-My-OpenCode Plugin Manager',
    version: 'oh-my-opencode --version',
    install: 'npm install bun -g && bunx oh-my-opencode install --no-tui --claude=no --chatgpt=no --gemini=no',
    hooksDir: path.join(os.homedir(), '.opencode', 'plugins'),
    config: path.join(os.homedir(), '.opencode', 'config.json'),
    skipVersionCheck: true, // Version check may not work properly for bunx packages
    requiresBun: true, // Requires bun runtime
    autoInstall: false, // 默认不安装
  },
};

/**
 * Validate CLI tool configuration
 * @param {string} toolName - Name of the tool to validate
 * @throws {StigmergyError} If validation fails
 */
function validateCLITool(toolName) {
  if (!CLI_TOOLS[toolName]) {
    throw errorHandler.createError(
      `CLI tool '${toolName}' is not configured`,
      ERROR_TYPES.CONFIGURATION,
      'INVALID_CLI_TOOL',
    );
  }

  const tool = CLI_TOOLS[toolName];
  if (!tool.name || !tool.version || !tool.install) {
    throw errorHandler.createError(
      `CLI tool '${toolName}' has invalid configuration`,
      ERROR_TYPES.CONFIGURATION,
      'INCOMPLETE_CLI_CONFIG',
    );
  }
}

/**
 * Create global path detector instance (lazy initialization)
 */
let pathDetector = null;

function getPathDetector() {
  if (!pathDetector) {
    pathDetector = new CLIPathDetector();
  }
  return pathDetector;
}

/**
 * Initialize path detection and load cached paths
 */
async function initializePathDetection() {
  const detector = getPathDetector();
  await detector.loadDetectedPaths();
}

/**
 * Get CLI tool path with automatic detection fallback
 */
async function getCLIPath(toolName) {
  const detector = getPathDetector();

  // Check cached paths first
  let toolPath = detector.getDetectedPath(toolName);
  if (toolPath) {
    return toolPath;
  }

  // If not cached, detect and update
  console.log(`[PATH] Detecting path for ${toolName}...`);
  toolPath = await detector.detectCLIPath(toolName);

  return toolPath;
}

/**
 * Check if a CLI tool is actually executable
 * @param {string} toolName - Name of the tool to check
 * @returns {Promise<boolean>} Whether the tool is executable
 */
async function checkIfCLIExecutable(toolName) {
  const { spawnSync } = require('child_process');
  const os = require('os');

  // Special handling for codex - check if the JS file is valid
  if (toolName === 'codex') {
    try {
      // First check if codex command exists
      const whichCmd = process.platform === 'win32' ? 'where' : 'which';
      const whichResult = spawnSync(whichCmd, [toolName], {
        encoding: 'utf8',
        timeout: 10000,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      });

      if (whichResult.status === 0 && whichResult.stdout.trim()) {
        const codexPath = whichResult.stdout.trim().split('\n')[0]; // Get first match

        // If it's a shell script, check the target JS file
        if (
          codexPath.endsWith('.sh') ||
          codexPath.endsWith('.cmd') ||
          codexPath.endsWith('/codex') ||
          codexPath.endsWith('\\codex')
        ) {
          // Try to verify JS file, but don't fail if we can't
          // The actual --version test below is more reliable
          try {
            const fsSync = require('fs');
            const scriptContent = fsSync.readFileSync(codexPath, 'utf8');

            // Look for JS file reference in the script
            // Match node_modules/@openai/codex/bin/codex.js pattern
            const jsFileMatch = scriptContent.match(/node_modules\/@openai\/codex\/bin\/codex\.js/);
            if (jsFileMatch) {
              // Construct actual path based on npm global directory
              const npmGlobalDir = require('path').dirname(codexPath);
              const jsFilePath = require('path').join(npmGlobalDir, jsFileMatch[0]);

              if (fsSync.existsSync(jsFilePath)) {
                const stats = fsSync.statSync(jsFilePath);
                if (stats.size === 0) {
                  console.log('[DEBUG] Codex JS file is empty, marking as unavailable');
                  return false;
                }
                // File exists and has content - continue to version check
              } else {
                console.log('[DEBUG] Codex JS file not found at expected path, will try version check');
              }
            }
          } catch (scriptError) {
            console.log(`[DEBUG] Could not verify codex script: ${scriptError.message}`);
            // Continue anyway - the version check below is more reliable
          }
        }

        // If we got here, the codex command exists - continue with normal checks below
      } else {
        // Codex command doesn't exist
        return false;
      }
    } catch (error) {
      console.log(`[DEBUG] Error checking codex: ${error.message}`);
      return false;
    }
  }

  // First try to find the executable using which/where command (more reliable)
  try {
    const whichCmd = process.platform === 'win32' ? 'where' : 'which';
    const whichResult = spawnSync(whichCmd, [toolName], {
      encoding: 'utf8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'], // Use pipes to avoid file opening
      shell: true,
    });

    if (whichResult.status === 0 && whichResult.stdout.trim()) {
      // Found executable, now test it safely
      const testArgs = ['--help'];
      const testOptions = {
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'], // Don't inherit from parent to avoid opening UI
        shell: true,
      };

      // Additional protection for codex
      // Note: codex requires shell=true on Windows to work properly
      if (toolName === 'codex') {
        // Keep shell=true for codex (don't override)
        testOptions.windowsHide = true;
        testOptions.detached = false;
      }

      const testResult = spawnSync(toolName, testArgs, testOptions);

      // If command runs successfully or at least returns something (not command not found)
      if (testResult.status === 0 || testResult.status === 1) {
        return true;
      }
    }
  } catch (error) {
    // which/where command probably failed, continue with other checks
    console.log(`[DEBUG] which/where check failed for ${toolName}: ${error.message}`);
  }

  // Special handling for codex to avoid opening files
  if (toolName === 'codex') {
    // For codex, only try --help and --version with extra precautions
    // Note: codex requires shell=true on Windows
    const codexChecks = [
      { args: ['--help'], expected: 0 },
      { args: ['--version'], expected: 0 },
    ];

    for (const check of codexChecks) {
      try {
        const result = spawnSync(toolName, check.args, {
          encoding: 'utf8',
          timeout: 10000,
          stdio: ['pipe', 'pipe', 'pipe'], // Ensure all IO is piped
          shell: true, // Use shell for codex compatibility
          windowsHide: true, // Hide console window on Windows
          detached: false, // Don't detach process
        });

        if (result.status === 0 || result.status === 1) {
          return true;
        }
      } catch (error) {
        // Continue to next check
      }
    }
    return false; // If all codex checks fail
  }

  // Fallback: Try multiple ways to check if CLI is available but more safely
  const checks = [
    // Method 1: Try help command (most common and safe)
    { args: ['--help'], expected: 0 },
    // Method 2: Try help command with -h
    { args: ['-h'], expected: 0 },
    // Method 3: Try version command
    { args: ['--version'], expected: 0 },
    // Method 4: Try just the command (help case)
    { args: [], expected: 0 },
  ];

  for (const check of checks) {
    try {
      const result = spawnSync(toolName, check.args, {
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'], // Use pipe instead of inherit to avoid opening files
        shell: true,
      });

      // Check if command executed successfully or at least didn't fail with "command not found"
      if (
        result.status === check.expected ||
        (result.status !== 127 &&
          result.status !== 9009 &&
          result.status !== 1) // Also avoid status 1 (general error)
      ) {
        // 127 = command not found on Unix, 9009 = command not found on Windows
        return true;
      }
    } catch (error) {
      // Continue to next check method
      continue;
    }
  }

  return false;
}

/**
 * Update PATH configuration and run path detection
 */
async function setupCLIPaths() {
  console.log('[PATH] Setting up CLI paths configuration...');

  const detector = getPathDetector();

  // 1. Load existing cached paths
  await detector.loadDetectedPaths();

  // 2. Detect all CLI paths
  const detectedPaths = await detector.detectAllCLIPaths();

  // 3. Check and update PATH if needed
  const pathStatus = await detector.updatePATHIfMissing();

  // 4. Create an enhanced report that checks if tools are actually executable
  const enhancedReport = {
    platform: detector.platform,
    npmGlobalPaths: detector.npmGlobalPaths,
    detectedPaths: detector.detectedPaths,
    summary: {
      total: Object.keys(detector.cliNameMap).length,
      found: 0, // Will be calculated below
      missing: 0 // Will be calculated below
    }
  };

  // Count actually executable tools
  let executableCount = 0;
  for (const [toolName, toolPath] of Object.entries(detectedPaths)) {
    if (toolPath) {
      // Check if the CLI is actually executable
      const isExecutable = await checkIfCLIExecutable(toolName);
      if (isExecutable) {
        executableCount++;
      }
    }
  }

  enhancedReport.summary.found = executableCount;
  enhancedReport.summary.missing = Object.keys(detector.cliNameMap).length - executableCount;

  return {
    detectedPaths,
    pathStatus,
    report: enhancedReport
  };
}

/**
 * Check if a CLI tool is actually executable
 * @param {string} toolName - Name of the tool to check
 * @returns {Promise<boolean>} Whether the tool is executable
 */
async function checkIfCLIExecutable(toolName) {
  const { spawnSync } = require('child_process');
  const os = require('os');

  // Special handling for codex - check if the JS file is valid
  if (toolName === 'codex') {
    try {
      // First check if codex command exists
      const whichCmd = process.platform === 'win32' ? 'where' : 'which';
      const whichResult = spawnSync(whichCmd, [toolName], {
        encoding: 'utf8',
        timeout: 10000,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      });

      if (whichResult.status === 0 && whichResult.stdout.trim()) {
        const codexPath = whichResult.stdout.trim().split('\n')[0]; // Get first match

        // If it's a shell script, check the target JS file
        if (
          codexPath.endsWith('.sh') ||
          codexPath.endsWith('.cmd') ||
          codexPath.endsWith('/codex') ||
          codexPath.endsWith('\\codex')
        ) {
          // Try to verify JS file, but don't fail if we can't
          // The actual --version test below is more reliable
          try {
            const fsSync = require('fs');
            const scriptContent = fsSync.readFileSync(codexPath, 'utf8');

            // Look for JS file reference in the script
            // Match node_modules/@openai/codex/bin/codex.js pattern
            const jsFileMatch = scriptContent.match(/node_modules\/@openai\/codex\/bin\/codex\.js/);
            if (jsFileMatch) {
              // Construct actual path based on npm global directory
              const npmGlobalDir = require('path').dirname(codexPath);
              const jsFilePath = require('path').join(npmGlobalDir, jsFileMatch[0]);

              if (fsSync.existsSync(jsFilePath)) {
                const stats = fsSync.statSync(jsFilePath);
                if (stats.size === 0) {
                  console.log('[DEBUG] Codex JS file is empty, marking as unavailable');
                  return false;
                }
                // File exists and has content - continue to version check
              } else {
                console.log('[DEBUG] Codex JS file not found at expected path, will try version check');
              }
            }
          } catch (scriptError) {
            console.log(`[DEBUG] Could not verify codex script: ${scriptError.message}`);
            // Continue anyway - the version check below is more reliable
          }
        }

        // If we got here, the codex command exists - continue with normal checks below
      } else {
        // Codex command doesn't exist
        return false;
      }
    } catch (error) {
      console.log(`[DEBUG] Error checking codex: ${error.message}`);
      return false;
    }
  }

  // First try to find the executable using which/where command (more reliable)
  try {
    const whichCmd = process.platform === 'win32' ? 'where' : 'which';
    const whichResult = spawnSync(whichCmd, [toolName], {
      encoding: 'utf8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'], // Use pipes to avoid file opening
      shell: true,
    });

    if (whichResult.status === 0 && whichResult.stdout.trim()) {
      // Found executable, now test it safely
      const testArgs = ['--help'];
      const testOptions = {
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'], // Don't inherit from parent to avoid opening UI
        shell: true,
      };

      // Additional protection for codex
      // Note: codex requires shell=true on Windows to work properly
      if (toolName === 'codex') {
        // Keep shell=true for codex (don't override)
        testOptions.windowsHide = true;
        testOptions.detached = false;
      }

      const testResult = spawnSync(toolName, testArgs, testOptions);

      // If command runs successfully or at least returns something (not command not found)
      if (testResult.status === 0 || testResult.status === 1) {
        return true;
      }
    }
  } catch (error) {
    // which/where command probably failed, continue with other checks
    console.log(`[DEBUG] which/where check failed for ${toolName}: ${error.message}`);
  }

  // Special handling for codex to avoid opening files
  if (toolName === 'codex') {
    // For codex, only try --help and --version with extra precautions
    // Note: codex requires shell=true on Windows
    const codexChecks = [
      { args: ['--help'], expected: 0 },
      { args: ['--version'], expected: 0 },
    ];

    for (const check of codexChecks) {
      try {
        const result = spawnSync(toolName, check.args, {
          encoding: 'utf8',
          timeout: 10000,
          stdio: ['pipe', 'pipe', 'pipe'], // Ensure all IO is piped
          shell: true, // Use shell for codex compatibility
          windowsHide: true, // Hide console window on Windows
          detached: false, // Don't detach process
        });

        if (result.status === 0 || result.status === 1) {
          return true;
        }
      } catch (error) {
        // Continue to next check
      }
    }
    return false; // If all codex checks fail
  }

  // Fallback: Try multiple ways to check if CLI is available but more safely
  const checks = [
    // Method 1: Try help command (most common and safe)
    { args: ['--help'], expected: 0 },
    // Method 2: Try help command with -h
    { args: ['-h'], expected: 0 },
    // Method 3: Try version command
    { args: ['--version'], expected: 0 },
    // Method 4: Try just the command (help case)
    { args: [], expected: 0 },
  ];

  for (const check of checks) {
    try {
      const result = spawnSync(toolName, check.args, {
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'], // Use pipe instead of inherit to avoid opening files
        shell: true,
      });

      // Check if command executed successfully or at least didn't fail with "command not found"
      if (
        result.status === check.expected ||
        (result.status !== 127 &&
          result.status !== 9009 &&
          result.status !== 1) // Also avoid status 1 (general error)
      ) {
        // 127 = command not found on Unix, 9009 = command not found on Windows
        return true;
      }
    } catch (error) {
      // Continue to next check method
      continue;
    }
  }

  return false;
}

/**
 * Scan for available CLI tools
 * @param {Object} options - Scan options
 * @param {boolean} options.deep - Deep scan
 * @param {boolean} options.verbose - Verbose output
 * @returns {Promise<Object>} Scan results
 */
async function scanForTools(options = {}) {
  const detector = getPathDetector();

  // Load cached paths first
  await detector.loadDetectedPaths();

  // Detect all CLI paths
  const detectedPaths = await detector.detectAllCLIPaths();

  const found = [];
  const missing = [];

  for (const [toolName, toolPath] of Object.entries(detectedPaths)) {
    if (toolPath) {
      // Additional check: verify the CLI is actually executable
      const isExecutable = await checkIfCLIExecutable(toolName);
      if (isExecutable) {
        found.push({
          name: toolName,
          path: toolPath,
          type: 'cli',
          status: 'installed',
          description: CLI_TOOLS[toolName]?.name || toolName
        });
      } else {
        missing.push(toolName);
      }
    } else {
      missing.push(toolName);
    }
  }

  return {
    found,
    missing,
    total: Object.keys(CLI_TOOLS).length
  };
}

/**
 * Check installation status of a specific CLI tool
 * @param {string} toolName - Name of the tool
 * @returns {Promise<Object>} Installation status
 */
async function checkInstallation(toolName) {
  validateCLITool(toolName);

  // Get path using the detector
  const detector = getPathDetector();
  await detector.loadDetectedPaths();
  let toolPath = detector.getDetectedPath(toolName);

  if (!toolPath) {
    toolPath = await detector.detectCLIPath(toolName);
  }

  // Check if the tool is actually executable, not just if the path exists
  const isExecutable = await checkIfCLIExecutable(toolName);
  const installed = !!toolPath && isExecutable;

  let version = null;
  if (installed) {
    try {
      const { spawnSync } = require('child_process');
      const toolConfig = CLI_TOOLS[toolName];
      const versionCmd = toolConfig.version || `${toolName} --version`;

      const result = spawnSync(versionCmd.split(' ')[0], versionCmd.split(' ').slice(1), {
        encoding: 'utf8',
        shell: true,
        timeout: 5000
      });

      if (result.status === 0) {
        version = result.stdout.trim() || result.stderr.trim();
      }
    } catch (error) {
      // Version check failed, but tool is still installed
    }
  }

  return {
    installed,
    path: toolPath,
    version,
    lastChecked: new Date().toISOString()
  };
}

// Attach methods to CLI_TOOLS object for backward compatibility
CLI_TOOLS.scanForTools = scanForTools;
CLI_TOOLS.checkInstallation = checkInstallation;

module.exports = {
  CLI_TOOLS,
  validateCLITool,
  initializePathDetection,
  getCLIPath,
  setupCLIPaths,
  CLIPathDetector
};
