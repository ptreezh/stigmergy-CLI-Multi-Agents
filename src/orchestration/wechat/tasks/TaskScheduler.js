/**
 * TaskScheduler - 任务调度器
 * 负责任务调度、CLI选择和任务分发
 */

const TaskExecutor = require('./TaskExecutor');
const CLICoordinator = require('./CLICoordinator');

class TaskScheduler {
  constructor(options = {}) {
    this.executor = new TaskExecutor(options);
    this.cliCoordinator = new CLICoordinator(options);

    this.taskQueue = [];
    this.runningTasks = new Map();

    this.options = options;
  }

  /**
   * 调度任务
   */
  async schedule(task, message) {
    try {
      console.log('Scheduling task:', task);

      // 1. 任务优先级评估
      const priority = await this.assessPriority(task);

      // 2. CLI选择
      const targetCLI = await this.selectBestCLI(task);

      console.log(`Selected CLI: ${targetCLI} for task: ${task.description}`);

      // 3. 资源检查
      if (!await this.checkAvailability(targetCLI)) {
        console.log(`CLI ${targetCLI} not available, queuing task`);
        return this.queueTask(task, priority);
      }

      // 4. 执行任务
      const result = await this.executeTask(task, targetCLI, message);

      return result;

    } catch (error) {
      console.error('Task scheduling error:', error);
      throw error;
    }
  }

  /**
   * 评估任务优先级
   */
  async assessPriority(task) {
    // 基于任务特征评估优先级
    const priorityFactors = {
      // 用户明确指定CLI = 高优先级
      hasExplicitCLI: task.targetCLI ? 10 : 0,

      // 交互式任务 = 高优先级
      isInteractive: task.interactive ? 5 : 0,

      // 任务复杂度
      complexity: this.estimateComplexity(task),

      // 任务长度
      length: task.description ? task.description.length : 0
    };

    const score = Object.values(priorityFactors).reduce((sum, val) => sum + val, 0);

    // 优先级: 0-20=低, 21-50=中, 51+=高
    if (score >= 50) return 'high';
    if (score >= 20) return 'medium';
    return 'low';
  }

  /**
   * 估算任务复杂度
   */
  estimateComplexity(task) {
    const description = task.description || '';

    // 简单任务特征
    if (description.length < 50) return 1;

    // 复杂任务特征
    const complexKeywords = ['实现', '开发', '设计', '架构', '系统', '框架'];
    const hasComplexKeyword = complexKeywords.some(kw => description.includes(kw));

    if (hasComplexKeyword) return 10;

    // 中等复杂度
    return 5;
  }

  /**
   * 选择最佳CLI
   */
  async selectBestCLI(task) {
    // 如果任务指定了CLI，直接使用
    if (task.targetCLI) {
      return task.targetCLI;
    }

    // 使用CLI协调器选择最佳CLI
    return await this.cliCoordinator.selectBestCLI(task);
  }

  /**
   * 检查CLI可用性
   */
  async checkAvailability(cliName) {
    // TODO: 实现实际的可用性检查
    // 目前简单返回true
    return true;
  }

  /**
   * 将任务加入队列
   */
  async queueTask(task, priority) {
    const queuedTask = {
      id: this.generateTaskId(),
      task: task,
      priority: priority,
      queuedAt: Date.now()
    };

    // 按优先级插入队列
    this.taskQueue.push(queuedTask);
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return {
      success: true,
      type: 'queued',
      message: `任务已加入队列（优先级: ${priority}）`,
      data: {
        taskId: queuedTask.id,
        priority: priority,
        queuePosition: this.taskQueue.indexOf(queuedTask) + 1
      }
    };
  }

  /**
   * 执行任务
   */
  async executeTask(task, targetCLI, message) {
    const taskId = this.generateTaskId();

    try {
      console.log(`Executing task ${taskId} on ${targetCLI}`);

      // 标记任务为运行中
      this.runningTasks.set(taskId, {
        task: task,
        cli: targetCLI,
        startedAt: Date.now()
      });

      // 执行任务
      const result = await this.executor.execute(task, targetCLI, message);

      // 移除运行中的任务
      this.runningTasks.delete(taskId);

      return {
        success: true,
        type: 'task',
        task: task.description,
        content: result.message || result.content,
        data: result.data,
        executionTime: result.executionTime,
        taskId: taskId
      };

    } catch (error) {
      // 移除运行中的任务
      this.runningTasks.delete(taskId);

      throw error;
    }
  }

  /**
   * 处理队列中的任务
   */
  async processQueue() {
    if (this.taskQueue.length === 0) {
      return;
    }

    const queuedTask = this.taskQueue.shift();

    try {
      const result = await this.executeTask(
        queuedTask.task,
        await this.selectBestCLI(queuedTask.task),
        {}
      );

      return result;
    } catch (error) {
      console.error('Queue processing error:', error);
      throw error;
    }
  }

  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return {
      queued: this.taskQueue.length,
      running: this.runningTasks.size,
      queuedTasks: this.taskQueue.map(t => ({
        id: t.id,
        priority: t.priority,
        description: t.task.description
      })),
      runningTasks: Array.from(this.runningTasks.entries()).map(([id, info]) => ({
        id: id,
        cli: info.cli,
        description: info.task.description,
        runtime: Date.now() - info.startedAt
      }))
    };
  }

  /**
   * 生成任务ID
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = TaskScheduler;
