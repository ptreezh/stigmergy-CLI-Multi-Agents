#!/usr/bin/env node

/**
 * Script to publish the beta version of stigmergy package
 * 
 * To use this script:
 * 1. Make sure you're logged into npm: npm login
 * 2. Run this script: node publish-beta-version.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Preparing to publish stigmergy@1.3.2-beta.4...');

// Check current directory
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found in current directory');
  process.exit(1);
}

// Read package.json to verify version
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
console.log(`Current package version: ${packageJson.version}`);

if (packageJson.version !== '1.3.2-beta.4') {
  console.error(`Error: Expected version 1.3.2-beta.4, but found ${packageJson.version}`);
  process.exit(1);
}

console.log('\nBefore publishing, please ensure you are logged into npm:');
console.log('  npm login');
console.log('');

// Check if user is logged in
try {
  const whoami = execSync('npm whoami', { encoding: 'utf8' });
  console.log(`Logged in as: ${whoami.trim()}`);
} catch (error) {
  console.log('Not currently logged in to npm. Please run `npm login` first.');
  process.exit(1);
}

console.log('\nTo publish this beta version, run:');
console.log('  npm publish --tag beta');
console.log('');
console.log('Or to publish with the next command:');
console.log('  npm publish');

console.log('\nAfter publishing, push the changes to git:');
console.log('  git push origin main');
console.log('');