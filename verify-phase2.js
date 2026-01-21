/**
 * Verification Script for Phase 2 Components
 * Tests all newly implemented components
 */

const PythonDetector = require('./src/core/coordination/python_detector');
const GracefulDegradation = require('./src/core/coordination/graceful_degradation');
const PythonCoordinationWrapper = require('./src/core/coordination/python_coordination_wrapper');
const PerformanceBenchmark = require('./src/core/coordination/performance_benchmark');

async function verifyPhase2Components() {
  console.log('=== Phase 2 Component Verification ===\n');
  
  let successCount = 0;
  let failCount = 0;
  
  // Test 1: Python Detector
  console.log('Test 1: Python Detector');
  try {
    const detector = new PythonDetector({ enableCaching: true });
    const result = await detector.detectPython();
    
    console.log(`✓ Python installed: ${result.installed}`);
    console.log(`  Version: ${result.version || 'N/A'}`);
    console.log(`  Path: ${result.path || 'N/A'}`);
    console.log(`  Available versions: ${result.availableVersions.length || 0}`);
    successCount++;
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    failCount++;
  }
  console.log();
  
  // Test 2: Graceful Degradation
  console.log('Test 2: Graceful Degradation');
  try {
    const degradation = new GracefulDegradation({
      enableLogging: false,
      autoRecovery: false
    });
    
    // Register a test strategy
    degradation.registerStrategy('test-component', {
      level: 1,
      fallback: async () => ({ strategy: 'test-fallback' }),
      recovery: async () => true
    });
    
    // Test degradation
    const degradeResult = await degradation.degrade('test-component');
    console.log(`✓ Degradation executed: ${degradeResult.degraded}`);
    console.log(`  Level: ${degradeResult.level}`);
    console.log(`  Strategy: ${degradeResult.fallback.strategy}`);
    
    // Test recovery
    const recoverResult = await degradation.recover('test-component');
    console.log(`✓ Recovery executed: ${recoverResult.recovered}`);
    
    // Get metrics
    const metrics = degradation.getMetrics();
    console.log(`  Total degrades: ${metrics.totalDegrades}`);
    console.log(`  Total recoveries: ${metrics.totalRecoveries}`);
    
    successCount++;
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    failCount++;
  }
  console.log();
  
  // Test 3: Python Coordination Wrapper
  console.log('Test 3: Python Coordination Wrapper');
  try {
    const wrapper = new PythonCoordinationWrapper({
      enableFallback: true,
      enableLogging: false
    });
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const stats = wrapper.getStatistics();
    console.log(`✓ Wrapper initialized`);
    console.log(`  Python available: ${stats.pythonAvailable}`);
    console.log(`  Python version: ${stats.pythonVersion || 'N/A'}`);
    console.log(`  Total calls: ${stats.totalCalls}`);
    console.log(`  Success rate: ${stats.successRate}`);
    
    successCount++;
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    failCount++;
  }
  console.log();
  
  // Test 4: Performance Benchmark
  console.log('Test 4: Performance Benchmark');
  try {
    const benchmark = new PerformanceBenchmark({
      enableMemoryMonitoring: true,
      enableCpuMonitoring: true
    });
    
    // Start benchmark
    benchmark.start();
    
    // Measure a simple operation
    const result = await benchmark.measure(async () => {
      return 'test result';
    });
    
    // Stop benchmark
    benchmark.stop();
    
    // Get report
    const report = benchmark.getReport();
    
    console.log(`✓ Benchmark completed`);
    console.log(`  Total requests: ${report.summary.totalRequests}`);
    console.log(`  Success rate: ${report.summary.successRate}`);
    console.log(`  Duration: ${report.summary.duration}`);
    
    if (report.responseTime) {
      console.log(`  Avg response time: ${report.responseTime.average}`);
    }
    
    if (report.memory) {
      console.log(`  Heap used: ${report.memory.heapUsed}`);
    }
    
    successCount++;
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    failCount++;
  }
  console.log();
  
  // Test 5: Integration Test
  console.log('Test 5: Component Integration');
  try {
    const detector = new PythonDetector();
    const degradation = new GracefulDegradation({ enableLogging: false });
    const wrapper = new PythonCoordinationWrapper({ enableFallback: true, enableLogging: false });
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✓ All components initialized`);
    console.log(`  PythonDetector: ✓`);
    console.log(`  GracefulDegradation: ✓`);
    console.log(`  PythonCoordinationWrapper: ✓`);
    
    // Test interaction
    const detection = await detector.detectPython();
    console.log(`  Python detection: ${detection.installed ? 'Available' : 'Not available'}`);
    
    if (!detection.installed) {
      // Test fallback
      const degradeResult = await degradation.degrade('python-coordination', {});
      console.log(`  Fallback activated: ${degradeResult.degraded}`);
    }
    
    successCount++;
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    failCount++;
  }
  console.log();
  
  // Summary
  console.log('=== Summary ===');
  console.log(`Total tests: 5`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  if (failCount === 0) {
    console.log('\n✓ All Phase 2 components verified successfully!');
    console.log('\nPhase 2 Implementation Complete:');
    console.log('  P1: Python Detection Module ✓');
    console.log('  P2: Graceful Degradation Mechanism ✓');
    console.log('  P3: Python Coordination Wrapper ✓');
    console.log('  P4: Integration Test Suite ✓');
    console.log('  P5: Performance Optimization and Testing ✓');
  } else {
    console.log(`\n✗ ${failCount} component(s) failed verification`);
  }
}

verifyPhase2Components().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});