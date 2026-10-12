#!/usr/bin/env node

/**
 * Script to update CLI documentation with correct installation commands
 * This script updates only the installation command in existing CLI documentation files
 * without overwriting existing content
 */

const fs = require('fs');
const path = require('path');
const { CLI_TOOLS } = require('../src/core/cli_tools');

function updateCLIDocumentation(cliName) {
  const cliInfo = CLI_TOOLS[cliName] || { name: cliName };
  const filename = `${cliName}.md`;
  const filepath = path.join(__dirname, '..', filename);

  try {
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      console.log(`⚠️  File ${filename} does not exist, skipping...`);
      return;
    }

    // Read the existing content
    let content = fs.readFileSync(filepath, 'utf8');

    // Update the installation command line
    const installPattern = /(-\s*\*\*Installation Command\*\*:\s*`npm install -g [^`]*`)/;
    const newInstallLine = `- **Installation Command**: \`${cliInfo.install || 'Not configured'}\``;

    if (installPattern.test(content)) {
      // Replace the existing installation command
      content = content.replace(installPattern, newInstallLine);
      console.log(`✅ Updated installation command in ${filename}`);
    } else {
      // If installation command doesn't exist, we could add it (but for now just warn)
      console.log(`⚠️  Installation command not found in ${filename}, skipping update`);
      return;
    }

    // Write the updated content back to the file
    fs.writeFileSync(filepath, content);
    console.log(`✅ Updated ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to update ${filename}:`, error.message);
  }
}

function main() {
  console.log('🔄 Updating CLI documentation with correct installation commands...');

  for (const [cliName] of Object.entries(CLI_TOOLS)) {
    updateCLIDocumentation(cliName);
  }

  console.log('✅ CLI documentation update completed!');
}

if (require.main === module) {
  main();
}

module.exports = { updateCLIDocumentation };