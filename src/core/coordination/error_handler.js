/**
 * Error Handler and Retry Mechanism for Unified Error Handling
 * 
 * This system handles errors and retries by:
 * - Supporting multiple retry strategies
 * - Classifying and logging errors
 * - Providing error recovery suggestions
 * - Controlling retry attempts
 * - Tracking retry statistics
 * 
 * @module ErrorHandler
 */

const { EventEmitter } = require('events');

// Error types
const ErrorType = {
  INITIALIZATION_ERROR: 'initialization_error',
  COMMUNICATION_ERROR: 'communication_error',
  ADAPTER_ERROR: 'adapter_error',
  HEALTH_CHECK_ERROR: 'health_check_error',
  FALLBACK_ERROR: 'fallback_error',
  TIMEOUT_ERROR: 'timeout_error',
  VALIDATION_ERROR: 'validation_error',
  UNKNOWN_ERROR: 'unknown_error'
};

// Retry strategies
const RetryPolicy = {
  IMMEDIATE: 'immediate',
  FIXED_DELAY: 'fixed_delay',
  EXPONENTIAL_BACKOFF: 'exponential_backoff',
  LINEAR_BACKOFF: 'linear_backoff',
  NO_RETRY: 'no_retry'
};

class ErrorHandler extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      defaultRetryPolicy: options.defaultRetryPolicy || RetryPolicy.EXPONENTIAL_BACKOFF,
      maxRetries: options.maxRetries || 3,
      defaultRetryDelay: options.defaultRetryDelay || 1000, // 1 second
      maxRetryDelay: options.maxRetryDelay || 30000, // 30 seconds
      enableLogging: options.enableLogging !== false,
      enableErrorTracking: options.enableErrorTracking !== false,
      errorHistorySize: options.errorHistorySize || 100,
      ...options
    };
    
    // Error handling state
    this.state = {
      errorHistory: [],
      errorStatistics: {
        totalErrors: 0,
        errorsByType: {},
        errorsBySeverity: {},
        retryStatistics: {
          totalRetries: 0,
          successfulRetries: 0,
          failedRetries: 0
        }
      }
    };
    
    // Error recovery strategies
    this.recoveryStrategies = {
      [ErrorType.INITIALIZATION_ERROR]: {
        canRetry: true,
        recommendedAction: 'reinitialize',
        fallbackAvailable: true
      },
      [ErrorType.COMMUNICATION_ERROR]: {
        canRetry: true,
        recommendedAction: 'retry_with_backoff',
        fallbackAvailable: true
      },
      [ErrorType.ADAPTER_ERROR]: {
        canRetry: true,
        recommendedAction: 'reload_adapter',
        fallbackAvailable: true
      },
      [ErrorType.HEALTH_CHECK_ERROR]: {
        canRetry: true,
        recommendedAction: 'skip_and_continue',
        fallbackAvailable: true
      },
      [ErrorType.FALLBACK_ERROR]: {
        canRetry: false,
        recommendedAction: 'abort',
        fallbackAvailable: false
      },
      [ErrorType.TIMEOUT_ERROR]: {
        canRetry: true,
        recommendedAction: 'increase_timeout',
        fallbackAvailable: true
      },
      [ErrorType.VALIDATION_ERROR]: {
        canRetry: false,
        recommendedAction: 'fix_input',
        fallbackAvailable: false
      },
      [ErrorType.UNKNOWN_ERROR]: {
        canRetry: true,
        recommendedAction: 'log_and_continue',
        fallbackAvailable: false
      }
    };
  }

  /**
   * Handle an error
   * 
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   * @param {string} retryPolicy - Retry policy to use
   * @returns {Promise<Object>} Handling result
   */
  async handleError(error, context = {}, retryPolicy = null) {
    try {
      // Classify error
      const errorType = this._classifyError(error, context);
      const errorSeverity = this._assessSeverity(error, errorType);
      
      // Log error
      if (this.options.enableLogging) {
        this._logError(error, errorType, errorSeverity, context);
      }
      
      // Track error statistics
      if (this.options.enableErrorTracking) {
        this._trackError(errorType, errorSeverity);
      }
      
      // Get recovery strategy
      const recoveryStrategy = this.recoveryStrategies[errorType] || 
        this.recoveryStrategies[ErrorType.UNKNOWN_ERROR];
      
      // Determine retry policy
      const policy = retryPolicy || this.options.defaultRetryPolicy;
      
      // Create error record
      const errorRecord = {
        id: this._generateErrorId(),
        type: errorType,
        severity: errorSeverity,
        message: error.message,
        stack: error.stack,
        context: context,
        timestamp: new Date().toISOString(),
        recoveryStrategy: recoveryStrategy,
        retryPolicy: policy
      };
      
      // Add to history
      this._addToHistory(errorRecord);
      
      // Emit error event
      this.emit('error', {
        error: errorRecord,
        timestamp: new Date().toISOString()
      });
      
      // Determine handling result
      const handlingResult = {
        shouldRetry: recoveryStrategy.canRetry && policy !== RetryPolicy.NO_RETRY,
        recommendedAction: recoveryStrategy.recommendedAction,
        fallbackAvailable: recoveryStrategy.fallbackAvailable,
        retryPolicy: policy,
        errorId: errorRecord.id,
        errorType: errorType,
        errorSeverity: errorSeverity
      };
      
      return handlingResult;
      
    } catch (handlingError) {
      console.error('[ErrorHandler] Error while handling error:', handlingError);
      return {
        shouldRetry: false,
        recommendedAction: 'abort',
        fallbackAvailable: false,
        retryPolicy: RetryPolicy.NO_RETRY,
        errorId: 'unknown',
        errorType: ErrorType.UNKNOWN_ERROR,
        errorSeverity: 'high',
        error: handlingError.message
      };
    }
  }

  /**
   * Retry an operation with specified policy
   * 
   * @param {Function} operation - Operation to retry
   * @param {Object} options - Retry options
   * @returns {Promise<Object>} Retry result
   */
  async retry(operation, options = {}) {
    const retryOptions = {
      policy: options.policy || this.options.defaultRetryPolicy,
      maxRetries: options.maxRetries || this.options.maxRetries,
      retryDelay: options.retryDelay || this.options.defaultRetryDelay,
      maxRetryDelay: options.maxRetryDelay || this.options.maxRetryDelay,
      context: options.context || {},
      ...options
    };
    
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount <= retryOptions.maxRetries) {
      try {
        // Execute operation
        const result = await operation();
        
        // Track successful retry
        if (retryCount > 0) {
          this.state.errorStatistics.retryStatistics.successfulRetries++;
          this.state.errorStatistics.retryStatistics.totalRetries++;
          
          this.emit('retry-success', {
            retryCount: retryCount,
            policy: retryOptions.policy,
            context: retryOptions.context,
            timestamp: new Date().toISOString()
          });
        }
        
        return {
          success: true,
          result: result,
          retryCount: retryCount,
          policy: retryOptions.policy
        };
        
      } catch (error) {
        lastError = error;
        retryCount++;
        
        // Check if we should retry
        if (retryCount > retryOptions.maxRetries) {
          // Max retries reached
          this.state.errorStatistics.retryStatistics.failedRetries++;
          this.state.errorStatistics.retryStatistics.totalRetries++;
          
          this.emit('retry-failed', {
            retryCount: retryCount - 1,
            policy: retryOptions.policy,
            error: error.message,
            context: retryOptions.context,
            timestamp: new Date().toISOString()
          });
          
          return {
            success: false,
            error: error.message,
            retryCount: retryCount - 1,
            policy: retryOptions.policy
          };
        }
        
        // Calculate delay based on policy
        const delay = this._calculateRetryDelay(retryCount, retryOptions);
        
        // Wait before retry
        await this._delay(delay);
        
        // Emit retry event
        this.emit('retry', {
          retryCount: retryCount,
          policy: retryOptions.policy,
          delay: delay,
          error: error.message,
          context: retryOptions.context,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // This should never be reached
    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      retryCount: retryOptions.maxRetries,
      policy: retryOptions.policy
    };
  }

  /**
   * Classify error type
   * 
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   * @returns {string} Error type
   * @private
   */
  _classifyError(error, context) {
    const errorMessage = error.message.toLowerCase();
    
    // Check for timeout errors
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return ErrorType.TIMEOUT_ERROR;
    }
    
    // Check for communication errors
    if (errorMessage.includes('network') || errorMessage.includes('connection') || 
        errorMessage.includes('econnrefused') || errorMessage.includes('etimedout')) {
      return ErrorType.COMMUNICATION_ERROR;
    }
    
    // Check for adapter errors
    if (errorMessage.includes('adapter') || context.component === 'adapter') {
      return ErrorType.ADAPTER_ERROR;
    }
    
    // Check for initialization errors
    if (errorMessage.includes('initialize') || context.phase === 'initialization') {
      return ErrorType.INITIALIZATION_ERROR;
    }
    
    // Check for health check errors
    if (errorMessage.includes('health') || context.component === 'health-check') {
      return ErrorType.HEALTH_CHECK_ERROR;
    }
    
    // Check for validation errors
    if (errorMessage.includes('validation') || errorMessage.includes('invalid') ||
        errorMessage.includes('required')) {
      return ErrorType.VALIDATION_ERROR;
    }
    
    // Check for fallback errors
    if (errorMessage.includes('fallback') || context.phase === 'fallback') {
      return ErrorType.FALLBACK_ERROR;
    }
    
    // Default to unknown error
    return ErrorType.UNKNOWN_ERROR;
  }

  /**
   * Assess error severity
   * 
   * @param {Error} error - Error object
   * @param {string} errorType - Error type
   * @returns {string} Error severity (low, medium, high)
   * @private
   */
  _assessSeverity(error, errorType) {
    const severityMap = {
      [ErrorType.INITIALIZATION_ERROR]: 'high',
      [ErrorType.COMMUNICATION_ERROR]: 'medium',
      [ErrorType.ADAPTER_ERROR]: 'medium',
      [ErrorType.HEALTH_CHECK_ERROR]: 'low',
      [ErrorType.FALLBACK_ERROR]: 'high',
      [ErrorType.TIMEOUT_ERROR]: 'medium',
      [ErrorType.VALIDATION_ERROR]: 'low',
      [ErrorType.UNKNOWN_ERROR]: 'medium'
    };
    
    return severityMap[errorType] || 'medium';
  }

  /**
   * Calculate retry delay based on policy
   * 
   * @param {number} retryCount - Current retry count
   * @param {Object} options - Retry options
   * @returns {number} Delay in milliseconds
   * @private
   */
  _calculateRetryDelay(retryCount, options) {
    const policy = options.policy;
    const baseDelay = options.retryDelay;
    const maxDelay = options.maxRetryDelay;
    
    switch (policy) {
      case RetryPolicy.IMMEDIATE:
        return 0;
        
      case RetryPolicy.FIXED_DELAY:
        return Math.min(baseDelay, maxDelay);
        
      case RetryPolicy.EXPONENTIAL_BACKOFF:
        return Math.min(baseDelay * Math.pow(2, retryCount - 1), maxDelay);
        
      case RetryPolicy.LINEAR_BACKOFF:
        return Math.min(baseDelay * retryCount, maxDelay);
        
      case RetryPolicy.NO_RETRY:
      default:
        return 0;
    }
  }

  /**
   * Delay execution
   * 
   * @param {number} milliseconds - Delay in milliseconds
   * @returns {Promise<void>}
   * @private
   */
  _delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Log error
   * 
   * @param {Error} error - Error object
   * @param {string} errorType - Error type
   * @param {string} errorSeverity - Error severity
   * @param {Object} context - Error context
   * @private
   */
  _logError(error, errorType, errorSeverity, context) {
    const logMessage = `[ErrorHandler] ${errorSeverity.toUpperCase()} Error: ${error.message}`;
    console.error(logMessage);
    console.error(`  Type: ${errorType}`);
    console.error(`  Context: ${JSON.stringify(context, null, 2)}`);
  }

  /**
   * Track error statistics
   * 
   * @param {string} errorType - Error type
   * @param {string} errorSeverity - Error severity
   * @private
   */
  _trackError(errorType, errorSeverity) {
    this.state.errorStatistics.totalErrors++;
    
    // Track by type
    if (!this.state.errorStatistics.errorsByType[errorType]) {
      this.state.errorStatistics.errorsByType[errorType] = 0;
    }
    this.state.errorStatistics.errorsByType[errorType]++;
    
    // Track by severity
    if (!this.state.errorStatistics.errorsBySeverity[errorSeverity]) {
      this.state.errorStatistics.errorsBySeverity[errorSeverity] = 0;
    }
    this.state.errorStatistics.errorsBySeverity[errorSeverity]++;
  }

  /**
   * Add error to history
   * 
   * @param {Object} errorRecord - Error record
   * @private
   */
  _addToHistory(errorRecord) {
    this.state.errorHistory.push(errorRecord);
    
    // Keep only last N errors
    if (this.state.errorHistory.length > this.options.errorHistorySize) {
      this.state.errorHistory = this.state.errorHistory.slice(-this.options.errorHistorySize);
    }
  }

  /**
   * Generate error ID
   * 
   * @returns {string} Unique error ID
   * @private
   */
  _generateErrorId() {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error statistics
   * 
   * @returns {Object} Error statistics
   */
  getStatistics() {
    return {
      ...this.state.errorStatistics,
      errorHistorySize: this.state.errorHistory.length,
      retrySuccessRate: this.state.errorStatistics.retryStatistics.totalRetries > 0
        ? ((this.state.errorStatistics.retryStatistics.successfulRetries / 
           this.state.errorStatistics.retryStatistics.totalRetries) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Get error history
   * 
   * @param {number} limit - Maximum number of entries to return
   * @returns {Array<Object>} Error history
   */
  getErrorHistory(limit = 10) {
    return this.state.errorHistory.slice(-limit);
  }

  /**
   * Get errors by type
   * 
   * @param {string} errorType - Error type
   * @returns {Array<Object>} List of errors of specified type
   */
  getErrorsByType(errorType) {
    return this.state.errorHistory.filter(error => error.type === errorType);
  }

  /**
   * Get errors by severity
   * 
   * @param {string} severity - Error severity
   * @returns {Array<Object>} List of errors of specified severity
   */
  getErrorsBySeverity(severity) {
    return this.state.errorHistory.filter(error => error.severity === severity);
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.state.errorHistory = [];
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.state.errorStatistics = {
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      retryStatistics: {
        totalRetries: 0,
        successfulRetries: 0,
        failedRetries: 0
      }
    };
  }

  /**
   * Set recovery strategy for error type
   * 
   * @param {string} errorType - Error type
   * @param {Object} strategy - Recovery strategy
   */
  setRecoveryStrategy(errorType, strategy) {
    this.recoveryStrategies[errorType] = strategy;
  }

  /**
   * Get recovery strategy for error type
   * 
   * @param {string} errorType - Error type
   * @returns {Object|null} Recovery strategy or null
   */
  getRecoveryStrategy(errorType) {
    return this.recoveryStrategies[errorType] || null;
  }

  /**
   * Create a custom error
   * 
   * @param {string} message - Error message
   * @param {string} type - Error type
   * @param {Object} context - Error context
   * @returns {Error} Custom error object
   */
  createError(message, type = ErrorType.UNKNOWN_ERROR, context = {}) {
    const error = new Error(message);
    error.type = type;
    error.context = context;
    error.timestamp = new Date().toISOString();
    return error;
  }

  /**
   * Wrap an error with additional context
   * 
   * @param {Error} originalError - Original error
   * @param {Object} additionalContext - Additional context
   * @returns {Error} Wrapped error
   */
  wrapError(originalError, additionalContext = {}) {
    const wrappedError = new Error(originalError.message);
    wrappedError.originalError = originalError;
    wrappedError.type = originalError.type || ErrorType.UNKNOWN_ERROR;
    wrappedError.context = {
      ...originalError.context,
      ...additionalContext
    };
    wrappedError.timestamp = new Date().toISOString();
    return wrappedError;
  }

  /**
   * Validate error type
   * 
   * @param {string} errorType - Error type to validate
   * @returns {boolean} True if error type is valid
   */
  isValidErrorType(errorType) {
    return Object.values(ErrorType).includes(errorType);
  }

  /**
   * Validate retry policy
   * 
   * @param {string} retryPolicy - Retry policy to validate
   * @returns {boolean} True if retry policy is valid
   */
  isValidRetryPolicy(retryPolicy) {
    return Object.values(RetryPolicy).includes(retryPolicy);
  }

  /**
   * Get all error types
   * 
   * @returns {Array<string>} List of error types
   */
  getErrorTypes() {
    return Object.values(ErrorType);
  }

  /**
   * Get all retry policies
   * 
   * @returns {Array<string>} List of retry policies
   */
  getRetryPolicies() {
    return Object.values(RetryPolicy);
  }
}

module.exports = {
  ErrorHandler,
  ErrorType,
  RetryPolicy
};