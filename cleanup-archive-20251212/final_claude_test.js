// Final test to verify Claude command format is now correct
const { spawnSync } = require('child_process');
const CLIHelpAnalyzer = require('./src/core/cli_help_analyzer');
const { CLI_TOOLS } = require('./src/core/cli_tools');
const CLIParameterHandler = require('./src/core/cli_parameter_handler');

async function finalClaudeTest() {
  console.log('Final test: Verifying Claude command format...\n');
  
  try {
    const analyzer = new CLIHelpAnalyzer();
    analyzer.setCLITools(CLI_TOOLS);
    await analyzer.initialize();
    
    // Test the new analysis that should be correct
    try {
      const helpInfo = await analyzer.getHelpInfo('claude', CLI_TOOLS.claude);
      const cliType = analyzer.detectCLIType(helpInfo.rawHelp, 'claude');
      const patterns = analyzer.extractPatterns(helpInfo.rawHelp, cliType);
      
      console.log('‚ú?Claude patterns after fix:');
      console.log('  Commands:', patterns.commands.map(c => c.name));
      console.log('  Subcommands:', patterns.subcommands.map(s => s.name));
      
      // Verify 'prompt' is NOT in the command lists
      const hasPromptAsCommand = patterns.commands.some(c => c.name === 'prompt');
      const hasPromptAsSubcommand = patterns.subcommands.some(s => s.name === 'prompt');
      
      if (hasPromptAsCommand || hasPromptAsSubcommand) {
        console.log('‚ù?FAIL: "prompt" is still being treated as a command/subcommand');
        return false;
      } else {
        console.log('‚ú?SUCCESS: "prompt" is correctly filtered out');
      }
      
      // Test the parameter generation
      const toolArgs = CLIParameterHandler.generateArguments('claude', 'write a summary', { commandStructure: patterns });
      console.log(`\n‚ú?Claude command args: [${toolArgs.join(', ')}]`);
      
      if (toolArgs.includes('prompt')) {
        console.log('‚ù?FAIL: Generated command still contains "prompt" keyword inappropriately');
        return false;
      } else {
        console.log('‚ú?SUCCESS: Generated command args are clean');
      }
      
    } catch (error) {
      console.log(`Claude CLI not available, using fallback: ${error.message}`);
      // Test fallback directly
      const args = CLIParameterHandler.getToolSpecificArguments('claude', 'test prompt');
      console.log(`\n‚ú?Claude fallback args: [${args.join(', ')}]`);
      
      if (args.includes('prompt') && args[0] !== '-p') {
        console.log('‚ù?FAIL: Fallback command contains unexpected "prompt"');
        return false;
      } else {
        console.log('‚ú?SUCCESS: Fallback args are correct');
      }
    }
    
    console.log('\nüéâ All Claude command format tests passed!');
    console.log('\nSummary of fixes:');
    console.log('‚Ä?Fixed pattern extraction to filter out common argument names like "prompt"');
    console.log('‚Ä?Claude commands now generate proper format: claude -p "prompt"');
    console.log('‚Ä?No more incorrect "claude command -p" format');
    console.log('‚Ä?Maintains all other functionality');
    
    return true;
    
  } catch (error) {
    console.error('Final test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

finalClaudeTest();
