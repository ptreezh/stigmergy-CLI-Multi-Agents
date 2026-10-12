#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Runs all tests and generates detailed coverage report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎯 COMPREHENSIVE TEST SUITE');
console.log('='.repeat(70));

// ANSI color codes
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
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function ensureDirectories() {
  const dirs = [
    'tests/comprehensive/cli',
    'tests/comprehensive/cli/commands',
    'tests/comprehensive/core',
    'tests/comprehensive/coordination',
    'tests/comprehensive/adapters',
    'tests/comprehensive/utils',
    'coverage'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

function countTestFiles() {
  const testDirs = [
    'tests/unit',
    'tests/integration',
    'tests/e2e',
    'tests/comprehensive',
    'tests/regression'
  ];

  let totalTests = 0;
  testDirs.forEach(dir => {
    const testPath = path.join(process.cwd(), dir);
    if (fs.existsSync(testPath)) {
      const files = fs.readdirSync(testPath)
        .filter(f => f.endsWith('.test.js'));
      totalTests += files.length;
    }
  });

  return totalTests;
}

function countSourceFiles() {
  const srcPath = path.join(process.cwd(), 'src');

  function countDir(dir) {
    let count = 0;
    const items = fs.readdirSync(dir, { withFileTypes: true });

    items.forEach(item => {
      if (item.isDirectory()) {
        count += countDir(path.join(dir, item.name));
      } else if (item.name.endsWith('.js')) {
        count++;
      }
    });

    return count;
  }

  return countDir(srcPath);
}

function printSummary() {
  log('\n' + '='.repeat(70), 'cyan');
  log('📊 TEST SUITE SUMMARY', 'cyan');
  log('='.repeat(70), 'cyan');

  const sourceFiles = countSourceFiles();
  const testFiles = countTestFiles();
  const coverage = ((testFiles / sourceFiles) * 100).toFixed(1);

  log(`\n📁 Source Files: ${sourceFiles}`);
  log(`🧪 Test Files: ${testFiles}`);
  log(`📈 Test Coverage: ${coverage}%`);

  log('\n' + '='.repeat(70), 'cyan');
}

function readCoverageReport() {
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');

  if (!fs.existsSync(coveragePath)) {
    log('\n⚠️  Coverage report not found', 'yellow');
    return;
  }

  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));

  log('\n' + '='.repeat(70), 'cyan');
  log('📊 DETAILED COVERAGE REPORT', 'cyan');
  log('='.repeat(70), 'cyan');

  const total = coverage.total;
  log(`\n📈 Overall Coverage:`, 'cyan');
  log(`   Statements: ${total.statements.pct}% (${total.statements.covered}/${total.statements.total})`);
  log(`   Branches:   ${total.branches.pct}% (${total.branches.covered}/${total.branches.total})`);
  log(`   Functions:  ${total.functions.pct}% (${total.functions.covered}/${total.functions.total})`);
  log(`   Lines:      ${total.lines.pct}% (${total.lines.covered}/${total.lines.total})`);

  // Find files with low coverage
  log('\n📉 Files with Low Coverage (< 80%):', 'yellow');
  let lowCoverageFound = false;

  Object.entries(coverage).forEach(([file, data]) => {
    if (file !== 'total' && data.statements.pct < 80) {
      lowCoverageFound = true;
      const relativePath = file.replace(process.cwd(), '');
      log(`   ${relativePath}: ${data.statements.pct}%`, 'red');
    }
  });

  if (!lowCoverageFound) {
    log('   ✅ All files have good coverage!', 'green');
  }

  log('\n' + '='.repeat(70), 'cyan');
}

async function main() {
  const startTime = Date.now();

  try {
    // Ensure test directories exist
    ensureDirectories();

    // Print initial summary
    log('\n🔍 Test Environment:', 'blue');
    log(`   Node.js: ${process.version}`);
    log(`   Platform: ${process.platform}`);
    log(`   CWD: ${process.cwd()}`);

    // Run pre-test cleanup
    log('\n🧹 Cleaning test environment...', 'blue');
    try {
      execSync('npm run clean 2>/dev/null || true', { stdio: 'ignore' });
    } catch (e) {
      // Ignore cleanup errors
    }

    // Run tests by category
    const results = {
      unit: runCommand('npm run test:unit -- --silent', 'Unit Tests'),
      integration: runCommand('npm run test:integration -- --silent', 'Integration Tests'),
      comprehensive: runCommand('jest tests/comprehensive --coverage --silent', 'Comprehensive Tests')
    };

    // Generate coverage report
    if (results.comprehensive) {
      readCoverageReport();
    }

    // Calculate duration
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Print final summary
    printSummary();

    log(`\n⏱️  Total Duration: ${duration}s`, 'blue');

    // Determine success
    const allPassed = Object.values(results).every(r => r === true);

    if (allPassed) {
      log('\n✅ ALL TESTS PASSED!', 'green');
      log('\n🎉 Great job! Your test suite is comprehensive.', 'green');
      process.exit(0);
    } else {
      log('\n❌ SOME TESTS FAILED', 'red');
      log('\n💡 Run with --verbose to see detailed error messages', 'yellow');
      process.exit(1);
    }

  } catch (error) {
    log(`\n💥 Fatal Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { runCommand, readCoverageReport, printSummary };
