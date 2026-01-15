/**
 * Task Manager
 * 任务管理器
 * 负责管理任务的生命周期
 */

import { randomUUID } from 'crypto';
import {
  Task,
  TaskFilters,
  TaskResult,
  TaskStatistics,
  TaskStatus,
} from './task-types';

export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private taskCounter: number = 0;

  /**
   * 创建任务
   */
  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    const taskId = `task-${++this.taskCounter}-${randomUUID()}`;

    const newTask: Task = {
      ...task,
      id: taskId,
      createdAt: task.createdAt || new Date(),
      updatedAt: task.updatedAt || new Date(),
    };

    this.tasks.set(taskId, newTask);
    return newTask;
  }

  /**
   * 更新任务
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    const updatedTask: Task = {
      ...task,
      ...updates,
      id: taskId, // 确保 id 不会被覆盖
      updatedAt: new Date(),
    };

    this.tasks.set(taskId, updatedTask);
    return updatedTask;
  }

  /**
   * 获取任务
   */
  async getTask(taskId: string): Promise<Task> {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    this.tasks.delete(taskId);
  }

  /**
   * 列出所有任务
   */
  async listTasks(filters?: TaskFilters): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());

    if (filters) {
      if (filters.status) {
        tasks = tasks.filter(task => task.status === filters.status);
      }
      if (filters.assignedTo) {
        tasks = tasks.filter(task => task.assignedTo === filters.assignedTo);
      }
      if (filters.priority) {
        tasks = tasks.filter(task => task.priority === filters.priority);
      }
      if (filters.type) {
        tasks = tasks.filter(task => task.type === filters.type);
      }
    }

    return tasks;
  }

  /**
   * 分配任务给 CLI
   */
  async assignTask(taskId: string, cliName: string): Promise<Task> {
    const task = await this.getTask(taskId);

    return this.updateTask(taskId, {
      assignedTo: cliName,
    });
  }

  /**
   * 开始任务
   */
  async startTask(taskId: string): Promise<Task> {
    const task = await this.getTask(taskId);

    if (task.status !== 'pending') {
      throw new Error('Task must be in pending status to start');
    }

    return this.updateTask(taskId, {
      status: 'in_progress',
      startedAt: new Date(),
    });
  }

  /**
   * 完成任务
   */
  async completeTask(taskId: string, result?: TaskResult): Promise<Task> {
    const task = await this.getTask(taskId);

    if (task.status !== 'in_progress') {
      throw new Error('Task must be in in_progress status to complete');
    }

    return this.updateTask(taskId, {
      status: 'completed',
      completedAt: new Date(),
      result,
    });
  }

  /**
   * 任务失败
   */
  async failTask(taskId: string, error: Error): Promise<Task> {
    const task = await this.getTask(taskId);

    if (task.status !== 'in_progress') {
      throw new Error('Task must be in in_progress status to fail');
    }

    return this.updateTask(taskId, {
      status: 'failed',
      retryCount: task.retryCount + 1,
      result: {
        success: false,
        message: error.message,
        error,
      },
    });
  }

  /**
   * 添加依赖
   */
  async addDependency(taskId: string, dependsOnTaskId: string): Promise<Task> {
    const task = await this.getTask(taskId);
    const dependsOnTask = await this.getTask(dependsOnTaskId);

    if (task.dependencies.includes(dependsOnTaskId)) {
      return task; // 依赖已存在
    }

    return this.updateTask(taskId, {
      dependencies: [...task.dependencies, dependsOnTaskId],
    });
  }

  /**
   * 移除依赖
   */
  async removeDependency(taskId: string, dependsOnTaskId: string): Promise<Task> {
    const task = await this.getTask(taskId);

    if (!task.dependencies.includes(dependsOnTaskId)) {
      return task; // 依赖不存在
    }

    return this.updateTask(taskId, {
      dependencies: task.dependencies.filter(id => id !== dependsOnTaskId),
    });
  }

  /**
   * 检查依赖是否满足
   */
  async checkDependencies(taskId: string): Promise<boolean> {
    const task = await this.getTask(taskId);

    if (task.dependencies.length === 0) {
      return true; // 没有依赖，可以执行
    }

    // 检查所有依赖任务是否已完成
    for (const depTaskId of task.dependencies) {
      const depTask = await this.getTask(depTaskId);
      if (depTask.status !== 'completed') {
        return false; // 有依赖未完成
      }
    }

    return true; // 所有依赖都已完成
  }

  /**
   * 重试任务
   */
  async retryTask(taskId: string): Promise<Task> {
    const task = await this.getTask(taskId);

    if (!this.canRetry(taskId)) {
      throw new Error('Max retries exceeded');
    }

    return this.updateTask(taskId, {
      status: 'pending',
      startedAt: null,
      completedAt: null,
    });
  }

  /**
   * 检查是否可以重试
   */
  canRetry(taskId: string): boolean {
    const task = this.tasks.get(taskId);

    if (!task) {
      return false;
    }

    return task.retryCount < task.maxRetries;
  }

  /**
   * 获取任务统计信息
   */
  async getStatistics(): Promise<TaskStatistics> {
    const tasks = Array.from(this.tasks.values());

    const stats: TaskStatistics = {
      total: tasks.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      failed: 0,
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      byCLI: {},
    };

    for (const task of tasks) {
      // 统计状态
      switch (task.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'in_progress':
          stats.inProgress++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'failed':
          stats.failed++;
          break;
      }

      // 统计优先级
      switch (task.priority) {
        case 'low':
          stats.byPriority.low++;
          break;
        case 'medium':
          stats.byPriority.medium++;
          break;
        case 'high':
          stats.byPriority.high++;
          break;
        case 'critical':
          stats.byPriority.critical++;
          break;
      }

      // 统计 CLI 分配
      if (task.assignedTo) {
        stats.byCLI[task.assignedTo] = (stats.byCLI[task.assignedTo] || 0) + 1;
      }
    }

    return stats;
  }

  /**
   * 清除所有任务
   */
  async clearAll(): Promise<void> {
    this.tasks.clear();
    this.taskCounter = 0;
  }
}