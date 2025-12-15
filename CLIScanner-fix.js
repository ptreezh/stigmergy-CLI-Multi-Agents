"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIScanner = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
class CLIScanner {
    static getInstance() {
        if (!CLIScanner.instance) {
            CLIScanner.instance = new CLIScanner();
        }
        return CLIScanner.instance;
    }
    /**
     * 扫描所有CLI工具（包括不可用的）
     */
    async scanAllCLIs() {
        const cliList = [
            {
                name: 'claude',
                displayName: 'Claude CLI',
                version: '',
                available: false,
                integrationLevel: 'native'
            },
            {
                name: 'gemini',
                displayName: 'Gemini CLI',
                version: '',
                available: false,
                integrationLevel: 'native'
            },
            {
                name: 'qwen',
                displayName: 'Qwen CLI',
                version: '',
                available: false,
                integrationLevel: 'native'
            },
            {
                name: 'iflow',
                displayName: 'IFlow CLI',
                version: '',
                available: false,
                integrationLevel: 'hook'
            },
            {
                name: 'codebuddy',
                displayName: 'CodeBuddy CLI',
                version: '',
                available: false,
                integrationLevel: 'external'
            },
            {
                name: 'qodercli',
                displayName: 'QoderCLI',
                version: '',
                available: false,
                integrationLevel: 'external'
            },
            {
                name: 'codex',
                displayName: 'Codex CLI',
                version: '',
                available: false,
                integrationLevel: 'external'
            }
        ];
        // 检查每个CLI的可用�?        for (const cli of cliList) {
            await this.checkCLIAvailability(cli);
        }
        return cliList;
    }
    /**
     * 扫描系统中可用的CLI工具
     */
    async scanAvailableCLIs() {
        const allCLIs = await this.scanAllCLIs();
        // 返回所有CLI，但标记可用�?        return allCLIs;
    }
    /**
     * 检查特定CLI的可用�?     */
    async checkCLIAvailability(cli) {
        try {
            // 首先检查是否在PATH�?            const cliPath = await this.getCLIPath(cli.name);
            if (!cliPath) {
                cli.available = false;
                return;
            }

            // 尝试获取版本信息
            const version = await this.getCLIVersion(cli.name);
            if (version) {
                cli.available = true;
                cli.version = version;
            } else {
                // 如果版本检测失败，但路径存在，标记为部分可�?                cli.available = true;
                cli.version = 'unknown';
            }

            // 获取路径信息
            cli.installedPath = cliPath;
            cli.configPath = await this.getCLIConfigPath(cli.name);
            cli.sessionsPath = await this.getCLISessionsPath(cli.name);
        }
        catch (error) {
            cli.available = false;
        }
    }
    /**
     * Get CLI version
     */
    async getCLIVersion(cliName) {
        // 对于codex，使用特殊的检测方�?        if (cliName === 'codex') {
            return await this.getCodexVersionByPath();
        }

        const versionCommands = {
            'claude': ['claude', '--version'],
            'gemini': ['gemini', '--version'],
            'qwen': ['qwen', '--version'],
            'iflow': ['iflow', '--version'],
            'codebuddy': ['codebuddy', '--version'],
            'qodercli': ['qodercli', '--version']
        };

        const command = versionCommands[cliName];
        if (!command)
            return '';

        try {
            // 尝试多个路径
            const paths = await this.getCLIPaths(cliName);
            for (const path of paths) {
                try {
                    const output = (0, child_process_1.execSync)(command.join(' '), {
                        encoding: 'utf8',
                        timeout: 5000,
                        stdio: 'pipe',
                        windowsHide: true,
                        env: {
                            ...process.env,
                            DISPLAY: undefined
                        }
                    });
                    // 提取版本�?                    const versionMatch = output.match(/(\d+\.\d+\.\d+)/);
                    if (versionMatch) {
                        return versionMatch[1];
                    }
                } catch (e) {
                    // 继续尝试下一个路�?                    continue;
                }
            }
            return '';
        } catch (error) {
            return '';
        }
    }
    /**
     * Get all CLI paths (handling multiple installations)
     */
    async getCLIPaths(cliName) {
        try {
            const command = process.platform === 'win32' ? 'where' : 'which';
            const output = (0, child_process_1.execSync)(`${command} ${cliName}`, {
                encoding: 'utf8',
                timeout: 5000,
                stdio: 'pipe'
            });
            return output.trim().split('\n').filter(p => p.trim());
        } catch (error) {
            return [];
        }
    }
    /**
     * Get Codex version by file path (avoid executing commands)
     */
    async getCodexVersionByPath() {
        try {
            // Check if codex is in PATH
            const codexPath = await this.getCLIPath('codex');
            if (!codexPath)
                return '';
            // Check if config directory exists
            const configPath = await this.getCLIConfigPath('codex');
            if (!configPath)
                return '';
            // Check sessions directory
            const sessionsPath = await this.getCLISessionsPath('codex');
            if (!sessionsPath)
                return '';
            // If basic structure exists, consider version available (but don't execute version command)
            return 'detected';
        } catch (error) {
            return '';
        }
    }
    /**
     * Get CLI installation path (first one found)
     */
    async getCLIPath(cliName) {
        const paths = await this.getCLIPaths(cliName);
        return paths.length > 0 ? paths[0] : undefined;
    }
    /**
     * Get CLI configuration path
     */
    async getCLIConfigPath(cliName) {
        const homeDir = require('os').homedir();
        const configPaths = {
            'claude': (0, path_1.join)(homeDir, '.claude'),
            'gemini': (0, path_1.join)(homeDir, '.gemini'),
            'qwen': (0, path_1.join)(homeDir, '.qwen'),
            'iflow': (0, path_1.join)(homeDir, '.iflow'),
            'codebuddy': (0, path_1.join)(homeDir, '.codebuddy'),
            'qodercli': (0, path_1.join)(homeDir, '.qodercli'),
            'codex': (0, path_1.join)(homeDir, '.codex')
        };
        const path = configPaths[cliName];
        return path && (0, fs_1.existsSync)(path) ? path : undefined;
    }
    /**
     * Get CLI sessions path
     */
    async getCLISessionsPath(cliName) {
        const configPath = await this.getCLIConfigPath(cliName);
        if (!configPath)
            return undefined;
        const sessionPaths = {
            'claude': (0, path_1.join)(configPath, 'sessions'),
            'gemini': (0, path_1.join)(configPath, 'sessions'),
            'qwen': (0, path_1.join)(configPath, 'sessions'),
            'iflow': (0, path_1.join)(configPath, 'stigmergy', 'sessions'),
            'codebuddy': (0, path_1.join)(configPath, 'conversations'),
            'qodercli': (0, path_1.join)(configPath, 'chats'),
            'codex': (0, path_1.join)(configPath, 'sessions')
        };
        const path = sessionPaths[cliName];
        // 如果sessions目录不存在，尝试创建�?        if (path && !(0, fs_1.existsSync)(path)) {
            try {
                (0, fs_1.mkdirSync)(path, { recursive: true });
                return path;
            } catch (error) {
                return undefined;
            }
        }
        return path;
    }
    /**
     * Validate if CLI supports cross-CLI session recovery
     */
    async validateCLIForCrossCLI(cliName) {
        try {
            // Check if config directory exists
            const configPath = await this.getCLIConfigPath(cliName);
            if (!configPath) {
                // 尝试创建配置目录
                const homeDir = require('os').homedir();
                const configPaths = {
                    'claude': (0, path_1.join)(homeDir, '.claude'),
                    'gemini': (0, path_1.join)(homeDir, '.gemini'),
                    'qwen': (0, path_1.join)(homeDir, '.qwen'),
                    'iflow': (0, path_1.join)(homeDir, '.iflow'),
                    'codebuddy': (0, path_1.join)(homeDir, '.codebuddy'),
                    'qodercli': (0, path_1.join)(homeDir, '.qodercli'),
                    'codex': (0, path_1.join)(homeDir, '.codex')
                };
                const configPath = configPaths[cliName];
                if (configPath) {
                    try {
                        (0, fs_1.mkdirSync)(configPath, { recursive: true });
                    } catch (error) {
                        return false;
                    }
                } else {
                    return false;
                }
            }

            // Check or create sessions storage
            const sessionsPath = await this.getCLISessionsPath(cliName);
            if (!sessionsPath)
                return false;

            // Check if we have permission to access
            try {
                const testFile = (0, path_1.join)(sessionsPath, '.resumesession-test');
                require('fs').writeFileSync(testFile, 'test');
                require('fs').unlinkSync(testFile);
                return true;
            } catch (error) {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
}
exports.CLIScanner = CLIScanner;
//# sourceMappingURL=CLIScanner.js.map
