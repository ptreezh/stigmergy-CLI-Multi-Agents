#!/usr/bin/env node

/**
 * Integration Test for Tool Selection Fix
 * Tests the actual main.js handleSkillsCommand function
 */

const { spawn } = require('child_process');
const path = require('path');

function runCommand(args) {
    return new Promise((resolve, reject) => {
        const mainPath = path.join(__dirname, '..', 'src', 'main.js');
        const child = spawn('node', [mainPath, ...args], {
            cwd: path.join(__dirname, '..'),
            stdio: ['pipe', 'pipe', 'pipe'],
            encoding: 'utf8'
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data;
        });

        child.stderr.on('data', (data) => {
            stderr += data;
        });

        child.on('close', (code) => {
            resolve({ code, stdout, stderr });
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function testToolSelectionIntegration() {
    console.log('==============================================');
    console.log('TOOL SELECTION INTEGRATION TEST');
    console.log('==============================================');
    console.log('');

    const testCases = [
        {
            name: 'Test 1: Tool selection with --tool=claude',
            args: ['skills', 'execute', 'translation', '--text=hello', '--to=zh', '--tool=claude'],
            expectedTool: 'claude',
            shouldContain: ['Using tool: claude']
        },
        {
            name: 'Test 2: Tool selection with --tool gemini',
            args: ['skills', 'execute', 'translation', '--text=hello', '--to=zh', '--tool', 'gemini'],
            expectedTool: 'gemini',
            shouldContain: ['Using tool: gemini']
        },
        {
            name: 'Test 3: No tool specified (should use default)',
            args: ['skills', 'execute', 'translation', '--text=hello', '--to=zh'],
            expectedTool: null,
            shouldContain: ['Executing skill: translation'],
            shouldNotContain: ['Using tool:']
        },
        {
            name: 'Test 4: Complex parameters with tool selection',
            args: ['skills', 'execute', 'code-analysis', '--file=app.js', '--line=10', '--tool=qwen'],
            expectedTool: 'qwen',
            shouldContain: ['Using tool: qwen', 'Parameters: {"file":"app.js","line":"10"}']
        }
    ];

    let passed = 0;
    let total = testCases.length;

    for (const testCase of testCases) {
        console.log(`${testCase.name}`);
        console.log(`Command: node package/src/index.js ${testCase.args.join(' ')}`);

        try {
            const result = await runCommand(testCase.args);

            console.log(`Exit code: ${result.code}`);
            if (result.stdout) {
                console.log(`Output: ${result.stdout.trim()}`);
            }
            if (result.stderr) {
                console.log(`Error: ${result.stderr.trim()}`);
            }

            // Validate results
            let success = true;

            // Check for expected content
            if (testCase.shouldContain) {
                for (const expected of testCase.shouldContain) {
                    if (!result.stdout.includes(expected)) {
                        console.log(`â?Missing expected output: "${expected}"`);
                        success = false;
                    }
                }
            }

            // Check for unexpected content
            if (testCase.shouldNotContain) {
                for (const unexpected of testCase.shouldNotContain) {
                    if (result.stdout.includes(unexpected)) {
                        console.log(`â?Found unexpected output: "${unexpected}"`);
                        success = false;
                    }
                }
            }

            // Check exit code
            if (result.code !== 0) {
                console.log(`â?Command failed with exit code ${result.code}`);
                success = false;
            }

            if (success) {
                console.log(`âœ?PASSED`);
                passed++;
            } else {
                console.log(`â?FAILED`);
            }

        } catch (error) {
            console.log(`â?ERROR: ${error.message}`);
        }

        console.log('');
    }

    console.log('==============================================');
    console.log('TOOL SELECTION TEST SUMMARY');
    console.log('==============================================');
    console.log(`Tests passed: ${passed}/${total}`);

    if (passed === total) {
        console.log('ðŸŽ‰ All tool selection tests passed!');
        console.log('âœ?Tool selection logic has been successfully fixed!');
    } else {
        console.log('âš ï¸  Some tests failed. Tool selection still needs work.');
    }

    return passed === total;
}

// Run tests if called directly
if (require.main === module) {
    testToolSelectionIntegration().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testToolSelectionIntegration };
