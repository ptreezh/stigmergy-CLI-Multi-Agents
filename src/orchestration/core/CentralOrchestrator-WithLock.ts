/**
 * CentralOrchestrator - 集成 StateLockManager 的版本
 * 提供文件冲突保护
 */

import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';

// 导入 StateLockManager
const { StateLockManager } = require('./StateLockManager');

// CLI 配置
interface CLIConfig {
  name: string;
  command: string;
  params: string[];
  available: boolean;
  capabilities: string[];
}

// 任务类型
export type TaskType = 'code' | 'analysis' | 'documentation' | 'testing' | 'refactoring' | 'debugging' | 'general';

// 子任务类型
export type SubTaskType = 'implementation' | 'testing' | 'documentation' | 'analysis' | 'validation';

// 执行策略
export type ExecutionStrategy = 'parallel' | 'sequential' | 'hybrid';

// 任务接口
export interface Task {
  id: string;
  description: string;
  type: TaskType;
  complexity: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  dependencies: string[];
}

// 子任务接口
export interface SubTask {
  id: string;
  taskId: string;
  description: string;
  type: SubTaskType;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  requiredSkills: string[];
  requiredAgent: string | null;
  mcpTools: string[];
  requiredFiles: string[];
  outputFiles: string[];
  assignedCLI: string | null;
}

// 执行结果接口
export interface ExecutionResult {
  cli: string;
  success: boolean;
  output: any;
  executionTime: number;
  error?: string;
  skipped?: boolean;
}

// 并发执行结果
export interface ConcurrentResult {
  totalResults: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  totalTime: number;
  results: ExecutionResult[];
}

// CLI 选择结果
export interface CLISelection {
  cli: string;
  confidence: number;
  reason: string;
}

// 执行策略配置
export interface OrchestrationStrategy {
  mode: ExecutionStrategy;
  concurrencyLimit?: number;
  timeout?: number;
}

export class CentralOrchestratorWithLock extends EventEmitter {
  private cliRegistry: Map<string, CLIConfig>;
  private workDir: string;
  private concurrency: number;
  private taskHistory: Map<string, Task>;
  private lockManager: any; // StateLockManager instance

  constructor(options: {
    concurrency?: number;
    workDir?: string;
  } = {}) {
    super();
    this.concurrency = options.concurrency || 3;
    this.workDir = options.workDir || process.cwd();
    this.cliRegistry = new Map();
    this.taskHistory = new Map();

    // 🔒 初始化 StateLockManager
    this.lockManager = new (require('./dist/orchestration/managers/StateLockManager'))();

    this._initializeCLIRegistry();
  }

  /**
   * 初始化 CLI 注册表
   */
  private _initializeCLIRegistry(): void {
    const clis: CLIConfig[] = [
      {
        name: 'qwen',
        command: 'qwen',
        params: ['-y'],
        available: true,
        capabilities: ['code', 'chinese', 'analysis', 'documentation']
      },
      {
        name: 'iflow',
        command: 'iflow',
        params: [],
        available: true,
        capabilities: ['code', 'analysis', 'interactive']
      },
      {
        name: 'claude',
        command: 'claude',
        params: ['-p', '', '--dangerously-skip-permissions', '--allowed-tools', 'Bash,Edit,Read,Write,RunCommand,ComputerTools'],
        available: true,
        capabilities: ['analysis', 'documentation', 'reasoning', 'complex']
      },
      {
        name: 'gemini',
        command: 'gemini',
        params: ['-y'],
        available: true,
        capabilities: ['multilingual', 'creative', 'writing', 'design']
      },
      {
        name: 'codebuddy',
        command: 'codebuddy',
        params: ['-p', '', '-y'],
        available: true,
        capabilities: ['completion', 'refactoring', 'optimization', 'quality']
      },
      {
        name: 'codex',
        command: 'codex',
        params: ['-p', '', '-y'],
        available: true,
        capabilities: ['debugging', 'bug-fixing', 'error-handling']
      },
      {
        name: 'copilot',
        command: 'copilot',
        params: ['-p', '', '--allow-all-tools'],
        available: true,
        capabilities: ['best-practices', 'suggestions', 'patterns', 'architecture']
      },
      {
        name: 'qodercli',
        command: 'qodercli',
        params: ['-y'],
        available: true,
        capabilities: ['code', 'general']
      }
    ];

    clis.forEach(cli => {
      this.cliRegistry.set(cli.name, cli);
    });
  }

  /**
   * 并发执行任务（带文件锁保护）
   */
  async executeConcurrent(task: string, options: Partial<OrchestrationStrategy> = {}): Promise<ConcurrentResult> {
    const strategy: OrchestrationStrategy = {
      mode: options.mode || 'parallel',
      concurrencyLimit: options.concurrencyLimit || this.concurrency,
      timeout: options.timeout || 0
    };

    this.emit('task-start', { task, strategy });

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🚀 启动并发执行（带文件锁保护）`);
    console.log(`${'='.repeat(70)}`);
    console.log(`📊 执行模式: ${strategy.mode.toUpperCase()}`);
    console.log(`⏱️  超时时间: ${strategy.timeout ? strategy.timeout + 'ms' : '无限制'}`);

    const startTime = Date.now();

    try {
      // 选择可用的 CLI
      const availableCLIs = this._selectAvailableCLIs(strategy.concurrencyLimit || this.concurrency);
      console.log(`🤖 选中 CLI: ${availableCLIs.join(', ')}`);
      console.log(`📋 任务: ${task.substring(0, 100)}...`);
      console.log(`${'='.repeat(70)}\n`);

      // 🔒 创建子任务定义
      const taskId = `task-${Date.now()}`;
      const subtasks = availableCLIs.map((cliName, index) => ({
        id: `subtask-${index}`,
        taskId: taskId,
        description: task,
        type: 'implementation' as SubTaskType,
        priority: 'medium' as 'medium',
        dependencies: [],
        requiredSkills: [],
        requiredAgent: cliName,
        mcpTools: [],
        requiredFiles: [], // 可以扩展为自动检测
        outputFiles: [],
        assignedCLI: cliName
      }));

      // 🔒 初始化锁
      console.log(`🔒 初始化文件锁...`);
      await this.lockManager.initializeTask(taskId, subtasks);

      // 🔒 并发执行（带锁保护）
      const results = await this._executeConcurrentWithLock(taskId, subtasks, strategy.timeout);

      const endTime = Date.now();

      // 统计结果
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      const skippedCount = results.filter(r => r.skipped).length;

      const concurrentResult: ConcurrentResult = {
        totalResults: results.length,
        successCount,
        failedCount,
        skippedCount,
        totalTime: endTime - startTime,
        results
      };

      // 显示汇总
      this._displaySummary(concurrentResult);

      this.emit('task-complete', { task, result: concurrentResult });

      return concurrentResult;
    } catch (error) {
      this.emit('task-error', { task, error });
      throw error;
    }
  }

  /**
   * 带锁保护的并发执行
   */
  private async _executeConcurrentWithLock(
    taskId: string,
    subtasks: SubTask[],
    timeout: number
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];

    console.log(`\n📌 尝试获取锁...`);

    // 尝试为所有子任务获取锁（允许并行）
    const lockPromises = subtasks.map(async (subtask) => {
      const lockResult = await this.lockManager.acquireLock(
        taskId,
        subtask.id,
        subtask.assignedCLI || 'unknown'
      );

      return {
        subtask,
        lockResult
      };
    });

    const lockResults = await Promise.all(lockPromises);

    // 分离成功和失败的锁
    const acquired = lockResults.filter(lr => lr.lockResult.success);
    const skipped = lockResults.filter(lr => !lr.lockResult.success);

    console.log(`✅ 成功获取 ${acquired.length} 个锁`);
    if (skipped.length > 0) {
      console.log(`⚠️  跳过 ${skipped.length} 个 CLI:`);
      skipped.forEach(({ subtask, lockResult }) => {
        console.log(`   - ${subtask.assignedCLI}: ${lockResult.errorMessage}`);
      });
    }

    // 并发执行已获取锁的任务
    console.log(`\n🚀 开始并发执行...\n`);

    const executions = acquired.map(({ subtask }) =>
      this._executeSubtaskWithLock(taskId, subtask, timeout)
    );

    const executionResults = await Promise.all(executions);
    results.push(...executionResults);

    // 添加跳过的任务
    skipped.forEach(({ subtask, lockResult }) => {
      results.push({
        cli: subtask.assignedCLI || 'unknown',
        success: false,
        output: null,
        executionTime: 0,
        error: lockResult.errorMessage,
        skipped: true
      } as any);
    });

    // 释放所有锁
    console.log(`\n🔓 释放锁...`);
    for (const { subtask } of acquired) {
      const result = executionResults.find(r => r.cli === subtask.assignedCLI);
      await this.lockManager.releaseLock(taskId, subtask.id, result || { success: false });
    }

    return results;
  }

  /**
   * 执行单个子任务（带锁）
   */
  private async _executeSubtaskWithLock(
    taskId: string,
    subtask: SubTask,
    timeout: number
  ): Promise<ExecutionResult> {
    const cliName = subtask.assignedCLI || 'unknown';
    const task = subtask.description;

    const startTime = Date.now();

    try {
      console.log(`\n[${cliName}] ▶ 开始执行...`);

      // 执行命令
      const result = await this._executeWithCLI(cliName, task, timeout);
      const endTime = Date.now();

      console.log(`[${cliName}] ✅ 完成 (${endTime - startTime}ms)\n`);

      return {
        cli: cliName,
        success: true,
        output: result,
        executionTime: endTime - startTime
      };
    } catch (error) {
      const endTime = Date.now();
      console.log(`[${cliName}] ❌ 失败: ${error}\n`);

      return {
        cli: cliName,
        success: false,
        output: null,
        executionTime: endTime - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 使用指定的 CLI 执行任务
   */
  private async _executeWithCLI(
    cliName: string,
    task: string,
    timeout: number
  ): Promise<string> {
    const cliConfig = this.cliRegistry.get(cliName);

    if (!cliConfig) {
      throw new Error(`CLI ${cliName} not found in registry`);
    }

    // 构建命令参数
    let args: string[];
    if (cliName === 'qwen' || cliName === 'iflow' || cliName === 'qodercli' || cliName === 'gemini') {
      args = [task, ...cliConfig.params];
    } else if (cliName === 'codebuddy' || cliName === 'codex') {
      args = [...cliConfig.params.map(p => p === '' ? task : p)];
    } else if (cliName === 'copilot') {
      args = ['-p', task, '--allow-all-tools'];
    } else if (cliName === 'claude') {
      args = ['-p', task, '--dangerously-skip-permissions', '--allowed-tools', 'Bash,Edit,Read,Write,RunCommand,ComputerTools'];
    } else {
      args = ['-p', task];
    }

    // 执行命令（实时输出）
    return await this._spawnCommandRealtime(cliName, cliName, args, timeout);
  }

  /**
   * 生成子进程执行命令（实时输出）
   */
  private _spawnCommandRealtime(
    command: string,
    cliName: string,
    args: string[],
    timeout: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      const process = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        cwd: this.workDir
      });

      // 实时显示输出（带 CLI 名称前缀）
      process.stdout?.on('data', (data) => {
        const text = data.toString();
        output += text;

        // 实时显示，添加前缀
        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            console.log(`  [${cliName}] ${line}`);
          }
        });
      });

      process.stderr?.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;

        // 实时显示错误
        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            console.error(`  [${cliName}] ERROR: ${line}`);
          }
        });
      });

      // 处理进程退出
      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(errorOutput || `Process exited with code ${code}`));
        }
      });

      // 处理错误
      process.on('error', (error) => {
        reject(error);
      });

      // 超时处理
      if (timeout > 0) {
        const timeoutId = setTimeout(() => {
          process.kill();
          reject(new Error(`Command timed out after ${timeout}ms`));
        }, timeout);

        process.on('close', () => {
          clearTimeout(timeoutId);
        });
      }
    });
  }

  /**
   * 显示执行汇总
   */
  private _displaySummary(result: ConcurrentResult): void {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 执行汇总`);
    console.log(`${'='.repeat(70)}`);
    console.log(`  总计: ${result.totalResults} 个 CLI`);
    console.log(`  ✅ 成功: ${result.successCount}`);
    console.log(`  ❌ 失败: ${result.failedCount}`);
    console.log(`  ⏭️  跳过: ${result.skippedCount}`);
    console.log(`  ⏱️  总耗时: ${result.totalTime}ms`);
    console.log(`${'='.repeat(70)}\n`);
  }

  /**
   * 选择可用的 CLI
   */
  private _selectAvailableCLIs(count: number): string[] {
    const available = Array.from(this.cliRegistry.entries())
      .filter(([_, config]) => config.available)
      .map(([name, _]) => name);

    return available.slice(0, count);
  }

  /**
   * 获取可用的 CLI 列表
   */
  getAvailableCLIs(): string[] {
    return Array.from(this.cliRegistry.entries())
      .filter(([_, config]) => config.available)
      .map(([name, _]) => name);
  }
}

module.exports = { CentralOrchestratorWithLock };
