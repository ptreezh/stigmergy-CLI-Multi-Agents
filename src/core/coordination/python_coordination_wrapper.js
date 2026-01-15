/**
 * Python Coordination Layer Wrapper
 * 
 * This wrapper provides Python coordination layer support:
 * - Detects Python environment
 * - Calls Python coordination layer if available
 * - Provides same interface as Node.js coordination layer
 * - Handles Python execution errors
 * - Supports fallback to Node.js coordination layer
 * 
 * @module PythonCoordinationWrapper
 */

const { EventEmitter } = require('events');
const { spawn } = require('child_process');
const PythonDetector = require('./python_detector');
const GracefulDegradation = require('./graceful_degradation');

class PythonCoordinationWrapper extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      pythonPath: options.pythonPath || null,
      pythonModule: options.pythonModule || 'coordination_layer',
      enableFallback: options.enableFallback !== false,
      fallbackTimeout: options.fallbackTimeout || 30000,
      ...options
    };
    
    // Initialize Python detector
    this.pythonDetector = new PythonDetector({
      enableCaching: true
    });
    
    // Initialize graceful degradation
    this.degradation = new GracefulDegradation({
      enableLogging: options.enableLogging !== false,
      autoRecovery: options.autoRecovery !== false
    });
    
    // Wrapper state
    this.state = {
      pythonAvailable: false,
      pythonVersion: null,
      pythonPath: null,
      lastCheck: null,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0
    };
    
    // Initialize
    this._initialize();
  }

  /**
   * Initialize the wrapper
   * 
   * @private
   */
  async _initialize() {
    try {
      // Detect Python
      const detection = await this.pythonDetector.detectPython();
      
      this.state.pythonAvailable = detection.installed && detection.valid;
      this.state.pythonVersion = detection.version;
      this.state.pythonPath = detection.path;
      this.state.lastCheck = Date.now();
      
      if (this.state.pythonAvailable) {
        this.emit('python-available', {
          version: this.state.pythonVersion,
          path: this.state.pythonPath
        });
      } else {
        this.emit('python-unavailable', {
          error: detection.error
        });
        
        // Trigger degradation
        if (this.options.enableFallback) {
          await this.degradation.degrade('python-coordination', {
            reason: 'Python not available'
          });
        }
      }
    } catch (error) {
      this.emit('initialization-error', {
        error: error.message
      });
    }
  }

  /**
   * Execute Python coordination function
   * 
   * @param {string} functionName - Function name to call
   * @param {Array} args - Arguments to pass
   * @returns {Promise<Object>} Execution result
   */
  async execute(functionName, args = []) {
    this.state.totalCalls++;
    
    try {
      // Check if Python is available
      if (!this.state.pythonAvailable) {
        throw new Error('Python coordination layer not available');
      }
      
      // Prepare Python script
      const script = this._prepareScript(functionName, args);
      
      // Execute Python script
      const result = await this._executePython(script);
      
      this.state.successfulCalls++;
      
      return {
        success: true,
        result: result,
        executionTime: result.executionTime,
        pythonVersion: this.state.pythonVersion
      };
      
    } catch (error) {
      this.state.failedCalls++;
      
      // Log error
      console.error(`[PythonCoordinationWrapper] Execution failed:`, error.message);
      
      // Emit error event
      this.emit('execution-error', {
        functionName,
        error: error.message,
        timestamp: Date.now()
      });
      
      // Try fallback
      if (this.options.enableFallback) {
        const fallbackResult = await this._tryFallback(functionName, args);
        return fallbackResult;
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Prepare Python script for execution
   * 
   * @param {string} functionName - Function name
   * @param {Array} args - Arguments
   * @returns {string} Python script
   * @private
   */
  _prepareScript(functionName, args) {
    const argsJSON = JSON.stringify(args);
    
    return `
import sys
import json
try:
    from ${this.options.pythonModule} import ${functionName}
except ImportError:
    print(json.dumps({
        'error': 'Module or function not found',
        'module': '${this.options.pythonModule}',
        'function': '${functionName}'
    }))
    sys.exit(1)

try:
    args = ${argsJSON}
    result = ${functionName}(*args)
    print(json.dumps({
        'success': True,
        'result': result
    }))
except Exception as e:
    print(json.dumps({
        'error': str(e),
        'type': type(e).__name__
    }))
    sys.exit(1)
`;
  }

  /**
   * Execute Python script
   * 
   * @param {string} script - Python script
   * @returns {Promise<Object>} Execution result
   * @private
   */
  _executePython(script) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const pythonPath = this.options.pythonPath || this.state.pythonPath;
      
      if (!pythonPath) {
        reject(new Error('Python path not available'));
        return;
      }
      
      const childProcess = spawn(pythonPath, ['-c', script], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });
      
      let stdout = '';
      let stderr = '';
      
      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      let timeoutHandle;
      
      childProcess.on('close', (code) => {
        clearTimeout(timeoutHandle);
        
        const executionTime = Date.now() - startTime;
        
        if (code === 0) {
          try {
            const result = JSON.parse(stdout.trim());
            resolve({
              ...result,
              executionTime
            });
          } catch (error) {
            reject(new Error('Failed to parse Python output'));
          }
        } else {
          reject(new Error(stderr || 'Python execution failed'));
        }
      });
      
      childProcess.on('error', (error) => {
        clearTimeout(timeoutHandle);
        reject(error);
      });
      
      // Timeout
      timeoutHandle = setTimeout(() => {
        childProcess.kill();
        reject(new Error('Python execution timeout'));
      }, this.options.fallbackTimeout);
    });
  }

  /**
   * Try fallback to Node.js coordination layer
   * 
   * @param {string} functionName - Function name
   * @param {Array} args - Arguments
   * @returns {Promise<Object>} Fallback result
   * @private
   */
  async _tryFallback(functionName, args) {
    try {
      const degradationResult = await this.degradation.degrade('python-coordination', {
        functionName,
        args
      });
      
      if (degradationResult.degraded) {
        return {
          success: true,
          fallback: true,
          strategy: degradationResult.fallback.strategy,
          result: degradationResult.fallback,
          message: 'Fallback to Node.js coordination layer'
        };
      }
      
      return {
        success: false,
        fallback: false,
        error: 'No fallback available'
      };
      
    } catch (error) {
      return {
        success: false,
        fallback: false,
        error: error.message
      };
    }
  }

  /**
   * Check if Python coordination layer is available
   * 
   * @returns {Promise<boolean>} True if available
   */
  async isAvailable() {
    if (!this.state.pythonAvailable) {
      return false;
    }
    
    // Try to execute a simple function
    try {
      const result = await this.execute('ping', []);
      return result.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get wrapper statistics
   * 
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      ...this.state,
      successRate: this.state.totalCalls > 0
        ? (this.state.successfulCalls / this.state.totalCalls * 100).toFixed(2) + '%'
        : '0%',
      pythonAvailable: this.state.pythonAvailable,
      degradationState: this.degradation.getState()
    };
  }

  /**
   * Refresh Python availability
   * 
   * @returns {Promise<Object>} Refresh result
   */
  async refresh() {
    try {
      await this._initialize();
      
      return {
        refreshed: true,
        pythonAvailable: this.state.pythonAvailable,
        pythonVersion: this.state.pythonVersion
      };
    } catch (error) {
      return {
        refreshed: false,
        error: error.message
      };
    }
  }

  /**
   * Register custom fallback strategy
   * 
   * @param {string} name - Strategy name
   * @param {Object} strategy - Strategy configuration
   */
  registerFallbackStrategy(name, strategy) {
    this.degradation.registerStrategy(name, strategy);
  }

  /**
   * Attempt recovery from degraded state
   * 
   * @returns {Promise<Object>} Recovery result
   */
  async recover() {
    const result = await this.degradation.recover('python-coordination');
    
    if (result.recovered) {
      await this.refresh();
    }
    
    return result;
  }
}

module.exports = PythonCoordinationWrapper;