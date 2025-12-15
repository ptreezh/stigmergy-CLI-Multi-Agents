/**
 * Debug the exact error location in the upgrade manager
 */
const { spawnSync } = require('child_process');
const semver = require('semver');
const { CLI_TOOLS } = require('./src/core/cli_tools');

// Replicate both getCurrentVersion and getLatestVersion as in the original code
async function getCurrentVersion(toolName, toolConfig) {
  try {
    const result = spawnSync(toolConfig.version, {
      shell: true,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (result.error) {
      throw new Error(`Tool not found: ${result.error.message}`);
    }

    if (result.status !== 0) {
      throw new Error(`Version command failed: ${result.stderr}`);
    }

    // 从输出中提取版本
    const versionMatch = result.stdout.match(/(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      return versionMatch[1];
    }

    throw new Error('Could not parse version from output');
  } catch (error) {
    return 'Not installed';
  }
}

function extractPackageName(installCommand) {
  const match = installCommand.match(/npm install -g (.+)/);
  if (match) {
    return match[1];
  }
  return null;
}

async function getLatestVersion(toolName, toolConfig) {
  try {
    // 从 npm 注册表获取最新版本
    const packageName = extractPackageName(toolConfig.install);
    if (!packageName) {
      throw new Error('Could not extract package name');
    }

    const result = spawnSync('npm', ['view', packageName, 'version'], {
      shell: true,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (result.status !== 0) {
      throw new Error(`npm view failed: ${result.stderr}`);
    }

    const latestVersion = result.stdout.trim();
    if (latestVersion) {
      return latestVersion;
    }

    throw new Error('No version information available');
  } catch (error) {
    return 'Unknown';
  }
}

async function debugCheckVersions() {
  console.log('Debugging checkVersions function step by step...');
  
  for (const [toolName, toolConfig] of Object.entries(CLI_TOOLS)) {
    console.log(`\\n--- Testing ${toolName} ---`);
    
    try {
      console.log(`1. Calling getCurrentVersion for ${toolName}...`);
      const currentVersion = await getCurrentVersion(toolName, toolConfig);
      console.log(`   Current version result: ${currentVersion}`);
      
      console.log(`2. Calling getLatestVersion for ${toolName}...`);
      const latestVersion = await getLatestVersion(toolName, toolConfig);
      console.log(`   Latest version result: ${latestVersion}`);
      
      console.log(`3. Testing semver.gt(${latestVersion}, ${currentVersion})...`);
      let needsUpgrade = false;
      if (currentVersion !== 'Not installed' && latestVersion !== 'Unknown' && 
          semver.valid(currentVersion) && semver.valid(latestVersion)) {
        needsUpgrade = semver.gt(latestVersion, currentVersion);
      }
      console.log(`   Needs upgrade: ${needsUpgrade}`);
      
      console.log(`4. Creating version object...`);
      const versionObject = {
        current: currentVersion,
        latest: latestVersion,
        needsUpgrade: needsUpgrade,
        config: toolConfig,
      };
      console.log(`   Version object created successfully:`, versionObject);
      
    } catch (error) {
      console.error(`   ERROR for ${toolName}: ${error.message}`);
      console.error(`   Error stack:`, error.stack);
    }
  }
}

debugCheckVersions();