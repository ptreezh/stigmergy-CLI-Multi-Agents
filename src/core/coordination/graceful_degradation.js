/**
 * Graceful Degradation Mechanism
 * 
 * This mechanism handles graceful degradation when components fail:
 * - Detects when degradation is needed
 * - Executes fallback strategies
 * - Logs degradation events
 * - Supports multiple fallback strategies
 * - Maintains system stability
 * 
 * @module GracefulDegradation
 */

const { EventEmitter } = require('events');

class GracefulDegradation extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableLogging: options.enableLogging !== false,
      enableMetrics: options.enableMetrics !== false,
      maxDegradationLevel: options.maxDegradationLevel || 3,
      autoRecovery: options.autoRecovery !== false,
      recoveryInterval: options.recoveryInterval || 60000, // 1 minute
      ...options
    };
    
    // Degradation state
    this.state = {
      currentLevel: 0,
      degradedComponents: new Map(),
      fallbackHistory: [],
      recoveryAttempts: 0,
      lastDegradationTime: null
    };
    
    // Fallback strategies
    this.strategies = new Map();
    this._initializeDefaultStrategies();
    
    // Metrics
    this.metrics = {
      totalDegrades: 0,
      totalRecoveries: 0,
      totalFallbacks: 0,
      componentDegrades: new Map()
    };
    
    // Start auto-recovery if enabled
    if (this.options.autoRecovery) {
      this._startAutoRecovery();
    }
  }

  /**
   * Initialize default fallback strategies
   * 
   * @private
   */
  _initializeDefaultStrategies() {
    // Python coordination layer fallback
    this.registerStrategy('python-coordination', {
      level: 1,
      fallback: async (context) => {
        return {
          strategy: 'nodejs-coordination',
          reason: 'Python coordination layer unavailable',
          handler: 'nodejs-coordinator'
        };
      },
      recovery: async () => {
        // Try to recover Python coordination
        return false; // Will be implemented
      }
    });
    
    // CLI availability fallback
    this.registerStrategy('cli-unavailable', {
      level: 2,
      fallback: async (context) => {
        const { targetCLI } = context;
        return {
          strategy: 'alternative-cli',
          reason: `CLI '${targetCLI}' unavailable`,
          alternative: this._findAlternativeCLI(targetCLI),
          handler: 'cross-cli-executor'
        };
      },
      recovery: async () => {
        return true; // CLI availability can recover
      }
    });
    
    // Performance degradation fallback
    this.registerStrategy('performance-degradation', {
      level: 1,
      fallback: async (context) => {
        return {
          strategy: 'reduced-functionality',
          reason: 'System performance degraded',
          actions: [
            'disable-caching',
            'reduce-concurrency',
            'disable-logging'
          ]
        };
      },
      recovery: async () => {
        return true; // Performance can recover
      }
    });
    
    // Memory pressure fallback
    this.registerStrategy('memory-pressure', {
      level: 2,
      fallback: async (context) => {
        return {
          strategy: 'memory-conservation',
          reason: 'Memory pressure detected',
          actions: [
            'clear-cache',
            'reduce-queue-size',
            'disable-metrics'
          ]
        };
      },
      recovery: async () => {
        return true; // Memory pressure can recover
      }
    });
    
    // Network issues fallback
    this.registerStrategy('network-issues', {
      level: 1,
      fallback: async (context) => {
        return {
          strategy: 'offline-mode',
          reason: 'Network connectivity issues',
          actions: [
            'use-local-cache',
            'disable-remote-calls',
            'queue-requests'
          ]
        };
      },
      recovery: async () => {
        return true; // Network can recover
      }
    });
  }

  /**
   * Register a fallback strategy
   * 
   * @param {string} name - Strategy name
   * @param {Object} strategy - Strategy configuration
   */
  registerStrategy(name, strategy) {
    if (!strategy.level || !strategy.fallback) {
      throw new Error('Strategy must have level and fallback');
    }
    
    this.strategies.set(name, {
      name,
      level: strategy.level,
      fallback: strategy.fallback,
      recovery: strategy.recovery || (() => Promise.resolve(false)),
      enabled: strategy.enabled !== false
    });
    
    if (this.options.enableLogging) {
      console.log(`[GracefulDegradation] Registered strategy: ${name} (Level ${strategy.level})`);
    }
  }

  /**
   * Unregister a fallback strategy
   * 
   * @param {string} name - Strategy name
   */
  unregisterStrategy(name) {
    this.strategies.delete(name);
    
    if (this.options.enableLogging) {
      console.log(`[GracefulDegradation] Unregistered strategy: ${name}`);
    }
  }

  /**
   * Check if degradation is needed
   * 
   * @param {string} component - Component name
   * @param {Object} context - Context information
   * @returns {Promise<boolean>} True if degradation is needed
   */
  async shouldDegrade(component, context = {}) {
    // Check if component is already degraded
    if (this.state.degradedComponents.has(component)) {
      return false;
    }
    
    // Check if maximum degradation level reached
    if (this.state.currentLevel >= this.options.maxDegradationLevel) {
      return false;
    }
    
    // Check if strategy exists
    const strategy = this.strategies.get(component);
    if (!strategy || !strategy.enabled) {
      return false;
    }
    
    return true;
  }

  /**
   * Execute degradation
   * 
   * @param {string} component - Component name
   * @param {Object} context - Context information
   * @returns {Promise<Object>} Degradation result
   */
  async degrade(component, context = {}) {
    try {
      // Check if degradation should occur
      const shouldDegrade = await this.shouldDegrade(component, context);
      
      if (!shouldDegrade) {
        return {
          degraded: false,
          reason: 'Degradation not needed or not possible'
        };
      }
      
      // Get strategy
      const strategy = this.strategies.get(component);
      if (!strategy) {
        throw new Error(`No strategy found for component: ${component}`);
      }
      
      // Execute fallback
      const fallbackResult = await strategy.fallback(context);
      
      // Update state
      this.state.currentLevel = Math.max(this.state.currentLevel, strategy.level);
      this.state.degradedComponents.set(component, {
        strategy: strategy.name,
        level: strategy.level,
        fallback: fallbackResult,
        timestamp: Date.now()
      });
      
      this.state.lastDegradationTime = Date.now();
      
      // Update metrics
      this.metrics.totalDegrades++;
      this.metrics.componentDegrades.set(
        component,
        (this.metrics.componentDegrades.get(component) || 0) + 1
      );
      
      // Log event
      if (this.options.enableLogging) {
        console.log(`[GracefulDegradation] Degraded component: ${component}`);
        console.log(`  Level: ${strategy.level}`);
        console.log(`  Strategy: ${fallbackResult.strategy || fallbackResult.reason}`);
      }
      
      // Emit event
      this.emit('degraded', {
        component,
        strategy: strategy.name,
        level: strategy.level,
        fallback: fallbackResult,
        context,
        timestamp: Date.now()
      });
      
      return {
        degraded: true,
        component,
        level: strategy.level,
        fallback: fallbackResult
      };
      
    } catch (error) {
      // Log error
      if (this.options.enableLogging) {
        console.error(`[GracefulDegradation] Degradation failed for ${component}:`, error.message);
      }
      
      // Emit error event
      this.emit('degradation-error', {
        component,
        error: error.message,
        context,
        timestamp: Date.now()
      });
      
      return {
        degraded: false,
        error: error.message
      };
    }
  }

  /**
   * Attempt to recover a degraded component
   * 
   * @param {string} component - Component name
   * @returns {Promise<Object>} Recovery result
   */
  async recover(component) {
    try {
      // Check if component is degraded
      const degradedInfo = this.state.degradedComponents.get(component);
      if (!degradedInfo) {
        return {
          recovered: false,
          reason: 'Component not degraded'
        };
      }
      
      // Get strategy
      const strategy = this.strategies.get(component);
      if (!strategy) {
        throw new Error(`No strategy found for component: ${component}`);
      }
      
      // Attempt recovery
      const canRecover = await strategy.recovery();
      
      if (canRecover) {
        // Remove from degraded components
        this.state.degradedComponents.delete(component);
        
        // Recalculate current level
        this._recalculateLevel();
        
        // Update metrics
        this.metrics.totalRecoveries++;
        
        // Log event
        if (this.options.enableLogging) {
          console.log(`[GracefulDegradation] Recovered component: ${component}`);
        }
        
        // Emit event
        this.emit('recovered', {
          component,
          strategy: strategy.name,
          timestamp: Date.now()
        });
        
        return {
          recovered: true,
          component
        };
      } else {
        return {
          recovered: false,
          reason: 'Recovery not possible at this time'
        };
      }
      
    } catch (error) {
      // Log error
      if (this.options.enableLogging) {
        console.error(`[GracefulDegradation] Recovery failed for ${component}:`, error.message);
      }
      
      // Emit error event
      this.emit('recovery-error', {
        component,
        error: error.message,
        timestamp: Date.now()
      });
      
      return {
        recovered: false,
        error: error.message
      };
    }
  }

  /**
   * Recalculate current degradation level
   * 
   * @private
   */
  _recalculateLevel() {
    let maxLevel = 0;
    
    for (const [component, info] of this.state.degradedComponents.entries()) {
      maxLevel = Math.max(maxLevel, info.level);
    }
    
    this.state.currentLevel = maxLevel;
  }

  /**
   * Start auto-recovery
   * 
   * @private
   */
  _startAutoRecovery() {
    setInterval(async () => {
      for (const component of this.state.degradedComponents.keys()) {
        await this.recover(component);
      }
    }, this.options.recoveryInterval);
  }

  /**
   * Find alternative CLI
   * 
   * @param {string} cli - CLI name
   * @returns {string|null} Alternative CLI or null
   * @private
   */
  _findAlternativeCLI(cli) {
    const alternatives = {
      'claude': ['qwen', 'iflow'],
      'qwen': ['claude', 'gemini'],
      'iflow': ['claude', 'qwen'],
      'codex': ['codebuddy', 'copilot'],
      'codebuddy': ['codex', 'qodercli'],
      'copilot': ['codex', 'codebuddy'],
      'qodercli': ['codebuddy', 'codex']
    };
    
    return alternatives[cli]?.[0] || null;
  }

  /**
   * Get current degradation state
   * 
   * @returns {Object} Current state
   */
  getState() {
    return {
      currentLevel: this.state.currentLevel,
      degradedComponents: Array.from(this.state.degradedComponents.entries()),
      lastDegradationTime: this.state.lastDegradationTime,
      maxLevel: this.options.maxDegradationLevel
    };
  }

  /**
   * Get metrics
   * 
   * @returns {Object} Metrics
   */
  getMetrics() {
    return {
      totalDegrades: this.metrics.totalDegrades,
      totalRecoveries: this.metrics.totalRecoveries,
      totalFallbacks: this.metrics.totalFallbacks,
      componentDegrades: Object.fromEntries(this.metrics.componentDegrades),
      currentLevel: this.state.currentLevel
    };
  }

  /**
   * Reset degradation state
   */
  reset() {
    this.state = {
      currentLevel: 0,
      degradedComponents: new Map(),
      fallbackHistory: [],
      recoveryAttempts: 0,
      lastDegradationTime: null
    };
    
    this.metrics = {
      totalDegrades: 0,
      totalRecoveries: 0,
      totalFallbacks: 0,
      componentDegrades: new Map()
    };
    
    if (this.options.enableLogging) {
      console.log('[GracefulDegradation] State reset');
    }
  }
}

module.exports = GracefulDegradation;