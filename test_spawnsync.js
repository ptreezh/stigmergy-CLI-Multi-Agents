/**
 * Test the spawnSync behavior in the context of getLatestVersion
 */
const { spawnSync } = require('child_process');
const { CLI_TOOLS } = require('./src/core/cli_tools');

// Test simplified getLatestVersion
function extractPackageName(installCommand) {
  const match = installCommand.match(/npm install -g (.+)/);
  if (match) {
    return match[1];
  }
  return null;
}

async function testSpawnSync() {
  const toolConfig = CLI_TOOLS.claude;
  console.log('Testing spawnSync with Claude package...');
  
  try {
    console.log(`Package name: ${toolConfig.install}`);
    const packageName = extractPackageName(toolConfig.install);
    console.log(`Extracted package name: ${packageName}`);
    
    // Test the spawnSync call directly
    console.log('Executing spawnSync...');
    const result = spawnSync('npm', ['view', packageName, 'version'], {
      shell: true,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    console.log(`Result status: ${result.status}`);
    console.log(`Result stdout: '${result.stdout}'`);
    console.log(`Result stderr: '${result.stderr}'`);
    console.log(`Result error: ${result.error ? result.error.message : 'none'}`);
    
    if (result.status !== 0) {
      console.log('Command failed, throwing error');
      throw new Error(`npm view failed: ${result.stderr}`);
    }

    console.log('Command succeeded, assigning latestVersion...');
    const latestVersion = result.stdout.trim();
    console.log(`Assigned latestVersion: ${latestVersion}`);
    
  } catch (error) {
    console.log(`Caught error: ${error.message}`);
    console.log(`Error name: ${error.name}`);
    console.log(`Error stack:`, error.stack);
  }
}

testSpawnSync();