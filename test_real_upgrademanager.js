/**
 * Test the actual UpgradeManager to reproduce the error
 */
const UpgradeManager = require('./src/core/upgrade_manager');

async function testRealUpgradeManager() {
  console.log('Testing the actual UpgradeManager...');
  
  const upgrader = new UpgradeManager();
  await upgrader.initialize();

  try {
    console.log('\\n--- Running checkVersions ---');
    const { versions, errors } = await upgrader.checkVersions();
    
    console.log('\\nVersions result:', versions);
    console.log('Errors result:', errors);
    
    console.log('\\n--- Running generateUpgradePlan ---');
    const plan = await upgrader.generateUpgradePlan({ dryRun: true });
    console.log('Upgrade plan:', plan);
  } catch (error) {
    console.error('Error in upgrade manager:', error.message);
    console.error('Full error:', error);
  }
}

testRealUpgradeManager();