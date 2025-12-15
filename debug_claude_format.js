// Debug Claude command format issue
const { spawnSync } = require('child_process');
const CLIHelpAnalyzer = require('./src/core/cli_help_analyzer');
const { CLI_TOOLS } = require('./src/core/cli_tools');

async function debugClaudeCommandFormat() {
  console.log('Debugging Claude command format issue...\n');
  
  try {
    const analyzer = new CLIHelpAnalyzer();
    analyzer.setCLITools(CLI_TOOLS);
    await analyzer.initialize();
    
    // Try to get help info for Claude
    try {
      const helpInfo = await analyzer.getHelpInfo('claude', CLI_TOOLS.claude);
      console.log('Claude help text:');
      console.log(helpInfo.rawHelp.substring(0, 1000) + '...'); // First 1000 chars
      
      // Extract patterns
      const cliType = analyzer.detectCLIType(helpInfo.rawHelp, 'claude');
      console.log(`\nDetected CLI type: ${cliType}`);
      
      const patterns = analyzer.extractPatterns(helpInfo.rawHelp, cliType);
      console.log('\nExtracted patterns:');
      console.log('Commands:', patterns.commands);
      console.log('Subcommands:', patterns.subcommands);
      console.log('Options:', patterns.options);
      
      // Analyze command structure
      const commandStructure = analyzer.analyzeCommandStructure(patterns);
      console.log('\nCommand structure:', commandStructure);
      
    } catch (error) {
      console.log(`Claude CLI not available: ${error.message}`);
      console.log('Using fallback patterns...\n');
      
      // Test with CLI parameter handler fallback
      const CLIParameterHandler = require('./src/core/cli_parameter_handler');
      const args = CLIParameterHandler.getToolSpecificArguments('claude', 'test prompt');
      console.log('Fallback arguments for Claude:', args);
    }
    
    // Test the parameter handler directly
    console.log('\nTesting parameter handler with mock pattern:');
    const CLIParameterHandler = require('./src/core/cli_parameter_handler');
    
    // Test with null pattern (should use fallback)
    const args1 = CLIParameterHandler.generateArguments('claude', 'test prompt', null);
    console.log('With null pattern:', args1);
    
    // Test with pattern that has no command structure
    const mockPattern = { commandStructure: {} };
    const args2 = CLIParameterHandler.generateArguments('claude', 'test prompt', mockPattern);
    console.log('With empty command structure:', args2);
    
    // Test with pattern that has nonInteractiveSupport
    const mockPattern2 = { 
      commandStructure: { 
        nonInteractiveSupport: true,
        promptFlag: '-p'
      } 
    };
    const args3 = CLIParameterHandler.generateArguments('claude', 'test prompt', mockPattern2);
    console.log('With nonInteractiveSupport:', args3);
    
  } catch (error) {
    console.error('Debug failed:', error.message);
    console.error(error.stack);
  }
}

debugClaudeCommandFormat();
