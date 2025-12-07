#!/usr/bin/env node

/**
 * Platform Adapter - TDD Implementation
 * Phase 3: Installation System - GREEN Phase (Minimal implementation to pass tests)
 */

const os = require('os');
const path = require('path');
const fs = require('fs');

class PlatformAdapter {
    constructor() {
        this.platform = process.platform;
        this.arch = process.arch;
        this.isWindows = this.platform === 'win32';
        this.isMacOS = this.platform === 'darwin';
        this.isLinux = this.platform === 'linux';
    }

    getPlatformPaths() {
        const homeDir = os.homedir();

        const paths = {
            homeDirectory: homeDir,
            configDirectory: this.getConfigDirectory(),
            claudeHookDirectory: this.getClaudeHookDirectory(),
            geminiHookDirectory: this.getGeminiHookDirectory(),
            qwenHookDirectory: this.getQwenHookDirectory(),
            qoderHookDirectory: this.getQoderHookDirectory(),
            iflowHookDirectory: this.getIflowHookDirectory(),
            codebuddyHookDirectory: this.getCodebuddyHookDirectory(),
            copilotHookDirectory: this.getCopilotHookDirectory(),
            codexHookDirectory: this.getCodexHookDirectory(),
            tempDirectory: os.tmpdir()
        };

        return paths;
    }

    getConfigDirectory() {
        const homeDir = os.homedir();

        if (this.isWindows) {
            return path.join(homeDir, 'AppData', 'Roaming', 'stigmergy');
        } else if (this.isMacOS) {
            return path.join(homeDir, 'Library', 'Application Support', 'stigmergy');
        } else {
            return path.join(homeDir, '.config', 'stigmergy');
        }
    }

    getClaudeHookDirectory() {
        const homeDir = os.homedir();

        if (this.isWindows) {
            return path.join(homeDir, 'AppData', 'Roaming', 'claude', 'hooks');
        } else {
            return path.join(homeDir, '.claude', 'hooks');
        }
    }

    getGeminiHookDirectory() {
        const homeDir = os.homedir();

        if (this.isWindows) {
            return path.join(homeDir, 'AppData', 'Roaming', 'gemini', 'hooks');
        } else {
            return path.join(homeDir, '.gemini', 'hooks');
        }
    }

    getQwenHookDirectory() {
        const homeDir = os.homedir();

        if (this.isWindows) {
            return path.join(homeDir, 'AppData', 'Roaming', 'qwen', 'extensions');
        } else {
            return path.join(homeDir, '.qwen', 'extensions');
        }
    }

    getQoderHookDirectory() {
        const homeDir = os.homedir();

        if (this.isWindows) {
            return path.join(homeDir, '.qoder', 'hooks');
        } else {
            return path.join(homeDir, '.qoder', 'hooks');
        }
    }

    getIflowHookDirectory() {
        const homeDir = os.homedir();

        if (this.isWindows) {
            return path.join(homeDir, 'AppData', 'Roaming', 'iflow', 'hooks');
        } else {
            return path.join(homeDir, '.iflow', 'hooks');
        }
    }

    getCodebuddyHookDirectory() {
        const homeDir = os.homedir();

        if (this.isWindows) {
            return path.join(homeDir, '.codebuddy', 'hooks');
        } else {
            return path.join(homeDir, '.codebuddy', 'hooks');
        }
    }

    getCopilotHookDirectory() {
        const homeDir = os.homedir();

        if (this.isWindows) {
            return path.join(homeDir, '.copilot', 'mcp');
        } else {
            return path.join(homeDir, '.copilot', 'mcp');
        }
    }

    getCodexHookDirectory() {
        const homeDir = os.homedir();

        if (this.isWindows) {
            return path.join(homeDir, 'AppData', 'Roaming', 'codex', 'slash_commands');
        } else {
            return path.join(homeDir, '.config', 'codex', 'slash_commands');
        }
    }

    createDirectories(directories) {
        const results = [];

        for (const dir of directories) {
            try {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                    results.push({ directory: dir, success: true, created: true });
                } else {
                    results.push({ directory: dir, success: true, created: false });
                }
            } catch (error) {
                results.push({
                    directory: dir,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    getExecutableExtension() {
        return this.isWindows ? '.exe' : '';
    }

    getShellCommand(command) {
        if (this.isWindows) {
            return { command: 'cmd', args: ['/c', command] };
        } else {
            return { command: 'sh', args: ['-c', command] };
        }
    }

    getPathSeparator() {
        return this.isWindows ? ';' : ':';
    }

    getEnvironmentVariables() {
        return {
            PATH: process.env.PATH,
            HOME: os.homedir(),
            USERPROFILE: process.env.USERPROFILE,
            APPDATA: process.env.APPDATA,
            LOCALAPPDATA: process.env.LOCALAPPDATA
        };
    }

    normalizePath(filePath) {
        return path.normalize(filePath);
    }

    joinPath(...segments) {
        return path.join(...segments);
    }
}

module.exports = PlatformAdapter;