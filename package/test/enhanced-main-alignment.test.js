#!/usr/bin/env node

/**
 * Enhanced Main.js 功能对齐测试 - TDD驱动开�? * 基于main.js完整功能，测试enhanced版本的对齐情�? */

const { strict: assert } = require('assert');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class EnhancedMainAlignTest {
    constructor() {
        this.testResults = [];
        this.mainJsPath = path.join(process.cwd(), 'package', 'src', 'main.js');
        this.enhancedJsPath = path.join(process.cwd(), 'package', 'src', 'enhanced-main.js');
    }

    // TDD测试：命令行参数支持
    async testCommandLineArguments() {
        console.log('🧪 测试命令行参数支�?..');

        const requiredCommands = [
            'init', 'status', 'scan', 'deploy',
            'validate', 'check-project', 'clean', 'install'
        ];

        for (const cmd of requiredCommands) {
            try {
                const result = await this.runCommand(this.enhancedJsPath, [cmd, '--help'], { timeout: 5000 });
                this.addTest(`命令支持: ${cmd}`, result.exitCode === 0);
            } catch (error) {
                this.addTest(`命令支持: ${cmd}`, false, error.message);
            }
        }
    }

    // TDD测试：项目初始化功能
    async testProjectInitialization() {
        console.log('🧪 测试项目初始化功�?..');

        const testProjectDir = path.join(process.cwd(), 'test-project-temp');

        try {
            // 创建测试目录
            await fs.mkdir(testProjectDir, { recursive: true });

            // 测试初始�?            const result = await this.runCommand(this.enhancedJsPath, ['init', testProjectDir]);

            // 验证配置文件生成
            const configPath = path.join(testProjectDir, '.stigmergy-project', 'stigmergy-config.json');
            const configExists = await this.fileExists(configPath);

            // 验证配置内容
            let configValid = false;
            if (configExists) {
                const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
                configValid = config.projectType && config.adapters && Array.isArray(config.adapters);
            }

            this.addTest('项目初始化：生成配置文件', configExists);
            this.addTest('项目初始化：配置内容有效', configValid);
            this.addTest('项目初始化：命令执行成功', result.exitCode === 0);

            // 清理测试目录
            await fs.rm(testProjectDir, { recursive: true, force: true });

        } catch (error) {
            this.addTest('项目初始化功�?, false, error.message);
        }
    }

    // TDD测试：状态检查功�?    async testStatusCheck() {
        console.log('🧪 测试状态检查功�?..');

        try {
            const result = await this.runCommand(this.enhancedJsPath, ['status']);
            const hasStatusOutput = result.stdout.includes('全局配置') ||
                                   result.stdout.includes('项目配置') ||
                                   result.stdout.includes('可用适配�?);

            this.addTest('状态检查：命令执行', result.exitCode === 0);
            this.addTest('状态检查：输出格式正确', hasStatusOutput);

        } catch (error) {
            this.addTest('状态检查功�?, false, error.message);
        }
    }

    // TDD测试：配置验证功�?    async testConfigurationValidation() {
        console.log('🧪 测试配置验证功能...');

        try {
            // 测试项目验证
            const projectResult = await this.runCommand(this.enhancedJsPath, ['validate', 'project']);

            // 测试全局验证
            const globalResult = await this.runCommand(this.enhancedJsPath, ['validate', 'global']);

            this.addTest('配置验证：项目验�?, projectResult.exitCode === 0);
            this.addTest('配置验证：全局验证', globalResult.exitCode === 0);

        } catch (error) {
            this.addTest('配置验证功能', false, error.message);
        }
    }

    // TDD测试：适配器管理功�?    async testAdapterManager() {
        console.log('🧪 测试适配器管理功�?..');

        try {
            // 测试适配器加�?            const result = await this.runCommand(this.enhancedJsPath, ['deploy']);

            this.addTest('适配器管理：部署功能', result.exitCode === 0);

        } catch (error) {
            this.addTest('适配器管理功�?, false, error.message);
        }
    }

    // TDD测试：工具扫描功�?    async testToolScanning() {
        console.log('🧪 测试工具扫描功能...');

        try {
            const result = await this.runCommand(this.enhancedJsPath, ['scan']);

            const hasToolList = result.stdout.includes('Claude CLI') ||
                               result.stdout.includes('Gemini CLI') ||
                               result.stdout.includes('扫描');

            const hasInstallationPrompt = result.stdout.includes('安装') ||
                                         result.stdout.includes('缺失');

            this.addTest('工具扫描：命令执�?, result.exitCode === 0);
            this.addTest('工具扫描：工具列表显�?, hasToolList);
            this.addTest('工具扫描：安装提�?, hasInstallationPrompt);

        } catch (error) {
            this.addTest('工具扫描功能', false, error.message);
        }
    }

    // TDD测试：缓存清理功�?    async testCacheCleaning() {
        console.log('🧪 测试缓存清理功能...');

        try {
            const result = await this.runCommand(this.enhancedJsPath, ['clean']);

            this.addTest('缓存清理：命令执�?, result.exitCode === 0);

        } catch (error) {
            this.addTest('缓存清理功能', false, error.message);
        }
    }

    // 运行命令的辅助方�?    async runCommand(scriptPath, args = [], options = {}) {
        return new Promise((resolve) => {
            const child = spawn('node', [scriptPath, ...args], {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: process.cwd(),
                ...options
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                resolve({
                    exitCode: code,
                    stdout: stdout,
                    stderr: stderr
                });
            });

            // 处理交互式命�?- 发送输�?            if (args.includes('scan')) {
                // 对于scan命令，发�?N"来跳过安�?                setTimeout(() => {
                    child.stdin.write('N\n');
                    child.stdin.end();
                }, 3000);
            }

            // 超时处理
            setTimeout(() => {
                child.kill();
                resolve({
                    exitCode: -1,
                    stdout: stdout,
                    stderr: 'Command timeout'
                });
            }, options.timeout || 30000);
        });
    }

    // 检查文件是否存�?    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    // 添加测试结果
    addTest(testName, passed, error = '') {
        this.testResults.push({
            test: testName,
            passed: passed,
            error: error
        });

        const status = passed ? '�? : '�?;
        console.log(`  ${status} ${testName}`);
        if (error) {
            console.log(`    错误: ${error}`);
        }
    }

    // 生成测试报告
    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;

        console.log('\n📊 测试报告');
        console.log('='.repeat(50));
        console.log(`总测试数: ${totalTests}`);
        console.log(`通过: ${passedTests} ✅`);
        console.log(`失败: ${failedTests} ❌`);
        console.log(`通过�? ${((passedTests / totalTests) * 100).toFixed(1)}%`);

        if (failedTests > 0) {
            console.log('\n�?失败的测�?');
            this.testResults
                .filter(r => !r.passed)
                .forEach(r => {
                    console.log(`  - ${r.test}: ${r.error}`);
                });
        }

        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            passRate: (passedTests / totalTests) * 100
        };
    }

    // 运行所有测�?    async runAllTests() {
        console.log('🚀 开始Enhanced Main.js功能对齐测试');
        console.log('='.repeat(50));

        await this.testCommandLineArguments();
        await this.testProjectInitialization();
        await this.testStatusCheck();
        await this.testConfigurationValidation();
        await this.testAdapterManager();
        await this.testToolScanning();
        await this.testCacheCleaning();

        return this.generateReport();
    }
}

// 如果直接运行此文�?if (require.main === module) {
    const tester = new EnhancedMainAlignTest();
    tester.runAllTests()
        .then(report => {
            process.exit(report.failed > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('测试执行失败:', error);
            process.exit(1);
        });
}

module.exports = EnhancedMainAlignTest;
