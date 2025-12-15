#!/usr/bin/env node

/**
 * Stigmergy Plugin Deployment Test
 * This script tests the plugin deployment mechanism for all supported CLI tools
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

// CLI Tools Configuration (same as in index.js)
const CLI_TOOLS = {
    claude: {
        name: 'Claude CLI',
        version: 'claude --version',
        install: 'npm install -g @anthropic-ai/claude-code',
        hooksDir: path.join(os.homedir(), '.claude', 'hooks'),
        config: path.join(os.homedir(), '.claude', 'config.json')
    },
    gemini: {
        name: 'Gemini CLI',
        version: 'gemini --version',
        install: 'npm install -g @google/gemini-cli',
        hooksDir: path.join(os.homedir(), '.gemini', 'extensions'),
        config: path.join(os.homedir(), '.gemini', 'config.json')
    },
    qwen: {
        name: 'Qwen CLI',
        version: 'qwen --version',
        install: 'npm install -g @qwen-code/qwen-code',
        hooksDir: path.join(os.homedir(), '.qwen', 'hooks'),
        config: path.join(os.homedir(), '.qwen', 'config.json')
    },
    iflow: {
        name: 'iFlow CLI',
        version: 'iflow --version',
        install: 'npm install -g @iflow-ai/iflow-cli',
        hooksDir: path.join(os.homedir(), '.iflow', 'hooks'),
        config: path.join(os.homedir(), '.iflow', 'config.json')
    },
    qodercli: {
        name: 'Qoder CLI',
        version: 'qodercli --version',
        install: 'npm install -g @qoder-ai/qodercli',
        hooksDir: path.join(os.homedir(), '.qoder', 'hooks'),
        config: path.join(os.homedir(), '.qoder', 'config.json')
    },
    codebuddy: {
        name: 'CodeBuddy CLI',
        version: 'codebuddy --version',
        install: 'npm install -g @tencent-ai/codebuddy-code',
        hooksDir: path.join(os.homedir(), '.codebuddy', 'hooks'),
        config: path.join(os.homedir(), '.codebuddy', 'config.json')
    },
    copilot: {
        name: 'GitHub Copilot CLI',
        version: 'copilot --version',
        install: 'npm install -g @github/copilot',
        hooksDir: path.join(os.homedir(), '.copilot', 'mcp'),
        config: path.join(os.homedir(), '.copilot', 'config.json')
    },
    codex: {
        name: 'OpenAI Codex CLI',
        version: 'codex --version',
        install: 'npm install -g @openai/codex',
        hooksDir: path.join(os.homedir(), '.config', 'codex', 'slash_commands'),
        config: path.join(os.homedir(), '.codex', 'config.json')
    }
};

class PluginDeploymentTester {
    constructor() {
        this.results = {};
    }
    
    // Check if a CLI tool is installed
    async isToolInstalled(toolName) {
        const tool = CLI_TOOLS[toolName];
        if (!tool) return false;
        
        // Extract the actual command from the version string
        const command = tool.version.split(' ')[0];
        
        return new Promise((resolve) => {
            const child = spawn(command, ['--version'], {
                stdio: 'pipe',
                timeout: 5000
            });
            
            let output = '';
            let error = '';
            
            child.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            child.stderr.on('data', (data) => {
                error += data.toString();
            });
            
            child.on('close', (code) => {
                resolve(code === 0 && (output.length > 0 || error.length > 0));
            });
            
            child.on('error', () => {
                resolve(false);
            });
        });
    }
    
    // Check if hooks directory exists and has files
    async checkHooksDirectory(toolName) {
        const tool = CLI_TOOLS[toolName];
        if (!tool) return { exists: false, files: [] };
        
        try {
            await fs.access(tool.hooksDir);
            const files = await fs.readdir(tool.hooksDir);
            return { 
                exists: true, 
                files: files,
                path: tool.hooksDir
            };
        } catch (error) {
            return { exists: false, files: [], path: tool.hooksDir };
        }
    }
    
    // Check if Stigmergy assets exist
    async checkStigmergyAssets(toolName) {
        const assetsPath = path.join(os.homedir(), '.stigmergy', 'assets', 'adapters', toolName);
        try {
            await fs.access(assetsPath);
            const files = await fs.readdir(assetsPath);
            return { exists: true, files: files, path: assetsPath };
        } catch (error) {
            return { exists: false, files: [], path: assetsPath };
        }
    }
    
    // Test deployment for a specific tool
    async testToolDeployment(toolName) {
        console.log(`\n[Test] Testing ${toolName} deployment...`);
        
        const result = {
            toolName,
            installed: false,
            hooksDir: { exists: false, files: [] },
            assets: { exists: false, files: [] },
            deploymentStatus: 'unknown'
        };
        
        // Check if tool is installed
        result.installed = await this.isToolInstalled(toolName);
        console.log(`  Installed: ${result.installed ? '�? : '�?}`);
        
        // Check hooks directory
        result.hooksDir = await this.checkHooksDirectory(toolName);
        console.log(`  Hooks Dir: ${result.hooksDir.exists ? '�? : '�?} (${result.hooksDir.files.length} files)`);
        if (result.hooksDir.exists) {
            console.log(`    Path: ${result.hooksDir.path}`);
            result.hooksDir.files.forEach(file => console.log(`    - ${file}`));
        }
        
        // Check Stigmergy assets
        result.assets = await this.checkStigmergyAssets(toolName);
        console.log(`  Assets: ${result.assets.exists ? '�? : '�?} (${result.assets.files.length} files)`);
        if (result.assets.exists) {
            console.log(`    Path: ${result.assets.path}`);
            result.assets.files.forEach(file => console.log(`    - ${file}`));
        }
        
        // Determine deployment status
        if (result.installed && result.hooksDir.exists && result.hooksDir.files.length > 0) {
            result.deploymentStatus = 'successful';
        } else if (result.installed && result.hooksDir.exists) {
            result.deploymentStatus = 'partial'; // Directory exists but no files
        } else if (result.installed) {
            result.deploymentStatus = 'missing_hooks'; // Installed but no hooks
        } else {
            result.deploymentStatus = 'not_installed';
        }
        
        console.log(`  Status: ${result.deploymentStatus}`);
        
        return result;
    }
    
    // Test all tools
    async testAllTools() {
        console.log('Stigmergy Plugin Deployment Test');
        console.log('='.repeat(40));
        
        const toolNames = Object.keys(CLI_TOOLS);
        const results = [];
        
        for (const toolName of toolNames) {
            const result = await this.testToolDeployment(toolName);
            results.push(result);
        }
        
        // Summary
        console.log('\n' + '='.repeat(40));
        console.log('Deployment Summary:');
        console.log('='.repeat(40));
        
        const statusCounts = {
            successful: 0,
            partial: 0,
            missing_hooks: 0,
            not_installed: 0
        };
        
        results.forEach(result => {
            statusCounts[result.deploymentStatus]++;
            console.log(`${result.toolName}: ${result.deploymentStatus}`);
        });
        
        console.log('\nStatus Counts:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`);
        });
        
        // Identify issues
        const issues = results.filter(r => r.deploymentStatus !== 'successful');
        if (issues.length > 0) {
            console.log('\nIssues Found:');
            issues.forEach(issue => {
                console.log(`  ${issue.toolName}: ${issue.deploymentStatus}`);
                if (issue.deploymentStatus === 'partial') {
                    console.log(`    Hooks directory exists but is empty`);
                } else if (issue.deploymentStatus === 'missing_hooks') {
                    console.log(`    Tool installed but hooks not deployed`);
                } else if (issue.deploymentStatus === 'not_installed') {
                    console.log(`    Tool not installed`);
                }
            });
        }
        
        return results;
    }
    
    // Test iFlow specifically
    async testIFlowIntegration() {
        console.log('\n[iFlow Integration Test]');
        console.log('-'.repeat(20));
        
        // Check if iFlow config can detect hooks
        const iflowConfigPath = path.join(os.homedir(), '.iflow', 'config.yml');
        try {
            await fs.access(iflowConfigPath);
            const configContent = await fs.readFile(iflowConfigPath, 'utf8');
            console.log('iFlow config file found');
            
            if (configContent.includes('hooks') || configContent.includes('plugins')) {
                console.log('�?Hooks/plugins section found in iFlow config');
            } else {
                console.log('�?No hooks/plugins section found in iFlow config');
            }
        } catch (error) {
            console.log('iFlow config file not found or not readable');
        }
        
        // Try to run iFlow with hook detection
        try {
            const child = spawn('iflow', ['hooks'], {
                stdio: 'pipe',
                timeout: 10000
            });
            
            let output = '';
            child.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            await new Promise((resolve) => {
                child.on('close', resolve);
                child.on('error', resolve);
            });
            
            if (output.includes('stigmergy') || output.includes('Stigmergy')) {
                console.log('�?iFlow can detect Stigmergy hooks');
            } else {
                console.log('�?iFlow cannot detect Stigmergy hooks');
                console.log('Output:', output.substring(0, 200) + '...');
            }
        } catch (error) {
            console.log('Could not test iFlow hook detection:', error.message);
        }
    }
}

// Run the tests
async function runDeploymentTests() {
    const tester = new PluginDeploymentTester();
    const results = await tester.testAllTools();
    await tester.testIFlowIntegration();
    
    return results;
}

// Export for use in other modules
module.exports = { PluginDeploymentTester };

// Run if called directly
if (require.main === module) {
    runDeploymentTests().then(results => {
        console.log('\n[Test Complete]');
        process.exit(0);
    }).catch(error => {
        console.error('[Test Failed]:', error.message);
        process.exit(1);
    });
}
