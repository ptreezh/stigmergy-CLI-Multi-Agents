// Test codebuddy specifically to see if our fix works
const CLIHelpAnalyzer = require('./src/core/cli_help_analyzer');
const { CLI_TOOLS } = require('./src/core/cli_tools');

async function testCodebuddyFix() {
  console.log('Testing if codebuddy "prompt" issue is fixed...\n');
  
  const analyzer = new CLIHelpAnalyzer();
  analyzer.setCLITools(CLI_TOOLS);
  await analyzer.initialize();
  
  try {
    const helpInfo = await analyzer.getHelpInfo('codebuddy', CLI_TOOLS.codebuddy);
    
    // Apply the extraction logic manually to see what happens
    const cliType = analyzer.detectCLIType(helpInfo.rawHelp, 'codebuddy');
    console.log(`Codebuddy CLI type: ${cliType}`);
    
    const rules = analyzer.patternRules[cliType] || analyzer.patternRules.generic;
    console.log(`Codebuddy subcommand pattern: ${rules.subcommandPattern}`);
    
    // Show relevant parts of help text
    const lines = helpInfo.rawHelp.split('\n');
    console.log('\nLines containing "prompt":');
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes('prompt')) {
        console.log(`  Line ${index}: ${line}`);
        // Check if it would match the subcommand pattern
        if (rules.subcommandPattern.test(line)) {
          console.log(`    -> Would match subcommand pattern`);
        }
      }
    });
    
    // Extract patterns as normal
    const patterns = analyzer.extractPatterns(helpInfo.rawHelp, cliType);
    
    console.log('\nExtracted patterns:');
    console.log('Commands:', patterns.commands.map(c => c.name));
    console.log('Subcommands:', patterns.subcommands.map(s => s.name));
    
    // Check specifically for 'prompt'
    const hasPromptCommand = patterns.commands.some(c => c.name === 'prompt');
    const hasPromptSubcommand = patterns.subcommands.some(s => s.name === 'prompt');
    
    if (hasPromptCommand || hasPromptSubcommand) {
      console.log('\n‚ù?PROBLEM: "prompt" still found as command or subcommand');
      if (hasPromptCommand) console.log('  - Found as command');
      if (hasPromptSubcommand) console.log('  - Found as subcommand');
    } else {
      console.log('\n‚ú?SUCCESS: "prompt" correctly filtered out');
    }
    
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

testCodebuddyFix();
