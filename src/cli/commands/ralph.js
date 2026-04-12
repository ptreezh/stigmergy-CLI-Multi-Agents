#!/usr/bin/env node
/**
 * Ralph CLI Command
 *
 * stigmergy ralph <cli> <command> [options]
 *
 * Commands:
 *   start           启动 Ralph 循环
 *   status          查看状态
 *   init            初始化 plan.md
 *   stop            停止运行
 *   list            列出所有 CLI 的任务
 */

const chalk = require("chalk");
const path = require("path");
const os = require("os");
const fs = require("fs");

// 项目根目录
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

// 支持的 CLI 列表（不含 OpenCode，已内置）
const SUPPORTED_CLIS = [
  "claude",
  "qwen",
  "iflow",
  "gemini",
  "codex",
  "codebuddy",
  "kilocode",
  "qodercli",
  "copilot",
];

// 全局进程标志
let ralphProcess = null;

async function main() {
  const args = process.argv.slice(2);
  const cliName = args[0];
  const command = args[1] || "status";
  const options = parseOptions(args.slice(2));

  // 显示帮助
  if (cliName === "help" || cliName === "--help" || cliName === "-h") {
    showHelp();
    return;
  }

  // 验证 CLI 名称
  if (!cliName) {
    console.log(chalk.yellow("请指定 CLI 名称"));
    showHelp();
    return;
  }

  if (!SUPPORTED_CLIS.includes(cliName)) {
    console.log(chalk.red(`不支持的 CLI: ${cliName}`));
    console.log(chalk.yellow(`支持的 CLI: ${SUPPORTED_CLIS.join(", ")}`));
    console.log(chalk.gray("(OpenCode 已内置 Ralph，请直接使用)"));
    return;
  }

  const projectRoot = getProjectRoot();
  const RalphLoop = require(
    path.join(projectRoot, "src", "core", "ralph_loop"),
  );

  try {
    switch (command) {
      case "start":
      case "run":
        await cmdStart(RalphLoop, cliName, options, projectRoot);
        break;

      case "status":
      case "stat":
        cmdStatus(RalphLoop, cliName, projectRoot);
        break;

      case "init":
      case "create":
        cmdInit(cliName, options, projectRoot);
        break;

      case "stop":
      case "kill":
        cmdStop();
        break;

      case "list":
      case "ls":
        cmdList(projectRoot);
        break;

      default:
        console.log(chalk.red(`未知命令: ${command}`));
        showHelp();
    }
  } catch (error) {
    console.error(chalk.red(`错误: ${error.message}`));
    process.exit(1);
  }
}

function parseOptions(args) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        options[key] = next;
        i++;
      } else {
        options[key] = true;
      }
    } else if (arg.startsWith("-") && arg.length > 1) {
      const key = arg.slice(1);
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        options[key] = next;
        i++;
      } else {
        options[key] = true;
      }
    }
  }
  return options;
}

async function cmdStart(RalphLoop, cliName, options, projectRoot) {
  const maxIterations = parseInt(options.maxIterations || options.m || "10");
  const completionPromise =
    options.completionPromise || options.complete || null;
  const planPath = options.plan || options.p || null;

  console.log(chalk.blue(`\n🚀 启动 Ralph 循环 for ${cliName}\n`));

  const ralph = new RalphLoop({
    cli: cliName,
    maxIterations,
    completionPromise,
    quiet: false,
  });

  if (planPath) {
    ralph.setPlan(planPath);
  }

  ralph.init();

  // 检查 plan 文件
  if (!fs.existsSync(ralph.planFile)) {
    console.log(chalk.yellow(`Plan 文件不存在: ${ralph.planFile}`));
    console.log(
      chalk.yellow(`运行 'stigmergy ralph ${cliName} init' 创建示例`),
    );
    return;
  }

  console.log(`Plan: ${ralph.planFile}`);
  console.log(`Max iterations: ${maxIterations}`);
  console.log(chalk.gray("\n按 Ctrl+C 停止...\n"));

  // 捕获 Ctrl+C
  process.on("SIGINT", () => {
    console.log(chalk.yellow("\n\n⚠️ 正在停止 Ralph 循环..."));
    ralph.isRunning = false;
    process.exit(0);
  });

  const result = await ralph.run();

  console.log(chalk.green("\n✅ Ralph 循环完成"));
  console.log(`   迭代次数: ${result.iterations}`);
  console.log(`   执行时间: ${result.duration}ms`);
  console.log(`   全部完成: ${result.completed ? "是" : "否"}\n`);
}

function cmdStatus(RalphLoop, cliName, projectRoot) {
  const ralph = new RalphLoop({ cli: cliName, quiet: true });
  ralph.init();

  const status = ralph.getStatus();

  console.log(chalk.blue(`\n📊 Ralph 状态: ${cliName}\n`));
  console.log(`CLI: ${status.cli}`);
  console.log(
    `运行中: ${status.isRunning ? chalk.green("是") : chalk.red("否")}`,
  );
  console.log(`当前迭代: ${status.currentIteration}`);
  console.log(`任务总数: ${status.tasks.total}`);
  console.log(`已完成: ${status.tasks.completed}`);
  console.log(`剩余: ${status.tasks.remaining}`);
  console.log(`上次运行: ${status.lastRun || "从未"}\n`);
}

function cmdInit(cliName, options, projectRoot) {
  const outputPath = options.output || options.o || null;
  const ralphRoot = path.join(os.homedir(), ".stigmergy", "ralph", cliName);

  // 创建目录
  if (!fs.existsSync(ralphRoot)) {
    fs.mkdirSync(ralphRoot, { recursive: true });
  }

  // 默认输出路径
  const planPath = outputPath || path.join(ralphRoot, "plan.md");

  const template = `# Ralph Plan for ${cliName}

## 目标
描述这个 Ralph 循环要完成的目标

## 任务列表

- [ ] 任务1: 第一个要完成的任务
- [ ] 任务2: 第二个要完成的任务
- [ ] 任务3: 第三个要完成的任务

## 质量检查（可选）
在每个任务完成后可以运行：
- \`npm test\`
- \`npm run lint\`
- \`npm run build\`

## 使用方法

1. 编辑任务列表，添加你需要完成的任务
2. 运行: \`stigmergy ralph ${cliName} start --plan ${planPath}\`
3. Ralph 会循环执行直到所有任务完成

## 提示
- 每个任务应该足够小，可以在一次迭代中完成
- 任务要有清晰的完成标准
- 使用具体的描述，避免模糊
`;

  fs.writeFileSync(planPath, template, "utf-8");

  console.log(chalk.green(`\n✅ 已创建 plan.md`));
  console.log(`   路径: ${planPath}`);
  console.log(chalk.yellow(`\n请编辑任务列表后运行:`));
  console.log(`   stigmergy ralph ${cliName} start --plan "${planPath}"\n`);
}

function cmdStop() {
  if (ralphProcess) {
    ralphProcess.kill();
    console.log(chalk.green("\n✅ Ralph 循环已停止\n"));
  } else {
    console.log(chalk.yellow("\n⚠️ 没有正在运行的 Ralph 循环\n"));
  }
}

function cmdList(projectRoot) {
  const ralphRoot = path.join(os.homedir(), ".stigmergy", "ralph");

  console.log(chalk.blue("\n📋 Ralph 任务列表\n"));

  if (!fs.existsSync(ralphRoot)) {
    console.log(chalk.yellow("暂无 Ralph 任务目录"));
    console.log(chalk.gray(`运行 'stigmergy ralph <cli> init' 初始化\n`));
    return;
  }

  const dirs = fs.readdirSync(ralphRoot);

  if (dirs.length === 0) {
    console.log(chalk.yellow("暂无任务"));
    return;
  }

  for (const cli of dirs) {
    const cliDir = path.join(ralphRoot, cli);
    const stat = fs.statSync(cliDir);

    if (!stat.isDirectory()) continue;

    const planFile = path.join(cliDir, "plan.md");
    const stateFile = path.join(cliDir, "state.json");

    let taskCount = 0;
    let completedCount = 0;

    if (fs.existsSync(planFile)) {
      const content = fs.readFileSync(planFile, "utf-8");
      const lines = content.split("\n");
      for (const line of lines) {
        if (line.match(/^-\s*\[\s*\]\s*/)) {
          taskCount++;
        } else if (line.match(/^-\s*\[x\]\s*/)) {
          taskCount++;
          completedCount++;
        }
      }
    }

    let status = chalk.gray("未运行");
    if (fs.existsSync(stateFile)) {
      const state = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
      if (state.isRunning) {
        status = chalk.green("运行中");
      } else {
        status = chalk.gray("已停止");
      }
    }

    console.log(
      `${cli.padEnd(12)} ${status.padEnd(8)} ${completedCount}/${taskCount} 任务`,
    );
  }
  console.log("");
}

function showHelp() {
  console.log(`
${chalk.blue("Stigmergy Ralph - 自主循环执行系统")}

${chalk.yellow("用法:")}
  stigmergy ralph <cli> <command> [选项]

${chalk.yellow("CLI:")}
  claude, qwen, iflow, gemini, codex, codebuddy, kilocode, qodercli, copilot
  (OpenCode 已内置 Ralph，请直接使用 /ralph-loop)

${chalk.yellow("命令:")}
  start, run     启动 Ralph 循环
  status         查看状态
  init           初始化 plan.md
  stop           停止运行
  list           列出所有任务

${chalk.yellow("选项:")}
  --plan <文件>       Plan 文件路径
  --max-iterations N 最大迭代次数 (默认: 10)
  --completion-promise TEXT  完成承诺文本

${chalk.yellow("示例:")}
  # 初始化
  stigmergy ralph claude init

  # 启动循环
  stigmergy ralph claude start

  # 指定 plan 文件
  stigmergy ralph qwen start --plan ./my-plan.md

  # 查看状态
  stigmergy ralph iflow status

${chalk.yellow("工作原理:")}
  1. 读取 plan.md 任务列表
  2. 选择下一个未完成任务 [-]
  3. 调用 CLI 执行任务
  4. 标记完成 [x] 并记录学习
  5. 重复直到全部完成
`);
}

main();
