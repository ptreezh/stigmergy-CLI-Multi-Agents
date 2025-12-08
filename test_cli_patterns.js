const CLIHelpAnalyzer = require('./src/core/cli_help_analyzer');

async function testCLIPatterns() {
    const analyzer = new CLIHelpAnalyzer();
    await analyzer.initialize();
    
    // Test Claude CLI patterns
    try {
        console.log('Analyzing Claude CLI...');
        const claudePatterns = await analyzer.getCLIPattern('claude');
        console.log('Claude CLI Patterns:', JSON.stringify(claudePatterns, null, 2));
    } catch (error) {
        console.error('Error analyzing Claude CLI:', error.message);
    }
    
    // Test Gemini CLI patterns
    try {
        console.log('\nAnalyzing Gemini CLI...');
        const geminiPatterns = await analyzer.getCLIPattern('gemini');
        console.log('Gemini CLI Patterns:', JSON.stringify(geminiPatterns, null, 2));
    } catch (error) {
        console.error('Error analyzing Gemini CLI:', error.message);
    }
    
    // Test Qwen CLI patterns
    try {
        console.log('\nAnalyzing Qwen CLI...');
        const qwenPatterns = await analyzer.getCLIPattern('qwen');
        console.log('Qwen CLI Patterns:', JSON.stringify(qwenPatterns, null, 2));
    } catch (error) {
        console.error('Error analyzing Qwen CLI:', error.message);
    }
}

testCLIPatterns().catch(console.error);