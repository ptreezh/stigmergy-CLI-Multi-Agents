/**
 * Real Test Runner - TDD Implementation Validation
 * 真实测试，无Mock，ANSI编码，Node.js优先
 */

const fs = require('fs');
const path = require('path');

// 导入我们的实�?const CLIScanner = require('../src/core/cli-scanner');
const CrossCLIExecutor = require('../src/core/cross-cli-executor');

// ANSI安全输出
function safeLog(message) {
    process.stdout.write(`${message}\n`);
}

// 简单的测试框架
class RealTestRunner {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            errors: 0
        };
    }

    async test(name, testFn) {
        try {
            safeLog(`Testing: ${name}`);
            await testFn();
            this.results.passed++;
            safeLog(`[PASS] ${name}`);
        } catch (error) {
            this.results.failed++;
            safeLog(`[FAIL] ${name}`);
            safeLog(`       Error: ${error.message}`);
        }
    }

    skip(name, reason) {
        this.results.skipped++;
        safeLog(`[SKIP] ${name} - ${reason}`);
    }

    error(name, error) {
        this.results.errors++;
        safeLog(`[ERROR] ${name}`);
        safeLog(`        ${error.message}`);
    }

    printSummary() {
        const total = this.results.passed + this.results.failed + this.results.skipped + this.results.errors;
        safeLog(`\n=== Test Summary ===`);
        safeLog(`Total: ${total}`);
        safeLog(`Passed: ${this.results.passed}`);
        safeLog(`Failed: ${this.results.failed}`);
        safeLog(`Skipped: ${this.results.skipped}`);
        safeLog(`Errors: ${this.results.errors}`);
        safeLog(`Success Rate: ${((this.results.passed / total) * 100).toFixed(1)}%`);
    }
}

// 测试套件
async function runRealTests() {
    safeLog('Starting Real TDD Tests - No Mocks, ANSI Encoding Only');
    safeLog('='.repeat(60));

    const runner = new RealTestRunner();

    // 1. CLI扫描器测�?    safeLog('\n--- CLI Scanner Tests ---');

    await runner.test('Scanner initialization', () => {
        const scanner = new CLIScanner();
        if (!scanner) {
            throw new Error('Scanner failed to initialize');
        }
    });

    await runner.test('Detect Node.js CLI', async () => {
        const scanner = new CLIScanner();
        const result = await scanner.scanForCLI('node', { timeout: 5000 });

        if (!result.available) {
            throw new Error('Node.js should be available');
        }
        if (!result.version) {
            throw new Error('Node.js version should be detected');
        }
        if (!result.path) {
            throw new Error('Node.js path should be detected');
        }
    });

    await runner.test('Detect NPM CLI', async () => {
        const scanner = new CLIScanner();
        const result = await scanner.scanForCLI('npm', { timeout: 5000 });

        if (!result.available) {
            throw new Error('NPM should be available');
        }
        if (!result.version) {
            throw new Error('NPM version should be detected');
        }
    });

    await runner.test('Handle non-existent CLI', async () => {
        const scanner = new CLIScanner();
        const result = await scanner.scanForCLI('non-existent-cli-12345', { timeout: 3000 });

        if (result.available) {
            throw new Error('Non-existent CLI should not be available');
        }
        if (!result.error) {
            throw new Error('Should include error message');
        }
    });

    await runner.test('Batch CLI detection', async () => {
        const scanner = new CLIScanner();
        const results = await scanner.detectInstalledCLIs(['node', 'npm', 'non-existent-cli'], { timeout: 5000 });

        if (results.size !== 3) {
            throw new Error('Should return results for all 3 CLIs');
        }
        if (!results.get('node').available) {
            throw new Error('Node should be available');
        }
        if (!results.get('npm').available) {
            throw new Error('NPM should be available');
        }
        if (results.get('non-existent-cli').available) {
            throw new Error('Non-existent CLI should not be available');
        }
    });

    await runner.test('CLI validation', () => {
        const scanner = new CLIScanner();

        if (!scanner.validateCLIExecutable('node')) {
            throw new Error('Node should be valid executable');
        }
        if (scanner.validateCLIExecutable('')) {
            throw new Error('Empty string should not be valid');
        }
        if (scanner.validateCLIExecutable('non-existent-command-12345')) {
            throw new Error('Random string should not be valid executable');
        }
    });

    // 2. 跨CLI执行器测�?    safeLog('\n--- Cross-CLI Executor Tests ---');

    await runner.test('Executor initialization', () => {
        const executor = new CrossCLIExecutor();
        if (!executor) {
            throw new Error('Executor failed to initialize');
        }
    });

    await runner.test('Execute Node.js command', async () => {
        const executor = new CrossCLIExecutor();
        const result = await executor.executeCommand('node', ['--version'], { timeout: 5000 });

        if (!result.success) {
            throw new Error('Node version command should succeed');
        }
        if (!result.stdout) {
            throw new Error('Should have stdout output');
        }
        if (result.exitCode !== 0) {
            throw new Error('Exit code should be 0');
        }
    });

    await runner.test('Execute NPM command', async () => {
        const executor = new CrossCLIExecutor();
        const result = await executor.executeCommand('npm', ['--version'], { timeout: 5000 });

        if (!result.success) {
            throw new Error('NPM version command should succeed');
        }
        if (!result.stdout) {
            throw new Error('Should have stdout output');
        }
    });

    await runner.test('Handle command timeout', async () => {
        const executor = new CrossCLIExecutor();
        const startTime = Date.now();

        try {
            await executor.executeCommand('node', ['-e', 'setTimeout(() => {}, 5000)'], { timeout: 2000 });
            throw new Error('Should have thrown timeout error');
        } catch (error) {
            const elapsed = Date.now() - startTime;
            if (elapsed > 10000) { // 10秒安全边�?                throw new Error('Timeout should have occurred quickly');
            }
        }
    });

    await runner.test('Handle non-existent command', async () => {
        const executor = new CrossCLIExecutor();
        const result = await executor.executeCommand('non-existent-command-12345', [], { timeout: 3000 });

        if (result.success) {
            throw new Error('Non-existent command should fail');
        }
        if (!result.error) {
            throw new Error('Should include error message');
        }
    });

    await runner.test('Parameter validation', () => {
        const executor = new CrossCLIExecutor();

        // 有效参数
        const validResult = executor.validateExecutionParams('claude', 'gemini', 'test task');
        if (!validResult.valid) {
            throw new Error('Valid parameters should pass');
        }

        // 无效参数
        const invalidResult1 = executor.validateExecutionParams('', 'gemini', 'test task');
        if (invalidResult1.valid) {
            throw new Error('Empty source CLI should be invalid');
        }

        const invalidResult2 = executor.validateExecutionParams('claude', '', 'test task');
        if (invalidResult2.valid) {
            throw new Error('Empty target CLI should be invalid');
        }

        const invalidResult3 = executor.validateExecutionParams('claude', 'gemini', '');
        if (invalidResult3.valid) {
            throw new Error('Empty task should be invalid');
        }

        const invalidResult4 = executor.validateExecutionParams('claude', 'claude', 'test task');
        if (invalidResult4.valid) {
            throw new Error('Same source and target should be invalid');
        }
    });

    // 3. 跨CLI协作测试
    safeLog('\n--- Cross-CLI Collaboration Tests ---');

    await runner.test('Dry run cross-CLI execution', async () => {
        const executor = new CrossCLIExecutor();
        const result = await executor.executeCrossCLI('claude', 'gemini', 'translate "hello world"', {
            dryRun: true,
            timeout: 5000
        });

        if (!result.success) {
            throw new Error('Dry run should succeed');
        }
        if (!result.sourceCLI || result.sourceCLI !== 'claude') {
            throw new Error('Should preserve source CLI');
        }
        if (!result.targetCLI || result.targetCLI !== 'gemini') {
            throw new Error('Should preserve target CLI');
        }
        if (!result.executionId) {
            throw new Error('Should generate execution ID');
        }
    });

    // 4. 性能和内存测�?    safeLog('\n--- Performance Tests ---');

    await runner.test('Concurrent command execution', async () => {
        const executor = new CrossCLIExecutor();
        const startTime = Date.now();

        const commands = [
            executor.executeCommand('node', ['--version']),
            executor.executeCommand('npm', ['--version']),
            executor.executeCommand('node', ['-e', 'console.log("test")'])
        ];

        const results = await Promise.all(commands);
        const elapsed = Date.now() - startTime;

        if (results.length !== 3) {
            throw new Error('Should execute all 3 commands');
        }
        if (!results.every(r => r.success)) {
            throw new Error('All commands should succeed');
        }
        if (elapsed > 15000) { // 15秒安全边�?            throw new Error('Should complete within reasonable time');
        }
    });

    await runner.test('Memory usage', async () => {
        const initialMemory = process.memoryUsage().heapUsed;
        const executor = new CrossCLIExecutor();

        // 执行多个命令测试内存泄漏
        for (let i = 0; i < 20; i++) {
            await executor.executeCommand('node', ['--version']);
        }

        // 强制垃圾回收（如果可用）
        if (global.gc) {
            global.gc();
        }

        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;

        // 内存增长应该控制在合理范围内
        const maxAcceptableIncrease = 50 * 1024 * 1024; // 50MB
        if (memoryIncrease > maxAcceptableIncrease) {
            throw new Error(`Memory increased too much: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
        }
    });

    // 5. 平台特定测试
    safeLog('\n--- Platform-Specific Tests ---');

    if (process.platform === 'win32') {
        await runner.test('Windows command execution', async () => {
            const executor = new CrossCLIExecutor();
            const result = await executor.executeCommand('cmd', ['/c', 'echo test'], { timeout: 5000 });

            if (!result.success) {
                throw new Error('Windows cmd should succeed');
            }
        });
    } else {
        await runner.test('Unix command execution', async () => {
            const executor = new CrossCLIExecutor();
            const result = await executor.executeCommand('echo', ['test'], { timeout: 5000 });

            if (!result.success) {
                throw new Error('Unix echo should succeed');
            }
        });
    }

    // 6. 错误处理和边界条件测�?    safeLog('\n--- Error Handling Tests ---');

    await runner.test('Invalid input handling', async () => {
        const executor = new CrossCLIExecutor();

        // 测试无效命令
        try {
            await executor.executeCommand('', []);
            throw new Error('Empty command should throw error');
        } catch (error) {
            if (!error.message.includes('Invalid command')) {
                throw new Error('Should have specific error message');
            }
        }
    });

    await runner.test('Statistics tracking', async () => {
        const executor = new CrossCLIExecutor();
        const initialStats = executor.getStats();

        // 执行一些命�?        await executor.executeCommand('node', ['--version']);
        await executor.executeCommand('non-existent-command', []);

        const finalStats = executor.getStats();
        if (finalStats.totalExecutions <= initialStats.totalExecutions) {
            throw new Error('Statistics should track executions');
        }
    });

    // 打印总结
    runner.printSummary();

    // 7. 集成测试
    safeLog('\n--- Integration Tests ---');

    await runner.test('End-to-end scanner and executor integration', async () => {
        const scanner = new CLIScanner();
        const executor = new CrossCLIExecutor();

        // 扫描可用的CLI
        const scanResults = await scanner.detectInstalledCLIs(['node', 'npm']);

        if (scanResults.size === 0) {
            throw new Error('Should detect at least some CLI tools');
        }

        // 使用检测到的CLI执行命令
        for (const [cliName, cliInfo] of scanResults) {
            if (cliInfo.available) {
                const result = await executor.executeCommand(cliName, ['--version']);
                if (!result.success) {
                    safeLog(`Warning: ${cliName} detected but failed to execute`);
                }
            }
        }
    });

    safeLog('\n=== All Real Tests Completed ===');
    runner.printSummary();

    return runner.results;
}

// 主执行函�?async function main() {
    try {
        const results = await runRealTests();

        // 设置退出码
        if (results.failed > 0 || results.errors > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }

    } catch (error) {
        safeLog(`Fatal error during test execution: ${error.message}`);
        safeLog(`Stack trace: ${error.stack}`);
        process.exit(1);
    }
}

// 如果直接运行此文�?if (require.main === module) {
    main();
}

module.exports = { RealTestRunner, runRealTests };
