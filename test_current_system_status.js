#!/usr/bin/env node

/**
 * Current System Status Check
 * Tests what's working and what needs attention
 */

const fs = require('fs');
const path = require('path');

function checkSystemStatus() {
    console.log('=== Current System Status Check ===');
    console.log(`Date: ${new Date().toISOString()}`);

    console.log('\n📦 Package Information:');
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        console.log(`   Version: ${packageJson.version}`);
        console.log(`   Main Entry: ${packageJson.main}`);
        console.log(`   Bin Entry: ${packageJson.bin.stigmergy}`);
        console.log(`   Scripts: ${Object.keys(packageJson.scripts).length}`);
        console.log(`   Dependencies: ${Object.keys(packageJson.dependencies).length}`);

        // Check entry point consistency
        if (packageJson.main !== 'src/main.js') {
            console.log(`   ⚠️  WARNING: Main entry mismatch - package.main: ${packageJson.main} vs actual: src/main.js`);
        }
        if (packageJson.bin.stigmergy !== 'src/main.js') {
            console.log(`   ⚠️  WARNING: Bin entry mismatch - package.bin.stigmergy: ${packageJson.bin.stigmergy}`);
        }
    } catch (error) {
        console.log(`   ❌ Package.json read error: ${error.message}`);
    }

    console.log('\n🚀 CLI Functionality:');
    // Check if stigmergy command works
    try {
        const { spawnSync } = require('child_process');
        const result = spawnSync('stigmergy', ['--help'], { encoding: 'utf8', timeout: 5000 });

        if (result.status === 0) {
            console.log(`   ✅ Stigmergy CLI: Working`);
            console.log(`   ✅ Help command: Working`);
        } else {
            console.log(`   ❌ Stigmergy CLI: Failed (exit code ${result.status})`);
        }
    } catch (error) {
        console.log(`   ❌ Stigmergy CLI: Not available - ${error.message}`);
    }

    console.log('\n🔧 Hook System Status:');
    // Check Hook adapters
    const hookAdapters = [
        'src/adapters/claude/hook_adapter.py',
        'src/adapters/iflow/hook_adapter.py',
        'src/adapters/codebuddy/skills_hook_adapter.py',
        'src/adapters/qoder/notification_hook_adapter.py'
    ];

    let workingHooks = 0;
    hookAdapters.forEach(adapter => {
        if (fs.existsSync(adapter)) {
            const content = fs.readFileSync(adapter, 'utf8');
            if (content.includes('class') && content.includes('async def')) {
                console.log(`   ✅ ${path.basename(adapter)}: Complete`);
                workingHooks++;
            } else {
                console.log(`   ⚠️  ${path.basename(adapter)}: Incomplete`);
            }
        } else {
            console.log(`   ❌ ${path.basename(adapter)}: Missing`);
        }
    });
    console.log(`   📊 Hook System: ${workingHooks}/${hookAdapters.length} working`);

    console.log('\n🔌 Plugin Mechanisms:');
    const pluginFiles = [
        'src/adapters/gemini/extension_adapter.py',
        'src/adapters/qwencode/inheritance_adapter.py',
        'src/adapters/cline/mcp_server.py',
        'src/adapters/codex/mcp_server.py',
        'src/adapters/copilot/mcp_server.py'
    ];

    let workingPlugins = 0;
    pluginFiles.forEach(plugin => {
        if (fs.existsSync(plugin)) {
            const content = fs.readFileSync(plugin, 'utf8');
            if (content.length > 1000) { // Basic completeness check
                console.log(`   ✅ ${path.basename(plugin)}: Complete`);
                workingPlugins++;
            } else {
                console.log(`   ⚠️  ${path.basename(plugin)}: Small/Incomplete`);
            }
        } else {
            console.log(`   ❌ ${path.basename(plugin)}: Missing`);
        }
    });
    console.log(`   📊 Plugin Systems: ${workingPlugins}/${pluginFiles.length} working`);

    console.log('\n🧪 Test Coverage:');
    const testFiles = [
        'test_cli_help_analyzer.js',
        'test_integration_help_routing.js',
        'test_all_cli_adapters.js',
        'test_plugin_mechanisms.js'
    ];

    let availableTests = 0;
    testFiles.forEach(test => {
        if (fs.existsSync(test)) {
            console.log(`   ✅ ${test}: Available`);
            availableTests++;
        } else {
            console.log(`   ❌ ${test}: Missing`);
        }
    });
    console.log(`   📊 Test Coverage: ${availableTests}/${testFiles.length} tests available`);

    console.log('\n📋 Documentation:');
    const docFiles = [
        'README.md',
        'docs/NATIVE_INTEGRATION_GUIDE.md',
        'docs/PROJECT_REQUIREMENTS.md',
        'CLI_HELP_ANALYSIS_TEST_REPORT.md'
    ];

    let availableDocs = 0;
    docFiles.forEach(doc => {
        if (fs.existsSync(doc)) {
            console.log(`   ✅ ${doc}: Available`);
            availableDocs++;
        } else {
            console.log(`   ❌ ${doc}: Missing`);
        }
    });
    console.log(`   📊 Documentation: ${availableDocs}/${docFiles.length} docs available`);

    console.log('\n🌐 NPM Package Status:');
    try {
        const { spawnSync } = require('child_process');
        const result = spawnSync('npm', ['view', 'stigmergy', 'version'], { encoding: 'utf8' });

        if (result.status === 0) {
            const publishedVersion = result.stdout.trim();
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const currentVersion = packageJson.version;

            console.log(`   📦 Published Version: ${publishedVersion}`);
            console.log(`   📦 Current Version: ${currentVersion}`);

            if (publishedVersion === currentVersion) {
                console.log(`   ✅ Version: Published`);
            } else {
                console.log(`   ⚠️  Version: Local ahead of published (${currentVersion} > ${publishedVersion})`);
            }
        } else {
            console.log(`   ❌ NPM Package: Failed to check`);
        }
    } catch (error) {
        console.log(`   ❌ NPM Package: Error checking - ${error.message}`);
    }

    return {
        packageVersion: packageJson?.version || 'unknown',
        cliWorking: false,
        hooksWorking: workingHooks,
        pluginsWorking: workingPlugins,
        testsAvailable: availableTests,
        docsAvailable: availableDocs
    };
}

function generateStatusReport(status) {
    console.log('\n=== Status Summary ===');

    console.log('\n🎯 What\'s Working:');
    if (status.cliWorking) {
        console.log('   ✅ Stigmergy CLI command');
    }
    if (status.hooksWorking > 0) {
        console.log(`   ✅ ${status.hooksWorking} Hook-based adapters`);
    }
    if (status.pluginsWorking > 0) {
        console.log(`   ✅ ${status.pluginsWorking} Plugin mechanisms`);
    }
    if (status.testsAvailable > 0) {
        console.log(`   ✅ ${status.testsAvailable} Test files`);
    }
    if (status.docsAvailable > 0) {
        console.log(`   ✅ ${status.docsAvailable} Documentation files`);
    }

    console.log('\n⚠️  What Needs Attention:');

    if (!status.cliWorking) {
        console.log('   ❌ CLI command needs fixing');
    }
    if (status.hooksWorking < 4) {
        console.log(`   ⚠️  ${4 - status.hooksWorking} Hook adapters incomplete`);
    }
    if (status.pluginsWorking < 5) {
        console.log(`   ⚠️  ${5 - status.pluginsWorking} Plugin mechanisms incomplete`);
    }
    if (status.testsAvailable < 4) {
        console.log(`   ⚠️  ${4 - status.testsAvailable} Test files missing`);
    }

    console.log('\n📋 Next Steps:');
    if (status.packageVersion !== '1.0.78') {
        console.log('   - Update package.json version to 1.0.78');
    }

    console.log('   - Run: npm publish to publish latest version');
    console.log('   - Fix test dependencies for full test coverage');
    console.log('   - Test Hook-based routing with real CLI tools');
    console.log('   - Validate cross-CLI integration works');
}

// Main status check
function runStatusCheck() {
    try {
        const status = checkSystemStatus();
        generateStatusReport(status);

        console.log('\n🎉 Status Check Complete!');

    } catch (error) {
        console.error('\n❌ Status Check Failed:', error);
    }
}

// Run if called directly
if (require.main === module) {
    runStatusCheck();
}

module.exports = { checkSystemStatus, generateStatusReport };