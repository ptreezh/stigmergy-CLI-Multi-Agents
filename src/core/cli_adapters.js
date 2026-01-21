/**
 * CLI Tools Adapters
 * Provides tool-specific parameter mapping for interactive and one-time modes
 *
 * Each CLI tool has different parameter conventions:
 * - claude: Uses -p for one-time, default is interactive
 * - qwen: Uses -p for one-time, -i for prompt-interactive
 * - codex: Uses 'exec' subcommand for one-time, default is interactive
 *
 * This adapter normalizes these differences.
 */

/**
 * CLI Adapters Configuration
 * Maps each tool's parameters for different execution modes
 */
const CLI_ADAPTERS = {
  /**
   * Claude CLI Adapter
   *
   * Documentation:
   * - Default: Interactive mode
   * - -p, --print: Non-interactive (print and exit)
   *
   * Examples:
   * - Interactive: claude "prompt" or just claude
   * - One-time: claude -p "prompt"
   */
  claude: {
    // Execute prompt and keep CLI running for continuous conversation
    interactive: (prompt) => {
      // Claude defaults to interactive mode
      // If prompt provided, pass it as positional argument
      return prompt ? [prompt] : [];
    },

    // Execute prompt and exit (return control to caller)
    oneTime: (prompt) => {
      // Use -p flag for non-interactive output
      return ['-p', prompt];
    },

    // 🔥 自动模式参数（用于并发和路由模式）
    autoMode: () => ['--permission-mode', 'bypassPermissions', '--print'],

    // Check if tool supports this mode
    supportsInteractive: true,
    supportsOneTime: true,
    defaultMode: 'interactive'
  },

  /**
   * Gemini CLI Adapter
   *
   * Note: Full behavior to be verified (may vary by version)
   */
  gemini: {
    interactive: (prompt) => {
      // Assuming similar to claude (to be verified)
      return prompt ? [prompt] : [];
    },

    oneTime: (prompt) => {
      // Assuming -p for print mode (to be verified)
      return ['-p', prompt];
    },

    // 🔥 自动模式参数（用于并发和路由模式）
    autoMode: () => ['--approval-mode', 'auto-edit'],

    supportsInteractive: true,
    supportsOneTime: true,
    defaultMode: 'interactive',
    verified: false  // Needs testing
  },

  /**
   * Qwen CLI Adapter
   *
   * Documentation:
   * - Default: Interactive CLI
   * - -p, --prompt: One-shot (deprecated)
   * - -i, --prompt-interactive: Execute prompt then stay interactive
   *
   * Examples:
   * - Interactive: qwen -i "prompt" or just qwen
   * - One-time: qwen -p "prompt" (deprecated) or qwen "prompt" (positional, one-shot)
   */
  qwen: {
    interactive: (prompt) => {
      // Use -i flag for "prompt-interactive" mode
      // This executes the prompt and then keeps the CLI running
      return prompt ? ['-i', prompt] : [];
    },

    oneTime: (prompt) => {
      // Use -p for one-shot mode (though deprecated, still works)
      // Or could use positional prompt (which defaults to one-shot)
      return ['-p', prompt];
    },

    // 🔥 自动模式参数（用于并发和路由模式）
    autoMode: () => ['--approval-mode', 'yolo'],

    supportsInteractive: true,
    supportsOneTime: true,
    defaultMode: 'interactive',
    verified: true
  },

  /**
   * Codebuddy CLI Adapter
   *
   * Note: Behavior to be verified
   */
  codebuddy: {
    interactive: (prompt) => {
      return prompt ? [prompt] : [];
    },

    oneTime: (prompt) => {
      // Assuming -p for print mode (to be verified)
      return ['-p', prompt];
    },

    // 🔥 自动模式参数（用于并发和路由模式）
    autoMode: () => ['--yolo'],

    supportsInteractive: true,
    supportsOneTime: true,
    defaultMode: 'interactive',
    verified: false
  },

  /**
   * Codex CLI Adapter
   *
   * Documentation:
   * - Default: Interactive CLI
   * - 'exec' subcommand: Non-interactive execution
   *
   * Examples:
   * - Interactive: codex "prompt" or just codex
   * - One-time: codex exec "prompt"
   */
  codex: {
    interactive: (prompt) => {
      // Codex defaults to interactive mode
      // If prompt provided, pass it as positional argument
      return prompt ? [prompt] : [];
    },

    oneTime: (prompt) => {
      // Use 'exec' subcommand for non-interactive execution
      return ['exec', prompt];
    },

    // 🔥 自动模式参数（用于并发和路由模式）
    autoMode: () => ['--yolo'],

    supportsInteractive: true,
    supportsOneTime: true,
    defaultMode: 'interactive',
    verified: true
  },

  /**
   * iFlow CLI Adapter
   *
   * Note: Behavior to be verified
   */
  iflow: {
    interactive: (prompt) => {
      return prompt ? [prompt] : [];
    },

    oneTime: (prompt) => {
      return ['-p', prompt];
    },

    // 🔥 自动模式参数（用于并发和路由模式）
    autoMode: () => ['--yolo'],

    supportsInteractive: true,
    supportsOneTime: true,
    defaultMode: 'interactive',
    verified: false
  },

  /**
   * QoderCLI Adapter
   *
   * Note: Behavior to be verified
   */
  qodercli: {
    interactive: (prompt) => {
      return prompt ? [prompt] : [];
    },

    oneTime: (prompt) => {
      return ['-p', prompt];
    },

    supportsInteractive: true,
    supportsOneTime: true,
    defaultMode: 'interactive',
    verified: false
  },

  /**
   * Copilot CLI Adapter
   *
   * Note: Behavior to be verified
   */
  copilot: {
    interactive: (prompt) => {
      return prompt ? [prompt] : [];
    },

    oneTime: (prompt) => {
      return ['-p', prompt];
    },

    // 🔥 自动模式参数（用于并发和路由模式）
    autoMode: () => ['--yolo'],

    supportsInteractive: true,
    supportsOneTime: true,
    defaultMode: 'interactive',
    verified: false
  },

  /**
   * OpenCode CLI Adapter
   *
   * Documentation:
   * - Default: Interactive TUI mode
   * - run: Non-interactive execution mode (YOLO mode)
   *
   * Examples:
   * - Interactive: opencode
   * - One-time: opencode run "prompt"
   */
  opencode: {
    interactive: (prompt) => {
      return [];
    },

    oneTime: (prompt) => {
      return ['run', prompt];
    },

    // 🔥 自动模式参数（用于并发和路由模式）
    // OpenCode 的 run 命令本身就是非交互模式，相当于 YOLO 模式
    autoMode: () => ['run'],

    supportsInteractive: true,
    supportsOneTime: true,
    defaultMode: 'interactive',
    verified: false
  },

  /**
   * Kode CLI Adapter
   *
   * Note: Behavior to be verified
   */
  kode: {
    interactive: (prompt) => {
      return prompt ? [prompt] : [];
    },

    oneTime: (prompt) => {
      return ['-p', prompt];
    },

    supportsInteractive: true,
    supportsOneTime: true,
    defaultMode: 'interactive',
    verified: false
  }
};

/**
 * CLI Adapter Class
 * Provides methods to get appropriate arguments for each tool and mode
 */
class CLIAdapterManager {
  constructor() {
    this.adapters = CLI_ADAPTERS;
  }

  /**
   * Get arguments for a specific tool and execution mode
   * @param {string} toolName - Name of the CLI tool
   * @param {string} mode - 'interactive' or 'one-time'
   * @param {string} prompt - User prompt to pass
   * @param {boolean} forceAutoMode - Force auto mode (for concurrent/routing)
   * @returns {Array<string>} Array of arguments to pass to the CLI tool
   */
  getArguments(toolName, mode, prompt, forceAutoMode = false) {
    const adapter = this.adapters[toolName];

    if (!adapter) {
      throw new Error(`Unknown CLI tool: ${toolName}`);
    }

    // Normalize mode name: 'one-time' -> 'oneTime', 'interactive' -> 'interactive'
    const normalizedMode = mode === 'one-time' ? 'oneTime' : mode;

    const modeFunction = adapter[normalizedMode];

    if (typeof modeFunction !== 'function') {
      throw new Error(`Tool ${toolName} does not support ${mode} mode`);
    }

    let args = modeFunction(prompt);

    // 🔥 如果强制自动模式（并发和路由模式），添加自动模式参数
    if (forceAutoMode && adapter.autoMode) {
      const autoModeArgs = adapter.autoMode();
      args = [...autoModeArgs, ...args];
    }

    return args;
  }

  /**
   * Get auto mode arguments for a tool (for concurrent and routing modes)
   * @param {string} toolName - Name of the CLI tool
   * @returns {Array<string>} Array of auto mode arguments
   */
  getAutoModeArguments(toolName) {
    const adapter = this.adapters[toolName];
    if (!adapter || !adapter.autoMode) {
      return [];
    }
    return adapter.autoMode();
  }

  /**
   * Check if a tool supports a specific mode
   * @param {string} toolName - Name of the CLI tool
   * @param {string} mode - 'interactive' or 'one-time'
   * @returns {boolean} True if supported
   */
  supportsMode(toolName, mode) {
    const adapter = this.adapters[toolName];
    return adapter && adapter.supports && adapter.supports.includes(mode);
  }

  /**
   * Get the default mode for a tool
   * @param {string} toolName - Name of the CLI tool
   * @returns {string} 'interactive' or 'one-time'
   */
  getDefaultMode(toolName) {
    const adapter = this.adapters[toolName];
    return adapter ? adapter.defaultMode : 'one-time';
  }

  /**
   * Check if tool configuration has been verified
   * @param {string} toolName - Name of the CLI tool
   * @returns {boolean} True if configuration is verified
   */
  isVerified(toolName) {
    const adapter = this.adapters[toolName];
    return adapter ? adapter.verified === true : false;
  }

  /**
   * Get list of all supported tools
   * @returns {Array<string>} Array of tool names
   */
  getSupportedTools() {
    return Object.keys(this.adapters);
  }

  /**
   * Get adapter information for a tool
   * @param {string} toolName - Name of the CLI tool
   * @returns {Object} Adapter configuration
   */
  getAdapterInfo(toolName) {
    return this.adapters[toolName] || null;
  }

  /**
   * Print adapter configuration (for debugging)
   * @param {string} toolName - Name of the CLI tool
   * @param {boolean} verbose - Show detailed information
   */
  printAdapterInfo(toolName, verbose = false) {
    const adapter = this.adapters[toolName];

    if (!adapter) {
      console.log(`[ADAPTER] No adapter found for: ${toolName}`);
      return;
    }

    console.log(`[ADAPTER] ${toolName} Configuration:`);
    console.log(`  - Supports Interactive: ${adapter.supportsInteractive ? '✅' : '❌'}`);
    console.log(`  - Supports One-Time: ${adapter.supportsOneTime ? '✅' : '❌'}`);
    console.log(`  - Default Mode: ${adapter.defaultMode}`);
    console.log(`  - Verified: ${adapter.verified ? '✅' : '⚠️  (needs testing)'}`);

    if (verbose && adapter.supportsInteractive && adapter.supportsOneTime) {
      console.log(`  - Interactive Example: ${toolName} ${this.getArguments(toolName, 'interactive', 'your prompt').join(' ')}`);
      console.log(`  - One-Time Example: ${toolName} ${this.getArguments(toolName, 'one-time', 'your prompt').join(' ')}`);
    }
  }
}

module.exports = {
  CLI_ADAPTERS,
  CLIAdapterManager
};
