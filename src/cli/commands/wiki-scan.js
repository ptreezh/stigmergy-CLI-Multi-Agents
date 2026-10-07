const chalk = require("chalk");
const StigmergyWiki = require("../../../wiki/orchestrator");

async function handleWikiScanCommand(options = {}) {
  try {
    console.log(chalk.blue("🧠 Ontology-based wiki scan..."));
    
    const wiki = new StigmergyWiki();
    const ontology = await wiki.run();
    
    console.log(chalk.green("\n✅ Wiki scan complete"));
    console.log(chalk.gray(`   Ontology written to: wiki/latest.json`));
    console.log(chalk.gray(`   State saved to: wiki/state.json`));
    
    if (options.json) {
      console.log("\n" + chalk.blue("JSON Output:"));
      console.log(JSON.stringify(ontology, null, 2));
    }
  } catch (error) {
    console.log(chalk.red(`❌ Wiki scan failed: ${error.message}`));
    if (options.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

module.exports = {
  handleWikiScanCommand,
};
