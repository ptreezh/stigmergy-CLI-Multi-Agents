/**
 * 编排系统集成测试
 * 测试各个组件之间的协作
 */

import { EventBus } from '../events/EventBus';
import { StateLockManager } from '../managers/StateLockManager';
import { EnhancedTerminalManager } from '../managers/EnhancedTerminalManager';
import { ResultAggregator } from '../managers/ResultAggregator';
import { Task, SubTask, Worktree, OrchestrationStrategy, EventType } from '../types';

describe('Orchestration Integration Tests', () => {
  let eventBus: EventBus;
  let lockManager: StateLockManager;
  let terminalManager: EnhancedTerminalManager;
  let aggregator: ResultAggregator;

  beforeEach(() => {
    eventBus = new EventBus();
    lockManager = new StateLockManager();
    terminalManager = new EnhancedTerminalManager();
    aggregator = new ResultAggregator();
  });

  describe('端到端工作流', () => {
    it('应该完整执行简单任务', async () => {
      // 创建任务
      const task: Task = {
        id: 'task-1',
        description: '测试任务',
        type: 'feature',
        complexity: 'low',
        estimatedDuration: 1000,
        dependencies: [],
        createdAt: new Date(),
        status: 'pending'
      };

      // 创建子任务
      const subtask: SubTask = {
        id: 'subtask-1',
        taskId: task.id,
        description: '测试子任务',
        type: 'code-generation',
        priority: 'medium',
        dependencies: [],
        requiredSkills: [],
        requiredAgent: null,
        mcpTools: [],
        requiredFiles: [],
        outputFiles: [],
        assignedCLI: 'claude',
        status: 'pending',
        createdAt: new Date()
      };

      // 初始化任务
      await lockManager.initializeTask(task.id, [subtask]);

      // 发布任务创建事件
      await eventBus.publish({
        id: 'event-1',
        type: 'task.created',
        timestamp: new Date(),
        source: 'test',
        data: { task }
      });

      // 获取锁
      const lockResult = await lockManager.acquireLock(
        task.id,
        subtask.id,
        subtask.assignedCLI!
      );

      expect(lockResult.success).toBe(true);

      // 释放锁
      await lockManager.releaseLock(task.id, subtask.id, { success: true });
    });

    it('应该处理多个子任务的并发执行', async () => {
      const task: Task = {
        id: 'task-2',
        description: '并发测试任务',
        type: 'feature',
        complexity: 'medium',
        estimatedDuration: 2000,
        dependencies: [],
        createdAt: new Date(),
        status: 'pending'
      };

      // 创建多个子任务
      const subtasks: SubTask[] = [
        {
          id: 'subtask-1',
          taskId: task.id,
          description: '子任务1',
          type: 'code-generation',
          priority: 'medium',
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
          taskId: task.id,
          description: '子任务2',
          type: 'code-generation',
          priority: 'medium',
          dependencies: [],
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

      // 初始化任务
      await lockManager.initializeTask(task.id, subtasks);

      // 并发获取锁
      const lockResults = await Promise.all(
        subtasks.map(subtask =>
          lockManager.acquireLock(task.id, subtask.id, subtask.assignedCLI!)
        )
      );

      expect(lockResults.every(r => r.success)).toBe(true);

      // 释放所有锁
      await Promise.all(
        subtasks.map((subtask) =>
          lockManager.releaseLock(task.id, subtask.id, { success: true })
        )
      );
    });

    it('应该检测和处理文件冲突', async () => {
      // 创建模拟结果
      const results = [
        {
          terminalId: 'term-1',
          subtaskId: 'subtask-1',
          success: true,
          output: 'Modified: src/app.ts, src/utils.ts',
          duration: 1000
        },
        {
          terminalId: 'term-2',
          subtaskId: 'subtask-2',
          success: true,
          output: 'Modified: src/app.ts, src/utils.ts',
          duration: 1000
        }
      ];

      // 收集结果
      aggregator.collectResults(results);

      // 生成摘要
      const summary = aggregator.generateSummary();
      expect(summary.totalTasks).toBe(2);
      expect(summary.successfulTasks).toBe(2);

      // 检测冲突
      const conflicts = aggregator.detectConflicts();
      expect(conflicts.hasConflicts).toBe(true);
      expect(conflicts.conflicts.length).toBe(2);

      // 获取建议
      const recommendations = aggregator.generateRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].type).toBe('manual-review');
    });

    it('应该处理依赖关系', async () => {
      const task: Task = {
        id: 'task-3',
        description: '依赖测试任务',
        type: 'feature',
        complexity: 'high',
        estimatedDuration: 3000,
        dependencies: [],
        createdAt: new Date(),
        status: 'pending'
      };

      // 创建有依赖关系的子任务
      const subtask1: SubTask = {
        id: 'subtask-1',
        taskId: task.id,
        description: '基础子任务',
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
      };

      const subtask2: SubTask = {
        id: 'subtask-2',
        taskId: task.id,
        description: '依赖子任务',
        type: 'code-generation',
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
      };

      // 初始化任务
      await lockManager.initializeTask(task.id, [subtask1, subtask2]);

      // 尝试获取依赖子任务的锁（应该失败，因为依赖未完成）
      const lockResult2 = await lockManager.acquireLock(
        task.id,
        subtask2.id,
        subtask2.assignedCLI!
      );

      expect(lockResult2.success).toBe(false);

      // 获取基础子任务的锁
      const lockResult1 = await lockManager.acquireLock(
        task.id,
        subtask1.id,
        subtask1.assignedCLI!
      );

      expect(lockResult1.success).toBe(true);

      // 释放锁
      await lockManager.releaseLock(task.id, subtask1.id, { success: true });
    });

    it('应该正确传播事件', async () => {
      const events: any[] = [];

      // 订阅事件
      eventBus.subscribe('task.created', (event) => {
        events.push(event);
      });

      eventBus.subscribe('terminal.started', (event) => {
        events.push(event);
      });

      eventBus.subscribe('terminal.completed', (event) => {
        events.push(event);
      });

      // 发布事件
      await eventBus.publish({
        id: 'event-1',
        type: 'task.created',
        timestamp: new Date(),
        source: 'test',
        data: {}
      });

      await eventBus.publish({
        id: 'event-2',
        type: 'terminal.started',
        timestamp: new Date(),
        source: 'test',
        data: {}
      });

      await eventBus.publish({
        id: 'event-3',
        type: 'terminal.completed',
        timestamp: new Date(),
        source: 'test',
        data: {}
      });

      // 验证事件
      expect(events.length).toBe(3);
      expect(events[0].type).toBe('task.created');
      expect(events[1].type).toBe('terminal.started');
      expect(events[2].type).toBe('terminal.completed');
    });
  });

  describe('错误处理', () => {
    it('应该处理锁获取失败', async () => {
      const task: Task = {
        id: 'task-error-1',
        description: '错误测试任务',
        type: 'feature',
        complexity: 'low',
        estimatedDuration: 1000,
        dependencies: [],
        createdAt: new Date(),
        status: 'pending'
      };

      const subtask: SubTask = {
        id: 'subtask-error-1',
        taskId: task.id,
        description: '错误子任务',
        type: 'code-generation',
        priority: 'medium',
        dependencies: [],
        requiredSkills: [],
        requiredAgent: null,
        mcpTools: [],
        requiredFiles: [],
        outputFiles: [],
        assignedCLI: 'claude',
        status: 'pending',
        createdAt: new Date()
      };

      // 初始化任务
      await lockManager.initializeTask(task.id, [subtask]);

      // 获取锁
      const lockResult1 = await lockManager.acquireLock(
        task.id,
        subtask.id,
        subtask.assignedCLI!
      );

      expect(lockResult1.success).toBe(true);

      // 尝试再次获取锁（应该失败）
      const lockResult2 = await lockManager.acquireLock(
        task.id,
        subtask.id,
        subtask.assignedCLI!
      );

      expect(lockResult2.success).toBe(false);

      // 释放锁
      await lockManager.releaseLock(task.id, subtask.id, { success: true });
    });

    it('应该处理空结果', () => {
      const summary = aggregator.generateSummary();
      expect(summary.totalTasks).toBe(0);
      expect(summary.successfulTasks).toBe(0);
      expect(summary.failedTasks).toBe(0);

      const conflicts = aggregator.detectConflicts();
      expect(conflicts.hasConflicts).toBe(false);
      expect(conflicts.conflicts.length).toBe(0);
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大量并发锁请求', async () => {
      const task: Task = {
        id: 'task-perf-1',
        description: '性能测试任务',
        type: 'feature',
        complexity: 'high',
        estimatedDuration: 5000,
        dependencies: [],
        createdAt: new Date(),
        status: 'pending'
      };

      const subtasks: SubTask[] = Array.from({ length: 100 }, (_, i) => ({
        id: `subtask-${i}`,
        taskId: task.id,
        description: `子任务${i}`,
        type: 'code-generation',
        priority: 'medium',
        dependencies: [],
        requiredSkills: [],
        requiredAgent: null,
        mcpTools: [],
        requiredFiles: [],
        outputFiles: [],
        assignedCLI: 'claude',
        status: 'pending',
        createdAt: new Date()
      }));

      // 初始化任务
      await lockManager.initializeTask(task.id, subtasks);

      const startTime = Date.now();

      // 并发获取锁
      const lockResults = await Promise.all(
        subtasks.map(subtask =>
          lockManager.acquireLock(task.id, subtask.id, subtask.assignedCLI!)
        )
      );

      const lockTime = Date.now() - startTime;

      expect(lockResults.every(r => r.success)).toBe(true);
      expect(lockTime).toBeLessThan(5000); // 应该在5秒内完成

      // 释放所有锁
      await Promise.all(
        subtasks.map((subtask) =>
          lockManager.releaseLock(task.id, subtask.id, { success: true })
        )
      );
    });

    it('应该高效处理大量事件', async () => {
      let eventCount = 0;

      eventBus.subscribe('lock.acquired', () => {
        eventCount++;
      });

      const startTime = Date.now();

      // 发布1000个事件
      await Promise.all(
        Array.from({ length: 1000 }, (_, i) =>
          eventBus.publish({
            id: `event-${i}`,
            type: 'lock.acquired',
            timestamp: new Date(),
            source: 'test',
            data: {}
          })
        )
      );

      const eventTime = Date.now() - startTime;

      expect(eventCount).toBe(1000);
      expect(eventTime).toBeLessThan(2000); // 应该在2秒内完成
    });
  });
});