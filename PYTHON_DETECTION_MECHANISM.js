// Complete Python Detection and Graceful Degradation Mechanism

// Feature Detection for Python Capabilities
// src/utils/pythonFeatureDetector.js
const { spawnSync } = require('child_process');

class PythonFeatureDetector {
  constructor() {
    this.featureCache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Check if Python has required packages installed
   * @param {Array<string>} requiredPackages - List of required packages
   * @returns {Promise<Object>} Package availability status
   */
  async checkRequiredPackages(requiredPackages = []) {
    if (requiredPackages.length === 0) {
      return { allAvailable: true, missing: [] };
    }

    const cacheKey = `packages_${requiredPackages.sort().join(',')}`;
    if (this.isFeatureCached(cacheKey)) {
      return this.featureCache.get(cacheKey).data;
    }

    try {
      const pythonCmd = await require('./pythonDetector').getPythonCommand();
      if (!pythonCmd) {
        throw new Error('Python not available');
      }

      // Check each package
      const results = {};
      const missing = [];

      for (const pkg of requiredPackages) {
        try {
          const result = spawnSync(pythonCmd, ['-c', `
import ${pkg}
print("AVAILABLE")
          `], {
            timeout: 5000,
            stdio: ['pipe', 'pipe', 'pipe']
          });

          results[pkg] = result.status === 0 && 
                        result.stdout.toString().includes('AVAILABLE');
          
          if (!results[pkg]) {
            missing.push(pkg);
          }
        } catch (error) {
          results[pkg] = false;
          missing.push(pkg);
        }
      }

      const result = {
        allAvailable: missing.length === 0,
        missing,
        details: results
      };

      // Cache the result
      this.featureCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      return {
        allAvailable: false,
        missing: requiredPackages,
        error: error.message
      };
    }
  }

  /**
   * Check Python virtual environment status
   * @returns {Promise<Object>} Virtual environment information
   */
  async checkVirtualEnvironment() {
    const cacheKey = 'venv';
    if (this.isFeatureCached(cacheKey)) {
      return this.featureCache.get(cacheKey).data;
    }

    try {
      const pythonCmd = await require('./pythonDetector').getPythonCommand();
      if (!pythonCmd) {
        throw new Error('Python not available');
      }

      const result = spawnSync(pythonCmd, ['-c', `
import sys, os
venv = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
venv_path = sys.prefix if venv else None
print(f"IN_VENV:{venv}")
print(f"VENV_PATH:{venv_path or 'None'}")
print(f"PYTHON_PATH:{sys.executable}")
      `], {
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      if (result.status === 0) {
        const output = result.stdout.toString();
        const lines = output.split('\n');
        const info = {};

        lines.forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            info[key.toLowerCase()] = valueParts.join(':').trim();
          }
        });

        const resultData = {
          inVirtualEnv: info.in_venv === 'True',
          virtualEnvPath: info.venv_path !== 'None' ? info.venv_path : null,
          pythonPath: info.python_path
        };

        // Cache the result
        this.featureCache.set(cacheKey, {
          data: resultData,
          timestamp: Date.now()
        });

        return resultData;
      }
    } catch (error) {
      const resultData = {
        inVirtualEnv: false,
        virtualEnvPath: null,
        pythonPath: null,
        error: error.message
      };

      // Cache the result
      this.featureCache.set(cacheKey, {
        data: resultData,
        timestamp: Date.now()
      });

      return resultData;
    }

    return {
      inVirtualEnv: false,
      virtualEnvPath: null,
      pythonPath: null
    };
  }

  /**
   * Check if feature result is cached and valid
   * @param {string} key - Cache key
   * @returns {boolean} Cache validity
   */
  isFeatureCached(key) {
    const cached = this.featureCache.get(key);
    if (!cached) return false;
    return (Date.now() - cached.timestamp) < this.cacheTimeout;
  }

  /**
   * Clear feature cache
   */
  clearCache() {
    this.featureCache.clear();
  }
}

module.exports = new PythonFeatureDetector();

// Coordination Layer Manager with Degradation Support
// src/core/coordination/index.js
const pythonDetector = require('../../utils/pythonDetector');
const PythonFeatureDetector = require('../../utils/pythonFeatureDetector');
const CoordinationLayerSelector = require('./selector');
const degradationHandler = require('./degradationHandler');

class CoordinationLayerManager {
  constructor() {
    this.selector = new CoordinationLayerSelector();
    this.activeLayer = null;
    this.layerInstances = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the coordination layer manager
   * @param {Object} options - Initialization options
   * @returns {Promise<boolean>} Initialization success
   */
  async initialize(options = {}) {
    try {
      console.log('[COORDINATION] Initializing coordination layer manager...');

      // Detect Python availability and features
      const pythonAvailable = await pythonDetector.isPythonAvailable();
      console.log(`[COORDINATION] Python available: ${pythonAvailable}`);

      if (pythonAvailable) {
        const pythonVersion = await pythonDetector.getPythonVersion();
        const pythonEnv = await PythonFeatureDetector.checkVirtualEnvironment();
        console.log(`[COORDINATION] Python version: ${pythonVersion}`);
        console.log(`[COORDINATION] Virtual environment: ${pythonEnv.inVirtualEnv ? 'Yes' : 'No'}`);
      }

      // Select appropriate coordination layer
      const selectedLayer = await this.selector.selectLayer(options);
      console.log(`[COORDINATION] Selected layer: ${selectedLayer}`);

      // Initialize the selected layer
      const success = await this.initializeLayer(selectedLayer, options);
      
      if (success) {
        this.initialized = true;
        console.log('[COORDINATION] Coordination layer manager initialized successfully');
        return true;
      } else {
        throw new Error('Failed to initialize coordination layer');
      }
    } catch (error) {
      console.error('[COORDINATION] Failed to initialize coordination layer manager:', error);
      
      // Attempt graceful degradation
      if (options.allowDegradation !== false) {
        return await this.attemptDegradation(options, error);
      }
      
      throw error;
    }
  }

  /**
   * Initialize specific coordination layer
   * @param {string} layerType - Layer type ('nodejs' or 'python')
   * @param {Object} options - Initialization options
   * @returns {Promise<boolean>} Initialization success
   */
  async initializeLayer(layerType, options = {}) {
    try {
      let layerInstance;

      switch (layerType) {
        case 'nodejs':
          // Lazy load Node.js coordination layer
          const { NodeJsCoordinationLayer } = await import('./nodejs/index.mjs');
          layerInstance = new NodeJsCoordinationLayer();
          break;

        case 'python':
          // Lazy load Python coordination layer wrapper
          const { PythonCoordinationLayerWrapper } = await import('./python/index.mjs');
          layerInstance = new PythonCoordinationLayerWrapper();
          break;

        default:
          throw new Error(`Unknown coordination layer type: ${layerType}`);
      }

      // Initialize the layer
      const initSuccess = await layerInstance.initialize(options);
      
      if (initSuccess) {
        this.activeLayer = layerInstance;
        this.layerInstances.set(layerType, layerInstance);
        console.log(`[COORDINATION] ${layerType} coordination layer initialized`);
        return true;
      } else {
        console.error(`[COORDINATION] Failed to initialize ${layerType} coordination layer`);
        return false;
      }
    } catch (error) {
      console.error(`[COORDINATION] Error initializing ${layerType} coordination layer:`, error);
      return false;
    }
  }

  /**
   * Attempt graceful degradation when primary layer fails
   * @param {Object} options - Initialization options
   * @param {Error} originalError - Original error that caused failure
   * @returns {Promise<boolean>} Degradation success
   */
  async attemptDegradation(options, originalError) {
    try {
      console.warn('[COORDINATION] Attempting graceful degradation...');

      // Determine fallback layer
      const currentSelection = await this.selector.selectLayer(options);
      const fallbackLayer = currentSelection === 'nodejs' ? 'python' : 'nodejs';

      // Check if fallback is available
      if (fallbackLayer === 'python') {
        const pythonAvailable = await pythonDetector.isPythonAvailable();
        if (!pythonAvailable) {
          throw new Error('Python not available for fallback');
        }
      }

      // Record degradation event
      degradationHandler.handleDegradation(
        currentSelection,
        fallbackLayer,
        'Initialization failure',
        originalError
      );

      // Try to initialize fallback layer
      console.log(`[COORDINATION] Switching to ${fallbackLayer} as fallback`);
      const success = await this.initializeLayer(fallbackLayer, {
        ...options,
        forceLayer: fallbackLayer
      });

      if (success) {
        console.log('[COORDINATION] Graceful degradation successful');
        return true;
      } else {
        throw new Error(`Failed to initialize fallback ${fallbackLayer} layer`);
      }
    } catch (degradationError) {
      console.error('[COORDINATION] Graceful degradation failed:', degradationError);
      return false;
    }
  }

  /**
   * Execute cross-CLI task using active coordination layer
   * @param {string} sourceCLI - Source CLI name
   * @param {string} targetCLI - Target CLI name
   * @param {string} task - Task to execute
   * @param {Object} context - Execution context
   * @returns {Promise<any>} Task result
   */
  async executeCrossCLITask(sourceCLI, targetCLI, task, context = {}) {
    if (!this.initialized || !this.activeLayer) {
      throw new Error('Coordination layer manager not initialized');
    }

    try {
      return await this.activeLayer.executeCrossCLITask(sourceCLI, targetCLI, task, context);
    } catch (error) {
      console.error('[COORDINATION] Error executing cross-CLI task:', error);
      
      // Depending on error type, we might attempt recovery
      throw error;
    }
  }

  /**
   * Get system status from active coordination layer
   * @returns {Promise<Object>} System status
   */
  async getSystemStatus() {
    if (!this.initialized || !this.activeLayer) {
      return {
        implementation: 'uninitialized',
        health: false,
        error: 'Coordination layer manager not initialized'
      };
    }

    try {
      return await this.activeLayer.getSystemStatus();
    } catch (error) {
      return {
        implementation: this.activeLayer.constructor.name,
        health: false,
        error: error.message
      };
    }
  }

  /**
   * Perform health check
   * @returns {Promise<boolean>} Health status
   */
  async healthCheck() {
    if (!this.initialized || !this.activeLayer) {
      return false;
    }

    try {
      return await this.activeLayer.healthCheck();
    } catch (error) {
      console.error('[COORDINATION] Health check failed:', error);
      return false;
    }
  }

  /**
   * Get information about current coordination layer selection
   * @returns {Promise<Object>} Selection information
   */
  async getSelectionInfo() {
    return await this.selector.getSelectionInfo();
  }

  /**
   * Switch to specific coordination layer (for testing/administration)
   * @param {string} layerType - Layer type to switch to
   * @param {Object} options - Switch options
   * @returns {Promise<boolean>} Switch success
   */
  async switchLayer(layerType, options = {}) {
    try {
      console.log(`[COORDINATION] Switching to ${layerType} coordination layer`);

      // Initialize the new layer
      const success = await this.initializeLayer(layerType, {
        ...options,
        forceLayer: layerType
      });

      if (success) {
        console.log(`[COORDINATION] Successfully switched to ${layerType} coordination layer`);
        return true;
      } else {
        console.error(`[COORDINATION] Failed to switch to ${layerType} coordination layer`);
        return false;
      }
    } catch (error) {
      console.error(`[COORDINATION] Error switching to ${layerType} coordination layer:`, error);
      return false;
    }
  }
}

module.exports = CoordinationLayerManager;
