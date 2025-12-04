#!/usr/bin/env node

/**
 * Stigmergy CLI - 功能回归测试套件
 * 使用TDD方法验证重构前后的功能一致性
 */

import { spawn, spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { access } from 'fs/promises';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class StigmergyCLITestSuite {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
        this.originalDir = process.cwd();
    }

    async runTest(name, testFunction) {
        this.testResults.total++;
        console.log(`\n🧪 测试: ${name}`);
        
        try {
            await testFunction();
            console.log(`✅ 通过: ${name}`);
            this.testResults.passed++;
        } catch (error) {
            console.log(`❌ 失败: ${name}`);
            console.log(`   错误: ${error.message}`);
            this.testResults.failed++;
        }
    }

    async executeCommand(command, args, options = {}) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true,
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
                resolve({ code, stdout, stderr });
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    async testBasicCommands() {
        // 测试基本命令
        const commands = ['scan', 'status', 'init --help', 'deploy --help'];
        
        for (const cmd of commands) {
            await this.runTest(`基本命令 - stigmergy ${cmd}`, async () => {
                const result = await this.executeCommand('node', ['src/main.js', ...cmd.split(' ')]);
                // 基本要求：命令不应崩溃
                if (result.code !== 0 && !result.stdout.includes('Usage:')) {
                    throw new Error(`命令 'stigmergy ${cmd}' 执行失败: ${result.stderr}`);
                }
            });
        }
    }

    async testHelpOutput() {
        await this.runTest('帮助输出格式', async () => {
            const result = await this.executeCommand('node', ['src/main.js']);
            if (result.code !== 0) {
                throw new Error('帮助命令执行失败');
            }
            
            const output = result.stdout;
            if (!output.includes('[STIGMERGY]') || !output.includes('[COMMANDS]')) {
                throw new Error('帮助输出格式不符合预期');
            }
        });
    }

    async testScanFunctionality() {
        await this.runTest('扫描功能', async () => {
            const result = await this.executeCommand('node', ['src/main.js', 'scan']);
            if (result.code !== 0) {
                throw new Error('扫描命令执行失败');
            }
            
            const output = result.stdout;
            if (!output.includes('[SCAN]') || !output.includes('[RESULTS]')) {
                throw new Error('扫描输出格式不符合预期');
            }
        });
    }

    async testConfigDirectory() {
        await this.runTest('配置目录创建', async () => {
            const configDir = join(homedir(), '.stigmergy');
            try {
                await access(configDir);
            } catch {
                throw new Error('配置目录不存在');
            }
        });
    }

    async testCommandAvailability() {
        await this.runTest('CLI命令可用性检查', async () => {
            // 检查几个关键命令是否能识别 (直接shell测试)
            const essentialCommands = ['node', 'npm', 'npx'];
            for (const cmd of essentialCommands) {
                const result = await this.executeCommand(
                    process.platform === 'win32' ? 'where' : 'which',
                    [cmd]
                );
                if (result.code !== 0) {
                    console.warn(`警告: ${cmd} 命令不可用，但不是测试失败`);
                }
            }
        });
    }

    async runAllTests() {
        console.log('🚀 开始Stigmergy CLI功能回归测试...');
        console.log('==================================');

        // 保存当前目录
        const currentDir = process.cwd();
        
        try {
            // 运行所有测试
            await this.testHelpOutput();
            await this.testScanFunctionality();
            await this.testBasicCommands();
            await this.testConfigDirectory();

            console.log('\n==================================');
            console.log('📊 测试结果:');
            console.log(`通过: ${this.testResults.passed}`);
            console.log(`失败: ${this.testResults.failed}`);
            console.log(`总计: ${this.testResults.total}`);
            
            const successRate = (this.testResults.passed / this.testResults.total * 100).toFixed(1);
            console.log(`成功率: ${successRate}%`);
            
            if (this.testResults.failed === 0) {
                console.log('🎉 所有测试通过！');
                return true;
            } else {
                console.log('⚠️  有测试失败，请检查问题');
                return false;
            }
        } finally {
            // 恢复原始目录
            process.chdir(currentDir);
        }
    }
}

// 运行测试套件
async function runTests() {
    const testSuite = new StigmergyCLITestSuite();
    const success = await testSuite.runAllTests();
    process.exit(success ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(console.error);
}

export { StigmergyCLITestSuite };