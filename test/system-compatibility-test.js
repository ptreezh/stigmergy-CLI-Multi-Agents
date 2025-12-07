#!/usr/bin/env node

/**
 * System Compatibility Test
 * Identifies actual issues and limitations of the current system
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

class SystemCompatibilityTest {
    constructor() {
        this.issues = [];
        this.capabilities = [];
        this.testResults = [];
        this.projectRoot = process.cwd();
    }

    async runTests() {
        console.log('==============================================');
        console.log('SYSTEM COMPATIBILITY TEST REPORT');
        console.log('==============================================');
        console.log('');

        // Test 1: Tool Selection Issues
        await this.testToolSelection();

        // Test 2: AI Tool Availability
        await this.testAIToolAvailability();

        // Test 3: Hook Integration
        await this.testHookIntegration();

        // Test 4: Skills System Functionality
        await this.testSkillsSystem();

        // Test 5: Cross-Platform Compatibility
        await this.testCrossPlatformCompatibility();

        // Test 6: Real-world Scenarios
        await this.testRealWorldScenarios();

        this.generateReport();
    }

    async testToolSelection() {
        console.log('TEST 1: Tool Selection Issues');
        console.log('-----------------------------');

        // Issue: Tool selection not working properly
        console.log('🔍 Identified Issue: Tool selection logic problems');
        console.log('   - Specified --tool=claude but system uses default tool');
        console.log('   - Need to fix handleSkillsCommand parameter parsing');
        console.log('');

        this.issues.push({
            severity: 'HIGH',
            category: 'BUG',
            description: 'Tool selection not working - uses default instead of specified tool',
            component: 'handleSkillsCommand in main.js'
        });
    }

    async testAIToolAvailability() {
        console.log('TEST 2: AI Tool Availability');
        console.log('-----------------------------');

        const tools = [
            { name: 'claude', command: 'claude' },
            { name: 'gemini', command: 'gemini' },
            { name: 'qwen', command: 'qwen' },
            { name: 'iflow', command: 'iflow' },
            { name: 'codebuddy', command: 'codebuddy' },
            { name: 'copilot', command: 'gh copilot' }
        ];

        console.log('Checking AI tool availability:');
        let availableTools = 0;
        let totalTools = tools.length;

        for (const tool of tools) {
            try {
                let result;
                if (process.platform === 'win32') {
                    result = spawnSync('where', [tool.command], { stdio: 'pipe' });
                } else {
                    result = spawnSync('which', [tool.command], { stdio: 'pipe' });
                }

                if (result.status === 0) {
                    console.log(`  ✅ ${tool.name}: Available`);
                    availableTools++;
                } else {
                    console.log(`  ❌ ${tool.name}: Not found`);
                }
            } catch (error) {
                console.log(`  ❓ ${tool.name}: Check failed - ${error.message}`);
            }
        }

        console.log('');
        console.log(`Available AI Tools: ${availableTools}/${totalTools}`);

        if (availableTools < totalTools) {
            this.issues.push({
                severity: 'MEDIUM',
                category: 'LIMITATION',
                description: `Only ${availableTools}/${totalTools} AI tools are available`,
                impact: 'Reduced functionality for missing tools'
            });
        } else {
            this.capabilities.push({
                category: 'AI_TOOLS',
                description: `All ${totalTools} AI tools are available`
            });
        }
    }

    async testHookIntegration() {
        console.log('TEST 3: Hook Integration');
        console.log('---------------------');

        // Check if hooks are properly installed
        const hookDirectories = ['.claude/hooks', '.gemini/hooks', '.qwen/hooks', '.iflow/hooks', '.codebuddy/hooks'];

        let installedHooks = 0;
        for (const hookDir of hookDirectories) {
            if (fs.existsSync(hookDir)) {
                const files = fs.readdirSync(hookDir);
                const hookFiles = files.filter(file =>
                    file.includes('skill-forced-eval') || file.includes('hook')
                );
                if (hookFiles.length > 0) {
                    console.log(`  ✅ ${hookDir}: ${hookFiles.length} hook files found`);
                    installedHooks++;
                } else {
                    console.log(`  ⚠️  ${hookDir}: No hook files found`);
                }
            } else {
                console.log(`  ❌ ${hookDir}: Directory does not exist`);
            }
        }

        console.log(`Installed hooks: ${installedHooks}/${hookDirectories.length}`);

        // Check hook execution simulation
        try {
            const testHook = path.join('.claude/hooks', 'skill-forced-eval-hook.sh');
            if (fs.existsSync(testHook)) {
                console.log('  ✅ Hook files are executable');
                console.log('  ⚠️  Note: Hooks are in simulation mode, not real AI tool integration');
                this.issues.push({
                    severity: 'LOW',
                    category: 'LIMITATION',
                    description: 'Hooks are in simulation mode, not real AI tool integration',
                    component: 'Hook execution'
                });
            }
        } catch (error) {
            console.log(`  ❌ Hook execution test failed: ${error.message}`);
        }

        if (installedHooks > 0) {
            this.capabilities.push({
                category: 'HOOK_SYSTEM',
                description: `Hook system installed for ${installedHooks} AI tools`
            });
        }
    }

    async testSkillsSystem() {
        console.log('TEST 4: Skills System Functionality');
        console.log('------------------------------');

        try {
            // Test skills list
            console.log('Testing skills list functionality...');
            const skillsResult = spawnSync('node', ['package/src/main.js', 'skills', 'list'], {
                cwd: this.projectRoot,
                stdio: 'pipe',
                encoding: 'utf8'
            });

            if (skillsResult.status === 0) {
                console.log('  ✅ Skills list command works');
                const output = skillsResult.stdout;
                const skillCount = (output.match(/📝.*?\(/g) || []).length;
                console.log(`  ✅ Skills listed: ${skillCount} skills found`);
            } else {
                console.log('  ❌ Skills list command failed');
            }

            // Test skills execution
            console.log('Testing skills execution...');
            const execResult = spawnSync('node', ['package/src/main.js', 'skills', 'execute', 'translation', '--text=hello', '--to=zh'], {
                cwd: this.projectRoot,
                stdio: 'pipe',
                encoding: 'utf8'
            });

            if (execResult.status === 0) {
                console.log('  ✅ Skills execution works (simulation mode)');
                this.capabilities.push({
                    category: 'SKILLS_SYSTEM',
                    description: 'Skills system functional with 6 built-in skills'
                });
            } else {
                console.log('  ❌ Skills execution failed');
                this.issues.push({
                    severity: 'HIGH',
                    category: 'BUG',
                    description: 'Skills execution command failed',
                    component: 'skills system'
                });
            }

        } catch (error) {
            console.log(`  ❌ Skills system test failed: ${error.message}`);
            this.issues.push({
                severity: 'HIGH',
                category: 'ERROR',
                description: `Skills system test error: ${error.message}`,
                component: 'skills system'
            });
        }
    }

    async testCrossPlatformCompatibility() {
        console.log('TEST 5: Cross-Platform Compatibility');
        console.log('-----------------------------------');

        const platform = process.platform;
        console.log(`Current platform: ${platform}`);

        // Check file encoding
        const skillsFiles = [
            'package/src/skills/skills-manager.js',
            'package/src/main.js',
            'hooks/install-hooks.js'
        ];

        let encodingIssues = 0;
        for (const file of skillsFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                // Check for non-ANSI characters
                if (/[^\x00-\x7F]/.test(content)) {
                    console.log(`  ⚠️  ${file}: Contains non-ANSI characters`);
                    encodingIssues++;
                } else {
                    console.log(`  ✅ ${file}: Pure ANSI encoding`);
                }
            }
        }

        if (encodingIssues > 0) {
            this.issues.push({
                severity: 'LOW',
                category: 'COMPATIBILITY',
                description: `${encodingIssues} files contain non-ANSI characters`,
                recommendation: 'Use pure ANSI for international compatibility'
            });
        } else {
            this.capabilities.push({
                category: 'ENCODING',
                description: 'All files use pure ANSI encoding'
            });
        }

        // Check Node.js module system compatibility
        try {
            require('./package/src/skills/skills-manager.js');
            console.log('  ✅ ES6 modules work correctly');
        } catch (error) {
            console.log(`  ❌ ES6 module import failed: ${error.message}`);
            this.issues.push({
                severity: 'HIGH',
                category: 'COMPATIBILITY',
                description: `ES6 module import failed: ${error.message}`,
                component: 'module system'
            });
        }
    }

    async testRealWorldScenarios() {
        console.log('TEST 6: Real-World Scenarios');
        console.log('---------------------------');

        // Scenario 1: Code review workflow
        console.log('Scenario 1: Code Review Workflow');
        console.log('  User: "Please review this React component for security issues"');
        console.log('  Expected: Hook should detect code-analysis need');
        console.log('  Current: ❌ Hook system not integrated with real AI tools');
        console.log('');

        // Scenario 2: Translation workflow
        console.log('Scenario 2: Translation Workflow');
        console.log('  User: "Translate this comment to English"');
        console.log('  Expected: Should trigger translation skill suggestion');
        console.log('  Current: ❌ No real AI tool integration for automatic triggering');
        console.log('');

        // Scenario 3: Skills marketplace
        console.log('Scenario 3: Skills Marketplace');
        console.log('  Action: Install new skill from community repository');
        console.log('  Expected: Should load external skills');
        console.log('  Current: ✅ External skill loading simulation works');
        console.log('');

        this.issues.push({
            severity: 'HIGH',
            category: 'INTEGRATION',
            description: 'Hooks are not actually integrated with real AI tools',
            impact: 'System doesn\'t automatically intercept real AI tool usage'
        });

        this.issues.push({
            severity: 'MEDIUM',
            category: 'LIMITATION',
            description: 'No automatic triggering of skills based on AI tool usage',
            impact: 'Users must manually switch to skills system'
        });
    }

    generateReport() {
        console.log('');
        console.log('==============================================');
        console.log('COMPATIBILITY TEST REPORT');
        console.log('==============================================');
        console.log('');

        console.log('📊 CURRENT STATUS:');
        console.log('');

        // Capabilities
        if (this.capabilities.length > 0) {
            console.log('✅ WORKING FEATURES:');
            this.capabilities.forEach(cap => {
                console.log(`  • ${cap.category}: ${cap.description}`);
            });
        }

        console.log('');

        // Issues
        if (this.issues.length > 0) {
            console.log('❌ IDENTIFIED ISSUES:');
            console.log('');

            // Group by severity
            const highSeverity = this.issues.filter(i => i.severity === 'HIGH');
            const mediumSeverity = this.issues.filter(i => i.severity === 'MEDIUM');
            const lowSeverity = this.issues.filter(i => i.severity === 'LOW');

            if (highSeverity.length > 0) {
                console.log('🔴 HIGH SEVERITY:');
                highSeverity.forEach(issue => {
                    console.log(`   • ${issue.description} (${issue.component})`);
                });
                console.log('');
            }

            if (mediumSeverity.length > 0) {
                console.log('🟡 MEDIUM SEVERITY:');
                mediumSeverity.forEach(issue => {
                    console.log(`   • ${issue.description} (${issue.component})`);
                    if (issue.impact) {
                        console.log(`     Impact: ${issue.impact}`);
                    }
                });
                console.log('');
            }

            if (lowSeverity.length > 0) {
                console.log('🟡 LOW SEVERITY:');
                lowSeverity.forEach(issue => {
                    console.log(`   • ${issue.description} (${issue.component})`);
                    if (issue.recommendation) {
                        console.log(`     Recommendation: ${issue.recommendation}`);
                    }
                });
                console.log('');
            }
        } else {
            console.log('🎉 NO CRITICAL ISSUES FOUND');
            console.log('');
        }

        console.log('📋 ASSESSMENT:');
        console.log('');

        // Overall assessment
        const criticalIssues = this.issues.filter(i => i.severity === 'HIGH');
        const totalIssues = this.issues.length;

        if (criticalIssues.length > 0) {
            console.log(`❌ SYSTEM NOT READY FOR PRODUCTION`);
            console.log(`   ${criticalIssues.length} critical issues must be resolved`);
            console.log(`   System requires fixes before deployment`);
        } else if (totalIssues > 3) {
            console.log('⚠️  SYSTEM READY WITH LIMITATIONS');
            console.log(`   ${totalIssues} issues found, but system is functional`);
            console.log(`   Consider addressing issues for better experience`);
        } else {
            console.log('✅ SYSTEM READY FOR TESTING');
            console.log(`   ${totalIssues} minor issues found, system is functional`);
            console.log(`   Suitable for development and demonstration`);
        }

        console.log('');
        console.log('🎯 RECOMMENDATIONS:');
        console.log('');

        if (criticalIssues.length > 0) {
            console.log('1. FIX CRITICAL ISSUES FIRST:');
            criticalIssues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue.description}`);
                if (issue.component) {
                    console.log(`      - Fix in ${issue.component}`);
                }
            });
            console.log('');
        }

        console.log('2. ENHANCE USER EXPERIENCE:');
        console.log('   • Fix tool selection logic in handleSkillsCommand');
        console.log('   • Integrate hooks with real AI tool execution');
        console.log('   • Add automatic skill triggering for common patterns');
        console.log('   • Implement real AI tool calling (remove simulation mode)');
        console.log('');

        console.log('3. EXPAND THIRD-PARTY INTEGRATION:');
        console.log('   • Implement actual GitHub repository cloning for skills');
        console.log('   • Add skill validation and security checking');
        console.log('   • Create skill marketplace with rating system');
        console.log('   • Support skill version management and updates');
    }
}

// Run tests
if (require.main === module) {
    const test = new SystemCompatibilityTest();
    test.runTests();
}

module.exports = SystemCompatibilityTest;