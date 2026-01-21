/**
 * Handle concurrent command - Execute task with multiple AI tools concurrently
 * 集成 EnhancedTerminalManager 和 GitWorktreeManager
 */

const chalk = require('chalk');
const path = require('path');

async function handleConcurrentCommand(prompt, options = {}) {
  try {
    console.log(chalk.bold.cyan('\n========================================'));
    console.log(chalk.bold.cyan('  Stigmergy 并发执行'));
    console.log(chalk.bold.cyan('========================================\n'));

    console.log(`📋 任务: ${prompt}`);
    console.log(`⚙️  选项:`);
    console.log(`   并发数: ${options.concurrency || 3}`);
    console.log(`   超时: ${options.timeout || '无'} ms`);
    console.log(`   模式: ${options.mode || 'parallel'}`);
    console.log(`   文件锁: ${options.noLock ? '❌ 禁用' : '✅ 启用'}`);
    console.log(`   Worktree: ${options.noWorktree ? '❌ 禁用' : '✅ 启用'}`);
    console.log(`   新终端窗口: ${options.noTerminal ? '❌ 禁用' : '✅ 启用'}`);
    console.log(chalk.gray('─'.repeat(70) + '\n'));

    // 导入必要的模块
    const { CentralOrchestrator } = require('../../../dist/orchestration/core/CentralOrchestrator-WithLock');
    const { EnhancedTerminalManager } = require('../../../dist/orchestration/managers/EnhancedTerminalManager');
    const { GitWorktreeManager } = require('../../../dist/orchestration/managers/GitWorktreeManager');

    // 创建管理器实例
    const orchestrator = new CentralOrchestrator({
      concurrency: parseInt(options.concurrency) || 3,
      workDir: process.cwd()
    });

    const terminalManager = new EnhancedTerminalManager();
    const worktreeManager = new GitWorktreeManager();

    // 生成任务 ID
    const taskId = `task-${Date.now()}`;

    // 选择可用的 CLI
    const availableCLIs = orchestrator._selectAvailableCLIs(parseInt(options.concurrency) || 3);
    console.log(`🤖 选中 CLI: ${availableCLIs.join(', ')}`);

    // 创建子任务定义
    const subtasks = availableCLIs.map((cliName, index) => ({
      id: `subtask-${index}`,
      taskId: taskId,
      description: prompt,
      type: 'implementation',
      priority: 'medium',
      dependencies: [],
      requiredSkills: [],
      requiredAgent: cliName,
      mcpTools: [],
      requiredFiles: [],
      outputFiles: [],
      assignedCLI: cliName
    }));

    // 为每个子任务创建 worktree（如果启用）
    let worktrees = {};
    if (!options.noWorktree) {
      console.log(`\n🌳 创建 Git Worktree...`);
      for (const subtask of subtasks) {
        try {
          const worktree = await worktreeManager.createWorktree({
            taskId: subtask.taskId,
            subtaskId: subtask.id,
            subtask: subtask,
            projectPath: process.cwd()
          });
          worktrees[subtask.id] = worktree;
          console.log(`   ✅ ${subtask.assignedCLI}: ${worktree.worktreePath}`);
        } catch (error) {
          console.log(`   ❌ ${subtask.assignedCLI}: ${error.message}`);
          worktrees[subtask.id] = { worktreePath: process.cwd() };
        }
      }
    } else {
      // 如果禁用 worktree，所有 CLI 在当前目录执行
      for (const subtask of subtasks) {
        worktrees[subtask.id] = { worktreePath: process.cwd() };
      }
    }

    // 在新终端窗口中执行 CLI（如果启用）
    if (!options.noTerminal) {
      console.log(`\n🖥️  启动终端窗口...`);
      const strategy = {
        mode: options.mode || 'parallel',
        concurrencyLimit: parseInt(options.concurrency) || 3,
        timeout: parseInt(options.timeout) || 0
      };

      const terminalResults = await terminalManager.launchTerminalsForTask(
        { subtasks },
        strategy,
        worktrees
      );

      console.log(`\n📊 终端启动结果:`);
      terminalResults.forEach((result, i) => {
        if (result.success) {
          console.log(`   ✅ ${availableCLIs[i]}: 终端 ID ${result.terminalId}`);
        } else {
          console.log(`   ❌ ${availableCLIs[i]}: ${result.error}`);
        }
      });

      // 等待所有终端完成
      console.log(`\n⏳ 等待所有终端完成...`);
      const terminalIds = terminalResults
        .filter(r => r.success && r.terminalId)
        .map(r => r.terminalId);
      await terminalManager.waitForAllTerminals(terminalIds);

      // 收集结果
      const results = [];
      for (const terminalId of terminalIds) {
        const terminal = terminalManager.terminals.get(terminalId);
        if (terminal) {
          const output = terminalManager.outputBuffers.get(terminalId) || '';
          results.push({
            cli: terminal.terminal.cliName,
            success: terminal.terminal.status === 'completed',
            output: output,
            executionTime: Date.now() - terminal.terminal.createdAt.getTime()
          });
        }
      }

      // 显示结果汇总
      console.log(chalk.bold.green('\n========================================'));
      console.log(chalk.bold.green('  执行完成'));
      console.log(chalk.bold.green('========================================\n'));

      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;

      console.log(`📊 总计: ${results.length} 个 CLI`);
      console.log(`✅ 成功: ${successCount}`);
      console.log(`❌ 失败: ${failedCount}\n`);

      // 显示详细结果（如果 verbose）
      if (options.verbose) {
        console.log(chalk.bold('详细结果:\n'));
        results.forEach((r, i) => {
          if (r.success) {
            console.log(chalk.green(`[${i + 1}] ${r.cli}: 成功`));
            if (r.output) {
              const preview = r.output.substring(0, 200);
              console.log(chalk.gray(`   输出: ${preview}${r.output.length > 200 ? '...' : ''}`));
            }
          } else {
            console.log(chalk.red(`[${i + 1}] ${r.cli}: 失败`));
          }
        });
      }

      // 清理 worktree（如果启用）
      if (!options.noWorktree) {
        console.log(`\n🧹 清理 Worktree...`);
        for (const subtask of subtasks) {
          try {
            await worktreeManager.removeWorktree(subtask.taskId, subtask.id);
            console.log(`   ✅ ${subtask.assignedCLI}`);
          } catch (error) {
            console.log(`   ❌ ${subtask.assignedCLI}: ${error.message}`);
          }
        }
      }

      return { success: true, result: { totalResults: results.length, successCount, failedCount, results } };
    } else {
      // 如果禁用终端窗口，使用原有的并发执行方式
      console.log(`\n🚀 使用原有并发执行方式...`);
      const result = await orchestrator.executeConcurrent(prompt, {
        mode: options.mode || 'parallel',
        concurrencyLimit: parseInt(options.concurrency) || 3,
        timeout: parseInt(options.timeout) || 0
      });

      // 显示结果汇总
      console.log(chalk.bold.green('\n========================================'));
      console.log(chalk.bold.green('  执行完成'));
      console.log(chalk.bold.green('========================================\n'));

      console.log(`📊 总计: ${result.totalResults} 个 CLI`);
      console.log(`✅ 成功: ${result.successCount}`);
      console.log(`❌ 失败: ${result.failedCount}`);
      if (result.skippedCount > 0) {
        console.log(`⏭️  跳过: ${result.skippedCount}`);
      }
      console.log(`⏱️  总耗时: ${result.totalTime}ms\n`);

      // 显示详细结果（如果 verbose）
      if (options.verbose) {
        console.log(chalk.bold('详细结果:\n'));
        result.results.forEach((r, i) => {
          if (r.skipped) {
            console.log(chalk.gray(`[${i + 1}] ${r.cli}: 跳过 (${r.error})`));
          } else if (r.success) {
            console.log(chalk.green(`[${i + 1}] ${r.cli}: 成功`));
            if (r.output && typeof r.output === 'string') {
              const preview = r.output.substring(0, 200);
              console.log(chalk.gray(`   输出: ${preview}${r.output.length > 200 ? '...' : ''}`));
            }
          } else {
            console.log(chalk.red(`[${i + 1}] ${r.cli}: 失败`));
            console.log(chalk.gray(`   错误: ${r.error}`));
          }
        });
      }

      return { success: true, result };
    }

  } catch (error) {
    console.error(chalk.bold.red('\n❌ 并发执行失败:'), error.message);
    console.error(chalk.gray(error.stack));

    return { success: false, error: error.message };
  }
}

module.exports = { handleConcurrentCommand };
