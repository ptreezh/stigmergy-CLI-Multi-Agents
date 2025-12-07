#!/usr/bin/env node

/**
 * Stigmergy CLI - Main Entry Point (CommonJS)
 * Multi-Agents Cross-AI CLI Tools Collaboration System
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Main CLI functionality
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log('Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System');
        console.log('Version: 1.0.70');
        console.log('');
        console.log('Usage: stigmergy [command] [options]');
        console.log('');
        console.log('Commands:');
        console.log('  help, --help     Show this help message');
        console.log('  version, --version Show version information');
        console.log('  status          Check CLI tools status');
        console.log('  scan            Scan for available AI CLI tools');
        console.log('');
        console.log('Examples:');
        console.log('  stigmergy --version');
        console.log('  stigmergy status');
        console.log('');
        console.log('For more information, visit: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents');
        return;
    }

    if (args.includes('--version') || args.includes('version')) {
        console.log('1.0.70');
        return;
    }

    if (args.includes('status')) {
        console.log('Checking AI CLI tools status...');
        console.log('Claude CLI:', checkCLI('claude'));
        console.log('Gemini CLI:', checkCLI('gemini'));
        console.log('Qwen CLI:', checkCLI('qwen'));
        console.log('iFlow CLI:', checkCLI('iflow'));
        console.log('Qoder CLI:', checkCLI('qodercli'));
        return;
    }

    if (args.includes('scan')) {
        console.log('Scanning for available AI CLI tools...');
        const tools = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'copilot', 'codex', 'qoder'];
        const available = tools.filter(tool => checkCLI(tool === 'qoder' ? 'qodercli' : tool));
        console.log(`Found ${available.length}/${tools.length} AI CLI tools:`, available.join(', '));
        return;
    }

    console.log('Unknown command. Use --help for usage information.');
}

function checkCLI(command) {
    try {
        const result = require('child_process').spawnSync(command, ['--version'], {
            stdio: 'ignore',
            timeout: 5000
        });
        return result.status === 0 ? 'Available' : 'Not Available';
    } catch (error) {
        return 'Not Available';
    }
}

// Execute main function
if (require.main === module) {
    main();
}

module.exports = { main, checkCLI };