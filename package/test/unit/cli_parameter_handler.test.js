// Unit tests for CLI Parameter Handler
const CLIParameterHandler = require('../../src/core/cli_parameter_handler');

// Mock CLI pattern data for testing
const mockCLIPatterns = {
    claude: {
        commandStructure: {
            nonInteractiveSupport: true,
            promptFlag: '-p',
            nonInteractiveFlag: '--print',
            executionPattern: 'flag-based'
        }
    },
    codex: {
        commandStructure: {
            nonInteractiveSupport: true,
            promptFlag: '-p',
            nonInteractiveFlag: '--print',
            executionPattern: 'subcommand-based'
        }
    },
    iflow: {
        commandStructure: {
            nonInteractiveSupport: true,
            promptFlag: '-p',
            executionPattern: 'flag-based'
        }
    },
    generic: {
        commandStructure: {
            nonInteractiveSupport: false,
            executionPattern: 'interactive-default'
        }
    }
};

// Test cases
const testCases = [
    {
        name: 'Claude CLI with pattern data',
        toolName: 'claude',
        prompt: 'Write a function to add two numbers',
        cliPattern: mockCLIPatterns.claude,
        expected: ['-p', '"Write a function to add two numbers"']
    },
    {
        name: 'Codex CLI with subcommand pattern',
        toolName: 'codex',
        prompt: 'Generate a Fibonacci function',
        cliPattern: mockCLIPatterns.codex,
        expected: ['exec', '-p', '"Generate a Fibonacci function"']
    },
    {
        name: 'iFlow CLI with pattern data',
        toolName: 'iflow',
        prompt: 'Check if number is even',
        cliPattern: mockCLIPatterns.iflow,
        expected: ['-p', '"Check if number is even"']
    },
    {
        name: 'Generic CLI without pattern data',
        toolName: 'generic',
        prompt: 'Generic prompt',
        cliPattern: mockCLIPatterns.generic,
        expected: ['"Generic prompt"']
    },
    {
        name: 'Unknown CLI without pattern data',
        toolName: 'unknown',
        prompt: 'Unknown prompt',
        cliPattern: null,
        expected: ['"Unknown prompt"']
    }
];

// Run tests
console.log('Running CLI Parameter Handler Unit Tests...\n');

let passedTests = 0;
let totalTests = testCases.length;

for (const testCase of testCases) {
    try {
        const result = CLIParameterHandler.generateArguments(
            testCase.toolName,
            testCase.prompt,
            testCase.cliPattern
        );
        
        // Compare results
        const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
        
        console.log(`Test: ${testCase.name}`);
        console.log(`Expected: ${JSON.stringify(testCase.expected)}`);
        console.log(`Actual: ${JSON.stringify(result)}`);
        console.log(`Status: ${passed ? 'PASS' : 'FAIL'}\n`);
        
        if (passed) {
            passedTests++;
        }
    } catch (error) {
        console.log(`Test: ${testCase.name}`);
        console.log(`Error: ${error.message}`);
        console.log(`Status: FAIL\n`);
    }
}

console.log(`\nUnit Test Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
    console.log('All unit tests passed!');
    process.exit(0);
} else {
    console.log('Some unit tests failed!');
    process.exit(1);
}