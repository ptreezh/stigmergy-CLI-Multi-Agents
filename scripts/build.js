/**
 * Build script for Stigmergy CLI
 * Creates a distributable package
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Building Stigmergy CLI ===\n');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('Error: package.json not found. Make sure you are in the project root directory.');
    process.exit(1);
}

// Read package.json
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
console.log(`Building version ${pkg.version} of ${pkg.name}`);

// Verify required files exist
const requiredFiles = [
    'src/main_english.js',
    'package.json',
    'README.md',
    'LICENSE'
];

for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(__dirname, '..', file))) {
        console.error(`Error: Required file missing: ${file}`);
        process.exit(1);
    }
}

console.log('✅ All required files are present');

// Check dependencies
console.log('\nChecking dependencies...');
try {
    execSync('npm list inquirer', { stdio: 'pipe' });
    console.log('✅ Inquirer dependency is available');
} catch (error) {
    console.log('⚠️  Inquirer may not be installed locally, but it should be available in production');
}

// Run basic syntax check
console.log('\nRunning syntax checks...');
try {
    execSync('node -c src/main_english.js', { stdio: 'inherit' });
    console.log('✅ Main file syntax is valid');
} catch (error) {
    console.error('❌ Syntax error in main file:', error.message);
    process.exit(1);
}

// Show build info
console.log('\n=== Build Information ===');
console.log(`Name: ${pkg.name}`);
console.log(`Version: ${pkg.version}`);
console.log(`Description: ${pkg.description}`);
console.log(`Entry point: ${pkg.main}`);
console.log(`Binary: ${JSON.stringify(pkg.bin)}`);
console.log(`Files to be included: ${pkg.files ? pkg.files.length : 'default'}`);

// Show the commands to publish
console.log('\n=== Next Steps for Publishing ===');
console.log('1. To test locally: npm install -g .');
console.log('2. To publish to npm: npm publish');
console.log('3. To publish a new version: npm version [patch|minor|major] && npm publish');

console.log('\n=== Build Complete ===');