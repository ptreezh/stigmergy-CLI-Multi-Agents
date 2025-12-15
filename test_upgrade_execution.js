const { spawnSync } = require('child_process');
const UpgradeManager = require('./src/core/upgrade_manager');

async function testUpgradeExecution() {
  console.log('Testing upgrade execution functionality...\n');
  
  try {
    const manager = new UpgradeManager();
    await manager.initialize();
    
    console.log('✓ UpgradeManager initialized');
    
    // Generate upgrade plan
    const plan = await manager.generateUpgradePlan();
    console.log('✓ Upgrade plan generated');
    console.log('Upgrades to perform:', plan.upgrades);
    
    // Test actual command construction for npm
    if (plan.upgrades.length > 0) {
      for (const upgrade of plan.upgrades) {
        console.log(`\nTesting upgrade for ${upgrade.tool}:`);
        console.log(`  From: ${upgrade.from}`);
        console.log(`  To: ${upgrade.to}`);
        console.log(`  Command: ${upgrade.command}`);
        
        // Test the package name extraction
        const packageName = upgrade.command.split(' ').pop();
        console.log(`  Extracted package name: ${packageName}`);
        
        // Actually run npm view to verify the package exists
        const result = spawnSync('npm', ['view', packageName, 'version'], {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        
        console.log('  npm view result status:', result.status);
        console.log('  npm view stdout:', result.stdout ? `"${result.stdout.trim()}"` : 'empty');
        console.log('  npm view stderr:', result.stderr ? `"${result.stderr.trim()}"` : 'empty');
        
        if (result.status === 0 && result.stdout.trim()) {
          console.log(`  ✓ Package exists, latest version: ${result.stdout.trim()}`);
        } else {
          console.log(`  ⚠ Package check returned non-zero or empty output`);
          // Try alternative command format
          const altResult = spawnSync('npm', ['info', packageName, 'version'], {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe'],
          });
          
          console.log('  Alternative npm info result status:', altResult.status);
          console.log('  Alternative npm info stdout:', altResult.stdout ? `"${altResult.stdout.trim()}"` : 'empty');
          console.log('  Alternative npm info stderr:', altResult.stderr ? `"${altResult.stderr.trim()}"` : 'empty');
          
          if (altResult.status === 0 && altResult.stdout.trim()) {
            console.log(`  ✓ Package exists (via npm info), latest version: ${altResult.stdout.trim()}`);
          } else {
            console.log(`  ✗ Error checking package with both methods`);
          }
        }
      }
    } else {
      console.log('No upgrades needed - all tools are up to date');
    }
    
    console.log('\n✓ Upgrade functionality test completed');
  } catch (error) {
    console.error('✗ Error during upgrade functionality test:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testUpgradeExecution();