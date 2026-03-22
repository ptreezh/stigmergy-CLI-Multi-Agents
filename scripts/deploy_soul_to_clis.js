#!/usr/bin/env node

/**
 * Deploy SOUL.md to all available AI CLI directories
 * This ensures every CLI can access Stigmergy's evolution blueprint
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SOUL_SOURCE = path.join(__dirname, '..', 'SOUL.md');

// CLI directories to deploy SOUL.md to
const CLI_DIRECTORIES = {
  claude: path.join(os.homedir(), '.claude'),
  gemini: path.join(os.homedir(), '.config', 'gemini'),
  qwen: path.join(os.homedir(), '.qwen'),
  iflow: path.join(os.homedir(), '.iflow'),
  qodercli: path.join(os.homedir(), '.qoder'),
  codebuddy: path.join(os.homedir(), '.codebuddy'),
  opencode: path.join(os.homedir(), '.opencode'),
  kilocode: path.join(os.homedir(), '.kilocode'),
  codex: path.join(os.homedir(), '.config', 'codex')
};

function copySoulToCli(cliName, targetDir) {
  try {
    // Check if source SOUL.md exists
    if (!fs.existsSync(SOUL_SOURCE)) {
      console.error(`❌ Source SOUL.md not found at: ${SOUL_SOURCE}`);
      return false;
    }

    // Check if target directory exists
    if (!fs.existsSync(targetDir)) {
      console.log(`⚠️  ${cliName}: Directory not found: ${targetDir}`);
      return false;
    }

    const targetPath = path.join(targetDir, 'SOUL.md');

    // Copy SOUL.md
    fs.copyFileSync(SOUL_SOURCE, targetPath);

    console.log(`✅ ${cliName}: SOUL.md deployed to ${targetPath}`);
    return true;
  } catch (error) {
    console.error(`❌ ${cliName}: Failed to deploy SOUL.md - ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🚀 Starting SOUL.md deployment to all CLIs...\n');

  let successCount = 0;
  let failCount = 0;

  for (const [cliName, targetDir] of Object.entries(CLI_DIRECTORIES)) {
    if (copySoulToCli(cliName, targetDir)) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n📊 Deployment Summary:`);
  console.log(`   ✅ Successful: ${successCount}/${Object.keys(CLI_DIRECTORIES).length}`);
  console.log(`   ❌ Failed: ${failCount}/${Object.keys(CLI_DIRECTORIES).length}`);

  if (successCount === Object.keys(CLI_DIRECTORIES).length) {
    console.log('\n🎉 SOUL.md successfully deployed to all CLIs!');
    process.exit(0);
  } else if (successCount > 0) {
    console.log('\n⚠️  SOUL.md deployed to some CLIs, but some failed.');
    process.exit(0);
  } else {
    console.log('\n❌ Failed to deploy SOUL.md to any CLI.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { copySoulToCli, CLI_DIRECTORIES };