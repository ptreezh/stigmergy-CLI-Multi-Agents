# Node.js Coordination Layer Design

## 1. Overview
This document details the design of the Node.js coordination layer that will serve as the primary implementation with Python as fallback.

## 2. Architecture

### 2.1 Module Structure
```
src/
└── core/
    └── coordination/
        ├── index.js                  # Main coordination layer manager
        ├── interface.js              # Coordination layer interface definition
        ├── selector.js               # Implementation selector
        ├── nodejs/                   # Node.js implementation
        │   ├── index.js             # Node.js coordination layer entry point
        │   ├── adapterManager.js    # Adapter registry and management
        │   ├── communication.js     # Cross-CLI communication
        │   ├── statistics.js        # Statistics collection
        │   ├── health.js            # Health checking
        │   └── utils/               # Utility functions
        └── python/                  # Python wrapper (existing implementation)
            ├── index.js             # Python coordination layer wrapper
            └── launcher.js          # Python process management
```

### 2.2 Class Diagram
```
CoordinationLayerManager
├── CoordinationLayerSelector
├── NodeJsCoordinationLayer
└── PythonCoordinationLayerWrapper

NodeJsCoordinationLayer
├── AdapterManager
├── CLCommunication
├── StatisticsCollector
└── HealthChecker

PythonCoordinationLayerWrapper
├── PythonProcessManager
└── PythonInterfaceAdapter
```

## 3. Core Components

### 3.1 Coordination Layer Manager
Responsible for selecting and managing the active coordination layer.

```javascript
class CoordinationLayerManager {
  constructor() {
    this.selector = new CoordinationLayerSelector();
    this.activeLayer = null;
  }
  
  async initialize() {
    this.activeLayer = await this.selector.selectLayer();
    return await this.activeLayer.initialize();
  }
  
  async executeCrossCLITask(sourceCLI, targetCLI, task) {
    return await this.activeLayer.executeCrossCLITask(sourceCLI, targetCLI, task);
  }
  
  async getSystemStatus() {
    return await this.activeLayer.getSystemStatus();
  }
}
```

### 3.2 Coordination Layer Interface
Defines the contract that all coordination layer implementations must fulfill.

```javascript
class CoordinationLayerInterface {
  async initialize() {
    throw new Error('Not implemented');
  }
  
  async executeCrossCLITask(sourceCLI, targetCLI, task) {
    throw new Error('Not implemented');
  }
  
  async getAdapterStatistics(cliName) {
    throw new Error('Not implemented');
  }
  
  async getSystemStatus() {
    throw new Error('Not implemented');
  }
  
  async healthCheck() {
    throw new Error('Not implemented');
  }
}
```

### 3.3 Node.js Coordination Layer Implementation

#### 3.3.1 Main Class
```javascript
class NodeJsCoordinationLayer extends CoordinationLayerInterface {
  constructor() {
    super();
    this.adapterManager = new AdapterManager();
    this.communication = new CLCommunication();
    this.statistics = new StatisticsCollector();
    this.healthChecker = new HealthChecker();
  }
  
  async initialize() {
    await this.adapterManager.initialize();
    await this.communication.initialize();
    this.statistics.initialize();
    return await this.healthChecker.checkHealth();
  }
  
  async executeCrossCLITask(sourceCLI, targetCLI, task) {
    this.statistics.incrementCounter('cross_cli_calls');
    const startTime = Date.now();
    
    try {
      const result = await this.communication.executeTask(sourceCLI, targetCLI, task);
      this.statistics.recordExecutionTime(Date.now() - startTime);
      this.statistics.incrementCounter('successful_calls');
      return result;
    } catch (error) {
      this.statistics.incrementCounter('failed_calls');
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
      adapters: await this.adapterManager.listAdapters()
    };
  }
  
  async healthCheck() {
    return await this.healthChecker.checkHealth();
  }
}
```

#### 3.3.2 Adapter Manager
```javascript
class AdapterManager {
  constructor() {
    this.adapters = new Map();
    this.discoveryPaths = [
      './adapters/',
      '../adapters/',
      path.join(os.homedir(), '.stigmergy/adapters/')
    ];
  }
  
  async initialize() {
    await this.discoverAdapters();
  }
  
  async discoverAdapters() {
    for (const basePath of this.discoveryPaths) {
      if (fs.existsSync(basePath)) {
        const adapterDirs = fs.readdirSync(basePath);
        for (const dir of adapterDirs) {
          const adapterPath = path.join(basePath, dir, 'index.js');
          if (fs.existsSync(adapterPath)) {
            try {
              const adapterModule = require(adapterPath);
              const adapter = new adapterModule();
              this.adapters.set(dir, adapter);
            } catch (error) {
              console.warn(`Failed to load adapter from ${adapterPath}:`, error.message);
            }
          }
        }
      }
    }
  }
  
  getAdapter(cliName) {
    return this.adapters.get(cliName.toLowerCase());
  }
  
  async listAdapters() {
    const adapterList = [];
    for (const [name, adapter] of this.adapters) {
      adapterList.push({
        name,
        available: await adapter.isAvailable(),
        version: adapter.version || 'unknown'
      });
    }
    return adapterList;
  }
}
```

#### 3.3.3 Cross-CLI Communication
```javascript
class CLCommunication {
  constructor() {
    this.executionTimeout = 30000; // 30 seconds
  }
  
  async executeTask(sourceCLI, targetCLI, task) {
    const targetAdapter = this.getAdapter(targetCLI);
    if (!targetAdapter) {
      throw new Error(`Adapter for ${targetCLI} not found`);
    }
    
    if (!(await targetAdapter.isAvailable())) {
      throw new Error(`${targetCLI} is not available`);
    }
    
    const context = {
      sourceCLI,
      timestamp: new Date().toISOString(),
      taskId: this.generateTaskId()
    };
    
    return await targetAdapter.executeTask(task, context);
  }
  
  getAdapter(cliName) {
    // This would integrate with the adapter manager
    // Implementation details depend on the existing adapter structure
  }
  
  generateTaskId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### 3.3.4 Statistics Collector
```javascript
class StatisticsCollector {
  constructor() {
    this.counters = {};
    this.timings = {};
    this.startTime = Date.now();
  }
  
  initialize() {
    this.reset();
  }
  
  reset() {
    this.counters = {
      cross_cli_calls: 0,
      successful_calls: 0,
      failed_calls: 0,
      adapter_loads: 0
    };
    this.timings = {
      execution_times: [],
      last_reset: Date.now()
    };
  }
  
  incrementCounter(name) {
    this.counters[name] = (this.counters[name] || 0) + 1;
  }
  
  recordExecutionTime(timeMs) {
    this.timings.execution_times.push(timeMs);
    // Keep only last 1000 timings to prevent memory bloat
    if (this.timings.execution_times.length > 1000) {
      this.timings.execution_times.shift();
    }
  }
  
  getAdapterStats(cliName) {
    return {
      calls: this.counters.cross_cli_calls,
      successRate: this.calculateSuccessRate(),
      averageExecutionTime: this.calculateAverageExecutionTime(),
      uptime: Date.now() - this.startTime
    };
  }
  
  getAllStats() {
    return {
      counters: this.counters,
      timings: {
        ...this.timings,
        averageExecutionTime: this.calculateAverageExecutionTime()
      },
      uptime: Date.now() - this.startTime
    };
  }
  
  calculateSuccessRate() {
    if (this.counters.cross_cli_calls === 0) return 1.0;
    return this.counters.successful_calls / this.counters.cross_cli_calls;
  }
  
  calculateAverageExecutionTime() {
    if (this.timings.execution_times.length === 0) return 0;
    const sum = this.timings.execution_times.reduce((a, b) => a + b, 0);
    return sum / this.timings.execution_times.length;
  }
}
```

#### 3.3.5 Health Checker
```javascript
class HealthChecker {
  constructor() {
    this.checks = [
      'adapter_availability',
      'system_resources',
      'network_connectivity',
      'disk_space'
    ];
  }
  
  async checkHealth() {
    const results = {};
    let overallHealthy = true;
    
    for (const check of this.checks) {
      try {
        results[check] = await this[`check${this.capitalize(check)}`]();
      } catch (error) {
        results[check] = { healthy: false, error: error.message };
        overallHealthy = false;
      }
    }
    
    return {
      healthy: overallHealthy,
      timestamp: new Date().toISOString(),
      checks: results
    };
  }
  
  async checkAdapterAvailability() {
    // Check if core adapters are available
    const essentialAdapters = ['claude', 'gemini'];
    const unavailable = [];
    
    for (const adapterName of essentialAdapters) {
      const adapter = this.getAdapter(adapterName);
      if (adapter && !(await adapter.isAvailable())) {
        unavailable.push(adapterName);
      }
    }
    
    return {
      healthy: unavailable.length === 0,
      unavailableAdapters: unavailable
    };
  }
  
  async checkSystemResources() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      healthy: memUsage.heapUsed < 100 * 1024 * 1024, // Less than 100MB
      memory: memUsage,
      cpu: cpuUsage
    };
  }
  
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
```

## 4. Integration Points

### 4.1 With Existing Python Implementation
The Node.js coordination layer will maintain compatibility with the existing Python implementation through:

1. **Shared Configuration**: Using the same configuration files and formats
2. **Compatible APIs**: Matching the same method signatures and return formats
3. **Consistent State Management**: Using the same state storage mechanisms
4. **Unified Logging**: Following the same logging patterns and formats

### 4.2 With CLI Adapters
The Node.js coordination layer will interact with CLI adapters through:

1. **Adapter Discovery**: Automatically discovering available adapters
2. **Standard Interface**: Using a consistent adapter interface
3. **Lifecycle Management**: Properly initializing and cleaning up adapters
4. **Error Handling**: Consistent error propagation and handling

## 5. Performance Considerations

### 5.1 Memory Management
- Implement proper garbage collection
- Limit cache sizes to prevent memory bloat
- Use streaming for large data transfers
- Monitor memory usage and alert on thresholds

### 5.2 Concurrency
- Use async/await for non-blocking operations
- Implement connection pooling for CLI communications
- Limit concurrent cross-CLI calls
- Use worker threads for CPU-intensive operations

### 5.3 Caching
- Cache adapter discovery results
- Cache CLI availability checks
- Cache frequently accessed configuration
- Implement cache invalidation strategies

## 6. Security Considerations

### 6.1 Input Validation
- Validate all cross-CLI task inputs
- Sanitize user-provided data
- Implement rate limiting
- Prevent command injection attacks

### 6.2 Access Control
- Validate CLI adapter permissions
- Implement authentication for sensitive operations
- Log all cross-CLI activities
- Audit security-sensitive operations

### 6.3 Data Protection
- Encrypt sensitive configuration data
- Protect temporary files and data
- Secure inter-process communication
- Implement secure cleanup procedures

## 7. Error Handling and Recovery

### 7.1 Error Types
- Adapter unavailable errors
- CLI execution failures
- Network connectivity issues
- Resource exhaustion errors
- Configuration errors

### 7.2 Recovery Strategies
- Automatic retry with exponential backoff
- Fallback to alternative adapters
- Graceful degradation of functionality
- Automatic recovery from transient errors

### 7.3 Monitoring and Alerting
- Real-time error monitoring
- Performance degradation alerts
- Resource usage threshold alerts
- Integration with external monitoring systems