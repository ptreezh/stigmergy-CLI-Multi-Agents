#!/usr/bin/env node

/**
 * Stigmergy Post-Deployment Configuration Fixer
 * This script runs the necessary installation scripts to properly configure
 * the deployed hooks for each CLI tool
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

// CLI Tools Configuration with installation scripts
const CLI_TOOLS = {
    claude: {
        name: 'Claude CLI',
        installScript: 'install_claude_integration.py',
        hooksDir: path.join(os.homedir(), '.claude', 'hooks')
    },
    gemini: {
        name: 'Gemini CLI',
        installScript: 'install_gemini_integration.py',
        hooksDir: path.join(os.homedir(), '.gemini', 'extensions')
    },
    qwen: {
        name: 'Qwen CLI',
        installScript: 'install_qwen_integration.py',
        hooksDir: path.join(os.homedir(), '.qwen', 'hooks')
    },
    iflow: {
        name: 'iFlow CLI',
        installScript: 'install_iflow_integration.py',
        hooksDir: path.join(os.homedir(), '.iflow', 'hooks')
    },
    qodercli: {
        name: 'Qoder CLI',
        installScript: 'install_qoder_integration.py',
        hooksDir: path.join(os.homedir(), '.qoder', 'hooks')
    },
    codebuddy: {
        name: 'CodeBuddy CLI',
        installScript: 'install_codebuddy_integration.py',
        hooksDir: path.join(os.homedir(), '.codebuddy', 'hooks')
    },
    copilot: {
        name: 'GitHub Copilot CLI',
        installScript: 'install_copilot_integration.py',
        hooksDir: path.join(os.homedir(), '.copilot', 'mcp')
    },
    codex: {
        name: 'OpenAI Codex CLI',
        installScript: 'install_codex_integration.py',
        hooksDir: path.join(os.homedir(), '.config', 'codex', 'slash_commands')
    }
};

class PostDeploymentConfigurer {
    constructor() {
        this.stigmergyAssetsDir = path.join(os.homedir(), '.stigmergy', 'assets', 'adapters');
    }
    
    // Check if an installation script exists
    async checkInstallScript(toolName) {
        const tool = CLI_TOOLS[toolName];
        if (!tool) return { exists: false, path: '' };
        
        // Mapping for tool names that don't match their adapter directory names
        const toolNameToAdapterDir = {
            'qodercli': 'qoder',
            'qwencode': 'qwen'
        };
        const adapterDirName = toolNameToAdapterDir[toolName] || toolName;
        const scriptPath = path.join(this.stigmergyAssetsDir, adapterDirName, tool.installScript);
        
        try {
            await fs.access(scriptPath);
            return { exists: true, path: scriptPath };
        } catch (error) {
            return { exists: false, path: scriptPath };
        }
    }
    
    // Run an installation script
    async runInstallScript(toolName) {
        const tool = CLI_TOOLS[toolName];
        if (!tool) return { success: false, error: 'Tool not found' };
        
        const scriptInfo = await this.checkInstallScript(toolName);
        if (!scriptInfo.exists) {
            return { success: false, error: 'Installation script not found' };
        }
        
        console.log(`[RUN] Running installation script for ${tool.name}...`);
        console.log(`      Script: ${scriptInfo.path}`);
        
        return new Promise((resolve) => {
            // Use Python to run the script
            const child = spawn('python', [scriptInfo.path], {
                cwd: path.dirname(scriptInfo.path),
                stdio: 'pipe',
                timeout: 30000 // 30 second timeout
            });
            
            let stdout = '';
            let stderr = '';
            
            child.stdout.on('data', (data) => {
                stdout += data.toString();
                // Print output in real-time
                process.stdout.write(data.toString());
            });
            
            child.stderr.on('data', (data) => {
                stderr += data.toString();
                // Print errors in real-time
                process.stderr.write(data.toString());
            });
            
            child.on('close', (code) => {
                if (code === 0) {
                    console.log(`[OK] ${tool.name} installation script completed successfully`);
                    resolve({ success: true, code: code, stdout: stdout, stderr: stderr });
                } else {
                    console.log(`[ERROR] ${tool.name} installation script failed with code ${code}`);
                    resolve({ success: false, code: code, stdout: stdout, stderr: stderr, error: `Script exited with code ${code}` });
                }
            });
            
            child.on('error', (error) => {
                console.log(`[ERROR] Failed to run ${tool.name} installation script: ${error.message}`);
                resolve({ success: false, error: error.message, stdout: stdout, stderr: stderr });
            });
        });
    }
    
    // Configure a specific tool
    async configureTool(toolName) {
        console.log(`\n[CONFIG] Configuring ${CLI_TOOLS[toolName].name}...`);
        
        const result = {
            toolName: toolName,
            toolNameDisplay: CLI_TOOLS[toolName].name,
            scriptExists: false,
            runSuccess: false,
            error: null
        };
        
        // Check if installation script exists
        const scriptInfo = await this.checkInstallScript(toolName);
        result.scriptExists = scriptInfo.exists;
        
        if (!scriptInfo.exists) {
            console.log(`  [SKIP] No installation script found for ${CLI_TOOLS[toolName].name}`);
            result.error = 'Installation script not found';
            return result;
        }
        
        console.log(`  [FOUND] Installation script: ${scriptInfo.path}`);
        
        // Run the installation script
        const runResult = await this.runInstallScript(toolName);
        result.runSuccess = runResult.success;
        result.error = runResult.error;
        
        if (runResult.success) {
            console.log(`  [SUCCESS] ${CLI_TOOLS[toolName].name} configured successfully`);
        } else {
            console.log(`  [FAILED] ${CLI_TOOLS[toolName].name} configuration failed: ${runResult.error || 'Unknown error'}`);
        }
        
        return result;
    }
    
    // Configure all tools
    async configureAllTools() {
        console.log('Stigmergy Post-Deployment Configuration');
        console.log('='.repeat(50));
        
        const toolNames = Object.keys(CLI_TOOLS);
        const results = [];
        
        for (const toolName of toolNames) {
            const result = await this.configureTool(toolName);
            results.push(result);
        }
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('Configuration Summary:');
        console.log('='.repeat(50));
        
        const successCount = results.filter(r => r.runSuccess).length;
        const totalCount = results.length;
        
        results.forEach(result => {
            const status = result.runSuccess ? 'âœ?SUCCESS' : 
                          result.scriptExists ? 'âœ?FAILED' : ' SKIP';
            console.log(`${result.toolNameDisplay}: ${status}`);
        });
        
        console.log(`\nOverall: ${successCount}/${totalCount} tools configured successfully`);
        
        if (successCount === totalCount) {
            console.log('ðŸŽ‰ All tools configured successfully!');
        } else if (successCount > 0) {
            console.log('âš?Some tools configured, some failed or skipped.');
        } else {
            console.log('â?No tools configured successfully.');
        }
        
        return results;
    }
    
    // Quick fix for iFlow specifically
    async quickFixIFlow() {
        console.log('\n[QUICK FIX] Running iFlow configuration...');
        
        try {
            // Check if iFlow hooks directory exists
            const iflowHooksDir = path.join(os.homedir(), '.iflow', 'hooks');
            await fs.access(iflowHooksDir);
            
            // Check if install script exists
            const installScript = path.join(iflowHooksDir, 'install_iflow_integration.py');
            await fs.access(installScript);
            
            console.log('  [FOUND] iFlow installation script');
            
            // Run the script
            const child = spawn('python', [installScript], {
                cwd: iflowHooksDir,
                stdio: 'inherit',
                timeout: 30000
            });
            
            return new Promise((resolve) => {
                child.on('close', (code) => {
                    if (code === 0) {
                        console.log('  [SUCCESS] iFlow configured successfully');
                        resolve(true);
                    } else {
                        console.log(`  [FAILED] iFlow configuration failed with code ${code}`);
                        resolve(false);
                    }
                });
                
                child.on('error', (error) => {
                    console.log(`  [ERROR] Failed to run iFlow configuration: ${error.message}`);
                    resolve(false);
                });
            });
            
        } catch (error) {
            console.log(`  [ERROR] Cannot configure iFlow: ${error.message}`);
            return false;
        }
    }
}

// Run the configuration
async function runPostDeploymentConfiguration() {
    const configurer = new PostDeploymentConfigurer();
    
    // Check if Python is available
    try {
        const pythonCheck = spawn('python', ['--version']);
        await new Promise((resolve, reject) => {
            pythonCheck.on('close', resolve);
            pythonCheck.on('error', reject);
        });
        console.log('âœ?Python is available');
    } catch (error) {
        console.log('âœ?Python is not available. Installation scripts require Python.');
        console.log('  Please install Python 3.8+ and try again.');
        process.exit(1);
    }
    
    // Run full configuration
    const results = await configurer.configureAllTools();
    
    return results;
}

// Export for use in other modules
module.exports = { PostDeploymentConfigurer };

// Run if called directly
if (require.main === module) {
    runPostDeploymentConfiguration().then(results => {
        process.exit(0);
    }).catch(error => {
        console.error('[Configuration Failed]:', error.message);
        process.exit(1);
    });
}
