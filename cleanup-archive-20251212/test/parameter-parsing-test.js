#!/usr/bin/env node

/**
 * TDD Test for Parameter Parsing Function
 * Tests that will drive the implementation of proper parameter parsing
 */

const assert = require('assert');

/**
 * Parse command line arguments into parameters and tool selection
 * @param {string[]} args - Array of command line arguments
 * @returns {Object} - { parameters: {}, tool: string|null }
 */
function parseArguments(args) {
    const parameters = {};
    let tool = null;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg.startsWith('--')) {
            if (arg.includes('=')) {
                // Format: --key=value
                const [key, value] = arg.substring(2).split('=', 2);
                if (key === 'tool') {
                    tool = value;
                } else {
                    parameters[key] = value;
                }
            } else {
                // Format: --key value
                const key = arg.substring(2);
                if (key === 'tool') {
                    tool = args[i + 1];
                    i++; // Skip next argument as it's the value
                } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                    parameters[key] = args[i + 1];
                    i++; // Skip next argument as it's the value
                } else {
                    parameters[key] = true;
                }
            }
        }
    }

    return { parameters, tool };
}

function testParameterParsing() {
    console.log('TEST: Parameter Parsing Function');
    console.log('--------------------------------');

    const testCases = [
        {
            name: 'Key=value format with tool',
            args: ['--text=hello', '--to=zh', '--tool=claude'],
            expected: {
                parameters: { text: 'hello', to: 'zh' },
                tool: 'claude'
            }
        },
        {
            name: 'Space-separated format with tool',
            args: ['--text', 'hello', '--to', 'zh', '--tool', 'gemini'],
            expected: {
                parameters: { text: 'hello', to: 'zh' },
                tool: 'gemini'
            }
        },
        {
            name: 'Mixed format',
            args: ['--text=hello', '--to', 'zh', '--file=app.js', '--tool=qwen'],
            expected: {
                parameters: { text: 'hello', to: 'zh', file: 'app.js' },
                tool: 'qwen'
            }
        },
        {
            name: 'No tool specified',
            args: ['--text=hello', '--to=zh'],
            expected: {
                parameters: { text: 'hello', to: 'zh' },
                tool: null
            }
        },
        {
            name: 'Boolean flags',
            args: ['--verbose', '--debug=true', '--tool=claude'],
            expected: {
                parameters: { verbose: true, debug: 'true' },
                tool: 'claude'
            }
        }
    ];

    let passed = 0;
    let total = testCases.length;

    for (const testCase of testCases) {
        console.log(`\nTesting: ${testCase.name}`);
        console.log(`Input: ${JSON.stringify(testCase.args)}`);

        try {
            const result = parseArguments(testCase.args);

            // Deep comparison of results
            const paramsMatch = JSON.stringify(result.parameters) === JSON.stringify(testCase.expected.parameters);
            const toolMatch = result.tool === testCase.expected.tool;

            if (paramsMatch && toolMatch) {
                console.log(`âœ?PASSED`);
                console.log(`   Parameters: ${JSON.stringify(result.parameters)}`);
                console.log(`   Tool: ${result.tool}`);
                passed++;
            } else {
                console.log(`â?FAILED`);
                console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
                console.log(`   Got: ${JSON.stringify(result)}`);

                if (!paramsMatch) {
                    console.log(`   Parameters mismatch`);
                }
                if (!toolMatch) {
                    console.log(`   Tool mismatch`);
                }
            }
        } catch (error) {
            console.log(`â?ERROR: ${error.message}`);
        }
    }

    console.log(`\nParameter Parsing Tests: ${passed}/${total} passed`);
    return passed === total;
}

// Run tests if called directly
if (require.main === module) {
    const success = testParameterParsing();
    process.exit(success ? 0 : 1);
}

module.exports = { parseArguments, testParameterParsing };
