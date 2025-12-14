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

  /**
   * Set CLI tools configuration
   * @param {Object} cliTools - CLI tools configuration
   */
  setCLITools(cliTools) {
    this.cliTools = cliTools;
  }

  /**
   * Initialize the analyzer and ensure config directory exists
   */
  async initialize() {
    try {
      await fs.mkdir(this.configDir, { recursive: true });

      // Initialize persistent config if not exists
      const configExists = await this.fileExists(this.persistentConfig);
      if (!configExists) {
        await this.savePersistentConfig({
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          cliPatterns: {},
          failedAttempts: {},
        });
      }

      return true;
    } catch (error) {
      await errorHandler.logError(error, 'ERROR', 'CLIHelpAnalyzer.initialize');
      return false;
    }
  }

  /**
   * Analyze all configured CLI tools
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
        await errorHandler.logError(
          error,
          'WARN',
          `CLIHelpAnalyzer.analyzeAllCLI.${cliName}`,
        );
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
      // Record failed attempt
      await this.recordFailedAttempt(cliName, error);
      throw error;
    }
  }

  /**
   * Get help information using multiple methods
   */
  async getHelpInfo(cliName, cliConfig) {
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

    // Default to generic
    return 'generic';
  }

  /**
   * Extract command patterns from help text
   */
  extractPatterns(helpText, cliType, toolName = null) {
    const rules = this.patternRules[cliType] || this.patternRules.generic;
    const patterns = {
      commands: [],
      options: [],
      subcommands: [],
      arguments: [],
      flags: [],
      // New fields for better parameter handling
      nonInteractiveFlag: null,
      promptFlag: null,
      requiredFlags: [],
      commonPatterns: [],
    };

    // Extract subcommands
    const subcommandMatches = helpText.match(rules.subcommandPattern);
    if (subcommandMatches) {
      const commonArgumentNames = ['prompt', 'input', 'file', 'directory', 'path', 'target', 'command', 'args', 'options'];
      patterns.subcommands = subcommandMatches
        .map((match) => {
          const parts = match.trim().split(/\s+/);
          return {
            name: parts[0],
            description: parts.slice(1).join(' '),
            syntax: match.trim(),
          };
        })
        .filter(subcommand => {
          // Skip common argument names that are not actual commands
          if (commonArgumentNames.includes(subcommand.name.toLowerCase())) {
            return false;
          }
          // Skip if the subcommand name is the same as the current tool name
          if (toolName && subcommand.name.toLowerCase() === toolName.toLowerCase()) {
            return false;
          }
          return true;
        });
    }

    // Extract options/flags
    const optionMatches = helpText.match(rules.optionPattern);
    if (optionMatches) {
      patterns.options = [...new Set(optionMatches)];
      patterns.flags = optionMatches
        .filter((opt) => opt.startsWith('--'))
        .map((opt) => opt.replace(/^--/, ''));
    }

    // Extract main commands (first level)
    const lines = helpText.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();

      // Look for commands that start at beginning of line
      if (/^[a-z][a-z0-9_-]+\s+.+$/.test(trimmed)) {
        const parts = trimmed.split(/\s+/);
        const command = parts[0];
        const description = parts.slice(1).join(' ');

        // Filter out common argument names like 'prompt', 'input', etc.
        const commonArgumentNames = ['prompt', 'input', 'file', 'directory', 'path', 'target', 'command', 'args', 'options'];

        // Skip common argument names that are not actual commands
        if (commonArgumentNames.includes(command.toLowerCase())) {
          continue;
        }

        // Skip if the command name is the same as the current tool name
        if (toolName && command.toLowerCase() === toolName.toLowerCase()) {
          continue;
        }

        if (!patterns.commands.find((cmd) => cmd.name === command)) {
          patterns.commands.push({
            name: command,
            description,
            syntax: trimmed,
          });
        }
      }
    }

    // Enhanced pattern extraction for non-interactive mode and prompt handling
    this.extractEnhancedPatterns(helpText, patterns);

    return patterns;
  }

  /**
   * Extract enhanced patterns for better parameter handling
   */
  extractEnhancedPatterns(helpText, patterns) {
    const text = helpText.toLowerCase();

    // Look for non-interactive mode flags
    if (
      text.includes('print') ||
      text.includes('non-interactive') ||
      text.includes('output')
    ) {
      patterns.nonInteractiveFlag = '--print';
    }

    // Look for prompt-related flags
    if (text.includes('prompt') || text.includes('-p ')) {
      patterns.promptFlag = '-p';
    }

    // Look for required flags for non-interactive mode
    if (text.includes('non-interactive') && text.includes('prompt')) {
      patterns.requiredFlags.push('-p');
    }

    // Extract common usage patterns from examples
    const exampleLines = helpText.split('\n');
    for (const line of exampleLines) {
      if (
        line.includes('-p "') ||
        line.includes('--prompt') ||
        line.includes(' -p ')
      ) {
        patterns.commonPatterns.push(line.trim());
      }
    }
  }

  /**
   * Analyze command structure and calling patterns
   */
  analyzeCommandStructure(patterns) {
    const structure = {
      primaryCommand: '',
      commandFormat: '',
      argumentStyle: '',
      optionStyle: '',
      interactiveMode: false,
      hasSubcommands: patterns.subcommands.length > 0,
      complexity: 'simple',
      // Fields for better execution
      nonInteractiveSupport: !!patterns.nonInteractiveFlag,
      promptStyle: patterns.promptFlag ? 'flag' : 'argument',
      executionPattern: '',
      // Additional fields for CLI parameter handling
      nonInteractiveFlag: patterns.nonInteractiveFlag,
      promptFlag: patterns.promptFlag,
      requiredFlags: patterns.requiredFlags,
      commonPatterns: patterns.commonPatterns,
    };

    // Determine complexity based on available commands
    if (patterns.commands.length > 10 || patterns.subcommands.length > 5) {
      structure.complexity = 'complex';
    } else if (patterns.commands.length > 3 || patterns.options.length > 10) {
      structure.complexity = 'moderate';
    }

    // Determine command format based on patterns
    if (patterns.subcommands.length > 0) {
      structure.commandFormat = 'cli <subcommand> [options] [args]';
    } else if (patterns.options.length > 0) {
      structure.commandFormat = 'cli [options] [args]';
    } else {
      structure.commandFormat = 'cli [args]';
    }

    // Check for interactive mode indicators
    const hasInteractiveIndicators = patterns.commands.some(
      (cmd) =>
        cmd.name.includes('chat') ||
        cmd.name.includes('interactive') ||
        cmd.name.includes('shell') ||
        (cmd.description &&
          cmd.description.toLowerCase().includes('interactive')),
    );

    structure.interactiveMode = hasInteractiveIndicators;

    // Determine execution pattern
    if (patterns.nonInteractiveFlag && patterns.promptFlag) {
      structure.executionPattern = 'flag-based';
    } else if (patterns.nonInteractiveFlag) {
      structure.executionPattern = 'argument-based';
    } else {
      structure.executionPattern = 'interactive-default';
    }

    return structure;
  }

  /**
   * Extract usage examples from help text
   */
  extractUsageExamples(helpText, cliType) {
    const rules = this.patternRules[cliType] || this.patternRules.generic;
    const examples = [];

    // Find example sections
    const exampleMatches = helpText.match(rules.examplePattern);

    if (exampleMatches) {
      for (const match of exampleMatches) {
        const exampleText = match
          .replace(/^(example|usage|用法|使用)[:：]\s*/i, '')
          .trim();

        // Split by lines and extract command examples
        const lines = exampleText
          .split('\n')
          .map((line) => line.trim())
          .filter(
            (line) => line && !line.startsWith('#') && !line.startsWith('//'),
          );

        for (const line of lines) {
          if (
            line.includes('$') ||
            line.includes('>') ||
            line.startsWith('cli') ||
            /^[a-z][\w-]*\s/.test(line)
          ) {
            // Extract clean command
            const command = line
              .replace(/^[>$\s]+/, '')
              .replace(/^cli\s*/, '')
              .trim();
            if (command) {
              examples.push({
                command,
                raw: line,
                description: '',
              });
            }
          }
        }
      }
    }

    return examples;
  }

  /**
   * Determine CLI interaction mode
   */
  determineInteractionMode(helpInfo, patterns) {
    const text = helpInfo.rawHelp.toLowerCase();

    // Check for different interaction modes
    if (
      text.includes('chat') ||
      text.includes('conversation') ||
      text.includes('interactive')
    ) {
      return 'chat';
    }

    if (
      text.includes('api') ||
      text.includes('endpoint') ||
      text.includes('request')
    ) {
      return 'api';
    }

    if (patterns.subcommands.length > 0) {
      return 'subcommand';
    }

    if (patterns.options.length > 5) {
      return 'option';
    }

    return 'simple';
  }

  /**
   * Cache analysis results
   */
  async cacheAnalysis(cliName, analysis) {
    try {
      const config = await this.loadPersistentConfig();
      config.cliPatterns[cliName] = analysis;
      config.lastUpdated = new Date().toISOString();

      // Remove from failed attempts if it was there
      delete config.failedAttempts[cliName];

      await this.savePersistentConfig(config);

      // Also save last analysis timestamp
      await fs.writeFile(
        this.lastAnalysisFile,
        JSON.stringify({ [cliName]: analysis.timestamp }, null, 2),
      );
    } catch (error) {
      console.error(`Failed to cache analysis for ${cliName}:`, error.message);
    }
  }

  /**
   * Get cached analysis if available
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
   * Check if cache is expired (24 hours)
   */
  isCacheExpired(timestamp) {
    const cacheTime = new Date(timestamp);
    const now = new Date();
    const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
    return hoursDiff > 24;
  }

  /**
   * Record failed analysis attempt
   */
  async recordFailedAttempt(cliName, error) {
    try {
      const config = await this.loadPersistentConfig();
      config.failedAttempts[cliName] = {
        error: error.message,
        timestamp: new Date().toISOString(),
        attempts: (config.failedAttempts[cliName]?.attempts || 0) + 1,
      };
      config.lastUpdated = new Date().toISOString();
      await this.savePersistentConfig(config);
    } catch (err) {
      console.error('Failed to record failed attempt:', err.message);
    }
  }

  /**
   * Load persistent configuration
   */
  async loadPersistentConfig() {
    try {
      const data = await fs.readFile(this.persistentConfig, 'utf8');
      return JSON.parse(data);
    } catch (error) {
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
    await fs.writeFile(this.persistentConfig, JSON.stringify(config, null, 2));
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get CLI pattern for specific tool
   */
  async getCLIPattern(cliName) {
    const cached = await this.getCachedAnalysis(cliName);

    if (cached && !this.isCacheExpired(cached.timestamp)) {
      return cached;
    }

    // Re-analyze if cache expired or not available
    return await this.analyzeCLI(cliName);
  }

  /**
   * Update CLI pattern when call fails
   */
  async updatePatternOnFailure(cliName, error, attemptedCommand) {
    console.log(
      `Updating pattern for ${cliName} due to failure:`,
      error.message,
    );

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
      console.error(`Failed to re-analyze ${cliName}:`, analysisError.message);
      return null;
    }
  }
}

module.exports = CLIHelpAnalyzer;
