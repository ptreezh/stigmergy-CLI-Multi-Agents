// Check all CLI tools for similar pattern extraction issues
const CLIHelpAnalyzer = require('./src/core/cli_help_analyzer');
const { CLI_TOOLS } = require('./src/core/cli_tools');

async function checkAllCLITools() {
  console.log('Checking all CLI tools for pattern extraction issues...\n');
  
  const analyzer = new CLIHelpAnalyzer();
  analyzer.setCLITools(CLI_TOOLS);
  await analyzer.initialize();
  
  // Common argument names that should be filtered out
  const commonArgumentNames = ['prompt', 'input', 'file', 'directory', 'path', 'target', 'command', 'args', 'options'];
  
  for (const [toolName, toolConfig] of Object.entries(CLI_TOOLS)) {
    console.log(`=== Checking ${toolName} ===`);
    
    try {
      // Get help info for the tool
      const helpInfo = await analyzer.getHelpInfo(toolName, toolConfig);
      const cliType = analyzer.detectCLIType(helpInfo.rawHelp, toolName);
      const patterns = analyzer.extractPatterns(helpInfo.rawHelp, cliType);
      
      console.log(`${toolName} help text analyzed. CLI type: ${cliType}`);
      
      // Check if any common argument names are being treated as commands
      const problematicCommands = patterns.commands.filter(cmd => 
        commonArgumentNames.includes(cmd.name.toLowerCase())
      );
      
      // Check if any common argument names are being treated as subcommands
      const problematicSubcommands = patterns.subcommands.filter(sub => 
        commonArgumentNames.includes(sub.name.toLowerCase())
      );
      
      if (problematicCommands.length > 0) {
        console.log(`‚ù?PROBLEM: ${toolName} has these argument names as commands:`, 
          problematicCommands.map(c => c.name));
      } else {
        console.log(`‚ú?OK: No argument names treated as commands for ${toolName}`);
      }
      
      if (problematicSubcommands.length > 0) {
        console.log(`‚ù?PROBLEM: ${toolName} has these argument names as subcommands:`, 
          problematicSubcommands.map(s => s.name));
      } else {
        console.log(`‚ú?OK: No argument names treated as subcommands for ${toolName}`);
      }
      
      // Show first few commands and subcommands for context
      console.log(`Commands: [${patterns.commands.slice(0, 5).map(c => c.name).join(', ')}, ...]`);
      console.log(`Subcommands: [${patterns.subcommands.slice(0, 5).map(s => s.name).join(', ')}, ...]`);
      console.log('');
      
    } catch (error) {
      console.log(`‚ö†Ô∏è  ${toolName} not available or error: ${error.message}`);
      console.log('');
    }
  }
}

checkAllCLITools();
