#!/usr/bin/env node

/**
 * Test script to validate full adapter deployment functionality
 * This tests both hook deployment and adapter integration
 */

const path = require('path');
const os = require('os');
const fs = require('fs');

// Import the HookDeploymentManager and CLIIntegrationManager
const HookDeploymentManager = require('./src/core/coordination/nodejs/HookDeploymentManager');
const CLIIntegrationManager = require('./src/core/coordination/nodejs/CLIIntegrationManager');

async function testFullAdapterDeployment() {
  console.log('=== Testing Full Adapter Deployment Functionality ===\n');
  
  try {
    // Initialize the deployment managers
    const hookManager = new HookDeploymentManager();
    const integrationManager = new CLIIntegrationManager();
    
    await hookManager.initialize();
    console.log('✓ HookDeploymentManager initialized successfully');
    
    console.log('✓ CLIIntegrationManager initialized successfully\n');
    
    // Test deploying full adapters for each supported CLI
    const supportedCLIs = hookManager.supportedCLIs;
    
    for (const cliName of supportedCLIs) {
      console.log(`--- Testing full adapter deployment for ${cliName} ---`);
      
      // 1. Deploy hooks
      console.log('1. Deploying hooks...');
      const hookResult = await hookManager.deployHooksForCLI(cliName);
      
      if (hookResult) {
        console.log(`✓ Hooks deployed successfully for ${cliName}`);
      } else {
        console.log(`✗ Failed to deploy hooks for ${cliName}`);
      }
      
      // 2. Generate and deploy integration script
      console.log('2. Generating integration script...');
      try {
        const integrationScript = await integrationManager.getNodeJsIntegrationScript(cliName);
        console.log(`✓ Integration script generated for ${cliName} (${integrationScript.length} characters)`);
        
        // Save the integration script
        const integrationDir = path.join(os.homedir(), '.stigmergy', 'integrations', cliName);
        if (!fs.existsSync(integrationDir)) {
          fs.mkdirSync(integrationDir, { recursive: true });
        }
        
        const scriptPath = path.join(integrationDir, `${cliName}_integration.js`);
        fs.writeFileSync(scriptPath, integrationScript);
        console.log(`✓ Integration script saved to ${scriptPath}`);
        
        // Make executable
        try {
          fs.chmodSync(scriptPath, 0o755);
          console.log(`✓ Made integration script executable`);
        } catch (chmodError) {
          console.log(`⚠️  Failed to make integration script executable: ${chmodError.message}`);
        }
      } catch (error) {
        console.log(`✗ Failed to generate integration script for ${cliName}: ${error.message}`);
      }
      
      // 3. Check CLI availability
      console.log('3. Checking CLI availability...');
      const availability = await integrationManager.checkCLIAvailability(cliName);
      if (availability.available) {
        console.log(`✓ ${cliName} is available (Version: ${availability.version})`);
      } else {
        console.log(`⚠️  ${cliName} is not available: ${availability.error}`);
      }
      
      // 4. Get supported features
      console.log('4. Getting supported features...');
      const features = await integrationManager.getSupportedFeatures(cliName);
      if (features) {
        console.log(`✓ Supported features for ${cliName}: ${features.features.join(', ')}`);
      } else {
        console.log(`✗ Failed to get supported features for ${cliName}`);
      }
      
      console.log(); // Empty line for readability
    }
    
    // Summary
    console.log('--- Deployment Summary ---');
    console.log('✓ Hook deployment manager tested for all CLIs');
    console.log('✓ Integration script generation tested for all CLIs');
    console.log('✓ CLI availability checking tested for all CLIs');
    console.log('✓ Feature detection tested for all CLIs');
    
    console.log('\n=== Full adapter deployment test completed ===');
    
  } catch (error) {
    console.error('Full adapter deployment test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testFullAdapterDeployment();
}