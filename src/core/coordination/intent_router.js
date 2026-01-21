/**
 * Intent Router for Cross-CLI Collaboration
 * 
 * This router handles routing of parsed intents to appropriate handlers:
 * - Cross-CLI calls: Route to target CLI
 * - Collaboration requests: Route to collaboration coordinator
 * - Local tasks: Route to local CLI handler
 * 
 * @module IntentRouter
 */

const { EventEmitter } = require('events');

class IntentRouter extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableLogging: options.enableLogging !== false,
      enableAudit: options.enableAudit !== false,
      auditLogPath: options.auditLogPath || './logs/intent-router-audit.log',
      defaultRoutingStrategy: options.defaultRoutingStrategy || 'auto',
      ...options
    };
    
    // Routing statistics
    this.stats = {
      totalRequests: 0,
      crossCLICalls: 0,
      collaborationRequests: 0,
      localTasks: 0,
      routingErrors: 0,
      lastRoutingTime: null
    };
    
    // Initialize audit log
    if (this.options.enableAudit) {
      this._initializeAuditLog();
    }
  }

  /**
   * Route a request based on parsed intent
   * 
   * @param {Object} intentResult - Parsed intent from NaturalLanguageParser
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Routing decision and target information
   */
  async routeRequest(intentResult, context = {}) {
    const startTime = Date.now();
    
    try {
      this.stats.totalRequests++;
      
      // Validate intent result
      if (!intentResult || !intentResult.intent) {
        throw new Error('Invalid intent result');
      }
      
      // Log routing request
      if (this.options.enableLogging) {
        this._logRoutingRequest(intentResult, context);
      }
      
      // Route based on intent type
      let routingDecision;
      
      switch (intentResult.intent) {
        case 'DIRECT_CALL':
        case 'DELEGATION':
        case 'CONTINUATION':
        case 'HANDOFF':
        case 'REVIEW':
        case 'OPTIMIZATION':
          routingDecision = await this._routeCrossCLICall(intentResult, context);
          break;
          
        case 'COLLABORATION':
          routingDecision = await this._routeCollaborationRequest(intentResult, context);
          break;
          
        case 'local':
        default:
          routingDecision = await this._routeLocalTask(intentResult, context);
          break;
      }
      
      // Update statistics
      this.stats.lastRoutingTime = Date.now();
      
      // Audit routing decision
      if (this.options.enableAudit) {
        this._auditRoutingDecision(intentResult, routingDecision, context);
      }
      
      // Emit routing event
      this.emit('routed', {
        intent: intentResult,
        decision: routingDecision,
        context: context,
        timestamp: new Date().toISOString()
      });
      
      return routingDecision;
      
    } catch (error) {
      this.stats.routingErrors++;
      
      // Log routing error
      if (this.options.enableLogging) {
        this._logRoutingError(intentResult, error, context);
      }
      
      // Emit error event
      this.emit('error', {
        intent: intentResult,
        error: error,
        context: context,
        timestamp: new Date().toISOString()
      });
      
      // Return error routing decision
      return {
        decision: 'error',
        target: null,
        handler: null,
        error: error.message,
        originalIntent: intentResult
      };
    }
  }

  /**
   * Route cross-CLI call to target CLI
   * 
   * @param {Object} intentResult - Parsed intent result
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Routing decision for cross-CLI call
   * @private
   */
  async _routeCrossCLICall(intentResult, context) {
    this.stats.crossCLICalls++;
    
    // Validate target CLI
    if (!intentResult.targetCLI) {
      throw new Error('No target CLI specified for cross-CLI call');
    }
    
    // Check if target CLI is available
    const isAvailable = await this._checkCLIAvailability(intentResult.targetCLI);
    
    if (!isAvailable) {
      throw new Error(`Target CLI '${intentResult.targetCLI}' is not available`);
    }
    
    // Return routing decision
    return {
      decision: 'cross-cli',
      target: intentResult.targetCLI,
      handler: 'cross-cli-executor',
      task: intentResult.task,
      confidence: intentResult.confidence,
      originalIntent: intentResult.intent,
      routingStrategy: 'direct',
      metadata: {
        sourceCLI: context.sourceCLI || 'unknown',
        language: intentResult.language,
        matchedPattern: intentResult.matchedPattern
      }
    };
  }

  /**
   * Route collaboration request to collaboration coordinator
   * 
   * @param {Object} intentResult - Parsed intent result
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Routing decision for collaboration request
   * @private
   */
  async _routeCollaborationRequest(intentResult, context) {
    this.stats.collaborationRequests++;
    
    // Extract involved CLI tools
    const involvedCLIs = this._extractInvolvedCLIs(intentResult.originalInput);
    
    if (involvedCLIs.length < 2) {
      throw new Error('Collaboration request requires at least 2 CLI tools');
    }
    
    // Check if all involved CLIs are available
    const unavailableCLIs = [];
    for (const cli of involvedCLIs) {
      const isAvailable = await this._checkCLIAvailability(cli);
      if (!isAvailable) {
        unavailableCLIs.push(cli);
      }
    }
    
    if (unavailableCLIs.length > 0) {
      throw new Error(`The following CLI tools are not available: ${unavailableCLIs.join(', ')}`);
    }
    
    // Return routing decision
    return {
      decision: 'collaboration',
      target: involvedCLIs,
      handler: 'collaboration-coordinator',
      task: intentResult.task,
      confidence: intentResult.confidence,
      originalIntent: intentResult.intent,
      routingStrategy: 'multi-cli',
      metadata: {
        involvedCLIs: involvedCLIs,
        sourceCLI: context.sourceCLI || 'unknown',
        language: intentResult.language,
        matchedPattern: intentResult.matchedPattern
      }
    };
  }

  /**
   * Route local task to local CLI handler
   * 
   * @param {Object} intentResult - Parsed intent result
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Routing decision for local task
   * @private
   */
  async _routeLocalTask(intentResult, context) {
    this.stats.localTasks++;
    
    // Get source CLI from context
    const sourceCLI = context.sourceCLI || 'unknown';
    
    // Check if source CLI is available
    const isAvailable = await this._checkCLIAvailability(sourceCLI);
    
    if (!isAvailable) {
      throw new Error(`Source CLI '${sourceCLI}' is not available`);
    }
    
    // Return routing decision
    return {
      decision: 'local',
      target: sourceCLI,
      handler: 'local-executor',
      task: intentResult.task,
      confidence: intentResult.confidence,
      originalIntent: intentResult.intent,
      routingStrategy: 'local',
      metadata: {
        sourceCLI: sourceCLI,
        language: intentResult.language,
        reason: 'No cross-CLI intent detected'
      }
    };
  }

  /**
   * Check if a CLI tool is available
   * 
   * @param {string} cliName - CLI tool name
   * @returns {Promise<boolean>} True if CLI is available
   * @private
   */
  async _checkCLIAvailability(cliName) {
    // This is a placeholder implementation
    // In a real implementation, this would check if the CLI tool is installed and accessible
    try {
      const { spawn } = require('child_process');
      
      return new Promise((resolve) => {
        const cliProcess = spawn(cliName, ['--version'], {
          stdio: 'ignore',
          shell: true
        });
        
        cliProcess.on('close', (code) => {
          resolve(code === 0);
        });
        
        cliProcess.on('error', () => {
          resolve(false);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          cliProcess.kill();
          resolve(false);
        }, 5000);
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract involved CLI tools from input text
   * 
   * @param {string} input - Input text
   * @returns {Array<string>} List of involved CLI tools
   * @private
   */
  _extractInvolvedCLIs(input) {
    const cliTools = ['claude', 'qwen', 'iflow', 'codex', 'codebuddy', 'qodercli'];
    const involvedCLIs = new Set();
    
    for (const cli of cliTools) {
      if (input.toLowerCase().includes(cli.toLowerCase())) {
        involvedCLIs.add(cli);
      }
    }
    
    return Array.from(involvedCLIs);
  }

  /**
   * Log routing request
   * 
   * @param {Object} intentResult - Parsed intent result
   * @param {Object} context - Execution context
   * @private
   */
  _logRoutingRequest(intentResult, context) {
    console.log(`[IntentRouter] Routing request: ${intentResult.intent}`);
    console.log(`  Target CLI: ${intentResult.targetCLI || 'N/A'}`);
    console.log(`  Task: ${intentResult.task}`);
    console.log(`  Confidence: ${intentResult.confidence}`);
    console.log(`  Language: ${intentResult.language}`);
  }

  /**
   * Log routing error
   * 
   * @param {Object} intentResult - Parsed intent result
   * @param {Error} error - Error object
   * @param {Object} context - Execution context
   * @private
   */
  _logRoutingError(intentResult, error, context) {
    console.error(`[IntentRouter] Routing error: ${error.message}`);
    console.error(`  Intent: ${intentResult.intent}`);
    console.error(`  Target CLI: ${intentResult.targetCLI || 'N/A'}`);
  }

  /**
   * Initialize audit log
   * 
   * @private
   */
  _initializeAuditLog() {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const logDir = path.dirname(this.options.auditLogPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      console.error(`[IntentRouter] Failed to initialize audit log: ${error.message}`);
    }
  }

  /**
   * Audit routing decision
   * 
   * @param {Object} intentResult - Parsed intent result
   * @param {Object} routingDecision - Routing decision
   * @param {Object} context - Execution context
   * @private
   */
  _auditRoutingDecision(intentResult, routingDecision, context) {
    const fs = require('fs');
    
    try {
      const auditEntry = {
        timestamp: new Date().toISOString(),
        intent: intentResult.intent,
        target: routingDecision.target,
        decision: routingDecision.decision,
        confidence: intentResult.confidence,
        sourceCLI: context.sourceCLI || 'unknown',
        task: intentResult.task
      };
      
      const logLine = JSON.stringify(auditEntry) + '\n';
      fs.appendFileSync(this.options.auditLogPath, logLine);
    } catch (error) {
      console.error(`[IntentRouter] Failed to write audit log: ${error.message}`);
    }
  }

  /**
   * Get routing statistics
   * 
   * @returns {Object} Routing statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      crossCLICallRate: this.stats.totalRequests > 0 
        ? (this.stats.crossCLICalls / this.stats.totalRequests * 100).toFixed(2) + '%'
        : '0%',
      collaborationRequestRate: this.stats.totalRequests > 0
        ? (this.stats.collaborationRequests / this.stats.totalRequests * 100).toFixed(2) + '%'
        : '0%',
      localTaskRate: this.stats.totalRequests > 0
        ? (this.stats.localTasks / this.stats.totalRequests * 100).toFixed(2) + '%'
        : '0%',
      errorRate: this.stats.totalRequests > 0
        ? (this.stats.routingErrors / this.stats.totalRequests * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.stats = {
      totalRequests: 0,
      crossCLICalls: 0,
      collaborationRequests: 0,
      localTasks: 0,
      routingErrors: 0,
      lastRoutingTime: null
    };
  }

  /**
   * Clear audit log
   */
  clearAuditLog() {
    const fs = require('fs');
    
    try {
      if (fs.existsSync(this.options.auditLogPath)) {
        fs.unlinkSync(this.options.auditLogPath);
      }
    } catch (error) {
      console.error(`[IntentRouter] Failed to clear audit log: ${error.message}`);
    }
  }
}

module.exports = IntentRouter;