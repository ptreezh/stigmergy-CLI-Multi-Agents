#!/usr/bin/env node
/**
 * Stigmergy Scheduler CLI
 * 定时任务管理命令
 */

const chalk = require("chalk");
const path = require("path");

// Determine project root directory
const getProjectRoot = () => {
  let dir = process.cwd();
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
};

const fs = require("fs");

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "list";
  const options = parseOptions(args);
  const projectRoot = getProjectRoot();

  try {
    const schedulerPath = path.join(
      projectRoot,
      "src",
      "core",
      "scheduler",
      "cron_scheduler",
    );
    const CronScheduler = require(schedulerPath);
    const scheduler = new CronScheduler({
      dataDir: path.join(projectRoot, ".stigmergy", "scheduler"),
    });

    switch (command) {
      case "list":
      case "ls":
        await cmdList(scheduler, options);
        break;
      case "add":
      case "create":
      case "new":
        await cmdAdd(scheduler, options);
        break;
      case "get":
        await cmdGet(scheduler, options);
        break;
      case "update":
      case "edit":
        await cmdUpdate(scheduler, options);
        break;
      case "delete":
      case "remove":
      case "rm":
        await cmdDelete(scheduler, options);
        break;
      case "toggle":
        await cmdToggle(scheduler, options);
        break;
      case "run":
      case "exec":
        await cmdRun(scheduler, options);
        break;
      case "history":
        await cmdHistory(scheduler, options);
        break;
      case "status":
        await cmdStatus(scheduler, options);
        break;
      case "start":
        scheduler.start();
        console.log(chalk.green("✅ 调度器已启动"));
        break;
      case "stop":
        scheduler.stop();
        console.log(chalk.green("✅ 调度器已停止"));
        break;
      case "help":
      case "--help":
      case "-h":
        showHelp();
        break;
      default:
        console.log(chalk.red(`未知命令: ${command}`));
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`错误: ${error.message}`));
    process.exit(1);
  }
}

function parseOptions(args) {
  const options = {};
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const keyValue = arg.slice(2).split("=");
      if (keyValue.length === 2) {
        options[keyValue[0]] = keyValue[1];
      } else {
        const nextArg = args[i + 1];
        if (nextArg && !nextArg.startsWith("-")) {
          options[keyValue[0]] = nextArg;
          i++;
        } else {
          options[keyValue[0]] = true;
        }
      }
    } else if (arg.startsWith("-") && arg.length > 1) {
      const key = arg.slice(1);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith("-")) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    }
    i++;
  }
  return options;
}

async function cmdList(scheduler, options) {
  const tasks = scheduler.getAllTasks();
  console.log(chalk.blue("\n📋 定时任务列表\n"));
  console.log(
    "ID                    名称                    类型      Cron         状态    下次执行",
  );
  console.log("=".repeat(100));

  for (const task of tasks) {
    const status = task.enabled ? chalk.green("启用") : chalk.red("禁用");
    const nextRun = task.nextRun
      ? new Date(task.nextRun).toLocaleString()
      : "N/A";
    console.log(
      `${task.id.substring(0, 20).padEnd(20)} ${task.name.substring(0, 20).padEnd(20)} ${task.type.padEnd(8)} ${task.cron.padEnd(12)} ${status} ${nextRun}`,
    );
  }

  if (tasks.length === 0) {
    console.log(
      chalk.yellow("\n暂无任务，使用 'stigmergy scheduler add' 创建任务"),
    );
  }
  console.log("");
}

async function cmdAdd(scheduler, options) {
  console.log(chalk.blue("\n➕ 创建定时任务\n"));

  const task = scheduler.createTask({
    name: options.name || "定时任务",
    type: options.type || "cli",
    cron: options.cron,
    cli: options.cli,
    command: options.command || options.c,
    platform: options.platform || options.p,
    message: options.message || options.m,
    webhook: options.webhook,
    timeout: parseInt(options.timeout) || 300000,
    retry: parseInt(options.retry) || 0,
    description: options.description || options.d || "",
  });

  console.log(chalk.green(`\n✅ 任务创建成功: ${task.id}`));
  console.log(`   名称: ${task.name}`);
  console.log(`   类型: ${task.type}`);
  console.log(`   Cron: ${task.cron}`);
  console.log(`   下次执行: ${new Date(task.nextRun).toLocaleString()}\n`);
}

async function cmdGet(scheduler, options) {
  const task = scheduler.getTask(options.id);
  if (!task) {
    console.log(chalk.red(`任务不存在: ${options.id}`));
    return;
  }

  console.log(chalk.blue(`\n📋 任务详情: ${task.name}\n`));
  console.log(`ID: ${task.id}`);
  console.log(`名称: ${task.name}`);
  console.log(`类型: ${task.type}`);
  console.log(`Cron: ${task.cron}`);
  console.log(`状态: ${task.enabled ? "启用" : "禁用"}`);
  console.log(`创建时间: ${task.createdAt}`);
  console.log(`上次执行: ${task.lastRun || "从未"}`);
  console.log(
    `下次执行: ${task.nextRun ? new Date(task.nextRun).toLocaleString() : "N/A"}`,
  );
  console.log(`执行次数: ${task.runCount}\n`);
}

async function cmdUpdate(scheduler, options) {
  if (!options.id) {
    console.log(chalk.red("请指定任务ID: --id <ID>"));
    return;
  }

  const updates = {};
  if (options.name) updates.name = options.name;
  if (options.cron) updates.cron = options.cron;
  if (options.command) updates.command = options.command;
  if (options.message) updates.message = options.message;
  if (options.enabled !== undefined)
    updates.enabled = options.enabled === "true";

  const task = scheduler.updateTask(options.id, updates);
  console.log(chalk.green(`\n✅ 任务已更新: ${task.id}`));
}

async function cmdDelete(scheduler, options) {
  if (!options.id) {
    console.log(chalk.red("请指定任务ID: --id <ID>"));
    return;
  }

  scheduler.deleteTask(options.id);
  console.log(chalk.green(`\n✅ 任务已删除: ${options.id}`));
}

async function cmdToggle(scheduler, options) {
  if (!options.id) {
    console.log(chalk.red("请指定任务ID: --id <ID>"));
    return;
  }

  const task = scheduler.toggleTask(options.id);
  console.log(
    chalk.green(
      `\n✅ 任务状态已切换: ${task.name} (${task.enabled ? "启用" : "禁用"})`,
    ),
  );
}

async function cmdRun(scheduler, options) {
  if (!options.id) {
    console.log(chalk.red("请指定任务ID: --id <ID>"));
    return;
  }

  console.log(chalk.blue(`\n🚀 立即执行任务: ${options.id}\n`));
  await scheduler.runTask(options.id);
  console.log(chalk.green("\n✅ 任务执行完成"));
}

async function cmdHistory(scheduler, options) {
  const history = scheduler.getTaskHistory(
    options.id,
    parseInt(options.limit) || 20,
  );
  console.log(chalk.blue("\n📜 任务执行历史\n"));

  for (const entry of history) {
    const status =
      entry.status === "success" ? chalk.green("✓") : chalk.red("✗");
    console.log(
      `${status} ${entry.taskName} | ${entry.platform} | ${entry.duration || 0}ms | ${new Date(entry.startTime).toLocaleString()}`,
    );
  }
  console.log("");
}

async function cmdStatus(scheduler, options) {
  const status = scheduler.getStatus();
  console.log(chalk.blue("\n📊 调度器状态\n"));
  console.log(
    `运行状态: ${status.running ? chalk.green("运行中") : chalk.red("已停止")}`,
  );
  console.log(`平台: ${status.platform.os}`);
  console.log(`任务总数: ${status.taskCount}`);
  console.log(`启用任务: ${status.enabledTaskCount}`);
  console.log(`执行中: ${status.runningJobCount}`);

  const nextTask = status.nextScheduledTask;
  if (nextTask) {
    console.log(`\n下次任务: ${nextTask.name}`);
    console.log(`执行时间: ${new Date(nextTask.nextRun).toLocaleString()}`);
  }
  console.log("");
}

function showHelp() {
  console.log(`
${chalk.blue("Stigmergy Scheduler - 定时任务管理")}

${chalk.yellow("用法:")}
  stigmergy scheduler <命令> [选项]

${chalk.yellow("命令:")}
  list, ls              列出所有任务
  add, new              创建新任务
  get <id>              查看任务详情
  update <id>           更新任务
  delete <id>           删除任务
  toggle <id>           启用/禁用任务
  run <id>              立即执行任务
  history               查看执行历史
  status                查看调度器状态
  start                 启动调度器
  stop                  停止调度器
  help                  显示帮助

${chalk.yellow("选项:")}
  --id <ID>             任务ID
  --name <名称>         任务名称
  --type <类型>         任务类型: cli, gateway, webhook, script
  --cron <表达式>       Cron 表达式
  --cli <CLI名称>       CLI 工具: claude, gemini, qwen, iflow 等
  --command, -c <命令> 命令或提示词
  --platform, -p <平台> Gateway 平台: feishu, telegram, slack, discord
  --message, -m <消息>  消息内容
  --webhook <URL>      Webhook 地址
  --timeout <毫秒>      超时时间
  --retry <次数>       重试次数
  --limit <数量>       限制数量

${chalk.yellow("示例:")}
  # 创建定时任务 - 每天早上9点用 Claude 执行代码审查
  stigmergy scheduler add --name "代码审查" --type cli --cli claude \\
    --cron "0 9 * * *" --command "请审查最近的代码变更"

  # 创建 Gateway 消息 - 每天8点发送早报到 Telegram
  stigmergy scheduler add --name "早报提醒" --type gateway \\
    --cron "0 8 * * *" --platform telegram --message "早安！开始新的一天"

  # 查看所有任务
  stigmergy scheduler list

  # 立即执行任务
  stigmergy scheduler run --id <任务ID>

${chalk.yellow("Cron 表达式格式:")}
  分 时 日 月 周
  * * * * *

  示例:
  "0 9 * * *"     每天早上9点
  "*/5 * * * *"   每5分钟
  "0 0 1 * *"     每月1号午夜
  "30 8 * * 1-5"  工作日早上8点30分
`);
}

main();
