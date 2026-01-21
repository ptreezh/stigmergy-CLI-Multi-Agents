/**
 * Cross-CLI Executor for Unified CLI Tool Execution
 * 
 * This executor handles cross-CLI calls by:
 * - Executing tasks on target CLI tools
 * - Managing task distribution
 * - Collecting and formatting results
 * - Handling execution timeouts
 * - Providing execution statistics
 * 
 * @module CrossCliExecutor
 */

const { spawn } = require('child_process');
const { EventEmitter } = require('events');

class CrossCLIExecutor extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      defaultTimeout: options.defaultTimeout || 30000, // 30 seconds
      maxConcurrentExecutions: options.maxConcurrentExecutions || 5,
      enableLogging: options.enableLogging !== false,
      enableStatistics: options.enableStatistics !== false,
      enableResultCaching: options.enableResultCaching !== false,
      cacheTTL: options.cacheTTL || 60000, // 60 seconds
      ...options
    };
    
    // Execution state
    this.state = {
      activeExecutions: new Map(),
      executionQueue: [],
      executionHistory: [],
      resultCache: new Map(),
      cacheTimestamps: new Map(),
      statistics: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0,
        lastExecutionTime: null
      }
    };
    
    // CLI command mappings
    this.cliCommands = {
      'claude': 'claude',
      'qwen': 'qwen',
      'iflow': 'iflow',
      'codex': 'codex',
      'codebuddy': 'codebuddy',
      'qodercli': 'qodercli'
    };
  }

  /**
   * Execute a cross-CLI task
   * 
   * @param {string} targetCLI - Target CLI tool name
   * @param {string} task - Task description/command
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution result
   */
  async execute(targetCLI, task, context = {}) {
    const startTime = Date.now();
    const executionId = this._generateExecutionId();
    
    try {
      // Validate target CLI
      if (!this.cliCommands[targetCLI]) {
        throw new Error(`Unsupported CLI tool: ${targetCLI}`);
      }
      
      // Check result cache
      if (this.options.enableResultCaching) {
        const cached = this._getFromCache(targetCLI, task);
        if (cached) {
          this._logCacheHit(targetCLI, task);
          return cached;
        }
      }
      
      // Check execution queue
      if (this.state.activeExecutions.size >= this.options.maxConcurrentExecutions) {
        return await this._queueExecution(targetCLI, task, context, executionId);
      }
      
      // Log execution request
      if (this.options.enableLogging) {
        this._logExecutionRequest(targetCLI, task, context);
      }
      
      // Create execution context
      const executionContext = {
        id: executionId,
        targetCLI: targetCLI,
        task: task,
        context: context,
        startTime: startTime,
        status: 'running',
        timeout: context.timeout || this.options.defaultTimeout
      };
      
      // Add to active executions
      this.state.activeExecutions.set(executionId, executionContext);
      
      // Emit execution start event
      this.emit('execution-started', {
        executionId: executionId,
        targetCLI: targetCLI,
        task: task,
        timestamp: new Date().toISOString()
      });
      
      // Execute the task
      const result = await this._executeTask(executionContext);
      
      // Calculate execution time
      const executionTime = Date.now() - startTime;
      result.executionTime = executionTime;
      
      // Update state
      this.state.activeExecutions.delete(executionId);
      this.state.statistics.totalExecutions++;
      this.state.statistics.successfulExecutions++;
      this.state.statistics.lastExecutionTime = Date.now();
      this.state.statistics.averageExecutionTime = 
        this._calculateAverageExecutionTime(executionTime);
      
      // Add to history
      this.state.executionHistory.push({
        id: executionId,
        targetCLI: targetCLI,
        task: task,
        result: result.success,
        executionTime: executionTime,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 100 history entries
      if (this.state.executionHistory.length > 100) {
        this.state.executionHistory = this.state.executionHistory.slice(-100);
      }
      
      // Cache result
      if (this.options.enableResultCaching && result.success) {
        this._setToCache(targetCLI, task, result);
      }
      
      // Emit execution completed event
      this.emit('execution-completed', {
        executionId: executionId,
        targetCLI: targetCLI,
        task: task,
        result: result,
        executionTime: executionTime,
        timestamp: new Date().toISOString()
      });
      
      // Process queue
      this._processQueue();
      
      return result;
      
    } catch (error) {
      // Update statistics
      this.state.statistics.totalExecutions++;
      this.state.statistics.failedExecutions++;
      this.state.statistics.lastExecutionTime = Date.now();
      
      // Remove from active executions
      this.state.activeExecutions.delete(executionId);
      
      // Emit execution error event
      this.emit('execution-error', {
        executionId: executionId,
        targetCLI: targetCLI,
        task: task,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      // Process queue
      this._processQueue();
      
      return {
        success: false,
        output: '',
        error: error.message,
        executionTime: Date.now() - startTime,
        executionId: executionId
      };
    }
  }

  /**
   * Execute a task on the target CLI
   * 
   * @param {Object} executionContext - Execution context
   * @returns {Promise<Object>} Execution result
   * @private
   */
  async _executeTask(executionContext) {
    const { targetCLI, task, timeout } = executionContext;
    const cliCommand = this.cliCommands[targetCLI];
    
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';
      let isResolved = false;
      
      // Spawn CLI process
      const cliProcess = spawn(cliCommand, [task], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });
      
      // Collect stdout
      cliProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      // Collect stderr
      cliProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      // Handle process completion
      cliProcess.on('close', (code) => {
        if (isResolved) return;
        isResolved = true;
        
        const result = {
          success: code === 0,
          output: output.trim(),
          error: errorOutput.trim() || (code !== 0 ? `Process exited with code ${code}` : ''),
          exitCode: code,
          executionId: executionContext.id
        };
        
        resolve(result);
      });
      
      // Handle process error
      cliProcess.on('error', (error) => {
        if (isResolved) return;
        isResolved = true;
        
        resolve({
          success: false,
          output: '',
          error: error.message,
          exitCode: -1,
          executionId: executionContext.id
        });
      });
      
      // Handle timeout
      const timeoutId = setTimeout(() => {
        if (isResolved) return;
        isResolved = true;
        
        cliProcess.kill();
        
        resolve({
          success: false,
          output: output.trim(),
          error: `Execution timed out after ${timeout}ms`,
          exitCode: -1,
          executionId: executionContext.id,
          timedOut: true
        });
      }, timeout);
      
      // Clear timeout on completion
      cliProcess.on('close', () => {
        clearTimeout(timeoutId);
      });
    });
  }

  /**
   * Queue an execution for later processing
   * 
   * @param {string} targetCLI - Target CLI tool name
   * @param {string} task - Task description/command
   * @param {Object} context - Execution context
   * @param {string} executionId - Execution ID
   * @returns {Promise<Object>} Execution result
   * @private
   */
  async _queueExecution(targetCLI, task, context, executionId) {
    return new Promise((resolve, reject) => {
      const queuedExecution = {
        id: executionId,
        targetCLI: targetCLI,
        task: task,
        context: context,
        resolve: resolve,
        reject: reject,
        timestamp: Date.now()
      };
      
      this.state.executionQueue.push(queuedExecution);
      
      if (this.options.enableLogging) {
        console.log(`[CrossCliExecutor] Execution queued: ${executionId}`);
      }
    });
  }

  /**
   * Process execution queue
   * 
   * @private
   */
  async _processQueue() {
    while (
      this.state.executionQueue.length > 0 &&
      this.state.activeExecutions.size < this.options.maxConcurrentExecutions
    ) {
      const queuedExecution = this.state.executionQueue.shift();
      
      try {
        const result = await this.execute(
          queuedExecution.targetCLI,
          queuedExecution.task,
          queuedExecution.context
        );
        queuedExecution.resolve(result);
      } catch (error) {
        queuedExecution.reject(error);
      }
    }
  }

  /**
   * Get result from cache
   * 
   * @param {string} targetCLI - Target CLI tool name
   * @param {string} task - Task description/command
   * @returns {Object|null} Cached result or null
   * @private
   */
  _getFromCache(targetCLI, task) {
    const cacheKey = `${targetCLI}:${task}`;
    const cached = this.state.resultCache.get(cacheKey);
    const timestamp = this.state.cacheTimestamps.get(cacheKey);
    
    if (cached && timestamp) {
      const age = Date.now() - timestamp;
      if (age < this.options.cacheTTL) {
        return cached;
      } else {
        // Cache expired
        this.state.resultCache.delete(cacheKey);
        this.state.cacheTimestamps.delete(cacheKey);
      }
    }
    
    return null;
  }

  /**
   * Set result to cache
   * 
   * @param {string} targetCLI - Target CLI tool name
   * @param {string} task - Task description/command
   * @param {Object} result - Execution result
   * @private
   */
  _setToCache(targetCLI, task, result) {
    const cacheKey = `${targetCLI}:${task}`;
    this.state.resultCache.set(cacheKey, result);
    this.state.cacheTimestamps.set(cacheKey, Date.now());
  }

  /**
   * Generate execution ID
   * 
   * @returns {string} Unique execution ID
   * @private
   */
  _generateExecutionId() {
    return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate average execution time
   * 
   * @param {number} newExecutionTime - New execution time
   * @returns {number} Average execution time
   * @private
   */
  _calculateAverageExecutionTime(newExecutionTime) {
    const total = this.state.statistics.totalExecutions;
    const currentAverage = this.state.statistics.averageExecutionTime;
    
    return ((currentAverage * (total - 1)) + newExecutionTime) / total;
  }

  /**
   * Log execution request
   * 
   * @param {string} targetCLI - Target CLI tool name
   * @param {string} task - Task description/command
   * @param {Object} context - Execution context
   * @private
   */
  _logExecutionRequest(targetCLI, task, context) {
    console.log(`[CrossCliExecutor] Executing task on ${targetCLI}`);
    console.log(`  Task: ${task}`);
    console.log(`  Context: ${JSON.stringify(context, null, 2)}`);
  }

  /**
   * Log cache hit
   * 
   * @param {string} targetCLI - Target CLI tool name
   * @param {string} task - Task description/command
   * @private
   */
  _logCacheHit(targetCLI, task) {
    console.log(`[CrossCliExecutor] Cache hit for ${targetCLI}:${task}`);
  }

  /**
   * Get execution statistics
   * 
   * @returns {Object} Execution statistics
   */
  getStatistics() {
    return {
      ...this.state.statistics,
      activeExecutions: this.state.activeExecutions.size,
      queuedExecutions: this.state.executionQueue.length,
      successRate: this.state.statistics.totalExecutions > 0
        ? ((this.state.statistics.successfulExecutions / this.state.statistics.totalExecutions) * 100).toFixed(2) + '%'
        : '0%',
      cacheHitRate: this.options.enableResultCaching
        ? ((this.state.resultCache.size / this.state.statistics.totalExecutions) * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  /**
   * Get execution history
   * 
   * @param {number} limit - Maximum number of entries to return
   * @returns {Array<Object>} Execution history
   */
  getHistory(limit = 10) {
    return this.state.executionHistory.slice(-limit);
  }

  /**
   * Get active executions
   * 
   * @returns {Array<Object>} List of active executions
   */
  getActiveExecutions() {
    return Array.from(this.state.activeExecutions.values());
  }

  /**
   * Get queued executions
   * 
   * @returns {Array<Object>} List of queued executions
   */
  getQueuedExecutions() {
    return this.state.executionQueue;
  }

  /**
   * Clear result cache
   */
  clearCache() {
    this.state.resultCache.clear();
    this.state.cacheTimestamps.clear();
  }

  /**
   * Clear execution history
   */
  clearHistory() {
    this.state.executionHistory = [];
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.state.statistics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: null
    };
  }

  /**
   * Cancel an active execution
   * 
   * @param {string} executionId - Execution ID
   * @returns {boolean} True if execution was cancelled
   */
  cancelExecution(executionId) {
    const execution = this.state.activeExecutions.get(executionId);
    if (execution) {
      this.state.activeExecutions.delete(executionId);
      
      this.emit('execution-cancelled', {
        executionId: executionId,
        targetCLI: execution.targetCLI,
        task: execution.task,
        timestamp: new Date().toISOString()
      });
      
      return true;
    }
    
    return false;
  }

  /**
   * Cancel all active executions
   * 
   * @returns {number} Number of executions cancelled
   */
  cancelAllExecutions() {
    let cancelledCount = 0;
    
    for (const executionId of this.state.activeExecutions.keys()) {
      if (this.cancelExecution(executionId)) {
        cancelledCount++;
      }
    }
    
    return cancelledCount;
  }

  /**
   * Check if a CLI tool is supported
   * 
   * @param {string} cliName - CLI tool name
   * @returns {boolean} True if CLI is supported
   */
  isCLISupported(cliName) {
    return this.cliCommands.hasOwnProperty(cliName);
  }

  /**
   * Get list of supported CLI tools
   * 
   * @returns {Array<string>} List of supported CLI tools
   */
  getSupportedCLIs() {
    return Object.keys(this.cliCommands);
  }

  /**
   * Set CLI command mapping
   * 
   * @param {string} cliName - CLI tool name
   * @param {string} command - CLI command
   */
  setCLICommand(cliName, command) {
    this.cliCommands[cliName] = command;
  }

  /**
   * Get CLI command for a tool
   * 
   * @param {string} cliName - CLI tool name
   * @returns {string|null} CLI command or null
   */
  getCLICommand(cliName) {
    return this.cliCommands[cliName] || null;
  }

  /**
   * Wait for all active executions to complete
   * 
   * @param {number} timeout - Maximum time to wait in milliseconds
   * @returns {Promise<boolean>} True if all executions completed
   */
  async waitForCompletion(timeout = 60000) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.state.activeExecutions.size === 0) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    });
  }
}

module.exports = CrossCLIExecutor;