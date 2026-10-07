const chalk = require("chalk");
const { AgentRegistry } = require("../../core/agent_registry");

async function handleScanCommand(options = {}) {
  try {
    console.log(chalk.blue(" Scanning for all AI agents..."));

    const registry = new AgentRegistry();
    const result = await registry.scanAll();

    const cliFound = result.cli.filter((tool) => tool.installed);
    const desktopFound = result.desktop.filter((tool) => tool.installed);
    const evolvedFound = result.evolved;

    if (cliFound.length > 0) {
      console.log(chalk.green(`\n Found ${cliFound.length} CLI tools:`));
      for (const tool of cliFound) {
        console.log(chalk.cyan(`   ${tool.name}`));
        console.log(chalk.gray(`     Version: ${tool.version || "unknown"}`));
        console.log(chalk.gray(`     Path: ${tool.path || "N/A"}`));
        if (options.verbose) {
          console.log(chalk.gray(`     Type: ${tool.type}`));
          console.log(chalk.gray(`     AutoInstall: ${tool.autoInstall}`));
          console.log(chalk.gray(`     Has state dir: ${tool.hasStateDir}`));
          if (tool.dependsOn && tool.dependsOn.length > 0) {
            console.log(chalk.gray(`     Depends on: ${tool.dependsOn.join(", ")}`));
          }
        }
      }
    } else {
      console.log(chalk.yellow("\n No CLI tools found"));
    }

    if (desktopFound.length > 0) {
      console.log(
        chalk.green(`\n Found ${desktopFound.length} desktop AI agents:`),
      );
      for (const tool of desktopFound) {
        console.log(chalk.magenta(`   ${tool.name}`));
        console.log(chalk.gray(`     Path: ${tool.path || "N/A"}`));
        if (options.verbose) {
          console.log(chalk.gray(`     Type: ${tool.type}`));
          console.log(chalk.gray(`     Description: ${tool.description || "N/A"}`));
          console.log(chalk.gray(`     Has state dir: ${tool.hasStateDir}`));
        }
      }
    } else {
      console.log(chalk.yellow("\n No desktop agents found"));
    }

    if (evolvedFound.length > 0) {
      console.log(
        chalk.green(`\n Found ${evolvedFound.length} evolved agents:`),
      );
      for (const tool of evolvedFound) {
        console.log(chalk.blue(`   ${tool.name}`));
        console.log(chalk.gray(`     Evolutions: ${tool.evolutionCount || 0}`));
        if (tool.lastEvolution) {
          console.log(
            chalk.gray(`     Last evolution: ${tool.lastEvolution.success ? "success" : "failed"}`),
          );
          if (!tool.lastEvolution.success && tool.lastEvolution.error) {
            console.log(chalk.gray(`     Error: ${tool.lastEvolution.error}`));
          }
        }
        if (options.verbose) {
          console.log(chalk.gray(`     Created: ${tool.createdAt || "N/A"}`));
          console.log(chalk.gray(`     Last update: ${tool.lastUpdate || "N/A"}`));
        }
      }
    } else {
      console.log(chalk.yellow("\n No evolved agents found"));
    }

    console.log("");
    console.log(chalk.blue(" Scan Summary:"));
    console.log(`  Total checked: ${result.total}`);
    console.log(`  CLI tools: ${result.cli.length}`);
    console.log(`  Desktop agents: ${result.desktop.length}`);
    console.log(`  Evolved agents: ${result.evolved.length}`);
    console.log(`  Session dirs: ${result.sessions.length}`);

    if (options.json) {
      console.log("");
      console.log(chalk.blue(" JSON Output:"));
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log(chalk.red(` Scan failed: ${error.message}`));
    process.exit(1);
  }
}

module.exports = {
  handleScanCommand,
};
