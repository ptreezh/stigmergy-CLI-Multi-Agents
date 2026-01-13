import { spawn, ChildProcess } from 'child_process';
import { SubTask, Worktree, Terminal, OrchestrationStrategy } from '../types';
import { CLI_PARAM_MAPPINGS } from '../config';

export interface TerminalLaunchResult {
  success: boolean;
  terminalId?: string;
  errorMessage?: string;
}

export interface TerminalStatus {
  terminalId: string;
  subtaskId: string;
  cliName: string;
  status: 'starting' | 'running' | 'completed' | 'failed' | 'crashed';
  pid?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface TerminalResult {
  terminalId: string;
  subtaskId: string;
  success: boolean;
  output: string;
  error?: string;
  duration: number;
}

export class EnhancedTerminalManager {
  private terminals: Map<string, { process: ChildProcess; terminal: Terminal }> = new Map();
  private outputBuffers: Map<string, string> = new Map();

  /**
   * 启动多个终端
   */
  async launchTerminalsForTask(
    task: any,
    strategy: OrchestrationStrategy,
    worktrees: Record<string, Worktree>
  ): Promise<TerminalLaunchResult[]> {
    const results: TerminalLaunchResult[] = [];
    
    // 根据策略确定启动顺序
    if (strategy.mode === 'parallel') {
      // 并行启动所有终端
      const launchPromises = task.subtasks.map((subtask: SubTask) => 
        this.launchTerminalForSubtask(
          subtask,
          worktrees[subtask.id],
          strategy
        )
      );
      
      const launchResults = await Promise.all(launchPromises);
      results.push(...launchResults);
    } else if (strategy.mode === 'sequential') {
      // 串行启动终端
      for (const subtask of task.subtasks) {
        const result = await this.launchTerminalForSubtask(
          subtask,
          worktrees[subtask.id],
          strategy
        );
        results.push(result);
        
        // 等待终端完成
        if (result.success && result.terminalId) {
          await this.waitForTerminal(result.terminalId);
        }
      }
    } else if (strategy.mode === 'hybrid') {
      // 混合模式：按照并行组启动
      for (const group of strategy.parallelGroups || []) {
        const launchPromises = group.tasks.map((subtask: SubTask) => 
          this.launchTerminalForSubtask(
            subtask,
            worktrees[subtask.id],
            strategy
          )
        );
        
        const launchResults = await Promise.all(launchPromises);
        results.push(...launchResults);
        
        // 等待组内所有终端完成
        const terminalIds = launchResults
          .filter(r => r.success && r.terminalId)
          .map(r => r.terminalId!);
        
        await this.waitForAllTerminals(terminalIds);
      }
    }
    
    return results;
  }

  /**
   * 启动单个终端
   */
  async launchTerminalForSubtask(
    subtask: SubTask,
    worktree: Worktree,
    strategy: OrchestrationStrategy
  ): Promise<TerminalLaunchResult> {
    try {
      // 1. 构建 CLI 命令
      const command = this.buildCLICommand(subtask, worktree);
      
      // 2. 启动终端进程
      const childProcess = spawn(command, {
        shell: true,
        cwd: worktree.worktreePath,
        env: {
          ...process.env,
          STIGMERGY_TASK_ID: subtask.taskId,
          STIGMERGY_SUBTASK_ID: subtask.id
        }
      });
      
      // 3. 创建终端对象
      const terminalId = `term-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const terminal: Terminal = {
        id: terminalId,
        subtaskId: subtask.id,
        cliName: subtask.assignedCLI || 'unknown',
        command,
        status: 'starting',
        pid: process.pid,
        createdAt: new Date(),
        output: ''
      };
      
      // 4. 存储终端信息
      this.terminals.set(terminalId, { process: childProcess, terminal });
      this.outputBuffers.set(terminalId, '');
      
      // 5. 设置输出监听
      childProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        this.outputBuffers.set(
          terminalId,
          (this.outputBuffers.get(terminalId) || '') + output
        );
        terminal.output += output;
      });
      
      childProcess.stderr?.on('data', (data: Buffer) => {
        const error = data.toString();
        terminal.error = (terminal.error || '') + error;
      });
      
      // 6. 设置进程退出监听
      childProcess.on('close', (code: number | null) => {
        terminal.status = code === 0 ? 'completed' : 'failed';
        terminal.completedAt = new Date();
      });
      
      childProcess.on('error', (error: Error) => {
        terminal.status = 'crashed';
        terminal.error = error.message;
        terminal.completedAt = new Date();
      });
      
      // 7. 等待进程启动
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 8. 检查进程是否成功启动
      if (childProcess.killed || childProcess.exitCode !== null) {
        return {
          success: false,
          errorMessage: 'Process failed to start'
        };
      }
      
      terminal.status = 'running';
      
      return {
        success: true,
        terminalId
      };
      
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 构建 CLI 命令
   */
  private buildCLICommand(subtask: SubTask, worktree: Worktree): string {
    const cliName = subtask.assignedCLI || 'claude';
    const mappings = CLI_PARAM_MAPPINGS[cliName as keyof typeof CLI_PARAM_MAPPINGS];
    
    if (!mappings) {
      throw new Error(`No CLI mappings found for ${cliName}`);
    }
    
    let command = cliName;
    
    // 添加 agent 参数
    if (subtask.requiredAgent) {
      command += mappings.agent(subtask.requiredAgent);
    }
    
    // 添加 skills 参数
    if (subtask.requiredSkills.length > 0) {
      command += mappings.skills(subtask.requiredSkills);
    }
    
    // 添加 mcp 参数
    if (subtask.mcpTools.length > 0) {
      command += mappings.mcp(subtask.mcpTools);
    }
    
    // 添加 cwd 参数
    command += mappings.cwd(worktree.worktreePath);
    
    return command;
  }

  /**
   * 获取终端状态
   */
  async getTerminalStatus(terminalId: string): Promise<TerminalStatus | null> {
    const terminalInfo = this.terminals.get(terminalId);
    if (!terminalInfo) {
      return null;
    }
    
    const { terminal } = terminalInfo;
    
    return {
      terminalId: terminal.id,
      subtaskId: terminal.subtaskId,
      cliName: terminal.cliName,
      status: terminal.status,
      pid: terminal.pid,
      createdAt: terminal.createdAt,
      completedAt: terminal.completedAt
    };
  }

  /**
   * 等待终端完成
   */
  async waitForTerminal(terminalId: string, timeout: number = 30000): Promise<TerminalResult> {
    const terminalInfo = this.terminals.get(terminalId);
    if (!terminalInfo) {
      throw new Error('Terminal not found');
    }
    
    const { terminal, process: childProcess } = terminalInfo;
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        childProcess.kill();
        resolve({
          terminalId,
          subtaskId: terminal.subtaskId,
          success: false,
          output: terminal.output,
          error: 'Timeout',
          duration: timeout
        });
      }, timeout);
      
      childProcess.on('close', (code: number | null) => {
        clearTimeout(timer);
        resolve({
          terminalId,
          subtaskId: terminal.subtaskId,
          success: code === 0,
          output: terminal.output,
          error: terminal.error,
          duration: terminal.completedAt ? terminal.completedAt.getTime() - terminal.createdAt.getTime() : 0
        });
      });
    });
  }

  /**
   * 等待所有终端完成
   */
  async waitForAllTerminals(terminalIds: string[], timeout: number = 30000): Promise<TerminalResult[]> {
    const promises = terminalIds.map(id => this.waitForTerminal(id, timeout));
    return Promise.all(promises);
  }

  /**
   * 终止终端
   */
  async terminateTerminal(terminalId: string): Promise<void> {
    const terminalInfo = this.terminals.get(terminalId);
    if (!terminalInfo) {
      throw new Error('Terminal not found');
    }
    
    const { process: childProcess, terminal } = terminalInfo;
    childProcess.kill();
    
    terminal.status = 'failed';
    terminal.completedAt = new Date();
  }

  /**
   * 清理所有终端
   */
  async cleanupAll(): Promise<void> {
    for (const [terminalId, { process: childProcess }] of this.terminals.entries()) {
      try {
        if (!childProcess.killed) {
          childProcess.kill();
        }
      } catch (error) {
        // 忽略清理错误
      }
    }
    
    this.terminals.clear();
    this.outputBuffers.clear();
  }
}