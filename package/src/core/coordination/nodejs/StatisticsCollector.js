// src/core/coordination/nodejs/StatisticsCollector.js
class StatisticsCollector {
  constructor() {
    this.counters = {};
    this.timings = {};
    this.startTime = Date.now();
  }

  initialize() {
    console.log('[STATISTICS_COLLECTOR] Initializing statistics collector...');
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

module.exports = StatisticsCollector;
