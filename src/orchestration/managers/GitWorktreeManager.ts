/**
 * Git Worktree 管理器
 * 管理 Git Worktree 的创建、合并和清理
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { Worktree, SubTask } from '../types';
import { FILE_PATHS } from '../config';
import { TaskPlanningFilesManager } from './TaskPlanningFiles';

const execPromise = promisify(exec);

export interface WorktreeConfig {
  taskId: string;
  subtaskId: string;
  subtask: SubTask;
  projectPath: string;
}

export interface MergeStrategy {
  type: 'squash' | 'merge' | 'selective';
  message?: string;
  includeFiles?: string[];
}

export interface MergeResult {
  success: boolean;
  mergedFiles?: string[];
  hasConflicts?: boolean;
  conflicts?: string[];
  errorMessage?: string;
}

export interface SyncResult {
  success: boolean;
  syncedFiles?: string[];
  errorMessage?: string;
}

export class GitWorktreeManager {
  private worktreesFile: string = FILE_PATHS.worktreeRegistry;
  private worktrees: Map<string, Map<string, Worktree>> = new Map();
  private planningFilesManager: TaskPlanningFilesManager = new TaskPlanningFilesManager();

  /**
   * 创建新的 worktree
   */
  async createWorktree(config: WorktreeConfig): Promise<Worktree> {
    await this.loadWorktrees();

    // 生成唯一的分支名称
    const branchName = `stigmergy-${config.taskId}-${config.subtaskId}`;
    const worktreePath = path.join(config.projectPath, `.worktrees`, config.subtaskId);

    try {
      // 1. 检查项目路径是否存在
      await fs.access(config.projectPath);

      // 2. 创建 worktree 目录
      await fs.mkdir(worktreePath, { recursive: true });

      // 3. 创建 worktree
      try {
        await execPromise(`git worktree add -b ${branchName} ${worktreePath}`, {
          cwd: config.projectPath
        });
      } catch (error) {
        // 如果 worktree 已存在，尝试删除并重新创建
        try {
          await execPromise(`git worktree remove ${worktreePath}`, {
            cwd: config.projectPath
          });
          await execPromise(`git worktree add -b ${branchName} ${worktreePath}`, {
            cwd: config.projectPath
          });
        } catch (retryError) {
          throw new Error(`Failed to create worktree: ${retryError}`);
        }
      }

      // 4. 创建 worktree 对象
      const worktree: Worktree = {
        taskId: config.taskId,
        subtaskId: config.subtaskId,
        worktreePath,
        branch: branchName,
        createdAt: new Date(),
        status: 'active'
      };

      // 5. 初始化三文件系统
      try {
        await this.planningFilesManager.initializeTask(
          config.taskId,
          config.subtask.description,
          worktreePath
        );
      } catch (planningError) {
        // 如果三文件系统初始化失败，记录错误但不阻止 worktree 创建
        console.error(`Failed to initialize planning files for ${config.subtaskId}:`, planningError);
      }

      // 6. 存储 worktree
      if (!this.worktrees.has(config.taskId)) {
        this.worktrees.set(config.taskId, new Map());
      }
      this.worktrees.get(config.taskId)!.set(config.subtaskId, worktree);

      // 7. 保存到文件
      await this.saveWorktrees();

      return worktree;
    } catch (error) {
      // 清理失败的创建
      try {
        await fs.rm(worktreePath, { recursive: true, force: true });
      } catch (cleanupError) {
        // 忽略清理错误
      }
      throw error;
    }
  }

  /**
   * 获取 worktree
   */
  async getWorktree(taskId: string, subtaskId: string): Promise<Worktree | undefined> {
    await this.loadWorktrees();

    const taskWorktrees = this.worktrees.get(taskId);
    return taskWorktrees?.get(subtaskId);
  }

  /**
   * 获取任务的所有 worktree
   */
  async getAllWorktrees(taskId: string): Promise<Worktree[]> {
    await this.loadWorktrees();

    const taskWorktrees = this.worktrees.get(taskId);
    return taskWorktrees ? Array.from(taskWorktrees.values()) : [];
  }

  /**
   * 合并 worktree
   */
  async mergeWorktree(worktree: Worktree, strategy: MergeStrategy): Promise<MergeResult> {
    await this.loadWorktrees();

    try {
      const projectPath = path.dirname(worktree.worktreePath);

      if (strategy.type === 'squash') {
        return await this.squashMerge(worktree, projectPath, strategy);
      } else if (strategy.type === 'merge') {
        return await this.mergeBranch(worktree, projectPath, strategy);
      } else if (strategy.type === 'selective') {
        return await this.selectiveMerge(worktree, projectPath, strategy);
      } else {
        return {
          success: false,
          errorMessage: `Unknown merge strategy: ${strategy.type}`
        };
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Squash 合并
   */
  private async squashMerge(
    worktree: Worktree,
    projectPath: string,
    strategy: MergeStrategy
  ): Promise<MergeResult> {
    try {
      // 1. 切换到主分支
      await execPromise('git checkout main', { cwd: projectPath });

      // 2. Squash 合并 worktree 分支
      await execPromise(`git merge --squash ${worktree.branch}`, { cwd: projectPath });

      // 3. 提交
      const message = strategy.message || `Merge ${worktree.branch}`;
      await execPromise(`git commit -m "${message}"`, { cwd: projectPath });

      // 4. 获取修改的文件
      const { stdout } = await execPromise('git diff --name-only HEAD~1 HEAD', { cwd: projectPath });
      const mergedFiles = stdout.trim().split('\n').filter(f => f);

      return {
        success: true,
        mergedFiles
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 普通合并
   */
  private async mergeBranch(
    worktree: Worktree,
    projectPath: string,
    strategy: MergeStrategy
  ): Promise<MergeResult> {
    try {
      // 1. 检查 worktree 分支是否存在
      try {
        await execPromise(`git rev-parse --verify ${worktree.branch}`, { cwd: projectPath });
      } catch (error) {
        return {
          success: false,
          errorMessage: `Branch ${worktree.branch} does not exist`
        };
      }

      // 2. 切换到主分支
      await execPromise('git checkout main', { cwd: projectPath });

      // 3. 检查是否有未提交的更改
      try {
        const { stdout } = await execPromise('git status --porcelain', { cwd: projectPath });
        if (stdout.trim()) {
          // 有未提交的更改，暂存它们
          await execPromise('git stash', { cwd: projectPath });
        }
      } catch (error) {
        // 忽略错误
      }

      // 4. 合并 worktree 分支
      try {
        await execPromise(`git merge ${worktree.branch}`, { cwd: projectPath });
      } catch (mergeError) {
        // 合并可能失败，检查是否有冲突
        const { stdout } = await execPromise('git diff --name-only --diff-filter=U', { cwd: projectPath });
        const conflicts = stdout.trim().split('\n').filter(f => f);

        if (conflicts.length > 0) {
          return {
            success: false,
            hasConflicts: true,
            conflicts,
            errorMessage: 'Merge conflicts detected'
          };
        }
        
        throw mergeError;
      }

      // 5. 检查是否有冲突
      const { stdout } = await execPromise('git diff --name-only --diff-filter=U', { cwd: projectPath });
      const conflicts = stdout.trim().split('\n').filter(f => f);

      // 6. 提交合并
      if (conflicts.length === 0) {
        // 检查是否需要提交
        try {
          const { stdout } = await execPromise('git status --porcelain', { cwd: projectPath });
          if (stdout.trim()) {
            const message = strategy.message || `Merge ${worktree.branch}`;
            await execPromise(`git commit -m "${message}"`, { cwd: projectPath });
          }
        } catch (error) {
          // 可能是快进合并，不需要提交
        }
      }

      // 7. 获取修改的文件
      const { stdout: modifiedFiles } = await execPromise('git diff --name-only HEAD~1 HEAD', { cwd: projectPath });
      const mergedFiles = modifiedFiles.trim().split('\n').filter(f => f);

      return {
        success: true,
        mergedFiles,
        hasConflicts: conflicts.length > 0,
        conflicts
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 选择性合并
   */
  private async selectiveMerge(
    worktree: Worktree,
    projectPath: string,
    strategy: MergeStrategy
  ): Promise<MergeResult> {
    try {
      if (!strategy.includeFiles || strategy.includeFiles.length === 0) {
        return {
          success: false,
          errorMessage: 'No files specified for selective merge'
        };
      }

      // 1. 切换到主分支
      await execPromise('git checkout main', { cwd: projectPath });

      // 2. 选择性合并文件
      const mergedFiles: string[] = [];
      for (const file of strategy.includeFiles) {
        try {
          await execPromise(`git checkout ${worktree.branch} -- ${file}`, { cwd: projectPath });
          mergedFiles.push(file);
        } catch (error) {
          // 文件可能不存在，跳过
        }
      }

      // 3. 提交
      if (mergedFiles.length > 0) {
        const message = strategy.message || `Selective merge from ${worktree.branch}`;
        await execPromise(`git add ${mergedFiles.join(' ')}`, { cwd: projectPath });
        await execPromise(`git commit -m "${message}"`, { cwd: projectPath });
      }

      return {
        success: true,
        mergedFiles
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 删除 worktree
   */
  async removeWorktree(taskId: string, subtaskId: string): Promise<void> {
    await this.loadWorktrees();

    const taskWorktrees = this.worktrees.get(taskId);
    if (!taskWorktrees) {
      return;
    }

    const worktree = taskWorktrees.get(subtaskId);
    if (!worktree) {
      return;
    }

    try {
      // 1. 删除 worktree
      const projectPath = path.dirname(worktree.worktreePath);
      await execPromise(`git worktree remove ${worktree.worktreePath}`, {
        cwd: projectPath
      });

      // 2. 删除分支
      await execPromise(`git branch -D ${worktree.branch}`, {
        cwd: projectPath
      });

      // 3. 从内存中删除
      taskWorktrees.delete(subtaskId);

      // 4. 保存到文件
      await this.saveWorktrees();
    } catch (error) {
      // 忽略删除错误
    }
  }

  /**
   * 同步配置文件
   */
  async syncConfiguration(
    taskId: string,
    subtaskId: string,
    configFiles: string[]
  ): Promise<SyncResult> {
    await this.loadWorktrees();

    const worktree = await this.getWorktree(taskId, subtaskId);
    if (!worktree) {
      return {
        success: false,
        errorMessage: 'Worktree not found'
      };
    }

    try {
      // 获取项目路径（worktreePath 的父目录的父目录）
      const projectPath = path.dirname(path.dirname(worktree.worktreePath));
      const syncedFiles: string[] = [];

      for (const configFile of configFiles) {
        try {
          const sourcePath = path.join(projectPath, configFile);
          const destPath = path.join(worktree.worktreePath, configFile);

          // 检查源文件是否存在
          await fs.access(sourcePath);

          // 复制文件
          await fs.copyFile(sourcePath, destPath);
          syncedFiles.push(configFile);
        } catch (error) {
          // 文件不存在或复制失败，跳过
        }
      }

      return {
        success: syncedFiles.length > 0,
        syncedFiles
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 清理任务的所有 worktree
   */
  async cleanup(taskId: string): Promise<void> {
    await this.loadWorktrees();

    const taskWorktrees = this.worktrees.get(taskId);
    if (!taskWorktrees) {
      return;
    }

    // 删除所有 worktree
    for (const [subtaskId] of taskWorktrees) {
      await this.removeWorktree(taskId, subtaskId);
    }

    // 从内存中删除任务
    this.worktrees.delete(taskId);

    // 保存到文件
    await this.saveWorktrees();
  }

  /**
   * 加载 worktree 注册表
   */
  private async loadWorktrees(): Promise<void> {
    try {
      const content = await fs.readFile(this.worktreesFile, 'utf8');
      const data = JSON.parse(content);

      this.worktrees.clear();
      for (const [taskId, worktrees] of Object.entries(data)) {
        this.worktrees.set(taskId, new Map(Object.entries(worktrees as Record<string, Worktree>)));
      }
    } catch (error) {
      // 文件不存在或解析失败，使用空 worktree
      this.worktrees.clear();
    }
  }

  /**
   * 保存 worktree 注册表
   */
  private async saveWorktrees(): Promise<void> {
    const data: Record<string, Record<string, Worktree>> = {};

    for (const [taskId, worktrees] of this.worktrees.entries()) {
      data[taskId] = Object.fromEntries(worktrees);
    }

    // 确保目录存在
    await fs.mkdir(path.dirname(this.worktreesFile), { recursive: true });

    // 保存到文件
    await fs.writeFile(this.worktreesFile, JSON.stringify(data, null, 2));
  }
}
