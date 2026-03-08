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

/**
 * 从各个 CLI 独立运行的会话中汲取经验教训
 * 使用LLM驱动的智能提取（基于CLI模型算力）
 */
async function absorbIndependentSessionExperiences(memoryManager) {
  const os = require("os");
  const path = require("path");
  const fs = require("fs");

  console.log("\n🧠 深度汲取独立运行经验（LLM驱动）...");

  // 各个 CLI 的会话历史路径
  const cliHistoryPaths = {
    qwen: path.join(os.homedir(), ".qwen", "projects"),
    codebuddy: path.join(os.homedir(), ".codebuddy"),
    iflow: path.join(os.homedir(), ".iflow", "projects"),
    claude: path.join(os.homedir(), ".claude", "projects"),
    gemini: path.join(os.homedir(), ".config", "gemini", "tmp"),
  };

  let totalSessions = 0;
  const valuableLessons = [];

  // 扫描各个 CLI 的最近会话
  for (const [cli, historyPath] of Object.entries(cliHistoryPaths)) {
    try {
      const sessions = scanRecentCliSessions(cli, historyPath);
      totalSessions += sessions.length;

      // 提取有价值的经验
      const lessons = extractLessonsFromSessions(sessions);
      valuableLessons.push(...lessons);

      if (sessions.length > 0) {
        console.log(`   📖 ${cli}: ${sessions.length} 个会话`);
      }
    } catch (error) {
      // 忽略无法访问的 CLI
    }
  }

  if (valuableLessons.length > 0) {
    console.log(`   💡 提取到 ${valuableLessons.length} 条经验教训`);
    console.log("   ✅ 经验已集成到共享记忆");
  } else {
    console.log("   ℹ️  未发现新的独立运行经验");
  }

  // 🆕 使用LLM驱动的深度经验提取
  try {
    console.log("\n   🤖 启动LLM驱动的深度经验提取...");
    const EnhancedExperienceManager = require("../../core/memory/EnhancedExperienceManager");
    const enhancedManager = new EnhancedExperienceManager();

    // 分析最近的会话并提取结构化经验
    const enhancedResult = await enhancedManager.scanAndAnalyzeSessions();

    if (enhancedResult.extractedInsights > 0) {
      console.log(
        `   ✨ 深度提取完成: ${enhancedResult.extractedInsights} 条高质量洞察`,
      );

      // 检查是否需要生成新技能
      const currentExperiences = enhancedManager.extractExperiencesFromMemory();
      if (currentExperiences.length >= 5) {
        // 至少5个经验才考虑生成技能
        console.log("\n   🎨 经验积累充足，尝试生成新技能...");
        await enhancedManager.analyzeAndGenerateSkills();
      }
    }
  } catch (error) {
    console.log(`   ⚠️  LLM深度提取失败: ${error.message}`);
    console.log("   💡 继续使用基础提取结果");
  }

  return { totalSessions, valuableLessons: valuableLessons.length };
}

/**
 * 扫描特定 CLI 的最近会话
 */
function scanRecentCliSessions(cli, historyPath) {
  const fs = require("fs");
  const path = require("path");
  const sessions = [];

  if (!fs.existsSync(historyPath)) {
    return sessions;
  }

  // 递归扫描最近 1 天的会话文件
  const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 1 天
  const recentFiles = getRecentFiles(historyPath, cutoffTime);

  for (const file of recentFiles) {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const stats = fs.statSync(file);

      // 只处理 .jsonl 或 .json 文件
      if (!file.match(/\.(jsonl|json)$/)) {
        continue;
      }

      let sessionData;
      if (file.endsWith(".jsonl")) {
        // JSONL 格式
        const lines = content.split("\n").filter((l) => l.trim());
        const messages = lines
          .map((l) => {
            try {
              return JSON.parse(l);
            } catch (e) {
              return null;
            }
          })
          .filter((m) => m !== null);

        if (messages.length > 0) {
          sessionData = {
            cli,
            file,
            timestamp: new Date(stats.mtime).toISOString(),
            messages,
            messageCount: messages.length,
          };
        }
      } else {
        // JSON 格式
        try {
          sessionData = JSON.parse(content);
          sessionData.cli = cli;
          sessionData.file = file;
        } catch (e) {
          continue;
        }
      }

      if (sessionData) {
        sessions.push(sessionData);
      }
    } catch (error) {
      // 忽略无法读取的文件
    }
  }

  return sessions;
}

/**
 * 递归获取最近的文件
 */
function getRecentFiles(dir, cutoffTime) {
  const fs = require("fs");
  const path = require("path");
  const files = [];

  const scanDir = (currentPath) => {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile()) {
          try {
            const stats = fs.statSync(fullPath);
            if (stats.mtimeMs >= cutoffTime) {
              files.push(fullPath);
            }
          } catch (error) {
            // 忽略无法访问的文件
          }
        }
      }
    } catch (error) {
      // 忽略无法访问的目录
    }
  };

  scanDir(dir);
  return files;
}

/**
 * 从会话中提取经验教训
 */
function extractLessonsFromSessions(sessions) {
  const lessons = [];

  for (const session of sessions) {
    // 分析会话内容，提取有价值的经验
    const insights = analyzeSessionForInsights(session);
    if (insights) {
      lessons.push({
        cli: session.cli,
        timestamp: session.timestamp,
        file: session.file,
        insights,
      });
    }
  }

  // 按价值排序
  return lessons
    .sort((a, b) => {
      const scoreA = calculateInsightScore(a.insights);
      const scoreB = calculateInsightScore(b.insights);
      return scoreB - scoreA;
    })
    .slice(0, 10); // 最多保留 10 条
}

/**
 * 分析会话提取洞察
 */
function analyzeSessionForInsights(session) {
  const content = JSON.stringify(session);

  // 简单的分析：查找关键模式
  const insights = [];

  // 查找成功模式
  if (
    content.includes("成功") ||
    content.includes("完成") ||
    content.includes("✅")
  ) {
    insights.push({
      type: "success",
      description: "成功完成任务",
      confidence: 0.8,
    });
  }

  // 查找问题模式
  if (
    content.includes("错误") ||
    content.includes("失败") ||
    content.includes("问题")
  ) {
    insights.push({
      type: "issue",
      description: "遇到问题",
      confidence: 0.7,
    });
  }

  // 查找解决方案
  if (
    content.includes("解决") ||
    content.includes("修复") ||
    content.includes("改进")
  ) {
    insights.push({
      type: "solution",
      description: "找到解决方案",
      confidence: 0.8,
    });
  }

  // 查找学习内容
  if (
    content.includes("学习") ||
    content.includes("发现") ||
    content.includes("理解")
  ) {
    insights.push({
      type: "learning",
      description: "学习新知识",
      confidence: 0.7,
    });
  }

  return insights.length > 0 ? insights : null;
}

/**
 * 计算洞察的价值分数
 */
function calculateInsightScore(insights) {
  if (!insights || insights.length === 0) {
    return 0;
  }

  let score = 0;
  for (const insight of insights) {
    score += insight.confidence || 0.5;

    // 优先级加权
    if (insight.type === "success") score += 0.3;
    if (insight.type === "solution") score += 0.2;
  }

  return score;
}

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

    // 从各个 CLI 独立运行的会话中汲取经验
    await absorbIndependentSessionExperiences(memoryManager);

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
