// src/core/coordination/nodejs/index.js
const AdapterManager = require('./AdapterManager');
const CLCommunication = require('./CLCommunication');
const StatisticsCollector = require('./StatisticsCollector');
const HealthChecker = require('./HealthChecker');

class NodeJsCoordinationLayer {
  constructor() {
    this.adapterManager = new AdapterManager();
    this.communication = new CLCommunication();
    this.statistics = new StatisticsCollector();
    this.healthChecker = new HealthChecker();
  }

  async initialize(options = {}) {
    try {
      console.log(
        '[NODEJS_COORDINATION] Initializing Node.js coordination layer...',
      );

      // Initialize components
      await this.adapterManager.initialize();
      await this.communication.initialize();
      this.statistics.initialize();

      // Perform health check
      const health = await this.healthChecker.checkHealth();
      if (!health.healthy) {
        console.warn(
          '[NODEJS_COORDINATION] Health check issues detected:',
          health,
        );
      }

      console.log(
        '[NODEJS_COORDINATION] Node.js coordination layer initialized successfully',
      );
      return true;
    } catch (error) {
      console.error(
        '[NODEJS_COORDINATION] Failed to initialize Node.js coordination layer:',
        error,
      );
      return false;
    }
  }

  async executeCrossCLITask(sourceCLI, targetCLI, task, context = {}) {
    this.statistics.incrementCounter('cross_cli_calls');
    const startTime = Date.now();

    try {
      const result = await this.communication.executeTask(
        sourceCLI,
        targetCLI,
        task,
        context,
      );
      this.statistics.recordExecutionTime(Date.now() - startTime);
      this.statistics.incrementCounter('successful_calls');
      return result;
    } catch (error) {
      this.statistics.incrementCounter('failed_calls');
      console.error(
        '[NODEJS_COORDINATION] Cross-CLI task execution failed:',
        error,
      );
      throw error;
    }
  }

  async getAdapterStatistics(cliName) {
    return this.statistics.getAdapterStats(cliName);
  }

  async getSystemStatus() {
    return {
      implementation: 'nodejs',
      health: await this.healthChecker.checkHealth(),
      statistics: this.statistics.getAllStats(),
      adapters: await this.adapterManager.listAdapters(),
    };
  }

  async healthCheck() {
    return await this.healthChecker.checkHealth();
  }
}

module.exports = NodeJsCoordinationLayer;
