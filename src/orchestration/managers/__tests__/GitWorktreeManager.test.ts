/**
 * Git Worktree 管理器测试
 * 测试 Git Worktree 的创建、管理和合并功能
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { GitWorktreeManager, WorktreeConfig, MergeStrategy } from '../GitWorktreeManager';
import { SubTask } from '../../types';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

describe('GitWorktreeManager', () => {
  let manager: GitWorktreeManager;
  const testProjectPath = path.join(__dirname, '../../../test-worktrees');
  let testTaskId: string;
  let testSubtaskId: string;

  const createMockSubtask = (taskId: string, subtaskId: string): SubTask => ({
    id: subtaskId,
    taskId,
    description: 'Test subtask',
    type: 'code-generation',
    priority: 'high',
    dependencies: [],
    requiredSkills: [],
    requiredAgent: null,
    mcpTools: [],
    requiredFiles: [],
    outputFiles: [],
    assignedCLI: 'claude',
    status: 'pending',
    createdAt: new Date()
  });

  const createMockConfig = (taskId: string, subtaskId: string, subtask: SubTask): WorktreeConfig => ({
    taskId,
    subtaskId,
    subtask,
    projectPath: testProjectPath
  });

  beforeEach(async () => {
    manager = new GitWorktreeManager();
    
    // 生成唯一的 taskId 和 subtaskId
    testTaskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    testSubtaskId = `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 确保测试目录存在
    try {
      await fs.mkdir(testProjectPath, { recursive: true });
    } catch (error) {
      // 目录可能已存在
    }

    // 初始化 Git 仓库
    try {
      await execPromise('git init', { cwd: testProjectPath });
      await execPromise('git config user.email "test@test.com"', { cwd: testProjectPath });
      await execPromise('git config user.name "Test User"', { cwd: testProjectPath });
      await execPromise('git checkout -b main', { cwd: testProjectPath });
      
      // 创建一个初始提交
      const readmePath = path.join(testProjectPath, 'README.md');
      await fs.writeFile(readmePath, '# Test Project');
      await execPromise('git add README.md', { cwd: testProjectPath });
      await execPromise('git commit -m "Initial commit"', { cwd: testProjectPath });
    } catch (error) {
      // Git 仓库可能已存在
    }
  });

  afterEach(async () => {
    // 清理所有 worktree
    try {
      await manager.cleanup(testTaskId);
    } catch (error) {
      // 忽略清理错误
    }

    // 清理测试目录
    try {
      await fs.rm(testProjectPath, { recursive: true, force: true });
    } catch (error) {
      // 目录可能不存在
    }
  });

  describe('createWorktree', () => {
    it('应该创建新的 worktree', async () => {
      const mockSubtask = createMockSubtask(testTaskId, testSubtaskId);
      const mockConfig = createMockConfig(testTaskId, testSubtaskId, mockSubtask);
      
      const worktree = await manager.createWorktree(mockConfig);
      
      expect(worktree).toBeDefined();
      expect(worktree.taskId).toBe(testTaskId);
      expect(worktree.subtaskId).toBe(testSubtaskId);
      expect(worktree.status).toBe('active');
      expect(worktree.worktreePath).toBeDefined();
      expect(worktree.branch).toBeDefined();
    });

    it('应该为每个 worktree 创建唯一的分支', async () => {
      const mockSubtask1 = createMockSubtask(testTaskId, testSubtaskId);
      const mockConfig1 = createMockConfig(testTaskId, testSubtaskId, mockSubtask1);
      
      const subtaskId2 = `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const mockSubtask2 = createMockSubtask(testTaskId, subtaskId2);
      const mockConfig2 = createMockConfig(testTaskId, subtaskId2, mockSubtask2);
      
      const worktree1 = await manager.createWorktree(mockConfig1);
      const worktree2 = await manager.createWorktree(mockConfig2);
      
      expect(worktree1.branch).not.toBe(worktree2.branch);
    });

    it('应该在创建失败时抛出错误', async () => {
      const mockSubtask = createMockSubtask(testTaskId, testSubtaskId);
      // 使用无效的项目路径
      const invalidConfig: WorktreeConfig = {
        ...createMockConfig(testTaskId, testSubtaskId, mockSubtask),
        projectPath: '/nonexistent/path'
      };
      
      await expect(manager.createWorktree(invalidConfig)).rejects.toThrow();
    });
  });

  describe('getWorktree', () => {
    it('应该返回存在的 worktree', async () => {
      const mockSubtask = createMockSubtask(testTaskId, testSubtaskId);
      const mockConfig = createMockConfig(testTaskId, testSubtaskId, mockSubtask);
      
      const created = await manager.createWorktree(mockConfig);
      const retrieved = await manager.getWorktree(testTaskId, testSubtaskId);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.taskId).toBe(testTaskId);
      expect(retrieved?.subtaskId).toBe(testSubtaskId);
    });

    it('应该返回 undefined 对于不存在的 worktree', async () => {
      const retrieved = await manager.getWorktree('nonexistent-task', 'nonexistent-subtask');
      
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllWorktrees', () => {
    it('应该返回所有 worktree', async () => {
      const mockSubtask1 = createMockSubtask(testTaskId, testSubtaskId);
      const mockConfig1 = createMockConfig(testTaskId, testSubtaskId, mockSubtask1);
      
      const subtaskId2 = `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const mockSubtask2 = createMockSubtask(testTaskId, subtaskId2);
      const mockConfig2 = createMockConfig(testTaskId, subtaskId2, mockSubtask2);
      
      await manager.createWorktree(mockConfig1);
      await manager.createWorktree(mockConfig2);
      
      const worktrees = await manager.getAllWorktrees(testTaskId);
      
      expect(worktrees.length).toBeGreaterThanOrEqual(2);
    });

    it('应该返回空数组对于没有 worktree 的任务', async () => {
      const worktrees = await manager.getAllWorktrees('nonexistent-task');
      
      expect(worktrees).toHaveLength(0);
    });
  });

  describe('mergeWorktree', () => {
    it('应该成功合并 worktree', async () => {
      const mockSubtask = createMockSubtask(testTaskId, testSubtaskId);
      const mockConfig = createMockConfig(testTaskId, testSubtaskId, mockSubtask);
      
      const worktree = await manager.createWorktree(mockConfig);
      
      // 在 worktree 中创建一个文件并提交
      const testFilePath = path.join(worktree.worktreePath, 'test.txt');
      await fs.writeFile(testFilePath, 'Test content');
      await execPromise('git add test.txt', { cwd: worktree.worktreePath });
      await execPromise('git commit -m "Test commit"', { cwd: worktree.worktreePath });
      
      const mergeStrategy: MergeStrategy = {
        type: 'squash',
        message: 'Test merge'
      };
      
      const result = await manager.mergeWorktree(worktree, mergeStrategy);
      
      expect(result.success).toBe(true);
      expect(result.mergedFiles).toBeDefined();
    });

    it('应该使用 squash 策略合并', async () => {
      const mockSubtask = createMockSubtask(testTaskId, testSubtaskId);
      const mockConfig = createMockConfig(testTaskId, testSubtaskId, mockSubtask);
      
      const worktree = await manager.createWorktree(mockConfig);
      
      // 在 worktree 中创建一个文件并提交
      const testFilePath = path.join(worktree.worktreePath, 'test.txt');
      await fs.writeFile(testFilePath, 'Test content');
      await execPromise('git add test.txt', { cwd: worktree.worktreePath });
      await execPromise('git commit -m "Test commit"', { cwd: worktree.worktreePath });
      
      const mergeStrategy: MergeStrategy = {
        type: 'squash',
        message: 'Test squash merge'
      };
      
      const result = await manager.mergeWorktree(worktree, mergeStrategy);
      
      expect(result.success).toBe(true);
    });

    it('应该使用 merge 策略合并', async () => {
      const mockSubtask = createMockSubtask(testTaskId, testSubtaskId);
      const mockConfig = createMockConfig(testTaskId, testSubtaskId, mockSubtask);
      
      const worktree = await manager.createWorktree(mockConfig);
      
      // 在 worktree 中创建一个文件并提交
      const testFilePath = path.join(worktree.worktreePath, 'test.txt');
      await fs.writeFile(testFilePath, 'Test content');
      await execPromise('git add test.txt', { cwd: worktree.worktreePath });
      await execPromise('git commit -m "Test commit"', { cwd: worktree.worktreePath });
      
      const mergeStrategy: MergeStrategy = {
        type: 'merge',
        message: 'Test merge'
      };
      
      const result = await manager.mergeWorktree(worktree, mergeStrategy);
      
      expect(result.success).toBe(true);
    });

    it('应该处理合并冲突', async () => {
      const mockSubtask = createMockSubtask(testTaskId, testSubtaskId);
      const mockConfig = createMockConfig(testTaskId, testSubtaskId, mockSubtask);
      
      const worktree = await manager.createWorktree(mockConfig);
      
      // 在 worktree 中创建一个文件并提交
      const testFilePath = path.join(worktree.worktreePath, 'test.txt');
      await fs.writeFile(testFilePath, 'Test content');
      await execPromise('git add test.txt', { cwd: worktree.worktreePath });
      await execPromise('git commit -m "Test commit"', { cwd: worktree.worktreePath });
      
      const mergeStrategy: MergeStrategy = {
        type: 'merge',
        message: 'Test merge with conflicts'
      };
      
      const result = await manager.mergeWorktree(worktree, mergeStrategy);
      
      expect(result).toBeDefined();
      expect(result.hasConflicts).toBeDefined();
    });
  });

  describe('removeWorktree', () => {
    it('应该成功删除 worktree', async () => {
      const mockSubtask = createMockSubtask(testTaskId, testSubtaskId);
      const mockConfig = createMockConfig(testTaskId, testSubtaskId, mockSubtask);
      
      await manager.createWorktree(mockConfig);
      await manager.removeWorktree(testTaskId, testSubtaskId);
      
      const worktree = await manager.getWorktree(testTaskId, testSubtaskId);
      expect(worktree).toBeUndefined();
    });

    it('应该在删除不存在的 worktree 时不报错', async () => {
      await expect(
        manager.removeWorktree('nonexistent-task', 'nonexistent-subtask')
      ).resolves.not.toThrow();
    });
  });

  describe('syncConfiguration', () => {
    it('应该同步配置文件', async () => {
      const mockSubtask = createMockSubtask(testTaskId, testSubtaskId);
      const mockConfig = createMockConfig(testTaskId, testSubtaskId, mockSubtask);
      
      await manager.createWorktree(mockConfig);
      
      // 创建配置文件
      const gitignorePath = path.join(testProjectPath, '.gitignore');
      await fs.writeFile(gitignorePath, 'node_modules\n');
      
      const configFiles = ['.gitignore'];
      const result = await manager.syncConfiguration(testTaskId, testSubtaskId, configFiles);
      
      expect(result.success).toBe(true);
      expect(result.syncedFiles).toBeDefined();
    });

    it('应该处理不存在的配置文件', async () => {
      const mockSubtask = createMockSubtask(testTaskId, testSubtaskId);
      const mockConfig = createMockConfig(testTaskId, testSubtaskId, mockSubtask);
      
      await manager.createWorktree(mockConfig);
      
      const configFiles = ['nonexistent.config'];
      const result = await manager.syncConfiguration(testTaskId, testSubtaskId, configFiles);
      
      expect(result.success).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('应该清理所有 worktree', async () => {
      const mockSubtask1 = createMockSubtask(testTaskId, testSubtaskId);
      const mockConfig1 = createMockConfig(testTaskId, testSubtaskId, mockSubtask1);
      
      const subtaskId2 = `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const mockSubtask2 = createMockSubtask(testTaskId, subtaskId2);
      const mockConfig2 = createMockConfig(testTaskId, subtaskId2, mockSubtask2);
      
      await manager.createWorktree(mockConfig1);
      await manager.createWorktree(mockConfig2);
      
      await manager.cleanup(testTaskId);
      
      const worktrees = await manager.getAllWorktrees(testTaskId);
      expect(worktrees).toHaveLength(0);
    });
  });
});