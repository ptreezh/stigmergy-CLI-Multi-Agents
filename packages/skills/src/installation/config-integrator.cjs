#!/usr/bin/env node

/**
 * Configuration Integrator - TDD Implementation
 * Phase 3: Installation System - GREEN Phase (Minimal implementation to pass tests)
 */

const fs = require('fs');
const path = require('path');
const PlatformAdapter = require('./platform-adapter.cjs');

class ConfigIntegrator {
    constructor() {
        this.platformAdapter = new PlatformAdapter();
        this.supportedCLIs = ['claude', 'gemini', 'qwen'];
    }

    updateCLIConfig(cliType, configData, basePath) {
        const integrationResult = {
            success: false,
            cliType,
            configPath: null,
            backupPath: null,
            errors: [],
            warnings: []
        };

        try {
            // Determine config file path based on CLI type and platform
            const configPath = this.getConfigPath(cliType, basePath);
            integrationResult.configPath = configPath;

            // Ensure config directory exists
            const configDir = path.dirname(configPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }

            // Backup existing config if it exists
            if (fs.existsSync(configPath)) {
                const backupPath = `${configPath}.backup.${Date.now()}`;
                fs.copyFileSync(configPath, backupPath);
                integrationResult.backupPath = backupPath;
            }

            // Merge with existing config or create new one
            let existingConfig = {};
            if (fs.existsSync(configPath)) {
                try {
                    const existingContent = fs.readFileSync(configPath, 'utf8');
                    existingConfig = JSON.parse(existingContent);
                } catch (parseError) {
                    integrationResult.warnings.push(`Failed to parse existing config: ${parseError.message}`);
                }
            }

            // Merge new configuration
            const mergedConfig = this.mergeConfigs(existingConfig, configData);

            // Write updated config
            const configContent = JSON.stringify(mergedConfig, null, 2);
            fs.writeFileSync(configPath, configContent, 'utf8');

            integrationResult.success = true;

        } catch (error) {
            integrationResult.errors.push(error.message);
        }

        return integrationResult;
    }

    getConfigPath(cliType, basePath) {
        const platformPaths = this.platformAdapter.getPlatformPaths();

        switch (cliType) {
            case 'claude':
                if (this.platformAdapter.isWindows) {
                    return path.join(platformPaths.configDirectory, 'claude.json');
                } else {
                    return path.join(platformPaths.homeDirectory, '.claude', 'config.json');
                }

            case 'gemini':
                if (this.platformAdapter.isWindows) {
                    return path.join(platformPaths.configDirectory, 'gemini.json');
                } else {
                    return path.join(platformPaths.homeDirectory, '.gemini', 'config.json');
                }

            case 'qwen':
                if (this.platformAdapter.isWindows) {
                    return path.join(platformPaths.configDirectory, 'qwen.json');
                } else {
                    return path.join(platformPaths.homeDirectory, '.qwen', 'config.json');
                }

            default:
                return path.join(basePath || process.cwd(), `${cliType}-config.json`);
        }
    }

    mergeConfigs(existingConfig, newConfig) {
        return {
            ...existingConfig,
            ...newConfig,
            // Ensure stigmergy-skill specific configuration
            stigmergy: {
                ...existingConfig.stigmergy,
                ...newConfig.stigmergy,
                skillsEnabled: true,
                hooksEnabled: true,
                version: '1.0.0',
                installedAt: new Date().toISOString()
            },
            // Hook integration
            hooks: {
                ...(existingConfig.hooks || {}),
                'stigmergy-skill': {
                    enabled: true,
                    path: newConfig.hookPath || './hooks/stigmergy-skill.cjs',
                    priority: 'high',
                    ...newConfig.hooks?.['stigmergy-skill']
                }
            },
            // Skills configuration
            skills: {
                ...(existingConfig.skills || {}),
                supported: ['translation', 'code-analysis', 'code-generation', 'documentation'],
                minConfidence: 5,
                timeout: 30000,
                ...newConfig.skills
            },
            // Update metadata
            _metadata: {
                lastUpdated: new Date().toISOString(),
                updatedBy: 'stigmergy-skill',
                version: '1.0.0',
                ...existingConfig._metadata,
                ...newConfig._metadata
            }
        };
    }

    createHookSymlink(cliType, hookPath, basePath) {
        const symlinkResult = {
            success: false,
            cliType,
            symlinkPath: null,
            hookPath,
            errors: []
        };

        try {
            const platformPaths = this.platformAdapter.getPlatformPaths();
            let targetDir;

            switch (cliType) {
                case 'claude':
                    targetDir = platformPaths.claudeHookDirectory;
                    break;
                case 'gemini':
                    targetDir = platformPaths.geminiHookDirectory;
                    break;
                case 'qwen':
                    targetDir = platformPaths.qwenHookDirectory;
                    break;
                default:
                    throw new Error(`Unsupported CLI type: ${cliType}`);
            }

            // Ensure target directory exists
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const symlinkPath = path.join(targetDir, 'stigmergy-skill.cjs');
            symlinkResult.symlinkPath = symlinkPath;

            // Remove existing symlink or file
            if (fs.existsSync(symlinkPath)) {
                fs.unlinkSync(symlinkPath);
            }

            // Create symlink (or copy on Windows if symlinks aren't available)
            if (process.platform === 'win32') {
                // On Windows, copy the file instead of creating a symlink
                fs.copyFileSync(hookPath, symlinkPath);
            } else {
                fs.symlinkSync(hookPath, symlinkPath);
            }

            symlinkResult.success = true;

        } catch (error) {
            symlinkResult.errors.push(error.message);
        }

        return symlinkResult;
    }

    integrateWithAllCLIs(installationResult, basePath) {
        const integrationResult = {
            success: false,
            totalIntegrated: 0,
            integrations: [],
            errors: [],
            warnings: []
        };

        try {
            for (const hookInfo of installationResult.installedHooks) {
                const cliType = hookInfo.cliType;

                // Update CLI configuration
                const configResult = this.updateCLIConfig(cliType, {
                    enabled: true,
                    hooks: ['stigmergy-skill'],
                    version: '1.0.0',
                    hookPath: hookInfo.hookPath
                }, basePath);

                if (configResult.success) {
                    // Create symlink
                    const symlinkResult = this.createHookSymlink(
                        cliType,
                        hookInfo.hookPath,
                        basePath
                    );

                    integrationResult.integrations.push({
                        cliType,
                        configUpdate: configResult,
                        symlink: symlinkResult,
                        overall: configResult.success && symlinkResult.success
                    });

                    if (configResult.success && symlinkResult.success) {
                        integrationResult.totalIntegrated++;
                    }
                } else {
                    integrationResult.errors.push(`Failed to update ${cliType} config: ${configResult.errors.join(', ')}`);
                }
            }

            integrationResult.success = integrationResult.errors.length === 0;

        } catch (error) {
            integrationResult.errors.push(`Integration failed: ${error.message}`);
        }

        return integrationResult;
    }

    verifyIntegration(cliType) {
        const verificationResult = {
            cliType,
            configExists: false,
            configValid: false,
            symlinkExists: false,
            symlinkValid: false,
            overallValid: false,
            errors: [],
            warnings: []
        };

        try {
            const platformPaths = this.platformAdapter.getPlatformPaths();
            const configPath = this.getConfigPath(cliType);

            // Verify configuration
            if (fs.existsSync(configPath)) {
                verificationResult.configExists = true;
                try {
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    verificationResult.configValid = true;

                    if (!config.stigmergy?.skillsEnabled) {
                        verificationResult.warnings.push('Stigmergy skills not enabled in config');
                    }

                    if (!config.hooks?.['stigmergy-skill']?.enabled) {
                        verificationResult.warnings.push('Stigmergy-skill hook not enabled in config');
                    }
                } catch (parseError) {
                    verificationResult.errors.push(`Invalid config JSON: ${parseError.message}`);
                }
            } else {
                verificationResult.errors.push('Configuration file does not exist');
            }

            // Verify symlink
            let hookDir;
            switch (cliType) {
                case 'claude':
                    hookDir = platformPaths.claudeHookDirectory;
                    break;
                case 'gemini':
                    hookDir = platformPaths.geminiHookDirectory;
                    break;
                case 'qwen':
                    hookDir = platformPaths.qwenHookDirectory;
                    break;
            }

            if (hookDir && fs.existsSync(hookDir)) {
                const symlinkPath = path.join(hookDir, 'stigmergy-skill.cjs');
                verificationResult.symlinkExists = fs.existsSync(symlinkPath);

                if (verificationResult.symlinkExists) {
                    try {
                        const hookModule = require(symlinkPath);
                        verificationResult.symlinkValid = true;

                        if (typeof hookModule.execute !== 'function') {
                            verificationResult.errors.push('Hook does not have execute function');
                        }
                    } catch (requireError) {
                        verificationResult.errors.push(`Hook module error: ${requireError.message}`);
                    }
                }
            }

            verificationResult.overallValid = verificationResult.configValid && verificationResult.symlinkValid;

        } catch (error) {
            verificationResult.errors.push(`Verification failed: ${error.message}`);
        }

        return verificationResult;
    }
}

module.exports = ConfigIntegrator;