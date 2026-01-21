import fs from 'fs/promises';
import path from 'path';
import { SubTask, StateLock, LockState } from '../types';
import { FILE_PATHS } from '../config';

export interface LockAcquisitionResult {
  success: boolean;
  errorMessage?: string;
}

export class StateLockManager {
  private locksFile: string = FILE_PATHS.stateLocks;
  private locks: Map<string, Map<string, StateLock>> = new Map();
  private subtasks: Map<string, Map<string, SubTask>> = new Map();

  /**
   * 初始化任务的状态锁
   */
  async initializeTask(taskId: string, subtasks: SubTask[]): Promise<void> {
    const taskLocks: Record<string, StateLock> = {};
    const taskSubtasks: Record<string, SubTask> = {};
    
    for (const subtask of subtasks) {
      taskLocks[subtask.id] = {
        subtaskId: subtask.id,
        cliName: subtask.assignedCLI || 'unknown',
        status: 'pending'
      };
      taskSubtasks[subtask.id] = subtask;
    }
    
    this.locks.set(taskId, new Map(Object.entries(taskLocks)));
    this.subtasks.set(taskId, new Map(Object.entries(taskSubtasks)));
    await this.saveLocks();
  }

  /**
   * 尝试获取锁（原子操作）
   */
  async acquireLock(
    taskId: string,
    subtaskId: string,
    cliName: string
  ): Promise<LockAcquisitionResult> {
    // 1. 加载最新锁状态
    await this.loadLocks();
    
    const taskLocks = this.locks.get(taskId);
    if (!taskLocks) {
      return { success: false, errorMessage: 'Task not found' };
    }
    
    const lock = taskLocks.get(subtaskId);
    if (!lock) {
      return { success: false, errorMessage: 'Subtask not found' };
    }
    
    // 2. 检查锁状态
    if (lock.status === 'in-progress') {
      return { success: false, errorMessage: 'Lock already acquired' };
    }
    
    // 3. 检查依赖
    const subtask = await this.getSubtask(taskId, subtaskId);
    if (!subtask) {
      return { success: false, errorMessage: 'Subtask not found' };
    }
    
    const dependenciesMet = this.checkDependencies(taskId, subtask.dependencies);
    if (!dependenciesMet) {
      return { success: false, errorMessage: 'Dependencies not met' };
    }
    
    // 4. 检查文件锁
    const fileLocks = await this.checkFileLocks(subtask.requiredFiles, taskId);
    if (fileLocks.length > 0) {
      return {
        success: false,
        errorMessage: `Files locked: ${fileLocks.join(', ')}`
      };
    }
    
    // 5. 获取锁
    lock.status = 'in-progress';
    lock.acquiredAt = new Date();
    lock.cliName = cliName;
    
    taskLocks.set(subtaskId, lock);
    this.locks.set(taskId, taskLocks);
    
    await this.saveLocks();
    
    return { success: true };
  }

  /**
   * 释放锁
   */
  async releaseLock(
    taskId: string,
    subtaskId: string,
    result: any
  ): Promise<void> {
    await this.loadLocks();
    
    const taskLocks = this.locks.get(taskId);
    if (!taskLocks) {
      throw new Error('Task not found');
    }
    
    const lock = taskLocks.get(subtaskId);
    if (!lock) {
      throw new Error('Subtask not found');
    }
    
    // 更新锁状态
    lock.status = result.success ? 'completed' : 'failed';
    lock.releasedAt = new Date();
    if (!result.success) {
      lock.errorMessage = result.error;
    }
    
    taskLocks.set(subtaskId, lock);
    this.locks.set(taskId, taskLocks);
    
    await this.saveLocks();
  }

  /**
   * 检查依赖
   */
  private checkDependencies(
    taskId: string,
    dependencies: string[]
  ): boolean {
    if (dependencies.length === 0) {
      return true;
    }
    
    const taskLocks = this.locks.get(taskId);
    if (!taskLocks) {
      return false;
    }
    
    return dependencies.every(depId => {
      const depLock = taskLocks.get(depId);
      return depLock && depLock.status === 'completed';
    });
  }

  /**
   * 检查文件锁
   */
  private async checkFileLocks(
    files: string[],
    currentTaskId: string
  ): Promise<string[]> {
    const lockedFiles: string[] = [];
    
    for (const taskId of this.locks.keys()) {
      if (taskId === currentTaskId) {
        continue;
      }
      
      const taskLocks = this.locks.get(taskId);
      if (!taskLocks) {
        continue;
      }
      
      for (const lock of taskLocks.values()) {
        if (lock.status === 'in-progress') {
          // 检查文件交集
          const subtask = await this.getSubtask(taskId, lock.subtaskId);
          if (subtask) {
            const intersection = subtask.requiredFiles.filter(f => 
              files.includes(f)
            );
            lockedFiles.push(...intersection);
          }
        }
      }
    }
    
    return [...new Set(lockedFiles)];
  }

  /**
   * 获取子任务状态
   */
  async getSubtaskStates(taskId: string): Promise<StateLock[]> {
    await this.loadLocks();
    
    const taskLocks = this.locks.get(taskId);
    if (!taskLocks) {
      return [];
    }
    
    return Array.from(taskLocks.values());
  }

  /**
   * 检测死锁
   */
  async detectDeadlock(): Promise<string | null> {
    // 简化的死锁检测
    // 实际实现应该使用图算法检测循环依赖
    await this.loadLocks();
    
    for (const [taskId, taskLocks] of this.locks.entries()) {
      const inProgressLocks = Array.from(taskLocks.values())
        .filter(lock => lock.status === 'in-progress');
      
      if (inProgressLocks.length > 0) {
        const subtask = await this.getSubtask(taskId, inProgressLocks[0].subtaskId);
        if (subtask && subtask.dependencies.length > 0) {
          // 检查是否存在循环依赖
          for (const depId of subtask.dependencies) {
            const depLock = taskLocks.get(depId);
            if (depLock && depLock.status === 'in-progress') {
              const depSubtask = await this.getSubtask(taskId, depId);
              if (depSubtask && depSubtask.dependencies.includes(subtask.id)) {
                return `Deadlock detected between ${subtask.id} and ${depId}`;
              }
            }
          }
        }
      }
    }
    
    return null;
  }

  /**
   * 强制释放锁
   */
  async forceReleaseLock(taskId: string, subtaskId: string): Promise<void> {
    await this.loadLocks();
    
    const taskLocks = this.locks.get(taskId);
    if (!taskLocks) {
      throw new Error('Task not found');
    }
    
    const lock = taskLocks.get(subtaskId);
    if (!lock) {
      throw new Error('Subtask not found');
    }
    
    lock.status = 'failed';
    lock.releasedAt = new Date();
    lock.errorMessage = 'Force released';
    
    taskLocks.set(subtaskId, lock);
    this.locks.set(taskId, taskLocks);
    
    await this.saveLocks();
  }

  /**
   * 清理任务的所有锁和子任务
   */
  async cleanup(taskId: string): Promise<void> {
    await this.loadLocks();
    
    this.locks.delete(taskId);
    this.subtasks.delete(taskId);
    
    await this.saveLocks();
  }

  /**
   * 加载锁
   */
  private async loadLocks(): Promise<void> {
    try {
      const content = await fs.readFile(this.locksFile, 'utf8');
      const data = JSON.parse(content);
      
      this.locks.clear();
      for (const [taskId, locks] of Object.entries(data)) {
        this.locks.set(taskId, new Map(Object.entries(locks as Record<string, StateLock>)));
      }
    } catch (error) {
      // 文件不存在或解析失败，使用空锁
      this.locks.clear();
    }
  }

  /**
   * 保存锁
   */
  private async saveLocks(): Promise<void> {
    const data: Record<string, Record<string, StateLock>> = {};
    
    for (const [taskId, taskLocks] of this.locks.entries()) {
      data[taskId] = Object.fromEntries(taskLocks);
    }
    
    await fs.mkdir(path.dirname(this.locksFile), { recursive: true });
    await fs.writeFile(this.locksFile, JSON.stringify(data, null, 2));
  }

  /**
   * 获取子任务（辅助方法）
   */
  private async getSubtask(
    taskId: string,
    subtaskId: string
  ): Promise<SubTask | null> {
    const taskSubtasks = this.subtasks.get(taskId);
    if (!taskSubtasks) {
      return null;
    }
    
    return taskSubtasks.get(subtaskId) || null;
  }
}