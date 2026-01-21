// Detailed inspection of problematic CLI tools
const CLIHelpAnalyzer = require('./src/core/cli_help_analyzer');
const { CLI_TOOLS } = require('./src/core/cli_tools');

async function detailedInspection() {
  console.log('Detailed inspection of potentially problematic CLI tools...\n');
  
  const analyzer = new CLIHelpAnalyzer();
  analyzer.setCLITools(CLI_TOOLS);
  await analyzer.initialize();
  
  // Check each tool in detail
  const toolsToCheck = ['iflow', 'qodercli', 'copilot', 'codebuddy'];
  
  for (const toolName of toolsToCheck) {
    if (!CLI_TOOLS[toolName]) continue;
    
    console.log(`\n=== Detailed Analysis: ${toolName} ===`);
    
    try {
      const helpInfo = await analyzer.getHelpInfo(toolName, CLI_TOOLS[toolName]);
      console.log(`Help text preview:\n${helpInfo.rawHelp.substring(0, 800)}...\n`);
      
      // Show the raw matches from pattern rules
      const cliType = analyzer.detectCLIType(helpInfo.rawHelp, toolName);
      console.log(`Detected CLI type: ${cliType}`);
      
      // Apply the rules to see what gets extracted
      const rules = analyzer.patternRules[cliType] || analyzer.patternRules.generic;
      const subcommandMatches = helpInfo.rawHelp.match(rules.subcommandPattern);
      const optionMatches = helpInfo.rawHelp.match(rules.optionPattern);
      
      console.log(`Subcommand pattern: ${rules.subcommandPattern}`);
      if (subcommandMatches) {
        console.log(`Raw subcommand matches (first 5):`, subcommandMatches.slice(0, 5));
      } else {
        console.log('No subcommand matches found');
      }
      
      console.log(`Option pattern: ${rules.optionPattern}`);
      if (optionMatches) {
        console.log(`First few option matches:`, optionMatches.slice(0, 10));
      } else {
        console.log('No option matches found');
      }
      
      // Extract patterns with current logic
      const patterns = analyzer.extractPatterns(helpInfo.rawHelp, cliType);
      
      console.log(`Extracted commands (first 10):`, patterns.commands.slice(0, 10).map(c => ({name: c.name, syntax: c.syntax})));
      console.log(`Extracted subcommands (first 10):`, patterns.subcommands.slice(0, 10).map(s => ({name: s.name, syntax: s.syntax})));
      
    } catch (error) {
      console.log(`‚ù?Error analyzing ${toolName}: ${error.message}`);
    }
  }
}

detailedInspection();
