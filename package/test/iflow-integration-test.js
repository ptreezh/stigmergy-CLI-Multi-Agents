#!/usr/bin/env node

/**
 * iFlow Stigmergy Integration Test
 * This script tests if iFlow can properly detect and use Stigmergy hooks
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class IFlowIntegrationTester {
    constructor() {
        this.iflowConfigDir = path.join(os.homedir(), '.iflow');
        this.iflowHooksDir = path.join(this.iflowConfigDir, 'hooks');
    }
    
    // Check if iFlow config directory exists
    async checkIFlowConfig() {
        try {
            await fs.access(this.iflowConfigDir);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    // Check if iFlow hooks directory exists and has Stigmergy files
    async checkIFlowHooks() {
        try {
            await fs.access(this.iflowHooksDir);
            const files = await fs.readdir(this.iflowHooksDir);
            const stigmergyFiles = files.filter(file => 
                file.includes('stigmergy') || 
                file.includes('Stigmergy') ||
                file.includes('hook') ||
                file.includes('adapter')
            );
            
            return {
                exists: true,
                files: files,
                stigmergyFiles: stigmergyFiles,
                path: this.iflowHooksDir
            };
        } catch (error) {
            return {
                exists: false,
                files: [],
                stigmergyFiles: [],
                path: this.iflowHooksDir
            };
        }
    }
    
    // Check if iFlow has hooks configuration
    async checkIFlowHooksConfig() {
        // Check multiple possible config locations
        const configLocations = [
            path.join(os.homedir(), '.config', 'iflow', 'hooks.yml'),
            path.join(os.homedir(), '.config', 'iflow', 'hooks.yaml'),
            path.join(os.homedir(), '.iflow', 'hooks.yml'),
            path.join(os.homedir(), '.iflow', 'hooks.yaml'),
            path.join(os.homedir(), '.iflow', 'config.yml'),
            path.join(os.homedir(), '.iflow', 'settings.json')
        ];
        
        for (const configFile of configLocations) {
            try {
                await fs.access(configFile);
                const content = await fs.readFile(configFile, 'utf8');
                if (content.includes('hooks') || content.includes('plugins') || content.includes('CrossCLIHookAdapter')) {
                    return {
                        exists: true,
                        path: configFile,
                        hasHooksSection: true,
                        contentPreview: content.substring(0, 200)
                    };
                }
            } catch (error) {
                // File doesn't exist, continue to next
            }
        }
        
        return {
            exists: false,
            path: null,
            hasHooksSection: false,
            contentPreview: ''
        };
    }
    
    // Test iFlow hooks command
    async testIFlowHooksCommand() {
        return new Promise((resolve) => {
            const child = spawn('iflow', ['hooks'], {
                stdio: 'pipe',
                timeout: 10000
            });
            
            let stdout = '';
            let stderr = '';
            
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            child.on('close', (code) => {
                resolve({
                    success: code === 0,
                    code: code,
                    stdout: stdout,
                    stderr: stderr,
                    output: stdout + stderr
                });
            });
            
            child.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message,
                    stdout: '',
                    stderr: '',
                    output: ''
                });
            });
        });
    }
    
    // Test iFlow plugin command
    async testIFlowPluginCommand() {
        return new Promise((resolve) => {
            const child = spawn('iflow', ['plugins'], {
                stdio: 'pipe',
                timeout: 10000
            });
            
            let stdout = '';
            let stderr = '';
            
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            child.on('close', (code) => {
                resolve({
                    success: code === 0,
                    code: code,
                    stdout: stdout,
                    stderr: stderr,
                    output: stdout + stderr
                });
            });
            
            child.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message,
                    stdout: '',
                    stderr: '',
                    output: ''
                });
            });
        });
    }
    
    // Run comprehensive iFlow integration test
    async runIntegrationTest() {
        console.log('iFlow Stigmergy Integration Test');
        console.log('='.repeat(40));
        
        // Test 1: Check iFlow configuration
        console.log('\n[Test 1] Checking iFlow configuration...');
        const configExists = await this.checkIFlowConfig();
        console.log(`  Config directory exists: ${configExists ? 'âœ? : 'âœ?}`);
        
        // Test 2: Check iFlow hooks directory
        console.log('\n[Test 2] Checking iFlow hooks directory...');
        const hooksInfo = await this.checkIFlowHooks();
        console.log(`  Hooks directory exists: ${hooksInfo.exists ? 'âœ? : 'âœ?}`);
        console.log(`  Total files: ${hooksInfo.files.length}`);
        console.log(`  Stigmergy-related files: ${hooksInfo.stigmergyFiles.length}`);
        if (hooksInfo.stigmergyFiles.length > 0) {
            console.log('  Stigmergy files found:');
            hooksInfo.stigmergyFiles.forEach(file => console.log(`    - ${file}`));
        }
        
        // Test 3: Check hooks configuration
        console.log('\n[Test 3] Checking hooks configuration...');
        const hooksConfig = await this.checkIFlowHooksConfig();
        console.log(`  Config file exists: ${hooksConfig.exists ? 'âœ? : 'âœ?}`);
        console.log(`  Has hooks section: ${hooksConfig.hasHooksSection ? 'âœ? : 'âœ?}`);
        
        // Test 4: Test iFlow hooks command
        console.log('\n[Test 4] Testing iFlow hooks command...');
        const hooksCommandResult = await this.testIFlowHooksCommand();
        console.log(`  Command success: ${hooksCommandResult.success ? 'âœ? : 'âœ?}`);
        console.log(`  Exit code: ${hooksCommandResult.code}`);
        if (hooksCommandResult.output) {
            const preview = hooksCommandResult.output.substring(0, 200);
            console.log(`  Output preview: ${preview}${hooksCommandResult.output.length > 200 ? '...' : ''}`);
            
            // Check if Stigmergy is mentioned in output
            if (hooksCommandResult.output.toLowerCase().includes('stigmergy')) {
                console.log('  âœ?Stigmergy detected in hooks output');
            } else {
                console.log('  âœ?Stigmergy not detected in hooks output');
            }
        }
        
        // Test 5: Test iFlow plugin command
        console.log('\n[Test 5] Testing iFlow plugin command...');
        const pluginCommandResult = await this.testIFlowPluginCommand();
        console.log(`  Command success: ${pluginCommandResult.success ? 'âœ? : 'âœ?}`);
        console.log(`  Exit code: ${pluginCommandResult.code}`);
        if (pluginCommandResult.output) {
            const preview = pluginCommandResult.output.substring(0, 200);
            console.log(`  Output preview: ${preview}${pluginCommandResult.output.length > 200 ? '...' : ''}`);
            
            // Check if Stigmergy is mentioned in output
            if (pluginCommandResult.output.toLowerCase().includes('stigmergy')) {
                console.log('  âœ?Stigmergy detected in plugins output');
            } else {
                console.log('  âœ?Stigmergy not detected in plugins output');
            }
        }
        
        // Summary
        console.log('\n' + '='.repeat(40));
        console.log('Integration Test Summary:');
        console.log('='.repeat(40));
        
        const results = {
            configExists,
            hooksDirectoryExists: hooksInfo.exists,
            stigmergyHooksPresent: hooksInfo.stigmergyFiles.length > 0,
            hooksCommandWorks: hooksCommandResult.success,
            pluginsCommandWorks: pluginCommandResult.success,
            stigmergyDetectedInHooks: hooksCommandResult.output.toLowerCase().includes('stigmergy'),
            stigmergyDetectedInPlugins: pluginCommandResult.output.toLowerCase().includes('stigmergy')
        };
        
        Object.entries(results).forEach(([test, result]) => {
            console.log(`${test}: ${result ? 'âœ?PASS' : 'âœ?FAIL'}`);
        });
        
        const passedTests = Object.values(results).filter(Boolean).length;
        const totalTests = Object.values(results).length;
        
        console.log(`\nOverall Result: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('âœ?iFlow Stigmergy integration is working correctly!');
        } else if (passedTests > 0) {
            console.log('âš?iFlow Stigmergy integration is partially working.');
        } else {
            console.log('âœ?iFlow Stigmergy integration is not working.');
        }
        
        return results;
    }
}

// Run the test
async function runIFlowIntegrationTest() {
    const tester = new IFlowIntegrationTester();
    const results = await tester.runIntegrationTest();
    
    return results;
}

// Export for use in other modules
module.exports = { IFlowIntegrationTester };

// Run if called directly
if (require.main === module) {
    runIFlowIntegrationTest().then(results => {
        process.exit(0);
    }).catch(error => {
        console.error('[Test Failed]:', error.message);
        process.exit(1);
    });
}
