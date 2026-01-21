# STIGMERGY CLI INSTALLATION DIAGNOSTIC TEST PLAN
## TDD-Driven Analysis for Installation & Upgrade Issues

### Problem Statement
- `npm install stigmergy` does not automatically scan/install CLI tools
- Installation commands are not working properly
- Upgrade commands are not functioning
- Post-install automation appears to be failing

### Test Plan Overview
This comprehensive test plan will systematically validate each component of the installation process to identify where failures are occurring.

---

## PHASE 1: PACKAGE STRUCTURE VALIDATION

### Test 1.1: Package.json Configuration Verification
**Objective**: Validate package.json setup for proper installation

**Test Steps**:
1. ✅ Check `bin` field points to correct executable
2. ✅ Verify `postinstall` script is configured
3. ✅ Validate `main` entry point exists
4. ✅ Check `files` field includes necessary components

**Expected Results**:
- `bin.stigmergy` should point to `bin/stigmergy`
- `scripts.postinstall` should run `node src/index.js auto-install`
- Main entry should be `src/index.js`
- Files array should include installation scripts

**Actual Results**:
- ✅ bin field: `"stigmergy": "bin/stigmergy"` - CORRECT
- ✅ postinstall script: `"postinstall": "node src/index.js auto-install"` - CORRECT
- ✅ main entry: `"main": "src/index.js"` - CORRECT
- ✅ files array includes installation components - CORRECT

**Status**: ✅ **PASS** - Package configuration is correct

---

### Test 1.2: Binary Entry Point Validation
**Objective**: Verify the binary launcher works correctly

**Test Steps**:
1. ✅ Check if `bin/stigmergy` exists and is executable
2. ✅ Verify it can launch the main script
3. ✅ Test argument passing

**Expected Results**:
- Binary should exist and be executable
- Should spawn main.js with inherited stdio
- Should forward exit codes correctly

**Actual Results**:
- ✅ Binary exists at `bin/stigmergy`
- ✅ Uses spawn to launch `src/index.js`
- ✅ Proper stdio inheritance and exit code forwarding

**Status**: ✅ **PASS** - Binary entry point is correctly configured

---

## PHASE 2: MAIN ENTRY POINT ANALYSIS

### Test 2.1: Auto-Install Command Detection
**Objective**: Verify the `auto-install` command is properly handled

**Test Steps**:
1. ✅ Check if `auto-install` case exists in main switch statement
2. ✅ Verify command routing logic
3. ✅ Validate error handling

**Expected Results**:
- Case `auto-install` should be present
- Should handle non-interactive mode properly
- Should have appropriate error handling

**Actual Results**:
- ✅ `case 'auto-install':` found at line 679 in router.js
- ✅ Non-interactive mode with npm lifecycle detection
- ✅ Comprehensive error handling with errorHandler

**Status**: ✅ **PASS** - Auto-install command is properly implemented

### Test 2.2: Installation Flow Analysis
**Objective**: Analyze the complete installation workflow

**Test Steps**:
1. ✅ Map out installation steps
2. ✅ Identify potential failure points
3. ✅ Check resource availability

**Installation Flow Identified**:
```
auto-install →
1. Download required assets
2. Scan for CLI tools
3. Show usage instructions
4. Deploy hooks to available tools
5. Deploy project documentation
6. Initialize configuration
7. Show final message
```

**Potential Failure Points**:
- Asset download failures (step 1)
- CLI scanning errors (step 2)
- Hook deployment permission issues (step 4)
- Configuration initialization failures (step 6)

**Status**: ✅ **ANALYZED** - Installation flow is comprehensive but has multiple potential failure points

---

## PHASE 3: INSTALLER COMPONENT TESTING

### Test 3.1: Installer Class Instantiation
**Objective**: Verify the StigmergyInstaller can be instantiated

**Test Command**:
```bash
node -e "const Installer = require('./src/core/installer'); console.log('Installer loaded successfully');"
```

**Expected Results**:
- Should load without errors
- Should return a constructor function

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

### Test 3.2: CLI Scanning Functionality
**Objective**: Test the CLI scanning capabilities

**Test Command**:
```bash
node -e "
const Installer = require('./src/core/installer');
const installer = new Installer();
installer.scanCLI().then(result => {
  console.log('Scan result:', JSON.stringify(result, null, 2));
}).catch(err => console.error('Scan failed:', err.message));
"
```

**Expected Results**:
- Should return available and missing CLI tools
- Should handle errors gracefully

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

### Test 3.3: Hook Deployment Testing
**Objective**: Test hook deployment mechanism

**Test Command**:
```bash
node -e "
const Installer = require('./src/core/installer');
const installer = new Installer();
installer.deployHooks({}).then(result => {
  console.log('Deploy result:', result);
}).catch(err => console.error('Deploy failed:', err.message));
"
```

**Expected Results**:
- Should create necessary directories
- Should deploy integration files
- Should handle permission errors

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

---

## PHASE 4: POST-INSTALL SCRIPT TESTING

### Test 4.1: Manual Post-Install Execution
**Objective**: Test post-install script manually

**Test Command**:
```bash
npm run postinstall
```

**Expected Results**:
- Should execute auto-install command
- Should show installation progress
- Should complete without errors

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

### Test 4.2: NPM Lifecycle Detection
**Objective**: Verify npm environment detection

**Test Command**:
```bash
npm_lifecycle_event=postinstall node src/index.js auto-install
```

**Expected Results**:
- Should detect npm environment
- Should use appropriate logging channels

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

---

## PHASE 5: INSTALLATION COMMAND TESTING

### Test 5.1: Install Command Availability
**Objective**: Test if install command works after installation

**Test Commands**:
```bash
# Test basic install command
stigmergy install

# Test abbreviated install command
stigmergy inst

# Test setup command
stigmergy setup
```

**Expected Results**:
- All commands should be recognized
- Should scan for missing tools
- Should provide installation instructions

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

### Test 5.2: Enhanced Installer Testing
**Objective**: Test the enhanced installer mentioned in code

**Test Command**:
```bash
node src/core/enhanced_installer.js
```

**Expected Results**:
- Should provide interactive installation
- Should handle multiple CLI tools
- Should show progress indicators

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

---

## PHASE 6: UPGRADE COMMAND TESTING

### Test 6.1: Upgrade Command Structure
**Objective**: Analyze upgrade command implementation

**Test Steps**:
1. ✅ Locate upgrade command in router.js
2. ✅ Analyze upgrade logic
3. ✅ Check error handling

**Analysis Results**:
- ✅ Upgrade command found at line 250
- ✅ Supports --dry-run, --force, --verbose options
- ✅ Uses `npm upgrade -g <tool>` for each tool
- ✅ Proper error handling and result reporting

**Status**: ✅ **ANALYZED** - Upgrade command is properly implemented

### Test 6.2: Upgrade Command Execution
**Objective**: Test upgrade command functionality

**Test Commands**:
```bash
# Test dry run upgrade
stigmergy upgrade --dry-run

# Test verbose upgrade
stigmergy upgrade --verbose

# Test forced upgrade
stigmergy upgrade --force
```

**Expected Results**:
- Should scan for installed tools
- Should show what would be upgraded
- Should handle upgrade process

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

---

## PHASE 7: DEPENDENCY AND MODULE TESTING

### Test 7.1: Core Module Loading
**Objective**: Test if all core modules load correctly

**Test Script**:
```bash
node -e "
const modules = [
  './src/core/smart_router',
  './src/core/installer',
  './src/core/upgrade_manager',
  './src/core/error_handler',
  './src/core/memory_manager',
  './src/core/cli_tools'
];

modules.forEach(mod => {
  try {
    require(mod);
    console.log('✅', mod);
  } catch (e) {
    console.log('❌', mod, e.message);
  }
});
"
```

**Expected Results**:
- All modules should load without errors
- Should show proper dependency resolution

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

### Test 7.2: External Dependencies
**Objective**: Test external dependency availability

**Test Script**:
```bash
node -e "
const deps = ['commander', 'inquirer', 'chalk', 'js-yaml', 'semver'];
deps.forEach(dep => {
  try {
    require(dep);
    console.log('✅', dep);
  } catch (e) {
    console.log('❌', dep, e.message);
  }
});
"
```

**Expected Results**:
- All dependencies should be available
- Should show version information

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

---

## PHASE 8: INTEGRATION TESTING

### Test 8.1: Fresh Installation Test
**Objective**: Test complete installation in clean environment

**Test Steps**:
1. Uninstall stigmergy: `npm uninstall -g stigmergy`
2. Clear npm cache: `npm cache clean --force`
3. Install fresh: `npm install -g stigmergy`
4. Test basic functionality: `stigmergy --help`
5. Check installation: `stigmergy status`

**Expected Results**:
- Installation should complete without errors
- Post-install script should execute
- CLI tools should be scanned
- Hooks should be deployed

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

### Test 8.2: Cross-Platform Compatibility
**Objective**: Test on different platforms

**Test Platforms**:
- Windows 10/11 (current)
- Linux (Ubuntu/Debian)
- macOS

**Expected Results**:
- Should work consistently across platforms
- Path handling should be correct
- Permission handling should be appropriate

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

---

## PHASE 9: SPECIFIC ISSUE DIAGNOSIS

### Test 9.1: NPM Post-Install Visibility
**Objective**: Test if post-install output is visible during npm install

**Test Steps**:
1. Create test package with similar post-install script
2. Install with verbose output: `npm install --verbose`
3. Check if post-install output appears

**Expected Results**:
- Post-install output should be visible
- Should see installation progress
- Should see completion messages

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

### Test 9.2: CLI Tool Detection Issues
**Objective**: Test CLI tool detection mechanism

**Test Script**:
```bash
node -e "
const Installer = require('./src/core/installer');
const installer = new Installer();

// Test individual CLI detection
installer.checkCLI('claude').then(result => {
  console.log('Claude detected:', result);
});

installer.checkCLI('npm').then(result => {
  console.log('NPM detected:', result);
});
"
```

**Expected Results**:
- Should accurately detect installed CLI tools
- Should handle missing tools gracefully
- Should provide debugging information

**Actual Results**: Needs testing

**Status**: 🔄 **TO TEST**

---

## PHASE 10: AUTOMATED TESTING SUITE

### Test 10.1: Comprehensive Test Runner
**Objective**: Create automated test script for all tests

**Test Script**: `test-installation.js`
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class InstallationTester {
  constructor() {
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  async runTest(testName, testFn) {
    this.totalTests++;
    try {
      console.log(`🧪 Running: ${testName}`);
      await testFn();
      console.log(`✅ PASS: ${testName}`);
      this.passedTests++;
      this.results.push({ name: testName, status: 'PASS' });
    } catch (error) {
      console.log(`❌ FAIL: ${testName}: ${error.message}`);
      this.results.push({ name: testName, status: 'FAIL', error: error.message });
    }
  }

  async testPackageJson() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    if (!packageJson.bin || !packageJson.bin.stigmergy) {
      throw new Error('Missing bin.stigmergy in package.json');
    }

    if (!packageJson.scripts || !packageJson.scripts.postinstall) {
      throw new Error('Missing postinstall script in package.json');
    }

    if (!packageJson.main) {
      throw new Error('Missing main entry point in package.json');
    }
  }

  async testBinaryExists() {
    if (!fs.existsSync('bin/stigmergy')) {
      throw new Error('Binary file bin/stigmergy does not exist');
    }
  }

  async testMainEntryExists() {
    if (!fs.existsSync('src/index.js')) {
      throw new Error('Main entry point src/index.js does not exist');
    }
  }

  async testInstallerModule() {
    try {
      require('./src/core/installer');
    } catch (error) {
      throw new Error(`Cannot load installer module: ${error.message}`);
    }
  }

  async testAutoInstallCommand() {
    const main = require('./src/index.js');
    if (typeof main !== 'function') {
      throw new Error('Main entry point is not a function');
    }
  }

  async printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 STIGMERGY INSTALLATION DIAGNOSTIC RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);

    if (this.results.length > 0) {
      console.log('\n📋 Detailed Results:');
      this.results.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : '❌';
        console.log(`  ${icon} ${result.name}`);
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        }
      });
    }

    console.log('\n💡 Recommendations:');
    if (this.passedTests === this.totalTests) {
      console.log('  🎉 All tests passed! Installation components are working correctly.');
      console.log('  📝 Next steps: Test actual installation and CLI functionality.');
    } else {
      console.log('  🔧 Some tests failed. Check the errors above for specific issues.');
      console.log('  📝 Fix identified issues before testing installation functionality.');
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Stigmergy CLI Installation Diagnostic Tests...\n');

    await this.runTest('Package.json Validation', () => this.testPackageJson());
    await this.runTest('Binary File Exists', () => this.testBinaryExists());
    await this.runTest('Main Entry Point Exists', () => this.testMainEntryExists());
    await this.runTest('Installer Module Loading', () => this.testInstallerModule());
    await this.runTest('Auto-Install Command Available', () => this.testAutoInstallCommand());

    await this.printResults();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new InstallationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = InstallationTester;
```

**Status**: 🔄 **TO IMPLEMENT**

---

## EXECUTION PLAN

### Immediate Tests (Run Now):
1. Module Loading Tests
2. Package.json Validation
3. Binary Functionality
4. Auto-Install Command Detection

### Installation Tests (After fixes):
1. Fresh Installation Test
2. Post-Install Script Execution
3. CLI Tool Scanning
4. Hook Deployment

### Integration Tests (Full System):
1. Cross-Platform Testing
2. CLI Command Functionality
3. Upgrade Command Testing
4. Error Handling Validation

---

## DIAGNOSTIC CHECKLIST

### ✅ COMPLETED ANALYSIS:
- [x] Package structure validation
- [x] Binary entry point verification
- [x] Main router analysis
- [x] Installation flow mapping
- [x] Upgrade command analysis

### 🔄 PENDING TESTING:
- [ ] Module loading tests
- [ ] Auto-install execution
- [ ] CLI scanning functionality
- [ ] Hook deployment mechanism
- [ ] Post-install visibility
- [ ] Installation command availability
- [ ] Upgrade command execution
- [ ] Cross-platform compatibility

### 📊 TEST CATEGORIES:
1. **Structure Tests** - Verify files and configuration
2. **Module Tests** - Check dependency loading
3. **Functionality Tests** - Test core features
4. **Integration Tests** - End-to-end workflows
5. **Platform Tests** - Cross-platform compatibility

---

## NEXT STEPS

1. **Run Phase 1-3 tests** to identify basic issues
2. **Fix any critical failures** found in initial tests
3. **Test actual installation process** with monitoring
4. **Validate CLI commands** work after installation
5. **Test upgrade functionality** with various scenarios
6. **Document findings** and provide fix recommendations

This comprehensive TDD approach will systematically identify exactly where the installation and upgrade processes are failing, providing clear direction for fixes.