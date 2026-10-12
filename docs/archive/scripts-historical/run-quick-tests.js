#!/usr/bin/env node

/**
 * Quick Test Runner
 * Runs only the comprehensive tests without legacy tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎯 QUICK COMPREHENSIVE TEST SUITE');
console.log('='.repeat(70));

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n📦 ${description}...`, 'cyan');

  try {
    const output = execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    log(`✅ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    return false;
  }
}

async function main() {
  const startTime = Date.now();

  try {
    log('\n🔍 Running comprehensive tests only...', 'blue');

    // Ensure directories exist
    const dirs = ['tests/comprehensive/cli/commands', 'tests/comprehensive/core', 'tests/comprehensive/coordination'];
    dirs.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });

    // Run comprehensive tests only
    const result = runCommand(
      'jest tests/comprehensive --coverage',
      'Comprehensive Tests'
    );

    // Calculate duration
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    log(`\n⏱️  Duration: ${duration}s`, 'blue');

    if (result) {
      log('\n✅ ALL TESTS PASSED!', 'green');
      process.exit(0);
    } else {
      log('\n❌ SOME TESTS FAILED', 'red');
      log('\n💡 Check the output above for details', 'yellow');
      process.exit(1);
    }

  } catch (error) {
    log(`\n💥 Fatal Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runCommand };
