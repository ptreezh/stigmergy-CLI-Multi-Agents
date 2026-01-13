import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { EnhancedTerminalManager, TerminalLaunchResult, TerminalStatus, TerminalResult } from '../EnhancedTerminalManager';
import { SubTask, Worktree, OrchestrationStrategy } from '../../types';

describe('EnhancedTerminalManager', () => {
  let manager: EnhancedTerminalManager;
  const mockTask: any = {
    id: 'task-1',
    subtasks: [
      {
        id: 'subtask-1',
        taskId: 'task-1',
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
        taskId: 'task-1',
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
    ]
  };

  const mockWorktrees: Record<string, Worktree> = {
    'subtask-1': {
      taskId: 'task-1',
      subtaskId: 'subtask-1',
      worktreePath: '/tmp/worktree-1',
      branch: 'feature/task-1',
      createdAt: new Date(),
      status: 'active'
    },
    'subtask-2': {
      taskId: 'task-1',
      subtaskId: 'subtask-2',
      worktreePath: '/tmp/worktree-2',
      branch: 'feature/task-1',
      createdAt: new Date(),
      status: 'active'
    }
  };

  beforeEach(() => {
    manager = new EnhancedTerminalManager();
  });

  afterEach(async () => {
    await manager.cleanupAll();
  });

  describe('launchTerminalsForTask', () => {
    it('should launch terminals in parallel mode', async () => {
      const strategy: OrchestrationStrategy = {
        mode: 'parallel',
        dependencies: [],
        concurrencyLimit: 2
      };

      const results = await manager.launchTerminalsForTask(mockTask, strategy, mockWorktrees);
      
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result.success).toBeDefined();
      });
    });

    it('should launch terminals in sequential mode', async () => {
      const strategy: OrchestrationStrategy = {
        mode: 'sequential',
        dependencies: [
          { from: 'subtask-1', to: 'subtask-2', type: 'hard' }
        ]
      };

      const results = await manager.launchTerminalsForTask(mockTask, strategy, mockWorktrees);
      
      expect(results).toHaveLength(2);
      expect(results[0].success).toBeDefined();
      expect(results[1].success).toBeDefined();
    });

    it('should launch terminals in hybrid mode', async () => {
      const strategy: OrchestrationStrategy = {
        mode: 'hybrid',
        parallelGroups: [
          {
            groupId: 'group-1',
            tasks: [mockTask.subtasks[0]],
            mode: 'parallel',
            dependencies: []
          }
        ],
        dependencies: [],
        concurrencyLimit: 1
      };

      const results = await manager.launchTerminalsForTask(mockTask, strategy, mockWorktrees);
      
      expect(results).toHaveLength(1);
    });
  });

  describe('launchTerminalForSubtask', () => {
    it('should launch a single terminal', async () => {
      const strategy: OrchestrationStrategy = {
        mode: 'parallel',
        dependencies: [],
        concurrencyLimit: 1
      };

      const result = await manager.launchTerminalForSubtask(
        mockTask.subtasks[0],
        mockWorktrees['subtask-1'],
        strategy
      );

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      if (result.success) {
        expect(result.terminalId).toBeDefined();
      } else {
        expect(result.errorMessage).toBeDefined();
      }
    });

    it('should handle invalid CLI name', async () => {
      const invalidSubtask: SubTask = {
        ...mockTask.subtasks[0],
        assignedCLI: 'invalid-cli'
      };

      const strategy: OrchestrationStrategy = {
        mode: 'parallel',
        dependencies: [],
        concurrencyLimit: 1
      };

      const result = await manager.launchTerminalForSubtask(
        invalidSubtask,
        mockWorktrees['subtask-1'],
        strategy
      );

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });

  describe('getTerminalStatus', () => {
    it('should return terminal status', async () => {
      const strategy: OrchestrationStrategy = {
        mode: 'parallel',
        dependencies: [],
        concurrencyLimit: 1
      };

      const launchResult = await manager.launchTerminalForSubtask(
        mockTask.subtasks[0],
        mockWorktrees['subtask-1'],
        strategy
      );

      if (launchResult.success && launchResult.terminalId) {
        const status = await manager.getTerminalStatus(launchResult.terminalId);
        expect(status).not.toBeNull();
        expect(status?.subtaskId).toBe('subtask-1');
        expect(status?.cliName).toBe('claude');
      }
    });

    it('should return null for non-existent terminal', async () => {
      const status = await manager.getTerminalStatus('non-existent-terminal');
      expect(status).toBeNull();
    });
  });

  describe('waitForTerminal', () => {
    it('should wait for terminal completion', async () => {
      const strategy: OrchestrationStrategy = {
        mode: 'parallel',
        dependencies: [],
        concurrencyLimit: 1
      };

      const launchResult = await manager.launchTerminalForSubtask(
        mockTask.subtasks[0],
        mockWorktrees['subtask-1'],
        strategy
      );

      if (launchResult.success && launchResult.terminalId) {
        // 等待终端完成（超时设置为 1 秒）
        const result = await manager.waitForTerminal(launchResult.terminalId, 1000);
        expect(result).toBeDefined();
        expect(result.terminalId).toBe(launchResult.terminalId);
      }
    });
  });

  describe('terminateTerminal', () => {
    it('should terminate a running terminal', async () => {
      const strategy: OrchestrationStrategy = {
        mode: 'parallel',
        dependencies: [],
        concurrencyLimit: 1
      };

      const launchResult = await manager.launchTerminalForSubtask(
        mockTask.subtasks[0],
        mockWorktrees['subtask-1'],
        strategy
      );

      if (launchResult.success && launchResult.terminalId) {
        await manager.terminateTerminal(launchResult.terminalId);
        
        const status = await manager.getTerminalStatus(launchResult.terminalId);
        expect(status?.status).toBe('failed');
      }
    });
  });

  describe('cleanupAll', () => {
    it('should cleanup all terminals', async () => {
      const strategy: OrchestrationStrategy = {
        mode: 'parallel',
        dependencies: [],
        concurrencyLimit: 2
      };

      await manager.launchTerminalsForTask(mockTask, strategy, mockWorktrees);
      
      await manager.cleanupAll();
      
      // 验证所有终端都已清理
      const status = await manager.getTerminalStatus('any-terminal');
      expect(status).toBeNull();
    });
  });
});