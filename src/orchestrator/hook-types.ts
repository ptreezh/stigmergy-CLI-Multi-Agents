/**
 * Hook System Types
 * 钩子系统类型定义
 */

export type HookPhase = 'before' | 'after' | 'error';
export type HookContext = Record<string, any>;

export interface Hook<T = any> {
  id: string;
  name: string;
  phase: HookPhase;
  handler: (context: HookContext, data?: T) => Promise<void> | void;
  priority: number;
  enabled: boolean;
}

export interface HookExecutionResult {
  hookId: string;
  hookName: string;
  success: boolean;
  error?: Error;
  duration: number;
}

export interface HookSystemOptions {
  enableExecutionHistory?: boolean;
  maxHistorySize?: number;
}

export interface HookSystemStatistics {
  totalHooks: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  hooksByPhase: Record<HookPhase, number>;
  executionsByHook: Record<string, number>;
}