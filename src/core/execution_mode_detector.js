/**
 * Execution Mode Detector
 * Intelligently detects whether to run in interactive or one-time mode
 * based on execution context and user preferences
 *
 * Modes:
 * - 'interactive': Keep CLI tool running for continuous conversation
 * - 'one-time': Execute prompt and exit (return control to caller)
 */

class ExecutionModeDetector {
  constructor() {
    // Cached detection result
    this._cachedMode = null;
  }

  /**
   * Detect the appropriate execution mode
   * @param {Object} options - Detection options
   * @param {boolean} options.interactive - Force interactive mode
   * @param {boolean} options.print - Force one-time (print) mode
   * @param {boolean} options.verbose - Enable verbose output
   * @returns {string} 'interactive' or 'one-time'
   */
  detect(options = {}) {
    // Return cached result if available
    if (this._cachedMode && !options.interactive && !options.print) {
      return this._cachedMode;
    }

    const mode = this._detectMode(options);

    // Cache the result if not forced
    if (!options.interactive && !options.print) {
      this._cachedMode = mode;
    }

    return mode;
  }

  /**
   * Internal detection logic
   * @private
   */
  _detectMode(options) {
    const verbose = options.verbose || process.env.DEBUG === 'true';

    // Priority 1: Explicit user flags (highest priority)
    if (options.interactive) {
      if (verbose) {
        console.log('[MODE] Interactive mode forced by --interactive flag');
      }
      return 'interactive';
    }

    if (options.print) {
      if (verbose) {
        console.log('[MODE] One-time mode forced by --print flag');
      }
      return 'one-time';
    }

    // Priority 2: Environment variable
    const envMode = process.env.STIGMERGY_MODE;
    if (envMode) {
      if (envMode === 'interactive') {
        if (verbose) {
          console.log('[MODE] Interactive mode from STIGMERGY_MODE environment variable');
        }
        return 'interactive';
      }
      if (envMode === 'one-time' || envMode === 'onetime') {
        if (verbose) {
          console.log('[MODE] One-time mode from STIGMERGY_MODE environment variable');
        }
        return 'one-time';
      }
    }

    // Priority 3: Intelligent context detection
    const context = this._analyzeContext();

    if (verbose) {
      console.log('[MODE] Context Analysis:');
      console.log(`  - stdin.isTTY: ${context.stdinIsTTY}`);
      console.log(`  - stdout.isTTY: ${context.stdoutIsTTY}`);
      console.log(`  - hasPipedInput: ${context.hasPipedInput}`);
      console.log(`  - isFromCI: ${context.isFromCI}`);
      console.log(`  - isFromScript: ${context.isFromScript}`);
    }

    // Decision logic
    const isInteractiveTerminal = context.stdinIsTTY && context.stdoutIsTTY;

    if (isInteractiveTerminal && !context.isFromCI && !context.isFromScript) {
      if (verbose) {
        console.log('[MODE] Detected interactive terminal → Interactive mode');
      }
      return 'interactive';
    }

    // All other cases: use one-time mode
    if (verbose) {
      console.log('[MODE] Detected non-interactive context → One-time mode');
    }
    return 'one-time';
  }

  /**
   * Analyze execution context
   * @private
   */
  _analyzeContext() {
    const context = {
      // Check if stdin is a terminal (interactive input)
      stdinIsTTY: process.stdin.isTTY,

      // Check if stdout is a terminal (interactive output)
      stdoutIsTTY: process.stdout.isTTY,

      // Check if there's piped input
      hasPipedInput: !process.stdin.isTTY,

      // Check if running in CI environment
      isFromCI: this._isCIEnvironment(),

      // Check if running from a script
      isFromScript: this._isRunningFromScript(),

      // Get parent process name
      parentProcess: this._getParentProcessName()
    };

    return context;
  }

  /**
   * Check if running in CI environment
   * @private
   */
  _isCIEnvironment() {
    // Common CI environment variables
    const ciVars = [
      'CI',
      'CONTINUOUS_INTEGRATION',
      'JENKINS_URL',
      'BUILD_NUMBER',
      'GITHUB_ACTIONS',
      'GITLAB_CI',
      'TRAVIS',
      'CIRCLECI',
      'APPVEYOR',
      'TEAMCITY_VERSION'
    ];

    return ciVars.some(varName => process.env[varName]);
  }

  /**
   * Check if running from a script
   * @private
   */
  _isRunningFromScript() {
    // Check if called from node script
    const invokedAsScript = process.argv[1] &&
                            !process.argv[1].endsWith('stigmergy') &&
                            (process.argv[1].endsWith('.js') ||
                             process.argv[1].endsWith('.cjs') ||
                             process.argv[1].endsWith('.mjs'));

    return invokedAsScript;
  }

  /**
   * Get parent process name (if available)
   * @private
   */
  _getParentProcessName() {
    try {
      // Try to get parent process info
      if (process.ppid) {
        return `PID:${process.ppid}`;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear cached detection result
   * Call this if execution context changes
   */
  clearCache() {
    this._cachedMode = null;
  }

  /**
   * Get human-readable mode description
   * @param {string} mode - 'interactive' or 'one-time'
   * @returns {string} Description
   */
  getModeDescription(mode) {
    const descriptions = {
      'interactive': 'Continuous conversation mode (CLI tool stays running)',
      'one-time': 'Execute and exit mode (returns control after completion)'
    };

    return descriptions[mode] || 'Unknown mode';
  }

  /**
   * Check if a specific mode is forced by user
   * @param {Object} options - Detection options
   * @returns {boolean} True if mode is forced
   */
  isModeForced(options) {
    return !!(options.interactive || options.print);
  }
}

module.exports = ExecutionModeDetector;
