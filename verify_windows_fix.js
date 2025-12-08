#!/usr/bin/env node

/**
 * Final verification test for Stigmergy CLI Windows compatibility
 */

const fs = require('fs');
const path = require('path');

console.log('=== Stigmergy CLI Windows Compatibility Verification ===\n');

// 1. Check if bin/stigmergy is using correct Windows-compatible launcher
console.log('1. Checking bin/stigmergy launcher...');
try {
  const binLauncher = fs.readFileSync(path.join(__dirname, 'bin', 'stigmergy'), 'utf8');
  if (binLauncher.includes('#!/usr/bin/env node')) {
    console.log('   ✅ Using Node.js launcher (Windows compatible)');
  } else {
    console.log('   ⚠️  Unexpected launcher format');
    console.log(binLauncher.substring(0, 200));
  }
} catch (error) {
  console.log('   ❌ Failed to read bin/stigmergy:', error.message);
}

// 2. Check package.json for correct bin configuration
console.log('\n2. Checking package.json bin configuration...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  if (packageJson.bin && packageJson.bin.stigmergy) {
    console.log('   ✅ Bin configuration found:', packageJson.bin.stigmergy);
  } else {
    console.log('   ❌ Bin configuration missing');
  }
} catch (error) {
  console.log('   ❌ Failed to read package.json:', error.message);
}

// 3. Check core modules
console.log('\n3. Checking core modules...');
const coreModules = ['smart_router', 'cli_help_analyzer', 'cli_tools', 'memory_manager'];
for (const module of coreModules) {
  try {
    const modulePath = path.join(__dirname, 'src', 'core', `${module}.js`);
    fs.accessSync(modulePath);
    console.log(`   ✅ ${module}.js exists`);
  } catch (error) {
    console.log(`   ❌ ${module}.js missing:`, error.message);
  }
}

// 4. Test SmartRouter instantiation
console.log('\n4. Testing SmartRouter instantiation...');
try {
  const SmartRouter = require('./src/core/smart_router');
  const router = new SmartRouter();
  console.log(`   ✅ SmartRouter created with ${Object.keys(router.tools).length} tools`);
} catch (error) {
  console.log('   ❌ Failed to create SmartRouter:', error.message);
}

// 5. Test CLIHelpAnalyzer instantiation
console.log('\n5. Testing CLIHelpAnalyzer instantiation...');
try {
  const CLIHelpAnalyzer = require('./src/core/cli_help_analyzer');
  const analyzer = new CLIHelpAnalyzer();
  console.log(`   ✅ CLIHelpAnalyzer created with ${Object.keys(analyzer.cliTools).length} tools`);
} catch (error) {
  console.log('   ❌ Failed to create CLIHelpAnalyzer:', error.message);
}

console.log('\n=== Verification Complete ===');
console.log('If all checks passed, Stigmergy CLI should work correctly on Windows.');