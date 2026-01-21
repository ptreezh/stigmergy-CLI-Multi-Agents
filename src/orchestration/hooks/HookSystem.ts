/**
 * Hook 系统
 * 管理各 CLI 的协调 Hook 安装和执行
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface HookStatus {
  cliName: string;
  hooks: {
    taskDetection: boolean;
    lockAcquisition: boolean;
    lockRelease: boolean;
    conflictDetection: boolean;
  };
}

export interface HookContext {
  input?: string;
  metadata?: any;
  taskId?: string;
  subtaskId?: string;
  result?: any;
}

export interface HookResult {
  matched?: boolean;
  taskId?: string;
  subtaskId?: string;
  success?: boolean;
  errorMessage?: string;
}

export class HookSystem {
  /**
   * 为 CLI 安装协调 Hook
   */
  async installCoordinationHooks(cliName: string, hooksDir: string): Promise<void> {
    // 1. 创建 Hook 目录
    await fs.mkdir(hooksDir, { recursive: true });

    // 2. 安装各个 Hook
    await this.installTaskDetectionHook(cliName, hooksDir);
    await this.installLockAcquisitionHook(cliName, hooksDir);
    await this.installLockReleaseHook(cliName, hooksDir);
    await this.installConflictDetectionHook(cliName, hooksDir);
  }

  /**
   * 安装任务检测 Hook
   */
  private async installTaskDetectionHook(cliName: string, hooksDir: string): Promise<void> {
    const hookContent = this.generateTaskDetectionHook(cliName);
    const hookFile = path.join(hooksDir, 'task-detection.js');
    
    await fs.writeFile(hookFile, hookContent, 'utf8');
  }

  /**
   * 安装锁获取 Hook
   */
  private async installLockAcquisitionHook(cliName: string, hooksDir: string): Promise<void> {
    const hookContent = this.generateLockAcquisitionHook(cliName);
    const hookFile = path.join(hooksDir, 'lock-acquisition.js');
    
    await fs.writeFile(hookFile, hookContent, 'utf8');
  }

  /**
   * 安装锁释放 Hook
   */
  private async installLockReleaseHook(cliName: string, hooksDir: string): Promise<void> {
    const hookContent = this.generateLockReleaseHook(cliName);
    const hookFile = path.join(hooksDir, 'lock-release.js');
    
    await fs.writeFile(hookFile, hookContent, 'utf8');
  }

  /**
   * 安装冲突检测 Hook
   */
  private async installConflictDetectionHook(cliName: string, hooksDir: string): Promise<void> {
    const hookContent = this.generateConflictDetectionHook(cliName);
    const hookFile = path.join(hooksDir, 'conflict-detection.js');
    
    await fs.writeFile(hookFile, hookContent, 'utf8');
  }

  /**
   * 生成任务检测 Hook
   */
  private generateTaskDetectionHook(cliName: string): string {
    return `
// Task Detection Hook for ${cliName}
// Automatically detects and matches tasks

module.exports = async (context) => {
  const { input, metadata } = context;
  
  // 读取协调上下文
  const coordinationContext = await loadCoordinationContext();
  
  // 检查是否是编排任务
  if (coordinationContext && coordinationContext.taskId) {
    return {
      matched: true,
      taskId: coordinationContext.taskId,
      subtaskId: coordinationContext.subtaskId
    };
  }
  
  return { matched: false };
};

async function loadCoordinationContext() {
  const fs = require('fs');
  const path = require('path');
  const coordinationFile = path.join(process.cwd(), '.stigmergy', 'coordination', 'shared-context.json');
  
  try {
    const content = await fs.promises.readFile(coordinationFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}
`;
  }

  /**
   * 生成锁获取 Hook
   */
  private generateLockAcquisitionHook(cliName: string): string {
    return `
// Lock Acquisition Hook for ${cliName}
// Atomically acquires lock before task execution

module.exports = async (context) => {
  const { taskId, subtaskId } = context;
  
  // 调用状态锁管理器
  const result = await acquireLock(taskId, subtaskId, '${cliName}');
  
  if (!result.success) {
    throw new Error(\`Failed to acquire lock: \${result.errorMessage}\`);
  }
  
  return { success: true };
};

async function acquireLock(taskId, subtaskId, cliName) {
  const fs = require('fs');
  const path = require('path');
  const locksFile = path.join(process.cwd(), '.stigmergy', 'coordination', 'state-locks.json');
  
  // 实现原子锁操作
  // 这里需要调用 StateLockManager 的方法
  return { success: true };
}
`;
  }

  /**
   * 生成锁释放 Hook
   */
  private generateLockReleaseHook(cliName: string): string {
    return `
// Lock Release Hook for ${cliName}
// Releases lock after task completion

module.exports = async (context) => {
  const { taskId, subtaskId, result } = context;
  
  // 调用状态锁管理器
  await releaseLock(taskId, subtaskId, result);
  
  return { success: true };
};

async function releaseLock(taskId, subtaskId, result) {
  const fs = require('fs');
  const path = require('path');
  const locksFile = path.join(process.cwd(), '.stigmergy', 'coordination', 'state-locks.json');
  
  // 实现锁释放操作
  // 这里需要调用 StateLockManager 的方法
}
`;
  }

  /**
   * 生成冲突检测 Hook
   */
  private generateConflictDetectionHook(cliName: string): string {
    return `
// Conflict Detection Hook for ${cliName}
// Detects file conflicts before task execution

module.exports = async (context) => {
  const { taskId, subtaskId } = context;
  
  // 检测冲突
  const conflicts = await detectConflicts(taskId, subtaskId);
  
  if (conflicts.length > 0) {
    return {
      hasConflicts: true,
      conflicts,
      modifiedFiles: conflicts.map(c => c.file)
    };
  }
  
  return { hasConflicts: false };
};

async function detectConflicts(taskId, subtaskId) {
  const fs = require('fs');
  const path = require('path');
  const locksFile = path.join(process.cwd(), '.stigmergy', 'coordination', 'state-locks.json');
  
  // 实现冲突检测逻辑
  return [];
}
`;
  }

  /**
   * 检查 Hook 状态
   */
  async checkHookStatus(cliName: string, hooksDir: string): Promise<HookStatus> {
    const status: HookStatus = {
      cliName,
      hooks: {
        taskDetection: false,
        lockAcquisition: false,
        lockRelease: false,
        conflictDetection: false
      }
    };

    try {
      const files = await fs.readdir(hooksDir);
      
      status.hooks.taskDetection = files.includes('task-detection.js');
      status.hooks.lockAcquisition = files.includes('lock-acquisition.js');
      status.hooks.lockRelease = files.includes('lock-release.js');
      status.hooks.conflictDetection = files.includes('conflict-detection.js');
    } catch (error) {
      // 目录不存在，所有 Hook 状态为 false
    }

    return status;
  }

  /**
   * 删除所有 Hook
   */
  async removeHooks(cliName: string, hooksDir: string): Promise<void> {
    try {
      const files = await fs.readdir(hooksDir);
      
      for (const file of files) {
        const filePath = path.join(hooksDir, file);
        await fs.unlink(filePath);
      }
    } catch (error) {
      // 目录不存在或删除失败，忽略错误
    }
  }

  /**
   * 执行 Hook
   */
  async executeHook(
    cliName: string,
    hooksDir: string,
    hookName: string,
    context: HookContext
  ): Promise<HookResult> {
    const hookFile = path.join(hooksDir, `${hookName}.js`);
    
    try {
      // 动态加载 Hook 模块
      const hookModule = require(hookFile);
      
      // 执行 Hook
      const result = await hookModule(context);
      
      return result;
    } catch (error) {
      throw new Error(
        `Failed to execute hook ${hookName} for ${cliName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
