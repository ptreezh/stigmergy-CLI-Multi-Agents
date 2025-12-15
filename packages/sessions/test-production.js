#!/usr/bin/env node

/**
 * Simple production test without complex dependencies
 */

const fs = require('fs');
const path = require('path');

// Check if the built files exist
const distPath = path.join(__dirname, 'dist');
const cliJs = path.join(distPath, 'cli.js');
const indexJs = path.join(distPath, 'index.js');

console.log('üîç Production Build Validation');
console.log('============================\n');

let passed = 0;
let failed = 0;

function test(name, condition, details = '') {
  if (condition) {
    console.log(`‚ú?${name}`);
    if (details) console.log(`   ${details}`);
    passed++;
  } else {
    console.log(`‚ù?${name}`);
    if (details) console.log(`   ${details}`);
    failed++;
  }
}

// Test build directory exists
test('Build directory exists', fs.existsSync(distPath), `Path: ${distPath}`);

// Test compiled files exist
test('CLI module exists', fs.existsSync(cliJs), `Path: ${cliJs}`);
test('Index module exists', fs.existsSync(indexJs), `Path: ${indexJs}`);

// Test file sizes
if (fs.existsSync(cliJs)) {
  const cliStats = fs.statSync(cliJs);
  test('CLI module has reasonable size', cliStats.size > 1000 && cliStats.size < 100000, `Size: ${cliStats.size} bytes`);
}

if (fs.existsSync(indexJs)) {
  const indexStats = fs.statSync(indexJs);
  test('Index module has reasonable size', indexStats.size > 500 && indexStats.size < 50000, `Size: ${indexStats.size} bytes`);
}

// Test package.json configuration
try {
  const packageJson = require('./package.json');
  test('Package.json has correct main field', packageJson.main === 'dist/lib.js', `Main: ${packageJson.main}`);
  test('Package.json has correct bin field', !!packageJson.bin && Object.keys(packageJson.bin).length > 0, `Bin: ${JSON.stringify(packageJson.bin)}`);
  test('Package.json has production scripts', !!packageJson.scripts, `Scripts: ${Object.keys(packageJson.scripts).length}`);
} catch (e) {
  test('Can read package.json', false, e.message);
}

// Test TypeScript compilation
const tsConfigPath = path.join(__dirname, 'tsconfig.json');
test('TypeScript config exists', fs.existsSync(tsConfigPath), `Path: ${tsConfigPath}`);

// Test compiled JavaScript files are valid JavaScript
try {
  const libModule = require('./dist/lib.js');
  test('Compiled lib.js is valid JavaScript', true);
  test('Library exports are available', !!(libModule.ClaudeAdapter && libModule.SessionScanner && libModule.SessionExporter));
} catch (e) {
  test('Compiled lib.js is valid JavaScript', false, e.message);
}

// Summary
console.log('\nüìä Build Validation Summary');
console.log('==========================');
console.log(`‚ú?Passed: ${passed}`);
console.log(`‚ù?Failed: ${failed}`);

if (failed === 0) {
  console.log('\nüéâ Build validation passed! The project is ready for distribution.');
  process.exit(0);
} else {
  console.log('\n‚ù?Build validation failed. Please fix the issues before distributing.');
  process.exit(1);
}
