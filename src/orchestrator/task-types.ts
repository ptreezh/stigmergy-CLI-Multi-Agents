/**
 * Task Manager Types
 * 任务管理器类型定义
 */

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskType = 'analysis' | 'development' | 'testing' | 'documentation' | 'deployment' | 'custom';

export interface TaskResult {
  success: boolean;
  message: string;
  data?: any;
  error?: Error;
}

export interface TaskContext {
  projectPath: string;
  workingDirectory: string;
  environment: Record<string, string>;
  sharedData: Record<string, any>;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string | null;
  dependencies: string[];
  context: TaskContext;
  instructions: string;
  inputFiles: string[];
  outputFiles: string[];
  canDispatch: boolean;
  dispatchTargets: string[];
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  retryCount: number;
  maxRetries: number;
  result?: TaskResult;
}

export interface TaskFilters {
  status?: TaskStatus;
  assignedTo?: string;
  priority?: TaskPriority;
  type?: TaskType;
}

export interface TaskStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byCLI: Record<string, number>;
}