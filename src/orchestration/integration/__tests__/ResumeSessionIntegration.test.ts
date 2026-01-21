import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { ResumeSessionIntegration, HistoryEvent } from '../ResumeSessionIntegration';
import { OrchestratedTask, SharedContext } from '../../types';

describe('ResumeSessionIntegration', () => {
  let integration: ResumeSessionIntegration;
  const testTaskId = `task-${Date.now()}`;
  const testSubtaskId = `subtask-${Date.now()}`;

  const mockTask: OrchestratedTask = {
    id: testTaskId,
    task: {
      id: testTaskId,
      description: 'Test task',
      type: 'feature',
      complexity: 'medium',
      estimatedDuration: 1000,
      dependencies: [],
      createdAt: new Date(),
      status: 'in-progress'
    },
    subtasks: [],
    strategy: { mode: 'parallel', dependencies: [] },
    createdAt: new Date(),
    status: 'in-progress'
  };

  const mockContext: SharedContext = {
    taskId: testTaskId,
    projectPath: '/test/project',
    taskDescription: 'Test task',
    constraints: [],
    previousResults: new Map(),
    dependencies: [],
    metadata: {}
  };

  beforeAll(async () => {
    integration = new ResumeSessionIntegration();
  });

  beforeEach(async () => {
    await integration.cleanupSession(testTaskId);
  });

  afterEach(async () => {
    await integration.cleanupSession(testTaskId);
  });

  describe('saveTaskState', () => {
    it('应该保存任务状态', async () => {
      await integration.saveTaskState(testTaskId, mockTask);
      
      const restored = await integration.restoreTaskState(testTaskId);
      expect(restored).not.toBeNull();
      expect(restored?.id).toBe(testTaskId);
    });

    it('应该覆盖已保存的任务状态', async () => {
      await integration.saveTaskState(testTaskId, mockTask);
      
      const updatedTask = {
        ...mockTask,
        status: 'completed' as const
      };
      await integration.saveTaskState(testTaskId, updatedTask);
      
      const restored = await integration.restoreTaskState(testTaskId);
      expect(restored?.status).toBe('completed');
    });
  });

  describe('restoreTaskState', () => {
    it('应该恢复保存的任务状态', async () => {
      await integration.saveTaskState(testTaskId, mockTask);
      
      const restored = await integration.restoreTaskState(testTaskId);
      expect(restored).not.toBeNull();
      expect(restored?.id).toBe(testTaskId);
      expect(restored?.task.description).toBe(mockTask.task.description);
    });

    it('应该返回 null 对于不存在的任务', async () => {
      const restored = await integration.restoreTaskState('non-existent-task');
      expect(restored).toBeNull();
    });
  });

  describe('passContextToSubtask', () => {
    it('应该传递上下文到子任务', async () => {
      await integration.passContextToSubtask(testTaskId, testSubtaskId, mockContext);
      
      const collected = await integration.collectSubtaskContext(testTaskId, testSubtaskId);
      expect(collected.taskId).toBe(testTaskId);
      expect(collected.projectPath).toBe(mockContext.projectPath);
    });

    it('应该覆盖已保存的上下文', async () => {
      await integration.passContextToSubtask(testTaskId, testSubtaskId, mockContext);
      
      const updatedContext = {
        ...mockContext,
        taskDescription: 'Updated task'
      };
      await integration.passContextToSubtask(testTaskId, testSubtaskId, updatedContext);
      
      const collected = await integration.collectSubtaskContext(testTaskId, testSubtaskId);
      expect(collected.taskDescription).toBe('Updated task');
    });
  });

  describe('collectSubtaskContext', () => {
    it('应该收集子任务上下文', async () => {
      await integration.passContextToSubtask(testTaskId, testSubtaskId, mockContext);
      
      const collected = await integration.collectSubtaskContext(testTaskId, testSubtaskId);
      expect(collected).not.toBeNull();
      expect(collected.taskId).toBe(testTaskId);
    });

    it('应该抛出错误对于不存在的上下文', async () => {
      await expect(
        integration.collectSubtaskContext(testTaskId, 'non-existent-subtask')
      ).rejects.toThrow();
    });
  });

  describe('recordHistory', () => {
    it('应该记录历史事件', async () => {
      const event: HistoryEvent = {
        id: 'event-1',
        timestamp: new Date(),
        type: 'task.started',
        data: {}
      };
      
      await integration.recordHistory(testTaskId, event);
      
      const history = await integration.queryHistory(testTaskId);
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('event-1');
    });

    it('应该记录多个历史事件', async () => {
      const event1: HistoryEvent = {
        id: 'event-1',
        timestamp: new Date(),
        type: 'task.started',
        data: {}
      };
      
      const event2: HistoryEvent = {
        id: 'event-2',
        timestamp: new Date(),
        type: 'task.completed',
        data: {}
      };
      
      await integration.recordHistory(testTaskId, event1);
      await integration.recordHistory(testTaskId, event2);
      
      const history = await integration.queryHistory(testTaskId);
      expect(history).toHaveLength(2);
    });
  });

  describe('queryHistory', () => {
    it('应该查询历史事件', async () => {
      const event: HistoryEvent = {
        id: 'event-1',
        timestamp: new Date(),
        type: 'task.started',
        data: {}
      };
      
      await integration.recordHistory(testTaskId, event);
      
      const history = await integration.queryHistory(testTaskId);
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('task.started');
    });

    it('应该返回空数组对于没有历史的任务', async () => {
      const history = await integration.queryHistory('non-existent-task');
      expect(history).toHaveLength(0);
    });
  });

  describe('generateResumeCommand', () => {
    it('应该生成恢复命令', async () => {
      await integration.saveTaskState(testTaskId, mockTask);
      
      const command = await integration.generateResumeCommand(testTaskId);
      expect(command).toContain('stigmergy coord resume');
      expect(command).toContain(testTaskId);
    });

    it('应该抛出错误对于不存在的任务', async () => {
      await expect(
        integration.generateResumeCommand('non-existent-task')
      ).rejects.toThrow();
    });
  });

  describe('listResumableTasks', () => {
    it('应该列出可恢复的任务', async () => {
      await integration.saveTaskState(testTaskId, mockTask);
      
      const tasks = await integration.listResumableTasks();
      expect(tasks).toContain(testTaskId);
    });

    it('应该返回空数组当没有可恢复的任务', async () => {
      const tasks = await integration.listResumableTasks();
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('cleanupSession', () => {
    it('应该清理会话', async () => {
      await integration.saveTaskState(testTaskId, mockTask);
      await integration.recordHistory(testTaskId, {
        id: 'event-1',
        timestamp: new Date(),
        type: 'task.started',
        data: {}
      });
      
      await integration.cleanupSession(testTaskId);
      
      const restored = await integration.restoreTaskState(testTaskId);
      expect(restored).toBeNull();
      
      const history = await integration.queryHistory(testTaskId);
      expect(history).toHaveLength(0);
    });

    it('应该忽略清理不存在的会话', async () => {
      await expect(
        integration.cleanupSession('non-existent-task')
      ).resolves.not.toThrow();
    });
  });
});