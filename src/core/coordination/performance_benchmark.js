/**
 * Performance Benchmarking Tool
 * 
 * This tool measures and analyzes system performance:
 * - CPU usage
 * - Memory usage
 * - Response times
 * - Throughput
 * - Latency
 * 
 * @module PerformanceBenchmark
 */

const { EventEmitter } = require('events');
const { performance } = require('perf_hooks');

class PerformanceBenchmark extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      enableCpuMonitoring: options.enableCpuMonitoring !== false,
      enableMemoryMonitoring: options.enableMemoryMonitoring !== false,
      sampleInterval: options.sampleInterval || 1000, // 1 second
      maxSamples: options.maxSamples || 1000,
      ...options
    };
    
    // Performance metrics
    this.metrics = {
      cpu: [],
      memory: [],
      responseTimes: [],
      throughput: [],
      latency: [],
      custom: new Map()
    };
    
    // Benchmark state
    this.state = {
      isRunning: false,
      startTime: null,
      endTime: null,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0
    };
    
    // Sampling interval
    this.samplingInterval = null;
  }

  /**
   * Start performance monitoring
   */
  start() {
    if (this.state.isRunning) {
      return;
    }
    
    this.state.isRunning = true;
    this.state.startTime = performance.now();
    
    // Start sampling
    this.samplingInterval = setInterval(() => {
      this._collectMetrics();
    }, this.options.sampleInterval);
    
    this.emit('started', { timestamp: Date.now() });
  }

  /**
   * Stop performance monitoring
   */
  stop() {
    if (!this.state.isRunning) {
      return;
    }
    
    this.state.isRunning = false;
    this.state.endTime = performance.now();
    
    // Stop sampling
    if (this.samplingInterval) {
      clearInterval(this.samplingInterval);
      this.samplingInterval = null;
    }
    
    this.emit('stopped', { timestamp: Date.now() });
  }

  /**
   * Collect performance metrics
   * 
   * @private
   */
  _collectMetrics() {
    if (this.options.enableMemoryMonitoring) {
      this._collectMemoryMetrics();
    }
    
    if (this.options.enableCpuMonitoring) {
      this._collectCpuMetrics();
    }
    
    // Trim old samples
    this._trimSamples();
  }

  /**
   * Collect memory metrics
   * 
   * @private
   */
  _collectMemoryMetrics() {
    const memoryUsage = process.memoryUsage();
    
    this.metrics.memory.push({
      timestamp: Date.now(),
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers
    });
  }

  /**
   * Collect CPU metrics
   * 
   * @private
   */
  _collectCpuMetrics() {
    const cpuUsage = process.cpuUsage();
    
    this.metrics.cpu.push({
      timestamp: Date.now(),
      user: cpuUsage.user,
      system: cpuUsage.system
    });
  }

  /**
   * Trim old samples to prevent memory bloat
   * 
   * @private
   */
  _trimSamples() {
    if (this.metrics.memory.length > this.options.maxSamples) {
      this.metrics.memory.shift();
    }
    
    if (this.metrics.cpu.length > this.options.maxSamples) {
      this.metrics.cpu.shift();
    }
  }

  /**
   * Measure function execution time
   * 
   * @param {Function} fn - Function to measure
   * @returns {Promise<Object>} Execution result with timing
   */
  async measure(fn) {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    try {
      const result = await fn();
      
      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;
      
      const executionTime = endTime - startTime;
      const memoryDelta = endMemory - startMemory;
      
      // Record metrics
      this.metrics.responseTimes.push({
        timestamp: Date.now(),
        duration: executionTime,
        memoryDelta: memoryDelta,
        success: true
      });
      
      this.state.totalRequests++;
      this.state.successfulRequests++;
      
      return {
        result,
        executionTime,
        memoryDelta,
        success: true
      };
      
    } catch (error) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Record error metrics
      this.metrics.responseTimes.push({
        timestamp: Date.now(),
        duration: executionTime,
        success: false,
        error: error.message
      });
      
      this.state.totalRequests++;
      this.state.failedRequests++;
      
      return {
        error: error.message,
        executionTime,
        success: false
      };
    }
  }

  /**
   * Measure throughput
   * 
   * @param {Function} fn - Function to execute
   * @param {number} iterations - Number of iterations
   * @returns {Promise<Object>} Throughput metrics
   */
  async measureThroughput(fn, iterations = 100) {
    const startTime = performance.now();
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const result = await this.measure(fn);
      results.push(result);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    const throughput = {
      requestsPerSecond: (iterations / (totalTime / 1000)).toFixed(2),
      averageResponseTime: (totalTime / iterations).toFixed(2),
      minResponseTime: Math.min(...results.map(r => r.executionTime)).toFixed(2),
      maxResponseTime: Math.max(...results.map(r => r.executionTime)).toFixed(2),
      successRate: ((results.filter(r => r.success).length / iterations) * 100).toFixed(2) + '%'
    };
    
    this.metrics.throughput.push({
      timestamp: Date.now(),
      ...throughput
    });
    
    return throughput;
  }

  /**
   * Measure latency
   * 
   * @param {Function} fn - Function to measure
   * @returns {Promise<Object>} Latency metrics
   */
  async measureLatency(fn) {
    const latencies = [];
    const iterations = 10;
    
    for (let i = 0; i < iterations; i++) {
      const result = await this.measure(fn);
      if (result.success) {
        latencies.push(result.executionTime);
      }
    }
    
    const sorted = latencies.sort((a, b) => a - b);
    
    const latencyMetrics = {
      min: sorted[0]?.toFixed(2) || '0',
      max: sorted[sorted.length - 1]?.toFixed(2) || '0',
      average: (sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(2),
      median: sorted[Math.floor(sorted.length / 2)]?.toFixed(2) || '0',
      p95: sorted[Math.floor(sorted.length * 0.95)]?.toFixed(2) || '0',
      p99: sorted[Math.floor(sorted.length * 0.99)]?.toFixed(2) || '0'
    };
    
    this.metrics.latency.push({
      timestamp: Date.now(),
      ...latencyMetrics
    });
    
    return latencyMetrics;
  }

  /**
   * Record custom metric
   * 
   * @param {string} name - Metric name
   * @param {any} value - Metric value
   */
  recordMetric(name, value) {
    if (!this.metrics.custom.has(name)) {
      this.metrics.custom.set(name, []);
    }
    
    this.metrics.custom.get(name).push({
      timestamp: Date.now(),
      value
    });
  }

  /**
   * Get performance report
   * 
   * @returns {Object} Performance report
   */
  getReport() {
    const duration = this.state.endTime
      ? this.state.endTime - this.state.startTime
      : performance.now() - this.state.startTime;
    
    return {
      summary: {
        duration: `${(duration / 1000).toFixed(2)}s`,
        totalRequests: this.state.totalRequests,
        successfulRequests: this.state.successfulRequests,
        failedRequests: this.state.failedRequests,
        successRate: this.state.totalRequests > 0
          ? ((this.state.successfulRequests / this.state.totalRequests) * 100).toFixed(2) + '%'
          : '0%'
      },
      responseTime: this._calculateResponseTimeStats(),
      memory: this._calculateMemoryStats(),
      cpu: this._calculateCpuStats(),
      throughput: this._calculateThroughputStats(),
      latency: this._calculateLatencyStats(),
      custom: this._calculateCustomStats()
    };
  }

  /**
   * Calculate response time statistics
   * 
   * @returns {Object} Response time stats
   * @private
   */
  _calculateResponseTimeStats() {
    if (this.metrics.responseTimes.length === 0) {
      return null;
    }
    
    const times = this.metrics.responseTimes
      .filter(r => r.success)
      .map(r => r.duration);
    
    if (times.length === 0) {
      return null;
    }
    
    const sorted = times.sort((a, b) => a - b);
    
    return {
      count: times.length,
      average: (sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(2) + 'ms',
      min: sorted[0].toFixed(2) + 'ms',
      max: sorted[sorted.length - 1].toFixed(2) + 'ms',
      median: sorted[Math.floor(sorted.length / 2)].toFixed(2) + 'ms',
      p95: sorted[Math.floor(sorted.length * 0.95)].toFixed(2) + 'ms',
      p99: sorted[Math.floor(sorted.length * 0.99)].toFixed(2) + 'ms'
    };
  }

  /**
   * Calculate memory statistics
   * 
   * @returns {Object} Memory stats
   * @private
   */
  _calculateMemoryStats() {
    if (this.metrics.memory.length === 0) {
      return null;
    }
    
    const latest = this.metrics.memory[this.metrics.memory.length - 1];
    
    return {
      rss: `${(latest.rss / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(latest.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      heapUsed: `${(latest.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapUsage: `${((latest.heapUsed / latest.heapTotal) * 100).toFixed(2)}%`,
      external: `${(latest.external / 1024 / 1024).toFixed(2)}MB`
    };
  }

  /**
   * Calculate CPU statistics
   * 
   * @returns {Object} CPU stats
   * @private
   */
  _calculateCpuStats() {
    if (this.metrics.cpu.length === 0) {
      return null;
    }
    
    const latest = this.metrics.cpu[this.metrics.cpu.length - 1];
    
    return {
      user: `${(latest.user / 1000000).toFixed(2)}s`,
      system: `${(latest.system / 1000000).toFixed(2)}s`,
      total: `${((latest.user + latest.system) / 1000000).toFixed(2)}s`
    };
  }

  /**
   * Calculate throughput statistics
   * 
   * @returns {Object} Throughput stats
   * @private
   */
  _calculateThroughputStats() {
    if (this.metrics.throughput.length === 0) {
      return null;
    }
    
    const latest = this.metrics.throughput[this.metrics.throughput.length - 1];
    
    return latest;
  }

  /**
   * Calculate latency statistics
   * 
   * @returns {Object} Latency stats
   * @private
   */
  _calculateLatencyStats() {
    if (this.metrics.latency.length === 0) {
      return null;
    }
    
    const latest = this.metrics.latency[this.metrics.latency.length - 1];
    
    return latest;
  }

  /**
   * Calculate custom statistics
   * 
   * @returns {Object} Custom stats
   * @private
   */
  _calculateCustomStats() {
    const stats = {};
    
    for (const [name, values] of this.metrics.custom.entries()) {
      if (values.length === 0) {
        stats[name] = null;
        continue;
      }
      
      const latest = values[values.length - 1];
      stats[name] = latest.value;
    }
    
    return stats;
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      cpu: [],
      memory: [],
      responseTimes: [],
      throughput: [],
      latency: [],
      custom: new Map()
    };
    
    this.state = {
      isRunning: false,
      startTime: null,
      endTime: null,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0
    };
    
    if (this.samplingInterval) {
      clearInterval(this.samplingInterval);
      this.samplingInterval = null;
    }
  }

  /**
   * Export metrics to JSON
   * 
   * @returns {string} JSON string
   */
  exportToJson() {
    return JSON.stringify({
      metrics: this.metrics,
      state: this.state,
      report: this.getReport()
    }, null, 2);
  }
}

module.exports = PerformanceBenchmark;