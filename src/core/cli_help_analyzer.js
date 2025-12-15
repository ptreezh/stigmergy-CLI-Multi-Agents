// Enhanced CLI Help Analyzer with better pattern extraction
const { spawnSync } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { CLI_TOOLS } = require('./cli_tools');
const { errorHandler } = require('./error_handler');

class CLIHelpAnalyzer {
  constructor() {
    this.configDir = path.join(os.homedir(), '.stigmergy', 'cli-patterns');
    this.persistentConfig = path.join(this.configDir, 'cli-patterns.json');
    this.lastAnalysisFile = path.join(this.configDir, 'last-analysis.json');
    this.cliTools = CLI_TOOLS;

    // Pattern recognition rules for different CLI types
    this.patternRules = {
      // OpenAI style CLI (codex, chatgpt)
      openai: {
        commandPattern: /^(\w+)(?:\s+--?[\w-]+(?:\s+[\w-]+)?)?\s*(.*)$/,
        optionPattern: /--?[\w-]+(?:\s+[\w-]+)?/g,
        examplePattern:
          /(?:example|usage|Usage)[:：]\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|\n$)/gi,
        subcommandPattern: /^\s{2,4}(\w+)\s+.+$/gm,
      },
      // Anthropic style CLI (claude)
      anthropic: {
        commandPattern: /^(\w+)(?:\s+(?:--?\w+|\[\w+\]))*\s*(.*)$/,
        optionPattern: /--?\w+(?:\s+<\w+>)?/g,
        examplePattern:
          /(?:Examples?|例子)[:：]\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|\n$)/gi,
        subcommandPattern: /^\s{2}(\w+)\s{2,}.+$/gm,
      },
      // Google style CLI (gemini)
      google: {
        commandPattern: /^(\w+)(?:\s+(?:--?\w+(?:=\w+)?|<\w+>))*\s*(.*)$/,
        optionPattern: /--?\w+(?:=\w+)?/g,
        examplePattern:
          /(?:Examples?|SAMPLE)[:：]\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|\n$)/gi,
        subcommandPattern: /^\s{2,4}(\w+)\s{2,}.+$/gm,
      },
      // Generic CLI pattern
      generic: {
        commandPattern: /^(\w+)(?:\s+.*)?$/,
        optionPattern: /--?[a-zA-Z][\w-]*/g,
        examplePattern:
          /(?:example|usage|用法|使用)[:：]\s*\n([\s\S]*?)(?=\n\n|\n[A-Z]|\n$)/gi,
        subcommandPattern: /^\s{2,6}([a-z][a-z0-9_-]+)\s+.+$/gm,
      },
    };
  }

  async initialize() {
    try {
      await fs.mkdir(this.configDir, { recursive: true });
      // Initialize persistent config if not exists
      const configExists = await this.fileExists(this.persistentConfig);
      if (!configExists) {
        const initialConfig = {
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          cliPatterns: {},
          failedAttempts: {},
        };
        // Suppress error if file creation fails initially
        try {
          await this.savePersistentConfig(initialConfig);
        } catch (createError) {
          // Only show error if it's not a permissions issue or similar expected issue
          if (
            !createError.message.includes('EACCES') &&
            !createError.message.includes('EPERM')
          ) {
            await errorHandler.logError(
              createError,
              'ERROR',
              'CLIHelpAnalyzer.initialize',
            );
          }
        }
      }
      return true;
    } catch (error) {
      // Don't spam error messages on initialization issues
      // These are often expected on first run
      if (process.env.DEBUG === 'true') {
        await errorHandler.logError(
          error,
          'ERROR',
          'CLIHelpAnalyzer.initialize',
        );
      }
      return false;
    }
  }

  /**
   * Analyze all configured CLI tools with optimized error handling
   */
  async analyzeAllCLI() {
    const results = {};
    for (const [cliName, _] of Object.entries(this.cliTools)) {
      try {
        if (process.env.DEBUG === 'true') {
          console.log(`Analyzing ${cliName}...`);
        }
        results[cliName] = await this.analyzeCLI(cliName);
      } catch (error) {
        // Only log important errors, suppress expected file not found errors
        if (
          !error.message.includes('ENOENT') &&
          !error.message.includes('no such file or directory') &&
          !error.message.includes(
            'not recognized as an internal or external command',
          )
        ) {
          await errorHandler.logError(
            error,
            'WARN',
            `CLIHelpAnalyzer.analyzeAllCLI.${cliName}`,
          );
        }
        results[cliName] = { success: false, error: error.message };
      }
    }
    return results;
  }

  /**
   * Analyze specific CLI tool
   */
  async analyzeCLI(cliName) {
    const cliConfig = this.cliTools[cliName];
    if (!cliConfig) {
      throw new Error(`CLI tool ${cliName} not found in configuration`);
    }
    try {
      // Get help information
      const helpInfo = await this.getHelpInfo(cliName, cliConfig);
      // Detect CLI type
      const cliType = this.detectCLIType(helpInfo.rawHelp, cliName);
      // Extract patterns
      const patterns = this.extractPatterns(helpInfo.rawHelp, cliType, cliName);
      // Analyze command structure
      const commandStructure = this.analyzeCommandStructure(patterns);
      // Extract usage examples
      const examples = this.extractUsageExamples(helpInfo.rawHelp, cliType);
      // Determine interaction mode
      const interactionMode = this.determineInteractionMode(helpInfo, patterns);
      const analysis = {
        success: true,
        cliName,
        cliType,
        version: helpInfo.version,
        helpMethod: helpInfo.method,
        patterns,
        commandStructure,
        examples,
        interactionMode,
        timestamp: new Date().toISOString(),
      };
      // Cache the analysis
      await this.cacheAnalysis(cliName, analysis);
      return analysis;
    } catch (error) {
      // Record failed attempt but suppress error if it's an expected issue
      await this.recordFailedAttempt(cliName, error);
      // Only throw if it's not an expected "tool not installed" error
      if (
        !error.message.includes(
          'not recognized as an internal or external command',
        ) &&
        !error.message.includes('command not found')
      ) {
        throw error;
      }
      // For tool not found errors, return minimal analysis instead of throwing
      return {
        success: false,
        cliName,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get help information using multiple methods
   */
  async getHelpInfo(cliName, cliConfig) {
    // Special handling for codex to avoid opening files or executing commands
    if (cliName === 'codex') {
      return await this.getCodexHelpInfo(cliConfig);
    }

    const helpMethods = [
      ['--help'],
      ['-h'],
      ['help'],
      ['--usage'],
      [''],
      ['version'],
      ['--version'],
      ['-v'],
    ];
    let rawHelp = '';
    let version = 'unknown';
    let method = 'unknown';
    // Try different help commands
    for (const helpArgs of helpMethods) {
      try {
        const result = spawnSync(cliName, helpArgs, {
          encoding: 'utf8',
          timeout: 15000,
          shell: true,
        });
        if (result.status === 0 && result.stdout) {
          rawHelp = result.stdout;
          method = `${cliName} ${helpArgs.join(' ')}`;
          break;
        } else if (result.stderr) {
          rawHelp = result.stderr;
          method = `${cliName} ${helpArgs.join(' ')} (stderr)`;
          break;
        }
      } catch (error) {
        // Try next method
        continue;
      }
    }
    // Try to get version separately
    if (cliConfig.version) {
      try {
        const versionCmd = cliConfig.version.split(' ');
        const versionResult = spawnSync(versionCmd[0], versionCmd.slice(1), {
          encoding: 'utf8',
          timeout: 10000,
          shell: true,
        });
        if (versionResult.status === 0) {
          version = versionResult.stdout.trim() || versionResult.stderr.trim();
        }
      } catch (error) {
        // Use default version
      }
    }
    if (!rawHelp) {
      throw new Error(`Unable to get help information for ${cliName}`);
    }
    return { rawHelp, version, method };
  }

  /**
   * Get Codex help information by checking file paths instead of executing commands
   */
  async getCodexHelpInfo(cliConfig) {
    try {
      // Check if codex is likely installed by checking common installation paths
      const os = require('os');
      const path = require('path');
      const fs = require('fs');

      // Common Codex installation paths
      const possiblePaths = [
        path.join(os.homedir(), '.codex'),
        path.join(os.homedir(), '.config', 'codex'),
        path.join(
          os.homedir(),
          'AppData',
          'Roaming',
          'npm',
          'node_modules',
          '@openai/codex',
        ),
        path.join('/usr/local/lib/node_modules/@openai/codex'),
        path.join('/usr/lib/node_modules/@openai/codex'),
      ];

      // Check if any of these paths exist
      let codexInstalled = false;
      let configPath = '';

      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          codexInstalled = true;
          configPath = possiblePath;
          break;
        }
      }

      // If Codex is not installed, throw an error without trying to execute commands
      if (!codexInstalled) {
        throw new Error('Codex CLI not found in standard installation paths');
      }

      // If Codex appears to be installed, return minimal help information
      // without actually executing any commands
      return {
        rawHelp:
          'Codex CLI - OpenAI Codex Command Line Interface\nUsage: codex [options] [prompt]\n\nOptions:\n  --help, -h     Show help\n  --version      Show version\n  --model        Specify model to use\n  --temperature  Set temperature for generation',
        version: 'unknown',
        method: 'path-detection',
      };
    } catch (error) {
      throw new Error(
        `Unable to get help information for codex: ${error.message}`,
      );
    }
  }

  /**
   * Detect CLI type based on help content and naming
   */
  detectCLIType(helpText, cliName) {
    const text = helpText.toLowerCase();
    const name = cliName.toLowerCase();
    // Detect based on CLI name
    if (name.includes('claude') || name.includes('anthropic')) {
      return 'anthropic';
    }
    if (name.includes('gemini') || name.includes('google')) {
      return 'google';
    }
    if (
      name.includes('codex') ||
      name.includes('openai') ||
      name.includes('chatgpt')
    ) {
      return 'openai';
    }
    // Detect based on help content patterns
    if (text.includes('anthropic') || text.includes('claude')) {
      return 'anthropic';
    }
    if (
      text.includes('google') ||
      text.includes('gemini') ||
      text.includes('vertex')
    ) {
      return 'google';
    }
    if (
      text.includes('openai') ||
      text.includes('gpt') ||
      text.includes('codex')
    ) {
      return 'openai';
    }
    if (
      text.includes('qwen') ||
      text.includes('alibaba') ||
      text.includes('tongyi')
    ) {
      return 'alibaba';
    }
    if (text.includes('iflow') || text.includes('intelligent')) {
      return 'iflow';
    }
    if (text.includes('copilot') || text.includes('github')) {
      return 'github';
    }
    if (text.includes('codebuddy') || text.includes('buddy')) {
      return 'codebuddy';
    }
    if (text.includes('qoder') || text.includes('code')) {
      return 'qoder';
    }
    // Default to generic
    return 'generic';
  }

  /**
   * Extract patterns from help text
   */
  extractPatterns(helpText, cliType, cliName) {
    const rules = this.patternRules[cliType] || this.patternRules.generic;
    const patterns = {
      commands: [],
      options: [],
      subcommands: [],
      arguments: [],
      flags: [],
      nonInteractiveFlag: null,
      promptFlag: null,
      requiredFlags: [],
      commonPatterns: [],
    };

    // Extract options/flags
    const optionMatches = helpText.match(rules.optionPattern) || [];
    patterns.options = [...new Set(optionMatches)];

    // Extract subcommands
    const subcommandMatches = helpText.match(rules.subcommandPattern) || [];
    patterns.subcommands = subcommandMatches.map((match) => {
      const subcommand = match.trim().split(/\s+/)[0];
      return { name: subcommand, description: match.trim() };
    });

    // Try to identify non-interactive flag
    const nonInteractiveFlags = patterns.options.filter(
      (option) =>
        option.includes('non-interactive') ||
        option.includes('batch') ||
        option.includes('no-input') ||
        option.includes('stdin'),
    );
    patterns.nonInteractiveFlag =
      nonInteractiveFlags.length > 0 ? nonInteractiveFlags[0] : null;

    // Try to identify prompt flag
    const promptFlags = patterns.options.filter(
      (option) =>
        option.includes('prompt') ||
        option.includes('input') ||
        option.includes('query') ||
        option.includes('question'),
    );
    patterns.promptFlag = promptFlags.length > 0 ? promptFlags[0] : null;

    // Identify required flags
    patterns.requiredFlags = patterns.options.filter(
      (option) =>
        option.includes('<') || // Angle brackets indicate required parameters
        option.includes('*'), // Asterisk indicates required
    );

    return patterns;
  }

  /**
   * Analyze command structure
   */
  analyzeCommandStructure(patterns) {
    const structure = {
      primaryCommand: '',
      commandFormat: 'cli [args]',
      argumentStyle: '',
      optionStyle: '',
      interactiveMode: false,
      hasSubcommands: patterns.subcommands.length > 0,
      complexity: 'simple',
      nonInteractiveSupport: !!patterns.nonInteractiveFlag,
      promptStyle: patterns.promptFlag ? 'flag' : 'argument',
      executionPattern: 'interactive-default',
      nonInteractiveFlag: patterns.nonInteractiveFlag,
      promptFlag: patterns.promptFlag,
      requiredFlags: patterns.requiredFlags,
      commonPatterns: patterns.commonPatterns,
    };

    // Determine complexity
    if (patterns.subcommands.length > 5) {
      structure.complexity = 'complex';
    } else if (patterns.subcommands.length > 0) {
      structure.complexity = 'moderate';
    }

    // Determine execution pattern
    if (patterns.nonInteractiveFlag) {
      structure.executionPattern = 'flag-based';
    } else if (patterns.promptFlag) {
      structure.executionPattern = 'prompt-flag';
    }

    return structure;
  }

  /**
   * Extract usage examples
   */
  extractUsageExamples(helpText, cliType) {
    const rules = this.patternRules[cliType] || this.patternRules.generic;
    const examples = [];
    let match;

    while ((match = rules.examplePattern.exec(helpText)) !== null) {
      examples.push(match[1].trim());
    }

    return examples;
  }

  /**
   * Determine interaction mode
   */
  determineInteractionMode(helpInfo, patterns) {
    const helpText = helpInfo.rawHelp.toLowerCase();

    // Check for explicit non-interactive support
    if (patterns.nonInteractiveFlag) {
      return 'non-interactive';
    }

    // Check for stdin support
    if (helpText.includes('stdin') || helpText.includes('pipe')) {
      return 'stdin-support';
    }

    // Check for batch mode
    if (helpText.includes('batch') || helpText.includes('script')) {
      return 'batch-mode';
    }

    // Default to interactive
    return 'interactive';
  }

  /**
   * Cache analysis results
   */
  async cacheAnalysis(cliName, analysis) {
    try {
      const config = await this.loadPersistentConfig();
      config.cliPatterns[cliName] = analysis;
      config.lastUpdated = new Date().toISOString();
      await this.savePersistentConfig(config);
    } catch (error) {
      // Don't spam errors for cache issues
      if (process.env.DEBUG === 'true') {
        await errorHandler.logError(
          error,
          'WARN',
          'CLIHelpAnalyzer.cacheAnalysis',
        );
      }
    }
  }

  /**
   * Get cached analysis
   */
  async getCachedAnalysis(cliName) {
    try {
      const config = await this.loadPersistentConfig();
      return config.cliPatterns[cliName] || null;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Get CLI pattern (wrapper for getCachedAnalysis)
   */
  async getCLIPattern(cliName) {
    return await this.getCachedAnalysis(cliName);
  }

  /**
   * Check if cache is expired (1 day)
   */
  isCacheExpired(timestamp) {
    if (!timestamp) return true;
    const cacheTime = new Date(timestamp);
    const now = new Date();
    const diffHours = (now - cacheTime) / (1000 * 60 * 60);
    return diffHours > 24; // Expire after 24 hours
  }

  /**
   * Load persistent configuration
   */
  async loadPersistentConfig() {
    try {
      const configExists = await this.fileExists(this.persistentConfig);
      if (!configExists) {
        return {
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          cliPatterns: {},
          failedAttempts: {},
        };
      }
      const configData = await fs.readFile(this.persistentConfig, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      // Return default config if loading fails
      return {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        cliPatterns: {},
        failedAttempts: {},
      };
    }
  }

  /**
   * Save persistent configuration
   */
  async savePersistentConfig(config) {
    try {
      await fs.writeFile(
        this.persistentConfig,
        JSON.stringify(config, null, 2),
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Record failed attempt
   */
  async recordFailedAttempt(cliName, error) {
    try {
      const config = await this.loadPersistentConfig();
      config.failedAttempts[cliName] = {
        error: error.message,
        timestamp: new Date().toISOString(),
        attempts: (config.failedAttempts[cliName]?.attempts || 0) + 1,
      };
      await this.savePersistentConfig(config);
    } catch (saveError) {
      // Don't spam errors for failed attempt recording
      if (process.env.DEBUG === 'true') {
        await errorHandler.logError(
          saveError,
          'WARN',
          'CLIHelpAnalyzer.recordFailedAttempt',
        );
      }
    }
  }

  /**
   * Update CLI pattern when call fails
   */
  async updatePatternOnFailure(cliName, error, attemptedCommand) {
    // Only log in debug mode to reduce console noise
    if (process.env.DEBUG === 'true') {
      console.log(
        `Updating pattern for ${cliName} due to failure:`,
        error.message,
      );
    }
    try {
      // Re-analyze the CLI
      const newAnalysis = await this.analyzeCLI(cliName);
      // Add failure context
      newAnalysis.lastFailure = {
        error: error.message,
        attemptedCommand,
        timestamp: new Date().toISOString(),
      };
      // Update the cached analysis
      await this.cacheAnalysis(cliName, newAnalysis);
      return newAnalysis;
    } catch (analysisError) {
      // Only log analysis errors in debug mode
      if (process.env.DEBUG === 'true') {
        console.error(
          `Failed to re-analyze ${cliName}:`,
          analysisError.message,
        );
      }
      return null;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Set CLI tools
   */
  setCLITools(tools) {
    this.cliTools = tools;
  }
}

module.exports = CLIHelpAnalyzer;
