#!/usr/bin/env node

/**
 * Router.js Structure Analysis Tool
 * Analyzes the router.js file to identify modularization opportunities
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Router.js Structure Analysis');
console.log('='.repeat(50));

const routerPath = path.join(__dirname, '../src/cli/router.js');

if (!fs.existsSync(routerPath)) {
  console.error('❌ router.js file not found');
  process.exit(1);
}

const content = fs.readFileSync(routerPath, 'utf8');
const lines = content.split('\n');

console.log(`📄 Total Lines: ${lines.length}`);
console.log(`📏 File Size: ${(fs.statSync(routerPath).size / 1024).toFixed(2)} KB`);
console.log('');

// Analyze imports
console.log('📦 Import Analysis:');
const importRegex = /const\s+(.+?)\s*=\s*require\(['"](.+?)['"]\)/g;
const imports = [];
let match;

while ((match = importRegex.exec(content)) !== null) {
  imports.push({
    name: match[1],
    path: match[2],
    line: content.substring(0, match.index).split('\n').length
  });
}

console.log(`Found ${imports.length} imports:`);
imports.forEach(imp => {
  console.log(`  📋 ${imp.name} <- ${imp.path} (line ${imp.line})`);
});

// Analyze functions
console.log('\n🔧 Function Analysis:');
const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g;
const functions = [];
let funcMatch;

while ((funcMatch = functionRegex.exec(content)) !== null) {
  const funcName = funcMatch[1] || funcMatch[2];
  const funcStart = content.substring(0, funcMatch.index).split('\n').length;
  functions.push({
    name: funcName,
    line: funcStart,
    isAsync: content.includes('async') && content.substring(funcMatch.index - 50, funcMatch.index).includes('async')
  });
}

console.log(`Found ${functions.length} functions:`);
functions.forEach(func => {
  console.log(`  ⚙️  ${func.name}${func.isAsync ? ' (async)' : ''} (line ${func.line})`);
});

// Analyze main sections
console.log('\n📂 Section Analysis:');

// Look for main sections
const sections = [
  { name: 'Import Section', pattern: /const.*require/ },
  { name: 'Setup Section', pattern: /setupGlobalErrorHandlers|program\.version/ },
  { name: 'Command Definitions', pattern: /program\.command/ },
  { name: 'CLI Tools Routing', pattern: /SmartRouter|routeToCLI/ },
  { name: 'Error Handling', pattern: /errorHandler|catch.*error/ },
  { name: 'Helper Functions', pattern: /function formatBytes|function getWorkingDirectory/ },
  { name: 'Main Execution', pattern: /async function main|if \(require\.main/ }
];

sections.forEach(section => {
  const sectionMatch = content.match(section.pattern);
  if (sectionMatch) {
    const lineNum = content.substring(0, sectionMatch.index).split('\n').length;
    console.log(`  📑 ${section.name} (around line ${lineNum})`);
  }
});

// Look for command definitions
console.log('\n🎯 Command Definitions:');
const commandRegex = /program\.command\(['"]([^'"]+)['"]\)/g;
const commands = [];
let cmdMatch;

while ((cmdMatch = commandRegex.exec(content)) !== null) {
  commands.push(cmdMatch[1]);
}

console.log(`Found ${commands.length} CLI commands:`);
commands.forEach(cmd => {
  console.log(`  💻 ${cmd}`);
});

// Look for CLI tools routing
console.log('\n🛣️ CLI Tools Routing:');
const toolRegex = /(?:case|if).*['"]([^'"]+)['"].*?:/g;
const tools = [];
let toolMatch;

while ((toolMatch = toolRegex.exec(content)) !== null) {
  const tool = toolMatch[1];
  if (!tools.includes(tool) && ['claude', 'gemini', 'qwen', 'codebuddy', 'codex', 'iflow', 'qodercli', 'copilot'].includes(tool)) {
    tools.push(tool);
  }
}

console.log(`Found routing for ${tools.length} CLI tools:`);
tools.forEach(tool => {
  console.log(`  🔗 ${tool}`);
});

// Suggest modularization strategy
console.log('\n💡 Modularization Suggestions:');
console.log('');

console.log('🏗️  Recommended Module Structure:');
console.log('  src/cli/');
console.log('  ├── router.js (main entry, ~200 lines)');
console.log('  ├── commands/');
console.log('  │   ├── index.js (command registry)');
console.log('  │   ├── install.js (install commands)');
console.log('  │   ├── status.js (status commands)');
console.log('  │   ├── scan.js (scan commands)');
console.log('  │   └── deploy.js (deploy commands)');
console.log('  ├── routing/');
console.log('  │   ├── index.js (routing coordinator)');
console.log('  │   ├── cli-router.js (CLI tools routing)');
console.log('  │   └── command-router.js (command routing)');
console.log('  ├── utils/');
console.log('  │   ├── formatters.js (format helpers)');
console.log('  │   ├── validators.js (input validation)');
console.log('  │   └── executors.js (command execution)');
console.log('  └── config/');
console.log('      ├── program-setup.js (commander setup)');
console.log('      └── environment.js (environment setup)');

console.log('');
console.log('🎯 TDD Migration Strategy:');
console.log('  1. ✅ Create comprehensive test suite for current router.js');
console.log('  2. 🔄 Extract helper functions first (low risk)');
console.log('  3. 🔄 Extract command definitions (medium risk)');
console.log('  4. 🔄 Extract CLI routing logic (medium risk)');
console.log('  5. 🔄 Create modular command handlers (high risk)');
console.log('  6. ✅ Maintain backward compatibility');
console.log('  7. ✅ Create rollback mechanism');

console.log('');
console.log('⚠️  Risk Assessment:');
console.log('  🟢 LOW: Helper functions (formatBytes, etc.)');
console.log('  🟡 MEDIUM: Command definitions and routing');
console.log('  🔴 HIGH: Core CLI execution logic');
console.log('');
console.log('🛡️  Safety Measures:');
console.log('  ✅ Backup original file');
console.log('  ✅ Create feature branch');
console.log('  ✅ Test before and after each extraction');
console.log('  ✅ Gradual migration with rollback points');