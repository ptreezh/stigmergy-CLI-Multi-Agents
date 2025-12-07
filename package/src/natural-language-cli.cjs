#!/usr/bin/env node

/**
 * Natural Language CLI Interface
 * Demonstrates natural language skill calling in CLI tools
 */

const NaturalLanguageIntegration = require('./natural-language/nl-integration.cjs');

class NaturalLanguageCLI {
    constructor() {
        this.integration = new NaturalLanguageIntegration();
    }

    /**
     * Process natural language command
     * @param {Array} args - Command line arguments
     * @param {string} aiTool - AI tool name
     */
    async processCommand(args, aiTool = 'claude') {
        const input = args.join(' ');

        if (!input.trim()) {
            this.showUsage(aiTool);
            return;
        }

        console.log(`🤖 ${aiTool} with Natural Language Skills`);
        console.log(`Input: "${input}"`);
        console.log('');

        // Check if this looks like a skill request
        if (this.integration.shouldProcessAsSkill(input)) {
            console.log('🎯 Skill pattern detected! Processing with Stigmergy Skills...');
            console.log('');

            const result = await this.integration.processNaturalLanguageInput(input, aiTool);

            if (result.success) {
                console.log('✅ Skill execution successful!');
                console.log(`📋 Skill: ${result.skill}`);
                console.log(`📊 Confidence: ${result.confidence}/10`);
                console.log(`🔧 Parameters:`, JSON.stringify(result.parameters, null, 2));
                console.log(`🛠️  Tool: ${result.execution.tool || aiTool}`);
                console.log(`📤 Command: ${result.execution.command}`);
                console.log(`📋 Output: ${result.execution.output}`);
            } else {
                console.log(`❌ Skill processing failed: ${result.error || result.message}`);
                if (result.suggestion) {
                    console.log(`💡 Suggestion: ${result.suggestion}`);
                }
            }
        } else {
            console.log('ℹ️  No skill pattern detected. This would be processed normally by the AI tool.');
            console.log('💡 Try using keywords like: translate, analyze, generate, document');
        }
    }

    /**
     * Show usage examples
     * @param {string} aiTool - AI tool name
     */
    showUsage(aiTool) {
        const examples = this.integration.generateUsageExamples(aiTool);

        console.log(`🎯 Natural Language Skills Usage for ${aiTool}`);
        console.log('');
        console.log('📝 Examples:');
        examples.forEach((example, index) => {
            console.log(`   ${index + 1}. ${example}`);
        });

        console.log('');
        console.log('🔧 How it works:');
        console.log('   1. Speak naturally in Chinese or English');
        console.log('   2. The system detects skill patterns');
        console.log('   3. Extracts parameters automatically');
        console.log('   4. Executes with optimal AI tool');

        console.log('');
        console.log('📊 Supported skills:');
        console.log('   • Translation - 文本翻译');
        console.log('   • Code Analysis - 代码分析');
        console.log('   • Code Generation - 代码生成');
        console.log('   • Documentation - 文档生成');
    }

    /**
     * Interactive mode for testing
     */
    async interactiveMode(aiTool = 'claude') {
        console.log(`🤖 Natural Language Skills Interactive Mode (${aiTool})`);
        console.log('Type "exit" to quit, "help" for examples');
        console.log('');

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askQuestion = (query) => {
            return new Promise(resolve => rl.question(query, resolve));
        };

        while (true) {
            try {
                const input = await askQuestion(`${aiTool}> `);

                if (input.toLowerCase() === 'exit') {
                    break;
                }

                if (input.toLowerCase() === 'help') {
                    this.showUsage(aiTool);
                    console.log('');
                    continue;
                }

                if (!input.trim()) {
                    continue;
                }

                console.log('');
                await this.processCommand(input.split(' '), aiTool);
                console.log('');

            } catch (error) {
                console.error('❌ Error:', error.message);
                console.log('');
            }
        }

        rl.close();
        console.log('👋 Goodbye!');
    }
}

// CLI entry point
if (require.main === module) {
    const args = process.argv.slice(2);
    const cli = new NaturalLanguageCLI();

    // Check for interactive mode
    if (args.includes('--interactive') || args.includes('-i')) {
        const aiTool = args.find(arg => arg.startsWith('--tool='))?.split('=')[1] || 'claude';
        cli.interactiveMode(aiTool);
        return;
    }

    // Check for help
    if (args.includes('--help') || args.includes('-h')) {
        const aiTool = args.find(arg => arg.startsWith('--tool='))?.split('=')[1] || 'claude';
        cli.showUsage(aiTool);
        return;
    }

    // Extract AI tool if specified
    let aiTool = 'claude';
    const toolIndex = args.findIndex(arg => arg.startsWith('--tool='));
    if (toolIndex !== -1) {
        aiTool = args[toolIndex].split('=')[1];
        args.splice(toolIndex, 1);
    }

    // Process command
    cli.processCommand(args, aiTool);
}

module.exports = NaturalLanguageCLI;