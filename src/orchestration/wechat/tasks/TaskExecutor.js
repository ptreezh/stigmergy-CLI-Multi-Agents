/**
 * TaskExecutor - 任务执行器
 * 负责在指定CLI上执行任务并返回结果
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TaskExecutor {
  constructor(options = {}) {
    this.options = options;
    this.stigmergyPath = options.stigmergyPath || 'stigmergy';
  }

  /**
   * 执行任务
   */
  async execute(task, targetCLI, message) {
    const startTime = Date.now();

    try {
      console.log(`Executing task on ${targetCLI}:`, task.description);

      // 1. 创建执行上下文
      const context = await this.createContext(task, targetCLI, message);

      // 2. 发送到目标CLI
      const result = await this.sendToCLI(targetCLI, task);

      // 3. 监控执行进度
      const progress = await this.monitorExecution(context.taskId);

      // 4. 收集结果
      const finalResult = await this.collectResult(context.taskId);

      // 5. 格式化响应
      const executionTime = Date.now() - startTime;
      const response = this.formatResponse(finalResult, executionTime);

      return response;

    } catch (error) {
      console.error('Task execution error:', error);
      return this.handleExecutionError(task, targetCLI, error);
    }
  }

  /**
   * 创建执行上下文
   */
  async createContext(task, targetCLI, message) {
    const taskId = this.generateTaskId();

    // 创建临时工作目录
    const workDir = path.join(require('os').tmpdir(), `stigmergy_task_${taskId}`);
    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir, { recursive: true });
    }

    // 保存任务信息
    const taskInfoPath = path.join(workDir, 'task.json');
    fs.writeFileSync(taskInfoPath, JSON.stringify({
      taskId: taskId,
      task: task,
      targetCLI: targetCLI,
      message: message,
      createdAt: Date.now()
    }, null, 2));

    return {
      taskId: taskId,
      workDir: workDir,
      taskInfoPath: taskInfoPath
    };
  }

  /**
   * 发送任务到CLI
   */
  async sendToCLI(cli, task) {
    // 使用stigmergy call机制
    const command = `${this.stigmergyPath} call "${task.description}"`;

    console.log('Executing command:', command);

    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');

      const child = spawn(cmd, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd(),
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            stdout: stdout,
            stderr: stderr
          });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });

      // 设置超时
      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error('Command execution timeout'));
      }, this.options.executionTimeout || 120000); // 默认2分钟

      child.on('close', () => {
        clearTimeout(timeout);
      });
    });
  }

  /**
   * 监控执行进度
   */
  async monitorExecution(taskId) {
    // TODO: 实现实际的进度监控
    // 目前返回模拟进度
    return {
      taskId: taskId,
      status: 'running',
      progress: 50
    };
  }

  /**
   * 收集结果
   */
  async collectResult(taskId) {
    // TODO: 实现实际的结果收集
    // 目前返回模拟结果
    return {
      taskId: taskId,
      success: true,
      output: 'Task completed',
      data: {}
    };
  }

  /**
   * 格式化响应
   */
  formatResponse(result, executionTime) {
    return {
      success: true,
      message: result.output || '任务执行完成',
      data: result.data,
      executionTime: executionTime,
      timestamp: Date.now()
    };
  }

  /**
   * 处理执行错误
   */
  handleExecutionError(task, targetCLI, error) {
    console.error('Execution error for task:', task, 'on CLI:', targetCLI, error);

    return {
      success: false,
      message: `任务执行失败: ${error.message}`,
      error: error.message,
      task: task,
      cli: targetCLI
    };
  }

  /**
   * 生成任务ID
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = TaskExecutor;
