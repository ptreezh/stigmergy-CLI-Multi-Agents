/**
 * Sequential Phase 1 component verification
 */

console.log('=== Phase 1 Component Verification ===\n');

let successCount = 0;
let failCount = 0;

// Test 1: Natural Language Parser
console.log('Test 1: Natural Language Parser');
try {
  const parser = require('./src/core/coordination/natural_language_parser');
  const instance = new parser.NaturalLanguageParser();
  console.log('✓ NaturalLanguageParser instantiated');
  successCount++;
} catch (error) {
  console.log(`✗ Error: ${error.message}`);
  failCount++;
}
console.log();

// Test 2: Intent Router
console.log('Test 2: Intent Router');
try {
  const router = require('./src/core/coordination/intent_router');
  const instance = new router();
  console.log('✓ IntentRouter instantiated');
  successCount++;
} catch (error) {
  console.log(`✗ Error: ${error.message}`);
  failCount++;
}
console.log();

// Test 3: Collaboration Coordinator
console.log('Test 3: Collaboration Coordinator');
try {
  const coordinator = require('./src/core/coordination/collaboration_coordinator');
  const instance = new coordinator();
  console.log('✓ CollaborationCoordinator instantiated');
  successCount++;
} catch (error) {
  console.log(`✗ Error: ${error.message}`);
  failCount++;
}
console.log();

// Test 4: Cross CLI Executor
console.log('Test 4: Cross CLI Executor');
try {
  const executor = require('./src/core/coordination/cross_cli_executor');
  const instance = new executor();
  console.log('✓ CrossCLIExecutor instantiated');
  successCount++;
} catch (error) {
  console.log(`✗ Error: ${error.message}`);
  failCount++;
}
console.log();

// Test 5: CLI Adapter Registry
console.log('Test 5: CLI Adapter Registry');
try {
  const registry = require('./src/core/coordination/cli_adapter_registry');
  const instance = new registry({
    enableAutoDiscovery: false,
    enableHealthMonitoring: false
  });
  console.log('✓ CLIAdapterRegistry instantiated');
  successCount++;
} catch (error) {
  console.log(`✗ Error: ${error.message}`);
  failCount++;
}
console.log();

// Test 6: Error Handler
console.log('Test 6: Error Handler');
try {
  const errorHandler = require('./src/core/coordination/error_handler');
  const instance = new errorHandler.ErrorHandler();
  console.log('✓ ErrorHandler instantiated');
  successCount++;
} catch (error) {
  console.log(`✗ Error: ${error.message}`);
  failCount++;
}
console.log();

// Test 7: Logger
console.log('Test 7: Logger');
try {
  const logger = require('./src/core/coordination/logger');
  const instance = new logger.Logger({
    enableConsole: false,
    enableFileLogging: false,
    enableMetrics: false
  });
  console.log('✓ Logger instantiated');
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
} else {
  console.log(`\n✗ ${failCount} component(s) failed verification`);
}