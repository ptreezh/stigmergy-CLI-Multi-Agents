import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  TaskPlanningFilesManager, 
  TaskPlanUpdate, 
  Finding, 
  ProgressEntry,
  TaskState 
} from '../TaskPlanningFiles';

describe('TaskPlanningFilesManager', () => {
  let manager: TaskPlanningFilesManager;
  const testTaskId = `task-${Date.now()}`;
  const testDescription = 'Test task description';
  const testWorktreePath = '/test/worktree';

  beforeEach(() => {
    manager = new TaskPlanningFilesManager('.stigmergy/test-planning-files');
  });

  afterEach(async () => {
    // 清理测试文件
    const fs = require('fs/promises');
    const path = require('path');
    const taskDir = path.join('.stigmergy/test-planning-files', testTaskId);
    try {
      await fs.rm(taskDir, { recursive: true, force: true });
    } catch (error) {
      // 忽略清理错误
    }
  });

  describe('initializeTask', () => {
    it('应该初始化任务的三文件系统', async () => {
      const files = await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      expect(files.taskPlan).toContain('task_plan.md');
      expect(files.findings).toContain('findings.md');
      expect(files.progress).toContain('progress.md');
    });

    it('应该创建包含任务描述的任务规划文件', async () => {
      const files = await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const content = await manager.readTaskPlan(testTaskId);
      expect(content).toContain(testDescription);
    });

    it('应该创建包含默认模板的研究发现文件', async () => {
      const files = await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const content = await manager.readFindings(testTaskId);
      expect(content).toContain('# Findings & Decisions');
      expect(content).toContain('## Requirements');
    });

    it('应该创建包含默认模板的进度日志文件', async () => {
      const files = await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const content = await manager.readProgress(testTaskId);
      expect(content).toContain('# Progress Log');
      expect(content).toContain('## Session');
    });
  });

  describe('updateTaskPlan', () => {
    it('应该更新当前阶段', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const update: TaskPlanUpdate = {
        currentPhase: 'Phase 2'
      };
      await manager.updateTaskPlan(testTaskId, update);
      
      const content = await manager.readTaskPlan(testTaskId);
      expect(content).toContain('## Current Phase\nPhase 2');
    });

    it('应该更新阶段状态', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const update: TaskPlanUpdate = {
        phases: [
          {
            name: 'Requirements & Discovery',
            tasks: [],
            status: 'completed'
          }
        ]
      };
      await manager.updateTaskPlan(testTaskId, update);
      
      const content = await manager.readTaskPlan(testTaskId);
      expect(content).toContain('**Status:** completed');
    });

    it('应该添加关键问题', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const update: TaskPlanUpdate = {
        keyQuestions: ['What is the goal?', 'How to implement?']
      };
      await manager.updateTaskPlan(testTaskId, update);
      
      const content = await manager.readTaskPlan(testTaskId);
      expect(content).toContain('What is the goal?');
      expect(content).toContain('How to implement?');
    });

    it('应该添加决策记录', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const update: TaskPlanUpdate = {
        decisions: [
          {
            decision: 'Use TypeScript',
            rationale: 'Type safety is important',
            timestamp: new Date()
          }
        ]
      };
      await manager.updateTaskPlan(testTaskId, update);
      
      const content = await manager.readTaskPlan(testTaskId);
      expect(content).toContain('Use TypeScript');
      expect(content).toContain('Type safety is important');
    });

    it('应该添加错误记录', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const update: TaskPlanUpdate = {
        errors: [
          {
            error: 'Module not found',
            attempt: 1,
            resolution: 'Install dependencies',
            timestamp: new Date()
          }
        ]
      };
      await manager.updateTaskPlan(testTaskId, update);
      
      const content = await manager.readTaskPlan(testTaskId);
      expect(content).toContain('Module not found');
      expect(content).toContain('Install dependencies');
    });
  });

  describe('addFinding', () => {
    it('应该添加研究发现', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const finding: Finding = {
        category: 'requirement',
        content: 'User needs authentication',
        timestamp: new Date()
      };
      await manager.addFinding(testTaskId, finding);
      
      const content = await manager.readFindings(testTaskId);
      expect(content).toContain('User needs authentication');
    });

    it('应该添加多个研究发现', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const finding1: Finding = {
        category: 'research',
        content: 'Found useful library',
        timestamp: new Date()
      };
      
      const finding2: Finding = {
        category: 'decision',
        content: 'Use React framework',
        timestamp: new Date()
      };
      
      await manager.addFinding(testTaskId, finding1);
      await manager.addFinding(testTaskId, finding2);
      
      const content = await manager.readFindings(testTaskId);
      expect(content).toContain('Found useful library');
      expect(content).toContain('Use React framework');
    });
  });

  describe('addProgressEntry', () => {
    it('应该添加进度条目', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const entry: ProgressEntry = {
        phase: 'Phase 1',
        status: 'completed',
        action: 'Completed requirements analysis',
        timestamp: new Date()
      };
      await manager.addProgressEntry(testTaskId, entry);
      
      const content = await manager.readProgress(testTaskId);
      expect(content).toContain('Completed requirements analysis');
    });

    it('应该添加带文件列表的进度条目', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const entry: ProgressEntry = {
        phase: 'Phase 2',
        status: 'in_progress',
        action: 'Created project structure',
        files: ['src/index.ts', 'package.json'],
        timestamp: new Date()
      };
      await manager.addProgressEntry(testTaskId, entry);
      
      const content = await manager.readProgress(testTaskId);
      expect(content).toContain('src/index.ts');
      expect(content).toContain('package.json');
    });
  });

  describe('getTaskState', () => {
    it('应该获取任务状态', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const state = await manager.getTaskState(testTaskId);
      
      expect(state).not.toBeNull();
      expect(state.currentPhase).toBeDefined();
      expect(state.completedPhases).toBeDefined();
      expect(state.findings).toBeDefined();
      expect(state.progress).toBeDefined();
    });

    it('应该返回包含更新后的任务状态', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const update: TaskPlanUpdate = {
        currentPhase: 'Phase 2'
      };
      await manager.updateTaskPlan(testTaskId, update);
      
      const state = await manager.getTaskState(testTaskId);
      expect(state.currentPhase).toBe('Phase 2');
    });
  });

  describe('readTaskPlan', () => {
    it('应该读取任务规划文件', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const content = await manager.readTaskPlan(testTaskId);
      
      expect(content).toContain('# Task Plan');
      expect(content).toContain(testDescription);
    });

    it('应该抛出错误对于不存在的任务', async () => {
      await expect(
        manager.readTaskPlan('non-existent-task')
      ).rejects.toThrow();
    });
  });

  describe('readFindings', () => {
    it('应该读取研究发现文件', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const content = await manager.readFindings(testTaskId);
      
      expect(content).toContain('# Findings & Decisions');
    });

    it('应该抛出错误对于不存在的任务', async () => {
      await expect(
        manager.readFindings('non-existent-task')
      ).rejects.toThrow();
    });
  });

  describe('readProgress', () => {
    it('应该读取进度日志文件', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      const content = await manager.readProgress(testTaskId);
      
      expect(content).toContain('# Progress Log');
    });

    it('应该抛出错误对于不存在的任务', async () => {
      await expect(
        manager.readProgress('non-existent-task')
      ).rejects.toThrow();
    });
  });

  describe('cleanupTask', () => {
    it('应该清理任务文件', async () => {
      await manager.initializeTask(testTaskId, testDescription, testWorktreePath);
      
      await manager.cleanupTask(testTaskId);
      
      await expect(
        manager.readTaskPlan(testTaskId)
      ).rejects.toThrow();
    });

    it('应该忽略清理不存在的任务', async () => {
      await expect(
        manager.cleanupTask('non-existent-task')
      ).resolves.not.toThrow();
    });
  });
});