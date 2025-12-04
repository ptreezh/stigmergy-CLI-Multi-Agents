/**
 * TDD: CLI Scanner Unit Tests
 * 测试驱动开发 - 先写测试，再写实现
 * 使用ANSI编码，无Unicode字符
 */

const assert = require('assert');
const path = require('path');

// 测试目标类 - 尚未实现
class CLIScanner {
    constructor() {
        this.scanResults = new Map();
    }

    async scanForCLI(cliName) {
        throw new Error('Not implemented yet - TDD approach');
    }

    async detectInstalledCLIs() {
        throw new Error('Not implemented yet - TDD approach');
    }

    validateCLIExecutable(command) {
        throw new Error('Not implemented yet - TDD approach');
    }
}

describe('CLI Scanner Unit Tests - ANSI Encoding, Node.js First', () => {
    let scanner;

    beforeEach(() => {
        scanner = new CLIScanner();
    });

    describe('Basic CLI Detection', () => {
        it('should detect node command is available', async () => {
            // 测试最基础的情况 - node命令应该可用
            const result = await scanner.scanForCLI('node');

            assert.strictEqual(result.cliName, 'node');
            assert.strictEqual(result.available, true);
            assert.ok(result.version);
            assert.ok(result.path);
        });

        it('should detect npm command is available', async () => {
            const result = await scanner.scanForCLI('npm');

            assert.strictEqual(result.cliName, 'npm');
            assert.strictEqual(result.available, true);
            assert.ok(result.version);
        });

        it('should handle non-existent CLI gracefully', async () => {
            const result = await scanner.scanForCLI('non-existent-cli-12345');

            assert.strictEqual(result.cliName, 'non-existent-cli-12345');
            assert.strictEqual(result.available, false);
            assert.ok(result.error);
        });
    });

    describe('AI CLI Detection', () => {
        it('should detect Claude CLI if installed', async () => {
            const result = await scanner.scanForCLI('claude');

            assert.strictEqual(result.cliName, 'claude');
            assert(typeof result.available === 'boolean');

            if (result.available) {
                assert.ok(result.version);
                assert.ok(result.path);
            }
        });

        it('should detect Gemini CLI if installed', async () => {
            const result = await scanner.scanForCLI('gemini');

            assert.strictEqual(result.cliName, 'gemini');
            assert(typeof result.available === 'boolean');
        });

        it('should detect Qwen CLI if installed', async () => {
            const result = await scanner.scanForCLI('qwen');

            assert.strictEqual(result.cliName, 'qwen');
            assert(typeof result.available === 'boolean');
        });
    });

    describe('CLI Validation', () => {
        it('should validate valid Windows commands', () => {
            if (process.platform === 'win32') {
                assert.ok(scanner.validateCLIExecutable('cmd'));
                assert.ok(scanner.validateCLIExecutable('powershell'));
                assert.ok(scanner.validateCLIExecutable('node'));
            }
        });

        it('should validate valid Unix commands', () => {
            if (process.platform !== 'win32') {
                assert.ok(scanner.validateCLIExecutable('sh'));
                assert.ok(scanner.validateCLIExecutable('ls'));
                assert.ok(scanner.validateCLIExecutable('node'));
            }
        });

        it('should reject invalid commands', () => {
            assert.strictEqual(scanner.validateCLIExecutable(''), false);
            assert.strictEqual(scanner.validateCLIExecutable('non-existent-command-12345'), false);
        });
    });

    describe('Batch Detection', () => {
        it('should detect all basic development tools', async () => {
            const tools = ['node', 'npm', 'git'];
            const results = await scanner.detectInstalledCLIs(tools);

            assert.ok(results.size >= 2); // 至少node和npm应该可用
            assert.ok(results.has('node'));
            assert.ok(results.has('npm'));

            // node和npm都应该可用
            assert.strictEqual(results.get('node').available, true);
            assert.strictEqual(results.get('npm').available, true);
        });

        it('should handle mixed available/unavailable tools', async () => {
            const tools = ['node', 'non-existent-cli', 'npm'];
            const results = await scanner.detectInstalledCLIs(tools);

            assert.strictEqual(results.size, 3);
            assert.ok(results.has('node'));
            assert.ok(results.has('npm'));
            assert.ok(results.has('non-existent-cli'));

            assert.strictEqual(results.get('node').available, true);
            assert.strictEqual(results.get('npm').available, true);
            assert.strictEqual(results.get('non-existent-cli').available, false);
        });
    });

    describe('Error Handling', () => {
        it('should handle null input gracefully', async () => {
            try {
                await scanner.scanForCLI(null);
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.ok(error.message.includes('Invalid CLI name'));
            }
        });

        it('should handle empty string gracefully', async () => {
            try {
                await scanner.scanForCLI('');
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.ok(error.message.includes('Invalid CLI name'));
            }
        });

        it('should handle timeout during scanning', async () => {
            // 测试超时处理
            const timeoutMs = 1000;
            const startTime = Date.now();

            try {
                await scanner.scanForCLI('sleep-command-that-does-not-exist', { timeout: timeoutMs });
            } catch (error) {
                const elapsed = Date.now() - startTime;
                assert.ok(elapsed < timeoutMs + 1000); // 允许一些误差
                assert.ok(error.message.includes('timeout') || error.message.includes('not found'));
            }
        });
    });

    describe('Platform Specific Tests', () => {
        it('should work on Windows', async () => {
            if (process.platform === 'win32') {
                const result = await scanner.scanForCLI('node');
                assert.strictEqual(result.available, true);
                assert.ok(result.path.includes('.exe') || result.path.includes('node'));
            }
        });

        it('should work on Unix-like systems', async () => {
            if (process.platform !== 'win32') {
                const result = await scanner.scanForCLI('node');
                assert.strictEqual(result.available, true);
            }
        });
    });

    describe('Performance Tests', () => {
        it('should scan multiple CLIs efficiently', async () => {
            const tools = ['node', 'npm', 'git', 'code'];
            const startTime = Date.now();

            const results = await scanner.detectInstalledCLIs(tools);

            const elapsed = Date.now() - startTime;
            assert.ok(elapsed < 5000); // 应该在5秒内完成
            assert.strictEqual(results.size, tools.length);
        });

        it('should cache scan results', async () => {
            const cliName = 'node';

            // 第一次扫描
            const startTime1 = Date.now();
            const result1 = await scanner.scanForCLI(cliName);
            const time1 = Date.now() - startTime1;

            // 第二次扫描（应该使用缓存）
            const startTime2 = Date.now();
            const result2 = await scanner.scanForCLI(cliName);
            const time2 = Date.now() - startTime2;

            assert.deepStrictEqual(result1, result2);
            assert.ok(time2 <= time1); // 缓存应该更快或相等
        });
    });
});

// 运行测试
if (require.main === module) {
    console.log('Running CLI Scanner Unit Tests...');

    // 简单的测试运行器
    const testMethods = [
        'should detect node command is available',
        'should detect npm command is available',
        'should handle non-existent CLI gracefully',
        'should validate valid Windows commands',
        'should reject invalid commands',
        'should handle null input gracefully'
    ];

    (async () => {
        const scanner = new CLIScanner();
        let passed = 0;
        let failed = 0;

        for (const testName of testMethods) {
            try {
                console.log(`Testing: ${testName}`);

                if (testName.includes('node')) {
                    const result = await scanner.scanForCLI('node');
                    if (result.available) {
                        console.log(`[PASS] ${testName}`);
                        passed++;
                    } else {
                        console.log(`[FAIL] ${testName} - Node not available`);
                        failed++;
                    }
                } else if (testName.includes('npm')) {
                    const result = await scanner.scanForCLI('npm');
                    if (result.available) {
                        console.log(`[PASS] ${testName}`);
                        passed++;
                    } else {
                        console.log(`[FAIL] ${testName} - NPM not available`);
                        failed++;
                    }
                } else if (testName.includes('non-existent')) {
                    try {
                        await scanner.scanForCLI('non-existent-cli-12345');
                        console.log(`[FAIL] ${testName} - Should have thrown error`);
                        failed++;
                    } catch (error) {
                        console.log(`[PASS] ${testName}`);
                        passed++;
                    }
                } else {
                    console.log(`[SKIP] ${testName} - Implementation needed`);
                }

            } catch (error) {
                console.log(`[ERROR] ${testName} - ${error.message}`);
                failed++;
            }
        }

        console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
        console.log('Implementation needed for full TDD approach.');
    })();
}

module.exports = CLIScanner;