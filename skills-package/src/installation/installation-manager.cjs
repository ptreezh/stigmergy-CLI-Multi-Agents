#!/usr/bin/env node

/**
 * Installation Manager - TDD Implementation
 * Phase 3: Installation System - GREEN Phase (Minimal implementation to pass tests)
 */

const fs = require('fs');
const path = require('path');
const CLIDetector = require('./cli-detector.cjs');
const HookInstaller = require('./hook-installer.cjs');
const InstallationVerifier = require('./installation-verifier.cjs');
const PlatformAdapter = require('./platform-adapter.cjs');

class InstallationManager {
    constructor() {
        this.cliDetector = new CLIDetector();
        this.hookInstaller = new HookInstaller();
        this.verifier = new InstallationVerifier();
        this.platformAdapter = new PlatformAdapter();
        this.supportedCLIs = ['claude', 'gemini', 'qwen', 'qoder', 'iflow', 'codebuddy', 'copilot', 'codex'];
    }

    installAllHooks(customBasePath = null) {
        const installationResult = {
            success: false,
            phase: 'detection',
            totalDetected: 0,
            totalInstalled: 0,
            installedHooks: [],
            errors: [],
            warnings: [],
            startTime: new Date().toISOString()
        };

        try {
            // Phase 1: Detect available CLI tools
            const detectedTools = this.cliDetector.detectAvailableTools();
            installationResult.totalDetected = detectedTools.length;
            installationResult.detectedTools = detectedTools;

            if (detectedTools.length === 0) {
                installationResult.warnings.push('No supported CLI tools detected');
                installationResult.phase = 'completed';
                return installationResult;
            }

            // Phase 2: Prepare installation directory
            installationResult.phase = 'preparation';
            const basePath = customBasePath || path.join(process.cwd(), 'installed-hooks');

            if (!fs.existsSync(basePath)) {
                fs.mkdirSync(basePath, { recursive: true });
            }

            // Phase 3: Install hooks for detected tools
            installationResult.phase = 'installation';
            const availableCliTypes = detectedTools.map(tool => tool.name);

            for (const cliType of this.supportedCLIs) {
                // Install hook for all supported CLIs, but prioritize detected ones
                const installResult = this.hookInstaller.installHook(cliType, basePath);

                if (installResult.success) {
                    installationResult.installedHooks.push({
                        cliType,
                        detected: availableCliTypes.includes(cliType),
                        hookPath: installResult.hookPath,
                        installed: true
                    });
                    installationResult.totalInstalled++;
                } else {
                    installationResult.errors.push({
                        cliType,
                        error: installResult.error
                    });
                }
            }

            // Phase 4: Verify installation
            installationResult.phase = 'verification';
            const verification = this.verifier.verifyInstallation(basePath);
            installationResult.verification = verification;

            // Final result
            installationResult.success = installationResult.errors.length === 0;
            installationResult.phase = 'completed';
            installationResult.endTime = new Date().toISOString();
            installationResult.duration = new Date(installationResult.endTime) - new Date(installationResult.startTime);

            return installationResult;

        } catch (error) {
            installationResult.phase = 'failed';
            installationResult.errors.push({
                general: error.message
            });
            installationResult.endTime = new Date().toISOString();
            return installationResult;
        }
    }

    rollbackInstallation(basePath) {
        const rollbackResult = {
            success: false,
            action: 'rollback',
            removedFiles: [],
            errors: [],
            basePath
        };

        try {
            if (!fs.existsSync(basePath)) {
                rollbackResult.success = true;
                rollbackResult.warnings = ['Installation directory does not exist'];
                return rollbackResult;
            }

            // Remove hook files
            for (const cliType of this.supportedCLIs) {
                const hookPath = path.join(basePath, cliType, 'hooks', 'stigmergy-skill.cjs');

                if (fs.existsSync(hookPath)) {
                    try {
                        fs.unlinkSync(hookPath);
                        rollbackResult.removedFiles.push(hookPath);
                    } catch (error) {
                        rollbackResult.errors.push({
                            file: hookPath,
                            error: error.message
                        });
                    }
                }
            }

            // Try to remove empty directories
            for (const cliType of this.supportedCLIs) {
                const cliDir = path.join(basePath, cliType);
                try {
                    if (fs.existsSync(cliDir)) {
                        const hooksDir = path.join(cliDir, 'hooks');
                        if (fs.existsSync(hooksDir)) {
                            fs.rmdirSync(hooksDir);
                        }
                        fs.rmdirSync(cliDir);
                    }
                } catch (error) {
                    // Directory not empty or other error, not critical
                }
            }

            // Try to remove base directory if empty
            try {
                fs.rmdirSync(basePath);
                rollbackResult.removedFiles.push(basePath);
            } catch (error) {
                // Base directory not empty or other error, not critical
            }

            rollbackResult.success = rollbackResult.errors.length === 0;

        } catch (error) {
            rollbackResult.errors.push({
                general: error.message
            });
        }

        return rollbackResult;
    }

    verifyInstallation(basePath) {
        return this.verifier.verifyInstallation(basePath);
    }

    repairInstallation(basePath) {
        const repairResult = {
            success: false,
            action: 'repair',
            repairs: [],
            errors: [],
            basePath
        };

        try {
            // First verify current installation
            const verification = this.verifyInstallation(basePath);

            // Repair missing or invalid hooks
            for (const hookVerification of verification.verifiedHooks) {
                if (!hookVerification.exists || !hookVerification.isValid) {
                    const repairResult = this.hookInstaller.installHook(
                        hookVerification.cliType,
                        basePath
                    );

                    repairResult.repairs.push({
                        cliType: hookVerification.cliType,
                        action: repairResult.success ? 'reinstalled' : 'failed',
                        previousState: {
                            existed: hookVerification.exists,
                            valid: hookVerification.isValid
                        },
                        newState: {
                            success: repairResult.success
                        }
                    });
                }
            }

            repairResult.success = repairResult.errors.length === 0;
            repairResult.finalVerification = this.verifyInstallation(basePath);

        } catch (error) {
            repairResult.errors.push({
                general: error.message
            });
        }

        return repairResult;
    }

    getInstallationStatus(basePath = null) {
        const status = {
            installed: false,
            verified: false,
            hooks: [],
            lastCheck: new Date().toISOString(),
            basePath: basePath || this.getDefaultInstallationPath()
        };

        if (fs.existsSync(status.basePath)) {
            status.installed = true;

            try {
                const verification = this.verifier.verifyInstallation(status.basePath);
                status.verified = verification.overallStatus === 'complete';
                status.hooks = verification.verifiedHooks.map(hook => ({
                    cliType: hook.cliType,
                    exists: hook.exists,
                    valid: hook.isValid,
                    errors: hook.errors.length,
                    warnings: hook.warnings.length
                }));
            } catch (error) {
                status.verificationError = error.message;
            }
        }

        return status;
    }

    getDefaultInstallationPath() {
        const platformPaths = this.platformAdapter.getPlatformPaths();
        return path.join(platformPaths.configDirectory, 'hooks');
    }

    generateInstallationReport(installationResult) {
        const lines = [];

        lines.push('Hook Installation Report');
        lines.push('========================');
        lines.push(`Started: ${installationResult.startTime}`);
        lines.push(`Completed: ${installationResult.endTime || 'In Progress'}`);
        lines.push(`Phase: ${installationResult.phase}`);
        lines.push(`Success: ${installationResult.success}`);
        lines.push('');

        if (installationResult.duration) {
            lines.push(`Duration: ${installationResult.duration}ms`);
            lines.push('');
        }

        lines.push('Detection Results:');
        lines.push(`  Total Detected CLI Tools: ${installationResult.totalDetected}`);
        if (installationResult.detectedTools) {
            installationResult.detectedTools.forEach(tool => {
                lines.push(`  - ${tool.name}: ${tool.version} (${tool.path})`);
            });
        }
        lines.push('');

        lines.push('Installation Results:');
        lines.push(`  Total Hooks Installed: ${installationResult.totalInstalled}`);
        installationResult.installedHooks.forEach(hook => {
            lines.push(`  - ${hook.cliType}: ${hook.detected ? 'Detected' : 'Not Detected'} - ${hook.installed ? 'Installed' : 'Failed'}`);
        });
        lines.push('');

        if (installationResult.errors.length > 0) {
            lines.push('Errors:');
            installationResult.errors.forEach((error, index) => {
                if (typeof error === 'string') {
                    lines.push(`  ${index + 1}. ${error}`);
                } else {
                    lines.push(`  ${index + 1}. ${JSON.stringify(error)}`);
                }
            });
            lines.push('');
        }

        if (installationResult.warnings && installationResult.warnings.length > 0) {
            lines.push('Warnings:');
            installationResult.warnings.forEach((warning, index) => {
                lines.push(`  ${index + 1}. ${warning}`);
            });
        }

        return lines.join('\n');
    }
}

module.exports = InstallationManager;