#!/usr/bin/env node

/**
 * Simple iFlow Hook Detection Test
 * This script tests if iFlow can detect the Stigmergy hook configuration
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

async function testIFlowHookDetection() {
    console.log('Simple iFlow Hook Detection Test');
    console.log('='.repeat(40));
    
    // Check if the hook configuration file exists and is properly formatted
    const hookConfigPath = path.join(os.homedir(), '.config', 'iflow', 'hooks.yml');
    
    try {
        await fs.access(hookConfigPath);
        console.log('âœ?Hook configuration file exists');
        
        const configContent = await fs.readFile(hookConfigPath, 'utf8');
        console.log('âœ?Configuration file is readable');
        
        // Check if it contains the expected Stigmergy configuration
        if (configContent.includes('CrossCLIHookAdapter')) {
            console.log('âœ?Stigmergy CrossCLIHookAdapter found in configuration');
        } else {
            console.log('âœ?Stigmergy CrossCLIHookAdapter not found in configuration');
        }
        
        if (configContent.includes('cross_cli_enabled: true')) {
            console.log('âœ?Cross-CLI functionality is enabled');
        } else {
            console.log('âœ?Cross-CLI functionality is not enabled');
        }
        
        // Parse the YAML to verify structure
        try {
            const yaml = await import('js-yaml');
            const parsedConfig = yaml.load(configContent);
            
            if (parsedConfig && parsedConfig.plugins && Array.isArray(parsedConfig.plugins)) {
                console.log('âœ?Configuration has valid plugin structure');
                
                const stigmergyPlugin = parsedConfig.plugins.find(plugin => 
                    plugin.name === 'CrossCLIHookAdapter'
                );
                
                if (stigmergyPlugin) {
                    console.log('âœ?Stigmergy plugin found in parsed configuration');
                    console.log('  Plugin details:');
                    console.log(`    Name: ${stigmergyPlugin.name}`);
                    console.log(`    Module: ${stigmergyPlugin.module}`);
                    console.log(`    Enabled: ${stigmergyPlugin.enabled}`);
                    console.log(`    Supported CLIs: ${stigmergyPlugin.config?.supported_clis?.join(', ') || 'None'}`);
                } else {
                    console.log('âœ?Stigmergy plugin not found in parsed configuration');
                }
            } else {
                console.log('âœ?Configuration does not have valid plugin structure');
            }
        } catch (parseError) {
            console.log('âš?Could not parse YAML configuration:', parseError.message);
        }
        
    } catch (error) {
        console.log('âœ?Hook configuration file not found or not accessible');
        console.log('  Path:', hookConfigPath);
        console.log('  Error:', error.message);
        return false;
    }
    
    // Test if iFlow can load the configuration by running a simple command
    console.log('\n[Test] Running iFlow with debug mode to check hook loading...');
    
    return new Promise((resolve) => {
        const child = spawn('iflow', ['--debug', '--prompt', 'echo "test"'], {
            stdio: 'pipe',
            timeout: 15000
        });
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
            const fullOutput = output + errorOutput;
            
            console.log(`Exit code: ${code}`);
            
            // Look for hook-related messages in the output
            if (fullOutput.includes('hook') || fullOutput.includes('Hook') || fullOutput.includes('plugin')) {
                console.log('âœ?Hook/plugin related messages found in iFlow output');
                
                // Look specifically for Stigmergy-related messages
                if (fullOutput.includes('stigmergy') || fullOutput.includes('Stigmergy') || 
                    fullOutput.includes('CrossCLI') || fullOutput.includes('cross')) {
                    console.log('âœ?Stigmergy-related messages found in iFlow output');
                } else {
                    console.log('â„?Stigmergy-specific messages not found, but hooks are mentioned');
                }
            } else {
                console.log('â„?No hook/plugin messages found in iFlow output');
            }
            
            // Show a preview of the output
            const preview = fullOutput.substring(0, 500);
            console.log('\nOutput preview:');
            console.log(preview + (fullOutput.length > 500 ? '...' : ''));
            
            resolve(true);
        });
        
        child.on('error', (error) => {
            console.log('âœ?Failed to run iFlow:', error.message);
            resolve(false);
        });
    });
}

// Run the test
testIFlowHookDetection().then(() => {
    console.log('\n' + '='.repeat(40));
    console.log('Test completed');
}).catch(error => {
    console.error('Test failed:', error.message);
});
