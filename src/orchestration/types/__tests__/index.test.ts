import { describe, it, expect } from '@jest/globals';
import {
  Task,
  SubTask,
  TaskType,
  SubTaskType,
  LockState,
  OrchestratedTask,
  OrchestrationStrategy,
  ParallelGroup,
  Dependency,
  CLISelection,
  Worktree,
  StateLock,
  Event,
  EventType,
  Terminal,
  SharedContext
} from '../index';

describe('Core Types', () => {
  describe('Task', () => {
    it('should create a valid task', () => {
      const task: Task = {
        id: 'task-1',
        description: 'Implement feature X',
        type: 'feature',
        complexity: 'medium',
        estimatedDuration: 120,
        dependencies: [],
        createdAt: new Date(),
        status: 'pending'
      };

      expect(task.id).toBe('task-1');
      expect(task.type).toBe('feature');
      expect(task.complexity).toBe('medium');
      expect(task.status).toBe('pending');
    });

    it('should support all task types', () => {
      const taskTypes: TaskType[] = ['feature', 'bug-fix', 'refactoring', 'documentation', 'testing'];
      taskTypes.forEach(type => {
        const task: Task = {
          id: `task-${type}`,
          description: `Test ${type}`,
          type,
          complexity: 'low',
          estimatedDuration: 60,
          dependencies: [],
          createdAt: new Date(),
          status: 'pending'
        };
        expect(task.type).toBe(type);
      });
    });
  });

  describe('SubTask', () => {
    it('should create a valid subtask', () => {
      const subtask: SubTask = {
        id: 'subtask-1',
        taskId: 'task-1',
        description: 'Implement component A',
        type: 'code-generation',
        priority: 'high',
        dependencies: [],
        requiredSkills: ['typescript', 'react'],
        requiredAgent: 'claude',
        mcpTools: [],
        requiredFiles: ['src/components/A.tsx'],
        outputFiles: ['src/components/A.tsx', 'src/components/A.test.tsx'],
        assignedCLI: 'claude',
        status: 'pending',
        createdAt: new Date()
      };

      expect(subtask.id).toBe('subtask-1');
      expect(subtask.type).toBe('code-generation');
      expect(subtask.priority).toBe('high');
      expect(subtask.status).toBe('pending');
    });

    it('should support all subtask types', () => {
      const subtaskTypes: SubTaskType[] = ['code-generation', 'code-review', 'testing', 'documentation', 'configuration'];
      subtaskTypes.forEach(type => {
        const subtask: SubTask = {
          id: `subtask-${type}`,
          taskId: 'task-1',
          description: `Test ${type}`,
          type,
          priority: 'medium',
          dependencies: [],
          requiredSkills: [],
          requiredAgent: null,
          mcpTools: [],
          requiredFiles: [],
          outputFiles: [],
          assignedCLI: null,
          status: 'pending',
          createdAt: new Date()
        };
        expect(subtask.type).toBe(type);
      });
    });

    it('should support all lock states', () => {
      const lockStates: LockState[] = ['pending', 'in-progress', 'completed', 'failed', 'error'];
      lockStates.forEach(status => {
        const subtask: SubTask = {
          id: `subtask-${status}`,
          taskId: 'task-1',
          description: `Test ${status}`,
          type: 'code-generation',
          priority: 'medium',
          dependencies: [],
          requiredSkills: [],
          requiredAgent: null,
          mcpTools: [],
          requiredFiles: [],
          outputFiles: [],
          assignedCLI: null,
          status,
          createdAt: new Date()
        };
        expect(subtask.status).toBe(status);
      });
    });
  });

  describe('OrchestrationStrategy', () => {
    it('should create a parallel strategy', () => {
      const strategy: OrchestrationStrategy = {
        mode: 'parallel',
        concurrencyLimit: 4,
        dependencies: []
      };

      expect(strategy.mode).toBe('parallel');
      expect(strategy.concurrencyLimit).toBe(4);
    });

    it('should create a sequential strategy', () => {
      const strategy: OrchestrationStrategy = {
        mode: 'sequential',
        dependencies: [
          { from: 'subtask-1', to: 'subtask-2', type: 'hard' }
        ]
      };

      expect(strategy.mode).toBe('sequential');
      expect(strategy.dependencies).toHaveLength(1);
    });

    it('should create a hybrid strategy with parallel groups', () => {
      const strategy: OrchestrationStrategy = {
        mode: 'hybrid',
        parallelGroups: [
          {
            groupId: 'group-1',
            tasks: [],
            mode: 'parallel',
            dependencies: []
          }
        ],
        concurrencyLimit: 2,
        dependencies: []
      };

      expect(strategy.mode).toBe('hybrid');
      expect(strategy.parallelGroups).toHaveLength(1);
    });
  });

  describe('Event', () => {
    it('should create a valid event', () => {
      const event: Event = {
        id: 'event-1',
        type: 'task.created',
        timestamp: new Date(),
        source: 'orchestrator',
        data: { taskId: 'task-1' },
        correlationId: 'correlation-1'
      };

      expect(event.id).toBe('event-1');
      expect(event.type).toBe('task.created');
      expect(event.source).toBe('orchestrator');
    });

    it('should support all event types', () => {
      const eventTypes: EventType[] = [
        'task.created', 'task.started', 'task.completed', 'task.failed',
        'task.paused', 'task.resumed',
        'lock.acquired', 'lock.released', 'lock.failed', 'lock.timeout',
        'worktree.created', 'worktree.merged', 'worktree.removed', 'worktree.conflict',
        'terminal.started', 'terminal.completed', 'terminal.failed', 'terminal.crashed',
        'conflict.detected', 'error.occurred'
      ];

      eventTypes.forEach(type => {
        const event: Event = {
          id: `event-${type}`,
          type,
          timestamp: new Date(),
          source: 'test',
          data: {}
        };
        expect(event.type).toBe(type);
      });
    });
  });

  describe('Worktree', () => {
    it('should create a valid worktree', () => {
      const worktree: Worktree = {
        taskId: 'task-1',
        subtaskId: 'subtask-1',
        worktreePath: '/path/to/worktree',
        branch: 'feature/task-1',
        createdAt: new Date(),
        status: 'active'
      };

      expect(worktree.taskId).toBe('task-1');
      expect(worktree.status).toBe('active');
    });
  });

  describe('StateLock', () => {
    it('should create a valid state lock', () => {
      const lock: StateLock = {
        subtaskId: 'subtask-1',
        cliName: 'claude',
        status: 'in-progress',
        acquiredAt: new Date()
      };

      expect(lock.subtaskId).toBe('subtask-1');
      expect(lock.status).toBe('in-progress');
      expect(lock.acquiredAt).toBeDefined();
    });
  });

  describe('Terminal', () => {
    it('should create a valid terminal', () => {
      const terminal: Terminal = {
        id: 'terminal-1',
        subtaskId: 'subtask-1',
        cliName: 'claude',
        command: 'claude --agent oracle',
        status: 'running',
        pid: 12345,
        createdAt: new Date(),
        output: ''
      };

      expect(terminal.id).toBe('terminal-1');
      expect(terminal.cliName).toBe('claude');
      expect(terminal.status).toBe('running');
    });
  });
});