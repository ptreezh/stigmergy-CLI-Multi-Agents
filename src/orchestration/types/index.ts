// 任务类型
export type TaskType = 'feature' | 'bug-fix' | 'refactoring' | 'documentation' | 'testing';

// 子任务类型
export type SubTaskType = 'code-generation' | 'code-review' | 'testing' | 'documentation' | 'configuration';

// 锁状态
export type LockState = 'pending' | 'in-progress' | 'completed' | 'failed' | 'error';

// 任务接口
export interface Task {
  id: string;
  description: string;
  type: TaskType;
  complexity: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  dependencies: string[];
  createdAt: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

// 子任务接口
export interface SubTask {
  id: string;
  taskId: string;
  description: string;
  type: SubTaskType;
  priority: 'high' | 'medium' | 'low';
  dependencies: string[];
  requiredSkills: string[];
  requiredAgent: string | null;
  mcpTools: string[];
  requiredFiles: string[];
  outputFiles: string[];
  assignedCLI: string | null;
  status: LockState;
  createdAt: Date;
  completedAt?: Date;
}

// 编排任务接口
export interface OrchestratedTask {
  id: string;
  task: Task;
  subtasks: SubTask[];
  strategy: OrchestrationStrategy;
  createdAt: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

// 编排策略接口
export interface OrchestrationStrategy {
  mode: 'parallel' | 'sequential' | 'hybrid';
  parallelGroups?: ParallelGroup[];
  dependencies: Dependency[];
  concurrencyLimit?: number;
}

// 并行组接口
export interface ParallelGroup {
  groupId: string;
  tasks: SubTask[];
  mode: 'parallel';
  dependencies: Dependency[];
}

// 依赖关系接口
export interface Dependency {
  from: string;
  to: string;
  type: 'hard' | 'soft';
}

// CLI 选择接口
export interface CLISelection {
  cliName: string;
  agent: string;
  skills: string[];
  mcpTools: string[];
  confidence: number;
}

// Worktree 接口
export interface Worktree {
  taskId: string;
  subtaskId: string;
  worktreePath: string;
  branch: string;
  createdAt: Date;
  status: 'active' | 'merged' | 'removed';
}

// 状态锁接口
export interface StateLock {
  subtaskId: string;
  cliName: string;
  status: LockState;
  acquiredAt?: Date;
  releasedAt?: Date;
  errorMessage?: string;
}

// 事件接口
export interface Event {
  id: string;
  type: EventType;
  timestamp: Date;
  source: string;
  data: any;
  correlationId?: string;
}

// 事件类型
export type EventType = 
  | 'task.created'
  | 'task.started'
  | 'task.completed'
  | 'task.failed'
  | 'task.paused'
  | 'task.resumed'
  | 'lock.acquired'
  | 'lock.released'
  | 'lock.failed'
  | 'lock.timeout'
  | 'worktree.created'
  | 'worktree.merged'
  | 'worktree.removed'
  | 'worktree.conflict'
  | 'terminal.started'
  | 'terminal.completed'
  | 'terminal.failed'
  | 'terminal.crashed'
  | 'conflict.detected'
  | 'error.occurred';

// 终端接口
export interface Terminal {
  id: string;
  subtaskId: string;
  cliName: string;
  command: string;
  status: 'starting' | 'running' | 'completed' | 'failed' | 'crashed';
  pid?: number;
  createdAt: Date;
  completedAt?: Date;
  output: string;
  error?: string;
}

// 共享上下文接口
export interface SharedContext {
  taskId: string;
  projectPath: string;
  taskDescription: string;
  constraints: string[];
  previousResults: Map<string, any>;
  dependencies: Dependency[];
  metadata: Record<string, any>;
}