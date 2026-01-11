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

    // Enhanced CLI Agent and Skill Patterns Configuration
    this.enhancedPatterns = {
      'claude': {
        commandFormat: 'claude -p "{prompt}"',
        agentDetection: true,
        skillDetection: true,
        naturalLanguageSupport: true,
        agentTypes: ['expert', 'skill', 'analysis', 'agent'],
        skillKeywords: ['技能', '智能体', '分析', '工具', '方法'],
        examples: [
          'claude -p "请使用异化分析技能分析程序员异化现象"',
          'claude -p "请使用数字马克思智能体进行阶级分析"'
        ]
      },
      'iflow': {
        commandFormat: 'iflow -p "{prompt}"',
        agentDetection: true,
        skillDetection: true,
        naturalLanguageSupport: true,
        agentTypes: ['expert', 'skill', 'analysis', 'agent'],
        skillKeywords: ['技能', '智能体', '分析', '工具', '方法'],
        examples: [
          'iflow -p "请使用异化分析技能分析程序员异化现象"',
          'iflow -p "请使用数字马克思智能体进行异化分析"'
        ]
      },
      'qwen': {
        commandFormat: 'qwen "{prompt}"',
        agentDetection: true,
        skillDetection: true,
        naturalLanguageSupport: true,
        positionalArgs: true,
        agentTypes: ['expert', 'skill', 'analysis', 'agent'],
        skillKeywords: ['智能体', '分析技能', '马克思', '异化', '阶级'],
        examples: [
          'qwen "使用数字马克思智能体进行异化分析，分析程序员的技术异化现象"',
          'qwen "使用异化分析技能分析程序员在AI开发中的异化现象"'
        ]
      },
      'codebuddy': {
        commandFormat: 'codebuddy -y -p "{prompt}"',
        agentDetection: false,
        skillDetection: true,
        skillPrefixRequired: true,
        agentTypes: ['skill'],
        skillKeywords: ['skill:', '技能', '分析'],
        examples: [
          'codebuddy -y -p "skill:alienation-analysis 分析程序员异化现象"',
          'codebuddy -y -p "skill:marxist-analysis 分析技术异化"'
        ]
      },
      'qodercli': {
        commandFormat: 'qodercli -p "{prompt}"',
        agentDetection: false,
        skillDetection: false,
        basicAISupport: true,
        agentTypes: ['basic'],
        skillKeywords: ['分析', '理解'],
        examples: [
          'qodercli -p "分析程序员在AI开发中的异化现象"',
          'qodercli -p "进行技术异化的基础分析"'
        ]
      },
      'gemini': {
        commandFormat: 'gemini -p "{prompt}"',
        agentDetection: true,
        skillDetection: true,
        naturalLanguageSupport: true,
        agentTypes: ['expert', 'skill', 'analysis', 'agent'],
        skillKeywords: ['技能', '智能体', '分析', '工具', '方法'],
        examples: [
          'gemini -p "请使用分析技能分析程序员异化现象"',
          'gemini -p "使用智能体进行技术分析"'
        ]
      },
      'copilot': {
        commandFormat: 'copilot "{prompt}"',
        agentDetection: true,
        skillDetection: true,
        naturalLanguageSupport: true,
        positionalArgs: true,
        agentTypes: ['expert', 'skill', 'analysis', 'agent'],
        skillKeywords: ['技能', '智能体', '分析', '工具', '方法'],
        examples: [
          'copilot "请使用分析技能分析程序员异化现象"',
          'copilot "使用智能体进行技术分析"'
        ]
      },
      'codex': {
        commandFormat: 'codex -m gpt-5 "{prompt}"',
        agentDetection: true,
        skillDetection: true,
        naturalLanguageSupport: true,
        positionalArgs: true,
        agentTypes: ['expert', 'skill', 'analysis', 'agent'],
        skillKeywords: ['技能', '智能体', '分析', '工具', '方法', '代码', '审查'],
        examples: [
          'codex "请使用异化分析技能分析程序员异化现象"',
          'codex exec "使用数字马克思智能体分析代码库"',
          'codex review "分析这段代码的异化现象"'
        ]
      },
      'kode': {
        commandFormat: 'kode -p "{prompt}"',
        agentDetection: true,
        skillDetection: true,
        naturalLanguageSupport: true,
        positionalArgs: true,
        agentTypes: ['expert', 'skill', 'analysis', 'agent'],
        skillKeywords: ['技能', '智能体', '分析', '工具', '方法', '多模型', '协作'],
        examples: [
          'kode -p "请使用异化分析技能分析程序员异化现象"',
          'kode -p "使用数字马克思智能体进行异化分析"',
          'kode -p "@ask-claude-sonnet-4 分析这个问题"'
        ]
      }
    };

    // Agent and Skill Recognition Patterns
    this.agentSkillPatterns = {
      // Agent type detection patterns
      agentTypes: {
        'expert': ['专家', 'expert', 'specialist', '马克思', 'marxist', '数字马克思'],
        'skill': ['技能', 'skill', '能力', '方法', '工具'],
        'analysis': ['分析', 'analysis', '解析', '评估'],
        'agent': ['智能体', 'agent', '助手', '助手'],
        'basic': ['基础', 'basic', '简单', '初步']
      },
      
      // Skill name patterns for different CLIs
      skillMapping: {
        '异化分析': {
          'claude': '异化分析技能',
          'iflow': '异化分析技能',
          'qwen': '异化分析技能',
          'codebuddy': 'alienation-analysis',
          'gemini': '异化分析技能',
          'copilot': '异化分析技能',
          'codex': 'alienation-analysis',
          'kode': '异化分析技能'
        },
        '马克思分析': {
          'claude': '数字马克思智能体',
          'iflow': '数字马克思智能体',
          'qwen': '数字马克思智能体',
          'codebuddy': 'marxist-analysis',
          'gemini': '马克思分析技能',
          'copilot': '马克思分析智能体',
          'codex': 'marxist-analysis',
          'kode': '数字马克思智能体'
        },
        '技术分析': {
          'claude': '技术分析技能',
          'iflow': '技术分析技能',
          'qwen': '技术分析技能',
          'codebuddy': 'tech-analysis',
          'gemini': '技术分析技能',
          'copilot': '技术分析技能',
          'codex': 'tech-analysis',
          'kode': '技术分析技能'
        },
        '阶级分析': {
          'claude': '阶级分析技能',
          'iflow': '阶级分析技能',
          'qwen': '阶级分析技能',
          'codebuddy': 'class-analysis',
          'gemini': '阶级分析技能',
          'copilot': '阶级分析技能',
          'codex': 'class-analysis',
          'kode': '阶级分析技能'
        }
      }
    };

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
    const cliNames = Object.keys(this.cliTools);
    
    // 优化：并行分析所有 CLI，添加超时保护
    const analysisPromises = cliNames.map(async (cliName) => {
      try {
        if (process.env.DEBUG === 'true') {
          console.log(`Analyzing ${cliName}...`);
        }
        // 添加超时保护，单个 CLI 分析最多 60 秒（因为需要尝试多个 help 方法）
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Analysis timeout')), 60000)
        );
        const result = await Promise.race([this.analyzeCLI(cliName), timeoutPromise]);
        return { cliName, result };
      } catch (error) {
        // Only log important errors, suppress expected file not found errors
        if (
          !error.message.includes('ENOENT') &&
          !error.message.includes('no such file or directory') &&
          !error.message.includes(
            'not recognized as an internal or external command',
          ) &&
          !error.message.includes('Analysis timeout')
        ) {
          await errorHandler.logError(
            error,
            'WARN',
            `CLIHelpAnalyzer.analyzeAllCLI.${cliName}`,
          );
        }
        return { cliName, result: { success: false, error: error.message } };
      }
    });

    // 等待所有分析完成，添加整体超时保护
    const overallTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Overall analysis timeout')), 120000)
    );
    const analysisResults = await Promise.race([Promise.all(analysisPromises), overallTimeoutPromise]);
    
    // 整理结果
    for (const { cliName, result } of analysisResults) {
      results[cliName] = result;
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
      // 优化：检查缓存版本，只在版本变化时重新分析
      const cachedAnalysis = await this.getCachedAnalysis(cliName);
      if (cachedAnalysis && cachedAnalysis.success) {
        // 获取当前版本
        const currentVersion = await this.getCurrentVersion(cliName, cliConfig);
        // 如果版本未变化，使用缓存
        if (currentVersion === cachedAnalysis.version && !this.isCacheExpired(cachedAnalysis.timestamp)) {
          if (process.env.DEBUG === 'true') {
            console.log(`[DEBUG] ${cliName}: 使用缓存的分析结果 (版本: ${cachedAnalysis.version})`);
          }
          return cachedAnalysis;
        } else {
          if (process.env.DEBUG === 'true') {
            console.log(`[DEBUG] ${cliName}: 版本变化 (${cachedAnalysis.version} -> ${currentVersion}) 或缓存过期，重新分析`);
          }
        }
      }
      
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
      ['--help'],  // 最常用
      ['-h'],      // 常用
    ];
    let rawHelp = '';
    let version = 'unknown';
    let method = 'unknown';
    // Try different help commands
    for (const helpArgs of helpMethods) {
      try {
        const result = spawnSync(cliName, helpArgs, {
          encoding: 'utf8',
          timeout: 5000,
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
                timeout: 3000, // 优化：减少超时时间从 10 秒到 3 秒
                shell: true,
              });        if (versionResult.status === 0) {
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
        option.includes('stdin') ||
        option.includes('print') ||  // For CLI tools like kode with --print flag
        option.includes('pipe') ||    // Pipes mentioned in description
        option.includes('exit'),      // Exit after execution
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
    const cached = await this.getCachedAnalysis(cliName);
    
    // 优化：添加版本变化检测
    if (cached && cached.success && cached.timestamp && !this.isCacheExpired(cached.timestamp)) {
      // 检查版本是否变化
      const cliConfig = this.cliTools[cliName];
      if (cliConfig) {
        const currentVersion = await this.getCurrentVersion(cliName, cliConfig);
        // 如果版本未变化，使用缓存
        if (currentVersion === cached.version) {
          return cached;
        }
      }
    }
    
    // 版本变化或缓存过期，重新分析
    return await this.analyzeCLI(cliName);
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
   * Get current CLI version
   */
  async getCurrentVersion(cliName, cliConfig) {
    try {
      const versionCmd = cliConfig.version || `${cliName} --version`;
      const result = spawnSync(versionCmd.split(' ')[0], versionCmd.split(' ').slice(1), {
        encoding: 'utf8',
        shell: true,
        timeout: 3000,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      if (result.status === 0) {
        return (result.stdout.trim() || result.stderr.trim()).split('\n')[0];
      }
      return 'unknown';
    } catch (error) {
      return 'unknown';
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

  /**
   * Enhanced analysis with agent and skill detection
   */
  async analyzeCLIEnhanced(cliName) {
    const basicAnalysis = await this.analyzeCLI(cliName);
    
    if (!basicAnalysis.success) {
      return basicAnalysis;
    }

    // Add enhanced agent and skill information
    const enhancedPatterns = this.enhancedPatterns[cliName] || {};
    
    basicAnalysis.agentSkillSupport = {
      supportsAgents: enhancedPatterns.agentDetection || false,
      supportsSkills: enhancedPatterns.skillDetection || false,
      naturalLanguageSupport: enhancedPatterns.naturalLanguageSupport || false,
      skillPrefixRequired: enhancedPatterns.skillPrefixRequired || false,
      positionalArgs: enhancedPatterns.positionalArgs || false,
      agentTypes: enhancedPatterns.agentTypes || [],
      skillKeywords: enhancedPatterns.skillKeywords || [],
      commandFormat: enhancedPatterns.commandFormat || '',
      examples: enhancedPatterns.examples || []
    };

    return basicAnalysis;
  }

  /**
   * Detect agent and skill mentions in user input
   */
  detectAgentSkillMentions(input, cliName) {
    const enhancedPattern = this.enhancedPatterns[cliName];
    if (!enhancedPattern) {
      return { hasAgent: false, hasSkill: false, confidence: 0 };
    }

    const inputLower = input.toLowerCase();
    let hasAgent = false;
    let hasSkill = false;
    let confidence = 0;

    // Check for agent keywords
    if (enhancedPattern.agentDetection) {
      const agentKeywords = [
        ...this.agentSkillPatterns.agentTypes['expert'],
        ...this.agentSkillPatterns.agentTypes['agent'],
        ...enhancedPattern.skillKeywords
      ];

      for (const keyword of agentKeywords) {
        if (inputLower.includes(keyword.toLowerCase())) {
          hasAgent = true;
          confidence += 0.3;
          break;
        }
      }
    }

    // Check for skill keywords
    if (enhancedPattern.skillDetection) {
      const skillKeywords = enhancedPattern.skillKeywords;
      
      for (const keyword of skillKeywords) {
        if (inputLower.includes(keyword.toLowerCase())) {
          hasSkill = true;
          confidence += 0.4;
          break;
        }
      }

      // Special check for skill: prefix (codebuddy)
      if (enhancedPattern.skillPrefixRequired && inputLower.includes('skill:')) {
        hasSkill = true;
        confidence += 0.6;
      }
    }

    // Boost confidence based on CLI-specific patterns
    if (cliName === 'qwen' && enhancedPattern.positionalArgs) {
      // Qwen CLI has higher confidence for natural language
      confidence *= 1.2;
    }

    return { hasAgent, hasSkill, confidence: Math.min(confidence, 1.0) };
  }

  /**
   * Optimize prompt for specific CLI tool
   */
  optimizePromptForCLI(prompt, cliName, detectedMentions) {
    const enhancedPattern = this.enhancedPatterns[cliName];
    if (!enhancedPattern) {
      return prompt;
    }

    let optimizedPrompt = prompt;

    // Apply skill mapping if applicable
    for (const [chineseSkill, mapping] of Object.entries(this.agentSkillPatterns.skillMapping)) {
      if (prompt.includes(chineseSkill) && mapping[cliName]) {
        if (enhancedPattern.skillPrefixRequired && !prompt.includes('skill:')) {
          // For codebuddy, add skill: prefix
          optimizedPrompt = prompt.replace(
            chineseSkill, 
            `skill:${mapping[cliName]}`
          );
        } else if (enhancedPattern.naturalLanguageSupport) {
          // For CLIs that support natural language, use the mapped term
          optimizedPrompt = prompt.replace(
            chineseSkill, 
            mapping[cliName]
          );
        }
        break;
      }
    }

    return optimizedPrompt;
  }

  /**
   * Get enhanced CLI pattern with agent/skill support
   */
  async getEnhancedCLIPattern(cliName) {
    const cached = await this.getCachedAnalysis(cliName);
    
    // 优化：添加版本变化检测
    if (cached && cached.success && cached.timestamp && !this.isCacheExpired(cached.timestamp)) {
      // 检查版本是否变化
      const cliConfig = this.cliTools[cliName];
      if (cliConfig) {
        const currentVersion = await this.getCurrentVersion(cliName, cliConfig);
        // 如果版本未变化，使用缓存
        if (currentVersion === cached.version) {
          // Enhance cached data with agent/skill information
          const enhancedPatterns = this.enhancedPatterns[cliName];
          if (enhancedPatterns) {
            cached.agentSkillSupport = {
              supportsAgents: enhancedPatterns.agentDetection || false,
              supportsSkills: enhancedPatterns.skillDetection || false,
              naturalLanguageSupport: enhancedPatterns.naturalLanguageSupport || false,
              skillPrefixRequired: enhancedPatterns.skillPrefixRequired || false,
              positionalArgs: enhancedPatterns.positionalArgs || false,
              agentTypes: enhancedPatterns.agentTypes || [],
              skillKeywords: enhancedPatterns.skillKeywords || [],
              commandFormat: enhancedPatterns.commandFormat || '',
              examples: enhancedPatterns.examples || []
            };
          }
          return cached;
        }
      }
    }

    // Perform enhanced analysis
    return await this.analyzeCLIEnhanced(cliName);
  }

  /**
   * Analyze call success and update patterns accordingly
   */
  async updatePatternOnAgentSkillFailure(cliName, error, attemptedCommand, userPrompt) {
    if (process.env.DEBUG === 'true') {
      console.log(`Updating agent/skill pattern for ${cliName} due to failure:`, error.message);
    }

    try {
      // Re-analyze with enhanced capabilities
      const newAnalysis = await this.analyzeCLIEnhanced(cliName);
      
      // Add failure context with agent/skill information
      const detectedMentions = this.detectAgentSkillMentions(userPrompt, cliName);
      newAnalysis.lastFailure = {
        error: error.message,
        attemptedCommand,
        userPrompt,
        agentSkillDetected: detectedMentions,
        timestamp: new Date().toISOString(),
      };

      // Update the cached analysis
      await this.cacheAnalysis(cliName, newAnalysis);
      return newAnalysis;
    } catch (analysisError) {
      if (process.env.DEBUG === 'true') {
        console.error(`Failed to re-analyze ${cliName}:`, analysisError.message);
      }
      return null;
    }
  }

  /**
   * Get agent/skill compatibility score for CLI tool
   */
  getAgentSkillCompatibilityScore(cliName, prompt) {
    const enhancedPattern = this.enhancedPatterns[cliName];
    if (!enhancedPattern) {
      return { score: 0, reasons: ['CLI not supported'] };
    }

    const detectedMentions = this.detectAgentSkillMentions(prompt, cliName);
    let score = 0.5; // Base score
    const reasons = [];

    // Base compatibility
    if (enhancedPattern.agentDetection) {
      score += 0.2;
      reasons.push('支持智能体检测');
    }
    
    if (enhancedPattern.skillDetection) {
      score += 0.2;
      reasons.push('支持技能检测');
    }

    // Detection results
    if (detectedMentions.hasAgent) {
      score += 0.1;
      reasons.push('检测到智能体提及');
    }

    if (detectedMentions.hasSkill) {
      score += 0.1;
      reasons.push('检测到技能提及');
    }

    // CLI-specific advantages
    if (cliName === 'qwen' && enhancedPattern.positionalArgs) {
      score += 0.1;
      reasons.push('位置参数支持，自然语言理解优秀');
    }

    if (cliName === 'codebuddy' && enhancedPattern.skillPrefixRequired) {
      score += 0.1;
      reasons.push('明确的技能语法支持');
    }

    // Penalty for mismatches
    if (enhancedPattern.skillPrefixRequired && !detectedMentions.hasSkill) {
      score -= 0.2;
      reasons.push('需要技能语法但未检测到技能');
    }

    return { 
      score: Math.max(0, Math.min(1, score)), 
      reasons,
      detected: detectedMentions
    };
  }

  /**
   * Generate optimized call command for CLI tool
   */
  generateOptimizedCall(cliName, userPrompt) {
    const enhancedPattern = this.enhancedPatterns[cliName];
    if (!enhancedPattern) {
      return null;
    }

    // Optimize the prompt
    const detectedMentions = this.detectAgentSkillMentions(userPrompt, cliName);
    const optimizedPrompt = this.optimizePromptForCLI(userPrompt, cliName, detectedMentions);

    // Generate command based on CLI format
    let command;
    let args;

    switch (cliName) {
      case 'qwen':
        // Qwen uses positional arguments
        command = 'qwen';
        args = [optimizedPrompt];
        break;
        
      case 'codebuddy':
        // Codebuddy requires -y flag and skill prefix
        command = 'codebuddy';
        args = ['-y', '-p', optimizedPrompt];
        break;
        
      case 'claude':
      case 'iflow':
      case 'qodercli':
        // These use -p flag
        command = cliName;
        args = ['-p', optimizedPrompt];
        break;
        
      default:
        command = cliName;
        args = ['-p', optimizedPrompt];
    }

    return {
      command,
      args,
      fullCommand: `${command} ${args.join(' ')}`,
      optimizedPrompt,
      detectedMentions,
      compatibilityScore: this.getAgentSkillCompatibilityScore(cliName, userPrompt)
    };
  }
}

module.exports = CLIHelpAnalyzer;
