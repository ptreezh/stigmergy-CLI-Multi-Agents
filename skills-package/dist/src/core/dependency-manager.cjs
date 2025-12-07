#!/usr/bin/env node

/**
 * Dependency Manager for Stigmergy Skills
 * Detects and manages base package dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DependencyManager {
    constructor() {
        this.basePackageName = 'stigmergy';
        this.requiredVersion = '^1.0.0';
    }

    async checkBasePackage() {
        try {
            // Check if stigmergy is globally installed
            const result = execSync('npm list -g --depth=0 ' + this.basePackageName, {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            return {
                installed: true,
                global: true,
                info: result.trim()
            };
        } catch (error) {
            try {
                // Check if stigmergy is locally installed
                const result = execSync('npm list --depth=0 ' + this.basePackageName, {
                    encoding: 'utf8',
                    stdio: 'pipe'
                });

                return {
                    installed: true,
                    global: false,
                    info: result.trim()
                };
            } catch (localError) {
                return {
                    installed: false,
                    global: false,
                    error: localError.message
                };
            }
        }
    }

    async checkStigmergyCLI() {
        try {
            // Check if stigmergy command is available
            execSync('stigmergy --version', {
                encoding: 'utf8',
                stdio: 'pipe',
                timeout: 5000
            });

            return {
                available: true,
                configured: true
            };
        } catch (error) {
            return {
                available: false,
                configured: false,
                error: error.message
            };
        }
    }

    async promptInstallation() {
        // In a real implementation, this would use inquirer
        // For now, return a simple mock response
        return {
            shouldInstall: true,
            installGlobal: true
        };
    }

    async installBasePackage(global = true) {
        try {
            const installCmd = global
                ? 'npm install -g stigmergy'
                : 'npm install stigmergy';

            console.log('Installing stigmergy base package...');

            const result = execSync(installCmd, {
                encoding: 'utf8',
                stdio: 'inherit',
                timeout: 120000 // 2 minutes
            });

            console.log('✅ Stigmergy base package installed successfully');

            // Try to initialize stigmergy
            try {
                console.log('Initializing stigmergy...');
                execSync('stigmergy install', {
                    encoding: 'utf8',
                    stdio: 'inherit',
                    timeout: 60000 // 1 minute
                });
                console.log('✅ Stigmergy initialized successfully');
            } catch (initError) {
                console.warn('⚠️  Stigmergy installed but initialization failed:', initError.message);
                console.info('Please run "stigmergy install" manually to complete setup');
            }

            return {
                success: true,
                message: 'Base package installed and configured successfully'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to install base package: ' + error.message
            };
        }
    }

    async getDependencyStatus() {
        const packageStatus = await this.checkBasePackage();
        const cliStatus = await this.checkStigmergyCLI();

        return {
            basePackage: packageStatus,
            cli: cliStatus,
            ready: packageStatus.installed && cliStatus.available,
            recommendation: this.getRecommendation(packageStatus, cliStatus)
        };
    }

    getRecommendation(packageStatus, cliStatus) {
        if (!packageStatus.installed) {
            return {
                level: 'required',
                message: 'Base stigmergy package is required for full functionality',
                action: 'install'
            };
        }

        if (packageStatus.installed && !cliStatus.available) {
            return {
                level: 'recommended',
                message: 'Stigmergy package is installed but CLI not configured',
                action: 'configure'
            };
        }

        return {
            level: 'optional',
            message: 'Stigmergy is properly configured',
            action: 'none'
        };
    }
}

module.exports = { DependencyManager };