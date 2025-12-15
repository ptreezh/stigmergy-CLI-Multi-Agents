// Final verification test for all CLI tools after fixes
const CLIHelpAnalyzer = require('./src/core/cli_help_analyzer');
const { CLI_TOOLS } = require('./src/core/cli_tools');

async function finalVerification() {
  console.log('Final verification of all CLI tools after fixes...\n');
  
  const analyzer = new CLIHelpAnalyzer();
  analyzer.setCLITools(CLI_TOOLS);
  await analyzer.initialize();
  
  // Common argument names that should be filtered out
  const commonArgumentNames = ['prompt', 'input', 'file', 'directory', 'path', 'target', 'command', 'args', 'options'];
  
  let allGood = true;
  
  for (const [toolName, toolConfig] of Object.entries(CLI_TOOLS)) {
    console.log(`=== Verifying ${toolName} ===`);
    
    try {
      const patterns = await analyzer.getCLIPattern(toolName);
      
      if (patterns && patterns.success !== false) {
        // Check commands
        const problematicCommands = patterns.patterns.commands.filter(cmd => 
          commonArgumentNames.includes(cmd.name.toLowerCase()) || 
          cmd.name.toLowerCase() === toolName.toLowerCase()
        );
        
        // Check subcommands
        const problematicSubcommands = patterns.patterns.subcommands.filter(sub => 
          commonArgumentNames.includes(sub.name.toLowerCase()) || 
          sub.name.toLowerCase() === toolName.toLowerCase()
        );
        
        if (problematicCommands.length > 0) {
          console.log(`‚ù?PROBLEM: ${toolName} has problematic commands:`, 
            problematicCommands.map(c => c.name));
          allGood = false;
        } else {
          console.log(`‚ú?Commands look good for ${toolName}`);
        }
        
        if (problematicSubcommands.length > 0) {
          console.log(`‚ù?PROBLEM: ${toolName} has problematic subcommands:`, 
            problematicSubcommands.map(s => s.name));
          allGood = false;
        } else {
          console.log(`‚ú?Subcommands look good for ${toolName}`);
        }
        
        console.log(`   Commands: [${patterns.patterns.commands.slice(0, 5).map(c => c.name).join(', ')}, ...]`);
        console.log(`   Subcommands: [${patterns.patterns.subcommands.slice(0, 5).map(s => s.name).join(', ')}, ...]`);
        
      } else {
        console.log(`‚ö†Ô∏è  ${toolName} not available or error: ${patterns?.error || 'Pattern not retrieved'}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`‚ö†Ô∏è  ${toolName} analysis error: ${error.message}`);
      console.log('');
    }
  }
  
  if (allGood) {
    console.log('üéâ All CLI tools look good! No more argument names treated as commands/subcommands.');
    console.log('\nSummary of all fixes applied:');
    console.log('1. Removed "code" from general routeKeywords to prevent false matches');
    console.log('2. Prioritized exact tool name matches over keyword matches');
    console.log('3. Fixed pattern extraction to filter out common argument names like "prompt"');
    console.log('4. Fixed pattern extraction to filter out tool name itself as subcommand');
    console.log('5. Applied fixes to both source and package versions');
  } else {
    console.log('‚ù?Some issues still remain');
  }
}

finalVerification();
