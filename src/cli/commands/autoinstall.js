const chalk = require("chalk");
const { handleInstallCommand } = require("./install.js");
const { handleDeployCommand } = require("./project.js");
const BuiltinSkillsDeployer = require("../../core/skills/BuiltinSkillsDeployer.js");

async function handleAutoInstallCommand(options) {
  console.log(chalk.blue("🚀 Stigmergy Auto-Installation"));
  console.log(chalk.gray("=====================================\n"));

  // Step 1: Install CLI tools
  console.log(chalk.blue("📦 Step 1/3: Installing CLI tools..."));

  try {
    await handleInstallCommand({
      nonInteractive: true, // 自动安装 autoInstall: true 的工具
      verbose: options.verbose || process.env.DEBUG === "true",
      force: options.force || false,
    });
  } catch (error) {
    console.error(chalk.red("✗ CLI tools installation failed:"), error.message);
    // Continue with next step even if CLI tools installation fails
  }

  // Step 2: Deploy hooks and ResumeSession
  console.log(
    chalk.blue(
      "\n🚀 Step 2/3: Deploying hooks and ResumeSession integration...",
    ),
  );

  try {
    const deployResult = await handleDeployCommand({
      verbose: options.verbose || process.env.DEBUG === "true",
      force: options.force || false,
    });

    if (deployResult.success) {
      console.log(chalk.green("✓ Hooks deployed successfully"));
    } else {
      console.warn(chalk.yellow("⚠ Hooks deployment completed with warnings"));
    }
  } catch (error) {
    console.error(chalk.red("✗ Hooks deployment failed:"), error.message);
    // Continue with next step even if hooks deployment fails
  }

  // Step 3: Deploy built-in skills
  console.log(chalk.blue("\n🚀 Step 3/3: Deploying built-in skills..."));

  try {
    const skillsDeployer = new BuiltinSkillsDeployer();
    const skillsResult = await skillsDeployer.deployAll();

    if (skillsResult.success) {
      console.log(chalk.green("✓ Built-in skills deployed successfully"));
    } else {
      console.warn(
        chalk.yellow("⚠ Built-in skills deployment completed with warnings"),
      );
    }
  } catch (error) {
    console.error(
      chalk.red("✗ Built-in skills deployment failed:"),
      error.message,
    );
    // Continue even if skills deployment fails
  }

  console.log(chalk.green("\n🎉 Auto-installation completed successfully!"));
  console.log(chalk.cyan("\nNext steps:"));
  console.log("  • Run: stigmergy --help");
  console.log('  • Try: stigmergy claude "Hello World"');
  console.log("  • Check: stigmergy status");
  console.log("  • Resume sessions: stigmergy resume --limit 10");
}

module.exports = {
  handleAutoInstallCommand,
};
