/**
 * CentralOrchestrator - 核心编排器
 * 负责任务规划、任务分解、CLI选择、策略确定和结果聚合
 */

import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';

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
}

// 并发执行结果
export interface ConcurrentResult {
  totalResults: number;
  successCount: number;
  failedCount: number;
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

export class CentralOrchestrator extends EventEmitter {
  private cliRegistry: Map<string, CLIConfig>;
  private workDir: string;
  private concurrency: number;
  private taskHistory: Map<string, Task>;

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
   * 并发执行任务
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
      console.log(`\n🤖 Selected CLIs: ${availableCLIs.join(', ')}`);

      // 并发执行
      const promises = availableCLIs.map(cliName =>
        this._executeWithCLI(cliName, task, strategy.timeout)
      );

      const results = await Promise.all(promises);
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

      this.emit('task-complete', { task, result: concurrentResult });

      return concurrentResult;
    } catch (error) {
      this.emit('task-error', { task, error });
      throw error;
    }
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
   * 使用指定的 CLI 执行任务
   */
  private async _executeWithCLI(
    cliName: string,
    task: string,
    timeout: number
  ): Promise<ExecutionResult> {
    const cliConfig = this.cliRegistry.get(cliName);

    if (!cliConfig) {
      throw new Error(`CLI ${cliName} not found in registry`);
    }

    console.log(`\n🚀 Executing with ${cliName}...`);
    console.log(`📋 Task: ${task.substring(0, 100)}...`);

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
        args = ['-p', task, '--dangerously-skip-permissions', '--allowed-tools', 'Bash,Edit,Read,Write,RunCommand,ComputerTools'];
      } else {
        args = ['-p', task];
      }

      // 执行命令（传递 cliName 用于前缀）
      const result = await this._spawnCommand(cliName, cliName, args, timeout);
      const endTime = Date.now();

      console.log(`✅ ${cliName} completed in ${endTime - startTime}ms`);

      return {
        cli: cliName,
        success: true,
        output: result,
        executionTime: endTime - startTime
      };
    } catch (error) {
      const endTime = Date.now();
      console.log(`❌ ${cliName} failed: ${error}`);

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
   * 生成子进程执行命令（实时输出版本）
   */
  private _spawnCommand(
    cliName: string,
    command: string,
    args: string[],
    timeout: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      // 使用 pipe 但添加前缀实时显示
      const childProcess = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        cwd: this.workDir
      });

      // 实时显示输出（带 CLI 名称前缀）
      childProcess.stdout?.on('data', (data) => {
        const text = data.toString();
        output += text;

        // 实时显示，添加前缀
        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            console.log(`[${cliName}] ${line}`);
          }
        });
      });

      childProcess.stderr?.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;

        // 实时显示错误
        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            console.error(`[${cliName}] ERROR: ${line}`);
          }
        });
      });

      // 处理进程退出
      childProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(errorOutput || `Process exited with code ${code}`));
        }
      });

      // 处理错误
      childProcess.on('error', (error) => {
        reject(error);
      });

      // 超时处理
      if (timeout > 0) {
        const timeoutId = setTimeout(() => {
          childProcess.kill();
          reject(new Error(`Command timed out after ${timeout}ms`));
        }, timeout);

        childProcess.on('close', () => {
          clearTimeout(timeoutId);
        });
      }
    });
  }

  /**
   * 获取可用的 CLI 列表
   */
  getAvailableCLIs(): string[] {
    return Array.from(this.cliRegistry.entries())
      .filter(([_, config]) => config.available)
      .map(([name, _]) => name);
  }

  /**
   * 检查 CLI 是否可用
   */
  isCLIAvailable(cliName: string): boolean {
    const cli = this.cliRegistry.get(cliName);
    return cli ? cli.available : false;
  }

  /**
   * 设置 CLI 可用性
   */
  setCLIAvailability(cliName: string, available: boolean): void {
    const cli = this.cliRegistry.get(cliName);
    if (cli) {
      cli.available = available;
    }
  }

  /**
   * 获取并发度
   */
  getConcurrency(): number {
    return this.concurrency;
  }

  /**
   * 设置并发度
   */
  setConcurrency(concurrency: number): void {
    this.concurrency = Math.max(1, concurrency);
  }

  /**
   * 获取工作目录
   */
  getWorkDir(): string {
    return this.workDir;
  }

  /**
   * 设置工作目录
   */
  setWorkDir(workDir: string): void {
    this.workDir = workDir;
  }
}
