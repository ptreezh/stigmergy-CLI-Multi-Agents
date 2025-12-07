#!/usr/bin/env node

/**
 * CLI Tool Detector - TDD Implementation
 * Phase 3: Installation System - GREEN Phase (Minimal implementation to pass tests)
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class CLIDetector {
    constructor() {
        // Corrected CLI commands based on actual testing
        this.supportedTools = {
            claude: {
                commands: ['claude'],
                versionCheckCommand: 'claude --version',
                installPaths: [
                    path.join(os.homedir(), '.claude'),
                    '/usr/local/bin/claude',
                    'C:\\Program Files\\Claude\\claude.exe'
                ]
            },
            gemini: {
                commands: ['gemini'],
                versionCheckCommand: 'gemini --version',
                installPaths: [
                    path.join(os.homedir(), '.gemini'),
                    '/usr/local/bin/gemini',
                    'C:\\Program Files\\Gemini\\gemini.exe'
                ]
            },
            qwen: {
                commands: ['qwen'],
                versionCheckCommand: 'qwen --version',
                installPaths: [
                    path.join(os.homedir(), '.qwen'),
                    '/usr/local/bin/qwen',
                    'C:\\Program Files\\Qwen\\qwen.exe'
                ]
            },
            qoder: {
                commands: ['qodercli'],
                versionCheckCommand: 'qodercli --version',
                installPaths: [
                    path.join(os.homedir(), '.qoder'),
                    '/usr/local/bin/qodercli',
                    'C:\\Program Files\\Qoder\\qodercli.exe'
                ]
            },
            iflow: {
                commands: ['iflow'],
                versionCheckCommand: 'iflow --version',
                installPaths: [
                    path.join(os.homedir(), '.iflow'),
                    '/usr/local/bin/iflow',
                    'C:\\Program Files\\iFlow\\iflow.exe'
                ]
            },
            codebuddy: {
                commands: ['codebuddy'],
                versionCheckCommand: 'codebuddy --version',
                installPaths: [
                    path.join(os.homedir(), '.codebuddy'),
                    '/usr/local/bin/codebuddy',
                    'C:\\Program Files\\CodeBuddy\\codebuddy.exe'
                ]
            },
            copilot: {
                commands: ['copilot'],
                versionCheckCommand: 'copilot --version',
                installPaths: [
                    path.join(os.homedir(), '.copilot'),
                    '/usr/local/bin/copilot',
                    'C:\\Program Files\\Copilot\\copilot.exe'
                ]
            },
            codex: {
                commands: ['codex'],
                versionCheckCommand: 'codex --version',
                installPaths: [
                    path.join(os.homedir(), '.codex'),
                    '/usr/local/bin/codex',
                    'C:\\Program Files\\Codex\\codex.exe'
                ]
            },
            node: {
                commands: ['node'],
                versionCheckCommand: 'node --version',
                installPaths: [
                    '/usr/bin/node',
                    '/usr/local/bin/node',
                    'C:\\Program Files\\nodejs\\node.exe'
                ]
            }
        };
    }

    detectAvailableTools() {
        const detectedTools = [];

        for (const [toolName, toolConfig] of Object.entries(this.supportedTools)) {
            if (this.isToolInstalled(toolName)) {
                detectedTools.push({
                    name: toolName,
                    version: this.getToolVersion(toolName),
                    path: this.getToolPath(toolName),
                    available: true
                });
            }
        }

        return detectedTools;
    }

    isToolInstalled(toolName) {
        const toolConfig = this.supportedTools[toolName];
        if (!toolConfig) {
            return false;
        }

        // Use version check command aligned with main package
        try {
            const command = toolConfig.versionCheckCommand;
            if (command) {
                const result = spawnSync(command, {
                    stdio: 'pipe',
                    timeout: 5000,
                    shell: true
                });

                if (result.status === 0) {
                    return true;
                }
            }
        } catch (error) {
            // Continue to fallback methods
        }

        // Fallback: Check each command variant
        for (const command of toolConfig.commands) {
            try {
                // Try to get command path
                const whichCmd = process.platform === 'win32' ? 'where' : 'which';
                const result = spawnSync(whichCmd, [command], {
                    stdio: 'pipe',
                    timeout: 3000
                });

                if (result.status === 0) {
                    return true;
                }
            } catch (error) {
                // Continue to next command
            }
        }

        // Fallback: Check installation paths
        for (const installPath of toolConfig.installPaths) {
            if (fs.existsSync(installPath)) {
                return true;
            }
        }

        return false;
    }

    getToolVersion(toolName) {
        const toolConfig = this.supportedTools[toolName];
        if (!toolConfig) {
            return null;
        }

        // Use version check command aligned with main package
        try {
            const command = toolConfig.versionCheckCommand;
            if (command) {
                const result = spawnSync(command, {
                    stdio: 'pipe',
                    timeout: 5000,
                    shell: true
                });

                if (result.status === 0) {
                    const output = (result.stdout || result.stderr).toString();
                    const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
                    return versionMatch ? versionMatch[1] : output.trim();
                }
            }
        } catch (error) {
            // Continue to fallback methods
        }

        // Fallback: Try command variants
        for (const command of toolConfig.commands) {
            try {
                const result = spawnSync(command, ['--version'], {
                    stdio: 'pipe',
                    timeout: 5000,
                    shell: true
                });

                if (result.status === 0) {
                    const output = (result.stdout || result.stderr).toString();
                    const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
                    return versionMatch ? versionMatch[1] : output.trim();
                }
            } catch (error) {
                // Continue to next command
            }
        }

        return 'unknown';
    }

    getToolPath(toolName) {
        const toolConfig = this.supportedTools[toolName];
        if (!toolConfig) {
            return null;
        }

        // Try to find executable path
        for (const command of toolConfig.commands) {
            try {
                const result = spawnSync(process.platform === 'win32' ? 'where' : 'which', [command], {
                    stdio: 'pipe',
                    timeout: 3000
                });

                if (result.status === 0 && result.stdout) {
                    return result.stdout.toString().trim();
                }
            } catch (error) {
                // Continue
            }
        }

        // Check installation paths
        for (const installPath of toolConfig.installPaths) {
            if (fs.existsSync(installPath)) {
                return installPath;
            }
        }

        return null;
    }

    getPlatformSpecificInfo() {
        return {
            platform: process.platform,
            arch: process.arch,
            shell: process.env.SHELL || process.env.COMSPEC,
            pathSeparator: process.platform === 'win32' ? ';' : ':',
            executableExtension: process.platform === 'win32' ? '.exe' : ''
        };
    }
}

module.exports = CLIDetector;