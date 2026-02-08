/**
 * Handle concurrent command - Execute task with multiple AI tools concurrently
 * With shared context coordination using FileLock
 */

const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const chalk = require("chalk");
const projectRoot = path.resolve(__dirname, "..", "..");
const FileLock = require(path.join(projectRoot, "interactive", "FileLock"));
const { ProjectStatusBoard } = require(
  path.join(projectRoot, "core", "ProjectStatusBoard"),
);
const MemoryManager = require(path.join(projectRoot, "core", "memory_manager"));

const STIGMERGY_FILE = "STIGMERGY.md";

async function handleConcurrentCommand(prompt, options = {}) {
  try {
    console.log(chalk.bold.cyan("\n========================================"));
    console.log(chalk.bold.cyan("  Stigmergy 并发执行"));
    console.log(chalk.bold.cyan("========================================\n"));

    console.log(`📋 任务: ${prompt}`);
    console.log(`⚙️  选项:`);
    console.log(`   并发数: ${options.concurrency || 3}`);
    console.log(`   超时: ${options.timeout || "无"} ms`);
    console.log(`   模式: ${options.mode || "parallel"}`);
    console.log(chalk.gray("─".repeat(70) + "\n"));

    const availableCLIs = [
      "qwen",
      "codebuddy",
      "kilo",
      "iflow",
      "opencode",
      "qodercli",
      "claude",
      "gemini",
    ].slice(0, parseInt(options.concurrency) || 3);

    console.log(`🤖 选中 CLI: ${availableCLIs.join(", ")}`);

    const projectDir = process.cwd();
    const contextFile = path.join(projectDir, STIGMERGY_FILE);
    const fileLock = new FileLock({ timeout: 5000 });

    console.log(`\n🚀 初始化共享上下文...`);

    const statusBoard = new ProjectStatusBoard(projectDir);
    await statusBoard.initialize({ phase: "concurrent-execution" });

    const memoryManager = new MemoryManager();
    await memoryManager.updateGlobalMemory((mem) => mem);

    // 初始化/更新 STIGMERGY.md
    fileLock.acquire(contextFile);
    try {
      if (!fs.existsSync(contextFile)) {
        fs.writeFileSync(
          contextFile,
          `# Stigmergy 项目状态

## 任务历史

## 决策记录

## 待办事项

## 共享上下文

`,
        );
      }
      const content = fs.readFileSync(contextFile, "utf8");
      const timestamp = new Date().toLocaleString();
      fs.writeFileSync(
        contextFile,
        content +
          `\n## 并发任务 - ${Date.now()}\n**任务**: ${prompt}\n**时间**: ${timestamp}\n**参与者**: ${availableCLIs.join(", ")}\n\n`,
      );
    } finally {
      fileLock.release(contextFile);
    }

    console.log(`   ✅ 状态看板: ${statusBoard.statusFilePath}`);
    console.log(`   ✅ 共享上下文: ${contextFile}`);
    console.log(`\n🚀 启动 CLI 进程 (带上下文协调)...`);

    const processes = [];
    const taskId = `concurrent-${Date.now()}`;

    // 初始化/读取上下文
    fileLock.acquire(contextFile);
    try {
      if (!fs.existsSync(contextFile)) {
        fs.writeFileSync(
          contextFile,
          `# Stigmergy 项目状态\n\n## 任务历史\n\n## 决策记录\n\n## 待办事项\n\n## 共享上下文\n`,
        );
      }
      // 记录任务开始
      const content = fs.readFileSync(contextFile, "utf8");
      fs.writeFileSync(
        contextFile,
        content +
          `\n## 并发任务 - ${taskId}\n**任务**: ${prompt}\n**时间**: ${new Date().toLocaleString()}\n**参与者**: ${availableCLIs.join(", ")}\n\n`,
      );
    } finally {
      fileLock.release(contextFile);
    }

    // 启动所有 CLI 进程
    for (const cliName of availableCLIs) {
      let args = [];
      switch (cliName) {
        case "claude":
        case "iflow":
        case "gemini":
        case "kilo":
          args = ["-p", prompt];
          break;
        case "qwen":
        case "copilot":
        case "kode":
          args = [prompt];
          break;
        case "codebuddy":
          args = ["-y", "-p", prompt];
          break;
        case "qodercli":
          args = ["-p", prompt];
          break;
        case "codex":
          args = ["-m", "gpt-5", prompt];
          break;
        default:
          args = [prompt];
      }

      console.log(`   📡 启动 ${cliName}...`);

      const childProcess = spawn(cliName, args, {
        shell: true,
        cwd: projectDir,
        env: {
          ...process.env,
          STIGMERGY_TASK_ID: taskId,
          STIGMERGY_CLI_NAME: cliName,
          STIGMERGY_CONTEXT_FILE: contextFile,
          STIGMERGY_MODE: "concurrent",
        },
      });

      processes.push({
        cliName,
        process: childProcess,
        output: "",
        error: "",
        completed: false,
        success: false,
      });

      childProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        process.stdout.write(`[${cliName}] ${output}`);
        const procInfo = processes.find((p) => p.cliName === cliName);
        if (procInfo) procInfo.output += output;
      });

      childProcess.stderr?.on("data", (data) => {
        const error = data.toString();
        process.stderr.write(`[${cliName}] ${error}`);
        const procInfo = processes.find((p) => p.cliName === cliName);
        if (procInfo) procInfo.error += error;
      });

      childProcess.on("close", (code) => {
        const procInfo = processes.find((p) => p.cliName === cliName);
        if (procInfo) {
          procInfo.completed = true;
          procInfo.success = code === 0;

          // 写入结果到共享文件
          fileLock.acquire(contextFile);
          try {
            const fileContent = fs.readFileSync(contextFile, "utf8");
            const resultSection = `\n### ${cliName} 结果\n**状态**: ${code === 0 ? "✅ 成功" : "❌ 失败"}\n**输出**: ${procInfo.output.substring(0, 500).replace(/\n/g, " ")}\n`;
            fs.writeFileSync(contextFile, fileContent + resultSection);
          } finally {
            fileLock.release(contextFile);
          }
        }
      });
    }

    // 等待所有进程完成
    console.log(`\n⏳ 等待所有 CLI 完成...\n`);

    const timeout = parseInt(options.timeout) || 60000;
    await Promise.all(
      processes.map(
        (procInfo) =>
          new Promise((resolve) => {
            const timer = setTimeout(() => {
              procInfo.process.kill();
              procInfo.completed = true;
              procInfo.success = false;
              procInfo.error = "Timeout";
              resolve();
            }, timeout);

            procInfo.process.on("close", () => {
              clearTimeout(timer);
              resolve();
            });
          }),
      ),
    );

    // 收集结果
    const results = [];
    for (const procInfo of processes) {
      results.push({
        cli: procInfo.cliName,
        success: procInfo.success,
        output: procInfo.output,
        error: procInfo.error,
        executionTime: 0,
      });
    }

    // 显示结果汇总
    console.log(chalk.bold.green("\n========================================"));
    console.log(chalk.bold.green("  执行完成"));
    console.log(chalk.bold.green("========================================\n"));

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    console.log(`📊 总计: ${results.length} 个 CLI`);
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ 失败: ${failedCount}\n`);

    // 显示上下文摘要
    console.log(chalk.cyan("📝 上下文已更新到 STIGMERGY.md\n"));

    if (options.verbose) {
      console.log(chalk.bold("详细结果:\n"));
      results.forEach((r, i) => {
        if (r.success) {
          console.log(chalk.green(`[${i + 1}] ${r.cli}: 成功`));
          if (r.output) {
            const preview = r.output.substring(0, 200);
            console.log(
              chalk.gray(
                `   输出: ${preview}${r.output.length > 200 ? "..." : ""}`,
              ),
            );
          }
        } else {
          console.log(chalk.red(`[${i + 1}] ${r.cli}: 失败`));
          if (r.error) {
            console.log(chalk.gray(`   错误: ${r.error}`));
          }
        }
      });
    }

    return {
      success: true,
      result: {
        taskId,
        totalResults: results.length,
        successCount,
        failedCount,
        results,
        contextFile: contextFile,
      },
    };
  } catch (error) {
    console.error(chalk.bold.red("\n❌ 并发执行失败:"), error.message);
    console.error(chalk.gray(error.stack));

    return { success: false, error: error.message };
  }
}

module.exports = { handleConcurrentCommand };
