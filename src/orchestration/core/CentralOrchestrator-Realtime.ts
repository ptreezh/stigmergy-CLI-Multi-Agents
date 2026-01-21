/**
 * CentralOrchestrator - 实时输出版本
 * 改进的并发执行，提供实时反馈
 */

import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import * as chalk from 'chalk';

// 保留原有类型定义
export interface ExecutionResult {
  cli: string;
  success: boolean;
  output: any;
  executionTime: number;
  error?: string;
}

export interface ConcurrentResult {
  totalResults: number;
  successCount: number;
  failedCount: number;
  totalTime: number;
  results: ExecutionResult[];
}

export type ExecutionStrategy = 'parallel' | 'sequential' | 'hybrid';

export interface OrchestrationStrategy {
  mode: ExecutionStrategy;
  concurrencyLimit?: number;
  timeout?: number;
}

export class CentralOrchestratorRealtime extends EventEmitter {
  private cliRegistry: Map<string, any>;
  private workDir: string;
  private concurrency: number;
  private taskHistory: Map<string, any>;

  // 新增：输出颜色映射
  private cliColors: Map<string, string> = new Map();

  constructor(options: {
    concurrency?: number;
    workDir?: string;
  } = {}) {
    super();
    this.concurrency = options.concurrency || 3;
    this.workDir = options.workDir || process.cwd();
    this.cliRegistry = new Map();
    this.taskHistory = new Map();

    this._initializeCLIRegistry();
    this._initializeColors();
  }

  /**
   * 初始化 CLI 颜色
   */
  private _initializeColors() {
    const colors = ['cyan', 'green', 'yellow', 'blue', 'magenta', 'red', 'white', 'gray'];
    const cliNames = ['qwen', 'iflow', 'claude', 'gemini', 'codebuddy', 'codex', 'copilot', 'qodercli'];

    cliNames.forEach((name, index) => {
      this.cliColors.set(name, colors[index % colors.length]);
    });
  }

  /**
   * 初始化 CLI 注册表
   */
  private _initializeCLIRegistry(): void {
    const clis = [
      { name: 'qwen', command: 'qwen', params: ['-y'], available: true },
      { name: 'iflow', command: 'iflow', params: [], available: true },
      { name: 'claude', command: 'claude', params: ['-p', '', '--dangerously-skip-permissions'], available: true },
      { name: 'gemini', command: 'gemini', params: ['-y'], available: true },
      { name: 'codebuddy', command: 'codebuddy', params: ['-p', '', '-y'], available: true },
      { name: 'codex', command: 'codex', params: ['-p', '', '-y'], available: true },
      { name: 'copilot', command: 'copilot', params: ['-p', '', '--allow-all-tools'], available: true },
      { name: 'qodercli', command: 'qodercli', params: ['-y'], available: true }
    ];

    clis.forEach(cli => {
      this.cliRegistry.set(cli.name, cli);
    });
  }

  /**
   * 并发执行任务（实时输出版本）
   */
  async executeConcurrent(task: string, options: Partial<OrchestrationStrategy> = {}): Promise<ConcurrentResult> {
    const strategy: OrchestrationStrategy = {
      mode: options.mode || 'parallel',
      concurrencyLimit: options.concurrencyLimit || this.concurrency,
      timeout: options.timeout || 0
    };

    this.emit('task-start', { task, strategy });

    const startTime = Date.now();

    try {
      // 选择可用的 CLI
      const availableCLIs = this._selectAvailableCLIs(strategy.concurrencyLimit || this.concurrency);

      // 显示启动信息
      console.log(`\n${chalk.bold('🚀 Starting Concurrent Execution')}`);
      console.log(`${chalk.gray('─'.repeat(60))}`);
      console.log(`📊 Mode: ${chalk.yellow(strategy.mode.toUpperCase())}`);
      console.log(`🤖 CLIs: ${availableCLIs.map(cli => chalk[this.cliColors.get(cli) || 'white'](cli)).join(', ')}`);
      console.log(`📋 Task: ${chalk.gray(task.substring(0, 80))}${task.length > 80 ? '...' : ''}`);
      console.log(`${chalk.gray('─'.repeat(60))}\n`);

      // 并发执行（实时输出）
      const results = await this._executeConcurrentWithRealtimeOutput(availableCLIs, task, strategy.timeout);

      const endTime = Date.now();

      // 统计结果
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;

      const concurrentResult: ConcurrentResult = {
        totalResults: results.length,
        successCount,
        failedCount,
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
   * 并发执行并提供实时输出
   */
  private async _executeConcurrentWithRealtimeOutput(
    cliNames: string[],
    task: string,
    timeout: number
  ): Promise<ExecutionResult[]> {

    // 为每个 CLI 启动执行
    const executions = cliNames.map(cliName =>
      this._executeWithCLIRealtime(cliName, task, timeout)
    );

    // 等待所有完成
    return await Promise.all(executions);
  }

  /**
   * 使用指定的 CLI 执行任务（实时输出）
   */
  private async _executeWithCLIRealtime(
    cliName: string,
    task: string,
    timeout: number
  ): Promise<ExecutionResult> {
    const cliConfig = this.cliRegistry.get(cliName);
    const color = this.cliColors.get(cliName) || 'white';

    if (!cliConfig) {
      throw new Error(`CLI ${cliName} not found in registry`);
    }

    console.log(`${chalk[color]('▶')}  ${chalk.bold(cliName)}: Starting...`);

    const startTime = Date.now();

    try {
      // 构建命令参数
      let args: string[];
      if (cliName === 'qwen' || cliName === 'iflow' || cliName === 'qodercli' || cliName === 'gemini') {
        args = [task, ...cliConfig.params];
      } else if (cliName === 'codebuddy' || cliName === 'codex') {
        args = [...cliConfig.params.map(p => p === '' ? task : p)];
      } else if (cliName === 'copilot') {
        args = ['-p', task, '--allow-all-tools'];
      } else if (cliName === 'claude') {
        args = ['-p', task, '--dangerously-skip-permissions'];
      } else {
        args = ['-p', task];
      }

      // 执行命令（实时输出）
      const result = await this._spawnCommandRealtime(cliName, args, timeout, color);
      const endTime = Date.now();

      const duration = endTime - startTime;
      console.log(`${chalk[color]('✓')}  ${chalk.bold(cliName)}: Completed in ${chalk.gray(duration + 'ms')}\n`);

      return {
        cli: cliName,
        success: true,
        output: result,
        executionTime: duration
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`${chalk.red('✗')}  ${chalk.bold(cliName)}: Failed ${chalk.gray(`(${error})`)}\n`);

      return {
        cli: cliName,
        success: false,
        output: null,
        executionTime: duration,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 生成子进程执行命令（实时输出）
   */
  private _spawnCommandRealtime(
    cliName: string,
    args: string[],
    timeout: number,
    color: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';
      let hasOutput = false;

      const process = spawn(cliName, args, {
        stdio: ['ignore', 'pipe', 'pipe'],  // 使用 pipe 以便添加前缀
        shell: true,
        cwd: this.workDir
      });

      // 实时显示输出（带颜色前缀）
      const prefix = chalk[color](`[${cliName}]`);

      process.stdout?.on('data', (data) => {
        const text = data.toString();
        output += text;

        // 实时显示
        if (!hasOutput) {
          hasOutput = true;
        }

        // 添加前缀后显示
        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            console.log(`  ${prefix} ${line}`);
          }
        });
      });

      process.stderr?.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;

        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            console.error(`${chalk.red('  [' + cliName + ']')} ${chalk.red(line)}`);
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
  private _displaySummary(result: ConcurrentResult) {
    console.log(`\n${chalk.bold('📊 Execution Summary')}`);
    console.log(`${chalk.gray('─'.repeat(60))}`);
    console.log(`  Total:     ${chalk.bold(result.totalResults.toString())} CLIs`);
    console.log(`  ✅ Success: ${chalk.green(result.successCount.toString())}`);
    console.log(`  ❌ Failed:  ${chalk.red(result.failedCount.toString())}`);
    console.log(`  ⏱️  Time:    ${chalk.gray(result.totalTime + 'ms')}`);
    console.log(`${chalk.gray('─'.repeat(60))}\n`);
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
