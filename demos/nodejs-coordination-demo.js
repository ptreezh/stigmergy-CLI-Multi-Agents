#!/usr/bin/env node

/**
 * Node.js Coordination Layer Demo
 * Demonstrates the functionality of the Node.js coordination layer
 */

const NodeJsCoordinationLayer = require('../src/core/coordination/nodejs/index.js');
const HookDeploymentManager = require('../src/core/coordination/nodejs/HookDeploymentManager.js');
const CLIIntegrationManager = require('../src/core/coordination/nodejs/CLIIntegrationManager.js');

async function demo() {
  console.log('🚀 Node.js Coordination Layer Demo');
  console.log('==================================\n');

  // Demonstrate Node.js Coordination Layer
  console.log('1. Node.js Coordination Layer');
  console.log('-----------------------------');
  
  const coordinationLayer = new NodeJsCoordinationLayer();
  const initialized = await coordinationLayer.initialize();
  
  if (initialized) {
    console.log('✅ Coordination layer initialized successfully\n');
    
    // Execute a cross-CLI task
    console.log('Executing cross-CLI task...');
    const result = await coordinationLayer.executeCrossCLITask(
      'demo-source',
      'claude',
      'Generate a simple function in Python'
    );
    console.log('Result:', result);
    
    // Get system status
    console.log('\nSystem status:');
    const status = await coordinationLayer.getSystemStatus();
    console.log('- Implementation:', status.implementation);
    console.log('- Health:', status.health.healthy ? '✅ Healthy' : '❌ Unhealthy');
    console.log('- Cross-CLI calls:', status.statistics.counters.cross_cli_calls);
    
    console.log('\n');
  } else {
    console.log('❌ Failed to initialize coordination layer\n');
  }

  // Demonstrate Hook Deployment Manager
  console.log('2. Hook Deployment Manager');
  console.log('--------------------------');
  
  const hookManager = new HookDeploymentManager();
  await hookManager.initialize();
  
  console.log('Deploying hooks for Claude CLI...');
  const hookDeployed = await hookManager.deployHooksForCLI('claude');
  
  if (hookDeployed) {
    console.log('✅ Hooks deployed successfully\n');
    
    // List deployed hooks
    const deployedHooks = await hookManager.listDeployedHooks();
    console.log('Deployed hooks:');
    deployedHooks.forEach(hook => {
      console.log(`- ${hook.cli} (${hook.version})`);
    });
    
    console.log('\n');
  } else {
    console.log('❌ Failed to deploy hooks\n');
  }

  // Demonstrate CLI Integration Manager
  console.log('3. CLI Integration Manager');
  console.log('--------------------------');
  
  const integrationManager = new CLIIntegrationManager();
  
  console.log('Supported CLIs:');
  Object.keys(integrationManager.supportedCLIs).forEach(cli => {
    console.log(`- ${cli}`);
  });
  
  console.log('\nGetting features for Claude CLI...');
  const claudeFeatures = await integrationManager.getSupportedFeatures('claude');
  console.log('- Name:', claudeFeatures.name);
  console.log('- Features:', claudeFeatures.features.join(', '));

  console.log('\n🎉 Demo completed successfully!');
}

// Run the demo
if (require.main === module) {
  demo().catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}

module.exports = { demo };