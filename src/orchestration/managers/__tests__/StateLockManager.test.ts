import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { StateLockManager, LockAcquisitionResult } from '../StateLockManager';
import { SubTask } from '../../types';

describe('StateLockManager', () => {
  let manager: StateLockManager;
  let mockTaskId: string;
  let mockSubtasks: SubTask[];

  beforeEach(() => {
    manager = new StateLockManager();
    
    // 为每个测试生成唯一的 taskId
    mockTaskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    mockSubtasks = [
      {
        id: 'subtask-1',
        taskId: mockTaskId,
        description: 'Test subtask 1',
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
      },
      {
        id: 'subtask-2',
        taskId: mockTaskId,
        description: 'Test subtask 2',
        type: 'code-review',
        priority: 'medium',
        dependencies: ['subtask-1'],
        requiredSkills: [],
        requiredAgent: null,
        mcpTools: [],
        requiredFiles: [],
        outputFiles: [],
        assignedCLI: 'gemini',
        status: 'pending',
        createdAt: new Date()
      }
    ];
  });

  beforeEach(async () => {
    await manager.initializeTask(mockTaskId, mockSubtasks);
  });

  afterEach(async () => {
    await manager.cleanup(mockTaskId);
  });

  describe('initializeTask', () => {
    it('should initialize task with subtasks', async () => {
      const states = await manager.getSubtaskStates(mockTaskId);
      expect(states).toHaveLength(2);
      expect(states[0].status).toBe('pending');
      expect(states[1].status).toBe('pending');
    });

    it('should set correct CLI names', async () => {
      const states = await manager.getSubtaskStates(mockTaskId);
      expect(states[0].cliName).toBe('claude');
      expect(states[1].cliName).toBe('gemini');
    });
  });

  describe('acquireLock', () => {
    it('should acquire lock for subtask without dependencies', async () => {
      const result: LockAcquisitionResult = await manager.acquireLock(
        mockTaskId,
        'subtask-1',
        'claude'
      );
      
      expect(result.success).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should not acquire lock for subtask with unmet dependencies', async () => {
      const result: LockAcquisitionResult = await manager.acquireLock(
        mockTaskId,
        'subtask-2',
        'gemini'
      );
      
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Dependencies not met');
    });

    it('should acquire lock for subtask with met dependencies', async () => {
      // 先获取第一个子任务的锁
      await manager.acquireLock(mockTaskId, 'subtask-1', 'claude');
      
      // 释放第一个子任务的锁
      await manager.releaseLock(mockTaskId, 'subtask-1', { success: true });
      
      // 现在应该能获取第二个子任务的锁
      const result: LockAcquisitionResult = await manager.acquireLock(
        mockTaskId,
        'subtask-2',
        'gemini'
      );
      
      expect(result.success).toBe(true);
    });

    it('should not acquire lock if already acquired', async () => {
      // 第一次获取锁
      await manager.acquireLock(mockTaskId, 'subtask-1', 'claude');
      
      // 第二次尝试获取锁
      const result: LockAcquisitionResult = await manager.acquireLock(
        mockTaskId,
        'subtask-1',
        'claude'
      );
      
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Lock already acquired');
    });

    it('should return error for non-existent task', async () => {
      const result: LockAcquisitionResult = await manager.acquireLock(
        'non-existent-task',
        'subtask-1',
        'claude'
      );
      
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Task not found');
    });

    it('should return error for non-existent subtask', async () => {
      const result: LockAcquisitionResult = await manager.acquireLock(
        mockTaskId,
        'non-existent-subtask',
        'claude'
      );
      
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Subtask not found');
    });
  });

  describe('releaseLock', () => {
    it('should release lock and mark as completed', async () => {
      await manager.acquireLock(mockTaskId, 'subtask-1', 'claude');
      await manager.releaseLock(mockTaskId, 'subtask-1', { success: true });
      
      const states = await manager.getSubtaskStates(mockTaskId);
      expect(states[0].status).toBe('completed');
    });

    it('should release lock and mark as failed', async () => {
      await manager.acquireLock(mockTaskId, 'subtask-1', 'claude');
      await manager.releaseLock(mockTaskId, 'subtask-1', { success: false, error: 'Test error' });
      
      const states = await manager.getSubtaskStates(mockTaskId);
      expect(states[0].status).toBe('failed');
      expect(states[0].errorMessage).toBe('Test error');
    });

    it('should set releasedAt timestamp', async () => {
      await manager.acquireLock(mockTaskId, 'subtask-1', 'claude');
      await manager.releaseLock(mockTaskId, 'subtask-1', { success: true });
      
      const states = await manager.getSubtaskStates(mockTaskId);
      expect(states[0].releasedAt).toBeDefined();
    });

    it('should throw error for non-existent task', async () => {
      await expect(
        manager.releaseLock('non-existent-task', 'subtask-1', { success: true })
      ).rejects.toThrow('Task not found');
    });

    it('should throw error for non-existent subtask', async () => {
      await expect(
        manager.releaseLock(mockTaskId, 'non-existent-subtask', { success: true })
      ).rejects.toThrow('Subtask not found');
    });
  });

  describe('getSubtaskStates', () => {
    it('should return all subtask states', async () => {
      const states = await manager.getSubtaskStates(mockTaskId);
      expect(states).toHaveLength(2);
    });

    it('should return empty array for non-existent task', async () => {
      const states = await manager.getSubtaskStates('non-existent-task');
      expect(states).toHaveLength(0);
    });
  });

  describe('forceReleaseLock', () => {
    it('should force release lock', async () => {
      await manager.acquireLock(mockTaskId, 'subtask-1', 'claude');
      await manager.forceReleaseLock(mockTaskId, 'subtask-1');
      
      const states = await manager.getSubtaskStates(mockTaskId);
      expect(states[0].status).toBe('failed');
      expect(states[0].errorMessage).toBe('Force released');
    });
  });

  describe('cleanup', () => {
    it('should remove task locks', async () => {
      await manager.cleanup(mockTaskId);
      
      const states = await manager.getSubtaskStates(mockTaskId);
      expect(states).toHaveLength(0);
    });
  });
});