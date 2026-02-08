#!/usr/bin/env node

/**
 * Quick Pre-Test
 * Fast basic checks before full test suite
 */

const { spawnSync } = require('child_process');
const fs = require('fs').promises');
const path = require('path');

console.log('🧪 Running Quick Pre-Test...\n');

async function quickTest() {
  let allPassed = true;

  // Test 1: Check package.json
  console.log('[1/5] Checking package.json...');
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`✓ Package: ${pkg.name} v${pkg.version}`);
    console.log(`✓ Main: ${pkg.main}`);
    console.log(`✓ Bin: ${Object.keys(pkg.bin || {}).join(', ')}`);
  } catch (e) {
    console.log('✗ package.json error:', e.message);
    allPassed = false;
  }

  // Test 2: Check main entry point
  console.log('\n[2/5] Checking main entry point...');
  try {
    fs.accessSync(pkg.main);
    console.log(`✓ Main file exists: ${pkg.main}`);
  } catch (e) {
    console.log('✗ Main file error:', e.message);
    allPassed = false;
  }

  // Test 3: Check bin directory
  console.log('\n[3/5] Checking bin directory...');
  try {
    const binFiles = fs.readdirSync('bin');
    console.log(`✓ Bin files: ${binFiles.join(', ')}`);
  } catch (e) {
    console.log('✗ Bin directory error:', e.message);
    allPassed = false;
  }

  // Test 4: Check src directory structure
  console.log('\n[4/5] Checking src directory structure...');
  const requiredDirs = ['src/core', 'src/cli', 'src/commands'];
  for (const dir of requiredDirs) {
    try {
      fs.accessSync(dir);
      console.log(`✓ ${dir}/ exists`);
    } catch (e) {
      console.log(`✗ ${dir}/ missing`);
      allPassed = false;
    }
  }

  // Test 5: Check if stigmergy command works (if installed)
  console.log('\n[5/5] Checking if stigmergy command works...');
  try {
    const result = spawnSync('stigmergy', ['--version'], {
      stdio: 'pipe',
      shell: true
    });
    if (result.status === 0) {
      console.log(`✓ stigmergy command works`);
      console.log(`  Version: ${result.stdout.toString().trim()}`);
    } else {
      console.log('⚠️  stigmergy command not working (not installed yet?)');
    }
  } catch (e) {
    console.log('⚠️  stigmergy command not available');
  }

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ Quick Pre-Test PASSED');
    console.log('\n💡 Next steps:');
    console.log('   1. Install dependencies: npm install (if not done)');
    console.log('   2. Install globally: npm link -g');
    console.log('   3. Run full test: node scripts/test-all-stigmergy.js');
    console.log('   4. Test install/uninstall: node scripts/test-install-uninstall.js');
  } else {
    console.log('❌ Quick Pre-Test FAILED');
    console.log('\n💡 Please fix the issues above before continuing');
  }

  return allPassed;
}

quickTest()
  .then(passed => {
    process.exit(passed ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  });
