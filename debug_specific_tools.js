// Debug iFlow and qodercli subcommand extraction specifically
const CLIHelpAnalyzer = require('./src/core/cli_help_analyzer');
const { CLI_TOOLS } = require('./src/core/cli_tools');

async function debugSpecificTools() {
  console.log('Debugging iFlow and qodercli subcommand extraction...\n');
  
  const analyzer = new CLIHelpAnalyzer();
  analyzer.setCLITools(CLI_TOOLS);
  await analyzer.initialize();
  
  const toolsToDebug = ['iflow', 'qodercli'];
  
  for (const toolName of toolsToDebug) {
    console.log(`=== Debugging ${toolName} ===`);
    
    try {
      // Get help info
      const helpInfo = await analyzer.getHelpInfo(toolName, CLI_TOOLS[toolName]);
      console.log(`${toolName} help text preview:\n${helpInfo.rawHelp.substring(0, 500)}...\n`);
      
      // Apply the same analysis as extractPatterns
      const cliType = analyzer.detectCLIType(helpInfo.rawHelp, toolName);
      const rules = analyzer.patternRules[cliType] || analyzer.patternRules.generic;
      
      console.log(`${toolName} CLI type: ${cliType}`);
      console.log(`Pattern: ${rules.subcommandPattern}`);
      
      const subcommandMatches = helpInfo.rawHelp.match(rules.subcommandPattern);
      if (subcommandMatches) {
        console.log(`Raw matches:`);
        subcommandMatches.forEach((match, i) => {
          const parts = match.trim().split(/\s+/);
          const name = parts[0];
          console.log(`  ${i+1}. Match: "${match}" -> Name: "${name}" -> ToolName: "${toolName}" -> Same? ${name.toLowerCase() === toolName.toLowerCase()}`);
        });
        
        // Test the filtering
        const commonArgumentNames = ['prompt', 'input', 'file', 'directory', 'path', 'target', 'command', 'args', 'options'];
        const filteredSubcommands = subcommandMatches
          .map((match) => {
            const parts = match.trim().split(/\s+/);
            return {
              name: parts[0],
              description: parts.slice(1).join(' '),
              syntax: match.trim(),
            };
          })
          .filter(subcommand => {
            // Skip common argument names that are not actual commands
            if (commonArgumentNames.includes(subcommand.name.toLowerCase())) {
              console.log(`    Filtering out "${subcommand.name}" - common argument name`);
              return false;
            }
            // Skip if the subcommand name is the same as the current tool name
            if (toolName && subcommand.name.toLowerCase() === toolName.toLowerCase()) {
              console.log(`    Filtering out "${subcommand.name}" - same as tool name`);
              return false;
            }
            return true;
          });
        
        console.log(`Filtered subcommands:`, filteredSubcommands.map(s => s.name));
      }
      
    } catch (error) {
      console.log(`Error analyzing ${toolName}: ${error.message}`);
    }
    console.log('');
  }
}

debugSpecificTools();
