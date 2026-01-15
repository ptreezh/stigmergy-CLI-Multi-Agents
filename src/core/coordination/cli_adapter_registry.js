/**
 * CLI Adapter Registry for Unified CLI Adapter Management
 * 
 * This registry handles CLI adapter management by:
 * - Registering and discovering CLI adapters
 * - Managing adapter lifecycle
 * - Handling adapter conflicts
 * - Providing adapter status monitoring
 * - Supporting dynamic adapter loading
 * 
 * @module CliAdapterRegistry
 */

const { EventEmitter } = require('events');

class CLIAdapterRegistry extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableAutoDiscovery: options.enableAutoDiscovery !== false,
      enableConflictDetection: options.enableConflictDetection !== false,
      enableHealthMonitoring: options.enableHealthMonitoring !== false,
      healthCheckInterval: options.healthCheckInterval || 30000, // 30 seconds
      adapterBasePath: options.adapterBasePath || './src/adapters',
      ...options
    };
    
    // Adapter registry state
    this.state = {
      adapters: new Map(),
      adapterStatus: new Map(),
      adapterStatistics: new Map(),
      healthCheckIntervalId: null
    };
    
    // Initialize registry
    this._initialize();
  }

  /**
   * Initialize the registry
   * 
   * @private
   */
  _initialize() {
    // Start health monitoring
    if (this.options.enableHealthMonitoring) {
      this._startHealthMonitoring();
    }
    
    // Auto-discover adapters if enabled
    if (this.options.enableAutoDiscovery) {
      this._autoDiscoverAdapters();
    }
  }

  /**
   * Register a CLI adapter
   * 
   * @param {Object} adapterConfig - Adapter configuration
   * @returns {Promise<boolean>} True if registration successful
   */
  async registerAdapter(adapterConfig) {
    try {
      // Validate adapter configuration
      if (!adapterConfig.name || !adapterConfig.version || !adapterConfig.implementation) {
        throw new Error('Invalid adapter configuration: missing required fields');
      }
      
      // Check for conflicts
      if (this.options.enableConflictDetection) {
        const conflict = this._checkConflict(adapterConfig);
        if (conflict) {
          this.emit('conflict', {
            adapter: adapterConfig.name,
            conflict: conflict,
            timestamp: new Date().toISOString()
          });
          throw new Error(`Adapter conflict detected: ${conflict}`);
        }
      }
      
      // Create adapter instance
      const adapterInstance = {
        ...adapterConfig,
        registeredAt: new Date().toISOString(),
        status: 'active',
        health: 'unknown'
      };
      
      // Initialize adapter
      await this._initializeAdapter(adapterInstance);
      
      // Register adapter
      this.state.adapters.set(adapterConfig.name, adapterInstance);
      this.state.adapterStatus.set(adapterConfig.name, 'active');
      this.state.adapterStatistics.set(adapterConfig.name, {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageResponseTime: 0,
        lastCalled: null
      });
      
      // Emit registration event
      this.emit('registered', {
        adapter: adapterConfig.name,
        version: adapterConfig.version,
        timestamp: new Date().toISOString()
      });
      
      return true;
      
    } catch (error) {
      this.emit('registration-error', {
        adapter: adapterConfig.name,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  /**
   * Unregister a CLI adapter
   * 
   * @param {string} adapterName - Adapter name
   * @returns {Promise<boolean>} True if unregistration successful
   */
  async unregisterAdapter(adapterName) {
    try {
      // Check if adapter exists
      if (!this.state.adapters.has(adapterName)) {
        throw new Error(`Adapter '${adapterName}' not found`);
      }
      
      const adapter = this.state.adapters.get(adapterName);
      
      // Cleanup adapter
      await this._cleanupAdapter(adapter);
      
      // Remove from registry
      this.state.adapters.delete(adapterName);
      this.state.adapterStatus.delete(adapterName);
      this.state.adapterStatistics.delete(adapterName);
      
      // Emit unregistration event
      this.emit('unregistered', {
        adapter: adapterName,
        timestamp: new Date().toISOString()
      });
      
      return true;
      
    } catch (error) {
      this.emit('unregistration-error', {
        adapter: adapterName,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  /**
   * Get an adapter instance
   * 
   * @param {string} adapterName - Adapter name
   * @returns {Object|null} Adapter instance or null
   */
  getAdapter(adapterName) {
    const adapter = this.state.adapters.get(adapterName);
    
    if (!adapter) {
      return null;
    }
    
    // Update statistics
    const stats = this.state.adapterStatistics.get(adapterName);
    if (stats) {
      stats.totalCalls++;
      stats.lastCalled = new Date().toISOString();
    }
    
    return adapter;
  }

  /**
   * Get all registered adapters
   * 
   * @returns {Array<Object>} List of registered adapters
   */
  getAllAdapters() {
    return Array.from(this.state.adapters.values());
  }

  /**
   * Get adapter status
   * 
   * @param {string} adapterName - Adapter name
   * @returns {Object|null} Adapter status or null
   */
  getAdapterStatus(adapterName) {
    const status = this.state.adapterStatus.get(adapterName);
    const health = this.state.adapters.get(adapterName)?.health;
    
    if (!status) {
      return null;
    }
    
    return {
      name: adapterName,
      status: status,
      health: health,
      registeredAt: this.state.adapters.get(adapterName)?.registeredAt
    };
  }

  /**
   * Get adapter statistics
   * 
   * @param {string} adapterName - Adapter name
   * @returns {Object|null} Adapter statistics or null
   */
  getAdapterStatistics(adapterName) {
    return this.state.adapterStatistics.get(adapterName) || null;
  }

  /**
   * Get all adapter statuses
   * 
   * @returns {Array<Object>} List of adapter statuses
   */
  getAllAdapterStatuses() {
    const statuses = [];
    
    for (const [name, status] of this.state.adapterStatus.entries()) {
      const adapter = this.state.adapters.get(name);
      statuses.push({
        name: name,
        status: status,
        health: adapter?.health,
        registeredAt: adapter?.registeredAt
      });
    }
    
    return statuses;
  }

  /**
   * Check if an adapter is registered
   * 
   * @param {string} adapterName - Adapter name
   * @returns {boolean} True if adapter is registered
   */
  isAdapterRegistered(adapterName) {
    return this.state.adapters.has(adapterName);
  }

  /**
   * Update adapter status
   * 
   * @param {string} adapterName - Adapter name
   * @param {string} status - New status
   */
  updateAdapterStatus(adapterName, status) {
    if (this.state.adapterStatus.has(adapterName)) {
      this.state.adapterStatus.set(adapterName, status);
      
      this.emit('status-updated', {
        adapter: adapterName,
        status: status,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update adapter health
   * 
   * @param {string} adapterName - Adapter name
   * @param {string} health - Health status
   */
  updateAdapterHealth(adapterName, health) {
    const adapter = this.state.adapters.get(adapterName);
    if (adapter) {
      adapter.health = health;
      
      this.emit('health-updated', {
        adapter: adapterName,
        health: health,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update adapter statistics
   * 
   * @param {string} adapterName - Adapter name
   * @param {Object} statsUpdate - Statistics update
   */
  updateAdapterStatistics(adapterName, statsUpdate) {
    const stats = this.state.adapterStatistics.get(adapterName);
    if (stats) {
      Object.assign(stats, statsUpdate);
    }
  }

  /**
   * Check for adapter conflicts
   * 
   * @param {Object} adapterConfig - Adapter configuration
   * @returns {string|null} Conflict description or null
   * @private
   */
  _checkConflict(adapterConfig) {
    // Check for name conflict
    if (this.state.adapters.has(adapterConfig.name)) {
      return `Adapter with name '${adapterConfig.name}' already exists`;
    }
    
    // Check for implementation conflict
    for (const [name, adapter] of this.state.adapters.entries()) {
      if (adapter.implementation === adapterConfig.implementation) {
        return `Adapter '${name}' uses the same implementation`;
      }
    }
    
    return null;
  }

  /**
   * Initialize an adapter
   * 
   * @param {Object} adapter - Adapter instance
   * @returns {Promise<void>}
   * @private
   */
  async _initializeAdapter(adapter) {
    try {
      // Call adapter initialization if available
      if (adapter.implementation && typeof adapter.implementation.initialize === 'function') {
        await adapter.implementation.initialize();
      }
      
      // Set initial health status
      adapter.health = 'healthy';
      
    } catch (error) {
      adapter.health = 'unhealthy';
      throw new Error(`Failed to initialize adapter '${adapter.name}': ${error.message}`);
    }
  }

  /**
   * Cleanup an adapter
   * 
   * @param {Object} adapter - Adapter instance
   * @returns {Promise<void>}
   * @private
   */
  async _cleanupAdapter(adapter) {
    try {
      // Call adapter cleanup if available
      if (adapter.implementation && typeof adapter.implementation.cleanup === 'function') {
        await adapter.implementation.cleanup();
      }
      
    } catch (error) {
      console.error(`[CliAdapterRegistry] Error cleaning up adapter '${adapter.name}': ${error.message}`);
    }
  }

  /**
   * Auto-discover adapters
   * 
   * @private
   */
  async _autoDiscoverAdapters() {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const adapterPath = path.resolve(this.options.adapterBasePath);
      
      if (!fs.existsSync(adapterPath)) {
        console.log(`[CliAdapterRegistry] Adapter base path not found: ${adapterPath}`);
        return;
      }
      
      const files = fs.readdirSync(adapterPath);
      
      for (const file of files) {
        if (file.endsWith('.js') && !file.startsWith('.')) {
          const adapterName = file.replace('.js', '');
          
          try {
            const adapterModule = require(path.join(adapterPath, file));
            
            if (adapterModule && typeof adapterModule === 'function') {
              const adapterConfig = {
                name: adapterName,
                version: '1.0.0',
                implementation: adapterModule,
                autoDiscovered: true
              };
              
              await this.registerAdapter(adapterConfig);
            }
          } catch (error) {
            console.error(`[CliAdapterRegistry] Error loading adapter '${adapterName}': ${error.message}`);
          }
        }
      }
      
    } catch (error) {
      console.error(`[CliAdapterRegistry] Error auto-discovering adapters: ${error.message}`);
    }
  }

  /**
   * Start health monitoring
   * 
   * @private
   */
  _startHealthMonitoring() {
    this.state.healthCheckIntervalId = setInterval(() => {
      this._performHealthChecks();
    }, this.options.healthCheckInterval);
  }

  /**
   * Perform health checks on all adapters
   * 
   * @private
   */
  async _performHealthChecks() {
    for (const [name, adapter] of this.state.adapters.entries()) {
      try {
        // Check if adapter is healthy
        let isHealthy = true;
        
        if (adapter.implementation && typeof adapter.implementation.healthCheck === 'function') {
          isHealthy = await adapter.implementation.healthCheck();
        }
        
        // Update health status
        const newHealth = isHealthy ? 'healthy' : 'unhealthy';
        
        if (adapter.health !== newHealth) {
          this.updateAdapterHealth(name, newHealth);
        }
        
      } catch (error) {
        this.updateAdapterHealth(name, 'unhealthy');
        console.error(`[CliAdapterRegistry] Health check failed for adapter '${name}': ${error.message}`);
      }
    }
  }

  /**
   * Get registry statistics
   * 
   * @returns {Object} Registry statistics
   */
  getStatistics() {
    const stats = {
      totalAdapters: this.state.adapters.size,
      activeAdapters: 0,
      unhealthyAdapters: 0,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0
    };
    
    // Count adapter statuses
    for (const [name, status] of this.state.adapterStatus.entries()) {
      if (status === 'active') {
        stats.activeAdapters++;
      }
    }
    
    // Count unhealthy adapters
    for (const adapter of this.state.adapters.values()) {
      if (adapter.health === 'unhealthy') {
        stats.unhealthyAdapters++;
      }
    }
    
    // Aggregate statistics
    for (const adapterStats of this.state.adapterStatistics.values()) {
      stats.totalCalls += adapterStats.totalCalls;
      stats.successfulCalls += adapterStats.successfulCalls;
      stats.failedCalls += adapterStats.failedCalls;
    }
    
    // Calculate success rate
    if (stats.totalCalls > 0) {
      stats.successRate = ((stats.successfulCalls / stats.totalCalls) * 100).toFixed(2) + '%';
    } else {
      stats.successRate = '0%';
    }
    
    return stats;
  }

  /**
   * Shutdown the registry
   * 
   * @returns {Promise<void>}
   */
  async shutdown() {
    // Stop health monitoring
    if (this.state.healthCheckIntervalId) {
      clearInterval(this.state.healthCheckIntervalId);
      this.state.healthCheckIntervalId = null;
    }
    
    // Cleanup all adapters
    const adapterNames = Array.from(this.state.adapters.keys());
    
    for (const adapterName of adapterNames) {
      try {
        await this.unregisterAdapter(adapterName);
      } catch (error) {
        console.error(`[CliAdapterRegistry] Error unregistering adapter '${adapterName}': ${error.message}`);
      }
    }
    
    // Emit shutdown event
    this.emit('shutdown', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Reload all adapters
   * 
   * @returns {Promise<number>} Number of adapters reloaded
   */
  async reloadAdapters() {
    const adapterNames = Array.from(this.state.adapters.keys());
    let reloadedCount = 0;
    
    for (const adapterName of adapterNames) {
      try {
        const adapter = this.state.adapters.get(adapterName);
        
        // Reload adapter implementation
        if (adapter.implementation && typeof adapter.implementation.reload === 'function') {
          await adapter.implementation.reload();
          reloadedCount++;
        }
      } catch (error) {
        console.error(`[CliAdapterRegistry] Error reloading adapter '${adapterName}': ${error.message}`);
      }
    }
    
    return reloadedCount;
  }

  /**
   * Get adapter by capability
   * 
   * @param {string} capability - Required capability
   * @returns {Array<Object>} List of adapters with the capability
   */
  getAdaptersByCapability(capability) {
    const matchingAdapters = [];
    
    for (const [name, adapter] of this.state.adapters.entries()) {
      if (adapter.capabilities && adapter.capabilities.includes(capability)) {
        matchingAdapters.push(adapter);
      }
    }
    
    return matchingAdapters;
  }

  /**
   * Validate adapter configuration
   * 
   * @param {Object} adapterConfig - Adapter configuration
   * @returns {Object} Validation result
   */
  validateAdapterConfig(adapterConfig) {
    const errors = [];
    const warnings = [];
    
    // Check required fields
    if (!adapterConfig.name) {
      errors.push('Missing required field: name');
    }
    
    if (!adapterConfig.version) {
      errors.push('Missing required field: version');
    }
    
    if (!adapterConfig.implementation) {
      errors.push('Missing required field: implementation');
    }
    
    // Check for deprecated fields
    if (adapterConfig.deprecated) {
      warnings.push('Adapter is marked as deprecated');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }

  /**
   * Export adapter registry state
   * 
   * @returns {Object} Registry state
   */
  exportState() {
    return {
      adapters: Array.from(this.state.adapters.entries()).map(([name, adapter]) => ({
        name: name,
        version: adapter.version,
        status: this.state.adapterStatus.get(name),
        health: adapter.health,
        registeredAt: adapter.registeredAt
      })),
      statistics: this.getStatistics(),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import adapter registry state
   * 
   * @param {Object} state - Registry state to import
   * @returns {Promise<number>} Number of adapters imported
   */
  async importState(state) {
    if (!state || !state.adapters) {
      throw new Error('Invalid state format');
    }
    
    let importedCount = 0;
    
    for (const adapterData of state.adapters) {
      try {
        const adapterConfig = {
          name: adapterData.name,
          version: adapterData.version,
          implementation: null, // Implementation needs to be provided separately
          imported: true
        };
        
        await this.registerAdapter(adapterConfig);
        importedCount++;
      } catch (error) {
        console.error(`[CliAdapterRegistry] Error importing adapter '${adapterData.name}': ${error.message}`);
      }
    }
    
    return importedCount;
  }
}

module.exports = CLIAdapterRegistry;