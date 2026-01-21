/**
 * Final Phase 1 Component Verification
 * Tests basic functionality of all 7 core components
 */

const parserModule = require('./src/core/coordination/natural_language_parser');
const routerModule = require('./src/core/coordination/intent_router');
const coordinatorModule = require('./src/core/coordination/collaboration_coordinator');
const executorModule = require('./src/core/coordination/cross_cli_executor');
const registryModule = require('./src/core/coordination/cli_adapter_registry');
const errorHandlerModule = require('./src/core/coordination/error_handler');
const loggerModule = require('./src/core/coordination/logger');

async function verifyComponents() {
  console.log('=== Phase 1 Component Verification ===\n');
  
  let successCount = 0;
  let failCount = 0;
  
  // Test 1: Natural Language Parser
  console.log('Test 1: Natural Language Parser');
  try {
    const parser = new parserModule.NaturalLanguageParser();
    const result = await parser.parseIntent('请claude帮我翻译这段文字');
    console.log(`✓ Intent: ${result.intent}, CLI: ${result.targetCLI}, Confidence: ${result.confidence}`);
    successCount++;
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    failCount++;
  }
  console.log();
  
  // Test 2: Intent Router
  console.log('Test 2: Intent Router');
  try {
    const router = new routerModule();
    const intentResult = {
      intent: 'DIRECT_CALL',
      targetCLI: 'claude',
      task: 'translate this text',
      confidence: 0.95
    };
    const result = await router.routeRequest(intentResult);
    console.log(`✓ Routed to: ${result.handler}`);
    successCount++;
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    failCount++;
  }
  console.log();
  
  // Test 3: Collaboration Coordinator
  console.log('Test 3: Collaboration Coordinator');
  try {
    const coordinator = new coordinatorModule();
    const request = {
      user_input: '请claude和qwen一起分析这个项目',
      language: 'zh',
      task: '分析项目',
      involvedCLIs: ['claude', 'qwen']
    };
    const result = await coordinator.coordinateCollaboration(request);
    console.log(`✓ Collaboration type: ${result.collaborationType}`);
    successCount++;
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    failCount++;
  }
  console.log();
  
  // Test 4: Cross CLI Executor
  console.log('Test 4: Cross CLI Executor');
  try {
    const executor = new executorModule();
    const stats = executor.getStatistics();
    console.log(`✓ Executor initialized, tasks executed: ${stats.totalTasksExecuted}`);
    successCount++;
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    failCount++;
  }
  console.log();
  
  // Test 5: CLI Adapter Registry
  console.log('Test 5: CLI Adapter Registry');
  try {
    const registry = new registryModule({
      enableAutoDiscovery: false,
      enableHealthMonitoring: false
    });
    const adapters = registry.getAllAdapters();
    console.log(`✓ Registry initialized, adapters: ${Object.keys(adapters).length}`);
    successCount++;
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    failCount++;
  }
  console.log();
  
  // Test 6: Error Handler
  console.log('Test 6: Error Handler');
  try {
    const errorHandler = new errorHandlerModule.ErrorHandler();
    const error = new Error('Test error');
    const result = await errorHandler.handleError(error);
    console.log(`✓ Error handled: ${result.errorType}, Severity: ${result.errorSeverity}`);
    successCount++;
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    failCount++;
  }
  console.log();
  
  // Test 7: Logger
  console.log('Test 7: Logger');
  try {
    const logger = new loggerModule.Logger({
      enableConsole: false,
      enableFileLogging: false,
      enableMetrics: false
    });
    logger.info('Test message');
    const logs = logger.getRecentLogs();
    console.log(`✓ Logger initialized, logs: ${logs.length}`);
    successCount++;
  } catch (error) {
    console.log(`✗ Error: ${error.message}`);
    failCount++;
  }
  console.log();
  
  // Summary
  console.log('=== Summary ===');
  console.log(`Total tests: 7`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  if (failCount === 0) {
    console.log('\n✓ All Phase 1 components verified successfully!');
    console.log('\nPhase 1 Implementation Complete:');
    console.log('  T001: Natural Language Parser ✓');
    console.log('  T002: Intent Router ✓');
    console.log('  T003: Collaboration Coordinator ✓');
    console.log('  T004: Cross CLI Executor ✓');
    console.log('  T005: CLI Adapter Registry ✓');
    console.log('  T006: Error Handler ✓');
    console.log('  T007: Logger ✓');
  } else {
    console.log(`\n✗ ${failCount} component(s) failed verification`);
  }
}

verifyComponents().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});