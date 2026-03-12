/**
 * SoulTaskIntegration - Soul系统与Task API集成
 *
 * 提供统一的Task API集成接口，确保所有Soul操作都通过Task系统进行管理
 */

class SoulTaskIntegration {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.taskContext = options.taskContext || null; // TaskCreate/TaskUpdate函数
    this.cliContext = options.cliContext || null;   // CLI上下文

    // Task映射表 - 记录操作类型到Task的映射
    this.taskMap = new Map();
  }

  /**
   * 设置Task上下文
   */
  setTaskContext(taskContext) {
    this.taskContext = taskContext;
    this.cliContext = taskContext;
  }

  /**
   * 创建Soul任务
   */
  async createTask(subject, description, options = {}) {
    if (!this.enabled || !this.taskContext) {
      console.log(`[SoulTask] Task API not available, skipping task creation`);
      return null;
    }

    try {
      // 检查TaskCreate是否可用
      if (typeof this.taskContext.TaskCreate === 'function') {
        const task = await this.taskContext.TaskCreate({
          subject,
          description,
          activeForm: options.activeForm,
          metadata: {
            soulTask: true,
            ...options.metadata
          }
        });

        // 记录任务映射
        this.taskMap.set(task.id, {
          subject,
          description,
          createdAt: new Date().toISOString()
        });

        console.log(`[SoulTask] Created task: ${task.id} - ${subject}`);
        return task.id;
      }

      // 检查全局TaskCreate是否可用
      if (typeof TaskCreate === 'function') {
        const task = await TaskCreate({
          subject,
          description,
          activeForm: options.activeForm,
          metadata: {
            soulTask: true,
            ...options.metadata
          }
        });

        this.taskMap.set(task.id, {
          subject,
          description,
          createdAt: new Date().toISOString()
        });

        console.log(`[SoulTask] Created task: ${task.id} - ${subject}`);
        return task.id;
      }

      console.log(`[SoulTask] TaskCreate function not found`);
      return null;
    } catch (error) {
      console.warn(`[SoulTask] Failed to create task: ${error.message}`);
      return null;
    }
  }

  /**
   * 更新任务状态
   */
  async updateTask(taskId, updates) {
    if (!taskId || !this.enabled) return;

    try {
      // 尝试使用context中的TaskUpdate
      if (this.taskContext && typeof this.taskContext.TaskUpdate === 'function') {
        await this.taskContext.TaskUpdate(taskId, updates);
        console.log(`[SoulTask] Updated task: ${taskId} - ${updates.status || 'updated'}`);
        return;
      }

      // 尝试使用全局TaskUpdate
      if (typeof TaskUpdate === 'function') {
        await TaskUpdate(taskId, updates);
        console.log(`[SoulTask] Updated task: ${taskId} - ${updates.status || 'updated'}`);
        return;
      }
    } catch (error) {
      console.warn(`[SoulTask] Failed to update task ${taskId}: ${error.message}`);
    }
  }

  /**
   * 完成任务
   */
  async completeTask(taskId, result = null) {
    await this.updateTask(taskId, {
      status: 'completed',
      metadata: result ? { result } : undefined
    });
  }

  /**
   * 标记任务进行中
   */
  async startTask(taskId) {
    await this.updateTask(taskId, {
      status: 'in_progress'
    });
  }

  /**
   * 标记任务失败
   */
  async failTask(taskId, error) {
    await this.updateTask(taskId, {
      status: 'pending', // 失败时重置为pending以便重试
      metadata: {
        error: error.message,
        failedAt: new Date().toISOString()
      }
    });
  }

  /**
   * 包装Soul操作 - 自动创建和更新任务
   */
  async wrapOperation(operationType, operationFn, options = {}) {
    const taskId = await this.createTask(
      options.subject || `Soul ${operationType}`,
      options.description || `执行Soul ${operationType}操作`,
      {
        activeForm: options.activeForm || `执行Soul ${operationType}中`,
        metadata: {
          operationType,
          ...options.metadata
        }
      }
    );

    if (taskId) {
      await this.startTask(taskId);
    }

    try {
      const result = await operationFn();

      if (taskId) {
        await this.completeTask(taskId, result);
      }

      return result;
    } catch (error) {
      if (taskId) {
        await this.failTask(taskId, error);
      }
      throw error;
    }
  }

  /**
   * 批量操作 - 创建父任务和子任务
   */
  async wrapBatchOperation(operationType, operations, options = {}) {
    const parentTaskId = await this.createTask(
      options.subject || `Soul ${operationType} (批量)`,
      options.description || `批量执行${operations.length}个${operationType}操作`,
      {
        activeForm: options.activeForm || `批量执行${operationType}中`,
        metadata: {
          operationType: 'batch',
          childCount: operations.length,
          ...options.metadata
        }
      }
    );

    if (parentTaskId) {
      await this.startTask(parentTaskId);
    }

    const results = [];
    const childTaskIds = [];

    try {
      // 创建子任务
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        const childTaskId = await this.createTask(
          `[${i + 1}/${operations.length}] ${op.subject || operationType}`,
          op.description || `执行子操作 ${i + 1}`,
          {
            activeForm: op.activeForm,
            addBlockedBy: parentTaskId ? [parentTaskId] : undefined,
            metadata: {
              operationType,
              isChild: true,
              parentTaskId,
              ...op.metadata
            }
          }
        );

        childTaskIds.push(childTaskId);
      }

      // 执行子任务
      for (let i = 0; i < operations.length; i++) {
        const childTaskId = childTaskIds[i];
        const op = operations[i];

        if (childTaskId) {
          await this.startTask(childTaskId);
        }

        try {
          const result = await op.fn();
          results.push({ success: true, result });

          if (childTaskId) {
            await this.completeTask(childTaskId, result);
          }
        } catch (error) {
          results.push({ success: false, error: error.message });

          if (childTaskId) {
            await this.failTask(childTaskId, error);
          }
        }
      }

      if (parentTaskId) {
        await this.completeTask(parentTaskId, {
          total: operations.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        });
      }

      return results;
    } catch (error) {
      if (parentTaskId) {
        await this.failTask(parentTaskId, error);
      }
      throw error;
    }
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(taskId) {
    return this.taskMap.get(taskId);
  }

  /**
   * 清理完成的任务
   */
  cleanupCompletedTasks(olderThanHours = 24) {
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000);

    for (const [taskId, info] of this.taskMap.entries()) {
      const createdAt = new Date(info.createdAt).getTime();
      if (createdAt < cutoff) {
        this.taskMap.delete(taskId);
      }
    }
  }
}

module.exports = SoulTaskIntegration;
