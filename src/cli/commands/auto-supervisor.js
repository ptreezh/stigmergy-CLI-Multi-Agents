#!/usr/bin/env node
/**
 * AutoSupervisor CLI - 自动监督系统命令行接口
 *
 * stigmergy auto-supervisor start    启动监督系统
 * stigmergy auto-supervisor stop     停止监督系统
 * stigmergy auto-supervisor status   查看状态
 * stigmergy auto-supervisor check    立即检查一次
 */

const chalk = require("chalk");
const path = require("path");

let supervisorInstance = null;

function getSupervisor() {
  if (!supervisorInstance) {
    const AutoSupervisor = require("../../core/auto_supervisor");
    supervisorInstance = new AutoSupervisor({
      checkIntervalMs: 10 * 60 * 1000, // 10分钟
      idleThresholdMs: 5 * 60 * 1000, // 5分钟
    });
  }
  return supervisorInstance;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "status";

  switch (command) {
    case "start":
      cmdStart();
      break;
    case "stop":
      cmdStop();
      break;
    case "status":
      cmdStatus();
      break;
    case "check":
      await cmdCheck();
      break;
    case "help":
    case "-h":
    case "--help":
      showHelp();
      break;
    default:
      console.log(chalk.red(`未知命令: ${command}`));
      showHelp();
      process.exit(1);
  }
}

function cmdStart() {
  const supervisor = getSupervisor();
  supervisor.start();
  console.log(chalk.green("\n✅ AutoSupervisor 已启动"));
  console.log(chalk.gray("   每10分钟检查CLI空闲状态"));
  console.log(chalk.gray("   空闲CLI将自动触发进化任务\n"));
}

function cmdStop() {
  const supervisor = getSupervisor();
  supervisor.stop();
  console.log(chalk.green("\n✅ AutoSupervisor 已停止\n"));
}

function cmdStatus() {
  const supervisor = getSupervisor();
  const status = supervisor.getStatus();

  console.log(chalk.blue("\n📊 AutoSupervisor 状态\n"));
  console.log(
    `运行状态: ${status.isRunning ? chalk.green("运行中") : chalk.red("已停止")}`,
  );
  console.log(`检查间隔: ${status.checkIntervalMs / 1000 / 60} 分钟`);
  console.log(`空闲阈值: ${status.idleThresholdMs / 1000 / 60} 分钟`);
  console.log(`历史记录: ${status.historyCount} 条\n`);
}

async function cmdCheck() {
  const supervisor = getSupervisor();
  console.log(chalk.blue("\n🔍 立即检查CLI状态...\n"));

  try {
    await supervisor.checkAllCLIs();
    console.log(chalk.green("\n✅ 检查完成\n"));
  } catch (error) {
    console.error(chalk.red(`\n❌ 检查失败: ${error.message}\n`));
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
${chalk.blue("Stigmergy AutoSupervisor - CLI自动监督与进化系统")}

${chalk.yellow("用法:")}
  stigmergy auto-supervisor <命令>

${chalk.yellow("命令:")}
  start              启动监督系统
  stop               停止监督系统
  status             查看运行状态
  check              立即检查一次CLI状态
  help               显示帮助

${chalk.yellow("示例:")}
  # 启动自动监督
  stigmergy auto-supervisor start

  # 查看状态
  stigmergy auto-supervisor status

  # 立即检查
  stigmergy auto-supervisor check
`);
}

main();
